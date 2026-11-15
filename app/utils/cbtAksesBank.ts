// Cermin fungsi SQL bank_soal_boleh (migrasi 0066). Database tetap penegak utamanya (RLS);
// fungsi ini hanya agar tombol Ubah/Hapus tidak muncul untuk bank yang memang akan ditolak.
type Jenjang = 'SMP' | 'SMK'

export interface AksesBankAkun {
  superadmin: boolean
  pimpinanJenjang: Jenjang[]
  guruId: string | null
  waliKelasIds: string[]
}

export const bolehAksesBank = (akun: AksesBankAkun, bank: { ownerTeacherId?: string | null, classId?: string, grade: Jenjang }) =>
  akun.superadmin
  || akun.pimpinanJenjang.includes(bank.grade)
  || (!!bank.ownerTeacherId && bank.ownerTeacherId === akun.guruId)
  || (!!bank.classId && akun.waliKelasIds.includes(bank.classId))
