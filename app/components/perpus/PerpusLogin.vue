<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { ART, GOOGLE } from '~/composables/perpusIkon'
import { inisialSiswa } from '~/composables/perpusCore'

const P = usePerpus()
const sekolah = computed(() => P.jenjangTampil.value === 'SMP'
  ? { nama: 'SMP IT Bina Cendekia Assalam', logo: '/asset/logosmp.png' }
  : { nama: 'SMK IT Attaqwa 9', logo: '/asset/logo.png' })
const langkah = computed(() => P.tahap.value === 'verifikasi' ? 'verif' : 'awal')

const nomor = ref('')
const err = ref('')
const kirim = ref(false)
const lengkap = ref(false) // reset akun: wajib NIS + NISN + tanggal lahir
const nisn = ref('')
const lahir = ref('')
const ok = computed(() => lengkap.value ? nomor.value.length >= 4 && nisn.value.length >= 4 && !!lahir.value : nomor.value.length >= 4)
const onNisn = (e: Event) => { nisn.value = (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, ''); err.value = '' }
const onInput = (e: Event) => {
  nomor.value = (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  err.value = ''
}
const verifikasi = async () => {
  if (!nomor.value) { err.value = 'Isi NIS atau NISN kamu dulu.'; return }
  kirim.value = true
  try { await P.verifikasi(lengkap.value ? { nomor: nomor.value, nisn: nisn.value, lahir: lahir.value } : { nomor: nomor.value }) } catch (e: any) {
    err.value = e.message
    if (e.butuhLengkap) lengkap.value = true
  } finally { kirim.value = false }
}
</script>

<template>
  <div class="login" :data-step="langkah">
    <div class="l-wrap">
      <div class="l-art"><svg viewBox="0 0 320 260" aria-hidden="true" focusable="false" v-html="ART" /></div>
      <section v-if="P.tahap.value !== 'memuat'" :key="langkah" class="l-card ganti">
        <template v-if="langkah === 'awal'">
          <div class="l-head">
            <h1>Perpus Digital</h1>
            <div class="l-sekolah"><span><img :src="sekolah.logo" alt="">{{ sekolah.nama }}</span></div>
            <p class="l-desc">Buku pelajaran, catatan, dan kisi-kisi ujianmu ada dalam satu tempat. Buka kapan saja, lanjutkan dari halaman terakhir.</p>
          </div>
          <div class="l-act">
            <p v-if="P.galat.value" class="err" role="alert">{{ P.galat.value }}</p>
            <button class="gbtn" @click="P.masukGoogle()"><span class="g"><svg viewBox="0 0 24 24" aria-hidden="true" v-html="GOOGLE" /></span><span class="tx">Masuk dengan Google</span><PerpusIkon n="maju" /></button>
            <p class="l-note">Gunakan akun Google milikmu. Setelah itu kami minta NIS atau NISN.</p>
          </div>
        </template>
        <template v-else>
          <button class="back" @click="P.gantiAkun()"><PerpusIkon n="kembali" />Ganti akun</button>
          <div class="l-prog" role="img" aria-label="Langkah 2 dari 2"><i class="on" /><i class="on" /></div>
          <div><h2>Satu langkah lagi</h2><p class="l-p">Masukkan NIS atau NISN agar kami tahu kamu siswa terdaftar.</p></div>
          <span class="l-email"><span class="av">{{ inisialSiswa(P.email.value.split('@')[0]!.replace(/[._]/g, ' ')) }}</span><span>{{ P.email.value }}</span></span>
          <form class="l-form" novalidate @submit.prevent="verifikasi">
            <label class="nis" for="nomor">NIS atau NISN</label>
            <div class="nis-f" :class="{ ok }"><input id="nomor" class="in besar num" name="nomor" inputmode="numeric" autocomplete="off" placeholder="Contoh: 24001" maxlength="20" :value="nomor" autofocus @input="onInput"><span class="cek"><PerpusIkon n="cek" /></span></div>
            <template v-if="lengkap">
              <label class="nis" for="nisn">NISN</label>
              <div class="nis-f" :class="{ ok: nisn.length >= 4 }"><input id="nisn" class="in besar num" inputmode="numeric" autocomplete="off" placeholder="Nomor induk siswa nasional" maxlength="20" :value="nisn" @input="onNisn"></div>
              <label class="nis" for="lahir">Tanggal lahir</label>
              <div class="nis-f" :class="{ ok: !!lahir }"><input id="lahir" v-model="lahir" class="in besar num" type="date" @input="err = ''"></div>
            </template>            <p v-if="err" class="err" role="alert">{{ err }}</p>
            <small v-else class="l-h">{{ lengkap ? 'Untuk memindahkan akun Google, isi NIS, NISN, dan tanggal lahir.' : 'Isi salah satu: NIS atau NISN.' }}</small>
            <button class="btn btn-p" type="submit" :disabled="!ok || kirim">{{ lengkap ? 'Verifikasi lengkap dan masuk' : 'Verifikasi dan masuk' }}</button>
          </form>
        </template>
      </section>
    </div>
  </div>
</template>
