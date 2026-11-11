<template>
  <section v-show="screen === 'exam'" class="min-h-screen pb-28 lg:pb-12 flex flex-col justify-between antialiased">
    <!-- Header Ujian Sticky & Modern -->
    <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      <!-- Banner Jika Waktu Ujian Dibekukan -->
      <div v-if="isTimerFrozen" class="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
        <svg class="w-4 h-4 text-amber-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Sesi ujian sedang dibekukan sementara oleh pengawas. Hitung mundur waktu dijeda.</span>
      </div>

      <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <!-- Informasi Mata Pelajaran -->
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 p-1 flex items-center justify-center shrink-0 shadow-2xs">
            <img src="/asset/logo.png" alt="Logo" class="w-full h-full object-contain">
          </div>
          <div class="min-w-0">
            <h1 class="text-sm sm:text-base font-black text-slate-900 leading-tight truncate tracking-tight">{{ exam?.subject }}</h1>
            <p class="text-[11px] sm:text-xs font-semibold text-slate-500 truncate mt-0.5">{{ exam?.name }}</p>
          </div>
        </div>

        <!-- Anti-Cheat Status & Live Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Status Anti-Cheat Pill -->
          <div
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border transition-colors shadow-2xs shrink-0 whitespace-nowrap"
            :class="violations > 0 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-800'"
          >
            <span class="relative flex h-2 w-2 shrink-0">
              <span v-if="violations > 0" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2" :class="violations > 0 ? 'bg-amber-500' : 'bg-emerald-500'" />
            </span>
            <span class="hidden xs:inline">Anti-Cheat</span>
            <span>{{ violations > 0 ? `(${violations}/3)` : 'Aktif' }}</span>
          </div>

          <!-- Tombol Simulasi Pelanggaran: Khusus Mode Dev -->
          <div v-if="isDev" class="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-1">Simulasi:</span>
            <button
              type="button"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 hover:bg-amber-50 border border-slate-200 cursor-pointer"
              @click="$emit('simulate-violation', 1)"
            >
              1. Peringatan
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 hover:bg-orange-50 border border-slate-200 cursor-pointer"
              @click="$emit('simulate-violation', 2)"
            >
              2. Waspada
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
              @click="$emit('simulate-violation', 3)"
            >
              3. Paksa Submit
            </button>
          </div>

          <!-- Indikator Simpan Otomatis -->
          <div class="flex items-center gap-1 text-[11px] font-bold text-slate-500 hidden sm:flex shrink-0" title="Status penyimpanan otomatis">
            <span class="relative flex h-2.5 w-2.5">
              <span v-if="isSaving" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isSaving ? 'bg-emerald-500' : 'bg-slate-300'" />
            </span>
            <span class="text-[10px] text-slate-400 font-semibold">{{ isSaving ? 'Menyimpan…' : 'Tersimpan' }}</span>
          </div>

          <!-- Timer Countdown Digital -->
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm shadow-xs transition-colors shrink-0 whitespace-nowrap"
            :class="remainingTime <= 300 && remainingTime > 0 ? 'bg-rose-600 text-white animate-pulse' : remainingTime <= 600 && remainingTime > 0 ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'"
          >
            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            <span class="tabular-nums tracking-wider">{{ fmtTime(remainingTime) }}</span>
          </div>
        </div>
      </div>

      <!-- Bilah Tab Kategori Soal (Anti Overlapping, Single Row Scrollable) -->
      <div class="border-t border-slate-100 bg-slate-50/80">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer active:scale-95"
            :class="s.id === curQuestion.sec ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : isSectionDone(s.id) ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
            @click="$emit('go-to-section', s.id)"
          >
            <span v-html="s.icon" class="w-3.5 h-3.5 flex items-center justify-center shrink-0"></span>
            <span class="shrink-0">{{ s.short }}</span>
            <span
              class="shrink-0 text-[10.5px] font-mono px-1.5 py-0.5 rounded-full"
              :class="s.id === curQuestion.sec ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'"
            >
              {{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Area Konten Pengerjaan Ujian -->
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-6 w-full flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Area Soal Utama -->
        <main class="lg:col-span-8 flex flex-col justify-between space-y-5 sm:space-y-6">
          <!-- Progress Pengerjaan Soal -->
          <div class="flex items-center justify-between gap-3 text-xs font-bold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span>Soal <b class="text-slate-900 font-black">{{ qIdx + 1 }}</b> dari <b class="text-slate-900 font-black">{{ totalQuestions }}</b></span>
            <div class="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div class="h-full bg-blue-600 rounded-full transition-all duration-300" :style="{ width: (answeredCount / totalQuestions * 100) + '%' }"></div>
            </div>
            <span class="tabular-nums font-mono text-blue-700 font-extrabold">{{ answeredCount }} terjawab</span>
          </div>

          <!-- Kartu Soal Utama -->
          <article class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
            <!-- Header Kartu Soal: Nomor, Jenis Soal & Tombol Ragu-ragu -->
            <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">{{ qIdx + 1 }}</span>
                <span class="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">{{ typeLabel(curQuestion) }}</span>
              </div>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95"
                :class="isFlagged(qIdx) ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'"
                @click="$emit('toggle-flag', qIdx)"
                title="Tandai ragu-ragu"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" :fill="isFlagged(qIdx) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <span>{{ isFlagged(qIdx) ? 'Ditandai Ragu' : 'Ragu-ragu' }}</span>
              </button>
            </div>

            <!-- Cerita bersama untuk soal esai bertipe soal cerita -->
            <div
              v-if="curQuestion.type === 'essay' && curQuestion.storyText"
              class="cbt-question-text p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed overflow-x-auto"
              :dir="isArabicText(curQuestion.storyText) ? 'rtl' : 'ltr'"
              :class="isArabicText(curQuestion.storyText) ? 'text-right font-serif text-lg leading-loose' : ''"
              v-html="renderKaTeXHtml(curQuestion.storyText)"
            />

            <!-- Teks Pertanyaan Soal (KaTeX & Arabic RTL Didukung Penuh) -->
            <div
              class="cbt-question-text text-base sm:text-lg font-medium text-slate-900 leading-relaxed overflow-x-auto"
              :dir="curQuestion.isRtl || isArabicText(curQuestion.text) ? 'rtl' : 'ltr'"
              :class="curQuestion.isRtl || isArabicText(curQuestion.text) ? 'text-right font-serif text-xl sm:text-2xl leading-loose py-2 text-slate-950' : ''"
              v-html="renderKaTeXHtml(curQuestion.text)"
            />

            <!-- Gambar Soal Ujian (Bila Ada) -->
            <div v-if="curQuestion.imageUrl" class="my-4">
              <img
                :src="curQuestion.imageUrl"
                alt="Foto Soal Ujian"
                class="max-h-72 w-auto rounded-2xl border border-slate-200 object-contain shadow-xs bg-slate-50 p-1"
              />
            </div>

            <!-- Pilihan Ganda Tunggal / Audio / Video -->
            <template v-if="curQuestion.type === 'single' || curQuestion.type === 'audio' || curQuestion.type === 'video'">
              <!-- Media Soal Interaktif (Audio/Video Player Standar & Keren) -->
              <CbtMediaPlayer
                v-if="curQuestion.type === 'audio' || curQuestion.type === 'video'"
                :key="curQuestion.id || qIdx"
                :type="curQuestion.type"
                :url="curQuestion.mediaUrl"
                :title="curQuestion.type === 'audio' ? curQuestion.audioTitle : curQuestion.videoTitle"
                @toast="$emit('toast', $event)"
              />

              <!-- Daftar Pilihan Jawaban -->
              <div class="space-y-3" v-if="curQuestion.options && curQuestion.options.length">
                <button
                  type="button"
                  v-for="(op, oi) in (curQuestion.options || [])"
                  :key="oi"
                  class="w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all duration-150 group cursor-pointer"
                  :class="isOptionSelected(qIdx, oi) ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-100 text-blue-950 font-medium' : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'"
                  @click="$emit('select-option', qIdx, oi)"
                >
                  <span
                    class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors"
                    :class="isOptionSelected(qIdx, oi) ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'"
                  >
                    {{ letters[oi] }}
                  </span>
                  <span
                    class="text-sm sm:text-base leading-relaxed pt-1 flex-1"
                    :dir="isArabicText(op) ? 'rtl' : 'ltr'"
                    :class="isArabicText(op) ? 'font-serif text-base' : ''"
                    v-html="renderKaTeXHtml(op)"
                  />
                </button>
              </div>
            </template>

            <!-- Pilihan Ganda Multi-Pilihan -->
            <template v-else-if="curQuestion.type === 'multiple'">
              <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
                <span>Soal ini memiliki <b>lebih dari satu</b> jawaban benar. Pilih semua jawaban yang menurutmu benar.</span>
              </div>
              <div class="space-y-3" v-if="curQuestion.options && curQuestion.options.length">
                <button
                  type="button"
                  v-for="(op, oi) in (curQuestion.options || [])"
                  :key="oi"
                  class="w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all duration-150 group cursor-pointer"
                  :class="isOptionSelected(qIdx, oi) ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-100 text-blue-950 font-medium' : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'"
                  @click="$emit('select-option', qIdx, oi)"
                >
                  <span
                    class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors"
                    :class="isOptionSelected(qIdx, oi) ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'"
                  >
                    {{ isOptionSelected(qIdx, oi) ? '✓' : letters[oi] }}
                  </span>
                  <span
                    class="text-sm sm:text-base leading-relaxed pt-1 flex-1"
                    :dir="isArabicText(op) ? 'rtl' : 'ltr'"
                    :class="isArabicText(op) ? 'font-serif text-base' : ''"
                    v-html="renderKaTeXHtml(op)"
                  />
                </button>
              </div>
            </template>

            <!-- Jawaban Singkat & Esai -->
            <template v-else-if="curQuestion.type === 'short' || curQuestion.type === 'essay'">
              <div class="space-y-2">
                <CbtRichQuestionEditor
                  v-if="curQuestion.type === 'essay'"
                  compact
                  :model-value="answers[qIdx] || ''"
                  @update:model-value="answers[qIdx] = $event; $emit('text-input')"
                />
                <textarea
                  v-else
                  v-model="answers[qIdx]"
                  @input="$emit('text-input')"
                  :rows="curQuestion.type === 'essay' ? 6 : 3"
                  :placeholder="curQuestion.placeholder || 'Tulis jawabanmu di sini...'"
                  :dir="curQuestion.isRtl || isArabicText(curQuestion.text) ? 'rtl' : 'ltr'"
                  class="w-full p-4 text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900"
                ></textarea>
                <div class="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span><b>{{ countWords(answers[qIdx]) }}</b> kata <template v-if="curQuestion.minWords">&bull; minimal {{ curQuestion.minWords }} kata</template></span>
                  <span>Jawaban tersimpan otomatis</span>
                </div>
              </div>
            </template>
          </article>
        </main>

        <!-- Sidebar Palet Soal Desktop -->
        <aside class="hidden lg:block lg:col-span-4 space-y-6">
          <div class="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm sticky top-36">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Navigasi Soal</h3>
            <p class="text-xs text-slate-500 mb-4">Klik nomor soal untuk berpindah pengerjaan.</p>

            <div class="grid grid-cols-5 gap-2 mb-6 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
              <button
                v-for="(_, i) in questions"
                :key="i"
                type="button"
                class="relative h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all border cursor-pointer active:scale-95"
                :class="i === qIdx ? 'border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-200' : isAnswered(i) ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50'"
                @click="$emit('go-to', i)"
              >
                {{ i + 1 }}
                <span v-if="isFlagged(i)" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-2xs"></span>
              </button>
            </div>

            <!-- Legenda Palet -->
            <div class="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600 mb-6">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
                <span>Sudah dijawab</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-white border border-slate-300 shrink-0"></span>
                <span>Belum dijawab</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span>Ditandai ragu-ragu</span>
              </div>
            </div>

            <!-- Tombol Periksa & Kumpulkan -->
            <button
              type="button"
              class="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md shadow-slate-900/20 transition-all cursor-pointer active:scale-95"
              @click="$emit('go-review')"
            >
              Periksa &amp; Kumpulkan Jawaban
            </button>
          </div>
        </aside>
      </div>
    </div>

    <!-- Navigasi Bawah FIXED DI BAWAH LAYAR (Persyaratan User) -->
    <div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] py-3 px-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <!-- Tombol Sebelumnya -->
        <button
          type="button"
          :disabled="qIdx === 0"
          class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-2 transition-all cursor-pointer active:scale-95"
          :class="qIdx === 0 ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'"
          @click="$emit('go-to', qIdx - 1)"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
          <span class="hidden xs:inline">Sebelumnya</span>
        </button>

        <!-- Tombol Drawer Daftar Soal Mobile -->
        <button
          type="button"
          class="lg:hidden px-3.5 py-2.5 rounded-2xl font-black text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-200/80"
          @click="$emit('open-mobile-palette')"
        >
          <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          <span class="font-mono">{{ qIdx + 1 }}/{{ totalQuestions }}</span>
        </button>

        <!-- Tombol Berikutnya / Selesai -->
        <button
          type="button"
          class="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          @click="$emit('next')"
        >
          <span>{{ qIdx === totalQuestions - 1 ? 'Periksa & Kumpulkan' : 'Berikutnya' }}</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>

    <!-- Bottom Sheet Drawer untuk Palet Soal di Mobile -->
    <div
      v-if="showMobilePalette"
      class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm lg:hidden transition-all"
      @click.self="$emit('update:showMobilePalette', false)"
    >
      <div class="bg-white rounded-t-3xl p-5 sm:p-6 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4">
        <!-- Handle Bar Top -->
        <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-1 mb-2" />

        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-sm font-black text-slate-900 uppercase">Navigasi Soal</h3>
            <p class="text-xs text-slate-500">Pilih nomor soal untuk berpindah</p>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
            @click="$emit('update:showMobilePalette', false)"
          >
            ✕
          </button>
        </div>

        <!-- Legenda Singkat -->
        <div class="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span>Dijawab</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-white border border-slate-300"></span><span>Belum</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Ragu</span></div>
        </div>

        <!-- Grid 5 Kolom Nomor Soal -->
        <div class="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1">
          <button
            v-for="(_, i) in questions"
            :key="i"
            type="button"
            class="relative h-11 rounded-xl font-black text-xs flex items-center justify-center border transition-all cursor-pointer active:scale-95"
            :class="i === qIdx ? 'border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-200' : isAnswered(i) ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-600'"
            @click="$emit('go-to', i); $emit('update:showMobilePalette', false)"
          >
            {{ i + 1 }}
            <span v-if="isFlagged(i)" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-2xs"></span>
          </button>
        </div>

        <!-- CTA Periksa & Kumpulkan -->
        <div class="pt-2">
          <button
            type="button"
            class="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
            @click="$emit('go-review'); $emit('update:showMobilePalette', false)"
          >
            Periksa &amp; Kumpulkan Jawaban
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QuestionItem, SectionItem } from '~/composables/useCbtExam'
import { renderKaTeXHtml, isArabicText } from '~/utils/cbtFormula'
import CbtMediaPlayer from '~/components/cbt/CbtMediaPlayer.vue'
import CbtRichQuestionEditor from '~/components/adminV2/cbt/CbtRichQuestionEditor.vue'

const isDev = import.meta.dev

defineProps<{
  screen: string
  exam?: { name: string; subject: string } | null
  grade: string
  remainingTime: number
  isSaving: boolean
  isTimerFrozen: boolean
  sections: SectionItem[]
  questions: QuestionItem[]
  curQuestion: QuestionItem
  totalQuestions: number
  qIdx: number
  answeredCount: number
  answers: Record<number, string>
  letters: string[]
  audioPlaying: boolean
  showMobilePalette: boolean
  fmtTime: (sec: number) => string
  isSectionDone: (secId: string) => boolean
  sectionDoneCount: (secId: string) => number
  secRange: (secId: string) => number[]
  typeLabel: (q: QuestionItem) => string
  violations?: number
  isFlagged: (idx: number) => boolean
  isAnswered: (idx: number) => boolean
  isOptionSelected: (qIdx: number, optIdx: number) => boolean
  countWords: (text?: string) => number
}>()

defineEmits<{
  (e: 'go-to-section', secId: string): void
  (e: 'toggle-flag', qIdx: number): void
  (e: 'toggle-audio', q: QuestionItem): void
  (e: 'toast', msg: string): void
  (e: 'select-option', qIdx: number, optIdx: number): void
  (e: 'text-input'): void
  (e: 'go-to', idx: number): void
  (e: 'open-mobile-palette'): void
  (e: 'update:showMobilePalette', val: boolean): void
  (e: 'next'): void
  (e: 'go-review'): void
  (e: 'simulate-violation', level?: number): void
}>()
</script>

<style scoped>
.cbt-question-text[dir='rtl'] {
  font-family: 'Traditional Arabic', 'Times New Roman', serif;
  font-size: 1.5rem;
  line-height: 2;
  text-align: right;
}
</style>