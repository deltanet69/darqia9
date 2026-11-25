// ============================================================
// Worker pengirim WA Darqia — SATU-SATUNYA proses yang menguras
// antrean wa_outbox (migrasi 0093) ke OpenWA.
//
// Jalan di VPS produksi lewat PM2 (app terpisah dari Nuxt):
//   pm2 start scripts/wa-worker.mjs --name darqia-wa-worker
// Env yang dibutuhkan (dari /srv/darqia/app/.env, dimuat PM2 --env-file):
//   NUXT_PUBLIC_SUPABASE_URL, NUXT_SUPABASE_SECRET_KEY,
//   OPENWA_URL, OPENWA_API_KEY, OPENWA_SESSION
//
// Aturan anti-ban lapis aplikasi (di luar governor pacing OpenWA):
//  1. Jam aktif 06:00–21:00 WIB.
//  2. Jeda acak 25–60 detik antar pesan. Tidak pernah burst.
//  3. Maks 3 percobaan; 429 SEND_PACING_LIMITED dihormati persis
//     retryAfterSeconds-nya dan TIDAK dihitung sebagai percobaan.
//  4. Sesi tidak siap -> berhenti mengirim, antrean menunggu.
// ============================================================

import { createClient } from '@supabase/supabase-js'

const JAM_MULAI = 6
const JAM_SELESAI = 21
const JEDA_MIN = 25_000
const JEDA_MAKS = 60_000
const MAKS_COBA = 3

const OW = (process.env.OPENWA_URL || 'http://127.0.0.1:2786').replace(/\/$/, '')
const OW_KEY = process.env.OPENWA_API_KEY || ''
const SESI = process.env.OPENWA_SESSION || 'spmb'

const supabase = createClient(process.env.NUXT_PUBLIC_SUPABASE_URL, process.env.NUXT_SUPABASE_SECRET_KEY)
const tidur = (ms) => new Promise((r) => setTimeout(r, ms))
const jedaAcak = () => JEDA_MIN + Math.floor(Math.random() * (JEDA_MAKS - JEDA_MIN))

function dalamJamAktif() {
  const jam = Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }))
  return jam >= JAM_MULAI && jam < JAM_SELESAI
}

async function ow(path, init = {}) {
  const res = await fetch(`${OW}/api${path}`, {
    ...init,
    headers: { 'X-API-Key': OW_KEY, 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const e = new Error(data?.message || `OpenWA ${res.status}`)
    e.status = res.status
    e.code = data?.code
    e.retryAfterSeconds = data?.retryAfterSeconds
    throw e
  }
  return data
}

async function sesiSiap() {
  const daftar = await ow('/sessions')
  const s = (Array.isArray(daftar) ? daftar : []).find((x) => x.name === SESI)
  return s && ['ready', 'connected'].includes(String(s.status)) ? s : null
}

async function putaran() {
  if (!dalamJamAktif()) return
  const sesi = await sesiSiap().catch(() => null)
  if (!sesi) return
  const { data } = await supabase
    .from('wa_outbox')
    .select('*')
    .eq('keadaan', 'antre')
    .lt('percobaan', MAKS_COBA)
    .order('dibuat_at', { ascending: true })
    .limit(1)
  if (!data?.length) return
  const p = data[0]
  try {
    await ow(`/sessions/${sesi.id}/messages/send-text`, {
      method: 'POST',
      headers: { 'Idempotency-Key': p.dedupe_key },
      body: JSON.stringify({ chatId: `${p.tujuan}@c.us`, text: p.isi })
    })
    await supabase.from('wa_outbox').update({ keadaan: 'terkirim', terkirim_at: new Date().toISOString() }).eq('id', p.id)
  } catch (e) {
    if (e.status === 429 && e.code === 'SEND_PACING_LIMITED') {
      await tidur((e.retryAfterSeconds ?? 60) * 1000)
      return
    }
    await supabase.from('wa_outbox').update({
      percobaan: p.percobaan + 1,
      galat: String(e.message || e).slice(0, 300),
      keadaan: p.percobaan + 1 >= MAKS_COBA ? 'gagal' : 'antre'
    }).eq('id', p.id)
  }
  await tidur(jedaAcak())
}

console.log('[wa-worker] mulai — sesi', SESI, 'gateway', OW)
for (;;) {
  try { await putaran() } catch (e) { console.error('[wa-worker]', e?.message || e) }
  await tidur(15_000)
}
