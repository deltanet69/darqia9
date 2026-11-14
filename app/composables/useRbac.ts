// Store RBAC (Hak Akses) — satu-satunya penulis tabel rbac_* (migrasi 0023).
// Pola sama seperti useModulPembelajaran: state bersama via useState, muat dari
// Supabase, dan tetap berjalan dengan data awal lokal bila tabel belum ada
// (halaman menampilkan pemberitahuan sampai migrasi 0023 dijalankan).
//
// Penegakan (aturan user 1 Nov 2026):
// - Satu pengguna satu peran: penugasan di-upsert per subjek, peran lama lepas.
// - bisaSaya() adalah sumber kebenaran sisi aplikasi: dipakai middleware
//   penjaga rute + penyaring menu. Bila pengguna belum punya penugasan,
//   penegakan belum aktif untuknya (masa peralihan sampai akun ditugaskan).

import { useState } from 'nuxt/app'
import { computed, watchEffect, type Ref } from 'vue'
import { useAdminGrade } from './useAdminGrade'
import {
  RBAC_BATAS_BAWAAN, RBAC_KUNCI, RBAC_SEED_IZIN, RBAC_SEED_PERAN, agregatModul, bisaAkses, izinKosong,
  kunciSub, lengkapiSub, modulDariJudul, penugasanDari, jenjangAkun, lintasJenjang,
  type AksiRbac, type CakupanPeran, type CakupanRbac, type IzinPeran, type JenjangRbac, type PenugasanRbac, type PeranRbac
} from './rbacCore'

export * from './rbacCore'

export interface KandidatRbac { subjekId: string; nama: string; keterangan: string; punyaAkun: boolean }

interface RbacState {
  peran: PeranRbac[]
  izin: Record<string, IzinPeran>
  cakupan: Record<string, CakupanPeran>
  // Kolom rbac_permissions.cakupan ada (migrasi 0063 sudah dijalankan).
  cakupanSiap: boolean
  penugasan: PenugasanRbac[]
  kandidat: KandidatRbac[]
  kandidatAkunTermuat: boolean
  tabelSiap: boolean
  termuat: boolean
  dimuatPada: number
  subjekSaya: string | null
  namaSaya: string | null
  // Jenjang tempat akun guru mengajar (jadwal aktif) atau menjadi wali kelas; menentukan switcher jenjang.
  jadwalJenjang: JenjangRbac[]
  jenjangGuru: JenjangRbac | null
}

const seedState = (): RbacState => {
  const izin: Record<string, IzinPeran> = {}
  for (const peran of RBAC_SEED_PERAN) izin[peran.id] = JSON.parse(JSON.stringify(RBAC_SEED_IZIN[peran.kunci] || izinKosong()))
  return {
    peran: JSON.parse(JSON.stringify(RBAC_SEED_PERAN)),
    izin,
    cakupan: {},
    cakupanSiap: false,
    penugasan: [],
    kandidat: [],
    kandidatAkunTermuat: false,
    tabelSiap: false,
    termuat: false,
    dimuatPada: 0,
    subjekSaya: null,
    namaSaya: null,
    jadwalJenjang: [],
    jenjangGuru: null
  }
}

export const useRbac = () => {
  const state = useState<RbacState>('rbac-state', seedState)
  const grade = useAdminGrade()

  // Kandidat dari akun login (dibuat langsung di Manajemen Pengguna, tanpa
  // record guru) HANYA bisa dimuat dari klien: endpoint daftar akun butuh
  // sesi browser. Pemuatan utama bisa lebih dulu jalan di server (state
  // ter-serialisasi dengan termuat=true), jadi fungsi ini berkawal sendiri
  // dan dipanggil juga dari jalur pintas muat() di bawah.
  const muatKandidatAkun = async () => {
    if (!import.meta.client || state.value.kandidatAkunTermuat) return
    state.value.kandidatAkunTermuat = true
    try {
      const hasil = await $fetch<any>('/api/admin/users').catch(() => null)
      const akun: any[] = Array.isArray(hasil?.users) ? hasil.users : []
      const tambahan = akun
        .filter((u: any) => u?.id && !u.guruId && !state.value.kandidat.some(k => k.subjekId === String(u.id)))
        .map((u: any) => ({
          subjekId: String(u.id), nama: u.name || u.email || String(u.id),
          keterangan: `Akun login · ${u.email || ''}`, punyaAkun: true
        }))
      if (tambahan.length) state.value.kandidat = [...state.value.kandidat, ...tambahan]
    } catch { /* kandidat akun dilewati */ }
  }

  // Peran, izin, dan penugasan selalu dibaca dari database (satu-satunya sumber kebenaran);
  // data awal di kode hanya cadangan sebelum tabel ada. Dipanggil ulang berkala di muat().
  const muatMatriks = async (): Promise<boolean> => {
    state.value.dimuatPada = Date.now()
    const client = useSupabaseClient()
    try {
      const [{ data: peranRows, error }, { data: izinRows }, { data: tugasRows }] = await Promise.all([
        client.from('rbac_roles').select('id, kunci, nama, deskripsi, terkunci, urutan').order('urutan'),
        // '*': kolom cakupan (0063) mungkin belum ada; memilihnya secara eksplisit akan menggagalkan seluruh query.
        client.from('rbac_permissions').select('*'),
        client.from('rbac_assignments').select('subjek_id, nama, peran_id, jenjang')
      ])
      if (error || !peranRows) return false
      state.value.tabelSiap = true
      state.value.peran = peranRows.map((r: any) => ({
        id: r.id, kunci: r.kunci, nama: r.nama, deskripsi: r.deskripsi || '',
        terkunci: !!r.terkunci, urutan: r.urutan ?? 99
      }))
      const izin: Record<string, IzinPeran> = {}
      const cakupan: Record<string, CakupanPeran> = {}
      const adaBaris = new Set<string>()
      for (const peran of state.value.peran) { izin[peran.id] = izinKosong(); cakupan[peran.id] = {} }
      for (const row of izinRows || []) {
        if (!izin[row.peran_id]) { izin[row.peran_id] = izinKosong(); cakupan[row.peran_id] = {} }
        if (izin[row.peran_id][row.modul]) {
          izin[row.peran_id][row.modul] = { lihat: !!row.lihat, buat: !!row.buat, ubah: !!row.ubah, hapus: !!row.hapus }
          adaBaris.add(`${row.peran_id}|${row.modul}`)
          if (row.cakupan === 'sendiri') cakupan[row.peran_id]![row.modul] = 'sendiri'
        }
      }
      // Sub-modul tanpa baris tersimpan mewarisi modul utamanya, jadi data lama tetap berlaku apa adanya.
      for (const id of Object.keys(izin)) {
        const ada = (k: string) => adaBaris.has(`${id}|${k}`)
        lengkapiSub(izin[id]!, ada)
        if (state.value.peran.find(r => r.id === id)?.terkunci) continue
        // Baris yang belum pernah disimpan mengikuti perilaku sebelum update RBAC.
        for (const [k, aksi] of RBAC_BATAS_BAWAAN) if (!ada(k)) for (const x of aksi) izin[id]![k]![x] = false
        if (!ada('Tiketing')) izin[id]!['Tiketing'] = { lihat: true, buat: true, ubah: false, hapus: false }
      }
      state.value.izin = izin
      state.value.cakupan = cakupan
      state.value.cakupanSiap = !!izinRows?.length && 'cakupan' in izinRows[0]
      state.value.penugasan = (tugasRows || []).map((t: any) => ({
        subjekId: t.subjek_id, nama: t.nama, peranId: t.peran_id,
        jenjang: (t.jenjang || ['SMK', 'SMP']) as JenjangRbac[]
      }))
      return true
    } catch { return false /* tabel belum ada — tetap pada data awal lokal */ }
  }

  const muat = async () => {
    if (state.value.termuat) {
      void muatKandidatAkun()
      // Perubahan izin dari admin lain ikut terbaca tanpa muat ulang halaman (maks. 1 menit).
      // Dijalankan di latar belakang: pindah halaman tidak menunggu tiga query matriks.
      if (import.meta.client && Date.now() - state.value.dimuatPada > 60_000) void muatMatriks().then(selarasJenjang)
      return
    }
    state.value.termuat = true
    const client = useSupabaseClient()
    // Daftar guru dan identitas akun tidak bergantung pada matriks: jalan paralel.
    const guruPromise = (async () => {
      try {
        const { data } = await client.from('teachers').select('id, name, grade, user_id').eq('active', true).order('name')
        return data
      } catch { return null /* tabel guru tidak tersedia — penugasan manual tetap bisa */ }
    })()
    const sayaPromise = (async () => {
      try {
        const { data } = await client.auth.getUser()
        const uid = data?.user?.id
        if (!uid) return null
        const saya = { subjekId: uid, nama: data?.user?.email || 'Akun saya' }
        try {
          const { data: guru } = await client.from('teachers').select('id, name').eq('user_id', uid).maybeSingle()
          if (guru?.id) {
            saya.subjekId = String(guru.id)
            if (guru.name) saya.nama = guru.name
          }
        } catch { /* kolom user_id belum ada — pakai uid */ }
        return saya
      } catch { return null /* belum login */ }
    })()
    if (!(await muatMatriks())) return
    const guruRows = await guruPromise
    if (guruRows) {
      state.value.kandidat = guruRows.map((g: any) => ({
        subjekId: String(g.id), nama: g.name || String(g.id),
        keterangan: g.grade ? `Guru/Staff · ${g.grade}` : 'Guru/Staff',
        punyaAkun: !!g.user_id
      }))
    }
    await muatKandidatAkun()
    const saya = await sayaPromise
    if (saya) {
      state.value.subjekSaya = saya.subjekId
      state.value.namaSaya = saya.nama
    }
    await muatJenjangGuru()
    selarasJenjang()
  }

  // Jenjang dari jadwal pelajaran aktif + rombel yang diwalikan akun ini (hanya bila akun tertaut data guru).
  const muatJenjangGuru = async () => {
    const id = state.value.subjekSaya
    if (!id || !tertautGuru.value) { state.value.jadwalJenjang = []; state.value.jenjangGuru = null; return }
    try {
      const client = useSupabaseClient()
      const [jadwal, wali, guru] = await Promise.all([
        client.from('class_schedules').select('classes!inner(grade, active)').eq('teacher_id', id).eq('active', true).eq('classes.active', true),
        client.from('classes').select('grade').eq('homeroom_teacher_id', id).eq('active', true),
        client.from('teachers').select('grade').eq('id', id).maybeSingle()
      ])
      const grade = new Set<string>([
        ...((jadwal.data ?? []) as any[]).map(r => r.classes?.grade),
        ...((wali.data ?? []) as any[]).map(r => r.grade)
      ])
      state.value.jadwalJenjang = (['SMP', 'SMK'] as const).filter(g => grade.has(g))
      const gj = (guru.data as any)?.grade
      state.value.jenjangGuru = gj === 'SMP' || gj === 'SMK' ? gj : null
    } catch { state.value.jadwalJenjang = [] /* tabel belum ada: pakai jenjang penugasan */ }
  }

  // ===== Peran (CRUD) =====
  const tambahPeran = async (nama: string, deskripsi: string): Promise<string | null> => {
    const id = crypto.randomUUID()
    const kunci = 'khusus_' + id.slice(0, 8)
    const peran: PeranRbac = { id, kunci, nama, deskripsi, terkunci: false, urutan: state.value.peran.length }
    if (state.value.tabelSiap) {
      const { error } = await useSupabaseClient().from('rbac_roles').insert({ id, kunci, nama, deskripsi, terkunci: false, urutan: peran.urutan })
      if (error) return error.message
    }
    state.value.peran = [...state.value.peran, peran]
    state.value.izin = { ...state.value.izin, [id]: izinKosong() }
    state.value.cakupan = { ...state.value.cakupan, [id]: {} }
    useLogAktivitas().catat('Hak Akses (RBAC)', 'buat peran', `Peran baru: ${nama}`)
    return null
  }

  const ubahPeran = async (id: string, nama: string, deskripsi: string): Promise<string | null> => {
    const peran = state.value.peran.find(r => r.id === id)
    if (!peran || peran.terkunci) return 'Peran terkunci tidak bisa diubah.'
    if (state.value.tabelSiap) {
      const { error } = await useSupabaseClient().from('rbac_roles').update({ nama, deskripsi }).eq('id', id)
      if (error) return error.message
    }
    peran.nama = nama
    peran.deskripsi = deskripsi
    useLogAktivitas().catat('Hak Akses (RBAC)', 'ubah peran', `Peran diubah: ${nama}`)
    return null
  }

  const hapusPeran = async (id: string): Promise<string | null> => {
    const peran = state.value.peran.find(r => r.id === id)
    if (!peran || peran.terkunci) return 'Peran terkunci tidak bisa dihapus.'
    if (state.value.penugasan.some(p => p.peranId === id)) {
      return 'Peran masih berisi pengguna. Lepaskan dulu semua penggunanya.'
    }
    if (state.value.tabelSiap) {
      const client = useSupabaseClient()
      await client.from('rbac_permissions').delete().eq('peran_id', id)
      const { error } = await client.from('rbac_roles').delete().eq('id', id)
      if (error) return error.message
    }
    state.value.peran = state.value.peran.filter(r => r.id !== id)
    const izin = { ...state.value.izin }
    delete izin[id]
    state.value.izin = izin
    useLogAktivitas().catat('Hak Akses (RBAC)', 'hapus peran', `Peran dihapus: ${peran.nama}`)
    return null
  }

  // ===== Izin =====
  const simpanIzin = async (peranId: string, izinMasuk: IzinPeran, cakupanBaru: CakupanPeran = state.value.cakupan[peranId] || {}): Promise<string | null> => {
    const peran = state.value.peran.find(r => r.id === peranId)
    if (!peran || peran.terkunci) return 'Peran terkunci tidak bisa diubah.'
    const izinBaru = agregatModul(JSON.parse(JSON.stringify(izinMasuk)))
    if (state.value.tabelSiap) {
      const rows = RBAC_KUNCI.map(modul => ({
        peran_id: peranId, modul,
        lihat: !!izinBaru[modul]?.lihat, buat: !!izinBaru[modul]?.buat,
        ubah: !!izinBaru[modul]?.ubah, hapus: !!izinBaru[modul]?.hapus,
        ...(state.value.cakupanSiap ? { cakupan: cakupanBaru[modul] === 'sendiri' ? 'sendiri' : 'semua' } : {})
      }))
      const { data, error } = await useSupabaseClient().from('rbac_permissions').upsert(rows, { onConflict: 'peran_id,modul' }).select('modul')
      if (error) return error.message
      // Penolakan senyap oleh kebijakan database tidak melempar galat; pastikan semua baris benar-benar tersimpan.
      if ((data?.length ?? 0) !== rows.length) return 'Izin tidak tersimpan penuh (ditolak database). Muat ulang halaman, lalu coba lagi.'
    }
    state.value.izin = { ...state.value.izin, [peranId]: izinBaru }
    state.value.cakupan = { ...state.value.cakupan, [peranId]: { ...cakupanBaru } }
    useLogAktivitas().catat('Hak Akses (RBAC)', 'ubah izin', `Matriks izin diperbarui untuk peran ${peran.nama}`)
    return null
  }

  // ===== Penugasan (satu pengguna = satu peran; upsert memindahkan peran lama) =====
  const tugaskan = async (subjekId: string, nama: string, peranId: string, jenjang: JenjangRbac[]): Promise<string | null> => {
    if (!jenjang.length) return 'Pilih minimal satu jenjang (SMP/SMK).'
    if (state.value.tabelSiap) {
      const { error } = await useSupabaseClient().from('rbac_assignments')
        .upsert({ subjek_id: subjekId, nama, peran_id: peranId, jenjang }, { onConflict: 'subjek_id' })
      if (error) return error.message
    }
    state.value.penugasan = [
      ...state.value.penugasan.filter(p => p.subjekId !== subjekId),
      { subjekId, nama, peranId, jenjang }
    ]
    useLogAktivitas().catat('Hak Akses (RBAC)', 'tugaskan peran', `${nama} ditugaskan sebagai ${state.value.peran.find(r => r.id === peranId)?.nama || 'peran'} (${jenjang.join(' + ')})`)
    return null
  }

  const lepaskan = async (subjekId: string): Promise<string | null> => {
    const lama = state.value.penugasan.find(p => p.subjekId === subjekId)
    if (state.value.tabelSiap) {
      const { error } = await useSupabaseClient().from('rbac_assignments').delete().eq('subjek_id', subjekId)
      if (error) return error.message
    }
    state.value.penugasan = state.value.penugasan.filter(p => p.subjekId !== subjekId)
    useLogAktivitas().catat('Hak Akses (RBAC)', 'lepaskan peran', `${lama?.nama || subjekId} dilepaskan dari peran ${state.value.peran.find(r => r.id === lama?.peranId)?.nama || ''}`.trim())
    return null
  }

  // ===== Penegakan untuk pengguna yang sedang login =====
  const authUser = useSupabaseUser()
  const emailUtama = computed(() => String(authUser.value?.email || '').toLowerCase() === 'betadev94@gmail.com')
  const penugasanNyata = computed(() => state.value.subjekSaya ? penugasanDari(state.value.penugasan, state.value.subjekSaya) : null)
  const peranNyata = computed(() => penugasanNyata.value ? state.value.peran.find(r => r.id === penugasanNyata.value!.peranId) || null : null)
  // Superadmin = peran berkunci 'superadmin' atau akun Superadmin Utama (sama dengan gerbang server).
  const adalahSuperadmin = computed(() => peranNyata.value?.kunci === 'superadmin' || emailUtama.value)

  // Akun yang tertaut data guru (subjek = id guru, bukan id akun).
  const tertautGuru = computed(() => {
    const uid = (authUser.value as any)?.id ?? (authUser.value as any)?.sub
    return !!state.value.subjekSaya && !!uid && state.value.subjekSaya !== uid
  })
  // Akun guru yang belum diberi peran RBAC diperlakukan sebagai Guru Pengajar (keputusan owner, 13 Nov 2026).
  const peranGuruBawaan = computed(() => state.value.peran.find(r => r.kunci === 'guru_pengajar') || null)
  const guruTanpaPeran = computed(() => !penugasanNyata.value && !adalahSuperadmin.value && tertautGuru.value && !!peranGuruBawaan.value)
  const penugasanSaya = computed<PenugasanRbac | null>(() => penugasanNyata.value
    ?? (guruTanpaPeran.value
      ? { subjekId: state.value.subjekSaya!, nama: state.value.namaSaya || 'Guru', peranId: peranGuruBawaan.value!.id, jenjang: [state.value.jenjangGuru ?? 'SMK'] }
      : null))
  const peranSaya = computed(() => penugasanSaya.value ? state.value.peran.find(r => r.id === penugasanSaya.value!.peranId) || null : null)
  // Penegakan aktif hanya bila pengguna memang sudah ditugaskan sebuah peran (atau guru tanpa peran).
  const penegakanAktif = computed(() => !!penugasanSaya.value)

  // Akun guru yang melihat data pribadinya saja (dashboard guru, daftar rombel yang diajar): Guru Pengajar / Wali Kelas.
  // Superadmin tidak pernah dibatasi.
  const modeGuru = computed(() => !adalahSuperadmin.value && ['guru_pengajar', 'wali_kelas'].includes(peranSaya.value?.kunci ?? ''))

  // Nama akun untuk ditampilkan/dicatat: nama guru bila tertaut, selain itu nama di metadata akun; kosong bila hanya ada email.
  const namaAkun = computed(() => {
    const nama = state.value.namaSaya || ''
    if (nama && !nama.includes('@')) return nama
    const meta: any = authUser.value?.user_metadata
    return String(meta?.name || meta?.full_name || '').trim()
  })

  // Jenjang yang boleh dipakai akun ini: penugasan RBAC + jenjang jadwalnya (lihat jenjangAkun di rbacCore).
  const jenjangDiizinkan = computed<JenjangRbac[]>(() => {
    const dasar = penugasanSaya.value?.jenjang ?? ['SMK', 'SMP']
    if (!penegakanAktif.value) return dasar
    return jenjangAkun(dasar, adalahSuperadmin.value || lintasJenjang(peranSaya.value), state.value.jadwalJenjang ?? [])
  })

  const bisaSaya = (modul: string, aksi: AksiRbac): boolean => {
    if (!penegakanAktif.value) return true
    if (!jenjangDiizinkan.value.includes(grade.value as JenjangRbac)) return false
    return bisaAkses(peranSaya.value, peranSaya.value ? state.value.izin[peranSaya.value.id] : null, modul, aksi)
  }

  // Pengguna yang hanya ditugaskan ke satu jenjang tidak boleh berada di jenjang lain:
  // pengalih jenjang disembunyikan dan jenjang aktif dipaksa ke jenjang yang diizinkan.
  const bisaGantiJenjang = computed(() => jenjangDiizinkan.value.length > 1)
  const selarasJenjang = () => {
    const jenjang = jenjangDiizinkan.value
    if (jenjang.length && !jenjang.includes(grade.value as JenjangRbac)) grade.value = jenjang[0]!
  }

  // Izin satu sub-modul (tab/sub-menu). Lihat: sama dengan bisaSaya (belum ditugaskan = boleh, seperti sebelumnya).
  const bisaSub = (modul: string, sub: string, aksi: AksiRbac): boolean => bisaSaya(kunciSub(modul, sub), aksi)
  // Aksi Buat/Ubah/Hapus di modul yang sudah ditegakkan: pengguna yang belum ditugaskan peran tetap memakai
  // aturan lama modul itu (lama), supaya penegakan baru tidak membuka atau menutup akses tanpa penugasan.
  const bolehAksi = (modul: string, sub: string, aksi: AksiRbac, lama: boolean): boolean =>
    adalahSuperadmin.value || (penegakanAktif.value ? bisaSub(modul, sub, aksi) : lama)
  // Cakupan data peran saya pada modul: Superadmin dan pengguna belum ditugaskan = semua data.
  const cakupanSaya = (modul: string): CakupanRbac => {
    if (adalahSuperadmin.value || !peranSaya.value) return 'semua'
    return state.value.cakupan[peranSaya.value.id]?.[modul] === 'sendiri' ? 'sendiri' : 'semua'
  }

  // Tab/sub-menu yang boleh dilihat, sekaligus menjaga tab aktif selalu salah satu yang boleh
  // (mis. tab bawaan atau ?tab= di URL yang tidak diizinkan dipindah ke tab pertama yang boleh).
  const jagaSubmenu = <T extends { id: string }>(modul: string, daftar: T[] | Ref<T[]>, aktif: Ref<T['id']>) => {
    const terlihat = computed(() => (Array.isArray(daftar) ? daftar : daftar.value).filter(t => bisaSub(modul, t.id, 'lihat')))
    watchEffect(() => {
      const pertama = terlihat.value[0]
      if (pertama && !terlihat.value.some(t => t.id === aktif.value)) aktif.value = pertama.id
    })
    return terlihat
  }

  const bolehJudulMenu = (judul: string): boolean => {
    const modul = modulDariJudul(judul)
    if (modul === null) return true
    // Menu Pembayaran = halaman sub-modul Keuangan Sekolah.
    if (judul.toLowerCase().trim() === 'pembayaran') return bisaSub(modul, 'pembayaran', 'lihat')
    return bisaSaya(modul, 'lihat')
  }

  return {
    state, muat,
    tambahPeran, ubahPeran, hapusPeran, simpanIzin, tugaskan, lepaskan,
    penugasanSaya, peranSaya, penegakanAktif, bisaSaya, bisaSub, bolehAksi, cakupanSaya, jagaSubmenu, modeGuru, tertautGuru, bolehJudulMenu, bisaGantiJenjang, adalahSuperadmin, namaAkun
  }
}
