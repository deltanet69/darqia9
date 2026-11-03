<script setup lang="ts">
import { computed } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { inisialNama, progresBuku, sudahMulai } from '~/composables/perpusCore'

const emit = defineEmits<{ jelajahi: [], rak: [], keluar: [] }>()
const P = usePerpus()
const sesi = computed(() => P.state.value.sesi!)
const dibaca = computed(() => P.state.value.buku.filter(b => sudahMulai(b, P.state.value.prog)).length)
const selesai = computed(() => P.state.value.buku.filter(b => progresBuku(b, P.state.value.prog) >= 100).length)
</script>

<template>
  <section class="view on">
    <div class="page-head"><h2>Profil</h2><p>Anggota perpustakaan digital.</p></div>
    <div class="main">
      <div class="prof-top fadeup">
        <div class="avatar">{{ inisialNama(sesi.nama) }}</div>
        <h3>{{ sesi.nama }}</h3>
        <p>NIS {{ sesi.nis }} · {{ sesi.kelas }}<br>SMK IT Attaqwa 9 · NPP Perpusnas terdaftar</p>
      </div>
      <div class="prof-stats fadeup">
        <div><b>{{ dibaca }}</b><span>Read Books</span></div>
        <div><b>{{ P.state.value.rak.length }}</b><span>Favourite</span></div>
        <div><b>{{ selesai }}</b><span>Selesai</span></div>
      </div>
      <div class="menu-card fadeup">
        <button @click="emit('rak')">Rak Saya<span class="arr">›</span></button>
        <button @click="emit('jelajahi')">Jelajahi Katalog<span class="arr">›</span></button>
        <button style="color:var(--red)" @click="emit('keluar')">Keluar<span class="arr">›</span></button>
      </div>
      <p class="sec-note" style="text-align:center;margin-top:14px">Sesi tersimpan di perangkat ini. Keluarlah setelah selesai bila memakai perangkat bersama.</p>
    </div>
  </section>
</template>
