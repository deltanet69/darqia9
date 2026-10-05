<script setup lang="ts">
import { computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
import StudentDetailModal from '~/components/admin/siswa/StudentDetailModal.vue'
import StudentFormModal from '~/components/admin/siswa/StudentFormModal.vue'
import StudentImportModal from '~/components/admin/siswa/StudentImportModal.vue'
import { useAdminStudents, type StudentItem } from '~/composables/useAdminStudents'

definePageMeta({
  layout: 'admin',
  name: 'admin-siswa'
})
useHead({ title: 'Data Siswa | Admin Portal' })

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
</script>

<template>
  <section class="space-y-6">
    <!-- PAGE HEAD -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Data Siswa</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Data induk peserta didik {{ gradeText }} &bull; Tahun Ajaran 2026/2027</p>
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        <button class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-150" type="button" @click="studentsStore.openImportModal">
          <AdminIcon name="upload" size="16" class="text-slate-500" /> Import CSV
        </button>
        <button class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-150" type="button" @click="studentsStore.exportStudentsCsv()">
          <AdminIcon name="dl" size="16" class="text-slate-500" /> Export CSV
        </button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-[0_6px_18px_-4px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_24px_-4px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200" type="button" @click="studentsStore.openAddModal">
          <AdminIcon name="plus" size="16" /> Tambah Siswa
        </button>
      </div>
    </div>

    <!-- KPI GRADIENT CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Siswa (k-blue) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#60a5fa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="users" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ studentsStore.grade.value }}
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ studentsStore.stats.value.total }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Peserta Didik Terdaftar Aktif</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[12, 16, 20, 24, 28, 32]" color="#ffffff" />
        </div>
      </div>

      <!-- Rasio Gender (k-violet) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="user" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ studentsStore.stats.value.boys }}L / {{ studentsStore.stats.value.girls }}P
          </span>
        </div>
        <div class="relative z-10 text-2xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm flex items-baseline gap-2">
          <span>{{ studentsStore.stats.value.boys }} <small class="text-xs font-medium text-white/80">Putra</small></span>
          <span>&bull;</span>
          <span>{{ studentsStore.stats.value.girls }} <small class="text-xs font-medium text-white/80">Putri</small></span>
        </div>
        <div class="relative z-10 text-xs font-medium text-white/85">{{ studentsStore.grade.value === 'SMP' ? 'Kelas terpisah berbasis gender' : 'Siswa putra & putri' }}</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[8, 12, 14, 18, 20, 24]" color="#ffffff" />
        </div>
      </div>

      <!-- Rombongan Belajar (k-amber) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#92400e] via-[#d97706] to-[#fbbf24] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="book" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ studentsStore.stats.value.totalClasses }} Rombel
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ studentsStore.stats.value.totalClasses }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Total Kelas Rombongan Belajar</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[4, 6, 8, 8, 10, 12]" color="#ffffff" />
        </div>
      </div>

      <!-- Kartu RFID (k-green) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#065f46] via-[#059669] to-[#34d399] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="card" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ studentsStore.stats.value.rfidPct }}% Aktif
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">
          {{ studentsStore.stats.value.rfidCount }} <span class="text-sm font-normal text-white/80">/ {{ studentsStore.stats.value.total }}</span>
        </div>
        <div class="relative z-10 text-xs font-medium text-white/85">Siap Absensi Tap Kartu RFID</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[10, 15, 20, 25, 30, 35]" color="#ffffff" />
        </div>
      </div>
    </div>

    <!-- FILTER & SEARCH BAR -->
    <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-4 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 min-w-[240px] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
          <input
            v-model="studentsStore.searchQuery.value"
            placeholder="Cari nama, NISN, NIK, kelas, nama ortu..."
            class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
          />
        </label>

        <!-- Filter Kelas -->
        <select v-model="studentsStore.selectedClass.value" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all">
          <option value="all">Semua Kelas</option>
          <option v-for="c in studentsStore.classOptions.value" :key="c" :value="c">{{ c }}</option>
        </select>

        <!-- Filter Jurusan (SMK Only) -->
        <select v-if="studentsStore.grade.value === 'SMK'" v-model="studentsStore.selectedMajor.value" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all">
          <option value="all">Semua Jurusan</option>
          <option v-for="m in studentsStore.majorOptions.value" :key="m" :value="m">{{ m }}</option>
        </select>

        <!-- Filter Gender -->
        <select v-model="studentsStore.selectedGender.value" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all">
          <option value="all">Semua Gender</option>
          <option value="L">Laki-laki (L)</option>
          <option value="P">Perempuan (P)</option>
        </select>

        <!-- Filter RFID -->
        <select v-model="studentsStore.selectedRfid.value" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all">
          <option value="all">Semua Status RFID</option>
          <option value="yes">Punya RFID</option>
          <option value="no">Belum Punya</option>
        </select>

        <!-- Reset Filter -->
        <button class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition" type="button" @click="studentsStore.resetFilters" title="Reset filter">
          Reset
        </button>
      </div>
    </article>

    <!-- DATA TABLE -->
    <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
        <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
          Daftar Induk Siswa &mdash; {{ studentsStore.grade.value }}
        </h3>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
          {{ studentsStore.filteredStudents.value.length }} siswa
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50/90 text-xs font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3.5 w-12 text-center">No</th>
              <th class="px-4 py-3.5">Peserta Didik</th>
              <th class="px-4 py-3.5">ID Siswa & NISN</th>
              <th class="px-4 py-3.5">Kelas</th>
              <th class="px-4 py-3.5 text-center">Gender</th>
              <th class="px-4 py-3.5">Orang Tua & Kontak</th>
              <th class="px-4 py-3.5 text-center">Kartu RFID</th>
              <th class="px-4 py-3.5 text-center">Status</th>
              <th class="px-4 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="studentsStore.filteredStudents.value.length === 0">
              <td colspan="9" class="py-14 text-center text-slate-400">
                <div class="text-sm font-semibold mb-1 text-slate-700">Tidak ada data siswa yang cocok</div>
                <div class="text-xs text-slate-400">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</div>
              </td>
            </tr>
            <tr v-for="(s, idx) in studentsStore.filteredStudents.value" :key="s.id" class="hover:bg-blue-50/40 transition">
              <td class="px-4 py-3.5 text-xs text-slate-400 font-mono text-center">{{ idx + 1 }}</td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <span
                    class="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
                    :class="s.gender === 'L' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-pink-500 to-rose-700'"
                  >
                    {{ initials(s.name) }}
                  </span>
                  <div>
                    <button class="font-bold text-slate-900 text-left hover:text-blue-600 transition block text-[13.5px] leading-tight" type="button" @click="studentsStore.viewDetail(s)">
                      {{ s.name }}
                    </button>
                    <div class="text-xs text-slate-400 mt-0.5">{{ s.phone || 'Tanpa no. HP' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="font-mono text-xs font-bold text-blue-700">{{ s.id }}</div>
                <div class="font-mono text-[11px] text-slate-400">NISN: {{ s.nisn }}</div>
              </td>
              <td class="px-4 py-3.5">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="s.level === 'SMP' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'">
                  {{ s.className }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold" :class="s.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
                  {{ s.gender }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <div class="text-xs font-semibold text-slate-800">{{ s.fatherName || s.motherName || '-' }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  <a v-if="s.fatherPhone || s.motherPhone" :href="`https://wa.me/62${(s.fatherPhone || s.motherPhone || '').replace(/^0/, '')}`" target="_blank" class="text-blue-600 hover:underline">
                    {{ s.fatherPhone || s.motherPhone }}
                  </a>
                  <span v-else>-</span>
                </div>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span v-if="s.hasRfid" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200" title="RFID Terdaftar">
                  RFID Active
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Belum Ada
                </span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="s.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                  {{ s.status }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition" type="button" title="Detail Siswa" @click="studentsStore.viewDetail(s)">
                    <AdminIcon name="eye" size="15" />
                  </button>
                  <button class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition" type="button" title="Edit Data" @click="studentsStore.openEditModal(s)">
                    <AdminIcon name="pencil" size="15" />
                  </button>
                  <button class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition" type="button" title="Hapus Siswa" @click="studentsStore.confirmDelete(s)">
                    <AdminIcon name="trash" size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span><b>{{ studentsStore.filteredStudents.value.length }}</b> dari total {{ studentsStore.students.value.length }} siswa ditampilkan</span>
        <span class="font-mono text-[11px] text-slate-400">Tahun Ajaran 2026/2027</span>
      </div>
    </article>

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

    <!-- IMPORT MODAL (CSV) -->
    <StudentImportModal
      :is-open="studentsStore.isImportModalOpen.value"
      :grade="studentsStore.grade.value"
      @close="studentsStore.closeImportModal"
      @import="studentsStore.importStudents($event.students, $event.mode)"
      @download-template="studentsStore.downloadTemplate()"
    />

    <!-- DELETE CONFIRMATION MODAL -->
    <Teleport to="body">
      <div v-if="studentsStore.deleteConfirmStudent.value" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="studentsStore.cancelDelete" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Hapus Data Siswa?</h3>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition" type="button" aria-label="Tutup" @click="studentsStore.cancelDelete">
              <AdminIcon name="x" size="18" />
            </button>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            Apakah kamu yakin ingin menghapus data siswa <b class="text-slate-900">{{ studentsStore.deleteConfirmStudent.value.name }}</b> (NISN: {{ studentsStore.deleteConfirmStudent.value.nisn }})?
          </p>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="studentsStore.cancelDelete">Batal</button>
            <button class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition" type="button" @click="studentsStore.executeDelete">Hapus Siswa</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
