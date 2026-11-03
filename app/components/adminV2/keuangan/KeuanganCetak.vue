<script setup lang="ts">
import { computed } from 'vue'
import {
  LABEL_TINGKAT, formatTanggalPanjang, persenTeks, rp, terbilangRupiah,
  type BarisSiswa, type Pembayaran
} from '~/composables/keuanganCore'

const props = defineProps<{
  jenis: 'wa' | 'surat' | 'kwitansi'
  siswa: BarisSiswa
  bayar?: Pembayaran | null
}>()
const emit = defineEmits<{ tutup: [] }>()

const sekolah = computed(() => props.siswa.grade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9')
const hariIni = formatTanggalPanjang(new Date().toISOString().slice(0, 10))

const teksWA = computed(() => {
  const s = props.siswa
  const per = s.hitung.per.map((v, t) => v.sisa > 0 ? `- ${LABEL_TINGKAT[s.grade][t]}: sisa ${rp(v.sisa)}` : `- ${LABEL_TINGKAT[s.grade][t]}: Lunas`).join('\n')
  return `Assalamu'alaikum Wr. Wb.\nYth. Bapak/Ibu Wali dari ${s.nama} (NIS ${s.nis}, ${s.kelas}).\n\nKami informasikan rincian keuangan ananda di ${sekolah.value}:\n${per}\nTotal sisa tagihan: ${rp(s.hitung.sisa)} dari total ${rp(s.hitung.total)} (sudah dibayar ${rp(s.hitung.bayar)}).\n\nPembayaran dapat dilakukan melalui Tata Usaha sekolah dengan menyebutkan NIS ananda. Terima kasih.\n\n— Tata Usaha ${sekolah.value}`
})
const tautanWA = computed(() => {
  const hp = props.siswa.hpWali.replace(/[^0-9]/g, '').replace(/^0/, '62')
  return `https://wa.me/${hp}?text=${encodeURIComponent(teksWA.value)}`
})
</script>

<template>
  <div class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="emit('tutup')">
    <div class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
      <!-- WA -->
      <template v-if="jenis === 'wa'">
        <p class="text-[16px] font-semibold text-slate-900">Notifikasi WhatsApp ke Wali</p>
        <p class="mt-0.5 text-[13px] text-slate-500">{{ siswa.nama }} &middot; WA Wali: {{ siswa.hpWali || '—' }}. Isi pesan dibuat otomatis dari angka rincian yang sama persis.</p>
        <div class="mt-4 rounded-xl border border-emerald-200 bg-[#F0FDF4] p-4">
          <pre class="whitespace-pre-wrap font-sans text-[13px] leading-6 text-slate-700">{{ teksWA }}</pre>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="emit('tutup')" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Tutup</button>
          <a :href="tautanWA" target="_blank" rel="noopener" class="rounded-xl bg-[#067647] px-4 py-2.5 text-[13px] font-medium text-white">Buka WhatsApp &amp; Kirim</a>
        </div>
      </template>

      <!-- Surat tagihan -->
      <template v-else-if="jenis === 'surat'">
        <div class="border border-slate-300 p-6 text-[13px] leading-6 text-slate-800">
          <div class="border-b-2 border-slate-800 pb-3 text-center">
            <p class="text-[16px] font-bold uppercase tracking-wide">{{ sekolah }}</p>
            <p class="text-[12px] text-slate-500">Tata Usaha &middot; Informasi Keuangan Siswa</p>
          </div>
          <p class="mt-4">Jakarta, {{ hariIni }}</p>
          <p class="mt-3 font-semibold">Perihal: Informasi Tunggakan Biaya Pendidikan</p>
          <p class="mt-3">Kepada Yth. Bapak/Ibu Orang Tua/Wali dari:</p>
          <table class="mt-2 w-full max-w-md">
            <tr><td class="py-0.5 pr-3 text-slate-500">Nama Siswa</td><td class="font-semibold">: {{ siswa.nama }}</td></tr>
            <tr><td class="py-0.5 pr-3 text-slate-500">NIS / NISN</td><td>: {{ siswa.nis }} / {{ siswa.nisn }}</td></tr>
            <tr><td class="py-0.5 pr-3 text-slate-500">Kelas</td><td>: {{ siswa.kelas }}</td></tr>
            <tr><td class="py-0.5 pr-3 text-slate-500">Kode Keuangan</td><td>: {{ siswa.kode }}</td></tr>
          </table>
          <table class="mt-4 w-full border-collapse">
            <thead><tr class="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500"><th class="border border-slate-300 px-2 py-1.5">Tingkat</th><th class="border border-slate-300 px-2 py-1.5">Total Tagihan</th><th class="border border-slate-300 px-2 py-1.5">Dibayar</th><th class="border border-slate-300 px-2 py-1.5">Sisa</th></tr></thead>
            <tbody>
              <tr v-for="(v, t) in siswa.hitung.per" :key="t"><td class="border border-slate-300 px-2 py-1.5">{{ LABEL_TINGKAT[siswa.grade][t] }}</td><td class="border border-slate-300 px-2 py-1.5 tabular-nums">{{ rp(v.total) }}</td><td class="border border-slate-300 px-2 py-1.5 tabular-nums">{{ rp(v.bayar) }}</td><td class="border border-slate-300 px-2 py-1.5 tabular-nums">{{ rp(v.sisa) }}</td></tr>
              <tr class="bg-slate-50 font-semibold"><td class="border border-slate-300 px-2 py-1.5">TOTAL</td><td class="border border-slate-300 px-2 py-1.5 tabular-nums">{{ rp(siswa.hitung.total) }}</td><td class="border border-slate-300 px-2 py-1.5 tabular-nums">{{ rp(siswa.hitung.bayar) }}</td><td class="border border-slate-300 px-2 py-1.5 tabular-nums">{{ rp(siswa.hitung.sisa) }}</td></tr>
            </tbody>
          </table>
          <p class="mt-3">Total biaya pendidikan sebesar <b>{{ rp(siswa.hitung.total) }}</b>, telah dibayar <b>{{ rp(siswa.hitung.bayar) }}</b> ({{ persenTeks(siswa.hitung.persen) }}), sehingga tunggakan sebesar <b>{{ rp(siswa.hitung.sisa) }}</b>. Pembayaran cukup menyebutkan NIS siswa di Tata Usaha.</p>
          <div class="mt-6 grid grid-cols-2 gap-4 text-center">
            <div><p>Kepala Sekolah</p><p class="mt-14 font-semibold underline">H. Abd. Muiz, M.Pd., Gr.</p></div>
            <div><p>Tata Usaha / Teller</p><p class="mt-14 font-semibold underline">Anis Azyzy, S.T</p></div>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" @click="emit('tutup')" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Tutup</button>
          <button type="button" onclick="window.print()" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Cetak Surat</button>
        </div>
      </template>

      <!-- Kwitansi -->
      <template v-else-if="bayar">
        <div class="border border-slate-300 p-6 text-[13px] leading-6 text-slate-800">
          <div class="border-b-2 border-slate-800 pb-3 text-center">
            <p class="text-[16px] font-bold uppercase tracking-wide">{{ sekolah }}</p>
            <p class="text-[12px] text-slate-500">Kwitansi Pembayaran &middot; No: {{ bayar.no }}</p>
          </div>
          <table class="mt-4 w-full max-w-lg">
            <tr><td class="py-1 pr-3 text-slate-500">Telah terima dari</td><td class="font-semibold">: Wali dari {{ siswa.nama }}</td></tr>
            <tr><td class="py-1 pr-3 text-slate-500">NIS / Kelas</td><td>: {{ siswa.nis }} / {{ siswa.kelas }}</td></tr>
            <tr><td class="py-1 pr-3 text-slate-500">Untuk pembayaran</td><td>: {{ bayar.keterangan }} — {{ LABEL_TINGKAT[siswa.grade][bayar.tingkat] }}</td></tr>
            <tr><td class="py-1 pr-3 text-slate-500">Metode</td><td>: {{ bayar.metode }} &middot; {{ bayar.tanggal }}</td></tr>
            <tr><td class="py-1 pr-3 text-slate-500">Terbilang</td><td class="italic">: {{ terbilangRupiah(bayar.nominal) }}</td></tr>
          </table>
          <div class="mt-5 flex flex-wrap items-end justify-between gap-4">
            <p class="rounded-lg bg-slate-100 px-4 py-2 text-[18px] font-bold tabular-nums">{{ rp(bayar.nominal) }}</p>
            <div class="text-center"><p>Bendahara / Teller</p><p class="mt-12 font-semibold underline">{{ bayar.petugas }}</p></div>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" @click="emit('tutup')" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Tutup</button>
          <button type="button" onclick="window.print()" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Cetak Kwitansi</button>
        </div>
      </template>
    </div>
  </div>
</template>
