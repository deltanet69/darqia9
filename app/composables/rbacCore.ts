// Inti RBAC (Hak Akses) — konstanta, data awal, dan fungsi murni.
// Tanpa impor Nuxt/Vue agar bisa dites langsung (tests/rbac.mjs).
// Aturan user (1 Nov 2026):
// 1) Satu pengguna hanya memegang SATU peran — penugasan baru memindahkan peran lama.
// 2) Izin matriks ditegakkan: lihat/buat/ubah/hapus per modul sesuai peran.
// 3) Penugasan membawa cakupan jenjang (SMP/SMK, boleh keduanya).
// Update RBAC (13 Nov 2026, docs/Admin Portal/RBAC & Manajemen User/rbacupdate.md):
// 4) Izin per sub-modul (tab/sub-menu) disimpan sebagai baris 'Modul/sub' di rbac_permissions.
//    Baris modul utama = gabungan (OR) sub-modulnya, jadi penjaga rute, menu, dan rbac_can() lama tetap berlaku.
// 5) Cakupan data per modul: 'semua' atau 'sendiri' (kelas/mapel yang diampu) — hanya modul di RBAC_MODUL_CAKUPAN.

export type AksiRbac = 'lihat' | 'buat' | 'ubah' | 'hapus'
export type JenjangRbac = 'SMP' | 'SMK'

export interface PeranRbac { id: string; kunci: string; nama: string; deskripsi: string; terkunci: boolean; urutan: number }
export type IzinPeran = Record<string, Record<AksiRbac, boolean>>
export interface PenugasanRbac { subjekId: string; nama: string; peranId: string; jenjang: JenjangRbac[] }

export const RBAC_MODUL: string[] = [
  'Dashboard', 'Data Siswa', 'Absensi Siswa', 'Manajemen Kelas', 'Jadwal Pelajaran',
  'Master Mapel', 'Raport Siswa', 'Data Guru & Staff', 'Absensi Guru', 'Jadwal Mengajar',
  'Agenda Mengajar', 'Modul Pembelajaran', 'Keuangan Sekolah', 'Tabungan Siswa',
  'Manajemen CBT', 'LMS', 'Konten Website', 'SPMB', 'Perpustakaan Digital',
  'Manajemen User', 'Hak Akses (RBAC)', 'Log Aktivitas', 'Pengaturan', 'Tiketing'
]

export interface SubModulRbac { kunci: string; label: string }

// Sub-menu (tab) tiap modul AdminV2. Modul tanpa daftar di sini tidak punya sub-menu.
export const RBAC_SUBMODUL: Record<string, SubModulRbac[]> = {
  'Absensi Siswa': [
    { kunci: 'overview', label: 'Ringkasan' }, { kunci: 'monitoring', label: 'Monitoring RFID' },
    { kunci: 'rombel', label: 'Rekap per Kelas' }, { kunci: 'detail', label: 'Log Presensi Siswa' }
  ],
  'Manajemen Kelas': [
    { kunci: 'overview', label: 'Overview & Kapasitas' }, { kunci: 'daftar', label: 'Daftar Rombel Kelas' },
    { kunci: 'siswa', label: 'Detail Kelas · Data Siswa' }, { kunci: 'absensi', label: 'Detail Kelas · Absensi' },
    { kunci: 'jadwal', label: 'Detail Kelas · Jadwal Pelajaran' }, { kunci: 'nilai', label: 'Detail Kelas · Penilaian Siswa' },
    { kunci: 'ujian', label: 'Detail Kelas · Jadwal Ujian' }
  ],
  'Jadwal Pelajaran': [{ kunci: 'kelas', label: 'Per Kelas' }, { kunci: 'guru', label: 'Per Guru' }],
  'Absensi Guru': [
    { kunci: 'presensi', label: 'Presensi Harian' }, { kunci: 'kehadiran', label: 'Rekap Kehadiran' },
    { kunci: 'rekap', label: 'Rekap Mengajar' }
  ],
  'Jadwal Mengajar': [{ kunci: 'grade', label: 'Jadwal Mengajar Jenjang' }, { kunci: 'saya', label: 'Jadwal Saya' }],
  'Agenda Mengajar': [
    { kunci: 'pertemuan', label: 'Pertemuan' }, { kunci: 'tugas', label: 'Nilai Tugas' },
    { kunci: 'ujian', label: 'PTS & PAS' }, { kunci: 'rekap', label: 'Rekap' }
  ],
  'Keuangan Sekolah': [
    { kunci: 'overview', label: 'Overview' }, { kunci: 'data', label: 'Data Keuangan' },
    { kunci: 'kode', label: 'Kode Keuangan' }, { kunci: 'cutoff', label: 'Cut-off Harian' },
    { kunci: 'riwayat', label: 'Riwayat Pembayaran' }, { kunci: 'pembayaran', label: 'Input Pembayaran' }
  ],
  'Manajemen CBT': [
    { kunci: 'summary', label: 'Ringkasan' }, { kunci: 'monitoring', label: 'Monitoring Ujian' },
    { kunci: 'bank', label: 'Bank Soal' }, { kunci: 'exams', label: 'Daftar Ujian' },
    { kunci: 'rooms', label: 'Ruang Ujian' }, { kunci: 'cards', label: 'Kartu Ujian' },
    { kunci: 'results', label: 'Nilai Siswa' }, { kunci: 'management', label: 'Manajemen Ujian' }
  ],
  'LMS': [
    { kunci: 'summary', label: 'Ringkasan' }, { kunci: 'monitoring', label: 'Monitoring Ujian' },
    { kunci: 'bank', label: 'Bank Soal' }, { kunci: 'exams', label: 'Daftar Ujian' },
    { kunci: 'seb', label: 'Kode SEB' }, { kunci: 'cards', label: 'Kartu Ujian' },
    { kunci: 'results', label: 'Nilai Siswa' }, { kunci: 'management', label: 'Manajemen Ujian' }
  ],
  'Konten Website': [
    { kunci: 'berita', label: 'Berita & Artikel' }, { kunci: 'kategori', label: 'Kategori' },
    { kunci: 'banner', label: 'Popup Banner' }, { kunci: 'informasi', label: 'Berita & Informasi' }
  ]
}

export const kunciSub = (modul: string, sub: string) => `${modul}/${sub}`

// Semua baris izin: modul utama + tiap sub-modulnya.
export const RBAC_KUNCI: string[] = RBAC_MODUL.flatMap(m => [m, ...(RBAC_SUBMODUL[m] || []).map(s => kunciSub(m, s.kunci))])
// Baris yang dicentang di halaman RBAC: sub-modul, atau modul itu sendiri bila tanpa sub-menu.
export const RBAC_DAUN: string[] = RBAC_MODUL.flatMap(m => RBAC_SUBMODUL[m]?.length ? RBAC_SUBMODUL[m].map(s => kunciSub(m, s.kunci)) : [m])

export type CakupanRbac = 'semua' | 'sendiri'
export type CakupanPeran = Record<string, CakupanRbac>
// Modul yang cakupan datanya sudah ditegakkan di aplikasi ('sendiri' = kelas/mapel yang diampu menurut jadwal & wali kelas).
export const RBAC_MODUL_CAKUPAN: string[] = ['Manajemen CBT', 'LMS']

export const RBAC_AKSI: Array<{ kunci: AksiRbac; label: string }> = [
  { kunci: 'lihat', label: 'Lihat' },
  { kunci: 'buat', label: 'Buat' },
  { kunci: 'ubah', label: 'Ubah' },
  { kunci: 'hapus', label: 'Hapus' }
]

const AKSI_SEMUA: AksiRbac[] = ['lihat', 'buat', 'ubah', 'hapus']

export function izinKosong(): IzinPeran {
  const izin: IzinPeran = {}
  for (const kunci of RBAC_KUNCI) izin[kunci] = { lihat: false, buat: false, ubah: false, hapus: false }
  return izin
}

// Sub-modul yang belum punya baris tersimpan mewarisi izin modul utamanya (data sebelum update ini).
export function lengkapiSub(izin: IzinPeran, adaBaris: (kunci: string) => boolean = () => false): IzinPeran {
  for (const modul of RBAC_MODUL) {
    for (const s of RBAC_SUBMODUL[modul] || []) {
      const k = kunciSub(modul, s.kunci)
      if (!adaBaris(k)) izin[k] = { ...(izin[modul] || { lihat: false, buat: false, ubah: false, hapus: false }) }
    }
  }
  return izin
}

// Baris modul utama = OR dari sub-modulnya (dipakai menu, penjaga rute, dan rbac_can di database).
export function agregatModul(izin: IzinPeran): IzinPeran {
  for (const modul of RBAC_MODUL) {
    const subs = RBAC_SUBMODUL[modul]
    if (!subs?.length) continue
    izin[modul] = { lihat: false, buat: false, ubah: false, hapus: false }
    for (const aksi of AKSI_SEMUA) izin[modul][aksi] = subs.some(s => !!izin[kunciSub(modul, s.kunci)]?.[aksi])
  }
  return izin
}

// Batas bawaan = perilaku aplikasi sebelum update ini: kelola ujian CBT, ruang ujian, dan kartu ujian (CBT & LMS) hanya
// Superadmin. Peran terkunci (Superadmin) tidak terkena batas ini.
export const RBAC_BATAS_BAWAAN: Array<[string, AksiRbac[]]> = [
  ['Manajemen CBT/exams', ['buat', 'ubah', 'hapus']],
  ['Manajemen CBT/rooms', ['buat', 'ubah', 'hapus']],
  ['Manajemen CBT/cards', ['buat', 'ubah', 'hapus']],
  ['LMS/cards', ['buat', 'ubah', 'hapus']]
]
export function batasiBawaan(izin: IzinPeran): IzinPeran {
  for (const [kunci, aksi] of RBAC_BATAS_BAWAAN) for (const a of aksi) if (izin[kunci]) izin[kunci][a] = false
  return izin
}

// P: bangun izin dari daftar indeks modul per aksi (R=lihat, C=buat, U=ubah, D=hapus).
function P(spec: Partial<Record<'R' | 'C' | 'U' | 'D', number[]>>): IzinPeran {
  const izin = izinKosong()
  const peta: Record<string, AksiRbac> = { R: 'lihat', C: 'buat', U: 'ubah', D: 'hapus' }
  for (const [kode, daftar] of Object.entries(spec)) {
    for (const i of daftar || []) {
      const modul = RBAC_MODUL[i]
      if (modul) izin[modul][peta[kode]] = true
    }
  }
  for (const modul of RBAC_MODUL) {
    if (izin[modul].buat || izin[modul].ubah || izin[modul].hapus) izin[modul].lihat = true
  }
  return lengkapiSub(izin)
}
const terbatas = (izin: IzinPeran) => agregatModul(batasiBawaan(izin))

const SEMUA = RBAC_MODUL.map((_, i) => i)

export const RBAC_SEED_PERAN: PeranRbac[] = [
  { id: '11111111-1111-4111-8111-111111111111', kunci: 'superadmin', nama: 'Superadmin', deskripsi: 'Akses penuh ke semua modul — tidak bisa diubah.', terkunci: true, urutan: 0 },
  { id: '22222222-2222-4222-8222-222222222222', kunci: 'ketua_yayasan', nama: 'Ketua Yayasan', deskripsi: 'Pengurus yayasan — pengawasan menyeluruh, tanpa pengelolaan harian.', terkunci: false, urutan: 1 },
  { id: '33333333-3333-4333-8333-333333333333', kunci: 'kepala_sekolah', nama: 'Kepala Sekolah', deskripsi: 'Kepala sekolah — melihat semua data dan mengatur hal strategis.', terkunci: false, urutan: 2 },
  { id: '44444444-4444-4444-8444-444444444444', kunci: 'wakil_kepala_sekolah', nama: 'Wakil Kepala Sekolah', deskripsi: 'Wakil kepala sekolah — mendampingi kepsek di bidang akademik.', terkunci: false, urutan: 3 },
  { id: '55555555-5555-4555-8555-555555555555', kunci: 'operator', nama: 'Operator', deskripsi: 'Mengelola operasional harian hampir semua modul.', terkunci: false, urutan: 4 },
  { id: '66666666-6666-4666-8666-666666666666', kunci: 'staff_adm', nama: 'Staff Adm', deskripsi: 'Staff administrasi / TU — data siswa, kelas, dan tabungan.', terkunci: false, urutan: 5 },
  { id: '77777777-7777-4777-8777-777777777777', kunci: 'wali_kelas', nama: 'Wali Kelas', deskripsi: 'Wali kelas — hanya kelas yang diampu.', terkunci: false, urutan: 6 },
  { id: '88888888-8888-4888-8888-888888888888', kunci: 'guru_pengajar', nama: 'Guru Pengajar', deskripsi: 'Guru pengajar — jadwal, agenda, modul, dan CBT mapelnya.', terkunci: false, urutan: 7 },
  { id: '99999999-9999-4999-8999-999999999999', kunci: 'staff_sekolah', nama: 'Staff Sekolah', deskripsi: 'Staff non-guru — akses terbatas sesuai tugasnya.', terkunci: false, urutan: 8 }
]

// Izin bawaan per kunci peran — sama persis dengan preview RBAC v6 yang disetujui user.
// Z: izin dari daftar 'Modul[/sub]:AKSI' (L = lihat, C = buat, U = ubah, D = hapus).
// 'Modul' tanpa '/sub' berlaku untuk semua sub-menunya. Baris modul utama dihitung ulang (agregatModul).
function Z(...baris: string[]): IzinPeran {
  const izin = izinKosong()
  const peta: Record<string, AksiRbac> = { L: 'lihat', C: 'buat', U: 'ubah', D: 'hapus' }
  for (const b of baris) {
    const [kunci, aksi] = b.split(':') as [string, string]
    const subs = !kunci.includes('/') && RBAC_SUBMODUL[kunci]?.length ? RBAC_SUBMODUL[kunci].map(x => kunciSub(kunci, x.kunci)) : [kunci]
    for (const k of subs) {
      if (!izin[k]) throw new Error(`Kunci RBAC tidak dikenal: ${k}`)
      for (const c of aksi) izin[k]![peta[c]!] = true
      if (/[CUD]/.test(aksi)) izin[k]!.lihat = true
    }
  }
  return agregatModul(izin)
}

const AKADEMIK = ['Data Siswa', 'Absensi Siswa', 'Manajemen Kelas', 'Jadwal Pelajaran', 'Master Mapel', 'Raport Siswa']
const semuaLihat = () => RBAC_MODUL.map(m => `${m}:L`)

// Hak Guru Pengajar (brief aksesaplikasi.md, 13 Nov 2026). Pembatasan "hanya milik sendiri / yang diawasi"
// adalah cakupan data yang ditegakkan per modul secara bertahap. Kartu ujian sementara hanya Lihat sampai
// cakupan "ruang yang diawasi" ditegakkan, supaya guru tidak bisa mengganti token siswa ruang lain.
const GURU = [
  'Dashboard:L',
  'Absensi Siswa/overview:L', 'Manajemen Kelas:L', 'Jadwal Pelajaran:L', 'Master Mapel:L',
  'Absensi Guru:L', 'Jadwal Mengajar/grade:L', 'Jadwal Mengajar/saya:LU', 'Agenda Mengajar:LCUD', 'Modul Pembelajaran:LCUD',
  'Manajemen CBT/summary:L', 'Manajemen CBT/monitoring:L', 'Manajemen CBT/bank:LCUD', 'Manajemen CBT/exams:L',
  'Manajemen CBT/rooms:L', 'Manajemen CBT/cards:L',
  'LMS/summary:L', 'LMS/monitoring:L', 'LMS/bank:LCUD', 'LMS/exams:LCUD', 'LMS/seb:L', 'LMS/cards:L',
  'Tiketing:LC'
]
// Operator: kepegawaian sama seperti Guru Pengajar.
const KEPEGAWAIAN_GURU = ['Absensi Guru:L', 'Jadwal Mengajar/grade:L', 'Jadwal Mengajar/saya:LU', 'Agenda Mengajar:LCUD', 'Modul Pembelajaran:LCUD']

// Izin bawaan per kunci peran. Peran di brief aksesaplikasi.md mengikuti brief; Staff Sekolah (tidak ada di brief) tetap.
export const RBAC_SEED_IZIN: Record<string, IzinPeran> = {
  superadmin: P({ R: SEMUA, C: SEMUA, U: SEMUA, D: SEMUA }),
  // Yayasan, Kepsek, Wakasek: baca seluruh data (jadwal mengajar pribadi diatur lewat centang RBAC bila mengajar).
  ketua_yayasan: Z(...semuaLihat(), 'Tiketing:LC'),
  kepala_sekolah: Z(...semuaLihat(), 'Tiketing:LC'),
  wakil_kepala_sekolah: Z(...semuaLihat(), 'Tiketing:LC'),
  operator: Z('Dashboard:L', ...[...AKADEMIK, 'Manajemen CBT', 'LMS', 'Konten Website', 'SPMB', 'Perpustakaan Digital'].map(m => `${m}:LCUD`),
    ...KEPEGAWAIAN_GURU, 'Tiketing:LC'),
  staff_adm: Z('Dashboard:L', ...[...AKADEMIK, 'Keuangan Sekolah', 'Tabungan Siswa'].map(m => `${m}:LCUD`), 'Tiketing:LC'),
  // Wali Kelas = Guru Pengajar + kelola kelasnya, raport kelasnya, dan presensi siswa kelasnya secara rinci.
  wali_kelas: Z(...GURU, 'Manajemen Kelas:LU', 'Raport Siswa:LCUD', 'Absensi Siswa:L'),
  guru_pengajar: Z(...GURU),
  staff_sekolah: terbatas(P({ R: [0, 1, 4, 7, 8, 11, 16, 17, 18, 23], C: [16, 18, 23], U: [16, 18] }))
}

// Peran yang izin bawaannya diterapkan ulang oleh migrasi 0064 (sesuai brief aksesaplikasi.md).
// Peran pimpinan/pengelola selalu boleh berpindah jenjang sesuai penugasannya, walau tidak berjadwal (keputusan owner, 14 Nov 2026; Staff Adm termasuk).
export const PERAN_LINTAS_JENJANG = ['superadmin', 'ketua_yayasan', 'kepala_sekolah', 'wakil_kepala_sekolah', 'operator', 'staff_adm']
export const lintasJenjang = (peran: Pick<PeranRbac, 'kunci'> | null | undefined): boolean =>
  !!peran && PERAN_LINTAS_JENJANG.includes(peran.kunci)

// Jenjang akun: peran lain hanya boleh di jenjang tempat ia berjadwal (jadwal pelajaran/rombel yang diwalikan);
// pengalih jenjang muncul hanya bila berjadwal di SMP dan SMK. Tanpa jadwal = satu jenjang (jenjang data guru).
export function jenjangAkun(dasar: JenjangRbac[], lintas: boolean, jadwal: JenjangRbac[], jenjangGuru: JenjangRbac | null): JenjangRbac[] {
  if (lintas || !dasar.length) return dasar
  if (jadwal.length) {
    const irisan = dasar.filter(j => jadwal.includes(j))
    return irisan.length ? irisan : [...jadwal]
  }
  return [jenjangGuru && dasar.includes(jenjangGuru) ? jenjangGuru : dasar[0]!]
}

export const RBAC_PERAN_BRIEF = ['ketua_yayasan', 'kepala_sekolah', 'wakil_kepala_sekolah', 'operator', 'staff_adm', 'wali_kelas', 'guru_pengajar']

// Jumlah centang di halaman RBAC (sub-modul + modul tanpa sub-menu).
export function hitungIzinRinci(izin: IzinPeran): number {
  let total = 0
  for (const k of RBAC_DAUN) for (const aksi of AKSI_SEMUA) if (izin[k]?.[aksi]) total++
  return total
}

export function hitungIzin(izin: IzinPeran): number {
  let total = 0
  for (const modul of RBAC_MODUL) for (const aksi of AKSI_SEMUA) if (izin[modul]?.[aksi]) total++
  return total
}

// Aturan ketergantungan: buat/ubah/hapus menyalakan lihat; mematikan lihat membersihkan baris.
export function terapkanCentang(izin: IzinPeran, modul: string, aksi: AksiRbac, nilai: boolean): IzinPeran {
  const baru: IzinPeran = JSON.parse(JSON.stringify(izin))
  if (!baru[modul]) baru[modul] = { lihat: false, buat: false, ubah: false, hapus: false }
  if (aksi === 'lihat' && !nilai) {
    for (const a of AKSI_SEMUA) baru[modul][a] = false
  } else {
    baru[modul][aksi] = nilai
    if (nilai) baru[modul].lihat = true
  }
  return baru
}

export function kolomPenuh(izin: IzinPeran, aksi: AksiRbac): boolean {
  return RBAC_MODUL.every(modul => izin[modul]?.[aksi])
}

export function penugasanDari(daftar: PenugasanRbac[], subjekId: string): PenugasanRbac | null {
  return daftar.find(p => p.subjekId === subjekId) || null
}

export function dalamCakupan(penugasan: PenugasanRbac | null, jenjang: JenjangRbac): boolean {
  return !!penugasan && penugasan.jenjang.includes(jenjang)
}

// Peran terkunci (Superadmin) selalu boleh; selain itu sesuai matriks.
export function bisaAkses(peran: PeranRbac | null, izin: IzinPeran | null, modul: string, aksi: AksiRbac): boolean {
  if (!peran) return false
  if (peran.terkunci) return true
  return !!izin?.[modul]?.[aksi]
}

// Judul menu (adminV2Data) -> modul RBAC. null = selalu boleh (Profil saya).
const JUDUL_KE_MODUL: Record<string, string | null> = {
  'dashboard': 'Dashboard',
  'data siswa': 'Data Siswa',
  'absensi siswa': 'Absensi Siswa',
  'manajemen kelas': 'Manajemen Kelas',
  'jadwal pelajaran': 'Jadwal Pelajaran',
  'master mapel': 'Master Mapel',
  'raport siswa': 'Raport Siswa',
  'data guru & staff': 'Data Guru & Staff',
  'absensi guru & staff': 'Absensi Guru',
  'jadwal mengajar': 'Jadwal Mengajar',
  'agenda mengajar': 'Agenda Mengajar',
  'modul pembelajaran': 'Modul Pembelajaran',
  'keuangan sekolah': 'Keuangan Sekolah',
  'pembayaran': 'Keuangan Sekolah',
  'tabungan siswa': 'Tabungan Siswa',
  'manajemen cbt': 'Manajemen CBT',
  'lms': 'LMS',
  'konten website': 'Konten Website',
  'spmb': 'SPMB',
  'perpustakaan digital': 'Perpustakaan Digital',
  'manajemen user': 'Manajemen User',
  'hak akses (rbac)': 'Hak Akses (RBAC)',
  'log aktivitas': 'Log Aktivitas',
  'pengaturan': 'Pengaturan',
  'tiketing': 'Tiketing',
  'profil saya': null
}

export function modulDariJudul(judul: string): string | null {
  const kunci = judul.toLowerCase().trim()
  return kunci in JUDUL_KE_MODUL ? JUDUL_KE_MODUL[kunci] : null
}

// Awalan path AdminV2 -> modul RBAC (untuk middleware penjaga rute). null = selalu boleh.
const PATH_KE_MODUL: Array<[string, string | null]> = [
  ['/adminv2/modul-ajar', 'Modul Pembelajaran'],
  ['/adminv2/jadwal-pelajaran', 'Jadwal Pelajaran'],
  ['/adminv2/jadwal-mengajar', 'Jadwal Mengajar'],
  ['/adminv2/agenda-mengajar', 'Agenda Mengajar'],
  ['/adminv2/absensi-guru', 'Absensi Guru'],
  ['/adminv2/absensi', 'Absensi Siswa'],
  ['/adminv2/siswa', 'Data Siswa'],
  ['/adminv2/kelas', 'Manajemen Kelas'],
  ['/adminv2/mapel', 'Master Mapel'],
  ['/adminv2/raport', 'Raport Siswa'],
  ['/adminv2/guru', 'Data Guru & Staff'],
  ['/adminv2/keuangan', 'Keuangan Sekolah'],
  ['/adminv2/tabungan', 'Tabungan Siswa'],
  ['/adminv2/cbt', 'Manajemen CBT'],
  ['/adminv2/lms', 'LMS'],
  ['/adminv2/konten', 'Konten Website'],
  ['/adminv2/spmb', 'SPMB'],
  ['/adminv2/users', 'Manajemen User'],
  ['/adminv2/rbac', 'Hak Akses (RBAC)'],
  ['/adminv2/log-aktivitas', 'Log Aktivitas'],
  ['/adminv2/tiketing', 'Tiketing'],
  ['/adminv2/profil', null],
  ['/adminv2/profile', null]
]

export function modulDariPath(path: string): string | null {
  const p = path.toLowerCase()
  for (const [awalan, modul] of PATH_KE_MODUL) {
    if (p === awalan || p.startsWith(awalan + '/') || p.startsWith(awalan + '?')) return modul
  }
  if (p === '/adminv2' || p === '/adminv2/') return 'Dashboard'
  return null
}

// Sub-modul yang punya halaman sendiri (bukan tab). null = halaman modul utama.
export function subDariPath(path: string): string | null {
  const p = path.toLowerCase()
  if (p === '/adminv2/keuangan/pembayaran' || p.startsWith('/adminv2/keuangan/pembayaran/')) return 'pembayaran'
  return null
}
