import { hostUntuk } from '~/composables/domainCore'

export interface KartuCetak {
  name: string
  nis: string
  classroom: string
  room?: string
  token: string
}

// Buka jendela cetak kartu ujian (A4, 10 kartu per halaman). Mengembalikan pesan galat, atau '' bila berhasil.
export const cetakKartu = (opts: { kartu: KartuCetak[], grade: 'SMK' | 'SMP', jenis: string, judul: string }): string => {
  const { kartu: daftar, grade, jenis, judul } = opts
  if (!daftar.length) return 'Belum ada kartu yang dapat dicetak. Terbitkan token terlebih dahulu.'
  const win = window.open('', '_blank')
  if (!win) return 'Jendela cetak terblokir. Izinkan pop-up untuk mencetak kartu.'
  // Nama siswa berasal dari database: di-escape agar tidak bisa menyisipkan HTML ke jendela cetak.
  const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
  const schoolName = grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam'
  // Alamat dari daftar domain live, bukan host browser, agar kartu tidak pernah mencetak localhost/staging.
  const alamat = hostUntuk('cbt', grade === 'SMK' ? 'smk' : 'smp')
  const logo = `${window.location.origin}/asset/${grade === 'SMK' ? 'logo.png' : 'logosmp.png'}`
  // Tema warna mengikuti jenjang: SMP hijau, SMK navy-biru (sama seperti badge jenjang di Admin).
  const tema = grade === 'SMK'
    ? '--utama:#0A2A5C;--sub:#C7D7F2;--aksen:#1B5FD9;--panel:#EEF4FF;--garis-panel:#C9DAF8;--label:#1B4FB0;--garis:#C9D5E8'
    : '--utama:#0B5138;--sub:#BDE8D2;--aksen:#15803D;--panel:#E7F6ED;--garis-panel:#A6E9C5;--label:#166534;--garis:#BFDCCB'
  const kartu = daftar.map(p => `
    <section class="kartu">
      <header>
        <img src="${logo}" alt="">
        <div><h1>Kartu Peserta Ujian</h1><p>${esc(schoolName)}</p></div>
        <span class="jenis">${esc(jenis)}</span>
      </header>
      <div class="isi">
        <h2${String(p.name).length > 34 ? ' class="panjang"' : ''}>${esc(p.name)}</h2>
        <dl>
          <div><dt>NIS</dt><dd>${esc(p.nis)}</dd></div>
          <div><dt>Kelas</dt><dd>${esc(p.classroom)}</dd></div>
          <div><dt>Ruang</dt><dd>${esc(p.room || '–')}</dd></div>
        </dl>
        <p class="token"><span class="label">Token masuk</span><mark>${esc(p.token)}</mark></p>
      </div>
      <footer>
        <p>Buka <b>${esc(alamat)}</b>, lalu masukkan NIS dan token.</p>
        <p>Token hanya untuk NIS di atas, berlaku semua mata pelajaran. Jangan berikan kepada siapa pun.</p>
      </footer>
    </section>`)
  // A4 = 10 kartu (2 kolom × 5 baris) per halaman; halaman terakhir berisi sisa siswa.
  const halaman: string[] = []
  for (let i = 0; i < kartu.length; i += 10) halaman.push(`<div class="halaman">${kartu.slice(i, i + 10).join('')}</div>`)
  win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Kartu Ujian — ${esc(judul)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      @page { size: A4; margin: 8mm; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: Inter, Arial, sans-serif; margin: 0; color: #101828; background: #fff; ${tema}; }
      .halaman { width: 194mm; height: 281mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(5, 1fr); gap: 4mm 6mm; break-after: page; }
      .halaman:last-child { break-after: auto; }
      .kartu { border: 1px solid var(--garis); border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column; }
      header { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--utama); color: #fff; }
      header img { width: 22px; height: 25px; object-fit: contain; flex-shrink: 0; }
      header div { min-width: 0; flex: 1; }
      h1 { margin: 0; font-size: 12px; font-weight: 800; }
      header p { margin: 1px 0 0; font-size: 9.5px; font-weight: 500; color: var(--sub); }
      .jenis { flex-shrink: 0; padding: 3px 7px; border-radius: 5px; background: var(--aksen); font-size: 9.5px; font-weight: 700; }
      .isi { padding: 7px 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; }
      h2 { margin: 0; font-size: 14px; font-weight: 800; color: var(--utama); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      h2.panjang { font-size: 11.5px; }
      dl { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 6px; margin: 0; }
      dl div { min-width: 0; }
      dt { font-size: 9px; font-weight: 600; color: #475467; }
      dd { margin: 1px 0 0; font-size: 12px; font-weight: 700; color: #101828; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .token { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0; padding: 5px 6px 5px 10px; border-radius: 8px; background: var(--panel); border: 1px solid var(--garis-panel); }
      .label { font-size: 10.5px; font-weight: 700; color: var(--label); }
      mark { padding: 2px 9px; border-radius: 5px; background: #FFE27A; color: #101828; font-size: 20px; font-weight: 800; letter-spacing: 0.14em; line-height: 1.2; }
      footer { padding: 5px 10px 6px; border-top: 1px dashed var(--garis); background: #F7F9FC; }
      footer p { margin: 0; font-size: 9px; line-height: 1.4; color: #344054; }
      footer b { color: var(--utama); }
    </style></head><body>${halaman.join('')}
    <script>window.onload = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => window.print())<\/script></body></html>`)
  win.document.close()
  return ''
}
