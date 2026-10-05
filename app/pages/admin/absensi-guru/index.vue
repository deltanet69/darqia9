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
            RFID Reader Online (Ruang Guru & Gerbang)
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
          {{ rawTeachers.length }} Guru & Tendik
        </span>
      </button>
    </div>

    <!-- ============================================================= -->
    <!-- SUBMENU 1: OVERVIEW (Cards, Charts, Live Stream, Role Matrix) -->
    <!-- ============================================================= -->
    <div v-if="activeSubmenu === 'overview'" class="space-y-6 animate-fadeUp">
      <!-- Period Selector Header -->
      <div class="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:px-4">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span class="text-xs font-bold text-slate-800">Rentang Analitik Presensi Pendidik:</span>
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
            <span class="text-xs font-semibold text-white/80 font-sans">Pendidik</span>
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
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Tren Presensi Guru & Tenaga Kependidikan</h3>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Tingkat kehadiran tepat waktu vs terlambat ({{ periodLabel }})</p>
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
              <b class="text-slate-900 font-mono text-sm font-bold">96.5%</b>
            </div>
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Puncak Kedatangan</span>
              <b class="text-emerald-700 font-mono text-sm font-bold">06:15 - 06:35</b>
            </div>
            <div class="p-2 rounded-xl bg-slate-50">
              <span class="text-[10.5px] font-semibold text-slate-500 block">Kepatuhan Tap RFID</span>
              <b class="text-blue-700 font-mono text-sm font-bold">100%</b>
            </div>
          </div>
        </div>

        <!-- Donut Composition Chart (1 Col) -->
        <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
          <div class="pb-3 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Komposisi Presensi Guru</h3>
              </div>
              <span class="text-[10.5px] font-mono font-bold text-slate-400">Total: 42 Tendik</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Proporsi status presensi pendidik hari ini</p>
          </div>

          <!-- Donut Chart -->
          <div class="py-3 flex flex-col items-center justify-center">
            <AdminDonutChart
              :segments="donutSegments"
              center-text="42"
              caption="Total Guru"
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
                <span class="text-[11px] text-slate-400">({{ ((seg.value / 42) * 100).toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live RFID Stream Ticker -->
      <div class="bg-gradient-to-r from-slate-900 via-[#0A1F44] to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <AdminIcon name="check" size="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white tracking-wide">Live Stream RFID Card Tap Guru</span>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">Live</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium">Reader Ruang Guru & Gerbang Utama</p>
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
              <span class="text-[10px] text-slate-300 font-mono">{{ tap.role }} &bull; {{ tap.rfid }}</span>
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

      <!-- Rekap Kehadiran per Unit / Jabatan (Role Cards Matrix) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Rekap Kehadiran per Jabatan / Peran Pendidik</h3>
          <span class="text-xs font-medium text-slate-500">Klik unit untuk melihat rincian guru</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="r in roleSummaryMatrix"
            :key="r.role"
            class="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            @click="selectRoleAndGoDetail(r.role)"
          >
            <div class="flex items-start justify-between">
              <div>
                <b class="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors block">{{ r.role }}</b>
                <span class="text-[11px] text-slate-400 font-medium">{{ r.count }} Guru / Tendik</span>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {{ r.percentage }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1">
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div class="bg-emerald-500 h-full" :style="{ width: `${r.percentage}%` }" />
                <div class="bg-amber-400 h-full" :style="{ width: `${r.latePct}%` }" />
              </div>
              <div class="flex items-center justify-between text-[10.5px] font-mono font-semibold text-slate-500">
                <span>Hadir: {{ r.present }}/{{ r.total }}</span>
                <span>Terlambat: {{ r.late }}</span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Detail Unit</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SUBMENU 2: DETAIL KEHADIRAN (Role Nav, Filters, Table)        -->
    <!-- ============================================================= -->
    <div v-else-if="activeSubmenu === 'detail'" class="space-y-4 animate-fadeUp">
      <!-- Role / Unit Tab Navigator -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs space-y-2">
        <div class="flex items-center justify-between px-2 pt-1">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Jabatan / Peran:</span>
          <span class="text-xs font-bold text-blue-600">{{ selectedRole === 'Semua' ? 'Menampilkan Semua Pendidik & Tendik' : `Peran: ${selectedRole}` }}</span>
        </div>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border"
            :class="selectedRole === 'Semua'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
            @click="selectedRole = 'Semua'"
          >
            Semua ({{ rawTeachers.length }})
          </button>
          <button
            v-for="roleItem in roleOptions"
            :key="roleItem"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border"
            :class="selectedRole === roleItem
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
            @click="selectedRole = roleItem"
          >
            {{ roleItem }}
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
                <option value="name-asc">Nama Guru (A-Z)</option>
                <option value="name-desc">Nama Guru (Z-A)</option>
                <option value="status">Status Presensi</option>
              </select>
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</span>
            </div>

            <!-- Search Box -->
            <div class="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus-within:border-blue-600 shadow-sm transition-colors">
              <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
              <input
                v-model.trim="searchQuery"
                placeholder="Cari nama guru, NIP, mapel, atau ID RFID..."
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
                <th class="py-3.5 px-4">Guru / Tendik</th>
                <th class="py-3.5 px-4">NIP & RFID</th>
                <th class="py-3.5 px-4">Mata Pelajaran</th>
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
                <!-- Guru / Tendik -->
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
                      <span class="text-[11px] text-slate-400 font-medium">{{ item.level }} &bull; {{ item.school }}</span>
                    </div>
                  </div>
                </td>

                <!-- NIP & RFID -->
                <td class="py-3.5 px-4">
                  <div class="font-mono text-slate-700 font-semibold text-xs">{{ item.nip }}</div>
                  <div class="inline-flex items-center gap-1 text-[10.5px] font-mono text-slate-400">
                    <span class="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">RFID</span>
                    <span>{{ item.rfidUid }}</span>
                  </div>
                </td>

                <!-- Mata Pelajaran -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50 inline-block">
                    {{ item.subject }}
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
                    @click="openTeacherDetail(item)"
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
                  <div class="text-slate-600 font-bold text-sm">Tidak ada data pendidik yang sesuai filter</div>
                  <p class="text-xs text-slate-400">Coba sesuaikan kata kunci pencarian atau reset filter peran/status.</p>
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
            Menampilkan <b class="text-slate-800">{{ pagedRows.length }}</b> dari <b class="text-slate-800">{{ filteredRows.length }}</b> guru & tendik
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

    <!-- Teacher Detail Modal (Teleported to Body) -->
    <Teleport to="body">
      <div
        v-if="selectedTeacher"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
        @click.self="closeTeacherDetail"
      >
        <div class="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6 animate-scaleUp">
          <!-- Modal Header -->
          <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <span
                class="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md"
                :class="avatarGradient(selectedTeacher.id)"
              >
                {{ initials(selectedTeacher.name) }}
              </span>
              <div>
                <h3 class="text-base font-black text-slate-900 leading-tight">{{ selectedTeacher.name }}</h3>
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span class="font-mono font-semibold text-slate-700">NIP: {{ selectedTeacher.nip }}</span>
                  <span>&bull;</span>
                  <span class="font-bold text-blue-600">{{ selectedTeacher.level }}</span>
                </div>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition-colors shrink-0"
              type="button"
              @click="closeTeacherDetail"
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
                :class="pillClass(selectedTeacher.status)"
              >
                <span class="w-2 h-2 rounded-full" :class="dotClass(selectedTeacher.status)" />
                <span>{{ selectedTeacher.status }}</span>
              </span>
            </div>
            <div class="text-left sm:text-right font-mono text-xs">
              <span class="text-[11px] font-sans font-semibold text-slate-500 block">Waktu Tap RFID:</span>
              <b class="text-slate-900 text-sm font-bold">{{ selectedTeacher.timeIn || '—' }}</b>
              <span v-if="selectedTeacher.timeOut" class="text-slate-500 font-sans text-[11px]"> (Keluar: {{ selectedTeacher.timeOut }})</span>
            </div>
          </div>

          <!-- RFID Card Info Card -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span class="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">UID Kartu RFID Guru</span>
              <b class="text-slate-900 font-mono text-xs">{{ selectedTeacher.rfidUid }}</b>
              <span class="text-[10px] text-emerald-600 font-bold block mt-1">● Status: Terdaftar Aktif</span>
            </div>
            <div class="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span class="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">Mata Pelajaran Binaan</span>
              <b class="text-slate-900 text-xs">{{ selectedTeacher.subject }}</b>
              <span class="text-[10px] text-slate-500 font-mono block mt-1">Unit: {{ selectedTeacher.school }}</span>
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

          <!-- Manual Status Adjustment by Super Admin -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Penyesuaian Manual Status</h4>
              <span class="text-[10.5px] text-slate-400">Super Administrator</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="st in ['Hadir', 'Izin', 'Sakit', 'Alpa']"
                :key="st"
                type="button"
                class="py-2 px-2.5 rounded-xl text-xs font-bold border transition-all"
                :class="selectedTeacher.status === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'"
                @click="updateTeacherStatus(st)"
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
              @click="closeTeacherDetail"
            >
              Tutup
            </button>
            <button
              class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
              type="button"
              @click="saveTeacherDetail"
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
  name: 'admin-absensi-guru'
})

const activeGrade = useAdminGrade()

const title = 'Absensi Guru'
const subtitle = 'Senin, 05 Okt 2026 · Rekap Presensi & Data Tap RFID Pendidik & Tenaga Kependidikan Realtime'

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
    case 'harian': return '06:00 - 07:30 WIB'
    case 'mingguan': return 'Senin - Jumat'
    case 'bulanan': return 'Oktober 2026'
  }
})

// KPI Overview Cards Data
const summaryCards = computed(() => [
  {
    label: 'Hadir Tepat Waktu',
    value: '38',
    sub: '≤ 06:45',
    note: 'Tap tepat waktu via RFID',
    rate: '90.5%'
  },
  {
    label: 'Terlambat',
    value: '2',
    sub: '06:46-07:00',
    note: 'Total 25 mnt akumulasi',
    rate: '4.8%'
  },
  {
    label: 'Izin & Sakit / Cuti',
    value: '2',
    sub: 'Surat Terlampir',
    note: '1 Izin Dinas · 1 Sakit',
    rate: '4.8%'
  },
  {
    label: 'Alpa / Belum Hadir',
    value: '0',
    sub: '> 07:00',
    note: 'Semua terdata hadir/izin',
    rate: '0.0%'
  }
])

// Role Summary Matrix for Overview
const roleSummaryMatrix = [
  { role: 'Guru Utama', count: 12, present: 12, total: 12, percentage: 100, late: 0, latePct: 0 },
  { role: 'Wali Kelas', count: 12, present: 11, total: 12, percentage: 91.7, late: 1, latePct: 8.3 },
  { role: 'Kaprog', count: 6, present: 5, total: 6, percentage: 83.3, late: 1, latePct: 16.7 },
  { role: 'Tendik', count: 12, present: 12, total: 12, percentage: 100, late: 0, latePct: 0 }
]

const selectRoleAndGoDetail = (roleName: string) => {
  selectedRole.value = roleName
  activeSubmenu.value = 'detail'
}

// Chart Trend Data based on selectedPeriod
const trendLabels = computed(() => {
  if (selectedPeriod.value === 'harian') {
    return ['06:00', '06:15', '06:30', '06:45', '07:00', '07:15']
  }
  if (selectedPeriod.value === 'mingguan') {
    return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  }
  return ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4']
})

const trendSeries = computed(() => {
  if (selectedPeriod.value === 'harian') {
    return [
      { name: 'Tepat Waktu', color: '#10B981', values: [15, 60, 88, 90.5, 90.5, 90.5] },
      { name: 'Terlambat', color: '#F59E0B', values: [0, 0, 2.4, 4.8, 4.8, 4.8] }
    ]
  }
  if (selectedPeriod.value === 'mingguan') {
    return [
      { name: 'Tepat Waktu', color: '#10B981', values: [90.5, 95.2, 92.8, 97.6, 95.2] },
      { name: 'Terlambat', color: '#F59E0B', values: [4.8, 2.4, 4.8, 0, 2.4] }
    ]
  }
  return [
    { name: 'Tepat Waktu', color: '#10B981', values: [95.2, 94.0, 96.8, 95.8] },
    { name: 'Terlambat', color: '#F59E0B', values: [2.8, 3.5, 1.8, 2.4] }
  ]
})

// Donut Chart Breakdown
const donutSegments = computed(() => [
  { label: 'Tepat Waktu', value: 38, color: '#10B981' },
  { label: 'Terlambat', value: 2, color: '#F59E0B' },
  { label: 'Izin Dinas', value: 1, color: '#3B82F6' },
  { label: 'Sakit', value: 1, color: '#06B6D4' },
  { label: 'Alpa', value: 0, color: '#F43F5E' }
])

// Recent Live Taps for Teachers
const recentTaps = ref([
  { id: 't1', name: 'Drs. H. Ahmad Dahlan', role: 'Guru Utama', rfid: 'RFID-T01-PAI', time: '06:18:40', status: 'Tepat Waktu', gate: 'Ruang Guru' },
  { id: 't2', name: 'Siti Aminah, S.Pd', role: 'Wali Kelas VII-A', rfid: 'RFID-T02-MTK', time: '06:25:12', status: 'Tepat Waktu', gate: 'Gerbang Utama' },
  { id: 't3', name: 'Bambang Supriyanto, M.Kom', role: 'Kaprog RPL', rfid: 'RFID-T03-RPL', time: '06:52:05', status: 'Terlambat', gate: 'Ruang Guru' }
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
const selectedRole = ref('Semua')
const roleOptions = ['Guru Utama', 'Wali Kelas', 'Kaprog', 'Tendik']

const selectedSort = ref('time-desc')
const searchQuery = ref('')
const selectedStatus = ref('Semua')

interface TeacherAttendance {
  id: string
  name: string
  nip: string
  rfidUid: string
  school: 'SMK' | 'SMP'
  subject: string
  level: string
  gender: 'Laki-laki' | 'Perempuan'
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'
  timeIn: string | null
  timeOut: string | null
  lateMinutes?: number
  gate?: string
}

// Teacher Attendance Dataset
const rawTeachers = ref<TeacherAttendance[]>([
  { id: '1', name: 'Drs. H. Ahmad Dahlan', nip: '197508122000031001', rfidUid: 'RFID-GUR-1001', school: 'SMK', subject: 'Pendidikan Agama Islam', level: 'Guru Utama', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:18', timeOut: '15:45', gate: 'Ruang Guru' },
  { id: '2', name: 'Siti Aminah, S.Pd', nip: '198204152008012003', rfidUid: 'RFID-GUR-1002', school: 'SMP', subject: 'Matematika', level: 'Wali Kelas VII-A', gender: 'Perempuan', status: 'Hadir', timeIn: '06:25', timeOut: '14:45', gate: 'Gerbang Utama' },
  { id: '3', name: 'Bambang Supriyanto, M.Kom', nip: '198901202015041002', rfidUid: 'RFID-GUR-1003', school: 'SMK', subject: 'Pemrograman Web', level: 'Kaprog RPL', gender: 'Laki-laki', status: 'Terlambat', timeIn: '06:52', timeOut: '16:00', lateMinutes: 7, gate: 'Ruang Guru' },
  { id: '4', name: 'Rini Astuti, S.Pd', nip: '199105102019032005', rfidUid: 'RFID-GUR-1004', school: 'SMK', subject: 'Bahasa Indonesia', level: 'Guru Mapel', gender: 'Perempuan', status: 'Hadir', timeIn: '06:30', timeOut: '15:30', gate: 'Ruang Guru' },
  { id: '5', name: 'Hendra Gunawan, S.Kom', nip: '198711032014021004', rfidUid: 'RFID-GUR-1005', school: 'SMK', subject: 'Jaringan Komputer', level: 'Kaprog TKJ', gender: 'Laki-laki', status: 'Izin', timeIn: null, timeOut: null },
  { id: '6', name: 'Dewi Lestari, S.Pd', nip: '199402182020122008', rfidUid: 'RFID-GUR-1006', school: 'SMK', subject: 'Bahasa Inggris', level: 'Wali Kelas X RPL 1', gender: 'Perempuan', status: 'Hadir', timeIn: '06:22', timeOut: '15:30', gate: 'Ruang Guru' },
  { id: '7', name: 'Eko Prasetyo, S.Pd', nip: '199009252016081003', rfidUid: 'RFID-GUR-1007', school: 'SMP', subject: 'Pendidikan Jasmani', level: 'Guru Mapel', gender: 'Laki-laki', status: 'Terlambat', timeIn: '06:58', timeOut: '14:30', lateMinutes: 13, gate: 'Gerbang Utama' },
  { id: '8', name: 'Nurul Hidayati, S.Si', nip: '198807142012012002', rfidUid: 'RFID-GUR-1008', school: 'SMP', subject: 'Ilmu Pengetahuan Alam', level: 'Wali Kelas VIII-B', gender: 'Perempuan', status: 'Sakit', timeIn: null, timeOut: null },
  { id: '9', name: 'Fajar Nugroho, S.Pd', nip: '199304122021011005', rfidUid: 'RFID-GUR-1009', school: 'SMK', subject: 'Basis Data', level: 'Guru Mapel', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:15', timeOut: '15:30', gate: 'Ruang Guru' },
  { id: '10', name: 'Kurniawati, S.E', nip: '198506192010012004', rfidUid: 'RFID-GUR-1010', school: 'SMK', subject: 'Administrasi Keuangan', level: 'Tendik', gender: 'Perempuan', status: 'Hadir', timeIn: '06:28', timeOut: '16:00', gate: 'Ruang TU' }
])

// Dynamic Status Filter Options with Counts
const statusFilterOptions = computed(() => {
  const list = rawTeachers.value
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
  let list = rawTeachers.value.filter(item => {
    // School Filter
    if (selectedGradeFilter.value !== 'Semua' && item.school !== selectedGradeFilter.value) {
      return false
    }
    // Role Filter
    if (selectedRole.value !== 'Semua') {
      if (!item.level.includes(selectedRole.value)) return false
    }
    // Status Filter
    if (selectedStatus.value !== 'Semua' && item.status !== selectedStatus.value) {
      return false
    }
    // Search Query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchNip = item.nip.includes(q)
      const matchSub = item.subject.toLowerCase().includes(q)
      const matchRfid = item.rfidUid.toLowerCase().includes(q)
      if (!matchName && !matchNip && !matchSub && !matchRfid) return false
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
watch([searchQuery, selectedStatus, selectedRole, selectedGradeFilter, selectedSort], () => {
  currentPage.value = 1
})

// Reset Filters Action
const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'Semua'
  selectedRole.value = 'Semua'
  selectedGradeFilter.value = 'Semua'
  currentPage.value = 1
}

// Teacher Detail Modal Handling
const selectedTeacher = ref<TeacherAttendance | null>(null)

const attendanceHistoryMock = [
  { day: 'Senin', status: 'Hadir', time: '06:18' },
  { day: 'Jumat', status: 'Hadir', time: '06:22' },
  { day: 'Kamis', status: 'Hadir', time: '06:25' },
  { day: 'Rabu', status: 'Terlambat', time: '06:50' },
  { day: 'Selasa', status: 'Hadir', time: '06:20' }
]

const openTeacherDetail = (item: TeacherAttendance) => {
  selectedTeacher.value = { ...item }
}

const closeTeacherDetail = () => {
  selectedTeacher.value = null
}

const updateTeacherStatus = (newStatus: any) => {
  if (selectedTeacher.value) {
    selectedTeacher.value.status = newStatus
    if (newStatus === 'Hadir' && !selectedTeacher.value.timeIn) {
      selectedTeacher.value.timeIn = '06:25'
    } else if (newStatus === 'Terlambat') {
      selectedTeacher.value.timeIn = '06:52'
      selectedTeacher.value.lateMinutes = 7
    } else if (['Izin', 'Sakit', 'Alpa'].includes(newStatus)) {
      selectedTeacher.value.timeIn = null
      selectedTeacher.value.timeOut = null
    }
  }
}

const saveTeacherDetail = () => {
  if (selectedTeacher.value) {
    const idx = rawTeachers.value.findIndex(s => s.id === selectedTeacher.value?.id)
    if (idx !== -1) {
      rawTeachers.value[idx] = { ...selectedTeacher.value }
    }
    alert(`Status presensi guru ${selectedTeacher.value.name} berhasil diperbarui menjadi ${selectedTeacher.value.status}.`)
    closeTeacherDetail()
  }
}

// Helpers & Formatters
const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.E\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarGradient = (id: string) => {
  const gradients = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-blue-500 to-cyan-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-purple-500 to-pink-600'
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
  const headers = ['No', 'NIP', 'Nama Guru / Tendik', 'Jenjang', 'Mata Pelajaran', 'Jabatan / Peran', 'Gender', 'ID Kartu RFID', 'Jam Masuk', 'Jam Keluar', 'Status Presensi', 'Keterangan']
  const rows = filteredRows.value.map((s, i) => [
    i + 1,
    `"${s.nip}"`,
    `"${s.name}"`,
    s.school,
    `"${s.subject}"`,
    `"${s.level}"`,
    s.gender,
    `"${s.rfidUid}"`,
    s.timeIn || '-',
    s.timeOut || '-',
    s.status,
    s.status === 'Terlambat' ? `Terlambat ${s.lateMinutes || 0} menit` : '-'
  ])

  const csvContent = '\uFEFF' + [
    `Rekap Presensi Guru & Tenaga Kependidikan - ${selectedDay.value} (${selectedPeriod.value.toUpperCase()})`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `rekap_absensi_guru_${selectedPeriod.value}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
