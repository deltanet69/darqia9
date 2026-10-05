<script setup lang="ts">
import { ref, reactive } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-profile'
})
useHead({ title: 'Profil Saya | Admin Portal' })

const ME = reactive({
  nama: 'Administrator',
  username: 'admin',
  role: 'Super Admin',
  nip: '19850101 201001 1 001',
  email: 'admin@darqiaattaqwa.sch.id',
  hp: '0812-3456-7890',
  alamat: 'Jl. Perintis Kemerdekaan No. 1, Babelan, Bekasi'
})

const editForm = reactive({ ...ME })

const pass = reactive({
  new: '',
  confirm: ''
})

const showEditModal = ref(false)
const toastMessage = ref('')
const toastKind = ref<'ok' | 'info'>('ok')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const preferences = reactive([
  { title: 'Absensi harian', desc: 'Ringkasan kehadiran setiap pagi', active: true },
  { title: 'Transaksi keuangan', desc: 'Notifikasi setiap transaksi dicatat', active: true },
  { title: 'Ujian CBT', desc: 'Jadwal & hasil ujian', active: true },
  { title: 'Pengumuman', desc: 'Info dari modul konten web', active: false }
])

const showToast = (msg: string, kind: 'ok' | 'info' = 'ok') => {
  toastMessage.value = msg
  toastKind.value = kind
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2800)
}

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const openEditModal = () => {
  Object.assign(editForm, ME)
  showEditModal.value = true
}

const saveProfile = () => {
  if (!editForm.nama.trim()) {
    showToast('Nama tidak boleh kosong', 'info')
    return
  }
  Object.assign(ME, editForm)
  showEditModal.value = false
  showToast('Profil akun berhasil diperbarui.')
}

const updatePassword = () => {
  if (pass.new.length < 8) {
    showToast('Kata sandi minimal 8 karakter', 'info')
    return
  }
  if (pass.new !== pass.confirm) {
    showToast('Konfirmasi kata sandi tidak cocok', 'info')
    return
  }
  pass.new = ''
  pass.confirm = ''
  showToast('Kata sandi berhasil diperbarui.')
}
</script>

<template>
  <section class="space-y-6">
    <!-- Page Head -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Profil Saya</h2>
        <p class="text-sm text-slate-500 mt-1">Detail akun pengguna, kredensial keamanan, dan preferensi notifikasi</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Kolom Kiri: Profil & Statistik (2 cols) -->
      <div class="lg:col-span-2 space-y-6">
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-[#0a1f44] via-[#1d4ed8] to-[#3b82f6] relative overflow-hidden">
            <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div class="absolute right-32 -bottom-12 w-32 h-32 rounded-full border-8 border-white/10 pointer-events-none" />
          </div>
          <div class="p-6 pt-0">
            <div class="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-6">
              <div class="flex items-end gap-4">
                <div class="w-22 h-22 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                  {{ getInitials(ME.nama) }}
                </div>
                <div class="pb-1">
                  <b class="block text-xl font-bold text-slate-900 leading-tight">{{ ME.nama }}</b>
                  <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span class="font-medium">@{{ ME.username }}</span>
                    <span>&bull;</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">{{ ME.role }}</span>
                  </div>
                </div>
              </div>
              <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)] transition" type="button" @click="openEditModal">
                <AdminIcon name="pencil" size="14" /> Ubah Profil
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4">
                <span class="block text-xs font-medium text-slate-400">Nomor Induk Pegawai (NIP)</span>
                <b class="block text-sm font-bold text-slate-800 mt-1 font-mono">{{ ME.nip }}</b>
              </div>
              <div class="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4">
                <span class="block text-xs font-medium text-slate-400">Email Kedinasan</span>
                <b class="block text-sm font-bold text-slate-800 mt-1">{{ ME.email }}</b>
              </div>
              <div class="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4">
                <span class="block text-xs font-medium text-slate-400">No. Handphone / WhatsApp</span>
                <b class="block text-sm font-bold text-slate-800 mt-1">{{ ME.hp }}</b>
              </div>
              <div class="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4">
                <span class="block text-xs font-medium text-slate-400">Alamat Domisili</span>
                <b class="block text-sm font-bold text-slate-800 mt-1">{{ ME.alamat }}</b>
              </div>
            </div>
          </div>
        </article>

        <!-- Statistik Akun Card -->
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 bg-white/50">
            <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Statistik Akun
            </h3>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-3 gap-3.5 text-center">
              <div class="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 shadow-xs">
                <b class="block text-2xl font-extrabold text-slate-900 tracking-tight">1.284</b>
                <span class="block text-xs font-medium text-slate-400 mt-1">Total Sesi Login</span>
              </div>
              <div class="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 shadow-xs">
                <b class="block text-2xl font-extrabold text-blue-600 tracking-tight">96</b>
                <span class="block text-xs font-medium text-slate-400 mt-1">Aksi Bulan Ini</span>
              </div>
              <div class="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 shadow-xs">
                <b class="block text-2xl font-extrabold text-emerald-600 tracking-tight">12</b>
                <span class="block text-xs font-medium text-slate-400 mt-1">Laporan Dibuat</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Kolom Kanan: Keamanan & Preferensi (1 col) -->
      <div class="space-y-6">
        <!-- Keamanan Card -->
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 bg-white/50 flex items-center justify-between">
            <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Keamanan Akun
            </h3>
            <span class="text-[11px] font-medium text-slate-400">Update 45 hr lalu</span>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi Baru</label>
              <div class="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <AdminIcon name="lock" size="16" class="text-slate-400 shrink-0" />
                <input v-model="pass.new" type="password" placeholder="Minimal 8 karakter" class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Konfirmasi Kata Sandi</label>
              <div class="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <AdminIcon name="lock" size="16" class="text-slate-400 shrink-0" />
                <input v-model="pass.confirm" type="password" placeholder="Ulangi kata sandi baru" class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
              </div>
            </div>
            <button class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)] transition" type="button" @click="updatePassword">
              <AdminIcon name="check" size="14" /> Perbarui Kata Sandi
            </button>
          </div>
        </article>

        <!-- Preferensi Notifikasi Card -->
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 bg-white/50">
            <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Preferensi Notifikasi
            </h3>
          </div>
          <div class="p-5 space-y-3.5">
            <div
              v-for="(n, i) in preferences"
              :key="i"
              class="flex items-center justify-between gap-3 pt-3 first:pt-0 border-t border-slate-100 first:border-0"
            >
              <div class="flex-1 min-w-0">
                <b class="block text-xs sm:text-sm font-bold text-slate-800">{{ n.title }}</b>
                <div class="text-xs text-slate-400 mt-0.5">{{ n.desc }}</div>
              </div>
              <button
                type="button"
                :aria-label="`Toggle ${n.title}`"
                class="w-10 h-5.5 rounded-full transition-colors duration-200 relative focus:outline-none cursor-pointer shadow-inner shrink-0"
                :class="n.active ? 'bg-emerald-500' : 'bg-slate-300'"
                @click="n.active = !n.active; showToast(`Preferensi ${n.title} ${n.active ? 'diaktifkan' : 'dinonaktifkan'}`)"
              >
                <span
                  class="block w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 absolute top-0.5 shadow-sm"
                  :class="n.active ? 'left-[20px]' : 'left-0.5'"
                />
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <AdminModal :open="showEditModal" title="Ubah Profil Saya" @close="showEditModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
          <input v-model="editForm.nama" placeholder="Nama lengkap..." class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
          <input v-model="editForm.email" type="email" placeholder="Email..." class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">No. HP / WhatsApp</label>
          <input v-model="editForm.hp" placeholder="No. HP..." class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Alamat</label>
          <input v-model="editForm.alamat" placeholder="Alamat..." class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="showEditModal = false">Batal</button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)] transition" type="button" @click="saveProfile">
          <AdminIcon name="check" size="14" /> Simpan Profil
        </button>
      </template>
    </AdminModal>

    <AdminToast :message="toastMessage" :kind="toastKind" />
  </section>
</template>
