<template>
  <div v-if="isOpen" class="modal-ov" @click.self="$emit('close')">
    <div class="modal modal-lg" role="dialog" aria-modal="true" style="max-width:680px;max-height:90vh;display:flex;flex-direction:column">
      <div class="modal-h" style="border-bottom:1px solid var(--line);padding-bottom:14px">
        <div>
          <h3 style="font-size:18px;margin-bottom:2px">{{ mode === 'add' ? 'Tambah Peserta Didik Baru' : 'Edit Data Siswa' }}</h3>
          <p style="font-size:13px;color:var(--muted)">Lengkapi biodata lengkap dan data induk siswa.</p>
        </div>
        <button class="icon-btn" type="button" aria-label="Tutup" @click="$emit('close')">
          <AdminIcon name="x" size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
        <div class="modal-b" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px">
          <!-- BIODATA UTAMA -->
          <div style="font-size:13.5px;font-weight:700;color:var(--navy-900);border-bottom:1px solid var(--line-2);padding-bottom:6px">
            1. Biodata Siswa
          </div>

          <div class="grid g2" style="gap:14px">
            <div class="field" style="margin-bottom:0">
              <label>Nama Lengkap <span style="color:var(--rose)">*</span></label>
              <input v-model="form.name" required class="inp-field" placeholder="cth: Ahmad Fauzi" />
            </div>

            <div class="field" style="margin-bottom:0">
              <label>Jenis Kelamin <span style="color:var(--rose)">*</span></label>
              <select v-model="form.gender" required class="inp-field">
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div class="field" style="margin-bottom:0">
              <label>NISN (10 Digit) <span style="color:var(--rose)">*</span></label>
              <input v-model="form.nisn" required maxlength="10" class="inp-field font-mono" placeholder="cth: 0078912345" />
            </div>

            <div class="field" style="margin-bottom:0">
              <label>NIK (16 Digit)</label>
              <input v-model="form.nik" maxlength="16" class="inp-field font-mono" placeholder="cth: 3216061405080001" />
            </div>

            <div class="field" style="margin-bottom:0">
              <label>Tempat Lahir</label>
              <input v-model="form.birthPlace" class="inp-field" placeholder="cth: Bekasi" />
            </div>

            <div class="field" style="margin-bottom:0">
              <label>Tanggal Lahir</label>
              <input v-model="form.birthDate" class="inp-field" placeholder="cth: 14 Mei 2008" />
            </div>
          </div>

          <div class="field" style="margin-bottom:0">
            <label>Alamat Lengkap</label>
            <textarea v-model="form.address" rows="2" class="inp-field" placeholder="Jl. Raya Ujung Harapan No. ..."></textarea>
          </div>

          <!-- AKADEMIK & KELAS -->
          <div style="font-size:13.5px;font-weight:700;color:var(--navy-900);border-bottom:1px solid var(--line-2);padding-bottom:6px;margin-top:8px">
            2. Data Akademik & Rombel
          </div>

          <div class="grid g2" style="gap:14px">
            <div class="field" style="margin-bottom:0">
              <label>Kelas / Rombel <span style="color:var(--rose)">*</span></label>
              <input v-model="form.className" required class="inp-field" placeholder="cth: X TKJ 1 / VII-A" />
            </div>

            <div v-if="grade === 'SMK'" class="field" style="margin-bottom:0">
              <label>Program Keahlian (Jurusan)</label>
              <select v-model="form.major" class="inp-field">
                <option value="">Pilih Jurusan</option>
                <option value="TKJ">Teknik Komputer & Jaringan (TKJ)</option>
                <option value="AKL">Akuntansi & Keuangan Lembaga (AKL)</option>
                <option value="OTKP">Otomatisasi & Tata Kelola Perkantoran (OTKP)</option>
                <option value="DKV">Desain Komunikasi Visual (DKV)</option>
                <option value="TBSM">Teknik Bisnis Sepeda Motor (TBSM)</option>
                <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
              </select>
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
              <label>UID Kartu RFID (Opsional)</label>
              <input v-model="form.rfidUid" class="inp-field font-mono" placeholder="cth: E280-1170-0000-XXXX" />
            </div>
          </div>

          <!-- DATA ORTU -->
          <div style="font-size:13.5px;font-weight:700;color:var(--navy-900);border-bottom:1px solid var(--line-2);padding-bottom:6px;margin-top:8px">
            3. Data Orang Tua / Wali
          </div>

          <div class="grid g2" style="gap:14px">
            <div class="field" style="margin-bottom:0">
              <label>Nama Ayah / Wali</label>
              <input v-model="form.parentName" class="inp-field" placeholder="cth: H. Ridwan" />
            </div>

            <div class="field" style="margin-bottom:0">
              <label>Nama Ibu</label>
              <input v-model="form.motherName" class="inp-field" placeholder="cth: Siti Aminah" />
            </div>

            <div class="field" style="margin-bottom:0;grid-column:span 2">
              <label>No. HP / WhatsApp Orang Tua</label>
              <input v-model="form.parentPhone" class="inp-field" placeholder="cth: 082210823033" />
            </div>
          </div>
        </div>

        <div class="modal-f" style="border-top:1px solid var(--line);padding:14px 20px;display:flex;justify-content:flex-end;gap:10px">
          <button class="btn btn-ghost btn-sm" type="button" @click="$emit('close')">Batal</button>
          <button class="btn btn-primary btn-sm" type="submit">
            {{ mode === 'add' ? 'Simpan Siswa' : 'Perbarui Data' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
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
.inp-field {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: #f8fafc;
  font-size: 13.5px;
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
