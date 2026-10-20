<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import type { ClassExamItem } from '../kelasV2Data'

interface Props {
  exams: ClassExamItem[]
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const activeSubCategory = ref<'UH' | 'UTS' | 'UAS'>('UH')
const timeFilter = ref<'harian' | 'mingguan' | 'bulanan'>('bulanan')

const filteredExams = computed(() => {
  return props.exams.filter(e => e.category === activeSubCategory.value)
})
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <!-- Header with Sub-menu Category and Period Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div>
        <h4 class="text-sm font-extrabold text-[#101828]">
          Jadwal Ujian &amp; Asesmen Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          Manajemen jadwal asesmen harian, tengah semester &amp; akhir semester terintegrasi CBT
        </p>
      </div>

      <!-- Time Filter: Harian, Mingguan, Bulanan -->
      <div class="inline-flex items-center bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl">
        <button
          type="button"
          class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
          :class="timeFilter === 'harian' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
          @click="timeFilter = 'harian'"
        >
          Harian
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
          :class="timeFilter === 'mingguan' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
          @click="timeFilter = 'mingguan'"
        >
          Mingguan
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
          :class="timeFilter === 'bulanan' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
          @click="timeFilter = 'bulanan'"
        >
          Bulanan
        </button>
      </div>
    </div>

    <!-- Category Sub-Menu (Sesuai kelasdetail.md: Ujian harian / UTS / Ujian akhir) -->
    <div class="flex items-center gap-2 border-b border-[#E7EBF2] pb-2">
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
        :class="activeSubCategory === 'UH'
          ? (jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]')
          : 'text-[#667085] hover:bg-[#EFF2F7]'"
        @click="activeSubCategory = 'UH'"
      >
        <AdminV2Icon name="doc" :size="14" />
        <span>Ujian Harian (UH)</span>
      </button>

      <button
        type="button"
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
        :class="activeSubCategory === 'UTS'
          ? (jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]')
          : 'text-[#667085] hover:bg-[#EFF2F7]'"
        @click="activeSubCategory = 'UTS'"
      >
        <AdminV2Icon name="cal" :size="14" />
        <span>Ujian Tengah Semester (UTS)</span>
      </button>

      <button
        type="button"
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
        :class="activeSubCategory === 'UAS'
          ? (jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]')
          : 'text-[#667085] hover:bg-[#EFF2F7]'"
        @click="activeSubCategory = 'UAS'"
      >
        <AdminV2Icon name="monitor" :size="14" />
        <span>Ujian Akhir Semester (UAS)</span>
      </button>
    </div>

    <!-- Exams Listing -->
    <div class="space-y-3">
      <div
        v-for="exam in filteredExams"
        :key="exam.id"
        class="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E7EBF2] hover:bg-white hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-3.5"
      >
        <div class="min-w-0 flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1B5FD9] flex items-center justify-center shrink-0 mt-0.5">
            <AdminV2Icon name="monitor" :size="18" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF2F7] text-[#344054]">
                {{ exam.code }}
              </span>
              <h5 class="font-extrabold text-sm text-[#101828] truncate">
                {{ exam.title }}
              </h5>
            </div>

            <div class="flex items-center gap-3 text-xs text-[#667085] mt-1 flex-wrap">
              <span class="font-bold text-[#344054]">Mapel: {{ exam.subject }}</span>
              <span>&bull;</span>
              <span class="font-mono">{{ exam.date }} &bull; {{ exam.time }}</span>
              <span>&bull;</span>
              <span>Ruang: {{ exam.room }}</span>
              <span>&bull;</span>
              <span>Pengawas: {{ exam.supervisor }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold"
            :class="{
              'bg-[#E8F0FE] text-[#12459B]': exam.status === 'Terjadwal',
              'bg-[#FEF6EE] text-[#B54708]': exam.status === 'Berlangsung',
              'bg-[#E7F6ED] text-[#166534]': exam.status === 'Selesai'
            }"
          >
            {{ exam.status }}
          </span>

          <NuxtLink
            to="/adminV2/cbt"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#344054] transition shadow-2xs"
          >
            Buka CBT →
          </NuxtLink>
        </div>
      </div>

      <div v-if="filteredExams.length === 0" class="py-8 text-center text-[#98A2B3] text-xs">
        Belum ada jadwal asesmen untuk kategori ini.
      </div>
    </div>
  </div>
</template>
