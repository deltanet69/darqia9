<template>
  <div class="spmb-body" :class="{'modal-open': modalTrack}">
    <!-- ======= HEADER SPMB PORTAL ======= -->
    <header class="spmb-top" :class="{ scrolled: isScrolled }">
      <div class="spmb-wrap">
        <NuxtLink class="t-brand" to="/" aria-label="Kembali ke portal yayasan">
          <img src="/asset/logo.png" alt="Logo Yayasan Darqia Attaqwa">
          <span>
            <b>SPMB Terpadu</b>
            <small>Yayasan Darqia Attaqwa</small>
          </span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost btn-sm" @click="openTrackModal">Cek Status</button>
          <NuxtLink class="btn btn-pri btn-sm" to="/">Beranda</NuxtLink>
        </div>
      </div>
    </header>

    <!-- ======= HERO PORTAL SPMB ======= -->
    <section class="spmb-hero">
      <div class="grid"></div><div class="orb o1"></div><div class="orb o2"></div>
      <div class="spmb-wrap">
        <span class="hero-badge">Penerimaan Murid Baru • Tahun Ajaran 2027/2028</span>
        <h1>Penerimaan Murid Baru <span class="hl">2027/2028</span></h1>
        <p class="sub">
          Portal pendaftaran online resmi <b>SMP IT Bina Cendekia Assalam</b> &amp; <b>SMK IT Attaqwa 9</b> Babelan, Bekasi. Silakan pilih unit sekolah tujuan pendaftaran Anda di bawah ini.
        </p>
        <div class="hero-chips">
          <span class="hchip">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
            Biaya pendaftaran Rp300.000
          </span>
          <span class="hchip">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>
            Online 24 Jam
          </span>
          <span class="hchip">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
            Data Aman &amp; Terverifikasi
          </span>
        </div>
      </div>
    </section>

    <!-- ======= PILIHAN UNIT SEKOLAH (PORTAL CARD) ======= -->
    <section class="portal-sec">
      <div class="spmb-wrap">
        <div class="portal-head">
          <span class="p-tag">PILIH UNIT SEKOLAH</span>
          <h2>Dua Jenjang Pendidikan Unggulan</h2>
          <p>Pilih jenjang pendidikan yang sesuai untuk membuka formulir pendaftaran khusus masing-masing sekolah.</p>
        </div>

        <div class="school-cards-grid">
          <!-- KARTU SMP -->
          <div class="scard smp">
            <div class="scard-top">
              <div class="scard-icon">
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>
              </div>
              <span class="scard-badge">Jenjang SMP</span>
            </div>
            <h3>SMP IT Bina Cendekia Assalam</h3>
            <p class="scard-desc">
              Pendidikan Islam Terpadu tingkat menengah pertama dengan fokus penguatan karakter, tahfidz Qur'an, dan literasi digital sejak dini.
            </p>
            <ul class="scard-feats">
              <li>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Khusus Lulusan SD / MI
              </li>
              <li>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Program Tahsin &amp; Tahfidz Qur'an
              </li>
              <li>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Jalur Lanjut Prioritas ke SMK IT Attaqwa 9
              </li>
            </ul>
            <div class="scard-action">
              <NuxtLink to="/spmb/smp" class="btn btn-pri w-full">
                <span>Daftar SPMB SMP</span>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </NuxtLink>
            </div>
          </div>

          <!-- KARTU SMK -->
          <div class="scard smk">
            <div class="scard-top">
              <div class="scard-icon smk">
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
              </div>
              <span class="scard-badge smk">Jenjang SMK • Akreditasi A</span>
            </div>
            <h3>SMK IT Attaqwa 9</h3>
            <p class="scard-desc">
              Sekolah kejuruan teknologi informasi unggulan dengan 3 kompetensi keahlian siap kerja, kuliah, dan berwirausaha.
            </p>
            <ul class="scard-feats">
              <li>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Khusus Lulusan SMP / MTs
              </li>
              <li>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                3 Jurusan: TKJ, PPLG / RPL, dan DKV
              </li>
              <li>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Sertifikasi Industri &amp; Penyaluran Kerja
              </li>
            </ul>
            <div class="scard-action">
              <NuxtLink to="/spmb/smk" class="btn btn-pri w-full">
                <span>Daftar SPMB SMK</span>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======= SECTION CEK STATUS PORTAL ======= -->
    <section class="track-sec">
      <div class="spmb-wrap">
        <div class="track-box">
          <div class="track-content">
            <div class="t-icon">
              <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div>
              <h3>Sudah Melakukan Pendaftaran?</h3>
              <p>Lacak progres verifikasi pembayaran dan berkas SPMB SMP maupun SMK secara mandiri.</p>
            </div>
          </div>
          <button class="btn btn-pri" @click="openTrackModal">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span>Cek Status Pendaftaran</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ======= FOOTER ======= -->
    <footer class="spmb-foot">
      <div class="spmb-wrap">
        <span>&copy; 2026 Yayasan Darqia Attaqwa • SMP IT Bina Cendekia Assalam &amp; SMK IT Attaqwa 9 — Babelan, Kab. Bekasi</span>
        <span>Butuh bantuan? <a href="tel:02188886776">021-88886776</a></span>
      </div>
    </footer>

    <!-- ======= MODAL CEK STATUS ======= -->
    <div class="spmb-modal" v-if="modalTrack" role="dialog" aria-modal="true" aria-labelledby="mtTitle">
      <div class="m-scrim" @click="modalTrack = false"></div>
      <div class="m-card">
        <button class="m-x" @click="modalTrack = false" aria-label="Tutup">
          <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h2 id="mtTitle">Cek Status Pendaftaran</h2>
        <p class="m-sub">Masukkan ID pendaftaran SPMB Anda (SMP atau SMK) untuk melihat status verifikasi terkini.</p>
        <div class="fld" style="margin-bottom:14px">
          <label>ID Pendaftaran</label>
          <input v-model="trackQuery" @keydown.enter="doTrack" type="text" placeholder="cth: SPMB27-SMP-XXXXXX / SPMB27-SMK-XXXXXX" style="text-transform:uppercase">
        </div>
        <div class="m-actions" style="margin-bottom:6px">
          <button class="btn btn-pri" @click="doTrack">Lacak Sekarang</button>
        </div>
        <div class="notfound" v-if="trackNotFound">ID pendaftaran tidak ditemukan di perangkat ini. Pastikan ID sudah benar atau periksa pada perangkat saat mendaftar.</div>
        
        <div v-if="trackResult" style="margin-top:16px">
          <div class="reg-id" style="margin-bottom:16px">
            <small>ID Pendaftaran</small>
            <div class="rid">{{ trackResult.id }}</div>
          </div>
          <dl class="det-grid">
            <div><dt>Nama siswa</dt><dd>{{ trackResult.s_nama }}</dd></div>
            <div><dt>Jenjang</dt><dd>{{ trackResult.jenjang }}</dd></div>
            <div v-if="trackResult.jurusan"><dt>Jurusan</dt><dd class="font-bold text-blue-600">{{ trackResult.jurusan }}</dd></div>
            <div><dt>Sekolah asal</dt><dd>{{ trackResult.s_sekolah }}</dd></div>
            <div><dt>Status</dt><dd class="font-bold text-blue-600">{{ trackResult.status }}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpmbForm } from '~/composables/useSpmbForm'

definePageMeta({ layout: 'default' })

useHead({
  title: 'SPMB 2027/2028 — Penerimaan Murid Baru Yayasan Darqia Attaqwa',
  meta: [
    { name: 'description', content: 'Penerimaan Murid Baru SMP IT Bina Cendekia Assalam dan SMK IT Attaqwa 9 Tahun Ajaran 2027/2028.' }
  ]
})

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 40 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const {
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
} = useSpmbForm('smk')
</script>

<style scoped src="~/assets/css/spmb.css"></style>
<style scoped>
.portal-sec {
  padding: 40px 0 60px;
  position: relative;
  z-index: 10;
}
.portal-head {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 36px;
}
.p-tag {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #1B5FD9;
  background: #EFF6FF;
  padding: 6px 14px;
  border-radius: 999px;
  display: inline-block;
  margin-bottom: 12px;
}
.portal-head h2 {
  font-size: 28px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
}
.portal-head p {
  color: #64748B;
  font-size: 14.5px;
  line-height: 1.6;
}

.school-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .school-cards-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

.scard {
  background: #ffffff;
  border: 1.5px solid #E2E8F0;
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  transition: all 0.3s ease;
}
.scard:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(27, 95, 217, 0.12);
  border-color: #93C5FD;
}
.scard-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.scard-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #EFF6FF;
  color: #1D4ED8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scard-icon.smk {
  background: #EEF2FF;
  color: #4338CA;
}
.scard-icon .ai {
  width: 24px;
  height: 24px;
}
.scard-badge {
  font-size: 12px;
  font-weight: 700;
  color: #1D4ED8;
  background: #DBEAFE;
  padding: 5px 12px;
  border-radius: 999px;
}
.scard-badge.smk {
  color: #4338CA;
  background: #E0E7FF;
}

.scard h3 {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
}
.scard-desc {
  font-size: 13.5px;
  color: #64748B;
  line-height: 1.6;
  margin-bottom: 20px;
}
.scard-feats {
  list-style: none;
  padding: 0;
  margin: 0 0 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.scard-feats li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #334155;
  font-weight: 600;
}
.scard-feats li .ai {
  width: 16px;
  height: 16px;
  color: #10B981;
  flex-shrink: 0;
}
.scard-action .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  font-size: 14.5px;
  font-weight: 700;
  border-radius: 12px;
}

.track-sec {
  padding: 0 0 60px;
}
.track-box {
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(135deg, #0A2A5C 0%, #0F3D8A 100%);
  border-radius: 20px;
  padding: 26px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: #ffffff;
  box-shadow: 0 14px 34px rgba(10, 42, 92, 0.25);
}
@media (max-width: 640px) {
  .track-box {
    flex-direction: column;
    text-align: center;
    padding: 22px 18px;
  }
}
.track-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
@media (max-width: 640px) {
  .track-content {
    flex-direction: column;
  }
}
.t-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.t-icon .ai {
  width: 22px;
  height: 22px;
}
.track-content h3 {
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 3px;
}
.track-content p {
  font-size: 13px;
  opacity: 0.85;
  margin: 0;
}
</style>
