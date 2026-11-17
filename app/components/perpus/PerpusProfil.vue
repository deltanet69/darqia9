<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { inisialSiswa } from '~/composables/perpusCore'

const P = usePerpus()
const s = computed(() => P.siswa.value!)
const W = P.W
const ada = (id: string) => !!P.cariBuku(id)
const topik = computed(() => P.kisi.value.reduce((n, k) => n + k.topik.length, 0))
const paham = computed(() => P.kisi.value.reduce((n, k) => n + k.topik.filter((_, i) => W.value.kisi[`${k.id}:${i}`]).length, 0))
const nisn = computed(() => (s.value.nisn.length >= 6 ? s.value.nisn.slice(0, 4) + '••••' + s.value.nisn.slice(-2) : s.value.nisn || '-'))
const atur = (k: 'fs' | 'tema', v: number | string) => { (W.value as any)[k] = v; P.simpan() }
const FS: Array<[number, string]> = [[17, 'Kecil'], [19, 'Sedang'], [23, 'Besar']]
const TEMA: Array<[string, string]> = [['terang', 'Terang'], ['sepia', 'Sepia'], ['gelap', 'Gelap']]
</script>

<template>
  <section class="pf-head"><span class="avatar">{{ inisialSiswa(s.nama) }}</span><div><h1>{{ s.nama }}</h1><p>{{ s.kelas }} · {{ s.jenjang }}</p><span class="tag">Siswa terverifikasi</span></div></section>
  <div class="stat">
    <div class="card"><b class="num">{{ Object.keys(W.baca).filter(ada).length }}</b><span>buku dibaca</span></div>
    <div class="card"><b class="num">{{ W.tandai.filter(x => ada(x.id)).length }}</b><span>tandai dan catatan</span></div>
    <div class="card"><b class="num">{{ W.hal.filter(x => ada(x.id)).length }}</b><span>halaman favorit</span></div>
    <div class="card"><b class="num">{{ paham }}/{{ topik }}</b><span>topik ujian dipahami</span></div>
  </div>
  <section class="sec">
    <div class="sec-h"><h2>Data sekolah</h2></div>
    <div class="card rows">
      <div><span>Nama</span><span>{{ s.nama }}</span></div>
      <div><span>NISN</span><span class="num">{{ nisn }}</span></div>
      <div><span>NIS</span><span class="num">{{ s.nis || '-' }}</span></div>
      <div><span>Kelas</span><span>{{ s.kelas || '-' }}</span></div>
      <div><span>Jenjang</span><span>{{ s.jenjang }}</span></div>
      <div><span>Akun Google</span><span>{{ s.email || 'Terhubung' }}</span></div>
    </div>
    <p class="muted" style="font-size:13.5px;margin-top:10px">Data di atas berasal dari sekolah. Jika ada yang keliru, sampaikan ke wali kelas.</p>
  </section>
  <section v-if="P.kisi.value.length" class="sec">
    <div class="sec-h"><h2>Kemajuan belajar</h2><button class="link" @click="P.ke('belajar')">Buka Belajar</button></div>
    <div class="ujian-ring"><PerpusKartuKisi v-for="k in P.kisi.value" :key="k.id" :k="k" /></div>
  </section>
  <section class="sec">
    <div class="sec-h"><h2>Tampilan membaca</h2></div>
    <div class="card pref">
      <div><span class="lbl">Ukuran huruf</span><div class="seg"><button v-for="[v, n] in FS" :key="v" :class="{ on: W.fs === v }" @click="atur('fs', v)">{{ n }}</button></div></div>
      <div><span class="lbl">Latar membaca</span><div class="seg"><button v-for="[v, n] in TEMA" :key="v" :class="{ on: W.tema === v }" @click="atur('tema', v)">{{ n }}</button></div></div>
    </div>
  </section>
  <section class="sec"><button class="btn btn-l" style="width:100%" @click="P.keluar()">Keluar dari akun</button></section>
</template>
