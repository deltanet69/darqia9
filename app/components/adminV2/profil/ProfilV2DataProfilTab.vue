<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  maskNum,
  type ProfileAccount
} from './profilV2Data'

const props = defineProps<{
  profile: ProfileAccount
  isEditing: boolean
  editForm: {
    alamat: string
    kel: string
    kec: string
    kab: string
  }
}>()

const showNik = ref(false)
const showKk = ref(false)
</script>

<template>
  <div class="space-y-4">
    <!-- Seksi 1: Data Pribadi -->
    <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFF2F7] pb-3.5">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">
            Data Pribadi
          </h3>
          <p class="text-xs font-semibold text-[#667085]">
            Informasi kependudukan dan identitas diri pegawai.
          </p>
        </div>
        <span class="rounded-full bg-[#F3F5F9] px-3 py-1 text-[11px] font-bold text-[#475467]">
          Sumber: Data Induk Pegawai
        </span>
      </div>

      <!-- Grid Data Pokok (Induk Locked) -->
      <div class="mt-4 grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
        <!-- Nama Lengkap -->
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            <span>Nama Lengkap</span>
            <span class="rounded bg-[#EFF2F7] px-1.5 py-0.5 text-[9px] text-[#475467]">Induk</span>
          </span>
          <p class="mt-1 text-sm font-bold text-[#101828]">
            {{ profile.name }}
          </p>
        </div>

        <!-- Jenis Kelamin -->
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            <span>Jenis Kelamin</span>
            <span class="rounded bg-[#EFF2F7] px-1.5 py-0.5 text-[9px] text-[#475467]">Induk</span>
          </span>
          <p class="mt-1 text-sm font-bold text-[#101828]">
            {{ profile.jk }}
          </p>
        </div>

        <!-- Tempat Lahir -->
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            <span>Tempat Lahir</span>
            <span class="rounded bg-[#EFF2F7] px-1.5 py-0.5 text-[9px] text-[#475467]">Induk</span>
          </span>
          <p class="mt-1 text-sm font-bold text-[#101828]">
            {{ profile.tempat }}
          </p>
        </div>

        <!-- Tanggal Lahir -->
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            <span>Tanggal Lahir</span>
            <span class="rounded bg-[#EFF2F7] px-1.5 py-0.5 text-[9px] text-[#475467]">Induk</span>
          </span>
          <p class="mt-1 text-sm font-bold text-[#101828]">
            {{ profile.tgl }}
          </p>
        </div>

        <!-- NIK dengan Sensor Eye Toggle -->
        <div class="relative border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            <span>NIK (Nomor Induk Kependudukan)</span>
            <span class="rounded bg-[#EFF2F7] px-1.5 py-0.5 text-[9px] text-[#475467]">Induk</span>
          </span>
          <div class="mt-1 flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-[#101828]">
              {{ showNik ? profile.nik : maskNum(profile.nik) }}
            </span>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F5F9] hover:text-[#101828]"
              :aria-label="showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'"
              @click="showNik = !showNik"
            >
              <AdminV2Icon name="eye" :size="15" />
            </button>
          </div>
        </div>

        <!-- No Kartu Keluarga -->
        <div class="relative border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            <span>Nomor Kartu Keluarga (KK)</span>
            <span class="rounded bg-[#EFF2F7] px-1.5 py-0.5 text-[9px] text-[#475467]">Induk</span>
          </span>
          <div class="mt-1 flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-[#101828]">
              {{ showKk ? profile.kk : maskNum(profile.kk) }}
            </span>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F5F9] hover:text-[#101828]"
              :aria-label="showKk ? 'Sembunyikan KK' : 'Tampilkan KK'"
              @click="showKk = !showKk"
            >
              <AdminV2Icon name="eye" :size="15" />
            </button>
          </div>
        </div>
      </div>

      <!-- Bagian Alamat Domisili (Dapat Diubah) -->
      <div class="mt-5 border-t border-[#EFF2F7] pt-4">
        <div class="flex items-center gap-2 mb-3">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#344054]">
            Alamat Domisili
          </h4>
          <span
            class="rounded-md px-2 py-0.5 text-[9.5px] font-bold"
            :class="isEditing ? 'bg-[#E8F0FE] text-[#1B5FD9]' : 'bg-[#EFF2F7] text-[#667085]'"
          >
            {{ isEditing ? 'Sedang diedit' : 'Dapat diubah' }}
          </span>
        </div>

        <!-- Form Edit Mode -->
        <div v-if="isEditing" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-bold text-[#344054]">Alamat Lengkap</label>
            <input
              v-model="editForm.alamat"
              type="text"
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
          </div>
          <div>
            <label class="block text-xs font-bold text-[#344054]">Kelurahan / Desa</label>
            <input
              v-model="editForm.kel"
              type="text"
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
          </div>
          <div>
            <label class="block text-xs font-bold text-[#344054]">Kecamatan</label>
            <input
              v-model="editForm.kec"
              type="text"
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
          </div>
          <div>
            <label class="block text-xs font-bold text-[#344054]">Kabupaten / Kota</label>
            <input
              v-model="editForm.kab"
              type="text"
              class="mt-1.5 min-h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/20"
            >
          </div>
        </div>

        <!-- View Mode -->
        <div v-else class="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
          <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
            <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Alamat Lengkap</span>
            <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.alamat }}</p>
          </div>
          <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
            <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Kelurahan / Desa</span>
            <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.kel }}</p>
          </div>
          <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
            <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Kecamatan</span>
            <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.kec }}</p>
          </div>
          <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
            <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Kabupaten / Kota</span>
            <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.kab }}</p>
          </div>
        </div>
      </div>

      <p class="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#667085]">
        <AdminV2Icon name="info" :size="14" class="shrink-0 text-[#1B5FD9]" />
        <span>NIK &amp; No. KK tersamar demi keamanan. Data bertanda Induk hanya dapat diubah Admin TU melalui dokumen SK/pendukung.</span>
      </p>
    </section>

    <!-- Seksi 2: Data Kepegawaian & Smartcard RFID -->
    <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFF2F7] pb-3.5">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">
            Data Kepegawaian
          </h3>
          <p class="text-xs font-semibold text-[#667085]">
            Penugasan akademik, legalitas pegawai, dan identitas fisik RFID.
          </p>
        </div>
        <span class="rounded-full bg-[#F3F5F9] px-3 py-1 text-[11px] font-bold text-[#475467]">
          Dikelola Admin TU
        </span>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">NIP</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.nip }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">NUPTK</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.nuptk }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Unit Sekolah</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.unit }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Jabatan &amp; Tugas</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.jabatan }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Mata Pelajaran Utama</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.mapel }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Status Kepegawaian</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.statusPeg }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Pendidikan Terakhir</span>
          <p class="mt-1 text-sm font-bold text-[#101828]">{{ profile.pendidikan }}</p>
        </div>
        <div class="border-b border-dashed border-[#EFF2F7] pb-2.5">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">Status Akun Portal</span>
          <p class="mt-1 text-sm font-bold text-emerald-600">{{ profile.akun }}</p>
        </div>
      </div>

      <!-- Smartcard Presensi 3D Card Visual -->
      <div class="mt-6 border-t border-[#EFF2F7] pt-5">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#344054] mb-3">
          Smartcard / Kartu RFID Presensi
        </h4>

        <div class="max-w-sm rounded-2xl bg-gradient-to-br from-[#0E2547] to-[#1D4ED8] p-5 text-white shadow-xl transition-transform hover:scale-[1.01]">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold tracking-widest uppercase text-[#BCD2F7]">
              Darqia Smartcard
            </span>
            <AdminV2Icon name="wifi" :size="20" class="text-[#BCD2F7]" />
          </div>

          <!-- Chip Emas -->
          <div class="my-4 h-8 w-11 rounded-md bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#D97706] shadow-inner" />

          <div>
            <span class="block text-sm font-bold tracking-wide uppercase">
              {{ profile.name }}
            </span>
            <span class="mt-1 block font-mono text-base font-bold tracking-widest text-white">
              {{ profile.rfid }}
            </span>
            <span class="mt-1 block text-[10.5px] font-semibold text-[#BCD2F7]">
              {{ profile.unit }} &bull; Presensi Guru &amp; Staff
            </span>
          </div>
        </div>

        <p class="mt-3.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#667085]">
          <AdminV2Icon name="info" :size="14" class="shrink-0 text-[#1B5FD9]" />
          <span>Kartu ini digunakan untuk tap kehadiran di gerbang. Jika hilang atau rusak, laporkan ke Admin TU untuk penerbitan ulang.</span>
        </p>
      </div>
    </section>
  </div>
</template>
