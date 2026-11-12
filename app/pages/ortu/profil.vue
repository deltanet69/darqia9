<template>
  <div class="flex flex-col gap-5">
    <h1 class="text-[22px] font-extrabold leading-tight text-merek-900">Profil</h1>

    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Data siswa</h2>
      <dl class="mt-3 flex flex-col divide-y divide-[#E3EAF7] text-[13.5px]">
        <div v-for="row in dataSiswa" :key="row.label" class="flex justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-[#4B5B78]">{{ row.label }}</dt>
          <dd class="text-right font-semibold">{{ row.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Data orang tua</h2>
      <div v-for="ot in dataOrtu" :key="ot.judul" class="mt-3">
        <p class="text-[12px] font-bold uppercase tracking-wide text-merek-600">{{ ot.judul }}</p>
        <dl class="mt-1 flex flex-col divide-y divide-[#E3EAF7] text-[13.5px]">
          <div v-for="row in ot.baris" :key="row.label" class="flex justify-between gap-4 py-2.5">
            <dt class="shrink-0 text-[#4B5B78]">{{ row.label }}</dt>
            <dd class="text-right font-semibold">{{ row.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Alamat</h2>
      <dl class="mt-3 flex flex-col divide-y divide-[#E3EAF7] text-[13.5px]">
        <div v-for="row in dataAlamat" :key="row.label" class="flex justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-[#4B5B78]">{{ row.label }}</dt>
          <dd class="text-right font-semibold">{{ row.value }}</dd>
        </div>
      </dl>
      <p class="mt-3 text-[12px] text-[#4B5B78]">Perubahan data hubungi Tata Usaha.</p>
    </section>

    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-[15px] font-extrabold text-merek-900">Pengaturan</h2>
      <div class="mt-3 flex flex-col gap-2.5">
        <button type="button" disabled class="flex min-h-[48px] items-center justify-between rounded-2xl border border-[#E3EAF7] px-4 text-left text-[14px] font-semibold text-[#7A8AA6]">
          Ganti kata sandi
          <span class="text-[12px] font-medium">Menyusul</span>
        </button>
        <button type="button" class="min-h-[48px] rounded-2xl bg-rose-600 text-[14px] font-extrabold text-white" @click="keluar">
          Keluar
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ORTU_DUMMY } from '~/utils/ortu-dummy'

definePageMeta({ layout: 'ortu', middleware: 'ortu-sesi' })
useHead({ title: 'Profil · Portal Orang Tua', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const sesi = useState<{ nis: string; jenjang: 'SMK' | 'SMP' } | null>('ortu-sesi', () => null)

const tanggalIndo = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

// Data sensitif (NIK, No. KK, penghasilan) sengaja tidak ada di sini
const s = ORTU_DUMMY.siswa
const dataSiswa = [
  { label: 'Nama', value: s.nama },
  { label: 'NIS', value: s.nis },
  { label: 'NISN', value: s.nisn },
  { label: 'Kelas', value: s.kelas },
  { label: 'Tempat, tanggal lahir', value: `${s.tempatLahir}, ${tanggalIndo(s.tanggalLahir)}` },
  { label: 'Agama', value: s.agama },
  { label: 'Angkatan', value: s.angkatan },
  { label: 'Tanggal masuk', value: tanggalIndo(s.tanggalMasuk) },
  { label: 'Status', value: s.status }
]

// No. HP disamarkan sebagian: 0812 •••• 4471
const samarkan = (hp: string) => `${hp.slice(0, 4)} •••• ${hp.slice(-4)}`

const dataOrtu = [
  {
    judul: 'Ayah',
    baris: [
      { label: 'Nama', value: ORTU_DUMMY.ortu.ayah.nama },
      { label: 'Pendidikan terakhir', value: ORTU_DUMMY.ortu.ayah.pendidikan },
      { label: 'Pekerjaan', value: ORTU_DUMMY.ortu.ayah.pekerjaan },
      { label: 'No. HP', value: samarkan(ORTU_DUMMY.ortu.ayah.hp) }
    ]
  },
  {
    judul: 'Ibu',
    baris: [
      { label: 'Nama', value: ORTU_DUMMY.ortu.ibu.nama },
      { label: 'Pendidikan terakhir', value: ORTU_DUMMY.ortu.ibu.pendidikan },
      { label: 'Pekerjaan', value: ORTU_DUMMY.ortu.ibu.pekerjaan },
      { label: 'No. HP', value: samarkan(ORTU_DUMMY.ortu.ibu.hp) }
    ]
  }
]

const a = ORTU_DUMMY.alamat
const dataAlamat = [
  { label: 'RT / RW', value: a.rtRw },
  { label: 'Desa', value: a.desa },
  { label: 'Kecamatan', value: a.kecamatan },
  { label: 'Kota', value: a.kota },
  { label: 'Jenis tinggal', value: a.jenisTinggal },
  { label: 'Transportasi', value: a.transportasi },
  { label: 'Jarak ke sekolah', value: a.jarak }
]

function keluar() {
  sesi.value = null
  navigateTo('/ortu')
}
</script>
