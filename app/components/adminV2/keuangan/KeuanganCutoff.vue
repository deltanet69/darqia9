<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { formatTanggal, labelAliran, rp, type Cutoff, type Pembayaran } from '~/composables/keuanganCore'

// Cut-off DIREDEFINISI hasil meeting manajemen 4 Nov 2026:
// - Yang direkap & diserahkan ke administrasi/yayasan HANYA uang TUNAI.
//   Transfer & QRIS langsung masuk rekening — tidak ikut cut-off.
// - Alur: pilih tampilan Harian / Mingguan / Kustom -> daftar transaksi
//   tunai dalam rentang tampil -> klik Release -> isi jumlah yang
//   diserahkan + bukti pemasukan -> transaksi tunai terkunci.
const grade = useAdminGrade()
const K = useKeuangan()
const notif = ref('')
const mode = ref<'harian' | 'mingguan' | 'kustom'>('harian')
const acuan = ref(new Date().toISOString().slice(0, 10))
const dari = ref('2026-11-01')
const sampai = ref('2026-11-03')
const rowsRentang = ref<Pembayaran[]>([])
const sibuk = ref(false)
const rilisBuka = ref(false)
const rilisJumlah = ref('')
const rilisOleh = ref('Anis Azyzy, S.T')
const rilisBukti = ref(false)
const ubahTarget = ref<Cutoff | null>(null)
const ubahOleh = ref('')
const ubahBukti = ref(false)
const ubahJumlah = ref('')
const sibukUbah = ref(false)
const konfirmHapus = ref<Cutoff | null>(null)
const sibukHapus = ref(false)

const tampilNotif = (t: string) => { notif.value = t; setTimeout(() => { notif.value = '' }, 3400) }
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)
const isoDariTanggal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const rentang = computed<{ dariISO: string, sampaiISO: string, label: string }>(() => {
  if (mode.value === 'kustom') return { dariISO: dari.value, sampaiISO: sampai.value, label: `${formatTanggal(dari.value)} s/d ${formatTanggal(sampai.value)}` }
  const d = new Date(acuan.value + 'T00:00:00')
  if (mode.value === 'harian') return { dariISO: acuan.value, sampaiISO: acuan.value, label: formatTanggal(acuan.value) }
  const senin = new Date(d)
  senin.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const minggu = new Date(senin)
  minggu.setDate(senin.getDate() + 6)
  const a = isoDariTanggal(senin)
  const b = isoDariTanggal(minggu)
  return { dariISO: a, sampaiISO: b, label: `Minggu ${formatTanggal(a)} s/d ${formatTanggal(b)}` }
})

const tampilkan = async () => {
  const { rows } = await K.muatRiwayat(grade.value, { dari: 0, jumlah: 500, dariISO: rentang.value.dariISO, sampaiISO: rentang.value.sampaiISO })
  rowsRentang.value = rows
}
watch([mode, acuan, dari, sampai], tampilkan)
watch(grade, tampilkan)

const tunai = computed(() => rowsRentang.value.filter(b => b.metode === 'Tunai'))
const tunaiTerbuka = computed(() => tunai.value.filter(b => !b.cutoff))
const totalTunaiTerbuka = computed(() => tunaiTerbuka.value.reduce((a, b) => a + b.nominal, 0))
const tunaiTerkunci = computed(() => tunai.value.filter(b => b.cutoff))
const nonTunai = computed(() => rowsRentang.value.filter(b => b.metode !== 'Tunai'))
const totalNonTunai = computed(() => nonTunai.value.reduce((a, b) => a + b.nominal, 0))
const cutoffs = computed(() => K.state.value.cutoffs.filter(c => c.grade === grade.value))
const terakhir = computed(() => cutoffs.value[0])

const bukaRilis = () => {
  rilisJumlah.value = String(totalTunaiTerbuka.value)
  rilisBukti.value = false
  rilisBuka.value = true
}
const angkaRilis = computed(() => Math.max(0, parseInt(rilisJumlah.value.replace(/[^0-9]/g, ''), 10) || 0))

const rilis = async () => {
  sibuk.value = true
  try {
    const { cutoff: c, modeLama } = await K.buatCutoff(grade.value, rentang.value.dariISO, rentang.value.sampaiISO, rilisOleh.value.trim() || 'Anis Azyzy, S.T', angkaRilis.value)
    if (rilisBukti.value) await K.unggahBuktiCutoff(c)
    tampilNotif(`Release cut-off ${c.kode} selesai: ${c.trx} transaksi TUNAI (${rp(c.total)}) terkunci & diserahkan ke yayasan${angkaRilis.value !== c.total ? ` — jumlah diserahkan ${rp(angkaRilis.value)} (selisih ${rp(Math.abs(angkaRilis.value - c.total))})` : ''}.${modeLama ? ' Catatan: masih mode lama (semua metode) — jalankan migrasi 0030 agar cut-off khusus tunai.' : ''}`)
    rilisBuka.value = false
    await tampilkan()
  } catch (e: any) {
    tampilNotif(e?.message || 'Release cut-off gagal.')
  } finally { sibuk.value = false }
}

const bukaUbah = (c: Cutoff) => { ubahTarget.value = c; ubahOleh.value = c.oleh; ubahBukti.value = c.bukti; ubahJumlah.value = c.jumlahSetor !== null && c.jumlahSetor !== undefined ? String(c.jumlahSetor) : '' }
const simpanUbah = async () => {
  if (!ubahTarget.value) return
  sibukUbah.value = true
  try {
    const jumlah = ubahJumlah.value.trim() === '' ? null : Math.max(0, parseInt(ubahJumlah.value.replace(/[^0-9]/g, ''), 10) || 0)
    await K.ubahCutoff(ubahTarget.value, ubahOleh.value.trim(), ubahBukti.value, jumlah)
    tampilNotif(`Cut-off ${ubahTarget.value.kode} diperbarui — penanggung jawab, jumlah setor & status bukti serah tersimpan.`)
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

    <p v-if="terakhir" class="mt-5 rounded-xl border border-[#1B5FD9]/30 bg-[#EAF1FC] px-4 py-3 text-[13px] text-slate-600">Release cut-off terakhir: <b class="text-slate-800">{{ terakhir.dari }} s/d {{ terakhir.sampai }}</b> — tunai sebesar <b class="text-slate-800">{{ rp(terakhir.total) }}</b> sudah diserahkan dari sekolah ke yayasan.</p>

    <div class="mt-3 rounded-xl border border-slate-300 bg-white p-4">
      <p class="text-[14.5px] font-semibold text-slate-800">Cut-off &amp; Release Dana Tunai</p>
      <p class="mt-0.5 text-[13px] text-slate-500">Hanya pembayaran <b>Tunai</b> yang direkap di sini dan diserahkan fisik ke yayasan. Transfer &amp; QRIS langsung masuk rekening sekolah — tampil sebagai informasi saja, tidak ikut di-release.</p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <button v-for="m in ([['harian', 'Harian'], ['mingguan', 'Mingguan'], ['kustom', 'Kustom']] as const)" :key="m[0]" type="button" @click="mode = m[0]"
          :class="mode === m[0] ? 'rounded-full bg-[#101828] px-3.5 py-2 text-[12.5px] font-semibold text-white' : 'rounded-full bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'">{{ m[1] }}</button>
        <template v-if="mode !== 'kustom'">
          <input v-model="acuan" type="date" class="bg-white rounded-lg border border-slate-300 px-3 py-2 text-[13px]">
          <span class="text-[12.5px] text-slate-500">{{ mode === 'harian' ? 'Menampilkan satu hari itu.' : 'Menampilkan Senin–Minggu dari tanggal terpilih.' }}</span>
        </template>
        <template v-else>
          <input v-model="dari" type="date" class="bg-white rounded-lg border border-slate-300 px-3 py-2 text-[13px]">
          <span class="text-slate-400">s/d</span>
          <input v-model="sampai" type="date" class="bg-white rounded-lg border border-slate-300 px-3 py-2 text-[13px]">
        </template>
        <button type="button" :disabled="!tunaiTerbuka.length || sibuk" @click="bukaRilis" class="ml-auto rounded-xl bg-[#067647] px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Release Cut-off ({{ tunaiTerbuka.length }} transaksi tunai)</button>
      </div>
      <p class="mt-2 text-[12.5px] text-slate-500">Rentang aktif: <b class="text-slate-700">{{ rentang.label }}</b></p>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Tunai Belum Di-release</p><p class="mt-1 text-[24px] font-semibold leading-8 text-[#B54708]">{{ rp(totalTunaiTerbuka) }}</p><p class="text-[12px] text-slate-500">{{ tunaiTerbuka.length }} transaksi siap diserahkan</p></div>
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Tunai Sudah Terkunci</p><p class="mt-1 text-[24px] font-semibold leading-8 text-[#1B5FD9]">{{ rp(tunaiTerkunci.reduce((a, b) => a + b.nominal, 0)) }}</p><p class="text-[12px] text-slate-500">{{ tunaiTerkunci.length }} transaksi dalam rentang ini</p></div>
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Transfer / QRIS (info)</p><p class="mt-1 text-[24px] font-semibold leading-8 text-slate-700">{{ rp(totalNonTunai) }}</p><p class="text-[12px] text-slate-500">{{ nonTunai.length }} transaksi — langsung ke rekening, tidak di-cut-off</p></div>
      <div class="rounded-xl border border-slate-300 bg-white p-4"><p class="text-[12px] font-medium text-slate-500">Total Semua Metode</p><p class="mt-1 text-[24px] font-semibold leading-8 text-[#067647]">{{ rp(rowsRentang.reduce((a, b) => a + b.nominal, 0)) }}</p><p class="text-[12px] text-slate-500">{{ rowsRentang.length }} pembayaran dalam rentang</p></div>
    </div>

    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:150px 1fr 110px 1fr 1fr 150px">
        <span>Kwitansi</span><span>Siswa</span><span>Aliran</span><span>Nominal</span><span>Keterangan</span><span>Status</span>
      </div>
      <div v-for="b in tunai" :key="b.no" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[150px_1fr_110px_1fr_1fr_150px]">
        <span><b class="text-[13.5px] font-semibold text-slate-800">{{ b.no }}</b><br><span class="text-[12px] text-slate-500">{{ b.tanggal }} &middot; Tunai</span></span>
        <span><b class="font-medium text-slate-800">{{ namaSiswa(b.nis)?.nama || b.nis }}</b><br><span class="text-[12px] text-slate-500">{{ b.nis }} &middot; {{ namaSiswa(b.nis)?.kelas || '' }}</span></span>
        <span><span class="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{{ labelAliran(b.tingkat) }}</span></span>
        <span class="tabular-nums font-semibold text-[#067647]">{{ rp(b.nominal) }}</span>
        <span>{{ b.keterangan }}</span>
        <span v-if="b.cutoff" class="text-[12.5px] font-semibold text-[#B54708]">Terkunci — {{ b.cutoff }}</span>
        <span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum Di-release</span>
      </div>
      <div v-if="!tunai.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Tidak ada transaksi TUNAI dalam rentang ini</b><p class="mt-1 text-[13px] text-slate-500">Ganti tampilan periode atau tanggal acuannya.</p></div>
    </div>
    <p v-if="nonTunai.length" class="mt-3 text-[12.5px] text-slate-500">Dalam rentang ini juga ada {{ nonTunai.length }} pembayaran Transfer/QRIS senilai {{ rp(totalNonTunai) }} — tidak ditampilkan di daftar release karena langsung masuk rekening.</p>

    <div class="mt-6 flex flex-wrap items-center gap-2">
      <p class="text-[15px] font-semibold text-slate-800">Riwayat Cut-off</p>
      <span class="text-[12.5px] text-slate-500">Setiap release adalah bukti serah dana tunai sekolah &rarr; yayasan (keuangan pusat).</span>
    </div>
    <div v-if="konfirmHapus" class="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-[#FEF3F2] px-4 py-3">
      <p class="min-w-0 flex-1 text-[13px] text-[#B42318]">Hapus cut-off <b>{{ konfirmHapus.kode }}</b> ({{ konfirmHapus.dari }} s/d {{ konfirmHapus.sampai }})? <b>{{ konfirmHapus.trx }} transaksi</b> senilai <b>{{ rp(konfirmHapus.total) }}</b> akan <b>terbuka kembali</b> dan dana dianggap belum diserahkan ke keuangan pusat.</p>
      <button type="button" @click="konfirmHapus = null" class="rounded-lg bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
      <button type="button" :disabled="sibukHapus" @click="hapus" class="rounded-lg bg-[#B42318] px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40">Ya, Hapus &amp; Buka Kunci</button>
    </div>
    <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:185px 55px 45px 1fr 1fr 120px 1fr 150px">
        <span>Rentang Tanggal</span><span>Hari</span><span>Trx</span><span>Total Tunai</span><span>Jumlah Diserahkan</span><span>Bukti Serah</span><span>Oleh</span><span>Aksi</span>
      </div>
      <div v-for="c in cutoffs" :key="c.kode" class="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 lg:grid-cols-[185px_55px_45px_1fr_1fr_120px_1fr_150px]">
        <span><b class="font-semibold text-slate-800">{{ c.kode }}</b><br><span class="text-[12px] text-slate-500">{{ c.dari }} s/d {{ c.sampai }}</span></span>
        <span>{{ c.hari }} hari</span>
        <span>{{ c.trx }}</span>
        <span class="tabular-nums font-semibold text-[#067647]">{{ rp(c.total) }}</span>
        <span class="tabular-nums">
          <template v-if="c.jumlahSetor !== null && c.jumlahSetor !== undefined">{{ rp(c.jumlahSetor) }}<span v-if="c.jumlahSetor !== c.total" class="ml-1 rounded bg-[#FFFAEB] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#B54708]">selisih {{ rp(Math.abs(c.jumlahSetor - c.total)) }}</span></template>
          <span v-else class="text-slate-400">—</span>
        </span>
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

    <!-- ===== Release cut-off ===== -->
    <div v-if="rilisBuka" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="rilisBuka = false">
      <div class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p class="text-[16px] font-semibold text-slate-900">Release Cut-off — Serah Dana Tunai</p>
        <p class="mt-0.5 text-[13px] text-slate-500">Rentang {{ rentang.label }} &middot; {{ tunaiTerbuka.length }} transaksi tunai &middot; total {{ rp(totalTunaiTerbuka) }}</p>
        <div class="mt-4 grid gap-3">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Jumlah yang Diserahkan ke Yayasan (Rp)</label><input v-model="rilisJumlah" inputmode="numeric" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] tabular-nums"></div>
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Diserahkan Oleh (Petugas Sekolah)</label><input v-model="rilisOleh" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
          <label class="flex items-center gap-2.5 rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] text-slate-700">
            <input v-model="rilisBukti" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]">
            Bukti pemasukan / serah terima sudah ada
          </label>
        </div>
        <p v-if="angkaRilis !== totalTunaiTerbuka" class="mt-3 rounded-lg bg-[#FFFAEB] px-3 py-2 text-[12.5px] font-medium text-[#B54708]">Jumlah diserahkan ({{ rp(angkaRilis) }}) berbeda dari total tunai rentang ini ({{ rp(totalTunaiTerbuka) }}) — selisih {{ rp(Math.abs(angkaRilis - totalTunaiTerbuka)) }} akan tercatat di riwayat cut-off.</p>
        <p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">Setelah di-release, {{ tunaiTerbuka.length }} transaksi tunai dalam rentang ini <b>terkunci</b> (tidak bisa diubah/dihapus) sebagai bukti serah dana.</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="rilisBuka = false" class="rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 ring-1 ring-slate-300">Batal</button>
          <button type="button" :disabled="sibuk || angkaRilis <= 0" @click="rilis" class="rounded-xl bg-[#067647] px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Release &amp; Kunci Transaksi</button>
        </div>
      </div>
    </div>

    <!-- ===== Ubah catatan cut-off ===== -->
    <div v-if="ubahTarget" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#101828]/60 sm:items-center sm:p-4" @click.self="ubahTarget = null">
      <div class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p class="text-[16px] font-semibold text-slate-900">Ubah Cut-off {{ ubahTarget.kode }}</p>
        <p class="mt-0.5 text-[13px] text-slate-500">{{ ubahTarget.dari }} s/d {{ ubahTarget.sampai }} &middot; {{ ubahTarget.trx }} transaksi &middot; {{ rp(ubahTarget.total) }}</p>
        <p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">Rentang tanggal, jumlah transaksi, dan total <b>tidak bisa diubah</b> — angka itu berasal dari transaksi yang terkunci di dalam cut-off ini. Yang dapat diperbarui hanya penanggung jawab serah, jumlah setor &amp; status bukti serahnya.</p>
        <div class="mt-4 grid gap-3">
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Diserahkan Oleh (Petugas Sekolah)</label><input v-model="ubahOleh" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px]"></div>
          <div><label class="mb-1 block text-[12px] font-medium text-slate-500">Jumlah Diserahkan (Rp)</label><input v-model="ubahJumlah" inputmode="numeric" placeholder="Kosongkan bila belum dicatat" class="bg-white w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[13.5px] tabular-nums"></div>
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
