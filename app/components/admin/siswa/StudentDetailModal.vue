<template>
  <Teleport to="body">
    <div v-if="student" class="modal-root-ov" @click.self="$emit('close')">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal-card" role="dialog" aria-modal="true">
        <!-- HEADER -->
        <div class="modal-card-h">
          <div style="display:flex;align-items:center;gap:14px">
            <span
              class="ava ava-lg"
              :style="{ background: student.gender === 'L' ? 'linear-gradient(135deg,var(--blue-600),var(--blue-800))' : 'linear-gradient(135deg,#ec4899,#be185d)' }"
              style="width:50px;height:50px;border-radius:14px;color:#fff;display:grid;place-items:center;font-weight:800;font-size:18px;flex-shrink:0"
            >
              {{ initials(student.name) }}
            </span>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <h3 style="font-size:17.5px;margin:0;font-weight:700;color:var(--navy-900)">{{ student.name }}</h3>
                <span class="pill" :class="student.status === 'Aktif' ? 'p-green' : 'p-rose'">{{ student.status }}</span>
                <span v-if="student.hasRfid" class="pill p-blue font-mono" style="font-size:11px">RFID Ready</span>
              </div>
              <p style="font-size:12.5px;color:var(--muted);margin-top:2px">
                ID: <b class="font-mono" style="color:var(--blue-600)">{{ student.id }}</b> &bull; NIS: <b>{{ student.nis || '-' }}</b> &bull; NISN: <b>{{ student.nisn }}</b> &bull; Kelas: <b>{{ student.className }}</b>
                <template v-if="student.major"> &bull; {{ student.major }}</template>
              </p>
            </div>
          </div>
          <button class="icon-btn" type="button" aria-label="Tutup" @click="$emit('close')">
            <AdminIcon name="x" size="18" />
          </button>
        </div>

        <!-- TABS HEADER -->
        <div class="modal-tabs-bar">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            class="btn-tab"
            :class="{ active: activeTab === t.id }"
            @click="activeTab = t.id"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- MODAL BODY -->
        <div class="modal-card-b">
          <!-- TAB 1: BIODATA & ALAMAT -->
          <div v-if="activeTab === 'pribadi'" class="grid g2" style="gap:16px">
            <div class="detail-item">
              <span class="d-label">ID Siswa (Billing / Tagihan Pembayaran)</span>
              <b class="d-val font-mono" style="color:var(--blue-600);font-weight:800">{{ student.id }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Nama Lengkap</span>
              <b class="d-val">{{ student.name }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Jenis Kelamin</span>
              <b class="d-val">{{ student.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">NISN</span>
              <b class="d-val font-mono">{{ student.nisn }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Nomor Induk Siswa (NIS)</span>
              <b class="d-val font-mono">{{ student.nis || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">NIK Siswa</span>
              <b class="d-val font-mono">{{ student.nik || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Nomor Kartu Keluarga (KK)</span>
              <b class="d-val font-mono">{{ student.noKk || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Tempat, Tanggal Lahir</span>
              <b class="d-val">{{ student.birthPlace }}, {{ student.birthDate }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Agama</span>
              <b class="d-val">{{ student.religion || 'Islam' }}</b>
            </div>
            <div class="detail-item" style="grid-column:span 2">
              <span class="d-label">Alamat Lengkap</span>
              <b class="d-val">{{ student.address }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">RT / RW</span>
              <b class="d-val">RT {{ student.rt || '-' }} / RW {{ student.rw || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Kelurahan / Desa</span>
              <b class="d-val">{{ student.village || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Kecamatan & Kota</span>
              <b class="d-val">{{ student.district || '-' }}, {{ student.city || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Jenis Tempat Tinggal</span>
              <b class="d-val">{{ student.livingType || 'Bersama orang tua' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Moda Transportasi</span>
              <b class="d-val">{{ student.transportation || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">No. Handphone / WA Siswa</span>
              <b class="d-val">{{ student.phone || '-' }}</b>
            </div>
          </div>

          <!-- TAB 2: DATA ORANG TUA -->
          <div v-else-if="activeTab === 'ortu'" style="display:flex;flex-direction:column;gap:16px">
            <!-- AYAH -->
            <div style="background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:16px">
              <div style="font-size:13.5px;font-weight:700;color:var(--navy-900);margin-bottom:12px;display:flex;align-items:center;gap:6px">
                <AdminIcon name="user" size="16" /> Data Ayah / Wali
              </div>
              <div class="grid g2" style="gap:14px">
                <div class="detail-item">
                  <span class="d-label">Nama Ayah</span>
                  <b class="d-val">{{ student.fatherName || '-' }}</b>
                </div>
                <div class="detail-item">
                  <span class="d-label">NIK Ayah</span>
                  <b class="d-val font-mono">{{ student.fatherNik || '-' }}</b>
                </div>
                <div class="detail-item">
                  <span class="d-label">Tahun Lahir & Pendidikan</span>
                  <b class="d-val">{{ student.fatherBirthYear || '-' }} &bull; {{ student.fatherEducation || '-' }}</b>
                </div>
                <div class="detail-item">
                  <span class="d-label">Pekerjaan & Penghasilan</span>
                  <b class="d-val">{{ student.fatherJob || '-' }} ({{ student.fatherIncome || '-' }})</b>
                </div>
                <div class="detail-item" style="grid-column:span 2">
                  <span class="d-label">Kontak WhatsApp Ayah</span>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
                    <b class="d-val">{{ student.fatherPhone || '-' }}</b>
                    <a
                      v-if="student.fatherPhone"
                      :href="`https://wa.me/62${student.fatherPhone.replace(/^0/, '')}`"
                      target="_blank"
                      class="btn btn-sm btn-ghost"
                      style="padding:3px 8px;font-size:11.5px;color:var(--green)"
                    >
                      Kirim Pesan WA
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- IBU -->
            <div style="background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:16px">
              <div style="font-size:13.5px;font-weight:700;color:var(--navy-900);margin-bottom:12px;display:flex;align-items:center;gap:6px">
                <AdminIcon name="user" size="16" /> Data Ibu Kandung
              </div>
              <div class="grid g2" style="gap:14px">
                <div class="detail-item">
                  <span class="d-label">Nama Ibu</span>
                  <b class="d-val">{{ student.motherName || '-' }}</b>
                </div>
                <div class="detail-item">
                  <span class="d-label">NIK Ibu</span>
                  <b class="d-val font-mono">{{ student.motherNik || '-' }}</b>
                </div>
                <div class="detail-item">
                  <span class="d-label">Tahun Lahir & Pendidikan</span>
                  <b class="d-val">{{ student.motherBirthYear || '-' }} &bull; {{ student.motherEducation || '-' }}</b>
                </div>
                <div class="detail-item">
                  <span class="d-label">Pekerjaan & Penghasilan</span>
                  <b class="d-val">{{ student.motherJob || '-' }} ({{ student.motherIncome || '-' }})</b>
                </div>
                <div class="detail-item" style="grid-column:span 2">
                  <span class="d-label">Kontak WhatsApp Ibu</span>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
                    <b class="d-val">{{ student.motherPhone || '-' }}</b>
                    <a
                      v-if="student.motherPhone"
                      :href="`https://wa.me/62${student.motherPhone.replace(/^0/, '')}`"
                      target="_blank"
                      class="btn btn-sm btn-ghost"
                      style="padding:3px 8px;font-size:11.5px;color:var(--green)"
                    >
                      Kirim Pesan WA
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: AKADEMIK & ASAL SEKOLAH -->
          <div v-else-if="activeTab === 'akademik'" class="grid g2" style="gap:16px">
            <div class="detail-item">
              <span class="d-label">Jenjang Sekolah</span>
              <b class="d-val">{{ student.level === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</b>
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
              <b class="d-val">{{ student.entryYear }} <template v-if="student.entryDate">({{ student.entryDate }})</template></b>
            </div>
            <div class="detail-item">
              <span class="d-label">Sekolah Asal</span>
              <b class="d-val">{{ student.prevSchool || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Nomor Seri Ijazah Sebelumnya</span>
              <b class="d-val font-mono">{{ student.prevDiplomaNo || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Status Siswa</span>
              <span class="pill" :class="student.status === 'Aktif' ? 'p-green' : 'p-rose'">{{ student.status }}</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Presensi Kehadiran</span>
              <b class="d-val" style="color:var(--green)">{{ student.attendancePct }}%</b>
            </div>
          </div>

          <!-- TAB 4: FISIK & DATA TAMBAHAN -->
          <div v-else-if="activeTab === 'fisik'" class="grid g2" style="gap:16px">
            <div class="detail-item">
              <span class="d-label">Anak Ke-</span>
              <b class="d-val">{{ student.birthOrder ? `Anak ke-${student.birthOrder}` : '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Jumlah Saudara Kandung</span>
              <b class="d-val">{{ student.siblingsCount !== undefined ? `${student.siblingsCount} bersaudara` : '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Tinggi Badan</span>
              <b class="d-val">{{ student.height ? `${student.height} cm` : '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Berat Badan</span>
              <b class="d-val">{{ student.weight ? `${student.weight} kg` : '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Lingkar Kepala</span>
              <b class="d-val">{{ student.headCircumference ? `${student.headCircumference} cm` : '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Jarak Rumah ke Sekolah</span>
              <b class="d-val">{{ student.distanceKm !== undefined ? `${student.distanceKm} KM` : '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Hobi Siswa</span>
              <b class="d-val">{{ student.hobby || '-' }}</b>
            </div>
            <div class="detail-item">
              <span class="d-label">Cita-cita</span>
              <b class="d-val">{{ student.ambition || '-' }}</b>
            </div>
          </div>

          <!-- TAB 5: RFID & ABSENSI -->
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

        <!-- FOOTER -->
        <div class="modal-card-f">
          <button class="btn btn-ghost btn-sm" type="button" @click="$emit('edit', student)">
            <AdminIcon name="pencil" size="15" /> Edit Biodata
          </button>
          <button class="btn btn-primary btn-sm" type="button" @click="$emit('close')">
            Tutup
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
  student: StudentItem | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'edit', s: StudentItem): void
}>()

const activeTab = ref<'pribadi' | 'ortu' | 'akademik' | 'fisik' | 'rfid'>('pribadi')

const tabs = [
  { id: 'pribadi', label: 'Biodata & Alamat' },
  { id: 'ortu', label: 'Data Orang Tua' },
  { id: 'akademik', label: 'Akademik & Asal Sekolah' },
  { id: 'fisik', label: 'Fisik & Tambahan' },
  { id: 'rfid', label: 'RFID ID Card' }
] as const

watch(
  () => props.student,
  (val) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = val ? 'hidden' : ''
    }
  }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
</script>

<style scoped>
.modal-root-ov {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  overflow: hidden;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 23, 0.68);
  backdrop-filter: blur(4px);
  z-index: 1;
  animation: fadeIn 0.2s ease;
}
.modal-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - 48px);
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  margin: auto;
}
.modal-card-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
  background: #fff;
  flex-shrink: 0;
}
.modal-tabs-bar {
  display: flex;
  gap: 4px;
  padding: 8px 20px 0;
  border-bottom: 1px solid var(--line);
  background: var(--card);
  overflow-x: auto;
  flex-shrink: 0;
}
.modal-card-b {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px;
}
.modal-card-f {
  border-top: 1px solid var(--line);
  padding: 14px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  flex-shrink: 0;
}
.btn-tab {
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  color: var(--muted);
  white-space: nowrap;
  cursor: pointer;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
}
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
  font-size: 13.5px;
  color: var(--ink);
}
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPop {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
