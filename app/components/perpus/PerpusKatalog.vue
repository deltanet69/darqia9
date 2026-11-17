<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
const P = usePerpus()
const V = P.V
const mapel = computed(() => [...new Set(P.bukuSaya.value.map(b => b.mapel))].sort())
const hasil = computed(() => {
  const q = V.value.q.trim().toLowerCase()
  return P.bukuSaya.value.filter(b => (!V.value.mapel || b.mapel === V.value.mapel) && (!V.value.kur || b.kur === V.value.kur)
    && (!q || `${b.judul} ${b.mapel} ${b.penulis}`.toLowerCase().includes(q)))
})
// Katalog bisa ratusan buku: tampil bertahap supaya layar tidak berat.
const tampil = ref(48)
watch(() => [V.value.q, V.value.mapel, V.value.kur], () => { tampil.value = 48 })
</script>

<template>
  <h1 class="h1" style="margin-top:8px">Katalog buku</h1>
  <p class="sub">Semua buku untuk jenjang {{ P.siswa.value!.jenjang }}, disusun menurut kurikulum.</p>
  <div class="cari-baris">
    <label class="cari"><span class="sr" style="position:absolute;left:-9999px">Cari buku</span><PerpusIkon n="cari" /><input id="q" v-model="V.q" class="in" type="search" placeholder="Cari judul atau mapel" autocomplete="off"></label>
    <button class="fbtn" :class="{ aktif: V.kur }" :aria-label="'Saring kurikulum' + (V.kur ? ': ' + V.kur : '')" @click="P.sheet.value = { jenis: 'filter' }"><PerpusIkon n="saring" /></button>
  </div>
  <div class="chips lembut" role="group" aria-label="Mata pelajaran">
    <button class="chip" :class="{ on: !V.mapel }" @click="V.mapel = ''">Semua</button>
    <button v-for="m in mapel" :key="m" class="chip" :class="{ on: V.mapel === m }" @click="V.mapel = m">{{ m }}</button>
  </div>
  <div id="hasil" style="margin-top:16px">
    <template v-if="hasil.length">
      <p class="kcount num">{{ hasil.length }} buku ditemukan</p>
      <div class="grid"><PerpusKartuBuku v-for="b in hasil.slice(0, tampil)" :key="b.id" :b="b" /></div>
      <button v-if="hasil.length > tampil" class="btn btn-l" style="width:100%;margin-top:20px" @click="tampil += 48">Tampilkan lebih banyak</button>
    </template>
    <div v-else class="kosong"><b>Buku tidak ditemukan</b>Coba kata kunci lain atau ubah pilihan mapel dan kurikulum.</div>
  </div>
</template>
