<template>
  <div class="rounded-2xl border-2 border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-4 shadow-sm antialiased text-slate-900">
    <!-- State Tanpa Media -->
    <div v-if="!url" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
      <svg class="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Berkas media soal belum tersedia. Hubungi pengawas atau proktor.</span>
    </div>

    <!-- YouTube Player (Video / Audio YouTube) -->
    <div v-else-if="sumber.jenis === 'youtube'" class="space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wider">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          <span>Video Soal Interaktif</span>
        </span>
        <span class="text-xs font-bold text-slate-500 truncate max-w-[200px]">{{ judul }}</span>
      </div>
      <div class="relative aspect-video overflow-hidden rounded-xl bg-black border border-slate-200 shadow-inner">
        <iframe
          v-if="aktif"
          class="absolute inset-0 w-full h-full"
          :src="`https://www.youtube-nocookie.com/embed/${sumber.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`"
          :title="judul"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        />
        <button v-else type="button" class="group absolute inset-0 w-full h-full cursor-pointer" :aria-label="`Putar ${judul}`" @click="aktif = true">
          <img :src="`https://i.ytimg.com/vi/${sumber.id}/hqdefault.jpg`" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-500 group-hover:scale-110">
          <span class="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform group-hover:scale-110 group-active:scale-95">
            <svg class="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20" /></svg>
          </span>
          <span class="absolute bottom-3 left-0 right-0 text-center text-xs font-bold text-white">Ketuk untuk memutar video</span>
        </button>
      </div>
    </div>

    <!-- Google Drive Preview Video -->
    <div v-else-if="sumber.jenis === 'drive' && (type === 'video' || pakaiPratinjau)" class="space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wider">
          <span>Pratinjau Media Soal</span>
        </span>
        <span class="text-xs font-bold text-slate-500 truncate max-w-[200px]">{{ judul }}</span>
      </div>
      <div class="overflow-hidden rounded-xl bg-black border border-slate-200" :class="type === 'video' ? 'relative aspect-video' : 'relative h-28'">
        <iframe class="absolute inset-0 w-full h-full" :src="`https://drive.google.com/file/d/${sumber.id}/preview`" :title="judul" allow="autoplay" loading="lazy" />
      </div>
    </div>

    <!-- Video Berkas Langsung (MP4) -->
    <div v-else-if="type === 'video'" class="space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-black text-blue-700 uppercase tracking-wider">Video Soal</span>
        <span class="text-xs font-bold text-slate-500 truncate max-w-[200px]">{{ judul }}</span>
      </div>
      <div class="overflow-hidden rounded-xl bg-black border border-slate-200">
        <video :src="sumber.url" controls playsinline preload="metadata" class="w-full aspect-video" />
      </div>
    </div>

    <!-- Pemutar Audio Standar, Keren & Interaktif (WhatsApp / Spotify Style) -->
    <div v-else class="space-y-3">
      <audio
        ref="audio"
        :src="sumber.url"
        preload="metadata"
        @loadedmetadata="durasi = audio?.duration || 0"
        @timeupdate="posisi = audio?.currentTime || 0"
        @play="main = true"
        @pause="main = false"
        @ended="main = false"
        @waiting="muat = true"
        @playing="muat = false"
        @error="gagal"
      />

      <!-- Baris Atas: Label Audio Soal & Judul -->
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-blue-100">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </div>
          <span class="text-xs font-black text-slate-900 truncate">{{ judul }}</span>
        </div>
        <span
          class="shrink-0 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1"
          :class="main ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="main ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'" />
          <span>{{ main ? 'Memutar' : 'Jeda' }}</span>
        </span>
      </div>

      <!-- Baris Pemutar Inti: Play Button + Progress Scrubber -->
      <div class="flex items-center gap-3">
        <!-- Tombol Play / Pause Besar & Jelas -->
        <button
          type="button"
          class="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
          :aria-label="main ? 'Jeda audio' : 'Putar audio'"
          @click="putar"
        >
          <svg v-if="muat" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" /></svg>
          <svg v-else-if="main" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
          <svg v-else class="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20" /></svg>
        </button>

        <!-- Track Scrubber Bar & Timestamps -->
        <div class="flex-1 space-y-1.5 min-w-0">
          <!-- Slider Track Interaktif -->
          <div class="relative h-2.5 rounded-full bg-slate-200/90 overflow-hidden cursor-pointer">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-all"
              :style="{ width: `${persen}%` }"
            />
            <input
              type="range"
              min="0"
              :max="durasi || 0"
              step="0.1"
              :value="posisi"
              aria-label="Posisi pemutaran audio"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
              :disabled="!durasi"
              @input="geser"
            >
          </div>

          <!-- Indikator Waktu: Posisi Saat Ini & Total Durasi -->
          <div class="flex items-center justify-between text-[11px] font-mono font-bold tabular-nums text-slate-500">
            <span>{{ waktu(posisi) }}</span>
            <span class="text-slate-700 font-extrabold">{{ durasi ? waktu(durasi) : '--:--' }}</span>
          </div>
        </div>
      </div>

      <!-- Baris Kontrol Cepat: Mundur 10s, Kecepatan, Maju 10s -->
      <div class="flex items-center justify-between pt-1 text-xs">
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-40"
            :disabled="!durasi"
            @click="lompat(-10)"
          >
            <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span>-10s</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-40"
            :disabled="!durasi"
            @click="lompat(10)"
          >
            <span>+10s</span>
            <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>

        <!-- Tombol Kecepatan -->
        <button
          type="button"
          class="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-blue-700 font-black text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
          @click="gantiKecepatan"
        >
          <span class="text-slate-500 font-normal">Kecepatan:</span>
          <span>{{ kecepatan }}x</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { extractYouTubeId } from '~/utils/cbtFormula'

const props = defineProps<{ type: 'audio' | 'video', url?: string, title?: string }>()
const emit = defineEmits<{ (e: 'toast', pesan: string): void }>()

const judul = computed(() => props.title || (props.type === 'audio' ? 'Audio Soal Ujian' : 'Video Soal Ujian'))

// Sumber media: YouTube (termasuk Shorts), Google Drive, atau tautan berkas langsung (mp3/mp4).
const sumber = computed<{ jenis: 'youtube' | 'drive' | 'langsung', id: string, url: string }>(() => {
  const url = (props.url || '').trim()
  const yt = extractYouTubeId(url) || /youtube\.com\/shorts\/([\w-]{11})/.exec(url)?.[1]
  if (yt) return { jenis: 'youtube', id: yt, url }
  const drive = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/.exec(url)?.[1]
  if (drive) return { jenis: 'drive', id: drive, url: `https://drive.google.com/uc?export=download&id=${drive}` }
  return { jenis: 'langsung', id: '', url }
})

const aktif = ref(false)
const audio = ref<HTMLAudioElement | null>(null)
const main = ref(false)
const muat = ref(false)
const posisi = ref(0)
const durasi = ref(0)
const kecepatan = ref(1)
const pakaiPratinjau = ref(false)
const persen = computed(() => durasi.value ? Math.min(100, (posisi.value / durasi.value) * 100) : 0)

const waktu = (detik: number) => {
  const s = Math.max(0, Math.floor(detik))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const putar = () => {
  const el = audio.value
  if (!el) return
  if (el.paused) {
    muat.value = el.readyState < 3
    void el.play().catch(() => { muat.value = false })
  } else {
    el.pause()
  }
}

const geser = (e: Event) => {
  if (audio.value) audio.value.currentTime = Number((e.target as HTMLInputElement).value)
}

const lompat = (detik: number) => {
  if (audio.value) audio.value.currentTime = Math.min(durasi.value, Math.max(0, audio.value.currentTime + detik))
}

const gantiKecepatan = () => {
  const urutan = [1, 1.25, 1.5, 0.75]
  kecepatan.value = urutan[(urutan.indexOf(kecepatan.value) + 1) % urutan.length]!
  if (audio.value) audio.value.playbackRate = kecepatan.value
}

// Berkas Drive kadang tidak bisa diputar langsung (izin/ukuran): pindah ke pemutar pratinjau Drive.
const gagal = () => {
  muat.value = false
  if (sumber.value.jenis === 'drive') { pakaiPratinjau.value = true; return }
  emit('toast', 'Audio tidak dapat diputar. Periksa koneksi internetmu atau hubungi pengawas.')
}
</script>