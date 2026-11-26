#!/usr/bin/env python3
"""Ekstraksi indeks bab Perpus Digital Darqia -> tabel perpus_bab (migrasi 0095).

Sumber kebenaran bab = isi PDF ter-host di /srv/darqia/perpus (tidak ada bab karangan):
1) Outline/bookmark PDF bila ada entri berpenanda eksplisit "Bab/Unit/Chapter N" (>= 2).
2) Halaman Daftar Isi: baris "Bab N Judul .... <halaman cetak>" + subbab bernomor (1.1, A., dst).
   Halaman PDF bab dicari dari teks halaman pembuka bab memakai offset cetak->PDF yang dipelajari
   dari bab pertama yang ketemu; teks tiap halaman diekstrak sekali saja (cache per buku).
3) Buku yang dua-duanya tidak memadai dicatat belum terindeks; rekomendasi siswa jatuh ke
   tingkat buku dengan label jujur.

Jalankan di VPS Darqia:
  PYTHONPATH=/srv/darqia/tools/pylibs python3 /srv/darqia/tools/ekstrak-perpus-bab.py [--dry-run] [--hanya <substr-id>]
Kredensial dibaca dari /srv/darqia/app/.env (NUXT_PUBLIC_SUPABASE_URL + NUXT_SUPABASE_SECRET_KEY).
"""
import json
import logging
import os
import re
import sys
import urllib.request
import urllib.parse
import warnings

warnings.filterwarnings('ignore')
logging.getLogger('pypdf').setLevel(logging.ERROR)

PERPUS_DIR = os.environ.get('PERPUS_DIR', '/srv/darqia/perpus')
ENV_FILE = os.environ.get('DARQIA_ENV', '/srv/darqia/app/.env')

DRY = '--dry-run' in sys.argv
HANYA = None
if '--hanya' in sys.argv:
    HANYA = sys.argv[sys.argv.index('--hanya') + 1]


def baca_env():
    env = {}
    with open(ENV_FILE, encoding='utf-8') as f:
        for baris in f:
            baris = baris.strip()
            if baris and not baris.startswith('#') and '=' in baris:
                k, v = baris.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = baca_env()
SB_URL = ENV['NUXT_PUBLIC_SUPABASE_URL'].rstrip('/')
SB_KEY = ENV['NUXT_SUPABASE_SECRET_KEY']


def sb(method, path, body=None):
    req = urllib.request.Request(SB_URL + '/rest/v1/' + path, method=method)
    req.add_header('apikey', SB_KEY)
    req.add_header('Authorization', 'Bearer ' + SB_KEY)
    data = None
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Prefer', 'return=minimal')
    with urllib.request.urlopen(req, data=data, timeout=60) as r:
        teks = r.read().decode('utf-8')
        return json.loads(teks) if teks else None


def romawi_ke_int(s):
    peta = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
    total, prev = 0, 0
    for ch in reversed(s.upper()):
        v = peta.get(ch, 0)
        if v < prev:
            total -= v
        else:
            total += v
            prev = v
    return total


def bersih_judul(j):
    j = re.sub(r'\s+', ' ', str(j)).strip().strip('.').strip()
    return j[:200]


def norm(s):
    return re.sub(r'[^a-z0-9 ]', ' ', str(s).lower()).split()


class BukuPdf:
    """Bungkus PdfReader dengan cache teks per halaman (tiap halaman diekstrak maksimal sekali)."""

    def __init__(self, reader):
        self.reader = reader
        self.total = len(reader.pages)
        self.cache = {}

    def teks(self, halaman_pdf):
        if halaman_pdf not in self.cache:
            try:
                self.cache[halaman_pdf] = self.reader.pages[halaman_pdf - 1].extract_text() or ''
            except Exception:
                self.cache[halaman_pdf] = ''
        return self.cache[halaman_pdf]

    def awal_norm(self, halaman_pdf, n=60):
        return ' '.join(norm(self.teks(halaman_pdf))[:n])


# ---------------- strategi 1: outline berpenanda bab ----------------
POLA_BAB = re.compile(r'^(bab|unit|chapter|bagian)\s+([0-9]+|[ivxIVX]+)\b[\s.:–—-]*', re.I)


def jalan_outline(reader, outline):
    hasil = []
    for entri in outline:
        if isinstance(entri, list):
            if hasil:
                hasil[-1]['anak'] = jalan_outline(reader, entri)
            continue
        try:
            halaman = reader.get_destination_page_number(entri) + 1
        except Exception:
            halaman = None
        judul = bersih_judul(getattr(entri, 'title', ''))
        if judul:
            hasil.append({'judul': judul, 'halaman': halaman, 'anak': []})
    return hasil


def bab_dari_outline(buku):
    try:
        atas = jalan_outline(buku.reader, buku.reader.outline)
    except Exception:
        atas = []
    atas = [a for a in atas if a['halaman'] and 1 <= a['halaman'] <= buku.total]
    bertanda = []
    for a in atas:
        m = POLA_BAB.match(a['judul'])
        if m:
            nomor = int(m.group(2)) if m.group(2).isdigit() else romawi_ke_int(m.group(2))
            bertanda.append({'nomor': nomor, 'judul': bersih_judul(a['judul'][m.end():]) or a['judul'],
                             'mulai': a['halaman'],
                             'subbab': [bersih_judul(re.sub(r'^[0-9]+(\.[0-9]+)*[.)]?\s+', '', c['judul'])) for c in a['anak']]})
    return bertanda if len(bertanda) >= 2 else []


# ---------------- strategi 2: daftar isi ----------------
POLA_BAB_TOC = re.compile(r'^(bab|unit|chapter|bagian)\s+([0-9]+|[ivxIVX]+)\s+(.+?)\s*(?:\.{2,}|…|\s{2,})\s*(\d{1,3})\s*$', re.I)
POLA_SUB_TOC = re.compile(r'^(?:[0-9]+\.[0-9]+|[A-Z])\.?\s+(.+?)\s*(?:\.{2,}|…|\s{2,})\s*(\d{1,3})\s*$')


def bab_dari_daftar_isi(buku):
    baris_toc = []
    for i in range(1, min(20, buku.total) + 1):
        teks = buku.teks(i)
        if 'daftar isi' in teks.lower():
            baris_toc.extend([b.strip() for b in teks.split('\n') if b.strip()])
    if not baris_toc:
        return []
    bab = []
    for baris in baris_toc:
        m = POLA_BAB_TOC.match(baris)
        if m:
            nomor = int(m.group(2)) if m.group(2).isdigit() else romawi_ke_int(m.group(2))
            bab.append({'nomor': nomor, 'judul': bersih_judul(m.group(3)), 'cetak': int(m.group(4)), 'subbab': []})
            continue
        if bab:
            ms = POLA_SUB_TOC.match(baris)
            if ms and not POLA_BAB_TOC.match(baris):
                judul_sub = bersih_judul(ms.group(1))
                if judul_sub and judul_sub.lower() != 'daftar isi':
                    bab[-1]['subbab'].append(judul_sub)
    bab = [b for b in bab if b['judul']]
    for b in bab:
        b['subbab'] = b['subbab'][:12]
    return bab if len(bab) >= 2 else []


def cari_pembuka(buku, judul, perkiraan, toleransi):
    kunci = ' '.join(norm(judul)[:3])
    if not kunci:
        return None
    for jarak in range(0, toleransi + 1):
        kandidat = [perkiraan] if jarak == 0 else [perkiraan - jarak, perkiraan + jarak]
        for cand in kandidat:
            if 1 <= cand <= buku.total and kunci in buku.awal_norm(cand):
                return cand
    return None


def bab_dari_toc_lengkap(buku):
    bab = bab_dari_daftar_isi(buku)
    if not bab:
        return []
    offset = None
    for b in bab:
        perkiraan = b['cetak'] + (offset if offset is not None else 6)
        ketemu = cari_pembuka(buku, b['judul'], perkiraan, 45 if offset is None else 5)
        if ketemu:
            offset = ketemu - b['cetak']
            b['mulai'] = ketemu
        else:
            b['mulai'] = min(max(b['cetak'] + (offset if offset is not None else 6), 1), buku.total)
    bab.sort(key=lambda b: b['mulai'])
    for i in range(1, len(bab)):
        if bab[i]['mulai'] <= bab[i - 1]['mulai']:
            bab[i]['mulai'] = bab[i - 1]['mulai'] + 1
    return bab


def ekstrak_bab(buku):
    bab = bab_dari_outline(buku)
    if bab:
        strategi = 'outline'
    else:
        bab = bab_dari_toc_lengkap(buku)
        strategi = 'daftar-isi' if bab else 'tidak-terindeks'
    bab = [b for b in bab if b.get('mulai')]
    bab.sort(key=lambda b: b['mulai'])
    for i, b in enumerate(bab):
        b['selesai'] = (bab[i + 1]['mulai'] - 1) if i + 1 < len(bab) else buku.total
        if b['selesai'] < b['mulai']:
            b['selesai'] = b['mulai']
        b['subbab'] = [s for s in b.get('subbab', []) if s][:12]
    return bab, strategi


def main():
    from pypdf import PdfReader

    buku = []
    offset = 0
    while True:
        batch = sb('GET', f'perpus_buku?select=id,path_pdf,halaman&aktif=eq.true&order=id&limit=500&offset={offset}')
        if not batch:
            break
        buku.extend(batch)
        if len(batch) < 500:
            break
        offset += 500
    if HANYA:
        buku = [b for b in buku if HANYA in b['id']]
    print(f'Total buku aktif: {len(buku)}', flush=True)

    ringkas = {'terindeks': 0, 'outline': 0, 'daftar-isi': 0, 'tidak-terindeks': 0, 'berkas-hilang': 0, 'gagal': 0, 'bukan-pdf': 0, 'total-bab': 0}
    for b in buku:
        path_pdf = (b.get('path_pdf') or '').strip()
        if not path_pdf.lower().endswith('.pdf'):
            ringkas['bukan-pdf'] += 1
            continue
        berkas = os.path.join(PERPUS_DIR, path_pdf)
        if not os.path.isfile(berkas):
            ringkas['berkas-hilang'] += 1
            print(f'  ! berkas hilang: {b["id"]}', flush=True)
            continue
        try:
            buku_pdf = BukuPdf(PdfReader(berkas))
            bab, strategi = ekstrak_bab(buku_pdf)
        except Exception as e:
            ringkas['gagal'] += 1
            print(f'  ! gagal parse {b["id"]}: {e}', flush=True)
            continue
        if not bab:
            ringkas['tidak-terindeks'] += 1
            print(f'  - belum terindeks: {b["id"]}', flush=True)
            continue
        ringkas['terindeks'] += 1
        ringkas[strategi] += 1
        ringkas['total-bab'] += len(bab)
        print(f'  + {b["id"]}: {len(bab)} bab ({strategi})', flush=True)
        if DRY:
            for x in bab[:4]:
                print(f'      Bab {x["nomor"]} — {x["judul"]} · hal {x["mulai"]}–{x["selesai"]} · subbab: {x["subbab"][:3]}', flush=True)
            continue
        sb('DELETE', 'perpus_bab?buku_id=eq.' + urllib.parse.quote(b['id'], safe=''))
        baris = [{'buku_id': b['id'], 'nomor': x['nomor'], 'judul': x['judul'],
                  'halaman_mulai': x['mulai'], 'halaman_selesai': x['selesai'], 'subbab': x['subbab']} for x in bab]
        sb('POST', 'perpus_bab', baris)

    print('RINGKASAN:', json.dumps(ringkas, indent=1), flush=True)


if __name__ == '__main__':
    main()
