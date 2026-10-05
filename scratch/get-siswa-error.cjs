const http = require('http')

http.get('http://localhost:3000/admin/siswa', (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    // find body text or error description
    const text = data.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '')
    console.log(text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1000))
  })
})
