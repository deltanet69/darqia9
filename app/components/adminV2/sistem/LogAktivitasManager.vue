<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

// Log Aktivitas — rekap agregat per modul dari fungsi log_rekap()
// (dihitung di database, migrasi 0024). Halaman hanya menarik satu
// baris per (modul, aksi); daftar pelaku dimuat malas (maks 50) saat
// grup dibuka. Baca dibatasi database khusus Superadmin.
interface BarisRekap { modul: string, aksi: string, jumlah: number, jumlahGalat: number, penggunaUnik: number, terakhir: string }
interface BarisDetail { actor_name: string, actor_role: string, detail: string, tingkat: string, created_at: string }

const client = useSupabaseClient()
const user = useSupabaseUser()
const rbac = useRbac()

const rentang = ref<'hari' | '7' | '30'>('7')
const hanyaMasalah = ref(false)
const rekap = ref<BarisRekap[]>([])
const memuat = ref(false)
const keadaan = ref<'siap' | 'terkunci' | 'belum-migrasi' | 'galat'>('siap')
const pesanGalat = ref('')
const kunciTerbuka = ref('')
const detailGrup = ref<Record<string, BarisDetail[]>>({})
const memuatDetail = ref('')

const superadmin = computed(() => !!rbac.peranSaya.value?.terkunci || ((user.value as any)?.email || '').toLowerCase() === 'betadev94@gmail.com')

const sejakIso = computed(() => {
  const d = new Date()
  if (rentang.value === 'hari') d.setHours(0, 0, 0, 0)
  else d.setDate(d.getDate() - (rentang.value === '7' ? 7 : 30))
  return d.toISOString()
})

const grupPerModul = computed(() => {
  const peta = new Map<string, { modul: string, total: number, galat: number, grup: BarisRekap[] }>()
  for (const b of rekap.value) {
    if (hanyaMasalah.value && b.jumlahGalat === 0) continue
    const entri = peta.get(b.modul) || { modul: b.modul, total: 0, galat: 0, grup: [] as BarisRekap[] }
    entri.total += b.jumlah
    entri.galat += b.jumlahGalat
    entri.grup.push(b)
    peta.set(b.modul, entri)
  }
  return [...peta.values()].sort((a, b) => b.total - a.total)
})
const totalAktivitas = computed(() => rekap.value.reduce((s, b) => s + b.jumlah, 0))
const totalGalat = computed(() => rekap.value.reduce((s, b) => s + b.jumlahGalat, 0))

const formatWaktu = (iso: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
const kapital = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
const inisial = (nama: string) => (nama || '?').split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase()
const kunciGrup = (b: BarisRekap) => `${b.modul}||${b.aksi}`

const muatRekap = async () => {
  memuat.value = true
  kunciTerbuka.value = ''
  detailGrup.value = {}
  const { data, error } = await client.rpc('log_rekap', { sejak: sejakIso.value })
  memuat.value = false
  if (error) {
    const pesan = `${error.code || ''} ${error.message || ''}`
    if (pesan.includes('Superadmin')) keadaan.value = 'terkunci'
    else if (pesan.includes('log_rekap') || pesan.includes('does not exist')) keadaan.value = 'belum-migrasi'
    else { keadaan.value = 'galat'; pesanGalat.value = error.message }
    rekap.value = []
    return
  }
  keadaan.value = 'siap'
  rekap.value = (data || []).map((b: any) => ({
    modul: b.modul, aksi: b.aksi, jumlah: Number(b.jumlah), jumlahGalat: Number(b.jumlah_galat),
    penggunaUnik: Number(b.pengguna_unik), terakhir: b.terakhir
  }))
}

const alihGrup = async (b: BarisRekap) => {
  const kunci = kunciGrup(b)
  if (kunciTerbuka.value === kunci) { kunciTerbuka.value = ''; return }
  kunciTerbuka.value = kunci
  if (detailGrup.value[kunci]) return
  memuatDetail.value = kunci
  const { data } = await client.from('activity_logs')
    .select('actor_name, actor_role, detail, tingkat, created_at')
    .eq('modul', b.modul).eq('aksi', b.aksi).gte('created_at', sejakIso.value)
    .order('created_at', { ascending: false }).limit(50)
  memuatDetail.value = ''
  detailGrup.value = { ...detailGrup.value, [kunci]: (data || []) as BarisDetail[] }
}

watch(rentang, muatRekap)
onMounted(async () => { await rbac.muat(); await muatRekap() })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-[22px] leading-7 font-semibold text-blue-950">Log Aktivitas</h1>
        <p class="mt-1 text-[13px] text-slate-500">Rekap aktivitas seluruh modul, diringkas per jenis aktivitas. Klik satu grup untuk melihat siapa saja pelakunya. Rekap dihitung di database — halaman ini tidak menarik ribuan baris mentah.</p>
      </div>
      <span class="rounded-full bg-blue-950 px-3 py-1.5 text-[11px] font-semibold text-white">Khusus Superadmin</span>
    </div>

    <div v-if="keadaan === 'terkunci'" class="mt-5 rounded-xl border border-slate-300 bg-white p-6 text-center">
      <p class="text-[15px] font-semibold text-slate-800">Halaman ini khusus Superadmin</p>
      <p class="mx-auto mt-1 max-w-md text-[13px] text-slate-500">Log Aktivitas memuat jejak seluruh pengguna di semua modul, sehingga aksesnya dibatasi hanya untuk pemegang peran Superadmin — ditegakkan langsung di database.</p>
    </div>

    <div v-else-if="keadaan === 'belum-migrasi'" class="mt-5 rounded-xl border border-[#FEDF89] bg-[#FFFAEB] p-5">
      <p class="text-[14px] font-semibold text-[#B54708]">Tabel log belum tersedia</p>
      <p class="mt-1 text-[13px] text-[#B54708]">Jalankan migrasi <strong>0024_log_aktivitas.sql</strong> di Supabase SQL Editor, lalu muat ulang halaman ini. Setelah itu seluruh aktivitas mulai tercatat otomatis.</p>
    </div>

    <div v-else-if="keadaan === 'galat'" class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">Rekap gagal dimuat: {{ pesanGalat }}</div>

    <template v-else>
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Total aktivitas</p>
          <p class="mt-1 text-[22px] font-semibold text-blue-950">{{ totalAktivitas }}</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Aktivitas galat / masalah</p>
          <p class="mt-1 text-[22px] font-semibold" :class="totalGalat ? 'text-red-600' : 'text-blue-950'">{{ totalGalat }}</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Modul tercatat</p>
          <p class="mt-1 text-[22px] font-semibold text-blue-950">{{ grupPerModul.length }}</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <select v-model="rentang" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-[12.5px] text-slate-600">
          <option value="hari">Hari ini</option>
          <option value="7">7 hari terakhir</option>
          <option value="30">30 hari terakhir</option>
        </select>
        <label class="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-[12.5px] font-medium text-slate-600">
          <input v-model="hanyaMasalah" type="checkbox" class="h-4 w-4 accent-red-600">
          Hanya masalah (galat)
        </label>
        <button type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50" :disabled="memuat" @click="muatRekap">{{ memuat ? 'Memuat…' : 'Muat Ulang' }}</button>
      </div>

      <p v-if="!grupPerModul.length && !memuat" class="mt-5 rounded-xl border border-slate-300 bg-white p-6 text-center text-[13px] text-slate-500">Belum ada aktivitas tercatat pada rentang ini.</p>

      <section v-for="m in grupPerModul" :key="m.modul" class="mt-4 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <header class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-slate-100 px-4 py-3">
          <h2 class="text-[13px] font-semibold text-slate-700">{{ m.modul }}</h2>
          <div class="flex items-center gap-2 text-[12px] text-slate-500">
            <span>{{ m.total }} aktivitas</span>
            <span v-if="m.galat" class="rounded bg-[#FEF3F2] px-2 py-0.5 text-[11px] font-semibold text-[#B42318]">{{ m.galat }} galat</span>
          </div>
        </header>
        <div class="divide-y divide-slate-200">
          <div v-for="b in m.grup" :key="b.aksi">
            <button type="button" class="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50" @click="alihGrup(b)">
              <span class="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                {{ kapital(b.aksi) }}
                <span class="rounded-full bg-[#EFF2F7] px-2 py-0.5 text-[11px] font-semibold text-slate-600">{{ b.jumlah }}×</span>
                <span v-if="b.jumlahGalat" class="rounded bg-[#FEF3F2] px-2 py-0.5 text-[11px] font-semibold text-[#B42318]">{{ b.jumlahGalat }} galat</span>
              </span>
              <span class="flex items-center gap-2 text-[12px] text-slate-500">
                <span>{{ b.penggunaUnik }} pengguna · terakhir {{ formatWaktu(b.terakhir) }}</span>
                <span class="text-slate-400">{{ kunciTerbuka === kunciGrup(b) ? '▾' : '▸' }}</span>
              </span>
            </button>
            <div v-if="kunciTerbuka === kunciGrup(b)" class="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <p v-if="memuatDetail === kunciGrup(b)" class="text-[12.5px] text-slate-500">Memuat daftar pelaku…</p>
              <template v-else>
                <ul class="divide-y divide-slate-200">
                  <li v-for="(d, i) in detailGrup[kunciGrup(b)] || []" :key="i" class="flex items-start gap-3 py-2.5">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5FD9] text-[11px] font-semibold text-white">{{ inisial(d.actor_name) }}</span>
                    <div class="min-w-0 flex-1">
                      <p class="text-[13px] font-medium text-slate-700">
                        {{ d.actor_name || 'Pengguna' }}
                        <span v-if="d.actor_role" class="font-normal text-slate-400">· {{ d.actor_role }}</span>
                        <span v-if="d.tingkat === 'galat'" class="ml-1 rounded bg-[#FEF3F2] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#B42318]">galat</span>
                      </p>
                      <p v-if="d.detail" class="truncate text-[12.5px] text-slate-500">{{ d.detail }}</p>
                    </div>
                    <span class="shrink-0 text-[12px] text-slate-400">{{ formatWaktu(d.created_at) }}</span>
                  </li>
                </ul>
                <p v-if="(detailGrup[kunciGrup(b)] || []).length === 50" class="mt-2 text-[11.5px] text-slate-400">Menampilkan 50 aktivitas terbaru dari grup ini.</p>
                <p v-if="!(detailGrup[kunciGrup(b)] || []).length" class="text-[12.5px] text-slate-500">Tidak ada rincian pada rentang ini.</p>
              </template>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
