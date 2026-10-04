<template>
  <div id="login-screen">
    <div class="login-left">
      <div class="login-brand">
        <img src="/asset/logo.png" class="login-logo" id="login-logo" alt="Logo SMK IT Attaqwa 9">
        <div><h2>SMK IT Attaqwa 9</h2><p>Admin Portal &middot; Sistem Terpadu</p></div>
      </div>
      <h1>Satu pintu untuk <span class="grad">seluruh operasional</span> sekolah.</h1>
      <p class="lede">Kelola akademik, keuangan, CBT, dan konten website dalam satu dashboard yang cepat, aman, dan bisa diakses dari mana saja.</p>
      <div class="login-feats">
        <div class="login-feat">
          <span class="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </span>
          <div><b>Akademik Terpadu</b><span>Absensi, kelas, dan nilai SMPâ€“SMK</span></div>
        </div>
        <div class="login-feat">
          <span class="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </span>
          <div><b>Keuangan Transparan</b><span>Arus kas, infaq &amp; tabungan siswa</span></div>
        </div>
        <div class="login-feat">
          <span class="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          </span>
          <div><b>CBT Terpusat</b><span>Bank soal &amp; jadwal ujian digital</span></div>
        </div>
        <div class="login-feat">
          <span class="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <div><b>Aman &amp; Teraudit</b><span>RBAC + log aktivitas lengkap</span></div>
        </div>
      </div>
    </div>
    <div class="login-right">
      <form class="login-card" autocomplete="off" @submit.prevent="handleLogin">
        <div class="eyebrow">Admin Portal</div>
        <h2>Selamat datang kembali</h2>
        <p class="sub">Masuk untuk mengelola ekosistem aplikasi sekolah.</p>
        
        <div class="field">
          <label for="li-user">Username / NIP</label>
          <div class="inp">
            <span class="ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input id="li-user" v-model="username" placeholder="cth: admin">
          </div>
        </div>
        <div class="field">
          <label for="li-pass">Kata Sandi</label>
          <div class="inp">
            <span class="ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input id="li-pass" type="password" v-model="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢">
          </div>
        </div>
        
        <div v-if="errorMsg" style="color:var(--rose);font-size:13px;font-weight:600;margin-bottom:12px">
          {{ errorMsg }}
        </div>
        
        <button class="btn btn-primary btn-block" type="submit" style="padding:14px" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Masuk Dashboard' }}
        </button>
        
        <div class="login-demo">Akun demo &mdash; Username <code>admin</code> &nbsp; Password <code>admin123</code></div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin-blank',
  title: 'Admin Portal Login'
})

const router = useRouter()
const username = ref('admin')
const password = ref('admin123')
const errorMsg = ref('')
const loading = ref(false)

const handleLogin = () => {
  errorMsg.value = ''
  loading.value = true
  
  // Simulasi validasi client-side
  setTimeout(() => {
    loading.value = false
    if (username.value === 'admin' && password.value === 'admin123') {
      router.push('/admin')
    } else {
      errorMsg.value = 'Username atau kata sandi salah. Gunakan admin / admin123'
    }
  }, 600)
}
</script>

