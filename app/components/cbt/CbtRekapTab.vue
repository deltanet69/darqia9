<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Rekap Ujian</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Ujian yang sudah kamu ikuti, nilai, dan jumlah pelanggaran di setiap ujian.</p>
    </div>

    <div v-if="rekap === null" class="bg-white border-2 border-slate-200/90 rounded-3xl p-8 text-center text-sm text-slate-500">Memuat rekap…</div>

    <template v-else>
      <div class="grid grid-cols-3 gap-2.5">
        <div class="bg-white border-2 border-slate-200/90 rounded-2xl p-3.5">
          <span class="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Diikuti</span>
          <b class="block text-xl font-black text-slate-900 tabular-nums mt-1">{{ rekap.length }}</b>
        </div>
        <div class="bg-white border-2 border-slate-200/90 rounded-2xl p-3.5">
          <span class="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Rata-rata Nilai</span>
          <b class="block text-xl font-black text-slate-900 tabular-nums mt-1">{{ rataHarian === null ? '-' : rataHarian }}</b>
        </div>
        <div class="bg-white border-2 border-slate-200/90 rounded-2xl p-3.5">
          <span class="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Pelanggaran</span>
          <b class="block text-xl font-black tabular-nums mt-1" :class="totalPelanggaran ? 'text-rose-600' : 'text-slate-900'">{{ totalPelanggaran }}</b>
        </div>
      </div>

      <ul v-if="rekap.length" class="space-y-2.5">
        <li v-for="r in rekap" :key="r.source + r.id" class="bg-white border-2 border-slate-200/90 rounded-3xl p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-[11px] font-bold text-blue-600">{{ JENIS_LABEL[r.jenis] }}</div>
              <div class="font-extrabold text-slate-900 break-words">{{ r.mapel || r.nama }}</div>
              <div class="text-xs text-slate-500 break-words">{{ r.nama }} &bull; {{ tanggalPendek(r.mulai) }}</div>
            </div>
            <span class="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full" :class="statusKelas(r)">{{ statusLabel(r) }}</span>
          </div>
          <dl class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt class="text-slate-400">Nilai</dt>
              <dd class="font-extrabold text-slate-900 mt-0.5">{{ teksNilai(r) }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Pelanggaran</dt>
              <dd class="font-extrabold mt-0.5" :class="r.pelanggaran ? 'text-rose-600' : 'text-slate-900'">{{ r.pelanggaran }} kali</dd>
            </div>
          </dl>
        </li>
      </ul>
      <div v-else class="bg-white border-2 border-slate-200/90 rounded-3xl p-8 text-center text-sm text-slate-500">Kamu belum mengikuti ujian apa pun.</div>
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

const statusLabel = (r: RekapUjian) => r.statusSiswa === 'selesai' ? 'Selesai' : r.statusSiswa === 'terkunci' ? 'Akun terkunci' : 'Sedang dikerjakan'
const statusKelas = (r: RekapUjian) => r.statusSiswa === 'selesai' ? 'bg-emerald-50 text-emerald-700' : r.statusSiswa === 'terkunci' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
const teksNilai = (r: RekapUjian) => {
  if (r.statusSiswa !== 'selesai') return '-'
  if (r.menunggu) return 'Menunggu penilaian guru'
  return r.nilai === null ? '-' : String(r.nilai)
}
</script>
