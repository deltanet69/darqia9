<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ClassStudentItem } from '../kelasV2Data'

interface Props {
  students: ClassStudentItem[]
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

// Sumber data: tabel attendance (Smartcard RFID & input manual), sama dengan yang dipakai modul Absensi.
const supabase = useSupabaseClient()

type Periode = 'harian' | 'mingguan' | 'bulanan'
interface Catatan { date: string; time: string; status: string }

const pad = (n: number) => String(n).padStart(2, '0')
const keIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const dariIso = (iso: string) => new Date(iso + 'T00:00:00')

const period = ref<Periode>('harian')
const tanggal = ref(keIso(new Date()))
const bulan = ref(tanggal.value.slice(0, 7))
const statusFilter = ref('')
const loading = ref(false)
const errorMessage = ref('')
const byStudent = ref<Record<string, Catatan[]>>({})
const totalCatatan = ref(0)

const rentang = computed(() => {
  if (period.value === 'bulanan') {
    const [y, m] = bulan.value.split('-').map(Number)
    return { dari: `${bulan.value}-01`, sampai: keIso(new Date(y, m, 0)) }
  }
  if (period.value === 'mingguan') {
    const d = dariIso(tanggal.value)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const senin = keIso(d)
    d.setDate(d.getDate() + 6)
    return { dari: senin, sampai: keIso(d) }
  }
  return { dari: tanggal.value, sampai: tanggal.value }
})

const labelRentang = computed(() => {
  const fmt = (iso: string) => dariIso(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  if (period.value === 'bulanan') return dariIso(rentang.value.dari).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  return period.value === 'harian' ? fmt(rentang.value.dari) : `${fmt(rentang.value.dari)} – ${fmt(rentang.value.sampai)}`
})

const jam = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') : ''

let versi = 0
const muat = async () => {
  const ids = props.students.map(s => s.id)
  const { dari, sampai } = rentang.value
  const v = ++versi
  if (!ids.length || !dari || dari.includes('NaN')) { byStudent.value = {}; totalCatatan.value = 0; return }
  loading.value = true
  errorMessage.value = ''
  const baris: any[] = []
  // PostgREST membatasi 1000 baris per permintaan; rekap bulanan satu kelas bisa melebihinya.
  for (let dariBaris = 0; ; dariBaris += 1000) {
    const { data, error } = await supabase
      .from('attendance')
      .select('student_id, attendance_date, time_in, status')
      .in('student_id', ids)
      .gte('attendance_date', dari)
      .lte('attendance_date', sampai)
      .order('attendance_date')
      .range(dariBaris, dariBaris + 999)
    if (error) {
      if (v === versi) { errorMessage.value = 'Data presensi gagal dimuat: ' + error.message; loading.value = false }
      return
    }
    baris.push(...(data ?? []))
    if ((data?.length ?? 0) < 1000) break
  }
  if (v !== versi) return
  const peta: Record<string, Catatan[]> = {}
  for (const r of baris) (peta[r.student_id] ??= []).push({ date: r.attendance_date, time: jam(r.time_in), status: r.status })
  byStudent.value = peta
  totalCatatan.value = baris.length
  loading.value = false
}

watch([() => props.students, period, tanggal, bulan], muat, { immediate: true })
watch(period, () => { statusFilter.value = '' })

const LABEL: Record<string, string> = { tepat_waktu: 'Hadir', terlambat: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpa: 'Alpa' }

const rekap = computed(() => props.students.map((s) => {
  const rec = byStudent.value[s.id] ?? []
  const c = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0, terlambat: 0 }
  for (const r of rec) {
    const label = LABEL[r.status]
    if (label) c[label as 'Hadir' | 'Sakit' | 'Izin' | 'Alpa']++
    if (r.status === 'terlambat') c.terlambat++
  }
  const tercatat = c.Hadir + c.Sakit + c.Izin + c.Alpa
  const pertama = rec.find(r => LABEL[r.status])
  return {
    s, ...c, tercatat,
    persen: tercatat ? Math.round(c.Hadir / tercatat * 100) : null,
    status: pertama ? LABEL[pertama.status] : '',
    terlambatHarian: pertama?.status === 'terlambat',
    waktu: pertama?.time ?? ''
  }
}))

const total = computed(() => ({
  Hadir: rekap.value.reduce((a, r) => a + r.Hadir, 0),
  Sakit: rekap.value.reduce((a, r) => a + r.Sakit, 0),
  Izin: rekap.value.reduce((a, r) => a + r.Izin, 0),
  Alpa: rekap.value.reduce((a, r) => a + r.Alpa, 0),
  belum: rekap.value.filter(r => !r.tercatat).length
}))

const harian = computed(() => period.value === 'harian')
const daftar = computed(() => harian.value && statusFilter.value
  ? rekap.value.filter(r => statusFilter.value === 'Belum' ? !r.status : r.status === statusFilter.value)
  : rekap.value)

const pills = [
  { key: 'Hadir', cls: 'bg-[#E7F6ED] border-[#16A34A] ring-[#16A34A]/20', teks: 'text-[#14532D]', angka: 'text-[#166534]' },
  { key: 'Sakit', cls: 'bg-[#FEF6EE] border-[#F79009] ring-[#F79009]/20', teks: 'text-[#7A271A]', angka: 'text-[#B54708]' },
  { key: 'Izin', cls: 'bg-[#EFF4FF] border-[#1B5FD9] ring-[#1B5FD9]/20', teks: 'text-[#175CD3]', angka: 'text-[#1B5FD9]' },
  { key: 'Alpa', cls: 'bg-[#FEF3F2] border-[#F04438] ring-[#F04438]/20', teks: 'text-[#912018]', angka: 'text-[#D92D20]' }
] as const

const badge = (status: string) => ({
  'bg-[#E7F6ED] text-[#166534]': status === 'Hadir',
  'bg-[#FEF6EE] text-[#B54708]': status === 'Sakit',
  'bg-[#EFF4FF] text-[#1B5FD9]': status === 'Izin',
  'bg-[#FEF3F2] text-[#D92D20]': status === 'Alpa',
  'bg-[#F2F4F7] text-[#667085]': !status
})
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div class="min-w-0">
        <h4 class="text-sm font-extrabold text-[#101828]">
          Presensi Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          {{ labelRentang }} &middot; dari Smartcard RFID dan modul Absensi
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <div class="grid grid-cols-3 bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl">
          <button
            v-for="p in (['harian', 'mingguan', 'bulanan'] as const)"
            :key="p"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer capitalize"
            :class="period === p ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
            @click="period = p"
          >
            {{ p }}
          </button>
        </div>
        <input
          v-if="period === 'bulanan'"
          v-model="bulan"
          type="month"
          aria-label="Pilih bulan"
          class="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#344054] focus:outline-none focus:border-[#1B5FD9]"
        />
        <input
          v-else
          v-model="tanggal"
          type="date"
          :aria-label="period === 'harian' ? 'Pilih tanggal' : 'Pilih tanggal dalam minggu'"
          class="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#344054] focus:outline-none focus:border-[#1B5FD9]"
        />
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="rounded-xl border border-[#F5C6C0] bg-[#FFF8F7] px-3.5 py-2.5 text-xs font-semibold text-[#B42318]"
      role="alert"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="!loading && !totalCatatan"
      class="rounded-xl border border-[#E7EBF2] bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-semibold text-[#667085]"
      role="status"
    >
      Belum ada data presensi pada periode ini.
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <component
        :is="harian ? 'button' : 'div'"
        v-for="p in pills"
        :key="p.key"
        :type="harian ? 'button' : undefined"
        class="p-2.5 rounded-xl border text-center transition"
        :class="[
          harian && statusFilter === p.key ? p.cls + ' ring-2' : 'bg-[#F8FAFC] border-[#E2E8F0]',
          harian ? 'cursor-pointer' : ''
        ]"
        @click="harian && (statusFilter = statusFilter === p.key ? '' : p.key)"
      >
        <span class="text-[11px] font-bold block" :class="p.teks">{{ p.key }}</span>
        <b class="text-lg font-extrabold font-mono" :class="p.angka">{{ total[p.key] }} {{ harian ? 'Siswa' : 'kali' }}</b>
      </component>
    </div>
    <button
      v-if="harian"
      type="button"
      class="text-xs font-semibold transition cursor-pointer"
      :class="statusFilter === 'Belum' ? 'text-[#101828] underline' : 'text-[#667085] hover:text-[#101828]'"
      @click="statusFilter = statusFilter === 'Belum' ? '' : 'Belum'"
    >
      Belum tercatat: {{ total.belum }} siswa
    </button>

    <p v-if="loading" class="text-xs font-semibold text-[#667085]" role="status">Memuat data presensi…</p>

    <!-- Tabel (md ke atas) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#F8FAFC] text-[#475467] uppercase tracking-wider font-bold border-b border-[#E7EBF2] text-[10.5px]">
          <tr>
            <th class="py-2.5 px-3">No</th>
            <th class="py-2.5 px-3">Nama Siswa</th>
            <th class="py-2.5 px-3 font-mono">NISN</th>
            <th class="py-2.5 px-3">L/P</th>
            <template v-if="harian">
              <th class="py-2.5 px-3">Waktu Tap RFID</th>
              <th class="py-2.5 px-3">Status Kehadiran</th>
            </template>
            <template v-else>
              <th class="py-2.5 px-3">Hadir</th>
              <th class="py-2.5 px-3">Sakit</th>
              <th class="py-2.5 px-3">Izin</th>
              <th class="py-2.5 px-3">Alpa</th>
              <th class="py-2.5 px-3">% Hadir</th>
            </template>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
          <tr v-for="(row, idx) in daftar" :key="row.s.id" class="hover:bg-[#F8FAFC] transition-colors">
            <td class="py-2.5 px-3 font-mono text-[#98A2B3]">{{ idx + 1 }}</td>
            <td class="py-2.5 px-3 font-bold text-[#101828]">{{ row.s.name }}</td>
            <td class="py-2.5 px-3 font-mono">{{ row.s.nisn }}</td>
            <td class="py-2.5 px-3 font-bold">{{ row.s.gender }}</td>
            <template v-if="harian">
              <td class="py-2.5 px-3 font-mono text-[#667085]">{{ row.waktu || '—' }}</td>
              <td class="py-2.5 px-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold" :class="badge(row.status)">
                  {{ row.status || 'Belum tercatat' }}<template v-if="row.terlambatHarian"> (terlambat)</template>
                </span>
              </td>
            </template>
            <template v-else>
              <td class="py-2.5 px-3 font-mono">{{ row.Hadir }}</td>
              <td class="py-2.5 px-3 font-mono">{{ row.Sakit }}</td>
              <td class="py-2.5 px-3 font-mono">{{ row.Izin }}</td>
              <td class="py-2.5 px-3 font-mono">{{ row.Alpa }}</td>
              <td class="py-2.5 px-3 font-mono font-bold">{{ row.persen === null ? '—' : row.persen + '%' }}</td>
            </template>
          </tr>
          <tr v-if="!daftar.length">
            <td :colspan="harian ? 6 : 9" class="py-8 text-center text-[#98A2B3]">Tidak ada siswa pada filter ini.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Kartu (mobile): tanpa scroll horizontal -->
    <ul class="md:hidden space-y-2.5">
      <li v-for="(row, idx) in daftar" :key="row.s.id" class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[13px] font-extrabold text-[#101828] break-words">
              <span class="font-mono text-[#98A2B3] font-bold mr-1">{{ idx + 1 }}.</span>{{ row.s.name }}
            </p>
            <p class="mt-0.5 font-mono text-[11px] text-[#667085] break-all">{{ row.s.nisn }} &middot; {{ row.s.gender }}</p>
          </div>
          <span v-if="harian" class="shrink-0 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold" :class="badge(row.status)">
            {{ row.status || 'Belum tercatat' }}
          </span>
          <b v-else class="shrink-0 font-mono text-sm text-[#101828]">{{ row.persen === null ? '—' : row.persen + '%' }}</b>
        </div>
        <p v-if="harian" class="text-[11.5px] text-[#667085]">
          Waktu tap: <span class="font-mono">{{ row.waktu || '—' }}</span><template v-if="row.terlambatHarian"> &middot; terlambat</template>
        </p>
        <div v-else class="grid grid-cols-4 gap-1.5 text-center text-[11px] font-bold">
          <span class="rounded-lg bg-[#E7F6ED] text-[#166534] py-1">H {{ row.Hadir }}</span>
          <span class="rounded-lg bg-[#FEF6EE] text-[#B54708] py-1">S {{ row.Sakit }}</span>
          <span class="rounded-lg bg-[#EFF4FF] text-[#1B5FD9] py-1">I {{ row.Izin }}</span>
          <span class="rounded-lg bg-[#FEF3F2] text-[#D92D20] py-1">A {{ row.Alpa }}</span>
        </div>
      </li>
      <li v-if="!daftar.length" class="py-8 text-center text-xs text-[#98A2B3]">Tidak ada siswa pada filter ini.</li>
    </ul>
  </div>
</template>
