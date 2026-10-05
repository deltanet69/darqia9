<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import type { StudentItem } from '~/composables/useAdminStudents'

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
const errorMessage = ref('')
const importMode = ref<'append' | 'replace'>('append')

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
  if (lines.length < 2) return []

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
  return rows
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  fileName.value = file.name
  errorMessage.value = ''

  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const content = evt.target?.result as string
      const rawRows = parseCSV(content)
      parsedRows.value = rawRows

      if (rawRows.length === 0) {
        errorMessage.value = 'File CSV kosong atau tidak memiliki baris data.'
        return
      }

      const valid: StudentItem[] = []
      let invalids = 0

      rawRows.forEach((r, idx) => {
        const name = r['nama'] || r['nama lengkap'] || r['name'] || r['nama siswa'] || ''
        const nisn = r['nisn'] || r['no nisn'] || String(Date.now()).slice(-10)
        const nis = r['nis'] || r['nomor induk'] || ''
        const rawGender = (r['gender'] || r['jk'] || r['jenis kelamin'] || 'L').toUpperCase()
        const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender.startsWith('W') ? 'P' : 'L'
        const className = r['kelas'] || r['rombel'] || r['kelas / rombel'] || (props.grade === 'SMP' ? 'VII-A (Putra)' : 'X. TKJ 1')

        if (!name.trim()) {
          invalids++
          return
        }

        const student: StudentItem = {
          id: `${props.grade}-${Date.now()}-${idx}`,
          nis: nis || String(Date.now()).slice(-8),
          nisn: nisn.replace(/\D/g, '').padEnd(10, '0').slice(0, 10),
          nik: r['nik'] || r['nik siswa'] || '',
          noKk: r['nokk'] || r['no kk'] || r['kartu keluarga'] || '',
          name: name.toUpperCase(),
          gender,
          level: props.grade,
          className,
          major: r['jurusan'] || r['program keahlian'] || (props.grade === 'SMK' ? 'TKJ' : undefined),
          birthPlace: r['tempatlahir'] || r['tempat lahir'] || 'BEKASI',
          birthDate: r['tanggallahir'] || r['tanggal lahir'] || '2010-01-01',
          religion: r['agama'] || 'Islam',
          address: r['alamat'] || r['alamat lengkap'] || 'Kab. Bekasi',
          rt: r['rt'] || '01',
          rw: r['rw'] || '01',
          village: r['kelurahan'] || r['desa'] || 'Bahagia',
          district: r['kecamatan'] || 'Kec. Babelan',
          city: r['kota'] || r['kabupaten'] || 'Kab. Bekasi',
          livingType: r['jenistinggal'] || r['jenis tinggal'] || 'Bersama orang tua',
          transportation: r['transportasi'] || 'Sepeda motor',
          phone: r['nohp'] || r['hp siswa'] || r['telepon'] || '',
          fatherName: r['namaayah'] || r['nama ayah'] || r['ayah'] || '',
          fatherNik: r['nikayah'] || r['nik ayah'] || '',
          fatherBirthYear: r['tahunlahirayah'] || r['tahun lahir ayah'] || '',
          fatherEducation: r['pendidikanayah'] || r['pendidikan ayah'] || 'SMA / sederajat',
          fatherJob: r['pekerjaanayah'] || r['pekerjaan ayah'] || 'Wiraswasta',
          fatherIncome: r['penghasilanayah'] || r['penghasilan ayah'] || 'Rp1.000.001 – Rp3.000.000',
          fatherPhone: r['nohpayah'] || r['wa ayah'] || '',
          motherName: r['namaibu'] || r['nama ibu'] || r['ibu'] || '',
          motherNik: r['nikibu'] || r['nik ibu'] || '',
          motherBirthYear: r['tahunlahiribu'] || r['tahun lahir ibu'] || '',
          motherEducation: r['pendidikanibu'] || r['pendidikan ibu'] || 'SMA / sederajat',
          motherJob: r['pekerjaanibu'] || r['pekerjaan ibu'] || 'Tidak bekerja',
          motherIncome: r['penghasilanibu'] || r['penghasilan ibu'] || 'Tidak Berpenghasilan',
          motherPhone: r['nohpibu'] || r['wa ibu'] || '',
          prevSchool: r['sekolahasal'] || r['sekolah asal'] || r['asal sekolah'] || '',
          prevDiplomaNo: r['noijazah'] || r['nomor seri ijazah'] || '',
          birthOrder: Number(r['anakke'] || r['anak ke-'] || 1) || 1,
          siblingsCount: Number(r['jmlsaudara'] || r['jumlah saudara'] || 1) || 1,
          weight: Number(r['beratbadan'] || r['berat badan'] || 50) || 50,
          height: Number(r['tinggibadan'] || r['tinggi badan'] || 160) || 160,
          headCircumference: Number(r['lingkarkepala'] || r['lingkar kepala'] || 54) || 54,
          distanceKm: Number(r['jarakkm'] || r['jarak km'] || 1) || 1,
          hobby: r['hobi'] || '',
          ambition: r['citacita'] || r['cita-cita'] || '',
          rfidUid: r['rfid_uid'] || r['rfid'] || r['uid'] || undefined,
          hasRfid: !!(r['rfid_uid'] || r['rfid'] || r['uid']),
          status: (r['status'] === 'Lulus' || r['status'] === 'Pindah' || r['status'] === 'Nonaktif') ? r['status'] : 'Aktif',
          attendancePct: Number(r['presensi'] || r['kehadiran'] || 100) || 100,
          entryYear: r['tahunangkatan'] || r['angkatan'] || '2026'
        }
        valid.push(student)
      })

      validRows.value = valid
      invalidCount.value = invalids
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
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10" role="dialog" aria-modal="true">
        <!-- HEADER -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 class="text-base font-bold text-slate-900">
              Import Data Siswa (CSV)
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Unggah file CSV data induk siswa untuk jenjang <b>{{ grade === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</b>.
            </p>
          </div>
          <button class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition" type="button" aria-label="Tutup" @click="$emit('close')">
            <AdminIcon name="x" size="18" />
          </button>
        </div>

        <!-- BODY -->
        <div class="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          <!-- STEP 1: UPLOAD & TEMPLATE -->
          <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <AdminIcon name="dl" size="22" />
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">Pilih File CSV Data Siswa</h4>
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
        </div>

        <!-- FOOTER -->
        <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-white">
          <button class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="$emit('close')">Batal</button>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            :disabled="validRows.length === 0"
            @click="handleApplyImport"
          >
            <AdminIcon name="plus" size="14" /> Import {{ validRows.length }} Data Siswa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
