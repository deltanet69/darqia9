<script setup lang="ts">
import { judulSub, judulUtama, type Buku } from '~/composables/perpusCore'

// Sampul buku prosedural (port coverArt preview v8): tipografi di atas
// gradasi khas tiap buku — tanpa berkas gambar, persis desain aslinya.
defineProps<{ buku: Buku, bintang?: boolean, mini?: boolean }>()
</script>

<template>
  <div v-if="mini" class="cov cov-mini" :style="{ background: buku.gradasi }">
    <span class="cv-mapel">{{ buku.mapel }}</span>
    <div class="cv-mono">{{ buku.inisial }}</div>
    <div class="cv-full">{{ buku.judul }}</div>
    <div class="cv-foot"><span class="cv-sibi">SIBI</span></div>
  </div>
  <div v-else class="cov" :style="{ background: buku.gradasi }">
    <span class="cv-mapel">{{ buku.mapel }}</span>
    <div class="cv-title" style="font-size:19px">{{ judulUtama(buku) }}</div>
    <div class="cv-sub">{{ judulSub(buku) }}</div>
    <div class="cv-foot"><span class="cv-auth">{{ buku.pengarang }}</span><span class="cv-sibi">SIBI</span></div>
    <span v-if="bintang" class="rate"><i>★</i>{{ buku.rating.toFixed(1) }}</span>
  </div>
</template>
