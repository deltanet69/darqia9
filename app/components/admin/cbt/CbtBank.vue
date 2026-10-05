<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminCbtState, type BankSubjectPackage, type BankQuestionItem, type Difficulty } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'

const { bankPackages, allBankPackages, grade } = useAdminCbtState()

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
const singleEditPgOptions = ref<{ key: string; text: string }[]>([])
const singleEditSingleKey = ref('A')
const singleEditMultiKey = ref<string[]>([])

// Single Question Interactive Edit State
const singleEditInteractiveAnswerType = ref<'PG' | 'PG_Multi' | 'Isian'>('Isian')
const singleEditInteractiveOptions = ref<{ key: string; text: string }[]>([])
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
const formActiveStep = ref<'PG' | 'Isian' | 'Esai' | 'Interaktif'>('PG')

// Form Questions State per Format
interface FormPgQuestion {
  id: string
  text: string
  difficulty: Difficulty
  isMultiSelect: boolean
  options: { key: string; text: string }[]
  keySingle: string
  keyMulti: string[]
}

interface FormIsianQuestion {
  id: string
  text: string
  difficulty: Difficulty
  key: string
}

interface FormEssayQuestion {
  id: string
  text: string
  difficulty: Difficulty
  rubric: string
}

interface FormInteractiveQuestion {
  id: string
  text: string
  difficulty: Difficulty
  mediaType: 'audio' | 'video'
  mediaUrl: string
  mediaFileName?: string
  mediaFileSize?: string
  mediaCompressStatus?: string
  uploadMode: 'file' | 'url'
  isCompressing?: boolean
  interactiveAnswerType: 'PG' | 'PG_Multi' | 'Isian'
  options: { key: string; text: string }[]
  keySingle: string
  keyMulti: string[]
  keyIsian: string
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

const handleSingleEditFileUpload = (event: Event) => {
  if (!editingSingleQuestion.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
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

const saveSingleQuestionEdit = () => {
  if (!editingSingleQuestion.value || !selectedPackage.value) return

  const target = selectedPackage.value.questions.find(q => q.id === editingSingleQuestion.value!.id)
  if (target) {
    target.text = editingSingleQuestion.value.text
    target.difficulty = editingSingleQuestion.value.difficulty
    if (target.type === 'PG') {
      target.isMultiSelect = editingSingleQuestion.value.isMultiSelect
      target.options = [...singleEditPgOptions.value]
      target.key = editingSingleQuestion.value.isMultiSelect ? [...singleEditMultiKey.value] : singleEditSingleKey.value
    } else if (target.type === 'Isian') {
      target.key = editingSingleQuestion.value.key
    } else if (target.type === 'Esai') {
      target.rubric = editingSingleQuestion.value.rubric
      target.key = editingSingleQuestion.value.rubric || ''
    } else if (target.type === 'Interaktif') {
      target.mediaUrl = editingSingleQuestion.value.mediaUrl
      target.mediaType = editingSingleQuestion.value.mediaType
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
        target.key = singleEditInteractiveIsianKey.value.slice(0, 50)
        target.isMultiSelect = false
      }
    }
    showToast(`Butir soal #${target.number} berhasil diperbarui!`)
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

// Media Upload Handler for Interactive Builder Form
const handleInteractiveFileUpload = (inQ: FormInteractiveQuestion, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
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
      keyMulti: ['A']
    }
  ]

  formIsianList.value = [
    {
      id: `is-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      key: ''
    }
  ]

  formEssayList.value = [
    {
      id: `es-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      rubric: ''
    }
  ]

  formInteractiveList.value = [
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
      interactiveAnswerType: 'Isian',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      keySingle: 'A',
      keyMulti: ['A'],
      keyIsian: ''
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
    keyMulti: Array.isArray(q.key) ? [...q.key] : [q.key]
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
      keyMulti: ['A']
    }
  ]

  const isians = pkg.questions.filter(q => q.type === 'Isian')
  formIsianList.value = isians.length > 0 ? isians.map(q => ({
    id: q.id,
    text: q.text,
    difficulty: q.difficulty,
    key: typeof q.key === 'string' ? q.key : (q.key[0] || '')
  })) : [
    {
      id: `is-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      key: ''
    }
  ]

  const essays = pkg.questions.filter(q => q.type === 'Esai')
  formEssayList.value = essays.length > 0 ? essays.map(q => ({
    id: q.id,
    text: q.text,
    difficulty: q.difficulty,
    rubric: q.rubric || (typeof q.key === 'string' ? q.key : '')
  })) : [
    {
      id: `es-${Date.now()}-1`,
      text: '',
      difficulty: 'Sedang',
      rubric: ''
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
      mediaUrl: q.mediaUrl || '',
      mediaFileName: q.mediaFileName || (q.mediaUrl ? (q.mediaType === 'video' ? 'video_simulasi.mp4' : 'rekaman_audio.mp3') : ''),
      mediaFileSize: q.mediaFileSize || '1.2 MB',
      mediaCompressStatus: q.mediaCompressStatus || 'Opus 64kbps Terkompresi (Optimal)',
      uploadMode: (q.mediaFileName ? 'file' : 'url') as 'file' | 'url',
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
      keyIsian: typeof q.key === 'string' ? q.key : (q.key[0] || '')
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
      interactiveAnswerType: 'Isian',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      keySingle: 'A',
      keyMulti: ['A'],
      keyIsian: ''
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
    keyMulti: ['A']
  })
}

const removePgQuestion = (index: number) => {
  if (formPgList.value.length > 1) {
    formPgList.value.splice(index, 1)
  }
}

const addIsianQuestion = () => {
  formIsianList.value.push({
    id: `is-${Date.now()}-${formIsianList.value.length + 1}`,
    text: '',
    difficulty: 'Sedang',
    key: ''
  })
}

const removeIsianQuestion = (index: number) => {
  if (formIsianList.value.length > 1) {
    formIsianList.value.splice(index, 1)
  }
}

const addEssayQuestion = () => {
  formEssayList.value.push({
    id: `es-${Date.now()}-${formEssayList.value.length + 1}`,
    text: '',
    difficulty: 'Sedang',
    rubric: ''
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
    mediaType: 'audio',
    mediaUrl: 'https://actions.google.com/sounds/v1/ambient/office_ambience.ogg',
    mediaFileName: 'rekaman_audio.mp3',
    mediaFileSize: '1.2 MB',
    mediaCompressStatus: 'Opus 64kbps Terkompresi (Optimal)',
    uploadMode: 'file',
    isCompressing: false,
    interactiveAnswerType: 'Isian',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' }
    ],
    keySingle: 'A',
    keyMulti: ['A'],
    keyIsian: ''
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
const saveFullSubjectPackage = () => {
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
      options: q.options.filter(o => o.text.trim()),
      key: q.isMultiSelect ? [...q.keyMulti] : q.keySingle
    })
  })

  // 2. Isian
  const validIsians = formIsianList.value.filter(q => q.text.trim())
  validIsians.forEach(q => {
    compiledQuestions.push({
      id: q.id,
      number: qNum++,
      type: 'Isian',
      difficulty: q.difficulty,
      text: q.text,
      key: q.key.slice(0, 50)
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
      rubric: q.rubric
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
        finalKey = q.keyIsian.slice(0, 50)
      }

      compiledQuestions.push({
        id: q.id,
        number: qNum++,
        type: 'Interaktif',
        difficulty: q.difficulty,
        text: q.text,
        mediaType: q.mediaType,
        mediaUrl: q.mediaUrl,
        mediaFileName: q.mediaFileName,
        mediaFileSize: q.mediaFileSize,
        mediaCompressStatus: q.mediaCompressStatus || 'Opus 64kbps Terkompresi (Optimal)',
        interactiveAnswerType: q.interactiveAnswerType,
        isMultiSelect: q.interactiveAnswerType === 'PG_Multi',
        options: (q.interactiveAnswerType === 'PG' || q.interactiveAnswerType === 'PG_Multi')
          ? q.options.filter(o => o.text.trim())
          : undefined,
        key: finalKey
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
    }
    showToast(`Paket Bank Soal ${formSubject.value} berhasil diperbarui!`)
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
    showToast(`Paket Bank Soal ${formSubject.value} berhasil dibuat dan disimpan!`)
  }

  selectedClass.value = formClass.value
  viewMode.value = 'detail'
}

const deletePackage = (pkgId: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus seluruh paket bank soal mata pelajaran ini?')) {
    allBankPackages.value = allBankPackages.value.filter(p => p.id !== pkgId)
    showToast('Paket bank soal berhasil dihapus.')
    viewMode.value = 'subjects'
  }
}

const deleteSingleQuestion = (questionId: string) => {
  if (selectedPackage.value && confirm('Hapus butir soal ini dari paket?')) {
    selectedPackage.value.questions = selectedPackage.value.questions.filter(q => q.id !== questionId)
    selectedPackage.value.questions.forEach((q, idx) => {
      q.number = idx + 1
    })
    showToast('Butir soal berhasil dihapus.')
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
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              Multi-Format
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ bankPackages.length + 6 }} Paket</div>
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
            <span class="text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              {{ grade }}
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ activeClasses.length }} Rombel</div>
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
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              Kurikulum
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ subjectOptions.length }} Mapel</div>
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
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm font-mono">
              Fitur Unggulan
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">4 Format</div>
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
              <span class="text-blue-600 font-extrabold">{{ selectedClass }}</span>
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
                <td class="px-5 py-4 text-center font-mono font-extrabold text-slate-900 text-sm">
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
              <span class="font-mono text-xs font-extrabold text-white bg-slate-900 px-2.5 py-0.5 rounded-md">
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

          <!-- Question Prompt Text -->
          <div class="text-sm font-semibold text-slate-900 leading-relaxed">
            {{ q.text }}
          </div>

          <!-- If Interaktif: Media Player Preview (Violet theme) -->
          <div v-if="q.type === 'Interaktif'" class="p-3.5 bg-violet-50/60 rounded-xl border border-violet-200/80 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-violet-900 flex-wrap gap-2">
              <span class="flex items-center gap-1.5">
                <AdminIcon name="spark" size="14" class="text-violet-600" />
                <span>Lampiran Media Interaktif ({{ q.mediaType === 'video' ? 'VIDEO SIMULASI' : 'AUDIO LISTENING' }})</span>
                <span v-if="q.mediaFileName" class="font-normal text-violet-700"> &bull; {{ q.mediaFileName }}</span>
              </span>
              <span class="text-[10px] font-semibold text-violet-700 bg-white px-2.5 py-0.5 rounded-full border border-violet-200 font-mono shadow-2xs">
                {{ q.mediaCompressStatus || 'Optimal' }}
              </span>
            </div>
            <audio v-if="q.mediaType === 'audio' && q.mediaUrl" :src="q.mediaUrl" controls class="w-full h-8 mt-1" />
            <video v-else-if="q.mediaType === 'video' && q.mediaUrl" :src="q.mediaUrl" controls class="w-full max-h-56 rounded-xl bg-black mt-1" />
          </div>

          <!-- CLEAN CONCISE HINT JAWABAN BENAR SAJA -->
          <div class="pt-1">
            <!-- For PG or Interaktif Single Selection: Show only the correct answer text -->
            <div v-if="(q.type === 'PG' && !q.isMultiSelect) || (q.type === 'Interaktif' && q.interactiveAnswerType === 'PG' && !Array.isArray(q.key))" class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs">
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

            <!-- For PG Kompleks or Interaktif Multi-Select -->
            <div v-else-if="(q.type === 'PG' && q.isMultiSelect) || (q.type === 'Interaktif' && (q.interactiveAnswerType === 'PG_Multi' || Array.isArray(q.key)))" class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs">
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

            <!-- For Isian or Interaktif Isian: Short Answer Key -->
            <div v-else-if="q.type === 'Isian' || (q.type === 'Interaktif' && (!q.interactiveAnswerType || q.interactiveAnswerType === 'Isian'))" class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs">
              <span class="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                &check;
              </span>
              <div class="text-emerald-950 font-medium">
                <strong class="font-bold text-emerald-900">Kunci Jawaban Singkat Tepat:</strong>
                <span class="ml-1 font-mono font-bold">{{ q.key }}</span>
              </div>
            </div>

            <!-- For Essay: Rubric Guide -->
            <div v-else-if="q.type === 'Esai'" class="p-2.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs space-y-0.5">
              <span class="font-bold text-purple-900 block">Panduan Rubrik Penilaian Guru:</span>
              <p class="text-purple-950 leading-relaxed font-medium">{{ q.rubric || q.key }}</p>
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
                <span class="px-2.5 py-0.5 rounded-md text-xs font-mono font-extrabold text-white bg-slate-900">
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
            <!-- Difficulty selector -->
            <div>
              <label class="block font-bold text-slate-700 mb-1.5">Tingkat Kesulitan</label>
              <select v-model="editingSingleQuestion.difficulty" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sukar">Sukar</option>
              </select>
            </div>

            <!-- Question text -->
            <div>
              <label class="block font-bold text-slate-700 mb-1.5">Teks Pertanyaan</label>
              <textarea
                v-model="editingSingleQuestion.text"
                rows="3"
                class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <!-- If PG: Options & Key Editor -->
            <div v-if="editingSingleQuestion.type === 'PG'" class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-700">Pilihan Jawaban &amp; Kunci Benar</label>
                <label class="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input v-model="editingSingleQuestion.isMultiSelect" type="checkbox" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span>Centang Multi-Select</span>
                </label>
              </div>

              <div class="space-y-2">
                <div
                  v-for="opt in singleEditPgOptions"
                  :key="opt.key"
                  class="flex items-center gap-2.5 p-2 rounded-xl border transition"
                  :class="(editingSingleQuestion.isMultiSelect ? singleEditMultiKey.includes(opt.key) : singleEditSingleKey === opt.key)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/50'"
                >
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
                  />
                </div>
              </div>
            </div>

            <!-- If Isian -->
            <div v-if="editingSingleQuestion.type === 'Isian'">
              <label class="block font-bold text-slate-700 mb-1.5">Kunci Jawaban Singkat (Maks 50 Karakter)</label>
              <input
                v-model="editingSingleQuestion.key"
                maxlength="50"
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <!-- If Essay -->
            <div v-if="editingSingleQuestion.type === 'Esai'">
              <label class="block font-bold text-slate-700 mb-1.5">Panduan Rubrik Penilaian Guru</label>
              <textarea
                v-model="editingSingleQuestion.rubric"
                rows="3"
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <!-- If Interaktif -->
            <div v-if="editingSingleQuestion.type === 'Interaktif'" class="space-y-4">
              <!-- Media File Upload / URL Section -->
              <div class="p-3.5 bg-violet-50/60 rounded-xl border border-violet-200/80 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <label class="font-bold text-violet-950 flex items-center gap-1.5">
                    <AdminIcon name="spark" size="14" class="text-violet-600" />
                    <span>Lampiran Media Interaktif (Maks 10 MB)</span>
                  </label>
                  
                  <div class="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-violet-200 text-xs font-bold">
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="singleEditMediaUploadMode === 'file' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="singleEditMediaUploadMode = 'file'"
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="singleEditMediaUploadMode === 'url' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="singleEditMediaUploadMode = 'url'"
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                <!-- Mode 1: File Upload with 10MB check & compression badge -->
                <div v-if="singleEditMediaUploadMode === 'file'" class="space-y-2">
                  <div class="relative border-2 border-dashed border-violet-300 hover:border-violet-500 bg-white rounded-xl p-3 text-center transition cursor-pointer group">
                    <input
                      type="file"
                      accept="audio/*,video/*,.mp3,.ogg,.wav,.m4a,.mp4,.webm"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      @change="handleSingleEditFileUpload($event)"
                    />
                    <div class="flex flex-col items-center justify-center">
                      <AdminIcon name="upload" size="20" class="text-violet-500 group-hover:scale-110 transition mb-1" />
                      <div class="text-xs font-bold text-slate-800">
                        {{ editingSingleQuestion.mediaFileName ? editingSingleQuestion.mediaFileName : 'Pilih atau seret file audio/video' }}
                      </div>
                      <p class="text-[10.5px] text-slate-500 mt-0.5">
                        Mendukung MP3, OGG, WAV, M4A, MP4, WebM (Maks 10 MB)
                      </p>
                    </div>
                  </div>

                  <div v-if="editingSingleQuestion.mediaFileName || editingSingleQuestion.mediaCompressStatus" class="flex items-center justify-between p-2 bg-white rounded-lg border border-violet-200 text-xs">
                    <div class="flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        &check;
                      </span>
                      <div>
                        <div class="font-bold text-slate-900">{{ editingSingleQuestion.mediaFileName || 'File Media' }}</div>
                        <div class="text-[10px] text-emerald-600 font-semibold">{{ editingSingleQuestion.mediaCompressStatus }}</div>
                      </div>
                    </div>
                    <span class="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded text-[10px]">
                      {{ editingSingleQuestion.mediaFileSize || 'Optimal' }}
                    </span>
                  </div>
                </div>

                <!-- Mode 2: Direct URL Input -->
                <div v-else class="space-y-2">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1">Tipe Media</label>
                      <select v-model="editingSingleQuestion.mediaType" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                        <option value="audio">Audio Listening</option>
                        <option value="video">Video Simulasi</option>
                      </select>
                    </div>
                    <div>
                      <label class="block font-bold text-slate-700 mb-1">Direct URL Media</label>
                      <input
                        v-model="editingSingleQuestion.mediaUrl"
                        class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                        placeholder="https://domain.com/audio.mp3"
                      />
                    </div>
                  </div>
                </div>

                <!-- Media Preview Player -->
                <div v-if="editingSingleQuestion.mediaUrl" class="pt-1">
                  <div class="text-[10.5px] font-bold text-violet-900 mb-1">Preview Pemutaran:</div>
                  <audio v-if="editingSingleQuestion.mediaType === 'audio'" :src="editingSingleQuestion.mediaUrl" controls class="w-full h-8" />
                  <video v-else-if="editingSingleQuestion.mediaType === 'video'" :src="editingSingleQuestion.mediaUrl" controls class="w-full max-h-40 rounded-xl bg-black" />
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
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md transition cursor-pointer"
                      :class="singleEditInteractiveAnswerType === 'Isian' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="singleEditInteractiveAnswerType = 'Isian'"
                    >
                      Jawaban Singkat
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
                    <span class="font-mono text-[10px] text-slate-400">{{ (singleEditInteractiveIsianKey || '').length }}/50 Karakter</span>
                  </div>
                  <input
                    v-model="singleEditInteractiveIsianKey"
                    maxlength="50"
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
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-6 shadow-xs max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              {{ editingPackageId ? 'Edit Paket Bank Soal' : 'Buat Paket Bank Soal Baru' }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5 font-medium">
              Kelola seluruh format soal (Pilihan Ganda, Jawaban Singkat, Essay, Interaktif) dalam 1 paket mata pelajaran
            </p>
          </div>
          <button
            class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            type="button"
            @click="viewMode = selectedPackage ? 'detail' : 'classes'"
          >
            Batal
          </button>
        </div>

        <!-- Meta Selector Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Pilih Rombel / Kelas</label>
            <select v-model="formClass" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500">
              <option v-for="c in activeClasses" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
            <select v-model="formSubject" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500">
              <option v-for="s in subjectOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Tingkat Kesulitan Umum</label>
            <select v-model="formDifficulty" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500">
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sukar">Sukar</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Guru Penyusun / Pengampu</label>
            <input
              v-model="formTeacherName"
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder="Nama Guru"
            />
          </div>
        </div>

        <!-- Format Multi-Step Pills Header -->
        <div class="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              :class="formActiveStep === 'PG'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              @click="formActiveStep = 'PG'"
            >
              <span>1. Pilihan Ganda</span>
              <span class="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-mono">
                {{ formPgList.length }}
              </span>
            </button>

            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              :class="formActiveStep === 'Isian'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              @click="formActiveStep = 'Isian'"
            >
              <span>2. Jawaban Singkat</span>
              <span class="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-mono">
                {{ formIsianList.length }}
              </span>
            </button>

            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              :class="formActiveStep === 'Esai'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              @click="formActiveStep = 'Esai'"
            >
              <span>3. Essay</span>
              <span class="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-mono">
                {{ formEssayList.length }}
              </span>
            </button>

            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              :class="formActiveStep === 'Interaktif'
                ? 'bg-violet-600 text-white shadow-xs'
                : formHasInteractive
                  ? 'bg-violet-50 text-violet-700 border border-violet-200'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
              @click="formActiveStep = 'Interaktif'"
            >
              <span>4. Interaktif</span>
              <span v-if="formHasInteractive" class="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-mono">
                {{ formInteractiveList.length }}
              </span>
            </button>
          </div>

          <!-- Switcher Interaktif (Violet) -->
          <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <input
              v-model="formHasInteractive"
              type="checkbox"
              class="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
            />
            <span>Aktifkan Soal Interaktif (Audio/Video)</span>
          </label>
        </div>

        <!-- STEP 1: PILIHAN GANDA BUILDER -->
        <div v-if="formActiveStep === 'PG'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-slate-900">Daftar Butir Soal Pilihan Ganda ({{ formPgList.length }} Soal)</h4>
          </div>

          <div class="space-y-5">
            <div
              v-for="(pg, qIdx) in formPgList"
              :key="pg.id"
              class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3.5"
            >
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                  Pilihan Ganda #{{ qIdx + 1 }}
                </span>

                <div class="flex items-center gap-3">
                  <label class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      v-model="pg.isMultiSelect"
                      type="checkbox"
                      class="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span>Multi-Select</span>
                  </label>

                  <button
                    v-if="formPgList.length > 1"
                    class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    type="button"
                    @click="removePgQuestion(qIdx)"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <!-- Question Text -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Teks Pertanyaan Soal #{{ qIdx + 1 }}</label>
                <textarea
                  v-model="pg.text"
                  rows="2"
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  :placeholder="`Tuliskan butir soal pilihan ganda nomor ${qIdx + 1}...`"
                />
              </div>

              <!-- Options A-E -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-700">
                  Pilihan Opsi &amp; {{ pg.isMultiSelect ? 'Centang Kunci Benar (Multi)' : 'Pilih 1 Kunci Benar' }}
                </label>

                <div
                  v-for="(opt, oIdx) in pg.options"
                  :key="opt.key"
                  class="flex items-center gap-2.5 p-2 rounded-xl border transition"
                  :class="(pg.isMultiSelect ? pg.keyMulti.includes(opt.key) : pg.keySingle === opt.key)
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/50'"
                >
                  <input
                    v-if="!pg.isMultiSelect"
                    type="radio"
                    :name="`pg-key-${pg.id}`"
                    :checked="pg.keySingle === opt.key"
                    class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 ml-1.5 cursor-pointer"
                    @change="pg.keySingle = opt.key"
                  />
                  <input
                    v-else
                    type="checkbox"
                    :checked="pg.keyMulti.includes(opt.key)"
                    class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 ml-1.5 cursor-pointer"
                    @change="toggleMultiSelectOption(pg, opt.key)"
                  />

                  <span class="font-mono text-xs font-bold text-slate-600 w-5">{{ opt.key }}.</span>
                  <input
                    v-model="opt.text"
                    class="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    :placeholder="`Isi teks jawaban pilihan ${opt.key}...`"
                  />
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
          </div>
        </div>

        <!-- STEP 2: JAWABAN SINGKAT BUILDER -->
        <div v-if="formActiveStep === 'Isian'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-slate-900">Daftar Soal Jawaban Singkat ({{ formIsianList.length }} Soal)</h4>
              <p class="text-[11px] text-slate-500">Maksimum panjang kunci jawaban adalah 50 karakter.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(isQ, qIdx) in formIsianList"
              :key="isQ.id"
              class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                  Jawaban Singkat #{{ qIdx + 1 }}
                </span>
                <button
                  v-if="formIsianList.length > 1"
                  class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  type="button"
                  @click="removeIsianQuestion(qIdx)"
                >
                  Hapus
                </button>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Teks Pertanyaan Soal #{{ qIdx + 1 }}</label>
                <textarea
                  v-model="isQ.text"
                  rows="2"
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  placeholder="Tuliskan pertanyaan jawaban singkat..."
                />
              </div>

              <div>
                <div class="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Kunci Jawaban Tepat</span>
                  <span class="font-mono text-[11px] text-slate-400">{{ (isQ.key || '').length }}/50 Karakter</span>
                </div>
                <input
                  v-model="isQ.key"
                  maxlength="50"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  placeholder="Contoh: Cascading Style Sheets"
                />
              </div>
            </div>

            <!-- BUTTON TAMBAH SOAL ISIAN DI BAWAH LIST -->
            <button
              class="w-full py-3.5 bg-white hover:bg-emerald-50/60 text-emerald-600 hover:text-emerald-700 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              type="button"
              @click="addIsianQuestion"
            >
              <AdminIcon name="plus" size="16" />
              <span>Tambah Butir Soal Isian Baru (#{{ formIsianList.length + 1 }})</span>
            </button>
          </div>
        </div>

        <!-- STEP 3: ESSAY BUILDER -->
        <div v-if="formActiveStep === 'Esai'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-slate-900">Daftar Soal Essay / Uraian ({{ formEssayList.length }} Soal)</h4>
              <p class="text-[11px] text-slate-500">Sertakan rubrik penilaian kunci jawaban (minimal 20 karakter).</p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(esQ, qIdx) in formEssayList"
              :key="esQ.id"
              class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="font-mono text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
                  Essay #{{ qIdx + 1 }}
                </span>
                <button
                  v-if="formEssayList.length > 1"
                  class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  type="button"
                  @click="removeEssayQuestion(qIdx)"
                >
                  Hapus
                </button>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Teks Pertanyaan Essay #{{ qIdx + 1 }}</label>
                <textarea
                  v-model="esQ.text"
                  rows="2"
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  placeholder="Tuliskan pertanyaan uraian mendalam..."
                />
              </div>

              <div>
                <div class="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Panduan Rubrik &amp; Kunci Jawaban Benar Guru</span>
                  <span class="font-mono text-[11px] text-slate-400">Min. 20 Karakter</span>
                </div>
                <textarea
                  v-model="esQ.rubric"
                  rows="2"
                  class="w-full p-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-xs sm:text-sm text-purple-950 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                  placeholder="Tuliskan poin-poin kunci yang wajib dijawab siswa untuk memperoleh nilai sempurna..."
                />
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
          </div>
        </div>

        <!-- STEP 4: INTERAKTIF BUILDER (VIOLET THEMED) -->
        <div v-if="formActiveStep === 'Interaktif'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-slate-900">Soal Interaktif Audio / Video</h4>
              <p class="text-[11px] text-slate-500">File media otomatis terkompresi dengan performa tinggi &amp; hemat space (Maksimum file upload: 10 MB).</p>
            </div>
          </div>

          <div v-if="!formHasInteractive" class="p-8 text-center bg-violet-50/30 rounded-2xl border border-dashed border-violet-200">
            <AdminIcon name="spark" size="28" class="mx-auto mb-2 text-violet-500" />
            <h5 class="text-sm font-bold text-slate-800">Format Soal Interaktif Nonaktif</h5>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Centang opsi <strong>"Aktifkan Soal Interaktif"</strong> pada bagian atas bila mata pelajaran ini membutuhkan lampiran rekaman suara atau video simulasi.
            </p>
            <button
              class="mt-3 px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-violet-700 transition cursor-pointer"
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
              class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4"
            >
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-extrabold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded">
                    Interaktif #{{ qIdx + 1 }}
                  </span>
                  <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {{ inQ.mediaType === 'audio' ? 'Audio Listening' : 'Video Simulasi' }}
                  </span>
                </div>
                <button
                  v-if="formInteractiveList.length > 1"
                  class="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  type="button"
                  @click="removeInteractiveQuestion(qIdx)"
                >
                  Hapus
                </button>
              </div>

              <!-- Media Upload & Compression Panel -->
              <div class="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <span class="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                    <AdminIcon name="spark" size="14" class="text-violet-600" />
                    <span>Upload &amp; Pengaturan Media (Maks 10 MB)</span>
                  </span>
                  <!-- Switcher Upload File vs Input URL -->
                  <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-violet-200 text-xs">
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                      :class="inQ.uploadMode === 'file' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.uploadMode = 'file'"
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                      :class="inQ.uploadMode === 'url' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.uploadMode = 'url'"
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                <!-- Mode 1: Upload File with 10MB limit and compression indicator -->
                <div v-if="inQ.uploadMode === 'file'" class="space-y-2.5">
                  <div class="relative border-2 border-dashed border-violet-300 hover:border-violet-500 bg-white rounded-xl p-4 text-center transition cursor-pointer group">
                    <input
                      type="file"
                      accept="audio/*,video/*,.mp3,.ogg,.wav,.m4a,.mp4,.webm"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      @change="handleInteractiveFileUpload(inQ, $event)"
                    />
                    <div class="flex flex-col items-center justify-center">
                      <AdminIcon name="upload" size="24" class="text-violet-500 group-hover:scale-110 transition mb-1.5" />
                      <div class="text-xs font-bold text-slate-800">
                        {{ inQ.mediaFileName ? inQ.mediaFileName : 'Pilih atau seret file audio/video' }}
                      </div>
                      <p class="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Mendukung MP3, OGG, WAV, M4A, MP4, WebM (Maksimum 10 MB per file)
                      </p>
                    </div>
                  </div>

                  <!-- Compression Status Badge -->
                  <div v-if="inQ.mediaFileName || inQ.mediaCompressStatus" class="flex items-center justify-between p-2.5 bg-white rounded-xl border border-violet-200 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        &check;
                      </span>
                      <div>
                        <div class="font-bold text-slate-900">{{ inQ.mediaFileName || 'File Media' }}</div>
                        <div class="text-[11px] text-emerald-600 font-semibold">{{ inQ.mediaCompressStatus }}</div>
                      </div>
                    </div>
                    <span class="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded text-[11px]">
                      {{ inQ.mediaFileSize || 'Optimal' }}
                    </span>
                  </div>
                </div>

                <!-- Mode 2: Direct URL Input -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Tipe Media</label>
                    <select v-model="inQ.mediaType" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                      <option value="audio">Rekaman Audio (Listening / Suara)</option>
                      <option value="video">Video Simulasi</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Direct URL Media</label>
                    <input
                      v-model="inQ.mediaUrl"
                      class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                      placeholder="https://actions.google.com/sounds/v1/..."
                    />
                  </div>
                </div>

                <!-- Media Preview Player -->
                <div v-if="inQ.mediaUrl" class="pt-1">
                  <div class="text-[11px] font-bold text-violet-900 mb-1">Preview Pemutaran Media:</div>
                  <audio v-if="inQ.mediaType === 'audio'" :src="inQ.mediaUrl" controls class="w-full h-8" />
                  <video v-else-if="inQ.mediaType === 'video'" :src="inQ.mediaUrl" controls class="w-full max-h-48 rounded-xl bg-black" />
                </div>
              </div>

              <!-- Question Prompt Text -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Teks Pertanyaan Soal Interaktif #{{ qIdx + 1 }}</label>
                <textarea
                  v-model="inQ.text"
                  rows="2"
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-violet-500 focus:outline-none transition"
                  placeholder="Dengarkan rekaman instruksi berikut dan tentukan..."
                />
              </div>

              <!-- 3-WAY ANSWER FORMAT SELECTOR (Selection / Multi-Selection / Jawaban Singkat) -->
              <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <label class="block text-xs font-bold text-slate-800">Format Kunci Jawaban Soal Interaktif</label>
                  
                  <!-- 3 Switcher Buttons -->
                  <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg transition cursor-pointer"
                      :class="inQ.interactiveAnswerType === 'PG' ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.interactiveAnswerType = 'PG'"
                    >
                      Pilihan Ganda (Single)
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg transition cursor-pointer"
                      :class="inQ.interactiveAnswerType === 'PG_Multi' ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.interactiveAnswerType = 'PG_Multi'"
                    >
                      PG Kompleks (Multi-Select)
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-lg transition cursor-pointer"
                      :class="inQ.interactiveAnswerType === 'Isian' ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                      @click="inQ.interactiveAnswerType = 'Isian'"
                    >
                      Jawaban Singkat (Isian)
                    </button>
                  </div>
                </div>

                <!-- Answer Format 1: Single Selection PG -->
                <div v-if="inQ.interactiveAnswerType === 'PG'" class="space-y-2">
                  <span class="text-[11px] font-semibold text-slate-500">Pilih 1 opsi yang menjadi kunci jawaban benar:</span>
                  <div
                    v-for="opt in inQ.options"
                    :key="opt.key"
                    class="flex items-center gap-2.5 p-2 rounded-xl border transition"
                    :class="inQ.keySingle === opt.key ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-white'"
                  >
                    <input
                      type="radio"
                      :name="`inQ-single-${inQ.id}`"
                      :checked="inQ.keySingle === opt.key"
                      class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 ml-1.5 cursor-pointer"
                      @change="inQ.keySingle = opt.key"
                    />
                    <span class="font-mono text-xs font-bold text-slate-600 w-5">{{ opt.key }}.</span>
                    <input
                      v-model="opt.text"
                      class="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-violet-500"
                      :placeholder="`Isi pilihan jawaban ${opt.key}...`"
                    />
                  </div>
                </div>

                <!-- Answer Format 2: Multi-Selection PG -->
                <div v-else-if="inQ.interactiveAnswerType === 'PG_Multi'" class="space-y-2">
                  <span class="text-[11px] font-semibold text-slate-500">Centang opsi-opsi yang benar (bisa lebih dari satu):</span>
                  <div
                    v-for="opt in inQ.options"
                    :key="opt.key"
                    class="flex items-center gap-2.5 p-2 rounded-xl border transition"
                    :class="inQ.keyMulti.includes(opt.key) ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-white'"
                  >
                    <input
                      type="checkbox"
                      :checked="inQ.keyMulti.includes(opt.key)"
                      class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 ml-1.5 cursor-pointer"
                      @change="toggleInteractiveMultiOption(inQ, opt.key)"
                    />
                    <span class="font-mono text-xs font-bold text-slate-600 w-5">{{ opt.key }}.</span>
                    <input
                      v-model="opt.text"
                      class="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-violet-500"
                      :placeholder="`Isi pilihan jawaban ${opt.key}...`"
                    />
                  </div>
                </div>

                <!-- Answer Format 3: Jawaban Singkat -->
                <div v-else class="space-y-1.5">
                  <div class="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Kunci Jawaban Singkat Tepat</span>
                    <span class="font-mono text-[11px] text-slate-400">{{ (inQ.keyIsian || '').length }}/50 Karakter</span>
                  </div>
                  <input
                    v-model="inQ.keyIsian"
                    maxlength="50"
                    class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:border-violet-500 focus:outline-none transition"
                    placeholder="Contoh: Port 443"
                  />
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
              class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              type="button"
              @click="saveFullSubjectPackage"
            >
              Simpan Seluruh Paket Bank Soal
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
                Gunakan file template berikut untuk mempermudah penulisan soal pilihan ganda, isian singkat, dan uraian esai:
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
