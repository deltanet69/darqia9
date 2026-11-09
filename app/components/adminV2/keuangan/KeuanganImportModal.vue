<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { LABEL_TINGKAT } from '~/composables/keuanganCore'
import { bacaExcelKeuangan, unduhExcelKeuangan, type HasilImpor } from '~/utils/keuanganExcel'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], selesai: [pesan: string] }>()

const grade = useAdminGrade()
const K = useKeuangan()
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const hasil = ref<HasilImpor | null>(null)
const phase = ref<'pilih' | 'siap' | 'proses' | 'selesai'>('pilih')
const galat = ref('')

const paketGrade = computed(() => K.state.value.paket.filter(p => p.grade === grade.value))
const siswaGrade = computed(() => K.state.value.siswaInduk.filter(s => s.grade === grade.value))
const penetapanGrade = computed(() => K.state.value.penetapan.filter(p => p.grade === grade.value))

const masterSiap = computed(() => (hasil.value?.master || []).filter(r => r.status === 'siap'))
const siswaSiap = computed(() => (hasil.value?.siswa || []).filter(r => r.status === 'siap'))
const masalah = computed(() => [
  ...(hasil.value?.master || []).filter(r => r.status !== 'siap').map(r => ({ ...r, sheet: 'Master Kode' })),
  ...(hasil.value?.siswa || []).filter(r => r.status !== 'siap').map(r => ({ ...r, sheet: 'Kode Siswa' }))
])
const adaBaris = computed(() => (hasil.value?.master.length || 0) + (hasil.value?.siswa.length || 0) > 0)
const kodeBaru = computed(() => masterSiap.value.filter(r => r.baru).length)

const reset = () => {
  fileName.value = ''
  hasil.value = null
  phase.value = 'pilih'
  galat.value = ''
}
watch(() => props.open, (buka) => { if (buka) reset() })

const unduh = () => unduhExcelKeuangan(grade.value, LABEL_TINGKAT[grade.value], paketGrade.value, siswaGrade.value, penetapanGrade.value)

const pilihFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  galat.value = ''
  try {
    hasil.value = await bacaExcelKeuangan(file, {
      grade: grade.value,
      kodeAda: new Set(paketGrade.value.map(p => p.kode)),
      nisInduk: new Set(siswaGrade.value.map(s => s.nis))
    })
    fileName.value = file.name
    phase.value = 'siap'
    if (!adaBaris.value) galat.value = 'Tidak ada baris data yang terbaca dari file ini.'
  } catch (e) {
    galat.value = e instanceof Error ? e.message : 'File tidak bisa dibaca. Pastikan formatnya .xlsx sesuai template.'
  }
}

const jalankan = async () => {
  if (!hasil.value) return
  phase.value = 'proses'
  galat.value = ''
  try {
    // Master dulu agar kode baru sudah ada saat dipasang ke siswa.
    await K.simpanPaketBanyak(masterSiap.value.map(r => r.data!))
    await K.simpanPenetapanBanyak(grade.value, siswaSiap.value.map(r => r.data!))
    phase.value = 'selesai'
    emit('selesai', `Impor selesai: ${masterSiap.value.length} kode master, ${siswaSiap.value.length} siswa dipasang kode.`)
  } catch (e: any) {
    phase.value = 'siap'
    galat.value = e?.message || 'Impor gagal disimpan.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs" @click.self="emit('close')">
    <div class="max-h-[92vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl border border-[#E7EBF2] bg-white p-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Impor &amp; Ekspor Kode Keuangan ({{ grade }})</h3>
          <p class="mt-0.5 text-xs text-[#667085]">Satu file Excel berisi master kode dan kode tiap siswa.</p>
        </div>
        <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F8FAFC] text-sm font-bold text-[#667085] transition hover:text-[#101828]" aria-label="Tutup" @click="emit('close')">&#10005;</button>
      </div>

      <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="pilihFile">

      <template v-if="phase === 'pilih' || (phase === 'siap' && !adaBaris)">
        <div class="rounded-2xl border border-[#E7EBF2] bg-[#F8FAFC] px-4 py-3.5">
          <p class="text-xs font-extrabold text-[#344054]">1. Unduh template</p>
          <p class="mt-1 text-[11.5px] leading-relaxed text-[#667085]">Berisi data saat ini: semua siswa aktif {{ grade }} dengan kolom Kode yang tinggal diisi, dan master kode yang sudah ada. File yang sama dipakai sebagai ekspor.</p>
          <button type="button" class="mt-2.5 cursor-pointer rounded-xl border border-[#B2CCFF] bg-white px-4 py-2 text-xs font-bold text-[#1B5FD9] transition hover:bg-[#F5F9FF]" @click="unduh">Unduh Template Excel</button>
        </div>
        <div class="rounded-2xl border-[1.5px] border-dashed border-[#B2CCFF] bg-[#F5F9FF] px-5 py-5 text-center">
          <p class="text-xs font-extrabold text-[#344054]">2. Unggah file yang sudah diisi</p>
          <button type="button" class="mt-3 cursor-pointer rounded-xl bg-[#1B5FD9] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#154EBC]" @click="fileInput?.click()">Pilih File .xlsx</button>
        </div>
        <div class="rounded-xl bg-[#E8F0FE] px-3.5 py-3 text-xs font-semibold leading-relaxed text-[#0A2A5C]">
          Kode yang sama diperbarui, kode baru ditambahkan. Siswa tanpa kode di file dilewati (kode lamanya tidak berubah). Kolom Nama dan Kelas hanya informasi, tidak diimpor.
        </div>
        <p v-if="galat" class="text-xs font-bold text-[#B42318]">{{ galat }}</p>
      </template>

      <template v-else-if="phase === 'siap' || phase === 'proses'">
        <div class="rounded-xl border border-[#B2CCFF] bg-[#F5F9FF] px-3.5 py-3 text-xs font-semibold text-[#0A2A5C]">
          File terpilih: <b>{{ fileName }}</b>
        </div>
        <p class="text-xs font-extrabold text-[#067647]">
          {{ masterSiap.length }} kode master siap ({{ kodeBaru }} baru, {{ masterSiap.length - kodeBaru }} diperbarui) &middot; {{ siswaSiap.length }} siswa siap dipasang kode<template v-if="masalah.length"> &middot; <span class="text-[#B42318]">{{ masalah.length }} baris bermasalah</span></template>
        </p>
        <div v-if="masalah.length" class="max-h-44 overflow-y-auto pr-1 text-xs leading-relaxed text-[#344054]">
          <p v-for="m in masalah" :key="m.sheet + m.baris" class="py-0.5">
            <b>{{ m.sheet }}, baris {{ m.baris }}:</b> {{ m.label }} &mdash; {{ m.alasan }}
            <span class="font-bold" :class="m.status === 'dilewati' ? 'text-[#B54708]' : 'text-[#B42318]'">({{ m.status }})</span>
          </p>
        </div>
        <p v-if="galat" class="text-xs font-bold text-[#B42318]">{{ galat }}</p>
        <div class="flex items-center justify-end gap-2.5 border-t border-[#F1F5F9] pt-3">
          <button type="button" class="cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-[#667085] transition hover:bg-[#F8FAFC]" @click="reset">Pilih File Lain</button>
          <button
            type="button"
            class="cursor-pointer rounded-xl bg-[#1B5FD9] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#154EBC] disabled:opacity-50"
            :disabled="(!masterSiap.length && !siswaSiap.length) || phase === 'proses'"
            @click="jalankan"
          >
            {{ phase === 'proses' ? 'Menyimpan...' : 'Simpan Impor' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="rounded-xl bg-[#E7F8F0] px-3.5 py-3.5 text-xs font-bold leading-relaxed text-[#067647]">
          Impor selesai: {{ masterSiap.length }} kode master dan {{ siswaSiap.length }} siswa sudah tersimpan. Baris yang dilewati atau bermasalah bisa diperbaiki lalu diimpor ulang.
        </div>
        <div class="flex justify-end">
          <button type="button" class="cursor-pointer rounded-xl bg-[#1B5FD9] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#154EBC]" @click="emit('close')">Selesai</button>
        </div>
      </template>
    </div>
  </div>
</template>
