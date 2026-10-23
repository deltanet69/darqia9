<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { ProfileAccount, NotificationPrefs } from './profilV2Data'

const props = defineProps<{
  profile: ProfileAccount
  isEditing: boolean
  editForm: {
    email: string
    wa: string
  }
  prefs: NotificationPrefs
}>()

const emit = defineEmits<{
  (e: 'update-password', payload: { cur: string; nw: string; conf: string }): void
  (e: 'toggle-pref', key: keyof NotificationPrefs): void
}>()

// State Form Ganti Kata Sandi
const pwCur = ref('')
const pwNew = ref('')
const pwConf = ref('')
const showPwCur = ref(false)
const showPwNew = ref(false)
const showPwConf = ref(false)

const pwError = ref('')
const pwSuccess = ref(false)

// Realtime Password Strength Calculator
const pwStrength = computed(() => {
  const v = pwNew.value || ''
  if (!v) return { score: 0, pct: 0, label: '—', color: 'bg-transparent' }
  let sc = 0
  if (v.length >= 8) sc++
  if (/[A-Z]/.test(v)) sc++
  if (/\d/.test(v)) sc++
  if (/[^A-Za-z0-9]/.test(v)) sc++

  const pctMap = [10, 30, 55, 80, 100]
  const lblMap = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat']
  const colorMap = ['bg-[#F04438]', '#F04438', 'bg-[#F79009]', 'bg-[#12B76A]', 'bg-[#047857]']

  return {
    score: sc,
    pct: pctMap[sc],
    label: lblMap[sc],
    color: sc <= 1 ? 'bg-[#F04438]' : sc <= 2 ? 'bg-[#F79009]' : 'bg-[#12B76A]'
  }
})

const handlePasswordSubmit = () => {
  pwError.value = ''
  pwSuccess.value = false

  if (!pwCur.value) {
    pwError.value = 'Kata sandi saat ini wajib diisi.'
    return
  }
  if (pwNew.value.length < 8) {
    pwError.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }
  if (pwNew.value === pwCur.value) {
    pwError.value = 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.'
    return
  }
  if (pwNew.value !== pwConf.value) {
    pwError.value = 'Konfirmasi kata sandi baru tidak cocok. Silakan periksa kembali.'
    return
  }

  emit('update-password', {
    cur: pwCur.value,
    nw: pwNew.value,
    conf: pwConf.value
  })

  pwSuccess.value = true
  pwCur.value = ''
  pwNew.value = ''
  pwConf.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <!-- Seksi 1: Kontak & Akun Login -->
    <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFF2F7] pb-3.5">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">
            Kontak &amp; Akun Login
          </h3>
          <p class="text-xs font-semibold text-[#667085]">
            Email digunakan sebagai username login utama portal.
          </p>
        </div>
        <span class="rounded-full bg-[#E8F0FE] px-3 py-1 text-[11px] font-bold text-[#12459B]">
          Data Pribadi Akun
        </span>
      </div>

      <!-- Edit Mode Form -->
      <div v-if="isEditing" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label class="block text-xs font-bold text-[#344054]">Alamat Email (Username Login)</label>
          <input
            v-model="editForm.email"
            type="email"
            class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
          >
        </div>
        <div>
          <label class="block text-xs font-bold text-[#344054]">Nomor WhatsApp</label>
          <input
            v-model="editForm.wa"
            type="tel"
            class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
          >
        </div>
      </div>

      <!-- View Mode -->
      <div v-else class="mt-4 grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Alamat Email</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.email }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Nomor WhatsApp</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.wa }}</p>
        </div>
      </div>

      <p class="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#667085]">
        <AdminV2Icon name="info" :size="14" class="shrink-0 text-[#1B5FD9]" />
        <span>Jika Anda memperbarui alamat email, gunakan alamat email baru tersebut untuk login berikutnya.</span>
      </p>
    </section>

    <!-- Seksi 2: Ganti Kata Sandi -->
    <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
      <div class="border-b border-[#EFF2F7] pb-3.5">
        <h3 class="text-base font-extrabold text-[#101828]">
          Ganti Kata Sandi
        </h3>
        <p class="text-xs font-semibold text-[#667085]">
          Pastikan kata sandi Anda kuat dan tidak mudah ditebak.
        </p>
      </div>

      <!-- Feedback Banners -->
      <div
        v-if="pwError"
        class="mt-4 rounded-xl border border-[#FECDC2] bg-[#FFF4ED] p-3 text-xs font-semibold text-[#B42318]"
      >
        {{ pwError }}
      </div>

      <div
        v-if="pwSuccess"
        class="mt-4 rounded-xl border border-[#A6F4C5] bg-[#ECFDF5] p-3 text-xs font-semibold text-[#067647]"
      >
        Kata sandi berhasil diperbarui. Silakan gunakan kata sandi baru pada sesi login selanjutnya.
      </div>

      <!-- Form Fields -->
      <form class="mt-4 space-y-3.5" @submit.prevent="handlePasswordSubmit">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <!-- Sandi Saat Ini -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">Sandi Saat Ini</label>
            <div class="relative mt-1.5">
              <input
                v-model="pwCur"
                :type="showPwCur ? 'text' : 'password'"
                autocomplete="current-password"
                class="min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 pr-9 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
              >
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828]"
                @click="showPwCur = !showPwCur"
              >
                <AdminV2Icon name="eye" :size="15" />
              </button>
            </div>
          </div>

          <!-- Sandi Baru -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">Sandi Baru</label>
            <div class="relative mt-1.5">
              <input
                v-model="pwNew"
                :type="showPwNew ? 'text' : 'password'"
                autocomplete="new-password"
                class="min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 pr-9 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
              >
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828]"
                @click="showPwNew = !showPwNew"
              >
                <AdminV2Icon name="eye" :size="15" />
              </button>
            </div>
          </div>

          <!-- Konfirmasi Sandi Baru -->
          <div>
            <label class="block text-xs font-bold text-[#344054]">Konfirmasi Sandi Baru</label>
            <div class="relative mt-1.5">
              <input
                v-model="pwConf"
                :type="showPwConf ? 'text' : 'password'"
                autocomplete="new-password"
                class="min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 pr-9 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
              >
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828]"
                @click="showPwConf = !showPwConf"
              >
                <AdminV2Icon name="eye" :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Password Strength Meter -->
        <div class="flex items-center gap-3 pt-1">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-[#EFF2F7]">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="pwStrength.color"
              :style="{ width: pwStrength.pct + '%' }"
            />
          </div>
          <span class="text-xs font-bold text-[#344054]">
            Kekuatan: {{ pwStrength.label }}
          </span>
        </div>

        <p class="text-[11px] font-semibold text-[#667085]">
          Minimal 8 karakter. Kombinasi huruf besar, angka, dan simbol membuat sandi lebih kuat.
        </p>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12459B]"
          >
            <AdminV2Icon name="shield" :size="15" />
            <span>Perbarui Kata Sandi</span>
          </button>
        </div>
      </form>
    </section>

    <!-- Seksi 3: Preferensi Notifikasi (Toggle Switches) -->
    <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
      <div class="border-b border-[#EFF2F7] pb-3.5">
        <h3 class="text-base font-extrabold text-[#101828]">
          Preferensi Notifikasi
        </h3>
        <p class="text-xs font-semibold text-[#667085]">
          Kelola jalur pengiriman notifikasi, pengumuman, dan reminder.
        </p>
      </div>

      <div class="mt-2 divide-y divide-dashed divide-[#EFF2F7]">
        <!-- Toggle WA -->
        <div class="flex items-center justify-between gap-4 py-3.5">
          <div>
            <b class="block text-xs font-bold text-[#101828]">Notifikasi WhatsApp</b>
            <span class="text-[11px] font-semibold text-[#667085]">Pengumuman resmi dan pengingat dikirim ke nomor WhatsApp Anda.</span>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
            :class="prefs.wa ? 'bg-[#1B5FD9]' : 'bg-[#CBD5E1]'"
            role="switch"
            :aria-checked="prefs.wa"
            @click="emit('toggle-pref', 'wa')"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"
              :class="prefs.wa ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Toggle Email -->
        <div class="flex items-center justify-between gap-4 py-3.5">
          <div>
            <b class="block text-xs font-bold text-[#101828]">Notifikasi Email</b>
            <span class="text-[11px] font-semibold text-[#667085]">Ringkasan agenda mingguan dan berita sekolah dikirim via email.</span>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
            :class="prefs.email ? 'bg-[#1B5FD9]' : 'bg-[#CBD5E1]'"
            role="switch"
            :aria-checked="prefs.email"
            @click="emit('toggle-pref', 'email')"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"
              :class="prefs.email ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Toggle Pengingat Jadwal -->
        <div class="flex items-center justify-between gap-4 py-3.5">
          <div>
            <b class="block text-xs font-bold text-[#101828]">Pengingat Jadwal Mengajar</b>
            <span class="text-[11px] font-semibold text-[#667085]">Notifikasi otomatis 15 menit sebelum jam pelajaran mengajar dimulai.</span>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
            :class="prefs.jadwal ? 'bg-[#1B5FD9]' : 'bg-[#CBD5E1]'"
            role="switch"
            :aria-checked="prefs.jadwal"
            @click="emit('toggle-pref', 'jadwal')"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"
              :class="prefs.jadwal ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- Seksi 4: Sesi Login -->
    <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
      <div class="border-b border-[#EFF2F7] pb-3.5">
        <h3 class="text-base font-extrabold text-[#101828]">
          Sesi Login &amp; Perangkat
        </h3>
        <p class="text-xs font-semibold text-[#667085]">
          Aktivitas sesi autentikasi akun Anda.
        </p>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Login Terakhir</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.lastLogin }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Perangkat Aktif</span>
          <p class="mt-1 text-sm font-bold text-emerald-600">Sesi ini aktif &bull; Token berlaku 30 hari</p>
        </div>
      </div>

      <p class="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#667085]">
        <AdminV2Icon name="info" :size="14" class="shrink-0 text-[#1B5FD9]" />
        <span>Jika ada sesi mencurigakan yang tidak Anda kenali, segera perbarui kata sandi dan hubungi admin sistem.</span>
      </p>
    </section>
  </div>
</template>
