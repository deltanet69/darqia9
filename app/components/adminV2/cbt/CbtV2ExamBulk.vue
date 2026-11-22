<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { pilihUnitAcak } from '~/utils/cbtCerita'
import { tugasTerpakai } from '~/utils/cbtNilai'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'
import { useRuangUjian } from '~/composables/useRuangUjian'
import { periodeUjian } from '~/composables/ruangUjianCore'

// Buat ujian: satu mapel + satu jadwal untuk satu atau banyak kelas, bank soal dipilih per kelas.
// Satu mapel satu jadwal karena siswa diacak lintas kelas ke ruang ujian (satu ruang = satu mapel pada satu jam).
// CBT (PTS/PAS): jadwal otomatis masuk ke ruang ujian periode itu (jenis + semester dari tanggal) yang berisi siswa
// kelas tersebut (migrasi 0091). LMS: ujian berakhir serentak di jam selesai (migrasi 0084).
const props = defineProps<{ grade: GradeType, source?: AssessmentSource, classId?: string }>()
const emit = defineEmits<{ (e: 'close'): void, (e: 'toast', msg: string): void }>()
const cbt = props.source === 'cbt'
const cbtData = useAdminCbtData(props.source ?? 'ujian_harian')
const ruangApi = useRuangUjian()

const tanggalLokal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const form = ref({
  name: '',
  jenis: (cbt ? 'akhir' : 'harian') as 'akhir' | 'tengah_semester' | 'harian' | 'pr',
  subjectId: '',
  tanggal: tanggalLokal(new Date(Date.now() + 86_400_000)),
  jam: '07:30',
  selesai: cbt ? '09:00' : '08:15',
  jumlahSoal: null as number | null,
  acak: true,
  tugasKe: null as number | null
})
// Kelas terpilih → bank soal kelas itu untuk mapel terpilih.
const pilih = ref<Record<string, string>>({})
const memuat = ref(true)
const menyimpan = ref(false)
const progres = ref('')
const gagal = ref<string[]>([])

onMounted(async () => {
  try { await cbtData.loadQuestions() } catch (e) { emit('toast', e instanceof Error ? e.message : 'Data gagal dimuat.') } finally { memuat.value = false }
})
const periodeRuang = computed(() => form.value.tanggal ? periodeUjian(form.value.jenis, form.value.tanggal) : '')

const menitDari = (mulai: string, selesai: string) => {
  const [a = 0, b = 0] = mulai.split(':').map(Number)
  const [c = 0, d = 0] = (selesai || '').split(':').map(Number)
  return selesai ? c * 60 + d - (a * 60 + b) : 0
}
// Isian menit manual: jam selesai = jam mulai + menit (dibatasi 23:59).
const tambahMenit = (jam: string, menit: number) => {
  const [h = 0, m = 0] = jam.split(':').map(Number)
  const t = Math.min(h * 60 + m + Math.max(0, Math.floor(menit)), 23 * 60 + 59)
  return menit > 0 ? `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` : ''
}
const nilaiMenit = (e: Event) => Number((e.target as HTMLInputElement).value) || 0
const durasi = computed(() => menitDari(form.value.jam, form.value.selesai))

const bankKelas = (classId: string) => cbtData.bankPackages.value.filter(b => b.grade === props.grade && b.classId === classId
  && b.subjectId === form.value.subjectId && b.questions.length > 0)
const mapelOpsi = computed(() => {
  const ids = new Set(cbtData.bankPackages.value.filter(b => b.grade === props.grade && b.questions.length > 0).map(b => b.subjectId))
  return cbtData.subjects.value.filter(s => ids.has(s.id)).sort((a, b) => a.name.localeCompare(b.name))
})
const kelasOpsi = computed(() => cbtData.classes.value.filter(c => c.grade === props.grade)
  .map(c => ({ id: c.id, nama: c.name, bank: bankKelas(c.id) }))
  .sort((a, b) => a.nama.localeCompare(b.nama)))
const namaKelas = (id: string) => cbtData.classes.value.find(c => c.id === id)?.name ?? '-'

// Ganti mapel: kelas yang sudah dicentang (atau kelas asal tombol) tetap dipilih bila punya bank mapel baru.
watch(() => form.value.subjectId, () => {
  const awal = Object.keys(pilih.value).length ? Object.keys(pilih.value) : props.classId ? [props.classId] : []
  pilih.value = Object.fromEntries(awal.flatMap(id => bankKelas(id)[0] ? [[id, bankKelas(id)[0]!.id]] : []))
})
const toggleKelas = (k: { id: string, bank: { id: string }[] }) => {
  if (pilih.value[k.id]) delete pilih.value[k.id]
  else if (k.bank[0]) pilih.value[k.id] = k.bank[0].id
}
const pilihSemua = () => { for (const k of kelasOpsi.value) if (k.bank[0] && !pilih.value[k.id]) pilih.value[k.id] = k.bank[0].id }
const jumlahKelas = computed(() => Object.keys(pilih.value).length)

// Satu kelas tidak boleh punya dua ujian yang jamnya beririsan.
const bentrok = (classId: string, startsAt: string) => {
  const mulai = new Date(startsAt).getTime()
  const selesai = mulai + durasi.value * 60_000
  return cbtData.exams.value.some(e => e.classId === classId && e.startsAt
    && new Date(e.startsAt).getTime() < selesai && mulai < new Date(e.startsAt).getTime() + e.duration * 60_000)
}

const simpan = async () => {
  if (menyimpan.value) return
  const f = form.value
  if (!f.name.trim()) return emit('toast', 'Nama ujian wajib diisi.')
  if (!f.subjectId) return emit('toast', 'Pilih mata pelajaran.')
  if (!jumlahKelas.value) return emit('toast', 'Pilih minimal satu kelas.')
  if (!f.tanggal || !f.jam) return emit('toast', 'Tanggal dan jam ujian wajib diisi.')
  if (durasi.value < 1) return emit('toast', 'Jam selesai harus setelah jam mulai.')
  const startsAt = `${f.tanggal}T${f.jam}`
  const kelas = Object.keys(pilih.value)
  gagal.value = []
  // Cek semua kelas dulu, agar tidak ada ujian yang terlanjur dibuat dengan jadwal bentrok.
  for (const classId of kelas) {
    if (bentrok(classId, startsAt)) gagal.value.push(`${namaKelas(classId)}: jamnya beririsan dengan ujian lain di kelas ini.`)
    else if (!cbt && f.tugasKe) {
      const dipakai = tugasTerpakai(cbtData.exams.value, { classId, subjectId: f.subjectId, startsAt }).get(f.tugasKe)
      if (dipakai) gagal.value.push(`${namaKelas(classId)}: Nilai Tugas ke-${f.tugasKe} sudah dipakai ujian "${dipakai}" di semester ini.`)
    }
  }
  if (gagal.value.length) return emit('toast', 'Perbaiki kelas yang ditandai dulu.')
  menyimpan.value = true
  let berhasil = 0
  let ditolakRuang = 0
  try {
    for (const [i, classId] of kelas.entries()) {
      progres.value = `Menyimpan ujian ${i + 1} dari ${kelas.length}…`
      const bank = cbtData.bankPackages.value.find(b => b.id === pilih.value[classId])
      if (!bank) { gagal.value.push(`${namaKelas(classId)}: bank soal tidak ditemukan.`); continue }
      const urut = [...bank.questions].sort((a, c) => a.number - c.number)
      const n = Math.floor(Number(f.jumlahSoal) || 0)
      const questionIds = n > 0 && n < urut.length ? pilihUnitAcak(urut, n, Math.random) : urut.map(q => q.id)
      try {
        await cbtData.saveExam({
          name: f.name.trim(), classId, subjectId: f.subjectId, questionBankId: bank.id, questionIds,
          startsAt, duration: durasi.value, jenis: f.jenis, tugasKe: cbt ? undefined : f.tugasKe,
          acakPg: f.acak, acakSingkat: f.acak, acakEsai: f.acak
        }, false)
        berhasil++
      } catch (e) { gagal.value.push(`${namaKelas(classId)}: ${e instanceof Error ? e.message : 'gagal disimpan.'}`) }
    }
    // Jadwal langsung masuk ke ruang ujian periode ini; yang bentrok di ruang tampil di menu Jadwal Ujian ruangnya.
    if (cbt && berhasil) {
      progres.value = 'Memasukkan jadwal ke ruang ujian…'
      try {
        for (const r of await ruangApi.muatRuang(props.grade, periodeRuang.value)) ditolakRuang += (await ruangApi.sinkronJadwal(r.id)).length
      } catch { ditolakRuang = -1 }
    }
  } finally {
    progres.value = 'Memuat ulang daftar ujian…'
    try { await cbtData.load(true) } catch { /* daftar disegarkan saat halaman dibuka ulang */ }
    menyimpan.value = false
    progres.value = ''
  }
  const ruang = ditolakRuang > 0 ? ` ${ditolakRuang} jadwal belum bisa masuk ruang ujian, lihat alasannya di menu Jadwal Ujian ruangnya.`
    : ditolakRuang < 0 ? ' Jadwal masuk ke ruang ujian saat ruangnya dibuka.' : ''
  emit('toast', gagal.value.length ? `${berhasil} ujian dibuat, ${gagal.value.length} gagal. Lihat rinciannya.${ruang}` : `${berhasil} ujian berhasil dibuat dan ditayangkan.${ruang}`)
  if (!gagal.value.length) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="bulk-judul" @keydown.esc="!menyimpan && emit('close')">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col shadow-2xl border border-[#E7EBF2] text-xs">
        <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">{{ cbt ? 'Ujian CBT (PTS/PAS)' : 'Superadmin · Ujian LMS' }}</span>
            <h3 id="bulk-judul" class="text-base font-extrabold text-[#101828] mt-0.5">Buat Ujian</h3>
          </div>
          <button type="button" class="w-11 h-11 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]" aria-label="Tutup" :disabled="menyimpan" @click="emit('close')">
            <AdminV2Icon name="x" :size="16" />
          </button>
        </div>

        <div class="p-5 space-y-3.5 overflow-y-auto">
          <p class="p-3 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] font-semibold">
            <template v-if="cbt">Satu mapel dan satu jadwal untuk semua kelas yang dicentang; tiap kelas memakai bank soalnya sendiri. Jadwal otomatis masuk ke ruang ujian yang berisi siswa kelas tersebut. Pengawas ditugaskan di Ruang Ujian, menu Jadwal Ujian.</template>
            <template v-else>Satu mapel dan satu jadwal untuk semua kelas yang dicentang; tiap kelas memakai bank soalnya sendiri. Semua siswa selesai serentak di jam selesai.</template>
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label for="bulk-nama" class="block font-bold text-[#344054] mb-1">Nama Ujian *</label>
              <input id="bulk-nama" v-model="form.name" type="text" :placeholder="cbt ? 'Contoh: Penilaian Akhir Semester Ganjil' : 'Contoh: Ulangan Harian Bab 1'" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-jenis" class="block font-bold text-[#344054] mb-1">Jenis Ujian</label>
              <select id="bulk-jenis" v-model="form.jenis" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white outline-none">
                <template v-if="cbt">
                  <option value="akhir">Ujian Akhir (PAS)</option>
                  <option value="tengah_semester">Ujian Tengah Semester (PTS)</option>
                </template>
                <template v-else>
                  <option value="harian">Ujian Harian</option>
                  <option value="pr">PR di Rumah</option>
                </template>
              </select>
            </div>
            <div v-if="cbt">
              <span class="block font-bold text-[#344054] mb-1">Masuk ke ruang ujian periode</span>
              <p class="min-h-11 flex items-center rounded-xl bg-[#F6F8FC] px-2.5 font-bold text-[#0A2A5C]" aria-live="polite">{{ periodeRuang || '-' }}</p>
            </div>
            <div v-else>
              <label for="bulk-tugas" class="block font-bold text-[#344054] mb-1">Masuk Nilai Tugas (Agenda Mengajar)</label>
              <select id="bulk-tugas" v-model="form.tugasKe" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white outline-none">
                <option :value="null">Tidak dimasukkan ke nilai tugas</option>
                <option v-for="n in 10" :key="n" :value="n">Tugas ke-{{ n }}</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label for="bulk-mapel" class="block font-bold text-[#344054] mb-1">Mata Pelajaran *</label>
              <select id="bulk-mapel" v-model="form.subjectId" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white outline-none">
                <option value="" disabled>{{ memuat ? 'Memuat…' : mapelOpsi.length ? 'Pilih mata pelajaran' : 'Belum ada bank soal berisi soal' }}</option>
                <option v-for="s in mapelOpsi" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label for="bulk-tanggal" class="block font-bold text-[#344054] mb-1">Tanggal *</label>
              <input id="bulk-tanggal" v-model="form.tanggal" type="date" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-jam" class="block font-bold text-[#344054] mb-1">Jam mulai *</label>
              <input id="bulk-jam" v-model="form.jam" type="time" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-selesai" class="block font-bold text-[#344054] mb-1">Jam selesai *</label>
              <input id="bulk-selesai" v-model="form.selesai" type="time" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-waktu" class="block font-bold text-[#344054] mb-1">Waktu ujian (menit)</label>
              <input id="bulk-waktu" :value="durasi > 0 ? durasi : ''" type="number" min="1" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]" @input="form.selesai = tambahMenit(form.jam, nilaiMenit($event))">
            </div>
            <div>
              <label for="bulk-jumlah" class="block font-bold text-[#344054] mb-1">Jumlah soal per ujian</label>
              <input id="bulk-jumlah" v-model.number="form.jumlahSoal" type="number" min="1" placeholder="Kosong = semua soal di bank" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <label class="flex min-h-11 items-center gap-2 cursor-pointer sm:self-end">
              <input v-model="form.acak" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]">
              <span class="font-bold text-[#344054]">Acak soal untuk semua bank terpilih</span>
            </label>
          </div>
          <p class="text-[#667085]">
            Acak = urutan soal dan pilihan jawaban berbeda tiap siswa. Bila jumlah soal diisi, soal diambil acak dari bank; soal cerita selalu ikut utuh.
          </p>

          <div class="flex items-center justify-between gap-2">
            <p class="font-bold text-[#0A2A5C]" aria-live="polite">{{ jumlahKelas }} kelas dipilih</p>
            <button v-if="form.subjectId" type="button" class="min-h-11 px-2 font-bold text-[#1B5FD9] underline" @click="pilihSemua">Pilih semua kelas</button>
          </div>
          <p v-if="memuat" role="status">Memuat bank soal…</p>
          <p v-else-if="!form.subjectId" class="p-3 rounded-xl bg-[#F6F8FC] text-[#43506B]">Pilih mata pelajaran dulu untuk menampilkan kelas dan bank soalnya.</p>
          <ul v-else class="rounded-xl border border-[#E7EBF2] divide-y divide-[#E7EBF2]">
            <li v-for="k in kelasOpsi" :key="k.id" class="flex flex-wrap items-center gap-2 px-3 py-2">
              <label class="flex min-h-11 flex-1 items-center gap-2" :class="k.bank.length ? 'cursor-pointer' : 'opacity-60'">
                <input type="checkbox" class="h-4 w-4 shrink-0 accent-[#1B5FD9]" :checked="!!pilih[k.id]" :disabled="!k.bank.length" @change="toggleKelas(k)">
                <b class="text-[#101828]">{{ k.nama }}</b>
                <span v-if="!k.bank.length" class="text-[#667085]">· belum ada bank soal mapel ini</span>
              </label>
              <select v-if="pilih[k.id]" v-model="pilih[k.id]" :aria-label="`Bank soal ${k.nama}`" class="min-h-11 max-w-full sm:w-72 border border-[#E7EBF2] rounded-xl px-2.5 bg-white outline-none focus:border-[#1B5FD9]">
                <option v-for="b in k.bank" :key="b.id" :value="b.id">{{ b.name || 'Bank soal' }} ({{ b.questions.length }} soal)</option>
              </select>
            </li>
          </ul>

          <div v-if="gagal.length" role="alert" class="p-3 rounded-xl bg-[#FEF3F2] text-[#B42318] space-y-1">
            <p class="font-bold">Ujian yang belum dibuat:</p>
            <ul class="list-disc pl-4"><li v-for="(g, i) in gagal" :key="i">{{ g }}</li></ul>
          </div>
        </div>

        <div class="p-4 border-t border-[#E7EBF2] bg-[#FAFBFC] flex items-center justify-between gap-2">
          <span class="text-[#667085]" role="status">{{ progres }}</span>
          <div class="flex items-center gap-2">
            <button type="button" class="min-h-11 px-4 rounded-xl border border-[#E7EBF2] font-bold text-[#344054]" :disabled="menyimpan" @click="emit('close')">Batal</button>
            <button type="button" class="min-h-11 px-5 rounded-xl bg-[#101828] text-white font-bold disabled:opacity-60" :disabled="menyimpan || memuat || !jumlahKelas" @click="simpan">{{ menyimpan ? 'Menyimpan…' : `Buat ${jumlahKelas} Ujian` }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
