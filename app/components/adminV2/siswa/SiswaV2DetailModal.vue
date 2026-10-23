<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { Student } from './siswaV2Data'

interface Props {
  student: Student | null
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', student: Student): void
}>()

const activeTab = ref<'pribadi' | 'ortu' | 'akademik' | 'fisik' | 'rfid'>('pribadi')

const tabs = [
  { id: 'pribadi', label: 'Biodata' },
  { id: 'ortu', label: 'Orang Tua' },
  { id: 'akademik', label: 'Akademik' },
  { id: 'fisik', label: 'Fisik' },
  { id: 'rfid', label: 'Smartcard' }
]

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const statusChipClass = (status: string): string => {
  switch (status) {
    case 'Aktif':
      return 'bg-[#E7F8F0] text-[#067647]'
    case 'Lulus':
      return 'bg-[#EFF2F7] text-[#344054]'
    case 'Pindah':
      return 'bg-[#FEF4E5] text-[#B54708]'
    case 'Nonaktif':
      return 'bg-[#FDECEA] text-[#B42318]'
    default:
      return 'bg-[#EFF2F7] text-[#344054]'
  }
}
</script>

<template>
  <div
    v-if="student"
    class="fixed inset-0 z-50 bg-[#101828]/45 flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-[20px] w-full max-w-[580px] max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative animate-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start gap-3.5 mb-2">
        <span
          class="w-[52px] h-[52px] rounded-2xl flex items-center justify-center font-extrabold text-[17px] shrink-0"
          :class="student.gender === 'L' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#FCE8F3] text-[#A91E4E]'"
        >
          {{ getInitials(student.name) }}
        </span>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-base font-extrabold text-[#101828] truncate">
              {{ student.name }}
            </h3>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              :class="statusChipClass(student.status)"
            >
              {{ student.status }}
            </span>
          </div>

          <div class="text-[11.5px] text-[#667085] mt-0.5 flex flex-wrap items-center gap-1.5 font-medium">
            <span class="font-mono font-bold" :class="jenjang === 'smp' ? 'text-[#166534]' : 'text-[#12459B]'">
              {{ student.id }}
            </span>
            <span>&bull;</span>
            <span class="font-mono">NISN {{ student.nisn }}</span>
            <span>&bull;</span>
            <span>Kelas {{ student.className }}</span>
          </div>
        </div>

        <button
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
          aria-label="Tutup modal"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Segmented Tabs -->
      <div class="flex gap-1.5 overflow-x-auto p-1 bg-[#EFF2F7] rounded-xl my-3.5 scrollbar-none">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="flex-1 text-xs font-bold py-2 px-3 rounded-[9px] transition whitespace-nowrap cursor-pointer"
          :class="[
            activeTab === t.id
              ? jenjang === 'smp'
                ? 'bg-[#16A34A] text-white shadow-sm'
                : 'bg-[#1B5FD9] text-white shadow-sm'
              : 'text-[#667085] hover:text-[#101828]'
          ]"
          @click="activeTab = t.id as any"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="text-[12.5px]">
        <!-- TAB 1: Biodata Pribadi -->
        <div v-if="activeTab === 'pribadi'" class="divide-y divide-[#EFF2F7]">
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">ID Siswa</span>
            <span class="font-mono font-bold" :class="jenjang === 'smp' ? 'text-[#166534]' : 'text-[#12459B]'">{{ student.id }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Nama Lengkap</span>
            <span class="font-bold text-[#101828] text-right">{{ student.name }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Jenis Kelamin</span>
            <span class="font-bold text-[#101828]">{{ student.gender === 'L' ? 'Laki laki (L)' : 'Perempuan (P)' }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">NISN</span>
            <span class="font-mono font-bold text-[#101828]">{{ student.nisn }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">NIS</span>
            <span class="font-mono font-bold text-[#101828]">{{ student.nis }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Tempat, Tanggal Lahir</span>
            <span class="font-bold text-[#101828] text-right">{{ student.birthPlace }}, {{ student.birthDate }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Alamat</span>
            <span class="font-bold text-[#101828] text-right max-w-[300px] truncate">{{ student.address }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">No. HP / WA</span>
            <span class="font-bold text-[#101828]">{{ student.phone }}</span>
          </div>
        </div>

        <!-- TAB 2: Orang Tua -->
        <div v-else-if="activeTab === 'ortu'" class="space-y-3">
          <!-- Ayah / Wali -->
          <div class="bg-[#F8FAFD] border border-[#E7EBF2] rounded-2xl p-3.5">
            <div class="text-[12.5px] font-extrabold text-[#101828] mb-2">Ayah / Wali</div>
            <div class="flex items-center justify-between py-1.5 border-b border-[#EFF2F7]">
              <span class="text-[#667085] font-semibold">Nama</span>
              <span class="font-bold text-[#101828]">{{ student.father }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5 pt-2">
              <span class="text-[#667085] font-semibold">Kontak WA</span>
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#101828]">{{ student.fphone }}</span>
                <a
                  :href="`https://wa.me/62${student.fphone.replace(/^0/, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 text-[11px] font-bold text-[#067647] bg-[#E7F8F0] px-2.5 py-1 rounded-full hover:bg-[#D3F0E2] transition"
                >
                  <AdminV2Icon name="phone" :size="12" />
                  Chat
                </a>
              </div>
            </div>
          </div>

          <!-- Ibu Kandung -->
          <div class="bg-[#F8FAFD] border border-[#E7EBF2] rounded-2xl p-3.5">
            <div class="text-[12.5px] font-extrabold text-[#101828] mb-2">Ibu Kandung</div>
            <div class="flex items-center justify-between py-1.5 border-b border-[#EFF2F7]">
              <span class="text-[#667085] font-semibold">Nama</span>
              <span class="font-bold text-[#101828]">{{ student.mother }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5 pt-2">
              <span class="text-[#667085] font-semibold">Kontak WA</span>
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#101828]">{{ student.fphone }}</span>
                <a
                  :href="`https://wa.me/62${student.fphone.replace(/^0/, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 text-[11px] font-bold text-[#067647] bg-[#E7F8F0] px-2.5 py-1 rounded-full hover:bg-[#D3F0E2] transition"
                >
                  <AdminV2Icon name="phone" :size="12" />
                  Chat
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: Akademik -->
        <div v-else-if="activeTab === 'akademik'" class="divide-y divide-[#EFF2F7]">
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Jenjang</span>
            <span class="font-bold text-[#101828]">{{ student.level === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Kelas / Rombel</span>
            <span class="font-bold text-[#101828]">{{ student.className }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Jurusan</span>
            <span class="font-bold text-[#101828]">{{ student.major || '—' }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Tahun Masuk</span>
            <span class="font-bold text-[#101828]">{{ student.entryYear }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Sekolah Asal</span>
            <span class="font-bold text-[#101828]">{{ student.prevSchool }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-[#667085] font-semibold">Kehadiran</span>
            <span class="font-extrabold text-[#067647]">{{ student.att }}%</span>
          </div>
        </div>

        <!-- TAB 4: Fisik -->
        <div v-else-if="activeTab === 'fisik'">
          <div class="flex items-center justify-between py-2.5 border-b border-[#EFF2F7]">
            <span class="text-[#667085] font-semibold">Data Tambahan</span>
            <span class="font-bold text-[#101828]">Tersedia di dokumen induk</span>
          </div>
          <div class="bg-[#E8F0FE] border border-[#C9DCFB] text-[#0A2A5C] rounded-2xl p-3.5 flex items-start gap-2.5 mt-3.5 leading-relaxed">
            <AdminV2Icon name="info" :size="18" class="shrink-0 mt-0.5 text-[#1B5FD9]" />
            <span>Detail fisik (tinggi/berat badan, hobi, cita-cita) dikelola di Data Induk terpusat dan tersinkron otomatis ke sini.</span>
          </div>
        </div>

        <!-- TAB 5: Smartcard -->
        <div v-else-if="activeTab === 'rfid'">
          <div class="flex items-center justify-between py-2.5 border-b border-[#EFF2F7]">
            <span class="text-[#667085] font-semibold">Status Kartu</span>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              :class="student.hasRfid ? 'bg-[#E7F8F0] text-[#067647]' : 'bg-[#FEF4E5] text-[#B54708]'"
            >
              {{ student.hasRfid ? 'Terdaftar & Aktif' : 'Belum Ada Kartu' }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-[#EFF2F7]">
            <span class="text-[#667085] font-semibold">UID Kartu</span>
            <span class="font-mono font-bold text-[#101828]">{{ student.rfidUid || 'Belum di-assign' }}</span>
          </div>
          <div class="bg-[#E8F0FE] border border-[#C9DCFB] text-[#0A2A5C] rounded-2xl p-3.5 flex items-start gap-2.5 mt-3.5 leading-relaxed">
            <AdminV2Icon name="info" :size="18" class="shrink-0 mt-0.5 text-[#1B5FD9]" />
            <span>Absensi siswa wajib memakai <b>kartu smartcard</b> (tap di gerbang). QR / PIN tidak digunakan.</span>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-2.5 mt-5 pt-3.5 border-t border-[#EFF2F7]">
        <button
          type="button"
          class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-bold text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="emit('close')"
        >
          Tutup
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition shadow-sm cursor-pointer"
          :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#174FB5]'"
          @click="emit('edit', student)"
        >
          <AdminV2Icon name="pencil" :size="14" />
          Edit Biodata
        </button>
      </div>
    </div>
  </div>
</template>
