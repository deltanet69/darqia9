<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  berkasDiterima, labelSekolah, validasiFormTiket,
  TIKET_KATEGORI_LAIN, TIKET_KATEGORI_MODUL,
  type TiketRow
} from '~/composables/tiketingCore'

// Form buat & ubah tiket — persis 4 isian sesuai spek: Judul,
// Issue/Kategori (dropdown), Komentar, Upload file (gambar, maks 1 MB).
// Grade tidak dipilih manual: mengikuti pengalih jenjang (buat) atau
// grade tiket itu sendiri (ubah).
const props = defineProps<{ tiketUbah?: TiketRow | null }>()
const emit = defineEmits<{ (e: 'selesai', id: string): void, (e: 'batal'): void }>()

const { gradeAktif, buatTiket, ubahTiket } = useTiketing()

const judul = ref(props.tiketUbah?.judul || '')
const kategori = ref(props.tiketUbah?.kategori || '')
const deskripsi = ref(props.tiketUbah?.deskripsi || '')
const berkas = ref<File | null>(null)
const infoBerkas = ref(props.tiketUbah?.lampiran_nama ? `Berkas saat ini: ${props.tiketUbah.lampiran_nama}` : '')
const galatBerkas = ref('')
const galatForm = ref('')
const menyimpan = ref(false)

const gradeForm = computed(() => props.tiketUbah ? props.tiketUbah.grade : gradeAktif.value)
const labelLain: Record<string, string> = {
  'Login': 'Login (tidak bisa masuk, lupa sandi, sesi)',
  'Jaringan / Network': 'Jaringan / Network (internet, WiFi, LAN)',
  'Integrasi Data': 'Integrasi Data (impor, sinkronisasi, data ganda)',
  'Lainnya': 'Lainnya'
}

const pilihBerkas = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  galatBerkas.value = ''
  berkas.value = null
  if (!f) { infoBerkas.value = ''; return }
  if (!berkasDiterima(f.size)) {
    galatBerkas.value = `Berkas ditolak: ukuran ${(f.size / 1024 / 1024).toFixed(2)} MB melebihi batas 1 MB.`
    ;(e.target as HTMLInputElement).value = ''
    return
  }
  berkas.value = f
  infoBerkas.value = `Berkas terpilih: ${f.name} · ${Math.round(f.size / 1024)} KB`
}

const kirim = async () => {
  const galat = validasiFormTiket({ judul: judul.value, kategori: kategori.value, deskripsi: deskripsi.value })
  if (galat) { galatForm.value = galat; return }
  galatForm.value = ''
  menyimpan.value = true
  try {
    if (props.tiketUbah) {
      await ubahTiket(props.tiketUbah, { judul: judul.value, kategori: kategori.value, deskripsi: deskripsi.value, berkas: berkas.value })
      emit('selesai', props.tiketUbah.id)
    } else {
      const tiket = await buatTiket({ judul: judul.value, kategori: kategori.value, deskripsi: deskripsi.value, grade: gradeForm.value, berkas: berkas.value })
      emit('selesai', tiket.id)
    }
  } catch (e: any) {
    galatForm.value = String(e?.message || 'Gagal menyimpan tiket.')
  } finally {
    menyimpan.value = false
  }
}
</script>

<template>
  <div>
    <button @click="emit('batal')" class="text-[13px] font-medium text-[#1B5FD9]">← Kembali</button>
    <h1 class="mt-3 text-[22px] font-semibold leading-7 text-blue-950">{{ tiketUbah ? 'Ubah Tiket' : 'Buat Tiket Baru' }}</h1>
    <p class="mt-1 text-[13px] text-slate-500">Satu tiket untuk satu persoalan. Tiket tercatat pada grade yang sedang aktif di pengalih jenjang.</p>

    <div class="mx-auto mt-5 max-w-[860px] rounded-xl border border-slate-300 bg-white p-5 lg:p-6">
      <div class="flex flex-wrap items-center gap-2 rounded-xl bg-[#EAF1FC] px-4 py-3">
        <span class="rounded bg-[#1B5FD9] px-2 py-1 text-[11px] font-semibold text-white">GRADE TIKET: {{ gradeForm }}</span>
        <p class="min-w-0 flex-1 text-[12.5px] text-slate-600">
          {{ labelSekolah(gradeForm) }} — mengikuti pengalih jenjang di header (tidak dipilih manual).
          <template v-if="tiketUbah">ID tiket <span class="font-semibold text-[#101828]">{{ tiketUbah.nomor }}</span> tidak berubah.</template>
          <template v-else>Nomor tiket terbit otomatis mengikuti urutan grade {{ gradeForm }}.</template>
        </p>
      </div>

      <label class="mt-5 block text-[12.5px] font-medium text-[#101828]">Judul <span class="text-[#B42318]">*</span></label>
      <input v-model="judul" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-slate-400" placeholder="cth. Nilai PTS kelas saya tidak muncul di Raport Siswa">

      <label class="mt-4 block text-[12.5px] font-medium text-[#101828]">Issue / Kategori <span class="text-[#B42318]">*</span></label>
      <select v-model="kategori" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-[12.5px] text-slate-600">
        <option value="">— Pilih issue / kategori —</option>
        <optgroup label="Modul Aplikasi">
          <option v-for="k in TIKET_KATEGORI_MODUL" :key="k" :value="k">{{ k }}</option>
        </optgroup>
        <optgroup label="Kendala Teknis & Lainnya">
          <option v-for="k in TIKET_KATEGORI_LAIN" :key="k" :value="k">{{ labelLain[k] }}</option>
        </optgroup>
      </select>
      <p class="mt-1.5 text-[12px] text-slate-400">Kategori mengikuti modul yang tersedia di aplikasi, ditambah kendala login, jaringan, dan integrasi data.</p>

      <label class="mt-4 block text-[12.5px] font-medium text-[#101828]">Komentar <span class="text-[#B42318]">*</span></label>
      <textarea v-model="deskripsi" rows="6" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-slate-400" placeholder="Jelaskan kendalanya di sini. Untuk error/bug, tuliskan langkahnya: 1) saya membuka ..., 2) saya mengklik ..., 3) yang terjadi ... (yang seharusnya ...)"></textarea>

      <label class="mt-4 block text-[12.5px] font-medium text-[#101828]">Upload File <span class="font-normal text-slate-400">(opsional)</span></label>
      <div class="mt-1.5 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L6 21" /></svg>
        <p class="mt-2 text-[13px] font-medium text-slate-600">Seret gambar ke sini atau <label for="t-berkas" class="cursor-pointer text-[#1B5FD9]">pilih dari perangkat</label></p>
        <input id="t-berkas" type="file" accept="image/png,image/jpeg" class="hidden" @change="pilihBerkas">
        <p class="mt-0.5 text-[12px]" :class="galatBerkas ? 'font-medium text-[#B42318]' : 'text-slate-400'">{{ galatBerkas || infoBerkas || 'Gambar (JPG / PNG), maks 1 MB, 1 berkas — tangkapan layar pesan error sangat membantu' }}</p>
      </div>

      <p v-if="galatForm" class="mt-3 rounded-lg bg-[#FEF3F2] px-3 py-2.5 text-[12.5px] font-medium text-[#B42318]">{{ galatForm }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
        <p class="min-w-0 flex-1 text-[12px] text-slate-400">Tiket langsung masuk ke Kotak Masuk Superadmin. Balasan &amp; progress penanganannya tampil di Tiket Saya.</p>
        <button @click="emit('batal')" class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600">Batal</button>
        <button @click="kirim" :disabled="menyimpan" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-60">{{ menyimpan ? 'Menyimpan…' : (tiketUbah ? 'Simpan Perubahan' : 'Kirim Tiket') }}</button>
      </div>
    </div>
  </div>
</template>
