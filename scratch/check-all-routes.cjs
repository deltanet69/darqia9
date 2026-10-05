const http = require('http')

const routes = [
  '/',
  '/smk',
  '/spmb',
  '/spmb/smp',
  '/spmb/smk',
  '/cbt',
  '/absensi/10abc',
  '/admin',
  '/admin/login',
  '/admin/absensi-siswa',
  '/admin/absensi-guru',
  '/admin/kelas',
  '/admin/nilai',
  '/admin/keuangan',
  '/admin/tabungan',
  '/admin/cbt',
  '/admin/konten',
  '/admin/users',
  '/admin/rbac',
  '/admin/log',
  '/admin/profile',
  '/admin/siswa'
]

async function testRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          length: data.length
        })
      })
    }).on('error', (err) => {
      resolve({ path, error: err.message })
    })
  })
}

async function main() {
  console.log('Testing routes...')
  for (const r of routes) {
    const res = await testRoute(r)
    console.log(`${res.path.padEnd(25)} -> Status: ${res.status} ${res.ok ? '✅ OK' : '❌ FAIL'} (${res.length} bytes)`)
  }
}

main()
