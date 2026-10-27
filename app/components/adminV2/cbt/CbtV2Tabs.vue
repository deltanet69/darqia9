<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import { CBT_TABS, type CbtTabId, type GradeType } from './cbtV2Data'

interface Props {
  activeTab: CbtTabId
  grade: GradeType
  liveExamCount: number
  bankLabel?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:activeTab', val: CbtTabId): void
}>()
</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-5">
    <div class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <nav
        class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1.5 rounded-2xl min-w-max"
        role="tablist"
        aria-label="Navigasi Manajemen CBT"
      >
        <button
          v-for="tab in CBT_TABS"
          :key="tab.id"
          type="button"
          role="tab"
          class="inline-flex items-center gap-2 text-[12.5px] px-3.5 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap"
          :class="activeTab === tab.id
            ? 'bg-white text-[#101828] font-bold shadow-[0_1px_4px_rgba(16,24,40,0.12)]'
            : 'text-[#667085] font-semibold hover:text-[#101828]'"
          :aria-selected="activeTab === tab.id"
          @click="emit('update:activeTab', tab.id)"
        >
          <AdminV2Icon
            :name="tab.icon"
            :size="15"
            :class="activeTab === tab.id ? (grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
          />
          <span>{{ tab.id === 'bank' ? (bankLabel || tab.label) : tab.label }}</span>

          <!-- Live Badge with pulsing dot -->
          <span
            v-if="tab.live && liveExamCount > 0"
            class="text-[10px] font-extrabold bg-[#FDECEA] text-[#B42318] rounded-full px-2 py-0.5 inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#F04438] animate-ping" />
            <span>{{ liveExamCount }} Live</span>
          </span>
        </button>
      </nav>
    </div>
  </div>
</template>

