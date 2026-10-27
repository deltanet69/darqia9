<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { CbtTabId, GradeType } from './cbtV2Data'

interface Props {
  activeTab: CbtTabId
  grade: GradeType
  menuOpen: boolean
  moduleName?: string
}

const props = withDefaults(defineProps<Props>(), {
  moduleName: 'Manajemen CBT'
})

const emit = defineEmits<{
  (e: 'update:activeTab', tab: CbtTabId): void
  (e: 'toggle-menu'): void
  (e: 'close-menu'): void
  (e: 'toast', msg: string): void
}>()

const navButtons: Array<{ id: CbtTabId; label: string; icon: string }> = [
  { id: 'summary', label: 'Beranda', icon: 'grid' },
  { id: 'exams', label: 'Jadwal', icon: 'cal' },
  { id: 'monitoring', label: 'Monitor', icon: 'screen' },
  { id: 'results', label: 'Nilai', icon: 'users' }
]

const menuModules = computed<Array<{ id: CbtTabId; label: string }>>(() => [
  { id: 'summary', label: `${props.moduleName} · Ringkasan` },
  { id: 'bank', label: props.moduleName.includes('LMS') ? 'Bank Soal LMS (ujian harian)' : 'Bank Soal CBT (PTS/PAS)' },
  { id: 'monitoring', label: `${props.moduleName} · Monitoring Ujian` },
  { id: 'exams', label: `${props.moduleName} · Daftar Ujian` },
  { id: 'results', label: `${props.moduleName} · Nilai Siswa` },
  { id: 'management', label: `${props.moduleName} · Manajemen Ujian` }
])
</script>

<template>
  <div>
    <!-- Mobile Bottom Navigation (Visible on lg:hidden) -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E7EBF2] px-2 py-1.5 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Navigasi mobile"
    >
      <button
        type="button"
        class="flex-1 min-w-0 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold p-1 rounded-xl transition touch-manipulation"
        :class="activeTab === 'summary' ? (grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
        @click="emit('update:activeTab', 'summary')"
      >
        <AdminV2Icon name="grid" :size="20" />
        <span>Beranda</span>
      </button>

      <button
        type="button"
        class="flex-1 min-w-0 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold p-1 rounded-xl transition touch-manipulation"
        :class="activeTab === 'exams' ? (grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
        @click="emit('update:activeTab', 'exams')"
      >
        <AdminV2Icon name="cal" :size="20" />
        <span>Jadwal</span>
      </button>

      <button
        type="button"
        class="flex-1 min-w-0 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold p-1 rounded-xl text-[#667085] hover:text-[#101828] active:bg-[#EFF2F7] transition touch-manipulation"
        @click="emit('toggle-menu')"
      >
        <AdminV2Icon name="menu" :size="20" />
        <span>Menu</span>
      </button>

      <button
        type="button"
        class="flex-1 min-w-0 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold p-1 rounded-xl transition touch-manipulation"
        :class="activeTab === 'monitoring' ? (grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
        @click="emit('update:activeTab', 'monitoring')"
      >
        <AdminV2Icon name="screen" :size="20" />
        <span>Monitor</span>
      </button>

      <button
        type="button"
        class="flex-1 min-w-0 min-h-[52px] flex flex-col items-center justify-center gap-1 text-[10px] font-bold p-1 rounded-xl transition touch-manipulation"
        :class="activeTab === 'results' ? (grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
        @click="emit('update:activeTab', 'results')"
      >
        <AdminV2Icon name="users" :size="20" />
        <span>Nilai</span>
      </button>
    </nav>

    <!-- Fullscreen Mobile Drawer Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="menuOpen"
        class="lg:hidden fixed inset-x-0 top-[64px] bottom-[56px] z-30 bg-[#F3F5F9] overflow-y-auto p-4 space-y-4"
      >
        <div>
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#667085] mb-2.5">
            Modul Darqia CBT
          </h3>
          <div class="space-y-2">
            <button
              v-for="mod in menuModules"
              :key="mod.id"
              type="button"
              class="w-full text-left p-3.5 rounded-xl border border-[#E7EBF2] bg-white font-bold text-xs text-[#344054] hover:border-blue-500 hover:bg-[#F9FAFC] transition shadow-sm flex items-center justify-between"
              :class="activeTab === mod.id ? 'border-blue-500 font-extrabold text-[#101828]' : ''"
              @click="{ emit('update:activeTab', mod.id); emit('close-menu') }"
            >
              <span>{{ mod.label }}</span>
              <AdminV2Icon name="arrow" :size="14" class="text-[#98A2B3]" />
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#667085] mb-2.5">
            Navigasi Lain
          </h3>
          <NuxtLink
            to="/adminV2"
            class="block w-full text-left p-3.5 rounded-xl border border-[#E7EBF2] bg-white font-bold text-xs text-[#344054] hover:bg-[#F9FAFC] transition shadow-sm mb-2"
          >
            ← Kembali ke Dashboard Portal V2
          </NuxtLink>
          <button
            type="button"
            class="w-full text-left p-3.5 rounded-xl border border-[#E7EBF2] bg-white font-bold text-xs text-[#667085] hover:bg-[#F9FAFC] transition shadow-sm"
            @click="emit('toast', 'Modul lain di luar cakupan preview CBT')"
          >
            Akademik, Kepegawaian, Keuangan, Sistem
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
