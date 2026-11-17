<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { KETERANGAN_JADWAL, persenBaca } from '~/composables/perpusCore'

const P = usePerpus()
const b = computed(() => P.cariBuku(P.V.value.detail))
const pr = computed(() => (b.value ? P.W.value.baca[b.value.id] : undefined))
const pct = computed(() => (b.value ? persenBaca(P.W.value, b.value.id) : 0))
const fav = computed(() => !!b.value && P.W.value.fav.includes(b.value.id))
const terkait = computed(() => P.kisi.value.flatMap(k => k.topik.filter(t => t.buku.some(x => x.id === b.value?.id)).map(t => ({ k, t }))))

// EPUB belum punya pembaca: siswa mengunduhnya (permintaan membawa token, jadi lewat fetch, bukan tautan).
const unduh = async () => {
  if (!b.value) return
  const r = await fetch(`/api/perpus/berkas/${encodeURIComponent(b.value.id)}`, { headers: { Authorization: `Bearer ${await P.token()}` } })
  if (!r.ok) { P.toast('Berkas gagal diunduh.'); return }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(await r.blob())
  a.download = `${b.value.judul}.epub`
  a.click()
  URL.revokeObjectURL(a.href)
}

const detailFs = ref<'sm' | 'md' | 'lg'>('md')

const alihFav = () => {
  if (!b.value) return
  const id = b.value.id
  P.W.value.fav = fav.value ? P.W.value.fav.filter(x => x !== id) : [...P.W.value.fav, id]
  P.simpan()
  P.toast(P.W.value.fav.includes(id) ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit')
}

const sinopsis = computed(() => {
  if (!b.value) return ''
  const item = b.value
  if (item.sinopsis) return item.sinopsis
  if (item.ringkas && item.ringkas.length > 60) return item.ringkas

  const jns = item.jenis || 'Buku teks pelajaran'
  const mpl = item.mapel || 'mata pelajaran terkait'
  const kls = item.kelas ? `untuk kelas ${item.kelas}` : ''
  const jen = item.jenjang?.join('/') || 'siswa'
  const kurik = item.kur ? `mengacu pada standar ${item.kur}` : 'sesuai kurikulum resmi'
  const pnl = item.penulis ? `karya ${item.penulis}` : 'resmi Kemendikbudristek'

  return `${jns} ${mpl} ${kls} jenjang ${jen} ini disusun ${kurik} ${pnl}. Buku ini menyajikan materi pokok secara komprehensif, dilengkapi pemaparan konsep esensial, contoh penerapan nyata, serta aktivitas latihan terpadu guna memperkuat pemahaman belajar dan kesiapan evaluasi siswa.`
})
</script>

<template>
  <template v-if="b">
    <button class="back" @click="P.ke(P.V.value.tab)"><PerpusIkon n="kembali" />Kembali</button>
    <div class="detail">
      <div class="cv"><PerpusCover :b="b" /></div>
      <div class="detail-info">
        <h1>{{ b.judul }}</h1>
        <div class="meta">
          <span class="tag">{{ b.mapel }}</span>
          <span class="tag">{{ b.kelas }}</span>
          <span v-if="b.kur" class="tag">{{ b.kur }}</span>
        </div>
        <p v-if="b.penulis" class="detail-penulis">{{ b.penulis }}</p>

        <!-- Status ketersediaan / jadwal -->
        <p v-if="b.terkunci" class="err" style="margin-top:10px">{{ KETERANGAN_JADWAL }}. Hari ini belum bisa dibuka.</p>
        <p v-else-if="!b.tersedia" class="err" style="margin-top:10px">Buku ini belum tersedia. Berkasnya sedang disiapkan.</p>

        <!-- Progres membaca -->
        <div v-if="pr" class="detail-progres">
          <div class="bar"><span :style="{ width: pct + '%' }" /></div>
          <p class="muted num">{{ pct }}% dibaca · berhenti di halaman {{ pr.i + 1 }}</p>
        </div>

        <!-- Sinopsis Singkat Buku dengan Pengatur Ukuran Huruf -->
        <section class="sec-sinopsis">
          <div class="sinopsis-head">
            <h2>Sinopsis</h2>
            <div class="sinopsis-zoom" role="group" aria-label="Ukuran font sinopsis">
              <button class="sz-btn" :class="{ on: detailFs === 'sm' }" title="Huruf kecil" @click="detailFs = 'sm'">A−</button>
              <button class="sz-btn" :class="{ on: detailFs === 'md' }" title="Huruf standar" @click="detailFs = 'md'">A</button>
              <button class="sz-btn" :class="{ on: detailFs === 'lg' }" title="Huruf besar" @click="detailFs = 'lg'">A+</button>
            </div>
          </div>
          <p class="sinopsis-teks" :class="'fs-' + detailFs">{{ sinopsis }}</p>
        </section>

        <!-- Ujian terkait -->
        <section v-if="terkait.length" class="sec" style="margin-top:24px">
          <div class="sec-h"><h2>Dipakai untuk ujian</h2></div>
          <div class="list" style="margin-top:0">
            <button v-for="x in terkait" :key="x.k.id + x.t.t" class="card quote" @click="P.bukaReader(b.id)">
              <b>{{ x.t.t }}</b>
              <small>{{ x.k.judul }} · buka bukunya</small>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Floating Action Bar: Baca Buku & Icon Favorit -->
    <div class="detail-float-bar">
      <button
        class="float-fav-btn"
        :class="{ on: fav }"
        :aria-label="fav ? 'Hapus dari favorit' : 'Tambah ke favorit'"
        :title="fav ? 'Hapus dari favorit' : 'Tambah ke favorit'"
        @click="alihFav"
      >
        <PerpusIkon n="koleksi" />
      </button>
      <button
        class="btn btn-p float-baca-btn"
        :disabled="!b.tersedia || b.terkunci"
        @click="b.format === 'epub' ? unduh() : P.bukaReader(b.id)"
      >
        <PerpusIkon n="maju" />
        <span>{{ b.format === 'epub' ? 'Unduh EPUB' : pr ? 'Lanjutkan Membaca' : 'Baca Buku' }}</span>
      </button>
    </div>
  </template>
</template>
