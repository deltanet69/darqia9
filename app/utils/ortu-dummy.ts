// Data contoh portal orang tua (tahap review). Bukan data sekolah asli.
// Dipakai hanya setelah masuk dengan akun contoh di mode dev.
export const ORTU_DUMMY = {
  jenjang: 'SMK' as const,
  siswa: {
    nama: 'Ahmad Fauzan',
    nis: '12011994',
    nisn: '0012345678',
    kelas: 'X TKJ 1',
    tingkat: 'X',
    status: 'Aktif' as const,
    tahunAjaran: '2026/2027',
    waliKelas: 'Nur Aini, S.Pd.',
    tempatLahir: 'Bekasi',
    tanggalLahir: '2009-03-14',
    agama: 'Islam',
    angkatan: '2024',
    tanggalMasuk: '2024-07-15',
    hp: '081234564471'
  },
  ortu: {
    ayah: { nama: 'Hasan Fauzan', pendidikan: 'SMA', pekerjaan: 'Wiraswasta', hp: '081234564471' },
    ibu: { nama: 'Siti Rahma', pendidikan: 'SMA', pekerjaan: 'Ibu rumah tangga', hp: '081298765432' }
  },
  alamat: {
    rtRw: 'RT 003 / RW 011',
    desa: 'Ujung Harapan',
    kecamatan: 'Babelan',
    kota: 'Kab. Bekasi',
    jenisTinggal: 'Bersama orang tua',
    transportasi: 'Sepeda motor',
    jarak: '3 km'
  },
  ringkasan: {
    kehadiranPersen: 94,
    rataNilaiUjian: 82.4,
    sisaTagihan: 1250000,
    tagihanTingkat: 'Kelas X'
  },
  ujianTerdekat: { jenis: 'PTS', nama: 'PTS Ganjil 2026/2027', tanggal: '2026-11-20', jam: '07.30' },
  // Jadwal hari Jumat (hari 5). Hari lain tampil kosong.
  jadwalJumat: [
    { mulai: '07.30', selesai: '08.15', mapel: 'Produktif TKJ', guru: 'Dedi Kurniawan, S.Kom.' },
    { mulai: '08.15', selesai: '09.00', mapel: 'Sejarah Indonesia', guru: 'Rina Marlina, S.Pd.' },
    { mulai: '09.00', selesai: '09.45', mapel: 'Projek IPAS', guru: 'Yusuf Hakim, S.Pd.' },
    { mulai: '09.45', selesai: '10.45', mapel: 'Muhadoroh', guru: '' }
  ],
  // hariLalu: selisih hari dari hari ini, dihitung saat tampil
  aktivitas: [
    { hariLalu: 0, judul: 'Tagihan Kelas X dirilis', jenis: 'Administrasi' },
    { hariLalu: 0, judul: 'Nilai PR Produktif TKJ keluar', jenis: 'Ujian' },
    { hariLalu: 1, judul: 'Pembayaran SPP diterima, no. kwitansi 0023', jenis: 'Administrasi' },
    { hariLalu: 2, judul: 'Tidak hadir (sakit) pada Sejarah Indonesia', jenis: 'Kehadiran' },
    { hariLalu: 4, judul: 'Kartu ujian PTS dirilis', jenis: 'Ujian' }
  ]
}
