<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { GradeType, ViolationLog, TeacherAccessItem, ParticipantItem } from './cbtV2Data'
import {
  INITIAL_VIOLATIONS,
  INITIAL_TEACHERS,
  INITIAL_PARTICIPANTS
} from './cbtV2Data'

interface Props {
  grade: GradeType
  isFrozen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-freeze'): void
  (e: 'toast', msg: string): void
}>()

const activeSubNav = ref<'violations' | 'teachers' | 'participants'>('violations')

// Reactive local stores
const violations = ref<ViolationLog[]>(JSON.parse(JSON.stringify(INITIAL_VIOLATIONS)))
const teachers = ref<TeacherAccessItem[]>(JSON.parse(JSON.stringify(INITIAL_TEACHERS)))
const participants = ref<ParticipantItem[]>(JSON.parse(JSON.stringify(INITIAL_PARTICIPANTS)))

// Unlock PIN Sheet State
const isUnlockSheetOpen = ref(false)
const selectedViolation = ref<ViolationLog | null>(null)

// Freeze confirmation modal state
const isFreezeModalOpen = ref(false)

const currentViolations = computed(() => {
  return violations.value.filter(v => v.grade === props.grade)
})

const currentTeachers = computed(() => {
  return teachers.value.filter(t => t.grade === props.grade)
})

const currentParticipants = computed(() => {
  return participants.value.filter(p =>
    props.grade === 'SMP' ? /^(VII|VIII|IX)/.test(p.classroom) : /(RPL|TKJ)/.test(p.classroom)
  )
})

const openUnlockSheet = (v: ViolationLog) => {
  selectedViolation.value = v
  isUnlockSheetOpen.value = true
}

const confirmUnlockAccount = () => {
  if (!selectedViolation.value) return
  selectedViolation.value.status = 'Selesai Dibuka'
  isUnlockSheetOpen.value = false
  emit('toast', `Akun ujian ${selectedViolation.value.studentName} berhasil dibuka kembali.`)
  selectedViolation.value = null
}

const handleConfirmFreezeToggle = () => {
  isFreezeModalOpen.value = false
  emit('toggle-freeze')
}
</script>

<template>
  <div class="space-y-4">
    <!-- KONTROL DARURAT UJIAN — PRD §03 -->
    <section class="border border-[#F5C6C0] rounded-[20px] p-5 bg-[#FFFBFA] shadow-sm">
      <div class="flex items-start gap-4 flex-wrap">
        <span class="w-11 h-11 rounded-xl bg-[#F04438] text-white flex items-center justify-center shrink-0">
          <AdminV2Icon name="alert" :size="22" />
        </span>
        <div class="flex-1 min-w-[240px]">
          <h3 class="text-sm sm:text-[15px] font-extrabold text-[#7A271A] flex items-center gap-2 flex-wrap">
            <span>Kontrol Darurat Ujian</span>
            <span
              v-if="isFrozen"
              class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F04438] text-white inline-flex items-center gap-1.5"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Timer Dibekukan</span>
            </span>
          </h3>
          <p class="text-xs text-[#7A271A] mt-1 max-w-2xl leading-relaxed">
            Jeda <b>seluruh timer ujian yang sedang berjalan</b> secara serentak saat insiden server. Waktu yang hilang dikompensasi otomatis saat timer dilanjutkan. Siswa yang disconnect dapat <b>login ulang dan otomatis melanjutkan</b> dari jawaban autosave terakhir — tidak ada jawaban yang hilang.
          </p>
        </div>

        <button
          type="button"
          class="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition shadow-sm inline-flex items-center gap-2"
          :class="isFrozen ? 'bg-[#059669] hover:bg-[#047857]' : 'bg-[#F04438] hover:bg-[#D92D20]'"
          @click="isFreezeModalOpen = true"
        >
          <AdminV2Icon :name="isFrozen ? 'clock' : 'alert'" :size="15" />
          <span>{{ isFrozen ? 'Lanjutkan Semua Timer' : 'Bekukan Semua Timer' }}</span>
        </button>
      </div>
    </section>

    <!-- Header Section -->
    <div class="flex items-start justify-between gap-3 flex-wrap mb-1">
      <div>
        <h2 class="text-base sm:text-lg font-extrabold text-[#101828] flex items-center gap-2.5">
          <span class="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#818CF8] to-[#4C1D95] shrink-0" />
          <span>Manajemen &amp; Kontrol Sistem CBT</span>
        </h2>
        <p class="text-xs sm:text-[12.5px] text-[#667085] mt-1 ml-4">
          Pengawasan deteksi kecurangan, otorisasi hak akses pembuat soal, dan status akun peserta ujian
        </p>
      </div>
    </div>

    <!-- Mini Subtabs Pills -->
    <div class="flex items-center gap-1 bg-[#EFF2F7] p-1.5 rounded-2xl w-max max-w-full overflow-x-auto text-xs font-bold">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap"
        :class="activeSubNav === 'violations' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.1)]' : 'text-[#667085] hover:text-[#101828]'"
        @click="activeSubNav = 'violations'"
      >
        <AdminV2Icon name="alert" :size="14" />
        <span>Pelanggaran &amp; Anti-Cheat</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap"
        :class="activeSubNav === 'teachers' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.1)]' : 'text-[#667085] hover:text-[#101828]'"
        @click="activeSubNav = 'teachers'"
      >
        <AdminV2Icon name="check" :size="14" />
        <span>Manajemen Guru &amp; Pengawas</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap"
        :class="activeSubNav === 'participants' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.1)]' : 'text-[#667085] hover:text-[#101828]'"
        @click="activeSubNav = 'participants'"
      >
        <AdminV2Icon name="users" :size="14" />
        <span>Peserta Ujian</span>
      </button>
    </div>

    <!-- SUBVIEW 1: VIOLATIONS & ANTI-CHEAT -->
    <div v-if="activeSubNav === 'violations'" class="space-y-3.5">
      <!-- Protocol Banner -->
      <div class="rounded-xl p-3.5 bg-[#FDECEA] border border-[#F5C6C0] text-xs text-[#7A271A] flex items-start gap-2.5">
        <AdminV2Icon name="shield" :size="18" class="shrink-0 text-[#B42318]" />
        <div>
          <b class="text-xs font-extrabold text-[#7A271A] block">Protokol Sistem Keamanan Anti-Kecurangan CBT</b>
          <p class="text-[11.5px] mt-0.5">
            1x Peringatan = Akun Terkunci (PIN Pengawas) • 2x Peringatan = Kunci Ulang • 3x Peringatan = Akun Terkunci Total &amp; Hasil Terkumpul Otomatis
          </p>
        </div>
      </div>

      <!-- Violations Table -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-sm">
        <div class="p-4 border-b border-[#EFF2F7] flex items-center justify-between">
          <h4 class="text-xs sm:text-[13.5px] font-extrabold text-[#101828]">Log Aktivitas &amp; Pelanggaran Peserta</h4>
          <span class="text-xs font-bold text-[#667085]">{{ currentViolations.length }} Insiden Terdeteksi</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[720px]">
            <thead class="bg-[#F8FAFD] border-b border-[#E7EBF2] text-[10.5px] uppercase font-bold text-[#667085]">
              <tr>
                <th class="py-3 px-4">Waktu</th>
                <th class="py-3 px-4">Nama Siswa &amp; Kelas</th>
                <th class="py-3 px-4">Sesi Ujian</th>
                <th class="py-3 px-4">Jenis Pelanggaran</th>
                <th class="py-3 px-4 text-center">Status Akun</th>
                <th class="py-3 px-4 text-right">Aksi Pengawas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="v in currentViolations" :key="v.id" class="hover:bg-[#F8FAFD]/60">
                <td class="py-3 px-4 font-mono text-[#667085]">{{ v.time }}</td>
                <td class="py-3 px-4">
                  <div class="font-bold text-[#101828]">{{ v.studentName }}</div>
                  <div class="text-[10px] font-mono text-[#98A2B3]">{{ v.classroom }} • NISN: {{ v.studentId }}</div>
                </td>
                <td class="py-3 px-4 font-semibold text-[#344054]">{{ v.examName }}</td>
                <td class="py-3 px-4">
                  <span class="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#FDECEA] text-[#B42318] inline-flex items-center gap-1">
                    <AdminV2Icon name="alert" :size="12" />
                    <span>{{ v.reason }}</span>
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                    :class="v.status === 'Selesai Dibuka' ? 'bg-[#E7F8F0] text-[#067647]' : 'bg-[#FEF4E5] text-[#B54708]'"
                  >
                    {{ v.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    v-if="v.status !== 'Selesai Dibuka'"
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#F04438] hover:bg-[#D92D20] text-white transition shadow-sm"
                    @click="openUnlockSheet(v)"
                  >
                    Buka Kunci Akun
                  </button>
                  <span v-else class="text-[11px] text-[#98A2B3]">Sudah Dibuka</span>
                </td>
              </tr>
              <tr v-if="!currentViolations.length">
                <td colspan="6" class="py-10 text-center text-[#98A2B3]">
                  <b class="text-xs text-[#344054] block">Tidak ada pelanggaran tercatat</b>
                  <span class="text-[11px]">Seluruh siswa mengikuti ujian dengan tertib.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- SUBVIEW 2: TEACHERS & SUPERVISORS -->
    <div v-else-if="activeSubNav === 'teachers'" class="space-y-3.5">
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-sm">
        <div class="p-4 border-b border-[#EFF2F7] flex items-center justify-between">
          <h4 class="text-xs sm:text-[13.5px] font-extrabold text-[#101828]">Hak Akses Guru &amp; Pengawas CBT</h4>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl bg-[#1B5FD9] hover:bg-[#12459B] text-white text-xs font-bold transition shadow-sm"
            @click="emit('toast', 'Form otorisasi guru pengawas — demo')"
          >
            Tambah Guru Pengawas
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[720px]">
            <thead class="bg-[#F8FAFD] border-b border-[#E7EBF2] text-[10.5px] uppercase font-bold text-[#667085]">
              <tr>
                <th class="py-3 px-4">Nama Guru</th>
                <th class="py-3 px-4">NIP</th>
                <th class="py-3 px-4">Mata Pelajaran</th>
                <th class="py-3 px-4">Hak Akses Sistem</th>
                <th class="py-3 px-4">Kelas Diampu</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="t in currentTeachers" :key="t.id" class="hover:bg-[#F8FAFD]/60">
                <td class="py-3 px-4 font-bold text-[#101828]">{{ t.name }}</td>
                <td class="py-3 px-4 font-mono text-[#667085]">{{ t.nip }}</td>
                <td class="py-3 px-4 font-semibold text-[#344054]">{{ t.subject }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      v-for="role in t.roles"
                      :key="role"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#12459B]"
                    >
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4 text-[#344054]">{{ t.classes.join(', ') }}</td>
                <td class="py-3 px-4 text-right">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg border border-[#E7EBF2] text-[#1B5FD9] hover:bg-[#E8F0FE] font-bold text-xs"
                    @click="emit('toast', `Pengaturan akses untuk ${t.name} siap disesuaikan.`)"
                  >
                    Atur Akses
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- SUBVIEW 3: PARTICIPANTS -->
    <div v-else class="space-y-3.5">
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-sm">
        <div class="p-4 border-b border-[#EFF2F7] flex items-center justify-between">
          <h4 class="text-xs sm:text-[13.5px] font-extrabold text-[#101828]">Manajemen Status Akun &amp; Sesi Peserta</h4>
          <span class="text-xs font-bold text-[#667085]">{{ currentParticipants.length }} Siswa Aktif</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[720px]">
            <thead class="bg-[#F8FAFD] border-b border-[#E7EBF2] text-[10.5px] uppercase font-bold text-[#667085]">
              <tr>
                <th class="py-3 px-4">NISN</th>
                <th class="py-3 px-4">Nama Peserta</th>
                <th class="py-3 px-4">Kelas</th>
                <th class="py-3 px-4">Token Aktif</th>
                <th class="py-3 px-4 text-center">Status Sesi</th>
                <th class="py-3 px-4 text-right">Aksi Sesi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="p in currentParticipants" :key="p.id" class="hover:bg-[#F8FAFD]/60">
                <td class="py-3 px-4 font-mono text-[#667085]">{{ p.nisn }}</td>
                <td class="py-3 px-4 font-bold text-[#101828]">{{ p.name }}</td>
                <td class="py-3 px-4 font-mono text-[#344054]">{{ p.classroom }}</td>
                <td class="py-3 px-4 font-mono font-bold text-[#1B5FD9]">{{ p.examToken }}</td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                    :class="p.sessionStatus === 'Aktif' ? 'bg-[#E7F8F0] text-[#067647]' : 'bg-[#FDECEA] text-[#B42318]'"
                  >
                    {{ p.sessionStatus }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="inline-flex gap-1.5">
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg border border-[#E7EBF2] hover:bg-[#F3F5F9] text-xs font-bold text-[#344054]"
                      @click="emit('toast', `Password sesi peserta ${p.name} berhasil direset.`)"
                    >
                      Reset Sandi
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg border border-[#F5C6C0] hover:bg-[#FDECEA] text-xs font-bold text-[#B42318]"
                      @click="emit('toast', `Sesi login ujian ${p.name} dikeluarkan.`)"
                    >
                      Reset Sesi
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- SHEET UNLOCK PIN -->
    <Teleport to="body">
      <div v-if="isUnlockSheetOpen && selectedViolation" class="fixed inset-0 z-[115] flex justify-end">
        <div class="fixed inset-0 bg-[#101828]/45 backdrop-blur-[2px]" @click="isUnlockSheetOpen = false" />
        <div class="relative w-full max-w-[580px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
          <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-base font-extrabold text-[#101828]">Buka Kunci Akun Siswa</h3>
                <span class="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#FEF4E5] text-[#B54708]">Anti-Cheat CBT</span>
              </div>
              <p class="text-xs text-[#667085]">{{ selectedViolation.studentName }} • {{ selectedViolation.classroom }}</p>
            </div>
            <button type="button" class="text-[#98A2B3] hover:text-[#101828]" @click="isUnlockSheetOpen = false">
              <AdminV2Icon name="close" :size="18" />
            </button>
          </div>

          <div class="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
            <div class="rounded-xl p-3 bg-[#FEF4E5] border border-[#F5D9A8] text-[#93370D] flex items-start gap-2">
              <AdminV2Icon name="alert" :size="16" class="shrink-0 text-[#B54708]" />
              <div>
                <b>Pelanggaran terdeteksi:</b> {{ selectedViolation.reason }} pada {{ selectedViolation.time }}
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block font-bold text-[#344054]">
                PIN Pengawas Resmi — berikan kepada siswa untuk dimasukkan di layar ujian yang terkunci:
              </label>
              <div class="p-4 rounded-xl bg-[#101828] text-white text-center font-mono text-2xl font-extrabold tracking-[6px]">
                {{ selectedViolation.unlockPin }}
              </div>
            </div>

            <p class="text-[11.5px] text-[#667085] leading-relaxed">
              Aturan allowance: maksimal 2x password pengawas per siswa. Pelanggaran ke-3 = akun terkunci total untuk ujian tersebut.
            </p>
          </div>

          <div class="p-4 border-t border-[#E7EBF2] flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-[#344054] font-bold text-xs"
              @click="isUnlockSheetOpen = false"
            >
              Tutup
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm"
              @click="confirmUnlockAccount"
            >
              Konfirmasi Buka Kunci
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL CONFIRM FREEZE TOGGLE -->
    <Teleport to="body">
      <div v-if="isFreezeModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#101828]/45 backdrop-blur-[2px]" @click="isFreezeModalOpen = false" />
        <div class="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-3.5">
          <h3 class="text-base font-extrabold text-[#101828]">
            {{ isFrozen ? 'Lanjutkan Semua Timer Ujian?' : 'Bekukan Semua Timer Ujian?' }}
          </h3>
          <p class="text-xs text-[#475467] leading-relaxed">
            <template v-if="isFrozen">
              Timer ujian akan berjalan kembali untuk seluruh peserta. <b>Kompensasi waktu otomatis</b> diterapkan sebesar durasi pembekuan, sehingga tidak ada siswa yang dirugikan.
            </template>
            <template v-else>
              Seluruh timer pada sesi yang <b>sedang berjalan</b> akan dijeda serentak. Gunakan hanya saat insiden server / darurat. Aksi ini tercatat di audit trail.
            </template>
          </p>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#EFF2F7]">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-[#E7EBF2] bg-white text-[#344054] font-bold text-xs"
              @click="isFreezeModalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm"
              :class="isFrozen ? 'bg-[#059669] hover:bg-[#047857]' : 'bg-[#F04438] hover:bg-[#D92D20]'"
              @click="handleConfirmFreezeToggle"
            >
              {{ isFrozen ? 'Ya, Lanjutkan' : 'Ya, Bekukan Sekarang' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
