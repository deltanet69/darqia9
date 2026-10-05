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
    <div v-if="student" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10" role="dialog" aria-modal="true">
        <!-- HEADER -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div class="flex items-center gap-3.5">
            <span
              class="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-base shrink-0"
              :class="student.gender === 'L' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-pink-500 to-rose-700'"
            >
              {{ initials(student.name) }}
            </span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-slate-900">{{ student.name }}</h3>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="student.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">{{ student.status }}</span>
                <span v-if="student.hasRfid" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200">RFID Ready</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                ID: <b class="font-mono text-blue-600 font-bold">{{ student.id }}</b> &bull; NIS: <b>{{ student.nis || '-' }}</b> &bull; NISN: <b>{{ student.nisn }}</b> &bull; Kelas: <b>{{ student.className }}</b>
                <template v-if="student.major"> &bull; {{ student.major }}</template>
              </p>
            </div>
          </div>
          <button class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition" type="button" aria-label="Tutup" @click="$emit('close')">
            <AdminIcon name="x" size="18" />
          </button>
        </div>

        <!-- TABS HEADER -->
        <div class="flex gap-1 px-5 pt-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto shrink-0">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            class="px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2"
            :class="activeTab === t.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'"
            @click="activeTab = t.id"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- MODAL BODY -->
        <div class="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
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

        <!-- FOOTER -->
        <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <button class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition" type="button" @click="$emit('edit', student)">
            <AdminIcon name="pencil" size="14" /> Edit Biodata
          </button>
          <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition" type="button" @click="$emit('close')">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
