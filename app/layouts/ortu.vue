<template>
  <div :class="{ 'tema-smp': jenjang === 'SMP' }" class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased">
    <p v-if="isDev"class="bg-[#F0B429] px-4 py-1 text-center text-[11px] font-bold text-[#0A2A5C]">Data contoh · mode pengembangan</p>
    <header class="sticky top-0 z-30 bg-merek-900 text-white">
      <div class="mx-auto flex h-16 max-w-md items-center gap-3 px-4">
        <img :src="logo" :alt="`Logo ${jenjang}`" class="h-10 w-auto shrink-0 rounded-lg bg-white p-1">
        <p class="min-w-0 flex-1 truncate text-[15px] font-extrabold">Portal Orang Tua</p>
        <NuxtLink to="/ortu/notifikasi" aria-label="Notifikasi" class="relative grid h-11 w-11 place-items-center rounded-xl hover:bg-white/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>
        </NuxtLink>
        <NuxtLink to="/ortu/profil" aria-label="Profil" class="grid h-11 w-11 place-items-center rounded-xl hover:bg-white/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-md px-4 pb-32 pt-5">
      <slot />
    </main>

    <nav aria-label="Menu utama" class="fixed inset-x-0 bottom-4 z-30 mx-auto max-w-md px-4">
      <ul class="grid grid-cols-5 gap-1 rounded-3xl bg-merek-900 p-2 shadow-[0_18px_40px_rgba(10,42,92,.28)]">
        <li v-for="item in menu" :key="item.to">
          <NuxtLink
            :to="item.to"
            :aria-current="isAktif(item.to) ? 'page' : undefined"
            :class="isAktif(item.to) ? 'bg-[#F0B429] text-[#0A2A5C]' : 'text-white/75 hover:text-white'"
            class="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="item.ikon" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isDev = import.meta.dev
// Jenjang dipilih di halaman masuk dan disimpan di state bersama
const jenjang = useState<'SMK' | 'SMP'>('ortu-jenjang', () => 'SMK')
const logo = computed(() => (jenjang.value === 'SMP' ? '/asset/logosmp.png' : '/asset/logo.png'))

const menu = [
  { to: '/ortu/beranda', label: 'Home', ikon: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>' },
  { to: '/ortu/akademik', label: 'Akademik', ikon: '<path d="M4 5h11a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>' },
  { to: '/ortu/ujian', label: 'Ujian', ikon: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>' },
  { to: '/ortu/administrasi', label: 'Administrasi', ikon: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>' },
  { to: '/ortu/rekap', label: 'Rekap', ikon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' }
]

const isAktif = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>
