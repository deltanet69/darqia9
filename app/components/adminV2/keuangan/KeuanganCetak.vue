<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
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

const sekolah = computed(() => props.siswa.grade === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')
const hariIni = formatTanggalPanjang(new Date().toISOString().slice(0, 10))

const kopSurat = computed(() => {
  return props.siswa.grade === 'SMP' ? '/kop surat/KopSMP.jpg' : '/kop surat/KopSMK.jpg'
})

const kepsek = computed(() => {
  if (props.siswa.grade === 'SMP') {
    return {
      jabatan: 'Kepala SMP IT Bina Cendekia Assalam',
      nama: 'Kepala Sekolah SMP IT BCA',
      keterangan: 'SMP IT Bina Cendekia Assalam'
    }
  }
  return {
    jabatan: 'Kepala SMK IT Attaqwa 9',
    nama: 'H. Abd. Muiz, M.Pd., Gr.',
    keterangan: 'NPSN: 69940449 · Akreditasi A'
  }
})

const qrCodeUrl = ref('')
const tautanVerifikasi = computed(() => {
  if (!props.siswa) return ''
  const host = typeof window !== 'undefined' ? window.location.origin : 'https://darqiaattqwa.sch.id'
  return `${host}/verifikasi/tagihan/TAG-${props.siswa.grade}-${props.siswa.nis}?nis=${props.siswa.nis}&grade=${props.siswa.grade}&t=${props.siswa.hitung.total}&s=${props.siswa.hitung.sisa}`
})

const generateQR = async () => {
  if (!tautanVerifikasi.value) return
  try {
    qrCodeUrl.value = await QRCode.toDataURL(tautanVerifikasi.value, {
      width: 220,
      margin: 1,
      color: { dark: '#0A2A5C', light: '#FFFFFF' }
    })
  } catch (err) {
    console.error('Gagal membuat QR Code:', err)
  }
}

onMounted(() => {
  generateQR()
})

watch(() => props.siswa, () => {
  generateQR()
})

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
  <div class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 backdrop-blur-xs sm:items-center sm:p-4" @click.self="emit('tutup')">
    <div class="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-4 sm:p-6 sm:rounded-2xl shadow-2xl">
      <!-- WA NOTIFIKASI -->
      <template v-if="jenis === 'wa'">
        <p class="text-[16px] font-bold text-slate-900">Notifikasi WhatsApp ke Wali</p>
        <p class="mt-0.5 text-[12.5px] text-slate-500">{{ siswa.nama }} &middot; WA Wali: {{ siswa.hpWali || '—' }}. Isi pesan dibuat otomatis dari angka rincian yang sama persis.</p>
        <div class="mt-4 rounded-xl border border-emerald-200 bg-[#F0FDF4] p-4">
          <pre class="whitespace-pre-wrap font-sans text-[13px] leading-6 text-slate-700">{{ teksWA }}</pre>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="emit('tutup')" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Tutup</button>
          <a :href="tautanWA" target="_blank" rel="noopener" class="rounded-xl bg-[#067647] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#05603a] transition-colors">Buka WhatsApp &amp; Kirim</a>
        </div>
      </template>

      <!-- SURAT TAGIHAN RESMI -->
      <template v-else-if="jenis === 'surat'">
        <div class="keu-paper rounded-xl border border-slate-300 bg-white p-6 sm:p-8 text-[12.5px] leading-relaxed text-slate-800 shadow-sm print:border-none print:p-0">
          <!-- KOP SURAT RESMI SEKOLAH -->
          <div class="mb-5 overflow-hidden border-b-2 border-slate-900 pb-2">
            <img :src="kopSurat" alt="Kop Surat Resmi Sekolah" class="w-full object-contain max-h-36 mx-auto" />
          </div>

          <!-- Metadata Surat Resmi -->
          <div class="grid grid-cols-2 gap-4 text-[12.5px]">
            <div>
              <p><span class="inline-block w-20 text-slate-500">Nomor</span>: 421.5/TU-KEU/2026/{{ siswa.nis }}</p>
              <p><span class="inline-block w-20 text-slate-500">Lampiran</span>: 1 (Satu) Berkas</p>
              <p><span class="inline-block w-20 text-slate-500">Perihal</span>: <b>Pemberitahuan &amp; Rincian Administrasi Keuangan</b></p>
            </div>
            <div class="text-right">
              <p>Bekasi, {{ hariIni }}</p>
            </div>
          </div>

          <!-- Tujuan Surat -->
          <div class="mt-4">
            <p>Kepada Yth.</p>
            <p class="font-bold">Bapak / Ibu Orang Tua / Wali Murid</p>
            <p>Dari Siswa: <b class="text-slate-900">{{ siswa.nama }}</b> (NIS: {{ siswa.nis }} &middot; Kelas: {{ siswa.kelas }})</p>
            <p>Di Tempat</p>
          </div>

          <p class="mt-4">
            <i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i>
          </p>
          <p class="mt-2 text-justify">
            Teriring doa kami sampaikan semoga Bapak/Ibu senantiasa dalam lindungan Allah SWT serta sukses dalam menjalankan aktivitas sehari-hari. Sehubungan dengan tertib administrasi keuangan di <b>{{ sekolah }}</b>, bersama ini kami sampaikan rincian kewajiban biaya pendidikan ananda sebagai berikut:
          </p>

          <!-- Tabel Rincian Biaya -->
          <div class="mt-3 overflow-hidden rounded-lg border border-slate-300">
            <table class="w-full border-collapse text-left text-[12px]">
              <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-[10.5px]">
                <tr>
                  <th class="border-b border-r border-slate-300 px-3 py-2">Tingkat Pendidikan</th>
                  <th class="border-b border-r border-slate-300 px-3 py-2 text-right">Total Tagihan</th>
                  <th class="border-b border-r border-slate-300 px-3 py-2 text-right">Telah Dibayar</th>
                  <th class="border-b border-slate-300 px-3 py-2 text-right">Sisa Tagihan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="(v, t) in siswa.hitung.per" :key="t" class="hover:bg-slate-50/50">
                  <td class="border-r border-slate-200 px-3 py-1.5 font-medium">{{ LABEL_TINGKAT[siswa.grade][t] }}</td>
                  <td class="border-r border-slate-200 px-3 py-1.5 text-right tabular-nums">{{ rp(v.total) }}</td>
                  <td class="border-r border-slate-200 px-3 py-1.5 text-right tabular-nums text-emerald-700 font-semibold">{{ rp(v.bayar) }}</td>
                  <td class="px-3 py-1.5 text-right tabular-nums text-rose-700 font-semibold">{{ rp(v.sisa) }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                <tr>
                  <td class="border-r border-slate-300 px-3 py-2 uppercase">TOTAL AKUMULASI</td>
                  <td class="border-r border-slate-300 px-3 py-2 text-right tabular-nums">{{ rp(siswa.hitung.total) }}</td>
                  <td class="border-r border-slate-300 px-3 py-2 text-right tabular-nums text-emerald-700">{{ rp(siswa.hitung.bayar) }}</td>
                  <td class="px-3 py-2 text-right tabular-nums text-rose-700">{{ rp(siswa.hitung.sisa) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p class="mt-3 text-justify">
            Total biaya pendidikan ananda tercatat sebesar <b>{{ rp(siswa.hitung.total) }}</b>, dengan jumlah yang telah dibayarkan sebesar <b>{{ rp(siswa.hitung.bayar) }}</b> ({{ persenTeks(siswa.hitung.persen) }}), sehingga sisa tagihan tercatat adalah sebesar <b class="text-rose-700">{{ rp(siswa.hitung.sisa) }}</b>.
          </p>
          <p class="mt-2 text-justify">
            Pembayaran dapat diselesaikan langsung di loket Tata Usaha Keuangan Sekolah dengan menyebutkan Nomor Induk Siswa (NIS) atau melalui rekening resmi sekolah. Demikian surat pemberitahuan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.
          </p>
          <p class="mt-2">
            <i>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</i>
          </p>

          <!-- TANDA TANGAN RESMI: KEPALA SEKOLAH (SMP/SMK) & TATA USAHA -->
          <div class="mt-6 pt-4 border-t border-slate-200 text-[12px]">
            <p class="text-right text-slate-600 mb-3 font-medium">Bekasi, {{ hariIni }}</p>
            <div class="grid grid-cols-2 gap-4 text-center">
              <!-- Kepala Sekolah (SMP/SMK) -->
              <div>
                <p class="font-semibold text-slate-700">Mengetahui,</p>
                <p class="font-bold text-slate-900 mt-0.5">{{ kepsek.jabatan }}</p>
                <div class="my-2.5 h-12 flex items-center justify-center">
                  <span class="rounded-md border border-blue-500/30 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 shadow-2xs">
                    TERVALIDASI DIGITAL
                  </span>
                </div>
                <p class="font-bold underline text-slate-900 text-[13px]">{{ kepsek.nama }}</p>
                <p class="text-[10.5px] text-slate-500 mt-0.5">{{ kepsek.keterangan }}</p>
              </div>

              <!-- Tata Usaha Keuangan -->
              <div>
                <p class="font-semibold text-slate-700">Petugas Keuangan,</p>
                <p class="font-bold text-slate-900 mt-0.5">Tata Usaha Keuangan</p>
                <div class="my-2.5 h-12 flex items-center justify-center">
                  <span class="rounded-md border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shadow-2xs">
                    TERVERIFIKASI
                  </span>
                </div>
                <p class="font-bold underline text-slate-900 text-[13px]">Anis Azyzy, S.T</p>
                <p class="text-[10.5px] text-slate-500 mt-0.5">NIP/Petugas: 2026.KEU.001</p>
              </div>
            </div>
          </div>

          <!-- QR CODE VERIFIKASI RESMI DIGITAL (LEBAR PENUH & RAPI) -->
          <div class="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center gap-4">
            <a :href="tautanVerifikasi" target="_blank" title="Klik untuk memverifikasi keaslian surat ini" class="shrink-0 transition-transform hover:scale-105">
              <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code Verifikasi Tagihan Resmi" class="h-20 w-20 rounded-lg border border-slate-300 bg-white p-1 shadow-2xs" />
              <div v-else class="h-20 w-20 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400">
                Memuat QR...
              </div>
            </a>
            <div class="min-w-0 flex-1 text-[11px] leading-tight">
              <div class="flex items-center gap-2 mb-1">
                <span class="rounded bg-blue-100 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-blue-900">
                  VERIFIKASI RESMI DIGITAL
                </span>
                <span class="text-slate-400 font-mono text-[10px]">ID: TAG-{{ siswa.grade }}-{{ siswa.nis }}</span>
              </div>
              <p class="font-bold text-slate-800 text-[12px]">Pindai QR Code untuk Cek Keabsahan Surat</p>
              <p class="mt-0.5 text-slate-500 text-[10.5px] leading-snug">
                Surat tagihan ini diterbitkan resmi oleh SIM Keuangan Darqia 9 untuk <b>{{ siswa.nama }}</b>. Scan QR atau klik kotak ini untuk membuka sertifikat verifikasi keabsahan resmi secara daring.
              </p>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi Modal -->
        <div class="mt-4 flex flex-wrap items-center justify-between gap-2.5">
          <a :href="tautanVerifikasi" target="_blank" class="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-[12.5px] font-semibold text-[#1B5FD9] hover:bg-blue-100 transition-colors">
            <span>Buka Halaman Verifikasi Tagihan &rarr;</span>
          </a>
          <div class="flex items-center gap-2">
            <button type="button" @click="emit('tutup')" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Tutup
            </button>
            <button type="button" onclick="window.print()" class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#154cb0] transition-colors">
              Cetak Surat Tagihan
            </button>
          </div>
        </div>
      </template>

      <!-- KWITANSI RESMI -->
      <template v-else-if="bayar">
        <div class="keu-paper rounded-xl border border-slate-300 bg-white p-6 sm:p-8 text-[12.5px] leading-relaxed text-slate-800 shadow-sm print:border-none print:p-0">
          <div class="mb-4 overflow-hidden border-b-2 border-slate-900 pb-2">
            <img :src="kopSurat" alt="Kop Surat Resmi" class="w-full object-contain max-h-32 mx-auto" />
          </div>

          <div class="border-b border-slate-200 pb-2 text-center">
            <h4 class="text-[15px] font-bold uppercase tracking-wider text-slate-900">Kwitansi Pembayaran Resmi</h4>
            <p class="text-[11.5px] font-medium text-slate-500">Nomor: {{ bayar.no }} &middot; Tanggal: {{ bayar.tanggal }}</p>
          </div>

          <table class="mt-4 w-full text-[12.5px]">
            <tbody>
              <tr>
                <td class="py-1 pr-3 text-slate-500 w-36">Telah terima dari</td>
                <td class="font-bold text-slate-900">: Orang Tua / Wali dari {{ siswa.nama }}</td>
              </tr>
              <tr>
                <td class="py-1 pr-3 text-slate-500">NIS &middot; Kelas</td>
                <td class="font-medium text-slate-800">: {{ siswa.nis }} &middot; Kelas {{ siswa.kelas }} ({{ siswa.grade }})</td>
              </tr>
              <tr>
                <td class="py-1 pr-3 align-top text-slate-500">Untuk pembayaran</td>
                <td>
                  :
                  <template v-if="bayar.items && bayar.items.length">
                    <span v-for="(it, ii) in bayar.items" :key="ii" class="block pl-2 text-slate-800">
                      &bull; {{ it.keterangan }} — <b>{{ rp(it.nominal) }}</b>
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-slate-800 font-semibold">{{ bayar.keterangan }}</span>
                  </template>
                </td>
              </tr>
              <tr>
                <td class="py-1 pr-3 text-slate-500">Metode Bayar</td>
                <td class="font-medium text-slate-800">: {{ bayar.metode }}</td>
              </tr>
              <tr>
                <td class="py-1 pr-3 text-slate-500">Jumlah Terbilang</td>
                <td class="italic font-medium text-slate-700">: {{ terbilangRupiah(bayar.nominal) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="mt-6 flex flex-wrap items-end justify-between gap-4 pt-3 border-t border-slate-200">
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
              <span class="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 block">Jumlah Pembayaran</span>
              <span class="text-[19px] font-black text-emerald-700 tabular-nums">{{ rp(bayar.nominal) }}</span>
            </div>

            <div class="text-center sm:text-right">
              <p class="text-[11.5px] text-slate-500">Bekasi, {{ bayar.tanggal }}</p>
              <p class="font-semibold text-slate-800 mt-1">Petugas Tata Usaha,</p>
              <div class="h-10"></div>
              <p class="font-bold underline text-slate-900">{{ bayar.petugas }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button type="button" @click="emit('tutup')" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Tutup</button>
          <button type="button" onclick="window.print()" class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#154cb0] transition-colors">Cetak Kwitansi</button>
        </div>
      </template>
    </div>
  </div>
</template>
