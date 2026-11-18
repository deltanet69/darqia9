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

// Buka jendela cetak kartu ujian (A4, 8 kartu 10 × 7 cm per halaman). Mengembalikan pesan galat, atau '' bila berhasil.
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
  const kepsek = smk ? 'H. Abd. Muiz, M.Pd' : 'H. Muhammad Ridwan Hakim'
  // Alamat dari daftar domain live, bukan host browser, agar kartu tidak pernah mencetak localhost/staging.
  const alamat = hostUntuk('cbt', smk ? 'smk' : 'smp')
  const logo = `${window.location.origin}/asset/${smk ? 'logo.png' : 'logosmp.webp'}`
  const tglCetak = formatTanggalIndo(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()))
  const kartu = daftar.map(p => `
    <section class="kartu${smk ? '' : ' smp'}">
      <div class="pita"></div>
      <header>
        <div class="logo-box"><img src="${logo}" alt=""></div>
        <div class="head-text"><h1>KARTU PESERTA UJIAN</h1><p>Tahun Ajaran ${esc(tahunAjaran)} · ${esc(schoolName)}</p></div>
        <span class="chip">CBT ONLINE</span>
      </header>
      <div class="isi">
        <div class="kiri">
          <div class="ident">
            <div class="nama"><div class="lbl">Nama Peserta</div><div class="nama-val">${esc(p.name)}</div></div>
            <div class="nopes"><div class="lbl">No. Peserta</div><div class="nopes-val">${esc(p.noPeserta)}</div></div>
          </div>
          <div class="grid">
            <div><div class="lbl">NIS / NISN</div><div class="val mono">${esc(p.nis)} / ${esc(p.nisn || '–')}</div></div>
            <div><div class="lbl">Ruang Ujian</div><div class="val ruang">${esc(p.room || '–')}</div></div>
            <div><div class="lbl">Tempat, Tgl Lahir</div><div class="val">${esc(p.ttl || '–')}</div></div>
            <div><div class="lbl">Kelas / Jurusan</div><div class="val">${esc(kelasJurusan(p.classroom, p.major))}</div></div>
          </div>
        </div>
        <div class="kanan">
          <div class="token"><div class="t-lbl">Token Ujian</div><div class="t-val">${esc(p.token)}</div></div>
          <div class="qr"><div class="qr-box"><img src="${esc(qr)}" alt=""></div><div class="qr-cap">Unduh APK CBT</div></div>
        </div>
      </div>
      <footer>
        <div class="note"><b>Portal Ujian: ${esc(alamat)}</b><br>Login siswa memakai NIS dan Token Ujian pada kartu ini.</div>
        <div class="sign">
          <div class="sign-head">Bekasi, ${esc(tglCetak)} · Kepala ${esc(schoolName)}</div>
          <div class="sign-space"></div>
          <div class="sign-name">${esc(kepsek)}</div>
          <div class="sign-nuptk">NUPTK. ..............................</div>
        </div>
      </footer>
    </section>`)
  // A4 = 8 kartu (2 kolom × 4 baris) per halaman; halaman terakhir berisi sisa siswa.
  const halaman: string[] = []
  for (let i = 0; i < kartu.length; i += 8) halaman.push(`<div class="halaman">${kartu.slice(i, i + 8).join('')}</div>`)
  win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Kartu Ujian — ${esc(judul)}</title>
    <style>
      @page { size: A4; margin: 5mm 4mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Segoe UI', Inter, Arial, sans-serif; color: #0F1E38; background: #fff; }
      .halaman { width: 202mm; height: 286mm; display: grid; grid-template-columns: 10cm 10cm; grid-template-rows: repeat(4, 7cm); gap: 2mm; break-after: page; }
      .halaman:last-child { break-after: auto; }
      .kartu { width: 10cm; height: 7cm; border: 1px solid #94A3B8; border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column;
        --utama: #0A2A5C; --aksen: #2563EB; --emas: #F0B429; --panel: #F5F8FF; --garis-panel: #DBEAFE; --garis: #E2E8F0; }
      .kartu.smp { --utama: #0B5138; --aksen: #15803D; --panel: #E7F6ED; --garis-panel: #A6E9C5; --garis: #D8E8DC; }
      .pita { height: 3px; flex-shrink: 0; background: linear-gradient(90deg, var(--utama) 0%, var(--aksen) 65%, var(--emas) 100%); }
      .kartu header { display: flex; align-items: center; gap: 9px; padding: 7px 14px; border-bottom: 1px solid var(--garis); flex-shrink: 0; }
      .logo-box { width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .logo-box img { width: 26px; height: 26px; object-fit: contain; }
      .head-text { flex: 1; min-width: 0; line-height: 1.2; }
      .kartu h1 { margin: 0; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; color: var(--utama); }
      .kartu header p { margin: 1px 0 0; font-size: 7.5px; font-weight: 500; color: #64748B; }
      .chip { flex-shrink: 0; padding: 2.5px 8px; border-radius: 999px; font-size: 6.8px; font-weight: 700; letter-spacing: .05em; background: var(--panel); color: var(--aksen); border: 1px solid var(--garis-panel); }
      .isi { flex: 1; display: flex; gap: 12px; padding: 9px 14px 7px; min-height: 0; }
      .kiri { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
      .ident { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding-bottom: 6px; border-bottom: 1px solid #F1F5F9; }
      .lbl { font-size: 6.2px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94A3B8; }
      .nama { min-width: 0; }
      .nama-val { font-size: 10.5px; font-weight: 800; color: #0F1E38; line-height: 1.2; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .nopes { text-align: right; flex-shrink: 0; }
      .nopes-val { font-family: Consolas, 'Courier New', monospace; font-size: 9px; font-weight: 700; color: var(--aksen); line-height: 1.2; margin-top: 1px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; padding-top: 2px; }
      .grid > div { min-width: 0; }
      .val { font-size: 8px; font-weight: 600; color: #0F1E38; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .val.mono { font-family: Consolas, 'Courier New', monospace; font-size: 7.5px; }
      .val.ruang { font-weight: 700; color: var(--utama); }
      .kanan { width: 86px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; border-left: 1px solid #F1F5F9; padding-left: 10px; }
      .token { width: 100%; background: var(--panel); border: 1px solid var(--garis-panel); border-radius: 7px; padding: 3.5px 5px; text-align: center; }
      .t-lbl { font-size: 5.8px; font-weight: 700; letter-spacing: .07em; color: var(--aksen); text-transform: uppercase; }
      .t-val { font-family: Consolas, 'Courier New', monospace; font-size: 9.5px; font-weight: 700; color: var(--utama); letter-spacing: .08em; margin-top: .5px; }
      .qr { display: flex; flex-direction: column; align-items: center; }
      .qr-box { padding: 3px; background: #fff; border: 1px solid var(--garis); border-radius: 6px; line-height: 0; }
      .qr-box img { width: 46px; height: 46px; }
      .qr-cap { font-size: 5.8px; font-weight: 600; color: #64748B; margin-top: 2px; text-align: center; }
      .kartu footer { padding: 5px 14px 6px; border-top: 1px solid var(--garis); background: #F8FAFC; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; flex-shrink: 0; }
      .note { font-size: 6.2px; color: #64748B; line-height: 1.35; }
      .note b { font-weight: 700; color: var(--utama); }
      .sign { text-align: right; line-height: 1.2; flex-shrink: 0; }
      .sign-head { font-size: 6px; color: #64748B; }
      .sign-space { height: 14px; }
      .sign-name { font-size: 6.8px; font-weight: 700; color: var(--utama); border-top: .8px solid #CBD5E1; padding-top: 1.5px; display: inline-block; min-width: 110px; }
      .sign-nuptk { font-size: 5.8px; color: #64748B; }
    </style></head><body>${halaman.join('')}
    <script>window.onload = () => { const img = [...document.images].filter(i => !i.complete); Promise.all(img.map(i => new Promise(r => { i.onload = i.onerror = r }))).then(() => window.print()) }<\/script></body></html>`)
  win.document.close()
  return ''
}
