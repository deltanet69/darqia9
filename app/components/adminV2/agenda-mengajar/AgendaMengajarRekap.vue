<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AgendaRekapRow } from '~/composables/useAgendaMengajar'

const props = defineProps<{
  rows: AgendaRekapRow[]
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  open: [bukuId: string]
  reload: []
}>()

const cari = ref('')
const hanyaBelumIsi = ref(false)

const tampil = computed(() => {
  const kata = cari.value.trim().toLocaleLowerCase('id-ID')
  return props.rows.filter(row =>
    (!hanyaBelumIsi.value || row.pertemuan === 0)
    && (!kata || `${row.guru_nama} ${row.kelas_nama} ${row.mapel_nama}`.toLocaleLowerCase('id-ID').includes(kata)))
})

// Dikelompokkan per guru; urutan mengikuti hasil RPC (nama guru, kelas, mapel).
const perGuru = computed(() => {
  const peta = new Map<string, { id: string; nama: string; rows: AgendaRekapRow[] }>()
  for (const row of tampil.value) {
    const grup = peta.get(row.guru_id) ?? { id: row.guru_id, nama: row.guru_nama, rows: [] }
    grup.rows.push(row)
    peta.set(row.guru_id, grup)
  }
  return [...peta.values()]
})

const ringkasan = computed(() => {
  const berNilai = props.rows.filter(row => row.kehadiran !== null)
  return {
    buku: props.rows.length,
    guru: new Set(props.rows.map(row => row.guru_id)).size,
    belumIsi: props.rows.filter(row => row.pertemuan === 0).length,
    kehadiran: berNilai.length ? Math.round(berNilai.reduce((total, row) => total + (row.kehadiran ?? 0), 0) / berNilai.length * 10) / 10 : null
  }
})

const tanggal = (nilai: string | null) => nilai
  ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${nilai}T00:00:00`))
  : 'Belum diisi'
</script>

<template>
  <div class="space-y-4">
    <section v-if="loading" class="rounded-2xl border border-[#E4E7EC] bg-white p-8 text-center text-xs font-semibold text-[#667085]" aria-live="polite">Memuat rekap agenda seluruh guru…</section>
    <section v-else-if="error" class="rounded-2xl border border-[#F5C6C0] bg-[#FFF8F7] p-6 text-[#B42318]" role="alert">
      <h2 class="text-sm font-extrabold">Rekap agenda belum dapat dibuka</h2>
      <p class="mt-1 text-xs">{{ error }}</p>
      <button type="button" class="mt-3 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2 text-xs font-bold text-[#101828]" @click="emit('reload')">Coba lagi</button>
    </section>

    <template v-else>
      <div class="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div class="rounded-2xl border border-[#E4E7EC] bg-white p-4"><span class="block text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Buku Agenda</span><b class="mt-1 block text-xl text-[#101828]">{{ ringkasan.buku }}</b></div>
        <div class="rounded-2xl border border-[#E4E7EC] bg-white p-4"><span class="block text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Guru</span><b class="mt-1 block text-xl text-[#101828]">{{ ringkasan.guru }}</b></div>
        <div class="rounded-2xl border border-[#E4E7EC] bg-white p-4"><span class="block text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Belum Ada Jurnal</span><b class="mt-1 block text-xl" :class="ringkasan.belumIsi ? 'text-[#B54708]' : 'text-[#101828]'">{{ ringkasan.belumIsi }}</b></div>
        <div class="rounded-2xl border border-[#E4E7EC] bg-white p-4"><span class="block text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Rata-rata Kehadiran</span><b class="mt-1 block text-xl text-[#101828]">{{ ringkasan.kehadiran === null ? '—' : `${ringkasan.kehadiran}%` }}</b></div>
      </div>

      <div class="flex flex-col gap-2.5 sm:flex-row">
        <input v-model="cari" type="search" placeholder="Cari guru, kelas, atau mata pelajaran…" aria-label="Cari guru, kelas, atau mata pelajaran" class="flex-1 rounded-full border border-[#E4E7EC] bg-white px-4 py-2.5 text-xs outline-none focus:border-[#2563EB]">
        <button type="button" class="rounded-full border px-4 py-2.5 text-xs font-extrabold" :class="hanyaBelumIsi ? 'border-[#101828] bg-[#101828] text-white' : 'border-[#E4E7EC] bg-white text-[#667085]'" @click="hanyaBelumIsi = !hanyaBelumIsi">Belum ada jurnal saja</button>
      </div>

      <section v-for="guru in perGuru" :key="guru.id" class="overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-xs">
        <h3 class="flex items-center justify-between gap-2 border-b border-[#E4E7EC] bg-[#F6F8FC] px-4 py-2.5 text-xs font-extrabold text-[#0A2A5C] sm:px-5">
          <span>{{ guru.nama }}</span>
          <span class="font-bold text-[#667085]">{{ guru.rows.length }} buku agenda</span>
        </h3>
        <div class="hidden grid-cols-[minmax(0,1fr)_60px_80px_60px_80px_80px_90px_110px_70px] gap-3 border-b border-[#EFF2F7] px-5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#667085] lg:grid">
          <span>Kelas &amp; Mapel</span><span class="text-center">Siswa</span><span class="text-center">Pertemuan</span><span class="text-center">Tugas</span><span class="text-center">PTS</span><span class="text-center">PAS</span><span class="text-center">Kehadiran</span><span>Terakhir Diisi</span><span class="text-right">Aksi</span>
        </div>
        <ul class="divide-y divide-[#EFF2F7]">
          <li v-for="row in guru.rows" :key="row.buku_id" class="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_60px_80px_60px_80px_80px_90px_110px_70px] lg:items-center lg:gap-3">
            <div class="col-span-2 min-w-0 lg:col-span-1">
              <b class="block break-words text-sm font-extrabold text-[#101828]">{{ row.mapel_nama }}</b>
              <span class="text-[11px] font-semibold text-[#667085]">Kelas {{ row.kelas_nama }}</span>
            </div>
            <span class="text-xs font-bold lg:text-center"><span class="font-medium text-[#667085] lg:hidden">Siswa: </span>{{ row.jumlah_siswa }}</span>
            <span class="text-xs font-bold lg:text-center" :class="row.pertemuan === 0 ? 'text-[#B54708]' : ''"><span class="font-medium text-[#667085] lg:hidden">Pertemuan: </span>{{ row.pertemuan }}</span>
            <span class="text-xs font-bold lg:text-center"><span class="font-medium text-[#667085] lg:hidden">Tugas: </span>{{ row.tugas }}</span>
            <span class="text-xs font-bold lg:text-center"><span class="font-medium text-[#667085] lg:hidden">PTS: </span>{{ row.pts_terisi }}/{{ row.jumlah_siswa }}</span>
            <span class="text-xs font-bold lg:text-center"><span class="font-medium text-[#667085] lg:hidden">PAS: </span>{{ row.pas_terisi }}/{{ row.jumlah_siswa }}</span>
            <span class="text-xs font-bold lg:text-center"><span class="font-medium text-[#667085] lg:hidden">Kehadiran: </span>{{ row.kehadiran === null ? '—' : `${row.kehadiran}%` }}</span>
            <span class="text-xs text-[#344054]"><span class="font-medium text-[#667085] lg:hidden">Terakhir: </span>{{ tanggal(row.terakhir) }}</span>
            <div class="col-span-2 lg:col-span-1 lg:text-right">
              <button type="button" class="text-xs font-bold text-[#2563EB] hover:underline" @click="emit('open', row.buku_id)">Buka Buku</button>
            </div>
          </li>
        </ul>
      </section>

      <div v-if="!perGuru.length" class="rounded-2xl border border-[#E4E7EC] bg-white p-8 text-center text-xs text-[#667085]">Tidak ada buku agenda yang cocok.</div>
    </template>
  </div>
</template>
