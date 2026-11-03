<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { inisialNama, rp, TINGKAT_SINGKAT, type Pembayaran } from '~/composables/keuanganCore'

const emit = defineEmits<{ buka: [nis: string] }>()
const grade = useAdminGrade()
const K = useKeuangan()
const cari = ref('')
const fMetode = ref('')
const rows = ref<Pembayaran[]>([])
const total = ref(0)
const notif = ref('')
let jeda: ReturnType<typeof setTimeout> | undefined

const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3200) }
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)

const muat = async () => {
  const r = await K.muatRiwayat(grade.value, { cari: cari.value, metode: fMetode.value, dari: 0, jumlah: 100 })
  rows.value = r.rows
  total.value = r.total
}
onMounted(muat)
watch(grade, muat)
watch(fMetode, muat)
watch(cari, () => { clearTimeout(jeda); jeda = setTimeout(muat, 300) })

const hapus = async (b: Pembayaran) => {
  try {
    await K.hapusBayar(b)
    tampilNotif(`Pembayaran ${b.no} dihapus. Total Dibayar siswa dihitung ulang dari riwayat yang tersisa.`)
    await muat()
  } catch (e: any) {
    tampilNotif(e?.message || 'Pembayaran gagal dihapus.')
  }
}
const ekspor = () => {
  const kepala = 'No Kwitansi;Tanggal;NIS;Nama;Kelas;Tingkat;Keterangan;Metode;Nominal;Petugas;Status\n'
  const isi = rows.value.map(b => {
    const s = namaSiswa(b.nis)
    return [b.no, b.tanggal, b.nis, s?.nama || '', s?.kelas || '', TINGKAT_SINGKAT[b.tingkat], b.keterangan, b.metode, b.nominal, b.petugas, b.cutoff ? `Cut-off ${b.cutoff}` : 'Terbuka'].join(';')
  }).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + kepala + isi], { type: 'text/csv' }))
  a.download = 'riwayat-pembayaran-' + grade.value.toLowerCase() + '.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{{ notif }}</div>
    <div class="mt-5 flex flex-wrap items-center gap-2">
      <div class="relative w-full max-w-sm">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input v-model="cari" placeholder="Cari No Kwitansi atau NIS..." class="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-[13px] outline-none focus:border-[#1B5FD9]">
      </div>
      <select v-model="fMetode" class="rounded-lg border border-slate-300 px-2.5 py-2.5 text-[12.5px] text-slate-600"><option value="">Semua Metode</option><option>Tunai</option><option>Transfer</option><option>QRIS</option></select>
      <button type="button" @click="ekspor" class="ml-auto rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white">Ekspor Riwayat (CSV)</button>
    </div>
    <p class="mt-3 text-[12.5px] text-slate-500">Satu-satunya sumber angka Total Dibayar siswa. Menampilkan {{ rows.length }} dari {{ total }} transaksi (maks 100 per muat agar ringan). Baris yang sudah masuk cut-off <b>terkunci</b> — tidak bisa diubah / dihapus.</p>
    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:160px 240px 100px 1fr 170px 130px 120px">
        <span>No Kwitansi</span><span>Siswa (NIS)</span><span>Tingkat</span><span>Nominal &amp; Keterangan</span><span>Petugas</span><span>Status</span><span>Aksi</span>
      </div>
      <div v-for="b in rows" :key="b.no" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[160px_240px_100px_1fr_170px_130px_120px]">
        <span><b class="font-semibold text-[#1B5FD9]">{{ b.no }}</b><br><span class="text-[12px] text-slate-500">{{ b.tanggal }}</span></span>
        <span class="flex min-w-0 items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(namaSiswa(b.nis)?.nama || b.nis) }}</span>
          <span class="min-w-0"><button type="button" @click="emit('buka', b.nis)" class="block max-w-full truncate text-left font-semibold text-slate-800 hover:underline">{{ namaSiswa(b.nis)?.nama || '(siswa tidak ditemukan)' }}</button><span class="block text-[12px] text-slate-500">{{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}</span></span>
        </span>
        <span><span class="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{{ TINGKAT_SINGKAT[b.tingkat] }}</span></span>
        <span><b class="tabular-nums font-semibold text-[#067647]">{{ rp(b.nominal) }}</b><br><span class="text-[12px] text-slate-500">{{ b.keterangan }} &middot; {{ b.metode }}</span></span>
        <span class="text-[12.5px] text-slate-500">{{ b.petugas }}</span>
        <span v-if="b.cutoff" class="text-[12.5px] font-semibold text-[#B54708]">Cut-off {{ b.cutoff }}</span>
        <span v-else class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Terbuka</span>
        <span><button v-if="!b.cutoff" type="button" @click="hapus(b)" class="text-[13px] font-semibold text-[#B42318]">Hapus</button><span v-else class="text-[12.5px] text-slate-400">Terkunci</span></span>
      </div>
      <div v-if="!rows.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Tidak ada riwayat yang cocok</b><p class="mt-1 text-[13px] text-slate-500">Ubah pencarian atau filter metode.</p></div>
    </div>
  </div>
</template>
