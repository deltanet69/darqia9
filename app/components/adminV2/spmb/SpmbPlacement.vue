<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SPMB_JURUSAN_SMK, bagiRataPenempatan, jenjangKeyDari, nisBerikutnya, useSpmbAdmin,
  type SpmbAdminRecord, type SpmbJenjangKey, type SpmbRombel
} from '~/composables/useSpmbAdmin'

const props = defineProps<{ jenjang: SpmbJenjangKey }>()
const emit = defineEmits<{ toast: [pesan: string] }>()

const admin = useSpmbAdmin()
const target = ref('')
const terpilih = ref<Set<string>>(new Set())

const daftar = computed(() => admin.records.value.filter(r => jenjangKeyDari(r) === props.jenjang && !r.deleted && r.status === 'Diterima'))
const pool = computed(() => daftar.value.filter(r => !r.kelas))
const placed = computed(() => daftar.value.filter(r => r.kelas))
const rombels = computed(() => admin.rombel.value[props.jenjang])
const terisi = computed(() => {
  const peta: Record<string, number> = {}
  for (const r of placed.value) peta[r.kelas] = (peta[r.kelas] || 0) + 1
  return peta
})

function rombelUntuk(r: SpmbAdminRecord): SpmbRombel[] {
  if (props.jenjang !== 'SMK') return rombels.value
  return rombels.value.filter(rb => rb.jurusan === r.jurusan)
}

function togglePilih(id: string, on: boolean) {
  const s = new Set(terpilih.value)
  if (on) s.add(id)
  else s.delete(id)
  terpilih.value = s
}
function toggleSemua(on: boolean) {
  terpilih.value = on ? new Set(pool.value.map(r => r.id)) : new Set()
}

function tempatkanTerpilih() {
  const ids = [...terpilih.value]
  if (!ids.length) return emit('toast', 'Centang dulu siswa yang akan ditempatkan.')
  const rombel = rombels.value.find(r => r.nama === target.value) || rombels.value[0]
  if (!rombel) return emit('toast', 'Belum ada rombel — tambahkan rombel dulu.')
  const siswa = ids.map(id => admin.records.value.find(r => r.id === id)).filter((r): r is SpmbAdminRecord => !!r)
  if (props.jenjang === 'SMK') {
    const salah = siswa.filter(s => s.jurusan !== rombel.jurusan)
    if (salah.length) return emit('toast', `Jurusan tidak cocok dengan ${rombel.nama}: ${salah.map(s => s.s_nama).join(', ')}.`)
  }
  if ((terisi.value[rombel.nama] || 0) + siswa.length > rombel.kap) {
    return emit('toast', `${rombel.nama} tidak cukup: terisi ${terisi.value[rombel.nama] || 0} dari ${rombel.kap}, tambahan ${siswa.length} siswa.`)
  }
  for (const s of siswa) {
    s.kelas = rombel.nama
    s.nis = nisBerikutnya(admin.records.value, props.jenjang)
  }
  admin.simpan()
  for (const s of siswa) void admin.simpanRecordDb(s)
  terpilih.value = new Set()
  emit('toast', `${siswa.length} siswa ditempatkan ke ${rombel.nama} dan tercatat sebagai data siswa resmi.`)
}

function bagiRata() {
  if (!pool.value.length) return emit('toast', 'Tidak ada siswa yang menunggu penempatan.')
  const { pasangan, sisa } = bagiRataPenempatan(pool.value, rombelUntuk, terisi.value)
  const berubah: SpmbAdminRecord[] = []
  for (const p of pasangan) {
    const s = admin.records.value.find(r => r.id === p.id)
    if (!s) continue
    s.kelas = p.rombel
    s.nis = nisBerikutnya(admin.records.value, props.jenjang)
    berubah.push(s)
  }
  admin.simpan()
  for (const s of berubah) void admin.simpanRecordDb(s)
  terpilih.value = new Set()
  emit('toast', sisa.length
    ? `Sebagian siswa tidak tertampung — ${sisa.length} siswa tetap menunggu (semua rombel tujuannya penuh).`
    : `${pasangan.length} siswa dibagi rata ke rombel dan tercatat sebagai data siswa resmi.`)
}

function batalkan(id: string) {
  const s = admin.records.value.find(r => r.id === id)
  if (!s) return
  if (!window.confirm(`Batalkan penempatan ${s.s_nama} dari ${s.kelas}? Catatan data siswa resminya ditarik kembali ke daftar tunggu.`)) return
  s.kelas = ''
  s.nis = ''
  admin.simpan()
  void admin.simpanRecordDb(s)
  emit('toast', `${s.s_nama} kembali ke daftar belum ditempatkan.`)
}

function tambahRombel() {
  const nama = (window.prompt('Nama rombel baru (contoh: X TKJ 3 / VII D):') || '').trim()
  if (!nama) return
  if (rombels.value.some(r => r.nama.toLowerCase() === nama.toLowerCase())) return emit('toast', 'Rombel itu sudah ada.')
  let jurusan: string | undefined
  if (props.jenjang === 'SMK') {
    jurusan = (window.prompt(`Jurusan rombel ini (ketik persis salah satu):\n- ${SPMB_JURUSAN_SMK.join('\n- ')}`) || '').trim()
    if (!(SPMB_JURUSAN_SMK as readonly string[]).includes(jurusan)) return emit('toast', 'Jurusan tidak dikenal — rombel batal dibuat.')
  }
  const kap = parseInt((window.prompt('Kapasitas rombel:', props.jenjang === 'SMK' ? '36' : '32') || '').trim(), 10)
  if (!kap || kap < 1) return emit('toast', 'Kapasitas tidak valid — rombel batal dibuat.')
  admin.rombel.value = {
    ...admin.rombel.value,
    [props.jenjang]: [...rombels.value, { nama, jurusan, kap }]
  }
  admin.simpanPengaturan()
  emit('toast', `Rombel ${nama} ditambahkan.`)
}
</script>

<template>
  <div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-[#475467]">Diterima <span class="font-medium text-[#101828]">{{ daftar.length }}</span> · Sudah ditempatkan <span class="font-medium text-[#101828]">{{ placed.length }}</span> · Belum ditempatkan <span class="font-medium text-[#101828]">{{ pool.length }}</span></p>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="target" class="min-h-10 rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm">
          <option v-for="r in rombels" :key="r.nama" :value="r.nama">{{ r.nama }}{{ r.jurusan ? ` — ${r.jurusan}` : '' }}</option>
        </select>
        <button type="button" class="min-h-10 rounded-lg bg-[#1B5FD9] px-4 text-sm font-medium text-white" @click="tempatkanTerpilih">Tempatkan Terpilih</button>
        <button type="button" class="min-h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054]" @click="bagiRata">Bagi Rata Otomatis</button>
        <button type="button" class="min-h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054]" @click="tambahRombel">+ Rombel</button>
      </div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="r in rombels" :key="r.nama" class="rounded-2xl border border-[#E7EBF2] bg-white p-4">
        <div class="flex items-baseline justify-between gap-2"><span class="font-medium">{{ r.nama }}</span><span class="text-sm text-[#475467]">{{ terisi[r.nama] || 0 }} / {{ r.kap }}</span></div>
        <p class="mt-0.5 text-xs text-[#667085]">{{ r.jurusan || 'Kelas VII' }}</p>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: `${Math.min(100, Math.round((terisi[r.nama] || 0) / r.kap * 100))}%` }" /></div>
      </div>
    </div>

    <div class="mt-4 grid items-start gap-4 xl:grid-cols-2">
      <div class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#EFF2F7] px-4 py-3"><h3 class="font-semibold">Belum Ditempatkan</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[430px] text-left text-sm">
            <thead>
              <tr class="border-b border-[#EFF2F7] text-xs text-[#667085]">
                <th class="px-4 py-2.5 font-medium"><input type="checkbox" class="h-4 w-4 accent-[#1B5FD9]" @change="toggleSemua(($event.target as HTMLInputElement).checked)"></th>
                <th class="px-2 py-2.5 font-medium">Calon Siswa</th>
                <th class="px-2 py-2.5 font-medium">NISN</th>
                <th class="px-4 py-2.5 font-medium">{{ jenjang === 'SMK' ? 'Jurusan' : 'Asal Sekolah' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in pool" :key="s.id" class="border-b border-[#F5F7FA]">
                <td class="px-4 py-3"><input type="checkbox" class="h-4 w-4 accent-[#1B5FD9]" :checked="terpilih.has(s.id)" @change="togglePilih(s.id, ($event.target as HTMLInputElement).checked)"></td>
                <td class="px-2 py-3"><span class="font-medium">{{ s.s_nama }}</span></td>
                <td class="px-2 py-3 text-[#475467]">{{ s.s_nisn }}</td>
                <td class="px-4 py-3 text-[#475467]">{{ jenjang === 'SMK' ? (s.jurusan || '-') : s.s_sekolah }}</td>
              </tr>
              <tr v-if="!pool.length"><td colspan="4" class="px-4 py-8 text-center text-[#667085]">Semua siswa diterima sudah ditempatkan.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="border-t border-[#EFF2F7] px-4 py-3 text-xs text-[#667085]">{{ pool.length }} siswa menunggu penempatan. Centang siswa, pilih rombel tujuan, lalu Tempatkan Terpilih.</p>
      </div>

      <div class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#EFF2F7] px-4 py-3"><h3 class="font-semibold">Sudah Ditempatkan — Data Siswa Resmi</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[430px] text-left text-sm">
            <thead>
              <tr class="border-b border-[#EFF2F7] text-xs text-[#667085]">
                <th class="px-4 py-2.5 font-medium">Siswa</th>
                <th class="px-2 py-2.5 font-medium">NIS</th>
                <th class="px-2 py-2.5 font-medium">Kelas</th>
                <th class="px-4 py-2.5 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in placed" :key="s.id" class="border-b border-[#F5F7FA]">
                <td class="px-4 py-3"><span class="font-medium">{{ s.s_nama }}</span></td>
                <td class="px-2 py-3 text-[#475467]">{{ s.nis }}</td>
                <td class="px-2 py-3 text-[#475467]">{{ s.kelas }}</td>
                <td class="px-4 py-3 text-right"><button type="button" class="text-sm font-medium text-[#B42318]" @click="batalkan(s.id)">Batalkan</button></td>
              </tr>
              <tr v-if="!placed.length"><td colspan="4" class="px-4 py-8 text-center text-[#667085]">Belum ada siswa yang ditempatkan.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="border-t border-[#EFF2F7] px-4 py-3 text-xs text-[#667085]">Siswa yang ditempatkan langsung tercatat sebagai data siswa resmi tahun ajaran 2027/2028 dan tampil di Data Siswa &amp; Manajemen Kelas — tanpa input ulang.</p>
      </div>
    </div>
  </div>
</template>
