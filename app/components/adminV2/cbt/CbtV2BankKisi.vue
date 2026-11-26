<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import { BLOOM, URUTAN_LEVEL, komposisiButir, urutkanButirKisi, type ButirKisi, type LevelBloom } from '~/utils/kisiBloom'
import type { BankPackage } from './cbtV2Data'

// Editor kisi-kisi terstruktur Taksonomi Bloom untuk satu bank soal (tab terpisah dari CRUD bank & soal).
// Butir tampil simpel; penyusunan manual dan perbaikan hasil AI lewat modal yang sama.
// Setiap perubahan langsung tersimpan (kisi_butir + teks turunan kisi_kisi) lewat useAdminCbtData.
const props = defineProps<{ pkg: BankPackage, source?: 'cbt' | 'ujian_harian', status?: string }>()
const emit = defineEmits<{ generate: [mode: 'otomatis' | 'ulang'], toast: [pesan: string] }>()

const cbtData = useAdminCbtData(props.source ?? 'cbt')
const butir = ref<ButirKisi[]>([])
const memuatButir = ref(true)
const galatMuat = ref('')
const menyimpan = ref(false)

const sinkronDariPaket = () => { butir.value = JSON.parse(JSON.stringify(props.pkg.kisiButir ?? [])) }
watch(() => props.pkg.kisiButir, sinkronDariPaket, { immediate: true })
onMounted(async () => {
  try { await cbtData.muatKisiButir(props.pkg.id) }
  catch (e) { galatMuat.value = e instanceof Error ? e.message : 'Kisi-kisi gagal dimuat.' }
  finally { memuatButir.value = false }
})

const komposisi = computed(() => komposisiButir(butir.value))
const pesanKomposisi = computed(() => {
  const k = komposisi.value
  if (!k.total) return ''
  return k.rendah >= 55 && k.rendah <= 75 && k.tinggi <= 12
    ? `Komposisi: C1–C3 ${k.rendah}% · C4–C5 ${k.tengah}% · C6 ${k.tinggi}%. Sejalan dengan pola umum kemampuan siswa.`
    : `Komposisi: C1–C3 ${k.rendah}% · C4–C5 ${k.tengah}% · C6 ${k.tinggi}%. Acuan lapangan: C1–C3 mayoritas (55–75%), C4–C5 sebagian (20–35%), C6 sedikit (maks ±10%). Ini panduan lembut, bukan aturan wajib.`
})

const terapkan = async (baru: ButirKisi[], pesan: string) => {
  const lama = butir.value
  butir.value = urutkanButirKisi(baru)
  menyimpan.value = true
  try {
    await cbtData.simpanKisiButir(props.pkg.id, butir.value)
    emit('toast', pesan)
  } catch (e) {
    butir.value = lama
    emit('toast', e instanceof Error ? e.message : 'Kisi-kisi gagal disimpan.')
  } finally { menyimpan.value = false }
}

const generate = () => {
  if (props.status === 'memuat' || menyimpan.value) return
  if ((butir.value.length || props.pkg.kisiKisi) && !confirm('Kisi-kisi yang sekarang akan diganti hasil AI yang baru. Lanjutkan?')) return
  emit('generate', 'ulang')
}
const hapusButir = (i: number) => {
  if (menyimpan.value || !confirm(`Hapus butir "${butir.value[i]!.materi}" (${butir.value[i]!.level})?`)) return
  void terapkan(butir.value.filter((_, x) => x !== i), 'Butir kisi-kisi dihapus.')
}

// ----- modal susun / ubah butir -----
const modalEdit = ref(false)
const editIdx = ref(-1)
const fMateri = ref('')
const fLevel = ref<LevelBloom>('C2')
const fKko = ref('Menjelaskan')
const fIndikator = ref('')
const fSoal = ref('')
const fGalat = ref('')
const nomorTersedia = computed(() => props.pkg.questions.map(q => q.number).filter(n => Number(n) > 0))

const bukaEdit = (i: number) => {
  editIdx.value = i
  const b = i >= 0 ? butir.value[i] : undefined
  fMateri.value = b?.materi ?? ''
  fLevel.value = b?.level ?? 'C2'
  fKko.value = b?.kko ?? BLOOM[fLevel.value].kko[0]!
  fIndikator.value = b?.indikator ?? ''
  fSoal.value = b?.soal.join(', ') ?? ''
  fGalat.value = ''
  modalEdit.value = true
}
const pilihLevel = (l: LevelBloom) => {
  fLevel.value = l
  if (!BLOOM[l].kko.includes(fKko.value)) fKko.value = BLOOM[l].kko[0]!
}
const simpanEdit = () => {
  const materi = fMateri.value.trim()
  const indikator = fIndikator.value.trim()
  if (!materi) { fGalat.value = 'Materi wajib diisi.'; return }
  if (!indikator) { fGalat.value = 'Indikator wajib diisi.'; return }
  const mentah = fSoal.value.split(/[,\s]+/).map(x => Math.floor(Number(x))).filter(n => Number.isFinite(n) && n > 0)
  const soal = [...new Set(mentah)].filter(n => !nomorTersedia.value.length || nomorTersedia.value.includes(n)).sort((a, b) => a - b)
  if (mentah.length && !soal.length) { fGalat.value = 'Nomor soal tidak ditemukan di bank ini.'; return }
  const data: ButirKisi = { materi, indikator, level: fLevel.value, kko: fKko.value, soal }
  const baru = [...butir.value]
  if (editIdx.value >= 0) baru[editIdx.value] = data; else baru.push(data)
  modalEdit.value = false
  void terapkan(baru, editIdx.value >= 0 ? 'Butir kisi-kisi diperbarui.' : 'Butir kisi-kisi ditambahkan.')
}

// ----- modal referensi KKO -----
const modalRef = ref(false)
</script>

<template>
  <section class="bg-white border border-[#E7EBF2] rounded-2xl p-4 space-y-3" aria-labelledby="judul-kisi-bloom">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 id="judul-kisi-bloom" class="text-sm font-semibold text-[#101828]">Kisi-Kisi Taksonomi Bloom</h3>
        <p class="text-xs text-[#667085] mt-0.5">Butir terstruktur C1–C6 dari bank ini — tampil untuk siswa di Perpus Digital (Media Pembelajaran), lengkap dengan rekomendasi bab buku.</p>
      </div>
      <button type="button" class="min-h-11 px-3 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F3F5F9]" @click="modalRef = true">Referensi KKO</button>
    </div>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="min-h-11 px-4 rounded-xl bg-[#0A2A5C] text-xs font-bold text-white disabled:opacity-60" :disabled="status === 'memuat' || menyimpan" @click="generate">{{ butir.length || pkg.kisiKisi ? 'Buat ulang dengan AI' : 'Generate dengan AI' }}</button>
      <button type="button" class="min-h-11 px-4 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F3F5F9] disabled:opacity-60" :disabled="menyimpan" @click="bukaEdit(-1)">+ Susun Manual</button>
      <span v-if="menyimpan" class="self-center text-xs font-semibold text-[#1B5FD9]">Menyimpan…</span>
    </div>
    <p class="text-xs text-[#667085] leading-relaxed"><b class="text-[#344054]">Generate AI</b> membaca seluruh soal di bank ini, mengelompokkannya per materi, lalu menentukan level Bloom + KKO tiap butir dari tuntutan berpikir soalnya (KKO divalidasi harus milik levelnya, nomor soal tidak bisa dikarang). Hasil generate selalu bisa diubah manual sebelum dipakai siswa.</p>

    <p v-if="status === 'memuat'" role="status" class="text-xs font-semibold text-[#1B5FD9]">Kisi-kisi sedang dibuat…</p>
    <div v-else-if="status" role="alert" class="flex flex-wrap items-center gap-2 rounded-xl bg-[#FDECEA] p-3 text-xs font-semibold text-[#B42318]">
      <span>{{ status }}</span>
      <button type="button" class="min-h-11 px-3 underline" @click="emit('generate', 'ulang')">Coba lagi</button>
    </div>
    <div v-if="galatMuat" role="alert" class="rounded-xl bg-[#FDECEA] p-3 text-xs font-semibold text-[#B42318]">{{ galatMuat }}</div>

    <template v-if="butir.length">
      <div class="border-t border-[#E7EBF2] pt-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <b class="text-xs font-semibold text-[#101828]">Komposisi Level Berpikir</b>
          <span class="text-[11px] text-[#667085]">Acuan lapangan: mayoritas C1–C3 · sebagian C4–C5 · sedikit C6</span>
        </div>
        <div class="flex h-2.5 rounded-full overflow-hidden bg-[#EEF2F7] mt-2">
          <i v-for="l in URUTAN_LEVEL" :key="l" :style="{ width: (komposisi.per[l] / Math.max(komposisi.total, 1) * 100) + '%', background: BLOOM[l].warna }" class="block h-full" />
        </div>
        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-[#667085]">
          <span v-for="l in URUTAN_LEVEL" :key="l"><i class="inline-block w-2 h-2 rounded-full mr-1" :style="{ background: BLOOM[l].warna }" />{{ l }} {{ BLOOM[l].nama }} · {{ komposisi.per[l] }}</span>
        </div>
        <p class="mt-2 rounded-xl bg-[#F2F6FD] px-3 py-2 text-xs leading-relaxed text-[#175CD3]">{{ pesanKomposisi }}</p>
      </div>

      <p class="text-xs text-[#667085]">Butir selalu ditampilkan <b class="text-[#344054]">berurutan dari C1 sampai C6</b> mengikuti tahapan Taksonomi Bloom — urutan yang sama juga tampil untuk siswa di Perpus Digital.</p>
      <div>
        <div v-for="(b, i) in butir" :key="i" class="flex gap-3 items-start py-3 border-t border-[#E7EBF2]">
          <div class="flex-none w-[46px] text-center">
            <span class="flex items-center justify-center w-[46px] h-9 rounded-[10px] text-white text-base font-extrabold" :style="{ background: BLOOM[b.level].warna }">{{ b.level }}</span>
            <span class="block text-[9.5px] font-bold uppercase tracking-wide text-[#667085] mt-1 leading-tight">{{ BLOOM[b.level].nama }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[15px] font-semibold text-[#101828] leading-snug">{{ b.materi }}</div>
            <p class="text-[13px] text-[#344054] leading-relaxed mt-0.5">Siswa dapat <b class="text-[#0A2A5C]">{{ b.kko.toLowerCase() }}</b> {{ b.indikator }}</p>
            <p class="text-xs text-[#667085] mt-1">Terhubung ke soal: <b class="font-semibold text-[#344054]">{{ b.soal.length ? 'No. ' + b.soal.join(', ') : 'belum dikaitkan' }}</b></p>
          </div>
          <div class="flex flex-none gap-1">
            <button type="button" class="px-2.5 py-2 rounded-lg text-xs font-bold text-[#344054] hover:bg-[#F2F4F7]" @click="bukaEdit(i)">Ubah</button>
            <button type="button" class="px-2.5 py-2 rounded-lg text-xs font-bold text-[#B42318] hover:bg-[#FDECEA]" @click="hapusButir(i)">Hapus</button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="!memuatButir && status !== 'memuat'">
      <div v-if="pkg.kisiKisi" class="border-t border-[#E7EBF2] pt-3 space-y-2">
        <p class="rounded-xl bg-[#FFFBEB] px-3 py-2 text-xs leading-relaxed text-[#B54708]"><b>Kisi-kisi teks lama</b> dari format sebelumnya — belum terstruktur Bloom. Generate ulang dengan AI atau susun manual agar tampil rinci per butir di Perpus siswa. Menyimpan butir pertama akan menggantikan teks lama ini.</p>
        <p class="whitespace-pre-line text-xs leading-relaxed text-[#344054]">{{ pkg.kisiKisi }}</p>
      </div>
      <p v-else class="text-xs text-[#667085] border-t border-[#E7EBF2] pt-3">Belum ada kisi-kisi. Generate dengan AI dari isi soal bank ini, atau susun manual butir demi butir.</p>
    </template>
    <p v-else-if="memuatButir" class="text-xs text-[#667085]">Memuat kisi-kisi…</p>

    <!-- Modal susun / ubah butir -->
    <div v-if="modalEdit" class="fixed inset-0 z-50 bg-[#0B1526]/50 flex items-end sm:items-center justify-center sm:p-4" @click.self="modalEdit = false">
      <div class="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5" role="dialog" aria-modal="true">
        <h4 class="text-base font-bold text-[#101828]">{{ editIdx >= 0 ? 'Ubah Butir Kisi-Kisi' : 'Susun Kisi-Kisi Manual' }}</h4>
        <p class="text-xs text-[#667085] mt-1 leading-relaxed">Indikator dirumuskan dengan pola: “Siswa dapat + kata kerja operasional (KKO) + materi.” Level dan KKO harus sepasang.</p>

        <label class="block mt-4">
          <span class="block text-[11px] font-extrabold uppercase tracking-wider text-[#667085] mb-1.5">Materi / Topik</span>
          <input v-model="fMateri" type="text" placeholder="cth. Eksponen dan Sifat-sifatnya" class="w-full border-[1.5px] border-[#D5DCE8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1B5FD9]">
        </label>

        <div class="mt-4">
          <span class="block text-[11px] font-extrabold uppercase tracking-wider text-[#667085] mb-1.5">Level Berpikir Bloom</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button v-for="l in URUTAN_LEVEL" :key="l" type="button" class="text-left border-[1.5px] rounded-xl px-3 py-2.5 transition" :class="fLevel === l ? 'border-[#0A2A5C] bg-[#F2F6FD]' : 'border-[#D5DCE8]'" @click="pilihLevel(l)">
              <span class="text-sm font-extrabold" :style="{ color: BLOOM[l].warna }">{{ l }}</span>
              <span class="block text-xs font-bold text-[#667085] mt-0.5">{{ BLOOM[l].nama }}</span>
            </button>
          </div>
        </div>

        <div class="mt-4">
          <span class="block text-[11px] font-extrabold uppercase tracking-wider text-[#667085] mb-1.5">Kata Kerja Operasional (sesuai level)</span>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="k in BLOOM[fLevel].kko" :key="k" type="button" class="px-3 py-2 rounded-full border-[1.5px] text-[13px] font-semibold transition" :class="fKko === k ? 'bg-[#0A2A5C] border-[#0A2A5C] text-white' : 'border-[#D5DCE8] text-[#344054]'" @click="fKko = k">{{ k }}</button>
          </div>
        </div>

        <label class="block mt-4">
          <span class="block text-[11px] font-extrabold uppercase tracking-wider text-[#667085] mb-1.5">Indikator (kelanjutan setelah “Siswa dapat {{ fKko.toLowerCase() }}”)</span>
          <textarea v-model="fIndikator" rows="3" placeholder="cth. sifat-sifat bilangan berpangkat (pangkat nol, negatif, dan pecahan)." class="w-full border-[1.5px] border-[#D5DCE8] rounded-xl px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#1B5FD9]" />
        </label>

        <label class="block mt-4">
          <span class="block text-[11px] font-extrabold uppercase tracking-wider text-[#667085] mb-1.5">Nomor Soal Terkait</span>
          <input v-model="fSoal" type="text" placeholder="cth. 1, 2, 5" class="w-full border-[1.5px] border-[#D5DCE8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1B5FD9]">
          <span v-if="nomorTersedia.length" class="block text-[11px] text-[#98A2B3] mt-1">Nomor yang ada di bank ini: {{ nomorTersedia.join(', ') }}</span>
        </label>

        <p v-if="fGalat" role="alert" class="mt-3 rounded-xl bg-[#FDECEA] px-3 py-2 text-xs font-semibold text-[#B42318]">{{ fGalat }}</p>
        <div class="flex gap-2 mt-5">
          <button type="button" class="flex-1 min-h-12 rounded-xl border-[1.5px] border-[#D5DCE8] text-sm font-bold text-[#344054]" @click="modalEdit = false">Batal</button>
          <button type="button" class="flex-1 min-h-12 rounded-xl bg-[#0A2A5C] text-sm font-bold text-white disabled:opacity-60" :disabled="menyimpan" @click="simpanEdit">Simpan Butir</button>
        </div>
      </div>
    </div>

    <!-- Modal referensi KKO -->
    <div v-if="modalRef" class="fixed inset-0 z-50 bg-[#0B1526]/50 flex items-end sm:items-center justify-center sm:p-4" @click.self="modalRef = false">
      <div class="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5" role="dialog" aria-modal="true">
        <h4 class="text-base font-bold text-[#101828]">Referensi KKO — Taksonomi Bloom</h4>
        <p class="text-xs text-[#667085] mt-1 leading-relaxed">Gunakan untuk merumuskan tujuan pembelajaran, menyusun soal, dan menilai tingkat berpikir peserta didik. Semakin tinggi level KKO, semakin kompleks proses berpikir yang dituntut.</p>
        <div v-for="l in URUTAN_LEVEL" :key="l" class="flex gap-3 py-3 border-t border-[#E7EBF2] mt-2">
          <span class="flex-none flex items-center justify-center w-[38px] h-[29px] rounded-lg text-white text-[13px] font-extrabold" :style="{ background: BLOOM[l].warna }">{{ l }}</span>
          <div class="min-w-0">
            <div class="text-sm font-bold text-[#101828]">{{ BLOOM[l].nama }}</div>
            <p class="text-xs text-[#667085] leading-relaxed mt-0.5">{{ BLOOM[l].definisi }}</p>
            <p class="text-xs text-[#344054] leading-relaxed mt-1">{{ BLOOM[l].kko.join(' · ') }}</p>
          </div>
        </div>
        <button type="button" class="w-full min-h-12 rounded-xl bg-[#0A2A5C] text-sm font-bold text-white mt-4" @click="modalRef = false">Tutup</button>
      </div>
    </div>
  </section>
</template>
