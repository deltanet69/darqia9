<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { StaffItem } from '~/composables/useAdminTeachers'

const props = defineProps<{
  isOpen: boolean
  currentGrade: 'SMP' | 'SMK'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', items: StaffItem[], syncUsers: boolean): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const parsedRows = ref<StaffItem[]>([])
const parseError = ref('')
const syncToUserManagement = ref(true)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedFile.value = null
      parsedRows.value = []
      parseError.value = ''
      syncToUserManagement.value = true
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden'
      }
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

// Generator Template Excel/CSV Sesuai docs/Admin Portal/kepegawaian/dataindukguru.md
const downloadTemplate = () => {
  const headers = [
    'Nama Guru',
    'NIK',
    'No KK',
    'NUPTK',
    'NIP',
    'No Telp/WA',
    'Alamat Email',
    'Tempat Lahir',
    'Tgl Lahir',
    'Alamat',
    'Kelurahan',
    'Kecamatan',
    'Kab/Kota',
    'Pendidikan Terakhir',
    'Unit Sekolah',
    'Jabatan Guru'
  ]

  const csvRows = [
    headers.map(h => `"${h}"`).join(',')
  ]

  // Tambahkan BOM (\uFEFF) agar Microsoft Excel membuka teks UTF-8 dengan benar tanpa encoding rusak
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `template-data-induk-guru-darqia9.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Handler Pemilihan File
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    processFile(e.dataTransfer.files[0])
  }
}

const processFile = (file: File) => {
  selectedFile.value = file
  parseError.value = ''
  parsedRows.value = []

  const reader = new FileReader()
  reader.onload = (evt) => {
    const text = evt.target?.result as string
    if (!text) {
      parseError.value = 'File kosong atau tidak dapat dibaca.'
      return
    }

    try {
      parseCsv(text)
    } catch (err: any) {
      parseError.value = 'Gagal memproses file: ' + (err.message || 'Format tidak valid')
    }
  }
  reader.onerror = () => {
    parseError.value = 'Gagal membaca berkas file.'
  }
  reader.readAsText(file)
}

// Parser CSV sederhana & handal
const parseCsv = (content: string) => {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) {
    parseError.value = 'Berkas minimal harus memiliki 1 baris judul dan 1 baris data guru.'
    return
  }

  // Helper parser baris CSV dengan kutipan ganda
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''))
    return result
  }

  const normalizedHeaders = parseLine(lines[0]).map(header => header.replace('\uFEFF', '').trim().toLowerCase())
  const getColumn = (cols: string[], ...headers: string[]) => {
    const index = normalizedHeaders.findIndex(header => headers.includes(header))
    const value = index >= 0 ? (cols[index] || '').trim() : ''
    return value === '-' ? '' : value
  }

  const dataRows: StaffItem[] = []
  const rowErrors: string[] = []
  const seenNips = new Set<string>()
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    if (cols.length === 0) continue

    const name = getColumn(cols, 'nama guru', 'nama lengkap')
    const nik = getColumn(cols, 'nik')
    const noKk = getColumn(cols, 'no kk')
    const nuptk = getColumn(cols, 'nuptk')
    const nip = getColumn(cols, 'nip')
    const phone = getColumn(cols, 'no telp/wa')
    const email = getColumn(cols, 'alamat email').toLowerCase()
    const birthPlace = getColumn(cols, 'tempat lahir')
    const birthDate = getColumn(cols, 'tgl lahir')
    const address = getColumn(cols, 'alamat')
    const kelurahan = getColumn(cols, 'kelurahan')
    const kecamatan = getColumn(cols, 'kecamatan')
    const kabKota = getColumn(cols, 'kab/kota')
    const education = getColumn(cols, 'pendidikan terakhir')
    const rawUnit = (getColumn(cols, 'unit', 'unit sekolah') || props.currentGrade).toUpperCase()
    const unit: StaffItem['unit'] = rawUnit.includes('SMP') ? 'SMP' : rawUnit.includes('YAYASAN') ? 'Yayasan' : 'SMK'
    const role = getColumn(cols, 'jabatan guru', 'jabatan', 'jabatan & tugas') || 'Guru'
    const subject = getColumn(cols, 'mapel utama')
    const rawStatus = getColumn(cols, 'status', 'status kepegawaian')
    const status = ['tidak aktif', 'nonaktif', 'inactive'].includes(rawStatus.trim().toLowerCase()) ? 'Tidak Aktif' : 'Aktif'
    const rfidUid = getColumn(cols, 'rfid uid')
    const rawGender = getColumn(cols, 'jenis kelamin').toUpperCase()
    const gender: StaffItem['gender'] = rawGender
      ? rawGender === 'PRIA' || rawGender.startsWith('L') ? 'Laki laki' : 'Perempuan'
      : undefined

    if (!name) rowErrors.push(`Baris ${i + 1}: nama guru wajib diisi.`)
    if (!nip && !nik) rowErrors.push(`Baris ${i + 1}: NIP atau NIK wajib diisi.`)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) rowErrors.push(`Baris ${i + 1}: alamat email tidak valid.`)
    if (nip && seenNips.has(nip)) rowErrors.push(`Baris ${i + 1}: NIP ${nip} duplikat.`)
    if (!name || (!nip && !nik) || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (nip && seenNips.has(nip))) continue
    if (nip) seenNips.add(nip)

    dataRows.push({
      id: `T-IMP-${Date.now()}-${i}`,
      name,
      nik,
      noKk,
      nuptk,
      nip,
      phone,
      email,
      birthPlace,
      birthDate,
      address,
      kelurahan,
      kecamatan,
      kabKota,
      education,
      unit,
      role,
      subject,
      status,
      rfidUid,
      gender,
      isUserSynced: false
    })
  }

  if (rowErrors.length > 0) {
    parseError.value = rowErrors.slice(0, 3).join(' ')
    parsedRows.value = []
    return
  }

  if (dataRows.length === 0) {
    parseError.value = 'Tidak ada baris data guru yang valid terbaca dari file.'
    return
  }

  parsedRows.value = dataRows
}

const confirmImport = () => {
  if (parsedRows.value.length === 0) return
  emit('imported', parsedRows.value, syncToUserManagement.value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#0C111D]/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Panel -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 border border-[#E7EBF2] my-4 sm:my-8 animate-scaleUp flex flex-col max-h-[92vh]"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-[#F2F4F7] flex items-center justify-between bg-white shrink-0">
          <div>
            <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-0.5">
              Impor Massal Kepegawaian
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-[#101828]">
              Unggah Data Induk Guru (Excel / CSV)
            </h3>
          </div>
          <button
            type="button"
            class="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-xl transition cursor-pointer"
            aria-label="Tutup modal"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="20" />
          </button>
        </div>

        <!-- Content Area -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <!-- Step 1: Download Template Excel/CSV Banner -->
          <div class="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <b class="text-xs font-bold text-[#101828] block">Belum memiliki format data yang sesuai?</b>
              <p class="text-[11.5px] text-[#64748B] mt-0.5 leading-relaxed">
                Unduh template CSV dengan 16 kolom data pokok guru. Berkas dapat dibuka dan diisi melalui Microsoft Excel atau Google Sheets.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F1F5F9] text-[#1B5FD9] font-bold text-xs rounded-xl border border-[#BFDBFE] shadow-2xs transition cursor-pointer shrink-0"
              @click="downloadTemplate"
            >
              <AdminV2Icon name="dl" :size="15" />
              <span>Unduh Template CSV</span>
            </button>
          </div>

          <!-- Step 2: Upload Area (Drag & Drop) -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-2">
              Pilih atau Tarik Berkas File (CSV atau format Excel):
            </label>
            <div
              class="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all"
              :class="isDragging ? 'border-[#1B5FD9] bg-[#EFF6FF]' : 'border-[#CBD5E1] hover:border-[#1B5FD9] bg-[#FAFAFA]'"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="fileInputRef?.click()"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".csv, application/vnd.ms-excel, text/csv, .txt"
                class="hidden"
                @change="handleFileSelect"
              />
              <div class="w-12 h-12 rounded-2xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mx-auto mb-3">
                <AdminV2Icon name="dl" :size="22" class="rotate-180" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-[#101828]">
                {{ selectedFile ? selectedFile.name : 'Klik untuk memilih berkas atau seret berkas ke sini' }}
              </div>
              <div class="text-[11px] text-[#64748B] mt-1">
                Format yang didukung: .csv (kompatibel Microsoft Excel / Google Sheets)
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div
            v-if="parseError"
            class="p-3 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <AdminV2Icon name="alert" :size="16" class="shrink-0" />
            <span>{{ parseError }}</span>
          </div>

          <!-- Preview Table Hasil Parsing -->
          <div v-if="parsedRows.length > 0" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#101828]">
                Hasil Pembacaan Berkas: <span class="text-[#1B5FD9] font-mono">{{ parsedRows.length }} guru</span> siap diimpor
              </span>
              <span class="text-[11px] text-[#059669] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                Semua Baris Valid
              </span>
            </div>

            <div class="border border-[#E2E8F0] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table class="w-full text-left text-xs text-[#344054]">
                <thead class="bg-[#F8FAFC] text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider sticky top-0 border-b border-[#E2E8F0]">
                  <tr>
                    <th class="px-3 py-2">Nama Guru</th>
                    <th class="px-3 py-2">NIP</th>
                    <th class="px-3 py-2">Email</th>
                    <th class="px-3 py-2">Unit</th>
                    <th class="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F5F9]">
                  <tr v-for="row in parsedRows" :key="row.id" class="hover:bg-[#F8FAFC]">
                    <td class="px-3 py-2 font-bold text-[#101828]">{{ row.name }}</td>
                    <td class="px-3 py-2 font-mono text-[#475467]">{{ row.nip }}</td>
                    <td class="px-3 py-2 font-mono text-[#1B5FD9]">{{ row.email }}</td>
                    <td class="px-3 py-2">
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8]">
                        {{ row.unit }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-[10px] font-semibold text-[#059669]">{{ row.status }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Option Checkbox: Auto Sync to User Management -->
            <div class="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <label class="flex items-start gap-2.5 cursor-pointer">
                <input
                  v-model="syncToUserManagement"
                  type="checkbox"
                  class="w-4 h-4 mt-0.5 rounded border-[#86EFAC] text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                />
                <div class="text-xs">
                  <b class="text-[#166534] block font-bold">Otomatis buatkan akun di Manajemen Pengguna (User Management)</b>
                  <span class="text-[#15803D]">
                    Setiap guru yang diunggah akan otomatis memiliki akun login dengan username alamat email atau NIP mereka.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-[#F2F4F7] flex items-center justify-end gap-2 bg-white shrink-0">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#475467] hover:bg-[#F2F4F7] transition cursor-pointer"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1B5FD9] hover:bg-[#154db0] shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="parsedRows.length === 0"
            @click="confirmImport"
          >
            <AdminV2Icon name="check" :size="16" />
            <span>Impor {{ parsedRows.length > 0 ? `${parsedRows.length} Guru` : 'Data' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
