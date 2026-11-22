<script setup lang="ts">
// Kode quit SEB iOS untuk satu ruang CBT atau satu kelas LMS (preview: docs/kode-quit-seb/preview-kode-quit-seb-admin.html).
// Database menolak pemanggil yang tidak berhak (0061/0062); pesan galatnya tampil di kartu.
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import AdminV2Icon from '../AdminV2Icon.vue'
import { useRuangUjian, type JenisSeb } from '~/composables/useRuangUjian'

const props = withDefaults(defineProps<{ targetId: string, jenis?: JenisSeb }>(), { jenis: 'ruang' })
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const api = useRuangUjian()
const kode = ref<string | null>(null)
const kodeLama = ref<string[]>([])
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

// Siswa yang sedang ujian di kelas/ruang ini (migrasi 0087): generate ulang terkunci selama > 0.
const sesiAktif = ref(0)
const alasanKunci = computed(() => `Generate ulang terkunci — ${sesiAktif.value} siswa sedang ujian dengan kode ini.`)

const terapkan = (d: { kode: string | null, kodeLama?: string[], sesiAktif?: number, diubahPada: string, diubahOleh: string }) => {
  kode.value = d.kode
  kodeLama.value = d.kode ? d.kodeLama ?? [] : []
  sesiAktif.value = Number(d.sesiAktif) || 0
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
  void buatQr()
})
const toggleTampil = () => {
  if (kode.value) { kode.value = null; kodeLama.value = []; return }
  void jalankan(async () => terapkan(await api.kodeQuitSeb(props.jenis, props.targetId, true)))
}
const generateUlang = async () => {
  // Tombol nonaktif (aria-disabled) tetap bisa diketuk agar alasannya muncul sebagai peringatan.
  if (sesiAktif.value > 0) { alert(alasanKunci.value); return }
  if (!confirm('Generate ulang kode quit SEB? Siswa yang sudah membuka SEB tetap memakai kode lama (tetap tampil di bawah kode baru).')) return
  proses.value = true
  try {
    terapkan(await api.generateKodeQuitSeb(props.jenis, props.targetId))
    emit('toast', 'Kode baru dibuat. Kode lama tetap tampil untuk siswa yang sudah di dalam SEB.')
  } catch (e) {
    // Server menolak (sesi aktif muncul setelah halaman dimuat): pesan server tampil apa adanya.
    alert(e instanceof Error ? e.message : 'Kode quit SEB gagal dibuat.')
    try { terapkan(await api.kodeQuitSeb(props.jenis, props.targetId, !!kode.value)) } catch { /* jumlah sesi disegarkan saat dibuka ulang */ }
  } finally { proses.value = false }
}
const qrUrl = ref('')
const buatQr = async () => {
  if (!tautan.value) { qrUrl.value = ''; return }
  try { qrUrl.value = await QRCode.toDataURL(tautan.value, { margin: 1, width: 296, errorCorrectionLevel: 'M' }) } catch { qrUrl.value = '' }
}
watch(tautan, () => void buatQr())

const salinTautan = async () => {
  try { await navigator.clipboard.writeText(tautan.value); emit('toast', 'Tautan config tersalin') } catch { emit('toast', 'Tautan gagal disalin.') }
}
</script>

<template>
  <section class="rounded-[20px] border border-[#E5EAF1] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.08)]">
    <h3 class="flex items-center gap-2.5 text-[13px] font-semibold text-[#101828]"><span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#E8EEF7] text-[#0A2A5C]"><AdminV2Icon name="phone" :size="14" /></span>iPhone / iPad (SEB)</h3>
    <p class="mt-1.5 text-[11.5px] leading-relaxed text-[#98A2B3]">Hanya untuk siswa yang ujian memakai iPhone/iPad di {{ jenis }} ini. Abaikan bagian ini bila tidak ada siswa seperti itu.</p>

    <p v-if="galat" class="mt-3.5 rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]" role="alert">{{ galat }}</p>
    <template v-else>
      <div class="mt-4 text-center">
        <div class="inline-block rounded-[14px] border border-[#E5EAF1] bg-white p-2.5">
          <img v-if="qrUrl" :src="qrUrl" alt="QR tautan config SEB" class="block h-[148px] w-[148px]">
          <div v-else class="flex h-[148px] w-[148px] items-center justify-center text-[11px] text-[#98A2B3]">QR sedang dibuat…</div>
        </div>
        <p class="mt-2 text-[11.5px] font-semibold text-[#344054]">Pindai untuk mulai ujian</p>
        <p class="text-[10.5px] text-[#98A2B3]">pakai kamera iPhone/iPad siswa</p>
      </div>

      <div class="mt-4 border-t border-[#EEF1F6] pt-3.5">
        <p class="text-[12.5px] font-semibold text-[#344054]">Kode keluar</p>
        <p class="mt-0.5 text-[11.5px] leading-relaxed text-[#98A2B3]">Kode 3 huruf untuk membuka kunci aplikasi ujian siswa setelah selesai atau saat darurat. Berlaku hanya untuk {{ jenis }} ini.</p>
        <div class="mt-2.5 flex gap-2">
          <div class="flex min-h-[42px] flex-1 items-center justify-center rounded-[10px] bg-[#0A2A5C] font-mono text-xl font-bold tracking-[8px] text-white" aria-live="polite">{{ kode ?? '•••' }}</div>
          <button type="button" :disabled="proses" class="min-h-[42px] rounded-[10px] border border-[#DFE5EE] bg-white px-3.5 text-xs font-semibold text-[#344054] disabled:opacity-60" @click="toggleTampil">{{ kode ? 'Sembunyikan' : 'Tampilkan' }}</button>
          <button type="button" :disabled="proses" :aria-disabled="sesiAktif > 0" :title="sesiAktif > 0 ? alasanKunci : undefined" class="min-h-[42px] rounded-[10px] border border-[#DFE5EE] bg-white px-3.5 text-xs font-semibold text-[#344054] disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" @click="generateUlang">Buat Baru</button>
        </div>
        <p v-if="sesiAktif > 0" class="mt-3 rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs font-semibold text-[#B42318]" role="status">{{ alasanKunci }}</p>
        <div v-if="kodeLama.length" class="mt-3 rounded-xl border border-[#F5D9A8] bg-[#FFFAEB] px-4 py-3 text-xs leading-relaxed text-[#7A4B05]">
          <b>Kode sebelumnya:</b> <span class="font-mono font-bold tracking-[3px]">{{ kodeLama.join(' · ') }}</span><br>
          Siswa yang membuka config SEB sebelum kode diganti hanya bisa keluar dengan kode lama. Coba dari yang paling kiri.
        </div>
      </div>

      <div class="mt-4 border-t border-[#EEF1F6] pt-3.5">
        <p class="text-[12.5px] font-semibold text-[#344054]">Tautan mulai ujian</p>
        <p class="mt-0.5 text-[11.5px] leading-relaxed text-[#98A2B3]">Isinya sama persis dengan QR di atas — bagikan lewat chat bila siswa tidak bisa memindai QR.</p>
        <div class="mt-2.5 flex gap-2">
          <input :value="tautan" type="text" readonly aria-label="Tautan config SEB" class="min-h-[42px] min-w-0 flex-1 rounded-[10px] border border-[#E5EAF1] bg-[#F8FAFC] px-3 text-[11.5px] text-[#667085]" @focus="($event.target as HTMLInputElement).select()">
          <button type="button" class="min-h-[42px] rounded-[10px] bg-[#0A2A5C] px-3.5 text-xs font-semibold text-white" @click="salinTautan">Salin</button>
        </div>
      </div>

      <div class="mt-4 border-t border-[#EEF1F6] pt-3.5">
        <p class="text-[12.5px] font-semibold text-[#344054]">Siapa yang bisa melihat kode ini</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span class="rounded-full border border-[#D8E2EF] bg-[#F6F9FC] px-3 py-1.5 text-[11.5px] font-semibold text-[#33475E]">Superadmin</span>
          <span v-for="p in pemegang" :key="p" class="rounded-full border border-[#D8E2EF] bg-[#F6F9FC] px-3 py-1.5 text-[11.5px] font-semibold text-[#33475E]">{{ p }}</span>
        </div>
        <p class="mt-2 text-[11.5px] leading-relaxed text-[#98A2B3]">{{ bukanPemegang }} <b>tidak</b> bisa melihat kode {{ jenis }} ini. Setiap kali kode ditampilkan atau diganti, tercatat di log aktivitas.</p>
      </div>

      <p class="mt-4 border-t border-[#EEF1F6] pt-3 text-[10.5px] leading-relaxed text-[#B0B9C8]">Kode terakhir diubah: {{ waktuUbah }} oleh {{ diubahOleh }} · Mengganti kode akan mengubah tautan &amp; QR di atas — bagikan ulang ke siswa.</p>
    </template>
  </section>
</template>
