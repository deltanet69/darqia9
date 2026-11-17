<template>
  <div>
    <div class="up">
      <h1 style="margin:0;font-size:30px;font-weight:600;letter-spacing:-.025em;color:var(--p0)">Nilai</h1>
      <div style="margin-top:2px;font-size:16px;color:#51607F">{{ d ? `${d.nama} · Semester ${d.semester}` : 'Memuat…' }}</div>
    </div>

    <div class="up" role="tablist" aria-label="Jenis nilai" style="animation-delay:.06s;margin-top:16px;display:flex;background:#E9EEF8;border-radius:15px;padding:4px">
      <button v-for="t in TAB" :key="t.k" type="button" role="tab" :aria-selected="tab === t.k" :style="`flex:1;height:44px;border-radius:11px;text-align:center;font-size:15px;font-weight:500;background:${tab === t.k ? '#fff' : 'transparent'};color:${tab === t.k ? 'var(--p0)' : '#51607F'};box-shadow:${tab === t.k ? '0 2px 8px rgba(10,42,92,.12)' : 'none'};transition:background .35s,color .35s,box-shadow .35s`" @click="gantiTab(t.k)">{{ t.l }}</button>
    </div>

    <div v-if="galat" role="alert" style="margin-top:18px;padding:14px 16px;border-radius:18px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.45">
      {{ galat }}
      <button type="button" style="display:block;margin-top:6px;min-height:44px;font-weight:600;text-decoration:underline" @click="muat">Coba lagi</button>
    </div>

    <template v-if="d">
      <div class="up" style="animation-delay:.1s;margin-top:14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
        <div v-for="k in ubin" :key="k.l" :style="`background:linear-gradient(160deg,${k.bg},#fff);border-radius:20px;padding:14px 12px;box-shadow:0 4px 16px rgba(10,42,92,.05)`">
          <div style="font-size:13px;color:#51607F">{{ k.l }}</div>
          <div :style="`margin-top:6px;font-size:28px;line-height:1;font-weight:600;letter-spacing:-.03em;color:${k.fg}`">{{ k.v }}</div>
          <div style="margin-top:6px;font-size:13px;color:#64748B">{{ k.s }}</div>
        </div>
      </div>

      <h2 :key="`h-${tab}`" class="fade" style="margin:20px 0 0;font-size:19px;font-weight:600;color:var(--p0)">{{ kepala.t }}</h2>
      <div :key="`s-${tab}`" class="fade" style="margin-top:2px;font-size:15px;color:#51607F">{{ kepala.s }}</div>

      <component :is="m.buka ? 'button' : 'div'" v-for="m in barisNilai" :key="`${tab}-${m.k}`" :type="m.buka ? 'button' : undefined" :class="m.buka ? 'fade press' : 'fade'" style="display:block;width:100%;box-sizing:border-box;margin-top:12px;background:#fff;border-radius:22px;padding:16px 18px;box-shadow:0 5px 20px rgba(10,42,92,.05)" @click="m.buka && bukaMapel(m.k)">
        <div style="display:flex;align-items:center;gap:10px">
          <div :style="`flex:1;font-size:17px;font-weight:500;color:${m.n ? '#14213D' : '#64748B'}`">{{ m.n ?? 'Jadwal diumumkan H-2' }}</div>
          <div style="font-size:24px;font-weight:600;letter-spacing:-.02em;color:var(--p1)">{{ m.s }}</div>
          <svg v-if="m.buka" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA7BE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </div>
        <div v-if="m.split" style="margin-top:12px;display:flex;height:9px;border-radius:5px;overflow:hidden;background:#E9EEF8">
          <div :style="`width:${m.bw};background:#22A05A`" /><div :style="`width:${m.sw};background:#F2A1A1`" />
        </div>
        <div v-else-if="m.w" style="margin-top:10px;height:7px;border-radius:4px;background:#E9EEF8">
          <div class="bar" :style="`width:${m.w};height:100%;border-radius:4px;background:linear-gradient(90deg,var(--p1),var(--gold))`" />
        </div>
        <div style="margin-top:9px;font-size:15px;color:#51607F">{{ m.baris }}</div>
      </component>

      <div v-if="!barisNilai.length" class="fade" style="margin-top:12px;background:#fff;border-radius:22px;padding:22px 18px;text-align:center;font-size:16px;line-height:1.5;color:#51607F;box-shadow:0 5px 20px rgba(10,42,92,.05)">{{ kosong }}</div>
    </template>
    <template v-else-if="!galat">
      <div class="muat" style="margin-top:14px;height:96px;border-radius:20px" />
      <div class="muat" style="margin-top:20px;height:96px" />
      <div class="muat" style="margin-top:12px;height:96px" />
    </template>

    <Teleport to="#ortu-lapis" defer>
      <section :class="`pane ${pn ? 'on' : ''}`" :aria-hidden="!pn" aria-label="Rincian nilai mata pelajaran">
        <template v-if="pn">
          <button type="button" class="press" style="display:flex;align-items:center;gap:4px;height:44px;font-size:16px;font-weight:500;color:var(--p1)" @click="tutupMapel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>Nilai
          </button>
          <div class="up">
            <h2 style="margin:0;font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-.025em;color:var(--p0)">{{ pn.n }}</h2>
            <div style="margin-top:4px;font-size:16px;color:#51607F">Semester {{ d?.semester }}</div>
          </div>

          <div class="up" style="animation-delay:.06s;margin-top:16px;border-radius:26px;padding:20px 22px;background:linear-gradient(150deg,var(--soft),#fff);box-shadow:0 6px 24px rgba(10,42,92,.07)">
            <div style="font-size:15px;color:#51607F">{{ pn.heroL }}</div>
            <div style="margin-top:2px;font-size:52px;line-height:1.05;font-weight:600;letter-spacing:-.035em;color:var(--p0)">{{ pn.heroV }}</div>
            <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
              <div v-for="ch in pn.chips" :key="ch" style="padding:6px 12px;border-radius:999px;background:#fff;font-size:14px;color:#33415C">{{ ch }}</div>
            </div>
          </div>

          <div v-if="pn.batang.length" class="up" style="animation-delay:.12s;margin-top:12px;background:#fff;border-radius:24px;padding:18px 18px 16px;box-shadow:0 6px 24px rgba(10,42,92,.06)">
            <div style="font-size:17px;font-weight:600;color:var(--p0)">Perkembangan nilai</div>
            <div style="margin-top:14px;display:flex;align-items:flex-end;justify-content:space-between;height:140px;overflow-x:auto" class="scroll">
              <div v-for="(b, i) in pn.batang" :key="i" style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;flex:1;min-width:36px">
                <div style="font-size:14px;font-weight:600;margin-bottom:5px;color:#14213D">{{ b.v }}</div>
                <div class="col" :style="`width:70%;max-width:34px;height:${b.h};border-radius:10px 10px 5px 5px;background:${b.bg}`" />
                <div style="margin-top:7px;font-size:12px;color:#64748B">{{ b.l }}</div>
              </div>
            </div>
          </div>

          <div v-if="pn.evaluasi.length" class="up" style="animation-delay:.18s;margin-top:12px;background:#fff;border-radius:24px;padding:18px;box-shadow:0 6px 24px rgba(10,42,92,.06)">
            <div style="font-size:17px;font-weight:600;color:var(--p0)">Bahan evaluasi</div>
            <div v-for="ev in pn.evaluasi" :key="ev.t" style="display:flex;gap:10px;margin-top:10px;font-size:16px;line-height:1.45;color:#33415C"><span :style="`width:8px;height:8px;border-radius:50%;background:${ev.c};margin-top:8px;flex:none`" /><span>{{ ev.t }}</span></div>
          </div>

          <template v-for="g in pn.grup" :key="g.t">
            <h3 style="margin:22px 0 0;font-size:19px;font-weight:600;color:var(--p0)">{{ g.t }}</h3>
            <div v-for="it in g.isi" :key="it.id" class="up" style="margin-top:10px;background:#fff;border-radius:22px;padding:16px 18px;box-shadow:0 5px 20px rgba(10,42,92,.05)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
                <div style="min-width:0">
                  <div style="font-size:17px;font-weight:500;color:#14213D">{{ it.l }}</div>
                  <div style="margin-top:2px;font-size:14px;color:#64748B">{{ it.tgl }}</div>
                </div>
                <div style="font-size:28px;line-height:1;font-weight:600;letter-spacing:-.03em;color:var(--p1)">{{ it.v }}</div>
              </div>
              <div style="margin-top:12px;display:flex;height:10px;border-radius:5px;overflow:hidden;background:#E9EEF8">
                <div :style="`width:${it.bw};background:#22A05A`" /><div :style="`width:${it.sw};background:#F2A1A1`" />
              </div>
              <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:4px 16px;font-size:15px">
                <span style="color:#14532D;font-weight:500">{{ it.benar }} benar</span>
                <span style="color:#9A1F1F;font-weight:500">{{ it.salah }} salah</span>
                <span style="color:#64748B">dari {{ it.soal }} soal</span>
                <span v-if="it.menunggu" style="color:#7A4B05">{{ it.menunggu }} esai menunggu dinilai guru</span>
              </div>
            </div>
          </template>
        </template>
      </section>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { JenisUjian, NilaiOrtu, UjianOrtu } from '~/types/ortu'

type Tab = 'ring' | 'uh' | 'pts' | 'pas'
const TAB: Array<{ k: Tab, l: string }> = [{ k: 'ring', l: 'Ringkasan' }, { k: 'uh', l: 'Harian' }, { k: 'pts', l: 'PTS' }, { k: 'pas', l: 'PAS' }]
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const route = useRoute()
const { api, pesanGalat, tema } = useOrtu()
const d = ref<NilaiOrtu | null>(null)
const galat = ref('')
const muat = async () => {
  galat.value = ''
  try { d.value = await api<NilaiOrtu>('/api/ortu/nilai') } catch (e) { galat.value = pesanGalat(e) }
}
onMounted(muat)

// Tab & panel mapel di URL (?tab=uh&mapel=<id>) agar tombol Kembali perangkat bekerja.
const tab = computed<Tab>(() => (['uh', 'pts', 'pas'] as const).find(t => t === route.query.tab) ?? 'ring')
const gantiTab = (t: Tab) => navigateTo({ query: t === 'ring' ? {} : { tab: t } }, { replace: true })
const bukaMapel = (id: string) => navigateTo({ query: { ...route.query, mapel: id } })
const tutupMapel = () => { const { mapel: _, ...q } = route.query; navigateTo({ query: q }, { replace: true }) }

const dec = (n: number) => n.toFixed(1).replace('.', ',')
const rata = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null
const tgl = (iso: string) => { const t = new Date(iso); return `${t.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric' })} ${BULAN[Number(t.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta', month: 'numeric' })) - 1]}` }

const selesai = computed(() => (d.value?.ujian ?? []).filter(u => u.selesai && u.nilai !== null && u.mapelId))
// Per mapel, urut waktu naik (UH 1, UH 2, ...).
const mapel = computed(() => {
  const peta = new Map<string, { id: string, n: string, uh: UjianOrtu[], pr: UjianOrtu[], pts: UjianOrtu[], pas: UjianOrtu[] }>()
  for (const u of [...selesai.value].sort((a, b) => a.tanggal.localeCompare(b.tanggal))) {
    const m = peta.get(u.mapelId!) ?? { id: u.mapelId!, n: u.mapel!, uh: [], pr: [], pts: [], pas: [] }
    m[u.jenis.toLowerCase() as 'uh' | 'pr' | 'pts' | 'pas'].push(u)
    peta.set(u.mapelId!, m)
  }
  return [...peta.values()].map((m) => {
    const harian = rata([...m.uh, ...m.pr].map(u => u.nilai!))
    const pts = m.pts.at(-1)?.nilai ?? null
    const pas = m.pas.at(-1)?.nilai ?? null
    const akhir = rata([harian, pts, pas].filter((x): x is number => x !== null))
    return { ...m, harian, ptsV: pts, pasV: pas, akhir }
  }).sort((a, b) => a.n.localeCompare(b.n))
})

const daftarJenis = (j: JenisUjian) => (d.value?.ujian ?? []).filter(u => u.jenis === j)
const ubin = computed(() => {
  const harian = selesai.value.filter(u => u.jenis === 'UH' || u.jenis === 'PR')
  const pts = selesai.value.filter(u => u.jenis === 'PTS')
  const pas = selesai.value.filter(u => u.jenis === 'PAS')
  const v = (a: UjianOrtu[]) => { const r = rata(a.map(u => u.nilai!)); return r === null ? '–' : dec(r) }
  return [
    { l: 'Harian & PR', v: v(harian), s: `${harian.length} penilaian`, bg: '#E3EEFF', fg: '#1E40AF' },
    { l: 'PTS', v: v(pts), s: `${pts.length} mapel`, bg: '#FFF1CC', fg: '#7A4B05' },
    { l: 'PAS', v: v(pas), s: `${pas.length} mapel`, bg: tema.value.soft, fg: tema.value.p0 }
  ]
})

const jadwalTeks = (j: JenisUjian) => {
  const a = daftarJenis(j).map(u => u.tanggal).sort()
  if (!a.length) return 'Belum dijadwalkan'
  const awal = new Date(a[0]!).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })
  return daftarJenis(j).every(u => u.selesai) ? `Dilaksanakan mulai ${awal}` : `Dijadwalkan mulai ${awal}`
}
const kepala = computed(() => ({
  ring: { t: 'Per mata pelajaran', s: 'Ketuk untuk melihat semua penilaian' },
  uh: { t: 'Ulangan Harian & PR', s: 'Ketuk mapel untuk melihat tiap ulangan' },
  pts: { t: 'Penilaian Tengah Semester', s: jadwalTeks('PTS') },
  pas: { t: 'Penilaian Akhir Semester', s: jadwalTeks('PAS') }
}[tab.value]))
const kosong = computed(() => tab.value === 'pts' || tab.value === 'pas'
  ? `Nilai ${tab.value.toUpperCase()} muncul setelah ujian dilaksanakan.`
  : 'Belum ada nilai pada semester ini.')

const barisNilai = computed(() => {
  if (tab.value === 'ring') {
    return mapel.value.filter(m => m.akhir !== null).map(m => ({
      k: m.id, n: m.n as string | null, s: dec(m.akhir!), w: `${Math.round(m.akhir!)}%`, buka: true, split: false, bw: '', sw: '',
      baris: `Harian ${m.harian !== null ? Math.round(m.harian) : '–'} · PTS ${m.ptsV !== null ? Math.round(m.ptsV) : '–'} · PAS ${m.pasV !== null ? Math.round(m.pasV) : '–'}`
    }))
  }
  if (tab.value === 'uh') {
    return mapel.value.filter(m => m.harian !== null).map(m => ({
      k: m.id, n: m.n as string | null, s: dec(m.harian!), w: `${Math.round(m.harian!)}%`, buka: true, split: false, bw: '', sw: '',
      baris: `${m.uh.length} ulangan · ${m.pr.length} PR · ketuk untuk rincian`
    }))
  }
  // PTS/PAS: satu baris per ujian; sebelum H-2 nama mapel dirahasiakan server (mapel = null).
  return daftarJenis(tab.value === 'pts' ? 'PTS' : 'PAS').sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((u) => {
    const ada = u.selesai && u.nilai !== null && u.total > 0
    return {
      k: u.id, n: u.mapel, s: ada ? String(Math.round(u.nilai!)) : '', w: '', buka: false, split: ada,
      bw: ada ? `${u.benar / u.total * 100}%` : '', sw: ada ? `${u.salah / u.total * 100}%` : '',
      baris: ada ? `${u.benar} benar · ${u.salah} salah dari ${u.total} soal` : u.mapel ? `Dijadwalkan ${tgl(u.tanggal)}` : 'Mapel dan jadwal rinci diumumkan H-2 sebelum ujian'
    }
  })
})

// Panel rincian satu mapel.
const pn = computed(() => {
  const m = mapel.value.find(x => x.id === route.query.mapel)
  if (!m) return null
  const semua = tab.value === 'ring'
  const ujian = [...m.uh, ...m.pr, ...(semua ? [...m.pts, ...m.pas] : [])]
  const nama = (u: UjianOrtu) => {
    const daftar = u.jenis === 'UH' ? m.uh : u.jenis === 'PR' ? m.pr : null
    return daftar ? `${u.jenis === 'UH' ? 'Ulangan Harian' : 'PR di Rumah'} ${daftar.indexOf(u) + 1}` : u.jenis
  }
  const pendek = (u: UjianOrtu) => nama(u).replace('Ulangan Harian ', 'UH').replace('PR di Rumah ', 'PR')
  const item = (u: UjianOrtu) => ({
    id: u.id, l: nama(u), tgl: tgl(u.tanggal), v: Math.round(u.nilai!), benar: u.benar, salah: u.salah, soal: u.total, menunggu: u.menunggu,
    bw: u.total ? `${u.benar / u.total * 100}%` : '0%', sw: u.total ? `${u.salah / u.total * 100}%` : '0%'
  })
  const grup = [{ t: 'Ulangan Harian', isi: m.uh.map(item) }, { t: 'PR di Rumah', isi: m.pr.map(item) }]
  if (semua) grup.push({ t: 'PTS', isi: m.pts.map(item) }, { t: 'PAS', isi: m.pas.map(item) })
  const evaluasi: Array<{ c: string, t: string }> = []
  if (ujian.length) {
    const terbaik = ujian.reduce((a, b) => (b.nilai! > a.nilai! ? b : a))
    const terendah = ujian.reduce((a, b) => (b.nilai! < a.nilai! ? b : a))
    evaluasi.push({ c: '#22A05A', t: `Tertinggi: ${nama(terbaik)} (${Math.round(terbaik.nilai!)})` })
    evaluasi.push({ c: '#D97706', t: `Terendah: ${nama(terendah)} (${Math.round(terendah.nilai!)})` })
    if (m.uh.length >= 2) {
      const selisih = Math.round(m.uh.at(-1)!.nilai! - m.uh[0]!.nilai!)
      evaluasi.push({ c: tema.value.p1, t: selisih > 0 ? `Ulangan harian naik ${selisih} poin dari UH 1 ke UH ${m.uh.length}.` : selisih < 0 ? `Ulangan harian turun ${-selisih} poin dari UH 1 ke UH ${m.uh.length}.` : 'Nilai ulangan harian stabil.' })
    }
    const b = ujian.reduce((a, u) => a + u.benar, 0)
    const s = ujian.reduce((a, u) => a + u.total, 0)
    evaluasi.push({ c: '#64748B', t: `Total ${b} benar dan ${s - b} salah dari ${s} soal.` })
  }
  const nilaiHero = semua ? m.akhir : m.harian
  return {
    n: m.n,
    heroL: semua ? 'Nilai akhir sementara' : 'Rata-rata ulangan harian & PR',
    heroV: nilaiHero !== null ? dec(nilaiHero) : '–',
    chips: semua
      ? [`Harian ${m.harian !== null ? Math.round(m.harian) : '–'}`, `PTS ${m.ptsV !== null ? Math.round(m.ptsV) : '–'}`, `PAS ${m.pasV !== null ? Math.round(m.pasV) : '–'}`]
      : [`${m.uh.length} ulangan harian`, `${m.pr.length} PR`],
    batang: ujian.map(u => ({
      l: pendek(u), v: Math.round(u.nilai!), h: `${Math.max(24, Math.round(24 + (u.nilai! - 60) / 40 * 80))}px`,
      bg: u.jenis === 'PTS' || u.jenis === 'PAS' ? '#F0B429' : u.jenis === 'PR' ? `${tema.value.p1}99` : tema.value.p1
    })),
    evaluasi,
    grup: grup.filter(g => g.isi.length)
  }
})
</script>
