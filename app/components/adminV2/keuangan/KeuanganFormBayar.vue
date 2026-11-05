<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKeuangan } from '~/composables/useKeuangan'
import { METODE_BAYAR, rp, type BarisSiswa, type ItemBayar, type Pembayaran } from '~/composables/keuanganCore'

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
  <div class="rounded-xl border border-slate-300 bg-white p-4">
    <p class="text-[14.5px] font-semibold text-slate-800">Input Pembayaran</p>
    <p class="mt-0.5 text-[12.5px] text-slate-500">Pembayaran menempel ke siswa &amp; mengalir otomatis (waterfall) menutup tagihan tingkat terlama dulu. Kelebihan menjadi saldo tingkat berikutnya.</p>

    <div class="mt-3 grid gap-2">
      <div v-for="(b, i) in items" :key="i" class="flex items-start gap-2">
        <div class="min-w-0 flex-1">
          <label v-if="i === 0" class="mb-1 block text-[12px] font-medium text-slate-500">Keterangan Bayar</label>
          <input v-model="b.keterangan" list="daftar-keterangan-master" placeholder="Pilih atau ketik keterangan..." class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] outline-none focus:border-[#1B5FD9]">
        </div>
        <div class="w-[130px] shrink-0">
          <label v-if="i === 0" class="mb-1 block text-[12px] font-medium text-slate-500">Nominal (Rp)</label>
          <input v-model="b.nominal" inputmode="numeric" placeholder="500000" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] tabular-nums outline-none focus:border-[#1B5FD9]">
        </div>
        <button type="button" :disabled="items.length <= 1" :class="i === 0 ? 'mt-[26px]' : 'mt-[2px]'" class="shrink-0 rounded-lg bg-white px-2.5 py-2 text-[13px] font-semibold text-[#B42318] ring-1 ring-red-200 disabled:opacity-30" @click="hapusItem(i)" title="Hapus baris">&times;</button>
      </div>
      <datalist id="daftar-keterangan-master">
        <option v-for="k in K.state.value.keterangan" :key="k" :value="k" />
      </datalist>
      <button type="button" class="justify-self-start rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-[#1B5FD9] ring-1 ring-slate-300 hover:bg-slate-50" @click="tambahItem">+ Tambah Keterangan</button>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Metode</label>
        <select v-model="metode" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"><option v-for="m in METODE_BAYAR" :key="m">{{ m }}</option></select></div>
      <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Tanggal Bayar</label>
        <input v-model="tanggal" type="date" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
    </div>

    <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-600">
      <div class="flex items-center justify-between"><span>Total pembayaran ini</span><b class="tabular-nums text-slate-800">{{ rp(total) }}</b></div>
      <div class="mt-1 flex items-center justify-between"><span>Sisa tagihan sekarang</span><b class="tabular-nums text-[#B42318]">{{ rp(siswa.hitung.sisa) }}</b></div>
      <div class="mt-1 flex items-center justify-between border-t border-slate-200 pt-1.5">
        <span>Setelah pembayaran ini</span>
        <b v-if="saldoSetelah > 0" class="tabular-nums text-[#067647]">Lunas + saldo {{ rp(saldoSetelah) }}</b>
        <b v-else class="tabular-nums" :class="sisaSetelah > 0 ? 'text-[#B42318]' : 'text-[#067647]'">{{ sisaSetelah > 0 ? 'Sisa ' + rp(sisaSetelah) : 'Lunas' }}</b>
      </div>
      <p v-if="siswa.hitung.saldo > 0" class="mt-1.5 text-[12px] text-[#067647]">Siswa ini sudah punya saldo {{ rp(siswa.hitung.saldo) }} dari pembayaran sebelumnya — saldo ikut menutup tagihan.</p>
    </div>

    <p v-if="galat" class="mt-2 rounded-lg bg-[#FEF3F2] px-3 py-2 text-[12.5px] font-medium text-[#B42318]">{{ galat }}</p>
    <button type="button" :disabled="!bisa || sibuk" class="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40" @click="simpan">Simpan Pembayaran</button>
    <p class="mt-2 text-[12px] text-slate-400">Nomor kwitansi dibuat otomatis. Keterangan baru yang diketik manual otomatis masuk daftar pilihan berikutnya.</p>
  </div>
</template>
