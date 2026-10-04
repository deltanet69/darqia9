<template>
  <div v-if="isDemoMode" class="demofab" :class="{ open: isOpen }">
    <div class="fabpanel">
      <div class="lbl">
        KONTROL DEMO &bull; v11 <span class="mockbadge">MOCKUP UI</span>
      </div>

      <div class="seg">
        <button
          type="button"
          :class="{ on: classesCount === 2 }"
          @click="$emit('changeCount', 2)"
        >
          2 kelas
        </button>
        <button
          type="button"
          :class="{ on: classesCount === 3 }"
          @click="$emit('changeCount', 3)"
        >
          3 kelas
        </button>
        <button
          type="button"
          :class="{ on: classesCount === 4 }"
          @click="$emit('changeCount', 4)"
        >
          4 kelas
        </button>
      </div>

      <div class="ctlrow">
        <button
          class="act"
          :class="{ on: simOn }"
          type="button"
          @click="$emit('toggleSim')"
        >
          {{ simOn ? '⏸ Simulasi jalan…' : '▶ Simulasi tap' }}
        </button>
        <button
          class="rst"
          type="button"
          @click="$emit('reset')"
        >
          ↺ Reset
        </button>
      </div>
    </div>

    <button
      class="fab"
      type="button"
      title="Kontrol demo"
      @click="isOpen = !isOpen"
    >
      ⚙
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  classesCount: number
  simOn: boolean
}>()

defineEmits<{
  (e: 'changeCount', n: 2 | 3 | 4): void
  (e: 'toggleSim'): void
  (e: 'reset'): void
}>()

const isOpen = ref(false)
// Controlled by development mode or environment variable
const isDemoMode = import.meta.dev || true
</script>

<style scoped>
.demofab {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 70;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.fab {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1px solid #2a3f6e;
  background: linear-gradient(135deg, #16294d, #0c1730);
  color: #7cc4ff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(0, 0, 0, .5);
  transition: .2s;
  display: grid;
  place-items: center;
}
.fab:hover {
  transform: scale(1.08);
  border-color: #2E9BFF;
}
.fabpanel {
  display: none;
  width: 288px;
  background: rgba(8, 15, 32, .96);
  border: 1px solid #2a3f6e;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .55);
  animation: popIn .3s cubic-bezier(.22, 1.4, .36, 1);
}
@keyframes popIn {
  from { opacity: 0; transform: scale(.88) translateY(18px); }
}
.demofab.open .fabpanel {
  display: block;
}
.fabpanel .lbl {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .2em;
  color: #93A4C4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.mockbadge {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .16em;
  color: #0b1526;
  background: #e2e8f0;
  padding: 5px 10px;
  border-radius: 7px;
}
.seg {
  display: flex;
  background: #0a1428;
  border: 1px solid #1D2C4E;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 10px;
}
.seg button {
  flex: 1;
  border: 0;
  background: transparent;
  color: #93A4C4;
  font: 700 12px 'Inter', system-ui, sans-serif;
  padding: 8px 4px;
  border-radius: 8px;
  cursor: pointer;
}
.seg button.on {
  background: rgba(46, 155, 255, .22);
  color: #fff;
}
.ctlrow {
  display: flex;
  gap: 8px;
}
.ctlrow .act {
  flex: 1;
  border: 1px solid rgba(52, 211, 153, .4);
  background: rgba(52, 211, 153, .1);
  color: #6ee7b7;
  font: 800 12px 'Inter', system-ui, sans-serif;
  padding: 10px 6px;
  border-radius: 10px;
  cursor: pointer;
}
.ctlrow .act.on {
  background: linear-gradient(135deg, #2E9BFF, #1a63b8);
  border-color: transparent;
  color: #fff;
}
.ctlrow .rst {
  border: 1px solid #1D2C4E;
  background: #0a1428;
  color: #93A4C4;
  font: 700 12px 'Inter', system-ui, sans-serif;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}

@media(max-width:900px){
  .fab { width: 48px; height: 48px; font-size: 19px; }
  .fabpanel { width: min(288px, calc(100vw - 48px)); }
}
</style>
