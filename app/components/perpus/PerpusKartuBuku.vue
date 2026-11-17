<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { persenBaca, type Buku } from '~/composables/perpusCore'

const props = defineProps<{ b: Buku }>()
const P = usePerpus()
const pct = computed(() => persenBaca(P.W.value, props.b.id))
</script>

<template>
  <button class="bk" :aria-label="b.judul" @click="P.ke(P.V.value.tab, b.id)">
    <span class="bk-c">
      <PerpusCover :b="b" />
      <span v-if="pct" class="bk-p" aria-hidden="true"><span :style="{ width: pct + '%' }" /></span>
      <span v-if="b.terkunci" class="bk-k">Sabtu–Minggu</span>
      <span v-else-if="!b.tersedia" class="bk-k">Belum tersedia</span>
    </span>
    <h3>{{ b.judul }}</h3>
    <p>{{ b.mapel }}</p>
    <span class="bk-t"><span>{{ b.kelas }}</span><span v-if="b.kur">{{ b.kur }}</span></span>
  </button>
</template>
