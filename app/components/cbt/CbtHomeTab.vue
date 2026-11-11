<template>
  <div class="space-y-5 antialiased">
    <!-- Header Sapaan -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pt-1">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-2">
          <svg class="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{{ hariIni }}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Halo, {{ namaDepan }} 👋</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Siapkan dirimu dengan baik. Ujian dapat dimulai tepat pada jam yang telah dijadwalkan.</p>
      </div>
    </div>

    <!-- Kartu Peserta Ujian Modern & Mewah -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08152B] via-[#0E2754] to-[#163673] p-5 sm:p-6 text-white shadow-xl shadow-blue-950/20 border border-white/10">
      <!-- Decorative Glow -->
      <div class="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <!-- Profile Header -->
      <div class="flex items-start sm:items-center gap-4 mb-5 relative z-10">
        <div class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 ring-2 ring-white/20">
          {{ inisial }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-200 border border-white/10 mb-1">
            <span>Kartu Peserta Ujian</span>
          </div>
          <h3 class="text-lg sm:text-xl font-black text-white leading-tight break-words tracking-tight">{{ profil.nama }}</h3>
          <p class="text-xs text-blue-100/90 font-medium mt-0.5">NIS <b class="font-mono text-white font-bold">{{ profil.nis }}</b> &bull; {{ profil.kelas || 'Tanpa kelas' }}</p>
        </div>
      </div>

      <!-- Quick Info Grid (Token, Ruang, Jenjang) -->
      <div class="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 relative z-10 text-center">
        <!-- Token Ujian -->
        <div class="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-white/10 transition-all flex flex-col justify-between">
          <span class="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">Token Ujian</span>
          <div class="my-1 flex items-center justify-center gap-1">
            <span class="text-sky-300 font-mono font-black text-xs sm:text-sm tracking-wider break-all">{{ profil.token }}</span>
          </div>
          <button
            type="button"
            class="text-[10px] font-bold text-white/80 hover:text-white underline decoration-white/40 cursor-pointer"
            @click="salinToken"
          >
            {{ tokenDisalin ? '✓ Tersalin' : 'Salin Token' }}
          </button>
        </div>

        <!-- Ruang Ujian -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-white/10 flex flex-col justify-between">
          <span class="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">Ruang Ujian</span>
          <b class="text-white font-black text-xs sm:text-sm block my-1 break-words leading-tight">{{ profil.ruang || 'Online' }}</b>
          <span class="text-[10px] font-medium text-slate-300">Sesi Terdaftar</span>
        </div>

        <!-- Jenjang -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-white/10 flex flex-col justify-between">
          <span class="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">Jenjang</span>
          <b class="text-white font-black text-xs sm:text-sm block my-1">{{ profil.jenjang }}</b>
          <span class="text-[10px] font-medium text-slate-300">T.A 2026/2027</span>
        </div>
      </div>
    </div>

    <!-- Informasi Ujian Aktif / Terdekat -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Informasi Ujian</h3>
        </div>
        <span
          v-if="utama"
          class="text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xs border"
          :class="KEADAAN_INFO[keadaan(utama)].kelas"
        >
          {{ KEADAAN_INFO[keadaan(utama)].label }}
        </span>
      </div>

      <dl v-if="utama" class="space-y-3.5 text-sm">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="min-w-0 flex-1">
            <dt class="text-xs font-bold text-slate-400">Mata Pelajaran</dt>
            <dd class="text-base font-black text-slate-900 leading-snug break-words">{{ utama.mapel || 'Dirahasiakan sampai H-2' }}</dd>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="min-w-0 flex-1">
            <dt class="text-xs font-bold text-slate-400">Materi Ujian</dt>
            <dd class="text-sm font-extrabold text-slate-800 leading-snug break-words">{{ utama.nama || '-' }}</dd>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="min-w-0 flex-1">
            <dt class="text-xs font-bold text-slate-400">Jadwal &amp; Durasi</dt>
            <dd class="text-sm font-extrabold text-slate-800 leading-snug">
              {{ hariPanjang(utama.mulai) }}, {{ jamRentang(utama.mulai, utama.durasi) }} WIB
              <span class="inline-block ml-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {{ utama.durasi }} menit
              </span>
            </dd>
          </div>
        </div>
      </dl>
      <div v-else class="text-center py-6 text-sm text-slate-500 font-medium">
        Belum ada ujian yang dijadwalkan untukmu saat ini.
      </div>

      <!-- Banner Autosave Integritas -->
      <div class="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        </div>
        <span class="leading-relaxed">
          Jawaban ujian <b>tersimpan otomatis setiap 10 detik</b> ke server dan tetap aman walau halaman dimuat ulang.
        </span>
      </div>
    </div>

    <!-- Ujian yang Akan Datang -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Ujian yang Akan Datang</h3>
        <span v-if="akanDatang.length" class="text-xs font-bold text-slate-400">{{ akanDatang.length }} Terjadwal</span>
      </div>

      <ul v-if="akanDatang.length" class="space-y-3">
        <li
          v-for="u in akanDatang"
          :key="u.source + u.id"
          class="border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-sm bg-white"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <span class="inline-block text-[10.5px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-1">
                {{ JENIS_LABEL[u.jenis] }}
              </span>
              <h4 class="text-base font-black text-slate-900 leading-snug break-words">{{ u.mapel || 'Detail dibuka H-2' }}</h4>
              <p class="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{{ hariPanjang(u.mulai) }}</span>
                <span>&bull;</span>
                <span class="tabular-nums font-bold text-slate-700">{{ jamRentang(u.mulai, u.durasi) }} WIB</span>
                <span class="text-[11px] text-slate-400">({{ u.durasi }} mnt)</span>
              </p>
            </div>
            <span
              class="shrink-0 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs border"
              :class="KEADAAN_INFO[keadaan(u)].kelas"
            >
              {{ KEADAAN_INFO[keadaan(u)].label }}
            </span>
          </div>

          <!-- Tombol Aksi Masuk Ujian / Hitung Mundur -->
          <div class="mt-3.5 pt-3 border-t border-slate-100">
            <button
              v-if="bisaDibuka(keadaan(u))"
              type="button"
              class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              @click="emit('buka', u)"
            >
              <span>{{ keadaan(u) === 'berjalan' ? 'Lanjutkan Pengerjaan' : 'Masuk Sesi Ujian' }}</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <div v-else-if="keadaan(u) !== 'lewat' && keadaan(u) !== 'akun-terkunci'" class="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Sesi dibuka dalam:</span>
              </span>
              <b class="text-blue-700 font-mono font-bold tabular-nums bg-blue-50 px-2 py-0.5 rounded-md">{{ hitungMundur(u.mulai, now) }}</b>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="text-center py-6 text-sm text-slate-500 font-medium">
        Tidak ada ujian yang akan datang dalam waktu dekat.
      </div>
    </div>

    <!-- Tata Tertib Ujian Card Grid Interaktif -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Tata Tertib &amp; Integritas Ujian</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div class="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="min-w-0">
            <b class="block font-bold text-slate-900 mb-0.5">Tepat Waktu</b>
            <span class="text-slate-600 leading-relaxed">Durasi ujian berjalan sesuai jadwal sistem dan tidak dapat diperpanjang.</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          </div>
          <div class="min-w-0">
            <b class="block font-bold text-slate-900 mb-0.5">Koneksi &amp; Baterai</b>
            <span class="text-slate-600 leading-relaxed">Pastikan internet stabil dan baterai perangkat cukup selama ujian berlangsung.</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div class="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="min-w-0">
            <b class="block font-bold text-slate-900 mb-0.5">Mandiri &amp; Jujur</b>
            <span class="text-slate-600 leading-relaxed">Dilarang membuka catatan, tab lain, atau aplikasi kecurangan apa pun.</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3">
          <div class="w-7 h-7 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="min-w-0">
            <b class="block font-bold text-rose-900 mb-0.5">Sanksi Pelanggaran</b>
            <span class="text-rose-700 leading-relaxed">Pelanggaran ke-3 mengunci akun total dan nilai ujian dibatalkan.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProfilSiswa } from '~/composables/useCbtSiswa'
import {
  JENIS_LABEL, KEADAAN_INFO, bisaDibuka, hariPanjang, hitungMundur, jamRentang, keadaanUjian,
  type UjianSiswa
} from '~/utils/cbtSiswaJadwal'

const props = defineProps<{ profil: ProfilSiswa, ujian: UjianSiswa[], now: number }>()
const emit = defineEmits<{ (e: 'buka', u: UjianSiswa): void }>()

const keadaan = (u: UjianSiswa) => keadaanUjian(u, props.now)
const namaDepan = computed(() => props.profil.nama.split(' ')[0])
const inisial = computed(() => props.profil.nama.split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase())
const hariIni = computed(() => hariPanjang(new Date(props.now).toISOString()))

// Yang masih bisa/akan dikerjakan, urut waktu mulai.
const akanDatang = computed(() => props.ujian
  .filter(u => ['terkunci', 'belum', 'dibuka', 'berjalan'].includes(keadaan(u)))
  .sort((a, b) => a.mulai.localeCompare(b.mulai))
  .slice(0, 6))

// Kartu informasi: yang sedang berjalan/dapat dimulai didahulukan, lalu yang paling dekat.
const utama = computed(() => akanDatang.value.find(u => keadaan(u) === 'berjalan')
  ?? akanDatang.value.find(u => keadaan(u) === 'dibuka')
  ?? akanDatang.value[0] ?? null)

const tokenDisalin = ref(false)
const salinToken = async () => {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(props.profil.token)
      tokenDisalin.value = true
      setTimeout(() => { tokenDisalin.value = false }, 2000)
    }
  } catch {}
}
</script>