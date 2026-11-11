<template>
  <div class="space-y-5 antialiased">
    <!-- Header Halaman Profil -->
    <div>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Profil Peserta CBT</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Informasi identitas peserta, data akademik, dan status verifikasi di sistem ujian.</p>
    </div>

    <!-- Hero Card Profil Eksekutif Modern -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08152B] via-[#0E2754] to-[#163673] p-5 sm:p-6 text-white shadow-xl shadow-blue-950/20 border border-white/10">
      <div class="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-950/40 ring-2 ring-white/20">
              {{ inisial }}
            </div>
            <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0E2754] shadow-xs" title="Akun Terverifikasi" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur text-[10px] font-extrabold uppercase tracking-wider text-blue-200 border border-white/10">
                <span>{{ profil.jenjang === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}</span>
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Aktif Terdaftar</span>
              </span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-white leading-tight break-words tracking-tight">{{ profil.nama }}</h3>
            <p class="text-xs text-blue-100/90 font-medium mt-0.5">{{ profil.kelas || 'Tanpa kelas' }} &bull; Angkatan {{ profil.angkatan || '2026' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Akademik & Ujian Grid -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Data Akademik Ujian</h3>
        </div>
        <span class="text-xs font-semibold text-slate-400">T.A 2026/2027</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <!-- NIS -->
        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <span class="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Nomor Induk Siswa (NIS)</span>
            <b class="text-sm font-mono font-black text-slate-900 mt-0.5 block">{{ profil.nis }}</b>
          </div>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
            @click="salinTeks(profil.nis, 'nis')"
          >
            {{ copiedKey === 'nis' ? '✓ Tersalin' : 'Salin' }}
          </button>
        </div>

        <!-- NISN -->
        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <span class="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">NISN Nasional</span>
            <b class="text-sm font-mono font-black text-slate-900 mt-0.5 block">{{ profil.nisn || '-' }}</b>
          </div>
          <button
            v-if="profil.nisn"
            type="button"
            class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
            @click="salinTeks(profil.nisn, 'nisn')"
          >
            {{ copiedKey === 'nisn' ? '✓ Tersalin' : 'Salin' }}
          </button>
        </div>

        <!-- Token Ujian -->
        <div class="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between gap-3">
          <div>
            <span class="block text-[10.5px] font-bold uppercase tracking-wider text-blue-700">Token Ujian Aktif</span>
            <b class="text-base font-mono font-black text-blue-700 mt-0.5 block tracking-wider">{{ profil.token }}</b>
          </div>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            @click="salinTeks(profil.token, 'token')"
          >
            {{ copiedKey === 'token' ? '✓ Tersalin' : 'Salin Token' }}
          </button>
        </div>

        <!-- Ruang Ujian -->
        <div class="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <span class="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Ruang &amp; Sesi Ujian</span>
            <b class="text-sm font-extrabold text-slate-900 mt-0.5 block">{{ profil.ruang || 'Online (Mandiri)' }}</b>
          </div>
          <span class="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">Terdaftar</span>
        </div>
      </div>
    </div>

    <!-- Biodata Siswa Section -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Biodata Peserta</h3>
      </div>

      <dl class="divide-y divide-slate-100 text-xs sm:text-sm">
        <div v-for="b in biodataList" :key="b.label" class="py-2.5 flex items-start justify-between gap-4">
          <dt class="text-slate-500 font-medium shrink-0">{{ b.label }}</dt>
          <dd class="font-extrabold text-slate-900 text-right break-words">{{ b.nilai || '-' }}</dd>
        </div>
      </dl>

      <!-- Peringatan Keamanan Data Induk -->
      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
        <svg class="w-4 h-4 text-slate-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="leading-relaxed">
          Data NIS, NISN, nama lengkap, dan token ujian terkunci oleh sistem panitia. Jika terdapat ketidaksesuaian data identitas, segera hubungi proktor atau operator sekolah.
        </span>
      </div>
    </div>

    <!-- Tombol Keluar Akun -->
    <button
      type="button"
      class="w-full py-4 px-6 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-black text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
      @click="emit('keluar')"
    >
      <svg class="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      <span>Keluar dari Akun Peserta</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProfilSiswa } from '~/composables/useCbtSiswa'

const props = defineProps<{ profil: ProfilSiswa }>()
const emit = defineEmits<{ (e: 'keluar'): void }>()

const inisial = computed(() => props.profil.nama.split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase())

const tanggalLahir = computed(() => props.profil.tanggalLahir
  ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(props.profil.tanggalLahir))
  : '')

const biodataList = computed(() => [
  { label: 'Nama Lengkap', nilai: props.profil.nama },
  { label: 'Kelas & Jurusan', nilai: props.profil.kelas || 'Belum diatur' },
  { label: 'Jenjang Pendidikan', nilai: props.profil.jenjang === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' },
  { label: 'Jenis Kelamin', nilai: props.profil.gender === 'P' ? 'Perempuan' : 'Laki-laki' },
  { label: 'Tempat, Tanggal Lahir', nilai: [props.profil.tempatLahir, tanggalLahir.value].filter(Boolean).join(', ') },
  { label: 'Agama', nilai: props.profil.agama || '-' },
  { label: 'Tahun Masuk / Angkatan', nilai: props.profil.angkatan ? String(props.profil.angkatan) : '-' }
])

const copiedKey = ref<string | null>(null)
const salinTeks = async (teks: string, key: string) => {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(teks)
      copiedKey.value = key
      setTimeout(() => { copiedKey.value = null }, 2000)
    }
  } catch {}
}
</script>