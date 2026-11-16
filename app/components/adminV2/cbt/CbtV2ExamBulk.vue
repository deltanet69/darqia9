<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pilihUnitAcak } from '~/utils/cbtCerita'
import { slotMendatang } from '~/utils/cbtJadwalUjian'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { BankPackage, GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'

// Superadmin: satu ujian LMS per bank soal terpilih (banyak kelas + banyak mapel sekaligus).
// Jam tiap ujian = jam pelajaran pertama mapel itu di kelasnya, mulai dari tanggal yang dipilih.
const props = defineProps<{ grade: GradeType }>()
const emit = defineEmits<{ (e: 'close'): void, (e: 'toast', msg: string): void }>()
const cbtData = useAdminCbtData('ujian_harian')

const tanggalLokal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const form = ref({
  name: '',
  jenis: 'harian' as 'harian' | 'pr',
  tanggal: tanggalLokal(new Date(Date.now() + 86_400_000)),
  durasi: null as number | null,
  jumlahSoal: null as number | null
})
const pilih = ref<string[]>([])
const cari = ref('')
const memuat = ref(true)
const menyimpan = ref(false)
const progres = ref('')
const gagal = ref<string[]>([])

onMounted(async () => {
  try { await cbtData.loadQuestions() } catch (e) { emit('toast', e instanceof Error ? e.message : 'Soal gagal dimuat.') } finally { memuat.value = false }
})

const namaKelas = (id?: string) => cbtData.classes.value.find(c => c.id === id)?.name ?? '-'
const namaMapel = (id?: string) => cbtData.subjects.value.find(s => s.id === id)?.name ?? '-'
// Jam pelajaran pertama mulai dari tanggal pilihan (cari sampai 7 hari ke depan).
const slotBank = (b: BankPackage) => {
  const [y, m, d] = form.value.tanggal.split('-').map(Number)
  if (!y || !m || !d || !b.classId || !b.subjectId) return undefined
  return slotMendatang(cbtData.jadwalUjian(b.classId, b.subjectId), new Date(y, m - 1, d), 7)[0]
}
const labelSlot = (startsAt: string) => new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(startsAt))

const grupKelas = computed(() => {
  const q = cari.value.trim().toLowerCase()
  const bank = cbtData.bankPackages.value.filter(b => b.grade === props.grade && b.classId && b.subjectId
    && (!q || `${namaKelas(b.classId)} ${namaMapel(b.subjectId)} ${b.name ?? ''}`.toLowerCase().includes(q)))
  return [...new Set(bank.map(b => b.classId!))]
    .map(id => ({ id, nama: namaKelas(id), bank: bank.filter(b => b.classId === id).sort((a, b) => namaMapel(a.subjectId).localeCompare(namaMapel(b.subjectId))) }))
    .sort((a, b) => a.nama.localeCompare(b.nama))
})
const bisaDipilih = (b: BankPackage) => b.questions.length > 0 && !!slotBank(b)

// Satu kelas+mapel hanya satu bank: memilih bank lain di kelas+mapel yang sama menggantikan pilihan sebelumnya.
const toggle = (b: BankPackage) => {
  if (pilih.value.includes(b.id)) { pilih.value = pilih.value.filter(id => id !== b.id); return }
  const sama = cbtData.bankPackages.value.filter(x => x.classId === b.classId && x.subjectId === b.subjectId).map(x => x.id)
  pilih.value = [...pilih.value.filter(id => !sama.includes(id)), b.id]
}
const pilihSemuaKelas = (bank: BankPackage[]) => { for (const b of bank) if (bisaDipilih(b) && !pilih.value.includes(b.id)) toggle(b) }

const simpan = async () => {
  if (menyimpan.value) return
  const f = form.value
  if (!f.name.trim()) return emit('toast', 'Nama ujian wajib diisi.')
  if (!pilih.value.length) return emit('toast', 'Pilih minimal satu bank soal.')
  menyimpan.value = true
  gagal.value = []
  let berhasil = 0
  const daftar = cbtData.bankPackages.value.filter(b => pilih.value.includes(b.id))
  try {
    for (const [i, b] of daftar.entries()) {
      progres.value = `Menyimpan ujian ${i + 1} dari ${daftar.length}…`
      const label = `${namaKelas(b.classId)} · ${namaMapel(b.subjectId)}`
      const slot = slotBank(b)
      if (!slot) { gagal.value.push(`${label}: tidak ada jam pelajaran dalam 7 hari sejak tanggal mulai.`); continue }
      const urut = [...b.questions].sort((a, c) => a.number - c.number)
      const n = Math.floor(Number(f.jumlahSoal) || 0)
      const questionIds = n > 0 && n < urut.length ? pilihUnitAcak(urut, n, Math.random) : urut.map(q => q.id)
      try {
        await cbtData.saveExam({
          name: f.name.trim(), classId: b.classId!, subjectId: b.subjectId!, questionBankId: b.id, questionIds,
          startsAt: slot.startsAt, duration: Math.min(Math.floor(Number(f.durasi) || slot.menit), slot.menit), jenis: f.jenis
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
            <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">Superadmin · Ujian LMS</span>
            <h3 id="bulk-judul" class="text-base font-extrabold text-[#101828] mt-0.5">Buat Ujian Banyak Kelas</h3>
          </div>
          <button type="button" class="w-11 h-11 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]" aria-label="Tutup" :disabled="menyimpan" @click="emit('close')">
            <AdminV2Icon name="x" :size="16" />
          </button>
        </div>

        <div class="p-5 space-y-3.5 overflow-y-auto">
          <p class="p-3 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] font-semibold">Satu ujian dibuat untuk setiap bank soal yang dicentang. Jam ujian otomatis memakai jam pelajaran mapel itu di kelasnya, pertama kali mulai dari tanggal yang dipilih.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label for="bulk-nama" class="block font-bold text-[#344054] mb-1">Nama Ujian *</label>
              <input id="bulk-nama" v-model="form.name" type="text" placeholder="Contoh: Ulangan Harian Bab 1" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-jenis" class="block font-bold text-[#344054] mb-1">Jenis Ujian</label>
              <select id="bulk-jenis" v-model="form.jenis" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white outline-none">
                <option value="harian">Ujian Harian</option>
                <option value="pr">PR di Rumah</option>
              </select>
            </div>
            <div>
              <label for="bulk-tanggal" class="block font-bold text-[#344054] mb-1">Mulai dari tanggal</label>
              <input id="bulk-tanggal" v-model="form.tanggal" type="date" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-durasi" class="block font-bold text-[#344054] mb-1">Durasi (menit)</label>
              <input id="bulk-durasi" v-model.number="form.durasi" type="number" min="1" placeholder="Kosong = sepanjang jam pelajaran" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
            <div>
              <label for="bulk-jumlah" class="block font-bold text-[#344054] mb-1">Jumlah soal per ujian</label>
              <input id="bulk-jumlah" v-model.number="form.jumlahSoal" type="number" min="1" placeholder="Kosong = semua soal di bank" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 outline-none focus:border-[#1B5FD9]">
            </div>
          </div>
          <p class="text-[#667085]">Durasi lebih dari jam pelajaran otomatis dipotong. Bila jumlah soal diisi, soal diacak dan soal cerita selalu ikut utuh.</p>

          <div class="flex items-center justify-between gap-2">
            <p class="font-bold text-[#0A2A5C]" aria-live="polite">{{ pilih.length }} bank soal dipilih</p>
            <input v-model="cari" type="search" aria-label="Cari kelas, mapel, atau bank" placeholder="Cari kelas / mapel…" class="w-48 min-h-11 border border-[#E7EBF2] rounded-xl px-3 outline-none focus:border-[#1B5FD9]">
          </div>
          <p v-if="memuat" role="status">Memuat bank soal…</p>
          <p v-else-if="!grupKelas.length" class="p-3 rounded-xl bg-[#F6F8FC] text-[#43506B]">Belum ada bank soal LMS di jenjang ini.</p>
          <template v-else>
          <section v-for="k in grupKelas" :key="k.id" class="rounded-xl border border-[#E7EBF2]">
            <div class="flex items-center justify-between gap-2 px-3 py-2 bg-[#F6F8FC] rounded-t-xl">
              <h4 class="font-extrabold text-[#101828]">{{ k.nama }}</h4>
              <button type="button" class="min-h-11 px-2 font-bold text-[#1B5FD9] underline" @click="pilihSemuaKelas(k.bank)">Pilih semua</button>
            </div>
            <label v-for="b in k.bank" :key="b.id" class="flex min-h-11 items-start gap-2 px-3 py-2.5 border-t border-[#E7EBF2]" :class="bisaDipilih(b) ? 'cursor-pointer' : 'opacity-60'">
              <input type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 accent-[#1B5FD9]" :checked="pilih.includes(b.id)" :disabled="!bisaDipilih(b)" @change="toggle(b)">
              <span class="min-w-0 flex-1">
                <b class="block text-[#101828] break-words">{{ namaMapel(b.subjectId) }} · {{ b.name || 'Bank soal' }}</b>
                <span class="block text-[#667085]">
                  {{ b.questions.length }} soal ·
                  <template v-if="slotBank(b)">{{ labelSlot(slotBank(b)!.startsAt) }} ({{ slotBank(b)!.menit }} menit)</template>
                  <template v-else>Tidak ada di Jadwal Pelajaran dalam 7 hari sejak tanggal mulai</template>
                </span>
              </span>
            </label>
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
