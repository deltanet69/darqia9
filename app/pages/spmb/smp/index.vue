<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
    <!-- ======= HEADER SPMB SMP ======= -->
    <header
      class="sticky top-0 z-40 w-full transition-all duration-300 border-b"
      :class="isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80 py-3.5' : 'bg-white border-transparent py-4'"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <NuxtLink to="/spmb" class="flex items-center gap-3 group" aria-label="Kembali ke portal SPMB">
          <img src="/asset/logo.png" alt="Logo SMP IT BCA" class="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105">
          <div>
            <b class="block text-base font-extrabold text-slate-900 leading-tight">SPMB Online</b>
            <small class="block text-xs font-semibold text-slate-500">SMP IT Bina Cendekia Assalam</small>
          </div>
        </NuxtLink>
        <div class="flex items-center gap-2.5">
          <button
            class="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-all duration-200"
            @click="openTrackModal"
          >
            Cek Status
          </button>
          <NuxtLink
            to="/"
            class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 rounded-xl transition-all duration-200"
          >
            Beranda
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <!-- ======= HERO SPMB SMP ======= -->
      <section class="relative overflow-hidden bg-gradient-to-b from-[#0F1E38] via-[#122748] to-[#0D192F] text-white py-14 sm:py-16">
        <div class="absolute -top-24 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 right-1/4 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-300 mb-4">
            Jenjang SMP • Tahun Ajaran 2027/2028
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            SPMB <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">SMP IT Bina Cendekia</span>
          </h1>
          <p class="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
            Formulir pendaftaran murid baru online resmi <strong class="text-white">SMP IT Bina Cendekia Assalam</strong> — isi formulir dengan teliti, tuntaskan pembayaran, dan simpan ID pendaftaranmu.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
              <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
              Biaya pendaftaran Rp300.000
            </span>
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
              <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>
              Online 24 Jam
            </span>
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
              Data Aman &amp; Terverifikasi
            </span>
          </div>
        </div>
      </section>

      <!-- ======= WIZARD SPMB SMP ======= -->
      <section class="py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6">
        <div ref="wizEl" class="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50">
          <!-- Step Indicator -->
          <ol class="grid grid-cols-3 gap-2 sm:gap-4 mb-8 pb-8 border-b border-slate-100">
            <li class="flex items-center gap-2.5 sm:gap-3.5" :class="step === 1 ? 'text-blue-600' : step > 1 ? 'text-emerald-600' : 'text-slate-400'">
              <span
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all"
                :class="step === 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'"
              >
                <svg v-if="step > 1" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                <template v-else>1</template>
              </span>
              <span class="text-xs sm:text-sm font-bold truncate">Data Siswa</span>
            </li>
            <li class="flex items-center gap-2.5 sm:gap-3.5" :class="step === 2 ? 'text-blue-600' : step > 2 ? 'text-emerald-600' : 'text-slate-400'">
              <span
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all"
                :class="step === 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'"
              >
                <svg v-if="step > 2" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                <template v-else>2</template>
              </span>
              <span class="text-xs sm:text-sm font-bold truncate">Data Orang Tua</span>
            </li>
            <li class="flex items-center gap-2.5 sm:gap-3.5" :class="step === 3 ? 'text-blue-600' : step > 3 ? 'text-emerald-600' : 'text-slate-400'">
              <span
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all"
                :class="step === 3 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100' : step > 3 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'"
              >
                <svg v-if="step > 3" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                <template v-else>3</template>
              </span>
              <span class="text-xs sm:text-sm font-bold truncate">Pembayaran</span>
            </li>
          </ol>

          <!-- Banner Keterangan Unit Sekolah -->
          <div class="mb-8 p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center gap-3 text-blue-900 text-xs sm:text-sm font-semibold">
            <svg class="w-5 h-5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>
            <span>Unit Terpilih: <strong class="text-blue-950 font-black">SMP IT Bina Cendekia Assalam</strong> (Khusus Lulusan SD / MI)</span>
          </div>

          <form @submit.prevent novalidate>
            <!-- STEP 1: DATA SISWA -->
            <fieldset v-show="step === 1" class="space-y-6">
              <div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-1.5">
                  <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                  Informasi Siswa Calon SMP
                </h2>
                <p class="text-xs sm:text-sm text-slate-500">Lengkapi data calon murid sesuai dokumen resmi (rapor SD/MI / Kartu Keluarga).</p>
              </div>

              <div class="space-y-5">
                <!-- Input Nama Lengkap -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap Siswa <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.s_nama"
                    @input="clearErr('s_nama')"
                    type="text"
                    placeholder="cth: Ahmad Fauzi Ramadhan"
                    autocomplete="name"
                    class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    :class="errs.s_nama ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                  >
                  <span v-if="errs.s_nama" class="block text-xs font-semibold text-red-600 mt-1">Nama lengkap wajib diisi.</span>
                </div>

                <!-- NISN & Jenis Kelamin Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      NISN (Nomor Induk Siswa Nasional) <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.s_nisn"
                      @input="clearErr('s_nisn'); numericOnly('s_nisn')"
                      type="text"
                      inputmode="numeric"
                      maxlength="10"
                      placeholder="10 digit NISN"
                      class="w-full px-4 py-3 text-sm font-mono bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.s_nisn ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.s_nisn" class="block text-xs font-semibold text-red-600 mt-1">NISN harus 10 digit angka.</span>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Jenis Kelamin <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-2.5">
                      <label
                        class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer font-bold text-xs sm:text-sm transition-all"
                        :class="form.s_jk === 'Laki-laki' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'"
                      >
                        <input type="radio" v-model="form.s_jk" value="Laki-laki" @change="clearErr('s_jk')" class="sr-only">
                        <span>Laki-laki</span>
                      </label>
                      <label
                        class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer font-bold text-xs sm:text-sm transition-all"
                        :class="form.s_jk === 'Perempuan' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'"
                      >
                        <input type="radio" v-model="form.s_jk" value="Perempuan" @change="clearErr('s_jk')" class="sr-only">
                        <span>Perempuan</span>
                      </label>
                    </div>
                    <span v-if="errs.s_jk" class="block text-xs font-semibold text-red-600 mt-1">Pilih jenis kelamin.</span>
                  </div>
                </div>

                <!-- Tempat & Tanggal Lahir Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tempat Lahir <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.s_tempat"
                      @input="clearErr('s_tempat')"
                      type="text"
                      placeholder="cth: Bekasi"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.s_tempat ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.s_tempat" class="block text-xs font-semibold text-red-600 mt-1">Tempat lahir wajib diisi.</span>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Lahir <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.s_tgl"
                      @input="clearErr('s_tgl')"
                      type="date"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.s_tgl ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.s_tgl" class="block text-xs font-semibold text-red-600 mt-1">Tanggal lahir wajib diisi.</span>
                  </div>
                </div>

                <!-- Kontak Siswa Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      No. HP Siswa / WhatsApp <span class="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      v-model="form.s_hp"
                      @input="clearErr('s_hp'); phoneOnly('s_hp')"
                      type="tel"
                      inputmode="tel"
                      placeholder="cth: 0812xxxxxxx"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    >
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Siswa <span class="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      v-model="form.s_email"
                      @input="clearErr('s_email')"
                      type="email"
                      inputmode="email"
                      placeholder="cth: nama@email.com"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    >
                  </div>
                </div>

                <!-- Sekolah Asal -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama SD / MI Asal <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.s_sekolah"
                    @input="clearErr('s_sekolah')"
                    type="text"
                    placeholder="cth: SDN Bahagia 01 / MI Attaqwa 15"
                    class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    :class="errs.s_sekolah ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                  >
                  <span v-if="errs.s_sekolah" class="block text-xs font-semibold text-red-600 mt-1">Nama SD/MI asal wajib diisi.</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alamat SD / MI Asal <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="form.s_alsekolah"
                    @input="clearErr('s_alsekolah')"
                    rows="3"
                    placeholder="Jalan, kelurahan, kecamatan, kabupaten/kota"
                    class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    :class="errs.s_alsekolah ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                  ></textarea>
                  <span v-if="errs.s_alsekolah" class="block text-xs font-semibold text-red-600 mt-1">Alamat sekolah asal wajib diisi.</span>
                </div>
              </div>
            </fieldset>

            <!-- STEP 2: DATA ORANG TUA / WALI -->
            <fieldset v-show="step === 2" class="space-y-6">
              <div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-1.5">
                  <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 15.2c2.3.3 4.3 1.7 5.5 4.3"/></svg>
                  Informasi Orang Tua / Wali
                </h2>
                <p class="text-xs sm:text-sm text-slate-500">Data orang tua/wali untuk keperluan administrasi dan komunikasi resmi sekolah.</p>
              </div>

              <div class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nama Lengkap Orang Tua / Wali <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.o_nama"
                      @input="clearErr('o_nama')"
                      type="text"
                      placeholder="Sesuai KTP/KK"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.o_nama ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.o_nama" class="block text-xs font-semibold text-red-600 mt-1">Nama wajib diisi.</span>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hubungan dengan Siswa <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.o_hub"
                      @change="clearErr('o_hub')"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.o_hub ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                      <option value="">— Pilih Hubungan —</option>
                      <option>Ayah</option>
                      <option>Ibu</option>
                      <option>Wali</option>
                    </select>
                    <span v-if="errs.o_hub" class="block text-xs font-semibold text-red-600 mt-1">Pilih hubungan keluarga.</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      NIK (Nomor Induk Kependudukan) <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.o_nik"
                      @input="clearErr('o_nik'); numericOnly('o_nik')"
                      type="text"
                      inputmode="numeric"
                      maxlength="16"
                      placeholder="16 digit NIK"
                      class="w-full px-4 py-3 text-sm font-mono bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.o_nik ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.o_nik" class="block text-xs font-semibold text-red-600 mt-1">NIK harus 16 digit angka.</span>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      No. HP / WhatsApp Aktif <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.o_hp"
                      @input="clearErr('o_hp'); phoneOnly('o_hp')"
                      type="tel"
                      inputmode="tel"
                      placeholder="cth: 0812xxxxxxx"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.o_hp ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.o_hp" class="block text-xs font-semibold text-red-600 mt-1">Nomor HP/WA wajib diisi dengan benar.</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Aktif Orang Tua <span class="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    v-model="form.o_email"
                    @input="clearErr('o_email')"
                    type="email"
                    inputmode="email"
                    placeholder="cth: orangtua@email.com"
                    class="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  >
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tempat Lahir Orang Tua <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.o_tempat"
                      @input="clearErr('o_tempat')"
                      type="text"
                      placeholder="cth: Bekasi"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.o_tempat ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.o_tempat" class="block text-xs font-semibold text-red-600 mt-1">Tempat lahir wajib diisi.</span>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Lahir Orang Tua <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.o_tgl"
                      @input="clearErr('o_tgl')"
                      type="date"
                      class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      :class="errs.o_tgl ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                    >
                    <span v-if="errs.o_tgl" class="block text-xs font-semibold text-red-600 mt-1">Tanggal lahir wajib diisi.</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alamat Tempat Tinggal <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="form.o_alamat"
                    @input="clearErr('o_alamat')"
                    rows="3"
                    placeholder="Jalan, RT/RW, kelurahan, kecamatan, kabupaten/kota, kode pos"
                    class="w-full px-4 py-3 text-sm bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    :class="errs.o_alamat ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-600'"
                  ></textarea>
                  <span v-if="errs.o_alamat" class="block text-xs font-semibold text-red-600 mt-1">Alamat tempat tinggal wajib diisi.</span>
                </div>
              </div>
            </fieldset>

            <!-- STEP 3: PEMBAYARAN -->
            <fieldset v-show="step === 3" class="space-y-6">
              <div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-1.5">
                  <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
                  Pembayaran Pendaftaran SMP
                </h2>
                <p class="text-xs sm:text-sm text-slate-500">Selesaikan pembayaran biaya formulir SPMB SMP IT Bina Cendekia Assalam, lalu unggah bukti pembayarannya.</p>
              </div>
              
              <!-- Total Box -->
              <div class="bg-gradient-to-r from-[#0A2A5C] to-[#1D4ED8] rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
                <div>
                  <small class="text-xs uppercase tracking-wider text-blue-200 font-semibold block mb-0.5">Total Biaya Pendaftaran</small>
                  <div class="text-2xl sm:text-3xl font-black tracking-tight font-mono">Rp300.000<span class="text-lg text-blue-200 font-normal">,-</span></div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm">SMP IT Bina Cendekia</span>
              </div>

              <!-- Payment Methods -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex gap-3.5 items-start">
                  <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 4l9 5.5"/><path d="M4.5 9.5V18M9.5 9.5V18M14.5 9.5V18M19.5 9.5V18M2.5 20.5h19"/></svg>
                  </div>
                  <div>
                    <b class="block text-sm font-extrabold text-slate-900 mb-0.5">Transfer Bank BSI</b>
                    <p class="text-xs text-slate-600 leading-relaxed">Nomor rekening resmi akan diinformasikan panitia SPMB. Konfirmasi ke <strong class="text-slate-800">021-88886776</strong>.</p>
                  </div>
                </div>

                <div class="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex gap-3.5 items-start">
                  <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z"/></svg>
                  </div>
                  <div>
                    <b class="block text-sm font-extrabold text-slate-900 mb-0.5">QRIS Terpadu</b>
                    <p class="text-xs text-slate-600 leading-relaxed">Pindai kode QRIS resmi sekolah yang akan dibagikan oleh panitia SPMB saat pendaftaran.</p>
                  </div>
                </div>
              </div>

              <!-- Upload File -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Upload Bukti Pembayaran <span class="text-red-500">*</span>
                </label>
                <label
                  class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center"
                  :class="errs.bukti ? 'border-red-500 bg-red-50/30' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 bg-slate-50'"
                >
                  <input type="file" accept="image/*,.pdf" @change="onFileChange" class="sr-only">
                  <svg class="w-8 h-8 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 10l5-5 5 5"/><path d="M4 20h16"/></svg>
                  <b class="text-sm font-bold text-slate-800">Klik untuk memilih file bukti transfer</b>
                  <small class="text-xs text-slate-500 mt-1">Foto/scan struk transfer (JPG, PNG, atau PDF) — maks. 5 MB</small>
                </label>

                <!-- Preview File -->
                <div v-if="filePreview" class="mt-3.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                  <img v-if="fileIsImg" :src="filePreview" alt="Pratinjau bukti" class="w-12 h-12 object-cover rounded-lg border border-blue-200">
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-slate-900 truncate">{{ fileName }}</div>
                    <div class="text-xs text-emerald-600 font-semibold mt-0.5">&#10003; File siap diunggah</div>
                  </div>
                </div>
                <span v-if="errs.bukti" class="block text-xs font-semibold text-red-600 mt-1.5">Bukti pembayaran wajib diunggah (maks. 5 MB).</span>
              </div>

              <!-- Checkbox Agreement -->
              <label
                class="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                :class="errs.agree ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'"
              >
                <input type="checkbox" v-model="form.agree" @change="clearErr('agree')" class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                <span class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Saya menyatakan bahwa seluruh data yang diisi adalah benar dan bersedia mengikuti seluruh tahapan SPMB SMP IT Bina Cendekia Assalam T.A 2027/2028. <b class="text-red-500">*</b>
                </span>
              </label>
            </fieldset>

            <!-- Navigation Buttons -->
            <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                class="px-5 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-200"
                :class="step > 1 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
                @click="prevStep"
              >
                Kembali
              </button>
              <button
                type="button"
                class="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all duration-200"
                @click="nextStep"
              >
                {{ step === 3 ? 'Kirim Pendaftaran SMP' : 'Lanjut' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>

    <!-- ======= FOOTER ======= -->
    <footer class="bg-white border-t border-slate-200 py-6 text-slate-600 text-xs sm:text-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <span>&copy; 2026 SMP IT Bina Cendekia Assalam — Babelan, Kab. Bekasi</span>
        <span>Butuh bantuan? <a href="tel:02188886776" class="font-bold text-blue-600 hover:underline">021-88886776</a></span>
      </div>
    </footer>

    <!-- ======= MODAL SUKSES ======= -->
    <div v-if="modalSuccess" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="msTitle">
      <div class="fixed inset-0" @click="modalSuccess = false"></div>
      <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 max-h-[90vh] overflow-y-auto">
        <button
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          @click="modalSuccess = false"
          aria-label="Tutup"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
        </div>

        <h2 id="msTitle" class="text-xl sm:text-2xl font-black text-slate-900 text-center tracking-tight mb-2">
          Pendaftaran SMP Berhasil!
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 text-center mb-6">
          Data pendaftaran calon murid SMP IT Bina Cendekia Assalam sudah kami terima. Panitia akan memverifikasi berkas dan pembayaran maksimal 1&times;24 jam.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center mb-5">
          <small class="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">ID Pendaftaran SMP</small>
          <div class="text-xl font-black text-blue-950 tracking-wider font-mono mb-2">{{ submittedReg.id }}</div>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all shadow-sm"
            @click="copyId"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>{{ copyText }}</span>
          </button>
        </div>

        <dl class="grid grid-cols-2 gap-2.5 text-xs mb-5">
          <div class="bg-slate-50 p-2.5 rounded-xl"><dt class="text-slate-500 font-medium">Jenjang</dt><dd class="font-bold text-slate-800 mt-0.5">{{ submittedReg.jenjang }}</dd></div>
          <div class="bg-slate-50 p-2.5 rounded-xl"><dt class="text-slate-500 font-medium">Nama Siswa</dt><dd class="font-bold text-slate-800 mt-0.5">{{ submittedReg.s_nama }}</dd></div>
          <div class="bg-slate-50 p-2.5 rounded-xl"><dt class="text-slate-500 font-medium">NISN</dt><dd class="font-bold text-slate-800 mt-0.5">{{ submittedReg.s_nisn }}</dd></div>
          <div class="bg-slate-50 p-2.5 rounded-xl"><dt class="text-slate-500 font-medium">SD / MI Asal</dt><dd class="font-bold text-slate-800 mt-0.5">{{ submittedReg.s_sekolah }}</dd></div>
          <div class="bg-slate-50 p-2.5 rounded-xl"><dt class="text-slate-500 font-medium">Orang Tua</dt><dd class="font-bold text-slate-800 mt-0.5">{{ submittedReg.o_nama }} ({{ submittedReg.o_hub }})</dd></div>
          <div class="bg-slate-50 p-2.5 rounded-xl"><dt class="text-slate-500 font-medium">No. WhatsApp</dt><dd class="font-bold text-slate-800 mt-0.5">{{ submittedReg.o_hp }}</dd></div>
        </dl>

        <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed mb-6">
          <strong>Simpan ID pendaftaranmu!</strong> Gunakan ID tersebut pada menu <strong>Cek Status</strong> untuk memantau proses verifikasi berkas pendaftaran.
        </div>

        <button
          class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          @click="modalSuccess = false"
        >
          Selesai
        </button>
      </div>
    </div>

    <!-- ======= MODAL CEK STATUS ======= -->
    <div v-if="modalTrack" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="mtTitle">
      <div class="fixed inset-0" @click="modalTrack = false"></div>
      <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10">
        <button
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          @click="modalTrack = false"
          aria-label="Tutup"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        <h2 id="mtTitle" class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
          Cek Status Pendaftaran SMP
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 mb-6">
          Masukkan ID pendaftaranmu untuk melihat progres verifikasi data.
        </p>

        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ID Pendaftaran (cth: SPMB27-SMP-XXXXXX)</label>
          <input
            v-model="trackQuery"
            @keydown.enter="doTrack"
            type="text"
            placeholder="SPMB27-SMP-XXXXXX"
            class="w-full px-4 py-3 text-sm font-semibold uppercase bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          >
        </div>

        <div class="mb-4">
          <button
            class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
            @click="doTrack"
          >
            Lacak Sekarang
          </button>
        </div>

        <div v-if="trackNotFound" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
          ID tidak ditemukan di perangkat ini. Pastikan ID sudah benar atau hubungi panitia SPMB.
        </div>
        
        <div v-if="trackResult" class="mt-6 pt-6 border-t border-slate-100">
          <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center mb-4">
            <small class="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">ID Pendaftaran</small>
            <div class="text-lg font-black text-blue-950 tracking-wider font-mono">{{ trackResult.id }}</div>
          </div>
          <dl class="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Nama Siswa</dt><dd class="font-bold text-slate-800 mt-0.5">{{ trackResult.s_nama }}</dd></div>
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Jenjang</dt><dd class="font-bold text-slate-800 mt-0.5">{{ trackResult.jenjang }}</dd></div>
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">SD / MI Asal</dt><dd class="font-bold text-slate-800 mt-0.5">{{ trackResult.s_sekolah }}</dd></div>
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Status</dt><dd class="font-bold text-blue-600 mt-0.5">{{ trackResult.status }}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpmbForm } from '~/composables/useSpmbForm'

definePageMeta({ layout: 'default' })

useHead({
  title: 'SPMB 2027/2028 — SMP IT Bina Cendekia Assalam',
  meta: [
    { name: 'description', content: 'Penerimaan Murid Baru SMP IT Bina Cendekia Assalam Babelan Tahun Ajaran 2027/2028.' }
  ]
})

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 40 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const {
  step,
  wizEl,
  form,
  filePreview,
  fileIsImg,
  fileName,
  errs,
  clearErr,
  numericOnly,
  phoneOnly,
  onFileChange,
  nextStep,
  prevStep,
  modalSuccess,
  submittedReg,
  copyText,
  copyId,
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
} = useSpmbForm('smp')
</script>
