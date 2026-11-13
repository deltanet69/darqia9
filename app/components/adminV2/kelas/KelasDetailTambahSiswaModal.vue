<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

interface Kandidat { id: string, nis: string, name: string, kelas: string }

const props = withDefaults(defineProps<{
  open: boolean
  classId: string
  className: string
  grade: string
  jenjang?: 'smp' | 'smk'
}>(), { jenjang: 'smk' })

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', studentIds: string[]): void
}>()

const supabase = useSupabaseClient()
const daftar = ref<Kandidat[]>([])
const loading = ref(false)
const error = ref('')
const cari = ref('')
const dipilih = ref<string[]>([])

// Kandidat = siswa aktif sejenjang di luar rombel ini; yang belum punya rombel tampil paling atas.
// shortcut: maksimal 1000 siswa per jenjang, cukup untuk sekolah ini; paginasi bila melebihi.
const muat = async () => {
  loading.value = true
  error.value = ''
  const { data, error: e } = await supabase
    .from('students')
    .select('id, nis, name, class_id, classes(name)')
    .eq('grade', props.grade)
    .eq('active', true)
    .order('name')
    .range(0, 999)
  loading.value = false
  if (e) { error.value = 'Data siswa gagal dimuat: ' + e.message; return }
  daftar.value = (data ?? [])
    .filter((row: any) => row.class_id !== props.classId)
    .map((row: any) => ({ id: row.id, nis: row.nis ?? '', name: row.name, kelas: row.classes?.name ?? '' }))
    .sort((a, b) => Number(!!a.kelas) - Number(!!b.kelas))
}

watch(() => props.open, (val) => {
  if (!val) return
  cari.value = ''
  dipilih.value = []
  void muat()
})

const tampil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  return q ? daftar.value.filter(s => s.name.toLowerCase().includes(q) || s.nis.includes(q)) : daftar.value
})
const pindahan = computed(() => daftar.value.filter(s => s.kelas && dipilih.value.includes(s.id)).length)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7EBF2] flex flex-col max-h-[90vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-tambah-siswa"
      @click.stop
    >
      <div class="flex items-start justify-between pb-3.5 border-b border-[#F1F5F9] mb-4">
        <div>
          <h3 id="judul-tambah-siswa" class="text-lg font-extrabold text-[#101828]">Tambah Siswa ke Rombel {{ className }}</h3>
          <p class="mt-0.5 text-xs text-[#667085]">Pilih satu atau beberapa siswa. Siswa yang sudah punya rombel akan dipindahkan ke rombel ini.</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#EFF2F7] flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Tutup"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="16" />
        </button>
      </div>

      <label class="sr-only" for="tambah-siswa-cari">Cari siswa</label>
      <input
        id="tambah-siswa-cari"
        v-model="cari"
        type="search"
        placeholder="Cari nama atau NIS"
        class="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#101828] focus:bg-white focus:border-[#1B5FD9] focus:outline-none transition"
      >

      <div class="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl border border-[#E7EBF2]">
        <p v-if="loading" class="p-4 text-xs text-[#667085]" role="status">Memuat siswa…</p>
        <p v-else-if="error" class="m-3 rounded-lg bg-[#FDECEA] px-3 py-2 text-xs text-[#8C1D13]" role="alert">{{ error }}</p>
        <p v-else-if="!tampil.length" class="p-6 text-center text-xs text-[#667085]">Tidak ada siswa yang cocok.</p>
        <ul v-else class="divide-y divide-[#EFF2F7]">
          <li v-for="s in tampil" :key="s.id">
            <label class="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-xs hover:bg-[#F8FAFC]">
              <input v-model="dipilih" type="checkbox" :value="s.id" class="h-4 w-4 shrink-0">
              <span class="min-w-0 flex-1">
                <b class="block truncate text-[13px] text-[#101828]">{{ s.name }}</b>
                <span class="text-[#667085] tabular-nums">NIS {{ s.nis || '-' }}</span>
              </span>
              <span
                class="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold"
                :class="s.kelas ? 'bg-[#FEF0C7] text-[#93370D]' : 'bg-[#F2F4F7] text-[#475467]'"
              >{{ s.kelas ? `Saat ini ${s.kelas}` : 'Belum punya rombel' }}</span>
            </label>
          </li>
        </ul>
      </div>

      <p v-if="pindahan" class="mt-3 text-xs text-[#93370D]">{{ pindahan }} siswa terpilih akan dipindahkan dari rombel lamanya.</p>

      <div class="pt-4 border-t border-[#F1F5F9] mt-4 flex items-center justify-end gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EBC]'"
          :disabled="!dipilih.length"
          @click="emit('add', dipilih)"
        >
          Tambahkan {{ dipilih.length || '' }} Siswa
        </button>
      </div>
    </div>
  </div>
</template>
