<script setup lang="ts">
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import LogAktivitasManager from '~/components/adminV2/sistem/LogAktivitasManager.vue'
</script>

<template>
  <SistemPageShell judul="Log Aktivitas" modul-label="Log Aktivitas" modul-to="/adminV2/log-aktivitas">
    <LogAktivitasManager />
  </SistemPageShell>
</template>
