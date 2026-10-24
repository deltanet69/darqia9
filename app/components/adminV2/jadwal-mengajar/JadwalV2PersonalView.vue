<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  DAYS,
  slotMin,
  fmtMin,
  lessonsOf,
  type Jenjang,
  type DayIndex,
  type DayName,
  type LessonItem,
  type LessonSession,
  type PersonaInfo
} from './jadwalV2Data'

const props = defineProps<{
  jenjang: Jenjang
  persona: PersonaInfo
  simDayIdx: DayIndex
  simMin: number
  sessions: Record<string, LessonSession>
  extraSchedules: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }>
}>()

const emit = defineEmits<{
  (e: 'mulai', lessonKey: string): void
  (e: 'akhiri', lessonKey: string): void
}>()

// Filter hari: 'all' atau index hari 0..4 (Senin - Jumat)
const selectedDayFilter = ref<DayIndex | 'all'>('all')

const myLessons = computed<LessonItem[]>(() => {
  return lessonsOf(props.jenjang, props.persona.name, props.extraSchedules)
})

const lessonKey = (l: LessonItem): string => {
  return `${l.level}|${l.kelas}|${l.di}|${l.si}`
}

const getMulaiState = (l: LessonItem): 'done' | 'live' | 'other' | 'early' | 'window' | 'late' => {
  const k = lessonKey(l)
  if (props.sessions[k]) {
    return props.sessions[k].done ? 'done' : 'live'
  }
  if (l.di !== props.simDayIdx) {
    return 'other'
  }
  const st = slotMin(l.si)[0]
  if (props.simMin < st - 10) return 'early'
  if (props.simMin <= st + 10) return 'window'
  return 'late'
}

const todayLessons = computed<LessonItem[]>(() => {
  return myLessons.value.filter(l => l.di === props.simDayIdx)
})

const activeHeroLesson = computed<LessonItem | null>(() => {
  if (!todayLessons.value.length) return null
  return (
    todayLessons.value.find(l => getMulaiState(l) === 'live') ||
    todayLessons.value.find(l => getMulaiState(l) === 'window') ||
    todayLessons.value.find(l => getMulaiState(l) === 'early') ||
    todayLessons.value[0] || null
  )
})

const filteredLessons = computed<LessonItem[]>(() => {
  if (selectedDayFilter.value === 'all') return myLessons.value
  return myLessons.value.filter(l => l.di === selectedDayFilter.value)
})

const lessonCountPerDay = computed(() => {
  const map: Record<DayIndex, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
  myLessons.value.forEach(l => {
    map[l.di] = (map[l.di] || 0) + 1
  })
  return map
})

const schoolName = computed(() => {
  return props.jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})
</script>

<template>
  <div class="space-y-4">
    <!-- Greeting & Info Card -->
    <section class="rounded-2xl border border-[#E7EBF2] bg-white p-4 shadow-xs sm:p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-extrabold text-[#101828]">
            Halo, {{ persona.name }}
          </h2>
          <p class="mt-0.5 text-xs font-semibold text-[#667085]">
            {{ persona.label }} &bull; {{ schoolName }}
          </p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-full bg-[#0B1F3A] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
          <span class="h-2 w-2 rounded-full bg-[#34D399]" />
          <span>Simulasi: {{ DAYS[simDayIdx] }}, {{ fmtMin(simMin) }} WIB</span>
        </div>
      </div>
    </section>

    <!-- Empty State jika tidak punya jadwal -->
    <section
      v-if="!myLessons.length"
      class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center shadow-xs sm:p-12"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1B5FD9]">
        <AdminV2Icon name="cal" :size="28" />
      </div>
      <h3 class="mt-4 text-base font-extrabold text-[#101828]">
        Anda tidak memiliki jadwal mengajar
      </h3>
      <p class="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#667085]">
        Tidak ada jam mengajar yang ditugaskan untuk akun Anda pada jenjang {{ schoolName }}. Jika Anda merasa ini keliru, silakan hubungi operator akademik untuk penugasan jadwal.
      </p>
    </section>

    <!-- Konten Jadwal Jika Ada -->
    <template v-else>
      <!-- Hero Focus Card (Pelajaran Hari Ini yang Aktif / Terdekat) -->
      <section
        v-if="activeHeroLesson"
        class="rounded-2xl bg-gradient-to-br from-[#0E2547] to-[#18355F] p-4 text-white shadow-md sm:p-5"
      >
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FCD34D]">
              <span v-if="getMulaiState(activeHeroLesson) === 'live'" class="h-1.5 w-1.5 rounded-full bg-[#F87171] animate-ping" />
              <span>
                {{
                  getMulaiState(activeHeroLesson) === 'live'
                    ? 'Sedang Berlangsung'
                    : getMulaiState(activeHeroLesson) === 'window'
                    ? 'Giliran Anda Mengajar'
                    : getMulaiState(activeHeroLesson) === 'done'
                    ? 'Sudah Selesai'
                    : getMulaiState(activeHeroLesson) === 'late'
                    ? 'Jendela Mulai Terlewat'
                    : 'Pelajaran Berikutnya'
                }}
              </span>
            </span>
            <h3 class="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
              {{ activeHeroLesson.mapel }}
            </h3>
            <p class="mt-1 text-xs font-semibold text-[#B9CCF5]">
              Kelas {{ activeHeroLesson.kelas }} &bull; {{ activeHeroLesson.room }} &bull; Jam ke-{{ activeHeroLesson.si + 1 }}
            </p>
          </div>

          <!-- Jam & Action -->
          <div class="flex flex-col items-start gap-3 sm:items-end">
            <div class="text-left sm:text-right">
              <span class="text-xl font-extrabold">{{ fmtMin(slotMin(activeHeroLesson.si)[0]) }}</span>
              <span class="text-xs font-semibold text-[#B9CCF5]"> s.d. {{ fmtMin(slotMin(activeHeroLesson.si)[1]) }}</span>
            </div>

            <!-- Tombol Mulai / Akhiri -->
            <div class="flex flex-col items-start sm:items-end gap-1.5">
              <button
                v-if="getMulaiState(activeHeroLesson) === 'window'"
                type="button"
                class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0B1F3A] shadow-md transition-transform hover:scale-105"
                @click="emit('mulai', lessonKey(activeHeroLesson))"
              >
                <AdminV2Icon name="clock" :size="15" />
                <span>Mulai Mengajar</span>
              </button>

              <button
                v-else-if="getMulaiState(activeHeroLesson) === 'early'"
                type="button"
                disabled
                class="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-xl bg-white/40 px-4 text-xs font-bold text-white/80"
              >
                <AdminV2Icon name="clock" :size="15" />
                <span>Mulai Mengajar</span>
              </button>

              <button
                v-else-if="getMulaiState(activeHeroLesson) === 'live'"
                type="button"
                class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0B1F3A] shadow-md transition-colors hover:bg-[#F3F5F9]"
                @click="emit('akhiri', lessonKey(activeHeroLesson))"
              >
                <span>Akhiri Sesi</span>
              </button>

              <span v-if="getMulaiState(activeHeroLesson) === 'window'" class="text-[10.5px] font-semibold text-[#B9CCF5]">
                Jendela mulai aktif s.d. {{ fmtMin(slotMin(activeHeroLesson.si)[0] + 10) }}
              </span>
              <span v-else-if="getMulaiState(activeHeroLesson) === 'early'" class="text-[10.5px] font-semibold text-[#B9CCF5]">
                Aktif pukul {{ fmtMin(slotMin(activeHeroLesson.si)[0] - 10) }} (10 menit sebelum jam mulai)
              </span>
              <span v-else-if="getMulaiState(activeHeroLesson) === 'live'" class="text-[10.5px] font-semibold text-[#B9CCF5]">
                Hadir {{ sessions[lessonKey(activeHeroLesson)]?.hadir }} &bull; Alpa {{ sessions[lessonKey(activeHeroLesson)]?.alpa.length }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Selector Hari Senin - Jum'at (Requirement: simple dan jelas) -->
      <section class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5 shadow-xs sm:p-4">
        <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#344054]">
              Pilih Tampilan Hari (Senin–Jum'at)
            </h4>
            <p class="text-[11px] font-semibold text-[#667085]">
              Filter jadwal mingguan per hari atau lihat seluruh jadwal secara lengkap.
            </p>
          </div>

          <!-- Pills Selector Hari -->
          <div class="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter hari mengajar">
            <!-- Tombol Semua Hari -->
            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors"
              :class="selectedDayFilter === 'all' ? 'bg-[#0A2A5C] text-white shadow-xs' : 'border border-[#E7EBF2] bg-[#F8FAFD] text-[#475467] hover:bg-[#EFF2F7]'"
              @click="selectedDayFilter = 'all'"
            >
              <span>Semua Hari</span>
              <span
                class="rounded-full px-1.5 py-0.5 text-[10px]"
                :class="selectedDayFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#E7EBF2] text-[#475467]'"
              >
                {{ myLessons.length }}
              </span>
            </button>

            <!-- Tombol Hari Senin s.d. Jumat -->
            <button
              v-for="(day, di) in DAYS"
              :key="'day-btn-' + di"
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors"
              :class="selectedDayFilter === di ? 'bg-[#0A2A5C] text-white shadow-xs' : 'border border-[#E7EBF2] bg-[#F8FAFD] text-[#475467] hover:bg-[#EFF2F7]'"
              @click="selectedDayFilter = di as DayIndex"
            >
              <span>{{ day }}</span>
              <span
                v-if="lessonCountPerDay[di as DayIndex] > 0"
                class="rounded-full px-1.5 py-0.5 text-[10px]"
                :class="selectedDayFilter === di ? 'bg-white/20 text-white' : 'bg-[#E7EBF2] text-[#475467]'"
              >
                {{ lessonCountPerDay[di as DayIndex] }}
              </span>
              <span v-if="di === simDayIdx" class="h-1.5 w-1.5 rounded-full bg-[#1B5FD9]" title="Hari ini" />
            </button>
          </div>
        </div>
      </section>

      <!-- Daftar Jadwal Mengajar per Hari -->
      <section class="space-y-4">
        <!-- Loop Hari jika 'all', atau render satu hari jika spesifik -->
        <div
          v-for="(day, di) in DAYS"
          :key="'day-group-' + di"
          v-show="selectedDayFilter === 'all' || selectedDayFilter === di"
          class="space-y-2.5"
        >
          <!-- Day Header Divider -->
          <div class="flex items-center gap-3">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#344054]">
              {{ day }}
              <span v-if="di === simDayIdx" class="ml-1.5 rounded-md bg-[#E8F0FE] px-2 py-0.5 text-[10px] font-bold text-[#1B5FD9]">
                Hari Ini
              </span>
            </h4>
            <div class="h-px flex-1 border-t border-[#E7EBF2]" />
            <span class="text-[11px] font-bold text-[#667085]">
              {{ myLessons.filter(l => l.di === di).length }} sesi
            </span>
          </div>

          <!-- Empty list untuk hari yang tidak ada jadwal -->
          <div
            v-if="!myLessons.some(l => l.di === di)"
            class="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFD] p-4 text-center text-xs font-semibold text-[#98A2B3]"
          >
            Tidak ada jam mengajar pada hari {{ day }}.
          </div>

          <!-- Cards Pelajaran -->
          <div v-else class="space-y-2.5">
            <article
              v-for="l in myLessons.filter(l => l.di === di)"
              :key="lessonKey(l)"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border p-4 shadow-xs transition-all"
              :class="[
                getMulaiState(l) === 'window'
                  ? 'border-[#93B4F5] bg-[#F5F8FF] ring-2 ring-[#1B5FD9]/20'
                  : getMulaiState(l) === 'done'
                  ? 'border-[#E7EBF2] bg-[#FAFBFD] opacity-90'
                  : 'border-[#E7EBF2] bg-white hover:border-[#CBD5E1]'
              ]"
            >
              <!-- Info Kiri: Jam & Ruang/Mapel -->
              <div class="flex items-start gap-3.5">
                <div class="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F3F5F9] p-2.5 text-center">
                  <b class="text-xs text-[#101828]">{{ fmtMin(slotMin(l.si)[0]) }}</b>
                  <span class="text-[10px] font-semibold text-[#667085]">{{ fmtMin(slotMin(l.si)[1]) }}</span>
                  <span class="mt-0.5 text-[9.5px] font-bold text-[#98A2B3]">Jam ke-{{ l.si + 1 }}</span>
                </div>

                <div class="min-w-0">
                  <h5 class="text-sm font-extrabold text-[#101828]">
                    {{ l.mapel }}
                  </h5>
                  <p class="mt-0.5 text-xs font-semibold text-[#667085]">
                    Kelas {{ l.kelas }} &bull; {{ l.room }} &bull; {{ l.guru }}
                  </p>
                  <p v-if="l.ket" class="mt-1 text-[11px] font-medium text-[#1B5FD9]">
                    Keterangan: {{ l.ket }}
                  </p>

                  <span
                    v-if="getMulaiState(l) === 'window'"
                    class="mt-2 inline-flex items-center gap-1 rounded-md border border-[#FDE68A] bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E]"
                  >
                    Jendela Mulai Aktif
                  </span>
                </div>
              </div>

              <!-- Action Kanan -->
              <div class="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                <button
                  v-if="getMulaiState(l) === 'window'"
                  type="button"
                  class="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#1B5FD9] px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12459B]"
                  @click="emit('mulai', lessonKey(l))"
                >
                  <AdminV2Icon name="clock" :size="14" />
                  <span>Mulai Mengajar</span>
                </button>

                <button
                  v-else-if="getMulaiState(l) === 'early'"
                  type="button"
                  disabled
                  class="inline-flex min-h-9 cursor-not-allowed items-center gap-2 rounded-xl bg-[#EFF2F7] px-3.5 text-xs font-bold text-[#98A2B3]"
                >
                  <span>Mulai Mengajar</span>
                </button>

                <button
                  v-else-if="getMulaiState(l) === 'live'"
                  type="button"
                  class="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-xs font-bold text-[#344054] shadow-xs hover:bg-[#F8FAFD]"
                  @click="emit('akhiri', lessonKey(l))"
                >
                  <span>Akhiri Sesi</span>
                </button>

                <span
                  v-else-if="getMulaiState(l) === 'done'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                  <span>Selesai</span>
                </span>

                <span
                  v-else
                  class="text-xs font-bold text-[#667085]"
                >
                  Terjadwal
                </span>

                <!-- Sub caption text -->
                <span v-if="getMulaiState(l) === 'window'" class="text-[10px] font-semibold text-[#1B5FD9]">
                  Batas jam: {{ fmtMin(slotMin(l.si)[0] + 10) }}
                </span>
                <span v-else-if="getMulaiState(l) === 'early'" class="text-[10px] font-semibold text-[#667085]">
                  Aktif pukul {{ fmtMin(slotMin(l.si)[0] - 10) }}
                </span>
                <span v-else-if="getMulaiState(l) === 'live'" class="text-[10px] font-semibold text-[#047857]">
                  Hadir {{ sessions[lessonKey(l)]?.hadir }} &bull; Alpa {{ sessions[lessonKey(l)]?.alpa.length }}
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
