<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import type { Buku } from '~/composables/perpusCore'

// Panel samping pembaca: Isi (daftar isi PDF + loncat halaman), Tandai, Catatan, Rangkuman.
const props = defineProps<{ b: Buku, i: number, n: number, isi: Array<{ judul: string, i: number, tingkat: number }>, panel: string }>()
const emit = defineEmits<{ ke: [i: number], ganti: [p: string], tutup: [], hapus: [idx: number] }>()
const P = usePerpus()
const W = P.W
const tabs = [['isi', 'Isi'], ['tandai', 'Tandai'], ['catatan', 'Catatan'], ['rangkuman', 'Rangkuman']]
const mine = computed(() => W.value.tandai.map((x, idx) => ({ ...x, idx })).filter(x => x.id === props.b.id))
const daftar = computed(() => mine.value.filter(x => (props.panel === 'catatan' ? x.cat : !x.cat)))
const halFav = computed(() => W.value.hal.filter(x => x.id === props.b.id))
const loncat = ref('')
const pergi = () => {
  const h = parseInt(loncat.value, 10)
  if (h >= 1 && h <= props.n) emit('ke', h - 1)
  else P.toast(`Isi nomor halaman 1 sampai ${props.n}`)
}

const rk = computed({ get: () => W.value.rk[props.b.id] || '', set: (v: string) => { W.value.rk[props.b.id] = v; P.simpan() } })
const susun = () => {
  const m = mine.value.slice().sort((a, b) => a.i - b.i || (a.r[0]?.[1] ?? 0) - (b.r[0]?.[1] ?? 0))
  if (!m.length) { P.toast('Belum ada tandai atau catatan untuk disusun'); return }
  const draf = m.map(x => '• ' + x.teks + (x.cat ? '\n  Catatanku: ' + x.cat : '')).join('\n')
  const lama = rk.value.trim()
  rk.value = (lama ? lama + '\n\n' : 'Rangkuman ' + props.b.judul + '\n\n') + draf
  P.toast('Rangkuman disusun, silakan sunting')
}
const salin = () => {
  if (!rk.value.trim()) { P.toast('Rangkuman masih kosong'); return }
  try { navigator.clipboard.writeText(rk.value).then(() => P.toast('Rangkuman disalin'), () => P.toast('Gagal menyalin')) } catch { P.toast('Gagal menyalin') }
}
</script>

<template>
  <div class="panel" @click.self="emit('tutup')">
    <div>
      <header><b>{{ b.judul }}</b><button class="ibtn" aria-label="Tutup panel" @click="emit('tutup')"><PerpusIkon n="tutup" /></button></header>
      <div class="tabs" role="tablist"><button v-for="[k, nm] in tabs" :key="k" role="tab" :aria-selected="panel === k" :class="{ on: panel === k }" @click="emit('ganti', k!)">{{ nm }}</button></div>
      <div class="pb">
        <template v-if="panel === 'isi'">
          <div class="card item" style="grid-template-columns:1fr 96px;align-items:center">
            <input v-model="loncat" class="in" type="number" inputmode="numeric" :placeholder="`Ke halaman (1–${n})`" @keydown.enter="pergi">
            <button class="btn btn-p btn-s" @click="pergi">Buka</button>
          </div>
          <button v-for="(h, k) in isi" :key="k" class="card item" :style="{ gridTemplateColumns: '1fr', paddingLeft: 14 + h.tingkat * 14 + 'px', outline: h.i === i ? '2px solid var(--brand)' : '' }" @click="emit('ke', h.i)">
            <div><h3>{{ h.judul }}</h3><p class="num">Halaman {{ h.i + 1 }}{{ h.i === i ? ' · sedang dibaca' : '' }}</p></div>
          </button>
          <p v-if="!isi.length" class="muted" style="font-size:13.5px">Buku ini tidak punya daftar isi. Pakai kolom di atas untuk loncat ke halaman.</p>
        </template>
        <template v-else-if="panel === 'tandai' || panel === 'catatan'">
          <div v-for="x in daftar" :key="x.idx" class="card quote">
            <button style="text-align:left;display:grid;gap:6px" @click="emit('ke', x.i)"><q>{{ x.teks }}</q><div v-if="x.cat" class="cat">{{ x.cat }}</div><small>halaman {{ x.i + 1 }}</small></button>
            <button class="link" style="color:var(--bad);justify-self:start" @click="emit('hapus', x.idx)">Hapus</button>
          </div>
          <template v-if="panel === 'tandai' && halFav.length">
            <div class="babh">Halaman favorit</div>
            <button v-for="x in halFav" :key="x.i" class="card item" style="grid-template-columns:1fr" @click="emit('ke', x.i)"><div><h3>Halaman {{ x.i + 1 }}</h3></div></button>
          </template>
          <div v-if="panel === 'tandai' && !daftar.length && !halFav.length" class="kosong"><b>Belum ada tandai</b>Tahan lalu geser pada kalimat untuk menandainya, atau tekan ikon penanda di atas untuk menyimpan halaman.</div>
          <div v-else-if="panel === 'catatan' && !daftar.length" class="kosong"><b>Belum ada catatan</b>Pilih kalimat di bacaan, lalu tekan Tulis catatan.</div>
        </template>
        <div v-else class="rk" style="display:grid;gap:12px">
          <p class="muted" style="font-size:14px">Tulis rangkuman dengan kata-katamu sendiri. Tersimpan otomatis.</p>
          <textarea id="rk" v-model="rk" class="in" placeholder="Tulis rangkuman di sini…" />
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-g btn-s" @click="susun">Susun dari tandai dan catatan</button><button class="btn btn-l btn-s" @click="salin">Salin</button></div>
          <p class="muted" style="font-size:13px">{{ mine.length }} tandai dan catatan tersedia untuk buku ini.</p>
        </div>
      </div>
    </div>
  </div>
</template>
