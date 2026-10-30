<script setup lang="ts">
import ModulPageShell from '~/components/adminV2/modul/ModulPageShell.vue'
import ModulForm from '~/components/adminV2/modul/ModulForm.vue'

definePageMeta({ layout: false })
const route = useRoute()
</script>

<template>
  <ModulPageShell crumb="Sunting Modul" judul="Sunting Modul">
    <template #default="{ jenjang, role }">
      <ModulForm :id="String(route.params.id)" :jenjang="jenjang" :role="role" />
    </template>
  </ModulPageShell>
</template>
