<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SistemPageShell from '~/components/adminV2/sistem/SistemPageShell.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import { inisialNama, rp, type Pembayaran } from '~/composables/keuanganCore'

// Halaman Pembayaran — sub-menu baru hasil meeting manajemen 4 Nov 2026.
// Tombol Input Pembayaran TIDAK lagi membuka popup: petugas mencari siswa
// di halaman ini, klik hasilnya, lalu masuk ke Rincian Keuangan Siswa
// (di sana form pembayaran menempel di kolom kiri, model waterfall).
const grade = useAdminGrade()
const router = useRouter()
const K = useKeuangan()
const cari = ref('')
const terakhir = ref<Pembayaran[]>([])

const muatTerakhir = async () => {
  const r = await K.muatRiwayat(grade.value, { dari: 0, jumlah: 8 })
  terakhir.value = r.rows
}
onMounted(async () => { await K.muatSemua(grade.value); await muatTerakhir() })
watch(grade, async g => { await K.muatSemua(g); await muatTerakhir() })

const hasil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  if (q.length < 2) return []
  return K.barisSiswa(grade.value)
    .filter(s => s.nis.includes(q) || s.nama.toLowerCase().includes(q))
    .slice(0, 8)
})
const namaSiswa = (nis: string) => K.state.value.siswaInduk.find(s => s.nis === nis)
const bukaSiswa = (nis: string) => void router.push({ path: '/adminV2/keuangan', query: { siswa: nis } })
</script>

<template>
  <SistemPageShell judul="Pembayaran" modul-label="Pembayaran" modul-to="/adminV2/keuangan/pembayaran" grup-label="Keuangan" route-id="keuangan">
    <div>
      <h1 class="text-[22px] font-semibold leading-7 text-blue-950">Input Pembayaran</h1>
      <p class="mt-0.5 text-[13px] text-slate-500">Cari siswa berdasarkan NIS atau nama, klik hasilnya — rincian tagihan &amp; form pembayaran terbuka di satu halaman. Pembayaran mengalir otomatis (waterfall) menutup tagihan terlama dulu; kelebihan menjadi saldo.</p>

      <div v-if="K.lokal.value" class="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
        <b>Mode contoh lokal.</b> Migrasi keuangan belum dijalankan di Supabase, jadi halaman menampilkan data contoh agar bisa diperiksa dulu.
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-[#1B5FD9]/30 bg-[#EAF1FC] px-4 py-3">
        <span class="rounded-md bg-[#1B5FD9] px-2 py-1 text-[10.5px] font-bold tracking-wide text-white">JENJANG AKTIF</span>
        <p class="text-[13px] text-slate-600">Mencari siswa <b class="text-slate-800">{{ grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}</b> — ganti jenjang lewat tombol SMP / SMK di kanan atas.</p>
      </div>

      <div class="mt-4 rounded-xl border border-slate-300 bg-white p-4">
        <p class="text-[14.5px] font-semibold text-slate-800">Cari Siswa</p>
        <p class="mt-0.5 text-[12.5px] text-slate-500">Wali murid umumnya hafal NIS anaknya — NIS adalah ID pembayaran resmi siswa sampai lulus.</p>
        <div class="relative mt-3 max-w-xl">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="cari" placeholder="Ketik NIS atau nama siswa..." class="bg-white w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-[13.5px] outline-none focus:border-[#1B5FD9]">
        </div>
        <div v-if="hasil.length" class="mt-2 max-w-xl divide-y divide-slate-100 rounded-xl border border-slate-200">
          <button v-for="s in hasil" :key="s.nis" type="button" @click="bukaSiswa(s.nis)" class="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(s.nama) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[13.5px] font-medium text-slate-800">{{ s.nama }}</span>
              <span class="block text-[12px] text-slate-500">NIS {{ s.nis }} &middot; {{ s.kelas }}</span>
            </span>
            <span v-if="!s.kode" class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum dipasang kode</span>
            <span v-else-if="s.hitung.saldo > 0" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Saldo {{ rp(s.hitung.saldo) }}</span>
            <span v-else-if="s.hitung.sisa > 0" class="text-right text-[12.5px]"><span class="block text-slate-500">Sisa</span><b class="tabular-nums text-[#B42318]">{{ rp(s.hitung.sisa) }}</b></span>
            <span v-else class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas</span>
          </button>
        </div>
        <p v-else-if="cari.trim().length >= 2" class="mt-2 text-[12.5px] text-slate-500">Tidak ada siswa yang cocok pada jenjang ini. Periksa lagi NIS / nama, atau pastikan jenjang aktif sudah benar.</p>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <p class="text-[15px] font-semibold text-slate-800">Pembayaran Terakhir</p>
        <span class="text-[12.5px] text-slate-500">Klik baris untuk membuka rincian siswanya.</span>
      </div>
      <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <button v-for="b in terakhir" :key="b.no" type="button" @click="bukaSiswa(b.nis)" class="flex w-full flex-wrap items-center gap-3 border-t border-slate-200 px-4 py-3 text-left first:border-t-0 hover:bg-slate-50">
          <span class="min-w-0 flex-1">
            <b class="text-[13.5px] font-medium text-slate-800">{{ namaSiswa(b.nis)?.nama || b.nis }}</b>
            <span class="block text-[12.5px] text-slate-500">{{ b.no }} &middot; {{ b.tanggal }} &middot; {{ b.keterangan }} &middot; {{ b.metode }}</span>
          </span>
          <b class="tabular-nums text-[#067647]">{{ rp(b.nominal) }}</b>
        </button>
        <div v-if="!terakhir.length" class="px-4 py-8 text-center text-[13px] text-slate-500">Belum ada pembayaran tercatat pada jenjang ini.</div>
      </div>
    </div>
  </SistemPageShell>
</template>
