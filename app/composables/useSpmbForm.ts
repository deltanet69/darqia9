import { ref, reactive } from 'vue'

export interface SpmbRegistration {
  id: string
  jenjang: string
  jurusan?: string
  s_nama: string
  s_nisn: string
  s_jk: string
  s_ttl: string
  s_hp: string
  s_email: string
  s_sekolah: string
  s_alsekolah: string
  o_nama: string
  o_hub: string
  o_nik: string
  o_hp: string
  o_email: string
  o_ttl: string
  o_alamat: string
  waktu: string
  status: string
}

export function useSpmbForm(initialJenjang: 'smp' | 'smk' = 'smk') {
  const step = ref(1)
  const wizEl = ref<HTMLElement | null>(null)

  const form = reactive({
    jenjang: initialJenjang,
    jurusan: initialJenjang === 'smk' ? 'Teknik Komputer & Jaringan' : '',
    s_nama: '',
    s_nisn: '',
    s_jk: '',
    s_tempat: '',
    s_tgl: '',
    s_hp: '',
    s_email: '',
    s_sekolah: '',
    s_alsekolah: '',
    o_nama: '',
    o_hub: '',
    o_nik: '',
    o_hp: '',
    o_email: '',
    o_tempat: '',
    o_tgl: '',
    o_alamat: '',
    agree: false
  })

  const fileObj = ref<File | null>(null)
  const filePreview = ref('')
  const fileIsImg = ref(false)
  const fileName = ref('')

  const errs = reactive({
    s_nama: false,
    s_nisn: false,
    s_jk: false,
    s_tempat: false,
    s_tgl: false,
    s_hp: false,
    s_email: false,
    s_sekolah: false,
    s_alsekolah: false,
    o_nama: false,
    o_hub: false,
    o_nik: false,
    o_hp: false,
    o_email: false,
    o_tempat: false,
    o_tgl: false,
    o_alamat: false,
    bukti: false,
    agree: false
  })

  const clearErr = (key: keyof typeof errs) => {
    errs[key] = false
  }

  const numericOnly = (key: 's_nisn' | 'o_nik') => {
    const v = (form[key] || '').replace(/\D/g, '')
    form[key] = v
  }

  const phoneOnly = (key: 's_hp' | 'o_hp') => {
    let v = (form[key] || '').replace(/\D/g, '')
    if (v.startsWith('62')) v = '0' + v.substring(2)
    form[key] = v
  }

  const isEmail = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

  const validStep = (n: number): boolean => {
    let ok = true
    if (n === 1) {
      if (!form.s_nama.trim()) { errs.s_nama = true; ok = false }
      if (!/^\d{10}$/.test(form.s_nisn)) { errs.s_nisn = true; ok = false }
      if (!form.s_jk) { errs.s_jk = true; ok = false }
      if (!form.s_tempat.trim()) { errs.s_tempat = true; ok = false }
      if (!form.s_tgl) { errs.s_tgl = true; ok = false }
      if (form.s_hp && !/^08\d{7,12}$/.test(form.s_hp)) { errs.s_hp = true; ok = false }
      if (form.s_email && !isEmail(form.s_email)) { errs.s_email = true; ok = false }
      if (!form.s_sekolah.trim()) { errs.s_sekolah = true; ok = false }
      if (!form.s_alsekolah.trim()) { errs.s_alsekolah = true; ok = false }
    } else if (n === 2) {
      if (!form.o_nama.trim()) { errs.o_nama = true; ok = false }
      if (!form.o_hub) { errs.o_hub = true; ok = false }
      if (!/^\d{16}$/.test(form.o_nik)) { errs.o_nik = true; ok = false }
      if (!form.o_hp || !/^08\d{7,12}$/.test(form.o_hp)) { errs.o_hp = true; ok = false }
      if (form.o_email && !isEmail(form.o_email)) { errs.o_email = true; ok = false }
      if (!form.o_tempat.trim()) { errs.o_tempat = true; ok = false }
      if (!form.o_tgl) { errs.o_tgl = true; ok = false }
      if (!form.o_alamat.trim()) { errs.o_alamat = true; ok = false }
    } else if (n === 3) {
      if (!fileObj.value) { errs.bukti = true; ok = false }
      if (!form.agree) { errs.agree = true; ok = false }
    }
    return ok
  }

  const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const f = target.files && target.files[0]
    clearErr('bukti')
    filePreview.value = ''
    if (!f) {
      fileObj.value = null
      return
    }
    const okType = /^image\//.test(f.type) || f.type === 'application/pdf'
    if (!okType || f.size > 5 * 1024 * 1024) {
      errs.bukti = true
      target.value = ''
      fileObj.value = null
      return
    }
    fileObj.value = f
    fileName.value = `${f.name} (${Math.round(f.size / 1024)} KB)`
    if (/^image\//.test(f.type)) {
      fileIsImg.value = true
      const r = new FileReader()
      r.onload = (ev) => {
        filePreview.value = (ev.target?.result as string) || ''
      }
      r.readAsDataURL(f)
    } else {
      fileIsImg.value = false
      filePreview.value = 'pdf'
    }
  }

  const scrollToTop = () => {
    if (wizEl.value && typeof window !== 'undefined') {
      const top = wizEl.value.getBoundingClientRect().top + window.scrollY - 90
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const nextStep = () => {
    if (!validStep(step.value)) return
    if (step.value < 3) {
      step.value++
      scrollToTop()
    } else {
      submitForm()
    }
  }

  const prevStep = () => {
    if (step.value > 1) {
      step.value--
      scrollToTop()
    }
  }

  // Modal Sukses & Submit
  const modalSuccess = ref(false)
  const submittedReg = ref<SpmbRegistration>({
    id: '',
    jenjang: '',
    jurusan: '',
    s_nama: '',
    s_nisn: '',
    s_jk: '',
    s_ttl: '',
    s_hp: '',
    s_email: '',
    s_sekolah: '',
    s_alsekolah: '',
    o_nama: '',
    o_hub: '',
    o_nik: '',
    o_hp: '',
    o_email: '',
    o_ttl: '',
    o_alamat: '',
    waktu: '',
    status: ''
  })
  const copyText = ref('Salin ID')

  const genId = () => {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let s = ''
    for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]
    const pref = form.jenjang === 'smp' ? 'SMP' : 'SMK'
    return `SPMB27-${pref}-${s}`
  }

  const fmtDate = (v: string) => {
    if (!v) return '-'
    const d = new Date(v + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const submitForm = () => {
    const id = genId()
    const jenjFull = form.jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
    const reg: SpmbRegistration = {
      id,
      jenjang: jenjFull,
      jurusan: form.jenjang === 'smk' ? form.jurusan : undefined,
      s_nama: form.s_nama.trim(),
      s_nisn: form.s_nisn,
      s_jk: form.s_jk,
      s_ttl: `${form.s_tempat.trim()}, ${fmtDate(form.s_tgl)}`,
      s_hp: form.s_hp || '-',
      s_email: form.s_email || '-',
      s_sekolah: form.s_sekolah.trim(),
      s_alsekolah: form.s_alsekolah.trim(),
      o_nama: form.o_nama.trim(),
      o_hub: form.o_hub,
      o_nik: form.o_nik,
      o_hp: form.o_hp,
      o_email: form.o_email || '-',
      o_ttl: `${form.o_tempat.trim()}, ${fmtDate(form.o_tgl)}`,
      o_alamat: form.o_alamat.trim(),
      waktu: new Date().toISOString(),
      status: 'Menunggu verifikasi'
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const arr = JSON.parse(localStorage.getItem('spmb27_regs') || '[]')
        arr.push(reg)
        localStorage.setItem('spmb27_regs', JSON.stringify(arr))
      } catch (e) {
        console.error('Gagal menyimpan pendaftaran ke localStorage:', e)
      }
    }

    submittedReg.value = reg
    modalSuccess.value = true
  }

  const copyId = async () => {
    const t = submittedReg.value.id
    if (!t) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(t)
      } else {
        const ta = document.createElement('textarea')
        ta.value = t
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      copyText.value = 'Tersalin!'
      setTimeout(() => { copyText.value = 'Salin ID' }, 1800)
    } catch (e) {
      console.error('Gagal menyalin ID:', e)
    }
  }

  // Track Feature
  const modalTrack = ref(false)
  const trackQuery = ref('')
  const trackResult = ref<SpmbRegistration | null>(null)
  const trackNotFound = ref(false)

  const openTrackModal = () => {
    trackQuery.value = ''
    trackResult.value = null
    trackNotFound.value = false
    modalTrack.value = true
  }

  const doTrack = () => {
    const id = trackQuery.value.trim().toUpperCase()
    if (!id) return
    let regs: SpmbRegistration[] = []
    if (typeof localStorage !== 'undefined') {
      try {
        regs = JSON.parse(localStorage.getItem('spmb27_regs') || '[]')
      } catch (e) {
        console.error('Gagal membaca pendaftaran:', e)
      }
    }
    const reg = regs.find(r => r.id === id)
    if (reg) {
      trackNotFound.value = false
      trackResult.value = reg
    } else {
      trackNotFound.value = true
      trackResult.value = null
    }
  }

  return {
    step,
    wizEl,
    form,
    fileObj,
    filePreview,
    fileIsImg,
    fileName,
    errs,
    clearErr,
    numericOnly,
    phoneOnly,
    onFileChange,
    nextStep,
    prevStep,
    scrollToTop,
    modalSuccess,
    submittedReg,
    copyText,
    submitForm,
    copyId,
    modalTrack,
    trackQuery,
    trackResult,
    trackNotFound,
    openTrackModal,
    doTrack
  }
}
