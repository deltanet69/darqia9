<script setup lang="ts">
import ModulPageShell from '~/components/adminV2/modul/ModulPageShell.vue'
import ModulForm from '~/components/adminV2/modul/ModulForm.vue'

definePageMeta({ layout: false })
</script>

<template>
  <ModulPageShell crumb="Buat Modul" judul="Buat Modul">
    <template #default="{ jenjang, role }">
      <ModulForm :jenjang="jenjang" :role="role" />
    </template>
  </ModulPageShell>
</template>
