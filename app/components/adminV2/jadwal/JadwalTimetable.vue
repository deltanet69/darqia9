<script setup lang="ts">
import { computed } from 'vue'
import {
  HARI_NAMA,
  type JadwalEntri, type JadwalGuru, type JadwalKelas, type JadwalMapel, type SesiHariIni, type SlotJam
} from '~/composables/useJadwalPelajaran'

// Timetable digambar sebagai CSS grid murni (bukan tabel rowspan) agar tinggi
// setiap baris jam terkunci dan setiap jadwal mulai/berakhir tepat di garisnya.
const props = defineProps<{
  slots: SlotJam[]
  daftar: JadwalEntri[]
  mapelMap: Record<string, JadwalMapel>
  guruMap: Record<string, JadwalGuru>
  kelasMap: Record<string, JadwalKelas>
  sesiMap: Record<string, SesiHariIni>
  hariIni: number | null
  jamBerjalanKe: number | null
  modeGuru?: boolean
  readonly?: boolean
}>()
const emit = defineEmits<{
  tambah: [day: number, ke: number]
  ubah: [entri: JadwalEntri]
}>()

interface Sel {
  key: string
  row: number
  col: number
  span: number
  jenis: 'labelJam' | 'labelIstirahat' | 'pitaIstirahat' | 'entri' | 'kosong'
  slot?: SlotJam
  entri?: JadwalEntri
  day?: number
}

const indeksBaris = computed(() => {
  const peta: Record<number, number> = {}
  props.slots.forEach((s, i) => { if (s.ke) peta[s.ke] = i + 2 })
  return peta
})

const gayaGrid = computed(() => ({
  gridTemplateColumns: '108px repeat(5, minmax(0, 1fr))',
  gridTemplateRows: `auto ${props.slots.map(s => s.jenis === 'istirahat' ? '34px' : '78px').join(' ')}`
}))

const selList = computed<Sel[]>(() => {
  const hasil: Sel[] = []
  props.slots.forEach((slot, i) => {
    const row = i + 2
    if (slot.jenis === 'istirahat') {
      hasil.push({ key: `li-${i}`, row, col: 1, span: 1, jenis: 'labelIstirahat', slot })
      hasil.push({ key: `pi-${i}`, row, col: 2, span: 1, jenis: 'pitaIstirahat', slot })
    } else {
      hasil.push({ key: `lj-${slot.ke}`, row, col: 1, span: 1, jenis: 'labelJam', slot })
    }
  })
  for (let day = 1; day <= 5; day++) {
    const col = day + 1
    const terisi = new Set<number>()
    const milik = props.daftar.filter(j => j.day === day && j.mulaiKe !== null)
    milik.forEach(j => { for (let k = j.mulaiKe!; k <= j.selesaiKe!; k++) terisi.add(k) })
    milik.forEach(j => {
      hasil.push({
        key: `e-${j.id}`, row: indeksBaris.value[j.mulaiKe!], col, span: j.selesaiKe! - j.mulaiKe! + 1,
        jenis: 'entri', entri: j, day
      })
    })
    props.slots.filter(s => s.jenis === 'jam' && s.ke && !terisi.has(s.ke)).forEach(slot => {
      hasil.push({ key: `k-${day}-${slot.ke}`, row: indeksBaris.value[slot.ke!], col, span: 1, jenis: 'kosong', slot, day })
    })
  }
  return hasil
})

const barisKedua = (j: JadwalEntri): string => {
  if (props.modeGuru) return `${props.kelasMap[j.classId]?.name ?? '—'} · ${j.room || '—'}`
  return `${props.guruMap[j.teacherId]?.name.split(',')[0] ?? 'Belum ada guru'} · ${j.room || '—'}`
}
const jamTeks = (j: JadwalEntri): string =>
  `${j.startsAt}–${j.endsAt} · ${j.mulaiKe !== null && j.selesaiKe !== null ? j.selesaiKe - j.mulaiKe + 1 : '?'} JP`
const sedangLive = (j: JadwalEntri): boolean =>
  props.hariIni !== null && j.day === props.hariIni && props.jamBerjalanKe !== null &&
  j.mulaiKe !== null && j.mulaiKe <= props.jamBerjalanKe && props.jamBerjalanKe <= (j.selesaiKe ?? -1)

const chipSesi = (j: JadwalEntri): { teks: string; kelas: string } | null => {
  if (props.hariIni === null || j.day !== props.hariIni) return null
  const s = props.sesiMap[j.id]
  if (!s) return { teks: 'Belum mulai', kelas: 'text-slate-400 bg-slate-50 border-slate-100 font-medium' }
  if (s.status === 'selesai') return { teks: `✓ Selesai · ${s.startedAt ?? ''}–${s.endedAt ?? ''}`, kelas: 'text-emerald-700 bg-emerald-50 border-emerald-100 font-semibold' }
  if (s.status === 'berlangsung') return { teks: `Sedang mengajar · sejak ${s.startedAt ?? ''}`, kelas: 'text-blue-700 bg-blue-50 border-blue-100 font-semibold' }
  if (s.status === 'tidak_hadir') return { teks: 'Tidak hadir mengajar', kelas: 'text-red-600 bg-red-50 border-red-100 font-semibold' }
  return { teks: 'Belum mulai', kelas: 'text-slate-400 bg-slate-50 border-slate-100 font-medium' }
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="grid w-full min-w-[900px]" :style="gayaGrid">
      <div class="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-100">Jam</div>
      <div v-for="day in 5" :key="`h-${day}`" class="px-3 py-2.5 text-[12px] font-semibold text-slate-600 bg-slate-50 border-b border-l border-slate-100">
        {{ HARI_NAMA[day] }}
        <span v-if="day === hariIni" class="ml-1 text-[10px] font-semibold text-blue-700 bg-blue-100 rounded px-1.5 py-0.5 align-middle">HARI INI</span>
      </div>

      <template v-for="sel in selList" :key="sel.key">
        <div v-if="sel.jenis === 'labelJam'" class="px-3 py-2 border-b" :class="sel.slot!.ke === jamBerjalanKe ? 'border-blue-200 bg-blue-100/70' : 'border-slate-100 bg-slate-50/50'" :style="{ gridRow: sel.row, gridColumn: sel.col }">
          <div class="text-[12px] font-semibold" :class="sel.slot!.ke === jamBerjalanKe ? 'text-blue-900' : 'text-slate-600'">Jam {{ sel.slot!.ke }}</div>
          <div class="text-[11px] whitespace-nowrap" :class="sel.slot!.ke === jamBerjalanKe ? 'text-blue-500' : 'text-slate-400'">{{ sel.slot!.mulai }}–{{ sel.slot!.selesai }}</div>
          <div v-if="sel.slot!.ke === jamBerjalanKe" class="mt-1.5">
            <span class="inline-flex items-center gap-1 text-[9px] font-semibold text-white bg-blue-600 rounded px-1 py-0.5 whitespace-nowrap"><span class="w-1 h-1 rounded-full bg-white animate-pulse" />BERLANGSUNG</span>
          </div>
        </div>

        <div v-else-if="sel.jenis === 'labelIstirahat'" class="px-3 flex items-center border-b border-slate-100 bg-slate-50/70 text-[11px] text-slate-400 whitespace-nowrap" :style="{ gridRow: sel.row, gridColumn: sel.col }">
          {{ sel.slot!.mulai }}–{{ sel.slot!.selesai }}
        </div>
        <div v-else-if="sel.jenis === 'pitaIstirahat'" class="px-3 flex items-center border-b border-l border-slate-100 bg-slate-50/70 text-[11.5px] text-slate-400" :style="{ gridRow: sel.row, gridColumn: '2 / -1' }">
          {{ sel.slot!.label }}
        </div>

        <div v-else-if="sel.jenis === 'entri'" class="border-l border-b border-slate-100 p-1.5" :style="{ gridRow: `${sel.row} / span ${sel.span}`, gridColumn: sel.col }">
          <div
            class="rounded-lg px-2.5 py-2 h-full overflow-hidden border transition"
            :class="[
              sedangLive(sel.entri!) ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-100 bg-[#F8FAFD]',
              readonly ? '' : 'cursor-pointer hover:border-blue-300'
            ]"
            @click="!readonly && emit('ubah', sel.entri!)"
          >
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: mapelMap[sel.entri!.subjectId]?.warna ?? '#94A3B8' }" />
              <span class="text-[12.5px] font-semibold text-blue-950 leading-4">{{ mapelMap[sel.entri!.subjectId]?.name ?? '—' }}</span>
            </div>
            <div class="text-[11px] font-medium text-slate-400 mt-1">{{ jamTeks(sel.entri!) }}</div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 leading-4">{{ barisKedua(sel.entri!) }}</div>
            <div v-if="sel.entri!.notes" class="text-[11px] text-slate-400 leading-4">{{ sel.entri!.notes }}</div>
            <div v-if="chipSesi(sel.entri!)" class="mt-1.5">
              <span class="inline-flex items-center gap-1 text-[10.5px] border rounded px-1.5 py-0.5 whitespace-nowrap" :class="chipSesi(sel.entri!)!.kelas">
                <span v-if="sesiMap[sel.entri!.id]?.status === 'berlangsung'" class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {{ chipSesi(sel.entri!)!.teks }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="border-l border-b p-1.5" :class="sel.slot!.ke === jamBerjalanKe ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100'" :style="{ gridRow: sel.row, gridColumn: sel.col }">
          <button v-if="!readonly" type="button" class="w-full h-full rounded-lg text-slate-200 hover:text-blue-500 hover:bg-blue-50/60 transition text-[15px]" aria-label="Tambah jadwal" @click="emit('tambah', sel.day!, sel.slot!.ke!)">+</button>
        </div>
      </template>
    </div>
  </div>
</template>
