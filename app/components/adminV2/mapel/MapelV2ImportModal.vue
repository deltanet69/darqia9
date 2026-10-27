<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAdminSubjects, type SubjectInput } from '~/composables/useAdminSubjects'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', count: number): void
}>()

interface ParsedRow {
  rowNumber: number
  name: string
  status: 'siap' | 'dilewati' | 'gagal'
  reason: string
  input: SubjectInput | null
}

const store = useAdminSubjects()
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const rows = ref<ParsedRow[]>([])
const phase = ref<'pilih' | 'siap' | 'proses' | 'selesai'>('pilih')
const parseError = ref('')

const readyRows = computed(() => rows.value.filter(row => row.status === 'siap'))
const skippedRows = computed(() => rows.value.filter(row => row.status === 'dilewati'))
const failedRows = computed(() => rows.value.filter(row => row.status === 'gagal'))
const issueRows = computed(() => rows.value.filter(row => row.status !== 'siap'))

const reset = () => {
  fileName.value = ''
  rows.value = []
  phase.value = 'pilih'
  parseError.value = ''
}

watch(() => props.open, (isOpen) => {
  if (isOpen) reset()
})

const CATEGORIES: Record<string, SubjectInput['category']> = {
  'umum': 'Umum',
  'kejuruan': 'Kejuruan',
  'keagamaan': 'Keagamaan',
  'muatan lokal': 'Muatan Lokal'
}

const normalizeHeader = (value: unknown) => String(value ?? '').trim().toLowerCase()

const parseFile = async (file: File) => {
  parseError.value = ''
  try {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const aoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' })

    const headerIndex = aoa.findIndex(row => row.some(cell => normalizeHeader(cell).includes('nama')))
    if (headerIndex === -1) {
      parseError.value = 'Kolom "Nama Mata Pelajaran" tidak ditemukan. Gunakan template impor resmi agar formatnya dikenali.'
      return
    }
    const headers = aoa[headerIndex].map(normalizeHeader)
    const colName = headers.findIndex(h => h.includes('nama'))
    const colGrade = headers.findIndex(h => h.includes('jenjang'))
    const colCategory = headers.findIndex(h => h.includes('kategori'))
    const colKkm = headers.findIndex(h => h.includes('kkm'))
    const colHours = headers.findIndex(h => h.includes('beban') || h.includes('jam'))
    if ([colGrade, colCategory, colKkm, colHours].some(index => index === -1)) {
      parseError.value = 'Kolom Jenjang, Kategori, KKM, atau Beban Jam tidak lengkap. Gunakan template impor resmi.'
      return
    }

    const existingKeys = new Set(store.subjects.value.map(s => `${s.grade}|${s.name.trim().toLowerCase()}`))
    const seenKeys = new Set<string>()
    const parsed: ParsedRow[] = []

    aoa.slice(headerIndex + 1).forEach((rawRow, offset) => {
      const rowNumber = headerIndex + offset + 2
      const cells = rawRow.map(cell => String(cell ?? '').trim())
      if (cells.every(cell => cell === '')) return
      const name = cells[colName] ?? ''
      const fail = (reason: string): ParsedRow => ({ rowNumber, name, status: 'gagal', reason, input: null })
      const skip = (reason: string): ParsedRow => ({ rowNumber, name, status: 'dilewati', reason, input: null })

      if (!name) { parsed.push(fail('Nama mata pelajaran kosong')); return }
      const gradeRaw = (cells[colGrade] ?? '').toUpperCase()
      if (gradeRaw !== 'SMP' && gradeRaw !== 'SMK') { parsed.push(fail(gradeRaw ? `Jenjang "${cells[colGrade]}" tidak dikenal — isi SMP atau SMK` : 'Jenjang kosong')); return }
      const grade = gradeRaw as 'SMP' | 'SMK'
      const category = CATEGORIES[(cells[colCategory] ?? '').toLowerCase()]
      if (!category) { parsed.push(fail(cells[colCategory] ? `Kategori "${cells[colCategory]}" tidak dikenal` : 'Kategori kosong')); return }
      const kkmRaw = cells[colKkm] ?? ''
      const kkm = Number(kkmRaw.replace(',', '.'))
      if (kkmRaw === '' || Number.isNaN(kkm) || kkm < 0 || kkm > 100) { parsed.push(fail('KKM harus angka 0–100')); return }
      const hoursRaw = cells[colHours] ?? ''
      const hours = Number(hoursRaw.replace(',', '.'))
      if (hoursRaw === '' || Number.isNaN(hours) || hours < 0 || hours > 60) { parsed.push(fail('Beban Jam harus angka 0–60')); return }

      const key = `${grade}|${name.toLowerCase()}`
      if (existingKeys.has(key)) { parsed.push(skip(`Sudah ada di sistem (${grade})`)); return }
      if (seenKeys.has(key)) { parsed.push(skip('Duplikat di dalam file yang sama')); return }
      seenKeys.add(key)
      parsed.push({
        rowNumber,
        name,
        status: 'siap',
        reason: '',
        input: { name, grade, category, kkm: Math.round(kkm), hoursPerWeek: Math.round(hours) }
      })
    })

    rows.value = parsed
    fileName.value = file.name
    phase.value = 'siap'
    if (!parsed.length) parseError.value = 'Tidak ada baris data yang terbaca dari file ini.'
  } catch {
    parseError.value = 'File tidak bisa dibaca. Pastikan formatnya .xlsx sesuai template.'
  }
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await parseFile(file)
}

const runImport = async () => {
  phase.value = 'proses'
  try {
    const inputs = readyRows.value.map(row => row.input!).filter(Boolean)
    await store.importMany(inputs)
    phase.value = 'selesai'
    emit('imported', inputs.length)
  } catch (error) {
    phase.value = 'siap'
    parseError.value = error instanceof Error ? error.message : 'Impor gagal disimpan.'
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E7EBF2] space-y-4 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Impor Mata Pelajaran dari Excel</h3>
          <p class="text-xs text-[#667085] mt-0.5">Pakai template resmi agar kolomnya dikenali sistem.</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="handleFileChange">

      <template v-if="phase === 'pilih' || phase === 'siap' && !rows.length">
        <div class="rounded-2xl border-[1.5px] border-dashed border-[#B2CCFF] bg-[#F5F9FF] px-5 py-6 text-center">
          <p class="text-xs font-bold text-[#344054]">Pilih file Excel berisi daftar mata pelajaran</p>
          <button
            type="button"
            class="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer"
            @click="fileInput?.click()"
          >
            Pilih File .xlsx
          </button>
          <p class="text-[11px] text-[#667085] mt-3">
            Belum punya formatnya?
            <a href="/template-impor-mapel-darqia9.xlsx" download class="text-[#1B5FD9] font-extrabold hover:underline">Unduh Template Impor</a>
          </p>
        </div>
        <div class="rounded-xl bg-[#E8F0FE] text-[#0A2A5C] px-3.5 py-3 text-xs font-semibold leading-relaxed">
          Kode mapel tidak perlu ada di file — dibuat otomatis saat impor. Baris dengan nama + jenjang yang sudah ada akan dilewati, bukan digandakan.
        </div>
        <p v-if="parseError" class="text-xs font-bold text-[#B42318]">{{ parseError }}</p>
      </template>

      <template v-else-if="phase === 'siap' || phase === 'proses'">
        <div class="rounded-xl bg-[#F5F9FF] border border-[#B2CCFF] text-[#0A2A5C] px-3.5 py-3 text-xs font-semibold">
          File terpilih: <b>{{ fileName }}</b> · {{ rows.length }} baris data terbaca.
        </div>
        <p class="text-xs font-extrabold text-[#067647]">
          {{ readyRows.length }} mapel siap diimpor<template v-if="skippedRows.length"> · {{ skippedRows.length }} dilewati</template><template v-if="failedRows.length"> · {{ failedRows.length }} gagal</template>
        </p>
        <div v-if="issueRows.length" class="text-xs text-[#344054] leading-relaxed max-h-44 overflow-y-auto pr-1">
          <p v-for="row in issueRows" :key="row.rowNumber" class="py-0.5">
            <b>Baris {{ row.rowNumber }}:</b> {{ row.name ? row.name + ' — ' : '' }}{{ row.reason }}
            <span class="font-bold" :class="row.status === 'dilewati' ? 'text-[#B54708]' : 'text-[#B42318]'">({{ row.status === 'dilewati' ? 'dilewati' : 'gagal' }})</span>
          </p>
        </div>
        <p v-if="parseError" class="text-xs font-bold text-[#B42318]">{{ parseError }}</p>
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#F8FAFC] transition cursor-pointer"
            @click="reset"
          >
            Pilih File Lain
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer disabled:opacity-50"
            :disabled="!readyRows.length || phase === 'proses'"
            @click="runImport"
          >
            {{ phase === 'proses' ? 'Mengimpor...' : `Impor ${readyRows.length} Mapel` }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="rounded-xl bg-[#E7F8F0] text-[#067647] px-3.5 py-3.5 text-xs font-bold leading-relaxed">
          Impor selesai. Mata pelajaran baru sudah masuk ke daftar dan kodenya dibuat otomatis. Baris yang dilewati/gagal bisa diperbaiki lalu diimpor ulang terpisah.
        </div>
        <div class="flex items-center justify-end pt-1">
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer"
            @click="emit('close'); reset()"
          >
            Selesai
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
