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
  <div class="mt-4 rounded-2xl border border-[#E7EBF2] bg-white p-4">
    <div class="flex flex-wrap items-start gap-4">
      <div class="min-w-[240px] flex-1">
        <div class="flex items-center gap-2">
          <h2 class="font-semibold">WhatsApp Sekolah (Notifikasi SPMB)</h2>
          <span v-if="status?.terhubung" class="rounded-full bg-[#ECFDF3] px-2.5 py-0.5 text-xs font-medium text-[#027A48]">Terhubung{{ status.nomor ? ` · ${status.nomor}` : '' }}</span>
          <span v-else-if="status" class="rounded-full bg-[#FFFAEB] px-2.5 py-0.5 text-xs font-medium text-[#B54708]">Belum terhubung</span>
          <span v-else class="rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-xs font-medium text-[#667085]">Memeriksa…</span>
        </div>
        <p v-if="galat" class="mt-1.5 text-sm text-[#B42318]">{{ galat }}</p>
        <p v-else-if="status?.terhubung" class="mt-1.5 text-sm text-[#667085]">
          Notifikasi status pendaftaran terkirim otomatis ke WhatsApp wali setiap status berubah, dan dapat dikirim ulang dari halaman detail pendaftar.
          Pengiriman dibatasi bertahap (perlindungan anti-ban) — bila jatah harian habis, admin menerima pemberitahuan dan status tetap tersimpan.
        </p>
        <p v-else class="mt-1.5 text-sm text-[#667085]">
          Pindai kode QR di samping memakai HP nomor resmi SPMB sekolah: buka WhatsApp, ketuk <em>Perangkat tertaut</em>, lalu <em>Tautkan perangkat</em>.
          Kode diperbarui otomatis. Gunakan nomor khusus SPMB, bukan nomor pribadi.
        </p>
        <button type="button" class="mt-2.5 min-h-10 rounded-lg border border-[#D0D5DD] px-3.5 text-sm font-medium text-[#344054]" :disabled="memuat" @click="muatStatus">{{ memuat ? 'Memeriksa…' : 'Segarkan Status' }}</button>
      </div>
      <div v-if="!status?.terhubung && qrGambar" class="shrink-0 rounded-xl border border-[#EFF2F7] bg-white p-2">
        <img :src="qrGambar" alt="Kode QR penautan WhatsApp sekolah" class="h-[180px] w-[180px]">
        <p class="mt-1 text-center text-xs text-[#667085]">Pindai untuk menautkan</p>
      </div>
    </div>
  </div>
</template>
