import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

export interface AbsensiStudent {
  id: string
  name: string
  nis: string
  className: string
  masuk: string | null
  keluar: string | null
  status: 'menunggu' | 'tepat' | 'terlambat' | 'alpa'
  flash?: 'green' | 'red' | null
  pillGlow?: boolean
}

export interface AbsensiToastData {
  show: boolean
  isAlpa: boolean
  isAutoGate?: boolean
  name: string
  className?: string
  time: string
  status: 'tepat' | 'terlambat' | 'alpa'
}

// Configurable attendance time limits (menit dari jam 00:00)
export const ABSENSI_CONFIG = {
  TEPAT_MAX: 6 * 60 + 45, // 06:45
  TOL_MAX: 7 * 60,        // 07:00
  TEPAT_STR: '06:45',
  TOL_STR: '07:00'
}

const FIRST_NAMES = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hana', 'Irfan', 'Joko',
  'Kirana', 'Lukman', 'Maya', 'Nadia', 'Putri', 'Rizky', 'Sinta', 'Taufik', 'Utami', 'Wahyu',
  'Yoga', 'Zahra', 'Andi', 'Bima', 'Dian', 'Eka', 'Farhan', 'Gita', 'Hendra', 'Intan',
  'Jihan', 'Kurnia', 'Lestari', 'Maulana', 'Nabila', 'Rangga', 'Sari', 'Tania', 'Vina', 'Yusuf',
  'Aisyah', 'Bagus', 'Candra', 'Dimas', 'Elsa', 'Fajar', 'Galih', 'Hesti', 'Ilham', 'Bagas'
]

const LAST_NAMES = [
  'Pratama', 'Saputra', 'Wijaya', 'Kusuma', 'Santoso', 'Nugroho', 'Rahmawati', 'Setiawan',
  'Hidayat', 'Kurniawan', 'Anggraini', 'Puspita', 'Ramadhan', 'Firmansyah', 'Maharani', 'Utama',
  'Siregar', 'Nasution', 'Halim', 'Gunawan', 'Pramudya', 'Laksmana', 'Wibowo', 'Susanto',
  'Hartono', 'Salim', 'Pangestu', 'Wulandari', 'Handoko', 'Suryana', 'Maulidi', 'Fauzi',
  'Hakim', 'Ridwan', 'Syahputra', 'Amelia', 'Octavia', 'Darmawan', 'Puspitasari', 'Nugraha'
]

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const useAbsensiTv = (initialKode: string = '10abc') => {
  const currentKode = ref(initialKode)

  // Parse code into classes
  const parseKodeToClasses = (code: string) => {
    const match = code.match(/^(\d+)([a-z]+)$/i)
    let levelNum = '10'
    let letters = ['A', 'B', 'C']
    if (match) {
      levelNum = match[1]
      letters = match[2].toUpperCase().split('')
    }
    return {
      levelNum,
      classes: letters.map(l => `${levelNum}${l}`)
    }
  }

  const parsed = parseKodeToClasses(currentKode.value)
  const levelNum = ref(parsed.levelNum)
  const classes = ref<string[]>(parsed.classes)
  const activeTab = ref<string>(classes.value[0] || '10A')

  // Realtime clock
  const clockHours = ref('--')
  const clockMinutes = ref('--')
  const clockSeconds = ref('--')
  const dateLine = ref('—')

  // DB Students per class
  const db = reactive<Record<string, AbsensiStudent[]>>({})

  // Initialize students database (14 students per class)
  const initDB = (classList: string[]) => {
    classList.forEach((c, ci) => {
      const rnd = mulberry32(ci * 991 + 7)
      const used = new Set<string>()
      const arr: AbsensiStudent[] = []
      for (let i = 0; i < 14; i++) {
        let nm = ''
        do {
          nm = `${FIRST_NAMES[(rnd() * FIRST_NAMES.length) | 0]} ${LAST_NAMES[(rnd() * LAST_NAMES.length) | 0]}`
        } while (used.has(nm))
        used.add(nm)

        arr.push({
          id: `${c}-${i + 1}`,
          name: nm,
          nis: `2026${10 + ci}${String(101 + i)}`,
          className: c,
          masuk: null,
          keluar: null,
          status: 'menunggu',
          flash: null,
          pillGlow: false
        })
      }
      db[c] = arr
    })
  }

  initDB(classes.value)

  // Stats calculation
  const stats = computed(() => {
    let total = 0
    let tepat = 0
    let terlambat = 0
    let alpa = 0

    classes.value.forEach(c => {
      const list = db[c] || []
      list.forEach(s => {
        total++
        if (s.status === 'tepat') tepat++
        else if (s.status === 'terlambat') terlambat++
        else if (s.status === 'alpa') alpa++
      })
    })

    const hadir = tepat + terlambat
    const pct = total > 0 ? Math.round((hadir / total) * 100) : 0

    return {
      total,
      tepat,
      terlambat,
      alpa,
      hadir,
      pct
    }
  })

  // Ticker items
  const tickerEvents = computed(() => {
    const list: { time: string; student: AbsensiStudent; className: string }[] = []
    classes.value.forEach(c => {
      const sList = db[c] || []
      sList.forEach(s => {
        if (s.masuk) {
          list.push({ time: s.masuk, student: s, className: c })
        }
      })
    })
    return list.sort((a, b) => b.time.localeCompare(a.time))
  })

  // Detail modal
  const selectedStudent = ref<AbsensiStudent | null>(null)
  const openDetail = (s: AbsensiStudent) => {
    selectedStudent.value = s
  }
  const closeDetail = () => {
    selectedStudent.value = null
  }

  // Toast tap
  const toastData = reactive<AbsensiToastData>({
    show: false,
    isAlpa: false,
    isAutoGate: false,
    name: '',
    className: '',
    time: '',
    status: 'tepat'
  })
  let toastTimer: any = null

  const showToast = (data: Partial<AbsensiToastData>) => {
    Object.assign(toastData, {
      show: true,
      isAlpa: data.status === 'alpa',
      isAutoGate: !!data.isAutoGate,
      name: data.name || '',
      className: data.className || '',
      time: data.time || '',
      status: data.status || 'tepat'
    })
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastData.show = false
    }, data.isAutoGate ? 4500 : 3500)
  }

  // Clock ticker
  let clockInterval: any = null
  const updateClock = () => {
    const now = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    clockHours.value = p(now.getHours())
    clockMinutes.value = p(now.getMinutes())
    clockSeconds.value = p(now.getSeconds())

    dateLine.value = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Live simulation controls (Demo Mode)
  const simOn = ref(false)
  let simTimer: any = null
  let simMinutes = 6 * 60 + 25 // Starts at 06:25

  const formatMinutes = (m: number) => {
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    return `${hh}:${mm}`
  }

  const getStatusForMinutes = (m: number): 'tepat' | 'terlambat' | 'alpa' => {
    if (m <= ABSENSI_CONFIG.TEPAT_MAX) return 'tepat'
    if (m <= ABSENSI_CONFIG.TOL_MAX) return 'terlambat'
    return 'alpa'
  }

  const triggerTap = (student: AbsensiStudent, timeStr: string, status: 'tepat' | 'terlambat' | 'alpa') => {
    student.masuk = timeStr
    student.status = status
    student.flash = status === 'alpa' ? 'red' : 'green'
    student.pillGlow = true

    setTimeout(() => {
      student.flash = null
    }, 1800)

    showToast({
      name: student.name,
      className: student.className,
      time: timeStr,
      status
    })
  }

  const gateClose = () => {
    let unTappedCount = 0
    classes.value.forEach(c => {
      const list = db[c] || []
      list.forEach(s => {
        if (s.status === 'menunggu') {
          s.status = 'alpa'
          s.flash = 'red'
          s.pillGlow = true
          unTappedCount++
          setTimeout(() => { s.flash = null }, 1800)
        }
      })
    })

    stopSim()
    showToast({
      isAutoGate: true,
      name: `${unTappedCount} siswa belum tap`,
      time: '07:00',
      status: 'alpa'
    })
  }

  const simStep = () => {
    const candidates: AbsensiStudent[] = []
    classes.value.forEach(c => {
      const list = db[c] || []
      list.forEach(s => {
        if (s.status === 'menunggu') candidates.push(s)
      })
    })

    if (candidates.length === 0) {
      stopSim()
      return
    }

    const target = candidates[Math.floor(Math.random() * candidates.length)]
    simMinutes += Math.floor(Math.random() * 3) // Advance 0-2 mins

    if (simMinutes > ABSENSI_CONFIG.TOL_MAX) {
      gateClose()
      return
    }

    const timeStr = formatMinutes(simMinutes)
    const status = getStatusForMinutes(simMinutes)
    triggerTap(target, timeStr, status)
  }

  const startSim = () => {
    simOn.value = true
    if (simTimer) clearInterval(simTimer)
    simTimer = setInterval(simStep, 2200)
  }

  const stopSim = () => {
    simOn.value = false
    if (simTimer) {
      clearInterval(simTimer)
      simTimer = null
    }
  }

  const toggleSim = () => {
    if (simOn.value) {
      stopSim()
    } else {
      startSim()
    }
  }

  const resetAll = () => {
    stopSim()
    simMinutes = 6 * 60 + 25
    initDB(classes.value)
  }

  const setClassCount = (n: 2 | 3 | 4) => {
    stopSim()
    const all = ['10A', '10B', '10C', '10D']
    classes.value = all.slice(0, n)
    activeTab.value = classes.value[0]
    currentKode.value = '10' + classes.value.map(c => c.replace('10', '').toLowerCase()).join('')
    resetAll()
  }

  onMounted(() => {
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
  })

  onBeforeUnmount(() => {
    if (clockInterval) clearInterval(clockInterval)
    if (simTimer) clearInterval(simTimer)
    if (toastTimer) clearTimeout(toastTimer)
  })

  return {
    currentKode,
    levelNum,
    classes,
    activeTab,
    db,
    stats,
    tickerEvents,
    clockHours,
    clockMinutes,
    clockSeconds,
    dateLine,
    selectedStudent,
    toastData,
    simOn,
    openDetail,
    closeDetail,
    toggleSim,
    resetAll,
    setClassCount,
    triggerTap
  }
}
