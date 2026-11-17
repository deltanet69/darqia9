<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminPerpus } from '~/composables/useAdminPerpus'
import { useRbac } from '~/composables/useRbac'
import { formDariBuku, formKosong, opsiUnik, type FormBuku } from '~/composables/perpusAdminCore'
import { kompresSampul } from '~/composables/perpusKompres'

// Halaman tambah (/adminV2/perpustakaan/baru) dan ubah/hapus (/adminV2/perpustakaan/<id>) satu buku.
definePageMeta({ layout: false })
useHead({ title: 'Detail Buku — Perpustakaan Digital — Admin Portal Darqia 9' })

const route = useRoute()
const router = useRouter()
const store = useAdminPerpus()
const rbac = useRbac()
const jenjang = useAdminJenjang()
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')
const grade = computed<'SMP' | 'SMK'>(() => jenjang.value.toUpperCase() as 'SMP' | 'SMK')
const idRute = computed(() => String(route.params.id))
const baru = computed(() => idRute.value === 'baru')
const buku = computed(() => (baru.value ? null : store.buku.value.find(b => b.id === idRute.value) || null))
const bisaSimpan = computed(() => rbac.bisaSaya('Perpustakaan Digital', baru.value ? 'buat' : 'ubah'))
const bisaHapus = computed(() => !baru.value && rbac.bisaSaya('Perpustakaan Digital', 'hapus'))

// Header, popover, toast (pola sama dengan modul AdminV2 lain)
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)
const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null
const triggerToast = (msg: string) => {
  toastMessage.value = msg
  isToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { isToastVisible.value = false }, 3200)
}
const closeAllModals = () => { isMegaOpen.value = isMobileMenuOpen.value = isSearchOpen.value = isNotifOpen.value = isProfileOpen.value = false }
const toggleMega = (g: GroupItem) => {
  if (isMegaOpen.value && activeMegaGroup.value?.id === g.id) { isMegaOpen.value = false; activeMegaGroup.value = null } else { activeMegaGroup.value = g; isMegaOpen.value = true }
}
const handleSelectModule = (title: string) => {
  closeAllModals()
  const dest = getAdminDestination(title)
  if (dest) return router.push(dest)
  triggerToast(`${title} — modul demo`)
}

// Formulir
const form = ref<FormBuku>(formKosong(grade.value))
const sampul = ref<Blob | null>(null)
const pratinjau = ref('')
const berkas = ref<File | null>(null)
const proses = ref(false)
const galat = ref('')
let idKini: string | null = null // terisi setelah metadata tersimpan, supaya coba ulang unggahan tidak membuat buku ganda
const MAKS_BERKAS = 100 * 1048576

const ganti = (url: string) => { if (pratinjau.value.startsWith('blob:')) URL.revokeObjectURL(pratinjau.value); pratinjau.value = url }
const isi = () => {
  form.value = buku.value ? formDariBuku(buku.value) : formKosong(grade.value)
  idKini = buku.value?.id ?? null
  ganti(buku.value?.sampul || '')
}
onMounted(async () => {
  rbac.muat().catch(() => {})
  if (!baru.value && !store.buku.value.length) await store.load()
  isi()
})

const pilihSampul = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    sampul.value = await kompresSampul(file)
    ganti(URL.createObjectURL(sampul.value))
    galat.value = ''
  } catch (err: any) { galat.value = err.message }
}
const pilihBerkas = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!/\.(pdf|epub)$/i.test(file.name)) { galat.value = 'Berkas harus PDF atau EPUB.'; return }
  if (file.size > MAKS_BERKAS) { galat.value = 'Ukuran berkas maksimal 100 MB.'; return }
  berkas.value = file
  galat.value = ''
}
const alihJenjang = (j: string) => {
  form.value.jenjang = form.value.jenjang.includes(j) ? form.value.jenjang.filter(x => x !== j) : [...form.value.jenjang, j]
}

const simpan = async () => {
  galat.value = ''
  if (!form.value.judul.trim()) { galat.value = 'Judul buku wajib diisi.'; return }
  if (!form.value.jenjang.length) { galat.value = 'Pilih minimal satu jenjang.'; return }
  proses.value = true
  try {
    idKini = await store.simpan(form.value, idKini)
    if (sampul.value) { await store.unggah(idKini, 'sampul', sampul.value); sampul.value = null }
    if (berkas.value) { await store.unggah(idKini, 'berkas', berkas.value); berkas.value = null }
    await store.load()
    triggerToast(baru.value ? 'Buku ditambahkan ke katalog.' : 'Perubahan buku disimpan.')
    setTimeout(() => router.push('/adminV2/perpustakaan'), 700)
  } catch (e: any) {
    await store.load()
    galat.value = idKini && baru.value ? `Data buku sudah tersimpan, tetapi ada yang gagal: ${e.message} Klik Simpan lagi untuk mengulang.` : e.message
  } finally { proses.value = false }
}

const hapus = async () => {
  if (!buku.value || !window.confirm(`Hapus "${buku.value.judul}" dari katalog? Sampul dan berkas yang diunggah lewat portal ikut terhapus. Tindakan ini tidak bisa dibatalkan.`)) return
  try {
    await store.hapus(buku.value)
    router.push('/adminV2/perpustakaan')
  } catch (e: any) { galat.value = e.message }
}

const opsiMapel = computed(() => opsiUnik(store.buku.value, 'mapel'))
const opsiJenis = computed(() => opsiUnik(store.buku.value, 'jenis'))
const opsiKurikulum = computed(() => [...new Set(store.buku.value.map(b => b.kurikulum).filter(Boolean))].sort())
const infoBerkas = computed(() => {
  if (berkas.value) return `${berkas.value.name} (${(berkas.value.size / 1048576).toFixed(1)} MB) — akan diunggah saat Simpan`
  if (buku.value?.berkasAda) return `Berkas ${buku.value.format.toUpperCase()} sudah ada${buku.value.pathPdf ? ` (${buku.value.pathPdf})` : ''}. Pilih file untuk menggantinya.`
  return 'Belum ada berkas. Pilih file PDF atau EPUB (maks. 100 MB).'
})

const input = 'w-full px-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-medium text-[#101828] placeholder:text-[#98A2B3]'
const label = 'block text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] mb-1.5'
const kartu = 'bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs'
</script>

<template>
  <div class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white" @click="closeAllModals">
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header :jenjang="jenjang" :role="role" :groups="GROUPS" :active-group-id="activeMegaGroup?.id || 'aplikasi'" :current-route="'aplikasi'" :is-mega-open="isMegaOpen" @update:jenjang="jenjang = $event" @toggle-mega="toggleMega" @open-mobile-menu="isMobileMenuOpen = true" @toggle-search="isSearchOpen = !isSearchOpen" @toggle-notif="isNotifOpen = !isNotifOpen" @toggle-profile="isProfileOpen = !isProfileOpen" />
      <AdminV2Breadcrumb :items="[{ label: 'Portal Admin', to: '/adminV2' }, { label: 'Perpustakaan Digital', to: '/adminV2/perpustakaan' }, { label: baru ? 'Tambah Buku' : 'Detail Buku' }]" :badge="grade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'" :jenjang="grade === 'SMP' ? 'smp' : 'smk'" />
      <AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen = false" @select-item="handleSelectModule" />
    </div>

    <main class="max-w-[1100px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4 sm:space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <NuxtLink to="/adminV2/perpustakaan" class="text-xs font-bold text-[#1B5FD9] hover:underline">&lsaquo; Kembali ke daftar buku</NuxtLink>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{{ baru ? 'Tambah Buku' : (buku?.judul || 'Detail Buku') }}</h1>
          <p class="text-xs sm:text-sm text-[#667085] mt-0.5 font-medium">Data ini yang dilihat siswa di aplikasi Perpustakaan Digital.</p>
        </div>
      </div>

      <p v-if="!baru && store.status.value === 'muat'" class="text-sm text-[#98A2B3] font-medium">Memuat buku…</p>
      <div v-else-if="!baru && !buku" class="rounded-3xl bg-[#FEF3F2] border border-[#FECDCA] p-5 text-sm font-bold text-[#B42318]">Buku tidak ditemukan. Mungkin sudah dihapus.</div>

      <form v-else class="grid gap-4 lg:grid-cols-[260px_1fr] items-start" @submit.prevent="simpan">
        <div class="space-y-4">
          <section :class="kartu">
            <span :class="label">Foto sampul</span>
            <div class="aspect-[2/3] rounded-2xl border-[1.5px] border-dashed border-[#B2CCFF] bg-[#F5F9FF] overflow-hidden flex items-center justify-center text-center">
              <img v-if="pratinjau" :src="pratinjau" alt="Pratinjau sampul" class="w-full h-full object-cover">
              <span v-else class="px-4 text-xs font-semibold text-[#667085]">Belum ada sampul. Tanpa foto, sampul PDF diambil dari halaman 1; EPUB memakai sampul bertulisan.</span>
            </div>
            <label class="mt-3 block w-full text-center px-3 py-2.5 rounded-xl text-xs font-bold text-[#1B5FD9] bg-[#EFF4FF] hover:bg-[#E0EAFF] transition cursor-pointer">
              {{ pratinjau ? 'Ganti foto' : 'Pilih foto' }}
              <input type="file" accept="image/*" class="hidden" @change="pilihSampul">
            </label>
            <p class="mt-2 text-[11px] text-[#98A2B3] leading-relaxed">Foto otomatis dikecilkan ke 480×720 px dan dikompres (sekitar 100 KB) sebelum diunggah. Rasio 2:3 paling pas.</p>
          </section>
        </div>

        <div class="space-y-4">
          <section :class="[kartu, 'grid grid-cols-1 sm:grid-cols-2 gap-4']">
            <div class="sm:col-span-2"><label :class="label" for="f-judul">Judul *</label><input id="f-judul" v-model="form.judul" :class="input" maxlength="300" placeholder="Judul lengkap buku" required></div>
            <div><label :class="label" for="f-pengarang">Pengarang</label><input id="f-pengarang" v-model="form.pengarang" :class="input" maxlength="300"></div>
            <div><label :class="label" for="f-penerbit">Penerbit</label><input id="f-penerbit" v-model="form.penerbit" :class="input" maxlength="300"></div>
            <div class="sm:col-span-2">
              <span :class="label">Jenjang / satuan pendidikan *</span>
              <div class="flex gap-2">
                <button v-for="j in ['SMP', 'SMK']" :key="j" type="button" class="px-5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer" :class="form.jenjang.includes(j) ? 'bg-[#1B5FD9] text-white border-[#1B5FD9]' : 'bg-white text-[#344054] border-[#E2E8F0] hover:bg-[#F8FAFC]'" :aria-pressed="form.jenjang.includes(j)" @click="alihJenjang(j)">{{ j }}</button>
              </div>
            </div>
            <div><label :class="label" for="f-kelas">Kelas</label><input id="f-kelas" v-model="form.kelas_label" :class="input" maxlength="300" placeholder="Kelas X, Fase E, VII–IX"><p class="mt-1 text-[11px] text-[#98A2B3]">Menentukan siswa kelas berapa yang melihat buku ini. Kosong = semua kelas.</p></div>
            <div><label :class="label" for="f-mapel">Mapel / kategori</label><input id="f-mapel" v-model="form.mapel" :class="input" maxlength="300" list="dl-mapel"></div>
            <div><label :class="label" for="f-jenis">Jenis</label><input id="f-jenis" v-model="form.jenis" :class="input" maxlength="300" list="dl-jenis" placeholder="Buku teks, Novel, Komik"></div>
            <div><label :class="label" for="f-kur">Kurikulum / sumber</label><input id="f-kur" v-model="form.kurikulum" :class="input" maxlength="300" list="dl-kur"></div>
            <div>
              <label :class="label" for="f-akses">Akses baca</label>
              <select id="f-akses" v-model="form.akhir_pekan" :class="input + ' cursor-pointer font-bold'"><option :value="false">Setiap hari</option><option :value="true">Sabtu–Minggu saja</option></select>
            </div>
            <div class="sm:col-span-2">
              <label :class="label" for="f-sinopsis">Sinopsis</label>
              <textarea id="f-sinopsis" v-model="form.sinopsis" :class="input + ' min-h-32 resize-y leading-relaxed'" maxlength="3000" placeholder="Ringkasan isi buku yang tampil di halaman detail siswa. Kosong = teks otomatis dari data di atas." />
              <p class="mt-1 text-[11px] text-[#98A2B3] text-right font-mono">{{ form.sinopsis.length }} / 3000</p>
            </div>
          </section>

          <section :class="kartu">
            <span :class="label">Berkas buku (PDF atau EPUB)</span>
            <label class="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:bg-[#F1F5F9] transition">
              <span class="min-w-0 text-xs font-semibold text-[#344054] break-words">{{ infoBerkas }}</span>
              <span class="shrink-0 text-xs font-bold text-[#1B5FD9]">Pilih berkas</span>
              <input type="file" accept=".pdf,.epub,application/pdf,application/epub+zip" class="hidden" @change="pilihBerkas">
            </label>
            <p class="mt-2 text-[11px] text-[#98A2B3] leading-relaxed">PDF dibaca langsung di aplikasi siswa. EPUB hanya bisa diunduh siswa (pembaca EPUB belum tersedia).</p>
          </section>

          <p v-if="galat" class="text-xs font-bold text-[#B42318]" role="alert">{{ galat }}</p>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <button v-if="bisaHapus" type="button" class="px-4 py-2.5 rounded-xl text-xs font-bold text-[#B42318] bg-[#FEF3F2] hover:bg-[#FEE4E2] transition cursor-pointer" :disabled="proses" @click="hapus">Hapus buku</button>
            </div>
            <div class="flex items-center gap-2.5">
              <NuxtLink to="/adminV2/perpustakaan" class="px-4 py-2.5 rounded-xl text-xs font-bold text-[#667085] hover:bg-white transition">Batal</NuxtLink>
              <button v-if="bisaSimpan" type="submit" class="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer disabled:opacity-50" :disabled="proses">{{ proses ? 'Menyimpan…' : baru ? 'Tambahkan ke Katalog' : 'Simpan Perubahan' }}</button>
            </div>
          </div>
        </div>
      </form>

      <datalist id="dl-mapel"><option v-for="m in opsiMapel" :key="m" :value="m" /></datalist>
      <datalist id="dl-jenis"><option v-for="j in opsiJenis" :key="j" :value="j" /></datalist>
      <datalist id="dl-kur"><option v-for="k in opsiKurikulum" :key="k" :value="k" /></datalist>
    </main>

    <AdminV2BottomNav :role="role" :jenjang="jenjang" @open-menu="isMobileMenuOpen = true" @nav-click="handleSelectModule" />
    <AdminV2MobileMenu :open="isMobileMenuOpen" :role="role" :groups="GROUPS" :jenjang="jenjang" @close="isMobileMenuOpen = false" @select-item="handleSelectModule" />
    <AdminV2Popovers :is-search-open="isSearchOpen" :is-notif-open="isNotifOpen" :is-profile-open="isProfileOpen" :role="role" :jenjang="jenjang" @close-all="closeAllModals" @select-module="handleSelectModule" />
    <AdminV2Toast :visible="isToastVisible" :message="toastMessage" />
  </div>
</template>
