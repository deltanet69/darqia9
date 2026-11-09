<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { LABEL_TINGKAT, rp, totalPaket, type PaketKeuangan } from '~/composables/keuanganCore'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import KeuanganImportModal from '~/components/adminV2/keuangan/KeuanganImportModal.vue'

const grade = useAdminGrade()
const K = useKeuangan()
const notif = ref('')
const modal = ref<null | { kode: string, nama: string, n: [string, string, string, string], aktif: boolean, lama: string }>(null)
const ketBaru = ref('')
const imporBuka = ref(false)

const barisSiswa = computed(() => K.barisSiswa(grade.value))
const paketGrade = computed(() => K.state.value.paket.filter(p => p.grade === grade.value))
const pemakai = (kode: string) => K.state.value.penetapan.filter(p => p.kode === kode && p.grade === grade.value).length
const totalPemakai = computed(() => K.state.value.penetapan.filter(p => p.grade === grade.value).length)
const paketAktifCount = computed(() => paketGrade.value.filter(p => p.aktif).length)

const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3200) }

const bukaModal = (p?: PaketKeuangan) => {
  modal.value = p
    ? { kode: p.kode, nama: p.nama, n: [String(p.nominal[0]), String(p.nominal[1]), String(p.nominal[2]), String(p.nominal[3])], aktif: p.aktif, lama: p.kode }
    : { kode: '', nama: '', n: ['', '', '', ''], aktif: true, lama: '' }
}
const angka = (v: string) => Math.max(0, parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0)
const simpan = async () => {
  if (!modal.value || !modal.value.kode.trim() || !modal.value.nama.trim()) return
  const p: PaketKeuangan = { kode: modal.value.kode.trim(), nama: modal.value.nama.trim(), grade: grade.value, nominal: [angka(modal.value.n[0]), angka(modal.value.n[1]), angka(modal.value.n[2]), angka(modal.value.n[3])], aktif: modal.value.aktif }
  await K.simpanPaket(p, modal.value.lama || undefined)
  tampilNotif(modal.value.lama ? `Paket ${p.kode} diperbarui — Nominal Master semua siswa pemakai kode ini ikut terhitung ulang.` : `Paket ${p.kode} dibuat. Pasang ke siswa lewat tab Data Keuangan.`)
  modal.value = null
}
const hapus = async (p: PaketKeuangan) => {
  const hasil = await K.hapusPaket(p.kode)
  tampilNotif(hasil === 'nonaktif' ? `Paket ${p.kode} sedang dipakai ${pemakai(p.kode)} siswa — tidak dihapus, hanya dinonaktifkan agar riwayat tetap terbaca.` : `Paket ${p.kode} dihapus.`)
}
const tambahKet = async () => {
  const nama = ketBaru.value.trim()
  if (!nama) return
  await K.tambahKeterangan(nama)
  ketBaru.value = ''
  tampilNotif(`Keterangan "${nama}" ditambahkan.`)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Floating Toast Notification -->
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl animate-fade-in">
      {{ notif }}
    </div>

    <!-- 4 KARTU KPI EXECUTIVE KHUSUS KODE KEUANGAN (SESUAI CARD STYLING OVERVIEW) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- KPI 1: Total Paket Terdaftar (HERO BLUE GRADIENT) -->
      <section
        class="rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(27,95,217,0.3)] flex flex-col justify-between text-white transition-all min-h-[155px] relative overflow-hidden"
        :class="grade === 'SMP'
          ? 'bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D]'
          : 'bg-gradient-to-br from-[#1B5FD9] via-[#1651bd] to-[#0A2A5C]'"
      >
        <div class="absolute -right-5 -bottom-5 w-28 h-28 opacity-10 pointer-events-none text-white">
          <AdminV2Icon name="shield" :size="112" />
        </div>

        <div class="relative z-10">
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-white/80">
              Total Paket Biaya {{ grade }}
            </span>
            <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <AdminV2Icon name="layers" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-white mt-1.5 tabular-nums">
            {{ paketGrade.length }} Paket
          </div>
        </div>

        <div class="relative z-10 pt-2 border-t border-white/15 mt-3 flex items-center justify-between text-xs text-white/80">
          <span class="font-medium">Tahun Masuk &amp; Kategori</span>
          <span class="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">Tarif Flat</span>
        </div>
      </section>

      <!-- KPI 2: Paket Aktif Digunakan (WHITE CARD WITH EMERALD ACCENT) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Paket Aktif
            </span>
            <span class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A] shrink-0">
              <AdminV2Icon name="check" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-emerald-700 mt-1.5 tabular-nums">
            {{ paketAktifCount }} Paket
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Status ketersediaan:</span>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
            <AdminV2Icon name="check" :size="11" />
            <span>Siap Dipasang</span>
          </span>
        </div>
      </section>

      <!-- KPI 3: Siswa Terpasang Paket (WHITE CARD WITH BLUE ACCENT) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Siswa Terpasang
            </span>
            <span class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B5FD9] shrink-0">
              <AdminV2Icon name="users" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-[#1B5FD9] mt-1.5 tabular-nums">
            {{ totalPemakai }} Siswa
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Dari {{ barisSiswa.length }} siswa {{ grade }}</span>
          <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-blue-700 bg-blue-50">
            {{ barisSiswa.length ? Math.round((totalPemakai / barisSiswa.length) * 100) : 0 }}% tercover
          </span>
        </div>
      </section>

      <!-- KPI 4: Pos Keterangan Pembayaran (WHITE CARD WITH AMBER ACCENT) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pos Keterangan Bayar
            </span>
            <span class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
              <AdminV2Icon name="file-text" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-amber-800 mt-1.5 tabular-nums">
            {{ K.state.value.keterangan.length }} Pos
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Jenis tagihan kasir:</span>
          <span class="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
            SPP, DSP, dll
          </span>
        </div>
      </section>
    </div>

    <!-- Header Section Tabel & Tombol Tambah Paket -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      <div>
        <h3 class="text-[17px] font-bold text-slate-900 tracking-tight">Daftar Master Kode Keuangan</h3>
        <p class="mt-0.5 text-[12.5px] text-slate-500 max-w-2xl leading-relaxed">
          Kode penentu nominal flat per tingkat berdasarkan <b>tahun masuk &amp; kategori siswa</b>. Satu kode dipakai bersama oleh banyak siswa.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="imporBuka = true"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <span>Impor / Ekspor Excel</span>
        </button>
        <button
          type="button"
          @click="bukaModal()"
          class="inline-flex items-center gap-2 rounded-xl bg-[#1B5FD9] px-4.5 py-2.5 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(27,95,217,0.25)] hover:bg-[#154cb0] transition-all cursor-pointer"
        >
          <AdminV2Icon name="plus" :size="15" />
          <span>Tambah Paket</span>
        </button>
      </div>
    </div>

    <!-- DAFTAR PAKET KEUANGAN (EXECUTIVE CARD CONTAINER) -->
    <div class="overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <!-- Desktop Table (>= lg) -->
      <div class="hidden lg:block">
        <table class="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr class="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th class="py-3.5 px-4">Kode Paket</th>
              <th class="py-3.5 px-4">Nama Paket</th>
              <th class="py-3.5 px-4">{{ LABEL_TINGKAT[grade][0] }}</th>
              <th class="py-3.5 px-4">{{ LABEL_TINGKAT[grade][1] }}</th>
              <th class="py-3.5 px-4">{{ LABEL_TINGKAT[grade][2] }}</th>
              <th class="py-3.5 px-4">Tingkat Akhir</th>
              <th class="py-3.5 px-4">Total Biaya</th>
              <th class="py-3.5 px-4 text-center">Siswa Pemakai</th>
              <th class="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in paketGrade" :key="p.kode" class="hover:bg-blue-50/40 transition-colors group">
              <td class="py-4 px-4 whitespace-nowrap">
                <span class="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[12.5px] font-black text-[#1B5FD9] border border-blue-200/80 shadow-2xs group-hover:border-[#1B5FD9]">
                  {{ p.kode }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-[13.5px]">{{ p.nama }}</span>
                  <span v-if="!p.aktif" class="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-500">Nonaktif</span>
                </div>
              </td>
              <td v-for="(n, i) in p.nominal" :key="i" class="py-4 px-4 tabular-nums text-slate-700 whitespace-nowrap font-medium">
                {{ n > 0 ? rp(n) : '—' }}
              </td>
              <td class="py-4 px-4 tabular-nums font-black text-slate-900 whitespace-nowrap text-[14px]">
                {{ rp(totalPaket(p)) }}
              </td>
              <td class="py-4 px-4 text-center whitespace-nowrap">
                <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  {{ pemakai(p.kode) }} siswa
                </span>
              </td>
              <td class="py-4 px-4 text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="bukaModal(p)"
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    @click="hapus(p)"
                    class="rounded-lg border border-red-200 bg-white px-3 py-1 text-[12px] font-bold text-[#B42318] hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards (< lg: ZERO HORIZONTAL SCROLL) -->
      <div class="block lg:hidden divide-y divide-slate-100">
        <div v-for="p in paketGrade" :key="p.kode" class="p-5 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded-lg bg-blue-50 px-2.5 py-1 text-[12.5px] font-black text-[#1B5FD9] border border-blue-200">
                  {{ p.kode }}
                </span>
                <span v-if="!p.aktif" class="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-500">
                  Nonaktif
                </span>
              </div>
              <h4 class="text-[15px] font-bold text-slate-900 mt-2">{{ p.nama }}</h4>
            </div>

            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 shrink-0">
              {{ pemakai(p.kode) }} siswa
            </span>
          </div>

          <!-- Grid 4 Tingkat -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[12px]">
            <div v-for="(n, i) in p.nominal" :key="i" class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block">
                {{ i === 3 ? 'Tk. Akhir' : LABEL_TINGKAT[grade][i] }}
              </span>
              <span class="font-bold text-slate-800 tabular-nums block mt-0.5">
                {{ n > 0 ? rp(n) : '—' }}
              </span>
            </div>
          </div>

          <!-- Total & Aksi -->
          <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[12px]">
            <div>
              <span class="text-slate-500 text-[11px] block">Total Paket:</span>
              <span class="font-black text-slate-900 tabular-nums text-[14px]">{{ rp(totalPaket(p)) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" @click="bukaModal(p)" class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Ubah</button>
              <button type="button" @click="hapus(p)" class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11.5px] font-bold text-[#B42318] hover:bg-red-50 cursor-pointer">Hapus</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!paketGrade.length" class="px-4 py-10 text-center">
        <b class="text-[14px] text-slate-700">Belum ada Kode Keuangan {{ grade }}</b>
        <p class="mt-1 text-[12.5px] text-slate-500">Buat paket pertama lewat tombol Tambah Paket di kanan atas.</p>
      </div>
    </div>

    <!-- Master Keterangan Pembayaran & Aturan Kode Keuangan (2 Kolom Executive Card Styling) -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- Master Keterangan -->
      <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
        <div class="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h4 class="text-[15px] font-bold text-slate-900">Master Keterangan Pembayaran</h4>
            <p class="mt-0.5 text-[12px] text-slate-500">
              Jenis pembayaran di formulir kasir. Nama di invoice dibentuk otomatis bersama tingkat yang dipilih, cth: SPP - Kelas X.
            </p>
          </div>
          <span class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B5FD9] shrink-0">
            <AdminV2Icon name="file-text" :size="16" />
          </span>
        </div>

        <div class="divide-y divide-slate-100 mt-2">
          <div v-for="(k, i) in K.state.value.keterangan" :key="k" class="flex items-center justify-between gap-3 py-2.5">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500">
                {{ i + 1 }}
              </span>
              <span class="text-[13px] font-semibold text-slate-800 truncate">{{ k }}</span>
            </div>
            <button
              type="button"
              @click="K.hapusKeterangan(k)"
              class="text-[12px] font-semibold text-[#B42318] hover:underline shrink-0 cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <input
            v-model="ketBaru"
            placeholder="Ketik nama keterangan baru..."
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-[12.5px] text-slate-800 focus:border-[#1B5FD9] focus:outline-none"
          >
          <button
            type="button"
            @click="tambahKet"
            class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-[#154cb0] transition-colors shrink-0 cursor-pointer"
          >
            + Tambah
          </button>
        </div>
      </div>

      <!-- Aturan Kode Keuangan -->
      <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
        <div class="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h4 class="text-[15px] font-bold text-slate-900">Aturan Kode Keuangan</h4>
            <p class="mt-0.5 text-[12px] text-slate-500">
              Ketentuan penetapan tarif dan integritas perhitungan saldo.
            </p>
          </div>
          <span class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <AdminV2Icon name="shield" :size="16" />
          </span>
        </div>
        <ul class="mt-3.5 space-y-2.5 text-[12.5px] text-slate-600 leading-relaxed list-disc list-inside">
          <li>Kode dibuat per <b>tahun masuk</b> &mdash; contoh R-2627 untuk angkatan masuk 2026/2027.</li>
          <li>Varian kategori dibuat sebagai kode tersendiri: Reguler, SSK, Beasiswa, SKTM, Pindahan, Tinggal Kelas.</li>
          <li>Paket yang <b>sudah dipakai siswa tidak bisa dihapus</b>, hanya dinonaktifkan agar riwayat lama tetap valid.</li>
          <li>Tingkat Akhir boleh kosong bila belum ditetapkan manajemen &mdash; tampil sebagai "Belum Diset", bukan Rp 0.</li>
          <li>Biaya di luar paket dicatat lewat <b>Biaya Tambahan per siswa</b> di rincian keuangan siswa.</li>
        </ul>
      </div>
    </div>

    <KeuanganImportModal :open="imporBuka" @close="imporBuka = false" @selesai="tampilNotif" />

    <!-- Modal Form Tambah/Ubah Kode Keuangan -->
    <div v-if="modal" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="modal = null">
      <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl shadow-xl">
        <h4 class="text-[16px] font-bold text-slate-900">{{ modal.lama ? 'Ubah Paket Kode Keuangan' : 'Tambah Paket Kode Keuangan' }}</h4>
        <p class="mt-0.5 text-[12.5px] text-slate-500">Nominal diisi angka saja (rupiah) per tingkat untuk jenjang {{ grade }}.</p>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Kode Paket</label>
            <input v-model="modal.kode" :disabled="!!modal.lama" placeholder="cth: R-2728" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13px] disabled:bg-slate-50">
          </div>
          <div>
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Nama Paket</label>
            <input v-model="modal.nama" placeholder="cth: Siswa Reguler" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13px]">
          </div>
          <div v-for="i in [0, 1, 2, 3]" :key="i">
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Nominal {{ LABEL_TINGKAT[grade][i] }}</label>
            <input v-model="modal.n[i]" inputmode="numeric" placeholder="0 = belum diset" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13px] tabular-nums">
          </div>
        </div>

        <label class="mt-3.5 flex items-center gap-2 text-[12.5px] text-slate-700 cursor-pointer">
          <input v-model="modal.aktif" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]">
          <span>Paket aktif (dapat dipasangkan ke siswa baru)</span>
        </label>

        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="modal = null" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
          <button type="button" @click="simpan" class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-bold text-white hover:bg-[#154cb0]">Simpan Paket</button>
        </div>
      </div>
    </div>
  </div>
</template>
