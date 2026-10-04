import { ref, reactive, computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

export interface StudentItem {
  // Data Pokok Siswa
  id: string
  nis: string
  nisn: string
  nik: string
  noKk?: string
  name: string
  gender: 'L' | 'P'
  level: 'SMP' | 'SMK'
  className: string
  major?: string // TKJ, TSM/TBSM, AK/AKL, DKV, OTKP, TKR
  birthPlace: string
  birthDate: string
  religion: string
  
  // Alamat & Tempat Tinggal
  address: string
  rt?: string
  rw?: string
  village?: string // Kelurahan / Desa
  district?: string // Kecamatan
  city?: string // Kota / Kabupaten
  livingType?: string // Bersama orang tua / Wali / Asrama
  transportation?: string // Sepeda motor / Sepeda / Jalan kaki / Angkutan umum / Antar jemput
  phone?: string // HP / WA Siswa
  
  // Data Ayah
  fatherName: string
  fatherBirthYear?: string
  fatherEducation?: string
  fatherJob?: string
  fatherIncome?: string
  fatherNik?: string
  fatherPhone?: string
  
  // Data Ibu
  motherName: string
  motherBirthYear?: string
  motherEducation?: string
  motherJob?: string
  motherIncome?: string
  motherNik?: string
  motherPhone?: string
  
  // Riwayat Pendidikan & Fisik
  prevSchool?: string // Sekolah Asal (e.g. SMP IT BINA CENDEKIA ASSALAM, SMPN 21 BEKASI, etc.)
  prevDiplomaNo?: string // No Seri Ijazah Sebelumnya
  birthOrder?: number // Anak ke-berapa
  siblingsCount?: number // Jumlah Saudara Kandung
  weight?: number // Berat Badan (kg)
  height?: number // Tinggi Badan (cm)
  headCircumference?: number // Lingkar Kepala (cm)
  distanceKm?: number // Jarak Rumah ke Sekolah (KM)
  hobby?: string
  ambition?: string // Cita-cita
  entryDate?: string // Tanggal Masuk
  
  // RFID & Status Sistem
  rfidUid?: string
  hasRfid: boolean
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Nonaktif'
  attendancePct: number
  entryYear: string
  notes?: string
}

export const useAdminStudents = () => {
  const grade = useAdminGrade()

  // Real sample data langsung dari official spreadsheet sekolah
  const officialSMKStudents: StudentItem[] = [
    {
      id: 'SMK-242510001',
      nis: '242510001',
      nisn: '3095100998',
      nik: '3216020103090009',
      noKk: '3216021203090001',
      name: 'A. SAUQI NUR KAMIL',
      gender: 'L',
      level: 'SMK',
      className: 'XII. TKJ 2',
      major: 'TKJ',
      birthPlace: 'BEKASI',
      birthDate: '2009-03-01',
      religion: 'Islam',
      address: 'AL BARKAH',
      rt: '06',
      rw: '05',
      village: 'Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Angkutan umum/bus/pete-pete',
      phone: '081299887701',
      fatherName: 'H. RIDWAN KAMIL',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Buruh',
      fatherIncome: '< Rp1.000.000',
      fatherNik: '3216021405800001',
      fatherPhone: '082210823033',
      motherName: 'NURJANAH',
      motherBirthYear: '1982',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Tidak bekerja',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3216024711820001',
      motherPhone: '082210823033',
      prevSchool: 'SMP IT BINA CENDEKIA ASSALAM (BCA)',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 55,
      height: 160,
      distanceKm: 1,
      rfidUid: 'E280-1170-0000-021B',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 96,
      entryYear: '2024',
      entryDate: '2024-07-15'
    },
    {
      id: 'SMK-2526011001',
      nis: '2526011001',
      nisn: '3109254013',
      nik: '3216020911100004',
      noKk: '3216021203090002',
      name: 'ABDU HAFIDL AHNAF BAIDHO',
      gender: 'L',
      level: 'SMK',
      className: 'XI. TSM 1',
      major: 'TBSM',
      birthPlace: 'BEKASI',
      birthDate: '2010-11-09',
      religion: 'Islam',
      address: 'UJUNG HARAPAN RT. 006/ 015',
      rt: '07',
      rw: '11',
      village: 'Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Sepeda',
      phone: '085711223344',
      fatherName: 'GIMAN ANDRIYANTO',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Wiraswasta',
      fatherIncome: '< Rp1.000.000',
      fatherNik: '3216021405800002',
      fatherPhone: '081398765432',
      motherName: 'AWIT',
      motherBirthYear: '1984',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Tidak bekerja',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3216024711840002',
      motherPhone: '081398765432',
      prevSchool: 'SMP IT BINA CENDEKIA ASSALAM (BCA)',
      birthOrder: 3,
      siblingsCount: 3,
      weight: 55,
      height: 160,
      distanceKm: 1,
      rfidUid: 'E280-1170-0000-021C',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 98,
      entryYear: '2025',
      entryDate: '2025-07-14'
    },
    {
      id: 'SMK-26270120117',
      nis: '26270120117',
      nisn: '0103402655',
      nik: '3275030806100007',
      noKk: '3275031203090003',
      name: 'ABDUL KHODIR JAELANI',
      gender: 'L',
      level: 'SMK',
      className: 'X. TKJ 3',
      major: 'TKJ',
      birthPlace: 'Bekasi',
      birthDate: '2010-06-08',
      religion: 'Islam',
      address: 'Taman Wisma Asri Blok T 27 No. 37',
      rt: '01',
      rw: '30',
      village: 'Teluk Pucung',
      district: 'Kec. Bekasi Utara',
      city: 'Kota Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Sepeda motor',
      phone: '087811223344',
      fatherName: 'HERI YULI HANDOKO',
      fatherBirthYear: '1980',
      fatherEducation: 'SMP / sederajat',
      fatherJob: 'Karyawan Swasta',
      fatherIncome: 'Rp1.000.001 – Rp3.000.000',
      fatherNik: '3275030507800039',
      fatherPhone: '081287654321',
      motherName: 'MIJIL SRI MURWANI',
      motherBirthYear: '1983',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Tidak bekerja',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3275034711830003',
      motherPhone: '081287654321',
      prevSchool: 'SMP NEGERI 21 BEKASI',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 50,
      height: 165,
      distanceKm: 4,
      rfidUid: 'E280-1170-0000-021D',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 92,
      entryYear: '2026',
      entryDate: '2026-07-13'
    },
    {
      id: 'SMK-2526011174',
      nis: '2526011174',
      nisn: '3103138882',
      nik: '3216020504100003',
      noKk: '3216021203090004',
      name: 'ABDUL MUSYAFA',
      gender: 'L',
      level: 'SMK',
      className: 'XI. TKJ 1',
      major: 'TKJ',
      birthPlace: 'BEKASI',
      birthDate: '2010-04-05',
      religion: 'Islam',
      address: 'KP. PULO TIMAHA',
      rt: '08',
      rw: '09',
      village: 'Babelan Kota',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Jalan kaki',
      phone: '089611223344',
      fatherName: 'HERI YUNIANTO',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Wiraswasta',
      fatherIncome: '< Rp1.000.000',
      fatherNik: '3216021405800004',
      fatherPhone: '085212345678',
      motherName: 'KOKOM KOMALASARI',
      motherBirthYear: '1982',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Lainnya',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3216024711820004',
      motherPhone: '085212345678',
      prevSchool: 'SMP IT BINA CENDEKIA ASSALAM (BCA)',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 56,
      height: 164,
      distanceKm: 2,
      rfidUid: 'E280-1170-0000-021E',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 95,
      entryYear: '2025',
      entryDate: '2025-07-14'
    },
    {
      id: 'SMK-26270120082',
      nis: '26270120082',
      nisn: '3101157019',
      nik: '3216021809100002',
      noKk: '3216021203090005',
      name: 'ABDUL SALIM ASSADZILI',
      gender: 'L',
      level: 'SMK',
      className: 'X. TKJ 1',
      major: 'TKJ',
      birthPlace: 'BEKASI',
      birthDate: '2010-09-18',
      religion: 'Islam',
      address: 'UJUNG HARAPAN',
      rt: '03',
      rw: '15',
      village: 'Desa/Kel. Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Sepeda',
      phone: '081311223344',
      fatherName: 'MARGONO',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Karyawan Swasta',
      fatherIncome: 'Rp1.000.001 – Rp3.000.000',
      fatherNik: '3216021405700012',
      fatherPhone: '081298761234',
      motherName: 'NANY WAHYUNINGSIH',
      motherBirthYear: '1976',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Tidak bekerja',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3216024711760010',
      motherPhone: '081298761234',
      prevSchool: 'SMP NEGERI 3 BABELAN',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 52,
      height: 168,
      distanceKm: 1,
      hasRfid: false,
      status: 'Aktif',
      attendancePct: 91,
      entryYear: '2026',
      entryDate: '2026-07-13'
    },
    {
      id: 'SMK-2526011011',
      nis: '2526011011',
      nisn: '0107676242',
      nik: '3216025305100013',
      noKk: '3216021203090006',
      name: 'ALIFAH HUSNUL KHOTIMAH',
      gender: 'P',
      level: 'SMK',
      className: 'XI. AK',
      major: 'AKL',
      birthPlace: 'BEKASI',
      birthDate: '2010-05-13',
      religion: 'Islam',
      address: 'GREEN SWADAYA NO 36',
      rt: '08',
      rw: '04',
      village: 'Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Jalan kaki',
      phone: '082111223344',
      fatherName: 'MUJIANTO',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Wirausaha',
      fatherIncome: '< Rp1.000.000',
      fatherNik: '3216021111770010',
      fatherPhone: '081345678901',
      motherName: 'SUPARNI',
      motherBirthYear: '1977',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Tidak bekerja',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3216025908770005',
      motherPhone: '081345678901',
      prevSchool: 'SMP IT BINA CENDEKIA ASSALAM (BCA)',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 56,
      height: 155,
      distanceKm: 1,
      hasRfid: false,
      status: 'Aktif',
      attendancePct: 97,
      entryYear: '2025',
      entryDate: '2025-07-14'
    },
    {
      id: 'SMK-2526011012',
      nis: '2526011012',
      nisn: '3093953088',
      nik: '3275035612090003',
      noKk: '3275031203090007',
      name: 'ALIFIA NURHAYATILLAH',
      gender: 'P',
      level: 'SMK',
      className: 'XI. AK',
      major: 'AKL',
      birthPlace: 'BEKASI',
      birthDate: '2009-12-16',
      religion: 'Islam',
      address: 'VGH NO. 28',
      rt: '09',
      rw: '11',
      village: 'Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Angkutan umum/bus/pete-pete',
      phone: '085811223344',
      fatherName: 'H. NURHAYAT',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Buruh',
      fatherIncome: '< Rp1.000.000',
      fatherNik: '3275031405800007',
      fatherPhone: '085876543210',
      motherName: 'EMI NURAINI',
      motherBirthYear: '1982',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Tidak bekerja',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3275034711820007',
      motherPhone: '085876543210',
      prevSchool: 'SMP ATTAQWA PUSAT',
      birthOrder: 1,
      siblingsCount: 2,
      weight: 57,
      height: 156,
      distanceKm: 2,
      rfidUid: 'E280-1170-0000-021F',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 94,
      entryYear: '2025',
      entryDate: '2025-07-14'
    },
    {
      id: 'SMK-26270120031',
      nis: '26270120031',
      nisn: '3111944375',
      nik: '3275036107110006',
      noKk: '3275031203090008',
      name: 'ALIYATUL SADIYAH',
      gender: 'P',
      level: 'SMK',
      className: 'X. AK',
      major: 'AKL',
      birthPlace: 'BEKASI',
      birthDate: '2011-07-21',
      religion: 'Islam',
      address: 'Kp. Irian No.8 Rt.013/004 Kel. Teluk Pucung Bekasi Utara',
      rt: '13',
      rw: '04',
      village: 'Teluk Pucung',
      district: 'Kec. Bekasi Utara',
      city: 'Kota Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Mobil/bus antar jemput',
      phone: '087711223344',
      fatherName: 'ALI',
      fatherBirthYear: '1980',
      fatherEducation: 'SMA / sederajat',
      fatherJob: 'Wiraswasta',
      fatherIncome: '< Rp1.000.000',
      fatherNik: '3275031405800008',
      fatherPhone: '087798765432',
      motherName: 'UNITA KARDILA',
      motherBirthYear: '1988',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Pedagang Kecil',
      motherIncome: '< Rp1.000.000',
      motherNik: '3275034711880008',
      motherPhone: '087798765432',
      prevSchool: 'SMP ATTAQWA PUSAT',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 42,
      height: 146,
      distanceKm: 3,
      rfidUid: 'E280-1170-0000-0220',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 99,
      entryYear: '2026',
      entryDate: '2026-07-13'
    }
  ]

  // Data Siswa SMP IT Bina Cendekia Assalam (Kelas berbasis gender putra/putri)
  const officialSMPStudents: StudentItem[] = [
    {
      id: 'SMP-2425001',
      nis: '2425001',
      nisn: '0089123456',
      nik: '3216061004110001',
      noKk: '3216061203090101',
      name: 'MUHAMMAD FARHAN',
      gender: 'L',
      level: 'SMP',
      className: 'IX-A (Putra)',
      birthPlace: 'BEKASI',
      birthDate: '2011-04-10',
      religion: 'Islam',
      address: 'Jl. Ujung Harapan Musholla Assalam RT 04/01',
      rt: '04',
      rw: '01',
      village: 'Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Jalan kaki',
      phone: '081288887771',
      fatherName: 'Ustadz Syamsul Huda',
      fatherBirthYear: '1978',
      fatherEducation: 'S1',
      fatherJob: 'Guru / Pendidik',
      fatherIncome: 'Rp3.000.001 – Rp5.000.000',
      fatherNik: '3216061405780101',
      fatherPhone: '082210823033',
      motherName: 'MARYAM',
      motherBirthYear: '1982',
      motherEducation: 'SMA / sederajat',
      motherJob: 'Ibu Rumah Tangga',
      motherIncome: 'Tidak Berpenghasilan',
      motherNik: '3216064711820101',
      motherPhone: '082210823033',
      prevSchool: 'SDIT ATTAQWA BABELAN',
      birthOrder: 1,
      siblingsCount: 3,
      weight: 48,
      height: 158,
      distanceKm: 1,
      rfidUid: 'E280-1170-0000-010A',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 97,
      entryYear: '2024',
      entryDate: '2024-07-15'
    },
    {
      id: 'SMP-2425002',
      nis: '2425002',
      nisn: '0089123457',
      nik: '3216061808110002',
      noKk: '3216061203090102',
      name: 'AISYAH HUMAIRA',
      gender: 'P',
      level: 'SMP',
      className: 'IX-B (Putri)',
      birthPlace: 'BEKASI',
      birthDate: '2011-08-18',
      religion: 'Islam',
      address: 'Kp. Penggarutan RT 03/06',
      rt: '03',
      rw: '06',
      village: 'Kebalen',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Sepeda',
      phone: '085788887772',
      fatherName: 'H. ABDULLAH',
      fatherBirthYear: '1975',
      fatherEducation: 'S1',
      fatherJob: 'PNS',
      fatherIncome: 'Rp5.000.001 – Rp10.000.000',
      fatherNik: '3216061405750102',
      fatherPhone: '081388889999',
      motherName: 'KHADIJAH',
      motherBirthYear: '1979',
      motherEducation: 'S1',
      motherJob: 'PNS',
      motherIncome: 'Rp3.000.001 – Rp5.000.000',
      motherNik: '3216064711790102',
      motherPhone: '081388889999',
      prevSchool: 'MI ATTAQWA 15',
      birthOrder: 2,
      siblingsCount: 2,
      weight: 45,
      height: 153,
      distanceKm: 2,
      rfidUid: 'E280-1170-0000-010B',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 99,
      entryYear: '2024',
      entryDate: '2024-07-15'
    },
    {
      id: 'SMP-2526003',
      nis: '2526003',
      nisn: '0089123458',
      nik: '3216062202120003',
      noKk: '3216061203090103',
      name: 'ABDULLAH AZZAM',
      gender: 'L',
      level: 'SMP',
      className: 'VIII-A (Putra)',
      birthPlace: 'JAKARTA',
      birthDate: '2012-02-22',
      religion: 'Islam',
      address: 'Perumahan Graha Harapan Blok C',
      rt: '02',
      rw: '10',
      village: 'Bahagia',
      district: 'Kec. Babelan',
      city: 'Kab. Bekasi',
      livingType: 'Bersama orang tua',
      transportation: 'Sepeda motor',
      phone: '087888887773',
      fatherName: 'Ir. Hendra Wijaya',
      fatherBirthYear: '1976',
      fatherEducation: 'S1',
      fatherJob: 'Karyawan Swasta',
      fatherIncome: 'Rp5.000.001 – Rp10.000.000',
      fatherNik: '3216061405760103',
      fatherPhone: '081211112222',
      motherName: 'SRI MULYANI',
      motherBirthYear: '1980',
      motherEducation: 'D3',
      motherJob: 'Wiraswasta',
      motherIncome: 'Rp1.000.001 – Rp3.000.000',
      motherNik: '3216064711800103',
      motherPhone: '081211112222',
      prevSchool: 'SDN BAHAGIA 04',
      birthOrder: 1,
      siblingsCount: 2,
      weight: 50,
      height: 156,
      distanceKm: 2,
      rfidUid: 'E280-1170-0000-010C',
      hasRfid: true,
      status: 'Aktif',
      attendancePct: 94,
      entryYear: '2025',
      entryDate: '2025-07-14'
    }
  ]

  const students = ref<StudentItem[]>([...officialSMKStudents, ...officialSMPStudents])

  // Filter states
  const searchQuery = ref<string>('')
  const selectedClass = ref<string>('all')
  const selectedMajor = ref<string>('all')
  const selectedGender = ref<string>('all')
  const selectedStatus = ref<string>('all')
  const selectedRfid = ref<string>('all')

  // Modals state
  const detailModalStudent = ref<StudentItem | null>(null)
  const isFormModalOpen = ref<boolean>(false)
  const formModalMode = ref<'add' | 'edit'>('add')
  const formStudent = ref<Partial<StudentItem>>({})
  const deleteConfirmStudent = ref<StudentItem | null>(null)

  // Current grade students (SMP or SMK)
  const currentGradeStudents = computed<StudentItem[]>(() => {
    return students.value.filter(s => s.level === grade.value)
  })

  // Class options
  const classOptions = computed<string[]>(() => {
    const list = currentGradeStudents.value.map(s => s.className)
    return Array.from(new Set(list))
  })

  // Major options (SMK only)
  const majorOptions = computed<string[]>(() => {
    if (grade.value === 'SMP') return []
    return ['TKJ', 'AKL', 'OTKP', 'DKV', 'TBSM', 'TKR']
  })

  // Filtered students
  const filteredStudents = computed<StudentItem[]>(() => {
    return currentGradeStudents.value.filter(s => {
      // Search query across name, NIS, NISN, NIK, class, village, parent
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        const matchName = s.name.toLowerCase().includes(q)
        const matchNis = s.nis.includes(q)
        const matchNisn = s.nisn.includes(q)
        const matchNik = s.nik.includes(q)
        const matchClass = s.className.toLowerCase().includes(q)
        const matchVillage = (s.village || '').toLowerCase().includes(q)
        const matchParent = (s.fatherName || '').toLowerCase().includes(q) || (s.motherName || '').toLowerCase().includes(q)
        if (!matchName && !matchNis && !matchNisn && !matchNik && !matchClass && !matchVillage && !matchParent) return false
      }

      // Filter Class
      if (selectedClass.value !== 'all' && s.className !== selectedClass.value) return false

      // Filter Major (SMK)
      if (grade.value === 'SMK' && selectedMajor.value !== 'all' && s.major !== selectedMajor.value) return false

      // Filter Gender
      if (selectedGender.value !== 'all' && s.gender !== selectedGender.value) return false

      // Filter Status
      if (selectedStatus.value !== 'all' && s.status !== selectedStatus.value) return false

      // Filter RFID
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
      religion: 'Islam',
      livingType: 'Bersama orang tua',
      transportation: 'Sepeda motor',
      status: 'Aktif',
      entryYear: '2026',
      attendancePct: 100,
      hasRfid: false,
      city: 'Kab. Bekasi',
      district: 'Kec. Babelan',
      village: 'Bahagia'
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
        nis: data.nis || String(Date.now()).slice(-8),
        nisn: data.nisn || '',
        nik: data.nik || '',
        noKk: data.noKk || '',
        name: data.name || '',
        gender: data.gender || 'L',
        level: grade.value,
        className: data.className || (grade.value === 'SMP' ? 'VII-A (Putra)' : 'X. TKJ 1'),
        major: data.major,
        birthPlace: data.birthPlace || 'BEKASI',
        birthDate: data.birthDate || '',
        religion: data.religion || 'Islam',
        address: data.address || '',
        rt: data.rt || '01',
        rw: data.rw || '01',
        village: data.village || 'Bahagia',
        district: data.district || 'Kec. Babelan',
        city: data.city || 'Kab. Bekasi',
        livingType: data.livingType || 'Bersama orang tua',
        transportation: data.transportation || 'Sepeda motor',
        phone: data.phone || '',
        fatherName: data.fatherName || '',
        fatherBirthYear: data.fatherBirthYear,
        fatherEducation: data.fatherEducation,
        fatherJob: data.fatherJob,
        fatherIncome: data.fatherIncome,
        fatherNik: data.fatherNik,
        fatherPhone: data.fatherPhone,
        motherName: data.motherName || '',
        motherBirthYear: data.motherBirthYear,
        motherEducation: data.motherEducation,
        motherJob: data.motherJob,
        motherIncome: data.motherIncome,
        motherNik: data.motherNik,
        motherPhone: data.motherPhone,
        prevSchool: data.prevSchool,
        prevDiplomaNo: data.prevDiplomaNo,
        birthOrder: data.birthOrder,
        siblingsCount: data.siblingsCount,
        weight: data.weight,
        height: data.height,
        headCircumference: data.headCircumference,
        distanceKm: data.distanceKm,
        hobby: data.hobby,
        ambition: data.ambition,
        entryDate: data.entryDate,
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
