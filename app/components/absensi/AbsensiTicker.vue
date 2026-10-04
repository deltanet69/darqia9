<template>
  <footer class="ticker">
    <div class="ticker-tag">
      <span class="livedot"></span>LIVE
    </div>
    <div class="ticker-view">
      <div class="ticker-track">
        <template v-if="events.length > 0">
          <span
            v-for="(ev, idx) in duplicatedEvents"
            :key="idx"
            class="tk"
          >
            <b>{{ ev.time }}</b>
            <span class="ct">{{ ev.className }}</span>
            {{ ev.student.name }} tap masuk &bull;
            <b :class="ev.student.status === 'tepat' ? 'ok' : 'late'">
              {{ ev.student.status === 'tepat' ? 'Tepat waktu' : 'Terlambat' }}
            </b>
            <span style="color:#33456b;margin-left:14px">●</span>
          </span>
        </template>
        <template v-else>
          <span class="tk">Sistem siap &mdash; menunggu tap masuk siswa pertama…</span>
          <span class="tk">Sistem siap &mdash; menunggu tap masuk siswa pertama…</span>
        </template>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AbsensiStudent } from '~/composables/useAbsensiTv'

const props = defineProps<{
  events: { time: string; student: AbsensiStudent; className: string }[]
}>()

const duplicatedEvents = computed(() => {
  const top14 = props.events.slice(0, 14)
  return [...top14, ...top14]
})
</script>

<style scoped>
.ticker {
  display: flex;
  align-items: stretch;
  border: 1px solid #1D2C4E;
  border-radius: 14px;
  background: #081226;
  overflow: hidden;
}
.ticker-tag {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .2em;
  color: #052e1f;
  background: linear-gradient(135deg, #34D399, #10b981);
  padding: 0 22px;
}
.livedot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #052e1f;
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(5, 46, 31, .6); }
  70% { box-shadow: 0 0 0 8px rgba(5, 46, 31, 0); }
  100% { box-shadow: 0 0 0 0 rgba(5, 46, 31, 0); }
}
.ticker-view {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
}
.ticker-track {
  display: inline-block;
  animation: mq 48s linear infinite;
}
.ticker-view:hover .ticker-track {
  animation-play-state: paused;
}
@keyframes mq {
  to { transform: translateX(-50%); }
}
.tk {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 36px;
  font-size: 14px;
  color: #c4d2ec;
  font-weight: 500;
  padding: 11px 0;
}
.tk b {
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.tk b.ok {
  color: #34D399;
}
.tk b.late {
  color: #FB923C;
}
.tk .ct {
  font-size: 11px;
  font-weight: 800;
  background: rgba(46, 155, 255, .16);
  color: #7cc4ff;
  padding: 3px 10px;
  border-radius: 6px;
}

@media(max-width:900px){
  .ticker-tag { padding: 0 14px; font-size: 10px; }
  .tk { font-size: 12px; margin: 0 20px; }
}
</style>
