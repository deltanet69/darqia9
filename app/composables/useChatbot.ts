import type { ChatbotSuggestion, ChatbotKnowledgeItem, ChatbotSettings, ChatMessage } from '~/types/chatbot'

export const useChatbot = () => {
  // Settings yang bisa diatur oleh Admin Portal
  const settings = useState<ChatbotSettings>('chatbot_settings', () => ({
    botName: 'Darqia Assistant',
    botRole: 'Online • Asisten Virtual Resmi',
    welcomeMessage: `Assalamu'alaikum! 👋 <br/>Saya <b>Assistance Attaqwa 9</b>, asisten pintar SMK IT Attaqwa 9 &amp; SMP IT Bina Cendekia Assalam.<br><br>Ada yang bisa saya bantu terkait <b>SPMB 2026/2027</b>, info jurusan, atau program tahfidz?`,
    welcomeActionText: 'Buka Form SPMB Online',
    welcomeActionLink: '/spmb',
    fallbackMessage: 'Terima kasih atas pertanyaannya! Untuk informasi lebih rinci terkait "{query}", silakan hubungi kontak panitia atau klik tombol pendaftaran online.',
    confidentialKeywords: ['gaji', 'password', 'sandi', 'rahasia', 'keuangan yayasan', 'database'],
    confidentialMessage: 'Maaf, informasi mengenai hal tersebut bersifat internal/rahasia dan tidak dapat diakses melalui asisten publik. Silakan hubungi bagian manajemen sekolah secara langsung.'
  }))

  // Daftar Suggestion Chip yang bisa ditambah/diedit admin
  const suggestions = useState<ChatbotSuggestion[]>('chatbot_suggestions', () => [
    { id: '1', label: '🎓 Cara Daftar SPMB', topic: 'spmb', order: 1, isActive: true },
    { id: '2', label: '💻 Jurusan SMK IT', topic: 'jurusan', order: 2, isActive: true },
    { id: '3', label: '📖 Program Tahfidz', topic: 'tahfidz', order: 3, isActive: true },
    { id: '4', label: '💰 Info Biaya & Beasiswa', topic: 'biaya', order: 4, isActive: true },
    { id: '5', label: '🏢 Fasilitas & BLK', topic: 'fasilitas', order: 5, isActive: true },
    { id: '6', label: '📍 Lokasi & Kontak', topic: 'kontak', order: 6, isActive: true }
  ])

  // Bank Tanya-Jawab AI (Knowledge Base)
  const knowledgeBase = useState<ChatbotKnowledgeItem[]>('chatbot_kb', () => [
    {
      id: 'kb-spmb',
      key: 'spmb',
      query: 'Bagaimana cara daftar SPMB?',
      keywords: ['spmb', 'daftar', 'syarat', 'alur', 'pmb', 'buka', 'registrasi', 'formulir'],
      text: 'Pendaftaran SPMB TP 2026/2027 telah dibuka untuk jenjang <b>SMK IT Attaqwa 9</b> dan <b>SMP IT Bina Cendekia Assalam</b>.<br><br><b>Alur Pendaftaran:</b><br>1. Isi formulir online SPMB<br>2. Upload berkas persyaratan<br>3. Tes pemetaan &amp; wawancara<br>4. Pengumuman &amp; Daftar Ulang.',
      btnText: 'Buka Form SPMB Online',
      btnLink: '/spmb',
      isActive: true
    },
    {
      id: 'kb-jurusan',
      key: 'jurusan',
      query: 'Info Jurusan SMK IT Attaqwa 9',
      keywords: ['jurusan', 'tkj', 'rpl', 'komputer', 'it', 'prodi', 'kejuruan', 'keahlian'],
      text: '<b>Kompetensi Keahlian SMK IT Attaqwa 9:</b><br>• <b>Teknik Komputer &amp; Jaringan (TKJ):</b> Network engineering, cloud, cybersecurity &amp; mikrotik.<br>• <b>Rekayasa Perangkat Lokak (RPL):</b> Web &amp; mobile app development, database, UI/UX.<br>• Dilengkapi <b>Balai Latihan Kerja (BLK) Komunitas</b> standar industri DUDIKA.',
      btnText: 'Daftar di SMK IT',
      btnLink: '/spmb',
      isActive: true
    },
    {
      id: 'kb-tahfidz',
      key: 'tahfidz',
      query: 'Program Tahfidz & Keagamaan',
      keywords: ['tahfidz', 'quran', 'imtaq', 'islam', 'agama', 'tahsin', 'juz', 'hafalan', 'halaqah'],
      text: "<b>Program Unggulan Tahfidz &amp; IMTAQ:</b><br>• Target hafalan 3-5 Juz mutqin.<br>• Bimbingan Tahsin bersanad &amp; halaqah Al-Qur'an pagi/sore.<br>• Pembiasaan ibadah harian: Sholat Dhuha, Dzikir pagi, Sholat berjamaah &amp; pembinaan adab/akhlak.",
      btnText: 'Daftar Program Tahfidz',
      btnLink: '/spmb',
      isActive: true
    },
    {
      id: 'kb-biaya',
      key: 'biaya',
      query: 'Info Biaya & Beasiswa',
      keywords: ['biaya', 'uang', 'spp', 'beasiswa', 'bayar', 'harga', 'gratis', 'dana', 'diskon', 'cicilan'],
      text: 'Biaya pendidikan di Attaqwa 9 sangat terjangkau &amp; transparan dengan opsi cicilan.<br><br>Tersedia <b>Beasiswa Prestasi</b> bagi:<br>• Penghafal Al-Qur\'an (Tahfidz)<br>• Juara olimpiade sains/teknologi/olahraga/seni<br>• Beasiswa jalur yatim/dhuafa berprestasi.',
      btnText: 'Konsultasi Biaya SPMB',
      btnLink: '/spmb',
      isActive: true
    },
    {
      id: 'kb-fasilitas',
      key: 'fasilitas',
      query: 'Fasilitas & Gedung BLK',
      keywords: ['fasilitas', 'lab', 'blk', 'gedung', 'sarana', 'ruang', 'lapangan', 'masjid', 'aula', 'wifi'],
      text: '<b>Fasilitas Unggulan Attaqwa 9:</b><br>• Laboratorium Komputer &amp; Jaringan Modern<br>• Gedung BLK Komunitas Teknik Informatika<br>• Masjid &amp; Aula Kegiatan Representatif<br>• Rumah Bengkel &amp; Lab Kewirausahaan<br>• Lapangan Olahraga &amp; Free Wi-Fi Area.',
      btnText: 'Lihat Profil Lengkap',
      btnLink: '/#profil',
      isActive: true
    },
    {
      id: 'kb-kontak',
      key: 'kontak',
      query: 'Lokasi dan Kontak Sekolah',
      keywords: ['lokasi', 'alamat', 'kontak', 'telepon', 'wa', 'dimana', 'tempat', 'babelan', 'bekasi', 'email', 'maps'],
      text: '<b>Hubungi Sekretariat Attaqwa 9:</b><br>📍 Alamat: Jl. KH. Noer Alie, Ujung Harapan, Bahagia, Babelan, Kab. Bekasi 17610.<br>📞 Telp: 021-88886776<br>✉️ Email: smkitattaqwa09@gmail.com<br>⏰ Jam Layanan: Senin - Sabtu (07.30 - 15.30 WIB).',
      btnText: 'Hubungi via Telepon',
      btnLink: 'tel:02188886776',
      isActive: true
    },
    {
      id: 'kb-cbt',
      key: 'cbt',
      query: 'Akses CBT / Ujian Online',
      keywords: ['cbt', 'ujian', 'soal', 'nilai cbt', 'login cbt'],
      text: 'Untuk layanan <b>CBT (Computer Based Test) / Ujian Online</b> siswa SMK IT Attaqwa 9, silakan akses portal ujian resmi.',
      btnText: 'Buka Portal CBT',
      btnLink: '/cbt',
      isActive: true
    },
    {
      id: 'kb-admin',
      key: 'admin',
      query: 'Akses Admin Portal',
      keywords: ['admin', 'portal', 'dashboard', 'guru login', 'staf'],
      text: 'Untuk akses <b>Admin Portal</b> manajemen guru &amp; staf sekolah, silakan login melalui portal admin.',
      btnText: 'Buka Admin Portal',
      btnLink: '/admin',
      isActive: true
    }
  ])

  // Helper pencarian / penanganan pertanyaan
  const matchAnswer = (queryKeyOrText: string) => {
    const raw = (queryKeyOrText || '').toLowerCase().trim()
    if (!raw) return null

    // 1. Cek Pertanyaan Rahasia / Konfidensial
    const isConfidential = settings.value.confidentialKeywords.some(keyword => raw.includes(keyword))
    if (isConfidential) {
      return {
        userDisplay: queryKeyOrText,
        text: settings.value.confidentialMessage,
        btnText: 'Hubungi Sekretariat',
        btnLink: 'tel:02188886776'
      }
    }

    // 2. Cek Exact Topic Match (dari tombol suggestion)
    const exactMatch = knowledgeBase.value.find(item => item.isActive && item.key.toLowerCase() === raw)
    if (exactMatch) {
      return {
        userDisplay: exactMatch.query,
        text: exactMatch.text,
        btnText: exactMatch.btnText,
        btnLink: exactMatch.btnLink
      }
    }

    // 3. Cek Keywords Match (dari input bebas pengguna)
    const keywordMatch = knowledgeBase.value.find(item =>
      item.isActive && item.keywords.some(kw => raw.includes(kw.toLowerCase()))
    )
    if (keywordMatch) {
      return {
        userDisplay: queryKeyOrText,
        text: keywordMatch.text,
        btnText: keywordMatch.btnText,
        btnLink: keywordMatch.btnLink
      }
    }

    // 4. Fallback jika pertanyaan tidak dikenali
    const sanitized = queryKeyOrText.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return {
      userDisplay: queryKeyOrText,
      text: settings.value.fallbackMessage.replace('{query}', `<b>${sanitized}</b>`),
      btnText: 'Daftar SPMB Online',
      btnLink: '/spmb'
    }
  }

  return {
    settings,
    suggestions,
    knowledgeBase,
    matchAnswer
  }
}
