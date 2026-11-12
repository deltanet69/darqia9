export const useAdminGrade = () => useState<'SMK' | 'SMP'>('adminGrade', () => 'SMK')

// Jenjang huruf kecil yang terhubung ke state bersama, sehingga pilihan tetap terkunci antarhalaman.
export const useAdminJenjang = () => {
  const grade = useAdminGrade()
  return computed<'smp' | 'smk'>({
    get: () => grade.value.toLowerCase() as 'smp' | 'smk',
    set: v => { grade.value = v.toUpperCase() as 'SMP' | 'SMK' }
  })
}
