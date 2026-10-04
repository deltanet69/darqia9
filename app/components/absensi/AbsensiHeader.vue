<template>
  <header class="top">
    <div class="brand">
      <svg class="shield" viewBox="0 0 48 56" fill="none">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="48" y2="56">
            <stop stop-color="#7cc4ff" />
            <stop offset="1" stop-color="#1E73BE" />
          </linearGradient>
        </defs>
        <path
          d="M24 2 44 9v16c0 13.5-8.5 22.5-20 29C12.5 47.5 4 38.5 4 25V9L24 2z"
          stroke="url(#sg)"
          stroke-width="3"
          fill="rgba(46,155,255,.08)"
        />
        <text x="24" y="37" text-anchor="middle" font-family="Inter" font-weight="900" font-size="23" fill="#7cc4ff">
          9
        </text>
      </svg>
      <div>
        <div class="brand-name">SMK IT <em>ATTAQWA 9</em></div>
        <div class="brand-sub">Unggul dalam IMTAQ, Terdepan dalam IPTEK</div>
      </div>
    </div>

    <div class="urlchip">
      absen.smkitattaqwa9.sch.id/<b>{{ kode }}</b>
    </div>

    <div class="clockbox">
      <div class="date">{{ dateLine }}</div>
      <div class="clock">
        {{ hours }}<span class="c">:</span>{{ minutes }}<span class="c">:</span>{{ seconds }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  kode: string
  hours: string
  minutes: string
  seconds: string
  dateLine: string
}>()
</script>

<style scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 13px;
}
.shield {
  width: 48px;
  height: 48px;
  flex: none;
  filter: drop-shadow(0 0 12px rgba(46,155,255,.4));
}
.brand-name {
  font-weight: 900;
  font-size: 21px;
  letter-spacing: .1em;
}
.brand-name em {
  font-style: normal;
  color: #2E9BFF;
}
.brand-sub {
  font-size: 12px;
  color: #93A4C4;
  font-weight: 500;
}
.urlchip {
  font-size: 12px;
  font-weight: 600;
  color: #7cc4ff;
  background: rgba(46,155,255,.1);
  border: 1px solid rgba(46,155,255,.25);
  padding: 9px 18px;
  border-radius: 999px;
}
.urlchip b {
  color: #fff;
}
.clockbox {
  text-align: right;
}
.date {
  font-size: 14px;
  color: #93A4C4;
  font-weight: 600;
}
.clock {
  font-size: 46px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
  letter-spacing: .03em;
}
.clock .c {
  color: #2E9BFF;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% { opacity: .2; }
}
@media(max-width:900px){
  .top { flex-wrap: wrap; gap: 8px; padding-bottom: 10px; }
  .shield { width: 38px; height: 38px; }
  .brand-name { font-size: 16px; }
  .brand-sub { font-size: 10.5px; }
  .urlchip { display: none; }
  .clock { font-size: 30px; }
  .date { font-size: 11.5px; }
}
</style>
