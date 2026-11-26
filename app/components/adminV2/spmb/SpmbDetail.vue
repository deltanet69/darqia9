<script setup lang="ts">
import { computed } from 'vue'
import { SPMB_BIAYA, SPMB_DOKUMEN_LABEL, SPMB_DOKUMEN_URUTAN, fmtTanggalPanjang, fmtWaktuSpmb, samarNik, type SpmbAdminRecord, type SpmbStatus } from '~/composables/useSpmbAdmin'

const props = defineProps<{ record: SpmbAdminRecord }>()
const emit = defineEmits<{
  kembali: []
  status: [id: string, status: SpmbStatus]
  hapus: [id: string]
  ubah: [id: string]
  wa: [id: string]
}>()

const x = computed(() => props.record)

const titikStatus: Record<string, string> = {
  'Menunggu verifikasi': 'bg-amber-300',
  'Pembayaran terverifikasi': 'bg-sky-300',
  'Diterima': 'bg-emerald-300',
  'Ditolak': 'bg-red-300'
}
const inisial = computed(() => {
  const kata = (x.value.s_nama || '?').trim().split(/\s+/).slice(0, 2)
  return kata.map((k) => k[0]?.toUpperCase() || '').join('') || '?'
})
const langkahAktif = computed(() => {
  if (x.value.status === 'Menunggu verifikasi') return 0
  if (x.value.status === 'Pembayaran terverifikasi') return 1
  return 2
})
const langkah = computed(() => [
  { label: 'Menunggu verifikasi' },
  { label: 'Pembayaran terverifikasi' },
  { label: x.value.status === 'Ditolak' ? 'Ditolak' : 'Keputusan' }
])
const keadaanLangkah = (i: number): 'selesai' | 'aktif' | 'nanti' | 'tolak' => {
  if (x.value.status === 'Ditolak' && i === 2) return 'tolak'
  if (x.value.status === 'Diterima' && i === 2) return 'selesai'
  if (i < langkahAktif.value) return 'selesai'
  if (i === langkahAktif.value) return 'aktif'
  return 'nanti'
}
const dokumenSaya = computed(() => x.value.dokumen || {})
const waHref = computed(() => `https://wa.me/62${(x.value.o_hp || '').replace(/\D/g, '').replace(/^0/, '')}`)
// Bukti & dokumen tampil lewat endpoint staf (bucket privat, URL bertanda tangan).
const urlBukti = (path: string, unduh = false) => `/api/admin/spmb/bukti?path=${encodeURIComponent(path)}${unduh ? '&unduh=1' : ''}`
</script>

<template>
  <div class="space-y-5">
    <button type="button" class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-2 pl-3 pr-4 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-[#175CD3]" @click="emit('kembali')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      Kembali ke daftar pendaftar
    </button>

    <!-- HERO -->
    <div class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#081C3F] via-[#0A2A5C] to-[#1B5FD9] px-6 py-6 text-white shadow-[0_24px_48px_-16px_rgba(10,42,92,0.45)] sm:px-8 sm:py-7">
      <div class="pointer-events-none absolute inset-0 opacity-[0.05]" style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 22px 22px" />
      <div class="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#38BDF8]/20 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[#1B5FD9]/50 blur-3xl" />

      <div class="relative flex flex-wrap items-start gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-black tracking-wide ring-1 ring-white/25 backdrop-blur">
          {{ inisial }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="text-2xl font-black leading-none tracking-tight sm:text-[28px]">{{ x.s_nama }}</h2>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
              <span class="h-1.5 w-1.5 rounded-full" :class="titikStatus[x.status]" />
              {{ x.status }}
            </span>
            <span v-if="x.via === 'Manual'" class="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-blue-100">Manual</span>
          </div>
          <p class="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-blue-100/85">
            <span class="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-white ring-1 ring-white/15">{{ x.id }}</span>
            <span>{{ x.jenjang }}</span>
            <span v-if="x.jurusan" class="text-blue-100/50">·</span>
            <span v-if="x.jurusan">{{ x.jurusan }}</span>
            <span class="text-blue-100/50">·</span>
            <span>Daftar {{ fmtWaktuSpmb(x.waktu) }}</span>
            <template v-if="x.kelas">
              <span class="text-blue-100/50">·</span>
              <span>Kelas {{ x.kelas }} · NIS {{ x.nis }}</span>
            </template>
          </p>
          <p class="mt-1 text-[13px] text-blue-100/60">
            <template v-if="x.via === 'Manual'">Pendaftaran manual — diinput {{ x.oleh || 'Admin TU' }} untuk wali yang datang langsung ke sekolah.</template>
            <template v-else>Pendaftaran online — data sesuai input orang tua/wali di formulir, tidak diubah admin.</template>
          </p>
        </div>
      </div>

      <!-- Stepper -->
      <div class="relative mt-7 flex items-start border-t border-white/10 pt-6">
        <template v-for="(l, i) in langkah" :key="l.label">
          <div v-if="i > 0" class="mx-3 mt-4 h-0.5 min-w-4 flex-1 rounded-full" :class="keadaanLangkah(i) === 'nanti' ? 'bg-white/15' : 'bg-white/60'" />
          <div class="flex flex-col items-center gap-2 text-center">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition"
              :class="{
                'bg-white text-[#0A2A5C]': keadaanLangkah(i) === 'selesai',
                'bg-white/15 text-white ring-2 ring-white/80': keadaanLangkah(i) === 'aktif',
                'bg-red-400 text-white': keadaanLangkah(i) === 'tolak',
                'bg-white/10 text-blue-100/50': keadaanLangkah(i) === 'nanti'
              }"
            >
              <svg v-if="keadaanLangkah(i) === 'selesai'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <svg v-else-if="keadaanLangkah(i) === 'tolak'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span class="hidden max-w-28 text-[11px] font-semibold leading-tight sm:block" :class="keadaanLangkah(i) === 'nanti' ? 'text-blue-100/45' : 'text-blue-50'">{{ l.label }}</span>
          </div>
        </template>
      </div>
    </div>

    <div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
      <div class="space-y-5">
        <!-- DATA SISWA -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>
            </span>
            <h3 class="text-[15px] font-bold text-slate-900">Data Siswa</h3>
          </div>
          <dl class="grid gap-x-8 gap-y-5 p-6 text-sm sm:grid-cols-2">
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Nama lengkap siswa</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.s_nama }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">NISN</dt><dd class="mt-1 font-mono text-sm font-semibold text-slate-800">{{ x.s_nisn }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Jenis kelamin</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.s_jk }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tempat lahir</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.s_tempat || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tanggal lahir</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ fmtTanggalPanjang(x.s_tgl) }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">No. HP siswa</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.s_hp || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Email aktif siswa</dt><dd class="mt-1 break-words text-[15px] font-semibold text-slate-800">{{ x.s_email || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Nama sekolah asal</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.s_sekolah }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Alamat sekolah asal</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.s_alsekolah }}</dd></div>
            <div v-if="x.jurusan"><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Pilihan jurusan</dt><dd class="mt-1"><span class="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[13px] font-bold text-blue-700 ring-1 ring-blue-100">{{ x.jurusan }}</span></dd></div>
          </dl>
        </section>

        <!-- ORANG TUA -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </span>
            <h3 class="text-[15px] font-bold text-slate-900">Informasi Orang Tua</h3>
          </div>
          <dl class="grid gap-x-8 gap-y-5 p-6 text-sm sm:grid-cols-2">
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Nama lengkap wali</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.o_nama }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Hubungan dengan siswa</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.o_hub }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">NIK</dt><dd class="mt-1 font-mono text-sm font-semibold text-slate-800">{{ samarNik(x.o_nik) }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">No. HP/WA wali</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.o_hp }}</dd></div>
            <div>
              <dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Email aktif wali</dt>
              <dd class="mt-1 break-words text-[15px] font-semibold text-slate-800">{{ x.o_email || '-' }}</dd>
              <p class="mt-0.5 text-xs text-slate-400">Dipakai untuk seluruh notifikasi proses SPMB.</p>
            </div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tempat lahir wali</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.o_tempat || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tanggal lahir wali</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ fmtTanggalPanjang(x.o_tgl) }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Alamat tinggal wali</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.o_alamat }}</dd></div>
          </dl>
          <div class="flex flex-wrap gap-2.5 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <a :href="waHref" target="_blank" rel="noopener" class="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#027A48] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01653D]">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              Hubungi via WhatsApp
            </a>
            <a v-if="x.o_email && x.o_email !== '-'" :href="`mailto:${x.o_email}`" class="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              Kirim Email
            </a>
          </div>
        </section>

        <!-- ORANG TUA KANDUNG -->
        <section v-if="x.ot_nama || x.ot_nik || x.ot_hp || x.ot_alamat" class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </span>
            <h3 class="text-[15px] font-bold text-slate-900">Informasi Orang Tua Kandung</h3>
            <span class="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">OPSIONAL</span>
          </div>
          <dl class="grid gap-x-8 gap-y-5 p-6 text-sm sm:grid-cols-2">
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Nama lengkap orang tua</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.ot_nama || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Hubungan dengan siswa</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.ot_hub || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">NIK</dt><dd class="mt-1 font-mono text-sm font-semibold text-slate-800">{{ samarNik(x.ot_nik) }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">No. HP/WA orang tua</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.ot_hp || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Email aktif orang tua</dt><dd class="mt-1 break-words text-[15px] font-semibold text-slate-800">{{ x.ot_email || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tempat lahir orang tua</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.ot_tempat || '-' }}</dd></div>
            <div><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tanggal lahir orang tua</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ fmtTanggalPanjang(x.ot_tgl) }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Alamat tinggal orang tua</dt><dd class="mt-1 text-[15px] font-semibold text-slate-800">{{ x.ot_alamat || '-' }}</dd></div>
          </dl>
        </section>
      </div>

      <div class="space-y-5 xl:sticky xl:top-6">
        <!-- PEMBAYARAN -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
            </span>
            <h3 class="flex-1 text-[15px] font-bold text-slate-900">Pembayaran Formulir</h3>
            <span class="text-base font-black tracking-tight text-slate-900">{{ SPMB_BIAYA }}</span>
          </div>
          <div class="space-y-3 p-6 text-sm">
            <div class="flex items-center justify-between"><span class="text-slate-400">Metode</span><span class="font-semibold text-slate-700">{{ x.metode || '-' }}</span></div>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Bukti pembayaran</span>
              <template v-if="x.bukti_path">
                <a :href="urlBukti(x.bukti_path)" target="_blank" rel="noopener" class="group relative mt-2 block overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200">
                  <img :src="urlBukti(x.bukti_path)" :alt="x.bukti" class="max-h-72 w-full object-contain transition duration-300 group-hover:scale-[1.015]" loading="lazy">
                </a>
                <div class="mt-2.5 flex items-center gap-2">
                  <span class="min-w-0 flex-1 truncate font-mono text-xs text-slate-400">{{ x.bukti }}</span>
                  <a :href="urlBukti(x.bukti_path)" target="_blank" rel="noopener" class="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">Buka penuh</a>
                  <a :href="urlBukti(x.bukti_path, true)" class="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-400 hover:text-slate-800">Unduh</a>
                </div>
              </template>
              <p v-else-if="x.via === 'Manual'" class="mt-1.5 font-medium text-slate-500">Dibayar tunai di sekolah — kwitansi diterbitkan panitia.</p>
              <p v-else class="mt-1.5 font-medium text-slate-500">Tidak ada berkas bukti terlampir pada pendaftaran ini.</p>
            </div>
            <p class="flex gap-1.5 text-xs leading-relaxed text-slate-400">
              <svg class="mt-px h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              Cocokkan bukti dengan mutasi rekening sekolah sebelum verifikasi.
            </p>
          </div>
        </section>

        <!-- DOKUMEN -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            </span>
            <h3 class="text-[15px] font-bold text-slate-900">Dokumen Pendukung</h3>
          </div>
          <div class="space-y-4 p-6 text-sm">
            <template v-if="x.via !== 'Manual'">
              <div v-for="kunci in SPMB_DOKUMEN_URUTAN" :key="kunci">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[13px] font-semibold text-slate-600">{{ SPMB_DOKUMEN_LABEL[kunci] }}</span>
                  <span v-if="dokumenSaya[kunci]" class="flex shrink-0 items-center gap-2 text-xs font-bold">
                    <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-600 ring-1 ring-emerald-100">Terunggah</span>
                    <a :href="urlBukti(dokumenSaya[kunci])" target="_blank" rel="noopener" class="text-[#175CD3] hover:underline">Buka</a>
                    <a :href="urlBukti(dokumenSaya[kunci], true)" class="text-[#175CD3] hover:underline">Unduh</a>
                  </span>
                  <span v-else class="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600 ring-1 ring-amber-100">Belum diunggah</span>
                </div>
                <a v-if="dokumenSaya[kunci] && /\.(jpe?g|png|webp)$/i.test(dokumenSaya[kunci])" :href="urlBukti(dokumenSaya[kunci])" target="_blank" rel="noopener" class="mt-2 block overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                  <img :src="urlBukti(dokumenSaya[kunci])" :alt="SPMB_DOKUMEN_LABEL[kunci]" class="max-h-44 w-full object-contain" loading="lazy">
                </a>
              </div>
              <p class="text-xs leading-relaxed text-slate-400">Dokumen diunggah orang tua saat pendaftaran, tersimpan terkompresi di penyimpanan privat sekolah.</p>
            </template>
            <p v-else class="font-medium text-slate-500">Pendaftaran manual — dokumen fisik diserahkan langsung ke panitia.</p>
          </div>
        </section>

        <!-- TINDAKAN -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </span>
            <h3 class="text-[15px] font-bold text-slate-900">Tindakan Panitia</h3>
          </div>
          <div class="space-y-2.5 p-6">
            <button v-if="x.status === 'Menunggu verifikasi'" type="button" class="min-h-11 w-full rounded-xl bg-gradient-to-r from-[#1B5FD9] to-[#175CD3] text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.99]" @click="emit('status', x.id, 'Pembayaran terverifikasi')">Verifikasi Pembayaran</button>
            <template v-if="x.status === 'Pembayaran terverifikasi'">
              <button type="button" class="min-h-11 w-full rounded-xl bg-gradient-to-r from-[#079455] to-[#027A48] text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.99]" @click="emit('status', x.id, 'Diterima')">Terima Pendaftaran</button>
              <button type="button" class="min-h-11 w-full rounded-xl border border-red-200 bg-red-50/60 text-sm font-bold text-[#B42318] transition hover:bg-red-50 active:scale-[0.99]" @click="emit('status', x.id, 'Ditolak')">Tolak Pendaftaran</button>
            </template>
            <p v-if="x.status === 'Diterima'" class="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
              <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              Pendaftaran diterima. Penempatan kelas dilakukan di tab Penempatan Kelas.
            </p>
            <p v-if="x.status === 'Ditolak'" class="flex gap-2.5 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
              <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              Pendaftaran ditolak.
            </p>
            <button type="button" class="min-h-11 w-full rounded-xl bg-gradient-to-r from-[#079455] to-[#027A48] text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.99]" @click="emit('wa', x.id)">Kirim Notifikasi WA ke Wali</button>
            <p class="text-xs leading-relaxed text-slate-400">Mengirim status terakhir ({{ x.status }}) ke nomor WA wali {{ x.o_hp }} melalui nomor WhatsApp sekolah. Setiap perubahan status di atas juga mengirim notifikasi ini otomatis.</p>
            <button v-if="x.via === 'Manual'" type="button" class="min-h-11 w-full rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 active:scale-[0.99]" @click="emit('ubah', x.id)">Ubah Data</button>
            <button type="button" class="min-h-11 w-full rounded-xl text-sm font-semibold text-[#B42318] transition hover:bg-red-50 active:scale-[0.99]" @click="emit('hapus', x.id)">Hapus (soft delete)</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
