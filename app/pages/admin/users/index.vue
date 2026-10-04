<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Manajemen User</h2>
        <p>{{ list.length }} akun &middot; {{ activeUsers }} aktif</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="showAddModal = true">
        <AdminIcon name="plus" size="16"/> Tambah User
      </button>
    </div>
    
    <div class="card">
      <div class="card-b" style="padding-bottom:0">
        <div class="toolbar">
          <div class="inp">
            <span class="ic"><AdminIcon name="search" size="17"/></span>
            <input placeholder="Cari nama / username..." v-model="searchQuery">
          </div>
          <select class="sel" v-model="roleFilter">
            <option value="all">Semua Peran</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>
      
      <div class="tbl-wrap">
        <table class="tbl rt">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Peran</th>
              <th>Status</th>
              <th>Login Terakhir</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in rows" :key="u.id">
              <td>
                <div class="row-user">
                  <span class="ava">{{ getInitials(u.nama) }}</span>
                  <div>
                    <div class="t-name">{{ u.nama }}</div>
                    <div class="t-sub">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td><span class="pill" :class="rCls[u.role] || 'p-gray'">{{ u.role }}</span></td>
              <td>
                <label class="sw">
                  <input type="checkbox" :checked="u.status === 'Aktif'" :disabled="u.id === 'U1'" @change="toggleStatus(u)">
                  <span class="tr"></span>
                </label>
              </td>
              <td style="font-size:12.5px;color:var(--muted)">{{ u.login }}</td>
              <td style="text-align:right">
                <button class="btn btn-ghost btn-sm">
                  <AdminIcon name="eye" size="15"/>
                </button>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="5">
                <div class="empty" style="padding: 20px 0;">Tidak ada data.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pager">
        <span>{{ list.length }} pengguna</span>
        <div class="pg-btns">
          <button :disabled="page <= 1" @click="page--">&lsaquo;</button>
          <button v-for="i in pages" :key="i" :class="{ on: i === page }" @click="page = i">{{ i }}</button>
          <button :disabled="page >= pages" @click="page++">&rsaquo;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-users'
})

const dbUsers = ref([
  { id: "U1", username: "admin", nama: "Administrator", role: "Super Admin", status: "Aktif", login: "5 menit lalu" },
  { id: "U2", username: "guru_rpl", nama: "Ahmad Subarjo", role: "Guru", status: "Aktif", login: "1 jam lalu" },
  { id: "U3", username: "keuangan_1", nama: "Siti Khadijah", role: "Admin Keuangan", status: "Aktif", login: "Kemarin, 08:30" },
  { id: "U4", username: "wakel_9a", nama: "Dewi Lestari", role: "Wali Kelas", status: "Nonaktif", login: "3 hari lalu" },
  { id: "U5", username: "staff_tu1", nama: "Budi Santoso", role: "Staff TU", status: "Aktif", login: "10 menit lalu" }
])

const roles = ["Super Admin", "Admin Akademik", "Admin Keuangan", "Guru", "Wali Kelas", "Staff TU"]
const rCls: Record<string, string> = {
  "Super Admin": "p-rose",
  "Admin Akademik": "p-blue",
  "Admin Keuangan": "p-green",
  "Guru": "p-violet",
  "Wali Kelas": "p-cyan",
  "Staff TU": "p-gray"
}

const showAddModal = ref(false)
const searchQuery = ref("")
const roleFilter = ref("all")
const page = ref(1)
const perPage = 10

const getInitials = (name: string) => {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
}

const toggleStatus = (user: any) => {
  if (user.id !== 'U1') {
    user.status = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
  }
}

const list = computed(() => {
  return dbUsers.value.filter(u => 
    (roleFilter.value === "all" || u.role === roleFilter.value) &&
    (!searchQuery.value || u.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const activeUsers = computed(() => dbUsers.value.filter(u => u.status === 'Aktif').length)

const pages = computed(() => Math.max(1, Math.ceil(list.value.length / perPage)))

const rows = computed(() => {
  const p = Math.min(page.value, pages.value)
  return list.value.slice((p - 1) * perPage, p * perPage)
})
</script>
