<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
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
const guruCount = computed(() => store.users.value.filter(u => u.role === 'Guru' || u.role === 'Wali Kelas').length)
const adminCount = computed(() => store.users.value.filter(u => u.role === 'Super Admin' || u.role === 'Admin Akademik' || u.role === 'Admin Keuangan').length)

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
    'Super Admin': 'bg-rose-50 text-rose-700 border border-rose-200/80',
    'Admin Akademik': 'bg-blue-50 text-blue-700 border border-blue-200/80',
    'Admin Keuangan': 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    'Guru': 'bg-purple-50 text-purple-700 border border-purple-200/80',
    'Wali Kelas': 'bg-cyan-50 text-cyan-700 border border-cyan-200/80',
    'Staff TU': 'bg-slate-100 text-slate-700 border border-slate-200/80'
  }
  return rCls[role] || 'bg-slate-100 text-slate-700 border border-slate-200/80'
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
    return
  }
  store.addUser(nama, username, role)
  showAddModal.value = false
}

const openViewModal = (u: User) => {
  selectedUser.value = u
}
</script>

<template>
  <section class="space-y-6">
    <!-- Page Head -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Manajemen User</h2>
        <p class="text-sm text-slate-500 mt-1">{{ store.users.length }} akun terdaftar &bull; {{ activeUsersCount }} pengguna berstatus aktif</p>
      </div>
      <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-[0_6px_18px_-4px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_24px_-4px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200" type="button" @click="openAddModal">
        <AdminIcon name="plus" size="16" /> Tambah User
      </button>
    </div>

    <!-- KPI Gradient Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Pengguna (k-blue) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#60a5fa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="users" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ roles.length }} Peran
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ store.users.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Total Akun Terdaftar</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[8, 10, 12, 13, 15, 16]" color="#ffffff" />
        </div>
      </div>

      <!-- Pengguna Aktif (k-green) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#065f46] via-[#059669] to-[#34d399] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="check" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ ((activeUsersCount / (store.users.length || 1)) * 100).toFixed(0) }}% Aktif
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ activeUsersCount }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">User Aktif Saat Ini</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[6, 8, 10, 12, 14, 15]" color="#ffffff" />
        </div>
      </div>

      <!-- Guru & Tendik (k-violet) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="book" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Akademik
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ guruCount }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Guru &amp; Wali Kelas</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[5, 6, 8, 9, 10, 11]" color="#ffffff" />
        </div>
      </div>

      <!-- Administrator (k-amber) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#92400e] via-[#d97706] to-[#fbbf24] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="shield" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Super &amp; Tim
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ adminCount }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Admin &amp; Staf Pengelola</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[2, 3, 3, 4, 4, 5]" color="#ffffff" />
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
      <!-- Toolbar Header -->
      <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/50">
        <div class="flex items-center gap-2.5">
          <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Daftar Akun Pengguna
          </h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">{{ filteredUsers.length }} user</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 sm:w-64 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input v-model="filterQ" placeholder="Cari nama / username..." class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
          </label>
          <select v-model="filterRole" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all">
            <option value="all">Semua Peran</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>

      <!-- Table Section -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th class="px-5 py-3.5">Pengguna</th>
              <th class="px-4 py-3.5">Peran</th>
              <th class="px-4 py-3.5">Status Akun</th>
              <th class="px-4 py-3.5">Login Terakhir</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in paginatedUsers" :key="u.id" class="hover:bg-blue-50/30 transition-colors duration-150">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs" :style="getAvatarStyle(u.nama)">
                    {{ getInitials(u.nama) }}
                  </div>
                  <div>
                    <button type="button" class="font-bold text-slate-900 text-left hover:text-blue-600 transition block" @click="openViewModal(u)">
                      {{ u.nama }}
                    </button>
                    <div class="text-xs text-slate-400 mt-0.5">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-xs" :class="roleClass(u.role)">
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    :disabled="u.id === 'U1'"
                    :aria-label="`Ubah status ${u.nama}`"
                    class="w-10 h-5.5 rounded-full transition-colors duration-200 relative focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-inner shrink-0"
                    :class="u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-300'"
                    @click="store.toggleUserStatus(u.id, u.status !== 'Aktif')"
                  >
                    <span
                      class="block w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 absolute top-0.5 shadow-sm"
                      :class="u.status === 'Aktif' ? 'left-[20px]' : 'left-0.5'"
                    />
                  </button>
                  <span class="text-xs font-semibold" :class="u.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-500'">
                    {{ u.status }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">{{ u.login }}</td>
              <td class="px-5 py-4 text-right whitespace-nowrap">
                <button class="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150" type="button" aria-label="Lihat detail user" @click="openViewModal(u)">
                  <AdminIcon name="eye" size="15" />
                </button>
              </td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" class="py-14 text-center text-slate-400">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <AdminIcon name="users" size="24" />
                </div>
                <div class="text-sm font-semibold text-slate-600">Tidak ada pengguna yang cocok</div>
                <div class="text-xs text-slate-400 mt-0.5">Coba sesuaikan kata kunci pencarian atau filter peran.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>Menampilkan <b>{{ paginatedUsers.length }}</b> dari total {{ filteredUsers.length }} pengguna</span>
        <div class="flex items-center gap-1.5">
          <button :disabled="page <= 1" class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs" @click="page--">&lsaquo; Prev</button>
          <button v-for="p in totalPages" :key="p" class="px-3 py-1.5 rounded-xl text-xs font-bold transition" :class="p === page ? 'bg-blue-600 text-white shadow-xs' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs'" @click="page = p">{{ p }}</button>
          <button :disabled="page >= totalPages" class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs" @click="page++">Next &rsaquo;</button>
        </div>
      </div>
    </article>

    <!-- Add User Modal -->
    <AdminModal :open="showAddModal" title="Tambah Pengguna Baru" @close="showAddModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
          <input v-model="addForm.nama" placeholder="cth: Dewi Lestari, S.Pd" class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Username / NIP</label>
          <input v-model="addForm.username" placeholder="cth: dewi.lestari" class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Peran / Hak Akses</label>
          <select v-model="addForm.role" class="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all">
            <option v-for="r in roles.filter(x => x !== 'Super Admin')" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="showAddModal = false">Batal</button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)] transition" type="button" @click="saveUser">
          <AdminIcon name="check" size="14" /> Simpan Pengguna
        </button>
      </template>
    </AdminModal>

    <!-- View User Modal -->
    <AdminModal :open="Boolean(selectedUser)" title="Detail Akun Pengguna" @close="selectedUser = null">
      <div v-if="selectedUser" class="space-y-5">
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-md" :style="getAvatarStyle(selectedUser.nama)">
            {{ getInitials(selectedUser.nama) }}
          </div>
          <div>
            <b class="block text-lg font-bold text-slate-900 leading-snug">{{ selectedUser.nama }}</b>
            <div class="text-xs text-slate-500 mt-0.5">@{{ selectedUser.username }}</div>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" :class="roleClass(selectedUser.role)">{{ selectedUser.role }}</span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold" :class="selectedUser.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-slate-100 text-slate-600 border border-slate-200/80'">
                <span class="w-1.5 h-1.5 rounded-full" :class="selectedUser.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'" />
                {{ selectedUser.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span class="block text-xs font-medium text-slate-400">ID Pengguna</span>
            <b class="block text-sm font-bold text-slate-800 mt-0.5 font-mono">{{ selectedUser.id }}</b>
          </div>
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span class="block text-xs font-medium text-slate-400">Login Terakhir</span>
            <b class="block text-sm font-semibold text-slate-800 mt-0.5">{{ selectedUser.login }}</b>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition" type="button" @click="selectedUser = null">Tutup</button>
      </template>
    </AdminModal>
  </section>
</template>

