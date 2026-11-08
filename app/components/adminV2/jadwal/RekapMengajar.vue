<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { hitungKejadian, useJadwalPelajaran } from '~/composables/useJadwalPelajaran'
import { useAdminGrade } from '~/composables/useAdminGrade'

// Rekap Mengajar — tab di halaman Absensi Guru. Sumber: jadwal resmi
// (class_schedules) + sesi harian (teaching_sessions) yang ditulis guru lewat
// tombol Mulai/Selesai Mengajar di Jadwal Mengajar.
const grade = useAdminGrade()
const store = useJadwalPelajaran()
const client = useSupabaseClient()

const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const opsiBulan = computed(() => {
  const hasil: { nilai: string; label: string }[] = []
  const d = new Date()
  for (let i = 0; i < 3; i++) {
    const t = new Date(d.getFullYear(), d.getMonth() - i, 1)
    hasil.push({
      nilai: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`,
      label: `${BULAN_ID[t.getMonth()]} ${t.getFullYear()}`
    })
  }
  return hasil
})
const bulanDipilih = ref('')
const sesiBulan = ref<{ teacher_id: string; schedule_id: string; session_date: string; started_at: string | null; status: string }[]>([])
const sesiTersedia = ref(true)
const memuat = ref(false)

const fmtTgl = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const rentangBulan = computed(() => {
  const [y, m] = (bulanDipilih.value || opsiBulan.value[0]?.nilai || '').split('-').map(Number)
  const awal = new Date(y, (m || 1) - 1, 1)
  const akhir = new Date(y, m || 1, 0)
  const hariIni = fmtTgl(new Date())
  const kemarinDate = new Date(); kemarinDate.setDate(kemarinDate.getDate() - 1)
  const kemarin = fmtTgl(kemarinDate)
  const potong = (d: Date) => fmtTgl(d)
  return {
    awal: potong(awal),
    akhir: potong(akhir),
    sampaiTampil: potong(akhir) < hariIni ? potong(akhir) : hariIni,
    sampaiKemarin: potong(akhir) < kemarin ? potong(akhir) : kemarin
  }
})

const muatSesi = async () => {
  const { awal, akhir } = rentangBulan.value
  const { data, error } = await client
    .from('teaching_sessions')
    .select('teacher_id, schedule_id, session_date, started_at, status')
    .gte('session_date', awal)
    .lte('session_date', akhir)
  if (error) { sesiTersedia.value = false; sesiBulan.value = []; return }
  sesiTersedia.value = true
  sesiBulan.value = data ?? []
}

const barisRekap = computed(() => store.guruList.value
  .filter(g => g.unit === grade.value || g.unit === 'Yayasan' || store.entriList.value.some(j => j.teacherId === g.id))
  .map(g => {
  const entriGuru = store.entriList.value.filter(j => j.teacherId === g.id)
  const { awal, sampaiTampil, sampaiKemarin } = rentangBulan.value
  const terjadwal = entriGuru.reduce((a, j) => a + hitungKejadian(j.day, awal, sampaiTampil), 0)
  const terjadwalLewat = entriGuru.reduce((a, j) => a + hitungKejadian(j.day, awal, sampaiKemarin), 0)
  const sesiGuru = sesiBulan.value.filter(s => s.teacher_id === g.id)
  const durasiSesi = (scheduleId: string) => {
    const j = entriGuru.find(e => e.id === scheduleId)
    if (!j || j.mulaiKe === null || j.selesaiKe === null) return 0
    return j.selesaiKe - j.mulaiKe + 1
  }
  const dimulai = sesiGuru.filter(s => s.started_at).length
  const dimulaiLewat = sesiGuru.filter(s => s.started_at && s.session_date <= sampaiKemarin).length
  const jp = sesiGuru.filter(s => s.started_at).reduce((a, s) => a + durasiSesi(s.schedule_id), 0)
  const tidak = Math.max(0, terjadwalLewat - dimulaiLewat)
  const persen = terjadwalLewat > 0 ? Math.round((dimulaiLewat / terjadwalLewat) * 100) : 100
  return { guru: g, terjadwal, mengajar: dimulai, tidak, jp, persen }
}).filter(r => r.terjadwal > 0 || r.mengajar > 0))

const ringkasan = computed(() => {
  const totalJ = barisRekap.value.reduce((a, r) => a + r.terjadwal, 0)
  const totalM = barisRekap.value.reduce((a, r) => a + r.mengajar, 0)
  return { totalJ, totalM, persen: totalJ ? Math.round((totalM / totalJ) * 100) : 100 }
})

const unduhExcel = async () => {
  const XLSX = await import('xlsx')
  const label = opsiBulan.value.find(o => o.nilai === bulanDipilih.value)?.label ?? bulanDipilih.value
  const rows = barisRekap.value.map(r => ({
    'Guru': r.guru.name,
    'Sesi Terjadwal': r.terjadwal,
    'Mengajar': r.mengajar,
    'Tidak Hadir': r.tidak,
    'Total JP Terlaksana': r.jp,
    'Kehadiran Mengajar (%)': r.persen
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Mengajar')
  XLSX.writeFile(wb, `rekap-mengajar-${grade.value.toLowerCase()}-${bulanDipilih.value}.xlsx`)
  return label
}

const muatSemua = async () => {
  memuat.value = true
  if (!bulanDipilih.value) bulanDipilih.value = opsiBulan.value[0]?.nilai ?? ''
  await store.load(grade.value)
  await muatSesi()
  memuat.value = false
}

watch(grade, muatSemua)
watch(bulanDipilih, muatSesi)
onMounted(muatSemua)
</script>

<template>
  <div>
    <div class="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[12.5px] text-slate-600">
      Rekap ini dihitung dari jadwal resmi dan sesi Mulai/Selesai Mengajar guru. Sesi yang sudah lewat tanpa catatan mulai dihitung sebagai tidak hadir mengajar.
    </div>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <label class="text-[13px] text-slate-600" for="rk-bulan">Periode:</label>
      <select id="rk-bulan" v-model="bulanDipilih" class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px]">
        <option v-for="o in opsiBulan" :key="o.nilai" :value="o.nilai">{{ o.label }}</option>
      </select>
      <span class="text-[12.5px] text-slate-500">{{ grade }} · {{ ringkasan.totalM }} dari {{ ringkasan.totalJ }} sesi terjadwal terlaksana ({{ ringkasan.persen }}%)</span>
      <button type="button" class="ml-auto bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-slate-600 text-[13px] font-medium rounded-lg px-3.5 py-2 transition" @click="unduhExcel">Unduh Excel</button>
    </div>

    <div v-if="!sesiTersedia" class="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[12.5px] text-amber-700">
      Tabel sesi mengajar belum tersedia di database (migrasi 0020 belum dijalankan) — kolom Mengajar dan Tidak Hadir belum dapat dihitung. Jadwal terjadwal tetap ditampilkan dari jadwal resmi.
    </div>

    <div class="mt-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <th class="px-4 py-3 font-semibold border-b border-slate-100">Guru</th>
              <th class="px-3 py-3 font-semibold border-b border-slate-100 text-center">Sesi Terjadwal</th>
              <th class="px-3 py-3 font-semibold border-b border-slate-100 text-center">Mengajar</th>
              <th class="px-3 py-3 font-semibold border-b border-slate-100 text-center">Tidak Hadir</th>
              <th class="px-3 py-3 font-semibold border-b border-slate-100 text-center">Total JP</th>
              <th class="px-4 py-3 font-semibold border-b border-slate-100">Kehadiran Mengajar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="memuat"><td colspan="6" class="px-4 py-6 text-center text-[13px] text-slate-500">Memuat rekap…</td></tr>
            <tr v-else-if="!barisRekap.length"><td colspan="6" class="px-4 py-6 text-center text-[13px] text-slate-500">Belum ada jadwal mengajar pada periode ini.</td></tr>
            <tr v-for="r in barisRekap" :key="r.guru.id" class="border-b border-slate-50">
              <td class="px-4 py-3">
                <div class="text-[13px] font-medium text-slate-700">{{ r.guru.name }}</div>
                <div class="text-[11.5px] text-slate-400">{{ r.guru.unit === 'Yayasan' ? 'Yayasan' : `Guru ${r.guru.unit}` }}</div>
              </td>
              <td class="px-3 py-3 text-center text-[13px] text-slate-600">{{ r.terjadwal }}</td>
              <td class="px-3 py-3 text-center text-[13px] font-medium text-emerald-600">{{ r.mengajar }}</td>
              <td class="px-3 py-3 text-center text-[13px]" :class="r.tidak ? 'font-medium text-red-500' : 'text-slate-400'">{{ r.tidak }}</td>
              <td class="px-3 py-3 text-center text-[13px] text-slate-600">{{ r.jp }} JP</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full rounded-full" :class="r.persen >= 95 ? 'bg-emerald-500' : 'bg-blue-500'" :style="{ width: `${r.persen}%` }" />
                  </div>
                  <span class="text-[12px] font-medium text-slate-600 w-9 text-right">{{ r.persen }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="px-4 py-3 text-[12px] text-slate-400 border-t border-slate-100">Sesi terjadwal dihitung dari jadwal resmi jenjang {{ grade }} sampai tanggal berjalan. Keterlambatan mulai tercatat pada detail sesi di data Jadwal Mengajar.</p>
    </div>
  </div>
</template>
