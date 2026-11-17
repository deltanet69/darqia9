<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="tutup" />
      <div role="dialog" aria-modal="true" aria-labelledby="judul-akses-ortu" class="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 id="judul-akses-ortu" class="text-base font-bold text-slate-900">Akses Portal Orang Tua</h3>
            <p class="mt-0.5 text-xs text-slate-500">Buat kata sandi acak untuk dibagikan wali kelas. Orang tua wajib menggantinya saat pertama masuk.</p>
          </div>
          <button type="button" class="rounded-lg p-1 text-slate-400 transition hover:text-slate-600" aria-label="Tutup" @click="tutup">
            <AdminV2Icon name="x" :size="18" />
          </button>
        </div>

        <div v-if="!hasil" class="space-y-4 overflow-y-auto px-5 py-4">
          <fieldset class="grid gap-2 sm:grid-cols-2">
            <legend class="mb-2 text-xs font-bold text-slate-700">Siswa yang dibuatkan akses</legend>
            <label class="flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm" :class="sumber === 'pilih' ? 'border-[#1B5FD9] bg-[#F5F8FF]' : 'border-slate-200'">
              <input v-model="sumber" type="radio" value="pilih" class="mt-0.5 accent-[#1B5FD9]" :disabled="!terpilih.length">
              <span><b class="block text-slate-900">Siswa terpilih</b><span class="text-xs text-slate-500">{{ terpilih.length ? `${terpilih.length} siswa dicentang di tabel` : 'Centang siswa di tabel terlebih dahulu' }}</span></span>
            </label>
            <label class="flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm" :class="sumber === 'kelas' ? 'border-[#1B5FD9] bg-[#F5F8FF]' : 'border-slate-200'">
              <input v-model="sumber" type="radio" value="kelas" class="mt-0.5 accent-[#1B5FD9]">
              <span class="min-w-0 flex-1"><b class="block text-slate-900">Satu kelas</b>
                <select v-model="classId" class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#1B5FD9] focus:outline-none" @focus="sumber = 'kelas'">
                  <option value="">Pilih kelas…</option>
                  <option v-for="k in kelas" :key="k.id" :value="k.id">{{ k.name }}</option>
                </select>
              </span>
            </label>
          </fieldset>
          <label class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
            <input v-model="reset" type="checkbox" class="mt-0.5 accent-amber-600">
            <span><b class="block text-amber-900">Reset juga yang sudah punya akses</b><span class="text-xs text-amber-800">Kata sandi lama tidak berlaku lagi, orang tua keluar dari semua perangkat dan wajib membuat kata sandi baru. Tanpa centang, siswa yang sudah punya akses dilewati.</span></span>
          </label>
          <p v-if="galat" role="alert" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{{ galat }}</p>
        </div>

        <div v-else class="overflow-y-auto px-5 py-4">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            {{ hasil.akun.length }} akses {{ reset ? 'direset' : 'dibuat' }}.<template v-if="hasil.dilewati.length"> {{ hasil.dilewati.length }} siswa dilewati karena sudah punya akses.</template>
            Kata sandi hanya tampil sekarang — unduh Excel sebelum menutup.
          </div>
          <div v-if="hasil.akun.length" class="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 font-bold uppercase tracking-wide text-slate-500">
                <tr><th class="px-3 py-2">Nama</th><th class="px-3 py-2">NIS</th><th class="px-3 py-2">NISN</th><th class="px-3 py-2">Kelas</th><th class="px-3 py-2">Kata sandi awal</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="a in hasil.akun" :key="a.id">
                  <td class="px-3 py-2 font-semibold text-slate-900">{{ a.nama }}</td>
                  <td class="px-3 py-2 font-mono">{{ a.nis || '—' }}</td>
                  <td class="px-3 py-2 font-mono">{{ a.nisn || '—' }}</td>
                  <td class="px-3 py-2">{{ a.kelas || '—' }}</td>
                  <td class="px-3 py-2 font-mono font-bold text-[#1B5FD9]">{{ a.sandi }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <details v-if="hasil.dilewati.length" class="mt-3 text-xs text-slate-600">
            <summary class="cursor-pointer font-semibold">Siswa yang dilewati ({{ hasil.dilewati.length }})</summary>
            <p class="mt-1.5 leading-5">{{ hasil.dilewati.map(d => d.nama).join(', ') }}. Gunakan "Reset juga yang sudah punya akses" bila kata sandinya perlu dibuat ulang.</p>
          </details>
        </div>

        <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" class="px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-800" @click="tutup">{{ hasil ? 'Selesai' : 'Batal' }}</button>
          <button v-if="!hasil" type="button" class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#154db0] disabled:opacity-50" :disabled="sibuk || !siap" @click="buat">{{ sibuk ? 'Membuat…' : reset ? 'Buat & reset akses' : 'Buat akses' }}</button>
          <button v-else-if="hasil.akun.length" type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-[#1B5FD9] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#154db0]" @click="unduh">
            <AdminV2Icon name="dl" :size="14" />Unduh Excel
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import { unduhAksesOrtu, type AksesOrtu } from '~/utils/ortuAkses'

const props = defineProps<{ open: boolean, terpilih: string[], kelas: Array<{ id: string, name: string }> }>()
const emit = defineEmits<{ close: [], selesai: [pesan: string] }>()

const sumber = ref<'pilih' | 'kelas'>('pilih')
const classId = ref('')
const reset = ref(false)
const sibuk = ref(false)
const galat = ref('')
const hasil = ref<{ akun: AksesOrtu[], dilewati: Array<{ nama: string, nis: string }> } | null>(null)

watch(() => props.open, (buka) => {
  if (!buka) return
  sumber.value = props.terpilih.length ? 'pilih' : 'kelas'
  classId.value = ''
  reset.value = false
  galat.value = ''
  hasil.value = null
  sudahUnduh.value = false
})
const siap = computed(() => sumber.value === 'pilih' ? props.terpilih.length > 0 : !!classId.value)
const judul = computed(() => sumber.value === 'kelas' ? props.kelas.find(k => k.id === classId.value)?.name || 'kelas' : 'siswa-terpilih')

const buat = async () => {
  galat.value = ''
  sibuk.value = true
  try {
    hasil.value = await $fetch('/api/admin/ortu-akses', {
      method: 'POST',
      body: { ...(sumber.value === 'pilih' ? { studentIds: props.terpilih } : { classId: classId.value }), reset: reset.value }
    })
    emit('selesai', `${hasil.value!.akun.length} akses portal orang tua ${reset.value ? 'direset' : 'dibuat'}`)
  } catch (e: any) {
    galat.value = e?.data?.statusMessage || 'Akses gagal dibuat. Coba lagi.'
  } finally {
    sibuk.value = false
  }
}
const sudahUnduh = ref(false)
const unduh = async () => { await unduhAksesOrtu(hasil.value!.akun, judul.value); sudahUnduh.value = true }
const tutup = () => {
  // Kata sandi tidak bisa ditampilkan ulang: ingatkan bila belum diunduh.
  if (hasil.value?.akun.length && !sudahUnduh.value && !confirm('Kata sandi belum diunduh dan tidak bisa ditampilkan lagi. Tutup?')) return
  emit('close')
}
</script>
