<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminCbtState, type ViolationLog } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'

const { cheatLogs, teachers, grade } = useAdminCbtState()
const activeSubMenu = ref<'violations' | 'teachers' | 'participants'>('violations')

const selectedLogForUnlock = ref<ViolationLog | null>(null)
const isUnlockModalOpen = ref(false)
const unlockInputPin = ref('')
const toastMessage = ref('')

const openUnlockModal = (log: ViolationLog) => {
  selectedLogForUnlock.value = log
  unlockInputPin.value = log.unlockPin
  isUnlockModalOpen.value = true
}

const confirmUnlock = () => {
  if (selectedLogForUnlock.value) {
    selectedLogForUnlock.value.status = 'Selesai Dibuka'
    showToast(`Akun ujian ${selectedLogForUnlock.value.studentName} berhasil dibuka kembali.`)
  }
  isUnlockModalOpen.value = false
  selectedLogForUnlock.value = null
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

// Mock student participants list
const participants = ref([
  { id: '1', nisn: '0071234501', name: 'Ahmad Fauzan', classroom: 'X RPL 1', sessionStatus: 'Aktif', examToken: 'INF930' },
  { id: '2', nisn: '0071234502', name: 'Siti Aisyah', classroom: 'X RPL 1', sessionStatus: 'Terkunci (1x)', examToken: 'INF930' },
  { id: '3', nisn: '0071234503', name: 'Muhammad Rizky Pratama', classroom: 'X RPL 1', sessionStatus: 'Aktif', examToken: 'INF930' },
  { id: '4', nisn: '0071234504', name: 'Nabila Zahra Putri', classroom: 'X RPL 1', sessionStatus: 'Terkunci (1x)', examToken: 'INF930' },
  { id: '5', nisn: '0081234501', name: 'Farhan Maulana', classroom: 'VII-A', sessionStatus: 'Aktif', examToken: 'PAI927' },
  { id: '6', nisn: '0081234502', name: 'Putri Safitri', classroom: 'VII-A', sessionStatus: 'Aktif', examToken: 'PAI927' }
])

const filteredParticipants = computed(() => {
  return participants.value.filter(p => {
    return grade.value === 'SMP' ? p.classroom.startsWith('VII') || p.classroom.startsWith('VIII') || p.classroom.startsWith('IX') : p.classroom.includes('RPL') || p.classroom.includes('TKJ')
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- SECTION HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-indigo-500 before:to-purple-600 before:shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
          Manajemen &amp; Kontrol Sistem CBT
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5 ml-3.5 font-medium">
          Pengawasan deteksi kecurangan, otorisasi hak akses pembuat soal, dan status akun peserta ujian
        </p>
      </div>
    </div>

    <!-- TOAST -->
    <div
      v-if="toastMessage"
      class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-fadeUp text-xs font-semibold"
    >
      <AdminIcon name="check" size="16" class="text-emerald-400" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- SUB-NAV PILLS -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar w-fit">
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
        :class="activeSubMenu === 'violations'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
        @click="activeSubMenu = 'violations'"
      >
        <AdminIcon name="alert" size="14" />
        <span>Pelanggaran &amp; Anti-Cheat</span>
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
        :class="activeSubMenu === 'teachers'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
        @click="activeSubMenu = 'teachers'"
      >
        <AdminIcon name="ucheck" size="14" />
        <span>Manajemen Guru &amp; Pengawas</span>
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
        :class="activeSubMenu === 'participants'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
        @click="activeSubMenu = 'participants'"
      >
        <AdminIcon name="users" size="14" />
        <span>Peserta Ujian</span>
      </button>
    </div>

    <!-- SUB-MENU 1: PELANGGARAN & ANTI-CHEAT -->
    <template v-if="activeSubMenu === 'violations'">
      <!-- Rules banner -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <span class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <AdminIcon name="shield" size="18" />
          </span>
          <div>
            <h4 class="text-xs sm:text-sm font-bold text-rose-950">Protokol Sistem Keamanan Anti-Kecurangan CBT</h4>
            <p class="text-xs text-rose-800/90 mt-0.5 font-medium">
              1x Peringatan = Akun Terkunci (PIN Pengawas) &bull; 2x Peringatan = Kunci Ulang &bull; 3x Peringatan = Akun Terkunci Total &amp; Hasil Terkumpul Otomatis
            </p>
          </div>
        </div>
      </div>

      <!-- Violations Table -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="text-sm font-bold text-slate-900">Log Aktivitas &amp; Pelanggaran Peserta</h4>
          <span class="text-xs font-bold text-slate-500">{{ cheatLogs.length }} Insiden Terdeteksi</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead class="bg-slate-50/90 text-xs font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5">Waktu</th>
                <th class="px-4 py-3.5">Nama Siswa &amp; Kelas</th>
                <th class="px-4 py-3.5">Sesi Ujian</th>
                <th class="px-4 py-3.5">Jenis Pelanggaran</th>
                <th class="px-4 py-3.5 text-center">Status Akun</th>
                <th class="px-4 py-3.5 text-right">Aksi Pengawas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="cheatLogs.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  <AdminIcon name="check" size="24" class="mx-auto mb-1 text-emerald-500" />
                  <div class="text-sm font-semibold text-slate-700">Tidak ada pelanggaran tercatat</div>
                  <div class="text-xs text-slate-400">Seluruh siswa mengikuti ujian dengan tertib.</div>
                </td>
              </tr>
              <tr v-for="log in cheatLogs" :key="log.id" class="hover:bg-rose-50/30 transition">
                <td class="px-4 py-3.5 font-mono text-xs text-slate-500">{{ log.time }}</td>
                <td class="px-4 py-3.5">
                  <div class="font-bold text-slate-900">{{ log.studentName }}</div>
                  <div class="text-xs text-slate-400 font-mono">{{ log.classroom }} &bull; NISN: {{ log.studentId }}</div>
                </td>
                <td class="px-4 py-3.5 font-semibold text-slate-700">{{ log.examName }}</td>
                <td class="px-4 py-3.5">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
                    <AdminIcon name="alert" size="12" />
                    {{ log.reason }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                    :class="log.status === 'Selesai Dibuka'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'"
                  >
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <button
                    v-if="log.status !== 'Selesai Dibuka'"
                    class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition shadow-2xs"
                    type="button"
                    @click="openUnlockModal(log)"
                  >
                    Buka Kunci Akun
                  </button>
                  <span v-else class="text-xs font-medium text-slate-400">Sudah Dibuka</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- SUB-MENU 2: MANAJEMEN GURU -->
    <template v-if="activeSubMenu === 'teachers'">
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="text-sm font-bold text-slate-900">Hak Akses Guru &amp; Pengawas CBT</h4>
          <button
            class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            type="button"
            @click="showToast('Otorisasi hak akses baru dibuka')"
          >
            Tambah Guru Pengawas
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead class="bg-slate-50/90 text-xs font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5">Nama Guru</th>
                <th class="px-4 py-3.5">NIP</th>
                <th class="px-4 py-3.5">Mata Pelajaran</th>
                <th class="px-4 py-3.5">Hak Akses Sistem</th>
                <th class="px-4 py-3.5">Kelas Diampu</th>
                <th class="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="t in teachers" :key="t.id" class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3.5 font-bold text-slate-900">{{ t.name }}</td>
                <td class="px-4 py-3.5 font-mono text-xs text-slate-500">{{ t.nip }}</td>
                <td class="px-4 py-3.5 font-semibold text-slate-700">{{ t.subject }}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      v-for="r in t.roles"
                      :key="r"
                      class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60"
                    >
                      {{ r }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3.5 text-xs text-slate-600">{{ t.classes.join(', ') }}</td>
                <td class="px-4 py-3.5 text-right">
                  <button
                    class="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                    type="button"
                    @click="showToast(`Pengaturan akses untuk ${t.name} siap disesuaikan.`)"
                  >
                    Atur Akses
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- SUB-MENU 3: PESERTA UJIAN -->
    <template v-if="activeSubMenu === 'participants'">
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 class="text-sm font-bold text-slate-900">Manajemen Status Akun &amp; Sesi Peserta</h4>
          <span class="text-xs font-bold text-slate-500">{{ filteredParticipants.length }} Siswa Aktif</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead class="bg-slate-50/90 text-xs font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5">NISN</th>
                <th class="px-4 py-3.5">Nama Peserta</th>
                <th class="px-4 py-3.5">Kelas</th>
                <th class="px-4 py-3.5 font-mono">Token Aktif</th>
                <th class="px-4 py-3.5 text-center">Status Sesi</th>
                <th class="px-4 py-3.5 text-right">Aksi Sesi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in filteredParticipants" :key="p.id" class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3.5 font-mono text-xs text-slate-500">{{ p.nisn }}</td>
                <td class="px-4 py-3.5 font-bold text-slate-900">{{ p.name }}</td>
                <td class="px-4 py-3.5">
                  <span class="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 font-mono">{{ p.classroom }}</span>
                </td>
                <td class="px-4 py-3.5 font-mono text-xs text-blue-600 font-bold">{{ p.examToken }}</td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block"
                    :class="p.sessionStatus === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                  >
                    {{ p.sessionStatus }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <button
                    class="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition mr-1.5"
                    type="button"
                    @click="showToast(`Password sesi peserta ${p.name} berhasil direset.`)"
                  >
                    Reset Sandi
                  </button>
                  <button
                    class="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                    type="button"
                    @click="showToast(`Sesi login ujian ${p.name} dikeluarkan.`)"
                  >
                    Reset Sesi
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- UNLOCK MODAL -->
    <div
      v-if="isUnlockModalOpen && selectedLogForUnlock"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      @click.self="isUnlockModalOpen = false"
    >
      <div class="bg-white rounded-[20px] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleUp">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h4 class="text-base font-bold text-slate-900">Buka Kunci Akun Siswa</h4>
            <p class="text-xs text-slate-500">{{ selectedLogForUnlock.studentName }} &bull; {{ selectedLogForUnlock.classroom }}</p>
          </div>
          <button class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center" @click="isUnlockModalOpen = false">
            <AdminIcon name="x" size="16" />
          </button>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <span class="font-bold block mb-1">Pelanggaran Terdeteksi:</span>
            <p>{{ selectedLogForUnlock.reason }} pada {{ selectedLogForUnlock.time }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">PIN Pengawas Resmi:</label>
            <div class="p-3 bg-slate-900 text-white font-mono text-center text-lg font-extrabold rounded-xl tracking-widest">
              {{ unlockInputPin }}
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Berikan PIN ini kepada siswa untuk dimasukkan pada layar ujian yang terkunci.</p>
          </div>
        </div>

        <div class="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
          <button class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl" @click="isUnlockModalOpen = false">
            Tutup
          </button>
          <button class="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs" @click="confirmUnlock">
            Konfirmasi Buka Kunci
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
