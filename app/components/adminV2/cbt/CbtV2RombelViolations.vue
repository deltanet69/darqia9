<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource, type PelanggaranRombel } from '~/composables/useAdminCbtData'

const props = defineProps<{ classroom: string, exams: ExamItem[], source: AssessmentSource }>()
const emit = defineEmits<{ (e: 'close'): void, (e: 'toast', msg: string): void }>()

const cbtData = useAdminCbtData(props.source)
const daftar = ref<PelanggaranRombel[] | null>(null)
const galat = ref('')
const tampil = ref<'perlu' | 'semua'>('perlu')
const disalin = ref('')

const muat = async () => {
  try {
    const pertama = !daftar.value
    daftar.value = await cbtData.loadPelanggaranRombel(props.exams.map(e => e.id))
    // Tidak ada yang menunggu kode saat dibuka: langsung tampilkan riwayat agar panel tidak tampak kosong.
    if (pertama && !perluKode.value.length) tampil.value = 'semua'
    galat.value = ''
  } catch (e) {
    galat.value = e instanceof Error ? e.message : 'Data pelanggaran gagal dimuat.'
  }
}
// Pelanggaran baru muncul sendiri tanpa perlu menutup panel.
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  void muat()
  // Satu query ringan tiap 10 detik, hanya selama panel terbuka dan tab peramban terlihat.
  timer = setInterval(() => { if (document.visibilityState === 'visible') void muat() }, 10_000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const ujianById = computed(() => new Map(props.exams.map(e => [e.id, e])))
const isPr = (p: PelanggaranRombel) => ujianById.value.get(p.examId)?.jenis === 'pr'
// Kode perlu diberikan bila siswa masih mengerjakan, pelanggaran belum dibuka, belum ke-3, dan bukan PR di rumah.
// Satu siswa cukup satu kode: hanya pelanggaran terakhir yang masih menunggu yang ditampilkan kodenya (server membuka semuanya sekaligus).
const menunggu = (p: PelanggaranRombel) => p.terkunci && p.ke < 3 && !p.selesai && !isPr(p)
const kodeTerbaru = computed(() => {
  const ids = new Set<string>()
  const sudah = new Set<string>()
  for (const p of daftar.value ?? []) { // urut terbaru dulu
    const k = `${p.studentId}|${p.examId}`
    if (menunggu(p) && !sudah.has(k)) { ids.add(p.id); sudah.add(k) }
  }
  return ids
})
const butuhKode = (p: PelanggaranRombel) => kodeTerbaru.value.has(p.id)
const perluKode = computed(() => (daftar.value ?? []).filter(butuhKode))
const terkunciTotal = computed(() => (daftar.value ?? []).filter(p => p.ke >= 3).length)
const siswaMelanggar = computed(() => new Set((daftar.value ?? []).map(p => p.studentId)).size)
const tampilList = computed(() => tampil.value === 'perlu' ? perluKode.value : (daftar.value ?? []))

const JENIS: Record<string, string> = { pindah_tab: 'Pindah tab', alt_tab: 'Keluar dari layar ujian', tutup_browser: 'Menutup browser' }
const waktu = (iso: string) => new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

const salin = async (p: PelanggaranRombel) => {
  try {
    await navigator.clipboard.writeText(p.kode)
    disalin.value = p.id
    setTimeout(() => { if (disalin.value === p.id) disalin.value = '' }, 1800)
  } catch { emit('toast', 'Kode gagal disalin. Bacakan langsung ke siswa.') }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#0A1A33]/55 p-4 backdrop-blur-xs sm:items-center" role="dialog" aria-modal="true" aria-label="Pelanggaran siswa" @keydown.esc="emit('close')" @click.self="emit('close')">
      <div class="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#E7EBF2] bg-[#F6F8FC] shadow-[0_24px_60px_-20px_rgba(10,26,51,0.45)]">
        <!-- Kepala -->
        <div class="bg-white px-5 pb-4 pt-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-lg font-extrabold text-[#101828]">Pelanggaran Siswa &middot; {{ classroom }}</h3>
              <p class="mt-1 flex items-center gap-1.5 text-xs text-[#667085]">
                <span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#12B76A] opacity-60" /><span class="relative inline-flex h-2 w-2 rounded-full bg-[#12B76A]" /></span>
                Semua mapel rombel ini &middot; diperbarui otomatis tiap 10 detik
              </p>
            </div>
            <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#667085] hover:bg-[#EFF2F7]" aria-label="Tutup panel pelanggaran" @click="emit('close')">
              <AdminV2Icon name="x" :size="16" />
            </button>
          </div>

          <!-- Alur singkat untuk guru/pengawas -->
          <ol class="mt-4 grid grid-cols-1 gap-2 text-[11.5px] text-[#344054] sm:grid-cols-3">
            <li class="flex items-center gap-2 rounded-xl bg-[#F6F8FC] px-3 py-2"><b class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#101828] text-[10px] text-white">1</b>Tegur siswa yang melanggar</li>
            <li class="flex items-center gap-2 rounded-xl bg-[#F6F8FC] px-3 py-2"><b class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#101828] text-[10px] text-white">2</b>Bacakan kodenya ke siswa</li>
            <li class="flex items-center gap-2 rounded-xl bg-[#F6F8FC] px-3 py-2"><b class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#101828] text-[10px] text-white">3</b>Siswa mengetik kode, ujian lanjut</li>
          </ol>

          <div v-if="daftar" class="mt-4 flex flex-wrap items-center gap-2">
            <div class="inline-flex rounded-full bg-[#EFF2F7] p-1">
              <button type="button" class="rounded-full px-3.5 py-1.5 text-xs font-extrabold transition" :class="tampil === 'perlu' ? 'bg-white text-[#B42318] shadow-sm' : 'text-[#667085] hover:text-[#101828]'" @click="tampil = 'perlu'">Perlu kode ({{ perluKode.length }})</button>
              <button type="button" class="rounded-full px-3.5 py-1.5 text-xs font-extrabold transition" :class="tampil === 'semua' ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'" @click="tampil = 'semua'">Semua riwayat ({{ daftar.length }})</button>
            </div>
            <span class="text-[11px] text-[#667085]">{{ siswaMelanggar }} siswa melanggar<template v-if="terkunciTotal"> &middot; <b class="text-[#B42318]">{{ terkunciTotal }} terkunci total</b></template></span>
          </div>
        </div>

        <!-- Isi -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5">
          <p v-if="galat" class="rounded-xl border border-[#F8D3CE] bg-[#FDECEA] px-4 py-3 text-xs font-semibold text-[#B42318]">{{ galat }}</p>
          <p v-else-if="!daftar" class="py-10 text-center text-xs text-[#667085]">Memuat pelanggaran&hellip;</p>
          <div v-else-if="!tampilList.length" class="py-10 text-center">
            <b class="block text-sm font-extrabold text-[#101828]">{{ tampil === 'perlu' ? 'Tidak ada siswa yang menunggu kode' : 'Belum ada pelanggaran di rombel ini' }}</b>
            <p class="mt-1 text-xs text-[#667085]">Saat siswa melanggar, namanya dan kodenya langsung muncul di sini.</p>
          </div>

          <ul v-else class="space-y-2.5">
            <li
              v-for="p in tampilList"
              :key="p.id"
              class="flex flex-col gap-3 rounded-2xl border bg-white p-4 transition sm:flex-row sm:items-center sm:justify-between"
              :class="butuhKode(p) ? 'border-[#F5C77E] shadow-[0_6px_18px_-10px_rgba(181,71,8,0.45)]' : 'border-[#E7EBF2]'"
            >
              <div class="min-w-0">
                <div class="flex flex-wrap items-baseline gap-x-2">
                  <b class="break-words text-sm font-extrabold text-[#101828]">{{ p.nama }}</b>
                  <span v-if="p.nis" class="text-[11px] tabular-nums text-[#667085]">NIS {{ p.nis }}</span>
                </div>
                <p class="mt-0.5 text-[11.5px] text-[#475467]">{{ ujianById.get(p.examId)?.subject ?? '-' }} &middot; {{ JENIS[p.jenis] ?? p.jenis }} &middot; {{ waktu(p.waktu) }}</p>
                <!-- Pelanggaran ke berapa dari 3 -->
                <div class="mt-2 flex items-center gap-2">
                  <span class="flex gap-1" aria-hidden="true">
                    <span v-for="n in 3" :key="n" class="h-1.5 w-6 rounded-full" :class="n <= p.ke ? (p.ke >= 3 ? 'bg-[#D92D20]' : 'bg-[#F79009]') : 'bg-[#E7EBF2]'" />
                  </span>
                  <span class="text-[11px] font-bold" :class="p.ke >= 3 ? 'text-[#B42318]' : 'text-[#B54708]'">Pelanggaran {{ p.ke }}x dari 3</span>
                </div>
              </div>

              <!-- Kode / keadaan -->
              <div class="shrink-0 sm:text-right">
                <template v-if="butuhKode(p)">
                  <span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#B54708]">Kode untuk siswa</span>
                  <div class="mt-1 flex items-center gap-2 sm:justify-end">
                    <b class="rounded-xl bg-[#101828] px-4 py-2 font-mono text-2xl font-extrabold tracking-[0.3em] text-white tabular-nums select-all">{{ p.kode }}</b>
                    <button type="button" class="min-h-11 rounded-xl border px-3.5 text-xs font-extrabold transition" :class="disalin === p.id ? 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]' : 'border-[#E7EBF2] bg-white text-[#344054] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'" @click="salin(p)">{{ disalin === p.id ? 'Tersalin' : 'Salin' }}</button>
                  </div>
                </template>
                <span v-else-if="menunggu(p)" class="inline-block rounded-full bg-[#FFFAEB] px-3 py-1 text-[11px] font-bold text-[#B54708]">Ikut terbuka dengan kode terbaru</span>
                <span v-else-if="p.ke >= 3" class="inline-block rounded-full bg-[#FDECEA] px-3 py-1 text-[11px] font-extrabold text-[#B42318]">Akun terkunci total</span>
                <span v-else-if="isPr(p) && p.terkunci && !p.selesai" class="inline-block rounded-full bg-[#EFF2F7] px-3 py-1 text-[11px] font-bold text-[#475467]">PR: kode muncul di layar siswa</span>
                <span v-else-if="p.terkunci" class="inline-block rounded-full bg-[#EFF2F7] px-3 py-1 text-[11px] font-bold text-[#475467]">Siswa sudah selesai</span>
                <span v-else class="inline-block rounded-full bg-[#ECFDF3] px-3 py-1 text-[11px] font-extrabold text-[#067647]">Kode sudah dipakai</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>
