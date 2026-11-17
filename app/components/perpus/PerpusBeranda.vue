<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { kapan, persenBaca, type Buku } from '~/composables/perpusCore'

const P = usePerpus()
const nama = computed(() => P.siswa.value!.nama.split(' ')[0])
const terakhir = computed(() => Object.entries(P.W.value.baca).filter(([id]) => P.cariBuku(id)).sort((a, b) => b[1].ts - a[1].ts)[0])
const bl = computed(() => (terakhir.value ? P.cariBuku(terakhir.value[0]) : P.bukuSaya.value.find(P.bukuTersedia)) || P.bukuSaya.value[0])
const favs = computed(() => P.bukuSaya.value.filter(b => P.W.value.fav.includes(b.id)))
const daftar = computed(() => P.bukuSaya.value.slice(0, 20))

// Daftar buku unggulan (featured): buku aktif dibaca, favorit, dan rekomendasi kelas
const featuredList = computed(() => {
  const list: Buku[] = []
  if (bl.value) list.push(bl.value)
  for (const b of favs.value) {
    if (!list.some(x => x.id === b.id)) list.push(b)
  }
  for (const b of P.bukuSaya.value) {
    if (list.length >= 6) break
    if (!list.some(x => x.id === b.id) && b.tersedia && !b.terkunci) list.push(b)
  }
  return list.slice(0, 6)
})

const aktifIdx = ref(0)
const featScrollEl = ref<HTMLElement>()

const saatScrollFeat = (e: Event) => {
  const el = e.target as HTMLElement
  if (!el || !featuredList.value.length) return
  // Lebar kartu 200px + jarak 16px = 216px
  const itemW = 216
  const idx = Math.round(el.scrollLeft / itemW)
  aktifIdx.value = Math.max(0, Math.min(idx, featuredList.value.length - 1))
}

const bukuAktif = computed(() => featuredList.value[aktifIdx.value] || bl.value)
const infoAktif = computed(() => {
  const b = bukuAktif.value
  if (!b) return ''
  const pr = P.W.value.baca[b.id]
  if (pr) return `Terakhir dibaca ${kapan(pr.ts)} · Halaman ${pr.i + 1} dari ${pr.n}`
  return `${b.kelas} · ${b.kur || 'Kurikulum Terpadu'}`
})
</script>

<template>
  <h1 class="h1" style="margin-top:8px">Halo, {{ nama }}</h1>
  <p class="sub">{{ P.siswa.value!.kelas }} · {{ P.siswa.value!.jenjang }}</p>

  <!-- Featured Buku: Bersih, Minimalis & Seamless seperti Bookrack -->
  <section v-if="featuredList.length" class="feat-section">
    <div ref="featScrollEl" class="feat-carousel" @scroll.passive="saatScrollFeat">
      <button
        v-for="(fb, idx) in featuredList"
        :key="fb.id"
        class="feat-card"
        :class="{ aktif: idx === aktifIdx }"
        :aria-label="fb.judul"
        @click="P.ke(P.V.value.tab, fb.id)"
      >
        <PerpusCover :b="fb" />
      </button>
    </div>

    <!-- Informasi Buku Unggulan Aktif -->
    <div v-if="bukuAktif" class="feat-info" @click="P.ke(P.V.value.tab, bukuAktif.id)">
      <div class="feat-meta-row">
        <h3>{{ bukuAktif.judul }}</h3>
        <span class="feat-badge">{{ bukuAktif.mapel }}</span>
      </div>
      <p class="feat-sub">{{ infoAktif }}</p>

      <!-- Indikator Garis & Nomor Halaman / Slide 1 / N -->
      <div class="feat-pagi-row">
        <div class="feat-track">
          <span :style="{ width: ((aktifIdx + 1) / featuredList.length * 100) + '%' }" />
        </div>
        <span class="feat-count num">{{ aktifIdx + 1 }} / {{ featuredList.length }}</span>
      </div>
    </div>
  </section>
  <div v-else class="kosong"><b>Koleksi belum tersedia</b>Belum ada buku untuk kelasmu. Coba lagi nanti.</div>

  <section v-if="P.kisi.value.length" class="sec">
    <div class="sec-h"><h2>Persiapan ujianmu</h2><button class="link" @click="P.ke('belajar')">Lihat semua</button></div>
    <div class="ujian-ring"><PerpusKartuKisi v-for="k in P.kisi.value.slice(0, 2)" :key="k.id" :k="k" /></div>
  </section>
  <section v-if="daftar.length" class="sec">
    <div class="sec-h"><h2>Buku untuk kelasmu</h2><button class="link" @click="P.ke('katalog')">Lihat katalog</button></div>
    <div class="rowx"><PerpusKartuBuku v-for="b in daftar" :key="b.id" :b="b" /></div>
  </section>
  <section v-if="favs.length" class="sec">
    <div class="sec-h"><h2>Favoritmu</h2></div>
    <div class="rowx"><PerpusKartuBuku v-for="b in favs" :key="b.id" :b="b" /></div>
  </section>
</template>
