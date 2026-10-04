<template>
  <section class="admin-siswa-page">
    <!-- PAGE HEAD -->
    <div class="page-head">
      <div>
        <h2>Data Siswa</h2>
        <p>Data induk peserta didik {{ gradeText }} &bull; Tahun Ajaran 2026/2027</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" type="button" @click="handleExport">
          <AdminIcon name="dl" size="16" /> Export CSV
        </button>
        <button class="btn btn-primary btn-sm" type="button" @click="studentsStore.openAddModal">
          <AdminIcon name="plus" size="16" /> Tambah Siswa
        </button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="grid g4" style="margin-bottom:20px">
      <div class="card card-kpi">
        <div class="card-b">
          <div class="kpi-head">
            <span>Total Siswa</span>
            <span class="pill p-blue">{{ studentsStore.grade.value }}</span>
          </div>
          <div class="kpi-val">{{ studentsStore.stats.value.total }}</div>
          <div class="kpi-sub">Peserta didik terdaftar aktif</div>
        </div>
      </div>

      <div class="card card-kpi">
        <div class="card-b">
          <div class="kpi-head">
            <span>Rasio Gender</span>
            <span class="pill p-violet">{{ studentsStore.stats.value.boys }}L / {{ studentsStore.stats.value.girls }}P</span>
          </div>
          <div class="kpi-val" style="font-size:22px;line-height:1.4">
            <b>{{ studentsStore.stats.value.boys }}</b> <span style="font-size:14px;color:var(--muted)">Putra</span> &bull; <b>{{ studentsStore.stats.value.girls }}</b> <span style="font-size:14px;color:var(--muted)">Putri</span>
          </div>
          <div class="kpi-sub">{{ studentsStore.grade.value === 'SMP' ? 'Kelas terpisah berbasis gender' : 'Siswa putra & putri' }}</div>
        </div>
      </div>

      <div class="card card-kpi">
        <div class="card-b">
          <div class="kpi-head">
            <span>Rombongan Belajar</span>
            <span class="pill p-cyan">{{ studentsStore.stats.value.totalClasses }} Kelas</span>
          </div>
          <div class="kpi-val">{{ studentsStore.stats.value.totalClasses }}</div>
          <div class="kpi-sub">Total kelas rombel aktif</div>
        </div>
      </div>

      <div class="card card-kpi">
        <div class="card-b">
          <div class="kpi-head">
            <span>Kartu RFID Siswa</span>
            <span class="pill p-green">{{ studentsStore.stats.value.rfidPct }}%</span>
          </div>
          <div class="kpi-val">{{ studentsStore.stats.value.rfidCount }} <span style="font-size:15px;color:var(--muted)">/ {{ studentsStore.stats.value.total }}</span></div>
          <div class="kpi-sub">Siap absensi tap kartu RFID</div>
        </div>
      </div>
    </div>

    <!-- FILTER & SEARCH BAR -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-b" style="padding:16px 20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <!-- Search -->
          <div class="inp" style="flex:1;min-width:240px">
            <span class="ic"><AdminIcon name="search" size="16" /></span>
            <input
              v-model="studentsStore.searchQuery.value"
              placeholder="Cari nama, NISN, NIK, kelas, nama ortu..."
            />
          </div>

          <!-- Filter Kelas -->
          <div class="inp" style="width:160px">
            <select v-model="studentsStore.selectedClass.value">
              <option value="all">Semua Kelas</option>
              <option v-for="c in studentsStore.classOptions.value" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <!-- Filter Jurusan (SMK Only) -->
          <div v-if="studentsStore.grade.value === 'SMK'" class="inp" style="width:150px">
            <select v-model="studentsStore.selectedMajor.value">
              <option value="all">Semua Jurusan</option>
              <option v-for="m in studentsStore.majorOptions.value" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>

          <!-- Filter Gender -->
          <div class="inp" style="width:130px">
            <select v-model="studentsStore.selectedGender.value">
              <option value="all">Semua Gender</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <!-- Filter RFID -->
          <div class="inp" style="width:150px">
            <select v-model="studentsStore.selectedRfid.value">
              <option value="all">Semua Status RFID</option>
              <option value="yes">Punya RFID</option>
              <option value="no">Belum Punya</option>
            </select>
          </div>

          <!-- Reset Filter -->
          <button class="btn btn-ghost btn-sm" type="button" @click="studentsStore.resetFilters" title="Reset filter">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="card">
      <div class="card-b" style="padding:0">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px">No</th>
                <th>Peserta Didik</th>
                <th>NISN / NIK</th>
                <th>Kelas</th>
                <th>Gender</th>
                <th>Orang Tua & Kontak</th>
                <th>Kartu RFID</th>
                <th>Status</th>
                <th style="text-align:right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="studentsStore.filteredStudents.value.length === 0">
                <td colspan="9" style="text-align:center;padding:40px 20px;color:var(--muted)">
                  <div style="font-size:15px;font-weight:600;margin-bottom:4px">Tidak ada data siswa</div>
                  <div style="font-size:13px">Coba ubah kata kunci pencarian atau filter yang dipilih.</div>
                </td>
              </tr>
              <tr v-for="(s, idx) in studentsStore.filteredStudents.value" :key="s.id">
                <td style="color:var(--muted);font-size:13px">{{ idx + 1 }}</td>
                <td>
                  <div class="row-user">
                    <span class="ava" :style="{ background: s.gender === 'L' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'linear-gradient(135deg,#ec4899,#be185d)' }">
                      {{ initials(s.name) }}
                    </span>
                    <div>
                      <div class="t-name" style="cursor:pointer" @click="studentsStore.viewDetail(s)">{{ s.name }}</div>
                      <div class="t-sub">{{ s.phone || 'Tanpa no. HP' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-family:ui-monospace,monospace;font-size:13px;font-weight:700">{{ s.nisn }}</div>
                  <div style="font-size:11.5px;color:var(--muted)">NIK: {{ s.nik || '-' }}</div>
                </td>
                <td>
                  <span class="pill" :class="s.level === 'SMP' ? 'p-green' : 'p-blue'">{{ s.className }}</span>
                </td>
                <td>
                  <span class="gender-tag" :class="s.gender === 'L' ? 'tag-l' : 'tag-p'">
                    {{ s.gender === 'L' ? 'L' : 'P' }}
                  </span>
                </td>
                <td>
                  <div style="font-size:13px;font-weight:600">{{ s.parentName || '-' }}</div>
                  <div style="font-size:11.5px;color:var(--muted)">
                    <a v-if="s.parentPhone" :href="`https://wa.me/62${s.parentPhone.replace(/^0/, '')}`" target="_blank" style="color:var(--blue-600);text-decoration:none">
                      {{ s.parentPhone }}
                    </a>
                    <span v-else>-</span>
                  </div>
                </td>
                <td>
                  <span v-if="s.hasRfid" class="pill p-blue font-mono" style="font-size:11px" title="RFID Terdaftar">
                    RFID Active
                  </span>
                  <span v-else class="pill p-amber" style="font-size:11px">
                    Belum Ada
                  </span>
                </td>
                <td>
                  <span class="pill" :class="s.status === 'Aktif' ? 'p-green' : 'p-rose'">{{ s.status }}</span>
                </td>
                <td style="text-align:right">
                  <div style="display:inline-flex;gap:6px">
                    <button class="icon-btn" type="button" title="Detail Siswa" @click="studentsStore.viewDetail(s)">
                      <AdminIcon name="eye" size="16" />
                    </button>
                    <button class="icon-btn" type="button" title="Edit Data" @click="studentsStore.openEditModal(s)">
                      <AdminIcon name="pencil" size="16" />
                    </button>
                    <button class="icon-btn" type="button" title="Hapus Siswa" style="color:var(--rose)" @click="studentsStore.confirmDelete(s)">
                      <AdminIcon name="trash" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <StudentDetailModal
      :student="studentsStore.detailModalStudent.value"
      @close="studentsStore.closeDetail"
      @edit="onEditFromDetail"
    />

    <!-- FORM MODAL (ADD / EDIT) -->
    <StudentFormModal
      :is-open="studentsStore.isFormModalOpen.value"
      :mode="studentsStore.formModalMode.value"
      :grade="studentsStore.grade.value"
      :initial-data="studentsStore.formStudent.value"
      @close="studentsStore.closeFormModal"
      @save="studentsStore.saveStudent"
    />

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="studentsStore.deleteConfirmStudent.value" class="modal-ov" @click.self="studentsStore.cancelDelete">
      <div class="modal" role="dialog" aria-modal="true" style="max-width:420px">
        <div class="modal-h">
          <h3>Hapus Data Siswa?</h3>
          <button class="icon-btn" type="button" aria-label="Tutup" @click="studentsStore.cancelDelete">
            <AdminIcon name="x" size="18" />
          </button>
        </div>
        <div class="modal-b" style="padding:16px 20px">
          <p style="font-size:14px;color:var(--muted);line-height:1.6">
            Apakah kamu yakin ingin menghapus data siswa <b>{{ studentsStore.deleteConfirmStudent.value.name }}</b> (NISN: {{ studentsStore.deleteConfirmStudent.value.nisn }})?
          </p>
        </div>
        <div class="modal-f" style="padding:14px 20px;display:flex;justify-content:flex-end;gap:10px">
          <button class="btn btn-ghost btn-sm" type="button" @click="studentsStore.cancelDelete">Batal</button>
          <button class="btn btn-danger btn-sm" type="button" @click="studentsStore.executeDelete">Hapus Siswa</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import StudentDetailModal from '~/components/admin/siswa/StudentDetailModal.vue'
import StudentFormModal from '~/components/admin/siswa/StudentFormModal.vue'
import { useAdminStudents, type StudentItem } from '~/composables/useAdminStudents'

definePageMeta({
  layout: 'admin'
})

const studentsStore = useAdminStudents()

const gradeText = computed(() => {
  return studentsStore.grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const onEditFromDetail = (s: StudentItem) => {
  studentsStore.closeDetail()
  studentsStore.openEditModal(s)
}

const handleExport = () => {
  const list = studentsStore.filteredStudents.value
  const headers = 'ID,NISN,NIK,Nama,Gender,Jenjang,Kelas,Jurusan,NoHP,NamaOrtu,NoWAOrtu,Status,RFID\n'
  const rows = list.map(s => `"${s.id}","${s.nisn}","${s.nik}","${s.name}","${s.gender}","${s.level}","${s.className}","${s.major || '-'}","${s.phone || '-'}","${s.parentName || '-'}","${s.parentPhone || '-'}","${s.status}","${s.rfidUid || '-'}"`).join('\n')
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `data-siswa-${studentsStore.grade.value.toLowerCase()}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.card-kpi {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.kpi-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
  margin-bottom: 8px;
}
.kpi-val {
  font-size: 28px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin-bottom: 4px;
}
.kpi-sub {
  font-size: 12px;
  color: var(--muted);
}
.table-wrap {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.data-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--line);
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.data-table tr:hover td {
  background: #f8fafc;
}
.gender-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
}
.tag-l {
  background: #dbeafe;
  color: #1d4ed8;
}
.tag-p {
  background: #fce7f3;
  color: #be185d;
}
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
