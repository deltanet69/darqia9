<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pilihUnitAcak } from '~/utils/cbtCerita'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { BankPackage, GradeType } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'
import { useKartuUjian, type PeriodeKartu } from '~/composables/useKartuUjian'

// Superadmin: satu ujian per bank soal terpilih (banyak kelas + banyak mapel sekaligus).
// Tanggal & jam diatur per mapel. CBT (PTS/PAS): di dalam periode ujian (tab Kartu Ujian), durasi dari isian.
// LMS: jam mulai + jam selesai; durasi = selisihnya (ujian berakhir serentak di jam selesai, migrasi 0084).
const props = defineProps<{ grade: GradeType, source?: AssessmentSource }>()
const emit = defineEmits<{ (e: 'close'): void, (e: 'toast', msg: string): void }>()
const cbt = props.source === 'cbt'
const cbtData = useAdminCbtData(props.source ?? 'ujian_harian')
const kartu = useKartuUjian('cbt')

const tanggalLokal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const form = ref({
  name: '',
  jenis: (cbt ? 'akhir' : 'harian') as 'akhir' | 'tengah_semester' | 'harian' | 'pr',
  tanggal: tanggalLokal(new Date(Date.now() + 86_400_000)),
  jam: '07:30',
  selesai: '08:15',
  periodeId: '',
  durasi: (cbt ? 90 : null) as number | null,
  jumlahSoal: null as number | null
})
const pilih = ref<string[]>([])
// Tanggal + jam per bank terpilih (awal = tanggal mulai periode CBT / tanggal bawaan, dan jam bawaan).
const jadwal = ref<Record<string, { tanggal: string, jam: string, selesai: string }>>({})
const periode = ref<PeriodeKartu[]>([])
const cari = ref('')
const memuat = ref(true)
const menyimpan = ref(false)
const progres = ref('')
const gagal = ref<string[]>([])

onMounted(async () => {
  try {
    await cbtData.loadQuestions()
    if (cbt) {
      periode.value = (await kartu.muatPeriode(props.grade, 'cbt')).sort((a, b) => b.startsOn.localeCompare(a.startsOn))
      form.value.periodeId = periode.value.find(p => p.endsOn >= tanggalLokal(new Date()))?.id ?? periode.value[0]?.id ?? ''
    }
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Data gagal dimuat.') } finally { memuat.value = false }
})
const periodeAktif = computed(() => periode.value.find(p => p.id === form.value.periodeId))

const namaKelas = (id?: string) => cbtData.classes.value.find(c => c.id === id)?.name ?? '-'
const namaMapel = (id?: string) => cbtData.subjects.value.find(s => s.id === id)?.name ?? '-'
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

const grupKelas = computed(() => {
  const q = cari.value.trim().toLowerCase()
  const bank = cbtData.bankPackages.value.filter(b => b.grade === props.grade && b.classId && b.subjectId
    && (!q || `${namaKelas(b.classId)} ${namaMapel(b.subjectId)} ${b.name ?? ''}`.toLowerCase().includes(q)))
  return [...new Set(bank.map(b => b.classId!))]
    .map(id => ({ id, nama: namaKelas(id), bank: bank.filter(b => b.classId === id).sort((a, b) => namaMapel(a.subjectId).localeCompare(namaMapel(b.subjectId))) }))
    .sort((a, b) => a.nama.localeCompare(b.nama))
})
const bisaDipilih = (b: BankPackage) => b.questions.length > 0

// Satu kelas+mapel hanya satu bank: memilih bank lain di kelas+mapel yang sama menggantikan pilihan sebelumnya.
const toggle = (b: BankPackage) => {
  if (pilih.value.includes(b.id)) { pilih.value = pilih.value.filter(id => id !== b.id); return }
  const sama = cbtData.bankPackages.value.filter(x => x.classId === b.classId && x.subjectId === b.subjectId).map(x => x.id)
  pilih.value = [...pilih.value.filter(id => !sama.includes(id)), b.id]
  if (!jadwal.value[b.id]) jadwal.value[b.id] = { tanggal: (cbt && periodeAktif.value?.startsOn) || form.value.tanggal, jam: form.value.jam, selesai: form.value.selesai }
}
const pilihSemuaKelas = (bank: BankPackage[]) => { for (const b of bank) if (bisaDipilih(b) && !pilih.value.includes(b.id)) toggle(b) }

// Jadwal tiap bank terpilih: { startsAt (datetime-local), durasi } atau pesan kenapa tidak bisa.
const rencana = (b: BankPackage): { startsAt: string, durasi: number } | string => {
  const j = jadwal.value[b.id]
  if (!j?.tanggal || !j.jam) return 'tanggal dan jam ujian wajib diisi.'
  if (!cbt) {
    const durasi = menitDari(j.jam, j.selesai)
    return durasi > 0 ? { startsAt: `${j.tanggal}T${j.jam}`, durasi } : 'jam selesai harus setelah jam mulai.'
  }
  const durasiInput = Math.floor(Number(form.value.durasi) || 0)
  const p = periodeAktif.value
  if (p && (j.tanggal < p.startsOn || j.tanggal > p.endsOn)) return `tanggal di luar periode ${p.periode} (${p.startsOn} s.d. ${p.endsOn}).`
  if (durasiInput < 1) return 'durasi ujian wajib diisi.'
  return { startsAt: `${j.tanggal}T${j.jam}`, durasi: durasiInput }
}

// Dua ujian di kelas yang sama tidak boleh beririsan jam (termasuk ujian yang sudah ada).
const bentrok = (b: BankPackage, r: { startsAt: string, durasi: number }, daftar: BankPackage[]) => {
  const mulai = new Date(r.startsAt).getTime()
  const selesai = mulai + r.durasi * 60_000
  const iris = (m: number, d: number) => m < selesai && mulai < m + d * 60_000
  const lain = daftar.filter(x => x.id !== b.id && x.classId === b.classId).map(rencana)
    .some(x => typeof x !== 'string' && iris(new Date(x.startsAt).getTime(), x.durasi))
  return lain || cbtData.exams.value.some(e => e.classId === b.classId && e.startsAt && iris(new Date(e.startsAt).getTime(), e.duration))
}

const simpan = async () => {
  if (menyimpan.value) return
  const f = form.value
  if (!f.name.trim()) return emit('toast', 'Nama ujian wajib diisi.')
  if (cbt && !periodeAktif.value) return emit('toast', 'Pilih periode ujian. Buat dulu periodenya di tab Kartu Ujian.')
  if (!pilih.value.length) return emit('toast', 'Pilih minimal satu bank soal.')
  const daftar = cbtData.bankPackages.value.filter(b => pilih.value.includes(b.id))
  gagal.value = []
  // Cek semua jadwal dulu, agar tidak ada ujian yang terlanjur dibuat dengan jadwal bentrok.
  for (const b of daftar) {
    const r = rencana(b)
    const label = `${namaKelas(b.classId)} · ${namaMapel(b.subjectId)}`
    if (typeof r === 'string') gagal.value.push(`${label}: ${r}`)
    else if (bentrok(b, r, daftar)) gagal.value.push(`${label}: jamnya beririsan dengan ujian lain di kelas ini.`)
  }
  if (gagal.value.length) return emit('toast', 'Perbaiki jadwal yang ditandai dulu.')
  menyimpan.value = true
  let berhasil = 0
  try {
    for (const [i, b] of daftar.entries()) {
      progres.value = `Menyimpan ujian ${i + 1} dari ${daftar.length}…`
      const label = `${namaKelas(b.classId)} · ${namaMapel(b.subjectId)}`
      const r = rencana(b)
      if (typeof r === 'string') { gagal.value.push(`${label}: ${r}`); continue }
      const urut = [...b.questions].sort((a, c) => a.number - c.number)
      const n = Math.floor(Number(f.jumlahSoal) || 0)
      const questionIds = n > 0 && n < urut.length ? pilihUnitAcak(urut, n, Math.random) : urut.map(q => q.id)
      try {
        await cbtData.saveExam({
          name: f.name.trim(), classId: b.classId!, subjectId: b.subjectId!, questionBankId: b.id, questionIds,
          startsAt: r.startsAt, duration: r.durasi, jenis: f.jenis
        }, false)
        berhasil++
      } catch (e) { gagal.value.push(`${label}: ${e instanceof Error ? e.message : 'gagal disimpan.'}`) }
    }
  } finally {
    progres.value = 'Memuat ulang daftar ujian…'
    try { await cbtData.load(true) } catch { /* daftar disegarkan saat halaman dibuka ulang */ }
    menyimpan.value = false
    progres.value = ''
  }
  emit('toast', gagal.value.length ? `${berhasil} ujian dibuat, ${gagal.value.length} gagal. Lihat rinciannya.` : `${berhasil} ujian berhasil dibuat dan ditayangkan.`)
  if (!gagal.value.length) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="bulk-judul" @keydown.esc="!menyimpan && emit('close')">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col shadow-2xl border border-[#E7EBF2] text-xs">
        <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">Superadmin · {{ cbt ? 'Ujian CBT (PTS/PAS)' : 'Ujian LMS' }}</span>
            <h3 id="bulk-judul" class="text-base font-extrabold text-[#101828] mt-0.5">Buat Ujian Banyak Kelas</h3>
          </div>
          <button type="button" class="w-11 h-11 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]" aria-label="Tutup" :disabled="menyimpan" @click="emit('close')">
            <AdminV2Icon name="x" :size="16" />
          </button>
        </div>

        <div class="p-5 space-y-3.5 overflow-y-auto">
          <p class="p-3 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] font-semibold">
            <template v-if="cbt">Satu ujian dibuat untuk setiap bank soal yang dicentang. Tanggal dan jam diatur per mapel di dalam periode ujian PTS/PAS, tidak mengikuti jadwal pelajaran.</template>
            <template v-else>Satu ujian dibuat untuk setiap bank soal yang dicentang. Waktu ujian siswa dihitung dari jam mulai sampai jam selesai, dan semua siswa selesai serentak di jam selesai.</template>
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
              <label for="bulk-periode" class="block font-bold text-[#344054] mb-1">Periode Ujian *</label>
              <select id="bulk-periode" v-model="form.periodeId" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white outline-none">
                <option value="" disabled>{{ periode.length ? 'Pilih periode' : 'Belum ada periode' }}</option>
                <option v-for="p in periode" :key="p.id" :value="p.id">{{ p.periode }} ({{ p.startsOn }} s.d. {{ p.endsOn }})</option>
              </select>
              <p v-if="!memuat && !periode.length" class="mt-1 text-[11px] text-[#B42318]">Buat dulu periode PTS/PAS di tab Kartu Ujian.</p>
            </div>
            <div v-else>
              <label for="bulk-tanggal" class="block font-bold text-[#344054] mb-1">Tanggal ujian bawaan</label>
              <input id="bulk-tanggal" v-model="form.tanggal" type="date" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-jam" class="block font-bold text-[#344054] mb-1">Jam mulai bawaan</label>
              <input id="bulk-jam" v-model="form.jam" type="time" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div v-if="!cbt">
              <label for="bulk-selesai" class="block font-bold text-[#344054] mb-1">Jam selesai bawaan</label>
              <input id="bulk-selesai" v-model="form.selesai" type="time" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div v-if="!cbt">
              <label for="bulk-waktu" class="block font-bold text-[#344054] mb-1">Waktu ujian bawaan (menit)</label>
              <input id="bulk-waktu" :value="menitDari(form.jam, form.selesai) > 0 ? menitDari(form.jam, form.selesai) : ''" type="number" min="1" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]" @input="form.selesai = tambahMenit(form.jam, nilaiMenit($event))">
            </div>
            <div v-if="cbt">
              <label for="bulk-durasi" class="block font-bold text-[#344054] mb-1">Durasi (menit) *</label>
              <input id="bulk-durasi" v-model.number="form.durasi" type="number" min="1" placeholder="90" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-jumlah" class="block font-bold text-[#344054] mb-1">Jumlah soal per ujian</label>
              <input id="bulk-jumlah" v-model.number="form.jumlahSoal" type="number" min="1" placeholder="Kosong = semua soal di bank" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
          </div>
          <p class="text-[#667085]">
            Tanggal dan jam tiap mapel bisa diubah di daftar bawah setelah dicentang. Ujian di kelas yang sama tidak boleh beririsan jam.
            Bila jumlah soal diisi, soal diacak dan soal cerita selalu ikut utuh.
          </p>

          <div class="flex items-center justify-between gap-2">
            <p class="font-bold text-[#0A2A5C]" aria-live="polite">{{ pilih.length }} bank soal dipilih</p>
            <input v-model="cari" type="search" aria-label="Cari kelas, mapel, atau bank" placeholder="Cari kelas / mapel…" class="w-48 min-h-11 border border-[#E7EBF2] rounded-xl px-3 outline-none focus:border-[#1B5FD9]">
          </div>
          <p v-if="memuat" role="status">Memuat bank soal…</p>
          <p v-else-if="!grupKelas.length" class="p-3 rounded-xl bg-[#F6F8FC] text-[#43506B]">Belum ada bank soal {{ cbt ? 'CBT' : 'LMS' }} di jenjang ini.</p>
          <template v-else>
          <section v-for="k in grupKelas" :key="k.id" class="rounded-xl border border-[#E7EBF2]">
            <div class="flex items-center justify-between gap-2 px-3 py-2 bg-[#F6F8FC] rounded-t-xl">
              <h4 class="font-extrabold text-[#101828]">{{ k.nama }}</h4>
              <button type="button" class="min-h-11 px-2 font-bold text-[#1B5FD9] underline" @click="pilihSemuaKelas(k.bank)">Pilih semua</button>
            </div>
            <div v-for="b in k.bank" :key="b.id" class="border-t border-[#E7EBF2] px-3 py-2.5 space-y-2">
              <label class="flex min-h-11 items-start gap-2" :class="bisaDipilih(b) ? 'cursor-pointer' : 'opacity-60'">
                <input type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 accent-[#1B5FD9]" :checked="pilih.includes(b.id)" :disabled="!bisaDipilih(b)" @change="toggle(b)">
                <span class="min-w-0 flex-1">
                  <b class="block text-[#101828] break-words">{{ namaMapel(b.subjectId) }} · {{ b.name || 'Bank soal' }}</b>
                  <span class="block text-[#667085]">
                    {{ b.questions.length }} soal
                  </span>
                </span>
              </label>
              <div v-if="pilih.includes(b.id) && jadwal[b.id]" class="flex flex-wrap items-center gap-2 pl-6">
                <input v-model="jadwal[b.id]!.tanggal" type="date" :min="cbt ? periodeAktif?.startsOn : undefined" :max="cbt ? periodeAktif?.endsOn : undefined" :aria-label="`Tanggal ujian ${k.nama} ${namaMapel(b.subjectId)}`" class="min-h-11 border border-[#E7EBF2] rounded-xl px-2.5 outline-none focus:border-[#1B5FD9]">
                <input v-model="jadwal[b.id]!.jam" type="time" :aria-label="`Jam mulai ujian ${k.nama} ${namaMapel(b.subjectId)}`" class="min-h-11 border border-[#E7EBF2] rounded-xl px-2.5 outline-none focus:border-[#1B5FD9]">
                <template v-if="!cbt">
                  <span class="text-[#667085]">s.d.</span>
                  <input v-model="jadwal[b.id]!.selesai" type="time" :aria-label="`Jam selesai ujian ${k.nama} ${namaMapel(b.subjectId)}`" class="min-h-11 border border-[#E7EBF2] rounded-xl px-2.5 outline-none focus:border-[#1B5FD9]">
                  <input :value="menitDari(jadwal[b.id]!.jam, jadwal[b.id]!.selesai) > 0 ? menitDari(jadwal[b.id]!.jam, jadwal[b.id]!.selesai) : ''" type="number" min="1" :aria-label="`Waktu ujian (menit) ${k.nama} ${namaMapel(b.subjectId)}`" class="w-20 min-h-11 border border-[#E7EBF2] rounded-xl px-2.5 outline-none focus:border-[#1B5FD9]" @input="jadwal[b.id]!.selesai = tambahMenit(jadwal[b.id]!.jam, nilaiMenit($event))">
                  <span class="text-[#667085]">menit</span>
                </template>
              </div>
            </div>
          </section>
          </template>

          <div v-if="gagal.length" role="alert" class="p-3 rounded-xl bg-[#FEF3F2] text-[#B42318] space-y-1">
            <p class="font-bold">Ujian yang belum dibuat:</p>
            <ul class="list-disc pl-4"><li v-for="(g, i) in gagal" :key="i">{{ g }}</li></ul>
          </div>
        </div>

        <div class="p-4 border-t border-[#E7EBF2] bg-[#FAFBFC] flex items-center justify-between gap-2">
          <span class="text-[#667085]" role="status">{{ progres }}</span>
          <div class="flex items-center gap-2">
            <button type="button" class="min-h-11 px-4 rounded-xl border border-[#E7EBF2] font-bold text-[#344054]" :disabled="menyimpan" @click="emit('close')">Batal</button>
            <button type="button" class="min-h-11 px-5 rounded-xl bg-[#101828] text-white font-bold disabled:opacity-60" :disabled="menyimpan || memuat || !pilih.length" @click="simpan">{{ menyimpan ? 'Menyimpan…' : `Buat ${pilih.length} Ujian` }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
