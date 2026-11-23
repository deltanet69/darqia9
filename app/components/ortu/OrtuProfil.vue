<template>
  <div>
    <NuxtLink to="/ortu" class="press" style="display:inline-flex;align-items:center;gap:4px;height:44px;font-size:16px;font-weight:500;color:var(--p1)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>Beranda
    </NuxtLink>

    <div v-if="galat" role="alert" style="margin-top:12px;padding:14px 16px;border-radius:18px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.45">
      {{ galat }}
      <button type="button" style="display:block;margin-top:6px;min-height:44px;font-weight:600;text-decoration:underline" @click="muat">Coba lagi</button>
    </div>

    <template v-if="p && k">
      <div class="up" style="display:flex;align-items:center;gap:16px">
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(145deg,var(--p0),var(--p1));color:#fff;font-size:26px;font-weight:600;display:flex;align-items:center;justify-content:center;flex:none">{{ inisialNama(p.siswa.nama) }}</div>
        <div style="min-width:0">
          <h1 style="margin:0;font-size:24px;line-height:1.15;font-weight:600;letter-spacing:-.02em;color:var(--p0)">{{ p.siswa.nama }}</h1>
          <div style="margin-top:4px;font-size:16px;color:#51607F">{{ p.siswa.kelas }} · NIS {{ p.siswa.nis }}</div>
          <div style="margin-top:6px;display:inline-block;padding:3px 12px;border-radius:999px;background:#DCFCE7;color:#14532D;font-size:13px;font-weight:500">Siswa {{ p.siswa.status.toLowerCase() }}</div>
        </div>
      </div>

      <h2 class="up" style="animation-delay:.06s;margin:22px 0 0;font-size:15px;font-weight:600;color:#51607F">KARTU</h2>
      <div class="up" style="animation-delay:.08s;margin-top:8px;background:#fff;border-radius:24px;box-shadow:0 6px 24px rgba(10,42,92,.06);overflow:hidden">
        <div v-for="(c, i) in kartu" :key="c.id" :style="`display:flex;align-items:center;gap:14px;padding:16px 18px;border-top:${i ? '1px solid #EEF2FA' : 'none'}`">
          <div :style="`width:44px;height:44px;border-radius:14px;background:${c.tile};color:${c.ink};display:flex;align-items:center;justify-content:center;flex:none`">
            <svg v-if="!c.terkunci" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 10h5M7 14h3" /><circle cx="16.5" cy="12" r="1.8" /></svg>
            <svg v-else width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:17px;font-weight:500;color:#14213D">{{ c.judul }}</div>
            <div :style="`margin-top:2px;font-size:14px;line-height:1.35;color:${c.terkunci ? '#7A4B05' : '#51607F'}`">{{ c.ket }}</div>
          </div>
          <button v-if="c.buka" type="button" class="press" style="height:44px;padding:0 16px;border-radius:12px;background:var(--p1);color:#fff;font-size:15px;font-weight:600" @click="c.buka">Buka</button>
          <NuxtLink v-else-if="c.terkunci" to="/ortu/administrasi" class="press" style="display:flex;align-items:center;height:44px;padding:0 14px;border-radius:12px;background:#FFF1CC;color:#7A4B05;font-size:15px;font-weight:600;white-space:nowrap">Cek tagihan</NuxtLink>
        </div>
      </div>

      <h2 class="up" style="animation-delay:.12s;margin:22px 0 0;font-size:15px;font-weight:600;color:#51607F">DATA SISWA</h2>
      <dl class="up" style="animation-delay:.14s;margin:8px 0 0;background:#fff;border-radius:24px;box-shadow:0 6px 24px rgba(10,42,92,.06);overflow:hidden">
        <div v-for="(r, i) in dataSiswa" :key="r.l" :style="`display:flex;justify-content:space-between;gap:12px;padding:14px 18px;border-top:${i ? '1px solid #EEF2FA' : 'none'};font-size:16px`"><dt style="color:#51607F">{{ r.l }}</dt><dd style="margin:0;font-weight:500;color:#14213D;text-align:right">{{ r.v }}</dd></div>
      </dl>

      <div class="up" style="animation-delay:.18s;margin-top:22px;display:flex;align-items:center;justify-content:space-between">
        <h2 style="margin:0;font-size:15px;font-weight:600;color:#51607F">DATA ORANG TUA</h2>
        <button v-if="!ubah" type="button" class="press" style="height:44px;padding:0 16px;border-radius:12px;background:var(--soft);color:var(--p1);font-size:15px;font-weight:600" @click="mulaiUbah">Ubah</button>
      </div>
      <div class="up" style="animation-delay:.2s;margin-top:8px;background:#fff;border-radius:24px;box-shadow:0 6px 24px rgba(10,42,92,.06);overflow:hidden">
        <div v-for="(r, i) in dataOrtu" :key="r.l" :style="`display:flex;justify-content:space-between;gap:12px;padding:14px 18px;border-top:${i ? '1px solid #EEF2FA' : 'none'};font-size:16px`"><span style="color:#51607F">{{ r.l }}</span><span style="font-weight:500;color:#14213D;text-align:right">{{ r.v || '–' }}</span></div>
        <div v-for="f in FIELD" :key="f.k" style="padding:14px 18px;border-top:1px solid #EEF2FA">
          <label :for="`f-${f.k}`" style="display:block;font-size:14px;color:#51607F">{{ f.l }}</label>
          <div v-if="!ubah" style="margin-top:4px;font-size:17px;line-height:1.4;font-weight:500;color:#14213D;overflow-wrap:anywhere">{{ p.kontak[f.k] || 'Belum diisi' }}</div>
          <input v-else :id="`f-${f.k}`" v-model="draf[f.k]" class="fld" :type="f.type" :inputmode="f.k === 'wa' ? 'tel' : undefined" :autocomplete="f.auto" :maxlength="f.k === 'alamat' ? 300 : 120" style="margin-top:6px">
        </div>
      </div>
      <p v-if="!ubah" style="margin:10px 0 0;font-size:15px;line-height:1.5;color:#64748B">Nama, NIS, kelas, dan data pokok lain tidak dapat diubah di sini. Perubahan data ini melalui Tata Usaha.</p>
      <div v-if="galatUbah" role="alert" style="margin-top:12px;padding:10px 14px;border-radius:14px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.4">{{ galatUbah }}</div>
      <div v-if="ubah" class="fade" style="margin-top:14px;display:flex;gap:10px">
        <button type="button" class="press" style="flex:1;height:54px;border-radius:16px;background:#E9EEF8;color:#33415C;font-size:17px;font-weight:600;text-align:center" @click="batalUbah">Batal</button>
        <button type="button" class="press" :disabled="simpanSibuk" style="flex:2;height:54px;border-radius:16px;background:var(--p1);color:#fff;font-size:17px;font-weight:600;text-align:center" @click="simpan">{{ simpanSibuk ? 'Menyimpan…' : 'Simpan perubahan' }}</button>
      </div>

      <button type="button" class="press" style="width:100%;height:54px;margin-top:26px;border-radius:17px;background:#fff;color:var(--p1);font-size:17px;font-weight:600;text-align:center;box-shadow:0 4px 16px rgba(10,42,92,.06)" @click="lembar = 'sandi'">Ganti kata sandi</button>
      <button type="button" class="press" style="width:100%;height:54px;margin-top:12px;border-radius:17px;background:#FDECEC;color:#8A1C1C;font-size:17px;font-weight:600;text-align:center" @click="keluar">Keluar</button>
    </template>
    <template v-else-if="!galat">
      <div class="muat" style="margin-top:8px;height:80px" />
      <div class="muat" style="margin-top:22px;height:160px;border-radius:24px" />
      <div class="muat" style="margin-top:22px;height:200px;border-radius:24px" />
    </template>

    <Teleport to="#ortu-lapis" defer>
      <div v-if="lembar" class="fade" style="position:absolute;inset:0;background:rgba(10,30,70,.4);z-index:20" @click="tutupLembar">
        <div class="sheet" role="dialog" aria-modal="true" :aria-label="judulLembar" style="position:absolute;left:0;right:0;bottom:0;background:#F7F9FD;border-radius:30px 30px 0 0;padding:14px 24px 30px;max-height:92%;overflow-y:auto;box-sizing:border-box" @click.stop>
          <div style="width:44px;height:5px;border-radius:3px;background:#DCE4F2;margin:0 auto 18px" />
          <template v-if="lembar === 'sandi'">
            <div style="font-size:20px;font-weight:600;color:var(--p0)">Ganti kata sandi</div>
            <div style="margin-top:2px;font-size:15px;color:#51607F">Kata sandi baru berlaku untuk masuk berikutnya.</div>
            <OrtuGantiSandi @selesai="sandiDiganti" />
          </template>
          <template v-else-if="kartuAktif">
            <div style="font-size:20px;font-weight:600;color:var(--p0)">{{ judulLembar }}</div>
            <div style="margin-top:2px;font-size:15px;color:#51607F">{{ kartuAktif.jenis === 'pelajar' ? `Kartu identitas siswa tahun ajaran ${p!.siswa.tahunAjaran}` : 'Untuk masuk ke aplikasi ujian (CBT)' }}</div>

            <div style="position:relative;margin-top:16px;min-height:204px;border-radius:22px;padding:18px 20px;box-sizing:border-box;color:#fff;background:linear-gradient(150deg,var(--p0),var(--p1));overflow:hidden;box-shadow:0 14px 34px rgba(10,42,92,.25)">
              <div style="position:absolute;right:-40px;top:-50px;width:170px;height:170px;border-radius:50%;background:rgba(240,180,41,.3)" />
              <div style="position:relative;display:flex;align-items:center;gap:10px">
                <div style="width:32px;height:32px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center"><img :src="tema.logo" alt="" width="24" height="24" style="width:24px;height:24px;object-fit:contain"></div>
                <div><div style="font-size:14px;font-weight:600">{{ tema.singkat }}</div><div style="font-size:11px;letter-spacing:.08em;color:#F0B429">{{ kartuAktif.jenis === 'pelajar' ? 'KARTU PELAJAR' : `KARTU UJIAN ${kartuAktif.periode.toUpperCase()}` }}</div></div>
              </div>
              <div v-if="kartuAktif.jenis === 'pelajar'" style="position:relative;margin-top:16px;display:flex;gap:14px;align-items:center">
                <div style="width:68px;height:82px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;flex:none">{{ inisialNama(p!.siswa.nama) }}</div>
                <div style="min-width:0">
                  <div style="font-size:20px;font-weight:600;line-height:1.2">{{ p!.siswa.nama }}</div>
                  <div style="margin-top:6px;font-size:14px;color:rgba(255,255,255,.85)">NIS {{ p!.siswa.nis }}</div>
                  <div style="margin-top:2px;font-size:14px;color:rgba(255,255,255,.85)">{{ p!.siswa.kelas }} · TA {{ p!.siswa.tahunAjaran }}</div>
                </div>
              </div>
              <div v-else style="position:relative;margin-top:14px">
                <div style="font-size:20px;font-weight:600;line-height:1.2">{{ p!.siswa.nama }}</div>
                <div style="margin-top:4px;font-size:14px;color:rgba(255,255,255,.85)">{{ p!.siswa.kelas }} · NIS {{ p!.siswa.nis }}</div>
                <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
                  <div style="flex:1;height:50px;border-radius:14px;background:rgba(255,255,255,.95);color:var(--p0);display:flex;flex-direction:column;justify-content:center;padding:0 14px"><div style="font-size:11px;color:#64748B">TOKEN CBT</div><div style="font-size:21px;font-weight:600;letter-spacing:.18em">{{ tampilToken && token ? token : '••••••' }}</div></div>
                  <button type="button" class="press" :disabled="tokenSibuk" style="height:50px;padding:0 14px;border-radius:14px;background:rgba(255,255,255,.2);color:#fff;font-size:14px;font-weight:600;text-align:center" @click="aturToken">{{ tokenSibuk ? 'Memuat…' : tampilToken ? 'Sembunyikan' : 'Tampilkan token' }}</button>
                </div>
              </div>
            </div>
            <div v-if="galatKartu" role="alert" style="margin-top:12px;padding:10px 14px;border-radius:14px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.4">{{ galatKartu }}</div>
            <button type="button" class="press" :disabled="unduh === 'sibuk'" :style="`position:relative;width:100%;height:56px;margin-top:18px;border-radius:17px;background:${unduh === 'selesai' ? '#22A05A' : 'var(--p1)'};color:#fff;font-size:17px;font-weight:600;text-align:center;overflow:hidden;transition:background .4s`" @click="unduhKartu">
              {{ unduh === 'sibuk' ? 'Menyiapkan kartu…' : unduh === 'selesai' ? (kartuAktif.jenis === 'pelajar' ? 'Tersimpan di unduhan' : 'Jendela cetak dibuka') : kartuAktif.jenis === 'pelajar' ? 'Unduh kartu (PNG)' : 'Unduh kartu (PDF)' }}
            </button>
            <div v-if="kartuAktif.jenis === 'ujian'" style="margin-top:10px;font-size:14px;line-height:1.5;color:#64748B;text-align:center">Pilih "Simpan sebagai PDF" pada jendela cetak. Jangan berikan token kepada siapa pun.</div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { inisialNama } from '~/composables/keuanganCore'
import QRCode from 'qrcode'
import { cetakKartu, buatNoPeserta, URL_UNDUH_APK, muatFotoKartu } from '~/utils/cbtKartuCetak'
import type { KartuOrtu, KontakOrtu, ProfilOrtu } from '~/types/ortu'

type KartuDipilih = { jenis: 'pelajar' } | { jenis: 'ujian', periodeId: string, periode: string }

const FIELD: Array<{ k: keyof KontakOrtu, l: string, type: string, auto: string }> = [
  { k: 'wa', l: 'No. WhatsApp', type: 'tel', auto: 'tel' },
  { k: 'email', l: 'Email', type: 'email', auto: 'email' },
  { k: 'alamat', l: 'Alamat', type: 'text', auto: 'street-address' }
]

const { api, pesanGalat, keluar, tampilToast, tema, sesi } = useOrtu()
const p = ref<ProfilOrtu | null>(null)
const k = ref<KartuOrtu | null>(null)
const galat = ref('')

const muat = async () => {
  galat.value = ''
  try {
    ;[p.value, k.value] = await Promise.all([api<ProfilOrtu>('/api/ortu/profil'), api<KartuOrtu>('/api/ortu/kartu')])
  } catch (e) { galat.value = pesanGalat(e) }
}
onMounted(muat)

const dataSiswa = computed(() => [
  { l: 'NIS', v: p.value!.siswa.nis },
  { l: 'Kelas', v: p.value!.siswa.kelas },
  { l: 'Tahun ajaran', v: `${p.value!.siswa.tahunAjaran} · ${p.value!.siswa.semester.split(' ')[0]}` },
  { l: 'Status', v: p.value!.siswa.status }
])
const dataOrtu = computed(() => [{ l: 'Nama ayah', v: p.value!.ayah }, { l: 'Nama ibu', v: p.value!.ibu }])

// ---- Kartu
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const bulanTeks = (iso: string) => { const [y, m] = iso.split('-').map(Number); return `${BULAN[m! - 1]} ${y}` }
const kartuAktif = ref<KartuDipilih | null>(null)
const lembar = ref<'' | 'kartu' | 'sandi'>('')
const kartu = computed(() => {
  const layak = k.value!.layak
  const kunci = { terkunci: true, buka: null, tile: '#EEF1F6', ink: '#64748B' }
  const daftar: Array<{ id: string, judul: string, ket: string, terkunci: boolean, buka: (() => void) | null, tile: string, ink: string }> = [
    layak
      ? { id: 'pelajar', judul: 'Kartu Pelajar', ket: `Tersedia · TA ${p.value!.siswa.tahunAjaran}`, terkunci: false, buka: () => bukaKartu({ jenis: 'pelajar' }), tile: '#E3EEFF', ink: '#1E40AF' }
      : { id: 'pelajar', judul: 'Kartu Pelajar', ket: 'Terkunci · Administrasi belum memenuhi syarat', ...kunci }
  ]
  for (const u of k.value!.ujian) {
    const judul = `Kartu ${u.periode}`
    if (!layak) daftar.push({ id: u.periodeId, judul, ket: 'Terkunci · Administrasi belum memenuhi syarat', ...kunci })
    else if (!u.punyaKartu) daftar.push({ id: u.periodeId, judul, ket: 'Kartu belum diterbitkan. Hubungi Tata Usaha.', terkunci: false, buka: null, tile: '#EEF1F6', ink: '#64748B' })
    else daftar.push({ id: u.periodeId, judul, ket: `Tersedia · ${bulanTeks(u.mulai)}`, terkunci: false, buka: () => bukaKartu({ jenis: 'ujian', periodeId: u.periodeId, periode: u.periode }), tile: '#FFF1CC', ink: '#7A4B05' })
  }
  if (!k.value!.ujian.length) daftar.push({ id: 'ujian', judul: 'Kartu Ujian PTS/PAS', ket: 'Belum ada kartu ujian yang dirilis sekolah.', terkunci: false, buka: null, tile: '#EEF1F6', ink: '#64748B' })
  return daftar
})
const judulLembar = computed(() => lembar.value === 'sandi' ? 'Ganti kata sandi' : kartuAktif.value?.jenis === 'pelajar' ? 'Kartu Pelajar' : kartuAktif.value ? `Kartu ${kartuAktif.value.periode}` : '')

const token = ref('')
const kelasKartu = ref('')
const ruangKartu = ref('')
const tampilToken = ref(false)
const tokenSibuk = ref(false)
const galatKartu = ref('')
const unduh = ref<'siap' | 'sibuk' | 'selesai'>('siap')

const bukaKartu = (c: KartuDipilih) => {
  kartuAktif.value = c
  token.value = ''
  tampilToken.value = false
  galatKartu.value = ''
  unduh.value = 'siap'
  lembar.value = 'kartu'
}
const tutupLembar = () => {
  lembar.value = ''
  token.value = '' // token tidak disimpan setelah lembar ditutup
  tampilToken.value = false
}

const ambilToken = async () => {
  const c = kartuAktif.value
  if (c?.jenis !== 'ujian') return false
  if (token.value) return true
  tokenSibuk.value = true
  galatKartu.value = ''
  try {
    const r = await api<{ token: string, kelas: string, ruang: string }>('/api/ortu/kartu-token', { method: 'POST', body: { periodeId: c.periodeId } })
    token.value = r.token
    kelasKartu.value = r.kelas
    ruangKartu.value = r.ruang
    return true
  } catch (e) {
    galatKartu.value = pesanGalat(e)
    return false
  } finally {
    tokenSibuk.value = false
  }
}
const aturToken = async () => {
  if (tampilToken.value) { tampilToken.value = false; return }
  if (await ambilToken()) tampilToken.value = true
}

// Kartu Pelajar digambar ke kanvas lalu diunduh sebagai PNG (tanpa library tambahan).
const gambarKartuPelajar = async (): Promise<Blob> => {
  const s = p.value!.siswa
  const t = tema.value
  const c = document.createElement('canvas')
  c.width = 1012; c.height = 638
  const g = c.getContext('2d')!
  const latar = g.createLinearGradient(0, 0, 1012, 638)
  latar.addColorStop(0, t.p0); latar.addColorStop(1, t.p1)
  g.fillStyle = latar
  g.beginPath(); g.roundRect(0, 0, 1012, 638, 44); g.fill()
  g.fillStyle = 'rgba(240,180,41,.3)'
  g.beginPath(); g.arc(900, 60, 230, 0, Math.PI * 2); g.fill()
  const logo = new Image()
  logo.src = t.logo
  await logo.decode().catch(() => {})
  g.fillStyle = '#fff'
  g.beginPath(); g.roundRect(56, 52, 96, 96, 26); g.fill()
  if (logo.naturalWidth) g.drawImage(logo, 66, 62, 76, 76)
  g.textBaseline = 'top'
  g.fillStyle = '#fff'; g.font = '600 38px Inter, system-ui, sans-serif'; g.fillText(t.nama, 176, 62)
  g.fillStyle = '#F0B429'; g.font = '600 26px Inter, system-ui, sans-serif'; g.fillText('KARTU PELAJAR', 176, 112)
  g.fillStyle = 'rgba(255,255,255,.2)'
  g.beginPath(); g.roundRect(56, 250, 190, 230, 28); g.fill()
  g.fillStyle = '#fff'; g.font = '600 72px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(inisialNama(s.nama), 151, 325)
  g.textAlign = 'left'
  g.font = '600 50px Inter, system-ui, sans-serif'
  let nama = s.nama
  while (g.measureText(nama).width > 690 && nama.length > 4) nama = nama.slice(0, -2) + '…'
  g.fillText(nama, 280, 268)
  g.fillStyle = 'rgba(255,255,255,.88)'; g.font = '400 34px Inter, system-ui, sans-serif'
  g.fillText(`NIS ${s.nis}`, 280, 350)
  g.fillText(`${s.kelas} · TA ${s.tahunAjaran}`, 280, 400)
  return await new Promise<Blob>((ok, gagal) => c.toBlob(b => b ? ok(b) : gagal(new Error('Kartu gagal dibuat.')), 'image/png'))
}

const unduhKartu = async () => {
  const c = kartuAktif.value
  if (!c || unduh.value === 'sibuk') return
  galatKartu.value = ''
  unduh.value = 'sibuk'
  try {
    if (c.jenis === 'pelajar') {
      const url = URL.createObjectURL(await gambarKartuPelajar())
      const a = document.createElement('a')
      a.href = url
      a.download = `kartu-pelajar-${p.value!.siswa.nis}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } else {
      if (!(await ambilToken())) { unduh.value = 'siap'; return }
      // Format kartu sama dengan cetak kartu ujian admin (cbtKartuCetak).
      const s = p.value!.siswa
      const qr = await QRCode.toDataURL(URL_UNDUH_APK, { margin: 0, width: 240, errorCorrectionLevel: 'M' })
      const pesan = cetakKartu({
        kartu: [{ name: s.nama, nis: s.nis, nisn: s.nisn, ttl: s.ttl, classroom: kelasKartu.value || s.kelas, major: s.jurusan, room: ruangKartu.value, token: token.value, noPeserta: buatNoPeserta(s.tahunAjaran, c.periode, s.nis), foto: await muatFotoKartu(s.nis, 'ortu') }],
        grade: sesi.value?.jenjang ?? 'SMK', jenis: c.periode, judul: `${c.periode} · ${s.nama}`, tahunAjaran: s.tahunAjaran, qr
      })
      if (pesan) { galatKartu.value = pesan; unduh.value = 'siap'; return }
    }
    unduh.value = 'selesai'
  } catch (e: any) {
    galatKartu.value = e?.message || 'Kartu gagal dibuat.'
    unduh.value = 'siap'
  }
}

// ---- Ubah kontak orang tua (hanya WA, email, alamat)
const ubah = ref(false)
const draf = reactive<KontakOrtu>({ wa: '', email: '', alamat: '' })
const galatUbah = ref('')
const simpanSibuk = ref(false)
const mulaiUbah = () => { Object.assign(draf, p.value!.kontak); galatUbah.value = ''; ubah.value = true }
const batalUbah = () => { ubah.value = false; galatUbah.value = '' }
const simpan = async () => {
  const berubah = Object.fromEntries(FIELD.map(f => f.k).filter(key => draf[key].trim() !== p.value!.kontak[key]).map(key => [key, draf[key].trim()]))
  if (!Object.keys(berubah).length) { ubah.value = false; return }
  simpanSibuk.value = true
  galatUbah.value = ''
  try {
    p.value!.kontak = await api<KontakOrtu>('/api/ortu/profil', { method: 'PATCH', body: berubah })
    ubah.value = false
    tampilToast('Perubahan tersimpan')
  } catch (e) {
    galatUbah.value = pesanGalat(e)
  } finally {
    simpanSibuk.value = false
  }
}

const sandiDiganti = () => { tutupLembar(); tampilToast('Kata sandi tersimpan') }
</script>
