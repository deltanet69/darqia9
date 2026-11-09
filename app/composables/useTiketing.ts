// Lapisan data Tiketing (migrasi 0025). Visibilitas ditegakkan RLS:
// pelapor hanya menerima baris tiketnya sendiri; Superadmin menerima
// semua. Komponen tidak perlu menyaring kepemilikan secara manual.
import {
  teksLogPerubahan,
  type GradeTiket, type StatusTiket, type TiketLog, type TiketPesan, type TiketRow
} from './tiketingCore'

interface KeadaanTiketing {
  daftar: TiketRow[]
  memuat: boolean
  keadaan: 'siap' | 'belum-migrasi' | 'galat'
  pesanGalat: string
}

interface DetailTiket {
  tiket: TiketRow
  pesan: TiketPesan[]
  log: TiketLog[]
}

const BUCKET = 'tiket-lampiran'
const KOL_TIKET = 'id, nomor, grade, judul, deskripsi, kategori, status, progress, pelapor_id, pelapor_nama, pelapor_peran, lampiran_path, lampiran_nama, created_at, updated_at'
const KOL_PESAN = 'id, tiket_id, penulis_id, penulis_nama, dari_superadmin, teks, bukti_path, bukti_nama, created_at'
const KOL_LOG = 'id, tiket_id, pelaku_id, pelaku_nama, teks, catatan, created_at'

export const useTiketing = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const rbac = useRbac()
  const gradeAktif = useAdminGrade()
  const { catat } = useLogAktivitas()

  const state = useState<KeadaanTiketing>('tiketing-state', () => ({
    daftar: [], memuat: false, keadaan: 'siap', pesanGalat: ''
  }))

  // Gerbang Superadmin sama seperti Log Aktivitas: pemegang peran
  // terkunci (RBAC) atau email utama.
  const superadmin = computed(() => !!rbac.peranSaya.value?.terkunci
    || (((user.value as any)?.email || '').toLowerCase() === 'betadev94@gmail.com'))

  const uidSaya = computed(() => ((user.value as any)?.id || '') as string)
  const namaSaya = computed(() => {
    const u = user.value as any
    return u?.user_metadata?.name || u?.user_metadata?.full_name || u?.email || 'Pengguna'
  })
  const peranLabel = computed(() => rbac.peranSaya.value?.nama || 'Pengguna')

  const namaAman = (nama: string) => nama.replace(/[^\w.\-]+/g, '_').slice(0, 80) || 'berkas'

  const tanganiGalat = (error: any) => {
    const pesan = String(error?.message || error || '')
    if (error?.code === '42P01' || /does not exist|schema cache|Could not find the table/i.test(pesan)) {
      state.value.keadaan = 'belum-migrasi'
    } else {
      state.value.keadaan = 'galat'
      state.value.pesanGalat = pesan
    }
  }

  const catatLog = async (tiketId: string, teks: string, catatan = '') => {
    try {
      await client.from('tiket_log').insert({
        tiket_id: tiketId, pelaku_id: uidSaya.value || null,
        pelaku_nama: namaSaya.value, teks, catatan
      })
    } catch { /* log tidak boleh menggagalkan aksi utama */ }
  }

  const muatDaftar = async () => {
    state.value.memuat = true
    const { data, error } = await client.from('tiket').select(KOL_TIKET).order('updated_at', { ascending: false })
    state.value.memuat = false
    if (error) { tanganiGalat(error); return }
    state.value.keadaan = 'siap'
    state.value.daftar = (data || []) as TiketRow[]
  }

  const muatDetail = async (id: string): Promise<DetailTiket | null> => {
    const { data: tiket, error } = await client.from('tiket').select(KOL_TIKET).eq('id', id).single()
    if (error || !tiket) { tanganiGalat(error); return null }
    const [pesan, log] = await Promise.all([
      client.from('tiket_pesan').select(KOL_PESAN).eq('tiket_id', id).order('created_at', { ascending: true }),
      client.from('tiket_log').select(KOL_LOG).eq('tiket_id', id).order('created_at', { ascending: false })
    ])
    return {
      tiket: tiket as TiketRow,
      pesan: (pesan.data || []) as TiketPesan[],
      log: (log.data || []) as TiketLog[]
    }
  }

  const unggah = async (tiketId: string, berkas: File): Promise<{ path: string, nama: string }> => {
    const nama = namaAman(berkas.name)
    const path = `${tiketId}/${nama}`
    const { error } = await client.storage.from(BUCKET).upload(path, berkas)
    if (error) throw error
    return { path, nama: berkas.name }
  }

  const buatTiket = async (input: { judul: string, kategori: string, deskripsi: string, grade: GradeTiket, berkas?: File | null }): Promise<TiketRow> => {
    const { data, error } = await client.from('tiket').insert({
      grade: input.grade, judul: input.judul.trim(), deskripsi: input.deskripsi.trim(),
      kategori: input.kategori, pelapor_nama: namaSaya.value, pelapor_peran: peranLabel.value
    }).select(KOL_TIKET).single()
    if (error || !data) { tanganiGalat(error); throw error || new Error('Tiket gagal dibuat') }
    const tiket = data as TiketRow
    if (input.berkas) {
      const lamp = await unggah(tiket.id, input.berkas)
      await client.from('tiket').update({ lampiran_path: lamp.path, lampiran_nama: lamp.nama }).eq('id', tiket.id)
      tiket.lampiran_path = lamp.path
      tiket.lampiran_nama = lamp.nama
    }
    await catatLog(tiket.id, `Tiket dibuat oleh ${namaSaya.value} · Grade ${input.grade}`)
    catat('Tiketing', 'Buat tiket', `${tiket.nomor} — ${tiket.judul}`)
    return tiket
  }

  const ubahTiket = async (tiket: TiketRow, input: { judul: string, kategori: string, deskripsi: string, berkas?: File | null }): Promise<void> => {
    const ubahan: Record<string, any> = {
      judul: input.judul.trim(), kategori: input.kategori, deskripsi: input.deskripsi.trim()
    }
    if (input.berkas) {
      const lamp = await unggah(tiket.id, input.berkas)
      ubahan.lampiran_path = lamp.path
      ubahan.lampiran_nama = lamp.nama
    }
    const { error } = await client.from('tiket').update(ubahan).eq('id', tiket.id)
    if (error) { tanganiGalat(error); throw error }
    await catatLog(tiket.id, `Tiket diubah oleh pelapor (${namaSaya.value})`)
  }

  const hapusTiket = async (tiket: TiketRow): Promise<void> => {
    if (tiket.lampiran_path) {
      try { await client.storage.from(BUCKET).remove([tiket.lampiran_path]) } catch { /* berkas yatim tidak fatal */ }
    }
    const { error } = await client.from('tiket').delete().eq('id', tiket.id)
    if (error) { tanganiGalat(error); throw error }
    catat('Tiketing', 'Hapus tiket', `${tiket.nomor} — ${tiket.judul}`)
  }

  const kirimKomentar = async (tiket: TiketRow, teks: string, berkas?: File | null): Promise<void> => {
    let bukti: { path: string, nama: string } | null = null
    if (berkas) bukti = await unggah(tiket.id, berkas)
    const { error } = await client.from('tiket_pesan').insert({
      tiket_id: tiket.id, penulis_nama: namaSaya.value,
      dari_superadmin: superadmin.value, teks: teks.trim(),
      bukti_path: bukti?.path || null, bukti_nama: bukti?.nama || null
    })
    if (error) { tanganiGalat(error); throw error }
    await catatLog(tiket.id, `Komentar ditambahkan oleh ${superadmin.value ? 'Superadmin' : `${namaSaya.value} (pelapor)`}`)
    // Komentar pelapor membuka kembali tiket yang sudah selesai/ditutup.
    if (!superadmin.value && (tiket.status === 'Selesai' || tiket.status === 'Ditutup')) {
      const { error: galatBuka } = await client.from('tiket')
        .update({ status: 'Diproses' as StatusTiket, progress: tiket.progress >= 100 ? 75 : tiket.progress })
        .eq('id', tiket.id)
      if (!galatBuka) {
        await catatLog(tiket.id, `Status: ${tiket.status} → Diproses — tiket dibuka kembali oleh komentar pelapor`)
      }
    }
  }

  const simpanPenanganan = async (tiket: TiketRow, input: { status: StatusTiket, progress: number, catatan: string }): Promise<void> => {
    const progress = input.status === 'Selesai' ? 100 : input.progress
    const teks = teksLogPerubahan(tiket.status, input.status, tiket.progress, progress)
    const { error } = await client.from('tiket')
      .update({ status: input.status, progress }).eq('id', tiket.id)
    if (error) { tanganiGalat(error); throw error }
    await catatLog(tiket.id, teks ? `${teks} oleh Superadmin` : 'Penanganan diperbarui oleh Superadmin', input.catatan.trim())
    catat('Tiketing', 'Tangani tiket', `${tiket.nomor} — ${teks || 'diperbarui'}`)
  }

  const urlBerkas = async (path: string | null): Promise<string> => {
    if (!path) return ''
    const { data } = await client.storage.from(BUCKET).createSignedUrl(path, 3600)
    return data?.signedUrl || ''
  }

  return {
    state, superadmin, namaSaya, peranLabel, gradeAktif,
    muatDaftar, muatDetail, buatTiket, ubahTiket, hapusTiket,
    kirimKomentar, simpanPenanganan, urlBerkas
  }
}
