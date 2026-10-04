<template>
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
</template>

<script setup lang="ts">
import type { LoginForm } from '~/composables/useCbtExam'

defineProps<{
  screen: string
  jenjangText: string
  loginForm: LoginForm
}>()

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'fill-demo'): void
}>()

const doLogin = () => emit('login')
const fillDemo = () => emit('fill-demo')
</script>
