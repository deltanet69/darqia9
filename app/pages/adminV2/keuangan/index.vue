<script setup lang="ts">
import { computed, ref } from 'vue'
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import KeuanganManager from '~/components/adminV2/keuangan/KeuanganManager.vue'
import KeuanganDetail from '~/components/adminV2/keuangan/KeuanganDetail.vue'

// Halaman Keuangan Sekolah: satu menu (tanpa mega menu khusus & tanpa
// Tabungan — perintah pemilik). Daftar berisi 5 tab (Overview, Data
// Keuangan, Kode Keuangan, Cut-off Harian, Riwayat Pembayaran); rincian
// siswa tampil sebagai tampilan kedua di rute yang sama.
const mode = ref<'daftar' | 'detail'>('daftar')
const nisPilih = ref('')
const crumb = computed(() => mode.value === 'detail' ? 'Rincian Keuangan Siswa' : undefined)
const buka = (nis: string) => { nisPilih.value = nis; mode.value = 'detail' }
const kembali = () => { mode.value = 'daftar' }
</script>

<template>
  <SistemPageShell judul="Keuangan Sekolah" modul-label="Keuangan Sekolah" modul-to="/adminV2/keuangan" grup-label="Keuangan" route-id="keuangan" :crumb="crumb">
    <KeuanganManager v-if="mode === 'daftar'" @buka="buka" />
    <KeuanganDetail v-else :nis="nisPilih" @kembali="kembali" />
  </SistemPageShell>
</template>
