<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SPMB_BIAYA, SPMB_JURUSAN_SMK, gabungTtl, genSpmbId, namaJenjangPenuh, validasiManual,
  type SpmbAdminRecord, type SpmbInputManual, type SpmbJenjangKey
} from '~/composables/useSpmbAdmin'

const props = defineProps<{
  jenjang: SpmbJenjangKey
  record: SpmbAdminRecord | null
  records: SpmbAdminRecord[]
}>()
const emit = defineEmits<{
  simpan: [record: SpmbAdminRecord, berkas?: File | null]
  batal: []
}>()

const f = reactive<SpmbInputManual & { bayar: 'sudah' | 'belum' }>({
  s_nama: props.record?.s_nama || '',
  s_nisn: props.record?.s_nisn || '',
  s_jk: props.record?.s_jk || 'Laki-laki',
  s_tempat: props.record?.s_tempat || '',
  s_tgl: props.record?.s_tgl || '',
  s_hp: props.record?.s_hp === '-' ? '' : (props.record?.s_hp || ''),
  s_email: props.record?.s_email === '-' ? '' : (props.record?.s_email || ''),
  s_sekolah: props.record?.s_sekolah || '',
  s_alsekolah: props.record?.s_alsekolah || '',
  jurusan: props.record?.jurusan || SPMB_JURUSAN_SMK[0],
  o_nama: props.record?.o_nama || '',
  o_hub: props.record?.o_hub || 'Ayah',
  o_nik: props.record?.o_nik || '',
  o_hp: props.record?.o_hp || '',
  o_email: props.record?.o_email === '-' ? '' : (props.record?.o_email || ''),
  o_tempat: props.record?.o_tempat || '',
  o_tgl: props.record?.o_tgl || '',
  o_alamat: props.record?.o_alamat || '',
  metode: props.record?.metode || 'Tunai di sekolah',
  bukti: props.record?.bukti && props.record.bukti !== '—' ? props.record.bukti : '',
  bayar: props.record?.status === 'Menunggu verifikasi' ? 'belum' : 'sudah'
})

const galat = ref('')
const nonTunai = computed(() => f.metode !== 'Tunai di sekolah')
const judul = computed(() => (props.record ? 'Ubah Pendaftaran Manual' : 'Tambah Pendaftaran Manual'))

const berkasBukti = ref<File | null>(null)
function onBukti(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    berkasBukti.value = input.files[0]
    f.bukti = input.files[0].name
  }
}

function angkaSaja(field: 's_nisn' | 'o_nik') {
  f[field] = f[field].replace(/\D/g, '')
}
function hpSaja(field: 's_hp' | 'o_hp') {
  let v = f[field].replace(/\D/g, '')
  if (v.startsWith('62')) v = `0${v.substring(2)}`
  f[field] = v
}

function simpan() {
  galat.value = validasiManual(f, props.jenjang, props.records, props.record?.id || '')
  if (galat.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const dasar: SpmbAdminRecord = props.record
    ? { ...props.record }
    : {
        id: genSpmbId(props.jenjang, new Set(props.records.map(r => r.id))),
        jenjang: namaJenjangPenuh(props.jenjang),
        jurusan: '', s_nama: '', s_nisn: '', s_jk: '', s_ttl: '', s_tempat: '', s_tgl: '',
        s_hp: '', s_email: '', s_sekolah: '', s_alsekolah: '',
        o_nama: '', o_hub: '', o_nik: '', o_hp: '', o_email: '', o_ttl: '', o_tempat: '', o_tgl: '', o_alamat: '',
        waktu: new Date().toISOString(), status: 'Menunggu verifikasi',
        via: 'Manual', oleh: 'Admin TU', metode: '', bukti: '', kelas: '', nis: '', deleted: false
      }
  dasar.jurusan = props.jenjang === 'SMK' ? f.jurusan : ''
  dasar.s_nama = f.s_nama.trim()
  dasar.s_nisn = f.s_nisn
  dasar.s_jk = f.s_jk
  dasar.s_tempat = f.s_tempat.trim()
  dasar.s_tgl = f.s_tgl
  dasar.s_ttl = gabungTtl(dasar.s_tempat, dasar.s_tgl)
  dasar.s_hp = f.s_hp || '-'
  dasar.s_email = f.s_email || '-'
  dasar.s_sekolah = f.s_sekolah.trim()
  dasar.s_alsekolah = f.s_alsekolah.trim()
  dasar.o_nama = f.o_nama.trim()
  dasar.o_hub = f.o_hub
  dasar.o_nik = f.o_nik
  dasar.o_hp = f.o_hp
  dasar.o_email = f.o_email || '-'
  dasar.o_tempat = f.o_tempat.trim()
  dasar.o_tgl = f.o_tgl
  dasar.o_ttl = gabungTtl(dasar.o_tempat, dasar.o_tgl)
  dasar.o_alamat = f.o_alamat.trim()
  dasar.metode = f.metode
  dasar.bukti = f.metode === 'Tunai di sekolah' ? '—' : f.bukti
  if (!props.record) dasar.status = f.bayar === 'sudah' ? 'Pembayaran terverifikasi' : 'Menunggu verifikasi'
  emit('simpan', dasar, berkasBukti.value)
}

const labelKelas = 'mb-1.5 block text-[13px] font-medium text-[#344054]'
const inputKelas = 'min-h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm outline-none focus:border-[#1B5FD9]'
</script>

<template>
  <div>
    <button type="button" class="inline-flex items-center gap-1.5 text-sm font-medium text-[#175CD3]" @click="emit('batal')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      Kembali ke daftar pendaftar
    </button>
    <h2 class="mt-3 text-xl font-semibold tracking-tight">{{ judul }}</h2>
    <p class="mt-1 text-sm text-[#667085]">Untuk wali yang mendaftar langsung ke sekolah. Data masuk ke daftar &amp; kuota yang sama dengan pendaftaran online.</p>

    <div v-if="galat" class="mt-4 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">{{ galat }}</div>

    <form class="mt-4 space-y-4" @submit.prevent="simpan">
      <section class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Data Siswa</h3></div>
        <div class="grid gap-4 p-5 sm:grid-cols-2">
          <label class="block"><span :class="labelKelas">Nama lengkap siswa <span class="text-[#B42318]">*</span></span><input v-model="f.s_nama" :class="inputKelas" type="text"></label>
          <label class="block"><span :class="labelKelas">NISN (10 digit) <span class="text-[#B42318]">*</span></span><input v-model="f.s_nisn" :class="inputKelas" type="text" inputmode="numeric" placeholder="Contoh: 0087654321" @input="angkaSaja('s_nisn')"></label>
          <label class="block"><span :class="labelKelas">Jenis kelamin <span class="text-[#B42318]">*</span></span><select v-model="f.s_jk" :class="inputKelas"><option>Laki-laki</option><option>Perempuan</option></select></label>
          <label v-if="jenjang === 'SMK'" class="block"><span :class="labelKelas">Pilihan jurusan <span class="text-[#B42318]">*</span></span><select v-model="f.jurusan" :class="inputKelas"><option v-for="j in SPMB_JURUSAN_SMK" :key="j">{{ j }}</option></select></label>
          <label class="block"><span :class="labelKelas">Tempat lahir <span class="text-[#B42318]">*</span></span><input v-model="f.s_tempat" :class="inputKelas" type="text"></label>
          <label class="block"><span :class="labelKelas">Tanggal lahir <span class="text-[#B42318]">*</span></span><input v-model="f.s_tgl" :class="inputKelas" type="date"></label>
          <label class="block"><span :class="labelKelas">No. HP siswa</span><input v-model="f.s_hp" :class="inputKelas" type="text" inputmode="numeric" @input="hpSaja('s_hp')"></label>
          <label class="block"><span :class="labelKelas">Email aktif siswa</span><input v-model="f.s_email" :class="inputKelas" type="email"></label>
          <label class="block"><span :class="labelKelas">Nama sekolah asal <span class="text-[#B42318]">*</span></span><input v-model="f.s_sekolah" :class="inputKelas" type="text"></label>
          <label class="block"><span :class="labelKelas">Alamat sekolah asal <span class="text-[#B42318]">*</span></span><input v-model="f.s_alsekolah" :class="inputKelas" type="text"></label>
        </div>
      </section>

      <section class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Informasi Orang Tua</h3></div>
        <div class="grid gap-4 p-5 sm:grid-cols-2">
          <label class="block"><span :class="labelKelas">Nama lengkap wali <span class="text-[#B42318]">*</span></span><input v-model="f.o_nama" :class="inputKelas" type="text"></label>
          <label class="block"><span :class="labelKelas">Hubungan dengan siswa <span class="text-[#B42318]">*</span></span><select v-model="f.o_hub" :class="inputKelas"><option>Ayah</option><option>Ibu</option><option>Wali</option></select></label>
          <label class="block"><span :class="labelKelas">NIK (16 digit) <span class="text-[#B42318]">*</span></span><input v-model="f.o_nik" :class="inputKelas" type="text" inputmode="numeric" @input="angkaSaja('o_nik')"></label>
          <label class="block"><span :class="labelKelas">No. HP/WA wali <span class="text-[#B42318]">*</span></span><input v-model="f.o_hp" :class="inputKelas" type="text" inputmode="numeric" @input="hpSaja('o_hp')"></label>
          <label class="block"><span :class="labelKelas">Tempat lahir <span class="text-[#B42318]">*</span></span><input v-model="f.o_tempat" :class="inputKelas" type="text"></label>
          <label class="block"><span :class="labelKelas">Tanggal lahir <span class="text-[#B42318]">*</span></span><input v-model="f.o_tgl" :class="inputKelas" type="date"></label>
          <label class="block"><span :class="labelKelas">Email aktif wali</span><input v-model="f.o_email" :class="inputKelas" type="email"></label>
          <label class="block"><span :class="labelKelas">Alamat tinggal wali <span class="text-[#B42318]">*</span></span><textarea v-model="f.o_alamat" :class="`${inputKelas} py-2.5`" rows="2" /></label>
        </div>
      </section>

      <section class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="border-b border-[#EFF2F7] px-5 py-3.5"><h3 class="font-semibold">Pembayaran Formulir · {{ SPMB_BIAYA }}</h3></div>
        <div class="grid gap-4 p-5 sm:grid-cols-2">
          <label class="block"><span :class="labelKelas">Metode pembayaran</span>
            <select v-model="f.metode" :class="inputKelas"><option>Tunai di sekolah</option><option>Transfer BSI</option><option>QRIS</option></select></label>
          <label class="block"><span :class="labelKelas">Status pembayaran</span>
            <select v-model="f.bayar" :class="inputKelas"><option value="sudah">Sudah dibayar</option><option value="belum">Belum dibayar</option></select></label>
          <label class="block sm:col-span-2"><span :class="labelKelas">Bukti pembayaran <span v-if="nonTunai" class="text-[#B42318]">*</span></span>
            <input :class="`${inputKelas} py-2.5`" type="file" accept="image/*,.pdf" @change="onBukti">
            <span class="mt-1 block text-xs text-[#667085]">Untuk tunai di sekolah, kwitansi diterbitkan panitia. Untuk Transfer BSI / QRIS, bukti wajib diupload.{{ f.bukti ? ` Berkas saat ini: ${f.bukti}` : '' }}</span></label>
        </div>
      </section>

      <div class="flex flex-wrap gap-2">
        <button type="submit" class="min-h-11 rounded-lg bg-[#1B5FD9] px-5 text-sm font-medium text-white">Simpan Pendaftaran</button>
        <button type="button" class="min-h-11 rounded-lg border border-[#D0D5DD] bg-white px-5 text-sm font-medium text-[#344054]" @click="emit('batal')">Batal</button>
      </div>
    </form>
  </div>
</template>
