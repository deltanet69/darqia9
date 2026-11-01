// Pencatat aktivitas aplikasi (tabel activity_logs, migrasi 0024).
// Fire-and-forget: pencatatan TIDAK PERNAH menghalangi atau menggagalkan
// aksi pengguna — kegagalan mencatat ditelan diam-diam. Baca log hanya
// boleh Superadmin (kebijakan RLS + fungsi log_rekap di database).
export const useLogAktivitas = () => {
  const catat = (modul: string, aksi: string, detail = '', tingkat: 'info' | 'galat' = 'info', aktor?: { id: string, nama: string, peran?: string }) => {
    try {
      const user = useSupabaseUser().value as any
      const id = aktor?.id || user?.id
      if (!id) return
      let peran = aktor?.peran || ''
      if (!peran) {
        try { peran = useRbac().peranSaya.value?.nama || '' } catch { peran = '' }
        if (!peran) peran = user?.user_metadata?.role || user?.app_metadata?.role || ''
      }
      const nama = aktor?.nama || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || ''
      void useSupabaseClient().from('activity_logs').insert({
        actor_id: id, actor_name: nama, actor_role: peran,
        modul, aksi, tingkat, detail: String(detail).slice(0, 300)
      }).then(() => undefined, () => undefined)
    } catch { /* abaikan — log tidak boleh mengganggu aplikasi */ }
  }
  return { catat }
}
