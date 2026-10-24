<script setup lang="ts">
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { AgendaBook } from '~/composables/useAgendaMengajar'

type OpenFilter = 'kelas' | 'mapel' | 'semester' | 'meeting' | null

const props = defineProps<{
  jenjang: 'smp' | 'smk'
  semester: 1 | 2
  openFilter: OpenFilter
  currentBook: AgendaBook | null
  classOptions: Array<{ id: string; name: string }>
  subjectOptions: AgendaBook[]
  selectedClassId: string
  selectedBookId: string
  filledMeetingCount: number
  filledTaskCount: number
}>()

const emit = defineEmits<{
  'update:openFilter': [value: OpenFilter]
  'select-class': [classId: string]
  'select-book': [bookId: string]
  'select-semester': [semester: 1 | 2]
}>()

const toggle = (filter: Exclude<OpenFilter, null>) => {
  emit('update:openFilter', props.openFilter === filter ? null : filter)
}
</script>

<template>
  <section class="filter-panel" :class="jenjang">
    <div class="filter-grid">
      <div class="filter-field">
        <label><AdminV2Icon name="users" :size="12" /> Kelas</label>
        <div class="custom-dropdown">
          <button type="button" class="dropdown-trigger" @click.stop="toggle('kelas')">
            <span>{{ currentBook?.kelas_nama || 'Pilih kelas' }}</span>
            <AdminV2Icon name="chev" :size="14" />
          </button>
          <div v-if="openFilter === 'kelas'" class="dropdown-menu" @click.stop>
            <button
              v-for="item in classOptions"
              :key="item.id"
              type="button"
              :class="{ active: selectedClassId === item.id }"
              @click="emit('select-class', item.id)"
            >
              <span>{{ item.name }}</span>
              <AdminV2Icon v-if="selectedClassId === item.id" name="check" :size="14" />
            </button>
            <p v-if="classOptions.length === 0">Tidak ada kelas dalam lingkup akun.</p>
          </div>
        </div>
      </div>

      <div class="filter-field">
        <label><AdminV2Icon name="book" :size="12" /> Mata Pelajaran</label>
        <div class="custom-dropdown">
          <button type="button" class="dropdown-trigger" @click.stop="toggle('mapel')">
            <span>{{ currentBook?.mapel_nama || 'Pilih mata pelajaran' }}</span>
            <AdminV2Icon name="chev" :size="14" />
          </button>
          <div v-if="openFilter === 'mapel'" class="dropdown-menu" @click.stop>
            <button
              v-for="item in subjectOptions"
              :key="item.buku_id"
              type="button"
              :class="{ active: selectedBookId === item.buku_id }"
              @click="emit('select-book', item.buku_id)"
            >
              <span>{{ item.mapel_nama }}</span>
              <AdminV2Icon v-if="selectedBookId === item.buku_id" name="check" :size="14" />
            </button>
            <p v-if="subjectOptions.length === 0">Tidak ada penugasan mengajar untuk kelas ini.</p>
          </div>
        </div>
      </div>

      <div class="filter-field">
        <label><AdminV2Icon name="cal" :size="12" /> Semester</label>
        <div class="custom-dropdown">
          <button type="button" class="dropdown-trigger" @click.stop="toggle('semester')">
            <span>{{ semester === 1 ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)' }}</span>
            <AdminV2Icon name="chev" :size="14" />
          </button>
          <div v-if="openFilter === 'semester'" class="dropdown-menu" @click.stop>
            <button type="button" :class="{ active: semester === 1 }" @click="emit('select-semester', 1)">
              <span>Semester 1 (Ganjil)</span>
              <AdminV2Icon v-if="semester === 1" name="check" :size="14" />
            </button>
            <button type="button" :class="{ active: semester === 2 }" @click="emit('select-semester', 2)">
              <span>Semester 2 (Genap)</span>
              <AdminV2Icon v-if="semester === 2" name="check" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentBook" class="progress-strip">
      <div class="progress-item">
        <span class="progress-icon"><AdminV2Icon name="cal" :size="15" /></span>
        <div><span>Pertemuan <b>{{ filledMeetingCount }}/20</b></span><i><span :style="{ width: `${filledMeetingCount / 20 * 100}%` }" /></i></div>
      </div>
      <div class="progress-item">
        <span class="progress-icon"><AdminV2Icon name="doc" :size="15" /></span>
        <div><span>Tugas <b>{{ filledTaskCount }}/5</b></span><i><span :style="{ width: `${filledTaskCount / 5 * 100}%` }" /></i></div>
      </div>
      <div class="progress-item">
        <span class="progress-icon"><AdminV2Icon name="chart" :size="15" /></span>
        <div><span>KKM kelas ini <b>{{ currentBook.kkm }}</b></span><small>Guru: {{ currentBook.guru_nama }}</small></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.filter-panel{border-radius:16px;background:linear-gradient(135deg,#0A2A5C,#16407E);padding:16px 18px;color:#fff;box-shadow:0 14px 30px rgba(15,23,42,.18)}.filter-panel.smp{background:linear-gradient(135deg,#0B5138,#0E6B4A)}.filter-grid{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:12px}.filter-field label{margin-bottom:6px;display:inline-flex;align-items:center;gap:5px;color:#B9CFF5;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.filter-panel.smp .filter-field label{color:#BDE8D2}
.custom-dropdown{position:relative;min-width:0}.dropdown-trigger{display:flex;min-height:42px;width:100%;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(255,255,255,.28);border-radius:12px;background:#fff;padding:0 12px;color:#101828;font-size:13px;font-weight:650;text-align:left}.dropdown-trigger span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dropdown-menu{position:absolute;z-index:70;top:calc(100% + 6px);left:0;right:0;max-height:260px;overflow:auto;border:1px solid #E4E7EC;border-radius:12px;background:#fff;padding:5px;box-shadow:0 18px 36px -16px rgba(16,24,40,.35)}.dropdown-menu button{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;border-radius:9px;padding:9px 10px;color:#344054;font-size:12.5px;font-weight:600;text-align:left}.dropdown-menu button:hover,.dropdown-menu button.active{background:#EFF4FF;color:#1D4ED8}.dropdown-menu p{padding:12px;color:#667085;font-size:12px}
.progress-strip{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;border-top:1px solid rgba(255,255,255,.18);padding-top:13px}.progress-item{display:flex;min-width:170px;flex:1;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:rgba(255,255,255,.09);padding:9px 12px}.progress-icon{display:inline-flex;height:30px;width:30px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px;background:rgba(255,255,255,.16)}.progress-item>div{display:flex;min-width:0;flex:1;flex-direction:column;gap:5px}.progress-item div>span,.progress-item small{color:#C9D9F6;font-size:12px;font-weight:600}.progress-item small{font-size:11px}.progress-item b{color:#fff}.progress-item i{height:7px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.22)}.progress-item i span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7DD3FC,#FDE68A)}
@media(max-width:700px){.filter-grid{grid-template-columns:1fr}.filter-panel{padding:15px}.progress-item{min-width:100%}}
</style>
