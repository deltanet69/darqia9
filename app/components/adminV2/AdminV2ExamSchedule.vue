<script setup lang="ts">
import { ref, computed } from 'vue'

type ExamTab = 'harian' | 'uts' | 'uas'

interface Props {
  jenjang: 'smp' | 'smk'
  exams: {
    harian: Array<[string, string, string, string, string, string]>
    uts: Array<[string, string, string, string, string, string]>
    uas: Array<[string, string, string, string, string, string]>
  }
}

const props = defineProps<Props>()

const activeTab = ref<ExamTab>('harian')

const currentExams = computed(() => {
  return props.exams[activeTab.value] || []
})
</script>

<template>
  <section class="h-full flex flex-col justify-between bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)]">
    <!-- Header -->
    <div>
      <div class="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 class="text-[15px] font-extrabold text-[#101828]">Jadwal Ujian</h3>
          <p class="text-[11.5px] text-[#667085] mt-0.5">Semester Ganjil &middot; TA 2026/2027</p>
        </div>
        <div class="flex bg-[#EFF2F7] rounded-full p-0.5 sm:p-1 gap-0.5">
          <button
            type="button"
            class="text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap"
            :class="activeTab === 'harian' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            @click="activeTab = 'harian'"
          >
            Harian
          </button>
          <button
            type="button"
            class="text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap"
            :class="activeTab === 'uts' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            @click="activeTab = 'uts'"
          >
            UTS
          </button>
          <button
            type="button"
            class="text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap"
            :class="activeTab === 'uas' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            @click="activeTab = 'uas'"
          >
            UAS
          </button>
        </div>
      </div>

      <!-- Exam List -->
      <div class="flex flex-col gap-2.5">
        <div
          v-for="([day, month, title, desc, status, statusClass], idx) in currentExams"
          :key="idx"
          class="border border-[#E7EBF2] rounded-[14px] p-3 flex gap-3 items-center hover:bg-[#FAFCFE] transition"
        >
          <span
            class="text-center rounded-[10px] py-1.5 px-2.5 shrink-0 min-w-[50px] transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED]' : 'bg-[#E8F0FE]'"
          >
            <b
              class="block text-sm font-extrabold leading-tight transition-colors"
              :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
            >
              {{ day }}
            </b>
            <span
              class="text-[9px] font-bold tracking-wider uppercase transition-colors"
              :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
            >
              {{ month }}
            </span>
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-[13px] font-bold text-[#101828] block truncate">{{ title }}</b>
            <div class="text-[11.5px] text-[#667085] truncate mt-0.5">{{ desc }}</div>
          </div>
          <span
            class="ml-auto text-[10.5px] font-bold py-1 px-2.5 rounded-full whitespace-nowrap shrink-0"
            :class="{
              'text-[#12B76A] bg-[#E7F8F0]': statusClass === 'on',
              'text-[#F79009] bg-[#FEF4E5]': statusClass === 'wait',
              'text-[#667085] bg-[#EFF2F7]': statusClass === 'off'
            }"
          >
            {{ status }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
