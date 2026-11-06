# Graph Report - darqia  (2026-11-05)

## Corpus Check
- 340 files · ~968,110 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3943 nodes · 6043 edges · 225 communities (195 shown, 30 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- RBAC dan Hak Akses
- Agenda Mengajar Guru
- Editor Soal CBT (Admin Lama)
- Manajemen Kelas (Admin Lama)
- Absensi Guru (Admin V2)
- Modal dan Aksi CBT (Admin V2)
- Wizard Ujian CBT
- Absensi Admin V2
- Komponen Absensi Siswa
- Detail Kelas (Admin V2)
- Import Soal CBT
- Manajemen Pengguna
- Absensi Siswa (Admin Lama)
- Manajemen Guru
- Detail Data Siswa
- Raport Siswa
- Absensi Guru (Admin Lama)
- Editor Konten Website
- Login dan Dashboard Admin V2
- Jadwal Pelajaran
- Jadwal Mengajar
- Manajemen Mata Pelajaran
- Komponen Berita dan Informasi
- Kelas (Admin Lama)
- Konten Admin Lama
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 194
- Community 195
- Community 196
- Community 197

## God Nodes (most connected - your core abstractions)
1. `getAdminDestination()` - 49 edges
2. `useAdminGrade()` - 47 edges
3. `GradeType` - 31 edges
4. `GroupItem` - 22 edges
5. `GROUPS` - 22 edges
6. `showToast()` - 17 edges
7. `useAdminCbtData()` - 16 edges
8. `rp()` - 14 edges
9. `useGsapReveal()` - 14 edges
10. `usePerpus()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `pesanBentrok` --calls--> `jamTeks()`  [INFERRED]
  app/components/adminV2/jadwal/JadwalFormModal.vue → app/components/adminV2/jadwal/JadwalTimetable.vue
- `selectModule()` --calls--> `getAdminDestination()`  [EXTRACTED]
  app/pages/adminV2/jadwal-pelajaran/index.vue → app/components/adminV2/adminV2Data.ts
- `selectModule()` --calls--> `getAdminDestination()`  [EXTRACTED]
  app/pages/adminV2/konten/index.vue → app/components/adminV2/adminV2Data.ts
- `Props` --references--> `GradeType`  [EXTRACTED]
  app/components/adminV2/cbt/CbtV2DrawerPackageForm.vue → app/components/adminV2/cbt/cbtV2Data.ts
- `alihStatus()` --calls--> `refresh()`  [INFERRED]
  app/pages/adminV2/users/index.vue → app/components/adminV2/cbt/CbtV2ExamTokens.vue

## Import Cycles
- None detected.

## Communities (225 total, 30 thin omitted)

### Community 0 - "RBAC dan Hak Akses"
Cohesion: 0.05
Nodes (63): aktifId, alertAkun, anggota, batalkanIzin(), bolehKelola, centang(), centangKolom(), draf (+55 more)

### Community 1 - "Agenda Mengajar Guru"
Cohesion: 0.03
Nodes (56): activeMegaGroup, activeTab, agenda, attendanceMap, books, classOptions, client, completeResultCount (+48 more)

### Community 2 - "Editor Soal CBT (Admin Lama)"
Cohesion: 0.03
Nodes (46): activeClasses, activeFormatFilter, {
  bankPackages,
  allBankPackages,
  grade,
  fetchBankPackagesFromDb,
  savePackageToDb,
  deletePackageFromDb,
  isDbLoading,
  isDbConnected
}, classFilterLevel, classFilterStatus, classSearchQuery, classSubjectPackages, editingPackageId (+38 more)

### Community 3 - "Manajemen Kelas (Admin Lama)"
Cohesion: 0.03
Nodes (47): activeSlot, activeSubmenu, allExams, attendancePeriod, classData, classIdParam, ClassRombel, countModalStatus (+39 more)

### Community 4 - "Absensi Guru (Admin V2)"
Cohesion: 0.03
Nodes (54): activeDataset, activeGrade, activeMegaGroup, alpaCount, alpaRate, currentPage, days, donutSegments (+46 more)

### Community 5 - "Modal dan Aksi CBT (Admin V2)"
Cohesion: 0.05
Nodes (47): activeMegaGroup, activeTab, assessmentSource, bankEntry, cbtData, closeAllModals(), closeAllPopovers(), closeDrawer() (+39 more)

### Community 6 - "Wizard Ujian CBT"
Cohesion: 0.04
Nodes (46): acakCount, acakRolled, availablePackages, availableSubjects, bankQuestions, cbtData, classExams, currentExams (+38 more)

### Community 7 - "Absensi Admin V2"
Cohesion: 0.05
Nodes (45): ABSENSI_TABS, AbsensiSubmenuId, AbsensiTabItem, activeDetailRecord, activeMegaGroup, activeSubmenu, alpaCount, currentRecords (+37 more)

### Community 8 - "Komponen Absensi Siswa"
Cohesion: 0.05
Nodes (23): Emits, Props, props, isOpen, props, duplicatedEvents, props, ABSENSI_CONFIG (+15 more)

### Community 9 - "Detail Kelas (Admin V2)"
Cohesion: 0.05
Nodes (43): generateMockSchedule(), activeMegaGroup, activeSubmenu, attendanceList, availableClasses, cbtData, classIdParam, closeAllModals() (+35 more)

### Community 10 - "Import Soal CBT"
Cohesion: 0.05
Nodes (36): activeFormat, allClasses, allSubjects, bankLabel, bankMode, cbtData, closeImport(), confirmImport() (+28 more)

### Community 11 - "Manajemen Pengguna"
Cohesion: 0.05
Nodes (39): activeCount, activeMegaGroup, adminCount, akunSayaId, authRole, authUser, AuthUserRow, AuthUsersResponse (+31 more)

### Community 12 - "Absensi Siswa (Admin Lama)"
Cohesion: 0.05
Nodes (32): activeGrade, activeSubmenu, attendanceHistoryMock, availableClassrooms, classSummaryMatrix, closeStudentDetail(), currentPage, days (+24 more)

### Community 13 - "Manajemen Guru"
Cohesion: 0.06
Nodes (35): activeMegaGroup, deletingStaff, editingStaff, executeDelete(), exportStaffCsv(), filteredStaff, grade, handleBatchImported() (+27 more)

### Community 14 - "Detail Data Siswa"
Cohesion: 0.05
Nodes (36): accent, activeMegaGroup, activeTab, attendance, attendancePct, canReveal, cardValidUntil, cls (+28 more)

### Community 15 - "Raport Siswa"
Cohesion: 0.06
Nodes (35): emit, Props, props, ReportStudent, activeMegaGroup, activePreviewStudent, availableClasses, classPills (+27 more)

### Community 16 - "Absensi Guru (Admin Lama)"
Cohesion: 0.05
Nodes (30): activeGrade, activeSubmenu, attendanceHistoryMock, closeTeacherDetail(), currentPage, days, donutSegments, filteredRows (+22 more)

### Community 17 - "Editor Konten Website"
Cohesion: 0.05
Nodes (33): activeCategories, activeMegaGroup, articles, banners, canvasBlob(), categories, form, formError (+25 more)

### Community 18 - "Login dan Dashboard Admin V2"
Cohesion: 0.05
Nodes (33): alertMsg, alertType, clockWib, countAlumni, countApps, countDomains, dateWib, errPass (+25 more)

### Community 19 - "Jadwal Pelajaran"
Cohesion: 0.06
Nodes (33): daftarTahun, durasiJPEntri(), entriDiLuarPola, entriEdit, entriKelas, formAwal, formTerbuka, guruMap (+25 more)

### Community 20 - "Jadwal Mengajar"
Cohesion: 0.06
Nodes (35): diHariIni(), kunciPelajaran(), activeMegaGroup, activeSubmenu, closeAllPopovers(), currentPersona, endLiveSession(), formattedTodayDate (+27 more)

### Community 21 - "Manajemen Mata Pelajaran"
Cohesion: 0.06
Nodes (35): activeMegaGroup, closeAllModals(), deleteTarget, editingItem, editingSubject, existingCodes, exportCsv(), filteredSubjects (+27 more)

### Community 22 - "Komponen Berita dan Informasi"
Cohesion: 0.06
Nodes (33): Banner, banner, Berita, berita, beritaAktif, feature(), grade, hapusKategori() (+25 more)

### Community 23 - "Kelas (Admin Lama)"
Cohesion: 0.05
Nodes (27): activeGrade, activeSubmenu, categoryChips, chartLabels, chartSeries, ClassRombel, currentPage, donutSegments (+19 more)

### Community 24 - "Konten Admin Lama"
Cohesion: 0.06
Nodes (35): add(), Banner, banner, bannerForm, Berita, berita, beritaAktif, beritaForm (+27 more)

### Community 25 - "Community 25"
Cohesion: 0.07
Nodes (29): emit, Props, emit, Props, emit, Props, Props, activeMegaGroup (+21 more)

### Community 26 - "Community 26"
Cohesion: 0.07
Nodes (33): activeMegaGroup, activeTab, closeAllPopovers(), currentProfile, currentWho, editForm, formattedTodayDate, handleCopyText() (+25 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (35): baris, bayarGlobal, bayarTerakhir, belumKode, cari, cariCepat, cutoffTerakhir, daftarTampil (+27 more)

### Community 28 - "Community 28"
Cohesion: 0.07
Nodes (33): admin, aktif, belumDitempatkan, cari, chips, chipStatusKelas, editId, eksporCsv() (+25 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (22): activeSuggestions, ask(), chatBody, chatInput, chatOpen, diAdmin, handleQuery(), isTyping (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (31): classAvg, classroom, classrooms, currentSubjects, exportLedger(), filteredStudents, firstNames, getPredicate() (+23 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (30): BANK_SUBJECTS, CbtTabDef, ClassResultItem, EXAM_GROUPS, ExamGroupItem, INITIAL_EXAMS, INITIAL_LIVE_STUDENTS, INITIAL_PACKAGES (+22 more)

### Community 32 - "Community 32"
Cohesion: 0.13
Nodes (28): BarisSiswa, BAYAR_CONTOH, BULAN_ID, Cutoff, CUTOFF_CONTOH, formatTanggal(), Grade, Halaman (+20 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (28): AgendaAttendance, AgendaCalculation, AgendaMeeting, AgendaMode, AgendaScore, AgendaStudent, AgendaTab, AgendaTabData (+20 more)

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (24): Props, activeMegaGroup, gradeText, handleCreateRecommendedClasses(), handleDeactivateStudent(), handleImportStudents(), handleSaveStudent(), handleSelectModule() (+16 more)

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (25): teksWA, belum, buat(), cutoffs, dari, grade, hapus(), K (+17 more)

### Community 36 - "Community 36"
Cohesion: 0.08
Nodes (24): BreadcrumbItem, Props, ACTIVITIES, ActivityRow, ADMIN_DESTINATIONS, ANNOUNCEMENTS, GroupItem, GROUPS (+16 more)

### Community 37 - "Community 37"
Cohesion: 0.08
Nodes (26): Props, ExamItem, Props, Props, attentionExams, bankClassCount, cbtData, currentExams (+18 more)

### Community 38 - "Community 38"
Cohesion: 0.08
Nodes (24): accounts, classrooms, currentTransactions, filteredAccounts, firstNames, form, lastNames, message (+16 more)

### Community 39 - "Community 39"
Cohesion: 0.10
Nodes (20): autoExpandActiveMenu(), emit, expandedMenus, grade, handleSubClick(), isItemActive(), props, route (+12 more)

### Community 40 - "Community 40"
Cohesion: 0.08
Nodes (22): activeExam, cbtData, collected, doing, emit, exportRosterCsv(), filteredStudents, filterStatus (+14 more)

### Community 41 - "Community 41"
Cohesion: 0.08
Nodes (23): berkasBukti, catatan, emit, galatAksi, hapus(), infoBukti, kirim(), konfirmHapus (+15 more)

### Community 42 - "Community 42"
Cohesion: 0.10
Nodes (13): useGsapReveal(), activeEkskulFilter, ekskulList, instagramPosts, isLiveFeed, activeTab, activeEkskulFilter, ekskulList (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.08
Nodes (21): alihGrup(), BarisDetail, BarisRekap, client, detailGrup, grupPerModul, hanyaMasalah, keadaan (+13 more)

### Community 44 - "Community 44"
Cohesion: 0.10
Nodes (17): INITIAL_STUDENTS_SMK, INITIAL_STUDENTS_SMP, KELAS_DATA, mkStudent(), SiswaFilter, SMK_ROWS, SMP_ROWS, STREETS (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.10
Nodes (22): berlanjut, babTerakhir, diRak, emit, mulai, P, persen, prog (+14 more)

### Community 46 - "Community 46"
Cohesion: 0.09
Nodes (23): angka, bisa, cari, emit, galat, gradeAktif, hasil, hasilCari (+15 more)

### Community 47 - "Community 47"
Cohesion: 0.08
Nodes (22): activeTab, cashflowDatasets, filteredTransactions, form, infaqClasses, infaqHistoryDatasets, infaqProgress, infaqTotal (+14 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (18): bandW, containerRef, getSeriesPoints(), getX(), getY(), hiddenSeries, hoverIndex, id (+10 more)

### Community 49 - "Community 49"
Cohesion: 0.08
Nodes (17): activeGroups, classExams, { exams, allExams, grade, activeTab }, isCreateExamModalOpen, isViolationModalOpen, newExamClass, newExamDate, newExamDuration (+9 more)

### Community 50 - "Community 50"
Cohesion: 0.10
Nodes (21): getAdminDestination(), emit, GroupItem, handleSelect(), isAvailable(), itemsTerlihat, Props, props (+13 more)

### Community 51 - "Community 51"
Cohesion: 0.11
Nodes (19): entriGuru, grupGuru, guruDipilih, props, ringkasan, emit, gayaGrid, indeksBaris (+11 more)

### Community 52 - "Community 52"
Cohesion: 0.13
Nodes (21): BULAN_PANJANG, BULAN_SINGKAT, csvSpmb(), fmtTanggalPanjang(), gabungTtl(), kanonStatus(), normalizeRecord(), parseTtl() (+13 more)

### Community 53 - "Community 53"
Cohesion: 0.12
Nodes (21): emit, errorMessage, fileName, handleApplyImport(), handleDownloadTemplate(), handleDrop(), handleFile(), handleFileChange() (+13 more)

### Community 54 - "Community 54"
Cohesion: 0.12
Nodes (20): CBT_TABS, CbtTabId, GradeType, activeTabLabel, emit, Props, props, schoolName (+12 more)

### Community 55 - "Community 55"
Cohesion: 0.12
Nodes (21): aksi(), catatan, doArsipkan(), doAturTahap(), doKembalikan(), doKumpulkan(), doSetujui(), modul (+13 more)

### Community 56 - "Community 56"
Cohesion: 0.10
Nodes (19): bangunModul(), catatan, ditolak, draf, namaPenyusun, pemantikTeks, props, SATUAN (+11 more)

### Community 57 - "Community 57"
Cohesion: 0.13
Nodes (20): perJenjang, admin, bagiRata(), batalkan(), daftar, emit, placed, pool (+12 more)

### Community 58 - "Community 58"
Cohesion: 0.09
Nodes (17): activeCategory, Article, articlesData, categories, closeModal(), copiedToast, currentPage, featuredHeadline (+9 more)

### Community 59 - "Community 59"
Cohesion: 0.09
Nodes (17): activeCategory, Article, articlesData, categories, closeModal(), copiedToast, currentPage, featuredHeadline (+9 more)

### Community 60 - "Community 60"
Cohesion: 0.12
Nodes (17): activeQuestion, activeQuestionId, activeQuestionIndex, addQuestion(), blankQuestion(), currentStep, draft, emit (+9 more)

### Community 61 - "Community 61"
Cohesion: 0.13
Nodes (21): busyAll, busyId, cbtData, copyToken(), emit, ineligibleCount, issueAll(), issuedCount (+13 more)

### Community 62 - "Community 62"
Cohesion: 0.10
Nodes (18): bayarUntuk, cetak, emit, grade, K, namaBiaya, nominalBiaya, notif (+10 more)

### Community 63 - "Community 63"
Cohesion: 0.11
Nodes (20): CATEGORIES, emit, failedRows, fileInput, fileName, handleFileChange(), issueRows, normalizeHeader() (+12 more)

### Community 64 - "Community 64"
Cohesion: 0.13
Nodes (17): props, userAccess, ACCESS, AccessLevel, ACTIVITIES, MODULE_INFO, MODULES, ProfileCompleteness (+9 more)

### Community 65 - "Community 65"
Cohesion: 0.10
Nodes (16): activeUsersCount, addForm, adminCount, filteredUsers, filterQ, filterRole, getAvatarStyle(), guruCount (+8 more)

### Community 66 - "Community 66"
Cohesion: 0.09
Nodes (17): activeMegaGroup, activeSubmenu, cbtData, editingClass, isCreateModalOpen, isMegaOpen, isMobileMenuOpen, isNotifOpen (+9 more)

### Community 67 - "Community 67"
Cohesion: 0.11
Nodes (13): PresensiRecord, emit, Props, emit, gate, handleSave(), note, Props (+5 more)

### Community 68 - "Community 68"
Cohesion: 0.18
Nodes (19): ClassMeta, GuruRingkas, guruStatus(), isoTanggalLokal(), JedaSlot, kunciSesi(), LessonSlot, MapelMeta (+11 more)

### Community 69 - "Community 69"
Cohesion: 0.11
Nodes (20): pilihBukti(), berkas, deskripsi, emit, galatBerkas, galatForm, { gradeAktif, buatTiket, ubahTiket }, gradeForm (+12 more)

### Community 70 - "Community 70"
Cohesion: 0.10
Nodes (18): baris, berjalan, client, emit, guru, GuruBaris, hasil, jalankanImpor() (+10 more)

### Community 71 - "Community 71"
Cohesion: 0.12
Nodes (18): activeData, activeDiff, activePoint, activeTotal, chartMode, getSmoothPath(), getX(), getY() (+10 more)

### Community 72 - "Community 72"
Cohesion: 0.13
Nodes (17): emit, filteredGroups, GroupItem, handleGroupHeaderClick(), handleItemClick(), handleLogout(), hasResults, isAvailable() (+9 more)

### Community 73 - "Community 73"
Cohesion: 0.11
Nodes (17): CLASS_RESULTS, INITIAL_RESULTS, StudentResult, classGroups, currentGradeResults, emit, exportCsv(), filteredStudents (+9 more)

### Community 74 - "Community 74"
Cohesion: 0.13
Nodes (19): DayName, LessonItem, LessonSession, lessonsOf(), menitDariTeks(), PersonaInfo, rentangSlot(), slotMin() (+11 more)

### Community 75 - "Community 75"
Cohesion: 0.12
Nodes (18): cari, chipsStatus, daftarGradeAktif, emit, gradeSebelah, jumlahSebelah, rbac, saringGrade (+10 more)

### Community 76 - "Community 76"
Cohesion: 0.21
Nodes (16): BUKU_CONTOH, SISWA_CONTOH, BabBuku, Buku, judulSub(), judulUtama(), jurusanDariKelas(), PetaProgres (+8 more)

### Community 77 - "Community 77"
Cohesion: 0.11
Nodes (11): isMobileMenuOpen, isScrolled, contactForm, activeFilter, beritaList, filteredBerita, faqList, openFaqIndex (+3 more)

### Community 78 - "Community 78"
Cohesion: 0.12
Nodes (18): BANK_CLASSES, StudentScore, classOptions, emit, essayInputScore, handleCreateExamSubmit(), handleSaveScore(), newExamClass (+10 more)

### Community 79 - "Community 79"
Cohesion: 0.18
Nodes (18): bentrok, slotBerjalan, slots, pratinjau, bangunSlotJam(), BentrokHasil, cariBentrok(), jamBerlangsung() (+10 more)

### Community 80 - "Community 80"
Cohesion: 0.12
Nodes (15): classActivities, presensiPeriod, props, todaySchedule, upcomingExams, generateMockAttendance(), generateMockExams(), generateMockGrades() (+7 more)

### Community 81 - "Community 81"
Cohesion: 0.11
Nodes (15): categoryChips, ClassRombel, currentPage, emit, filteredClasses, filterGrade, filterMajor, pagedClasses (+7 more)

### Community 82 - "Community 82"
Cohesion: 0.13
Nodes (18): unduhPdf(), barisDariModul(), BobotModul, buatHtmlCetak(), BULAN, isiBawaan(), JenisModul, KriteriaModul (+10 more)

### Community 83 - "Community 83"
Cohesion: 0.13
Nodes (15): berkasBukti, emit, f, galat, judul, nonTunai, props, simpan() (+7 more)

### Community 84 - "Community 84"
Cohesion: 0.18
Nodes (11): currentTimestamp, emit, props, FilteredQuestionItem, LoginForm, ModalState, QuestionItem, RevFilterType (+3 more)

### Community 85 - "Community 85"
Cohesion: 0.17
Nodes (17): BATAS_BERKAS, GradeTiket, kelasStatus(), SaringTiket, StatusTiket, teksLogPerubahan(), TIKET_KATEGORI_MODUL, TIKET_PROGRESS (+9 more)

### Community 86 - "Community 86"
Cohesion: 0.12
Nodes (14): emit, gateOptions, kelasOptions, Props, props, statusOptions, currentLabel, dropdownRef (+6 more)

### Community 87 - "Community 87"
Cohesion: 0.13
Nodes (16): barisRekap, BULAN_ID, bulanDipilih, client, fmtTgl(), grade, memuat, muatSemua() (+8 more)

### Community 88 - "Community 88"
Cohesion: 0.12
Nodes (12): fJenis, fPenyusun, fStatus, hasil, kata, penyusunUnik, props, store (+4 more)

### Community 89 - "Community 89"
Cohesion: 0.13
Nodes (15): activeMegaGroup, crumbs, grade, isMegaOpen, isMobileMenuOpen, isNotifOpen, isProfileOpen, isSearchOpen (+7 more)

### Community 90 - "Community 90"
Cohesion: 0.13
Nodes (16): authUser, emit, filteredSearch, handleProfileAction(), handleSearchSelect(), { isDark, toggleTheme, initTheme }, profileEmail, profileName (+8 more)

### Community 91 - "Community 91"
Cohesion: 0.16
Nodes (13): emit, formattedBirthDate, props, emit, getInitial(), getPosition(), getText(), getUserRole() (+5 more)

### Community 92 - "Community 92"
Cohesion: 0.13
Nodes (11): DAYS, Jenjang, rosterOf(), StudentRosterItem, alpaSet, emit, handleStart(), mode (+3 more)

### Community 93 - "Community 93"
Cohesion: 0.14
Nodes (14): fmtMin(), genGrid(), GuruStatus, JEDA, SLOT_TIMES, classOptions, currentClassMeta, emit (+6 more)

### Community 94 - "Community 94"
Cohesion: 0.14
Nodes (12): activeDropdown, closeDrawer(), drawerOpen, emit, goToKegiatan(), goToTab(), handleKeydown(), isScrolled (+4 more)

### Community 95 - "Community 95"
Cohesion: 0.12
Nodes (11): emit, galat, ilustrasi, kataIdx, kataKeluar, masuk(), nis, P (+3 more)

### Community 96 - "Community 96"
Cohesion: 0.12
Nodes (12): bab, babAktif, badan, diRak, emit, font, judulBab, nav() (+4 more)

### Community 97 - "Community 97"
Cohesion: 0.12
Nodes (4): isDropdownOpen, isMobileMenuOpen, isScrolled, schoolsDropdownRef

### Community 98 - "Community 98"
Cohesion: 0.12
Nodes (11): editingStaff, filteredStaff, formData, grade, isModalOpen, schoolName, searchQuery, selectedRole (+3 more)

### Community 99 - "Community 99"
Cohesion: 0.14
Nodes (16): applyAiSuggestion(), deletePackage(), deleteSingleQuestion(), downloadTemplate(), handleInteractiveFileUpload(), handleOptionImageUpload(), handleQuestionImageUpload(), handleSingleEditFileUpload() (+8 more)

### Community 100 - "Community 100"
Cohesion: 0.12
Nodes (11): activeClassSummaries, filteredStudents, filterStatus, inputEssayScore, { results, allResults, grade }, searchQuery, selectedClass, selectedStudentForEssay (+3 more)

### Community 101 - "Community 101"
Cohesion: 0.15
Nodes (15): classList, emit, errorMessage, form, handleSubmit(), isWarningReplace, mapelList, props (+7 more)

### Community 102 - "Community 102"
Cohesion: 0.16
Nodes (14): emit, filteredStudents, genderFilter, Props, props, search, ClassRombel, ClassStudentItem (+6 more)

### Community 103 - "Community 103"
Cohesion: 0.17
Nodes (14): angka(), grade, hapus(), K, ketBaru, modal, notif, paketGrade (+6 more)

### Community 104 - "Community 104"
Cohesion: 0.15
Nodes (15): cari, ekspor(), emit, fMetode, grade, hapus(), K, muat() (+7 more)

### Community 105 - "Community 105"
Cohesion: 0.15
Nodes (15): activeMegaGroup, crumbs, grade, isMegaOpen, isMobileMenuOpen, isNotifOpen, isProfileOpen, isSearchOpen (+7 more)

### Community 106 - "Community 106"
Cohesion: 0.12
Nodes (14): availableClasses, days, filteredSchedules, grade, ScheduleItem, scheduleList, schoolName, searchQuery (+6 more)

### Community 107 - "Community 107"
Cohesion: 0.12
Nodes (14): activePreviewStudent, availableClasses, completedCount, completionRate, filteredList, grade, ReportStudent, reportStudents (+6 more)

### Community 108 - "Community 108"
Cohesion: 0.12
Nodes (9): currentPerms, currentRole, isDirty, isLocked, roles, store, totalOn, totalPerms (+1 more)

### Community 109 - "Community 109"
Cohesion: 0.14
Nodes (9): bw, containerRef, Dataset, gw, id, maxV, niceMax(), props (+1 more)

### Community 110 - "Community 110"
Cohesion: 0.14
Nodes (10): points, props, useAdminData(), activeData, adminData, attendanceSeries, cashflowDatasets, currentDate (+2 more)

### Community 111 - "Community 111"
Cohesion: 0.13
Nodes (11): Props, props, emit, importMode, Props, selectedFileName, emit, isGapHot (+3 more)

### Community 112 - "Community 112"
Cohesion: 0.18
Nodes (14): emit, extractImageText(), extracting, extractionNote, formulaError, handleImage(), imageInput, localRtl (+6 more)

### Community 113 - "Community 113"
Cohesion: 0.17
Nodes (13): confirmImport(), emit, fileInputRef, handleDrop(), handleFileSelect(), isDragging, parseCsv(), parsedRows (+5 more)

### Community 114 - "Community 114"
Cohesion: 0.14
Nodes (14): buku, bukuku, bukuSpanduk, emit, gridTab, kata, literasi, P (+6 more)

### Community 115 - "Community 115"
Cohesion: 0.16
Nodes (8): SpmbRegistration, useSpmbForm(), isScrolled, {
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
}, isScrolled, {
  step,
  wizEl,
  form,
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
  modalSuccess,
  submittedReg,
  copyText,
  copyId,
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
}, isScrolled, {
  step,
  wizEl,
  form,
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
  modalSuccess,
  submittedReg,
  copyText,
  copyId,
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
}

### Community 116 - "Community 116"
Cohesion: 0.16
Nodes (10): editForm, ME, pass, preferences, saveProfile(), showEditModal, showToast(), toastKind (+2 more)

### Community 117 - "Community 117"
Cohesion: 0.19
Nodes (14): clearFormDraft(), deletePackage(), deleteQuestion(), draftStorageKey(), emit, exportCsv(), handleCancelForm(), handleSavePackage() (+6 more)

### Community 118 - "Community 118"
Cohesion: 0.21
Nodes (13): exportExcel(), readImportFile(), Props, BankPackage, BankQuestionItem, buildBankExcel(), clean(), DATA_HEADERS() (+5 more)

### Community 119 - "Community 119"
Cohesion: 0.15
Nodes (13): NotificationPrefs, emit, handlePasswordSubmit(), props, pwConf, pwCur, pwError, pwNew (+5 more)

### Community 120 - "Community 120"
Cohesion: 0.15
Nodes (8): filteredLogs, filterModul, filterQ, getAvatarStyle(), H(), store, todayLogsCount, uniqueModules

### Community 121 - "Community 121"
Cohesion: 0.18
Nodes (11): triggerAiFormulaAnalysis(), analyzeFormulaWithAi(), countWords(), escapeHtml(), FORMULA_PRESETS, FormulaAlternative, FormulaSuggestionResult, FormulaSymbol (+3 more)

### Community 122 - "Community 122"
Cohesion: 0.18
Nodes (12): hasil, mapels, emit, hasil, kata, mapel, mapels, P (+4 more)

### Community 123 - "Community 123"
Cohesion: 0.15
Nodes (11): courses, filteredCourses, grade, isModalOpen, LmsCourse, newCourse, schoolName, searchQuery (+3 more)

### Community 124 - "Community 124"
Cohesion: 0.15
Nodes (10): filteredSubjects, grade, isModalOpen, newForm, schoolName, searchQuery, selectedCategory, SubjectItem (+2 more)

### Community 125 - "Community 125"
Cohesion: 0.15
Nodes (10): filteredModules, grade, isModalOpen, LearningModule, modules, newModule, schoolName, searchQuery (+2 more)

### Community 126 - "Community 126"
Cohesion: 0.15
Nodes (6): bukuPilih, P, reader, sesi, Tampilan, tampilan

### Community 127 - "Community 127"
Cohesion: 0.18
Nodes (10): activeSubMenu, { cheatLogs, teachers, grade }, confirmUnlock(), filteredParticipants, isUnlockModalOpen, participants, selectedLogForUnlock, showToast() (+2 more)

### Community 128 - "Community 128"
Cohesion: 0.21
Nodes (9): isModalOpen, { liveExams, grade }, liveStudents, selectedExamForDetail, showToast(), toastMessage, triggerForceSubmit(), triggerUnlock() (+1 more)

### Community 129 - "Community 129"
Cohesion: 0.20
Nodes (11): AbsensiFilter, ATTENDANCE_TREND_7_DAYS, buildPresensiFromStudent(), computeRombelPresensi(), INITIAL_PRESENSI_SMK, INITIAL_PRESENSI_SMP, RECENT_RFID_TAPS, RecentTap (+3 more)

### Community 130 - "Community 130"
Cohesion: 0.18
Nodes (9): ActivityRow, downloadCSV(), emit, filteredRows, isAllSelected, Props, props, searchQuery (+1 more)

### Community 131 - "Community 131"
Cohesion: 0.23
Nodes (11): emit, form, kelasGrup, kirim(), namaGuru(), namaKelas(), namaMapel(), pesanBentrok (+3 more)

### Community 132 - "Community 132"
Cohesion: 0.18
Nodes (10): emit, filteredRecords, filterStatus, handleSubmit(), Props, props, records, search (+2 more)

### Community 133 - "Community 133"
Cohesion: 0.21
Nodes (10): emit, Props, props, usedTotal, codePreview, AdminSubject, CODE_STOP_WORDS, generateSubjectCode() (+2 more)

### Community 134 - "Community 134"
Cohesion: 0.17
Nodes (11): chipKelas, emit, langkahAktif, props, waHref, x, fmtWaktuSpmb(), samarNik() (+3 more)

### Community 135 - "Community 135"
Cohesion: 0.17
Nodes (9): berhasil, emailSaya, galat, konfirmasi, namaSaya, sandiBaru, sibuk, supabase (+1 more)

### Community 136 - "Community 136"
Cohesion: 0.38
Nodes (11): clean(), decodeXml(), documentXml(), fields(), ImportType, keyOf(), linesFromXml(), readWordBankTemplate() (+3 more)

### Community 137 - "Community 137"
Cohesion: 0.18
Nodes (9): icon, ICONS, props, grade, key, route, subtitle, title (+1 more)

### Community 138 - "Community 138"
Cohesion: 0.20
Nodes (7): copySuccessToast, { exams, liveExams, scheduledExams, completedExams, activeTab, cheatLogs, bank, results, grade }, Exam, useAdminCbtState(), { grade, activeTab, liveExams }, gradeText, tabs

### Community 139 - "Community 139"
Cohesion: 0.20
Nodes (6): activeTab, props, tabs, StudentItem, gradeText, studentsStore

### Community 140 - "Community 140"
Cohesion: 0.20
Nodes (6): attendanceHistoryMock, emit, handleSave(), localTeacher, props, TeacherAttendance

### Community 141 - "Community 141"
Cohesion: 0.22
Nodes (9): emit, OpenFilter, props, toggle(), emit, JournalForm, updateField(), AgendaBook (+1 more)

### Community 142 - "Community 142"
Cohesion: 0.18
Nodes (10): emit, hariIni, props, sekolah, tautanWA, formatTanggalPanjang(), LABEL_TINGKAT, persenTeks() (+2 more)

### Community 143 - "Community 143"
Cohesion: 0.20
Nodes (10): emit, form, formSchoolName, handleSubmit(), isEdit, Props, props, SubjectCategory (+2 more)

### Community 144 - "Community 144"
Cohesion: 0.22
Nodes (9): AVATAR_GRADIENTS, completeness(), initials(), comp, emit, props, ringOffset, comp (+1 more)

### Community 145 - "Community 145"
Cohesion: 0.18
Nodes (9): agendaList, filteredAgenda, grade, isModalOpen, newAgenda, schoolName, searchQuery, selectedStatus (+1 more)

### Community 146 - "Community 146"
Cohesion: 0.18
Nodes (4): crumb, idPilih, mode, tiketUbah

### Community 147 - "Community 147"
Cohesion: 0.20
Nodes (7): activeIndex, activeSegment, calculatedSegments, props, Segment, total, props

### Community 148 - "Community 148"
Cohesion: 0.31
Nodes (9): LiveStudent, assessmentTables(), CbtExamInput, examStatus(), formatDate(), formatTime(), isUuid(), questionRequests (+1 more)

### Community 149 - "Community 149"
Cohesion: 0.20
Nodes (9): emit, formatGuide, formFormat, packageClass, packageDifficulty, packageSubject, packageTeacher, Props (+1 more)

### Community 150 - "Community 150"
Cohesion: 0.22
Nodes (9): avgClass, emit, passCount, passPct, Props, props, selectedSubject, subjects (+1 more)

### Community 151 - "Community 151"
Cohesion: 0.20
Nodes (8): chartLabels, chartSeries, donutSegments, emit, gradeGroupSummary, Props, props, summaryCards

### Community 152 - "Community 152"
Cohesion: 0.31
Nodes (9): clean(), mutationErrorMessage(), numberOrNull(), RecommendedStudentClass, STUDENT_CSV_HEADERS, StudentClass, StudentMutationResult, textOrNull() (+1 more)

### Community 153 - "Community 153"
Cohesion: 0.20
Nodes (9): filteredSchedules, grade, schedules, schoolName, searchQuery, selectedDay, selectedTeacher, teacherNames (+1 more)

### Community 154 - "Community 154"
Cohesion: 0.25
Nodes (7): currentSection, emit, form, handleSubmit(), props, sections, sectionTitle

### Community 155 - "Community 155"
Cohesion: 0.22
Nodes (6): activePeriod, ATT_DATA, ChartPeriod, currentAverage, currentBars, Props

### Community 156 - "Community 156"
Cohesion: 0.22
Nodes (7): detectedActiveGroupId, emit, GroupItem, Props, props, route, visibleGroups

### Community 157 - "Community 157"
Cohesion: 0.28
Nodes (8): activeTab, emit, errorMessage, formData, handleKeyDown(), handleSubmit(), props, syncUserAccount

### Community 158 - "Community 158"
Cohesion: 0.25
Nodes (6): emit, kirim(), lokal, props, IstirahatSetelan, JadwalSetelan

### Community 159 - "Community 159"
Cohesion: 0.25
Nodes (8): counts, emit, filteredList, period, Props, props, selectedStatusFilter, ClassAttendanceDaily

### Community 160 - "Community 160"
Cohesion: 0.25
Nodes (8): activeDay, days, daySchedule, emit, Props, props, Props, ClassScheduleItem

### Community 161 - "Community 161"
Cohesion: 0.22
Nodes (7): maskNum(), ProfileAccount, props, showKk, showNik, emit, isOpen

### Community 162 - "Community 162"
Cohesion: 0.25
Nodes (7): BarisPengguna, emit, form, kirim(), konfirmasiHapus, peranAman, props

### Community 163 - "Community 163"
Cohesion: 0.22
Nodes (8): BankQuestionItem, BankSubjectPackage, ExamStatus, Question, QuestionType, StudentResult, TeacherRole, ViolationLog

### Community 164 - "Community 164"
Cohesion: 0.22
Nodes (9): action, closeAllPopovers(), flushScoreSaves(), handleSelectModule(), queueScore(), saveJournal(), selectSemester(), triggerToast() (+1 more)

### Community 165 - "Community 165"
Cohesion: 0.29
Nodes (8): openEditPackageForm(), openSingleQuestionEdit(), saveFullSubjectPackage(), saveSingleQuestionEdit(), detectedRtl, videoEmbedUrl(), extractYouTubeId(), isArabicText()

### Community 166 - "Community 166"
Cohesion: 0.39
Nodes (7): command(), editor, emit, insertLink(), insertMedia(), props, sync()

### Community 167 - "Community 167"
Cohesion: 0.32
Nodes (7): ClassFormData, emit, form, handleSubmit(), Props, props, CbtTeacher

### Community 168 - "Community 168"
Cohesion: 0.25
Nodes (7): emit, genderOptions, jurusanOptions, kelasOptions, Props, props, rfidOptions

### Community 169 - "Community 169"
Cohesion: 0.32
Nodes (5): activeGrade, doLogin(), emit, props, useAdminGrade()

### Community 170 - "Community 170"
Cohesion: 0.25
Nodes (5): activeModalData, activeModalKey, fasilitasList, modalDatabase, modalOpen

### Community 171 - "Community 171"
Cohesion: 0.25
Nodes (6): ActionPerms, LogEntry, ModulePerms, RolePerms, useAdminSystemStore(), User

### Community 172 - "Community 172"
Cohesion: 0.25
Nodes (5): faqs, formData, formSent, isSubmitting, openFaq

### Community 173 - "Community 173"
Cohesion: 0.33
Nodes (3): RombelPresensi, emit, Props

### Community 174 - "Community 174"
Cohesion: 0.33
Nodes (6): activeTab, destinations, emit, handleNav(), Props, route

### Community 175 - "Community 175"
Cohesion: 0.33
Nodes (5): emit, handleImport(), Props, selectedFile, selectedSubject

### Community 176 - "Community 176"
Cohesion: 0.33
Nodes (6): activeSubCategory, filteredExams, Props, props, timeFilter, ClassExamItem

### Community 177 - "Community 177"
Cohesion: 0.33
Nodes (6): emit, errorMessage, form, handleSave(), Props, props

### Community 178 - "Community 178"
Cohesion: 0.29
Nodes (7): attendanceStatus(), attendanceSummary(), cycleAttendance(), ensureMeeting(), openJournal(), setAttendance(), todayValue()

### Community 179 - "Community 179"
Cohesion: 0.33
Nodes (7): classAverage(), numericScore(), presentCount(), scoreValue(), studentResults, taskAverage(), taskValues()

### Community 180 - "Community 180"
Cohesion: 0.40
Nodes (5): closeBtn, emit, handleEscape(), props, widthClass

### Community 181 - "Community 181"
Cohesion: 0.33
Nodes (5): activeTab, currentExams, ExamTab, Props, props

### Community 182 - "Community 182"
Cohesion: 0.40
Nodes (5): activeSmkVmTab, activeSmpVmTab, emit, props, setJenjang()

### Community 183 - "Community 183"
Cohesion: 0.33
Nodes (6): archiveClass(), closeAllModals(), exportClassesCsv(), handleClassSaved(), handleSelectModule(), triggerToast()

### Community 184 - "Community 184"
Cohesion: 0.33
Nodes (6): downloadCard(), escapeHtml(), loadStudent(), openCard(), studentSlug(), toast()

### Community 185 - "Community 185"
Cohesion: 0.40
Nodes (3): isAdminLogin, isAdminRoute, route

### Community 186 - "Community 186"
Cohesion: 0.50
Nodes (4): closeButton, emit, handleEscape(), props

### Community 187 - "Community 187"
Cohesion: 0.40
Nodes (5): FormEssayQuestion, FormInteractiveQuestion, FormIsianQuestion, FormPgQuestion, Difficulty

### Community 188 - "Community 188"
Cohesion: 0.40
Nodes (3): emit, props, timerStr

### Community 189 - "Community 189"
Cohesion: 0.50
Nodes (4): ekskulList, emit, props, setTab()

### Community 190 - "Community 190"
Cohesion: 0.40
Nodes (5): clean(), date(), field(), groups, parents

### Community 191 - "Community 191"
Cohesion: 0.60
Nodes (5): alihStatus(), hapusUser(), pesanError(), simpanForm(), umumkan()

### Community 192 - "Community 192"
Cohesion: 0.50
Nodes (3): exportExcel(), unduhExcel(), exportExcel()

### Community 195 - "Community 195"
Cohesion: 0.67
Nodes (3): confirmFullAttendance(), showToast(), submitSlotAttendance()

### Community 196 - "Community 196"
Cohesion: 0.67
Nodes (3): formatDate(), meetingDateLabel(), selectedMeetingLabel

## Knowledge Gaps
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAdminGrade()` connect `Community 169` to `RBAC dan Hak Akses`, `Absensi Guru (Admin V2)`, `Community 137`, `Community 138`, `Absensi Siswa (Admin Lama)`, `Manajemen Guru`, `Absensi Guru (Admin Lama)`, `Community 145`, `Editor Konten Website`, `Jadwal Mengajar`, `Komponen Berita dan Informasi`, `Kelas (Admin Lama)`, `Community 152`, `Community 153`, `Konten Admin Lama`, `Community 27`, `Community 35`, `Community 163`, `Community 36`, `Community 39`, `Community 171`, `Community 46`, `Community 50`, `Community 62`, `Community 84`, `Community 87`, `Community 89`, `Community 91`, `Community 98`, `Community 103`, `Community 104`, `Community 105`, `Community 106`, `Community 107`, `Community 110`, `Community 123`, `Community 124`, `Community 125`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `RBAC dan Hak Akses` be split into smaller, more focused modules?**
  _Cohesion score 0.05093167701863354 - nodes in this community are weakly interconnected._
- **Why does `getAdminDestination()` connect `Community 50` to `Agenda Mengajar Guru`, `Absensi Guru (Admin V2)`, `Modal dan Aksi CBT (Admin V2)`, `Absensi Admin V2`, `Detail Kelas (Admin V2)`, `Manajemen Pengguna`, `Manajemen Guru`, `Detail Data Siswa`, `Raport Siswa`, `Editor Konten Website`, `Jadwal Mengajar`, `Manajemen Mata Pelajaran`, `Community 25`, `Community 26`, `Community 34`, `Community 36`, `Community 164`, `Community 183`, `Community 66`, `Community 72`, `Community 89`, `Community 105`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `Agenda Mengajar Guru` be split into smaller, more focused modules?**
  _Cohesion score 0.03173076923076923 - nodes in this community are weakly interconnected._
- **Why does `TiketRow` connect `Community 85` to `Community 41`, `Community 146`, `Community 69`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `Editor Soal CBT (Admin Lama)` be split into smaller, more focused modules?**
  _Cohesion score 0.03125 - nodes in this community are weakly interconnected._
- **Should `Manajemen Kelas (Admin Lama)` be split into smaller, more focused modules?**
  _Cohesion score 0.03225806451612903 - nodes in this community are weakly interconnected._