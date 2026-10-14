<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import type { StudentItem } from '~/composables/useAdminStudents'

const props = defineProps<{
  student: StudentItem | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'edit', s: StudentItem): void
}>()

const activeTab = ref<'pribadi' | 'ortu' | 'akademik' | 'fisik' | 'rfid'>('pribadi')

const tabs = [
  { id: 'pribadi', label: 'Biodata & Alamat' },
  { id: 'ortu', label: 'Data Orang Tua' },
  { id: 'akademik', label: 'Akademik & Asal Sekolah' },
  { id: 'fisik', label: 'Fisik & Tambahan' },
  { id: 'rfid', label: 'RFID ID Card' }
] as const

watch(
  () => props.student,
  (val) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = val ? 'hidden' : ''
    }
  }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="student"
      class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 md:p-6 overflow-y-auto"
    >
      <!-- Backdrop Gelap dengan Blur Halus -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-950/65 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
          @click="$emit('close')"
        />
      </Transition>

      <!-- Centered Modal Card (Keren, Modern, Mobile-First) -->
      <Transition
        enter-active-class="transition duration-200 ease-out transform"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in transform"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          class="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/30 border border-slate-200/90 z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto font-admin"
          role="dialog"
          aria-modal="true"
        >
          <!-- HEADER STICKY -->
          <div class="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-xs sticky top-0 z-10">
            <div class="flex items-center gap-3.5 min-w-0">
              <span
                class="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs"
                :class="student.gender === 'L' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-pink-500 to-rose-700'"
              >
                {{ initials(student.name) }}
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug truncate">
                    {{ student.name }}
                  </h3>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                    :class="student.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                  >
                    {{ student.status }}
                  </span>
                  <span v-if="student.hasRfid" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                    RFID Ready
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
                  ID: <b class="font-mono text-blue-600 font-bold">{{ student.id }}</b> &bull; NIS: <b>{{ student.nis || '-' }}</b> &bull; NISN: <b>{{ student.nisn }}</b> &bull; Kelas: <b>{{ student.className }}</b>
                  <template v-if="student.major"> &bull; {{ student.major }}</template>
                </p>
              </div>
            </div>
            <button
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer touch-manipulation shrink-0"
              type="button"
              aria-label="Tutup dialog"
              @click="$emit('close')"
            >
              <AdminIcon name="x" size="18" />
            </button>
          </div>

          <!-- TABS HEADER (TOUCH FRIENDLY) -->
          <div class="flex gap-2 px-5 sm:px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto shrink-0">
            <button
              v-for="t in tabs"
              :key="t.id"
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition min-h-[38px] cursor-pointer"
              :class="activeTab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'"
              @click="activeTab = t.id"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- MODAL BODY -->
          <div class="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-slate-800 text-sm">
          <!-- TAB 1: BIODATA & ALAMAT -->
          <div v-if="activeTab === 'pribadi'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">ID Siswa (Billing / Tagihan)</span>
              <b class="font-mono text-blue-600 text-sm font-bold">{{ student.id }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Nama Lengkap</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.name }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Jenis Kelamin</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">NISN</span>
              <b class="font-mono text-slate-800 text-sm font-semibold">{{ student.nisn }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Nomor Induk Siswa (NIS)</span>
              <b class="font-mono text-slate-800 text-sm font-semibold">{{ student.nis || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">NIK Siswa</span>
              <b class="font-mono text-slate-800 text-sm font-semibold">{{ student.nik || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Nomor Kartu Keluarga (KK)</span>
              <b class="font-mono text-slate-800 text-sm font-semibold">{{ student.noKk || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Tempat, Tanggal Lahir</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.birthPlace }}, {{ student.birthDate }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Agama</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.religion || 'Islam' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:col-span-2">
              <span class="block text-slate-400 mb-0.5">Alamat Lengkap</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.address }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">RT / RW</span>
              <b class="text-slate-800 text-sm font-semibold">RT {{ student.rt || '-' }} / RW {{ student.rw || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Kelurahan / Desa</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.village || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Kecamatan & Kota</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.district || '-' }}, {{ student.city || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">No. Handphone / WA Siswa</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.phone || '-' }}</b>
            </div>
          </div>

          <!-- TAB 2: DATA ORANG TUA -->
          <div v-else-if="activeTab === 'ortu'" class="space-y-4 text-xs">
            <!-- AYAH -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AdminIcon name="user" size="16" class="text-blue-600" /> Data Ayah / Wali
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span class="block text-slate-400 mb-0.5">Nama Ayah</span>
                  <b class="text-slate-800 font-semibold">{{ student.fatherName || '-' }}</b>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">NIK Ayah</span>
                  <b class="font-mono text-slate-800 font-semibold">{{ student.fatherNik || '-' }}</b>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Tahun Lahir & Pendidikan</span>
                  <b class="text-slate-800 font-semibold">{{ student.fatherBirthYear || '-' }} &bull; {{ student.fatherEducation || '-' }}</b>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Pekerjaan & Penghasilan</span>
                  <b class="text-slate-800 font-semibold">{{ student.fatherJob || '-' }} ({{ student.fatherIncome || '-' }})</b>
                </div>
                <div class="sm:col-span-2">
                  <span class="block text-slate-400 mb-0.5">Kontak WhatsApp Ayah</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <b class="text-slate-800 font-semibold">{{ student.fatherPhone || '-' }}</b>
                    <a
                      v-if="student.fatherPhone"
                      :href="`https://wa.me/62${student.fatherPhone.replace(/^0/, '')}`"
                      target="_blank"
                      class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition"
                    >
                      Kirim Pesan WA
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- IBU -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AdminIcon name="user" size="16" class="text-pink-600" /> Data Ibu Kandung
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span class="block text-slate-400 mb-0.5">Nama Ibu</span>
                  <b class="text-slate-800 font-semibold">{{ student.motherName || '-' }}</b>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">NIK Ibu</span>
                  <b class="font-mono text-slate-800 font-semibold">{{ student.motherNik || '-' }}</b>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Tahun Lahir & Pendidikan</span>
                  <b class="text-slate-800 font-semibold">{{ student.motherBirthYear || '-' }} &bull; {{ student.motherEducation || '-' }}</b>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Pekerjaan & Penghasilan</span>
                  <b class="text-slate-800 font-semibold">{{ student.motherJob || '-' }} ({{ student.motherIncome || '-' }})</b>
                </div>
                <div class="sm:col-span-2">
                  <span class="block text-slate-400 mb-0.5">Kontak WhatsApp Ibu</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <b class="text-slate-800 font-semibold">{{ student.motherPhone || '-' }}</b>
                    <a
                      v-if="student.motherPhone"
                      :href="`https://wa.me/62${student.motherPhone.replace(/^0/, '')}`"
                      target="_blank"
                      class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition"
                    >
                      Kirim Pesan WA
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: AKADEMIK & ASAL SEKOLAH -->
          <div v-else-if="activeTab === 'akademik'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Jenjang Sekolah</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.level === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Kelas / Rombel</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.className }}</b>
            </div>
            <div v-if="student.major" class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Program Keahlian (Jurusan)</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.major }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Tahun Masuk (Angkatan)</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.entryYear }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Sekolah Asal</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.prevSchool || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Presensi Kehadiran</span>
              <b class="text-emerald-700 text-sm font-bold">{{ student.attendancePct }}%</b>
            </div>
          </div>

          <!-- TAB 4: FISIK & TAMBAHAN -->
          <div v-else-if="activeTab === 'fisik'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Anak Ke-</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.birthOrder ? `Anak ke-${student.birthOrder}` : '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Jumlah Saudara Kandung</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.siblingsCount !== undefined ? `${student.siblingsCount} bersaudara` : '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Tinggi Badan</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.height ? `${student.height} cm` : '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Berat Badan</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.weight ? `${student.weight} kg` : '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Hobi Siswa</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.hobby || '-' }}</b>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span class="block text-slate-400 mb-0.5">Cita-cita</span>
              <b class="text-slate-800 text-sm font-semibold">{{ student.ambition || '-' }}</b>
            </div>
          </div>

          <!-- TAB 5: RFID & ABSENSI -->
          <div v-else-if="activeTab === 'rfid'" class="space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span class="block text-slate-400 mb-0.5">Status Kartu RFID</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="student.hasRfid ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'">
                  {{ student.hasRfid ? 'Terdaftar & Aktif' : 'Belum Ada Kartu' }}
                </span>
              </div>
              <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span class="block text-slate-400 mb-0.5">UID Kartu RFID</span>
                <b class="font-mono text-slate-800 text-sm font-semibold">{{ student.rfidUid || 'Belum di-assign' }}</b>
              </div>
            </div>
            <div class="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
              <b class="block text-sm font-bold text-slate-900 mb-1">Metode Absensi Siswa</b>
              <p class="text-xs text-slate-600 leading-relaxed">
                Sesuai aturan sekolah pada dokumen <b>PRD.md & AGENTS.md</b>, absensi siswa wajib menggunakan <b>RFID ID Card</b> (bukan QR / PIN). Kartu ini digunakan untuk tap-in di gerbang sekolah.
              </p>
            </div>
          </div>
        </div>

        <!-- FOOTER STICKY (TOUCH FRIENDLY) -->
        <div class="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/90 backdrop-blur-xs">
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
            type="button"
            @click="$emit('edit', student)"
          >
            <AdminIcon name="pencil" size="16" />
            <span>Edit Biodata</span>
          </button>
          <button
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition min-h-[44px] cursor-pointer"
            type="button"
            @click="$emit('close')"
          >
            Tutup
          </button>
        </div>
      </div>
    </Transition>
  </div>
</Teleport>
</template>
