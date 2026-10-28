import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { registerHooks, stripTypeScriptTypes } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'
import { createSSRApp, createRenderer, h, reactive, ref, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { routerKey } from 'vue-router'

const root = fileURLToPath(new URL('../', import.meta.url))
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('~/')) specifier = pathToFileURL(path.join(root, 'app', specifier.slice(2))).href
    if ((specifier.startsWith('.') || specifier.startsWith('file:')) && !path.extname(specifier)) specifier += '.ts'
    const result = next(specifier, context)
    if (context.parentURL?.endsWith('?ssr') && result.url.endsWith('.vue')) result.url += '?ssr'
    return result
  },
  load(url, context, next) {
    const filename = fileURLToPath(url)
    if (filename.endsWith('.vue')) {
      const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename })
      const ssr = url.endsWith('?ssr')
      const compiled = compileScript(descriptor, { id: 'cbt-test', inlineTemplate: ssr, templateOptions: { ssr } })
      return { format: 'module', shortCircuit: true, source: stripTypeScriptTypes(compiled.content, { mode: 'transform' }) }
    }
    return next(url, context)
  }
})

const { renderKaTeXHtml, validateLatexExpressions } = await import('../app/utils/cbtFormula.ts')
const { parseOcrExtraction, ocrTextsAgree, ocrTextsAgreeLoose } = await import('../server/utils/cbtOcr.ts')
assert.equal(ocrTextsAgree('بِسْمِ', 'بِسمِ'), false)
assert.equal(ocrTextsAgree('قَالُوا', 'قَالُوا ۖ'), false)
assert.equal(ocrTextsAgree('$$v^{2}$$', '$$v^2$$'), true)
assert.equal(ocrTextsAgree('$$\\sqrt{(b^2-4ac)}$$', '$$\\sqrt{b^{2}-4ac}$$'), true)
assert.equal(ocrTextsAgree('$$\\sqrt{b^2-4ac}$$', '$$\\sqrt{b^2-5ac}$$'), false)
assert.equal(ocrTextsAgreeLoose('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ', 'بسم الله الرحمن'), true)
assert.equal(ocrTextsAgreeLoose('خَلِيفَةً', 'خليفه'), true)
assert.equal(ocrTextsAgree('بسم الله الرحمن', 'بسم الله الرحيم'), false)
assert.equal(ocrTextsAgreeLoose('العدد ٥', 'العدد 5'), true)
assert.equal(ocrTextsAgreeLoose('$$\\dfrac{1}{2}$$', '$$\\frac{1}{2}$$'), true)
const { readWordBankTemplate } = await import('../app/utils/cbtWordBank.ts')
globalThis.window = { DecompressionStream, scrollTo() {} }
for (const grade of ['SMP', 'SMK']) {
  const name = `Template_Import_Bank_Soal_${grade}.docx`
  const imported = await readWordBankTemplate(new File([fs.readFileSync(path.join(root, 'public/templates', name))], name), grade,
    [grade === 'SMK' ? 'XI AKL' : 'VIII A'], ['Matematika'])
  assert.deepEqual(imported.issues, [])
  assert.deepEqual(imported.package.questions.map(q => q.type), ['PG', 'PG', 'Esai', 'Interaktif'])
  assert.equal(imported.package.questions[1].isMultiSelect, true)
  assert.deepEqual(imported.package.questions[1].key, ['A', 'C'])
  assert.equal(imported.package.questions[3].interactiveAnswerType, 'PG')
  assert.equal(imported.package.questions[3].options.length, grade === 'SMP' ? 4 : 5)
}
const formula = '$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$'
const payload = { text: formula, isRtl: false, containsFormula: true, reviewNote: '' }
const json = JSON.stringify(payload)
for (const content of [json, '```json\n' + json + '\n```', JSON.stringify(json), JSON.stringify(json).slice(1, -1)]) {
  assert.deepEqual(parseOcrExtraction(content), payload)
}
assert.throws(() => parseOcrExtraction('{"text":""}'))
assert.equal(validateLatexExpressions(formula), null)
assert.ok(validateLatexExpressions('$$\\frac{1}{2}'))
assert.ok(validateLatexExpressions('$$\\perintahSalah{x}$$'))
assert.ok(!renderKaTeXHtml('<img src=x onerror=alert(1)>').includes('<img'))
assert.match(renderKaTeXHtml(formula), /mfrac/)
assert.match(renderKaTeXHtml(formula), /dir="ltr"/)

globalThis.defineEventHandler = handler => handler
globalThis.getRequestIP = () => 'uji-lokal'
globalThis.useRuntimeConfig = () => ({ pecutMarketApiKey: 'kunci-uji-tanpa-koneksi' })
globalThis.readBody = async event => event.body
globalThis.createError = value => Object.assign(new Error(value.statusMessage), value)
const { default: ocr } = await import('../server/api/cbt/ocr.post.ts')
const ocrRequest = { body: { imageDataUrl: 'data:image/png;base64,YQ==' } }
let providerCalls = 0
let providerOutputs = []
globalThis.$fetch = async () => {
  providerCalls++
  return { choices: [{ message: { content: JSON.stringify(providerOutputs.shift()) } }] }
}
providerOutputs = [{ ...payload, text: 'x = 1/2' }, payload, payload]
assert.equal((await ocr(ocrRequest)).text, formula)
assert.equal(providerCalls, 3, 'Rumus polos dicoba ulang dan diperiksa dengan pembacaan independen')
providerOutputs = [{ ...payload, text: formula + '\nx = 1/2' }, { ...payload, text: '$$\\salah{x}$$' }]
await assert.rejects(ocr(ocrRequest), error => error.statusCode === 422)
providerOutputs = [{ ...payload, text: formula + '\n$$rumus belum ditutup' }, payload, payload]
assert.equal((await ocr(ocrRequest)).text, formula)
providerOutputs = [payload, { ...payload, text: '$$x = 999$$' }, { ...payload, text: '$$x = 123$$' }]
await assert.rejects(ocr(ocrRequest), error => error.statusCode === 422 && error.message.includes('belum cocok'))
providerOutputs = [
  { text: 'بِسْمِ ٱللَّهِ', isRtl: true, containsFormula: false, reviewNote: '' },
  { text: 'بسم الله', isRtl: true, containsFormula: false, reviewNote: '' },
  { text: 'بِسْمِ ٱللَّهِ', isRtl: true, containsFormula: false, reviewNote: '' }
]
assert.equal((await ocr(ocrRequest)).text, 'بِسْمِ ٱللَّهِ')
providerOutputs = [{ ...payload, text: '[tidak terbaca]', containsFormula: false }]
await assert.rejects(ocr(ocrRequest), error => error.statusCode === 422 && error.message.includes('tidak terbaca'))

// Data ini hanya berada dalam proses uji, tidak ditulis ke Supabase.
const ids = ['1', '2', '3'].map(n => `00000000-0000-4000-8000-${n.padStart(12, '0')}`)
const bankId = '00000000-0000-4000-8000-000000000010'
const classId = '00000000-0000-4000-8000-000000000011'
const subjectId = '00000000-0000-4000-8000-000000000012'
const rows = ids.map((id, index) => ({ id, bank_id: bankId, number: index + 1, type: index === 1 ? 'Isian' : 'PG', difficulty: 'Sedang', text: `Soal uji ${index + 1}`, answer_key: 'A' }))
const bank = { id: bankId, classId, subjectId, classroom: 'Kelas uji', subject: 'Mapel uji', grade: 'SMK', questions: rows.map(r => ({ id: r.id, number: r.number, type: r.type, text: r.text, difficulty: 'Sedang', key: 'A' })) }
const states = new Map()
const calls = []
const tablesRead = []
globalThis.useState = (key, initial) => {
  if (!states.has(key)) states.set(key, ref(initial()))
  return states.get(key)
}
globalThis.useSupabaseClient = () => ({
  from(table) {
    tablesRead.push(table)
    const result = { data: table.endsWith('questions') ? rows : table === 'teachers' ? [{ id: 'teacher', name: 'Guru uji', grade: 'SMK' }] : [], error: null }
    const chain = { select: () => chain, eq: () => chain, order: () => chain, then: (resolve) => Promise.resolve(result).then(resolve) }
    return chain
  },
  async rpc(name, args) { calls.push({ name, args }); return { data: bankId, error: null } }
})

const { default: Exams } = await import('../app/components/adminV2/cbt/CbtV2Exams.vue')
const vm = Exams.setup(reactive({ grade: 'SMK', source: 'cbt', exams: [] }), { expose() {}, emit() {} })
states.get('cbt-master-classes').value = [{ id: classId, name: 'Kelas uji', grade: 'SMK' }]
states.get('cbt-master-subjects').value = [{ id: subjectId, name: 'Mapel uji', grade: 'SMK' }]
states.get('cbt-bank-packages').value = [bank]
vm.openCreateSchedule()
await new Promise(setImmediate)
assert.deepEqual([...vm.selectedQuestionIds.value], ids)
vm.toggleQuestion(ids[1])
assert.equal(vm.selectedQuestionIds.value.length, 2)
vm.moveQuestion(1, -1)
assert.deepEqual([...vm.selectedQuestionIds.value], [ids[2], ids[0]])
vm.newExam.value.name = 'Ujian uji'
await vm.saveSchedule()
const saveCall = calls.filter(call => call.name === 'save_assessment_exam').at(-1)
assert.deepEqual([...saveCall.args.question_ids], [ids[2], ids[0]])
assert.equal(saveCall.args.source, 'cbt')
assert.equal(calls.at(-1).name, 'issue_exam_tokens', 'Token peserta diterbitkan tepat setelah ujian disimpan')
assert.equal(calls.at(-1).args.source, 'cbt')
states.get('cbt-bank-packages').value = [bank]
vm.newExam.value.questionBankId = bankId
await vm.loadSelection(null)
assert.deepEqual([...vm.selectedQuestionIds.value], ids, 'Ujian lama memuat semua soal')
await vm.loadSelection([ids[2], ids[0]])
assert.deepEqual([...vm.selectedQuestionIds.value], [ids[2], ids[0]], 'Urutan subset pulih saat mengedit')
assert.equal(bank.questions[1].type, 'Isian', 'Tipe soal lama tetap dipertahankan')
// Regresi: daftar mapel Langkah 1 berasal dari Master Mapel, bukan dari bank soal —
// rombel tanpa bank soal sama sekali tetap menampilkan seluruh mapel jenjangnya.
states.get('cbt-master-subjects').value = [{ id: subjectId, name: 'Mapel uji', grade: 'SMK' }]
states.get('cbt-bank-packages').value = []
assert.ok(vm.availableSubjects.value.some(subject => subject.id === subjectId), 'Mapel Master tetap muncul walau rombel belum memiliki bank soal')
vm.newExam.value.subjectId = ''
assert.equal(vm.subjectHasBank.value, true, 'Tanpa mapel terpilih belum ada peringatan bank')
vm.newExam.value.subjectId = subjectId
assert.equal(vm.subjectHasBank.value, false, 'Mapel tanpa bank di rombel memicu peringatan')
states.get('cbt-bank-packages').value = [bank]
vm.syncPackage()
assert.equal(vm.subjectHasBank.value, true, 'Peringatan hilang begitu bank soal tersedia')

const { default: BankForm } = await import('../app/components/adminV2/cbt/CbtV2BankForm.vue')
const form = BankForm.setup({ pkg: { ...bank, teacherName: 'Guru uji' }, grade: 'SMK', editing: true, initialStep: 'Isian' }, { expose() {}, emit() {} })
assert.equal(form.currentStep.value, 'Isian')
assert.ok(form.questionSteps.some(step => step.id === 'Isian'))
assert.equal(form.blankQuestion('Isian').key, '')
assert.equal(form.blankQuestion('Isian').options, undefined)
assert.equal(form.draft.value.questions[1].type, 'Isian')
form.nextStep()
assert.equal(form.currentStep.value, 'Esai')
assert.equal(form.blankQuestion('Interaktif').interactiveAnswerType, 'PG')
assert.equal(form.blankQuestion('PG').options.length, 5)
const smpForm = BankForm.setup({ pkg: { ...bank, grade: 'SMP', teacherName: 'Guru uji' }, grade: 'SMP', editing: false, classOptions: ['Kelas uji'], subjectOptions: ['Mapel uji'] }, { expose() {}, emit() {} })
assert.deepEqual(smpForm.blankQuestion('PG').options.map(option => option.key), ['A', 'B', 'C', 'D'])
assert.equal(smpForm.draft.value.questions[0].options.length, 4)
const oldMulti = { ...bank.questions[0], key: ['A', 'E'], isMultiSelect: true, options: ['A','B','C','D','E'].map(key => ({ key, text: key })) }
const repairedSmp = BankForm.setup({ pkg: { ...bank, grade: 'SMP', questions: [oldMulti] }, grade: 'SMP', editing: true, classOptions: ['Kelas uji'], subjectOptions: ['Mapel uji'] }, { expose() {}, emit() {} })
assert.deepEqual([...repairedSmp.draft.value.questions[0].key], ['A'])
assert.deepEqual(oldMulti.key, ['A', 'E'], 'Normalisasi editor tidak mengubah data asli sebelum disimpan')

const { useAdminCbtData } = await import('../app/composables/useAdminCbtData.ts')
const daily = useAdminCbtData('ujian_harian')
daily.classes.value = [{ id: classId, grade: 'SMK' }]
daily.subjects.value = [{ id: subjectId, grade: 'SMK' }]
daily.bankPackages.value = [bank]
tablesRead.length = 0
await daily.saveExam({ name: 'Ujian harian uji', classId, subjectId, questionBankId: bankId, questionIds: [ids[0]], startsAt: new Date().toISOString(), duration: 30 })
assert.equal(calls.filter(call => call.name === 'save_assessment_exam').at(-1).args.source, 'ujian_harian')
assert.equal(calls.at(-1).name, 'issue_exam_tokens')
assert.equal(calls.at(-1).args.source, 'ujian_harian', 'Token peserta ujian harian diterbitkan dari sumber yang sama')
assert.ok(tablesRead.includes('ujian_harian_banks'))
assert.ok(tablesRead.includes('ujian_harian'))
assert.ok(!tablesRead.includes('question_banks'))
assert.ok(!tablesRead.includes('exams'))

globalThis.useRoute = () => ({ query: {} })
let studentSession
const { useCbtExam } = await import('../app/composables/useCbtExam.ts')
const studentApp = createSSRApp({ setup() { studentSession = useCbtExam(); return () => h('div') } })
studentApp.provide(routerKey, { push() {} })
await renderToString(studentApp)
studentSession.loginForm.nis = 'nis-uji'
studentSession.loginForm.kode = 'token-uji'
globalThis.$fetch = async () => ({ id: 'exam-uji', duration: 30, questions: [rows[2], rows[0]] })
await studentSession.doLogin()
assert.deepEqual(studentSession.questions.value.map(q => q.id), [ids[2], ids[0]], 'Siswa hanya menerima subset dalam urutan respons server')
globalThis.$fetch = async () => ({ id: 'exam-lama-uji', duration: 90, questions: rows })
await studentSession.doLogin()
assert.equal(studentSession.questions.value.length, 3)
assert.equal(studentSession.questions.value[1].type, 'short', 'Soal lama Isian masih dimuat siswa')

const monitoringDb = {
  classes: [{ id: classId, name: 'Kelas uji', grade: 'SMK', active: true }],
  subjects: [{ id: subjectId, name: 'Mapel uji', grade: 'SMK', active: true }],
  teachers: [],
  students: ['A', 'B', 'C'].map(id => ({ id, name: `Peserta uji ${id}`, nisn: id, class_id: classId, grade: 'SMK', active: true })),
  question_banks: [{ id: bankId, code: 'BANK-UJI', grade: 'SMK', class_id: classId, subject_id: subjectId, updated_at: new Date().toISOString() }],
  questions: rows,
  exams: [{ id: 'ujian-monitor', name: 'Ujian tersimpan', code: 'TOKEN-UJI', grade: 'SMK', class_id: classId, subject_id: subjectId, question_bank_id: bankId, starts_at: new Date(Date.now() + 3600000).toISOString(), duration_minutes: 30, status: 'terjadwal' }],
  exam_assignments: [{ id: 'sesi-A', exam_id: 'ujian-monitor', student_id: 'A', status: 'berlangsung' }, { id: 'sesi-B', exam_id: 'ujian-monitor', student_id: 'B', status: 'selesai' }],
  exam_questions: [],
  exam_answers: [{ assignment_id: 'sesi-A', question_id: ids[0], answer: 'A', saved_at: new Date().toISOString() }, { assignment_id: 'sesi-A', question_id: ids[2], answer: '' }, { assignment_id: 'sesi-A', question_id: ids[1], answer: 'Di luar pilihan' }],
  exam_violations: [{ assignment_id: 'sesi-A', occurred_at: new Date().toISOString() }, { assignment_id: 'sesi-A', occurred_at: new Date().toISOString() }]
}
let failingTable = ''
globalThis.useSupabaseClient = () => ({ from(table) {
  const filters = []
  const query = {
    select: () => query, order: () => query,
    eq: (key, value) => { filters.push(row => row[key] === value); return query },
    in: (key, values) => { filters.push(row => values.includes(row[key])); return query },
    then: resolve => Promise.resolve({ data: (monitoringDb[table] || []).filter(row => filters.every(filter => filter(row))), error: table === failingTable ? { message: 'Koneksi uji gagal' } : null }).then(resolve)
  }
  return query
} })
const monitorData = useAdminCbtData('cbt')
await monitorData.load(true)
assert.equal(monitorData.error.value, null)
assert.equal(monitorData.teachers.value.length, 0, 'Data guru kosong tidak diisi seed contoh')
assert.equal(monitorData.classes.value[0].studentCount, 3)
assert.equal(monitorData.exams.value[0].participants, 2)
assert.equal(monitorData.exams.value[0].violations, 2)
assert.equal(monitorData.exams.value[0].status, 'Terjadwal')
await monitorData.loadQuestions(true)
const monitorExam = { ...monitorData.exams.value[0], questionIds: [ids[0], ids[2]] }
const roster = await monitorData.loadMonitoring(monitorExam)
assert.equal(roster.length, 2)
assert.equal(roster[0].progress, 1, 'Jawaban kosong dan soal di luar pilihan tidak dihitung')
assert.equal(roster[0].total, 2)
assert.equal(roster[0].violations, 2)
assert.equal(roster[1].status, 'Selesai')
failingTable = 'exam_answers'
await assert.rejects(monitorData.loadMonitoring(monitorExam), /Koneksi uji gagal/)
failingTable = ''
monitoringDb.exam_assignments = []
const unstarted = await monitorData.loadMonitoring({ ...monitorExam, questionIds: null })
assert.equal(unstarted.length, 3)
assert.ok(unstarted.every(student => student.status === 'Belum mulai' && student.total === 3 && student.lastActive === '-'))
monitoringDb.exam_assignments = [{ id: 'sesi-A', exam_id: 'ujian-monitor', student_id: 'A', status: 'berlangsung' }, { id: 'sesi-B', exam_id: 'ujian-monitor', student_id: 'B', status: 'selesai' }]
const { default: MonitoringSetup } = await import('../app/components/adminV2/cbt/CbtV2Monitoring.vue')
let monitoringVm
const monitoringProps = reactive({ grade: 'SMK', source: 'cbt', exams: [monitorExam], isFrozen: false })
const viewModelRenderer = createRenderer({
  createElement: tag => ({ tag, children: [] }), createText: text => ({ text }), createComment: text => ({ text }),
  insert: (node, parent) => { parent.children.push(node) }, remove() {},
  setElementText: (node, text) => { node.text = text }, setText: (node, text) => { node.text = text },
  patchProp() {}, parentNode: () => null, nextSibling: () => null
})
const monitoringApp = viewModelRenderer.createApp({ setup() {
  monitoringVm = MonitoringSetup.setup(monitoringProps, { expose() {}, emit() {} })
  return () => h('div')
} })
monitoringApp.mount({ children: [] })
await monitoringVm.refreshRoster()
assert.equal(monitoringVm.students.value.length, 2)
assert.equal(monitoringVm.students.value[0].progress, 1)
assert.equal(monitoringVm.displayCount(monitoringVm.doing.value), 1)
monitoringProps.grade = 'SMP'
await nextTick()
assert.equal(monitoringVm.activeExam.value, null)
assert.equal(monitoringVm.students.value.length, 0)
assert.equal(monitoringVm.displayCount(0), '-')
monitoringApp.unmount()
const { default: Monitoring } = await import('../app/components/adminV2/cbt/CbtV2Monitoring.vue?ssr')
const emptyMonitoringHtml = await renderToString(createSSRApp({ render: () => h(Monitoring, { grade: 'SMK', source: 'cbt', exams: [] }) }))
for (const label of ['Sesi ujian', 'Total peserta', 'Mengerjakan', 'Selesai submit', 'Belum mulai', 'Aktivitas peserta']) assert.ok(emptyMonitoringHtml.includes(label))
assert.doesNotMatch(emptyMonitoringHtml, /data contoh|Ahmad Fauzan|Snapshot|>Berlangsung</)
const { default: ExamsSsr } = await import('../app/components/adminV2/cbt/CbtV2Exams.vue?ssr')
const emptyExamsHtml = await renderToString(createSSRApp({ render: () => h(ExamsSsr, { grade: 'SMK', source: 'cbt', exams: [] }) }))
assert.doesNotMatch(emptyExamsHtml, />\s*Selesai\s*</)
assert.ok(emptyExamsHtml.includes('siswa aktif'))
const scheduledVm = Exams.setup({ grade: 'SMK', source: 'cbt', exams: monitorData.exams.value }, { expose() {}, emit() {} })
assert.equal(scheduledVm.groups.value[0].status, 'Terjadwal')
assert.equal(scheduledVm.groups.value[0].subjects, 1)
assert.equal(scheduledVm.groups.value[0].violations, 2)
const { default: Bank } = await import('../app/components/adminV2/cbt/CbtV2Bank.vue')
let bankVm
await renderToString(createSSRApp({ setup() {
  bankVm = Bank.setup({ grade: 'SMK', source: 'cbt' }, { expose() {}, emit() {} })
  return () => h('div')
} }))
assert.equal(bankVm.storedFormatCount.value, 2)
monitorData.bankPackages.value = []

const draftStore = new Map([['darqia:cbt-bank-draft:SMK', JSON.stringify({ draft: bank, editing: false })]])
globalThis.window.sessionStorage = { getItem: key => draftStore.get(key) || null, setItem: (key, value) => draftStore.set(key, value), removeItem: key => draftStore.delete(key) }
let storedDraftVm
const draftApp = viewModelRenderer.createApp({ setup() {
  storedDraftVm = Bank.setup({ grade: 'SMK', source: 'cbt' }, { expose() {}, emit() {} })
  return () => h('div')
} })
draftApp.mount({ children: [] })
assert.equal(storedDraftVm.hasSavedDraft.value, true)
assert.equal(storedDraftVm.bankMode.value, 'subjects', 'Draf tersimpan tidak membuka form secara otomatis')
let smpDraftVm
const smpDraftApp = viewModelRenderer.createApp({ setup() {
  smpDraftVm = Bank.setup({ grade: 'SMP', source: 'cbt' }, { expose() {}, emit() {} })
  return () => h('div')
} })
smpDraftApp.mount({ children: [] })
assert.equal(smpDraftVm.hasSavedDraft.value, false, 'Draf SMK tidak dimuat pada SMP')
assert.equal(smpDraftVm.formDraft.value, null)
draftApp.unmount()
smpDraftApp.unmount()
assert.equal(bankVm.storedFormatCount.value, 0)
const { default: BankSsr } = await import('../app/components/adminV2/cbt/CbtV2Bank.vue?ssr')
const emptyBankHtml = await renderToString(createSSRApp({ render: () => h(BankSsr, { grade: 'SMK', source: 'cbt' }) }))
assert.doesNotMatch(emptyBankHtml, /4 Format/)
assert.match(emptyBankHtml, /0 bank soal/)
assert.ok(emptyBankHtml.includes('Buat Bank Soal'))
assert.ok(!emptyBankHtml.includes('Konfigurasi paket ujian'))
const smpClassId = '00000000-0000-4000-8000-000000000013'
const smpSubjectId = '00000000-0000-4000-8000-000000000014'
monitorData.classes.value.push({ id: smpClassId, name: 'Kelas SMP', grade: 'SMP' })
monitorData.subjects.value.push({ id: smpSubjectId, name: 'Mapel SMP', grade: 'SMP' })
monitorData.classSubjects.value = [{ class_id: classId, subject_id: subjectId }, { class_id: smpClassId, subject_id: smpSubjectId }]
assert.deepEqual(bankVm.subjectsForClass('Kelas uji'), ['Mapel uji'])
assert.deepEqual(bankVm.subjectsForClass('Kelas SMP'), [])
assert.equal(bankVm.bankMode.value, 'subjects')
bankVm.startCreatePackage()
assert.equal(bankVm.formDraft.value.grade, 'SMK')
assert.equal(bankVm.formDraft.value.questions[0].options.length, 5)
const smpBank = { ...bank, id: 'bank-smp-uji', grade: 'SMP', classId: smpClassId, subjectId: smpSubjectId, classroom: 'Kelas SMP', subject: 'Mapel SMP' }
monitorData.bankPackages.value = [bank, smpBank]
assert.equal(bankVm.currentGradePackages.value.length, 1)
bankVm.selectedPkgId.value = smpBank.id
assert.equal(bankVm.selectedPackage.value, null)
await assert.rejects(monitorData.saveBankPackage(smpBank, 'SMK'), /Jenjang/)
await assert.rejects(monitorData.deleteBankPackage(smpBank.id, 'SMK'), /jenjang/)
await assert.rejects(monitorData.saveBankPackage({ ...bank, questions: [{ ...bank.questions[0], options: ['A','B','C','D'].map(key => ({key,text:key})) }] }, 'SMK'), /5 opsi/)
await assert.rejects(monitorData.saveBankPackage({ ...smpBank, questions: [{ ...bank.questions[0], options: ['A','B','C','D','E'].map(key => ({key,text:key})) }] }, 'SMP'), /4 opsi/)
bankVm.searchQuery.value = 'Mapel SMP'
assert.equal(bankVm.subjectPackages.value.length, 0)
monitorData.bankPackages.value = []

const { default: Editor } = await import('../app/components/adminV2/cbt/CbtRichQuestionEditor.vue?ssr')
const { default: EditorSetup } = await import('../app/components/adminV2/cbt/CbtRichQuestionEditor.vue')
const editorEvents = []
const editorProps = reactive({ modelValue: '', imageUrl: 'data:image/png;base64,YQ==', rtl: false })
const editorVm = EditorSetup.setup(editorProps, { expose() {}, emit: (event, value) => editorEvents.push([event, value]) })
let finishExtraction
globalThis.$fetch = () => new Promise(resolve => { finishExtraction = resolve })
const staleExtraction = editorVm.extractImageText()
editorProps.imageUrl = 'data:image/png;base64,Yg=='
finishExtraction({ text: 'Hasil gambar sebelumnya', isRtl: false, reviewNote: '' })
await staleExtraction
assert.ok(!editorEvents.some(([event]) => event === 'update:modelValue'))
assert.match(editorVm.extractionNote.value, /sudah berubah/)
globalThis.$fetch = async () => { throw { data: { statusMessage: 'Dua pembacaan belum cocok.' } } }
await editorVm.extractImageText()
assert.ok(!editorEvents.some(([event]) => event === 'update:modelValue'))
assert.equal(editorVm.extractionNote.value, 'Dua pembacaan belum cocok.')
const { default: Student } = await import('../app/components/cbt/CbtExamScreen.vue?ssr')
const componentStyles = ['CbtRichQuestionEditor.vue', '../../cbt/CbtExamScreen.vue'].map(filename => {
  const file = path.join(root, 'app/components/adminV2/cbt', filename)
  return parse(fs.readFileSync(file, 'utf8')).descriptor.styles.map(style => compileStyle({ source: style.content, filename: file, id: 'data-v-cbt-test', scoped: true }).code).join('\n')
}).join('\n')
const folder = path.join(root, 'docs/bukti-cbt-banksoal')
const latestOcr = JSON.parse(fs.readFileSync(path.join(folder, 'ocr-verifikasi-ganda-terakhir.json'), 'utf8'))
const longArabic = latestOcr.find(item => item.name === 'arab-panjang')
const expectedLongArabic = 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً قَالُوا أَتَجْعَلُ فِيهَا مَنْ يُفْسِدُ فِيهَا وَيَسْفِكُ الدِّمَاءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ لَكَ قَالَ إِنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ'
assert.equal(longArabic.status, 200)
assert.equal(longArabic.text.normalize('NFC').replace(/\s+/g, ''), expectedLongArabic.normalize('NFC').replace(/\s+/g, ''))
const longArabicEditor = await renderToString(createSSRApp({ render: () => h(Editor, { modelValue: longArabic.text }) }))
assert.match(longArabicEditor, /dir="rtl"/)
assert.match(longArabicEditor, /lang="ar"/)
fs.writeFileSync(path.join(folder, 'arab-panjang-render.html'), '<!doctype html><html lang="id"><meta charset="utf-8"><title>Render Arab panjang hasil OCR terverifikasi</title><style>'+componentStyles+'</style><body>'+longArabicEditor+'</body></html>')
fs.writeFileSync(path.join(folder, 'monitoring-kosong-render.html'), '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bukti struktur monitoring kosong</title><body>'+emptyMonitoringHtml+'</body></html>')
const evidence = []
for (const name of ['matematika', 'fisika', 'biologi', 'arab']) {
  const file = path.join(folder, `${name}-ocr.json`)
  if (!fs.existsSync(file)) { evidence.push({ name, status: 'BELUM ADA HASIL OCR' }); continue }
  const result = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))
  assert.equal(typeof result.text, 'string')
  const editor = await renderToString(createSSRApp({ render: () => h(Editor, { modelValue: result.text, rtl: result.isRtl }) }))
  const q = { sec: 'pg', type: 'single', text: result.text, isRtl: result.isRtl, options: ['A', 'B'] }
  const noop = () => false
  const student = await renderToString(createSSRApp({ render: () => h(Student, {
    screen: 'exam', grade: 'SMK', remainingTime: 5400, isSaving: false, isTimerFrozen: false,
    sections: [], questions: [q], curQuestion: q, totalQuestions: 1, qIdx: 0, answeredCount: 0, answers: {}, letters: ['A','B'],
    audioPlaying: false, showMobilePalette: false, fmtTime: () => '90:00', isSectionDone: noop, sectionDoneCount: () => 0,
    secRange: () => [0], typeLabel: () => 'PG', isFlagged: noop, isAnswered: noop, isOptionSelected: noop, countWords: () => 0
  }) }))
  for (const html of [editor, student]) {
    if (name === 'arab') {
      assert.ok(result.isRtl)
      assert.match(html, /dir="rtl"/)
      assert.ok(html.includes(result.text))
      assert.match(result.text, /[\u064B-\u065F]/u)
      assert.equal(result.text.normalize('NFC'), 'قُلْ هُوَ اللَّهُ أَحَدٌ'.normalize('NFC'))
    } else {
      assert.equal(validateLatexExpressions(result.text), null)
      assert.match(html, /class="katex"/)
      assert.doesNotMatch(html, /katex-error/)
      if (name !== 'biologi') assert.match(html, /mfrac/)
      else assert.match(html, /msupsub/)
    }
  }
  const cssFolder = path.join(root, '.output/public/_nuxt')
  const cssLinks = fs.existsSync(cssFolder) ? fs.readdirSync(cssFolder).filter(file => file.endsWith('.css')).map(file => `<link rel="stylesheet" href="../../.output/public/_nuxt/${file}">`).join('') : ''
  fs.writeFileSync(path.join(folder, `${name}-render.html`), '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bukti render '+name+'</title>'+cssLinks+'<link rel="stylesheet" href="../../node_modules/katex/dist/katex.min.css"><style>'+componentStyles+'</style><body><h1>Editor</h1>'+editor+'<h1>Aplikasi siswa</h1>'+student+'</body></html>')
  evidence.push({ name, status: 'LULUS SSR', formula: result.containsFormula, rtl: result.isRtl })
}
// Token per siswa: migrasi 0017 mengikat token ke assignment siswa (bukan kode
// bersama ujian), gerbang eligible di students, dan login mencocokkan token pribadi.
const migration17 = fs.readFileSync(path.join(root, 'supabase/migrations/0017_token_peserta.sql'), 'utf8')
for (const needle of ['access_token', 'exam_eligible', 'issue_exam_tokens', 'issue_student_token', 'regenerate_exam_token', 'generate_student_token'])
  assert.ok(migration17.includes(needle), `Migrasi 0017 memuat ${needle}`)
assert.ok(migration17.includes('a.access_token = upper($2)'), 'Login siswa mencocokkan token pribadi pada assignment')
assert.ok(!migration17.includes('where code ='), 'Kode bersama ujian tidak lagi menjadi kredensial masuk')
const examsSource = fs.readFileSync(path.join(root, 'app/components/adminV2/cbt/CbtV2Exams.vue'), 'utf8')
assert.ok(examsSource.includes('CbtV2ExamTokens') && examsSource.includes('Token Peserta'), 'Daftar Ujian membuka panel Token Peserta per ujian')
const tokensSource = fs.readFileSync(path.join(root, 'app/components/adminV2/cbt/CbtV2ExamTokens.vue'), 'utf8')
for (const needle of ['loadExamParticipants', 'issueExamTokens', 'regenerateStudentToken', 'setStudentExamEligible', 'Export Excel', 'Cetak Kartu Ujian'])
  assert.ok(tokensSource.includes(needle), `Panel token memuat ${needle}`)

await nextTick()
const summary = { parser: 'LULUS', retryDanPenolakanRumusInvalid: 'LULUS (penyedia tiruan)', ocrIndependenDanHasilKedaluwarsa: 'LULUS (penyedia tiruan)', daftarBankDanPemisahanJenjang: 'LULUS (Supabase tiruan + SSR)', opsiPilihanGanda: 'LULUS SMP 4 / SMK 5', templateDanImpor: 'LULUS SMP/SMK', pemilihanUrutanDanRpc: 'LULUS (Supabase tiruan)', pemuatanSiswa: 'LULUS (respons server tiruan)', pemisahanSumber: 'LULUS (Supabase tiruan)', monitoringDanDataKosong: 'LULUS (Supabase tiruan + SSR)', kompatibilitasLama: 'LULUS', formulir: 'LULUS', tokenPerSiswa: 'LULUS (migrasi 0017 + Supabase tiruan)', mapelUjianDariMaster: 'LULUS (Supabase tiruan)', evidence }
fs.writeFileSync(path.join(folder, 'hasil-uji.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify(summary, null, 2))
