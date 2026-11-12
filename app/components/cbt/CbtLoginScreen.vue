<template>
  <section
    ref="latar"
    v-show="screen === 'login'"
    class="relative overflow-hidden min-h-screen flex flex-col bg-merek-d1 text-slate-900 font-sans antialiased"
    @mousemove="ikuti"
    @touchstart.passive="ikuti"
    @touchmove.passive="ikuti"
  >
    <!-- Latar: motif bintang delapan + dua cahaya yang bergeser pelan + sorotan yang mengikuti jari/kursor.
         Hanya transform/opacity (tanpa blur) agar ringan di HP lawas. -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="cahaya cahaya-a" />
      <div class="cahaya cahaya-b" />
      <div class="cahaya cahaya-c" />
      <div class="motif" :style="{ backgroundImage: motif }" />
      <div class="grain" />
      <div
        class="sorot"
        :style="{
          transform: `translate3d(${pos.x - 180}px, ${pos.y - 180}px, 0)`,
          backgroundImage: `${motif}, radial-gradient(closest-side, rgb(var(--m-400) / .32), transparent)`,
          backgroundPosition: `${180 - pos.x}px ${180 - pos.y}px, 0 0`
        }"
      />
    </div>

    <main class="relative flex-1 w-full max-w-md mx-auto px-4 pt-10 pb-8 flex flex-col items-center">
      <!-- Identitas & Logo Sekolah -->
      <div class="relative">
        <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center shadow-xl shadow-merek-950/40">
          <img :src="activeGrade === 'SMP' ? '/asset/logosmp.png' : '/asset/logo.png'" alt="Logo Sekolah" class="w-full h-full object-contain">
        </div>
      </div>
      <p class="mt-3 text-xs font-black text-merek-100 text-center tracking-tight">{{ jenjangText }}</p>
      <span class="mt-2.5 inline-flex px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/15 text-merek-100 border border-white/20 shadow-2xs">
        Tahun Ajaran {{ tahunAjaran }}
      </span>

      <h1 class="mt-4 text-3xl font-black text-white tracking-tight text-center">Portal Ujian Online</h1>
      <p class="mt-2 text-xs sm:text-sm text-merek-100/90 leading-relaxed font-medium text-center max-w-sm">
        Masuk menggunakan akun peserta yang telah diverifikasi oleh panitia ujian untuk memulai sesi pengerjaan.
      </p>

      <!-- Kartu Form Login -->
      <div class="mt-6 w-full bg-white rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] border border-slate-200/80">
        <form autocomplete="off" class="space-y-4" @submit.prevent="emit('login')">
          <div>
            <label for="f-nis" class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Nomor Peserta / NIS</label>
            <input
              id="f-nis"
              v-model="loginForm.nis"
              inputmode="numeric"
              autocomplete="username"
              placeholder="Contoh: 1130"
              class="w-full px-4 py-3 text-sm font-mono font-bold bg-slate-50 border-2 border-slate-200/90 rounded-2xl focus:bg-white focus:border-merek-600 focus:ring-4 focus:ring-merek-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal"
            >
          </div>
          <div>
            <label for="f-kode" class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Token Ujian</label>
            <input
              id="f-kode"
              v-model="loginForm.kode"
              autocomplete="off"
              autocapitalize="characters"
              placeholder="Contoh: EFXZCHEL"
              class="w-full px-4 py-3 text-sm font-mono uppercase font-black tracking-wider bg-slate-50 border-2 border-slate-200/90 rounded-2xl focus:bg-white focus:border-merek-600 focus:ring-4 focus:ring-merek-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
            >
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="from-merek-600 via-merek-700 to-merek2-700 shadow-merek-500/30 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r text-white font-black text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{{ loading ? 'Memeriksa Akun Peserta…' : 'Masuk Sesi Ujian' }}</span>
          </button>
        </form>
      </div>

      <!-- Card Sistem Integritas Ujian -->
      <div class="mt-4 w-full bg-gradient-to-br from-merek-d1 via-merek-d2 to-merek-d3 rounded-3xl p-5 text-white shadow-xl shadow-merek-950/20 border border-white/10 space-y-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h2 class="text-xs font-black uppercase tracking-wider text-merek-200">Sistem Integritas Ujian</h2>
        </div>
        <ul class="space-y-2.5 text-xs text-slate-200 leading-relaxed">
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span><b>Jawaban tersimpan otomatis</b> ke server setiap 10 detik.</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span><b>Pindah tab atau keluar aplikasi</b> terdeteksi dan memicu peringatan.</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span><b>Pelanggaran ke-3</b> mengunci akunmu dari sesi ujian tersebut.</span>
          </li>
        </ul>
      </div>
    </main>

    <footer class="relative w-full text-center py-5 px-4 text-[11px] text-merek-100/80 border-t border-white/10 font-medium">
      Butuh bantuan? Hubungi proktor atau panitia ujian. &copy; 2026 {{ jenjangText }}
    </footer>
  </section>
</template>

<script setup lang="ts">
import type { LoginForm } from '~/composables/useCbtExam'
import { useAdminGrade } from '~/composables/useAdminGrade'

defineProps<{
  screen: string
  jenjangText: string
  loginForm: LoginForm
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'login'): void
}>()

const activeGrade = useAdminGrade()

// Tahun ajaran berganti setiap Juli.
const sekarang = new Date()
const mulaiTahun = sekarang.getMonth() >= 6 ? sekarang.getFullYear() : sekarang.getFullYear() - 1
const tahunAjaran = `${mulaiTahun}/${mulaiTahun + 1}`

// Ubin motif bintang delapan (dua persegi bertumpuk + garis penghubung), garis putih tipis.
const motif = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" stroke="white" stroke-width="1"><path d="M18 18h28v28H18zM32 12.2 51.8 32 32 51.8 12.2 32zM0 32h12.2M51.8 32H64M32 0v12.2M32 51.8V64M0 0l18 18M64 0 46 18M0 64l18-18M64 64 46 46"/></svg>')}")`

// Sorotan mengikuti jari/kursor; posisi diperbarui paling banyak sekali per frame.
const latar = ref<HTMLElement | null>(null)
const pos = reactive({ x: 200, y: 160 })
let antre = false
const ikuti = (e: MouseEvent | TouchEvent) => {
  const t = 'touches' in e ? e.touches[0] : e
  if (!t || !latar.value || antre) return
  const r = latar.value.getBoundingClientRect()
  const x = t.clientX - r.left
  const y = t.clientY - r.top
  antre = true
  requestAnimationFrame(() => { pos.x = x; pos.y = y; antre = false })
}
onMounted(() => { if (latar.value) pos.x = latar.value.clientWidth / 2 })
</script>

<style scoped>
/* Gradasi mesh: tiga gumpalan warna merek di atas dasar gelap, bergeser pelan. */
.cahaya {
  position: absolute;
  width: 680px;
  height: 680px;
  border-radius: 9999px;
  will-change: transform;
}
.cahaya-a {
  top: -260px;
  left: -260px;
  background: radial-gradient(closest-side, rgb(var(--m-500) / .7), rgb(var(--m-600) / .25) 55%, transparent);
  animation: geser-a 16s ease-in-out infinite alternate;
}
.cahaya-b {
  top: 22%;
  right: -320px;
  background: radial-gradient(closest-side, rgb(var(--m2-400) / .55), rgb(var(--m2-600) / .2) 55%, transparent);
  animation: geser-b 20s ease-in-out infinite alternate;
}
.cahaya-c {
  bottom: -300px;
  left: -120px;
  width: 760px;
  height: 760px;
  background: radial-gradient(closest-side, rgb(var(--m-400) / .5), rgb(var(--m-700) / .25) 55%, transparent);
  animation: geser-c 24s ease-in-out infinite alternate;
}
@keyframes geser-a { to { transform: translate3d(180px, 140px, 0) } }
@keyframes geser-b { to { transform: translate3d(-200px, 120px, 0) } }
@keyframes geser-c { to { transform: translate3d(160px, -160px, 0) } }

.motif {
  position: absolute;
  inset: 0;
  opacity: .08;
  -webkit-mask-image: radial-gradient(120% 90% at 50% 20%, #000 35%, rgba(0, 0, 0, .25));
  mask-image: radial-gradient(120% 90% at 50% 20%, #000 35%, rgba(0, 0, 0, .25));
}
/* Tekstur grain halus ala poster gradasi; ubin statis, sekali gambar. */
.grain {
  position: absolute;
  inset: 0;
  opacity: .14;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.sorot {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  height: 360px;
  opacity: .55;
  will-change: transform;
  transition: transform .5s cubic-bezier(.16, 1, .3, 1), background-position .5s cubic-bezier(.16, 1, .3, 1);
  -webkit-mask-image: radial-gradient(closest-side, #000, transparent);
  mask-image: radial-gradient(closest-side, #000, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .cahaya { animation: none }
  .sorot { transition: none }
}
</style>