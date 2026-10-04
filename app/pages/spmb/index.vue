<template>
  <div class="spmb-body" :class="{'modal-open': modalSuccess || modalTrack}">
    <!-- ======= HEADER SIMPLE ======= -->
    <header class="spmb-top" :class="{ scrolled: isScrolled }">
      <div class="spmb-wrap">
        <NuxtLink class="t-brand" to="/" aria-label="Kembali ke web utama">
          <img src="/asset/logo.png" alt="Logo">
          <span><b>SPMB Online</b><small>SMP IT BCA &bull; SMK IT Attaqwa 9</small></span>
        </NuxtLink>
        <div>
          <button class="btn btn-ghost btn-sm" @click="openTrackModal">Cek Status</button>
          <NuxtLink class="btn btn-pri btn-sm" to="/">Beranda</NuxtLink>
        </div>
      </div>
    </header>

    <!-- ======= HEADLINE ======= -->
    <section class="spmb-hero">
      <div class="grid"></div><div class="orb o1"></div><div class="orb o2"></div>
      <div class="spmb-wrap">
        <span class="hero-badge">Tahun Ajaran 2027/2028</span>
        <h1>Penerimaan Murid Baru <span class="hl">2027/2028</span></h1>
        <p class="sub">Formulir pendaftaran online <b style="color:#fff">SMP IT Bina Cendekia Assalam</b> dan <b style="color:#fff">SMK IT Attaqwa 9</b> — isi data dengan benar, selesaikan pembayaran, dan simpan ID pendaftaranmu untuk verifikasi.</p>
        <div class="hero-chips">
          <span class="hchip">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
            Biaya pendaftaran Rp300.000
          </span>
          <span class="hchip">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>
            Online 24 jam
          </span>
          <span class="hchip">
            <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
            Data aman &amp; terverifikasi
          </span>
        </div>
      </div>
    </section>

    <!-- ======= WIZARD ======= -->
    <section class="wizard-sec">
      <div class="spmb-wrap">
        <div class="wiz" ref="wizEl">
          <ol class="steps">
            <li :class="{ on: step === 1, done: step > 1 }">
              <span class="st-n"><svg v-if="step > 1" class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg><template v-else>1</template></span>
              <span class="st-t">Data Siswa</span>
            </li>
            <li :class="{ on: step === 2, done: step > 2 }">
              <span class="st-n"><svg v-if="step > 2" class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg><template v-else>2</template></span>
              <span class="st-t">Data Orang Tua</span>
            </li>
            <li :class="{ on: step === 3, done: step > 3 }">
              <span class="st-n"><svg v-if="step > 3" class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg><template v-else>3</template></span>
              <span class="st-t">Pembayaran</span>
            </li>
          </ol>

          <div class="jenjang-wrap">
            <span class="jenjang-label">Pilih Jenjang Pendaftaran</span>
            <div class="seg" :data-active="form.jenjang" role="radiogroup" aria-label="Pilih jenjang">
              <span class="seg-thumb" aria-hidden="true"></span>
              <button type="button" class="seg-btn" :class="{on: form.jenjang === 'smk'}" @click="form.jenjang = 'smk'" role="radio" :aria-checked="form.jenjang === 'smk'">
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
                <span>SMK IT Attaqwa 9</span>
              </button>
              <button type="button" class="seg-btn" :class="{on: form.jenjang === 'smp'}" @click="form.jenjang = 'smp'" role="radio" :aria-checked="form.jenjang === 'smp'">
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>
                <span>SMP IT Bina Cendekia Assalam</span>
              </button>
            </div>
          </div>

          <form @submit.prevent novalidate>
            <!-- STEP 1 -->
            <fieldset class="fstep" :class="{ on: step === 1 }">
              <h2>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                Informasi Siswa
              </h2>
              <p class="fdesc">Lengkapi data calon murid sesuai dokumen resmi (rapor / KK).</p>
              <div class="f-grid">
                <div class="fld full" :class="{err: errs.s_nama}"><label>Nama lengkap siswa <i>*</i></label><input v-model="form.s_nama" @input="clearErr('s_nama')" type="text" placeholder="cth: Ahmad Fauzi Ramadhan" autocomplete="name"><span class="f-msg">Nama lengkap wajib diisi.</span></div>
                <div class="fld" :class="{err: errs.s_nisn}"><label>NISN <i>*</i></label><input v-model="form.s_nisn" @input="clearErr('s_nisn'); numericOnly('s_nisn')" type="text" inputmode="numeric" maxlength="10" placeholder="10 digit NISN"><span class="f-msg">NISN harus 10 digit angka.</span></div>
                <div class="fld" :class="{err: errs.s_jk}"><label>Jenis kelamin <i>*</i></label>
                  <div class="pills">
                    <label class="pill"><input type="radio" v-model="form.s_jk" value="Laki-laki" @change="clearErr('s_jk')"><span>Laki-laki</span></label>
                    <label class="pill"><input type="radio" v-model="form.s_jk" value="Perempuan" @change="clearErr('s_jk')"><span>Perempuan</span></label>
                  </div><span class="f-msg">Pilih jenis kelamin.</span>
                </div>
                <div class="fld" :class="{err: errs.s_tempat}"><label>Tempat lahir <i>*</i></label><input v-model="form.s_tempat" @input="clearErr('s_tempat')" type="text" placeholder="cth: Bekasi"><span class="f-msg">Tempat lahir wajib diisi.</span></div>
                <div class="fld" :class="{err: errs.s_tgl}"><label>Tanggal lahir <i>*</i></label><input v-model="form.s_tgl" @input="clearErr('s_tgl')" type="date"><span class="f-msg">Tanggal lahir wajib diisi.</span></div>
                <div class="fld" :class="{err: errs.s_hp}"><label>No. handphone siswa</label><input v-model="form.s_hp" @input="clearErr('s_hp'); phoneOnly('s_hp')" type="tel" inputmode="tel" placeholder="cth: 0812xxxxxxx"><span class="f-msg">Format nomor tidak valid.</span><p class="f-hint">Opsional — boleh dikosongkan.</p></div>
                <div class="fld" :class="{err: errs.s_email}"><label>Email siswa</label><input v-model="form.s_email" @input="clearErr('s_email')" type="email" inputmode="email" placeholder="cth: nama@email.com"><span class="f-msg">Format email tidak valid.</span><p class="f-hint">Opsional — boleh dikosongkan.</p></div>
                <div class="fld full" :class="{err: errs.s_sekolah}"><label>Nama sekolah asal <i>*</i></label><input v-model="form.s_sekolah" @input="clearErr('s_sekolah')" type="text" placeholder="cth: SMPN 1 Babelan / SDN Bahagia 01"><span class="f-msg">Nama sekolah asal wajib diisi.</span></div>
                <div class="fld full" :class="{err: errs.s_alsekolah}"><label>Alamat sekolah asal <i>*</i></label><textarea v-model="form.s_alsekolah" @input="clearErr('s_alsekolah')" placeholder="Jalan, kelurahan, kecamatan, kabupaten/kota"></textarea><span class="f-msg">Alamat sekolah asal wajib diisi.</span></div>
              </div>
            </fieldset>

            <!-- STEP 2 -->
            <fieldset class="fstep" :class="{ on: step === 2 }">
              <h2>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 15.2c2.3.3 4.3 1.7 5.5 4.3"/></svg>
                Informasi Orang Tua / Wali
              </h2>
              <p class="fdesc">Data orang tua/wali untuk keperluan administrasi dan komunikasi.</p>
              <div class="f-grid">
                <div class="fld" :class="{err: errs.o_nama}"><label>Nama lengkap orang tua / wali <i>*</i></label><input v-model="form.o_nama" @input="clearErr('o_nama')" type="text" placeholder="Sesuai KTP/KK"><span class="f-msg">Nama wajib diisi.</span></div>
                <div class="fld" :class="{err: errs.o_hub}"><label>Hubungan dengan siswa <i>*</i></label>
                  <select v-model="form.o_hub" @change="clearErr('o_hub')"><option value="">— Pilih —</option><option>Ayah</option><option>Ibu</option><option>Wali</option></select><span class="f-msg">Pilih hubungan.</span>
                </div>
                <div class="fld" :class="{err: errs.o_nik}"><label>NIK <i>*</i></label><input v-model="form.o_nik" @input="clearErr('o_nik'); numericOnly('o_nik')" type="text" inputmode="numeric" maxlength="16" placeholder="16 digit NIK"><span class="f-msg">NIK harus 16 digit angka.</span></div>
                <div class="fld" :class="{err: errs.o_hp}"><label>No. HP / WA aktif <i>*</i></label><input v-model="form.o_hp" @input="clearErr('o_hp'); phoneOnly('o_hp')" type="tel" inputmode="tel" placeholder="cth: 0812xxxxxxx"><span class="f-msg">Nomor HP/WA wajib diisi dengan benar.</span></div>
                <div class="fld" :class="{err: errs.o_email}"><label>Email aktif</label><input v-model="form.o_email" @input="clearErr('o_email')" type="email" inputmode="email" placeholder="cth: orangtua@email.com"><span class="f-msg">Format email tidak valid.</span><p class="f-hint">Opsional — untuk pengiriman informasi.</p></div>
                <div class="fld" :class="{err: errs.o_tempat}"><label>Tempat lahir <i>*</i></label><input v-model="form.o_tempat" @input="clearErr('o_tempat')" type="text" placeholder="cth: Bekasi"><span class="f-msg">Tempat lahir wajib diisi.</span></div>
                <div class="fld" :class="{err: errs.o_tgl}"><label>Tanggal lahir <i>*</i></label><input v-model="form.o_tgl" @input="clearErr('o_tgl')" type="date"><span class="f-msg">Tanggal lahir wajib diisi.</span></div>
                <div class="fld full" :class="{err: errs.o_alamat}"><label>Alamat tempat tinggal <i>*</i></label><textarea v-model="form.o_alamat" @input="clearErr('o_alamat')" placeholder="Jalan, RT/RW, kelurahan, kecamatan, kabupaten/kota, kode pos"></textarea><span class="f-msg">Alamat tempat tinggal wajib diisi.</span></div>
              </div>
            </fieldset>

            <!-- STEP 3 -->
            <fieldset class="fstep" :class="{ on: step === 3 }">
              <h2>
                <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
                Pembayaran Pendaftaran
              </h2>
              <p class="fdesc">Selesaikan pembayaran biaya pendaftaran, lalu unggah bukti bayarnya.</p>
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
                  <div><b>Transfer Bank BSI</b><p>Nomor rekening resmi akan diinformasikan panitia. Konfirmasi ke <b>021-88886776</b> setelah transfer.</p></div>
                </div>
                <div class="pay-opt">
                  <span class="pay-ic gold">
                    <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z"/></svg>
                  </span>
                  <div><b>QRIS</b><p>Pindai kode QRIS resmi sekolah yang akan dibagikan panitia SPMB.</p></div>
                </div>
              </div>
              <div class="fld" :class="{err: errs.bukti}">
                <label>Upload bukti pembayaran <i>*</i></label>
                <label class="up">
                  <input type="file" accept="image/*,.pdf" @change="onFileChange">
                  <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 10l5-5 5 5"/><path d="M4 20h16"/></svg>
                  <b>Klik untuk memilih file</b>
                  <small>Foto/scan struk (JPG, PNG, atau PDF) — maks. 5 MB</small>
                </label>
                <div class="up-preview" :class="{on: filePreview}">
                  <img v-if="fileIsImg" :src="filePreview" alt="Pratinjau bukti">
                  <div><div class="up-name">{{fileName}}</div><div class="up-ok">&#10003; File siap diunggah</div></div>
                </div>
                <span class="f-msg">Bukti pembayaran wajib diunggah (maks. 5 MB).</span>
              </div>
              <label class="agree" :class="{err: errs.agree}">
                <input type="checkbox" v-model="form.agree" @change="clearErr('agree')">
                <span>Saya menyatakan bahwa seluruh data yang diisi adalah benar dan bersedia mengikuti seluruh tahapan SPMB Tahun Ajaran 2027/2028. <b>*</b></span>
              </label>
            </fieldset>

            <div class="wiz-nav">
              <button type="button" class="btn btn-ghost btnBack" :class="{show: step > 1}" @click="prevStep">Kembali</button>
              <button type="button" class="btn btn-pri" @click="nextStep">{{ step === 3 ? 'Kirim Pendaftaran' : 'Lanjut' }}</button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <footer class="spmb-foot">
      <div class="spmb-wrap">
        <span>&copy; 2026 SMP IT Bina Cendekia Assalam &amp; SMK IT Attaqwa 9 — Babelan, Kab. Bekasi</span>
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
        <h2 id="msTitle">Pendaftaran Berhasil!</h2>
        <p class="m-sub">Data pendaftaran dan bukti pembayaranmu sudah kami terima. Panitia akan memverifikasi pembayaranmu maksimal 1&times;24 jam.</p>
        <div class="reg-id">
          <small>ID Pendaftaran</small>
          <div class="rid">{{ submittedReg.id }}</div>
          <div class="copy-row">
            <button class="btn btn-ghost btn-sm" @click="copyId">
              <svg class="ai" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 5.5v-1a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1"/></svg>
              <span>{{ copyText }}</span>
            </button>
          </div>
        </div>
        <dl class="det-grid">
          <div><dt>Jenjang</dt><dd>{{ submittedReg.jenjang }}</dd></div>
          <div><dt>Nama siswa</dt><dd>{{ submittedReg.s_nama }}</dd></div>
          <div><dt>NISN</dt><dd>{{ submittedReg.s_nisn }}</dd></div>
          <div><dt>Sekolah asal</dt><dd>{{ submittedReg.s_sekolah }}</dd></div>
          <div><dt>Orang tua</dt><dd>{{ submittedReg.o_nama }} ({{ submittedReg.o_hub }})</dd></div>
          <div><dt>No. WA</dt><dd>{{ submittedReg.o_hp }}</dd></div>
        </dl>
        <div class="m-note"><b>Simpan ID pendaftaranmu!</b> Gunakan ID tersebut di menu <b>Cek Status</b> untuk verifikasi dan memantau progres pendaftaranmu.</div>
        <div class="m-actions">
          <button class="btn btn-pri" @click="modalSuccess = false">Selesai</button>
        </div>
      </div>
    </div>

    <!-- ======= MODAL LACAK ======= -->
    <div class="spmb-modal" v-if="modalTrack" role="dialog" aria-modal="true" aria-labelledby="mtTitle">
      <div class="m-scrim" @click="modalTrack = false"></div>
      <div class="m-card">
        <button class="m-x" @click="modalTrack = false" aria-label="Tutup">
          <svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h2 id="mtTitle">Cek Status Pendaftaran</h2>
        <p class="m-sub">Masukkan ID pendaftaranmu untuk melihat verifikasi dan progresnya.</p>
        <div class="fld" style="margin-bottom:14px">
          <label>ID Pendaftaran</label>
          <input v-model="trackQuery" @keydown.enter="doTrack" type="text" placeholder="cth: SPMB27-SMP-A7K3Q9" style="text-transform:uppercase">
        </div>
        <div class="m-actions" style="margin-bottom:6px">
          <button class="btn btn-pri" @click="doTrack">Lacak Sekarang</button>
        </div>
        <div class="notfound" v-if="trackNotFound">ID tidak ditemukan di perangkat ini. Pastikan ID sudah benar, atau lakukan pendaftaran di perangkat yang sama.</div>
        
        <div v-if="trackResult" style="margin-top:16px">
          <div class="reg-id" style="margin-bottom:16px">
            <small>ID Pendaftaran</small>
            <div class="rid">{{ trackResult.id }}</div>
          </div>
          <ul class="tl">
            <li class="done">
              <span class="tl-dot"><svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
              <div><b>Pendaftaran diterima</b><small>Data & bukti pembayaran masuk</small></div>
            </li>
            <li class="now">
              <span class="tl-dot"><svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span>
              <div><b>Verifikasi pembayaran</b><small>Panitia memeriksa bukti transfer/QRIS</small></div>
            </li>
            <li class="">
              <span class="tl-dot"><svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span>
              <div><b>Pengumuman hasil</b><small>Diumumkan via WhatsApp terdaftar</small></div>
            </li>
          </ul>
          <dl class="det-grid">
            <div><dt>Jenjang</dt><dd>{{ trackResult.jenjang }}</dd></div>
            <div><dt>Nama siswa</dt><dd>{{ trackResult.s_nama }}</dd></div>
            <div><dt>Sekolah asal</dt><dd>{{ trackResult.s_sekolah }}</dd></div>
            <div><dt>Status</dt><dd>{{ trackResult.status }}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'default' })

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 40 }
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const wizEl = ref(null)
const step = ref(1)

const form = reactive({
  jenjang: 'smk',
  s_nama: '', s_nisn: '', s_jk: '', s_tempat: '', s_tgl: '', s_hp: '', s_email: '', s_sekolah: '', s_alsekolah: '',
  o_nama: '', o_hub: '', o_nik: '', o_hp: '', o_email: '', o_tempat: '', o_tgl: '', o_alamat: '',
  agree: false
})
const fileObj = ref(null)
const filePreview = ref('')
const fileIsImg = ref(false)
const fileName = ref('')

const errs = reactive({
  s_nama: false, s_nisn: false, s_jk: false, s_tempat: false, s_tgl: false, s_hp: false, s_email: false, s_sekolah: false, s_alsekolah: false,
  o_nama: false, o_hub: false, o_nik: false, o_hp: false, o_email: false, o_tempat: false, o_tgl: false, o_alamat: false,
  bukti: false, agree: false
})

const clearErr = (key) => errs[key] = false

const numericOnly = (key) => {
  const v = (form[key] || '').replace(/\D/g, '')
  form[key] = v
}

const phoneOnly = (key) => {
  let v = (form[key] || '').replace(/\D/g, '')
  if (v.startsWith('62')) v = '0' + v.substring(2)
  form[key] = v
}

const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

const validStep = (n) => {
  let ok = true
  if (n === 1) {
    if (!form.s_nama.trim()) { errs.s_nama = true; ok = false }
    if (!/^\d{10}$/.test(form.s_nisn)) { errs.s_nisn = true; ok = false }
    if (!form.s_jk) { errs.s_jk = true; ok = false }
    if (!form.s_tempat.trim()) { errs.s_tempat = true; ok = false }
    if (!form.s_tgl) { errs.s_tgl = true; ok = false }
    if (form.s_hp && !/^08\d{7,12}$/.test(form.s_hp)) { errs.s_hp = true; ok = false }
    if (form.s_email && !isEmail(form.s_email)) { errs.s_email = true; ok = false }
    if (!form.s_sekolah.trim()) { errs.s_sekolah = true; ok = false }
    if (!form.s_alsekolah.trim()) { errs.s_alsekolah = true; ok = false }
  } else if (n === 2) {
    if (!form.o_nama.trim()) { errs.o_nama = true; ok = false }
    if (!form.o_hub) { errs.o_hub = true; ok = false }
    if (!/^\d{16}$/.test(form.o_nik)) { errs.o_nik = true; ok = false }
    if (!form.o_hp || !/^08\d{7,12}$/.test(form.o_hp)) { errs.o_hp = true; ok = false }
    if (form.o_email && !isEmail(form.o_email)) { errs.o_email = true; ok = false }
    if (!form.o_tempat.trim()) { errs.o_tempat = true; ok = false }
    if (!form.o_tgl) { errs.o_tgl = true; ok = false }
    if (!form.o_alamat.trim()) { errs.o_alamat = true; ok = false }
  } else if (n === 3) {
    if (!fileObj.value) { errs.bukti = true; ok = false }
    if (!form.agree) { errs.agree = true; ok = false }
  }
  return ok
}

const onFileChange = (e) => {
  const f = e.target.files && e.target.files[0]
  clearErr('bukti')
  filePreview.value = ''
  if (!f) {
    fileObj.value = null
    return
  }
  const okType = /^image\//.test(f.type) || f.type === 'application/pdf'
  if (!okType || f.size > 5 * 1024 * 1024) {
    errs.bukti = true
    e.target.value = ''
    fileObj.value = null
    return
  }
  fileObj.value = f
  fileName.value = `${f.name} (${Math.round(f.size/1024)} KB)`
  if (/^image\//.test(f.type)) {
    fileIsImg.value = true
    const r = new FileReader()
    r.onload = (ev) => { filePreview.value = ev.target.result }
    r.readAsDataURL(f)
  } else {
    fileIsImg.value = false
    filePreview.value = 'pdf'
  }
}

const nextStep = () => {
  if (!validStep(step.value)) {
    // scroll to first error (basic impl)
    return
  }
  if (step.value < 3) {
    step.value++
    scrollToTop()
  } else {
    submitForm()
  }
}
const prevStep = () => {
  if (step.value > 1) {
    step.value--
    scrollToTop()
  }
}

const scrollToTop = () => {
  if (wizEl.value) {
    const top = wizEl.value.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// Modal Success & Submission
const modalSuccess = ref(false)
const submittedReg = ref({})
const copyText = ref('Salin ID')

const genId = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for(let i=0; i<6; i++) s += c[Math.floor(Math.random()*c.length)]
  const pref = form.jenjang === 'smp' ? 'SMP' : 'SMK'
  return `SPMB27-${pref}-${s}`
}

const fmtDate = (v) => {
  if(!v) return '-'
  const d = new Date(v+'T00:00:00')
  return d.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})
}

const submitForm = () => {
  const id = genId()
  const jenjFull = form.jenjang === 'smk' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam'
  const reg = {
    id, jenjang: jenjFull,
    s_nama: form.s_nama.trim(), s_nisn: form.s_nisn, s_jk: form.s_jk,
    s_ttl: `${form.s_tempat.trim()}, ${fmtDate(form.s_tgl)}`,
    s_hp: form.s_hp || '-', s_email: form.s_email || '-',
    s_sekolah: form.s_sekolah.trim(), s_alsekolah: form.s_alsekolah.trim(),
    o_nama: form.o_nama.trim(), o_hub: form.o_hub, o_nik: form.o_nik,
    o_hp: form.o_hp, o_email: form.o_email || '-',
    o_ttl: `${form.o_tempat.trim()}, ${fmtDate(form.o_tgl)}`,
    o_alamat: form.o_alamat.trim(),
    waktu: new Date().toISOString(), status: 'Menunggu verifikasi'
  }
  
  // Save to localStorage for track feature
  try {
    const arr = JSON.parse(localStorage.getItem('spmb27_regs') || '[]')
    arr.push(reg)
    localStorage.setItem('spmb27_regs', JSON.stringify(arr))
  } catch(e){}
  
  submittedReg.value = reg
  modalSuccess.value = true
}

const copyId = async () => {
  const t = submittedReg.value.id
  try {
    await navigator.clipboard.writeText(t)
    copyText.value = 'Tersalin!'
    setTimeout(() => { copyText.value = 'Salin ID' }, 1800)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = t
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch(err){}
    ta.remove()
    copyText.value = 'Tersalin!'
    setTimeout(() => { copyText.value = 'Salin ID' }, 1800)
  }
}

// Track feature
const modalTrack = ref(false)
const trackQuery = ref('')
const trackResult = ref(null)
const trackNotFound = ref(false)

const openTrackModal = () => {
  trackQuery.value = ''
  trackResult.value = null
  trackNotFound.value = false
  modalTrack.value = true
}

const doTrack = () => {
  const id = trackQuery.value.trim().toUpperCase()
  let regs = []
  try { regs = JSON.parse(localStorage.getItem('spmb27_regs') || '[]') } catch(e){}
  const reg = regs.find(r => r.id === id)
  
  if (reg) {
    trackNotFound.value = false
    trackResult.value = reg
  } else {
    trackNotFound.value = true
    trackResult.value = null
  }
}
</script>

<style scoped src="~/assets/css/spmb.css"></style>
<style>
/* Global override for modal blocking */
body:has(.modal-open) {
  overflow: hidden;
}
</style>
