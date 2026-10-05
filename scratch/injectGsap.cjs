const fs = require('fs');

const pages = [
  'index.vue',
  'tentang.vue',
  'akademik.vue',
  'ekstrakurikuler.vue',
  'berita.vue',
  'spmb.vue',
  'kontak.vue'
];

pages.forEach(f => {
  const filepath = 'app/pages/smk/' + f;
  if (!fs.existsSync(filepath)) return;
  
  let t = fs.readFileSync(filepath, 'utf8');
  if (t.includes('useGsapReveal')) return;
  
  if (t.includes('<script setup lang="ts">')) {
    t = t.replace('<script setup lang="ts">', '<script setup lang="ts">\nimport { useGsapReveal } from "~/composables/useGsapReveal";\nuseGsapReveal();');
  } else if (t.includes('<script setup>')) {
    t = t.replace('<script setup>', '<script setup>\nimport { useGsapReveal } from "~/composables/useGsapReveal";\nuseGsapReveal();');
  } else {
    t = '<script setup lang="ts">\nimport { useGsapReveal } from "~/composables/useGsapReveal";\nuseGsapReveal();\n</script>\n' + t;
  }
  
  fs.writeFileSync(filepath, t);
});

// Also remove !important from smk.css
let css = fs.readFileSync('app/assets/css/smk.css', 'utf8');
css = css.replace(/\.rv\s*\{\s*opacity:\s*1\s*!important;\s*transform:\s*none\s*!important;\s*\}/g, '');
css = css.replace(/\.tl2-item\s*\{\s*opacity:\s*1\s*!important;\s*transform:\s*none\s*!important;\s*\}/g, '');
// Also if there's any transition fighting gsap, let's remove it for `.rv` and `.tl2-item`
css = css.replace(/transition:\s*opacity\s*\.65s\s*ease,\s*transform\s*\.65s[^;]+;/g, '/* GSAP HANDLES TRANSITION */');
css = css.replace(/transition:\s*opacity\s*\.55s\s*ease,\s*transform\s*\.55s\s*ease;/g, '/* GSAP HANDLES TRANSITION */');

fs.writeFileSync('app/assets/css/smk.css', css);

console.log('Injected GSAP and cleaned CSS');
