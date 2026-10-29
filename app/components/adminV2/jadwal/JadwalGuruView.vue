<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import JadwalTimetable from './JadwalTimetable.vue'
import type { JadwalEntri, JadwalGuru, JadwalKelas, JadwalMapel, SesiHariIni, SlotJam } from '~/composables/useJadwalPelajaran'

const props = defineProps<{
  guruList: JadwalGuru[]
  entriList: JadwalEntri[]
  mapelMap: Record<string, JadwalMapel>
  kelasMap: Record<string, JadwalKelas>
  slots: SlotJam[]
  sesiMap: Record<string, SesiHariIni>
  hariIni: number | null
  jamBerjalanKe: number | null
  jenjang: 'SMP' | 'SMK'
}>()

const guruDipilih = ref('')
watch(() => props.guruList, (daftar) => {
  if (!daftar.some(g => g.id === guruDipilih.value)) guruDipilih.value = daftar[0]?.id ?? ''
}, { immediate: true })

const grupGuru = computed(() => {
  const label: Record<string, string> = { SMK: 'Guru SMK', SMP: 'Guru SMP', Yayasan: 'Guru Yayasan' }
  return ['SMK', 'SMP', 'Yayasan']
    .map(u => ({ unit: u, label: label[u], guru: props.guruList.filter(g => g.unit === u) }))
    .filter(g => g.guru.length)
})

const entriGuru = computed(() => props.entriList.filter(j => j.teacherId === guruDipilih.value))
const ringkasan = computed(() => {
  const daftar = entriGuru.value
  if (!daftar.length) return `Tidak memiliki jadwal mengajar di ${props.jenjang}`
  const totalJP = daftar.reduce((a, j) => a + (j.mulaiKe !== null && j.selesaiKe !== null ? j.selesaiKe - j.mulaiKe + 1 : 0), 0)
  const kelas = [...new Set(daftar.map(j => props.kelasMap[j.classId]?.name).filter(Boolean))]
  const mapel = [...new Set(daftar.map(j => props.mapelMap[j.subjectId]?.name).filter(Boolean))]
  return `Mengampu ${mapel.join(', ')} · Total beban ${totalJP} JP/minggu · Mengajar di: ${kelas.join(', ')}`
})
</script>

<template>
  <div>
    <div class="mt-5 flex flex-wrap items-center gap-3">
      <label class="text-[13px] text-slate-600" for="jg-guru">Jadwal milik guru:</label>
      <select id="jg-guru" v-model="guruDipilih" class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] font-medium text-blue-950 min-w-[260px]">
        <optgroup v-for="g in grupGuru" :key="g.unit" :label="g.label">
          <option v-for="t in g.guru" :key="t.id" :value="t.id">{{ t.name }}</option>
        </optgroup>
      </select>
      <span class="text-[12.5px] text-slate-500">{{ ringkasan }}</span>
    </div>
    <div class="mt-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <JadwalTimetable
        :slots="slots" :daftar="entriGuru" :mapel-map="mapelMap" :guru-map="{}" :kelas-map="kelasMap"
        :sesi-map="sesiMap" :hari-ini="hariIni" :jam-berjalan-ke="jamBerjalanKe" mode-guru readonly
      />
    </div>
    <p class="text-[12px] text-slate-400 mt-2">Pandangan baca-saja. Perubahan jadwal dilakukan dari mode Per Kelas; guru melihat jadwal finalnya di halaman Jadwal Mengajar miliknya.</p>
  </div>
</template>
