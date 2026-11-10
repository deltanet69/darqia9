<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Jadwal Ujian</h2>
      <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Jadwal dapat dilihat kapan saja. Ujian hanya dapat dimulai saat jamnya tiba.</p>
    </div>

    <div class="bg-slate-200/70 p-1 rounded-2xl grid grid-cols-3 gap-1" role="tablist" aria-label="Jenis ujian">
      <button
        v-for="j in jenisTab"
        :key="j"
        type="button"
        role="tab"
        :aria-selected="aktif === j"
        class="py-2 px-1 rounded-xl text-[11.5px] sm:text-xs font-extrabold leading-tight transition-all"
        :class="aktif === j ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'"
        @click="aktif = j"
      >
        {{ JENIS_LABEL[j] }}
      </button>
    </div>

    <p v-if="aktif !== 'harian'" class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium leading-relaxed">
      Detail {{ JENIS_LABEL[aktif] }} (mata pelajaran dan materi) terbuka mulai 2 hari sebelum hari ujian.
    </p>

    <template v-if="kelompok.length">
      <section v-for="hari in kelompok" :key="hari.kunci" class="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <h3 class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-[#0A2A5C]">{{ hari.label }}</h3>
        <ul class="divide-y divide-slate-100">
          <li v-for="u in hari.ujian" :key="u.source + u.id">
            <button type="button" class="w-full text-left px-4 py-3.5 flex items-start gap-3 active:bg-slate-50" @click="emit('buka', u)">
              <div class="w-[78px] shrink-0 text-xs font-extrabold text-slate-900 tabular-nums leading-snug">
                {{ jamWib(u.mulai) }}
                <span class="block text-[11px] font-semibold text-slate-400">{{ u.durasi }} menit</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-extrabold text-slate-900 break-words">{{ u.mapel || 'Terkunci' }}</div>
                <div class="text-xs text-slate-500 break-words">{{ u.nama || 'Detail terbuka H-2' }}</div>
              </div>
              <span class="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full" :class="KEADAAN_INFO[keadaan(u)].kelas">{{ KEADAAN_INFO[keadaan(u)].label }}</span>
            </button>
          </li>
        </ul>
      </section>
    </template>
    <div v-else class="bg-white border-2 border-slate-200/90 rounded-3xl p-8 text-center text-sm text-slate-500">
      Belum ada jadwal {{ JENIS_LABEL[aktif].toLowerCase() }}.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  JENIS_LABEL, KEADAAN_INFO, jamWib, kelompokPerHari, keadaanUjian,
  type JenisUjian, type UjianSiswa
} from '~/utils/cbtSiswaJadwal'

const props = defineProps<{ ujian: UjianSiswa[], now: number }>()
const emit = defineEmits<{ (e: 'buka', u: UjianSiswa): void }>()

const jenisTab: JenisUjian[] = ['akhir', 'tengah_semester', 'harian']
// Tab awal: jenis pertama (urutan Akhir, Tengah Semester, Harian) yang punya jadwal.
const aktif = ref<JenisUjian>(jenisTab.find(j => props.ujian.some(u => u.jenis === j)) ?? 'akhir')

const keadaan = (u: UjianSiswa) => keadaanUjian(u, props.now)
const kelompok = computed(() => kelompokPerHari(props.ujian.filter(u => u.jenis === aktif.value)))
</script>
