<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import {
  type ClassRombel,
  type ClassScheduleItem,
  type ClassExamItem,
  getInitials,
  getAvatarColor
} from '../kelasV2Data'

interface Props {
  cls: ClassRombel
  schedule: ClassScheduleItem[]
  exams: ClassExamItem[]
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const presensiPeriod = ref<'harian' | 'mingguan' | 'bulanan'>('harian')

// Today's schedule items (Senin)
const todaySchedule = computed(() => {
  return props.schedule.filter(s => s.day === 'Senin')
})

// Near exams (UH)
const upcomingExams = computed(() => {
  return props.exams.filter(e => e.category === 'UH').slice(0, 3)
})

// Class Activities
const classActivities = [
  { id: 'act-1', date: 'Jumat, 23 Okt 2026', time: '07:00–08:30 WIB', title: 'Jumat Bersih & Literasi Al-Qur\'an', loc: 'Ruang Kelas & Koridor', lead: 'Wali Kelas' },
  { id: 'act-2', date: 'Sabtu, 24 Okt 2026', time: '09:00–11:30 WIB', title: 'Pertemuan Paguyuban Orang Tua Siswa (Parenting)', loc: 'Aula Lantai 2', lead: 'Komite Kelas' },
  { id: 'act-3', date: 'Selasa, 27 Okt 2026', time: '13:30–15:00 WIB', title: 'Bimbingan Konseling & Portofolio Karir', loc: 'Lab Konseling', lead: 'Guru BK & Wali Kelas' }
]
</script>

<template>
  <div class="space-y-4">
    <!-- Top Row: Wali Kelas Card & Quick Presensi Filter Widget -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 1. Wali Kelas (Assigned Card) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3.5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#667085]">
              Wali Kelas (Penanggung Jawab)
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F6ED] text-[#166534]">
              SK Aktif
            </span>
          </div>

          <div class="flex items-start gap-3.5">
            <div
              class="w-13 h-13 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-br"
              :class="getAvatarColor(cls.name)"
            >
              {{ getInitials(cls.teacher) }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-extrabold text-base text-[#101828] leading-snug truncate">
                {{ cls.teacher }}
              </h4>
              <p class="text-xs text-[#667085] font-mono mt-0.5 truncate">
                NIP. {{ cls.teacherNip }}
              </p>
              <div class="flex items-center gap-2 mt-2 text-xs text-[#344054]">
                <span class="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] font-medium">
                  {{ cls.room }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3.5 border-t border-[#F1F5F9] mt-3.5 flex items-center justify-between gap-2 text-xs">
          <a
            :href="`https://wa.me/62${cls.teacherPhone.replace(/[^0-9]/g, '').slice(1)}`"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF2F7] hover:bg-[#E2E8F0] text-[#101828] font-bold transition"
          >
            <AdminV2Icon name="phone" :size="13" />
            <span>Kontak WA</span>
          </a>
          <span class="text-[11px] text-[#667085] truncate font-medium">
            {{ cls.teacherEmail }}
          </span>
        </div>
      </div>

      <!-- 2. Presensi Kehadiran Kelas (Filter Harian, Mingguan, Bulanan) -->
      <div class="lg:col-span-2 bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9] mb-3.5">
            <div>
              <h4 class="text-sm font-extrabold text-[#101828]">Presensi Kehadiran Rombel</h4>
              <p class="text-xs text-[#667085] mt-0.5">Monitoring tingkat kehadiran peserta didik di kelas ini</p>
            </div>

            <!-- Segmented Control Filter Presensi: Harian, Mingguan, Bulanan -->
            <div class="inline-flex items-center bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl">
              <button
                type="button"
                class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                :class="presensiPeriod === 'harian' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
                @click="presensiPeriod = 'harian'"
              >
                Harian
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                :class="presensiPeriod === 'mingguan' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
                @click="presensiPeriod = 'mingguan'"
              >
                Mingguan
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                :class="presensiPeriod === 'bulanan' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
                @click="presensiPeriod = 'bulanan'"
              >
                Bulanan
              </button>
            </div>
          </div>

          <!-- Presensi Breakdown Chips -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-3 rounded-xl bg-[#E7F6ED] border border-[#A6E9C5] text-center">
              <span class="text-[11px] font-bold text-[#14532D] block">Hadir</span>
              <b class="text-xl font-extrabold font-mono text-[#166534] block mt-0.5">
                {{ presensiPeriod === 'harian' ? cls.studentsCount - 3 : Math.round(cls.studentsCount * 0.96) }}
              </b>
              <span class="text-[10px] text-[#14532D]">Siswa ({{ cls.attendance }}%)</span>
            </div>
            <div class="p-3 rounded-xl bg-[#FEF6EE] border border-[#F9DBAF] text-center">
              <span class="text-[11px] font-bold text-[#7A271A] block">Sakit</span>
              <b class="text-xl font-extrabold font-mono text-[#B54708] block mt-0.5">
                {{ presensiPeriod === 'harian' ? '1' : '3' }}
              </b>
              <span class="text-[10px] text-[#7A271A]">Surat dokter</span>
            </div>
            <div class="p-3 rounded-xl bg-[#EFF4FF] border border-[#B2CCFF] text-center">
              <span class="text-[11px] font-bold text-[#175CD3] block">Izin</span>
              <b class="text-xl font-extrabold font-mono text-[#1B5FD9] block mt-0.5">
                {{ presensiPeriod === 'harian' ? '1' : '2' }}
              </b>
              <span class="text-[10px] text-[#175CD3]">Izin keluarga</span>
            </div>
            <div class="p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-center">
              <span class="text-[11px] font-bold text-[#912018] block">Alpa</span>
              <b class="text-xl font-extrabold font-mono text-[#D92D20] block mt-0.5">
                {{ presensiPeriod === 'harian' ? '1' : '1' }}
              </b>
              <span class="text-[10px] text-[#912018]">Tanpa kabar</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-[#F1F5F9] mt-3 flex items-center justify-between text-xs text-[#667085]">
          <span>Periode: {{ presensiPeriod === 'harian' ? 'Hari Ini (Senin)' : presensiPeriod === 'mingguan' ? 'Minggu Ke-3 Oktober' : 'Oktober 2026' }}</span>
          <span class="font-bold text-[#101828]">Total: {{ cls.studentsCount }} Siswa Terdaftar</span>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Jadwal Hari Ini (Highlighted Active) & Jadwal Kegiatan / UH -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 3. Jadwal Pelajaran Hari Ini (dengan highlight jam yang sedang berlangsung) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div class="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1B5FD9] animate-pulse" />
            <h4 class="text-sm font-extrabold text-[#101828]">Jadwal Pelajaran Hari Ini (Senin)</h4>
          </div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#12459B]">
            7 Sesi Pembelajaran
          </span>
        </div>

        <div class="divide-y divide-[#F1F5F9] space-y-1">
          <div
            v-for="item in todaySchedule"
            :key="item.id"
            class="p-2.5 rounded-xl transition flex items-center justify-between gap-3"
            :class="item.isCurrentPeriod ? 'bg-[#EFF4FF] border border-[#B2CCFF]' : 'hover:bg-[#F8FAFC]'"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0"
                :class="item.isCurrentPeriod ? 'bg-[#1B5FD9] text-white' : 'bg-[#EFF2F7] text-[#475467]'"
              >
                {{ item.session }}
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h5 class="font-extrabold text-xs text-[#101828] truncate">
                    {{ item.subject }}
                  </h5>
                  <span
                    v-if="item.isCurrentPeriod"
                    class="px-2 py-0.2 rounded-full text-[9.5px] font-extrabold bg-[#1B5FD9] text-white shrink-0"
                  >
                    Sedang Berlangsung
                  </span>
                </div>
                <p class="text-[11px] text-[#667085] truncate">
                  {{ item.teacher }} &bull; {{ item.time }}
                </p>
              </div>
            </div>

            <!-- Guru Presence Sign -->
            <div class="shrink-0 text-right">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1"
                :class="item.guruPresent ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#EFF2F7] text-[#667085]'"
              >
                <i class="w-1.5 h-1.5 rounded-full" :class="item.guruPresent ? 'bg-[#16A34A]' : 'bg-[#98A2B3]'" />
                {{ item.guruPresent ? 'Guru Hadir' : 'Menunggu' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Jadwal Kegiatan Kelas & Jadwal Ujian Harian Terdekat -->
      <div class="space-y-4">
        <!-- Jadwal Ujian Harian -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div class="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3">
            <h4 class="text-sm font-extrabold text-[#101828]">Jadwal Ujian Harian Terdekat</h4>
            <span class="text-xs font-bold text-[#1B5FD9]">Asesmen CBT</span>
          </div>

          <div class="space-y-2">
            <div
              v-for="ex in upcomingExams"
              :key="ex.id"
              class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between gap-3"
            >
              <div>
                <span class="text-[10px] font-bold text-[#1B5FD9] block">{{ ex.code }} &bull; {{ ex.date }}</span>
                <b class="text-xs font-bold text-[#101828] block">{{ ex.title }}</b>
                <span class="text-[11px] text-[#667085]">{{ ex.time }} &bull; Pengawas: {{ ex.supervisor }}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E8F0FE] text-[#12459B] shrink-0">
                {{ ex.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Jadwal Kegiatan Kelas -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div class="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3">
            <h4 class="text-sm font-extrabold text-[#101828]">Jadwal Kegiatan &amp; Agenda Kelas</h4>
            <span class="text-xs font-bold text-[#667085]">Bulan Ini</span>
          </div>

          <div class="space-y-2">
            <div
              v-for="act in classActivities"
              :key="act.id"
              class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-start gap-2.5"
            >
              <div class="w-8 h-8 rounded-lg bg-[#EFF2F7] text-[#344054] flex items-center justify-center shrink-0 mt-0.5">
                <AdminV2Icon name="cal" :size="14" />
              </div>
              <div class="min-w-0 flex-1">
                <b class="text-xs font-bold text-[#101828] block truncate">{{ act.title }}</b>
                <span class="text-[11px] text-[#667085] block mt-0.5">{{ act.date }} &bull; {{ act.time }}</span>
                <span class="text-[10.5px] text-[#98A2B3]">{{ act.loc }} &bull; Koord: {{ act.lead }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
