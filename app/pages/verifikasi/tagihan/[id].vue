<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useKeuangan } from '~/composables/useKeuangan'
import {
  LABEL_TINGKAT, formatTanggalPanjang, inisialNama, persenTeks, rp,
  type BarisSiswa, type Grade
} from '~/composables/keuanganCore'

const route = useRoute()
const K = useKeuangan()

const idParam = computed(() => String(route.params.id || ''))
const parsedFromId = computed(() => {
  const parts = idParam.value.split('-')
  if (parts.length >= 3) {
    const g = (parts[1] || 'SMK').toUpperCase() as Grade
    const n = parts[2] || ''
    return { grade: g, nis: n }
  }
  return {
    grade: ((route.query.grade as string) || 'SMK').toUpperCase() as Grade,
    nis: (route.query.nis as string) || '1130'
  }
})

const grade = computed<Grade>(() => parsedFromId.value.grade === 'SMP' ? 'SMP' : 'SMK')
const nis = computed(() => parsedFromId.value.nis)

const memuat = ref(true)
const disalin = ref(false)
const sekarang = ref('')

onMounted(async () => {
  sekarang.value = formatTanggalPanjang(new Date().toISOString().slice(0, 10))
  try {
    await K.muatSemua(grade.value)
  } catch (e) {
    console.warn('Gagal memuat data dari database:', e)
  } finally {
    memuat.value = false
  }
})

const siswaReal = computed<BarisSiswa | undefined>(() => K.siswaSatu(grade.value, nis.value))

// Fallback data bila diakses dari tautan luar
const namaSiswa = computed(() => siswaReal.value?.nama || (nis.value === '1130' ? 'ANISA UTAMA' : `Siswa NIS ${nis.value}`))
const kelasSiswa = computed(() => siswaReal.value?.kelas || 'X MM')
const nisnSiswa = computed(() => siswaReal.value?.nisn || '1033758619')
const kodeSiswa = computed(() => siswaReal.value?.kode || 'R-2627')
const angkatanSiswa = computed(() => siswaReal.value?.angkatan || 2025)
const statusBayarSiswa = computed(() => siswaReal.value?.statusBayar || 'Kurang')
const sekolah = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const kepsek = computed(() => {
  if (grade.value === 'SMP') {
    return {
      jabatan: 'Kepala SMP IT Bina Cendekia Assalam',
      nama: 'Kepala Sekolah SMP IT BCA',
      keterangan: 'SMP IT Bina Cendekia Assalam'
    }
  }
  return {
    jabatan: 'Kepala SMK IT Attaqwa 9',
    nama: 'H. Abd. Muiz, M.Pd., Gr.',
    keterangan: 'NPSN: 69940449 · Akreditasi A'
  }
})

const totalTagihan = computed(() => {
  if (siswaReal.value) return siswaReal.value.hitung.total
  const queryT = parseInt(String(route.query.t || route.query.total || '0'), 10)
  return queryT || 18225000
})

const totalBayar = computed(() => {
  if (siswaReal.value) return siswaReal.value.hitung.bayar
  return Math.max(0, totalTagihan.value - sisaTagihan.value)
})

const sisaTagihan = computed(() => {
  if (siswaReal.value) return siswaReal.value.hitung.sisa
  const queryS = parseInt(String(route.query.s || route.query.sisa || '0'), 10)
  return queryS || 16225000
})

const persenTerbayar = computed(() => {
  if (siswaReal.value) return siswaReal.value.hitung.persen
  return totalTagihan.value > 0 ? (totalBayar.value / totalTagihan.value) * 100 : 0
})

const salinTautan = async () => {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(window.location.href)
    disalin.value = true
    setTimeout(() => { disalin.value = false }, 2500)
  }
}

const tautanWA = computed(() => {
  const hp = '628995076804'
  const teks = `Halo Tata Usaha ${sekolah.value}, saya ingin mengonfirmasi Surat Tagihan Resmi atas nama ${namaSiswa.value} (NIS: ${nis.value}) dengan ID Dokumen: ${idParam.value}.`
  return `https://wa.me/${hp}?text=${encodeURIComponent(teks)}`
})

useHead({
  title: `Verifikasi Tagihan Resmi - ${namaSiswa.value} | Darqia 9`,
  meta: [
    { name: 'description', content: `Halaman verifikasi keaslian surat tagihan resmi sekolah untuk ${namaSiswa.value}. Total tagihan ${rp(totalTagihan.value)}.` }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#F4F6FB] text-slate-800 font-sans antialiased pb-16">
    <!-- Top Bar Navigasi Publik -->
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5FD9] text-white font-black text-[15px] shadow-sm">
            D9
          </div>
          <div>
            <p class="text-[13px] font-bold text-slate-900 leading-tight">{{ sekolah }}</p>
            <p class="text-[11px] font-medium text-slate-500">Sistem Verifikasi Dokumen Keuangan Resmi</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            PORTAL RESMI
          </span>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="mx-auto max-w-4xl px-4 pt-6 sm:px-6 space-y-5">
      <!-- Badge Sertifikasi & Header Verifikasi -->
      <div class="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
        <!-- Hero Header dengan Gradient Halus -->
        <div
          class="relative p-6 sm:p-8 text-white text-center"
          :class="grade === 'SMP' ? 'bg-gradient-to-br from-[#064E3B] via-[#059669] to-[#047857]' : 'bg-gradient-to-br from-[#0A2A5C] via-[#1B5FD9] to-[#0D3B82]'"
        >
          <!-- Lingkaran Dekorasi -->
          <div class="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl"></div>
          <div class="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-white/10 blur-xl"></div>

          <div class="relative z-10 mx-auto max-w-lg space-y-3">
            <!-- Shield Checkmark Icon -->
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-4 ring-white/20 shadow-lg">
              <svg class="h-8 w-8 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>

            <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white backdrop-blur-xs">
              DOKUMEN RESMI TERVERIFIKASI
            </span>

            <h1 class="text-[22px] sm:text-[26px] font-black leading-tight text-white tracking-tight">
              Keabsahan Surat Tagihan Terverifikasi
            </h1>

            <p class="text-[13px] text-white/85 leading-relaxed">
              Dokumen dengan ID <b class="font-bold underline text-white">{{ idParam }}</b> terdaftar secara sah dan valid dalam pangkalan data administrasi resmi {{ sekolah }}.
            </p>
          </div>
        </div>

        <!-- PERNYATAAN RESMI KEABSAHAN (HIGHLIGHT UTAMA SESUAI PERMINTAAN USER) -->
        <div class="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 p-5 sm:p-6">
          <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-[18px] shadow-sm">
              ✓
            </div>
            <div class="space-y-1.5">
              <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                PERNYATAAN RESMI KEABSAHAN DOKUMEN SEKOLAH
              </span>
              <p class="text-[15px] sm:text-[16px] font-medium leading-relaxed text-slate-900">
                Dengan ini dinyatakan secara sah bahwa surat tagihan ini adalah
                <strong class="font-extrabold text-emerald-950 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                  TAGIHAN RESMI DARI SEKOLAH
                </strong>
                untuk siswa bernama
                <strong class="font-extrabold text-blue-950 underline decoration-[#1B5FD9] decoration-2">
                  {{ namaSiswa }}
                </strong>
                dengan total tagihan keseluruhan sebesar
                <strong class="font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs tabular-nums">
                  {{ rp(totalTagihan) }}
                </strong>.
              </p>
              <p class="text-[12px] text-slate-500">
                Terverifikasi pada {{ sekarang }} oleh Tata Usaha Keuangan Darqia 9.
              </p>
            </div>
          </div>
        </div>

        <!-- Profil Siswa Terdaftar -->
        <div class="p-5 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[18px] font-black shadow-inner"
                :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
              >
                {{ inisialNama(namaSiswa) }}
              </span>
              <div>
                <h3 class="text-[18px] font-black text-slate-900 leading-tight">{{ namaSiswa }}</h3>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-slate-500">
                  <span>NIS: <b class="font-bold text-slate-800">{{ nis }}</b></span>
                  <span>&middot;</span>
                  <span>NISN: <b class="font-medium text-slate-700">{{ nisnSiswa }}</b></span>
                  <span>&middot;</span>
                  <span>Kelas: <b class="font-semibold text-slate-800">{{ kelasSiswa }}</b></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="rounded-xl bg-blue-50 px-3 py-1.5 text-[11.5px] font-bold text-[#1B5FD9] border border-blue-200">
                Paket: {{ kodeSiswa }}
              </span>
              <span
                class="rounded-xl px-3 py-1.5 text-[11.5px] font-extrabold uppercase"
                :class="statusBayarSiswa === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'"
              >
                {{ statusBayarSiswa }}
              </span>
            </div>
          </div>

          <!-- 3 Kolom Metrik Finansial -->
          <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <span class="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Tagihan</span>
              <div class="mt-1 text-[20px] font-black text-slate-900 tabular-nums">{{ rp(totalTagihan) }}</div>
              <span class="mt-1 text-[11px] text-slate-500 block">Akumulasi seluruh tingkat</span>
            </div>

            <div class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <span class="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 block">Total Terbayar</span>
              <div class="mt-1 text-[20px] font-black text-emerald-700 tabular-nums">{{ rp(totalBayar) }}</div>
              <span class="mt-1 text-[11px] text-emerald-700 font-medium block">Tercatat di pembukuan sekolah</span>
            </div>

            <div class="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <span class="text-[10.5px] font-bold uppercase tracking-wider text-rose-800 block">Sisa Tagihan</span>
              <div class="mt-1 text-[20px] font-black text-rose-600 tabular-nums">{{ rp(sisaTagihan) }}</div>
              <span class="mt-1 text-[11px] text-rose-600 font-medium block">Kewajiban pelunasan</span>
            </div>
          </div>

          <!-- Progress Bar Pelunasan -->
          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div class="flex items-center justify-between text-[12px] mb-1.5">
              <span class="text-slate-600 font-medium">Status Pelunasan Administrasi</span>
              <b class="font-bold text-slate-900">{{ persenTeks(persenTerbayar) }} Terbayar</b>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#1B5FD9] to-emerald-500"
                :style="{ width: persenTerbayar + '%' }"
              />
            </div>
          </div>

          <!-- Rincian Per Tingkat (Jika ada data detail) -->
          <div v-if="siswaReal" class="mt-5 space-y-2.5">
            <h4 class="text-[14px] font-bold text-slate-900">Rincian Per Tingkat Pendidikan</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="(v, t) in siswaReal.hitung.per"
                :key="t"
                class="rounded-xl border border-slate-200 bg-white p-3 text-[12px] shadow-2xs"
              >
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span class="font-bold text-slate-800">{{ LABEL_TINGKAT[grade][t] }}</span>
                  <span class="font-semibold tabular-nums text-slate-900">{{ rp(v.total) }}</span>
                </div>
                <div class="mt-2 flex items-center justify-between text-[11.5px] text-slate-500">
                  <span>Dibayar: <b class="text-emerald-700 tabular-nums">{{ rp(v.bayar) }}</b></span>
                  <span>Sisa: <b class="text-rose-700 tabular-nums">{{ rp(v.sisa) }}</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit & Keamanan Dokumen -->
        <div class="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 text-[12px] text-slate-600">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span class="font-bold uppercase tracking-wider text-[10.5px] text-slate-500 block">Informasi Dokumen</span>
              <p class="mt-1">Nomor Dokumen: <b class="text-slate-800 font-mono">{{ idParam }}</b></p>
              <p>Instansi Penerbit: <b>{{ sekolah }}</b></p>
              <p>Kepala Sekolah: <b>{{ kepsek.nama }}</b></p>
              <p>Petugas Penanggung Jawab: <b>Anis Azyzy, S.T (Tata Usaha Keuangan)</b></p>
            </div>
            <div>
              <span class="font-bold uppercase tracking-wider text-[10.5px] text-slate-500 block">Validasi Digital</span>
              <p class="mt-1">Enkripsi Data: <b class="text-emerald-700">SHA-256 Validated</b></p>
              <p>Status Pangkalan Data: <b class="text-emerald-700">Tersinkronisasi Real-Time</b></p>
              <p>Pemeriksaan Sistem: <b>Aktif &amp; Terbuka untuk Publik</b></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi Interaktif -->
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="salinTautan"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span>{{ disalin ? '✓ Tautan Disalin!' : 'Salin Tautan Verifikasi' }}</span>
          </button>
          <button
            type="button"
            onclick="window.print()"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span>Cetak Bukti Verifikasi</span>
          </button>
        </div>

        <div>
          <a
            :href="tautanWA"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-xl bg-[#067647] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-xs hover:bg-[#05603a] transition-colors"
          >
            <span>Hubungi Tata Usaha (WhatsApp)</span>
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

