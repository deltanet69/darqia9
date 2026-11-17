// Ekspor daftar akses Portal Orang Tua (kata sandi awal) ke Excel untuk dibagikan wali kelas.
import { hostUntuk } from '~/composables/domainCore'

export interface AksesOrtu { id: string, nama: string, nis: string, nisn: string, kelas: string, jenjang: string, sandi: string }

export const alamatPortalOrtu = (jenjang: string) => `https://${hostUntuk('parent', jenjang === 'SMP' ? 'smp' : 'smk')}`

export async function unduhAksesOrtu(akun: AksesOrtu[], judul: string) {
  const XLSX = await import('xlsx')
  const aoa = [
    ['No', 'Nama Siswa', 'NIS', 'NISN', 'Kelas', 'Jenjang', 'Kata Sandi Awal', 'Alamat Portal'],
    ...akun.map((a, i) => [i + 1, a.nama, a.nis, a.nisn, a.kelas, a.jenjang, a.sandi, alamatPortalOrtu(a.jenjang)]),
    [],
    ['Masuk dengan NIS atau NISN anak dan kata sandi awal di atas. Saat pertama masuk, orang tua wajib membuat kata sandi pribadi.']
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [5, 32, 14, 14, 14, 9, 16, 34].map(wch => ({ wch }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Akses Portal Ortu')
  XLSX.writeFile(wb, `akses-portal-ortu-${judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.xlsx`)
}
