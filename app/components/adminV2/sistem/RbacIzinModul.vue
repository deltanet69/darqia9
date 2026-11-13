<script setup lang="ts">
// Matriks izin per modul & sub-modul (brief rbacupdate.md): dikelompokkan sesuai grup menu AdminV2,
// tiap modul bisa dibuka-tutup. Mobile-first: centang membungkus ke baris baru, tanpa gulir horizontal.
import { computed, ref } from 'vue'
import { GROUPS } from '~/components/adminV2/adminV2Data'
import {
  RBAC_AKSI, RBAC_DAUN, RBAC_MODUL, RBAC_MODUL_CAKUPAN, RBAC_SUBMODUL, kunciSub, modulDariJudul, terapkanCentang,
  type AksiRbac, type CakupanPeran, type CakupanRbac, type IzinPeran
} from '~/composables/rbacCore'

const props = defineProps<{ izin: IzinPeran, cakupan: CakupanPeran, nonaktif: boolean }>()
const emit = defineEmits<{
  (e: 'update:izin', v: IzinPeran): void
  (e: 'update:cakupan', v: CakupanPeran): void
}>()

// Grup = urutan menu AdminV2; modul yang tidak ada di menu (mis. Tabungan Siswa) masuk "Lainnya".
const grup = computed(() => {
  const dipakai = new Set<string>()
  const hasil = GROUPS.map(g => {
    const modul = [...new Set(g.items.map(([judul]) => modulDariJudul(judul)).filter((m): m is string => !!m && RBAC_MODUL.includes(m)))]
    modul.forEach(m => dipakai.add(m))
    return { label: g.label, modul }
  }).filter(g => g.modul.length)
  const sisa = RBAC_MODUL.filter(m => !dipakai.has(m))
  return sisa.length ? [...hasil, { label: 'Lainnya', modul: sisa }] : hasil
})

const cari = ref('')
const grupTampil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  if (!q) return grup.value
  return grup.value
    .map(g => ({ ...g, modul: g.modul.filter(m => m.toLowerCase().includes(q) || (RBAC_SUBMODUL[m] || []).some(s => s.label.toLowerCase().includes(q))) }))
    .filter(g => g.modul.length)
})

const daun = (modul: string) => RBAC_SUBMODUL[modul]?.length
  ? RBAC_SUBMODUL[modul].map(s => ({ kunci: kunciSub(modul, s.kunci), label: s.label }))
  : [{ kunci: modul, label: modul }]

const terbuka = ref<Record<string, boolean>>({})
const sedangTerbuka = (modul: string) => !!cari.value.trim() || !!terbuka.value[modul]
const togel = (modul: string) => { terbuka.value = { ...terbuka.value, [modul]: !sedangTerbuka(modul) } }

const centang = (kunci: string, aksi: AksiRbac) => {
  if (props.nonaktif) return
  emit('update:izin', terapkanCentang(props.izin, kunci, aksi, !props.izin[kunci]?.[aksi]))
}
// Satu aksi untuk semua baris di daftar (satu modul, atau seluruh modul).
const penuh = (kunci: string[], aksi: AksiRbac) => kunci.length > 0 && kunci.every(k => props.izin[k]?.[aksi])
const centangBanyak = (kunci: string[], aksi: AksiRbac) => {
  if (props.nonaktif) return
  const nilai = !penuh(kunci, aksi)
  let hasil = props.izin
  for (const k of kunci) hasil = terapkanCentang(hasil, k, aksi, nilai)
  emit('update:izin', hasil)
}

const ringkas = (modul: string) => {
  const d = daun(modul)
  const lihat = d.filter(x => props.izin[x.kunci]?.lihat).length
  if (!lihat) return { teks: 'Tanpa akses', nada: 'mati' }
  if (d.length === 1) {
    const aksi = RBAC_AKSI.filter(a => props.izin[d[0]!.kunci]?.[a.kunci]).map(a => a.label)
    return { teks: aksi.join(' · '), nada: aksi.length === 4 ? 'penuh' : 'sebagian' }
  }
  const semua = d.every(x => RBAC_AKSI.every(a => props.izin[x.kunci]?.[a.kunci]))
  return { teks: `${lihat} dari ${d.length} sub-menu`, nada: semua ? 'penuh' : 'sebagian' }
}

const ubahCakupan = (modul: string, nilai: CakupanRbac) => {
  if (props.nonaktif) return
  emit('update:cakupan', { ...props.cakupan, [modul]: nilai })
}
</script>

<template>
  <section class="mt-4 rounded-xl border border-slate-300 bg-white">
    <div class="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center">
      <div class="min-w-0 flex-1">
        <p class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Izin per modul & sub-menu</p>
        <p class="mt-0.5 text-[12px] text-slate-500">Buka modul untuk mengatur tiap sub-menu. Buat / Ubah / Hapus otomatis menyalakan Lihat.</p>
      </div>
      <input v-model="cari" type="search" placeholder="Cari modul atau sub-menu" aria-label="Cari modul atau sub-menu" class="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-blue-600 sm:w-64">
    </div>

    <!-- Centang satu aksi untuk seluruh modul -->
    <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
      <span class="mr-1 text-[12px] font-medium text-slate-600">Semua modul:</span>
      <button
        v-for="a in RBAC_AKSI" :key="a.kunci" type="button" :disabled="nonaktif"
        class="min-h-9 rounded-lg border px-3 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        :class="penuh(RBAC_DAUN, a.kunci) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400'"
        :aria-pressed="penuh(RBAC_DAUN, a.kunci)" @click="centangBanyak(RBAC_DAUN, a.kunci)"
      >{{ a.label }}</button>
    </div>

    <p v-if="!grupTampil.length" class="px-4 py-8 text-center text-[13px] text-slate-500">Tidak ada modul yang cocok dengan "{{ cari }}".</p>

    <div v-for="g in grupTampil" :key="g.label" class="border-b border-slate-200 last:border-b-0">
      <p class="bg-slate-50/60 px-4 pb-1.5 pt-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{{ g.label }}</p>
      <ul class="divide-y divide-slate-100">
        <li v-for="modul in g.modul" :key="modul">
          <!-- Kepala modul -->
          <button
            type="button" class="flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
            :aria-expanded="sedangTerbuka(modul)" @click="togel(modul)"
          >
            <span class="min-w-0 flex-1">
              <span class="block text-[13.5px] font-semibold text-slate-800">{{ modul }}</span>
              <span class="mt-0.5 inline-flex items-center gap-1.5 text-[11.5px]" :class="{ 'text-slate-500': ringkas(modul).nada === 'mati', 'text-blue-700': ringkas(modul).nada === 'penuh', 'text-amber-700': ringkas(modul).nada === 'sebagian' }">
                <span class="h-1.5 w-1.5 rounded-full" :class="{ 'bg-slate-300': ringkas(modul).nada === 'mati', 'bg-blue-600': ringkas(modul).nada === 'penuh', 'bg-amber-500': ringkas(modul).nada === 'sebagian' }" aria-hidden="true" />
                {{ ringkas(modul).teks }}<template v-if="RBAC_MODUL_CAKUPAN.includes(modul) && cakupan[modul] === 'sendiri'"> · data milik sendiri</template>
              </span>
            </span>
            <svg class="h-4 w-4 shrink-0 text-slate-400 transition" :class="sedangTerbuka(modul) ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" /></svg>
          </button>

          <!-- Isi modul -->
          <div v-if="sedangTerbuka(modul)" class="space-y-3 bg-slate-50/50 px-4 pb-4 pt-1">
            <div v-if="RBAC_MODUL_CAKUPAN.includes(modul)" class="rounded-lg border border-slate-200 bg-white p-3">
              <p class="text-[12px] font-semibold text-slate-700">Cakupan data</p>
              <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" :aria-label="`Cakupan data ${modul}`">
                <button
                  v-for="opsi in ([['semua', 'Semua data', 'Semua kelas & mapel di jenjangnya'], ['sendiri', 'Milik sendiri', 'Hanya kelas & mapel yang diampu (jadwal mengajar / wali kelas)']] as const)"
                  :key="opsi[0]" type="button" role="radio" :disabled="nonaktif"
                  :aria-checked="(cakupan[modul] || 'semua') === opsi[0]"
                  class="rounded-lg border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50"
                  :class="(cakupan[modul] || 'semua') === opsi[0] ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 bg-white hover:border-blue-300'"
                  @click="ubahCakupan(modul, opsi[0])"
                >
                  <span class="block text-[12.5px] font-semibold text-slate-800">{{ opsi[1] }}</span>
                  <span class="block text-[11.5px] text-slate-500">{{ opsi[2] }}</span>
                </button>
              </div>
            </div>

            <!-- Satu aksi untuk semua sub-menu modul ini -->
            <div v-if="daun(modul).length > 1" class="flex flex-wrap items-center gap-2">
              <span class="mr-1 text-[11.5px] font-medium text-slate-500">Semua sub-menu:</span>
              <button
                v-for="a in RBAC_AKSI" :key="a.kunci" type="button" :disabled="nonaktif"
                class="min-h-8 rounded-md border px-2.5 text-[11.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                :class="penuh(daun(modul).map(d => d.kunci), a.kunci) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400'"
                :aria-pressed="penuh(daun(modul).map(d => d.kunci), a.kunci)" @click="centangBanyak(daun(modul).map(d => d.kunci), a.kunci)"
              >{{ a.label }}</button>
            </div>

            <ul class="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <li v-for="d in daun(modul)" :key="d.kunci" class="flex flex-col gap-2 px-3 py-2.5 md:flex-row md:items-center">
                <span class="min-w-0 flex-1 text-[13px]" :class="izin[d.kunci]?.lihat ? 'font-medium text-slate-800' : 'text-slate-500'">{{ daun(modul).length > 1 ? d.label : 'Akses modul' }}</span>
                <div class="grid grid-cols-4 gap-1.5 md:w-[312px]">
                  <button
                    v-for="a in RBAC_AKSI" :key="a.kunci" type="button" :disabled="nonaktif"
                    class="flex min-h-9 items-center justify-center gap-1 rounded-md border text-[11.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                    :class="izin[d.kunci]?.[a.kunci] ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-slate-700'"
                    :aria-pressed="!!izin[d.kunci]?.[a.kunci]" :aria-label="`${a.label} ${modul}${daun(modul).length > 1 ? ' — ' + d.label : ''}`"
                    @click="centang(d.kunci, a.kunci)"
                  >
                    <svg v-if="izin[d.kunci]?.[a.kunci]" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd" /></svg>
                    {{ a.label }}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
