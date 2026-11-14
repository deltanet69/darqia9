<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  useModulPembelajaran, saringDaftarModul, bolehSunting, LABEL_STATUS,
  type PeranModul
} from '~/composables/useModulPembelajaran'

const props = defineProps<{ jenjang: 'SMP' | 'SMK'; role: PeranModul }>()
const store = useModulPembelajaran()
const { daftar, arsip, penulisAktifId, memuat, tabelSiap, pesan } = store
const rbac = useRbac()
// Superadmin selalu boleh; selain itu perlu izin buat dan akun yang tertaut data guru (penyusun = guru).
const bolehBuat = computed(() => props.role === 'superadmin' || (!!penulisAktifId.value && rbac.bisaSaya('Modul Pembelajaran', 'buat')))

const kata = ref('')
const fStatus = ref('')
const fPenyusun = ref('')
const fJenis = ref('')
const tampilArsip = ref(false)

const hasil = computed(() => saringDaftarModul(daftar.value, { kata: kata.value, status: fStatus.value, penyusunId: fPenyusun.value, jenis: fJenis.value }))
const penyusunUnik = computed(() => {
  const peta = new Map<string, string>()
  daftar.value.forEach(m => { if (m.authorTeacherId) peta.set(m.authorTeacherId, m.penyusun) })
  return [...peta.entries()].map(([id, nama]) => ({ id, nama }))
})

const resetFilter = () => { kata.value = ''; fStatus.value = ''; fPenyusun.value = ''; fJenis.value = '' }
const muatUlang = async () => { await store.muat(props.jenjang); if (tampilArsip.value) await store.muatArsip(props.jenjang) }
onMounted(muatUlang)
watch(() => props.jenjang, muatUlang)
watch(tampilArsip, async v => { if (v) await store.muatArsip(props.jenjang) })

const chipStatus = (s: string) => s === 'disetujui'
  ? 'bg-emerald-600 text-white'
  : s === 'menunggu' ? 'bg-amber-300 text-amber-900' : 'bg-slate-400 text-white'
const labelJenis = (j: string) => j === 'projek' ? 'Projek kokurikuler lintas mapel · PjBL' : 'Modul ajar mata pelajaran · PjBL'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start gap-3">
      <div class="min-w-0">
        <h1 class="text-[22px] leading-7 font-semibold text-blue-950">Modul Pembelajaran</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">Dokumen modul ajar &amp; projek — disusun guru, dikumpulkan, disetujui admin, lalu dipakai di kelas.</p>
      </div>
      <NuxtLink v-if="bolehBuat" to="/adminV2/modul-ajar/baru" class="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition">+ Buat Modul</NuxtLink>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] text-slate-500">
      <span>Menampilkan modul jenjang <span class="font-medium text-slate-700">{{ jenjang }}</span> — pilihan jenjang mengikuti pengalih global di bilah atas.</span>
    </div>

    <div v-if="!tabelSiap" class="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-[13px]">
      {{ pesan || 'Tabel modul belum tersedia. Jalankan migrasi 0022_modul_pembelajaran.sql di Supabase SQL Editor.' }}
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <div class="relative flex-1 min-w-[230px]">
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path stroke-linecap="round" d="M20 20l-3.5-3.5" /></svg>
        <input v-model="kata" type="text" placeholder="Cari judul projek, penyusun, atau kata kunci…" class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-[13px]">
      </div>
      <select v-model="fStatus" class="bg-white border border-slate-300 rounded-lg px-2.5 py-2.5 text-[12.5px] text-slate-600">
        <option value="">Semua Status</option>
        <option value="disetujui">Disetujui</option>
        <option value="menunggu">Menunggu Persetujuan</option>
        <option value="draf">Draf</option>
      </select>
      <select v-model="fPenyusun" class="bg-white border border-slate-300 rounded-lg px-2.5 py-2.5 text-[12.5px] text-slate-600">
        <option value="">Semua Penyusun</option>
        <option v-for="p in penyusunUnik" :key="p.id" :value="p.id">{{ p.nama }}</option>
      </select>
      <select v-model="fJenis" class="bg-white border border-slate-300 rounded-lg px-2.5 py-2.5 text-[12.5px] text-slate-600">
        <option value="">Semua Jenis</option>
        <option value="projek">Projek Kokurikuler</option>
        <option value="mapel">Modul Ajar Mapel</option>
      </select>
    </div>
    <div class="mt-2 flex items-center gap-3 text-[12px] text-slate-400">
      <span>Menampilkan {{ hasil.length }} dari {{ daftar.length }} modul</span>
      <button class="font-medium text-blue-700" @click="resetFilter">Reset filter</button>
      <span v-if="memuat">· memuat…</span>
    </div>

    <div class="mt-3 bg-white border border-slate-300 rounded-xl overflow-hidden">
      <div class="hidden lg:grid grid-cols-[minmax(0,1.7fr)_minmax(0,.65fr)_minmax(0,.75fr)_minmax(0,.85fr)_128px_52px] gap-x-4 px-4 py-2.5 bg-slate-100 border-b border-slate-300 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
        <span>Modul</span><span>Fase · Kelas</span><span>Alokasi</span><span>Penyusun</span><span>Status</span><span />
      </div>
      <div class="divide-y divide-slate-200">
        <div
          v-for="m in hasil" :key="m.id"
          class="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,.65fr)_minmax(0,.75fr)_minmax(0,.85fr)_128px_52px] gap-x-4 gap-y-1 px-4 py-3.5 items-center hover:bg-slate-50 transition cursor-pointer"
          @click="navigateTo(`/adminV2/modul-ajar/${m.id}`)"
        >
          <div class="min-w-0">
            <div class="text-[14px] font-semibold text-blue-950">{{ m.nomor ? `Modul ${m.nomor} — ` : '' }}{{ m.judul || '(judul belum diisi)' }}</div>
            <div class="text-[12px] text-slate-500 mt-0.5">
              {{ labelJenis(m.jenis) }}<template v-if="m.status === 'disetujui' && m.tahapBerjalan"> · tahap {{ m.tahapBerjalan }} dari 6 sedang berjalan</template>
              <template v-else-if="m.authorTeacherId !== penulisAktifId && role !== 'superadmin'"> · modul guru lain — hanya bisa dibaca</template>
            </div>
            <div v-if="m.status === 'disetujui' && m.tahapBerjalan" class="mt-2 h-1 w-44 rounded-full bg-slate-200 overflow-hidden">
              <div class="h-full bg-emerald-600" :style="{ width: `${Math.round(m.tahapBerjalan / 6 * 100)}%` }" />
            </div>
          </div>
          <div class="text-[12.5px] text-slate-600">{{ m.fase || '—' }}<template v-if="m.kelas"> · {{ m.kelas }}</template></div>
          <div class="text-[12.5px] text-slate-600">{{ m.alokasiJp ? `${m.alokasiJp} JP` : '—' }}<template v-if="m.jumlahPertemuan"> · {{ m.jumlahPertemuan }} pertemuan</template></div>
          <div class="text-[12.5px] text-slate-600">{{ m.penyusun }}</div>
          <div><span class="inline-block text-[11px] font-semibold rounded px-2 py-1" :class="chipStatus(m.status)">{{ LABEL_STATUS[m.status] }}</span></div>
          <div class="text-[12.5px] font-medium lg:text-right" :class="bolehSunting(m, role, penulisAktifId) ? 'text-blue-700' : 'text-slate-500'">{{ bolehSunting(m, role, penulisAktifId) ? 'Buka' : 'Lihat' }}</div>
        </div>
        <div v-if="!hasil.length" class="px-4 py-10 text-center">
          <div class="text-[13.5px] font-medium text-slate-600">{{ daftar.length ? 'Tidak ada modul yang cocok' : 'Belum ada modul' }}</div>
          <p class="text-[12.5px] text-slate-400 mt-1">{{ daftar.length ? 'Coba kata kunci lain, atau longgarkan filternya.' : 'Buat modul pertama untuk jenjang ini.' }}</p>
          <button v-if="daftar.length" class="mt-3 text-[12.5px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition" @click="resetFilter">Reset Filter</button>
        </div>
      </div>
    </div>

    <div class="mt-3 bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12px] text-slate-500">
      <span><span class="font-medium text-slate-700">Baca:</span> semua guru bisa membaca &amp; melihat seluruh modul</span>
      <span><span class="font-medium text-slate-700">Sunting:</span> hanya penulis modul</span>
      <span><span class="font-medium text-slate-700">Superadmin:</span> CRUD penuh</span>
      <span><span class="font-medium text-slate-700">Hapus:</span> soft delete — masuk arsip, bisa dipulihkan</span>
      <span><span class="font-medium text-slate-700">Alur:</span> buat → kumpulkan → admin menyetujui</span>
    </div>

    <div v-if="role === 'superadmin'" class="mt-3">
      <button class="text-[12.5px] font-medium text-slate-500" @click="tampilArsip = !tampilArsip">{{ tampilArsip ? 'Sembunyikan' : 'Tampilkan' }} arsip soft delete ({{ arsip.length }})</button>
      <div v-if="tampilArsip" class="mt-2 bg-white border border-dashed border-slate-300 rounded-xl divide-y divide-slate-100">
        <div v-for="m in arsip" :key="m.id" class="px-4 py-3 flex flex-wrap items-center gap-3">
          <div class="min-w-0 flex-1">
            <div class="text-[13px] font-medium text-slate-500">{{ m.judul || '(tanpa judul)' }}</div>
            <div class="text-[11.5px] text-slate-400">{{ m.penyusun }} · diarsipkan {{ m.deletedAt?.slice(0, 10) }}</div>
          </div>
          <button class="text-[12px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition" @click="store.pulihkan(m).then(() => muatUlang())">Pulihkan</button>
        </div>
        <div v-if="!arsip.length" class="px-4 py-4 text-[12.5px] text-slate-400">Arsip kosong.</div>
      </div>
    </div>
  </div>
</template>
