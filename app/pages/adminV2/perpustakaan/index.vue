<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import PerpusV2ImportModal from '~/components/adminV2/perpus/PerpusV2ImportModal.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminPerpus } from '~/composables/useAdminPerpus'
import { useRbac } from '~/composables/useRbac'
import { SARING_AWAL, barisEkspor, KOLOM_EKSPOR, opsiUnik, ringkasan, saringUrut, tanggalBaca, type BukuAdmin, type SaringBuku, type UrutBuku } from '~/composables/perpusAdminCore'
import { daftarHalaman, jepitHalaman, jumlahHalaman, potongHalaman } from '~/composables/paginasiCore'

definePageMeta({ layout: false })
useHead({
  title: 'Perpustakaan Digital — Admin Portal Darqia 9',
  meta: [{ name: 'description', content: 'Koleksi buku Perpustakaan Digital, ketersediaan berkas, dan statistik baca siswa' }]
})

const router = useRouter()
const store = useAdminPerpus()
const rbac = useRbac()
const jenjang = useAdminJenjang()
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')
const grade = computed<'SMP' | 'SMK'>(() => jenjang.value.toUpperCase() as 'SMP' | 'SMK')
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')
const bisaUbah = computed(() => rbac.bisaSaya('Perpustakaan Digital', 'ubah'))
const bisaBuat = computed(() => rbac.bisaSaya('Perpustakaan Digital', 'buat'))
const bisaHapus = computed(() => rbac.bisaSaya('Perpustakaan Digital', 'hapus'))

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

// Saring, urut, halaman. Jenjang awal mengikuti jenjang aktif di header (bisa diganti ke "Semua").
const saring = ref<SaringBuku>({ ...SARING_AWAL, jenjang: grade.value })
const urut = ref<UrutBuku>('populer')
watch(grade, (g) => { saring.value.jenjang = g })
const daftar = computed(() => saringUrut(store.buku.value, saring.value, urut.value))
const adaSaring = computed(() => JSON.stringify(saring.value) !== JSON.stringify({ ...SARING_AWAL, jenjang: grade.value }))
const sum = computed(() => ringkasan(store.buku.value))
const opsiMapel = computed(() => opsiUnik(store.buku.value, 'mapel'))
const opsiJenis = computed(() => opsiUnik(store.buku.value, 'jenis'))
const terpopuler = computed(() => saringUrut(store.buku.value, { ...SARING_AWAL, status: 'aktif' }, 'populer').filter(b => b.dibaca > 0).slice(0, 5))
const puncak = computed(() => terpopuler.value[0]?.dibaca || 1)

const UKURAN_OPSI = [20, 50, 100]
const ukuran = ref(20)
const halaman = ref(1)
const totalHal = computed(() => jumlahHalaman(daftar.value.length, ukuran.value))
const halAktif = computed(() => jepitHalaman(halaman.value, daftar.value.length, ukuran.value))
const paged = computed(() => potongHalaman(daftar.value, halAktif.value, ukuran.value))
const nomorHal = computed(() => daftarHalaman(halAktif.value, totalHal.value))
const rentang = computed(() => {
  const total = daftar.value.length
  if (!total) return '0 dari 0'
  const dari = (halAktif.value - 1) * ukuran.value + 1
  return `${dari}–${Math.min(total, dari + ukuran.value - 1)} dari ${total}`
})
watch([saring, urut, ukuran], () => { halaman.value = 1 }, { deep: true })
const resetSaring = () => { saring.value = { ...SARING_AWAL, jenjang: grade.value } }

const isImportOpen = ref(false)
const hapusBuku = async (b: BukuAdmin) => {
  if (!window.confirm(`Hapus "${b.judul}" dari katalog? Sampul dan PDF yang diunggah lewat portal ikut terhapus. Tindakan ini tidak bisa dibatalkan.`)) return
  try { await store.hapus(b); triggerToast(`"${b.judul}" dihapus dari katalog.`) } catch (e: any) { triggerToast(e.message) }
}
const exportExcel = async () => {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(barisEkspor(daftar.value), { header: [...KOLOM_EKSPOR] })
  ws['!cols'] = [46, 30, 11, 14, 24, 14, 20, 16, 16, 28, 36, 14, 11, 12, 12, 16].map(wch => ({ wch }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Katalog Perpustakaan')
  XLSX.writeFile(wb, `katalog-perpus-darqia-${new Date().toISOString().slice(0, 10)}.xlsx`)
  triggerToast(`${daftar.value.length} buku (sesuai saringan) diekspor ke Excel.`)
}

const alihTampil = async (b: (typeof daftar.value)[number]) => {
  try {
    await store.setAktif(b, !b.aktif)
    triggerToast(b.aktif ? `"${b.judul}" ditampilkan di koleksi siswa.` : `"${b.judul}" disembunyikan dari koleksi siswa.`)
  } catch (e: any) { triggerToast(e.message) }
}

onMounted(() => { store.load(); rbac.muat().catch(() => {}) })
const selectCls = 'w-full px-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-bold text-[#344054] cursor-pointer'
const btnPutih = 'px-4 py-2.5 rounded-xl font-bold text-xs text-[#344054] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-2xs flex items-center gap-2 transition cursor-pointer'
</script>

<template>
  <div class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white" @click="closeAllModals">
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header :jenjang="jenjang" :role="role" :groups="GROUPS" :active-group-id="activeMegaGroup?.id || 'aplikasi'" :current-route="'aplikasi'" :is-mega-open="isMegaOpen" @update:jenjang="jenjang = $event" @toggle-mega="toggleMega" @open-mobile-menu="isMobileMenuOpen = true" @toggle-search="isSearchOpen = !isSearchOpen" @toggle-notif="isNotifOpen = !isNotifOpen" @toggle-profile="isProfileOpen = !isProfileOpen" />
      <AdminV2Breadcrumb :items="[{ label: 'Portal Admin', to: '/adminV2' }, { label: 'Aplikasi' }, { label: 'Perpustakaan Digital' }]" :badge="grade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'" :jenjang="grade === 'SMP' ? 'smp' : 'smk'" />
      <AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen = false" @select-item="handleSelectModule" />
    </div>

    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4 sm:space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#166534] border border-[#A6E9C5]' : 'bg-[#EFF4FF] text-[#1B5FD9] border border-[#B2CCFF]'">{{ schoolName }}</span>
            <span class="text-xs font-semibold text-[#667085]">perpus.smpitbca.sch.id &middot; perpus.smkitattaqwa9.sch.id</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">Perpustakaan Digital</h1>
          <p class="text-xs sm:text-sm text-[#667085] mt-0.5 font-medium">Koleksi buku, ketersediaan berkas, dan buku yang paling sering dibaca siswa</p>
        </div>
        <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button type="button" :class="btnPutih" @click="exportExcel"><AdminV2Icon name="dl" :size="14" /><span>Ekspor Excel</span></button>
          <button v-if="bisaBuat" type="button" :class="btnPutih" @click="isImportOpen = true"><AdminV2Icon name="plus" :size="14" /><span>Impor Katalog</span></button>
          <button v-if="bisaBuat" type="button" class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#1B5FD9] hover:bg-[#154EBC] shadow-xs flex items-center gap-2 transition cursor-pointer" @click="router.push('/adminV2/perpustakaan/baru')"><AdminV2Icon name="plus" :size="14" /><span>Tambah Buku</span></button>
        </div>
      </div>

      <div v-if="store.status.value === 'galat'" class="rounded-3xl bg-[#FEF3F2] border border-[#FECDCA] p-5 text-sm font-bold text-[#B42318]">
        {{ store.galat.value }} <button type="button" class="ml-2 underline cursor-pointer" @click="store.load()">Coba lagi</button>
      </div>

      <template v-else>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
            <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Total Buku</span>
            <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#101828] block mt-1.5">{{ sum.total }}</b>
            <span class="text-xs text-[#667085] block mt-1">{{ sum.aktif }} tampil di koleksi siswa</span>
          </div>
          <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
            <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Berkas PDF Tersedia</span>
            <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#059669] block mt-1.5">{{ sum.berkasAda }}<span class="text-base text-[#98A2B3]"> / {{ sum.total }}</span></b>
            <span class="text-xs text-[#667085] block mt-1">{{ sum.total - sum.berkasAda }} buku belum ada berkasnya</span>
          </div>
          <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
            <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Total Pembacaan</span>
            <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#1B5FD9] block mt-1.5">{{ sum.dibaca }}</b>
            <span class="text-xs text-[#667085] block mt-1">Satu sesi baca dihitung sekali</span>
          </div>
          <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
            <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Siswa Pembaca</span>
            <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#101828] block mt-1.5">{{ store.pembacaUnik.value }}</b>
            <span class="text-xs text-[#667085] block mt-1">{{ sum.belumPernah }} buku tersedia belum pernah dibaca</span>
          </div>
        </div>

        <div class="bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs">
          <h2 class="text-sm font-extrabold text-[#101828]">Buku Paling Sering Dibaca</h2>
          <p v-if="!terpopuler.length" class="text-xs text-[#98A2B3] font-medium mt-2">Belum ada data baca. Hitungan mulai terkumpul saat siswa membuka buku.</p>
          <ol v-else class="mt-3 space-y-2.5">
            <li v-for="(b, i) in terpopuler" :key="b.id" class="flex items-center gap-3">
              <span class="w-5 text-xs font-mono font-extrabold text-[#98A2B3]">{{ i + 1 }}</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-3"><span class="truncate text-xs font-bold text-[#101828]">{{ b.judul }}</span><span class="shrink-0 text-[11px] font-mono font-bold text-[#1B5FD9]">{{ b.dibaca }}x &middot; {{ b.pembaca }} siswa</span></div>
                <div class="mt-1 h-1.5 rounded-full bg-[#EEF2F7] overflow-hidden"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: (b.dibaca / puncak * 100) + '%' }" /></div>
              </div>
            </li>
          </ol>
        </div>

        <div class="bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div class="relative w-full">
            <input v-model="saring.q" type="text" placeholder="Cari judul, penulis, mapel, atau nama berkas..." class="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-medium transition-colors text-[#101828] placeholder:text-[#98A2B3]">
            <AdminV2Icon name="search" :size="15" class="absolute left-3 top-3 text-[#98A2B3]" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
            <select v-model="saring.jenjang" :class="selectCls" aria-label="Jenjang"><option value="">Semua jenjang</option><option value="SMP">SMP</option><option value="SMK">SMK</option></select>
            <select v-model="saring.mapel" :class="selectCls" aria-label="Mapel atau kategori"><option value="">Semua mapel</option><option v-for="m in opsiMapel" :key="m" :value="m">{{ m }}</option></select>
            <select v-model="saring.jenis" :class="selectCls" aria-label="Jenis"><option value="">Semua jenis</option><option v-for="j in opsiJenis" :key="j" :value="j">{{ j }}</option></select>
            <select v-model="saring.berkas" :class="selectCls" aria-label="Berkas PDF"><option value="">Semua berkas</option><option value="ada">Berkas ada</option><option value="belum">Berkas belum ada</option></select>
            <select v-model="saring.status" :class="selectCls" aria-label="Status tampil"><option value="">Semua status</option><option value="aktif">Tampil</option><option value="nonaktif">Disembunyikan</option></select>
            <select v-model="saring.akses" :class="selectCls" aria-label="Jadwal akses"><option value="">Semua akses</option><option value="harian">Setiap hari</option><option value="akhirpekan">Sabtu–Minggu</option></select>
            <select v-model="urut" :class="selectCls" aria-label="Urutkan"><option value="populer">Urut: paling sering dibaca</option><option value="pembaca">Urut: pembaca terbanyak</option><option value="terbaru">Urut: terakhir dibaca</option><option value="judul">Urut: judul A–Z</option><option value="mapel">Urut: mapel</option></select>
          </div>
          <button v-if="adaSaring" type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline cursor-pointer" @click="resetSaring">Reset saringan</button>
        </div>

        <div class="bg-white border border-[#E7EBF2] rounded-3xl shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#F8FAFC] text-[#475467] font-bold uppercase tracking-wider text-[10.5px] border-b border-[#E7EBF2]">
                <tr>
                  <th class="py-3.5 px-4">Buku</th><th class="py-3.5 px-4">Mapel / Kategori</th><th class="py-3.5 px-4">Jenjang &amp; Kelas</th><th class="py-3.5 px-4">Akses</th>
                  <th class="py-3.5 px-4">Berkas</th><th class="py-3.5 px-4 text-center" title="Jumlah sesi baca">Dibaca</th><th class="py-3.5 px-4 text-center">Siswa</th><th class="py-3.5 px-4">Terakhir</th><th class="py-3.5 px-4">Status</th><th v-if="bisaUbah || bisaHapus" class="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
                <tr v-for="b in paged" :key="b.id" class="hover:bg-[#F8FAFC] transition-colors" :class="{ 'opacity-55': !b.aktif }">
                  <td class="py-3.5 px-4 max-w-[380px]">
                    <div class="flex items-start gap-3">
                      <img v-if="b.sampul" :src="b.sampul" :alt="'Sampul ' + b.judul" loading="lazy" class="w-10 h-14 shrink-0 rounded-md object-cover border border-[#E7EBF2] bg-[#F8FAFC]">
                      <span v-else class="w-10 h-14 shrink-0 rounded-md border border-dashed border-[#D0D5DD] bg-[#F8FAFC] flex items-center justify-center text-[9px] font-bold text-[#98A2B3] text-center leading-tight" title="Belum ada foto sampul">Tanpa sampul</span>
                      <div class="min-w-0">
                        <span class="block font-extrabold text-[#101828] text-[13px]">{{ b.judul }}</span>
                        <span v-if="b.pengarang || b.penerbit" class="block text-[11px] text-[#98A2B3] font-semibold mt-0.5">{{ [b.pengarang, b.penerbit].filter(Boolean).join(' · ') }}</span>
                        <span class="block text-[10.5px] text-[#98A2B3] font-mono mt-0.5 break-all">{{ b.slugFile || b.id }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4"><span class="block">{{ b.mapel || '-' }}</span><span class="block text-[11px] text-[#98A2B3]">{{ b.jenis }}{{ b.kurikulum ? ' · ' + b.kurikulum : '' }}</span><span v-if="b.statusLegal" class="block text-[11px] text-[#98A2B3]">Legal: {{ b.statusLegal }}</span></td>
                  <td class="py-3.5 px-4"><span v-for="j in b.jenjang" :key="j" class="mr-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border" :class="j === 'SMP' ? 'bg-[#E7F6ED] text-[#166534] border-[#A6E9C5]' : 'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]'">{{ j }}</span><span class="block text-[11px] text-[#98A2B3] mt-1">{{ b.kelas || 'Semua kelas' }}</span></td>
                  <td class="py-3.5 px-4"><span class="font-bold" :class="b.akhirPekan ? 'text-[#B54708]' : 'text-[#344054]'">{{ b.akhirPekan ? 'Sabtu–Minggu' : 'Setiap hari' }}</span></td>
                  <td class="py-3.5 px-4"><span class="inline-flex items-center gap-1.5 text-[11px] font-bold" :class="b.berkasAda ? 'text-[#059669]' : 'text-[#B54708]'" :title="b.pathPdf || 'Path PDF belum diisi'"><span class="w-1.5 h-1.5 rounded-full" :class="b.berkasAda ? 'bg-[#10B981]' : 'bg-[#F79009]'" />{{ b.berkasAda ? 'Ada · ' + b.format.toUpperCase() : 'Belum ada' }}</span><span v-if="b.pathPdf" class="block text-[10.5px] text-[#98A2B3] font-mono mt-0.5 break-all max-w-[190px]">{{ b.pathPdf }}</span></td>
                  <td class="py-3.5 px-4 text-center font-mono font-extrabold text-[#101828]">{{ b.dibaca }}</td>
                  <td class="py-3.5 px-4 text-center font-mono text-[#667085]">{{ b.pembaca }}</td>
                  <td class="py-3.5 px-4 text-[#667085] whitespace-nowrap">{{ tanggalBaca(b.terakhir) }}</td>
                  <td class="py-3.5 px-4"><span class="inline-flex items-center gap-1.5 text-[11px] font-bold" :class="b.aktif ? 'text-[#059669]' : 'text-[#98A2B3]'"><span class="w-1.5 h-1.5 rounded-full" :class="b.aktif ? 'bg-[#10B981]' : 'bg-[#98A2B3]'" />{{ b.aktif ? 'Tampil' : 'Disembunyikan' }}</span></td>
                  <td v-if="bisaUbah || bisaHapus" class="py-3.5 px-4 text-right whitespace-nowrap space-x-3">
                    <template v-if="bisaUbah">
                      <button type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline cursor-pointer" @click="router.push(`/adminV2/perpustakaan/${encodeURIComponent(b.id)}`)">Ubah</button>
                      <button type="button" class="text-xs font-bold text-[#667085] hover:underline cursor-pointer" @click="alihTampil(b)">{{ b.aktif ? 'Sembunyikan' : 'Tampilkan' }}</button>
                    </template>
                    <button v-if="bisaHapus" type="button" class="text-xs font-bold text-[#B42318] hover:underline cursor-pointer" @click="hapusBuku(b)">Hapus</button>
                  </td>
                </tr>
                <tr v-if="store.status.value === 'muat'"><td colspan="10" class="py-12 text-center text-[#98A2B3] font-medium">Memuat koleksi…</td></tr>
                <tr v-else-if="!daftar.length"><td colspan="10" class="py-12 text-center text-[#98A2B3] font-medium">{{ store.buku.value.length ? 'Tidak ada buku yang cocok dengan saringan.' : 'Koleksi masih kosong. Gunakan Tambah Buku atau Impor Katalog untuk mengisinya.' }}</td></tr>
              </tbody>
            </table>
          </div>
          <div v-if="daftar.length" class="flex flex-col gap-3 border-t border-[#F2F4F7] bg-[#FAFBFC] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#475467]">
              <span>Menampilkan <b class="text-[#101828]">{{ rentang }}</b> buku</span>
              <label class="inline-flex items-center gap-1.5 font-semibold">Per halaman
                <select v-model.number="ukuran" class="min-h-9 rounded-lg border border-[#E7EBF2] bg-white px-2 text-xs font-bold text-[#101828] cursor-pointer"><option v-for="n in UKURAN_OPSI" :key="n" :value="n">{{ n }}</option></select>
              </label>
            </div>
            <nav v-if="totalHal > 1" class="flex items-center justify-center gap-1.5" aria-label="Halaman daftar buku">
              <button type="button" class="h-9 min-w-9 rounded-xl border border-[#E7EBF2] bg-white px-2.5 text-xs font-extrabold text-[#101828] transition hover:bg-[#EFF2F7] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer" :disabled="halAktif <= 1" aria-label="Halaman sebelumnya" @click="halaman = halAktif - 1">&lsaquo;</button>
              <span class="px-2 text-xs font-semibold text-[#475467] sm:hidden">Halaman <b class="text-[#101828]">{{ halAktif }}</b> / {{ totalHal }}</span>
              <template v-for="(n, i) in nomorHal" :key="`${n}-${i}`">
                <span v-if="n === '…'" class="hidden px-1 text-xs text-[#98A2B3] sm:inline">…</span>
                <button v-else type="button" class="hidden h-9 min-w-9 rounded-xl border px-2.5 text-xs font-extrabold transition sm:inline-block cursor-pointer" :class="n === halAktif ? 'border-[#1B5FD9] bg-[#1B5FD9] text-white' : 'border-[#E7EBF2] bg-white text-[#101828] hover:bg-[#EFF2F7]'" :aria-current="n === halAktif ? 'page' : undefined" @click="halaman = n">{{ n }}</button>
              </template>
              <button type="button" class="h-9 min-w-9 rounded-xl border border-[#E7EBF2] bg-white px-2.5 text-xs font-extrabold text-[#101828] transition hover:bg-[#EFF2F7] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer" :disabled="halAktif >= totalHal" aria-label="Halaman berikutnya" @click="halaman = halAktif + 1">&rsaquo;</button>
            </nav>
          </div>
        </div>
      </template>
    </main>

    <PerpusV2ImportModal :open="isImportOpen" @close="isImportOpen = false" @imported="triggerToast" />
    <AdminV2BottomNav :role="role" :jenjang="jenjang" @open-menu="isMobileMenuOpen = true" @nav-click="handleSelectModule" />
    <AdminV2MobileMenu :open="isMobileMenuOpen" :role="role" :groups="GROUPS" :jenjang="jenjang" @close="isMobileMenuOpen = false" @select-item="handleSelectModule" />
    <AdminV2Popovers :is-search-open="isSearchOpen" :is-notif-open="isNotifOpen" :is-profile-open="isProfileOpen" :role="role" :jenjang="jenjang" @close-all="closeAllModals" @select-module="handleSelectModule" />
    <AdminV2Toast :visible="isToastVisible" :message="toastMessage" />
  </div>
</template>
