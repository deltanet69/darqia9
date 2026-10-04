<template>
  <div class="toast" :class="{ on: data.show }">
    <span class="tk-ok" :class="{ no: data.isAlpa }">
      {{ data.isAlpa ? '✕' : '✓' }}
    </span>
    <b>{{ data.name }}</b>
    <span v-if="data.className" class="tc">{{ data.className }}</span>
    <span class="tt">{{ data.time }}</span>
    <span class="pill sm" :class="getPillClass(data.status)">
      <i></i>{{ getLabel(data.status) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { AbsensiToastData } from '~/composables/useAbsensiTv'

defineProps<{
  data: AbsensiToastData
}>()

const getPillClass = (status: AbsensiToastData['status']) => {
  switch (status) {
    case 'tepat': return 'ok'
    case 'terlambat': return 'late'
    case 'alpa': return 'absent'
    default: return 'wait'
  }
}

const getLabel = (status: AbsensiToastData['status']) => {
  switch (status) {
    case 'tepat': return 'Tepat waktu'
    case 'terlambat': return 'Terlambat'
    case 'alpa': return 'Alpa'
    default: return 'Menunggu'
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translate(-50%, -90px);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(8, 15, 32, .97);
  border: 1px solid #2a3f6e;
  border-radius: 999px;
  padding: 12px 24px;
  box-shadow: 0 16px 44px rgba(0, 0, 0, .55);
  font-size: 15px;
  color: #F4F7FD;
  opacity: 0;
  transition: transform .35s cubic-bezier(.22, 1, .36, 1), opacity .3s;
  pointer-events: none;
  white-space: nowrap;
  max-width: 94vw;
}
.toast.on {
  transform: translate(-50%, 0);
  opacity: 1;
}
.toast .tk-ok {
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 50%;
  background: rgba(52, 211, 153, .15);
  color: #34D399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
}
.toast .tk-ok.no {
  background: rgba(248, 113, 113, .15);
  color: #F87171;
}
.toast b {
  font-weight: 800;
}
.toast .tt {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}
.toast .tc {
  color: #93A4C4;
  font-weight: 700;
  font-size: 13px;
  background: rgba(46, 155, 255, .14);
  padding: 4px 12px;
  border-radius: 999px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: .03em;
  white-space: nowrap;
}
.pill i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: none;
}
.pill.ok {
  background: rgba(52, 211, 153, .13);
  color: #6ee7b7;
}
.pill.ok i {
  background: #34D399;
  box-shadow: 0 0 8px #34D399;
}
.pill.late {
  background: rgba(251, 146, 60, .15);
  color: #fdba74;
}
.pill.late i {
  background: #FB923C;
  box-shadow: 0 0 8px #FB923C;
}
.pill.absent {
  background: rgba(248, 113, 113, .13);
  color: #fca5a5;
}
.pill.absent i {
  background: #F87171;
  box-shadow: 0 0 8px #F87171;
}
.pill.sm {
  font-size: 10px;
  padding: 4px 10px;
}

@media(max-width:900px){
  .toast { font-size: 13px; padding: 10px 18px; top: 12px; }
  .toast b { max-width: 34vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
