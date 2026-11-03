// Lapisan data Keuangan Sekolah (migrasi 0026) — dirancang RINGAN:
// - Daftar & overview membaca view agregat keuangan_rekap (maks 4 baris per
//   siswa), bukan memindai seluruh riwayat pembayaran.
// - Siswa dibaca dari tabel students dengan kolom seperlunya saja.
// - Semua himpunan kecil (paket, penetapan, rekap, cut-off, keterangan)
//   dimuat SEKALI per grade lalu disimpan di state bersama; pindah tab /
//   buka-tutup halaman tidak mengunduh ulang. Riwayat global & rincian
//   per siswa dimuat terpaginasi / per NIS saat dibutuhkan saja.
// - Selama migrasi 0026 belum dijalankan, halaman masuk mode contoh lokal
//   (data keuanganCore) dengan banner penanda — pola yang sama seperti
//   Tiketing sebelum migrasi 0025 dijalankan.
import { computed, ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  BAYAR_CONTOH, CUTOFF_CONTOH, KETERANGAN_AWAL, PAKET_CONTOH, PENETAPAN_CONTOH, SISWA_CONTOH,
  formatTanggal, hitungSiswa, selisihHari, statusDari,
  type BarisSiswa, type Cutoff, type Grade, type PaketKeuangan, type Pembayaran,
  type PenetapanSiswa, type RekapBayar, type SiswaInduk
} from './keuanganCore'

interface KeadaanKeuangan {
  keadaan: 'siap' | 'belum-migrasi' | 'galat'
  memuat: boolean
  termuatGrade: Grade | null
  paket: PaketKeuangan[]
  keterangan: string[]
  siswaInduk: SiswaInduk[]
  penetapan: PenetapanSiswa[]
  rekap: RekapBayar[]
  cutoffs: Cutoff[]
  bayarLokal: Pembayaran[]
  urutKwitansiLokal: number
}

const buatAwal = (): KeadaanKeuangan => ({
  keadaan: 'siap', memuat: false, termuatGrade: null,
  paket: [], keterangan: [...KETERANGAN_AWAL], siswaInduk: [], penetapan: [], rekap: [], cutoffs: [],
  bayarLokal: [], urutKwitansiLokal: 100
})

export const useKeuangan = () => {
  const client = useSupabaseClient() as unknown as SupabaseClient
  const { catat } = useLogAktivitas()
  const state = useState<KeadaanKeuangan>('keuangan', buatAwal)
  const pesanGalat = ref('')

  const lokal = computed(() => state.value.keadaan === 'belum-migrasi')

  const tanganiGalat = (error: any): boolean => {
    const pesan = String(error?.message || error || '')
    if (error?.code === '42P01' || error?.code === 'PGRST205' || /does not exist|schema cache|Could not find the table/i.test(pesan)) {
      masukModeLokal()
      return true
    }
    pesanGalat.value = pesan
    return false
  }

  const masukModeLokal = () => {
    if (state.value.keadaan === 'belum-migrasi') return
    state.value.keadaan = 'belum-migrasi'
    state.value.paket = structuredClone(PAKET_CONTOH)
    state.value.keterangan = [...KETERANGAN_AWAL]
    state.value.siswaInduk = structuredClone(SISWA_CONTOH)
    state.value.penetapan = structuredClone(PENETAPAN_CONTOH)
    state.value.bayarLokal = structuredClone(BAYAR_CONTOH)
    state.value.cutoffs = structuredClone(CUTOFF_CONTOH)
    state.value.rekap = agregatLokal(state.value.bayarLokal)
  }

  const agregatLokal = (rows: Pembayaran[]): RekapBayar[] => {
    const peta = new Map<string, RekapBayar>()
    for (const b of rows) {
      const kunci = b.grade + '|' + b.nis + '|' + b.tingkat
      const r = peta.get(kunci) || { nis: b.nis, tingkat: b.tingkat, dibayar: 0 }
      r.dibayar += b.nominal
      peta.set(kunci, r)
    }
    return [...peta.values()]
  }

  // Muat himpunan kecil satu grade (7 query kecil paralel, sekali saja).
  const muatSemua = async (grade: Grade, paksa = false) => {
    if (state.value.memuat) return
    if (!paksa && state.value.termuatGrade === grade && state.value.keadaan !== 'galat') return
    if (lokal.value) { state.value.termuatGrade = grade; return }
    state.value.memuat = true
    try {
      const [siswaRes, kelasRes, paketRes, tetapRes, rekapRes, cutoffRes, ketRes] = await Promise.all([
        client.from('students').select('nis, nisn, name, class_id, entry_year, student_status, father_phone, mother_phone, phone').eq('grade', grade).eq('active', true).order('name'),
        client.from('classes').select('id, name').eq('grade', grade).eq('active', true),
        client.from('keuangan_paket').select('*').eq('grade', grade).order('kode'),
        client.from('keuangan_siswa').select('*').eq('grade', grade),
        client.from('keuangan_rekap').select('*').eq('grade', grade),
        client.from('keuangan_cutoff').select('*').eq('grade', grade).order('created_at', { ascending: false }).limit(24),
        client.from('keuangan_keterangan').select('nama').order('urutan')
      ])
      for (const r of [paketRes, tetapRes, rekapRes, cutoffRes, ketRes]) if (r.error) throw r.error
      if (siswaRes.error) throw siswaRes.error
      const namaKelas = new Map<string, string>((kelasRes.data || []).map((k: any) => [k.id, k.name]))
      state.value.siswaInduk = (siswaRes.data || []).filter((s: any) => s.nis).map((s: any) => ({
        nis: s.nis, nisn: s.nisn || '', nama: s.name, grade,
        kelas: namaKelas.get(s.class_id) || 'Tanpa Kelas',
        angkatan: s.entry_year || 0, status: s.student_status || 'Aktif',
        hpWali: s.father_phone || s.mother_phone || s.phone || ''
      }))
      state.value.paket = (paketRes.data || []).map((p: any) => ({
        kode: p.kode, nama: p.nama, grade: p.grade,
        nominal: [p.nominal_1, p.nominal_2, p.nominal_3, p.nominal_akhir], aktif: p.aktif
      }))
      state.value.penetapan = (tetapRes.data || []).map((p: any) => ({
        nis: p.nis, grade: p.grade, kode: p.kode,
        tambahan: [p.tambahan_1, p.tambahan_2, p.tambahan_3, p.tambahan_akhir]
      }))
      state.value.rekap = (rekapRes.data || []).map((r: any) => ({ nis: r.nis, tingkat: r.tingkat, dibayar: Number(r.dibayar) }))
      state.value.cutoffs = (cutoffRes.data || []).map(barisCutoff)
      const ket = (ketRes.data || []).map((k: any) => k.nama)
      if (ket.length) state.value.keterangan = ket
      state.value.keadaan = 'siap'
      state.value.termuatGrade = grade
    } catch (e) {
      if (!tanganiGalat(e)) state.value.keadaan = 'galat'
    } finally {
      state.value.memuat = false
    }
  }

  const barisCutoff = (c: any): Cutoff => ({
    id: c.id, kode: c.kode, grade: c.grade,
    dari: formatTanggal(c.dari), sampai: formatTanggal(c.sampai), dariISO: c.dari, sampaiISO: c.sampai,
    hari: selisihHari(c.dari, c.sampai), trx: c.trx, total: Number(c.total), oleh: c.oleh || '', bukti: !!c.bukti
  })

  const barisBayar = (b: any, kodeCutoff?: Map<string, string>): Pembayaran => ({
    id: b.id, no: b.no_kwitansi, nis: b.nis, grade: b.grade, tingkat: b.tingkat,
    nominal: Number(b.nominal), keterangan: b.keterangan, metode: b.metode, petugas: b.petugas || '',
    tanggal: formatTanggal(b.tanggal), tanggalISO: b.tanggal,
    cutoff: b.cutoff_id ? (kodeCutoff?.get(b.cutoff_id) || 'Cut-off') : null
  })

  // Gabungkan induk + penetapan + rekap menjadi baris siap tampil (murni lokal).
  const barisSiswa = (grade: Grade): BarisSiswa[] => {
    const petaPaket = new Map(state.value.paket.map(p => [p.kode, p]))
    const petaTetap = new Map(state.value.penetapan.filter(p => p.grade === grade).map(p => [p.nis, p]))
    return state.value.siswaInduk.filter(s => s.grade === grade).map(s => {
      const tetap = petaTetap.get(s.nis)
      const paket = tetap ? petaPaket.get(tetap.kode) : undefined
      const hitung = hitungSiswa(paket, tetap?.tambahan || [0, 0, 0, 0], state.value.rekap.filter(r => r.nis === s.nis))
      return { ...s, kode: tetap?.kode || '', tambahan: tetap?.tambahan || [0, 0, 0, 0], hitung, statusBayar: statusDari(hitung) }
    })
  }

  const siswaSatu = (grade: Grade, nis: string): BarisSiswa | undefined => barisSiswa(grade).find(s => s.nis === nis)

  // Riwayat global: terpaginasi di server (maks 100 baris per muat).
  const muatRiwayat = async (grade: Grade, f: { cari?: string, metode?: string, dari?: number, jumlah?: number, dariISO?: string, sampaiISO?: string }): Promise<{ rows: Pembayaran[], total: number }> => {
    if (lokal.value) {
      let rows = state.value.bayarLokal.filter(b => b.grade === grade).slice().reverse()
      if (f.dariISO) rows = rows.filter(b => b.tanggalISO >= f.dariISO!)
      if (f.sampaiISO) rows = rows.filter(b => b.tanggalISO <= f.sampaiISO!)
      if (f.metode) rows = rows.filter(b => b.metode === f.metode)
      if (f.cari) {
        const q = f.cari.toLowerCase()
        const nama = new Map(state.value.siswaInduk.map(s => [s.nis, s]))
        rows = rows.filter(b => b.no.toLowerCase().includes(q) || b.nis.includes(q) || (nama.get(b.nis)?.nama || '').toLowerCase().includes(q) || (nama.get(b.nis)?.kelas || '').toLowerCase().includes(q))
      }
      return { rows, total: rows.length }
    }
    let q = client.from('keuangan_pembayaran').select('*, keuangan_cutoff(kode)', { count: 'exact' })
      .eq('grade', grade).order('tanggal', { ascending: false }).order('created_at', { ascending: false })
      .range(f.dari || 0, (f.dari || 0) + (f.jumlah || 100) - 1)
    if (f.metode) q = q.eq('metode', f.metode)
    if (f.dariISO) q = q.gte('tanggal', f.dariISO)
    if (f.sampaiISO) q = q.lte('tanggal', f.sampaiISO)
    if (f.cari) q = q.or(`no_kwitansi.ilike.%${f.cari}%,nis.ilike.%${f.cari}%`)
    const { data, error, count } = await q
    if (error) { tanganiGalat(error); return { rows: [], total: 0 } }
    const rows = (data || []).map((b: any) => ({ ...barisBayar(b), cutoff: b.cutoff_id ? (b.keuangan_cutoff?.kode || 'Cut-off') : null }))
    return { rows, total: count || rows.length }
  }

  // Rincian pembayaran satu siswa (query terindeks per NIS).
  const muatBayarSiswa = async (grade: Grade, nis: string): Promise<Pembayaran[]> => {
    if (lokal.value) return state.value.bayarLokal.filter(b => b.nis === nis && b.grade === grade).slice().reverse()
    const { data, error } = await client.from('keuangan_pembayaran').select('*, keuangan_cutoff(kode)')
      .eq('grade', grade).eq('nis', nis).order('tanggal', { ascending: false }).order('created_at', { ascending: false })
    if (error) { tanganiGalat(error); return [] }
    return (data || []).map((b: any) => ({ ...barisBayar(b), cutoff: b.cutoff_id ? (b.keuangan_cutoff?.kode || 'Cut-off') : null }))
  }

  const tambahRekapLokal = (nis: string, tingkat: number, nominal: number) => {
    const r = state.value.rekap.find(x => x.nis === nis && x.tingkat === tingkat)
    if (r) r.dibayar += nominal
    else state.value.rekap.push({ nis, tingkat, dibayar: nominal })
  }

  const simpanBayar = async (input: { grade: Grade, nis: string, tingkat: number, nominal: number, keterangan: string, metode: Pembayaran['metode'], petugas: string, tanggalISO: string }): Promise<Pembayaran> => {
    if (lokal.value) {
      const no = 'KEU-' + input.tanggalISO.slice(0, 4) + '-' + String(++state.value.urutKwitansiLokal).padStart(4, '0')
      const b: Pembayaran = { no, nis: input.nis, grade: input.grade, tingkat: input.tingkat, nominal: input.nominal, keterangan: input.keterangan, metode: input.metode, petugas: input.petugas, tanggal: formatTanggal(input.tanggalISO), tanggalISO: input.tanggalISO, cutoff: null }
      state.value.bayarLokal.push(b)
      tambahRekapLokal(b.nis, b.tingkat, b.nominal)
      return b
    }
    const { data, error } = await client.from('keuangan_pembayaran').insert({
      grade: input.grade, nis: input.nis, tingkat: input.tingkat, nominal: input.nominal,
      keterangan: input.keterangan, metode: input.metode, petugas: input.petugas, tanggal: input.tanggalISO
    }).select('*').single()
    if (error || !data) { tanganiGalat(error); throw error || new Error('Pembayaran gagal disimpan') }
    tambahRekapLokal(data.nis, data.tingkat, Number(data.nominal))
    catat('Keuangan', 'Input pembayaran', `${data.no_kwitansi} - NIS ${data.nis}`)
    return barisBayar(data)
  }

  const hapusBayar = async (b: Pembayaran) => {
    if (b.cutoff) throw new Error('Transaksi sudah cut-off dan terkunci')
    if (lokal.value) {
      state.value.bayarLokal = state.value.bayarLokal.filter(x => x.no !== b.no)
      state.value.rekap = agregatLokal(state.value.bayarLokal)
      return
    }
    const { error } = await client.from('keuangan_pembayaran').delete().eq('id', b.id)
    if (error) { tanganiGalat(error); throw error }
    const r = state.value.rekap.find(x => x.nis === b.nis && x.tingkat === b.tingkat)
    if (r) r.dibayar -= b.nominal
    catat('Keuangan', 'Hapus pembayaran', b.no)
  }

  const simpanPenetapan = async (grade: Grade, nis: string, kode: string, tambahan: [number, number, number, number]) => {
    const ada = state.value.penetapan.find(p => p.grade === grade && p.nis === nis)
    if (ada) { ada.kode = kode; ada.tambahan = [...tambahan] }
    else state.value.penetapan.push({ grade, nis, kode, tambahan: [...tambahan] })
    if (lokal.value) return
    const { error } = await client.from('keuangan_siswa').upsert({
      grade, nis, kode, tambahan_1: tambahan[0], tambahan_2: tambahan[1], tambahan_3: tambahan[2], tambahan_akhir: tambahan[3],
      updated_at: new Date().toISOString()
    })
    if (error) { tanganiGalat(error); throw error }
    catat('Keuangan', 'Pasang kode keuangan', `NIS ${nis} -> ${kode}`)
  }

  const simpanPaket = async (p: PaketKeuangan, kodeLama?: string) => {
    const idx = state.value.paket.findIndex(x => x.kode === (kodeLama || p.kode))
    if (idx >= 0) state.value.paket[idx] = { ...p }
    else state.value.paket.push({ ...p })
    if (lokal.value) return
    const baris = { kode: p.kode, nama: p.nama, grade: p.grade, nominal_1: p.nominal[0], nominal_2: p.nominal[1], nominal_3: p.nominal[2], nominal_akhir: p.nominal[3], aktif: p.aktif, updated_at: new Date().toISOString() }
    const { error } = kodeLama && kodeLama !== p.kode
      ? await client.from('keuangan_paket').update(baris).eq('kode', kodeLama)
      : await client.from('keuangan_paket').upsert(baris)
    if (error) { tanganiGalat(error); throw error }
    catat('Keuangan', kodeLama ? 'Ubah kode keuangan' : 'Tambah kode keuangan', p.kode)
  }

  const hapusPaket = async (kode: string) => {
    const dipakai = state.value.penetapan.some(p => p.kode === kode)
    const p = state.value.paket.find(x => x.kode === kode)
    if (!p) return
    if (dipakai) { // paket terpakai tidak dihapus — dinonaktifkan agar riwayat tetap terbaca
      p.aktif = false
      if (!lokal.value) await client.from('keuangan_paket').update({ aktif: false }).eq('kode', kode)
      return 'nonaktif'
    }
    state.value.paket = state.value.paket.filter(x => x.kode !== kode)
    if (!lokal.value) {
      const { error } = await client.from('keuangan_paket').delete().eq('kode', kode)
      if (error) { tanganiGalat(error); throw error }
    }
    return 'hapus'
  }

  const tambahKeterangan = async (nama: string) => {
    if (state.value.keterangan.includes(nama)) return
    state.value.keterangan.push(nama)
    if (lokal.value) return
    const { error } = await client.from('keuangan_keterangan').insert({ nama, urutan: state.value.keterangan.length })
    if (error) tanganiGalat(error)
  }

  const hapusKeterangan = async (nama: string) => {
    state.value.keterangan = state.value.keterangan.filter(k => k !== nama)
    if (lokal.value) return
    const { error } = await client.from('keuangan_keterangan').delete().eq('nama', nama)
    if (error) tanganiGalat(error)
  }

  const buatCutoff = async (grade: Grade, dariISO: string, sampaiISO: string, oleh: string): Promise<Cutoff> => {
    if (lokal.value) {
      const rows = state.value.bayarLokal.filter(b => b.grade === grade && !b.cutoff && b.tanggalISO >= dariISO && b.tanggalISO <= sampaiISO)
      if (!rows.length) throw new Error('Tidak ada transaksi terbuka dalam rentang ini')
      const kode = 'CUT-' + sampaiISO.slice(0, 4) + '-' + String(state.value.cutoffs.length + 1).padStart(3, '0')
      const c: Cutoff = { kode, grade, dari: formatTanggal(dariISO), sampai: formatTanggal(sampaiISO), dariISO, sampaiISO, hari: selisihHari(dariISO, sampaiISO), trx: rows.length, total: rows.reduce((a, b) => a + b.nominal, 0), oleh, bukti: false }
      rows.forEach(b => { b.cutoff = c.dari + ' – ' + c.sampai })
      state.value.cutoffs.unshift(c)
      return c
    }
    const { data, error } = await client.rpc('keuangan_buat_cutoff', { p_grade: grade, p_dari: dariISO, p_sampai: sampaiISO, p_oleh: oleh })
    if (error || !data) { tanganiGalat(error); throw error || new Error('Cut-off gagal dibuat') }
    const c = barisCutoff(data)
    state.value.cutoffs.unshift(c)
    catat('Keuangan', 'Buat cut-off', `${c.kode} - ${c.trx} transaksi`)
    return c
  }

  const unggahBuktiCutoff = async (c: Cutoff) => {
    const target = state.value.cutoffs.find(x => x.kode === c.kode)
    if (target) target.bukti = true
    if (lokal.value || !c.id) return
    const { error } = await client.from('keuangan_cutoff').update({ bukti: true }).eq('id', c.id)
    if (error) tanganiGalat(error)
  }

  return {
    state, lokal, pesanGalat, muatSemua, barisSiswa, siswaSatu,
    muatRiwayat, muatBayarSiswa, simpanBayar, hapusBayar,
    simpanPenetapan, simpanPaket, hapusPaket,
    tambahKeterangan, hapusKeterangan, buatCutoff, unggahBuktiCutoff
  }
}
