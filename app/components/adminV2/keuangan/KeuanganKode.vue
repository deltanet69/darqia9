<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { LABEL_TINGKAT, rp, totalPaket, type PaketKeuangan } from '~/composables/keuanganCore'

const grade = useAdminGrade()
const K = useKeuangan()
const notif = ref('')
const modal = ref<null | { kode: string, nama: string, n: [string, string, string, string], aktif: boolean, lama: string }>(null)
const ketBaru = ref('')

const paketGrade = computed(() => K.state.value.paket.filter(p => p.grade === grade.value))
const pemakai = (kode: string) => K.state.value.penetapan.filter(p => p.kode === kode && p.grade === grade.value).length
const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3200) }

const bukaModal = (p?: PaketKeuangan) => {
  modal.value = p
    ? { kode: p.kode, nama: p.nama, n: [String(p.nominal[0]), String(p.nominal[1]), String(p.nominal[2]), String(p.nominal[3])], aktif: p.aktif, lama: p.kode }
    : { kode: '', nama: '', n: ['', '', '', ''], aktif: true, lama: '' }
}
const angka = (v: string) => Math.max(0, parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0)
const simpan = async () => {
  if (!modal.value || !modal.value.kode.trim() || !modal.value.nama.trim()) return
  const p: PaketKeuangan = { kode: modal.value.kode.trim(), nama: modal.value.nama.trim(), grade: grade.value, nominal: [angka(modal.value.n[0]), angka(modal.value.n[1]), angka(modal.value.n[2]), angka(modal.value.n[3])], aktif: modal.value.aktif }
  await K.simpanPaket(p, modal.value.lama || undefined)
  tampilNotif(modal.value.lama ? `Paket ${p.kode} diperbarui — Nominal Master semua siswa pemakai kode ini ikut terhitung ulang.` : `Paket ${p.kode} dibuat. Pasang ke siswa lewat tab Data Keuangan.`)
  modal.value = null
}
const hapus = async (p: PaketKeuangan) => {
  const hasil = await K.hapusPaket(p.kode)
  tampilNotif(hasil === 'nonaktif' ? `Paket ${p.kode} sedang dipakai ${pemakai(p.kode)} siswa — tidak dihapus, hanya dinonaktifkan agar riwayat tetap terbaca.` : `Paket ${p.kode} dihapus.`)
}
const tambahKet = async () => {
  const nama = ketBaru.value.trim()
  if (!nama) return
  await K.tambahKeterangan(nama)
  ketBaru.value = ''
  tampilNotif(`Keterangan "${nama}" ditambahkan.`)
}
</script>

<template>
  <div>
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{{ notif }}</div>

    <div class="mt-6 flex flex-wrap items-center gap-2">
      <p class="text-[15px] font-semibold text-slate-800">Master Kode Keuangan</p>
      <button type="button" @click="bukaModal()" class="ml-auto rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">+ Tambah Paket</button>
    </div>
    <p class="mt-1 text-[13px] text-slate-500">Kode inilah penentu nominal flat per tingkat berdasarkan <b>tahun masuk &amp; kategori siswa</b>. Satu kode dipakai banyak siswa — mengubah nominal di sini menghitung ulang Nominal Master semua siswa pemakai kode itu.</p>

    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:110px 1fr 1fr 1fr 1fr 1fr 1fr 80px 110px">
        <span>Kode</span><span>Nama Paket</span><span>{{ LABEL_TINGKAT[grade][0] }}</span><span>{{ LABEL_TINGKAT[grade][1] }}</span><span>{{ LABEL_TINGKAT[grade][2] }}</span><span>Tingkat Akhir</span><span>Total</span><span>Pemakai</span><span>Aksi</span>
      </div>
      <div v-for="p in paketGrade" :key="p.kode" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[110px_1fr_1fr_1fr_1fr_1fr_1fr_80px_110px]">
        <b class="font-semibold text-[#1B5FD9]">{{ p.kode }}</b>
        <span class="font-medium text-slate-800">{{ p.nama }} <span v-if="!p.aktif" class="ml-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Nonaktif</span></span>
        <span v-for="(n, i) in p.nominal" :key="i" class="tabular-nums">{{ n > 0 ? rp(n) : '—' }}</span>
        <b class="tabular-nums">{{ rp(totalPaket(p)) }}</b>
        <span class="text-slate-500">{{ pemakai(p.kode) }} siswa</span>
        <span class="flex gap-3"><button type="button" @click="bukaModal(p)" class="text-[13px] font-semibold text-[#1B5FD9]">Ubah</button><button type="button" @click="hapus(p)" class="text-[13px] font-semibold text-[#B42318]">Hapus</button></span>
      </div>
      <div v-if="!paketGrade.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Belum ada Kode Keuangan {{ grade }}</b><p class="mt-1 text-[13px] text-slate-500">Buat paket pertama lewat tombol Tambah Paket — nominalnya ditetapkan manajemen berdasarkan tahun masuk.</p></div>
    </div>

    <div class="mt-3 grid gap-3 xl:grid-cols-2">
      <div class="rounded-xl border border-slate-300 bg-white p-4">
        <p class="text-[14.5px] font-semibold text-slate-800">Master Keterangan Pembayaran</p>
        <p class="mt-1 text-[13px] text-slate-500">Jenis pembayaran yang bisa dipilih saat Input Pembayaran. Di Darqia hanya ada keterangan keuangan siswa — <b>tidak ada Tabungan</b>.</p>
        <div v-for="(k, i) in K.state.value.keterangan" :key="k" class="flex items-center gap-3 border-b border-slate-100 py-2.5">
          <span class="text-[12.5px] font-semibold text-slate-400">{{ i + 1 }}</span>
          <span class="flex-1 text-[13.5px]">{{ k }}</span>
          <button type="button" @click="K.hapusKeterangan(k)" class="text-[13px] font-semibold text-[#B42318]">Hapus</button>
        </div>
        <div class="mt-3 flex gap-2">
          <input v-model="ketBaru" placeholder="Nama keterangan baru" class="bg-white min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-[13px] outline-none focus:border-[#1B5FD9]">
          <button type="button" @click="tambahKet" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">+ Tambah</button>
        </div>
      </div>
      <div class="rounded-xl border border-slate-300 bg-white p-4">
        <p class="text-[14.5px] font-semibold text-slate-800">Aturan Kode Keuangan</p>
        <ul class="ml-4 mt-2 list-disc text-[13px] leading-7 text-slate-600">
          <li>Kode dibuat per <b>tahun masuk</b> — contoh R-2627 untuk angkatan masuk 2026/2027.</li>
          <li>Varian kategori dibuat sebagai kode sendiri: Reguler, SSK, Beasiswa, SKTM, Pindahan, Tinggal Kelas.</li>
          <li>Paket yang <b>sudah dipakai siswa tidak bisa dihapus</b>, hanya dinonaktifkan agar riwayat lama tetap terbaca.</li>
          <li>Tingkat Akhir boleh kosong bila belum ditetapkan manajemen — tampil sebagai "Belum Diset", bukan Rp 0.</li>
          <li>Biaya di luar paket masuk lewat <b>Biaya Tambahan per siswa</b> di halaman rincian, bukan mengubah paket bersama.</li>
        </ul>
      </div>
    </div>

    <div v-if="modal" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 p-0 sm:items-center sm:p-4" @click.self="modal = null">
      <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p class="text-[16px] font-semibold text-slate-900">{{ modal.lama ? 'Ubah Paket Kode Keuangan' : 'Tambah Paket Kode Keuangan' }}</p>
        <p class="mt-0.5 text-[13px] text-slate-500">Nominal diisi angka saja (rupiah) per tingkat untuk jenjang {{ grade }}.</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Kode Paket</label><input v-model="modal.kode" :disabled="!!modal.lama" placeholder="cth: R-2728" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] disabled:bg-slate-50"></div>
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Nama Paket</label><input v-model="modal.nama" placeholder="cth: Siswa Reguler" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
          <div v-for="i in [0, 1, 2, 3]" :key="i"><label class="mb-1 block text-[12px] font-medium text-slate-500">Nominal {{ LABEL_TINGKAT[grade][i] }}</label><input v-model="modal.n[i]" inputmode="numeric" placeholder="0 = belum diset" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
        </div>
        <label class="mt-3 flex items-center gap-2 text-[13px] text-slate-600"><input v-model="modal.aktif" type="checkbox" class="h-4 w-4"> Paket aktif (bisa dipasang ke siswa)</label>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="modal = null" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
          <button type="button" @click="simpan" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Simpan Paket</button>
        </div>
      </div>
    </div>
  </div>
</template>
