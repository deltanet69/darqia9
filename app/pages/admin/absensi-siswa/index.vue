<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200/80">
            {{ activeGrade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            RFID Reader Online (2 Gateway Gate 1 & 2)
          </span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ title }}</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">{{ subtitle }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
        <button
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          type="button"
          @click="exportRecapCsv"
        >
          <AdminIcon name="dl" size="16" />
          <span>Ekspor Rekap (.CSV)</span>
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
        <span>Overview</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0"
        :class="activeSubmenu === 'detail'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'"
        @click="activeSubmenu = 'detail'"
      >
        <AdminIcon name="user" size="16" :class="activeSubmenu === 'detail' ? 'text-white' : 'text-slate-400'" />
        <span>Detail Kehadiran</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
          :class="activeSubmenu === 'detail' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
        >
          {{ rawStudents.length }} Siswa
        </span>
      </button>
    </div>

    <!-- ============================================================= -->
    <!-- SUBMENU 1: OVERVIEW (Cards, Charts, Live Stream, Class Matrix) -->
    <!-- ============================================================= -->
    <div v-if="activeSubmenu === 'overview'" class="space-y-6 animate-fadeUp">
      <!-- Period Selector Header -->
      <div class="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:px-4">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span class="text-xs font-bold text-slate-800">Rentang Analitik Presensi:</span>
          <span class="text-xs font-medium text-slate-500 hidden sm:inline">({{ periodLabel }})</span>
        </div>
        <div class="bg-white p-1 rounded-xl flex items-center border border-slate-200 shadow-xs">
          <button
            v-for="p in periodOptions"
            :key="p.value"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="selectedPeriod === p.value ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="selectedPeriod = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- 4 Canonical Summary KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <article
          v-for="(item, idx) in summaryCards"
          :key="item.label"
          class="group relative overflow-hidden rounded-3xl p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-2xl cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[180px] before:h-[180px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[70px] before:-right-[50px] after:content-[''] after:absolute after:w-[100px] after:h-[100px] after:rounded-full after:pointer-events-none after:border-[20px] after:border-white/10 after:-bottom-[50px] after:-left-[30px]"
          :class="[
            idx === 0 ? 'bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-emerald-700/25' :
            idx === 1 ? 'bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-amber-700/25' :
            idx === 2 ? 'bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-blue-700/25' :
            'bg-gradient-to-br from-[#881337] via-[#BE123C] to-[#F43F5E] shadow-rose-700/25'
          ]"
          :style="{ animationDelay: `${idx * 70}ms` }"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between relative z-10">
            <div class="text-xs font-bold uppercase tracking-wider text-white/90">{{ item.label }}</div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-sm border border-white/25">
              {{ item.sub }}
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-black font-mono my-1.5 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-baseline gap-1.5">
            <span>{{ item.value }}</span>
            <span class="text-xs font-semibold text-white/80 font-sans">Siswa</span>
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
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Tren Grafik Tingkat Kehadiran Siswa</h3>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Persentase kehadiran tepat waktu vs terlambat ({{ periodLabel }})</p>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-bold">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-1.5 rounded-full bg-emerald-500" />
                <span class="text-slate-600">Tepat Waktu</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-1.5 rounded-full bg-amber-500" />
                <span class="text-slate-600">Terlambat</span>
              </div>
            </div>
          </div>

          <!-- Line Chart Component -->
          <div class="py-2">
            <AdminLineChart
              :labels="trendLabels"
              :series="trendSeries"
              :y-format="(v) => `${Math.round(v)}%`"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Rata-rata Hadir</span>
              <b class="text-slate-900 font-mono text-sm font-bold">94.8%</b>
            </div>
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Puncak Tap Masuk</span>
              <b class="text-emerald-700 font-mono text-sm font-bold">06:25 - 06:40</b>
            </div>
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Kepatuhan RFID</span>
              <b class="text-blue-700 font-mono text-sm font-bold">99.2%</b>
            </div>
          </div>
        </div>

        <!-- Donut Composition Chart (1 Col) -->
        <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
          <div class="pb-3 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Komposisi Presensi Siswa</h3>
              </div>
              <span class="text-[10.5px] font-mono font-bold text-slate-400">Total: 316 Siswa</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Proporsi status presensi siswa hari ini</p>
          </div>

          <!-- Donut Chart -->
          <div class="py-3 flex flex-col items-center justify-center">
            <AdminDonutChart
              :segments="donutSegments"
              center-text="316"
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
                <b class="text-slate-900 font-bold">{{ seg.value }}</b>
                <span class="text-[11px] text-slate-400">({{ ((seg.value / 316) * 100).toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live RFID Stream Ticker -->
      <div class="bg-gradient-to-r from-slate-900 via-[#0A1F44] to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
            <AdminIcon name="check" size="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white tracking-wide">Live Stream RFID Card Tap</span>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">Live</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium">Auto-sync dengan Gate 1 & 2 via WebSocket</p>
          </div>
        </div>

        <!-- Realtime Ticker Items -->
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div
            v-for="tap in recentTaps"
            :key="tap.id"
            class="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between text-xs hover:bg-white/10 transition-colors"
          >
            <div class="min-w-0 pr-2">
              <b class="text-white font-bold block truncate text-[11.5px]">{{ tap.name }}</b>
              <span class="text-[10px] text-slate-300 font-mono">{{ tap.classroom }} &bull; {{ tap.rfid }}</span>
            </div>
            <div class="text-right shrink-0">
              <span
                class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider block mb-0.5"
                :class="tap.status === 'Tepat Waktu' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'"
              >
                {{ tap.time }}
              </span>
              <span class="text-[9px] text-slate-400">{{ tap.gate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rekap Kehadiran per Kelas (Rombel Cards Matrix) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Rekap Kehadiran per Rombel / Kelas</h3>
          <span class="text-xs font-medium text-slate-500">Klik kelas untuk melihat detail kehadiran</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="c in classSummaryMatrix"
            :key="c.name"
            class="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            @click="selectClassAndGoDetail(c.name)"
          >
            <div class="flex items-start justify-between">
              <div>
                <b class="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors block">{{ c.name }}</b>
                <span class="text-[11px] text-slate-400 font-medium">Wali: {{ c.wali }}</span>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {{ c.percentage }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1">
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div class="bg-emerald-500 h-full" :style="{ width: `${c.percentage}%` }" />
                <div class="bg-amber-400 h-full" :style="{ width: `${c.latePct}%` }" />
                <div class="bg-rose-500 h-full" :style="{ width: `${c.alpaPct}%` }" />
              </div>
              <div class="flex items-center justify-between text-[10.5px] font-mono font-semibold text-slate-500">
                <span>Hadir: {{ c.present }}/{{ c.total }}</span>
                <span>Terlambat: {{ c.late }} &bull; Alpa: {{ c.alpa }}</span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Detail Kelas</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SUBMENU 2: DETAIL KEHADIRAN (Classroom Nav, Filters, Table)   -->
    <!-- ============================================================= -->
    <div v-else-if="activeSubmenu === 'detail'" class="space-y-4 animate-fadeUp">
      <!-- Classroom Tab Navigator -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs space-y-2">
        <div class="flex items-center justify-between px-2 pt-1">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Rombel / Kelas:</span>
          <span class="text-xs font-bold text-blue-600">{{ selectedClassroom === 'Semua' ? 'Menampilkan Semua Rombel' : `Kelas ${selectedClassroom}` }}</span>
        </div>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border"
            :class="selectedClassroom === 'Semua'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
            @click="selectedClassroom = 'Semua'"
          >
            Semua Kelas ({{ rawStudents.length }})
          </button>
          <button
            v-for="cls in availableClassrooms"
            :key="cls"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border"
            :class="selectedClassroom === cls
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
            @click="selectedClassroom = cls"
          >
            {{ cls }}
          </button>
        </div>
      </div>

      <!-- Main Attendance Table Card -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col">
        <!-- Toolbar & Filters -->
        <div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 space-y-3.5">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Day Selector -->
            <div class="relative">
              <select
                v-model="selectedDay"
                class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm cursor-pointer"
              >
                <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
              </select>
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</span>
            </div>

            <!-- School Grade Switcher -->
            <div class="relative">
              <select
                v-model="selectedGradeFilter"
                class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm cursor-pointer"
              >
                <option value="Semua">Semua Jenjang</option>
                <option value="SMK">SMK IT Attaqwa 9</option>
                <option value="SMP">SMP IT Bina Cendekia</option>
              </select>
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</span>
            </div>

            <!-- Sort Selector -->
            <div class="relative">
              <select
                v-model="selectedSort"
                class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm cursor-pointer"
              >
                <option value="time-desc">Waktu Tap Terbaru</option>
                <option value="time-asc">Waktu Tap Terlama</option>
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
                <option value="status">Status Presensi</option>
              </select>
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</span>
            </div>

            <!-- Search Box -->
            <div class="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus-within:border-blue-600 shadow-sm transition-colors">
              <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
              <input
                v-model.trim="searchQuery"
                placeholder="Cari nama siswa, NISN, atau ID RFID..."
                class="w-full text-xs font-medium outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
              />
              <button
                v-if="searchQuery"
                class="text-slate-400 hover:text-slate-600 text-xs font-bold"
                type="button"
                @click="searchQuery = ''"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Filter Status Chips -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span class="text-[11px] font-bold text-slate-400 shrink-0 mr-1 uppercase tracking-wider">Status:</span>
            <button
              v-for="item in statusFilterOptions"
              :key="item.value"
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5"
              :class="selectedStatus === item.value
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600'"
              @click="selectedStatus = item.value"
            >
              <span v-if="item.color" class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: item.color }" />
              <span>{{ item.label }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold"
                :class="selectedStatus === item.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
              >
                {{ item.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Table View (Desktop & Tablet) -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-4">Siswa</th>
                <th class="py-3.5 px-4">NISN & RFID</th>
                <th class="py-3.5 px-4">Kelas</th>
                <th class="py-3.5 px-4">Jam Masuk</th>
                <th class="py-3.5 px-4">Jam Keluar</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in pagedRows"
                :key="item.id"
                class="hover:bg-blue-50/40 transition-colors group"
              >
                <!-- Siswa -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="w-9 h-9 rounded-2xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm"
                      :class="avatarGradient(item.id)"
                    >
                      {{ initials(item.name) }}
                    </span>
                    <div>
                      <b class="text-slate-900 text-xs block font-bold group-hover:text-blue-700 transition-colors">{{ item.name }}</b>
                      <span class="text-[11px] text-slate-400 font-medium">{{ item.gender }} &bull; {{ item.school }}</span>
                    </div>
                  </div>
                </td>

                <!-- NISN & RFID -->
                <td class="py-3.5 px-4">
                  <div class="font-mono text-slate-700 font-semibold text-xs">{{ item.nisn }}</div>
                  <div class="inline-flex items-center gap-1 text-[10.5px] font-mono text-slate-400">
                    <span class="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">RFID</span>
                    <span>{{ item.rfidUid }}</span>
                  </div>
                </td>

                <!-- Kelas -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70 inline-block">
                    {{ item.classroom }}
                  </span>
                </td>

                <!-- Jam Masuk -->
                <td class="py-3.5 px-4 font-mono font-medium">
                  <div v-if="item.timeIn" class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-900">{{ item.timeIn }}</span>
                    <span
                      v-if="item.status === 'Terlambat'"
                      class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 font-sans"
                    >
                      +{{ item.lateMinutes }}m
                    </span>
                  </div>
                  <span v-else class="text-slate-400 font-sans italic text-[11px]">Belum tap</span>
                </td>

                <!-- Jam Keluar -->
                <td class="py-3.5 px-4 font-mono font-medium">
                  <span v-if="item.timeOut" class="font-bold text-slate-900">{{ item.timeOut }}</span>
                  <span v-else class="text-slate-400 font-sans italic text-[11px]">—</span>
                </td>

                <!-- Status Presensi -->
                <td class="py-3.5 px-4">
                  <span
                    class="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                    :class="pillClass(item.status)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.status)" />
                    <span>{{ item.status }}</span>
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-3.5 px-4 text-right">
                  <button
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-slate-200/60"
                    type="button"
                    @click="openStudentDetail(item)"
                  >
                    <AdminIcon name="eye" size="14" />
                    <span>Detail</span>
                  </button>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredRows.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 font-medium space-y-2">
                  <div class="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <AdminIcon name="search" size="24" />
                  </div>
                  <div class="text-slate-600 font-bold text-sm">Tidak ada data presensi yang sesuai filter</div>
                  <p class="text-xs text-slate-400">Coba ubah kata kunci pencarian atau sesuaikan opsi filter status/kelas.</p>
                  <button
                    class="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs inline-block hover:bg-slate-300 transition-colors"
                    type="button"
                    @click="resetFilters"
                  >
                    Reset Semua Filter
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500">
          <div>
            Menampilkan <b class="text-slate-800">{{ pagedRows.length }}</b> dari <b class="text-slate-800">{{ filteredRows.length }}</b> data siswa
          </div>
          <div class="flex items-center gap-1.5">
            <button
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors shadow-sm"
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
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors shadow-sm"
              :disabled="currentPage >= totalPages"
              type="button"
              @click="currentPage++"
            >
              Berikutnya ›
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Detail Modal (Teleported to Body) -->
    <Teleport to="body">
      <div
        v-if="selectedStudent"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
        @click.self="closeStudentDetail"
      >
        <div class="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6 animate-scaleUp">
          <!-- Modal Header -->
          <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <span
                class="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md"
                :class="avatarGradient(selectedStudent.id)"
              >
                {{ initials(selectedStudent.name) }}
              </span>
              <div>
                <h3 class="text-base font-black text-slate-900 leading-tight">{{ selectedStudent.name }}</h3>
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span class="font-mono font-semibold text-slate-700">NISN: {{ selectedStudent.nisn }}</span>
                  <span>&bull;</span>
                  <span class="font-bold text-blue-600">{{ selectedStudent.classroom }}</span>
                </div>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition-colors shrink-0"
              type="button"
              @click="closeStudentDetail"
            >
              ✕
            </button>
          </div>

          <!-- Presence Status Highlight -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status Hari Ini (05 Okt 2026)</span>
              <span
                class="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                :class="pillClass(selectedStudent.status)"
              >
                <span class="w-2 h-2 rounded-full" :class="dotClass(selectedStudent.status)" />
                <span>{{ selectedStudent.status }}</span>
              </span>
            </div>
            <div class="text-left sm:text-right font-mono text-xs">
              <span class="text-[11px] font-sans font-semibold text-slate-500 block">Waktu Tap RFID:</span>
              <b class="text-slate-900 text-sm font-bold">{{ selectedStudent.timeIn || '—' }}</b>
              <span v-if="selectedStudent.timeOut" class="text-slate-500 font-sans text-[11px]"> (Keluar: {{ selectedStudent.timeOut }})</span>
            </div>
          </div>

          <!-- RFID Card Info Card -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span class="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">UID Kartu RFID</span>
              <b class="text-slate-900 font-mono text-xs">{{ selectedStudent.rfidUid }}</b>
              <span class="text-[10px] text-emerald-600 font-bold block mt-1">● Status: Terdaftar Aktif</span>
            </div>
            <div class="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span class="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">Gateway Reader</span>
              <b class="text-slate-900 text-xs">{{ selectedStudent.gate || 'Gate 1 (Gerbang Utama)' }}</b>
              <span class="text-[10px] text-slate-500 font-mono block mt-1">IP: 192.168.10.14</span>
            </div>
          </div>

          <!-- 7-Day Attendance Matrix -->
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Riwayat Presensi 5 Hari Terakhir</h4>
            <div class="grid grid-cols-5 gap-2 text-center text-xs">
              <div
                v-for="hist in attendanceHistoryMock"
                :key="hist.day"
                class="p-2 rounded-2xl border transition-all"
                :class="hist.status === 'Hadir' ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800' :
                  hist.status === 'Terlambat' ? 'bg-amber-50 border-amber-200/80 text-amber-800' :
                  hist.status === 'Izin' ? 'bg-blue-50 border-blue-200/80 text-blue-800' :
                  'bg-rose-50 border-rose-200/80 text-rose-800'"
              >
                <span class="text-[10.5px] font-bold block text-slate-500 mb-0.5">{{ hist.day }}</span>
                <b class="text-[11px] font-extrabold block">{{ hist.status }}</b>
                <span class="text-[10px] font-mono opacity-80">{{ hist.time }}</span>
              </div>
            </div>
          </div>

          <!-- Manual Status Adjustment by Admin -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Penyesuaian Manual Status</h4>
              <span class="text-[10.5px] text-slate-400">Khusus Administrator</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="st in ['Hadir', 'Izin', 'Sakit', 'Alpa']"
                :key="st"
                type="button"
                class="py-2 px-2.5 rounded-xl text-xs font-bold border transition-all"
                :class="selectedStudent.status === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'"
                @click="updateStudentStatus(st)"
              >
                {{ st }}
              </button>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              class="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              type="button"
              @click="closeStudentDetail"
            >
              Tutup
            </button>
            <button
              class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
              type="button"
              @click="saveStudentDetail"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminLineChart from '~/components/admin/AdminLineChart.vue'
import AdminDonutChart from '~/components/admin/AdminDonutChart.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({
  layout: 'admin',
  name: 'admin-absensi-siswa'
})

const activeGrade = useAdminGrade()

const title = 'Absensi Siswa'
const subtitle = 'Senin, 05 Okt 2026 · Rekap Presensi & Data Tap RFID Siswa Realtime'

// Submenu Navigation State
const activeSubmenu = ref<'overview' | 'detail'>('overview')

// Time Range Period Filter for Overview
const selectedPeriod = ref<'harian' | 'mingguan' | 'bulanan'>('harian')
const periodOptions = [
  { label: 'Harian', value: 'harian' as const },
  { label: 'Mingguan', value: 'mingguan' as const },
  { label: 'Bulanan', value: 'bulanan' as const }
]

const periodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'harian': return '06:00 - 08:00 WIB'
    case 'mingguan': return 'Senin - Jumat'
    case 'bulanan': return 'Oktober 2026'
  }
})

// KPI Overview Cards Data
const summaryCards = computed(() => [
  {
    label: 'Hadir Tepat Waktu',
    value: '294',
    sub: '≤ 06:45',
    note: 'Tap tepat waktu via RFID',
    rate: '93.0%'
  },
  {
    label: 'Terlambat',
    value: '12',
    sub: '06:46-07:00',
    note: 'Konfirmasi guru piket',
    rate: '3.8%'
  },
  {
    label: 'Izin & Sakit',
    value: '6',
    sub: 'Surat Terlampir',
    note: '4 Izin · 2 Sakit',
    rate: '1.9%'
  },
  {
    label: 'Alpa / Belum Hadir',
    value: '4',
    sub: '> 07:00',
    note: 'Auto Alpa lewat 07:00',
    rate: '1.3%'
  }
])

// Class Matrix for Overview
const classSummaryMatrix = [
  { name: 'X RPL 1', wali: 'Dewi Lestari, S.Pd', present: 34, total: 36, percentage: 94.4, late: 1, latePct: 2.8, alpa: 1, alpaPct: 2.8 },
  { name: 'X RPL 2', wali: 'Rini Astuti, S.Pd', present: 33, total: 36, percentage: 91.7, late: 2, latePct: 5.6, alpa: 1, alpaPct: 2.8 },
  { name: 'XI RPL 1', wali: 'Bambang Supriyanto, M.Kom', present: 35, total: 36, percentage: 97.2, late: 1, latePct: 2.8, alpa: 0, alpaPct: 0 },
  { name: 'XI TKJ 1', wali: 'Hendra Gunawan, S.Kom', present: 32, total: 35, percentage: 91.4, late: 2, latePct: 5.7, alpa: 1, alpaPct: 2.9 },
  { name: 'XII RPL 1', wali: 'Fajar Nugroho, S.Pd', present: 36, total: 36, percentage: 100, late: 0, latePct: 0, alpa: 0, alpaPct: 0 },
  { name: 'XII TKJ 1', wali: 'Eko Prasetyo, S.Pd', present: 33, total: 35, percentage: 94.3, late: 2, latePct: 5.7, alpa: 0, alpaPct: 0 }
]

const selectClassAndGoDetail = (className: string) => {
  selectedClassroom.value = className
  activeSubmenu.value = 'detail'
}

// Chart Trend Data based on selectedPeriod
const trendLabels = computed(() => {
  if (selectedPeriod.value === 'harian') {
    return ['06:15', '06:30', '06:45', '07:00', '07:15', '07:30']
  }
  if (selectedPeriod.value === 'mingguan') {
    return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  }
  return ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4']
})

const trendSeries = computed(() => {
  if (selectedPeriod.value === 'harian') {
    return [
      { name: 'Tepat Waktu', color: '#10B981', values: [35, 78, 93, 93, 93, 93] },
      { name: 'Terlambat', color: '#F59E0B', values: [0, 2, 3.8, 3.8, 3.8, 3.8] }
    ]
  }
  if (selectedPeriod.value === 'mingguan') {
    return [
      { name: 'Tepat Waktu', color: '#10B981', values: [93, 95, 92, 96, 94] },
      { name: 'Terlambat', color: '#F59E0B', values: [3.8, 2.5, 4.2, 2.1, 3.5] }
    ]
  }
  return [
    { name: 'Tepat Waktu', color: '#10B981', values: [94, 93.5, 95.2, 94.8] },
    { name: 'Terlambat', color: '#F59E0B', values: [3.5, 4.0, 2.8, 3.8] }
  ]
})

// Donut Chart Breakdown
const donutSegments = computed(() => [
  { label: 'Tepat Waktu', value: 294, color: '#10B981' },
  { label: 'Terlambat', value: 12, color: '#F59E0B' },
  { label: 'Izin', value: 4, color: '#3B82F6' },
  { label: 'Sakit', value: 2, color: '#06B6D4' },
  { label: 'Alpa', value: 4, color: '#F43F5E' }
])

// Recent Live Taps
const recentTaps = ref([
  { id: 't1', name: 'Muhammad Al-Fatih', classroom: 'X RPL 1', rfid: 'RFID-9841-A', time: '06:38:12', status: 'Tepat Waktu', gate: 'Gate 1' },
  { id: 't2', name: 'Siti Sarah Azzahra', classroom: 'XI RPL 1', rfid: 'RFID-8219-B', time: '06:42:05', status: 'Tepat Waktu', gate: 'Gate 2' },
  { id: 't3', name: 'Rizky Dwi Pratama', classroom: 'XII TKJ 1', rfid: 'RFID-7103-C', time: '06:48:33', status: 'Terlambat', gate: 'Gate 1' }
])

// Table Filters & State
const selectedDay = ref('Senin, 05 Okt 2026')
const days = [
  'Senin, 05 Okt 2026',
  'Jumat, 02 Okt 2026',
  'Kamis, 01 Okt 2026',
  'Rabu, 30 Sep 2026',
  'Selasa, 29 Sep 2026'
]

const selectedGradeFilter = ref('Semua')
const selectedClassroom = ref('Semua')

const smkClassrooms = ['X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']
const smpClassrooms = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']

const availableClassrooms = computed(() => {
  if (selectedGradeFilter.value === 'SMK') return smkClassrooms
  if (selectedGradeFilter.value === 'SMP') return smpClassrooms
  return [...smkClassrooms, ...smpClassrooms]
})

const selectedSort = ref('time-desc')
const searchQuery = ref('')
const selectedStatus = ref('Semua')

interface StudentAttendance {
  id: string
  name: string
  nisn: string
  rfidUid: string
  school: 'SMK' | 'SMP'
  classroom: string
  gender: 'Laki-laki' | 'Perempuan'
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'
  timeIn: string | null
  timeOut: string | null
  lateMinutes?: number
  gate?: string
}

// Student Attendance Mock Dataset
const rawStudents = ref<StudentAttendance[]>([
  { id: '1', name: 'Ahmad Wijaya', nisn: '0089281721', rfidUid: 'RFID-1001-A', school: 'SMK', classroom: 'X RPL 1', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:24', timeOut: '15:30', gate: 'Gate 1 (Utama)' },
  { id: '2', name: 'Budi Pratama', nisn: '0089281722', rfidUid: 'RFID-1002-B', school: 'SMK', classroom: 'X RPL 1', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:31', timeOut: '15:30', gate: 'Gate 1 (Utama)' },
  { id: '3', name: 'Citra Dewi Permata', nisn: '0089281723', rfidUid: 'RFID-1003-C', school: 'SMK', classroom: 'X RPL 1', gender: 'Perempuan', status: 'Terlambat', timeIn: '06:52', timeOut: '15:30', lateMinutes: 7, gate: 'Gate 2 (Lobi)' },
  { id: '4', name: 'Dian Nugraha', nisn: '0089281724', rfidUid: 'RFID-1004-D', school: 'SMK', classroom: 'X RPL 2', gender: 'Laki-laki', status: 'Izin', timeIn: null, timeOut: null },
  { id: '5', name: 'Eko Hidayatullah', nisn: '0089281725', rfidUid: 'RFID-1005-E', school: 'SMK', classroom: 'X RPL 2', gender: 'Laki-laki', status: 'Alpa', timeIn: null, timeOut: null },
  { id: '6', name: 'Fitri Handayani', nisn: '0089281726', rfidUid: 'RFID-1006-F', school: 'SMK', classroom: 'XI RPL 1', gender: 'Perempuan', status: 'Hadir', timeIn: '06:18', timeOut: '15:30', gate: 'Gate 1 (Utama)' },
  { id: '7', name: 'Gilang Ramadhan', nisn: '0089281727', rfidUid: 'RFID-1007-G', school: 'SMK', classroom: 'XI TKJ 1', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:40', timeOut: '15:30', gate: 'Gate 2 (Lobi)' },
  { id: '8', name: 'Hana Puspitasari', nisn: '0089281728', rfidUid: 'RFID-1008-H', school: 'SMK', classroom: 'XII RPL 1', gender: 'Perempuan', status: 'Sakit', timeIn: null, timeOut: null },
  { id: '9', name: 'Irfan Hakim Maulana', nisn: '0098192011', rfidUid: 'RFID-2001-A', school: 'SMP', classroom: 'VII-A', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:22', timeOut: '14:30', gate: 'Gate 1 (Utama)' },
  { id: '10', name: 'Joko Susanto', nisn: '0098192012', rfidUid: 'RFID-2002-B', school: 'SMP', classroom: 'VIII-A', gender: 'Laki-laki', status: 'Alpa', timeIn: null, timeOut: null },
  { id: '11', name: 'Khadijah Zahra', nisn: '0089281729', rfidUid: 'RFID-1009-I', school: 'SMK', classroom: 'XI RPL 1', gender: 'Perempuan', status: 'Hadir', timeIn: '06:29', timeOut: '15:30', gate: 'Gate 1 (Utama)' },
  { id: '12', name: 'Lukman Hakim', nisn: '0089281730', rfidUid: 'RFID-1010-J', school: 'SMK', classroom: 'XII TKJ 1', gender: 'Laki-laki', status: 'Terlambat', timeIn: '06:55', timeOut: '15:30', lateMinutes: 10, gate: 'Gate 1 (Utama)' }
])

// Dynamic Status Filter Options with Counts
const statusFilterOptions = computed(() => {
  const list = rawStudents.value
  return [
    { label: 'Semua', value: 'Semua', count: list.length },
    { label: 'Hadir', value: 'Hadir', color: '#10B981', count: list.filter(s => s.status === 'Hadir').length },
    { label: 'Terlambat', value: 'Terlambat', color: '#F59E0B', count: list.filter(s => s.status === 'Terlambat').length },
    { label: 'Izin', value: 'Izin', color: '#3B82F6', count: list.filter(s => s.status === 'Izin').length },
    { label: 'Sakit', value: 'Sakit', color: '#06B6D4', count: list.filter(s => s.status === 'Sakit').length },
    { label: 'Alpa', value: 'Alpa', color: '#F43F5E', count: list.filter(s => s.status === 'Alpa').length }
  ]
})

// Filtered & Sorted Rows
const filteredRows = computed(() => {
  let list = rawStudents.value.filter(item => {
    // School Filter
    if (selectedGradeFilter.value !== 'Semua' && item.school !== selectedGradeFilter.value) {
      return false
    }
    // Classroom Filter
    if (selectedClassroom.value !== 'Semua' && item.classroom !== selectedClassroom.value) {
      return false
    }
    // Status Filter
    if (selectedStatus.value !== 'Semua' && item.status !== selectedStatus.value) {
      return false
    }
    // Search Query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchNisn = item.nisn.includes(q)
      const matchRfid = item.rfidUid.toLowerCase().includes(q)
      if (!matchName && !matchNisn && !matchRfid) return false
    }
    return true
  })

  // Sorting
  list = [...list].sort((a, b) => {
    if (selectedSort.value === 'name-asc') return a.name.localeCompare(b.name)
    if (selectedSort.value === 'name-desc') return b.name.localeCompare(a.name)
    if (selectedSort.value === 'time-desc') {
      const timeA = a.timeIn || '00:00'
      const timeB = b.timeIn || '00:00'
      return timeB.localeCompare(timeA)
    }
    if (selectedSort.value === 'time-asc') {
      const timeA = a.timeIn || '99:99'
      const timeB = b.timeIn || '99:99'
      return timeA.localeCompare(timeB)
    }
    if (selectedSort.value === 'status') {
      return a.status.localeCompare(b.status)
    }
    return 0
  })

  return list
})

// Pagination
const currentPage = ref(1)
const perPage = 8

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage)))

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredRows.value.slice(start, start + perPage)
})

// Auto-reset page when filters change
watch([searchQuery, selectedStatus, selectedClassroom, selectedGradeFilter, selectedSort], () => {
  currentPage.value = 1
})

// Reset Filters Action
const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'Semua'
  selectedClassroom.value = 'Semua'
  selectedGradeFilter.value = 'Semua'
  currentPage.value = 1
}

// Student Detail Modal Handling
const selectedStudent = ref<StudentAttendance | null>(null)

const attendanceHistoryMock = [
  { day: 'Senin', status: 'Hadir', time: '06:24' },
  { day: 'Jumat', status: 'Hadir', time: '06:30' },
  { day: 'Kamis', status: 'Terlambat', time: '06:51' },
  { day: 'Rabu', status: 'Hadir', time: '06:28' },
  { day: 'Selasa', status: 'Hadir', time: '06:33' }
]

const openStudentDetail = (item: StudentAttendance) => {
  selectedStudent.value = { ...item }
}

const closeStudentDetail = () => {
  selectedStudent.value = null
}

const updateStudentStatus = (newStatus: any) => {
  if (selectedStudent.value) {
    selectedStudent.value.status = newStatus
    if (newStatus === 'Hadir' && !selectedStudent.value.timeIn) {
      selectedStudent.value.timeIn = '06:30'
    } else if (newStatus === 'Terlambat') {
      selectedStudent.value.timeIn = '06:50'
      selectedStudent.value.lateMinutes = 5
    } else if (['Izin', 'Sakit', 'Alpa'].includes(newStatus)) {
      selectedStudent.value.timeIn = null
      selectedStudent.value.timeOut = null
    }
  }
}

const saveStudentDetail = () => {
  if (selectedStudent.value) {
    const idx = rawStudents.value.findIndex(s => s.id === selectedStudent.value?.id)
    if (idx !== -1) {
      rawStudents.value[idx] = { ...selectedStudent.value }
    }
    alert(`Status presensi siswa ${selectedStudent.value.name} berhasil diperbarui menjadi ${selectedStudent.value.status}.`)
    closeStudentDetail()
  }
}

// Helpers & Formatters
const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarGradient = (id: string) => {
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-rose-500 to-pink-600'
  ]
  const num = parseInt(id, 10) || 1
  return gradients[num % gradients.length]
}

const pillClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
    case 'Terlambat': return 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
    case 'Izin': return 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
    case 'Sakit': return 'bg-cyan-500/15 text-cyan-700 border border-cyan-500/30'
    case 'Alpa': return 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
    default: return 'bg-slate-100 text-slate-600 border border-slate-200'
  }
}

const dotClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-emerald-500'
    case 'Terlambat': return 'bg-amber-500'
    case 'Izin': return 'bg-blue-500'
    case 'Sakit': return 'bg-cyan-500'
    case 'Alpa': return 'bg-rose-500'
    default: return 'bg-slate-400'
  }
}

// Real Export to CSV with UTF-8 BOM
const exportRecapCsv = () => {
  const headers = ['No', 'NISN', 'Nama Siswa', 'Jenjang', 'Kelas', 'Gender', 'ID Kartu RFID', 'Jam Masuk', 'Jam Keluar', 'Status Presensi', 'Keterangan']
  const rows = filteredRows.value.map((s, i) => [
    i + 1,
    `"${s.nisn}"`,
    `"${s.name}"`,
    s.school,
    `"${s.classroom}"`,
    s.gender,
    `"${s.rfidUid}"`,
    s.timeIn || '-',
    s.timeOut || '-',
    s.status,
    s.status === 'Terlambat' ? `Terlambat ${s.lateMinutes || 0} menit` : '-'
  ])

  const csvContent = '\uFEFF' + [
    `Rekap Presensi Siswa - ${selectedDay.value} (${selectedPeriod.value.toUpperCase()})`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `rekap_absensi_siswa_${selectedPeriod.value}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
