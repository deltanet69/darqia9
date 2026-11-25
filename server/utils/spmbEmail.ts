// Email notifikasi SPMB Darqia via Brevo — akun Brevo yang sama dengan
// MI Attaqwa 15 (pengirim spmb@miattaqwa15.sch.id di sana).
//
// Pengirim resmi per jenjang. Kedua domain (smkitattaqwa9.sch.id dan
// smpitbca.sch.id) WAJIB sudah diautentikasi di dashboard Brevo
// (record DKIM/SPF di DNS Cloudflare) sebelum email benar-benar terkirim;
// tanpa itu Brevo menolak pengirim dan fungsi ini melaporkan 'gagal'.
//
// Kunci API dibaca dari runtimeConfig.brevoApiKey (env BREVO_API_KEY
// di server). Tanpa kunci, fungsi melaporkan 'tanpa_kunci' — pendaftaran
// tidak pernah diganggu oleh urusan email.

import type { BarisSpmb } from './spmbWaTemplate'

export interface PengirimSpmb {
  nama: string
  email: string
}

export function pengirimSpmb(jenjang: string): PengirimSpmb {
  if ((jenjang || '').toUpperCase().includes('SMK')) {
    return { nama: 'Panitia SPMB SMK IT Attaqwa 9', email: 'spmb@smkitattaqwa9.sch.id' }
  }
  return { nama: 'Panitia SPMB SMP IT Bina Cendekia Assalam', email: 'spmb@smpitbca.sch.id' }
}

function emailValid(v?: string | null): string | null {
  const s = String(v || '').trim()
  if (!s || s === '-') return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : null
}

/** Daftar penerima unik: email wali + email siswa (bila diisi & valid). */
export function penerimaEmailSpmb(r: BarisSpmb & { o_email?: string | null; s_email?: string | null }): string[] {
  const hasil: string[] = []
  for (const c of [emailValid(r.o_email), emailValid(r.s_email)]) {
    if (c && !hasil.includes(c)) hasil.push(c)
  }
  return hasil
}

export function subjekEmailSpmb(r: BarisSpmb): string {
  return `Pendaftaran SPMB 2027/2028 Diterima — ${r.s_nama} (${r.id})`
}

export function isiEmailSpmb(r: BarisSpmb): { teks: string; html: string } {
  const sekolah = r.jenjang || 'Sekolah'
  const barisData: Array<[string, string]> = [
    ['ID Pendaftaran', r.id],
    ['Nama Siswa', r.s_nama],
    ...(r.jurusan ? [['Jurusan', r.jurusan] as [string, string]] : []),
    ...(r.s_sekolah ? [['Asal Sekolah', r.s_sekolah] as [string, string]] : []),
    ['Status', r.status]
  ]
  const teks = [
    `${sekolah}`,
    'Penerimaan Murid Baru — Tahun Ajaran 2027/2028',
    '',
    `Assalamu'alaikum warahmatullahi wabarakatuh, Bapak/Ibu ${r.o_nama}.`,
    '',
    'Terima kasih atas kepercayaan Bapak/Ibu. Pendaftaran putra/putri Bapak/Ibu telah kami terima melalui formulir SPMB daring dengan data sebagai berikut:',
    '',
    ...barisData.map(([k, v]) => `${k}: ${v}`),
    '',
    'Saat ini pendaftaran menunggu verifikasi pembayaran oleh panitia. Hasil verifikasi dan setiap perubahan status akan kami sampaikan melalui email dan WhatsApp ke nomor yang Bapak/Ibu daftarkan.',
    '',
    'Mohon simpan ID pendaftaran di atas. Status pendaftaran dapat diperiksa kapan saja melalui halaman Cek Status pada situs SPMB sekolah dengan memasukkan ID tersebut.',
    '',
    "Wassalamu'alaikum warahmatullahi wabarakatuh.",
    '',
    `Panitia SPMB ${sekolah}`,
    '(Pesan otomatis — mohon tidak membalas email ini. Untuk pertanyaan, silakan menghubungi panitia melalui kontak resmi sekolah.)'
  ].join('\n')

  const barisHtml = barisData
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#5A6B8C">${k}</td><td style="padding:6px 12px;font-weight:700;color:#0F2044">${v}</td></tr>`)
    .join('')
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1E2A44;line-height:1.6">
  <h2 style="color:#0F2044;margin-bottom:2px">${sekolah}</h2>
  <p style="color:#5A6B8C;margin-top:0">Penerimaan Murid Baru — Tahun Ajaran 2027/2028</p>
  <p>Assalamu'alaikum warahmatullahi wabarakatuh, Bapak/Ibu ${r.o_nama}.</p>
  <p>Terima kasih atas kepercayaan Bapak/Ibu. Pendaftaran putra/putri Bapak/Ibu telah kami terima melalui formulir SPMB daring dengan data sebagai berikut:</p>
  <table style="border-collapse:collapse;background:#F4F7FE;border-radius:8px">${barisHtml}</table>
  <p>Saat ini pendaftaran <b>menunggu verifikasi pembayaran</b> oleh panitia. Hasil verifikasi dan setiap perubahan status akan kami sampaikan melalui email dan WhatsApp ke nomor yang Bapak/Ibu daftarkan.</p>
  <p>Mohon simpan ID pendaftaran di atas. Status pendaftaran dapat diperiksa kapan saja melalui halaman <b>Cek Status</b> pada situs SPMB sekolah dengan memasukkan ID tersebut.</p>
  <p>Wassalamu'alaikum warahmatullahi wabarakatuh.</p>
  <p style="color:#5A6B8C;font-size:13px">Panitia SPMB ${sekolah}<br>(Pesan otomatis — mohon tidak membalas email ini. Untuk pertanyaan, silakan menghubungi panitia melalui kontak resmi sekolah.)</p>
</div>`
  return { teks, html }
}

export interface HasilEmail {
  keadaan: 'terkirim' | 'tanpa_kunci' | 'tanpa_penerima' | 'gagal'
  pesan?: string
}

export async function kirimEmailSpmb(
  event: Parameters<typeof useRuntimeConfig>[0],
  r: BarisSpmb & { o_email?: string | null; s_email?: string | null }
): Promise<HasilEmail> {
  const penerima = penerimaEmailSpmb(r)
  if (!penerima.length) return { keadaan: 'tanpa_penerima' }
  const kunci = useRuntimeConfig(event).brevoApiKey as string
  if (!kunci) return { keadaan: 'tanpa_kunci' }
  const pengirim = pengirimSpmb(r.jenjang)
  const { teks, html } = isiEmailSpmb(r)
  try {
    await $fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': kunci, 'content-type': 'application/json', accept: 'application/json' },
      body: {
        sender: { name: pengirim.nama, email: pengirim.email },
        to: penerima.map((email) => ({ email })),
        subject: subjekEmailSpmb(r),
        textContent: teks,
        htmlContent: html
      }
    })
    return { keadaan: 'terkirim' }
  } catch (e) {
    const pesan = (e as { data?: { message?: string }; message?: string })?.data?.message || (e as Error)?.message || 'galat tidak dikenal'
    return { keadaan: 'gagal', pesan }
  }
}
