<template>
  <div class="flex flex-col gap-5">
    <section>
      <p class="text-[13px] font-semibold text-[#4B5B78]">{{ tanggal }} · {{ jam }}</p>
      <h1 class="mt-1 text-[22px] font-extrabold leading-tight text-merek-900">Assalamu'alaikum, {{ sapaan }}</h1>
    </section>

    <!-- Kartu siswa -->
    <section class="rounded-3xl bg-merek-900 p-5 text-white">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-lg font-extrabold">{{ siswa.nama }}</p>
          <p class="mt-0.5 text-[13px] text-white/75">NIS {{ siswa.nis }} · {{ siswa.kelas }}</p>
        </div>
        <span class="shrink-0 rounded-full bg-[#F0B429]/20 px-2.5 py-1 text-[11px] font-bold text-[#F0B429]">{{ siswa.status }}</span>
      </div>
      <dl class="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <dt class="text-white/60">Wali kelas</dt>
          <dd class="font-semibold">{{ siswa.waliKelas }}</dd>
        </div>
        <div>
          <dt class="text-white/60">Tahun ajaran</dt>
          <dd class="font-semibold">{{ siswa.tahunAjaran }}</dd>
        </div>
      </dl>
    </section>

    <!-- Kehadiran hari ini: menunggu tabel tap RFID -->
    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Kehadiran hari ini</h2>
      <p class="mt-2 text-[13px] text-[#4B5B78]">Data tap kartu belum tersedia.</p>
    </section>

    <!-- Tiga ringkasan -->
    <section class="grid grid-cols-3 gap-2.5">
      <NuxtLink to="/ortu/akademik?tab=kehadiran" class="flex min-h-[96px] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm">
        <span class="text-[11px] font-semibold text-[#4B5B78]">Kehadiran</span>
        <span class="text-xl font-extrabold text-merek-900">{{ ringkasan.kehadiranPersen }}%</span>
      </NuxtLink>
      <NuxtLink to="/ortu/ujian" class="flex min-h-[96px] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm">
        <span class="text-[11px] font-semibold text-[#4B5B78]">Rata-rata ujian</span>
        <span class="text-xl font-extrabold text-merek-900">{{ ringkasan.rataNilaiUjian.toLocaleString('id-ID') }}</span>
      </NuxtLink>
      <NuxtLink to="/ortu/administrasi" class="flex min-h-[96px] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm">
        <span class="text-[11px] font-semibold text-[#4B5B78]">Sisa tagihan</span>
        <span class="text-[15px] font-extrabold leading-tight text-merek-900">{{ rupiah(ringkasan.sisaTagihan) }}</span>
      </NuxtLink>
    </section>

    <!-- Ujian terdekat -->
    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Ujian terdekat</h2>
      <p class="mt-2 text-[15px] font-bold">{{ ujian.jenis }}</p>
      <p class="text-[13px] text-[#4B5B78]">{{ tanggalUjian }}</p>
      <p class="mt-2 text-[13px] font-semibold text-merek-600">{{ hitungMundur }}</p>
    </section>

    <!-- Jadwal hari ini -->
    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Jadwal hari ini</h2>
      <ul v-if="jadwal.length" class="mt-3 flex flex-col divide-y divide-[#E3EAF7]">
        <li v-for="item in jadwal" :key="item.mulai" class="flex items-center gap-3 py-3">
          <span class="w-[92px] shrink-0 text-[12.5px] font-bold text-[#4B5B78]">{{ item.mulai }} – {{ item.selesai }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[14px] font-semibold">{{ item.mapel }}</p>
            <p v-if="item.guru" class="truncate text-[12px] text-[#4B5B78]">{{ item.guru }}</p>
          </div>
          <span :class="statusJadwal(item) === 'Berlangsung' ? 'bg-merek-600 text-white' : 'bg-[#EEF3FB] text-[#4B5B78]'" class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold">{{ statusJadwal(item) }}</span>
        </li>
      </ul>
      <p v-else class="mt-2 text-[13px] text-[#4B5B78]">Tidak ada jadwal pelajaran hari ini.</p>
    </section>

    <!-- Aktivitas terbaru -->
    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-[15px] font-extrabold text-merek-900">Aktivitas terbaru</h2>
        <NuxtLink to="/ortu/notifikasi" class="flex min-h-[44px] items-center text-[13px] font-bold text-merek-600">Lihat semua</NuxtLink>
      </div>
      <ul class="mt-2 flex flex-col divide-y divide-[#E3EAF7]">
        <li v-for="(item, i) in aktivitas" :key="i" class="py-3">
          <p class="text-[13.5px] font-semibold">{{ item.judul }}</p>
          <p class="mt-0.5 text-[12px] text-[#4B5B78]">{{ item.waktu }} · {{ item.jenis }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ORTU_DUMMY } from '~/utils/ortu-dummy'

definePageMeta({ layout: 'ortu', middleware: 'ortu-sesi' })
useHead({ title: 'Beranda · Portal Orang Tua', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const siswa = ORTU_DUMMY.siswa
const ringkasan = ORTU_DUMMY.ringkasan
const ujian = ORTU_DUMMY.ujianTerdekat
const ortu = ORTU_DUMMY.ortu

const sekarang = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (sekarang.value = new Date()), 60_000)
})
onBeforeUnmount(() => clearInterval(timer))

// Sapaan memakai ayah; bila kosong pakai ibu; bila keduanya kosong cukup "Bapak/Ibu"
const sapaan = computed(() => {
  if (ortu.ayah.nama) return `Bapak ${ortu.ayah.nama}`
  if (ortu.ibu.nama) return `Ibu ${ortu.ibu.nama}`
  return 'Bapak/Ibu'
})

const tanggal = computed(() =>
  sekarang.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)
const jam = computed(() => {
  const d = sekarang.value
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
})

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

const tanggalUjian = computed(() =>
  new Date(`${ujian.tanggal}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)
const hitungMundur = computed(() => {
  const hari = Math.ceil((new Date(`${ujian.tanggal}T00:00:00`).getTime() - sekarang.value.getTime()) / 86_400_000)
  if (hari > 1) return `${hari} hari lagi`
  if (hari === 1) return 'Besok'
  return 'Hari ini'
})

// Jadwal hanya untuk hari Jumat (hari 5) sesuai data contoh
const jadwal = computed(() => (sekarang.value.getDay() === 5 ? ORTU_DUMMY.jadwalJumat : []))
const statusJadwal = (item: { mulai: string; selesai: string }) => {
  const menit = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5))
  const now = sekarang.value.getHours() * 60 + sekarang.value.getMinutes()
  if (now < menit(item.mulai)) return 'Nanti'
  if (now < menit(item.selesai)) return 'Berlangsung'
  return 'Selesai'
}

const labelHari = ['Hari ini', 'Kemarin']
const aktivitas = computed(() =>
  ORTU_DUMMY.aktivitas.slice(0, 5).map((a) => ({
    judul: a.judul,
    jenis: a.jenis,
    waktu: labelHari[a.hariLalu] ?? `${a.hariLalu} hari lalu`
  }))
)
</script>
