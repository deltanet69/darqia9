<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface GuruBaris {
  id: string
  nip: string | null
  name: string
  grade: string
  email: string
  terhubung: boolean
}

const props = defineProps<{
  open: boolean
  peranList: { id: string, nama: string }[]
  akunEmails: string[]
}>()

const emit = defineEmits<{ tutup: [], selesai: [] }>()

const client = useSupabaseClient()
const memuat = ref(false)
const guru = ref<GuruBaris[]>([])
const terpilih = ref<Set<string>>(new Set())
const password = ref('')
const peranId = ref('')
const berjalan = ref(false)
const hasil = ref<{ nama: string, ok: boolean, pesan: string }[]>([])
const pesan = ref('')

const baris = computed(() => guru.value.map(g => ({
  ...g,
  sudahAda: g.terhubung || (!!g.email && props.akunEmails.includes(g.email.toLowerCase())),
  bisaImpor: !!g.email && !(g.terhubung || props.akunEmails.includes(g.email.toLowerCase()))
})))
const jumlahDipilih = computed(() => baris.value.filter(g => g.bisaImpor && terpilih.value.has(g.id)).length)

const muatGuru = async () => {
  memuat.value = true
  hasil.value = []
  pesan.value = ''
  try {
    const { data, error } = await client
      .from('teachers')
      .select('id, nip, name, grade, active, email, user_id')
      .eq('active', true)
      .order('name')
    if (error) throw error
    guru.value = (data || []).map((r: any) => ({
      id: String(r.id), nip: r.nip || null, name: r.name || '', grade: r.grade || '',
      email: r.email || '', terhubung: !!r.user_id
    }))
    terpilih.value = new Set(guru.value.filter(g => g.email).map(g => g.id))
    const guruPengajar = props.peranList.find(p => p.nama.toLowerCase().includes('guru'))
    if (guruPengajar) peranId.value = guruPengajar.id
  } catch {
    pesan.value = 'Daftar guru gagal dimuat. Coba lagi.'
  } finally {
    memuat.value = false
  }
}

watch(() => props.open, (terbuka) => { if (terbuka) muatGuru() })

const alihPilih = (id: string) => {
  const baru = new Set(terpilih.value)
  if (baru.has(id)) baru.delete(id)
  else baru.add(id)
  terpilih.value = baru
}

const jenjangGuru = (grade: string) => grade === 'SMK' ? ['SMK'] : grade === 'SMP' ? ['SMP'] : ['SMK', 'SMP']

const jalankanImpor = async () => {
  if (password.value.length < 8) { pesan.value = 'Kata sandi awal minimal 8 karakter.'; return }
  const target = baris.value.filter(g => g.bisaImpor && terpilih.value.has(g.id))
  if (!target.length) { pesan.value = 'Belum ada guru yang dipilih.'; return }
  berjalan.value = true
  hasil.value = []
  let sukses = 0
  for (const g of target) {
    try {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: {
          nama: g.name,
          email: g.email,
          password: password.value,
          peranId: peranId.value || null,
          guruId: g.id,
          jenjang: jenjangGuru(g.grade)
        }
      })
      hasil.value = [...hasil.value, { nama: g.name, ok: true, pesan: 'akun dibuat' }]
      sukses++
    } catch (e: any) {
      hasil.value = [...hasil.value, { nama: g.name, ok: false, pesan: e?.data?.statusMessage || 'gagal' }]
    }
  }
  berjalan.value = false
  pesan.value = `Selesai: ${sukses} dari ${target.length} akun berhasil dibuat.`
  if (sukses) emit('selesai')
}

const kelasInput = 'w-full min-h-11 px-3.5 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#101828] outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#1B5FD9]/15 placeholder:text-[#98A2B3]'
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-[#0A2A5C]/50 backdrop-blur-[2px]" @click="emit('tutup')" />
    <div class="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
      <div class="p-5 sm:p-6 border-b border-[#E7EBF2] flex items-start justify-between gap-3 shrink-0">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Impor Pengguna dari Data Guru</h2>
          <p class="text-xs text-[#667085] mt-0.5">Akun dibuat untuk guru aktif yang belum punya akun dan emailnya terisi. Jenjang peran mengikuti jenjang guru.</p>
        </div>
        <button type="button" class="w-9 h-9 rounded-lg hover:bg-[#F2F4F7] text-[#667085] text-lg leading-none" aria-label="Tutup" @click="emit('tutup')">✕</button>
      </div>

      <div class="p-5 sm:p-6 space-y-4 overflow-y-auto">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1.5" for="ui-pass">Kata sandi awal (semua akun)</label>
            <input id="ui-pass" v-model="password" type="text" :class="kelasInput" placeholder="Minimal 8 karakter">
          </div>
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1.5" for="ui-peran">Peran RBAC</label>
            <select id="ui-peran" v-model="peranId" :class="kelasInput">
              <option value="">Tanpa peran</option>
              <option v-for="p in peranList" :key="p.id" :value="p.id">{{ p.nama }}</option>
            </select>
          </div>
        </div>

        <div v-if="memuat" class="space-y-2" aria-live="polite">
          <div v-for="i in 4" :key="i" class="h-12 rounded-xl bg-[#F2F4F7] animate-pulse" />
        </div>
        <ul v-else class="divide-y divide-[#EFF2F7] border border-[#E7EBF2] rounded-xl overflow-hidden">
          <li v-for="g in baris" :key="g.id" class="flex items-center gap-3 px-4 py-3" :class="g.bisaImpor ? 'hover:bg-[#F8FAFC]' : 'opacity-60'">
            <input
              type="checkbox"
              class="w-4 h-4 accent-[#1B5FD9] shrink-0"
              :checked="g.bisaImpor && terpilih.has(g.id)"
              :disabled="!g.bisaImpor || berjalan"
              @change="alihPilih(g.id)"
            >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-[#101828] truncate">{{ g.name }}</p>
              <p class="text-xs text-[#667085] truncate">{{ g.email || 'Email belum terisi di Data Guru' }}<span v-if="g.nip"> · NIP {{ g.nip }}</span></p>
            </div>
            <span class="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054]">{{ g.grade || '—' }}</span>
            <span v-if="g.sudahAda" class="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48]">Sudah punya akun</span>
            <span v-else-if="!g.email" class="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708]">Email kosong</span>
          </li>
          <li v-if="!baris.length" class="px-4 py-8 text-center text-sm text-[#667085]">Tidak ada data guru aktif.</li>
        </ul>

        <div v-if="hasil.length" class="border border-[#E7EBF2] rounded-xl p-4 space-y-1.5 max-h-44 overflow-y-auto">
          <p v-for="(h, i) in hasil" :key="i" class="text-xs" :class="h.ok ? 'text-[#027A48]' : 'text-[#B42318]'">
            {{ h.ok ? '✓' : '✗' }} {{ h.nama }} — {{ h.pesan }}
          </p>
        </div>
        <p v-if="pesan" class="text-sm text-[#344054] bg-[#F8FAFC] border border-[#E7EBF2] rounded-xl px-3.5 py-2.5">{{ pesan }}</p>
      </div>

      <div class="p-5 sm:p-6 border-t border-[#E7EBF2] flex gap-2.5 shrink-0">
        <button type="button" class="flex-1 min-h-11 px-4 rounded-xl border border-[#D0D5DD] bg-white text-sm font-bold text-[#344054] hover:bg-[#F8FAFC]" @click="emit('tutup')">Tutup</button>
        <button type="button" :disabled="berjalan || !jumlahDipilih" class="flex-1 min-h-11 px-4 rounded-xl bg-[#101828] text-white text-sm font-bold hover:bg-[#1D2939] disabled:opacity-60" @click="jalankanImpor">
          {{ berjalan ? 'Mengimpor…' : `Impor ${jumlahDipilih} Akun` }}
        </button>
      </div>
    </div>
  </div>
</template>
