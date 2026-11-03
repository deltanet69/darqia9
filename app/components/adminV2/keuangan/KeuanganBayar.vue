<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKeuangan } from '~/composables/useKeuangan'
import { LABEL_TINGKAT, METODE_BAYAR, rp, type BarisSiswa, type Pembayaran } from '~/composables/keuanganCore'

const props = defineProps<{ siswa: BarisSiswa, tingkatAwal: number }>()
const emit = defineEmits<{ tutup: [], tersimpan: [b: Pembayaran] }>()
const K = useKeuangan()

const tingkat = ref(props.tingkatAwal)
const nominal = ref('')
const keterangan = ref(K.state.value.keterangan[0] || 'SPP')
const metode = ref<Pembayaran['metode']>('Tunai')
const tanggal = ref(new Date().toISOString().slice(0, 10))
const sibuk = ref(false)
const galat = ref('')

watch(() => props.tingkatAwal, v => { tingkat.value = v })

const sisaTingkat = computed(() => props.siswa.hitung.per[tingkat.value]?.sisa || 0)
const angka = computed(() => Math.max(0, parseInt(nominal.value.replace(/[^0-9]/g, ''), 10) || 0))
const bisa = computed(() => angka.value > 0 && angka.value <= sisaTingkat.value)

const simpan = async () => {
  galat.value = ''
  if (angka.value <= 0) { galat.value = 'Nominal pembayaran harus lebih dari 0.'; return }
  if (angka.value > sisaTingkat.value) { galat.value = `Nominal melebihi sisa tagihan tingkat ini (${rp(sisaTingkat.value)}). Kelebihan tidak diperbolehkan agar pembukuan tidak selisih.`; return }
  sibuk.value = true
  try {
    const b = await K.simpanBayar({ grade: props.siswa.grade, nis: props.siswa.nis, tingkat: tingkat.value, nominal: angka.value, keterangan: keterangan.value, metode: metode.value, petugas: 'Anis Azyzy, S.T', tanggalISO: tanggal.value })
    emit('tersimpan', b)
  } catch (e: any) {
    galat.value = e?.message || 'Pembayaran gagal disimpan.'
  } finally { sibuk.value = false }
}
</script>

<template>
  <div class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="emit('tutup')">
    <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
      <p class="text-[16px] font-semibold text-slate-900">Input Pembayaran Siswa</p>
      <p class="mt-0.5 text-[13px] text-slate-500">{{ siswa.nama }} &middot; NIS {{ siswa.nis }} &middot; {{ siswa.kelas }}</p>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Untuk Tingkat</label>
          <select v-model.number="tingkat" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"><option v-for="(l, i) in LABEL_TINGKAT[siswa.grade]" :key="i" :value="i">{{ l }} (sisa {{ rp(siswa.hitung.per[i].sisa) }})</option></select></div>
        <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Tanggal Bayar</label><input v-model="tanggal" type="date" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
        <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Nominal Bayar (Rp)</label><input v-model="nominal" inputmode="numeric" placeholder="cth: 500000" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
        <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Keterangan Bayar</label>
          <select v-model="keterangan" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"><option v-for="k in K.state.value.keterangan" :key="k">{{ k }}</option></select></div>
        <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Metode Pembayaran</label>
          <select v-model="metode" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"><option v-for="m in METODE_BAYAR" :key="m">{{ m }}</option></select></div>
        <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Petugas / Teller</label><input value="Anis Azyzy, S.T" disabled class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-[13.5px]"></div>
      </div>
      <p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">Sisa tagihan tingkat ini: <b>{{ rp(sisaTingkat) }}</b>. Nomor kwitansi dibuat otomatis oleh sistem dan pembayaran langsung tercatat di Riwayat Pembayaran.</p>
      <p v-if="galat" class="mt-2 rounded-lg bg-[#FEF3F2] px-3 py-2 text-[12.5px] font-medium text-[#B42318]">{{ galat }}</p>
      <div class="mt-5 flex justify-end gap-2">
        <button type="button" @click="emit('tutup')" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
        <button type="button" :disabled="!bisa || sibuk" @click="simpan" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Simpan Pembayaran</button>
      </div>
    </div>
  </div>
</template>
