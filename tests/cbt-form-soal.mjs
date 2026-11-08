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
console.log('ok form')

