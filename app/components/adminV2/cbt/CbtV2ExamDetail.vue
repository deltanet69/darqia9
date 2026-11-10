<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem, LiveStudent } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'

const props = defineProps<{ exam: ExamItem, source: AssessmentSource }>()
const emit = defineEmits<{ (e: 'back'): void, (e: 'toast', msg: string): void }>()

const cbtData = useAdminCbtData(props.source)
const siswa = ref<LiveStudent[] | null>(null)
const galat = ref('')
const diperbarui = ref('')
const memuat = ref(false)
const filter = ref<'semua' | 'selesai' | 'mengerjakan' | 'belum' | 'melanggar'>('semua')
const cari = ref('')

// Sekali muat saat dibuka, memakai cache: ujian selesai 10 menit, lainnya 1 menit. Tombol Perbarui selalu mengambil data baru.
const muat = async (paksa = false) => {
  if (memuat.value) return
  memuat.value = true
  try {
    siswa.value = await cbtData.loadMonitoring(props.exam, paksa ? 0 : props.exam.status === 'Selesai' ? 600_000 : 60_000)
    galat.value = ''
    diperbarui.value = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  } catch (e) {
    galat.value = e instanceof Error ? e.message : 'Data ujian gagal dimuat.'
  } finally { memuat.value = false }
}
onMounted(() => { void muat() })

const kelompok = (s: LiveStudent) => s.status === 'Selesai' ? 'selesai' : s.status === 'Belum mulai' ? 'belum' : 'mengerjakan'
const hitung = computed(() => {
  const h = { selesai: 0, mengerjakan: 0, belum: 0, melanggar: 0, total: siswa.value?.length ?? 0 }
  for (const s of siswa.value ?? []) { h[kelompok(s)]++; if (s.violations) h.melanggar++ }
  return h
})
const persen = (n: number) => hitung.value.total ? (n / hitung.value.total) * 100 : 0

const tampil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  return (siswa.value ?? []).filter(s => {
    if (filter.value === 'melanggar' ? !s.violations : filter.value !== 'semua' && kelompok(s) !== filter.value) return false
    return !q || s.name.toLowerCase().includes(q) || (s.nis ?? '').includes(q)
  })
})

const FILTER = [
  { id: 'semua', label: 'Semua' },
  { id: 'selesai', label: 'Sudah selesai' },
  { id: 'mengerjakan', label: 'Mengerjakan' },
  { id: 'belum', label: 'Belum mulai' },
  { id: 'melanggar', label: 'Melanggar' }
] as const

const jenisLabel = computed(() => props.source === 'cbt'
  ? (props.exam.jenis === 'tengah_semester' ? 'Ujian Tengah Semester' : 'Ujian Akhir')
  : props.exam.jenis === 'pr' ? 'PR di Rumah' : 'Ujian Harian')

const statusTeks = (s: LiveStudent) => s.status === 'Selesai' ? 'Sudah selesai' : s.status.startsWith('Terkunci') ? 'Akun terkunci' : s.status
const statusWarna = (s: LiveStudent) => s.status === 'Selesai' ? 'text-[#067647]'
  : s.status.startsWith('Terkunci') ? 'text-[#B42318]' : s.status === 'Mengerjakan' ? 'text-[#1B5FD9]' : 'text-[#667085]'
const barWarna = (s: LiveStudent) => s.status === 'Selesai' ? 'bg-[#12B76A]' : s.status.startsWith('Terkunci') ? 'bg-[#F04438]' : 'bg-[#1B5FD9]'
const pelanggaranKelas = (n: number) => n >= 3 ? 'bg-[#FEE4E2] text-[#B42318]' : n === 2 ? 'bg-[#FEF0C7] text-[#B54708]' : 'bg-[#FFFAEB] text-[#B54708]'
</script>

<template>
  <div class="space-y-5">
    <!-- Kepala -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <button type="button" class="group inline-flex items-center gap-1.5 text-xs font-extrabold text-[#475467] hover:text-[#1B5FD9]" @click="emit('back')">
          <AdminV2Icon name="back" :size="14" class="transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Daftar Ujian</span>
        </button>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <h2 class="break-words text-2xl font-extrabold tracking-tight text-[#101828]">{{ exam.subject }}</h2>
          <span class="rounded-full bg-[#E8F0FE] px-2.5 py-0.5 text-[11px] font-extrabold text-[#1B5FD9]">{{ jenisLabel }}</span>
        </div>
        <p class="mt-1 break-words text-xs text-[#667085]">
          {{ exam.name }} <span class="text-[#D0D5DD]">/</span> Rombel {{ exam.classroom }} <span class="text-[#D0D5DD]">/</span> {{ exam.date }}, {{ exam.time }} <span class="text-[#D0D5DD]">/</span> Pengawas: {{ exam.supervisor || 'belum ditentukan' }}
        </p>
      </div>
      <button type="button" class="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E7EBF2] bg-white px-4 text-xs font-extrabold text-[#344054] hover:border-[#1B5FD9] hover:text-[#1B5FD9] disabled:opacity-60" :disabled="memuat" @click="muat(true)">
        {{ memuat ? 'Memperbarui…' : 'Perbarui data' }}
      </button>
    </div>
    <p v-if="diperbarui" class="-mt-3 text-[11px] text-[#98A2B3]">Data per pukul {{ diperbarui }}. Tekan Perbarui data untuk melihat perkembangan terbaru.</p>

    <p v-if="galat" class="rounded-xl border border-[#F8D3CE] bg-[#FDECEA] px-4 py-3 text-xs font-semibold text-[#B42318]">{{ galat }}</p>
    <p v-else-if="!siswa" class="rounded-2xl border border-[#E7EBF2] bg-white p-10 text-center text-xs text-[#667085]">Memuat data siswa&hellip;</p>

    <template v-else>
      <!-- Ringkasan: satu bilah kemajuan kelas -->
      <section class="rounded-2xl border border-[#E7EBF2] bg-white p-4 sm:p-5">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-xs font-bold text-[#667085]">Kemajuan kelas</p>
            <p class="mt-0.5 text-2xl font-extrabold tabular-nums text-[#101828]">{{ hitung.selesai }}<span class="text-base font-bold text-[#98A2B3]"> / {{ hitung.total }} siswa selesai</span></p>
          </div>
          <button type="button" class="rounded-xl px-3 py-2 text-left transition" :class="hitung.melanggar ? 'bg-[#FEF3F2] hover:bg-[#FEE4E2]' : 'bg-[#F6F8FC]'" @click="filter = 'melanggar'">
            <b class="block text-lg font-extrabold tabular-nums" :class="hitung.melanggar ? 'text-[#B42318]' : 'text-[#101828]'">{{ hitung.melanggar }}</b>
            <span class="text-[11px] font-bold" :class="hitung.melanggar ? 'text-[#B42318]' : 'text-[#667085]'">siswa melanggar</span>
          </button>
        </div>
        <div class="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[#EFF2F7]" role="img" :aria-label="`${hitung.selesai} selesai, ${hitung.mengerjakan} mengerjakan, ${hitung.belum} belum mulai`">
          <span class="bg-[#12B76A] transition-all duration-700 ease-out" :style="{ width: `${persen(hitung.selesai)}%` }" />
          <span class="bg-[#1B5FD9] transition-all duration-700 ease-out" :style="{ width: `${persen(hitung.mengerjakan)}%` }" />
        </div>
        <div class="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-[#475467]">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#12B76A]" />Sudah selesai <b class="tabular-nums text-[#101828]">{{ hitung.selesai }}</b></span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#1B5FD9]" />Mengerjakan <b class="tabular-nums text-[#101828]">{{ hitung.mengerjakan }}</b></span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#D0D5DD]" />Belum mulai <b class="tabular-nums text-[#101828]">{{ hitung.belum }}</b></span>
        </div>
      </section>

      <!-- Daftar siswa -->
      <section class="overflow-hidden rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="flex flex-col gap-3 border-b border-[#E7EBF2] px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex gap-1.5 overflow-x-auto">
            <button
              v-for="f in FILTER"
              :key="f.id"
              type="button"
              class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-extrabold transition"
              :class="filter === f.id ? 'border-[#101828] bg-[#101828] text-white' : 'border-[#E7EBF2] bg-white text-[#475467] hover:border-[#98A2B3]'"
              @click="filter = f.id"
            >
              {{ f.label }} <span class="tabular-nums opacity-70">{{ f.id === 'semua' ? hitung.total : hitung[f.id] }}</span>
            </button>
          </div>
          <input v-model="cari" type="search" placeholder="Cari nama atau NIS…" class="w-full rounded-full border border-[#E7EBF2] px-4 py-2 text-xs outline-none focus:border-[#1B5FD9] lg:w-64">
        </div>

        <div class="hidden grid-cols-[44px_minmax(0,1fr)_minmax(0,260px)_110px] gap-4 border-b border-[#EFF2F7] bg-[#F9FAFB] px-5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#667085] md:grid">
          <span>No</span><span>Nama Siswa</span><span>Progres Pengerjaan</span><span class="text-center">Pelanggaran</span>
        </div>
        <ul class="divide-y divide-[#EFF2F7]">
          <li v-for="(s, i) in tampil" :key="s.id" class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2.5 px-4 py-3.5 transition-colors hover:bg-[#F9FAFB] sm:px-5 md:grid-cols-[44px_minmax(0,1fr)_minmax(0,260px)_110px] md:items-center md:gap-4">
            <span class="hidden text-xs tabular-nums text-[#98A2B3] md:block">{{ i + 1 }}</span>
            <div class="min-w-0">
              <b class="block break-words text-sm font-bold text-[#101828]">{{ s.name }}</b>
              <span class="text-[11px] tabular-nums text-[#667085]">NIS {{ s.nis || '-' }}</span>
            </div>
            <div class="col-span-2 row-start-2 md:col-span-1 md:row-start-auto">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-extrabold" :class="statusWarna(s)">{{ statusTeks(s) }}</span>
                <span class="tabular-nums text-[#475467]">{{ s.progress }} dari {{ s.total }} soal</span>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EFF2F7]">
                <div class="h-full rounded-full transition-all duration-700 ease-out" :class="barWarna(s)" :style="{ width: `${Math.round((s.progress / Math.max(1, s.total)) * 100)}%` }" />
              </div>
            </div>
            <div class="col-start-2 row-start-1 self-start md:col-start-auto md:row-start-auto md:self-auto md:text-center">
              <span v-if="s.violations" class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold tabular-nums" :class="pelanggaranKelas(s.violations)">{{ Math.min(s.violations, 3) }}x<span class="font-bold">{{ s.violations >= 3 ? ' · terkunci' : '' }}</span></span>
              <span v-else class="text-[11px] text-[#98A2B3]">Tidak ada</span>
            </div>
          </li>
        </ul>
        <p v-if="!tampil.length" class="p-10 text-center text-xs text-[#667085]">{{ siswa.length ? 'Tidak ada siswa yang cocok dengan filter ini.' : 'Belum ada siswa di ujian ini.' }}</p>
        <p v-if="hitung.melanggar" class="border-t border-[#EFF2F7] bg-[#F9FAFB] px-5 py-3 text-[11.5px] text-[#475467]">Kode buka kunci untuk siswa yang melanggar ada di tombol <b>Pelanggaran Siswa</b> pada halaman rombel.</p>
      </section>
    </template>
  </div>
</template>
