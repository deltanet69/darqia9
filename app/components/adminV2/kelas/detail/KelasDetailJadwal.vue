<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import JadwalTimetable from '../../jadwal/JadwalTimetable.vue'
import JadwalFormModal from '../../jadwal/JadwalFormModal.vue'
import {
  useJadwalPelajaran, bangunSlotJam, waktuDariJamKe, jamBerlangsung, HARI_NAMA,
  type EntriInput, type JadwalEntri
} from '~/composables/useJadwalPelajaran'

interface Props {
  classId: string
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

// Sumber data: class_schedules (ditulis modul Jadwal Pelajaran), mapel dari Master Mapel, guru dari data guru.
const jp = useJadwalPelajaran()
const bolehKelola = useRbac().adalahSuperadmin
const grade = computed(() => props.jenjang.toUpperCase() as 'SMP' | 'SMK')
onMounted(() => { if (props.classId) void jp.load(grade.value) })

const slots = computed(() => bangunSlotJam(jp.setelanDb.value))
const daftar = computed(() => jp.entriList.value.filter(e => e.classId === props.classId))
const mapelMap = computed(() => Object.fromEntries(jp.mapelList.value.map(m => [m.id, m])))
const guruMap = computed(() => Object.fromEntries(jp.guruList.value.map(g => [g.id, g])))
const kelasMap = computed(() => Object.fromEntries(jp.kelasList.value.map(k => [k.id, k])))

const sekarang = new Date()
const hariIni = sekarang.getDay() >= 1 && sekarang.getDay() <= 5 ? sekarang.getDay() : null
const jamBerjalanKe = hariIni
  ? jamBerlangsung(slots.value, `${String(sekarang.getHours()).padStart(2, '0')}:${String(sekarang.getMinutes()).padStart(2, '0')}`)?.ke ?? null
  : null

const hariAktif = ref(hariIni ?? 1)
const jadwalHari = computed(() => daftar.value
  .filter(e => e.day === hariAktif.value)
  .sort((a, b) => (a.mulaiKe ?? 99) - (b.mulaiKe ?? 99)))

const namaGuru = (id: string) => guruMap.value[id]?.name ?? 'Belum ada guru'
const jpTeks = (mulai: number | null, selesai: number | null) =>
  mulai === null ? '' : mulai === selesai ? `Jam ${mulai}` : `Jam ${mulai}–${selesai}`

// ---- CRUD: memakai formulir & aturan bentrok yang sama dengan modul Jadwal Pelajaran ----
const formTerbuka = ref(false)
const entriEdit = ref<JadwalEntri | null>(null)
const formAwal = ref({ classId: props.classId, day: 1, ke: 1 })
const menyimpan = ref(false)
const pesanAksi = ref('')
const kelasIni = computed(() => jp.kelasList.value.filter(k => k.id === props.classId))
const tingkatIni = computed(() => kelasIni.value.map(k => k.tingkat))

const bukaTambah = (day = hariAktif.value, ke = 1) => {
  entriEdit.value = null
  formAwal.value = { classId: props.classId, day, ke }
  formTerbuka.value = true
}
const bukaUbah = (entri: JadwalEntri) => {
  entriEdit.value = entri
  formTerbuka.value = true
}
const simpanEntri = async (input: EntriInput, id?: string) => {
  menyimpan.value = true
  try {
    await jp.simpanEntri(grade.value, input, id)
    formTerbuka.value = false
    pesanAksi.value = id ? 'Jadwal diperbarui.' : 'Jadwal ditambahkan.'
  } catch (e: any) {
    pesanAksi.value = e?.message ?? 'Gagal menyimpan jadwal.'
  } finally {
    menyimpan.value = false
  }
}
const hapusEntri = async (id: string) => {
  if (!window.confirm('Hapus jadwal ini? Sesi mengajar yang terhubung ikut terhapus.')) return
  menyimpan.value = true
  try {
    await jp.hapusEntri(grade.value, id)
    formTerbuka.value = false
    pesanAksi.value = 'Jadwal dihapus.'
  } catch (e: any) {
    pesanAksi.value = e?.message ?? 'Gagal menghapus jadwal.'
  } finally {
    menyimpan.value = false
  }
}

// ---- Impor CSV: Hari, Jam Ke, Mapel, Guru, Ruang ----
const importTerbuka = ref(false)
const namaBerkas = ref('')
const pesanImpor = ref('')
const sedangImpor = ref(false)
interface BarisImpor { day: number; mulaiKe: number; selesaiKe: number; subjectId: string; teacherId: string; room: string; label: string }
const barisValid = ref<BarisImpor[]>([])
const barisTolak = ref<string[]>([])

const HARI: Record<string, number> = { senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, "jum'at": 5 }
const norm = (v: string) => v.trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ')

// Pemisah koma atau titik koma (Excel Indonesia); mendukung tanda kutip.
const urai = (teks: string): string[][] => {
  const bersih = teks.replace(/^﻿/, '').trim()
  const baris = bersih.split(/\r\n|\n|\r/).filter(b => b.trim())
  const pemisah = (baris[0]?.split(';').length ?? 0) > (baris[0]?.split(',').length ?? 0) ? ';' : ','
  return baris.map((b) => {
    const sel: string[] = []
    let cur = ''
    let kutip = false
    for (let i = 0; i < b.length; i++) {
      const c = b[i]
      if (c === '"') { if (kutip && b[i + 1] === '"') { cur += '"'; i++ } else kutip = !kutip }
      else if (c === pemisah && !kutip) { sel.push(cur.trim()); cur = '' }
      else cur += c
    }
    sel.push(cur.trim())
    return sel
  })
}

const pilihBerkas = (e: Event) => {
  const input = e.target as HTMLInputElement
  const berkas = input.files?.[0]
  input.value = ''
  if (!berkas) return
  barisValid.value = []
  barisTolak.value = []
  pesanImpor.value = ''
  if (!berkas.name.toLowerCase().endsWith('.csv')) { pesanImpor.value = 'Berkas harus berformat CSV.'; return }
  namaBerkas.value = berkas.name
  const reader = new FileReader()
  reader.onload = () => {
    const tabel = urai(String(reader.result ?? ''))
    const kepala = (tabel[0] ?? []).map(norm)
    const kol = (...alias: string[]) => kepala.findIndex(h => alias.includes(h))
    const iHari = kol('hari'), iJam = kol('jam ke', 'jam'), iMapel = kol('mapel', 'mata pelajaran')
    const iGuru = kol('guru', 'nama guru'), iRuang = kol('ruang', 'ruangan')
    const hilang = [['Hari', iHari], ['Jam Ke', iJam], ['Mapel', iMapel], ['Guru', iGuru]].filter(([, i]) => i === -1).map(([n]) => n)
    if (hilang.length) { pesanImpor.value = 'Kolom wajib belum ada: ' + hilang.join(', ') + '. Gunakan template.'; return }
    if (tabel.length < 2) { pesanImpor.value = 'Berkas tidak memiliki baris data.'; return }

    const valid: BarisImpor[] = []
    const tolak: string[] = []
    tabel.slice(1).forEach((r, idx) => {
      const no = idx + 2
      const alasan: string[] = []
      const day = HARI[norm(r[iHari] ?? '')]
      if (!day) alasan.push('hari harus Senin sampai Jumat')
      const jamCocok = (r[iJam] ?? '').trim().match(/^(\d+)\s*(?:[-–]\s*(\d+))?$/)
      const mulaiKe = jamCocok ? Number(jamCocok[1]) : 0
      const selesaiKe = jamCocok ? Number(jamCocok[2] ?? jamCocok[1]) : 0
      if (!jamCocok || !waktuDariJamKe(slots.value, mulaiKe, selesaiKe)) alasan.push('Jam Ke "' + (r[iJam] ?? '') + '" di luar pola jam pelajaran')
      const mapel = jp.mapelList.value.find(m => norm(m.name) === norm(r[iMapel] ?? ''))
      if (!mapel) alasan.push('mapel "' + (r[iMapel] ?? '') + '" tidak ada di Master Mapel')
      const guruNama = norm(r[iGuru] ?? '')
      const guru = jp.guruList.value.find(g => norm(g.name) === guruNama || norm(g.name.split(',')[0]) === guruNama)
      if (!guru) alasan.push('guru "' + (r[iGuru] ?? '') + '" tidak ada di data guru')
      if (alasan.length || !mapel || !guru) { tolak.push('Baris ' + no + ': ' + alasan.join(', ') + '.'); return }
      valid.push({ day, mulaiKe, selesaiKe, subjectId: mapel.id, teacherId: guru.id, room: iRuang === -1 ? '' : (r[iRuang] ?? ''), label: 'Baris ' + no })
    })
    barisValid.value = valid
    barisTolak.value = tolak
  }
  reader.readAsText(berkas)
}

const terapkanImpor = async () => {
  if (!barisValid.value.length || sedangImpor.value) return
  sedangImpor.value = true
  const gagal: string[] = [...barisTolak.value]
  let berhasil = 0
  for (const b of barisValid.value) {
    try {
      await jp.simpanEntri(grade.value, {
        classId: props.classId, subjectId: b.subjectId, teacherId: b.teacherId,
        day: b.day, mulaiKe: b.mulaiKe, selesaiKe: b.selesaiKe, room: b.room, notes: ''
      })
      berhasil++
    } catch (e: any) {
      gagal.push(b.label + ': ' + (e?.message ?? 'gagal disimpan') + '.')
    }
  }
  sedangImpor.value = false
  barisValid.value = []
  barisTolak.value = gagal
  namaBerkas.value = ''
  pesanImpor.value = berhasil + ' jadwal berhasil diimpor' + (gagal.length ? ', ' + gagal.length + ' baris ditolak.' : '.')
}

const unduhTemplate = () => {
  const mapel = jp.mapelList.value[0]?.name ?? 'NAMA MAPEL SESUAI MASTER MAPEL'
  const guru = jp.guruList.value[0]?.name ?? 'NAMA GURU SESUAI DATA GURU'
  const q = (v: string) => '"' + v.replaceAll('"', '""') + '"'
  const isi = ['Hari,Jam Ke,Mapel,Guru,Ruang', ['Senin', '1-2', mapel, guru, ''].map(q).join(',')].join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + isi], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-jadwal-pelajaran.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const aksen = computed(() => props.jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EBC]')
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div class="min-w-0">
        <h4 class="text-sm font-extrabold text-[#101828]">
          Jadwal Pelajaran Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          {{ daftar.length }} sesi per minggu &middot; mapel dari Master Mapel
        </p>
      </div>
      <div v-if="bolehKelola" class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-xs"
          :class="aksen"
          @click="bukaTambah()"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Tambah Jadwal</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#E7EBF2] text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="importTerbuka = !importTerbuka"
        >
          <AdminV2Icon name="upload" :size="14" />
          <span>Impor Jadwal (CSV)</span>
        </button>
      </div>
    </div>

    <!-- Panel impor -->
    <div v-if="bolehKelola && importTerbuka" class="rounded-2xl border border-[#E7EBF2] bg-[#F8FAFC] p-3.5 space-y-3">
      <p class="text-xs text-[#475467] leading-relaxed">
        Kolom: <b>Hari, Jam Ke, Mapel, Guru, Ruang</b> (Ruang boleh kosong). Jam Ke boleh rentang, misalnya <b>1-2</b>.
        Mapel dan guru harus sama dengan Master Mapel dan data guru. Baris yang tidak cocok atau bentrok ditolak.
        <button type="button" class="font-bold text-[#1B5FD9] underline cursor-pointer" @click="unduhTemplate">Unduh template</button>
      </p>
      <label class="block">
        <span class="sr-only">Pilih berkas CSV jadwal</span>
        <input type="file" accept=".csv" class="block w-full text-xs text-[#475467] file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-white file:border file:text-xs file:font-bold file:text-[#101828]" @change="pilihBerkas" />
      </label>
      <p v-if="namaBerkas" class="text-xs font-semibold text-[#101828] break-all">{{ namaBerkas }}: {{ barisValid.length }} baris siap, {{ barisTolak.length }} ditolak</p>
      <p v-if="pesanImpor" class="text-xs font-semibold text-[#12459B]" role="status">{{ pesanImpor }}</p>
      <ul v-if="barisTolak.length" class="max-h-40 overflow-y-auto space-y-1 text-[11.5px] text-[#B42318]">
        <li v-for="(t, i) in barisTolak" :key="i" class="break-words">{{ t }}</li>
      </ul>
      <button
        type="button"
        class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :class="aksen"
        :disabled="!barisValid.length || sedangImpor"
        @click="terapkanImpor"
      >
        {{ sedangImpor ? 'Menyimpan…' : 'Terapkan Impor (' + barisValid.length + ' jadwal)' }}
      </button>
    </div>

    <p v-if="pesanAksi" class="rounded-xl border border-[#C9DCFB] bg-[#F5F8FF] px-3.5 py-2.5 text-xs font-semibold text-[#12459B]" role="status">{{ pesanAksi }}</p>
    <p v-if="jp.loading.value && !daftar.length" class="text-xs font-semibold text-[#667085]" role="status">Memuat jadwal…</p>
    <p v-else-if="jp.error.value" class="rounded-xl border border-[#F5C6C0] bg-[#FFF8F7] px-3.5 py-2.5 text-xs font-semibold text-[#B42318]" role="alert">{{ jp.error.value }}</p>
    <p v-else-if="!daftar.length" class="rounded-xl border border-[#E7EBF2] bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-semibold text-[#667085]" role="status">
      Belum ada jadwal pelajaran untuk rombel ini.<template v-if="bolehKelola"> Klik Tambah Jadwal atau impor lewat CSV.</template>
    </p>

    <template v-if="daftar.length">
      <!-- Timetable (md ke atas) -->
      <div class="hidden md:block border border-[#E7EBF2] rounded-2xl overflow-hidden">
        <JadwalTimetable
          :slots="slots"
          :daftar="daftar"
          :mapel-map="mapelMap"
          :guru-map="guruMap"
          :kelas-map="kelasMap"
          :sesi-map="jp.sesiMap.value"
          :hari-ini="hariIni"
          :jam-berjalan-ke="jamBerjalanKe"
          :readonly="!bolehKelola"
          @tambah="bukaTambah"
          @ubah="bukaUbah"
        />
      </div>

      <!-- Per hari (mobile): tanpa scroll horizontal -->
      <div class="md:hidden space-y-3">
        <div class="grid grid-cols-5 gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl" role="tablist">
          <button
            v-for="d in 5"
            :key="d"
            type="button"
            role="tab"
            :aria-selected="hariAktif === d"
            class="py-2 rounded-lg text-[11px] font-bold transition cursor-pointer"
            :class="hariAktif === d ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'"
            @click="hariAktif = d"
          >
            {{ HARI_NAMA[d].slice(0, 3) }}
          </button>
        </div>
        <ul class="space-y-2">
          <li
            v-for="e in jadwalHari"
            :key="e.id"
            class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"
          >
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: mapelMap[e.subjectId]?.warna ?? '#94A3B8' }" />
              <span class="text-[13px] font-extrabold text-[#101828] break-words">{{ mapelMap[e.subjectId]?.name ?? '—' }}</span>
            </div>
            <p class="mt-1 text-[11.5px] font-semibold text-[#667085]">
              {{ jpTeks(e.mulaiKe, e.selesaiKe) }} &middot; {{ e.startsAt }}–{{ e.endsAt }}
            </p>
            <p class="mt-0.5 text-[11.5px] text-[#475467] break-words">
              {{ namaGuru(e.teacherId) }}<template v-if="e.room"> &middot; {{ e.room }}</template>
            </p>
            <p v-if="e.notes" class="mt-0.5 text-[11px] text-[#98A2B3] break-words">{{ e.notes }}</p>
            <div v-if="bolehKelola" class="mt-2.5 flex items-center gap-2">
              <button type="button" class="flex-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#1B5FD9] transition cursor-pointer" @click="bukaUbah(e)">Ubah</button>
              <button type="button" class="px-3 py-2 rounded-xl text-xs font-bold text-[#D92D20] hover:bg-[#FEF3F2] transition cursor-pointer" @click="hapusEntri(e.id)">Hapus</button>
            </div>
          </li>
          <li v-if="!jadwalHari.length" class="py-6 text-center text-xs text-[#98A2B3]">
            Tidak ada jadwal pada hari {{ HARI_NAMA[hariAktif] }}.
          </li>
        </ul>
      </div>
    </template>

    <JadwalFormModal
      :open="formTerbuka" :entri-edit="entriEdit" :awal="formAwal"
      :kelas-list="kelasIni" :mapel-list="jp.mapelList.value" :guru-list="jp.guruList.value"
      :slots="slots" :entri-list="jp.entriList.value" :tingkat-order="tingkatIni" :menyimpan="menyimpan"
      @tutup="formTerbuka = false" @simpan="simpanEntri" @hapus="hapusEntri"
    />
  </div>
</template>
