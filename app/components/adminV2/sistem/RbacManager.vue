<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRbac } from '~/composables/useRbac'
import RbacIzinModul from './RbacIzinModul.vue'
import {
  RBAC_DAUN, hitungIzinRinci, izinKosong, penugasanDari,
  type CakupanPeran, type IzinPeran, type JenjangRbac
} from '~/composables/rbacCore'

const rbac = useRbac()
const state = rbac.state
onMounted(() => rbac.muat())

const pesan = ref('')
const pesanGalat = ref(false)
const kabar = (teks: string, galat = false) => { pesan.value = teks; pesanGalat.value = galat }

// ===== Pilihan peran + draf matriks izin =====
const aktifId = ref('')
const peranAktif = computed(() => state.value.peran.find(r => r.id === aktifId.value) || null)
const draf = ref<IzinPeran>(izinKosong())
const drafCakupan = ref<CakupanPeran>({})

const muatDraf = () => {
  const tersimpan = peranAktif.value ? state.value.izin[peranAktif.value.id] : null
  draf.value = JSON.parse(JSON.stringify(tersimpan || izinKosong()))
  drafCakupan.value = { ...((peranAktif.value ? state.value.cakupan[peranAktif.value.id] : null) || {}) }
}
const pilihAwal = () => {
  const awal = state.value.peran.find(r => r.kunci === 'operator') || state.value.peran[0]
  if (awal) aktifId.value = awal.id
}
watch(() => state.value.termuat, selesai => { if (selesai && !aktifId.value) pilihAwal() })
// Kunjungan ulang: state bersama sudah termuat dari halaman sebelumnya,
// watch di atas tidak akan menyala lagi — pilih peran awal di sini juga.
onMounted(() => { if (state.value.termuat && !aktifId.value) pilihAwal() })
watch(aktifId, () => { muatDraf(); modeForm.value = null; konfirmasiHapus.value = false })

// Draf yang belum diedit ikut data terbaru dari database (muat awal / admin lain mengubah izin).
// Hanya baris yang dicentang di layar (sub-modul / modul tanpa sub-menu); baris modul utama dihitung saat simpan.
const jsonDaun = (izin: IzinPeran | null | undefined) => JSON.stringify(RBAC_DAUN.map(k => izin?.[k] || null))
const jsonCakupan = (c: CakupanPeran | null | undefined) => JSON.stringify(Object.entries(c || {}).filter(([, v]) => v === 'sendiri').sort())
const tersimpanJson = () => peranAktif.value
  ? jsonDaun(state.value.izin[peranAktif.value.id]) + jsonCakupan(state.value.cakupan[peranAktif.value.id])
  : ''
const drafJson = () => jsonDaun(draf.value) + jsonCakupan(drafCakupan.value)
watch(tersimpanJson, (baru, lama) => { if (drafJson() === lama) muatDraf() })

const jumlahDraf = computed(() => hitungIzinRinci(draf.value))
const kotor = computed(() => !!peranAktif.value && drafJson() !== tersimpanJson())

const simpanIzin = async () => {
  if (!peranAktif.value) return
  if (Object.values(drafCakupan.value).includes('sendiri') && !state.value.cakupanSiap) {
    kabar('Cakupan data belum bisa disimpan: jalankan migrasi 0063_rbac_submodul_cakupan.sql di Supabase SQL Editor dulu.', true)
    return
  }
  const galat = await rbac.simpanIzin(peranAktif.value.id, draf.value, drafCakupan.value)
  kabar(galat || `Izin ${peranAktif.value.nama} tersimpan.`, !!galat)
}
const batalkanIzin = () => { muatDraf(); kabar('Perubahan izin dibatalkan.') }

// ===== CRUD peran =====
const modeForm = ref<'baru' | 'ubah' | null>(null)
const fNama = ref('')
const fDesc = ref('')
const konfirmasiHapus = ref(false)

const bukaBaru = () => { modeForm.value = 'baru'; fNama.value = ''; fDesc.value = '' }
const bukaUbah = () => {
  if (!peranAktif.value) return
  modeForm.value = 'ubah'; fNama.value = peranAktif.value.nama; fDesc.value = peranAktif.value.deskripsi
}
const simpanPeran = async () => {
  const nama = fNama.value.trim()
  if (!nama) { kabar('Nama peran wajib diisi.', true); return }
  if (modeForm.value === 'baru') {
    const galat = await rbac.tambahPeran(nama, fDesc.value.trim())
    if (galat) { kabar(galat, true); return }
    const baru = state.value.peran[state.value.peran.length - 1]
    if (baru) aktifId.value = baru.id
    kabar(`Peran ${nama} dibuat. Atur pengguna dan izinnya di bawah.`)
  } else if (peranAktif.value) {
    const galat = await rbac.ubahPeran(peranAktif.value.id, nama, fDesc.value.trim())
    if (galat) { kabar(galat, true); return }
    kabar('Peran diperbarui.')
  }
  modeForm.value = null
}
const hapusPeran = async () => {
  if (!peranAktif.value) return
  if (!konfirmasiHapus.value) { konfirmasiHapus.value = true; return }
  const galat = await rbac.hapusPeran(peranAktif.value.id)
  if (galat) { kabar(galat, true); konfirmasiHapus.value = false; return }
  kabar('Peran dihapus.')
  konfirmasiHapus.value = false
  aktifId.value = state.value.peran[0]?.id || ''
}

// ===== Penugasan pengguna (satu pengguna = satu peran) =====
const anggota = computed(() => state.value.penugasan.filter(p => p.peranId === aktifId.value))
// Anggota dari data guru yang record-nya belum tertaut akun login mana pun.
const tanpaAkun = (subjekId: string) => {
  const k = state.value.kandidat.find(x => x.subjekId === subjekId)
  return !!k && !k.punyaAkun
}
const pilihanSubjek = ref('')
const namaManual = ref('')
const jenjangPilihan = ref<JenjangRbac[]>(['SMK', 'SMP'])

const subjekTerpilih = computed(() => {
  const manual = namaManual.value.trim()
  if (manual) return { subjekId: 'manual:' + manual.toLowerCase().replace(/\s+/g, '-'), nama: manual }
  const kandidat = state.value.kandidat.find(k => k.subjekId === pilihanSubjek.value)
  return kandidat ? { subjekId: kandidat.subjekId, nama: kandidat.nama } : null
})
const peringatanPindah = computed(() => {
  const subjek = subjekTerpilih.value
  if (!subjek) return ''
  const sekarang = penugasanDari(state.value.penugasan, subjek.subjekId)
  if (!sekarang || sekarang.peranId === aktifId.value) return ''
  const peranLama = state.value.peran.find(r => r.id === sekarang.peranId)
  return `${subjek.nama} saat ini berperan sebagai ${peranLama?.nama || 'peran lain'} — menugaskan di sini akan memindahkannya, karena satu pengguna hanya memegang satu peran.`
})
// Deteksi dari data guru: yang dipilih belum tertaut akun login mana pun,
// artinya belum terdaftar di Manajemen Pengguna.
const peringatanBelumTerdaftar = computed(() => {
  const subjek = subjekTerpilih.value
  if (!subjek || subjek.subjekId.startsWith('manual:')) return ''
  const kandidat = state.value.kandidat.find(k => k.subjekId === subjek.subjekId)
  if (!kandidat || kandidat.punyaAkun) return ''
  return `${subjek.nama} belum terdaftar di Manajemen Pengguna (belum punya akun login). Peran tetap dapat ditugaskan sekarang, tetapi ia belum bisa masuk portal — daftarkan akunnya lewat Manajemen Pengguna → Impor dari Guru.`
})
const alertAkun = ref('')
watch(aktifId, () => { alertAkun.value = '' })
watch(pilihanSubjek, id => {
  const kandidat = state.value.kandidat.find(k => k.subjekId === id)
  if (!kandidat) return
  if (kandidat.keterangan.includes('SMK')) jenjangPilihan.value = ['SMK']
  else if (kandidat.keterangan.includes('SMP')) jenjangPilihan.value = ['SMP']
  else jenjangPilihan.value = ['SMK', 'SMP']
})
const tugaskan = async () => {
  const subjek = subjekTerpilih.value
  if (!subjek || !peranAktif.value) { kabar('Pilih pengguna dari daftar atau isi nama manual dulu.', true); return }
  const galat = await rbac.tugaskan(subjek.subjekId, subjek.nama, peranAktif.value.id, [...jenjangPilihan.value])
  if (galat) { kabar(galat, true); return }
  kabar(`${subjek.nama} ditugaskan sebagai ${peranAktif.value.nama} (${jenjangPilihan.value.join(' + ')}).`)
  alertAkun.value = tanpaAkun(subjek.subjekId)
    ? `${subjek.nama} belum terdaftar di Manajemen Pengguna (belum punya akun login), jadi ia belum bisa masuk portal. Harap daftarkan akunnya dulu.`
    : ''
  pilihanSubjek.value = ''
  namaManual.value = ''
}
const lepaskan = async (subjekId: string, nama: string) => {
  alertAkun.value = ''
  const galat = await rbac.lepaskan(subjekId)
  kabar(galat || `${nama} dilepaskan dari peran ${peranAktif.value?.nama}.`, !!galat)
}

// ===== Tugaskan akun yang sedang login (mis. pemilik sebagai Superadmin) =====
const sudahDiPeranIni = computed(() => !!state.value.subjekSaya && anggota.value.some(a => a.subjekId === state.value.subjekSaya))
const peringatanSaya = computed(() => {
  const sekarang = rbac.penugasanSaya.value
  if (!sekarang || sekarang.peranId === aktifId.value) return ''
  const peranLama = state.value.peran.find(r => r.id === sekarang.peranId)
  return `Akun Anda saat ini berperan sebagai ${peranLama?.nama || 'peran lain'} — menugaskannya di sini akan memindahkannya.`
})
const tugaskanSaya = async () => {
  if (!state.value.subjekSaya || !peranAktif.value) { kabar('Akun login tidak terbaca — muat ulang halaman ini.', true); return }
  const galat = await rbac.tugaskan(state.value.subjekSaya, state.value.namaSaya || 'Akun saya', peranAktif.value.id, [...jenjangPilihan.value])
  kabar(galat || `Akun Anda ditugaskan sebagai ${peranAktif.value.nama} (${jenjangPilihan.value.join(' + ')}).`, !!galat)
}

const bolehKelola = computed(() => rbac.bisaSaya('Hak Akses (RBAC)', 'ubah'))
const terkunci = computed(() => !!peranAktif.value?.terkunci)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start gap-3">
      <div class="min-w-0">
        <h1 class="text-[22px] leading-7 font-semibold text-blue-950">Hak Akses — Siapa Bisa Apa</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">Pilih peran dari daftar, atur penggunanya, lalu centang izinnya per modul. Peran bisa ditambah, diubah, dan dihapus mengikuti struktur sekolah.</p>
      </div>
    </div>

    <div v-if="state.termuat && !state.tabelSiap" class="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-[13px]">
      Tabel RBAC belum tersedia. Jalankan migrasi <span class="font-medium">0023_rbac.sql</span> di Supabase SQL Editor — sementara itu halaman berjalan dengan data awal lokal dan perubahan belum tersimpan ke database.
    </div>
    <div v-if="pesan" class="mt-4 rounded-xl px-4 py-3 text-[13px]" :class="pesanGalat ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'">{{ pesan }}</div>
    <div v-if="alertAkun" class="mt-3 flex items-start justify-between gap-3 rounded-xl border border-[#FEDF89] bg-[#FFFAEB] px-4 py-3 text-[13px] text-[#B54708]" role="alert">
      <p><strong>Pengguna belum terdaftar.</strong> {{ alertAkun }} <NuxtLink to="/adminV2/users" class="font-bold underline">Buka Manajemen Pengguna</NuxtLink></p>
      <button type="button" class="shrink-0 font-bold opacity-70 hover:opacity-100" aria-label="Tutup peringatan" @click="alertAkun = ''">✕</button>
    </div>
    <div v-if="rbac.penegakanAktif.value && !bolehKelola" class="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-[13px]">
      Peran Anda ({{ rbac.peranSaya.value?.nama }}) hanya boleh melihat halaman ini — tombol pengelolaan dinonaktifkan sesuai izin yang diberikan.
    </div>

    <div v-if="modeForm" class="mt-5 bg-white border border-blue-200 rounded-xl p-5">
      <p class="text-[15px] font-semibold text-blue-950">{{ modeForm === 'baru' ? 'Peran Baru' : `Ubah Peran — ${peranAktif?.nama}` }}</p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="text-[12px] font-medium text-slate-500">Nama peran</span>
          <input v-model="fNama" type="text" placeholder="mis. Koordinator BK" class="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-blue-600">
        </label>
        <label class="block">
          <span class="text-[12px] font-medium text-slate-500">Deskripsi singkat</span>
          <input v-model="fDesc" type="text" placeholder="Satu kalimat tugas peran ini" class="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-blue-600">
        </label>
      </div>
      <div class="mt-4 flex gap-2">
        <button class="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg px-4 py-2 transition" @click="simpanPeran">Simpan Peran</button>
        <button class="text-[13px] font-medium text-slate-500 border border-slate-300 rounded-lg px-4 py-2 transition hover:bg-slate-50" @click="modeForm = null">Batal</button>
      </div>
    </div>

    <div class="mt-5 bg-white border border-slate-200 rounded-xl px-4 py-4 sm:px-5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label for="rbac-peran" class="text-[12.5px] text-slate-500">Peran</label>
        <select id="rbac-peran" v-model="aktifId" class="min-w-0 flex-1 sm:max-w-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-600">
          <option v-for="r in state.peran" :key="r.id" :value="r.id">{{ r.nama }}{{ r.terkunci ? ' — Terkunci' : '' }}</option>
        </select>
        <span class="inline-block text-[11px] font-semibold rounded px-2 py-1 bg-slate-100 text-slate-600">{{ jumlahDraf }} dari {{ RBAC_DAUN.length * 4 }} izin aktif</span>
        <span class="ml-auto flex items-center gap-3">
          <button :disabled="!bolehKelola" class="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition disabled:opacity-50" @click="bukaBaru">+ Peran Baru</button>
          <span v-if="!terkunci" class="flex items-center gap-3">
            <button :disabled="!bolehKelola" class="text-[12.5px] font-medium text-blue-700 transition hover:text-blue-800 disabled:opacity-50" @click="bukaUbah">Ubah</button>
            <button :disabled="!bolehKelola" class="text-[12.5px] font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50" @click="hapusPeran">{{ konfirmasiHapus ? 'Klik lagi untuk hapus' : 'Hapus' }}</button>
          </span>
        </span>
      </div>
      <p class="mt-2.5 text-[13px] text-slate-500">{{ peranAktif?.deskripsi }}</p>

      <div class="mt-4 border-t border-slate-100 pt-4">
        <p class="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">Pengguna dalam peran ini</p>
        <div class="mt-2.5 flex flex-wrap gap-2">
          <span v-for="a in anggota" :key="a.subjekId" class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1.5 text-[11.5px]">
            <span class="font-medium text-slate-700">{{ a.nama }}</span>
            <span v-for="j in a.jenjang" :key="j" class="rounded px-1 py-px text-[9.5px] font-bold" :class="j === 'SMK' ? 'bg-[#EFF4FF] text-[#1B5FD9]' : 'bg-[#E7F6ED] text-[#166534]'">{{ j }}</span>
            <span v-if="tanpaAkun(a.subjekId)" class="rounded bg-[#FFFAEB] px-1 py-px text-[9.5px] font-bold text-[#B54708]" title="Guru ini belum memiliki akun login — buatkan lewat Manajemen Pengguna (Impor dari Guru)">belum punya akun</span>
            <button v-if="bolehKelola" class="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition hover:text-red-600" title="Lepaskan dari peran ini" @click="lepaskan(a.subjekId, a.nama)">&times;</button>
          </span>
          <span v-if="!anggota.length" class="text-[12.5px] text-slate-400">Belum ada pengguna — tugaskan dari daftar di bawah.</span>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <select v-model="pilihanSubjek" class="min-w-0 flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-2.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-600 sm:max-w-xs">
            <option value="">Pilih guru / staff…</option>
            <option v-for="k in state.kandidat" :key="k.subjekId" :value="k.subjekId">{{ k.nama }} — {{ k.keterangan }}</option>
          </select>
          <input v-model="namaManual" type="text" placeholder="atau ketik nama lain (yayasan, kepsek…)" class="min-w-0 flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-[12.5px] outline-none focus:border-blue-600 sm:max-w-xs">
          <span class="flex items-center gap-2 text-[12.5px] text-slate-600">
            <label class="flex items-center gap-1.5"><input v-model="jenjangPilihan" type="checkbox" value="SMK" class="h-4 w-4 accent-blue-600"> SMK</label>
            <label class="flex items-center gap-1.5"><input v-model="jenjangPilihan" type="checkbox" value="SMP" class="h-4 w-4 accent-blue-600"> SMP</label>
          </span>
          <button :disabled="!bolehKelola" class="text-[12.5px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-2 transition disabled:opacity-50" @click="tugaskan">+ Tugaskan</button>
          <button v-if="state.subjekSaya && !sudahDiPeranIni" :disabled="!bolehKelola" class="text-[12.5px] font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-2 transition disabled:opacity-50" @click="tugaskanSaya">Tugaskan akun saya</button>
        </div>
        <p v-if="peringatanPindah" class="mt-2 text-[12px] text-amber-700">{{ peringatanPindah }}</p>
        <p v-if="peringatanBelumTerdaftar" class="mt-2 text-[12px] font-medium text-[#B54708]">{{ peringatanBelumTerdaftar }}</p>
        <p v-if="peringatanSaya" class="mt-2 text-[12px] text-amber-700">{{ peringatanSaya }}</p>
        <p v-if="terkunci" class="mt-2 text-[12px] text-slate-400">Nama dan izin peran Superadmin terkunci — tetapi penggunanya tetap bisa ditugaskan dan dilepaskan di sini.</p>
        <p class="mt-2 text-[12px] text-slate-400">Satu pengguna hanya memegang satu peran. Centang jenjang menentukan di jenjang mana peran ini berlaku — guru yang hanya mengajar di SMK cukup dicentang SMK.</p>
      </div>
    </div>

    <RbacIzinModul v-model:izin="draf" v-model:cakupan="drafCakupan" :nonaktif="terkunci || !bolehKelola" />

    <div class="mt-3 bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12px] text-slate-500">
      <span><span class="font-medium text-slate-700">Penugasan & peran:</span> langsung tersimpan saat ditambahkan</span>
      <span><span class="font-medium text-slate-700">Matriks izin:</span> tersimpan lewat tombol Simpan Izin</span>
      <span><span class="font-medium text-slate-700">Penegakan:</span> menu, rute, dan sub-menu disaring sesuai peran + jenjang pengguna</span>
    </div>

    <div class="fixed inset-x-0 bottom-0 bg-white border-t border-slate-200 z-30">
      <div class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p class="text-[12.5px]" :class="kotor ? 'font-medium text-amber-700' : 'text-slate-500'">{{ kotor ? 'Ada perubahan izin belum disimpan.' : 'Tidak ada perubahan izin.' }}</p>
        <div class="ml-auto flex gap-2">
          <button class="text-[13px] font-medium text-slate-600 border border-slate-300 rounded-lg px-4 py-2 transition hover:bg-slate-50" @click="batalkanIzin">Batalkan</button>
          <button :disabled="!bolehKelola || terkunci" class="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg px-4 py-2 transition disabled:opacity-50" @click="simpanIzin">Simpan Izin</button>
        </div>
      </div>
    </div>
  </div>
</template>
