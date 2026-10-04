<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-root-ov" @click.self="$emit('close')">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal-card" role="dialog" aria-modal="true">
        <!-- HEADER -->
        <div class="modal-card-h">
          <div>
            <h3 style="font-size:18px;margin:0 0 3px;font-weight:700;color:var(--navy-900)">
              Import Data Siswa (CSV)
            </h3>
            <p style="font-size:12.5px;color:var(--muted);margin:0">
              Unggah file CSV data induk siswa untuk jenjang <b>{{ grade === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</b>.
            </p>
          </div>
          <button class="icon-btn" type="button" aria-label="Tutup" @click="$emit('close')">
            <AdminIcon name="x" size="18" />
          </button>
        </div>

        <!-- BODY -->
        <div class="modal-card-b">
          <!-- STEP 1: UPLOAD & TEMPLATE -->
          <div style="background:#f8fafc;border:1.5px dashed var(--line);border-radius:14px;padding:22px;text-align:center">
            <div style="width:48px;height:48px;border-radius:12px;background:var(--blue-50);color:var(--blue-600);display:grid;place-items:center;margin:0 auto 12px">
              <AdminIcon name="dl" size="22" />
            </div>
            <h4 style="font-size:15px;margin:0 0 6px;color:var(--ink)">Pilih File CSV Data Siswa</h4>
            <p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">
              Gunakan file format CSV (UTF-8). Pastikan kolom sesuai dengan format resmi Dapodik.
            </p>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">
              <label class="btn btn-primary btn-sm" style="cursor:pointer">
                <AdminIcon name="plus" size="15" /> Pilih File CSV
                <input type="file" accept=".csv,text/csv" style="display:none" @change="handleFileChange" />
              </label>
              <button class="btn btn-ghost btn-sm" type="button" @click="handleDownloadTemplate">
                <AdminIcon name="dl" size="15" /> Unduh Template CSV
              </button>
            </div>
          </div>

          <!-- FILE INFO & PREVIEW -->
          <div v-if="fileName" style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="pill p-blue" style="font-size:11px">File Terpilih</span>
                <b style="font-size:13px">{{ fileName }}</b>
              </div>
              <div style="font-size:12px;color:var(--muted)">
                Total: <b>{{ parsedRows.length }}</b> baris data
              </div>
            </div>

            <!-- SUMMARY STATS -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
              <div class="stat-box">
                <span class="s-label">Total Terbaca</span>
                <b class="s-val" style="color:var(--blue-600)">{{ parsedRows.length }}</b>
              </div>
              <div class="stat-box">
                <span class="s-label">Data Valid</span>
                <b class="s-val" style="color:var(--green)">{{ validRows.length }}</b>
              </div>
              <div class="stat-box">
                <span class="s-label">Data Kurang Lengkap</span>
                <b class="s-val" :style="{ color: invalidCount > 0 ? 'var(--rose)' : 'var(--muted)' }">{{ invalidCount }}</b>
              </div>
            </div>

            <!-- MODE IMPORT OPTION -->
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line-2)">
              <label style="font-size:12.5px;font-weight:700;color:var(--navy-900);display:block;margin-bottom:6px">Metode Pemasukan Data:</label>
              <div style="display:flex;gap:16px">
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                  <input type="radio" v-model="importMode" value="append" />
                  <span><b>Gabungkan (Append)</b> &mdash; Tambah ke data yang ada</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                  <input type="radio" v-model="importMode" value="replace" />
                  <span style="color:var(--rose)"><b>Gantikan (Replace)</b> &mdash; Timpa data siswa jenjang ini</span>
                </label>
              </div>
            </div>

            <!-- MINI PREVIEW TABLE -->
            <div v-if="validRows.length > 0" style="margin-top:12px">
              <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase">
                Pratinjau Data (5 Siswa Pertama):
              </div>
              <div style="max-height:160px;overflow-y:auto;border:1px solid var(--line);border-radius:8px">
                <table style="width:100%;border-collapse:collapse;font-size:12px">
                  <thead style="background:#f8fafc;border-bottom:1px solid var(--line);position:sticky;top:0">
                    <tr>
                      <th style="padding:6px 10px;text-align:left">No</th>
                      <th style="padding:6px 10px;text-align:left">NISN</th>
                      <th style="padding:6px 10px;text-align:left">Nama Lengkap</th>
                      <th style="padding:6px 10px;text-align:left">Kelas</th>
                      <th style="padding:6px 10px;text-align:left">L/P</th>
                      <th style="padding:6px 10px;text-align:left">Orang Tua</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in validRows.slice(0, 5)" :key="i" style="border-bottom:1px solid var(--line-2)">
                      <td style="padding:6px 10px;color:var(--muted)">{{ i + 1 }}</td>
                      <td style="padding:6px 10px;font-family:monospace;font-weight:600">{{ r.nisn }}</td>
                      <td style="padding:6px 10px;font-weight:600">{{ r.name }}</td>
                      <td style="padding:6px 10px">{{ r.className }}</td>
                      <td style="padding:6px 10px">{{ r.gender }}</td>
                      <td style="padding:6px 10px">{{ r.fatherName || r.motherName || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ERROR NOTICE -->
          <div v-if="errorMessage" style="background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:12px;display:flex;align-items:center;gap:8px;color:#be123c;font-size:13px">
            <AdminIcon name="x" size="16" />
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="modal-card-f">
          <button class="btn btn-ghost btn-sm" type="button" @click="$emit('close')">Batal</button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="validRows.length === 0"
            @click="handleApplyImport"
          >
            <AdminIcon name="plus" size="15" /> Import {{ validRows.length }} Data Siswa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

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
  // Remove BOM if present
  let cleanText = text.replace(/^\uFEFF/, '').trim()
  const lines = cleanText.split(/\r\n|\n|\r/)
  if (lines.length < 2) return []

  // Parse header
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

      // Convert and validate rows
      const valid: StudentItem[] = []
      let invalids = 0

      rawRows.forEach((r, idx) => {
        // Name is required
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

<style scoped>
.modal-root-ov { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px 16px; overflow: hidden; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(2, 8, 23, 0.68); backdrop-filter: blur(4px); z-index: 1; animation: fadeIn 0.2s ease; }
.modal-card { position: relative; z-index: 2; width: 100%; max-width: 720px; max-height: calc(100vh - 48px); background: #ffffff; border-radius: 18px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); display: flex; flex-direction: column; overflow: hidden; animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1); margin: auto; }
.modal-card-h { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--line); background: #fff; flex-shrink: 0; }
.modal-card-b { flex: 1; min-height: 0; overflow-y: auto; padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-card-f { border-top: 1px solid var(--line); padding: 14px 22px; display: flex; justify-content: flex-end; gap: 10px; background: #fff; flex-shrink: 0; }
.stat-box { background: #f8fafc; border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; text-align: center; }
.s-label { font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px; }
.s-val { font-size: 18px; font-weight: 800; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalPop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
