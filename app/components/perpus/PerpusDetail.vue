<script setup lang="ts">
import { computed } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { judulUtama, progresBuku, sudahMulai, type Buku } from '~/composables/perpusCore'
import PerpusCover from './PerpusCover.vue'

const props = defineProps<{ buku: Buku }>()
const emit = defineEmits<{ kembali: [], baca: [b: Buku, bab: number] }>()
const P = usePerpus()
const prog = computed(() => P.state.value.prog)
const persen = computed(() => progresBuku(props.buku, prog.value))
const mulai = computed(() => sudahMulai(props.buku, prog.value))
const diRak = computed(() => P.state.value.rak.includes(props.buku.id))
const babTerakhir = computed(() => mulai.value ? props.buku.bab[prog.value[props.buku.id]] : null)

const alihRak = () => {
  const masuk = P.alihRak(props.buku.id)
  P.tampilToast(masuk ? 'Disimpan ke Rak Saya ★' : 'Dihapus dari Rak Saya')
}
</script>

<template>
  <section class="view on">
    <div class="det-wrap">
      <div class="det-hero" :style="{ background: buku.gradasi }">
        <div class="bgword">{{ judulUtama(buku).toUpperCase() }}</div>
        <div class="det-top">
          <button class="glass" @click="emit('kembali')">‹</button>
          <button class="glass" :class="{ marked: diRak }" @click="alihRak">{{ diRak ? '★' : '☆' }}</button>
        </div>
        <PerpusCover :buku="buku" />
      </div>
      <div class="det-body">
        <h2>{{ buku.judul }}</h2>
        <p class="auth">{{ buku.pengarang }} · {{ buku.penerbit }}</p>
        <div class="stat-row">
          <div class="stat-box"><small>RATING</small><b style="color:var(--orange)">★ {{ buku.rating.toFixed(1) }}<span style="color:var(--mut);font-size:11px">/5</span></b></div>
          <div class="stat-box"><small>HALAMAN</small><b>{{ buku.halaman }}</b></div>
          <div class="stat-box"><small>KATEGORI</small><b>{{ buku.lit ? 'Literasi' : 'Kelas ' + buku.tingkat }} · {{ buku.bab.length }} Bab</b></div>
        </div>
        <div v-if="mulai && babTerakhir" class="chap-card">
          <div class="t"><span>Terakhir dibaca</span><b>{{ persen }}%</b></div>
          <div style="font-size:13.5px;font-weight:700;margin-top:7px">{{ babTerakhir.judul }}</div>
          <div class="pbar"><i :style="{ width: persen + '%' }" /></div>
        </div>
        <h5>Sinopsis</h5>
        <p class="desc">{{ buku.deskripsi }}</p>
        <h5>Daftar Bab</h5>
        <button v-for="(c, i) in buku.bab" :key="i" class="bab-item" :class="{ done: prog[buku.id] != null && i <= prog[buku.id] }" @click="emit('baca', buku, i)">
          <span class="bab-no">{{ prog[buku.id] != null && i <= prog[buku.id] ? '✓' : i + 1 }}</span><b>{{ c.judul }}</b>
        </button>
      </div>
      <div class="det-cta">
        <button class="mark" :class="{ on: diRak }" @click="alihRak">{{ diRak ? '★' : '☆' }}</button>
        <button class="read" @click="emit('baca', buku, mulai ? prog[buku.id] : 0)">{{ persen > 0 && persen < 100 ? 'Continue Reading' : persen >= 100 ? 'Baca Ulang' : 'Mulai Membaca' }}</button>
      </div>
    </div>
  </section>
</template>
