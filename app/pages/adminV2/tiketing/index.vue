<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import TiketingManager from '~/components/adminV2/sistem/TiketingManager.vue'
import TiketingForm from '~/components/adminV2/sistem/TiketingForm.vue'
import TiketingDetail from '~/components/adminV2/sistem/TiketingDetail.vue'
import { useTiketing } from '~/composables/useTiketing'
import type { TiketRow } from '~/composables/tiketingCore'

// Halaman Tiketing: satu rute untuk daftar (Tiket Saya / Kotak Masuk),
// form buat/ubah, dan detail. Mode disinkronkan ke URL — hasil meeting
// manajemen 4 Nov 2026: tombol Back browser/keyboard harus kembali ke
// tampilan persis sebelumnya, dan breadcrumb ikut berubah.
// Skema query: ?tiket=<id> (detail) · ?form=baru · ?form=ubah&tiket=<id>
const route = useRoute()
const router = useRouter()
const T = useTiketing()

const idPilih = computed(() => typeof route.query.tiket === 'string' ? route.query.tiket : '')
const mode = computed<'daftar' | 'form' | 'detail'>(() => route.query.form ? 'form' : idPilih.value ? 'detail' : 'daftar')
const formUbah = computed(() => route.query.form === 'ubah')
const tiketUbah = computed<TiketRow | null>(() => formUbah.value
  ? (T.state.value.daftar.find(t => t.id === idPilih.value) || null)
  : null)
const formSiap = computed(() => mode.value !== 'form' || !formUbah.value || !!tiketUbah.value)
const crumb = computed(() => mode.value === 'form'
  ? (formUbah.value ? 'Ubah Tiket' : 'Buat Tiket')
  : mode.value === 'detail' ? 'Detail Tiket' : undefined)

let didorong = false
const dorong = (query: Record<string, string>) => { didorong = true; void router.push({ query }) }
const kembaliKe = (query: Record<string, string>) => {
  if (didorong) { didorong = false; router.back() }
  else void router.replace({ query })
}
const buka = (id: string) => dorong({ tiket: id })
const buat = () => dorong({ form: 'baru' })
const ubah = (tiket: TiketRow) => dorong({ form: 'ubah', tiket: tiket.id })
const selesaiForm = (id: string) => { didorong = false; void router.replace({ query: { tiket: id } }) }
const batalForm = () => kembaliKe(formUbah.value && idPilih.value ? { tiket: idPilih.value } : {})
const kembali = () => kembaliKe({})

// Bila halaman dibuka langsung dari tautan form ubah, daftar belum termuat
// (Manager tidak tampil) — muat di sini agar tiketUbah dapat ditemukan.
const pastikanDaftar = () => {
  if (mode.value !== 'daftar' && !T.state.value.daftar.length && !T.state.value.memuat) void T.muatDaftar()
}
onMounted(pastikanDaftar)
watch(mode, pastikanDaftar)
</script>

<template>
  <SistemPageShell judul="Tiketing" modul-label="Tiketing" modul-to="/adminV2/tiketing" :crumb="crumb">
    <TiketingManager v-if="mode === 'daftar'" @buka="buka" @buat="buat" />
    <TiketingForm v-else-if="mode === 'form' && formSiap" :key="formUbah ? 'ubah-' + idPilih : 'baru'" :tiket-ubah="tiketUbah" @selesai="selesaiForm" @batal="batalForm" />
    <div v-else-if="mode === 'form'" class="bg-white border border-slate-300 rounded-xl p-6 text-[13px] text-slate-500">Memuat tiket…</div>
    <TiketingDetail v-else :key="idPilih" :tiket-id="idPilih" @kembali="kembali" @ubah="ubah" />
  </SistemPageShell>
</template>
