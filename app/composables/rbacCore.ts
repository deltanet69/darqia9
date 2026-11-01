// Inti RBAC (Hak Akses) — konstanta, data awal, dan fungsi murni.
// Tanpa impor Nuxt/Vue agar bisa dites langsung (tests/rbac.mjs).
// Aturan user (1 Nov 2026):
// 1) Satu pengguna hanya memegang SATU peran — penugasan baru memindahkan peran lama.
// 2) Izin matriks ditegakkan: lihat/buat/ubah/hapus per modul sesuai peran.
// 3) Penugasan membawa cakupan jenjang (SMP/SMK, boleh keduanya).

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
  'Manajemen User', 'Hak Akses (RBAC)', 'Log Aktivitas', 'Pengaturan'
]

export const RBAC_AKSI: Array<{ kunci: AksiRbac; label: string }> = [
  { kunci: 'lihat', label: 'Lihat' },
  { kunci: 'buat', label: 'Buat' },
  { kunci: 'ubah', label: 'Ubah' },
  { kunci: 'hapus', label: 'Hapus' }
]

const AKSI_SEMUA: AksiRbac[] = ['lihat', 'buat', 'ubah', 'hapus']

export function izinKosong(): IzinPeran {
  const izin: IzinPeran = {}
  for (const modul of RBAC_MODUL) izin[modul] = { lihat: false, buat: false, ubah: false, hapus: false }
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
  return izin
}

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
export const RBAC_SEED_IZIN: Record<string, IzinPeran> = {
  superadmin: P({ R: SEMUA, C: SEMUA, U: SEMUA, D: SEMUA }),
  ketua_yayasan: P({ R: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21] }),
  kepala_sekolah: P({ R: SEMUA, U: [4, 10, 11, 16, 17] }),
  wakil_kepala_sekolah: P({ R: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21], U: [4, 9, 10, 11] }),
  operator: P({ R: SEMUA, C: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], U: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], D: [1, 2, 3, 4, 7, 8, 9, 13, 14, 15, 16, 17] }),
  staff_adm: P({ R: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17], C: [1, 2, 3, 8, 13, 17], U: [1, 2, 3, 6, 8, 17], D: [1, 17] }),
  wali_kelas: P({ R: [0, 1, 2, 4, 6, 10, 11, 13, 15], U: [2] }),
  guru_pengajar: P({ R: [0, 1, 4, 5, 6, 8, 9, 10, 11, 14, 15, 18], C: [10, 11, 14, 15], U: [6, 10, 11, 14, 15], D: [10, 11, 14, 15] }),
  staff_sekolah: P({ R: [0, 1, 4, 7, 8, 11, 16, 17, 18], C: [16, 18], U: [16, 18] })
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
  ['/adminv2/log', 'Log Aktivitas'],
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
