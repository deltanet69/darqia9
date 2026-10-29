<script setup lang="ts">
import { computed } from 'vue'
import { SPMB_BIAYA, fmtTanggalPanjang, fmtWaktuSpmb, samarNik, type SpmbAdminRecord, type SpmbStatus } from '~/composables/useSpmbAdmin'

const props = defineProps<{ record: SpmbAdminRecord }>()
const emit = defineEmits<{
  kembali: []
  status: [id: string, status: SpmbStatus]
  hapus: [id: string]
  ubah: [id: string]
}>()

const x = computed(() => props.record)

const chipKelas: Record<string, string> = {
  'Menunggu verifikasi': 'bg-[#FFFAEB] text-[#B54708]',
  'Pembayaran terverifikasi': 'bg-[#EFF8FF] text-[#175CD3]',
  'Diterima': 'bg-[#ECFDF3] text-[#027A48]',
  'Ditolak': 'bg-[#FEF3F2] text-[#B42318]'
}
const langkahAktif = computed(() => {
  if (x.value.status === 'Menunggu verifikasi') return 0
  if (x.value.status === 'Pembayaran terverifikasi') return 1
  return 2
})
const waHref = computed(() => `https://wa.me/62${(x.value.o_hp || '').replace(/\D/g, '').replace(/^0/, '')}`)
</script>

<template>
  <div>
    <button type="button" class="inline-flex items-center gap-1.5 text-sm font-medium text-[#175CD3]" @click="emit('kembali')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      Kembali ke daftar pendaftar
    </button>

    <div class="mt-4 rounded-2xl border border-[#E7EBF2] bg-white p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="text-xl font-semibold tracking-tight">{{ x.s_nama }}</h2>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="chipKelas[x.status]">{{ x.status }}</span>
            <span v-if="x.via === 'Manual'" class="rounded-full border border-[#B2DDFF] px-2.5 py-0.5 text-xs font-medium text-[#175CD3]">Manual</span>
          </div>
          <p class="mt-1.5 text-sm text-[#667085]">{{ x.id }} · {{ x.jenjang }}{{ x.jurusan ? ` · ${x.jurusan}` : '' }} · Daftar {{ fmtWaktuSpmb(x.waktu) }}{{ x.kelas ? ` · Kelas ${x.kelas} · NIS ${x.nis}` : '' }}</p>
          <p class="mt-0.5 text-sm text-[#667085]">
            <template v-if="x.via === 'Manual'">Pendaftaran manual — diinput {{ x.oleh || 'Admin TU' }} untuk wali yang datang langsung ke sekolah.</template>
            <template v-else>Pendaftaran online — data sesuai input orang tua/wali di formulir, tidak diubah admin.</template>
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="rounded-full px-3 py-1.5 text-xs font-medium" :class="langkahAktif === 0 ? 'bg-[#EFF8FF] text-[#175CD3]' : 'bg-[#F2F4F7] text-[#667085]'">Menunggu verifikasi</span>
          <span class="h-px w-4 bg-[#D0D5DD]" />
          <span class="rounded-full px-3 py-1.5 text-xs font-medium" :class="langkahAktif === 1 ? 'bg-[#EFF8FF] text-[#175CD3]' : 'bg-[#F2F4F7] text-[#667085]'">Pembayaran terverifikasi</span>
          <span class="h-px w-4 bg-[#D0D5DD]" />
          <span class="rounded-full px-3 py-1.5 text-xs font-medium" :class="langkahAktif === 2 ? 'bg-[#EFF8FF] text-[#175CD3]' : 'bg-[#F2F4F7] text-[#667085]'">Keputusan</span>
        </div>
      </div>
    </div>

    <div class="mt-4 grid items-start gap-4 xl:grid-cols-[1fr_360px]">
      <div class="space-y-4">
        <section class="rounded-2xl border border-[#E7EBF2] bg-white">
          <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Data Siswa</h3></div>
          <dl class="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 text-sm">
            <div><dt class="text-xs font-medium text-[#667085]">Nama lengkap siswa</dt><dd class="mt-0.5">{{ x.s_nama }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">NISN</dt><dd class="mt-0.5">{{ x.s_nisn }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Jenis kelamin</dt><dd class="mt-0.5">{{ x.s_jk }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Tempat lahir</dt><dd class="mt-0.5">{{ x.s_tempat || '-' }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Tanggal lahir</dt><dd class="mt-0.5">{{ fmtTanggalPanjang(x.s_tgl) }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">No. HP siswa</dt><dd class="mt-0.5">{{ x.s_hp || '-' }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Email aktif siswa</dt><dd class="mt-0.5">{{ x.s_email || '-' }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Nama sekolah asal</dt><dd class="mt-0.5">{{ x.s_sekolah }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Alamat sekolah asal</dt><dd class="mt-0.5">{{ x.s_alsekolah }}</dd></div>
            <div v-if="x.jurusan"><dt class="text-xs font-medium text-[#667085]">Pilihan jurusan</dt><dd class="mt-0.5">{{ x.jurusan }}</dd></div>
          </dl>
        </section>

        <section class="rounded-2xl border border-[#E7EBF2] bg-white">
          <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Informasi Orang Tua</h3></div>
          <dl class="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 text-sm">
            <div><dt class="text-xs font-medium text-[#667085]">Nama lengkap wali</dt><dd class="mt-0.5">{{ x.o_nama }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Hubungan dengan siswa</dt><dd class="mt-0.5">{{ x.o_hub }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">NIK</dt><dd class="mt-0.5">{{ samarNik(x.o_nik) }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">No. HP/WA wali</dt><dd class="mt-0.5">{{ x.o_hp }}</dd></div>
            <div>
              <dt class="text-xs font-medium text-[#667085]">Email aktif wali</dt>
              <dd class="mt-0.5">{{ x.o_email || '-' }}</dd>
              <p class="mt-0.5 text-xs text-[#667085]">Dipakai untuk seluruh notifikasi proses SPMB.</p>
            </div>
            <div><dt class="text-xs font-medium text-[#667085]">Tempat lahir wali</dt><dd class="mt-0.5">{{ x.o_tempat || '-' }}</dd></div>
            <div><dt class="text-xs font-medium text-[#667085]">Tanggal lahir wali</dt><dd class="mt-0.5">{{ fmtTanggalPanjang(x.o_tgl) }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-xs font-medium text-[#667085]">Alamat tinggal wali</dt><dd class="mt-0.5">{{ x.o_alamat }}</dd></div>
          </dl>
          <div class="flex flex-wrap gap-2 border-t border-[#EFF2F7] px-5 py-3.5">
            <a :href="waHref" target="_blank" rel="noopener" class="inline-flex min-h-10 items-center rounded-lg bg-[#027A48] px-4 text-sm font-medium text-white">Hubungi via WhatsApp</a>
            <a v-if="x.o_email && x.o_email !== '-'" :href="`mailto:${x.o_email}`" class="inline-flex min-h-10 items-center rounded-lg border border-[#D0D5DD] px-4 text-sm font-medium text-[#344054]">Kirim Email</a>
          </div>
        </section>
      </div>

      <div class="space-y-4">
        <section class="rounded-2xl border border-[#E7EBF2] bg-white">
          <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Pembayaran Formulir</h3></div>
          <div class="space-y-2.5 p-5 text-sm">
            <div class="flex justify-between"><span class="text-[#667085]">Biaya formulir</span><span class="font-medium">{{ SPMB_BIAYA }}</span></div>
            <div class="flex justify-between"><span class="text-[#667085]">Metode</span><span>{{ x.metode || '-' }}</span></div>
            <div>
              <span class="text-[#667085]">Bukti pembayaran</span>
              <div v-if="x.bukti && x.bukti !== '—'" class="mt-1.5 flex h-24 items-center justify-center rounded-lg border border-dashed border-[#D0D5DD] bg-[#F9FAFB] px-3 text-center text-xs text-[#667085]">{{ x.bukti }}</div>
              <p v-else-if="x.via === 'Manual'" class="mt-1 text-[#475467]">Dibayar tunai di sekolah — kwitansi diterbitkan panitia.</p>
              <p v-else class="mt-1 text-[#475467]">Bukti diunggah orang tua saat pendaftaran; berkas tersimpan penuh mulai fase database.</p>
            </div>
            <p class="text-xs text-[#667085]">Cocokkan bukti dengan mutasi rekening sekolah sebelum verifikasi.</p>
          </div>
        </section>

        <section class="rounded-2xl border border-[#E7EBF2] bg-white">
          <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Tindakan Panitia</h3></div>
          <div class="space-y-2 p-5">
            <button v-if="x.status === 'Menunggu verifikasi'" type="button" class="min-h-11 w-full rounded-lg bg-[#1B5FD9] text-sm font-medium text-white" @click="emit('status', x.id, 'Pembayaran terverifikasi')">Verifikasi Pembayaran</button>
            <template v-if="x.status === 'Pembayaran terverifikasi'">
              <button type="button" class="min-h-11 w-full rounded-lg bg-[#027A48] text-sm font-medium text-white" @click="emit('status', x.id, 'Diterima')">Terima Pendaftaran</button>
              <button type="button" class="min-h-11 w-full rounded-lg border border-[#FECDCA] text-sm font-medium text-[#B42318]" @click="emit('status', x.id, 'Ditolak')">Tolak Pendaftaran</button>
            </template>
            <p v-if="x.status === 'Diterima'" class="rounded-lg bg-[#ECFDF3] px-3 py-2.5 text-sm text-[#027A48]">Pendaftaran diterima. Penempatan kelas dilakukan di tab Penempatan Kelas.</p>
            <p v-if="x.status === 'Ditolak'" class="rounded-lg bg-[#FEF3F2] px-3 py-2.5 text-sm text-[#B42318]">Pendaftaran ditolak.</p>
            <button v-if="x.via === 'Manual'" type="button" class="min-h-11 w-full rounded-lg border border-[#D0D5DD] text-sm font-medium text-[#344054]" @click="emit('ubah', x.id)">Ubah Data</button>
            <button type="button" class="min-h-11 w-full rounded-lg border border-[#D0D5DD] text-sm font-medium text-[#B42318]" @click="emit('hapus', x.id)">Hapus (soft delete)</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
