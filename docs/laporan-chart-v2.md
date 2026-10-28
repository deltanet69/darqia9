# Laporan — Redesign Chart v2 (29 Oktober 2026)

## Ringkasan
Seluruh chart di aplikasi diperbarui mengikuti preview yang disetujui user (3 halaman terpisah: Absensi Siswa, Absensi Guru, Manajemen Rombel). Proporsi dibuat ramping standar aplikasi (garis 2px, titik kecil, donut ramping) dan sumbu Y semua chart garis memakai skala penuh 10–100 kelipatan 10. Prinsip port: API props komponen bersama TIDAK berubah (props baru semuanya opsional dengan bawaan perilaku lama), jadi halaman admin lama yang memakai komponen yang sama tidak berubah perilakunya.

## Yang diubah (5 file)
1. `app/components/admin/AdminLineChart.vue` (komponen bersama)
   - Props baru opsional: `yMin`, `yMax`, `yStep` (skala sumbu eksplisit), `legend` (legenda interaktif: klik seri untuk sembunyi/tampil + rata-rata seri), `tooltipTitle`, `tooltipSub`, `tooltipFooter`.
   - Garis 3px + filter glow → 2px bersih; area gradien diturunkan (0,38 → 0,16); grid putus-putus halus.
   - Titik selalu tampil ramping (inti putih), titik aktif membesar + halo; pita kolom aktif + garis pemandu putus-putus.
   - Tooltip: dari mengikuti tetikus (fixed) → kartu menempel di titik aktif (judul konteks, baris per seri, catatan kaki opsional), otomatis membalik bila dekat tepi atas; label sumbu X pertama/terakhir diratakan ke tepi agar tidak terpotong.
2. `app/components/admin/AdminDonutChart.vue` (komponen bersama)
   - Ring 28 → 19 dengan jalur latar; segmen aktif membesar (+6) dan segmen lain meredup; pusat donut berganti menampilkan nilai + label + persen segmen aktif; sudut segmen kini rata (butt) agar proporsional untuk segmen kecil.
3. `app/components/adminV2/absensi/AbsensiV2Chart.vue` (Presensi Siswa)
   - Domain sumbu 90–100 → 0–100, ticks 10/20/…/100; garis target 95% diberi label "TARGET 95%".
   - Tooltip pil lama → kartu rincian (tanggal penuh, total siswa terdaftar, persen, selisih terhadap target).
   - Garis 3 → 2,2px; gradien area dilembutkan; titik dirampingkan. Panel Rincian Presensi dan mode Jam Tap (bar horizontal per slot) TIDAK diubah strukturnya — elemen yang sudah berjalan dipertahankan.
4. `app/components/adminV2/absensi-guru/AbsensiGuruCharts.vue` — legenda statis diganti legenda interaktif komponen; sumbu 0–100 kelipatan 10; tooltip konteks guru (total tendik + footer total hadir).
5. `app/components/adminV2/kelas/KelasV2OverviewTab.vue` — sama untuk chart rombel (tooltip "Rombel X", footer selisih kehadiran − nilai).

## Verifikasi
- Tes `tests/cbt-banksoal.mjs`: exit 0.
- `npm run build`: exit 0.
- Konsumen lain komponen bersama (halaman admin lama: dashboard, absensi, kelas, nilai) tidak dilewati props baru → perilaku & skala mereka persis seperti sebelumnya; hanya polesan visual bersama (garis/titik/tooltip/donut) yang ikut naik.
- Mode gelap: warna kerangka chart baru memakai nilai yang sudah terpetakan di `admin-dark.css` (grid #E7EBF2, label #98A2B3/#64748B/#101828, jalur donut #EFF2F7); kartu tooltip memang gelap di kedua mode (sesuai preview).

## Cabang
- Backup: `backup/chart-v2-20261029` (dari master `f1ad98c`).
- Kerja: `fitur/chart-v2` → digabung fast-forward ke master.
