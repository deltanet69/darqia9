// Uji beban CBT siswa dengan k6 (https://k6.io).
//
// Data peserta: tests/k6-siswa.json (JANGAN di-commit, berisi token) berbentuk
//   [{ "nis": "2627...", "token": "ABCD2345", "grade": "SMK" }, ...]
//
// MODE=login  : hanya login (baca saja, aman diulang berkali-kali).
// MODE=ujian  : login -> buka ujian -> mulai -> simpan jawaban tiap 10 dtk -> kumpulkan.
//               MENGUBAH DATA (status ujian jadi selesai): pakai ujian uji coba dan reset sesudahnya.
//
// Contoh:
//   k6 run -e BASE_URL=https://domain-lo -e MODE=login -e VUS=1000 -e RAMP=60 tests/k6-cbt-siswa.js
//   k6 run -e BASE_URL=https://domain-lo -e MODE=ujian -e VUS=1000 -e RAMP=60 -e DURASI=180 tests/k6-cbt-siswa.js
import http from 'k6/http'
import { check, sleep, fail } from 'k6'
import { SharedArray } from 'k6/data'
import { Trend } from 'k6/metrics'

const BASE = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const MODE = __ENV.MODE || 'login'
const VUS = Number(__ENV.VUS || 1000)
const RAMP = Number(__ENV.RAMP || 60) // detik: login siswa disebar acak dalam rentang ini
const DURASI = Number(__ENV.DURASI || 180) // detik: lama simulasi mengerjakan (hanya MODE=ujian)
const SOURCE = __ENV.SOURCE || 'cbt' // cbt | ujian_harian
const EXAM_ID = __ENV.EXAM_ID || '' // kosong = pakai ujian pertama yang dapat dimulai dari respons login

const siswa = new SharedArray('siswa', () => JSON.parse(open('./k6-siswa.json')))

const waktuSiapkan = new Trend('cbt_siapkan_ms', true)
const waktuSimpan = new Trend('cbt_simpan_ms', true)

export const options = {
  scenarios: {
    peserta: { executor: 'per-vu-iterations', vus: VUS, iterations: 1, maxDuration: `${RAMP + DURASI + 300}s` }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:login}': ['p(95)<1500'],
    cbt_siapkan_ms: ['p(95)<3000'],
    cbt_simpan_ms: ['p(95)<1000']
  }
}

const kirim = (path, body, nama) => http.post(`${BASE}${path}`, JSON.stringify(body), {
  headers: { 'Content-Type': 'application/json' },
  tags: { name: nama },
  timeout: '30s'
})

// Jawaban contoh sesuai jenis soal (format sama dengan aplikasi: indeks pilihan / array indeks / teks).
const jawabanContoh = (q) => {
  if (q.type === 'Esai') return 'Jawaban uji beban. '.repeat(12)
  if (q.type === 'Isian') return 'uji'
  if (q.type === 'Interaktif' && q.interactive_answer_type === 'Isian') return 'uji'
  return q.is_multi_select || q.interactive_answer_type === 'PG_Multi' ? [0, 1] : '0'
}

export default function () {
  if (!siswa.length) fail('tests/k6-siswa.json kosong')
  if (VUS > siswa.length) fail(`VUS (${VUS}) lebih banyak dari data peserta (${siswa.length}). Kurangi VUS atau tambah data.`)
  const s = siswa[(__VU - 1) % siswa.length]
  const dasar = { nis: s.nis, token: s.token, grade: s.grade }

  sleep(Math.random() * RAMP) // sebar waktu login seperti siswa sungguhan

  const login = kirim('/api/cbt/login', dasar, 'login')
  const ok = check(login, { 'login 200': r => r.status === 200 })
  if (!ok || MODE === 'login') return

  const jadwal = login.json('ujian') || []
  const ujian = EXAM_ID
    ? jadwal.find(u => u.id === EXAM_ID)
    : jadwal.find(u => u.source === SOURCE && u.statusSiswa !== 'selesai' && new Date(u.mulai).getTime() <= Date.now())
  if (!ujian) fail('Tidak ada ujian yang sudah dapat dimulai untuk peserta ini (jam mulai belum tiba / sudah selesai).')
  const ujianBody = { ...dasar, source: ujian.source, examId: ujian.id }

  sleep(1 + Math.random() * 4) // siswa membaca tata tertib
  const siap = kirim('/api/cbt/siapkan', ujianBody, 'siapkan')
  waktuSiapkan.add(siap.timings.duration)
  if (!check(siap, { 'siapkan 200': r => r.status === 200 })) return
  const soal = siap.json('questions') || []

  check(kirim('/api/cbt/mulai', ujianBody, 'mulai'), { 'mulai 200': r => r.status === 200 })

  // Mengerjakan: tiap 10 detik mengirim 1-2 jawaban baru (hanya yang berubah, seperti aplikasi).
  const selesaiKerja = Date.now() + DURASI * 1000
  let i = 0
  while (Date.now() < selesaiKerja) {
    sleep(10)
    const daftar = []
    for (let n = 0; n < 1 + (i % 2) && i < soal.length; n++, i++) daftar.push({ q: soal[i].id, a: jawabanContoh(soal[i]), d: false })
    if (!daftar.length) continue
    const r = kirim('/api/cbt/simpan', { ...ujianBody, jawaban: daftar }, 'simpan')
    waktuSimpan.add(r.timings.duration)
    check(r, { 'simpan 200': x => x.status === 200 })
  }

  const semua = soal.slice(0, i).map(q => ({ q: q.id, a: jawabanContoh(q), d: false }))
  check(kirim('/api/cbt/kumpulkan', { ...ujianBody, jawaban: semua }, 'kumpulkan'), { 'kumpulkan 200': r => r.status === 200 })
}
