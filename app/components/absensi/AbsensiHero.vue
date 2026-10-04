<template>
  <section class="hero">
    <div>
      <div class="eyebrow">
        <span class="livedot"></span>ABSENSI SISWA &nbsp;·&nbsp; GEDUNG B · LANTAI 2
      </div>
      <h1>Kelas <span>{{ levelNum }}</span></h1>
      <div class="floorsub">
        {{ classes.length }} KELAS · {{ classes.join(' / ') }}
      </div>
    </div>

    <div class="hero-stats">
      <div class="ringwrap">
        <svg width="92" height="92" viewBox="0 0 92 92">
          <defs>
            <linearGradient id="gr" x1="0" y1="0" x2="92" y2="92">
              <stop stop-color="#2E9BFF" />
              <stop offset="1" stop-color="#34D399" />
            </linearGradient>
          </defs>
          <circle cx="46" cy="46" r="39" fill="none" stroke="#1a2745" stroke-width="9" />
          <circle
            class="ring-fg"
            cx="46"
            cy="46"
            r="39"
            fill="none"
            stroke-width="9"
            stroke-dasharray="245"
            :stroke-dashoffset="245 * (1 - (stats.pct || 0) / 100)"
          />
        </svg>
        <div class="ring-t">
          <b>{{ stats.pct }}%</b>
          <small>HADIR</small>
        </div>
      </div>

      <div class="stat">
        <div class="stat-n ok">{{ stats.tepat }}</div>
        <div class="stat-l">Tepat waktu</div>
      </div>
      <div class="stat">
        <div class="stat-n late">{{ stats.terlambat }}</div>
        <div class="stat-l">Terlambat</div>
      </div>
      <div class="stat">
        <div class="stat-n absent">{{ stats.alpa }}</div>
        <div class="stat-l">Alpa</div>
      </div>
      <div class="stat">
        <div class="stat-n">{{ stats.total }}</div>
        <div class="stat-l">Total siswa</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  levelNum: string
  classes: string[]
  stats: {
    total: number
    tepat: number
    terlambat: number
    alpa: number
    hadir: number
    pct: number
  }
}>()
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #0B152C;
  border: 1px solid #1D2C4E;
  border-radius: 18px;
  padding: 12px 26px;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .22em;
  color: #2E9BFF;
}
.livedot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #34D399;
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(52,211,153,.55); }
  70% { box-shadow: 0 0 0 9px rgba(52,211,153,0); }
  100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
}
.hero h1 {
  font-size: 42px;
  font-weight: 900;
  margin: 2px 0;
}
.hero h1 span {
  color: #2E9BFF;
}
.floorsub {
  font-size: 12.5px;
  color: #93A4C4;
  font-weight: 600;
  letter-spacing: .06em;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 28px;
}
.ringwrap {
  position: relative;
  width: 92px;
  height: 92px;
  flex: none;
}
.ringwrap svg {
  transform: rotate(-90deg);
}
.ring-fg {
  stroke: url(#gr);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s cubic-bezier(.22,1,.36,1);
}
.ring-t {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-t b {
  font-size: 21px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.ring-t small {
  font-size: 8.5px;
  color: #93A4C4;
  font-weight: 800;
  letter-spacing: .16em;
}
.stat {
  text-align: center;
  min-width: 88px;
  position: relative;
  padding-left: 28px;
}
.stat:first-of-type {
  padding-left: 0;
}
.stat + .stat::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background: #1D2C4E;
}
.stat-n {
  font-size: 33px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.stat-l {
  font-size: 10.5px;
  color: #93A4C4;
  font-weight: 700;
  letter-spacing: .08em;
  margin-top: 6px;
  text-transform: uppercase;
}
.ok { color: #34D399; }
.late { color: #FB923C; }
.absent { color: #F87171; }

@media(max-width:900px){
  .hero { flex-direction: column; align-items: stretch; gap: 14px; padding: 14px 16px; }
  .hero h1 { font-size: 32px; }
  .hero-stats { display: grid; grid-template-columns: auto repeat(4,minmax(0,1fr)); gap: 6px; align-items: center; }
  .ringwrap, .ringwrap svg { width: 68px; height: 68px; }
  .ring-t b { font-size: 16px; }
  .ring-t small { font-size: 8px; }
  .stat { min-width: 0; padding-left: 8px; }
  .stat + .stat::before { display: none; }
  .stat-n { font-size: 21px; }
  .stat-l { font-size: 8px; }
}
@media(max-width:380px){
  .hero-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .ringwrap { display: none; }
  .stat { padding-left: 0; }
}
@media (max-width:1200px){
  .hero { flex-direction: column; align-items: flex-start; }
}
</style>
