<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import AdminV2Kosong from './AdminV2Kosong.vue'

type ExamTab = 'harian' | 'pts' | 'pas'

interface Props {
  jenjang: 'smp' | 'smk'
  exams: Record<ExamTab, Array<[string, string, string, string, string, string]>>
  judul?: string
  sub?: string
}

const props = withDefaults(defineProps<Props>(), { judul: 'Jadwal Ujian', sub: '' })
const SEMUA_TAB: Array<[ExamTab, string]> = [['harian', 'Harian'], ['pts', 'PTS'], ['pas', 'PAS']]
// Hanya jenis ujian yang benar-benar ada jadwalnya yang ditampilkan.
const TABS = computed(() => SEMUA_TAB.filter(([id]) => props.exams[id]?.length))

const activeTab = ref<ExamTab>('harian')
watchEffect(() => { const t = TABS.value; if (t.length && !t.some(([id]) => id === activeTab.value)) activeTab.value = t[0]![0] })

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
          <h3 class="text-[15px] font-extrabold text-[#101828]">{{ judul }}</h3>
          <p v-if="sub" class="text-[11.5px] text-[#667085] mt-0.5">{{ sub }}</p>
        </div>
        <div v-if="TABS.length > 1" class="flex bg-[#EFF2F7] rounded-full p-0.5 sm:p-1 gap-0.5">
          <button
            v-for="[id, label] in TABS"
            :key="id"
            type="button"
            class="text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap"
            :class="activeTab === id ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            :aria-pressed="activeTab === id"
            @click="activeTab = id"
          >
            {{ label }}
          </button>
        </div>
        <span v-else-if="TABS.length === 1" class="rounded-full bg-[#EFF2F7] px-2.5 py-1 text-[11px] font-bold text-[#344054] whitespace-nowrap">{{ TABS[0]![1] }}</span>
      </div>

      <!-- Exam List -->
      <AdminV2Kosong v-if="!currentExams.length" :jenjang="jenjang" judul="Belum ada ujian terjadwal" keterangan="Ujian PTS, PAS, dan harian yang dijadwalkan akan muncul di sini, diurutkan dari yang terdekat." />
      <div v-else class="flex flex-col gap-2.5">
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
