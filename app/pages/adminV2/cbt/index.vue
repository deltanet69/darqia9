<script setup lang="ts">
import { computed } from 'vue'
import CbtV2PageContent from '~/components/adminV2/cbt/CbtV2PageContent.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const source = computed(() => (Array.isArray(route.query.mode) ? route.query.mode[0] : route.query.mode) === 'ujian_harian' ? 'ujian_harian' : 'cbt')
</script>

<template>
  <CbtV2PageContent :key="source" :source="source" />
</template>
