<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { sampulBuku } from '~/composables/perpusSampul'
import { judulPendek, type Buku } from '~/composables/perpusCore'

const props = defineProps<{ b: Buku }>()
const P = usePerpus()
const el = ref<HTMLElement>()
const src = ref('')
let pengamat: IntersectionObserver | undefined

// Sampul PDF hanya dimuat saat kartu terlihat; buku tanpa berkas / terkunci tetap sampul teks.
const muat = async () => {
  if (props.b.sampul) { src.value = props.b.sampul; return }
  if (!props.b.tersedia || props.b.terkunci || props.b.format === 'epub') return
  src.value = await sampulBuku(props.b.id, P.token)
}
onMounted(() => {
  pengamat = new IntersectionObserver((e) => { if (e.some(x => x.isIntersecting)) { pengamat?.disconnect(); muat() } }, { rootMargin: '200px' })
  if (el.value) pengamat.observe(el.value)
})
onBeforeUnmount(() => pengamat?.disconnect())
watch(() => props.b.id, () => { src.value = ''; muat() })
</script>

<template>
  <div ref="el" class="cover" :class="{ 'has-img': src }" :style="{ '--c1': b.warna[0], '--c2': b.warna[1] }">
    <img v-if="src" class="cv-img" :src="src" :alt="'Sampul ' + b.judul" draggable="false">
    <div v-else class="ci"><small>{{ b.mapel }}</small><b>{{ judulPendek(b.judul) }}</b><i>{{ b.kelas }}<template v-if="b.kur"> · {{ b.kur }}</template></i></div>
  </div>
</template>
