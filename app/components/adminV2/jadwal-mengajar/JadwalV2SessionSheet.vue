<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  DAYS,
  SLOT_TIMES,
  KELAS,
  rosterOf,
  type Jenjang,
  type DayIndex,
  type StudentRosterItem
} from './jadwalV2Data'

const props = defineProps<{
  isOpen: boolean
  sessionKey: string | null
  extraSchedules: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'started', payload: {
    key: string
    hadir: number
    alpa: string[]
  }): void
}>()

// Key format: level|kelas|di|si
const parsedSession = computed(() => {
  if (!props.sessionKey) return null
  const [level, kelas, diStr, siStr] = props.sessionKey.split('|')
  const di = +diStr as DayIndex
  const si = +siStr
  const classMeta = KELAS[level as Jenjang]?.find(k => k.name === kelas) || { room: '-' }
  return {
    key: props.sessionKey,
    level: level as Jenjang,
    kelas,
    di,
    si,
    time: SLOT_TIMES[si],
    room: classMeta.room
  }
})

const mode = ref<'lengkap' | 'alpa' | null>(null)
const alpaSet = ref<Set<string>>(new Set())

const roster = computed<StudentRosterItem[]>(() => {
  if (!parsedSession.value) return []
  return rosterOf(parsedSession.value.level, parsedSession.value.kelas)
})

const toggleStudentAlpa = (name: string) => {
  if (alpaSet.value.has(name)) {
    alpaSet.value.delete(name)
  } else {
    alpaSet.value.add(name)
  }
}

const chooseLengkap = () => {
  mode.value = 'lengkap'
  alpaSet.value.clear()
}

const chooseSetAlpa = () => {
  mode.value = 'alpa'
}

const resetMode = () => {
  mode.value = null
  alpaSet.value.clear()
}

const handleStart = () => {
  if (!parsedSession.value) return
  const total = roster.value.length
  const alpaCount = alpaSet.value.size
  const hadirCount = total - alpaCount

  emit('started', {
    key: parsedSession.value.key,
    hadir: hadirCount,
    alpa: [...alpaSet.value]
  })

  mode.value = null
  alpaSet.value.clear()
  emit('close')
}

const getInitials = (name: string): string => {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
</script>

<template>
  <div
    v-if="isOpen && parsedSession"
    class="fixed inset-0 z-50 overflow-hidden"
    role="dialog"
    aria-modal="true"
  >
    <!-- Scrim -->
    <div
      class="fixed inset-0 bg-[#101828]/45 backdrop-blur-xs transition-opacity"
      @click="emit('close')"
    />

    <div class="fixed inset-y-0 right-0 flex max-w-full pl-10">
      <!-- Sheet Panel -->
      <div class="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between">
        <!-- Sheet Header -->
        <div class="flex items-start justify-between gap-3 border-b border-[#E7EBF2] p-5">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-extrabold text-[#101828]">
                Mulai Sesi Mengajar
              </h3>
              <span class="rounded-full bg-[#E8F0FE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#12459B] uppercase">
                {{ parsedSession.level }}
              </span>
            </div>
            <p class="mt-1 text-xs font-semibold text-[#667085]">
              {{ DAYS[parsedSession.di] }} &bull; Kelas {{ parsedSession.kelas }} &bull; {{ parsedSession.time }}
            </p>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-xl text-[#667085] hover:bg-[#F3F5F9] hover:text-[#101828]"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="18" />
          </button>
        </div>

        <!-- Sheet Body -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- Session Meta Chips -->
          <div class="flex flex-wrap gap-2 text-xs font-semibold">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1 text-[#12459B]">
              <AdminV2Icon name="clock" :size="13" />
              <span>{{ parsedSession.time }} (Jam ke-{{ parsedSession.si + 1 }})</span>
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#F3F5F9] px-3 py-1 text-[#344054]">
              <AdminV2Icon name="users" :size="13" />
              <span>Kelas {{ parsedSession.kelas }}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#F3F5F9] px-3 py-1 text-[#344054]">
              <span>{{ parsedSession.room }}</span>
            </span>
          </div>

          <!-- Section Checklist Kehadiran -->
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#344054]">
              Cek Kehadiran Siswa
            </h4>
            <p class="mt-1 text-xs leading-relaxed text-[#667085]">
              Sebelum memulai jam pelajaran, pastikan kehadiran siswa di kelas. Pilih <b>"Siswa Lengkap"</b> jika semua hadir, atau <b>"Set Alpa"</b> untuk menandai siswa yang bolos/tidak hadir.
            </p>
          </div>

          <!-- Initial Choice Buttons -->
          <div v-if="!mode" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="flex items-start gap-3 rounded-2xl border-2 border-[#A6F4C5] bg-[#ECFDF5] p-4 text-left transition-all hover:shadow-xs"
              @click="chooseLengkap"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#047857] text-white">
                <AdminV2Icon name="check" :size="18" />
              </div>
              <div>
                <b class="block text-sm font-bold text-[#067647]">Siswa Lengkap</b>
                <span class="mt-0.5 block text-[11px] leading-snug text-[#047857]">
                  Semua siswa di kelas hadir — langsung mulai mengajar.
                </span>
              </div>
            </button>

            <button
              type="button"
              class="flex items-start gap-3 rounded-2xl border-2 border-[#FED7AA] bg-[#FFF7ED] p-4 text-left transition-all hover:shadow-xs"
              @click="chooseSetAlpa"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C2410C] text-white">
                <AdminV2Icon name="alert" :size="18" />
              </div>
              <div>
                <b class="block text-sm font-bold text-[#9A3412]">Set Alpa</b>
                <span class="mt-0.5 block text-[11px] leading-snug text-[#C2410C]">
                  Ada siswa bolos / tidak hadir — pilih namanya.
                </span>
              </div>
            </button>
          </div>

          <!-- Mode Lengkap Result -->
          <div
            v-if="mode === 'lengkap'"
            class="rounded-xl border border-[#A6F4C5] bg-[#ECFDF5] p-3.5 text-xs font-semibold text-[#067647] leading-relaxed"
          >
            Semua {{ roster.length }} siswa dinyatakan <b>hadir lengkap</b>. Sesi mengajar siap dimulai dan dicatat ke jurnal mengajar.
          </div>

          <!-- Mode Set Alpa: Daftar Roster Siswa -->
          <div v-if="mode === 'alpa'" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#344054]">
                Ketuk nama siswa yang tidak hadir:
              </span>
              <span
                class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                :class="alpaSet.size > 0 ? 'bg-[#FEE4E2] text-[#B42318]' : 'bg-[#F3F5F9] text-[#667085]'"
              >
                {{ alpaSet.size }} Alpa &bull; {{ roster.length - alpaSet.size }} Hadir
              </span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="stu in roster"
                :key="stu.nis"
                type="button"
                class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="alpaSet.has(stu.name)
                  ? 'border-[#F04438] bg-[#FEE4E2] text-[#B42318]'
                  : 'border-[#E7EBF2] bg-white text-[#344054] hover:bg-[#F8FAFD]'"
                @click="toggleStudentAlpa(stu.name)"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold"
                  :class="stu.gender === 'L' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#FCE8F3] text-[#A91E4E]'"
                >
                  {{ getInitials(stu.name) }}
                </span>
                <span>{{ stu.name }}</span>
                <span
                  v-if="alpaSet.has(stu.name)"
                  class="ml-0.5 rounded-full bg-[#F04438] px-1.5 py-0.2 text-[9px] font-extrabold text-white"
                >
                  ALPA
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sheet Footer -->
        <div class="border-t border-[#E7EBF2] bg-[#FAFBFD] p-4 flex items-center justify-between gap-3">
          <button
            v-if="mode"
            type="button"
            class="text-xs font-bold text-[#667085] hover:text-[#101828]"
            @click="resetMode"
          >
            Ubah Pilihan
          </button>
          <span v-else class="text-[11px] font-semibold text-[#667085]">
            Presensi siswa akan tercatat otomatis.
          </span>

          <button
            v-if="mode"
            type="button"
            class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12459B]"
            @click="handleStart"
          >
            <AdminV2Icon name="check" :size="15" />
            <span>Mulai Mengajar {{ mode === 'alpa' && alpaSet.size > 0 ? `· ${alpaSet.size} Alpa` : '' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
