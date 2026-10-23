<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200/80">
            {{ activeGrade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
            Tahun Ajaran 2026/2027 &bull; Semester Ganjil
          </span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{{ title }}</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">{{ subtitle }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
        <button
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          type="button"
          @click="exportClassesCsv"
        >
          <AdminIcon name="dl" size="16" />
          <span>Ekspor CSV</span>
        </button>

        <button
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          type="button"
          @click="openCreateModal"
        >
          <AdminIcon name="plus" size="16" />
          <span>Tambah Rombel</span>
        </button>
      </div>
    </div>

    <!-- Submenu Navigation Pills -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0"
        :class="activeSubmenu === 'overview'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'"
        @click="activeSubmenu = 'overview'"
      >
        <AdminIcon name="grid" size="16" :class="activeSubmenu === 'overview' ? 'text-white' : 'text-slate-400'" />
        <span>Overview &amp; Kapasitas</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0"
        :class="activeSubmenu === 'daftar'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'"
        @click="activeSubmenu = 'daftar'"
      >
        <AdminIcon name="book" size="16" :class="activeSubmenu === 'daftar' ? 'text-white' : 'text-slate-400'" />
        <span>Daftar Rombel Kelas</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
          :class="activeSubmenu === 'daftar' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
        >
          {{ rawClasses.length }} Kelas
        </span>
      </button>
    </div>

    <!-- ============================================================= -->
    <!-- SUBMENU 1: OVERVIEW (KPI Cards, Charts, Capacity Breakdown)   -->
    <!-- ============================================================= -->
    <div v-if="activeSubmenu === 'overview'" class="space-y-6 animate-fadeUp">
      <!-- 4 Canonical Summary KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <article
          v-for="(item, idx) in summaryCards"
          :key="item.label"
          class="group relative overflow-hidden rounded-3xl p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-2xl cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[180px] before:h-[180px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[70px] before:-right-[50px] after:content-[''] after:absolute after:w-[100px] after:h-[100px] after:rounded-full after:pointer-events-none after:border-[20px] after:border-white/10 after:-bottom-[50px] after:-left-[30px]"
          :class="[
            idx === 0 ? 'bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-blue-700/25' :
            idx === 1 ? 'bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-emerald-700/25' :
            idx === 2 ? 'bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-amber-700/25' :
            'bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-purple-700/25'
          ]"
          :style="{ animationDelay: `${idx * 70}ms` }"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between relative z-10">
            <div class="text-xs font-bold uppercase tracking-wider text-white/90">{{ item.label }}</div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm border border-white/25">
              {{ item.sub }}
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-bold font-mono my-1.5 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-baseline gap-1.5">
            <span>{{ item.value }}</span>
            <span class="text-xs font-semibold text-white/80 font-sans">{{ item.unit }}</span>
          </div>
          <div class="text-[11px] font-semibold text-white/85 relative z-10 flex items-center justify-between">
            <span>{{ item.note }}</span>
            <span class="text-[10px] font-bold underline decoration-white/40 underline-offset-2">{{ item.rate }}</span>
          </div>
        </article>
      </div>

      <!-- Charts & Visualizations Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Attendance Trend Chart (2 Cols) -->
        <div class="lg:col-span-2 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Tingkat Kehadiran &amp; Rata-rata Nilai per Rombel</h3>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Komparasi performa kehadiran vs capaian akademik antar kelas</p>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-bold">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-1.5 rounded-full bg-emerald-500" />
                <span class="text-slate-600">Kehadiran (%)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-1.5 rounded-full bg-blue-600" />
                <span class="text-slate-600">Rata-rata Nilai</span>
              </div>
            </div>
          </div>

          <!-- Line Chart Component -->
          <div class="py-2">
            <AdminLineChart
              :labels="chartLabels"
              :series="chartSeries"
              :y-format="(v) => `${Math.round(v)}`"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Rombel Tertinggi</span>
              <b class="text-emerald-700 font-mono text-sm font-bold">XII RPL 1 (97%)</b>
            </div>
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Rata-rata Nilai Total</span>
              <b class="text-blue-700 font-mono text-sm font-bold">84.8 / 100</b>
            </div>
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Rasio Gender L/P</span>
              <b class="text-slate-900 font-mono text-sm font-bold">57% : 43%</b>
            </div>
          </div>
        </div>

        <!-- Donut Composition Chart (1 Col) -->
        <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
          <div class="pb-3 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Distribusi Jurusan &amp; Jenjang</h3>
              </div>
              <span class="text-[10.5px] font-mono font-bold text-slate-400">Total: 422 Siswa</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Proporsi siswa per bidang keahlian</p>
          </div>

          <!-- Donut Chart -->
          <div class="py-3 flex flex-col items-center justify-center">
            <AdminDonutChart
              :segments="donutSegments"
              center-text="422"
              caption="Total Siswa"
            />
          </div>

          <!-- Legend Details -->
          <div class="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            <div v-for="seg in donutSegments" :key="seg.label" class="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: seg.color }" />
                <span class="text-slate-700 font-medium">{{ seg.label }}</span>
              </div>
              <div class="flex items-center gap-2 font-mono">
                <b class="text-slate-900 font-bold">{{ seg.value }} Siswa</b>
                <span class="text-[11px] text-slate-400">({{ ((seg.value / 422) * 100).toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Class Grade Matrix (Bento Cards Preview) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Distribusi per Tingkat Pendidikan</h3>
          <button
            class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            type="button"
            @click="activeSubmenu = 'daftar'"
          >
            <span>Lihat Semua Rombel</span>
            <span>?</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="grp in gradeGroupSummary"
            :key="grp.title"
            class="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div class="flex items-start justify-between">
              <div>
                <span class="text-[10.5px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">{{ grp.badge }}</span>
                <b class="text-base font-bold text-slate-900">{{ grp.title }}</b>
                <p class="text-xs text-slate-500 mt-0.5">{{ grp.sub }}</p>
              </div>
              <span class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                {{ grp.classesCount }} Rombel
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 bg-slate-50/80 border border-slate-100 p-2.5 rounded-2xl text-center text-xs">
              <div>
                <b class="text-slate-900 font-mono font-bold block">{{ grp.totalStudents }}</b>
                <span class="text-[10px] text-slate-500">Siswa</span>
              </div>
              <div>
                <b class="text-emerald-700 font-mono font-bold block">{{ grp.avgAttendance }}%</b>
                <span class="text-[10px] text-slate-500">Hadir</span>
              </div>
              <div>
                <b class="text-blue-700 font-mono font-bold block">{{ grp.avgScore }}</b>
                <span class="text-[10px] text-slate-500">Nilai</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="cls in grp.classList"
                :key="cls"
                class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                @click="filterClassAndGoDetail(cls)"
              >
                {{ cls }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SUBMENU 2: DAFTAR ROMBEL (Toolbar, Cards/Table View, Modal)   -->
    <!-- ============================================================= -->
    <div v-else-if="activeSubmenu === 'daftar'" class="space-y-4 animate-fadeUp">
      <!-- Toolbar & Filters -->
      <div class="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div class="flex flex-wrap items-center gap-3">
          <!-- School Switcher -->
          <div class="relative">
            <select
              v-model="filterGrade"
              class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-xs cursor-pointer"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="SMK">SMK IT Attaqwa 9</option>
              <option value="SMP">SMP IT Bina Cendekia</option>
            </select>
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">?</span>
          </div>

          <!-- Major / Jurusan Switcher -->
          <div class="relative">
            <select
              v-model="filterMajor"
              class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-xs cursor-pointer"
            >
              <option value="Semua">Semua Jurusan</option>
              <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
              <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
              <option value="SMP">Reguler SMP</option>
            </select>
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">?</span>
          </div>

          <!-- Sort Selector -->
          <div class="relative">
            <select
              v-model="selectedSort"
              class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-xs cursor-pointer"
            >
              <option value="name-asc">Nama Kelas (A-Z)</option>
              <option value="name-desc">Nama Kelas (Z-A)</option>
              <option value="students-desc">Jumlah Siswa Terbanyak</option>
              <option value="attendance-desc">Kehadiran Tertinggi</option>
              <option value="average-desc">Nilai Rata-rata Tertinggi</option>
            </select>
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">?</span>
          </div>

          <!-- Search Box -->
          <div class="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-600 focus-within:bg-white shadow-xs transition-colors">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input
              v-model.trim="searchQuery"
              placeholder="Cari nama kelas, wali kelas, atau ruangan..."
              class="w-full text-xs font-medium outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
            />
            <button
              v-if="searchQuery"
              class="text-slate-400 hover:text-slate-600 text-xs font-bold"
              type="button"
              @click="searchQuery = ''"
            >
              ?
            </button>
          </div>

          <!-- Layout Switcher (Grid vs Table) -->
          <div class="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/70 shrink-0">
            <button
              type="button"
              class="p-1.5 rounded-lg text-xs font-bold transition-all"
              :class="viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
              title="Tampilan Grid Kartu"
              @click="viewMode = 'grid'"
            >
              <AdminIcon name="grid" size="16" />
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg text-xs font-bold transition-all"
              :class="viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
              title="Tampilan Tabel Detail"
              @click="viewMode = 'table'"
            >
              <AdminIcon name="menu" size="16" />
            </button>
          </div>
        </div>

        <!-- Filter Chips (Rombel Counts) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span class="text-[11px] font-bold text-slate-400 shrink-0 mr-1 uppercase tracking-wider">Kategori:</span>
          <button
            v-for="cat in categoryChips"
            :key="cat.value"
            type="button"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5"
            :class="selectedCategory === cat.value
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600'"
            @click="selectedCategory = cat.value"
          >
            <span>{{ cat.label }}</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
              :class="selectedCategory === cat.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
            >
              {{ cat.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- VIEW 1: GRID CARDS (Referensi Desain Clean Card & Sesuai 5 Data Wajib) -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="(item, idx) in pagedClasses"
          :key="item.name"
          class="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(37,99,235,0.12)] hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group animate-riseIn"
          :style="{ animationDelay: `${idx * 40}ms` }"
        >
          <div>
            <!-- 1. Header: Avatar + Nama Kelas (Tingkatan) + Gedung & Ruang Kelas -->
            <div class="flex items-start gap-4 mb-4">
              <!-- Avatar Circle + Status Pill Underneath -->
              <div class="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  class="w-14 h-14 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-xs ring-2 ring-slate-100"
                  :class="avatarGradient(item.name)"
                >
                  {{ initials(item.teacher) }}
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 shadow-2xs"
                  :class="item.attendance >= 94 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'"
                >
                  <span>?</span>
                  <span>{{ item.attendance }}%</span>
                </span>
              </div>

              <!-- Nama Kelas, Tingkatan, Gedung & Ruang Kelas -->
              <div class="min-w-0 flex-1 pt-0.5">
                <h3 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                  {{ item.name }}
                </h3>
                <p class="text-xs text-slate-500 font-medium mt-1 truncate">
                  {{ getTingkat(item.name, item.level) }} &bull; {{ item.level === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}
                </p>
                <p class="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5 truncate">
                  <AdminIcon name="bldg" size="13" class="text-slate-400 shrink-0" />
                  <span>{{ item.room }}</span>
                </p>
              </div>
            </div>

            <!-- 2. Wali Kelas & 3. Jumlah Siswa (Laki laki / Perempuan) -->
            <div class="space-y-1.5 py-3 border-t border-slate-100 text-xs text-slate-600">
              <div class="truncate">
                <span class="text-slate-400 font-medium">Wali Kelas: </span>
                <b class="text-slate-800 font-bold">{{ item.teacher }}</b>
              </div>
              <div class="truncate">
                <span class="text-slate-400 font-medium">Jumlah Siswa: </span>
                <b class="text-slate-800 font-bold">{{ item.students }} Siswa</b>
                <span class="text-slate-500 font-medium"> ({{ item.boys }} Laki laki / {{ item.girls }} Perempuan)</span>
              </div>
            </div>

            <!-- Tag Chips (Kategori / Rombel) -->
            <div class="flex flex-wrap items-center gap-1.5 pt-2 pb-4">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {{ getTingkat(item.name, item.level) }}
              </span>
              <span v-if="item.major" class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Jurusan {{ item.major }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {{ item.room.split('·')[0].trim() }}
              </span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Aktif
              </span>
            </div>
          </div>

          <!-- Bottom: 4. Ringkasan Kehadiran Hari Ini & 5. Button [Detail Kelas] -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div class="text-lg font-bold font-mono text-slate-900 leading-none">
                {{ item.attendance }}% Hadir
              </div>
              <div class="text-[11px] text-slate-400 font-medium mt-1">
                Ringkasan kehadiran hari ini
              </div>
            </div>

            <button
              type="button"
              class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
              @click="goToClassDetail(item)"
            >
              Detail Kelas
            </button>
          </div>
        </article>
      </div>

      <!-- VIEW 2: TABLE VIEW -->
      <div v-else-if="viewMode === 'table'" class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-4">Rombel Kelas</th>
                <th class="py-3.5 px-4">Jenjang &amp; Jurusan</th>
                <th class="py-3.5 px-4">Wali Kelas</th>
                <th class="py-3.5 px-4">Ruangan</th>
                <th class="py-3.5 px-4 font-mono">Siswa (L/P)</th>
                <th class="py-3.5 px-4 font-mono">Rata² Nilai</th>
                <th class="py-3.5 px-4 font-mono">Kehadiran</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in pagedClasses"
                :key="item.name"
                class="hover:bg-blue-50/40 transition-colors group"
              >
                <!-- Rombel Kelas -->
                <td class="py-3.5 px-4 font-bold text-slate-900 text-xs">
                  <span class="group-hover:text-blue-700 transition-colors">{{ item.name }}</span>
                </td>

                <!-- Jenjang & Jurusan -->
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider border"
                    :class="badgeClass(item.level, item.major)"
                  >
                    {{ item.level }}<template v-if="item.major"> &bull; {{ item.major }}</template>
                  </span>
                </td>

                <!-- Wali Kelas -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ item.teacher }}</div>
                  <div class="text-[10.5px] text-slate-400 font-mono">NIP: {{ item.teacherNip }}</div>
                </td>

                <!-- Ruangan -->
                <td class="py-3.5 px-4 text-slate-600 font-medium">
                  {{ item.room }}
                </td>

                <!-- Siswa L/P -->
                <td class="py-3.5 px-4 font-mono">
                  <b class="text-slate-900 font-bold">{{ item.students }}</b>
                  <span class="text-slate-400 text-[10.5px]"> ({{ item.boys }}L / {{ item.girls }}P)</span>
                </td>

                <!-- Rata-rata Nilai -->
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {{ item.average }}
                </td>

                <!-- Kehadiran -->
                <td class="py-3.5 px-4 font-mono">
                  <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {{ item.attendance }}%
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-3.5 px-4 text-right">
                  <button
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition-all"
                    type="button"
                    @click="openDetail(item)"
                  >
                    <AdminIcon name="eye" size="14" />
                    <span>Detail</span>
                  </button>
                </td>
              </tr>

              <tr v-if="filteredClasses.length === 0">
                <td colspan="8" class="py-10 text-center text-slate-400 font-medium">
                  Tidak ada rombel kelas yang cocok dengan filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-500 shadow-xs">
        <div>
          Menampilkan <b class="text-slate-800">{{ pagedClasses.length }}</b> dari <b class="text-slate-800">{{ filteredClasses.length }}</b> rombel kelas
        </div>
        <div class="flex items-center gap-1.5">
          <button
            class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors shadow-xs"
            :disabled="currentPage <= 1"
            type="button"
            @click="currentPage--"
          >
            ‹ Sebelumnya
          </button>
          <span class="px-3 py-1.5 rounded-xl bg-slate-200/60 font-mono font-bold text-slate-800">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors shadow-xs"
            :disabled="currentPage >= totalPages"
            type="button"
            @click="currentPage++"
          >
            Berikutnya ›
          </button>
        </div>
      </div>
    </div>

    <!-- Slide-Over 1: Detail Rombel Kelas -->
    <AdminSlideOver
      :open="Boolean(selected)"
      :title="selected?.name || 'Detail Rombel'"
      :subtitle="`${selected?.level || ''} • ${selected?.room || ''}`"
      badge="Data Rombel"
      badge-type="primary"
      width="xl"
      @close="selected = null"
    >
      <div v-if="selected" class="space-y-6">
        <!-- Hero Header Card -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-lg relative overflow-hidden">
          <div class="flex items-center gap-4">
            <span
              class="w-14 h-14 rounded-2xl text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md border border-white/20"
              :class="avatarGradient(selected.name)"
            >
              {{ initials(selected.name) }}
            </span>
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white inline-block mb-1">
                {{ selected.level }} &bull; {{ selected.major || 'Reguler' }}
              </span>
              <h4 class="text-xl font-bold text-white leading-tight">
                {{ selected.name }}
              </h4>
              <p class="text-xs text-slate-300 font-mono mt-0.5">Lokasi: {{ selected.room }}</p>
            </div>
          </div>
        </div>

        <!-- Wali Kelas Card -->
        <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
          <div>
            <span class="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">Wali Kelas Terdaftar</span>
            <b class="text-slate-900 text-sm block font-bold">{{ selected.teacher }}</b>
            <span class="text-xs text-slate-500 font-mono">NIP: {{ selected.teacherNip }}</span>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Aktif Mengajar</span>
        </div>

        <!-- Rincian Statistik Bento Grid -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-slate-500 text-[10.5px] font-semibold block">Total Siswa Terdaftar</span>
            <b class="text-slate-900 font-mono text-base font-bold block mt-1">{{ selected.students }} Siswa</b>
            <span class="text-[11px] text-slate-400 block mt-0.5 font-mono">({{ selected.boys }} Laki laki &bull; {{ selected.girls }} Perempuan)</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-slate-500 text-[10.5px] font-semibold block">Tingkat Kehadiran</span>
            <b class="text-emerald-600 font-mono text-base font-bold block mt-1">{{ selected.attendance }}%</b>
            <span class="text-[11px] text-slate-400 block mt-0.5">Rata-rata 30 hari terakhir</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-slate-500 text-[10.5px] font-semibold block">Rata-rata Nilai Semester</span>
            <b class="text-blue-600 font-mono text-base font-bold block mt-1">{{ selected.average }} / 100</b>
            <span class="text-[11px] text-slate-400 block mt-0.5">Akumulasi Nilai CBT</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-slate-500 text-[10.5px] font-semibold block">Kapasitas Ruangan</span>
            <b class="text-slate-900 text-sm font-bold block mt-1">{{ selected.room }}</b>
            <span class="text-[11px] text-slate-400 block mt-0.5">Kapasitas Maks: 36 Siswa</span>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px]"
          type="button"
          @click="selected = null"
        >
          Tutup
        </button>
        <button
          class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer min-h-[44px]"
          type="button"
          @click="selected ? goToAttendance(selected.name) : null"
        >
          Cek Absensi Kelas
        </button>
      </template>
    </AdminSlideOver>

    <!-- Modal Center 2: Tambah Rombel Kelas (Mobile First & Modern) -->
    <AdminSlideOver
      :open="showCreateModal"
      title="Tambah Rombel Kelas Baru"
      subtitle="Tahun Ajaran 2026/2027 • Semester Ganjil"
      badge="Form Rombel"
      badge-type="primary"
      width="lg"
      @close="showCreateModal = false"
    >
      <div class="space-y-4 sm:space-y-5 text-sm">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nama Rombel Kelas</label>
          <input
            v-model.trim="newClass.name"
            placeholder="Contoh: X RPL 3, XI TKJ 2, VII-C"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50 focus:bg-white transition-all font-medium text-sm text-slate-800 min-h-[44px]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Jenjang</label>
            <select
              v-model="newClass.level"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white font-bold cursor-pointer text-sm text-slate-800 min-h-[44px]"
            >
              <option value="SMK">SMK IT Attaqwa 9</option>
              <option value="SMP">SMP IT BCA</option>
            </select>
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Jurusan / Program</label>
            <select
              v-model="newClass.major"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white font-bold cursor-pointer text-sm text-slate-800 min-h-[44px]"
            >
              <option value="">Reguler (SMP)</option>
              <option value="RPL">RPL</option>
              <option value="TKJ">TKJ</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Wali Kelas</label>
          <select
            v-model="newClass.teacher"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white font-bold cursor-pointer text-sm text-slate-800 min-h-[44px]"
          >
            <option value="" disabled>Pilih Wali Kelas</option>
            <option v-for="t in teacherOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Ruangan Kelas</label>
          <input
            v-model.trim="newClass.room"
            placeholder="Contoh: Gedung B &bull; Lab 3"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50 focus:bg-white transition-all font-medium text-sm text-slate-800 min-h-[44px]"
          />
        </div>
      </div>

      <template #footer>
        <button
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px]"
          type="button"
          @click="showCreateModal = false"
        >
          Batal
        </button>
        <button
          class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer min-h-[44px]"
          type="button"
          @click="submitCreateClass"
        >
          Simpan Rombel
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSlideOver from '~/components/admin/AdminSlideOver.vue'
import AdminLineChart from '~/components/admin/AdminLineChart.vue'
import AdminDonutChart from '~/components/admin/AdminDonutChart.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({
  layout: 'admin',
  name: 'admin-kelas'
})

const activeGrade = useAdminGrade()
const router = useRouter()

const title = 'Manajemen Kelas & Rombel'
const subtitle = 'Pengelolaan Rombongan Belajar, Penugasan Wali Kelas & Kapasitas Ruang'

// Submenu Navigation
const activeSubmenu = ref<'overview' | 'daftar'>('overview')
const viewMode = ref<'grid' | 'table'>('grid')

// KPI Overview Cards Data
const summaryCards = computed(() => [
  {
    label: 'Total Rombel Kelas',
    value: `${rawClasses.value.length}`,
    unit: 'Kelas',
    sub: 'T.A 2026/2027',
    note: '6 SMK · 6 SMP',
    rate: '100% Aktif'
  },
  {
    label: 'Total Kapasitas Siswa',
    value: '422',
    unit: 'Siswa',
    sub: 'Rata² 35.2/kelas',
    note: '241 Laki laki · 181 Perempuan',
    rate: '98.5% Kuota'
  },
  {
    label: 'Wali Kelas Terisi',
    value: '12/12',
    unit: 'Guru',
    sub: 'SK Terbit',
    note: 'Semua rombel punya wali',
    rate: '100%'
  },
  {
    label: 'Rata-rata Kehadiran',
    value: '94.2',
    unit: '%',
    sub: '30 Hari Terakhir',
    note: 'Kehadiran harian terpantau',
    rate: 'Stabil'
  }
])

// Chart Data (Comparing Attendance vs Academic Score per Class)
const chartLabels = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', 'X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const chartSeries = [
  { name: 'Kehadiran (%)', color: '#10B981', values: [94, 91, 95, 89, 96, 92, 94, 90, 95, 93, 97, 94] },
  { name: 'Rata-rata Nilai', color: '#2563EB', values: [84.2, 82.8, 85.1, 81.5, 86.4, 83.7, 85.5, 83.2, 86.9, 84.6, 88.3, 85.8] }
]

// Donut Chart Segments (Major & Grade Distribution)
const donutSegments = computed(() => [
  { label: 'RPL (SMK)', value: 140, color: '#3B82F6' },
  { label: 'TKJ (SMK)', value: 70, color: '#6366F1' },
  { label: 'Kelas VII (SMP)', value: 70, color: '#10B981' },
  { label: 'Kelas VIII (SMP)', value: 70, color: '#F59E0B' },
  { label: 'Kelas IX (SMP)', value: 72, color: '#06B6D4' }
])

// Group Summary by Education Stage
const gradeGroupSummary = [
  {
    badge: 'SMK IT Attaqwa 9',
    title: 'Tingkat X, XI, XII (Kejuruan)',
    sub: 'Program RPL & Teknik Komputer Jaringan',
    classesCount: 6,
    totalStudents: 210,
    avgAttendance: 94.8,
    avgScore: 85.7,
    classList: ['X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']
  },
  {
    badge: 'SMP IT Bina Cendekia',
    title: 'Tingkat VII & VIII (Menengah Pertama)',
    sub: 'Kurikulum IMTAQ & IPTEK Terpadu',
    classesCount: 4,
    totalStudents: 140,
    avgAttendance: 92.3,
    avgScore: 83.4,
    classList: ['VII-A', 'VII-B', 'VIII-A', 'VIII-B']
  },
  {
    badge: 'SMP IT Bina Cendekia',
    title: 'Tingkat IX (Tingkat Akhir SMP)',
    sub: 'Persiapan Ujian Akhir & SPMB Lanjutan',
    classesCount: 2,
    totalStudents: 72,
    avgAttendance: 94.0,
    avgScore: 85.1,
    classList: ['IX-A', 'IX-B']
  }
]

// Raw Class Data
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

const rawClasses = ref<ClassRombel[]>([
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
])

// Filter & Search State
const filterGrade = ref('Semua')
const filterMajor = ref('Semua')
const selectedSort = ref('name-asc')
const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categoryChips = computed(() => [
  { label: 'Semua Rombel', value: 'Semua', count: rawClasses.value.length },
  { label: 'SMK RPL', value: 'RPL', count: rawClasses.value.filter(c => c.major === 'RPL').length },
  { label: 'SMK TKJ', value: 'TKJ', count: rawClasses.value.filter(c => c.major === 'TKJ').length },
  { label: 'SMP BCA', value: 'SMP', count: rawClasses.value.filter(c => c.level === 'SMP').length }
])

// Filtered & Sorted Classes
const filteredClasses = computed(() => {
  let list = rawClasses.value.filter(item => {
    // Grade Filter
    if (filterGrade.value !== 'Semua' && item.level !== filterGrade.value) {
      return false
    }
    // Major Filter
    if (filterMajor.value !== 'Semua') {
      if (filterMajor.value === 'SMP' && item.level !== 'SMP') return false
      if (filterMajor.value !== 'SMP' && item.major !== filterMajor.value) return false
    }
    // Category Chip Filter
    if (selectedCategory.value !== 'Semua') {
      if (selectedCategory.value === 'SMP' && item.level !== 'SMP') return false
      if (selectedCategory.value !== 'SMP' && item.major !== selectedCategory.value) return false
    }
    // Search Query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchTeacher = item.teacher.toLowerCase().includes(q)
      const matchRoom = item.room.toLowerCase().includes(q)
      if (!matchName && !matchTeacher && !matchRoom) return false
    }
    return true
  })

  // Sorting
  list = [...list].sort((a, b) => {
    if (selectedSort.value === 'name-asc') return a.name.localeCompare(b.name)
    if (selectedSort.value === 'name-desc') return b.name.localeCompare(a.name)
    if (selectedSort.value === 'students-desc') return b.students - a.students
    if (selectedSort.value === 'attendance-desc') return b.attendance - a.attendance
    if (selectedSort.value === 'average-desc') return b.average - a.average
    return 0
  })

  return list
})

// Pagination
const currentPage = ref(1)
const perPage = 6

const totalPages = computed(() => Math.max(1, Math.ceil(filteredClasses.value.length / perPage)))

const pagedClasses = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredClasses.value.slice(start, start + perPage)
})

// Auto-reset page when filters change
watch([searchQuery, filterGrade, filterMajor, selectedCategory, selectedSort], () => {
  currentPage.value = 1
})

const filterClassAndGoDetail = (className: string) => {
  router.push(`/admin/kelas/${encodeURIComponent(className)}`)
}

// Modal Detail State & Navigation
const selected = ref<ClassRombel | null>(null)

const goToClassDetail = (item: ClassRombel) => {
  router.push(`/admin/kelas/${encodeURIComponent(item.name)}`)
}

const goToClassAttendance = (item: ClassRombel) => {
  router.push({
    path: '/admin/absensi-siswa',
    query: {
      kelas: item.name,
      jenjang: item.level
    }
  })
}

const openDetail = (item: ClassRombel) => {
  goToClassDetail(item)
}

const goToAttendance = (className: string) => {
  selected.value = null
  router.push('/admin/absensi-siswa')
}

// Modal Create Class State
const showCreateModal = ref(false)
const teacherOptions = [
  'Bambang Supriyanto, M.Kom',
  'Hendra Gunawan, S.Kom',
  'Fajar Nugroho, S.Pd',
  'Rizky Wahyudi, S.T',
  'Eko Prasetyo, S.Pd',
  'Siti Aminah, S.Pd',
  'Dewi Lestari, S.Pd',
  'Nurul Hidayati, S.Si',
  'Drs. H. Ahmad Dahlan'
]

const newClass = ref({
  name: '',
  level: 'SMK' as 'SMK' | 'SMP',
  major: 'RPL',
  room: '',
  teacher: ''
})

const openCreateModal = () => {
  newClass.value = {
    name: '',
    level: activeGrade.value,
    major: activeGrade.value === 'SMK' ? 'RPL' : '',
    room: '',
    teacher: ''
  }
  showCreateModal.value = true
}

const submitCreateClass = () => {
  if (!newClass.value.name || !newClass.value.teacher) {
    alert('Mohon lengkapi nama rombel dan wali kelas.')
    return
  }

  rawClasses.value.unshift({
    name: newClass.value.name,
    level: newClass.value.level,
    major: newClass.value.major,
    room: newClass.value.room || 'Gedung Utama',
    teacher: newClass.value.teacher,
    teacherNip: '199001012020011001',
    students: 34,
    boys: 18,
    girls: 16,
    attendance: 95,
    average: 85.0
  })

  alert(`Rombel kelas ${newClass.value.name} berhasil ditambahkan.`)
  showCreateModal.value = false
  activeSubmenu.value = 'daftar'
}

// Helpers & Formatters
const getTingkat = (name: string, level: string) => {
  if (name.startsWith('VII-')) return 'Tingkat VII'
  if (name.startsWith('VIII-')) return 'Tingkat VIII'
  if (name.startsWith('IX-')) return 'Tingkat IX'
  if (name.startsWith('X ')) return 'Tingkat X'
  if (name.startsWith('XI ')) return 'Tingkat XI'
  if (name.startsWith('XII ')) return 'Tingkat XII'
  return level === 'SMP' ? 'Tingkat SMP' : 'Tingkat SMK'
}

const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.T\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
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

const badgeClass = (level: string, major: string) => {
  if (level === 'SMP') return 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
  if (major === 'RPL') return 'bg-blue-50 text-blue-800 border-blue-200/60'
  if (major === 'TKJ') return 'bg-indigo-50 text-indigo-800 border-indigo-200/60'
  return 'bg-purple-50 text-purple-800 border-purple-200/60'
}

// Export CSV Function
const exportClassesCsv = () => {
  const headers = ['No', 'Nama Rombel', 'Jenjang', 'Jurusan', 'Wali Kelas', 'NIP Wali Kelas', 'Ruangan', 'Total Siswa', 'Laki laki', 'Perempuan', 'Kehadiran (%)', 'Rata-rata Nilai']
  const rows = filteredClasses.value.map((c, i) => [
    i + 1,
    `"${c.name}"`,
    c.level,
    c.major || 'Umum',
    `"${c.teacher}"`,
    `"${c.teacherNip}"`,
    `"${c.room}"`,
    c.students,
    c.boys,
    c.girls,
    c.attendance,
    c.average
  ])

  const csvContent = '\uFEFF' + [
    'Data Manajemen Rombongan Belajar (Rombel) Kelas - Tahun Ajaran 2026/2027',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `data_rombel_kelas_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
