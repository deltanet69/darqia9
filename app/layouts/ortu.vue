<template>
  <div class="ortu" :style="gayaTema()">
    <div style="position:absolute;left:0;right:0;top:0;height:64px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 16px 0 20px;box-sizing:border-box;background:rgba(247,249,253,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:6">
      <NuxtLink to="/ortu" style="display:flex;align-items:center;gap:10px;min-width:0" aria-label="Beranda">
        <span style="width:36px;height:36px;border-radius:11px;background:#fff;box-shadow:0 2px 8px rgba(10,42,92,.12);display:flex;align-items:center;justify-content:center;flex:none">
          <img :src="tema.logo" alt="" width="26" height="26" style="width:26px;height:26px;object-fit:contain">
        </span>
        <span style="font-size:16px;font-weight:600;color:var(--p0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ tema.singkat }}</span>
      </NuxtLink>
      <div style="display:flex;align-items:center;gap:8px;flex:none">
        <button class="press" type="button" :aria-label="jumlahBaru ? `Pemberitahuan, ${jumlahBaru} baru` : 'Pemberitahuan'" style="position:relative;width:44px;height:44px;border-radius:50%;background:var(--soft);display:flex;align-items:center;justify-content:center;color:var(--p1)" @click="bukaNotif">
          <span :class="jumlahBaru ? 'swing' : ''" style="display:flex">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
          </span>
          <span v-if="jumlahBaru" class="badge" style="position:absolute;top:-2px;right:-2px;min-width:19px;height:19px;border-radius:10px;background:#D92D20;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2.5px #F7F9FD">{{ jumlahBaru }}</span>
        </button>
        <NuxtLink to="/ortu/profil" class="press" aria-label="Profil saya" :style="`display:flex;align-items:center;gap:6px;height:44px;padding:0 16px 0 12px;border-radius:22px;background:${diProfil ? 'var(--p1)' : 'var(--soft)'};color:${diProfil ? '#fff' : 'var(--p1)'};transition:background .35s,color .35s`">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
          <span style="font-size:15px;font-weight:600">Profil</span>
        </NuxtLink>
      </div>
    </div>

    <main ref="gulir" class="scr scroll on">
      <slot />
    </main>

    <!-- Panel & lembar dari halaman (Teleport) diletakkan di sini agar posisinya relatif ke bingkai portal -->
    <div id="ortu-lapis" style="display:contents" />

    <div v-if="toast.teks" :key="toast.n" class="toast" role="status" style="position:absolute;left:50%;bottom:104px;margin-left:-150px;width:300px;min-height:46px;padding:0 14px;box-sizing:border-box;border-radius:23px;background:#14213D;color:#fff;font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;z-index:30;text-align:center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{{ toast.teks }}
    </div>

    <nav aria-label="Menu utama" style="position:absolute;left:0;right:0;bottom:0;height:88px;box-sizing:border-box;padding:8px 10px 18px;background:rgba(255,255,255,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid #E6ECF7;z-index:5">
      <div :style="`position:absolute;top:8px;left:10px;width:calc((100% - 20px) / 4);height:34px;pointer-events:none;transition:transform .55s cubic-bezier(.2,.8,.2,1);transform:translateX(${Math.max(0, indeksTab) * 100}%)`">
        <div :style="`margin:0 auto;width:60px;height:34px;border-radius:17px;background:var(--soft);opacity:${indeksTab >= 0 ? 1 : 0};transition:opacity .35s`" />
      </div>
      <div style="position:relative;display:flex;height:100%">
        <NuxtLink v-for="(t, i) in TAB" :key="t.ke" :to="t.ke" :aria-current="i === indeksTab ? 'page' : undefined" :style="`flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;color:${i === indeksTab ? 'var(--p1)' : '#64748B'};transition:color .35s`">
          <span style="width:60px;height:34px;display:flex;align-items:center;justify-content:center">
            <svg v-if="i === 0" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
            <svg v-else-if="i === 1" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.5v4M16 2.5v4M3 10h18M8.5 15l2.5 2.5L15.5 13" /></svg>
            <svg v-else-if="i === 2" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 20v-8M12 20V5M19 20v-5" /></svg>
            <svg v-else width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></svg>
          </span>
          <span style="font-size:13px;font-weight:500">{{ t.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <div v-if="notifBuka" class="fade" style="position:absolute;inset:0;background:rgba(10,30,70,.4);z-index:20" @click="tutupNotif">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Pemberitahuan" style="position:absolute;left:0;right:0;bottom:0;background:#F7F9FD;border-radius:30px 30px 0 0;padding:14px 20px 26px;max-height:88%;overflow-y:auto;box-sizing:border-box" @click.stop>
        <div style="width:44px;height:5px;border-radius:3px;background:#DCE4F2;margin:0 auto 16px" />
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h2 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-.02em;color:var(--p0)">Pemberitahuan</h2>
          <div v-if="jumlahBaru" style="padding:4px 12px;border-radius:999px;background:#FDECEC;color:#9A1F1F;font-size:14px;font-weight:600">{{ jumlahBaru }} baru</div>
        </div>
        <div style="margin-top:2px;font-size:15px;color:#51607F">{{ daftarNotif.length ? 'Ketuk untuk melihat selengkapnya' : 'Belum ada pemberitahuan.' }}</div>
        <button v-for="(n, i) in daftarNotif" :key="n.id" type="button" class="press up" :style="`animation-delay:${0.04 + i * 0.06}s;display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;margin-top:10px;padding:14px 16px;border-radius:20px;background:#fff;box-shadow:0 4px 16px rgba(10,42,92,.06)`" @click="pilihNotif(n.ke)">
          <span :style="`width:44px;height:44px;border-radius:14px;background:${WARNA[n.jenis].tile};color:${WARNA[n.jenis].ink};display:flex;align-items:center;justify-content:center;flex:none`">
            <svg v-if="n.jenis === 'presensi'" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.5v4M16 2.5v4M3 10h18M8.5 15l2.5 2.5L15.5 13" /></svg>
            <svg v-else-if="n.jenis === 'nilai'" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 20v-8M12 20V5M19 20v-5" /></svg>
            <svg v-else-if="n.jenis === 'tagihan'" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></svg>
            <svg v-else width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 10h5M7 14h3" /><circle cx="16.5" cy="12" r="1.8" /></svg>
          </span>
          <span style="flex:1;min-width:0">
            <span :style="`display:block;font-size:16px;line-height:1.3;font-weight:${n.baru ? 600 : 500};color:#14213D`">{{ n.judul }}</span>
            <span style="display:block;margin-top:2px;font-size:14px;line-height:1.35;color:#51607F">{{ n.sub }}</span>
          </span>
          <span style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex:none">
            <span style="font-size:12px;color:#64748B">{{ n.waktuTeks }}</span>
            <span v-if="n.baru" style="width:10px;height:10px;border-radius:50%;background:#D92D20" />
          </span>
        </button>
        <button type="button" class="press" style="width:100%;height:54px;margin-top:16px;border-radius:17px;background:var(--p1);color:#fff;font-size:17px;font-weight:600;text-align:center" @click="tutupNotif">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/ortu.css'
import { tanggalWib } from '~/composables/dashboardCore'

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const { tema, gayaTema, ringkasan, muatRingkasan, bacaDibaca, tandaiDibaca, toast, dibaca } = useOrtu()

const TAB = [
  { ke: '/ortu', label: 'Beranda' },
  { ke: '/ortu/presensi', label: 'Presensi' },
  { ke: '/ortu/nilai', label: 'Nilai' },
  { ke: '/ortu/administrasi', label: 'Administrasi' }
]
const WARNA = {
  presensi: { tile: '#DCFCE7', ink: '#14532D' },
  nilai: { tile: '#FFF1CC', ink: '#7A4B05' },
  tagihan: { tile: '#FDECEC', ink: '#9A1F1F' },
  kartu: { tile: '#E3EEFF', ink: '#1E40AF' }
} as const

const jalur = computed(() => route.path.replace(/\/$/, '').toLowerCase() || '/')
const indeksTab = computed(() => TAB.findIndex(t => t.ke === jalur.value || (jalur.value === '/' && t.ke === '/ortu')))
const diProfil = computed(() => jalur.value === '/ortu/profil')

// Halaman berganti: kembalikan gulir ke atas (yang menggulir adalah .scr, bukan jendela).
const gulir = ref<HTMLElement | null>(null)
watch(() => route.path, () => { if (gulir.value) gulir.value.scrollTop = 0 })

const notifBuka = ref(false)
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const waktuTeks = (iso: string) => {
  const t = tanggalWib(new Date(iso))
  const kini = tanggalWib()
  if (t === kini) return 'Hari ini'
  if (t === tanggalWib(new Date(Date.now() - 86400_000))) return 'Kemarin'
  const [, m, d] = t.split('-').map(Number)
  return `${d} ${BULAN[m! - 1]}`
}
const daftarNotif = computed(() => {
  const sudah = dibaca.value ?? {}
  return (ringkasan.value?.notif ?? []).map(n => ({ ...n, baru: !sudah[n.id], waktuTeks: waktuTeks(n.waktu) }))
})
const jumlahBaru = computed(() => daftarNotif.value.filter(n => n.baru).length)

const bukaNotif = () => { notifBuka.value = true }
const tutupNotif = () => {
  notifBuka.value = false
  tandaiDibaca(daftarNotif.value.map(n => n.id))
}
const pilihNotif = (ke: string) => {
  tutupNotif()
  navigateTo(ke)
}
const tombolEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && notifBuka.value) tutupNotif() }

onMounted(() => {
  bacaDibaca()
  muatRingkasan().catch(() => {})
  window.addEventListener('keydown', tombolEsc)
})
onBeforeUnmount(() => window.removeEventListener('keydown', tombolEsc))
</script>
