const fs = require('fs');
['YayasanAbout.vue','YayasanCampusCulture.vue','YayasanSchools.vue', 'YayasanContact.vue', 'YayasanFooter.vue'].forEach(f=>{
  let file='app/components/yayasan/'+f;
  if (!fs.existsSync(file)) return;
  let c=fs.readFileSync(file,'utf8');
  c=c.replace(/<h2 /g, '<h2 class="gsap-rv" ');
  c=c.replace(/<p class="/g, '<p class="gsap-rv ');
  c=c.replace(/<div class="grid/g, '<div class="gsap-rv grid');
  fs.writeFileSync(file,c);
});
console.log('done');
