// Preview Perpustakaan Digital Darqia 9 — logika aplikasi (vanilla JS, tanpa build).
// Semua data contoh dari data.js; progres siswa disimpan di localStorage per NISN.
(function () {
  const D = window.PERPUS_DATA;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LOGO = '/asset/logo.png';
  const LOGO_SMP = '/asset/logosmp.png';
  const JENJANG = new URLSearchParams(location.search).get('jenjang') === 'SMP' ? 'SMP' : 'SMK';
  const SEKOLAH_INI = JENJANG === 'SMP' ? { nama: 'SMP IT Bina Cendekia Assalam', logo: LOGO_SMP } : { nama: 'SMK IT Attaqwa 9', logo: LOGO };

  // ---------- ikon (garis tunggal, satu gaya) ----------
  const P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    katalog: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    belajar: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
    koleksi: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    profil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    cari: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    kembali: '<path d="M15 5l-7 7 7 7"/>',
    maju: '<path d="M9 5l7 7-7 7"/>',
    hati: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    daftar: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    aa: '<path d="M3 19l5-14 5 14M5 14h6M15 19l3-8 3 8M16 17h4"/>',
    tutup: '<path d="M6 6l12 12M18 6L6 18"/>',
    cek: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  const ic = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3c.9-2.7 3.4-4.4 6.4-4.4z"/></svg>';

  // ---------- penyimpanan per siswa ----------
  const memo = {};
  const simpanKe = (k, v) => { memo[k] = v; try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { /* mode privat: pakai memori */ } };
  const bacaDari = k => { try { return localStorage.getItem(k); } catch (e) { return memo[k] ?? null; } };
  const KUNCI = 'darqia-perpus-v1:';
  const baru = () => ({ fav: [], baca: {}, hal: [], tandai: [], rk: {}, kisi: {}, nbaca: [], tema: 'terang', fs: 19 });
  let U = null, W = null;
  // contoh untuk preview: satu buku seolah terakhir dibuka 3 hari lalu, supaya pengingat 48 jam terlihat
  const contohPengingat = (w, nisn) => {
    if (w.contoh) return w;
    const s = D.siswa.find(x => x.nisn === nisn), b = s && D.buku.find(x => x.jenjang.includes(s.jenjang) && !w.baca[x.id]);
    if (b) w.baca[b.id] = { i: 1, ts: Date.now() - 3 * 864e5 };
    w.contoh = 1; return w;
  };
  const muat = nisn => { let w; try { w = Object.assign(baru(), JSON.parse(bacaDari(KUNCI + nisn) || '{}')); } catch (e) { w = baru(); } return contohPengingat(w, nisn); };
  const simpan = () => simpanKe(KUNCI + U.nisn, W);

  // ---------- state tampilan ----------
  const V = { tab: 'beranda', detail: null, q: '', mapel: '', kur: '', kol: 'riwayat' };
  const L = { step: 'awal', email: '', err: '' };
  let R = null; // state pembaca

  const bukuSaya = () => D.buku.filter(b => b.jenjang.includes(U.jenjang));
  const cariBuku = id => D.buku.find(b => b.id === id);
  const kisiSaya = () => D.kisi.filter(k => k.jenjang === U.jenjang);
  const pct = b => W.baca[b.id] ? Math.round((W.baca[b.id].i + 1) / b.hal.length * 100) : 0;
  const inisial = n => n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const judulPendek = b => b.judul.includes(': ') ? b.judul.split(': ')[1] : b.judul;
  const kapan = ts => { const h = Math.floor((Date.now() - ts) / 864e5); return h <= 0 ? 'hari ini' : h === 1 ? 'kemarin' : h + ' hari lalu'; };

  const cover = b => `<div class="cover" style="--c1:${b.warna[0]};--c2:${b.warna[1]}"><div class="ci"><small>${esc(b.mapel)}</small><b>${esc(judulPendek(b))}</b><i>${esc(b.kelas)} · ${esc(b.kur)}</i></div></div>`;
  const kartuBuku = b => `<button class="bk" data-a="buka" data-id="${b.id}" aria-label="${esc(b.judul)}"><span class="bk-c">${cover(b)}${pct(b) ? `<span class="bk-p" aria-hidden="true"><span style="width:${pct(b)}%"></span></span>` : ''}</span><h3>${esc(b.judul)}</h3><p>${esc(b.mapel)}</p><span class="bk-t"><span>${esc(b.kelas)}</span><span>${esc(b.kur)}</span></span></button>`;

  let tTimer;
  function toast(t) {
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t;
    $('#lapis').appendChild(el); clearTimeout(tTimer);
    tTimer = setTimeout(() => el.remove(), 2400);
  }
  const lapis = html => { $('#lapis').innerHTML = html ? `<div class="scrim" data-a="lapis-tutup"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>` : ''; };

  // ---------- LOGIN (simulasi SSO Google + verifikasi NIS/NISN) ----------
  // grafik login: buku terbuka digambar sekali, rosetta berputar pelan, bintang berkerlip
  const SPARK = 'M0-12C1-4 4-1 12 0 4 1 1 4 0 12-1 4-4 1-12 0-4-1-1-4 0-12z';
  const ART = `<svg viewBox="0 0 320 260" aria-hidden="true" focusable="false">
    <circle cx="160" cy="130" r="98" fill="#e7eefc"/>
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
    <g fill="#1d4fd8"><g transform="translate(266 50) scale(.75)"><path class="sp s2" d="${SPARK}"/></g><g transform="translate(262 206) scale(.55)"><path class="sp s3" d="${SPARK}"/></g><g transform="translate(66 204) scale(.6)"><path class="sp s4" d="${SPARK}"/></g></g>
  </svg>`;
  const SEKOLAH = `<div class="l-sekolah"><span><img src="${SEKOLAH_INI.logo}" alt="">${SEKOLAH_INI.nama}</span></div>`;
  const langkah = n => `<div class="l-prog" role="img" aria-label="Langkah ${n} dari 2"><i class="on"></i><i class="${n === 2 ? 'on' : ''}"></i></div>`;

  function renderLogin() {
    $('#app').hidden = true; $('#login').hidden = false;
    let isi = '';
    if (L.step === 'awal') {
      isi = `<div class="l-head"><h1>Perpus Digital</h1>${SEKOLAH}<p class="l-desc">Buku pelajaran, catatan, dan kisi-kisi ujianmu ada dalam satu tempat. Buka kapan saja, lanjutkan dari halaman terakhir.</p></div>
        <div class="l-act"><button class="gbtn" data-a="google"><span class="g">${GOOGLE}</span><span class="tx">Masuk dengan Google</span>${ic('maju')}</button>
        <p class="l-note">Mode preview · proses masuk disimulasikan</p></div>`;
    } else {
      const n = L.nomor || '', ok = n.length === 5 || n.length === 10;
      isi = `<button class="back" data-a="ulang">${ic('kembali')}Ganti akun</button>${langkah(2)}
        <div><h2>Satu langkah lagi</h2><p class="l-p">Masukkan NIS atau NISN agar kami tahu kamu siswa terdaftar.</p></div>
        <span class="l-email"><span class="av">${esc(inisial(L.email.split('@')[0].replace(/[._]/g, ' ')))}</span><span>${esc(L.email)}</span></span>
        <form id="f-verif" class="l-form" novalidate>
          <label class="nis" for="nomor">NIS atau NISN</label>
          <div class="nis-f ${ok ? 'ok' : ''}"><input class="in besar num" id="nomor" name="nomor" inputmode="numeric" autocomplete="off" placeholder="Contoh: 24001" maxlength="10" value="${esc(n)}"><span class="cek">${ic('cek')}</span></div>
          ${L.err ? `<p class="err" role="alert">${esc(L.err)}</p>` : '<small class="l-h">NIS terdiri dari 5 angka, NISN 10 angka.</small>'}
          <button class="btn btn-p" type="submit" ${ok ? '' : 'disabled'}>Verifikasi dan masuk</button>
        </form>
        <div class="coba">Data contoh:${D.siswa.filter(s => s.jenjang === JENJANG).map(s => `<button class="chip num" data-a="isi-uji" data-v="${s.nisn}">${s.jenjang} · ${s.nisn}</button>`).join('')}</div>`;
    }
    // grafik dimuat sekali; hanya isi di bawahnya yang berganti antar-langkah
    if (!$('#l-card')) $('#login').innerHTML = `<div class="l-wrap"><div class="l-art">${ART}</div><section class="l-card" id="l-card"></section></div>`;
    $('#login').dataset.step = L.step;
    const c = $('#l-card');
    c.innerHTML = isi; c.classList.remove('ganti'); void c.offsetWidth; c.classList.add('ganti');
    const f = $('#f-verif input'); if (f) f.focus();
  }

  function masuk(s) {
    U = s; W = muat(s.nisn); if (L.email) W.email = L.email; simpan(); simpanKe('darqia-perpus-sesi', s.nisn);
    V.tab = 'beranda'; V.detail = null; V.q = ''; V.mapel = ''; V.kur = '';
    $('#login').hidden = true; render();
  }

  // ---------- SHELL ----------
  const NAV = [['beranda', 'Beranda', 'home'], ['katalog', 'Katalog', 'katalog'], ['belajar', 'Belajar', 'belajar'], ['koleksi', 'Koleksi', 'koleksi'], ['profil', 'Profil', 'profil']];
  // ikon navbar: garis (o) digambar saat aktif, isi (f) muncul berbarengan
  const NI = {
    home: { o: '<path pathLength="1" d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-4.5v-5.5h-6V21H4.5a1 1 0 0 1-1-1z"/>', f: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-4.5v-5.5h-6V21H4.5a1 1 0 0 1-1-1z"/>' },
    katalog: { o: '<path pathLength="1" d="M19 10.5V3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21H11"/><path pathLength="1" d="M4 18.5A2.5 2.5 0 0 1 6.5 16H10"/><circle pathLength="1" cx="16.5" cy="16.5" r="3.2"/><path pathLength="1" d="m18.9 18.9 2.1 2.1"/>', f: '' },
    belajar: { o: '<path pathLength="1" d="M12 7c-1.6-1.6-4.2-2.2-9-2.2v14c4.8 0 7.4.6 9 2.2 1.6-1.6 4.2-2.2 9-2.2v-14c-4.8 0-7.4.6-9 2.2z"/><path pathLength="1" d="M12 7v14"/>', f: '<path d="M11.3 6.4C9.6 5.3 7 4.8 3 4.8v14c4 0 6.6.4 8.3 1.5z"/><path d="M12.7 6.4c1.7-1.1 4.3-1.6 8.3-1.6v14c-4 0-6.6.4-8.3 1.5z"/>' },
    koleksi: { o: '<path pathLength="1" d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4.5L5 21V4.5A1.5 1.5 0 0 1 6.5 3z"/>', f: '<path d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4.5L5 21V4.5A1.5 1.5 0 0 1 6.5 3z"/>' },
    profil: { o: '<circle pathLength="1" cx="12" cy="8" r="4"/><path pathLength="1" d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z"/>', f: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z"/>' }
  };
  const navIc = n => `<span class="ni"><svg viewBox="0 0 24 24" aria-hidden="true"><g class="o">${NI[n].o}</g><g class="f">${NI[n].f}</g></svg></span>`;
  const navBtn = ([k, n, i]) => `<button class="nav" data-a="tab" data-t="${k}">${navIc(i)}<span>${n}</span></button>`;
  // navbar bawah: ikon saja, Belajar di tengah sebagai tombol bulat
  const tabBtn = ([k, n, i]) => `<button class="nav${k === 'katalog' ? ' fab' : ''}" data-a="tab" data-t="${k}" aria-label="${n}">${navIc(i)}<i class="dot"></i></button>`;

  // Kerangka dibuat sekali; setelah itu hanya isi dan status menu yang diperbarui,
  // supaya indikator navbar bisa bergeser mulus antar-tab.
  function render() {
    if (!U) { renderLogin(); return; }
    const a = $('#app'); a.hidden = false;
    if (!$('#main')) a.innerHTML = `<aside class="rail"><div class="logo"><img src="${SEKOLAH_INI.logo}" alt="" onerror="this.style.display='none'"><span class="bell-w rail-bell"></span><span>DARQIA 9<small style="display:block;font-weight:500;font-size:12px;color:var(--muted)">Perpustakaan Digital</small></span></div>
        ${NAV.slice(0, 4).map(navBtn).join('')}
        <button class="perfil" data-a="tab" data-t="profil"><span class="avatar">${esc(inisial(U.nama))}</span><span><b>${esc(U.nama.split(' ')[0])}</b><span>${esc(U.kelas)}</span></span></button></aside>
      <div><header class="top"><div class="logo"><img src="${SEKOLAH_INI.logo}" alt="" onerror="this.style.display='none'"><span>Perpus Digital</span></div><div class="top-k"><span class="bell-w"></span><button class="avatar" data-a="tab" data-t="profil" aria-label="Profil saya">${esc(inisial(U.nama))}</button></div></header>
      <main class="main" id="main"></main></div>
      <nav class="tabbar" aria-label="Menu utama">${[0, 2, 1, 3, 4].map(i => tabBtn(NAV[i])).join('')}</nav>`;
    $('#main').innerHTML = V.detail ? vDetail() : ({ beranda: vBeranda, katalog: vKatalog, belajar: vBelajar, koleksi: vKoleksi, profil: vProfil }[V.tab])();
    segarkanBell();
    document.querySelectorAll('.nav').forEach(n => { const on = n.dataset.t === V.tab; n.classList.toggle('on', on); on ? n.setAttribute('aria-current', 'page') : n.removeAttribute('aria-current'); });
  }
  const ke = (tab, detail) => {
    V.tab = tab; V.detail = detail || null; render(); window.scrollTo(0, 0);
    const m = $('#main'); m.classList.remove('masuk'); void m.offsetWidth; m.classList.add('masuk');
  };

  // ---------- BERANDA ----------
  function vBeranda() {
    const bs = bukuSaya();
    const terakhir = Object.entries(W.baca).filter(([id]) => bs.some(b => b.id === id)).sort((a, b) => b[1].ts - a[1].ts)[0];
    const bl = terakhir ? cariBuku(terakhir[0]) : bs[0];
    const hero = terakhir
      ? `<h2>${esc(bl.judul)}</h2><p>Terakhir dibaca ${kapan(terakhir[1].ts)} · Halaman <span class="num">${terakhir[1].i + 1}</span> dari <span class="num">${bl.hal.length}</span></p><div class="bar" role="progressbar" aria-valuenow="${pct(bl)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct(bl)}%"></span></div><button class="btn btn-w" data-a="baca" data-id="${bl.id}" data-i="${terakhir[1].i}">Lanjutkan membaca</button>`
      : `<h2>Mulai dari buku pertamamu</h2><p>${esc(bl.judul)} — ${esc(bl.ringkas)}</p><button class="btn btn-w" data-a="baca" data-id="${bl.id}" data-i="0">Mulai membaca</button>`;
    const favs = bs.filter(b => W.fav.includes(b.id));
    const ks = kisiSaya().slice(0, 2);
    return `<h1 class="h1" style="margin-top:8px">Halo, ${esc(U.nama.split(' ')[0])}</h1><p class="sub">${esc(U.kelas)} · ${esc(U.jenjang)}</p>
      <div class="banner">Katalog dan isi buku di preview ini data contoh. Koleksi resmi mengikuti daftar buku kurikulum yang ditetapkan sekolah.</div>
      <section class="lanjut"><div style="width:100%">${cover(bl)}</div><div class="tx">${hero}</div></section>
      <section class="sec"><div class="sec-h"><h2>Persiapan ujianmu</h2><button class="link" data-a="tab" data-t="belajar">Lihat semua</button></div>
        <div class="ujian-ring">${ks.map(kartuKisi).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2>Buku untuk kelasmu</h2><button class="link" data-a="tab" data-t="katalog">Lihat katalog</button></div>
        <div class="rowx">${bs.map(kartuBuku).join('')}</div></section>
      ${favs.length ? `<section class="sec"><div class="sec-h"><h2>Favoritmu</h2></div><div class="rowx">${favs.map(kartuBuku).join('')}</div></section>` : ''}`;
  }
  function kartuKisi(k) {
    const n = k.topik.length, d = k.topik.filter((_, i) => W.kisi[k.id + ':' + i]).length;
    const w = cariBuku(k.topik[0].materi[0].buku).warna;
    return `<button class="card ujian" data-a="tab" data-t="belajar" aria-label="${esc(k.judul)}, ${d} dari ${n} topik dipahami"><span class="km" style="--c1:${w[0]};--c2:${w[1]}">${esc(k.mapel.slice(0, 3).toUpperCase())}</span><span class="ut"><b>${esc(k.judul)}</b><small class="num">${d} dari ${n} topik dipahami</small><span class="dots">${k.topik.map((_, i) => `<i class="${W.kisi[k.id + ':' + i] ? 'on' : ''}"></i>`).join('')}</span></span><span class="go">${ic('maju')}</span></button>`;
  }

  // ---------- KATALOG ----------
  function hasilKatalog() {
    const q = V.q.trim().toLowerCase();
    const r = bukuSaya().filter(b => (!V.mapel || b.mapel === V.mapel) && (!V.kur || b.kur === V.kur) && (!q || (b.judul + ' ' + b.mapel + ' ' + b.ringkas).toLowerCase().includes(q)));
    return r.length ? `<p class="kcount num">${r.length} buku ditemukan</p><div class="grid">${r.map(kartuBuku).join('')}</div>` : `<div class="kosong"><b>Buku tidak ditemukan</b>Coba kata kunci lain atau ubah pilihan mapel dan kurikulum.</div>`;
  }
  function vKatalog() {
    const mapel = [...new Set(bukuSaya().map(b => b.mapel))];
    return `<h1 class="h1" style="margin-top:8px">Katalog buku</h1><p class="sub">Semua buku untuk jenjang ${esc(U.jenjang)}, disusun menurut kurikulum.</p>
      <div class="cari-baris">
        <label class="cari"><span class="sr" style="position:absolute;left:-9999px">Cari buku</span><svg viewBox="0 0 24 24">${P.cari}</svg><input class="in" id="q" type="search" placeholder="Cari judul atau mapel" value="${esc(V.q)}" autocomplete="off"></label>
        <button class="fbtn ${V.kur ? 'aktif' : ''}" data-a="filter" aria-label="Saring kurikulum${V.kur ? ': ' + V.kur : ''}"><svg viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg></button>
      </div>
      <div class="chips lembut" role="group" aria-label="Mata pelajaran"><button class="chip ${V.mapel ? '' : 'on'}" data-a="mapel" data-v="">Semua</button>${mapel.map(m => `<button class="chip ${V.mapel === m ? 'on' : ''}" data-a="mapel" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <div id="hasil" style="margin-top:16px">${hasilKatalog()}</div>`;
  }

  // ---------- DETAIL BUKU ----------
  function vDetail() {
    const b = cariBuku(V.detail), pr = W.baca[b.id], fav = W.fav.includes(b.id);
    const terkait = kisiSaya().flatMap(k => k.topik.flatMap(t => t.materi.filter(m => m.buku === b.id).slice(0, 1).map(m => ({ k, t: { t: t.t, hal: m.hal } }))));
    let toc = '', babTerakhir = 0;
    b.hal.forEach((h, i) => {
      if (h.bab !== babTerakhir) { babTerakhir = h.bab; toc += `<div class="babh">Bab ${h.bab} · ${esc(b.bab[h.bab - 1])}</div>`; }
      const sudah = pr && i < pr.i;
      toc += `<button class="${sudah ? 'done' : ''}" data-a="baca" data-id="${b.id}" data-i="${i}"><span class="n num">${sudah ? ic('cek').replace('<svg', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"') : i + 1}</span><span><b>${esc(h.judul)}</b></span></button>`;
    });
    return `<button class="back" data-a="tutup-detail">${ic('kembali')}Kembali</button>
      <div class="detail"><div class="cv">${cover(b)}</div><div>
        <h1>${esc(b.judul)}</h1>
        <div class="meta"><span class="tag">${esc(b.mapel)}</span><span class="tag">${esc(b.kelas)}</span><span class="tag">Kurikulum ${esc(b.kur)}</span></div>
        <p class="muted" style="max-width:60ch">${esc(b.ringkas)}</p>
        ${pr ? `<div style="margin-top:16px;max-width:360px"><div class="bar"><span style="width:${pct(b)}%"></span></div><p class="muted num" style="font-size:13.5px;margin-top:6px">${pct(b)}% dibaca · berhenti di halaman ${pr.i + 1}</p></div>` : ''}
        <div class="act"><button class="btn btn-p" data-a="baca" data-id="${b.id}" data-i="${pr ? pr.i : 0}">${pr ? 'Lanjutkan membaca' : 'Mulai membaca'}</button>
          <button class="btn btn-l" data-a="fav" data-id="${b.id}" aria-pressed="${fav}">${fav ? 'Hapus dari favorit' : 'Tambah ke favorit'}</button></div>
        <section class="sec"><div class="sec-h"><h2>Daftar isi</h2></div><div class="card toc">${toc}</div></section>
        ${terkait.length ? `<section class="sec"><div class="sec-h"><h2>Dipakai untuk ujian</h2></div><div class="list" style="margin-top:0">${terkait.map(({ k, t }) => `<button class="card quote" data-a="baca" data-id="${b.id}" data-i="${t.hal}"><b>${esc(t.t)}</b><small>${esc(k.judul)} · buka materinya</small></button>`).join('')}</div></section>` : ''}
      </div></div>`;
  }

  // ---------- BELAJAR (kisi-kisi dari bank soal) ----------
  function vBelajar() {
    const ks = kisiSaya();
    return `<h1 class="h1" style="margin-top:8px">Kisi-kisi ujian</h1><p class="sub">Disusun gurumu di Bank Soal CBT &amp; LMS. Baca topiknya, lalu buka buku yang sudah dipilihkan AI untukmu.</p>
      ${ks.map(k => {
        const d = k.topik.filter((_, i) => W.kisi[k.id + ':' + i]).length;
        return `<section class="card kisi" id="k-${k.id}"><div class="kisi-h"><div><h3>${esc(k.judul)}</h3><p class="kisi-meta">${k.hari <= 3 ? '<span class="baru">Baru</span>' : ''}${esc(k.mapel)} · dari guru, ${kapan(Date.now() - k.hari * 864e5)}</p></div><span class="tag num">${d}/${k.topik.length} dipahami</span></div>
          <div class="bar" style="margin-top:12px"><span style="width:${d / k.topik.length * 100}%"></span></div>
          ${k.topik.map((t, i) => {
            const on = W.kisi[k.id + ':' + i], bk = [...new Set(t.materi.map(m => m.buku))].map(cariBuku);
            return `<div class="tp"><button class="cb ${on ? 'on' : ''}" data-a="kisi" data-k="${k.id}:${i}" role="checkbox" aria-checked="${!!on}" aria-label="Sudah paham: ${esc(t.t)}">${ic('cek')}</button>
              <button class="tp-b" data-a="materi" data-k="${k.id}:${i}"><b>${esc(t.t)}</b><p>${esc(t.i)}</p>
              <span class="rel"><span class="stack">${bk.map(cover).join('')}</span><span class="rel-t"><span class="ai">AI</span>${t.materi.length} bagian buku yang cocok</span>${ic('maju')}</span></button></div>`;
          }).join('')}</section>`;
      }).join('')}`;
  }

  // ---------- "AI" pemindai kisi-kisi (simulasi di preview) ----------
  // Mencocokkan kata kunci kisi-kisi dengan isi halaman buku, lalu memberi skor dan kutipan.
  // Di aplikasi asli, langkah ini diganti hasil indeks AI dari server.
  const BUANG = 'dan yang untuk dengan sesuai dalam beserta tiga dari pada atau menjelaskan menentukan membedakan menghitung mengidentifikasi menulis menyelesaikan mengubah menemukan mengelompokkan menggambar fungsinya'.split(' ');
  const kataKunci = t => [...new Set((t.t + ' ' + t.i).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !BUANG.includes(w)))];
  const akar = w => w.slice(0, 5);
  function pindai(t) {
    const kk = kataKunci(t);
    return t.materi.map(m => {
      const b = cariBuku(m.buku), h = b.hal[m.hal], teks = (h.judul + ' ' + h.p.join(' ')).toLowerCase();
      const kena = kk.filter(w => teks.includes(akar(w)));
      const kal = h.p.join(' ').split(/(?<=[.!?])\s+/);
      const skorKal = s => kena.filter(w => s.toLowerCase().includes(akar(w))).length;
      let kutip = kal.reduce((a, s) => skorKal(s) > skorKal(a) ? s : a, kal[0]);
      if (kutip.length > 150) kutip = kutip.slice(0, 147).replace(/\s\S*$/, '') + '…';
      kutip = esc(kutip);
      kena.forEach(w => { kutip = kutip.replace(new RegExp('(?<![\\w>])(' + akar(w) + '[a-z]*)', 'gi'), '<mark>$1</mark>'); });
      return { b, h, i: m.hal, skor: Math.min(98, 72 + Math.round(kena.length / Math.max(kk.length, 1) * 26)), kutip };
    }).sort((x, y) => y.skor - x.skor);
  }
  const sudahPindai = new Set();
  const disimpan = (id, i) => W.hal.some(x => x.id === id && x.i === i);
  function kartuRek(r) {
    const s = disimpan(r.b.id, r.i), dibaca = W.baca[r.b.id] && W.baca[r.b.id].i >= r.i;
    return `<article class="rek"><div class="rek-a"><span class="rek-c">${cover(r.b)}</span><div><span class="rek-bab">Bab ${r.h.bab} · ${esc(r.b.bab[r.h.bab - 1])}</span><b>${esc(r.h.judul)}</b><span class="s">${esc(r.b.judul)} · halaman ${r.i + 1}</span></div><span class="cocok num">${r.skor}%<small>cocok</small></span></div>
      <p class="kutip">${r.kutip}</p>
      <div class="rek-b"><button class="btn btn-p" data-a="baca" data-id="${r.b.id}" data-i="${r.i}">${dibaca ? 'Baca lagi' : 'Baca bagian ini'}</button><button class="btn btn-l ${s ? 'on' : ''}" data-a="rek-simpan" data-id="${r.b.id}" data-i="${r.i}" aria-pressed="${s}">${s ? 'Tersimpan' : 'Simpan'}</button></div></article>`;
  }
  // sheet: rekomendasi buku, bab, dan halaman untuk satu topik kisi-kisi
  function sheetMateri(kunci) {
    const [kid, i] = kunci.split(':'), k = D.kisi.find(x => x.id === kid), t = k.topik[+i], on = W.kisi[kunci];
    const isi = () => `${pindai(t).map(kartuRek).join('')}<p class="ai-catat">Dipilih AI dari buku kurikulum sekolah berdasarkan isi kisi-kisi. Kalau ada yang kurang pas, tanyakan ke gurumu.</p>
      <button class="btn ${on ? 'btn-l' : 'btn-p'}" data-a="kisi-sheet" data-k="${kunci}">${on ? 'Batalkan tanda sudah paham' : 'Tandai sudah paham'}</button>`;
    lapis(`<div><h3>${esc(k.judul)}</h3><h2 style="margin-top:2px">${esc(t.t)}</h2><p class="muted" style="font-size:14.5px;margin-top:6px">${esc(t.i)}</p></div>
      <div id="rek" data-k="${kunci}">${sudahPindai.has(kunci) ? isi() : `<div class="pindai"><span class="ai">AI</span>Mencari bab dan halaman yang paling sesuai…</div>${'<div class="skel"></div>'.repeat(Math.min(t.materi.length, 2))}`}</div>`);
    if (!sudahPindai.has(kunci)) setTimeout(() => { const el = $('#rek'); if (el && el.dataset.k === kunci) { sudahPindai.add(kunci); el.innerHTML = isi(); el.classList.add('muncul'); } }, 1100);
  }

  // ---------- NOTIFIKASI ----------
  // kisi-kisi baru (dibuat ≤ 3 hari) dan pengingat buku yang tidak dibuka lebih dari 48 jam
  function daftarNotif() {
    const bs = bukuSaya(), n = [];
    kisiSaya().filter(k => k.hari <= 3).forEach(k => {
      const w = cariBuku(k.topik[0].materi[0].buku).warna;
      n.push({ id: 'kisi:' + k.id, ts: Date.now() - k.hari * 864e5, waktu: kapan(Date.now() - k.hari * 864e5), jenis: 'Kisi-kisi baru', judul: k.judul, isi: `${k.topik.length} topik dari gurumu. Rekomendasi bukunya sudah siap dibaca.`, kiri: `<span class="km" style="--c1:${w[0]};--c2:${w[1]}">${esc(k.mapel.slice(0, 3).toUpperCase())}</span>`, cta: `<button class="btn btn-l" data-a="n-kisi" data-k="${k.id}">Lihat kisi-kisi</button>` });
    });
    Object.entries(W.baca).forEach(([id, v]) => {
      const b = bs.find(x => x.id === id);
      if (!b || Date.now() - v.ts < 48 * 36e5 || v.i >= b.hal.length - 1) return;
      const h = b.hal[v.i];
      n.push({ id: 'baca:' + id + ':' + v.ts, ts: v.ts + 48 * 36e5, waktu: 'terakhir dibuka ' + kapan(v.ts), jenis: 'Lanjutkan membaca', judul: b.judul, isi: `Kamu berhenti di halaman ${v.i + 1} dari ${b.hal.length}, “${h.judul}” (Bab ${h.bab}). Sedikit lagi, yuk lanjutkan.`, kiri: `<span class="n-c">${cover(b)}</span>`, cta: `<button class="btn btn-p" data-a="baca" data-id="${id}" data-i="${v.i}">Lanjut dari halaman ${v.i + 1}</button>` });
    });
    return n.sort((a, b) => b.ts - a.ts);
  }
  const belumDibaca = () => daftarNotif().filter(x => !W.nbaca.includes(x.id)).length;
  const bellHtml = () => { const j = belumDibaca(); return `<button class="bell ${j ? 'ada' : ''}" data-a="notif" aria-label="Notifikasi${j ? ', ' + j + ' baru' : ''}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15.5 6 9z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>${j ? `<span class="badge num">${j}</span>` : ''}</button>`; };
  const segarkanBell = () => document.querySelectorAll('.bell-w').forEach(w => { w.innerHTML = bellHtml(); });
  function panelNotif() {
    const n = daftarNotif();
    lapis(`<div class="n-h"><h2>Notifikasi</h2>${n.length ? `<span class="muted">${n.length} pemberitahuan</span>` : ''}</div>
      ${n.length ? n.map(x => `<article class="nt ${W.nbaca.includes(x.id) ? '' : 'baru'}">${x.kiri}<div><span class="n-j">${x.jenis} · ${x.waktu}</span><b>${esc(x.judul)}</b><p>${esc(x.isi)}</p>${x.cta}</div></article>`).join('') : `<div class="kosong"><b>Belum ada notifikasi</b>Kami kabari saat gurumu menambah kisi-kisi baru atau ada buku yang belum selesai kamu baca.</div>`}`);
    W.nbaca = [...new Set([...W.nbaca, ...n.map(x => x.id)])]; simpan(); segarkanBell();
  }

  // ---------- PROFIL ----------
  function vProfil() {
    const bs = bukuSaya(), ks = kisiSaya(), ada = id => bs.some(b => b.id === id);
    const topik = ks.reduce((n, k) => n + k.topik.length, 0), paham = ks.reduce((n, k) => n + k.topik.filter((_, i) => W.kisi[k.id + ':' + i]).length, 0);
    const seg = (a, cur, opsi) => `<div class="seg">${opsi.map(([v, n]) => `<button class="${cur === v ? 'on' : ''}" data-a="${a}" data-v="${v}">${n}</button>`).join('')}</div>`;
    return `<section class="pf-head"><span class="avatar">${esc(inisial(U.nama))}</span><div><h1>${esc(U.nama)}</h1><p>${esc(U.kelas)} · ${esc(U.jenjang)}</p><span class="tag">Siswa terverifikasi</span></div></section>
      <div class="stat">
        <div class="card"><b class="num">${Object.keys(W.baca).filter(ada).length}</b><span>buku dibaca</span></div>
        <div class="card"><b class="num">${W.tandai.filter(x => ada(x.id)).length}</b><span>tandai dan catatan</span></div>
        <div class="card"><b class="num">${W.hal.filter(x => ada(x.id)).length}</b><span>halaman favorit</span></div>
        <div class="card"><b class="num">${paham}/${topik}</b><span>topik ujian dipahami</span></div>
      </div>
      <section class="sec"><div class="sec-h"><h2>Data sekolah</h2></div><div class="card rows">
        <div><span>Nama</span><span>${esc(U.nama)}</span></div>
        <div><span>NISN</span><span class="num">${esc(U.nisn.slice(0, 4) + '••••' + U.nisn.slice(-2))}</span></div>
        <div><span>NIS</span><span class="num">${esc(U.nis)}</span></div>
        <div><span>Kelas</span><span>${esc(U.kelas)}</span></div>
        <div><span>Jenjang</span><span>${esc(U.jenjang)}</span></div>
        <div><span>Akun Google</span><span>${esc(W.email || 'Terhubung')}</span></div>
      </div><p class="muted" style="font-size:13.5px;margin-top:10px">Data di atas berasal dari sekolah. Jika ada yang keliru, sampaikan ke wali kelas.</p></section>
      <section class="sec"><div class="sec-h"><h2>Kemajuan belajar</h2><button class="link" data-a="tab" data-t="belajar">Buka Belajar</button></div><div class="ujian-ring">${ks.map(kartuKisi).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2>Tampilan membaca</h2></div><div class="card pref">
        <div><span class="lbl">Ukuran huruf</span>${seg('p-fs', W.fs, [[17, 'Kecil'], [19, 'Sedang'], [23, 'Besar']])}</div>
        <div><span class="lbl">Latar membaca</span>${seg('p-tema', W.tema, [['terang', 'Terang'], ['sepia', 'Sepia'], ['gelap', 'Gelap']])}</div>
      </div></section>
      <section class="sec"><button class="btn btn-l" data-a="keluar" style="width:100%">Keluar dari akun</button></section>`;
  }

  // ---------- KOLEKSI ----------
  function vKoleksi() {
    const bs = bukuSaya(), tabs = [['riwayat', 'Riwayat baca'], ['favorit', 'Favorit'], ['catatan', 'Tandai dan catatan'], ['rangkuman', 'Rangkuman']];
    let isi = '';
    const baris = (b, extra) => `<button class="card item" data-a="buka" data-id="${b.id}"><div>${cover(b)}</div><div><h3>${esc(b.judul)}</h3><p>${extra}</p></div><span class="muted">${ic('maju').replace('<svg', '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"')}</span></button>`;
    if (V.kol === 'riwayat') {
      const r = Object.entries(W.baca).filter(([id]) => bs.some(b => b.id === id)).sort((a, b) => b[1].ts - a[1].ts);
      isi = r.length ? r.map(([id, v]) => baris(cariBuku(id), `<span class="num">${pct(cariBuku(id))}% dibaca</span> · ${kapan(v.ts)}`)).join('') : `<div class="kosong"><b>Belum ada riwayat</b>Buku yang kamu baca akan muncul di sini, lengkap dengan halaman terakhir.</div>`;
    } else if (V.kol === 'favorit') {
      const f = bs.filter(b => W.fav.includes(b.id));
      isi = f.length ? f.map(b => baris(b, esc(b.mapel))).join('') : `<div class="kosong"><b>Belum ada favorit</b>Buka sebuah buku, lalu tekan Tambah ke favorit.</div>`;
    } else if (V.kol === 'catatan') {
      const t = W.tandai.filter(x => bs.some(b => b.id === x.id)), h = W.hal.filter(x => bs.some(b => b.id === x.id));
      isi = (t.length || h.length) ? t.map(x => quoteHtml(x, true)).join('') + h.map(x => { const b = cariBuku(x.id); return `<button class="card quote" data-a="baca" data-id="${x.id}" data-i="${x.i}"><b>Halaman favorit: ${esc(b.hal[x.i].judul)}</b><small>${esc(b.judul)} · halaman ${x.i + 1}</small></button>`; }).join('') : `<div class="kosong"><b>Belum ada tandai atau catatan</b>Saat membaca, tahan lalu geser pada kalimat untuk menandainya.</div>`;
    } else {
      const r = bs.filter(b => (W.rk[b.id] || '').trim() || W.tandai.some(x => x.id === b.id));
      isi = r.length ? r.map(b => `<button class="card item" data-a="baca" data-id="${b.id}" data-i="${(W.baca[b.id] || { i: 0 }).i}" data-p="rangkuman"><div>${cover(b)}</div><div><h3>${esc(b.judul)}</h3><p>${(W.rk[b.id] || '').trim() ? 'Rangkuman sudah ditulis' : 'Belum ada rangkuman — susun dari tandai dan catatanmu'}</p></div><span></span></button>`).join('') : `<div class="kosong"><b>Belum ada rangkuman</b>Setelah menandai kalimat, kamu bisa menyusun rangkuman dari panel di pembaca.</div>`;
    }
    return `<h1 class="h1" style="margin-top:8px">Koleksi saya</h1><p class="sub">Semua bacaan, favorit, tandai, dan rangkumanmu di satu tempat.</p>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" aria-selected="${V.kol === k}" class="${V.kol === k ? 'on' : ''}" data-a="kol" data-k="${k}">${n}</button>`).join('')}</div>
      <div class="list">${isi}</div>`;
  }
  function quoteHtml(x, denganBuku) {
    const b = cariBuku(x.id);
    return `<button class="card quote" data-a="baca" data-id="${x.id}" data-i="${x.i}"><q>${esc(x.teks)}</q>${x.cat ? `<div class="cat">${esc(x.cat)}</div>` : ''}<small>${denganBuku ? esc(b.judul) + ' · ' : ''}halaman ${x.i + 1}</small></button>`;
  }

  // ======================= PEMBACA =======================
  function bukaReader(id, i, panel) {
    const b = cariBuku(id);
    R = { b, i: Math.min(i, b.hal.length - 1), panel: panel || null, sel: null, pop: false, anim: null };
    $('#reader').hidden = false; document.body.style.overflow = 'hidden';
    $('#reader').innerHTML = '<div class="reader" id="rd"><div class="r-top" id="r-top"></div><div class="r-body" id="r-body"></div><div id="r-sel"></div><div id="r-hint" class="hint"></div><div class="r-bot" id="r-bot"></div><div id="r-pop"></div><div id="r-panel"></div></div>';
    catat(); gambarSemua();
    if (panel) gambarPanel();
  }
  function tutupReader() { R = null; $('#reader').hidden = true; $('#reader').innerHTML = ''; document.body.style.overflow = ''; render(); }
  const catat = () => { W.baca[R.b.id] = { i: R.i, ts: Date.now() }; simpan(); };
  function gambarSemua() {
    $('#rd').className = 'reader ' + (W.tema === 'terang' ? '' : W.tema);
    $('#rd').style.setProperty('--fs', W.fs + 'px');
    gambarAtas(); gambarHalaman(); gambarBawah(); gambarSel(); gambarPop();
  }
  const halFav = () => W.hal.some(x => x.id === R.b.id && x.i === R.i);
  function gambarAtas() {
    $('#r-top').innerHTML = `<button class="ibtn" data-a="r-tutup" aria-label="Tutup buku">${ic('kembali')}</button>
      <div class="t"><b>${esc(R.b.judul)}</b><span>Bab ${R.b.hal[R.i].bab} · ${esc(R.b.bab[R.b.hal[R.i].bab - 1])}</span></div>
      <button class="ibtn ${halFav() ? 'on' : ''}" data-a="r-favhal" aria-label="${halFav() ? 'Hapus favorit halaman' : 'Jadikan halaman favorit'}" aria-pressed="${halFav()}">${ic('koleksi')}</button>
      <button class="ibtn" data-a="r-pop" aria-label="Ukuran dan tampilan huruf">${ic('aa')}</button>
      <button class="ibtn" data-a="r-panel" data-p="isi" aria-label="Daftar isi, tandai, catatan, rangkuman">${ic('daftar')}</button>`;
  }
  function paragraf(txt, pi) {
    const ms = W.tandai.map((x, idx) => ({ ...x, idx })).filter(x => x.id === R.b.id && x.i === R.i && x.p === pi).sort((a, b) => a.s - b.s);
    let out = '', pos = 0;
    ms.forEach(m => { out += esc(txt.slice(pos, m.s)) + `<mark class="${m.cat ? 'cat' : ''}" data-m="${m.idx}" tabindex="0">${esc(txt.slice(m.s, m.e))}</mark>`; pos = m.e; });
    return `<p data-p="${pi}">${out + esc(txt.slice(pos))}</p>`;
  }
  function gambarHalaman() {
    const h = R.b.hal[R.i], body = $('#r-body'), y = body.scrollTop;
    body.innerHTML = `<article class="page ${R.anim === 'mundur' ? 'mundur' : ''}" style="${R.anim ? '' : 'animation:none'}"><div class="bab">Bab ${h.bab}</div><h1>${esc(h.judul)}</h1>${h.p.map(paragraf).join('')}</article>`;
    body.scrollTop = R.anim ? 0 : y; R.anim = null;
    $('#r-hint').textContent = (W.tandai.length === 0) ? 'Tahan atau seret pada kalimat untuk menandai' : '';
  }
  function gambarBawah() {
    const n = R.b.hal.length;
    $('#r-bot').innerHTML = `<button class="btn btn-l" data-a="r-prev" ${R.i === 0 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${ic('kembali')}</button>
      <div><div class="bar"><span style="width:${(R.i + 1) / n * 100}%"></span></div><small class="num">Halaman ${R.i + 1} dari ${n}</small></div>
      <button class="btn btn-p" data-a="r-next" ${R.i === n - 1 ? 'disabled' : ''} aria-label="Halaman berikutnya">${ic('maju')}</button>`;
  }
  function gambarSel() {
    const s = R.sel, el = $('#r-sel');
    if (!s) { el.innerHTML = ''; return; }
    if (s.jenis === 'baru') {
      el.innerHTML = `<div class="selbar"><q>“${esc(s.teks)}”</q><div class="xs"><button class="btn btn-p btn-s" data-a="r-tandai">Tandai</button><button class="btn btn-w btn-s" data-a="r-catatan">Tulis catatan</button><button class="btn btn-s" style="color:#fff;background:rgba(255,255,255,.14)" data-a="r-batal">Batal</button></div></div>`;
    } else {
      const m = W.tandai[s.idx];
      el.innerHTML = `<div class="selbar"><q>“${esc(m.teks)}”</q>${m.cat ? `<div style="font-size:14px;background:rgba(255,255,255,.12);border-radius:10px;padding:8px 12px">${esc(m.cat)}</div>` : ''}<div class="xs"><button class="btn btn-w btn-s" data-a="r-catatan" data-ubah="1">${m.cat ? 'Ubah catatan' : 'Tambah catatan'}</button><button class="btn btn-s" style="color:#fff;background:rgba(255,255,255,.14)" data-a="r-hapus" data-idx="${s.idx}">Hapus tandai</button><button class="btn btn-s" style="color:#fff;background:rgba(255,255,255,.14)" data-a="r-batal">Tutup</button></div></div>`;
    }
  }
  function gambarPop() {
    $('#r-pop').innerHTML = R.pop ? `<div class="pop"><div><div class="lbl">Ukuran huruf</div><div class="seg"><button data-a="r-fs" data-v="-1" aria-label="Perkecil huruf">A−</button><button disabled class="on num">${W.fs}</button><button data-a="r-fs" data-v="1" aria-label="Perbesar huruf">A+</button></div></div>
      <div><div class="lbl">Latar membaca</div><div class="seg">${[['terang', 'Terang'], ['sepia', 'Sepia'], ['gelap', 'Gelap']].map(([k, n]) => `<button class="${W.tema === k ? 'on' : ''}" data-a="r-tema" data-v="${k}">${n}</button>`).join('')}</div></div></div>` : '';
  }
  function gambarPanel() {
    const el = $('#r-panel');
    if (!R.panel) { el.innerHTML = ''; return; }
    const b = R.b, mine = W.tandai.map((x, idx) => ({ ...x, idx })).filter(x => x.id === b.id);
    const tabs = [['isi', 'Isi'], ['tandai', 'Tandai'], ['catatan', 'Catatan'], ['rangkuman', 'Rangkuman']];
    let pb = '';
    if (R.panel === 'isi') {
      let bb = 0;
      pb = b.hal.map((h, i) => { let t = ''; if (h.bab !== bb) { bb = h.bab; t = `<div class="babh">Bab ${h.bab} · ${esc(b.bab[h.bab - 1])}</div>`; } return t + `<button class="card item" style="grid-template-columns:1fr;${i === R.i ? 'outline:2px solid var(--brand)' : ''}" data-a="r-ke" data-i="${i}"><div><h3>${esc(h.judul)}</h3><p class="num">Halaman ${i + 1}${i === R.i ? ' · sedang dibaca' : ''}</p></div></button>`; }).join('');
    } else if (R.panel === 'tandai' || R.panel === 'catatan') {
      const arr = mine.filter(x => R.panel === 'catatan' ? x.cat : !x.cat);
      pb = arr.map(x => `<div class="card quote"><button data-a="r-ke" data-i="${x.i}" style="text-align:left;display:grid;gap:6px"><q>${esc(x.teks)}</q>${x.cat ? `<div class="cat">${esc(x.cat)}</div>` : ''}<small>halaman ${x.i + 1}</small></button><button class="link" style="color:var(--bad);justify-self:start" data-a="r-hapus" data-idx="${x.idx}">Hapus</button></div>`).join('');
      if (R.panel === 'tandai') {
        const hf = W.hal.filter(x => x.id === b.id);
        pb += hf.length ? `<div class="babh">Halaman favorit</div>` + hf.map(x => `<button class="card item" style="grid-template-columns:1fr" data-a="r-ke" data-i="${x.i}"><div><h3>${esc(b.hal[x.i].judul)}</h3><p class="num">Halaman ${x.i + 1}</p></div></button>`).join('') : '';
        if (!arr.length && !hf.length) pb = `<div class="kosong"><b>Belum ada tandai</b>Tahan lalu geser pada kalimat untuk menandainya, atau tekan ikon penanda di atas untuk menyimpan halaman.</div>`;
      } else if (!arr.length) pb = `<div class="kosong"><b>Belum ada catatan</b>Pilih kalimat di bacaan, lalu tekan Tulis catatan.</div>`;
    } else {
      pb = `<div class="rk" style="display:grid;gap:12px"><p class="muted" style="font-size:14px">Tulis rangkuman dengan kata-katamu sendiri. Tersimpan otomatis.</p>
        <textarea class="in" id="rk" placeholder="Tulis rangkuman di sini…">${esc(W.rk[b.id] || '')}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-g btn-s" data-a="r-susun">Susun dari tandai dan catatan</button><button class="btn btn-l btn-s" data-a="r-salin">Salin</button></div>
        <p class="muted" style="font-size:13px">${mine.length} tandai dan catatan tersedia untuk buku ini.</p></div>`;
    }
    el.innerHTML = `<div class="panel" data-a="r-panel-tutup"><div><header><b>${esc(b.judul)}</b><button class="ibtn" data-a="r-panel-x" aria-label="Tutup panel">${ic('tutup')}</button></header>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" aria-selected="${R.panel === k}" class="${R.panel === k ? 'on' : ''}" data-a="r-panel" data-p="${k}">${n}</button>`).join('')}</div>
      <div class="pb">${pb}</div></div></div>`;
  }

  function gantiHalaman(i, arah) {
    if (i < 0 || i >= R.b.hal.length || i === R.i) return;
    R.anim = arah || (i < R.i ? 'mundur' : 'maju'); R.i = i; R.sel = null; catat();
    gambarAtas(); gambarHalaman(); gambarBawah(); gambarSel();
  }

  // pilihan teks -> bilah aksi (di luar area baca, supaya seleksi tidak hilang)
  let selT;
  document.addEventListener('selectionchange', () => {
    if (!R || R.panel) return;
    clearTimeout(selT);
    selT = setTimeout(() => {
      const s = getSelection();
      if (!s || s.isCollapsed || !s.rangeCount) return; // bilah ditutup lewat klik di area baca / tombol Batal
      const r = s.getRangeAt(0);
      const pa = r.startContainer.parentElement && r.startContainer.parentElement.closest('p[data-p]');
      const pb = r.endContainer.parentElement && r.endContainer.parentElement.closest('p[data-p]');
      if (!pa || pa !== pb) return;
      const teks = r.toString().replace(/\s+/g, ' ').trim();
      if (teks.length < 3) return;
      const pre = document.createRange(); pre.selectNodeContents(pa); pre.setEnd(r.startContainer, r.startOffset);
      const st = pre.toString().length;
      R.sel = { jenis: 'baru', p: +pa.dataset.p, s: st, e: st + r.toString().length, teks: teks.length > 300 ? teks.slice(0, 300) + '…' : teks };
      gambarSel();
    }, 180);
  });

  function simpanTandai(cat) {
    const s = R.sel, ada = W.tandai.some(x => x.id === R.b.id && x.i === R.i && x.p === s.p && x.s < s.e && s.s < x.e);
    if (ada) { toast('Bagian ini sudah ditandai'); return; }
    W.tandai.push({ id: R.b.id, i: R.i, p: s.p, s: s.s, e: s.e, teks: s.teks, cat: cat || '', ts: Date.now() });
    simpan(); getSelection().removeAllRanges(); R.sel = null; gambarHalaman(); gambarSel();
    toast(cat ? 'Catatan tersimpan' : 'Teks ditandai');
  }
  function formCatatan(awal, onSimpan) {
    lapis(`<h2>Tulis catatan</h2><textarea class="in" id="cat-in" placeholder="Apa yang ingin kamu ingat dari bagian ini?">${esc(awal)}</textarea><button class="btn btn-p" data-a="cat-simpan">Simpan catatan</button><button class="btn btn-g" data-a="lapis-tutup-btn">Batal</button>`);
    formCatatan.cb = onSimpan; setTimeout(() => { const t = $('#cat-in'); t && t.focus(); }, 60);
  }

  // ---------- aksi klik (delegasi) ----------
  const aksi = {
    google: () => { L.email = D.akunGoogle.find(x => x.email.includes(JENJANG.toLowerCase())).email; L.step = 'verif'; L.err = L.nomor = ''; renderLogin(); },
    ulang: () => { L.step = 'awal'; L.err = ''; renderLogin(); },
    'isi-uji': t => { const f = $('#f-verif input'); f.value = t.dataset.v; f.dispatchEvent(new Event('input', { bubbles: true })); f.focus(); },
    tab: t => ke(t.dataset.t),
    buka: t => ke(V.tab, t.dataset.id),
    'tutup-detail': () => ke(V.tab),
    mapel: t => { V.mapel = t.dataset.v; render(); },
    filter: () => lapis(`<h2>Saring buku</h2><p class="muted" style="font-size:14.5px;margin-top:-6px">Pilih kurikulum yang dipakai di kelasmu.</p><div class="opsi">${[['', 'Semua kurikulum'], ['Merdeka', 'Kurikulum Merdeka'], ['K13', 'Kurikulum 2013 (K13)']].map(([v, n]) => `<button class="${V.kur === v ? 'on' : ''}" data-a="kur" data-v="${v}">${n}${V.kur === v ? ic('cek') : ''}</button>`).join('')}</div>`),
    kur: t => { V.kur = t.dataset.v; lapis(''); render(); },
    kol: t => { V.kol = t.dataset.k; render(); },
    fav: t => { const id = t.dataset.id; W.fav = W.fav.includes(id) ? W.fav.filter(x => x !== id) : [...W.fav, id]; simpan(); render(); toast(W.fav.includes(id) ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit'); },
    kisi: t => { const k = t.dataset.k; W.kisi[k] = !W.kisi[k]; simpan(); const y = scrollY; render(); scrollTo(0, y); },
    materi: t => sheetMateri(t.dataset.k),
    'rek-simpan': t => { const id = t.dataset.id, i = +t.dataset.i, s = disimpan(id, i); W.hal = s ? W.hal.filter(x => !(x.id === id && x.i === i)) : [...W.hal, { id, i }]; simpan(); t.classList.toggle('on', !s); t.setAttribute('aria-pressed', !s); t.textContent = s ? 'Simpan' : 'Tersimpan'; toast(s ? 'Dihapus dari halaman favorit' : 'Disimpan ke Koleksi sebagai halaman favorit'); },
    notif: () => panelNotif(),
    'n-kisi': t => { lapis(''); ke('belajar'); const el = document.getElementById('k-' + t.dataset.k); if (el) { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); el.classList.add('sorot'); setTimeout(() => el.classList.remove('sorot'), 1800); } },
    'kisi-sheet': t => { const k = t.dataset.k; W.kisi[k] = !W.kisi[k]; simpan(); lapis(''); const y = scrollY; render(); scrollTo(0, y); toast(W.kisi[k] ? 'Topik ditandai sudah paham' : 'Tanda paham dibatalkan'); },
    'p-fs': t => { W.fs = +t.dataset.v; simpan(); render(); },
    'p-tema': t => { W.tema = t.dataset.v; simpan(); render(); },
    baca: t => { lapis(''); bukaReader(t.dataset.id, +t.dataset.i || 0, t.dataset.p); },
    keluar: () => { lapis(''); simpanKe('darqia-perpus-sesi', ''); U = W = null; L.step = 'awal'; L.email = ''; $('#app').hidden = true; $('#app').innerHTML = ''; renderLogin(); },
    'lapis-tutup': (t, e) => { if (e.target === t) lapis(''); },
    'lapis-tutup-btn': () => lapis(''),
    'cat-simpan': () => { const v = $('#cat-in').value.trim(); lapis(''); formCatatan.cb && formCatatan.cb(v); },
    // pembaca
    'r-tutup': tutupReader,
    'r-prev': () => gantiHalaman(R.i - 1),
    'r-next': () => gantiHalaman(R.i + 1),
    'r-favhal': () => { W.hal = halFav() ? W.hal.filter(x => !(x.id === R.b.id && x.i === R.i)) : [...W.hal, { id: R.b.id, i: R.i }]; simpan(); gambarAtas(); toast(halFav() ? 'Halaman disimpan ke favorit' : 'Favorit halaman dihapus'); },
    'r-pop': () => { R.pop = !R.pop; gambarPop(); },
    'r-fs': t => { W.fs = Math.max(15, Math.min(28, W.fs + (+t.dataset.v) * 2)); simpan(); gambarSemua(); R.pop = true; gambarPop(); },
    'r-tema': t => { W.tema = t.dataset.v; simpan(); gambarSemua(); R.pop = true; gambarPop(); },
    'r-panel': t => { R.panel = t.dataset.p; R.pop = false; gambarPop(); gambarPanel(); },
    'r-panel-x': () => { R.panel = null; gambarPanel(); },
    'r-panel-tutup': (t, e) => { if (e.target === t) { R.panel = null; gambarPanel(); } },
    'r-ke': t => { R.panel = null; gambarPanel(); gantiHalaman(+t.dataset.i); },
    'r-tandai': () => simpanTandai(''),
    'r-catatan': t => {
      if (t.dataset.ubah) { const idx = R.sel.idx; formCatatan(W.tandai[idx].cat, v => { W.tandai[idx].cat = v; simpan(); R.sel = null; gambarHalaman(); gambarSel(); toast('Catatan tersimpan'); }); }
      else formCatatan('', v => simpanTandai(v));
    },
    'r-batal': () => { getSelection().removeAllRanges(); R.sel = null; gambarSel(); },
    'r-hapus': t => { W.tandai.splice(+t.dataset.idx, 1); simpan(); R.sel = null; gambarHalaman(); gambarSel(); gambarPanel(); toast('Tandai dihapus'); },
    'r-susun': () => {
      const m = W.tandai.filter(x => x.id === R.b.id).sort((a, b) => a.i - b.i || a.p - b.p || a.s - b.s);
      if (!m.length) { toast('Belum ada tandai atau catatan untuk disusun'); return; }
      const draf = m.map(x => '• ' + x.teks + (x.cat ? '\n  Catatanku: ' + x.cat : '')).join('\n');
      const lama = (W.rk[R.b.id] || '').trim();
      W.rk[R.b.id] = (lama ? lama + '\n\n' : 'Rangkuman ' + R.b.judul + '\n\n') + draf; simpan(); gambarPanel(); toast('Rangkuman disusun, silakan sunting');
    },
    'r-salin': () => { const v = W.rk[R.b.id] || ''; if (!v.trim()) { toast('Rangkuman masih kosong'); return; } try { navigator.clipboard.writeText(v).then(() => toast('Rangkuman disalin'), () => toast('Gagal menyalin')); } catch (e) { toast('Gagal menyalin'); } }
  };
  document.addEventListener('click', e => {
    const m = e.target.closest('mark[data-m]');
    if (m && R) { R.sel = { jenis: 'mark', idx: +m.dataset.m }; gambarSel(); return; }
    const t = e.target.closest('[data-a]');
    if (R && R.sel && R.sel.jenis === 'baru' && e.target.closest('#r-body')) { R.sel = null; gambarSel(); }
    if (t && aksi[t.dataset.a]) aksi[t.dataset.a](t, e);
    else if (R && R.pop && !e.target.closest('.pop')) { R.pop = false; gambarPop(); }
  });
  document.addEventListener('input', e => {
    if (e.target.name === 'nomor') {
      const v = e.target.value = e.target.value.replace(/\D/g, ''), ok = v.length === 5 || v.length === 10, fm = e.target.closest('form');
      L.nomor = v; L.err = ''; fm.querySelector('.nis-f').classList.toggle('ok', ok); fm.querySelector('button[type=submit]').disabled = !ok;
      const er = fm.querySelector('.err'); if (er) er.outerHTML = '<small class="l-h">NIS terdiri dari 5 angka, NISN 10 angka.</small>';
    }
    if (e.target.id === 'q') { V.q = e.target.value; $('#hasil').innerHTML = hasilKatalog(); }
    else if (e.target.id === 'rk') { W.rk[R.b.id] = e.target.value; simpan(); }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'f-verif') return;
    e.preventDefault();
    const n = L.nomor = e.target.nomor.value.replace(/\D/g, '');
    if (!n) { L.err = 'Isi NIS atau NISN kamu dulu.'; renderLogin(); return; }
    const s = D.siswa.find(x => (x.nisn === n || x.nis === n) && x.jenjang === JENJANG);
    if (!s) { L.err = 'Nomor belum terdaftar. Periksa lagi atau tanyakan ke wali kelas.'; renderLogin(); return; }
    toast('Terverifikasi. Selamat datang, ' + s.nama.split(' ')[0] + '!'); masuk(s);
  });
  document.addEventListener('keydown', e => {
    if (!R) return;
    if (e.target.matches('textarea,input')) return;
    if (e.key === 'ArrowRight') gantiHalaman(R.i + 1);
    else if (e.key === 'ArrowLeft') gantiHalaman(R.i - 1);
    else if (e.key === 'Escape') { if (R.panel) { R.panel = null; gambarPanel(); } else tutupReader(); }
    else if ((e.key === 'Enter') && e.target.matches('mark[data-m]')) { R.sel = { jenis: 'mark', idx: +e.target.dataset.m }; gambarSel(); }
  });
  // geser kiri/kanan di area baca untuk pindah halaman
  let tx = null;
  document.addEventListener('touchstart', e => { tx = e.target.closest('#r-body') ? e.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (tx === null || !R || (getSelection() && !getSelection().isCollapsed)) { tx = null; return; }
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 80) gantiHalaman(R.i + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // pulihkan sesi
  const nisn = bacaDari('darqia-perpus-sesi'), s0 = D.siswa.find(x => x.nisn === nisn);
  if (s0 && s0.jenjang === JENJANG) { U = s0; W = muat(s0.nisn); }
  render();
})();
