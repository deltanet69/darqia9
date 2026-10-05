import { ref, computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

export type ExamStatus = 'Berlangsung' | 'Terjadwal' | 'Selesai'
export type QuestionType = 'PG' | 'PG Kompleks' | 'Isian' | 'Esai' | 'Audio' | 'Video'
export type Difficulty = 'Mudah' | 'Sedang' | 'Sukar'

export interface Exam {
  id: string
  name: string
  subject: string
  classroom: string
  grade: 'SMP' | 'SMK'
  date: string
  time: string
  duration: number
  participants: number
  status: ExamStatus
  average: number
  kkm: number
  token: string
  collected: number
  doing: number
  violations: number
  supervisor: string
}

export interface Question {
  id: string
  code: string
  subject: string
  classroom: string
  grade: 'SMP' | 'SMK'
  type: QuestionType
  difficulty: Difficulty
  text: string
  key: string
  used: number
  options?: string[]
  audioUrl?: string
  videoUrl?: string
}

export interface BankQuestionItem {
  id: string
  number: number
  type: 'PG' | 'Isian' | 'Esai' | 'Interaktif'
  text: string
  difficulty: Difficulty
  isMultiSelect?: boolean
  options?: { key: string; text: string }[]
  key: string | string[]
  rubric?: string
  mediaType?: 'audio' | 'video'
  mediaUrl?: string
  mediaFileName?: string
  mediaFileSize?: string
  mediaCompressStatus?: string
  interactiveAnswerType?: 'PG' | 'PG_Multi' | 'Isian'
}

export interface BankSubjectPackage {
  id: string
  code: string
  classroom: string
  subject: string
  grade: 'SMP' | 'SMK'
  difficulty: Difficulty
  teacherName: string
  updatedAt: string
  hasInteractive: boolean
  questions: BankQuestionItem[]
}

export interface StudentResult {
  id: string
  nisn: string
  name: string
  classroom: string
  grade: 'SMP' | 'SMK'
  pgScore: number
  essayScore: number | null
  totalScore: number
  essayStatus: 'Sudah Dikoreksi' | 'Perlu Koreksi' | 'Tanpa Esai'
  status: 'Lulus' | 'Remedial' | 'Belum Selesai'
  submittedAt: string
  essayAnswers?: { question: string; studentAnswer: string; rubric: string; score: number | null }[]
}

export interface ViolationLog {
  id: string
  studentId: string
  studentName: string
  classroom: string
  grade: 'SMP' | 'SMK'
  examId: string
  examName: string
  time: string
  reason: string
  level: 1 | 2 | 3
  status: 'Terkunci (1x)' | 'Terkunci (2x)' | 'Terkunci Permanen' | 'Selesai Dibuka'
  unlockPin: string
}

export interface TeacherRole {
  id: number
  name: string
  nip: string
  subject: string
  grade: 'SMP' | 'SMK'
  roles: string[]
  classes: string[]
}

export const useAdminCbtState = () => {
  const currentGrade = useAdminGrade()
  const activeTab = useState<string>('admin-cbt-tab', () => 'summary')

  // MASTER EXAMS DATA
  const allExams = useState<Exam[]>('admin-cbt-exams', () => [
    {
      id: 'E1',
      name: 'Penilaian Tengah Semester Informatika',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      date: '30 Sep 2026',
      time: '07:30 - 09:00',
      duration: 90,
      participants: 40,
      status: 'Berlangsung',
      average: 0,
      kkm: 75,
      token: 'INF930',
      collected: 26,
      doing: 9,
      violations: 2,
      supervisor: 'Bpk. Budi Santoso, S.Kom'
    },
    {
      id: 'E2',
      name: 'Ujian Praktik Jaringan Komputer',
      subject: 'Jaringan Komputer',
      classroom: 'XII TKJ 1',
      grade: 'SMK',
      date: '30 Sep 2026',
      time: '09:30 - 11:30',
      duration: 120,
      participants: 38,
      status: 'Berlangsung',
      average: 0,
      kkm: 75,
      token: 'JAR930',
      collected: 21,
      doing: 12,
      violations: 0,
      supervisor: 'Ibu Siti Aminah, S.Pd'
    },
    {
      id: 'E7',
      name: 'UAS Praktik Pemrograman Web',
      subject: 'Pemrograman Web',
      classroom: 'XI RPL 1',
      grade: 'SMK',
      date: '10 Okt 2026',
      time: '08:00 - 10:00',
      duration: 120,
      participants: 40,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'WEB101',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Bpk. Budi Santoso, S.Kom'
    },
    {
      id: 'E8',
      name: 'Ujian Teori Kejuruan Komputer',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      date: '12 Okt 2026',
      time: '08:00 - 09:30',
      duration: 90,
      participants: 40,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'TKJ102',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Ibu Siti Aminah, S.Pd'
    },
    {
      id: 'E6',
      name: 'Ujian Teori Basis Data',
      subject: 'Basis Data',
      classroom: 'XI RPL 1',
      grade: 'SMK',
      date: '25 Sep 2026',
      time: '08:00 - 09:30',
      duration: 90,
      participants: 40,
      status: 'Selesai',
      average: 79.2,
      kkm: 75,
      token: 'BDS925',
      collected: 40,
      doing: 0,
      violations: 3,
      supervisor: 'Bpk. Budi Santoso, S.Kom'
    },
    {
      id: 'E9',
      name: 'Simulasi Try Out IPA Terpadu',
      subject: 'IPA Terpadu',
      classroom: 'IX-A',
      grade: 'SMP',
      date: '30 Sep 2026',
      time: '07:30 - 09:00',
      duration: 90,
      participants: 44,
      status: 'Berlangsung',
      average: 0,
      kkm: 75,
      token: 'IPA930',
      collected: 31,
      doing: 11,
      violations: 1,
      supervisor: 'Ibu Rina Marlina, M.Pd'
    },
    {
      id: 'E3',
      name: 'Try Out Ujian Sekolah Matematika',
      subject: 'Matematika',
      classroom: 'IX-A',
      grade: 'SMP',
      date: '2 Okt 2026',
      time: '08:00 - 10:00',
      duration: 120,
      participants: 44,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'MTK102',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Bpk. Ahmad Dahlan, S.Pd'
    },
    {
      id: 'E4',
      name: 'Penilaian Akhir Semester Matematika',
      subject: 'Matematika',
      classroom: 'VIII-B',
      grade: 'SMP',
      date: '5 Okt 2026',
      time: '08:00 - 09:30',
      duration: 90,
      participants: 44,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'MTK105',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Ibu Rina Marlina, M.Pd'
    },
    {
      id: 'E5',
      name: 'UTS Pendidikan Agama Islam',
      subject: 'PAI',
      classroom: 'VII-A',
      grade: 'SMP',
      date: '27 Sep 2026',
      time: '07:30 - 08:30',
      duration: 60,
      participants: 44,
      status: 'Selesai',
      average: 84.5,
      kkm: 75,
      token: 'PAI927',
      collected: 44,
      doing: 0,
      violations: 1,
      supervisor: 'Ust. Hendra Gunawan, S.Pd.I'
    }
  ])

  // MASTER BANK SOAL
  const allBank = useState<Question[]>('admin-cbt-bank', () => [
    {
      id: 'B1',
      code: 'INF-001',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      type: 'PG',
      difficulty: 'Mudah',
      text: 'Perangkat keras komputer yang berfungsi sebagai unit pemrosesan pusat dan pengendali utama seluruh instruksi sistem adalah...',
      key: 'B',
      used: 4,
      options: ['A. RAM (Random Access Memory)', 'B. CPU (Central Processing Unit)', 'C. GPU (Graphics Processing Unit)', 'D. Power Supply Unit', 'E. Hard Disk Drive']
    },
    {
      id: 'B2',
      code: 'INF-002',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      type: 'PG',
      difficulty: 'Sedang',
      text: 'Topologi jaringan di mana setiap node terhubung ke satu perangkat konsentrator sentral seperti switch atau hub disebut...',
      key: 'C',
      used: 3,
      options: ['A. Topologi Bus', 'B. Topologi Ring', 'C. Topologi Star', 'D. Topologi Mesh', 'E. Topologi Tree']
    },
    {
      id: 'B3',
      code: 'INF-003',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      type: 'Esai',
      difficulty: 'Sukar',
      text: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural, sertakan contoh kasus penggunaannya!',
      key: 'OOP mengorganisasi kode dalam objek dengan enkapsulasi dan pewarisan, sedangkan prosedural berfokus pada urutan fungsi langkah demi langkah.',
      used: 2
    },
    {
      id: 'B4',
      code: 'INF-004',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      type: 'Audio',
      difficulty: 'Sedang',
      text: 'Dengarkan rekaman instruksi konfigurasi firewall berikut. Berdasarkan rekaman tersebut, port berapakah yang wajib dibuka untuk protokol HTTPS?',
      key: 'Port 443',
      used: 1,
      audioUrl: 'https://actions.google.com/sounds/v1/ambient/office_ambience.ogg'
    },
    {
      id: 'B5',
      code: 'MTK-001',
      subject: 'Matematika',
      classroom: 'IX-A',
      grade: 'SMP',
      type: 'PG',
      difficulty: 'Mudah',
      text: 'Hasil dari persamaan kuadrat x² - 5x + 6 = 0 memiliki himpunan penyelesaian adalah...',
      key: 'A',
      used: 2,
      options: ['A. x = 2 atau x = 3', 'B. x = -2 atau x = -3', 'C. x = 1 atau x = 6', 'D. x = -1 atau x = -6']
    },
    {
      id: 'B6',
      code: 'PAI-001',
      subject: 'PAI',
      classroom: 'VII-A',
      grade: 'SMP',
      type: 'PG',
      difficulty: 'Mudah',
      text: 'Rukun Islam yang ketiga yang wajib ditunaikan bagi umat muslim yang telah memenuhi nisab adalah...',
      key: 'C',
      used: 5,
      options: ['A. Membaca Dua Kalimat Syahadat', 'B. Menunaikan Shalat Lima Waktu', 'C. Membayar Zakat', 'D. Berpuasa di Bulan Ramadhan', 'E. Menunaikan Ibadah Haji']
    }
  ])

  // MASTER RESULTS
  const allResults = useState<StudentResult[]>('admin-cbt-results', () => [
    {
      id: 'R1',
      nisn: '0071234501',
      name: 'Ahmad Fauzan',
      classroom: 'X RPL 1',
      grade: 'SMK',
      pgScore: 70,
      essayScore: 20,
      totalScore: 90,
      essayStatus: 'Sudah Dikoreksi',
      status: 'Lulus',
      submittedAt: '30 Sep 2026 08:45',
      essayAnswers: [
        {
          question: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural!',
          studentAnswer: 'OOP menggunakan konsep class dan object dengan fitur inheritance dan encapsulation, sedangkan prosedural berurutan baris demi baris.',
          rubric: 'Menyebutkan konsep object, class, encapsulation, dan perbedaan alur prosedural.',
          score: 20
        }
      ]
    },
    {
      id: 'R2',
      nisn: '0071234502',
      name: 'Siti Aisyah',
      classroom: 'X RPL 1',
      grade: 'SMK',
      pgScore: 65,
      essayScore: null,
      totalScore: 65,
      essayStatus: 'Perlu Koreksi',
      status: 'Belum Selesai',
      submittedAt: '30 Sep 2026 08:50',
      essayAnswers: [
        {
          question: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural!',
          studentAnswer: 'OOP itu berorientasi pada objek nyata seperti mobil dan manusia, prosedural adalah prosedur fungsi biasa.',
          rubric: 'Menyebutkan konsep object, class, encapsulation, dan perbedaan alur prosedural.',
          score: null
        }
      ]
    },
    {
      id: 'R3',
      nisn: '0071234503',
      name: 'Muhammad Rizky Pratama',
      classroom: 'X RPL 1',
      grade: 'SMK',
      pgScore: 75,
      essayScore: 18,
      totalScore: 93,
      essayStatus: 'Sudah Dikoreksi',
      status: 'Lulus',
      submittedAt: '30 Sep 2026 08:40'
    },
    {
      id: 'R4',
      nisn: '0071234504',
      name: 'Nabila Zahra Putri',
      classroom: 'X RPL 1',
      grade: 'SMK',
      pgScore: 50,
      essayScore: 12,
      totalScore: 62,
      essayStatus: 'Sudah Dikoreksi',
      status: 'Remedial',
      submittedAt: '30 Sep 2026 08:55'
    },
    {
      id: 'R5',
      nisn: '0081234501',
      name: 'Farhan Maulana',
      classroom: 'VII-A',
      grade: 'SMP',
      pgScore: 85,
      essayScore: null,
      totalScore: 85,
      essayStatus: 'Tanpa Esai',
      status: 'Lulus',
      submittedAt: '27 Sep 2026 08:20'
    },
    {
      id: 'R6',
      nisn: '0081234502',
      name: 'Putri Safitri',
      classroom: 'VII-A',
      grade: 'SMP',
      pgScore: 90,
      essayScore: null,
      totalScore: 90,
      essayStatus: 'Tanpa Esai',
      status: 'Lulus',
      submittedAt: '27 Sep 2026 08:15'
    }
  ])

  // MASTER VIOLATIONS
  const allCheatLogs = useState<ViolationLog[]>('admin-cbt-violations', () => [
    {
      id: 'V1',
      studentId: '0071234504',
      studentName: 'Nabila Zahra Putri',
      classroom: 'X RPL 1',
      grade: 'SMK',
      examId: 'E1',
      examName: 'PTS Informatika',
      time: '08:15 WIB',
      reason: 'Membuka tab browser lain (2x terdeteksi)',
      level: 1,
      status: 'Terkunci (1x)',
      unlockPin: 'ATQ-9481'
    },
    {
      id: 'V2',
      studentId: '0071234502',
      studentName: 'Siti Aisyah',
      classroom: 'X RPL 1',
      grade: 'SMK',
      examId: 'E1',
      examName: 'PTS Informatika',
      time: '08:42 WIB',
      reason: 'Keluar dari mode layar penuh (Full-Screen exit)',
      level: 1,
      status: 'Terkunci (1x)',
      unlockPin: 'ATQ-3312'
    },
    {
      id: 'V3',
      studentId: '0081234508',
      studentName: 'Raka Dimas',
      classroom: 'VII-A',
      grade: 'SMP',
      examId: 'E5',
      examName: 'UTS PAI',
      time: '08:05 WIB',
      reason: 'Shortcut tombol dilarang (Alt + Tab)',
      level: 2,
      status: 'Selesai Dibuka',
      unlockPin: 'SMP-8821'
    }
  ])

  // MASTER GURU
  const allTeachers = useState<TeacherRole[]>('admin-cbt-teachers', () => [
    {
      id: 1,
      name: 'Bpk. Budi Santoso, S.Kom',
      nip: '198504122010011005',
      subject: 'Informatika & Basis Data',
      grade: 'SMK',
      roles: ['Pembuat Soal', 'Pengawas Ujian', 'Penilai Esai'],
      classes: ['X RPL 1', 'XI RPL 1', 'XII RPL 1']
    },
    {
      id: 2,
      name: 'Ibu Siti Aminah, S.Pd',
      nip: '198908232014022003',
      subject: 'Jaringan Komputer',
      grade: 'SMK',
      roles: ['Pengawas Ujian', 'Pembuat Soal'],
      classes: ['X TKJ 1', 'XI TKJ 1', 'XII TKJ 1']
    },
    {
      id: 3,
      name: 'Ust. Hendra Gunawan, S.Pd.I',
      nip: '198201152009031002',
      subject: 'PAI & Budi Pekerti',
      grade: 'SMP',
      roles: ['Pembuat Soal', 'Pengawas Ujian', 'Penilai Esai'],
      classes: ['VII-A', 'VIII-A', 'IX-A']
    },
    {
      id: 4,
      name: 'Ibu Rina Marlina, M.Pd',
      nip: '199103192016012004',
      subject: 'Matematika',
      grade: 'SMP',
      roles: ['Pembuat Soal', 'Pengawas Ujian'],
      classes: ['VII-B', 'VIII-B', 'IX-B']
    }
  ])

  // MASTER PACKAGES PER MAPEL
  const allBankPackages = useState<BankSubjectPackage[]>('admin-cbt-packages', () => [
    {
      id: 'PKG-1',
      code: 'INF-XRPL1',
      classroom: 'X RPL 1',
      subject: 'Informatika',
      grade: 'SMK',
      difficulty: 'Sedang',
      teacherName: 'Bpk. Budi Santoso, S.Kom',
      updatedAt: '30 Sep 2026',
      hasInteractive: true,
      questions: [
        {
          id: 'Q1',
          number: 1,
          type: 'PG',
          difficulty: 'Mudah',
          text: 'Perangkat keras komputer yang berfungsi sebagai unit pemrosesan pusat dan pengendali utama seluruh instruksi sistem adalah...',
          isMultiSelect: false,
          options: [
            { key: 'A', text: 'RAM (Random Access Memory)' },
            { key: 'B', text: 'CPU (Central Processing Unit)' },
            { key: 'C', text: 'GPU (Graphics Processing Unit)' },
            { key: 'D', text: 'Power Supply Unit' },
            { key: 'E', text: 'Hard Disk Drive' }
          ],
          key: 'B'
        },
        {
          id: 'Q2',
          number: 2,
          type: 'PG',
          difficulty: 'Sedang',
          text: 'Topologi jaringan di mana setiap node terhubung ke satu perangkat konsentrator sentral seperti switch atau hub disebut...',
          isMultiSelect: false,
          options: [
            { key: 'A', text: 'Topologi Bus' },
            { key: 'B', text: 'Topologi Ring' },
            { key: 'C', text: 'Topologi Star' },
            { key: 'D', text: 'Topologi Mesh' },
            { key: 'E', text: 'Topologi Tree' }
          ],
          key: 'C'
        },
        {
          id: 'Q3',
          number: 3,
          type: 'PG',
          difficulty: 'Sedang',
          text: 'Pilihlah protokol jaringan berikut yang berjalan pada Application Layer (OSI Layer 7)! (Pilih lebih dari satu jawaban yang benar)',
          isMultiSelect: true,
          options: [
            { key: 'A', text: 'HTTP (Hypertext Transfer Protocol)' },
            { key: 'B', text: 'TCP (Transmission Control Protocol)' },
            { key: 'C', text: 'DNS (Domain Name System)' },
            { key: 'D', text: 'IP (Internet Protocol)' },
            { key: 'E', text: 'SMTP (Simple Mail Transfer Protocol)' }
          ],
          key: ['A', 'C', 'E']
        },
        {
          id: 'Q4',
          number: 4,
          type: 'Isian',
          difficulty: 'Sedang',
          text: 'Sebutkan perintah terminal Linux untuk melihat alamat IP yang terkonfigurasi pada antarmuka jaringan!',
          key: 'ip a atau ifconfig'
        },
        {
          id: 'Q5',
          number: 5,
          type: 'Esai',
          difficulty: 'Sukar',
          text: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural, sertakan contoh kasus penggunaannya!',
          key: 'OOP mengorganisasi kode dalam entitas objek dengan konsep enkapsulasi, pewarisan (inheritance), dan polimorfisme untuk mempermudah modularitas sistem besar. Sementara prosedural berfokus pada eksekusi runtutan fungsi langkah demi langkah.',
          rubric: 'Menyebutkan konsep object, class, encapsulation, inheritance, dan perbandingan struktur modular vs runtutan langkah fungsional.'
        },
        {
          id: 'Q6',
          number: 6,
          type: 'Interaktif',
          difficulty: 'Sedang',
          text: 'Dengarkan rekaman instruksi konfigurasi firewall berikut. Berdasarkan rekaman instruksi tersebut, port berapakah yang wajib dibuka untuk mengamankan protokol transfer data terenkripsi HTTPS?',
          mediaType: 'audio',
          mediaUrl: 'https://actions.google.com/sounds/v1/ambient/office_ambience.ogg',
          mediaCompressStatus: 'Terkompresi 64kbps (Optimal)',
          interactiveAnswerType: 'Isian',
          key: 'Port 443'
        }
      ]
    },
    {
      id: 'PKG-2',
      code: 'WEB-XIRPL1',
      classroom: 'XI RPL 1',
      subject: 'Pemrograman Web',
      grade: 'SMK',
      difficulty: 'Sedang',
      teacherName: 'Bpk. Budi Santoso, S.Kom',
      updatedAt: '28 Sep 2026',
      hasInteractive: true,
      questions: [
        {
          id: 'Q7',
          number: 1,
          type: 'PG',
          difficulty: 'Mudah',
          text: 'Tag HTML semantik yang digunakan untuk membungkus konten navigasi utama website adalah...',
          isMultiSelect: false,
          options: [
            { key: 'A', text: '<header>' },
            { key: 'B', text: '<nav>' },
            { key: 'C', text: '<section>' },
            { key: 'D', text: '<main>' },
            { key: 'E', text: '<aside>' }
          ],
          key: 'B'
        },
        {
          id: 'Q8',
          number: 2,
          type: 'Isian',
          difficulty: 'Mudah',
          text: 'Apa kepanjangan dari singkatan CSS dalam pengembangan antarmuka web?',
          key: 'Cascading Style Sheets'
        },
        {
          id: 'Q9',
          number: 3,
          type: 'Esai',
          difficulty: 'Sedang',
          text: 'Jelaskan konsep Reactivity System pada framework Vue.js / Nuxt dan bagaimana DOM diperbarui secara otomatis saat nilai state berubah!',
          key: 'Reactivity pada Vue 3 menggunakan JavaScript Proxy untuk melacak get/set dependency secara otomatis dan menjadwalkan patch Virtual DOM.',
          rubric: 'Menjelaskan mekanisme Proxy, ref/reactive tracking, dan re-rendering Virtual DOM yang efisien.'
        }
      ]
    },
    {
      id: 'PKG-3',
      code: 'JAR-XIITKJ1',
      classroom: 'XII TKJ 1',
      subject: 'Jaringan Komputer',
      grade: 'SMK',
      difficulty: 'Sukar',
      teacherName: 'Ibu Siti Aminah, S.Pd',
      updatedAt: '29 Sep 2026',
      hasInteractive: true,
      questions: [
        {
          id: 'Q10',
          number: 1,
          type: 'PG',
          difficulty: 'Sedang',
          text: 'Perangkat jaringan yang berfungsi menghubungkan dua atau lebih segmen jaringan dengan subnet IP yang berbeda adalah...',
          isMultiSelect: false,
          options: [
            { key: 'A', text: 'Hub' },
            { key: 'B', text: 'Switch Layer 2' },
            { key: 'C', text: 'Router' },
            { key: 'D', text: 'Access Point' },
            { key: 'E', text: 'Repeater' }
          ],
          key: 'C'
        },
        {
          id: 'Q11',
          number: 2,
          type: 'Isian',
          difficulty: 'Sedang',
          text: 'Berapakah subnet mask default dalam notasi desimal untuk prefix jaringan /24?',
          key: '255.255.255.0'
        },
        {
          id: 'Q12',
          number: 3,
          type: 'Esai',
          difficulty: 'Sukar',
          text: 'Uraikan langkah-langkah konfigurasi VLAN (Virtual Local Area Network) pada manageable switch dan keuntungan penggunaannya dalam jaringan enterprise!',
          key: 'Langkah meliputi pembuatan database VLAN ID, penugasan port access, konfigurasi port trunking dengan enkapsulasi dot1q.',
          rubric: 'Menyebutkan VLAN ID, Access port, Trunking 802.1Q, serta isolasi broadcast domain.'
        }
      ]
    },
    {
      id: 'PKG-4',
      code: 'PAI-VIIA',
      classroom: 'VII-A',
      subject: 'PAI',
      grade: 'SMP',
      difficulty: 'Mudah',
      teacherName: 'Ust. Hendra Gunawan, S.Pd.I',
      updatedAt: '26 Sep 2026',
      hasInteractive: false,
      questions: [
        {
          id: 'Q13',
          number: 1,
          type: 'PG',
          difficulty: 'Mudah',
          text: 'Rukun Islam yang ketiga yang wajib ditunaikan bagi umat muslim yang telah memenuhi nisab harta adalah...',
          isMultiSelect: false,
          options: [
            { key: 'A', text: 'Membaca Dua Kalimat Syahadat' },
            { key: 'B', text: 'Menunaikan Shalat Lima Waktu' },
            { key: 'C', text: 'Membayar Zakat' },
            { key: 'D', text: 'Berpuasa di Bulan Ramadhan' },
            { key: 'E', text: 'Menunaikan Ibadah Haji' }
          ],
          key: 'C'
        },
        {
          id: 'Q14',
          number: 2,
          type: 'Isian',
          difficulty: 'Mudah',
          text: 'Sebutkan nama malaikat yang bertugas menyampaikan wahyu kepada para nabi dan rasul!',
          key: 'Malaikat Jibril'
        },
        {
          id: 'Q15',
          number: 3,
          type: 'Esai',
          difficulty: 'Sedang',
          text: 'Jelaskan hikmah menuntut ilmu dalam pandangan Islam dan bagaimana penerapannya dalam kehidupan sehari-hari sebagai pelajar!',
          key: 'Menuntut ilmu mengangkat derajat seorang mukmin di sisi Allah SWT dan menjadi bekal amal jariyah yang tidak terputus.',
          rubric: 'Menyebutkan dalil kewajiban menuntut ilmu, pengangkatan derajat, dan contoh ketekunan belajar di sekolah.'
        }
      ]
    },
    {
      id: 'PKG-5',
      code: 'MTK-IXA',
      classroom: 'IX-A',
      subject: 'Matematika',
      grade: 'SMP',
      difficulty: 'Sedang',
      teacherName: 'Ibu Rina Marlina, M.Pd',
      updatedAt: '27 Sep 2026',
      hasInteractive: true,
      questions: [
        {
          id: 'Q16',
          number: 1,
          type: 'PG',
          difficulty: 'Mudah',
          text: 'Himpunan penyelesaian dari persamaan kuadrat x² - 5x + 6 = 0 adalah...',
          isMultiSelect: false,
          options: [
            { key: 'A', text: 'x = 2 atau x = 3' },
            { key: 'B', text: 'x = -2 atau x = -3' },
            { key: 'C', text: 'x = 1 atau x = 6' },
            { key: 'D', text: 'x = -1 atau x = -6' }
          ],
          key: 'A'
        },
        {
          id: 'Q17',
          number: 2,
          type: 'Isian',
          difficulty: 'Mudah',
          text: 'Berapakah nilai dari 2 pangkat 5 (2⁵)?',
          key: '32'
        },
        {
          id: 'Q18',
          number: 3,
          type: 'Esai',
          difficulty: 'Sedang',
          text: 'Sebuah taman berbentuk persegi panjang memiliki keliling 48 meter dan panjangnya 4 meter lebih panjang dari lebarnya. Tentukan luas taman tersebut!',
          key: 'Lebar = 10 meter, Panjang = 14 meter. Luas = 10 × 14 = 140 m².',
          rubric: 'Menuliskan rumus keliling 2(p+l)=48, substitusi p=l+4, mencari nilai l=10, p=14, dan luas 140 m².'
        }
      ]
    }
  ])

  // Grade-filtered computed properties
  const grade = computed(() => currentGrade.value)

  const exams = computed(() => allExams.value.filter(e => e.grade === grade.value))
  const bank = computed(() => allBank.value.filter(q => q.grade === grade.value))
  const bankPackages = computed(() => allBankPackages.value.filter(p => p.grade === grade.value))
  const results = computed(() => allResults.value.filter(r => r.grade === grade.value))
  const cheatLogs = computed(() => allCheatLogs.value.filter(c => c.grade === grade.value))
  const teachers = computed(() => allTeachers.value.filter(t => t.grade === grade.value))

  const liveExams = computed(() => exams.value.filter(e => e.status === 'Berlangsung'))
  const scheduledExams = computed(() => exams.value.filter(e => e.status === 'Terjadwal'))
  const completedExams = computed(() => exams.value.filter(e => e.status === 'Selesai'))

  return {
    grade,
    activeTab,
    allExams,
    allBank,
    allBankPackages,
    allResults,
    allCheatLogs,
    allTeachers,
    exams,
    bank,
    bankPackages,
    results,
    cheatLogs,
    teachers,
    liveExams,
    scheduledExams,
    completedExams
  }
}

