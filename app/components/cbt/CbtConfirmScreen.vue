<template>
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
                <div class="meta">NIS {{ loginForm.nis || '2024001234' }} &bull; {{ grade === 'SMP' ? 'IX-A' : 'XII TKJ 1' }}</div>
              </div>
            </div>
            <div class="idcard-foot">
              <div><span>Token</span><b>{{ grade === 'SMP' ? 'BCA-9X2K4M' : 'ATQ-9X2K4M' }}</b></div>
              <div><span>Ruang</span><b>Online</b></div>
              <div><span>Sesi</span><b>1</b></div>
            </div>
          </div>

          <div class="examcard">
            <div class="examcard-shine"></div>
            <div class="examcard-head"><span class="examcard-kicker">Informasi Ujian</span><span class="pulse"></span></div>
            <div class="examcard-grid">
              <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg></span><div><span class="k">Mata Pelajaran</span><span class="v">Informatika</span></div></div>
              <div class="erow"><span class="iico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span><div><span class="k">Materi</span><span class="v">{{ grade === 'SMP' ? 'Informatika & Komputer Dasar' : 'Jaringan Komputer Dasar' }}</span></div></div>
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
              <div v-for="sec in sections" :key="sec.id" class="acc" :class="{ open: openedAcc === sec.id }">
                <button type="button" class="acc-head" @click="$emit('toggle-acc', sec.id)">
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
              <li><span class="rico c-rose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5L22 20H2z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor" stroke="none"/></svg></span><span>Pelanggaran tata tertib berakibat <b>akun terkunci dan nilai dibatalkan</b>.</span></li>
              <li><span class="rico c-indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.3l2.4 2.4 4.6-5.2"/></svg></span><span><b>Periksa kembali</b> semua jawaban sebelum menekan tombol kumpulkan.</span></li>
            </ul>
          </div>

          <label class="agree2">
            <input type="checkbox" :checked="agreeStart" @change="$emit('update:agreeStart', ($event.target as HTMLInputElement).checked)">
            <span class="abox"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
            <span class="atxt">Saya telah membaca tata tertib dan <b>siap mengikuti ujian dengan jujur</b>.</span>
          </label>

          <div class="cta-sticky">
            <button type="button" class="btn btn-primary btn-go" :disabled="!agreeStart" @click="$emit('start-exam')"><span>Mulai Ujian</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LoginForm, SectionItem } from '~/composables/useCbtExam'

defineProps<{
  screen: string
  jenjangText: string
  grade: string
  loginForm: LoginForm
  totalQuestions: number
  sections: SectionItem[]
  openedAcc: string
  agreeStart: boolean
  secRange: (secId: string) => number[]
}>()

defineEmits<{
  (e: 'toggle-acc', id: string): void
  (e: 'update:agreeStart', val: boolean): void
  (e: 'start-exam'): void
}>()
</script>
