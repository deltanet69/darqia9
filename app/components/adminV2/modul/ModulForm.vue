<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  useModulPembelajaran, isiBawaan, totalJpLangkah, totalBobot, bolehSunting, isiDariAi,
  DIMENSI_PROFIL_LULUSAN,
  type IsiModul, type ModulPembelajaran, type PeranModul
} from '~/composables/useModulPembelajaran'

const props = defineProps<{ id?: string; jenjang: 'SMP' | 'SMK'; role: PeranModul }>()
const store = useModulPembelajaran()
const { guruDaftar, mapelDaftar, penulisAktifId, pesan } = store
const rbac = useRbac()

const SATUAN: Record<string, string> = { SMP: 'SMP IT Bina Cendekia Assalam', SMK: 'SMK IT Attaqwa 9' }
const sibuk = ref(false)
const ditolak = ref('')
const catatan = ref('')
const penyusunAwal = ref('')
const aiSibuk = ref(false)
const aiDipakai = ref(false)
const aiGalat = ref('')
// Mapel modul lama yang tidak ada di master tetap ditampilkan agar tidak hilang saat disunting.
const opsiMapel = computed(() => draf.mapel && !mapelDaftar.value.includes(draf.mapel) ? [draf.mapel, ...mapelDaftar.value] : mapelDaftar.value)
// Guru yang mengajar lintas jenjang bisa tidak ada di daftar guru jenjang ini: tetap tampilkan dirinya sebagai opsi.
const opsiGuru = computed(() => penulisAktifId.value && !guruDaftar.value.some(g => g.id === penulisAktifId.value)
  ? [{ id: penulisAktifId.value, name: rbac.namaAkun.value || 'Saya' }, ...guruDaftar.value]
  : guruDaftar.value)

const draf = reactive({
  nomor: '' as string, judul: '', jenis: 'projek' as 'projek' | 'mapel',
  authorTeacherId: '', mapel: '', fase: '', kelas: '',
  alokasiJp: '', jumlahPertemuan: '', durasiMinggu: '',
  isi: isiBawaan() as IsiModul
})

const tujuanTeks = computed({
  get: () => draf.isi.tujuan.join('\n'),
  set: (v: string) => { draf.isi.tujuan = v.split('\n').map(s => s.trim()).filter(Boolean) }
})
const pemantikTeks = computed({
  get: () => draf.isi.pertanyaanPemantik.join('\n'),
  set: (v: string) => { draf.isi.pertanyaanPemantik = v.split('\n').map(s => s.trim()).filter(Boolean) }
})
const totalJp = computed(() => totalJpLangkah(draf.isi))
const totalPersen = computed(() => totalBobot(draf.isi))
const namaPenyusun = computed(() => opsiGuru.value.find(g => g.id === draf.authorTeacherId)?.name || penyusunAwal.value)

const alihkanDimensi = (d: string) => {
  const i = draf.isi.dimensi.indexOf(d)
  if (i >= 0) draf.isi.dimensi.splice(i, 1)
  else if (draf.isi.dimensi.length < 3) draf.isi.dimensi.push(d)
}

onMounted(async () => {
  await store.muat(props.jenjang)
  if (props.id) {
    const m = await store.ambil(props.id)
    if (!m || !bolehSunting(m, props.role, penulisAktifId.value)) { ditolak.value = 'Hanya penulis modul (atau superadmin) yang dapat menyunting modul ini.'; return }
    penyusunAwal.value = m.penyusun
    draf.nomor = m.nomor ? String(m.nomor) : ''
    draf.judul = m.judul; draf.jenis = m.jenis
    draf.authorTeacherId = m.authorTeacherId || ''
    draf.mapel = m.mapel; draf.fase = m.fase; draf.kelas = m.kelas
    draf.alokasiJp = m.alokasiJp ? String(m.alokasiJp) : ''
    draf.jumlahPertemuan = m.jumlahPertemuan ? String(m.jumlahPertemuan) : ''
    draf.durasiMinggu = m.durasiMinggu ? String(m.durasiMinggu) : ''
    draf.isi = JSON.parse(JSON.stringify(m.isi))
  } else {
    if (props.role !== 'superadmin' && (!penulisAktifId.value || !rbac.bisaSaya('Modul Pembelajaran', 'buat'))) {
      ditolak.value = 'Akun ini belum tertaut data guru atau tidak memiliki izin membuat modul. Hubungi admin.'
      return
    }
    draf.authorTeacherId = penulisAktifId.value
    draf.fase = props.jenjang === 'SMP' ? 'Fase D' : 'Fase E'
  }
})

const bangunModul = (status: ModulPembelajaran['status']): ModulPembelajaran => ({
  id: props.id || '',
  jenjang: props.jenjang, jenis: draf.jenis,
  nomor: draf.nomor ? Number(draf.nomor) : null,
  judul: draf.judul.trim(), penyusun: namaPenyusun.value,
  authorTeacherId: draf.authorTeacherId || null,
  satuan: SATUAN[props.jenjang], mapel: draf.mapel.trim(),
  fase: draf.fase, kelas: draf.kelas.trim(),
  alokasiJp: draf.alokasiJp ? Number(draf.alokasiJp) : null,
  jumlahPertemuan: draf.jumlahPertemuan ? Number(draf.jumlahPertemuan) : null,
  durasiMinggu: draf.durasiMinggu ? Number(draf.durasiMinggu) : null,
  status, tahapBerjalan: 0, isi: JSON.parse(JSON.stringify(draf.isi)),
  submittedAt: status === 'menunggu' ? new Date().toISOString() : null,
  approvedAt: null, approvedBy: null,
  createdAt: null, updatedAt: null, deletedAt: null
})

const isiTerisi = () => !!(draf.isi.cp.trim() || draf.isi.tujuan.length || draf.isi.langkah.some(l => l.guru.trim() || l.siswa.trim()))
const buatDenganAi = async () => {
  aiGalat.value = ''
  if (!draf.mapel || !draf.judul.trim()) { aiGalat.value = 'Pilih mata pelajaran dan isi judul modul terlebih dahulu.'; return }
  if (isiTerisi() && !window.confirm('Isi seksi B–H yang sudah ditulis akan diganti dengan rekomendasi AI. Lanjutkan?')) return
  aiSibuk.value = true
  try {
    const hasil = await $fetch<{ isi: unknown }>('/api/modul/ai', {
      method: 'POST',
      body: {
        jenjang: props.jenjang, jenis: draf.jenis, mapel: draf.mapel, fase: draf.fase, kelas: draf.kelas,
        judul: draf.judul, alokasiJp: Number(draf.alokasiJp) || 0, jumlahPertemuan: Number(draf.jumlahPertemuan) || 0
      }
    })
    draf.isi = isiDariAi(hasil.isi)
    aiDipakai.value = true
  } catch (e: any) {
    aiGalat.value = e?.data?.statusMessage || e?.statusMessage || 'Rekomendasi AI gagal dibuat. Coba lagi.'
  } finally {
    aiSibuk.value = false
  }
}

const simpan = async (kumpulkan: boolean) => {
  if (!draf.judul.trim()) { catatan.value = 'Judul / nama projek wajib diisi dulu.'; return }
  if (!draf.mapel) { catatan.value = 'Mata pelajaran wajib dipilih.'; return }
  if (!draf.authorTeacherId) { catatan.value = 'Penyusun wajib dipilih.'; return }
  sibuk.value = true
  const hasil = await store.simpan(bangunModul(kumpulkan ? 'menunggu' : 'draf'))
  sibuk.value = false
  if (hasil) await navigateTo(`/adminV2/modul-ajar/${hasil.id}`)
  else catatan.value = pesan.value || 'Gagal menyimpan.'
}
</script>

<template>
  <div>
    <NuxtLink to="/adminV2/modul-ajar" class="text-[12.5px] font-medium text-blue-700">← Kembali ke daftar modul</NuxtLink>

    <div v-if="ditolak" class="mt-4 bg-white border border-slate-200 rounded-2xl px-5 py-10 text-center">
      <div class="text-[14px] font-medium text-slate-700">{{ id ? 'Modul tidak bisa disunting' : 'Tidak bisa membuat modul' }}</div>
      <p class="text-[12.5px] text-slate-400 mt-1">{{ ditolak }}</p>
    </div>

    <template v-else>
      <div class="mt-2 flex flex-wrap items-start gap-3">
        <div class="min-w-0">
          <h1 class="text-[22px] leading-7 font-semibold text-blue-950">{{ id ? 'Sunting Modul' : 'Buat Modul' }}</h1>
          <p class="text-[13px] text-slate-500 mt-0.5">Isi per seksi mengikuti urutan dokumen A–H. Simpan sebagai draf, lalu kumpulkan untuk persetujuan admin.</p>
        </div>
        <div class="ml-auto flex flex-wrap items-center gap-2">
          <span class="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2.5 py-1.5 font-medium">Status: Draf</span>
          <button type="button" :disabled="aiSibuk" class="text-[12.5px] font-medium text-blue-700 border border-blue-200 bg-white hover:bg-blue-50 rounded-xl px-3.5 py-2 transition disabled:opacity-50" @click="buatDenganAi">
            {{ aiSibuk ? 'Menyusun rekomendasi…' : 'Buat dengan AI Assistant' }}
          </button>
        </div>
      </div>

      <p v-if="aiGalat" class="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px]" role="alert">{{ aiGalat }}</p>
      <p v-if="aiDipakai" class="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-[13px]" role="alert">
        <span class="font-semibold">Harap review hasil generate modul pembelajaran sebelum digunakan.</span>
        Isi seksi B–H dibuat oleh AI Assistant berdasarkan identitas modul; periksa kesesuaian CP, langkah kegiatan, dan asesmen.
      </p>

      <div class="mt-4 space-y-3">
        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">A</span><span class="text-[14px] font-semibold text-blue-950">Identitas Modul</span></div>
          <div class="mt-3.5 grid grid-cols-2 gap-3">
            <div>
              <label class="text-[12px] font-medium text-slate-600">Nama Penyusun</label>
              <select v-model="draf.authorTeacherId" :disabled="role !== 'superadmin'" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white disabled:opacity-60">
                <option value="">— pilih guru —</option>
                <option v-for="g in opsiGuru" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>
            <div><label class="text-[12px] font-medium text-slate-600">Satuan Pendidikan</label><input type="text" :value="SATUAN[jenjang]" disabled class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-slate-50 text-slate-500"></div>
            <div>
              <label class="text-[12px] font-medium text-slate-600">Jenis Modul</label>
              <select v-model="draf.jenis" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white"><option value="projek">Projek kokurikuler (lintas mapel)</option><option value="mapel">Modul ajar mata pelajaran</option></select>
            </div>
            <div>
              <label class="text-[12px] font-medium text-slate-600">Mata Pelajaran / Konsentrasi</label>
              <select v-model="draf.mapel" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
                <option value="">— pilih mata pelajaran —</option>
                <option v-for="m in opsiMapel" :key="m" :value="m">{{ m }}</option>
              </select>
              <p v-if="!mapelDaftar.length" class="mt-1 text-[11.5px] text-amber-700">Belum ada mata pelajaran aktif jenjang {{ jenjang }} di Data Master Mapel.</p>
            </div>
            <div>
              <label class="text-[12px] font-medium text-slate-600">Fase</label>
              <select v-model="draf.fase" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
                <option>Fase D</option><option>Fase E</option><option>Fase F</option>
              </select>
            </div>
            <div><label class="text-[12px] font-medium text-slate-600">Kelas</label><input v-model="draf.kelas" type="text" placeholder="cth. Kelas VII / XI AKL" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
            <div><label class="text-[12px] font-medium text-slate-600">Nama Projek / Judul Modul</label><input v-model="draf.judul" type="text" placeholder="Darqia — [judul projek]" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
            <div><label class="text-[12px] font-medium text-slate-600">Nomor Modul <span class="text-slate-400 font-normal">(opsional)</span></label><input v-model="draf.nomor" type="number" min="1" placeholder="1" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
            <div><label class="text-[12px] font-medium text-slate-600">Alokasi Waktu (JP)</label><input v-model="draf.alokasiJp" type="number" min="0" placeholder="12" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-[12px] font-medium text-slate-600">Pertemuan</label><input v-model="draf.jumlahPertemuan" type="number" min="0" placeholder="4" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
              <div><label class="text-[12px] font-medium text-slate-600">Minggu</label><input v-model="draf.durasiMinggu" type="number" min="0" placeholder="4" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">B</span><span class="text-[14px] font-semibold text-blue-950">Komponen Inti</span></div>
          <div class="mt-3.5 space-y-3.5">
            <div>
              <label class="text-[12px] font-medium text-slate-600">Capaian Pembelajaran <span class="text-slate-400 font-normal">(per elemen · {{ draf.isi.cpReferensi }})</span></label>
              <textarea v-model="draf.isi.cp" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Tempel kutipan CP fase dari Kepkabskap 032/H/KR/2024 untuk elemen yang disentuh modul ini…" />
            </div>
            <div>
              <label class="text-[12px] font-medium text-slate-600">Dimensi Profil Lulusan <span class="text-slate-400 font-normal">(pilih 2–3)</span></label>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <button v-for="d in DIMENSI_PROFIL_LULUSAN" :key="d" type="button" class="text-[12px] rounded-full px-3 py-1.5 font-medium border transition" :class="draf.isi.dimensi.includes(d) ? 'bg-blue-950 text-white border-blue-950' : 'bg-white border-slate-200 text-slate-500'" @click="alihkanDimensi(d)">{{ d }}</button>
              </div>
            </div>
            <div>
              <label class="text-[12px] font-medium text-slate-600">Tujuan Pembelajaran <span class="text-slate-400 font-normal">(format ABCD, satu per baris)</span></label>
              <textarea v-model="tujuanTeks" rows="3" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Peserta didik (Audience) mampu … (Behavior) setelah/dengan … (Condition) dengan benar … (Degree)." />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-[12px] font-medium text-slate-600">Pemahaman Bermakna</label><textarea v-model="draf.isi.pemahamanBermakna" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Konsep kunci yang harus dipahami siswa…" /></div>
              <div><label class="text-[12px] font-medium text-slate-600">Pertanyaan Pemantik <span class="text-slate-400 font-normal">(2–3, satu per baris)</span></label><textarea v-model="pemantikTeks" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Satu pertanyaan per baris…" /></div>
              <div>
                <label class="text-[12px] font-medium text-slate-600">Target Peserta Didik</label>
                <select v-model="draf.isi.targetPeserta" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] bg-white"><option>Reguler</option><option>Remedial</option><option>Pengayaan</option><option>Campuran (diferensiasi di F)</option></select>
              </div>
              <div>
                <label class="text-[12px] font-medium text-slate-600">Model Pembelajaran</label>
                <select v-model="draf.isi.model" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] bg-white"><option>Project-Based Learning (PjBL)</option><option>Problem-Based Learning (PBL)</option><option>Inkuiri</option><option>Discovery Learning</option></select>
              </div>
            </div>
            <div><label class="text-[12px] font-medium text-slate-600">Sarana dan Prasarana</label><input v-model="draf.isi.sarana" type="text" placeholder="Alat, bahan, platform digital, sumber belajar…" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">C</span><span class="text-[14px] font-semibold text-blue-950">Produk Projek</span></div>
          <div class="mt-3.5 space-y-3">
            <div><label class="text-[12px] font-medium text-slate-600">Deskripsi Produk Akhir</label><input v-model="draf.isi.produkDeskripsi" type="text" placeholder="cth. Laporan audit, rancangan sistem, poster kampanye" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
            <div>
              <div class="flex items-center gap-2"><label class="text-[12px] font-medium text-slate-600">Kriteria Keberhasilan <span class="text-slate-400 font-normal">(rubrik 4 level per aspek)</span></label><button type="button" class="ml-auto text-[11.5px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-2.5 py-1 transition" @click="draf.isi.kriteria.push({ aspek: '', sb: '', b: '', c: '', pb: '' })">+ Aspek</button></div>
              <div v-for="(k, i) in draf.isi.kriteria" :key="i" class="mt-2 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_28px] gap-2">
                <input v-model="k.aspek" type="text" placeholder="Aspek" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
                <input v-model="k.sb" type="text" placeholder="Sangat Baik (4)" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
                <input v-model="k.b" type="text" placeholder="Baik (3)" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
                <input v-model="k.c" type="text" placeholder="Cukup (2)" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
                <input v-model="k.pb" type="text" placeholder="Perlu Bimbingan (1)" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
                <button type="button" class="text-slate-400 hover:text-red-500 text-[14px]" @click="draf.isi.kriteria.splice(i, 1)">×</button>
              </div>
              <p v-if="!draf.isi.kriteria.length" class="text-[12px] text-slate-400 mt-1.5">Belum ada aspek. Tambahkan aspek penilaian produk.</p>
            </div>
            <div><label class="text-[12px] font-medium text-slate-600">Mitra / DU-DI <span class="text-slate-400 font-normal">(SMK: nama mitra &amp; perannya · SMP: opsional)</span></label><input v-model="draf.isi.mitra" type="text" placeholder="cth. PT … — penilai eksternal produk" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]"></div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">D</span><span class="text-[14px] font-semibold text-blue-950">Langkah Kegiatan (Sintaks PjBL)</span><span class="ml-auto text-[12px]" :class="draf.alokasiJp && Number(draf.alokasiJp) !== totalJp ? 'text-amber-600 font-medium' : 'text-slate-400'">Total: <span class="font-medium text-blue-950">{{ totalJp }} JP</span><template v-if="draf.alokasiJp"> — alokasi {{ draf.alokasiJp }} JP{{ Number(draf.alokasiJp) === totalJp ? ' (sesuai)' : ' (belum sesuai)' }}</template></span></div>
          <div class="mt-3.5 space-y-2.5">
            <div v-for="(l, i) in draf.isi.langkah" :key="i" class="grid grid-cols-[150px_1fr_1fr_64px] gap-2 items-start">
              <span class="text-[12.5px] font-medium text-slate-600 pt-2">{{ i + 1 }} · {{ l.tahap }}</span>
              <textarea v-model="l.guru" rows="2" placeholder="Kegiatan guru…" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px] leading-relaxed" />
              <textarea v-model="l.siswa" rows="2" placeholder="Kegiatan siswa…" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px] leading-relaxed" />
              <input v-model.number="l.jp" type="number" min="0" class="border border-slate-200 rounded-lg px-2 py-2 text-[12.5px] text-center">
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">E</span><span class="text-[14px] font-semibold text-blue-950">Asesmen</span></div>
          <div class="mt-3.5 grid grid-cols-2 gap-3">
            <div><label class="text-[12px] font-medium text-slate-600">Awal (diagnostik)</label><textarea v-model="draf.isi.asesmen.diagnostik" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Kognitif &amp; non-kognitif…" /></div>
            <div><label class="text-[12px] font-medium text-slate-600">Proses (formatif)</label><textarea v-model="draf.isi.asesmen.formatif" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Checkpoint, jurnal, observasi, LKPD…" /></div>
            <div><label class="text-[12px] font-medium text-slate-600">Produk (sumatif)</label><textarea v-model="draf.isi.asesmen.sumatif" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Rubrik produk akhir dari bagian C…" /></div>
            <div><label class="text-[12px] font-medium text-slate-600">Dimensi Profil Lulusan</label><textarea v-model="draf.isi.asesmen.profil" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Rubrik observasi dimensi terpilih…" /></div>
          </div>
          <div class="mt-3 space-y-2">
            <div v-for="(b, i) in draf.isi.bobot" :key="i" class="grid grid-cols-[1fr_90px_1fr] gap-2">
              <input v-model="b.komponen" type="text" placeholder="Komponen" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
              <input v-model.number="b.persen" type="number" min="0" max="100" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px] text-center">
              <input v-model="b.instrumen" type="text" placeholder="Instrumen" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
            </div>
            <p class="text-[12px]" :class="totalPersen === 100 ? 'text-slate-400' : 'text-amber-600 font-medium'">Total bobot: {{ totalPersen }}%{{ totalPersen === 100 ? ' — pas 100%' : ' — harus 100%' }}</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-3">
          <div class="bg-white border border-slate-200 rounded-2xl p-5">
            <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">F</span><span class="text-[14px] font-semibold text-blue-950">Diferensiasi</span></div>
            <div class="mt-3 space-y-3">
              <div><label class="text-[12px] font-medium text-slate-600">Remedial</label><textarea v-model="draf.isi.diferensiasi.remedial" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Pendampingan &amp; penyesuaian…" /></div>
              <div><label class="text-[12px] font-medium text-slate-600">Pengayaan</label><textarea v-model="draf.isi.diferensiasi.pengayaan" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Tantangan lanjutan…" /></div>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-5">
            <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">G</span><span class="text-[14px] font-semibold text-blue-950">Refleksi</span></div>
            <div class="mt-3 space-y-3">
              <div><label class="text-[12px] font-medium text-slate-600">Refleksi Guru <span class="text-slate-400 font-normal">(pertanyaan panduan)</span></label><textarea v-model="draf.isi.refleksi.guru" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Apa yang berjalan? Apa hambatannya?…" /></div>
              <div><label class="text-[12px] font-medium text-slate-600">Refleksi Siswa <span class="text-slate-400 font-normal">(pertanyaan panduan)</span></label><textarea v-model="draf.isi.refleksi.siswa" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed" placeholder="Apa yang dipelajari? Apa peran saya?…" /></div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-2.5"><span class="w-6 h-6 rounded-lg bg-blue-950 text-white text-[12px] font-semibold flex items-center justify-center">H</span><span class="text-[14px] font-semibold text-blue-950">Lampiran</span></div>
          <div class="mt-3 space-y-2">
            <div v-for="(l, i) in draf.isi.lampiran" :key="i" class="grid grid-cols-[110px_1fr_1fr_28px] gap-2">
              <select v-model="l.jenis" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px] bg-white"><option>DOCX</option><option>PDF</option><option>XLSX</option><option>PPTX</option><option>TAUTAN</option></select>
              <input v-model="l.judul" type="text" placeholder="Judul lampiran (cth. LKPD Audit Sampah)" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
              <input v-model="l.keterangan" type="text" placeholder="Keterangan / tautan berkas" class="border border-slate-200 rounded-lg px-2.5 py-2 text-[12.5px]">
              <button type="button" class="text-slate-400 hover:text-red-500 text-[14px]" @click="draf.isi.lampiran.splice(i, 1)">×</button>
            </div>
            <button type="button" class="text-[12.5px] font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition" @click="draf.isi.lampiran.push({ jenis: 'PDF', judul: '', keterangan: '' })">+ Tambah Lampiran</button>
            <p class="text-[12px] text-slate-400">Unggah berkas menyusul lewat penyimpanan sekolah; untuk sekarang catat judul &amp; keterangannya (unggah LKPD, instrumen, bahan bacaan).</p>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <div><label class="text-[12px] font-medium text-slate-600">Glosarium <span class="text-slate-400 font-normal">(pisahkan koma)</span></label><input v-model="draf.isi.glosarium" type="text" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px]"></div>
            <div><label class="text-[12px] font-medium text-slate-600">Daftar Pustaka</label><input v-model="draf.isi.daftarPustaka" type="text" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px]"></div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span v-if="catatan" class="text-[12.5px] text-red-500 w-full">{{ catatan }}</span>
          <button :disabled="sibuk" class="text-[13px] font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl px-4 py-2.5 transition disabled:opacity-50" @click="simpan(false)">Simpan Draf</button>
          <button :disabled="sibuk" class="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl px-4 py-2.5 transition disabled:opacity-50" @click="simpan(true)">Simpan &amp; Kumpulkan untuk Persetujuan Admin</button>
        </div>
      </div>
    </template>
  </div>
</template>
