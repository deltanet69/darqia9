<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import QRCode from 'qrcode'

// Panel sesi WhatsApp sekolah (gateway OpenWA di server sekolah).
// Admin TU memindai kode QR dari sini memakai HP nomor resmi SPMB:
// WhatsApp > Perangkat tertaut > Tautkan perangkat.
// Pengiriman notifikasi dibatasi governor anti-ban di gateway, jadi
// panel ini juga menampilkan keadaan sesi apa adanya.

interface StatusSesi {
  nama: string
  status: string
  terhubung: boolean
  nomor: string | null
  qr: string | null
}

const status = ref<StatusSesi | null>(null)
const qrGambar = ref('')
const galat = ref('')
const memuat = ref(false)
let pewaktu: ReturnType<typeof setInterval> | undefined

async function muatStatus() {
  if (memuat.value) return
  memuat.value = true
  try {
    const s = await $fetch<StatusSesi>('/api/admin/spmb/wa-sesi')
    status.value = s
    galat.value = ''
    if (s.qr) {
      qrGambar.value = s.qr.startsWith('data:image') ? s.qr : await QRCode.toDataURL(s.qr, { width: 220, margin: 1 })
    } else {
      qrGambar.value = ''
    }
  } catch (e: any) {
    galat.value = e?.data?.statusMessage || e?.statusMessage || 'Gateway WhatsApp belum dapat dihubungi.'
  } finally {
    memuat.value = false
  }
}

onMounted(() => {
  void muatStatus()
  // QR WhatsApp kedaluwarsa ±20 detik; segarkan berkala selama panel terbuka.
  pewaktu = setInterval(() => { if (!status.value?.terhubung) void muatStatus() }, 20000)
})
onBeforeUnmount(() => { if (pewaktu) clearInterval(pewaktu) })
</script>

<template>
  <div class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
    <div class="flex flex-wrap items-start gap-5">
      <div class="min-w-[240px] flex-1">
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          </span>
          <h2 class="text-[15px] font-bold text-slate-900">WhatsApp Sekolah (Notifikasi SPMB)</h2>
          <span v-if="status?.terhubung" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-100"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />Terhubung{{ status.nomor ? ` · ${status.nomor}` : '' }}</span>
          <span v-else-if="status" class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 ring-1 ring-amber-100"><span class="h-1.5 w-1.5 rounded-full bg-amber-500" />Belum terhubung</span>
          <span v-else class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />Memeriksa…</span>
        </div>
        <p v-if="galat" class="mt-2.5 text-sm font-medium text-red-600">{{ galat }}</p>
        <p v-else-if="status?.terhubung" class="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-500">
          Notifikasi status pendaftaran terkirim otomatis ke WhatsApp wali setiap status berubah, dan dapat dikirim ulang dari halaman detail pendaftar.
          Pengiriman dibatasi bertahap (perlindungan anti-ban) — bila jatah harian habis, admin menerima pemberitahuan dan status tetap tersimpan.
        </p>
        <p v-else class="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-500">
          Pindai kode QR di samping memakai HP nomor resmi SPMB sekolah: buka WhatsApp, ketuk <em>Perangkat tertaut</em>, lalu <em>Tautkan perangkat</em>.
          Kode diperbarui otomatis. Gunakan nomor khusus SPMB, bukan nomor pribadi.
        </p>
        <button type="button" class="mt-3.5 min-h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-50" :disabled="memuat" @click="muatStatus">{{ memuat ? 'Memeriksa…' : 'Segarkan Status' }}</button>
      </div>
      <div v-if="!status?.terhubung && qrGambar" class="shrink-0 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
        <img :src="qrGambar" alt="Kode QR penautan WhatsApp sekolah" class="h-[180px] w-[180px] rounded-lg">
        <p class="mt-2 text-center text-xs font-semibold text-slate-500">Pindai untuk menautkan</p>
      </div>
    </div>
  </div>
</template>
