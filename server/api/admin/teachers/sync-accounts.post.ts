interface TeacherAccountInput {
  nip: string
  nik?: string
  name: string
  email?: string
  unit: 'SMP' | 'SMK' | 'Yayasan'
}

export default defineEventHandler(async (event) => {
  const claims = await serverSupabaseUser(event)
  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi admin tidak valid.' })
  }

  let supabase
  try {
    supabase = serverSupabaseServiceRole(event)
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Kunci server Supabase belum dikonfigurasi.' })
  }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', claims.sub)
    .maybeSingle()

  if (!caller || !['superadmin', 'admin'].includes(caller.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Akun tidak memiliki hak mengelola pengguna.' })
  }

  const body = await readBody<{ teachers?: TeacherAccountInput[] }>(event)
  const accounts = []
  let skipped = 0

  for (const teacher of body.teachers || []) {
    const email = teacher.email?.trim().toLowerCase()
    if ((!teacher.nip?.trim() && !teacher.nik?.trim()) || !teacher.name?.trim() || !email) {
      skipped++
      continue
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    let userId = existingProfile?.id
    let role = existingProfile?.role || 'guru'

    if (!userId) {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { name: teacher.name.trim(), role: 'guru' }
      })
      if (error || !data.user) {
        throw createError({
          statusCode: 422,
          statusMessage: `Akun ${email} gagal dibuat: ${error?.message || 'respons tidak valid'}`
        })
      }
      userId = data.user.id
      role = 'guru'
    }

    const scope = teacher.unit === 'Yayasan' ? 'yayasan' : teacher.unit.toLowerCase()
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, email, name: teacher.name.trim(), role, scope }, { onConflict: 'id' })

    if (profileError) {
      throw createError({ statusCode: 422, statusMessage: `Profil ${email} gagal disimpan: ${profileError.message}` })
    }

    const identityColumn = teacher.nip?.trim() ? 'nip' : 'nik'
    const identityValue = (teacher.nip?.trim() || teacher.nik?.trim()) as string
    const { data: linkedTeacher, error: teacherError } = await supabase
      .from('teachers')
      .update({ user_id: userId })
      .eq(identityColumn, identityValue)
      .select('id')
      .maybeSingle()

    if (teacherError || !linkedTeacher) {
      throw createError({ statusCode: 422, statusMessage: `Guru ${teacher.name} gagal ditautkan ke akun.` })
    }

    accounts.push({ userId, nip: teacher.nip.trim(), name: teacher.name.trim(), email, scope, role })
  }

  return { accounts, skipped }
})
