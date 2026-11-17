import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { ambilPresensiHarian } from '../../utils/ortuPresensi'
import { muatSiswaOrtu, muatTagihanOrtu, muatUjianOrtu, persenHadir, rataUjian } from '../../utils/ortuData'
import { rp } from '../../../app/composables/keuanganCore'
import { tanggalWib } from '../../../app/composables/ortuCore'
import type { NotifOrtu, RingkasanOrtu } from '../../../app/types/ortu'

const LABEL_UJIAN = { UH: 'Ulangan Harian', PR: 'PR di Rumah', PTS: 'PTS', PAS: 'PAS' } as const

// GET /api/ortu/ringkasan — Beranda + pemberitahuan. Pemberitahuan diturunkan dari data nyata (tanpa tabel notifikasi).
export default defineEventHandler(async (event): Promise<RingkasanOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const hariIni = tanggalWib()
  const [{ siswa, baris }, hari, ujian, tagihan, periodeRes] = await Promise.all([
    muatSiswaOrtu(db, sesi.studentId),
    ambilPresensiHarian(db, sesi.studentId, hariIni.slice(0, 7)),
    muatUjianOrtu(db, sesi.studentId),
    muatTagihanOrtu(db, sesi.grade, sesi.nis, true),
    db.from('exam_card_periods').select('id, periode, released_at').eq('grade', sesi.grade).eq('source', 'cbt')
      .not('released_at', 'is', null).order('released_at', { ascending: false }).limit(3)
  ])
  const panggil = sesi.nama.split(' ')[0] || 'Ananda'
  const notif: NotifOrtu[] = []

  for (const h of hari.filter(x => x.tanggal === hariIni || x.status === 'alpa' || x.status === 'terlambat').slice(-4)) {
    const judul = h.status === 'tepat' || h.status === 'terlambat'
      ? (h.tanggal === hariIni ? `${panggil} tiba di sekolah` : `${panggil} terlambat masuk`)
      : h.status === 'alpa' ? `${panggil} tidak hadir tanpa keterangan` : `${panggil} ${h.status}`
    const sub = h.jamMasuk ? `Masuk ${h.jamMasuk} · ${h.status === 'tepat' ? 'Tepat waktu' : 'Terlambat'}` : 'Lihat rincian presensi'
    notif.push({ id: `presensi:${h.tanggal}:${h.status}`, jenis: 'presensi', judul, sub, waktu: `${h.tanggal}T07:00:00+07:00`, ke: '/ortu/presensi' })
  }
  for (const u of ujian.filter(x => x.selesai && x.nilai !== null && x.mapel).slice(0, 3)) {
    notif.push({ id: `nilai:${u.id}`, jenis: 'nilai', judul: `Nilai baru: ${u.mapel}`, sub: `${LABEL_UJIAN[u.jenis]} · nilai ${Math.round(u.nilai!)}`, waktu: u.tanggal, ke: '/ortu/nilai' })
  }
  for (const r of tagihan.dirilisPada) {
    const t = tagihan.tingkat[r.tingkat]
    if (!t) continue
    notif.push({ id: `rilis:${r.tingkat}:${r.pada}`, jenis: 'tagihan', judul: `Tagihan ${t.label} dirilis`, sub: t.sisa > 0 ? `Sisa ${rp(t.sisa)} dari ${rp(t.total)}` : 'Sudah lunas', waktu: r.pada, ke: '/ortu/administrasi' })
  }
  for (const b of tagihan.riwayat.slice(0, 3)) {
    notif.push({ id: `bayar:${b.no}`, jenis: 'tagihan', judul: 'Pembayaran tercatat', sub: `${b.no} · ${rp(b.nominal)}`, waktu: `${b.tanggal}T12:00:00+07:00`, ke: '/ortu/administrasi' })
  }
  for (const p of (periodeRes.error ? [] : periodeRes.data) || []) {
    notif.push({ id: `kartu:${p.id}`, jenis: 'kartu', judul: `Kartu ${p.periode} tersedia`, sub: 'Dapat dibuka di halaman Profil', waktu: p.released_at, ke: '/ortu/profil' })
  }
  notif.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime())

  const dirilis = tagihan.tingkat.filter(t => t.keadaan === 'ok')
  const fokus = dirilis.find(t => t.sisa > 0) ?? dirilis[dirilis.length - 1]
  return {
    siswa,
    hariIni: hari.find(h => h.tanggal === hariIni) ?? null,
    kehadiranPersen: persenHadir(baris),
    rataNilai: rataUjian(ujian),
    tagihan: fokus ? { label: fokus.label, sisa: fokus.sisa } : null,
    notif: notif.slice(0, 12)
  }
})
