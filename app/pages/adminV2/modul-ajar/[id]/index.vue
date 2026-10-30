<script setup lang="ts">
import ModulPageShell from '~/components/adminV2/modul/ModulPageShell.vue'
import ModulDocument from '~/components/adminV2/modul/ModulDocument.vue'

definePageMeta({ layout: false })
const route = useRoute()
</script>

<template>
  <ModulPageShell crumb="Dokumen Modul" judul="Dokumen Modul">
    <template #default="{ jenjang, role }">
      <ModulDocument :id="String(route.params.id)" :jenjang="jenjang" :role="role" />
    </template>
  </ModulPageShell>
</template>
