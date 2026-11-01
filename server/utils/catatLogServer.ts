// Pencatat Log Aktivitas dari sisi server (endpoint admin) — memakai
// klien service role dari gerbang; aktor = pemanggil endpoint yang
// sudah lolos gerbang. Kegagalan mencatat tidak menggagalkan aksi utama.
export const catatLogServer = async (supabase: any, aktor: { id: string, nama: string }, modul: string, aksi: string, detail = '') => {
  try {
    await supabase.from('activity_logs').insert({
      actor_id: aktor.id, actor_name: aktor.nama, actor_role: '',
      modul, aksi, tingkat: 'info', detail: String(detail).slice(0, 300)
    })
  } catch { /* abaikan */ }
}
