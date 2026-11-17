// Data contoh preview Perpustakaan Digital — SEMUA DUMMY, ganti dengan data backend saat siap.
// Katalog asli = allowlist kurikulum terkurasi; kisi-kisi asli = dari bank soal guru/admin.
window.PERPUS_DATA = {
  // Akun Google contoh (simulasi) dan daftar siswa terdaftar untuk verifikasi NIS/NISN
  akunGoogle: [
    { email: 'siswa.smk.contoh@gmail.com', nama: 'Siswa SMK Contoh' },
    { email: 'siswa.smp.contoh@gmail.com', nama: 'Siswa SMP Contoh' }
  ],
  siswa: [
    { nisn: '0012345678', nis: '24001', nama: 'Ahmad Fauzan', kelas: 'X TKJ 1', jenjang: 'SMK' },
    { nisn: '0098765432', nis: '24101', nama: 'Nayla Putri', kelas: 'VIII A', jenjang: 'SMP' }
  ],
  buku: [
    {
      id: 'jaringan', judul: 'Dasar-Dasar Jaringan Komputer', mapel: 'Dasar Program Keahlian', kelas: 'Kelas X', kur: 'Merdeka', jenjang: ['SMK'], warna: ['#0a2a5c', '#2f6bff'],
      ringkas: 'Mengenal jenis jaringan, topologi, dan alamat IP sebagai dasar keahlian Teknik Komputer dan Jaringan.',
      bab: ['Pengertian Jaringan', 'Topologi dan Alamat'],
      hal: [
        { bab: 1, judul: 'Apa itu jaringan komputer', p: ['Jaringan komputer adalah kumpulan perangkat yang saling terhubung sehingga dapat bertukar data dan berbagi sumber daya, seperti berkas, printer, dan koneksi internet.', 'Perangkat yang terhubung disebut node. Node dapat berupa komputer, laptop, ponsel, printer, atau perangkat jaringan seperti switch dan router.'] },
        { bab: 1, judul: 'Jenis jaringan berdasarkan jangkauan', p: ['LAN (Local Area Network) menghubungkan perangkat dalam area terbatas, misalnya satu laboratorium atau gedung sekolah. MAN mencakup satu kota, sedangkan WAN menjangkau wilayah luas, bahkan antarnegara. Internet adalah contoh WAN terbesar.', 'PAN (Personal Area Network) menghubungkan perangkat pribadi dalam jarak sangat dekat, misalnya ponsel dengan earphone nirkabel melalui Bluetooth.'] },
        { bab: 2, judul: 'Topologi jaringan', p: ['Topologi adalah pola susunan perangkat dalam jaringan. Pada topologi bus, semua perangkat memakai satu kabel utama. Pada topologi ring, perangkat membentuk lingkaran tertutup.', 'Topologi star menghubungkan semua perangkat ke satu titik pusat, biasanya switch. Topologi ini paling umum dipakai di sekolah dan kantor karena mudah dikelola: bila satu kabel putus, perangkat lain tetap bekerja.'] },
        { bab: 2, judul: 'Alamat IP', p: ['Setiap perangkat dalam jaringan memerlukan alamat IP agar dapat dikenali. IPv4 ditulis dalam empat angka antara 0 dan 255 yang dipisah titik, contohnya 192.168.1.10.', 'Alamat IP terdiri atas bagian jaringan dan bagian perangkat. Subnet mask, misalnya 255.255.255.0, menentukan batas antara keduanya. Dua perangkat dalam satu jaringan harus memiliki bagian jaringan yang sama.'] }
      ]
    },
    {
      id: 'informatika', judul: 'Informatika: Berpikir Komputasional', mapel: 'Informatika', kelas: 'Kelas VII – X', kur: 'Merdeka', jenjang: ['SMP', 'SMK'], warna: ['#0f3d8a', '#18b4c9'],
      ringkas: 'Cara memecahkan masalah secara sistematis lewat empat pilar berpikir komputasional dan dasar algoritma.',
      bab: ['Berpikir Komputasional', 'Algoritma'],
      hal: [
        { bab: 1, judul: 'Empat pilar berpikir komputasional', p: ['Berpikir komputasional adalah cara menyelesaikan masalah agar dapat dikerjakan oleh manusia maupun komputer. Ada empat pilar: dekomposisi, pengenalan pola, abstraksi, dan algoritma.', 'Dekomposisi berarti memecah masalah besar menjadi bagian kecil yang lebih mudah diselesaikan. Misalnya, membuat aplikasi absensi dipecah menjadi tampilan, penyimpanan data, dan laporan.'] },
        { bab: 1, judul: 'Pengenalan pola dan abstraksi', p: ['Pengenalan pola mencari kemiripan atau keteraturan antarmasalah sehingga solusi lama dapat dipakai kembali.', 'Abstraksi berarti memusatkan perhatian pada hal penting dan mengabaikan rincian yang tidak diperlukan, seperti peta kereta yang hanya menampilkan stasiun dan jalur.'] },
        { bab: 2, judul: 'Pengertian algoritma', p: ['Algoritma adalah urutan langkah yang jelas dan terbatas untuk menyelesaikan suatu masalah. Algoritma yang baik memiliki masukan, proses, dan keluaran yang jelas.', 'Algoritma dapat dituliskan sebagai kalimat berurutan, diagram alir (flowchart), atau pseudocode.'] },
        { bab: 2, judul: 'Tiga struktur dasar', p: ['Semua algoritma dapat disusun dari tiga struktur: runtutan (langkah berurutan), percabangan (memilih langkah berdasarkan kondisi), dan perulangan (mengulang langkah selama kondisi terpenuhi).', 'Contoh percabangan: jika nilai lebih dari atau sama dengan 75, tampilkan "Tuntas"; jika tidak, tampilkan "Remedial".'] }
      ]
    },
    {
      id: 'plsv', judul: 'Matematika: Persamaan Linear Satu Variabel', mapel: 'Matematika', kelas: 'Kelas VIII', kur: 'K13', jenjang: ['SMP'], warna: ['#1b2f6b', '#6b7cff'],
      ringkas: 'Menyelesaikan persamaan linear satu variabel dan mengubah soal cerita menjadi model matematika.',
      bab: ['Konsep PLSV', 'Menyelesaikan PLSV'],
      hal: [
        { bab: 1, judul: 'Kalimat terbuka dan persamaan', p: ['Persamaan linear satu variabel (PLSV) adalah kalimat terbuka yang memuat tanda sama dengan dan satu variabel berpangkat satu, contohnya x + 5 = 12.', 'Nilai variabel yang membuat persamaan bernilai benar disebut penyelesaian. Pada x + 5 = 12, penyelesaiannya x = 7 karena 7 + 5 = 12.'] },
        { bab: 1, judul: 'Persamaan yang setara', p: ['Dua persamaan setara bila memiliki penyelesaian yang sama. Persamaan setara diperoleh dengan menambah, mengurangi, mengalikan, atau membagi kedua ruas dengan bilangan yang sama (bukan nol).', 'Contoh: 2x = 10 setara dengan x = 5 karena kedua ruas dibagi 2.'] },
        { bab: 2, judul: 'Langkah penyelesaian', p: ['Untuk menyelesaikan 3x − 4 = 11, tambahkan 4 pada kedua ruas sehingga 3x = 15. Lalu bagi kedua ruas dengan 3 sehingga x = 5.', 'Periksa jawaban dengan mensubstitusi: 3(5) − 4 = 11. Hasilnya benar.'] },
        { bab: 2, judul: 'Soal cerita', p: ['Umur Dina 3 tahun lebih tua dari adiknya. Jika jumlah umur mereka 21 tahun, misalkan umur adik = x. Maka x + (x + 3) = 21, sehingga 2x = 18 dan x = 9.', 'Jadi umur adik 9 tahun dan umur Dina 12 tahun. Ubah kalimat menjadi model matematika sebelum menghitung.'] }
      ]
    },
    {
      id: 'fungsi', judul: 'Matematika: Fungsi dan Barisan', mapel: 'Matematika', kelas: 'Kelas X', kur: 'Merdeka', jenjang: ['SMK'], warna: ['#12306b', '#3a86ff'],
      ringkas: 'Memahami fungsi linear, grafiknya, serta barisan aritmetika dan geometri untuk kebutuhan kejuruan.',
      bab: ['Fungsi', 'Barisan'],
      hal: [
        { bab: 1, judul: 'Pengertian fungsi', p: ['Fungsi adalah aturan yang memasangkan setiap anggota himpunan pertama (domain) dengan tepat satu anggota himpunan kedua (kodomain).', 'Fungsi ditulis f(x) = 2x + 1. Jika x = 3, maka f(3) = 7. Himpunan semua hasil disebut range.'] },
        { bab: 1, judul: 'Grafik fungsi linear', p: ['Grafik f(x) = mx + c berupa garis lurus. Nilai m adalah gradien (kemiringan) dan c adalah titik potong dengan sumbu-y.', 'Untuk menggambarnya, cari dua titik, misalnya saat x = 0 dan x = 1, lalu hubungkan dengan garis lurus.'] },
        { bab: 2, judul: 'Barisan aritmetika', p: ['Barisan aritmetika memiliki selisih tetap antarsuku yang disebut beda (b). Suku ke-n dihitung dengan Un = a + (n − 1)b.', 'Pada barisan 3, 7, 11, 15, suku pertama a = 3 dan beda b = 4. Suku ke-10 adalah 3 + 9 × 4 = 39.'] },
        { bab: 2, judul: 'Barisan geometri', p: ['Barisan geometri memiliki rasio tetap (r) antarsuku. Suku ke-n dihitung dengan Un = a × r^(n − 1).', 'Pada barisan 2, 6, 18, 54, suku pertama a = 2 dan rasio r = 3. Suku ke-5 adalah 2 × 81 = 162.'] }
      ]
    },
    {
      id: 'sel', judul: 'IPA: Sel dan Jaringan', mapel: 'IPA', kelas: 'Kelas VIII', kur: 'Merdeka', jenjang: ['SMP'], warna: ['#0b4a6f', '#2bb3a3'],
      ringkas: 'Mengenal sel sebagai unit kehidupan, organel penyusunnya, dan jaringan pada hewan dan tumbuhan.',
      bab: ['Sel', 'Jaringan'],
      hal: [
        { bab: 1, judul: 'Sel sebagai unit kehidupan', p: ['Sel adalah unit struktural dan fungsional terkecil makhluk hidup. Robert Hooke pertama kali mengamati sel pada irisan gabus menggunakan mikroskop sederhana.', 'Makhluk hidup ada yang tersusun dari satu sel (uniseluler), seperti bakteri, dan ada yang banyak sel (multiseluler), seperti manusia.'] },
        { bab: 1, judul: 'Organel sel', p: ['Inti sel mengatur seluruh kegiatan sel dan menyimpan materi genetik. Mitokondria menghasilkan energi melalui respirasi sel.', 'Ribosom membuat protein. Membran sel mengatur keluar masuknya zat. Sel tumbuhan memiliki dinding sel dan kloroplas, sedangkan sel hewan tidak.'] },
        { bab: 2, judul: 'Dari sel menjadi jaringan', p: ['Sel-sel sejenis yang bekerja sama membentuk jaringan. Jaringan hewan antara lain jaringan epitel, otot, saraf, dan ikat.', 'Beberapa jaringan membentuk organ, misalnya jantung. Beberapa organ membentuk sistem organ, misalnya sistem peredaran darah.'] },
        { bab: 2, judul: 'Jaringan tumbuhan', p: ['Jaringan meristem terus membelah dan menyebabkan tumbuhan bertambah panjang. Jaringan epidermis melindungi permukaan tubuh tumbuhan.', 'Xilem mengangkut air dan mineral dari akar ke daun, sedangkan floem mengangkut hasil fotosintesis ke seluruh tubuh tumbuhan.'] }
      ]
    },
    {
      id: 'eksposisi', judul: 'Bahasa Indonesia: Teks Eksposisi', mapel: 'Bahasa Indonesia', kelas: 'Kelas VIII – X', kur: 'Merdeka', jenjang: ['SMP', 'SMK'], warna: ['#7a2f1f', '#e8833a'],
      ringkas: 'Memahami struktur dan kaidah kebahasaan teks eksposisi, lalu menyusunnya langkah demi langkah.',
      bab: ['Struktur', 'Kaidah dan Penyusunan'],
      hal: [
        { bab: 1, judul: 'Apa itu teks eksposisi', p: ['Teks eksposisi adalah teks yang menjelaskan pendapat atau gagasan disertai fakta dan alasan agar pembaca terbujuk atau memahami suatu hal.', 'Teks ini sering ditemukan pada artikel opini, tajuk rencana, dan esai.'] },
        { bab: 1, judul: 'Struktur teks', p: ['Teks eksposisi tersusun atas tiga bagian: tesis (pernyataan pendapat), argumentasi (alasan dan data pendukung), dan penegasan ulang (kesimpulan).', 'Tesis biasanya berada di awal, sedangkan penegasan ulang menutup tulisan dengan mempertegas pendapat.'] },
        { bab: 2, judul: 'Kata kunci kebahasaan', p: ['Teks eksposisi memakai kata penghubung argumentasi seperti karena, sebab, oleh karena itu, dan dengan demikian.', 'Teks ini juga memakai istilah teknis sesuai topik dan kalimat yang lugas serta objektif.'] },
        { bab: 2, judul: 'Menyusun eksposisi', p: ['Mulailah dengan menentukan topik dan satu pendapat yang jelas. Kumpulkan tiga alasan beserta datanya.', 'Tulis tesis, kembangkan setiap alasan menjadi paragraf argumentasi, lalu tutup dengan penegasan ulang. Periksa ejaan sesuai kaidah yang berlaku.'] }
      ]
    },
    {
      id: 'ppkn', judul: 'PPKn: Norma dan Aturan', mapel: 'PPKn', kelas: 'Kelas VII – X', kur: 'K13', jenjang: ['SMP', 'SMK'], warna: ['#3b2a6b', '#8f6bff'],
      ringkas: 'Memahami macam-macam norma, tata tertib sekolah, serta keseimbangan hak dan kewajiban.',
      bab: ['Norma', 'Aturan dan Tanggung Jawab'],
      hal: [
        { bab: 1, judul: 'Pengertian norma', p: ['Norma adalah aturan yang mengatur sikap dan perilaku manusia dalam kehidupan bermasyarakat agar tercipta keteraturan.', 'Norma ada yang tertulis dan ada yang tidak tertulis. Pelanggarnya dapat dikenai sanksi, mulai dari teguran sosial hingga hukuman.'] },
        { bab: 1, judul: 'Macam-macam norma', p: ['Norma agama bersumber dari ajaran agama. Norma kesusilaan bersumber dari hati nurani. Norma kesopanan bersumber dari kebiasaan masyarakat.', 'Norma hukum dibuat oleh pemerintah dan bersifat memaksa dengan sanksi tegas.'] },
        { bab: 2, judul: 'Tata tertib sekolah', p: ['Tata tertib sekolah adalah aturan tertulis untuk menciptakan lingkungan belajar yang tertib, aman, dan nyaman.', 'Kepatuhan pada tata tertib melatih disiplin dan tanggung jawab sebagai bekal hidup bermasyarakat.'] },
        { bab: 2, judul: 'Hak dan kewajiban', p: ['Hak adalah sesuatu yang patut diterima, sedangkan kewajiban adalah sesuatu yang harus dilakukan. Keduanya harus seimbang.', 'Siswa berhak mendapat pelajaran yang baik dan berkewajiban menghormati guru, menjaga kebersihan, serta mengikuti tata tertib.'] }
      ]
    }
  ],
  // Kisi-kisi contoh (aslinya diisi dari bank soal guru/admin). buku + hal = materi terkait.
  // hari = kisi-kisi dibuat guru di Bank Soal CBT & LMS sekian hari lalu (contoh)
  kisi: [
    { id: 'pas-inf-x', hari: 0, jenjang: 'SMK', judul: 'PAS Informatika Kelas X', mapel: 'Informatika', topik: [
      { t: 'Pilar berpikir komputasional', i: 'Menjelaskan dekomposisi, pengenalan pola, abstraksi, dan algoritma.', materi: [{ buku: 'informatika', hal: 0 }, { buku: 'informatika', hal: 1 }] },
      { t: 'Struktur dasar algoritma', i: 'Membedakan runtutan, percabangan, dan perulangan.', materi: [{ buku: 'informatika', hal: 2 }, { buku: 'informatika', hal: 3 }] },
      { t: 'Topologi jaringan', i: 'Menentukan topologi yang sesuai untuk jaringan sekolah.', materi: [{ buku: 'jaringan', hal: 2 }, { buku: 'jaringan', hal: 1 }] },
      { t: 'Alamat IP dan subnet mask', i: 'Menjelaskan fungsi alamat IPv4 dan subnet mask.', materi: [{ buku: 'jaringan', hal: 3 }] }
    ] },
    { id: 'pts-mtk-x', hari: 2, jenjang: 'SMK', judul: 'PTS Matematika Kelas X', mapel: 'Matematika', topik: [
      { t: 'Fungsi dan grafik linear', i: 'Menentukan nilai fungsi dan menggambar grafik f(x) = mx + c.', materi: [{ buku: 'fungsi', hal: 0 }, { buku: 'fungsi', hal: 1 }] },
      { t: 'Barisan aritmetika', i: 'Menghitung suku ke-n dengan beda tetap.', materi: [{ buku: 'fungsi', hal: 2 }] },
      { t: 'Barisan geometri', i: 'Menghitung suku ke-n dengan rasio tetap.', materi: [{ buku: 'fungsi', hal: 3 }] }
    ] },
    { id: 'pas-bin-x', hari: 12, jenjang: 'SMK', judul: 'PAS Bahasa Indonesia Kelas X', mapel: 'Bahasa Indonesia', topik: [
      { t: 'Struktur teks eksposisi', i: 'Mengidentifikasi tesis, argumentasi, dan penegasan ulang.', materi: [{ buku: 'eksposisi', hal: 1 }, { buku: 'eksposisi', hal: 0 }] },
      { t: 'Menyusun teks eksposisi', i: 'Menulis eksposisi dengan tiga alasan beserta data.', materi: [{ buku: 'eksposisi', hal: 3 }, { buku: 'eksposisi', hal: 2 }] }
    ] },
    { id: 'pts-mtk-8', hari: 1, jenjang: 'SMP', judul: 'PTS Matematika Kelas VIII', mapel: 'Matematika', topik: [
      { t: 'Konsep persamaan linear satu variabel', i: 'Menentukan penyelesaian dan persamaan yang setara.', materi: [{ buku: 'plsv', hal: 0 }, { buku: 'plsv', hal: 1 }] },
      { t: 'Penyelesaian PLSV', i: 'Menyelesaikan persamaan dengan langkah yang runtut.', materi: [{ buku: 'plsv', hal: 2 }] },
      { t: 'Soal cerita PLSV', i: 'Mengubah soal cerita menjadi model matematika.', materi: [{ buku: 'plsv', hal: 3 }] }
    ] },
    { id: 'pas-ipa-8', hari: 10, jenjang: 'SMP', judul: 'PAS IPA Kelas VIII', mapel: 'IPA', topik: [
      { t: 'Organel dan fungsinya', i: 'Menjelaskan fungsi inti sel, mitokondria, dan ribosom.', materi: [{ buku: 'sel', hal: 1 }, { buku: 'sel', hal: 0 }] },
      { t: 'Jaringan hewan dan tumbuhan', i: 'Mengelompokkan jaringan dan fungsinya.', materi: [{ buku: 'sel', hal: 2 }, { buku: 'sel', hal: 3 }] }
    ] },
    { id: 'pas-bin-8', hari: 14, jenjang: 'SMP', judul: 'PAS Bahasa Indonesia Kelas VIII', mapel: 'Bahasa Indonesia', topik: [
      { t: 'Struktur teks eksposisi', i: 'Mengidentifikasi tesis, argumentasi, dan penegasan ulang.', materi: [{ buku: 'eksposisi', hal: 1 }, { buku: 'eksposisi', hal: 0 }] },
      { t: 'Kaidah kebahasaan eksposisi', i: 'Menemukan kata penghubung argumentasi dalam teks.', materi: [{ buku: 'eksposisi', hal: 2 }] }
    ] }
  ]
};
