// PDF contoh khusus pengembangan lokal: dipakai server saat berkas asli (/srv/darqia/perpus) tidak ada di laptop,
// supaya reader, sampul, tandai, dan catatan tetap bisa diuji. Tidak pernah aktif di produksi.

const WIN = (s: string) => s.replace(/[–—]/g, '-').replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?')
const esc = (s: string) => WIN(s).replace(/([\\()])/g, '\\$1')

const bungkus = (t: string, maks: number): string[] => {
  const hasil: string[] = []
  let baris = ''
  for (const k of t.split(/\s+/)) {
    if ((baris + ' ' + k).trim().length > maks) { hasil.push(baris); baris = k } else baris = (baris + ' ' + k).trim()
  }
  if (baris) hasil.push(baris)
  return hasil
}

const ISI = [
  'Belajar adalah proses yang berlangsung sepanjang hayat. Setiap bab dalam buku ini disusun agar mudah dipahami, dimulai dari konsep dasar lalu berlanjut ke contoh penerapan dalam kehidupan sehari-hari.',
  'Pahami tujuan pembelajaran di awal bab, baca materi secara berurutan, lalu kerjakan latihan di akhir bab. Catat hal penting dengan menandai kalimat yang menurutmu perlu diingat kembali.',
  'Diskusikan hal yang belum jelas bersama teman atau guru. Membaca dengan tenang dan konsisten setiap hari jauh lebih efektif daripada membaca banyak sekaligus dalam satu malam.'
]

export function pdfContoh(b: { judul?: string, mapel?: string, kelas_label?: string }, halaman = 12): Buffer {
  const judul = b.judul || 'Buku', mapel = b.mapel || 'Umum', kelas = b.kelas_label || ''
  const objek: string[] = []
  const tambah = (s: string) => objek.push(s)
  tambah('<< /Type /Catalog /Pages 2 0 R >>')
  tambah(`<< /Type /Pages /Kids [${Array.from({ length: halaman }, (_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${halaman} >>`)
  tambah('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  tambah('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  for (let p = 0; p < halaman; p++) {
    let c = ''
    const teks = (f: string, uk: number, x: number, y: number, s: string, warna = '0.1 0.1 0.15') => { c += `BT ${warna} rg /${f} ${uk} Tf ${x} ${y} Td (${esc(s)}) Tj ET\n` }
    if (p === 0) {
      c += '0.12 0.27 0.62 rg 0 0 420 595 re f\n0.2 0.4 0.9 rg 250 -40 260 260 re f\n'
      teks('F2', 12, 36, 540, mapel.toUpperCase(), '1 1 1')
      bungkus(judul, 20).slice(0, 7).forEach((l, i) => teks('F2', 26, 36, 470 - i * 32, l, '1 1 1'))
      teks('F2', 12, 36, 50, kelas ? `${kelas} - contoh pengembangan` : 'contoh pengembangan', '1 1 1')
    } else {
      teks('F2', 18, 40, 540, `Bab ${p}`)
      teks('F1', 10, 40, 40, `${judul.slice(0, 60)}  -  halaman ${p + 1}`, '0.4 0.4 0.45')
      let y = 505
      for (let k = 0; k < 3; k++) {
        for (const l of bungkus(ISI[(p + k) % ISI.length]!, 62)) { teks('F1', 12, 40, y, l); y -= 18 }
        y -= 12
      }
    }
    tambah(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 595] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + p * 2} 0 R >>`)
    tambah(`<< /Length ${Buffer.byteLength(c, 'latin1')} >>\nstream\n${c}endstream`)
  }
  let isi = '%PDF-1.4\n'
  const posisi: number[] = []
  objek.forEach((o, i) => { posisi.push(Buffer.byteLength(isi, 'latin1')); isi += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = Buffer.byteLength(isi, 'latin1')
  isi += `xref\n0 ${objek.length + 1}\n0000000000 65535 f \n${posisi.map(x => `${String(x).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objek.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(isi, 'latin1')
}
