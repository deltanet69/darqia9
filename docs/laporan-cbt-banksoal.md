# Laporan penyesuaian bank soal CBT

Tanggal: 27 Oktober 2026. Acuan yang dibaca lengkap: `AGENTS.md` dan `docs/Admin Portal/CBT/cbt_banksoal.md` (berkas brief tidak berada langsung di `docs/`).

Implementasi lokal tersedia, tanpa dependensi baru dan tanpa push. Migrasi Supabase sudah terdeteksi setelah diterapkan owner; pengujian transaksi dengan akun staf dan pemeriksaan visual browser masih belum terverifikasi. Cabang cadangan awal: `backup/cbt-banksoal-20261027`, dari commit `383dfac`; commit penanda sebelum perubahan: `18c1f48`. Sebelum tindak lanjut monitoring, seluruh pekerjaan awal disimpan dalam commit `13df833` dan cabang `backup/cbt-monitoring-20261027`.

## Perubahan

- OCR sekarang menyebut tepat empat properti JSON dalam prompt. Sebelumnya objek skema hanya dideklarasikan tanpa dikirim, dan penyedia sempat mengembalikan `transkripsi` alih-alih `text`, sehingga endpoint membalas 502. Parser menerima JSON biasa, pembungkus Markdown, dan satu lapis serialisasi tambahan. Isi rumus dan harakat tidak ditulis ulang oleh parser.
- Validasi rumus mencakup seluruh penanda, rumus polos yang tertinggal di luar penanda, dan hasil percobaan ulang. Hasil yang masih tidak valid ditolak dengan 422. Rumus tetap LTR di dalam soal RTL. Field Arab dan pratinjau memakai font serif yang mendukung Arab serta jarak baris untuk harakat.
- Pembuatan soal baru menyediakan PG, Esai, dan Interaktif. Soal lama `Isian` tetap disimpan dan dapat dibaca. Perubahan meliputi AdminV2 CBT, LMS, drawer, portal admin lama, parser impor, dan kedua template Word.
- Jadwal ujian mendukung centang per soal, pilih semua, jumlah terpilih, serta tombol Naik/Turun. Membuka ulang edit memulihkan pilihan dan urutan. Pilihan kosong tidak boleh disimpan. Kegagalan memuat soal memiliki aksi muat ulang.
- Metadata ujian dan relasinya disimpan dalam satu transaksi. Penyimpanan bank juga atomik dan mempertahankan UUID soal; menghapus soal yang masih dipilih ujian ditolak. Jalur penyimpanan portal lama memakai fungsi penyimpanan yang sama.
- Player siswa mengambil soal berdasarkan NIS aktif, token, jenjang, rombel, dan waktu ujian pada data Supabase yang sudah ada. Player tidak lagi memilih paket pertama atau memakai soal contoh sebagai cadangan. Identitas konfirmasi dan durasi memakai respons server. Kunci jawaban/rubrik tidak dikirim kepada siswa.
- Label membedakan `Bank Soal CBT (PTS/PAS)` dan `Bank Soal LMS (ujian harian)`. Tabel, relasi, dan state kedua sumber tetap terpisah.

Pemuatan soal ini bukan implementasi seluruh brief login siswa: keanggotaan ruang/assignment, sesi autentikasi ujian, autosave jawaban server, PIN pengawas, monitoring, dan nilai resmi tetap pekerjaan brief masing-masing. Kelayakan pemuatan soal pada perubahan ini mengikuti siswa aktif dalam rombel ujian. Tampilan hasil AdminV2 masih memakai sumber hasil contoh yang sudah ada; perubahan di sana hanya mengganti teks esai hardcoded dengan render `essayAnswers` melalui KaTeX/RTL.

## Bukti uji

Keempat PNG berikut adalah gambar contoh untuk pengujian, bukan data sekolah. Semua dikirim ke endpoint aplikasi `/api/cbt/ocr`, dengan penyedia OCR sebenarnya; pengambilan akhir menghasilkan HTTP 200 untuk keempatnya. JSON disimpan sebagai byte UTF-8 asli.

| Sampel | Gambar sumber | Respons OCR | Render komponen editor dan siswa |
| --- | --- | --- | --- |
| Matematika | [matematika.png](bukti-cbt-banksoal/matematika.png) | [matematika-ocr.json](bukti-cbt-banksoal/matematika-ocr.json) | [matematika-render.html](bukti-cbt-banksoal/matematika-render.html) |
| Fisika | [fisika.png](bukti-cbt-banksoal/fisika.png) | [fisika-ocr.json](bukti-cbt-banksoal/fisika-ocr.json) | [fisika-render.html](bukti-cbt-banksoal/fisika-render.html) |
| Biologi | [biologi.png](bukti-cbt-banksoal/biologi.png) | [biologi-ocr.json](bukti-cbt-banksoal/biologi-ocr.json) | [biologi-render.html](bukti-cbt-banksoal/biologi-render.html) |
| Arab | [arab.png](bukti-cbt-banksoal/arab.png) | [arab-ocr.json](bukti-cbt-banksoal/arab-ocr.json) | [arab-render.html](bukti-cbt-banksoal/arab-render.html) |

Pemeriksaan SSR menggunakan komponen Vue editor dan layar siswa yang sebenarnya. Ketiga rumus menghasilkan elemen KaTeX tanpa `katex-error`; matematika/fisika memiliki pecahan `mfrac`, biologi memiliki indeks `msupsub`. Teks Arab cocok dengan sumber setelah normalisasi Unicode NFC: `قُلْ هُوَ اللَّهُ أَحَدٌ`. Field dan render memiliki `dir="rtl"`; rumus di dalamnya memiliki `dir="ltr"`.

HTML tersebut merupakan bukti render SSR, bukan tangkapan layar browser. Stylesheet lokalnya tersedia setelah `npm run build`. Pemeriksaan visual desktop, lebar 360 px, interaksi pointer, dan tampilan Word belum dapat diverifikasi: Computer Use dihentikan karena tidak dapat memastikan URL Chrome pada Windows. Tidak ada klaim lulus visual untuk pemeriksaan tersebut.

[Hasil pemeriksaan otomatis](bukti-cbt-banksoal/hasil-uji.json) juga mencatat:

- Parser OCR dan percobaan ulang/penolakan rumus tidak valid.
- Impor kedua template Word: hanya PG, Esai, dan Interaktif; opsi interaktif 4 untuk SMP dan 5 untuk SMK.
- Pemilihan subset dan urutan, pemulihan edit, serta payload RPC.
- Player hanya memuat urutan subset dalam respons server; `Isian` lama tetap menjadi `short`.
- Penyimpanan LMS menggunakan namespace/tabel LMS.

Pengujian relasi, pemuatan siswa, dan pemisahan tabel pada pemeriksaan otomatis memakai Supabase/respons server tiruan dalam proses uji. Tidak ada siswa contoh atau data pengujian yang ditulis ke Supabase. Pengujian ini tidak menggantikan uji transaksi/RLS pada database asli.

Perintah mengulang pemeriksaan lokal (Node 24):

Hasil akhir: `npm run build` lulus (kode keluar 0), `node tests/cbt-banksoal.mjs` lulus, dan `git diff --check` lulus. Build masih mengeluarkan peringatan lama tentang `/bgdarqia.png` serta deprecation pemetaan package; tidak ada kegagalan kompilasi. Pemeriksaan tipe TypeScript terpisah tidak dijalankan.

```powershell
npm run dev -- --host 127.0.0.1
# Terminal lain, memanggil layanan OCR sebenarnya:
powershell -NoProfile -File tests/cbt-ocr.ps1
node tests/cbt-banksoal.mjs
npm run build
git diff --check
```

## Nilai dan label yang disembunyikan

| Lokasi | Nilai persis yang ditutup dari pembuatan |
| --- | --- |
| Langkah AdminV2 | `{ id: 'Isian', label: 'Jawaban Singkat', shortLabel: 'Isian' }` |
| Drawer AdminV2 | `formFormat = 'Isian'`, tombol berlabel `Isian` |
| Portal admin lama | `formActiveStep = 'Isian'`, label `2. Jawaban Singkat`, pembuat/tombol tambah Isian |
| Pilihan jawaban interaktif portal lama | `interactiveAnswerType = 'Isian'`, label `Jawaban Singkat` |
| Impor | Alias normalisasi `ISIAN` dan `JAWABANSINGKAT`; `JENIS_JAWABAN: Isian` juga ditolak untuk impor baru |
| Template Word SMP/SMK | Blok `TIPE: Isian` dihapus; `JENIS_JAWABAN: Isian` diganti `JENIS_JAWABAN: PG` dengan pilihan jawaban |

Tipe `BankQuestionItem['type'] = 'Isian'`, `interactiveAnswerType = 'Isian'`, dan tipe player `short` tetap tersedia untuk data lama. Filter/badge/rincian pembacaan soal lama dapat tetap menampilkan label tersebut. Enum/check constraint lama tidak dihapus.

## Migrasi

Berkas: [0014_pilihan_soal_ujian.sql](../supabase/migrations/0014_pilihan_soal_ujian.sql). Tautan ini memuat SQL lengkap yang perlu diterapkan; migrasi tidak menghapus atau mengisi data siswa.

| Isi | Rincian |
| --- | --- |
| `exam_questions` | `exam_id` FK ke `exams` dengan cascade saat ujian dihapus; `question_id` FK ke `questions` dengan restrict saat soal dihapus; `position` bilangan positif. PK `(exam_id, question_id)`, unique `(exam_id, position)`. |
| `ujian_harian_exam_questions` | Struktur sama, FK khusus `ujian_harian` dan `ujian_harian_questions`. |
| RLS | Kedua relasi hanya dikelola staf melalui `public.is_staff()`. |
| `validate_exam_question_bank()` | Trigger memastikan soal berasal dari bank ujian sumber yang benar. |
| `save_assessment_exam(source, exam_data, question_ids)` | RPC security invoker; validasi bank, soal, duplikasi, minimal satu pilihan, dan ujian yang sudah dikerjakan; simpan metadata + urutan atomik. Akses authenticated, tetap wajib staf/RLS. |
| `save_assessment_bank(source, bank_data, question_data)` | RPC security invoker; upsert soal dengan UUID tetap, renumerasi aman untuk unique LMS, pertahankan Isian lama, tolak pembuatan Isian baru lewat RPC, serta rollback jika penghapusan melanggar relasi ujian. |
| `load_student_exam_questions(student_nis, exam_code, target_grade, source)` | RPC security definer terbatas; validasi siswa aktif, token, rombel/jenjang dan waktu. Mengembalikan subset berurutan atau seluruh bank bila relasi kosong. Hasil tidak memuat `answer_key`, `rubric`, atau `rubric_score`. Dapat dipanggil anon/authenticated dengan NIS + token yang cocok. |

Setelah owner menerapkan migrasi, pemeriksaan `load_student_exam_questions` tidak lagi mengembalikan `PGRST202`. Permintaan dengan NIS/token kosong ditolak HTTP 400 / `P0001`, sesuai validasi fungsi. Pengujian simpan subset dengan akun staf belum dilakukan; kunci workspace berjenis `anon`.

## Tindak lanjut monitoring dan data asli

Temuan tangkapan layar: rombel, jumlah siswa aktif, daftar bank, dan jadwal sudah dibaca dari Supabase. Label `Preview UI · data contoh dari repo`, angka tetap `4 Format`, dan status `Selesai` untuk rombel tanpa ujian masih menyesatkan. Monitoring juga masih mengisi peserta dari `INITIAL_LIVE_STUDENTS` dan menyembunyikan seluruh kerangka jika tidak ada ujian.

Perbaikan:

- Monitoring selalu menampilkan rel sesi, kartu ringkasan, dan tabel aktivitas. Tanpa ujian, nilainya `-`; status tidak menjadi `Berlangsung` atau `Selesai` secara otomatis.
- Sesi yang tersimpan (terjadwal, berlangsung, atau selesai) dapat dipilih. Peserta diambil dari `exam_assignments` dan `students`. Jika belum ada penugasan, daftar memakai siswa aktif pada rombel ujian. LMS tetap memakai tabel `ujian_harian_*`.
- Progres hanya menghitung jawaban tidak kosong pada soal ujian terpilih dari `exam_answers`. Jumlah pelanggaran berasal dari `exam_violations`. Aktivitas terakhir berasal dari waktu mulai, simpan jawaban, pengumpulan, atau pelanggaran yang benar-benar tersimpan.
- Data diperbarui setiap 15 detik saat tab monitoring aktif. Pemuatan, kegagalan koneksi, dan data kosong dibedakan. Mengganti jenjang/sesi membersihkan peserta sesi sebelumnya; pembaruan sesi yang sama mempertahankan drawer rincian yang sedang dibuka.
- Aksi buka kunci, kirim peringatan, dan paksa submit yang sebelumnya hanya mengubah state simulasi dihapus dari monitoring. Tidak ada pesan sukses palsu atau penulisan simulasi ke data asli.
- Kartu daftar ujian memakai status/jumlah jadwal/mapel/pelanggaran yang tersimpan. Jumlah siswa aktif diberi label `siswa aktif`, bukan dianggap sebagai peserta suatu ujian yang belum ada.
- Jumlah format bank dihitung dari jenis soal yang tersimpan, termasuk dukungan baca `Isian` lama; tanpa soal tampil `-`. Tidak ada angka `4` tetap. Label preview di header dihapus.
- Fallback yang menyalin data contoh guru ke tabel `teachers` saat data kosong dihapus. Memuat halaman hanya membaca data.

Progres monitoring mengikuti jawaban yang tersimpan di database. Perubahan ini tidak menambahkan autosave server pada player siswa; pekerjaan tersebut tetap mengikuti brief login/pengiriman jawaban yang terpisah.

Uji tambahan melalui `node tests/cbt-banksoal.mjs` mencakup data peserta/progres/pelanggaran, jawaban kosong dan soal di luar pilihan, siswa rombel tanpa penugasan, kegagalan query, pergantian jenjang, status rombel kosong, serta jumlah format bank kosong/terisi. Data uji hanya berada di memori. [Bukti struktur monitoring kosong melalui SSR](bukti-cbt-banksoal/monitoring-kosong-render.html) memastikan kartu dan tabel tetap ada. Pemeriksaan visual browser tetap belum diklaim lulus.

Uji manual tindak lanjut: buka `/adminV2/cbt?tab=monitoring&jenjang=smk`, pastikan kerangka tampil dengan `-` jika belum ada ujian; saat jadwal tersedia, pilih sesi dan cocokkan peserta/progres dengan data tersimpan. Buka `/adminV2/cbt?tab=exams` untuk memastikan rombel tanpa jadwal berstatus `-`, lalu `/adminV2/cbt?tab=bank` untuk memastikan jumlah format mengikuti isi bank. Ulangi untuk SMP dan `/adminV2/lms`. Pada lebar 360 px, periksa pembungkusan filter dan kartu peserta.

Berkas tindak lanjut: `CbtV2Monitoring.vue`, `CbtV2Exams.vue`, `CbtV2Bank.vue`, `CbtV2Header.vue`, `CbtV2PageContent.vue`, dan `cbtV2Data.ts` di `app/components/adminV2/cbt/`; `app/composables/useAdminCbtData.ts`; `tests/cbt-banksoal.mjs`; laporan dan bukti SSR ini. Tidak ada migrasi atau dependensi tambahan.

## Pembaruan daftar bank soal opsi PG dan verifikasi OCR

Cadangan sebelum perubahan: commit `82d1116`, cabang `backup/bank-soal-crud-20261027`. Tanpa dependensi baru dan tanpa push.

- Klik tab Bank Soal selalu membuka daftar bank pada jenjang aktif, termasuk saat tab yang sama diklik ulang. Daftar menyediakan pencarian, filter kelas, jumlah soal, penyusun, tanggal pembaruan, komposisi soal, serta aksi Lihat/Ubah/Hapus. Tampilan mobile menggunakan kartu.
- Form hanya dibuka melalui **Buat Bank Soal**, **Ubah**, atau **Lanjutkan draf**. Draf tidak dipulihkan otomatis. Draf dipisahkan menurut sumber CBT/LMS dan SMP/SMK. Pergantian jenjang membuat instance form baru sehingga pilihan lama tidak ikut terbawa.
- Mata pelajaran pembuatan mengikuti relasi `class_schedules` aktif pada kelas yang dipilih. Tidak ada pengisian mapel tebakan bila jadwal kelas belum dipetakan. Bank lama mempertahankan identitas kelas/mapelnya saat diedit; kedua field dikunci untuk menjaga relasi ujian.
- Daftar, rincian, penyimpanan, impor, dan penghapusan dibatasi oleh jenjang aktif. Payload kelas/mapel yang tidak sejenjang ditolak. Penghapusan juga menyaring kolom `grade` dan memeriksa hasil penghapusan agar tidak menampilkan sukses palsu.
- Pilihan ganda baru: **SMP A–D (4)**, **SMK A–E (5)**. Aturan berlaku di form serta validasi penyimpanan. Opsi harus terisi dan kunci harus merujuk opsi yang tersedia. Form lama dinormalisasi saat dibuka untuk edit, tanpa mengubah data tersimpan sebelum guru menyimpan.

Pembaruan OCR:

- PNG/JPEG/WebP sampai 700 KB dikirim sebagai gambar asli, tanpa kompresi ulang. Gambar lebih besar memakai batas dimensi 2400 px untuk menjaga detail. Permintaan pembacaan menggunakan detail tinggi.
- Hasil dibaca oleh dua model penyedia yang sama: `glm-5.3-flash` dan `deepseek-v4-flash-vision-exp`. Daftar model dikonfirmasi melalui endpoint `/v1/models` penyedia; tidak ada layanan atau dependensi baru.
- Prompt melarang melengkapi ayat dari hafalan atau menambah tanda waqaf/harakat yang tidak terlihat. Uji awal memang menemukan model menambah waqaf pada gambar uji yang tidak memilikinya.
- Dua hasil dibandingkan dengan normalisasi Unicode NFC, spasi, dan variasi LaTeX terbatas yang setara. Harakat tidak dibuang dalam pembandingan. Normalisasi tidak menulis ulang teks hasil ekstraksi.
- Perbedaan bacaan, penanda `[tidak terbaca]`, atau rumus tidak valid ditolak dengan HTTP 422. Teks utama tidak diubah. Hasil dari gambar lama juga tidak disisipkan bila gambar atau teks sudah berubah saat permintaan masih berjalan. Catatan kegagalan tetap terlihat di bawah gambar.

Uji penyedia sebenarnya: [hasil pembacaan ganda](bukti-cbt-banksoal/ocr-verifikasi-ganda.json) dan [pengujian akhir matematika serta Arab](bukti-cbt-banksoal/ocr-verifikasi-ganda-terakhir.json). Matematika dan Arab tiga baris memperoleh HTTP 200 pada pengujian akhir; fisika dan biologi memperoleh HTTP 200 pada putaran sebelumnya. Arab pendek memperoleh HTTP 422 karena dua pembacaan tidak identik. **Ini membuktikan penolakan hasil meragukan, bukan jaminan bahwa semua gambar akan berhasil ditranskripsi.**

[Gambar Arab panjang](bukti-cbt-banksoal/arab-panjang.png) dibuat untuk uji dengan teks yang terlihat pada tangkapan layar owner, bukan berkas unggahan asli owner. Hasil akhirnya cocok dengan teks sumber setelah normalisasi NFC dan spasi, termasuk harakat; [render editor RTL](bukti-cbt-banksoal/arab-panjang-render.html) diverifikasi melalui komponen editor sebenarnya. Tangkapan layar asli owner belum diuji sebagai berkas gambar terpisah.

Tes otomatis diperluas untuk daftar awal meskipun ada draf, isolasi draf SMP/SMK, penyaringan daftar/rincian lintas jenjang, mapel sesuai kelas, penolakan simpan/hapus lintas jenjang, opsi SMP 4/SMK 5, perbedaan harakat, hasil OCR tidak terbaca, dan respons dari gambar kedaluwarsa. Perintah: `node tests/cbt-banksoal.mjs`. Pengujian CRUD memakai data tiruan dalam memori; tidak menulis data uji ke Supabase. Pemeriksaan visual browser dan transaksi menggunakan akun staf asli belum diklaim lulus.

### Migrasi yang perlu dijalankan nanti

Owner memilih menerapkan migrasi tambahan kemudian. Jalankan [0015_validasi_jenjang_bank_soal.sql](../supabase/migrations/0015_validasi_jenjang_bank_soal.sql) untuk mengaktifkan:

1. Larangan mengubah jenjang bank/ujian yang sudah ada, untuk CBT dan LMS.
2. Validasi jumlah, urutan, isi, dan kunci opsi PG (termasuk jawaban PG interaktif) pada penulisan soal berikutnya.
3. Validasi mata pelajaran sesuai jadwal kelas untuk bank baru. Identitas bank lama yang tidak berubah tetap dapat dipertahankan.

Migrasi tidak menghapus atau menulis ulang soal lama. Validasi antarmuka sudah ada, tetapi trigger tambahan tersebut **belum aktif sebelum migrasi 0015 diterapkan**.

Uji manual: buka `/adminV2/cbt?tab=bank&jenjang=smk` dengan draf lama tersimpan; pastikan tetap masuk daftar. Klik Buat Bank Soal, pilih kelas terjadwal dan mapel yang belum memiliki bank, isi penyusun dan 5 opsi lengkap, lalu simpan. Ubah, lihat, dan hapus sesuai kebutuhan; penghapusan bank yang masih dipakai ujian harus ditolak. Beralih ke SMP, ulangi dengan 4 opsi dan pastikan bank/draf SMK tidak tampil. Ulangi pada LMS. Pada editor gambar, bandingkan hasil dengan sumber; penolakan bacaan yang berbeda tidak boleh mengubah teks pertanyaan.

Berkas utama tambahan yang disentuh: `CbtV2Bank.vue`, `CbtV2BankForm.vue`, `CbtRichQuestionEditor.vue`, `CbtV2PageContent.vue`, `app/composables/useAdminCbtData.ts`, `server/api/cbt/ocr.post.ts`, `server/utils/cbtOcr.ts`, migrasi 0015, `.gitignore`, tes, laporan, dan bukti OCR.

## Status uji terima awal

| Poin | Status bukti saat ini | Langkah manual |
| --- | --- | --- |
| 3 gambar rumus | Endpoint nyata + render SSR lulus; visual browser belum diperiksa | Masuk sebagai staf ke `/adminV2/cbt?tab=bank&jenjang=smk`. Buka/Buat paket pada kelas/mapel asli. Unggah setiap PNG bukti, klik **Ekstrak teks dari gambar**, periksa pratinjau, lalu simpan. Pilih soal itu dalam ujian aktif dan buka `/cbt` dengan NIS siswa aktif dalam rombel dan token ujian. Cocokkan pecahan, akar, pangkat/indeks di editor dan siswa. |
| Arab | OCR sesuai sumber, harakat dan RTL SSR lulus; visual browser belum diperiksa | Ulangi dengan `arab.png`. Pastikan field/pratinjau RTL; ketik atau sunting Arab berharakat lalu simpan. Buka soal siswa dan cocokkan harakat serta arah. Ulangi pada viewport 360 px. |
| Sembunyikan Jawaban Singkat | Pemeriksaan form, parser, template, dan pembacaan lama lulus | Periksa pembuatan di `/adminV2/cbt?tab=bank`, `/adminV2/lms?tab=bank`, dan `/admin/cbt`. Tidak ada pilihan baru Jawaban Singkat/Isian. Unduh kedua template dan periksa isinya. Impor dokumen bertipe `Isian`/`Jawaban Singkat` harus ditolak. Buka paket lama bertipe `Isian` melalui rincian; soal dan jawabannya tetap terbaca pada siswa. |
| Subset + urutan + kompatibilitas | Logika lokal/RPC tiruan lulus; database/RLS asli belum diuji | Setelah migrasi, buka `/adminV2/cbt?tab=exams`. Buat jadwal dari bank asli minimal 3 soal, atur mulai dalam waktu aktif, centang hanya dua soal, tukar urutan dengan Naik/Turun, simpan. Muat ulang, pilih Ubah, pastikan dua ID dan urutannya tetap. Buka `/cbt` dengan NIS/jenjang/rombel yang cocok: hanya dua soal dalam urutan itu. Periksa Pilih semua, pilihan kosong, dan kegagalan jaringan. Ujian lama tanpa baris `exam_questions` harus memuat seluruh bank. Edit teks bank: UUID dan pilihan ujian tidak berubah. Hapus soal yang masih dipilih: ditolak. |
| Pemisahan sumber | Label dan namespace lokal lulus; transaksi asli belum diuji | Bandingkan header, tab, menu mobile, bank, dan penjadwalan pada `/adminV2/cbt` versus `/adminV2/lms`. Ulangi subset LMS di `/cbt?mode=ujian_harian`; soal CBT tidak boleh masuk ke LMS atau sebaliknya. |
| Migrasi terlapor | RPC sudah terdeteksi setelah penerapan oleh owner; uji transaksi staf belum dilakukan | Pastikan dua tabel relasi, tiga RPC, trigger, dan RLS tersedia, lalu lakukan uji subset di atas memakai akun staf dan data siswa asli. |

## Berkas yang disentuh

- `.gitignore`: izinkan pelacakan laporan, bukti, dan migrasi baru yang sebelumnya diabaikan.
- `server/api/cbt/ocr.post.ts`, `server/utils/cbtOcr.ts`: kontrak respons, parser, dan validasi OCR.
- `server/api/cbt/questions.post.ts`: validasi permintaan dan pemuatan soal siswa melalui RPC.
- `app/utils/cbtFormula.ts`, `app/utils/cbtWordBank.ts`: render/validasi rumus serta batas tipe impor.
- `app/components/adminV2/cbt/CbtRichQuestionEditor.vue`: input dan pratinjau Arab.
- `app/components/adminV2/cbt/CbtV2BankForm.vue`, `CbtV2DrawerPackageForm.vue`, `CbtV2Bank.vue`: pilihan tipe dan label bank/impor.
- `app/components/adminV2/cbt/CbtV2Exams.vue`, `cbtV2Data.ts`: pemilihan/urutan soal dan data ujian.
- `app/components/adminV2/cbt/CbtV2PageContent.vue`, `CbtV2Header.vue`, `CbtV2Tabs.vue`, `CbtV2MobileNav.vue`: konteks CBT/LMS dan pemuatan data.
- `app/components/adminV2/cbt/CbtV2Results.vue`: render teks soal, jawaban, dan rubrik esai.
- `app/components/admin/cbt/CbtBank.vue`, `app/composables/useAdminCbtState.ts`: tutup pembuatan Isian portal lama dan gunakan penyimpanan atomik bersama.
- `app/composables/useAdminCbtData.ts`: pemuatan relasi, RPC penyimpanan, dan UUID soal.
- `app/composables/useCbtExam.ts`, `app/pages/cbt/index.vue`: pemuatan subset siswa tanpa cadangan soal contoh.
- `app/components/cbt/CbtLoginScreen.vue`, `CbtConfirmScreen.vue`, `CbtExamScreen.vue`: masukan NIS/token, identitas ujian dari server, dan render Arab.
- `public/templates/Template_Import_Bank_Soal_SMP.docx`, `Template_Import_Bank_Soal_SMK.docx`: contoh impor yang tersedia.
- `supabase/migrations/0014_pilihan_soal_ujian.sql`: isi migrasi dijelaskan di atas.
- `tests/cbt-banksoal.mjs`, `tests/cbt-ocr.ps1`: pemeriksaan yang dapat diulang.
- `docs/laporan-cbt-banksoal.md`, `docs/bukti-cbt-banksoal/`: laporan, 4 PNG sumber, 4 JSON hasil OCR, 4 HTML render, dan JSON hasil pemeriksaan.
