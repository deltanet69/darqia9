// Modul Pembelajaran (Kepegawaian) — dokumen modul ajar / modul projek PjBL
// berstruktur A–H. Satu-satunya penulis tabel learning_modules (migrasi 0022).
// Alur: draf -> menunggu (dikumpulkan) -> disetujui (admin). Tanpa pengesahan
// kepala sekolah. Semua guru membaca semua modul; sunting hanya penulis;
// superadmin CRUD penuh; hapus selalu soft delete (deleted_at).

export type StatusModul = 'draf' | 'menunggu' | 'disetujui'
export type JenisModul = 'projek' | 'mapel'
export type PeranModul = 'superadmin' | 'admin_tu' | 'guru'

export interface KriteriaModul { aspek: string; sb: string; b: string; c: string; pb: string }
export interface LangkahModul { tahap: string; guru: string; siswa: string; jp: number }
export interface BobotModul { komponen: string; persen: number; instrumen: string }
export interface LampiranModul { jenis: string; judul: string; keterangan: string }

export interface IsiModul {
  cp: string; cpReferensi: string
  dimensi: string[]
  tujuan: string[]
  pemahamanBermakna: string
  pertanyaanPemantik: string[]
  targetPeserta: string
  model: string
  sarana: string
  produkDeskripsi: string
  kriteria: KriteriaModul[]
  mitra: string
  langkah: LangkahModul[]
  asesmen: { diagnostik: string; formatif: string; sumatif: string; profil: string }
  bobot: BobotModul[]
  diferensiasi: { remedial: string; pengayaan: string }
  refleksi: { guru: string; siswa: string }
  lampiran: LampiranModul[]
  glosarium: string
  daftarPustaka: string
}

export interface ModulPembelajaran {
  id: string
  jenjang: 'SMP' | 'SMK'
  jenis: JenisModul
  nomor: number | null
  judul: string
  penyusun: string
  authorTeacherId: string | null
  satuan: string
  mapel: string
  fase: string
  kelas: string
  alokasiJp: number | null
  jumlahPertemuan: number | null
  durasiMinggu: number | null
  status: StatusModul
  tahapBerjalan: number
  isi: IsiModul
  submittedAt: string | null
  approvedAt: string | null
  approvedBy: string | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}

export const DIMENSI_PROFIL_LULUSAN = [
  'Keimanan dan Ketakwaan kepada Tuhan YME', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas',
  'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'
]

export const TAHAP_PJBL = [
  'Penentuan pertanyaan mendasar', 'Mendesain perencanaan projek', 'Menyusun jadwal',
  'Memantau siswa dan progres projek', 'Menguji hasil', 'Evaluasi pengalaman'
]

export const LABEL_STATUS: Record<StatusModul, string> = {
  draf: 'DRAF', menunggu: 'MENUNGGU', disetujui: 'DISETUJUI'
}

export const isiBawaan = (): IsiModul => ({
  cp: '', cpReferensi: 'Kepkabskap 032/H/KR/2024',
  dimensi: [], tujuan: [], pemahamanBermakna: '', pertanyaanPemantik: [],
  targetPeserta: 'Reguler', model: 'Project-Based Learning (PjBL)', sarana: '',
  produkDeskripsi: '', kriteria: [], mitra: '',
  langkah: TAHAP_PJBL.map(tahap => ({ tahap, guru: '', siswa: '', jp: 0 })),
  asesmen: { diagnostik: '', formatif: '', sumatif: '', profil: '' },
  bobot: [
    { komponen: 'Produk projek', persen: 50, instrumen: 'Rubrik kriteria keberhasilan' },
    { komponen: 'Proses dan jurnal', persen: 25, instrumen: 'Checklist checkpoint dan jurnal' },
    { komponen: 'Dimensi Profil Lulusan', persen: 25, instrumen: 'Lembar observasi' }
  ],
  diferensiasi: { remedial: '', pengayaan: '' },
  refleksi: { guru: '', siswa: '' },
  lampiran: [], glosarium: '', daftarPustaka: ''
})

export const totalJpLangkah = (isi: IsiModul): number =>
  (isi.langkah || []).reduce((total, l) => total + (Number(l.jp) || 0), 0)

export const totalBobot = (isi: IsiModul): number =>
  (isi.bobot || []).reduce((total, b) => total + (Number(b.persen) || 0), 0)

// Bagi JP tiap tahap ke pertemuan-pertemuan (kapasitas merata, tahap boleh
// menyambung ke pertemuan berikutnya) — cermin peta pertemuan di dokumen.
export interface PetaPertemuan { ke: number; jp: number; tahapDari: number; tahapKe: number }
export const petaPertemuan = (isi: IsiModul, jumlahPertemuan: number): PetaPertemuan[] => {
  const total = totalJpLangkah(isi)
  const n = Math.max(1, jumlahPertemuan || 1)
  if (!total) return []
  const dasar = Math.floor(total / n)
  const sisa = total - dasar * n
  const kapasitas = Array.from({ length: n }, (_, i) => dasar + (i < sisa ? 1 : 0)).filter(k => k > 0)
  const peta: PetaPertemuan[] = []
  let tahapIdx = 0
  let sisaTahap = (isi.langkah[0]?.jp || 0)
  kapasitas.forEach((kap, i) => {
    let terisi = 0
    let dari = tahapIdx + 1
    let ke = dari
    while (terisi < kap && tahapIdx < isi.langkah.length) {
      const ambil = Math.min(sisaTahap, kap - terisi)
      terisi += ambil
      sisaTahap -= ambil
      ke = tahapIdx + 1
      if (sisaTahap <= 0) { tahapIdx++; sisaTahap = isi.langkah[tahapIdx]?.jp || 0 }
    }
    if (terisi > 0) peta.push({ ke: i + 1, jp: terisi, tahapDari: dari, tahapKe: ke })
  })
  return peta
}

export interface SaringModulOpsi { kata?: string; status?: string; penyusunId?: string; jenis?: string }
export const saringDaftarModul = (daftar: ModulPembelajaran[], opsi: SaringModulOpsi): ModulPembelajaran[] => {
  const kata = (opsi.kata || '').toLowerCase().trim()
  return daftar.filter(m => {
    if (opsi.status && m.status !== opsi.status) return false
    if (opsi.jenis && m.jenis !== opsi.jenis) return false
    if (opsi.penyusunId && m.authorTeacherId !== opsi.penyusunId) return false
    if (kata) {
      const jerami = `${m.judul} ${m.penyusun} ${m.mapel} ${m.fase} ${m.kelas}`.toLowerCase()
      if (!jerami.includes(kata)) return false
    }
    return true
  })
}

// Aturan akses (keputusan user): superadmin penuh; admin boleh menyetujui;
// sunting hanya penulis (atau superadmin); guru lain baca saja.
export const bolehSunting = (m: ModulPembelajaran, peran: PeranModul, guruId: string): boolean => {
  if (m.deletedAt) return false
  if (peran === 'superadmin') return true
  return !!guruId && m.authorTeacherId === guruId
}
export const bolehSetujui = (peran: PeranModul): boolean => peran === 'superadmin' || peran === 'admin_tu'
export const bolehArsip = (m: ModulPembelajaran, peran: PeranModul, guruId: string): boolean => {
  if (m.deletedAt) return false
  if (peran === 'superadmin') return true
  return !!guruId && m.authorTeacherId === guruId
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export const ringkasTanggal = (iso: string | null): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

// Pemetaan baris DB <-> objek modul (isi jsonb dilengkapi bawaan agar aman).
export const modulDariBaris = (b: Record<string, any>): ModulPembelajaran => {
  const dasar = isiBawaan()
  const isiMentah = (b.isi || {}) as Partial<IsiModul>
  const isi: IsiModul = {
    ...dasar, ...isiMentah,
    dimensi: Array.isArray(isiMentah.dimensi) ? isiMentah.dimensi : [],
    tujuan: Array.isArray(isiMentah.tujuan) ? isiMentah.tujuan : [],
    pertanyaanPemantik: Array.isArray(isiMentah.pertanyaanPemantik) ? isiMentah.pertanyaanPemantik : [],
    kriteria: Array.isArray(isiMentah.kriteria) ? isiMentah.kriteria : [],
    langkah: Array.isArray(isiMentah.langkah) && isiMentah.langkah.length ? isiMentah.langkah : dasar.langkah,
    bobot: Array.isArray(isiMentah.bobot) && isiMentah.bobot.length ? isiMentah.bobot : dasar.bobot,
    lampiran: Array.isArray(isiMentah.lampiran) ? isiMentah.lampiran : [],
    asesmen: { ...dasar.asesmen, ...(isiMentah.asesmen || {}) },
    diferensiasi: { ...dasar.diferensiasi, ...(isiMentah.diferensiasi || {}) },
    refleksi: { ...dasar.refleksi, ...(isiMentah.refleksi || {}) }
  }
  return {
    id: b.id, jenjang: b.jenjang, jenis: b.jenis || 'projek',
    nomor: b.nomor ?? null, judul: b.judul || '', penyusun: b.penyusun || '',
    authorTeacherId: b.author_teacher_id ?? null, satuan: b.satuan || '', mapel: b.mapel || '',
    fase: b.fase || '', kelas: b.kelas || '',
    alokasiJp: b.alokasi_jp ?? null, jumlahPertemuan: b.jumlah_pertemuan ?? null, durasiMinggu: b.durasi_minggu ?? null,
    status: (b.status || 'draf') as StatusModul, tahapBerjalan: b.tahap_berjalan || 0, isi,
    submittedAt: b.submitted_at ?? null, approvedAt: b.approved_at ?? null, approvedBy: b.approved_by ?? null,
    createdAt: b.created_at ?? null, updatedAt: b.updated_at ?? null, deletedAt: b.deleted_at ?? null
  }
}

// Hasil AI dirapikan ke bentuk IsiModul: kolom yang hilang/salah tipe diisi bawaan, dimensi hanya dari daftar resmi (maks 3),
// dan langkah selalu 6 tahap PjBL berurutan.
export const isiDariAi = (mentah: unknown): IsiModul => {
  const isi = modulDariBaris({ isi: mentah && typeof mentah === 'object' ? mentah : {} }).isi
  const teks = (v: unknown) => typeof v === 'string' ? v : ''
  isi.dimensi = isi.dimensi.filter(d => DIMENSI_PROFIL_LULUSAN.includes(d)).slice(0, 3)
  isi.tujuan = isi.tujuan.map(teks).filter(Boolean)
  isi.pertanyaanPemantik = isi.pertanyaanPemantik.map(teks).filter(Boolean)
  isi.langkah = TAHAP_PJBL.map((tahap, i) => {
    const l: any = isi.langkah[i] || {}
    return { tahap, guru: teks(l.guru), siswa: teks(l.siswa), jp: Math.max(0, Math.round(Number(l.jp) || 0)) }
  })
  isi.cpReferensi = isiBawaan().cpReferensi
  return isi
}

export const barisDariModul =(m: ModulPembelajaran): Record<string, any> => ({
  jenjang: m.jenjang, jenis: m.jenis, nomor: m.nomor, judul: m.judul, penyusun: m.penyusun,
  author_teacher_id: m.authorTeacherId, satuan: m.satuan, mapel: m.mapel, fase: m.fase, kelas: m.kelas,
  alokasi_jp: m.alokasiJp, jumlah_pertemuan: m.jumlahPertemuan, durasi_minggu: m.durasiMinggu,
  status: m.status, tahap_berjalan: m.tahapBerjalan, isi: m.isi,
  submitted_at: m.submittedAt, approved_at: m.approvedAt, approved_by: m.approvedBy,
  deleted_at: m.deletedAt, updated_at: new Date().toISOString()
})

const teksAman = (s: string): string => String(s ?? '').replace(/</g, '&lt;')

// HTML mandiri untuk Unduh PDF (dibuka di tab baru lalu dicetak guru).
export const buatHtmlCetak = (m: ModulPembelajaran): string => {
  const barisKriteria = m.isi.kriteria.map(k => `<tr><td><b>${teksAman(k.aspek)}</b></td><td>${teksAman(k.sb)}</td><td>${teksAman(k.b)}</td><td>${teksAman(k.c)}</td><td>${teksAman(k.pb)}</td></tr>`).join('')
  const barisLangkah = m.isi.langkah.map((l, i) => `<tr><td>${i + 1}. ${teksAman(l.tahap)}</td><td>${teksAman(l.guru)}</td><td>${teksAman(l.siswa)}</td><td>${l.jp || 0} JP</td></tr>`).join('')
  const barisBobot = m.isi.bobot.map(b => `<tr><td>${teksAman(b.komponen)}</td><td>${b.persen}%</td><td>${teksAman(b.instrumen)}</td></tr>`).join('')
  const daftar = (arr: string[]) => arr.filter(Boolean).map((t, i) => `<div>${i + 1}. ${teksAman(t)}</div>`).join('')
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>${teksAman(m.judul)}</title>
<style>body{font-family:Georgia,serif;color:#111;max-width:760px;margin:32px auto;padding:0 20px;line-height:1.55}h1{font-size:22px}h2{font-size:15px;margin-top:22px;border-bottom:1px solid #999;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:12.5px}td,th{border:1px solid #999;padding:5px 7px;text-align:left;vertical-align:top}.meta{color:#444;font-size:13px}</style></head><body>
<p class="meta">MODUL ${m.jenis === 'projek' ? 'AJAR PROJEK' : 'AJAR'} · ${teksAman(m.satuan)}</p>
<h1>${teksAman(m.judul)}</h1>
<h2>A. Identitas Modul</h2>
<p>Nama Penyusun: ${teksAman(m.penyusun)}<br>Satuan Pendidikan: ${teksAman(m.satuan)}<br>Mata Pelajaran: ${teksAman(m.mapel)}<br>Fase / Kelas: ${teksAman(m.fase)} / ${teksAman(m.kelas)}<br>Alokasi Waktu: ${m.alokasiJp ?? '—'} JP · ${m.jumlahPertemuan ?? '—'} pertemuan · ${m.durasiMinggu ?? '—'} minggu</p>
<h2>B. Komponen Inti</h2>
<p><b>Capaian Pembelajaran (${teksAman(m.isi.cpReferensi)}):</b> ${teksAman(m.isi.cp)}</p>
<p><b>Dimensi Profil Lulusan:</b> ${m.isi.dimensi.map(teksAman).join(', ')}</p>
<p><b>Tujuan Pembelajaran:</b></p>${daftar(m.isi.tujuan)}
<p><b>Pemahaman Bermakna:</b> ${teksAman(m.isi.pemahamanBermakna)}</p>
<p><b>Pertanyaan Pemantik:</b></p>${daftar(m.isi.pertanyaanPemantik)}
<p><b>Target Peserta Didik:</b> ${teksAman(m.isi.targetPeserta)}<br><b>Model Pembelajaran:</b> ${teksAman(m.isi.model)}<br><b>Sarana dan Prasarana:</b> ${teksAman(m.isi.sarana)}</p>
<h2>C. Produk Projek</h2>
<p><b>Produk akhir:</b> ${teksAman(m.isi.produkDeskripsi)}<br><b>Mitra / DU-DI:</b> ${teksAman(m.isi.mitra)}</p>
<table><tr><th>Aspek</th><th>Sangat Baik (4)</th><th>Baik (3)</th><th>Cukup (2)</th><th>Perlu Bimbingan (1)</th></tr>${barisKriteria}</table>
<h2>D. Langkah Kegiatan (Sintaks PjBL)</h2>
<table><tr><th>Tahap</th><th>Kegiatan Guru</th><th>Kegiatan Siswa</th><th>Waktu</th></tr>${barisLangkah}</table>
<h2>E. Asesmen</h2>
<p><b>Awal (diagnostik):</b> ${teksAman(m.isi.asesmen.diagnostik)}<br><b>Proses (formatif):</b> ${teksAman(m.isi.asesmen.formatif)}<br><b>Produk (sumatif):</b> ${teksAman(m.isi.asesmen.sumatif)}<br><b>Dimensi Profil Lulusan:</b> ${teksAman(m.isi.asesmen.profil)}</p>
<table><tr><th>Komponen</th><th>Bobot</th><th>Instrumen</th></tr>${barisBobot}</table>
<h2>F. Diferensiasi</h2>
<p><b>Remedial:</b> ${teksAman(m.isi.diferensiasi.remedial)}<br><b>Pengayaan:</b> ${teksAman(m.isi.diferensiasi.pengayaan)}</p>
<h2>G. Refleksi</h2>
<p><b>Guru:</b> ${teksAman(m.isi.refleksi.guru)}<br><b>Siswa:</b> ${teksAman(m.isi.refleksi.siswa)}</p>
<h2>H. Lampiran</h2>
<p>${m.isi.lampiran.map(l => `${teksAman(l.jenis)} — ${teksAman(l.judul)}`).join('<br>')}<br><b>Glosarium:</b> ${teksAman(m.isi.glosarium)}<br><b>Daftar pustaka:</b> ${teksAman(m.isi.daftarPustaka)}</p>
<p class="meta">Disusun oleh ${teksAman(m.penyusun)} · Disetujui oleh ${teksAman(m.approvedBy || '—')} (${ringkasTanggal(m.approvedAt)})</p>
</body></html>`
}

export const useModulPembelajaran = () => {
  const client = useSupabaseClient()
  const rbac = useRbac()
  const daftar = useState<ModulPembelajaran[]>('modul-daftar', () => [])
  const arsip = useState<ModulPembelajaran[]>('modul-arsip', () => [])
  const guruDaftar = useState<Array<{ id: string; name: string; grade: string }>>('modul-guru', () => [])
  const mapelDaftar = useState<string[]>('modul-mapel', () => [])
  // Id guru akun yang login (kosong bila akun belum tertaut data guru). Menentukan modul mana yang boleh disunting.
  const penulisAktifId = useState<string>('modul-penulis-aktif', () => '')
  const memuat = useState<boolean>('modul-memuat', () => false)
  const tabelSiap = useState<boolean>('modul-tabel-siap', () => true)
  const pesan = useState<string>('modul-pesan', () => '')

  const muat = async (jenjang: 'SMP' | 'SMK') => {
    memuat.value = true
    try {
      const [modulRes, guruRes, mapelRes] = await Promise.all([
        client.from('learning_modules').select('*').eq('jenjang', jenjang).is('deleted_at', null).order('created_at', { ascending: false }),
        client.from('teachers').select('id, name, grade').eq('active', true).eq('grade', jenjang).order('name'),
        client.from('subjects').select('name').eq('grade', jenjang).eq('active', true).order('name'),
        rbac.muat()
      ])
      if (modulRes.error) throw modulRes.error
      daftar.value = (modulRes.data || []).map(modulDariBaris)
      guruDaftar.value = (guruRes.data || []) as Array<{ id: string; name: string; grade: string }>
      mapelDaftar.value = [...new Set(((mapelRes.data || []) as Array<{ name: string }>).map(m => m.name))]
      penulisAktifId.value = rbac.tertautGuru.value ? rbac.state.value.subjekSaya || '' : ''
      tabelSiap.value = true
    } catch (e) {
      tabelSiap.value = false
      daftar.value = []
      pesan.value = 'Tabel learning_modules belum tersedia. Jalankan migrasi 0022 di Supabase SQL Editor.'
      console.error('[ModulPembelajaran] muat gagal', e)
    } finally {
      memuat.value = false
    }
  }

  const muatArsip = async (jenjang: 'SMP' | 'SMK') => {
    const { data, error } = await client.from('learning_modules').select('*').eq('jenjang', jenjang).not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    if (!error) arsip.value = (data || []).map(modulDariBaris)
  }

  const ambil = async (id: string): Promise<ModulPembelajaran | null> => {
    const ada = daftar.value.find(m => m.id === id) || arsip.value.find(m => m.id === id)
    if (ada) return ada
    const { data, error } = await client.from('learning_modules').select('*').eq('id', id).single()
    if (error || !data) return null
    return modulDariBaris(data)
  }

  const simpan = async (m: ModulPembelajaran): Promise<ModulPembelajaran | null> => {
    const baris = barisDariModul(m)
    if (m.id) {
      const { data, error } = await client.from('learning_modules').update(baris).eq('id', m.id).select('*').single()
      if (error) { pesan.value = `Gagal menyimpan: ${error.message}`; return null }
      useLogAktivitas().catat('Modul Pembelajaran', 'ubah modul', `Modul diubah: ${m.judul}`)
      return modulDariBaris(data)
    }
    const { data, error } = await client.from('learning_modules').insert(baris).select('*').single()
    if (error) { pesan.value = `Gagal menyimpan: ${error.message}`; return null }
    useLogAktivitas().catat('Modul Pembelajaran', 'buat modul', `Modul baru: ${m.judul}`)
    return modulDariBaris(data)
  }

  const ubahSebagian = async (id: string, sebagian: Record<string, any>): Promise<boolean> => {
    const { error } = await client.from('learning_modules').update({ ...sebagian, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { pesan.value = `Gagal memperbarui: ${error.message}`; return false }
    return true
  }

  const kumpulkan = async (m: ModulPembelajaran) => { const ok = await ubahSebagian(m.id, { status: 'menunggu', submitted_at: new Date().toISOString(), approved_at: null, approved_by: null }); if (ok) useLogAktivitas().catat('Modul Pembelajaran', 'kirim persetujuan', `Modul diajukan: ${m.judul}`); return ok }
  const setujui = async (m: ModulPembelajaran, namaAdmin: string) => { const ok = await ubahSebagian(m.id, { status: 'disetujui', approved_at: new Date().toISOString(), approved_by: namaAdmin }); if (ok) useLogAktivitas().catat('Modul Pembelajaran', 'setujui modul', `Modul disetujui: ${m.judul}`); return ok }
  const kembalikan = async (m: ModulPembelajaran) => { const ok = await ubahSebagian(m.id, { status: 'draf', submitted_at: null }); if (ok) useLogAktivitas().catat('Modul Pembelajaran', 'kembalikan modul', `Modul dikembalikan ke draf: ${m.judul}`); return ok }
  const arsipkan = async (m: ModulPembelajaran) => { const ok = await ubahSebagian(m.id, { deleted_at: new Date().toISOString() }); if (ok) useLogAktivitas().catat('Modul Pembelajaran', 'arsipkan modul', `Modul diarsipkan: ${m.judul}`); return ok }
  const pulihkan = async (m: ModulPembelajaran) => { const ok = await ubahSebagian(m.id, { deleted_at: null }); if (ok) useLogAktivitas().catat('Modul Pembelajaran', 'pulihkan modul', `Modul dipulihkan: ${m.judul}`); return ok }
  const aturTahap = async (m: ModulPembelajaran, tahap: number) => ubahSebagian(m.id, { tahap_berjalan: tahap })

  return { daftar, arsip, guruDaftar, mapelDaftar, penulisAktifId, memuat, tabelSiap, pesan, muat, muatArsip, ambil, simpan, kumpulkan, setujui, kembalikan, arsipkan, pulihkan, aturTahap }
}
