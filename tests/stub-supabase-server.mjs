// Pengganti "#supabase/server" untuk tes: perilaku diatur lewat globalThis.__authUji ('staf' | 'siswa' | 'anonim').
export const serverSupabaseUser = async () => (globalThis.__authUji === 'anonim' ? null : { sub: 'akun-uji' })
export const serverSupabaseClient = async () => ({
  rpc: async () => ({ data: globalThis.__authUji === 'staf', error: null })
})
