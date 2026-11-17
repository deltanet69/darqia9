// Data admin Perpustakaan Digital: katalog + statistik baca dari /api/admin/perpus (server, service role).
import type { BukuAdmin, FormBuku } from '~/composables/perpusAdminCore'

const pesan = (e: any, cadangan: string) => e?.data?.statusMessage || e?.statusMessage || cadangan

export function useAdminPerpus() {
  const buku = useState<BukuAdmin[]>('admin-perpus-buku', () => [])
  const pembacaUnik = useState('admin-perpus-unik', () => 0)
  const status = useState<'diam' | 'muat' | 'siap' | 'galat'>('admin-perpus-status', () => 'diam')
  const galat = useState('admin-perpus-galat', () => '')

  const load = async () => {
    status.value = 'muat'
    try {
      const r = await $fetch<{ buku: BukuAdmin[], pembacaUnik: number }>('/api/admin/perpus/buku')
      buku.value = r.buku
      pembacaUnik.value = r.pembacaUnik
      status.value = 'siap'
    } catch (e: any) {
      galat.value = pesan(e, 'Katalog perpustakaan gagal dimuat.')
      status.value = 'galat'
    }
  }

  const setAktif = async (b: BukuAdmin, aktif: boolean) => {
    try {
      await $fetch(`/api/admin/perpus/buku/${encodeURIComponent(b.id)}`, { method: 'PATCH', body: { aktif } })
    } catch (e: any) {
      throw new Error(pesan(e, 'Status buku gagal diubah.'))
    }
    b.aktif = aktif
  }

  const impor = async (isi: unknown) => {
    try {
      const r = await $fetch<{ ditulis: number, baru: number, diperbarui: number, disaring: number }>('/api/admin/perpus/impor', { method: 'POST', body: { isi } })
      await load()
      return r
    } catch (e: any) {
      throw new Error(pesan(e, 'Katalog gagal diimpor.'))
    }
  }

  // Tambah (id kosong) atau ubah metadata buku, lalu muat ulang. Mengembalikan id buku supaya unggahan bisa menyusul.
  const simpan = async (form: FormBuku, id: string | null): Promise<string> => {
    try {
      const r = id
        ? await $fetch(`/api/admin/perpus/buku/${encodeURIComponent(id)}`, { method: 'PATCH', body: form }).then(() => ({ id }))
        : await $fetch<{ id: string }>('/api/admin/perpus/buku', { method: 'POST', body: form })
      return r.id
    } catch (e: any) {
      throw new Error(pesan(e, 'Buku gagal disimpan.'))
    }
  }

  const unggah = async (id: string, jenis: 'sampul' | 'berkas', isi: Blob) => {
    try {
      await $fetch(`/api/admin/perpus/buku/${encodeURIComponent(id)}/${jenis}`, { method: 'PUT', body: isi })
    } catch (e: any) {
      throw new Error(pesan(e, jenis === 'sampul' ? 'Sampul gagal diunggah.' : 'PDF gagal diunggah.'))
    }
  }

  const hapus = async (b: BukuAdmin) => {
    try {
      await $fetch(`/api/admin/perpus/buku/${encodeURIComponent(b.id)}`, { method: 'DELETE' })
    } catch (e: any) {
      throw new Error(pesan(e, 'Buku gagal dihapus.'))
    }
    await load()
  }

  return { buku, pembacaUnik, status, galat, load, setAktif, impor, simpan, unggah, hapus }
}
