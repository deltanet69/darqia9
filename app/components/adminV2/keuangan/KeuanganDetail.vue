<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import {
  LABEL_TINGKAT, formatTanggal, inisialNama, persenTeks, rp,
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
  <div>
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{{ notif }}</div>
    <button type="button" @click="emit('kembali')" class="text-[13px] font-semibold text-[#1B5FD9]">&larr; Kembali ke Data Keuangan</button>

    <div v-if="!siswa" class="mt-3 rounded-xl border border-slate-300 bg-white p-6 text-center">
      <b class="text-[14px] text-slate-700">Siswa tidak ditemukan</b>
      <p class="mt-1 text-[13px] text-slate-500">NIS {{ nis }} tidak ada pada jenjang {{ grade }}. Pastikan jenjang di kanan atas sudah benar.</p>
    </div>

    <div v-else class="mt-3 grid items-start gap-3 xl:grid-cols-[400px_1fr]">
      <!-- ===== KOLOM KIRI: kartu siswa + form pembayaran ===== -->
      <div class="grid gap-3">
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <div class="flex items-start gap-3.5">
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[17px] font-bold" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(siswa.nama) }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-[16px] font-semibold text-blue-950">{{ siswa.nama }}</p>
              <p class="mt-0.5 text-[13px] text-slate-500">NIS <b :class="grade === 'SMP' ? 'text-[#067647]' : 'text-[#1B5FD9]'">{{ siswa.nis }}</b> &middot; NISN {{ siswa.nisn }}</p>
              <p class="mt-0.5 text-[13px] text-slate-500">Kelas {{ siswa.kelas }} &middot; Angkatan {{ siswa.angkatan }} &middot; {{ siswa.status }}</p>
              <p class="mt-0.5 text-[13px] text-slate-500">Kode Keuangan: <b class="text-[#1B5FD9]">{{ siswa.kode || 'Belum dipasang' }}</b> &middot; WA Wali: {{ siswa.hpWali || '—' }}</p>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span v-if="siswa.statusBayar === 'Lunas'" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas</span>
            <span v-else-if="siswa.statusBayar === 'Kurang'" class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Kurang</span>
            <span v-else class="rounded bg-[#FEF3F2] px-2 py-1 text-[11px] font-semibold text-[#B42318]">Belum Bayar</span>
            <span class="text-[13px] text-slate-500">Sisa <b class="text-[#B42318]">{{ rp(siswa.hitung.sisa) }}</b> dari {{ rp(siswa.hitung.total) }}</span>
          </div>
          <p v-if="siswa.hitung.saldo > 0" class="mt-2.5 rounded-lg bg-[#ECFDF3] px-3 py-2 text-[12.5px] font-medium text-[#067647]">Saldo siswa: <b>{{ rp(siswa.hitung.saldo) }}</b> — kelebihan pembayaran yang siap menutup tagihan tingkat berikutnya begitu tagihan itu di-Release.</p>
          <p v-if="!siswa.kode" class="mt-2.5 rounded-lg bg-[#FFFAEB] px-3 py-2 text-[12.5px] font-medium text-[#B54708]">Siswa ini belum dipasang Kode Keuangan — tagihannya masih kosong. Pasang kode lewat tab Data Keuangan dulu, baru pembayaran bisa diinput.</p>
          <div class="mt-3">
            <button type="button" @click="cetak = { jenis: 'surat' }" class="w-full rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Cetak Surat Tagihan</button>
          </div>
        </div>

        <KeuanganFormBayar :siswa="siswa" @tersimpan="setelahBayar" />
      </div>

      <!-- ===== KOLOM KANAN: rincian tagihan + riwayat ===== -->
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-[15px] font-semibold text-slate-800">Rincian Tagihan &amp; Pembayaran</p>
          <span class="text-[12.5px] text-slate-500">Nominal Master berasal dari Kode Keuangan — tidak diketik manual per siswa. Alokasi pembayaran mengikuti waterfall.</span>
        </div>
        <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
          <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:120px 1fr 1fr 1fr 1fr 1fr 140px 130px">
            <span>Tingkat</span><span>Nominal Master</span><span>Nominal Tambahan</span><span>Total Tagihan</span><span>Total Dibayar</span><span>Sisa Tagihan</span><span>Progress</span><span>Rilis Tagihan</span>
          </div>
          <div v-for="(v, t) in siswa.hitung.per" :key="t" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[120px_1fr_1fr_1fr_1fr_1fr_140px_130px]">
            <b class="font-semibold text-slate-800">{{ LABEL_TINGKAT[grade][t] }}</b>
            <span v-if="v.master > 0" class="tabular-nums">{{ rp(v.master) }}</span>
            <span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum Diset</span>
            <span><span class="tabular-nums">{{ rp(v.tambahan) }}</span> <button type="button" @click="tambahanUntuk = t" class="ml-1 rounded-lg bg-white px-2 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-300">+ Biaya</button></span>
            <b class="tabular-nums">{{ rp(v.total) }}</b>
            <span class="tabular-nums font-semibold text-[#067647]">{{ rp(v.bayar) }}</span>
            <span class="tabular-nums font-semibold text-[#B42318]">{{ rp(v.sisa) }}</span>
            <span class="flex items-center gap-2"><span class="h-2 w-14 overflow-hidden rounded-full bg-slate-200"><span class="block h-full rounded-full" :class="v.persen >= 100 ? 'bg-[#067647]' : 'bg-[#1B5FD9]'" :style="{ width: v.persen + '%' }" /></span><span class="text-[12px] text-slate-500">{{ persenTeks(v.persen) }}</span></span>
            <span>
              <span v-if="K.sudahDirilis(siswa.nis, t)" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Dirilis {{ formatTanggal(String(K.sudahDirilis(siswa.nis, t)?.pada || '').slice(0, 10)) }}</span>
              <button v-else-if="v.total > 0" type="button" :disabled="sibukRilis === t" class="rounded-lg bg-[#1B5FD9] px-2.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40" @click="rilis(t)">Release Tagihan</button>
              <span v-else class="text-[12px] text-slate-400">—</span>
            </span>
          </div>
          <div class="grid grid-cols-2 items-center gap-x-3 border-t border-slate-200 bg-slate-50 px-4 py-3 font-semibold lg:grid-cols-[120px_1fr_1fr_1fr_1fr_1fr_140px_130px]">
            <span>TOTAL</span><span /><span /><span class="tabular-nums">{{ rp(siswa.hitung.total) }}</span><span class="tabular-nums text-[#067647]">{{ rp(siswa.hitung.bayar) }}</span><span class="tabular-nums text-[#B42318]">{{ rp(siswa.hitung.sisa) }}</span>
            <span class="col-span-2 lg:col-span-1"><span v-if="siswa.hitung.saldo > 0" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Saldo {{ rp(siswa.hitung.saldo) }}</span><span v-else-if="siswa.hitung.sisa <= 0" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas 100%</span><span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Terbayar {{ persenTeks(siswa.hitung.persen) }}</span></span><span />
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-2">
          <p class="text-[15px] font-semibold text-slate-800">Riwayat Transaksi Siswa Ini</p>
          <span class="text-[12.5px] text-slate-500">Total Dibayar di atas selalu dihitung dari daftar ini (waterfall).</span>
        </div>
        <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
          <div v-for="b in riwayat" :key="b.no" class="flex flex-wrap items-start gap-3 border-t border-slate-200 px-4 py-3 first:border-t-0">
            <span class="min-w-0 flex-1">
              <b class="text-[13.5px] font-medium text-slate-800">{{ b.keterangan }} <span class="font-normal text-slate-500">({{ b.tingkat === null ? 'Waterfall' : LABEL_TINGKAT[grade][b.tingkat] }})</span></b>
              <span v-if="b.items && b.items.length" class="mt-1 block text-[12.5px] text-slate-600">
                <span v-for="(it, ii) in b.items" :key="ii" class="block">• {{ it.keterangan }} — {{ rp(it.nominal) }}</span>
              </span>
              <span class="block text-[12.5px] text-slate-500">No. Kwitansi: {{ b.no }} &middot; {{ b.tanggal }} &middot; {{ b.metode }} &middot; Petugas: {{ b.petugas }}<template v-if="b.cutoff"> &middot; <span class="font-semibold text-[#B54708]">Sudah cut-off ({{ b.cutoff }}) — terkunci</span></template></span>
            </span>
            <b class="tabular-nums text-[#067647]">{{ rp(b.nominal) }}</b>
            <button type="button" @click="cetak = { jenis: 'kwitansi', bayar: b }" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300">Cetak Kwitansi</button>
          </div>
          <div v-if="!riwayat.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Belum ada pembayaran</b><p class="mt-1 text-[13px] text-slate-500">Belum ada pembayaran tercatat untuk siswa ini.</p></div>
        </div>
      </div>
    </div>

    <KeuanganCetak v-if="cetak && siswa" :jenis="cetak.jenis" :siswa="siswa" :bayar="cetak.bayar" @tutup="cetak = null" />

    <div v-if="tambahanUntuk !== null && siswa" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="tambahanUntuk = null">
      <div class="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p class="text-[16px] font-semibold text-slate-900">Tambah Biaya — {{ LABEL_TINGKAT[grade][tambahanUntuk] }}</p>
        <p class="mt-0.5 text-[13px] text-slate-500">Berlaku untuk {{ siswa.nama }} saja (biaya khusus per siswa), tidak mengubah paket {{ siswa.kode }} untuk siswa lain.</p>
        <div class="mt-4 grid gap-3">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Nama Biaya</label><input v-model="namaBiaya" placeholder="cth: Kegiatan Tambahan" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Nominal (Rp)</label><input v-model="nominalBiaya" inputmode="numeric" placeholder="cth: 150000" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
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
