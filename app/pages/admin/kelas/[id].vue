<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Breadcrumb & Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <NuxtLink
            to="/admin/kelas"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs"
          >
            <span>‹</span>
            <span>Kembali ke Manajemen Kelas</span>
          </NuxtLink>
          <span class="text-slate-300">/</span>
          <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            Detail Rombel {{ classData.name }}
          </span>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Rombel {{ classData.name }}</span>
            <span
              class="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-xs"
              :class="classData.level === 'SMP'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'"
            >
              {{ classData.level }}<template v-if="classData.major"> &bull; {{ classData.major }}</template>
            </span>
          </h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-2 flex-wrap">
          <span>{{ schoolName }}</span>
          <span>&bull;</span>
          <span>{{ classData.room }}</span>
          <span>&bull;</span>
          <span>Tahun Ajaran 2026/2027 &bull; Semester Ganjil</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          @click="exportStudentList"
        >
          <AdminIcon name="dl" size="16" class="text-slate-500" />
          <span>Ekspor Siswa</span>
        </button>

        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          @click="activeSubmenu = 'absensi'"
        >
          <AdminIcon name="ucheck" size="16" />
          <span>Input Absensi Kelas</span>
        </button>
      </div>
    </div>

    <!-- 6 Sub-Menu Tabs (Sesuai docs/Admin Portal/manajemen kelas/kelasdetail.md) -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <button
        v-for="sub in submenus"
        :key="sub.id"
        type="button"
        class="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0"
        :class="activeSubmenu === sub.id
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'"
        @click="activeSubmenu = sub.id"
      >
        <AdminIcon :name="sub.icon" size="16" />
        <span>{{ sub.label }}</span>
        <span
          v-if="sub.count !== undefined"
          class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
          :class="activeSubmenu === sub.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
        >
          {{ sub.count }}
        </span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- 1. SUB MENU: OVERVIEW                                    -->
    <!-- ======================================================== -->
    <div v-if="activeSubmenu === 'overview'" class="space-y-6 animate-fadeUp">
      <!-- 4 Canonical Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Wali Kelas Assigned -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md"
            :class="avatarGradient(classData.name)"
          >
            {{ initials(classData.teacher) }}
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Wali Kelas (Assigned)</span>
            <b class="text-sm font-bold text-slate-900 block truncate leading-snug">{{ classData.teacher }}</b>
            <span class="text-[11px] font-mono text-slate-500 block truncate">NIP: {{ classData.teacherNip }}</span>
          </div>
        </div>

        <!-- Presensi Kehadiran (Filter Harian, Mingguan, Bulanan) -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presensi Kehadiran</span>
            <!-- Filter Rentang Waktu -->
            <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-[10px]">
              <button
                v-for="p in ['Harian', 'Mingguan', 'Bulanan']"
                :key="p"
                type="button"
                class="px-1.5 py-0.5 rounded-md font-bold transition-all"
                :class="overviewPeriod === p ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'"
                @click="overviewPeriod = p"
              >
                {{ p[0] }}
              </button>
            </div>
          </div>
          <div class="flex items-baseline gap-1.5">
            <b class="text-2xl font-black font-mono text-emerald-600 leading-none">
              {{ overviewPeriod === 'Harian' ? classData.attendance : (overviewPeriod === 'Mingguan' ? '95.4' : '94.8') }}%
            </b>
            <span class="text-xs font-bold text-emerald-700">{{ overviewPeriod }}</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" :style="{ width: `${classData.attendance}%` }" />
          </div>
        </div>

        <!-- Total Siswa -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0">
            <AdminIcon name="users" size="22" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Siswa</span>
            <div class="flex items-baseline gap-1.5">
              <b class="text-2xl font-black font-mono text-slate-900 leading-none">{{ classData.students }}</b>
              <span class="text-xs font-bold text-slate-500">Siswa</span>
            </div>
            <span class="text-[11px] font-semibold text-slate-500 mt-1 block">
              {{ classData.boys }} Putra &bull; {{ classData.girls }} Putri
            </span>
          </div>
        </div>

        <!-- Ruang & Kapasitas -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shrink-0">
            <AdminIcon name="bldg" size="22" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Lokasi &amp; Kapasitas</span>
            <b class="text-sm font-bold text-slate-900 block truncate">{{ classData.room }}</b>
            <span class="text-[11px] font-semibold text-slate-500 mt-1 block">
              Terisi {{ classData.students }} / 36 Kursi (Sisa 2)
            </span>
          </div>
        </div>
      </div>

      <!-- Jadwal Pelajaran Hari Ini (Live Highlight) & Kegiatan/Ujian Terdekat -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Jadwal Pelajaran Hari Ini (dengan Highlight Sesi Aktif) -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <b class="text-base font-black text-slate-900">Jadwal Pelajaran Hari Ini</b>
              <p class="text-xs text-slate-500 mt-0.5">Sesi aktif dan jadwal berlangsung</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              Senin &bull; 4 Sesi
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="session in todaySessions"
              :key="session.time"
              class="p-3.5 rounded-2xl border transition-all flex items-start gap-3.5"
              :class="session.isCurrent
                ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50/80 border-slate-100'"
            >
              <div class="shrink-0 text-center">
                <span
                  class="text-[10.5px] font-mono font-bold block px-2.5 py-1 rounded-lg"
                  :class="session.isCurrent ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'"
                >
                  {{ session.time }}
                </span>
                <span v-if="session.isCurrent" class="text-[9.5px] font-bold text-blue-700 uppercase tracking-wider block mt-1 animate-pulse">
                  Sedang Berlangsung
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <b class="text-sm font-bold text-slate-900 truncate">{{ session.subject }}</b>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    :class="session.teacherAbsen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ session.teacherAbsen ? '✓ Guru Hadir' : 'Menunggu' }}
                  </span>
                </div>
                <span class="text-xs text-slate-500 block truncate mt-0.5">{{ session.teacher }} &bull; {{ session.room }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Kegiatan & Jadwal Ujian Harian -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <b class="text-base font-black text-slate-900">Jadwal Kegiatan &amp; Ujian Harian</b>
              <p class="text-xs text-slate-500 mt-0.5">Agenda kelas terpantau pekan ini</p>
            </div>
            <span class="text-xs font-bold text-slate-400">Pekan Berjalan</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="act in upcomingEvents"
              :key="act.title"
              class="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                :class="act.type === 'ujian' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
              >
                <AdminIcon :name="act.type === 'ujian' ? 'file' : 'cal'" size="18" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <b class="text-xs sm:text-sm font-bold text-slate-900 truncate">{{ act.title }}</b>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="act.type === 'ujian' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
                    {{ act.badge }}
                  </span>
                </div>
                <span class="text-xs text-slate-500 block mt-0.5">{{ act.date }} &bull; {{ act.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. SUB MENU: DATA SISWA                                  -->
    <!-- ======================================================== -->
    <div v-else-if="activeSubmenu === 'siswa'" class="space-y-4 animate-fadeUp">
      <!-- Toolbar Filters & Actions -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div class="w-full max-w-sm flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-600 focus-within:bg-white shadow-xs transition-colors">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input
              v-model.trim="searchStudentQuery"
              placeholder="Cari nama atau NISN siswa..."
              class="w-full text-xs sm:text-sm font-medium outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
            />
            <button
              v-if="searchStudentQuery"
              class="text-slate-400 hover:text-slate-600 text-xs font-bold"
              type="button"
              @click="searchStudentQuery = ''"
            >
              ✕
            </button>
          </div>

          <!-- Filter Gender -->
          <select
            v-model="filterGender"
            class="px-3.5 py-2.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-xs cursor-pointer min-h-[42px]"
          >
            <option value="Semua">Semua Gender</option>
            <option value="L">Putra (L)</option>
            <option value="P">Putri (P)</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500 mr-2">
            Total: <b class="text-slate-900 font-mono">{{ filteredStudents.length }}</b> Siswa
          </span>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            @click="openMoveClassModal(null)"
          >
            <AdminIcon name="arr" size="14" />
            <span>Pindahkan Siswa</span>
          </button>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-4 w-12 text-center">No</th>
                <th class="py-3.5 px-4">NISN</th>
                <th class="py-3.5 px-4">Nama Lengkap Siswa</th>
                <th class="py-3.5 px-4 text-center">Gender</th>
                <th class="py-3.5 px-4 font-mono text-center">Presensi Bln Ini</th>
                <th class="py-3.5 px-4 font-mono text-center">Rata² Nilai</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="(stu, idx) in filteredStudents"
                :key="stu.nisn"
                class="hover:bg-blue-50/40 transition-colors"
              >
                <td class="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-mono font-bold text-slate-700">{{ stu.nisn }}</td>
                <td class="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                  <span
                    class="w-7 h-7 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                    :class="stu.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'"
                  >
                    {{ stu.gender }}
                  </span>
                  <span>{{ stu.name }}</span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="stu.gender === 'L' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-pink-50 text-pink-700 border border-pink-100'"
                  >
                    {{ stu.gender === 'L' ? 'Putra' : 'Putri' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-center text-slate-700">
                  {{ stu.attendanceRate }}%
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-center text-blue-600">
                  {{ stu.avgScore }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Aktif
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      title="Pindahkan siswa ke rombel lain"
                      @click="openMoveClassModal(stu)"
                    >
                      Ubah Kelas
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Soft delete (Superadmin only)"
                      @click="softDeleteStudent(stu)"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400 font-medium">
                  Tidak ada data siswa yang cocok dengan pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. SUB MENU: ABSENSI (Harian, Mingguan, Bulanan)         -->
    <!-- ======================================================== -->
    <div v-else-if="activeSubmenu === 'absensi'" class="space-y-4 animate-fadeUp">
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <!-- Filter Period: Harian, Mingguan, Bulanan -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">Filter Presensi:</span>
          <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              v-for="p in ['Harian', 'Mingguan', 'Bulanan']"
              :key="p"
              type="button"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="attendancePeriod === p ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              @click="attendancePeriod = p"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs font-bold">
          <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 33 Hadir</span>
          <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 1 Sakit</span>
          <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> 0 Izin</span>
          <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> 0 Alpa</span>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-4 w-12 text-center">No</th>
                <th class="py-3.5 px-4">Nama Siswa</th>
                <th class="py-3.5 px-4 font-mono text-center">Hadir</th>
                <th class="py-3.5 px-4 font-mono text-center">Sakit</th>
                <th class="py-3.5 px-4 font-mono text-center">Izin</th>
                <th class="py-3.5 px-4 font-mono text-center">Alpa</th>
                <th class="py-3.5 px-4 font-mono text-center">Persentase</th>
                <th class="py-3.5 px-4 text-center">Status Hari Ini</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(stu, idx) in studentList.slice(0, 15)" :key="stu.nisn" class="hover:bg-slate-50/60">
                <td class="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-bold text-slate-900">{{ stu.name }}</td>
                <td class="py-3.5 px-4 font-mono text-center text-emerald-700 font-bold">22</td>
                <td class="py-3.5 px-4 font-mono text-center text-amber-700 font-bold">1</td>
                <td class="py-3.5 px-4 font-mono text-center text-blue-700 font-bold">0</td>
                <td class="py-3.5 px-4 font-mono text-center text-rose-700 font-bold">0</td>
                <td class="py-3.5 px-4 font-mono font-bold text-center text-slate-800">{{ stu.attendanceRate }}%</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {{ stu.todayStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 4. SUB MENU: JADWAL PELAJARAN (Sub Menu Per Hari & Presensi) -->
    <!-- ======================================================== -->
    <!-- ======================================================== -->
    <!-- 4. SUB MENU: JADWAL PELAJARAN (Simple & Mobile-First)     -->
    <!-- ======================================================== -->
    <div v-else-if="activeSubmenu === 'jadwal'" class="space-y-3 animate-fadeUp">
      <!-- Unified Compact Bar: Header + Day Pills + Quick Nav -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
        <!-- Top Toolbar Row -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <AdminIcon name="cal" size="16" />
            </span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">Jadwal Pelajaran</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  {{ classData.name }}
                </span>
                <span
                  v-if="['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(realTodayDayName)"
                  class="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hari Ini: {{ realTodayDayName }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats & Prev/Next Arrows -->
          <div class="flex items-center gap-2">
            <span class="hidden md:inline-flex text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
              Guru Hadir: <b class="text-emerald-600 font-mono ml-1">{{ countTeacherPresent }}/{{ currentDaySlots.length }}</b>
            </span>

            <div class="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-sm font-black"
                title="Hari Sebelumnya"
                @click="prevScheduleDay"
              >
                ‹
              </button>
              <span class="px-2.5 text-xs font-black text-slate-800 min-w-[65px] text-center">
                {{ selectedScheduleDay }}
              </span>
              <button
                type="button"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-sm font-black"
                title="Hari Berikutnya"
                @click="nextScheduleDay"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <!-- Sleek Horizontal Day Pills (Touch-Friendly & Ultra-Compact) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 no-scrollbar">
          <button
            v-for="d in scheduleDays"
            :key="d.key"
            type="button"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border"
            :class="selectedScheduleDay === d.key
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'"
            @click="selectedScheduleDay = d.key"
          >
            <span>{{ d.label }}</span>
            <span
              class="text-[10px] font-mono px-1.5 py-0.2 rounded-md"
              :class="selectedScheduleDay === d.key ? 'bg-slate-800 text-blue-200' : 'bg-slate-200/80 text-slate-500'"
            >
              {{ (weeklySchedule[d.key] || []).length }}
            </span>
            <span
              v-if="d.key === realTodayDayName"
              class="w-2 h-2 rounded-full shrink-0"
              :class="selectedScheduleDay === d.key ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'"
              title="Hari Ini"
            />
          </button>
        </div>
      </div>

      <!-- Compact Session Cards List -->
      <div class="space-y-2">
        <div
          v-for="(slot, idx) in currentDaySlots"
          :key="slot.id"
          class="rounded-2xl p-3 sm:p-3.5 border transition-all relative overflow-hidden group"
          :class="[
            slot.isCurrent
              ? 'bg-white ring-2 ring-blue-500/25 border-blue-400 shadow-xs'
              : (isSlotUpcoming(slot)
                  ? 'bg-slate-50/90 border-slate-200/80 hover:bg-slate-100/70'
                  : 'bg-white border-slate-200/80 hover:border-slate-300')
          ]"
        >
          <!-- Compact Responsive Flex (Stacked on mobile, row on tablet/desktop) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <!-- Left Info Block: Time + Subject + Teacher -->
            <div class="min-w-0 flex-1 space-y-1">
              <!-- Row 1: Time, Sesi, Status Aktif / Akan Datang -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- 1. Jam Pelajaran (Mute bg on upcoming, tapi teks tetap tegas & jelas) -->
                <span
                  class="text-[11px] font-mono font-black px-2 py-0.5 rounded-lg shrink-0 inline-flex items-center gap-1"
                  :class="slot.isCurrent
                    ? 'bg-blue-600 text-white'
                    : (isSlotUpcoming(slot) ? 'bg-slate-200/80 text-slate-800' : 'bg-slate-100 text-slate-800 border border-slate-200/80')"
                >
                  <AdminIcon name="clock" size="11" class="opacity-80" />
                  <span>{{ slot.time }}</span>
                </span>

                <span class="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                  {{ slot.sessionNum }}
                </span>

                <span
                  v-if="slot.isCurrent"
                  class="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-md inline-block animate-pulse"
                >
                  ● Aktif
                </span>
                <span
                  v-else-if="isSlotUpcoming(slot)"
                  class="text-[9.5px] font-bold text-slate-500 bg-slate-200/60 border border-slate-300/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                >
                  Akan Datang
                </span>
              </div>

              <!-- 2. Mata Pelajaran (Tanpa kode mapel & tanpa ruang kelas agar query ringan) -->
              <h4 class="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {{ slot.subject }}
              </h4>

              <!-- 3. Guru Pengajar + Checklist Kehadiran Langsung (Tanpa NIP, lebih simple) -->
              <div class="flex items-center gap-1.5 text-xs text-slate-700 pt-0.5">
                <div
                  class="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
                  :class="avatarGradient(slot.teacher)"
                >
                  {{ initials(slot.teacher) }}
                </div>
                <span class="font-bold text-slate-800 text-[11.5px] truncate">{{ slot.teacher }}</span>

                <!-- Checklist Kehadiran Guru Langsung Setelah Nama Guru -->
                <span
                  v-if="slot.teacherAbsen"
                  class="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200/80 shrink-0"
                  title="Guru hadir mengajar"
                >
                  <AdminIcon name="check" size="11" />
                  <span>Hadir</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md shrink-0"
                  title="Guru belum absen"
                >
                  Belum Absen
                </span>
              </div>
            </div>

            <!-- Right Status & Action Buttons Block -->
            <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span
                v-if="slot.alpaStudents && slot.alpaStudents.length > 0"
                class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 mr-1"
              >
                {{ slot.alpaStudents.length }} Alpa
              </span>

              <!-- Action Buttons -->
              <div class="flex items-center gap-1.5 shrink-0">
                <!-- 5. Button Siswa Lengkap -->
                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  :class="slot.attendanceVerified && (!slot.alpaStudents || slot.alpaStudents.length === 0)
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90'"
                  title="Konfirmasi seluruh 34 siswa hadir lengkap di jam ini"
                  @click="confirmFullAttendance(slot)"
                >
                  <AdminIcon name="check" size="12" />
                  <span class="hidden sm:inline">Siswa Lengkap</span>
                  <span class="sm:hidden">Lengkap</span>
                </button>

                <!-- 6. Button Set Alpa -->
                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  :class="slot.alpaStudents && slot.alpaStudents.length > 0
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/90 hover:border-rose-200'"
                  title="Tandai siswa yang alpa / mangkir pada jam pelajaran ini"
                  @click="openSlotAttendanceModal(slot)"
                >
                  <AdminIcon name="alert" size="12" />
                  <span>Set Alpa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 5. SUB MENU: PENILAIAN SISWA (Template & Rumus Nilai)     -->
    <!-- ======================================================== -->
    <div v-else-if="activeSubmenu === 'penilaian'" class="space-y-4 animate-fadeUp">
      <!-- Notice & Download Template Excel -->
      <div class="bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border border-amber-200/80 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs flex-wrap">
        <div class="flex items-start gap-3 min-w-[280px] flex-1">
          <div class="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <AdminIcon name="spark" size="18" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-amber-950">Template Penilaian Akademik Rombel {{ classData.name }}</h4>
            <p class="text-xs text-slate-600 leading-relaxed mt-0.5">
              Format formula penilaian Kurikulum Merdeka (Tugas 20%, Penilaian Harian 25%, PTS 25%, PAS 30%). Dokumen rumus Excel terpadu sedang disiapkan.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            @click="exportGradesExcel"
          >
            <AdminIcon name="dl" size="14" />
            <span>Unduh Template Excel</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            @click="importGradesModal"
          >
            <AdminIcon name="upload" size="14" />
            <span>Impor Nilai Excel</span>
          </button>
        </div>
      </div>

      <!-- Filter Mata Pelajaran -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-500">Mata Pelajaran:</span>
          <select
            v-model="selectedSubjectGrade"
            class="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-xs cursor-pointer min-h-[38px]"
          >
            <option value="Semua">Semua Mata Pelajaran (Rata-rata)</option>
            <option value="PAI">Pendidikan Agama Islam (PAI)</option>
            <option value="MAT">Matematika Terapan</option>
            <option value="BIN">Bahasa Indonesia</option>
            <option value="BIG">Bahasa Inggris Terpadu</option>
            <option value="PROG">Informatika / Pemrograman Kejuruan</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500">
          Standar KKM Rombel: <span class="font-mono text-blue-600 font-bold">75.0</span>
        </div>
      </div>

      <!-- Table Template Penilaian -->
      <div class="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-4 w-12 text-center">No</th>
                <th class="py-3.5 px-4">NISN</th>
                <th class="py-3.5 px-4">Nama Siswa</th>
                <th class="py-3.5 px-4 font-mono text-center">Tugas (20%)</th>
                <th class="py-3.5 px-4 font-mono text-center">PH (25%)</th>
                <th class="py-3.5 px-4 font-mono text-center">PTS (25%)</th>
                <th class="py-3.5 px-4 font-mono text-center">PAS (30%)</th>
                <th class="py-3.5 px-4 font-mono text-center">Nilai Akhir</th>
                <th class="py-3.5 px-4 text-center">Predikat</th>
                <th class="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(stu, idx) in studentList.slice(0, 12)" :key="stu.nisn" class="hover:bg-slate-50/60">
                <td class="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4 font-mono font-bold text-slate-700">{{ stu.nisn }}</td>
                <td class="py-3.5 px-4 font-bold text-slate-900">{{ stu.name }}</td>
                <td class="py-3.5 px-4 font-mono text-center font-bold text-slate-800">85</td>
                <td class="py-3.5 px-4 font-mono text-center font-bold text-slate-800">82</td>
                <td class="py-3.5 px-4 font-mono text-center font-bold text-slate-800">86</td>
                <td class="py-3.5 px-4 font-mono text-center font-bold text-slate-800">88</td>
                <td class="py-3.5 px-4 font-mono font-bold text-center text-blue-600 text-sm">{{ stu.avgScore }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                    {{ stu.avgScore >= 85 ? 'A' : 'B' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tuntas
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 6. SUB MENU: JADWAL UJIAN (Harian / PTS / PAS)           -->
    <!-- ======================================================== -->
    <div v-else-if="activeSubmenu === 'ujian'" class="space-y-4 animate-fadeUp">
      <!-- Filter Period & Sub-Kategori Ujian -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <!-- Sub-menu Kategori: Ujian Harian / PTS / PAS -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">Kategori Ujian:</span>
          <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              v-for="cat in ['Semua', 'Ujian Harian', 'Ujian Tengah Semester', 'Ujian Akhir']"
              :key="cat"
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="examCategory === cat ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              @click="examCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Filter Periode: Harian, Mingguan, Bulanan -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">Rentang Waktu:</span>
          <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              v-for="p in ['Harian', 'Mingguan', 'Bulanan']"
              :key="p"
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="examPeriod === p ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              @click="examPeriod = p"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>

      <!-- Exam Cards / Timetable List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="ex in filteredExams"
          :key="ex.title"
          class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3.5"
        >
          <div>
            <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <span class="text-[10.5px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                {{ ex.code }}
              </span>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                :class="ex.category === 'Ujian Harian'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : (ex.category === 'Ujian Tengah Semester' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200')"
              >
                {{ ex.category }}
              </span>
            </div>

            <div class="pt-2">
              <b class="text-sm font-bold text-slate-900 block truncate">{{ ex.title }}</b>
              <p class="text-xs text-slate-500 mt-1">Pengawas: {{ ex.supervisor }} &bull; Sifat: {{ ex.method }}</p>
              <div class="flex items-center gap-2 mt-2 text-xs font-bold text-slate-700">
                <AdminIcon name="clock" size="14" class="text-slate-400" />
                <span>{{ ex.schedule }}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {{ ex.status }}
            </span>
            <NuxtLink
              to="/admin/cbt"
              class="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>Buka CBT</span>
              <span>›</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 1: PINDAH KELAS / UBAH KELAS SISWA                 -->
    <!-- ======================================================== -->
    <div
      v-if="showMoveModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-riseIn">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Ubah Rombel / Pindahkan Siswa</h3>
            <p class="text-xs text-slate-500 mt-0.5">Memindahkan siswa dari rombel {{ classData.name }}</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-slate-700 text-sm font-bold" @click="showMoveModal = false">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Siswa</label>
            <input
              :value="selectedStudentForMove ? `${selectedStudentForMove.name} (${selectedStudentForMove.nisn})` : 'Semua Siswa Terpilih'"
              disabled
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Rombel Kelas Tujuan</label>
            <select
              v-model="targetClassMove"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-blue-600"
            >
              <option v-for="c in targetClassOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Alasan Perpindahan</label>
            <textarea
              v-model="moveReason"
              rows="2"
              placeholder="Contoh: Penyesuaian peminatan / kapasitas rombel..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600 text-slate-800"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            @click="showMoveModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            @click="submitMoveClass"
          >
            Konfirmasi Pindah
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: UPDATE ABSENSI SISWA PER JAM PELAJARAN (SET ALPA) -->
    <!-- ======================================================== -->
    <div
      v-if="showSlotModal && activeSlot"
      class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto bg-slate-950/65 backdrop-blur-sm animate-fadeIn"
      @click.self="showSlotModal = false"
    >
      <div class="relative w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/30 border border-slate-200/90 max-w-lg sm:max-w-xl max-h-[90vh] sm:max-h-[86vh] flex flex-col overflow-hidden my-auto animate-riseIn">
        <!-- Modal Header (Sesuai Standar Popup Lainnya) -->
        <header class="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
          <div class="min-w-0 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0 shadow-2xs">
              <AdminIcon name="cal" size="18" />
            </div>
            <div class="min-w-0">
              <h3 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug truncate">
                Presensi: {{ activeSlot.subject }}
              </h3>
              <p class="text-xs text-slate-500 font-medium truncate mt-0.5">
                {{ activeSlot.time }} &bull; {{ activeSlot.teacher }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer text-sm font-bold"
            @click="showSlotModal = false"
          >
            ✕
          </button>
        </header>

        <!-- Modal Body -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-white">
          <!-- Petunjuk Singkat -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-600 flex items-center justify-between gap-2">
            <span>Tandai siswa yang alpa/meninggalkan kelas pada jam ini.</span>
            <button
              type="button"
              class="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
              @click="markAllModalStudentsHadir"
            >
              Set Semua Hadir
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <AdminIcon name="search" size="15" class="absolute left-3 top-3 text-slate-400" />
            <input
              v-model="searchModalStudent"
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-600 outline-none bg-white"
            />
          </div>

          <!-- Filter Status Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              v-for="st in (['Semua', 'Alpa', 'Izin', 'Sakit', 'Hadir'] as const)"
              :key="st"
              type="button"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border"
              :class="filterModalStatus === st
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
              @click="filterModalStatus = st"
            >
              {{ st }}
              <span v-if="st === 'Alpa' && countModalStatus.alpa > 0" class="ml-1 px-1 rounded-full bg-rose-500 text-white text-[9px]">
                {{ countModalStatus.alpa }}
              </span>
            </button>
          </div>

          <!-- Student Attendance List -->
          <div class="space-y-1.5 pr-0.5 divide-y divide-slate-100 text-xs">
            <div
              v-for="stu in filteredModalStudents"
              :key="stu.nisn"
              class="pt-2 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
            >
              <div class="min-w-0 flex items-center gap-2.5">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-2xs"
                  :class="avatarGradient(stu.name)"
                >
                  {{ initials(stu.name) }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <b class="text-xs font-bold text-slate-900 truncate">{{ stu.name }}</b>
                    <span class="text-[9.5px] font-mono px-1 rounded bg-slate-100 text-slate-500 font-bold">
                      {{ stu.gender === 'L' ? 'L' : 'P' }}
                    </span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400 block">{{ stu.nisn }}</span>
                </div>
              </div>

              <!-- Segmented Status Buttons -->
              <div class="flex items-center gap-1 self-end sm:self-auto shrink-0 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                  :class="stu.status === 'Hadir' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
                  @click="setStudentStatus(stu, 'Hadir')"
                >
                  Hadir
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                  :class="stu.status === 'Alpa' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'"
                  @click="setStudentStatus(stu, 'Alpa')"
                >
                  Alpa
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                  :class="stu.status === 'Izin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'"
                  @click="setStudentStatus(stu, 'Izin')"
                >
                  Izin
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                  :class="stu.status === 'Sakit' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-600'"
                  @click="setStudentStatus(stu, 'Sakit')"
                >
                  Sakit
                </button>
              </div>
            </div>

            <div v-if="filteredModalStudents.length === 0" class="py-8 text-center text-slate-400 font-medium text-xs">
              Tidak ada siswa yang sesuai pencarian.
            </div>
          </div>
        </div>

        <!-- Modal Footer (Sesuai Standar Popup Lainnya) -->
        <footer class="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div class="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-600">
            <span class="text-emerald-700">{{ countModalStatus.hadir }} Hadir</span>
            <span class="text-slate-300">&bull;</span>
            <span class="text-rose-600">{{ countModalStatus.alpa }} Alpa</span>
            <span class="text-slate-300">&bull;</span>
            <span class="text-blue-600">{{ countModalStatus.izin }} Izin</span>
            <span class="text-slate-300">&bull;</span>
            <span class="text-amber-600">{{ countModalStatus.sakit }} Sakit</span>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              @click="showSlotModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
              @click="submitSlotAttendance"
            >
              Simpan Presensi
            </button>
          </div>
        </footer>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- FLOATING TOAST FEEDBACK NOTIFICATION                     -->
    <!-- ======================================================== -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-3 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-3 opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 text-xs font-bold"
      >
        <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <AdminIcon name="check" size="14" />
        </div>
        <span class="flex-1 leading-snug">{{ toastMessage }}</span>
        <button
          type="button"
          class="text-slate-400 hover:text-white ml-2 text-sm font-bold cursor-pointer"
          @click="toastMessage = ''"
        >
          ✕
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminIcon from '~/components/admin/AdminIcon.vue'

definePageMeta({ layout: 'admin', name: 'admin-kelas-detail' })

const route = useRoute()

const classIdParam = computed(() => {
  const p = route.params.id
  return Array.isArray(p) ? p[0] : (p || 'IX-A')
})

interface ClassRombel {
  name: string
  level: 'SMP' | 'SMK'
  major: string
  room: string
  teacher: string
  teacherNip: string
  students: number
  boys: number
  girls: number
  attendance: number
  average: number
}

// Master Raw Class List
const defaultClasses: ClassRombel[] = [
  { name: 'VII-A', level: 'SMP', major: '', room: 'Gedung A · R.101', teacher: 'Siti Aminah, S.Pd', teacherNip: '198204152008012003', students: 34, boys: 18, girls: 16, attendance: 94, average: 84.2 },
  { name: 'VII-B', level: 'SMP', major: '', room: 'Gedung A · R.102', teacher: 'Rini Astuti, S.Pd', teacherNip: '199105102019032005', students: 36, boys: 19, girls: 17, attendance: 91, average: 82.8 },
  { name: 'VIII-A', level: 'SMP', major: '', room: 'Gedung A · R.201', teacher: 'Ahmad Fauzi, S.Pd', teacherNip: '198703122011011002', students: 35, boys: 18, girls: 17, attendance: 95, average: 85.1 },
  { name: 'VIII-B', level: 'SMP', major: '', room: 'Gedung A · R.202', teacher: 'Nurul Hidayati, S.Si', teacherNip: '198807142012012002', students: 35, boys: 17, girls: 18, attendance: 89, average: 81.5 },
  { name: 'IX-A', level: 'SMP', major: '', room: 'Gedung A · R.301', teacher: 'Drs. H. Ahmad Dahlan', teacherNip: '197508122000031001', students: 34, boys: 16, girls: 18, attendance: 96, average: 86.4 },
  { name: 'IX-B', level: 'SMP', major: '', room: 'Gedung A · R.302', teacher: 'Dewi Lestari, S.Pd', teacherNip: '199402182020122008', students: 36, boys: 20, girls: 16, attendance: 92, average: 83.7 },
  { name: 'X RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B · Lab 1', teacher: 'Bambang Supriyanto, M.Kom', teacherNip: '198901202015041002', students: 36, boys: 24, girls: 12, attendance: 94, average: 85.5 },
  { name: 'X RPL 2', level: 'SMK', major: 'RPL', room: 'Gedung B · Lab 2', teacher: 'Eko Prasetyo, S.Pd', teacherNip: '199009252016081003', students: 35, boys: 22, girls: 13, attendance: 90, average: 83.2 },
  { name: 'XI RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B · Lab 3', teacher: 'Hendra Gunawan, S.Kom', teacherNip: '198711032014021004', students: 34, boys: 23, girls: 11, attendance: 95, average: 86.9 },
  { name: 'XI TKJ 1', level: 'SMK', major: 'TKJ', room: 'Gedung B · Lab Jaringan', teacher: 'Rizky Wahyudi, S.T', teacherNip: '199208152018011003', students: 36, boys: 27, girls: 9, attendance: 93, average: 84.6 },
  { name: 'XII RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B · R.301', teacher: 'Fajar Nugroho, S.Pd', teacherNip: '199304122021011005', students: 35, boys: 22, girls: 13, attendance: 97, average: 88.3 },
  { name: 'XII TKJ 1', level: 'SMK', major: 'TKJ', room: 'Gedung B · R.302', teacher: 'Agus Setiawan, S.T', teacherNip: '198605202014031002', students: 34, boys: 26, girls: 8, attendance: 94, average: 85.8 }
]

const classData = computed<ClassRombel>(() => {
  const decoded = decodeURIComponent(classIdParam.value)
  const found = defaultClasses.find(c => c.name.toLowerCase() === decoded.toLowerCase())
  if (found) return found

  return {
    name: decoded,
    level: decoded.includes('SMP') || decoded.startsWith('VII') || decoded.startsWith('VIII') || decoded.startsWith('IX') ? 'SMP' : 'SMK',
    major: decoded.includes('RPL') ? 'RPL' : (decoded.includes('TKJ') ? 'TKJ' : ''),
    room: 'Gedung A · Ruang Kelas',
    teacher: 'Wali Kelas Terdaftar',
    teacherNip: '198501012010011001',
    students: 34,
    boys: 17,
    girls: 17,
    attendance: 95,
    average: 85.0
  }
})

const schoolName = computed(() => {
  return classData.value.level === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

useHead({
  title: computed(() => `Detail Rombel ${classData.value.name} | Admin Portal`)
})

// Submenus definition (Sesuai docs/Admin Portal/manajemen kelas/kelasdetail.md)
type SubMenuKey = 'overview' | 'siswa' | 'absensi' | 'jadwal' | 'penilaian' | 'ujian'
const activeSubmenu = ref<SubMenuKey>('overview')

const submenus = computed(() => [
  { id: 'overview' as SubMenuKey, label: 'Overview', icon: 'grid' },
  { id: 'siswa' as SubMenuKey, label: 'Data Siswa', icon: 'users', count: classData.value.students },
  { id: 'absensi' as SubMenuKey, label: 'Absensi', icon: 'ucheck' },
  { id: 'jadwal' as SubMenuKey, label: 'Jadwal Pelajaran', icon: 'cal' },
  { id: 'penilaian' as SubMenuKey, label: 'Penilaian Siswa', icon: 'spark' },
  { id: 'ujian' as SubMenuKey, label: 'Jadwal Ujian', icon: 'file' }
])

// 1. Overview State
const overviewPeriod = ref('Harian')
const todaySessions = [
  { time: '07:15 - 08:00', subject: 'Pembinaan IMTAQ & Sholat Dhuha', teacher: 'Ust. M. Rizky, Lc', room: 'Masjid', isCurrent: false, teacherAbsen: true },
  { time: '08:00 - 09:30', subject: 'Matematika Terapan', teacher: 'Aisyah Putri, M.Pd', room: 'R.301', isCurrent: true, teacherAbsen: true },
  { time: '09:45 - 11:15', subject: 'Bahasa Indonesia', teacher: 'Rina Kurniawati, S.Pd', room: 'R.301', isCurrent: false, teacherAbsen: false },
  { time: '11:15 - 12:45', subject: 'Pendidikan Agama Islam (PAI)', teacher: 'Ust. H. Ahmad Fauzi, S.Pd.I', room: 'R.301', isCurrent: false, teacherAbsen: false }
]

const upcomingEvents = [
  { title: 'Kuis Harian Informatika & Coding', badge: 'Ujian Harian', date: 'Hari Ini, 10:00 WIB', desc: 'Materi Algoritma & Struktur Data', type: 'ujian' },
  { title: 'Bimbingan Konseling & Motivasi Belajar', badge: 'Kegiatan', date: 'Besok, 08:00 WIB', desc: 'Bersama Wali Kelas & Guru BK', type: 'kegiatan' },
  { title: 'Persiapan Penilaian Tengah Semester (PTS)', badge: 'Ujian', date: 'Senin Depan', desc: 'Ujian CBT Terpadu', type: 'ujian' }
]

// 2. Data Siswa State & Actions
const filterGender = ref('Semua')
const searchStudentQuery = ref('')

const sampleFirstNamesMale = ['Muhammad', 'Fauzan', 'Rizky', 'Dimas', 'Aditya', 'Farhan', 'Zaky', 'Ilham', 'Bagas', 'Rayhan', 'Fathir', 'Danang', 'Hafizh', 'Naufal', 'Irfan', 'Fikri', 'Galih', 'Yoga', 'Alif', 'Aldi']
const sampleFirstNamesFemale = ['Aisyah', 'Nabila', 'Zahra', 'Salma', 'Putri', 'Siti', 'Syifa', 'Hana', 'Tiara', 'Annisa', 'Fatimah', 'Dina', 'Kayla', 'Nayra', 'Rania', 'Mutia', 'Keysha', 'Alia']
const sampleLastNames = ['Pratama', 'Hidayat', 'Ramadhan', 'Kurniawan', 'Santoso', 'Nugraha', 'Setiawan', 'Firmansyah', 'Wahyudi', 'Syahputra', 'Saputra', 'Putra', 'Maulana', 'Aziz', 'Rahmatullah']

const studentList = computed(() => {
  const list = []
  const boysCount = classData.value.boys
  const girlsCount = classData.value.girls

  for (let i = 1; i <= boysCount; i++) {
    const f = sampleFirstNamesMale[(i - 1) % sampleFirstNamesMale.length]
    const l = sampleLastNames[(i * 3) % sampleLastNames.length]
    const nisn = `00${70000000 + i * 143}`.slice(0, 10)
    list.push({
      nisn,
      name: `${f} ${l}`,
      gender: 'L' as const,
      attendanceRate: 92 + (i % 8),
      avgScore: +(80 + (i % 15) * 1.1).toFixed(1),
      todayStatus: i === 3 ? 'Sakit' : 'Hadir'
    })
  }

  for (let j = 1; j <= girlsCount; j++) {
    const f = sampleFirstNamesFemale[(j - 1) % sampleFirstNamesFemale.length]
    const l = sampleLastNames[(j * 5) % sampleLastNames.length]
    const nisn = `00${80000000 + j * 167}`.slice(0, 10)
    list.push({
      nisn,
      name: `${f} ${l}`,
      gender: 'P' as const,
      attendanceRate: 94 + (j % 6),
      avgScore: +(82 + (j % 14) * 1.1).toFixed(1),
      todayStatus: j === 2 ? 'Izin' : 'Hadir'
    })
  }

  return list.sort((a, b) => a.name.localeCompare(b.name))
})

const filteredStudents = computed(() => {
  return studentList.value.filter(s => {
    if (filterGender.value !== 'Semua' && s.gender !== filterGender.value) return false
    if (searchStudentQuery.value) {
      const q = searchStudentQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    }
    return true
  })
})

// Modal Move Class
const showMoveModal = ref(false)
const selectedStudentForMove = ref<any>(null)
const targetClassMove = ref('IX-B')
const moveReason = ref('')
const targetClassOptions = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', 'X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1']

const openMoveClassModal = (stu: any) => {
  selectedStudentForMove.value = stu
  targetClassMove.value = classData.value.name === 'IX-A' ? 'IX-B' : 'IX-A'
  showMoveModal.value = true
}

const submitMoveClass = () => {
  alert(`Siswa ${selectedStudentForMove.value ? selectedStudentForMove.value.name : 'terpilih'} berhasil dipindahkan ke rombel ${targetClassMove.value}.`)
  showMoveModal.value = false
}

const softDeleteStudent = (stu: any) => {
  if (confirm(`Hapus (soft delete) siswa ${stu.name} dari rombel ini? Hanya superadmin yang dapat memulihkan.`)) {
    alert(`Siswa ${stu.name} berhasil diarsipkan.`)
  }
}

// 3. Absensi State
const attendancePeriod = ref('Harian')

// 4. Jadwal Pelajaran (Sub Menu Per Hari & Presensi Lengkap)
const scheduleDays = [
  { key: 'Senin', label: 'Senin', date: 'Senin, 20 Okt' },
  { key: 'Selasa', label: 'Selasa', date: 'Selasa, 21 Okt' },
  { key: 'Rabu', label: 'Rabu', date: 'Rabu, 22 Okt' },
  { key: 'Kamis', label: 'Kamis', date: 'Kamis, 23 Okt' },
  { key: 'Jumat', label: "Jum'at", date: "Jum'at, 24 Okt" }
]

const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const realTodayDayName = computed(() => {
  const idx = new Date().getDay()
  return dayNamesIndo[idx] || 'Senin'
})

// Sub menu perhari yang aktif secara default adalah HARI INI
const selectedScheduleDay = ref(
  ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(realTodayDayName.value)
    ? realTodayDayName.value
    : 'Senin'
)

const prevScheduleDay = () => {
  const dayKeys = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  const curIdx = dayKeys.indexOf(selectedScheduleDay.value)
  selectedScheduleDay.value = curIdx > 0 ? dayKeys[curIdx - 1] : dayKeys[dayKeys.length - 1]
}

const nextScheduleDay = () => {
  const dayKeys = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  const curIdx = dayKeys.indexOf(selectedScheduleDay.value)
  selectedScheduleDay.value = curIdx < dayKeys.length - 1 ? dayKeys[curIdx + 1] : dayKeys[0]
}

interface ScheduleSlotItem {
  id: string
  sessionNum: string
  time: string
  subject: string
  code: string
  teacher: string
  teacherNip: string
  room: string
  teacherAbsen: boolean
  teacherAbsenTime: string
  isCurrent?: boolean
  isUpcoming?: boolean
  attendanceVerified?: boolean
  attendanceSummary?: string
  alpaStudents?: string[]
}

const weeklySchedule = ref<Record<string, ScheduleSlotItem[]>>({
  Senin: [
    {
      id: 'SEN-01',
      sessionNum: 'Sesi 1 (45 Menit)',
      time: '07:15 - 08:00 WIB',
      subject: 'Upacara Bendera & Pembinaan IMTAQ',
      code: 'UPC-01',
      teacher: 'Tim Kesiswaan & Pembina OSIS',
      teacherNip: 'NIP 198005122005011002',
      room: 'Lapangan Upacara Utama',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:05 WIB (Tap RFID Pengajar)',
      isCurrent: false,
      isUpcoming: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'SEN-02',
      sessionNum: 'Sesi 2 & 3 (90 Menit)',
      time: '08:00 - 09:30 WIB',
      subject: 'Pendidikan Agama Islam (PAI) & Akhlak',
      code: 'PAI-09',
      teacher: 'Ust. H. Ahmad Fauzi, S.Pd.I',
      teacherNip: 'NIP 198204122010011004',
      room: 'R.301 Gedung A',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:54 WIB (Tap RFID Kelas)',
      isCurrent: true,
      isUpcoming: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'SEN-03',
      sessionNum: 'Sesi 4 & 5 (90 Menit)',
      time: '09:45 - 11:15 WIB',
      subject: 'Matematika Terapan',
      code: 'MAT-09',
      teacher: 'Aisyah Putri, M.Pd',
      teacherNip: 'NIP 198807152014022003',
      room: 'R.301 Gedung A',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 09:40 WIB (Tap RFID Kelas)',
      isCurrent: false,
      isUpcoming: true,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Verifikasi Presensi',
      alpaStudents: []
    },
    {
      id: 'SEN-04',
      sessionNum: 'Sesi 6 & 7 (90 Menit)',
      time: '11:15 - 12:45 WIB',
      subject: 'Bahasa Indonesia',
      code: 'BIN-09',
      teacher: 'Rina Kurniawati, S.Pd',
      teacherNip: 'NIP 199105202016032005',
      room: 'R.301 Gedung A',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      isUpcoming: true,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    },
    {
      id: 'SEN-05',
      sessionNum: 'Sesi 8 & 9 (90 Menit)',
      time: '13:15 - 14:45 WIB',
      subject: 'Seni Budaya & Keterampilan Terapan',
      code: 'SBD-09',
      teacher: 'Nurul Hidayati, S.Sn',
      teacherNip: 'NIP 199302112019022008',
      room: 'Studio Seni & Kreativitas',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      isUpcoming: true,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    }
  ],
  Selasa: [
    {
      id: 'SEL-01',
      sessionNum: 'Sesi 1 (45 Menit)',
      time: '07:15 - 08:00 WIB',
      subject: 'Sholat Dhuha & Tahsin Al-Qur\'an',
      code: 'THS-01',
      teacher: 'Ust. M. Rizky, Lc',
      teacherNip: 'NIP 198906242015031002',
      room: 'Masjid Attaqwa',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:10 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'SEL-02',
      sessionNum: 'Sesi 2, 3 & 4 (135 Menit)',
      time: '08:00 - 10:15 WIB',
      subject: classData.value.level === 'SMK' ? 'Pemrograman Dasar & Web Framework' : 'Ilmu Pengetahuan Alam (IPA Terpadu)',
      code: classData.value.level === 'SMK' ? 'RPL-02' : 'IPA-09',
      teacher: classData.value.level === 'SMK' ? 'Dedi Prasetyo, S.Kom' : 'Dr. Irfan Hakim, M.Si',
      teacherNip: 'NIP 198511122009021003',
      room: classData.value.level === 'SMK' ? 'Lab Komputer 2' : 'Lab IPA & Sains',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:56 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'SEL-03',
      sessionNum: 'Sesi 5 & 6 (90 Menit)',
      time: '10:30 - 12:00 WIB',
      subject: 'Bahasa Inggris Terpadu (Conversation)',
      code: 'BIG-09',
      teacher: 'Farhan Maulana, S.Pd',
      teacherNip: 'NIP 199010182015041001',
      room: 'R.301 Gedung A',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    },
    {
      id: 'SEL-04',
      sessionNum: 'Sesi 7 & 8 (90 Menit)',
      time: '13:00 - 14:30 WIB',
      subject: 'Informatika & Literasi Digital',
      code: 'INF-09',
      teacher: 'Hendra Gunawan, M.Kom',
      teacherNip: 'NIP 198603092011011003',
      room: 'Lab Komputer 1',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    }
  ],
  Rabu: [
    {
      id: 'RAB-01',
      sessionNum: 'Sesi 1 (45 Menit)',
      time: '07:15 - 08:00 WIB',
      subject: 'Kultum Pagi & Literasi Numerasi',
      code: 'LIT-01',
      teacher: classData.value.teacher,
      teacherNip: classData.value.teacherNip || 'NIP 198603092011011003',
      room: 'R.301 Gedung A',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:11 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'RAB-02',
      sessionNum: 'Sesi 2, 3 & 4 (135 Menit)',
      time: '08:00 - 10:15 WIB',
      subject: classData.value.level === 'SMK' ? 'Basis Data Lanjutan & SQL Engine' : 'Ilmu Pengetahuan Sosial (IPS Terpadu)',
      code: classData.value.level === 'SMK' ? 'BDT-02' : 'IPS-09',
      teacher: classData.value.level === 'SMK' ? 'Siti Rahmawati, S.Kom' : 'Dra. Sri Wahyuni, M.Pd',
      teacherNip: 'NIP 198708142011022004',
      room: classData.value.level === 'SMK' ? 'Lab Komputer 3' : 'R.301 Gedung A',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:55 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'RAB-03',
      sessionNum: 'Sesi 5 & 6 (90 Menit)',
      time: '10:30 - 12:00 WIB',
      subject: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
      code: 'PKN-09',
      teacher: 'Dra. Hj. Maryam, M.Pd',
      teacherNip: 'NIP 197801052003122002',
      room: 'R.301 Gedung A',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    },
    {
      id: 'RAB-04',
      sessionNum: 'Sesi 7 & 8 (90 Menit)',
      time: '13:00 - 14:30 WIB',
      subject: 'Bimbingan Konseling & Karir Terpadu',
      code: 'BK-01',
      teacher: 'Drs. Bambang Sudiro, M.Pd',
      teacherNip: 'NIP 197608142002121001',
      room: 'Ruang BK / R.301',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    }
  ],
  Kamis: [
    {
      id: 'KAM-01',
      sessionNum: 'Sesi 1 (45 Menit)',
      time: '07:15 - 08:00 WIB',
      subject: 'Sholat Dhuha & Dzikir Pagi Al-Ma\'tsurat',
      code: 'DZK-01',
      teacher: 'Ust. Syamsul Huda, S.Q',
      teacherNip: 'NIP 198509172012011005',
      room: 'Masjid Attaqwa',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:08 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'KAM-02',
      sessionNum: 'Sesi 2, 3 & 4 (135 Menit)',
      time: '08:00 - 10:15 WIB',
      subject: classData.value.level === 'SMK' ? 'Praktikum Rekayasa Perangkat Lunak' : 'Matematika Terapan (Pendalaman)',
      code: classData.value.level === 'SMK' ? 'RPL-03' : 'MAT-09B',
      teacher: classData.value.level === 'SMK' ? 'Hendra Gunawan, M.Kom' : 'Aisyah Putri, M.Pd',
      teacherNip: 'NIP 198603092011011003',
      room: classData.value.level === 'SMK' ? 'Lab Komputer 1' : 'R.301 Gedung A',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    },
    {
      id: 'KAM-03',
      sessionNum: 'Sesi 5 & 6 (90 Menit)',
      time: '10:30 - 12:00 WIB',
      subject: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)',
      code: 'PJK-09',
      teacher: 'Budi Santoso, S.Pd',
      teacherNip: 'NIP 198711202012031002',
      room: 'Lapangan Olahraga Utama',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    },
    {
      id: 'KAM-04',
      sessionNum: 'Sesi 7 & 8 (90 Menit)',
      time: '13:00 - 14:30 WIB',
      subject: 'Projek Penguatan Profil Pelajar Pancasila (P5)',
      code: 'P5-01',
      teacher: 'Tim Fasilitator P5 & Wali Kelas',
      teacherNip: 'Tim Kurikulum Merdeka',
      room: 'Aula Serbaguna',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    }
  ],
  Jumat: [
    {
      id: 'JUM-01',
      sessionNum: 'Sesi 1 (60 Menit)',
      time: '07:15 - 08:15 WIB',
      subject: 'Kajian IMTAQ Pagi & Sholat Dhuha Berjamaah',
      code: 'IMT-01',
      teacher: 'Dewan Asatidz Attaqwa 9',
      teacherNip: 'Tim IMTAQ Sekolah',
      room: 'Masjid Utama Attaqwa',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 07:10 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'JUM-02',
      sessionNum: 'Sesi 2 & 3 (75 Menit)',
      time: '08:15 - 09:30 WIB',
      subject: 'Tahfidz Al-Qur\'an & Setoran Mutaba\'ah Hafalan',
      code: 'TFZ-01',
      teacher: 'Ust. M. Rizky, Lc & Tim Tahfidz',
      teacherNip: 'NIP 198906242015031002',
      room: 'R.301 Gedung A',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 08:10 WIB (Tap RFID)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    },
    {
      id: 'JUM-03',
      sessionNum: 'Sesi 4 (60 Menit)',
      time: '09:45 - 10:45 WIB',
      subject: 'Bimbingan Wali Kelas & Evaluasi Pekanan',
      code: 'BWK-01',
      teacher: classData.value.teacher,
      teacherNip: classData.value.teacherNip || 'NIP 198603092011011003',
      room: 'R.301 Gedung A',
      teacherAbsen: false,
      teacherAbsenTime: 'Belum Absen Masuk (Menunggu Jadwal)',
      isCurrent: false,
      attendanceVerified: false,
      attendanceSummary: 'Menunggu Jam Pelajaran',
      alpaStudents: []
    },
    {
      id: 'JUM-04',
      sessionNum: 'Sesi Khusus (90 Menit)',
      time: '11:15 - 12:45 WIB',
      subject: 'Persiapan & Sholat Jum\'at Berjamaah',
      code: 'JMT-01',
      teacher: 'DKM Masjid Sekolah & Sivitas',
      teacherNip: 'Koordinator DKM',
      room: 'Masjid Jami\' Attaqwa',
      teacherAbsen: true,
      teacherAbsenTime: 'Absen Masuk: 11:15 WIB (Terkoordinasi)',
      isCurrent: false,
      attendanceVerified: true,
      attendanceSummary: '34/34 Siswa Hadir Lengkap',
      alpaStudents: []
    }
  ]
})

const currentDaySlots = computed(() => {
  return weeklySchedule.value[selectedScheduleDay.value] || []
})

const isSlotUpcoming = (slot: ScheduleSlotItem) => {
  if (slot.isCurrent) return false
  if (slot.isUpcoming !== undefined) return slot.isUpcoming
  return !slot.attendanceVerified
}

const countTeacherPresent = computed(() => {
  return currentDaySlots.value.filter(s => s.teacherAbsen).length
})

// Toast Feedback Notification
const toastMessage = ref('')
let toastTimer: any = null
const showToast = (msg: string) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 4500)
}

// 5. Action "Siswa Lengkap" (Konfirmasi Instan Kehadiran Siswa Penuh)
const confirmFullAttendance = (slot: ScheduleSlotItem) => {
  slot.attendanceVerified = true
  slot.isUpcoming = false
  slot.alpaStudents = []
  slot.attendanceSummary = '34/34 Siswa Hadir Lengkap'
  showToast(`Presensi Terverifikasi: Seluruh siswa (34 siswa) hadir lengkap pada mata pelajaran ${slot.subject} (${slot.time}).`)
}

// 6. Action "Set Alpa" & Modal Presensi Khusus Jam Pelajaran
const showSlotModal = ref(false)
const activeSlot = ref<ScheduleSlotItem | null>(null)
const searchModalStudent = ref('')
const filterModalStatus = ref<'Semua' | 'Hadir' | 'Alpa' | 'Izin' | 'Sakit'>('Semua')

interface ModalStudentRecord {
  nisn: string
  name: string
  gender: 'L' | 'P'
  status: 'Hadir' | 'Alpa' | 'Izin' | 'Sakit'
}

const modalStudentRecords = ref<ModalStudentRecord[]>([])

const openSlotAttendanceModal = (slot: ScheduleSlotItem) => {
  activeSlot.value = slot
  searchModalStudent.value = ''
  filterModalStatus.value = 'Semua'

  // Siapkan data 34 siswa untuk sesi pelajaran ini
  const records: ModalStudentRecord[] = studentList.value.map(stu => {
    const isAlpa = slot.alpaStudents && slot.alpaStudents.includes(stu.name)
    return {
      nisn: stu.nisn,
      name: stu.name,
      gender: stu.gender,
      status: isAlpa ? 'Alpa' : 'Hadir'
    }
  })
  modalStudentRecords.value = records
  showSlotModal.value = true
}

const filteredModalStudents = computed(() => {
  return modalStudentRecords.value.filter(s => {
    if (filterModalStatus.value !== 'Semua' && s.status !== filterModalStatus.value) return false
    if (searchModalStudent.value) {
      const q = searchModalStudent.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    }
    return true
  })
})

const countModalStatus = computed(() => {
  const hadir = modalStudentRecords.value.filter(s => s.status === 'Hadir').length
  const alpa = modalStudentRecords.value.filter(s => s.status === 'Alpa').length
  const izin = modalStudentRecords.value.filter(s => s.status === 'Izin').length
  const sakit = modalStudentRecords.value.filter(s => s.status === 'Sakit').length
  return { hadir, alpa, izin, sakit }
})

const setStudentStatus = (stu: ModalStudentRecord, status: 'Hadir' | 'Alpa' | 'Izin' | 'Sakit') => {
  stu.status = status
}

const markAllModalStudentsHadir = () => {
  modalStudentRecords.value.forEach(s => { s.status = 'Hadir' })
}

const submitSlotAttendance = () => {
  if (!activeSlot.value) return
  const alpaList = modalStudentRecords.value.filter(s => s.status === 'Alpa').map(s => s.name)
  const izinList = modalStudentRecords.value.filter(s => s.status === 'Izin').map(s => s.name)
  const sakitList = modalStudentRecords.value.filter(s => s.status === 'Sakit').map(s => s.name)

  activeSlot.value.alpaStudents = alpaList
  activeSlot.value.isUpcoming = false

  if (alpaList.length > 0) {
    activeSlot.value.attendanceVerified = false
    activeSlot.value.attendanceSummary = `${alpaList.length} Siswa Alpa (${alpaList.join(', ')})`
    showToast(`Presensi tersimpan: ${alpaList.length} siswa tercatat alpa/mangkir pada jam ${activeSlot.value.subject}.`)
  } else if (izinList.length > 0 || sakitList.length > 0) {
    activeSlot.value.attendanceVerified = true
    activeSlot.value.attendanceSummary = `34 Siswa (0 Alpa, ${izinList.length} Izin, ${sakitList.length} Sakit)`
    showToast(`Presensi tersimpan: 0 siswa alpa (terpantau izin/sakit) pada jam ${activeSlot.value.subject}.`)
  } else {
    activeSlot.value.attendanceVerified = true
    activeSlot.value.attendanceSummary = '34/34 Siswa Hadir Lengkap'
    showToast(`Presensi tersimpan: Seluruh siswa (34 siswa) hadir lengkap di jam ${activeSlot.value.subject}.`)
  }

  showSlotModal.value = false
}

// 5. Penilaian Siswa State
const selectedSubjectGrade = ref('Semua')

const exportGradesExcel = () => {
  alert(`Template Excel Nilai untuk rombel ${classData.value.name} berhasil diunduh.`)
}

const importGradesModal = () => {
  alert('Silakan pilih file Excel (.xlsx) untuk mengimpor nilai rombel.')
}

// 6. Jadwal Ujian State (Ujian Harian / PTS / PAS)
const examCategory = ref('Semua')
const examPeriod = ref('Mingguan')

const allExams = [
  { code: 'UH-01', title: 'Penilaian Harian 1: Pemrograman Web', category: 'Ujian Harian', supervisor: 'Hendra Gunawan, S.Kom', method: 'CBT Lab Komputer', schedule: 'Senin, 08:30 WIB', status: 'Siap Dimulai' },
  { code: 'UH-02', title: 'Ulangan Harian 2: Matematika Diskrit', category: 'Ujian Harian', supervisor: 'Aisyah Putri, M.Pd', method: 'CBT Terkunci', schedule: 'Rabu, 09:00 WIB', status: 'Terjadwal' },
  { code: 'PTS-G1', title: 'Penilaian Tengah Semester (PTS) Ganjil', category: 'Ujian Tengah Semester', supervisor: 'Tim Pengawas CBT', method: 'CBT Online Terpadu', schedule: 'Pekan Depan, 07:30 WIB', status: 'Verifikasi Soal' },
  { code: 'PAS-G1', title: 'Penilaian Akhir Semester (PAS) Ganjil', category: 'Ujian Akhir', supervisor: 'Panitia Ujian Sekolah', method: 'CBT Lab & Essay', schedule: 'Bulan Depan', status: 'Bank Soal' }
]

const filteredExams = computed(() => {
  return allExams.filter(e => {
    if (examCategory.value !== 'Semua' && e.category !== examCategory.value) return false
    return true
  })
})

// Helpers
const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.T\s*|Ust\.\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarGradient = (name: string) => {
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-purple-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600'
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return gradients[sum % gradients.length]
}

const exportStudentList = () => {
  const headers = ['No', 'NISN', 'Nama Siswa', 'Gender', 'Presensi (%)', 'Nilai', 'Status']
  const rows = studentList.value.map((s, idx) => [
    idx + 1,
    `"${s.nisn}"`,
    `"${s.name}"`,
    s.gender === 'L' ? 'Putra' : 'Putri',
    s.attendanceRate,
    s.avgScore,
    'Aktif'
  ])

  const csvContent = '\uFEFF' + [
    `Data Siswa Rombel ${classData.value.name} - ${schoolName.value}`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `data_siswa_rombel_${classData.value.name.replace(/\s+/g, '_')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
