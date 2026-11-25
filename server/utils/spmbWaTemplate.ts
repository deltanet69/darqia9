// Template pesan WhatsApp notifikasi SPMB Darqia.
// Bahasa Indonesia formal (aturan bahasa sekolah), satu pesan per status.
// Isi pesan TIDAK memuat data sensitif penuh (NIK ditampilkan tersamar
// dan memang tidak dicantumkan sama sekali di sini).

export interface BarisSpmb {
  id: string
  jenjang: string
  jurusan?: string | null
  s_nama: string
  s_sekolah?: string | null
  o_nama: string
  o_hp: string
  status: string
  kelas?: string | null
  nis?: string | null
}

/** '0812...' / '+62812...' -> '62812...' ; null bila tidak valid. */
export function nomorWa62(hp: string): string | null {
  let v = (hp || '').replace(/\D/g, '')
  if (!v) return null
  if (v.startsWith('0')) v = '62' + v.slice(1)
  if (v.startsWith('8')) v = '62' + v
  if (!/^62\d{8,13}$/.test(v)) return null
  return v
}

const PENJELASAN: Record<string, string> = {
  'Menunggu verifikasi':
    'Pendaftaran putra/putri Bapak/Ibu telah kami terima dan saat ini menunggu verifikasi pembayaran oleh panitia. Mohon simpan ID pendaftaran di atas untuk memeriksa status pendaftaran.',
  'Pembayaran terverifikasi':
    'Pembayaran formulir putra/putri Bapak/Ibu telah terverifikasi. Pendaftaran sedang memasuki tahap keputusan panitia; hasil akan kami sampaikan melalui pesan berikutnya.',
  'Diterima':
    'Selamat, putra/putri Bapak/Ibu dinyatakan DITERIMA. Informasi penempatan kelas dan langkah daftar ulang akan kami sampaikan melalui pesan berikutnya.',
  'Ditolak':
    'Mohon maaf, putra/putri Bapak/Ibu belum dapat kami terima pada penerimaan tahun ajaran ini. Terima kasih atas kepercayaan Bapak/Ibu kepada sekolah kami.'
}

export function renderWaSpmb(r: BarisSpmb): string {
  const sekolah = r.jenjang || 'Sekolah'
  const baris = [
    `*${sekolah}*`,
    'Penerimaan Murid Baru — Tahun Ajaran 2027/2028',
    '',
    `Assalamu'alaikum warahmatullahi wabarakatuh, Bapak/Ibu ${r.o_nama}.`,
    '',
    `ID Pendaftaran: ${r.id}`,
    `Nama Siswa: ${r.s_nama}`,
    ...(r.jurusan ? [`Jurusan: ${r.jurusan}`] : []),
    `Status: *${r.status}*`,
    '',
    PENJELASAN[r.status] || 'Status pendaftaran putra/putri Bapak/Ibu telah diperbarui oleh panitia.'
  ]
  if (r.status === 'Diterima' && r.kelas) {
    baris.push('', `Penempatan Kelas: ${r.kelas}${r.nis ? ` · NIS ${r.nis}` : ''}`)
  }
  baris.push('', 'Pesan ini dikirim otomatis oleh sistem SPMB sekolah. Mohon tidak membalas pesan ini; untuk pertanyaan silakan menghubungi panitia melalui nomor sekolah.')
  return baris.join('\n')
}
