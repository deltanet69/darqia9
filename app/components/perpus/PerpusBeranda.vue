<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import {
  cariBuku, daftarMapel, progresBuku, salamWaktu, sudahMulai,
  type Buku
} from '~/composables/perpusCore'
import PerpusCover from './PerpusCover.vue'

const emit = defineEmits<{ detail: [b: Buku], baca: [b: Buku, bab: number], jelajahi: [] }>()
const P = usePerpus()
const sesi = computed(() => P.state.value.sesi!)
const buku = computed(() => P.state.value.buku)
const prog = computed(() => P.state.value.prog)
const kata = ref('')
const tab = ref('all')

const hasil = computed(() => cariBuku(buku.value, kata.value))
const bukuku = computed(() => buku.value.filter(b => b.tingkat === sesi.value.tingkat))
const berlanjut = computed(() => buku.value.filter(b => sudahMulai(b, prog.value) && progresBuku(b, prog.value) < 100))
const unggulan = computed(() => berlanjut.value[0] || bukuku.value[0])
const mapels = computed(() => ['all', ...daftarMapel(buku.value)])
const gridTab = computed(() => tab.value === 'all' ? buku.value : buku.value.filter(b => b.mapel === tab.value))
const bukuSpanduk = computed(() => buku.value.find(b => b.id === (sesi.value.jurusan === 'AKL' ? 'akl10' : 'inf10')) || buku.value[0])
const literasi = computed(() => buku.value.filter(b => b.lit))
const salam = computed(() => salamWaktu(new Date().getHours()))
</script>

<template>
  <section class="view on">
    <div class="topbar">
      <div class="avatar">{{ sesi.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() }}</div>
      <div><small>{{ salam }},</small><b>{{ sesi.nama }}</b></div>
      <button class="icon-btn" @click="P.tampilToast('Belum ada notifikasi baru')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#13233F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 20a2 2 0 01-3.4 0" /></svg>
        <span class="dot" />
      </button>
    </div>
    <div class="main" style="padding-top:12px">
      <div class="searchbar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A8494" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.8-3.8" /></svg>
        <input v-model="kata" type="search" placeholder="Cari buku, mapel, penulis…">
      </div>

      <div v-if="kata.trim()" class="sec">
        <div class="sec-head"><h4>Hasil Pencarian</h4><span>{{ hasil.length }} buku</span></div>
        <div v-if="hasil.length" class="grid">
          <div v-for="b in hasil" :key="b.id" class="g-item fadeup" @click="emit('detail', b)">
            <PerpusCover :buku="b" />
            <b>{{ b.judul }}</b><span>{{ b.lit ? 'Literasi · Buku Nonteks' : b.mapel + ' · Kelas ' + b.tingkat }}</span>
            <div v-if="progresBuku(b, prog) > 0"><div class="pbar" style="margin-top:8px"><i :style="{ width: progresBuku(b, prog) + '%' }" /></div><span style="font-weight:700;color:var(--ink)">{{ progresBuku(b, prog) }}% dibaca</span></div>
            <div v-else class="stars">★★★★★<em>{{ b.rating.toFixed(1) }}</em></div>
          </div>
        </div>
        <div v-else class="empty">Tidak ada buku yang cocok dengan "{{ kata }}".<br>Coba kata kunci lain.</div>
      </div>

      <template v-else>
        <div class="banner fadeup">
          <span class="b-kick">KURIKULUM MERDEKA · SIBI RESMI</span>
          <h3>Buku Teks Resmi Kurikulum Merdeka</h3>
          <p>Buku siswa &amp; guru dari SIBI Kemendikdasmen. Gratis untuk siswa.</p>
          <button class="b-cta" @click="emit('jelajahi')">Jelajahi Katalog</button>
          <PerpusCover v-if="bukuSpanduk" :buku="bukuSpanduk" mini />
          <div class="dots"><i /><i /><i /></div>
        </div>

        <div class="tabs">
          <button v-for="m in mapels" :key="m" class="tab" :class="{ on: tab === m }" @click="tab = m">{{ m === 'all' ? 'Semua' : m }}</button>
        </div>

        <template v-if="tab === 'all'">
          <div v-if="unggulan" class="sec" style="margin-top:8px">
            <div class="sec-head"><h4>{{ berlanjut.length ? 'Continue Reading' : 'Mulai Membaca' }}</h4><span>{{ berlanjut.length ? 'terakhir kamu baca' : 'rekomendasi untukmu' }}</span></div>
            <div class="cont-card fadeup" @click="emit('baca', unggulan, sudahMulai(unggulan, prog) ? prog[unggulan.id] : 0)">
              <PerpusCover :buku="unggulan" mini />
              <div class="cont-info">
                <span class="k">{{ sudahMulai(unggulan, prog) ? 'LANJUTKAN MEMBACA' : 'BUKU PILIHAN UNTUKMU' }}</span>
                <b>{{ unggulan.judul }}</b><span>{{ unggulan.bab[sudahMulai(unggulan, prog) ? prog[unggulan.id] : 0]?.judul }}</span>
                <div class="pbar"><i :style="{ width: progresBuku(unggulan, prog) + '%' }" /></div>
                <div class="prow"><span class="pct">{{ sudahMulai(unggulan, prog) ? progresBuku(unggulan, prog) + '%' : 'Belum mulai' }}</span><span class="go">{{ sudahMulai(unggulan, prog) ? 'Lanjutkan membaca →' : 'Mulai membaca →' }}</span></div>
              </div>
            </div>
          </div>

          <div class="sec">
            <div class="sec-head"><h4>Rak Kurikulum</h4><span>Kelas {{ sesi.tingkat }} · kelasmu</span><button @click="emit('jelajahi')">See All</button></div>
            <div class="rail">
              <div v-for="b in bukuku" :key="b.id" class="rail-item fadeup" @click="emit('detail', b)">
                <div class="covw"><PerpusCover :buku="b" bintang /></div><b>{{ b.judul }}</b><span>{{ b.pengarang }}</span>
              </div>
            </div>
          </div>

          <div class="sec">
            <div class="sec-head"><h4>Semua Koleksi</h4><span>{{ buku.filter(b => !b.lit).length }} judul</span><button @click="emit('jelajahi')">See All</button></div>
            <div class="grid">
              <div v-for="b in buku.slice(0, 4)" :key="b.id" class="g-item fadeup" @click="emit('detail', b)">
                <PerpusCover :buku="b" />
                <b>{{ b.judul }}</b><span>{{ b.lit ? 'Literasi · Buku Nonteks' : b.mapel + ' · Kelas ' + b.tingkat }}</span>
                <div v-if="progresBuku(b, prog) > 0"><div class="pbar" style="margin-top:8px"><i :style="{ width: progresBuku(b, prog) + '%' }" /></div><span style="font-weight:700;color:var(--ink)">{{ progresBuku(b, prog) }}% dibaca</span></div>
                <div v-else class="stars">★★★★★<em>{{ b.rating.toFixed(1) }}</em></div>
              </div>
            </div>
          </div>

          <div class="sec">
            <div class="sec-head"><h4>Rak Literasi</h4><span>buku nonteks SIBI</span></div>
            <div v-for="b in literasi" :key="b.id" class="lit" @click="emit('detail', b)">
              <PerpusCover :buku="b" mini />
              <div class="li">
                <h5>{{ b.judul.split(': ').slice(1).join(': ') || b.judul }}</h5>
                <p>{{ b.pengarang }} — {{ b.deskripsi }}</p>
                <span class="tag-ip">BACA DI APLIKASI</span>
              </div>
              <button class="btn-ipus">Baca</button>
            </div>
            <p class="sec-note">Semua buku di perpustakaan ini dibaca langsung di dalam aplikasi Darqia — tanpa membuka aplikasi atau situs lain.</p>
          </div>
        </template>

        <div v-else class="sec" style="margin-top:6px">
          <div class="sec-head"><h4>{{ tab }}</h4><span>{{ gridTab.length }} buku</span></div>
          <div class="grid">
            <div v-for="b in gridTab" :key="b.id" class="g-item fadeup" @click="emit('detail', b)">
              <PerpusCover :buku="b" />
              <b>{{ b.judul }}</b><span>{{ b.lit ? 'Literasi · Buku Nonteks' : b.mapel + ' · Kelas ' + b.tingkat }}</span>
              <div v-if="progresBuku(b, prog) > 0"><div class="pbar" style="margin-top:8px"><i :style="{ width: progresBuku(b, prog) + '%' }" /></div><span style="font-weight:700;color:var(--ink)">{{ progresBuku(b, prog) }}% dibaca</span></div>
              <div v-else class="stars">★★★★★<em>{{ b.rating.toFixed(1) }}</em></div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
