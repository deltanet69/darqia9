const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('dummy/web-profile-attaqwa-prototype.html', 'utf-8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
let css = styleMatch ? styleMatch[1] : '';
css = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n' + css;

const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
let body = bodyMatch ? bodyMatch[1] : '';

// Remove script tag from body and extract it
const scriptMatch = body.match(/<script>([\s\S]*?)<\/script>/);
let scriptContent = scriptMatch ? scriptMatch[1] : '';
body = body.replace(/<script>[\s\S]*?<\/script>/, '');

// Ensure app/assets/css exists
fs.mkdirSync('app/assets/css', { recursive: true });
fs.writeFileSync('app/assets/css/main.css', css);

// Ensure app/pages exists
fs.mkdirSync('app/pages', { recursive: true });
fs.mkdirSync('app/layouts', { recursive: true });

// app.vue
fs.writeFileSync('app/app.vue', '<template>\n  <NuxtLayout>\n    <NuxtPage />\n  </NuxtLayout>\n</template>\n');

// default layout
fs.writeFileSync('app/layouts/default.vue', '<template>\n  <div>\n    <slot />\n  </div>\n</template>\n');

// index.vue
const vueContent = `<template>
${body}
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Use timeout to ensure DOM is fully rendered
  setTimeout(() => {
    ${scriptContent}
  }, 100)
})
</script>
`;

fs.writeFileSync('app/pages/index.vue', vueContent);
console.log('Porting finished');
