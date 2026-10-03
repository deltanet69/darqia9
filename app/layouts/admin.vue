<template>
  <div class="admin-portal" :class="{ 'sb-min': sidebarMin }">
    <div class="app" id="app">
      <div id="sb-overlay" :class="{ 'show': sidebarOpen }" @click="sidebarOpen = false"></div>
      
      <aside id="sidebar" :class="{ 'open': sidebarOpen }">
        <div class="sb-brand">
          <img src="/asset/logo.png" class="sb-logo" id="sb-logo" alt="Logo">
          <div class="sb-txt"><b>SMK IT Attaqwa 9</b><span>Admin Portal</span></div>
        </div>
        
        <nav id="sb-nav">
          <div v-for="(group, gIdx) in navigation" :key="gIdx" class="nav-group">
            <span>{{ group.group }}</span>
            <NuxtLink v-for="item in group.items" :key="item.id" :to="'/admin' + (item.id === 'dashboard' ? '' : '/' + item.id)" class="nav-item" exact-active-class="on" :title="item.t" @click="sidebarOpen = false">
              <span class="ic"><AdminIcon :name="item.icon" size="19" /></span>
              <span class="lbl">{{ item.t }}</span>
              <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            </NuxtLink>
          </div>
          
          <div class="nav-group">
            <span>Akun</span>
            <NuxtLink to="/admin/profile" class="nav-item" exact-active-class="on" title="Profil Saya" @click="sidebarOpen = false">
              <span class="ic"><AdminIcon name="idcard" size="19" /></span>
              <span class="lbl">Profil Saya</span>
            </NuxtLink>
          </div>
        </nav>
        
        <div class="sb-foot">
          <div class="sb-user">
            <span class="avatar" id="sb-avatar">AD</span>
            <div class="u-txt"><b id="sb-uname">Administrator</b><span id="sb-urole">Super Admin</span></div>
            <button class="logout-btn" title="Keluar" @click="handleLogout">
              <span class="ic"><AdminIcon name="logout" size="16" /></span>
            </button>
          </div>
        </div>
      </aside>

      <div class="app-main">
        <header id="topbar">
          <button id="btn-menu" aria-label="Menu" @click="toggleSidebar">
            <span class="ic"><AdminIcon name="menu" size="20" /></span>
          </button>
          
          <div class="tb-title">
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSub }}</p>
          </div>
          
          <div class="tb-actions">
            <div class="tb-search hidden lg:block">
              <span class="ic"><AdminIcon name="search" size="16" /></span>
              <input placeholder="Cari siswa, guru, pengguna…" autocomplete="off">
            </div>
            
            <div style="position:relative">
              <button class="icon-btn" aria-label="Notifikasi">
                <span class="ic"><AdminIcon name="bell" size="18" /></span>
                <span class="dot"></span>
              </button>
            </div>
            
            <div style="position:relative">
              <button class="tb-avatar">AD</button>
            </div>
          </div>
        </header>
        
        <main id="view">
          <slot />
        </main>
      </div>

      <nav id="mnav">
        <NuxtLink v-for="m in mnavItems" :key="m.id" :to="'/admin' + (m.id === 'dashboard' ? '' : '/' + m.id)" exact-active-class="on">
          <span class="mind"></span>
          <AdminIcon :name="m.icon" size="21" />
          {{ m.t }}
        </NuxtLink>
        <button @click="sidebarOpen = true">
          <span class="mind"></span>
          <AdminIcon name="menu" size="21" />
          Menu
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import '~/assets/css/admin.css'

const router = useRouter()
const route = useRoute()

const sidebarMin = ref(false)
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  if (window.innerWidth <= 1024) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    sidebarMin.value = !sidebarMin.value
  }
}

const handleLogout = () => {
  router.push('/admin/login')
}

// Data navigasi sidebar
const navigation = [
  { group: "Utama", items: [{ id: "dashboard", t: "Dashboard", icon: "grid" }] },
  { group: "Akademik", items: [
    { id: "absensi-siswa", t: "Absensi Siswa", icon: "ucheck" },
    { id: "absensi-guru", t: "Absensi Guru", icon: "user" },
    { id: "kelas", t: "Manajemen Kelas", icon: "bldg" },
    { id: "nilai", t: "Manajemen Nilai", icon: "book" }
  ]},
  { group: "Keuangan", items: [
    { id: "keuangan", t: "Keuangan Sekolah", icon: "wallet" },
    { id: "tabungan", t: "Tabungan Siswa", icon: "piggy" }
  ]},
  { group: "Aplikasi", items: [
    { id: "cbt", t: "Manajemen CBT", icon: "monitor", badge: "2" },
    { id: "konten", t: "Konten Website", icon: "globe" }
  ]},
  { group: "Sistem", items: [
    { id: "users", t: "Manajemen User", icon: "users" },
    { id: "rbac", t: "Hak Akses (RBAC)", icon: "shield" },
    { id: "log", t: "Log Aktivitas", icon: "hist" }
  ]}
]

const TITLES = {
  "dashboard": ["Dashboard", "Ringkasan operasional sekolah hari ini"],
  "absensi-siswa": ["Absensi Siswa", "Kehadiran peserta didik per kelas"],
  "absensi-guru": ["Absensi Guru", "Kehadiran & keterlambatan pendidik"],
  "kelas": ["Manajemen Kelas", "13 kelas SMP & SMK"],
  "nilai": ["Manajemen Nilai", "Rekap nilai SMP & SMK per mata pelajaran"],
  "keuangan": ["Keuangan Sekolah", "Arus kas, infaq & transaksi"],
  "tabungan": ["Tabungan Siswa", "Simpanan peserta didik"],
  "cbt": ["Manajemen CBT", "Jadwal & hasil ujian digital"],
  "konten": ["Konten Website", "Kelola halaman, berita & pengumuman"],
  "users": ["Manajemen User", "Akun & peran pengguna sistem"],
  "rbac": ["Hak Akses (RBAC)", "Matriks perizinan per peran"],
  "log": ["Log Aktivitas", "Jejak audit seluruh aktivitas"],
  "profile": ["Profil Saya", "Detail akun & preferensi"]
}

const mnavItems = [
  { id: "dashboard", t: "Beranda", icon: "grid" },
  { id: "absensi-siswa", t: "Absensi", icon: "ucheck" },
  { id: "nilai", t: "Nilai", icon: "book" },
  { id: "keuangan", t: "Keuangan", icon: "wallet" }
]

const pageTitle = computed(() => {
  const name = route.name?.toString().replace('admin-', '') || 'dashboard'
  return TITLES[name]?.[0] || 'Dashboard'
})

const pageSub = computed(() => {
  const name = route.name?.toString().replace('admin-', '') || 'dashboard'
  return TITLES[name]?.[1] || 'Ringkasan operasional sekolah'
})
</script>
