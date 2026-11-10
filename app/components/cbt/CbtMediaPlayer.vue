<template>
  <div class="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1730] via-[#12295A] to-[#1B3F8F] text-white shadow-[0_18px_40px_-18px_rgba(18,41,90,0.65)] ring-1 ring-white/10">
    <!-- Kepala kartu -->
    <div class="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-blue-100">
        <span class="h-1.5 w-1.5 rounded-full" :class="main || aktif ? 'bg-emerald-400 animate-pulse' : 'bg-blue-300'" />
        {{ type === 'audio' ? 'Audio Soal' : 'Video Soal' }}
      </span>
      <span class="min-w-0 truncate text-xs font-bold text-white/90">{{ judul }}</span>
    </div>

    <!-- Tanpa media -->
    <div v-if="!url" class="mx-4 mb-4 rounded-2xl bg-white/10 p-4 text-xs font-semibold text-blue-100">Media soal belum tersedia. Hubungi pengawas.</div>

    <!-- YouTube (video atau audio): pratinjau dulu, pemutar baru dimuat saat diketuk agar halaman tetap ringan -->
    <div v-else-if="sumber.jenis === 'youtube'" class="mx-3 mb-3 relative aspect-video overflow-hidden rounded-2xl bg-black">
      <iframe
        v-if="aktif"
        class="absolute inset-0 w-full h-full"
        :src="`https://www.youtube-nocookie.com/embed/${sumber.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`"
        :title="judul"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      />
      <button v-else type="button" class="group absolute inset-0 w-full h-full" :aria-label="`Putar ${judul}`" @click="aktif = true">
        <img :src="`https://i.ytimg.com/vi/${sumber.id}/hqdefault.jpg`" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-500 group-hover:scale-110">
        <span class="absolute inset-0 bg-gradient-to-t from-[#0B1730] via-[#0B1730]/40 to-transparent" />
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span class="absolute inset-0 rounded-full bg-white/40 animate-ping" />
          <span class="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1B3F8F] shadow-2xl transition-transform group-hover:scale-110 group-active:scale-95">
            <svg class="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20" /></svg>
          </span>
        </span>
        <span class="absolute bottom-3 left-0 right-0 text-center text-xs font-bold text-white/90">Ketuk untuk memutar</span>
      </button>
    </div>

    <!-- Google Drive: video, atau audio yang tidak bisa diputar langsung, memakai pemutar pratinjau Drive -->
    <div v-else-if="sumber.jenis === 'drive' && (type === 'video' || pakaiPratinjau)" class="mx-3 mb-3 overflow-hidden rounded-2xl bg-black" :class="type === 'video' ? 'relative aspect-video' : 'relative h-24'">
      <iframe class="absolute inset-0 w-full h-full" :src="`https://drive.google.com/file/d/${sumber.id}/preview`" :title="judul" allow="autoplay" loading="lazy" />
    </div>

    <!-- Video berkas langsung (mp4) -->
    <div v-else-if="type === 'video'" class="mx-3 mb-3 overflow-hidden rounded-2xl bg-black">
      <video :src="sumber.url" controls playsinline preload="metadata" class="w-full aspect-video" />
    </div>

    <!-- Audio berkas langsung / Google Drive: pemutar buatan sendiri -->
    <div v-else class="px-4 pb-4">
      <audio
        ref="audio"
        :src="sumber.url"
        preload="none"
        @loadedmetadata="durasi = audio?.duration || 0"
        @timeupdate="posisi = audio?.currentTime || 0"
        @play="main = true"
        @pause="main = false"
        @ended="main = false"
        @waiting="muat = true"
        @playing="muat = false"
        @error="gagal"
      />
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="relative h-16 w-16 shrink-0 rounded-full bg-white text-[#1B3F8F] flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(255,255,255,0.55)] transition-transform hover:scale-105 active:scale-95"
          :aria-label="main ? 'Jeda audio' : 'Putar audio'"
          @click="putar"
        >
          <span v-if="main" class="absolute inset-0 rounded-full ring-4 ring-white/30 animate-ping" />
          <svg v-if="muat" class="w-7 h-7 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" /></svg>
          <svg v-else-if="main" class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
          <svg v-else class="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20" /></svg>
        </button>

        <!-- Gelombang suara: bergerak saat audio diputar -->
        <div class="flex h-12 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden="true">
          <span
            v-for="(t, i) in GELOMBANG"
            :key="i"
            class="w-1 flex-1 rounded-full transition-colors duration-300"
            :class="[(i / GELOMBANG.length) * 100 <= persen ? 'bg-white' : 'bg-white/25', main ? 'gelombang-main' : '']"
            :style="{ height: `${t}%`, animationDelay: `${(i % 7) * 90}ms` }"
          />
        </div>
      </div>

      <!-- Bilah posisi -->
      <div class="mt-3">
        <div class="relative h-2 rounded-full bg-white/15">
          <div class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-300 to-white" :style="{ width: `${persen}%` }" />
          <input
            type="range"
            min="0"
            :max="durasi || 0"
            step="0.1"
            :value="posisi"
            aria-label="Posisi audio"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
            :disabled="!durasi"
            @input="geser"
          >
        </div>
        <div class="mt-1.5 flex items-center justify-between text-[11px] font-bold tabular-nums text-blue-100">
          <span>{{ waktu(posisi) }}</span>
          <span>{{ durasi ? waktu(durasi) : '--:--' }}</span>
        </div>
      </div>

      <!-- Kontrol -->
      <div class="mt-2 flex items-center justify-center gap-2">
        <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold hover:bg-white/20 disabled:opacity-40" :disabled="!durasi" @click="lompat(-10)">− 10 dtk</button>
        <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold hover:bg-white/20 tabular-nums" @click="gantiKecepatan">{{ kecepatan }}x</button>
        <button type="button" class="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold hover:bg-white/20 disabled:opacity-40" :disabled="!durasi" @click="lompat(10)">+ 10 dtk</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { extractYouTubeId } from '~/utils/cbtFormula'

const props = defineProps<{ type: 'audio' | 'video', url?: string, title?: string }>()
const emit = defineEmits<{ (e: 'toast', pesan: string): void }>()

const judul = computed(() => props.title || (props.type === 'audio' ? 'Audio Ujian' : 'Video Ujian'))

// Sumber media: YouTube (termasuk Shorts), Google Drive, atau tautan berkas langsung (mp3/mp4).
const sumber = computed<{ jenis: 'youtube' | 'drive' | 'langsung', id: string, url: string }>(() => {
  const url = (props.url || '').trim()
  const yt = extractYouTubeId(url) || /youtube\.com\/shorts\/([\w-]{11})/.exec(url)?.[1]
  if (yt) return { jenis: 'youtube', id: yt, url }
  const drive = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/.exec(url)?.[1]
  if (drive) return { jenis: 'drive', id: drive, url: `https://drive.google.com/uc?export=download&id=${drive}` }
  return { jenis: 'langsung', id: '', url }
})

// Tinggi batang gelombang (tetap, agar tidak memberatkan HP).
const GELOMBANG = [35, 60, 45, 80, 55, 95, 70, 40, 65, 90, 50, 75, 30, 85, 60, 45, 70, 55, 90, 40, 65, 80, 50, 35]

const aktif = ref(false)
const audio = ref<HTMLAudioElement | null>(null)
const main = ref(false)
const muat = ref(false)
const posisi = ref(0)
const durasi = ref(0)
const kecepatan = ref(1)
const pakaiPratinjau = ref(false)
const persen = computed(() => durasi.value ? Math.min(100, posisi.value / durasi.value * 100) : 0)

const waktu = (detik: number) => {
  const s = Math.max(0, Math.floor(detik))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
const putar = () => {
  const el = audio.value
  if (!el) return
  if (el.paused) { muat.value = el.readyState < 3; void el.play().catch(() => { muat.value = false }) } else el.pause()
}
const geser = (e: Event) => { if (audio.value) audio.value.currentTime = Number((e.target as HTMLInputElement).value) }
const lompat = (detik: number) => { if (audio.value) audio.value.currentTime = Math.min(durasi.value, Math.max(0, audio.value.currentTime + detik)) }
const gantiKecepatan = () => {
  const urutan = [1, 1.25, 0.75]
  kecepatan.value = urutan[(urutan.indexOf(kecepatan.value) + 1) % urutan.length]!
  if (audio.value) audio.value.playbackRate = kecepatan.value
}
// Berkas Drive kadang tidak bisa diputar langsung (izin/ukuran): pindah ke pemutar pratinjau Drive.
const gagal = () => {
  muat.value = false
  if (sumber.value.jenis === 'drive') { pakaiPratinjau.value = true; return }
  emit('toast', 'Audio tidak dapat diputar. Periksa koneksi atau hubungi pengawas.')
}
</script>

<style scoped>
.gelombang-main { animation: gelombang 0.9s ease-in-out infinite alternate; transform-origin: center; }
@keyframes gelombang { from { transform: scaleY(0.55); } to { transform: scaleY(1); } }
@media (prefers-reduced-motion: reduce) { .gelombang-main { animation: none; } }
</style>
