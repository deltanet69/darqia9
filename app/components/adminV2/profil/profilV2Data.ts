export type ProfileTabKey = 'overview' | 'dataprofil' | 'aplikasi' | 'pengaturan'

export const AVATAR_GRADIENTS = [
  'from-[#0B1F3A] to-[#1D4ED8]', // Tema 0: Navy Blue
  'from-[#065F46] to-[#10B981]', // Tema 1: Emerald Green
  'from-[#155E6B] to-[#0E7490]', // Tema 2: Cyan Ocean
  'from-[#7C2D12] to-[#D97706]'  // Tema 3: Warm Amber
]

// Ikon + keterangan singkat untuk 23 modul RBAC (kunci = RBAC_MODUL di rbacCore.ts).
export const MODUL_INFO: Record<string, [string, string]> = {
  'Dashboard': ['home', 'Ringkasan & statistik portal'],
  'Data Siswa': ['users', 'Data induk siswa'],
  'Absensi Siswa': ['check', 'Kehadiran harian siswa'],
  'Manajemen Kelas': ['layers', 'Rombel & wali kelas'],
  'Jadwal Pelajaran': ['cal', 'Jadwal pelajaran mingguan'],
  'Master Mapel': ['book', 'Mata pelajaran'],
  'Raport Siswa': ['doc', 'Nilai & raport'],
  'Data Guru & Staff': ['user', 'Data induk pegawai'],
  'Absensi Guru': ['clock', 'Presensi guru & staff'],
  'Jadwal Mengajar': ['cal', 'Jadwal mengajar guru'],
  'Agenda Mengajar': ['book', 'Agenda & jurnal mengajar'],
  'Modul Pembelajaran': ['layers', 'Materi & modul ajar'],
  'Keuangan Sekolah': ['wallet', 'Tagihan, pembayaran & kas'],
  'Tabungan Siswa': ['bank', 'Tabungan siswa'],
  'Manajemen CBT': ['monitor', 'Ujian berbasis komputer'],
  'LMS': ['book', 'Ujian harian digital'],
  'Konten Website': ['doc', 'Berita & halaman website'],
  'SPMB': ['plus', 'Penerimaan murid baru'],
  'Perpustakaan Digital': ['book', 'Koleksi & sirkulasi'],
  'Manajemen User': ['users', 'Akun & peran pengguna'],
  'Hak Akses (RBAC)': ['shield', 'Peran & izin akses'],
  'Log Aktivitas': ['doc', 'Jejak aktivitas sistem'],
  'Pengaturan': ['gear', 'Konfigurasi sistem']
}
