<template>
  <div class="cbt-page" :data-theme="store.grade">
    <!-- ==================== SCREEN 1 : LOGIN ==================== -->
    <section id="screen-login" class="screen" :class="{ active: screen === 'login' }">
      <div class="login-hero">
        <div class="wrap">
          <span class="pill">Prototipe Demo</span>
          <div class="brand-row" style="margin-top:18px">
            <div class="logo-mark"><span class="school-logo"></span></div>
            <div>
              <h1>{{ jenjangText }}</h1>
              <div class="sub">Computer Based Test &mdash; Ujian Online</div>
            </div>
          </div>
          <div class="hero-title">Ujian jadi lebih<br />mudah &amp; modern.</div>
          <div class="hero-desc">Kerjakan ujian langsung dari HP kamu. Jawaban tersimpan otomatis, kapan pun, di mana pun.</div>
        </div>
      </div>
      <div class="wrap">
        <div class="login-card">
          <h2>Masuk Ujian</h2>
          <div class="hint">Gunakan akun yang dibagikan panitia sebelum ujian dimulai.</div>
          <form @submit.prevent="doLogin" autocomplete="off">
            <div class="field">
              <label for="f-nis">Nomor Peserta / NIS</label>
              <input class="inp" v-model="loginForm.nis" id="f-nis" inputmode="numeric" placeholder="cth: 2024001234" />
            </div>
            <div class="field">
              <label for="f-pass">Kata Sandi</label>
              <input class="inp" v-model="loginForm.pass" id="f-pass" type="password" placeholder="Masukkan kata sandi" />
            </div>
            <div class="field">
              <label for="f-kode">Kode Ujian <span style="font-weight:500;color:var(--faint)">(opsional)</span></label>
              <input class="inp" v-model="loginForm.kode" id="f-kode" placeholder="cth: IF-1201" />
            </div>
            <button class="btn btn-primary" type="submit" style="margin-top:6px">Masuk
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>
          <a class="demo-link" href="#" @click.prevent="fillDemo">Isi otomatis untuk demo</a>
        </div>
      </div>
      <div class="login-foot">Butuh bantuan? Hubungi panitia ujian di ruang guru.<br />&copy; 2026 {{ jenjangText }}</div>
    </section>

    <!-- ==================== SCREEN 2 : DATA & KONFIRMASI ==================== -->
    <section id="screen-confirm" class="screen" :class="{ active: screen === 'confirm' }">
      <div class="topbar-simple">
        <div class="wrap">
          <div class="mini-logo"><span class="school-logo"></span></div>
          <div><div class="t1">{{ jenjangText }}</div><div class="t2">Verifikasi Data Ujian</div></div>
        </div>
      </div>
      <div class="wrap">
        <div class="page-head">
          <h2>Siap mengikuti ujian?</h2>
          <p>Periksa datamu dan baca tata tertib sebelum mulai.</p>
        </div>

        <div class="flow">
          <span class="fstep done"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><path d="M4.5 12.5l5 5L19.5 7"/></svg>Login</span>
          <span class="fbar done"></span>
          <span class="fstep now"><span class="fnum">2</span>Verifikasi</span>
          <span class="fbar"></span>
          <span class="fstep"><span class="fnum">3</span>Ujian</span>
        </div>

        <div class="cf-cols">
          <div class="cf-left">
            <div class="idcard">
              <div class="idcard-shine"></div>
              <div class="idcard-head">
                <div class="avatar xl">AF<span class="vbadge"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span></div>
                <div class="idcard-who">
                  <div class="idcard-kicker">Kartu Peserta Ujian</div>
                  <div class="nm">Ahmad Fauzi</div>
                  <div class="meta">NIS {{ loginForm.nis || '2024001234' }} &bull; XII TKJ 1</div>
                </div>
              </div>
              <div class="idcard-foot">
                <div><span>Token</span><b>ATQ-9X2K4M</b></div>
                <div><span>Ruang</span><b>Online</b></div>
                <div><span>Sesi</span><b>1</b></div>
              </div>
            </div>

            <div class="examcard">
              <div class="examcard-shine"></div>
              <div class="examcard-head"><span class="examcard-kicker">Informasi Ujian</span><span class="pulse"></span></div>
              <div class="examcard-grid">
                <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg></span><div><span class="k">Mata Pelajaran</span><span class="v">Informatika</span></div></div>
                <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span><div><span class="k">Materi</span><span class="v">Jaringan Komputer Dasar</span></div></div>
                <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg></span><div><span class="k">Tanggal</span><span class="v">30 Sep 2026</span></div></div>
                <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></span><div><span class="k">Durasi</span><span class="v">90 menit</span></div></div>
                <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg></span><div><span class="k">Jumlah Soal</span><span class="v">{{ totalQuestions }} soal</span></div></div>
                <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="10 8.5 15.5 12 10 15.5" fill="currentColor" stroke="none"/></svg></span><div><span class="k">Waktu Mulai</span><span class="v">08.00 WIB</span></div></div>
              </div>
              <div class="examcard-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z"/><path d="M8.8 12l2.3 2.3 4.2-4.6"/></svg><span>Jawaban <b>tersimpan otomatis setiap 10 detik</b> — aman walau halaman tidak sengaja ter-reload.</span></div>
            </div>
          </div>

          <div class="cf-right">
            <div class="card">
              <div class="sect-title">Bagian Soal <span class="hint">Ketuk untuk detail</span></div>
              <div class="secacc">
                <div v-for="(sec, i) in sections" :key="sec.id" class="acc" :class="{ open: openedAcc === sec.id }">
                  <button type="button" class="acc-head" @click="toggleAcc(sec.id)">
                    <span class="iico" :class="sec.tint" v-html="sec.icon"></span>
                    <span class="t">{{ sec.title }}</span><span class="n">{{ secRange(sec.id).length }} soal</span>
                    <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="acc-body"><div class="acc-body-in" v-html="sec.desc"></div></div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="sect-title">Tata Tertib Ujian</div>
              <ul class="rules2">
                <li><span class="rico c-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></span><span>Kerjakan tepat waktu — durasi ujian <b>90 menit</b> dan tidak bisa diperpanjang.</span></li>
                <li><span class="rico c-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9a14.5 14.5 0 0 1 19 0"/><path d="M5.8 12.6a9.8 9.8 0 0 1 12.4 0"/><path d="M9 16.2a5 5 0 0 1 6 0"/><circle cx="12" cy="19.4" r="1.5" fill="currentColor" stroke="none"/></svg></span><span>Pastikan <b>koneksi internet stabil</b> selama ujian berlangsung.</span></li>
                <li><span class="rico c-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c7 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3M6.6 6.6A16.9 16.9 0 0 0 2 12s3 7 10 7a10.3 10.3 0 0 0 5-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg></span><span>Kerjakan <b>secara mandiri</b>. Dilarang membuka catatan, aplikasi, atau tab lain.</span></li>
                <li><span class="rico c-rose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5L22 20H2z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor" stroke="none"/></svg></span><span>Pelanggaran tata tertib berakibat <b>nilai dibatalkan</b>.</span></li>
                <li><span class="rico c-indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.3l2.4 2.4 4.6-5.2"/></svg></span><span><b>Periksa kembali</b> semua jawaban sebelum menekan tombol kumpulkan.</span></li>
              </ul>
            </div>

            <label class="agree2">
              <input type="checkbox" v-model="agreeStart">
              <span class="abox"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
              <span class="atxt">Saya telah membaca tata tertib dan <b>siap mengikuti ujian dengan jujur</b>.</span>
            </label>

            <div class="cta-sticky">
              <button type="button" class="btn btn-primary btn-go" :disabled="!agreeStart" @click="startExam"><span>Mulai Ujian</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SCREEN 3 : UJIAN ==================== -->
    <section id="screen-exam" class="screen" :class="{ active: screen === 'exam' }">
      <div class="exam-sticky">
        <div class="exam-top">
          <div class="inner">
            <div class="exam-brand">
              <div class="mini-logo" style="width:46px;height:46px;border-radius:14px"><span class="school-logo"></span></div>
              <div><div class="t1">Informatika</div><div class="t2">Jaringan Komputer Dasar</div></div>
            </div>
            <span class="save-ind" title="Penyimpanan otomatis aktif"><span class="save-dot" :class="{ saving: isSaving }"></span></span>
            <span class="timer" :class="{ danger: remainingTime <= 300 && remainingTime > 0 }">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              <span>{{ fmtTime(remainingTime) }}</span>
            </span>
          </div>
        </div>

        <div class="tabs">
          <div class="inner">
            <button v-for="s in sections" :key="s.id" class="step" :class="{ active: s.id === curQuestion.sec, done: isSectionDone(s.id) }" @click="goToSection(s.id)">
              <span class="step-ico">
                <span v-html="s.icon"></span>
                <span class="step-check" v-if="isSectionDone(s.id)"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
              </span>
              <span class="step-tx">
                <span class="step-name">{{ s.short }}</span>
                <span class="step-sub">{{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}</span>
              </span>
              <span class="step-bar"><i :style="{ width: (sectionDoneCount(s.id) / secRange(s.id).length * 100) + '%' }"></i></span>
            </button>
          </div>
        </div>
      </div>

      <div class="exam-layout">
        <main>
          <div class="progress-row">
            <span class="lbl">Soal <b>{{ qIdx + 1 }}</b> dari <b>{{ totalQuestions }}</b></span>
            <div class="pbar"><i :style="{ width: (answeredCount / totalQuestions * 100) + '%' }"></i></div>
            <span class="lbl">{{ answeredCount }} terjawab</span>
          </div>

          <article class="qcard">
            <div class="q-head">
              <span class="q-num">{{ qIdx + 1 }}</span>
              <span class="q-type">{{ typeLabel(curQuestion) }}</span>
              <button class="q-flag" :class="{ on: isFlagged(qIdx) }" @click="toggleFlag(qIdx)" title="Tandai ragu-ragu" aria-label="Tandai ragu-ragu">
                <svg width="19" height="19" viewBox="0 0 24 24" :fill="isFlagged(qIdx) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
            <div class="q-text">{{ curQuestion.text }}</div>

            <!-- Single choice / Audio / Video options -->
            <template v-if="curQuestion.type === 'single' || curQuestion.type === 'audio' || curQuestion.type === 'video'">
              <!-- Audio card -->
              <div v-if="curQuestion.type === 'audio'" class="audio-card" :class="{ playing: audioPlaying }">
                <div class="audio-top">
                  <button class="play-btn" @click="toggleAudio(curQuestion)" aria-label="Putar audio">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>
                  </button>
                  <div class="audio-meta">
                    <div class="a1">{{ curQuestion.audioTitle }}</div>
                    <div class="a2">{{ curQuestion.audioSub }}</div>
                  </div>
                </div>
                <div class="eq"><i v-for="n in 28" :key="n"></i></div>
                <div class="audio-note">Ketuk tombol putar untuk mendengarkan. Audio dapat diputar ulang.</div>
              </div>

              <!-- Video card -->
              <div v-if="curQuestion.type === 'video'" class="video-ph">
                <div class="video-thumb">
                  <span class="dur">{{ curQuestion.videoDur }}</span>
                  <button class="play-btn" @click="triggerToast('Mode demo: video ujian akan diputar di sini.')" aria-label="Putar video">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>
                  </button>
                  <p>{{ curQuestion.videoTitle }} &bull; mode demo</p>
                </div>
              </div>

              <div class="opts">
                <button v-for="(op, oi) in curQuestion.options" :key="oi" class="opt" :class="{ sel: answers[qIdx] === String(oi) }" @click="selectOption(qIdx, oi)">
                  <span class="letter">{{ letters[oi] }}</span>
                  <span class="txt">{{ op }}</span>
                </button>
              </div>
            </template>

            <!-- Multiple choice -->
            <template v-else-if="curQuestion.type === 'multiple'">
              <div class="q-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
                <span>Soal ini memiliki <b>lebih dari satu</b> jawaban benar. Ketuk semua pilihan yang menurutmu benar.</span>
              </div>
              <div class="opts">
                <button v-for="(op, oi) in curQuestion.options" :key="oi" class="opt multi" :class="{ sel: isOptionSelected(qIdx, oi) }" @click="selectOption(qIdx, oi)">
                  <span class="letter">{{ isOptionSelected(qIdx, oi) ? '✓' : letters[oi] }}</span>
                  <span class="txt">{{ op }}</span>
                </button>
              </div>
            </template>

            <!-- Short text / Essay -->
            <template v-else-if="curQuestion.type === 'short' || curQuestion.type === 'essay'">
              <div class="ta-wrap">
                <textarea class="ta" :class="{ tall: curQuestion.type === 'essay' }" v-model="answers[qIdx]" @input="onTextAnswerInput" :placeholder="curQuestion.placeholder"></textarea>
                <div class="ta-foot">
                  <span class="words"><b>{{ countWords(answers[qIdx]) }}</b> kata <template v-if="curQuestion.minWords">&bull; minimal {{ curQuestion.minWords }} kata</template></span>
                  <span>Jawaban tersimpan otomatis</span>
                </div>
              </div>
            </template>
          </article>

          <div class="exam-nav">
            <div class="row">
              <button class="nav-btn" id="btn-prev" :disabled="qIdx === 0" @click="goTo(qIdx - 1)">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
                <span class="nb-t">Sebelumnya</span>
              </button>
              <button class="nav-btn mid" id="btn-palette" @click="openMobilePalette">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                <span>{{ qIdx + 1 }}/{{ totalQuestions }}</span>
              </button>
              <button type="button" class="nav-btn next" id="btn-next" @click="handleNextClick">
                <span class="nb-t">{{ qIdx === totalQuestions - 1 ? 'Periksa & Kumpulkan' : 'Berikutnya' }}</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
            <div class="kbd-hint"><kbd>1</kbd>&ndash;<kbd>5</kbd> pilih jawaban &nbsp;&bull;&nbsp; <kbd>&larr;</kbd><kbd>&rarr;</kbd> pindah soal &nbsp;&bull;&nbsp; <kbd>F</kbd> tandai ragu-ragu</div>
          </div>
        </main>

        <aside class="desktop-pal">
          <div class="palette-card">
            <h3>Navigasi Soal</h3>
            <div class="pc-sub">Klik nomor untuk loncat ke soal.</div>
            <div class="pal-grid" id="pal-desktop">
              <button v-for="(_, i) in questions" :key="i" class="pal" :class="{ current: i === qIdx, answered: isAnswered(i) }" @click="goTo(i)">
                {{ i + 1 }}
                <span class="flagdot" v-if="isFlagged(i)"></span>
              </button>
            </div>
            <div class="legend">
              <span><i class="dot" style="background:var(--blue-600)"></i> Sudah dijawab</span>
              <span><i class="dot" style="background:#fff;border:1.5px solid var(--line)"></i> Belum dijawab</span>
              <span><i class="dot" style="background:var(--amber)"></i> Ditandai ragu-ragu</span>
            </div>
            <button class="btn btn-primary" id="btn-finish-side" @click="goReview">Periksa &amp; Kumpulkan</button>
          </div>
        </aside>
      </div>

      <!-- bottom sheet palette (mobile) -->
      <div class="sheet-back" id="sheet-back" :class="{ open: showMobilePalette }" @click="showMobilePalette = false"></div>
      <div class="sheet" id="sheet" :class="{ open: showMobilePalette }">
        <div class="sheet-handle"></div>
        <div class="sheet-body">
          <div class="palette-card" style="border:none;box-shadow:none;padding:6px 0 0;position:static">
            <h3>Navigasi Soal</h3>
            <div class="pc-sub">{{ answeredCount }} dari {{ totalQuestions }} soal terjawab</div>
            <div class="pal-grid" id="pal-mobile">
              <button v-for="(_, i) in questions" :key="i" class="pal" :class="{ current: i === qIdx, answered: isAnswered(i) }" @click="showMobilePalette = false; goTo(i)">
                {{ i + 1 }}
                <span class="flagdot" v-if="isFlagged(i)"></span>
              </button>
            </div>
            <div class="legend">
              <span><i class="dot" style="background:var(--blue-600)"></i> Sudah dijawab</span>
              <span><i class="dot" style="background:#fff;border:1.5px solid var(--line)"></i> Belum dijawab</span>
              <span><i class="dot" style="background:var(--amber)"></i> Ditandai ragu-ragu</span>
            </div>
            <button class="btn btn-primary" id="btn-finish-sheet" style="margin-bottom:8px" @click="showMobilePalette = false; goReview()">Periksa &amp; Kumpulkan</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SCREEN 4 : REVIEW ==================== -->
    <section id="screen-review" class="screen" :class="{ active: screen === 'review' }">
      <div class="topbar-simple">
        <div class="wrap">
          <div class="mini-logo"><span class="school-logo"></span></div>
          <div><div class="t1">Periksa Kembali</div><div class="t2">Informatika &bull; {{ fmtTime(remainingTime) }} tersisa</div></div>
        </div>
      </div>
      <div class="wrap">
        <div class="page-head">
          <h2>Yakin sudah selesai?</h2>
          <p>Periksa ringkasan jawabanmu sebelum dikumpulkan. Jawaban tidak bisa diubah setelah dikumpulkan.</p>
        </div>

        <div class="rv-cols">
          <div class="rv-left">
            <div class="revhero">
              <div class="revhero-shine"></div>
              <div class="revhero-top">
                <div class="pring">
                  <svg viewBox="0 0 84 84">
                    <circle class="pring-bg" cx="42" cy="42" r="36"/>
                    <circle class="pring-fg" cx="42" cy="42" r="36" :style="{ strokeDasharray: pringCircumference, strokeDashoffset: pringOffset }"/>
                  </svg>
                  <div class="pring-txt"><b>{{ Math.round((answeredCount / totalQuestions) * 100) }}%</b></div>
                </div>
                <div>
                  <div class="revhero-kicker">Ringkasan Jawaban</div>
                  <div class="revhero-big"><b>{{ answeredCount }}</b> dari {{ totalQuestions }} soal terjawab</div>
                  <div class="revhero-sub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><span>{{ fmtTime(remainingTime) }} tersisa</span></div>
                </div>
              </div>
              <div class="rstats">
                <button class="rstat" :class="{ on: revFilter === 'ok' }" @click="revFilter = 'ok'"><span class="dot g"></span><div><b>{{ answeredCount }}</b><span class="lbl">Terjawab</span></div></button>
                <button class="rstat" :class="{ on: revFilter === 'un' }" @click="revFilter = 'un'"><span class="dot r"></span><div><b>{{ totalQuestions - answeredCount }}</b><span class="lbl">Belum</span></div></button>
                <button class="rstat" :class="{ on: revFilter === 'fl' }" @click="revFilter = 'fl'"><span class="dot a"></span><div><b>{{ flags.size }}</b><span class="lbl">Ragu-ragu</span></div></button>
              </div>
              <div class="rsecs">
                <div v-for="s in sections" :key="s.id" class="rsec">
                  <div class="rsec-top"><span>{{ s.title }}</span><b>{{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}</b></div>
                  <div class="rsec-bar"><i :style="{ width: (sectionDoneCount(s.id) / secRange(s.id).length * 100) + '%' }"></i></div>
                </div>
              </div>
            </div>

            <div v-if="totalQuestions - answeredCount > 0" class="warn-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex:none;margin-top:1px"><path d="M12 9v4M12 17.5v.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
              <span>Mode produksi: kamu <b>tidak bisa mengumpulkan</b> sebelum {{ totalQuestions - answeredCount }} soal yang belum dijawab dilengkapi. (Mode demo mengizinkan lewat tombol di bawah.)</span>
            </div>
          </div>

          <div class="rv-right">
            <div class="rev-filters">
              <button class="rchip" :class="{ on: revFilter === 'all' }" @click="revFilter = 'all'">Semua</button>
              <button class="rchip" :class="{ on: revFilter === 'un' }" @click="revFilter = 'un'">Belum dijawab</button>
              <button class="rchip" :class="{ on: revFilter === 'fl' }" @click="revFilter = 'fl'">Ragu-ragu</button>
              <button class="rchip" :class="{ on: revFilter === 'ok' }" @click="revFilter = 'ok'">Terjawab</button>
            </div>

            <div class="card rev-list-card">
              <div class="sect-title"><span>{{ revFilterTitle }}</span><span class="hint">{{ filteredQuestions.length }} soal</span></div>
              <div class="rev-list">
                <div v-if="filteredQuestions.length === 0" class="rev-empty">Tidak ada soal pada filter ini.</div>
                <button v-for="q in filteredQuestions" :key="q.index" class="rev-item" :class="q.kind" @click="goToFromReview(q.index)">
                  <span class="rn">{{ q.index + 1 }}</span>
                  <span class="rt"><b>{{ q.secTitle }}</b><span>Soal {{ q.index + 1 }}</span></span>
                  <span class="rpill" :class="q.kind">{{ q.pillLabel }}</span>
                  <svg class="go" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>

            <label class="agree2">
              <input type="checkbox" v-model="submitAgree">
              <span class="abox"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
              <span class="atxt">Saya yakin dan ingin <b>mengumpulkan jawaban sekarang</b>.</span>
            </label>

            <div class="cta-sticky">
              <button type="button" class="btn btn-ghost" style="margin-bottom:10px" @click="screen = 'exam'">Kembali ke Soal</button>
              <button type="button" class="btn btn-primary btn-go" :disabled="!submitAgree" @click="attemptSubmit">Kumpulkan Jawaban</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SCREEN 5 : SELESAI ==================== -->
    <section id="screen-done" class="screen" :class="{ active: screen === 'done' }">
      <div class="wrap">
        <div class="done-cols">
          <div class="done-left">
            <div class="done-hero2">
              <div class="check-ring">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
              </div>
              <h2>Ujian Selesai!</h2>
              <p>{{ doneMsg }}</p>
              <div class="done-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>Jawaban terkirim</div>
            </div>
          </div>
          <div class="done-right">
            <div class="donecard">
              <div class="donecard-shine"></div>
              <div class="examcard-kicker">Ringkasan Pengumpulan</div>
              <div class="drow"><span class="k">Nama</span><span class="v">Ahmad Fauzi</span></div>
              <div class="drow"><span class="k">Mata pelajaran</span><span class="v">Informatika</span></div>
              <div class="drow"><span class="k">Materi</span><span class="v">Jaringan Komputer Dasar</span></div>
              <div class="drow"><span class="k">Waktu selesai</span><span class="v">{{ doneTime }}</span></div>
              <div class="drow"><span class="k">Durasi pengerjaan</span><span class="v">{{ doneDur }}</span></div>
              <div class="drow"><span class="k">Soal terjawab</span><span class="v">{{ answeredCount }} dari {{ totalQuestions }}</span></div>
              <div class="dbar"><i :style="{ width: Math.round(answeredCount / totalQuestions * 100) + '%' }"></i></div>
            </div>
            <div class="card">
              <div class="sect-title">Langkah selanjutnya</div>
              <ul class="rules2">
                <li><span class="rico c-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.3l2.4 2.4 4.6-5.2"/></svg></span><span>Nilai akan <b>diumumkan oleh guru/pengawas</b> setelah semua jawaban diperiksa.</span></li>
                <li><span class="rico c-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z"/><path d="M8.8 12l2.3 2.3 4.2-4.6"/></svg></span><span>Jawabanmu <b>tersimpan aman</b> di server — tidak perlu khawatir soal koneksi.</span></li>
                <li><span class="rico c-indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg></span><span>Kamu bisa <b>menutup halaman ini</b> atau kembali ke beranda.</span></li>
              </ul>
            </div>
            <button class="btn btn-primary" style="margin-bottom:34px" @click="resetToHome">Kembali ke Beranda</button>
          </div>
        </div>
      </div>
    </section>

    <!-- TOAST -->
    <div id="toast" :class="{ show: toastMsg !== '' }">{{ toastMsg }}</div>

    <!-- MODAL -->
    <Teleport to="body">
      <div id="modal-root" v-if="modal.show" class="cbt-page cbt-modal-portal" :data-theme="store.grade">
        <div class="modal-back" @click.self="onModalBackClick">
          <div class="modal">
            <h3>{{ modal.title }}</h3>
            <p v-html="modal.desc"></p>
            <div v-if="modal.requiresPin" style="margin-bottom:20px">
              <input type="password" v-model="modal.pin" class="inp" placeholder="Masukkan kata sandi pengawas" autocomplete="off" />
              <div v-if="modal.pinError" style="color:var(--red);font-size:12px;margin-top:6px;font-weight:700">Kata sandi pengawas salah!</div>
            </div>
            <div class="mrow">
              <button type="button" v-if="modal.cancelText" class="btn btn-ghost" @click="closeModal">{{ modal.cancelText }}</button>
              <button type="button" v-if="!modal.fatal" class="btn" :class="modal.btnClass || 'btn-primary'" @click="handleModalOk">{{ modal.okText }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminSystemStore } from '~/composables/useAdminSystemStore'

definePageMeta({ layout: 'default' })

const router = useRouter()
const store = useAdminSystemStore()

const jenjangText = computed(() => {
  return store.grade === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

/* ---------- DATA ---------- */
const sections = [
  {
    id: 'pg',
    title: 'Pilihan Ganda',
    short: 'PG',
    tint: 'c-blue',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="1.7" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="6.5" cy="17.5" r="1.7" fill="currentColor" stroke="none"/><path d="M11.5 6.5h8M11.5 12h8M11.5 17.5h8"/></svg>',
    desc: 'Pilih jawaban yang paling tepat. <b>Beberapa soal</b> meminta kamu memilih lebih dari satu jawaban.'
  },
  {
    id: 'singkat',
    title: 'Jawaban Singkat',
    short: 'Singkat',
    tint: 'c-amber',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6.5h16M4 12h10M4 17.5h14"/></svg>',
    desc: 'Ketik jawaban singkat langsung pada kolom yang tersedia.'
  },
  {
    id: 'essay',
    title: 'Essay',
    short: 'Essay',
    tint: 'c-indigo',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h7l4 4v13H6z"/><path d="M13 3.5v4h4"/><path d="M9.5 13.5h6M9.5 17h6"/></svg>',
    desc: 'Uraikan jawabanmu selengkap mungkin pada kolom essay yang disediakan.'
  },
  {
    id: 'interaktif',
    title: 'Interaktif',
    short: 'Interaktif',
    tint: 'c-rose',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="3.5"/><polygon points="10.5 9.5 15 12 10.5 14.5" fill="currentColor" stroke="none"/></svg>',
    desc: 'Dengarkan audio atau tonton video, lalu jawab pertanyaan berdasarkan media tersebut.'
  }
]

const questions = [
  { sec:'pg', type:'single', text:'Perangkat yang berfungsi menghubungkan dua jaringan yang berbeda dan menentukan jalur terbaik untuk paket data adalah \u2026.', options:['Switch','Router','Hub','Repeater','Access point'] },
  { sec:'pg', type:'single', text:'Alamat IP 192.168.10.25 termasuk ke dalam IP kelas \u2026.', options:['A','B','C','D','E'] },
  { sec:'pg', type:'single', text:'Lapisan pada model OSI yang bertanggung jawab atas pengalamatan logis (IP addressing) adalah lapisan \u2026.', options:['Physical','Data Link','Network','Transport','Session'] },
  { sec:'pg', type:'single', text:'Perintah pada Command Prompt yang digunakan untuk menguji konektivitas ke komputer lain dalam jaringan adalah \u2026.', options:['ipconfig','ping','tracert','netstat','nslookup'] },
  { sec:'pg', type:'single', text:'Jenis kabel UTP yang tepat untuk menghubungkan dua perangkat sejenis (misalnya PC ke PC) adalah kabel \u2026.', options:['Straight-through','Crossover','Rollover','Coaxial','Fiber optik'] },
  { sec:'pg', type:'single', text:'Jumlah alamat host yang dapat digunakan pada sebuah jaringan dengan subnet mask 255.255.255.0 adalah \u2026.', options:['254','256','512','128','510'] },
  { sec:'pg', type:'multiple', text:'Pilih SEMUA pernyataan yang BENAR tentang switch.', options:['Bekerja pada Layer 2 model OSI','Meneruskan frame berdasarkan MAC address','Dapat menghubungkan dua jaringan dengan segmen IP berbeda','Memiliki satu broadcast domain untuk semua port','Mendukung teknologi VLAN'] },
  { sec:'pg', type:'multiple', text:'Manakah yang termasuk media transmisi terpandu (guided media)?', options:['Kabel UTP','Kabel fiber optik','Gelombang radio','Kabel coaxial','Sinyal inframerah'] },
  { sec:'singkat', type:'short', text:'Tuliskan kepanjangan dari DHCP.', placeholder:'Ketik jawaban singkatmu\u2026' },
  { sec:'singkat', type:'short', text:'Protokol HTTPS secara default berjalan pada port nomor \u2026.', placeholder:'Ketik jawaban singkatmu\u2026' },
  { sec:'essay', type:'essay', text:'Jelaskan secara runtut proses kerja DHCP (DORA) saat sebuah komputer pertama kali terhubung ke jaringan. Uraikan setiap tahapannya dengan jelas dan sistematis.', placeholder:'Tulis jawaban essay-mu di sini\u2026', minWords:40 },
  { sec:'essay', type:'essay', text:'Sebuah sekolah memiliki 120 unit komputer yang terbagi ke dalam 4 laboratorium (30 unit per lab). Rancanglah skema pengalamatan IP yang efisien: tentukan network ID, subnet mask, dan rentang IP untuk masing-masing lab. Jelaskan alasan pemilihan skemamu.', placeholder:'Tulis jawaban essay-mu di sini\u2026', minWords:40 },
  {
    sec:'interaktif', type:'audio', text:'Berdasarkan audio di atas, perangkat yang bermasalah dan langkah pertama yang paling tepat adalah \u2026.',
    options:['Switch lab \u2014 mengganti seluruh kabel UTP','Router penghubung \u2014 memeriksa daya dan me-restart perangkat','Access point \u2014 mereset ulang konfigurasi','Server \u2014 menginstal ulang sistem operasi'],
    audioTitle:'Skenario Troubleshooting Jaringan', audioSub:'Dengarkan dengan saksama, lalu jawab pertanyaan di bawah.',
    audioScript:'Skenario troubleshooting jaringan. Seorang teknisi menerima laporan bahwa seluruh komputer di Laboratorium 2 tidak dapat mengakses internet, namun komputer-komputer tersebut masih bisa saling berkomunikasi satu sama lain di dalam lab. Teknisi memeriksa kabel jaringan, switch, dan konfigurasi IP address. Semuanya dalam kondisi normal. Terakhir, teknisi memeriksa perangkat yang menghubungkan Laboratorium 2 ke jaringan utama sekolah, dan mendapati lampu indikator daya pada perangkat tersebut mati.'
  },
  {
    sec:'interaktif', type:'video', text:'Perhatikan video topologi jaringan berikut. Jenis topologi apakah yang ditampilkan pada video?',
    options:['Bus','Star','Ring','Mesh'], videoDur:'01:24', videoTitle:'Video: Topologi Jaringan'
  }
]

const letters = ['A','B','C','D','E','F']
const totalQuestions = questions.length
const DURATION = 90 * 60 // 90 menit
const SAVE_KEY = 'cbt_attaqwa_demo_v1'

/* ---------- STATE ---------- */
const screen = ref('login') // login, confirm, exam, review, done
const loginForm = reactive({ nis: '', pass: '', kode: '' })
const openedAcc = ref('pg')
const agreeStart = ref(false)

const qIdx = ref(0)
const answers = reactive<Record<number, any>>({})
const flags = reactive(new Set<number>())
const remainingTime = ref(DURATION)
let timerId: any = null
const isSaving = ref(false)
const showMobilePalette = ref(false)
const audioPlaying = ref(false)

const revFilter = ref('all') // all, un, fl, ok
const submitAgree = ref(false)

const doneTime = ref('-')
const doneDur = ref('-')
const doneMsg = ref('Jawabanmu sudah tersimpan dan terkirim ke server. Terima kasih sudah mengerjakan dengan jujur.')

/* Modal & Toast */
const toastMsg = ref('')
let toastTimer: any = null

const modal = reactive({
  show: false,
  title: '',
  desc: '',
  okText: 'OK',
  cancelText: '',
  btnClass: 'btn-primary',
  onOk: null as (() => void) | null,
  requiresPin: false,
  pin: '',
  pinError: false,
  fatal: false
})

/* Anti cheat */
const violations = ref(0)
const CHEAT_PIN = 'pengawas123'

const curQuestion = computed(() => questions[qIdx.value])

/* ---------- HELPERS ---------- */
const secRange = (secId: string) => questions.reduce((acc: number[], q, i) => q.sec === secId ? [...acc, i] : acc, [])

const typeLabel = (q: any) => {
  return {
    single: 'Pilihan Ganda',
    multiple: 'Pilihan Ganda \u2022 Multi',
    short: 'Jawaban Singkat',
    essay: 'Essay',
    audio: 'Interaktif \u2022 Audio',
    video: 'Interaktif \u2022 Video'
  }[q.type] || ''
}

const fmtTime = (sec: number) => {
  sec = Math.max(0, sec)
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const countWords = (s: any) => {
  s = String(s || '').trim()
  return s ? s.split(/\s+/).length : 0
}

const isAnswered = (i: number) => {
  const q = questions[i], a = answers[i]
  if (q.type === 'multiple') return Array.isArray(a) && a.length > 0
  if (q.type === 'single') return typeof a === 'string' && a !== ''
  return typeof a === 'string' && a.trim().length > 0
}

const answeredCount = computed(() => {
  let n = 0
  for (let i = 0; i < totalQuestions; i++) if (isAnswered(i)) n++
  return n
})

const isFlagged = (i: number) => flags.has(i)

const sectionDoneCount = (secId: string) => secRange(secId).filter(isAnswered).length

const isSectionDone = (secId: string) => {
  const r = secRange(secId)
  return r.length > 0 && sectionDoneCount(secId) === r.length
}

/* Progress ring on review screen */
const pringCircumference = (2 * Math.PI * 36).toFixed(1)
const pringOffset = computed(() => {
  const C = 2 * Math.PI * 36
  return (C * (1 - answeredCount.value / totalQuestions)).toFixed(1)
})

/* Review filtered list */
const filteredQuestions = computed(() => {
  const list = []
  for (let i = 0; i < totalQuestions; i++) {
    const ans = isAnswered(i)
    const flg = isFlagged(i)
    let kind = 'ok'
    let pillLabel = 'Terjawab'
    if (flg) { kind = 'fl'; pillLabel = 'Ragu-ragu' }
    else if (!ans) { kind = 'un'; pillLabel = 'Belum dijawab' }

    if (revFilter.value === 'un' && kind !== 'un') continue
    if (revFilter.value === 'fl' && kind !== 'fl') continue
    if (revFilter.value === 'ok' && kind !== 'ok') continue

    const sec = sections.find(s => s.id === questions[i].sec)
    list.push({
      index: i,
      kind,
      pillLabel,
      secTitle: sec?.title || ''
    })
  }
  return list
})

const revFilterTitle = computed(() => {
  const t: Record<string, string> = { all: 'Semua soal', un: 'Belum dijawab', fl: 'Ragu-ragu', ok: 'Terjawab' }
  return t[revFilter.value] || 'Semua soal'
})

/* ---------- ACTIONS ---------- */
const triggerToast = (msg: string, ms = 2600) => {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, ms)
}

const openModal = (opts: {
  title: string
  desc: string
  okText?: string
  cancelText?: string
  btnClass?: string
  requiresPin?: boolean
  fatal?: boolean
  onOk?: () => void
}) => {
  modal.title = opts.title
  modal.desc = opts.desc
  modal.okText = opts.okText || 'OK'
  modal.cancelText = opts.cancelText || ''
  modal.btnClass = opts.btnClass || 'btn-primary'
  modal.requiresPin = !!opts.requiresPin
  modal.pin = ''
  modal.pinError = false
  modal.fatal = !!opts.fatal
  modal.onOk = opts.onOk || null
  modal.show = true
}

const closeModal = () => {
  modal.show = false
}

const onModalBackClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('modal-back') && !modal.requiresPin && !modal.fatal) {
    closeModal()
  }
}

const handleModalOk = () => {
  if (modal.requiresPin) {
    if (modal.pin === CHEAT_PIN) {
      modal.show = false
      modal.pin = ''
      modal.pinError = false
      triggerToast('Kunci ujian berhasil dibuka oleh pengawas.')
    } else {
      modal.pinError = true
    }
  } else {
    const cb = modal.onOk
    closeModal()
    if (cb) cb()
  }
}

const toggleAcc = (id: string) => {
  openedAcc.value = openedAcc.value === id ? '' : id
}

const fillDemo = () => {
  loginForm.nis = '2024001234'
  loginForm.pass = 'demo123'
  loginForm.kode = 'IF-1201'
  triggerToast('Data demo terisi. Ketuk "Masuk".')
}

const doLogin = () => {
  if (!loginForm.nis) { triggerToast('Isi Nomor Peserta / NIS dulu.'); return }
  if (!loginForm.pass) { triggerToast('Isi kata sandi dulu.'); return }
  screen.value = 'confirm'
  window.scrollTo(0, 0)
}

const startExam = () => {
  if (!agreeStart.value) {
    triggerToast('Centang persetujuan tata tertib terlebih dahulu.')
    return
  }
  beginExam()
}

const handleNextClick = () => {
  if (qIdx.value === totalQuestions - 1) {
    goReview()
  } else {
    goTo(qIdx.value + 1)
  }
}

const beginExam = () => {
  restore()
  screen.value = 'exam'
  window.scrollTo(0, 0)
  startTimer()
  triggerToast('Selamat mengerjakan! Jawaban tersimpan otomatis setiap 10 detik.', 3000)
}

const startTimer = () => {
  stopTimer()
  timerId = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value === 300) {
      triggerToast('Sisa waktu 5 menit! Periksa kembali jawabanmu.')
    }
    if (remainingTime.value <= 0) {
      remainingTime.value = 0
      autoSubmit()
    } else if (remainingTime.value % 10 === 0) {
      persist(true)
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerId) { clearInterval(timerId); timerId = null }
}

const persist = (silent = false) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      answers,
      flags: [...flags],
      remaining: remainingTime.value,
      idx: qIdx.value,
      savedAt: Date.now()
    }))
  } catch (e) {}
  isSaving.value = true
  setTimeout(() => { isSaving.value = false }, 800)
  if (!silent) triggerToast('Jawaban tersimpan otomatis.')
}

const restore = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object') return false
    if (d.answers) Object.assign(answers, d.answers)
    if (Array.isArray(d.flags)) {
      flags.clear()
      d.flags.forEach((f: number) => flags.add(f))
    }
    if (typeof d.remaining === 'number' && d.remaining > 0) remainingTime.value = d.remaining
    if (typeof d.idx === 'number') qIdx.value = Math.min(d.idx, totalQuestions - 1)
    return true
  } catch (e) {
    return false
  }
}

const goTo = (i: number) => {
  if (i < 0 || i >= totalQuestions) return
  stopAudio()
  persist(true)
  qIdx.value = i
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToSection = (secId: string) => {
  const r = secRange(secId)
  if (r.length) goTo(r[0])
}

const isOptionSelected = (i: number, oi: number) => {
  const a = answers[i]
  return Array.isArray(a) && a.includes(oi)
}

const selectOption = (i: number, oi: number) => {
  const q = questions[i]
  if (q.type === 'multiple') {
    let cur = Array.isArray(answers[i]) ? [...answers[i]] : []
    cur = cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi]
    if (cur.length) answers[i] = cur; else delete answers[i]
  } else {
    answers[i] = String(oi)
  }
  persist(true)
}

const onTextAnswerInput = () => {
  persist(true)
}

const toggleFlag = (i: number) => {
  if (flags.has(i)) {
    flags.delete(i)
    triggerToast('Tanda ragu-ragu dihapus.')
  } else {
    flags.add(i)
    triggerToast(`Soal ${i + 1} ditandai ragu-ragu.`)
  }
  persist(true)
}

const openMobilePalette = () => {
  showMobilePalette.value = true
}

/* Audio Speech */
const toggleAudio = (q: any) => {
  if (!('speechSynthesis' in window)) {
    triggerToast('Perangkat tidak mendukung pemutar audio demo.')
    return
  }
  if (audioPlaying.value) {
    stopAudio()
    return
  }
  stopAudio()
  const u = new SpeechSynthesisUtterance(q.audioScript)
  u.lang = 'id-ID'
  u.rate = 0.95
  u.onend = u.onerror = () => { audioPlaying.value = false }
  audioPlaying.value = true
  speechSynthesis.speak(u)
}

const stopAudio = () => {
  try { if ('speechSynthesis' in window) speechSynthesis.cancel() } catch (e) {}
  audioPlaying.value = false
}

/* Review & Submit */
const goReview = () => {
  stopAudio()
  persist(true)
  submitAgree.value = false
  revFilter.value = 'all'
  screen.value = 'review'
  window.scrollTo(0, 0)
}

const goToFromReview = (i: number) => {
  screen.value = 'exam'
  goTo(i)
}

const attemptSubmit = () => {
  if (!submitAgree.value) {
    triggerToast('Centang pernyataan yakin mengumpulkan terlebih dahulu.')
    return
  }
  const unCount = totalQuestions - answeredCount.value
  if (unCount > 0) {
    triggerToast(`Jawaban berhasil dikumpulkan (mode demo: ${unCount} soal belum dijawab).`, 3500)
  } else {
    triggerToast('Jawaban berhasil dikumpulkan!', 3000)
  }
  doSubmit(false)
}

const autoSubmit = () => {
  stopTimer()
  doSubmit(true)
}

const doSubmit = (auto: boolean) => {
  stopTimer()
  stopAudio()
  try { localStorage.removeItem(SAVE_KEY) } catch (e) {}

  const d = new Date()
  doneTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`
  const usedSec = Math.max(0, DURATION - remainingTime.value)
  const um = Math.max(0, Math.round(usedSec / 60))
  doneDur.value = um >= 60 ? `${Math.floor(um / 60)} jam ${um % 60} menit` : `${um} menit`

  if (auto) {
    doneMsg.value = 'Waktu ujian telah habis. Jawabanmu dikumpulkan otomatis dan sudah terkirim ke server.'
  }

  screen.value = 'done'
  window.scrollTo(0, 0)
}

const resetToHome = () => {
  try { localStorage.removeItem(SAVE_KEY) } catch (e) {}
  router.push('/')
}

/* Keyboard handler */
const onKeydown = (e: KeyboardEvent) => {
  if (screen.value !== 'exam') return
  const tag = (e.target as HTMLElement)?.tagName?.toUpperCase() || ''
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  if (e.key >= '1' && e.key <= '6') {
    const q = questions[qIdx.value]
    if ((q.type === 'single' || q.type === 'multiple' || q.type === 'audio' || q.type === 'video') && q.options) {
      const oi = +e.key - 1
      if (oi < q.options.length) selectOption(qIdx.value, oi)
    }
  } else if (e.key === 'ArrowRight') {
    if (qIdx.value === totalQuestions - 1) goReview(); else goTo(qIdx.value + 1)
  } else if (e.key === 'ArrowLeft') {
    goTo(qIdx.value - 1)
  } else if (e.key.toLowerCase() === 'f') {
    toggleFlag(qIdx.value)
  } else if (e.key === 'Escape') {
    showMobilePalette.value = false
  }
}

/* Anti cheat & leave protection */
const onVisibilityChange = () => {
  if (screen.value === 'exam' || screen.value === 'review') {
    if (document.visibilityState === 'hidden') {
      violations.value++
      triggerCheatLock()
    }
  }
}

const triggerCheatLock = () => {
  if (violations.value >= 3) {
    openModal({
      title: 'Pelanggaran Fatal!',
      desc: 'Kamu terdeteksi meninggalkan layar ujian lebih dari batas maksimal (3x). <b>Akun kamu diblokir permanen untuk ujian ini.</b>',
      fatal: true
    })
  } else {
    openModal({
      title: 'Peringatan Pelanggaran!',
      desc: `Kamu terdeteksi meninggalkan layar ujian (pindah tab/aplikasi). Ini adalah pelanggaran ke-<b>${violations.value}</b> (Maks 2x sebelum blokir permanen). Silakan minta kata sandi ke pengawas ujian untuk membuka kunci.`,
      requiresPin: true,
      okText: 'Buka Kunci'
    })
  }
}

const onBeforeUnload = (e: BeforeUnloadEvent) => {
  if (screen.value === 'exam' || screen.value === 'review') {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('beforeunload', onBeforeUnload)
  stopTimer()
  stopAudio()
})
</script>

<style src="~/assets/css/cbt.css"></style>
