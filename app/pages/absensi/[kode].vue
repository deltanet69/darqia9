<template>
  <div class="h-screen max-h-screen overflow-hidden bg-[#040814] text-[#F4F7FD] font-sans antialiased p-3 sm:p-4 lg:p-4 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
    <div class="max-w-[1920px] w-full mx-auto flex flex-col gap-2.5 sm:gap-3 flex-1 min-h-0 overflow-hidden">
      <!-- HEADER -->
      <AbsensiHeader
        :kode="absensi.currentKode.value"
        :hours="absensi.clockHours.value"
        :minutes="absensi.clockMinutes.value"
        :seconds="absensi.clockSeconds.value"
        :date-line="absensi.dateLine.value"
      />

      <!-- HERO STATS -->
      <AbsensiHero
        :level-num="absensi.levelNum.value"
        :classes="absensi.classes.value"
        :stats="absensi.stats.value"
      />

      <!-- BOARD LIST KELAS (DYNAMIC TV FIT - NO SCROLLBAR) -->
      <AbsensiBoard
        :level-num="absensi.levelNum.value"
        :classes="absensi.classes.value"
        :active-tab="absensi.activeTab.value"
        :db="absensi.db"
        @update:active-tab="absensi.activeTab.value = $event"
        @select="absensi.openDetail"
      />

      <!-- TICKER MARQUEE -->
      <AbsensiTicker
        :events="absensi.tickerEvents.value"
      />
    </div>

    <!-- TOAST NOTIFICATION -->
    <AbsensiToast
      :data="absensi.toastData"
    />

    <!-- DETAIL MODAL -->
    <AbsensiDetailModal
      :student="absensi.selectedStudent.value"
      @close="absensi.closeDetail"
    />

    <!-- DEMO CONTROLS -->
    <AbsensiDemoPanel
      :classes-count="absensi.classes.value.length"
      :sim-on="absensi.simOn.value"
      @change-count="absensi.setClassCount"
      @toggle-sim="absensi.toggleSim"
      @reset="absensi.resetAll"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AbsensiHeader from '~/components/absensi/AbsensiHeader.vue'
import AbsensiHero from '~/components/absensi/AbsensiHero.vue'
import AbsensiBoard from '~/components/absensi/AbsensiBoard.vue'
import AbsensiTicker from '~/components/absensi/AbsensiTicker.vue'
import AbsensiDetailModal from '~/components/absensi/AbsensiDetailModal.vue'
import AbsensiToast from '~/components/absensi/AbsensiToast.vue'
import AbsensiDemoPanel from '~/components/absensi/AbsensiDemoPanel.vue'
import { useAbsensiTv } from '~/composables/useAbsensiTv'

definePageMeta({
  layout: false
})

const route = useRoute()
const kodeParam = (route.params.kode as string) || '10abc'
const absensi = useAbsensiTv(kodeParam)

useHead({
  title: 'TV Absensi Siswa — SMK IT Attaqwa 9',
  meta: [
    { name: 'description', content: 'Layar monitoring absensi siswa realtime RFID SMK IT Attaqwa 9 Bekasi' },
    { name: 'theme-color', content: '#040814' }
  ]
})
</script>
