<template>
  <div :class="{ 'tema-smp': jenjang === 'SMP' }" class="ortu-tema relative flex min-h-screen flex-col overflow-hidden bg-[#F5F8FF] pb-8 font-sans text-[#0F1E38] antialiased">
    <!-- Panel atas navy: tema mengikuti jenjang -->
    <div class="absolute inset-x-0 top-0 h-[380px] overflow-hidden rounded-b-[40px] bg-merek-900">
      <div aria-hidden="true" class="orbit absolute -left-16 -top-64 h-[520px] w-[520px] rounded-full border border-dashed border-white/15" />
      <div aria-hidden="true" class="orbit-2 absolute left-4 -top-40 h-[360px] w-[360px] rounded-full border border-merek-400/30" />
      <div aria-hidden="true" class="absolute -bottom-28 -right-24 h-60 w-60 rounded-full bg-merek-600/35" />
    </div>

    <div class="relative flex flex-col items-center px-6 pt-16 text-center">
      <div class="rise float grid h-[92px] w-[92px] place-items-center rounded-[28px] bg-white shadow-[0_18px_40px_rgba(0,0,0,.25)]">
        <img :src="logo" :alt="`Logo ${jenjang === 'SMP' ? 'SMP' : 'SMK'} IT`" class="h-[66px] w-14 object-contain">
      </div>
      <span class="rise d1 mt-5 inline-flex rounded-full bg-[#F0B429]/15 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-[#F0B429]">
        PORTAL ORANG TUA
      </span>
      <h1 class="rise d2 mb-1.5 mt-3 text-[26px] font-extrabold leading-tight text-white">
        Pantau perkembangan<br>ananda, kapan saja
      </h1>
      <p class="rise d3 text-[13px] leading-relaxed text-white/80">{{ namaSekolah }}</p>
    </div>

    <form class="rise d4 relative z-10 mx-5 mt-7 flex flex-col gap-3.5 rounded-[28px] bg-white px-5 pb-5 pt-6 shadow-[0_24px_60px_rgba(10,42,92,.16)]" novalidate @submit.prevent="kirim">
      <div>
        <h2 class="text-lg font-extrabold text-merek-900">Masuk</h2>
        <p class="mt-1 text-[12.5px] text-[#4B5B78]">Gunakan NIS ananda dan kata sandi dari sekolah.</p>
      </div>

      <!-- Pilih jenjang: segmented control terpisah -->
      <div>
        <span class="mb-1.5 block text-xs font-bold">Jenjang</span>
        <div role="group" aria-label="Pilih jenjang" class="grid grid-cols-2 gap-1 rounded-2xl bg-[#EEF3FB] p-1">
          <button
            v-for="j in daftarJenjang"
            :key="j"
            type="button"
            :aria-pressed="jenjang === j"
            :class="jenjang === j ? 'bg-white text-merek-900 shadow-sm' : 'text-[#4B5B78]'"
            class="min-h-[44px] rounded-xl text-sm font-bold transition-colors"
            @click="jenjang = j"
          >
            {{ j }}
          </button>
        </div>
      </div>

      <label class="flex flex-col gap-1.5 text-xs font-bold">
        NIS Siswa
        <span class="field flex h-[52px] items-center gap-2.5 rounded-2xl border-[1.5px] border-[#E3EAF7] bg-[#F9FBFF] px-3.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5B78" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 10h4M14 14h4"/></svg>
          <input
            v-model.trim="nis"
            type="text"
            inputmode="numeric"
            autocomplete="username"
            placeholder="Masukkan NIS"
            class="min-w-0 flex-1 bg-transparent text-[15px] font-semibold tracking-[0.04em] text-[#0F1E38] outline-none placeholder:font-normal placeholder:text-[#7A8AA6]"
          >
        </span>
      </label>

      <label class="flex flex-col gap-1.5 text-xs font-bold">
        Kata sandi
        <span class="field flex h-[52px] items-center gap-2.5 rounded-2xl border-[1.5px] border-[#E3EAF7] bg-[#F9FBFF] py-0 pl-3.5 pr-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5B78" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          <input
            v-model="kataSandi"
            :type="tampilSandi ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Masukkan kata sandi"
            class="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#0F1E38] outline-none placeholder:font-normal placeholder:text-[#7A8AA6]"
          >
          <button
            type="button"
            :aria-label="tampilSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            class="grid h-11 w-11 place-items-center rounded-xl text-[#4B5B78]"
            @click="tampilSandi = !tampilSandi"
          >
            <svg v-if="tampilSandi" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.1A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6M6.6 7.6A17 17 0 0 0 2.5 12s3.5 6 9.5 6a9.6 9.6 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </span>
      </label>

      <p v-if="pesan" role="alert" class="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-semibold text-rose-700">{{ pesan }}</p>

      <div class="flex items-center justify-between gap-2">
        <label class="flex min-h-[44px] cursor-pointer items-center gap-2 text-[12.5px] font-semibold">
          <input v-model="ingatSaya" type="checkbox" class="h-[18px] w-[18px] accent-merek-600">
          Ingat saya
        </label>
        <a href="#bantuan" class="flex min-h-[44px] items-center text-[12.5px] font-bold text-merek-600">Lupa kata sandi?</a>
      </div>

      <button type="submit" class="press relative flex h-[54px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-merek-600 text-[15px] font-extrabold text-white shadow-[0_12px_26px_rgba(27,95,217,.35)]">
        <span aria-hidden="true" class="shine absolute inset-y-0 left-0 w-[60px] bg-white/20" />
        Masuk ke Portal
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>
      </button>
    </form>

    <div id="bantuan" class="rise d6 mx-5 mt-5 flex items-center gap-3 rounded-[20px] border border-[#F6DFA6] bg-[#FDF3DC] p-4">
      <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0B429] text-merek-900">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <p class="text-xs leading-snug text-[#5C4300]">Belum punya kata sandi atau lupa? Hubungi wali kelas atau Tata Usaha untuk reset akun orang tua.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Masuk · Portal Orang Tua', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const daftarJenjang = ['SMK', 'SMP'] as const
const jenjang = useState<'SMK' | 'SMP'>('ortu-jenjang', () => 'SMK')
const logo = computed(() => (jenjang.value === 'SMP' ? '/asset/logosmp.png' : '/asset/logo.png'))
const namaSekolah = computed(() => (jenjang.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'))

const nis = ref('')
const kataSandi = ref('')
const tampilSandi = ref(false)
const ingatSaya = ref(true)
const pesan = ref('')

// Masuk belum dihubungkan ke server (tahap backend). Hanya validasi form di sisi klien.
const sesi = useState<{ nis: string; jenjang: 'SMK' | 'SMP' } | null>('ortu-sesi', () => null)

function kirim() {
  if (!nis.value) {
    pesan.value = 'NIS wajib diisi.'
    return
  }
  if (!/^\d+$/.test(nis.value)) {
    pesan.value = 'NIS hanya boleh berisi angka.'
    return
  }
  if (!kataSandi.value) {
    pesan.value = 'Kata sandi wajib diisi.'
    return
  }
  // Akun contoh hanya ada di mode dev; blok ini hilang dari production build
  if (import.meta.dev) {
    if (nis.value === '12011994' && kataSandi.value === 'admin123' && jenjang.value === 'SMK') {
      sesi.value = { nis: nis.value, jenjang: 'SMK' }
      navigateTo('/ortu/beranda')
      return
    }
    pesan.value = 'NIS atau kata sandi salah.'
    return
  }
  // Masuk belum dihubungkan ke server (tahap backend)
  pesan.value = 'Masuk belum tersambung ke server. Fitur ini menyusul di tahap berikutnya.'
}
</script>

<style scoped>
.field:focus-within {
  border-color: #1b5fd9;
  box-shadow: 0 0 0 4px rgba(27, 95, 217, 0.14);
}
@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
@keyframes floaty {
  50% { transform: translateY(-8px); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes shine {
  0% { transform: translateX(-140%) skewX(-20deg); }
  55%, 100% { transform: translateX(420%) skewX(-20deg); }
}
.rise { animation: rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.d1 { animation-delay: 0.08s; }
.d2 { animation-delay: 0.16s; }
.d3 { animation-delay: 0.24s; }
.d4 { animation-delay: 0.32s; }
.d6 { animation-delay: 0.48s; }
.float { animation: floaty 5s ease-in-out infinite; }
.orbit { animation: spin 28s linear infinite; }
.orbit-2 { animation: spin 40s linear infinite reverse; }
.shine { animation: shine 3.8s ease-in-out infinite; }
.press { transition: transform 0.18s ease; }
.press:active { transform: scale(0.97); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
</style>
