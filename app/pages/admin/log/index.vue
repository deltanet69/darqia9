<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Log Aktivitas</h2>
        <p>Jejak audit - siapa melakukan apa, kapan</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="exportLog">
        <AdminIcon name="dl" size="16"/> Ekspor Log
      </button>
    </div>

    <div class="card">
      <div class="card-b" style="padding-bottom:0">
        <div class="toolbar">
          <div class="inp">
            <span class="ic"><AdminIcon name="search" size="17"/></span>
            <input v-model="filterQ" placeholder="Cari user / aksi...">
          </div>
          <select class="sel" v-model="filterModul">
            <option value="all">Semua Modul</option>
            <option v-for="m in uniqueModules" :key="m" :value="m">{{ m }}</option>
          </select>
          <span style="font-size:13px;color:var(--muted);margin-left:auto">
            {{ filteredLogs.length }} aktivitas
          </span>
        </div>
      </div>
      
      <div class="card-b" style="padding-top:6px">
        <div v-if="filteredLogs.length === 0" class="empty">Tidak ada aktivitas yang cocok.</div>
        <div 
          v-else
          v-for="(l, index) in filteredLogs.slice(0, 40)" 
          :key="index"
          style="display:flex;gap:13px;padding:12px 0;border-bottom:1px solid var(--line-2)"
        >
          <div class="avatar" :style="[getAvatarStyle(l.nama), { width: '38px', height: '38px', fontSize: '15px' }]">
            {{ getInitials(l.nama) }}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13.5px">
              <b>{{ l.nama }}</b> <span style="color:var(--muted)">{{ l.aksi }}</span>
            </div>
            <div style="font-size:12px;color:var(--faint);margin-top:3px">
              {{ l.role }} &bull; {{ timeAgo(l.waktu) }} &bull; {{ formatTime(l.waktu) }}
            </div>
          </div>
          <span class="pill" :class="modulClass(l.modul)" style="align-self:flex-start">
            {{ l.modul }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminSystemStore } from '~/composables/useAdminSystemStore'

definePageMeta({ layout: 'admin', name: 'admin-log' })
useHead({ title: 'Log Aktivitas | Admin Portal' })

const store = useAdminSystemStore()

const filterQ = ref('')
const filterModul = ref('all')

const uniqueModules = computed(() => {
  const mods = new Set(store.logs.value.map(l => l.modul))
  return Array.from(mods).sort()
})

const filteredLogs = computed(() => {
  let list = store.logs.value
  
  if (filterModul.value !== 'all') {
    list = list.filter(l => l.modul === filterModul.value)
  }
  
  if (filterQ.value) {
    const q = filterQ.value.toLowerCase()
    list = list.filter(l => (l.nama + ' ' + l.aksi).toLowerCase().includes(q))
  }
  
  return list
})

const modulClass = (modul: string) => {
  const mCls: Record<string, string> = {
    Absensi: "p-blue",
    Keuangan: "p-green",
    Nilai: "p-violet",
    CBT: "p-amber",
    Pengguna: "p-rose",
    RBAC: "p-cyan",
    "Konten Web": "p-blue",
    Tabungan: "p-green",
    Kelas: "p-violet",
    Laporan: "p-gray"
  }
  return mCls[modul] || "p-gray"
}

// Utils
const H = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0; return h; }
const getAvatarStyle = (nama: string) => {
  const hue = Math.abs(H(nama)) % 360;
  return { background: `hsl(${hue}, 65%, 90%)`, color: `hsl(${hue}, 70%, 35%)` }
}
const getInitials = (nama: string) => {
  const parts = nama.split(' ')
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const sec = Math.floor((new Date().getTime() - d.getTime()) / 1000)
  if (sec < 60) return "Baru saja"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} mnt lalu`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam lalu`
  const dDay = Math.floor(hr / 24)
  if (dDay === 1) return "Kemarin"
  return `${dDay} hari lalu`
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

const exportLog = () => {
  alert("Log aktivitas diekspor (CSV)")
}
</script>
