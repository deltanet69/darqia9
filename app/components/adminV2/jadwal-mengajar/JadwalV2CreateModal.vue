<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  DAYS,
  SLOT_TIMES,
  KELAS,
  MAPEL,
  slotMin,
  teachersOf,
  allLessons,
  genGrid,
  type Jenjang,
  type DayIndex
} from './jadwalV2Data'

const props = defineProps<{
  isOpen: boolean
  jenjang: Jenjang
  currentClass: string
  simDayIdx: DayIndex
  extraSchedules: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', payload: {
    level: Jenjang
    kelas: string
    di: DayIndex
    si: number
    mapel: string
    guru: string
    ket: string
  }): void
}>()

const form = ref({
  kelas: props.currentClass || KELAS[props.jenjang][0].name,
  hari: props.simDayIdx as DayIndex,
  mapel: MAPEL[props.jenjang][0].name,
  guru: teachersOf(props.jenjang)[0],
  jam: '07:00',
  ket: ''
})

const errorMessage = ref('')
const isWarningReplace = ref(false)

const classList = computed(() => KELAS[props.jenjang].map(k => k.name))
const mapelList = computed(() => MAPEL[props.jenjang].map(m => m.name))
const teacherList = computed(() => teachersOf(props.jenjang))

const schoolName = computed(() => {
  return props.jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

const handleSubmit = (force: boolean = false) => {
  errorMessage.value = ''
  isWarningReplace.value = false

  if (!form.value.jam) {
    errorMessage.value = 'Jam mengajar wajib diisi.'
    return
  }

  const parts = form.value.jam.split(':')
  const jm = (+parts[0]) * 60 + (+parts[1])
  const si = SLOT_TIMES.findIndex((_, i) => slotMin(i)[0] === jm)

  if (si < 0) {
    errorMessage.value = `Jam ${form.value.jam} tidak sesuai awal jam pelajaran. Pilih salah satu: ${SLOT_TIMES.map(t => t.split('–')[0]).join(', ')}.`
    return
  }

  const di = form.value.hari
  // Periksa bentrok guru di kelas lain
  const allCurrent = allLessons(props.jenjang, props.extraSchedules)
  const guruClash = allCurrent.find(
    l => l.guru === form.value.guru && l.di === di && l.si === si && l.kelas !== form.value.kelas
  )

  if (guruClash) {
    errorMessage.value = `Bentrok guru: ${form.value.guru} sudah terjadwal mengajar ${guruClash.mapel} di kelas ${guruClash.kelas} pada ${DAYS[di]} jam ke-${si + 1} (${SLOT_TIMES[si]}). Pilih guru atau jam lain.`
    return
  }

  // Periksa apakah kelas sudah terisi pada jam itu
  const currentCell = genGrid(props.jenjang, form.value.kelas, props.extraSchedules)[di][si]
  if (currentCell && !force) {
    isWarningReplace.value = true
    errorMessage.value = `Kelas ${form.value.kelas} sudah terisi ${currentCell.mapel} oleh ${currentCell.guru} pada jam ini. Klik "Ganti & Simpan Jadwal" untuk mengganti penugasan tersebut.`
    return
  }

  emit('saved', {
    level: props.jenjang,
    kelas: form.value.kelas,
    di,
    si,
    mapel: form.value.mapel,
    guru: form.value.guru,
    ket: form.value.ket
  })

  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- Scrim Backdrop -->
    <div
      class="fixed inset-0 bg-[#101828]/45 backdrop-blur-xs transition-opacity"
      @click="emit('close')"
    />

    <!-- Modal Box -->
    <div class="relative w-full max-w-lg rounded-2xl border border-[#E7EBF2] bg-white p-5 shadow-2xl sm:p-6">
      <!-- Modal Header -->
      <div class="flex items-start justify-between gap-3 border-b border-[#EFF2F7] pb-3.5">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">
            Buat Jadwal Mengajar
          </h3>
          <p class="mt-0.5 text-xs font-semibold text-[#667085]">
            {{ schoolName }} &bull; Tahun Ajaran 2026/2027
          </p>
        </div>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-xl text-[#667085] hover:bg-[#F3F5F9] hover:text-[#101828]"
          aria-label="Tutup"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Error / Warning Banner -->
      <div
        v-if="errorMessage"
        class="mt-4 rounded-xl p-3 text-xs font-semibold leading-relaxed"
        :class="isWarningReplace ? 'border border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]' : 'border border-[#FECDC2] bg-[#FFF4ED] text-[#B42318]'"
      >
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Form Grid -->
      <form class="mt-4 space-y-3.5" @submit.prevent="handleSubmit(isWarningReplace)">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <!-- 1. Pilih Kelas -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">
              Pilih Kelas <span class="text-[#F04438]">*</span>
            </label>
            <select
              v-model="form.kelas"
              required
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
              <option v-for="c in classList" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>

          <!-- Hari -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">
              Hari <span class="text-[#F04438]">*</span>
            </label>
            <select
              v-model="form.hari"
              required
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
              <option v-for="(d, idx) in DAYS" :key="d" :value="idx">
                {{ d }}
              </option>
            </select>
          </div>

          <!-- 2. Nama Pelajaran -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">
              Nama Pelajaran <span class="text-[#F04438]">*</span>
            </label>
            <select
              v-model="form.mapel"
              required
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
              <option v-for="m in mapelList" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
          </div>

          <!-- 3. Guru Pengajar -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">
              Guru Pengajar <span class="text-[#F04438]">*</span>
            </label>
            <select
              v-model="form.guru"
              required
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
              <option v-for="t in teacherList" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </div>

          <!-- 4. Jam Mengajar -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">
              Jam Mulai <span class="text-[#F04438]">*</span>
            </label>
            <input
              v-model="form.jam"
              type="time"
              required
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
          </div>

          <!-- 5. Keterangan -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">
              Keterangan
            </label>
            <input
              v-model="form.ket"
              type="text"
              placeholder="Contoh: Praktik Lab Komputer"
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
          </div>
        </div>

        <p class="text-[11px] font-semibold text-[#667085] leading-relaxed">
          Pilihan jam awal sesi: 07:00, 07:45, 08:30, 09:30, 10:15, 11:00, 12:30. Sistem secara otomatis mencegah jadwal bentrok guru &amp; rombel.
        </p>

        <!-- Actions -->
        <div class="mt-5 flex items-center justify-end gap-2.5 border-t border-[#EFF2F7] pt-4">
          <button
            type="button"
            class="min-h-10 rounded-xl border border-[#D0D5DD] bg-white px-4 text-xs font-bold text-[#344054] shadow-xs hover:bg-[#F8FAFD]"
            @click="emit('close')"
          >
            Batal
          </button>

          <button
            type="submit"
            class="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12459B]"
          >
            <AdminV2Icon name="check" :size="15" />
            <span>{{ isWarningReplace ? 'Ganti & Simpan Jadwal' : 'Simpan Jadwal' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
