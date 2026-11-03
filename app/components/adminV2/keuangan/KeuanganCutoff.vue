<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { formatTanggal, rp, TINGKAT_SINGKAT, type Cutoff, type Pembayaran } from '~/composables/keuanganCore'

const grade = useAdminGrade()
const K = useKeuangan()
const notif = ref('')
const dari = ref('2026-11-01')
const sampai = ref('2026-11-03')
const rowsRentang = ref<Pembayaran[]>([])
const sibuk = ref(false)
const ubahTarget = ref<Cutoff | null>(null)
const ubahOleh = ref('')
const ubahBukti = ref(false)
const sibukUbah = ref(false)
const konfirmHapus = ref<Cutoff | null>(null)
const sibukHapus = ref(false)

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

const bukaUbah = (c: Cutoff) => { ubahTarget.value = c; ubahOleh.value = c.oleh; ubahBukti.value = c.bukti }
const simpanUbah = async () => {
  if (!ubahTarget.value) return
  sibukUbah.value = true
  try {
    await K.ubahCutoff(ubahTarget.value, ubahOleh.value.trim(), ubahBukti.value)
    tampilNotif(`Cut-off ${ubahTarget.value.kode} diperbarui — penanggung jawab & status bukti serah tersimpan.`)
    ubahTarget.value = null
  } catch (e: any) {
    tampilNotif(e?.message || 'Perubahan cut-off gagal disimpan.')
  } finally { sibukUbah.value = false }
}
const hapus = async () => {
  if (!konfirmHapus.value) return
  sibukHapus.value = true
  try {
    const c = konfirmHapus.value
    await K.hapusCutoff(c)
    tampilNotif(`Cut-off ${c.kode} dihapus. ${c.trx} transaksi (${rp(c.total)}) terbuka kembali dan dana dianggap belum diserahkan.`)
    konfirmHapus.value = null
    await tampilkan()
  } catch (e: any) {
    tampilNotif(e?.message || 'Cut-off gagal dihapus.')
  } finally { sibukHapus.value = false }
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
      <span class="text-[12.5px] text-slate-500">Setiap cut-off adalah bukti serah dana sekolah &rarr; yayasan (keuangan pusat).</span>
    </div>
    <div v-if="konfirmHapus" class="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-[#FEF3F2] px-4 py-3">
      <p class="min-w-0 flex-1 text-[13px] text-[#B42318]">Hapus cut-off <b>{{ konfirmHapus.kode }}</b> ({{ konfirmHapus.dari }} s/d {{ konfirmHapus.sampai }})? <b>{{ konfirmHapus.trx }} transaksi</b> senilai <b>{{ rp(konfirmHapus.total) }}</b> akan <b>terbuka kembali</b> dan dana dianggap belum diserahkan ke keuangan pusat.</p>
      <button type="button" @click="konfirmHapus = null" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
      <button type="button" :disabled="sibukHapus" @click="hapus" class="rounded-lg bg-[#B42318] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40">Ya, Hapus &amp; Buka Kunci</button>
    </div>
    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:190px 70px 70px 1fr 140px 1fr 170px">
        <span>Rentang Tanggal</span><span>Hari</span><span>Trx</span><span>Total</span><span>Bukti Serah</span><span>Oleh</span><span>Aksi</span>
      </div>
      <div v-for="c in cutoffs" :key="c.kode" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[190px_70px_70px_1fr_140px_1fr_170px]">
        <span><b class="font-semibold text-slate-800">{{ c.kode }}</b><br><span class="text-[12px] text-slate-500">{{ c.dari }} s/d {{ c.sampai }}</span></span>
        <span>{{ c.hari }} hari</span>
        <span>{{ c.trx }}</span>
        <span class="tabular-nums font-semibold text-[#067647]">{{ rp(c.total) }}</span>
        <span v-if="c.bukti" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Sudah Diunggah</span>
        <span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum</span>
        <span class="text-[12.5px] text-slate-500">{{ c.oleh }}</span>
        <span class="flex flex-wrap gap-1.5">
          <button type="button" @click="bukaUbah(c)" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50">Ubah</button>
          <button type="button" @click="konfirmHapus = c" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-semibold text-[#B42318] ring-1 ring-red-200 hover:bg-[#FEF3F2]">Hapus</button>
        </span>
      </div>
      <div v-if="!cutoffs.length" class="px-4 py-10 text-center text-[13px] text-slate-500">Belum ada cut-off pada jenjang ini.</div>
    </div>
    <p class="mt-3 text-[12.5px] text-slate-500">Rentang contoh memakai tanggal kalender: {{ formatTanggal(dari) }} s/d {{ formatTanggal(sampai) }}.</p>

    <!-- ===== Ubah catatan cut-off ===== -->
    <div v-if="ubahTarget" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="ubahTarget = null">
      <div class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p class="text-[16px] font-semibold text-slate-900">Ubah Cut-off {{ ubahTarget.kode }}</p>
        <p class="mt-0.5 text-[13px] text-slate-500">{{ ubahTarget.dari }} s/d {{ ubahTarget.sampai }} &middot; {{ ubahTarget.trx }} transaksi &middot; {{ rp(ubahTarget.total) }}</p>
        <p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">Rentang tanggal, jumlah transaksi, dan total <b>tidak bisa diubah</b> — angka itu berasal dari transaksi yang terkunci di dalam cut-off ini. Yang dapat diperbarui hanya penanggung jawab serah &amp; status bukti serahnya.</p>
        <div class="mt-4 grid gap-3">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Diserahkan Oleh (Petugas Sekolah)</label><input v-model="ubahOleh" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
          <label class="flex items-center gap-2.5 rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] text-slate-700">
            <input v-model="ubahBukti" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]">
            Bukti serah ke keuangan pusat sudah diunggah / diterima
          </label>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="ubahTarget = null" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
          <button type="button" :disabled="sibukUbah" @click="simpanUbah" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  </div>
</template>
