<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  kelasStatus, labelSekolah, saringTiket, statistikTiket, warnaGrade,
  TIKET_KATEGORI_LAIN, TIKET_KATEGORI_MODUL, TIKET_STATUS,
  type StatusTiket
} from '~/composables/tiketingCore'

// Daftar tiket dua mode dalam satu komponen:
// - Pelapor: "Tiket Saya" — hanya tiket grade aktif (RLS menjamin hanya miliknya).
// - Superadmin: "Kotak Masuk" — seluruh tiket, filter grade/status/kategori/cari.
const emit = defineEmits<{ (e: 'buka', id: string): void, (e: 'buat'): void }>()

const rbac = useRbac()
const { state, superadmin, peranLabel, gradeAktif, muatDaftar } = useTiketing()

const saringStatus = ref<'Semua' | StatusTiket>('Semua')
const saringGrade = ref<'Semua' | 'SMK' | 'SMP'>('Semua')
const saringKategori = ref('Semua')
const cari = ref('')
const chipsStatus: Array<'Semua' | StatusTiket> = ['Semua', ...TIKET_STATUS]

onMounted(async () => { await rbac.muat(); await muatDaftar() })

const daftarGradeAktif = computed(() => state.value.daftar.filter(t => t.grade === gradeAktif.value))
const tampil = computed(() => saringTiket(state.value.daftar, {
  grade: superadmin.value ? saringGrade.value : gradeAktif.value,
  status: saringStatus.value,
  kategori: superadmin.value ? saringKategori.value : 'Semua',
  cari: cari.value
}))
const stat = computed(() => statistikTiket(superadmin.value ? state.value.daftar : daftarGradeAktif.value))
const statSemua = computed(() => statistikTiket(state.value.daftar))
const gradeSebelah = computed<'SMK' | 'SMP'>(() => (gradeAktif.value === 'SMK' ? 'SMP' : 'SMK'))
const jumlahSebelah = computed(() => state.value.daftar.filter(t => t.grade === gradeSebelah.value).length)

const waktuRelatif = (iso: string) => {
  const menit = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (menit < 1) return 'baru saja'
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(iso))
}
</script>

<template>
  <div>
    <!-- Keadaan khusus: migrasi belum dijalankan / galat -->
    <div v-if="state.keadaan === 'belum-migrasi'" class="rounded-xl border border-[#F79009]/50 bg-[#FFFAEB] px-4 py-3 text-[13px] text-[#93370D]">
      Tabel Tiketing belum ada di database. Jalankan <span class="font-semibold">migrasi 0025 (0025_tiketing.sql)</span> di Supabase SQL Editor, lalu muat ulang halaman ini.
    </div>
    <div v-else-if="state.keadaan === 'galat'" class="rounded-xl border border-[#B42318]/40 bg-[#FEF3F2] px-4 py-3 text-[13px] text-[#B42318]">
      Terjadi kendala saat memuat tiket: {{ state.pesanGalat }}
    </div>

    <!-- ================= MODE SUPERADMIN: KOTAK MASUK ================= -->
    <template v-if="superadmin">
      <div class="flex flex-wrap items-start gap-3">
        <div class="min-w-0">
          <h1 class="text-[22px] font-semibold leading-7 text-blue-950">Kotak Masuk Tiket</h1>
          <p class="mt-1 text-[13px] text-slate-500">Seluruh tiket dari semua pengguna dan semua kategori masuk ke sini untuk ditangani Superadmin.</p>
        </div>
        <span class="ml-auto inline-flex items-center gap-2 rounded-full bg-[#101828] px-3 py-1.5 text-[12px] font-medium text-white">Peran Anda: Superadmin</span>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Tiket Baru (belum ditangani)</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#1B5FD9]">{{ statSemua.baru }}</p>
          <p class="text-[12px] text-slate-500">{{ statSemua.baruSMK }} SMK · {{ statSemua.baruSMP }} SMP</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Sedang Diproses</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#B54708]">{{ statSemua.diproses }}</p>
          <p class="text-[12px] text-slate-500">Di semua grade</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Menunggu Info Pelapor</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#6941C6]">{{ statSemua.menunggu }}</p>
          <p class="text-[12px] text-slate-500">Menunggu jawaban pelapor</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Selesai</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#067647]">{{ statSemua.selesai }}</p>
          <p class="text-[12px] text-slate-500">Dari total {{ statSemua.total }} tiket</p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <div class="flex gap-1.5">
          <button v-for="g in (['Semua', 'SMP', 'SMK'] as const)" :key="g" @click="saringGrade = g"
            class="rounded-full px-3.5 py-2 text-[12.5px] font-medium"
            :class="saringGrade === g ? 'bg-[#101828] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300'">
            {{ g === 'Semua' ? 'Semua Grade' : g + ' Saja' }}
          </button>
        </div>
        <select v-model="saringStatus" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-[12.5px] text-slate-600">
          <option v-for="s in chipsStatus" :key="s" :value="s">{{ s === 'Semua' ? 'Semua status' : s }}</option>
        </select>
        <select v-model="saringKategori" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-[12.5px] text-slate-600">
          <option value="Semua">Semua kategori</option>
          <optgroup label="Modul Aplikasi">
            <option v-for="k in TIKET_KATEGORI_MODUL" :key="k" :value="k">{{ k }}</option>
          </optgroup>
          <optgroup label="Kendala Teknis & Lainnya">
            <option v-for="k in TIKET_KATEGORI_LAIN" :key="k" :value="k">{{ k }}</option>
          </optgroup>
        </select>
        <div class="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 sm:max-w-xs">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="cari" class="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-slate-400" placeholder="Cari judul, ID tiket, atau nama pelapor...">
        </div>
      </div>
      <p class="mt-2 text-[12.5px] text-slate-500">Menampilkan <span class="font-semibold text-[#101828]">{{ tampil.length }} tiket</span> — urut: tiket Baru paling atas, lalu yang terakhir diperbarui.</p>
    </template>

    <!-- ================= MODE PELAPOR: TIKET SAYA ================= -->
    <template v-else>
      <div class="flex flex-wrap items-start gap-3">
        <div class="min-w-0">
          <h1 class="text-[22px] font-semibold leading-7 text-blue-950">Tiketing</h1>
          <p class="mt-1 text-[13px] text-slate-500">Buat tiket aduan untuk kendala apa pun — tiket diteruskan ke Superadmin dan dapat kamu pantau penanganannya.</p>
        </div>
        <span class="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 ring-1 ring-slate-300">Peran Anda: <span class="font-semibold text-[#101828]">{{ peranLabel }}</span></span>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#1B5FD9]/30 bg-[#EAF1FC] px-4 py-3">
        <span class="rounded bg-[#1B5FD9] px-2 py-1 text-[11px] font-semibold text-white">GRADE AKTIF: {{ gradeAktif }}</span>
        <p class="min-w-0 flex-1 text-[12.5px] text-slate-600">
          Daftar ini menampilkan tiketmu untuk grade <span class="font-semibold text-[#101828]">{{ gradeAktif }}</span>, mengikuti pengalih jenjang di header.
          Kamu juga punya <span class="font-semibold text-[#101828]">{{ jumlahSebelah }} tiket di grade {{ gradeSebelah }}</span> — ganti pengalih ke {{ gradeSebelah }} untuk melihatnya.
          ID tiket selalu mencantumkan gradenya.
        </p>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Tiket Aktif (Baru &amp; Diproses)</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#101828]">{{ stat.baru + stat.diproses }}</p>
          <p class="text-[12px] text-slate-500">Pada grade {{ gradeAktif }}</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Menunggu Info dari Saya</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#6941C6]">{{ stat.menunggu }}</p>
          <p class="text-[12px] text-slate-500">Superadmin menunggu keterangan tambahan darimu</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Selesai</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#067647]">{{ stat.selesai }}</p>
          <p class="text-[12px] text-slate-500">Dari total {{ stat.total }} tiket grade {{ gradeAktif }}</p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <div class="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 sm:max-w-xs">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="cari" class="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-slate-400" placeholder="Cari judul atau nomor tiket...">
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="s in chipsStatus" :key="s" @click="saringStatus = s"
            class="rounded-full px-3 py-1.5 text-[12px] font-medium"
            :class="saringStatus === s ? 'bg-[#101828] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300'">{{ s }}</button>
        </div>
        <button @click="emit('buat')" class="ml-auto rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-700">+ Buat Tiket</button>
      </div>
    </template>

    <!-- ================= DAFTAR (kedua mode) ================= -->
    <div v-if="state.memuat" class="mt-4 rounded-xl border border-slate-300 bg-white p-8 text-center text-[13px] text-slate-500">Memuat tiket…</div>
    <div v-else-if="!tampil.length" class="mt-4 rounded-xl border border-slate-300 bg-white p-8 text-center">
      <p class="text-[14px] font-medium text-[#101828]">Tidak ada tiket pada saringan ini</p>
      <p class="mt-1 text-[13px] text-slate-500">{{ superadmin ? 'Longgarkan saringan grade, status, atau kategori.' : 'Buat tiket baru bila ada kendala yang perlu dilaporkan.' }}</p>
    </div>
    <div v-else class="mt-4 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden gap-3 border-b border-slate-300 bg-slate-100 px-4 py-2.5 lg:grid"
        :class="superadmin ? 'grid-cols-[170px_1fr_180px_180px_130px_140px]' : 'grid-cols-[170px_1fr_190px_130px_170px]'">
        <span class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">ID Tiket</span>
        <span class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Judul &amp; Kategori</span>
        <span v-if="superadmin" class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Pelapor</span>
        <span class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Progress{{ superadmin ? '' : ' Penanganan' }}</span>
        <span class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
        <span class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{{ superadmin ? 'Diperbarui' : 'Terakhir Diperbarui' }}</span>
      </div>
      <div class="divide-y divide-slate-200">
        <div v-for="t in tampil" :key="t.id" @click="emit('buka', t.id)"
          class="grid cursor-pointer grid-cols-1 gap-2 px-4 py-3.5 hover:bg-slate-50 lg:items-center lg:gap-3"
          :class="superadmin ? 'lg:grid-cols-[170px_1fr_180px_180px_130px_140px]' : 'lg:grid-cols-[170px_1fr_190px_130px_170px]'">
          <span class="whitespace-nowrap text-[12.5px] font-semibold" :style="{ color: warnaGrade(t.grade) }">{{ t.nomor }}</span>
          <span class="min-w-0">
            <span class="block truncate text-[13.5px] font-medium text-[#101828]">{{ t.judul }}</span>
            <span class="mt-0.5 block text-[12px] text-slate-500">Kategori: {{ t.kategori }}<template v-if="superadmin"> · <span class="font-medium" :style="{ color: warnaGrade(t.grade) }">Grade {{ t.grade }}</span></template></span>
          </span>
          <span v-if="superadmin" class="text-[12.5px] text-slate-600">{{ t.pelapor_nama }}<br><span class="text-slate-400">{{ t.pelapor_peran }}</span></span>
          <span class="flex items-center gap-2">
            <span class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <span class="block h-2 rounded-full" :style="{ width: Math.max(t.progress, 3) + '%', backgroundColor: t.progress >= 100 ? '#067647' : '#1B5FD9' }"></span>
            </span>
            <span class="text-[12px] font-medium text-slate-600">{{ t.progress }}%</span>
          </span>
          <span><span class="whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold" :class="kelasStatus(t.status)">{{ t.status }}</span></span>
          <span class="text-[12.5px] text-slate-500">{{ waktuRelatif(t.updated_at) }}</span>
        </div>
      </div>
    </div>
    <p class="mt-3 text-[12px] text-slate-400">
      <template v-if="superadmin">Warna ID mengikuti grade: <span class="font-semibold text-[#1B5FD9]">biru = SMK</span>, <span class="font-semibold text-[#067647]">hijau = SMP</span> — sesuai identitas jenjang Darqia. Klik baris tiket untuk membuka &amp; menanganinya.</template>
      <template v-else>Format ID: <span class="font-medium text-slate-500">TKT-[GRADE]-[TAHUN]-[NOMOR URUT]</span> — nomor urut berjalan terpisah untuk SMP dan SMK. Hanya kamu dan Superadmin yang dapat melihat tiketmu. Klik baris tiket untuk membuka detailnya.</template>
    </p>
  </div>
</template>
