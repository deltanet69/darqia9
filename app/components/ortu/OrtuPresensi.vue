<template>
  <div>
    <div class="up">
      <h1 style="margin:0;font-size:30px;font-weight:600;letter-spacing:-.025em;color:var(--p0)">Presensi</h1>
      <div style="margin-top:2px;font-size:16px;color:#51607F">{{ d ? `${d.nama} · ${namaBulan}` : namaBulan }}</div>
    </div>

    <div v-if="galat" role="alert" style="margin-top:18px;padding:14px 16px;border-radius:18px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.45">
      {{ galat }}
      <button type="button" style="display:block;margin-top:6px;min-height:44px;font-weight:600;text-decoration:underline" @click="muat">Coba lagi</button>
    </div>

    <template v-if="d">
      <div class="up" style="animation-delay:.08s;margin-top:18px;border-radius:26px;padding:20px;background:linear-gradient(150deg,var(--soft),#fff);box-shadow:0 6px 24px rgba(10,42,92,.07);display:flex;align-items:center;gap:18px">
        <div style="position:relative;width:128px;height:128px;flex:none">
          <svg width="128" height="128" viewBox="0 0 160 160" aria-hidden="true" style="transform:rotate(-90deg)">
            <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--p1)" /><stop offset="1" stop-color="#F0B429" /></linearGradient></defs>
            <circle cx="80" cy="80" r="64" fill="none" stroke="#fff" stroke-width="13" />
            <circle v-if="pct !== null" class="ringv" cx="80" cy="80" r="64" fill="none" stroke="url(#rg)" stroke-width="13" stroke-linecap="round" stroke-dasharray="402.12" :style="`--c:402.12;stroke-dashoffset:${(402.12 * (1 - pct / 100)).toFixed(2)}`" />
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:32px;font-weight:600;letter-spacing:-.03em;line-height:1;color:var(--p0)">{{ pct !== null ? `${Math.round(pct)}%` : '–' }}</div>
            <div style="font-size:13px;margin-top:3px;color:#51607F">hadir</div>
          </div>
        </div>
        <div>
          <div style="font-size:20px;line-height:1.25;font-weight:600;color:var(--p0)">{{ judulRing }}</div>
          <div style="margin-top:6px;font-size:16px;line-height:1.4;color:#51607F">{{ subRing }}</div>
        </div>
      </div>

      <div v-if="!d.hari.length" class="up" style="animation-delay:.14s;margin-top:12px;background:#fff;border-radius:24px;padding:24px 20px;text-align:center;box-shadow:0 6px 24px rgba(10,42,92,.06)">
        <div style="font-size:19px;font-weight:600;color:var(--p0)">Data presensi bulan ini belum tersedia</div>
        <div style="margin-top:6px;font-size:16px;line-height:1.5;color:#51607F">Kehadiran akan tampil setelah tercatat oleh sekolah.</div>
      </div>

      <template v-else>
        <div class="up" style="animation-delay:.14s;margin-top:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
          <div v-for="st in statistik" :key="st.l" style="background:#fff;border-radius:18px;padding:14px 8px;text-align:center;box-shadow:0 4px 16px rgba(10,42,92,.05)">
            <div :style="`font-size:26px;font-weight:600;line-height:1;color:${st.fg}`">{{ st.n }}</div>
            <div style="margin-top:6px;font-size:14px;color:#51607F">{{ st.l }}</div>
          </div>
        </div>

        <div class="up" style="animation-delay:.2s;margin-top:12px;background:#fff;border-radius:24px;padding:18px 14px 16px;box-shadow:0 6px 24px rgba(10,42,92,.06)">
          <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));text-align:center">
            <div v-for="w in HARI_PENDEK" :key="w" style="font-size:13px;font-weight:500;color:#64748B;padding-bottom:8px">{{ w }}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));row-gap:6px;justify-items:center">
            <template v-for="(c, i) in sel" :key="i">
              <div v-if="!c" style="height:42px" />
              <button v-else type="button" :aria-label="c.aria" :aria-pressed="pilih === c.d" :style="`width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;justify-self:center;font-size:16px;font-weight:500;background:${c.bg};color:${c.fg};box-shadow:${pilih === c.d ? '0 0 0 2.5px var(--p1)' : '0 0 0 0 transparent'};transition:box-shadow .35s,background .35s;text-align:center`" @click="pilih = c.d">{{ c.d }}</button>
            </template>
          </div>
          <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center">
            <div v-for="g in legenda" :key="g.l" style="display:flex;align-items:center;gap:6px;font-size:14px;color:#51607F"><span :style="`width:14px;height:14px;border-radius:50%;background:${g.bg};box-shadow:inset 0 0 0 1.5px ${g.fg}`" />{{ g.l }}</div>
          </div>
        </div>

        <div style="margin-top:12px;background:#fff;border-radius:22px;padding:18px 20px;box-shadow:0 6px 24px rgba(10,42,92,.06);transition:all .3s">
          <div style="font-size:15px;color:#51607F">{{ rinci.judul }}</div>
          <div :style="`margin-top:8px;display:inline-block;padding:5px 14px;border-radius:999px;font-size:15px;font-weight:600;background:${rinci.bg};color:${rinci.fg}`">{{ rinci.status }}</div>
          <div style="margin-top:12px;font-size:17px;line-height:1.5;color:#14213D">{{ rinci.baris }}</div>
        </div>
      </template>
      <div style="margin-top:12px;font-size:15px;line-height:1.5;color:#64748B">Kartu ditempel di gerbang: sampai pukul {{ BATAS_TEPAT }} tepat waktu, {{ BATAS_TEPAT_SETELAH }}–{{ BATAS_TERLAMBAT }} terlambat, setelah {{ BATAS_TERLAMBAT }} dianggap alpa.</div>
    </template>
    <template v-else-if="!galat">
      <div class="muat" style="margin-top:18px;height:168px;border-radius:26px" />
      <div class="muat" style="margin-top:12px;height:320px;border-radius:24px" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { BATAS_TEPAT, BATAS_TERLAMBAT } from '~/composables/ortuCore'
import { tanggalWib } from '~/composables/dashboardCore'
import type { PresensiOrtu, StatusPresensi } from '~/types/ortu'

const BATAS_TEPAT_SETELAH = '06.46'
const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const META: Record<StatusPresensi, { l: string, bg: string, fg: string }> = {
  tepat: { l: 'Hadir tepat waktu', bg: '#DCFCE7', fg: '#14532D' },
  terlambat: { l: 'Terlambat', bg: '#FEF3C7', fg: '#78350F' },
  sakit: { l: 'Sakit', bg: '#DBEAFE', fg: '#1E3A8A' },
  izin: { l: 'Izin', bg: '#EDE9FE', fg: '#4C1D95' },
  alpa: { l: 'Alpa', bg: '#FDECEC', fg: '#9A1F1F' }
}

const { api, pesanGalat } = useOrtu()
const d = ref<PresensiOrtu | null>(null)
const galat = ref('')
const hariIni = tanggalWib()
const [tahun, bulan, tglKini] = hariIni.split('-').map(Number) as [number, number, number]
const namaBulan = `${NAMA_BULAN[bulan - 1]} ${tahun}`
const pilih = ref(tglKini)

const muat = async () => {
  galat.value = ''
  try { d.value = await api<PresensiOrtu>('/api/ortu/presensi', { query: { bulan: hariIni.slice(0, 7) } }) } catch (e) { galat.value = pesanGalat(e) }
}
onMounted(muat)

const peta = computed(() => new Map((d.value?.hari ?? []).map(h => [Number(h.tanggal.slice(8, 10)), h])))
const pct = computed(() => d.value?.kehadiranPersen ?? null)
const jumlah = (s: StatusPresensi) => (d.value?.hari ?? []).filter(h => h.status === s).length
const hadir = computed(() => jumlah('tepat') + jumlah('terlambat'))
const judulRing = computed(() => pct.value === null ? 'Persentase belum tersedia' : pct.value >= 90 ? 'Kehadiran sangat baik' : pct.value >= 75 ? 'Kehadiran baik' : 'Kehadiran perlu perhatian')
const subRing = computed(() => d.value?.hari.length ? `${hadir.value} hari tercatat hadir bulan ini` : 'Belum ada catatan bulan ini')
const statistik = computed(() => [
  { n: jumlah('tepat'), l: 'Tepat waktu', fg: '#14532D' }, { n: jumlah('terlambat'), l: 'Terlambat', fg: '#78350F' }, { n: jumlah('sakit'), l: 'Sakit', fg: '#1E3A8A' },
  { n: jumlah('izin'), l: 'Izin', fg: '#475569' }, { n: jumlah('alpa'), l: 'Alpa', fg: '#9A1F1F' }, { n: d.value?.hari.length ?? 0, l: 'Hari tercatat', fg: 'var(--p0)' }
])
const legenda = computed(() => (Object.keys(META) as StatusPresensi[]).filter(s => jumlah(s) > 0 || s === 'tepat' || s === 'terlambat').map(s => META[s]))

const jumlahHari = new Date(tahun, bulan, 0).getDate()
const sel = computed(() => {
  const awal = (new Date(tahun, bulan - 1, 1).getDay() + 6) % 7
  const isi: Array<{ d: number, bg: string, fg: string, aria: string } | null> = Array(awal).fill(null)
  for (let t = 1; t <= jumlahHari; t++) {
    const dow = new Date(tahun, bulan - 1, t).getDay()
    const r = peta.value.get(t)
    let bg = '#fff', fg = '#14213D', aria = `${NAMA_HARI[dow]} ${t} ${NAMA_BULAN[bulan - 1]}`
    if (r) { bg = META[r.status].bg; fg = META[r.status].fg; aria += `, ${META[r.status].l}` }
    else if (dow === 0 || dow === 6) { bg = 'transparent'; fg = '#64748B'; aria += ', libur' }
    else if (t > tglKini) { bg = '#EEF2FA'; fg = '#64748B'; aria += ', belum berlangsung' }
    else aria += ', belum ada data'
    isi.push({ d: t, bg, fg, aria })
  }
  return isi
})

const rinci = computed(() => {
  const t = pilih.value
  const dow = new Date(tahun, bulan - 1, t).getDay()
  const judul = `${NAMA_HARI[dow]}, ${t} ${namaBulan}`
  const r = peta.value.get(t)
  if (r) {
    const m = META[r.status]
    const baris = r.jamMasuk ? `Masuk pukul ${r.jamMasuk}.` : r.status === 'tepat' || r.status === 'terlambat' ? 'Tercatat hadir.' : `Tercatat ${m.l.toLowerCase()}.`
    return { judul, status: m.l, bg: m.bg, fg: m.fg, baris }
  }
  if (dow === 0 || dow === 6) return { judul, status: 'Hari libur', bg: '#E2E8F0', fg: '#334155', baris: 'Tidak ada kegiatan belajar.' }
  if (t > tglKini) return { judul, status: 'Belum berlangsung', bg: '#E2E8F0', fg: '#334155', baris: 'Data akan muncul pada hari tersebut.' }
  return { judul, status: 'Belum ada data', bg: '#E2E8F0', fg: '#334155', baris: 'Belum ada catatan kehadiran untuk hari ini.' }
})
</script>
