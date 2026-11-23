import { hostUntuk } from '../composables/domainCore'

export interface KartuCetak {
  name: string
  nis: string
  nisn: string
  noPeserta: string
  ttl: string
  classroom: string
  major?: string
  room?: string
  token: string
  foto?: string
}

// Halaman unduh permanen; QR di kartu menuju ke sini.
export const URL_UNDUH_APK = 'https://darqiaattaqwa.sch.id/unduh/'

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// No. Peserta = {TA 4 digit}--{semester}{jenis}-{NIS}. Contoh: "2026/2027", "PAS Ganjil", NIS 24251087 → 2627--0102-24251087.
// Nama periode di luar pola PTS/PAS + Ganjil/Genap (atau TA tak terbaca) → NIS saja.
export const buatNoPeserta = (tahunAjaran: string, periode: string, nis: string): string => {
  const ta = /^(\d{4})\s*\/\s*(\d{4})$/.exec(tahunAjaran.trim())
  const jenis = /\b(PTS|PAS)\b/i.exec(periode)?.[1]?.toUpperCase()
  const semester = /\b(Ganjil|Genap)\b/i.exec(periode)?.[1]?.toLowerCase()
  if (!ta || !jenis || !semester) return nis
  return `${ta[1]!.slice(2)}${ta[2]!.slice(2)}--${semester === 'ganjil' ? '01' : '02'}${jenis === 'PTS' ? '01' : '02'}-${nis}`
}

// "YYYY-MM-DD" → "14 Mei 2009" tanpa melewati zona waktu browser.
export const formatTanggalIndo = (iso: string | null | undefined): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  if (!m) return ''
  const bulan = BULAN[Number(m[2]) - 1]
  return bulan ? `${Number(m[3])} ${bulan} ${m[1]}` : ''
}

// Tempat + tanggal lahir → "Bekasi, 14 Mei 2009"; salah satunya kosong → yang ada saja; keduanya kosong → "–".
export const formatTtl = (tempat: string | null | undefined, tanggal: string | null | undefined): string =>
  [(tempat ?? '').trim(), formatTanggalIndo(tanggal)].filter(Boolean).join(', ') || '–'

// Kelas/Jurusan = nama kelas + " · " + jurusan; tanpa jurusan (SMP) cukup nama kelas.
export const kelasJurusan = (kelas: string, major?: string | null): string => major?.trim() ? `${kelas} · ${major.trim()}` : kelas

// Ambil foto siswa dari server lalu kecilkan menjadi data URL JPEG agar jendela cetak ringan dan mandiri.
// sumber 'staf' = sesi admin (foto NIS mana pun); 'ortu' = sesi Portal Orang Tua (foto anak sendiri dari sesi).
// Gagal (foto belum ada / sesi tidak valid) → '' dan kartu tampil dengan penanda foto kosong.
export const muatFotoKartu = async (nis: string, sumber: 'staf' | 'ortu'): Promise<string> => {
  try {
    const url = sumber === 'ortu' ? '/api/ortu/foto' : `/api/kartu/foto/${encodeURIComponent(nis)}`
    const res = await fetch(url)
    if (!res.ok) return ''
    const blob = await res.blob()
    const bmp = await createImageBitmap(blob)
    const skala = Math.min(1, 240 / bmp.width)
    const cv = document.createElement('canvas')
    cv.width = Math.max(1, Math.round(bmp.width * skala))
    cv.height = Math.max(1, Math.round(bmp.height * skala))
    cv.getContext('2d')!.drawImage(bmp, 0, 0, cv.width, cv.height)
    return cv.toDataURL('image/jpeg', 0.85)
  } catch { return '' }
}

// Buka jendela cetak kartu ujian (A4, 4 kartu portrait 7 × 10 cm per halaman, desain FigCraft "Kartu Ujian PAS v2 — Techy").
// Mengembalikan pesan galat, atau '' bila berhasil.
// qr = data URL QR "Unduh APK CBT" (digenerate pemanggil dengan package qrcode).
export const cetakKartu = (opts: { kartu: KartuCetak[], grade: 'SMK' | 'SMP', jenis: string, judul: string, tahunAjaran: string, qr: string }): string => {
  const { kartu: daftar, grade, judul, tahunAjaran, qr } = opts
  if (!daftar.length) return 'Belum ada kartu yang dapat dicetak. Terbitkan token terlebih dahulu.'
  const win = window.open('', '_blank')
  if (!win) return 'Jendela cetak terblokir. Izinkan pop-up untuk mencetak kartu.'
  // Data berasal dari database: di-escape agar tidak bisa menyisipkan HTML ke jendela cetak.
  const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
  const smk = grade === 'SMK'
  const schoolName = smk ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam'
  const kepsek = smk ? 'H. Abd. Muiz' : 'H. Muhammad Ridwan Hakim'
  const idKepsek = smk ? 'NUKS. 19023L0550222241178547' : 'NUPTK. ..............................'
  const logo = `${window.location.origin}/asset/${smk ? 'logo.png' : 'logosmp.webp'}`
  const tglCetak = formatTanggalIndo(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()))
  // Pil + subjudul dari nama periode, mis. "PAS Ganjil" → pil "PAS", subjudul "Penilaian Akhir Semester (PAS) Ganjil".
  const kodeJenis = /\b(PTS|PAS)\b/i.exec(opts.jenis)?.[1]?.toUpperCase() ?? ''
  const semester = /\b(Ganjil|Genap)\b/i.exec(opts.jenis)?.[1] ?? ''
  const labelJenis = kodeJenis === 'PAS' ? 'Penilaian Akhir Semester' : kodeJenis === 'PTS' ? 'Penilaian Tengah Semester' : ''
  const subJudul = labelJenis ? `${labelJenis} (${kodeJenis})${semester ? ` ${semester}` : ''}` : opts.jenis
  const baris = (label: string, nilai: string) => `<div class="row"><span>${label}</span><b>${esc(nilai || '–')}</b></div>`
  const kartu = daftar.map(p => `
    <section class="kartu${smk ? '' : ' smp'}">
      <header>
        <img class="logo" src="${logo}" alt="">
        <div class="head-text"><h1>${esc(schoolName.toUpperCase())}</h1><p>Tahun Ajaran ${esc(tahunAjaran)}</p></div>
        <span class="pill">${esc(kodeJenis || 'UJIAN')}</span>
        <svg class="sirkuit-h" viewBox="0 0 120 26"><polyline points="0,20 34,20 48,6 118,6" fill="none" stroke="#3D74D6" stroke-width="1.6"/><circle cx="117" cy="6" r="2.6" fill="#7FB0FF"/><circle cx="2" cy="20" r="2.6" fill="#3D74D6"/></svg>
      </header>
      <div class="judul-blok">
        <h2>KARTU PESERTA UJIAN</h2>
        <p>${esc(subJudul)}</p>
        <div class="goldbar"></div>
        <div class="dotgrid"></div>
      </div>
      <div class="info">
        ${p.foto ? `<img class="foto" src="${p.foto}" alt="">` : '<div class="foto kosong">FOTO<br>3 × 4</div>'}
        <div class="detail">
          <div class="lbl">NO. PESERTA</div>
          <div class="nopes">${esc(p.noPeserta)}</div>
          <div class="lbl" style="margin-top:4px">NAMA PESERTA</div>
          <div class="nama">${esc(p.name)}</div>
          <div class="rows">
            ${baris('KELAS', p.classroom)}
            ${p.major?.trim() ? baris('JURUSAN', p.major) : ''}
            ${baris('NIS', p.nis)}
            ${baris('NISN', p.nisn)}
            ${baris('TTL', p.ttl)}
            ${baris('RUANG UJIAN', p.room || '')}
          </div>
        </div>
      </div>
      <div class="tokenbox">
        <div><div class="t-lbl">TOKEN PESERTA</div><div class="t-val">${esc(p.token)}</div></div>
        <p class="t-note">Token yang sama untuk semua mata pelajaran</p>
        <div class="tk-dots"></div>
      </div>
      <div class="bawah">
        <div class="qrwrap">
          <div class="qr-box"><img src="${esc(qr)}" alt=""></div>
          <div class="qr-txt"><b>Unduh Aplikasi CBT</b><span>darqiaattaqwa.sch.id/unduh</span></div>
        </div>
        <div class="sign">
          <div>Bekasi, ${esc(tglCetak)}</div>
          <div>Kepala Sekolah,</div>
          <div class="sign-name">${esc(kepsek)}</div>
          <div class="sign-id">${esc(idKepsek)}</div>
        </div>
      </div>
      <div class="kaki">Bawa kartu ini setiap ujian · Simpan baik-baik, jangan sampai rusak</div>
      <svg class="sirkuit-r" viewBox="0 0 14 250" preserveAspectRatio="none"><path d="M7 0 V250 M7 60 H1.5 M7 150 H2.5 M7 220 H1.5" fill="none" stroke="#DCE7F7" stroke-width="1.4"/><circle cx="2" cy="60" r="2" fill="#C3D6F5"/><circle cx="2" cy="150" r="2" fill="#C3D6F5"/><circle cx="2" cy="220" r="2" fill="#C3D6F5"/></svg>
    </section>`)
  // A4 = 4 kartu portrait (2 kolom × 2 baris) per halaman; halaman terakhir berisi sisa siswa.
  const halaman: string[] = []
  for (let i = 0; i < kartu.length; i += 4) halaman.push(`<div class="halaman">${kartu.slice(i, i + 4).join('')}</div>`)
  win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Kartu Ujian — ${esc(judul)}</title>
    <style>
      @page { size: A4; margin: 5mm 4mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Segoe UI', Inter, Arial, sans-serif; color: #101828; background: #fff; }
      .halaman { width: 202mm; height: 286mm; display: grid; grid-template-columns: 7cm 7cm; grid-template-rows: 10cm 10cm; gap: 3mm; justify-content: center; align-content: center; break-after: page; }
      .halaman:last-child { break-after: auto; }
      .kartu { position: relative; width: 7cm; height: 10cm; border: 1px solid #D5DCE8; border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column;
        --utama: #0A2A5C; --aksen: #1B5FD9; --emas: #E8A93D; --pudar: #C7D7F2; }
      .kartu.smp { --utama: #0B5138; --aksen: #15803D; --pudar: #BFE6D2; }
      .kartu header { position: relative; flex-shrink: 0; display: flex; align-items: center; gap: 7px; background: var(--utama); padding: 6px 11px 7px; }
      .kartu header .logo { height: 33px; width: auto; flex-shrink: 0; }
      .head-text { flex: 1; min-width: 0; line-height: 1.25; }
      .kartu h1 { font-size: 12px; font-weight: 800; letter-spacing: .01em; color: #fff; line-height: 1.15; }
      .kartu header p { font-size: 7px; font-weight: 500; color: var(--pudar); }
      .pill { flex-shrink: 0; align-self: flex-start; margin-top: 1px; padding: 2.5px 9px; border-radius: 999px; font-size: 8px; font-weight: 800; letter-spacing: .04em; background: var(--emas); color: #0A2A5C; }
      .sirkuit-h { position: absolute; right: 8px; bottom: 3px; width: 104px; height: 22px; opacity: .9; }
      .judul-blok { position: relative; flex-shrink: 0; padding: 7px 11px 0; }
      .kartu h2 { font-size: 13.5px; font-weight: 800; letter-spacing: .01em; color: var(--utama); }
      .judul-blok p { font-size: 7.5px; font-weight: 500; color: #475467; margin-top: 1px; }
      .goldbar { width: 22px; height: 2.5px; border-radius: 2px; background: var(--emas); margin-top: 4px; }
      .dotgrid { position: absolute; right: 11px; top: 8px; width: 34px; height: 26px; background-image: radial-gradient(circle, #D5E2F6 1.3px, transparent 1.8px); background-size: 8.5px 8.5px; }
      .info { flex-shrink: 0; display: flex; gap: 8px; margin: 7px 11px 0; padding: 8px; background: #FBFCFE; border: 1px solid #E1E9F4; border-radius: 7px; }
      .foto { width: 57px; height: 76px; flex-shrink: 0; object-fit: cover; border-radius: 3px; background: #EEF1F6; }
      .foto.kosong { display: flex; align-items: center; justify-content: center; text-align: center; border: 1px dashed #C3CEDF; font-size: 6px; font-weight: 700; letter-spacing: .08em; color: #98A2B3; line-height: 1.5; }
      .detail { flex: 1; min-width: 0; }
      .lbl { font-size: 5.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #98A2B3; }
      .nopes { font-size: 11px; font-weight: 800; color: var(--utama); line-height: 1.25; white-space: nowrap; }
      .nama { font-size: 10.5px; font-weight: 800; color: #101828; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .rows { margin-top: 3px; }
      .row { display: flex; align-items: baseline; gap: 6px; padding: 2.4px 0; border-top: 1px solid #E5EAF1; }
      .row span { width: 56px; flex-shrink: 0; font-size: 6px; font-weight: 700; letter-spacing: .06em; color: #98A2B3; }
      .row b { font-size: 7.5px; font-weight: 700; color: #101828; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tokenbox { position: relative; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 7px 11px 0; padding: 7px 9px; background: #EEF3FC; border: 1px solid #C9D9F6; border-radius: 6px; }
      .kartu.smp .tokenbox { background: #E7F6ED; border-color: #A6E9C5; }
      .t-lbl { font-size: 6px; font-weight: 700; letter-spacing: .11em; color: var(--aksen); }
      .t-val { font-size: 16px; font-weight: 800; letter-spacing: .05em; color: var(--utama); line-height: 1.2; }
      .t-note { font-size: 6.5px; line-height: 1.45; color: #5B6B82; width: 42%; margin-right: 28px; }
      .tk-dots { position: absolute; right: 7px; top: 6px; width: 25px; height: 25px; background-image: radial-gradient(circle, #B9CFF2 1.5px, transparent 2px); background-size: 9px 9px; opacity: .65; }
      .bawah { flex-shrink: 0; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin: 8px 11px 0; }
      .qrwrap { display: flex; align-items: flex-start; gap: 6px; min-width: 0; }
      .qr-box { padding: 2px; background: #fff; border: 1.6px solid var(--utama); border-radius: 4px; line-height: 0; }
      .qr-box img { width: 41px; height: 41px; }
      .qr-txt { line-height: 1.35; padding-top: 1px; }
      .qr-txt b { display: block; font-size: 7.5px; font-weight: 800; color: var(--utama); }
      .qr-txt span { font-size: 6.5px; color: #475467; }
      .sign { text-align: right; line-height: 1.3; font-size: 6.5px; color: #475467; flex-shrink: 1; min-width: 0; }
      .sign-name { margin-top: 13px; font-size: 8.5px; font-weight: 800; color: var(--utama); line-height: 1.25; }
      .sign-id { font-size: 5.5px; color: #98A2B3; margin-top: 1px; }
      .kaki { position: absolute; left: 0; right: 0; bottom: 5px; text-align: center; font-size: 6px; color: #98A2B3; padding: 0 8px; }
      .sirkuit-r { position: absolute; right: 2px; top: 64px; width: 8px; height: 218px; }
    </style></head><body>${halaman.join('')}
    <script>window.onload = () => { const img = [...document.images].filter(i => !i.complete); Promise.all(img.map(i => new Promise(r => { i.onload = i.onerror = r }))).then(() => window.print()) }<\/script></body></html>`)
  win.document.close()
  return ''
}
