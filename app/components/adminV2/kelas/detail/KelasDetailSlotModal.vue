<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'

export interface SlotStudentRecord {
  nisn: string
  name: string
  gender: 'L' | 'P'
  status: 'Hadir' | 'Alpa' | 'Izin' | 'Sakit'
}

interface Props {
  open: boolean
  session: {
    id: string
    session: string | number
    time: string
    subject: string
    teacher: string
    room: string
  } | null
  students: {
    nisn: string
    name: string
    gender: 'L' | 'P'
  }[]
  currentAlpaList?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  session: null,
  currentAlpaList: () => []
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', result: {
    sessionId: string
    alpaList: string[]
    izinList: string[]
    sakitList: string[]
    hadirCount: number
  }): void
}>()

const search = ref('')
const filterStatus = ref<'Semua' | 'Hadir' | 'Alpa' | 'Izin' | 'Sakit'>('Semua')
const records = ref<SlotStudentRecord[]>([])

watch(
  () => [props.open, props.session],
  () => {
    if (props.open && props.session) {
      search.value = ''
      filterStatus.value = 'Semua'
      records.value = props.students.map(s => ({
        nisn: s.nisn,
        name: s.name,
        gender: s.gender,
        status: props.currentAlpaList.includes(s.name) ? 'Alpa' : 'Hadir'
      }))
    }
  },
  { immediate: true }
)

const filteredRecords = computed(() => {
  return records.value.filter(s => {
    if (filterStatus.value !== 'Semua' && s.status !== filterStatus.value) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    }
    return true
  })
})

const statusCounts = computed(() => {
  const hadir = records.value.filter(s => s.status === 'Hadir').length
  const alpa = records.value.filter(s => s.status === 'Alpa').length
  const izin = records.value.filter(s => s.status === 'Izin').length
  const sakit = records.value.filter(s => s.status === 'Sakit').length
  return { hadir, alpa, izin, sakit }
})

const markAllHadir = () => {
  records.value.forEach(r => { r.status = 'Hadir' })
}

const handleSubmit = () => {
  if (!props.session) return
  const alpaList = records.value.filter(s => s.status === 'Alpa').map(s => s.name)
  const izinList = records.value.filter(s => s.status === 'Izin').map(s => s.name)
  const sakitList = records.value.filter(s => s.status === 'Sakit').map(s => s.name)

  emit('submit', {
    sessionId: props.session.id,
    alpaList,
    izinList,
    sakitList,
    hadirCount: statusCounts.value.hadir
  })
}
</script>

<template>
  <div
    v-if="open && session"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="relative w-full bg-white rounded-3xl shadow-2xl border border-[#E7EBF2] max-w-xl max-h-[88vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <header class="px-5 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between gap-3 shrink-0">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#1B5FD9] block">
            Verifikasi Presensi Jam KBM
          </span>
          <h3 class="text-base font-extrabold text-[#101828]">
            Set Alpa / Presensi Sesi {{ session.subject }}
          </h3>
          <p class="text-xs text-[#667085] mt-0.5">
            {{ session.time }} &bull; {{ session.room }} &bull; {{ session.teacher }}
          </p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <!-- Toolbar Search & Filter -->
      <div class="p-4 border-b border-[#F1F5F9] bg-white space-y-2.5 shrink-0">
        <div class="flex items-center gap-2">
          <div class="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <AdminV2Icon name="search" :size="14" class="text-[#98A2B3]" />
            <input
              v-model.trim="search"
              placeholder="Cari nama siswa atau NISN..."
              class="w-full bg-transparent outline-none text-[#101828]"
            />
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EFF4FF] text-[#1B5FD9] hover:bg-[#D1E0FF] transition cursor-pointer shrink-0"
            @click="markAllHadir"
          >
            Set Semua Hadir
          </button>
        </div>

        <!-- Filter Status Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            v-for="st in ['Semua', 'Hadir', 'Alpa', 'Izin', 'Sakit']"
            :key="st"
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterStatus === st ? 'bg-[#101828] text-white' : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
            @click="filterStatus = st as any"
          >
            {{ st }}
          </button>
        </div>
      </div>

      <!-- Student Records List -->
      <div class="flex-1 overflow-y-auto p-4 divide-y divide-[#F1F5F9]">
        <div
          v-for="stu in filteredRecords"
          :key="stu.nisn"
          class="py-2.5 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-xs text-[#101828] truncate">{{ stu.name }}</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#EFF2F7] text-[#667085]">{{ stu.gender }}</span>
            </div>
            <span class="text-[11px] font-mono text-[#98A2B3] block">{{ stu.nisn }}</span>
          </div>

          <!-- Status Buttons -->
          <div class="flex items-center gap-1 shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl">
            <button
              v-for="opt in ['Hadir', 'Alpa', 'Izin', 'Sakit']"
              :key="opt"
              type="button"
              class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer"
              :class="stu.status === opt
                ? (opt === 'Hadir' ? 'bg-[#16A34A] text-white shadow-xs' :
                   opt === 'Alpa' ? 'bg-[#DC2626] text-white shadow-xs' :
                   opt === 'Izin' ? 'bg-[#1B5FD9] text-white shadow-xs' :
                   'bg-[#D97706] text-white shadow-xs')
                : 'text-[#667085] hover:text-[#101828]'"
              @click="stu.status = opt as any"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div v-if="filteredRecords.length === 0" class="py-8 text-center text-xs text-[#98A2B3] font-medium">
          Tidak ada siswa yang sesuai pencarian.
        </div>
      </div>

      <!-- Modal Footer -->
      <footer class="px-5 py-3.5 border-t border-[#F1F5F9] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div class="flex items-center gap-2 font-mono text-[11px] font-bold text-[#475467]">
          <span class="text-[#16A34A]">{{ statusCounts.hadir }} Hadir</span>
          <span class="text-[#D0D5DD]">&bull;</span>
          <span class="text-[#DC2626]">{{ statusCounts.alpa }} Alpa</span>
          <span class="text-[#D0D5DD]">&bull;</span>
          <span class="text-[#1B5FD9]">{{ statusCounts.izin }} Izin</span>
          <span class="text-[#D0D5DD]">&bull;</span>
          <span class="text-[#D97706]">{{ statusCounts.sakit }} Sakit</span>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#E2E8F0] transition cursor-pointer"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer"
            @click="handleSubmit"
          >
            Simpan Presensi
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>
