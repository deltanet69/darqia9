<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'

export interface TeacherAttendance {
  id: string
  name: string
  nip: string
  rfidUid: string
  school: 'SMK' | 'SMP'
  subject: string
  level: string
  gender: 'Laki-laki' | 'Perempuan'
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'
  timeIn: string | null
  timeOut: string | null
  lateMinutes?: number
  gate?: string
}

const props = defineProps<{
  teacher: TeacherAttendance | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', teacher: TeacherAttendance): void
}>()

const localTeacher = ref<TeacherAttendance | null>(null)

watch(
  () => props.teacher,
  (val) => {
    if (val) {
      localTeacher.value = { ...val }
    } else {
      localTeacher.value = null
    }
  },
  { immediate: true }
)

watch(
  () => props.isOpen,
  (val) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = val ? 'hidden' : ''
    }
  }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const attendanceHistoryMock = [
  { day: 'Senin', status: 'Hadir', time: '06:18' },
  { day: 'Jumat', status: 'Hadir', time: '06:22' },
  { day: 'Kamis', status: 'Hadir', time: '06:25' },
  { day: 'Rabu', status: 'Terlambat', time: '06:50' },
  { day: 'Selasa', status: 'Hadir', time: '06:20' }
]

const updateStatus = (newStatus: TeacherAttendance['status']) => {
  if (localTeacher.value) {
    localTeacher.value.status = newStatus
    if (newStatus === 'Hadir' && !localTeacher.value.timeIn) {
      localTeacher.value.timeIn = '06:25'
    } else if (newStatus === 'Terlambat') {
      localTeacher.value.timeIn = '06:52'
      localTeacher.value.lateMinutes = 7
    } else if (['Izin', 'Sakit', 'Alpa'].includes(newStatus)) {
      localTeacher.value.timeIn = null
      localTeacher.value.timeOut = null
    }
  }
}

const handleSave = () => {
  if (localTeacher.value) {
    emit('save', { ...localTeacher.value })
  }
}

const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|Ust\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.E\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const pillClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
    case 'Terlambat': return 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
    case 'Izin': return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
    case 'Sakit': return 'bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]'
    case 'Alpa': return 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
    default: return 'bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC]'
  }
}

const dotClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-[#10B981]'
    case 'Terlambat': return 'bg-[#F59E0B]'
    case 'Izin': return 'bg-[#3B82F6]'
    case 'Sakit': return 'bg-[#06B6D4]'
    case 'Alpa': return 'bg-[#F43F5E]'
    default: return 'bg-[#98A2B3]'
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && localTeacher"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#0C111D]/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Panel -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden z-10 border border-[#E7EBF2] my-8 animate-scaleUp"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-[#F2F4F7] flex items-center justify-between bg-white">
          <div>
            <div class="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-0.5">
              Presensi RFID PTK &bull; Detail Pendidik
            </div>
            <h3 class="text-lg font-extrabold text-[#101828]">
              {{ localTeacher.name }}
            </h3>
          </div>
          <button
            type="button"
            class="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-xl transition cursor-pointer"
            aria-label="Tutup modal"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="20" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto">
          <!-- Teacher Identity Hero -->
          <div class="p-4.5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white shadow-sm flex items-center gap-4">
            <span class="w-13 h-13 rounded-2xl bg-white/10 text-white font-extrabold text-lg flex items-center justify-center shrink-0 border border-white/20">
              {{ initials(localTeacher.name) }}
            </span>
            <div class="min-w-0">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white inline-block mb-1">
                {{ localTeacher.school === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia' }}
              </span>
              <h4 class="text-base sm:text-lg font-bold text-white truncate">
                {{ localTeacher.name }}
              </h4>
              <div class="flex items-center gap-2 text-xs text-slate-300 font-mono mt-0.5">
                <span>NIP: {{ localTeacher.nip }}</span>
                <span>&bull;</span>
                <span>{{ localTeacher.level }}</span>
              </div>
            </div>
          </div>

          <!-- Presence Status Highlight -->
          <div class="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">Status Kehadiran Hari Ini</span>
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs"
                :class="pillClass(localTeacher.status)"
              >
                <span class="w-2 h-2 rounded-full" :class="dotClass(localTeacher.status)" />
                <span>{{ localTeacher.status }}</span>
              </span>
            </div>
            <div class="text-left sm:text-right font-mono text-xs">
              <span class="text-[11px] font-sans font-semibold text-[#64748B] block">Waktu Tap Smartcard RFID:</span>
              <b class="text-[#0F172A] text-sm font-bold">{{ localTeacher.timeIn || '—' }}</b>
              <span v-if="localTeacher.timeOut" class="text-[#64748B] font-sans text-[11px]"> (Keluar: {{ localTeacher.timeOut }})</span>
            </div>
          </div>

          <!-- RFID Card Info Card -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
              <span class="text-[10.5px] font-bold text-[#1D4ED8] uppercase tracking-wider block mb-0.5">UID Kartu RFID Guru</span>
              <b class="text-[#0F172A] font-mono text-xs">{{ localTeacher.rfidUid }}</b>
              <span class="text-[10px] text-[#059669] font-bold block mt-1">● Status: Terdaftar &amp; Terverifikasi</span>
            </div>
            <div class="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
              <span class="text-[10.5px] font-bold text-[#7C3AED] uppercase tracking-wider block mb-0.5">Mata Pelajaran Binaan</span>
              <b class="text-[#0F172A] text-xs">{{ localTeacher.subject }}</b>
              <span class="text-[10px] text-[#64748B] font-mono block mt-1">Penugasan: {{ localTeacher.level }}</span>
            </div>
          </div>

          <!-- 5-Day Attendance Matrix -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Riwayat Presensi 5 Hari Terakhir</h4>
            <div class="grid grid-cols-5 gap-2 text-center text-xs">
              <div
                v-for="hist in attendanceHistoryMock"
                :key="hist.day"
                class="p-2.5 rounded-xl border transition-all"
                :class="hist.status === 'Hadir' ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' :
                  hist.status === 'Terlambat' ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' :
                  hist.status === 'Izin' ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]' :
                  'bg-[#FFF1F2] border-[#FECDD3] text-[#881337]'"
              >
                <span class="text-[10.5px] font-bold block text-[#64748B] mb-0.5">{{ hist.day }}</span>
                <b class="text-[11px] font-bold block">{{ hist.status }}</b>
                <span class="text-[10px] font-mono opacity-80">{{ hist.time }}</span>
              </div>
            </div>
          </div>

          <!-- Manual Status Adjustment by Super Admin -->
          <div class="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-[#334155] uppercase tracking-wider">Penyesuaian Manual Status</h4>
              <span class="text-[10.5px] text-[#64748B]">Super Administrator</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="st in (['Hadir', 'Izin', 'Sakit', 'Alpa'] as const)"
                :key="st"
                type="button"
                class="py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                :class="localTeacher.status === st
                  ? 'bg-[#1B5FD9] text-white border-[#1B5FD9] shadow-xs'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:border-[#1B5FD9]'"
                @click="updateStatus(st)"
              >
                {{ st }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 p-4.5 border-t border-[#F2F4F7] bg-white">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#475467] hover:bg-[#F2F4F7] transition cursor-pointer"
            @click="emit('close')"
          >
            Tutup
          </button>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1B5FD9] hover:bg-[#154db0] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            @click="handleSave"
          >
            <AdminV2Icon name="check" :size="16" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
