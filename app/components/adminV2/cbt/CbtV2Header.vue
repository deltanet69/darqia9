<script setup lang="ts">
import { computed } from 'vue'
import type { GradeType, CbtTabId } from './cbtV2Data'
import { CBT_TABS } from './cbtV2Data'

interface Props {
  grade: GradeType
  activeTab?: CbtTabId
  moduleName?: string
  moduleDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'summary',
  moduleName: 'Manajemen CBT',
  moduleDescription: 'Ujian digital'
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
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
        {{ moduleName }}
      </h1>

      <div class="flex items-center gap-2 flex-wrap">
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
