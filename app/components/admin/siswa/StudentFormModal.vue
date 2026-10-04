<template>
  <div v-if="isOpen" class="modal-ov" @click.self="$emit('close')">
    <div class="modal modal-lg" role="dialog" aria-modal="true" style="max-width:760px;max-height:92vh;display:flex;flex-direction:column">
      <!-- HEADER -->
      <div class="modal-h" style="border-bottom:1px solid var(--line);padding-bottom:14px">
        <div>
          <h3 style="font-size:18px;margin-bottom:2px">{{ mode === 'add' ? 'Tambah Data Siswa Baru' : 'Edit Data Induk Siswa' }}</h3>
          <p style="font-size:13px;color:var(--muted)">Lengkapi data pokok peserta didik sesuai format data resmi sekolah / Dapodik.</p>
        </div>
        <button class="icon-btn" type="button" aria-label="Tutup" @click="$emit('close')">
          <AdminIcon name="x" size="18" />
        </button>
      </div>

      <!-- FORM TABS -->
      <div style="display:flex;gap:4px;padding:8px 20px 0;border-bottom:1px solid var(--line);background:var(--card);overflow-x:auto">
        <button
          v-for="st in sections"
          :key="st.id"
          type="button"
          class="btn-tab"
          :class="{ active: currentSection === st.id }"
          @click="currentSection = st.id"
          style="padding:9px 14px;font-size:13px;font-weight:600;border-bottom:2px solid transparent;border-radius:0;color:var(--muted);white-space:nowrap;cursor:pointer;background:none;border-top:none;border-left:none;border-right:none"
        >
          {{ st.label }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
        <div class="modal-b" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px">
          <!-- SECTION 1: BIODATA & ALAMAT -->
          <template v-if="currentSection === 'pribadi'">
            <div class="grid g2" style="gap:14px">
              <div class="field" style="margin-bottom:0;grid-column:span 2">
                <label>Nama Lengkap <span style="color:var(--rose)">*</span></label>
                <input v-model="form.name" required class="inp-field" placeholder="cth: AHMAD FAUZI" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>NISN (10 Digit) <span style="color:var(--rose)">*</span></label>
                <input v-model="form.nisn" required maxlength="10" class="inp-field font-mono" placeholder="cth: 0078912345" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>NIS (Nomor Induk Siswa)</label>
                <input v-model="form.nis" class="inp-field font-mono" placeholder="cth: 26270120117" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>NIK Siswa (16 Digit)</label>
                <input v-model="form.nik" maxlength="16" class="inp-field font-mono" placeholder="cth: 3216020103090009" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>No. Kartu Keluarga (KK)</label>
                <input v-model="form.noKk" maxlength="16" class="inp-field font-mono" placeholder="cth: 3216021203090001" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Jenis Kelamin <span style="color:var(--rose)">*</span></label>
                <select v-model="form.gender" required class="inp-field">
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Agama</label>
                <select v-model="form.religion" class="inp-field">
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                </select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Tempat Lahir</label>
                <input v-model="form.birthPlace" class="inp-field" placeholder="cth: BEKASI" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Tanggal Lahir</label>
                <input v-model="form.birthDate" class="inp-field" placeholder="cth: 2010-06-08 / 8 Juni 2010" />
              </div>
              <div class="field" style="margin-bottom:0;grid-column:span 2">
                <label>Alamat Lengkap (Jalan / Gang / No)</label>
                <input v-model="form.address" class="inp-field" placeholder="cth: UJUNG HARAPAN RT. 006/ 015" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>RT / RW</label>
                <div style="display:flex;gap:8px">
                  <input v-model="form.rt" class="inp-field" placeholder="RT cth: 06" style="flex:1" />
                  <input v-model="form.rw" class="inp-field" placeholder="RW cth: 15" style="flex:1" />
                </div>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Kelurahan / Desa</label>
                <input v-model="form.village" class="inp-field" placeholder="cth: Bahagia" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Kecamatan & Kota</label>
                <div style="display:flex;gap:8px">
                  <input v-model="form.district" class="inp-field" placeholder="Kec. Babelan" style="flex:1" />
                  <input v-model="form.city" class="inp-field" placeholder="Kab. Bekasi" style="flex:1" />
                </div>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Moda Transportasi</label>
                <select v-model="form.transportation" class="inp-field">
                  <option value="Sepeda motor">Sepeda motor</option>
                  <option value="Sepeda">Sepeda</option>
                  <option value="Jalan kaki">Jalan kaki</option>
                  <option value="Angkutan umum/bus/pete-pete">Angkutan umum / Pete-pete</option>
                  <option value="Mobil/bus antar jemput">Mobil antar jemput</option>
                </select>
              </div>
              <div class="field" style="margin-bottom:0;grid-column:span 2">
                <label>No. HP / WA Siswa</label>
                <input v-model="form.phone" class="inp-field font-mono" placeholder="cth: 081299887701" />
              </div>
            </div>
          </template>

          <!-- SECTION 2: DATA ORANG TUA -->
          <template v-else-if="currentSection === 'ortu'">
            <div style="font-size:13px;font-weight:700;color:var(--blue-600);text-transform:uppercase;letter-spacing:0.5px">
              A. Identitas Ayah / Wali
            </div>
            <div class="grid g2" style="gap:14px">
              <div class="field" style="margin-bottom:0">
                <label>Nama Ayah</label>
                <input v-model="form.fatherName" class="inp-field" placeholder="cth: H. RIDWAN KAMIL" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>NIK Ayah</label>
                <input v-model="form.fatherNik" class="inp-field font-mono" placeholder="cth: 3216021405800001" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Tahun Lahir & Pendidikan</label>
                <div style="display:flex;gap:8px">
                  <input v-model="form.fatherBirthYear" class="inp-field" placeholder="1980" style="width:90px" />
                  <select v-model="form.fatherEducation" class="inp-field" style="flex:1">
                    <option value="SMA / sederajat">SMA / sederajat</option>
                    <option value="SMP / sederajat">SMP / sederajat</option>
                    <option value="SD / sederajat">SD / sederajat</option>
                    <option value="D1/D2/D3">D1/D2/D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                  </select>
                </div>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Pekerjaan & Penghasilan</label>
                <div style="display:flex;gap:8px">
                  <input v-model="form.fatherJob" class="inp-field" placeholder="Pekerjaan" style="flex:1" />
                  <select v-model="form.fatherIncome" class="inp-field" style="flex:1">
                    <option value="< Rp1.000.000">&lt; Rp1.000.000</option>
                    <option value="Rp1.000.001 – Rp3.000.000">Rp1-3 Jt</option>
                    <option value="Rp3.000.001 – Rp5.000.000">Rp3-5 Jt</option>
                    <option value="Rp5.000.001 – Rp10.000.000">Rp5-10 Jt</option>
                  </select>
                </div>
              </div>
              <div class="field" style="margin-bottom:0;grid-column:span 2">
                <label>No. HP / WhatsApp Ayah</label>
                <input v-model="form.fatherPhone" class="inp-field font-mono" placeholder="cth: 082210823033" />
              </div>
            </div>

            <div style="font-size:13px;font-weight:700;color:var(--blue-600);text-transform:uppercase;letter-spacing:0.5px;margin-top:8px">
              B. Identitas Ibu Kandung
            </div>
            <div class="grid g2" style="gap:14px">
              <div class="field" style="margin-bottom:0">
                <label>Nama Ibu</label>
                <input v-model="form.motherName" class="inp-field" placeholder="cth: NURJANAH" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>NIK Ibu</label>
                <input v-model="form.motherNik" class="inp-field font-mono" placeholder="cth: 3216024711820001" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Tahun Lahir & Pendidikan</label>
                <div style="display:flex;gap:8px">
                  <input v-model="form.motherBirthYear" class="inp-field" placeholder="1982" style="width:90px" />
                  <select v-model="form.motherEducation" class="inp-field" style="flex:1">
                    <option value="SMA / sederajat">SMA / sederajat</option>
                    <option value="SMP / sederajat">SMP / sederajat</option>
                    <option value="SD / sederajat">SD / sederajat</option>
                    <option value="S1">S1</option>
                  </select>
                </div>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Pekerjaan & Penghasilan</label>
                <div style="display:flex;gap:8px">
                  <input v-model="form.motherJob" class="inp-field" placeholder="Pekerjaan" style="flex:1" />
                  <select v-model="form.motherIncome" class="inp-field" style="flex:1">
                    <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                    <option value="< Rp1.000.000">&lt; Rp1.000.000</option>
                    <option value="Rp1.000.001 – Rp3.000.000">Rp1-3 Jt</option>
                  </select>
                </div>
              </div>
              <div class="field" style="margin-bottom:0;grid-column:span 2">
                <label>No. HP / WhatsApp Ibu</label>
                <input v-model="form.motherPhone" class="inp-field font-mono" placeholder="cth: 082210823033" />
              </div>
            </div>
          </template>

          <!-- SECTION 3: AKADEMIK & ASAL SEKOLAH -->
          <template v-else-if="currentSection === 'akademik'">
            <div class="grid g2" style="gap:14px">
              <div class="field" style="margin-bottom:0">
                <label>Kelas / Rombel <span style="color:var(--rose)">*</span></label>
                <input v-model="form.className" required class="inp-field" placeholder="cth: X. TKJ 1 / VII-A (Putra)" />
              </div>
              <div v-if="grade === 'SMK'" class="field" style="margin-bottom:0">
                <label>Program Keahlian (Jurusan)</label>
                <select v-model="form.major" class="inp-field">
                  <option value="">Pilih Jurusan</option>
                  <option value="TKJ">Teknik Komputer & Jaringan (TKJ)</option>
                  <option value="AKL">Akuntansi & Keuangan Lembaga (AKL)</option>
                  <option value="TBSM">Teknik Bisnis Sepeda Motor (TBSM)</option>
                  <option value="OTKP">Otomatisasi Tata Kelola Perkantoran (OTKP)</option>
                  <option value="DKV">Desain Komunikasi Visual (DKV)</option>
                  <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                </select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Sekolah Asal</label>
                <input v-model="form.prevSchool" class="inp-field" placeholder="cth: SMP IT BINA CENDEKIA ASSALAM (BCA)" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Nomor Seri Ijazah Sebelumnya</label>
                <input v-model="form.prevDiplomaNo" class="inp-field font-mono" placeholder="cth: DN-01/D-SMP/K13/2024/001" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Status Siswa</label>
                <select v-model="form.status" class="inp-field">
                  <option value="Aktif">Aktif</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Pindah">Pindah</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Tahun Angkatan</label>
                <input v-model="form.entryYear" class="inp-field font-mono" placeholder="cth: 2026" />
              </div>
              <div class="field" style="margin-bottom:0;grid-column:span 2">
                <label>UID Kartu RFID (Absensi ID Card)</label>
                <input v-model="form.rfidUid" class="inp-field font-mono" placeholder="cth: E280-1170-0000-021B" />
              </div>
            </div>
          </template>

          <!-- SECTION 4: FISIK & LAINNYA -->
          <template v-else-if="currentSection === 'fisik'">
            <div class="grid g2" style="gap:14px">
              <div class="field" style="margin-bottom:0">
                <label>Anak Ke-</label>
                <input v-model.number="form.birthOrder" type="number" class="inp-field" placeholder="cth: 2" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Jumlah Saudara Kandung</label>
                <input v-model.number="form.siblingsCount" type="number" class="inp-field" placeholder="cth: 3" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Tinggi Badan (cm)</label>
                <input v-model.number="form.height" type="number" class="inp-field" placeholder="cth: 165" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Berat Badan (kg)</label>
                <input v-model.number="form.weight" type="number" class="inp-field" placeholder="cth: 55" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Lingkar Kepala (cm)</label>
                <input v-model.number="form.headCircumference" type="number" class="inp-field" placeholder="cth: 54" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Jarak Rumah ke Sekolah (KM)</label>
                <input v-model.number="form.distanceKm" type="number" class="inp-field" placeholder="cth: 2" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Hobi Siswa</label>
                <input v-model="form.hobby" class="inp-field" placeholder="cth: Futsal, Membaca" />
              </div>
              <div class="field" style="margin-bottom:0">
                <label>Cita-cita</label>
                <input v-model="form.ambition" class="inp-field" placeholder="cth: Network Engineer / Guru" />
              </div>
            </div>
          </template>
        </div>

        <!-- FOOTER -->
        <div class="modal-f" style="border-top:1px solid var(--line);padding:14px 20px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:12px;color:var(--muted)">
            Langkah: <b>{{ sectionTitle }}</b>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-ghost btn-sm" type="button" @click="$emit('close')">Batal</button>
            <button class="btn btn-primary btn-sm" type="submit">
              {{ mode === 'add' ? 'Simpan Siswa' : 'Perbarui Data' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import type { StudentItem } from '~/composables/useAdminStudents'

const props = defineProps<{
  isOpen: boolean
  mode: 'add' | 'edit'
  grade: string
  initialData: Partial<StudentItem>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<StudentItem>): void
}>()

const currentSection = ref<'pribadi' | 'ortu' | 'akademik' | 'fisik'>('pribadi')

const sections = [
  { id: 'pribadi', label: '1. Biodata & Alamat' },
  { id: 'ortu', label: '2. Data Orang Tua' },
  { id: 'akademik', label: '3. Akademik & Asal Sekolah' },
  { id: 'fisik', label: '4. Fisik & Lainnya' }
] as const

const sectionTitle = computed(() => {
  return sections.find(s => s.id === currentSection.value)?.label || ''
})

const form = reactive<Partial<StudentItem>>({})

watch(
  () => props.initialData,
  (val) => {
    Object.assign(form, val)
  },
  { immediate: true, deep: true }
)

const handleSubmit = () => {
  emit('save', { ...form })
}
</script>

<style scoped>
.btn-tab.active {
  color: var(--blue-600) !important;
  border-bottom-color: var(--blue-600) !important;
}
.inp-field {
  width: 100%;
  padding: 9px 13px;
  border: 1.5px solid var(--line);
  border-radius: 9px;
  background: #f8fafc;
  font-size: 13px;
  outline: none;
  transition: .18s;
}
.inp-field:focus {
  border-color: var(--blue-500);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
