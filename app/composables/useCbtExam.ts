import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminGrade } from '~/composables/useAdminGrade'

export interface SectionItem {
  id: string
  title: string
  short: string
  tint: string
  icon: string
  desc: string
}

export interface QuestionItem {
  sec: string
  type: 'single' | 'multiple' | 'short' | 'essay' | 'audio' | 'video' | string
  text: string
  options?: string[]
  placeholder?: string
  minWords?: number
  audioTitle?: string
  audioSub?: string
  audioScript?: string
  videoDur?: string
  videoTitle?: string
}

export type RevFilterType = 'all' | 'un' | 'fl' | 'ok'

export interface FilteredQuestionItem {
  index: number
  kind: string
  pillLabel: string
  secTitle: string
}

export interface ModalState {
  show: boolean
  title: string
  desc: string
  okText: string
  cancelText: string
  btnClass: string
  onOk: (() => void) | null
  requiresPin: boolean
  pin: string
  pinError: boolean
  fatal: boolean
}

export interface LoginForm {
  nis: string
  pass: string
  kode: string
}

export const useCbtExam = () => {
  const router = useRouter()
  const grade = useAdminGrade()

  const gradeTheme = computed<string>(() => {
    return (grade.value || 'smk').toLowerCase()
  })

  const jenjangText = computed<string>(() => {
    return grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
  })

  /* ---------- DATA SEKSI & SOAL ---------- */
  const sections: SectionItem[] = [
    {
      id: 'pg',
      title: 'Pilihan Ganda',
      short: 'PG',
      tint: 'c-blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="1.7" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="6.5" cy="17.5" r="1.7" fill="currentColor" stroke="none"/><path d="M11.5 6.5h8M11.5 12h8M11.5 17.5h8"/></svg>',
      desc: 'Pilih jawaban yang paling tepat. <b>Beberapa soal</b> meminta kamu memilih lebih dari satu jawaban.'
    },
    {
      id: 'singkat',
      title: 'Jawaban Singkat',
      short: 'Singkat',
      tint: 'c-amber',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6.5h16M4 12h10M4 17.5h14"/></svg>',
      desc: 'Ketik jawaban singkat langsung pada kolom yang tersedia.'
    },
    {
      id: 'essay',
      title: 'Essay',
      short: 'Essay',
      tint: 'c-indigo',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h7l4 4v13H6z"/><path d="M13 3.5v4h4"/><path d="M9.5 13.5h6M9.5 17h6"/></svg>',
      desc: 'Uraikan jawabanmu selengkap mungkin pada kolom essay yang disediakan.'
    },
    {
      id: 'interaktif',
      title: 'Interaktif',
      short: 'Interaktif',
      tint: 'c-rose',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="3.5"/><polygon points="10.5 9.5 15 12 10.5 14.5" fill="currentColor" stroke="none"/></svg>',
      desc: 'Dengarkan audio atau tonton video, lalu jawab pertanyaan berdasarkan media tersebut.'
    }
  ]

  const questionsSMK: QuestionItem[] = [
    { sec: 'pg', type: 'single', text: 'Perangkat yang berfungsi menghubungkan dua jaringan yang berbeda dan menentukan jalur terbaik untuk paket data adalah ….', options: ['Switch', 'Router', 'Hub', 'Repeater', 'Access point'] },
    { sec: 'pg', type: 'single', text: 'Alamat IP 192.168.10.25 termasuk ke dalam IP kelas ….', options: ['A', 'B', 'C', 'D', 'E'] },
    { sec: 'pg', type: 'single', text: 'Lapisan pada model OSI yang bertanggung jawab atas pengalamatan logis (IP addressing) adalah lapisan ….', options: ['Physical', 'Data Link', 'Network', 'Transport', 'Session'] },
    { sec: 'pg', type: 'single', text: 'Perintah pada Command Prompt yang digunakan untuk menguji konektivitas ke komputer lain dalam jaringan adalah ….', options: ['ipconfig', 'ping', 'tracert', 'netstat', 'nslookup'] },
    { sec: 'pg', type: 'single', text: 'Jenis kabel UTP yang tepat untuk menghubungkan dua perangkat sejenis (misalnya PC ke PC) adalah kabel ….', options: ['Straight-through', 'Crossover', 'Rollover', 'Coaxial', 'Fiber optik'] },
    { sec: 'pg', type: 'single', text: 'Jumlah alamat host yang dapat digunakan pada sebuah jaringan dengan subnet mask 255.255.255.0 adalah ….', options: ['254', '256', '512', '128', '510'] },
    { sec: 'pg', type: 'multiple', text: 'Pilih SEMUA pernyataan yang BENAR tentang switch.', options: ['Bekerja pada Layer 2 model OSI', 'Meneruskan frame berdasarkan MAC address', 'Dapat menghubungkan dua jaringan dengan segmen IP berbeda', 'Memiliki satu broadcast domain untuk semua port', 'Mendukung teknologi VLAN'] },
    { sec: 'pg', type: 'multiple', text: 'Manakah yang termasuk media transmisi terpandu (guided media)?', options: ['Kabel UTP', 'Kabel fiber optik', 'Gelombang radio', 'Kabel coaxial', 'Sinyal inframerah'] },
    { sec: 'singkat', type: 'short', text: 'Tuliskan kepanjangan dari DHCP.', placeholder: 'Ketik jawaban singkatmu…' },
    { sec: 'singkat', type: 'short', text: 'Protokol HTTPS secara default berjalan pada port nomor ….', placeholder: 'Ketik jawaban singkatmu…' },
    { sec: 'essay', type: 'essay', text: 'Jelaskan secara runtut proses kerja DHCP (DORA) saat sebuah komputer pertama kali terhubung ke jaringan. Uraikan setiap tahapannya dengan jelas dan sistematis.', placeholder: 'Tulis jawaban essay-mu di sini…', minWords: 40 },
    { sec: 'essay', type: 'essay', text: 'Sebuah sekolah memiliki 120 unit komputer yang terbagi ke dalam 4 laboratorium (30 unit per lab). Rancanglah skema pengalamatan IP yang efisien: tentukan network ID, subnet mask, dan rentang IP untuk masing-masing lab. Jelaskan alasan pemilihan skemamu.', placeholder: 'Tulis jawaban essay-mu di sini…', minWords: 40 },
    {
      sec: 'interaktif', type: 'audio', text: 'Berdasarkan audio di atas, perangkat yang bermasalah dan langkah pertama yang paling tepat adalah ….',
      options: ['Switch lab — mengganti seluruh kabel UTP', 'Router penghubung — memeriksa daya dan me-restart perangkat', 'Access point — mereset ulang konfigurasi', 'Server — menginstal ulang sistem operasi'],
      audioTitle: 'Skenario Troubleshooting Jaringan', audioSub: 'Dengarkan dengan saksama, lalu jawab pertanyaan di bawah.',
      audioScript: 'Skenario troubleshooting jaringan. Seorang teknisi menerima laporan bahwa seluruh komputer di Laboratorium 2 tidak dapat mengakses internet, namun komputer-komputer tersebut masih bisa saling berkomunikasi satu sama lain di dalam lab. Teknisi memeriksa kabel jaringan, switch, dan konfigurasi IP address. Semuanya dalam kondisi normal. Terakhir, teknisi memeriksa perangkat yang menghubungkan Laboratorium 2 ke jaringan utama sekolah, dan mendapati lampu indikator daya pada perangkat tersebut mati.'
    },
    {
      sec: 'interaktif', type: 'video', text: 'Perhatikan video topologi jaringan berikut. Jenis topologi apakah yang ditampilkan pada video?',
      options: ['Bus', 'Star', 'Ring', 'Mesh'], videoDur: '01:24', videoTitle: 'Video: Topologi Jaringan'
    }
  ]

  const questionsSMP: QuestionItem[] = [
    { sec: 'pg', type: 'single', text: 'Perangkat keras komputer yang berfungsi sebagai otak pemroses data utama adalah ….', options: ['Monitor', 'Processor (CPU)', 'Keyboard', 'Speaker', 'Scanner'] },
    { sec: 'pg', type: 'single', text: 'Aplikasi peramban web yang umum digunakan untuk menjelajahi internet adalah ….', options: ['Microsoft Word', 'Google Chrome', 'VLC Media Player', 'Adobe Photoshop', 'CorelDRAW'] },
    { sec: 'pg', type: 'single', text: 'Jaringan komputer yang mencakup area terbatas seperti dalam satu ruangan atau laboratorium disebut ….', options: ['LAN', 'WAN', 'MAN', 'Internet', 'SAN'] },
    { sec: 'pg', type: 'single', text: 'Kombinasi tombol keyboard yang digunakan untuk menyalin (copy) teks atau berkas adalah ….', options: ['Ctrl + X', 'Ctrl + V', 'Ctrl + C', 'Ctrl + Z', 'Ctrl + S'] },
    { sec: 'pg', type: 'single', text: 'Perangkat keluaran (output device) yang berfungsi menghasilkan cetakan fisik pada kertas adalah ….', options: ['Mouse', 'Printer', 'Microphone', 'Webcam', 'Flashdisk'] },
    { sec: 'pg', type: 'single', text: 'Satuan kapasitas penyimpanan data digital terkecil setelah Byte adalah ….', options: ['Kilobyte (KB)', 'Megabyte (MB)', 'Gigabyte (GB)', 'Terabyte (TB)', 'Petabyte (PB)'] },
    { sec: 'pg', type: 'multiple', text: 'Pilih SEMUA yang termasuk perangkat masukan (input device).', options: ['Keyboard', 'Mouse', 'Monitor', 'Scanner', 'Speaker'] },
    { sec: 'pg', type: 'multiple', text: 'Pilih etika yang BENAR saat berkomunikasi di media sosial/internet.', options: ['Menggunakan bahasa yang sopan', 'Menghormati privasi orang lain', 'Menyebarkan informasi tanpa verifikasi', 'Tidak melakukan perundungan siber (cyberbullying)', 'Membagikan kata sandi akun ke publik'] },
    { sec: 'singkat', type: 'short', text: 'Tuliskan kepanjangan dari singkatan WWW.', placeholder: 'Ketik jawaban singkatmu…' },
    { sec: 'singkat', type: 'short', text: 'Sistem operasi open-source yang memiliki maskot penguin bernama Tux adalah ….', placeholder: 'Ketik jawaban singkatmu…' },
    { sec: 'essay', type: 'essay', text: 'Jelaskan perbedaan antara perangkat keras (Hardware) dan perangkat lunak (Software), serta berikan masing-masing 3 contohnya dalam kehidupan sehari-hari.', placeholder: 'Tulis jawaban essay-mu di sini…', minWords: 30 },
    { sec: 'essay', type: 'essay', text: 'Jelaskan mengapa kita harus menjaga keamanan data pribadi dan kata sandi saat menggunakan internet di sekolah maupun di rumah.', placeholder: 'Tulis jawaban essay-mu di sini…', minWords: 30 },
    {
      sec: 'interaktif', type: 'audio', text: 'Berdasarkan instruksi audio, tindakan pencegahan virus komputer yang disarankan adalah ….',
      options: ['Mematikan antivirus komputer', 'Mengunduh file dari sembarang tautan', 'Rutin memperbarui antivirus dan tidak membuka lampiran mencurigakan', 'Menghapus seluruh file sistem operasi'],
      audioTitle: 'Tips Keamanan Digital untuk Pelajar', audioSub: 'Dengarkan penjelasan singkat berikut, lalu jawab pertanyaan.',
      audioScript: 'Perhatian untuk seluruh siswa. Untuk menjaga komputer laboratorium dari serangan program jahat atau virus, selalu pastikan perangkat lunak antivirus dalam kondisi aktif dan terbarukan. Hindari mencolokkan flashdisk yang belum dipindai dan jangan pernah membuka lampiran email dari pengirim yang tidak dikenal.'
    },
    {
      sec: 'interaktif', type: 'video', text: 'Perhatikan animasi pengenalan perangkat keras komputer berikut. Komponen yang berfungsi menyimpan data sementara saat komputer menyala adalah ….',
      options: ['Hard Disk', 'RAM', 'Power Supply', 'Heatsink'], videoDur: '01:10', videoTitle: 'Video: Komponen Hardware Komputer'
    }
  ]

  const questions = computed<QuestionItem[]>(() => {
    return grade.value === 'SMP' ? questionsSMP : questionsSMK
  })

  const letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F']
  const totalQuestions = computed<number>(() => questions.value.length)
  const DURATION: number = 90 * 60 // 90 menit (5400 detik)
  const SAVE_KEY = computed<string>(() => `cbt_darqia_${grade.value.toLowerCase()}_v1`)

  /* ---------- STATE ---------- */
  const screen = ref<'login' | 'confirm' | 'exam' | 'review' | 'done'>('login')
  const loginForm = reactive<LoginForm>({ nis: '', pass: '', kode: '' })
  const openedAcc = ref<string>('pg')
  const agreeStart = ref<boolean>(false)

  const qIdx = ref<number>(0)
  const answers = reactive<{ [key: number]: any }>({})
  const flags = reactive<Set<number>>(new Set<number>())
  const remainingTime = ref<number>(DURATION)
  let timerId: any = null
  const isSaving = ref<boolean>(false)
  const showMobilePalette = ref<boolean>(false)
  const audioPlaying = ref<boolean>(false)
  const isTimerFrozen = ref<boolean>(false) // Fitur darurat PRD: freeze timer

  const revFilter = ref<'all' | 'un' | 'fl' | 'ok'>('all')
  const submitAgree = ref<boolean>(false)

  const doneTime = ref<string>('-')
  const doneDur = ref<string>('-')
  const doneMsg = ref<string>('Jawabanmu sudah tersimpan dan terkirim ke server. Terima kasih sudah mengerjakan dengan jujur.')

  /* Modal & Toast */
  const toastMsg = ref<string>('')
  let toastTimer: any = null

  const modal = reactive<ModalState>({
    show: false,
    title: '',
    desc: '',
    okText: 'OK',
    cancelText: '',
    btnClass: 'btn-primary',
    onOk: null,
    requiresPin: false,
    pin: '',
    pinError: false,
    fatal: false
  })

  /* Anti cheat */
  const violations = ref<number>(0)
  const CHEAT_PIN = 'pengawas123'

  const defaultQuestion: QuestionItem = {
    sec: 'pg',
    type: 'single',
    text: '',
    options: []
  }

  const curQuestion = computed<QuestionItem>(() => {
    return questions.value[qIdx.value] ?? questions.value[0] ?? defaultQuestion
  })

  /* ---------- HELPERS ---------- */
  const secRange = (secId: string): number[] => {
    return questions.value.reduce((acc: number[], q: QuestionItem, i: number) => (q.sec === secId ? [...acc, i] : acc), [])
  }

  const typeLabel = (q?: QuestionItem | null): string => {
    if (!q) return ''
    const map: Record<string, string> = {
      single: 'Pilihan Ganda',
      multiple: 'Pilihan Ganda • Multi',
      short: 'Jawaban Singkat',
      essay: 'Essay',
      audio: 'Interaktif • Audio',
      video: 'Interaktif • Video'
    }
    return map[q.type] || 'Soal'
  }

  const fmtTime = (sec: number): string => {
    sec = Math.max(0, sec)
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
    const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  }

  const countWords = (s: unknown): number => {
    if (typeof s !== 'string') return 0
    const trimmed = s.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }

  const isAnswered = (i: number): boolean => {
    const q = questions.value[i]
    if (!q) return false
    const a = answers[i]
    if (q.type === 'multiple') return Array.isArray(a) && a.length > 0
    if (q.type === 'single' || q.type === 'audio' || q.type === 'video') return typeof a === 'string' && a !== ''
    return typeof a === 'string' && a.trim().length > 0
  }

  const answeredCount = computed<number>(() => {
    let n = 0
    for (let i = 0; i < totalQuestions.value; i++) {
      if (isAnswered(i)) n++
    }
    return n
  })

  const unansweredCount = computed<number>(() => totalQuestions.value - answeredCount.value)

  const isFlagged = (i: number): boolean => flags.has(i)
  const flaggedCount = computed<number>(() => flags.size)

  const sectionDoneCount = (secId: string): number => {
    return secRange(secId).filter(isAnswered).length
  }

  const isSectionDone = (secId: string): boolean => {
    const r = secRange(secId)
    return r.length > 0 && sectionDoneCount(secId) === r.length
  }

  /* Progress ring on review screen */
  const pringCircumference = (2 * Math.PI * 36).toFixed(1)
  const pringOffset = computed<string>(() => {
    const C = 2 * Math.PI * 36
    return (C * (1 - answeredCount.value / totalQuestions.value)).toFixed(1)
  })

  /* Review filtered list */
  const filteredQuestions = computed<FilteredQuestionItem[]>(() => {
    const list: FilteredQuestionItem[] = []
    for (let i = 0; i < totalQuestions.value; i++) {
      const ans = isAnswered(i)
      const flg = isFlagged(i)
      let kind = 'ok'
      let pillLabel = 'Terjawab'
      if (flg) { kind = 'fl'; pillLabel = 'Ragu-ragu' }
      else if (!ans) { kind = 'un'; pillLabel = 'Belum dijawab' }

      if (revFilter.value === 'un' && kind !== 'un') continue
      if (revFilter.value === 'fl' && kind !== 'fl') continue
      if (revFilter.value === 'ok' && kind !== 'ok') continue

      const sec = sections.find(s => s.id === questions.value[i]?.sec)
      list.push({
        index: i,
        kind,
        pillLabel,
        secTitle: sec?.title || ''
      })
    }
    return list
  })

  const revFilterTitle = computed<string>(() => {
    const t: Record<string, string> = { all: 'Semua soal', un: 'Belum dijawab', fl: 'Ragu-ragu', ok: 'Terjawab' }
    return t[revFilter.value] || 'Semua soal'
  })

  /* ---------- ACTIONS ---------- */
  const triggerToast = (msg: string, ms = 2600): void => {
    toastMsg.value = msg
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastMsg.value = '' }, ms)
  }

  const openModal = (opts: {
    title: string
    desc: string
    okText?: string
    cancelText?: string
    btnClass?: string
    requiresPin?: boolean
    fatal?: boolean
    onOk?: () => void
  }): void => {
    modal.title = opts.title
    modal.desc = opts.desc
    modal.okText = opts.okText || 'OK'
    modal.cancelText = opts.cancelText || ''
    modal.btnClass = opts.btnClass || 'btn-primary'
    modal.requiresPin = !!opts.requiresPin
    modal.pin = ''
    modal.pinError = false
    modal.fatal = !!opts.fatal
    modal.onOk = opts.onOk || null
    modal.show = true
  }

  const closeModal = (): void => {
    modal.show = false
  }

  const onModalBackClick = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).classList.contains('modal-back') && !modal.requiresPin && !modal.fatal) {
      closeModal()
    }
  }

  const handleModalOk = (): void => {
    if (modal.requiresPin) {
      if (modal.pin === CHEAT_PIN) {
        modal.show = false
        modal.pin = ''
        modal.pinError = false
        triggerToast('Kunci ujian berhasil dibuka oleh pengawas.')
      } else {
        modal.pinError = true
      }
    } else {
      const cb = modal.onOk
      closeModal()
      if (cb) cb()
    }
  }

  const toggleAcc = (id: string): void => {
    openedAcc.value = openedAcc.value === id ? '' : id
  }

  const fillDemo = (): void => {
    loginForm.nis = grade.value === 'SMP' ? '2024005678' : '2024001234'
    loginForm.pass = 'demo123'
    loginForm.kode = grade.value === 'SMP' ? 'IF-0901' : 'IF-1201'
    triggerToast('Data demo terisi. Ketuk "Masuk".')
  }

  const doLogin = (): void => {
    if (!loginForm.nis) { triggerToast('Isi Nomor Peserta / NIS dulu.'); return }
    if (!loginForm.pass) { triggerToast('Isi kata sandi dulu.'); return }

    // Resume otomatis pasca re-login jika sudah ada sesi tersimpan
    const restored = restore()
    if (restored && remainingTime.value > 0) {
      triggerToast('Sesi ujian sebelumnya dipulihkan otomatis.', 3000)
    }

    screen.value = 'confirm'
    window.scrollTo(0, 0)
  }

  const startExam = (): void => {
    if (!agreeStart.value) {
      triggerToast('Centang persetujuan tata tertib terlebih dahulu.')
      return
    }
    openModal({
      title: 'Mulai ujian sekarang?',
      desc: 'Timer <b>90 menit</b> akan langsung berjalan dan soal akan ditampilkan. Pastikan koneksi internet stabil.',
      okText: 'Mulai sekarang',
      cancelText: 'Batal',
      btnClass: 'btn-primary',
      onOk: () => beginExam()
    })
  }

  const handleNextClick = (): void => {
    if (qIdx.value === totalQuestions.value - 1) {
      goReview()
    } else {
      goTo(qIdx.value + 1)
    }
  }

  const beginExam = (): void => {
    restore()
    screen.value = 'exam'
    window.scrollTo(0, 0)
    startTimer()
    triggerToast('Selamat mengerjakan! Jawaban tersimpan otomatis setiap 10 detik.', 3000)
  }

  const startTimer = (): void => {
    stopTimer()
    timerId = setInterval(() => {
      if (isTimerFrozen.value) return // Fitur darurat: Freeze timer aktif

      remainingTime.value--
      if (remainingTime.value === 300) {
        triggerToast('Sisa waktu 5 menit! Periksa kembali jawabanmu.')
      }
      if (remainingTime.value <= 0) {
        remainingTime.value = 0
        autoSubmit()
      } else if (remainingTime.value % 10 === 0) {
        persist(true)
      }
    }, 1000)
  }

  const stopTimer = (): void => {
    if (timerId) { clearInterval(timerId); timerId = null }
  }

  const toggleFreezeTimer = (): void => {
    isTimerFrozen.value = !isTimerFrozen.value
    if (isTimerFrozen.value) {
      triggerToast('Timer ujian dibekukan oleh sistem/pengawas.')
    } else {
      triggerToast('Timer ujian dilanjutkan.')
    }
  }

  const persist = (silent = false): void => {
    try {
      localStorage.setItem(SAVE_KEY.value, JSON.stringify({
        nis: loginForm.nis,
        answers,
        flags: [...flags],
        remaining: remainingTime.value,
        idx: qIdx.value,
        violations: violations.value,
        savedAt: Date.now()
      }))
    } catch (e) {}
    isSaving.value = true
    setTimeout(() => { isSaving.value = false }, 800)
    if (!silent) triggerToast('Jawaban tersimpan otomatis.')
  }

  const restore = (): boolean => {
    try {
      const raw = localStorage.getItem(SAVE_KEY.value)
      if (!raw) return false
      const d = JSON.parse(raw)
      if (!d || typeof d !== 'object') return false
      if (d.answers) Object.assign(answers, d.answers)
      if (Array.isArray(d.flags)) {
        flags.clear()
        d.flags.forEach((f: number) => flags.add(f))
      }
      if (typeof d.remaining === 'number' && d.remaining > 0) remainingTime.value = d.remaining
      if (typeof d.idx === 'number') qIdx.value = Math.min(d.idx, totalQuestions.value - 1)
      if (typeof d.violations === 'number') violations.value = d.violations
      return true
    } catch (e) {
      return false
    }
  }

  const goTo = (i: number): void => {
    if (i < 0 || i >= totalQuestions.value) return
    stopAudio()
    persist(true)
    qIdx.value = i
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToSection = (secId: string): void => {
    const r = secRange(secId)
    const target = r[0]
    if (typeof target === 'number') {
      goTo(target)
    }
  }

  const isOptionSelected = (i: number, oi: number): boolean => {
    const a = answers[i]
    return Array.isArray(a) && a.includes(oi)
  }

  const selectOption = (i: number, oi: number): void => {
    const q = questions.value[i]
    if (!q) return
    if (q.type === 'multiple') {
      let cur = Array.isArray(answers[i]) ? [...answers[i]] : []
      cur = cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi]
      if (cur.length) answers[i] = cur; else delete answers[i]
    } else {
      answers[i] = String(oi)
    }
    persist(true)
  }

  const onTextAnswerInput = (): void => {
    persist(true)
  }

  const toggleFlag = (i: number): void => {
    if (flags.has(i)) {
      flags.delete(i)
      triggerToast('Tanda ragu-ragu dihapus.')
    } else {
      flags.add(i)
      triggerToast(`Soal ${i + 1} ditandai ragu-ragu.`)
    }
    persist(true)
  }

  const openMobilePalette = (): void => {
    showMobilePalette.value = true
  }

  /* Audio Speech */
  const toggleAudio = (q: QuestionItem): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      triggerToast('Perangkat tidak mendukung pemutar audio demo.')
      return
    }
    if (audioPlaying.value) {
      stopAudio()
      return
    }
    stopAudio()
    const u = new SpeechSynthesisUtterance(q.audioScript || '')
    u.lang = 'id-ID'
    u.rate = 0.95
    u.onend = u.onerror = () => { audioPlaying.value = false }
    audioPlaying.value = true
    speechSynthesis.speak(u)
  }

  const stopAudio = (): void => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
    } catch (e) {}
    audioPlaying.value = false
  }

  /* Review & Submit (Aturan PRD & AGENTS.md: Submit Terkunci bila belum selesai) */
  const goReview = (): void => {
    stopAudio()
    persist(true)
    submitAgree.value = false
    revFilter.value = 'all'
    screen.value = 'review'
    window.scrollTo(0, 0)
  }

  const goToFromReview = (i: number): void => {
    screen.value = 'exam'
    goTo(i)
  }

  const attemptSubmit = (): void => {
    if (unansweredCount.value > 0) {
      openModal({
        title: 'Pengumpulan Terkunci!',
        desc: `Kamu belum bisa mengumpulkan jawaban karena masih ada <b>${unansweredCount.value} soal</b> yang belum dijawab. Selesaikan semua soal terlebih dahulu sesuai tata tertib ujian.`,
        okText: 'Lengkapi Soal',
        btnClass: 'btn-primary',
        onOk: () => {
          screen.value = 'exam'
        }
      })
      return
    }

    if (!submitAgree.value) {
      triggerToast('Centang pernyataan yakin mengumpulkan terlebih dahulu.')
      return
    }

    openModal({
      title: 'Kumpulkan jawaban?',
      desc: 'Pastikan semua jawaban sudah benar. Jawaban <b>tidak dapat diubah</b> setelah dikumpulkan.',
      okText: 'Ya, kumpulkan',
      cancelText: 'Batal',
      btnClass: 'btn-primary',
      onOk: () => doSubmit(false)
    })
  }

  const autoSubmit = (): void => {
    stopTimer()
    openModal({
      title: 'Waktu habis!',
      desc: 'Jawabanmu dikumpulkan otomatis oleh sistem.',
      okText: 'Lihat Hasil',
      btnClass: 'btn-primary',
      onOk: () => doSubmit(true)
    })
  }

  const doSubmit = (auto: boolean): void => {
    stopTimer()
    stopAudio()
    try { localStorage.removeItem(SAVE_KEY.value) } catch (e) {}

    const d = new Date()
    doneTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`
    const usedSec = Math.max(0, DURATION - remainingTime.value)
    const um = Math.max(0, Math.round(usedSec / 60))
    doneDur.value = um >= 60 ? `${Math.floor(um / 60)} jam ${um % 60} menit` : `${um} menit`

    if (auto) {
      doneMsg.value = 'Waktu ujian telah habis. Jawabanmu dikumpulkan otomatis dan sudah terkirim ke server.'
    }

    screen.value = 'done'
    window.scrollTo(0, 0)
  }

  const resetToHome = (): void => {
    try { localStorage.removeItem(SAVE_KEY.value) } catch (e) {}
    router.push('/')
  }

  /* Keyboard handler */
  const onKeydown = (e: KeyboardEvent): void => {
    if (screen.value !== 'exam') return
    const tag = (e.target as HTMLElement)?.tagName?.toUpperCase() || ''
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    if (e.key >= '1' && e.key <= '6') {
      const q = questions.value[qIdx.value]
      if (q && (q.type === 'single' || q.type === 'multiple' || q.type === 'audio' || q.type === 'video') && q.options) {
        const oi = +e.key - 1
        if (oi < q.options.length) selectOption(qIdx.value, oi)
      }
    } else if (e.key === 'ArrowRight') {
      if (qIdx.value === totalQuestions.value - 1) goReview(); else goTo(qIdx.value + 1)
    } else if (e.key === 'ArrowLeft') {
      goTo(qIdx.value - 1)
    } else if (e.key.toLowerCase() === 'f') {
      toggleFlag(qIdx.value)
    } else if (e.key === 'Escape') {
      showMobilePalette.value = false
    }
  }

  /* Anti cheat & leave protection */
  const onVisibilityChange = (): void => {
    if (screen.value === 'exam' || screen.value === 'review') {
      if (document.visibilityState === 'hidden') {
        violations.value++
        triggerCheatLock()
      }
    }
  }

  const onWindowBlur = (): void => {
    if (screen.value === 'exam' || screen.value === 'review') {
      violations.value++
      triggerCheatLock()
    }
  }

  const triggerCheatLock = (): void => {
    if (violations.value >= 3) {
      openModal({
        title: 'Pelanggaran Fatal!',
        desc: 'Kamu terdeteksi meninggalkan layar ujian lebih dari batas maksimal (3x). <b>Akun kamu diblokir permanen untuk ujian ini dan data ujian terkunci.</b>',
        fatal: true
      })
    } else {
      openModal({
        title: 'Peringatan Pelanggaran!',
        desc: `Kamu terdeteksi meninggalkan layar ujian (pindah tab/aplikasi). Ini adalah pelanggaran ke-<b>${violations.value}</b> (Maks 2x sebelum blokir total). Silakan minta kata sandi ke pengawas ujian untuk membuka kunci.`,
        requiresPin: true,
        okText: 'Buka Kunci'
      })
    }
  }

  const onBeforeUnload = (e: BeforeUnloadEvent): void => {
    if (screen.value === 'exam' || screen.value === 'review') {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  const registerListeners = (): void => {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('beforeunload', onBeforeUnload)
  }

  const unregisterListeners = (): void => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('blur', onWindowBlur)
    window.removeEventListener('beforeunload', onBeforeUnload)
    stopTimer()
    stopAudio()
  }

  const setRevFilter = (val: RevFilterType | string): void => {
    revFilter.value = (val as RevFilterType) || 'all'
  }

  const setSubmitAgree = (val: boolean): void => {
    submitAgree.value = val
  }

  const setAgreeStart = (val: boolean): void => {
    agreeStart.value = val
  }

  const setShowMobilePalette = (val: boolean): void => {
    showMobilePalette.value = val
  }

  const goToExamScreen = (): void => {
    screen.value = 'exam'
  }

  return {
    grade,
    gradeTheme,
    jenjangText,
    sections,
    questions,
    totalQuestions,
    letters,
    screen,
    loginForm,
    openedAcc,
    agreeStart,
    qIdx,
    answers,
    flags,
    remainingTime,
    isSaving,
    isTimerFrozen,
    showMobilePalette,
    audioPlaying,
    revFilter,
    submitAgree,
    doneTime,
    doneDur,
    doneMsg,
    toastMsg,
    modal,
    violations,
    curQuestion,
    answeredCount,
    unansweredCount,
    flaggedCount,
    pringCircumference,
    pringOffset,
    filteredQuestions,
    revFilterTitle,
    secRange,
    typeLabel,
    fmtTime,
    countWords,
    isAnswered,
    isFlagged,
    sectionDoneCount,
    isSectionDone,
    isOptionSelected,
    triggerToast,
    openModal,
    closeModal,
    onModalBackClick,
    handleModalOk,
    toggleAcc,
    fillDemo,
    doLogin,
    startExam,
    beginExam,
    handleNextClick,
    goTo,
    goToSection,
    selectOption,
    onTextAnswerInput,
    toggleFlag,
    openMobilePalette,
    toggleAudio,
    stopAudio,
    toggleFreezeTimer,
    goReview,
    goToFromReview,
    attemptSubmit,
    autoSubmit,
    doSubmit,
    resetToHome,
    setRevFilter,
    setSubmitAgree,
    setAgreeStart,
    setShowMobilePalette,
    goToExamScreen,
    registerListeners,
    unregisterListeners
  }
}
