<script setup lang="ts">
import { computed } from 'vue'
import type { GradeType, CbtTabId } from './cbtV2Data'
import { CBT_TABS } from './cbtV2Data'

interface Props {
  grade: GradeType
  activeTab?: CbtTabId
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'summary'
})

const emit = defineEmits<{
  (e: 'navigate-tab', tab: CbtTabId): void
}>()

const schoolName = computed(() => {
  return props.grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam'
})

const activeTabLabel = computed(() => {
  return CBT_TABS.find(t => t.id === props.activeTab)?.label || 'Ringkasan'
})
</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
    <!-- Pagehead Flex -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-1">
      <div>
        <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
          Portal administrasi · V2
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
          Manajemen CBT
        </h1>
        <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
          Ujian digital · {{ schoolName }} · Tahun Ajaran 2026/2027
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[11px] font-medium text-[#667085] border border-dashed border-[#CDD5DF] bg-white rounded-full py-1.5 px-3">
          Preview UI · data contoh dari repo
        </span>
        <span
          class="text-[11px] font-extrabold rounded-full py-1.5 px-3.5"
          :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
        >
          {{ schoolName }}
        </span>
      </div>
    </div>
  </div>
</template>
