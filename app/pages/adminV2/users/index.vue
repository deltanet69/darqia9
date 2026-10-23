<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'

interface AuthUserRow {
  id: string
  name: string
  email: string
  role: string
  status: 'Aktif' | 'Tidak Aktif'
  emailConfirmed: boolean
  lastSignInAt: string | null
  createdAt: string
  isPrimarySuperadmin: boolean
}

interface AuthUsersResponse {
  users: AuthUserRow[]
  total: number
  source: 'Supabase Auth'
}

definePageMeta({ layout: false })

useHead({
  title: 'Manajemen Pengguna — Admin Portal Darqia 9',
  meta: [{ name: 'description', content: 'Daftar akun pengguna nyata dari Supabase Auth.' }]
})

const authUser = useSupabaseUser()
const authRole = computed(() => String(
  authUser.value?.app_metadata?.role || authUser.value?.user_metadata?.role || ''
).toLowerCase())
const role = computed<'superadmin' | 'admin_tu' | 'guru'>(() => {
  if (authRole.value === 'guru') return 'guru'
  if (authRole.value === 'admin' || authRole.value === 'admin_tu') return 'admin_tu'
  return 'superadmin'
})

const jenjang = ref<'smp' | 'smk'>('smk')
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)

const { data, status, error, refresh } = await useFetch<AuthUsersResponse>('/api/admin/users')
const isRefreshing = ref(false)
const searchQuery = ref('')
const selectedRole = ref('semua')
const selectedStatus = ref('semua')
const page = ref(1)
const perPage = 10

const users = computed(() => data.value?.users || [])
const roles = computed(() => [...new Set(users.value.map(user => user.role))].sort())
const activeCount = computed(() => users.value.filter(user => user.status === 'Aktif').length)
const adminCount = computed(() => users.value.filter(user => user.role.toLowerCase().includes('admin')).length)

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return users.value.filter((user) => {
    if (selectedRole.value !== 'semua' && user.role !== selectedRole.value) return false
    if (selectedStatus.value !== 'semua' && user.status !== selectedStatus.value) return false
    if (!query) return true
    return (user.name + ' ' + user.email + ' ' + user.role).toLowerCase().includes(query)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage)))
const paginatedUsers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredUsers.value.slice(start, start + perPage)
})

watch([searchQuery, selectedRole, selectedStatus], () => {
  page.value = 1
})

watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})

const errorMessage = computed(() => {
  const fetchError = error.value as any
  return fetchError?.data?.statusMessage
    || fetchError?.statusMessage
    || 'Data pengguna tidak dapat dimuat. Periksa koneksi, lalu coba lagi.'
})

const formatDate = (value: string | null) => {
  if (!value) return 'Belum pernah masuk'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data waktu tidak valid'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta'
  }).format(date)
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.slice(0, 2).map(part => part[0]).join('') || 'P').toUpperCase()
}

const refreshUsers = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await refresh()
  } finally {
    isRefreshing.value = false
  }
}

const closeAllModals = () => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  isSearchOpen.value = false
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const toggleMega = (group: GroupItem) => {
  if (isMegaOpen.value && activeMegaGroup.value?.id === group.id) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
    return
  }
  activeMegaGroup.value = group
  isMegaOpen.value = true
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const handleSelectModule = (title: string) => {
  const destination = getAdminDestination(title)
  closeAllModals()
  if (destination && destination !== '#') return navigateTo(destination)
}
</script>
<template>
  <div
    class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white"
    @click="closeAllModals"
  >
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="role"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id || 'sistem'"
        current-route="sistem"
        :is-mega-open="isMegaOpen"
        @update:jenjang="jenjang = $event"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="isSearchOpen = !isSearchOpen"
        @toggle-notif="isNotifOpen = !isNotifOpen"
        @toggle-profile="isProfileOpen = !isProfileOpen"
      />

      <AdminV2Breadcrumb
        :items="[
          { label: 'Portal Admin', to: '/adminV2' },
          { label: 'Sistem Apps' },
          { label: 'Manajemen Pengguna' }
        ]"
        :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'"
        :jenjang="jenjang"
      />

      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <main class="max-w-[1440px] mx-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7 space-y-5" @click.stop>
      <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
            Manajemen Pengguna
          </h1>
          <p class="text-sm text-[#667085] mt-1">
            Akun yang terdaftar langsung di Supabase Auth.
          </p>
        </div>

        <button
          type="button"
          class="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#101828] text-white text-sm font-bold hover:bg-[#1D2939] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          :disabled="isRefreshing || status === 'pending'"
          @click="refreshUsers"
        >
          <span v-if="isRefreshing" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {{ isRefreshing ? 'Memuat ulang…' : 'Muat Ulang Data' }}
        </button>
      </header>

      <section
        v-if="error"
        class="bg-white border border-[#FDA29B] rounded-2xl p-5 sm:p-6"
        role="alert"
      >
        <h2 class="text-base font-extrabold text-[#B42318]">Data pengguna belum dapat ditampilkan</h2>
        <p class="text-sm text-[#475467] mt-1.5 max-w-3xl">{{ errorMessage }}</p>
        <p v-if="errorMessage.includes('Secret key')" class="text-xs text-[#667085] mt-2">
          Tambahkan <code class="font-mono text-[#344054]">NUXT_SUPABASE_SECRET_KEY</code> pada environment server, lalu jalankan ulang aplikasi.
        </p>
        <button
          type="button"
          class="mt-4 min-h-11 px-4 py-2.5 rounded-xl bg-[#B42318] text-white text-sm font-bold hover:bg-[#912018] transition"
          @click="refreshUsers"
        >
          Coba Lagi
        </button>
      </section>

      <template v-else>
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-3.5" aria-label="Ringkasan pengguna">
          <article class="bg-white border border-[#E7EBF2] rounded-2xl p-5">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-[#667085]">Total Akun</span>
              <AdminV2Icon name="users" :size="19" class="text-[#1B5FD9]" />
            </div>
            <strong class="block text-3xl font-extrabold text-[#101828] mt-3 tabular-nums">
              {{ status === 'pending' ? '—' : users.length }}
            </strong>
            <span class="text-xs text-[#667085]">Sumber: Supabase Auth</span>
          </article>

          <article class="bg-white border border-[#E7EBF2] rounded-2xl p-5">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-[#667085]">Akun Aktif</span>
              <AdminV2Icon name="check" :size="19" class="text-[#039855]" />
            </div>
            <strong class="block text-3xl font-extrabold text-[#101828] mt-3 tabular-nums">
              {{ status === 'pending' ? '—' : activeCount }}
            </strong>
            <span class="text-xs text-[#667085]">Dapat menggunakan portal</span>
          </article>

          <article class="bg-white border border-[#E7EBF2] rounded-2xl p-5">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-[#667085]">Administrator</span>
              <AdminV2Icon name="shield" :size="19" class="text-[#7F56D9]" />
            </div>
            <strong class="block text-3xl font-extrabold text-[#101828] mt-3 tabular-nums">
              {{ status === 'pending' ? '—' : adminCount }}
            </strong>
            <span class="text-xs text-[#667085]">Superadmin dan Admin TU</span>
          </article>
        </section>
        <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden">
          <div class="p-4 sm:p-5 border-b border-[#E7EBF2] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 class="text-base font-extrabold text-[#101828]">Daftar Akun Pengguna</h2>
              <p class="text-xs text-[#667085] mt-0.5">{{ filteredUsers.length }} akun sesuai filter</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
              <label class="min-h-11 flex items-center gap-2 px-3.5 rounded-xl border border-[#D0D5DD] focus-within:border-[#1B5FD9] focus-within:ring-2 focus-within:ring-[#1B5FD9]/15 transition sm:min-w-64">
                <AdminV2Icon name="search" :size="17" class="text-[#98A2B3] shrink-0" />
                <input
                  v-model="searchQuery"
                  type="search"
                  autocomplete="off"
                  placeholder="Cari nama atau email"
                  class="w-full min-w-0 bg-transparent outline-none text-sm text-[#101828] placeholder:text-[#98A2B3]"
                >
              </label>

              <select
                v-model="selectedRole"
                class="min-h-11 px-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm font-semibold text-[#344054] outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#1B5FD9]/15"
                aria-label="Filter peran"
              >
                <option value="semua">Semua peran</option>
                <option v-for="item in roles" :key="item" :value="item">{{ item }}</option>
              </select>

              <select
                v-model="selectedStatus"
                class="min-h-11 px-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm font-semibold text-[#344054] outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#1B5FD9]/15"
                aria-label="Filter status"
              >
                <option value="semua">Semua status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div v-if="status === 'pending'" class="p-5 space-y-3" aria-live="polite">
            <div v-for="item in 5" :key="item" class="h-14 rounded-xl bg-[#F2F4F7] animate-pulse" />
            <span class="sr-only">Memuat data pengguna…</span>
          </div>

          <div v-else-if="paginatedUsers.length === 0" class="px-5 py-14 text-center">
            <div class="w-12 h-12 rounded-xl bg-[#F2F4F7] text-[#667085] flex items-center justify-center mx-auto">
              <AdminV2Icon name="users" :size="23" />
            </div>
            <h3 class="text-sm font-extrabold text-[#344054] mt-3">Tidak ada pengguna yang cocok</h3>
            <p class="text-xs text-[#667085] mt-1">Ubah pencarian atau filter untuk melihat akun lain.</p>
          </div>

          <template v-else>
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-[#F8FAFC] border-b border-[#E7EBF2]">
                  <tr class="text-[11px] uppercase tracking-wider text-[#667085]">
                    <th class="px-5 py-3.5 font-extrabold">Pengguna</th>
                    <th class="px-4 py-3.5 font-extrabold">Peran</th>
                    <th class="px-4 py-3.5 font-extrabold">Status</th>
                    <th class="px-4 py-3.5 font-extrabold">Verifikasi Email</th>
                    <th class="px-5 py-3.5 font-extrabold">Login Terakhir</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#EFF2F7]">
                  <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-[#F8FAFC] transition-colors">
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3 min-w-0">
                        <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center justify-center text-xs font-extrabold shrink-0">
                          {{ getInitials(user.name) }}
                        </span>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-sm font-extrabold text-[#101828] truncate">{{ user.name }}</span>
                            <span v-if="user.isPrimarySuperadmin" class="shrink-0 text-[10px] font-extrabold text-[#6941C6] bg-[#F4F3FF] px-2 py-0.5 rounded-full">
                              Utama
                            </span>
                          </div>
                          <span class="block text-xs text-[#667085] truncate mt-0.5">{{ user.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm font-semibold text-[#344054] whitespace-nowrap">{{ user.role }}</td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                        :class="user.status === 'Aktif' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F2F4F7] text-[#475467]'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="user.status === 'Aktif' ? 'bg-[#12B76A]' : 'bg-[#98A2B3]'" />
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-sm font-semibold whitespace-nowrap" :class="user.emailConfirmed ? 'text-[#027A48]' : 'text-[#B54708]'">
                      {{ user.emailConfirmed ? 'Terverifikasi' : 'Belum terverifikasi' }}
                    </td>
                    <td class="px-5 py-4 text-sm text-[#475467] whitespace-nowrap">{{ formatDate(user.lastSignInAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="md:hidden divide-y divide-[#EFF2F7]">
              <article v-for="user in paginatedUsers" :key="user.id" class="p-4">
                <div class="flex items-start gap-3">
                  <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center justify-center text-xs font-extrabold shrink-0">
                    {{ getInitials(user.name) }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 min-w-0">
                      <h3 class="text-sm font-extrabold text-[#101828] truncate">{{ user.name }}</h3>
                      <span v-if="user.isPrimarySuperadmin" class="shrink-0 text-[10px] font-extrabold text-[#6941C6] bg-[#F4F3FF] px-2 py-0.5 rounded-full">
                        Utama
                      </span>
                    </div>
                    <p class="text-xs text-[#667085] truncate mt-0.5">{{ user.email }}</p>
                  </div>
                  <span
                    class="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
                    :class="user.status === 'Aktif' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F2F4F7] text-[#475467]'"
                  >
                    {{ user.status }}
                  </span>
                </div>

                <dl class="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <dt class="text-[#98A2B3]">Peran</dt>
                    <dd class="font-bold text-[#344054] mt-0.5">{{ user.role }}</dd>
                  </div>
                  <div>
                    <dt class="text-[#98A2B3]">Email</dt>
                    <dd class="font-bold mt-0.5" :class="user.emailConfirmed ? 'text-[#027A48]' : 'text-[#B54708]'">
                      {{ user.emailConfirmed ? 'Terverifikasi' : 'Belum terverifikasi' }}
                    </dd>
                  </div>
                  <div class="col-span-2">
                    <dt class="text-[#98A2B3]">Login terakhir</dt>
                    <dd class="font-bold text-[#344054] mt-0.5">{{ formatDate(user.lastSignInAt) }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <footer class="px-4 sm:px-5 py-3.5 border-t border-[#E7EBF2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#667085]">
              <span>{{ filteredUsers.length }} akun</span>
              <div class="flex items-center justify-between sm:justify-end gap-2">
                <button
                  type="button"
                  class="min-h-10 px-3 rounded-xl border border-[#D0D5DD] bg-white font-bold text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="page <= 1"
                  @click="page--"
                >
                  Sebelumnya
                </button>
                <span class="font-bold text-[#344054] tabular-nums">{{ page }} / {{ totalPages }}</span>
                <button
                  type="button"
                  class="min-h-10 px-3 rounded-xl border border-[#D0D5DD] bg-white font-bold text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="page >= totalPages"
                  @click="page++"
                >
                  Berikutnya
                </button>
              </div>
            </footer>
          </template>
        </section>
      </template>
    </main>

    <AdminV2BottomNav
      :role="role"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

    <AdminV2Popovers
      :is-search-open="isSearchOpen"
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :role="role"
      :jenjang="jenjang"
      @close-all="closeAllModals"
      @item-click="handleSelectModule"
    />
  </div>
</template>