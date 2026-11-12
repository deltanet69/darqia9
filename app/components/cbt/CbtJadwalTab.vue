<template>
  <div class="space-y-4 antialiased">
    <!-- Header Halaman Jadwal -->
    <div>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Jadwal Ujian</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Jadwal dapat dilihat kapan saja. Sesi ujian hanya dapat dimulai tepat saat waktu pelaksanaan tiba.</p>
    </div>

    <!-- Tab Switcher PTS / PAS / Harian (3 Kolom Pasti Pas, Anti-Overlapping) -->
    <div class="bg-slate-200/90 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 shadow-inner" role="tablist" aria-label="Kategori jenis ujian">
      <button
        v-for="j in jenisTab"
        :key="j.id"
        type="button"
        role="tab"
        :aria-selected="aktif === j.id"
        class="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-150 text-center cursor-pointer active:scale-95 whitespace-nowrap"
        :class="aktif === j.id ? 'bg-white text-merek-700 shadow-sm border border-slate-200/90' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'"
        @click="aktif = j.id"
      >
        <span>{{ j.label }}</span>
      </button>
    </div>

    <!-- Info Banner H-2 untuk PTS & PAS -->
    <div v-if="aktif === 'tengah_semester' || aktif === 'akhir'" class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
      <div class="w-6 h-6 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <p class="leading-relaxed">
        Detail mata pelajaran dan materi <b>{{ aktif === 'tengah_semester' ? 'PTS' : 'PAS' }}</b> akan terbuka otomatis di sistem mulai <b>2 hari sebelum hari ujian</b>.
      </p>
    </div>

    <!-- Daftar Jadwal Dikelompokkan per Hari -->
    <template v-if="kelompok.length">
      <section
        v-for="hari in kelompok"
        :key="hari.kunci"
        class="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm"
      >
        <!-- Header Hari -->
        <div class="px-5 py-3 bg-gradient-to-r from-slate-50 to-merek-50/40 border-b border-slate-200/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-merek-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h3 class="text-xs sm:text-sm font-black text-slate-900 tracking-tight">{{ hari.label }}</h3>
          </div>
          <span class="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
            {{ hari.ujian.length }} Ujian
          </span>
        </div>

        <!-- List Ujian pada Hari Tersebut -->
        <ul class="divide-y divide-slate-100">
          <li
            v-for="u in hari.ujian"
            :key="u.source + u.id"
            class="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
          >
            <!-- Layout Terstruktur Bebas Overlapping Text -->
            <div class="space-y-2.5" @click="klik(u)">
              <!-- Baris 1: Waktu, Durasi & Status Badge -->
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                    <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{{ jamWib(u.mulai) }} WIB</span>
                  </span>
                  <span class="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {{ u.durasi }} menit
                  </span>
                </div>
                <span
                  class="shrink-0 text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-2xs"
                  :class="KEADAAN_INFO[keadaan(u)].kelas"
                >
                  {{ KEADAAN_INFO[keadaan(u)].label }}
                </span>
              </div>

              <!-- Baris 2: Nama Mata Pelajaran & Materi -->
              <div>
                <h4 class="text-base sm:text-lg font-black text-slate-900 leading-snug break-words">
                  {{ u.mapel || 'Terkunci (Mata Pelajaran Rahasia)' }}
                </h4>
                <p class="text-xs font-semibold text-slate-500 break-words mt-0.5">
                  {{ u.nama || 'Detail materi terbuka pada H-2' }}
                </p>
              </div>
            </div>

            <!-- Baris 3: Tombol Aksi jika Bisa Dibuka -->
            <div v-if="bisaDibuka(keadaan(u))" class="mt-3.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                class="w-full py-2.5 px-4 rounded-xl bg-merek-600 hover:bg-merek-700 text-white font-black text-sm shadow-md shadow-merek-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                @click="emit('buka', u)"
              >
                <span>{{ keadaan(u) === 'berjalan' ? 'Lanjutkan Pengerjaan Ujian' : 'Mulai Masuk Ujian' }}</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-sm">
      <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>
      </div>
      <h3 class="text-base font-extrabold text-slate-800">Belum Ada Jadwal</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Belum ada jadwal {{ labelAktif }} yang diterbitkan oleh panitia ujian untuk kelasmu.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  KEADAAN_INFO, bisaDibuka, jamWib, kelompokPerHari, keadaanUjian,
  type JenisUjian, type UjianSiswa
} from '~/utils/cbtSiswaJadwal'

const props = defineProps<{ ujian: UjianSiswa[], now: number }>()
const emit = defineEmits<{ (e: 'buka', u: UjianSiswa): void }>()

// Menu dipersingkat sesuai instruksi: PTS / PAS / Harian
const jenisTab: Array<{ id: JenisUjian; label: string }> = [
  { id: 'tengah_semester', label: 'PTS' },
  { id: 'akhir', label: 'PAS' },
  { id: 'harian', label: 'Harian' }
]

// Tab awal: jenis yang pertama kali memiliki jadwal, atau default ke PTS.
const aktif = ref<JenisUjian>(jenisTab.find(j => props.ujian.some(u => u.jenis === j.id))?.id ?? 'tengah_semester')

const labelAktif = computed(() => jenisTab.find(j => j.id === aktif.value)?.label ?? 'ujian')

const keadaan = (u: UjianSiswa) => keadaanUjian(u, props.now)
// Ujian yang sudah bisa dimulai hanya dimasuki lewat tombolnya; sentuhan pada jadwal lain memunculkan pemberitahuan.
const klik = (u: UjianSiswa) => { if (!bisaDibuka(keadaan(u))) emit('buka', u) }
const kelompok = computed(() => kelompokPerHari(props.ujian.filter(u => u.jenis === aktif.value)))
</script>