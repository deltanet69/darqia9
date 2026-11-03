-- 0028_perpus_digital.sql — Perpustakaan Digital Darqia 9 (aplikasi siswa)
-- Jalankan manual di Supabase SQL Editor (pola sama seperti 0025–0027).
--
-- Model data:
--   perpus_buku : katalog buku (metadata SIBI Kemendikdasmen). Semua buku
--                 dibaca DI DALAM aplikasi — tidak ada tautan keluar.
--   perpus_bab  : isi bab per buku (HTML aman seperlunya: paragraf, daftar,
--                 kotak contoh/catatan, rumus) — dirender oleh Reader.
-- Login siswa cukup NIS: diverifikasi server (/api/perpus/login, service
-- role) terhadap tabel students Data Induk — halaman publik TIDAK PERNAH
-- membaca tabel students secara langsung. Progres baca & Rak Saya pada
-- tahap ini tersimpan di perangkat siswa (localStorage per NIS), sesuai
-- desain preview v8 yang dikunci pemilik.
-- Katalog bersifat publik (buku teks SIBI gratis & legal): RLS baca untuk
-- anon + authenticated; tulis tidak dibuka untuk klien (kelola via SQL /
-- dashboard sampai halaman admin katalog dibuat).

create table if not exists public.perpus_buku (
  id text primary key,
  judul text not null,
  lit boolean not null default false,
  tingkat int not null default 0,
  mapel text not null default '',
  jurusan text not null default '',
  pengarang text not null default '',
  penerbit text not null default '',
  tahun text not null default '',
  halaman int not null default 0,
  gradasi text not null default '',
  inisial text not null default '',
  deskripsi text not null default '',
  rating numeric(2,1) not null default 4.7,
  urutan int not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.perpus_bab (
  id bigint generated always as identity primary key,
  buku_id text not null references public.perpus_buku(id) on delete cascade,
  urut int not null,
  judul text not null,
  isi text not null,
  unique (buku_id, urut)
);

create index if not exists perpus_bab_buku_idx on public.perpus_bab (buku_id, urut);

alter table public.perpus_buku enable row level security;
alter table public.perpus_bab enable row level security;

drop policy if exists perpus_buku_baca on public.perpus_buku;
create policy perpus_buku_baca on public.perpus_buku
  for select to anon, authenticated using (true);

drop policy if exists perpus_bab_baca on public.perpus_bab;
create policy perpus_bab_baca on public.perpus_bab
  for select to anon, authenticated using (true);

-- ===== Seed katalog awal: 10 buku SIBI dari preview v8 (dikunci pemilik) =====
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('inf10', 'Informatika: Jaringan Komputer Dasar', false, 10, 'Informatika', '', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 120, 'linear-gradient(135deg,#6D28D9,#A78BFA)', 'IN', 'Fondasi jaringan komputer: konsep, perangkat, pengalamatan IP, dan topologi — bekal awal menuju praktik TKJ.', 4.8, 1) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('inf10', 1, 'Bab 1 — Konsep Jaringan Komputer', '
<p>Jaringan komputer adalah dua atau lebih perangkat yang saling terhubung untuk berbagi data dan sumber daya (printer, file, koneksi internet).</p>
<h4>Manfaat Jaringan</h4>
<ul><li>Berbagi file dan perangkat keras.</li><li>Komunikasi cepat (email, chat, video call).</li><li>Akses internet bersama.</li><li>Sentralisasi data dan keamanan.</li></ul>
<h4>Jenis Berdasarkan Jangkauan</h4>
<ul><li><b>LAN</b> (Local Area Network): satu gedung/ruangan, mis. lab komputer sekolah.</li><li><b>MAN</b> (Metropolitan Area Network): satu kota.</li><li><b>WAN</b> (Wide Area Network): antar kota/negara — internet adalah WAN terbesar.</li></ul>
<div class="box-c"><b>Contoh.</b> 30 PC di lab yang terhubung ke satu switch dan bisa saling berbagi file membentuk sebuah LAN.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('inf10', 2, 'Bab 2 — Perangkat Jaringan', '
<ul><li><b>NIC</b> (Network Interface Card): kartu/antarmuka agar perangkat bisa tersambung ke jaringan.</li><li><b>Kabel UTP:</b> kabel twisted-pair standar LAN; urutan warna mengikuti standar T568A/B.</li><li><b>Switch:</b> menghubungkan banyak perangkat dalam satu LAN, meneruskan data ke port tujuan saja.</li><li><b>Router:</b> menghubungkan antar jaringan berbeda (mis. LAN sekolah ke internet).</li><li><b>Access Point:</b> memancarkan sinyal Wi-Fi agar perangkat nirkabel bisa bergabung.</li></ul>
<h4>Kabel Straight vs Cross</h4>
<p><b>Straight-through:</b> perangkat berbeda jenis (PC–switch). <b>Cross-over:</b> perangkat sejenis (PC–PC, switch–switch). Switch modern umumnya sudah auto-MDIX.</p>
<div class="box-w"><b>Praktik.</b> Identifikasi perangkat di lab sekolahmu: mana switch, mana access point, kabel apa yang dipakai?</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('inf10', 3, 'Bab 3 — IP Address Dasar', '
<p>IP address adalah identitas numerik setiap perangkat di jaringan, mis. <span class="rum">192.168.1.10</span>. IPv4 terdiri dari 32 bit dalam 4 oktet.</p>
<h4>Kelas IP</h4>
<ul><li><b>Kelas A:</b> 1.0.0.0 – 126.x.x.x (jaringan sangat besar).</li><li><b>Kelas B:</b> 128.0.x.x – 191.255.x.x.</li><li><b>Kelas C:</b> 192.0.0.x – 223.255.255.x — paling umum untuk LAN, mis. 192.168.1.0/24.</li></ul>
<h4>Subnet Mask</h4>
<p>Subnet mask memisahkan bagian network dan host. <span class="rum">255.255.255.0</span> (/24) berarti 24 bit pertama adalah alamat network.</p>
<div class="box-c"><b>Contoh.</b> PC ber-IP 192.168.1.10/24 berada di network 192.168.1.0 dan bisa berkomunikasi langsung dengan 192.168.1.11/24.</div>
<div class="box-w"><b>Ingat!</b> Dua perangkat beda network butuh router untuk saling terhubung.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('inf10', 4, 'Bab 4 — Topologi Jaringan', '
<p>Topologi adalah pola hubungan antar perangkat dalam jaringan.</p>
<ul><li><b>Star:</b> semua perangkat ke satu titik pusat (switch). Paling umum; satu kabel putus tidak melumpuhkan yang lain, tapi switch mati = semua mati.</li><li><b>Bus:</b> satu kabel utama (backbone); murah tapi satu gangguan melumpuhkan semua.</li><li><b>Ring:</b> data berputar satu arah; satu titik putus mengganggu aliran.</li><li><b>Mesh:</b> setiap perangkat terhubung ke banyak jalur; paling andal tapi mahal.</li></ul>
<div class="box-c"><b>Studi kasus.</b> Lab sekolah memakai topologi star dengan satu switch 24-port. Jika satu PC kabelnya lepas, 23 PC lain tetap online. Mengapa? Karena tiap PC punya jalur sendiri ke switch.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('tkj10', 'TKJ: Perakitan & Perawatan Komputer', false, 10, 'Teknik Komputer & Jaringan', 'TKJ', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 110, 'linear-gradient(135deg,#0F172A,#475569)', 'TK', 'Panduan praktik merakit PC dari komponen, instalasi dasar, hingga troubleshooting masalah umum.', 4.9, 2) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('tkj10', 1, 'Bab 1 — Komponen Utama PC', '
<ul><li><b>CPU/Prosesor:</b> otak komputer; perhatikan soket (LGA/AM) agar cocok dengan motherboard.</li><li><b>Motherboard:</b> papan utama penghubung semua komponen.</li><li><b>RAM:</b> memori kerja; jenis DDR3/DDR4/DDR5 tidak saling cocok slotnya.</li><li><b>Storage:</b> HDD (murah, besar) vs SSD (cepat); SSD SATA/NVMe.</li><li><b>PSU:</b> catu daya; pilih watt sesuai kebutuhan + sertifikasi 80+.</li><li><b>Casing & pendingin:</b> airflow dan heatsink/fan CPU.</li><li><b>VGA:</b> pengolah grafis; opsional jika CPU punya iGPU.</li></ul>
<div class="box-w"><b>Keselamatan.</b> Cabut kabel power sebelum merakit. Sentuh benda logam (grounding) untuk membuang listrik statis yang bisa merusak komponen.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('tkj10', 2, 'Bab 2 — Langkah Perakitan', '
<ol><li>Siapkan alat: obeng plus, gelang anti-statis, thermal paste.</li><li>Pasang CPU ke soket motherboard (sejajarkan tanda segitiga), kunci tuasnya.</li><li>Oleskan thermal paste tipis, pasang heatsink/fan CPU.</li><li>Pasang RAM ke slot (klik kedua pengunci).</li><li>Pasang motherboard ke casing dengan baut standoff.</li><li>Pasang PSU, sambungkan kabel 24-pin ATX dan 4/8-pin CPU.</li><li>Pasang SSD/HDD dan sambungkan kabel SATA + power.</li><li>Sambungkan kabel front panel (power, reset, LED) sesuai manual.</li><li>Periksa ulang semua sambungan, lalu uji nyala (POST).</li></ol>
<div class="box-c"><b>POST berhasil</b> ditandai satu bunyi <i>beep</i> pendek dan tampil logo BIOS di monitor.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('tkj10', 3, 'Bab 3 — Troubleshooting Dasar', '
<h4>Gejala & Solusi</h4>
<ul><li><b>Mati total:</b> cek kabel power, saklar PSU, stop kontak.</li><li><b>Nyala tapi no display:</b> reseat RAM (cabut-pasang), cek kabel monitor, coba satu keping RAM.</li><li><b>Beep panjang berulang:</b> umumnya masalah RAM — bersihkan kuningan dengan penghapus.</li><li><b>Restart sendiri:</b> cek suhu CPU (pasta kering/kipas mati) dan PSU.</li><li><b>Lambat:</b> cek startup program, kesehatan storage, tambah RAM.</li></ul>
<div class="box-c"><b>Metode.</b> Gunakan eliminasi: uji dengan komponen pengganti yang diketahui bagus, satu per satu, dari yang paling mudah (RAM, kabel) ke yang tersulit.</div>
<div class="box-w"><b>Catat!</b> Teknisi profesional selalu mencatat gejala, tindakan, dan hasil — jadikan kebiasaan mulai sekarang.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('mtk10', 'Matematika: Eksponen & Barisan', false, 10, 'Matematika', '', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 88, 'linear-gradient(135deg,#1B5FD9,#4A9FE8)', 'MT', 'Bilangan berpangkat, bentuk akar, logaritma, serta barisan dan deret aritmetika–geometri untuk kelas X SMK.', 4.7, 3) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('mtk10', 1, 'Bab 1 — Eksponen & Logaritma', '
<p>Eksponen adalah perkalian berulang: <span class="rum">aⁿ = a × a × … × a</span> (n kali). Sifat utama: aᵐ × aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ, dan a⁻ⁿ = 1/aⁿ.</p>
<h4>Logaritma</h4>
<p>Logaritma adalah kebalikan eksponen: <span class="rum">ᵃlog b = c</span> artinya aᶜ = b. Contoh: ²log 8 = 3 karena 2³ = 8.</p>
<div class="box-c"><b>Contoh.</b> ¹⁰log 1000 = 3, karena 10³ = 1000. Logaritma basis 10 sering ditulis tanpa basis: log 1000 = 3.</div>
<div class="box-w"><b>Ingat!</b> Bilangan pokok logaritma harus positif dan tidak sama dengan 1; numerus harus positif.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('mtk10', 2, 'Bab 2 — Barisan & Deret', '
<h4>Barisan Aritmetika</h4>
<p>Selisih antar suku tetap (beda b). Suku ke-n: <span class="rum">Uₙ = a + (n−1)b</span>. Contoh: 3, 7, 11, 15, … → a=3, b=4, U₁₀ = 3 + 9×4 = 39.</p>
<h4>Barisan Geometri</h4>
<p>Rasio antar suku tetap (r). Suku ke-n: <span class="rum">Uₙ = a × rⁿ⁻¹</span>. Contoh: 2, 6, 18, 54, … → a=2, r=3, U₅ = 2 × 3⁴ = 162.</p>
<div class="box-c"><b>Terapan.</b> Bunga bank dan pertumbuhan pelanggan adalah contoh deret geometri dalam kehidupan nyata.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('bind10', 'Bahasa Indonesia: Teks Laporan Hasil Observasi', false, 10, 'Bahasa Indonesia', '', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 76, 'linear-gradient(135deg,#DC2626,#F87171)', 'BI', 'Memahami dan menulis teks laporan hasil observasi: struktur, kaidah kebahasaan, dan langkah penyusunannya.', 4.6, 4) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('bind10', 1, 'Bab 1 — Struktur Teks LHO', '
<p>Teks laporan hasil observasi (LHO) adalah teks yang menyajikan informasi tentang suatu objek berdasarkan pengamatan langsung, bersifat faktual dan objektif.</p>
<h4>Struktur</h4>
<ul><li><b>Pernyataan umum:</b> definisi/gambaran umum objek.</li><li><b>Deskripsi bagian:</b> rincian bagian-bagian objek.</li><li><b>Deskripsi manfaat:</b> kegunaan objek yang diamati.</li></ul>
<div class="box-c"><b>Contoh pembuka.</b> "Kucing adalah mamalia berkaki empat dari keluarga Felidae yang banyak dipelihara manusia sebagai hewan peliharaan."</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('bind10', 2, 'Bab 2 — Kaidah Kebahasaan LHO', '
<ul><li>Menggunakan <b>kata teknis/istilah</b> sesuai bidang objek.</li><li>Menggunakan <b>kopula</b>: adalah, merupakan, yaitu.</li><li>Menggunakan <b>kata benda umum</b> dan frasa nomina.</li><li>Bahasa baku, objektif, tanpa opini pribadi penulis.</li></ul>
<div class="box-w"><b>Tugas.</b> Amati satu objek di lingkungan sekolah (taman, kantin, lab), lalu tulis LHO satu halaman mengikuti struktur bab ini.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('inf11', 'Informatika: Dasar Pemrograman', false, 11, 'Informatika', '', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 104, 'linear-gradient(135deg,#7C3AED,#C084FC)', 'IN', 'Algoritma, flowchart, variabel dan tipe data — pintu masuk menulis program pertamamu.', 4.8, 5) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('inf11', 1, 'Bab 1 — Algoritma & Flowchart', '
<p>Algoritma adalah urutan langkah logis dan sistematis untuk menyelesaikan masalah. Program yang baik lahir dari algoritma yang jelas, bukan dari koding yang terburu-buru.</p>
<h4>Simbol Flowchart Utama</h4>
<ul><li><b>Terminator</b> (oval): mulai/selesai.</li><li><b>Proses</b> (persegi): langkah perhitungan.</li><li><b>Input/Output</b> (jajar genjang): menerima/menampilkan data.</li><li><b>Keputusan</b> (belah ketupat): pilihan ya/tidak.</li></ul>
<div class="box-c"><b>Contoh.</b> Algoritma menentukan lulus: mulai → input nilai → apakah nilai ≥ 75? → ya: "Lulus", tidak: "Remedial" → selesai.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('inf11', 2, 'Bab 2 — Variabel & Tipe Data', '
<p>Variabel adalah wadah bernama untuk menyimpan data di memori. Setiap variabel punya tipe data yang menentukan jenis isinya.</p>
<ul><li><b>Integer:</b> bilangan bulat, mis. jumlah siswa = 32.</li><li><b>Float:</b> bilangan desimal, mis. rata-rata = 87,5.</li><li><b>String:</b> teks, mis. nama = "Andi".</li><li><b>Boolean:</b> benar/salah, mis. lulus = true.</li></ul>
<div class="box-w"><b>Ingat!</b> Nama variabel tidak boleh diawali angka dan tidak boleh memakai spasi — gunakan huruf kecil dan garis bawah, mis. <span class="rum">nilai_akhir</span>.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('akl10', 'Akuntansi Dasar: Persamaan & Jurnal Umum', false, 10, 'Akuntansi', 'AKL', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 92, 'linear-gradient(135deg,#059669,#34D399)', 'AK', 'Persamaan dasar akuntansi dan pencatatan jurnal umum — fondasi siklus akuntansi perusahaan jasa.', 4.7, 6) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('akl10', 1, 'Bab 1 — Persamaan Dasar Akuntansi', '
<p>Seluruh pencatatan akuntansi berpijak pada satu persamaan: <span class="rum">Aset = Liabilitas + Ekuitas</span>. Setiap transaksi selalu menjaga keseimbangan persamaan ini.</p>
<ul><li><b>Aset:</b> sumber daya yang dimiliki (kas, piutang, peralatan).</li><li><b>Liabilitas:</b> kewajiban kepada pihak lain (utang usaha, utang bank).</li><li><b>Ekuitas:</b> hak pemilik atas aset (modal).</li></ul>
<div class="box-c"><b>Contoh.</b> Pemilik menyetor modal tunai Rp10.000.000 → Kas (aset) bertambah Rp10.000.000 dan Modal (ekuitas) bertambah Rp10.000.000. Persamaan tetap seimbang.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('akl10', 2, 'Bab 2 — Jurnal Umum', '
<p>Jurnal umum adalah catatan kronologis transaksi dengan sistem berpasangan: setiap transaksi dicatat minimal satu akun di <b>debit</b> dan satu akun di <b>kredit</b>, dengan jumlah yang sama.</p>
<h4>Aturan Debit–Kredit</h4>
<ul><li>Aset bertambah → debit; berkurang → kredit.</li><li>Beban bertambah → debit.</li><li>Liabilitas, ekuitas, dan pendapatan bertambah → kredit.</li></ul>
<div class="box-w"><b>Ingat!</b> Debit berarti sisi kiri, kredit berarti sisi kanan — bukan "bertambah" atau "berkurang" secara mutlak; tergantung jenis akunnya.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('ing10', 'Bahasa Inggris: Descriptive Text', false, 10, 'Bahasa Inggris', '', 'Tim Penulis Buku Teks', 'SIBI Kemendikdasmen', '2024', 68, 'linear-gradient(135deg,#D97706,#FBBF24)', 'EN', 'Writing descriptive texts about people, places, and things — with simple present tense and rich adjectives.', 4.5, 7) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('ing10', 1, 'Bab 1 — Structure of Descriptive Text', '
<p>A descriptive text describes a particular person, place, or thing in detail so the reader can imagine it clearly.</p>
<h4>Generic Structure</h4>
<ul><li><b>Identification:</b> introduces what will be described.</li><li><b>Description:</b> describes parts, qualities, and characteristics.</li></ul>
<div class="box-c"><b>Example.</b> "Borobudur is a magnificent Buddhist temple in Magelang, Central Java. It has nine stacked platforms and more than 2,600 relief panels."</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('ing10', 2, 'Bab 2 — Simple Present Tense', '
<p>Descriptive texts use the simple present tense because they state facts. Pattern: <span class="rum">S + V1 (s/es) + O</span>.</p>
<ul><li>He/she/it → verb + s/es: "The library <b>opens</b> at 7 a.m."</li><li>I/you/we/they → base verb: "Students <b>borrow</b> books every week."</li></ul>
<div class="box-w"><b>Practice.</b> Write five sentences describing your school library using the simple present tense.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('lit1', 'Cerpen Remaja: Di Balik Jendela Kelas', true, 0, 'Literasi', '', 'Antologi Badan Bahasa', 'SIBI Kemendikdasmen — Buku Nonteks', '2024', 64, 'linear-gradient(135deg,#0369A1,#38BDF8)', 'DC', 'Dua cerita pendek tentang persahabatan, keberanian, dan perpustakaan kecil yang mengubah satu sekolah.', 4.8, 8) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('lit1', 1, 'Cerpen 1 — Kursi Kosong di Baris Ketiga', '
<p>Sudah tiga hari kursi di baris ketiga itu kosong. Pemiliknya, Bima, pindah mengikuti ayahnya yang bertugas ke luar kota. Tidak ada perpisahan besar — hanya selembar kartu ucapan yang dititipkan ke wali kelas, dan nama Bima yang perlahan hilang dari daftar hadir.</p>
<p>Rani menatap kursi itu setiap pagi. Di laci mejanya, Bima meninggalkan sebuah buku catatan bersampul biru. Di halaman pertama tertulis: "Untuk siapa pun yang duduk di sini tahun depan — jangan takut bertanya. Kelas ini baik, asal kamu berani menyapa lebih dulu."</p>
<p>Rani tersenyum. Ia teringat hari pertamanya dulu: gugup, tidak kenal siapa-siapa, sampai Bima menggeser kursinya dan berkata, "Duduk sini aja. Kosong." Kalimat sederhana yang membuat sekolah terasa tidak menakutkan lagi.</p>
<p>Minggu berikutnya, seorang siswa baru masuk kelas mereka. Ia berdiri kikuk di depan pintu. Sebelum guru mempersilakan, Rani sudah menggeser kursinya dan melambaikan tangan. "Duduk sini aja," katanya. "Kosong." Kursi baris ketiga itu akhirnya terisi lagi — dan lingkaran kebaikan Bima berputar satu putaran lagi.</p>
<div class="box-w"><b>Refleksi.</b> Kebaikan kecil yang diteruskan bisa hidup lebih lama daripada orang yang memulainya. Kebaikan apa yang pernah kamu terima dan bisa kamu teruskan minggu ini?</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('lit1', 2, 'Cerpen 2 — Pustakawan Kecil', '
<p>Setiap jam istirahat, Sinta berlari ke perpustakaan. Bukan untuk membaca — melainkan untuk merapikan. Ia hafal letak semua rak: fiksi di dekat jendela, referensi di belakang meja guru, dan ensiklopedia berat yang jarang disentuh di rak paling bawah.</p>
<p>"Kamu tidak bosan?" tanya petugas perpustakaan, Bu Lastri, suatu siang. Sinta menggeleng. "Buku yang rapi itu seperti undangan, Bu. Kalau berantakan, orang malas masuk."</p>
<p>Suatu hari Sinta membuat sudut kecil di dekat pintu: sebuah kotak bertuliskan "Buku Minggu Ini — Pilihan Sinta". Di dalamnya ia menaruh tiga buku bergantian, lengkap dengan kartu rekomendasi tulisan tangannya. Minggu pertama, ketiga buku itu habis dipinjam. Minggu kedua, antrean mulai terbentuk.</p>
<p>Akhir semester, kepala sekolah menyerahkan piagam kecil di upacara bendera: "Untuk Sinta, pustakawan kecil kami." Sinta menerimanya dengan mata berkaca-kaca. Ia tidak pernah menulis buku — tetapi berkat dia, satu sekolah membaca lebih banyak buku. Dan baginya, itu sama berharganya.</p>
<div class="box-c"><b>Catatan.</b> Gerakan literasi tidak selalu dimulai dari hal besar. Satu sudut baca, satu rekomendasi jujur, satu buku yang dirapikan — semuanya adalah awal.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('lit2', 'Novel Remaja: Jejak di Ujung Harapan', true, 0, 'Literasi', '', 'Ratna Sari', 'SIBI Kemendikdasmen — Buku Nonteks', '2024', 128, 'linear-gradient(135deg,#065F46,#34D399)', 'JH', 'Kisah Galang, anak bengkel kecil di Ujung Harapan, Babelan, yang belajar bahwa mimpi besar pun dirakit satu baut pada satu waktu.', 4.9, 9) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('lit2', 1, 'Bab 1 — Pagi di Ujung Harapan', '
<p>Jam lima pagi, Ujung Harapan sudah berbunyi. Ayam tetangga, penjual sayur yang lewat, dan — paling khas — denting kunci pas dari bengkel kecil ayah Galang di ujung gang. Bengkel itu tidak punya nama. Orang-orang cukup menyebutnya "bengkel Pak Darma", dan itu sudah cukup selama lima belas tahun.</p>
<p>Galang, lima belas tahun, kelas sepuluh SMK jurusan teknik kendaraan ringan, adalah "asisten" tidak resmi di sana. Ia bisa membedakan suara mesin sehat dan mesin batuk hanya dari sekali dengar — bakat yang membuat ayahnya bangga setengah mati, meski tidak pernah diucapkan keras-keras.</p>
<p>"Sekolah yang bener, Lang," kata ayahnya suatu pagi sambil menyerahkan obeng. "Tanganmu boleh kotor di sini. Tapi masa depanmu jangan." Galang mengangguk. Ia tahu kalimat itu adalah cara ayahnya berkata: aku tidak sempat sekolah tinggi, kamu harus.</p>
<p>Di perjalanan ke sekolah, melewati sawah dan jembatan kecil di atas kali, Galang mengulang janji yang sama seperti kemarin: semester ini, ia akan masuk tiga besar. Bukan untuk piala. Untuk satu kalimat ayahnya yang belum pernah terucap: "Anakku bisa."</p>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('lit2', 2, 'Bab 2 — Bengkel Kecil Ayah', '
<p>Sore itu bengkel kedatangan tamu tidak biasa: sebuah motor tua mogok total, dan pemiliknya — Pak Haji pemilik warung kopi — pasrah. "Kalau tidak bisa hidup lagi, ya sudah, Darma. Sudah tua juga motornya."</p>
<p>Ayah Galang memeriksa dengan sabar: busi, karburator, kabel, aki. Satu jam berlalu. Galang memperhatikan cara ayahnya bekerja — tidak pernah terburu-buru, tidak pernah menyalahkan komponen sebelum memeriksa semuanya satu per satu.</p>
<p>"Coba kamu yang dengar," kata ayahnya tiba-tiba. Galang menempelkan telinga ke dekat mesin. Ada bunyi kecil yang tidak wajar dari arah karburator. "Ada yang nyangkut, Yah." Ayahnya tersenyum tipis. "Nah. Telinga itu tidak diajarin di sekolah mana pun. Itu diajarin waktu."</p>
<p>Motor itu akhirnya hidup — meraung pelan, lalu stabil. Pak Haji tertawa lega. Dalam perjalanan pulang mengantar motor itu, Galang berpikir: mungkin ayahnya benar. Sekolah memberinya ilmu. Bengkel kecil itu memberinya cara berpikir. Dan ia beruntung punya keduanya.</p>
<div class="box-w"><b>Refleksi.</b> Ilmu tidak hanya tinggal di ruang kelas. Pengalaman siapa di sekitarmu yang selama ini diam-diam mengajarimu cara berpikir?</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_buku (id, judul, lit, tingkat, mapel, jurusan, pengarang, penerbit, tahun, halaman, gradasi, inisial, deskripsi, rating, urutan) values ('lit3', 'Puisi & Pantun: Suara Anak Negeri', true, 0, 'Literasi', '', 'Antologi Badan Bahasa', 'SIBI Kemendikdasmen — Buku Nonteks', '2024', 48, 'linear-gradient(135deg,#9D174D,#F472B6)', 'SN', 'Kumpulan puisi dan pantun bertema sekolah, buku, dan kampung halaman — untuk dibaca, diresapi, dan ditirukan gayanya.', 4.6, 10) on conflict (id) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('lit3', 1, 'Bagian 1 — Tiga Puisi', '
<h4>Sekolahku</h4>
<p>Di ujung jalan yang berdebu,<br>berdiri sekolahku yang sederhana.<br>Tiangnya kayu, atapnya biru,<br>di dalamnya mimpi berbaris rapi menunggu giliran.</p>
<p>Guru datang membawa pagi,<br>kami menyambut dengan buku terbuka.<br>Siapa sangka dari kelas sekecil ini,<br>langkah kami kelak menembus kota, bahkan dunia.</p>
<h4>Buku</h4>
<p>Kau diam, tapi bercerita.<br>Kau tipis, tapi berisi samudra.<br>Siapa membukamu dengan sabar,<br>pulang membawa cahaya.</p>
<h4>Hujan di Babelan</h4>
<p>Hujan turun di atas sawah,<br>kali kecil berlari riang.<br>Anak-anak pulang sekolah tertawa,<br>buku di tas dibungkus plastik — dijaga seperti harta.</p>
<div class="box-c"><b>Coba tulis.</b> Ambil satu benda di kelasmu — penghapus, jendela, bel sekolah — lalu tulis empat baris puisi tentangnya, meniru gaya puisi "Buku" di atas.</div>') on conflict (buku_id, urut) do nothing;
insert into public.perpus_bab (buku_id, urut, judul, isi) values ('lit3', 2, 'Bagian 2 — Pantun & Maknanya', '
<p>Pantun adalah puisi lama Melayu: empat baris bersajak a-b-a-b. Dua baris pertama disebut <b>sampiran</b> (pengantar bunyi), dua baris terakhir adalah <b>isi</b> (pesan sesungguhnya).</p>
<div class="box-c">Pergi ke pasar membeli duku,<br>duku dibeli bersama mangga.<br>Kalau rajin membaca buku,<br>ilmu bertambah, wawasan terbuka.</div>
<div class="box-c">Anak ayam turun sepuluh,<br>mati satu tinggal sembilan.<br>Belajar jangan setengah-setengah,<br>supaya pandai di masa depan.</div>
<div class="box-c">Jalan-jalan ke Ujung Harapan,<br>singgah sebentar membeli roti.<br>Hormati guru, sayangi teman,<br>itulah tanda anak berbudi.</div>
<div class="box-w"><b>Tugas kecil.</b> Buat satu pantun empat baris bertema perpustakaan. Jaga pola sampiran–isi dan sajak a-b-a-b. Tulis di buku catatanmu dan bacakan di depan kelas.</div>') on conflict (buku_id, urut) do nothing;

notify pgrst, 'reload schema';
