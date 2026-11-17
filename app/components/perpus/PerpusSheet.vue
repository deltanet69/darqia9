<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { warnaBuku, type Buku } from '~/composables/perpusCore'

// Lembar bawah (sheet): saring kurikulum, notifikasi, rekomendasi buku per topik kisi-kisi, form catatan.
const P = usePerpus()
const sh = computed(() => P.sheet.value)
const tutup = () => { P.sheet.value = null }

const kurOpsi = computed<Array<[string, string]>>(() => [['', 'Semua kurikulum'], ...[...new Set(P.bukuSaya.value.map(b => b.kur).filter(Boolean))].sort().map(k => [k, k] as [string, string])])
const pilihKur = (v: string) => { P.V.value.kur = v; tutup() }

// notifikasi: membuka panel = menandai semuanya sudah dilihat
watch(() => sh.value?.jenis, (j) => {
  if (j !== 'notif') return
  P.W.value.nbaca = [...new Set([...P.W.value.nbaca, ...P.notif.value.map(x => x.id)])]
  P.simpan()
}, { immediate: true })
const lihatKisi = async (id: string) => {
  tutup(); P.ke('belajar')
  await nextTick()
  const el = document.getElementById('k-' + id)
  if (el) { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); el.classList.add('sorot'); setTimeout(() => el.classList.remove('sorot'), 1800) }
}

// rekomendasi buku untuk satu topik kisi-kisi
const materi = computed(() => {
  if (sh.value?.jenis !== 'materi' || !sh.value.kunci) return null
  const [kid, i] = sh.value.kunci.split(':')
  const k = P.kisi.value.find(x => x.id === kid)
  const t = k?.topik[+i!]
  return k && t ? { k, t, kunci: sh.value.kunci, rek: t.buku.map(x => ({ b: P.cariBuku(x.id), skor: x.skor })).filter((x): x is { b: Buku, skor: number } => !!x.b) } : null
})
const sudahPaham = computed(() => !!materi.value && !!P.W.value.kisi[materi.value.kunci])
const alihPaham = () => {
  const m = materi.value!
  P.W.value.kisi = { ...P.W.value.kisi, [m.kunci]: !P.W.value.kisi[m.kunci] }
  P.simpan(); tutup()
  P.toast(P.W.value.kisi[m.kunci] ? 'Topik ditandai sudah paham' : 'Tanda paham dibatalkan')
}
const disimpan = (id: string) => P.W.value.fav.includes(id)
const alihSimpan = (id: string) => {
  P.W.value.fav = disimpan(id) ? P.W.value.fav.filter(x => x !== id) : [...P.W.value.fav, id]
  P.simpan()
  P.toast(disimpan(id) ? 'Disimpan ke Koleksi sebagai favorit' : 'Dihapus dari favorit')
}

const catatan = ref('')
watch(sh, (s) => { if (s?.jenis === 'catatan') catatan.value = s.awal || '' }, { immediate: true })
</script>

<template>
  <div v-if="sh" class="scrim" @click.self="tutup">
    <div class="sheet" role="dialog" aria-modal="true">
      <template v-if="sh.jenis === 'filter'">
        <h2>Saring buku</h2>
        <p class="muted" style="font-size:14.5px;margin-top:-6px">Pilih kurikulum yang dipakai di kelasmu.</p>
        <div class="opsi"><button v-for="[v, n] in kurOpsi" :key="v" :class="{ on: P.V.value.kur === v }" @click="pilihKur(v)">{{ n }}<PerpusIkon v-if="P.V.value.kur === v" n="cek" /></button></div>
      </template>

      <template v-else-if="sh.jenis === 'notif'">
        <div class="n-h"><h2>Notifikasi</h2><span v-if="P.notif.value.length" class="muted">{{ P.notif.value.length }} pemberitahuan</span></div>
        <article v-for="x in P.notif.value" :key="x.id" class="nt">
          <span v-if="x.buku" class="n-c"><PerpusCover :b="x.buku" /></span>
          <span v-else class="km" :style="{ '--c1': warnaBuku(x.mapel || '')[0], '--c2': warnaBuku(x.mapel || '')[1] }">{{ (x.mapel || 'KSI').slice(0, 3).toUpperCase() }}</span>
          <div>
            <span class="n-j">{{ x.jenis }} · {{ x.waktu }}</span><b>{{ x.judul }}</b><p>{{ x.isi }}</p>
            <button v-if="x.kisiId" class="btn btn-l" @click="lihatKisi(x.kisiId)">Lihat kisi-kisi</button>
            <button v-else-if="x.buku" class="btn btn-p" @click="P.bukaReader(x.buku.id)">Lanjut dari halaman {{ (x.hal || 0) + 1 }}</button>
          </div>
        </article>
        <div v-if="!P.notif.value.length" class="kosong"><b>Belum ada notifikasi</b>Kami kabari saat gurumu menambah kisi-kisi baru atau ada buku yang belum selesai kamu baca.</div>
      </template>

      <template v-else-if="sh.jenis === 'materi' && materi">
        <div><h3>{{ materi.k.judul }}</h3><h2 style="margin-top:2px">{{ materi.t.t }}</h2><p v-if="materi.t.i" class="muted" style="font-size:14.5px;margin-top:6px">{{ materi.t.i }}</p></div>
        <div id="rek">
          <article v-for="r in materi.rek" :key="r.b.id" class="rek">
            <div class="rek-a">
              <span class="rek-c"><PerpusCover :b="r.b" /></span>
              <div><span class="rek-bab">{{ r.b.mapel }}</span><b>{{ r.b.judul }}</b><span class="s">{{ r.b.kelas }}<template v-if="r.b.kur"> · {{ r.b.kur }}</template></span></div>
              <span class="cocok num">{{ r.skor }}%<small>cocok</small></span>
            </div>
            <p v-if="r.b.terkunci" class="kutip">Hanya dapat dibuka Sabtu dan Minggu.</p>
            <p v-else-if="!r.b.tersedia" class="kutip">Buku ini belum tersedia.</p>
            <div class="rek-b">
              <button class="btn btn-p" :disabled="!r.b.tersedia || r.b.terkunci" @click="P.bukaReader(r.b.id)">{{ P.W.value.baca[r.b.id] ? 'Baca lagi' : 'Baca buku' }}</button>
              <button class="btn btn-l" :class="{ on: disimpan(r.b.id) }" :aria-pressed="disimpan(r.b.id)" @click="alihSimpan(r.b.id)">{{ disimpan(r.b.id) ? 'Tersimpan' : 'Simpan' }}</button>
            </div>
          </article>
          <div v-if="!materi.rek.length" class="kosong"><b>Belum ada buku yang cocok</b>Tanyakan ke gurumu buku apa yang bisa dipakai untuk topik ini.</div>
          <p class="ai-catat">Dipilih otomatis dari judul dan mata pelajaran buku kurikulum sekolah berdasarkan isi kisi-kisi. Kalau ada yang kurang pas, tanyakan ke gurumu.</p>
        </div>
        <button class="btn" :class="sudahPaham ? 'btn-l' : 'btn-p'" @click="alihPaham">{{ sudahPaham ? 'Batalkan tanda sudah paham' : 'Tandai sudah paham' }}</button>
      </template>

      <template v-else-if="sh.jenis === 'catatan'">
        <h2>Tulis catatan</h2>
        <textarea id="cat-in" v-model="catatan" class="in" placeholder="Apa yang ingin kamu ingat dari bagian ini?" autofocus />
        <button class="btn btn-p" @click="P.simpanCatatan(catatan.trim())">Simpan catatan</button>
        <button class="btn btn-g" @click="tutup">Batal</button>
      </template>
    </div>
  </div>
</template>
