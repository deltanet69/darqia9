<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Profil</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Data pesertamu di sistem ujian.</p>
    </div>

    <div class="bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-5 text-white shadow-xl flex items-center gap-4">
      <div class="w-14 h-14 shrink-0 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">{{ inisial }}</div>
      <div class="min-w-0">
        <div class="text-lg font-black leading-tight break-words">{{ profil.nama }}</div>
        <div class="text-xs text-slate-300 mt-0.5">{{ profil.kelas || 'Tanpa kelas' }} &bull; {{ profil.jenjang }}</div>
      </div>
    </div>

    <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-5 shadow-sm">
      <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">Data Peserta</h3>
      <dl class="divide-y divide-slate-100 text-sm">
        <div v-for="b in baris" :key="b.label" class="py-2.5 flex items-start justify-between gap-4">
          <dt class="text-slate-500 shrink-0">{{ b.label }}</dt>
          <dd class="font-bold text-slate-900 text-right break-words" :class="{ 'font-mono': b.mono }">{{ b.nilai || '-' }}</dd>
        </div>
      </dl>
      <p class="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        NIS, NISN, dan token ujian tidak dapat diubah dari sini. Hubungi panitia ujian bila ada yang tidak sesuai.
      </p>
    </div>

    <button type="button" class="w-full py-3.5 rounded-2xl border-2 border-rose-200 text-rose-700 bg-white font-extrabold text-sm active:scale-[0.98]" @click="emit('keluar')">
      Keluar
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfilSiswa } from '~/composables/useCbtSiswa'

const props = defineProps<{ profil: ProfilSiswa }>()
const emit = defineEmits<{ (e: 'keluar'): void }>()

const inisial = computed(() => props.profil.nama.split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase())
const tanggalLahir = computed(() => props.profil.tanggalLahir
  ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(props.profil.tanggalLahir))
  : '')
const baris = computed(() => [
  { label: 'Nama Lengkap', nilai: props.profil.nama },
  { label: 'NIS', nilai: props.profil.nis, mono: true },
  { label: 'NISN', nilai: props.profil.nisn, mono: true },
  { label: 'Token Ujian', nilai: props.profil.token, mono: true },
  { label: 'Kelas', nilai: props.profil.kelas },
  { label: 'Jenjang', nilai: props.profil.jenjang === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' },
  { label: 'Ruang Ujian', nilai: props.profil.ruang || 'Online' },
  { label: 'Jenis Kelamin', nilai: props.profil.gender === 'P' ? 'Perempuan' : 'Laki-laki' },
  { label: 'Tempat, Tanggal Lahir', nilai: [props.profil.tempatLahir, tanggalLahir.value].filter(Boolean).join(', ') },
  { label: 'Agama', nilai: props.profil.agama || '' },
  { label: 'Tahun Masuk', nilai: props.profil.angkatan ? String(props.profil.angkatan) : '' }
])
</script>
