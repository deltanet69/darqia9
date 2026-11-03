<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import type { Buku } from '~/composables/perpusCore'
import PerpusLogin from '~/components/perpus/PerpusLogin.vue'
import PerpusBeranda from '~/components/perpus/PerpusBeranda.vue'
import PerpusKatalog from '~/components/perpus/PerpusKatalog.vue'
import PerpusRak from '~/components/perpus/PerpusRak.vue'
import PerpusDetail from '~/components/perpus/PerpusDetail.vue'
import PerpusProfil from '~/components/perpus/PerpusProfil.vue'
import PerpusReader from '~/components/perpus/PerpusReader.vue'

// Perpustakaan Digital — aplikasi siswa (port setia preview v8, dikunci
// pemilik 30 Okt 2026). Satu rute, tampilan berganti di tempat:
// Login NIS -> Beranda / Katalog / Rak Saya / Profil / Detail / Reader.
// Nanti dilayani di subdomain perpus.smkitattaqwa9.sch.id (routing host
// di lapisan Nginx); di dalam aplikasi rutenya /perpus.
definePageMeta({ layout: 'exam' })
useHead({ title: 'Perpus Digital — SMK IT Attaqwa 9' })

type Tampilan = 'login' | 'beranda' | 'katalog' | 'rak' | 'detail' | 'profil'
const P = usePerpus()
const tampilan = ref<Tampilan>('login')
const bukuPilih = ref<Buku | null>(null)
const reader = ref<{ buku: Buku, bab: number } | null>(null)
let asalTerakhir: Exclude<Tampilan, 'detail' | 'login'> = 'beranda'
let asalReader: 'detail' | 'lain' = 'lain'

const sesi = computed(() => P.state.value.sesi)

onMounted(async () => {
  await P.muatBuku()
  P.pulihkanSesi()
  if (P.state.value.sesi) tampilan.value = 'beranda'
})

watch(tampilan, () => { window.scrollTo(0, 0) })
watch(reader, r => { document.body.style.overflow = r ? 'hidden' : '' })

const pergi = (t: Exclude<Tampilan, 'detail' | 'login'>) => { tampilan.value = t; asalTerakhir = t }
const bukaDetail = (b: Buku) => {
  if (tampilan.value !== 'detail') asalTerakhir = tampilan.value as typeof asalTerakhir
  bukuPilih.value = b
  tampilan.value = 'detail'
}
const bukaReader = (b: Buku, bab: number) => {
  asalReader = tampilan.value === 'detail' ? 'detail' : 'lain'
  reader.value = { buku: b, bab }
}
const tutupReader = () => {
  reader.value = null
  if (asalReader === 'detail' && bukuPilih.value) {
    // segarkan objek buku dari state terbaru agar progres di detail mutakhir
    bukuPilih.value = P.state.value.buku.find(b => b.id === bukuPilih.value!.id) || bukuPilih.value
    tampilan.value = 'detail'
  }
}
const setelahMasuk = () => { tampilan.value = 'beranda'; asalTerakhir = 'beranda' }
const keluar = () => { P.keluar(); reader.value = null; bukuPilih.value = null; tampilan.value = 'login' }
</script>

<template>
  <div class="perpus-app">
    <div class="app">
      <div v-if="P.lokal.value" style="background:#FFFAEB;border-bottom:1px solid #FDE68A;color:#92400E;font-size:11.5px;font-weight:600;text-align:center;padding:7px 14px;line-height:1.5">
        Mode contoh lokal — migrasi 0028 belum dijalankan. Katalog &amp; akun di bawah adalah data contoh preview; NIS asli aktif begitu migrasi jalan.
      </div>
      <div v-else-if="P.state.value.keadaan === 'galat'" style="background:#FEF2F2;border-bottom:1px solid #FECACA;color:#B42318;font-size:11.5px;font-weight:600;text-align:center;padding:7px 14px;line-height:1.5">
        Katalog gagal dimuat. {{ P.pesanGalat.value }}
      </div>

      <PerpusLogin v-if="!sesi" @masuk="setelahMasuk" />
      <template v-else>
        <PerpusBeranda v-if="tampilan === 'beranda'" @detail="bukaDetail" @baca="bukaReader" @jelajahi="pergi('katalog')" />
        <PerpusKatalog v-else-if="tampilan === 'katalog'" @detail="bukaDetail" />
        <PerpusRak v-else-if="tampilan === 'rak'" @detail="bukaDetail" />
        <PerpusDetail v-else-if="tampilan === 'detail' && bukuPilih" :key="bukuPilih.id + '-' + (P.state.value.prog[bukuPilih.id] ?? -1)" :buku="bukuPilih" @kembali="pergi(asalTerakhir)" @baca="bukaReader" />
        <PerpusProfil v-else-if="tampilan === 'profil'" @jelajahi="pergi('katalog')" @rak="pergi('rak')" @keluar="keluar" />
      </template>

      <nav v-if="sesi && tampilan !== 'detail'" class="bnav on">
        <button :class="{ on: tampilan === 'beranda' }" @click="pergi('beranda')">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>Beranda
        </button>
        <button :class="{ on: tampilan === 'katalog' }" @click="pergi('katalog')">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.8-3.8" /></svg>Jelajahi
        </button>
        <button :class="{ on: tampilan === 'rak' }" @click="pergi('rak')">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" /><path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5" /></svg>Rak Saya
        </button>
        <button :class="{ on: tampilan === 'profil' }" @click="pergi('profil')">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-3.6 4.5-5 8-5s6.5 1.4 8 5" /></svg>Profil
        </button>
      </nav>

      <PerpusReader v-if="reader" :key="reader.buku.id" :buku="reader.buku" :bab-awal="reader.bab" @tutup="tutupReader" />
      <div class="toast" :class="{ on: !!P.toastTeks.value }">{{ P.toastTeks.value }}</div>
    </div>
  </div>
</template>

<style>
.perpus-app {
  --bg:#F2F7FE; --card:#FFFFFF; --ink:#13233F; --navy:#0B2C5F; --navy2:#16407F;
  --blue:#2563EB; --orange:#2563EB; --orange2:#1D4ED8; --mut:#7A8494; --line:#DFEAF6;
  --green:#16A34A; --red:#DC2626; --rad:22px;
  --sh:0 10px 30px rgba(19,35,63,.10); --sh-lg:0 22px 44px rgba(19,35,63,.20);
}
.perpus-app {font-family:"Inter","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;background:#D9E7F6;color:var(--ink)}
.perpus-app button {font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.perpus-app input {font-family:inherit}
.perpus-app .serif {font-family:"Inter","Segoe UI",system-ui,sans-serif}
.perpus-app .app {max-width:480px;margin:0 auto;background:var(--bg);min-height:100dvh;position:relative;box-shadow:0 0 50px rgba(19,35,63,.25);overflow-x:hidden}
.perpus-app .view {display:none;min-height:100dvh;flex-direction:column}
.perpus-app .view.on {display:flex}
@keyframes ppFadeUp {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.perpus-app .fadeup {animation:ppFadeUp .45s cubic-bezier(.22,.8,.32,1) both}
.perpus-app /* ===== COVER ART (tipografi ala sampul buku asli) ===== */
.cov {position:relative;border-radius:12px;overflow:hidden;color:#fff;flex-shrink:0;box-shadow:0 12px 24px rgba(19,35,63,.28);display:flex;flex-direction:column;padding:10px 11px;text-align:left}
.perpus-app .cov::before {content:"";position:absolute;width:130%;height:64%;border-radius:50%;background:rgba(255,255,255,.13);top:-26%;right:-38%}
.perpus-app .cov::after {content:"";position:absolute;width:70%;height:40%;border-radius:50%;border:22px solid rgba(255,255,255,.10);bottom:-16%;left:-22%}
.perpus-app .cov .cv-mapel {font-size:8.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;opacity:.85;position:relative;z-index:1}
.perpus-app .cov .cv-title {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-weight:700;line-height:1.14;position:relative;z-index:1;margin-top:5px}
.perpus-app .cov .cv-sub {font-size:9.5px;line-height:1.35;opacity:.92;position:relative;z-index:1;margin-top:4px}
.perpus-app .cov .cv-foot {margin-top:auto;position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:6px}
.perpus-app .cov .cv-auth {font-size:8.5px;line-height:1.3;opacity:.85}
.perpus-app .cov .cv-sibi {font-size:7.5px;font-weight:700;letter-spacing:1px;background:rgba(255,255,255,.22);padding:3px 6px;border-radius:5px}
.perpus-app .rate {position:absolute;left:8px;bottom:8px;z-index:2;background:#fff;color:var(--ink);font-size:10.5px;font-weight:700;padding:4px 8px;border-radius:999px;box-shadow:0 4px 10px rgba(0,0,0,.18);display:flex;gap:3px;align-items:center}
.perpus-app .rate i {color:var(--orange);font-style:normal}
.perpus-app /* ===== LOGIN ===== */
.v-login {background:linear-gradient(180deg,#F8FBFF,var(--bg));padding:0 22px 30px}
.perpus-app .lg-brand {display:flex;align-items:center;gap:9px;padding-top:26px}
.perpus-app .lg-brand .shield {width:34px;height:40px;background:var(--navy);border-radius:7px 7px 12px 12px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}
.perpus-app .lg-brand b {font-size:15px;letter-spacing:.2px}
.perpus-app .lg-brand span {display:block;font-size:10.5px;color:var(--mut);font-weight:600}
.perpus-app .lg-head {margin-top:26px}
.perpus-app .lg-head h1 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:32px;line-height:1.18;font-weight:700;letter-spacing:-.4px}
.perpus-app .lg-head h1 em {color:var(--blue);font-style:normal}
.perpus-app .lg-head p {font-size:13.5px;color:var(--mut);line-height:1.6;margin-top:10px}
.perpus-app .collage {display:flex;justify-content:center;gap:12px;margin:28px 0 6px}
.perpus-app .collage .cov {width:104px;height:146px;transition:transform .3s}
.perpus-app .collage .cov:nth-child(1) {transform:rotate(-7deg) translateY(10px)}
.perpus-app .collage .cov:nth-child(2) {transform:translateY(-4px);z-index:2}
.perpus-app .collage .cov:nth-child(3) {transform:rotate(7deg) translateY(10px)}
.perpus-app .collage .cv-title {font-size:12px}
.perpus-app .rail-item .cv-title {font-size:16.5px}
.perpus-app .collage .cv-mapel {font-size:7.5px;letter-spacing:1.1px}
.perpus-app .collage .cv-sub {font-size:8.5px}
.perpus-app .cov-mini .cv-mono {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:29px;font-weight:700;line-height:1;position:relative;z-index:1}
.perpus-app .cov-mini .cv-full {font-size:8.5px;line-height:1.45;opacity:.95;position:relative;z-index:1;margin-top:5px}
.perpus-app .cov .cv-auth, .perpus-app .cov .cv-title, .perpus-app .cov .cv-sub {text-shadow:0 1px 8px rgba(0,0,0,.30)}
.perpus-app .cont-card .cv-title {font-size:15px}
.perpus-app .cont-card .cv-mapel {font-size:7.5px;letter-spacing:1.1px}
.perpus-app .cont-card .cv-sub {font-size:8.5px}
.perpus-app .banner .cv-title {font-size:13.5px}
.perpus-app .banner .cv-mapel {font-size:7.5px;letter-spacing:1px}
.perpus-app .banner .cv-sub {font-size:8.5px}
.perpus-app .prow .pct, .perpus-app .prow .go {white-space:nowrap}
.perpus-app .prow {gap:8px}
.perpus-app .prow .go {font-size:12px}
.perpus-app .lg-domain {text-align:center;font-size:12px;font-weight:700;color:var(--navy);margin-top:14px}
.perpus-app .lg-domain span {background:#E7EEFB;border:1px solid #CFE0F7;padding:6px 13px;border-radius:999px;display:inline-block}
.perpus-app .lg-card {background:#fff;border-radius:26px;box-shadow:var(--sh-lg);padding:22px 20px;margin-top:20px}
.perpus-app .lg-card h2 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:21px}
.perpus-app .lg-card>p {font-size:12.5px;color:var(--mut);line-height:1.6;margin:7px 0 15px}
.perpus-app .lg-card label {font-size:11px;font-weight:700;letter-spacing:1.1px;color:var(--mut);display:block;margin-bottom:7px}
.perpus-app .lg-in {display:flex;align-items:center;background:#EEF4FC;border:2px solid transparent;border-radius:15px;padding:0 15px;transition:border .2s}
.perpus-app .lg-in:focus-within {border-color:var(--blue);background:#fff}
.perpus-app .lg-in input {flex:1;min-width:0;border:none;outline:none;background:none;font-size:19px;font-weight:700;letter-spacing:3px;padding:14px 0;color:var(--ink)}
.perpus-app .lg-err {display:none;background:#FEF2F2;border:1px solid #FECACA;color:var(--red);font-size:12.5px;font-weight:600;border-radius:12px;padding:11px 13px;margin-top:13px;line-height:1.55}
.perpus-app .btn-navy {background:var(--navy);color:#fff;font-weight:700;font-size:15px;border-radius:15px;padding:15px;width:100%;margin-top:15px;box-shadow:0 12px 22px rgba(11,44,95,.28);transition:transform .15s,background .2s}
.perpus-app .btn-navy:active {transform:scale(.98);background:var(--navy2)}
.perpus-app .lg-note {font-size:11.5px;color:var(--mut);text-align:center;line-height:1.6;margin-top:12px}
.perpus-app .demo-acc {margin-top:16px}
.perpus-app .demo-acc>p {font-size:10.5px;font-weight:700;letter-spacing:1.4px;color:var(--mut);margin-bottom:9px}
.perpus-app .acc-row {display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:11px 13px;margin-bottom:9px;transition:all .2s}
.perpus-app .acc-row.sel {border-color:var(--blue);box-shadow:0 8px 18px rgba(37,99,235,.16)}
.perpus-app .acc-av {width:38px;height:38px;border-radius:50%;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.perpus-app .acc-row b {font-size:13.5px;display:block}
.perpus-app .acc-row span {font-size:11.5px;color:var(--mut)}
.perpus-app .acc-row .nis {margin-left:auto;font-size:11px;font-weight:700;color:var(--navy);background:var(--bg);padding:5px 9px;border-radius:8px;flex-shrink:0}
.perpus-app /* ===== LOGIN ===== */
.v-login {background:linear-gradient(180deg,#F8FBFF,var(--bg));padding:40px 22px 34px}
.perpus-app .lg-head {max-width:330px;margin:0 auto;text-align:center}
.perpus-app .lg-head h1 {font-size:34px;line-height:1.14;font-weight:700;letter-spacing:-.5px}
.perpus-app .lg-head h1 em {color:var(--blue);font-style:normal}
.perpus-app .lg-head p {font-size:14px;line-height:1.6;color:var(--mut);margin:11px auto 0;max-width:305px}
.perpus-app .lg-illustration {width:min(334px,94vw);margin:26px auto 24px}
.perpus-app .lg-illustration svg {display:block;width:100%;height:auto}
.perpus-app .lg-card {background:#fff;border-radius:24px;box-shadow:var(--sh-lg);padding:21px 20px 20px}
.perpus-app .lg-card label {font-size:11px;font-weight:700;letter-spacing:1.1px;color:var(--mut);display:block;margin-bottom:8px}
.perpus-app .lg-in {display:flex;align-items:center;background:#EEF4FC;border:2px solid transparent;border-radius:15px;padding:0 15px;transition:border .2s,background .2s}
.perpus-app .lg-in:focus-within {border-color:var(--blue);background:#fff}
.perpus-app .lg-in input {flex:1;min-width:0;border:none;outline:none;background:none;font-size:17px;font-weight:600;letter-spacing:2px;padding:14px 0;color:var(--ink)}
.perpus-app .lg-in input::placeholder {letter-spacing:.2px;color:#94A3B8;font-weight:500}
.perpus-app .lg-err {display:none;background:#FEF2F2;border:1px solid #FECACA;color:var(--red);font-size:12.5px;font-weight:600;border-radius:12px;padding:11px 13px;margin-top:13px;line-height:1.55}
.perpus-app .btn-navy {background:var(--navy);color:#fff;font-weight:700;font-size:15px;border-radius:15px;padding:15px;width:100%;margin-top:14px;box-shadow:0 12px 22px rgba(11,44,95,.28);transition:transform .15s,background .2s}
.perpus-app .btn-navy:active {transform:scale(.98);background:var(--navy2)}
.perpus-app /* ===== LOGIN v8: headline interaktif ===== */
.lg-badge {display:inline-flex;align-items:center;gap:7px;background:#E7EEFB;border:1px solid #CFE0F7;color:var(--navy);font-size:10.5px;font-weight:700;letter-spacing:1.4px;padding:7px 13px;border-radius:999px;margin-bottom:15px}
.perpus-app .lg-badge i {width:7px;height:7px;border-radius:50%;background:var(--blue);animation:ppPulse 1.6s ease-out infinite}
@keyframes ppPulse {0%{box-shadow:0 0 0 0 rgba(37,99,235,.45)}70%{box-shadow:0 0 0 7px rgba(37,99,235,0)}100%{box-shadow:0 0 0 0 rgba(37,99,235,0)}}
.perpus-app .lg-head {cursor:pointer}
.perpus-app .lg-head h1 {font-size:39px;line-height:1.12}
.perpus-app .grad-text {background:linear-gradient(90deg,#1D4ED8,#38BDF8,#2563EB,#1D4ED8);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ppShine 4.5s linear infinite}
@keyframes ppShine {to{background-position:220% 0}}
.perpus-app .lg-rot {display:inline-block;color:var(--blue);font-weight:700;transition:opacity .18s ease,transform .18s ease}
.perpus-app .lg-rot.out {opacity:0;transform:translateY(6px)}
.perpus-app .lg-illustration {transition:transform .35s ease}
.perpus-app .lg-illustration svg {animation:ppFloat 5s ease-in-out infinite}
@keyframes ppFloat {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.perpus-app .fade-up {animation:ppFadeUp .55s ease both}
.perpus-app .fade-in {animation:ppFadeIn .6s ease both .1s}
.perpus-app .d2 {animation-delay:.22s}
.perpus-app .d3 {animation-delay:.34s}
@keyframes ppFadeUp {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ppFadeIn {from{opacity:0}to{opacity:1}}
.perpus-app .btn-navy {position:relative;overflow:hidden}
.perpus-app .btn-navy::after {content:"";position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);animation:ppBtnShine 2.8s ease-in-out infinite}
@keyframes ppBtnShine {0%,55%{left:-70%}85%,100%{left:130%}}
.perpus-app /* ===== TOP BAR ===== */
.topbar {display:flex;align-items:center;gap:11px;padding:20px 20px 4px}
.perpus-app .topbar .avatar {width:44px;height:44px;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 6px 14px rgba(11,44,95,.3)}
.perpus-app .topbar small {font-size:11.5px;color:var(--mut);display:block}
.perpus-app .topbar b {font-size:15.5px}
.perpus-app .icon-btn {margin-left:auto;width:42px;height:42px;border-radius:50%;background:#fff;box-shadow:var(--sh);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
.perpus-app .icon-btn .dot {position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--orange2);border:2px solid #fff}
.perpus-app .page-head {padding:16px 20px 0}
.perpus-app .page-head h2 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:26px}
.perpus-app .page-head p {font-size:12.5px;color:var(--mut);margin-top:4px}
.perpus-app .main {padding:16px 20px 104px;flex:1}
.perpus-app .searchbar {background:#fff;border-radius:999px;box-shadow:var(--sh);display:flex;align-items:center;gap:9px;padding:0 17px}
.perpus-app .searchbar input {flex:1;min-width:0;border:none;outline:none;font-size:14px;padding:14px 0;background:none;color:var(--ink)}
.perpus-app /* ===== BANNER ===== */
.banner {margin-top:18px;background:linear-gradient(120deg,var(--navy) 30%,#1D4ED8 105%);border-radius:26px;color:#fff;padding:22px;position:relative;overflow:hidden;box-shadow:var(--sh-lg)}
.perpus-app .banner::before {content:"";position:absolute;width:250px;height:250px;border-radius:50%;background:rgba(255,255,255,.10);top:-110px;right:-60px}
.perpus-app .banner::after {content:"";position:absolute;width:150px;height:150px;border-radius:50%;border:26px solid rgba(255,255,255,.09);bottom:-70px;left:36%}
.perpus-app .banner .b-kick {font-size:10px;font-weight:700;letter-spacing:2px;color:#BFD9FF;position:relative;z-index:1}
.perpus-app .banner h3 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:21px;line-height:1.25;margin-top:8px;max-width:198px;position:relative;z-index:1}
.perpus-app .banner p {font-size:12px;color:#C7D7F5;line-height:1.55;margin-top:7px;max-width:192px;position:relative;z-index:1}
.perpus-app .banner .b-cta {display:inline-block;margin-top:14px;background:#fff;color:var(--navy);font-size:12px;font-weight:700;padding:9px 15px;border-radius:999px;position:relative;z-index:1}
.perpus-app .banner .cov {position:absolute;right:18px;top:50%;transform:translateY(-50%) rotate(6deg);width:86px;height:122px;z-index:1}
.perpus-app .banner .dots {position:relative;z-index:1;margin-top:16px;display:flex;gap:5px}
.perpus-app .banner .dots i {width:16px;height:5px;border-radius:99px;background:#fff}
.perpus-app .banner .dots i+i {width:5px;background:rgba(255,255,255,.4)}
.perpus-app /* ===== SECTION ===== */
.sec {margin-top:26px}
.perpus-app .sec-head {display:flex;align-items:baseline;margin-bottom:13px}
.perpus-app .sec-head h4 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:19.5px;font-weight:700}
.perpus-app .sec-head span {font-size:11.5px;color:var(--mut);margin-left:8px}
.perpus-app .sec-head button {margin-left:auto;font-size:12.5px;font-weight:700;color:var(--blue)}
.perpus-app .tabs {display:flex;gap:20px;overflow-x:auto;padding:4px 2px 8px;scrollbar-width:none;margin-top:14px}
.perpus-app .tabs::-webkit-scrollbar {display:none}
.perpus-app .tab {flex-shrink:0;font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:16.5px;font-weight:700;color:#A7AEBC;position:relative;padding-bottom:6px;transition:color .2s}
.perpus-app .tab.on {color:var(--ink)}
.perpus-app .tab.on::after {content:"";position:absolute;left:50%;transform:translateX(-50%);bottom:-2px;width:5px;height:5px;border-radius:50%;background:var(--orange)}
.perpus-app /* Continue reading */
.cont-card {background:#fff;border-radius:24px;box-shadow:var(--sh);padding:15px;display:flex;gap:14px;cursor:pointer;transition:transform .2s}
.perpus-app .cont-card:active {transform:scale(.985)}
.perpus-app .cont-card .cov {width:76px;height:108px}
.perpus-app .cont-info {flex:1;min-width:0;display:flex;flex-direction:column}
.perpus-app .cont-info .k {font-size:9.5px;font-weight:700;letter-spacing:1.4px;color:var(--orange2)}
.perpus-app .cont-info b {font-size:14.5px;line-height:1.35;margin-top:4px}
.perpus-app .cont-info>span {font-size:12px;color:var(--mut);margin-top:3px;line-height:1.45}
.perpus-app .pbar {height:6px;background:#E1ECFA;border-radius:99px;margin-top:auto;overflow:hidden}
.perpus-app .pbar i {display:block;height:100%;background:linear-gradient(90deg,var(--orange),var(--orange2));border-radius:99px;animation:ppGrow 1s .2s both}
@keyframes ppGrow {from{width:0}}
.perpus-app .prow {display:flex;align-items:center;margin-top:7px}
.perpus-app .prow .pct {font-size:11.5px;font-weight:700;color:var(--ink)}
.perpus-app .prow .go {margin-left:auto;font-size:12.5px;font-weight:700;color:var(--blue)}
.perpus-app /* Rail buku */
.rail {display:flex;gap:15px;overflow-x:auto;padding:6px 2px 14px;scroll-snap-type:x mandatory;scrollbar-width:none;margin:0 -20px;padding-left:20px;padding-right:20px}
.perpus-app .rail::-webkit-scrollbar {display:none}
.perpus-app .rail-item {width:128px;flex-shrink:0;scroll-snap-align:start;cursor:pointer;transition:transform .2s}
.perpus-app .rail-item:active {transform:scale(.97)}
.perpus-app .rail-item .covw {position:relative}
.perpus-app .rail-item .cov {width:128px;height:180px;border-radius:14px}
.perpus-app .rail-item b {display:block;font-size:13px;line-height:1.35;margin-top:9px}
.perpus-app .rail-item span {display:block;font-size:11px;color:var(--mut);margin-top:2px}
.perpus-app /* Grid koleksi */
.grid {display:grid;grid-template-columns:1fr 1fr;gap:16px 14px}
.perpus-app .g-item {cursor:pointer;transition:transform .2s}
.perpus-app .g-item:active {transform:scale(.98)}
.perpus-app .g-item .cov {width:100%;height:172px;border-radius:14px}
.perpus-app .g-item b {display:block;font-size:13.5px;line-height:1.35;margin-top:9px}
.perpus-app .g-item span {display:block;font-size:11px;color:var(--mut);margin-top:2px}
.perpus-app .stars {color:var(--orange);font-size:11px;letter-spacing:1px;margin-top:4px}
.perpus-app .stars em {font-style:normal;color:var(--mut);letter-spacing:0;font-weight:700;margin-left:4px}
.perpus-app /* Literasi */
.lit {display:flex;gap:13px;background:#fff;border-radius:20px;box-shadow:var(--sh);padding:13px;align-items:center;margin-bottom:11px}
.perpus-app .lit .cov {width:52px;height:74px}
.perpus-app .btn-ipus {flex-shrink:0;background:var(--navy);color:#fff;font-size:11.5px;font-weight:700;padding:10px 12px;border-radius:12px;line-height:1.35;text-align:center}
.perpus-app .tag {display:inline-block;font-size:9.5px;font-weight:700;letter-spacing:.8px;padding:4px 8px;border-radius:6px;background:#E7EEFB;color:var(--navy)}
.perpus-app .sec-note {font-size:11.5px;color:var(--mut);line-height:1.6;margin-top:10px}
.perpus-app .empty {background:#fff;border-radius:20px;padding:26px 18px;text-align:center;color:var(--mut);font-size:13px;line-height:1.65;box-shadow:var(--sh)}
.perpus-app .chips {display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}
.perpus-app .chip {font-size:12px;font-weight:700;padding:9px 14px;border-radius:999px;background:#fff;border:1.5px solid var(--line);color:var(--mut);transition:all .2s}
.perpus-app .chip.on {background:var(--navy);border-color:var(--navy);color:#fff}
.perpus-app /* ===== DETAIL ===== */
.det-wrap {flex:1;display:flex;flex-direction:column}
.perpus-app .det-hero {position:relative;padding:56px 20px 26px;text-align:center;overflow:hidden}
.perpus-app .det-hero .bgword {position:absolute;inset:auto 0 30px;font-family:"Inter","Segoe UI",system-ui,sans-serif;font-weight:700;font-size:64px;color:rgba(255,255,255,.20);white-space:nowrap;line-height:1;pointer-events:none}
.perpus-app .det-hero .cov {width:168px;height:238px;margin:0 auto;border-radius:16px;box-shadow:0 30px 50px rgba(0,0,0,.4)}
.perpus-app .det-top {position:absolute;top:16px;left:16px;right:16px;display:flex;justify-content:space-between;z-index:3}
.perpus-app .glass {width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:var(--sh);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--ink)}
.perpus-app .glass.marked {background:var(--orange);color:#fff}
.perpus-app .det-body {padding:4px 20px 118px;margin-top:-4px}
.perpus-app .det-body h2 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:23px;text-align:center;line-height:1.3}
.perpus-app .det-body .auth {text-align:center;font-size:12.5px;color:var(--mut);margin-top:6px}
.perpus-app .stat-row {display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:18px}
.perpus-app .stat-box {background:#fff;border-radius:16px;box-shadow:var(--sh);padding:12px 6px;text-align:center}
.perpus-app .stat-box small {display:block;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--mut)}
.perpus-app .stat-box b {display:block;font-size:15px;margin-top:5px}
.perpus-app .chap-card {background:#fff;border-radius:18px;box-shadow:var(--sh);padding:15px 16px;margin-top:14px}
.perpus-app .chap-card .t {display:flex;justify-content:space-between;font-size:12px;color:var(--mut);font-weight:700}
.perpus-app .chap-card .t b {color:var(--ink)}
.perpus-app .chap-card .pbar {margin-top:10px}
.perpus-app .det-body h5 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:18px;margin:22px 0 8px}
.perpus-app .det-body .desc {font-size:13.5px;line-height:1.75;color:#3D4A61}
.perpus-app .bab-item {display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border-radius:15px;box-shadow:var(--sh);padding:13px 14px;margin-bottom:9px;font-size:13.5px}
.perpus-app .bab-no {width:30px;height:30px;border-radius:50%;background:#E7EEFB;color:var(--navy);font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.perpus-app .bab-item.done .bab-no {background:var(--green);color:#fff}
.perpus-app .bab-item b {font-weight:600;line-height:1.4}
.perpus-app .det-cta {position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;display:flex;gap:11px;padding:13px 20px calc(15px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(242,247,254,0),var(--bg) 32%);z-index:20}
.perpus-app .det-cta .mark {width:52px;height:52px;border-radius:15px;background:#fff;box-shadow:var(--sh);font-size:19px;flex-shrink:0}
.perpus-app .det-cta .mark.on {background:var(--orange);color:#fff}
.perpus-app .det-cta .read {flex:1;background:var(--navy);color:#fff;font-size:15px;font-weight:700;border-radius:15px;box-shadow:0 14px 26px rgba(11,44,95,.3)}
.perpus-app /* ===== RAK & PROFIL ===== */
.rak-row {display:flex;gap:13px;background:#fff;border-radius:20px;box-shadow:var(--sh);padding:13px;margin-bottom:11px;align-items:center;cursor:pointer}
.perpus-app .rak-row .cov {width:54px;height:78px}
.perpus-app .prof-top {text-align:center;padding-top:10px}
.perpus-app .prof-top .avatar {width:86px;height:86px;border-radius:50%;background:var(--navy);color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 0 0 6px #fff,0 14px 28px rgba(11,44,95,.3)}
.perpus-app .prof-top h3 {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:23px;margin-top:14px}
.perpus-app .prof-top p {font-size:12.5px;color:var(--mut);margin-top:5px;line-height:1.6}
.perpus-app .prof-stats {display:flex;justify-content:center;gap:34px;margin-top:20px;background:#fff;border-radius:20px;box-shadow:var(--sh);padding:17px 10px}
.perpus-app .prof-stats div {text-align:center}
.perpus-app .prof-stats b {font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:21px;display:block}
.perpus-app .prof-stats span {font-size:10.5px;color:var(--mut);font-weight:700}
.perpus-app .menu-card {background:#fff;border-radius:20px;box-shadow:var(--sh);margin-top:16px;overflow:hidden}
.perpus-app .menu-card button {display:flex;width:100%;align-items:center;gap:12px;padding:16px;font-size:14px;font-weight:600;text-align:left}
.perpus-app .menu-card button+button {border-top:1px solid #E7EFF9}
.perpus-app .menu-card .arr {margin-left:auto;color:var(--mut)}
.perpus-app /* ===== BOTTOM NAV ===== */
.bnav {position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);display:none;z-index:30;padding-bottom:env(safe-area-inset-bottom)}
.perpus-app .bnav.on {display:flex}
.perpus-app .bnav button {flex:1;padding:9px 4px 11px;font-size:10.5px;font-weight:700;color:#A7AEBC;display:flex;flex-direction:column;align-items:center;gap:4px;transition:color .2s}
.perpus-app .bnav button.on {color:var(--navy)}
.perpus-app .bnav button.on svg {stroke:var(--navy)}
.perpus-app /* ===== READER ===== */
.reader {position:fixed;inset:0;z-index:50;display:none;flex-direction:column;background:#FFFEFA;max-width:480px;margin:0 auto}
.perpus-app .reader.on {display:flex}
.perpus-app .reader.theme-sepia {background:#F7ECD7}
.perpus-app .reader.theme-dark {background:#17191F;color:#E5E7EB}
.perpus-app .r-top {display:flex;align-items:center;gap:8px;padding:13px 15px}
.perpus-app .r-top .ttl {flex:1;text-align:center;font-size:12px;font-weight:700;letter-spacing:.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.perpus-app .r-tool {width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.05);font-size:14px;font-weight:700;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:inherit}
.perpus-app .reader.theme-dark .r-tool {background:rgba(255,255,255,.1)}
.perpus-app .r-tools {display:flex;gap:8px;justify-content:center;padding:2px 0 10px}
.perpus-app .r-tools button {font-size:11.5px;font-weight:700;padding:7px 13px;border-radius:999px;background:rgba(0,0,0,.05);color:inherit}
.perpus-app .reader.theme-dark .r-tools button {background:rgba(255,255,255,.1)}
.perpus-app .r-prog {height:4px;background:rgba(0,0,0,.07)}
.perpus-app .r-prog i {display:block;height:100%;background:var(--orange);transition:width .3s}
.perpus-app .r-body {flex:1;overflow-y:auto;padding:16px 24px 26px;font-family:"Inter","Segoe UI",system-ui,sans-serif;font-size:17px;line-height:1.9}
.perpus-app .r-body .kick {font-family:"Inter",system-ui,sans-serif;font-size:10.5px;font-weight:700;letter-spacing:2px;color:var(--orange2);text-transform:uppercase}
.perpus-app .r-body h3 {font-size:21px;line-height:1.3;margin:8px 0 16px;font-weight:700}
.perpus-app .r-body p {margin-bottom:14px}
.perpus-app .r-body h4 {font-size:1.05em;margin:20px 0 8px}
.perpus-app .r-body ul, .perpus-app .r-body ol {margin:0 0 14px 20px}
.perpus-app .r-body li {margin-bottom:6px}
.perpus-app .r-body .rum {font-weight:700;background:rgba(37,99,235,.10);padding:1px 6px;border-radius:5px}
.perpus-app .box-c {background:rgba(37,99,235,.08);border-left:4px solid var(--blue);border-radius:0 12px 12px 0;padding:13px 15px;margin:0 0 14px;font-size:.93em;font-family:"Inter",system-ui,sans-serif;line-height:1.65}
.perpus-app .box-w {background:rgba(37,99,235,.07);border-left:4px solid #93C5FD;border-radius:0 12px 12px 0;padding:13px 15px;margin:0 0 14px;font-size:.93em;font-family:"Inter",system-ui,sans-serif;line-height:1.65}
.perpus-app .r-bot {display:flex;align-items:center;padding:12px 18px calc(14px + env(safe-area-inset-bottom));border-top:1px solid rgba(0,0,0,.07)}
.perpus-app .r-bot .pg {flex:1;text-align:center;font-size:12px;font-weight:700;opacity:.75}
.perpus-app .r-next {width:50px;height:50px;border-radius:50%;background:var(--navy);color:#fff;font-size:19px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px rgba(11,44,95,.3);flex-shrink:0}
.perpus-app .r-prev {width:50px;height:50px;border-radius:50%;background:rgba(0,0,0,.05);font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:inherit}
.perpus-app b, .perpus-app strong {font-weight:600}
.perpus-app .tag-ip {background:#DBEAFE;color:var(--blue2);font-size:10px;font-weight:700;padding:3px 9px;border-radius:999px;display:inline-block;margin-top:6px;letter-spacing:.4px}
.perpus-app .lit .cov {width:52px;height:74px;flex-shrink:0;justify-content:center}
.perpus-app .lit .cv-mapel, .perpus-app .lit .cv-full {display:none}
.perpus-app .lit .li p {display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.perpus-app .toast {position:fixed;left:50%;bottom:100px;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#fff;font-size:13px;font-weight:600;padding:12px 19px;border-radius:999px;opacity:0;pointer-events:none;transition:all .25s;z-index:60;max-width:88%;text-align:center;box-shadow:var(--sh-lg)}
.perpus-app .toast.on {opacity:1;transform:translateX(-50%) translateY(0)}</style>
