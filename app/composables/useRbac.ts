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
import { computed } from 'vue'
import { useAdminGrade } from './useAdminGrade'
import {
  RBAC_MODUL, RBAC_SEED_IZIN, RBAC_SEED_PERAN, bisaAkses, dalamCakupan, izinKosong,
  modulDariJudul, penugasanDari,
  type AksiRbac, type IzinPeran, type JenjangRbac, type PenugasanRbac, type PeranRbac
} from './rbacCore'

export * from './rbacCore'

export interface KandidatRbac { subjekId: string; nama: string; keterangan: string; punyaAkun: boolean }

interface RbacState {
  peran: PeranRbac[]
  izin: Record<string, IzinPeran>
  penugasan: PenugasanRbac[]
  kandidat: KandidatRbac[]
  tabelSiap: boolean
  termuat: boolean
  subjekSaya: string | null
  namaSaya: string | null
}

const seedState = (): RbacState => {
  const izin: Record<string, IzinPeran> = {}
  for (const peran of RBAC_SEED_PERAN) izin[peran.id] = JSON.parse(JSON.stringify(RBAC_SEED_IZIN[peran.kunci] || izinKosong()))
  return {
    peran: JSON.parse(JSON.stringify(RBAC_SEED_PERAN)),
    izin,
    penugasan: [],
    kandidat: [],
    tabelSiap: false,
    termuat: false,
    subjekSaya: null,
    namaSaya: null
  }
}

export const useRbac = () => {
  const state = useState<RbacState>('rbac-state', seedState)
  const grade = useAdminGrade()

  const muat = async () => {
    if (state.value.termuat) return
    state.value.termuat = true
    const client = useSupabaseClient()
    try {
      const { data: peranRows, error } = await client.from('rbac_roles').select('*').order('urutan')
      if (error || !peranRows) return
      const { data: izinRows } = await client.from('rbac_permissions').select('*')
      const { data: tugasRows } = await client.from('rbac_assignments').select('*')
      state.value.tabelSiap = true
      state.value.peran = peranRows.map((r: any) => ({
        id: r.id, kunci: r.kunci, nama: r.nama, deskripsi: r.deskripsi || '',
        terkunci: !!r.terkunci, urutan: r.urutan ?? 99
      }))
      const izin: Record<string, IzinPeran> = {}
      for (const peran of state.value.peran) izin[peran.id] = izinKosong()
      for (const row of izinRows || []) {
        if (!izin[row.peran_id]) izin[row.peran_id] = izinKosong()
        if (izin[row.peran_id][row.modul]) {
          izin[row.peran_id][row.modul] = { lihat: !!row.lihat, buat: !!row.buat, ubah: !!row.ubah, hapus: !!row.hapus }
        }
      }
      state.value.izin = izin
      state.value.penugasan = (tugasRows || []).map((t: any) => ({
        subjekId: t.subjek_id, nama: t.nama, peranId: t.peran_id,
        jenjang: (t.jenjang || ['SMK', 'SMP']) as JenjangRbac[]
      }))
    } catch { /* tabel belum ada — tetap pada data awal lokal */ }
    try {
      const { data: guruRows } = await client.from('teachers').select('id, name, grade, user_id').eq('active', true).order('name')
      if (guruRows) {
        state.value.kandidat = guruRows.map((g: any) => ({
          subjekId: String(g.id), nama: g.name || String(g.id),
          keterangan: g.grade ? `Guru/Staff · ${g.grade}` : 'Guru/Staff',
          punyaAkun: !!g.user_id
        }))
      }
    } catch { /* tabel guru tidak tersedia — penugasan manual tetap bisa */ }
    try {
      const { data } = await client.auth.getUser()
      const uid = data?.user?.id
      if (uid) {
        state.value.subjekSaya = uid
        state.value.namaSaya = data?.user?.email || 'Akun saya'
        try {
          const { data: guru } = await client.from('teachers').select('id, name').eq('user_id', uid).maybeSingle()
          if (guru?.id) {
            state.value.subjekSaya = String(guru.id)
            if (guru.name) state.value.namaSaya = guru.name
          }
        } catch { /* kolom user_id belum ada — pakai uid */ }
      }
    } catch { /* belum login */ }
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
    return null
  }

  // ===== Izin =====
  const simpanIzin = async (peranId: string, izinBaru: IzinPeran): Promise<string | null> => {
    const peran = state.value.peran.find(r => r.id === peranId)
    if (!peran || peran.terkunci) return 'Peran terkunci tidak bisa diubah.'
    if (state.value.tabelSiap) {
      const rows = RBAC_MODUL.map(modul => ({
        peran_id: peranId, modul,
        lihat: !!izinBaru[modul]?.lihat, buat: !!izinBaru[modul]?.buat,
        ubah: !!izinBaru[modul]?.ubah, hapus: !!izinBaru[modul]?.hapus
      }))
      const { error } = await useSupabaseClient().from('rbac_permissions').upsert(rows, { onConflict: 'peran_id,modul' })
      if (error) return error.message
    }
    state.value.izin = { ...state.value.izin, [peranId]: JSON.parse(JSON.stringify(izinBaru)) }
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
    return null
  }

  const lepaskan = async (subjekId: string): Promise<string | null> => {
    if (state.value.tabelSiap) {
      const { error } = await useSupabaseClient().from('rbac_assignments').delete().eq('subjek_id', subjekId)
      if (error) return error.message
    }
    state.value.penugasan = state.value.penugasan.filter(p => p.subjekId !== subjekId)
    return null
  }

  // ===== Penegakan untuk pengguna yang sedang login =====
  const penugasanSaya = computed(() => state.value.subjekSaya ? penugasanDari(state.value.penugasan, state.value.subjekSaya) : null)
  const peranSaya = computed(() => penugasanSaya.value ? state.value.peran.find(r => r.id === penugasanSaya.value!.peranId) || null : null)
  // Penegakan aktif hanya bila pengguna memang sudah ditugaskan sebuah peran.
  const penegakanAktif = computed(() => !!penugasanSaya.value)

  const bisaSaya = (modul: string, aksi: AksiRbac): boolean => {
    if (!penegakanAktif.value) return true
    if (!dalamCakupan(penugasanSaya.value, grade.value as JenjangRbac)) return false
    return bisaAkses(peranSaya.value, peranSaya.value ? state.value.izin[peranSaya.value.id] : null, modul, aksi)
  }

  const bolehJudulMenu = (judul: string): boolean => {
    const modul = modulDariJudul(judul)
    if (modul === null) return true
    return bisaSaya(modul, 'lihat')
  }

  return {
    state, muat,
    tambahPeran, ubahPeran, hapusPeran, simpanIzin, tugaskan, lepaskan,
    penugasanSaya, peranSaya, penegakanAktif, bisaSaya, bolehJudulMenu
  }
}
