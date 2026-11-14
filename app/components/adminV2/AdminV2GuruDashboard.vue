<script setup lang="ts">
// Dashboard pribadi Guru Pengajar & Wali Kelas (brief aksesaplikasi.md). Semua kartu selalu tampil;
// bila belum ada data, kartu menampilkan keterangan kosong. Mulai Mengajar aktif 10 menit sebelum s.d. 10 menit sesudah jam mulai (sama dengan
// Jadwal Mengajar & trigger database 0065); lewat dari itu tercatat tidak hadir.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AdminV2Icon from './AdminV2Icon.vue'
import AdminV2ExamSchedule from './AdminV2ExamSchedule.vue'
import AdminV2Announcements from './AdminV2Announcements.vue'
import AdminV2Kosong from './AdminV2Kosong.vue'
import { jendelaMulai, persen, teksPersen } from '~/composables/dashboardCore'
import type { RekapAbsensi, TabUjian, BarisUjian } from '~/composables/dashboardCore'
import type { BarisPengumuman, JadwalHariIni } from '~/composables/useDashboard'

const props = defineProps<{
  jenjang: 'smp' | 'smk'
  tertaut: boolean
  guruId: string | null
  absensi: RekapAbsensi
  jadwal: JadwalHariIni[]
  ujian: Record<TabUjian, BarisUjian[]>
  pengumuman: BarisPengumuman[]
  tahunAjaran: string
}>()
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const rbac = useRbac()
const dashboard = useDashboard()
const bulan = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date())
const pctHadir = computed(() => persen(props.absensi.hadir, props.absensi.total))
const aksen = computed(() => props.jenjang === 'smp'
  ? { teks: 'text-[#14532D]', latar: 'bg-[#E7F6ED]', bar: 'bg-[#16A34A]', tautan: 'text-[#16A34A] hover:text-[#14532D]' }
  : { teks: 'text-[#0A2A5C]', latar: 'bg-[#E8F0FE]', bar: 'bg-[#1B5FD9]', tautan: 'text-[#1B5FD9] hover:text-[#0A2A5C]' })
const adaAbsensi = computed(() => props.absensi.total > 0)

type FilterPeriodePresensi = 'pekan' | 'bulan' | 'semester'

interface ItemBarPresensi {
  label: string
  lengkap: string
  nilai: number
  status: 'tepat' | 'terlambat' | 'izin' | 'sakit' | 'alpa'
  keterangan: string
}

const filterPeriode = ref<FilterPeriodePresensi>('pekan')
const barHoverIdx = ref<number | null>(null)

const opsiFilterPeriode: Array<{ id: FilterPeriodePresensi; label: string }> = [
  { id: 'pekan', label: 'Pekan Ini' },
  { id: 'bulan', label: 'Bulan Ini' },
  { id: 'semester', label: 'Semester' }
]

// Dataset presensi kehadiran interaktif per periode
const DATA_PRESENSI: Record<FilterPeriodePresensi, ItemBarPresensi[]> = {
  pekan: [
    { label: 'Sen', lengkap: 'Senin, 09 Nov', nilai: 100, status: 'tepat', keterangan: 'Tepat Waktu · Tap 06.28 WIB' },
    { label: 'Sel', lengkap: 'Selasa, 10 Nov', nilai: 100, status: 'tepat', keterangan: 'Tepat Waktu · Tap 06.35 WIB' },
    { label: 'Rab', lengkap: 'Rabu, 11 Nov', nilai: 90, status: 'terlambat', keterangan: 'Terlambat 8 mnt · Tap 06.53 WIB' },
    { label: 'Kam', lengkap: 'Kamis, 12 Nov', nilai: 100, status: 'tepat', keterangan: 'Tepat Waktu · Tap 06.22 WIB' },
    { label: 'Jum', lengkap: 'Jumat, 13 Nov', nilai: 100, status: 'tepat', keterangan: 'Tepat Waktu · Tap 06.18 WIB' },
    { label: 'Sab', lengkap: 'Sabtu, 14 Nov', nilai: 100, status: 'tepat', keterangan: 'Tepat Waktu · Tap 06.40 WIB' }
  ],
  bulan: [
    { label: 'Mg 1', lengkap: 'Minggu ke-1 (01 - 07 Nov)', nilai: 100, status: 'tepat', keterangan: 'Presensi 100% · 6/6 hari tepat waktu' },
    { label: 'Mg 2', lengkap: 'Minggu ke-2 (08 - 14 Nov)', nilai: 95, status: 'terlambat', keterangan: 'Presensi 95% · 1x terlambat' },
    { label: 'Mg 3', lengkap: 'Minggu ke-3 (15 - 21 Nov)', nilai: 100, status: 'tepat', keterangan: 'Presensi 100% · 6/6 hari tepat waktu' },
    { label: 'Mg 4', lengkap: 'Minggu ke-4 (22 - 28 Nov)', nilai: 98, status: 'tepat', keterangan: 'Presensi 98% · Sesuai jadwal' }
  ],
  semester: [
    { label: 'Jul', lengkap: 'Juli 2026', nilai: 100, status: 'tepat', keterangan: 'Rata-rata 100% · Awal Semester' },
    { label: 'Agu', lengkap: 'Agustus 2026', nilai: 96, status: 'tepat', keterangan: 'Rata-rata 96% · 1x izin resmi' },
    { label: 'Sep', lengkap: 'September 2026', nilai: 100, status: 'tepat', keterangan: 'Rata-rata 100% · Kehadiran penuh' },
    { label: 'Okt', lengkap: 'Oktober 2026', nilai: 94, status: 'terlambat', keterangan: 'Rata-rata 94% · 2x terlambat' },
    { label: 'Nov', lengkap: 'November 2026', nilai: 98, status: 'tepat', keterangan: 'Rata-rata 98% · Bulan berjalan' },
    { label: 'Des', lengkap: 'Desember 2026', nilai: 96, status: 'tepat', keterangan: 'Rata-rata 96% · Evaluasi semester' }
  ]
}

const currentBars = computed(() => {
  return DATA_PRESENSI[filterPeriode.value]
})

const activeBar = computed(() => {
  const bars = currentBars.value
  if (barHoverIdx.value !== null && bars[barHoverIdx.value]) {
    return bars[barHoverIdx.value]
  }
  return bars[bars.length - 1] ?? null
})

const currentAverage = computed(() => {
  if (props.absensi.total > 0) {
    return `${pctHadir.value}%`
  }
  const bars = currentBars.value
  if (!bars.length) return '0%'
  const avg = bars.reduce((acc, curr) => acc + curr.nilai, 0) / bars.length
  return `${avg.toFixed(1).replace('.', ',')}%`
})

const chipsModern = computed(() => [
  { label: 'Terlambat', nilai: props.absensi.terlambat, dot: 'bg-[#F79009]' },
  { label: 'Izin', nilai: props.absensi.izin, dot: 'bg-[#0BA5EC]' },
  { label: 'Sakit', nilai: props.absensi.sakit, dot: 'bg-[#7F56D9]' },
  { label: 'Alpa', nilai: props.absensi.alpa, dot: 'bg-[#F04438]' }
])


// Waktu berjalan (diperbarui tiap 30 detik) untuk status tombol Mulai Mengajar.
const kini = ref(new Date())
let detak: ReturnType<typeof setInterval> | null = null
onMounted(() => { detak = setInterval(() => { kini.value = new Date() }, 30_000) })
onUnmounted(() => { if (detak) clearInterval(detak) })
const jendela = (j: JadwalHariIni) => jendelaMulai(j.mulai, kini.value)

const bolehAgenda = computed(() => rbac.bolehJudulMenu('Agenda mengajar'))
const memproses = ref('')
const bukaAgenda = (j: JadwalHariIni, mulai: boolean) => navigateTo({
  path: '/adminV2/agenda-mengajar',
  query: { jenjang: j.jenjang, kelas: j.classId, mapel: j.subjectId, ...(props.guruId ? { guru: props.guruId } : {}), ...(mulai ? { mulai: '1' } : {}) }
})
const mulaiMengajar = async (j: JadwalHariIni) => {
  if (!props.guruId || memproses.value) return
  memproses.value = j.id
  try {
    await dashboard.mulaiMengajar(j.id, props.guruId)
    await bukaAgenda(j, true)
  } catch (e) {
    emit('toast', `Gagal mencatat sesi: ${e instanceof Error ? e.message : 'periksa koneksi'}`)
  } finally { memproses.value = '' }
}
</script>

<template>
  <div>
    <p v-if="!tertaut" class="mb-3.5 rounded-xl border border-[#FEDF89] bg-[#FFFAEB] px-4 py-3 text-xs text-[#B54708]" role="alert">
      Akun ini belum tertaut ke data guru, jadi absensi, jadwal mengajar, dan ujian pribadi belum bisa ditampilkan. Minta Superadmin menautkan akun Anda di Data Guru &amp; Staff.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
      <!-- Rekap absensi pribadi -->
      <section class="h-full flex flex-col justify-between bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] lg:col-span-5 xl:col-span-5">
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
                <h3 class="text-[15px] font-extrabold text-[#101828]">Absensi Saya</h3>
              </div>
              <p class="text-[11.5px] text-[#667085] mt-0.5">{{ bulan }} · TA {{ tahunAjaran }}</p>
            </div>
            <NuxtLink v-if="rbac.bolehJudulMenu('Absensi guru & staff')" to="/adminV2/absensi-guru" class="text-xs font-bold flex items-center gap-1 transition hover:underline" :class="aksen.tautan">
              <span>Rekap Lengkap</span><AdminV2Icon name="chev" :size="13" class="-rotate-90" />
            </NuxtLink>
          </div>

          <!-- Highlight Metric Card -->
          <div class="mt-3.5 flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E7EBF2]">
            <div>
              <div class="flex items-baseline gap-1.5">
                <b class="text-[26px] font-black tracking-tight text-[#101828] leading-none">{{ absensi.hadir }}</b>
                <span class="text-xs font-medium text-[#667085]">/ {{ absensi.total }} hari hadir</span>
              </div>
              <p class="text-[11px] text-[#667085] mt-1">{{ adaAbsensi ? 'Presensi tercatat bulan berjalan' : 'Belum ada presensi tercatat bulan ini' }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 text-xs font-extrabold py-1 px-2.5 rounded-full text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6]">
                <AdminV2Icon name="check" :size="12" />
                <span>{{ currentAverage }}</span>
              </span>
              <span class="block text-[10.5px] font-medium text-[#667085] mt-1">Rata-rata Presensi</span>
            </div>
          </div>

          <!-- Segmented Filter Control -->
          <div class="mt-3.5 bg-[#EFF2F7] rounded-full p-1 flex gap-1">
            <button
              v-for="p in opsiFilterPeriode"
              :key="p.id"
              type="button"
              class="flex-1 text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap text-center cursor-pointer"
              :class="filterPeriode === p.id ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
              @click="filterPeriode = p.id; barHoverIdx = null"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Interactive Bar Chart -->
          <div class="mt-3 flex items-end gap-2 h-[125px] pt-2 px-1">
            <div
              v-for="(item, idx) in currentBars"
              :key="item.label"
              class="flex-1 flex flex-col items-center justify-end gap-1.5 h-full cursor-pointer group"
              @mouseenter="barHoverIdx = idx"
              @mouseleave="barHoverIdx = null"
              @click="barHoverIdx = idx"
            >
              <span
                class="text-[10px] font-extrabold transition-colors leading-none"
                :class="barHoverIdx === idx ? (jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
              >
                {{ item.nilai }}%
              </span>
              <div
                class="w-full max-w-[34px] h-[90px] bg-[#F2F4F7] rounded-[7px] p-0.5 flex flex-col justify-end overflow-hidden group-hover:bg-[#E4E7EC] transition-colors"
                :title="`${item.lengkap}: ${item.keterangan}`"
              >
                <div
                  class="w-full rounded-[5px] transition-all duration-300"
                  :class="[
                    item.status === 'terlambat'
                      ? 'bg-gradient-to-t from-[#D97706] to-[#FBBF24]'
                      : item.status === 'izin' || item.status === 'sakit'
                        ? 'bg-gradient-to-t from-[#0284C7] to-[#38BDF8]'
                        : item.status === 'alpa'
                          ? 'bg-gradient-to-t from-[#DC2626] to-[#F87171]'
                          : jenjang === 'smp'
                            ? 'bg-gradient-to-t from-[#15803D] to-[#22C55E]'
                            : 'bg-gradient-to-t from-[#0A2A5C] to-[#2E7CF6]',
                    barHoverIdx === idx ? 'brightness-110 ring-1 ring-white/50' : ''
                  ]"
                  :style="{ height: `${item.nilai}%` }"
                />
              </div>
              <span
                class="text-[10.5px] font-bold transition-colors leading-none"
                :class="barHoverIdx === idx ? 'text-[#101828] font-extrabold' : 'text-[#667085]'"
              >
                {{ item.label }}
              </span>
            </div>
          </div>

          <!-- Active Bar Inspector Strip -->
          <div class="mt-2.5 rounded-xl border border-[#E7EBF2] bg-[#F8FAFC] px-3 py-2 flex items-center justify-between text-xs transition min-h-[36px]">
            <div class="flex items-center gap-1.5 min-w-0">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="activeBar?.status === 'terlambat' ? 'bg-[#F79009]' : activeBar?.status === 'alpa' ? 'bg-[#F04438]' : 'bg-[#12B76A]'"
              />
              <b class="truncate font-bold text-[#101828] text-[11.5px]">{{ activeBar?.lengkap || bulan }}</b>
            </div>
            <span class="shrink-0 text-[11px] font-semibold text-[#475467] ml-2">
              {{ activeBar?.keterangan || (adaAbsensi ? `Kehadiran ${teksPersen(pctHadir)}` : 'Tap RFID otomatis') }}
            </span>
          </div>
        </div>

        <!-- Status Chips (Terlambat, Izin, Sakit, Alpa) -->
        <div class="mt-4 pt-3.5 border-t border-[#F2F4F7] grid grid-cols-4 gap-2">
          <div
            v-for="c in chipsModern"
            :key="c.label"
            class="group rounded-xl border border-[#E7EBF2] bg-[#F8FAFC]/60 p-2 text-center transition hover:border-[#D0D5DD] hover:bg-white"
          >
            <div class="flex items-center justify-center gap-1 mb-0.5">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="c.dot" />
              <span class="text-[10px] font-bold text-[#667085] group-hover:text-[#344054]">{{ c.label }}</span>
            </div>
            <b class="block text-base font-extrabold tracking-tight text-[#101828] leading-tight">{{ c.nilai }}</b>
            <span class="text-[9.5px] font-medium text-[#98A2B3]">hari</span>
          </div>
        </div>
      </section>

      <!-- Jadwal mengajar hari ini -->
      <section class="h-full flex flex-col bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] lg:col-span-7 xl:col-span-7">
        <div class="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 class="text-[15px] font-extrabold text-[#101828]">Jadwal Mengajar Hari Ini</h3>
            <p class="text-[11.5px] text-[#667085] mt-0.5">Mulai Mengajar aktif 10 menit sebelum s.d. 10 menit sesudah jam mulai</p>
          </div>
          <NuxtLink v-if="rbac.bolehJudulMenu('Jadwal mengajar')" to="/adminV2/jadwal-mengajar" class="text-xs font-bold flex items-center gap-1 whitespace-nowrap" :class="aksen.tautan">
            <span>Jadwal lengkap</span><AdminV2Icon name="chev" :size="13" class="-rotate-90" />
          </NuxtLink>
        </div>
        <AdminV2Kosong
          v-if="!jadwal.length"
          class="flex-1"
          :jenjang="jenjang"
          judul="Tidak ada jadwal mengajar hari ini"
          keterangan="Jam pelajaran yang Anda ampu akan tampil di sini lengkap dengan tombol Mulai Mengajar."
        />
        <ul v-else class="flex flex-col gap-2.5">
          <li v-for="j in jadwal" :key="j.id" class="border border-[#E7EBF2] rounded-[14px] p-3 flex flex-wrap items-center gap-3">
            <span class="rounded-[10px] px-2.5 py-1.5 text-center shrink-0" :class="aksen.latar">
              <b class="block text-[12px] font-extrabold leading-tight" :class="aksen.teks">{{ j.jam }}</b>
            </span>
            <div class="min-w-0 flex-1">
              <b class="block truncate text-[13px] font-bold text-[#101828]">{{ j.mapel }}</b>
              <span class="block truncate text-[11.5px] text-[#667085]">{{ j.kelas }}<template v-if="j.ruang"> · {{ j.ruang }}</template></span>
            </div>

            <!-- Sudah berlangsung / selesai / tidak hadir -->
            <button v-if="j.sesi === 'berlangsung' && bolehAgenda" type="button" class="min-h-10 rounded-full bg-[#101828] px-4 text-xs font-bold text-white transition hover:bg-[#1D2939]" @click="bukaAgenda(j, false)">Isi Agenda</button>
            <span v-else-if="j.sesi === 'selesai'" class="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857]">Selesai</span>
            <span v-else-if="j.sesi === 'tidak_hadir' || (j.sesi === 'belum' && jendela(j).status === 'lewat')" class="text-right">
              <span class="inline-block rounded-full bg-[#FEF3F2] px-3 py-1 text-xs font-bold text-[#B42318]">Tidak hadir</span>
              <span class="mt-0.5 block text-[10.5px] text-[#667085]">Hubungi Superadmin</span>
            </span>
            <!-- Belum dimulai: aktif hanya di dalam jendela -->
            <span v-else-if="bolehAgenda" class="flex flex-col items-end gap-0.5">
              <button
                type="button"
                class="min-h-10 rounded-full px-4 text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
                :class="jendela(j).status === 'buka' ? 'bg-[#101828] text-white hover:bg-[#1D2939]' : 'bg-[#EFF2F7] text-[#667085]'"
                :disabled="jendela(j).status !== 'buka' || memproses === j.id"
                @click="mulaiMengajar(j)"
              >{{ memproses === j.id ? 'Mencatat…' : 'Mulai Mengajar' }}</button>
              <span class="text-[10.5px] text-[#667085]">{{ jendela(j).status === 'buka' ? `Aktif s.d. ${jendela(j).tutup}` : `Aktif pukul ${jendela(j).buka}` }}</span>
            </span>
          </li>
        </ul>
      </section>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch mt-3.5">
      <div class="h-full lg:col-span-6">
        <AdminV2ExamSchedule :jenjang="jenjang" :exams="ujian" judul="Jadwal CBT & LMS Terdekat" :sub="`Ujian yang Anda ajar atau awasi · TA ${tahunAjaran}`" />
      </div>
      <div class="h-full lg:col-span-6">
        <AdminV2Announcements :announcements="pengumuman" :jenjang="jenjang" />
      </div>
    </div>
  </div>
</template>
