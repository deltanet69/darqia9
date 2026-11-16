// Tes logika form bank soal (tambah butir berurutan tidak menghilangkan butir lain) — jalankan: node tests/cbt-form-soal.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { registerHooks, stripTypeScriptTypes } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse, compileScript } from '@vue/compiler-sfc'
import { reactive, ref, nextTick } from 'vue'

const root = fileURLToPath(new URL('../', import.meta.url))
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === '#supabase/server') return { url: pathToFileURL(path.join(root, 'tests/stub-supabase-server.mjs')).href, shortCircuit: true }
    if (specifier.startsWith('~/')) specifier = pathToFileURL(path.join(root, 'app', specifier.slice(2))).href
    if ((specifier.startsWith('.') || specifier.startsWith('file:')) && !path.extname(specifier)) specifier += '.ts'
    return next(specifier, context)
  },
  load(url, context, next) {
    const filename = fileURLToPath(url)
    if (filename.endsWith('.vue')) {
      const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename })
      const compiled = compileScript(descriptor, { id: 'tmp' })
      return { format: 'module', shortCircuit: true, source: stripTypeScriptTypes(compiled.content, { mode: 'strip' }) }
    }
    return next(url, context)
  }
})

const { default: Form } = await import('../app/components/adminV2/cbt/CbtV2BankForm.vue')
const pkg = {
  id: 'PKG-1', code: 'X', classroom: 'X AK', subject: 'Matematika', grade: 'SMK', difficulty: 'Sedang', teacherName: 'Guru', updatedAt: 'x', hasInteractive: false,
  questions: [{ id: 'q-1', number: 1, type: 'PG', difficulty: 'Sedang', text: '', key: 'A', options: ['A', 'B', 'C', 'D', 'E'].map(key => ({ key, text: '' })) }]
}
const events = []
const props = reactive({ pkg, editing: false, grade: 'SMK', classOptions: ['X AK'], subjectOptions: ['Matematika'], saving: false, lockTeacher: false, teacherOptions: [], selfName: 'Guru' })
const vm = Form.setup(props, { expose() {}, emit: (e, v) => events.push([e, v]) })

vm.draft.value.questions[0].text = 'Soal pertama berisi teks'
vm.addQuestion('PG')
await nextTick()
assert.equal(vm.draft.value.questions.length, 2, 'dua butir setelah tambah')
assert.equal(vm.draft.value.questions[0].text, 'Soal pertama berisi teks', 'soal pertama utuh')
assert.equal(vm.activeQuestionIndex.value, 2)
vm.draft.value.questions[1].text = 'Soal kedua'
vm.addQuestion('PG')
await nextTick()
assert.deepEqual(vm.draft.value.questions.map(q => q.text), ['Soal pertama berisi teks', 'Soal kedua', ''])
assert.equal(vm.questionsInStep.value.length, 3)

// Simulasi induk yang menerima update-draft lalu memberi prop baru (seperti CbtV2Bank).
const terakhir = events.filter(([e]) => e === 'update-draft').at(-1)[1]
assert.equal(terakhir.questions.length, 3, 'draf yang dikirim ke induk berisi tiga butir')
props.pkg = terakhir
await nextTick()
assert.equal(vm.draft.value.questions.length, 3, 'draf lokal tidak ditimpa prop baru')

// Daftar butir: ringkasan teks dipotong, butir kosong terhitung, dan OCR yang berjalan mengunci perpindahan butir.
assert.equal(vm.kosongDiStep.value, 1)
assert.ok(vm.ringkasSoal({ text: '**Tebal** $x^2$ ' + 'a'.repeat(120) }).length <= 81)
assert.equal(vm.ringkasSoal({ text: '**Tebal** $x^2$' }), 'Tebal x^2')
assert.equal(vm.ocrBerjalan.value, false)

// Ganti kelas dan mapel: butir tidak boleh ikut hilang.
props.subjectOptions = ['Matematika']
await nextTick()
assert.equal(vm.draft.value.questions.length, 3)
// Soal cerita PG & Esai, nama bank wajib, teks cerita wajib, minimal kata disalin ke soal Esai.
const ev2 = []
const f = Form.setup(reactive({ pkg: { ...pkg, name: '', questions: [] }, editing: false, grade: 'SMK', source: 'ujian_harian', classOptions: ['X AK'], subjectOptions: ['Matematika'], saving: false, lockTeacher: true }), { expose() {}, emit: (e, v) => ev2.push([e, v]) })
f.addQuestion('PG', true)
const kepala = f.draft.value.questions.at(-1)
assert.ok(kepala.storyGroup, 'PG cerita punya storyGroup')
f.addSubSoal(kepala)
assert.equal(f.draft.value.questions.filter(q => q.storyGroup === kepala.storyGroup).length, 2, 'dua pertanyaan dalam satu cerita')
assert.equal(f.daftarButir.value.length, 1, 'cerita tampil sebagai satu butir')
f.addQuestion('PG')
assert.equal(f.draft.value.questions.at(-1).storyGroup, undefined, 'soal biasa tanpa storyGroup')
for (const q of f.draft.value.questions) { q.text ||= 'teks'; q.options?.forEach(o => { o.text ||= 'opsi' }) }
f.submitForm()
assert.ok(ev2.some(([e, v]) => e === 'toast' && v === 'Nama bank soal wajib diisi.'))
f.draft.value.name = 'Bab 1'
f.submitForm()
assert.ok(ev2.some(([e, v]) => e === 'toast' && v === 'Isi teks cerita atau hapus butir cerita ini.'))
f.setCerita(kepala, 'Cerita bab 1')
f.draft.value.minKata = 30
f.currentStep.value = 'Esai'
f.addQuestion('Esai')
Object.assign(f.draft.value.questions.at(-1), { text: 'Esai', rubric: 'r' })
f.submitForm()
const disimpan = ev2.find(([e]) => e === 'save')?.[1]
assert.ok(disimpan, 'bank tersimpan')
assert.equal(disimpan.questions.find(q => q.type === 'Esai').minKata, 30)
assert.deepEqual(disimpan.questions.filter(q => q.storyGroup).map(q => q.storyText), ['Cerita bab 1', 'Cerita bab 1'])
// Esai titik-titik: petunjuk muncul bila ada titik-titik tanpa Jawaban Pasti; jawaban pasti ikut tersimpan.
const ev3 = []
const f2 = Form.setup(reactive({ pkg: { ...pkg, name: 'Grammar', questions: [] }, editing: false, grade: 'SMK', source: 'ujian_harian', classOptions: ['X AK'], subjectOptions: ['Matematika'], saving: false, lockTeacher: true }), { expose() {}, emit: (e, v) => ev3.push([e, v]) })
f2.addQuestion('PG')
Object.assign(f2.draft.value.questions.at(-1), { text: 'Soal PG' })
f2.draft.value.questions.at(-1).options.forEach(o => { o.text = 'opsi' })
f2.currentStep.value = 'Esai'
f2.addQuestion('Esai')
const esaiTitik = f2.draft.value.questions.at(-1)
esaiTitik.text = 'She usually ... (go) to school by bicycle every morning.'
assert.equal(f2.punyaTitik(esaiTitik), true)
assert.equal(f2.punyaTitik({ text: 'Jelaskan pengertian frasa.' }), false)
assert.equal(f2.jawabanPasti(esaiTitik), '')
f2.setJawabanPasti(esaiTitik, { target: { value: 'goes' } })
assert.equal(f2.jawabanPasti(esaiTitik), 'goes')
f2.submitForm()
const simpanTitik = ev3.find(([e]) => e === 'save')?.[1]
assert.ok(simpanTitik, 'bank dengan esai titik-titik tersimpan tanpa rubrik')
assert.equal(simpanTitik.questions.find(q => q.type === 'Esai').jawabanPasti, 'goes')
// Pilihan cara menilai esai: mode Jawaban Pasti yang kosong tidak boleh tersimpan diam-diam sebagai esai uraian.
f2.addQuestion('Esai')
const esaiBaru = f2.draft.value.questions.at(-1)
esaiBaru.text = 'Esai baru'
assert.equal(f2.modePasti(esaiBaru), false, 'esai baru = uraian')
f2.setModePasti(esaiBaru, true)
assert.equal(f2.modePasti(esaiBaru), true)
assert.equal(f2.jawabanPasti(esaiBaru), '')
ev3.length = 0
f2.submitForm()
assert.ok(ev3.some(([e, v]) => e === 'toast' && v === 'Isi Jawaban pasti atau ganti ke Esai Uraian.'))
assert.ok(!ev3.some(([e]) => e === 'save'), 'tidak tersimpan selama Jawaban Pasti kosong')
f2.setModePasti(esaiBaru, false)
assert.equal(esaiBaru.jawabanPasti, undefined)
assert.equal(f2.modePasti(esaiTitik), true, 'esai lain tidak ikut berubah')
console.log('ok form')

