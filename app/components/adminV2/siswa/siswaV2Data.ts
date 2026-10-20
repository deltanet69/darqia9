export interface Student {
  id: string
  nis: string
  nisn: string
  name: string
  gender: 'L' | 'P'
  className: string
  major: string
  phone: string
  father: string
  mother: string
  fphone: string
  pemail: string
  hasRfid: boolean
  rfidUid: string
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Nonaktif' | string
  att: number
  birthPlace: string
  birthDate: string
  address: string
  prevSchool: string
  entryYear: string
  level: 'smk' | 'smp'
}

export interface SiswaFilter {
  q: string
  kelas: string
  jurusan: string
  gender: string
  rfid: string
  gap: boolean
  page: number
}

export const STREETS = [
  'Jl. Ujung Harapan No. 12',
  'Jl. Bahagia Raya No. 45',
  'Jl. Babelan Kota No. 8',
  'Jl. Pulo Timaha No. 21',
  'Jl. Kavling Attaqwa No. 3'
]

export function mkStudent(
  r: [string, 'L' | 'P', string, string, string, string, number, string?],
  level: 'smk' | 'smp',
  i: number
): Student {
  const nis = String(2026000 + i * 7 + (level === 'smp' ? 500 : 0))
  const fatherName = r[4] || '-'
  const cleanFather = String(fatherName)
    .replace(/\./g, '')
    .split(' ')
    .filter(w => w.length > 2 && !/^(H|Hj|Ust|Ustzh|Drs|Dra)$/i.test(w))
  const pemail = 'wali.' + ((cleanFather[0] || 'wali').toLowerCase()) + '@gmail.com'

  return {
    id: (level === 'smp' ? 'SMP-' : 'SMK-') + nis,
    nis: nis,
    nisn: '00' + (level === 'smp' ? '6' : '7') + (100000 + i * 137),
    name: r[0],
    gender: r[1],
    className: r[2],
    major: r[3] || '',
    phone: '08' + (1200000000 + i * 91357),
    father: fatherName,
    mother: r[5] || '-',
    fphone: '08' + (1300000000 + i * 77123),
    pemail: pemail,
    hasRfid: r[6] !== 0,
    rfidUid: r[6] !== 0 ? 'RFID-' + (1000 + i * 3) + '-' + (level === 'smp' ? 'B' : 'A') : '',
    status: r[7] || 'Aktif',
    att: 88 + ((i * 37) % 12),
    birthPlace: 'Bekasi',
    birthDate: (1 + (i * 7) % 27) + ' ' + ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'][i % 6] + ' ' + (2008 + (i % 3)),
    address: STREETS[i % STREETS.length] + ', Babelan, Bekasi',
    prevSchool: level === 'smp' ? 'SDN Bahagia 0' + (1 + i % 4) : 'SMP IT Bina Cendekia Assalam',
    entryYear: '2024',
    level: level
  }
}

export const SMK_ROWS: Array<[string, 'L' | 'P', string, string, string, string, number, string?]> = [
  ['Ahmad Fauzi Ramadhan', 'L', 'X RPL 1', 'RPL', 'H. Fauzi Rahman', 'Siti Aminah', 1],
  ['Siti Nurhaliza', 'P', 'X RPL 1', 'RPL', 'H. Nurdin', 'Hj. Halimah', 1],
  ['Budi Santoso', 'L', 'X RPL 2', 'RPL', 'Santoso', 'Dewi Lestari', 1],
  ['Dewi Anggraini', 'P', 'X TKJ 1', 'TKJ', 'Agus Anggra', 'Rina Marlina', 0],
  ['Rizky Pratama', 'L', 'X TKJ 1', 'TKJ', 'Pratama Wijaya', 'Sari Puspita', 1],
  ['Putri Maharani', 'P', 'XI RPL 1', 'RPL', 'H. Maharaja', 'Nina Kurnia', 1],
  ['Andi Wijaya', 'L', 'XI RPL 1', 'RPL', 'Wijaya Kusuma', 'Fitri Handayani', 1],
  ['Maya Kusuma', 'P', 'XI RPL 1', 'RPL', 'Kusuma Wardana', 'Maya Indah', 1, 'Pindah'],
  ['Fajar Nugroho', 'L', 'XII RPL 1', 'RPL', 'Nugroho Prasetyo', 'Ayu Wandira', 1],
  ['Intan Permata', 'P', 'XII RPL 1', 'RPL', 'Permata Hati', 'Ratna Sari', 1],
  ['Yoga Saputra', 'L', 'XII TKJ 1', 'TKJ', 'Saputra Jaya', 'Lina Marlina', 1],
  ['Rina Wulandari', 'P', 'XII TKJ 1', 'TKJ', 'Wulandari Kusuma', 'Sri Mulyani', 0]
]

export const SMP_ROWS: Array<[string, 'L' | 'P', string, string, string, string, number, string?]> = [
  ['Dimas Arya Pratama', 'L', 'VII-A', '', 'Arya Dimas', 'Nita Kurnia', 1],
  ['Nadia Safitri', 'P', 'VII-A', '', 'Safitri Hidayat', 'Rina Oktavia', 1],
  ['Galih Permana', 'L', 'VII-B', '', 'Permana Putra', 'Dewi Anggraini', 1],
  ['Salsa Bila Putri', 'P', 'VII-B', '', 'Bila Pratama', 'Salsa Indah', 0],
  ['Reza Fahlevi', 'L', 'VIII-A', '', 'Fahlevi Rahman', 'Nisa Ulfa', 1],
  ['Ayu Lestari', 'P', 'VIII-A', '', 'Lestari Budi', 'Ayu Wulandari', 1],
  ['Bagas Aditya', 'L', 'VIII-B', '', 'Aditya Nugraha', 'Sinta Dewi', 1],
  ['Kirana Dewi', 'P', 'IX-A', '', 'Dewi Kirana', 'Ratna Juwita', 1],
  ['Ilham Maulana', 'L', 'IX-A', '', 'Maulana Yusuf', 'Ilma Nur', 0],
  ['Zahra Aulia', 'P', 'IX-B', '', 'Aulia Rahman', 'Zahra Fitri', 1]
]

export const INITIAL_STUDENTS_SMK: Student[] = SMK_ROWS.map((r, i) => mkStudent(r, 'smk', i))
export const INITIAL_STUDENTS_SMP: Student[] = SMP_ROWS.map((r, i) => mkStudent(r, 'smp', i))

export const KELAS_DATA = {
  smk: [
    { name: 'X RPL 1', major: 'RPL', room: 'Gedung A · R.101', wali: 'H. Abdul Muiz, S.Pd', nip: '19680512 199803 1 002', boys: 18, girls: 14, att: 96.4, avg: 82.5 },
    { name: 'X RPL 2', major: 'RPL', room: 'Gedung A · R.102', wali: 'Siti Maryam, S.Pd', nip: '19820314 200801 2 005', boys: 17, girls: 15, att: 95.1, avg: 80.2 },
    { name: 'X TKJ 1', major: 'TKJ', room: 'Gedung A · R.103', wali: 'Budi Hartono, S.Pd', nip: '19791120 200502 1 008', boys: 20, girls: 12, att: 94.8, avg: 79.6 },
    { name: 'XI RPL 1', major: 'RPL', room: 'Gedung B · R.201', wali: 'Dewi Sartika, S.Si', nip: '19850608 201001 2 011', boys: 16, girls: 16, att: 93.5, avg: 81.8 },
    { name: 'XII RPL 1', major: 'RPL', room: 'Gedung B · R.202', wali: 'Agus Setiawan, S.Pd', nip: '19750228 199901 1 004', boys: 15, girls: 15, att: 97.2, avg: 84.1 },
    { name: 'XII TKJ 1', major: 'TKJ', room: 'Gedung B · R.203', wali: 'Rina Marlina, S.Pd', nip: '19891201 201503 2 009', boys: 19, girls: 13, att: 92.9, avg: 78.4 }
  ],
  smp: [
    { name: 'VII-A', major: '', room: 'Gedung C · R.301', wali: 'Drs. H. Ahmad Yani', nip: '19670115 199203 1 001', boys: 16, girls: 16, att: 97.8, avg: 83.2 },
    { name: 'VII-B', major: '', room: 'Gedung C · R.302', wali: 'Nina Kurnia, S.Pd', nip: '19880419 201201 2 014', boys: 15, girls: 17, att: 96.9, avg: 81.5 },
    { name: 'VIII-A', major: '', room: 'Gedung C · R.303', wali: 'Fajar Sidik, S.Pd', nip: '19900123 201801 1 017', boys: 17, girls: 15, att: 95.6, avg: 80.9 },
    { name: 'VIII-B', major: '', room: 'Gedung D · R.401', wali: 'Wulan Dari, S.Pd', nip: '19920530 201902 2 020', boys: 16, girls: 16, att: 94.2, avg: 79.8 },
    { name: 'IX-A', major: '', room: 'Gedung D · R.402', wali: 'Hendra Gunawan, S.Pd', nip: '19820817 200701 1 012', boys: 15, girls: 17, att: 96.1, avg: 82.7 },
    { name: 'IX-B', major: '', room: 'Gedung D · R.403', wali: 'Sri Wahyuni, S.Pd', nip: '19851111 201001 2 016', boys: 16, girls: 16, att: 93.8, avg: 78.9 }
  ]
}

export function sisGap(s: Student): boolean {
  return !s.hasRfid || !s.phone || !s.pemail
}
