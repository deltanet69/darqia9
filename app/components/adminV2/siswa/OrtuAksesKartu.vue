<template>
  <section class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-sm font-extrabold">Akses Portal Orang Tua</h2>
        <p class="mt-1 text-xs leading-5 text-[#667085]">Orang tua masuk dengan NIS/NISN anak dan kata sandi dari sekolah, lalu wajib membuat kata sandi pribadi.</p>
      </div>
      <span class="rounded-full px-3 py-1 text-[11px] font-bold" :class="lencana.kelas">{{ lencana.teks }}</span>
    </div>

    <dl v-if="status?.ada" class="mt-4 grid gap-4 sm:grid-cols-2">
      <div><dt class="text-[10px] font-bold uppercase text-[#98A2B3]">Terakhir masuk</dt><dd class="mt-1 text-sm font-semibold">{{ waktu(status.terakhirMasuk) || 'Belum pernah' }}</dd></div>
      <div><dt class="text-[10px] font-bold uppercase text-[#98A2B3]">Kata sandi dibuat / direset</dt><dd class="mt-1 text-sm font-semibold">{{ waktu(status.diperbarui) || '—' }}</dd></div>
    </dl>

    <div v-if="baru" class="mt-4 rounded-2xl border border-[#C9DCFB] bg-[#F5F8FF] p-4">
      <p class="text-xs font-semibold text-[#12459B]">Kata sandi awal — hanya tampil sekali, bagikan ke orang tua:</p>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <code class="rounded-lg bg-white px-3 py-1.5 font-mono text-base font-bold tracking-wider text-[#101828]">{{ baru.sandi }}</code>
        <button type="button" class="min-h-9 rounded-full bg-white px-3 text-xs font-bold text-[#1B5FD9] ring-1 ring-[#C9DCFB]" @click="salin">{{ tersalin ? 'Tersalin' : 'Salin' }}</button>
        <button type="button" class="min-h-9 rounded-full bg-white px-3 text-xs font-bold text-[#1B5FD9] ring-1 ring-[#C9DCFB]" @click="unduhAksesOrtu([baru], baru.nama)">Unduh Excel</button>
      </div>
      <p class="mt-2 text-xs text-[#475467]">Login di {{ alamatPortalOrtu(baru.jenjang) }} dengan NIS {{ baru.nis || '—' }} atau NISN {{ baru.nisn || '—' }}.</p>
    </div>

    <p v-if="galat" role="alert" class="mt-3 text-xs font-semibold text-[#B42318]">{{ galat }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <button v-if="status && !status.ada" type="button" class="min-h-10 rounded-full bg-[#1B5FD9] px-4 text-xs font-bold text-white disabled:opacity-50" :disabled="sibuk" @click="buat(false)">{{ sibuk ? 'Membuat…' : 'Buat akses' }}</button>
      <button v-if="status?.ada" type="button" class="min-h-10 rounded-full bg-[#FFF4E5] px-4 text-xs font-bold text-[#B54708] disabled:opacity-50" :disabled="sibuk" @click="buat(true)">{{ sibuk ? 'Mereset…' : 'Reset kata sandi' }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { alamatPortalOrtu, unduhAksesOrtu, type AksesOrtu } from '~/utils/ortuAkses'

const props = defineProps<{ studentId: string }>()
const status = ref<{ ada: boolean, wajibGanti: boolean, terakhirMasuk: string | null, terkunciSampai: string | null, diperbarui: string | null } | null>(null)
const baru = ref<AksesOrtu | null>(null)
const galat = ref('')
const sibuk = ref(false)
const tersalin = ref(false)

const pesan = (e: any) => e?.data?.statusMessage || 'Terjadi gangguan. Coba lagi.'
const muat = async () => {
  galat.value = ''
  try { status.value = await $fetch('/api/admin/ortu-akses', { query: { studentId: props.studentId } }) } catch (e) { galat.value = pesan(e) }
}
watch(() => props.studentId, () => { baru.value = null; void muat() }, { immediate: true })

const lencana = computed(() => {
  const s = status.value
  if (!s) return { teks: 'Memuat…', kelas: 'bg-[#F2F4F7] text-[#475467]' }
  if (!s.ada) return { teks: 'Belum dibuat', kelas: 'bg-[#F2F4F7] text-[#475467]' }
  if (s.terkunciSampai && new Date(s.terkunciSampai) > new Date()) return { teks: 'Terkunci sementara', kelas: 'bg-[#FEF3F2] text-[#B42318]' }
  if (s.wajibGanti) return { teks: 'Menunggu ganti kata sandi', kelas: 'bg-[#FFF4E5] text-[#B54708]' }
  return { teks: 'Aktif', kelas: 'bg-[#E7F8F0] text-[#067647]' }
})
const waktu = (iso: string | null) => iso ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(iso)) : ''

const buat = async (reset: boolean) => {
  if (reset && !confirm('Reset kata sandi portal orang tua? Kata sandi lama tidak berlaku, orang tua keluar dari semua perangkat dan wajib membuat kata sandi baru.')) return
  sibuk.value = true
  galat.value = ''
  try {
    const r = await $fetch<{ akun: AksesOrtu[] }>('/api/admin/ortu-akses', { method: 'POST', body: { studentIds: [props.studentId], reset } })
    baru.value = r.akun[0] ?? null
    tersalin.value = false
    await muat()
  } catch (e) {
    galat.value = pesan(e)
  } finally {
    sibuk.value = false
  }
}
const salin = async () => {
  try { await navigator.clipboard.writeText(baru.value!.sandi); tersalin.value = true } catch { galat.value = 'Salin gagal. Catat kata sandinya secara manual.' }
}
</script>
