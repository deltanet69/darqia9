<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  bangunSlotJam,
  type IstirahatSetelan, type JadwalSetelan
} from '~/composables/useJadwalPelajaran'

const props = defineProps<{ open: boolean; setelan: JadwalSetelan; menyimpan: boolean }>()
const emit = defineEmits<{ tutup: []; simpan: [setelan: JadwalSetelan] }>()

const lokal = reactive<JadwalSetelan>({ mulai: '07:00', durasiJP: 45, jumlahJam: 8, istirahat: [] })

watch(() => props.open, (terbuka) => {
  if (!terbuka) return
  lokal.mulai = props.setelan.mulai
  lokal.durasiJP = props.setelan.durasiJP
  lokal.jumlahJam = props.setelan.jumlahJam
  lokal.istirahat = props.setelan.istirahat.map(i => ({ ...i }))
})

const pratinjau = computed(() => {
  const slots = bangunSlotJam({
    mulai: lokal.mulai || '07:00',
    durasiJP: Math.max(20, Number(lokal.durasiJP) || 45),
    jumlahJam: Math.min(12, Math.max(4, Number(lokal.jumlahJam) || 8)),
    istirahat: lokal.istirahat
  })
  const bagian = slots.map(s => s.jenis === 'jam' ? `${s.mulai} Jam ${s.ke}` : `${s.mulai} ${s.label} (${s.mulai}–${s.selesai})`)
  const akhir = slots.length ? slots[slots.length - 1].selesai : ''
  return `${bagian.join(' · ')} · ${akhir} pulang`
})

const tambahIstirahat = () => {
  lokal.istirahat.push({ setelah: 4, durasi: 20, label: 'Istirahat' } satisfies IstirahatSetelan)
}
const hapusIstirahat = (i: number) => { lokal.istirahat.splice(i, 1) }

const kirim = () => {
  emit('simpan', {
    mulai: lokal.mulai || '07:00',
    durasiJP: Math.max(20, Number(lokal.durasiJP) || 45),
    jumlahJam: Math.min(12, Math.max(4, Number(lokal.jumlahJam) || 8)),
    istirahat: lokal.istirahat
      .map(i => ({ setelah: Number(i.setelah) || 1, durasi: Number(i.durasi) || 20, label: String(i.label || 'Istirahat') }))
      .filter(i => i.setelah >= 1 && i.durasi >= 1)
      .sort((a, b) => a.setelah - b.setelah)
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="absolute inset-0 bg-blue-950/50" @click="emit('tutup')" />
    <div class="relative bg-white w-full sm:max-w-[520px] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white z-10">
        <div>
          <div class="text-[15px] font-semibold text-blue-950">Pengaturan Jam &amp; Istirahat</div>
          <div class="text-[12px] text-slate-500">Berlaku untuk jenjang aktif · timetable tersusun ulang otomatis.</div>
        </div>
        <button type="button" class="ml-auto w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Tutup" @click="emit('tutup')">✕</button>
      </div>

      <div class="px-5 py-4 space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-[12px] font-medium text-slate-600" for="js-mulai">Jam Mulai</label>
            <input id="js-mulai" v-model="lokal.mulai" type="time" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]">
          </div>
          <div>
            <label class="text-[12px] font-medium text-slate-600" for="js-durasi">Durasi 1 JP (menit)</label>
            <input id="js-durasi" v-model.number="lokal.durasiJP" type="number" min="20" max="90" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]">
          </div>
          <div>
            <label class="text-[12px] font-medium text-slate-600" for="js-jumlah">Jam per Hari</label>
            <input id="js-jumlah" v-model.number="lokal.jumlahJam" type="number" min="4" max="12" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px]">
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <div class="text-[12.5px] font-semibold text-blue-950">Jeda Istirahat</div>
            <button type="button" class="ml-auto text-[12.5px] font-medium text-blue-700 hover:text-blue-800" @click="tambahIstirahat">+ Tambah Istirahat</button>
          </div>
          <div class="mt-2 space-y-2">
            <div v-for="(it, i) in lokal.istirahat" :key="i" class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
              <span class="text-[12.5px] text-slate-500">Setelah jam ke-</span>
              <input v-model.number="it.setelah" type="number" min="1" max="12" class="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] bg-white">
              <span class="text-[12.5px] text-slate-500">istirahat</span>
              <input v-model.number="it.durasi" type="number" min="5" max="90" class="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] bg-white">
              <span class="text-[12.5px] text-slate-500">menit · label</span>
              <input v-model="it.label" type="text" class="flex-1 min-w-[130px] border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] bg-white">
              <button type="button" class="text-[12.5px] font-medium text-red-500 hover:text-red-600 px-1" @click="hapusIstirahat(i)">Hapus</button>
            </div>
            <p v-if="!lokal.istirahat.length" class="text-[12px] text-slate-400">Tidak ada jeda istirahat — hari berjalan tanpa jeda.</p>
          </div>
          <p class="text-[11.5px] text-slate-400 mt-2">Pola umum sekolah: istirahat 20 menit setelah jam ke-4, lalu istirahat &amp; shalat 40 menit setelah jam ke-6.</p>
        </div>

        <div class="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3">
          <div class="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">Pratinjau Susunan Hari</div>
          <p class="text-[12.5px] text-slate-600 mt-1 leading-relaxed">{{ pratinjau }}</p>
        </div>
        <p class="text-[11.5px] text-slate-400">Catatan: jadwal yang sudah tersimpan dengan pola lama tidak berubah waktunya — jadwal tersebut ditandai di bawah timetable agar diselaraskan.</p>
      </div>

      <div class="px-5 py-4 border-t border-slate-100 flex gap-2 sticky bottom-0 bg-white">
        <button type="button" class="ml-auto text-[13px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 transition" @click="emit('tutup')">Batal</button>
        <button type="button" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[13px] font-medium rounded-lg px-4 py-2 transition" :disabled="menyimpan" @click="kirim">
          {{ menyimpan ? 'Menerapkan…' : 'Terapkan Pengaturan' }}
        </button>
      </div>
    </div>
  </div>
</template>
