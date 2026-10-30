<script setup lang="ts">
import ModulPageShell from '~/components/adminV2/modul/ModulPageShell.vue'
import ModulList from '~/components/adminV2/modul/ModulList.vue'

definePageMeta({ layout: false })
</script>

<template>
  <ModulPageShell judul="Modul Pembelajaran">
    <template #default="{ jenjang, role }">
      <ModulList :jenjang="jenjang" :role="role" />
    </template>
  </ModulPageShell>
</template>
