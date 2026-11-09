<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { aliranBayar, formatTanggal, rp, type Cutoff, type Pembayaran } from '~/composables/keuanganCore'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'

// Cut-off DIREDEFINISI hasil meeting manajemen 4 Nov 2026:
// - Yang direkap & diserahkan ke administrasi/yayasan HANYA uang TUNAI.
//   Transfer & QRIS langsung masuk rekening — tidak ikut cut-off.
// - Alur: pilih tampilan Harian / Mingguan / Kustom -> daftar transaksi
//   tunai dalam rentang tampil -> klik Release -> isi jumlah yang
//   diserahkan + bukti pemasukan -> transaksi tunai terkunci.
const grade = useAdminGrade()
const K = useKeuangan()
const notif = ref('')
const mode = ref<'harian' | 'mingguan' | 'kustom'>('harian')
const acuan = ref(new Date().toISOString().slice(0, 10))
const dari = ref('2026-11-01')
const sampai = ref('2026-11-03')
const rowsRentang = ref<Pembayaran[]>([])
const sibuk = ref(false)
const rilisBuka = ref(false)
const rilisJumlah = ref('')
const rilisOleh = ref('Anis Azyzy, S.T')
const rilisBukti = ref(false)
const ubahTarget = ref<Cutoff | null>(null)
const ubahOleh = ref('')
const ubahBukti = ref(false)
const ubahJumlah = ref('')
const sibukUbah = ref(false)
const konfirmHapus = ref<Cutoff | null>(null)
const sibukHapus = ref(false)

const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3400) }
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)
const isoDariTanggal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const rentang = computed<{ dariISO: string, sampaiISO: string, label: string }>(() => {
  if (mode.value === 'kustom') return { dariISO: dari.value, sampaiISO: sampai.value, label: `${formatTanggal(dari.value)} s/d ${formatTanggal(sampai.value)}` }
  const d = new Date(acuan.value + 'T00:00:00')
  if (mode.value === 'harian') return { dariISO: acuan.value, sampaiISO: acuan.value, label: formatTanggal(acuan.value) }
  const senin = new Date(d)
  senin.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const minggu = new Date(senin)
  minggu.setDate(senin.getDate() + 6)
  const a = isoDariTanggal(senin)
  const b = isoDariTanggal(minggu)
  return { dariISO: a, sampaiISO: b, label: `Minggu ${formatTanggal(a)} s/d ${formatTanggal(b)}` }
})

const tampilkan = async () => {
  const { rows } = await K.muatRiwayat(grade.value, { dari: 0, jumlah: 500, dariISO: rentang.value.dariISO, sampaiISO: rentang.value.sampaiISO })
  rowsRentang.value = rows
}
watch([mode, acuan, dari, sampai], tampilkan)
watch(grade, tampilkan)

const tunai = computed(() => rowsRentang.value.filter(b => b.metode === 'Tunai'))
const tunaiTerbuka = computed(() => tunai.value.filter(b => !b.cutoff))
const totalTunaiTerbuka = computed(() => tunaiTerbuka.value.reduce((a, b) => a + b.nominal, 0))
const tunaiTerkunci = computed(() => tunai.value.filter(b => b.cutoff))
const nonTunai = computed(() => rowsRentang.value.filter(b => b.metode !== 'Tunai'))
const totalNonTunai = computed(() => nonTunai.value.reduce((a, b) => a + b.nominal, 0))
const cutoffs = computed(() => K.state.value.cutoffs.filter(c => c.grade === grade.value))
const terakhir = computed(() => cutoffs.value[0])

const bukaRilis = () => {
  rilisJumlah.value = String(totalTunaiTerbuka.value)
  rilisBukti.value = false
  rilisBuka.value = true
}
const angkaRilis = computed(() => Math.max(0, parseInt(rilisJumlah.value.replace(/[^0-9]/g, ''), 10) || 0))

const rilis = async () => {
  sibuk.value = true
  try {
    const { cutoff: c, modeLama } = await K.buatCutoff(grade.value, rentang.value.dariISO, rentang.value.sampaiISO, rilisOleh.value.trim() || 'Anis Azyzy, S.T', angkaRilis.value)
    if (rilisBukti.value) await K.unggahBuktiCutoff(c)
    tampilNotif(`Release cut-off ${c.kode} selesai: ${c.trx} transaksi TUNAI (${rp(c.total)}) terkunci & diserahkan ke yayasan${angkaRilis.value !== c.total ? ` — jumlah diserahkan ${rp(angkaRilis.value)} (selisih ${rp(Math.abs(angkaRilis.value - c.total))})` : ''}.${modeLama ? ' Catatan: masih mode lama (semua metode) — jalankan migrasi 0030 agar cut-off khusus tunai.' : ''}`)
    rilisBuka.value = false
    await tampilkan()
  } catch (e: any) {
    tampilNotif(e?.message || 'Release cut-off gagal.')
  } finally { sibuk.value = false }
}

const bukaUbah = (c: Cutoff) => { ubahTarget.value = c; ubahOleh.value = c.oleh; ubahBukti.value = c.bukti; ubahJumlah.value = c.jumlahSetor !== null && c.jumlahSetor !== undefined ? String(c.jumlahSetor) : '' }
const simpanUbah = async () => {
  if (!ubahTarget.value) return
  sibukUbah.value = true
  try {
    const jumlah = ubahJumlah.value.trim() === '' ? null : Math.max(0, parseInt(ubahJumlah.value.replace(/[^0-9]/g, ''), 10) || 0)
    await K.ubahCutoff(ubahTarget.value, ubahOleh.value.trim(), ubahBukti.value, jumlah)
    tampilNotif(`Cut-off ${ubahTarget.value.kode} diperbarui — penanggung jawab, jumlah setor & status bukti serah tersimpan.`)
    ubahTarget.value = null
  } catch (e: any) {
    tampilNotif(e?.message || 'Perubahan cut-off gagal disimpan.')
  } finally { sibukUbah.value = false }
}
const hapus = async () => {
  if (!konfirmHapus.value) return
  sibukHapus.value = true
  try {
    const c = konfirmHapus.value
    await K.hapusCutoff(c)
    tampilNotif(`Cut-off ${c.kode} dihapus. ${c.trx} transaksi (${rp(c.total)}) terbuka kembali dan dana dianggap belum diserahkan.`)
    konfirmHapus.value = null
    await tampilkan()
  } catch (e: any) {
    tampilNotif(e?.message || 'Cut-off gagal dihapus.')
  } finally { sibukHapus.value = false }
}
tampilkan()
</script>

<template>
  <div class="space-y-5">
    <!-- Floating Toast Notification -->
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl animate-fade-in">
      {{ notif }}
    </div>

    <!-- Informasi Cut-off Terakhir (Clean Modern Strip) -->
    <div v-if="terakhir" class="flex items-center justify-between gap-3 rounded-xl border border-[#E7EBF2] bg-white px-4 py-3 text-xs text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="flex h-2 w-2 rounded-full bg-[#1B5FD9] shrink-0" />
        <span class="truncate">
          Release cut-off terakhir: <b class="text-slate-900">{{ terakhir.dari }} s/d {{ terakhir.sampai }}</b> &mdash; tunai sebesar <b class="text-emerald-700 font-extrabold">{{ rp(terakhir.total) }}</b> telah diserahkan ke yayasan.
        </span>
      </div>
      <span class="text-[11px] font-bold text-slate-400 shrink-0 hidden sm:inline">
        Kode: {{ terakhir.kode }}
      </span>
    </div>

    <!-- 4 KARTU KPI CUT-OFF (EXECUTIVE CARD STYLING & HERO GRADIENT) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- KPI 1: Tunai Belum Di-release (HERO GRADIENT) -->
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
              Tunai Belum Release
            </span>
            <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <AdminV2Icon name="clock" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-white mt-1.5 tabular-nums">
            {{ rp(totalTunaiTerbuka) }}
          </div>
        </div>

        <div class="relative z-10 pt-2 border-t border-white/15 mt-3 flex items-center justify-between text-xs text-white/80">
          <span class="font-medium">{{ tunaiTerbuka.length }} transaksi tunai</span>
          <span class="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">Siap Serah</span>
        </div>
      </section>

      <!-- KPI 2: Tunai Sudah Terkunci -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Tunai Terkunci</span>
            <span class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B5FD9] shrink-0">
              <AdminV2Icon name="check" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-[#1B5FD9] mt-1.5 tabular-nums">
            {{ rp(tunaiTerkunci.reduce((a, b) => a + b.nominal, 0)) }}
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Telah diserahterimakan:</span>
          <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-blue-800 bg-blue-50 border border-blue-200">
            {{ tunaiTerkunci.length }} transaksi
          </span>
        </div>
      </section>

      <!-- KPI 3: Transfer / QRIS (Info) -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Non-Tunai (Info)</span>
            <span class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <AdminV2Icon name="layers" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-slate-900 mt-1.5 tabular-nums">
            {{ rp(totalNonTunai) }}
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Rekening bank:</span>
          <span class="text-[11px] font-semibold text-slate-500">
            {{ nonTunai.length }} transaksi
          </span>
        </div>
      </section>

      <!-- KPI 4: Total Semua Metode -->
      <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
        <div>
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Semua Metode</span>
            <span class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A] shrink-0">
              <AdminV2Icon name="check" :size="16" />
            </span>
          </div>
          <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-emerald-700 mt-1.5 tabular-nums">
            {{ rp(rowsRentang.reduce((a, b) => a + b.nominal, 0)) }}
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Total aktivitas:</span>
          <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-emerald-800 bg-[#E7F8F0]">
            {{ rowsRentang.length }} pembayaran
          </span>
        </div>
      </section>
    </div>

    <!-- Control Panel Filter Rentang & Tombol Release (Executive Card Styling) -->
    <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h3 class="text-[15px] font-bold text-slate-900">Cut-off &amp; Release Dana Tunai</h3>
          <p class="mt-0.5 text-[12px] text-slate-500 leading-snug">
            Hanya pembayaran <b>Tunai</b> yang direkap di sini dan diserahkan fisik ke yayasan. Transfer &amp; QRIS langsung masuk rekening sekolah.
          </p>
        </div>
      </div>

      <div class="mt-3.5 flex flex-wrap items-center gap-2.5">
        <!-- Segmented Mode Control (Senada standar AdminV2) -->
        <nav class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl">
          <button
            v-for="m in ([['harian', 'Harian'], ['mingguan', 'Mingguan'], ['kustom', 'Kustom']] as const)"
            :key="m[0]"
            type="button"
            @click="mode = m[0]"
            class="px-3.5 py-1.5 rounded-lg text-[12.5px] transition-all whitespace-nowrap cursor-pointer select-none"
            :class="mode === m[0]
              ? 'bg-white text-[#101828] font-bold shadow-[0_1px_3px_rgba(16,24,40,0.1)]'
              : 'text-[#667085] font-semibold hover:text-[#101828]'"
          >
            {{ m[1] }}
          </button>
        </nav>

        <!-- Date Input Controls -->
        <template v-if="mode !== 'kustom'">
          <input
            v-model="acuan"
            type="date"
            class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] text-slate-800 focus:border-[#1B5FD9] focus:outline-none"
          >
          <span class="text-[12px] text-slate-500 hidden sm:inline">
            {{ mode === 'harian' ? 'Menampilkan satu hari acuan.' : 'Menampilkan Senin–Minggu dari tanggal acuan.' }}
          </span>
        </template>
        <template v-else>
          <div class="flex items-center gap-2">
            <input
              v-model="dari"
              type="date"
              class="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-800"
            >
            <span class="text-slate-400 text-xs">s/d</span>
            <input
              v-model="sampai"
              type="date"
              class="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-800"
            >
          </div>
        </template>

        <!-- Action Release -->
        <button
          type="button"
          :disabled="!tunaiTerbuka.length || sibuk"
          @click="bukaRilis"
          class="w-full sm:w-auto sm:ml-auto rounded-xl bg-[#067647] px-4 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-[#05603a] disabled:opacity-40 transition-colors cursor-pointer"
        >
          Release Cut-off ({{ tunaiTerbuka.length }} tunai)
        </button>
      </div>

      <p class="mt-2.5 text-[12px] text-slate-500">
        Rentang aktif: <b class="text-slate-800">{{ rentang.label }}</b>
      </p>
    </div>

    <!-- DAFTAR TRANSAKSI TUNAI DALAM RENTANG (Desktop Table + Mobile Cards) -->
    <div class="overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h4 class="text-[15px] font-bold text-slate-900">Daftar Transaksi Tunai Rentang Ini</h4>
        <span class="text-[12px] font-semibold text-slate-500">{{ tunai.length }} Transaksi</span>
      </div>

      <!-- Desktop Table (>= lg) -->
      <div class="hidden lg:block">
        <table class="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr class="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4">No. Invoice</th>
              <th class="py-3 px-4">Siswa</th>
              <th class="py-3 px-4">Tingkat</th>
              <th class="py-3 px-4">Nominal</th>
              <th class="py-3 px-4">Keterangan</th>
              <th class="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="b in tunai" :key="b.no" class="hover:bg-slate-50/70 transition-colors">
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="font-bold text-slate-900 block text-[13px]">{{ b.no }}</span>
                <span class="text-[11.5px] text-slate-500">{{ b.tanggal }} &middot; Tunai</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="font-bold text-slate-900 block">{{ namaSiswa(b.nis)?.nama || b.nis }}</span>
                <span class="text-[11.5px] text-slate-500">{{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}</span>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {{ aliranBayar(b) }}
                </span>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap tabular-nums font-bold text-emerald-700">
                {{ rp(b.nominal) }}
              </td>
              <td class="py-3.5 px-4 text-slate-700">{{ b.keterangan }}</td>
              <td class="py-3.5 px-4 whitespace-nowrap text-center">
                <span v-if="b.cutoff" class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                  Terkunci &mdash; {{ b.cutoff }}
                </span>
                <span v-else class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-[#B54708] border border-amber-200">
                  Belum Di-release
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards (< lg: ZERO HORIZONTAL SCROLL) -->
      <div class="block lg:hidden divide-y divide-slate-100">
        <div v-for="b in tunai" :key="b.no" class="p-4 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-bold text-slate-900 text-[13px] block">{{ b.no }}</span>
              <span class="text-[11.5px] text-slate-500">{{ b.tanggal }} &middot; Tunai</span>
            </div>
            <span v-if="b.cutoff" class="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-800 border border-amber-200 shrink-0">
              Terkunci
            </span>
            <span v-else class="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-[#B54708] border border-amber-200 shrink-0">
              Belum Release
            </span>
          </div>

          <div class="flex items-center justify-between text-[12.5px] pt-1">
            <div class="min-w-0">
              <span class="font-bold text-slate-800 block truncate">{{ namaSiswa(b.nis)?.nama || b.nis }}</span>
              <span class="text-[11.5px] text-slate-500">{{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}</span>
            </div>
            <span class="tabular-nums font-black text-emerald-700 text-[13.5px] shrink-0">
              {{ rp(b.nominal) }}
            </span>
          </div>

          <div class="flex items-center justify-between text-[11.5px] pt-1.5 border-t border-slate-50">
            <span class="text-slate-500">{{ b.keterangan }}</span>
            <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 text-[10.5px]">
              {{ aliranBayar(b) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!tunai.length" class="px-4 py-10 text-center">
        <b class="text-[14px] text-slate-700">Tidak ada transaksi TUNAI dalam rentang ini</b>
        <p class="mt-1 text-[12.5px] text-slate-500">Ganti tampilan periode atau tanggal acuannya.</p>
      </div>
    </div>

    <!-- RIWAYAT CUT-OFF (Desktop Table + Mobile Cards) -->
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2">
        <div>
          <h3 class="text-[15px] font-bold text-slate-900">Riwayat Cut-off</h3>
          <p class="text-[12px] text-slate-500">
            Setiap release adalah bukti serah dana tunai sekolah &rarr; yayasan (keuangan pusat).
          </p>
        </div>
      </div>

      <!-- Konfirmasi Hapus Modal/Banner -->
      <div v-if="konfirmHapus" class="mb-3 rounded-[20px] border border-red-200 bg-[#FEF3F2] p-4 text-[13px] text-[#B42318] shadow-xs">
        <p>Hapus cut-off <b>{{ konfirmHapus.kode }}</b> ({{ konfirmHapus.dari }} s/d {{ konfirmHapus.sampai }})? <b>{{ konfirmHapus.trx }} transaksi</b> senilai <b>{{ rp(konfirmHapus.total) }}</b> akan <b>terbuka kembali</b> dan dana dianggap belum diserahkan ke yayasan.</p>
        <div class="mt-3 flex gap-2">
          <button type="button" @click="konfirmHapus = null" class="rounded-xl bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50">Batal</button>
          <button type="button" :disabled="sibukHapus" @click="hapus" class="rounded-xl bg-[#B42318] px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-40">Ya, Hapus &amp; Buka Kunci</button>
        </div>
      </div>

      <div class="overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <!-- Desktop Table (>= lg) -->
        <div class="hidden lg:block">
          <table class="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr class="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <th class="py-3 px-4">Rentang Tanggal</th>
                <th class="py-3 px-4">Hari</th>
                <th class="py-3 px-4">Trx</th>
                <th class="py-3 px-4">Total Tunai</th>
                <th class="py-3 px-4">Jumlah Diserahkan</th>
                <th class="py-3 px-4">Bukti Serah</th>
                <th class="py-3 px-4">Oleh</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="c in cutoffs" :key="c.kode" class="hover:bg-slate-50/70 transition-colors">
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span class="font-bold text-slate-900 block">{{ c.kode }}</span>
                  <span class="text-[11.5px] text-slate-500">{{ c.dari }} s/d {{ c.sampai }}</span>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-700">{{ c.hari }} hari</td>
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-700 font-semibold">{{ c.trx }}</td>
                <td class="py-3.5 px-4 whitespace-nowrap tabular-nums font-bold text-emerald-700">{{ rp(c.total) }}</td>
                <td class="py-3.5 px-4 whitespace-nowrap tabular-nums font-semibold">
                  <template v-if="c.jumlahSetor !== null && c.jumlahSetor !== undefined">
                    {{ rp(c.jumlahSetor) }}
                    <span v-if="c.jumlahSetor !== c.total" class="ml-1 rounded bg-[#FFFAEB] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#B54708]">
                      selisih {{ rp(Math.abs(c.jumlahSetor - c.total)) }}
                    </span>
                  </template>
                  <span v-else class="text-slate-400">&mdash;</span>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span v-if="c.bukti" class="rounded-full bg-[#ECFDF3] px-2.5 py-0.5 text-[11px] font-bold text-[#067647] border border-emerald-200">Sudah Diunggah</span>
                  <span v-else class="rounded-full bg-[#FFFAEB] px-2.5 py-0.5 text-[11px] font-bold text-[#B54708] border border-amber-200">Belum</span>
                </td>
                <td class="py-3.5 px-4 text-slate-600 text-[12.5px] whitespace-nowrap">{{ c.oleh }}</td>
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5">
                    <button type="button" @click="bukaUbah(c)" class="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">Ubah</button>
                    <button type="button" @click="konfirmHapus = c" class="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-[#B42318] hover:bg-red-50">Hapus</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards (< lg: ZERO HORIZONTAL SCROLL) -->
        <div class="block lg:hidden divide-y divide-slate-100">
          <div v-for="c in cutoffs" :key="c.kode" class="p-4 space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-bold text-slate-900 text-[13px] block">{{ c.kode }}</span>
                <span class="text-[11.5px] text-slate-500">{{ c.dari }} s/d {{ c.sampai }}</span>
              </div>
              <span v-if="c.bukti" class="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10.5px] font-bold text-[#067647] border border-emerald-200 shrink-0">
                Bukti Ada
              </span>
              <span v-else class="rounded-full bg-[#FFFAEB] px-2 py-0.5 text-[10.5px] font-bold text-[#B54708] border border-amber-200 shrink-0">
                Belum Bukti
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[12px]">
              <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-[9.5px] font-bold uppercase text-slate-500 block">Total Tunai</span>
                <span class="font-bold text-emerald-700 tabular-nums block mt-0.5">{{ rp(c.total) }}</span>
              </div>
              <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-[9.5px] font-bold uppercase text-slate-500 block">Diserahkan</span>
                <span class="font-bold text-slate-900 tabular-nums block mt-0.5">
                  {{ c.jumlahSetor !== null ? rp(c.jumlahSetor) : '—' }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11.5px] pt-1.5 border-t border-slate-100">
              <span class="text-slate-500">Oleh: {{ c.oleh }} &middot; {{ c.trx }} Trx</span>
              <div class="flex items-center gap-1.5">
                <button type="button" @click="bukaUbah(c)" class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">Ubah</button>
                <button type="button" @click="konfirmHapus = c" class="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-semibold text-[#B42318]">Hapus</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!cutoffs.length" class="px-4 py-10 text-center text-[13px] text-slate-500">
          Belum ada riwayat cut-off pada jenjang ini.
        </div>
      </div>
    </div>

    <!-- Modal Release Cut-off -->
    <div v-if="rilisBuka" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="rilisBuka = false">
      <div class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl shadow-xl">
        <h4 class="text-[16px] font-bold text-slate-900">Release Cut-off &mdash; Serah Dana Tunai</h4>
        <p class="mt-0.5 text-[12.5px] text-slate-500">
          Rentang {{ rentang.label }} &middot; {{ tunaiTerbuka.length }} transaksi tunai &middot; total {{ rp(totalTunaiTerbuka) }}
        </p>

        <div class="mt-4 space-y-3">
          <div>
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Jumlah yang Diserahkan ke Yayasan (Rp)</label>
            <input v-model="rilisJumlah" inputmode="numeric" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13.5px] tabular-nums focus:border-[#1B5FD9] focus:outline-none">
          </div>
          <div>
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Diserahkan Oleh (Petugas Sekolah)</label>
            <input v-model="rilisOleh" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13.5px] focus:border-[#1B5FD9] focus:outline-none">
          </div>
          <label class="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-[13px] text-slate-700 cursor-pointer">
            <input v-model="rilisBukti" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]">
            <span>Bukti pemasukan / serah terima fisik sudah siap</span>
          </label>
        </div>

        <p v-if="angkaRilis !== totalTunaiTerbuka" class="mt-3 rounded-xl bg-[#FFFAEB] p-2.5 text-[12px] font-medium text-[#B54708]">
          Jumlah diserahkan ({{ rp(angkaRilis) }}) berbeda dari total tunai rentang ini ({{ rp(totalTunaiTerbuka) }}) &mdash; selisih {{ rp(Math.abs(angkaRilis - totalTunaiTerbuka)) }} akan tercatat di riwayat.
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="rilisBuka = false" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
          <button type="button" :disabled="sibuk || angkaRilis <= 0" @click="rilis" class="rounded-xl bg-[#067647] px-4 py-2 text-[12.5px] font-bold text-white disabled:opacity-40 hover:bg-[#05603a]">Release &amp; Kunci Transaksi</button>
        </div>
      </div>
    </div>

    <!-- Modal Ubah Cut-off -->
    <div v-if="ubahTarget" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="ubahTarget = null">
      <div class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl shadow-xl">
        <h4 class="text-[16px] font-bold text-slate-900">Ubah Cut-off {{ ubahTarget.kode }}</h4>
        <p class="mt-0.5 text-[12.5px] text-slate-500">
          {{ ubahTarget.dari }} s/d {{ ubahTarget.sampai }} &middot; {{ ubahTarget.trx }} transaksi &middot; {{ rp(ubahTarget.total) }}
        </p>

        <div class="mt-4 space-y-3">
          <div>
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Diserahkan Oleh (Petugas Sekolah)</label>
            <input v-model="ubahOleh" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13.5px] focus:border-[#1B5FD9] focus:outline-none">
          </div>
          <div>
            <label class="mb-1 block text-[12px] font-semibold text-slate-700">Jumlah Diserahkan (Rp)</label>
            <input v-model="ubahJumlah" inputmode="numeric" placeholder="Kosongkan bila belum dicatat" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13.5px] tabular-nums focus:border-[#1B5FD9] focus:outline-none">
          </div>
          <label class="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-[13px] text-slate-700 cursor-pointer">
            <input v-model="ubahBukti" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]">
            <span>Bukti serah ke keuangan pusat sudah diunggah / diterima</span>
          </label>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="ubahTarget = null" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
          <button type="button" :disabled="sibukUbah" @click="simpanUbah" class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-bold text-white disabled:opacity-40 hover:bg-[#154cb0]">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  </div>
</template>
