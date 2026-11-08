// Akun berperan guru wajib punya baris di tabel teachers supaya terdeteksi di
// Jadwal Pelajaran/Mengajar, Wali Kelas, dan RBAC. Mengembalikan id guru,
// atau null bila peran bukan guru. Idempotent: akun yang sudah tertaut dipakai ulang.
export async function pastikanDataGuru(
  supabase: any,
  akun: { uid: string, nama: string, email: string, peranId: string | null, jenjang: string[] }
): Promise<string | null> {
  if (!akun.peranId) return null
  const { data: peran } = await supabase.from('rbac_roles').select('nama').eq('id', akun.peranId).maybeSingle()
  if (!/guru/i.test(peran?.nama || '')) return null

  const { data: tertaut } = await supabase.from('teachers').select('id').eq('user_id', akun.uid).maybeSingle()
  if (tertaut?.id) return String(tertaut.id)

  // Data guru dengan email sama (mis. hasil impor) cukup ditautkan, bukan digandakan.
  const { data: serupa } = await supabase.from('teachers').select('id, user_id').ilike('email', akun.email).maybeSingle()
  if (serupa?.id && !serupa.user_id) {
    const { error } = await supabase.from('teachers').update({ user_id: akun.uid }).eq('id', serupa.id)
    if (error) throw createError({ statusCode: 500, statusMessage: `Akun dibuat, tetapi gagal ditautkan ke data guru: ${error.message}` })
    return String(serupa.id)
  }

  // Satu jenjang -> unit itu; dua jenjang (bawaan) -> Yayasan, tampil di SMP dan SMK.
  const grade = akun.jenjang.length === 1 ? akun.jenjang[0] : 'Yayasan'
  const { data: baru, error } = await supabase.from('teachers').insert({
    name: akun.nama,
    email: akun.email,
    grade,
    position: 'Guru',
    employment_status: 'Aktif',
    phone: '',
    active: true,
    user_id: akun.uid
  }).select('id').single()
  if (error || !baru) {
    throw createError({ statusCode: 500, statusMessage: `Akun dibuat, tetapi data guru gagal disimpan: ${error?.message}` })
  }
  return String(baru.id)
}
