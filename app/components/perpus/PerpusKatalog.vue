<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { PENCARIAN_POPULER, cariBuku, daftarMapel, progresBuku, type Buku } from '~/composables/perpusCore'
import PerpusCover from './PerpusCover.vue'

const emit = defineEmits<{ detail: [b: Buku] }>()
const P = usePerpus()
const kata = ref('')
const mapel = ref('all')
const mapels = computed(() => ['all', ...daftarMapel(P.state.value.buku)])
const hasil = computed(() => cariBuku(P.state.value.buku.filter(b => !b.lit && (mapel.value === 'all' || b.mapel === mapel.value)), kata.value))
const prog = computed(() => P.state.value.prog)
</script>

<template>
  <section class="view on">
    <div class="page-head"><h2>Jelajahi Katalog</h2><p>Semua koleksi kurikulum resmi SIBI, semua kelas.</p></div>
    <div class="main" style="padding-top:13px">
      <div class="searchbar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A8494" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.8-3.8" /></svg>
        <input v-model="kata" type="search" placeholder="Cari di katalog…">
      </div>
      <p style="font-size:10.5px;font-weight:700;letter-spacing:1.4px;color:var(--mut);margin-top:16px">PENCARIAN POPULER</p>
      <div class="chips">
        <button v-for="k in PENCARIAN_POPULER" :key="k" class="chip" @click="kata = k">{{ k }}</button>
      </div>
      <div class="chips" style="margin-top:10px">
        <button v-for="m in mapels" :key="m" class="chip" :class="{ on: mapel === m }" @click="mapel = m">{{ m === 'all' ? 'Semua Mapel' : m }}</button>
      </div>
      <div class="sec" style="margin-top:18px">
        <div class="sec-head"><h4>{{ mapel === 'all' ? 'Semua Koleksi' : mapel }}</h4><span>{{ hasil.length }} buku</span></div>
        <div v-if="hasil.length" class="grid">
          <div v-for="b in hasil" :key="b.id" class="g-item fadeup" @click="emit('detail', b)">
            <PerpusCover :buku="b" />
            <b>{{ b.judul }}</b><span>{{ b.mapel }} · Kelas {{ b.tingkat }}</span>
            <div v-if="progresBuku(b, prog) > 0"><div class="pbar" style="margin-top:8px"><i :style="{ width: progresBuku(b, prog) + '%' }" /></div><span style="font-weight:700;color:var(--ink)">{{ progresBuku(b, prog) }}% dibaca</span></div>
            <div v-else class="stars">★★★★★<em>{{ b.rating.toFixed(1) }}</em></div>
          </div>
        </div>
        <div v-else class="empty">Tidak ada buku yang cocok.<br>Coba kata kunci atau mapel lain.</div>
      </div>
    </div>
  </section>
</template>
