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
  formatTanggal, hitungSiswa, ringkasKeterangan, selisihHari, statusDari,
  type BarisSiswa, type Cutoff, type Grade, type ItemBayar, type PaketKeuangan, type Pembayaran,
  type PenetapanSiswa, type RekapBayar, type SiswaInduk
} from './keuanganCore'

// Release Tagihan (meeting 4 Nov 2026): tagihan satu tingkat dinyatakan
// resmi diterbitkan ke wali — nanti tampil sebagai notifikasi di Portal
// Orang Tua (portalnya belum dibangun; sekarang aksi + datanya dulu).
export interface RilisTagihan { nis: string, tingkat: number, pada: string, oleh: string }

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
  rilis: RilisTagihan[]
  bayarLokal: Pembayaran[]
  urutKwitansiLokal: number
}

const buatAwal = (): KeadaanKeuangan => ({
  keadaan: 'siap', memuat: false, termuatGrade: null,
  paket: [], keterangan: [...KETERANGAN_AWAL], siswaInduk: [], penetapan: [], rekap: [], cutoffs: [], rilis: [],
  bayarLokal: [], urutKwitansiLokal: 100
})

const KOL_PEMBAYARAN = 'id, no_kwitansi, grade, nis, tingkat, nominal, keterangan, metode, petugas, tanggal, cutoff_id'
const KOL_CUTOFF = 'id, kode, grade, dari, sampai, trx, total, oleh, bukti, jumlah_setor'

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
      const kunci = b.grade + '|' + b.nis
      const r = peta.get(kunci) || { nis: b.nis, dibayar: 0 }
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
      // Rilis tagihan ikut paralel, tetapi toleran: tabelnya baru ada setelah
      // migrasi 0030 — kegagalannya tidak boleh menjatuhkan seluruh halaman.
      const [siswaRes, kelasRes, paketRes, tetapRes, rekapRes, cutoffAwal, ketRes, rilisRes] = await Promise.all([
        client.from('students').select('nis, nisn, name, class_id, entry_year, student_status, father_phone, mother_phone, phone').eq('grade', grade).eq('active', true).order('name'),
        client.from('classes').select('id, name').eq('grade', grade).eq('active', true),
        client.from('keuangan_paket').select('kode, nama, grade, nominal_1, nominal_2, nominal_3, nominal_akhir, aktif').eq('grade', grade).order('kode'),
        client.from('keuangan_siswa').select('grade, nis, kode, tambahan_1, tambahan_2, tambahan_3, tambahan_akhir').eq('grade', grade),
        client.from('keuangan_rekap').select('nis, tingkat, dibayar').eq('grade', grade),
        client.from('keuangan_cutoff').select(KOL_CUTOFF).eq('grade', grade).order('created_at', { ascending: false }).limit(24),
        client.from('keuangan_keterangan').select('nama').order('urutan'),
        client.from('keuangan_rilis_tagihan').select('nis, tingkat, dirilis_pada, oleh').eq('grade', grade)
      ])
      // Pra-migrasi 0030 kolom jumlah_setor belum ada: ulangi tanpa kolom itu.
      const cutoffRes = cutoffAwal.error && /jumlah_setor/i.test(String(cutoffAwal.error.message || ''))
        ? await client.from('keuangan_cutoff').select(KOL_CUTOFF.replace(', jumlah_setor', '')).eq('grade', grade).order('created_at', { ascending: false }).limit(24)
        : cutoffAwal
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
      state.value.rilis = rilisRes.error ? [] : (rilisRes.data || []).map((r: any) => ({
        nis: r.nis, tingkat: r.tingkat, pada: r.dirilis_pada, oleh: r.oleh || ''
      }))
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
    hari: selisihHari(c.dari, c.sampai), trx: c.trx, total: Number(c.total), oleh: c.oleh || '', bukti: !!c.bukti,
    jumlahSetor: c.jumlah_setor === null || c.jumlah_setor === undefined ? null : Number(c.jumlah_setor)
  })

  // Muat rincian item keterangan untuk sekelompok pembayaran (satu query).
  // Toleran pra-migrasi 0030: tabel item belum ada -> item dibiarkan kosong,
  // header keterangan tetap terbaca dari kolom pembayaran.
  const muatItems = async (rows: Pembayaran[]) => {
    const ids = rows.map(r => r.id).filter(Boolean) as string[]
    if (!ids.length || lokal.value) return
    const { data, error } = await client.from('keuangan_pembayaran_item').select('pembayaran_id, keterangan, nominal').in('pembayaran_id', ids).order('urutan')
    if (error || !data) return
    const peta = new Map<string, ItemBayar[]>()
    for (const it of data) {
      const daftar = peta.get(it.pembayaran_id) || []
      daftar.push({ keterangan: it.keterangan, nominal: Number(it.nominal) })
      peta.set(it.pembayaran_id, daftar)
    }
    for (const r of rows) if (r.id && peta.has(r.id)) r.items = peta.get(r.id)
  }

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
    let q = client.from('keuangan_pembayaran').select(KOL_PEMBAYARAN + ', keuangan_cutoff(kode)', { count: 'exact' })
      .eq('grade', grade).order('tanggal', { ascending: false }).order('created_at', { ascending: false })
      .range(f.dari || 0, (f.dari || 0) + (f.jumlah || 100) - 1)
    if (f.metode) q = q.eq('metode', f.metode)
    if (f.dariISO) q = q.gte('tanggal', f.dariISO)
    if (f.sampaiISO) q = q.lte('tanggal', f.sampaiISO)
    if (f.cari) q = q.or(`no_kwitansi.ilike.%${f.cari}%,nis.ilike.%${f.cari}%`)
    const { data, error, count } = await q
    if (error) { tanganiGalat(error); return { rows: [], total: 0 } }
    const rows = (data || []).map((b: any) => ({ ...barisBayar(b), cutoff: b.cutoff_id ? (b.keuangan_cutoff?.kode || 'Cut-off') : null }))
    await muatItems(rows)
    return { rows, total: count || rows.length }
  }

  // Rincian pembayaran satu siswa (query terindeks per NIS).
  const muatBayarSiswa = async (grade: Grade, nis: string): Promise<Pembayaran[]> => {
    if (lokal.value) return state.value.bayarLokal.filter(b => b.nis === nis && b.grade === grade).slice().reverse()
    const { data, error } = await client.from('keuangan_pembayaran').select(KOL_PEMBAYARAN + ', keuangan_cutoff(kode)')
      .eq('grade', grade).eq('nis', nis).order('tanggal', { ascending: false }).order('created_at', { ascending: false })
    if (error) { tanganiGalat(error); return [] }
    const rows = (data || []).map((b: any) => ({ ...barisBayar(b), cutoff: b.cutoff_id ? (b.keuangan_cutoff?.kode || 'Cut-off') : null }))
    await muatItems(rows)
    return rows
  }

  const tambahRekapLokal = (nis: string, nominal: number) => {
    const cocok = state.value.rekap.filter(x => x.nis === nis)
    if (cocok.length === 1) cocok[0].dibayar += nominal
    else if (cocok.length > 1) { // baris view lama per tingkat: tuang ke baris pertama, nolkan sisanya (total tetap benar)
      cocok[0].dibayar += nominal
    } else state.value.rekap.push({ nis, dibayar: nominal })
  }

  // Simpan pembayaran model LIST: satu pembayaran, banyak item keterangan.
  // tingkat selalu null (waterfall) — pembayaran menempel ke siswa; alokasi
  // ke tingkat dihitung ulang oleh keuanganCore dari total riwayat.
  const simpanBayar = async (input: { grade: Grade, nis: string, nominal: number, items: ItemBayar[], metode: Pembayaran['metode'], petugas: string, tanggalISO: string }): Promise<Pembayaran> => {
    const items = input.items.filter(i => i.keterangan.trim() && i.nominal > 0)
    if (!items.length) throw new Error('Isi minimal satu keterangan pembayaran dengan nominal di atas 0.')
    const keterangan = ringkasKeterangan(items)
    // Keterangan yang diketik manual & belum ada di master didaftarkan
    // otomatis agar muncul sebagai pilihan combobox berikutnya.
    for (const it of items) if (!state.value.keterangan.includes(it.keterangan.trim())) void tambahKeterangan(it.keterangan.trim())
    if (lokal.value) {
      const no = 'KEU-' + input.tanggalISO.slice(0, 4) + '-' + String(++state.value.urutKwitansiLokal).padStart(4, '0')
      const b: Pembayaran = { no, nis: input.nis, grade: input.grade, tingkat: null, nominal: input.nominal, keterangan, items, metode: input.metode, petugas: input.petugas, tanggal: formatTanggal(input.tanggalISO), tanggalISO: input.tanggalISO, cutoff: null }
      state.value.bayarLokal.push(b)
      tambahRekapLokal(b.nis, b.nominal)
      return b
    }
    const sisip = (tingkat: number | null) => client.from('keuangan_pembayaran').insert({
      grade: input.grade, nis: input.nis, tingkat, nominal: input.nominal,
      keterangan, metode: input.metode, petugas: input.petugas, tanggal: input.tanggalISO
    }).select(KOL_PEMBAYARAN).single()
    let { data, error } = await sisip(null)
    if (error && /tingkat/i.test(String(error.message || ''))) {
      // Pra-migrasi 0030 kolom tingkat belum boleh null: pakai tingkat pertama
      // yang masih bersisa sebagai anotasi (alokasi angka tetap waterfall).
      const h = siswaSatu(input.grade, input.nis)?.hitung
      const t = h ? h.per.findIndex(p => p.sisa > 0) : -1
      ;({ data, error } = await sisip(t >= 0 ? t : 0))
    }
    if (error || !data) { tanganiGalat(error); throw error || new Error('Pembayaran gagal disimpan') }
    // Item keterangan: toleran pra-0030 (tabel belum ada -> header cukup).
    if (items.length) {
      const barisItem = items.map((it, i) => ({ pembayaran_id: data.id, keterangan: it.keterangan.trim(), nominal: it.nominal, urutan: i + 1 }))
      const { error: errItem } = await client.from('keuangan_pembayaran_item').insert(barisItem)
      if (errItem) console.warn('Item keterangan belum tersimpan (migrasi 0030?):', errItem.message)
    }
    tambahRekapLokal(data.nis, Number(data.nominal))
    catat('Keuangan', 'Input pembayaran', `${data.no_kwitansi} - NIS ${data.nis}`)
    return { ...barisBayar(data), items }
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
    const cocok = state.value.rekap.filter(x => x.nis === b.nis)
    if (cocok.length) cocok[0].dibayar -= b.nominal
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

  // Release Tagihan per (siswa, tingkat): menandai tagihan tingkat itu resmi
  // diterbitkan ke wali. Saldo waterfall siswa otomatis "menempel" ke
  // tagihan yang sudah dirilis ini dalam tampilan rincian.
  const rilisTagihan = async (grade: Grade, nis: string, tingkat: number, oleh: string): Promise<RilisTagihan> => {
    const r: RilisTagihan = { nis, tingkat, pada: new Date().toISOString(), oleh }
    if (lokal.value) {
      if (!state.value.rilis.some(x => x.nis === nis && x.tingkat === tingkat)) state.value.rilis.push(r)
      return r
    }
    const { error } = await client.from('keuangan_rilis_tagihan').upsert({ grade, nis, tingkat, oleh }, { onConflict: 'grade,nis,tingkat' })
    if (error) throw new Error('Release tagihan belum bisa: jalankan dulu migrasi 0030_keuangan_meeting.sql di Supabase SQL Editor.')
    if (!state.value.rilis.some(x => x.nis === nis && x.tingkat === tingkat)) state.value.rilis.push(r)
    catat('Keuangan', 'Release tagihan', `NIS ${nis} tingkat ${tingkat + 1}`)
    return r
  }

  const sudahDirilis = (nis: string, tingkat: number): RilisTagihan | undefined =>
    state.value.rilis.find(r => r.nis === nis && r.tingkat === tingkat)

  // Release cut-off (meeting 4 Nov 2026): HANYA uang TUNAI yang masuk
  // administrasi & diserahkan ke yayasan; Transfer/QRIS langsung ke rekening
  // dan tidak pernah dikunci cut-off. jumlahSetor = uang fisik yang
  // diserahkan petugas (bawaan: sama dengan total tunai dalam rentang).
  const buatCutoff = async (grade: Grade, dariISO: string, sampaiISO: string, oleh: string, jumlahSetor?: number): Promise<{ cutoff: Cutoff, modeLama: boolean }> => {
    if (lokal.value) {
      const rows = state.value.bayarLokal.filter(b => b.grade === grade && !b.cutoff && b.metode === 'Tunai' && b.tanggalISO >= dariISO && b.tanggalISO <= sampaiISO)
      if (!rows.length) throw new Error('Tidak ada transaksi TUNAI terbuka dalam rentang ini')
      const kode = 'CUT-' + sampaiISO.slice(0, 4) + '-' + String(state.value.cutoffs.length + 1).padStart(3, '0')
      const total = rows.reduce((a, b) => a + b.nominal, 0)
      const c: Cutoff = { kode, grade, dari: formatTanggal(dariISO), sampai: formatTanggal(sampaiISO), dariISO, sampaiISO, hari: selisihHari(dariISO, sampaiISO), trx: rows.length, total, oleh, bukti: false, jumlahSetor: jumlahSetor ?? total }
      rows.forEach(b => { b.cutoff = c.dari + ' – ' + c.sampai })
      state.value.cutoffs.unshift(c)
      return { cutoff: c, modeLama: false }
    }
    let modeLama = false
    let { data, error } = await client.rpc('keuangan_buat_cutoff', { p_grade: grade, p_dari: dariISO, p_sampai: sampaiISO, p_oleh: oleh, p_jumlah_setor: jumlahSetor ?? null })
    if (error) {
      // Pra-migrasi 0030 fungsi lamanya belum kenal jumlah setor & masih
      // memproses semua metode — tetap jalan sebagai jalan mundur.
      ;({ data, error } = await client.rpc('keuangan_buat_cutoff', { p_grade: grade, p_dari: dariISO, p_sampai: sampaiISO, p_oleh: oleh }))
      modeLama = !error
    }
    if (error || !data) { tanganiGalat(error); throw error || new Error('Cut-off gagal dibuat') }
    const c = barisCutoff(data)
    state.value.cutoffs.unshift(c)
    catat('Keuangan', 'Release cut-off', `${c.kode} - ${c.trx} transaksi tunai`)
    return { cutoff: c, modeLama }
  }

  const unggahBuktiCutoff = async (c: Cutoff) => {
    const target = state.value.cutoffs.find(x => x.kode === c.kode)
    if (target) target.bukti = true
    if (lokal.value || !c.id) return
    const { error } = await client.from('keuangan_cutoff').update({ bukti: true }).eq('id', c.id)
    if (error) tanganiGalat(error)
  }

  // Ubah catatan cut-off (penanggung jawab + status bukti serah + jumlah
  // setor). Rentang, jumlah transaksi, dan total TIDAK bisa diubah — angka
  // itu berasal dari transaksi yang terkunci di dalamnya.
  const ubahCutoff = async (c: Cutoff, oleh: string, bukti: boolean, jumlahSetor?: number | null) => {
    const target = state.value.cutoffs.find(x => x.kode === c.kode)
    if (target) { target.oleh = oleh; target.bukti = bukti; if (jumlahSetor !== undefined) target.jumlahSetor = jumlahSetor }
    if (lokal.value || !c.id) return
    let { error } = await client.from('keuangan_cutoff').update({ oleh, bukti, jumlah_setor: jumlahSetor ?? null }).eq('id', c.id)
    if (error && /jumlah_setor/i.test(String(error.message || ''))) {
      ;({ error } = await client.from('keuangan_cutoff').update({ oleh, bukti }).eq('id', c.id))
    }
    if (error) { tanganiGalat(error); throw error }
    catat('Keuangan', 'Ubah cut-off', c.kode)
  }

  // Hapus cut-off: seluruh transaksinya dibuka kembali (cutoff_id dikosongkan
  // oleh RPC migrasi 0027 yang menembus kunci secara resmi), lalu catatan
  // cut-off dihapus. Dana dianggap belum diserahkan lagi.
  const hapusCutoff = async (c: Cutoff) => {
    if (lokal.value) {
      const label = c.dari + ' – ' + c.sampai
      state.value.bayarLokal.forEach(b => { if (b.cutoff === label) b.cutoff = null })
      state.value.cutoffs = state.value.cutoffs.filter(x => x.kode !== c.kode)
      return
    }
    const { error } = await client.rpc('keuangan_hapus_cutoff', { p_id: c.id })
    // Sengaja TIDAK lewat tanganiGalat: fungsi RPC yang belum ada (migrasi
    // 0027 belum dijalankan) pesannya mengandung "schema cache" dan akan
    // keliru membalik halaman ke mode contoh lokal.
    if (error) throw new Error('Hapus cut-off belum bisa: jalankan dulu migrasi 0027_keuangan_cutoff_crud.sql di Supabase SQL Editor.')
    state.value.cutoffs = state.value.cutoffs.filter(x => x.kode !== c.kode)
    catat('Keuangan', 'Hapus cut-off', `${c.kode} - ${c.trx} transaksi dibuka kembali`)
  }

  return {
    state, lokal, pesanGalat, muatSemua, barisSiswa, siswaSatu,
    muatRiwayat, muatBayarSiswa, simpanBayar, hapusBayar,
    simpanPenetapan, simpanPaket, hapusPaket,
    tambahKeterangan, hapusKeterangan, buatCutoff, unggahBuktiCutoff, ubahCutoff, hapusCutoff,
    rilisTagihan, sudahDirilis
  }
}
