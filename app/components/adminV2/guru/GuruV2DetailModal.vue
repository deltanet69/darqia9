<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { StaffItem } from '~/composables/useAdminTeachers'

const props = defineProps<{
  isOpen: boolean
  staff: StaffItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', staff: StaffItem): void
  (e: 'sync-user', staff: StaffItem): void
}>()

const formattedBirthDate = computed(() => {
  if (!props.staff?.birthDate) return '-'
  try {
    const d = new Date(props.staff.birthDate)
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  } catch (e) {
    return props.staff.birthDate
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && staff"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#0C111D]/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dossier Panel -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 border border-[#E7EBF2] my-4 sm:my-8 animate-scaleUp flex flex-col max-h-[92vh]"
      >
        <!-- Modal Top Bar -->
        <div class="px-6 py-4 border-b border-[#F2F4F7] flex items-center justify-between bg-[#F8FAFC]">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F0FE] text-[#1B5FD9] border border-[#BFDBFE]">
              <AdminV2Icon name="users" :size="13" />
              <span>Dossier Kepegawaian</span>
            </span>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
              :class="{
                'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]': staff.unit === 'SMP',
                'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]': staff.unit === 'SMK',
                'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]': staff.unit === 'Yayasan'
              }"
            >
              {{ staff.unit === 'SMP' ? 'SMP IT BCA' : staff.unit === 'SMK' ? 'SMK IT Attaqwa 9' : 'Yayasan / TU' }}
            </span>
          </div>

          <button
            type="button"
            class="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E2E8F0] rounded-xl transition cursor-pointer"
            aria-label="Tutup modal"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="20" />
          </button>
        </div>

        <!-- Scrollable Dossier Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <!-- Profile Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-[#F2F4F7]">
            <div
              class="w-16 h-16 rounded-2xl text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md"
              :class="staff.unit === 'SMP' ? 'bg-[#059669]' : staff.unit === 'SMK' ? 'bg-[#1B5FD9]' : 'bg-[#7C3AED]'"
            >
              {{ staff.name.charAt(0) }}
            </div>

            <div class="flex-1 min-w-0">
              <h2 class="text-lg sm:text-xl font-extrabold text-[#101828] leading-tight">
                {{ staff.name }}
              </h2>
              <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#64748B]">
                <span class="font-mono font-bold text-[#101828] bg-[#F2F4F7] px-2 py-0.5 rounded">
                  NIP: {{ staff.nip }}
                </span>
                <span>&bull;</span>
                <span class="font-medium text-[#475467]">{{ staff.role }}</span>
                <span>&bull;</span>
                <span class="font-bold text-[#059669]">{{ staff.status }}</span>
              </div>
            </div>
          </div>

          <!-- Section 1: Data Pokok Kependudukan -->
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] mb-3 flex items-center gap-2">
              <AdminV2Icon name="card" :size="14" class="text-[#1B5FD9]" />
              <span>Data Pokok Kependudukan</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Nomor Induk Kependudukan (NIK)</span>
                <b class="font-mono text-sm text-[#101828] font-bold">{{ staff.nik || 'Belum diisi' }}</b>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Nomor Kartu Keluarga (No KK)</span>
                <b class="font-mono text-sm text-[#101828] font-bold">{{ staff.noKk || 'Belum diisi' }}</b>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">NUPTK</span>
                <b class="font-mono text-sm text-[#101828] font-bold">{{ staff.nuptk || '-' }}</b>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Tempat, Tanggal Lahir</span>
                <b class="text-sm text-[#101828] font-bold">
                  {{ staff.birthPlace ? `${staff.birthPlace}, ${formattedBirthDate}` : formattedBirthDate }}
                </b>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Jenis Kelamin</span>
                <b class="text-sm text-[#101828] font-bold">{{ staff.gender || 'Laki laki' }}</b>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Pendidikan Terakhir</span>
                <b class="text-sm text-[#101828] font-bold">{{ staff.education || 'S1 Pendidikan' }}</b>
              </div>
            </div>
          </div>

          <!-- Section 2: Kontak & Akses Akun Portal -->
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] mb-3 flex items-center gap-2">
              <AdminV2Icon name="mail" :size="14" class="text-[#1B5FD9]" />
              <span>Kontak &amp; Akses Portal</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE]">
                <span class="text-[#1E40AF] block mb-0.5 font-medium">Alamat Email (Login Portal)</span>
                <b class="font-mono text-sm text-[#1E3A8A] font-bold block truncate">
                  {{ staff.email || 'Email belum didaftarkan' }}
                </b>
                <span class="text-[11px] text-[#3B82F6] block mt-1">
                  Digunakan untuk masuk ke Admin Portal &amp; CBT Ujian
                </span>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">No. Telepon / WhatsApp</span>
                <b class="font-mono text-sm text-[#101828] font-bold block">
                  {{ staff.phone || '-' }}
                </b>
                <a
                  v-if="staff.phone"
                  :href="`https://wa.me/${staff.phone.replace(/^0/, '62').replace(/\D/g, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 text-[11px] text-[#059669] font-bold mt-1 hover:underline"
                >
                  Hubungi via WhatsApp &rarr;
                </a>
              </div>
            </div>

            <!-- Status Sinkronisasi Akun User Management -->
            <div class="mt-3 p-3.5 rounded-xl border flex items-center justify-between gap-3"
              :class="staff.isUserSynced ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#FFFBEB] border-[#FDE68A]'"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="staff.isUserSynced ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'"
                >
                  <AdminV2Icon :name="staff.isUserSynced ? 'check' : 'alert'" :size="16" />
                </div>
                <div>
                  <b class="text-xs font-bold block" :class="staff.isUserSynced ? 'text-[#065F46]' : 'text-[#92400E]'">
                    {{ staff.isUserSynced ? 'Akun Portal Terhubung (User Management)' : 'Belum Disinkronkan ke User Management' }}
                  </b>
                  <span class="text-[11px] block" :class="staff.isUserSynced ? 'text-[#047857]' : 'text-[#B45309]'">
                    {{ staff.isUserSynced ? 'Guru dapat login dengan email atau NIP terdaftar.' : 'Klik tombol di samping untuk membuat akun login guru secara instan.' }}
                  </span>
                </div>
              </div>

              <button
                v-if="!staff.isUserSynced"
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs transition cursor-pointer shrink-0"
                @click="emit('sync-user', staff)"
              >
                Buat Akun Portal
              </button>
            </div>
          </div>

          <!-- Section 3: Alamat & Domisili -->
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] mb-3 flex items-center gap-2">
              <AdminV2Icon name="map-pin" :size="14" class="text-[#1B5FD9]" />
              <span>Alamat &amp; Domisili</span>
            </h4>
            <div class="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6] space-y-2 text-xs">
              <div>
                <span class="text-[#64748B] block font-medium">Alamat Lengkap:</span>
                <p class="text-sm font-semibold text-[#101828] mt-0.5">
                  {{ staff.address || 'Alamat belum diisi lengkap' }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#EEF2F6]">
                <div>
                  <span class="text-[#64748B] block font-medium">Kelurahan / Desa</span>
                  <b class="text-[#101828] font-semibold">{{ staff.kelurahan || '-' }}</b>
                </div>
                <div>
                  <span class="text-[#64748B] block font-medium">Kecamatan</span>
                  <b class="text-[#101828] font-semibold">{{ staff.kecamatan || '-' }}</b>
                </div>
                <div>
                  <span class="text-[#64748B] block font-medium">Kabupaten / Kota</span>
                  <b class="text-[#101828] font-semibold">{{ staff.kabKota || 'Kab. Bekasi' }}</b>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Penugasan & Presensi RFID -->
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] mb-3 flex items-center gap-2">
              <AdminV2Icon name="layers" :size="14" class="text-[#1B5FD9]" />
              <span>Penugasan &amp; Smartcard Presensi</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Mata Pelajaran</span>
                <b class="text-sm text-[#101828] font-bold">{{ staff.subject || '-' }}</b>
              </div>

              <div class="p-3 bg-[#F8FAFC] rounded-xl border border-[#EEF2F6]">
                <span class="text-[#64748B] block mb-0.5 font-medium">Status Pegawai</span>
                <b class="text-sm text-[#101828] font-bold">{{ staff.status }}</b>
              </div>

              <div class="p-3 bg-[#F5F3FF] rounded-xl border border-[#DDD6FE]">
                <span class="text-[#6D28D9] block mb-0.5 font-medium">UID Kartu RFID</span>
                <b class="font-mono text-sm text-[#5B21B6] font-bold flex items-center gap-1.5">
                  <AdminV2Icon name="card" :size="14" />
                  <span>{{ staff.rfidUid || '-' }}</span>
                </b>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-[#F2F4F7] flex items-center justify-between bg-white shrink-0">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#475467] hover:bg-[#F2F4F7] transition cursor-pointer"
            @click="emit('close')"
          >
            Tutup
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#1B5FD9] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition flex items-center gap-1.5 cursor-pointer"
              @click="emit('edit', staff)"
            >
              <AdminV2Icon name="pencil" :size="15" />
              <span>Ubah Profil Guru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
