<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { STUDENT_CSV_HEADERS, type StudentItem } from '~/composables/useAdminStudents'

const props = defineProps<{
  isOpen: boolean
  grade: 'SMP' | 'SMK'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import', data: { students: StudentItem[]; mode: 'append' | 'replace' }): void
  (e: 'downloadTemplate'): void
}>()

const fileName = ref('')
const parsedRows = ref<any[]>([])
const validRows = ref<StudentItem[]>([])
const invalidCount = ref(0)
const invalidRows = ref<string[]>([])
const errorMessage = ref('')
const importMode = ref<'append' | 'replace'>('append')
const requiredCsvHeaders = STUDENT_CSV_HEADERS.filter(header => ['NIS', 'NISN', 'Nama', 'Gender', 'Jenjang', 'Kelas'].includes(header))
const headerAliases: Record<string, string[]> = {
  NIS: ['nis', 'nomor induk'],
  NISN: ['nisn', 'no nisn'],
  Nama: ['nama', 'nama lengkap', 'name', 'nama siswa'],
  Gender: ['gender', 'jk', 'jenis kelamin'],
  Jenjang: ['jenjang'],
  Kelas: ['kelas', 'rombel', 'kelas / rombel']
}

watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
    if (!open) {
      resetState()
    }
  }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const resetState = () => {
  fileName.value = ''
  parsedRows.value = []
  validRows.value = []
  invalidCount.value = 0
  invalidRows.value = []
  errorMessage.value = ''
  importMode.value = 'append'
}

const handleDownloadTemplate = () => {
  emit('downloadTemplate')
}

// Simple robust CSV line parser handling quotes
const parseCSV = (text: string) => {
  let cleanText = text.replace(/^\uFEFF/, '').trim()
  const lines = cleanText.split(/\r\n|\n|\r/)
  if (lines.length < 2) return { headers: [], rows: [] }

  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (c === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += c
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase())
  const rows: any[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseLine(lines[i]).map(v => v.replace(/^["']|["']$/g, '').trim())
    const rowObj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || ''
    })
    rows.push(rowObj)
  }
  return { headers, rows }
}

const hasHeader = (headers: string[], aliases: string[]) => aliases.some(alias => headers.includes(alias))
const normalizeDate = (value: string) => {
  const dateValue = value.trim()
  if (!dateValue) return ''
  const match = dateValue.match(/^(?:(\d{4})[-/](\d{1,2})[-/](\d{1,2})|(\d{1,2})[-/](\d{1,2})[-/](\d{4}))/)
  if (!match) return null
  const [, isoYear, isoMonth, isoDay, localDay, localMonth, localYear] = match
  const year = Number(isoYear || localYear)
  let month = Number(isoMonth || localMonth)
  let day = Number(isoDay || localDay)
  if (localYear && month > 12 && day <= 12) [month, day] = [day, month]
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return [year, String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-')
}

const normalizeAttendance = (value: string) => {
  const attendanceValue = value.trim()
  if (!attendanceValue) return 0
  const attendance = Number(attendanceValue.replace('%', '').replace(',', '.'))
  return Number.isFinite(attendance) && attendance >= 0 && attendance <= 100 ? attendance : null
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  handleFile(target.files?.[0])
  target.value = ''
}

const handleDrop = (e: DragEvent) => {
  handleFile(e.dataTransfer?.files[0])
}

const handleFile = (file?: File) => {
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = 'Berkas harus berformat CSV.'
    return
  }

  fileName.value = file.name
  errorMessage.value = ''
  validRows.value = []
  invalidRows.value = []
  invalidCount.value = 0

  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const content = evt.target?.result as string
      const parsed = parseCSV(content)
      const rawRows = parsed.rows
      parsedRows.value = rawRows

      const missingHeaders = requiredCsvHeaders.filter(header => !hasHeader(parsed.headers, headerAliases[header]))
      if (missingHeaders.length) {
        errorMessage.value = 'Format CSV tidak sesuai. Kolom wajib belum ada: ' + missingHeaders.join(', ') + '. Gunakan template aplikasi.'
        return
      }

      if (rawRows.length === 0) {
        errorMessage.value = 'File CSV kosong atau tidak memiliki baris data.'
        return
      }

      const valid: StudentItem[] = []
      const seenNisn = new Set<string>()
      rawRows.forEach((r, idx) => {
        const name = r['nama'] || r['nama lengkap'] || r['name'] || r['nama siswa'] || ''
        const nisn = r['nisn'] || r['no nisn'] || ''
        const nis = r['nis'] || r['nomor induk'] || ''
        const sourceGrade = String(r['jenjang'] || '').trim().toUpperCase()
        const rawGender = String(r['gender'] || r['jk'] || r['jenis kelamin'] || '').trim().toUpperCase()
        const gender: 'L' | 'P' = rawGender === 'PRIA' || rawGender.startsWith('L') ? 'L' : rawGender === 'WANITA' || rawGender.startsWith('P') || rawGender.startsWith('W') ? 'P' : 'L'
        const className = r['kelas'] || r['rombel'] || r['kelas / rombel'] || ''
        const normalizedNisn = nisn.replace(/\D/g, '')
        const birthDate = normalizeDate(r['tanggallahir'] || r['tanggal lahir'] || '')
        const entryDate = normalizeDate(r['tanggalmasuk'] || r['tanggal masuk'] || '')
        const attendancePct = normalizeAttendance(r['presensi'] || r['kehadiran'] || '')
        const reasons: string[] = []
        if (!name.trim()) reasons.push('nama kosong')
        if (!nis.trim()) reasons.push('NIS kosong')
        if (!/^\d{10}$/.test(normalizedNisn)) reasons.push('NISN harus tepat 10 digit')
        if (sourceGrade !== props.grade) reasons.push('jenjang harus ' + props.grade)
        if (!className.trim()) reasons.push('kelas kosong')
        if (!['L', 'P', 'PRIA', 'WANITA', 'LAKI-LAKI', 'LAKI LAKI', 'PEREMPUAN'].includes(rawGender)) reasons.push('gender harus L atau P')
        if (birthDate === null) reasons.push('tanggal lahir tidak valid')
        if (entryDate === null) reasons.push('tanggal masuk tidak valid')
        if (attendancePct === null) reasons.push('presensi harus angka 0 sampai 100')
        if (r['status'] && !['Aktif', 'Lulus', 'Pindah', 'Nonaktif'].includes(r['status'])) reasons.push('status tidak dikenali')
        if (seenNisn.has(normalizedNisn)) reasons.push('NISN duplikat di dalam berkas')
        if (reasons.length) {
          invalidRows.value.push('Baris ' + (idx + 2) + ': ' + reasons.join(', ') + '.')
          return
        }
        seenNisn.add(normalizedNisn)

        const student: StudentItem = {
          id: `${props.grade}-${Date.now()}-${idx}`,
          nis,
          nisn: normalizedNisn,
          nik: r['nik'] || r['nik siswa'] || '',
          noKk: r['nokk'] || r['no kk'] || r['kartu keluarga'] || '',
          name: name.toUpperCase(),
          gender,
          level: props.grade,
          className,
          major: r['jurusan'] || r['program keahlian'] || undefined,
          birthPlace: r['tempatlahir'] || r['tempat lahir'] || '',
          birthDate: birthDate || '',
          religion: r['agama'] || 'Islam',
          address: r['alamat'] || r['alamat lengkap'] || '',
          rt: r['rt'] || '',
          rw: r['rw'] || '',
          village: r['kelurahan'] || r['desa'] || '',
          district: r['kecamatan'] || '',
          city: r['kota'] || r['kabupaten'] || '',
          livingType: r['jenistinggal'] || r['jenis tinggal'] || '',
          transportation: r['transportasi'] || '',
          phone: r['nohpsiswa'] || r['nohp'] || r['hp siswa'] || r['telepon'] || '',
          fatherName: r['namaayah'] || r['nama ayah'] || r['ayah'] || '',
          fatherNik: r['nikayah'] || r['nik ayah'] || '',
          fatherBirthYear: r['tahunlahirayah'] || r['tahun lahir ayah'] || '',
          fatherEducation: r['pendidikanayah'] || r['pendidikan ayah'] || '',
          fatherJob: r['pekerjaanayah'] || r['pekerjaan ayah'] || '',
          fatherIncome: r['penghasilanayah'] || r['penghasilan ayah'] || '',
          fatherPhone: r['nohpayah'] || r['wa ayah'] || '',
          motherName: r['namaibu'] || r['nama ibu'] || r['ibu'] || '',
          motherNik: r['nikibu'] || r['nik ibu'] || '',
          motherBirthYear: r['tahunlahiribu'] || r['tahun lahir ibu'] || '',
          motherEducation: r['pendidikanibu'] || r['pendidikan ibu'] || '',
          motherJob: r['pekerjaanibu'] || r['pekerjaan ibu'] || '',
          motherIncome: r['penghasilanibu'] || r['penghasilan ibu'] || '',
          motherPhone: r['nohpibu'] || r['wa ibu'] || '',
          prevSchool: r['sekolahasal'] || r['sekolah asal'] || r['asal sekolah'] || '',
          prevDiplomaNo: r['noijazah'] || r['nomor seri ijazah'] || '',
          birthOrder: Number(r['anakke'] || r['anak ke-']) || undefined,
          siblingsCount: Number(r['jmlsaudara'] || r['jumlah saudara']) || undefined,
          weight: Number(r['beratbadan'] || r['berat badan']) || undefined,
          height: Number(r['tinggibadan'] || r['tinggi badan']) || undefined,
          headCircumference: Number(r['lingkarkepala'] || r['lingkar kepala']) || undefined,
          distanceKm: Number(r['jarakkm'] || r['jarak km']) || undefined,
          hobby: r['hobi'] || '',
          ambition: r['citacita'] || r['cita-cita'] || '',
          rfidUid: r['rfid_uid'] || r['rfid'] || r['uid'] || undefined,
          hasRfid: !!(r['rfid_uid'] || r['rfid'] || r['uid']),
          status: (r['status'] === 'Lulus' || r['status'] === 'Pindah' || r['status'] === 'Nonaktif') ? r['status'] : 'Aktif',
          attendancePct: attendancePct || 0,
          entryYear: r['tahunangkatan'] || r['angkatan'] || '',
          entryDate: entryDate || '',
          notes: r['catatan'] || ''
        }
        valid.push(student)
      })

      validRows.value = valid
      invalidCount.value = invalidRows.value.length
    } catch (err: any) {
      errorMessage.value = `Gagal memproses file CSV: ${err.message || 'Format tidak valid'}`
    }
  }
  reader.readAsText(file)
}

const handleApplyImport = () => {
  if (validRows.value.length === 0) return
  emit('import', {
    students: validRows.value,
    mode: importMode.value
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 md:p-6 overflow-y-auto"
    >
      <!-- Backdrop Gelap dengan Blur Halus -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-950/65 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
          @click="$emit('close')"
        />
      </Transition>

      <!-- Centered Modal Card (Keren, Modern, Mobile-First) -->
      <Transition
        enter-active-class="transition duration-200 ease-out transform"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in transform"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          class="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/30 border border-slate-200/90 z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto font-admin"
          role="dialog"
          aria-modal="true"
        >
          <!-- HEADER STICKY -->
          <div class="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-xs sticky top-0 z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-xs">
                <AdminIcon name="dl" size="20" />
              </div>
              <div>
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  Import Data Siswa (CSV)
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Unggah file CSV data induk siswa untuk jenjang <b>{{ grade === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</b>.
                </p>
              </div>
            </div>
            <button
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer touch-manipulation shrink-0"
              type="button"
              aria-label="Tutup dialog"
              @click="$emit('close')"
            >
              <AdminIcon name="x" size="18" />
            </button>
          </div>

          <!-- BODY -->
          <div class="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-slate-800 text-sm">
          <!-- STEP 1: UPLOAD & TEMPLATE -->
          <div
            class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <AdminIcon name="dl" size="22" />
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">Tarik atau pilih file CSV data siswa</h4>
            <p class="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Gunakan file format CSV (UTF-8). Pastikan kolom sesuai dengan format resmi Dapodik.
            </p>
            <div class="flex items-center justify-center gap-2.5 flex-wrap">
              <label class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer">
                <AdminIcon name="plus" size="14" /> Pilih File CSV
                <input type="file" accept=".csv,text/csv" class="hidden" @change="handleFileChange" />
              </label>
              <button class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition" type="button" @click="handleDownloadTemplate">
                <AdminIcon name="dl" size="14" /> Unduh Template CSV
              </button>
            </div>
          </div>

          <!-- FILE INFO & PREVIEW -->
          <div v-if="fileName" class="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">File Terpilih</span>
                <b class="text-xs sm:text-sm font-bold text-slate-900">{{ fileName }}</b>
              </div>
              <div class="text-xs text-slate-400">
                Total: <b class="text-slate-800">{{ parsedRows.length }}</b> baris data
              </div>
            </div>

            <!-- SUMMARY STATS -->
            <div class="grid grid-cols-3 gap-2">
              <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span class="block text-[11px] text-slate-400 mb-0.5">Total Terbaca</span>
                <b class="text-base font-bold text-blue-600">{{ parsedRows.length }}</b>
              </div>
              <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span class="block text-[11px] text-slate-400 mb-0.5">Data Valid</span>
                <b class="text-base font-bold text-emerald-600">{{ validRows.length }}</b>
              </div>
              <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span class="block text-[11px] text-slate-400 mb-0.5">Data Kurang Lengkap</span>
                <b class="text-base font-bold" :class="invalidCount > 0 ? 'text-rose-600' : 'text-slate-400'">{{ invalidCount }}</b>
              </div>
            </div>

            <!-- MODE IMPORT OPTION -->
            <div class="pt-3 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-900 mb-2">Metode Pemasukan Data:</label>
              <div class="flex flex-wrap gap-4 text-xs">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="importMode" type="radio" value="append" class="text-blue-600" />
                  <span class="text-slate-700"><b class="font-bold text-slate-900">Gabungkan (Append)</b> &mdash; Tambah ke data yang ada</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="importMode" type="radio" value="replace" class="text-rose-600" />
                  <span class="text-rose-600"><b class="font-bold">Gantikan (Replace)</b> &mdash; Timpa data siswa jenjang ini</span>
                </label>
              </div>
            </div>

            <!-- MINI PREVIEW TABLE -->
            <div v-if="validRows.length > 0" class="pt-2">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Pratinjau Data (5 Siswa Pertama):
              </div>
              <div class="overflow-x-auto max-h-40 border border-slate-200 rounded-xl">
                <table class="w-full text-left text-xs text-slate-700">
                  <thead class="bg-slate-50/90 text-[11px] font-semibold text-slate-500 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th class="px-3 py-2">No</th>
                      <th class="px-3 py-2">NISN</th>
                      <th class="px-3 py-2">Nama Lengkap</th>
                      <th class="px-3 py-2">Kelas</th>
                      <th class="px-3 py-2">L/P</th>
                      <th class="px-3 py-2">Orang Tua</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(r, i) in validRows.slice(0, 5)" :key="i" class="hover:bg-slate-50">
                      <td class="px-3 py-2 text-slate-400">{{ i + 1 }}</td>
                      <td class="px-3 py-2 font-mono font-semibold">{{ r.nisn }}</td>
                      <td class="px-3 py-2 font-semibold text-slate-900">{{ r.name }}</td>
                      <td class="px-3 py-2">{{ r.className }}</td>
                      <td class="px-3 py-2">{{ r.gender }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.fatherName || r.motherName || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ERROR NOTICE -->
          <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs">
            <AdminIcon name="x" size="16" />
            <span>{{ errorMessage }}</span>
          </div>
          <div v-if="invalidRows.length" class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs">
            <b class="block mb-1">Baris yang ditolak:</b>
            <ul class="list-disc pl-4 space-y-0.5">
              <li v-for="item in invalidRows" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <!-- FOOTER STICKY (TOUCH FRIENDLY) -->
        <div class="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50/90 backdrop-blur-xs">
          <button
            class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition min-h-[44px] cursor-pointer"
            type="button"
            @click="$emit('close')"
          >
            Batal
          </button>
          <button
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
            type="button"
            :disabled="validRows.length === 0"
            @click="handleApplyImport"
          >
            <AdminIcon name="plus" size="16" />
            <span>Import {{ validRows.length }} Data Siswa</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</Teleport>
</template>
