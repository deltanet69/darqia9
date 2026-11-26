<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { warnaBuku } from '~/composables/perpusCore'
import type { Kisi } from '~/composables/usePerpus'

const props = defineProps<{ k: Kisi }>()
const P = usePerpus()
const paham = (i: number) => !!P.W.value.kisi[`${props.k.id}:${i}`]
const jumlah = computed(() => props.k.topik.filter((_, i) => paham(i)).length)
const warna = computed(() => warnaBuku(props.k.mapel))
</script>

<template>
  <button class="card ujian" :aria-label="`${k.judul}, ${jumlah} dari ${k.topik.length} topik dipahami`" @click="P.mapelBelajar.value = k.mapel; P.ke('belajar')">
    <span class="km" :style="{ '--c1': warna[0], '--c2': warna[1] }">{{ k.mapel.slice(0, 3).toUpperCase() }}</span>
    <span class="ut"><b>{{ k.judul }}</b><small class="num">{{ jumlah }} dari {{ k.topik.length }} topik dipahami</small>
      <span class="dots"><i v-for="(_, i) in k.topik" :key="i" :class="{ on: paham(i) }" /></span></span>
    <span class="go"><PerpusIkon n="maju" /></span>
  </button>
</template>
