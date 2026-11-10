<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  HARI_NAMA, cariBentrok, waktuDariJamKe,
  type EntriInput, type JadwalEntri, type JadwalGuru, type JadwalKelas, type JadwalMapel, type SlotJam
} from '~/composables/useJadwalPelajaran'

const props = defineProps<{
  open: boolean
  entriEdit: JadwalEntri | null
  awal: { classId: string; day: number; ke: number }
  kelasList: JadwalKelas[]
  mapelList: JadwalMapel[]
  guruList: JadwalGuru[]
  slots: SlotJam[]
  entriList: JadwalEntri[]
  tingkatOrder: string[]
  menyimpan: boolean
}>()
const emit = defineEmits<{
  tutup: []
  simpan: [input: EntriInput, id?: string]
  hapus: [id: string]
}>()

const form = reactive({ classId: '', day: 1, mulaiKe: 1, selesaiKe: 1, subjectId: '', teacherId: '', room: '', notes: '' })

watch(() => props.open, (terbuka) => {
  if (!terbuka) return
  if (props.entriEdit) {
    const e = props.entriEdit
    form.classId = e.classId
    form.day = e.day
    form.mulaiKe = e.mulaiKe ?? 1
    form.selesaiKe = e.selesaiKe ?? e.mulaiKe ?? 1
    form.subjectId = e.subjectId
    form.teacherId = e.teacherId
    form.room = e.room
    form.notes = e.notes
  } else {
    form.classId = props.awal.classId
    form.day = props.awal.day
    form.mulaiKe = props.awal.ke
    form.selesaiKe = props.awal.ke
    form.subjectId = props.mapelList[0]?.id ?? ''
    form.teacherId = ''
    form.room = ''
    form.notes = ''
  }
})

const kelasGrup = computed(() => props.tingkatOrder
  .map(t => ({ tingkat: t, kelas: props.kelasList.filter(k => k.tingkat === t) }))
  .filter(g => g.kelas.length))
const slotJam = computed(() => props.slots.filter(s => s.jenis === 'jam'))
const namaKelas = (id: string) => props.kelasList.find(k => k.id === id)?.name ?? 'kelas lain'
// Guru jenjang kelas ini + Yayasan di grup pertama; guru jenjang lain di grup kedua.
const gradeKelas = computed(() => props.kelasList.find(k => k.id === form.classId)?.grade ?? '')
const guruSesuai = computed(() => props.guruList.filter(g => g.unit === gradeKelas.value || g.unit === 'Yayasan'))
const guruLain = computed(() => props.guruList.filter(g => g.unit !== gradeKelas.value && g.unit !== 'Yayasan'))
const namaGuru = (id: string) => props.guruList.find(g => g.id === id)?.name ?? 'Guru belum ditentukan'
const namaMapel = (id: string) => props.mapelList.find(m => m.id === id)?.name ?? '—'

const bentrok = computed(() => {
  const waktu = waktuDariJamKe(props.slots, Number(form.mulaiKe), Number(form.selesaiKe))
  if (!waktu || !form.classId) return null
  return cariBentrok(props.entriList, {
    classId: form.classId, teacherId: form.teacherId, subjectId: form.subjectId, day: Number(form.day),
    startsAt: waktu.startsAt, endsAt: waktu.endsAt, room: form.room
  }, props.entriEdit?.id)
})

const pesanBentrok = computed<string | null>(() => {
  if (Number(form.selesaiKe) < Number(form.mulaiKe)) return 'Jam selesai tidak boleh sebelum jam mulai.'
  const b = bentrok.value
  if (!b) return null
  const jamTeks = (j: JadwalEntri) => `${j.startsAt}–${j.endsAt}`
  if (b.guru) return `${namaGuru(b.guru.teacherId)} sudah mengajar ${namaMapel(b.guru.subjectId)} di kelas ${namaKelas(b.guru.classId)} pada hari ${HARI_NAMA[b.guru.day]} pukul ${jamTeks(b.guru)}. Pilih guru lain atau geser jamnya.`
  if (b.kelas) return `Kelas ${namaKelas(b.kelas.classId)} sudah terisi ${namaMapel(b.kelas.subjectId)} (${namaGuru(b.kelas.teacherId)}) pada hari ${HARI_NAMA[b.kelas.day]} pukul ${jamTeks(b.kelas)}.`
  if (b.ruangan) return `Ruangan ${b.ruangan.room} sedang dipakai kelas ${namaKelas(b.ruangan.classId)} (${namaMapel(b.ruangan.subjectId)}) pada hari ${HARI_NAMA[b.ruangan.day]} pukul ${jamTeks(b.ruangan)}. Pilih ruangan lain atau geser jamnya.`
  return null
})

const kirim = () => {
  if (pesanBentrok.value || !form.classId || !form.subjectId) return
  emit('simpan', {
    classId: form.classId, subjectId: form.subjectId, teacherId: form.teacherId,
    day: Number(form.day), mulaiKe: Number(form.mulaiKe), selesaiKe: Number(form.selesaiKe),
    room: form.room.trim(), notes: form.notes.trim()
  }, props.entriEdit?.id)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="absolute inset-0 bg-blue-950/50" @click="emit('tutup')" />
    <div class="jadwal-modal relative bg-white w-full sm:max-w-[560px] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white z-10">
        <div>
          <div class="text-[15px] font-semibold text-blue-950">{{ entriEdit ? 'Ubah Jadwal' : 'Tambah Jadwal' }}</div>
          <div class="text-[12px] text-slate-500">Jadwal tersimpan ke tabel resmi dan langsung terbaca Jadwal Mengajar, Agenda, dan CBT.</div>
        </div>
        <button type="button" class="ml-auto w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Tutup" @click="emit('tutup')">✕</button>
      </div>

      <div class="px-5 py-4 grid grid-cols-2 gap-3">
        <div>
          <label class="text-[12px] font-medium text-slate-600" for="jf-kelas">Kelas *</label>
          <select id="jf-kelas" v-model="form.classId" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
            <optgroup v-for="g in kelasGrup" :key="g.tingkat" :label="`Kelas ${g.tingkat}`">
              <option v-for="k in g.kelas" :key="k.id" :value="k.id">{{ k.name }}</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label class="text-[12px] font-medium text-slate-600" for="jf-hari">Hari *</label>
          <select id="jf-hari" v-model.number="form.day" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
            <option v-for="d in 5" :key="d" :value="d">{{ HARI_NAMA[d] }}</option>
          </select>
        </div>
        <div>
          <label class="text-[12px] font-medium text-slate-600" for="jf-mulai">Jam Mulai *</label>
          <select id="jf-mulai" v-model.number="form.mulaiKe" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
            <option v-for="s in slotJam" :key="s.ke" :value="s.ke">Jam {{ s.ke }} · {{ s.mulai }}</option>
          </select>
        </div>
        <div>
          <label class="text-[12px] font-medium text-slate-600" for="jf-selesai">Jam Selesai *</label>
          <select id="jf-selesai" v-model.number="form.selesaiKe" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
            <option v-for="s in slotJam" :key="s.ke" :value="s.ke">Jam {{ s.ke }} · s.d. {{ s.selesai }}</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="text-[12px] font-medium text-slate-600" for="jf-mapel">Mata Pelajaran * <span class="text-slate-400 font-normal">(dari Master Mapel)</span></label>
          <select id="jf-mapel" v-model="form.subjectId" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
            <option v-for="m in mapelList" :key="m.id" :value="m.id">{{ m.name }} (target {{ m.hoursPerWeek }} JP/mgg)</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="text-[12px] font-medium text-slate-600" for="jf-guru">Guru Pengajar</label>
          <select id="jf-guru" v-model="form.teacherId" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
            <option value="">Belum ditentukan</option>
            <optgroup v-if="guruSesuai.length" :label="`Guru ${gradeKelas} & Yayasan`">
              <option v-for="g in guruSesuai" :key="g.id" :value="g.id">{{ g.name }}</option>
            </optgroup>
            <optgroup v-if="guruLain.length" label="Guru jenjang lain">
              <option v-for="g in guruLain" :key="g.id" :value="g.id">{{ g.name }} ({{ g.unit }})</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label class="text-[12px] font-medium text-slate-600" for="jf-ruang">Ruangan</label>
          <input id="jf-ruang" v-model="form.room" type="text" placeholder="cth. R. 2.3 / Lab TKJ" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]">
        </div>
        <div>
          <label class="text-[12px] font-medium text-slate-600" for="jf-ket">Keterangan</label>
          <input id="jf-ket" v-model="form.notes" type="text" placeholder="Opsional" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]">
        </div>
      </div>

      <div class="px-5 pb-2">
        <div v-if="pesanBentrok" class="rounded-xl bg-red-50 border border-red-100 px-3.5 py-3 flex gap-2.5">
          <span class="shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center mt-0.5">!</span>
          <div>
            <div class="text-[12.5px] font-semibold text-red-600">Jadwal bentrok — tidak dapat disimpan</div>
            <p class="text-[12.5px] text-red-500 mt-0.5">{{ pesanBentrok }}</p>
          </div>
        </div>
        <div v-else class="rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3 flex gap-2.5">
          <span class="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold flex items-center justify-center mt-0.5">✓</span>
          <p class="text-[12.5px] text-emerald-600">Tidak ada bentrok — guru, kelas, dan ruangan bebas pada jam ini.</p>
        </div>
      </div>

      <div class="px-5 py-4 border-t border-slate-100 flex gap-2 sticky bottom-0 bg-white">
        <button v-if="entriEdit" type="button" class="text-[13px] font-medium text-red-500 hover:text-red-600 px-3 py-2" :disabled="menyimpan" @click="emit('hapus', entriEdit.id)">Hapus Jadwal</button>
        <button type="button" class="ml-auto text-[13px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 transition" @click="emit('tutup')">Batal</button>
        <button type="button" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg px-4 py-2 transition" :disabled="!!pesanBentrok || menyimpan" @click="kirim">
          {{ menyimpan ? 'Menyimpan…' : 'Simpan Jadwal' }}
        </button>
      </div>
    </div>
  </div>
</template>
