const fs = require('fs');

let eks = fs.readFileSync('app/pages/smk/ekstrakurikuler.vue', 'utf8');
eks = eks.replace('<script setup lang="ts">', '<script setup lang="ts">\nimport { ref } from \'vue\'\nconst activeFilter = ref(\'semua\')');
eks = eks.replace(/<button class="chip(?: on)?" data-f="([^"]+)">/g, (m, p1) => `<button class="chip" :class="{ on: activeFilter === '${p1}' }" @click="activeFilter = '${p1}'">`);
eks = eks.replace(/<div class="card" data-cat="([^"]+)">/g, (m, p1) => `<div class="card" v-show="activeFilter === 'semua' || activeFilter === '${p1}'">`);
fs.writeFileSync('app/pages/smk/ekstrakurikuler.vue', eks);

console.log('done');
