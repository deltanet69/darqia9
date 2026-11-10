<template>
  <div class="space-y-5">
    <!-- Sapaan -->
    <div>
      <p class="text-xs font-semibold text-slate-500">{{ hariIni }}</p>
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Halo, {{ namaDepan }}</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Siapkan dirimu. Ujian dapat dimulai tepat pada jam yang dijadwalkan.</p>
    </div>

    <!-- Kartu peserta -->
    <div class="bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
      <div class="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex items-center gap-4 mb-5 relative">
        <div class="w-14 h-14 shrink-0 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg">{{ inisial }}</div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold uppercase tracking-wider text-blue-300">Kartu Peserta Ujian</div>
          <div class="text-lg font-black text-white leading-tight break-words">{{ profil.nama }}</div>
          <div class="text-xs text-slate-300 mt-0.5">NIS {{ profil.nis }} &bull; {{ profil.kelas || 'Tanpa kelas' }}</div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center text-xs relative">
        <div class="bg-white/5 rounded-xl p-2.5">
          <span class="block text-[10px] text-slate-400 uppercase font-semibold">Token</span>
          <b class="text-blue-300 font-mono font-bold text-xs block mt-0.5 break-all">{{ profil.token }}</b>
        </div>
        <div class="bg-white/5 rounded-xl p-2.5">
          <span class="block text-[10px] text-slate-400 uppercase font-semibold">Ruang</span>
          <b class="text-white font-bold block mt-0.5 break-words">{{ profil.ruang || 'Online' }}</b>
        </div>
        <div class="bg-white/5 rounded-xl p-2.5">
          <span class="block text-[10px] text-slate-400 uppercase font-semibold">Jenjang</span>
          <b class="text-white font-bold block mt-0.5">{{ profil.jenjang }}</b>
        </div>
      </div>
    </div>

    <!-- Informasi ujian -->
    <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Informasi Ujian</span>
        <span v-if="utama" class="text-[11px] font-bold px-2.5 py-1 rounded-full" :class="KEADAAN_INFO[keadaan(utama)].kelas">{{ KEADAAN_INFO[keadaan(utama)].label }}</span>
      </div>
      <dl v-if="utama" class="space-y-3 text-sm">
        <div>
          <dt class="text-xs text-slate-400">Mata Pelajaran</dt>
          <dd class="font-extrabold text-slate-900">{{ utama.mapel || 'Dirahasiakan sampai H-2' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-400">Materi</dt>
          <dd class="font-extrabold text-slate-900">{{ utama.nama || '-' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-400">Jadwal &amp; Durasi</dt>
          <dd class="font-extrabold text-slate-900">{{ hariPanjang(utama.mulai) }}, {{ jamRentang(utama.mulai, utama.durasi) }} WIB &bull; {{ utama.durasi }} menit</dd>
        </div>
      </dl>
      <p v-else class="text-sm text-slate-500">Belum ada ujian yang dijadwalkan untukmu.</p>
      <div class="mt-4 p-3 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs">
        Jawaban <b>tersimpan otomatis setiap 10 detik</b> dan aman walau halaman dimuat ulang.
      </div>
    </div>

    <!-- Ujian yang akan datang -->
    <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-5 shadow-sm">
      <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Ujian yang Akan Datang</h3>
      <ul v-if="akanDatang.length" class="space-y-2.5">
        <li v-for="u in akanDatang" :key="u.source + u.id" class="border border-slate-200 rounded-2xl p-3.5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-[11px] font-bold text-blue-600">{{ JENIS_LABEL[u.jenis] }}</div>
              <div class="font-extrabold text-slate-900 break-words">{{ u.mapel || 'Detail dibuka H-2' }}</div>
              <div class="text-xs text-slate-500 mt-0.5">{{ hariPanjang(u.mulai) }} &bull; {{ jamRentang(u.mulai, u.durasi) }} WIB</div>
            </div>
            <span class="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full" :class="KEADAAN_INFO[keadaan(u)].kelas">{{ KEADAAN_INFO[keadaan(u)].label }}</span>
          </div>
          <button
            v-if="bisaDibuka(keadaan(u))"
            type="button"
            class="mt-3 w-full py-3 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            @click="emit('buka', u)"
          >
            {{ keadaan(u) === 'berjalan' ? 'Lanjutkan Ujian' : 'Masuk Ujian' }}
          </button>
          <p v-else-if="keadaan(u) !== 'lewat' && keadaan(u) !== 'akun-terkunci'" class="mt-2.5 text-xs font-semibold text-slate-500">
            Dimulai dalam <b class="text-slate-800 tabular-nums">{{ hitungMundur(u.mulai, now) }}</b>
          </p>
        </li>
      </ul>
      <p v-else class="text-sm text-slate-500">Tidak ada ujian yang akan datang.</p>
    </div>

    <!-- Tata tertib -->
    <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-5 shadow-sm">
      <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Tata Tertib Ujian</h3>
      <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700 list-disc pl-5">
        <li>Kerjakan tepat waktu. Durasi sesuai jadwal ujian dan tidak dapat diperpanjang.</li>
        <li>Pastikan <b>koneksi internet stabil</b> dan baterai perangkat cukup selama ujian.</li>
        <li>Kerjakan <b>secara mandiri</b>. Dilarang membuka catatan, aplikasi, atau tab lain.</li>
        <li>Pelanggaran tata tertib berakibat <b>akun terkunci dan nilai dibatalkan</b>.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfilSiswa } from '~/composables/useCbtSiswa'
import {
  JENIS_LABEL, KEADAAN_INFO, bisaDibuka, hariPanjang, hitungMundur, jamRentang, keadaanUjian,
  type UjianSiswa
} from '~/utils/cbtSiswaJadwal'

const props = defineProps<{ profil: ProfilSiswa, ujian: UjianSiswa[], now: number }>()
const emit = defineEmits<{ (e: 'buka', u: UjianSiswa): void }>()

const keadaan = (u: UjianSiswa) => keadaanUjian(u, props.now)
const namaDepan = computed(() => props.profil.nama.split(' ')[0])
const inisial = computed(() => props.profil.nama.split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase())
const hariIni = computed(() => hariPanjang(new Date(props.now).toISOString()))

// Yang masih bisa/akan dikerjakan, urut waktu mulai.
const akanDatang = computed(() => props.ujian
  .filter(u => ['terkunci', 'belum', 'dibuka', 'berjalan'].includes(keadaan(u)))
  .sort((a, b) => a.mulai.localeCompare(b.mulai))
  .slice(0, 6))
// Kartu informasi: yang sedang berjalan/dapat dimulai didahulukan, lalu yang paling dekat.
const utama = computed(() => akanDatang.value.find(u => keadaan(u) === 'berjalan')
  ?? akanDatang.value.find(u => keadaan(u) === 'dibuka')
  ?? akanDatang.value[0] ?? null)
</script>
