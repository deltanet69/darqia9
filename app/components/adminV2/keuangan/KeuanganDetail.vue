<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import {
  LABEL_TINGKAT, inisialNama, persenTeks, rp,
  type Pembayaran
} from '~/composables/keuanganCore'
import KeuanganBayar from './KeuanganBayar.vue'
import KeuanganCetak from './KeuanganCetak.vue'

const props = defineProps<{ nis: string }>()
const emit = defineEmits<{ kembali: [] }>()
const grade = useAdminGrade()
const K = useKeuangan()

const bayarUntuk = ref<number | null>(null)
const cetak = ref<null | { jenis: 'wa' | 'surat' | 'kwitansi', bayar?: Pembayaran | null }>(null)
const tambahanUntuk = ref<number | null>(null)
const namaBiaya = ref('')
const nominalBiaya = ref('')
const riwayat = ref<Pembayaran[]>([])
const notif = ref('')

onMounted(async () => {
  await K.muatSemua(grade.value)
  riwayat.value = await K.muatBayarSiswa(grade.value, props.nis)
})

const siswa = computed(() => K.siswaSatu(grade.value, props.nis))
const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3400) }

const setelahBayar = async (b: Pembayaran) => {
  bayarUntuk.value = null
  riwayat.value = await K.muatBayarSiswa(grade.value, props.nis)
  cetak.value = { jenis: 'kwitansi', bayar: b }
  tampilNotif(`Pembayaran ${b.no} tersimpan. Total Dibayar & sisa siswa ini sudah dihitung ulang dari riwayat.`)
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
  <div>
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{{ notif }}</div>
    <button type="button" @click="emit('kembali')" class="text-[13px] font-semibold text-[#1B5FD9]">&larr; Kembali ke Data Keuangan</button>

    <div v-if="!siswa" class="mt-3 rounded-xl border border-slate-300 bg-white p-6 text-center">
      <b class="text-[14px] text-slate-700">Siswa tidak ditemukan</b>
      <p class="mt-1 text-[13px] text-slate-500">NIS {{ nis }} tidak ada pada jenjang {{ grade }}. Pastikan jenjang di kanan atas sudah benar.</p>
    </div>

    <template v-else>
      <div class="mt-3 rounded-xl border border-slate-300 bg-white p-4">
        <div class="flex flex-wrap items-start gap-3.5">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[17px] font-bold" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(siswa.nama) }}</span>
          <div class="min-w-[220px] flex-1">
            <p class="text-[16px] font-semibold text-blue-950">{{ siswa.nama }}</p>
            <p class="mt-0.5 text-[13px] text-slate-500">NIS <b :class="grade === 'SMP' ? 'text-[#067647]' : 'text-[#1B5FD9]'">{{ siswa.nis }}</b> &middot; NISN {{ siswa.nisn }} &middot; Kelas {{ siswa.kelas }} &middot; Angkatan {{ siswa.angkatan }} &middot; {{ siswa.status }}</p>
            <p class="mt-0.5 text-[13px] text-slate-500">Kode Keuangan: <b class="text-[#1B5FD9]">{{ siswa.kode || 'Belum dipasang' }}</b> &middot; WA Wali: {{ siswa.hpWali || '—' }}</p>
            <p class="mt-2">
              <span v-if="siswa.statusBayar === 'Lunas'" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas</span>
              <span v-else-if="siswa.statusBayar === 'Kurang'" class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Kurang</span>
              <span v-else class="rounded bg-[#FEF3F2] px-2 py-1 text-[11px] font-semibold text-[#B42318]">Belum Bayar</span>
              <span class="ml-2 text-[13px] text-slate-500">Sisa tagihan <b class="text-[#B42318]">{{ rp(siswa.hitung.sisa) }}</b> dari total {{ rp(siswa.hitung.total) }}</span>
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <button type="button" :disabled="!siswa.kode || siswa.hitung.sisa <= 0" @click="bayarUntuk = siswa.hitung.per.findIndex(v => v.sisa > 0)" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Input Pembayaran</button>
            <button type="button" @click="cetak = { jenis: 'wa' }" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Kirim Notifikasi ke Wali</button>
            <button type="button" @click="cetak = { jenis: 'surat' }" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Cetak Surat Tagihan</button>
          </div>
        </div>
        <p v-if="!siswa.kode" class="mt-3 rounded-lg bg-[#FFFAEB] px-3 py-2 text-[12.5px] font-medium text-[#B54708]">Siswa ini belum dipasang Kode Keuangan — tagihannya masih kosong. Pasang kode lewat tab Data Keuangan dulu, baru pembayaran bisa diinput.</p>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-2">
        <p class="text-[15px] font-semibold text-slate-800">Rincian Tagihan &amp; Pembayaran</p>
        <span class="text-[12.5px] text-slate-500">Nominal Master berasal dari Kode Keuangan — tidak diketik manual per siswa.</span>
      </div>
      <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:130px 1fr 1fr 1fr 1fr 1fr 150px 90px">
          <span>Tingkat</span><span>Nominal Master</span><span>Nominal Tambahan</span><span>Total Tagihan</span><span>Total Dibayar</span><span>Sisa Tagihan</span><span>Progress</span><span />
        </div>
        <div v-for="(v, t) in siswa.hitung.per" :key="t" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[130px_1fr_1fr_1fr_1fr_1fr_150px_90px]">
          <b class="font-semibold text-slate-800">{{ LABEL_TINGKAT[grade][t] }}</b>
          <span v-if="v.master > 0" class="tabular-nums">{{ rp(v.master) }}</span>
          <span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum Diset</span>
          <span><span class="tabular-nums">{{ rp(v.tambahan) }}</span> <button type="button" @click="tambahanUntuk = t" class="ml-1 rounded-lg bg-white px-2 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-300">+ Biaya</button></span>
          <b class="tabular-nums">{{ rp(v.total) }}</b>
          <span class="tabular-nums font-semibold text-[#067647]">{{ rp(v.bayar) }}</span>
          <span class="tabular-nums font-semibold text-[#B42318]">{{ rp(v.sisa) }}</span>
          <span class="flex items-center gap-2"><span class="h-2 w-16 overflow-hidden rounded-full bg-slate-200"><span class="block h-full rounded-full" :class="v.persen >= 100 ? 'bg-[#067647]' : 'bg-[#1B5FD9]'" :style="{ width: v.persen + '%' }" /></span><span class="text-[12px] text-slate-500">{{ persenTeks(v.persen) }}</span></span>
          <span v-if="v.sisa > 0"><button type="button" @click="bayarUntuk = t" class="rounded-xl bg-blue-600 px-3.5 py-2 text-[13px] font-medium text-white">Bayar</button></span>
          <span v-else class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas</span>
        </div>
        <div class="grid grid-cols-2 items-center gap-x-3 border-t border-slate-200 bg-slate-50 px-4 py-3 font-semibold lg:grid-cols-[130px_1fr_1fr_1fr_1fr_1fr_150px_90px]">
          <span>TOTAL</span><span /><span /><span class="tabular-nums">{{ rp(siswa.hitung.total) }}</span><span class="tabular-nums text-[#067647]">{{ rp(siswa.hitung.bayar) }}</span><span class="tabular-nums text-[#B42318]">{{ rp(siswa.hitung.sisa) }}</span>
          <span class="col-span-2 lg:col-span-1"><span v-if="siswa.hitung.sisa <= 0" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas 100%</span><span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Terbayar {{ persenTeks(siswa.hitung.persen) }}</span></span><span />
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-2">
        <p class="text-[15px] font-semibold text-slate-800">Riwayat Transaksi Siswa Ini</p>
        <span class="text-[12.5px] text-slate-500">Total Dibayar di atas selalu dihitung dari daftar ini.</span>
      </div>
      <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div v-for="b in riwayat" :key="b.no" class="flex flex-wrap items-center gap-3 border-t border-slate-200 px-4 py-3 first:border-t-0">
          <span class="min-w-0 flex-1">
            <b class="text-[13.5px] font-medium text-slate-800">{{ b.keterangan }} ({{ LABEL_TINGKAT[grade][b.tingkat] }})</b>
            <span class="block text-[12.5px] text-slate-500">No. Kwitansi: {{ b.no }} &middot; {{ b.tanggal }} &middot; {{ b.metode }} &middot; Petugas: {{ b.petugas }}<template v-if="b.cutoff"> &middot; <span class="font-semibold text-[#B54708]">Sudah cut-off ({{ b.cutoff }}) — terkunci</span></template></span>
          </span>
          <b class="tabular-nums text-[#067647]">{{ rp(b.nominal) }}</b>
          <button type="button" @click="cetak = { jenis: 'kwitansi', bayar: b }" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300">Cetak Kwitansi</button>
        </div>
        <div v-if="!riwayat.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Belum ada pembayaran</b><p class="mt-1 text-[13px] text-slate-500">Belum ada pembayaran tercatat untuk siswa ini.</p></div>
      </div>
    </template>

    <KeuanganBayar v-if="bayarUntuk !== null && siswa" :siswa="siswa" :tingkat-awal="bayarUntuk" @tutup="bayarUntuk = null" @tersimpan="setelahBayar" />
    <KeuanganCetak v-if="cetak && siswa" :jenis="cetak.jenis" :siswa="siswa" :bayar="cetak.bayar" @tutup="cetak = null" />

    <div v-if="tambahanUntuk !== null && siswa" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="tambahanUntuk = null">
      <div class="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p class="text-[16px] font-semibold text-slate-900">Tambah Biaya — {{ LABEL_TINGKAT[grade][tambahanUntuk] }}</p>
        <p class="mt-0.5 text-[13px] text-slate-500">Berlaku untuk {{ siswa.nama }} saja (biaya khusus per siswa), tidak mengubah paket {{ siswa.kode }} untuk siswa lain.</p>
        <div class="mt-4 grid gap-3">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Nama Biaya</label><input v-model="namaBiaya" placeholder="cth: Kegiatan Tambahan" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Nominal (Rp)</label><input v-model="nominalBiaya" inputmode="numeric" placeholder="cth: 150000" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
        </div>
        <p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">Nominal Tambahan tingkat ini saat ini {{ rp(siswa.hitung.per[tambahanUntuk].tambahan) }} — nominal baru akan ditambahkan ke angka itu.</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="tambahanUntuk = null" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
          <button type="button" @click="simpanTambahan" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Simpan Biaya Tambahan</button>
        </div>
      </div>
    </div>
  </div>
</template>
