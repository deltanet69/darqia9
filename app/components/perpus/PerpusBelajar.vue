<script setup lang="ts">
import { usePerpus, type Kisi, type TopikKisiBuku } from '~/composables/usePerpus'
import { kapan, warnaBuku } from '~/composables/perpusCore'
import { BLOOM, type LevelBloom } from '~/utils/kisiBloom'

// Media Pembelajaran: daftar per MAPEL dulu; klik mapel membuka detail kisi-kisinya (butir Bloom
// berurutan C1 -> C6) lengkap dengan rekomendasi buku + bab spesifik + materi di dalam bab itu.
const P = usePerpus()
const paham = (kid: string, i: number) => !!P.W.value.kisi[`${kid}:${i}`]
const alih = (kid: string, i: number) => {
  const k = `${kid}:${i}`
  P.W.value.kisi = { ...P.W.value.kisi, [k]: !P.W.value.kisi[k] }
  P.simpan()
}
const jumlah = (k: { id: string, topik: unknown[] }) => k.topik.filter((_, i) => paham(k.id, i)).length
const bukuTopik = (t: { buku: Array<{ id: string }> }) => t.buku.map(x => P.cariBuku(x.id)).filter(Boolean) as NonNullable<ReturnType<typeof P.cariBuku>>[]

const grupMapel = computed(() => {
  const peta = new Map<string, Kisi[]>()
  for (const k of P.kisi.value) {
    const a = peta.get(k.mapel) ?? []
    a.push(k)
    peta.set(k.mapel, a)
  }
  return [...peta.entries()].map(([mapel, daftar]) => {
    const topik = daftar.flatMap(k => k.topik)
    const bukuUnik = new Set<string>()
    topik.forEach((t) => { t.buku.forEach(b => bukuUnik.add(b.id)); if (t.rek) bukuUnik.add(t.rek.bukuId) })
    return {
      mapel, daftar,
      totalTopik: topik.length,
      pahamN: daftar.reduce((n, k) => n + jumlah(k), 0),
      materiN: new Set(topik.map(t => t.t)).size,
      bukuN: bukuUnik.size
    }
  })
})

const mapelAktif = ref('')
watch(() => P.mapelBelajar.value, (m) => { if (m) { mapelAktif.value = m; P.mapelBelajar.value = '' } }, { immediate: true })
const grupAktif = computed(() => grupMapel.value.find(g => g.mapel === mapelAktif.value))

const levelInfo = (t: TopikKisiBuku) => (t.level ? BLOOM[t.level as LevelBloom] : null)
const disimpan = (id: string) => P.W.value.fav.includes(id)
const alihSimpan = (id: string) => {
  P.W.value.fav = disimpan(id) ? P.W.value.fav.filter(x => x !== id) : [...P.W.value.fav, id]
  P.simpan()
  P.toast(disimpan(id) ? 'Disimpan ke Koleksi sebagai favorit' : 'Dihapus dari favorit')
}
const bukaBab = (t: TopikKisiBuku) => { if (t.rek) P.bukaReader(t.rek.bukuId, Math.max(t.rek.mulai - 1, 0), null, true) }
</script>

<template>
  <!-- Daftar per mapel -->
  <template v-if="!mapelAktif">
    <h1 class="h1" style="margin-top:8px">Media Pembelajaran</h1>
    <p class="sub">Pilih mata pelajaran untuk melihat kisi-kisi ujian dari gurumu — lengkap dengan rekomendasi buku dan bab yang perlu dipelajari.</p>
    <div v-if="!grupMapel.length" class="kosong"><b>Belum ada kisi-kisi</b>Kisi-kisi muncul di sini setelah gurumu menyusunnya untuk ujian kelasmu.</div>
    <button v-for="g in grupMapel" :key="g.mapel" class="card ujian" :aria-label="`Media belajar ${g.mapel}`" @click="mapelAktif = g.mapel">
      <span class="km" :style="{ '--c1': warnaBuku(g.mapel)[0], '--c2': warnaBuku(g.mapel)[1] }">{{ g.mapel.slice(0, 3).toUpperCase() }}</span>
      <span class="ut">
        <b>Media Belajar {{ g.mapel }}</b>
        <small>{{ g.daftar.map(k => k.judul).join(' · ') }}</small>
        <small class="num">{{ g.totalTopik }} butir kisi-kisi · {{ g.materiN }} materi · {{ g.bukuN }} buku rujukan</small>
        <span class="bar" style="margin-top:8px"><span :style="{ width: (g.totalTopik ? g.pahamN / g.totalTopik * 100 : 0) + '%' }" /></span>
        <small class="num">{{ g.pahamN }} dari {{ g.totalTopik }} topik dipahami</small>
      </span>
      <span class="go"><PerpusIkon n="maju" /></span>
    </button>
  </template>

  <!-- Detail kisi-kisi satu mapel -->
  <template v-else>
    <button class="btn btn-l" style="margin-top:8px" @click="mapelAktif = ''">‹ Semua mapel</button>
    <h1 class="h1" style="margin-top:10px">Media Belajar {{ mapelAktif }}</h1>
    <p class="sub">Butir kisi-kisi disusun gurumu berurutan mengikuti tahapan berpikir Taksonomi Bloom — dari mengingat (C1) sampai menciptakan (C6). Setiap butir dilengkapi buku rujukan dan bab spesifiknya.</p>
    <section v-for="k in (grupAktif?.daftar ?? [])" :id="'k-' + k.id" :key="k.id" class="card kisi">
      <div class="kisi-h">
        <div><h3>{{ k.judul }}</h3><p class="kisi-meta"><span v-if="k.hari <= 3" class="baru">Baru</span>{{ k.mapel }} · dari guru, {{ kapan(Date.now() - k.hari * 864e5) }}</p></div>
        <span class="tag num">{{ jumlah(k) }}/{{ k.topik.length }} dipahami</span>
      </div>
      <div class="bar" style="margin-top:12px"><span :style="{ width: jumlah(k) / k.topik.length * 100 + '%' }" /></div>

      <div v-for="(t, i) in k.topik" :key="i" class="tp">
        <button class="cb" :class="{ on: paham(k.id, i) }" role="checkbox" :aria-checked="paham(k.id, i)" :aria-label="'Sudah paham: ' + t.t" @click="alih(k.id, i)"><PerpusIkon n="cek" /></button>
        <div class="tp-b">
          <p v-if="levelInfo(t)" class="num" :style="{ color: levelInfo(t)!.warna, fontSize: '11px', fontWeight: 800, letterSpacing: '.08em' }">LEVEL {{ t.level }} — {{ levelInfo(t)!.nama.toUpperCase() }}</p>
          <b>{{ t.t }}</b>
          <p v-if="t.i">{{ t.i }}</p>

          <!-- Rekomendasi bab spesifik -->
          <div v-if="t.rek" class="rekbab">
            <p class="rekbab-l">Rekomendasi buku</p>
            <div class="rekbab-b">
              <span v-if="P.cariBuku(t.rek.bukuId)" class="rekbab-c"><PerpusCover :b="P.cariBuku(t.rek.bukuId)!" /></span>
              <div>
                <b>{{ P.cariBuku(t.rek.bukuId)?.judul || 'Buku rujukan' }}</b>
                <p class="rekbab-bab">{{ t.rek.nomor ? `Bab ${t.rek.nomor} — ` : '' }}{{ t.rek.bab }}</p>
                <p class="rekbab-h">Halaman {{ t.rek.mulai }}–{{ t.rek.selesai }}</p>
              </div>
            </div>
            <div v-if="t.rek.subbab.length" class="rekbab-m">
              <p class="rekbab-l">Materi yang bisa kamu pelajari di bab ini</p>
              <ul><li v-for="(sb, j) in t.rek.subbab" :key="j">{{ sb }}</li></ul>
            </div>
            <div class="rekbab-a">
              <button class="btn btn-p" @click="bukaBab(t)">Baca Bab Ini</button>
              <button class="btn btn-l" :class="{ on: disimpan(t.rek.bukuId) }" :aria-pressed="disimpan(t.rek.bukuId)" @click="alihSimpan(t.rek.bukuId)">{{ disimpan(t.rek.bukuId) ? 'Tersimpan' : 'Simpan' }}</button>
            </div>
          </div>

          <!-- Cadangan: rekomendasi tingkat buku -->
          <template v-else-if="t.buku.length">
            <span class="rel"><span class="stack"><PerpusCover v-for="b in bukuTopik(t)" :key="b.id" :b="b" /></span><span class="rel-t">{{ t.buku.length }} buku yang cocok</span></span>
            <p v-if="!t.babTerindeks" class="kutip">Bab spesifiknya belum terindeks untuk buku rujukan utamanya. Buka bukunya dan cari materi ini lewat daftar isi.</p>
            <button class="btn btn-l" style="margin-top:8px" @click="P.sheet.value = { jenis: 'materi', kunci: `${k.id}:${i}` }">Lihat rekomendasi buku</button>
          </template>
          <p v-else class="muted" style="font-size:13px">Belum ada buku yang cocok untuk topik ini. Tanyakan ke gurumu, ya.</p>
        </div>
      </div>
    </section>
  </template>
</template>

<style scoped>
.rekbab { margin-top: 10px; border-top: 1px solid #E9EEF5; padding-top: 10px; }
.rekbab-l { font-size: 10.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #1B5FD9; }
.rekbab-b { display: flex; gap: 10px; margin-top: 8px; align-items: flex-start; }
.rekbab-c { flex: 0 0 40px; }
.rekbab-bab { font-weight: 700; color: #0A2A5C; margin-top: 2px; }
.rekbab-h { font-size: 12px; color: #667085; }
.rekbab-m { margin-top: 10px; background: #F8FAFD; border-radius: 12px; padding: 10px 12px; }
.rekbab-m ul { list-style: none; margin-top: 6px; }
.rekbab-m li { font-size: 13px; color: #344054; line-height: 1.5; padding: 2px 0 2px 16px; position: relative; }
.rekbab-m li::before { content: ''; position: absolute; left: 1px; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: #1B5FD9; opacity: .55; }
.rekbab-a { display: flex; gap: 8px; margin-top: 10px; }
.rekbab-a .btn { flex: 1; }
.rekbab-a .btn-l { flex: 0 0 104px; }
</style>
