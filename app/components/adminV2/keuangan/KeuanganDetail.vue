<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import {
  LABEL_TINGKAT, formatTanggal, inisialNama, namaItem, persenTeks, rp,
  type Pembayaran
} from '~/composables/keuanganCore'
import KeuanganFormBayar from './KeuanganFormBayar.vue'
import KeuanganCetak from './KeuanganCetak.vue'

// Rincian Keuangan Siswa — tata letak 2 kolom hasil meeting manajemen
// 4 Nov 2026: KIRI kartu siswa + form input pembayaran (nempel, bukan
// popup); KANAN rincian tagihan & pembayaran + riwayat transaksi.
// Tombol lama "Kirim notifikasi ke wali" diganti Release Tagihan per
// tingkat (notifikasinya tampil di Portal Orang Tua bila portal itu
// sudah dibangun; sekarang aksi & data rilisnya yang disimpan).
const props = defineProps<{ nis: string }>()
const emit = defineEmits<{ kembali: [] }>()
const grade = useAdminGrade()
const K = useKeuangan()

const cetak = ref<null | { jenis: 'wa' | 'surat' | 'kwitansi', bayar?: Pembayaran | null }>(null)
const tambahanUntuk = ref<number | null>(null)
const namaBiaya = ref('')
const nominalBiaya = ref('')
const riwayat = ref<Pembayaran[]>([])
const notif = ref('')
const sibukRilis = ref<number | null>(null)

const formatRibuan = (val: string) => {
  const digits = val.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

onMounted(async () => {
  await K.muatSemua(grade.value)
  riwayat.value = await K.muatBayarSiswa(grade.value, props.nis)
})

const siswa = computed(() => K.siswaSatu(grade.value, props.nis))
const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3400) }

const setelahBayar = async (b: Pembayaran) => {
  riwayat.value = await K.muatBayarSiswa(grade.value, props.nis)
  cetak.value = { jenis: 'kwitansi', bayar: b }
  tampilNotif(`Pembayaran ${b.no} tersimpan. Alokasi waterfall, total dibayar & sisa siswa ini sudah dihitung ulang dari riwayat.`)
}

const rilis = async (t: number) => {
  const s = siswa.value
  if (!s) return
  sibukRilis.value = t
  try {
    await K.rilisTagihan(grade.value, s.nis, t, 'Anis Azyzy, S.T')
    tampilNotif(`Tagihan ${LABEL_TINGKAT[grade.value][t]} untuk ${s.nama} sudah di-Release — akan tampil sebagai notifikasi tagihan di Portal Orang Tua.${s.hitung.saldo > 0 ? ` Saldo ${rp(s.hitung.saldo)} ikut menutup tagihan ini.` : ''}`)
  } catch (e: any) {
    tampilNotif(e?.message || 'Release tagihan gagal.')
  } finally { sibukRilis.value = null }
}

const simpanTambahan = async () => {
  const s = siswa.value
  if (!s || tambahanUntuk.value === null || !s.kode) return
  const nominal = Math.max(0, parseInt(nominalBiaya.value.replace(/[^0-9]/g, ''), 10) || 0)
  const tambahan = [...s.tambahan] as [number, number, number, number]
  tambahan[tambahanUntuk.value] += nominal
  await K.simpanPenetapan(grade.value, s.nis, s.kode, tambahan)
  tampilNotif(`Biaya tambahan ${namaBiaya.value || 'Biaya Tambahan'} sebesar ${rp(nominal)} ditambahkan ke ${LABEL_TINGKAT[grade.value][tambahanUntuk.value]} untuk siswa ini saja — paket bersama tidak berubah.`)
  tambahanUntuk.value = null
  namaBiaya.value = ''
  nominalBiaya.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <!-- Floating Toast Notification -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-3"
    >
      <div
        v-if="notif"
        class="fixed bottom-5 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#101828] px-4 py-3.5 text-[13px] font-medium text-white shadow-2xl ring-1 ring-white/10"
      >
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
        <span class="flex-1 leading-snug">{{ notif }}</span>
      </div>
    </transition>

    <!-- Tombol Kembali -->
    <div>
      <button
        type="button"
        @click="emit('kembali')"
        class="group inline-flex items-center gap-2 text-[13px] font-semibold text-[#1B5FD9] hover:text-[#154cb0] transition-colors"
      >
        <span class="transition-transform group-hover:-translate-x-1">&larr;</span>
        <span>Kembali ke Data Keuangan</span>
      </button>
    </div>

    <!-- State: Siswa Tidak Ditemukan -->
    <div v-if="!siswa" class="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm">
      <h3 class="text-[15px] font-bold text-slate-800">Siswa Tidak Ditemukan</h3>
      <p class="mt-1 text-[13px] text-slate-500 max-w-md mx-auto">
        NIS <b class="text-slate-700">{{ nis }}</b> tidak ditemukan pada jenjang {{ grade }}. Pastikan Anda telah memilih jenjang yang sesuai di menu atas.
      </p>
    </div>

    <!-- Layout Utama: 2 Kolom Responsive -->
    <div v-else class="grid items-start gap-5 xl:grid-cols-[380px_1fr]">
      <!-- ===== KOLOM KIRI: Kartu Profil Siswa Modern + Form Pembayaran ===== -->
      <div class="space-y-4">
        <!-- Kartu Identitas Siswa Modern & Keren -->
        <div class="overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
          <!-- Header Banner Digital Identity -->
          <div
            class="relative px-5 pt-4 pb-11 text-white"
            :class="grade === 'SMP' ? 'bg-gradient-to-r from-[#064E3B] via-[#059669] to-[#047857]' : 'bg-gradient-to-r from-[#0A2A5C] via-[#1B5FD9] to-[#0D3B82]'"
          >
            <div class="flex items-center justify-between">
              <span class="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-xs">
                IDENTITAS SISWA
              </span>
              <span class="text-[11px] font-semibold tracking-wide text-white/90">
                {{ grade === 'SMK' ? 'SMK IT ATTAQWA 9' : 'SMP IT BCA' }}
              </span>
            </div>
          </div>

          <!-- Profil Utama (Avatar + Identitas) -->
          <div class="px-5 pb-5 pt-0">
            <div class="-mt-7 flex items-start gap-3.5">
              <div class="relative rounded-2xl bg-white p-1 shadow-md ring-1 ring-slate-100 shrink-0">
                <span
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-[18px] font-black shadow-inner"
                  :class="grade === 'SMP' ? 'bg-gradient-to-br from-[#E7F6ED] to-[#C3EAD2] text-[#14532D]' : 'bg-gradient-to-br from-[#E8F0FE] to-[#C9DCFB] text-[#0A2A5C]'"
                >
                  {{ inisialNama(siswa.nama) }}
                </span>
                <span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white" title="Aktif">
                  <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
              </div>
              <div class="min-w-0 flex-1 pt-1.5">
                <h2 class="text-[17px] font-extrabold text-slate-900 leading-tight truncate">{{ siswa.nama }}</h2>
                <p class="mt-0.5 text-[12px] font-medium text-slate-500">
                  NIS <b :class="grade === 'SMP' ? 'text-[#067647]' : 'text-[#1B5FD9]'">{{ siswa.nis }}</b> &middot; NISN {{ siswa.nisn }}
                </p>
              </div>
            </div>

            <!-- Chips Informasi Siswa -->
            <div class="mt-4 flex flex-wrap items-center gap-1.5">
              <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                Kelas {{ siswa.kelas }}
              </span>
              <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                Angkatan {{ siswa.angkatan }}
              </span>
              <span class="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                {{ siswa.status }}
              </span>
            </div>

            <!-- Detail Kontak & Kode Keuangan -->
            <div class="mt-3.5 space-y-2 rounded-xl bg-slate-50/80 p-3 text-[12px] border border-slate-100">
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Paket Keuangan</span>
                <b class="rounded-md bg-blue-50 px-2.5 py-0.5 text-[11.5px] font-bold text-[#1B5FD9] border border-blue-200">
                  {{ siswa.kode || 'Belum dipasang' }}
                </b>
              </div>
              <div class="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span class="font-medium text-slate-500">Nomor WhatsApp Wali</span>
                <span class="font-semibold text-slate-800 tabular-nums">{{ siswa.hpWali || '—' }}</span>
              </div>
            </div>

            <!-- Widget Status Keuangan Eksekutif -->
            <div
              class="mt-3.5 rounded-2xl border border-[#E7EBF2] bg-slate-50/70 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.02)]"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  STATUS TAGIHAN
                </span>
                <span
                  class="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
                  :class="siswa.statusBayar === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : siswa.statusBayar === 'Kurang' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300'"
                >
                  {{ siswa.statusBayar }}
                </span>
              </div>

              <div class="mt-2.5">
                <span class="text-[11.5px] font-medium text-slate-500">Sisa Tagihan Saat Ini</span>
                <div class="text-[24px] font-black text-rose-600 tabular-nums leading-tight">
                  {{ rp(siswa.hitung.sisa) }}
                </div>
              </div>

              <!-- Meter Terbayar vs Total -->
              <div class="mt-3 pt-2.5 border-t border-slate-200/60">
                <div class="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                  <span>Terbayar: <b class="text-emerald-700 font-bold tabular-nums">{{ rp(siswa.hitung.bayar) }}</b></span>
                  <span>Total: <b class="text-slate-800 font-bold tabular-nums">{{ rp(siswa.hitung.total) }}</b></span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="siswa.hitung.persen >= 100 ? 'bg-emerald-600' : 'bg-[#1B5FD9]'"
                    :style="{ width: siswa.hitung.persen + '%' }"
                  />
                </div>
              </div>
            </div>

            <!-- Banner Saldo Siswa -->
            <div
              v-if="siswa.hitung.saldo > 0"
              class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12px] font-medium text-emerald-800 leading-relaxed"
            >
              Saldo Tersedia: <b>{{ rp(siswa.hitung.saldo) }}</b> &mdash; siap dialokasikan otomatis saat tagihan tingkat berikutnya dirilis.
            </div>

            <!-- Alert Belum Ada Kode -->
            <div
              v-if="!siswa.kode"
              class="mt-3 rounded-xl border border-amber-200 bg-[#FFFAEB] p-3 text-[12px] font-medium text-[#B54708] leading-relaxed"
            >
              Siswa ini belum dipasang Kode Keuangan. Silakan pasang kode paket terlebih dahulu di tab Data Keuangan.
            </div>

            <!-- Tombol Cetak Surat Tagihan -->
            <div class="mt-4">
              <button
                type="button"
                @click="cetak = { jenis: 'surat' }"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-[12.5px] font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                <span>Cetak Surat Tagihan</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Input Pembayaran -->
        <KeuanganFormBayar :siswa="siswa" @tersimpan="setelahBayar" />
      </div>

      <!-- ===== KOLOM KANAN: Rincian Tagihan & Riwayat Transaksi (BEBAS HORIZONTAL SCROLL) ===== -->
      <div class="min-w-0 space-y-5">
        <!-- Section: Rincian Tagihan -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2">
            <div>
              <h3 class="text-[16.5px] font-bold text-slate-900">Rincian Tagihan &amp; Pembayaran</h3>
              <p class="text-[12px] text-slate-500 leading-snug">
                Nominal master dari Kode Keuangan &middot; Alokasi pembayaran otomatis (waterfall)
              </p>
            </div>
            <div v-if="siswa.hitung.saldo > 0" class="self-start sm:self-auto">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                Saldo Siswa: {{ rp(siswa.hitung.saldo) }}
              </span>
            </div>
          </div>

          <!-- LISTING RINCIAN TAGIHAN: BEBAS HORIZONTAL SCROLL DI DESKTOP & MOBILE -->
          <div class="mt-3 space-y-3.5">
            <div
              v-for="(v, t) in siswa.hitung.per"
              :key="t"
              class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all"
            >
              <!-- Baris Atas: Nama Tingkat, Status Tagihan, & Aksi Rilis -->
              <div class="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2.5">
                  <h4 class="text-[16px] font-bold text-slate-900">{{ LABEL_TINGKAT[grade][t] }}</h4>
                  <span
                    v-if="v.master <= 0"
                    class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 border border-amber-200"
                  >
                    Belum Diset
                  </span>
                  <span
                    v-else-if="v.total > 0 && v.sisa <= 0"
                    class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200"
                  >
                    Lunas 100%
                  </span>
                  <span
                    v-else-if="v.bayar > 0"
                    class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-800 border border-amber-200"
                  >
                    Terbayar {{ persenTeks(v.persen) }}
                  </span>
                  <span
                    v-else
                    class="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10.5px] font-bold text-rose-700 border border-rose-200"
                  >
                    Belum Bayar
                  </span>
                </div>

                <!-- Tombol / Status Rilis Tagihan -->
                <div>
                  <span
                    v-if="K.sudahDirilis(siswa.nis, t)"
                    class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200"
                  >
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    Dirilis {{ formatTanggal(String(K.sudahDirilis(siswa.nis, t)?.pada || '').slice(0, 10)) }}
                  </span>
                  <button
                    v-else-if="v.total > 0"
                    type="button"
                    :disabled="sibukRilis === t"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-[#1B5FD9] px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-2xs hover:bg-[#154cb0] disabled:opacity-40 transition-colors"
                    @click="rilis(t)"
                  >
                    <span>{{ sibukRilis === t ? 'Merilis...' : 'Release Tagihan' }}</span>
                  </button>
                  <span v-else class="text-[12px] text-slate-400">Tagihan belum ada</span>
                </div>
              </div>

              <!-- Strip Metrik Keuangan 3 Kolom Responsif -->
              <div class="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Kolom 1: Total Tagihan + Rincian Master & Tambahan -->
                <div class="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                  <div class="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Total Tagihan</div>
                  <div class="mt-1 text-[17px] font-extrabold text-slate-900 tabular-nums">{{ rp(v.total) }}</div>
                  <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11.5px] text-slate-600">
                    <span>Master: <b class="text-slate-800">{{ v.master > 0 ? rp(v.master) : 'Rp 0' }}</b></span>
                    <div class="flex items-center gap-1">
                      <span>Tambahan: <b class="text-slate-800">{{ rp(v.tambahan) }}</b></span>
                      <button
                        type="button"
                        @click="tambahanUntuk = t"
                        class="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#1B5FD9] border border-blue-200 hover:bg-blue-100 transition-colors"
                        title="Tambah biaya khusus siswa ini"
                      >
                        + Biaya
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Kolom 2: Total Dibayar -->
                <div class="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
                  <div class="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">Total Dibayar</div>
                  <div class="mt-1 text-[17px] font-extrabold text-emerald-700 tabular-nums">{{ rp(v.bayar) }}</div>
                  <div class="mt-2 pt-2 border-t border-emerald-200/60 text-[11.5px] text-emerald-700 font-medium">
                    Alokasi waterfall otomatis
                  </div>
                </div>

                <!-- Kolom 3: Sisa Tagihan -->
                <div
                  class="rounded-xl p-3.5 border"
                  :class="v.sisa > 0 ? 'bg-rose-50/50 border-rose-200/80' : 'bg-slate-50/70 border-slate-200/80'"
                >
                  <div
                    class="text-[10.5px] font-bold uppercase tracking-wider"
                    :class="v.sisa > 0 ? 'text-rose-800' : 'text-slate-500'"
                  >
                    Sisa Tagihan
                  </div>
                  <div
                    class="mt-1 text-[17px] font-extrabold tabular-nums"
                    :class="v.sisa > 0 ? 'text-rose-700' : 'text-slate-900'"
                  >
                    {{ rp(v.sisa) }}
                  </div>
                  <div
                    class="mt-2 pt-2 border-t text-[11.5px] font-medium"
                    :class="v.sisa > 0 ? 'border-rose-200/60 text-rose-600' : 'border-slate-200/60 text-slate-500'"
                  >
                    {{ v.sisa <= 0 ? 'Tagihan tingkat ini lunas' : 'Menunggu pelunasan' }}
                  </div>
                </div>
              </div>

              <!-- Progress Bar Tingkat -->
              <div class="mt-3.5 pt-3 border-t border-slate-100">
                <div class="flex items-center justify-between text-[11.5px] mb-1.5">
                  <span class="text-slate-500 font-medium">Progress Pelunasan</span>
                  <span class="font-bold tabular-nums" :class="v.persen >= 100 ? 'text-emerald-700' : 'text-[#1B5FD9]'">
                    {{ persenTeks(v.persen) }} Terbayar
                  </span>
                </div>
                <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="v.persen >= 100 ? 'bg-emerald-600' : 'bg-[#1B5FD9]'"
                    :style="{ width: v.persen + '%' }"
                  />
                </div>
              </div>
            </div>

            <!-- Banner Ringkasan Total Seluruh Tingkat -->
            <div class="rounded-[20px] border border-blue-400/30 bg-gradient-to-br from-[#0A2A5C] via-[#101828] to-[#0A2A5C] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="text-[11.5px] font-bold uppercase tracking-wider text-blue-300">
                    TOTAL KESELURUHAN TINGKAT
                  </span>
                  <span
                    v-if="siswa.hitung.saldo > 0"
                    class="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300 border border-emerald-400/30"
                  >
                    Saldo {{ rp(siswa.hitung.saldo) }}
                  </span>
                  <span
                    v-else-if="siswa.hitung.sisa <= 0"
                    class="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300 border border-emerald-400/30"
                  >
                    Lunas 100%
                  </span>
                  <span
                    v-else
                    class="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-300 border border-amber-400/30"
                  >
                    Terbayar {{ persenTeks(siswa.hitung.persen) }}
                  </span>
                </div>
                <span class="text-[11px] text-slate-300">Akumulasi Seluruh Tingkat</span>
              </div>

              <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="rounded-xl bg-white/5 border border-white/10 p-3.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Tagihan</div>
                  <div class="mt-1 text-[18px] font-extrabold text-white tabular-nums">{{ rp(siswa.hitung.total) }}</div>
                </div>
                <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Total Dibayar</div>
                  <div class="mt-1 text-[18px] font-extrabold text-emerald-400 tabular-nums">{{ rp(siswa.hitung.bayar) }}</div>
                </div>
                <div class="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-rose-300">Sisa Tagihan</div>
                  <div class="mt-1 text-[18px] font-extrabold text-rose-300 tabular-nums">{{ rp(siswa.hitung.sisa) }}</div>
                </div>
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Progress Akumulasi Pembayaran</span>
                  <span class="font-bold text-blue-200">{{ persenTeks(siswa.hitung.persen) }}</span>
                </div>
                <div class="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    class="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-400 to-emerald-400"
                    :style="{ width: siswa.hitung.persen + '%' }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Riwayat Transaksi Siswa Ini -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2">
            <div>
              <h3 class="text-[16px] font-bold text-slate-900">Riwayat Transaksi Siswa Ini</h3>
              <p class="text-[12px] text-slate-500 leading-snug">
                Total Dibayar di atas selalu dihitung dari daftar transaksi ini (waterfall).
              </p>
            </div>
            <span class="text-[12px] font-medium text-slate-500">
              {{ riwayat.length }} Transaksi Tercatat
            </span>
          </div>

          <div class="mt-2.5 overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] divide-y divide-slate-100">
            <div
              v-for="b in riwayat"
              :key="b.no"
              class="p-4 sm:p-4.5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wide"
                    :class="b.metode === 'Tunai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : b.metode === 'Transfer' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
                  >
                    {{ b.metode }}
                  </span>
                  <h4 class="text-[14px] font-bold text-slate-900">
                    {{ b.keterangan }}
                    <span v-if="!(b.items || []).some(it => it.tingkat !== null && it.tingkat !== undefined)" class="font-normal text-slate-500 text-[12.5px]">
                      ({{ b.tingkat === null ? 'Waterfall' : LABEL_TINGKAT[grade][b.tingkat] }})
                    </span>
                  </h4>
                </div>

                <!-- Breakdown Item List -->
                <div v-if="b.items && b.items.length" class="mt-2 flex flex-wrap gap-1.5">
                  <span
                    v-for="(it, ii) in b.items"
                    :key="ii"
                    class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] text-slate-700"
                  >
                    <span class="font-medium">{{ namaItem(it, b.grade) }}:</span>
                    <span class="font-semibold text-slate-900 tabular-nums">{{ rp(it.nominal) }}</span>
                  </span>
                </div>

                <!-- Info Invoice & Petugas -->
                <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
                  <span>No. Invoice: <b class="font-medium text-slate-700">{{ b.no }}</b></span>
                  <span>&middot;</span>
                  <span>{{ b.tanggal }}</span>
                  <span>&middot;</span>
                  <span>Petugas: {{ b.petugas }}</span>
                  <template v-if="b.cutoff">
                    <span>&middot;</span>
                    <span class="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-800 border border-amber-200">
                      Cut-off: {{ b.cutoff }} (Terkunci)
                    </span>
                  </template>
                </div>
              </div>

              <!-- Sisi Kanan: Nominal & Tombol Cetak -->
              <div class="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span class="text-[16px] sm:text-[17px] font-bold text-emerald-700 tabular-nums">
                  {{ rp(b.nominal) }}
                </span>
                <button
                  type="button"
                  @click="cetak = { jenis: 'kwitansi', bayar: b }"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <span>Cetak Invoice</span>
                </button>
              </div>
            </div>

            <!-- State: Belum Ada Transaksi -->
            <div v-if="!riwayat.length" class="p-8 text-center">
              <p class="text-[14px] font-semibold text-slate-700">Belum Ada Pembayaran</p>
              <p class="mt-1 text-[12.5px] text-slate-500">Belum ada transaksi pembayaran tercatat untuk siswa ini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cetak -->
    <KeuanganCetak
      v-if="cetak && siswa"
      :jenis="cetak.jenis"
      :siswa="siswa"
      :bayar="cetak.bayar"
      @tutup="cetak = null"
    />

    <!-- Modal Tambah Biaya Khusus Siswa -->
    <div
      v-if="tambahanUntuk !== null && siswa"
      class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 backdrop-blur-xs sm:items-center sm:p-4"
      @click.self="tambahanUntuk = null"
    >
      <div class="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl shadow-2xl">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-[16px] font-bold text-slate-900">
              Tambah Biaya &mdash; {{ LABEL_TINGKAT[grade][tambahanUntuk] }}
            </h3>
            <p class="mt-0.5 text-[12px] text-slate-500 leading-snug">
              Berlaku khusus untuk {{ siswa.nama }} saja (biaya per siswa), tidak mengubah paket {{ siswa.kode }} siswa lain.
            </p>
          </div>
          <button
            type="button"
            @click="tambahanUntuk = null"
            class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none"
          >
            &times;
          </button>
        </div>

        <div class="mt-4 space-y-3">
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Nama Biaya</label>
            <input
              v-model="namaBiaya"
              placeholder="cth: Kegiatan Ekstra / Biaya Tambahan"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-800 focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/15"
            >
          </div>
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Nominal (Rp)</label>
            <div class="relative">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] font-bold text-slate-400">Rp</span>
              <input
                :value="nominalBiaya"
                @input="nominalBiaya = formatRibuan(($event.target as HTMLInputElement).value)"
                inputmode="numeric"
                placeholder="cth: 150.000"
                class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-[13px] font-bold tabular-nums text-slate-900 focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/15"
              >
            </div>
          </div>
        </div>

        <div class="mt-3.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[12px] text-slate-600 leading-relaxed">
          Nominal Tambahan saat ini adalah <b>{{ rp(siswa.hitung.per[tambahanUntuk].tambahan) }}</b>. Nominal baru akan ditambahkan ke angka tersebut.
        </div>

        <div class="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            @click="tambahanUntuk = null"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="simpanTambahan"
            class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#154cb0] transition-colors"
          >
            Simpan Biaya Tambahan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
