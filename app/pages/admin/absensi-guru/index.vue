<template>
  <section v-if="isAttendance">
    <div class="page-head">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
      <button v-if="section === 'absensi-siswa'" class="btn btn-primary btn-sm" type="button" @click="exportRecap">
        <AdminIcon name="dl" size="16" /> Ekspor Rekap
      </button>
    </div>

    <div class="grid g4" style="margin-bottom:18px">
      <article v-for="item in summary" :key="item.label" class="kpi" :class="item.color">
        <span class="shine" />
        <div class="k-lbl" style="font-size:14px;font-weight:700;color:#fff">{{ item.label }}</div>
        <div class="k-val">{{ item.value }}</div>
        <div class="k-lbl">{{ item.note }}</div>
      </article>
    </div>

    <div class="card">
      <div class="card-b" style="padding-bottom:0">
        <div class="toolbar">
          <select v-model="selectedDay" class="sel" aria-label="Pilih tanggal absensi">
            <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
          </select>
          <select v-if="section === 'absensi-siswa'" v-model="school" class="sel" aria-label="Pilih jenjang">
            <option value="Semua">Semua Jenjang</option><option value="SMP">SMP</option><option value="SMK">SMK</option>
          </select>
          <select v-if="section === 'absensi-siswa'" v-model="classroom" class="sel" aria-label="Pilih kelas">
            <option value="Semua">Semua Kelas</option><option v-for="item in classrooms" :key="item" :value="item">{{ item }}</option>
          </select>
          <label class="inp"><span class="ic"><AdminIcon name="search" size="17" /></span>
            <input v-model.trim="query" :placeholder="section === 'absensi-siswa' ? 'Cari nama / NIS…' : 'Cari nama guru…'" />
          </label>
        </div>
        <div v-if="section === 'absensi-siswa'" class="toolbar" style="margin-top:-4px">
          <button v-for="item in statusOptions" :key="item.value" class="chip" :class="{ on: status === item.value }" type="button" @click="status = item.value">{{ item.label }}</button>
        </div>
      </div>

      <div class="tbl-wrap"><table class="tbl rt"><thead><tr>
        <th>{{ section === 'absensi-siswa' ? 'Siswa' : 'Guru' }}</th>
        <th>{{ section === 'absensi-siswa' ? 'NIS' : 'NIP' }}</th>
        <th>{{ section === 'absensi-siswa' ? 'Kelas' : 'Mapel' }}</th>
        <th>Status</th><th v-if="section === 'absensi-guru'">Keterlambatan</th><th style="text-align:right">Aksi</th>
      </tr></thead><tbody>
        <tr v-for="item in pagedRows" :key="item.id">
          <td><div class="row-user"><span class="ava">{{ initials(item.name) }}</span><div><div class="t-name">{{ item.name }}</div><div v-if="section === 'absensi-siswa'" class="t-sub">{{ item.gender }}</div></div></div></td>
          <td>{{ item.number }}</td>
          <td><span class="pill" :class="section === 'absensi-siswa' ? 'p-gray' : 'p-blue'">{{ item.group }}</span></td>
          <td><span class="pill" :class="statusClass(item.status)"><span class="pdot" />{{ statusLabel(item.status) }}</span></td>
          <td v-if="section === 'absensi-guru'"><b v-if="item.late" style="color:var(--amber)">{{ item.late }} mnt</b><span v-else style="color:var(--faint)">-</span></td>
          <td style="text-align:right"><button class="btn btn-ghost btn-sm" type="button" @click="selected = item"><AdminIcon name="eye" size="15" /> Detail</button></td>
        </tr>
        <tr v-if="!pagedRows.length"><td :colspan="section === 'absensi-guru' ? 6 : 5"><div class="empty">Tidak ada data yang cocok dengan filter.</div></td></tr>
      </tbody></table></div>
      <div class="pager"><span>Menampilkan {{ pagedRows.length }} dari {{ rows.length }} data</span><div class="pg-btns"><button type="button" :disabled="page === 1" @click="page--">‹</button><button v-for="item in pageCount" :key="item" type="button" :class="{ on: page === item }" @click="page = item">{{ item }}</button><button type="button" :disabled="page === pageCount" @click="page++">›</button></div></div>
    </div>

    <div v-if="selected" class="modal-ov" role="presentation" @click.self="selected = null"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div class="modal-h"><h3 id="detail-title">Detail {{ section === 'absensi-siswa' ? 'Siswa' : 'Guru' }}</h3><button class="icon-btn" type="button" aria-label="Tutup" @click="selected = null"><AdminIcon name="x" size="17" /></button></div><div class="modal-b"><div class="row-user"><span class="ava" style="width:56px;height:56px;font-size:17px">{{ initials(selected.name) }}</span><div><b style="font-size:17px">{{ selected.name }}</b><div class="t-sub">{{ selected.number }} · {{ selected.group }}</div><span class="pill" :class="statusClass(selected.status)" style="margin-top:8px">{{ statusLabel(selected.status) }}</span></div></div></div><div class="modal-f"><button class="btn btn-ghost btn-sm" type="button" @click="selected = null">Tutup</button></div></div></div>
  </section>
  <section v-else class="card"><div class="card-b"><div class="empty">Halaman ini sedang dipindahkan dari prototipe.</div></div></section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'


definePageMeta({ layout: 'admin' })

type Attendance = { id: number; name: string; number: string; group: string; level: 'SMP' | 'SMK'; gender?: string; status: 'H' | 'I' | 'S' | 'A' | 'T'; late?: number }
const route = useRoute()
const section = computed(() => 'absensi-guru')
const isAttendance = computed(() => ['absensi-siswa', 'absensi-guru'].includes(section.value))
const title = computed(() => section.value === 'absensi-siswa' ? 'Absensi Siswa' : 'Absensi Guru')
const subtitle = computed(() => section.value === 'absensi-siswa' ? `${selectedDay.value} · ${rows.value.length} data kehadiran` : `${selectedDay.value} · Kehadiran pendidik & tendik`)
const days = ['Senin, 28 Sep 2026', 'Selasa, 29 Sep 2026', 'Rabu, 30 Sep 2026', 'Kamis, 1 Okt 2026', 'Jumat, 2 Okt 2026', 'Sabtu, 3 Okt 2026']
const selectedDay = ref(days[5]); const school = ref('Semua'); const classroom = ref('Semua'); const query = ref(''); const status = ref('all'); const page = ref(1); const selected = ref<Attendance | null>(null)
const students: Attendance[] = [{id:1,name:'Ahmad Fauzan',number:'2026001',group:'IX-A',level:'SMP',gender:'Laki-laki',status:'H'},{id:2,name:'Siti Aisyah',number:'2026002',group:'IX-A',level:'SMP',gender:'Perempuan',status:'I'},{id:3,name:'Muhammad Rizky',number:'2026019',group:'VIII-B',level:'SMP',gender:'Laki-laki',status:'H'},{id:4,name:'Nabila Zahra',number:'2026103',group:'X RPL 1',level:'SMK',gender:'Perempuan',status:'S'},{id:5,name:'Dimas Pratama',number:'2026107',group:'X RPL 1',level:'SMK',gender:'Laki-laki',status:'H'},{id:6,name:'Putri Ananda',number:'2026154',group:'XI TKJ 1',level:'SMK',gender:'Perempuan',status:'A'}]
const teachers: Attendance[] = [{id:11,name:'Budi Santoso',number:'198505012010011001',group:'Matematika',level:'SMK',status:'H'},{id:12,name:'Siti Khadijah',number:'198707152011012004',group:'Bahasa Indonesia',level:'SMP',status:'T',late:12},{id:13,name:'Ahmad Subarjo',number:'198112102009011003',group:'Informatika',level:'SMK',status:'H'},{id:14,name:'Dewi Lestari',number:'198906052014012002',group:'PAI',level:'SMP',status:'I'}]
const source = computed(() => section.value === 'absensi-siswa' ? students : teachers)
const classrooms = computed(() => [...new Set(students.filter(item => school.value === 'Semua' || item.level === school.value).map(item => item.group))])
const rows = computed(() => source.value.filter(item => (school.value === 'Semua' || item.level === school.value) && (classroom.value === 'Semua' || item.group === classroom.value) && (status.value === 'all' || item.status === status.value) && `${item.name} ${item.number}`.toLowerCase().includes(query.value.toLowerCase())))
const summary = computed(() => section.value === 'absensi-siswa' ? [['Hadir','H','k-green'],['Izin','I','k-amber'],['Sakit','S','k-blue'],['Alpa','A','k-violet']].map(([label,key,color]) => ({label,value:students.filter(item => item.status === key).length,color,note:`dari ${students.length} siswa`})) : [{label:'Hadir Tepat Waktu',value:teachers.filter(item => item.status === 'H').length,color:'k-green',note:`dari ${teachers.length} guru`},{label:'Terlambat',value:teachers.filter(item => item.status === 'T').length,color:'k-amber',note:'total 12 menit'},{label:'Izin / Sakit',value:teachers.filter(item => ['I','S'].includes(item.status)).length,color:'k-blue',note:'dari total guru'},{label:'Tingkat Kehadiran',value:'75%',color:'k-violet',note:'stabil'}])
const statusOptions = [{value:'all',label:'Semua'},{value:'H',label:'Hadir'},{value:'I',label:'Izin'},{value:'S',label:'Sakit'},{value:'A',label:'Alpa'}]
const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / 12))); const pagedRows = computed(() => rows.value.slice((page.value - 1) * 12, page.value * 12)); watch([school, classroom, query, status, selectedDay], () => page.value = 1)
const initials = (name: string) => name.split(' ').slice(0, 2).map(item => item[0]).join('')
const statusLabel = (value: Attendance['status']) => ({H:'Hadir',I:'Izin',S:'Sakit',A:'Alpa',T:'Terlambat'})[value]
const statusClass = (value: Attendance['status']) => ({H:'p-green',I:'p-amber',S:'p-cyan',A:'p-rose',T:'p-amber'})[value]
const exportRecap = () => window.alert('Rekap absensi diekspor ke Excel.')
</script>

