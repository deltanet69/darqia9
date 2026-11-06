<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { inisialNama, labelAliran, rp, type Pembayaran } from '~/composables/keuanganCore'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'

const emit = defineEmits<{ buka: [nis: string] }>()
const grade = useAdminGrade()
const K = useKeuangan()
const cari = ref('')
const fMetode = ref('')
const rows = ref<Pembayaran[]>([])
const total = ref(0)
const notif = ref('')
let jeda: ReturnType<typeof setTimeout> | undefined

const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3200) }
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)

const muat = async () => {
  const r = await K.muatRiwayat(grade.value, { cari: cari.value, metode: fMetode.value, dari: 0, jumlah: 100 })
  rows.value = r.rows
  total.value = r.total
}
onMounted(muat)
watch(grade, muat)
watch(fMetode, muat)
watch(cari, () => { clearTimeout(jeda); jeda = setTimeout(muat, 300) })

const totalNominalMasuk = computed(() => rows.value.reduce((acc, b) => acc + (b.nominal || 0), 0))
const tunaiRows = computed(() => rows.value.filter(b => b.metode === 'Tunai'))
const totalTunai = computed(() => tunaiRows.value.reduce((acc, b) => acc + (b.nominal || 0), 0))
const nonTunaiRows = computed(() => rows.value.filter(b => b.metode !== 'Tunai'))
const totalNonTunai = computed(() => nonTunaiRows.value.reduce((acc, b) => acc + (b.nominal || 0), 0))

const hapus = async (b: Pembayaran) => {
  if (!window.confirm(`Hapus pembayaran ${b.no} senilai ${rp(b.nominal)}?`)) return
  try {
    await K.hapusBayar(b)
    tampilNotif(`Pembayaran ${b.no} dihapus. Total Dibayar siswa dihitung ulang dari riwayat yang tersisa.`)
    await muat()
  } catch (e: any) {
    tampilNotif(e?.message || 'Pembayaran gagal dihapus.')
  }
}

const ekspor = () => {
  const kepala = 'No Kwitansi;Tanggal;NIS;Nama;Kelas;Aliran;Keterangan;Metode;Nominal;Petugas;Status\n'
  const isi = rows.value.map(b => {
    const s = namaSiswa(b.nis)
    const rincian = b.items && b.items.length ? b.items.map(it => `${it.keterangan} ${it.nominal}`).join(' + ') : b.keterangan
    return [b.no, b.tanggal, b.nis, s?.nama || '', s?.kelas || '', labelAliran(b.tingkat), rincian, b.metode, b.nominal, b.petugas, b.cutoff ? `Cut-off ${b.cutoff}` : 'Terbuka'].join(';')
  }).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + kepala + isi], { type: 'text/csv' }))
  a.download = 'riwayat-pembayaran-' + grade.value.toLowerCase() + '.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Floating Toast Notification -->
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl animate-fade-in">
      {{ notif }}
    </div>

    <!-- 4 KARTU KPI EXECUTIVE RIWAYAT TRANSAKSI (SESUAI CARD STYLING OVERVIEW) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- KPI 1: Total Transaksi (HERO BLUE/GREEN GRADIENT) -->
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
              Total Transaksi {{ grade }}
            </span>
            <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <AdminV2Icon name="file-text" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-white mt-1.5 tabular-nums">
            {{ total }} Kwitansi
          </div>
        </div>

        <div class="relative z-10 pt-2 border-t border-white/15 mt-3 flex items-center justify-between text-xs text-white/80">
          <span class="font-medium">Buku Kas Masuk</span>
          <span class="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">Semua Transaksi</span>
        </div>
      </section>

      <!-- KPI 2: Total Dana Masuk (WHITE CARD WITH EMERALD ACCENT) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Dana Masuk
            </span>
            <span class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A] shrink-0">
              <AdminV2Icon name="check" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-emerald-700 mt-1.5 tabular-nums">
            {{ rp(totalNominalMasuk) }}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Realisasi kasir:</span>
          <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
            Terekam
          </span>
        </div>
      </section>

      <!-- KPI 3: Penerimaan Tunai (WHITE CARD WITH AMBER ACCENT) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Penerimaan Tunai
            </span>
            <span class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
              <AdminV2Icon name="clock" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-amber-800 mt-1.5 tabular-nums">
            {{ rp(totalTunai) }}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Fisik kasir:</span>
          <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-amber-800 bg-amber-50 border border-amber-200">
            {{ tunaiRows.length }} Kwitansi Tunai
          </span>
        </div>
      </section>

      <!-- KPI 4: Penerimaan Non-Tunai (WHITE CARD WITH BLUE ACCENT) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Non-Tunai (Bank/QRIS)
            </span>
            <span class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B5FD9] shrink-0">
              <AdminV2Icon name="layers" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-[#1B5FD9] mt-1.5 tabular-nums">
            {{ rp(totalNonTunai) }}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Rekening sekolah:</span>
          <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-blue-800 bg-blue-50 border border-blue-200">
            {{ nonTunaiRows.length }} Bank/QRIS
          </span>
        </div>
      </section>
    </div>

    <!-- Filter & Action Bar Card -->
    <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div class="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
        <div class="relative w-full sm:w-80">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            v-model="cari"
            placeholder="Cari No. Kwitansi atau NIS..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1B5FD9] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          >
        </div>
        <select v-model="fMetode" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-700">
          <option value="">Semua Metode</option>
          <option value="Tunai">Tunai</option>
          <option value="Transfer">Transfer</option>
          <option value="QRIS">QRIS</option>
        </select>
      </div>

      <div class="shrink-0">
        <button
          type="button"
          @click="ekspor"
          class="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <AdminV2Icon name="download" :size="15" />
          <span>Ekspor CSV</span>
        </button>
      </div>
    </div>

    <!-- DAFTAR RIWAYAT PEMBAYARAN (Desktop Table + Mobile Cards) -->
    <div class="overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h4 class="text-[15px] font-bold text-slate-900">Buku Riwayat Pembayaran Masuk</h4>
        <span class="text-[12px] font-semibold text-slate-500">Menampilkan {{ rows.length }} dari {{ total }} data</span>
      </div>

      <!-- Desktop Table (>= lg) -->
      <div class="hidden lg:block">
        <table class="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr class="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4">No. Kwitansi</th>
              <th class="py-3 px-4">Siswa (NIS)</th>
              <th class="py-3 px-4">Aliran</th>
              <th class="py-3 px-4">Nominal &amp; Keterangan</th>
              <th class="py-3 px-4">Petugas</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="b in rows" :key="b.no" class="hover:bg-slate-50/70 transition-colors">
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="font-bold text-[#1B5FD9] block">{{ b.no }}</span>
                <span class="text-[11.5px] text-slate-500">{{ b.tanggal }}</span>
              </td>
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                    :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
                  >
                    {{ inisialNama(namaSiswa(b.nis)?.nama || b.nis) }}
                  </span>
                  <div class="min-w-0">
                    <button
                      type="button"
                      @click="emit('buka', b.nis)"
                      class="block truncate text-left font-bold text-slate-900 hover:text-[#1B5FD9] transition-colors cursor-pointer"
                    >
                      {{ namaSiswa(b.nis)?.nama || '(Siswa tidak ditemukan)' }}
                    </button>
                    <span class="block text-[11.5px] text-slate-500">
                      NIS {{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {{ labelAliran(b.tingkat) }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span class="tabular-nums font-bold text-emerald-700 block">{{ rp(b.nominal) }}</span>
                <span class="text-[11.5px] text-slate-500">{{ b.keterangan }} &middot; {{ b.metode }}</span>
                <span v-if="b.items && b.items.length" class="block text-[11px] text-slate-400 mt-0.5">
                  {{ b.items.map(it => `${it.keterangan} ${rp(it.nominal)}`).join(' · ') }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-600 text-[12px] whitespace-nowrap">{{ b.petugas }}</td>
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <span v-if="b.cutoff" class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                  Cut-off {{ b.cutoff }}
                </span>
                <span v-else class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#067647] border border-emerald-200">
                  Terbuka
                </span>
              </td>
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <button
                  v-if="!b.cutoff"
                  type="button"
                  @click="hapus(b)"
                  class="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[#B42318] hover:bg-red-50 cursor-pointer"
                >
                  Hapus
                </button>
                <span v-else class="text-[12px] font-semibold text-slate-400">Terkunci</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards (< lg: ZERO HORIZONTAL SCROLL) -->
      <div class="block lg:hidden divide-y divide-slate-100">
        <div v-for="b in rows" :key="b.no" class="p-5 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-bold text-[#1B5FD9] text-[13px] block">{{ b.no }}</span>
              <span class="text-[11.5px] text-slate-500">{{ b.tanggal }} &middot; {{ b.metode }}</span>
            </div>
            <span v-if="b.cutoff" class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-800 border border-amber-200 shrink-0">
              Cut-off {{ b.cutoff }}
            </span>
            <span v-else class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-[#067647] border border-emerald-200 shrink-0">
              Terbuka
            </span>
          </div>

          <div class="flex items-center gap-2.5 pt-1">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
              :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
            >
              {{ inisialNama(namaSiswa(b.nis)?.nama || b.nis) }}
            </span>
            <div class="min-w-0 flex-1">
              <button
                type="button"
                @click="emit('buka', b.nis)"
                class="block truncate text-left font-bold text-slate-900 text-[13px] hover:text-[#1B5FD9]"
              >
                {{ namaSiswa(b.nis)?.nama || '(Siswa tidak ditemukan)' }}
              </button>
              <span class="text-[11.5px] text-slate-500">
                NIS {{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}
              </span>
            </div>
            <span class="tabular-nums font-black text-emerald-700 text-[14px] shrink-0">
              {{ rp(b.nominal) }}
            </span>
          </div>

          <div class="flex items-center justify-between text-[11.5px] pt-2 border-t border-slate-100">
            <span class="text-slate-500">
              {{ b.keterangan }} &middot; <span class="font-semibold text-slate-700">{{ labelAliran(b.tingkat) }}</span>
            </span>
            <button
              v-if="!b.cutoff"
              type="button"
              @click="hapus(b)"
              class="text-[11.5px] font-bold text-[#B42318] hover:underline cursor-pointer"
            >
              Hapus
            </button>
            <span v-else class="text-[11.5px] text-slate-400">Terkunci</span>
          </div>
        </div>
      </div>

      <div v-if="!rows.length" class="px-4 py-10 text-center">
        <b class="text-[14px] text-slate-700">Tidak ada riwayat transaksi yang cocok</b>
        <p class="mt-1 text-[12.5px] text-slate-500">Coba ubah kata kunci pencarian atau filter metode pembayaran.</p>
      </div>
    </div>
  </div>
</template>
