<template>
  <div class="absensi-tv-page">
    <div class="wrap">
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

      <!-- BOARD LIST KELAS -->
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

<style scoped>
.absensi-tv-page {
  --bg0: #040814;
  --bg1: #0A1730;
  --blue: #2E9BFF;
  --ok: #34D399;
  --late: #FB923C;
  --absent: #F87171;
  --wait: #64748B;
  --tx: #F4F7FD;
  --mut: #93A4C4;
  --card: #0B152C;
  --line: #1D2C4E;

  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--tx);
  background: radial-gradient(1100px 600px at 50% -10%, #122a5c 0%, transparent 60%),
              linear-gradient(180deg, var(--bg1), var(--bg0));
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.wrap {
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
  padding: 18px 34px 16px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media(max-width:900px){
  .wrap {
    padding: 14px 14px 12px;
  }
}
</style>
