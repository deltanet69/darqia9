<template>
  <div>
    <div class="up" style="padding:2px 2px 0">
      <div style="font-size:14px;font-weight:500;color:var(--p1)">{{ tanggalTeks }}</div>
      <h1 style="margin:6px 0 0;font-size:28px;line-height:1.2;font-weight:400;letter-spacing:-.025em;color:#51607F">{{ salam }},<br><span style="font-weight:600;color:var(--p0)">Bapak/Ibu</span></h1>
    </div>

    <div v-if="galat" role="alert" style="margin-top:18px;padding:14px 16px;border-radius:18px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.45">
      {{ galat }}
      <button type="button" style="display:block;margin-top:6px;min-height:44px;font-weight:600;text-decoration:underline" @click="muat">Coba lagi</button>
    </div>

    <template v-if="r">
      <NuxtLink to="/ortu/presensi" class="press up" aria-label="Lihat presensi" style="animation-delay:.1s;position:relative;display:block;width:100%;box-sizing:border-box;margin-top:18px;border-radius:28px;padding:18px 20px 16px;background:linear-gradient(150deg,#fff 0%,var(--soft) 100%);box-shadow:0 10px 30px rgba(10,42,92,.09),inset 0 0 0 1px rgba(255,255,255,.9);overflow:hidden">
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden="true" style="position:absolute;right:-70px;bottom:-90px;pointer-events:none"><circle cx="110" cy="110" r="108" stroke="var(--p1)" stroke-opacity=".10" stroke-width="1.5" /><circle cx="110" cy="110" r="80" stroke="var(--p1)" stroke-opacity=".10" stroke-width="1.5" /><circle cx="110" cy="110" r="52" stroke="#F0B429" stroke-opacity=".35" stroke-width="1.5" /></svg>
        <div style="position:relative;display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(145deg,var(--p0),var(--p1));color:#fff;font-size:20px;font-weight:600;display:flex;align-items:center;justify-content:center;flex:none;box-shadow:0 0 0 3px #fff,0 0 0 5px #F0B429">{{ inisialNama(r.siswa.nama) }}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:20px;line-height:1.2;font-weight:600;letter-spacing:-.015em;color:var(--p0)">{{ r.siswa.nama }}</div>
            <div style="margin-top:3px;font-size:15px;color:#51607F">{{ r.siswa.kelas }} · NIS {{ r.siswa.nis }}</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA7BE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="m9 5 7 7-7 7" /></svg>
        </div>
        <div style="position:relative;margin-top:16px;padding-top:14px;border-top:1px solid rgba(10,42,92,.08);display:flex;align-items:center;gap:12px">
          <div :class="hadirKini ? 'dot' : ''" :style="`width:11px;height:11px;border-radius:50%;background:${kini.warna};flex:none`" />
          <div>
            <div :style="`font-size:17px;font-weight:600;color:${kini.tinta}`">{{ kini.judul }}</div>
            <div style="margin-top:1px;font-size:14px;color:#51607F">{{ kini.sub }}</div>
          </div>
        </div>
      </NuxtLink>

      <div class="up" style="animation-delay:.16s;margin-top:16px;background:#fff;border-radius:26px;box-shadow:0 6px 24px rgba(10,42,92,.06);overflow:hidden">
        <NuxtLink v-for="(c, i) in baris" :key="c.ke" :to="c.ke" class="press" :style="`display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;padding:16px 18px;border-top:${i ? '1px solid #EEF2FA' : 'none'}`">
          <div :style="`width:46px;height:46px;border-radius:15px;background:${c.tile};color:${c.ink};display:flex;align-items:center;justify-content:center;flex:none`">
            <svg v-if="i === 0" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.5v4M16 2.5v4M3 10h18M8.5 15l2.5 2.5L15.5 13" /></svg>
            <svg v-else-if="i === 1" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 20v-8M12 20V5M19 20v-5" /></svg>
            <svg v-else-if="i === 2" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></svg>
            <svg v-else width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:17px;font-weight:600;color:#14213D">{{ c.judul }}</div>
            <div style="margin-top:2px;font-size:14px;line-height:1.35;color:#51607F">{{ c.sub }}</div>
          </div>
          <div :style="`font-size:20px;font-weight:600;letter-spacing:-.02em;color:${c.ink};white-space:nowrap`">{{ c.besar }}</div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA7BE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="m9 5 7 7-7 7" /></svg>
        </NuxtLink>
      </div>
    </template>
    <template v-else-if="!galat">
      <div class="muat" style="margin-top:18px;height:150px;border-radius:28px" />
      <div class="muat" style="margin-top:16px;height:300px;border-radius:26px" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { inisialNama, rp } from '~/composables/keuanganCore'

const { ringkasan: r, muatRingkasan, pesanGalat, tema } = useOrtu()
const galat = ref('')

const muat = async () => {
  galat.value = ''
  try { await muatRingkasan(true) } catch (e) { if (!r.value) galat.value = pesanGalat(e) }
}
onMounted(muat)

const sekarang = new Date()
const tanggalTeks = sekarang.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const jam = Number(sekarang.toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }))
const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam'

const STATUS = {
  tepat: { judul: 'Sudah di sekolah', ket: 'Tepat waktu', warna: '#22A05A', tinta: '#14532D' },
  terlambat: { judul: 'Sudah di sekolah', ket: 'Terlambat', warna: '#D97706', tinta: '#78350F' },
  izin: { judul: 'Izin hari ini', ket: 'Tercatat izin', warna: '#64748B', tinta: '#334155' },
  sakit: { judul: 'Sakit hari ini', ket: 'Tercatat sakit', warna: '#3B82F6', tinta: '#1E3A8A' },
  alpa: { judul: 'Tidak hadir', ket: 'Tanpa keterangan', warna: '#D92D20', tinta: '#9A1F1F' }
} as const
const hadirKini = computed(() => r.value?.hariIni?.status === 'tepat' || r.value?.hariIni?.status === 'terlambat')
const kini = computed(() => {
  const h = r.value?.hariIni
  if (!h) return { judul: 'Belum ada data hari ini', sub: 'Kehadiran tercatat saat kartu ditempel di gerbang', warna: '#CBD5E1', tinta: '#334155' }
  const s = STATUS[h.status]
  return { judul: s.judul, sub: h.jamMasuk ? `Masuk ${h.jamMasuk} · ${s.ket}` : s.ket, warna: s.warna, tinta: s.tinta }
})

const dec = (n: number) => n.toFixed(1).replace('.', ',')
const baris = computed(() => {
  const d = r.value!
  return [
    { judul: 'Presensi', sub: 'Persentase kehadiran', besar: d.kehadiranPersen !== null ? `${Math.round(d.kehadiranPersen)}%` : '–', tile: '#E3EEFF', ink: '#1E40AF', ke: '/ortu/presensi' },
    { judul: 'Nilai', sub: 'Rata-rata semester', besar: d.rataNilai !== null ? dec(d.rataNilai) : '–', tile: '#FFF1CC', ink: '#7A4B05', ke: '/ortu/nilai' },
    { judul: 'Administrasi', sub: d.tagihan ? `Sisa tagihan ${d.tagihan.label}` : 'Tagihan belum dirilis', besar: d.tagihan ? rp(d.tagihan.sisa) : '', tile: tema.value.soft, ink: tema.value.p0, ke: '/ortu/administrasi' },
    { judul: 'Profil & Kartu', sub: 'Data dan kartu siswa', besar: '', tile: '#EEF1F6', ink: '#33415C', ke: '/ortu/profil' }
  ]
})
</script>
