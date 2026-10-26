<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminToast from '~/components/admin/AdminToast.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'


type Jenjang = 'SMP' | 'SMK'
type StatusBerita = 'Draft' | 'Review' | 'Terbit' | 'Terjadwal'
type Berita = { id: string; jenjang: Jenjang; judul: string; kategori: string; status: StatusBerita; tanggal: string; penulis: string; ringkasan: string; isi: string; gambarUrl: string; featured: boolean; views: number }
type Banner = { id: string; jenjang: Jenjang; judul: string; teks: string; warna: 'navy'|'green'|'amber'|'red'; situs: 'Semua'|'Yayasan'|'SMP'|'SMK'; mulai: string; selesai: string; aktif: boolean }
type Informasi = { id: string; jenjang: Jenjang; judul: string; isi: string; target: 'Keduanya'|'Admin Portal'|'Parent Portal'; audiens: 'Semua'|'Orang Tua'|'Guru'|'Staff TU'; disematkan: boolean; status: 'Publish'|'Draft'; tanggal: string; penulis: string }
type Kategori = { id: string; jenjang: Jenjang; nama: string }

const grade = useAdminGrade()
const tab = ref<'berita'|'banner'|'informasi'|'kategori'>('berita')
const query = ref('')
const statusFilter = ref<'Semua'|StatusBerita>('Semua')
const sort = ref<'terbaru'|'terlama'|'terpopuler'|'judul'>('terbaru')
const message = ref('')
const messageKind = ref<'ok'|'info'>('ok')
const namaKategori = ref('')
const kategoriDiedit = ref<string | null>(null)
const namaKategoriEdit = ref('')
const berita = useState<Berita[]>('konten-berita', () => [
  { id:'B-001', jenjang:'SMK', judul:'Siswa SMK IT Attaqwa 9 Juara LKS Jaringan Tingkat Kota', kategori:'Prestasi', status:'Terbit', tanggal:'2026-09-24', penulis:'Humas', ringkasan:'Prestasi siswa pada kompetisi kejuruan tingkat kota.', isi:'Isi berita contoh pada tahap porting.', gambarUrl:'', featured:true, views:1842 },
  { id:'B-002', jenjang:'SMK', judul:'Penerimaan Peserta Didik Baru 2027/2028', kategori:'Pengumuman', status:'Review', tanggal:'2026-09-28', penulis:'Panitia SPMB', ringkasan:'Informasi resmi penerimaan peserta didik baru.', isi:'Isi pengumuman contoh pada tahap porting.', gambarUrl:'', featured:false, views:0 },
  { id:'B-003', jenjang:'SMP', judul:'Peringatan Maulid Nabi di Sekolah', kategori:'Keagamaan', status:'Terbit', tanggal:'2026-09-29', penulis:'Humas', ringkasan:'Kegiatan peringatan Maulid Nabi di lingkungan sekolah.', isi:'Isi berita contoh pada tahap porting.', gambarUrl:'', featured:false, views:756 }
])
const banner = useState<Banner[]>('konten-banner', () => [{ id:'PB-001', jenjang:'SMK', judul:'SPMB 2027/2028 Dibuka', teks:'Pendaftaran calon peserta didik baru telah dibuka.', warna:'navy', situs:'SMK', mulai:'2026-10-01', selesai:'2026-12-31', aktif:true }])
const informasi = useState<Informasi[]>('konten-informasi', () => [{ id:'I-001', jenjang:'SMK', judul:'Jadwal UTS Ganjil 2026', isi:'Jadwal UTS ganjil telah tersedia untuk seluruh kelas.', target:'Keduanya', audiens:'Semua', disematkan:true, status:'Publish', tanggal:'2026-09-20', penulis:'Kurikulum' }])
const kategori = useState<Kategori[]>('konten-kategori', () => (['SMP','SMK'] as Jenjang[]).flatMap(jenjang => ['Akademik','Prestasi','Kegiatan','Keagamaan','Olahraga','Pengumuman'].map(nama => ({ id:`K-${jenjang}-${nama.toLowerCase()}`, jenjang, nama }))))
const listBerita = computed(() => [...berita.value.filter(x => x.jenjang === grade.value && (statusFilter.value === 'Semua' || x.status === statusFilter.value) && x.judul.toLowerCase().includes(query.value.toLowerCase()))].sort((a,b) => sort.value === 'terlama' ? a.tanggal.localeCompare(b.tanggal) : sort.value === 'terpopuler' ? b.views-a.views : sort.value === 'judul' ? a.judul.localeCompare(b.judul,'id') : b.tanggal.localeCompare(a.tanggal)))
const beritaAktif = computed(() => berita.value.filter(x => x.jenjang === grade.value))
const jumlahTerbit = computed(() => beritaAktif.value.filter(x => x.status === 'Terbit').length)
const jumlahUnggulan = computed(() => beritaAktif.value.filter(x => x.status === 'Terbit' && x.featured).length)
const views = computed(() => beritaAktif.value.reduce((n,x) => n+x.views,0))
const kategoriAktif = computed(() => kategori.value.filter(x => x.jenjang === grade.value).sort((a,b) => a.nama.localeCompare(b.nama,'id')))
const formatDate = (value:string) => value ? new Intl.DateTimeFormat('id-ID',{ day:'numeric', month:'short', year:'numeric', ...(value.includes('T') ? { hour:'2-digit', minute:'2-digit' } : {}) }).format(new Date(value.includes('T') ? value : `${value}T00:00:00`)) : 'Belum ditentukan'
const notice = (text:string, kind:'ok'|'info'='ok') => { message.value=text; messageKind.value=kind }
const add = () => { if(tab.value==='kategori') return document.getElementById('nama-kategori')?.focus(); navigateTo(`/adminV2/konten/baru?jenis=${tab.value}`) }
const edit = (item:Berita|Banner|Informasi, type:'berita'|'banner'|'informasi') => navigateTo(`/adminV2/konten/${item.id}?jenis=${type}`)
const nextStatus=(item:Berita)=>{ item.status=item.status==='Draft'?'Review':item.status==='Review'?'Terbit':'Draft'; if(item.status!=='Terbit') item.featured=false; notice(`Status berubah menjadi ${item.status}.`) }
const feature=(item:Berita)=>{ if(item.status!=='Terbit') return notice('Bintang hanya dapat dipasang pada berita Terbit.','info'); if(!item.featured && jumlahUnggulan.value>=5) return notice('Maksimal lima berita unggulan per jenjang.','info'); item.featured=!item.featured; notice(item.featured?'Berita masuk slider unggulan.':'Berita dihapus dari slider unggulan.') }
const remove=(id:string,type:'berita'|'banner'|'informasi')=>{ if(!confirm('Hapus konten ini?')) return; if(type==='berita') berita.value=berita.value.filter(x=>x.id!==id); if(type==='banner') banner.value=banner.value.filter(x=>x.id!==id); if(type==='informasi') informasi.value=informasi.value.filter(x=>x.id!==id); notice('Konten dihapus.') }
const tambahKategori=()=>{ const nama=namaKategori.value.trim(); if(!nama) return notice('Nama kategori wajib diisi.','info'); if(kategoriAktif.value.some(x=>x.nama.toLowerCase()===nama.toLowerCase())) return notice('Kategori tersebut sudah tersedia.','info'); kategori.value.push({id:`K-${Date.now()}`,jenjang:grade.value,nama}); namaKategori.value=''; notice('Kategori berhasil ditambahkan.') }
const mulaiEditKategori=(item:Kategori)=>{ kategoriDiedit.value=item.id; namaKategoriEdit.value=item.nama }
const simpanKategori=(item:Kategori)=>{ const nama=namaKategoriEdit.value.trim(); if(!nama) return notice('Nama kategori wajib diisi.','info'); if(kategoriAktif.value.some(x=>x.id!==item.id&&x.nama.toLowerCase()===nama.toLowerCase())) return notice('Kategori tersebut sudah tersedia.','info'); const namaLama=item.nama; item.nama=nama; berita.value.filter(x=>x.jenjang===grade.value&&x.kategori===namaLama).forEach(x=>x.kategori=nama); kategoriDiedit.value=null; notice('Kategori berhasil diperbarui.') }
const hapusKategori=(item:Kategori)=>{ if(berita.value.some(x=>x.jenjang===grade.value&&x.kategori===item.nama)) return notice('Kategori masih digunakan oleh berita dan belum dapat dihapus.','info'); if(!confirm(`Hapus kategori ${item.nama}?`)) return; kategori.value=kategori.value.filter(x=>x.id!==item.id); notice('Kategori berhasil dihapus.') }
</script>
<template>
<section class="space-y-5">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 class="text-2xl font-bold tracking-tight text-slate-900">Konten Website</h1><p class="mt-1 text-sm text-slate-500">Satu pintu publikasi {{ grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam' }}.</p></div><button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200" @click="add"><AdminIcon name="plus" size="17"/>{{ tab === 'kategori' ? 'Tambah Kategori' : 'Tambah Konten' }}</button></div>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div v-for="item in [{label:'Total Berita',value:beritaAktif.length,color:'text-slate-900'},{label:'Sudah Terbit',value:jumlahTerbit,color:'text-emerald-700'},{label:'Berita Unggulan',value:`${jumlahUnggulan}/5`,color:'text-amber-600'},{label:'Total Dilihat',value:views.toLocaleString('id-ID'),color:'text-slate-900'}]" :key="item.label" class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs font-semibold text-slate-500">{{ item.label }}</p><p class="mt-1 text-2xl font-bold" :class="item.color">{{ item.value }}</p></div></div>
  <div class="overflow-x-auto border-b border-slate-200"><div class="flex min-w-max gap-1"><button v-for="item in [{id:'berita',label:'Berita & Artikel'},{id:'kategori',label:'Kategori'},{id:'banner',label:'Popup Banner'},{id:'informasi',label:'Berita & Informasi'}]" :key="item.id" type="button" class="min-h-11 border-b-2 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" :class="tab===item.id?'border-blue-700 text-blue-700':'border-transparent text-slate-500'" @click="tab=item.id as typeof tab">{{ item.label }}</button></div></div>
  <article v-if="tab==='berita'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div class="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:justify-between"><div class="flex flex-wrap gap-2"><button v-for="item in ['Semua','Draft','Review','Terbit','Terjadwal'] as const" :key="item" type="button" class="min-h-9 rounded-lg px-3 text-xs font-semibold" :class="statusFilter===item?'bg-blue-700 text-white':'bg-slate-100 text-slate-600'" @click="statusFilter=item">{{ item }}</button></div><div class="flex gap-2"><input v-model.trim="query" class="min-h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Cari judul berita"><select v-model="sort" class="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="terbaru">Terbaru</option><option value="terlama">Terlama</option><option value="terpopuler">Terpopuler</option><option value="judul">Judul A–Z</option></select></div></div><div v-if="listBerita.length" class="divide-y divide-slate-100"><div v-for="item in listBerita" :key="item.id" class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><button type="button" class="h-16 w-full shrink-0 rounded-xl sm:w-24" :class="item.gambarUrl?'bg-cover bg-center':'bg-blue-100'" :style="item.gambarUrl?{backgroundImage:`url(${item.gambarUrl})`}:undefined" :aria-label="`Pratinjau ${item.judul}`" @click="navigateTo(`/adminV2/konten/${item.id}?jenis=berita`)"/><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><button type="button" class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold" @click="nextStatus(item)">{{ item.status }}</button><span class="text-xs text-slate-500">{{ item.kategori }} · {{ formatDate(item.tanggal) }}</span></div><button type="button" class="mt-1 block text-left text-sm font-bold text-slate-900 hover:text-blue-700" @click="navigateTo(`/adminV2/konten/${item.id}?jenis=berita`)">{{ item.judul }}</button><p class="mt-1 text-xs text-slate-500">oleh {{ item.penulis }} · {{ item.views.toLocaleString('id-ID') }} dilihat</p></div><div class="flex gap-1 self-end sm:self-auto"><button type="button" class="min-h-10 min-w-10 rounded-lg text-lg text-amber-600 hover:bg-amber-50" :aria-label="`Bintang ${item.judul}`" @click="feature(item)">{{ item.featured?'★':'☆' }}</button><button type="button" class="min-h-10 min-w-10 rounded-lg text-slate-600 hover:bg-slate-100" :aria-label="`Edit ${item.judul}`" @click="edit(item,'berita')"><AdminIcon name="pencil" size="16"/></button><button type="button" class="min-h-10 min-w-10 rounded-lg text-rose-600 hover:bg-rose-50" :aria-label="`Hapus ${item.judul}`" @click="remove(item.id,'berita')"><AdminIcon name="trash" size="16"/></button></div></div></div><div v-else class="p-10 text-center text-sm text-slate-500">Tidak ada berita yang sesuai.</div></article>
  <article v-else-if="tab==='banner'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div class="border-b border-slate-100 p-4"><h2 class="font-bold text-slate-900">Popup Banner</h2><p class="mt-1 text-sm text-slate-500">Tayang satu per kunjungan bila aktif, masih dalam periode, dan sesuai situs.</p></div><div v-if="banner.filter(x=>x.jenjang===grade).length" class="divide-y divide-slate-100"><div v-for="item in banner.filter(x=>x.jenjang===grade)" :key="item.id" class="flex gap-3 p-4"><div class="h-14 w-20 shrink-0 rounded-xl" :class="{navy:'bg-slate-800',green:'bg-emerald-700',amber:'bg-amber-500',red:'bg-rose-700'}[item.warna]"/><div class="min-w-0 flex-1"><div class="flex flex-wrap gap-2"><b>{{ item.judul }}</b><span class="rounded-md px-2 py-0.5 text-xs font-semibold" :class="item.aktif?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'">{{ item.aktif?'Aktif':'Tidak aktif' }}</span></div><p class="mt-1 text-xs text-slate-500">{{ item.situs }} · {{ formatDate(item.mulai) }} s.d. {{ formatDate(item.selesai) }}</p></div><button type="button" class="min-h-10 min-w-10 text-slate-600" @click="edit(item,'banner')"><AdminIcon name="pencil" size="16"/></button><button type="button" class="min-h-10 min-w-10 text-rose-600" @click="remove(item.id,'banner')"><AdminIcon name="trash" size="16"/></button></div></div><div v-else class="p-10 text-center text-sm text-slate-500">Belum ada popup banner untuk jenjang ini.</div></article>
  <article v-else-if="tab==='informasi'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div class="border-b border-slate-100 p-4"><h2 class="font-bold text-slate-900">Berita & Informasi</h2><p class="mt-1 text-sm text-slate-500">Khusus feed Admin Portal dan Parent Portal, bukan website publik.</p></div><div v-if="informasi.filter(x=>x.jenjang===grade).length" class="divide-y divide-slate-100"><div v-for="item in [...informasi.filter(x=>x.jenjang===grade)].sort((a,b)=>Number(b.disematkan)-Number(a.disematkan)||b.tanggal.localeCompare(a.tanggal))" :key="item.id" class="flex gap-3 p-4"><div class="min-w-0 flex-1"><div class="flex flex-wrap gap-2"><b>{{ item.judul }}</b><span v-if="item.disematkan" class="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Disematkan</span><button type="button" class="rounded-md px-2 py-0.5 text-xs font-semibold" :class="item.status==='Publish'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'" @click="item.status=item.status==='Publish'?'Draft':'Publish'">{{ item.status }}</button></div><p class="mt-1 text-xs text-slate-500">{{ item.target }} · {{ item.audiens }} · {{ formatDate(item.tanggal) }}</p></div><button type="button" class="min-h-10 min-w-10 text-slate-600" @click="edit(item,'informasi')"><AdminIcon name="pencil" size="16"/></button><button type="button" class="min-h-10 min-w-10 text-rose-600" @click="remove(item.id,'informasi')"><AdminIcon name="trash" size="16"/></button></div></div><div v-else class="p-10 text-center text-sm text-slate-500">Belum ada berita atau informasi untuk jenjang ini.</div></article>
  <article v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 p-4">
      <h2 class="font-bold text-slate-900">Kategori Berita</h2>
      <p class="mt-1 text-sm text-slate-500">Kategori ini akan tersedia pada editor berita {{ grade }}.</p>
    </div>
    <form class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row" @submit.prevent="tambahKategori">
      <label class="sr-only" for="nama-kategori">Nama kategori</label>
      <input id="nama-kategori" v-model="namaKategori" class="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" placeholder="Nama kategori baru">
      <button class="min-h-11 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">Tambah Kategori</button>
    </form>
    <div class="divide-y divide-slate-100">
      <div v-for="item in kategoriAktif" :key="item.id" class="flex min-h-16 items-center gap-3 p-4">
        <template v-if="kategoriDiedit===item.id">
          <input v-model="namaKategoriEdit" class="min-h-10 min-w-0 flex-1 rounded-lg border border-blue-400 px-3 text-sm outline-none ring-4 ring-blue-100" @keyup.enter="simpanKategori(item)" @keyup.esc="kategoriDiedit=null">
          <button type="button" class="min-h-10 rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white" @click="simpanKategori(item)">Simpan</button>
          <button type="button" class="min-h-10 px-2 text-sm font-semibold text-slate-600" @click="kategoriDiedit=null">Batal</button>
        </template>
        <template v-else>
          <div class="min-w-0 flex-1">
            <b class="text-sm text-slate-900">{{ item.nama }}</b>
            <p class="mt-0.5 text-xs text-slate-500">{{ berita.filter(x=>x.jenjang===grade&&x.kategori===item.nama).length }} berita menggunakan kategori ini</p>
          </div>
          <button type="button" class="min-h-10 min-w-10 rounded-lg text-slate-600 hover:bg-slate-100" :aria-label="`Edit kategori ${item.nama}`" @click="mulaiEditKategori(item)"><AdminIcon name="pencil" size="16"/></button>
          <button type="button" class="min-h-10 min-w-10 rounded-lg text-rose-600 hover:bg-rose-50" :aria-label="`Hapus kategori ${item.nama}`" @click="hapusKategori(item)"><AdminIcon name="trash" size="16"/></button>
        </template>
      </div>
    </div>
  </article>
  <AdminToast :message="message" :kind="messageKind"/>
</section>
</template>

