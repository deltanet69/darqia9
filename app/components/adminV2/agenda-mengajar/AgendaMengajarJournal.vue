<script setup lang="ts">
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { AgendaBook, AttendanceStatus } from '~/composables/useAgendaMengajar'

interface JournalForm {
  pertemuan_ke: number
  tanggal: string
  topik: string
  kegiatan: string
}

defineProps<{
  open: boolean
  book: AgendaBook | null
  form: JournalForm
  saving: boolean
  summary: Record<AttendanceStatus, number>
}>()

const emit = defineEmits<{
  close: []
  save: []
  'update:form': [value: JournalForm]
}>()

const updateField = (form: JournalForm, field: keyof JournalForm, value: string) => {
  emit('update:form', { ...form, [field]: value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="journal-overlay" role="dialog" aria-modal="true" aria-labelledby="journal-title" @keydown.esc="emit('close')">
      <button type="button" class="journal-scrim" aria-label="Tutup jurnal" @click="emit('close')" />
      <aside class="journal-panel">
        <header>
          <div>
            <h2 id="journal-title">Jurnal Pertemuan {{ form.pertemuan_ke }}</h2>
            <p>{{ book?.mapel_nama }} · {{ book?.kelas_nama }}</p>
          </div>
          <button type="button" aria-label="Tutup" @click="emit('close')"><AdminV2Icon name="x" :size="18" /></button>
        </header>
        <div class="journal-body">
          <label>
            Tanggal
            <input id="agenda-journal-date" :value="form.tanggal" type="date" required @input="updateField(form, 'tanggal', ($event.target as HTMLInputElement).value)">
          </label>
          <label>
            Topik / Materi
            <input :value="form.topik" type="text" placeholder="Contoh: Fungsi dan Relasi" @input="updateField(form, 'topik', ($event.target as HTMLInputElement).value)">
          </label>
          <label>
            Kegiatan Pembelajaran
            <textarea :value="form.kegiatan" rows="4" placeholder="Ringkasan kegiatan di kelas" @input="updateField(form, 'kegiatan', ($event.target as HTMLTextAreaElement).value)" />
          </label>
          <p class="journal-summary">
            Ringkasan hadir pertemuan ini:
            <b>{{ summary.H }} Hadir · {{ summary.S }} Sakit · {{ summary.I }} Izin · {{ summary.A }} Alpa</b>
          </p>
        </div>
        <footer>
          <button type="button" class="primary-button" :disabled="saving || !form.tanggal" @click="emit('save')">
            <AdminV2Icon name="check" :size="15" />
            {{ saving ? 'Menyimpan...' : 'Simpan Jurnal' }}
          </button>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.journal-overlay{position:fixed;inset:0;z-index:120}.journal-scrim{position:absolute;inset:0;width:100%;background:rgba(16,24,40,.48)}.journal-panel{position:absolute;top:0;right:0;bottom:0;display:flex;width:min(100%,680px);flex-direction:column;background:#fff;box-shadow:-24px 0 48px -24px rgba(16,24,40,.3)}.journal-panel header{display:flex;align-items:flex-start;gap:12px;border-bottom:1px solid #E4E7EC;padding:18px 20px}.journal-panel header>div{flex:1}.journal-panel h2{color:#101828;font-size:16px;font-weight:750}.journal-panel header p{margin-top:2px;color:#667085;font-size:12px;font-weight:600}.journal-panel header>button{display:flex;height:36px;width:36px;align-items:center;justify-content:center;border-radius:10px;color:#667085}.journal-body{display:flex;flex:1;flex-direction:column;gap:14px;overflow-y:auto;padding:18px 20px}.journal-body label{color:#344054;font-size:12px;font-weight:700}.journal-body input,.journal-body textarea{margin-top:6px;width:100%;border:1px solid #E4E7EC;border-radius:12px;padding:11px 12px;color:#101828;font-size:13px}.journal-body textarea{resize:vertical}.journal-summary{border-radius:12px;background:#F8FAFC;padding:12px;color:#667085;font-size:11.5px;font-weight:600;line-height:1.6}.journal-panel footer{display:flex;justify-content:flex-end;border-top:1px solid #E4E7EC;padding:14px 20px}.primary-button{display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:7px;border-radius:11px;background:#2563EB;padding:9px 14px;color:#fff;font-size:12px;font-weight:750}.primary-button:hover{background:#1D4ED8}.primary-button:disabled{cursor:not-allowed;opacity:.55}
</style>
