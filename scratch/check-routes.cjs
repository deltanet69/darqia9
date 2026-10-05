const http = require('http');

const routes = [
  '/',
  '/smk',
  '/smk/tentang',
  '/smk/akademik',
  '/smk/spmb',
  '/smk/ekstrakurikuler',
  '/smk/berita',
  '/smk/kontak',
  '/spmb',
  '/cbt',
  '/admin'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get('http://localhost:3000' + route, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasError = data.includes('Single file component') || data.includes('Duplicate attribute') || data.includes('Internal Server Error') || res.statusCode >= 400;
        resolve({ route, status: res.statusCode, ok: !hasError, errorSnippet: hasError ? data.slice(0, 300) : null });
      });
    }).on('error', (err) => {
      resolve({ route, status: 'ERROR', ok: false, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing routes...');
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`${r} -> ${res.status} [${res.ok ? 'PASS' : 'FAIL'}]`);
    if (!res.ok) {
      console.log('  Details:', res.errorSnippet || res.error);
    }
  }
}

run();
