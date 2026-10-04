<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'

definePageMeta({ layout: 'admin' })

type ContentKind = 'Berita' | 'Pengumuman' | 'Halaman'
type ContentStatus = 'Publish' | 'Draft'
type ContentItem = { id: string; title: string; kind: ContentKind; status: ContentStatus; date: string; author: string; views: number }

const posts = useState<ContentItem[]>('admin-content-posts', () => [
  { id: 'W1', title: 'Penerimaan Peserta Didik Baru 2027/2028', kind: 'Pengumuman', status: 'Draft', date: '28 Sep 2026', author: 'Humas', views: 0 },
  { id: 'W2', title: 'Siswa SMK IT Attaqwa 9 Juara LKS Jaringan Tingkat Kota', kind: 'Berita', status: 'Publish', date: '24 Sep 2026', author: 'Humas', views: 1842 },
  { id: 'W3', title: 'Jadwal UTS Ganjil 2026', kind: 'Pengumuman', status: 'Publish', date: '20 Sep 2026', author: 'Kurikulum', views: 3210 },
  { id: 'W4', title: 'Profil Sekolah', kind: 'Halaman', status: 'Publish', date: '12 Sep 2026', author: 'Admin', views: 5630 },
  { id: 'W5', title: 'Ekstrakurikuler Robotik Raih Medali Emas', kind: 'Berita', status: 'Publish', date: '8 Sep 2026', author: 'Humas', views: 2214 },
  { id: 'W6', title: 'Kalender Akademik 2026/2027', kind: 'Halaman', status: 'Publish', date: '1 Sep 2026', author: 'Admin', views: 4102 },
  { id: 'W7', title: 'Peringatan Maulid Nabi di Sekolah', kind: 'Berita', status: 'Draft', date: '29 Sep 2026', author: 'Humas', views: 0 },
  { id: 'W8', title: 'Tata Tertib Peserta Didik', kind: 'Halaman', status: 'Publish', date: '15 Agu 2026', author: 'Kesiswaan', views: 2870 }
])

const query = ref('')
const status = ref<'all' | ContentStatus>('all')
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<{ title: string; kind: ContentKind }>({ title: '', kind: 'Berita' })
const message = ref('')
const messageKind = ref<'ok' | 'info'>('ok')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const filteredPosts = computed(() => posts.value.filter(item =>
  (status.value === 'all' || item.status === status.value)
  && item.title.toLowerCase().includes(query.value.toLowerCase())))
const typeClass = (kind: ContentKind) => ({ Berita: 'p-blue', Pengumuman: 'p-amber', Halaman: 'p-violet' })[kind]
const showToast = (value: string, kind: 'ok' | 'info' = 'ok') => {
  message.value = value
  messageKind.value = kind
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { message.value = '' }, 2800)
}
const openAdd = () => {
  editingId.value = null
  Object.assign(form, { title: '', kind: 'Berita' })
  modalOpen.value = true
}
const openEdit = (item: ContentItem) => {
  editingId.value = item.id
  Object.assign(form, { title: item.title, kind: item.kind })
  modalOpen.value = true
}
const saveContent = () => {
  const title = form.title.trim()
  if (!title) {
    showToast('Isi judul terlebih dahulu.', 'info')
    return
  }
  if (editingId.value) {
    const item = posts.value.find(post => post.id === editingId.value)
    if (item) Object.assign(item, { title, kind: form.kind })
    showToast('Perubahan konten tersimpan.')
  } else {
    posts.value.unshift({ id: `W${Date.now()}`, title, kind: form.kind, status: 'Draft', date: '3 Okt 2026', author: 'Administrator', views: 0 })
    showToast('Konten tersimpan sebagai draft.')
  }
  modalOpen.value = false
}
const togglePublish = (item: ContentItem) => {
  item.status = item.status === 'Publish' ? 'Draft' : 'Publish'
  showToast(`“${item.title.slice(0, 30)}${item.title.length > 30 ? '…' : ''}” ${item.status === 'Publish' ? 'dipublikasikan' : 'menjadi draft'}.`)
}
const removeContent = (id: string) => {
  posts.value = posts.value.filter(item => item.id !== id)
  showToast('Konten dihapus.')
}

onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer) })
</script>

<template>
  <section>
    <div class="page-head"><div><h2>Konten Website</h2><p>Kelola halaman, berita & pengumuman web profile sekolah</p></div><button class="btn btn-primary btn-sm" type="button" @click="openAdd"><AdminIcon name="plus" size="16" /> Tambah Konten</button></div>
    <article class="card">
      <div class="card-b content-toolbar"><div class="toolbar"><label class="inp"><span class="ic"><AdminIcon name="search" size="17" /></span><input v-model.trim="query" placeholder="Cari judul…" /></label><select v-model="status" class="sel" aria-label="Filter status"><option value="all">Semua Status</option><option value="Publish">Publish</option><option value="Draft">Draft</option></select><span class="content-count">{{ filteredPosts.length }} konten</span></div></div>
      <div class="tbl-wrap"><table class="tbl rt"><thead><tr><th>Judul</th><th>Jenis</th><th>Status</th><th>Publish</th><th>Tanggal</th><th style="text-align:right">Views</th><th style="text-align:right">Aksi</th></tr></thead><tbody><tr v-for="item in filteredPosts" :key="item.id"><td data-l="Judul" class="t-name content-title">{{ item.title }}<div class="t-sub">oleh {{ item.author }}</div></td><td data-l="Jenis"><span class="pill" :class="typeClass(item.kind)">{{ item.kind }}</span></td><td data-l="Status"><span class="pill" :class="item.status === 'Publish' ? 'p-green' : 'p-gray'">{{ item.status }}</span></td><td data-l="Publish"><label class="sw"><input type="checkbox" :checked="item.status === 'Publish'" :aria-label="`Ubah status ${item.title}`" @change="togglePublish(item)" /><span class="tr" /></label></td><td data-l="Tanggal">{{ item.date }}</td><td data-l="Views" style="text-align:right">{{ item.views ? item.views.toLocaleString('id-ID') : '—' }}</td><td data-l="Aksi" class="tbl-act content-actions"><button class="btn btn-ghost btn-sm" type="button" :aria-label="`Edit ${item.title}`" @click="openEdit(item)"><AdminIcon name="pencil" size="14" /></button><button class="btn btn-ghost btn-sm delete-button" type="button" :aria-label="`Hapus ${item.title}`" @click="removeContent(item.id)"><AdminIcon name="trash" size="14" /></button></td></tr><tr v-if="!filteredPosts.length"><td colspan="7"><div class="empty">Tidak ada konten.</div></td></tr></tbody></table></div>
    </article>

    <AdminModal :open="modalOpen" :title="editingId ? 'Edit Konten' : 'Tambah Konten'" @close="modalOpen = false">
      <div class="field"><label for="content-title">Judul</label><div class="inp"><input id="content-title" v-model="form.title" placeholder="Judul konten…" /></div></div>
      <div class="field"><label for="content-kind">Jenis</label><div class="inp"><select id="content-kind" v-model="form.kind"><option>Berita</option><option>Pengumuman</option><option>Halaman</option></select></div></div>
      <template #footer><button class="btn btn-ghost btn-sm" type="button" @click="modalOpen = false">Batal</button><button class="btn btn-primary btn-sm" type="button" @click="saveContent"><AdminIcon name="check" size="15" /> {{ editingId ? 'Simpan Perubahan' : 'Simpan Draft' }}</button></template>
    </AdminModal>
    <AdminToast :message="message" :kind="messageKind" />
  </section>
</template>

<style scoped>
.content-toolbar{padding-bottom:0}.content-count{font-size:13px;color:var(--muted);margin-left:auto}.content-title{max-width:280px}.content-actions{display:flex;justify-content:flex-end;gap:6px;white-space:nowrap}.delete-button{color:var(--rose)}@media(max-width:640px){.content-count{width:100%;margin-left:0}.toolbar .inp{width:100%}}
</style>
