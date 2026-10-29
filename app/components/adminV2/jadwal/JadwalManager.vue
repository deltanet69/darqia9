<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import JadwalTimetable from './JadwalTimetable.vue'
import JadwalFormModal from './JadwalFormModal.vue'
import JadwalSetelanModal from './JadwalSetelanModal.vue'
import JadwalGuruView from './JadwalGuruView.vue'
import {
  HARI_NAMA, bangunSlotJam, cariBentrok, jamBerlangsung,
  useJadwalPelajaran,
  type EntriInput, type JadwalEntri, type JadwalSetelan
} from '~/composables/useJadwalPelajaran'

const props = defineProps<{ jenjang: 'SMP' | 'SMK' }>()
const store = useJadwalPelajaran()

const mode = ref<'kelas' | 'guru'>('kelas')
const tahunDipilih = ref('')
const kelasDipilih = ref('')
const formTerbuka = ref(false)
const entriEdit = ref<JadwalEntri | null>(null)
const formAwal = ref({ classId: '', day: 1, ke: 1 })
const setelanTerbuka = ref(false)
const menyimpan = ref(false)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const tampilToast = (pesan: string) => {
  toast.value = pesan
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3200)
}

// Jam perangkat untuk penanda "sedang berlangsung" (diperbarui tiap 30 detik).
const sekarang = ref('')
const perbaruiJam = () => {
  const d = new Date()
  sekarang.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
let jamTimer: ReturnType<typeof setInterval> | null = null

const tingkatOrder = computed(() => props.jenjang === 'SMK' ? ['X', 'XI', 'XII'] : ['VII', 'VIII', 'IX'])
const slots = computed(() => bangunSlotJam(store.setelanDb.value))
const mapelMap = computed(() => Object.fromEntries(store.mapelList.value.map(m => [m.id, m])))
const guruMap = computed(() => Object.fromEntries(store.guruList.value.map(g => [g.id, g])))
const kelasMap = computed(() => Object.fromEntries(store.kelasList.value.map(k => [k.id, k])))

const daftarTahun = computed(() => [...new Set(store.kelasList.value.map(k => k.academicYear))].sort().reverse())
const kelasTahunIni = computed(() => store.kelasList.value.filter(k => k.academicYear === tahunDipilih.value))
const kelasAktif = computed(() => kelasTahunIni.value.find(k => k.id === kelasDipilih.value) ?? kelasTahunIni.value[0] ?? null)
const kelasGrup = computed(() => {
  const urutan = [...tingkatOrder.value, ...new Set(kelasTahunIni.value.map(k => k.tingkat).filter(t => t && !tingkatOrder.value.includes(t)))]
  return urutan.map(t => ({ tingkat: t, kelas: kelasTahunIni.value.filter(k => k.tingkat === t) })).filter(g => g.kelas.length)
})

const entriKelas = computed(() => kelasAktif.value ? store.entriList.value.filter(j => j.classId === kelasAktif.value!.id) : [])
const entriDiLuarPola = computed(() => entriKelas.value.filter(j => j.mulaiKe === null))

const hariIni = computed<number | null>(() => {
  const d = new Date().getDay()
  return d >= 1 && d <= 5 ? d : null
})
const slotBerjalan = computed(() => sekarang.value ? jamBerlangsung(slots.value, sekarang.value) : null)
const jamBerjalanKe = computed(() => slotBerjalan.value?.jenis === 'jam' ? (slotBerjalan.value.ke ?? null) : null)

const durasiJPEntri = (j: JadwalEntri): number => {
  if (j.mulaiKe !== null && j.selesaiKe !== null) return j.selesaiKe - j.mulaiKe + 1
  const beda = (Number(j.endsAt.slice(0, 2)) * 60 + Number(j.endsAt.slice(3, 5))) - (Number(j.startsAt.slice(0, 2)) * 60 + Number(j.startsAt.slice(3, 5)))
  return Math.max(1, Math.round(beda / Math.max(20, store.setelanDb.value.durasiJP)))
}

const kpi = computed(() => {
  const daftar = entriKelas.value
  const bentrok = daftar.filter(j => {
    const b = cariBentrok(store.entriList.value, { classId: j.classId, teacherId: j.teacherId, day: j.day, startsAt: j.startsAt, endsAt: j.endsAt, room: j.room }, j.id)
    return b.guru || b.kelas || b.ruangan
  }).length
  return {
    totalJP: daftar.reduce((a, j) => a + durasiJPEntri(j), 0),
    guru: new Set(daftar.map(j => j.teacherId)).size,
    mapel: new Set(daftar.map(j => j.subjectId)).size,
    totalMapel: store.mapelList.value.length,
    bentrok
  }
})

const stripHariIni = computed(() => {
  if (hariIni.value === null) return null
  const sesi = entriKelas.value.filter(j => j.day === hariIni.value)
  const hitungStatus = (st: string) => sesi.filter(j => (store.sesiMap.value[j.id]?.status ?? 'belum') === st).length
  return {
    namaHari: HARI_NAMA[hariIni.value],
    ada: sesi.length > 0,
    selesai: hitungStatus('selesai'),
    berlangsung: hitungStatus('berlangsung'),
    belum: hitungStatus('belum'),
    tidak: hitungStatus('tidak_hadir')
  }
})

const kkmPanel = computed(() => store.mapelList.value.map(m => {
  const pengajar = [...new Set(entriKelas.value.filter(j => j.subjectId === m.id).map(j => store.guruList.value.find(g => g.id === j.teacherId)?.name.split(',')[0] ?? ''))].filter(Boolean)
  return { ...m, pengajar }
}))

const geserKelas = (arah: number) => {
  const daftar = kelasTahunIni.value
  if (!daftar.length || !kelasAktif.value) return
  const idx = daftar.findIndex(k => k.id === kelasAktif.value!.id)
  kelasDipilih.value = daftar[(idx + arah + daftar.length) % daftar.length].id
}

const bukaTambah = (day = 1, ke = 1) => {
  if (!kelasAktif.value) return
  entriEdit.value = null
  formAwal.value = { classId: kelasAktif.value.id, day, ke }
  formTerbuka.value = true
}
const bukaUbah = (entri: JadwalEntri) => {
  entriEdit.value = entri
  formTerbuka.value = true
}
const simpanEntri = async (input: EntriInput, id?: string) => {
  menyimpan.value = true
  try {
    await store.simpanEntri(props.jenjang, input, id)
    formTerbuka.value = false
    tampilToast(id ? 'Jadwal diperbarui.' : 'Jadwal ditambahkan.')
  } catch (e: any) {
    tampilToast(e?.message ?? 'Gagal menyimpan jadwal.')
  } finally {
    menyimpan.value = false
  }
}
const hapusEntri = async (id: string) => {
  if (!window.confirm('Hapus jadwal ini? Sesi mengajar yang terhubung ikut terhapus.')) return
  menyimpan.value = true
  try {
    await store.hapusEntri(props.jenjang, id)
    formTerbuka.value = false
    tampilToast('Jadwal dihapus.')
  } catch (e: any) {
    tampilToast(e?.message ?? 'Gagal menghapus jadwal.')
  } finally {
    menyimpan.value = false
  }
}
const simpanSetelan = async (setelan: JadwalSetelan) => {
  menyimpan.value = true
  try {
    await store.simpanSetelan(props.jenjang, setelan)
    setelanTerbuka.value = false
    tampilToast('Pengaturan jam & istirahat diterapkan — timetable tersusun ulang.')
  } catch (e: any) {
    tampilToast(e?.message ?? 'Gagal menyimpan pengaturan.')
  } finally {
    menyimpan.value = false
  }
}

const inisialisasiPilihan = () => {
  if (!daftarTahun.value.includes(tahunDipilih.value)) {
    tahunDipilih.value = daftarTahun.value.includes('2026/2027') ? '2026/2027' : (daftarTahun.value[0] ?? '')
  }
  if (!kelasTahunIni.value.some(k => k.id === kelasDipilih.value)) {
    kelasDipilih.value = kelasTahunIni.value[0]?.id ?? ''
  }
}

watch(() => props.jenjang, async () => {
  tahunDipilih.value = ''
  kelasDipilih.value = ''
  await store.load(props.jenjang)
  inisialisasiPilihan()
})
watch(() => store.kelasList.value, inisialisasiPilihan)

onMounted(async () => {
  perbaruiJam()
  jamTimer = setInterval(perbaruiJam, 30000)
  await store.load(props.jenjang)
  inisialisasiPilihan()
})
onUnmounted(() => { if (jamTimer) clearInterval(jamTimer) })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start gap-3">
      <div>
        <h1 class="text-[22px] sm:text-[26px] font-semibold text-blue-950 tracking-tight">Jadwal Pelajaran</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">Susun jadwal per kelas mengikuti jenjang pada switcher global. Sistem menjaga guru, kelas, dan ruangan tidak bentrok satu sama lain.</p>
      </div>
      <div class="ml-auto inline-flex bg-white border border-slate-200 rounded-xl p-1" role="tablist" aria-label="Mode">
        <button type="button" class="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition" :class="mode === 'kelas' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'" @click="mode = 'kelas'">Per Kelas</button>
        <button type="button" class="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition" :class="mode === 'guru' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'" @click="mode = 'guru'">Per Guru</button>
      </div>
    </div>

    <div v-if="store.error.value" class="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">{{ store.error.value }}</div>
    <div v-if="store.loading.value" class="mt-4 rounded-xl bg-white border border-slate-200 px-4 py-6 text-center text-[13px] text-slate-500">Memuat data jadwal…</div>

    <template v-else-if="mode === 'kelas'">
      <div class="mt-5 flex flex-wrap items-center gap-2.5">
        <label class="text-[13px] text-slate-600" for="jk-tahun">Tahun Ajaran:</label>
        <select id="jk-tahun" v-model="tahunDipilih" class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px]">
          <option v-for="t in daftarTahun" :key="t" :value="t">{{ t }}</option>
        </select>
        <label class="text-[13px] text-slate-600" for="jk-kelas">Kelas:</label>
        <select id="jk-kelas" v-model="kelasDipilih" class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] font-medium text-blue-950 min-w-[230px]">
          <optgroup v-for="g in kelasGrup" :key="g.tingkat" :label="`Kelas ${g.tingkat} — ${g.kelas.length} kelas`">
            <option v-for="k in g.kelas" :key="k.id" :value="k.id">{{ k.name }}</option>
          </optgroup>
        </select>
        <div class="inline-flex gap-1">
          <button type="button" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition" aria-label="Kelas sebelumnya" @click="geserKelas(-1)">‹</button>
          <button type="button" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition" aria-label="Kelas berikutnya" @click="geserKelas(1)">›</button>
        </div>
        <span v-if="kelasAktif" class="text-[12.5px] text-slate-500">Wali kelas {{ kelasAktif.waliKelas || '—' }} · {{ kelasAktif.jumlahSiswa }} siswa</span>
        <span v-if="kelasAktif" class="text-[12px] text-slate-400">Kelas {{ kelasTahunIni.findIndex(k => k.id === kelasAktif!.id) + 1 }} dari {{ kelasTahunIni.length }} ({{ jenjang }})</span>
      </div>

      <div v-if="!kelasAktif" class="mt-4 rounded-xl bg-white border border-slate-200 px-4 py-6 text-center text-[13px] text-slate-500">
        Belum ada kelas aktif jenjang {{ jenjang }} pada tahun ajaran {{ tahunDipilih || '—' }}. Kelas dikelola di Manajemen Kelas.
      </div>

      <template v-else>
        <div class="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3.5">
            <div class="text-[12px] text-slate-500">Total jam pelajaran</div>
            <div class="text-[17px] font-semibold text-blue-950 mt-0.5">{{ kpi.totalJP }} JP / minggu</div>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3.5">
            <div class="text-[12px] text-slate-500">Guru mengajar di kelas ini</div>
            <div class="text-[17px] font-semibold text-blue-950 mt-0.5">{{ kpi.guru }} guru</div>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3.5">
            <div class="text-[12px] text-slate-500">Mapel terjadwal</div>
            <div class="text-[17px] font-semibold text-blue-950 mt-0.5">{{ kpi.mapel }} dari {{ kpi.totalMapel }} mapel</div>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3.5">
            <div class="text-[12px] text-slate-500">Bentrok terdeteksi</div>
            <div class="text-[17px] font-semibold mt-0.5" :class="kpi.bentrok ? 'text-red-500' : 'text-blue-950'">{{ kpi.bentrok ? `${kpi.bentrok} bentrok` : '0 — jadwal bersih' }}</div>
          </div>
        </div>

        <div class="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
            <div>
              <div class="text-[14px] font-semibold text-blue-950">Jadwal Kelas {{ kelasAktif.name }} — {{ jenjang === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam' }}</div>
              <div class="text-[12px] text-slate-500">Wali kelas {{ kelasAktif.waliKelas || '—' }} · {{ kelasAktif.jumlahSiswa }} siswa · Tahun Ajaran {{ kelasAktif.academicYear }}</div>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <span class="text-[11px] text-slate-400 hidden xl:inline">Klik sel kosong untuk menambah · klik jadwal untuk mengubah</span>
              <button type="button" class="bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-slate-600 text-[13px] font-medium rounded-lg px-3.5 py-2 transition" @click="setelanTerbuka = true">Atur Jam &amp; Istirahat</button>
              <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg px-3.5 py-2 transition" @click="bukaTambah()">+ Tambah Jadwal</button>
            </div>
          </div>

          <div v-if="stripHariIni" class="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-600">
            <span class="font-semibold text-blue-950">Kehadiran mengajar hari ini ({{ stripHariIni.namaHari }}):</span>
            <template v-if="stripHariIni.ada">
              <span><span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />{{ stripHariIni.selesai }} selesai</span>
              <span><span class="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1" />{{ stripHariIni.berlangsung }} sedang mengajar</span>
              <span><span class="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1" />{{ stripHariIni.belum }} belum mulai</span>
              <span v-if="stripHariIni.tidak"><span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />{{ stripHariIni.tidak }} tidak hadir</span>
            </template>
            <span v-else>kelas ini tidak memiliki sesi pada hari ini.</span>
            <span v-if="slotBerjalan" class="font-medium text-blue-700">
              Sekarang pukul {{ sekarang }} — {{ slotBerjalan.jenis === 'jam' ? `Jam ke-${slotBerjalan.ke} sedang berlangsung` : `sedang ${slotBerjalan.label}` }}
            </span>
            <span class="text-slate-400">— status ditulis guru lewat tombol Mulai Mengajar di Jadwal Mengajar</span>
          </div>

          <JadwalTimetable
            :slots="slots" :daftar="entriKelas" :mapel-map="mapelMap" :guru-map="guruMap" :kelas-map="kelasMap"
            :sesi-map="store.sesiMap.value" :hari-ini="hariIni" :jam-berjalan-ke="jamBerjalanKe"
            @tambah="(d, ke) => bukaTambah(d, ke)" @ubah="bukaUbah"
          />
        </div>

        <div v-if="entriDiLuarPola.length" class="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <div class="text-[12.5px] font-semibold text-amber-700">{{ entriDiLuarPola.length }} jadwal tidak mengikuti pola jam saat ini</div>
          <p class="text-[12.5px] text-amber-600 mt-0.5">Jadwal berikut tersimpan dengan pola jam lama sehingga tidak tampil di grid. Klik untuk menyelaraskannya ke pola aktif.</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="j in entriDiLuarPola" :key="j.id" type="button" class="text-[12px] font-medium bg-white border border-amber-200 text-amber-700 rounded-lg px-2.5 py-1.5 hover:border-amber-300" @click="bukaUbah(j)">
              {{ HARI_NAMA[j.day] }} {{ j.startsAt }}–{{ j.endsAt }} · {{ mapelMap[j.subjectId]?.name ?? '—' }}
            </button>
          </div>
        </div>

        <div class="mt-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div class="flex items-baseline gap-2">
            <div class="text-[13.5px] font-semibold text-blue-950">KKM &amp; Pengajar</div>
            <span class="ml-auto text-[11.5px] text-slate-400">Mengikuti Master Mapel jenjang {{ jenjang }}</span>
          </div>
          <p class="text-[12px] text-slate-500 mt-0.5">KKM dari Master Mapel · pengajar mengikuti jadwal kelas {{ kelasAktif.name }}.</p>
          <div class="mt-2 grid sm:grid-cols-2 xl:grid-cols-4 gap-x-8">
            <div v-for="m in kkmPanel" :key="m.id" class="py-2.5 flex items-center gap-2.5 border-b border-slate-50">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: m.warna }" />
              <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-medium text-slate-700 truncate">{{ m.name }}</div>
                <div class="text-[11.5px]" :class="m.pengajar.length ? 'text-slate-400' : 'text-amber-500'">{{ m.pengajar.length ? m.pengajar.join(', ') : 'Belum ada jadwal di kelas ini' }}</div>
              </div>
              <span class="shrink-0 text-[11.5px] font-semibold text-blue-950 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5">KKM {{ m.kkm }}</span>
            </div>
          </div>
        </div>
      </template>
    </template>

    <JadwalGuruView
      v-else
      :guru-list="store.guruList.value" :entri-list="store.entriList.value"
      :mapel-map="mapelMap" :kelas-map="kelasMap" :slots="slots"
      :sesi-map="store.sesiMap.value" :hari-ini="hariIni" :jam-berjalan-ke="jamBerjalanKe" :jenjang="jenjang"
    />

    <JadwalFormModal
      :open="formTerbuka" :entri-edit="entriEdit" :awal="formAwal"
      :kelas-list="kelasTahunIni" :mapel-list="store.mapelList.value" :guru-list="store.guruList.value"
      :slots="slots" :entri-list="store.entriList.value" :tingkat-order="tingkatOrder" :menyimpan="menyimpan"
      @tutup="formTerbuka = false" @simpan="simpanEntri" @hapus="hapusEntri"
    />
    <JadwalSetelanModal :open="setelanTerbuka" :setelan="store.setelanDb.value" :menyimpan="menyimpan" @tutup="setelanTerbuka = false" @simpan="simpanSetelan" />

    <div v-if="toast" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-blue-950 text-white text-[13px] rounded-xl px-4 py-2.5 shadow-lg max-w-[92vw] text-center">{{ toast }}</div>
  </div>
</template>
