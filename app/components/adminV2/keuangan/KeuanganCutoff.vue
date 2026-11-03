<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { formatTanggal, rp, TINGKAT_SINGKAT, type Pembayaran } from '~/composables/keuanganCore'

const grade = useAdminGrade()
const K = useKeuangan()
const notif = ref('')
const dari = ref('2026-11-01')
const sampai = ref('2026-11-03')
const rowsRentang = ref<Pembayaran[]>([])
const sibuk = ref(false)

const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3400) }
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)

const tampilkan = async () => {
  const { rows } = await K.muatRiwayat(grade.value, { dari: 0, jumlah: 500, dariISO: dari.value, sampaiISO: sampai.value })
  rowsRentang.value = rows
}
const total = computed(() => rowsRentang.value.reduce((a, b) => a + b.nominal, 0))
const perMetode = (m: string) => rowsRentang.value.filter(b => b.metode === m).reduce((a, b) => a + b.nominal, 0)
const belum = computed(() => rowsRentang.value.filter(b => !b.cutoff))
const totalBelum = computed(() => belum.value.reduce((a, b) => a + b.nominal, 0))
const cutoffs = computed(() => K.state.value.cutoffs.filter(c => c.grade === grade.value))
const terakhir = computed(() => cutoffs.value[0])

const buat = async () => {
  sibuk.value = true
  try {
    const c = await K.buatCutoff(grade.value, dari.value, sampai.value, 'Anis Azyzy, S.T')
    tampilNotif(`Cut-off ${c.kode} dibuat: ${c.trx} transaksi (${rp(c.total)}) terkunci & tercatat sebagai serah dana ke yayasan.`)
    await tampilkan()
  } catch (e: any) {
    tampilNotif(e?.message || 'Cut-off gagal dibuat.')
  } finally { sibuk.value = false }
}
tampilkan()
</script>

<template>
  <div>
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{{ notif }}</div>

    <p v-if="terakhir" class="mt-5 rounded-xl border border-[#1B5FD9]/30 bg-[#EAF1FC] px-4 py-3 text-[13px] text-slate-600">Cut-off terakhir: <b class="text-slate-800">{{ terakhir.dari }} s/d {{ terakhir.sampai }}</b> — dana sebesar <b class="text-slate-800">{{ rp(terakhir.total) }}</b> sudah diserahkan dari sekolah ke yayasan.</p>

    <div class="mt-3 rounded-xl border border-slate-300 bg-white p-4">
      <p class="text-[14.5px] font-semibold text-slate-800">Cut-off Keuangan</p>
      <p class="mt-0.5 text-[13px] text-slate-500">Pilih rentang tanggal, periksa rinciannya, lalu buat cut-off untuk memindahkan dana ke yayasan dan mengunci transaksi dalam rentang itu.</p>
      <div class="mt-3 flex flex-wrap items-end gap-2">
        <div class="min-w-[150px] flex-1"><label class="mb-1 block text-[12px] font-medium text-slate-500">Dari Tanggal</label><input v-model="dari" type="date" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
        <div class="min-w-[150px] flex-1"><label class="mb-1 block text-[12px] font-medium text-slate-500">Sampai Tanggal</label><input v-model="sampai" type="date" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
        <button type="button" @click="tampilkan" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Tampilkan</button>
        <button type="button" :disabled="!belum.length || sibuk" @click="buat" class="rounded-xl bg-[#067647] px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Buat Cut-off ({{ belum.length }} transaksi)</button>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Transaksi dalam Rentang</p><p class="mt-1 text-[24px] font-semibold leading-8">{{ rowsRentang.length }}</p><p class="text-[12px] text-slate-500">pembayaran</p></div>
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Total Nominal</p><p class="mt-1 text-[24px] font-semibold leading-8 text-[#067647]">{{ rp(total) }}</p><p class="text-[12px] text-slate-500">Tunai {{ rp(perMetode('Tunai')) }} &middot; Transfer {{ rp(perMetode('Transfer')) }} &middot; QRIS {{ rp(perMetode('QRIS')) }}</p></div>
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Belum Di-cut-off</p><p class="mt-1 text-[24px] font-semibold leading-8 text-[#B54708]">{{ rp(totalBelum) }}</p><p class="text-[12px] text-slate-500">{{ belum.length }} transaksi siap diserahkan</p></div>
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Sudah Terkunci</p><p class="mt-1 text-[24px] font-semibold leading-8 text-[#1B5FD9]">{{ rp(total - totalBelum) }}</p><p class="text-[12px] text-slate-500">{{ rowsRentang.length - belum.length }} transaksi dalam rentang ini</p></div>
    </div>

    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:150px 1fr 110px 1fr 110px 1fr 150px">
        <span>Kwitansi</span><span>Siswa</span><span>Tingkat</span><span>Nominal</span><span>Metode</span><span>Keterangan</span><span>Status</span>
      </div>
      <div v-for="b in rowsRentang" :key="b.no" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[150px_1fr_110px_1fr_110px_1fr_150px]">
        <span><b class="text-[13.5px] font-semibold text-slate-800">{{ b.no }}</b><br><span class="text-[12px] text-slate-500">{{ b.tanggal }}</span></span>
        <span><b class="font-medium text-slate-800">{{ namaSiswa(b.nis)?.nama || b.nis }}</b><br><span class="text-[12px] text-slate-500">{{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}</span></span>
        <span><span class="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{{ TINGKAT_SINGKAT[b.tingkat] }}</span></span>
        <span class="tabular-nums font-semibold text-[#067647]">{{ rp(b.nominal) }}</span>
        <span>{{ b.metode }}</span>
        <span>{{ b.keterangan }}</span>
        <span v-if="b.cutoff" class="text-[12.5px] font-semibold text-[#B54708]">Terkunci — {{ b.cutoff }}</span>
        <span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum Cut-off</span>
      </div>
      <div v-if="!rowsRentang.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Tidak ada transaksi dalam rentang ini</b><p class="mt-1 text-[13px] text-slate-500">Coba rentang 29 Jul 2026, atau 28 Okt – 03 Nov 2026 untuk melihat contoh data.</p></div>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-2">
      <p class="text-[15px] font-semibold text-slate-800">Riwayat Cut-off</p>
      <span class="text-[12.5px] text-slate-500">Setiap cut-off adalah bukti serah dana sekolah &rarr; yayasan.</span>
    </div>
    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:190px 70px 70px 1fr 140px 1fr 130px">
        <span>Rentang Tanggal</span><span>Hari</span><span>Trx</span><span>Total</span><span>Bukti Serah</span><span>Oleh</span><span>Aksi</span>
      </div>
      <div v-for="c in cutoffs" :key="c.kode" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[190px_70px_70px_1fr_140px_1fr_130px]">
        <span><b class="font-semibold text-slate-800">{{ c.kode }}</b><br><span class="text-[12px] text-slate-500">{{ c.dari }} s/d {{ c.sampai }}</span></span>
        <span>{{ c.hari }} hari</span>
        <span>{{ c.trx }}</span>
        <span class="tabular-nums font-semibold text-[#067647]">{{ rp(c.total) }}</span>
        <span v-if="c.bukti" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Sudah Diunggah</span>
        <span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum</span>
        <span class="text-[12.5px] text-slate-500">{{ c.oleh }}</span>
        <span><button type="button" @click="K.unggahBuktiCutoff(c)" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300">{{ c.bukti ? 'Lihat Bukti' : 'Unggah Bukti' }}</button></span>
      </div>
      <div v-if="!cutoffs.length" class="px-4 py-10 text-center text-[13px] text-slate-500">Belum ada cut-off pada jenjang ini.</div>
    </div>
    <p class="mt-3 text-[12.5px] text-slate-500">Rentang contoh memakai tanggal kalender: {{ formatTanggal(dari) }} s/d {{ formatTanggal(sampai) }}.</p>
  </div>
</template>
