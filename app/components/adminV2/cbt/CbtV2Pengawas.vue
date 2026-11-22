<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import { useRuangUjian, type RuangUjian, type TautanUjian } from '~/composables/useRuangUjian'
import { periodeOpsi } from '~/composables/ruangUjianCore'

// Jadwal Pengawas: cara baca penugasan pengawas per SESI (bukan per ruang).
// Pengawas nempel ke tautan ruang + jadwal (exam_room_exams.supervisor_id, migrasi 0088):
// satu guru boleh pindah ruang antar sesi, yang dilarang hanya dobel di jam yang beririsan.
// Halaman ini murni pemantau — penugasan tetap dilakukan di Ruang Ujian → Jadwal Ujian.
const props = defineProps<{ grade: GradeType }>()
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const api = useRuangUjian()
const cbtData = useAdminCbtData('cbt')
const client = useSupabaseClient()
const { tahun, muatOpsi } = useTahunAjaran()

const riwayat = ref<string[]>([])
const periode = ref('')
const ruang = ref<RuangUjian[]>([])
const tautan = ref<TautanUjian[]>([])
const namaGuru = ref<Map<string, string>>(new Map())
const loading = ref(false)
const error = ref('')
const mode = ref<'guru' | 'sesi'>('guru')

const periodeList = computed(() => periodeOpsi(tahun.value, riwayat.value))

interface BarisTugas {
  key: string
  roomId: string
  ruang: string
  subject: string
  name: string
  startsAt: string
  duration: number
  supervisorId: string | null
  kelas: number
}

// Jadwal per ruang + mapel + jam (ujian beberapa kelas di ruang yang sama digabung, seperti jadwalSaya di Ruang Ujian).
const baris = computed<BarisTugas[]>(() => {
  const examById = new Map(cbtData.exams.value.map(item => [item.id, item]))
  const grup = new Map<string, BarisTugas>()
  for (const t of tautan.value) {
    const exam = examById.get(t.exam_id)
    if (!exam || !exam.startsAt) continue
    const key = `${t.room_id}|${exam.subjectId}|${exam.startsAt}|${exam.name}`
    const ada = grup.get(key)
    if (ada) { ada.kelas++; continue }
    grup.set(key, {
      key, roomId: t.room_id, ruang: ruang.value.find(item => item.id === t.room_id)?.name ?? '-',
      subject: exam.subject, name: exam.name, startsAt: exam.startsAt, duration: exam.duration,
      supervisorId: t.supervisor_id, kelas: 1
    })
  }
  return [...grup.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.ruang.localeCompare(b.ruang))
})

const jamAkhir = (b: BarisTugas) => new Date(new Date(b.startsAt).getTime() + b.duration * 60_000)
  .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
const jamMulai = (b: BarisTugas) => new Date(b.startsAt)
  .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
const tanggalLabel = (startsAt: string) => new Date(startsAt)
  .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const irisan = (a: BarisTugas, b: BarisTugas) => {
  const aM = new Date(a.startsAt).getTime(), aS = aM + a.duration * 60_000
  const bM = new Date(b.startsAt).getTime(), bS = bM + b.duration * 60_000
  return aM < bS && bM < aS
}

// Per guru: daftar tugas kronologis + penanda bentrok (seharusnya tidak pernah terjadi — dijaga trigger DB 0088;
// bila muncul berarti data lama sebelum trigger ada, dan harus terlihat jelas di sini).
const perGuru = computed(() => {
  const grup = new Map<string, BarisTugas[]>()
  for (const b of baris.value) {
    if (!b.supervisorId) continue
    grup.set(b.supervisorId, [...(grup.get(b.supervisorId) ?? []), b])
  }
  return [...grup.entries()].map(([id, tugas]) => {
    const bentrokKey = new Set<string>()
    for (let i = 0; i < tugas.length; i++) for (let j = i + 1; j < tugas.length; j++)
      if (irisan(tugas[i], tugas[j])) { bentrokKey.add(tugas[i].key); bentrokKey.add(tugas[j].key) }
    return { id, nama: namaGuru.value.get(id) ?? 'Guru', tugas, bentrokKey }
  }).sort((a, b) => a.nama.localeCompare(b.nama))
})

const perSesi = computed(() => {
  const grup = new Map<string, BarisTugas[]>()
  for (const b of baris.value) grup.set(b.startsAt, [...(grup.get(b.startsAt) ?? []), b])
  return [...grup.entries()].map(([startsAt, rows]) => ({
    startsAt,
    label: tanggalLabel(startsAt),
    jam: `${jamMulai(rows[0])}–${jamAkhir(rows.reduce((a, b) => (b.duration > a.duration ? b : a)))}`,
    mapel: [...new Set(rows.map(r => r.subject))].join(', '),
    rows: rows.sort((a, b) => a.ruang.localeCompare(b.ruang))
  })).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})

const belumDiisi = computed(() => baris.value.filter(b => !b.supervisorId))
const jumlahBentrok = computed(() => perGuru.value.reduce((n, g) => n + (g.bentrokKey.size ? 1 : 0), 0))

const muat = async () => {
  if (!periode.value) return
  loading.value = true
  error.value = ''
  try {
    ruang.value = await api.muatRuang(props.grade, periode.value)
    tautan.value = await api.muatTautanUjian(ruang.value.map(item => item.id))
    riwayat.value = await api.muatPeriodeRiwayat(props.grade)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Jadwal pengawas gagal dimuat.'
    ruang.value = []
    tautan.value = []
  } finally { loading.value = false }
}

onMounted(async () => {
  void cbtData.load()
  await muatOpsi()
  periode.value = periodeList.value[1] ?? periodeList.value[0] ?? ''
  riwayat.value = await api.muatPeriodeRiwayat(props.grade).catch(() => [])
  const { data } = await client.from('teachers').select('id, name').order('name')
  namaGuru.value = new Map((data ?? []).map((t: any) => [t.id as string, t.name as string]))
})
watch([periode, () => props.grade], () => { void muat() })
</script>

<template>
  <div class="space-y-4">
    <!-- Header: judul + periode + pilihan cara baca -->
    <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5">
      <div class="flex flex-wrap items-start gap-3">
        <div class="flex-1 min-w-[220px]">
          <h2 class="text-[16px] font-extrabold text-[#101828]">Jadwal Pengawas per Sesi</h2>
          <p class="text-[12.5px] text-[#667085] mt-1 leading-relaxed">
            Pengawas nempel ke sesi / jam, bukan terkunci di satu ruang — antar sesi yang tidak beririsan
            ia boleh pindah ruang. Penugasan tetap diatur di menu Ruang Ujian → Jadwal Ujian; halaman ini untuk membaca &amp; memeriksa.
          </p>
        </div>
        <div>
          <label for="pengawas-periode" class="block text-[11px] font-bold text-[#344054] mb-1">Periode</label>
          <select id="pengawas-periode" v-model="periode" class="min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white outline-none text-[13px] font-semibold">
            <option v-for="p in periodeList" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <span class="block text-[11px] font-bold text-[#344054] mb-1">Lihat per</span>
          <div class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl">
            <button type="button" class="px-3.5 py-2 rounded-lg text-[12.5px] font-bold transition-all"
              :class="mode === 'guru' ? 'bg-white text-[#101828] shadow-[0_1px_4px_rgba(16,24,40,0.12)]' : 'text-[#667085]'"
              @click="mode = 'guru'">Guru</button>
            <button type="button" class="px-3.5 py-2 rounded-lg text-[12.5px] font-bold transition-all"
              :class="mode === 'sesi' ? 'bg-white text-[#101828] shadow-[0_1px_4px_rgba(16,24,40,0.12)]' : 'text-[#667085]'"
              @click="mode = 'sesi'">Sesi</button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mt-4 text-[11.5px] font-bold">
        <span class="bg-[#F6F8FC] border border-[#E7EBF2] text-[#344054] rounded-full px-3 py-1.5">{{ perSesi.length }} sesi</span>
        <span class="bg-[#F6F8FC] border border-[#E7EBF2] text-[#344054] rounded-full px-3 py-1.5">{{ baris.length }} penugasan ruang</span>
        <span class="bg-[#F6F8FC] border border-[#E7EBF2] text-[#344054] rounded-full px-3 py-1.5">{{ perGuru.length }} pengawas bertugas</span>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-[12.5px] text-[#B42318]" role="alert">
      {{ error }}
    </div>

    <!-- Peringatan: masih ada ruang + sesi tanpa pengawas -->
    <div v-if="!loading && belumDiisi.length" class="rounded-xl border border-[#F5D9A8] bg-[#FFFAEB] px-4 py-3 text-[12.5px] leading-relaxed text-[#7A4B05]" role="status">
      <b>{{ belumDiisi.length }} penugasan belum ada pengawasnya:</b>
      {{ belumDiisi.slice(0, 6).map(b => `${b.ruang} (${b.subject}, ${jamMulai(b)})`).join(' • ') }}{{ belumDiisi.length > 6 ? ' • …' : '' }}
      — isi lewat Ruang Ujian → buka ruangnya → tab Jadwal Ujian.
    </div>

    <!-- Peringatan: bentrok jam pada data (dijaga DB 0088, tampil di sini bila ada data lama) -->
    <div v-if="!loading && jumlahBentrok" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-[12.5px] text-[#B42318]" role="alert">
      <b>{{ jumlahBentrok }} pengawas tercatat dobel di jam yang beririsan.</b> Periksa kartu gurunya di bawah (bertanda BENTROK) dan perbaiki penugasannya.
    </div>

    <p v-if="loading" class="text-[13px] text-[#667085] py-8 text-center">Memuat jadwal pengawas…</p>
    <p v-else-if="!baris.length" class="text-[13px] text-[#667085] py-8 text-center">
      Belum ada jadwal ujian yang tertaut ke ruang pada periode ini. Buat ujian (massal) dulu, lalu jadwalnya masuk ke ruang lewat sinkronisasi.
    </p>

    <!-- PER GURU: timetable tiap pengawas -->
    <template v-else-if="mode === 'guru'">
      <p v-if="!perGuru.length" class="text-[13px] text-[#667085] py-4 text-center">Belum ada pengawas yang ditugaskan pada periode ini.</p>
      <div class="grid gap-4 lg:grid-cols-2">
        <section v-for="g in perGuru" :key="g.id" class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="w-9 h-9 rounded-full bg-[#0A2A5C] text-white inline-flex items-center justify-center shrink-0">
              <AdminV2Icon name="users" :size="16" />
            </span>
            <h3 class="text-[14.5px] font-extrabold text-[#101828] flex-1 min-w-[140px]">{{ g.nama }}</h3>
            <span class="text-[11px] font-extrabold rounded-full px-2.5 py-1"
              :class="g.bentrokKey.size ? 'bg-[#FDECEA] text-[#B42318]' : 'bg-[#E7F6EC] text-[#027A48]'">
              {{ g.bentrokKey.size ? 'BENTROK' : 'AMAN' }}
            </span>
            <span class="text-[11px] font-bold text-[#667085]">{{ g.tugas.length }} tugas</span>
          </div>
          <ol class="mt-3.5 space-y-2.5">
            <li v-for="b in g.tugas" :key="b.key"
              class="rounded-xl border px-3.5 py-3"
              :class="g.bentrokKey.has(b.key) ? 'border-[#F5C6C0] bg-[#FFFBFA]' : 'border-[#E7EBF2] bg-[#F6F8FC]'">
              <div class="flex items-baseline gap-2 flex-wrap">
                <span class="font-mono text-[13px] font-extrabold text-[#0A2A5C]">{{ jamMulai(b) }}–{{ jamAkhir(b) }}</span>
                <span class="text-[12.5px] font-bold text-[#101828]">{{ b.ruang }}</span>
                <span class="text-[12px] text-[#667085]">{{ b.subject }} · {{ b.kelas }} kelas</span>
              </div>
              <p class="text-[11.5px] text-[#667085] mt-1">{{ tanggalLabel(b.startsAt) }} — {{ b.name }}</p>
            </li>
          </ol>
        </section>
      </div>
    </template>

    <!-- PER SESI: satu kartu per slot waktu, isinya ruang → pengawas -->
    <template v-else>
      <section v-for="s in perSesi" :key="s.startsAt" class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5">
        <div class="flex items-baseline gap-2.5 flex-wrap">
          <span class="font-mono text-[14px] font-extrabold text-[#0A2A5C]">{{ s.jam }}</span>
          <h3 class="text-[14px] font-extrabold text-[#101828]">{{ s.mapel }}</h3>
          <span class="text-[12px] text-[#667085]">{{ s.label }}</span>
        </div>
        <ul class="mt-3 divide-y divide-[#EEF1F6]">
          <li v-for="b in s.rows" :key="b.key" class="py-2.5 flex items-center gap-3 flex-wrap">
            <span class="text-[13px] font-bold text-[#101828] min-w-[110px]">{{ b.ruang }}</span>
            <span class="text-[12px] text-[#667085] flex-1">{{ b.name }} · {{ b.kelas }} kelas</span>
            <span v-if="b.supervisorId" class="text-[12.5px] font-bold text-[#027A48]">{{ namaGuru.get(b.supervisorId) ?? 'Guru' }}</span>
            <span v-else class="text-[11px] font-extrabold bg-[#FDECEA] text-[#B42318] rounded-full px-2.5 py-1">BELUM DIISI</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
