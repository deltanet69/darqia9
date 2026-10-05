<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
import AdminToast from '~/components/admin/AdminToast.vue'

definePageMeta({ layout: 'admin', name: 'admin-konten' })
useHead({ title: 'Konten Website | Admin Portal' })

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

const totalViews = computed(() => posts.value.reduce((acc, curr) => acc + curr.views, 0))
const publishedCount = computed(() => posts.value.filter(p => p.status === 'Publish').length)
const newsCount = computed(() => posts.value.filter(p => p.kind === 'Berita').length)
const announcementCount = computed(() => posts.value.filter(p => p.kind === 'Pengumuman').length)

const filteredPosts = computed(() => posts.value.filter(item =>
  (status.value === 'all' || item.status === status.value)
  && item.title.toLowerCase().includes(query.value.toLowerCase())))

const typeClass = (kind: ContentKind) => ({
  Berita: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  Pengumuman: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  Halaman: 'bg-purple-50 text-purple-700 border border-purple-200/80'
})[kind]

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
  <section class="space-y-6">
    <!-- Page Head -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Konten Website</h2>
        <p class="text-sm text-slate-500 mt-1">Kelola halaman, berita &amp; pengumuman web profile sekolah</p>
      </div>
      <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-[0_6px_18px_-4px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_24px_-4px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200" type="button" @click="openAdd">
        <AdminIcon name="plus" size="16" /> Tambah Konten
      </button>
    </div>

    <!-- KPI Gradient Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Konten (k-blue) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#60a5fa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="globe" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ publishedCount }} Tayang
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ posts.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Total Konten Terdata</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[10, 14, 18, 22, 28, 32]" color="#ffffff" />
        </div>
      </div>

      <!-- Berita & Artikel (k-violet) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="file" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Aktif
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ newsCount }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Berita &amp; Artikel Sekolah</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[4, 6, 9, 12, 14, 18]" color="#ffffff" />
        </div>
      </div>

      <!-- Pengumuman (k-amber) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#92400e] via-[#d97706] to-[#fbbf24] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="alert" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            PPDB &amp; UTS
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ announcementCount }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Pengumuman Terbit</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[2, 3, 5, 4, 7, 8]" color="#ffffff" />
        </div>
      </div>

      <!-- Total Views (k-green) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#065f46] via-[#059669] to-[#34d399] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="eye" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            +18.4% bln ini
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ (totalViews / 1000).toFixed(1) }}k</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Total Kunjungan Publik</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[12, 16, 24, 28, 38, 46]" color="#ffffff" />
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
      <!-- Toolbar Header -->
      <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/50">
        <div class="flex items-center gap-2.5">
          <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Daftar Publikasi Konten
          </h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">{{ filteredPosts.length }} artikel</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 sm:w-64 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input v-model.trim="query" placeholder="Cari judul..." class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
          </label>
          <select v-model="status" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all" aria-label="Filter status">
            <option value="all">Semua Status</option>
            <option value="Publish">Publish</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <!-- Table Section -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th class="px-5 py-3.5">Judul &amp; Penulis</th>
              <th class="px-4 py-3.5">Jenis</th>
              <th class="px-4 py-3.5">Status</th>
              <th class="px-4 py-3.5">Publish</th>
              <th class="px-4 py-3.5">Tanggal</th>
              <th class="px-4 py-3.5 text-right">Views</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredPosts" :key="item.id" class="hover:bg-blue-50/30 transition-colors duration-150">
              <td class="px-5 py-4 max-w-sm">
                <b class="block font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition cursor-pointer" @click="openEdit(item)">{{ item.title }}</b>
                <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span>oleh <strong class="text-slate-600 font-medium">{{ item.author }}</strong></span>
                  <span>&bull;</span>
                  <span class="font-mono text-[11px] text-slate-400">{{ item.id }}</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-xs" :class="typeClass(item.kind)">
                  {{ item.kind }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" :class="item.status === 'Publish' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-slate-100 text-slate-600 border border-slate-200/80'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="item.status === 'Publish' ? 'bg-emerald-500' : 'bg-slate-400'" />
                  {{ item.status }}
                </span>
              </td>
              <td class="px-4 py-4">
                <button
                  type="button"
                  :aria-label="`Ubah status ${item.title}`"
                  class="w-10 h-5.5 rounded-full transition-colors duration-200 relative focus:outline-none cursor-pointer shadow-inner"
                  :class="item.status === 'Publish' ? 'bg-emerald-500' : 'bg-slate-300'"
                  @click="togglePublish(item)"
                >
                  <span
                    class="block w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 absolute top-0.5 shadow-sm"
                    :class="item.status === 'Publish' ? 'left-[20px]' : 'left-0.5'"
                  />
                </button>
              </td>
              <td class="px-4 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">{{ item.date }}</td>
              <td class="px-4 py-4 text-right font-bold text-slate-800 text-xs">{{ item.views ? item.views.toLocaleString('id-ID') : '—' }}</td>
              <td class="px-5 py-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button class="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150" type="button" :aria-label="`Edit ${item.title}`" @click="openEdit(item)">
                    <AdminIcon name="pencil" size="15" />
                  </button>
                  <button class="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150" type="button" :aria-label="`Hapus ${item.title}`" @click="removeContent(item.id)">
                    <AdminIcon name="trash" size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredPosts.length">
              <td colspan="7" class="py-14 text-center text-slate-400">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <AdminIcon name="globe" size="24" />
                </div>
                <div class="text-sm font-semibold text-slate-600">Tidak ada konten yang cocok</div>
                <div class="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter status.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>Menampilkan <b>{{ filteredPosts.length }}</b> dari total {{ posts.length }} konten</span>
        <span class="font-medium text-slate-400">Pembaruan otomatis tersimpan</span>
      </div>
    </article>

    <!-- Modal Form -->
    <AdminModal :open="modalOpen" :title="editingId ? 'Edit Konten Website' : 'Tambah Konten Baru'" @close="modalOpen = false">
      <div class="space-y-4">
        <div>
          <label for="content-title" class="block text-xs font-bold text-slate-700 mb-1.5">Judul Konten / Berita</label>
          <input id="content-title" v-model="form.title" placeholder="Tulis judul artikel atau pengumuman..." class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
        </div>
        <div>
          <label for="content-kind" class="block text-xs font-bold text-slate-700 mb-1.5">Kategori / Jenis</label>
          <select id="content-kind" v-model="form.kind" class="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all">
            <option value="Berita">Berita &amp; Artikel</option>
            <option value="Pengumuman">Pengumuman Resmi</option>
            <option value="Halaman">Halaman Statis Profil</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="modalOpen = false">Batal</button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)] transition" type="button" @click="saveContent">
          <AdminIcon name="check" size="14" /> {{ editingId ? 'Simpan Perubahan' : 'Simpan Draft' }}
        </button>
      </template>
    </AdminModal>

    <AdminToast :message="message" :kind="messageKind" />
  </section>
</template>

