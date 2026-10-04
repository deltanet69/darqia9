<template>
  <div v-if="student" class="modal-ov" @click.self="$emit('close')">
    <div class="modal modal-lg" role="dialog" aria-modal="true" style="max-width:680px;max-height:90vh;display:flex;flex-direction:column">
      <div class="modal-h" style="border-bottom:1px solid var(--line);padding-bottom:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="ava ava-lg" style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--blue-600),var(--blue-800));color:#fff;display:grid;place-items:center;font-weight:800;font-size:18px">
            {{ initials(student.name) }}
          </span>
          <div>
            <h3 style="font-size:18px;margin-bottom:2px">{{ student.name }}</h3>
            <p style="font-size:13px;color:var(--muted)">NISN: {{ student.nisn }} &bull; {{ student.className }} <template v-if="student.major">({{ student.major }})</template></p>
          </div>
        </div>
        <button class="icon-btn" type="button" aria-label="Tutup" @click="$emit('close')">
          <AdminIcon name="x" size="18" />
        </button>
      </div>

      <!-- Tab Buttons -->
      <div style="display:flex;gap:8px;padding:12px 20px 0;border-bottom:1px solid var(--line);background:var(--card);overflow-x:auto">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="btn-tab"
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
          style="padding:8px 14px;font-size:13px;font-weight:600;border-bottom:2px solid transparent;border-radius:0;color:var(--muted)"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Modal Body Tab Content -->
      <div class="modal-b" style="flex:1;overflow-y:auto;padding:20px">
        <!-- TAB 1: BIODATA PRIBADI -->
        <div v-if="activeTab === 'pribadi'" class="grid g2" style="gap:16px">
          <div class="detail-item">
            <span class="d-label">Nama Lengkap</span>
            <b class="d-val">{{ student.name }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">Jenis Kelamin</span>
            <b class="d-val">{{ student.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">NISN</span>
            <b class="d-val">{{ student.nisn }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">NIK</span>
            <b class="d-val">{{ student.nik }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">Tempat, Tanggal Lahir</span>
            <b class="d-val">{{ student.birthPlace }}, {{ student.birthDate }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">No. Telepon / WhatsApp</span>
            <b class="d-val">{{ student.phone || '-' }}</b>
          </div>
          <div class="detail-item" style="grid-column:span 2">
            <span class="d-label">Alamat Lengkap</span>
            <b class="d-val">{{ student.address }}</b>
          </div>
        </div>

        <!-- TAB 2: AKADEMIK & KELAS -->
        <div v-else-if="activeTab === 'akademik'" class="grid g2" style="gap:16px">
          <div class="detail-item">
            <span class="d-label">Jenjang Sekolah</span>
            <b class="d-val">{{ student.level }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">Kelas / Rombel</span>
            <b class="d-val">{{ student.className }}</b>
          </div>
          <div v-if="student.major" class="detail-item">
            <span class="d-label">Program Keahlian (Jurusan)</span>
            <b class="d-val">{{ student.major }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">Tahun Masuk (Angkatan)</span>
            <b class="d-val">{{ student.entryYear }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">Status Siswa</span>
            <span class="pill" :class="student.status === 'Aktif' ? 'p-green' : 'p-rose'">{{ student.status }}</span>
          </div>
          <div class="detail-item">
            <span class="d-label">Persentase Kehadiran</span>
            <b class="d-val" style="color:var(--green)">{{ student.attendancePct }}%</b>
          </div>
        </div>

        <!-- TAB 3: ORANG TUA / WALI -->
        <div v-else-if="activeTab === 'ortu'" class="grid g2" style="gap:16px">
          <div class="detail-item">
            <span class="d-label">Nama Ayah / Wali</span>
            <b class="d-val">{{ student.parentName || '-' }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">Nama Ibu</span>
            <b class="d-val">{{ student.motherName || '-' }}</b>
          </div>
          <div class="detail-item">
            <span class="d-label">No. HP / WhatsApp Ortu</span>
            <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
              <b>{{ student.parentPhone }}</b>
              <a
                v-if="student.parentPhone"
                :href="`https://wa.me/62${student.parentPhone.replace(/^0/, '')}`"
                target="_blank"
                class="btn btn-sm btn-ghost"
                style="padding:4px 8px;font-size:11px"
              >
                Chat WA
              </a>
            </div>
          </div>
          <div class="detail-item">
            <span class="d-label">Alamat Orang Tua</span>
            <b class="d-val">{{ student.address }}</b>
          </div>
        </div>

        <!-- TAB 4: RFID & ABSENSI -->
        <div v-else-if="activeTab === 'rfid'" class="grid g2" style="gap:16px">
          <div class="detail-item">
            <span class="d-label">Status Kartu RFID</span>
            <span class="pill" :class="student.hasRfid ? 'p-blue' : 'p-amber'">
              {{ student.hasRfid ? 'Terdaftar & Aktif' : 'Belum Ada Kartu' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="d-label">UID Kartu RFID</span>
            <b class="d-val font-mono">{{ student.rfidUid || 'Belum di-assign' }}</b>
          </div>
          <div class="detail-item" style="grid-column:span 2">
            <div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:12px;padding:14px">
              <b style="font-size:13.5px;color:var(--navy-900);display:block;margin-bottom:4px">Metode Absensi Siswa</b>
              <p style="font-size:12.5px;color:var(--muted);line-height:1.6">
                Sesuai aturan sekolah pada dokumen <b>PRD.md & AGENTS.md</b>, absensi siswa wajib menggunakan <b>RFID ID Card</b> (bukan QR / PIN). Kartu ini digunakan untuk tap-in di gerbang sekolah.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-f" style="border-top:1px solid var(--line);padding:14px 20px;display:flex;justify-content:space-between">
        <button class="btn btn-ghost btn-sm" type="button" @click="$emit('edit', student)">
          <AdminIcon name="pencil" size="15" /> Edit Biodata
        </button>
        <button class="btn btn-primary btn-sm" type="button" @click="$emit('close')">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import type { StudentItem } from '~/composables/useAdminStudents'

defineProps<{
  student: StudentItem | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'edit', s: StudentItem): void
}>()

const activeTab = ref<'pribadi' | 'akademik' | 'ortu' | 'rfid'>('pribadi')

const tabs = [
  { id: 'pribadi', label: 'Biodata Pribadi' },
  { id: 'akademik', label: 'Data Akademik' },
  { id: 'ortu', label: 'Data Orang Tua' },
  { id: 'rfid', label: 'RFID & Absensi' }
] as const

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
</script>

<style scoped>
.btn-tab.active {
  color: var(--blue-600) !important;
  border-bottom-color: var(--blue-600) !important;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.d-label {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}
.d-val {
  font-size: 14px;
  color: var(--ink);
}
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
