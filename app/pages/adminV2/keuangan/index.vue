<script setup lang="ts">
import { computed } from 'vue'
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import KeuanganManager from '~/components/adminV2/keuangan/KeuanganManager.vue'
import KeuanganDetail from '~/components/adminV2/keuangan/KeuanganDetail.vue'

// Halaman Keuangan Sekolah: satu menu (tanpa mega menu khusus & tanpa
// Tabungan — perintah pemilik). Daftar berisi 5 tab (Overview, Data
// Keuangan, Kode Keuangan, Cut-off Harian, Riwayat Pembayaran); rincian
// siswa tampil sebagai tampilan kedua di rute yang sama.
// Mode disinkronkan ke URL (?siswa=<nis>) — hasil meeting manajemen
// 4 Nov 2026: tombol Back browser/keyboard harus kembali ke tampilan
// persis sebelumnya (detail -> daftar), dan breadcrumb ikut berubah.
const route = useRoute()
const router = useRouter()

const nisPilih = computed(() => typeof route.query.siswa === 'string' ? route.query.siswa : '')
const mode = computed<'daftar' | 'detail'>(() => nisPilih.value ? 'detail' : 'daftar')
const crumb = computed(() => mode.value === 'detail' ? 'Rincian Keuangan Siswa' : undefined)

let didorong = false
const buka = (nis: string) => { didorong = true; void router.push({ query: { siswa: nis } }) }
const kembali = () => {
  if (didorong) { didorong = false; router.back() }
  else void router.replace({ query: {} })
}
</script>

<template>
  <SistemPageShell judul="Keuangan Sekolah" modul-label="Keuangan Sekolah" modul-to="/adminV2/keuangan" grup-label="Keuangan" route-id="keuangan" :crumb="crumb">
    <KeuanganManager v-if="mode === 'daftar'" @buka="buka" />
    <KeuanganDetail v-else :key="nisPilih" :nis="nisPilih" @kembali="kembali" />
  </SistemPageShell>
</template>
