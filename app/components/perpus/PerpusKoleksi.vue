<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { kapan, persenBaca } from '~/composables/perpusCore'

const P = usePerpus()
const V = P.V
const tabs = [['riwayat', 'Riwayat baca'], ['favorit', 'Favorit'], ['catatan', 'Tandai dan catatan'], ['rangkuman', 'Rangkuman']]
const ada = (id: string) => !!P.cariBuku(id)
const riwayat = computed(() => Object.entries(P.W.value.baca).filter(([id]) => ada(id)).sort((a, b) => b[1].ts - a[1].ts))
const favorit = computed(() => P.bukuSaya.value.filter(b => P.W.value.fav.includes(b.id)))
const tandai = computed(() => P.W.value.tandai.filter(x => ada(x.id)))
const halFav = computed(() => P.W.value.hal.filter(x => ada(x.id)))
const rangkuman = computed(() => P.bukuSaya.value.filter(b => (P.W.value.rk[b.id] || '').trim() || P.W.value.tandai.some(x => x.id === b.id)))
</script>

<template>
  <h1 class="h1" style="margin-top:8px">Koleksi saya</h1>
  <p class="sub">Semua bacaan, favorit, tandai, dan rangkumanmu di satu tempat.</p>
  <div class="tabs" role="tablist">
    <button v-for="[k, n] in tabs" :key="k" role="tab" :aria-selected="V.kol === k" :class="{ on: V.kol === k }" @click="V.kol = k!">{{ n }}</button>
  </div>
  <div class="list">
    <template v-if="V.kol === 'riwayat'">
      <button v-for="[id, v] in riwayat" :key="id" class="card item" @click="P.ke(V.tab, id)">
        <div><PerpusCover :b="P.cariBuku(id)!" /></div>
        <div><h3>{{ P.cariBuku(id)!.judul }}</h3><p><span class="num">{{ persenBaca(P.W.value, id) }}% dibaca</span> · {{ kapan(v.ts) }}</p></div>
        <span class="muted"><PerpusIkon n="maju" width="20" height="20" /></span>
      </button>
      <div v-if="!riwayat.length" class="kosong"><b>Belum ada riwayat</b>Buku yang kamu baca akan muncul di sini, lengkap dengan halaman terakhir.</div>
    </template>
    <template v-else-if="V.kol === 'favorit'">
      <button v-for="b in favorit" :key="b.id" class="card item" @click="P.ke(V.tab, b.id)">
        <div><PerpusCover :b="b" /></div><div><h3>{{ b.judul }}</h3><p>{{ b.mapel }}</p></div>
        <span class="muted"><PerpusIkon n="maju" /></span>
      </button>
      <div v-if="!favorit.length" class="kosong"><b>Belum ada favorit</b>Buka sebuah buku, lalu tekan Tambah ke favorit.</div>
    </template>
    <template v-else-if="V.kol === 'catatan'">
      <button v-for="x in tandai" :key="x.ts + x.teks" class="card quote" @click="P.bukaReader(x.id, x.i, null, true)">
        <q>{{ x.teks }}</q><div v-if="x.cat" class="cat">{{ x.cat }}</div><small>{{ P.cariBuku(x.id)!.judul }} · halaman {{ x.i + 1 }}</small>
      </button>
      <button v-for="x in halFav" :key="x.id + x.i" class="card quote" @click="P.bukaReader(x.id, x.i, null, true)">
        <b>Halaman favorit: halaman {{ x.i + 1 }}</b><small>{{ P.cariBuku(x.id)!.judul }} · halaman {{ x.i + 1 }}</small>
      </button>
      <div v-if="!tandai.length && !halFav.length" class="kosong"><b>Belum ada tandai atau catatan</b>Saat membaca, tahan lalu geser pada kalimat untuk menandainya.</div>
    </template>
    <template v-else>
      <button v-for="b in rangkuman" :key="b.id" class="card item" @click="P.bukaReader(b.id, undefined, 'rangkuman')">
        <div><PerpusCover :b="b" /></div>
        <div><h3>{{ b.judul }}</h3><p>{{ (P.W.value.rk[b.id] || '').trim() ? 'Rangkuman sudah ditulis' : 'Belum ada rangkuman — susun dari tandai dan catatanmu' }}</p></div><span />
      </button>
      <div v-if="!rangkuman.length" class="kosong"><b>Belum ada rangkuman</b>Setelah menandai kalimat, kamu bisa menyusun rangkuman dari panel di pembaca.</div>
    </template>
  </div>
</template>
