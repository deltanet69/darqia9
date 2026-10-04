<template>
  <div class="spmb-body" :class="{'modal-open': modalSuccess || modalTrack}">
    <!-- ======= HEADER SPMB SMP ======= -->
    <header class="spmb-top" :class="{ scrolled: isScrolled }">
      <div class="spmb-wrap">
        <NuxtLink class="t-brand" to="/spmb" aria-label="Kembali ke portal SPMB">
          <img src="/asset/logo.png" alt="Logo SMP IT BCA">
          <span>
            <b>SPMB Online</b>
            <small>SMP IT Bina Cendekia Assalam</small>
          </span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost btn-sm" @click="openTrackModal">Cek Status</button>
          <NuxtLink class="btn btn-pri btn-sm" to="/">Beranda</NuxtLink>
        </div>
      </div>
    </header>

    <!-- ======= HERO SPMB SMP ======= -->
    <section class="spmb-hero">
      <div class="grid"></div><div class="orb o1"></div><div class="orb o2"></div>
      <div class="spmb-wrap">
        <span class="hero-badge">Jenjang SMP • Tahun Ajaran 2027/2028</span>
        <h1>SPMB <span class="hl">SMP IT Bina Cendekia</span></h1>
        <p class="sub">
          Formulir pendaftaran murid baru online resmi <b>SMP IT Bina Cendekia Assalam</b> — isi formulir dengan teliti, tuntaskan pembayaran, dan simpan ID pendaftaranmu.
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

    <!-- ======= WIZARD SPMB SMP ======= -->
    <section class="wizard-sec">
      <div class="spmb-wrap">
        <div class="wiz" ref="wizEl">
          <!-- Step Indicator -->
          <ol class="steps">
            <li :class="{ on: step === 1, done: step > 1 }">
              <span class="st-n">
                <svg v-if="step > 1" class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                <template v-else>1</template>
              </span>
              <span class="st-t">Data Siswa</span>
            </li>
            <li :class="{ on: step === 2, done: step > 2 }">
              <span class="st-n">
                <svg v-if="step > 2" class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                <template v-else>2</template>
              </span>
              <span class="st-t">Data Orang Tua</span>
            </li>
            <li :class="{ on: step === 3, done: step > 3 }">
              <span class="st-n">
                <svg v-if="step > 3" class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                <template v-else>3</template>
              </span>
              <span class="st-t">Pembayaran</span>
            </li>
          </ol>

          <!-- Banner Keterangan Unit Sekolah -->
          <div class="unit-banner smp">
            <div class="unit-badge">
              <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>
              <span>Unit: <b>SMP IT Bina Cendekia Assalam</b> (Lulusan SD / MI)</span>
            </div>
          </div>

          <form @submit.prevent novalidate>
            <!-- STEP 1: DATA SISWA -->
            <fieldset class="fstep" :class="{ on: step === 1 }">
              <h2>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                Informasi Siswa Calon SMP
              </h2>
              <p class="fdesc">Lengkapi data calon murid sesuai dokumen resmi (rapor SD/MI / Kartu Keluarga).</p>
              <div class="f-grid">
                <div class="fld full" :class="{err: errs.s_nama}">
                  <label>Nama lengkap siswa <i>*</i></label>
                  <input v-model="form.s_nama" @input="clearErr('s_nama')" type="text" placeholder="cth: Ahmad Fauzi Ramadhan" autocomplete="name">
                  <span class="f-msg">Nama lengkap wajib diisi.</span>
                </div>
                <div class="fld" :class="{err: errs.s_nisn}">
                  <label>NISN (Nomor Induk Siswa Nasional) <i>*</i></label>
                  <input v-model="form.s_nisn" @input="clearErr('s_nisn'); numericOnly('s_nisn')" type="text" inputmode="numeric" maxlength="10" placeholder="10 digit NISN">
                  <span class="f-msg">NISN harus 10 digit angka.</span>
                </div>
                <div class="fld" :class="{err: errs.s_jk}">
                  <label>Jenis kelamin <i>*</i></label>
                  <div class="pills">
                    <label class="pill"><input type="radio" v-model="form.s_jk" value="Laki-laki" @change="clearErr('s_jk')"><span>Laki-laki</span></label>
                    <label class="pill"><input type="radio" v-model="form.s_jk" value="Perempuan" @change="clearErr('s_jk')"><span>Perempuan</span></label>
                  </div>
                  <span class="f-msg">Pilih jenis kelamin.</span>
                </div>
                <div class="fld" :class="{err: errs.s_tempat}">
                  <label>Tempat lahir <i>*</i></label>
                  <input v-model="form.s_tempat" @input="clearErr('s_tempat')" type="text" placeholder="cth: Bekasi">
                  <span class="f-msg">Tempat lahir wajib diisi.</span>
                </div>
                <div class="fld" :class="{err: errs.s_tgl}">
                  <label>Tanggal lahir <i>*</i></label>
                  <input v-model="form.s_tgl" @input="clearErr('s_tgl')" type="date">
                  <span class="f-msg">Tanggal lahir wajib diisi.</span>
                </div>
                <div class="fld" :class="{err: errs.s_hp}">
                  <label>No. handphone siswa / WhatsApp</label>
                  <input v-model="form.s_hp" @input="clearErr('s_hp'); phoneOnly('s_hp')" type="tel" inputmode="tel" placeholder="cth: 0812xxxxxxx">
                  <span class="f-msg">Format nomor tidak valid.</span>
                  <p class="f-hint">Opsional — boleh dikosongkan.</p>
                </div>
                <div class="fld" :class="{err: errs.s_email}">
                  <label>Email siswa</label>
                  <input v-model="form.s_email" @input="clearErr('s_email')" type="email" inputmode="email" placeholder="cth: nama@email.com">
                  <span class="f-msg">Format email tidak valid.</span>
                  <p class="f-hint">Opsional — boleh dikosongkan.</p>
                </div>
                <div class="fld full" :class="{err: errs.s_sekolah}">
                  <label>Nama SD / MI asal <i>*</i></label>
                  <input v-model="form.s_sekolah" @input="clearErr('s_sekolah')" type="text" placeholder="cth: SDN Bahagia 01 / MI Attaqwa 15">
                  <span class="f-msg">Nama SD/MI asal wajib diisi.</span>
                </div>
                <div class="fld full" :class="{err: errs.s_alsekolah}">
                  <label>Alamat SD / MI asal <i>*</i></label>
                  <textarea v-model="form.s_alsekolah" @input="clearErr('s_alsekolah')" placeholder="Jalan, kelurahan, kecamatan, kabupaten/kota"></textarea>
                  <span class="f-msg">Alamat sekolah asal wajib diisi.</span>
                </div>
              </div>
            </fieldset>

            <!-- STEP 2: DATA ORANG TUA / WALI -->
            <fieldset class="fstep" :class="{ on: step === 2 }">
              <h2>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 15.2c2.3.3 4.3 1.7 5.5 4.3"/></svg>
                Informasi Orang Tua / Wali
              </h2>
              <p class="fdesc">Data orang tua/wali untuk keperluan administrasi dan komunikasi.</p>
              <div class="f-grid">
                <div class="fld" :class="{err: errs.o_nama}">
                  <label>Nama lengkap orang tua / wali <i>*</i></label>
                  <input v-model="form.o_nama" @input="clearErr('o_nama')" type="text" placeholder="Sesuai KTP/KK">
                  <span class="f-msg">Nama wajib diisi.</span>
                </div>
                <div class="fld" :class="{err: errs.o_hub}">
                  <label>Hubungan dengan siswa <i>*</i></label>
                  <select v-model="form.o_hub" @change="clearErr('o_hub')">
                    <option value="">— Pilih —</option>
                    <option>Ayah</option>
                    <option>Ibu</option>
                    <option>Wali</option>
                  </select>
                  <span class="f-msg">Pilih hubungan.</span>
                </div>
                <div class="fld" :class="{err: errs.o_nik}">
                  <label>NIK (Nomor Induk Kependudukan) <i>*</i></label>
                  <input v-model="form.o_nik" @input="clearErr('o_nik'); numericOnly('o_nik')" type="text" inputmode="numeric" maxlength="16" placeholder="16 digit NIK">
                  <span class="f-msg">NIK harus 16 digit angka.</span>
                </div>
                <div class="fld" :class="{err: errs.o_hp}">
                  <label>No. HP / WhatsApp aktif <i>*</i></label>
                  <input v-model="form.o_hp" @input="clearErr('o_hp'); phoneOnly('o_hp')" type="tel" inputmode="tel" placeholder="cth: 0812xxxxxxx">
                  <span class="f-msg">Nomor HP/WA wajib diisi dengan benar.</span>
                </div>
                <div class="fld" :class="{err: errs.o_email}">
                  <label>Email aktif orang tua</label>
                  <input v-model="form.o_email" @input="clearErr('o_email')" type="email" inputmode="email" placeholder="cth: orangtua@email.com">
                  <span class="f-msg">Format email tidak valid.</span>
                  <p class="f-hint">Opsional — untuk pengiriman informasi.</p>
                </div>
                <div class="fld" :class="{err: errs.o_tempat}">
                  <label>Tempat lahir <i>*</i></label>
                  <input v-model="form.o_tempat" @input="clearErr('o_tempat')" type="text" placeholder="cth: Bekasi">
                  <span class="f-msg">Tempat lahir wajib diisi.</span>
                </div>
                <div class="fld" :class="{err: errs.o_tgl}">
                  <label>Tanggal lahir <i>*</i></label>
                  <input v-model="form.o_tgl" @input="clearErr('o_tgl')" type="date">
                  <span class="f-msg">Tanggal lahir wajib diisi.</span>
                </div>
                <div class="fld full" :class="{err: errs.o_alamat}">
                  <label>Alamat tempat tinggal <i>*</i></label>
                  <textarea v-model="form.o_alamat" @input="clearErr('o_alamat')" placeholder="Jalan, RT/RW, kelurahan, kecamatan, kabupaten/kota, kode pos"></textarea>
                  <span class="f-msg">Alamat tempat tinggal wajib diisi.</span>
                </div>
              </div>
            </fieldset>

            <!-- STEP 3: PEMBAYARAN -->
            <fieldset class="fstep" :class="{ on: step === 3 }">
              <h2>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
                Pembayaran Pendaftaran SMP
              </h2>
              <p class="fdesc">Selesaikan pembayaran biaya formulir SPMB SMP IT Bina Cendekia Assalam, lalu unggah bukti pembayarannya.</p>
              
              <div class="pay-box">
                <div class="orb"></div>
                <small>Total yang harus dibayar</small>
                <div class="amt">Rp300.000<small>,-</small></div>
              </div>

              <div class="pay-methods">
                <div class="pay-opt">
                  <span class="pay-ic">
                    <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 4l9 5.5"/><path d="M4.5 9.5V18M9.5 9.5V18M14.5 9.5V18M19.5 9.5V18M2.5 20.5h19"/></svg>
                  </span>
                  <div>
                    <b>Transfer Bank BSI</b>
                    <p>Nomor rekening resmi akan diinformasikan panitia SPMB. Konfirmasi ke <b>021-88886776</b> setelah transfer.</p>
                  </div>
                </div>
                <div class="pay-opt">
                  <span class="pay-ic gold">
                    <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z"/></svg>
                  </span>
                  <div>
                    <b>QRIS</b>
                    <p>Pindai kode QRIS resmi sekolah yang akan dibagikan oleh panitia SPMB.</p>
                  </div>
                </div>
              </div>

              <div class="fld" :class="{err: errs.bukti}">
                <label>Upload bukti pembayaran <i>*</i></label>
                <label class="up">
                  <input type="file" accept="image/*,.pdf" @change="onFileChange">
                  <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 10l5-5 5 5"/><path d="M4 20h16"/></svg>
                  <b>Klik untuk memilih file bukti</b>
                  <small>Foto/scan struk transfer (JPG, PNG, atau PDF) — maks. 5 MB</small>
                </label>
                <div class="up-preview" :class="{on: filePreview}">
                  <img v-if="fileIsImg" :src="filePreview" alt="Pratinjau bukti">
                  <div>
                    <div class="up-name">{{ fileName }}</div>
                    <div class="up-ok">&#10003; File siap diunggah</div>
                  </div>
                </div>
                <span class="f-msg">Bukti pembayaran wajib diunggah (maks. 5 MB).</span>
              </div>

              <label class="agree" :class="{err: errs.agree}">
                <input type="checkbox" v-model="form.agree" @change="clearErr('agree')">
                <span>Saya menyatakan bahwa seluruh data yang diisi adalah benar dan bersedia mengikuti seluruh tahapan SPMB SMP IT Bina Cendekia Assalam T.A 2027/2028. <b>*</b></span>
              </label>
            </fieldset>

            <!-- Navigation Buttons -->
            <div class="wiz-nav">
              <button type="button" class="btn btn-ghost btnBack" :class="{show: step > 1}" @click="prevStep">Kembali</button>
              <button type="button" class="btn btn-pri" @click="nextStep">
                {{ step === 3 ? 'Kirim Pendaftaran SMP' : 'Lanjut' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- ======= FOOTER ======= -->
    <footer class="spmb-foot">
      <div class="spmb-wrap">
        <span>&copy; 2026 SMP IT Bina Cendekia Assalam — Babelan, Kab. Bekasi</span>
        <span>Butuh bantuan? <a href="tel:02188886776">021-88886776</a></span>
      </div>
    </footer>

    <!-- ======= MODAL SUKSES ======= -->
    <div class="spmb-modal" v-if="modalSuccess" role="dialog" aria-modal="true" aria-labelledby="msTitle">
      <div class="m-scrim" @click="modalSuccess = false"></div>
      <div class="m-card">
        <button class="m-x" @click="modalSuccess = false" aria-label="Tutup">
          <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="ok-ring">
          <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
        </div>
        <h2 id="msTitle">Pendaftaran SMP Berhasil!</h2>
        <p class="m-sub">Data pendaftaran calon murid SMP IT Bina Cendekia Assalam sudah kami terima. Panitia akan memverifikasi berkas dan pembayaran maksimal 1&times;24 jam.</p>
        <div class="reg-id">
          <small>ID Pendaftaran SMP</small>
          <div class="rid">{{ submittedReg.id }}</div>
          <div class="copy-row">
            <button class="btn btn-ghost btn-sm" @click="copyId">
              <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>{{ copyText }}</span>
            </button>
          </div>
        </div>
        <dl class="det-grid">
          <div><dt>Jenjang</dt><dd>{{ submittedReg.jenjang }}</dd></div>
          <div><dt>Nama siswa</dt><dd>{{ submittedReg.s_nama }}</dd></div>
          <div><dt>NISN</dt><dd>{{ submittedReg.s_nisn }}</dd></div>
          <div><dt>SD / MI Asal</dt><dd>{{ submittedReg.s_sekolah }}</dd></div>
          <div><dt>Orang tua</dt><dd>{{ submittedReg.o_nama }} ({{ submittedReg.o_hub }})</dd></div>
          <div><dt>No. WhatsApp</dt><dd>{{ submittedReg.o_hp }}</dd></div>
        </dl>
        <div class="m-note">
          <b>Simpan ID pendaftaranmu!</b> Gunakan ID tersebut pada menu <b>Cek Status</b> untuk memantau proses verifikasi berkas dan jadwal tes pemetaan.
        </div>
        <div class="m-actions">
          <button class="btn btn-pri" @click="modalSuccess = false">Selesai</button>
        </div>
      </div>
    </div>

    <!-- ======= MODAL CEK STATUS ======= -->
    <div class="spmb-modal" v-if="modalTrack" role="dialog" aria-modal="true" aria-labelledby="mtTitle">
      <div class="m-scrim" @click="modalTrack = false"></div>
      <div class="m-card">
        <button class="m-x" @click="modalTrack = false" aria-label="Tutup">
          <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h2 id="mtTitle">Cek Status Pendaftaran SMP</h2>
        <p class="m-sub">Masukkan ID pendaftaranmu untuk melihat progres verifikasi data.</p>
        <div class="fld" style="margin-bottom:14px">
          <label>ID Pendaftaran (cth: SPMB27-SMP-XXXXXX)</label>
          <input v-model="trackQuery" @keydown.enter="doTrack" type="text" placeholder="SPMB27-SMP-XXXXXX" style="text-transform:uppercase">
        </div>
        <div class="m-actions" style="margin-bottom:6px">
          <button class="btn btn-pri" @click="doTrack">Lacak Sekarang</button>
        </div>
        <div class="notfound" v-if="trackNotFound">ID tidak ditemukan di perangkat ini. Pastikan ID sudah benar atau hubungi panitia SPMB.</div>
        
        <div v-if="trackResult" style="margin-top:16px">
          <div class="reg-id" style="margin-bottom:16px">
            <small>ID Pendaftaran</small>
            <div class="rid">{{ trackResult.id }}</div>
          </div>
          <dl class="det-grid">
            <div><dt>Nama siswa</dt><dd>{{ trackResult.s_nama }}</dd></div>
            <div><dt>Jenjang</dt><dd>{{ trackResult.jenjang }}</dd></div>
            <div><dt>SD / MI Asal</dt><dd>{{ trackResult.s_sekolah }}</dd></div>
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
  title: 'SPMB 2027/2028 — SMP IT Bina Cendekia Assalam',
  meta: [
    { name: 'description', content: 'Penerimaan Murid Baru SMP IT Bina Cendekia Assalam Babelan Tahun Ajaran 2027/2028.' }
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
  step,
  wizEl,
  form,
  filePreview,
  fileIsImg,
  fileName,
  errs,
  clearErr,
  numericOnly,
  phoneOnly,
  onFileChange,
  nextStep,
  prevStep,
  modalSuccess,
  submittedReg,
  copyText,
  copyId,
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
} = useSpmbForm('smp')
</script>

<style scoped src="~/assets/css/spmb.css"></style>
<style scoped>
.unit-banner {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.unit-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #EFF6FF;
  border: 1.5px solid #BFDBFE;
  color: #1E40AF;
  padding: 10px 18px;
  border-radius: 9999px;
  font-size: 13.5px;
  font-weight: 600;
}
.unit-badge .ai {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #2563EB;
}
</style>
