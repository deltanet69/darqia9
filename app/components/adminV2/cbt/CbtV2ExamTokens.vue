<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem } from './cbtV2Data'
import { JENIS_LABEL } from '~/utils/cbtSiswaJadwal'
import { hostUntuk } from '~/composables/domainCore'
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
const schoolName = computed(() => props.exam.grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam')

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
  if (!printable.value.length) {
    emit('toast', 'Belum ada kartu yang dapat dicetak. Terbitkan token terlebih dahulu.')
    return
  }
  const win = window.open('', '_blank')
  if (!win) {
    emit('toast', 'Jendela cetak terblokir. Izinkan pop-up untuk mencetak kartu.')
    return
  }
  // Nama siswa berasal dari database: di-escape agar tidak bisa menyisipkan HTML ke jendela cetak.
  const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
  const origin = window.location.origin
  // Alamat dari daftar domain live, bukan host browser, agar kartu tidak pernah mencetak localhost/staging.
  const alamat = hostUntuk('cbt', props.exam.grade === 'SMK' ? 'smk' : 'smp')
  const logo = `${origin}/asset/${props.exam.grade === 'SMK' ? 'logo.png' : 'logosmp.png'}`
  const jenis = JENIS_LABEL[props.exam.jenis ?? (props.source === 'ujian_harian' ? 'harian' : 'akhir')]
  // Tema warna mengikuti jenjang: SMP hijau, SMK navy-biru (sama seperti badge jenjang di Admin).
  const tema = props.exam.grade === 'SMK'
    ? '--utama:#0A2A5C;--sub:#C7D7F2;--aksen:#1B5FD9;--panel:#EEF4FF;--garis-panel:#C9DAF8;--label:#1B4FB0;--garis:#C9D5E8'
    : '--utama:#0B5138;--sub:#BDE8D2;--aksen:#15803D;--panel:#E7F6ED;--garis-panel:#A6E9C5;--label:#166534;--garis:#BFDCCB'
  const kartu = printable.value.map(p => `
    <section class="kartu">
      <header>
        <img src="${logo}" alt="">
        <div><h1>Kartu Peserta Ujian</h1><p>${esc(schoolName.value)}</p></div>
        <span class="jenis">${esc(jenis)}</span>
      </header>
      <div class="isi">
        <h2${String(p.name).length > 34 ? ' class="panjang"' : ''}>${esc(p.name)}</h2>
        <dl>
          <div><dt>NIS</dt><dd>${esc(p.nis)}</dd></div>
          <div><dt>Kelas</dt><dd>${esc(p.classroom)}</dd></div>
          <div><dt>Ruang</dt><dd>${esc(p.room || '–')}</dd></div>
        </dl>
        <p class="token"><span class="label">Token masuk</span><mark>${esc(p.token)}</mark></p>
      </div>
      <footer>
        <p>Buka <b>${esc(alamat)}</b>, lalu masukkan NIS dan token.</p>
        <p>Token hanya untuk NIS di atas, berlaku semua mata pelajaran. Jangan berikan kepada siapa pun.</p>
      </footer>
    </section>`)
  // A4 = 10 kartu (2 kolom × 5 baris) per halaman; halaman terakhir berisi sisa siswa.
  const halaman: string[] = []
  for (let i = 0; i < kartu.length; i += 10) halaman.push(`<div class="halaman">${kartu.slice(i, i + 10).join('')}</div>`)
  win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Kartu Ujian — ${esc(props.exam.classroom)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      @page { size: A4; margin: 8mm; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: Inter, Arial, sans-serif; margin: 0; color: #101828; background: #fff; ${tema}; }
      .halaman { width: 194mm; height: 281mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(5, 1fr); gap: 4mm 6mm; break-after: page; }
      .halaman:last-child { break-after: auto; }
      .kartu { border: 1px solid var(--garis); border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column; }
      header { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--utama); color: #fff; }
      header img { width: 22px; height: 25px; object-fit: contain; flex-shrink: 0; }
      header div { min-width: 0; flex: 1; }
      h1 { margin: 0; font-size: 12px; font-weight: 800; }
      header p { margin: 1px 0 0; font-size: 9.5px; font-weight: 500; color: var(--sub); }
      .jenis { flex-shrink: 0; padding: 3px 7px; border-radius: 5px; background: var(--aksen); font-size: 9.5px; font-weight: 700; }
      .isi { padding: 7px 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; }
      h2 { margin: 0; font-size: 14px; font-weight: 800; color: var(--utama); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      h2.panjang { font-size: 11.5px; }
      dl { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 6px; margin: 0; }
      dl div { min-width: 0; }
      dt { font-size: 9px; font-weight: 600; color: #475467; }
      dd { margin: 1px 0 0; font-size: 12px; font-weight: 700; color: #101828; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .token { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0; padding: 5px 6px 5px 10px; border-radius: 8px; background: var(--panel); border: 1px solid var(--garis-panel); }
      .label { font-size: 10.5px; font-weight: 700; color: var(--label); }
      mark { padding: 2px 9px; border-radius: 5px; background: #FFE27A; color: #101828; font-size: 20px; font-weight: 800; letter-spacing: 0.14em; line-height: 1.2; }
      footer { padding: 5px 10px 6px; border-top: 1px dashed var(--garis); background: #F7F9FC; }
      footer p { margin: 0; font-size: 9px; line-height: 1.4; color: #344054; }
      footer b { color: var(--utama); }
    </style></head><body>${halaman.join('')}
    <script>window.onload = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => window.print())<\/script></body></html>`)
  win.document.close()
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
