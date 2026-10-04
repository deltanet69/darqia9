<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Log Aktivitas</h2>
        <p>Jejak audit &mdash; siapa melakukan apa, kapan</p>
      </div>
      <button class="btn btn-ghost btn-sm">
        <AdminIcon name="dl" size="16"/> Ekspor Log
      </button>
    </div>

    <div class="card">
      <div class="card-b" style="padding-bottom:0">
        <div class="toolbar">
          <div class="inp">
            <span class="ic"><AdminIcon name="search" size="17"/></span>
            <input placeholder="Cari user / aksi..." v-model="searchQuery">
          </div>
          <select class="sel" v-model="moduleFilter">
            <option value="all">Semua Modul</option>
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
          <span style="font-size:13px;color:var(--muted);margin-left:auto">{{ filteredLogs.length }} aktivitas</span>
        </div>
      </div>
      
      <div class="card-b" style="padding-top:6px">
        <div v-for="l in displayedLogs" :key="l.id" style="display:flex;gap:13px;padding:12px 0;border-bottom:1px solid var(--line-2)">
          <div class="ava" style="width:38px;height:38px;font-size:13px;flex:none">{{ getInitials(l.nama) }}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13.5px"><b>{{ l.nama }}</b> <span style="color:var(--muted)">{{ l.aksi }}</span></div>
            <div style="font-size:12px;color:var(--faint);margin-top:3px">{{ l.role }} &middot; {{ timeAgo(l.waktu) }} &middot; {{ l.timeStr }}</div>
          </div>
          <span class="pill" :class="mCls[l.modul] || 'p-gray'" style="align-self:flex-start">{{ l.modul }}</span>
        </div>

        <div v-if="displayedLogs.length === 0" class="empty">
          Tidak ada aktivitas yang cocok.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-log'
})

const mCls: Record<string, string> = {
  "Absensi": "p-blue",
  "Keuangan": "p-green",
  "Nilai": "p-violet",
  "CBT": "p-amber",
  "Pengguna": "p-rose",
  "RBAC": "p-cyan",
  "Konten Web": "p-blue",
  "Tabungan": "p-green",
  "Kelas": "p-violet",
  "Laporan": "p-gray"
}

// Generate some dummy logs
const dbLogs = ref(Array.from({ length: 45 }, (_, i) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - (i * 25))
  
  const modules = Object.keys(mCls)
  const modul = modules[i % modules.length]
  
  const users = [
    { nama: "Administrator", role: "Super Admin" },
    { nama: "Ahmad Subarjo", role: "Guru" },
    { nama: "Siti Khadijah", role: "Admin Keuangan" },
    { nama: "Dewi Lestari", role: "Wali Kelas" }
  ]
  const u = users[i % users.length]
  
  return {
    id: i,
    nama: u.nama,
    role: u.role,
    aksi: i % 3 === 0 ? `memperbarui data di modul ${modul}` : i % 3 === 1 ? `menambahkan entri baru` : `menghapus data usang`,
    modul: modul,
    waktu: d,
    timeStr: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  }
}))

const searchQuery = ref("")
const moduleFilter = ref("all")

const modules = computed(() => {
  return [...new Set(dbLogs.value.map(l => l.modul))]
})

const filteredLogs = computed(() => {
  return dbLogs.value.filter(l => 
    (moduleFilter.value === "all" || l.modul === moduleFilter.value) &&
    (!searchQuery.value || (l.nama + " " + l.aksi).toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const displayedLogs = computed(() => {
  return filteredLogs.value.slice(0, 40)
})

const getInitials = (name: string) => {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
}

const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " tahun lalu"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " bulan lalu"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " hari lalu"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " jam lalu"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " menit lalu"
  return "Baru saja"
}
</script>
