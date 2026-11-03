<script setup lang="ts">
import { computed } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { progresBuku, type Buku } from '~/composables/perpusCore'
import PerpusCover from './PerpusCover.vue'

const emit = defineEmits<{ detail: [b: Buku] }>()
const P = usePerpus()
const prog = computed(() => P.state.value.prog)
const tersimpan = computed(() => P.state.value.rak
  .map(id => P.state.value.buku.find(b => b.id === id))
  .filter((b): b is Buku => !!b)
  .filter(b => progresBuku(b, prog.value) < 100))
const selesai = computed(() => P.state.value.buku.filter(b => progresBuku(b, prog.value) >= 100))
</script>

<template>
  <section class="view on">
    <div class="page-head"><h2>Rak Saya</h2><p>Buku simpanan &amp; yang sudah kamu selesaikan.</p></div>
    <div class="main">
      <div class="sec" style="margin-top:20px">
        <div class="sec-head"><h4>My Books</h4><span>{{ tersimpan.length }} tersimpan</span></div>
        <template v-if="tersimpan.length">
          <div v-for="b in tersimpan" :key="b.id" class="rak-row fadeup" @click="emit('detail', b)">
            <PerpusCover :buku="b" />
            <div class="cont-info">
              <b style="font-size:14px">{{ b.judul }}</b>
              <span>{{ b.pengarang }}</span>
              <div class="stars">★★★★★<em>{{ b.rating.toFixed(1) }}</em></div>
              <div class="pbar"><i :style="{ width: progresBuku(b, prog) + '%' }" /></div>
              <div class="prow"><span class="pct">{{ progresBuku(b, prog) }}%</span><span class="go">{{ progresBuku(b, prog) >= 100 ? 'Selesai ✓' : 'Lanjutkan →' }}</span></div>
            </div>
          </div>
        </template>
        <div v-else class="empty">Rak kamu masih kosong.<br>Tekan tanda ☆ di halaman buku untuk menyimpan.</div>
      </div>
      <div class="sec">
        <div class="sec-head"><h4>Selesai Dibaca</h4><span>{{ selesai.length }} buku</span></div>
        <template v-if="selesai.length">
          <div v-for="b in selesai" :key="b.id" class="rak-row fadeup" @click="emit('detail', b)">
            <PerpusCover :buku="b" />
            <div class="cont-info">
              <b style="font-size:14px">{{ b.judul }}</b>
              <span>{{ b.pengarang }}</span>
              <div class="stars">★★★★★<em>{{ b.rating.toFixed(1) }}</em></div>
              <div class="pbar"><i :style="{ width: progresBuku(b, prog) + '%' }" /></div>
              <div class="prow"><span class="pct">{{ progresBuku(b, prog) }}%</span><span class="go">Selesai ✓</span></div>
            </div>
          </div>
        </template>
        <div v-else class="empty">Belum ada buku yang selesai.<br>Mulai dari satu bab hari ini.</div>
      </div>
    </div>
  </section>
</template>
