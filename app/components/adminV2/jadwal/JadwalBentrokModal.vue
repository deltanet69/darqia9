<script setup lang="ts">
import { computed } from 'vue'
import { HARI_NAMA, type JadwalEntri, type JadwalGuru, type JadwalKelas, type JadwalMapel, type RincianBentrok } from '~/composables/useJadwalPelajaran'

const props = defineProps<{
  open: boolean
  items: RincianBentrok[]
  kelasMap: Record<string, JadwalKelas>
  mapelMap: Record<string, JadwalMapel>
  guruMap: Record<string, JadwalGuru>
  bolehUbah: boolean
}>()
const emit = defineEmits<{ tutup: []; ubah: [entri: JadwalEntri] }>()

const JENIS = {
  kelas: { judul: 'Kelas ganda', bantu: 'Dua jadwal menempati jam yang sama di kelas yang sama. Hapus atau geser salah satunya.', warna: 'bg-red-50 text-red-700 border-red-100' },
  guru: { judul: 'Guru bentrok', bantu: 'Guru yang sama mengajar dua mapel/jam berbeda yang beririsan. Ganti guru atau geser jamnya.', warna: 'bg-amber-50 text-amber-700 border-amber-100' },
  ruangan: { judul: 'Ruangan bentrok', bantu: 'Ruangan yang sama dipakai dua kelas pada jam yang beririsan. Pilih ruangan lain atau geser jamnya.', warna: 'bg-violet-50 text-violet-700 border-violet-100' }
} as const

const namaKelas = (id: string) => props.kelasMap[id]?.name ?? '—'
const namaMapel = (id: string) => props.mapelMap[id]?.name ?? '—'
const namaGuru = (id: string) => (id ? props.guruMap[id]?.name : '') || 'Belum ada guru'
const rincian = (e: JadwalEntri) => `${namaMapel(e.subjectId)} · ${namaKelas(e.classId)} · ${namaGuru(e.teacherId)} · ${e.startsAt}–${e.endsAt}${e.room ? ' · ' + e.room : ''}`
const ringkas = computed(() => ({
  kelas: props.items.filter(i => i.jenis === 'kelas').length,
  guru: props.items.filter(i => i.jenis === 'guru').length,
  ruangan: props.items.filter(i => i.jenis === 'ruangan').length
}))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Detail bentrok jadwal" @keydown.esc="emit('tutup')">
      <div class="absolute inset-0 bg-blue-950/50" @click="emit('tutup')" />
      <div class="relative flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h3 class="text-[16px] font-semibold text-blue-950">Detail bentrok jadwal</h3>
            <p class="mt-0.5 text-[12.5px] text-slate-500">
              {{ items.length }} bentrok ditemukan
              <template v-if="ringkas.kelas"> · {{ ringkas.kelas }} kelas ganda</template>
              <template v-if="ringkas.guru"> · {{ ringkas.guru }} guru</template>
              <template v-if="ringkas.ruangan"> · {{ ringkas.ruangan }} ruangan</template>
            </p>
          </div>
          <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Tutup" @click="emit('tutup')">✕</button>
        </div>

        <ul class="space-y-3 overflow-y-auto p-5">
          <li v-for="b in items" :key="b.kunci" class="rounded-xl border border-slate-200 p-3.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" :class="JENIS[b.jenis].warna">{{ JENIS[b.jenis].judul }}</span>
              <span class="text-[12.5px] font-semibold text-blue-950">{{ HARI_NAMA[b.a.day] }}</span>
            </div>
            <div class="mt-2.5 space-y-1.5 text-[12.5px] text-slate-700">
              <div class="flex items-start justify-between gap-3">
                <p class="min-w-0 break-words"><b class="text-blue-950">Jadwal 1:</b> {{ rincian(b.a) }}</p>
                <button v-if="bolehUbah" type="button" class="min-h-9 shrink-0 text-[12px] font-semibold text-blue-700 hover:underline" @click="emit('ubah', b.a)">Ubah</button>
              </div>
              <div class="flex items-start justify-between gap-3">
                <p class="min-w-0 break-words"><b class="text-blue-950">Jadwal 2:</b> {{ rincian(b.b) }}</p>
                <button v-if="bolehUbah" type="button" class="min-h-9 shrink-0 text-[12px] font-semibold text-blue-700 hover:underline" @click="emit('ubah', b.b)">Ubah</button>
              </div>
            </div>
            <p class="mt-2 text-[12px] text-slate-500">{{ JENIS[b.jenis].bantu }}</p>
          </li>
          <li v-if="!items.length" class="py-6 text-center text-[13px] text-slate-500">Tidak ada bentrok.</li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
