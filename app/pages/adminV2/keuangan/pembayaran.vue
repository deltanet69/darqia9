<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { inisialNama, rp, type Pembayaran } from '~/composables/keuanganCore'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'

// Halaman Pembayaran — sub-menu baru hasil meeting manajemen 4 Nov 2026.
// Tombol Input Pembayaran TIDAK lagi membuka popup: petugas mencari siswa
// di halaman ini, klik hasilnya, lalu masuk ke Rincian Keuangan Siswa
// (di sana form pembayaran menempel di kolom kiri, model waterfall).
const grade = useAdminGrade()
const router = useRouter()
const K = useKeuangan()
const cari = ref('')
const terakhir = ref<Pembayaran[]>([])

const muatTerakhir = async () => {
  const r = await K.muatRiwayat(grade.value, { dari: 0, jumlah: 8 })
  terakhir.value = r.rows
}
onMounted(async () => { await K.muatSemua(grade.value); await muatTerakhir() })
watch(grade, async g => { await K.muatSemua(g); await muatTerakhir() })

const hasil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  if (q.length < 2) return []
  return K.barisSiswa(grade.value)
    .filter(s => s.nis.includes(q) || s.nama.toLowerCase().includes(q))
    .slice(0, 8)
})
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)
const bukaSiswa = (nis: string) => void router.push({ path: '/adminV2/keuangan', query: { siswa: nis } })
const namaSekolah = computed(() => grade.value === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam')
</script>

<template>
  <SistemPageShell judul="Input Pembayaran" modul-label="Input Pembayaran" modul-to="/adminV2/keuangan/pembayaran" grup-label="Keuangan" route-id="keuangan">
    <div class="space-y-5">
      <!-- Header Halaman -->
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1B5FD9] bg-[#E8F0FE] px-2.5 py-0.5 rounded-md border border-[#D0E2FF]">
            LOKET PEMBAYARAN &middot; V2
          </span>
          <span
            class="text-[10.5px] font-extrabold rounded-md px-2.5 py-0.5 border"
            :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D] border-emerald-200' : 'bg-[#E8F0FE] text-[#0A2A5C] border-blue-200'"
          >
            {{ grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
          Input Pembayaran Kasir
        </h1>
        <p class="mt-1 text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-3xl font-medium">
          Cari siswa berdasarkan NIS atau nama &mdash; rincian tagihan &amp; form pembayaran waterfall terbuka langsung di rincian siswa.
        </p>
      </div>

      <!-- Mode Contoh Lokal Warning -->
      <div v-if="K.lokal.value" class="rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 sm:p-4 text-[12.5px] text-amber-900 shadow-2xs">
        <b>Mode contoh lokal aktif.</b> Menampilkan data siswa contoh untuk pengujian alur kasir.
      </div>

      <!-- Strip Identitas Jenjang Terintegrasi -->
      <div class="flex items-center justify-between gap-3 rounded-xl border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs text-slate-600 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div class="flex items-center gap-2 min-w-0">
          <span class="flex h-2 w-2 rounded-full shrink-0" :class="grade === 'SMP' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
          <span class="font-bold text-slate-800 shrink-0">{{ namaSekolah }}</span>
          <span class="text-slate-300">|</span>
          <span class="text-slate-500 truncate">Mencari siswa aktif terdaftar pada jenjang terpilih</span>
        </div>
        <span class="shrink-0 text-[11px] font-semibold text-slate-400 hidden sm:inline">
          Ganti jenjang lewat switch SMP/SMK di kanan atas
        </span>
      </div>

      <!-- Cari Siswa Card (Executive Style) -->
      <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
        <div class="flex items-start justify-between gap-2 pb-2">
          <div>
            <h3 class="text-[16px] font-bold text-slate-900">Cari Siswa untuk Pembayaran</h3>
            <p class="mt-0.5 text-[12.5px] text-slate-500 leading-snug">
              Wali murid umumnya hafal NIS anaknya &mdash; NIS adalah ID pembayaran resmi siswa sampai lulus.
            </p>
          </div>
          <span class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B5FD9] shrink-0">
            <AdminV2Icon name="search" :size="18" />
          </span>
        </div>

        <div class="relative mt-3 max-w-xl">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </span>
          <input
            v-model="cari"
            placeholder="Ketik NIS atau nama siswa..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1B5FD9] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          >
          <button
            v-if="cari"
            type="button"
            @click="cari = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Hasil Pencarian Siswa Live Dropdown -->
        <div v-if="hasil.length" class="mt-3.5 max-w-xl divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <button
            v-for="s in hasil"
            :key="s.nis"
            type="button"
            @click="bukaSiswa(s.nis)"
            class="flex w-full items-center justify-between gap-3 p-3.5 text-left hover:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold"
                :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
              >
                {{ inisialNama(s.nama) }}
              </span>
              <div class="min-w-0">
                <span class="block truncate text-[13.5px] font-bold text-slate-900">{{ s.nama }}</span>
                <span class="block text-[11.5px] text-slate-500">
                  NIS {{ s.nis }} &middot; {{ s.kelas }}
                </span>
              </div>
            </div>

            <div class="shrink-0 text-right">
              <span v-if="!s.kode" class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                Belum Pasang Kode
              </span>
              <span v-else-if="s.hitung.saldo > 0" class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#067647] border border-emerald-200">
                Saldo {{ rp(s.hitung.saldo) }}
              </span>
              <span v-else-if="s.hitung.sisa > 0" class="inline-flex items-center gap-1.5">
                <span class="text-[11px] text-slate-400">Sisa:</span>
                <b class="tabular-nums font-bold text-rose-700 text-[13px]">{{ rp(s.hitung.sisa) }}</b>
              </span>
              <span v-else class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#067647] border border-emerald-200">
                Lunas 100%
              </span>
            </div>
          </button>
        </div>
        <p v-else-if="cari.trim().length >= 2" class="mt-2.5 text-[12px] text-slate-500">
          Tidak ada siswa yang cocok dengan kata kunci "{{ cari }}". Periksa kembali NIS atau nama siswa.
        </p>
      </div>

      <!-- Pembayaran Terakhir Card (Executive Style) -->
      <div class="rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 class="text-[15px] font-bold text-slate-900">Pembayaran Terakhir Diproses</h4>
            <p class="text-[12px] text-slate-500 mt-0.5">Klik salah satu baris untuk membuka rincian tagihan siswa.</p>
          </div>
          <span class="text-[12px] font-semibold text-slate-400">{{ terakhir.length }} Transaksi Terkini</span>
        </div>

        <div class="divide-y divide-slate-100">
          <button
            v-for="b in terakhir"
            :key="b.no"
            type="button"
            @click="bukaSiswa(b.nis)"
            class="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
              >
                {{ inisialNama(namaSiswa(b.nis)?.nama || b.nis) }}
              </span>
              <div class="min-w-0">
                <span class="block truncate text-[13.5px] font-bold text-slate-900">{{ namaSiswa(b.nis)?.nama || b.nis }}</span>
                <span class="block text-[11.5px] text-slate-500">
                  {{ b.no }} &middot; {{ b.tanggal }} &middot; {{ b.keterangan }} &middot; {{ b.metode }}
                </span>
              </div>
            </div>
            <b class="tabular-nums font-black text-emerald-700 text-[14px] shrink-0">{{ rp(b.nominal) }}</b>
          </button>

          <div v-if="!terakhir.length" class="px-4 py-8 text-center text-[13px] text-slate-500">
            Belum ada transaksi pembayaran yang tercatat pada jenjang ini.
          </div>
        </div>
      </div>
    </div>
  </SistemPageShell>
</template>
