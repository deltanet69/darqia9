<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AdminContentEditor from '~/components/adminV2/AdminContentEditor.vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminGrade } from '~/composables/useAdminGrade'

type Jenjang = 'SMP' | 'SMK'
type Jenis = 'berita' | 'banner' | 'informasi'
type Kategori = { id: string; jenjang: Jenjang; nama: string }

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const grade = useAdminGrade()
const id = computed(() => String(route.params.id))
const jenis = computed<Jenis>(() => ['banner', 'informasi'].includes(String(route.query.jenis)) ? String(route.query.jenis) as Jenis : 'berita')
const isNew = computed(() => id.value === 'baru')
const isEditing = ref(isNew.value)
const jenjang = computed<'smp'|'smk'>({ get: () => grade.value.toLowerCase() as 'smp'|'smk', set: value => { grade.value = value.toUpperCase() as Jenjang } })
const role = ref<'superadmin'|'admin_tu'|'guru'>('superadmin')
const activeMegaGroup = ref<GroupItem|null>(null)
const isMegaOpen = ref(false)
const isMobileMenuOpen = ref(false)
const formError = ref('')
const thumbnailBusy = ref(false)
const thumbnailSize = ref(0)

const articles = useState<any[]>('konten-berita', () => [])
const banners = useState<any[]>('konten-banner', () => [])
const infos = useState<any[]>('konten-informasi', () => [])
const categories = useState<Kategori[]>('konten-kategori', () => (['SMP','SMK'] as Jenjang[]).flatMap(jenjang => ['Akademik','Prestasi','Kegiatan','Keagamaan','Olahraga','Pengumuman'].map(nama => ({ id:`K-${jenjang}-${nama.toLowerCase()}`, jenjang, nama }))))
const source = computed(() => jenis.value === 'berita' ? articles.value : jenis.value === 'banner' ? banners.value : infos.value)
const item = computed(() => source.value.find(entry => entry.id === id.value))
const activeCategories = computed(() => categories.value.filter(entry => entry.jenjang === grade.value).sort((a, b) => a.nama.localeCompare(b.nama, 'id')))
const form = reactive({
  judul: '', subjudul: '', kategori: '', status: 'Draft', tanggal: '', tanggalJadwal: '', penulis: '',
  ringkasan: '', isi: '', gambarUrl: '', gambarNama: '', featured: false, tags: '', teks: '',
  ctaLabel: '', ctaLink: '', warna: 'navy', situs: 'Semua', mulai: '', selesai: '', aktif: false,
  target: 'Keduanya', audiens: 'Semua', disematkan: false
})

if (item.value) {
  Object.assign(form, item.value, {
    tags: Array.isArray(item.value.tags) ? item.value.tags.join(', ') : item.value.tags || '',
    tanggalJadwal: item.value.status === 'Terjadwal' ? item.value.tanggal : item.value.tanggalJadwal || ''
  })
  thumbnailSize.value = item.value.gambarUkuran || 0
} else {
  form.kategori = activeCategories.value[0]?.nama || ''
}

const label = computed(() => jenis.value === 'banner' ? 'Popup Banner' : jenis.value === 'informasi' ? 'Berita & Informasi' : 'Berita & Artikel')
const summaryWords = computed(() => form.ringkasan.trim() ? form.ringkasan.trim().split(/\s+/).length : 0)
const formatBytes = (size: number) => size ? `${Math.ceil(size / 1024)} KB` : ''
const localDateTime = (date = new Date()) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

watch(() => form.status, status => {
  if (jenis.value !== 'berita') return
  if (status === 'Terbit') form.tanggal = localDateTime()
  if (status === 'Terjadwal' && !form.tanggalJadwal) form.tanggalJadwal = localDateTime(new Date(Date.now() + 3600000))
})

useHead({ title: `${isNew.value ? 'Tambah' : isEditing.value ? 'Edit' : 'Detail'} ${label.value} | Admin Portal` })

const selectModule = async (title: string) => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  await navigateTo(getAdminDestination(title))
}
const toggleMega = (group: GroupItem) => {
  activeMegaGroup.value = group
  isMegaOpen.value = !isMegaOpen.value
}

const readAsDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})
const canvasBlob = (canvas: HTMLCanvasElement, quality: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality))
const handleThumbnail = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    formError.value = 'Thumbnail harus berupa berkas gambar.'
    input.value = ''
    return
  }

  thumbnailBusy.value = true
  formError.value = ''
  try {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'))
      image.src = objectUrl
    })

    let width = image.naturalWidth
    let height = image.naturalHeight
    const maxSide = 1600
    if (Math.max(width, height) > maxSide) {
      const ratio = maxSide / Math.max(width, height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Kompresi gambar tidak didukung peramban.')
    let blob: Blob | null = null
    let quality = 0.84
    for (let attempt = 0; attempt < 8; attempt++) {
      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)
      blob = await canvasBlob(canvas, quality)
      if (blob && blob.size <= 500 * 1024) break
      quality = Math.max(0.5, quality - 0.08)
      width = Math.max(640, Math.round(width * 0.86))
      height = Math.max(360, Math.round(height * 0.86))
    }
    URL.revokeObjectURL(objectUrl)
    if (!blob || blob.size > 500 * 1024) throw new Error('Gambar belum dapat diperkecil hingga di bawah 500 KB. Pilih gambar lain.')
    form.gambarUrl = await readAsDataUrl(blob)
    form.gambarNama = file.name.replace(/\.[^.]+$/, '') + '.webp'
    thumbnailSize.value = blob.size
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Thumbnail gagal diproses.'
    input.value = ''
  } finally {
    thumbnailBusy.value = false
  }
}
const removeThumbnail = () => {
  form.gambarUrl = ''
  form.gambarNama = ''
  thumbnailSize.value = 0
}

const save = () => {
  formError.value = ''
  if (!form.judul.trim()) return formError.value = 'Judul konten wajib diisi.'
  if (jenis.value === 'berita') {
    if (!form.penulis.trim()) return formError.value = 'Penulis wajib diisi.'
    if (!form.kategori) return formError.value = 'Kategori wajib dipilih.'
    if (summaryWords.value > 30) return formError.value = 'Ringkasan maksimal 30 kata.'
    if (form.status === 'Terjadwal' && !form.tanggalJadwal) return formError.value = 'Tanggal dan jam terbit terjadwal wajib diisi.'
    if (form.featured && form.status !== 'Terbit') return formError.value = 'Berita unggulan hanya dapat dipilih untuk status Terbitkan sekarang.'
  }

  const data: any = { ...form, jenjang: grade.value, gambarUkuran: thumbnailSize.value }
  if (jenis.value === 'berita') {
    data.tags = form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    if (form.status === 'Terbit') data.tanggal = form.tanggal || localDateTime()
    if (form.status === 'Terjadwal') data.tanggal = form.tanggalJadwal
  }
  const list = jenis.value === 'berita' ? articles : jenis.value === 'banner' ? banners : infos
  if (isNew.value) {
    data.id = `${jenis.value === 'berita' ? 'B' : jenis.value === 'banner' ? 'PB' : 'I'}-${Date.now()}`
    data.views = 0
    list.value.unshift(data)
    router.replace(`/adminV2/konten/${data.id}?jenis=${jenis.value}`)
  } else {
    Object.assign(item.value, data)
  }
  isEditing.value = false
}
const remove = () => {
  if (!confirm('Hapus konten ini?')) return
  const list = jenis.value === 'berita' ? articles : jenis.value === 'banner' ? banners : infos
  list.value = list.value.filter(entry => entry.id !== id.value)
  router.push('/adminV2/konten')
}
const cancel = () => isNew.value ? router.push('/adminV2/konten') : isEditing.value = false
const formatDate = (value: string) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', ...(value.includes('T') ? { timeStyle: 'short' } : {}) }).format(new Date(value.includes('T') ? value : `${value}T00:00:00`)) : 'Belum ditentukan'
</script>

<template>
  <div class="min-h-screen bg-[#F3F5F9] pb-24 font-sans text-[#101828] antialiased lg:pb-10">
    <div class="sticky top-0 z-50">
      <AdminV2Header :jenjang="jenjang" :role="role" :groups="GROUPS" current-route="aplikasi" :active-group-id="activeMegaGroup?.id" :is-mega-open="isMegaOpen" @update:jenjang="jenjang=$event" @toggle-mega="toggleMega" @open-mobile-menu="isMobileMenuOpen=true"/>
      <AdminV2Breadcrumb :items="[{label:'Portal Admin',to:'/adminV2'},{label:'Aplikasi'},{label:'Konten Website',to:'/adminV2/konten'},{label:isNew?'Tambah Konten':isEditing?'Edit Konten':'Detail Konten'}]" :badge="jenjang==='smp'?'SMP IT BCA':'SMK IT Attaqwa 9'" :jenjang="jenjang"/>
      <AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen=false" @select-item="selectModule"/>
    </div>

    <main class="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-8">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-bold text-[#1B5FD9]">{{ label }} · {{ grade }}</p>
          <h1 class="mt-1 text-2xl font-extrabold tracking-tight">{{ isNew ? 'Tambah Konten' : isEditing ? 'Edit Konten' : 'Detail Konten' }}</h1>
          <p class="mt-1 text-sm text-[#667085]">{{ isEditing ? 'Susun isi konten dan atur detail publikasinya.' : 'Periksa informasi dan tampilan konten sebelum diterbitkan.' }}</p>
        </div>
        <div v-if="!isNew" class="flex gap-2">
          <button v-if="!isEditing" type="button" class="action secondary" @click="isEditing=true">Edit Konten</button>
          <button type="button" class="action danger" @click="remove">Hapus</button>
        </div>
      </div>

      <section v-if="!isNew&&!item" class="panel p-10 text-center">
        <h2 class="font-bold">Konten tidak ditemukan</h2>
        <button class="mt-4 text-sm font-bold text-[#1B5FD9]" @click="router.push('/adminV2/konten')">Kembali ke daftar</button>
      </section>

      <form v-else-if="isEditing" @submit.prevent="save">
        <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="space-y-5">
            <section class="panel">
              <div class="space-y-5 p-5 sm:p-6">
                <label class="field">Judul<input v-model="form.judul" required placeholder="Masukkan judul konten"></label>
                <label v-if="jenis==='berita'" class="field">Subjudul<input v-model="form.subjudul" placeholder="Subjudul opsional"></label>
                <template v-if="jenis==='banner'">
                  <label class="field">Teks<textarea v-model="form.teks" rows="4"/></label>
                  <div class="grid gap-5 sm:grid-cols-2"><label class="field">Label tombol<input v-model="form.ctaLabel"></label><label class="field">Tautan tombol<input v-model="form.ctaLink"></label></div>
                </template>
              </div>
            </section>

            <section v-if="jenis!=='banner'" class="panel">
              <header class="panel-head"><h2>Isi konten</h2><p>Gunakan pemformatan untuk menyusun isi berita.</p></header>
              <div class="space-y-5 p-5 sm:p-6">
                <AdminContentEditor v-model="form.isi"/>
                <label v-if="jenis==='berita'" class="field">
                  <span class="flex items-center justify-between"><b>Ringkasan</b><span :class="summaryWords>30?'text-[#B42318]':'text-[#667085]'">{{ summaryWords }}/30 kata</span></span>
                  <textarea v-model="form.ringkasan" rows="4" placeholder="Tulis highlight singkat berita untuk ditampilkan pada daftar konten."/>
                  <span>Ringkasan tampil sebagai highlight berita dan maksimal 30 kata.</span>
                </label>
              </div>
            </section>
          </div>

          <aside class="space-y-4 lg:sticky lg:top-[146px]">
            <section v-if="jenis==='berita'" class="panel">
              <div class="p-4">
                <label class="check"><input v-model="form.featured" type="checkbox">Jadikan berita unggulan</label>
                <p class="mt-2 text-xs leading-5 text-[#667085]">Berita unggulan tampil pada area utama website setelah diterbitkan.</p>
              </div>
            </section>

            <section class="panel">
              <header class="panel-head"><h2>Publikasi</h2></header>
              <div class="space-y-4 p-4">
                <template v-if="jenis==='berita'">
                  <label class="field">Status<select v-model="form.status"><option value="Draft">Draft</option><option value="Review">Review</option><option value="Terbit">Terbitkan sekarang</option><option value="Terjadwal">Terjadwal</option></select></label>
                  <label v-if="form.status==='Terbit'" class="field">Tanggal dan jam terbit<input v-model="form.tanggal" type="datetime-local" readonly><span>Terisi otomatis sesuai waktu saat ini.</span></label>
                  <label v-if="form.status==='Terjadwal'" class="field">Jadwal terbit<input v-model="form.tanggalJadwal" type="datetime-local" required></label>
                  <label class="field">Penulis<input v-model="form.penulis" required></label>
                </template>
                <template v-else-if="jenis==='banner'">
                  <label class="check"><input v-model="form.aktif" type="checkbox">Aktifkan popup banner</label>
                  <label class="field">Mulai<input v-model="form.mulai" type="date" required></label>
                  <label class="field">Selesai<input v-model="form.selesai" type="date" required></label>
                  <label class="field">Warna<select v-model="form.warna"><option>navy</option><option>green</option><option>amber</option><option>red</option></select></label>
                  <label class="field">Situs<select v-model="form.situs"><option>Semua</option><option>Yayasan</option><option>SMP</option><option>SMK</option></select></label>
                </template>
                <template v-else>
                  <label class="check"><input v-model="form.disematkan" type="checkbox">Sematkan informasi</label>
                  <label class="field">Status<select v-model="form.status"><option>Draft</option><option>Publish</option></select></label>
                  <label class="field">Penulis<input v-model="form.penulis" required></label>
                  <label class="field">Target<select v-model="form.target"><option>Keduanya</option><option>Admin Portal</option><option>Parent Portal</option></select></label>
                  <label class="field">Audiens<select v-model="form.audiens"><option>Semua</option><option>Orang Tua</option><option>Guru</option><option>Staff TU</option></select></label>
                </template>
              </div>
            </section>

            <section v-if="jenis==='berita'" class="panel">
              <header class="panel-head"><h2>Kategori</h2></header>
              <div class="p-4"><label class="field">Kategori berita<select v-model="form.kategori" required><option disabled value="">Pilih kategori</option><option v-for="entry in activeCategories" :key="entry.id" :value="entry.nama">{{ entry.nama }}</option></select><span>Kelola pilihan melalui submenu Kategori.</span></label></div>
            </section>

            <section v-if="jenis!=='informasi'" class="panel">
              <header class="panel-head"><h2>Thumbnail</h2></header>
              <div class="space-y-3 p-4">
                <div v-if="form.gambarUrl" class="overflow-hidden rounded-xl border border-[#E7EBF2]"><img :src="form.gambarUrl" alt="Pratinjau thumbnail" class="aspect-video w-full object-cover"></div>
                <label class="upload" :class="{ 'upload-busy': thumbnailBusy }">
                  <input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" :disabled="thumbnailBusy" @change="handleThumbnail">
                  <span class="upload-icon"><AdminIcon name="upload" size="24"/></span>
                  <span class="upload-title">{{ thumbnailBusy ? 'Mengompresi gambar…' : form.gambarUrl ? 'Ganti gambar thumbnail' : 'Unggah gambar thumbnail' }}</span>
                  <span class="upload-copy">{{ form.gambarUrl ? 'Klik untuk memilih gambar pengganti.' : 'Klik area ini untuk memilih berkas gambar.' }}</span>
                  <span class="upload-meta">JPG, PNG, atau WebP · maksimal 500 KB setelah kompresi</span>
                </label>
                <div v-if="form.gambarUrl" class="flex items-start justify-between gap-2 text-xs text-[#667085]"><span class="min-w-0 break-all">{{ form.gambarNama || 'thumbnail.webp' }}<br>{{ formatBytes(thumbnailSize) }}</span><button type="button" class="font-bold text-[#B42318]" @click="removeThumbnail">Hapus</button></div>
              </div>
            </section>

            <section v-if="jenis==='berita'" class="panel">
              <header class="panel-head"><h2>Tag</h2></header>
              <div class="p-4"><label class="field">Tag berita<input v-model="form.tags" placeholder="Akademik, Prestasi"><span>Pisahkan setiap tag dengan koma.</span></label></div>
            </section>
          </aside>
        </div>

        <p v-if="formError" class="mt-5 rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-3 text-sm font-semibold text-[#B42318]" role="alert">{{ formError }}</p>
        <footer class="mt-5 flex justify-end gap-3 rounded-2xl border border-[#E7EBF2] bg-white p-3 shadow-sm">
          <button type="button" class="action secondary" @click="cancel">Batal</button>
          <button class="action primary" :disabled="thumbnailBusy">Simpan Konten</button>
        </footer>
      </form>

      <section v-else class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article class="panel">
          <img v-if="item.gambarUrl" :src="item.gambarUrl" :alt="item.judul" class="aspect-[16/7] w-full object-cover">
          <div class="p-6 sm:p-8">
            <div class="flex flex-wrap gap-2 text-xs font-bold text-[#1B5FD9]"><span>{{ item.kategori||label }}</span><span>·</span><span>{{ formatDate(item.tanggal||item.mulai) }}</span></div>
            <h2 class="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{{ item.judul }}</h2>
            <p v-if="item.subjudul" class="mt-2 text-[#667085]">{{ item.subjudul }}</p>
            <AdminContentEditor v-if="item.isi" class="mt-6" :model-value="item.isi" readonly/>
            <p v-if="item.ringkasan" class="mt-6 rounded-xl bg-[#F9FAFB] p-4 font-medium leading-7">{{ item.ringkasan }}</p>
            <p v-if="item.teks" class="mt-5 leading-7">{{ item.teks }}</p>
          </div>
        </article>
        <aside class="panel h-fit">
          <header class="panel-head"><h2>Informasi konten</h2></header>
          <dl class="space-y-4 p-5 text-sm">
            <div><dt>Status</dt><dd>{{ item.status||(item.aktif?'Aktif':'Tidak aktif') }}</dd></div>
            <div><dt>Jenjang</dt><dd>{{ item.jenjang }}</dd></div>
            <div v-if="item.penulis"><dt>Penulis</dt><dd>{{ item.penulis }}</dd></div>
            <div v-if="item.featured"><dt>Penempatan</dt><dd>Berita unggulan</dd></div>
            <div v-if="item.views!==undefined"><dt>Dilihat</dt><dd>{{ item.views.toLocaleString('id-ID') }} kali</dd></div>
          </dl>
        </aside>
      </section>
    </main>

    <AdminV2MobileMenu :open="isMobileMenuOpen" :role="role" :groups="GROUPS" :jenjang="jenjang" @close="isMobileMenuOpen=false" @select-item="selectModule"/>
  </div>
</template>

<style scoped>
.panel{overflow:hidden;border:1px solid #e7ebf2;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.04)}
.panel-head{border-bottom:1px solid #e7ebf2;padding:1rem 1.25rem}
.panel-head h2{font-size:.95rem;font-weight:800}
.panel-head p{margin-top:.2rem;font-size:.78rem;color:#667085}
.field{display:flex;flex-direction:column;gap:.4rem;font-size:.8rem;font-weight:700;color:#344054}
.field span{font-weight:500;color:#667085}
.field input,.field select,.field textarea{width:100%;border:1px solid #d0d5dd;border-radius:10px;background:#fff;padding:.72rem .8rem;font-size:.875rem;font-weight:400;color:#101828;outline:none}
.field input:focus,.field select:focus,.field textarea:focus{border-color:#1b5fd9;box-shadow:0 0 0 4px rgba(27,95,217,.1)}
.field input[readonly]{background:#f9fafb;color:#475467}
.check{display:flex;min-height:44px;align-items:center;gap:.65rem;font-size:.875rem;font-weight:700}
.check input{width:18px;height:18px;accent-color:#1b5fd9}
.upload{display:flex;min-height:168px;cursor:pointer;flex-direction:column;align-items:center;justify-content:center;border:1.5px dashed #98a2b3;border-radius:12px;background:#f9fafb;padding:1rem;text-align:center;color:#344054}
.upload:hover,.upload:focus-within{border-color:#1b5fd9;background:#f5f8ff;box-shadow:0 0 0 4px rgba(27,95,217,.1)}
.upload-busy{cursor:wait;opacity:.7}
.upload-icon{display:flex;height:44px;width:44px;align-items:center;justify-content:center;border-radius:10px;background:#eaf1ff;color:#1b5fd9}
.upload-title{margin-top:.7rem;font-size:.82rem;font-weight:800;color:#101828}
.upload-copy{margin-top:.2rem;font-size:.75rem;font-weight:500;color:#475467}
.upload-meta{margin-top:.45rem;font-size:.68rem;font-weight:600;color:#667085}
.action{min-height:44px;border-radius:10px;padding:.65rem 1rem;font-size:.82rem;font-weight:800}
.primary{background:#1b5fd9;color:#fff}.primary:hover{background:#164cad}.primary:disabled{cursor:not-allowed;opacity:.55}
.secondary{border:1px solid #d0d5dd;background:#fff;color:#344054}
.danger{border:1px solid #fecdca;background:#fff;color:#b42318}
dt{color:#667085}dd{margin-top:.2rem;font-weight:700;color:#101828}
</style>
