<script setup lang="ts">
import { NI, P } from '~/composables/perpusIkon'

// n = nama ikon garis (perpusIkon.P); nav = ikon navbar bergaris+isi (perpusIkon.NI)
defineProps<{ n?: string, nav?: string }>()
</script>

<template>
  <span v-if="nav && NI[nav]" class="ni"><svg viewBox="0 0 24 24" aria-hidden="true"><g class="o" v-html="NI[nav].o" /><g class="f" v-html="NI[nav].f" /></svg></span>
  <svg v-else viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="P[n || 'cek']" />
</template>
