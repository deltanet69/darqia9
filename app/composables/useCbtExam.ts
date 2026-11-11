import { ref, reactive, computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useCbtSiswa } from '~/composables/useCbtSiswa'
import { keadaanUjian, type UjianSiswa } from '~/utils/cbtSiswaJadwal'
import { acakPerSiswa } from '~/utils/cbtAcak'

export interface SectionItem {
  id: string
  title: string
  short: string
  tint: string
  icon: string
  desc: string
}

export interface QuestionItem {
  id?: string
  sec: string
  type: 'single' | 'multiple' | 'short' | 'essay' | 'audio' | 'video' | string
  text: string
  options?: string[]
  placeholder?: string
  minWords?: number
  maxWords?: number
  storyText?: string
  isRtl?: boolean
  mediaUrl?: string
  mediaFileName?: string
  interactiveAnswerType?: 'PG' | 'PG_Multi' | 'Isian'
  answerKey?: string | string[]
  rubric?: string
  audioTitle?: string
  audioSub?: string
  audioScript?: string
  videoDur?: string
  videoTitle?: string
  imageUrl?: string
  optionOrder?: number[] // posisi tampil -> indeks pilihan asli (acak per siswa)
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
  level?: number
  badge?: string
  kodeTampil?: string // PR di rumah: kode acak yang ditampilkan di popup dan harus diketik ulang
  memeriksa?: boolean
}

export interface LoginForm {
  nis: string
  kode: string
}

export const useCbtExam = () => {
  const grade = useAdminGrade()
  const siswa = useCbtSiswa()
  const activeExam = ref<{ id: string; source: 'cbt' | 'ujian_harian'; name: string; code: string; duration: number; studentName: string; classroom: string; subject: string; jenis?: string; startsAt?: string } | null>(null)
  const appTab = ref<'home' | 'jadwal' | 'rekap' | 'profil'>('home')
  const examQuestions = ref<QuestionItem[]>([])
  const loadingExam = ref(false)

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

  const mapExamQuestions = (rows: any[]): QuestionItem[] => rows.map(q => {
        let sec = 'pg'
        let qType: QuestionItem['type'] = 'single'

        if (q.type === 'PG') {
          sec = 'pg'
          qType = q.is_multi_select ? 'multiple' : 'single'
        } else if (q.type === 'Isian') {
          sec = 'singkat'
          qType = 'short'
        } else if (q.type === 'Esai') {
          sec = 'essay'
          qType = 'essay'
        } else if (q.type === 'Interaktif') {
          sec = 'interaktif'
          qType = q.media_type === 'video' ? 'video' : 'audio'
        }

        const options = q.options ? q.options.map((option: { text: string }) => option.text) : []

        return {
          id: q.id,
          sec,
          type: qType,
          text: q.text,
          options: options.length > 0 ? options : undefined,
          placeholder: q.type === 'Esai' ? 'Tulis jawaban essay-mu di sini…' : 'Ketik jawaban singkatmu…',
          minWords: q.type === 'Esai' && q.essay_mode !== 'hitung' ? 50 : undefined,
          storyText: q.story_text || undefined,
          isRtl: q.is_rtl,
          imageUrl: q.image_url,
          audioTitle: q.media_file_name || 'Audio Ujian',
          audioSub: 'Dengarkan rekaman dengan saksama',
          mediaUrl: q.media_url,
          mediaFileName: q.media_file_name,
          interactiveAnswerType: q.interactive_answer_type,
          videoTitle: q.media_file_name || 'Video Materi Soal'
        }
      })
  const questions = computed<QuestionItem[]>(() => examQuestions.value)

  const letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F']
  const totalQuestions = computed<number>(() => questions.value.length)
  const DURATION = computed(() => (activeExam.value?.duration ?? 90) * 60)
  const SAVE_KEY = computed(() => `cbt_darqia_${grade.value}_${activeExam.value?.id}_${siswa.state.value.sesi?.nis ?? loginForm.nis}_v3`)
  const SOAL_KEY = (source: string, id: string) => `cbt_soal_${source}_${id}_v1`
  const AKTIF_KEY = 'cbt_aktif_v1'

  /* ---------- STATE ---------- */
  const screen = ref<'login' | 'app' | 'confirm' | 'exam' | 'review' | 'done'>('login')
  const loginForm = reactive<LoginForm>({ nis: '', kode: '' })
  const openedAcc = ref<string>('pg')
  const agreeStart = ref<boolean>(false)

  const qIdx = ref<number>(0)
  const answers = reactive<{ [key: number]: any }>({})
  const flags = reactive<Set<number>>(new Set<number>())
  const remainingTime = ref<number>(DURATION.value)
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
    fatal: false,
    kodeTampil: '',
    memeriksa: false
  })

  /* Anti cheat */
  const violations = ref<number>(0)

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
    if (q.type === 'essay' && q.minWords && countWords(a) < q.minWords) return false
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
    level?: number
    badge?: string
    kodeTampil?: string
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
    modal.level = opts.level || (opts.fatal ? 3 : opts.requiresPin ? 1 : 0)
    modal.badge = opts.badge || ''
    modal.kodeTampil = opts.kodeTampil || ''
    modal.memeriksa = false
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

  const bukaKunciBerhasil = (): void => {
    modal.show = false
    modal.pin = ''
    modal.pinError = false
    triggerToast('Kunci ujian berhasil dibuka.')
  }

  const handleModalOk = async (): Promise<void> => {
    if (modal.requiresPin) {
      if (modal.memeriksa) return
      const kode = modal.pin.trim().toUpperCase()
      // Simulasi (hanya development): sandi uji coba. Di production kode selalu dicek server atau dicocokkan dengan kode di popup.
      if (import.meta.dev && (kode === 'CBT' || kode === 'PENGAWAS123')) { bukaKunciBerhasil(); return }
      if (modal.kodeTampil) { // PR di rumah: tanpa pengawas, cukup mengetik ulang kode acak
        if (kode === modal.kodeTampil) bukaKunciBerhasil(); else modal.pinError = true
        return
      }
      // Ujian diawasi: kode diberikan guru/pengawas dan dicek di server.
      modal.memeriksa = true
      try {
        const hasil = await $fetch<{ ok: boolean }>('/api/cbt/buka-kunci', { method: 'POST', body: { ...kunciDasar(), kode } })
        if (hasil?.ok) bukaKunciBerhasil(); else modal.pinError = true
      } catch (e: any) {
        triggerToast(pesanGalat(e, 'Kode belum bisa diperiksa. Coba lagi.'), 3500)
      } finally { modal.memeriksa = false }
    } else {
      const cb = modal.onOk
      closeModal()
      if (cb) cb()
    }
  }

  const toggleAcc = (id: string): void => {
    openedAcc.value = openedAcc.value === id ? '' : id
  }

  const pesanGalat = (e: any, cadangan: string): string => e?.data?.statusMessage || e?.statusMessage || cadangan

  // Login ringan: hanya NIS + token. Soal tidak dimuat di sini.
  const doLogin = async (): Promise<void> => {
    if (loadingExam.value) return
    if (!loginForm.nis.trim()) { triggerToast('Isi Nomor Peserta / NIS dulu.'); return }
    if (!loginForm.kode.trim()) { triggerToast('Isi token ujian dulu.'); return }
    loadingExam.value = true
    try {
      await siswa.masuk(loginForm.nis.trim(), loginForm.kode.trim().toUpperCase(), grade.value as 'SMP' | 'SMK')
      loginForm.nis = ''
      loginForm.kode = ''
      appTab.value = 'home'
      screen.value = 'app'
      window.scrollTo(0, 0)
    } catch (error: any) {
      triggerToast(pesanGalat(error, 'Login gagal. Periksa koneksi lalu coba lagi.'), 3500)
    } finally { loadingExam.value = false }
  }

  const keluarAplikasi = (): void => {
    siswa.keluar()
    activeExam.value = null
    screen.value = 'login'
    window.scrollTo(0, 0)
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  const bacaSoalCache = (source: string, id: string): any[] | null => {
    try { const d = JSON.parse(localStorage.getItem(SOAL_KEY(source, id)) || 'null'); return Array.isArray(d) && d.length ? d : null } catch { return null }
  }
  const kunciDasar = (): { nis: string; token: string; grade: string; source: string; examId: string } => {
    const sesi = siswa.state.value.sesi
    if (!sesi || !activeExam.value) throw new Error('Sesi ujian tidak tersedia. Masuk ulang.')
    return { nis: sesi.nis, token: sesi.token, grade: sesi.grade, source: activeExam.value.source, examId: activeExam.value.id }
  }

  // Jawaban yang sudah sampai ke server (tanda tangan per soal) agar hanya perubahan yang dikirim.
  const terkirim = new Map<string, string>()
  const tandaJawaban = (i: number) => JSON.stringify([answers[i], flags.has(i)])
  const adaJawaban = (i: number) => answers[i] !== undefined && answers[i] !== null

  // Ambil data ujian + keadaan tersimpan di server. lanjut = true: kembali ke ujian yang sedang berjalan.
  const siapkanUjian = async (ref: { source: 'cbt' | 'ujian_harian'; id: string; mulai?: string }, lanjut = false): Promise<void> => {
    const sesi = siswa.state.value.sesi
    if (!sesi) throw new Error('Sesi berakhir. Masuk ulang.')
    const cache = bacaSoalCache(ref.source, ref.id)
    // Saat jam ujian baru tiba, ribuan siswa membuka bersamaan: jeda acak singkat agar beban server tersebar.
    if (!lanjut && !cache && ref.mulai && siswa.sekarang() - new Date(ref.mulai).getTime() < 60_000) await sleep(Math.random() * 2500)
    const hasil = await $fetch<any>('/api/cbt/siapkan', {
      method: 'POST',
      body: { nis: sesi.nis, token: sesi.token, grade: sesi.grade, source: ref.source, examId: ref.id, tanpaSoal: !!cache }
    })
    const soalMentah = hasil.questions || cache
    if (!soalMentah?.length) throw new Error('Ujian belum memiliki soal. Hubungi pengawas.')
    if (hasil.questions) { try { localStorage.setItem(SOAL_KEY(ref.source, ref.id), JSON.stringify(hasil.questions)) } catch { /* penyimpanan penuh: soal tetap dari server */ } }

    const { questions: _soal, jawaban, ...info } = hasil
    activeExam.value = info
    // Urutan soal dan pilihan jawaban diacak berbeda untuk tiap siswa. Garam acak dibuat sekali per siswa per ujian
    // dan disimpan di perangkat, jadi urutan tidak bisa ditebak dari NIS dan tidak berubah saat halaman dimuat ulang.
    const kunciGaram = `cbt-garam:${sesi.nis}|${ref.source}|${ref.id}`
    let garam = ''
    try {
      garam = localStorage.getItem(kunciGaram) || Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('')
      localStorage.setItem(kunciGaram, garam)
    } catch { /* penyimpanan tidak tersedia: acak tetap per siswa, hanya tidak bergaram */ }
    examQuestions.value = acakPerSiswa(mapExamQuestions(soalMentah), `${sesi.nis}|${ref.source}|${ref.id}|${garam}`, sections.map(s => s.id), info.acakEsai === false ? ['essay'] : [])
    Object.keys(answers).forEach(key => delete answers[Number(key)])
    flags.clear()
    terkirim.clear()
    qIdx.value = 0
    violations.value = info.pelanggaran ?? 0
    remainingTime.value = typeof info.sisaDetik === 'number' ? info.sisaDetik : DURATION.value
    const indeks = new Map(examQuestions.value.map((q, i) => [q.id, i]))
    for (const [qid, nilai] of Object.entries<any>(jawaban || {})) {
      const i = indeks.get(qid)
      if (i === undefined) continue
      answers[i] = nilai.a
      if (nilai.d) flags.add(i)
      terkirim.set(qid, tandaJawaban(i))
    }
    restore() // cadangan di perangkat bisa lebih baru dari server (belum sempat terkirim)
    agreeStart.value = false

    if (info.terkunci) {
      triggerToast('Ujian dikunci karena pelanggaran. Jawabanmu dikumpulkan otomatis.', 4000)
      void doSubmit(true)
      return
    }
    if (info.mulaiPada) {
      masukUjian(true)
      // Halaman dimuat ulang saat masih terkunci karena pelanggaran: popup kode muncul lagi tanpa menambah pelanggaran.
      if (info.menungguKode && violations.value > 0 && violations.value < 3) triggerCheatLock('Ujian dibuka kembali, tetapi kunci pelanggaran belum dibuka', violations.value)
      return
    }
    screen.value = 'confirm'
    window.scrollTo(0, 0)
  }

  // Dari Beranda/Jadwal: hanya bisa dibuka bila jam ujiannya sudah tiba.
  const bukaUjian = async (u: UjianSiswa): Promise<void> => {
    if (loadingExam.value) return
    const k = keadaanUjian(u, siswa.sekarang())
    if (k === 'terkunci' || k === 'belum') { triggerToast('Waktu ujian tersebut belum tiba.'); return }
    if (k === 'selesai') { triggerToast('Kamu sudah mengumpulkan ujian ini.'); return }
    if (k === 'akun-terkunci') { triggerToast('Akunmu terkunci untuk ujian ini. Hubungi pengawas.', 3500); return }
    if (k === 'lewat') { triggerToast('Waktu ujian telah berakhir.'); return }
    loadingExam.value = true
    try {
      await siapkanUjian(u)
    } catch (error: any) {
      triggerToast(pesanGalat(error, error?.message || 'Ujian gagal dibuka. Coba lagi.'), 3500)
      void siswa.muatJadwal(true)
    } finally { loadingExam.value = false }
  }

  // Setelah refresh di tengah ujian: kembali ke ujian tanpa verifikasi ulang.
  const pulihkanUjian = async (): Promise<boolean> => {
    let aktif: { source: 'cbt' | 'ujian_harian'; id: string } | null = null
    try { aktif = JSON.parse(sessionStorage.getItem(AKTIF_KEY) || 'null') } catch { aktif = null }
    if (!aktif || !siswa.state.value.sesi) return false
    loadingExam.value = true
    try {
      await siapkanUjian(aktif, true)
      return true
    } catch {
      try { sessionStorage.removeItem(AKTIF_KEY) } catch { /* abaikan */ }
      return false
    } finally { loadingExam.value = false }
  }

  const startExam = (): void => {
    if (!agreeStart.value) {
      triggerToast('Centang persetujuan tata tertib terlebih dahulu.')
      return
    }
    openModal({
      title: 'Mulai ujian sekarang?',
      desc: `Timer <b>${activeExam.value?.duration ?? 90} menit</b> akan langsung berjalan dan soal akan ditampilkan. Pastikan koneksi internet stabil.`,
      okText: 'Mulai sekarang',
      cancelText: 'Batal',
      btnClass: 'btn-primary',
      onOk: () => { void beginExam() }
    })
  }

  const handleNextClick = (): void => {
    if (qIdx.value === totalQuestions.value - 1) {
      goReview()
    } else {
      goTo(qIdx.value + 1)
    }
  }

  // Timer dimulai di server saat siswa menekan Mulai (tahan refresh/ganti perangkat).
  const beginExam = async (): Promise<void> => {
    try {
      const hasil = await $fetch<any>('/api/cbt/mulai', { method: 'POST', body: kunciDasar() })
      remainingTime.value = hasil.sisaDetik
    } catch (error: any) {
      triggerToast(pesanGalat(error, 'Ujian belum bisa dimulai. Coba lagi.'), 3500)
      return
    }
    masukUjian(false)
  }

  const masukUjian = (lanjut: boolean): void => {
    restore()
    void nyalakanLayar()
    try { sessionStorage.setItem(AKTIF_KEY, JSON.stringify({ source: activeExam.value?.source, id: activeExam.value?.id })) } catch { /* abaikan */ }
    screen.value = 'exam'
    window.scrollTo(0, 0)
    startTimer()
    triggerToast(lanjut ? 'Melanjutkan ujianmu. Jawaban yang tersimpan sudah dipulihkan.' : 'Selamat mengerjakan! Jawaban tersimpan otomatis setiap 10 detik.', 3000)
  }

  let batasWaktu = 0
  let denyut = 0
  const startTimer = (): void => {
    stopTimer()
    batasWaktu = Date.now() + remainingTime.value * 1000
    denyut = 0
    timerId = setInterval(() => {
      if (isTimerFrozen.value) { batasWaktu += 1000; return } // Fitur darurat: Freeze timer aktif

      // Dihitung dari batas waktu (bukan hitung mundur 1 detik) agar tetap akurat saat HP melambat.
      remainingTime.value = Math.max(0, Math.ceil((batasWaktu - Date.now()) / 1000))
      if (remainingTime.value === 300) {
        triggerToast('Sisa waktu 5 menit! Periksa kembali jawabanmu.')
      }
      if (remainingTime.value <= 0) {
        autoSubmit()
      } else if (++denyut % 10 === 0) {
        persist(true)
        void sinkronServer()
      }
    }, 1000)
  }

  const stopTimer = (): void => {
    if (timerId) { clearInterval(timerId); timerId = null }
  }

  // Kirim jawaban yang berubah + pelanggaran yang tertunda (bila jaringan sempat putus).
  let sedangKirim = false
  const antrePelanggaran: string[] = []
  const jawabanBerubah = (semua = false) => {
    const daftar: Array<{ q: string; a: unknown; d: boolean }> = []
    questions.value.forEach((q, i) => {
      if (!q.id || !adaJawaban(i)) return
      if (semua || terkirim.get(q.id) !== tandaJawaban(i)) daftar.push({ q: q.id, a: answers[i], d: flags.has(i) })
    })
    return daftar
  }
  const sinkronServer = async (): Promise<void> => {
    if (sedangKirim || !activeExam.value) return
    sedangKirim = true
    try {
      while (antrePelanggaran.length) {
        await $fetch('/api/cbt/pelanggaran', { method: 'POST', body: { ...kunciDasar(), jenis: antrePelanggaran[0] } })
        antrePelanggaran.shift()
      }
      const daftar = jawabanBerubah()
      if (!daftar.length) return
      await $fetch('/api/cbt/simpan', { method: 'POST', body: { ...kunciDasar(), jawaban: daftar } })
      for (const item of daftar) {
        const i = questions.value.findIndex(q => q.id === item.q)
        if (i >= 0) terkirim.set(item.q, tandaJawaban(i))
      }
    } catch { /* jaringan lemot: dicoba lagi di denyut berikutnya; cadangan di perangkat tetap ada */ }
    finally { sedangKirim = false }
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
      if (typeof d.idx === 'number') qIdx.value = Math.max(0, Math.min(d.idx, totalQuestions.value - 1))
      if (typeof d.violations === 'number') violations.value = Math.max(violations.value, d.violations)
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

  // Jawaban disimpan dengan indeks pilihan ASLI; layar memakai posisi tampil (yang diacak per siswa).
  const indeksAsli = (i: number, oi: number): number => questions.value[i]?.optionOrder?.[oi] ?? oi

  const isOptionSelected = (i: number, oi: number): boolean => {
    const a = answers[i]
    const asli = indeksAsli(i, oi)
    return Array.isArray(a) ? a.includes(asli) : a === String(asli)
  }

  const selectOption = (i: number, oi: number): void => {
    const q = questions.value[i]
    if (!q) return
    const asli = indeksAsli(i, oi)
    if (q.type === 'multiple') {
      let cur = Array.isArray(answers[i]) ? [...answers[i]] : []
      cur = cur.includes(asli) ? cur.filter(x => x !== asli) : [...cur, asli]
      if (cur.length) answers[i] = cur; else delete answers[i]
    } else {
      answers[i] = String(asli)
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
    void sinkronServer()
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

  // Hasil ujian yang langsung tampil setelah dikumpulkan (dihitung server, esai dinilai AI).
  const hasil = ref<{ total: number; benar: number; salah: number; kosong: number; menunggu: number; nilai: number } | null>(null)
  const menghitung = ref(false)
  let sedangKumpul = false
  const doSubmit = async (auto: boolean): Promise<void> => {
    if (sedangKumpul) return
    sedangKumpul = true
    stopTimer()
    stopAudio()
    menghitung.value = true
    try {
      hasil.value = await $fetch<any>('/api/cbt/kumpulkan', { method: 'POST', body: { ...kunciDasar(), jawaban: jawabanBerubah(true) } })
    } catch (error: any) {
      sedangKumpul = false
      menghitung.value = false
      // Jangan lanjut ke layar selesai bila server belum menerima jawaban.
      openModal({
        title: 'Pengumpulan belum berhasil',
        desc: `${pesanGalat(error, 'Koneksi bermasalah.')}<br><br>Jawabanmu aman di perangkat ini. Periksa koneksi internet lalu coba lagi.`,
        okText: 'Coba Lagi',
        btnClass: 'btn-primary',
        onOk: () => { void doSubmit(auto) }
      })
      return
    }
    sedangKumpul = false
    menghitung.value = false
    const kunci = activeExam.value
    try {
      localStorage.removeItem(SAVE_KEY.value)
      if (kunci) localStorage.removeItem(SOAL_KEY(kunci.source, kunci.id))
      sessionStorage.removeItem(AKTIF_KEY)
    } catch (e) {}
    siswa.kadaluwarsa()
    lepasLayar()

    const d = new Date()
    doneTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`
    const usedSec = Math.max(0, DURATION.value - remainingTime.value)
    const um = Math.max(0, Math.round(usedSec / 60))
    doneDur.value = um >= 60 ? `${Math.floor(um / 60)} jam ${um % 60} menit` : `${um} menit`

    if (auto) {
      doneMsg.value = 'Waktu ujian telah habis. Jawabanmu dikumpulkan otomatis dan sudah terkirim ke server.'
    } else {
      doneMsg.value = 'Jawabanmu sudah tersimpan dan terkirim ke server. Terima kasih sudah mengerjakan dengan jujur.'
    }

    screen.value = 'done'
    window.scrollTo(0, 0)
  }

  const resetToHome = (): void => {
    appTab.value = 'home'
    screen.value = 'app'
    activeExam.value = null
    void siswa.muatJadwal(true)
    window.scrollTo(0, 0)
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
  let lastViolationTimestamp = 0

  // Tanpa karakter yang mirip (0/O, 1/I) agar mudah diketik ulang.
  const kodeAcak = (): string => Array.from(crypto.getRandomValues(new Uint8Array(3)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('')

  const triggerCheatLock = (customReason?: string, explicitLevel?: number, jenis?: string): void => {
    const now = Date.now()
    if (!explicitLevel && now - lastViolationTimestamp < 1200) return // debounce rapid blur & visibility events
    lastViolationTimestamp = now

    if (explicitLevel) {
      violations.value = explicitLevel
    } else {
      violations.value++
    }
    persist(true)
    // Simulasi (uji coba) tidak dicatat; pelanggaran nyata dicatat di server dan menjadi bagian Rekap Ujian.
    if (jenis && activeExam.value) {
      if (jenis === 'tutup_browser') {
        // Saat halaman ditutup/dimuat ulang, fetch biasa terputus: pakai sendBeacon agar tetap tercatat.
        try { navigator.sendBeacon('/api/cbt/pelanggaran', new Blob([JSON.stringify({ ...kunciDasar(), jenis })], { type: 'application/json' })) } catch { antrePelanggaran.push(jenis) }
      } else { antrePelanggaran.push(jenis); void sinkronServer() }
    }

    const defaultReason = 'Meninggalkan layar ujian (terdeteksi perpindahan tab, alt+tab, atau aplikasi lain)'
    const reasonText = customReason || defaultReason
    // PR di rumah tidak diawasi: kode buka (3 karakter) muncul acak di popup. Ujian lain: kode diminta ke guru/pengawas.
    const kodePR = activeExam.value?.jenis === 'pr' ? kodeAcak() : ''
    const petunjukBuka = kodePR ? 'Ketik ulang kode acak di bawah ini untuk melanjutkan.' : 'Silakan lapor kepada guru/pengawas, lalu masukkan kode buka kunci yang mereka berikan untuk melanjutkan.'

    if (violations.value >= 3) {
      // PERINGATAN 3: FATAL LOCKDOWN & PAKSA SUBMIT
      openModal({
        title: 'PERINGATAN 3: PELANGGARAN FATAL',
        badge: 'AKUN DIBLOKIR TOTAL • PAKSA SUBMIT',
        level: 3,
        desc: `<span class="text-rose-600 font-black block mb-2">🛑 STATUS: AKUN UJIAN DIBEKUKAN PERMANEN</span>Sistem mendeteksi aktivitas terlarang: <b>${reasonText}</b> telah mencapai batas maksimal (3x pelanggaran).<br><br>Sesuai aturan anti-kecurangan, <b>sesi ujian Anda dihentikan paksa</b>. Seluruh jawaban Anda yang telah tersimpan otomatis dikumpulkan ke server dan lembar ujian dikunci total.`,
        okText: 'Paksa Kumpulkan Jawaban & Selesai',
        fatal: true,
        btnClass: 'btn-danger',
        onOk: () => doSubmit(true)
      })
    } else if (violations.value === 2) {
      // PERINGATAN 2: HIGH ALERT & WARNING SERIUS
      openModal({
        title: 'PERINGATAN 2: PERINGATAN KERAS (WASPADA)',
        badge: 'PERINGATAN 2 • SISA 1 KESEMPATAN!',
        level: 2,
        desc: `<span class="text-amber-700 font-black block mb-2">⚠️ PERINGATAN WASPADA TINGKAT TINGGI</span>Anda kembali terdeteksi <b>${reasonText}</b>!<br><br>Ini adalah <b>kesempatan terakhir Anda</b>. Jika terdeteksi meninggalkan layar 1x lagi, akun Anda akan <b>DIBLOKIR TOTAL DAN UJIAN DIPAKSA SUBMIT</b>.<br><br>${petunjukBuka}`,
        requiresPin: true,
        kodeTampil: kodePR,
        okText: 'Buka Kunci Ujian (Peringatan Terakhir)',
        btnClass: 'btn-primary'
      })
    } else {
      // PERINGATAN 1: PERINGATAN AWAL DENGAN PASSWORD CBT
      openModal({
        title: 'PERINGATAN 1: TERDETEKSI PINDAH TAB',
        badge: 'PERINGATAN 1 • TOLERANSI SISA 2X',
        level: 1,
        desc: `Anda terdeteksi <b>${reasonText}</b>.<br><br>Sesuai tata tertib CBT, <b>layar ujian Anda telah dikunci sementara oleh sistem</b>. ${petunjukBuka} (Toleransi tersisa: <b>2x</b> sebelum akun diblokir permanen).`,
        requiresPin: true,
        kodeTampil: kodePR,
        okText: 'Buka Kunci Ujian',
        btnClass: 'btn-primary'
      })
    }
  }

  const simulateViolation = (targetLevel?: number): void => {
    if (typeof targetLevel === 'number') {
      triggerCheatLock(`Simulasi Deteksi Kecurangan Tingkat ${targetLevel} (Uji Coba Presentasi)`, targetLevel)
    } else {
      triggerCheatLock('Simulasi Deteksi Kecurangan (Uji Coba Presentasi & Demo)')
    }
  }

  // Layar HP tetap menyala selama ujian (Screen Wake Lock: Chrome Android, Safari iOS 16.4+, juga saat dipasang
  // sebagai aplikasi/PWA). Layar yang mati sendiri terbaca seperti pindah tab, jadi dicegah dari awal.
  // Wake lock lepas otomatis saat halaman tersembunyi, maka diminta ulang setiap halaman tampil lagi.
  let kunciLayar: { release: () => Promise<void> } | null = null
  const nyalakanLayar = async (): Promise<void> => {
    try {
      if (kunciLayar || document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return
      kunciLayar = await (navigator as any).wakeLock.request('screen')
      ;(kunciLayar as any).addEventListener?.('release', () => { kunciLayar = null })
    } catch { kunciLayar = null /* tidak didukung / ditolak perangkat: ujian tetap jalan */ }
  }
  const lepasLayar = (): void => {
    try { void kunciLayar?.release() } catch { /* abaikan */ }
    kunciLayar = null
  }

  const onVisibilityChange = (): void => {
    if (screen.value === 'exam' || screen.value === 'review') {
      if (document.visibilityState === 'hidden') {
        // Pindah aplikasi memicu blur lalu halaman tersembunyi: cukup dihitung sekali.
        if (tundaBlur) { clearTimeout(tundaBlur); tundaBlur = null }
        triggerCheatLock('Berpindah tab atau meminimalkan jendela ujian', undefined, 'pindah_tab')
      } else {
        void nyalakanLayar()
      }
    }
  }

  // Kehilangan fokus sesaat (tarik panel notifikasi, popup sistem/izin, keyboard, pemilih tanggal, mengetuk pemutar
  // YouTube/Drive) bukan pindah aplikasi. Hanya dihitung bila fokus tidak kembali dalam 2 detik; pindah aplikasi di HP
  // tetap langsung terdeteksi lewat visibilitychange (halaman tersembunyi).
  let tundaBlur: ReturnType<typeof setTimeout> | null = null
  const onWindowBlur = (): void => {
    if (screen.value !== 'exam' && screen.value !== 'review') return
    if (tundaBlur) clearTimeout(tundaBlur)
    tundaBlur = setTimeout(() => {
      tundaBlur = null
      if (document.hasFocus() || document.activeElement?.tagName === 'IFRAME') return
      if (screen.value === 'exam' || screen.value === 'review') {
        triggerCheatLock('Kehilangan fokus jendela ujian (membuka aplikasi lain / Alt+Tab)', undefined, 'alt_tab')
      }
    }, 2000)
  }
  const onWindowFocus = (): void => { if (tundaBlur) { clearTimeout(tundaBlur); tundaBlur = null } }

  const onBeforeUnload = (e: BeforeUnloadEvent): void => {
    if (screen.value === 'exam' || screen.value === 'review') {
      e.preventDefault()
      e.returnValue = 'Dilarang meninggalkan atau menutup halaman ujian! Tindakan ini akan mengunci akun ujian Anda.'
      triggerCheatLock('Mencoba menutup atau me-reload jendela ujian', undefined, 'tutup_browser')
    }
  }

  const registerListeners = (): void => {
    if (typeof window === 'undefined') return
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)
    window.addEventListener('beforeunload', onBeforeUnload)
  }

  const unregisterListeners = (): void => {
    if (typeof window === 'undefined') return
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('blur', onWindowBlur)
    window.removeEventListener('focus', onWindowFocus)
    window.removeEventListener('beforeunload', onBeforeUnload)
    stopTimer()
    stopAudio()
    lepasLayar()
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
    hasil,
    menghitung,
    siswa,
    appTab,
    bukaUjian,
    pulihkanUjian,
    keluarAplikasi,
    activeExam,
    loadingExam,
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
    simulateViolation,
    registerListeners,
    unregisterListeners
  }
}
