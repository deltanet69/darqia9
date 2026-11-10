<template>
  <div class="rounded-2xl overflow-hidden border" :class="type === 'video' || sumber.jenis === 'youtube' ? 'bg-slate-950 border-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'">
    <!-- Tanpa media -->
    <div v-if="!url" class="p-4 text-xs font-semibold text-slate-500 bg-white">Media soal belum tersedia. Hubungi pengawas.</div>

    <!-- YouTube (video atau audio): gambar pratinjau dulu, pemutar baru dimuat saat diketuk agar halaman tetap ringan -->
    <template v-else-if="sumber.jenis === 'youtube'">
      <div class="relative aspect-video">
        <iframe
          v-if="aktif"
          class="absolute inset-0 w-full h-full"
          :src="`https://www.youtube-nocookie.com/embed/${sumber.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`"
          :title="judul"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        />
        <button v-else type="button" class="group absolute inset-0 w-full h-full" :aria-label="`Putar ${judul}`" @click="aktif = true">
          <img :src="`https://i.ytimg.com/vi/${sumber.id}/hqdefault.jpg`" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
          <span class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/95 text-blue-700 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
            <svg class="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20" /></svg>
          </span>
          <span class="absolute left-4 bottom-3 right-4 text-left text-white">
            <span class="block text-[11px] font-bold uppercase tracking-wider text-blue-200">{{ type === 'audio' ? 'Audio Soal' : 'Video Soal' }}</span>
            <span class="block text-sm font-extrabold truncate">{{ judul }}</span>
          </span>
        </button>
      </div>
    </template>

    <!-- Google Drive: video/audio Drive diputar lewat pemutar pratinjau Drive bila pemutar audio langsung gagal -->
    <template v-else-if="sumber.jenis === 'drive' && (type === 'video' || pakaiPratinjau)">
      <div :class="type === 'video' ? 'relative aspect-video' : 'relative h-24 bg-white'">
        <iframe class="absolute inset-0 w-full h-full" :src="`https://drive.google.com/file/d/${sumber.id}/preview`" :title="judul" allow="autoplay" loading="lazy" />
      </div>
    </template>

    <!-- Video berkas langsung (mp4) -->
    <video v-else-if="type === 'video'" :src="sumber.url" controls playsinline preload="metadata" class="w-full aspect-video bg-black" />

    <!-- Audio berkas langsung / Google Drive: pemutar buatan sendiri -->
    <div v-else class="p-4">
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
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="w-14 h-14 shrink-0 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
          :aria-label="main ? 'Jeda audio' : 'Putar audio'"
          @click="putar"
        >
          <svg v-if="muat" class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" /></svg>
          <svg v-else-if="main" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          <svg v-else class="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20" /></svg>
        </button>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-extrabold text-blue-950 truncate">{{ judul }}</div>
          <input
            type="range"
            min="0"
            :max="durasi || 0"
            step="0.1"
            :value="posisi"
            aria-label="Posisi audio"
            class="mt-2 w-full accent-blue-600"
            :disabled="!durasi"
            @input="geser"
          >
          <div class="flex items-center justify-between text-[11px] font-semibold text-blue-800 tabular-nums">
            <span>{{ waktu(posisi) }}</span>
            <button type="button" class="font-bold hover:underline disabled:opacity-40" :disabled="!durasi" @click="mundur">Ulang 10 detik</button>
            <span>{{ durasi ? waktu(durasi) : '--:--' }}</span>
          </div>
        </div>
      </div>
      <p class="mt-2 text-[11px] text-slate-500">Audio dapat diputar ulang jika diperlukan.</p>
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

const aktif = ref(false)
const audio = ref<HTMLAudioElement | null>(null)
const main = ref(false)
const muat = ref(false)
const posisi = ref(0)
const durasi = ref(0)
const pakaiPratinjau = ref(false)

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
const mundur = () => { if (audio.value) audio.value.currentTime = Math.max(0, audio.value.currentTime - 10) }
// Berkas Drive kadang tidak bisa diputar langsung (izin/ukuran): pindah ke pemutar pratinjau Drive.
const gagal = () => {
  muat.value = false
  if (sumber.value.jenis === 'drive') { pakaiPratinjau.value = true; return }
  emit('toast', 'Audio tidak dapat diputar. Periksa koneksi atau hubungi pengawas.')
}
</script>
