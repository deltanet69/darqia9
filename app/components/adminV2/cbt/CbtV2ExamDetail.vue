<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem, LiveStudent } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'

const props = defineProps<{ exam: ExamItem, source: AssessmentSource }>()
const emit = defineEmits<{ (e: 'back'): void, (e: 'toast', msg: string): void }>()

const cbtData = useAdminCbtData(props.source)
const siswa = ref<LiveStudent[] | null>(null)
const galat = ref('')
const diperbarui = ref('')

const muat = async () => {
  try {
    siswa.value = await cbtData.loadMonitoring(props.exam)
    galat.value = ''
    diperbarui.value = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  } catch (e) {
    galat.value = e instanceof Error ? e.message : 'Data ujian gagal dimuat.'
  }
}
// Data diperbarui otomatis tiap 15 detik agar pelanggaran baru langsung terlihat.
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => { void muat(); timer = setInterval(muat, 15_000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const jumlah = (status: string) => (siswa.value ?? []).filter(s => s.status === status).length
const selesai = computed(() => jumlah('Selesai'))
const mengerjakan = computed(() => jumlah('Mengerjakan'))
const belum = computed(() => jumlah('Belum mulai'))
const terkunci = computed(() => (siswa.value ?? []).filter(s => s.status.startsWith('Terkunci')).length)

const isPr = computed(() => props.exam.jenis === 'pr')
const jenisLabel = computed(() => props.source === 'cbt' ? (props.exam.jenis === 'tengah_semester' ? 'Ujian Tengah Semester' : 'Ujian Akhir') : isPr.value ? 'PR di Rumah' : 'Ujian Harian')

const JENIS_PELANGGARAN: Record<string, string> = {
  pindah_tab: 'Pindah tab',
  alt_tab: 'Keluar dari layar ujian',
  tutup_browser: 'Menutup browser'
}
const waktu = (iso: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

const daftarPelanggaran = computed(() => (siswa.value ?? [])
  .flatMap(s => (s.pelanggaran ?? []).map(p => ({ ...p, nama: s.name, selesai: s.status === 'Selesai' })))
  .sort((a, b) => b.waktu.localeCompare(a.waktu)))

// Kode hanya perlu diberikan bila siswa masih mengerjakan dan pelanggarannya belum dibuka.
const menunggu = computed(() => daftarPelanggaran.value.filter(p => p.terkunci && p.ke < 3 && !p.selesai).length)

const statusKelas = (status: string) => status === 'Selesai' ? 'bg-[#E7F8F0] text-[#087C52]'
  : status === 'Mengerjakan' ? 'bg-[#E8F0FE] text-[#1B5FD9]'
    : status.startsWith('Terkunci') ? 'bg-[#FDECEA] text-[#B42318]' : 'bg-[#EFF2F7] text-[#475467]'

const salin = async (kode: string) => {
  try { await navigator.clipboard.writeText(kode); emit('toast', `Kode ${kode} disalin.`) } catch { emit('toast', 'Kode gagal disalin. Salin manual.') }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Kepala: tombol kembali + identitas ujian -->
    <div>
      <button type="button" class="inline-flex items-center gap-1.5 rounded-full border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs font-extrabold text-[#344054] hover:border-[#1B5FD9]" @click="emit('back')">
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke Daftar Ujian</span>
      </button>
      <div class="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <span class="inline-block rounded-full bg-[#E8F0FE] px-2.5 py-0.5 text-[10px] font-extrabold text-[#1B5FD9]">{{ jenisLabel }}</span>
          <h2 class="mt-1.5 break-words text-xl font-extrabold text-[#101828]">{{ exam.subject }}</h2>
          <p class="mt-0.5 break-words text-xs text-[#667085]">{{ exam.name }} &middot; {{ exam.classroom }} &middot; {{ exam.date }} &middot; {{ exam.time }} &middot; Pengawas: {{ exam.supervisor || '-' }}</p>
        </div>
        <button type="button" class="rounded-full border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs font-extrabold text-[#1B5FD9]" @click="muat">Perbarui Data</button>
      </div>
      <p v-if="diperbarui" class="mt-1 text-[11px] text-[#98A2B3]">Diperbarui otomatis tiap 15 detik &middot; terakhir {{ diperbarui }}</p>
    </div>

    <p v-if="galat" class="rounded-xl border border-[#F8D3CE] bg-[#FDECEA] px-4 py-3 text-xs font-semibold text-[#B42318]">{{ galat }}</p>
    <p v-else-if="!siswa" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Memuat data siswa&hellip;</p>

    <template v-else>
      <!-- Ringkasan -->
      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#101828]">{{ siswa.length }}</b><span class="text-[11px] text-[#667085]">Peserta</span></div>
        <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#087C52]">{{ selesai }}</b><span class="text-[11px] text-[#667085]">Sudah selesai</span></div>
        <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#1B5FD9]">{{ mengerjakan }}</b><span class="text-[11px] text-[#667085]">Sedang mengerjakan</span></div>
        <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#344054]">{{ belum }}</b><span class="text-[11px] text-[#667085]">Belum mulai</span></div>
        <div class="col-span-2 rounded-2xl border border-[#E7EBF2] bg-white p-3.5 sm:col-span-1"><b class="block text-xl font-extrabold" :class="daftarPelanggaran.length ? 'text-[#B42318]' : 'text-[#101828]'">{{ daftarPelanggaran.length }}</b><span class="text-[11px] text-[#667085]">Pelanggaran{{ terkunci ? ` · ${terkunci} akun terkunci` : '' }}</span></div>
      </div>

      <!-- Bagian 1: Token pelanggaran (paling atas agar langsung terlihat) -->
      <section class="overflow-hidden rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#E7EBF2] bg-[#FEF4E5] px-4 py-3 sm:px-5">
          <h3 class="text-sm font-extrabold text-[#7A4A03]">Token Pelanggaran Siswa<span v-if="menunggu" class="ml-2 rounded-full bg-[#B42318] px-2 py-0.5 text-[10px] text-white">{{ menunggu }} menunggu kode</span></h3>
          <p class="text-[11px] text-[#7A4A03]">
            <template v-if="isPr">Tiap pelanggaran tercatat otomatis. Pada PR di rumah, kode buka muncul sendiri di layar siswa, jadi tidak perlu diberikan.</template>
            <template v-else>Tiap pelanggaran tercatat otomatis. Tegur siswanya, lalu berikan kode di bawah agar ia bisa melanjutkan. Pelanggaran ke-3 mengunci akun total.</template>
          </p>
        </div>
        <ul v-if="daftarPelanggaran.length" class="divide-y divide-[#EFF2F7]">
          <li v-for="p in daftarPelanggaran" :key="p.id" class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div class="min-w-0">
              <b class="block break-words text-sm font-bold text-[#101828]">{{ p.nama }}</b>
              <span class="text-[11px] text-[#667085]">Pelanggaran ke-{{ p.ke }} &middot; {{ JENIS_PELANGGARAN[p.jenis] ?? p.jenis }} &middot; {{ waktu(p.waktu) }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="p.ke >= 3" class="rounded-full bg-[#FDECEA] px-2.5 py-1 text-[11px] font-extrabold text-[#B42318]">Akun terkunci total</span>
              <span v-else-if="p.selesai && p.terkunci" class="text-[11px] text-[#667085]">Siswa sudah selesai</span>
              <span v-else-if="isPr" class="text-[11px] text-[#667085]">{{ p.terkunci ? 'Menunggu siswa' : 'Sudah dibuka' }}</span>
              <template v-else-if="p.terkunci">
                <div class="text-right">
                  <span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">Kode untuk siswa</span>
                  <b class="font-mono text-xl tracking-[0.25em] text-[#101828]">{{ p.kode }}</b>
                </div>
                <button type="button" class="min-h-10 rounded-xl border border-[#E7EBF2] bg-white px-3 text-xs font-bold text-[#344054]" @click="salin(p.kode)">Salin</button>
              </template>
              <span v-else class="rounded-full bg-[#E7F8F0] px-2.5 py-1 text-[11px] font-extrabold text-[#087C52]">Sudah dibuka</span>
            </div>
          </li>
        </ul>
        <p v-else class="p-8 text-center text-xs text-[#667085]">Belum ada pelanggaran. Pelanggaran akan muncul di sini otomatis.</p>
      </section>
      <!-- Bagian 2: Daftar siswa -->
      <section class="overflow-hidden rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#E7EBF2] bg-[#F6F8FC] px-4 py-3 sm:px-5">
          <h3 class="text-sm font-extrabold text-[#0A2A5C]">Daftar Siswa</h3>
          <p class="text-[11px] text-[#667085]">Status pengerjaan dan jumlah pelanggaran tiap siswa.</p>
        </div>
        <div class="hidden grid-cols-[40px_minmax(0,1fr)_140px_130px_110px] gap-4 border-b border-[#EFF2F7] px-5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#667085] md:grid">
          <span>No</span><span>Nama Siswa</span><span>Status</span><span>Soal Terjawab</span><span class="text-center">Pelanggaran</span>
        </div>
        <ul class="divide-y divide-[#EFF2F7]">
          <li v-for="(s, i) in siswa" :key="s.id" class="grid gap-1.5 px-4 py-3 sm:px-5 md:grid-cols-[40px_minmax(0,1fr)_140px_130px_110px] md:items-center md:gap-4">
            <span class="hidden text-xs text-[#667085] md:block">{{ i + 1 }}</span>
            <b class="break-words text-sm font-bold text-[#101828]">{{ s.name }}</b>
            <span><span class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" :class="statusKelas(s.status)">{{ s.status === 'Selesai' ? 'Sudah selesai' : s.status }}</span></span>
            <span class="text-xs text-[#344054]"><span class="text-[#667085] md:hidden">Soal terjawab: </span>{{ s.progress }} dari {{ s.total }}</span>
            <span class="text-xs font-bold md:text-center" :class="s.violations ? 'text-[#B42318]' : 'text-[#667085]'"><span class="font-normal text-[#667085] md:hidden">Pelanggaran: </span>{{ s.violations }} kali</span>
          </li>
        </ul>
        <p v-if="!siswa.length" class="p-8 text-center text-xs text-[#667085]">Belum ada siswa di ujian ini.</p>
      </section>

    </template>
  </div>
</template>
