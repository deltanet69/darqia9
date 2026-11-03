<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import type { Buku } from '~/composables/perpusCore'

// Reader di dalam aplikasi (port openReader preview v8): bab per bab,
// ukuran huruf & tema baca (terang/sepia/gelap), progres tersimpan.
const props = defineProps<{ buku: Buku, babAwal: number }>()
const emit = defineEmits<{ tutup: [] }>()
const P = usePerpus()
const bab = ref(props.babAwal)
const font = ref(17)
const tema = ref(0)
const badan = ref<HTMLElement | null>(null)
const TEMA = ['', 'theme-sepia', 'theme-dark']

const babAktif = computed(() => props.buku.bab[bab.value])
const judulBab = computed(() => (babAktif.value?.judul || '').replace(/^Bab \d+ — /, ''))
const persen = computed(() => Math.round(((bab.value + 1) / props.buku.bab.length) * 100))
const diRak = computed(() => P.state.value.rak.includes(props.buku.id))

const tampil = () => {
  P.catatBaca(props.buku.id, bab.value)
  if (badan.value) badan.value.scrollTop = 0
}
onMounted(tampil)
watch(bab, tampil)

const nav = (d: number) => {
  const n = bab.value + d
  if (n < 0) return
  if (n >= props.buku.bab.length) {
    emit('tutup')
    P.tampilToast('Buku selesai dibaca. Kerja bagus!')
    return
  }
  bab.value = n
}
const langkahFont = (d: number) => { font.value = Math.max(14, Math.min(22, font.value + d)) }
const putarTema = () => { tema.value = (tema.value + 1) % 3 }
const alihRak = () => {
  const masuk = P.alihRak(props.buku.id)
  P.tampilToast(masuk ? 'Disimpan ke Rak Saya ★' : 'Dihapus dari Rak Saya')
}
</script>

<template>
  <div class="reader on" :class="TEMA[tema]">
    <div class="r-top">
      <button class="r-tool" @click="emit('tutup')">✕</button>
      <div class="ttl">{{ buku.judul }}</div>
      <button class="r-tool" @click="alihRak">{{ diRak ? '♥' : '♡' }}</button>
    </div>
    <div class="r-tools">
      <button @click="langkahFont(-1)">A −</button>
      <button @click="langkahFont(1)">A +</button>
      <button @click="putarTema">Tema ◐</button>
    </div>
    <div class="r-prog"><i :style="{ width: persen + '%' }" /></div>
    <div ref="badan" class="r-body" :style="{ fontSize: font + 'px' }">
      <div class="kick">{{ buku.lit ? 'Literasi · Buku Nonteks' : buku.mapel + ' · Kelas ' + buku.tingkat }}</div>
      <h3>{{ judulBab }}</h3>
      <!-- Isi bab = HTML kurasi SIBI dari katalog sendiri (perpus_bab), dirender apa adanya seperti preview -->
      <div v-html="babAktif?.isi" />
    </div>
    <div class="r-bot">
      <button class="r-prev" :style="{ visibility: bab === 0 ? 'hidden' : 'visible' }" @click="nav(-1)">‹</button>
      <div class="pg">Bab {{ bab + 1 }} dari {{ buku.bab.length }}</div>
      <button class="r-next" @click="nav(1)">{{ bab === buku.bab.length - 1 ? '✓' : '→' }}</button>
    </div>
  </div>
</template>
