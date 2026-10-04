<template>
  <Teleport to="body">
    <div
      v-if="student"
      class="overlay"
      :class="{ on: !!student }"
      @click.self="$emit('close')"
    >
      <div class="pop dpop" role="dialog" aria-modal="true">
        <button class="x" type="button" aria-label="Tutup" @click="$emit('close')">✕</button>

        <div class="dhead">
          <div class="avatar">{{ initials(student.name) }}</div>
          <div>
            <div class="pname">{{ student.name }}</div>
            <div class="pnis">NIS {{ student.nis }} &bull; Kelas {{ student.className }}</div>
          </div>
        </div>

        <div class="dline">
          <span>Jam masuk</span>
          <span>{{ student.masuk || '—' }}</span>
        </div>
        <div class="dline">
          <span>Jam keluar</span>
          <span>{{ student.keluar || '—' }}</span>
        </div>
        <div class="dline">
          <span>Keterangan</span>
          <span :class="getStatusClass(student.status)">
            {{ getStatusLabel(student.status).toUpperCase() }}
          </span>
        </div>
        <div class="dline">
          <span>Tepat waktu s/d</span>
          <span>{{ config.TEPAT_STR }}</span>
        </div>
        <div class="dline">
          <span>Toleransi terlambat s/d</span>
          <span>{{ config.TOL_STR }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { type AbsensiStudent, ABSENSI_CONFIG } from '~/composables/useAbsensiTv'

const props = defineProps<{
  student: AbsensiStudent | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const config = ABSENSI_CONFIG

const initials = (name: string) => {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const getStatusClass = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'ok'
    case 'terlambat': return 'late'
    case 'alpa': return 'absent'
    default: return 'wait'
  }
}

const getStatusLabel = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'Tepat waktu'
    case 'terlambat': return 'Terlambat'
    case 'alpa': return 'Alpa'
    default: return 'Menunggu'
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.student) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(3, 6, 14, .72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn .25s;
}
@keyframes fadeIn {
  from { opacity: 0; }
}
.pop {
  background: linear-gradient(180deg, #0e1a36, #0a1428);
  border: 1px solid #2a3f6e;
  border-radius: 24px;
  padding: 32px 44px;
  max-width: 440px;
  width: 92%;
  box-shadow: 0 30px 90px rgba(0, 0, 0, .6);
  animation: popIn .38s cubic-bezier(.22, 1.4, .36, 1);
  position: relative;
  text-align: left;
  color: #F4F7FD;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(.88) translateY(18px); }
}
.pop .x {
  position: absolute;
  top: 14px;
  right: 16px;
  border: 0;
  background: none;
  color: #93A4C4;
  font-size: 20px;
  cursor: pointer;
}
.dhead {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #2E9BFF, #1a63b8);
  box-shadow: 0 8px 26px rgba(46, 155, 255, .45);
  color: #fff;
  flex-shrink: 0;
}
.pname {
  font-size: 22px;
  font-weight: 800;
  color: #F4F7FD;
}
.pnis {
  font-size: 13px;
  color: #93A4C4;
  font-weight: 600;
  margin-top: 4px;
}
.dline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 4px;
  border-top: 1px solid #1D2C4E;
  font-size: 14px;
}
.dline span:first-child {
  color: #93A4C4;
  font-weight: 600;
}
.dline span:last-child {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ok { color: #34D399; }
.late { color: #FB923C; }
.absent { color: #F87171; }
.wait { color: #8ea0bc; }
</style>
