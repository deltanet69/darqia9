<script setup lang="ts">
import { computed } from 'vue'
import { useAdminCbtState } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import CbtSummary from '~/components/admin/cbt/CbtSummary.vue'
import CbtMonitoring from '~/components/admin/cbt/CbtMonitoring.vue'
import CbtBank from '~/components/admin/cbt/CbtBank.vue'
import CbtExams from '~/components/admin/cbt/CbtExams.vue'
import CbtResults from '~/components/admin/cbt/CbtResults.vue'
import CbtManagement from '~/components/admin/cbt/CbtManagement.vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-cbt'
})
useHead({ title: 'Manajemen CBT | Admin Portal' })

const { grade, activeTab, liveExams } = useAdminCbtState()

const gradeText = computed(() => {
  return grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

const tabs = computed(() => [
  { id: 'summary', label: 'Ringkasan', icon: 'grid' },
  { id: 'monitoring', label: 'Monitoring Ujian', icon: 'monitor', badge: liveExams.value.length ? `${liveExams.value.length} Live` : undefined },
  { id: 'bank', label: 'Bank Soal', icon: 'book' },
  { id: 'exams', label: 'Daftar Ujian', icon: 'cal' },
  { id: 'results', label: 'Nilai Siswa', icon: 'user' },
  { id: 'management', label: 'Manajemen Ujian', icon: 'gear' }
])

const handleQuickAction = () => {
  activeTab.value = 'bank'
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- PAGE HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
          <span>Manajemen CBT</span>
          <span
            class="text-xs font-bold text-white px-2.5 py-1 rounded-lg tracking-wider shadow-xs"
            :class="grade === 'SMP' ? 'bg-emerald-600' : 'bg-blue-600'"
          >
            {{ grade }}
          </span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Jadwal, monitoring &amp; hasil ujian digital &bull; {{ gradeText }} &bull; Tahun Ajaran 2026/2027
        </p>
      </div>
    </div>

    <!-- TABS PILLS NAVIGATION -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0"
        :class="activeTab === tab.id
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'"
        @click="activeTab = tab.id"
      >
        <AdminIcon :name="tab.icon" size="16" :class="activeTab === tab.id ? 'text-white' : 'text-slate-400'" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge"
          class="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
          :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600 border border-rose-200'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- TAB VIEW CONTAINER -->
    <main class="min-h-[400px]">
      <CbtSummary v-if="activeTab === 'summary'" />
      <CbtMonitoring v-if="activeTab === 'monitoring'" />
      <CbtBank v-if="activeTab === 'bank'" />
      <CbtExams v-if="activeTab === 'exams'" />
      <CbtResults v-if="activeTab === 'results'" />
      <CbtManagement v-if="activeTab === 'management'" />
    </main>
  </div>
</template>

