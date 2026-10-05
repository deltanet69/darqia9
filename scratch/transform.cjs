const fs = require('fs');
let header = fs.readFileSync('app/components/yayasan/YayasanHeader.vue', 'utf8');

// Replace standard links
const linkMap = {
  '#beranda': '/smk',
  '#tentang': '/smk/tentang',
  '#pembinaan': '/smk/akademik',
  '#sekolah': '/smk/ekstrakurikuler',
  '#pmb': '/smk/spmb',
  '#kontak': '/smk/kontak'
};

for (const [oldHref, newTo] of Object.entries(linkMap)) {
  // Regex to replace <a href="...">...</a> to <NuxtLink to="...">...</NuxtLink>
  const regex = new RegExp(`<a([^>]*?)href="${oldHref}"([^>]*)>([\\s\\S]*?)</a>`, 'g');
  header = header.replace(regex, `<NuxtLink$1to="${newTo}"$2>$3</NuxtLink>`);
}

// Add Berita
header = header.replace(
  />Tentang Yayasan</g, '>Tentang Sekolah<'
).replace(
  />Kultur Pembinaan</g, '>Akademik<'
).replace(
  />Sekolah Kami \(SMP &amp; SMK\)</g, '>Ekstrakurikuler<'
).replace(
  />PMB 2027\/2028 \(7 Rombel\)</g, '>SPMB 2027/2028<'
).replace(
  /NIB OSS: <b>0220001672276<\/b> \(Yayasan Darul Qohar Cendekia\)/g, 'NPSN: <b>69940449</b> (SMK IT Attaqwa 9)'
).replace(
  /yayasandarqia@gmail.com/g, 'smkitattaqwa09@gmail.com'
).replace(
  /Logo SMP IT BCA/g, 'Logo SMK IT Attaqwa 9'
);

// We need to change the dropdown items.
const dropdownHTML = `
                <NuxtLink 
                  to="/smk/berita" 
                  class="flex flex-col p-[12px] rounded-[12px] hover:bg-[#E8F0FE] transition-colors group mb-[4px]"
                >
                  <div class="flex items-center justify-between">
                    <b class="text-[14.5px] text-[#0F1E38] group-hover:text-[#1B5FD9] whitespace-nowrap">Berita & Artikel</b>
                  </div>
                  <small class="text-[#5A6B8C] text-[12px] mt-[2px]">Kabar terbaru dari sekolah</small>
                </NuxtLink>
`;

header = header.replace(/<div \n                v-show="isDropdownOpen"[\s\S]*?<\/div>\n            <\/div>/, `<div \n                v-show="isDropdownOpen" \n                class="absolute top-[calc(100%+8px)] left-0 w-[340px] bg-white border border-[#E3EAF7] rounded-[16px] shadow-[0_24px_60px_rgba(10,42,92,.16)] p-[10px] z-50 transition-all duration-200"\n              >\n${dropdownHTML}\n              </div>\n            </div>`);
header = header.replace(/Sekolah Kami/g, 'Lebih Lanjut');

fs.writeFileSync('app/components/smk/SmkHeader.vue', header);


// For Footer
let footer = fs.readFileSync('app/components/yayasan/YayasanFooter.vue', 'utf8');
footer = footer.replace(
  /Lembaga pendidikan Islam terpadu yang menaungi <b>SMP IT Bina Cendekia Assalam<\/b> dan <b>SMK IT Attaqwa 9<\/b> dengan komitmen keunggulan iman-takwa dan sains-teknologi./,
  "SMK rasa pesantren — membentuk generasi vokasi Qur'ani yang benar, pintar, dan terampil. Unggul dalam IMTAQ, terdepan dalam IPTEK."
).replace(
  /Yayasan Darqia Attaqwa/g, 'SMK IT Attaqwa 9'
).replace(
  /Satuan Pendidikan/, 'Menu Cepat'
);

footer = footer.replace(/<ul class="space-y-\[12px\] text-\[14px\] text-\[#C9D9F5\]">[\s\S]*?<\/ul>/, `<ul class="space-y-[12px] text-[14px] text-[#C9D9F5]">
            <li>
              <NuxtLink to="/smk/tentang" class="hover:text-white transition-colors block">
                <b class="text-white block">Tentang Sekolah</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/akademik" class="hover:text-white transition-colors block">
                <b class="text-white block">Akademik</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/ekstrakurikuler" class="hover:text-white transition-colors block">
                <b class="text-white block">Ekstrakurikuler</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/berita" class="hover:text-white transition-colors block">
                <b class="text-white block">Berita & Artikel</b>
              </NuxtLink>
            </li>
          </ul>`);

footer = footer.replace(/<a href="https:\/\/s.id\/home_smpitbca_smkita9" target="_blank" rel="noopener noreferrer" class="text-\[#FDE68A\] hover:underline font-semibold block mt-\[4px\]">\n                Portal PMB 2027\/2028 \(7 Rombel\) ↗\n              <\/a>/, `<NuxtLink to="/smk/spmb" class="text-[#FDE68A] hover:underline font-semibold block mt-[4px]">Daftar SPMB 2027/2028 →</NuxtLink>`);

fs.writeFileSync('app/components/smk/SmkFooter.vue', footer);
console.log("Done");
