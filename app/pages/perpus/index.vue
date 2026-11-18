<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import '~/assets/css/perpus.css'
import { inisialSiswa } from '~/composables/perpusCore'

// Perpustakaan Digital — aplikasi siswa (port prototipe dummy/perpus). Satu rute; tampilan berganti di tempat:
// Login Google -> NIS/NISN -> Beranda / Katalog / Belajar / Koleksi / Profil / Detail buku / Pembaca PDF.
// Dilayani di perpus.smpitbca.sch.id dan perpus.smkitattaqwa9.sch.id (di domain itu rutenya tampil sebagai "/").
definePageMeta({ layout: 'exam' })
const P = usePerpus()
useHead(() => ({ title: `Perpustakaan Digital — ${P.jenjangTampil.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'}` }))

const NAV: Array<[string, string, string]> = [['beranda', 'Beranda', 'home'], ['katalog', 'Katalog', 'katalog'], ['belajar', 'Belajar', 'belajar'], ['koleksi', 'Koleksi', 'koleksi'], ['profil', 'Profil', 'profil']]
const URUT_TAB = [0, 2, 1, 3, 4] // navbar bawah: Katalog di tengah sebagai tombol bulat
const logo = computed(() => (P.jenjangTampil.value === 'SMP' ? '/asset/logosmp.webp' : '/asset/logo.png'))
const V = P.V
const tab = (k: string) => P.ke(k as any)
const lonceng = () => { P.sheet.value = { jenis: 'notif' } }

onMounted(() => { P.mulai() })
</script>

<template>
  <div class="pp">
    <ClientOnly>
      <PerpusLogin v-if="P.tahap.value !== 'masuk'" />
      <div v-else-if="P.siswa.value" class="app">
        <aside class="rail">
          <div class="logo">
            <img :src="logo" alt="" onerror="this.style.display='none'">
            <span class="bell-w rail-bell"><button class="bell" :class="{ ada: P.belumDibaca.value }" :aria-label="'Notifikasi' + (P.belumDibaca.value ? ', ' + P.belumDibaca.value + ' baru' : '')" @click="lonceng"><PerpusIkon n="lonceng" /><span v-if="P.belumDibaca.value" class="badge num">{{ P.belumDibaca.value }}</span></button></span>
            <span>DARQIA 9<small style="display:block;font-weight:500;font-size:12px;color:var(--muted)">Perpustakaan Digital</small></span>
          </div>
          <button v-for="[k, nama, ik] in NAV.slice(0, 4)" :key="k" class="nav" :class="{ on: V.tab === k }" :aria-current="V.tab === k ? 'page' : undefined" @click="tab(k)"><PerpusIkon :nav="ik" /><span>{{ nama }}</span></button>
          <button class="perfil" @click="tab('profil')"><span class="avatar">{{ inisialSiswa(P.siswa.value.nama) }}</span><span><b>{{ P.siswa.value.nama.split(' ')[0] }}</b><span>{{ P.siswa.value.kelas }}</span></span></button>
        </aside>
        <div>
          <header class="top">
            <div class="logo"><img :src="logo" alt="" onerror="this.style.display='none'"><span>Perpus Digital</span></div>
            <div class="top-k">
              <span class="bell-w"><button class="bell" :class="{ ada: P.belumDibaca.value }" :aria-label="'Notifikasi' + (P.belumDibaca.value ? ', ' + P.belumDibaca.value + ' baru' : '')" @click="lonceng"><PerpusIkon n="lonceng" /><span v-if="P.belumDibaca.value" class="badge num">{{ P.belumDibaca.value }}</span></button></span>
              <button class="avatar" aria-label="Profil saya" @click="tab('profil')">{{ inisialSiswa(P.siswa.value.nama) }}</button>
            </div>
          </header>
          <main id="main" :key="V.tab + V.detail" class="main masuk">
            <PerpusDetail v-if="V.detail" />
            <PerpusBeranda v-else-if="V.tab === 'beranda'" />
            <PerpusKatalog v-else-if="V.tab === 'katalog'" />
            <PerpusBelajar v-else-if="V.tab === 'belajar'" />
            <PerpusKoleksi v-else-if="V.tab === 'koleksi'" />
            <PerpusProfil v-else />
          </main>
        </div>
        <nav v-if="!V.detail" class="tabbar" aria-label="Menu utama">
          <button v-for="x in URUT_TAB" :key="NAV[x]![0]" class="nav" :class="{ fab: NAV[x]![0] === 'katalog', on: V.tab === NAV[x]![0] }" :aria-label="NAV[x]![1]" :aria-current="V.tab === NAV[x]![0] ? 'page' : undefined" @click="tab(NAV[x]![0])"><PerpusIkon :nav="NAV[x]![2]" /><i class="dot" /></button>
        </nav>
      </div>
      <PerpusReader v-if="P.reader.value" :key="P.reader.value.id" />
      <div id="lapis">
        <PerpusSheet />
        <div v-if="P.toastTeks.value" class="toast" role="status">{{ P.toastTeks.value }}</div>
      </div>
    </ClientOnly>
  </div>
</template>
