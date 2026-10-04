export const useAdminData = () => {
  // Data terpisah untuk SMP dan SMK
  // Nantinya bisa diganti dengan fetch ke API backend asli
  
  const smpData = {
    schoolName: 'SMP IT Bina Cendekia Assalam',
    kpi: {
      totalSiswa: 210,
      siswaBaru: '+12 semester ini',
      totalGuru: 28,
      guruTendik: '6 tendik · 28 guru',
      kehadiranSiswa: '96%',
      absenDetail: '12 alpa · 5 izin',
      pemasukanBulan: 'Rp 14.5M',
      pemasukanDelta: '+5.2% vs bln lalu'
    }
  }

  const smkData = {
    schoolName: 'SMK IT Attaqwa 9',
    kpi: {
      totalSiswa: 316,
      siswaBaru: '+24 semester ini',
      totalGuru: 42,
      guruTendik: '10 tendik · 32 guru',
      kehadiranSiswa: '92%',
      absenDetail: '8 alpa · 14 izin',
      pemasukanBulan: 'Rp 24.5M',
      pemasukanDelta: '+8.2% vs bln lalu'
    }
  }

  // Helper function untuk ngambil data sesuai grade aktif
  const getGradeData = (grade: string) => {
    return grade === 'SMP' ? smpData : smkData
  }

  return {
    smpData,
    smkData,
    getGradeData
  }
}
