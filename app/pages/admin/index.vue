<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-2">
          <span>Selamat {{ greetingTime }}, <span class="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Administrator</span></span>
          <span
            class="text-xs font-bold text-white px-2.5 py-1 rounded-lg tracking-wider shadow-sm"
            :class="grade === 'SMP' ? 'bg-emerald-600' : 'bg-blue-600'"
          >
            {{ grade }}
          </span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{{ currentDate }} &bull; Data {{ activeData.schoolName }} &bull; Ringkasan operasional sekolah hari ini.</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          @click="showReportToast"
        >
          <AdminIcon name="dl" size="16" class="text-slate-500" />
          <span>Unduh Laporan</span>
        </button>
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          @click="showQuickActionToast"
        >
          <AdminIcon name="plus" size="16" />
          <span>Aksi Cepat</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards Grid with Sweep Shine, Radial Geometry, and Sparklines -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- KPI 1: Total Siswa -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-[0_14px_30px_-14px_rgba(30,64,175,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(30,64,175,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        title="Buka Total Siswa"
        @click="$router.push('/admin/kelas')"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />
        
        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="users" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <AdminIcon name="tup" size="12" />
            <span>{{ activeData.kpi.siswaBaru }}</span>
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ activeData.kpi.totalSiswa }}</div>
        <div class="text-xs font-semibold text-blue-100 relative z-10">Total Siswa Terdaftar</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[280, 290, 295, 305, 310, 314, 316]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>
      
      <!-- KPI 2: Guru & Tendik -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-[0_14px_30px_-14px_rgba(91,33,182,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(91,33,182,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:70ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        title="Buka Guru & Tendik"
        @click="$router.push('/admin/absensi-guru')"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="ucheck" size="22" />
          </span>
          <span class="text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            {{ activeData.kpi.guruTendik }}
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ activeData.kpi.totalGuru }}</div>
        <div class="text-xs font-semibold text-purple-100 relative z-10">Guru &amp; Tenaga Kependidikan</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[38, 39, 40, 40, 41, 42, 42]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>
      
      <!-- KPI 3: Kehadiran Hari Ini -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-[0_14px_30px_-14px_rgba(6,95,70,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(6,95,70,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:140ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        title="Buka Kehadiran Hari Ini"
        @click="$router.push('/admin/absensi-siswa')"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="cal" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            {{ activeData.kpi.absenDetail }}
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ activeData.kpi.kehadiranSiswa }}</div>
        <div class="text-xs font-semibold text-emerald-100 relative z-10">Kehadiran Siswa Hari Ini</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[88, 91, 89, 93, 90, 94, 92]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>
      
      <!-- KPI 4: Pemasukan Bulan Ini -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-[0_14px_30px_-14px_rgba(146,64,14,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(146,64,14,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:210ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        title="Buka Pemasukan Bulan Ini"
        @click="$router.push('/admin/keuangan')"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="wallet" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <AdminIcon name="tup" size="12" />
            <span>{{ activeData.kpi.pemasukanDelta }}</span>
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ activeData.kpi.pemasukanBulan }}</div>
        <div class="text-xs font-semibold text-amber-100 relative z-10">Pemasukan Bulan Ini</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[18, 20, 21, 22, 23.5, 24.5]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>
    </div>

    <!-- Charts Row with Interactive SVG -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart 1: Tren Kehadiran Siswa (Interactive SVG Line Chart) -->
      <div class="lg:col-span-2 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Tren Kehadiran Siswa
            </h3>
            <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Persentase kehadiran 7 hari terakhir</div>
          </div>
          <div class="flex items-center gap-4 text-xs font-bold">
            <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-full bg-[#2563eb] inline-block shadow-sm"></i>SMP</span>
            <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-full bg-[#8b5cf6] inline-block shadow-sm"></i>SMK</span>
          </div>
        </div>

        <div class="py-4">
          <AdminLineChart
            :labels="['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Hari Ini']"
            :series="attendanceSeries"
          />
        </div>
      </div>
      
      <!-- Chart 2: Arus Kas (Interactive SVG Bar Chart) -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
              Arus Kas
            </h3>
            <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Pemasukan vs Pengeluaran &bull; 6 bulan</div>
          </div>
        </div>

        <div class="py-2">
          <AdminBarChart
            :labels="['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt']"
            :datasets="cashflowDatasets"
          />
        </div>

        <div class="flex items-center justify-center gap-6 text-xs font-bold pt-3 border-t border-slate-100">
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#16a34a] inline-block shadow-sm"></i>Masuk</span>
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#f59e0b] inline-block shadow-sm"></i>Keluar</span>
        </div>
      </div>
    </div>

    <!-- Section 3 Column Cards with Donut and Dynamic Lists -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Komposisi Siswa (Interactive Donut Chart) -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-indigo-500 before:to-purple-600 before:shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
            Komposisi Siswa
          </h3>
        </div>

        <div class="py-3">
          <AdminDonutChart
            :segments="[
              { label: 'SMP IT Bina Cendekia Assalam', value: 210, color: '#2563eb' },
              { label: 'SMK IT Attaqwa 9', value: 316, color: '#8b5cf6' }
            ]"
            :center-text="526"
            caption="Total Siswa"
          />
        </div>

        <div class="flex items-center justify-center gap-5 text-xs font-bold pt-4 border-t border-slate-100">
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-full bg-[#2563eb] inline-block"></i>SMP &bull; 210</span>
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-full bg-[#8b5cf6] inline-block"></i>SMK &bull; 316</span>
        </div>
      </div>
      
      <!-- Card 2: Ujian CBT Terdekat -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-amber-500 before:to-orange-600 before:shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
              Ujian CBT
            </h3>
            <div class="text-xs text-slate-500 ml-3.5 font-medium">Jadwal terdekat</div>
          </div>
          <button
            class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            @click="$router.push('/admin/cbt')"
          >
            Kelola
          </button>
        </div>

        <div class="divide-y divide-slate-100 space-y-2">
          <div class="flex items-center gap-3 pt-2 group hover:bg-slate-50 p-2 rounded-xl transition-all">
            <span class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <AdminIcon name="monitor" size="18" />
            </span>
            <div class="flex-1 min-w-0">
              <b class="text-xs font-bold text-slate-900 block truncate">Informatika</b>
              <span class="text-[11px] text-slate-500 font-medium">X RPL 1 &bull; 08:00 - 09:30</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase tracking-wider">Menunggu</span>
          </div>

          <div class="flex items-center gap-3 pt-2 group hover:bg-slate-50 p-2 rounded-xl transition-all">
            <span class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center shrink-0">
              <AdminIcon name="monitor" size="18" />
            </span>
            <div class="flex-1 min-w-0">
              <b class="text-xs font-bold text-slate-900 block truncate">Pemrograman Web</b>
              <span class="text-[11px] text-slate-500 font-medium">XI RPL 2 &bull; Berlangsung</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase tracking-wider">Berjalan</span>
          </div>
          
          <div class="flex items-center gap-3 pt-2 group hover:bg-slate-50 p-2 rounded-xl transition-all">
            <span class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <AdminIcon name="monitor" size="18" />
            </span>
            <div class="flex-1 min-w-0">
              <b class="text-xs font-bold text-slate-900 block truncate">Matematika</b>
              <span class="text-[11px] text-slate-500 font-medium">IX-A &bull; Selesai</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Selesai</span>
          </div>
        </div>
      </div>
      
      <!-- Card 3: Aktivitas Terbaru -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-cyan-500 before:to-blue-600 before:shadow-[0_2px_8px_rgba(6,182,212,0.4)]">
              Aktivitas Terbaru
            </h3>
            <div class="text-xs text-slate-500 ml-3.5 font-medium">Jejak audit sistem</div>
          </div>
          <button
            class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            @click="$router.push('/admin/log')"
          >
            Semua
          </button>
        </div>

        <div class="divide-y divide-slate-100 space-y-2">
          <div class="flex items-start gap-3 pt-2 p-1.5 rounded-xl hover:bg-slate-50 transition-all">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">BS</span>
            <div class="text-xs">
              <b class="text-slate-900">Budi Santoso</b> <span class="text-slate-500 font-medium">login ke sistem</span>
              <div class="text-[11px] text-slate-400 mt-0.5 font-mono">Sistem &bull; 10 menit lalu</div>
            </div>
          </div>

          <div class="flex items-start gap-3 pt-2 p-1.5 rounded-xl hover:bg-slate-50 transition-all">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">AS</span>
            <div class="text-xs">
              <b class="text-slate-900">Ahmad Subarjo</b> <span class="text-slate-500 font-medium">merubah jadwal ujian</span>
              <div class="text-[11px] text-slate-400 mt-0.5 font-mono">CBT &bull; 35 menit lalu</div>
            </div>
          </div>

          <div class="flex items-start gap-3 pt-2 p-1.5 rounded-xl hover:bg-slate-50 transition-all">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">SK</span>
            <div class="text-xs">
              <b class="text-slate-900">Siti Khadijah</b> <span class="text-slate-500 font-medium">input nilai Matematika</span>
              <div class="text-[11px] text-slate-400 mt-0.5 font-mono">Akademik &bull; 1 jam lalu</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Ekosistem Aplikasi -->
    <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div class="pb-4 border-b border-slate-100 mb-5">
        <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-600 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(37,99,235,0.4)]">
          Ekosistem Aplikasi
        </h3>
        <div class="text-xs text-slate-500 ml-3.5 font-medium">Status seluruh aplikasi yang dikelola dalam monorepo Darqia 9</div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- App 1: Web Profile -->
        <div class="border-2 border-slate-200/80 hover:border-blue-500 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white flex gap-3.5 items-start">
          <span class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <AdminIcon name="globe" size="22" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <b class="text-xs font-bold text-slate-900">Web Profile</b>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Online</span>
            </div>
            <div class="text-[11.5px] text-slate-500 mt-1 line-clamp-2">Website resmi, profil yayasan &amp; SPMB online</div>
            <div class="text-[10.5px] text-slate-400 font-mono mt-2 font-medium">v2.4.1 &bull; 12,4 rb kunjungan/bln</div>
          </div>
        </div>

        <!-- App 2: Aplikasi CBT -->
        <div class="border-2 border-slate-200/80 hover:border-purple-500 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white flex gap-3.5 items-start">
          <span class="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
            <AdminIcon name="monitor" size="22" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <b class="text-xs font-bold text-slate-900">Aplikasi CBT</b>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Online</span>
            </div>
            <div class="text-[11.5px] text-slate-500 mt-1 line-clamp-2">Ujian digital, anti kecurangan &amp; bank soal</div>
            <div class="text-[10.5px] text-slate-400 font-mono mt-2 font-medium">v1.8.0 &bull; 2 ujian aktif hari ini</div>
          </div>
        </div>

        <!-- App 3: Admin Portal -->
        <div class="border-2 border-slate-200/80 hover:border-emerald-500 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white flex gap-3.5 items-start">
          <span class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <AdminIcon name="grid" size="22" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <b class="text-xs font-bold text-slate-900">Admin Portal</b>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Online</span>
            </div>
            <div class="text-[11.5px] text-slate-500 mt-1 line-clamp-2">Pusat kendali akademik, keuangan &amp; RBAC</div>
            <div class="text-[10.5px] text-slate-400 font-mono mt-2 font-medium">v1.0.0 &bull; Nuxt 4 Monorepo</div>
          </div>
        </div>

        <!-- App 4: Absensi RFID -->
        <div class="border-2 border-slate-200/80 hover:border-amber-500 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-white flex gap-3.5 items-start">
          <span class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <AdminIcon name="ucheck" size="22" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <b class="text-xs font-bold text-slate-900">Absensi TV RFID</b>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Online</span>
            </div>
            <div class="text-[11.5px] text-slate-500 mt-1 line-clamp-2">Monitoring realtime tap kartu RFID siswa &amp; guru</div>
            <div class="text-[10.5px] text-slate-400 font-mono mt-2 font-medium">v1.1.0 &bull; 13 kelas terintegrasi</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useAdminData } from '~/composables/useAdminData'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
import AdminLineChart from '~/components/admin/AdminLineChart.vue'
import AdminBarChart from '~/components/admin/AdminBarChart.vue'
import AdminDonutChart from '~/components/admin/AdminDonutChart.vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-dashboard'
})

const grade = useAdminGrade()
const adminData = useAdminData()

const activeData = computed(() => adminData.getGradeData(grade.value))

const greetingTime = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'pagi'
  if (hour < 15) return 'siang'
  if (hour < 19) return 'sore'
  return 'malam'
})

const currentDate = computed(() => {
  const d = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
})

const attendanceSeries = computed(() => [
  { name: 'SMP', color: '#2563eb', values: [89, 91, 88, 93, 90, 94, 92] },
  { name: 'SMK', color: '#8b5cf6', values: [92, 94, 90, 95, 93, 96, 95] }
])

const cashflowDatasets = computed(() => [
  { name: 'Masuk', color: '#16a34a', values: [18.4, 21.2, 19.8, 22.5, 23.8, 24.5] },
  { name: 'Keluar', color: '#f59e0b', values: [12.1, 14.3, 13.0, 15.2, 16.4, 15.8] }
])

const showReportToast = () => {
  alert('Laporan harian berhasil diunduh (PDF / Excel).')
}

const showQuickActionToast = () => {
  alert('Aksi cepat: Silakan pilih menu di sidebar untuk input data, absensi, atau keuangan.')
}
</script>
