<script setup lang="ts">
import { computed, ref } from 'vue'
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import TiketingManager from '~/components/adminV2/sistem/TiketingManager.vue'
import TiketingForm from '~/components/adminV2/sistem/TiketingForm.vue'
import TiketingDetail from '~/components/adminV2/sistem/TiketingDetail.vue'
import type { TiketRow } from '~/composables/tiketingCore'

// Halaman Tiketing: satu rute untuk daftar (Tiket Saya / Kotak Masuk),
// form buat/ubah, dan detail — tampilan berganti di tempat.
const mode = ref<'daftar' | 'form' | 'detail'>('daftar')
const idPilih = ref('')
const tiketUbah = ref<TiketRow | null>(null)

const crumb = computed(() => mode.value === 'form'
  ? (tiketUbah.value ? 'Ubah Tiket' : 'Buat Tiket')
  : mode.value === 'detail' ? 'Detail Tiket' : undefined)

const buka = (id: string) => { idPilih.value = id; mode.value = 'detail' }
const buat = () => { tiketUbah.value = null; mode.value = 'form' }
const ubah = (tiket: TiketRow) => { tiketUbah.value = tiket; mode.value = 'form' }
const selesaiForm = (id: string) => { idPilih.value = id; tiketUbah.value = null; mode.value = 'detail' }
const batalForm = () => { mode.value = tiketUbah.value ? 'detail' : 'daftar'; tiketUbah.value = null }
const kembali = () => { mode.value = 'daftar' }
</script>

<template>
  <SistemPageShell judul="Tiketing" modul-label="Tiketing" modul-to="/adminV2/tiketing" :crumb="crumb">
    <TiketingManager v-if="mode === 'daftar'" @buka="buka" @buat="buat" />
    <TiketingForm v-else-if="mode === 'form'" :tiket-ubah="tiketUbah" @selesai="selesaiForm" @batal="batalForm" />
    <TiketingDetail v-else :tiket-id="idPilih" @kembali="kembali" @ubah="ubah" />
  </SistemPageShell>
</template>
