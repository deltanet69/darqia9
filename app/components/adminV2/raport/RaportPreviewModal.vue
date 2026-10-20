<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'

export interface ReportStudent {
  id: string
  nisn: string
  nis: string
  name: string
  className: string
  gender: 'L' | 'P'
  averageScore: number
  rank: number
  kkmStatus: 'Tuntas' | 'Remedial'
  reportStatus: 'Siap Cetak' | 'Diterbitkan' | 'Draft'
  grade: 'SMP' | 'SMK'
}

interface Props {
  student: ReportStudent | null
  schoolName: string
  grade: 'SMP' | 'SMK'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handlePrint = () => {
  window.print()
}
</script>

<template>
  <div
    v-if="student"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="relative w-full bg-white rounded-3xl shadow-2xl border border-[#E7EBF2] max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <header class="px-5 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#EFF4FF] text-[#1B5FD9] flex items-center justify-center shrink-0">
            <AdminV2Icon name="printer" :size="16" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-[#101828]">Pratinjau Rapor Digital Resmi</h3>
            <p class="text-xs text-[#667085] mt-0.5">
              {{ student.name }} &bull; {{ student.className }} &bull; NISN: {{ student.nisn }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <!-- Scrollable Report Body -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        <!-- School Letterhead & Student Hero -->
        <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0A1F44] text-white shadow-md relative overflow-hidden">
          <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-inner">
                {{ student.name.charAt(0) }}
              </span>
              <div>
                <span class="text-xs font-bold text-blue-300 uppercase tracking-widest block mb-0.5">
                  {{ schoolName }}
                </span>
                <h4 class="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {{ student.name }}
                </h4>
                <div class="flex items-center gap-2 text-xs text-slate-300 font-mono mt-1 flex-wrap">
                  <span>NISN: {{ student.nisn }}</span>
                  <span>&bull;</span>
                  <span>NIS: {{ student.nis }}</span>
                  <span>&bull;</span>
                  <span class="text-blue-300 font-bold font-sans">{{ student.className }}</span>
                </div>
              </div>
            </div>

            <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/15 gap-1.5">
              <span class="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Peringkat Kelas</span>
              <span class="px-3.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs font-mono shadow-xs">
                Juara #{{ student.rank }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4 Highlights Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span class="text-[10.5px] font-extrabold text-[#667085] uppercase tracking-wider block">Rata-rata Nilai</span>
            <b class="text-2xl font-extrabold text-[#1B5FD9] font-mono block mt-1">{{ student.averageScore }}</b>
            <span class="text-[11px] text-[#667085] block mt-0.5">Skala 100</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span class="text-[10.5px] font-extrabold text-[#667085] uppercase tracking-wider block">Status KKM</span>
            <b
              class="text-lg font-extrabold block mt-1"
              :class="student.kkmStatus === 'Tuntas' ? 'text-[#059669]' : 'text-[#DC2626]'"
            >
              {{ student.kkmStatus }}
            </b>
            <span class="text-[11px] text-[#667085] block mt-0.5">Standar KKM 75</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span class="text-[10.5px] font-extrabold text-[#667085] uppercase tracking-wider block">Kehadiran KBM</span>
            <b class="text-2xl font-extrabold text-[#101828] font-mono block mt-1">98%</b>
            <span class="text-[11px] text-[#059669] font-bold block mt-0.5">0 Hari Alpa</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span class="text-[10.5px] font-extrabold text-[#667085] uppercase tracking-wider block">Sikap &amp; Karakter</span>
            <b class="text-lg font-extrabold text-[#7C3AED] block mt-1">Sangat Baik</b>
            <span class="text-[11px] text-[#667085] block mt-0.5">Predikat A</span>
          </div>
        </div>

        <!-- Tabel Capaian Kompetensi Mapel -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[#101828] font-extrabold text-xs uppercase tracking-wider">Capaian Kompetensi per Mata Pelajaran</span>
            <span class="text-[11px] text-[#667085] font-mono">T.A 2026/2027</span>
          </div>

          <div class="border border-[#E7EBF2] rounded-2xl overflow-x-auto shadow-2xs">
            <table class="w-full text-left text-xs min-w-[460px]">
              <thead class="bg-[#F8FAFC] text-[#475467] font-bold uppercase tracking-wider text-[10.5px] border-b border-[#E7EBF2]">
                <tr>
                  <th class="py-2.5 px-3.5">Mata Pelajaran</th>
                  <th class="py-2.5 px-3 text-center">KKM</th>
                  <th class="py-2.5 px-3 text-center">Nilai Akhir</th>
                  <th class="py-2.5 px-3 text-center">Predikat</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
                <tr class="hover:bg-[#F8FAFC] transition-colors">
                  <td class="py-2.5 px-3.5 font-bold text-[#101828]">Pendidikan Agama Islam &amp; Budi Pekerti</td>
                  <td class="py-2.5 px-3 text-center font-mono text-[#667085]">75</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-[#1B5FD9]">92</td>
                  <td class="py-2.5 px-3 text-center font-bold text-[#059669]">A</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F6ED] text-[#166534]">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-[#F8FAFC] transition-colors">
                  <td class="py-2.5 px-3.5 font-bold text-[#101828]">Tahfidz &amp; Tahsin Al-Qur'an</td>
                  <td class="py-2.5 px-3 text-center font-mono text-[#667085]">80</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-[#1B5FD9]">90</td>
                  <td class="py-2.5 px-3 text-center font-bold text-[#059669]">A</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F6ED] text-[#166534]">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-[#F8FAFC] transition-colors">
                  <td class="py-2.5 px-3.5 font-bold text-[#101828]">Bahasa Indonesia</td>
                  <td class="py-2.5 px-3 text-center font-mono text-[#667085]">75</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-[#1B5FD9]">88</td>
                  <td class="py-2.5 px-3 text-center font-bold text-[#059669]">A</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F6ED] text-[#166534]">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-[#F8FAFC] transition-colors">
                  <td class="py-2.5 px-3.5 font-bold text-[#101828]">Matematika</td>
                  <td class="py-2.5 px-3 text-center font-mono text-[#667085]">75</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-[#1B5FD9]">85</td>
                  <td class="py-2.5 px-3 text-center font-bold text-[#1B5FD9]">B</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F6ED] text-[#166534]">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-[#F8FAFC] transition-colors">
                  <td class="py-2.5 px-3.5 font-bold text-[#101828]">{{ grade === 'SMP' ? 'Ilmu Pengetahuan Alam (IPA Terpadu)' : 'Pemrograman Berorientasi Objek (PBO)' }}</td>
                  <td class="py-2.5 px-3 text-center font-mono text-[#667085]">75</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-[#1B5FD9]">87</td>
                  <td class="py-2.5 px-3 text-center font-bold text-[#059669]">A</td>
                  <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F6ED] text-[#166534]">Tuntas</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Catatan Wali Kelas -->
        <div class="p-4 rounded-2xl bg-[#EFF4FF] border border-[#B2CCFF] space-y-1.5">
          <span class="text-[10.5px] font-extrabold text-[#1B5FD9] uppercase tracking-wider block">Catatan &amp; Motivasi Wali Kelas</span>
          <p class="text-xs italic text-[#101828] leading-relaxed">
            "Ananda menunjukkan prestasi akademik yang sangat membanggakan dan aktif berkontribusi dalam kegiatan keagamaan sekolah. Terus pertahankan semangat dan budi pekerti luhur."
          </p>
          <div class="pt-2 flex items-center justify-between text-[11px] text-[#667085] border-t border-[#D1E0FF]">
            <span>Wali Kelas: Ustadz H. Ahmad Fauzi, S.Pd.I</span>
            <span class="font-mono text-[#059669] font-bold">&bull; Tervalidasi Digital</span>
          </div>
        </div>

        <!-- Autentikasi Dokumen Digital -->
        <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs">
          <div>
            <b class="text-[#101828] block font-bold">Dokumen Rapor Sah &bull; Terdaftar di Sistem Darqia 9</b>
            <span class="text-[11px] text-[#667085] font-mono block mt-0.5">SHA-256: 4f8b9e82c19a...2a1c0</span>
          </div>
          <span class="px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#E7F6ED] text-[#166534] shrink-0 border border-[#A6E9C5]">
            Terverifikasi
          </span>
        </div>
      </div>

      <!-- Footer Buttons -->
      <footer class="px-5 py-3.5 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-end gap-2.5 shrink-0">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#E2E8F0] transition cursor-pointer"
          @click="emit('close')"
        >
          Tutup
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer flex items-center gap-1.5"
          @click="handlePrint"
        >
          <AdminV2Icon name="printer" :size="14" />
          <span>Cetak PDF Rapor</span>
        </button>
      </footer>
    </div>
  </div>
</template>
