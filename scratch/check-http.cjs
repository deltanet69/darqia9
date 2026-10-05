const http = require('http');

http.get('http://localhost:3000/absensi/10abc', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Has Vite error in response:', body.includes('Vite Error'));
    console.log('Body length:', body.length);
  });
}).on('error', err => {
  console.error('Fetch error:', err.message);
});
