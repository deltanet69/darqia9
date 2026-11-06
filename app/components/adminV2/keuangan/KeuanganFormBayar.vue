<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKeuangan } from '~/composables/useKeuangan'
import { METODE_BAYAR, rp, type BarisSiswa, type ItemBayar, type Pembayaran } from '~/composables/keuanganCore'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'

// Form Input Pembayaran NEMPEL di halaman (bukan popup) — hasil meeting
// manajemen 4 Nov 2026:
// - Pembayaran menempel ke SISWA (waterfall): tidak ada pilihan tingkat;
//   alokasi menutup tagihan berurutan & kelebihan menjadi saldo.
// - Keterangan berbentuk LIST: satu pembayaran bisa banyak keterangan,
//   tiap baris combobox (pilih dari master atau ketik manual) + nominal.
const props = defineProps<{ siswa: BarisSiswa }>()
const emit = defineEmits<{ tersimpan: [b: Pembayaran] }>()
const K = useKeuangan()

interface BarisItem { keterangan: string, nominal: string }
const items = ref<BarisItem[]>([{ keterangan: 'SPP', nominal: '' }])
const metode = ref<Pembayaran['metode']>('Tunai')
const tanggal = ref(new Date().toISOString().slice(0, 10))
const sibuk = ref(false)
const galat = ref('')

const formatRibuan = (val: string) => {
  const digits = val.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const onNominalInput = (b: BarisItem, evt: Event) => {
  const target = evt.target as HTMLInputElement
  b.nominal = formatRibuan(target.value)
}

const angkaItem = (b: BarisItem) => Math.max(0, parseInt(b.nominal.replace(/[^0-9]/g, ''), 10) || 0)
const total = computed(() => items.value.reduce((a, b) => a + angkaItem(b), 0))
const itemValid = computed(() => items.value.filter(b => b.keterangan.trim() && angkaItem(b) > 0))
const sisaSetelah = computed(() => Math.max(0, props.siswa.hitung.sisa - total.value))
const saldoSetelah = computed(() => Math.max(0, props.siswa.hitung.saldo + total.value - props.siswa.hitung.sisa))
const bisa = computed(() => !!props.siswa.kode && total.value > 0 && itemValid.value.length === items.value.length)

const tambahItem = () => items.value.push({ keterangan: '', nominal: '' })
const hapusItem = (i: number) => { if (items.value.length > 1) items.value.splice(i, 1) }

const simpan = async () => {
  galat.value = ''
  if (!props.siswa.kode) { galat.value = 'Siswa ini belum dipasang Kode Keuangan — pasang dulu lewat tab Data Keuangan.'; return }
  if (!itemValid.value.length || itemValid.value.length !== items.value.length) { galat.value = 'Setiap baris keterangan wajib diisi nama & nominal di atas 0 (atau hapus barisnya).'; return }
  sibuk.value = true
  try {
    const daftar: ItemBayar[] = itemValid.value.map(b => ({ keterangan: b.keterangan.trim(), nominal: angkaItem(b) }))
    const b = await K.simpanBayar({ grade: props.siswa.grade, nis: props.siswa.nis, nominal: total.value, items: daftar, metode: metode.value, petugas: 'Anis Azyzy, S.T', tanggalISO: tanggal.value })
    items.value = [{ keterangan: 'SPP', nominal: '' }]
    emit('tersimpan', b)
  } catch (e: any) {
    galat.value = e?.message || 'Pembayaran gagal disimpan.'
  } finally { sibuk.value = false }
}
</script>

<template>
  <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
    <div class="border-b border-slate-100 pb-3.5 flex items-start justify-between gap-2">
      <div>
        <h3 class="text-[16px] font-bold text-slate-900">Input Pembayaran</h3>
        <p class="mt-0.5 text-[12px] leading-relaxed text-slate-500">
          Pembayaran menempel ke siswa &amp; otomatis mengalir (waterfall) menutup tagihan terlama.
        </p>
      </div>
      <span class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B5FD9] shrink-0">
        <AdminV2Icon name="plus" :size="16" />
      </span>
    </div>

    <!-- Daftar Item Pembayaran -->
    <div class="mt-4 space-y-3">
      <div
        v-for="(b, i) in items"
        :key="i"
        class="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition-colors focus-within:border-blue-300 focus-within:bg-blue-50/20"
      >
        <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2.5">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Keterangan Item {{ i + 1 }}
          </span>
          <button
            v-if="items.length > 1"
            type="button"
            class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
            @click="hapusItem(i)"
          >
            Hapus Item
          </button>
        </div>

        <div class="space-y-2.5">
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Nama Pembayaran</label>
            <input
              :value="b.keterangan"
              @input="b.keterangan = ($event.target as HTMLInputElement).value"
              list="daftar-keterangan-master"
              placeholder="Pilih atau ketik (cth: SPP)..."
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/15"
            >
          </div>

          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Nominal (Rp)</label>
            <div class="relative">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">
                Rp
              </span>
              <input
                :value="b.nominal"
                @input="onNominalInput(b, $event)"
                inputmode="numeric"
                placeholder="500.000"
                class="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-[13.5px] font-bold tabular-nums text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#1B5FD9] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]/15"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tombol Tambah Item Pembayaran -->
    <button
      type="button"
      @click="tambahItem"
      class="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-2.5 text-[12.5px] font-semibold text-slate-700 hover:border-[#1B5FD9] hover:bg-blue-50/30 hover:text-[#1B5FD9] transition-all cursor-pointer"
    >
      <span>+ Tambah Keterangan Lain</span>
    </button>

    <datalist id="daftar-keterangan-master">
      <option v-for="k in K.state.value.keterangan" :key="k" :value="k" />
    </datalist>

    <!-- Metode Pembayaran & Tanggal Bayar -->
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
      <div>
        <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Metode Pembayaran</label>
        <select
          v-model="metode"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-800 focus:border-[#1B5FD9] focus:outline-none"
        >
          <option v-for="m in METODE_BAYAR" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Tanggal Bayar</label>
        <input
          v-model="tanggal"
          type="date"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-800 focus:border-[#1B5FD9] focus:outline-none"
        >
      </div>
    </div>

    <!-- Kotak Ringkasan Transaksi Real-time -->
    <div class="mt-4 space-y-2 rounded-xl bg-slate-50 p-3.5 text-[12px] border border-slate-200/60">
      <div class="flex items-center justify-between text-slate-600">
        <span>Total Pembayaran Masuk:</span>
        <b class="text-[14px] font-black text-emerald-700 tabular-nums">{{ rp(total) }}</b>
      </div>
      <div class="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-2">
        <span>Sisa Tagihan Saat Ini:</span>
        <span class="font-bold text-rose-700 tabular-nums">{{ rp(props.siswa.hitung.sisa) }}</span>
      </div>
      <div class="flex items-center justify-between text-slate-700 border-t border-slate-200/60 pt-2">
        <span>Sisa Setelah Pembayaran:</span>
        <b class="font-bold text-slate-900 tabular-nums">{{ rp(sisaSetelah) }}</b>
      </div>
      <div v-if="saldoSetelah > 0" class="flex items-center justify-between text-emerald-800 border-t border-emerald-200 pt-2">
        <span>Kelebihan Jadi Saldo:</span>
        <b class="font-bold text-emerald-700 tabular-nums">{{ rp(saldoSetelah) }}</b>
      </div>
    </div>

    <!-- Alert Kesalahan jika ada -->
    <div v-if="galat" class="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[12px] text-rose-700">
      {{ galat }}
    </div>

    <!-- Tombol Simpan Pembayaran Utama -->
    <div class="mt-4">
      <button
        type="button"
        :disabled="!bisa || sibuk"
        @click="simpan"
        class="w-full rounded-xl bg-[#1B5FD9] py-3 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(27,95,217,0.25)] hover:bg-[#154cb0] disabled:opacity-40 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>{{ sibuk ? 'Memproses Transaksi...' : 'Simpan Pembayaran' }}</span>
      </button>
      <p class="mt-2 text-center text-[11px] text-slate-400">
        Nomor kwitansi terbit otomatis &middot; Riwayat tersimpan permanen
      </p>
    </div>
  </div>
</template>
