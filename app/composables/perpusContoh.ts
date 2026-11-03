// DATA CONTOH — digenerate dari preview Perpus Siswa v8 yang dikunci pemilik
// (30 Okt 2026). Dipakai HANYA saat migrasi 0028 belum dijalankan (mode contoh
// lokal berlabel). Isi identik dengan seed migrasi 0028 — satu sumber data.
import type { Buku, SiswaContoh } from './perpusCore'

export const BUKU_CONTOH: Buku[] = [
 {
  "id": "inf10",
  "judul": "Informatika: Jaringan Komputer Dasar",
  "lit": false,
  "tingkat": 10,
  "mapel": "Informatika",
  "jurusan": "",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 120,
  "gradasi": "linear-gradient(135deg,#6D28D9,#A78BFA)",
  "inisial": "IN",
  "deskripsi": "Fondasi jaringan komputer: konsep, perangkat, pengalamatan IP, dan topologi — bekal awal menuju praktik TKJ.",
  "rating": 4.8,
  "bab": [
   {
    "judul": "Bab 1 — Konsep Jaringan Komputer",
    "isi": "\n<p>Jaringan komputer adalah dua atau lebih perangkat yang saling terhubung untuk berbagi data dan sumber daya (printer, file, koneksi internet).</p>\n<h4>Manfaat Jaringan</h4>\n<ul><li>Berbagi file dan perangkat keras.</li><li>Komunikasi cepat (email, chat, video call).</li><li>Akses internet bersama.</li><li>Sentralisasi data dan keamanan.</li></ul>\n<h4>Jenis Berdasarkan Jangkauan</h4>\n<ul><li><b>LAN</b> (Local Area Network): satu gedung/ruangan, mis. lab komputer sekolah.</li><li><b>MAN</b> (Metropolitan Area Network): satu kota.</li><li><b>WAN</b> (Wide Area Network): antar kota/negara — internet adalah WAN terbesar.</li></ul>\n<div class=\"box-c\"><b>Contoh.</b> 30 PC di lab yang terhubung ke satu switch dan bisa saling berbagi file membentuk sebuah LAN.</div>"
   },
   {
    "judul": "Bab 2 — Perangkat Jaringan",
    "isi": "\n<ul><li><b>NIC</b> (Network Interface Card): kartu/antarmuka agar perangkat bisa tersambung ke jaringan.</li><li><b>Kabel UTP:</b> kabel twisted-pair standar LAN; urutan warna mengikuti standar T568A/B.</li><li><b>Switch:</b> menghubungkan banyak perangkat dalam satu LAN, meneruskan data ke port tujuan saja.</li><li><b>Router:</b> menghubungkan antar jaringan berbeda (mis. LAN sekolah ke internet).</li><li><b>Access Point:</b> memancarkan sinyal Wi-Fi agar perangkat nirkabel bisa bergabung.</li></ul>\n<h4>Kabel Straight vs Cross</h4>\n<p><b>Straight-through:</b> perangkat berbeda jenis (PC–switch). <b>Cross-over:</b> perangkat sejenis (PC–PC, switch–switch). Switch modern umumnya sudah auto-MDIX.</p>\n<div class=\"box-w\"><b>Praktik.</b> Identifikasi perangkat di lab sekolahmu: mana switch, mana access point, kabel apa yang dipakai?</div>"
   },
   {
    "judul": "Bab 3 — IP Address Dasar",
    "isi": "\n<p>IP address adalah identitas numerik setiap perangkat di jaringan, mis. <span class=\"rum\">192.168.1.10</span>. IPv4 terdiri dari 32 bit dalam 4 oktet.</p>\n<h4>Kelas IP</h4>\n<ul><li><b>Kelas A:</b> 1.0.0.0 – 126.x.x.x (jaringan sangat besar).</li><li><b>Kelas B:</b> 128.0.x.x – 191.255.x.x.</li><li><b>Kelas C:</b> 192.0.0.x – 223.255.255.x — paling umum untuk LAN, mis. 192.168.1.0/24.</li></ul>\n<h4>Subnet Mask</h4>\n<p>Subnet mask memisahkan bagian network dan host. <span class=\"rum\">255.255.255.0</span> (/24) berarti 24 bit pertama adalah alamat network.</p>\n<div class=\"box-c\"><b>Contoh.</b> PC ber-IP 192.168.1.10/24 berada di network 192.168.1.0 dan bisa berkomunikasi langsung dengan 192.168.1.11/24.</div>\n<div class=\"box-w\"><b>Ingat!</b> Dua perangkat beda network butuh router untuk saling terhubung.</div>"
   },
   {
    "judul": "Bab 4 — Topologi Jaringan",
    "isi": "\n<p>Topologi adalah pola hubungan antar perangkat dalam jaringan.</p>\n<ul><li><b>Star:</b> semua perangkat ke satu titik pusat (switch). Paling umum; satu kabel putus tidak melumpuhkan yang lain, tapi switch mati = semua mati.</li><li><b>Bus:</b> satu kabel utama (backbone); murah tapi satu gangguan melumpuhkan semua.</li><li><b>Ring:</b> data berputar satu arah; satu titik putus mengganggu aliran.</li><li><b>Mesh:</b> setiap perangkat terhubung ke banyak jalur; paling andal tapi mahal.</li></ul>\n<div class=\"box-c\"><b>Studi kasus.</b> Lab sekolah memakai topologi star dengan satu switch 24-port. Jika satu PC kabelnya lepas, 23 PC lain tetap online. Mengapa? Karena tiap PC punya jalur sendiri ke switch.</div>"
   }
  ]
 },
 {
  "id": "tkj10",
  "judul": "TKJ: Perakitan & Perawatan Komputer",
  "lit": false,
  "tingkat": 10,
  "mapel": "Teknik Komputer & Jaringan",
  "jurusan": "TKJ",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 110,
  "gradasi": "linear-gradient(135deg,#0F172A,#475569)",
  "inisial": "TK",
  "deskripsi": "Panduan praktik merakit PC dari komponen, instalasi dasar, hingga troubleshooting masalah umum.",
  "rating": 4.9,
  "bab": [
   {
    "judul": "Bab 1 — Komponen Utama PC",
    "isi": "\n<ul><li><b>CPU/Prosesor:</b> otak komputer; perhatikan soket (LGA/AM) agar cocok dengan motherboard.</li><li><b>Motherboard:</b> papan utama penghubung semua komponen.</li><li><b>RAM:</b> memori kerja; jenis DDR3/DDR4/DDR5 tidak saling cocok slotnya.</li><li><b>Storage:</b> HDD (murah, besar) vs SSD (cepat); SSD SATA/NVMe.</li><li><b>PSU:</b> catu daya; pilih watt sesuai kebutuhan + sertifikasi 80+.</li><li><b>Casing & pendingin:</b> airflow dan heatsink/fan CPU.</li><li><b>VGA:</b> pengolah grafis; opsional jika CPU punya iGPU.</li></ul>\n<div class=\"box-w\"><b>Keselamatan.</b> Cabut kabel power sebelum merakit. Sentuh benda logam (grounding) untuk membuang listrik statis yang bisa merusak komponen.</div>"
   },
   {
    "judul": "Bab 2 — Langkah Perakitan",
    "isi": "\n<ol><li>Siapkan alat: obeng plus, gelang anti-statis, thermal paste.</li><li>Pasang CPU ke soket motherboard (sejajarkan tanda segitiga), kunci tuasnya.</li><li>Oleskan thermal paste tipis, pasang heatsink/fan CPU.</li><li>Pasang RAM ke slot (klik kedua pengunci).</li><li>Pasang motherboard ke casing dengan baut standoff.</li><li>Pasang PSU, sambungkan kabel 24-pin ATX dan 4/8-pin CPU.</li><li>Pasang SSD/HDD dan sambungkan kabel SATA + power.</li><li>Sambungkan kabel front panel (power, reset, LED) sesuai manual.</li><li>Periksa ulang semua sambungan, lalu uji nyala (POST).</li></ol>\n<div class=\"box-c\"><b>POST berhasil</b> ditandai satu bunyi <i>beep</i> pendek dan tampil logo BIOS di monitor.</div>"
   },
   {
    "judul": "Bab 3 — Troubleshooting Dasar",
    "isi": "\n<h4>Gejala & Solusi</h4>\n<ul><li><b>Mati total:</b> cek kabel power, saklar PSU, stop kontak.</li><li><b>Nyala tapi no display:</b> reseat RAM (cabut-pasang), cek kabel monitor, coba satu keping RAM.</li><li><b>Beep panjang berulang:</b> umumnya masalah RAM — bersihkan kuningan dengan penghapus.</li><li><b>Restart sendiri:</b> cek suhu CPU (pasta kering/kipas mati) dan PSU.</li><li><b>Lambat:</b> cek startup program, kesehatan storage, tambah RAM.</li></ul>\n<div class=\"box-c\"><b>Metode.</b> Gunakan eliminasi: uji dengan komponen pengganti yang diketahui bagus, satu per satu, dari yang paling mudah (RAM, kabel) ke yang tersulit.</div>\n<div class=\"box-w\"><b>Catat!</b> Teknisi profesional selalu mencatat gejala, tindakan, dan hasil — jadikan kebiasaan mulai sekarang.</div>"
   }
  ]
 },
 {
  "id": "mtk10",
  "judul": "Matematika: Eksponen & Barisan",
  "lit": false,
  "tingkat": 10,
  "mapel": "Matematika",
  "jurusan": "",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 88,
  "gradasi": "linear-gradient(135deg,#1B5FD9,#4A9FE8)",
  "inisial": "MT",
  "deskripsi": "Bilangan berpangkat, bentuk akar, logaritma, serta barisan dan deret aritmetika–geometri untuk kelas X SMK.",
  "rating": 4.7,
  "bab": [
   {
    "judul": "Bab 1 — Eksponen & Logaritma",
    "isi": "\n<p>Eksponen adalah perkalian berulang: <span class=\"rum\">aⁿ = a × a × … × a</span> (n kali). Sifat utama: aᵐ × aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ, dan a⁻ⁿ = 1/aⁿ.</p>\n<h4>Logaritma</h4>\n<p>Logaritma adalah kebalikan eksponen: <span class=\"rum\">ᵃlog b = c</span> artinya aᶜ = b. Contoh: ²log 8 = 3 karena 2³ = 8.</p>\n<div class=\"box-c\"><b>Contoh.</b> ¹⁰log 1000 = 3, karena 10³ = 1000. Logaritma basis 10 sering ditulis tanpa basis: log 1000 = 3.</div>\n<div class=\"box-w\"><b>Ingat!</b> Bilangan pokok logaritma harus positif dan tidak sama dengan 1; numerus harus positif.</div>"
   },
   {
    "judul": "Bab 2 — Barisan & Deret",
    "isi": "\n<h4>Barisan Aritmetika</h4>\n<p>Selisih antar suku tetap (beda b). Suku ke-n: <span class=\"rum\">Uₙ = a + (n−1)b</span>. Contoh: 3, 7, 11, 15, … → a=3, b=4, U₁₀ = 3 + 9×4 = 39.</p>\n<h4>Barisan Geometri</h4>\n<p>Rasio antar suku tetap (r). Suku ke-n: <span class=\"rum\">Uₙ = a × rⁿ⁻¹</span>. Contoh: 2, 6, 18, 54, … → a=2, r=3, U₅ = 2 × 3⁴ = 162.</p>\n<div class=\"box-c\"><b>Terapan.</b> Bunga bank dan pertumbuhan pelanggan adalah contoh deret geometri dalam kehidupan nyata.</div>"
   }
  ]
 },
 {
  "id": "bind10",
  "judul": "Bahasa Indonesia: Teks Laporan Hasil Observasi",
  "lit": false,
  "tingkat": 10,
  "mapel": "Bahasa Indonesia",
  "jurusan": "",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 76,
  "gradasi": "linear-gradient(135deg,#DC2626,#F87171)",
  "inisial": "BI",
  "deskripsi": "Memahami dan menulis teks laporan hasil observasi: struktur, kaidah kebahasaan, dan langkah penyusunannya.",
  "rating": 4.6,
  "bab": [
   {
    "judul": "Bab 1 — Struktur Teks LHO",
    "isi": "\n<p>Teks laporan hasil observasi (LHO) adalah teks yang menyajikan informasi tentang suatu objek berdasarkan pengamatan langsung, bersifat faktual dan objektif.</p>\n<h4>Struktur</h4>\n<ul><li><b>Pernyataan umum:</b> definisi/gambaran umum objek.</li><li><b>Deskripsi bagian:</b> rincian bagian-bagian objek.</li><li><b>Deskripsi manfaat:</b> kegunaan objek yang diamati.</li></ul>\n<div class=\"box-c\"><b>Contoh pembuka.</b> \"Kucing adalah mamalia berkaki empat dari keluarga Felidae yang banyak dipelihara manusia sebagai hewan peliharaan.\"</div>"
   },
   {
    "judul": "Bab 2 — Kaidah Kebahasaan LHO",
    "isi": "\n<ul><li>Menggunakan <b>kata teknis/istilah</b> sesuai bidang objek.</li><li>Menggunakan <b>kopula</b>: adalah, merupakan, yaitu.</li><li>Menggunakan <b>kata benda umum</b> dan frasa nomina.</li><li>Bahasa baku, objektif, tanpa opini pribadi penulis.</li></ul>\n<div class=\"box-w\"><b>Tugas.</b> Amati satu objek di lingkungan sekolah (taman, kantin, lab), lalu tulis LHO satu halaman mengikuti struktur bab ini.</div>"
   }
  ]
 },
 {
  "id": "inf11",
  "judul": "Informatika: Dasar Pemrograman",
  "lit": false,
  "tingkat": 11,
  "mapel": "Informatika",
  "jurusan": "",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 104,
  "gradasi": "linear-gradient(135deg,#7C3AED,#C084FC)",
  "inisial": "IN",
  "deskripsi": "Algoritma, flowchart, variabel dan tipe data — pintu masuk menulis program pertamamu.",
  "rating": 4.8,
  "bab": [
   {
    "judul": "Bab 1 — Algoritma & Flowchart",
    "isi": "\n<p>Algoritma adalah urutan langkah logis dan sistematis untuk menyelesaikan masalah. Program yang baik lahir dari algoritma yang jelas, bukan dari koding yang terburu-buru.</p>\n<h4>Simbol Flowchart Utama</h4>\n<ul><li><b>Terminator</b> (oval): mulai/selesai.</li><li><b>Proses</b> (persegi): langkah perhitungan.</li><li><b>Input/Output</b> (jajar genjang): menerima/menampilkan data.</li><li><b>Keputusan</b> (belah ketupat): pilihan ya/tidak.</li></ul>\n<div class=\"box-c\"><b>Contoh.</b> Algoritma menentukan lulus: mulai → input nilai → apakah nilai ≥ 75? → ya: \"Lulus\", tidak: \"Remedial\" → selesai.</div>"
   },
   {
    "judul": "Bab 2 — Variabel & Tipe Data",
    "isi": "\n<p>Variabel adalah wadah bernama untuk menyimpan data di memori. Setiap variabel punya tipe data yang menentukan jenis isinya.</p>\n<ul><li><b>Integer:</b> bilangan bulat, mis. jumlah siswa = 32.</li><li><b>Float:</b> bilangan desimal, mis. rata-rata = 87,5.</li><li><b>String:</b> teks, mis. nama = \"Andi\".</li><li><b>Boolean:</b> benar/salah, mis. lulus = true.</li></ul>\n<div class=\"box-w\"><b>Ingat!</b> Nama variabel tidak boleh diawali angka dan tidak boleh memakai spasi — gunakan huruf kecil dan garis bawah, mis. <span class=\"rum\">nilai_akhir</span>.</div>"
   }
  ]
 },
 {
  "id": "akl10",
  "judul": "Akuntansi Dasar: Persamaan & Jurnal Umum",
  "lit": false,
  "tingkat": 10,
  "mapel": "Akuntansi",
  "jurusan": "AKL",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 92,
  "gradasi": "linear-gradient(135deg,#059669,#34D399)",
  "inisial": "AK",
  "deskripsi": "Persamaan dasar akuntansi dan pencatatan jurnal umum — fondasi siklus akuntansi perusahaan jasa.",
  "rating": 4.7,
  "bab": [
   {
    "judul": "Bab 1 — Persamaan Dasar Akuntansi",
    "isi": "\n<p>Seluruh pencatatan akuntansi berpijak pada satu persamaan: <span class=\"rum\">Aset = Liabilitas + Ekuitas</span>. Setiap transaksi selalu menjaga keseimbangan persamaan ini.</p>\n<ul><li><b>Aset:</b> sumber daya yang dimiliki (kas, piutang, peralatan).</li><li><b>Liabilitas:</b> kewajiban kepada pihak lain (utang usaha, utang bank).</li><li><b>Ekuitas:</b> hak pemilik atas aset (modal).</li></ul>\n<div class=\"box-c\"><b>Contoh.</b> Pemilik menyetor modal tunai Rp10.000.000 → Kas (aset) bertambah Rp10.000.000 dan Modal (ekuitas) bertambah Rp10.000.000. Persamaan tetap seimbang.</div>"
   },
   {
    "judul": "Bab 2 — Jurnal Umum",
    "isi": "\n<p>Jurnal umum adalah catatan kronologis transaksi dengan sistem berpasangan: setiap transaksi dicatat minimal satu akun di <b>debit</b> dan satu akun di <b>kredit</b>, dengan jumlah yang sama.</p>\n<h4>Aturan Debit–Kredit</h4>\n<ul><li>Aset bertambah → debit; berkurang → kredit.</li><li>Beban bertambah → debit.</li><li>Liabilitas, ekuitas, dan pendapatan bertambah → kredit.</li></ul>\n<div class=\"box-w\"><b>Ingat!</b> Debit berarti sisi kiri, kredit berarti sisi kanan — bukan \"bertambah\" atau \"berkurang\" secara mutlak; tergantung jenis akunnya.</div>"
   }
  ]
 },
 {
  "id": "ing10",
  "judul": "Bahasa Inggris: Descriptive Text",
  "lit": false,
  "tingkat": 10,
  "mapel": "Bahasa Inggris",
  "jurusan": "",
  "pengarang": "Tim Penulis Buku Teks",
  "penerbit": "SIBI Kemendikdasmen",
  "tahun": "2024",
  "halaman": 68,
  "gradasi": "linear-gradient(135deg,#D97706,#FBBF24)",
  "inisial": "EN",
  "deskripsi": "Writing descriptive texts about people, places, and things — with simple present tense and rich adjectives.",
  "rating": 4.5,
  "bab": [
   {
    "judul": "Bab 1 — Structure of Descriptive Text",
    "isi": "\n<p>A descriptive text describes a particular person, place, or thing in detail so the reader can imagine it clearly.</p>\n<h4>Generic Structure</h4>\n<ul><li><b>Identification:</b> introduces what will be described.</li><li><b>Description:</b> describes parts, qualities, and characteristics.</li></ul>\n<div class=\"box-c\"><b>Example.</b> \"Borobudur is a magnificent Buddhist temple in Magelang, Central Java. It has nine stacked platforms and more than 2,600 relief panels.\"</div>"
   },
   {
    "judul": "Bab 2 — Simple Present Tense",
    "isi": "\n<p>Descriptive texts use the simple present tense because they state facts. Pattern: <span class=\"rum\">S + V1 (s/es) + O</span>.</p>\n<ul><li>He/she/it → verb + s/es: \"The library <b>opens</b> at 7 a.m.\"</li><li>I/you/we/they → base verb: \"Students <b>borrow</b> books every week.\"</li></ul>\n<div class=\"box-w\"><b>Practice.</b> Write five sentences describing your school library using the simple present tense.</div>"
   }
  ]
 },
 {
  "id": "lit1",
  "judul": "Cerpen Remaja: Di Balik Jendela Kelas",
  "lit": true,
  "tingkat": 0,
  "mapel": "Literasi",
  "jurusan": "",
  "pengarang": "Antologi Badan Bahasa",
  "penerbit": "SIBI Kemendikdasmen — Buku Nonteks",
  "tahun": "2024",
  "halaman": 64,
  "gradasi": "linear-gradient(135deg,#0369A1,#38BDF8)",
  "inisial": "DC",
  "deskripsi": "Dua cerita pendek tentang persahabatan, keberanian, dan perpustakaan kecil yang mengubah satu sekolah.",
  "rating": 4.8,
  "bab": [
   {
    "judul": "Cerpen 1 — Kursi Kosong di Baris Ketiga",
    "isi": "\n<p>Sudah tiga hari kursi di baris ketiga itu kosong. Pemiliknya, Bima, pindah mengikuti ayahnya yang bertugas ke luar kota. Tidak ada perpisahan besar — hanya selembar kartu ucapan yang dititipkan ke wali kelas, dan nama Bima yang perlahan hilang dari daftar hadir.</p>\n<p>Rani menatap kursi itu setiap pagi. Di laci mejanya, Bima meninggalkan sebuah buku catatan bersampul biru. Di halaman pertama tertulis: \"Untuk siapa pun yang duduk di sini tahun depan — jangan takut bertanya. Kelas ini baik, asal kamu berani menyapa lebih dulu.\"</p>\n<p>Rani tersenyum. Ia teringat hari pertamanya dulu: gugup, tidak kenal siapa-siapa, sampai Bima menggeser kursinya dan berkata, \"Duduk sini aja. Kosong.\" Kalimat sederhana yang membuat sekolah terasa tidak menakutkan lagi.</p>\n<p>Minggu berikutnya, seorang siswa baru masuk kelas mereka. Ia berdiri kikuk di depan pintu. Sebelum guru mempersilakan, Rani sudah menggeser kursinya dan melambaikan tangan. \"Duduk sini aja,\" katanya. \"Kosong.\" Kursi baris ketiga itu akhirnya terisi lagi — dan lingkaran kebaikan Bima berputar satu putaran lagi.</p>\n<div class=\"box-w\"><b>Refleksi.</b> Kebaikan kecil yang diteruskan bisa hidup lebih lama daripada orang yang memulainya. Kebaikan apa yang pernah kamu terima dan bisa kamu teruskan minggu ini?</div>"
   },
   {
    "judul": "Cerpen 2 — Pustakawan Kecil",
    "isi": "\n<p>Setiap jam istirahat, Sinta berlari ke perpustakaan. Bukan untuk membaca — melainkan untuk merapikan. Ia hafal letak semua rak: fiksi di dekat jendela, referensi di belakang meja guru, dan ensiklopedia berat yang jarang disentuh di rak paling bawah.</p>\n<p>\"Kamu tidak bosan?\" tanya petugas perpustakaan, Bu Lastri, suatu siang. Sinta menggeleng. \"Buku yang rapi itu seperti undangan, Bu. Kalau berantakan, orang malas masuk.\"</p>\n<p>Suatu hari Sinta membuat sudut kecil di dekat pintu: sebuah kotak bertuliskan \"Buku Minggu Ini — Pilihan Sinta\". Di dalamnya ia menaruh tiga buku bergantian, lengkap dengan kartu rekomendasi tulisan tangannya. Minggu pertama, ketiga buku itu habis dipinjam. Minggu kedua, antrean mulai terbentuk.</p>\n<p>Akhir semester, kepala sekolah menyerahkan piagam kecil di upacara bendera: \"Untuk Sinta, pustakawan kecil kami.\" Sinta menerimanya dengan mata berkaca-kaca. Ia tidak pernah menulis buku — tetapi berkat dia, satu sekolah membaca lebih banyak buku. Dan baginya, itu sama berharganya.</p>\n<div class=\"box-c\"><b>Catatan.</b> Gerakan literasi tidak selalu dimulai dari hal besar. Satu sudut baca, satu rekomendasi jujur, satu buku yang dirapikan — semuanya adalah awal.</div>"
   }
  ]
 },
 {
  "id": "lit2",
  "judul": "Novel Remaja: Jejak di Ujung Harapan",
  "lit": true,
  "tingkat": 0,
  "mapel": "Literasi",
  "jurusan": "",
  "pengarang": "Ratna Sari",
  "penerbit": "SIBI Kemendikdasmen — Buku Nonteks",
  "tahun": "2024",
  "halaman": 128,
  "gradasi": "linear-gradient(135deg,#065F46,#34D399)",
  "inisial": "JH",
  "deskripsi": "Kisah Galang, anak bengkel kecil di Ujung Harapan, Babelan, yang belajar bahwa mimpi besar pun dirakit satu baut pada satu waktu.",
  "rating": 4.9,
  "bab": [
   {
    "judul": "Bab 1 — Pagi di Ujung Harapan",
    "isi": "\n<p>Jam lima pagi, Ujung Harapan sudah berbunyi. Ayam tetangga, penjual sayur yang lewat, dan — paling khas — denting kunci pas dari bengkel kecil ayah Galang di ujung gang. Bengkel itu tidak punya nama. Orang-orang cukup menyebutnya \"bengkel Pak Darma\", dan itu sudah cukup selama lima belas tahun.</p>\n<p>Galang, lima belas tahun, kelas sepuluh SMK jurusan teknik kendaraan ringan, adalah \"asisten\" tidak resmi di sana. Ia bisa membedakan suara mesin sehat dan mesin batuk hanya dari sekali dengar — bakat yang membuat ayahnya bangga setengah mati, meski tidak pernah diucapkan keras-keras.</p>\n<p>\"Sekolah yang bener, Lang,\" kata ayahnya suatu pagi sambil menyerahkan obeng. \"Tanganmu boleh kotor di sini. Tapi masa depanmu jangan.\" Galang mengangguk. Ia tahu kalimat itu adalah cara ayahnya berkata: aku tidak sempat sekolah tinggi, kamu harus.</p>\n<p>Di perjalanan ke sekolah, melewati sawah dan jembatan kecil di atas kali, Galang mengulang janji yang sama seperti kemarin: semester ini, ia akan masuk tiga besar. Bukan untuk piala. Untuk satu kalimat ayahnya yang belum pernah terucap: \"Anakku bisa.\"</p>"
   },
   {
    "judul": "Bab 2 — Bengkel Kecil Ayah",
    "isi": "\n<p>Sore itu bengkel kedatangan tamu tidak biasa: sebuah motor tua mogok total, dan pemiliknya — Pak Haji pemilik warung kopi — pasrah. \"Kalau tidak bisa hidup lagi, ya sudah, Darma. Sudah tua juga motornya.\"</p>\n<p>Ayah Galang memeriksa dengan sabar: busi, karburator, kabel, aki. Satu jam berlalu. Galang memperhatikan cara ayahnya bekerja — tidak pernah terburu-buru, tidak pernah menyalahkan komponen sebelum memeriksa semuanya satu per satu.</p>\n<p>\"Coba kamu yang dengar,\" kata ayahnya tiba-tiba. Galang menempelkan telinga ke dekat mesin. Ada bunyi kecil yang tidak wajar dari arah karburator. \"Ada yang nyangkut, Yah.\" Ayahnya tersenyum tipis. \"Nah. Telinga itu tidak diajarin di sekolah mana pun. Itu diajarin waktu.\"</p>\n<p>Motor itu akhirnya hidup — meraung pelan, lalu stabil. Pak Haji tertawa lega. Dalam perjalanan pulang mengantar motor itu, Galang berpikir: mungkin ayahnya benar. Sekolah memberinya ilmu. Bengkel kecil itu memberinya cara berpikir. Dan ia beruntung punya keduanya.</p>\n<div class=\"box-w\"><b>Refleksi.</b> Ilmu tidak hanya tinggal di ruang kelas. Pengalaman siapa di sekitarmu yang selama ini diam-diam mengajarimu cara berpikir?</div>"
   }
  ]
 },
 {
  "id": "lit3",
  "judul": "Puisi & Pantun: Suara Anak Negeri",
  "lit": true,
  "tingkat": 0,
  "mapel": "Literasi",
  "jurusan": "",
  "pengarang": "Antologi Badan Bahasa",
  "penerbit": "SIBI Kemendikdasmen — Buku Nonteks",
  "tahun": "2024",
  "halaman": 48,
  "gradasi": "linear-gradient(135deg,#9D174D,#F472B6)",
  "inisial": "SN",
  "deskripsi": "Kumpulan puisi dan pantun bertema sekolah, buku, dan kampung halaman — untuk dibaca, diresapi, dan ditirukan gayanya.",
  "rating": 4.6,
  "bab": [
   {
    "judul": "Bagian 1 — Tiga Puisi",
    "isi": "\n<h4>Sekolahku</h4>\n<p>Di ujung jalan yang berdebu,<br>berdiri sekolahku yang sederhana.<br>Tiangnya kayu, atapnya biru,<br>di dalamnya mimpi berbaris rapi menunggu giliran.</p>\n<p>Guru datang membawa pagi,<br>kami menyambut dengan buku terbuka.<br>Siapa sangka dari kelas sekecil ini,<br>langkah kami kelak menembus kota, bahkan dunia.</p>\n<h4>Buku</h4>\n<p>Kau diam, tapi bercerita.<br>Kau tipis, tapi berisi samudra.<br>Siapa membukamu dengan sabar,<br>pulang membawa cahaya.</p>\n<h4>Hujan di Babelan</h4>\n<p>Hujan turun di atas sawah,<br>kali kecil berlari riang.<br>Anak-anak pulang sekolah tertawa,<br>buku di tas dibungkus plastik — dijaga seperti harta.</p>\n<div class=\"box-c\"><b>Coba tulis.</b> Ambil satu benda di kelasmu — penghapus, jendela, bel sekolah — lalu tulis empat baris puisi tentangnya, meniru gaya puisi \"Buku\" di atas.</div>"
   },
   {
    "judul": "Bagian 2 — Pantun & Maknanya",
    "isi": "\n<p>Pantun adalah puisi lama Melayu: empat baris bersajak a-b-a-b. Dua baris pertama disebut <b>sampiran</b> (pengantar bunyi), dua baris terakhir adalah <b>isi</b> (pesan sesungguhnya).</p>\n<div class=\"box-c\">Pergi ke pasar membeli duku,<br>duku dibeli bersama mangga.<br>Kalau rajin membaca buku,<br>ilmu bertambah, wawasan terbuka.</div>\n<div class=\"box-c\">Anak ayam turun sepuluh,<br>mati satu tinggal sembilan.<br>Belajar jangan setengah-setengah,<br>supaya pandai di masa depan.</div>\n<div class=\"box-c\">Jalan-jalan ke Ujung Harapan,<br>singgah sebentar membeli roti.<br>Hormati guru, sayangi teman,<br>itulah tanda anak berbudi.</div>\n<div class=\"box-w\"><b>Tugas kecil.</b> Buat satu pantun empat baris bertema perpustakaan. Jaga pola sampiran–isi dan sajak a-b-a-b. Tulis di buku catatanmu dan bacakan di depan kelas.</div>"
   }
  ]
 }
]

export const SISWA_CONTOH: SiswaContoh[] = [
 {
  "nis": "20241005",
  "nama": "Andi Pratama",
  "kelas": "XI TKJ 1",
  "tingkat": 11,
  "jurusan": "TKJ"
 },
 {
  "nis": "20251021",
  "nama": "Nadia Putri",
  "kelas": "X TKJ 2",
  "tingkat": 10,
  "jurusan": "TKJ"
 },
 {
  "nis": "20251033",
  "nama": "Rizky Ramadhan",
  "kelas": "X AKL 1",
  "tingkat": 10,
  "jurusan": "AKL"
 }
]
