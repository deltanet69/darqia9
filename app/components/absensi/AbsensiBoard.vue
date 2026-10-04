<template>
  <div>
    <!-- MOBILE CLASS TABS STICKY SWITCHER -->
    <div class="classtabs">
      <button
        v-for="c in classes"
        :key="c"
        class="ctab"
        :class="{ on: activeTab === c }"
        type="button"
        @click="$emit('update:activeTab', c)"
      >
        <b>{{ c }}</b>
        <span>{{ getHadirCount(c) }}/{{ (db[c] || []).length }}</span>
      </button>
    </div>

    <!-- MAIN BOARD -->
    <main
      class="board"
      :class="{ compact: classes.length === 4 }"
      :style="{ '--n': classes.length }"
    >
      <div
        v-for="(c, ci) in classes"
        :key="c"
        class="card"
        :class="{ show: activeTab === c }"
        :style="{ animationDelay: `${ci * 80}ms` }"
      >
        <!-- CARD HEADER -->
        <div class="card-h">
          <div class="row1">
            <div class="cls">{{ c }} <small>· KELAS {{ levelNum }}</small></div>
          </div>
          <div class="row2">
            <div class="pbar">
              <i :style="{ width: `${getPct(c)}%` }"></i>
            </div>
            <div class="pcount">
              <b>{{ getHadirCount(c) }}</b>/{{ (db[c] || []).length }} hadir
            </div>
          </div>
        </div>

        <!-- COLS HEADER (DESKTOP) -->
        <div class="cols">
          <span class="c-no">NO</span>
          <span>NAMA SISWA</span>
          <span>MASUK</span>
          <span>KELUAR</span>
          <span style="text-align:right">KETERANGAN</span>
        </div>

        <!-- STUDENT ROWS LIST -->
        <div class="list">
          <div
            v-for="(s, idx) in db[c] || []"
            :key="s.id"
            class="srow"
            :class="[
              `st-${s.status}`,
              {
                'is-wait': s.status === 'menunggu',
                'flash': s.flash === 'green',
                'flash-red': s.flash === 'red'
              }
            ]"
            @click="$emit('select', s)"
          >
            <span class="no">{{ idx + 1 }}</span>
            <span class="nm" :title="s.name">{{ s.name }}</span>
            <span class="tm tm-in" :class="{ dim: !s.masuk }">
              <i>MASUK</i><b>{{ s.masuk || '—' }}</b>
            </span>
            <span class="tm tm-out" :class="{ dim: !s.keluar }">
              <i>KELUAR</i><b>{{ s.keluar || '—' }}</b>
            </span>
            <span class="pill" :class="[getPillClass(s.status), { glow: s.pillGlow }]">
              <i></i>{{ getStatusLabel(s.status) }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { AbsensiStudent } from '~/composables/useAbsensiTv'

const props = defineProps<{
  levelNum: string
  classes: string[]
  activeTab: string
  db: Record<string, AbsensiStudent[]>
}>()

defineEmits<{
  (e: 'update:activeTab', tab: string): void
  (e: 'select', s: AbsensiStudent): void
}>()

const getHadirCount = (c: string) => {
  const list = props.db[c] || []
  return list.filter(s => s.status === 'tepat' || s.status === 'terlambat').length
}

const getPct = (c: string) => {
  const list = props.db[c] || []
  if (list.length === 0) return 0
  const hadir = getHadirCount(c)
  return Math.round((hadir / list.length) * 100)
}

const getPillClass = (status: AbsensiStudent['status']) => {
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
</script>

<style scoped>
.board {
  flex: 1;
  display: grid;
  gap: 22px;
  margin: 16px 0 12px;
  min-height: 0;
  grid-template-columns: repeat(var(--n, 3), 1fr);
}
.card {
  background: #0B152C;
  border: 1px solid #1D2C4E;
  border-radius: 20px;
  content-visibility: auto;
  contain-intrinsic-size: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16px 44px rgba(0, 0, 0, .4);
  animation: cardIn .5s cubic-bezier(.22, 1, .36, 1) backwards;
  min-height: 0;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(22px); }
}
.card-h {
  padding: 16px 24px 14px;
  border-bottom: 1px solid #1D2C4E;
  background: rgba(0, 0, 0, .22);
}
.row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cls {
  font-size: 36px;
  font-weight: 900;
}
.cls small {
  font-size: 13px;
  font-weight: 700;
  color: #93A4C4;
  letter-spacing: .2em;
}
.row2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.pbar {
  flex: 1;
  height: 10px;
  border-radius: 99px;
  background: #16233f;
  overflow: hidden;
}
.pbar i {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #2E9BFF, #34D399);
  transition: width .8s cubic-bezier(.22, 1, .36, 1);
}
.pcount {
  font-size: 13px;
  font-weight: 700;
  color: #93A4C4;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pcount b {
  color: #F4F7FD;
  font-size: 16px;
}
.cols {
  display: grid;
  grid-template-columns: 34px 1fr 72px 72px 126px;
  gap: 10px;
  padding: 14px 24px 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  color: #93A4C4;
}
.cols span:nth-child(3),
.cols span:nth-child(4) {
  text-align: center;
}
.list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 2px 16px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #2a3f6e transparent;
}
.list::-webkit-scrollbar {
  width: 6px;
}
.list::-webkit-scrollbar-thumb {
  background: #2a3f6e;
  border-radius: 3px;
}
.list::-webkit-scrollbar-track {
  background: transparent;
}
.srow {
  position: relative;
  flex: 1 0 auto;
  min-height: 44px;
  display: grid;
  grid-template-columns: 34px 1fr 72px 72px 126px;
  gap: 10px;
  align-items: center;
  background: rgba(148, 184, 255, .05);
  border: 1px solid rgba(148, 184, 255, .11);
  border-radius: 13px;
  padding: 7px 18px 7px 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform .18s, box-shadow .18s, border-color .18s, background .18s;
}
.srow::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: #2b3a5e;
}
.srow.st-alpa {
  background: rgba(248, 113, 113, .15);
  border-color: rgba(248, 113, 113, .45);
}
.srow.st-alpa::before {
  background: #F87171;
  box-shadow: 0 0 10px rgba(248, 113, 113, .7);
}
.srow.st-alpa .nm {
  color: #fecaca;
}
.srow.st-alpa:hover {
  background: rgba(248, 113, 113, .22);
  border-color: rgba(248, 113, 113, .65);
}
.srow:hover {
  transform: translateY(-2px);
  border-color: rgba(46, 155, 255, .5);
  background: rgba(46, 155, 255, .09);
  box-shadow: 0 10px 24px rgba(0, 0, 0, .4);
}
.srow .no {
  font-size: 12px;
  color: #5b6b8c;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.srow .nm {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: .01em;
}
.srow.is-wait .nm {
  color: #a9b8d8;
  font-weight: 600;
}
.srow .tm {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: #dbe4f7;
}
.srow .tm.dim {
  color: #4c5f86;
  font-weight: 600;
}
.srow .tm i {
  display: none;
  font-style: normal;
}
.pill {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 999px;
  letter-spacing: .03em;
  white-space: nowrap;
  transition: background-color .6s ease, color .6s ease, border-color .6s ease, box-shadow .6s ease;
}
.pill i {
  width: 7px;
  height: 7px;
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
.pill.wait {
  background: transparent;
  border: 1px solid #3b4c74;
  color: #8ea0bc;
}
.pill.wait i {
  background: #5b6b8c;
  box-shadow: none;
}
.srow.flash {
  animation: flash 1.8s ease;
}
@keyframes flash {
  0% { background: rgba(52, 211, 153, .3); box-shadow: 0 0 0 2px rgba(52, 211, 153, .5); }
  100% {}
}
.srow.flash-red {
  animation: flashRed 1.8s ease;
}
@keyframes flashRed {
  0% { background: rgba(248, 113, 113, .35); box-shadow: 0 0 0 2px rgba(248, 113, 113, .5); }
  100% {}
}
.pill.glow {
  animation: pillGlow 1.5s ease;
}
@keyframes pillGlow {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  35% { box-shadow: 0 0 16px 3px currentColor; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

/* 4 KELAS COMPACT DESKTOP */
@media(min-width:901px){
  .board.compact { gap: 14px; }
  .board.compact .cols { grid-template-columns: 1fr 62px 62px 108px; padding: 14px 16px 10px; }
  .board.compact .cols .c-no { display: none; }
  .board.compact .list { padding: 2px 10px 14px; gap: 8px; }
  .board.compact .card-h { padding: 14px 16px 12px; }
  .board.compact .srow { grid-template-columns: 1fr 62px 62px 108px; padding: 7px 12px 7px 10px; }
  .board.compact .srow .no { display: none; }
  .board.compact .srow .nm { font-size: 14px; }
  .board.compact .cls { font-size: 30px; }
}

/* MOBILE SWITCHER & LIST (<=900px) */
.classtabs { display: none; }
@media(max-width:900px){
  .board { grid-template-columns: 1fr; gap: 14px; }
  .cols { display: none; }
  .card { border-radius: 16px; display: none; }
  .card.show { display: flex; }
  .card-h { padding: 14px 16px 12px; }
  .cls { font-size: 28px; }
  .list { gap: 8px; padding: 2px 12px 14px; }
  .srow { grid-template-columns: 1fr auto; row-gap: 8px; padding: 11px 14px; min-height: 0; }
  .srow .no { display: none; }
  .srow .nm { grid-column: 1; grid-row: 1; font-size: 14.5px; }
  .srow .pill { grid-column: 2; grid-row: 1; }
  .srow .tm { grid-row: 2; text-align: left; }
  .srow .tm-in { grid-column: 1; }
  .srow .tm-out { grid-column: 2; text-align: right; }
  .srow .tm i { display: inline; font-size: 9px; font-weight: 800; letter-spacing: .12em; color: #93A4C4; margin-right: 6px; }
  .srow .tm b { font-size: 13px; }

  .classtabs {
    display: flex;
    gap: 8px;
    position: sticky;
    top: 0;
    z-index: 30;
    background: rgba(4, 8, 20, .96);
    padding: 10px 2px;
  }
  .ctab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 6px;
    border-radius: 14px;
    border: 1px solid #1D2C4E;
    background: rgba(148, 184, 255, .05);
    color: #93A4C4;
    cursor: pointer;
  }
  .ctab b {
    font-size: 15px;
    color: #F4F7FD;
    letter-spacing: .06em;
  }
  .ctab span {
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
  }
  .ctab.on {
    background: linear-gradient(135deg, #1d5fd6, #2b8cff);
    border-color: transparent;
  }
  .ctab.on b,
  .ctab.on span {
    color: #fff;
  }
}
</style>
