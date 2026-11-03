<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { LABEL_TINGKAT, METODE_BAYAR, inisialNama, rp, type BarisSiswa, type Pembayaran } from '~/composables/keuanganCore'

// Form Input Pembayaran — dua cara pakai:
//  1. Dari Rincian Siswa: prop `siswa` terisi, form langsung untuk siswa itu.
//  2. Global (tombol Input Pembayaran di halaman Keuangan): tanpa prop siswa —
//     petugas mencari Nama/NIS dulu, tagihan siswa tampil, baru memilih
//     pembayaran untuk tingkat & keterangan apa, lalu submit.
const props = defineProps<{ siswa?: BarisSiswa | null, tingkatAwal?: number }>()
const emit = defineEmits<{ tutup: [], tersimpan: [b: Pembayaran] }>()
const K = useKeuangan()
const gradeAktif = useAdminGrade()

const modeGlobal = computed(() => !props.siswa)
const terpilih = ref<BarisSiswa | null>(props.siswa || null)
const cari = ref('')
const tingkat = ref(props.tingkatAwal || 0)
const nominal = ref('')
const keterangan = ref(K.state.value.keterangan[0] || 'SPP')
const metode = ref<Pembayaran['metode']>('Tunai')
const tanggal = ref(new Date().toISOString().slice(0, 10))
const sibuk = ref(false)
const galat = ref('')
const hasil = ref<Pembayaran | null>(null)

watch(() => props.tingkatAwal, v => { if (v !== undefined) tingkat.value = v })

const hasilCari = computed(() => {
  const q = cari.value.trim().toLowerCase()
  if (q.length < 2) return []
  return K.barisSiswa(gradeAktif.value)
    .filter(s => s.nis.includes(q) || s.nama.toLowerCase().includes(q))
    .slice(0, 6)
})

const tingkatPertamaBersisa = (s: BarisSiswa): number => {
  const i = s.hitung.per.findIndex(p => p.sisa > 0)
  return i >= 0 ? i : 0
}

const pilih = (s: BarisSiswa) => {
  terpilih.value = s
  tingkat.value = tingkatPertamaBersisa(s)
  nominal.value = ''
  galat.value = ''
}

const gantiSiswa = () => { terpilih.value = null; cari.value = ''; hasil.value = null; nominal.value = ''; galat.value = '' }

const siswa = computed(() => terpilih.value)
const sisaTingkat = computed(() => siswa.value?.hitung.per[tingkat.value]?.sisa || 0)
const angka = computed(() => Math.max(0, parseInt(nominal.value.replace(/[^0-9]/g, ''), 10) || 0))
const bisa = computed(() => !!siswa.value && angka.value > 0 && angka.value <= sisaTingkat.value)

const simpan = async () => {
  galat.value = ''
  if (!siswa.value) return
  if (angka.value <= 0) { galat.value = 'Nominal pembayaran harus lebih dari 0.'; return }
  if (angka.value > sisaTingkat.value) { galat.value = `Nominal melebihi sisa tagihan tingkat ini (${rp(sisaTingkat.value)}). Kelebihan tidak diperbolehkan agar pembukuan tidak selisih.`; return }
  sibuk.value = true
  try {
    const b = await K.simpanBayar({ grade: siswa.value.grade, nis: siswa.value.nis, tingkat: tingkat.value, nominal: angka.value, keterangan: keterangan.value, metode: metode.value, petugas: 'Anis Azyzy, S.T', tanggalISO: tanggal.value })
    emit('tersimpan', b)
    // Mode global: tampilkan bukti berhasil di dalam popup (petugas biasanya
    // lanjut input berikutnya). Mode rincian: induk menutup popup ini dan
    // langsung membuka cetak kwitansi, jadi tidak ada layar berhasil di sini.
    if (modeGlobal.value) hasil.value = b
  } catch (e: any) {
    galat.value = e?.message || 'Pembayaran gagal disimpan.'
  } finally { sibuk.value = false }
}
</script>

<template>
  <div class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="emit('tutup')">
    <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">

      <!-- ===== Langkah 1 (global): cari siswa ===== -->
      <template v-if="modeGlobal && !terpilih && !hasil">
        <p class="text-[16px] font-semibold text-slate-900">Input Pembayaran</p>
        <p class="mt-0.5 text-[13px] text-slate-500">Cari siswa berdasarkan nama atau NIS — tagihannya akan tampil sebelum pembayaran dicatat.</p>
        <div class="relative mt-4">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="cari" placeholder="Ketik nama atau NIS siswa..." class="bg-white w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-[13.5px] outline-none focus:border-[#1B5FD9]">
        </div>
        <div v-if="hasilCari.length" class="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <button v-for="s in hasilCari" :key="s.nis" type="button" @click="pilih(s)" class="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold" :class="s.grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(s.nama) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[13.5px] font-medium text-slate-800">{{ s.nama }}</span>
              <span class="block text-[12px] text-slate-500">NIS {{ s.nis }} &middot; {{ s.kelas }}</span>
            </span>
            <span v-if="!s.kode" class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum dipasang kode</span>
            <span v-else-if="s.hitung.sisa > 0" class="text-right text-[12.5px]"><span class="block text-slate-500">Sisa</span><b class="tabular-nums text-[#B42318]">{{ rp(s.hitung.sisa) }}</b></span>
            <span v-else class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas</span>
          </button>
        </div>
        <p v-else-if="cari.trim().length >= 2" class="mt-3 text-[12.5px] text-slate-500">Tidak ada siswa {{ gradeAktif }} yang cocok. Periksa lagi nama / NIS, atau pastikan jenjang aktif (tombol SMP / SMK di kanan atas) sudah benar.</p>
        <p v-else class="mt-3 text-[12.5px] text-slate-500">Menampilkan siswa jenjang <b>{{ gradeAktif }}</b> yang aktif. Ketik minimal 2 huruf/angka.</p>
        <div class="mt-5 flex justify-end">
          <button type="button" @click="emit('tutup')" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
        </div>
      </template>

      <!-- ===== Berhasil (global) ===== -->
      <template v-else-if="hasil">
        <p class="text-[16px] font-semibold text-slate-900">Pembayaran Tersimpan</p>
        <div class="mt-3 rounded-xl border border-[#067647]/30 bg-[#ECFDF3] px-4 py-3">
          <p class="text-[12px] font-medium text-[#067647]">Nomor Kwitansi</p>
          <p class="text-[18px] font-semibold text-slate-900">{{ hasil.no }}</p>
          <p class="mt-1 text-[13px] text-slate-600">{{ siswa?.nama }} &middot; NIS {{ hasil.nis }} &middot; {{ LABEL_TINGKAT[hasil.grade][hasil.tingkat] }} &middot; {{ hasil.keterangan }}</p>
          <p class="mt-1 text-[15px] font-semibold tabular-nums text-[#067647]">{{ rp(hasil.nominal) }} <span class="text-[12.5px] font-medium text-slate-500">({{ hasil.metode }} &middot; {{ hasil.tanggal }})</span></p>
        </div>
        <p class="mt-3 text-[12.5px] text-slate-500">Total Dibayar &amp; sisa tagihan siswa sudah dihitung ulang dari Riwayat Pembayaran. Kwitansi dapat dicetak dari Rincian Siswa.</p>
        <div class="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" @click="gantiSiswa" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Input Pembayaran Lain</button>
          <button type="button" @click="emit('tutup')" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Selesai</button>
        </div>
      </template>

      <!-- ===== Langkah 2: tagihan + form pembayaran ===== -->
      <template v-else-if="siswa">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[16px] font-semibold text-slate-900">Input Pembayaran Siswa</p>
            <p class="mt-0.5 text-[13px] text-slate-500">{{ siswa.nama }} &middot; NIS {{ siswa.nis }} &middot; {{ siswa.kelas }}</p>
          </div>
          <button v-if="modeGlobal" type="button" @click="gantiSiswa" class="shrink-0 rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300">Ganti Siswa</button>
        </div>

        <div class="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 bg-slate-100 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Tagihan</span><span>Total</span><span>Dibayar</span><span>Sisa</span>
          </div>
          <div v-for="(t, i) in siswa.hitung.per" :key="i" class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 border-t border-slate-100 px-3 py-2 text-[12.5px]" :class="i === tingkat ? 'bg-[#EAF1FC]' : ''">
            <span class="font-medium text-slate-700">{{ LABEL_TINGKAT[siswa.grade][i] }}</span>
            <span class="tabular-nums text-slate-500">{{ t.total ? rp(t.total) : 'Belum Diset' }}</span>
            <span class="tabular-nums font-medium text-[#067647]">{{ rp(t.bayar) }}</span>
            <span class="tabular-nums font-semibold" :class="t.sisa > 0 ? 'text-[#B42318]' : 'text-slate-400'">{{ rp(t.sisa) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px]">
            <span class="font-medium text-slate-600">Total Sisa Tagihan</span>
            <b class="tabular-nums" :class="siswa.hitung.sisa > 0 ? 'text-[#B42318]' : 'text-[#067647]'">{{ siswa.hitung.sisa > 0 ? rp(siswa.hitung.sisa) : 'Lunas' }}</b>
          </div>
        </div>

        <p v-if="!siswa.kode" class="mt-3 rounded-lg bg-[#FFFAEB] px-3 py-2 text-[12.5px] font-medium text-[#B54708]">Siswa ini belum dipasang Kode Keuangan, jadi belum ada tagihan yang bisa dibayar. Pasang kodenya dulu lewat tab Data Keuangan.</p>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Pembayaran Untuk (Tingkat)</label>
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
      </template>

    </div>
  </div>
</template>
