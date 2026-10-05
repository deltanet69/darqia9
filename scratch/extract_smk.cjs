const fs = require('fs');
const path = require('path');

const root = 'd:/Opang/Project Nuxt Js/Attaqwa 9/darqia';
const html = fs.readFileSync(path.join(root, 'dummy/web-profil-smk-attaqwa9.html'), 'utf8');

// Helper to extract by regex
function extract(regex) {
  const match = html.match(regex);
  return match ? match[1] : '';
}

const topbar = extract(/(<div class="topbar">[\s\S]*?<\/div><\/div>)/);
const header = extract(/(<header class="navbar">[\s\S]*?<\/header>)/);
const drawer = extract(/(<div class="drawer" id="drawer">[\s\S]*?<\/div>\s*<\/div>)/);
const footer = extract(/(<footer>[\s\S]*?<\/footer>)/);

const pages = ['home', 'tentang', 'akademik', 'ekstrakurikuler', 'berita', 'spmb', 'kontak'];

function writePage(pageName, fileName) {
  const pageHtmlRegex = new RegExp(`(<section class="page" data-page="${pageName}">[\\s\\S]*?)</section>`);
  let content = extract(pageHtmlRegex);
  if (!content) return;
  
  // replace links #/page with /smk/page or NuxtLink
  content = content.replace(/href="#\/([^"]+)"/g, (match, p1) => {
    if (p1 === 'home') return 'to="/smk"';
    return `to="/smk/${p1}"`;
  });
  content = content.replace(/<a /g, '<NuxtLink ').replace(/<\/a>/g, '</NuxtLink>');
  content = content.replace(/data-goto="#\/([^"]+)"/g, (match, p1) => {
    if (p1 === 'home') return '@click="$router.push(\'/smk\')"';
    return `@click="$router.push('/smk/${p1}')"`;
  });

  const vueContent = `<script setup lang="ts">
definePageMeta({ layout: 'smk' })
</script>
<template>
  <div>
${content}
  </div>
</template>
`;
  
  const dest = path.join(root, `app/pages/smk/${fileName}`);
  fs.writeFileSync(dest, vueContent);
  console.log('Wrote ' + fileName);
}

writePage('home', 'index.vue');
writePage('tentang', 'tentang.vue');
writePage('akademik', 'akademik.vue');
writePage('ekstrakurikuler', 'ekstrakurikuler.vue');
writePage('berita', 'berita.vue');
writePage('spmb', 'spmb.vue');
writePage('kontak', 'kontak.vue');

// Header
let headerHtml = topbar + '\n' + header + '\n' + drawer;
headerHtml = headerHtml.replace(/href="#\/([^"]+)"/g, (match, p1) => {
  if (p1 === 'home') return 'to="/smk"';
  return `to="/smk/${p1}"`;
});
headerHtml = headerHtml.replace(/<a /g, '<NuxtLink ').replace(/<\/a>/g, '</NuxtLink>');

const headerVue = `<script setup lang="ts">
import { ref } from 'vue'
const drawerOpen = ref(false)
</script>
<template>
  <div>
${headerHtml.replace('id="drawer"', ':class="{ open: drawerOpen }" id="drawer"').replace('id="burger"', '@click="drawerOpen = true" id="burger"').replace('id="scrim"', '@click="drawerOpen = false" id="scrim"').replace(/class="nav-cta"/g, 'class="btn btn-acc btn-sm nav-cta"').replace(/class="btn btn-acc"/g, 'class="btn btn-acc"')}
  </div>
</template>
`;
fs.writeFileSync(path.join(root, 'app/components/smk/SmkHeader.vue'), headerVue);
console.log('Wrote SmkHeader.vue');

// Footer
let footerHtml = footer;
footerHtml = footerHtml.replace(/href="#\/([^"]+)"/g, (match, p1) => {
  if (p1 === 'home') return 'to="/smk"';
  return `to="/smk/${p1}"`;
});
footerHtml = footerHtml.replace(/<a /g, '<NuxtLink ').replace(/<\/a>/g, '</NuxtLink>');

const footerVue = `<template>
${footerHtml}
</template>
`;
fs.writeFileSync(path.join(root, 'app/components/smk/SmkFooter.vue'), footerVue);
console.log('Wrote SmkFooter.vue');
