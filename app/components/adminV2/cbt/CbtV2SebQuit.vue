<script setup lang="ts">
// Kode quit SEB iOS untuk satu ruang CBT atau satu kelas LMS (preview: docs/kode-quit-seb/preview-kode-quit-seb-admin.html).
// Database menolak pemanggil yang tidak berhak (0061/0062); pesan galatnya tampil di kartu.
import { ref, computed, onMounted } from 'vue'
import { useRuangUjian, type JenisSeb } from '~/composables/useRuangUjian'

const props = withDefaults(defineProps<{ targetId: string, jenis?: JenisSeb }>(), { jenis: 'ruang' })
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const api = useRuangUjian()
const kode = ref<string | null>(null)
const diubahPada = ref('')
const diubahOleh = ref('')
const proses = ref(false)
const galat = ref('')

const tautan = computed(() => import.meta.client ? `${location.origin}/api/cbt/seb-config?${props.jenis}=${props.targetId}` : '')
const pemegang = computed(() => props.jenis === 'kelas'
  ? ['Wali kelas', 'Guru pengajar kelas ini']
  : ['Pengawas yang ditugaskan di ruang ini'])
const bukanPemegang = computed(() => props.jenis === 'kelas'
  ? 'Guru kelas lain dan siswa'
  : 'Pengawas ruang lain, guru non-pengawas, dan siswa')
const waktuUbah = computed(() => diubahPada.value
  ? `${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(diubahPada.value))} WIB`
  : '-')

const terapkan = (d: { kode: string | null, diubahPada: string, diubahOleh: string }) => {
  kode.value = d.kode
  diubahPada.value = d.diubahPada
  diubahOleh.value = d.diubahOleh || '-'
}
const jalankan = async (aksi: () => Promise<void>) => {
  proses.value = true
  try { await aksi() } catch (e) { emit('toast', e instanceof Error ? e.message : 'Kode quit SEB gagal dimuat.') } finally { proses.value = false }
}

onMounted(async () => {
  proses.value = true
  try { terapkan(await api.kodeQuitSeb(props.jenis, props.targetId)) } catch (e) { galat.value = e instanceof Error ? e.message : 'Kode quit SEB gagal dimuat.' } finally { proses.value = false }
})
const toggleTampil = () => {
  if (kode.value) { kode.value = null; return }
  void jalankan(async () => terapkan(await api.kodeQuitSeb(props.jenis, props.targetId, true)))
}
const generateUlang = () => {
  if (!confirm('Generate ulang kode quit SEB? Kode lama langsung tidak berlaku.')) return
  void jalankan(async () => {
    terapkan(await api.generateKodeQuitSeb(props.jenis, props.targetId))
    emit('toast', 'Kode baru dibuat — kode lama sudah tidak berlaku')
  })
}
const salinTautan = async () => {
  try { await navigator.clipboard.writeText(tautan.value); emit('toast', 'Tautan config tersalin') } catch { emit('toast', 'Tautan gagal disalin.') }
}
</script>

<template>
  <div class="space-y-4">
    <section class="rounded-2xl bg-white p-[22px] shadow-[0_2px_10px_rgba(10,42,92,0.08)]">
      <h3 class="mb-1.5 text-sm font-bold tracking-[0.6px] text-[#0A2A5C]">KODE QUIT SEB — iPhone / iPad</h3>
      <p class="mb-4 text-[13px] leading-relaxed text-[#64748B]">Kode untuk membuka kunci Safe Exam Browser (SEB) di perangkat iOS siswa {{ jenis }} ini setelah ujian selesai, atau saat keadaan darurat. Kode tersimpan di server dan <b>berlaku hanya untuk {{ jenis }} ini</b>.</p>
      <p v-if="galat" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]" role="alert">{{ galat }}</p>
      <template v-else>
        <div class="flex flex-wrap items-stretch gap-3">
          <div class="flex min-h-[84px] flex-[1_1_200px] items-center justify-center rounded-[14px] bg-[#0A2A5C] py-3.5 pl-5 pr-2 font-mono text-[44px] font-extrabold tracking-[12px] text-white" aria-live="polite">{{ kode ?? '•••' }}</div>
          <div class="flex flex-[0_1_220px] flex-col gap-2.5">
            <button type="button" :disabled="proses" class="min-h-11 rounded-[11px] bg-[#0A2A5C] px-3.5 py-3 text-sm font-bold text-white disabled:opacity-60" @click="toggleTampil">{{ kode ? 'SEMBUNYIKAN' : 'TAMPILKAN KODE' }}</button>
            <button type="button" :disabled="proses" class="min-h-11 rounded-[11px] border-2 border-[#0A2A5C] bg-white px-3.5 py-3 text-sm font-bold text-[#0A2A5C] disabled:opacity-60" @click="generateUlang">GENERATE ULANG</button>
          </div>
        </div>
        <p class="mt-3.5 text-[13px] leading-relaxed text-[#64748B]">Generate ulang langsung mematikan kode lama. Kode terakhir diubah: {{ waktuUbah }} oleh {{ diubahOleh }}.</p>
      </template>
    </section>

    <section class="rounded-2xl bg-white p-[22px] shadow-[0_2px_10px_rgba(10,42,92,0.08)]">
      <h3 class="mb-1.5 text-sm font-bold tracking-[0.6px] text-[#0A2A5C]">TAUTAN CONFIG SEB {{ jenis.toUpperCase() }} INI</h3>
      <p class="mb-4 text-[13px] leading-relaxed text-[#64748B]">Siswa iOS membuka tautan ini (atau QR-nya di papan ruang) untuk memulai ujian di SEB. Di dalam file config hanya ada <b>hash</b> kode — kode aslinya tidak pernah sampai ke siswa.</p>
      <div class="flex flex-wrap gap-2.5">
        <input :value="tautan" type="text" readonly aria-label="Tautan config SEB" class="min-w-0 flex-[1_1_300px] rounded-[11px] border-[1.5px] border-[#D8E2EF] bg-[#F6F9FC] px-3.5 py-3 font-mono text-[13px] text-[#33475E]" @focus="($event.target as HTMLInputElement).select()">
        <button type="button" class="min-h-11 rounded-[11px] bg-[#0A2A5C] px-3.5 py-3 text-sm font-bold text-white" @click="salinTautan">SALIN TAUTAN</button>
      </div>
    </section>

    <section class="rounded-2xl bg-white p-[22px] shadow-[0_2px_10px_rgba(10,42,92,0.08)]">
      <h3 class="mb-1.5 text-sm font-bold tracking-[0.6px] text-[#0A2A5C]">SIAPA YANG BISA MELIHAT KODE INI</h3>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-full border border-[#D8E2EF] bg-[#F6F9FC] px-3 py-1.5 text-[12.5px] font-semibold text-[#33475E]">Superadmin</span>
        <span v-for="p in pemegang" :key="p" class="rounded-full border border-[#D8E2EF] bg-[#F6F9FC] px-3 py-1.5 text-[12.5px] font-semibold text-[#33475E]">{{ p }}</span>
      </div>
      <p class="mt-3 text-[13px] leading-relaxed text-[#64748B]">{{ bukanPemegang }} <b>tidak</b> bisa melihat kode {{ jenis }} ini. Setiap kali kode ditampilkan atau diganti, tercatat di log aktivitas.</p>
    </section>
  </div>
</template>
