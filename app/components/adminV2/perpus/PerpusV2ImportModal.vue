<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { bacaKatalog, jumlahMentah } from '~/composables/perpusCore'
import { useAdminPerpus } from '~/composables/useAdminPerpus'

// Impor pembaruan katalog: .xlsx hasil Ekspor Excel (atau diedit) atau katalog-perpus-darqia.json.
// Pratinjau memakai aturan penyaringan yang sama dengan server; penulisan sungguhan terjadi di server.
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void, (e: 'imported', pesan: string): void }>()

const store = useAdminPerpus()
const fileInput = ref<HTMLInputElement | null>(null)
const namaFile = ref('')
const isi = ref<unknown>(null)
const fase = ref<'pilih' | 'siap' | 'proses'>('pilih')
const galat = ref('')

const baris = computed(() => (isi.value ? bacaKatalog(isi.value) : []))
const mentah = computed(() => (isi.value ? jumlahMentah(isi.value) : 0))
const ids = computed(() => new Set(store.buku.value.map(b => b.id)))
const diperbarui = computed(() => baris.value.filter(r => ids.value.has(r.id)).length)

const reset = () => { namaFile.value = ''; isi.value = null; fase.value = 'pilih'; galat.value = '' }
watch(() => props.open, (o) => { if (o) reset() })

const bacaFile = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  galat.value = ''
  try {
    if (/\.json$/i.test(file.name)) {
      isi.value = JSON.parse(await file.text())
    } else {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const perSheet: Record<string, unknown[]> = {}
      for (const nama of wb.SheetNames) perSheet[nama] = XLSX.utils.sheet_to_json(wb.Sheets[nama]!, { defval: '', raw: false })
      isi.value = perSheet
    }
  } catch {
    galat.value = 'File tidak bisa dibaca. Pakai file .xlsx hasil Ekspor Excel atau katalog .json.'
    return
  }
  namaFile.value = file.name
  if (!baris.value.length) { galat.value = 'Tidak ada baris buku yang dikenali. Pastikan kolom Judul, Jenjang, dan Kelas ada (gunakan file hasil Ekspor Excel).'; return }
  fase.value = 'siap'
}

const proses = async () => {
  fase.value = 'proses'
  try {
    const r = await store.impor(isi.value)
    emit('imported', `Katalog diperbarui: ${r.baru} buku baru, ${r.diperbarui} diperbarui${r.disaring ? `, ${r.disaring} baris disaring` : ''}.`)
    emit('close')
  } catch (e: any) {
    galat.value = e.message
    fase.value = 'siap'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" @click.self="emit('close')">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E7EBF2] space-y-4 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Impor Katalog Buku</h3>
          <p class="text-xs text-[#667085] mt-0.5">Perbarui koleksi dari Excel atau katalog JSON.</p>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition" aria-label="Tutup" @click="emit('close')">&times;</button>
      </div>

      <input ref="fileInput" type="file" accept=".xlsx,.xls,.json" class="hidden" @change="bacaFile">

      <template v-if="fase === 'pilih'">
        <div class="rounded-2xl border-[1.5px] border-dashed border-[#B2CCFF] bg-[#F5F9FF] px-5 py-6 text-center">
          <p class="text-xs font-bold text-[#344054]">Pilih file katalog (.xlsx atau .json)</p>
          <button type="button" class="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer" @click="fileInput?.click()">Pilih File</button>
        </div>
        <div class="rounded-xl bg-[#E8F0FE] text-[#0A2A5C] px-3.5 py-3 text-xs font-semibold leading-relaxed">
          Cara paling aman: klik <b>Ekspor Excel</b>, ubah atau tambah baris di file itu, lalu impor kembali. Buku dikenali dari Slug File (atau Judul): yang sudah ada diperbarui, yang baru ditambahkan. Buku yang tidak ada di file tidak dihapus dan status tampilnya tidak berubah.
        </div>
        <p v-if="galat" class="text-xs font-bold text-[#B42318]">{{ galat }}</p>
      </template>

      <template v-else>
        <div class="rounded-xl bg-[#F5F9FF] border border-[#B2CCFF] text-[#0A2A5C] px-3.5 py-3 text-xs font-semibold">File: {{ namaFile }}</div>
        <div class="grid grid-cols-3 gap-2.5 text-center">
          <div class="rounded-2xl bg-[#E7F8F0] py-3"><b class="block text-xl font-mono font-extrabold text-[#067647]">{{ baris.length - diperbarui }}</b><span class="text-[11px] font-bold text-[#067647]">Buku baru</span></div>
          <div class="rounded-2xl bg-[#EFF4FF] py-3"><b class="block text-xl font-mono font-extrabold text-[#1B5FD9]">{{ diperbarui }}</b><span class="text-[11px] font-bold text-[#1B5FD9]">Diperbarui</span></div>
          <div class="rounded-2xl bg-[#FFF6E5] py-3"><b class="block text-xl font-mono font-extrabold text-[#B54708]">{{ mentah - baris.length }}</b><span class="text-[11px] font-bold text-[#B54708]">Disaring</span></div>
        </div>
        <p class="text-[11.5px] text-[#667085] leading-relaxed">Baris disaring bila status legalnya "Tidak boleh di-host" atau UNVERIFIED, jenjangnya bukan SMP/SMK, atau judulnya kosong.</p>
        <p v-if="galat" class="text-xs font-bold text-[#B42318]">{{ galat }}</p>
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
          <button type="button" class="px-4 py-2 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#F8FAFC] transition cursor-pointer" :disabled="fase === 'proses'" @click="reset">Ganti File</button>
          <button type="button" class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer disabled:opacity-50" :disabled="fase === 'proses'" @click="proses">{{ fase === 'proses' ? 'Memproses…' : `Impor ${baris.length} Buku` }}</button>
        </div>
      </template>
    </div>
  </div>
</template>
