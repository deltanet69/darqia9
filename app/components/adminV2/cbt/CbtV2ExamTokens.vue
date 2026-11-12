<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem } from './cbtV2Data'
import { JENIS_LABEL } from '~/utils/cbtSiswaJadwal'
import { cetakKartu } from '~/utils/cbtKartuCetak'
import { useAdminCbtData, type AssessmentSource, type ExamParticipant } from '~/composables/useAdminCbtData'

const props = defineProps<{ exam: ExamItem; source?: AssessmentSource }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toast', msg: string): void
}>()

const cbtData = useAdminCbtData(props.source ?? 'cbt')
const participants = ref<ExamParticipant[]>([])
const loading = ref(true)
const loadError = ref('')
const busyAll = ref(false)
const busyId = ref('')

const issuedCount = computed(() => participants.value.filter(p => p.token).length)
const ineligibleCount = computed(() => participants.value.filter(p => !p.eligible).length)
const printable = computed(() => participants.value.filter(p => p.eligible && p.token))

const refresh = async () => {
  loading.value = true
  loadError.value = ''
  try {
    participants.value = await cbtData.loadExamParticipants(props.exam.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Peserta gagal dimuat.'
    loadError.value = /exam_eligible|access_token|issue_exam_tokens/.test(message)
      ? 'Fitur token per siswa belum aktif di server. Terapkan migrasi 0017_token_peserta.sql di Supabase, lalu buka lagi panel ini.'
      : message
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

const issueAll = async () => {
  if (busyAll.value) return
  busyAll.value = true
  try {
    const count = await cbtData.issueExamTokens(props.exam.id)
    emit('toast', count ? `${count} token diterbitkan untuk siswa yang eligible.` : 'Semua siswa eligible sudah memiliki token.')
    await refresh()
  } catch (error) {
    emit('toast', error instanceof Error ? error.message : 'Token gagal diterbitkan.')
  } finally {
    busyAll.value = false
  }
}

const issueOne = async (p: ExamParticipant) => {
  if (busyId.value) return
  busyId.value = p.studentId
  try {
    await cbtData.issueStudentToken(props.exam.id, p.studentId)
    emit('toast', `Token untuk ${p.name} diterbitkan.`)
    await refresh()
  } catch (error) {
    emit('toast', error instanceof Error ? error.message : 'Token gagal diterbitkan.')
  } finally {
    busyId.value = ''
  }
}

const regenerate = async (p: ExamParticipant) => {
  if (busyId.value || !p.assignmentId) return
  busyId.value = p.studentId
  try {
    await cbtData.regenerateStudentToken(p.assignmentId)
    emit('toast', `Token baru untuk ${p.name} diterbitkan. Token lama tidak berlaku lagi.`)
    await refresh()
  } catch (error) {
    emit('toast', error instanceof Error ? error.message : 'Token gagal dibuat ulang.')
  } finally {
    busyId.value = ''
  }
}

const toggleEligible = async (p: ExamParticipant) => {
  if (busyId.value) return
  busyId.value = p.studentId
  try {
    const next = !p.eligible
    await cbtData.setStudentExamEligible(p.studentId, next)
    if (next) {
      await cbtData.issueStudentToken(props.exam.id, p.studentId)
      emit('toast', `${p.name} kini eligible dan tokennya diterbitkan.`)
    } else {
      emit('toast', `${p.name} ditandai belum memenuhi administrasi. Akses masuk ujiannya tertutup selama status ini berlaku.`)
    }
    await refresh()
  } catch (error) {
    emit('toast', error instanceof Error ? error.message : 'Status administrasi gagal diubah.')
  } finally {
    busyId.value = ''
  }
}

const copyToken = async (p: ExamParticipant) => {
  if (!p.token) return
  try {
    await navigator.clipboard.writeText(p.token)
    emit('toast', `Token ${p.name} disalin.`)
  } catch {
    emit('toast', `Token ${p.name}: ${p.token}`)
  }
}

const exportExcel = async () => {
  const XLSX = await import('xlsx')
  const rows = [
    ['Nama', 'NIS', 'Kelas', 'Ruang Ujian', 'Status Administrasi', 'Token'],
    ...participants.value.map(p => [p.name, p.nis, p.classroom, p.room || '', p.eligible ? 'Eligible' : 'Belum beres', p.token || ''])
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Token Peserta')
  const safeName = props.exam.classroom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  XLSX.writeFile(workbook, `daftar-token-${safeName || 'ujian'}.xlsx`)
  emit('toast', 'Daftar token diekspor ke Excel.')
}

const printCards = () => {
  const jenis = JENIS_LABEL[props.exam.jenis ?? (props.source === 'ujian_harian' ? 'harian' : 'akhir')]
  const galat = cetakKartu({ kartu: printable.value.map(p => ({ ...p, token: p.token! })), grade: props.exam.grade, jenis, judul: props.exam.classroom })
  if (galat) emit('toast', galat)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] overflow-y-auto flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Token peserta ujian" @keydown.esc="emit('close')">
      <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90dvh] overflow-y-auto shadow-2xl border border-[#E7EBF2]">
        <div class="p-5 border-b border-[#E7EBF2] flex items-start justify-between gap-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">Token Peserta</span>
            <h3 class="text-base font-extrabold text-[#101828] mt-0.5">{{ exam.classroom }}</h3>
            <p class="text-xs text-[#667085] mt-1.5 leading-relaxed">Satu token berlaku untuk satu siswa selama ujian, untuk seluruh mata pelajaran, dan terikat dengan NIS siswa. Token hanya terbit bila persyaratan administrasi siswa terpenuhi.</p>
          </div>
          <button type="button" class="w-8 h-8 shrink-0 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]" aria-label="Tutup panel token peserta" @click="emit('close')">
            <AdminV2Icon name="x" :size="16" />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2.5 px-5 pt-4">
          <div class="rounded-xl border border-[#E7EBF2] px-3.5 py-3">
            <b class="block text-lg font-extrabold text-[#0A2A5C]">{{ participants.length }}</b>
            <span class="text-[11px] text-[#667085]">Siswa peserta</span>
          </div>
          <div class="rounded-xl border border-[#E7EBF2] px-3.5 py-3">
            <b class="block text-lg font-extrabold text-[#0A2A5C]">{{ issuedCount }}</b>
            <span class="text-[11px] text-[#667085]">Token terbit</span>
          </div>
          <div class="rounded-xl border border-[#E7EBF2] px-3.5 py-3">
            <b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ineligibleCount }}</b>
            <span class="text-[11px] text-[#667085]">Administrasi belum beres</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 px-5 pt-4">
          <button type="button" class="px-3.5 py-2 rounded-xl bg-[#1B5FD9] text-white text-xs font-bold disabled:opacity-50" :disabled="busyAll || loading" @click="issueAll">{{ busyAll ? 'Menerbitkan…' : 'Terbitkan untuk yang eligible' }}</button>
          <button type="button" class="px-3.5 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="loading || !participants.length" @click="exportExcel">Export Excel</button>
          <button type="button" class="px-3.5 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="loading || !printable.length" @click="printCards">Cetak Kartu Ujian</button>
        </div>

        <div class="p-5">
          <p v-if="loading" class="text-xs text-[#667085]" role="status">Memuat peserta…</p>
          <div v-else-if="loadError" class="rounded-xl bg-[#FDECEA] border border-[#F5C6C0] px-4 py-3 text-xs text-[#8C1D13]" role="alert">{{ loadError }}</div>
          <div v-else class="overflow-x-auto border border-[#E7EBF2] rounded-xl">
            <table class="w-full text-left text-xs min-w-[720px]">
              <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-extrabold text-[#667085] tracking-wider">
                <tr>
                  <th class="py-2.5 px-3.5">Siswa</th>
                  <th class="py-2.5 px-3.5">NIS</th>
                  <th class="py-2.5 px-3.5">Ruang Ujian</th>
                  <th class="py-2.5 px-3.5">Administrasi</th>
                  <th class="py-2.5 px-3.5">Token</th>
                  <th class="py-2.5 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#EFF2F7]">
                <tr v-for="p in participants" :key="p.studentId" class="hover:bg-[#FAFCFF]">
                  <td class="py-2.5 px-3.5 font-bold text-[#101828]">{{ p.name }}</td>
                  <td class="py-2.5 px-3.5 font-mono">{{ p.nis || '-' }}</td>
                  <td class="py-2.5 px-3.5">{{ p.room || 'Belum ditempatkan' }}</td>
                  <td class="py-2.5 px-3.5">
                    <span class="inline-flex items-center gap-1.5 font-semibold" :class="p.eligible ? 'text-[#087C52]' : 'text-[#B42318]'">
                      <span class="w-2 h-2 rounded-full" :class="p.eligible ? 'bg-[#12805C]' : 'bg-[#D92D20]'" />{{ p.eligible ? 'Eligible' : 'Belum beres' }}
                    </span>
                    <button type="button" class="block text-[11px] font-bold text-[#1B5FD9] hover:underline mt-0.5 disabled:opacity-50" :disabled="busyId === p.studentId" @click="toggleEligible(p)">{{ p.eligible ? 'Tandai belum beres' : 'Jadikan eligible' }}</button>
                  </td>
                  <td class="py-2.5 px-3.5">
                    <span v-if="p.token" class="font-mono font-bold text-[#0A2A5C] bg-[#EEF3FC] rounded-lg px-2 py-1">{{ p.token }}</span>
                    <span v-else class="text-[#98A2B3]">—</span>
                  </td>
                  <td class="py-2.5 px-3.5">
                    <div class="flex items-center justify-end gap-2.5">
                      <button v-if="p.token" type="button" class="font-bold text-[#344054] hover:underline disabled:opacity-50" :disabled="busyId === p.studentId" @click="copyToken(p)">Salin</button>
                      <button v-if="p.token" type="button" class="font-bold text-[#344054] hover:underline disabled:opacity-50" :disabled="busyId === p.studentId" @click="regenerate(p)">Regenerasi</button>
                      <button v-else-if="p.eligible" type="button" class="font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="busyId === p.studentId" @click="issueOne(p)">Terbitkan</button>
                      <span v-else class="text-[#98A2B3]">Menunggu administrasi</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!participants.length">
                  <td colspan="6" class="py-8 text-center text-xs text-[#667085]">Belum ada siswa aktif pada rombel ujian ini.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[11px] text-[#667085] leading-relaxed mt-3">Regenerasi membuat token baru untuk siswa itu di semua mata pelajaran ujiannya, dan token lama langsung tidak berlaku — gunakan bila kartu siswa hilang. Mencabut status eligible menutup akses masuk siswa pada semua ujian selama statusnya belum beres, walaupun tokennya sudah terbit.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
