<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { kapan } from '~/composables/perpusCore'

const P = usePerpus()
const paham = (kid: string, i: number) => !!P.W.value.kisi[`${kid}:${i}`]
const alih = (kid: string, i: number) => {
  const k = `${kid}:${i}`
  P.W.value.kisi = { ...P.W.value.kisi, [k]: !P.W.value.kisi[k] }
  P.simpan()
}
const jumlah = (k: { id: string, topik: unknown[] }) => k.topik.filter((_, i) => paham(k.id, i)).length
const bukuTopik = (t: { buku: Array<{ id: string }> }) => t.buku.map(x => P.cariBuku(x.id)).filter(Boolean) as NonNullable<ReturnType<typeof P.cariBuku>>[]
</script>

<template>
  <h1 class="h1" style="margin-top:8px">Kisi-kisi ujian</h1>
  <p class="sub">Disusun gurumu di Bank Soal CBT &amp; LMS. Baca topiknya, lalu buka buku yang sudah dipilihkan untukmu.</p>
  <div v-if="!P.kisi.value.length" class="kosong"><b>Belum ada kisi-kisi</b>Kisi-kisi muncul di sini setelah gurumu menyusunnya untuk ujian kelasmu.</div>
  <section v-for="k in P.kisi.value" :id="'k-' + k.id" :key="k.id" class="card kisi">
    <div class="kisi-h">
      <div><h3>{{ k.judul }}</h3><p class="kisi-meta"><span v-if="k.hari <= 3" class="baru">Baru</span>{{ k.mapel }} · dari guru, {{ kapan(Date.now() - k.hari * 864e5) }}</p></div>
      <span class="tag num">{{ jumlah(k) }}/{{ k.topik.length }} dipahami</span>
    </div>
    <div class="bar" style="margin-top:12px"><span :style="{ width: jumlah(k) / k.topik.length * 100 + '%' }" /></div>
    <div v-for="(t, i) in k.topik" :key="i" class="tp">
      <button class="cb" :class="{ on: paham(k.id, i) }" role="checkbox" :aria-checked="paham(k.id, i)" :aria-label="'Sudah paham: ' + t.t" @click="alih(k.id, i)"><PerpusIkon n="cek" /></button>
      <button class="tp-b" @click="P.sheet.value = { jenis: 'materi', kunci: `${k.id}:${i}` }">
        <b>{{ t.t }}</b><p v-if="t.i">{{ t.i }}</p>
        <span v-if="t.buku.length" class="rel"><span class="stack"><PerpusCover v-for="b in bukuTopik(t)" :key="b.id" :b="b" /></span><span class="rel-t">{{ t.buku.length }} buku yang cocok</span><PerpusIkon n="maju" /></span>
      </button>
    </div>
  </section>
</template>
