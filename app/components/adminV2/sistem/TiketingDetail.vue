<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  berkasDiterima, kelasStatus, labelSekolah, warnaGrade,
  TIKET_PROGRESS, TIKET_STATUS,
  type StatusTiket, type TiketLog, type TiketPesan, type TiketRow
} from '~/composables/tiketingCore'

// Detail satu tiket: utas (deskripsi + balasan), komentar, Rincian,
// Log Penanganan, dan — khusus Superadmin — panel Tangani Tiket.
// Tiket milik orang lain tidak akan termuat (RLS): tampil "tidak ditemukan".
const props = defineProps<{ tiketId: string }>()
const emit = defineEmits<{ (e: 'kembali'): void, (e: 'ubah', tiket: TiketRow): void }>()

const rbac = useRbac()
const { superadmin, muatDetail, kirimKomentar, simpanPenanganan, hapusTiket, urlBerkas } = useTiketing()

const tiket = ref<TiketRow | null>(null)
const pesan = ref<TiketPesan[]>([])
const log = ref<TiketLog[]>([])
const memuat = ref(true)
const tidakAda = ref(false)
const galatAksi = ref('')

const teksKomentar = ref('')
const berkasBukti = ref<File | null>(null)
const infoBukti = ref('')
const mengirim = ref(false)

const statusPilih = ref<StatusTiket>('Baru')
const progressPilih = ref(0)
const catatan = ref('')
const menyimpanTangani = ref(false)
const konfirmHapus = ref(false)

const inisial = (nama: string) => (nama || '?').split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase()
const formatWaktu = (iso: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

const muat = async () => {
  memuat.value = true
  const d = await muatDetail(props.tiketId)
  memuat.value = false
  if (!d) { tidakAda.value = true; return }
  tiket.value = d.tiket
  pesan.value = d.pesan
  log.value = d.log
  statusPilih.value = d.tiket.status
  progressPilih.value = d.tiket.progress
}

onMounted(async () => { await rbac.muat(); await muat() })

const bukaBerkas = async (path: string | null) => {
  const url = await urlBerkas(path)
  if (url) window.open(url, '_blank')
}

const pilihBukti = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  berkasBukti.value = null
  infoBukti.value = ''
  if (!f) return
  if (!berkasDiterima(f.size)) {
    infoBukti.value = 'Berkas ditolak: melebihi batas 1 MB.'
    ;(e.target as HTMLInputElement).value = ''
    return
  }
  berkasBukti.value = f
  infoBukti.value = `Bukti terpilih: ${f.name}`
}

const kirim = async () => {
  if (!tiket.value || !teksKomentar.value.trim()) { galatAksi.value = 'Komentar masih kosong.'; return }
  galatAksi.value = ''
  mengirim.value = true
  try {
    await kirimKomentar(tiket.value, teksKomentar.value, berkasBukti.value)
    teksKomentar.value = ''
    berkasBukti.value = null
    infoBukti.value = ''
    await muat()
  } catch (e: any) {
    galatAksi.value = String(e?.message || 'Komentar gagal terkirim.')
  } finally {
    mengirim.value = false
  }
}

const simpanTangani = async (paksaSelesai = false) => {
  if (!tiket.value) return
  galatAksi.value = ''
  menyimpanTangani.value = true
  try {
    await simpanPenanganan(tiket.value, {
      status: paksaSelesai ? 'Selesai' : statusPilih.value,
      progress: paksaSelesai ? 100 : progressPilih.value,
      catatan: catatan.value
    })
    catatan.value = ''
    await muat()
  } catch (e: any) {
    galatAksi.value = String(e?.message || 'Penanganan gagal disimpan.')
  } finally {
    menyimpanTangani.value = false
  }
}

const hapus = async () => {
  if (!tiket.value) return
  try {
    await hapusTiket(tiket.value)
    emit('kembali')
  } catch (e: any) {
    galatAksi.value = String(e?.message || 'Tiket gagal dihapus.')
    konfirmHapus.value = false
  }
}
</script>

<template>
  <div>
    <button @click="emit('kembali')" class="text-[13px] font-medium text-[#1B5FD9]">← Kembali ke {{ superadmin ? 'Kotak Masuk' : 'Tiket Saya' }}</button>

    <div v-if="memuat" class="mt-4 rounded-xl border border-slate-300 bg-white p-8 text-center text-[13px] text-slate-500">Memuat detail tiket…</div>
    <div v-else-if="tidakAda || !tiket" class="mt-4 rounded-xl border border-slate-300 bg-white p-8 text-center">
      <p class="text-[14px] font-medium text-[#101828]">Tiket tidak ditemukan</p>
      <p class="mt-1 text-[13px] text-slate-500">Tiket ini tidak ada, sudah dihapus, atau bukan milik Anda — hanya pemilik tiket dan Superadmin yang dapat membukanya.</p>
    </div>

    <div v-else class="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div class="min-w-0">
        <div class="rounded-xl border border-slate-300 bg-white p-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold text-white" :style="{ backgroundColor: warnaGrade(tiket.grade) }">{{ tiket.nomor }}</span>
            <span class="whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold" :class="kelasStatus(tiket.status)">{{ tiket.status }}</span>
            <span class="whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold" :style="{ backgroundColor: tiket.grade === 'SMK' ? '#EAF1FC' : '#ECFDF3', color: warnaGrade(tiket.grade) }">Grade {{ tiket.grade }}</span>
            <span class="whitespace-nowrap rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Kategori: {{ tiket.kategori }}</span>
          </div>
          <h1 class="mt-2 text-[19px] font-semibold leading-6 text-[#101828]">{{ tiket.judul }}</h1>
          <div class="mt-4">
            <div class="flex items-center justify-between text-[12.5px]">
              <span class="font-medium text-slate-600">Progress penanganan</span>
              <span class="font-semibold text-[#1B5FD9]">{{ tiket.progress }}%</span>
            </div>
            <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div class="h-2.5 rounded-full" :style="{ width: Math.max(tiket.progress, 3) + '%', backgroundColor: tiket.progress >= 100 ? '#067647' : '#1B5FD9' }"></div>
            </div>
            <p v-if="!superadmin" class="mt-1.5 text-[12px] text-slate-400">Progress diperbarui oleh Superadmin setiap ada kemajuan penanganan.</p>
          </div>

          <!-- Pesan pertama = deskripsi tiket -->
          <div class="mt-4 flex gap-3 border-t border-slate-200 pt-4">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C] text-[12px] font-semibold text-white">{{ inisial(tiket.pelapor_nama) }}</span>
            <div class="min-w-0">
              <p class="text-[13px]"><span class="font-semibold text-[#101828]">{{ tiket.pelapor_nama }}</span> <span class="text-slate-400">· {{ tiket.pelapor_peran }} · {{ formatWaktu(tiket.created_at) }}</span></p>
              <p class="mt-1.5 whitespace-pre-line text-[13.5px] leading-6 text-slate-600">{{ tiket.deskripsi }}</p>
              <button v-if="tiket.lampiran_nama" @click="bukaBerkas(tiket.lampiran_path)" class="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-slate-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L6 21" /></svg>
                {{ tiket.lampiran_nama }}
              </button>
            </div>
          </div>

          <!-- Balasan -->
          <div v-for="p in pesan" :key="p.id" class="mt-4 flex gap-3 border-t border-slate-200 pt-4">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white" :class="p.dari_superadmin ? 'bg-[#101828]' : 'bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C]'">{{ inisial(p.penulis_nama) }}</span>
            <div class="min-w-0">
              <p class="text-[13px]">
                <span class="font-semibold text-[#101828]">{{ p.penulis_nama }}</span>
                <span v-if="p.dari_superadmin" class="ml-1 whitespace-nowrap rounded bg-[#101828] px-1.5 py-0.5 text-[10px] font-semibold text-white">SUPERADMIN</span>
                <span class="text-slate-400"> · {{ formatWaktu(p.created_at) }}</span>
              </p>
              <p class="mt-1.5 whitespace-pre-line text-[13.5px] leading-6 text-slate-600">{{ p.teks }}</p>
              <button v-if="p.bukti_nama" @click="bukaBerkas(p.bukti_path)" class="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#ECFDF3] px-2.5 py-1.5 text-[12px] font-medium text-[#067647]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L6 21" /></svg>
                Bukti penanganan: {{ p.bukti_nama }}
              </button>
            </div>
          </div>
        </div>

        <!-- Konfirmasi hapus -->
        <div v-if="konfirmHapus" class="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#B42318]/40 bg-[#FEF3F2] px-4 py-3">
          <p class="min-w-0 flex-1 text-[13px] font-medium text-[#B42318]">Hapus tiket ini secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
          <button @click="hapus" class="rounded-xl bg-[#B42318] px-4 py-2 text-[13px] font-medium text-white">Ya, Hapus Permanen</button>
          <button @click="konfirmHapus = false" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-600">Batal</button>
        </div>

        <!-- Kotak komentar -->
        <div class="mt-4 rounded-xl border border-slate-300 bg-white p-5">
          <label class="text-[12.5px] font-medium text-[#101828]">{{ superadmin ? 'Balas / komentar untuk pelapor' : 'Tambahkan komentar' }}</label>
          <textarea v-model="teksKomentar" rows="3" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-slate-400" :placeholder="superadmin ? 'Tulis tanggapan, pertanyaan lanjutan, atau kabar perbaikan...' : 'Tulis keterangan tambahan atau jawaban atas pertanyaan Superadmin...'"></textarea>
          <template v-if="superadmin">
            <label class="mt-4 block text-[12.5px] font-medium text-[#101828]">Upload bukti penanganan <span class="font-normal text-slate-400">(opsional)</span></label>
            <div class="mt-1.5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
              <p class="min-w-0 flex-1 text-[12.5px] text-slate-500">{{ infoBukti || 'Lampirkan gambar hasil perbaikan (JPG/PNG, maks 1 MB) — tampil di utas sebagai bukti penanganan.' }}</p>
              <label for="d-bukti" class="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600">Pilih Berkas</label>
              <input id="d-bukti" type="file" accept="image/png,image/jpeg" class="hidden" @change="pilihBukti">
            </div>
          </template>
          <p v-if="galatAksi" class="mt-3 rounded-lg bg-[#FEF3F2] px-3 py-2.5 text-[12.5px] font-medium text-[#B42318]">{{ galatAksi }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button @click="kirim" :disabled="mengirim" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-60">{{ mengirim ? 'Mengirim…' : 'Kirim Komentar' }}</button>
            <template v-if="!superadmin">
              <button v-if="tiket.status === 'Baru'" @click="emit('ubah', tiket)" class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600">Ubah Tiket</button>
              <span v-else class="text-[12px] text-slate-400">Tiket hanya dapat diubah selama berstatus Baru.</span>
              <button @click="konfirmHapus = true" class="rounded-xl border border-[#B42318]/40 bg-white px-4 py-2.5 text-[13px] font-medium text-[#B42318]">Hapus Tiket</button>
              <p class="w-full text-[12px] text-slate-400">Komentar baru pada tiket berstatus Selesai akan membuka kembali tiket.</p>
            </template>
          </div>
        </div>
      </div>

      <!-- Rel kanan -->
      <aside class="min-w-0 space-y-4">
        <div v-if="superadmin" class="rounded-xl border border-slate-300 bg-white p-5">
          <p class="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Tangani Tiket</p>
          <label class="mt-3 block text-[12.5px] font-medium text-[#101828]">Status</label>
          <select v-model="statusPilih" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-[12.5px] text-slate-600">
            <option v-for="s in TIKET_STATUS" :key="s" :value="s">{{ s }}</option>
          </select>
          <label class="mt-3 block text-[12.5px] font-medium text-[#101828]">Progress penanganan</label>
          <select v-model="progressPilih" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-[12.5px] text-slate-600">
            <option v-for="p in TIKET_PROGRESS" :key="p.nilai" :value="p.nilai">{{ p.label }}</option>
          </select>
          <label class="mt-3 block text-[12.5px] font-medium text-[#101828]">Catatan progress <span class="font-normal text-slate-400">(masuk log)</span></label>
          <textarea v-model="catatan" rows="2" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-slate-400" placeholder="cth. Penyebab ditemukan; perbaikan data sedang disiapkan"></textarea>
          <button @click="simpanTangani(false)" :disabled="menyimpanTangani" class="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-60">Simpan Penanganan</button>
          <button @click="simpanTangani(true)" :disabled="menyimpanTangani" class="mt-2 w-full rounded-xl bg-[#067647] px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60">Tandai Selesai (100%)</button>
          <button @click="konfirmHapus = true" class="mt-2 w-full rounded-xl border border-[#B42318]/40 bg-white px-4 py-2.5 text-[13px] font-medium text-[#B42318]">Hapus Tiket (spam / tidak valid)</button>
        </div>

        <div class="rounded-xl border border-slate-300 bg-white p-5">
          <p class="text-[12px] font-semibold uppercase tracking-wider text-slate-500">{{ superadmin ? 'Pelapor' : 'Rincian Tiket' }}</p>
          <div v-if="superadmin" class="mt-3 flex items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C] text-[13px] font-semibold text-white">{{ inisial(tiket.pelapor_nama) }}</span>
            <div class="min-w-0">
              <p class="truncate text-[13.5px] font-medium text-[#101828]">{{ tiket.pelapor_nama }}</p>
              <p class="text-[12px] text-slate-500">{{ tiket.pelapor_peran }} · {{ labelSekolah(tiket.grade) }}</p>
            </div>
          </div>
          <dl class="space-y-2.5 text-[13px]" :class="superadmin ? 'mt-4 border-t border-slate-200 pt-4' : 'mt-3'">
            <div class="flex justify-between gap-3"><dt class="text-slate-500">ID Tiket</dt><dd class="font-semibold" :style="{ color: warnaGrade(tiket.grade) }">{{ tiket.nomor }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Grade</dt><dd class="font-medium">{{ labelSekolah(tiket.grade) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Kategori</dt><dd class="font-medium">{{ tiket.kategori }}</dd></div>
            <div v-if="!superadmin" class="flex justify-between gap-3"><dt class="text-slate-500">Pelapor</dt><dd class="font-medium">{{ tiket.pelapor_nama }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Status</dt><dd class="font-medium">{{ tiket.status }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Progress</dt><dd class="font-medium">{{ tiket.progress }}%</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Dibuat</dt><dd class="font-medium">{{ formatWaktu(tiket.created_at) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-slate-500">Penangani</dt><dd class="font-medium">Superadmin</dd></div>
          </dl>
        </div>

        <div class="rounded-xl border border-slate-300 bg-white p-5">
          <p class="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Log Penanganan</p>
          <ol class="mt-3 space-y-3.5 text-[12.5px]">
            <li v-for="(l, i) in log" :key="l.id" class="flex gap-2.5">
              <span class="mt-1 h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: i === 0 ? '#1B5FD9' : '#CBD5E1' }"></span>
              <span>
                <span class="font-medium">{{ l.teks }}</span><br>
                <span class="text-slate-400">{{ formatWaktu(l.created_at) }}<template v-if="l.catatan"> · Catatan: {{ l.catatan }}</template></span>
              </span>
            </li>
            <li v-if="!log.length" class="text-slate-400">Belum ada catatan penanganan.</li>
          </ol>
          <p class="mt-3 border-t border-slate-200 pt-3 text-[12px] leading-5 text-slate-400">Setiap perubahan status, progress, dan komentar tercatat otomatis di log ini — lengkap dengan pelaku dan waktunya.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
