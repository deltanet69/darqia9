<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

export interface BarisPengguna {
  id: string
  name: string
  email: string
  peranId: string | null
  jenjang: string[]
  isPrimarySuperadmin: boolean
}

const props = defineProps<{
  open: boolean
  mode: 'tambah' | 'ubah'
  user: BarisPengguna | null
  peranList: { id: string, nama: string }[]
  akunSayaId: string
  busy: boolean
  error: string
}>()

const emit = defineEmits<{
  tutup: []
  simpan: [payload: Record<string, any>]
  hapus: [id: string]
}>()

const form = reactive({ nama: '', email: '', password: '', peranId: '', smk: true, smp: false })
const konfirmasiHapus = ref(false)

watch(() => props.open, (terbuka) => {
  if (!terbuka) return
  konfirmasiHapus.value = false
  form.nama = props.mode === 'ubah' ? (props.user?.name || '') : ''
  form.email = props.mode === 'ubah' ? (props.user?.email || '') : ''
  form.password = ''
  form.peranId = props.mode === 'ubah' ? (props.user?.peranId || '') : ''
  form.smk = props.mode === 'ubah' ? (props.user?.jenjang || []).includes('SMK') : true
  form.smp = props.mode === 'ubah' ? (props.user?.jenjang || []).includes('SMP') : false
})

const kirim = () => {
  const jenjang = [form.smk ? 'SMK' : null, form.smp ? 'SMP' : null].filter(Boolean)
  if (props.mode === 'tambah') {
    emit('simpan', {
      nama: form.nama.trim(),
      email: form.email.trim(),
      password: form.password,
      peranId: form.peranId || null,
      jenjang
    })
  } else {
    emit('simpan', {
      nama: form.nama.trim(),
      password: form.password,
      peranId: form.peranId || null,
      jenjang
    })
  }
}

const bolehHapus = () => props.mode === 'ubah' && props.user
  && !props.user.isPrimarySuperadmin && props.user.id !== props.akunSayaId

const kelasInput = 'w-full min-h-11 px-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#101828] outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#1B5FD9]/15 placeholder:text-[#98A2B3]'
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-[#0A2A5C]/50 backdrop-blur-[2px]" @click="emit('tutup')" />
    <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
      <div class="p-5 sm:p-6 border-b border-[#E7EBF2] flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">{{ mode === 'tambah' ? 'Tambah Pengguna' : 'Ubah Pengguna' }}</h2>
          <p class="text-xs text-[#667085] mt-0.5">
            {{ mode === 'tambah' ? 'Akun dibuat langsung aktif dan terverifikasi di Supabase Auth.' : 'Perubahan nama, kata sandi, dan peran RBAC akun ini.' }}
          </p>
        </div>
        <button type="button" class="w-9 h-9 rounded-lg hover:bg-[#F2F4F7] text-[#667085] text-lg leading-none" aria-label="Tutup" @click="emit('tutup')">✕</button>
      </div>

      <form class="p-5 sm:p-6 space-y-4" @submit.prevent="kirim">
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5" for="uf-nama">Nama lengkap</label>
          <input id="uf-nama" v-model="form.nama" type="text" required class="w-full" :class="kelasInput" placeholder="cth. Siti Rahmawati">
        </div>
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5" for="uf-email">Email</label>
          <input id="uf-email" v-model="form.email" type="email" :required="mode === 'tambah'" :disabled="mode === 'ubah'" :class="kelasInput" placeholder="nama@sekolah.sch.id">
          <p v-if="mode === 'ubah'" class="text-[11px] text-[#98A2B3] mt-1">Email akun tidak dapat diubah dari sini.</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5" for="uf-pass">
            {{ mode === 'tambah' ? 'Kata sandi awal' : 'Kata sandi baru (opsional)' }}
          </label>
          <input id="uf-pass" v-model="form.password" type="text" :required="mode === 'tambah'" minlength="8" :class="kelasInput" :placeholder="mode === 'tambah' ? 'Minimal 8 karakter' : 'Kosongkan bila tidak diganti'">
        </div>
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5" for="uf-peran">Peran (Hak Akses / RBAC)</label>
          <select id="uf-peran" v-model="form.peranId" :class="kelasInput">
            <option value="">Tanpa peran</option>
            <option v-for="p in peranList" :key="p.id" :value="p.id">{{ p.nama }}</option>
          </select>
        </div>
        <fieldset v-if="form.peranId" class="flex items-center gap-5">
          <legend class="text-xs font-bold text-[#344054] float-left mr-2">Jenjang peran</legend>
          <label class="inline-flex items-center gap-2 text-sm text-[#344054]">
            <input v-model="form.smk" type="checkbox" class="w-4 h-4 accent-[#1B5FD9]"> SMK
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-[#344054]">
            <input v-model="form.smp" type="checkbox" class="w-4 h-4 accent-[#1B5FD9]"> SMP
          </label>
        </fieldset>

        <p v-if="error" class="text-sm text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-xl px-3.5 py-2.5">{{ error }}</p>

        <div class="flex gap-2.5 pt-1">
          <button type="button" class="flex-1 min-h-11 px-4 rounded-xl border border-[#D0D5DD] bg-white text-sm font-bold text-[#344054] hover:bg-[#F8FAFC]" @click="emit('tutup')">Batal</button>
          <button type="submit" :disabled="busy" class="flex-1 min-h-11 px-4 rounded-xl bg-[#101828] text-white text-sm font-bold hover:bg-[#1D2939] disabled:opacity-60">
            {{ busy ? 'Menyimpan…' : (mode === 'tambah' ? 'Buat Akun' : 'Simpan Perubahan') }}
          </button>
        </div>
      </form>

      <div v-if="bolehHapus()" class="px-5 sm:px-6 pb-5 sm:pb-6">
        <div class="border border-[#FECDCA] bg-[#FEF3F2] rounded-xl p-4">
          <template v-if="!konfirmasiHapus">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-bold text-[#B42318]">Hapus akun ini permanen</p>
              <button type="button" class="min-h-9 px-3 rounded-lg bg-[#B42318] text-white text-xs font-bold hover:bg-[#912018]" @click="konfirmasiHapus = true">Hapus Akun</button>
            </div>
          </template>
          <template v-else>
            <p class="text-sm text-[#B42318]">Akun <strong>{{ user?.email }}</strong> beserta penugasan RBAC-nya akan dihapus dan tidak dapat dikembalikan.</p>
            <div class="flex gap-2.5 mt-3">
              <button type="button" class="flex-1 min-h-10 px-3 rounded-lg border border-[#D0D5DD] bg-white text-sm font-bold text-[#344054]" @click="konfirmasiHapus = false">Batal</button>
              <button type="button" :disabled="busy" class="flex-1 min-h-10 px-3 rounded-lg bg-[#B42318] text-white text-sm font-bold hover:bg-[#912018] disabled:opacity-60" @click="emit('hapus', user!.id)">
                {{ busy ? 'Menghapus…' : 'Ya, Hapus Permanen' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
