<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePageMeta({ layout: false })

useHead({ title: 'Ganti Kata Sandi — Admin Portal Darqia 9' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const sandiBaru = ref('')
const konfirmasi = ref('')
const sibuk = ref(false)
const galat = ref('')
const berhasil = ref(false)

const emailSaya = computed(() => (user.value as any)?.email || '')
const namaSaya = computed(() => {
  const m = (user.value as any)?.user_metadata || {}
  return m.name || m.full_name || emailSaya.value
})

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return navigateTo('/adminV2/login')
  if (!data.user.user_metadata?.must_change_password) return navigateTo('/adminV2')
})

const keluar = async () => {
  await supabase.auth.signOut({ scope: 'local' })
  return navigateTo('/adminV2/login')
}

const simpan = async () => {
  galat.value = ''
  if (sandiBaru.value.length < 8) {
    galat.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }
  if (sandiBaru.value !== konfirmasi.value) {
    galat.value = 'Konfirmasi kata sandi tidak sama.'
    return
  }
  sibuk.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: sandiBaru.value,
      data: { must_change_password: false }
    })
    if (error) throw error
    await supabase.auth.refreshSession()
    berhasil.value = true
    setTimeout(() => navigateTo('/adminV2', { replace: true }), 1200)
  } catch (e: any) {
    galat.value = e?.message || 'Kata sandi gagal diganti. Coba lagi.'
  } finally {
    sibuk.value = false
  }
}

const kelasInput = 'w-full min-h-11 px-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#101828] outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#1B5FD9]/15 placeholder:text-[#98A2B3]'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0A2A5C] via-[#0D2F63] to-[#123E7C] flex items-center justify-center p-4 font-sans">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
      <div class="w-12 h-12 rounded-[11px] bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C] flex items-center justify-center text-white text-xl font-extrabold">
        D
      </div>
      <h1 class="text-xl font-extrabold text-[#101828] mt-4">Ganti Kata Sandi Awal</h1>
      <p class="text-sm text-[#667085] mt-1.5">
        Halo, <strong class="text-[#344054]">{{ namaSaya }}</strong>. Kata sandi akun Anda dibuatkan oleh administrator,
        jadi demi keamanan Anda wajib menggantinya sebelum mulai menggunakan portal.
      </p>
      <p v-if="emailSaya" class="text-xs text-[#98A2B3] mt-2">{{ emailSaya }}</p>

      <div v-if="berhasil" class="mt-6 text-sm font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] rounded-xl px-4 py-3" role="status">
        Kata sandi berhasil diganti. Mengalihkan ke portal…
      </div>

      <form v-else class="mt-6 space-y-4" @submit.prevent="simpan">
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5" for="gp-baru">Kata sandi baru</label>
          <input id="gp-baru" v-model="sandiBaru" type="password" autocomplete="new-password" :class="kelasInput" placeholder="Minimal 8 karakter">
        </div>
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5" for="gp-konfirmasi">Konfirmasi kata sandi baru</label>
          <input id="gp-konfirmasi" v-model="konfirmasi" type="password" autocomplete="new-password" :class="kelasInput" placeholder="Ulangi kata sandi baru">
        </div>
        <p v-if="galat" class="text-sm text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-xl px-3.5 py-2.5">{{ galat }}</p>
        <button type="submit" :disabled="sibuk" class="w-full min-h-11 px-4 rounded-xl bg-[#101828] text-white text-sm font-bold hover:bg-[#1D2939] disabled:opacity-60">
          {{ sibuk ? 'Menyimpan…' : 'Simpan Kata Sandi Baru' }}
        </button>
        <button type="button" class="w-full min-h-10 px-4 rounded-xl text-sm font-bold text-[#667085] hover:text-[#344054]" @click="keluar">
          Keluar dari akun
        </button>
      </form>
    </div>
  </div>
</template>
