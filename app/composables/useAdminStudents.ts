import { ref, reactive, computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

export interface StudentItem {
  id: string
  nisn: string
  nik: string
  name: string
  gender: 'L' | 'P'
  level: 'SMP' | 'SMK'
  className: string
  major?: string
  birthPlace: string
  birthDate: string
  address: string
  phone: string
  parentName: string
  parentPhone: string
  motherName: string
  rfidUid?: string
  hasRfid: boolean
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Nonaktif'
  attendancePct: number
  entryYear: string
  notes?: string
}

export const useAdminStudents = () => {
  const grade = useAdminGrade()

  const initialSMKStudents: StudentItem[] = [
    {
      id: 'SMK-2024001',
      nisn: '0078912345',
      nik: '3216061405080001',
      name: 'Ahmad Fauzi',
      gender: 'L',
      level: 'SMK',
      className: 'XII TKJ 1',
      major: 'TKJ',
      birthPlace: 'Bekasi',
      birthDate: '14 Mei 2008',
      address: 'Jl. Raya Ujung Harapan No. 45, Babelan, Kab. Bekasi',
      phone: '081234567890',
      parentName: 'H. Muhammad Ridwan',
      parentPhone: '082210823033',
      motherName: 'Siti Aminah',
      rfidUid: 'E280-1170-0000-021B',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 96,
      entryYear: '2024'
    },
    {
      id: 'SMK-2024002',
      nisn: '0078912346',
      nik: '3216062008080002',
      name: 'Siti Rahmawati',
      gender: 'P',
      level: 'SMK',
      className: 'XII AKL 1',
      major: 'AKL',
      birthPlace: 'Bekasi',
      birthDate: '20 Agustus 2008',
      address: 'Kp. Pulo Timaha RT 02/08, Babelan, Kab. Bekasi',
      phone: '085712345678',
      parentName: 'H. Abdul Hadi',
      parentPhone: '081398765432',
      motherName: 'Nurhayati',
      rfidUid: 'E280-1170-0000-021C',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 98,
      entryYear: '2024'
    },
    {
      id: 'SMK-2024003',
      nisn: '0078912347',
      nik: '3216061203080003',
      name: 'Bima Satria Pratama',
      gender: 'L',
      level: 'SMK',
      className: 'XI DKV 1',
      major: 'DKV',
      birthPlace: 'Jakarta',
      birthDate: '12 Maret 2009',
      address: 'Perumahan Villa Gading Harapan Blok AE, Babelan',
      phone: '087812345678',
      parentName: 'Bambang Sudarmono',
      parentPhone: '081287654321',
      motherName: 'Tri Wahyuni',
      rfidUid: 'E280-1170-0000-021D',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 92,
      entryYear: '2025'
    },
    {
      id: 'SMK-2024004',
      nisn: '0078912348',
      nik: '3216062509080004',
      name: 'Zahra Amelia Putri',
      gender: 'P',
      level: 'SMK',
      className: 'XI OTKP 1',
      major: 'OTKP',
      birthPlace: 'Bekasi',
      birthDate: '25 September 2009',
      address: 'Jl. Musholla Assalam RT 04/01, Kel. Bahagia, Babelan',
      phone: '089612345678',
      parentName: 'Drs. Subur Santoso',
      parentPhone: '085212345678',
      motherName: 'Fatimah Az-Zahra',
      rfidUid: 'E280-1170-0000-021E',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 95,
      entryYear: '2025'
    },
    {
      id: 'SMK-2024005',
      nisn: '0078912349',
      nik: '3216060101100005',
      name: 'Rizky Ramadhan',
      gender: 'L',
      level: 'SMK',
      className: 'X TBSM 1',
      major: 'TBSM',
      birthPlace: 'Bekasi',
      birthDate: '01 Januari 2010',
      address: 'Kp. Irian RT 01/05, Kebalen, Babelan',
      phone: '081312345678',
      parentName: 'Mulyadi',
      parentPhone: '081298761234',
      motherName: 'Rohimah',
      hasRfid: false,
      status: 'Aktif',
      attendancePct: 89,
      entryYear: '2026'
    },
    {
      id: 'SMK-2024006',
      nisn: '0078912350',
      nik: '3216061507100006',
      name: 'Faisal Ananta',
      gender: 'L',
      level: 'SMK',
      className: 'X TKR 1',
      major: 'TKR',
      birthPlace: 'Bekasi',
      birthDate: '15 Juli 2010',
      address: 'Jl. Raya Babelan No. 12, Kel. Bahagia, Babelan',
      phone: '082112345678',
      parentName: 'Agus Setiawan',
      parentPhone: '081345678901',
      motherName: 'Lestari',
      hasRfid: false,
      status: 'Aktif',
      attendancePct: 91,
      entryYear: '2026'
    }
  ]

  const initialSMPStudents: StudentItem[] = [
    {
      id: 'SMP-2024001',
      nisn: '0089123456',
      nik: '3216061004110001',
      name: 'Muhammad Farhan',
      gender: 'L',
      level: 'SMP',
      className: 'IX-A',
      birthPlace: 'Bekasi',
      birthDate: '10 April 2011',
      address: 'Jl. Ujung Harapan Musholla Assalam, Babelan, Bekasi',
      phone: '081288887771',
      parentName: 'Ustadz Syamsul Huda',
      parentPhone: '082210823033',
      motherName: 'Maryam',
      rfidUid: 'E280-1170-0000-010A',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 97,
      entryYear: '2024'
    },
    {
      id: 'SMP-2024002',
      nisn: '0089123457',
      nik: '3216061808110002',
      name: 'Aisyah Humaira',
      gender: 'P',
      level: 'SMP',
      className: 'IX-B',
      birthPlace: 'Bekasi',
      birthDate: '18 Agustus 2011',
      address: 'Kp. Penggarutan RT 03/06, Babelan, Kab. Bekasi',
      phone: '085788887772',
      parentName: 'H. Abdullah',
      parentPhone: '081388889999',
      motherName: 'Khadijah',
      rfidUid: 'E280-1170-0000-010B',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 99,
      entryYear: '2024'
    },
    {
      id: 'SMP-2024003',
      nisn: '0089123458',
      nik: '3216062202120003',
      name: 'Abdullah Azzam',
      gender: 'L',
      level: 'SMP',
      className: 'VIII-A',
      birthPlace: 'Jakarta',
      birthDate: '22 Februari 2012',
      address: 'Perumahan Graha Harapan Blok C, Babelan',
      phone: '087888887773',
      parentName: 'Ir. Hendra Wijaya',
      parentPhone: '081211112222',
      motherName: 'Sri Mulyani',
      rfidUid: 'E280-1170-0000-010C',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 94,
      entryYear: '2025'
    },
    {
      id: 'SMP-2024004',
      nisn: '0089123459',
      nik: '3216063006120004',
      name: 'Nabila Syakirah',
      gender: 'P',
      level: 'SMP',
      className: 'VIII-B',
      birthPlace: 'Bekasi',
      birthDate: '30 Juni 2012',
      address: 'Jl. Pertanian RT 02/03, Kel. Bahagia, Babelan',
      phone: '089688887774',
      parentName: 'H. Sofyan',
      parentPhone: '085233334444',
      motherName: 'Halimah',
      rfidUid: 'E280-1170-0000-010D',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 96,
      entryYear: '2025'
    },
    {
      id: 'SMP-2024005',
      nisn: '0089123460',
      nik: '3216061411130005',
      name: 'Fathir Ahmad Dani',
      gender: 'L',
      level: 'SMP',
      className: 'VII-A',
      birthPlace: 'Bekasi',
      birthDate: '14 November 2013',
      address: 'Kp. Muara Bakti RT 05/02, Babelan',
      phone: '081388887775',
      parentName: 'Zainal Abidin',
      parentPhone: '081355556666',
      motherName: 'Rohana',
      hasRfid: false,
      status: 'Aktif',
      attendancePct: 93,
      entryYear: '2026'
    }
  ]

  const students = ref<StudentItem[]>([...initialSMKStudents, ...initialSMPStudents])

  // Filter state
  const searchQuery = ref<string>('')
  const selectedClass = ref<string>('all')
  const selectedMajor = ref<string>('all')
  const selectedGender = ref<string>('all')
  const selectedStatus = ref<string>('all')
  const selectedRfid = ref<string>('all')

  // Modals & Active student
  const detailModalStudent = ref<StudentItem | null>(null)
  const isFormModalOpen = ref<boolean>(false)
  const formModalMode = ref<'add' | 'edit'>('add')
  const formStudent = ref<Partial<StudentItem>>({})
  const deleteConfirmStudent = ref<StudentItem | null>(null)

  // Filtered by current grade (SMP / SMK)
  const currentGradeStudents = computed<StudentItem[]>(() => {
    return students.value.filter(s => s.level === grade.value)
  })

  // Filter options based on grade
  const classOptions = computed<string[]>(() => {
    const list = currentGradeStudents.value.map(s => s.className)
    return Array.from(new Set(list))
  })

  const majorOptions = computed<string[]>(() => {
    if (grade.value === 'SMP') return []
    return ['TKJ', 'AKL', 'OTKP', 'DKV', 'TBSM', 'TKR']
  })

  // Filtered list
  const filteredStudents = computed<StudentItem[]>(() => {
    return currentGradeStudents.value.filter(s => {
      // Search
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        const matchName = s.name.toLowerCase().includes(q)
        const matchNisn = s.nisn.includes(q)
        const matchNik = s.nik.includes(q)
        const matchClass = s.className.toLowerCase().includes(q)
        const matchParent = s.parentName.toLowerCase().includes(q)
        if (!matchName && !matchNisn && !matchNik && !matchClass && !matchParent) return false
      }

      // Class
      if (selectedClass.value !== 'all' && s.className !== selectedClass.value) return false

      // Major (SMK only)
      if (grade.value === 'SMK' && selectedMajor.value !== 'all' && s.major !== selectedMajor.value) return false

      // Gender
      if (selectedGender.value !== 'all' && s.gender !== selectedGender.value) return false

      // Status
      if (selectedStatus.value !== 'all' && s.status !== selectedStatus.value) return false

      // RFID
      if (selectedRfid.value === 'yes' && !s.hasRfid) return false
      if (selectedRfid.value === 'no' && s.hasRfid) return false

      return true
    })
  })

  // Statistics
  const stats = computed(() => {
    const list = currentGradeStudents.value
    const total = list.length
    const boys = list.filter(s => s.gender === 'L').length
    const girls = list.filter(s => s.gender === 'P').length
    const rfidCount = list.filter(s => s.hasRfid).length
    const activeCount = list.filter(s => s.status === 'Aktif').length
    const rfidPct = total > 0 ? Math.round((rfidCount / total) * 100) : 0

    return {
      total,
      boys,
      girls,
      rfidCount,
      rfidPct,
      activeCount,
      totalClasses: classOptions.value.length
    }
  })

  // Actions
  const viewDetail = (student: StudentItem) => {
    detailModalStudent.value = student
  }

  const closeDetail = () => {
    detailModalStudent.value = null
  }

  const openAddModal = () => {
    formModalMode.value = 'add'
    formStudent.value = {
      level: grade.value,
      gender: 'L',
      status: 'Aktif',
      entryYear: '2026',
      attendancePct: 100,
      hasRfid: false
    }
    isFormModalOpen.value = true
  }

  const openEditModal = (student: StudentItem) => {
    formModalMode.value = 'edit'
    formStudent.value = JSON.parse(JSON.stringify(student))
    isFormModalOpen.value = true
  }

  const closeFormModal = () => {
    isFormModalOpen.value = false
    formStudent.value = {}
  }

  const saveStudent = (data: Partial<StudentItem>) => {
    if (formModalMode.value === 'add') {
      const newStudent: StudentItem = {
        id: `${grade.value}-${Date.now()}`,
        nisn: data.nisn || '',
        nik: data.nik || '',
        name: data.name || '',
        gender: data.gender || 'L',
        level: grade.value,
        className: data.className || (grade.value === 'SMP' ? 'VII-A' : 'X TKJ 1'),
        major: data.major,
        birthPlace: data.birthPlace || 'Bekasi',
        birthDate: data.birthDate || '',
        address: data.address || '',
        phone: data.phone || '',
        parentName: data.parentName || '',
        parentPhone: data.parentPhone || '',
        motherName: data.motherName || '',
        rfidUid: data.rfidUid,
        hasRfid: !!data.rfidUid,
        status: data.status || 'Aktif',
        attendancePct: data.attendancePct || 100,
        entryYear: data.entryYear || '2026'
      }
      students.value.unshift(newStudent)
    } else {
      const idx = students.value.findIndex(s => s.id === data.id)
      if (idx !== -1) {
        students.value[idx] = {
          ...students.value[idx],
          ...data,
          hasRfid: !!data.rfidUid
        } as StudentItem
      }
    }
    closeFormModal()
  }

  const confirmDelete = (student: StudentItem) => {
    deleteConfirmStudent.value = student
  }

  const cancelDelete = () => {
    deleteConfirmStudent.value = null
  }

  const executeDelete = () => {
    if (deleteConfirmStudent.value) {
      students.value = students.value.filter(s => s.id !== deleteConfirmStudent.value?.id)
      deleteConfirmStudent.value = null
    }
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedClass.value = 'all'
    selectedMajor.value = 'all'
    selectedGender.value = 'all'
    selectedStatus.value = 'all'
    selectedRfid.value = 'all'
  }

  return {
    grade,
    students,
    currentGradeStudents,
    filteredStudents,
    classOptions,
    majorOptions,
    searchQuery,
    selectedClass,
    selectedMajor,
    selectedGender,
    selectedStatus,
    selectedRfid,
    detailModalStudent,
    isFormModalOpen,
    formModalMode,
    formStudent,
    deleteConfirmStudent,
    stats,
    viewDetail,
    closeDetail,
    openAddModal,
    openEditModal,
    closeFormModal,
    saveStudent,
    confirmDelete,
    cancelDelete,
    executeDelete,
    resetFilters
  }
}
