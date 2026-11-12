<template>
  <div class="space-y-4 antialiased">
    <!-- Header Halaman Rekap Ringkas -->
    <div>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Rekapitulasi Ujian</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Riwayat ujian yang telah kamu ikuti, perolehan nilai, dan catatan integritas.</p>
    </div>

    <!-- State Loading -->
    <div v-if="rekap === null" class="bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-sm">
      <div class="w-8 h-8 border-3 border-merek-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      <p class="text-xs font-bold text-slate-600">Memuat rekapitulasi nilai…</p>
    </div>

    <template v-else>
      <!-- 3 Metrik Kompak (1 Baris di Seluruh Layar, Hemat Ruang & Rapi) -->
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        <!-- Metrik 1: Total Diikuti -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-2xs text-center flex flex-col justify-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Diikuti</span>
          <b class="text-xl sm:text-2xl font-black text-slate-900 tabular-nums my-0.5">{{ rekap.length }}</b>
          <span class="text-[10.5px] font-extrabold text-merek-600">Ujian Tuntas</span>
        </div>

        <!-- Metrik 2: Rata-rata Nilai -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-2xs text-center flex flex-col justify-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Rata-rata</span>
          <b class="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums my-0.5">{{ rataHarian === null ? '-' : rataHarian }}</b>
          <span class="text-[10.5px] font-extrabold text-emerald-700 truncate">
            {{ rataHarian !== null ? (rataHarian >= 85 ? 'Sangat Baik' : rataHarian >= 75 ? 'Kompeten' : 'Cukup') : 'Belum Ada' }}
          </span>
        </div>

        <!-- Metrik 3: Catatan Integritas -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-2xs text-center flex flex-col justify-center">
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Integritas</span>
          <b
            class="text-xl sm:text-2xl font-black tabular-nums my-0.5"
            :class="totalPelanggaran > 0 ? 'text-rose-600' : 'text-slate-900'"
          >
            {{ totalPelanggaran }}
          </b>
          <span
            class="text-[10.5px] font-extrabold truncate"
            :class="totalPelanggaran > 0 ? 'text-rose-700' : 'text-slate-500'"
          >
            {{ totalPelanggaran > 0 ? 'Pelanggaran' : '0 Peringatan' }}
          </span>
        </div>
      </div>

      <!-- Riwayat Ujian Ringkas & Rapi -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Riwayat Ujian</h3>
          <span class="text-xs font-semibold text-slate-400">{{ rekap.length }} Tercatat</span>
        </div>

        <ul v-if="rekap.length" class="space-y-2.5">
          <li
            v-for="r in rekap"
            :key="r.source + r.id"
            class="bg-white border border-slate-200/90 hover:border-merek-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs transition-all duration-200"
          >
            <!-- Baris 1: Kategori, Tanggal & Status Badge -->
            <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-[10px] font-black uppercase tracking-wider text-merek-700 bg-merek-50 px-2 py-0.5 rounded-md">
                    {{ JENIS_LABEL[r.jenis] }}
                  </span>
                  <span class="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{{ tanggalPendek(r.mulai) }}</span>
                  </span>
                </div>
                <h4 class="text-sm sm:text-base font-black text-slate-900 leading-snug break-words">
                  {{ r.mapel || r.nama }}
                </h4>
                <p class="text-[11.5px] font-semibold text-slate-500 break-words mt-0.5">
                  {{ r.nama }}
                </p>
              </div>

              <span
                class="shrink-0 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1"
                :class="statusKelas(r)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="r.statusSiswa === 'selesai' ? 'bg-emerald-500' : r.statusSiswa === 'terkunci' ? 'bg-rose-500' : 'bg-amber-500'" />
                <span>{{ statusLabel(r) }}</span>
              </span>
            </div>

            <!-- Baris 2: Nilai & Pelanggaran Strip Kompak -->
            <div class="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div class="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Nilai</span>
                <div class="flex items-baseline gap-1">
                  <span
                    class="font-black text-base sm:text-lg tabular-nums leading-none"
                    :class="r.menunggu ? 'text-amber-600 text-xs font-bold' : r.nilai !== null && r.nilai >= 75 ? 'text-emerald-600' : 'text-slate-900'"
                  >
                    {{ teksNilai(r) }}
                  </span>
                  <span v-if="!r.menunggu && r.nilai !== null" class="text-[10px] font-semibold text-slate-400">/100</span>
                </div>
              </div>

              <div class="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Pelanggaran</span>
                <span
                  class="font-black text-base sm:text-lg tabular-nums leading-none"
                  :class="r.pelanggaran ? 'text-rose-600' : 'text-emerald-600'"
                >
                  {{ r.pelanggaran }} <span class="text-[10px] font-bold">kali</span>
                </span>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2.5">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3 class="text-sm font-extrabold text-slate-800">Belum Ada Riwayat Ujian</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Nilai dan riwayat ujian akan tercatat otomatis di sini setelah kamu menyelesaikan sesi ujian.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { JENIS_LABEL, tanggalPendek, type RekapUjian } from '~/utils/cbtSiswaJadwal'

const props = defineProps<{ rekap: RekapUjian[] | null }>()

const totalPelanggaran = computed(() => (props.rekap || []).reduce((a, r) => a + r.pelanggaran, 0))
const rataHarian = computed(() => {
  const nilai = (props.rekap || []).filter(r => r.statusSiswa === 'selesai' && r.nilai !== null && !r.menunggu).map(r => r.nilai as number)
  return nilai.length ? Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length * 10) / 10 : null
})

const statusLabel = (r: RekapUjian) => r.statusSiswa === 'selesai' ? 'Selesai' : r.statusSiswa === 'terkunci' ? 'Terkunci' : 'Berjalan'
const statusKelas = (r: RekapUjian) => r.statusSiswa === 'selesai' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : r.statusSiswa === 'terkunci' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-800'
const teksNilai = (r: RekapUjian) => {
  if (r.statusSiswa !== 'selesai') return '-'
  if (r.menunggu) return 'Menunggu Guru'
  return r.nilai === null ? '-' : String(r.nilai)
}
</script>