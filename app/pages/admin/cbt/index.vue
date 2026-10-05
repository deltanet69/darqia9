<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
import AdminLineChart from '~/components/admin/AdminLineChart.vue'
import AdminBarChart from '~/components/admin/AdminBarChart.vue'

definePageMeta({ layout: 'admin' })

type ExamStatus = 'Berlangsung' | 'Terjadwal' | 'Selesai'
type QuestionType = 'PG' | 'PG Kompleks' | 'Isian' | 'Esai'
type Difficulty = 'Mudah' | 'Sedang' | 'Sukar'
type Exam = { id: string; name: string; subject: string; classroom: string; date: string; duration: number; participants: number; status: ExamStatus; average: number; kkm: number; token: string; collected: number; doing: number }
type Question = { id: string; code: string; subject: string; type: QuestionType; difficulty: Difficulty; text: string; key: string; used: number }
type Student = { id: string; nis: string; name: string; classroom: string }

const exams = useState<Exam[]>('admin-cbt-exams', () => [
  { id: 'E1', name: 'UTS Informatika', subject: 'Informatika', classroom: 'X RPL 1', date: '30 Sep 2026', duration: 90, participants: 40, status: 'Berlangsung', average: 0, kkm: 75, token: 'INF930', collected: 26, doing: 9 },
  { id: 'E2', name: 'Ujian Jaringan Komputer', subject: 'Jaringan Komputer', classroom: 'XII TKJ 1', date: '30 Sep 2026', duration: 120, participants: 38, status: 'Berlangsung', average: 0, kkm: 75, token: 'JAR930', collected: 21, doing: 12 },
  { id: 'E3', name: 'Try Out Ujian Sekolah', subject: 'Matematika', classroom: 'IX-A', date: '2 Okt 2026', duration: 120, participants: 44, status: 'Terjadwal', average: 0, kkm: 75, token: 'MTK102', collected: 0, doing: 0 },
  { id: 'E4', name: 'UAS Matematika', subject: 'Matematika', classroom: 'VIII-B', date: '5 Okt 2026', duration: 90, participants: 44, status: 'Terjadwal', average: 0, kkm: 75, token: 'MTK105', collected: 0, doing: 0 },
  { id: 'E5', name: 'UTS Pendidikan Agama', subject: 'PAI', classroom: 'VII-A', date: '27 Sep 2026', duration: 60, participants: 44, status: 'Selesai', average: 82.4, kkm: 75, token: 'PAI927', collected: 44, doing: 0 },
  { id: 'E6', name: 'Ujian Basis Data', subject: 'Basis Data', classroom: 'XI RPL 1', date: '25 Sep 2026', duration: 90, participants: 40, status: 'Selesai', average: 78.9, kkm: 75, token: 'BDS925', collected: 40, doing: 0 }
])

const questionSeeds: Array<[string, string, QuestionType, Difficulty, string, string]> = [
  ['INF-001', 'Informatika', 'PG', 'Mudah', 'Perangkat yang berfungsi sebagai “otak” komputer adalah…', 'Prosesor (CPU)'],
  ['INF-002', 'Informatika', 'PG', 'Sedang', 'Topologi jaringan di mana seluruh node terhubung ke satu titik pusat adalah…', 'Star'],
  ['INF-003', 'Informatika', 'PG', 'Sukar', 'Subnet mask yang tepat untuk alamat IP 192.168.1.10/24 adalah…', '255.255.255.0'],
  ['INF-004', 'Informatika', 'Esai', 'Sedang', 'Jelaskan perbedaan hardware dan software beserta masing-masing dua contohnya!', 'Hardware berwujud fisik; software berupa program.'],
  ['INF-005', 'Informatika', 'Isian', 'Mudah', 'Kepanjangan dari LAN adalah …', 'Local Area Network'],
  ['INF-006', 'Informatika', 'PG', 'Sedang', 'Ekstensi file untuk dokumen presentasi PowerPoint adalah…', '.pptx'],
  ['INF-007', 'Informatika', 'PG Kompleks', 'Sukar', 'Berikut yang termasuk sistem operasi komputer adalah…', 'Windows, Linux, macOS'],
  ['INF-008', 'Informatika', 'Isian', 'Sedang', 'Satuan terkecil dalam penyimpanan data digital disebut…', 'bit'],
  ['JAR-001', 'Jaringan Komputer', 'PG', 'Mudah', 'Perintah dasar untuk menguji konektivitas ke host lain adalah…', 'ping'],
  ['JAR-002', 'Jaringan Komputer', 'PG Kompleks', 'Sedang', 'Berikut yang termasuk perangkat jaringan adalah…', 'Switch, Router, Access Point'],
  ['JAR-003', 'Jaringan Komputer', 'Esai', 'Sedang', 'Jelaskan cara kerja DHCP dalam pemberian alamat IP kepada client!', 'Proses DORA: discover, offer, request, acknowledge.'],
  ['JAR-004', 'Jaringan Komputer', 'PG', 'Sukar', 'Kabel UTP untuk menghubungkan dua perangkat sejenis memakai susunan…', 'Crossover'],
  ['JAR-005', 'Jaringan Komputer', 'PG', 'Mudah', 'Perangkat yang memancarkan sinyal WiFi di kelas adalah…', 'Access Point'],
  ['JAR-006', 'Jaringan Komputer', 'Isian', 'Sedang', 'Protokol yang digunakan browser untuk mengakses website adalah…', 'HTTP'],
  ['JAR-007', 'Jaringan Komputer', 'PG', 'Sedang', 'Lapisan model OSI yang mengatur pengiriman paket antar jaringan adalah…', 'Network'],
  ['JAR-008', 'Jaringan Komputer', 'Esai', 'Sukar', 'Bandingkan topologi star dan mesh dari sisi biaya dan keandalan jaringan!', 'Star lebih murah; mesh lebih andal.'],
  ['MTK-001', 'Matematika', 'PG', 'Mudah', 'Hasil dari 3² + 4² adalah…', '25'],
  ['MTK-002', 'Matematika', 'Isian', 'Mudah', 'FPB dari 12 dan 18 adalah…', '6'],
  ['MTK-003', 'Matematika', 'PG', 'Sedang', 'Gradien garis dengan persamaan 2x + 4y = 8 adalah…', '−1/2'],
  ['MTK-004', 'Matematika', 'Esai', 'Sukar', 'Selesaikan persamaan kuadrat x² − 5x + 6 = 0!', 'x = 2 atau x = 3'],
  ['MTK-005', 'Matematika', 'PG', 'Sedang', 'Median dari data 5, 7, 9, 6, 8 adalah…', '7'],
  ['MTK-006', 'Matematika', 'PG', 'Mudah', 'Bentuk paling sederhana dari pecahan 4/8 adalah…', '1/2'],
  ['MTK-007', 'Matematika', 'Isian', 'Sedang', 'Nilai dari √144 adalah…', '12'],
  ['MTK-008', 'Matematika', 'PG', 'Sukar', 'Jika f(x) = 2x + 3, maka nilai f(5) adalah…', '13'],
  ['PAI-001', 'PAI', 'PG', 'Mudah', 'Rukun iman yang pertama adalah iman kepada…', 'Allah SWT'],
  ['PAI-002', 'PAI', 'Isian', 'Mudah', 'Surah pertama dalam Al-Qur’an adalah surah…', 'Al-Fatihah'],
  ['PAI-003', 'PAI', 'PG', 'Sedang', 'Hukum bacaan nun mati bertemu dengan huruf ba adalah…', 'Iqlab'],
  ['PAI-004', 'PAI', 'Esai', 'Sedang', 'Jelaskan hikmah melaksanakan salat berjamaah!', 'Mempererat ukhuwah dan melatih disiplin.'],
  ['PAI-005', 'PAI', 'PG', 'Mudah', 'Jumlah rakaat dalam salat Magrib adalah…', '3 rakaat'],
  ['PAI-006', 'PAI', 'Isian', 'Sedang', 'Kitab suci yang diturunkan kepada Nabi Musa AS adalah…', 'Taurat'],
  ['PAI-007', 'PAI', 'PG', 'Sukar', 'Hukum mempelajari ilmu tajwid bagi umat Islam adalah…', 'Fardhu kifayah'],
  ['PAI-008', 'PAI', 'PG Kompleks', 'Sedang', 'Berikut yang termasuk Asmaul Husna adalah…', 'Ar-Rahman, Al-Malik'],
  ['BD-001', 'Basis Data', 'PG', 'Mudah', 'Perintah SQL untuk menampilkan seluruh data dari tabel siswa adalah…', 'SELECT * FROM siswa'],
  ['BD-002', 'Basis Data', 'PG', 'Mudah', 'Primary key pada sebuah tabel berfungsi untuk…', 'Mengidentifikasi tiap baris secara unik'],
  ['BD-003', 'Basis Data', 'PG', 'Sedang', 'Atribut yang nilainya tidak boleh sama antar baris disebut…', 'Unique'],
  ['BD-004', 'Basis Data', 'Esai', 'Sukar', 'Rancang skema tabel untuk sistem perpustakaan beserta relasinya!', 'Tabel buku, anggota, dan peminjaman.'],
  ['BD-005', 'Basis Data', 'PG', 'Mudah', 'Ekstensi file database Microsoft Access adalah…', '.accdb'],
  ['BD-006', 'Basis Data', 'Isian', 'Sedang', 'Perintah SQL untuk menambahkan data baru ke tabel adalah…', 'INSERT'],
  ['BD-007', 'Basis Data', 'PG', 'Sedang', 'Kolom yang merujuk ke primary key tabel lain disebut…', 'Foreign key'],
  ['BD-008', 'Basis Data', 'PG Kompleks', 'Sukar', 'Berikut yang termasuk jenis relasi antar tabel adalah…', 'One-to-Many, Many-to-Many']
]

const bank = useState<Question[]>('admin-cbt-bank', () => questionSeeds.map((item, index) => ({ id: `B${index + 1}`, code: item[0], subject: item[1], type: item[2], difficulty: item[3], text: item[4], key: item[5], used: 1 + (index % 6) })))
const studentNames = ['Ahmad Fauzan', 'Siti Aisyah', 'Muhammad Rizky', 'Nabila Zahra', 'Farhan Maulana', 'Putri Safitri', 'Raka Pratama', 'Aulia Permata', 'Dimas Nugraha', 'Salma Hidayat', 'Fikri Ramadhan', 'Najwa Hakim']
const students: Student[] = exams.value.flatMap((exam, examIndex) => studentNames.slice(0, 8).map((name, index) => ({ id: `${exam.id}-S${index + 1}`, nis: String(2026001 + examIndex * 10 + index), name, classroom: exam.classroom })))

const tabs = [
  { id: 'summary', label: 'Ringkasan', icon: 'grid' },
  { id: 'exams', label: 'Daftar Ujian', icon: 'monitor' },
  { id: 'bank', label: 'Bank Soal', icon: 'bank' },
  { id: 'results', label: 'Hasil per Siswa', icon: 'user' },
  { id: 'insight', label: 'Insight', icon: 'spark' }
] as const
const examStatusOptions: Array<'all' | ExamStatus> = ['all', 'Berlangsung', 'Terjadwal', 'Selesai']
const activeTab = ref<(typeof tabs)[number]['id']>('summary')
const selectedExamId = ref<string | null>(null)
const selectedStudentId = ref<string | null>(null)
const query = ref('')
const classFilter = ref('all')
const statusFilter = ref<'all' | ExamStatus>('all')
const bankQuery = ref('')
const subjectFilter = ref('all')
const typeFilter = ref('all')
const difficultyFilter = ref('all')
const resultClass = ref('X RPL 1')
const resultStudent = ref('E1-S1')
const examModalOpen = ref(false)
const questionModal = ref<'closed' | 'add' | 'preview'>('closed')
const previewQuestion = ref<Question | null>(null)
const revealKey = ref(false)
const message = ref('')
const messageKind = ref<'ok' | 'info'>('ok')
const essayScores = reactive<Record<string, number>>({})
let toastTimer: ReturnType<typeof setTimeout> | undefined

const examForm = reactive({ name: '', subject: 'Informatika', classroom: 'X RPL 1', date: '8 Okt 2026', duration: 90, kkm: 75 })
const questionForm = reactive<{ subject: string; type: QuestionType; difficulty: Difficulty; code: string; text: string; key: string }>({ subject: 'Informatika', type: 'PG', difficulty: 'Mudah', code: '', text: '', key: '' })
const selectedExam = computed(() => exams.value.find(item => item.id === selectedExamId.value) ?? null)
const selectedStudent = computed(() => students.find(item => item.id === selectedStudentId.value) ?? null)
const completedExams = computed(() => exams.value.filter(item => item.status === 'Selesai'))
const liveExams = computed(() => exams.value.filter(item => item.status === 'Berlangsung'))
const classOptions = computed(() => [...new Set(exams.value.map(item => item.classroom))])
const subjectOptions = computed(() => [...new Set(bank.value.map(item => item.subject))])
const filteredExams = computed(() => exams.value.filter(item => (classFilter.value === 'all' || item.classroom === classFilter.value) && (statusFilter.value === 'all' || item.status === statusFilter.value) && `${item.name} ${item.subject} ${item.classroom}`.toLowerCase().includes(query.value.toLowerCase())))
const filteredQuestions = computed(() => bank.value.filter(item => (subjectFilter.value === 'all' || item.subject === subjectFilter.value) && (typeFilter.value === 'all' || item.type === typeFilter.value) && (difficultyFilter.value === 'all' || item.difficulty === difficultyFilter.value) && `${item.code} ${item.text} ${item.key}`.toLowerCase().includes(bankQuery.value.toLowerCase())))
const resultStudents = computed(() => students.filter((item, index, source) => item.classroom === resultClass.value && source.findIndex(candidate => candidate.nis === item.nis && candidate.classroom === item.classroom) === index))
const activeResultStudent = computed(() => resultStudents.value.find(item => item.id === resultStudent.value) ?? resultStudents.value[0])
const resultExams = computed(() => exams.value.filter(item => item.classroom === resultClass.value))
const averageCompleted = computed(() => completedExams.value.reduce((sum, item) => sum + item.average, 0) / Math.max(1, completedExams.value.length))
const hardestQuestions = computed(() => bank.value.filter(item => completedExams.value.some(exam => exam.subject === item.subject)).slice().sort((a, b) => correctPercent(a) - correctPercent(b)).slice(0, 5))
const basisDataEssay = computed(() => bank.value.find(item => item.code === 'BD-004'))

const showToast = (value: string, kind: 'ok' | 'info' = 'ok') => { message.value = value; messageKind.value = kind; if (toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(() => { message.value = '' }, 2800) }
const initials = (value: string) => value.split(' ').slice(0, 2).map(item => item[0]).join('')
const statusClass = (status: ExamStatus) => ({
  Berlangsung: 'bg-violet-50 text-violet-700 border border-violet-200',
  Terjadwal: 'bg-amber-50 text-amber-700 border border-amber-200',
  Selesai: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
})[status]
const typeClass = (type: QuestionType) => ({
  PG: 'bg-blue-50 text-blue-700 border border-blue-200',
  'PG Kompleks': 'bg-purple-50 text-purple-700 border border-purple-200',
  Isian: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  Esai: 'bg-amber-50 text-amber-700 border border-amber-200'
})[type]
const difficultyClass = (value: Difficulty) => ({
  Mudah: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Sedang: 'bg-amber-50 text-amber-700 border border-amber-200',
  Sukar: 'bg-rose-50 text-rose-700 border border-rose-200'
})[value]
const correctPercent = (question: Question) => 31 + ((Number(question.id.slice(1)) * 17) % 65)
const questionsForExam = (exam: Exam) => bank.value.filter(item => item.subject === exam.subject).slice(0, 8)
const examStudents = (exam: Exam) => students.filter(item => item.classroom === exam.classroom).slice(0, 8)
const scoreFor = (exam: Exam, student: Student) => exam.status === 'Terjadwal' ? null : 62 + ((Number(student.nis.slice(-2)) * 7 + Number(exam.id.replace(/\D/g, '') || 1) * 3) % 36)
const studentStatus = (exam: Exam, index: number) => exam.status === 'Selesai' ? 'Sudah' : exam.status === 'Terjadwal' ? 'Belum' : index < 5 ? 'Sudah' : index < 7 ? 'Mengerjakan' : 'Belum'
const openExam = (id: string, studentId: string | null = null) => { selectedExamId.value = id; selectedStudentId.value = studentId; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const resetDetail = () => { if (selectedStudentId.value) selectedStudentId.value = null; else selectedExamId.value = null }
const setExamStatus = (status: ExamStatus) => { if (!selectedExam.value) return; selectedExam.value.status = status; if (status === 'Selesai') { selectedExam.value.collected = selectedExam.value.participants; selectedExam.value.doing = 0; selectedExam.value.average ||= 80.6 } showToast(`Status ujian diubah menjadi ${status}.`) }
const openAddExam = () => { Object.assign(examForm, { name: '', subject: subjectOptions.value[0], classroom: classOptions.value[0], date: '8 Okt 2026', duration: 90, kkm: 75 }); examModalOpen.value = true }
const saveExam = () => { if (!examForm.name.trim()) return showToast('Isi nama ujian terlebih dahulu.', 'info'); const id = `E${Date.now()}`; const token = `${examForm.subject.slice(0, 3).toUpperCase()}${String(Date.now()).slice(-3)}`; exams.value.unshift({ id, name: examForm.name.trim(), subject: examForm.subject, classroom: examForm.classroom, date: examForm.date || '8 Okt 2026', duration: examForm.duration || 90, participants: 0, status: 'Terjadwal', average: 0, kkm: examForm.kkm || 75, token, collected: 0, doing: 0 }); examModalOpen.value = false; activeTab.value = 'exams'; showToast(`Ujian “${examForm.name}” terjadwal — token ${token}.`) }
const openQuestionPreview = (item: Question) => { previewQuestion.value = item; revealKey.value = false; questionModal.value = 'preview' }
const openAddQuestion = () => { Object.assign(questionForm, { subject: subjectOptions.value[0], type: 'PG', difficulty: 'Mudah', code: '', text: '', key: '' }); questionModal.value = 'add' }
const saveQuestion = () => { if (!questionForm.code.trim() || !questionForm.text.trim() || !questionForm.key.trim()) return showToast('Lengkapi kode, soal, dan kunci.', 'info'); bank.value.unshift({ id: `B${Date.now()}`, code: questionForm.code.trim().toUpperCase(), subject: questionForm.subject, type: questionForm.type, difficulty: questionForm.difficulty, text: questionForm.text.trim(), key: questionForm.key.trim(), used: 0 }); questionModal.value = 'closed'; showToast(`Soal ${questionForm.code.toUpperCase()} masuk bank soal.`) }
const deleteQuestion = (item: Question) => { bank.value = bank.value.filter(question => question.id !== item.id); showToast(`Soal ${item.code} dihapus.`) }
const chooseResultClass = () => { resultStudent.value = resultStudents.value[0]?.id ?? '' }
const exportExam = () => { const exam = selectedExam.value; if (!exam) return; const rows = examStudents(exam).map((student, index) => `${student.nis},${student.name},${studentStatus(exam, index)},${scoreFor(exam, student) ?? ''}`); const blob = new Blob([`NIS,Nama,Status,Nilai\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `rekap-${exam.id.toLowerCase()}.csv`; link.click(); URL.revokeObjectURL(url); showToast(`Rekap ${exam.name} diekspor.`) }
const saveEssay = (question: Question) => { const value = Math.max(0, Math.min(10, Math.round(essayScores[question.id] ?? 0))); essayScores[question.id] = value; showToast(`Nilai esai tersimpan: ${value}/10.`) }
const openResultDetail = (exam: Exam) => { const student = activeResultStudent.value; if (student) openExam(exam.id, students.find(item => item.classroom === exam.classroom && item.nis === student.nis)?.id ?? examStudents(exam)[0]?.id ?? null) }

// Charts data computed
const scoreTrendSeries = computed(() => [
  { name: 'Rata-rata', color: '#2563eb', values: completedExams.value.map(e => e.average) }
])
const scoreTrendLabels = computed(() => completedExams.value.map(e => e.subject.slice(0, 10)))

const scoreDistDatasets = computed(() => [
  { name: 'Siswa', color: '#8b5cf6', values: [5, 9, 18, 27, 15] }
])

onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer) })
</script>

<template>
  <section class="space-y-6 animate-fadeUp">
    <!-- VIEW: DETAIL SISWA -->
    <template v-if="selectedExam && selectedStudent">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
        <div>
          <button class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-2 transition cursor-pointer" type="button" @click="resetDetail">
            ‹ Detail Ujian
          </button>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Penilaian Siswa</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">{{ selectedExam.name }} &bull; {{ selectedExam.subject }} &bull; Kelas {{ selectedExam.classroom }}</p>
        </div>
      </div>

      <!-- Ringkasan Siswa Card -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
        <div class="flex flex-wrap items-center gap-4 sm:gap-6">
          <span class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
            {{ initials(selectedStudent.name) }}
          </span>
          <div class="flex-1 min-w-[180px]">
            <b class="block text-lg font-bold text-slate-900">{{ selectedStudent.name }}</b>
            <span class="block text-xs sm:text-sm text-slate-500 font-medium">NIS {{ selectedStudent.nis }} &bull; Kelas {{ selectedExam.classroom }}</span>
            <small class="block text-xs text-slate-400 mt-1 font-mono">Dikumpulkan: 30 Sep 2026, 09:17 &bull; Durasi: 76 mnt &bull; Peringkat: #2</small>
          </div>
          <div class="w-20 h-20 rounded-full border-8 border-blue-600 flex items-center justify-center font-black text-2xl text-slate-900 shrink-0 font-mono shadow-inner">
            {{ scoreFor(selectedExam, selectedStudent) ?? '—' }}
          </div>
          <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold shrink-0 shadow-sm" :class="(scoreFor(selectedExam, selectedStudent) ?? 0) >= selectedExam.kkm ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
            {{ (scoreFor(selectedExam, selectedStudent) ?? 0) >= selectedExam.kkm ? 'Lulus KKM' : 'Belum Lulus' }}
          </span>
        </div>
      </article>

      <!-- Stat Mini Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-xl font-bold text-slate-900 font-mono">5<span class="text-sm font-medium text-slate-400">/7</span></b>
          <span class="block text-xs text-slate-500 mt-1">Jawaban Objektif Benar</span>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-xl font-bold text-slate-900 font-mono">50<span class="text-sm font-medium text-slate-400">/70</span></b>
          <span class="block text-xs text-slate-500 mt-1">Skor Objektif</span>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-xl font-bold text-slate-900 font-mono">{{ Object.keys(essayScores).length }}<span class="text-sm font-medium text-slate-400">/1</span></b>
          <span class="block text-xs text-slate-500 mt-1">Esai Dinilai</span>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-xl font-bold text-slate-900 font-mono">{{ 50 + Object.values(essayScores).reduce((a, b) => a + b, 0) }}<span class="text-sm font-medium text-slate-400">/80</span></b>
          <span class="block text-xs text-slate-500 mt-1">Total Skor</span>
        </div>
      </div>

      <!-- Rincian Jawaban Card -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Rincian Jawaban
          </h3>
          <span class="text-xs text-slate-400 font-medium">{{ questionsForExam(selectedExam).length }} soal &bull; simpan untuk menilai esai</span>
        </div>
        <div class="p-6 space-y-5">
          <div v-for="(question, index) in questionsForExam(selectedExam)" :key="question.id" class="flex gap-4 items-start pt-5 first:pt-0 border-t border-slate-100 first:border-0">
            <span class="w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm" :class="question.type === 'Esai' && essayScores[question.id] === undefined ? 'bg-amber-100 text-amber-800' : index % 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-900 leading-relaxed">{{ question.text }}</div>
              <div class="flex flex-wrap gap-2 my-2.5">
                <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="typeClass(question.type)">{{ question.type }}</span>
                <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="difficultyClass(question.difficulty)">{{ question.difficulty }}</span>
                <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600">bobot 10</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <small class="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">JAWABAN SISWA</small>
                  <span class="text-xs sm:text-sm text-slate-800 leading-relaxed">{{ question.type === 'Esai' ? 'Jawaban uraian siswa tersimpan pada sistem CBT.' : index % 3 ? question.key : 'Jawaban lain' }}</span>
                </div>
                <div class="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5">
                  <small class="block text-[10px] font-bold text-emerald-700 tracking-wider mb-1">KUNCI / PEDOMAN</small>
                  <span class="text-xs sm:text-sm text-slate-800 leading-relaxed">{{ question.key }}</span>
                </div>
              </div>
              <div v-if="question.type === 'Esai' && essayScores[question.id] === undefined" class="mt-3.5 flex flex-wrap gap-2 items-center">
                <input v-model.number="essayScores[question.id]" type="number" min="0" max="10" placeholder="0–10" class="w-24 px-3 py-2 text-xs bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-mono" />
                <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-105 active:scale-95" type="button" @click="saveEssay(question)">
                  <AdminIcon name="check" size="14" /> Simpan Nilai Esai
                </button>
              </div>
              <div v-else class="mt-3 text-xs text-slate-600">
                Skor: <b class="font-bold text-slate-900 font-mono">{{ question.type === 'Esai' ? essayScores[question.id] : index % 3 ? 10 : 0 }}</b> / 10
              </div>
            </div>
          </div>
        </div>
      </article>
    </template>

    <!-- VIEW: DETAIL UJIAN -->
    <template v-else-if="selectedExam">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
        <div>
          <button class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-2 transition cursor-pointer" type="button" @click="resetDetail">
            ‹ Daftar Ujian
          </button>
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedExam.name }}</h2>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" :class="statusClass(selectedExam.status)">
              <span class="w-2 h-2 rounded-full" :class="selectedExam.status === 'Berlangsung' ? 'bg-violet-600 animate-ping' : selectedExam.status === 'Terjadwal' ? 'bg-amber-500' : 'bg-emerald-500'" />
              {{ selectedExam.status }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{{ selectedExam.subject }} &bull; Kelas {{ selectedExam.classroom }} &bull; {{ selectedExam.date }}</p>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <button v-if="selectedExam.status === 'Terjadwal'" class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-105 active:scale-95" type="button" @click="setExamStatus('Berlangsung')">
            <AdminIcon name="check" size="15" /> Mulai Sekarang
          </button>
          <button v-if="selectedExam.status === 'Berlangsung'" class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-105 active:scale-95" type="button" @click="setExamStatus('Selesai')">
            <AdminIcon name="lock" size="15" /> Akhiri &amp; Kunci
          </button>
          <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition hover:scale-105 active:scale-95" type="button" @click="exportExam">
            <AdminIcon name="dl" size="15" /> Ekspor
          </button>
        </div>
      </div>

      <!-- Info Ujian Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div v-for="item in [['Mata Pelajaran', selectedExam.subject], ['Kelas', selectedExam.classroom], ['Tanggal', selectedExam.date], ['Durasi', `${selectedExam.duration} menit`], ['KKM', selectedExam.kkm], ['Jumlah Soal', `${questionsForExam(selectedExam).length} soal`], ['Token', selectedExam.token], ['Status', selectedExam.status]]" :key="String(item[0])" class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-sm sm:text-base font-bold text-slate-900 truncate font-mono">{{ item[1] }}</b>
          <span class="block text-xs text-slate-400 mt-0.5">{{ item[0] }}</span>
        </div>
      </div>

      <!-- Stat Ujian Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-2xl font-black text-slate-900 font-mono">{{ selectedExam.participants }}</b>
          <span class="block text-xs text-slate-400 mt-1">Peserta</span>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-2xl font-black text-slate-900 font-mono">{{ selectedExam.collected }}<span class="text-sm font-medium text-slate-400">/{{ selectedExam.participants }}</span></b>
          <span class="block text-xs text-slate-400 mt-1">Sudah Kumpul &bull; {{ selectedExam.doing }} kerjakan</span>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-2xl font-black text-slate-900 font-mono">{{ selectedExam.average || '—' }}</b>
          <span class="block text-xs text-slate-400 mt-1">Rata-rata Nilai</span>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <b class="block text-2xl font-black text-slate-900 font-mono">{{ selectedExam.status === 'Selesai' ? '96 / 62' : '—' }}</b>
          <span class="block text-xs text-slate-400 mt-1">Tertinggi / Terendah</span>
        </div>
      </div>

      <!-- Analisis per Soal Card -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Analisis per Soal
          </h3>
          <span class="text-xs text-slate-400 font-medium">Diurut dari tingkat kesulitan tertinggi</span>
        </div>
        <div class="p-6 space-y-4">
          <div v-for="(question, index) in questionsForExam(selectedExam).slice().sort((a, b) => correctPercent(a) - correctPercent(b))" :key="question.id" class="pt-4 first:pt-0 border-t border-slate-100 first:border-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0" :class="correctPercent(question) < 45 ? 'bg-rose-100 text-rose-700' : correctPercent(question) < 65 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                {{ index + 1 }}
              </span>
              <b class="text-xs sm:text-sm font-medium text-slate-800 flex-1 min-w-[140px] truncate">{{ question.text }}</b>
              <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold" :class="typeClass(question.type)">{{ question.type }}</span>
              <strong class="text-xs font-bold text-rose-600 font-mono">{{ correctPercent(question) }}%</strong>
            </div>
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <i class="block h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" :style="{ width: `${correctPercent(question)}%` }" />
            </div>
          </div>
        </div>
      </article>

      <!-- Tabel Hasil Peserta Card -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
            Hasil Peserta
          </h3>
          <span class="text-xs text-slate-400 font-medium">{{ examStudents(selectedExam).length }} data peserta</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th class="px-5 py-3.5">Nama Siswa</th>
                <th class="px-5 py-3.5">NIS</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5 text-right">Nilai</th>
                <th class="px-5 py-3.5">KKM</th>
                <th class="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(student, index) in examStudents(selectedExam)" :key="student.id" class="hover:bg-blue-50/50 transition">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {{ initials(student.name) }}
                    </span>
                    <b class="font-bold text-slate-900">{{ student.name }}</b>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-slate-500 font-mono">{{ student.nis }}</td>
                <td class="px-5 py-3.5">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="studentStatus(selectedExam, index) === 'Sudah' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : studentStatus(selectedExam, index) === 'Mengerjakan' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-slate-100 text-slate-600'">
                    {{ studentStatus(selectedExam, index) }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">{{ scoreFor(selectedExam, student) ?? '—' }}</td>
                <td class="px-5 py-3.5">
                  <span v-if="scoreFor(selectedExam, student) !== null" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="(scoreFor(selectedExam, student) ?? 0) >= selectedExam.kkm ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                    {{ (scoreFor(selectedExam, student) ?? 0) >= selectedExam.kkm ? 'Lulus' : 'Remedial' }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button v-if="scoreFor(selectedExam, student) !== null" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition hover:scale-105 active:scale-95" type="button" @click="selectedStudentId = student.id">
                    <AdminIcon name="eye" size="14" /> Nilai
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </template>

    <!-- VIEW UTAMA: TABS -->
    <template v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
        <div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Manajemen CBT</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Ujian digital end-to-end: jadwal, pelaksanaan, bank soal &amp; penilaian</p>
        </div>
        <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer" type="button" @click="openAddExam">
          <AdminIcon name="plus" size="16" /> Buat Ujian
        </button>
      </div>

      <!-- Tab Buttons -->
      <div class="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit" role="tablist">
        <button v-for="tab in tabs" :key="tab.id" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer" :class="activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'" type="button" @click="activeTab = tab.id">
          <AdminIcon :name="tab.icon" size="16" /> {{ tab.label }}
        </button>
      </div>

      <!-- TAB 1: RINGKASAN -->
      <template v-if="activeTab === 'summary'">
        <!-- KPI Metrics Grid with Sweep Shine, Radial Geometry, and Sparklines -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <!-- KPI 1: Total Ujian (Blue) -->
          <div
            class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-[0_14px_30px_-14px_rgba(30,64,175,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(30,64,175,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
            @click="activeTab = 'exams'"
          >
            <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />
            
            <div class="flex items-center justify-between mb-3 relative z-10">
              <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
                <AdminIcon name="layers" size="22" />
              </span>
              <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                <span>{{ completedExams.length }} selesai</span>
              </span>
            </div>
            <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ exams.length }}</div>
            <div class="text-xs font-semibold text-blue-100 relative z-10">Total Jadwal Ujian</div>
            
            <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
              <AdminSparkline :values="[2, 3, 4, 5, 5, 6]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
            </div>
          </div>

          <!-- KPI 2: Sedang Berlangsung (Violet) -->
          <div
            class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-[0_14px_30px_-14px_rgba(91,33,182,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(91,33,182,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:70ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
            @click="activeTab = 'exams'"
          >
            <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

            <div class="flex items-center justify-between mb-3 relative z-10">
              <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
                <AdminIcon name="monitor" size="22" />
              </span>
              <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                <span>pantau live</span>
              </span>
            </div>
            <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ liveExams.length }}</div>
            <div class="text-xs font-semibold text-purple-100 relative z-10">Sedang Berlangsung</div>
            
            <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
              <AdminSparkline :values="[0, 1, 1, 2, 2, 2]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
            </div>
          </div>

          <!-- KPI 3: Total Peserta (Green) -->
          <div
            class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-[0_14px_30px_-14px_rgba(6,95,70,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(6,95,70,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:140ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
            @click="activeTab = 'results'"
          >
            <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

            <div class="flex items-center justify-between mb-3 relative z-10">
              <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
                <AdminIcon name="users" size="22" />
              </span>
              <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                <span>{{ exams.length }} ujian</span>
              </span>
            </div>
            <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ exams.reduce((sum, item) => sum + item.participants, 0) }}</div>
            <div class="text-xs font-semibold text-emerald-100 relative z-10">Total Peserta Terdaftar</div>
            
            <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
              <AdminSparkline :values="[80, 120, 160, 200, 246]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
            </div>
          </div>

          <!-- KPI 4: Rata-rata Nilai (Amber) -->
          <div
            class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-[0_14px_30px_-14px_rgba(146,64,14,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(146,64,14,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:210ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
            @click="activeTab = 'insight'"
          >
            <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

            <div class="flex items-center justify-between mb-3 relative z-10">
              <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
                <AdminIcon name="grad" size="22" />
              </span>
              <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                <span>KKM 75</span>
              </span>
            </div>
            <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ averageCompleted.toFixed(1) }}</div>
            <div class="text-xs font-semibold text-amber-100 relative z-10">Rata-rata Nilai Ujian</div>
            
            <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
              <AdminSparkline :values="[76, 78, 80, 81.5, 80.6]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
            </div>
          </div>
        </div>

        <!-- Pantau Live Card -->
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between mb-4">
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-purple-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(168,85,247,0.4)]">
              Pantau Live — Ujian Berlangsung
            </h3>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <span class="w-2 h-2 rounded-full bg-purple-600 animate-ping" /> LIVE
            </span>
          </div>
          <div class="space-y-4">
            <div v-for="exam in liveExams" :key="exam.id" class="pt-4 first:pt-0 border-t border-slate-100 first:border-0 space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <b class="text-sm font-bold text-slate-900">{{ exam.name }}</b>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ exam.subject }} &bull; Kelas {{ exam.classroom }} &bull; <strong class="text-slate-800">{{ exam.collected }}/{{ exam.participants }}</strong> kumpul &bull; <span class="text-purple-600 font-bold">{{ exam.doing }} mengerjakan</span>
                  </p>
                </div>
                <button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl w-fit transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm" type="button" @click="openExam(exam.id)">
                  <AdminIcon name="eye" size="14" /> Pantau
                </button>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <i class="block h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-700" :style="{ width: `${exam.collected / exam.participants * 100}%` }" />
              </div>
            </div>
          </div>
        </article>

        <!-- Charts Grid (SVG Interactive) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
                Tren Rata-rata Nilai
              </h3>
              <span class="text-xs text-slate-400 font-medium">Ujian selesai</span>
            </div>
            <div class="py-2">
              <AdminLineChart
                :labels="scoreTrendLabels"
                :series="scoreTrendSeries"
              />
            </div>
          </article>

          <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-purple-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(168,85,247,0.4)]">
                Distribusi Nilai Siswa
              </h3>
              <span class="text-xs text-slate-400 font-medium">Seluruh ujian selesai</span>
            </div>
            <div class="py-2">
              <AdminBarChart
                :labels="['<60', '60–69', '70–79', '80–89', '90–100']"
                :datasets="scoreDistDatasets"
              />
            </div>
          </article>
        </div>

        <!-- Perlu Perhatian Card -->
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between mb-2">
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-amber-500 before:to-orange-600 before:shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
              Perlu Perhatian
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">3 item</span>
          </div>
          <div class="divide-y divide-slate-100 space-y-3">
            <div class="flex flex-wrap sm:flex-nowrap gap-3 items-start pt-3">
              <span class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AdminIcon name="cal" size="17" />
              </span>
              <div class="flex-1 min-w-0">
                <b class="block text-sm font-bold text-slate-900">Try Out Ujian Sekolah dimulai 2 Okt 2026</b>
                <span class="block text-xs text-slate-500 mt-0.5">44 peserta &bull; Kelas IX-A &bull; token MTK102</span>
              </div>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition hover:scale-105 active:scale-95" type="button" @click="openExam('E3')">
                Tinjau
              </button>
            </div>
            <div class="flex flex-wrap sm:flex-nowrap gap-3 items-start pt-3">
              <span class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AdminIcon name="alert" size="17" />
              </span>
              <div class="flex-1 min-w-0">
                <b class="block text-sm font-bold text-slate-900">BD-004 &bull; hanya {{ basisDataEssay ? correctPercent(basisDataEssay) : 0 }}% jawaban benar</b>
                <span class="block text-xs text-slate-500 mt-0.5">Ujian Basis Data — butuh pembahasan ulang di kelas XI RPL 1</span>
              </div>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition hover:scale-105 active:scale-95" type="button" @click="openExam('E6')">
                Tinjau
              </button>
            </div>
            <div class="flex flex-wrap sm:flex-nowrap gap-3 items-start pt-3">
              <span class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <AdminIcon name="file" size="17" />
              </span>
              <div class="flex-1 min-w-0">
                <b class="block text-sm font-bold text-slate-900">Jawaban esai menunggu dinilai</b>
                <span class="block text-xs text-slate-500 mt-0.5">Beri nilai langsung dari halaman penilaian siswa.</span>
              </div>
            </div>
          </div>
        </article>
      </template>

      <!-- TAB 2: DAFTAR UJIAN -->
      <template v-else-if="activeTab === 'exams'">
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 min-w-[200px] focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all">
              <AdminIcon name="search" size="16" class="text-slate-400" />
              <input v-model.trim="query" placeholder="Cari ujian / mapel…" class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
            </label>
            <select v-model="classFilter" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500" aria-label="Filter kelas">
              <option value="all">Semua Kelas</option>
              <option v-for="item in classOptions" :key="item" :value="item">Kelas {{ item }}</option>
            </select>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="item in examStatusOptions" :key="item" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer" :class="statusFilter === item ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" type="button" @click="statusFilter = item">
                {{ item === 'all' ? 'Semua' : item }}
              </button>
            </div>
            <span class="text-xs text-slate-400 ml-auto font-medium">{{ filteredExams.length }} ujian</span>
          </div>
        </article>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <article v-for="exam in filteredExams" :key="exam.id" class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" :class="statusClass(exam.status)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="exam.status === 'Berlangsung' ? 'bg-purple-600 animate-ping' : exam.status === 'Terjadwal' ? 'bg-amber-500' : 'bg-emerald-500'" />
                  {{ exam.status }}
                </span>
                <span class="text-xs text-slate-400 font-medium">{{ exam.duration }} mnt &bull; KKM {{ exam.kkm }}</span>
              </div>
              <b class="block text-base font-bold text-slate-900">{{ exam.name }}</b>
              <p class="text-xs text-slate-500 mt-1 mb-4 leading-relaxed font-medium">
                {{ exam.subject }} &bull; Kelas {{ exam.classroom }}<br>
                <AdminIcon name="cal" size="13" class="inline align-middle text-slate-400" /> {{ exam.date }} &bull; Token <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">{{ exam.token }}</code>
              </p>
              <div class="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-4">
                <div>
                  <b class="block text-base font-bold text-slate-900 font-mono">{{ exam.participants }}</b>
                  <span class="block text-[11px] text-slate-400">Peserta</span>
                </div>
                <div>
                  <b class="block text-base font-bold text-slate-900 font-mono">{{ exam.status === 'Selesai' ? exam.average.toFixed(1) : exam.status === 'Berlangsung' ? `${Math.round(exam.collected / exam.participants * 100)}%` : '—' }}</b>
                  <span class="block text-[11px] text-slate-400">{{ exam.status === 'Selesai' ? 'Rata-rata' : 'Terkumpul' }}</span>
                </div>
              </div>
              <div v-if="exam.status === 'Berlangsung'" class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
                <i class="block h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" :style="{ width: `${exam.collected / exam.participants * 100}%` }" />
              </div>
            </div>
            <button class="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm" :class="exam.status === 'Berlangsung' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" type="button" @click="openExam(exam.id)">
              <AdminIcon name="eye" size="14" /> {{ exam.status === 'Terjadwal' ? 'Detail & Mulai' : 'Lihat Detail' }}
            </button>
          </article>
          <div v-if="!filteredExams.length" class="col-span-full py-16 text-center text-sm text-slate-400 bg-white rounded-3xl border border-slate-200/80">
            Tidak ada ujian yang cocok dengan kriteria pencarian.
          </div>
        </div>
      </template>

      <!-- TAB 3: BANK SOAL -->
      <template v-else-if="activeTab === 'bank'">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <b class="block text-2xl font-black text-slate-900 font-mono">{{ bank.length }}</b>
            <span class="block text-xs text-slate-400 mt-1">Total Soal</span>
          </div>
          <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <b class="block text-2xl font-black text-slate-900 font-mono">{{ bank.filter(item => item.type === 'PG' || item.type === 'PG Kompleks').length }}</b>
            <span class="block text-xs text-slate-400 mt-1">Pilihan Ganda</span>
          </div>
          <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <b class="block text-2xl font-black text-slate-900 font-mono">{{ bank.filter(item => item.type === 'Esai').length }}</b>
            <span class="block text-xs text-slate-400 mt-1">Esai</span>
          </div>
          <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <b class="block text-2xl font-black text-slate-900 font-mono">{{ subjectOptions.length }}</b>
            <span class="block text-xs text-slate-400 mt-1">Mata Pelajaran</span>
          </div>
        </div>

        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 min-w-[200px] focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all">
              <AdminIcon name="search" size="16" class="text-slate-400" />
              <input v-model.trim="bankQuery" placeholder="Cari soal / kode / kunci…" class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
            </label>
            <select v-model="subjectFilter" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500">
              <option value="all">Semua Mapel</option>
              <option v-for="item in subjectOptions" :key="item">{{ item }}</option>
            </select>
            <select v-model="typeFilter" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500">
              <option value="all">Semua Tipe</option>
              <option>PG</option>
              <option>PG Kompleks</option>
              <option>Isian</option>
              <option>Esai</option>
            </select>
            <select v-model="difficultyFilter" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500">
              <option value="all">Semua Level</option>
              <option>Mudah</option>
              <option>Sedang</option>
              <option>Sukar</option>
            </select>
            <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition ml-auto hover:scale-105 active:scale-95" type="button" @click="openAddQuestion">
              <AdminIcon name="plus" size="14" /> Tambah Soal
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th class="px-5 py-3.5">Kode</th>
                  <th class="px-5 py-3.5">Soal</th>
                  <th class="px-5 py-3.5">Tipe</th>
                  <th class="px-5 py-3.5">Kesulitan</th>
                  <th class="px-5 py-3.5 text-right">Dipakai</th>
                  <th class="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="item in filteredQuestions" :key="item.id" class="hover:bg-blue-50/50 transition">
                  <td class="px-5 py-3.5 font-mono font-bold text-slate-900 text-xs">{{ item.code }}</td>
                  <td class="px-5 py-3.5 max-w-sm">
                    <div class="text-slate-800 font-medium line-clamp-2 text-xs sm:text-sm">{{ item.text }}</div>
                    <div class="text-xs text-slate-400 mt-0.5">{{ item.subject }}</div>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="typeClass(item.type)">{{ item.type }}</span>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="difficultyClass(item.difficulty)">{{ item.difficulty }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-right font-bold text-slate-700 font-mono">{{ item.used }}×</td>
                  <td class="px-5 py-3.5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button class="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition" type="button" aria-label="Preview soal" @click="openQuestionPreview(item)">
                        <AdminIcon name="eye" size="15" />
                      </button>
                      <button class="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition" type="button" aria-label="Hapus soal" @click="deleteQuestion(item)">
                        <AdminIcon name="trash" size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredQuestions.length">
                  <td colspan="6" class="py-16 text-center text-xs text-slate-400 font-semibold">Tidak ada soal yang cocok dengan filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-6 py-3.5 border-t border-slate-100 text-xs text-slate-500">
            Menampilkan <b>{{ filteredQuestions.length }}</b> soal di bank soal
          </div>
        </article>
      </template>

      <!-- TAB 4: HASIL PER SISWA -->
      <template v-else-if="activeTab === 'results'">
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-4">
          <div class="flex flex-wrap items-center gap-4">
            <span class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
              {{ initials(activeResultStudent?.name ?? 'Siswa') }}
            </span>
            <div class="flex-1 min-w-[180px]">
              <b class="block text-base font-bold text-slate-900">{{ activeResultStudent?.name }}</b>
              <span class="block text-xs sm:text-sm text-slate-500">NIS {{ activeResultStudent?.nis }} &bull; Kelas {{ resultClass }}</span>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3">
              <b class="block text-xl font-bold text-slate-900 font-mono">{{ resultExams.length ? '82.5' : '—' }}</b>
              <span class="block text-[11px] text-slate-400">Rata-rata Nilai</span>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3">
              <b class="block text-xl font-bold text-slate-900 font-mono">{{ resultExams.length }}</b>
              <span class="block text-[11px] text-slate-400">Ujian</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
            <select v-model="resultClass" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-medium" @change="chooseResultClass">
              <option v-for="item in classOptions" :key="item">{{ item }}</option>
            </select>
            <select v-model="resultStudent" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-500 min-w-[200px] font-medium">
              <option v-for="item in resultStudents" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>
        </article>

        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Riwayat Ujian
            </h3>
            <span class="text-xs text-slate-400 font-medium">per mata pelajaran</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th class="px-5 py-3.5">Ujian</th>
                  <th class="px-5 py-3.5">Mapel</th>
                  <th class="px-5 py-3.5">Tanggal</th>
                  <th class="px-5 py-3.5">Status</th>
                  <th class="px-5 py-3.5 text-right">Nilai</th>
                  <th class="px-5 py-3.5">KKM</th>
                  <th class="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="exam in resultExams" :key="exam.id" class="hover:bg-blue-50/50 transition">
                  <td class="px-5 py-3.5 font-bold text-slate-900">{{ exam.name }}</td>
                  <td class="px-5 py-3.5 text-slate-600">{{ exam.subject }}</td>
                  <td class="px-5 py-3.5 text-slate-500 font-mono">{{ exam.date }}</td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="statusClass(exam.status)">{{ exam.status }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">{{ activeResultStudent ? scoreFor(exam, activeResultStudent) ?? '—' : '—' }}</td>
                  <td class="px-5 py-3.5">
                    <span v-if="activeResultStudent && scoreFor(exam, activeResultStudent) !== null" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold" :class="(scoreFor(exam, activeResultStudent) ?? 0) >= exam.kkm ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                      {{ (scoreFor(exam, activeResultStudent) ?? 0) >= exam.kkm ? 'Lulus' : 'Remedial' }}
                    </span>
                    <span v-else class="text-slate-400">—</span>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <button v-if="activeResultStudent && scoreFor(exam, activeResultStudent) !== null" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm" type="button" @click="openResultDetail(exam)">
                      <AdminIcon name="eye" size="14" /> Detail
                    </button>
                  </td>
                </tr>
                <tr v-if="!resultExams.length">
                  <td colspan="7" class="py-16 text-center text-xs text-slate-400 font-semibold">Belum ada ujian untuk kelas ini.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </template>

      <!-- TAB 5: INSIGHT -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-rose-500 before:to-red-600 before:shadow-[0_2px_8px_rgba(244,63,94,0.4)]">
                Soal Tersulit
              </h3>
              <span class="text-xs text-slate-400 font-medium">% benar terendah</span>
            </div>
            <div class="p-6 space-y-4">
              <div v-for="item in hardestQuestions" :key="item.id" class="pt-3.5 first:pt-0 border-t border-slate-100 first:border-0">
                <div class="flex items-center justify-between mb-1.5 text-xs">
                  <b class="font-bold text-slate-800">{{ item.code }} <span class="font-normal text-slate-400">&bull; {{ item.subject }}</span></b>
                  <strong class="font-mono font-bold text-rose-600">{{ correctPercent(item) }}%</strong>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <i class="block h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full" :style="{ width: `${correctPercent(item)}%` }" />
                </div>
              </div>
            </div>
          </article>

          <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
                Rata-rata per Kelas
              </h3>
              <span class="text-xs text-slate-400 font-medium">Ujian selesai</span>
            </div>
            <div class="space-y-3.5">
              <div v-for="exam in completedExams" :key="exam.id" class="grid grid-cols-[90px_1fr_50px] items-center gap-3 text-xs">
                <span class="text-slate-700 font-bold truncate">{{ exam.classroom }}</span>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <i class="block h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" :style="{ width: `${exam.average}%` }" />
                </div>
                <b class="text-right font-mono font-bold text-slate-900">{{ exam.average }}</b>
              </div>
            </div>
          </article>
        </div>

        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
              Rekomendasi Otomatis
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">3 item</span>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex flex-wrap sm:flex-nowrap gap-3.5 items-start">
              <span class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AdminIcon name="alert" size="17" />
              </span>
              <div class="flex-1 min-w-0">
                <b class="block text-sm font-bold text-slate-900">{{ hardestQuestions[0]?.code }} &bull; hanya {{ hardestQuestions[0] ? correctPercent(hardestQuestions[0]) : 0 }}% jawaban benar</b>
                <span class="block text-xs text-slate-500 mt-0.5">Pertimbangkan pembahasan ulang di kelas atau revisi butir soal.</span>
              </div>
            </div>
            <div class="flex flex-wrap sm:flex-nowrap gap-3.5 items-start pt-4 border-t border-slate-100">
              <span class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AdminIcon name="file" size="17" />
              </span>
              <div class="flex-1 min-w-0">
                <b class="block text-sm font-bold text-slate-900">Jawaban esai menunggu dinilai</b>
                <span class="block text-xs text-slate-500 mt-0.5">Beri nilai langsung dari halaman penilaian siswa untuk menyelesaikan rekapitulasi.</span>
              </div>
            </div>
            <div class="flex flex-wrap sm:flex-nowrap gap-3.5 items-start pt-4 border-t border-slate-100">
              <span class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <AdminIcon name="users" size="17" />
              </span>
              <div class="flex-1 min-w-0">
                <b class="block text-sm font-bold text-slate-900">UTS Informatika: {{ Math.round(exams[0].collected / exams[0].participants * 100) }}% mengumpulkan</b>
                <span class="block text-xs text-slate-500 mt-0.5">Kelas X RPL 1 — pantau siswa yang belum mengumpulkan via wali kelas.</span>
              </div>
              <button class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm" type="button" @click="openExam('E1')">
                Tinjau
              </button>
            </div>
          </div>
        </article>
      </template>
    </template>

    <!-- Modal Buat Ujian Baru -->
    <AdminModal :open="examModalOpen" title="Buat Ujian Baru" @close="examModalOpen = false">
      <div class="space-y-4">
        <div>
          <label for="exam-name" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nama Ujian</label>
          <input id="exam-name" v-model="examForm.name" placeholder="cth: UTS Informatika" class="w-full px-4 py-3 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] outline-none transition" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="exam-subject" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Mata Pelajaran</label>
            <select id="exam-subject" v-model="examForm.subject" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none">
              <option v-for="item in subjectOptions" :key="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label for="exam-class" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Kelas</label>
            <select id="exam-class" v-model="examForm.classroom" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none">
              <option v-for="item in classOptions" :key="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label for="exam-date" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Tanggal</label>
            <input id="exam-date" v-model="examForm.date" class="w-full px-4 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none font-mono" />
          </div>
          <div>
            <label for="exam-duration" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Durasi (menit)</label>
            <input id="exam-duration" v-model.number="examForm.duration" type="number" min="1" class="w-full px-4 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none font-mono" />
          </div>
          <div>
            <label for="exam-kkm" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">KKM</label>
            <input id="exam-kkm" v-model.number="examForm.kkm" type="number" min="1" max="100" class="w-full px-4 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none font-mono" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Jumlah Soal</label>
            <select disabled class="w-full px-3.5 py-2.5 text-xs bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 cursor-not-allowed">
              <option>8 soal</option>
            </select>
          </div>
        </div>
        <p class="text-xs text-slate-400">Soal diambil otomatis dari bank soal sesuai mata pelajaran &bull; Token dibuat otomatis.</p>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition" type="button" @click="examModalOpen = false">Batal</button>
        <button class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-105 active:scale-95" type="button" @click="saveExam">
          <AdminIcon name="check" size="14" /> Jadwalkan Ujian
        </button>
      </template>
    </AdminModal>

    <!-- Modal Tambah Soal ke Bank -->
    <AdminModal :open="questionModal === 'add'" title="Tambah Soal ke Bank" @close="questionModal = 'closed'">
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="question-subject" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Mata Pelajaran</label>
            <select id="question-subject" v-model="questionForm.subject" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none">
              <option v-for="item in subjectOptions" :key="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label for="question-type" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Tipe</label>
            <select id="question-type" v-model="questionForm.type" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none">
              <option>PG</option>
              <option>PG Kompleks</option>
              <option>Isian</option>
              <option>Esai</option>
            </select>
          </div>
          <div>
            <label for="question-difficulty" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Kesulitan</label>
            <select id="question-difficulty" v-model="questionForm.difficulty" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none">
              <option>Mudah</option>
              <option>Sedang</option>
              <option>Sukar</option>
            </select>
          </div>
          <div>
            <label for="question-code" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Kode Soal</label>
            <input id="question-code" v-model="questionForm.code" placeholder="cth: INF-009" class="w-full px-4 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none font-mono" />
          </div>
        </div>
        <div>
          <label for="question-text" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Teks Soal</label>
          <textarea id="question-text" v-model="questionForm.text" rows="3" placeholder="Tulis butir soal…" class="w-full px-4 py-3 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none" />
        </div>
        <div>
          <label for="question-key" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Kunci Jawaban</label>
          <input id="question-key" v-model="questionForm.key" placeholder="Kunci jawaban / pedoman penskoran…" class="w-full px-4 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none" />
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition" type="button" @click="questionModal = 'closed'">Batal</button>
        <button class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-105 active:scale-95" type="button" @click="saveQuestion">
          <AdminIcon name="check" size="14" /> Simpan Soal
        </button>
      </template>
    </AdminModal>

    <!-- Modal Preview Soal -->
    <AdminModal :open="questionModal === 'preview'" :title="`Preview Soal — ${previewQuestion?.code ?? ''}`" @close="questionModal = 'closed'">
      <template v-if="previewQuestion">
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold" :class="typeClass(previewQuestion.type)">{{ previewQuestion.type }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold" :class="difficultyClass(previewQuestion.difficulty)">{{ previewQuestion.difficulty }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{{ previewQuestion.subject }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">dipakai {{ previewQuestion.used }}×</span>
        </div>
        <p class="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed mb-4">{{ previewQuestion.text }}</p>
        <div v-if="revealKey" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <b class="text-emerald-700">Kunci Jawaban:</b> {{ previewQuestion.key }}
        </div>
      </template>
      <template #footer>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition" type="button" @click="questionModal = 'closed'">Tutup</button>
        <button class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-105 active:scale-95" type="button" @click="revealKey = !revealKey">
          {{ revealKey ? 'Sembunyikan Kunci' : 'Lihat Kunci' }}
        </button>
      </template>
    </AdminModal>

    <AdminToast :message="message" :kind="messageKind" />
  </section>
</template>
