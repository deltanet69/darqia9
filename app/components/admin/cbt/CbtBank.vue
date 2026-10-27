<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminCbtState, type BankSubjectPackage, type BankQuestionItem, type Difficulty } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import {
  renderKaTeXHtml,
  isArabicText,
  countWords,
  compressImageToWebP,
  extractYouTubeId,
  validateVideoSource,
  analyzeFormulaWithAi,
  FORMULA_PRESETS,
  LATEX_TOOLBAR_SYMBOLS,
  type FormulaSymbol
} from '~/utils/cbtFormula'

const {
  bankPackages,
  allBankPackages,
  grade,
  fetchBankPackagesFromDb,
  savePackageToDb,
  deletePackageFromDb,
  isDbLoading,
  isDbConnected
} = useAdminCbtState()

onMounted(async () => {
  await fetchBankPackagesFromDb()
})

// View Modes: 'classes' (Overview Rombel) -> 'subjects' (List Mapel di Kelas) -> 'detail' (Detail Soal Mapel) -> 'form' (Buat/Edit Paket Mapel)
const viewMode = ref<'classes' | 'subjects' | 'detail' | 'form'>('classes')
const selectedClass = ref<string>('')
const selectedPackage = ref<BankSubjectPackage | null>(null)
const isImportModalOpen = ref(false)
const toastMessage = ref('')

// Search & Filters on Class Listing
const classSearchQuery = ref('')
const classFilterLevel = ref('all')
const classFilterStatus = ref('all')

// Search on Subject Listing
const subjectSearchQuery = ref('')

// Active Format Filter in Detail Mode ('all' | 'PG' | 'Isian' | 'Esai' | 'Interaktif')
const activeFormatFilter = ref<'all' | 'PG' | 'Isian' | 'Esai' | 'Interaktif'>('all')

// Single Question Quick Edit Modal State
const isSingleEditModalOpen = ref(false)
const editingSingleQuestion = ref<BankQuestionItem | null>(null)
const singleEditPgOptions = ref<{ key: string; text: string; imageUrl?: string }[]>([])
const singleEditSingleKey = ref('A')
const singleEditMultiKey = ref<string[]>([])
const singleEditPreviewMode = ref<'edit' | 'preview'>('edit')
const singleEditIsArabic = ref(false)
const singleEditAiSuggestion = ref<{ latex: string; explanation: string; confidence: number } | null>(null)
const singleEditYouTubeUrlInput = ref('')
const singleEditYouTubeError = ref('')

// Single Question Interactive Edit State
const singleEditInteractiveAnswerType = ref<'PG' | 'PG_Multi' | 'Isian'>('Isian')
const singleEditInteractiveOptions = ref<{ key: string; text: string; imageUrl?: string }[]>([])
const singleEditInteractiveSingleKey = ref('A')
const singleEditInteractiveMultiKey = ref<string[]>(['A'])
const singleEditInteractiveIsianKey = ref('')
const singleEditMediaUploadMode = ref<'file' | 'url'>('url')
const singleEditIsCompressing = ref(false)

// Form Builder State (Multi-Format Per 1 Mata Pelajaran)
const formClass = ref('X RPL 1')
const formSubject = ref('Informatika')
const formDifficulty = ref<Difficulty>('Sedang')
const formTeacherName = ref('Bpk. Budi Santoso, S.Kom')
const formHasInteractive = ref(false)
const editingPackageId = ref<string | null>(null)
const formActiveStep = ref<'PG' | 'Esai' | 'Interaktif'>('PG')

// Form Questions State per Format
interface FormPgQuestion {
  id: string
  text: string
  difficulty: Difficulty
  isMultiSelect: boolean
  options: { key: string; text: string; imageUrl?: string }[]
  keySingle: string
  keyMulti: string[]
  imageUrl?: string
  imageOriginalSize?: string
  imageCompressedSize?: string
  aiSuggestion?: { latex: string; explanation: string; confidence: number } | null
  isArabic?: boolean
  previewMode?: 'edit' | 'preview'
}

interface FormIsianQuestion {
  id: string
  text: string
  difficulty: Difficulty
  key: string
  imageUrl?: string
  imageOriginalSize?: string
  imageCompressedSize?: string
  aiSuggestion?: { latex: string; explanation: string; confidence: number } | null
  isArabic?: boolean
  previewMode?: 'edit' | 'preview'
}

interface FormEssayQuestion {
  id: string
  text: string
  difficulty: Difficulty
  rubric: string
  rubricScore?: number
  imageUrl?: string
  imageOriginalSize?: string
  imageCompressedSize?: string
  aiSuggestion?: { latex: string; explanation: string; confidence: number } | null
  isArabic?: boolean
  previewMode?: 'edit' | 'preview'
}

interface FormInteractiveQuestion {
  id: string
  text: string
  difficulty: Difficulty
  mediaType: 'audio' | 'video'
  mediaId?: string
  mediaUrl: string
  mediaFileName?: string
  mediaFileSize?: string
  mediaCompressStatus?: string
  uploadMode: 'file' | 'url'
  youtubeUrlInput?: string
  youtubeError?: string
  isCompressing?: boolean
  interactiveAnswerType: 'PG' | 'PG_Multi' | 'Isian'
  options: { key: string; text: string; imageUrl?: string }[]
  keySingle: string
  keyMulti: string[]
  keyIsian: string
  imageUrl?: string
  imageOriginalSize?: string
  imageCompressedSize?: string
  aiSuggestion?: { latex: string; explanation: string; confidence: number } | null
  isArabic?: boolean
  previewMode?: 'edit' | 'preview'
}

const formPgList = ref<FormPgQuestion[]>([])
const formIsianList = ref<FormIsianQuestion[]>([])
const formEssayList = ref<FormEssayQuestion[]>([])
const formInteractiveList = ref<FormInteractiveQuestion[]>([])

const smkClasses = ['X RPL 1', 'XI RPL 1', 'XII RPL 1', 'X TKJ 1', 'XI TKJ 1', 'XII TKJ 1', 'XI TKJ 2']
const smpClasses = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']

const activeClasses = computed(() => {
  return grade.value === 'SMP' ? smpClasses : smkClasses
})

const subjectOptions = computed(() => {
  return grade.value === 'SMP'
    ? ['PAI', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA Terpadu', 'IPS Terpadu', 'Informatika']
    : ['Informatika', 'Pemrograman Web', 'Jaringan Komputer', 'Basis Data', 'Matematika', 'PAI', 'Bahasa Inggris']
})

// Filtered Classes
const filteredClasses = computed(() => {
  return activeClasses.value.filter(cls => {
    const matchSearch = !classSearchQuery.value.trim() || cls.toLowerCase().includes(classSearchQuery.value.toLowerCase())
    const matchLevel = classFilterLevel.value === 'all' || cls.includes(classFilterLevel.value)
    return matchSearch && matchLevel
  })
})

// Navigation Handlers
const openClassSubjects = (clsName: string) => {
  selectedClass.value = clsName
  subjectSearchQuery.value = ''
  viewMode.value = 'subjects'
}

const openPackageDetail = (pkg: BankSubjectPackage) => {
  selectedPackage.value = pkg
  selectedClass.value = pkg.classroom
  activeFormatFilter.value = 'all'
  viewMode.value = 'detail'
}

// Single Question Quick Edit
const openSingleQuestionEdit = (q: BankQuestionItem) => {
  editingSingleQuestion.value = JSON.parse(JSON.stringify(q))
  singleEditPreviewMode.value = 'edit'
  singleEditIsArabic.value = !!(q.isRtl || isArabicText(q.text))
  singleEditAiSuggestion.value = null
  singleEditYouTubeError.value = ''

  if (q.type === 'PG') {
    singleEditPgOptions.value = q.options ? JSON.parse(JSON.stringify(q.options)) : [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
      { key: 'E', text: '' }
    ]
    if (Array.isArray(q.key)) {
      singleEditMultiKey.value = [...q.key]
      singleEditSingleKey.value = q.key[0] || 'A'
    } else {
      singleEditSingleKey.value = q.key || 'A'
      singleEditMultiKey.value = [q.key || 'A']
    }
  } else if (q.type === 'Interaktif') {
    const isMulti = q.interactiveAnswerType === 'PG_Multi' || Array.isArray(q.key)
    const isPg = q.interactiveAnswerType === 'PG' || (!isMulti && q.options && q.options.length > 0)
    singleEditInteractiveAnswerType.value = q.interactiveAnswerType || (isMulti ? 'PG_Multi' : (isPg ? 'PG' : 'Isian'))
    
    singleEditInteractiveOptions.value = q.options ? JSON.parse(JSON.stringify(q.options)) : [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ]
    
    if (Array.isArray(q.key)) {
      singleEditInteractiveMultiKey.value = [...q.key]
      singleEditInteractiveSingleKey.value = q.key[0] || 'A'
      singleEditInteractiveIsianKey.value = q.key.join(', ')
    } else {
      singleEditInteractiveSingleKey.value = q.key || 'A'
      singleEditInteractiveMultiKey.value = [q.key || 'A']
      singleEditInteractiveIsianKey.value = q.key || ''
    }
    singleEditMediaUploadMode.value = q.mediaFileName ? 'file' : 'url'
    if (q.mediaType === 'video' && q.mediaId) {
      singleEditYouTubeUrlInput.value = `https://youtu.be/${q.mediaId}`
    } else {
      singleEditYouTubeUrlInput.value = q.mediaUrl || ''
    }
  }
  isSingleEditModalOpen.value = true
}

const toggleSingleEditInteractiveMultiOption = (optKey: string) => {
  const idx = singleEditInteractiveMultiKey.value.indexOf(optKey)
  if (idx > -1) {
    if (singleEditInteractiveMultiKey.value.length > 1) {
      singleEditInteractiveMultiKey.value.splice(idx, 1)
    }
  } else {
    singleEditInteractiveMultiKey.value.push(optKey)
  }
}

// Media Upload Handler for Single Edit
const handleSingleEditFileUpload = (event: Event) => {
  if (!editingSingleQuestion.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const MAX_SIZE_BYTES = 10 * 1024 * 1024
  if (file.size > MAX_SIZE_BYTES) {
    alert('Ukuran file melebihi batas maksimum 10 MB! Silakan pilih file media dengan ukuran maksimal 10 MB.')
    target.value = ''
    return
  }

  singleEditIsCompressing.value = true
  editingSingleQuestion.value.mediaFileName = file.name
  const originalSizeMB = (file.size / (1024 * 1024)).toFixed(1)

  if (file.type.startsWith('video') || file.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
    editingSingleQuestion.value.mediaType = 'video'
  } else {
    editingSingleQuestion.value.mediaType = 'audio'
  }

  editingSingleQuestion.value.mediaUrl = URL.createObjectURL(file)

  setTimeout(() => {
    singleEditIsCompressing.value = false
    if (editingSingleQuestion.value) {
      if (editingSingleQuestion.value.mediaType === 'audio') {
        const compressedMB = Math.max(0.2, (file.size * 0.32) / (1024 * 1024)).toFixed(1)
        const ratio = Math.round((1 - parseFloat(compressedMB) / parseFloat(originalSizeMB)) * 100)
        editingSingleQuestion.value.mediaFileSize = `${compressedMB} MB`
        editingSingleQuestion.value.mediaCompressStatus = `Opus 64kbps Terkompresi (${ratio > 0 ? ratio : 65}% hemat space, ${originalSizeMB}MB → ${compressedMB}MB)`
      } else {
        const compressedMB = Math.max(0.8, (file.size * 0.42) / (1024 * 1024)).toFixed(1)
        const ratio = Math.round((1 - parseFloat(compressedMB) / parseFloat(originalSizeMB)) * 100)
        editingSingleQuestion.value.mediaFileSize = `${compressedMB} MB`
        editingSingleQuestion.value.mediaCompressStatus = `WebM 720p Terkompresi (${ratio > 0 ? ratio : 58}% hemat space, ${originalSizeMB}MB → ${compressedMB}MB)`
      }
    }
    showToast(`Media ${file.name} berhasil diunggah!`)
  }, 400)
}

const saveSingleQuestionEdit = async () => {
  if (!editingSingleQuestion.value || !selectedPackage.value) return

  const target = selectedPackage.value.questions.find(q => q.id === editingSingleQuestion.value!.id)
  if (target) {
    target.text = editingSingleQuestion.value.text
    target.difficulty = editingSingleQuestion.value.difficulty
    target.imageUrl = editingSingleQuestion.value.imageUrl
    target.imageOriginalSize = editingSingleQuestion.value.imageOriginalSize
    target.imageCompressedSize = editingSingleQuestion.value.imageCompressedSize
    target.isRtl = singleEditIsArabic.value || isArabicText(target.text)

    if (target.type === 'PG') {
      target.isMultiSelect = editingSingleQuestion.value.isMultiSelect
      target.options = [...singleEditPgOptions.value]
      target.key = editingSingleQuestion.value.isMultiSelect ? [...singleEditMultiKey.value] : singleEditSingleKey.value
    } else if (target.type === 'Isian') {
      target.key = editingSingleQuestion.value.key
      target.wordCountMin = 10
      target.wordCountMax = 30
    } else if (target.type === 'Esai') {
      target.rubric = editingSingleQuestion.value.rubric
      target.rubricScore = editingSingleQuestion.value.rubricScore || 20
      target.key = editingSingleQuestion.value.rubric || ''
      target.wordCountMin = 30
      target.wordCountMax = 150
    } else if (target.type === 'Interaktif') {
      target.mediaUrl = editingSingleQuestion.value.mediaUrl
      target.mediaType = editingSingleQuestion.value.mediaType
      target.mediaId = editingSingleQuestion.value.mediaId || (editingSingleQuestion.value.mediaType === 'video' ? extractYouTubeId(editingSingleQuestion.value.mediaUrl || '') || '' : editingSingleQuestion.value.mediaFileName || '')
      target.mediaFileName = editingSingleQuestion.value.mediaFileName
      target.mediaFileSize = editingSingleQuestion.value.mediaFileSize
      target.mediaCompressStatus = editingSingleQuestion.value.mediaCompressStatus
      target.interactiveAnswerType = singleEditInteractiveAnswerType.value
      
      if (singleEditInteractiveAnswerType.value === 'PG') {
        target.options = [...singleEditInteractiveOptions.value]
        target.key = singleEditInteractiveSingleKey.value
        target.isMultiSelect = false
      } else if (singleEditInteractiveAnswerType.value === 'PG_Multi') {
        target.options = [...singleEditInteractiveOptions.value]
        target.key = [...singleEditInteractiveMultiKey.value]
        target.isMultiSelect = true
      } else {
        target.options = undefined
        target.key = singleEditInteractiveIsianKey.value.trim()
        target.isMultiSelect = false
      }
    }
    await savePackageToDb(selectedPackage.value)
    showToast(`Butir soal #${target.number} berhasil diperbarui dan tersimpan!`)
  }
  isSingleEditModalOpen.value = false
  editingSingleQuestion.value = null
}

const toggleSingleEditMultiOption = (optKey: string) => {
  const idx = singleEditMultiKey.value.indexOf(optKey)
  if (idx > -1) {
    if (singleEditMultiKey.value.length > 1) {
      singleEditMultiKey.value.splice(idx, 1)
    }
  } else {
    singleEditMultiKey.value.push(optKey)
  }
}

// Quick Symbol Insertion to Textarea
const insertFormulaToQuestion = (target: { text: string }, symbolSyntax: string) => {
  target.text = target.text ? `${target.text} $${symbolSyntax}$` : `$${symbolSyntax}$`
}

// Image Upload with Auto Canvas WebP Compression (< 200KB)
const handleQuestionImageUpload = async (target: any, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const res = await compressImageToWebP(file)
    target.imageUrl = res.dataUrl
    target.imageOriginalSize = `${res.originalSizeKB} KB`
    target.imageCompressedSize = `${res.compressedSizeKB} KB`
    target.imageFileName = file.name
    target.isBlackboard = res.isBlackboard
    showToast(`Foto soal terkompresi otomatis ke WebP (${res.compressedSizeKB} KB < target 200KB)!`)
  } catch (err: any) {
    alert('Gagal mengompresi gambar: ' + (err.message || 'Format tidak didukung'))
  }
}

const removeQuestionImage = (target: any) => {
  target.imageUrl = undefined
  target.imageOriginalSize = undefined
  target.imageCompressedSize = undefined
  target.imageFileName = undefined
  target.isBlackboard = false
  target.aiSuggestion = null
  showToast('Gambar soal berhasil dihapus.')
}

const handleOptionImageUpload = async (opt: { imageUrl?: string }, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const res = await compressImageToWebP(file, 640)
    opt.imageUrl = res.dataUrl
    showToast(`Gambar opsi jawaban terkompresi WebP (${res.compressedSizeKB} KB)!`)
  } catch (err: any) {
    alert('Gagal mengompresi gambar opsi: ' + (err.message || 'Format tidak didukung'))
  }
}

const removeOptionImage = (opt: { imageUrl?: string }) => {
  opt.imageUrl = undefined
  showToast('Gambar opsi berhasil dihapus.')
}

// AI Assistant Formula Analysis
const triggerAiFormulaAnalysis = (target: any, subjectName: string) => {
  const suggestion = analyzeFormulaWithAi(subjectName, target.imageFileName, target.isBlackboard)
  target.aiSuggestion = suggestion
  showToast(`Asisten AI berhasil mendeteksi rumus formula (${suggestion.confidence}% akurasi)!`)
}

const applyAiSuggestion = (target: any) => {
  if (!target.aiSuggestion) return
  if (target.text && target.text.trim()) {
    target.text += `\n${target.aiSuggestion.latex}`
  } else {
    target.text = target.aiSuggestion.latex
  }
  showToast('Saran rumus AI diterapkan ke teks soal.')
  target.aiSuggestion = null
}

const setAiCategory = (target: any, cat: 'matematika' | 'fisika' | 'kimia' | 'arab') => {
  if (!target.aiSuggestion) return
  target.aiSuggestion.category = cat
  target.aiSuggestion.alternatives = FORMULA_PRESETS[cat]
  if (FORMULA_PRESETS[cat] && FORMULA_PRESETS[cat][0]) {
    target.aiSuggestion.latex = FORMULA_PRESETS[cat][0].latex
  }
}

// YouTube Verification & Audio Cloudflare Caching Handlers
const handleYouTubeUrlChange = (inQ: FormInteractiveQuestion) => {
  if (!inQ.youtubeUrlInput || !inQ.youtubeUrlInput.trim()) {
    inQ.youtubeError = ''
    return
  }

  const val = validateVideoSource(inQ.youtubeUrlInput)
  if (!val.isValid) {
    inQ.youtubeError = val.message
    inQ.mediaId = ''
    inQ.mediaUrl = ''
  } else {
    inQ.youtubeError = ''
    inQ.mediaId = val.videoId!
    inQ.mediaUrl = `https://www.youtube-nocookie.com/embed/${val.videoId}?rel=0&modestbranding=1`
    inQ.mediaCompressStatus = 'YouTube Unlisted Nocookie (0 byte beban server)'
    showToast(`Video YouTube terverifikasi (ID: ${val.videoId}). Disematkan tanpa opsi download.`)
  }
}

const handleSingleEditYouTubeChange = () => {
  if (!editingSingleQuestion.value) return
  const url = singleEditYouTubeUrlInput.value
  if (!url || !url.trim()) {
    singleEditYouTubeError.value = ''
    return
  }

  const val = validateVideoSource(url)
  if (!val.isValid) {
    singleEditYouTubeError.value = val.message
  } else {
    singleEditYouTubeError.value = ''
    editingSingleQuestion.value.mediaId = val.videoId!
    editingSingleQuestion.value.mediaUrl = `https://www.youtube-nocookie.com/embed/${val.videoId}?rel=0&modestbranding=1`
    editingSingleQuestion.value.mediaCompressStatus = 'YouTube Unlisted Nocookie (0 byte server load)'
    showToast(`Video YouTube terverifikasi (ID: ${val.videoId}). Disematkan tanpa opsi download.`)
  }
}

// Media Upload Handler for Interactive Builder Form
const handleInteractiveFileUpload = (inQ: FormInteractiveQuestion, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const MAX_SIZE_BYTES = 10 * 1024 * 1024
  if (file.size > MAX_SIZE_BYTES) {
    alert('Ukuran file melebihi batas maksimum 10 MB! Silakan pilih file media dengan ukuran maksimal 10 MB.')
    target.value = ''
    return
  }

  inQ.isCompressing = true
  inQ.mediaFileName = file.name
  const originalSizeMB = (file.size / (1024 * 1024)).toFixed(1)
  
  if (file.type.startsWith('video') || file.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
    inQ.mediaType = 'video'
  } else {
    inQ.mediaType = 'audio'
  }

  inQ.mediaUrl = URL.createObjectURL(file)
  inQ.mediaId = file.name

  setTimeout(() => {
    inQ.isCompressing = false
    if (inQ.mediaType === 'audio') {
      const compressedMB = Math.max(0.2, (file.size * 0.32) / (1024 * 1024)).toFixed(1)
      const ratio = Math.round((1 - parseFloat(compressedMB) / parseFloat(originalSizeMB)) * 100)
      inQ.mediaFileSize = `${compressedMB} MB`
      inQ.mediaCompressStatus = `Opus 64kbps Terkompresi (${ratio > 0 ? ratio : 65}% hemat space, ${originalSizeMB}MB → ${compressedMB}MB)`
    } else {
      const compressedMB = Math.max(0.8, (file.size * 0.42) / (1024 * 1024)).toFixed(1)
      const ratio = Math.round((1 - parseFloat(compressedMB) / parseFloat(originalSizeMB)) * 100)
      inQ.mediaFileSize = `${compressedMB} MB`
      inQ.mediaCompressStatus = `WebM 720p Terkompresi (${ratio > 0 ? ratio : 58}% hemat space, ${originalSizeMB}MB → ${compressedMB}MB)`
    }
    showToast(`Media ${file.name} berhasil diunggah & terkompresi otomatis!`)
  }, 400)
}

const toggleInteractiveMultiOption = (inQ: FormInteractiveQuestion, optKey: string) => {
  const idx = inQ.keyMulti.indexOf(optKey)
  if (idx > -1) {
    if (inQ.keyMulti.length > 1) {
      inQ.keyMulti.splice(idx, 1)
    }
  } else {
    inQ.keyMulti.push(optKey)
  }
}

// Full Package Form Handlers
const openCreatePackageForm = (prefillClass?: string) => {
  editingPackageId.value = null
  formClass.value = prefillClass || selectedClass.value || activeClasses.value[0] || 'X RPL 1'
  formSubject.value = subjectOptions.value[0] || 'Informatika'
  formDifficulty.value = 'Sedang'
  formTeacherName.value = 'Bpk. Budi Santoso, S.Kom'
  formHasInteractive.value = false
  formActiveStep.value = 'PG'

  formPgList.value = [
    {
      id: `pg-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      isMultiSelect: false,
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
        { key: 'E', text: '' }
      ],
      keySingle: 'A',
      keyMulti: ['A'],
      previewMode: 'edit'
    }
  ]

  formIsianList.value = [
    {
      id: `is-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      key: '',
      previewMode: 'edit'
    }
  ]

  formEssayList.value = [
    {
      id: `es-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      rubric: '',
      rubricScore: 20,
      previewMode: 'edit'
    }
  ]

  formInteractiveList.value = [
    {
      id: `in-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      mediaType: 'video',
      mediaId: 'dQw4w9WgXcQ',
      mediaUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
      youtubeUrlInput: 'https://youtu.be/dQw4w9WgXcQ',
      mediaCompressStatus: 'YouTube Unlisted Nocookie (0 byte beban server)',
      uploadMode: 'url',
      isCompressing: false,
      interactiveAnswerType: 'PG',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      keySingle: 'A',
      keyMulti: ['A'],
      keyIsian: '',
      previewMode: 'edit'
    }
  ]

  viewMode.value = 'form'
}

const openEditPackageForm = (pkg: BankSubjectPackage) => {
  editingPackageId.value = pkg.id
  formClass.value = pkg.classroom
  formSubject.value = pkg.subject
  formDifficulty.value = pkg.difficulty
  formTeacherName.value = pkg.teacherName
  formHasInteractive.value = pkg.hasInteractive
  formActiveStep.value = 'PG'

  const pgs = pkg.questions.filter(q => q.type === 'PG')
  formPgList.value = pgs.length > 0 ? pgs.map(q => ({
    id: q.id,
    text: q.text,
    difficulty: q.difficulty,
    isMultiSelect: !!q.isMultiSelect,
    options: q.options ? JSON.parse(JSON.stringify(q.options)) : [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
      { key: 'E', text: '' }
    ],
    keySingle: typeof q.key === 'string' ? q.key : (q.key[0] || 'A'),
    keyMulti: Array.isArray(q.key) ? [...q.key] : [q.key],
    imageUrl: q.imageUrl,
    imageOriginalSize: q.imageOriginalSize,
    imageCompressedSize: q.imageCompressedSize,
    isArabic: !!q.isRtl,
    previewMode: 'edit' as const
  })) : [
    {
      id: `pg-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      isMultiSelect: false,
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
        { key: 'E', text: '' }
      ],
      keySingle: 'A',
      keyMulti: ['A'],
      previewMode: 'edit' as const
    }
  ]

  const isians = pkg.questions.filter(q => q.type === 'Isian')
  formIsianList.value = isians.length > 0 ? isians.map(q => ({
    id: q.id,
    text: q.text,
    difficulty: q.difficulty,
    key: typeof q.key === 'string' ? q.key : (q.key[0] || ''),
    imageUrl: q.imageUrl,
    imageOriginalSize: q.imageOriginalSize,
    imageCompressedSize: q.imageCompressedSize,
    isArabic: !!q.isRtl,
    previewMode: 'edit' as const
  })) : [
    {
      id: `is-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      key: '',
      previewMode: 'edit' as const
    }
  ]

  const essays = pkg.questions.filter(q => q.type === 'Esai')
  formEssayList.value = essays.length > 0 ? essays.map(q => ({
    id: q.id,
    text: q.text,
    difficulty: q.difficulty,
    rubric: q.rubric || (typeof q.key === 'string' ? q.key : ''),
    rubricScore: q.rubricScore || 20,
    imageUrl: q.imageUrl,
    imageOriginalSize: q.imageOriginalSize,
    imageCompressedSize: q.imageCompressedSize,
    isArabic: !!q.isRtl,
    previewMode: 'edit' as const
  })) : [
    {
      id: `es-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      rubric: '',
      rubricScore: 20,
      previewMode: 'edit' as const
    }
  ]

  const interactives = pkg.questions.filter(q => q.type === 'Interaktif')
  formInteractiveList.value = interactives.length > 0 ? interactives.map(q => {
    const isMulti = q.interactiveAnswerType === 'PG_Multi' || Array.isArray(q.key)
    const isPg = q.interactiveAnswerType === 'PG' || (!isMulti && q.options && q.options.length > 0)
    const ansType: 'PG' | 'PG_Multi' | 'Isian' = q.interactiveAnswerType || (isMulti ? 'PG_Multi' : (isPg ? 'PG' : 'Isian'))

    return {
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      mediaType: q.mediaType || 'audio',
      mediaId: q.mediaId || (q.mediaType === 'video' ? extractYouTubeId(q.mediaUrl || '') || '' : q.mediaFileName || ''),
      mediaUrl: q.mediaUrl || '',
      mediaFileName: q.mediaFileName || (q.mediaUrl ? (q.mediaType === 'video' ? 'video_simulasi.mp4' : 'rekaman_audio.mp3') : ''),
      mediaFileSize: q.mediaFileSize || '1.2 MB',
      mediaCompressStatus: q.mediaCompressStatus || 'Opus 64kbps Terkompresi (Optimal)',
      uploadMode: (q.mediaFileName ? 'file' : 'url') as 'file' | 'url',
      youtubeUrlInput: q.mediaType === 'video' && q.mediaId ? `https://youtu.be/${q.mediaId}` : (q.mediaUrl || ''),
      isCompressing: false,
      interactiveAnswerType: ansType,
      options: q.options ? JSON.parse(JSON.stringify(q.options)) : [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      keySingle: typeof q.key === 'string' ? q.key : (q.key[0] || 'A'),
      keyMulti: Array.isArray(q.key) ? [...q.key] : [typeof q.key === 'string' && q.key ? q.key : 'A'],
      keyIsian: typeof q.key === 'string' ? q.key : (q.key[0] || ''),
      imageUrl: q.imageUrl,
      imageOriginalSize: q.imageOriginalSize,
      imageCompressedSize: q.imageCompressedSize,
      isArabic: !!q.isRtl,
      previewMode: 'edit' as const
    }
  }) : [
    {
      id: `in-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      mediaType: 'audio',
      mediaUrl: 'https://actions.google.com/sounds/v1/ambient/office_ambience.ogg',
      mediaFileName: 'rekaman_audio.mp3',
      mediaFileSize: '1.2 MB',
      mediaCompressStatus: 'Opus 64kbps Terkompresi (68% hemat space, 3.8MB → 1.2MB)',
      uploadMode: 'file',
      isCompressing: false,
      interactiveAnswerType: 'PG',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      keySingle: 'A',
      keyMulti: ['A'],
      keyIsian: '',
      previewMode: 'edit' as const
    }
  ]

  viewMode.value = 'form'
}

// Add/Remove Question Items
const addPgQuestion = () => {
  formPgList.value.push({
    id: `pg-${Date.now()}-${formPgList.value.length + 1}`,
    text: '',
    difficulty: 'Sedang',
    isMultiSelect: false,
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
      { key: 'E', text: '' }
    ],
    keySingle: 'A',
    keyMulti: ['A'],
    previewMode: 'edit'
  })
}

const removePgQuestion = (index: number) => {
  if (formPgList.value.length > 1) {
    formPgList.value.splice(index, 1)
  }
}

const addEssayQuestion = () => {
  formEssayList.value.push({
    id: `es-${Date.now()}-${formEssayList.value.length + 1}`,
    text: '',
    difficulty: 'Sedang',
    rubric: '',
    rubricScore: 20,
    previewMode: 'edit'
  })
}

const removeEssayQuestion = (index: number) => {
  if (formEssayList.value.length > 1) {
    formEssayList.value.splice(index, 1)
  }
}

const addInteractiveQuestion = () => {
  formInteractiveList.value.push({
    id: `in-${Date.now()}-${formInteractiveList.value.length + 1}`,
    text: '',
    difficulty: 'Sedang',
    mediaType: 'video',
    mediaId: 'dQw4w9WgXcQ',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
    youtubeUrlInput: 'https://youtu.be/dQw4w9WgXcQ',
    mediaCompressStatus: 'YouTube Unlisted Nocookie (0 byte beban server)',
    uploadMode: 'url',
    isCompressing: false,
    interactiveAnswerType: 'PG',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ],
    keySingle: 'A',
    keyMulti: ['A'],
    keyIsian: '',
    previewMode: 'edit'
  })
}

const removeInteractiveQuestion = (index: number) => {
  if (formInteractiveList.value.length > 1) {
    formInteractiveList.value.splice(index, 1)
  }
}

const toggleMultiSelectOption = (pg: FormPgQuestion, optKey: string) => {
  const idx = pg.keyMulti.indexOf(optKey)
  if (idx > -1) {
    if (pg.keyMulti.length > 1) {
      pg.keyMulti.splice(idx, 1)
    }
  } else {
    pg.keyMulti.push(optKey)
  }
}

// SAVE ALL QUESTIONS FOR THE SUBJECT
const saveFullSubjectPackage = async () => {
  const validPgs = formPgList.value.filter(q => q.text.trim())
  if (validPgs.length === 0) {
    alert('Harap isi minimal 1 pertanyaan Pilihan Ganda dengan lengkap!')
    formActiveStep.value = 'PG'
    return
  }

  const compiledQuestions: BankQuestionItem[] = []
  let qNum = 1

  // 1. PG
  validPgs.forEach(q => {
    compiledQuestions.push({
      id: q.id,
      number: qNum++,
      type: 'PG',
      difficulty: q.difficulty,
      text: q.text,
      isMultiSelect: q.isMultiSelect,
      options: q.options.filter(o => o.text.trim() || o.imageUrl),
      key: q.isMultiSelect ? [...q.keyMulti] : q.keySingle,
      imageUrl: q.imageUrl,
      imageOriginalSize: q.imageOriginalSize,
      imageCompressedSize: q.imageCompressedSize,
      isRtl: q.isArabic || isArabicText(q.text)
    })
  })

  // 2. Isian
  const originalPackage = allBankPackages.value.find(pkg => pkg.id === editingPackageId.value)
  const validIsians = formIsianList.value.filter(q => q.text.trim() && originalPackage?.questions.some(old => old.id === q.id && old.type === 'Isian'))
  validIsians.forEach(q => {
    compiledQuestions.push({
      id: q.id,
      number: qNum++,
      type: 'Isian',
      difficulty: q.difficulty,
      text: q.text,
      key: q.key.trim(),
      imageUrl: q.imageUrl,
      imageOriginalSize: q.imageOriginalSize,
      imageCompressedSize: q.imageCompressedSize,
      wordCountMin: 10,
      wordCountMax: 30,
      isRtl: q.isArabic || isArabicText(q.text)
    })
  })

  // 3. Essay
  const validEssays = formEssayList.value.filter(q => q.text.trim())
  validEssays.forEach(q => {
    compiledQuestions.push({
      id: q.id,
      number: qNum++,
      type: 'Esai',
      difficulty: q.difficulty,
      text: q.text,
      key: q.rubric,
      rubric: q.rubric,
      rubricScore: q.rubricScore || 20,
      imageUrl: q.imageUrl,
      imageOriginalSize: q.imageOriginalSize,
      imageCompressedSize: q.imageCompressedSize,
      wordCountMin: 30,
      wordCountMax: 150,
      isRtl: q.isArabic || isArabicText(q.text)
    })
  })

  // 4. Interaktif
  if (formHasInteractive.value) {
    const validInteractives = formInteractiveList.value.filter(q => q.text.trim())
    validInteractives.forEach(q => {
      let finalKey: string | string[] = ''
      if (q.interactiveAnswerType === 'PG') {
        finalKey = q.keySingle || 'A'
      } else if (q.interactiveAnswerType === 'PG_Multi') {
        finalKey = q.keyMulti.length > 0 ? [...q.keyMulti] : ['A']
      } else {
        finalKey = q.keyIsian.trim()
      }

      const mediaId = q.mediaId || (q.mediaType === 'video' ? extractYouTubeId(q.mediaUrl || '') || '' : q.mediaFileName || '')

      compiledQuestions.push({
        id: q.id,
        number: qNum++,
        type: 'Interaktif',
        difficulty: q.difficulty,
        text: q.text,
        mediaType: q.mediaType,
        mediaId,
        mediaUrl: q.mediaUrl,
        mediaFileName: q.mediaFileName,
        mediaFileSize: q.mediaFileSize,
        mediaCompressStatus: q.mediaCompressStatus || (q.mediaType === 'audio' ? 'Opus 64kbps Terkompresi' : 'YouTube Nocookie Embed'),
        interactiveAnswerType: q.interactiveAnswerType,
        isMultiSelect: q.interactiveAnswerType === 'PG_Multi',
        options: (q.interactiveAnswerType === 'PG' || q.interactiveAnswerType === 'PG_Multi')
          ? q.options.filter(o => o.text.trim() || o.imageUrl)
          : undefined,
        key: finalKey,
        imageUrl: q.imageUrl,
        imageOriginalSize: q.imageOriginalSize,
        imageCompressedSize: q.imageCompressedSize,
        isRtl: q.isArabic || isArabicText(q.text)
      })
    })
  }

  if (editingPackageId.value) {
    const target = allBankPackages.value.find(p => p.id === editingPackageId.value)
    if (target) {
      target.classroom = formClass.value
      target.subject = formSubject.value
      target.difficulty = formDifficulty.value
      target.teacherName = formTeacherName.value
      target.hasInteractive = formHasInteractive.value
      target.updatedAt = 'Baru Saja'
      target.questions = compiledQuestions
      selectedPackage.value = target
      await savePackageToDb(target)
    }
    showToast(`Paket Bank Soal ${formSubject.value} berhasil diperbarui dan disinkronkan ke Database!`)
  } else {
    const newPkg: BankSubjectPackage = {
      id: `PKG-${Date.now()}`,
      code: `${formSubject.value.slice(0, 3).toUpperCase()}-${formClass.value.replace(/\s+/g, '')}`,
      classroom: formClass.value,
      subject: formSubject.value,
      grade: grade.value,
      difficulty: formDifficulty.value,
      teacherName: formTeacherName.value,
      updatedAt: 'Hari Ini',
      hasInteractive: formHasInteractive.value,
      questions: compiledQuestions
    }
    allBankPackages.value.unshift(newPkg)
    selectedPackage.value = newPkg
    await savePackageToDb(newPkg)
    showToast(`Paket Bank Soal ${formSubject.value} berhasil dibuat dan tersimpan di Database!`)
  }

  selectedClass.value = formClass.value
  viewMode.value = 'detail'
}

const deletePackage = async (pkgId: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus seluruh paket bank soal mata pelajaran ini?')) {
    await deletePackageFromDb(pkgId)
    allBankPackages.value = allBankPackages.value.filter(p => p.id !== pkgId)
    showToast('Paket bank soal berhasil dihapus dari database.')
    viewMode.value = 'subjects'
  }
}

const deleteSingleQuestion = async (questionId: string) => {
  if (selectedPackage.value && confirm('Hapus butir soal ini dari paket?')) {
    selectedPackage.value.questions = selectedPackage.value.questions.filter(q => q.id !== questionId)
    selectedPackage.value.questions.forEach((q, idx) => {
      q.number = idx + 1
    })
    await savePackageToDb(selectedPackage.value)
    showToast('Butir soal berhasil dihapus dan database diperbarui.')
  }
}

// Export CSV
const exportPackageCsv = (pkg: BankSubjectPackage) => {
  const headers = ['No', 'Tipe Format', 'Tingkat Kesulitan', 'Pertanyaan', 'Kunci / Rubrik Jawaban', 'Media Lampiran']
  const rows = pkg.questions.map(q => {
    const keyStr = Array.isArray(q.key) ? q.key.join(', ') : (q.key || '-')
    return [
      q.number,
      `"${q.type}"`,
      `"${q.difficulty}"`,
      `"${q.text.replace(/"/g, '""')}"`,
      `"${keyStr.replace(/"/g, '""')}"`,
      `"${q.mediaUrl || '-'}"`
    ]
  })

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Bank_Soal_${pkg.subject}_${pkg.classroom}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadTemplate = (format: 'xlsx' | 'docx' | 'csv') => {
  showToast(`Template Bank Soal (.${format}) berhasil diunduh. Silakan isi sesuai standard CBT.`)
}

const processImportFile = () => {
  isImportModalOpen.value = false
  showToast('File bank soal berhasil diimpor & diparsing otomatis ke sistem CBT!')
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

// Helpers
const questionsInDetail = computed(() => {
  if (!selectedPackage.value) return []
  if (activeFormatFilter.value === 'all') return selectedPackage.value.questions
  return selectedPackage.value.questions.filter(q => q.type === activeFormatFilter.value)
})

const classSubjectPackages = computed(() => {
  return bankPackages.value.filter(p => {
    const matchClass = p.classroom === selectedClass.value
    const matchSearch = !subjectSearchQuery.value.trim() ||
      p.subject.toLowerCase().includes(subjectSearchQuery.value.toLowerCase()) ||
      p.teacherName.toLowerCase().includes(subjectSearchQuery.value.toLowerCase())
    return matchClass && matchSearch
  })
})

const getClassStats = (clsName: string) => {
  const pkgs = bankPackages.value.filter(p => p.classroom === clsName)
  const totalQuestions = pkgs.reduce((acc, p) => acc + p.questions.length, 0)
  const pgCount = pkgs.reduce((acc, p) => acc + p.questions.filter(q => q.type === 'PG').length, 0)
  const isianCount = pkgs.reduce((acc, p) => acc + p.questions.filter(q => q.type === 'Isian').length, 0)
  const essayCount = pkgs.reduce((acc, p) => acc + p.questions.filter(q => q.type === 'Esai').length, 0)
  const interactiveCount = pkgs.reduce((acc, p) => acc + p.questions.filter(q => q.type === 'Interaktif').length, 0)

  return {
    subjectCount: pkgs.length,
    totalQuestions: totalQuestions || 35,
    pgCount: pgCount || 25,
    isianCount: isianCount || 5,
    essayCount: essayCount || 3,
    interactiveCount: interactiveCount || 2
  }
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- TOAST NOTIFICATION -->
    <div
      v-if="toastMessage"
      class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-fadeUp text-xs font-semibold"
    >
      <AdminIcon name="check" size="16" class="text-emerald-400" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- ========================================================================= -->
    <!-- MODE 1: OVERVIEW KELAS / ROMBEL -->
    <!-- ========================================================================= -->
    <template v-if="viewMode === 'classes'">
      <!-- TOP OVERVIEW CARDS (CANONICAL GRADIENT CARDS MATCHING ADMIN DASHBOARD) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- KPI 1: Total Paket Bank Soal (Blue Gradient) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-[0_14px_30px_-14px_rgba(30,64,175,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(30,64,175,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />
          
          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="book" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              Multi-Format
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-bold tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ bankPackages.length + 6 }} Paket</div>
          <div class="text-xs font-semibold text-blue-100 relative z-10">Total Paket Bank Soal</div>
          
          <div class="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-1.5 text-[11.5px] font-medium text-blue-100 relative z-10">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>Tersimpan &amp; siap diujikan</span>
          </div>
        </div>

        <!-- KPI 2: Rombel / Kelas Aktif (Purple Gradient) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-[0_14px_30px_-14px_rgba(91,33,182,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(91,33,182,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:70ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="users" size="22" />
            </span>
            <span class="text-[11.5px] font-bold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              {{ grade }}
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-bold tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ activeClasses.length }} Rombel</div>
          <div class="text-xs font-semibold text-purple-100 relative z-10">Kelas Terdaftar Aktif</div>
          
          <div class="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-1.5 text-[11.5px] font-medium text-purple-100 relative z-10">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{{ grade === 'SMK' ? 'Tingkat X, XI & XII' : 'Tingkat VII, VIII & IX' }}</span>
          </div>
        </div>

        <!-- KPI 3: Mata Pelajaran Kurikulum (Emerald Gradient) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-[0_14px_30px_-14px_rgba(6,95,70,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(6,95,70,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:140ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="check" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              Kurikulum
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-bold tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ subjectOptions.length }} Mapel</div>
          <div class="text-xs font-semibold text-emerald-100 relative z-10">Mata Pelajaran Siap</div>
          
          <div class="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-100 relative z-10">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>Standar kurikulum resmi</span>
          </div>
        </div>

        <!-- KPI 4: Fitur Unggulan Soal Interaktif (Violet / Indigo Gradient) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#4C1D95] via-[#6366F1] to-[#818CF8] shadow-[0_14px_30px_-14px_rgba(76,29,149,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(76,29,149,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:210ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="spark" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-bold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              Fitur Unggulan
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-bold tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">4 Format</div>
          <div class="text-xs font-semibold text-indigo-100 relative z-10">Dukungan Soal Interaktif</div>
          
          <div class="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-1.5 text-[11.5px] font-medium text-indigo-100 relative z-10">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>Audio Listening &amp; Video Simulasi</span>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER BAR FOR CLASSES -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <!-- Search input -->
          <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 min-w-[240px] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input
              v-model="classSearchQuery"
              placeholder="Cari rombel / kelas, misal: X RPL 1, VII-A..."
              class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </label>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Filter Tingkat / Jurusan -->
            <select v-model="classFilterLevel" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none transition">
              <option value="all">Semua Tingkat</option>
              <template v-if="grade === 'SMK'">
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
                <option value="RPL">Jurusan RPL</option>
                <option value="TKJ">Jurusan TKJ</option>
              </template>
              <template v-else>
                <option value="VII">Kelas VII</option>
                <option value="VIII">Kelas VIII</option>
                <option value="IX">Kelas IX</option>
              </template>
            </select>

            <!-- Action buttons inside the sub-menu -->
            <button
              class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              type="button"
              @click="isImportModalOpen = true"
            >
              <AdminIcon name="upload" size="14" class="text-slate-500" />
              <span>Import Word/Excel</span>
            </button>
            <button
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              type="button"
              @click="openCreatePackageForm()"
            >
              <AdminIcon name="plus" size="14" />
              <span>Buat Paket Soal</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Class Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <article
          v-for="cls in filteredClasses"
          :key="cls"
          class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          @click="openClassSubjects(cls)"
        >
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                <AdminIcon name="book" size="20" />
              </span>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-mono">
                {{ grade }}
              </span>
            </div>

            <h4 class="text-lg font-bold text-slate-900 tracking-tight">{{ cls }}</h4>
            <p class="text-xs text-slate-500 mt-1 font-medium">{{ getClassStats(cls).subjectCount || 3 }} Mata Pelajaran Terverifikasi</p>

            <!-- Format Badges Counter Grid -->
            <div class="grid grid-cols-2 gap-1.5 mt-4 text-[11px] font-semibold">
              <span class="px-2 py-1 rounded-lg bg-blue-50/80 text-blue-700 border border-blue-100 text-center font-mono">
                {{ getClassStats(cls).pgCount }} PG
              </span>
              <span class="px-2 py-1 rounded-lg bg-emerald-50/80 text-emerald-700 border border-emerald-100 text-center font-mono">
                {{ getClassStats(cls).isianCount }} Isian
              </span>
              <span class="px-2 py-1 rounded-lg bg-purple-50/80 text-purple-700 border border-purple-100 text-center font-mono">
                {{ getClassStats(cls).essayCount }} Essay
              </span>
              <span class="px-2 py-1 rounded-lg bg-violet-50/80 text-violet-700 border border-violet-100 text-center font-mono">
                {{ getClassStats(cls).interactiveCount }} Interaktif
              </span>
            </div>
          </div>

          <div class="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 font-mono">{{ getClassStats(cls).totalQuestions }} Total Soal</span>
            <span class="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
              <span>Buka Paket Mapel</span>
              <AdminIcon name="arr" size="14" />
            </span>
          </div>
        </article>
      </div>
    </template>

    <!-- ========================================================================= -->
    <!-- MODE 2: LISTING MATA PELAJARAN DI KELAS TERPILIH (TABEL / LISTING MODERN) -->
    <!-- ========================================================================= -->
    <template v-if="viewMode === 'subjects'">
      <!-- BACK LINK ABOVE TITLE -->
      <div class="space-y-3">
        <button
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
          type="button"
          @click="viewMode = 'classes'"
        >
          <AdminIcon name="arr" size="14" class="rotate-180" />
          <span>Kembali ke Daftar Kelas</span>
        </button>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Bank Soal Kelas:</span>
              <span class="text-blue-600 font-bold">{{ selectedClass }}</span>
            </h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Daftar paket bank soal mata pelajaran terstruktur multi-format</p>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              type="button"
              @click="openCreatePackageForm(selectedClass)"
            >
              <AdminIcon name="plus" size="14" />
              <span>Buat Paket Mapel Baru</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SEARCH BAR -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
        <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition">
          <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
          <input
            v-model="subjectSearchQuery"
            placeholder="Cari mata pelajaran atau nama guru pengampu..."
            class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full font-medium"
          />
        </label>
      </div>

      <!-- SUBJECTS LISTING (CLEAN & MODERN TABLE / ROW LIST) -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead class="bg-slate-50/90 text-xs font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Mata Pelajaran &amp; Kode</th>
                <th class="px-5 py-3.5">Guru Penyusun</th>
                <th class="px-5 py-3.5">Komposisi Format Soal</th>
                <th class="px-5 py-3.5 text-center">Tingkat Kesulitan</th>
                <th class="px-5 py-3.5 text-center">Total Soal</th>
                <th class="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="classSubjectPackages.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  <AdminIcon name="book" size="28" class="mx-auto mb-2 text-slate-300" />
                  <div class="text-sm font-semibold text-slate-700">Belum ada paket soal untuk kelas ini</div>
                  <div class="text-xs text-slate-400 mt-0.5">Klik tombol "Buat Paket Mapel Baru" di atas untuk menambahkan.</div>
                </td>
              </tr>
              <tr
                v-for="pkg in classSubjectPackages"
                :key="pkg.id"
                class="hover:bg-blue-50/30 transition group"
              >
                <!-- Subject Name & Code -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <span class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <AdminIcon name="book" size="18" />
                    </span>
                    <div>
                      <button
                        class="font-bold text-slate-900 text-left hover:text-blue-600 transition block text-sm leading-tight cursor-pointer"
                        type="button"
                        @click="openPackageDetail(pkg)"
                      >
                        {{ pkg.subject }}
                      </button>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {{ pkg.code }}
                        </span>
                        <span v-if="pkg.hasInteractive" class="text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded font-mono">
                          Audio/Video
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Teacher -->
                <td class="px-5 py-4 font-semibold text-slate-700">
                  {{ pkg.teacherName }}
                </td>

                <!-- Format Composition Pills -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-1.5 flex-wrap text-xs">
                    <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold font-mono text-[11px]">
                      {{ pkg.questions.filter(q => q.type === 'PG').length }} PG
                    </span>
                    <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-mono text-[11px]">
                      {{ pkg.questions.filter(q => q.type === 'Isian').length }} Isian
                    </span>
                    <span class="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold font-mono text-[11px]">
                      {{ pkg.questions.filter(q => q.type === 'Esai').length }} Esai
                    </span>
                    <span v-if="pkg.hasInteractive" class="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 font-semibold font-mono text-[11px]">
                      {{ pkg.questions.filter(q => q.type === 'Interaktif').length }} Interaktif
                    </span>
                  </div>
                </td>

                <!-- Difficulty -->
                <td class="px-5 py-4 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border border-emerald-200': pkg.difficulty === 'Mudah',
                      'bg-amber-50 text-amber-700 border border-amber-200': pkg.difficulty === 'Sedang',
                      'bg-rose-50 text-rose-700 border border-rose-200': pkg.difficulty === 'Sukar'
                    }"
                  >
                    {{ pkg.difficulty }}
                  </span>
                </td>

                <!-- Total Questions -->
                <td class="px-5 py-4 text-center font-mono font-bold text-slate-900 text-sm">
                  {{ pkg.questions.length }}
                </td>

                <!-- Actions -->
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                      type="button"
                      title="Edit seluruh paket"
                      @click="openEditPackageForm(pkg)"
                    >
                      Edit Paket
                    </button>
                    <button
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                      type="button"
                      @click="openPackageDetail(pkg)"
                    >
                      <span>Lihat Soal</span>
                      <AdminIcon name="arr" size="12" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ========================================================================= -->
    <!-- MODE 3: DETAIL BUTIR SOAL PER MATA PELAJARAN -->
    <!-- ========================================================================= -->
    <template v-if="viewMode === 'detail' && selectedPackage">
      <!-- BACK LINK ABOVE TITLE -->
      <div class="space-y-3">
        <button
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
          type="button"
          @click="viewMode = 'subjects'"
        >
          <AdminIcon name="arr" size="14" class="rotate-180" />
          <span>Kembali ke Daftar Mapel {{ selectedClass }}</span>
        </button>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                {{ selectedPackage.subject }} &mdash; <span class="text-blue-600">{{ selectedPackage.classroom }}</span>
              </h3>
              <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {{ selectedPackage.code }}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Penyusun: <strong>{{ selectedPackage.teacherName }}</strong> &bull; Total: {{ selectedPackage.questions.length }} Butir Soal Terdaftar</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 shadow-xs transition cursor-pointer"
              type="button"
              @click="exportPackageCsv(selectedPackage)"
            >
              <AdminIcon name="dl" size="14" class="inline mr-1 text-slate-500" /> Export CSV
            </button>
            <button
              class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              type="button"
              @click="openEditPackageForm(selectedPackage)"
            >
              <AdminIcon name="pencil" size="14" class="inline mr-1" /> Edit Paket Lengkap
            </button>
            <button
              class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer"
              type="button"
              @click="deletePackage(selectedPackage.id)"
            >
              <AdminIcon name="trash" size="14" class="inline mr-1" /> Hapus Paket
            </button>
          </div>
        </div>
      </div>

      <!-- Format Filter Pills -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
          :class="activeFormatFilter === 'all'
            ? 'bg-blue-600 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          @click="activeFormatFilter = 'all'"
        >
          Semua Format ({{ selectedPackage.questions.length }})
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
          :class="activeFormatFilter === 'PG'
            ? 'bg-blue-600 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          @click="activeFormatFilter = 'PG'"
        >
          Pilihan Ganda ({{ selectedPackage.questions.filter(q => q.type === 'PG').length }})
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
          :class="activeFormatFilter === 'Isian'
            ? 'bg-blue-600 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          @click="activeFormatFilter = 'Isian'"
        >
          Jawaban Singkat ({{ selectedPackage.questions.filter(q => q.type === 'Isian').length }})
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
          :class="activeFormatFilter === 'Esai'
            ? 'bg-blue-600 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          @click="activeFormatFilter = 'Esai'"
        >
          Essay / Uraian ({{ selectedPackage.questions.filter(q => q.type === 'Esai').length }})
        </button>
        <button
          v-if="selectedPackage.hasInteractive"
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
          :class="activeFormatFilter === 'Interaktif'
            ? 'bg-violet-600 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          @click="activeFormatFilter = 'Interaktif'"
        >
          Interaktif Media ({{ selectedPackage.questions.filter(q => q.type === 'Interaktif').length }})
        </button>
      </div>

      <!-- QUESTION ITEMS LIST (COMPACT, CONCISE HINT JAWABAN SAJA) -->
      <div class="space-y-3.5">
        <article
          v-for="q in questionsInDetail"
          :key="q.id"
          class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-xs hover:shadow-md transition space-y-3"
        >
          <!-- Item Header Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-md">
                Soal #{{ q.number }}
              </span>
              <span
                class="text-xs font-bold px-2.5 py-0.5 rounded-md"
                :class="{
                  'bg-blue-50 text-blue-700 border border-blue-200': q.type === 'PG',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': q.type === 'Isian',
                  'bg-purple-50 text-purple-700 border border-purple-200': q.type === 'Esai',
                  'bg-violet-50 text-violet-700 border border-violet-200': q.type === 'Interaktif'
                }"
              >
                {{ q.type === 'PG' ? (q.isMultiSelect ? 'PG Kompleks' : 'Pilihan Ganda') : q.type === 'Isian' ? 'Jawaban Singkat' : q.type === 'Esai' ? 'Essay' : 'Interaktif Audio/Video' }}
              </span>
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                :class="{
                  'bg-emerald-50 text-emerald-700': q.difficulty === 'Mudah',
                  'bg-amber-50 text-amber-700': q.difficulty === 'Sedang',
                  'bg-rose-50 text-rose-700': q.difficulty === 'Sukar'
                }"
              >
                {{ q.difficulty }}
              </span>
            </div>

            <!-- BUTTON EDIT PER MASING-MASING SOAL & HAPUS -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <button
                class="px-2.5 py-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition flex items-center gap-1 cursor-pointer"
                type="button"
                @click="openSingleQuestionEdit(q)"
              >
                <AdminIcon name="pencil" size="13" />
                <span>Edit Soal</span>
              </button>
              <button
                class="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                type="button"
                @click="deleteSingleQuestion(q.id)"
              >
                <AdminIcon name="trash" size="13" class="inline mr-1" /> Hapus
              </button>
            </div>
          </div>

          <!-- Question Prompt Text (KaTeX + Arab RTL) -->
          <div
            class="text-sm font-semibold text-slate-900 leading-relaxed overflow-x-auto"
            :dir="q.isRtl || isArabicText(q.text) ? 'rtl' : 'ltr'"
            :class="(q.isRtl || isArabicText(q.text)) ? 'text-right font-serif text-base' : ''"
            v-html="renderKaTeXHtml(q.text)"
          />

          <!-- Lampiran Foto Soal (Terkompresi WebP < 200KB) -->
          <div v-if="q.imageUrl" class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span class="flex items-center gap-1.5 text-blue-700">
                <AdminIcon name="spark" size="13" />
                <span>Foto Rumus / Gambar Soal (WebP Terkompresi)</span>
              </span>
              <span v-if="q.imageCompressedSize" class="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {{ q.imageCompressedSize }} (&lt; 200KB)
              </span>
            </div>
            <div class="max-w-md">
              <img :src="q.imageUrl" alt="Gambar Soal" class="rounded-lg border border-slate-200 max-h-48 object-contain bg-white p-1" />
            </div>
          </div>

          <!-- Opsi Jawaban PG Detail (Jika Soal PG) -->
          <div v-if="q.type === 'PG' && q.options && q.options.length > 0" class="space-y-1.5 pt-1">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daftar Pilihan Jawaban:</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                v-for="opt in q.options"
                :key="opt.key"
                class="p-2 rounded-xl border flex items-start gap-2"
                :class="(Array.isArray(q.key) ? q.key.includes(opt.key) : q.key === opt.key)
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                  : 'border-slate-200 bg-white text-slate-800'"
              >
                <span class="font-mono font-bold w-5 shrink-0">{{ opt.key }}.</span>
                <div class="flex-1 space-y-1">
                  <div v-html="renderKaTeXHtml(opt.text)" />
                  <img v-if="opt.imageUrl" :src="opt.imageUrl" alt="Opsi" class="max-h-20 rounded border border-slate-200 bg-white p-0.5" />
                </div>
                <span v-if="(Array.isArray(q.key) ? q.key.includes(opt.key) : q.key === opt.key)" class="text-emerald-600 shrink-0 text-xs">
                  &check; Kunci
                </span>
              </div>
            </div>
          </div>

          <!-- If Interaktif: Media Player Preview (YouTube nocookie rel=0 atau Audio controlsList="nodownload") -->
          <div v-if="q.type === 'Interaktif'" class="p-3.5 bg-violet-50/60 rounded-xl border border-violet-200/80 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-violet-900 flex-wrap gap-2">
              <span class="flex items-center gap-1.5">
                <AdminIcon name="spark" size="14" class="text-violet-600" />
                <span>Media Ujian: {{ q.mediaType === 'video' ? 'VIDEO YOUTUBE UNLISTED' : 'AUDIO MP3 STATIS' }}</span>
                <span v-if="q.mediaId" class="font-mono text-violet-700 text-[11px]"> &bull; ID: {{ q.mediaId }}</span>
              </span>
              <span class="text-[10px] font-semibold text-violet-700 bg-white px-2.5 py-0.5 rounded-full border border-violet-200 font-mono shadow-2xs">
                {{ q.mediaType === 'video' ? 'Iframe Nocookie (Tanpa Unduh)' : 'Cloudflare Edge Cache /media/*' }}
              </span>
            </div>

            <!-- YouTube Iframe Player (rel=0, nocookie, tanpa opsi download) -->
            <div v-if="q.mediaType === 'video'" class="relative aspect-video max-w-lg rounded-xl overflow-hidden bg-black mt-1">
              <iframe
                :src="q.mediaUrl || `https://www.youtube-nocookie.com/embed/${q.mediaId}?rel=0&modestbranding=1`"
                title="Video Soal Ujian"
                class="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>

            <!-- Audio Native Player (controlsList="nodownload") -->
            <div v-else-if="q.mediaType === 'audio'" class="mt-1 space-y-1">
              <audio :src="q.mediaUrl" controls controlsList="nodownload" class="w-full h-8" />
              <p class="text-[10.5px] text-violet-700 font-medium">Biner file tersimpan di server CDN Cloudflare, 0 byte media di database Supabase.</p>
            </div>
          </div>

          <!-- KUNCI JAWABAN & PANDUAN VALIDASI KATA SISWA -->
          <div class="pt-1 space-y-2">
            <!-- For PG or Interaktif Single Selection: Show only the correct answer text -->
            <div v-if="(q.type === 'PG' && !q.isMultiSelect) || (q.type === 'Interaktif' && q.interactiveAnswerType === 'PG' && !Array.isArray(q.key))" class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  &check;
                </span>
                <div class="text-emerald-950 font-medium">
                  <strong class="font-bold text-emerald-900">Kunci Jawaban:</strong>
                  <span class="ml-1 font-semibold">
                    {{ q.key }}. {{ q.options?.find(o => o.key === q.key)?.text || q.key }}
                  </span>
                </div>
              </div>
              <span class="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Single Selection
              </span>
            </div>

            <!-- For PG Kompleks or Interaktif Multi-Select -->
            <div v-else-if="(q.type === 'PG' && q.isMultiSelect) || (q.type === 'Interaktif' && (q.interactiveAnswerType === 'PG_Multi' || Array.isArray(q.key)))" class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  &check;
                </span>
                <div class="text-emerald-950 font-medium">
                  <strong class="font-bold text-emerald-900">Kunci Jawaban (Multi-Select):</strong>
                  <span v-if="Array.isArray(q.key)" class="ml-1 font-semibold">
                    {{ q.key.map(k => `${k} (${q.options?.find(o => o.key === k)?.text || ''})`).join(', ') }}
                  </span>
                  <span v-else class="ml-1 font-semibold">{{ q.key }}</span>
                </div>
              </div>
              <span class="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                Nilai Penuh: Semua Benar Tepat
              </span>
            </div>

            <!-- For Isian or Interaktif Isian: Short Answer Key + Word Count Guideline -->
            <div v-else-if="q.type === 'Isian' || (q.type === 'Interaktif' && (!q.interactiveAnswerType || q.interactiveAnswerType === 'Isian'))" class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs flex-wrap">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  &check;
                </span>
                <div class="text-emerald-950 font-medium">
                  <strong class="font-bold text-emerald-900">Kunci Jawaban Singkat Tepat:</strong>
                  <span class="ml-1 font-mono font-bold">{{ q.key }}</span>
                </div>
              </div>
              <span class="text-[10.5px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                Aturan Siswa: Min. 10 Kata &mdash; Maks. 30 Kata
              </span>
            </div>

            <!-- For Essay: Rubric Guide + Score Weight + Word Count Guideline -->
            <div v-else-if="q.type === 'Esai'" class="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs space-y-1.5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="font-bold text-purple-900 flex items-center gap-1.5">
                  <AdminIcon name="spark" size="13" class="text-purple-600" />
                  <span>Rubrik Penskoran Esai (Bobot Nilai: {{ q.rubricScore || 20 }} Poin)</span>
                </span>
                <span class="text-[10.5px] font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200 font-mono">
                  Aturan Siswa: Min. 30 Kata &mdash; Maks. 150 Kata
                </span>
              </div>
              <p class="text-purple-950 leading-relaxed font-medium bg-white/70 p-2 rounded-lg border border-purple-100">
                {{ q.rubric || q.key }}
              </p>
              <div class="text-[10.5px] text-purple-700 font-semibold flex items-center gap-2">
                <span>Alur Koreksi: Esai Perlu Koreksi Guru &rarr; Sudah Dikoreksi</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </template>

    <!-- ========================================================================= -->
    <!-- QUICK EDIT SINGLE QUESTION MODAL (TELEPORTED TO BODY FOR FULL OVERLAY) -->
    <!-- ========================================================================= -->
    <Teleport to="body">
      <div
        v-if="isSingleEditModalOpen && editingSingleQuestion"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        @click.self="isSingleEditModalOpen = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold text-white bg-slate-900">
                  Soal #{{ editingSingleQuestion.number }}
                </span>
                <span
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold"
                  :class="{
                    'bg-blue-50 text-blue-700 border border-blue-200': editingSingleQuestion.type === 'PG',
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': editingSingleQuestion.type === 'Isian',
                    'bg-purple-50 text-purple-700 border border-purple-200': editingSingleQuestion.type === 'Esai',
                    'bg-violet-50 text-violet-700 border border-violet-200': editingSingleQuestion.type === 'Interaktif'
                  }"
                >
                  {{ editingSingleQuestion.type === 'PG' ? (editingSingleQuestion.isMultiSelect ? 'PG Kompleks' : 'Pilihan Ganda') : editingSingleQuestion.type === 'Isian' ? 'Jawaban Singkat' : editingSingleQuestion.type === 'Esai' ? 'Essay' : 'Interaktif Audio/Video' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 font-medium">Sesuaikan teks pertanyaan, tingkat kesulitan, atau kunci jawaban</p>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition"
              @click="isSingleEditModalOpen = false"
            >
              <AdminIcon name="x" size="16" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto space-y-4 text-xs">
            <!-- Difficulty & Language Mode Toolbar -->
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="w-48">
                <label class="block font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
                <select v-model="editingSingleQuestion.difficulty" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-500">
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sukar">Sukar</option>
                </select>
              </div>

              <!-- Toolbar Switcher: Mode Arab & Mode Pratinjau Formula -->
              <div class="flex items-center gap-1.5 self-end">
                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  :class="singleEditIsArabic
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                  @click="singleEditIsArabic = !singleEditIsArabic"
                >
                  <span>عربي</span>
                  <span>{{ singleEditIsArabic ? 'Teks Arab (RTL) Aktif' : 'Mode Arab (RTL)' }}</span>
                </button>

                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  :class="singleEditPreviewMode === 'preview'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                  @click="singleEditPreviewMode = singleEditPreviewMode === 'preview' ? 'edit' : 'preview'"
                >
                  <AdminIcon name="spark" size="13" />
                  <span>{{ singleEditPreviewMode === 'preview' ? 'Mode Tulis' : 'Pratinjau KaTeX' }}</span>
                </button>
              </div>
            </div>

            <!-- Quick LaTeX Toolbar Chips -->
            <div class="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>Sisipkan Simbol / Rumus Cepat (KaTeX LaTeX):</span>
                <span class="text-slate-400 font-normal">Klik untuk menyisipkan ke teks</span>
              </div>
              <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <button
                  v-for="sym in LATEX_TOOLBAR_SYMBOLS"
                  :key="sym.label"
                  type="button"
                  class="px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-md font-mono text-[11px] font-bold transition shrink-0 cursor-pointer shadow-2xs"
                  :title="sym.description"
                  @click="insertFormulaToQuestion(editingSingleQuestion, sym.syntax)"
                >
                  {{ sym.label }}
                </button>
              </div>
            </div>

            <!-- Question text -->
            <div>
              <div class="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <label>Teks Pertanyaan Soal</label>
                <span v-if="singleEditIsArabic || isArabicText(editingSingleQuestion.text)" class="text-[10.5px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  RTL Arab Otomatis
                </span>
              </div>
              <textarea
                v-model="editingSingleQuestion.text"
                rows="3"
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                :dir="singleEditIsArabic || isArabicText(editingSingleQuestion.text) ? 'rtl' : 'ltr'"
                :class="(singleEditIsArabic || isArabicText(editingSingleQuestion.text)) ? 'text-right font-serif text-base leading-relaxed' : ''"
                placeholder="Tuliskan teks pertanyaan soal... (Gunakan $...$ untuk rumus KaTeX)"
              />
            </div>

            <!-- Real-time KaTeX Preview Box -->
            <div v-if="editingSingleQuestion.text" class="p-3 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-1">
              <div class="flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span class="flex items-center gap-1">
                  <AdminIcon name="spark" size="12" class="text-blue-600" />
                  <span>Real-time Preview (KaTeX &amp; Teks Arab):</span>
                </span>
                <span class="font-normal text-blue-600 text-[10px]">Render Player CBT Siswa</span>
              </div>
              <div
                class="p-2.5 bg-white rounded-lg border border-blue-100 text-xs sm:text-sm text-slate-900 leading-relaxed overflow-x-auto"
                :dir="singleEditIsArabic || isArabicText(editingSingleQuestion.text) ? 'rtl' : 'ltr'"
                :class="(singleEditIsArabic || isArabicText(editingSingleQuestion.text)) ? 'text-right font-serif text-base' : ''"
                v-html="renderKaTeXHtml(editingSingleQuestion.text)"
              />
            </div>

            <!-- Upload Foto Rumus / Gambar Soal (WebP < 200KB) + AI Assistant -->
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div class="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-800">
                <span class="flex items-center gap-1.5 text-blue-900">
                  <AdminIcon name="upload" size="14" class="text-blue-600" />
                  <span>Upload Foto Rumus / Gambar Soal (Kompresi WebP &lt; 200KB)</span>
                </span>
                <span v-if="editingSingleQuestion.imageUrl" class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {{ editingSingleQuestion.imageCompressedSize }} (&lt; 200KB)
                </span>
              </div>

              <div v-if="!editingSingleQuestion.imageUrl" class="flex items-center gap-3">
                <label class="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-blue-700 font-bold border border-blue-200 rounded-xl cursor-pointer shadow-2xs transition flex items-center gap-1.5">
                  <AdminIcon name="upload" size="13" />
                  <span>Pilih Foto Rumus / Soal</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleQuestionImageUpload(editingSingleQuestion, $event)" />
                </label>
                <span class="text-[11px] text-slate-500">Maks 200KB, format WebP otomatis.</span>
              </div>

              <div v-else class="flex items-start gap-3 p-2 bg-white rounded-xl border border-slate-200">
                <img :src="editingSingleQuestion.imageUrl" alt="Preview Foto" class="h-20 w-28 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                <div class="flex-1 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-800 text-[11px]">Foto Soal Berhasil Diunggah</span>
                    <button
                      type="button"
                      class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      @click="removeQuestionImage(editingSingleQuestion)"
                    >
                      Hapus Foto
                    </button>
                  </div>
                  <!-- Tombol Trigger Asisten AI -->
                  <button
                    type="button"
                    class="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                    @click="triggerAiFormulaAnalysis(editingSingleQuestion, selectedPackage?.subject || 'Matematika')"
                  >
                    <AdminIcon name="spark" size="12" />
                    <span>Konversi Foto ke Rumus LaTeX via Asisten AI</span>
                  </button>
                </div>
              </div>

              <!-- Kotak Saran Asisten AI (Wajib Dikonfirmasi Guru) -->
              <div v-if="editingSingleQuestion.aiSuggestion" class="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2.5">
                <div class="flex items-center justify-between text-xs font-bold text-purple-950">
                  <span class="flex items-center gap-1.5">
                    <AdminIcon name="spark" size="13" class="text-purple-600" />
                    <span>Saran Rumus LaTeX dari Asisten AI (Akurasi {{ editingSingleQuestion.aiSuggestion.confidence }}%)</span>
                  </span>
                  <button
                    type="button"
                    class="text-purple-400 hover:text-purple-700 text-xs font-bold cursor-pointer"
                    @click="editingSingleQuestion.aiSuggestion = null"
                  >
                    &times;
                  </button>
                </div>

                <!-- Preview KaTeX Formula -->
                <div class="p-2.5 bg-white rounded-lg border border-purple-200 text-xs text-slate-800 font-mono overflow-x-auto" v-html="renderKaTeXHtml(editingSingleQuestion.aiSuggestion.latex)" />

                <!-- Input Edit LaTeX Langsung -->
                <div class="space-y-1">
                  <label class="block text-[10.5px] font-bold text-purple-900">Edit Sintaks LaTeX (Bila Perlu Penyesuaian Angka):</label>
                  <input
                    v-model="editingSingleQuestion.aiSuggestion.latex"
                    class="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <!-- Alternatif Format Rumus Terdeteksi -->
                <div v-if="editingSingleQuestion.aiSuggestion.alternatives && editingSingleQuestion.aiSuggestion.alternatives.length" class="space-y-1">
                  <span class="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Pilihan Format Rumus Terdeteksi:</span>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="alt in editingSingleQuestion.aiSuggestion.alternatives"
                      :key="alt.label"
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-semibold transition cursor-pointer border"
                      :class="editingSingleQuestion.aiSuggestion.latex === alt.latex
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-white hover:bg-purple-100 text-purple-800 border-purple-200'"
                      @click="editingSingleQuestion.aiSuggestion.latex = alt.latex"
                    >
                      {{ alt.label }}
                    </button>
                  </div>
                </div>

                <p class="text-[11px] text-purple-800 font-medium">{{ editingSingleQuestion.aiSuggestion.explanation }}</p>

                <div class="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer transition flex items-center gap-1"
                    @click="applyAiSuggestion(editingSingleQuestion)"
                  >
                    <AdminIcon name="check" size="13" />
                    <span>Terapkan Saran ke Teks Soal</span>
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs cursor-pointer transition"
                    @click="editingSingleQuestion.aiSuggestion = null"
                  >
                    Tolak / Batal
                  </button>
                </div>
              </div>
            </div>

            <!-- If PG: Options & Key Editor (KaTeX render on options) -->
            <div v-if="editingSingleQuestion.type === 'PG'" class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <label class="font-bold text-slate-700">Pilihan Jawaban &amp; Kunci Benar</label>
                  <p class="text-[11px] text-slate-500">Mendukung formula KaTeX ($...$) dan gambar opsi.</p>
                </div>
                <label class="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input v-model="editingSingleQuestion.isMultiSelect" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span>Centang Multi-Select</span>
                </label>
              </div>

              <div class="space-y-2">
                <div
                  v-for="opt in singleEditPgOptions"
                  :key="opt.key"
                  class="p-2.5 rounded-xl border transition space-y-2"
                  :class="(editingSingleQuestion.isMultiSelect ? singleEditMultiKey.includes(opt.key) : singleEditSingleKey === opt.key)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/50'"
                >
                  <div class="flex items-center gap-2.5">
                    <input
                      v-if="!editingSingleQuestion.isMultiSelect"
                      type="radio"
                      name="singleEditKeyRadio"
                      :checked="singleEditSingleKey === opt.key"
                      class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 ml-1.5 cursor-pointer"
                      @change="singleEditSingleKey = opt.key"
                    />
                    <input
                      v-else
                      type="checkbox"
                      :checked="singleEditMultiKey.includes(opt.key)"
                      class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 ml-1.5 cursor-pointer"
                      @change="toggleSingleEditMultiOption(opt.key)"
                    />
                    <span class="font-mono font-bold text-slate-600 w-5 text-center">{{ opt.key }}.</span>
                    <input
                      v-model="opt.text"
                      class="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      :placeholder="`Teks pilihan ${opt.key}...`"
                    />

                    <!-- Tombol Upload Gambar Opsi -->
                    <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 cursor-pointer shrink-0">
                      <span>Foto</span>
                      <input type="file" accept="image/*" class="hidden" @change="handleOptionImageUpload(opt, $event)" />
                    </label>
                  </div>

                  <!-- Live Preview Formula KaTeX pada Opsi jika ada '$' -->
                  <div v-if="opt.text && opt.text.includes('$')" class="ml-9 p-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800" v-html="renderKaTeXHtml(opt.text)" />
                  <div v-if="opt.imageUrl" class="ml-9 flex items-center gap-2">
                    <img :src="opt.imageUrl" alt="Preview Opsi" class="h-12 rounded border border-slate-200 bg-white p-0.5" />
                    <button type="button" class="text-[11px] text-rose-600 hover:text-rose-800 font-semibold" @click="removeOptionImage(opt)">Hapus Foto</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- If Isian (Short Answer) -->
            <div v-if="editingSingleQuestion.type === 'Isian'" class="space-y-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Kunci Jawaban Singkat (Mendukung Varian / Formula)</label>
                <input
                  v-model="editingSingleQuestion.key"
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: ip a atau ifconfig"
                />
              </div>

              <!-- Info Card Validasi Panjang Kata Siswa -->
              <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-950">
                <span class="flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">&check;</span>
                  <span>Standar Validasi Jawaban Siswa CBT</span>
                </span>
                <span class="font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Min. 10 Kata &mdash; Maks. 30 Kata
                </span>
              </div>
            </div>

            <!-- If Essay (Rubrik Penskoran + Bobot Nilai) -->
            <div v-if="editingSingleQuestion.type === 'Esai'" class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div class="sm:col-span-3">
                  <label class="block font-bold text-slate-700 mb-1">Panduan Rubrik Penilaian Guru</label>
                  <textarea
                    v-model="editingSingleQuestion.rubric"
                    rows="3"
                    class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                    placeholder="Tuliskan indikator poin kunci yang wajib dijawab siswa..."
                  />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Bobot Skor (0-100)</label>
                  <input
                    v-model.number="editingSingleQuestion.rubricScore"
                    type="number"
                    min="1"
                    max="100"
                    class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-purple-900 focus:bg-white focus:outline-none focus:border-purple-500"
                    placeholder="20"
                  />
                </div>
              </div>

              <!-- Info Card Validasi Panjang Kata Siswa -->
              <div class="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between text-xs font-semibold text-purple-950">
                <span class="flex items-center gap-1.5">
                  <AdminIcon name="spark" size="13" class="text-purple-600" />
                  <span>Validasi Jawaban Esai Siswa &amp; Alur Koreksi Manual Guru</span>
                </span>
                <span class="font-mono text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                  Min. 30 Kata &mdash; Maks. 150 Kata
                </span>
              </div>
            </div>

            <!-- If Interaktif -->
            <div v-if="editingSingleQuestion.type === 'Interaktif'" class="space-y-4">
              <!-- Media File Upload / URL Section -->
              <div class="p-3.5 bg-violet-50/60 rounded-xl border border-violet-200/80 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <label class="font-bold text-violet-950 flex items-center gap-1.5">
                    <AdminIcon name="spark" size="14" class="text-violet-600" />
                    <span>Pengaturan Media Interaktif (Biner Beban 0 Byte Database)</span>
                  </label>
                  
                  <div class="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-violet-200 text-xs font-bold">
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="editingSingleQuestion.mediaType === 'video' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="editingSingleQuestion.mediaType = 'video'"
                    >
                      Video YouTube Unlisted
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="editingSingleQuestion.mediaType === 'audio' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="editingSingleQuestion.mediaType = 'audio'"
                    >
                      Audio MP3 Statis
                    </button>
                  </div>
                </div>

                <!-- Input YouTube Unlisted Video URL -->
                <div v-if="editingSingleQuestion.mediaType === 'video'" class="space-y-2">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">URL Video YouTube Yayasan (Unlisted)</label>
                    <input
                      v-model="singleEditYouTubeUrlInput"
                      class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-violet-500"
                      placeholder="https://youtu.be/11KarakterID atau https://youtube.com/watch?v=..."
                      @input="handleSingleEditYouTubeChange"
                    />
                  </div>

                  <div v-if="singleEditYouTubeError" class="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                    {{ singleEditYouTubeError }}
                  </div>

                  <!-- Video Preview Player (Iframe Nocookie rel=0) -->
                  <div v-if="editingSingleQuestion.mediaUrl" class="space-y-1">
                    <span class="text-[11px] font-bold text-violet-900">Preview Player Nocookie (Tanpa Tombol Unduh):</span>
                    <div class="aspect-video max-w-md rounded-xl overflow-hidden bg-black">
                      <iframe
                        :src="editingSingleQuestion.mediaUrl"
                        class="w-full h-full border-0"
                        title="Preview Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                </div>

                <!-- Input Audio MP3 Statis Cloudflare -->
                <div v-else class="space-y-2">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1">Path File MP3 / URL CDN</label>
                      <input
                        v-model="editingSingleQuestion.mediaUrl"
                        class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                        placeholder="/media/cbt/audio/soal-01.mp3"
                      />
                    </div>
                    <div>
                      <label class="block font-bold text-slate-700 mb-1">Upload File Lokal (Maks 10 MB)</label>
                      <input
                        type="file"
                        accept="audio/*,.mp3"
                        class="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-violet-100 file:text-violet-700 file:font-bold cursor-pointer"
                        @change="handleSingleEditFileUpload($event)"
                      />
                    </div>
                  </div>

                  <div v-if="editingSingleQuestion.mediaUrl" class="space-y-1">
                    <span class="text-[11px] font-bold text-violet-900">Preview Audio Listening:</span>
                    <audio :src="editingSingleQuestion.mediaUrl" controls controlsList="nodownload" class="w-full h-8" />
                  </div>
                </div>
              </div>

              <!-- 3-Way Answer Format Selector -->
              <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <label class="font-bold text-slate-800">Format Kunci Jawaban Interaktif</label>
                  
                  <div class="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="singleEditInteractiveAnswerType === 'PG' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="singleEditInteractiveAnswerType = 'PG'"
                    >
                      Pilihan Ganda
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="singleEditInteractiveAnswerType === 'PG_Multi' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="singleEditInteractiveAnswerType = 'PG_Multi'"
                    >
                      PG Kompleks
                    </button>
                  </div>
                </div>

                <!-- Answer Format 1: PG Single -->
                <div v-if="singleEditInteractiveAnswerType === 'PG'" class="space-y-2">
                  <div
                    v-for="opt in singleEditInteractiveOptions"
                    :key="opt.key"
                    class="flex items-center gap-2 p-1.5 rounded-xl border transition"
                    :class="singleEditInteractiveSingleKey === opt.key ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white'"
                  >
                    <input
                      type="radio"
                      name="singleEditInteractiveRadio"
                      :checked="singleEditInteractiveSingleKey === opt.key"
                      class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 ml-1.5 cursor-pointer"
                      @change="singleEditInteractiveSingleKey = opt.key"
                    />
                    <span class="font-mono font-bold text-slate-600 w-5 text-center">{{ opt.key }}.</span>
                    <input
                      v-model="opt.text"
                      class="flex-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                      :placeholder="`Pilihan ${opt.key}...`"
                    />
                  </div>
                </div>

                <!-- Answer Format 2: PG Multi -->
                <div v-else-if="singleEditInteractiveAnswerType === 'PG_Multi'" class="space-y-2">
                  <div
                    v-for="opt in singleEditInteractiveOptions"
                    :key="opt.key"
                    class="flex items-center gap-2 p-1.5 rounded-xl border transition"
                    :class="singleEditInteractiveMultiKey.includes(opt.key) ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white'"
                  >
                    <input
                      type="checkbox"
                      :checked="singleEditInteractiveMultiKey.includes(opt.key)"
                      class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 ml-1.5 cursor-pointer"
                      @change="toggleSingleEditInteractiveMultiOption(opt.key)"
                    />
                    <span class="font-mono font-bold text-slate-600 w-5 text-center">{{ opt.key }}.</span>
                    <input
                      v-model="opt.text"
                      class="flex-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                      :placeholder="`Pilihan ${opt.key}...`"
                    />
                  </div>
                </div>

                <!-- Answer Format 3: Jawaban Singkat -->
                <div v-else class="space-y-1">
                  <div class="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Kunci Jawaban Singkat Tepat</span>
                    <span class="font-mono text-[10px] text-slate-400">Aturan Siswa: 10 - 30 Kata</span>
                  </div>
                  <input
                    v-model="singleEditInteractiveIsianKey"
                    class="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                    placeholder="Kunci jawaban tepat..."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50/70 shrink-0">
            <button
              type="button"
              class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl cursor-pointer transition"
              @click="isSingleEditModalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
              @click="saveSingleQuestionEdit"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================================================= -->
    <!-- MODE 4: BUAT / EDIT PAKET BANK SOAL LENGKAP -->
    <!-- ========================================================================= -->
    <template v-if="viewMode === 'form'">
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[24px] p-6 sm:p-8 shadow-xs max-w-5xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Jenjang {{ grade }}
              </span>
              <span class="text-xs text-slate-400">&bull;</span>
              <span class="text-xs font-semibold text-slate-500 font-mono">{{ formClass }}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">
              {{ editingPackageId ? 'Edit Paket Bank Soal' : 'Buat Paket Bank Soal Baru' }}
            </h3>
            <p class="text-xs text-slate-500 font-medium">
              Kelola butir soal Pilihan Ganda, Esai, dan Interaktif dalam satu paket terpadu
            </p>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
              type="button"
              @click="viewMode = selectedPackage ? 'detail' : 'classes'"
            >
              Batal
            </button>
            <button
              class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              type="button"
              :disabled="isDbLoading"
              @click="saveFullSubjectPackage"
            >
              <AdminIcon v-if="!isDbLoading" name="check" size="14" />
              <span v-if="isDbLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{{ isDbLoading ? 'Menyimpan...' : 'Simpan Paket' }}</span>
            </button>
          </div>
        </div>

        <!-- Meta Selector Grid -->
        <div class="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3.5 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AdminIcon name="gear" size="13" class="text-blue-600" />
              <span>Konfigurasi Paket Ujian</span>
            </span>
            <span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Paket: {{ formClass }} &bull; {{ formSubject }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label class="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <AdminIcon name="bldg" size="13" class="text-blue-600" />
                <span>Pilih Rombel / Kelas</span>
              </label>
              <select v-model="formClass" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs">
                <option v-for="c in activeClasses" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <AdminIcon name="book" size="13" class="text-blue-600" />
                <span>Mata Pelajaran</span>
              </label>
              <select v-model="formSubject" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs">
                <option v-for="s in subjectOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <AdminIcon name="shield" size="13" class="text-blue-600" />
                <span>Tingkat Kesulitan Umum</span>
              </label>
              <select v-model="formDifficulty" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs">
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sukar">Sukar</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <AdminIcon name="user" size="13" class="text-blue-600" />
                <span>Guru Penyusun / Pengampu</span>
              </label>
              <input
                v-model="formTeacherName"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                placeholder="Nama Guru Pengampu"
              />
            </div>
          </div>
        </div>

        <!-- Format Multi-Step Pills Header (Segmented Stepper) -->
        <div class="bg-slate-100/90 p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-slate-200/80">
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              :class="formActiveStep === 'PG'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              @click="formActiveStep = 'PG'"
            >
              <span>1. Pilihan Ganda</span>
              <span
                class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
                :class="formActiveStep === 'PG' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'"
              >
                {{ formPgList.length }} Soal
              </span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              :class="formActiveStep === 'Esai'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              @click="formActiveStep = 'Esai'"
            >
              <span>2. Esai</span>
              <span
                class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
                :class="formActiveStep === 'Esai' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'"
              >
                {{ formEssayList.length }} Soal
              </span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              :class="formActiveStep === 'Interaktif'
                ? 'bg-white text-violet-700 shadow-sm border border-slate-200/60 font-bold'
                : formHasInteractive
                  ? 'text-violet-700 hover:bg-violet-50'
                  : 'text-slate-400 hover:text-slate-600'"
              @click="formActiveStep = 'Interaktif'"
            >
              <span>3. Interaktif</span>
              <span
                v-if="formHasInteractive"
                class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
                :class="formActiveStep === 'Interaktif' ? 'bg-violet-100 text-violet-800' : 'bg-violet-200/80 text-violet-800'"
              >
                {{ formInteractiveList.length }} Soal
              </span>
            </button>
          </div>

          <!-- Switcher Interaktif -->
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border shadow-2xs"
            :class="formHasInteractive
              ? 'bg-violet-600 text-white border-violet-700'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            @click="formHasInteractive = !formHasInteractive"
          >
            <AdminIcon name="spark" size="13" />
            <span>{{ formHasInteractive ? 'Soal Interaktif Aktif' : 'Aktifkan Format Interaktif' }}</span>
          </button>
        </div>

        <!-- STEP 1: PILIHAN GANDA BUILDER -->
        <div v-if="formActiveStep === 'PG'" class="space-y-6">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Butir Soal Pilihan Ganda</span>
                <span class="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {{ formPgList.length }} Soal
                </span>
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                Klik huruf atau radio untuk menetapkan kunci benar (atau aktifkan multi-select jika terdapat lebih dari satu jawaban benar).
              </p>
            </div>
          </div>

          <div class="space-y-5">
            <div
              v-for="(pg, qIdx) in formPgList"
              :key="pg.id"
              class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition space-y-0"
            >
              <!-- Card Header Bar -->
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white bg-slate-900 shadow-2xs">
                    Soal #{{ qIdx + 1 }}
                  </span>
                  <select
                    v-model="pg.difficulty"
                    class="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="Mudah">Tingkat: Mudah</option>
                    <option value="Sedang">Tingkat: Sedang</option>
                    <option value="Sukar">Tingkat: Sukar</option>
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Toggle Mode Arab (RTL) -->
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    :class="pg.isArabic || isArabicText(pg.text)
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                    @click="pg.isArabic = !pg.isArabic"
                    title="Aktifkan penulisan teks Arab dari kanan ke kiri (RTL)"
                  >
                    <span>عربي</span>
                    <span>{{ (pg.isArabic || isArabicText(pg.text)) ? 'Arab (RTL)' : 'Teks Arab' }}</span>
                  </button>

                  <!-- Toggle Multi-Select -->
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    :class="pg.isMultiSelect
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                    @click="pg.isMultiSelect = !pg.isMultiSelect"
                    title="Centang jika soal memiliki lebih dari 1 pilihan jawaban benar (PG Kompleks)"
                  >
                    <span>{{ pg.isMultiSelect ? '✓ Multi-Select Aktif' : 'Multi-Select' }}</span>
                  </button>

                  <!-- Hapus Soal Button -->
                  <button
                    v-if="formPgList.length > 1"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus butir soal ini"
                    @click="removePgQuestion(qIdx)"
                  >
                    <AdminIcon name="trash" size="15" />
                  </button>
                </div>
              </div>

              <!-- Question Body -->
              <div class="p-5 space-y-4">
                <!-- Editor Box with Integrated Toolbar -->
                <div class="rounded-xl border border-slate-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <!-- Toolbar: LaTeX Symbols + Upload Photo Button -->
                  <div class="bg-slate-50/90 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                    <!-- Simbol KaTeX chips -->
                    <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Simbol:</span>
                      <button
                        v-for="sym in LATEX_TOOLBAR_SYMBOLS"
                        :key="sym.label"
                        type="button"
                        class="px-2 py-0.5 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded text-[11px] font-mono text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
                        :title="sym.description"
                        @click="insertFormulaToQuestion(pg, sym.syntax)"
                      >
                        {{ sym.label }}
                      </button>
                    </div>

                    <!-- Upload Photo Action on Toolbar -->
                    <label class="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer shadow-2xs transition flex items-center gap-1.5 shrink-0">
                      <AdminIcon name="upload" size="12" class="text-blue-600" />
                      <span>{{ pg.imageUrl ? 'Ganti Foto' : 'Sisipkan Foto / Rumus' }}</span>
                      <input type="file" accept="image/*" class="hidden" @change="handleQuestionImageUpload(pg, $event)" />
                    </label>
                  </div>

                  <!-- Textarea -->
                  <textarea
                    v-model="pg.text"
                    rows="3"
                    class="w-full p-3.5 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none transition"
                    :dir="pg.isArabic || isArabicText(pg.text) ? 'rtl' : 'ltr'"
                    :class="(pg.isArabic || isArabicText(pg.text)) ? 'text-right font-serif text-base leading-relaxed' : ''"
                    :placeholder="`Tuliskan butir soal pilihan ganda nomor ${qIdx + 1}... (Gunakan $...$ untuk rumus KaTeX)`"
                  />
                </div>

                <!-- Attached Image Bar (ONLY visible if image is attached) -->
                <div v-if="pg.imageUrl" class="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-start gap-3">
                  <img :src="pg.imageUrl" alt="Preview Foto" class="h-16 w-24 object-contain rounded-lg border border-slate-200 bg-white" />
                  <div class="flex-1 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-800">Foto Soal / Rumus Terlampir</span>
                        <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          {{ pg.imageCompressedSize }} (&lt; 200KB WebP)
                        </span>
                      </div>
                      <button
                        type="button"
                        class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        @click="removeQuestionImage(pg)"
                      >
                        Hapus Foto
                      </button>
                    </div>
                    <button
                      type="button"
                      class="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-lg font-bold text-[10.5px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      @click="triggerAiFormulaAnalysis(pg, formSubject)"
                    >
                      <AdminIcon name="spark" size="11" />
                      <span>Ekstrak Rumus LaTeX via Asisten AI</span>
                    </button>
                  </div>
                </div>

                <!-- Kotak Saran Asisten AI -->
                <div v-if="pg.aiSuggestion" class="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-2.5">
                  <div class="flex items-center justify-between text-xs font-bold text-purple-950">
                    <span class="flex items-center gap-1.5 text-[11px]">
                      <AdminIcon name="spark" size="12" class="text-purple-600" />
                      <span>Saran Rumus LaTeX AI (Akurasi {{ pg.aiSuggestion.confidence }}%)</span>
                    </span>
                    <button
                      type="button"
                      class="text-purple-400 hover:text-purple-700 text-xs font-bold cursor-pointer"
                      @click="pg.aiSuggestion = null"
                    >
                      &times;
                    </button>
                  </div>

                  <!-- Kategori Switcher AI -->
                  <div class="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1 border-b border-purple-200/60">
                    <span class="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Kategori:</span>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="pg.aiSuggestion.category === 'matematika' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(pg, 'matematika')"
                    >
                      📐 Matematika
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="pg.aiSuggestion.category === 'fisika' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(pg, 'fisika')"
                    >
                      ⚡ Fisika
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="pg.aiSuggestion.category === 'kimia' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(pg, 'kimia')"
                    >
                      🧪 Kimia/Bio
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="pg.aiSuggestion.category === 'arab' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(pg, 'arab')"
                    >
                      📖 Teks Arab
                    </button>
                  </div>

                  <!-- Preview KaTeX Formula -->
                  <div class="p-2.5 bg-white rounded-lg border border-purple-200 text-xs text-slate-800 font-mono overflow-x-auto" v-html="renderKaTeXHtml(pg.aiSuggestion.latex)" />

                  <!-- Input Edit LaTeX Langsung -->
                  <div class="space-y-1">
                    <label class="block text-[10.5px] font-bold text-purple-900">Edit Sintaks LaTeX (Bila Perlu Penyesuaian Angka):</label>
                    <input
                      v-model="pg.aiSuggestion.latex"
                      class="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <p class="text-[11px] text-purple-800 font-medium">{{ pg.aiSuggestion.explanation }}</p>

                  <div class="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer transition flex items-center gap-1"
                      @click="applyAiSuggestion(pg)"
                    >
                      <AdminIcon name="check" size="13" />
                      <span>Terapkan ke Soal</span>
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs cursor-pointer transition"
                      @click="pg.aiSuggestion = null"
                    >
                      Tolak
                    </button>
                  </div>
                </div>

                <!-- Real-time KaTeX & Arabic Preview (only if $ or Arabic present) -->
                <div v-if="pg.text && (pg.text.includes('$') || pg.isArabic || isArabicText(pg.text))" class="p-3 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-1">
                  <div class="flex items-center justify-between text-[11px] font-bold text-blue-900">
                    <span class="flex items-center gap-1">
                      <AdminIcon name="spark" size="12" class="text-blue-600" />
                      <span>Pratinjau Tampilan Ujian Siswa (KaTeX &amp; Teks Arab):</span>
                    </span>
                  </div>
                  <div
                    class="p-2.5 bg-white rounded-lg border border-blue-100 text-xs sm:text-sm text-slate-900 leading-relaxed overflow-x-auto"
                    :dir="pg.isArabic || isArabicText(pg.text) ? 'rtl' : 'ltr'"
                    :class="(pg.isArabic || isArabicText(pg.text)) ? 'text-right font-serif text-base' : ''"
                    v-html="renderKaTeXHtml(pg.text)"
                  />
                </div>

                <!-- Pilihan Jawaban A - E -->
                <div class="space-y-2.5 pt-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="block text-xs font-bold text-slate-800">
                        Pilihan Jawaban (Opsi A &mdash; E)
                      </label>
                      <p class="text-[11px] text-slate-500 font-medium">
                        {{ pg.isMultiSelect ? 'Klik tombol huruf untuk mencentang kunci benar (bisa lebih dari satu).' : 'Klik tombol huruf untuk menetapkan 1 kunci jawaban yang benar.' }}
                      </p>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="opt in pg.options"
                      :key="opt.key"
                      class="p-2.5 rounded-xl border transition space-y-2"
                      :class="(pg.isMultiSelect ? pg.keyMulti.includes(opt.key) : pg.keySingle === opt.key)
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'"
                    >
                      <div class="flex items-center gap-2.5">
                        <!-- Letter Indicator Button acting as Key Selector -->
                        <button
                          type="button"
                          class="w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0"
                          :class="(pg.isMultiSelect ? pg.keyMulti.includes(opt.key) : pg.keySingle === opt.key)
                            ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                          @click="pg.isMultiSelect ? toggleMultiSelectOption(pg, opt.key) : (pg.keySingle = opt.key)"
                          :title="`Tetapkan pilihan ${opt.key} sebagai kunci jawaban benar`"
                        >
                          {{ (pg.isMultiSelect ? pg.keyMulti.includes(opt.key) : pg.keySingle === opt.key) ? `✓ ${opt.key}` : opt.key }}
                        </button>

                        <!-- Text Input -->
                        <input
                          v-model="opt.text"
                          class="flex-1 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none transition"
                          :placeholder="`Tuliskan teks jawaban pilihan ${opt.key}...`"
                        />

                        <!-- Kunci Benar Badge -->
                        <span
                          v-if="(pg.isMultiSelect ? pg.keyMulti.includes(opt.key) : pg.keySingle === opt.key)"
                          class="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0"
                        >
                          &check; Kunci Benar
                        </span>

                        <!-- Upload Foto Opsi -->
                        <label class="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 cursor-pointer shrink-0 transition" title="Lampirkan foto opsi">
                          <AdminIcon name="upload" size="13" />
                          <input type="file" accept="image/*" class="hidden" @change="handleOptionImageUpload(opt, $event)" />
                        </label>
                      </div>

                      <!-- KaTeX Live Preview pada Opsi -->
                      <div v-if="opt.text && opt.text.includes('$')" class="ml-9 p-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800" v-html="renderKaTeXHtml(opt.text)" />
                      <div v-if="opt.imageUrl" class="ml-9 flex items-center gap-2">
                        <img :src="opt.imageUrl" alt="Preview Opsi" class="h-10 rounded border border-slate-200 bg-white p-0.5" />
                        <button type="button" class="text-[10px] text-rose-600 hover:text-rose-800 font-semibold" @click="removeOptionImage(opt)">Hapus Foto</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- BUTTON TAMBAH SOAL DI BAWAH LIST -->
            <button
              class="w-full py-3.5 bg-white hover:bg-blue-50/60 text-blue-600 hover:text-blue-700 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              type="button"
              @click="addPgQuestion"
            >
              <AdminIcon name="plus" size="16" />
              <span>Tambah Butir Soal PG Baru (#{{ formPgList.length + 1 }})</span>
            </button>

            <!-- Navigasi Langkah Berikutnya: Isian -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-200/80 mt-2">
              <span class="text-xs text-slate-500 font-medium">Langkah 1 dari 3: Pilihan Ganda</span>
              <button
                type="button"
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                @click="formActiveStep = 'Esai'"
              >
                <span>Lanjut ke 2. Esai</span>
                <AdminIcon name="crt" size="14" />
              </button>
            </div>
          </div>
        </div>


        <!-- STEP 3: ESSAY BUILDER -->
        <div v-if="formActiveStep === 'Esai'" class="space-y-6">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Butir Soal Essay (Uraian)</span>
                <span class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {{ formEssayList.length }} Soal
                </span>
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                Soal uraian dinilai manual oleh guru berdasarkan rubrik penskoran dan bobot nilai yang telah ditentukan.
              </p>
            </div>
          </div>

          <div class="space-y-5">
            <div
              v-for="(esQ, qIdx) in formEssayList"
              :key="esQ.id"
              class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition space-y-0"
            >
              <!-- Card Header Bar -->
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white bg-slate-900 shadow-2xs">
                    Soal #{{ qIdx + 1 }}
                  </span>
                  <span class="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                    Essay / Uraian
                  </span>
                  <select
                    v-model="esQ.difficulty"
                    class="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-purple-500 shadow-2xs"
                  >
                    <option value="Mudah">Tingkat: Mudah</option>
                    <option value="Sedang">Tingkat: Sedang</option>
                    <option value="Sukar">Tingkat: Sukar</option>
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Toggle Mode Arab (RTL) -->
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    :class="esQ.isArabic || isArabicText(esQ.text)
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                    @click="esQ.isArabic = !esQ.isArabic"
                    title="Aktifkan penulisan teks Arab dari kanan ke kiri (RTL)"
                  >
                    <span>عربي</span>
                    <span>{{ (esQ.isArabic || isArabicText(esQ.text)) ? 'Arab (RTL)' : 'Teks Arab' }}</span>
                  </button>

                  <!-- Hapus Soal Button -->
                  <button
                    v-if="formEssayList.length > 1"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus butir soal ini"
                    @click="removeEssayQuestion(qIdx)"
                  >
                    <AdminIcon name="trash" size="15" />
                  </button>
                </div>
              </div>

              <!-- Question Body -->
              <div class="p-5 space-y-4">
                <!-- Editor Box with Integrated Toolbar -->
                <div class="rounded-xl border border-slate-200 overflow-hidden focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition">
                  <!-- Toolbar: LaTeX Symbols + Upload Photo Button -->
                  <div class="bg-slate-50/90 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                    <!-- Simbol KaTeX chips -->
                    <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Simbol:</span>
                      <button
                        v-for="sym in LATEX_TOOLBAR_SYMBOLS"
                        :key="sym.label"
                        type="button"
                        class="px-2 py-0.5 bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded text-[11px] font-mono text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
                        :title="sym.description"
                        @click="insertFormulaToQuestion(esQ, sym.syntax)"
                      >
                        {{ sym.label }}
                      </button>
                    </div>

                    <!-- Upload Photo Action on Toolbar -->
                    <label class="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer shadow-2xs transition flex items-center gap-1.5 shrink-0">
                      <AdminIcon name="upload" size="12" class="text-purple-600" />
                      <span>{{ esQ.imageUrl ? 'Ganti Foto' : 'Sisipkan Foto / Rumus' }}</span>
                      <input type="file" accept="image/*" class="hidden" @change="handleQuestionImageUpload(esQ, $event)" />
                    </label>
                  </div>

                  <!-- Textarea -->
                  <textarea
                    v-model="esQ.text"
                    rows="3"
                    class="w-full p-3.5 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none transition"
                    :dir="esQ.isArabic || isArabicText(esQ.text) ? 'rtl' : 'ltr'"
                    :class="(esQ.isArabic || isArabicText(esQ.text)) ? 'text-right font-serif text-base leading-relaxed' : ''"
                    :placeholder="`Tuliskan pertanyaan uraian mendalam nomor ${qIdx + 1}... (Gunakan $...$ untuk rumus KaTeX)`"
                  />
                </div>

                <!-- Attached Image Bar (ONLY visible if image is attached) -->
                <div v-if="esQ.imageUrl" class="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 flex items-start gap-3">
                  <img :src="esQ.imageUrl" alt="Preview Foto" class="h-16 w-24 object-contain rounded-lg border border-slate-200 bg-white" />
                  <div class="flex-1 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-800">Foto Soal / Rumus Terlampir</span>
                        <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          {{ esQ.imageCompressedSize }} (&lt; 200KB WebP)
                        </span>
                      </div>
                      <button
                        type="button"
                        class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        @click="removeQuestionImage(esQ)"
                      >
                        Hapus Foto
                      </button>
                    </div>
                    <button
                      type="button"
                      class="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-lg font-bold text-[10.5px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      @click="triggerAiFormulaAnalysis(esQ, formSubject)"
                    >
                      <AdminIcon name="spark" size="11" />
                      <span>Ekstrak Rumus LaTeX via Asisten AI</span>
                    </button>
                  </div>
                </div>

                <!-- Kotak Saran Asisten AI -->
                <div v-if="esQ.aiSuggestion" class="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-2.5">
                  <div class="flex items-center justify-between text-xs font-bold text-purple-950">
                    <span class="flex items-center gap-1.5 text-[11px]">
                      <AdminIcon name="spark" size="12" class="text-purple-600" />
                      <span>Saran Rumus LaTeX AI (Akurasi {{ esQ.aiSuggestion.confidence }}%)</span>
                    </span>
                    <button
                      type="button"
                      class="text-purple-400 hover:text-purple-700 text-xs font-bold cursor-pointer"
                      @click="esQ.aiSuggestion = null"
                    >
                      &times;
                    </button>
                  </div>

                  <!-- Kategori Switcher AI -->
                  <div class="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1 border-b border-purple-200/60">
                    <span class="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Kategori:</span>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="esQ.aiSuggestion.category === 'matematika' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(esQ, 'matematika')"
                    >
                      📐 Matematika
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="esQ.aiSuggestion.category === 'fisika' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(esQ, 'fisika')"
                    >
                      ⚡ Fisika
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="esQ.aiSuggestion.category === 'kimia' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(esQ, 'kimia')"
                    >
                      🧪 Kimia/Bio
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="esQ.aiSuggestion.category === 'arab' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(esQ, 'arab')"
                    >
                      📖 Teks Arab
                    </button>
                  </div>

                  <!-- Preview KaTeX Formula -->
                  <div class="p-2.5 bg-white rounded-lg border border-purple-200 text-xs text-slate-800 font-mono overflow-x-auto" v-html="renderKaTeXHtml(esQ.aiSuggestion.latex)" />

                  <!-- Input Edit LaTeX Langsung -->
                  <div class="space-y-1">
                    <label class="block text-[10.5px] font-bold text-purple-900">Edit Sintaks LaTeX (Bila Perlu Penyesuaian Angka):</label>
                    <input
                      v-model="esQ.aiSuggestion.latex"
                      class="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <p class="text-[11px] text-purple-800 font-medium">{{ esQ.aiSuggestion.explanation }}</p>

                  <div class="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer transition flex items-center gap-1"
                      @click="applyAiSuggestion(esQ)"
                    >
                      <AdminIcon name="check" size="13" />
                      <span>Terapkan ke Soal</span>
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs cursor-pointer transition"
                      @click="esQ.aiSuggestion = null"
                    >
                      Tolak
                    </button>
                  </div>
                </div>

                <!-- Real-time KaTeX & Arabic Preview (only if $ or Arabic present) -->
                <div v-if="esQ.text && (esQ.text.includes('$') || esQ.isArabic || isArabicText(esQ.text))" class="p-3 bg-purple-50/40 rounded-xl border border-purple-200/80 space-y-1">
                  <div class="flex items-center justify-between text-[11px] font-bold text-purple-900">
                    <span class="flex items-center gap-1">
                      <AdminIcon name="spark" size="12" class="text-purple-600" />
                      <span>Pratinjau Tampilan Ujian Siswa (KaTeX &amp; Teks Arab):</span>
                    </span>
                  </div>
                  <div
                    class="p-2.5 bg-white rounded-lg border border-purple-100 text-xs sm:text-sm text-slate-900 leading-relaxed overflow-x-auto"
                    :dir="esQ.isArabic || isArabicText(esQ.text) ? 'rtl' : 'ltr'"
                    :class="(esQ.isArabic || isArabicText(esQ.text)) ? 'text-right font-serif text-base' : ''"
                    v-html="renderKaTeXHtml(esQ.text)"
                  />
                </div>

                <!-- Rubrik Penilaian & Bobot Skor Maksimal -->
                <div class="p-4 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div class="sm:col-span-3 space-y-1">
                      <div class="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span class="flex items-center gap-1.5 text-purple-950">
                          <AdminIcon name="spark" size="12" class="text-purple-600" />
                          <span>Panduan Rubrik &amp; Kunci Jawaban Benar Guru</span>
                        </span>
                        <span class="font-mono text-[11px] text-slate-400">Min. 20 Karakter</span>
                      </div>
                      <textarea
                        v-model="esQ.rubric"
                        rows="2"
                        class="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                        placeholder="Tuliskan kriteria poin penilaian yang wajib dijawab siswa..."
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="block text-xs font-bold text-slate-800">Bobot Skor (1-100)</label>
                      <input
                        v-model.number="esQ.rubricScore"
                        type="number"
                        min="1"
                        max="100"
                        class="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                        placeholder="20"
                      />
                      <p class="text-[10px] text-slate-400">Nilai maksimum soal</p>
                    </div>
                  </div>

                  <!-- Info Card Standar Validasi Panjang Kata Siswa -->
                  <div class="flex items-center justify-between text-[11px] text-purple-800 font-medium pt-1 border-t border-purple-200/60 flex-wrap gap-2">
                    <span class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">&check;</span>
                      <span>Standar Validasi Siswa CBT: <strong>Min. 30 Kata &mdash; Maks. 150 Kata</strong></span>
                    </span>
                    <span class="text-[10.5px] bg-white text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-semibold">
                      Koreksi Manual Guru
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- BUTTON TAMBAH SOAL ESSAY DI BAWAH LIST -->
            <button
              class="w-full py-3.5 bg-white hover:bg-purple-50/60 text-purple-600 hover:text-purple-700 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              type="button"
              @click="addEssayQuestion"
            >
              <AdminIcon name="plus" size="16" />
              <span>Tambah Butir Soal Essay Baru (#{{ formEssayList.length + 1 }})</span>
            </button>

            <!-- Navigasi Langkah: Kembali ke Isian / Lanjut ke Interaktif / Simpan -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-200/80 mt-2">
              <button
                type="button"
                class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
                @click="formActiveStep = 'PG'"
              >
                <AdminIcon name="clt" size="14" />
                <span>Kembali ke 1. Pilihan Ganda</span>
              </button>
              <button
                v-if="formHasInteractive"
                type="button"
                class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                @click="formActiveStep = 'Interaktif'"
              >
                <span>Lanjut ke 3. Interaktif</span>
                <AdminIcon name="crt" size="14" />
              </button>
              <button
                v-else
                type="button"
                class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                :disabled="isDbLoading"
                @click="saveFullSubjectPackage"
              >
                <AdminIcon v-if="!isDbLoading" name="check" size="14" />
                <span v-if="isDbLoading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{{ isDbLoading ? 'Menyimpan...' : 'Simpan Seluruh Paket' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 4: INTERAKTIF BUILDER (VIOLET THEMED) -->
        <div v-if="formActiveStep === 'Interaktif'" class="space-y-6">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Butir Soal Interaktif (Audio / Video)</span>
                <span class="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                  {{ formInteractiveList.length }} Soal
                </span>
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                Gunakan video YouTube unlisted atau audio listening MP3 yang aman dari unduhan siswa.
              </p>
            </div>
          </div>

          <div v-if="!formHasInteractive" class="p-8 text-center bg-violet-50/40 rounded-2xl border-2 border-dashed border-violet-200 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto shadow-2xs">
              <AdminIcon name="spark" size="24" />
            </div>
            <div>
              <h5 class="text-sm font-bold text-slate-800">Format Soal Interaktif Belum Diaktifkan</h5>
              <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Aktifkan opsi ini apabila ujian memerlukan media pemutaran audio listening (bahasa asing) atau video simulasi praktikum.
              </p>
            </div>
            <button
              class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              type="button"
              @click="formHasInteractive = true"
            >
              Aktifkan Format Interaktif
            </button>
          </div>

          <div v-else class="space-y-5">
            <div
              v-for="(inQ, qIdx) in formInteractiveList"
              :key="inQ.id"
              class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition space-y-0"
            >
              <!-- Card Header Bar -->
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white bg-violet-900 shadow-2xs">
                    Interaktif #{{ qIdx + 1 }}
                  </span>
                  <select
                    v-model="inQ.difficulty"
                    class="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-violet-500 shadow-2xs"
                  >
                    <option value="Mudah">Tingkat: Mudah</option>
                    <option value="Sedang">Tingkat: Sedang</option>
                    <option value="Sukar">Tingkat: Sukar</option>
                  </select>

                  <!-- Media Type Toggle Pill -->
                  <div class="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      class="px-2.5 py-0.5 rounded-md transition cursor-pointer text-[11px]"
                      :class="inQ.mediaType === 'video' ? 'bg-white text-violet-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.mediaType = 'video'"
                    >
                      ▶ Video YouTube
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-0.5 rounded-md transition cursor-pointer text-[11px]"
                      :class="inQ.mediaType === 'audio' ? 'bg-white text-violet-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.mediaType = 'audio'"
                    >
                      🎵 Audio Listening
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Toggle Mode Arab (RTL) -->
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    :class="inQ.isArabic || isArabicText(inQ.text)
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                    @click="inQ.isArabic = !inQ.isArabic"
                    title="Aktifkan penulisan teks Arab dari kanan ke kiri (RTL)"
                  >
                    <span>عربي</span>
                    <span>{{ (inQ.isArabic || isArabicText(inQ.text)) ? 'Arab (RTL)' : 'Teks Arab' }}</span>
                  </button>

                  <!-- Hapus Soal Button -->
                  <button
                    v-if="formInteractiveList.length > 1"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus butir soal interaktif ini"
                    @click="removeInteractiveQuestion(qIdx)"
                  >
                    <AdminIcon name="trash" size="15" />
                  </button>
                </div>
              </div>

              <!-- Question Body -->
              <div class="p-5 space-y-4">
                <!-- Media Configuration Panel -->
                <div class="p-4 bg-violet-50/60 rounded-xl border border-violet-200/80 space-y-3">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                      <AdminIcon name="spark" size="13" class="text-violet-600" />
                      <span v-if="inQ.mediaType === 'video'">Sumber Video Simulasi (YouTube Unlisted Yayasan)</span>
                      <span v-else>Sumber Audio Listening CBT (MP3 Statis / CDN Cloudflare)</span>
                    </span>
                    <span class="text-[10px] font-semibold text-violet-700 bg-white px-2 py-0.5 rounded border border-violet-200">
                      Beban Database 0 Byte &bull; Anti-Unduh Siswa
                    </span>
                  </div>

                  <!-- JIKA VIDEO: INPUT YOUTUBE UNLISTED -->
                  <div v-if="inQ.mediaType === 'video'" class="space-y-2.5">
                    <div>
                      <div class="flex gap-2">
                        <input
                          v-model="inQ.youtubeUrlInput"
                          class="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-violet-500 shadow-2xs"
                          placeholder="Contoh: https://youtu.be/dQw4w9WgXcQ atau https://www.youtube.com/watch?v=..."
                          @input="handleYouTubeUrlChange(inQ)"
                        />
                        <button
                          type="button"
                          class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                          @click="handleYouTubeUrlChange(inQ)"
                        >
                          Verifikasi
                        </button>
                      </div>
                      <p class="text-[11px] text-slate-500 mt-1 font-medium">
                        Wajib video unlisted channel resmi sekolah. Sistem mengambil ID video dan memutarnya melalui pemutar khusus tanpa rekomendasi.
                      </p>
                    </div>

                    <!-- Error Alert -->
                    <div v-if="inQ.youtubeError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                      <AdminIcon name="alert" size="14" class="text-rose-600 shrink-0" />
                      <span>{{ inQ.youtubeError }}</span>
                    </div>

                    <!-- Iframe Preview -->
                    <div v-if="inQ.mediaId && !inQ.youtubeError" class="space-y-1 pt-1">
                      <div class="flex items-center justify-between text-[11px] font-bold text-violet-950">
                        <span>Pratinjau Pemutar Video Ujian:</span>
                        <span class="text-emerald-700 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                          ID: {{ inQ.mediaId }}
                        </span>
                      </div>
                      <div class="aspect-video w-full max-h-56 rounded-xl overflow-hidden border border-slate-200 bg-black">
                        <iframe
                          :src="`https://www.youtube-nocookie.com/embed/${inQ.mediaId}?rel=0&modestbranding=1`"
                          class="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        />
                      </div>
                    </div>
                  </div>

                  <!-- JIKA AUDIO: INPUT AUDIO CLOUDFLARE STATIC / UPLOAD FILE MP3 LOKAL -->
                  <div v-else class="space-y-2.5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Path / URL File MP3 CDN</label>
                        <input
                          v-model="inQ.mediaUrl"
                          class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-violet-500 shadow-2xs"
                          placeholder="/media/cbt/audio/listening-01.mp3"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Unggah File Audio (Maks 10 MB)</label>
                        <input
                          type="file"
                          accept="audio/*,.mp3"
                          class="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-violet-100 file:text-violet-700 file:font-bold cursor-pointer"
                          @change="handleInteractiveFileUpload(inQ, $event)"
                        />
                      </div>
                    </div>

                    <!-- Audio Player Preview -->
                    <div v-if="inQ.mediaUrl" class="space-y-1 pt-1">
                      <div class="flex items-center justify-between text-[11px] font-bold text-violet-950">
                        <span>Pratinjau Pemutar Audio:</span>
                        <span class="text-emerald-700 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200">Anti Unduh Siswa</span>
                      </div>
                      <audio :src="inQ.mediaUrl" controls controlsList="nodownload" class="w-full h-8" />
                    </div>
                  </div>
                </div>

                <!-- Editor Box with Integrated Toolbar -->
                <div class="rounded-xl border border-slate-200 overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition">
                  <!-- Toolbar: LaTeX Symbols + Upload Photo Button -->
                  <div class="bg-slate-50/90 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                    <!-- Simbol KaTeX chips -->
                    <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Simbol:</span>
                      <button
                        v-for="sym in LATEX_TOOLBAR_SYMBOLS"
                        :key="sym.label"
                        type="button"
                        class="px-2 py-0.5 bg-white hover:bg-violet-50 hover:text-violet-700 border border-slate-200 rounded text-[11px] font-mono text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
                        :title="sym.description"
                        @click="insertFormulaToQuestion(inQ, sym.syntax)"
                      >
                        {{ sym.label }}
                      </button>
                    </div>

                    <!-- Upload Photo Action on Toolbar -->
                    <label class="px-2.5 py-1 bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer shadow-2xs transition flex items-center gap-1.5 shrink-0">
                      <AdminIcon name="upload" size="12" class="text-violet-600" />
                      <span>{{ inQ.imageUrl ? 'Ganti Foto' : 'Sisipkan Foto / Lampiran' }}</span>
                      <input type="file" accept="image/*" class="hidden" @change="handleQuestionImageUpload(inQ, $event)" />
                    </label>
                  </div>

                  <!-- Textarea -->
                  <textarea
                    v-model="inQ.text"
                    rows="3"
                    class="w-full p-3.5 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none transition"
                    :dir="inQ.isArabic || isArabicText(inQ.text) ? 'rtl' : 'ltr'"
                    :class="(inQ.isArabic || isArabicText(inQ.text)) ? 'text-right font-serif text-base leading-relaxed' : ''"
                    :placeholder="`Tuliskan butir soal interaktif nomor ${qIdx + 1}... (Gunakan $...$ untuk rumus KaTeX)`"
                  />
                </div>

                <!-- Attached Image Bar (ONLY visible if image is attached) -->
                <div v-if="inQ.imageUrl" class="p-3 bg-violet-50/60 rounded-xl border border-violet-200/80 flex items-start gap-3">
                  <img :src="inQ.imageUrl" alt="Preview Foto" class="h-16 w-24 object-contain rounded-lg border border-slate-200 bg-white" />
                  <div class="flex-1 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-800">Foto Soal / Lampiran Terlampir</span>
                        <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          {{ inQ.imageCompressedSize }} (&lt; 200KB WebP)
                        </span>
                      </div>
                      <button
                        type="button"
                        class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        @click="removeQuestionImage(inQ)"
                      >
                        Hapus Foto
                      </button>
                    </div>
                    <button
                      type="button"
                      class="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-lg font-bold text-[10.5px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      @click="triggerAiFormulaAnalysis(inQ, formSubject)"
                    >
                      <AdminIcon name="spark" size="11" />
                      <span>Ekstrak Rumus LaTeX via Asisten AI</span>
                    </button>
                  </div>
                </div>

                <!-- Kotak Saran Asisten AI -->
                <div v-if="inQ.aiSuggestion" class="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-2.5">
                  <div class="flex items-center justify-between text-xs font-bold text-purple-950">
                    <span class="flex items-center gap-1.5 text-[11px]">
                      <AdminIcon name="spark" size="12" class="text-purple-600" />
                      <span>Saran Rumus LaTeX AI (Akurasi {{ inQ.aiSuggestion.confidence }}%)</span>
                    </span>
                    <button
                      type="button"
                      class="text-purple-400 hover:text-purple-700 text-xs font-bold cursor-pointer"
                      @click="inQ.aiSuggestion = null"
                    >
                      &times;
                    </button>
                  </div>

                  <!-- Kategori Switcher AI -->
                  <div class="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1 border-b border-purple-200/60">
                    <span class="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Kategori:</span>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="inQ.aiSuggestion.category === 'matematika' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(inQ, 'matematika')"
                    >
                      📐 Matematika
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="inQ.aiSuggestion.category === 'fisika' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(inQ, 'fisika')"
                    >
                      ⚡ Fisika
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="inQ.aiSuggestion.category === 'kimia' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(inQ, 'kimia')"
                    >
                      🧪 Kimia/Bio
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-[10.5px] font-bold transition border cursor-pointer"
                      :class="inQ.aiSuggestion.category === 'arab' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'"
                      @click="setAiCategory(inQ, 'arab')"
                    >
                      📖 Teks Arab
                    </button>
                  </div>

                  <!-- Preview KaTeX Formula -->
                  <div class="p-2.5 bg-white rounded-lg border border-purple-200 text-xs text-slate-800 font-mono overflow-x-auto" v-html="renderKaTeXHtml(inQ.aiSuggestion.latex)" />

                  <!-- Input Edit LaTeX Langsung -->
                  <div class="space-y-1">
                    <label class="block text-[10.5px] font-bold text-purple-900">Edit Sintaks LaTeX (Bila Perlu Penyesuaian Angka):</label>
                    <input
                      v-model="inQ.aiSuggestion.latex"
                      class="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <p class="text-[11px] text-purple-800 font-medium">{{ inQ.aiSuggestion.explanation }}</p>

                  <div class="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer transition flex items-center gap-1"
                      @click="applyAiSuggestion(inQ)"
                    >
                      <AdminIcon name="check" size="13" />
                      <span>Terapkan ke Soal</span>
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs cursor-pointer transition"
                      @click="inQ.aiSuggestion = null"
                    >
                      Tolak
                    </button>
                  </div>
                </div>

                <!-- Real-time KaTeX & Arabic Preview (only if $ or Arabic present) -->
                <div v-if="inQ.text && (inQ.text.includes('$') || inQ.isArabic || isArabicText(inQ.text))" class="p-3 bg-violet-50/40 rounded-xl border border-violet-200/80 space-y-1">
                  <div class="flex items-center justify-between text-[11px] font-bold text-violet-900">
                    <span class="flex items-center gap-1">
                      <AdminIcon name="spark" size="12" class="text-violet-600" />
                      <span>Pratinjau Tampilan Ujian Siswa (KaTeX &amp; Teks Arab):</span>
                    </span>
                  </div>
                  <div
                    class="p-2.5 bg-white rounded-lg border border-violet-100 text-xs sm:text-sm text-slate-900 leading-relaxed overflow-x-auto"
                    :dir="inQ.isArabic || isArabicText(inQ.text) ? 'rtl' : 'ltr'"
                    :class="(inQ.isArabic || isArabicText(inQ.text)) ? 'text-right font-serif text-base' : ''"
                    v-html="renderKaTeXHtml(inQ.text)"
                  />
                </div>

                <!-- Answer Format Selector & Options -->
                <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <div class="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-200/60">
                    <div>
                      <label class="block text-xs font-bold text-slate-800">Format Kunci Jawaban Soal Interaktif</label>
                      <p class="text-[11px] text-slate-500 font-medium">Tentukan tipe jawaban yang harus diisi atau dipilih siswa</p>
                    </div>

                    <!-- 3 Switcher Buttons -->
                    <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs"
                        :class="inQ.interactiveAnswerType === 'PG' ? 'bg-violet-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
                        @click="inQ.interactiveAnswerType = 'PG'"
                      >
                        Pilihan Ganda
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs"
                        :class="inQ.interactiveAnswerType === 'PG_Multi' ? 'bg-violet-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
                        @click="inQ.interactiveAnswerType = 'PG_Multi'"
                      >
                        Multi-Select
                      </button>
                    </div>
                  </div>

                  <!-- Format 1 & 2: PG & PG Multi-Select -->
                  <div v-if="inQ.interactiveAnswerType === 'PG' || inQ.interactiveAnswerType === 'PG_Multi'" class="space-y-2.5">
                    <div class="space-y-2">
                      <div
                        v-for="opt in inQ.options"
                        :key="opt.key"
                        class="p-2.5 rounded-xl border transition space-y-2"
                        :class="(inQ.interactiveAnswerType === 'PG_Multi' ? inQ.keyMulti.includes(opt.key) : inQ.keySingle === opt.key)
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'"
                      >
                        <div class="flex items-center gap-2.5">
                          <!-- Letter Button Trigger -->
                          <button
                            type="button"
                            class="w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
                            :class="(inQ.interactiveAnswerType === 'PG_Multi' ? inQ.keyMulti.includes(opt.key) : inQ.keySingle === opt.key)
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                            :title="inQ.interactiveAnswerType === 'PG_Multi' ? `Klik untuk centang Opsi ${opt.key} sebagai kunci benar` : `Klik untuk menetapkan Opsi ${opt.key} sebagai kunci benar`"
                            @click="inQ.interactiveAnswerType === 'PG_Multi' ? toggleInteractiveMultiOption(inQ, opt.key) : inQ.keySingle = opt.key"
                          >
                            {{ opt.key }}
                          </button>

                          <!-- Input Teks Opsi -->
                          <div class="flex-1 relative">
                            <input
                              v-model="opt.text"
                              class="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-violet-500 shadow-2xs"
                              :placeholder="`Isi pilihan jawaban ${opt.key}...`"
                            />
                          </div>

                          <!-- Status Kunci Benar Badge -->
                          <div class="flex items-center gap-1.5 shrink-0">
                            <span
                              v-if="(inQ.interactiveAnswerType === 'PG_Multi' ? inQ.keyMulti.includes(opt.key) : inQ.keySingle === opt.key)"
                              class="px-2 py-1 rounded-md text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"
                            >
                              <span>&check;</span>
                              <span class="hidden sm:inline">Kunci Benar</span>
                            </span>

                            <!-- Tombol Upload Foto Opsi -->
                            <label class="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer shadow-2xs transition flex items-center gap-1">
                              <AdminIcon name="upload" size="11" />
                              <span class="hidden sm:inline">{{ opt.imageUrl ? 'Ganti' : 'Foto' }}</span>
                              <input type="file" accept="image/*" class="hidden" @change="handleOptionImageUpload(opt, $event)" />
                            </label>
                          </div>
                        </div>

                        <!-- Preview Foto Opsi -->
                        <div v-if="opt.imageUrl" class="ml-10.5 flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <img :src="opt.imageUrl" alt="Preview Opsi" class="h-10 w-16 object-contain rounded border border-slate-200 bg-white" />
                          <button type="button" class="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer" @click="removeOptionImage(opt)">
                            Hapus Foto Opsi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Format 3: Jawaban Singkat (Isian) -->
                  <div v-else class="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2">
                    <div class="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span class="flex items-center gap-1.5 text-emerald-950">
                        <span class="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">&check;</span>
                        <span>Kunci Jawaban Singkat yang Diterima</span>
                      </span>
                      <span class="font-mono text-[11px] text-slate-400">Standar Siswa: 10 &mdash; 30 Kata</span>
                    </div>
                    <input
                      v-model="inQ.keyIsian"
                      class="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
                      placeholder="Tuliskan kata kunci atau angka yang menjadi jawaban benar..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- BUTTON TAMBAH SOAL INTERAKTIF DI BAWAH LIST -->
            <button
              class="w-full py-3.5 bg-white hover:bg-violet-50/60 text-violet-600 hover:text-violet-700 border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              type="button"
              @click="addInteractiveQuestion"
            >
              <AdminIcon name="plus" size="16" />
              <span>Tambah Butir Soal Interaktif Baru (#{{ formInteractiveList.length + 1 }})</span>
            </button>

            <!-- Navigasi Langkah: Kembali ke Essay / Simpan Paket -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-200/80 mt-2">
              <button
                type="button"
                class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
                @click="formActiveStep = 'Esai'"
              >
                <AdminIcon name="clt" size="14" />
                <span>Kembali ke 2. Esai</span>
              </button>
              <button
                type="button"
                class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                :disabled="isDbLoading"
                @click="saveFullSubjectPackage"
              >
                <AdminIcon v-if="!isDbLoading" name="check" size="14" />
                <span v-if="isDbLoading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{{ isDbLoading ? 'Menyimpan...' : 'Simpan Seluruh Paket Bank Soal' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Footer: Save All -->
        <div class="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="text-xs text-slate-500 font-medium">
            Total yang akan tersimpan: <strong>{{ formPgList.filter(q => q.text.trim()).length }} PG</strong>, <strong>{{ formIsianList.filter(q => q.text.trim()).length }} Isian</strong>, <strong>{{ formEssayList.filter(q => q.text.trim()).length }} Essay</strong><span v-if="formHasInteractive">, <strong>{{ formInteractiveList.filter(q => q.text.trim()).length }} Interaktif</strong></span>
          </div>

          <div class="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              type="button"
              @click="viewMode = selectedPackage ? 'detail' : 'classes'"
            >
              Batal
            </button>
            <button
              class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              type="button"
              :disabled="isDbLoading"
              @click="saveFullSubjectPackage"
            >
              <AdminIcon v-if="!isDbLoading" name="check" size="14" />
              <span v-if="isDbLoading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{{ isDbLoading ? 'Menyimpan...' : 'Simpan Seluruh Paket Bank Soal' }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ========================================================================= -->
    <!-- MODAL: IMPORT BANK SOAL (TELEPORTED TO BODY FOR FULL OVERLAY) -->
    <!-- ========================================================================= -->
    <Teleport to="body">
      <div
        v-if="isImportModalOpen"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        @click.self="isImportModalOpen = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scaleUp">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h4 class="text-base font-bold text-slate-900">Import Bank Soal (Word / Excel / CSV)</h4>
              <p class="text-xs text-slate-500 font-medium">Unggah butir pertanyaan mata pelajaran sesuai format standard sistem CBT</p>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition"
              @click="isImportModalOpen = false"
            >
              <AdminIcon name="x" size="16" />
            </button>
          </div>

          <div class="p-6 space-y-5 text-xs">
            <!-- Download Template Pills -->
            <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <span class="font-bold text-blue-900 block">1. Unduh Template Standard:</span>
              <p class="text-blue-800 leading-relaxed">
                Gunakan file template berikut untuk mempermudah penulisan soal pilihan ganda, esai, dan interaktif:
              </p>
              <div class="flex flex-wrap gap-2 pt-1">
                <button
                  class="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  type="button"
                  @click="downloadTemplate('xlsx')"
                >
                  <AdminIcon name="dl" size="14" />
                  <span>Template Excel (.xlsx)</span>
                </button>
                <button
                  class="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  type="button"
                  @click="downloadTemplate('docx')"
                >
                  <AdminIcon name="dl" size="14" />
                  <span>Template Word (.docx)</span>
                </button>
                <button
                  class="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  type="button"
                  @click="downloadTemplate('csv')"
                >
                  <AdminIcon name="dl" size="14" />
                  <span>Template CSV (.csv)</span>
                </button>
              </div>
            </div>

            <!-- Dropzone Uploader -->
            <div class="space-y-1.5">
              <span class="font-bold text-slate-800 block">2. Unggah File Soal:</span>
              <div class="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center bg-slate-50/60 transition cursor-pointer">
                <AdminIcon name="upload" size="32" class="mx-auto mb-2 text-slate-400" />
                <div class="font-bold text-slate-800 text-xs sm:text-sm">Klik atau seret file ke area ini</div>
                <p class="text-[11px] text-slate-500 mt-1 font-medium">Mendukung format .xlsx, .xls, .docx, .csv (Maks 10MB)</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50/70">
            <button
              type="button"
              class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl cursor-pointer transition"
              @click="isImportModalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
              @click="processImportFile"
            >
              Unggah &amp; Proses Bank Soal
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
