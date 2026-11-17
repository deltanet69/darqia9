<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKeuangan } from '~/composables/useKeuangan'
import { LABEL_TINGKAT, METODE_BAYAR, rp, type Pembayaran } from '~/composables/keuanganCore'

// Ubah / hapus (soft delete) satu pembayaran. Dipakai Riwayat Pembayaran & Rincian Siswa.
// Transaksi yang sudah cut-off terkunci (ditolak juga oleh database).
const props = defineProps<{ bayar: Pembayaran, mode: 'ubah' | 'hapus' }>()
const emit = defineEmits<{ tutup: [], selesai: [pesan: string] }>()
const K = useKeuangan()

interface BarisItem { keterangan: string, nominal: string, tingkat: number | null }
const ribuan = (v: string | number) => String(v).replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const angka = (v: string) => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0

const tingkat = computed(() => LABEL_TINGKAT[props.bayar.grade])
const items = ref<BarisItem[]>((props.bayar.items?.length ? props.bayar.items : [{ keterangan: props.bayar.keterangan, nominal: props.bayar.nominal, tingkat: props.bayar.tingkat }])
  .map(i => ({ keterangan: i.keterangan, nominal: ribuan(i.nominal), tingkat: i.tingkat ?? null })))
const metode = ref(props.bayar.metode)
const tanggal = ref(props.bayar.tanggalISO)
const noInvoice = ref(props.bayar.noInvoice || '')
const alasan = ref('')
const sibuk = ref(false)
const galat = ref('')
const total = computed(() => items.value.reduce((a, i) => a + angka(i.nominal), 0))

const simpan = async () => {
  galat.value = ''
  if (items.value.some(i => !i.keterangan.trim() || angka(i.nominal) <= 0)) { galat.value = 'Setiap baris wajib diisi nama & nominal di atas 0 (atau hapus barisnya).'; return }
  if (items.value.some(i => i.tingkat === null)) { galat.value = 'Pilih tingkat untuk setiap baris.'; return }
  sibuk.value = true
  try {
    await K.ubahBayar(props.bayar, {
      items: items.value.map(i => ({ keterangan: i.keterangan.trim(), nominal: angka(i.nominal), tingkat: i.tingkat })),
      metode: metode.value, tanggalISO: tanggal.value, noInvoice: noInvoice.value
    })
    emit('selesai', `Pembayaran ${props.bayar.no} diperbarui. Total Dibayar & sisa tagihan siswa dihitung ulang.`)
  } catch (e: any) { galat.value = e?.message || 'Pembayaran gagal diperbarui.' } finally { sibuk.value = false }
}

const hapus = async () => {
  galat.value = ''
  sibuk.value = true
  try {
    await K.hapusBayar(props.bayar, alasan.value)
    emit('selesai', `Pembayaran ${props.bayar.no} dihapus (soft delete) — tersimpan di arsip dengan alasannya, tidak lagi dihitung.`)
  } catch (e: any) { galat.value = e?.message || 'Pembayaran gagal dihapus.' } finally { sibuk.value = false }
}
</script>

<template>
  <div class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="emit('tutup')">
    <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
      <!-- SOFT DELETE: peringatan tegas -->
      <template v-if="mode === 'hapus'">
        <div class="rounded-xl border-2 border-red-300 bg-red-50 p-4">
          <h4 class="text-[16px] font-extrabold text-[#B42318]">PERINGATAN: Hapus Pembayaran</h4>
          <p class="mt-1.5 text-[12.5px] leading-relaxed text-red-900">
            Pembayaran <b>{{ bayar.no }}</b> senilai <b>{{ rp(bayar.nominal) }}</b> akan dihapus dari pembukuan.
            <b>Total Dibayar siswa berkurang dan sisa tagihan naik</b>, dan invoice yang sudah dicetak/dikirim ke wali menjadi tidak sesuai.
            Data tetap tersimpan di arsip (siapa & alasannya), tetapi <b>tidak bisa dipulihkan dari layar ini</b>.
          </p>
        </div>
        <label class="mt-4 mb-1 block text-[12px] font-semibold text-slate-700">Alasan penghapusan (wajib)</label>
        <textarea v-model="alasan" rows="3" placeholder="cth: salah input nominal, dobel input..." class="w-full rounded-xl border border-slate-300 px-3 py-2 text-[13px] focus:border-red-400 focus:outline-none" />
        <p v-if="galat" class="mt-2 text-[12px] font-semibold text-[#B42318]">{{ galat }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50" @click="emit('tutup')">Batal</button>
          <button type="button" :disabled="sibuk || alasan.trim().length < 5" class="rounded-xl bg-[#B42318] px-4 py-2 text-[12.5px] font-bold text-white hover:bg-[#912018] disabled:opacity-40" @click="hapus">
            {{ sibuk ? 'Menghapus…' : 'Ya, Hapus Pembayaran' }}
          </button>
        </div>
      </template>

      <!-- UBAH -->
      <template v-else>
        <h4 class="text-[16px] font-bold text-slate-900">Ubah Pembayaran</h4>
        <p class="mt-0.5 text-[12.5px] text-slate-500">No. Kwitansi {{ bayar.no }} (otomatis, tidak berubah). Total dibayar siswa dihitung ulang setelah disimpan.</p>

        <div class="mt-4 space-y-2.5">
          <div v-for="(it, i) in items" :key="i" class="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <input v-model="it.keterangan" placeholder="Jenis (cth: SPP)" class="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px]">
            <button v-if="items.length > 1" type="button" class="text-[11.5px] font-semibold text-rose-600 hover:underline" @click="items.splice(i, 1)">Hapus</button>
            <select v-model="it.tingkat" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px]">
              <option :value="null" disabled>Pilih tingkat…</option>
              <option v-for="(l, t) in tingkat" :key="t" :value="t">{{ l }}</option>
            </select>
            <input :value="it.nominal" inputmode="numeric" placeholder="Nominal" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] tabular-nums" @input="it.nominal = ribuan(($event.target as HTMLInputElement).value)">
          </div>
          <button type="button" class="w-full rounded-xl border border-dashed border-slate-300 py-2 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50" @click="items.push({ keterangan: '', nominal: '', tingkat: null })">+ Tambah Keterangan</button>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">No. Invoice Pembukuan (opsional)</label>
            <input v-model="noInvoice" placeholder="cth: 01/01/12/2026" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]">
          </div>
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Metode</label>
            <select v-model="metode" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px]">
              <option v-for="m in METODE_BAYAR" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-600">Tanggal Bayar</label>
            <input v-model="tanggal" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px]">
          </div>
        </div>

        <p class="mt-3 text-[12.5px] text-slate-600">Total baru: <b class="tabular-nums text-emerald-700">{{ rp(total) }}</b></p>
        <p v-if="galat" class="mt-2 text-[12px] font-semibold text-[#B42318]">{{ galat }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50" @click="emit('tutup')">Batal</button>
          <button type="button" :disabled="sibuk" class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-bold text-white hover:bg-[#154cb0] disabled:opacity-50" @click="simpan">{{ sibuk ? 'Menyimpan…' : 'Simpan Perubahan' }}</button>
        </div>
      </template>
    </div>
  </div>
</template>
