const fs = require('fs');
let content = fs.readFileSync('app/pages/index.vue', 'utf8');
content = content.replace(/src="asset\//g, 'src="/asset/');
content = content.replace(/src="\.\.\."/g, 'src="/placeholder.png"');
fs.writeFileSync('app/pages/index.vue', content);
console.log('Fixed src paths');
