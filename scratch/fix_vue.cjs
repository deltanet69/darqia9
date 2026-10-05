const fs = require('fs');

let header = fs.readFileSync('app/components/smk/SmkHeader.vue', 'utf8');
header = header.replace(/<NuxtLink (to="[^"]+"[^>]*)>/g, '<NuxtLink $1 @click="drawerOpen = false">');
fs.writeFileSync('app/components/smk/SmkHeader.vue', header);

let berita = fs.readFileSync('app/pages/smk/berita.vue', 'utf8');
berita = berita.replace('<script setup lang="ts">', '<script setup lang="ts">\nimport { ref } from \'vue\'\nconst activeFilter = ref(\'semua\')');
berita = berita.replace(/<button class="chip(?: on)?" data-f="([^"]+)">/g, (m, p1) => `<button class="chip" :class="{ on: activeFilter === '${p1}' }" @click="activeFilter = '${p1}'">`);
berita = berita.replace(/<div class="news-feat" data-cat="([^"]+)">/g, (m, p1) => `<div class="news-feat" v-show="activeFilter === 'semua' || activeFilter === '${p1}'">`);
berita = berita.replace(/<div class="news-card" data-cat="([^"]+)">/g, (m, p1) => `<div class="news-card" v-show="activeFilter === 'semua' || activeFilter === '${p1}'">`);
fs.writeFileSync('app/pages/smk/berita.vue', berita);

console.log('done');
