<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  useModulPembelajaran, bolehSunting, bolehSetujui, bolehArsip, LABEL_STATUS,
  petaPertemuan, ringkasTanggal, buatHtmlCetak,
  type ModulPembelajaran, type PeranModul
} from '~/composables/useModulPembelajaran'

const props = defineProps<{ id: string; jenjang: 'SMP' | 'SMK'; role: PeranModul }>()
const store = useModulPembelajaran()
const { penulisAktifId, guruDaftar } = store

const modul = ref<ModulPembelajaran | null>(null)
const sibuk = ref(false)
const catatan = ref('')

const peta = computed(() => modul.value ? petaPertemuan(modul.value.isi, modul.value.jumlahPertemuan || 1) : [])
const sayaPenulis = computed(() => !!modul.value && bolehSunting(modul.value, props.role, penulisAktifId.value))
const rbac = useRbac()
const namaSaya = computed(() => guruDaftar.value.find(g => g.id === penulisAktifId.value)?.name || rbac.namaAkun.value || 'Admin Darqia')

const segarkan = async () => { modul.value = await store.ambil(props.id) }
onMounted(async () => { await store.muat(props.jenjang); await segarkan() })
watch(() => props.id, segarkan)

const aksi = async (fn: () => Promise<boolean>, pesanSukses: string) => {
  if (!modul.value) return
  sibuk.value = true
  const ok = await fn()
  sibuk.value = false
  if (ok) { catatan.value = pesanSukses; await store.muat(props.jenjang); await segarkan() }
}

const doKumpulkan = () => { if (modul.value) aksi(() => store.kumpulkan(modul.value as ModulPembelajaran), 'Modul terkumpul — menunggu persetujuan admin.') }
const doSetujui = () => { if (modul.value) aksi(() => store.setujui(modul.value as ModulPembelajaran, namaSaya.value), 'Modul disetujui.') }
const doKembalikan = () => { if (modul.value) aksi(() => store.kembalikan(modul.value as ModulPembelajaran), 'Modul dikembalikan ke draf penulis.') }
const doArsipkan = () => { if (modul.value) aksi(() => store.arsipkan(modul.value as ModulPembelajaran), 'Modul diarsipkan (soft delete). Pulihkan dari daftar modul.') }
const doAturTahap = (ev: Event) => { if (modul.value) aksi(() => store.aturTahap(modul.value as ModulPembelajaran, Number((ev.target as HTMLSelectElement).value)), 'Tahap pelaksanaan diperbarui.') }

const unduhPdf = () => {
  if (!modul.value) return
  const blob = new Blob([buatHtmlCetak(modul.value)], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
</script>

<template>
  <div>
    <NuxtLink to="/adminV2/modul-ajar" class="text-[12.5px] font-medium text-blue-700">← Kembali ke daftar modul</NuxtLink>

    <div v-if="!modul" class="mt-4 bg-white border border-slate-200 rounded-2xl px-5 py-10 text-center text-[13px] text-slate-400">Memuat dokumen modul…</div>

    <template v-else>
      <div class="mt-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div class="px-5 sm:px-7 pt-6 pb-5 border-b border-slate-100">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] font-semibold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">{{ modul.jenis === 'projek' ? 'MODUL AJAR PROJEK' : 'MODUL AJAR' }}</span>
            <span class="inline-block text-[11px] font-semibold rounded px-2 py-1" :class="modul.status === 'disetujui' ? 'bg-emerald-600 text-white' : modul.status === 'menunggu' ? 'bg-amber-300 text-amber-900' : 'bg-slate-400 text-white'">{{ LABEL_STATUS[modul.status] }}</span>
            <span v-if="modul.deletedAt" class="inline-block text-[11px] font-semibold rounded px-2 py-1 bg-red-100 text-red-600">TERARSIP</span>
            <span class="ml-auto flex gap-2">
              <NuxtLink v-if="sayaPenulis" :to="`/adminV2/modul-ajar/${modul.id}/sunting`" class="text-[12.5px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-1.5 transition">Sunting</NuxtLink>
              <button class="text-[12.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition" @click="unduhPdf">Unduh PDF</button>
            </span>
          </div>
          <h1 class="text-[24px] leading-8 font-semibold text-blue-950 mt-3">{{ modul.judul || '(judul belum diisi)' }}</h1>
          <p class="text-[13px] text-slate-500 mt-1">{{ modul.jenis === 'projek' ? 'Projek kokurikuler lintas mata pelajaran' : 'Modul ajar mata pelajaran' }} · Sintaks {{ modul.isi.model }}</p>
          <div class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-slate-500">
            <span class="font-medium text-slate-600">Status:</span>
            <template v-if="modul.status === 'draf'"><span>Modul masih draf — belum dikumpulkan.</span></template>
            <template v-else-if="modul.status === 'menunggu'"><span>Dikumpulkan penulis {{ ringkasTanggal(modul.submittedAt) }} — menunggu persetujuan admin.</span></template>
            <template v-else><span>Dikumpulkan {{ ringkasTanggal(modul.submittedAt) }}</span><span class="text-slate-300">→</span><span class="font-medium text-emerald-700">Disetujui {{ modul.approvedBy || 'Admin' }} {{ ringkasTanggal(modul.approvedAt) }}</span></template>
            <span class="text-slate-400">· modul guru lain hanya bisa dibaca; sunting khusus penulis</span>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button v-if="modul.status === 'draf' && sayaPenulis" :disabled="sibuk" class="bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-medium rounded-lg px-3.5 py-2 transition disabled:opacity-50" @click="doKumpulkan">Kumpulkan untuk Persetujuan</button>
            <template v-if="modul.status === 'menunggu' && bolehSetujui(role)">
              <button :disabled="sibuk" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-medium rounded-lg px-3.5 py-2 transition disabled:opacity-50" @click="doSetujui">Setujui Modul</button>
              <button :disabled="sibuk" class="text-[12.5px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-3.5 py-2 transition disabled:opacity-50" @click="doKembalikan">Kembalikan ke Draf</button>
            </template>
            <button v-if="bolehArsip(modul, role, penulisAktifId)" :disabled="sibuk" class="text-[12.5px] font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg px-3.5 py-2 transition disabled:opacity-50" @click="doArsipkan">Arsipkan</button>
            <span v-if="catatan" class="text-[12.5px] text-emerald-700 self-center">{{ catatan }}</span>
          </div>

          <div v-if="modul.status === 'disetujui'" class="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] text-slate-500">
            <span class="font-medium text-slate-600">Tahap pelaksanaan saat ini:</span>
            <select :value="modul.tahapBerjalan" :disabled="!sayaPenulis || sibuk" class="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[12.5px] text-slate-600 disabled:opacity-50" @change="doAturTahap">
              <option :value="0">Belum dimulai</option>
              <option v-for="(t, i) in modul.isi.langkah" :key="i" :value="i + 1">Tahap {{ i + 1 }} — {{ t.tahap }}</option>
            </select>
            <span v-if="!sayaPenulis" class="text-slate-400">diatur oleh penulis</span>
          </div>
        </div>

        <div class="px-5 sm:px-7 py-5 space-y-6 text-[13.5px] leading-relaxed text-slate-600">
          <div>
            <h2 class="text-[14px] font-semibold text-blue-950">A. Identitas Modul</h2>
            <dl class="mt-2.5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              <div class="flex gap-2"><dt class="w-36 shrink-0 text-slate-400">Nama Penyusun</dt><dd class="font-medium text-slate-700">{{ modul.penyusun }}</dd></div>
              <div class="flex gap-2"><dt class="w-36 shrink-0 text-slate-400">Satuan Pendidikan</dt><dd class="font-medium text-slate-700">{{ modul.satuan || '—' }}</dd></div>
              <div class="flex gap-2"><dt class="w-36 shrink-0 text-slate-400">Mata Pelajaran</dt><dd class="font-medium text-slate-700">{{ modul.mapel || '—' }}</dd></div>
              <div class="flex gap-2"><dt class="w-36 shrink-0 text-slate-400">Fase / Kelas</dt><dd class="font-medium text-slate-700">{{ modul.fase || '—' }}<template v-if="modul.kelas"> / {{ modul.kelas }}</template></dd></div>
              <div class="flex gap-2"><dt class="w-36 shrink-0 text-slate-400">Alokasi Waktu</dt><dd class="font-medium text-slate-700">{{ modul.alokasiJp ?? '—' }} JP<template v-if="modul.jumlahPertemuan"> · {{ modul.jumlahPertemuan }} pertemuan</template><template v-if="modul.durasiMinggu"> · {{ modul.durasiMinggu }} minggu</template> (1 JP = {{ jenjang === 'SMP' ? 40 : 45 }} menit)</dd></div>
              <div class="flex gap-2"><dt class="w-36 shrink-0 text-slate-400">Nama Projek</dt><dd class="font-medium text-slate-700">{{ modul.judul }}</dd></div>
            </dl>
          </div>

          <div>
            <h2 class="text-[14px] font-semibold text-blue-950">B. Komponen Inti</h2>
            <div class="mt-2.5 space-y-3.5">
              <div>
                <div class="font-medium text-slate-700">Capaian Pembelajaran <span class="text-slate-400 font-normal">({{ modul.isi.cpReferensi }})</span></div>
                <p class="mt-1">{{ modul.isi.cp || '—' }}</p>
              </div>
              <div>
                <div class="font-medium text-slate-700">Dimensi Profil Lulusan yang ditargetkan</div>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  <span v-for="d in modul.isi.dimensi" :key="d" class="text-[12px] bg-blue-950 text-white rounded-full px-3 py-1 font-medium">{{ d }}</span>
                  <span v-if="!modul.isi.dimensi.length" class="text-slate-400">—</span>
                  <span class="text-[12px] text-slate-400 py-1">dari 8 Dimensi Profil Lulusan</span>
                </div>
              </div>
              <div>
                <div class="font-medium text-slate-700">Tujuan Pembelajaran</div>
                <ol class="mt-1.5 space-y-1.5 list-none">
                  <li v-for="(t, i) in modul.isi.tujuan" :key="i" class="flex gap-2.5"><span class="shrink-0 w-5 h-5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold flex items-center justify-center mt-0.5">{{ i + 1 }}</span>{{ t }}</li>
                  <li v-if="!modul.isi.tujuan.length" class="text-slate-400">—</li>
                </ol>
              </div>
              <div>
                <div class="font-medium text-slate-700">Pemahaman Bermakna</div>
                <p class="mt-1">{{ modul.isi.pemahamanBermakna || '—' }}</p>
              </div>
              <div>
                <div class="font-medium text-slate-700">Pertanyaan Pemantik</div>
                <ul class="mt-1.5 space-y-1 list-none">
                  <li v-for="(p, i) in modul.isi.pertanyaanPemantik" :key="i">— {{ p }}</li>
                  <li v-if="!modul.isi.pertanyaanPemantik.length" class="text-slate-400">—</li>
                </ul>
              </div>
              <div class="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <div class="font-medium text-slate-700">Target Peserta Didik</div>
                  <p class="mt-1">{{ modul.isi.targetPeserta || '—' }}</p>
                </div>
                <div>
                  <div class="font-medium text-slate-700">Model Pembelajaran</div>
                  <p class="mt-1">{{ modul.isi.model }}</p>
                </div>
              </div>
              <div>
                <div class="font-medium text-slate-700">Sarana dan Prasarana</div>
                <p class="mt-1">{{ modul.isi.sarana || '—' }}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-[14px] font-semibold text-blue-950">C. Produk Projek</h2>
            <p class="mt-2"><span class="font-medium text-slate-700">Produk akhir:</span> {{ modul.isi.produkDeskripsi || '—' }}</p>
            <p class="mt-1.5"><span class="font-medium text-slate-700">Mitra / DU-DI:</span> {{ modul.isi.mitra || '—' }}</p>
            <div class="font-medium text-slate-700 mt-3">Kriteria keberhasilan</div>
            <div class="mt-2 overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-[12px] min-w-[560px]">
                <thead>
                  <tr class="bg-slate-50 text-left">
                    <th class="px-3 py-2 font-semibold text-slate-600">Aspek</th>
                    <th class="px-3 py-2 font-semibold text-slate-600">Sangat Baik (4)</th>
                    <th class="px-3 py-2 font-semibold text-slate-600">Baik (3)</th>
                    <th class="px-3 py-2 font-semibold text-slate-600">Cukup (2)</th>
                    <th class="px-3 py-2 font-semibold text-slate-600">Perlu Bimbingan (1)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(k, i) in modul.isi.kriteria" :key="i"><td class="px-3 py-2 font-medium text-slate-700">{{ k.aspek }}</td><td class="px-3 py-2">{{ k.sb }}</td><td class="px-3 py-2">{{ k.b }}</td><td class="px-3 py-2">{{ k.c }}</td><td class="px-3 py-2">{{ k.pb }}</td></tr>
                  <tr v-if="!modul.isi.kriteria.length"><td colspan="5" class="px-3 py-2 text-slate-400">Belum ada kriteria.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-[14px] font-semibold text-blue-950">D. Langkah Kegiatan (Sintaks PjBL)</h2>
            <div class="mt-2 overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-[12.5px] min-w-[620px]">
                <thead>
                  <tr class="bg-slate-50 text-left">
                    <th class="px-3 py-2 font-semibold text-slate-600 w-[22%]">Tahap</th>
                    <th class="px-3 py-2 font-semibold text-slate-600">Kegiatan Guru</th>
                    <th class="px-3 py-2 font-semibold text-slate-600">Kegiatan Siswa</th>
                    <th class="px-3 py-2 font-semibold text-slate-600 w-[70px]">Waktu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(l, i) in modul.isi.langkah" :key="i"><td class="px-3 py-2 font-medium text-slate-700">{{ i + 1 }}. {{ l.tahap }}</td><td class="px-3 py-2">{{ l.guru }}</td><td class="px-3 py-2">{{ l.siswa }}</td><td class="px-3 py-2">{{ l.jp }} JP</td></tr>
                </tbody>
              </table>
            </div>
            <div class="mt-2.5 flex flex-wrap gap-1.5 text-[12px]">
              <span v-for="p in peta" :key="p.ke" class="bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-2.5 py-1 font-medium">Pertemuan {{ p.ke }} ({{ p.jp }} JP): Tahap {{ p.tahapDari === p.tahapKe ? p.tahapDari : `${p.tahapDari}–${p.tahapKe}` }}</span>
              <span class="text-slate-400 py-1">Total {{ modul.isi.langkah.reduce((a, l) => a + (Number(l.jp) || 0), 0) }} JP<template v-if="modul.alokasiJp"> — alokasi di Identitas {{ modul.alokasiJp }} JP</template>.</span>
            </div>
          </div>

          <div>
            <h2 class="text-[14px] font-semibold text-blue-950">E. Asesmen</h2>
            <div class="mt-2.5 space-y-2">
              <p><span class="font-medium text-slate-700">Awal (diagnostik):</span> {{ modul.isi.asesmen.diagnostik || '—' }}</p>
              <p><span class="font-medium text-slate-700">Proses (formatif):</span> {{ modul.isi.asesmen.formatif || '—' }}</p>
              <p><span class="font-medium text-slate-700">Produk (sumatif):</span> {{ modul.isi.asesmen.sumatif || '—' }}</p>
              <p><span class="font-medium text-slate-700">Dimensi Profil Lulusan:</span> {{ modul.isi.asesmen.profil || '—' }}</p>
            </div>
            <div class="mt-3 overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-[12.5px] min-w-[420px]">
                <thead><tr class="bg-slate-50 text-left"><th class="px-3 py-2 font-semibold text-slate-600">Komponen</th><th class="px-3 py-2 font-semibold text-slate-600 w-[80px]">Bobot</th><th class="px-3 py-2 font-semibold text-slate-600">Instrumen</th></tr></thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(b, i) in modul.isi.bobot" :key="i"><td class="px-3 py-2 font-medium text-slate-700">{{ b.komponen }}</td><td class="px-3 py-2">{{ b.persen }}%</td><td class="px-3 py-2">{{ b.instrumen }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <h2 class="text-[14px] font-semibold text-blue-950">F. Diferensiasi</h2>
              <p class="mt-2"><span class="font-medium text-slate-700">Remedial:</span> {{ modul.isi.diferensiasi.remedial || '—' }}</p>
              <p class="mt-1.5"><span class="font-medium text-slate-700">Pengayaan:</span> {{ modul.isi.diferensiasi.pengayaan || '—' }}</p>
            </div>
            <div>
              <h2 class="text-[14px] font-semibold text-blue-950">G. Refleksi</h2>
              <p class="mt-2"><span class="font-medium text-slate-700">Guru:</span> {{ modul.isi.refleksi.guru || '—' }}</p>
              <p class="mt-1.5"><span class="font-medium text-slate-700">Siswa:</span> {{ modul.isi.refleksi.siswa || '—' }}</p>
            </div>
          </div>

          <div>
            <h2 class="text-[14px] font-semibold text-blue-950">H. Lampiran</h2>
            <div class="mt-2.5 space-y-2">
              <div v-for="(l, i) in modul.isi.lampiran" :key="i" class="flex items-center gap-2.5"><span class="text-[10.5px] font-semibold text-white bg-blue-600 rounded-md px-2 py-1">{{ l.jenis }}</span><span>{{ l.judul }}</span><span class="text-slate-400 text-[12px]">{{ l.keterangan }}</span></div>
              <div v-if="!modul.isi.lampiran.length" class="text-slate-400">Belum ada lampiran berkas.</div>
              <div class="flex gap-2.5"><span class="font-medium text-slate-700">Glosarium:</span><span>{{ modul.isi.glosarium || '—' }}</span></div>
              <div class="flex gap-2.5"><span class="font-medium text-slate-700">Daftar pustaka:</span><span>{{ modul.isi.daftarPustaka || '—' }}</span></div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 flex flex-wrap gap-6 text-[12.5px] text-slate-500">
            <div>Disusun oleh<br><span class="font-medium text-slate-700">{{ modul.penyusun }}</span><br>{{ ringkasTanggal(modul.createdAt) }}</div>
            <div v-if="modul.status === 'disetujui'">Disetujui oleh<br><span class="font-medium text-slate-700">{{ modul.approvedBy || 'Admin Darqia' }}</span><br>{{ ringkasTanggal(modul.approvedAt) }}</div>
            <span class="ml-auto text-slate-400">Dokumen ini yang diunduh guru sebagai PDF untuk arsip &amp; supervisi.</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
