// Ikon Perpustakaan Digital — disalin dari prototipe dummy/perpus/app.js (garis tunggal, satu gaya).
export const P: Record<string, string> = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  cari: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  kembali: '<path d="M15 5l-7 7 7 7"/>',
  maju: '<path d="M9 5l7 7-7 7"/>',
  daftar: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  aa: '<path d="M3 19l5-14 5 14M5 14h6M15 19l3-8 3 8M16 17h4"/>',
  tutup: '<path d="M6 6l12 12M18 6L6 18"/>',
  cek: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  koleksi: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  saring: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  lonceng: '<path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15.5 6 9z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'
}

// Ikon navbar: garis (o) digambar saat aktif, isi (f) muncul berbarengan.
export const NI: Record<string, { o: string, f: string }> = {
  home: { o: '<path pathLength="1" d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-4.5v-5.5h-6V21H4.5a1 1 0 0 1-1-1z"/>', f: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-4.5v-5.5h-6V21H4.5a1 1 0 0 1-1-1z"/>' },
  katalog: { o: '<path pathLength="1" d="M19 10.5V3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21H11"/><path pathLength="1" d="M4 18.5A2.5 2.5 0 0 1 6.5 16H10"/><circle pathLength="1" cx="16.5" cy="16.5" r="3.2"/><path pathLength="1" d="m18.9 18.9 2.1 2.1"/>', f: '' },
  belajar: { o: '<path pathLength="1" d="M12 7c-1.6-1.6-4.2-2.2-9-2.2v14c4.8 0 7.4.6 9 2.2 1.6-1.6 4.2-2.2 9-2.2v-14c-4.8 0-7.4.6-9 2.2z"/><path pathLength="1" d="M12 7v14"/>', f: '<path d="M11.3 6.4C9.6 5.3 7 4.8 3 4.8v14c4 0 6.6.4 8.3 1.5z"/><path d="M12.7 6.4c1.7-1.1 4.3-1.6 8.3-1.6v14c-4 0-6.6.4-8.3 1.5z"/>' },
  koleksi: { o: '<path pathLength="1" d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4.5L5 21V4.5A1.5 1.5 0 0 1 6.5 3z"/>', f: '<path d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4.5L5 21V4.5A1.5 1.5 0 0 1 6.5 3z"/>' },
  profil: { o: '<circle pathLength="1" cx="12" cy="8" r="4"/><path pathLength="1" d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z"/>', f: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z"/>' }
}

export const GOOGLE = '<path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3c.9-2.7 3.4-4.4 6.4-4.4z"/>'

const SPARK = 'M0-12C1-4 4-1 12 0 4 1 1 4 0 12-1 4-4 1-12 0-4-1-1-4 0-12z'
// Grafik login: buku terbuka digambar sekali, rosetta berputar pelan, bintang berkerlip.
export const ART = `<circle cx="160" cy="130" r="98" fill="#e7eefc"/>
    <g class="rot" fill="none" stroke="#1d4fd8" stroke-width="1">
      <ellipse cx="160" cy="130" rx="118" ry="46"/><ellipse cx="160" cy="130" rx="118" ry="46" transform="rotate(60 160 130)"/><ellipse cx="160" cy="130" rx="118" ry="46" transform="rotate(120 160 130)"/>
    </g>
    <g stroke="#0a2a5c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path class="pg" fill="#fff" d="M160 110C148 101 130 99 110 102V160C130 157 148 159 160 168Z"/>
      <path class="pg" fill="#fff" d="M160 110C172 101 190 99 210 102V160C190 157 172 159 160 168Z"/>
      <path class="gs" pathLength="1" d="M160 110C148 101 130 99 110 102V160C130 157 148 159 160 168 172 159 190 157 210 160V102C190 99 172 101 160 110ZM160 110V168"/>
      <path class="gs g2" pathLength="1" stroke="#1d4fd8" stroke-width="2" d="M123 116c10-1 20 0 29 4M123 128c10-1 20 0 29 4M123 140c10-1 20 0 29 4M197 116c-10-1-20 0-29 4M197 128c-10-1-20 0-29 4M197 140c-10-1-20 0-29 4"/>
    </g>
    <g fill="#0a2a5c"><g transform="translate(58 66)"><path class="sp" d="${SPARK}"/></g></g>
    <g fill="#1d4fd8"><g transform="translate(266 50) scale(.75)"><path class="sp s2" d="${SPARK}"/></g><g transform="translate(262 206) scale(.55)"><path class="sp s3" d="${SPARK}"/></g><g transform="translate(66 204) scale(.6)"><path class="sp s4" d="${SPARK}"/></g></g>`
