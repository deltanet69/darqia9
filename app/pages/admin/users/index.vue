<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Manajemen User</h2>
        <p>{{ store.users.length }} akun &bull; {{ activeUsersCount }} aktif</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openAddModal">
        <AdminIcon name="plus" size="16"/> Tambah User
      </button>
    </div>

    <div class="card">
      <div class="card-b" style="padding-bottom:0">
        <div class="toolbar">
          <div class="inp">
            <span class="ic"><AdminIcon name="search" size="17"/></span>
            <input v-model="filterQ" placeholder="Cari nama / username...">
          </div>
          <select class="sel" v-model="filterRole">
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
            <tr v-for="u in paginatedUsers" :key="u.id">
              <td>
                <div class="row-user">
                  <div class="avatar" :style="getAvatarStyle(u.nama)">{{ getInitials(u.nama) }}</div>
                  <div>
                    <div class="t-name">{{ u.nama }}</div>
                    <div class="t-sub">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="pill" :class="roleClass(u.role)">{{ u.role }}</span>
              </td>
              <td>
                <label class="sw">
                  <input type="checkbox" :checked="u.status === 'Aktif'" :disabled="u.id === 'U1'" @change="e => store.toggleUserStatus(u.id, (e.target as HTMLInputElement).checked)">
                  <span class="tr"></span>
                </label>
              </td>
              <td style="font-size:12.5px;color:var(--muted)">{{ u.login }}</td>
              <td style="text-align:right">
                <button class="btn btn-ghost btn-sm" @click="openViewModal(u)">
                  <AdminIcon name="eye" size="15"/>
                </button>
              </td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" style="text-align:center;padding:30px;color:var(--muted)">Tidak ada pengguna yang cocok.</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pager">
        <span>{{ filteredUsers.length }} pengguna</span>
        <div class="pg-btns">
          <button :disabled="page <= 1" @click="page--">&lt;</button>
          <button v-for="p in totalPages" :key="p" :class="{ on: p === page }" @click="page = p">{{ p }}</button>
          <button :disabled="page >= totalPages" @click="page++">&gt;</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Add User -->
      <div v-if="showAddModal" class="modal-root">
        <div class="modal-ov" @click="showAddModal = false"></div>
        <div class="modal" role="dialog">
          <div class="modal-h">
            <h3>Tambah User</h3>
            <button class="icon-btn" @click="showAddModal = false" style="width:36px;height:36px">
              <AdminIcon name="x" size="17"/>
            </button>
          </div>
          <div class="modal-b">
            <div class="field">
              <label>Nama Lengkap</label>
              <div class="inp"><input v-model="addForm.nama" placeholder="cth: Dewi Lestari"></div>
            </div>
            <div class="field">
              <label>Username</label>
              <div class="inp"><input v-model="addForm.username" placeholder="cth: dewi.lestari"></div>
            </div>
            <div class="field">
              <label>Peran</label>
              <div class="inp">
                <select v-model="addForm.role">
                  <option v-for="r in roles.filter(x => x !== 'Super Admin')" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-f">
            <button class="btn btn-ghost btn-sm" @click="showAddModal = false">Batal</button>
            <button class="btn btn-primary btn-sm" @click="saveUser">
              <AdminIcon name="check" size="15"/> Simpan
            </button>
          </div>
        </div>
      </div>

      <!-- View User -->
      <div v-if="selectedUser" class="modal-root">
        <div class="modal-ov" @click="selectedUser = null"></div>
        <div class="modal" role="dialog">
          <div class="modal-h">
            <h3>Detail Pengguna</h3>
            <button class="icon-btn" @click="selectedUser = null" style="width:36px;height:36px">
              <AdminIcon name="x" size="17"/>
            </button>
          </div>
          <div class="modal-b">
            <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">
              <div class="avatar" :style="[getAvatarStyle(selectedUser.nama), { width: '56px', height: '56px', fontSize: '20px' }]">
                {{ getInitials(selectedUser.nama) }}
              </div>
              <div>
                <b style="font-size:17px">{{ selectedUser.nama }}</b>
                <div style="font-size:13px;color:var(--muted)">@{{ selectedUser.username }}</div>
                <div style="margin-top:6px;display:flex;gap:6px">
                  <span class="pill p-violet">{{ selectedUser.role }}</span>
                  <span class="pill" :class="selectedUser.status === 'Aktif' ? 'p-green' : 'p-gray'">{{ selectedUser.status }}</span>
                </div>
              </div>
            </div>
            <div class="stat-mini" style="display:flex;justify-content:space-between">
              <span>Login terakhir</span>
              <b>{{ selectedUser.login }}</b>
            </div>
          </div>
          <div class="modal-f">
            <button class="btn btn-ghost btn-sm" @click="selectedUser = null">Tutup</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminSystemStore, type User } from '~/composables/useAdminSystemStore'

definePageMeta({ layout: 'admin', name: 'admin-users' })
useHead({ title: 'Manajemen User | Admin Portal' })

const store = useAdminSystemStore()

const filterQ = ref('')
const filterRole = ref('all')
const page = ref(1)
const perPage = 10

const roles = Object.keys(store.perms.value)

const activeUsersCount = computed(() => store.users.value.filter(u => u.status === 'Aktif').length)

const filteredUsers = computed(() => {
  let list = store.users.value
  if (filterRole.value !== 'all') {
    list = list.filter(u => u.role === filterRole.value)
  }
  if (filterQ.value) {
    const q = filterQ.value.toLowerCase()
    list = list.filter(u => u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage)))

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredUsers.value.slice(start, start + perPage)
})

watch([filterQ, filterRole], () => {
  page.value = 1
})

const roleClass = (role: string) => {
  const rCls: Record<string, string> = {
    "Super Admin": "p-rose",
    "Admin Akademik": "p-blue",
    "Admin Keuangan": "p-green",
    "Guru": "p-violet",
    "Wali Kelas": "p-cyan",
    "Staff TU": "p-gray"
  }
  return rCls[role] || "p-gray"
}

// Avatar Utils
const H = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0; return h; }
const getAvatarStyle = (nama: string) => {
  const hue = Math.abs(H(nama)) % 360;
  return { background: `hsl(${hue}, 65%, 90%)`, color: `hsl(${hue}, 70%, 35%)` }
}
const getInitials = (nama: string) => {
  const parts = nama.split(' ')
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

// Modals
const showAddModal = ref(false)
const selectedUser = ref<User | null>(null)

const addForm = ref({ nama: '', username: '', role: 'Guru' })

const openAddModal = () => {
  addForm.value = { nama: '', username: '', role: 'Guru' }
  showAddModal.value = true
}

const saveUser = () => {
  const { nama, username, role } = addForm.value
  if (!nama.trim() || !username.trim()) {
    alert("Lengkapi nama & username") // In real app use toast
    return
  }
  store.addUser(nama, username, role)
  showAddModal.value = false
  // trigger toast via event bus eventually, ignoring for mock
}

const openViewModal = (u: User) => {
  selectedUser.value = u
}
</script>

<style scoped>
.modal-root { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-ov { position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
.modal { position: relative; background: #fff; border-radius: 16px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; animation: pop 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.modal.wide { max-width: 600px; }
.modal-h { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.modal-h h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--ink); }
.modal-b { padding: 20px; max-height: calc(100vh - 140px); overflow-y: auto; }
.modal-f { padding: 16px 20px; border-top: 1px solid var(--line); background: var(--bg); display: flex; justify-content: flex-end; gap: 10px; }

@keyframes pop {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
