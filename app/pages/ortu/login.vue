<template>
  <div class="ortu" :style="gayaTema(temaHalaman)">
    <div class="lg on" style="background:#F7F9FD">
      <div style="position:absolute;left:0;right:0;top:0;height:480px;background:linear-gradient(160deg,var(--p0) 0%,var(--p1) 100%);overflow:hidden">
        <svg width="340" height="340" viewBox="0 0 340 340" fill="none" aria-hidden="true" style="position:absolute;right:-130px;top:-90px"><circle cx="170" cy="170" r="168" stroke="#fff" stroke-opacity=".14" stroke-width="1.5" /><circle cx="170" cy="170" r="124" stroke="#fff" stroke-opacity=".14" stroke-width="1.5" /><circle cx="170" cy="170" r="80" stroke="#F0B429" stroke-opacity=".7" stroke-width="1.8" /></svg>
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none" aria-hidden="true" style="position:absolute;left:-120px;top:210px"><circle cx="130" cy="130" r="128" stroke="#fff" stroke-opacity=".1" stroke-width="1.5" /><circle cx="130" cy="130" r="84" stroke="#fff" stroke-opacity=".1" stroke-width="1.5" /></svg>
      </div>
      <div class="up" :style="`position:absolute;left:28px;right:28px;top:${modeGanti ? 40 : 74}px;color:#fff`">
        <div style="width:60px;height:60px;border-radius:19px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center">
          <img :src="temaHalaman.logo" :alt="`Logo ${temaHalaman.nama}`" width="42" height="42" style="width:42px;height:42px;object-fit:contain">
        </div>
        <div style="margin-top:20px;font-size:15px;font-weight:500;color:#F6D27A">{{ temaHalaman.nama }}</div>
        <h1 style="margin:8px 0 0;font-size:34px;line-height:1.12;font-weight:600;letter-spacing:-.03em">Portal<br>Orang Tua</h1>
        <p v-if="!modeGanti" style="margin:12px 0 0;font-size:16px;line-height:1.5;color:rgba(255,255,255,.82)">Pantau kehadiran, nilai, dan administrasi putra-putri Bapak/Ibu.</p>
      </div>

      <div class="up scroll" :style="`animation-delay:.14s;position:absolute;left:0;right:0;top:${modeGanti ? 250 : 384}px;bottom:0;box-sizing:border-box;padding:26px 24px 20px;background:#fff;border-radius:36px 36px 0 0;box-shadow:0 -14px 44px rgba(10,42,92,.18);overflow-y:auto`">
        <template v-if="modeGanti">
          <h2 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-.02em;color:var(--p0)">Buat kata sandi baru</h2>
          <p style="margin:2px 0 0;font-size:15px;line-height:1.5;color:#51607F">Demi keamanan, ganti kata sandi dari sekolah sebelum melanjutkan.</p>
          <OrtuGantiSandi :lama-awal="sandiTadi" @selesai="selesaiGanti" />
          <button type="button" style="display:block;margin:14px auto 0;min-height:44px;font-size:15px;font-weight:600;color:var(--p1)" @click="keluar">Keluar</button>
        </template>
        <form v-else novalidate @submit.prevent="masuk">
          <h2 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-.02em;color:var(--p0)">Masuk</h2>
          <p style="margin:2px 0 0;font-size:15px;color:#51607F">Gunakan NIS atau NISN anak dan kata sandi dari sekolah.</p>

          <div style="position:relative;margin-top:18px">
            <label for="nis" class="sr">NIS atau NISN siswa</label>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#7B8AA6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="position:absolute;left:16px;top:15px"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="11" r="2" /><path d="M6.5 16c.6-1.4 1.6-2 2.5-2s1.9.6 2.5 2M14 10h4M14 14h3" /></svg>
            <input id="nis" v-model.trim="nis" class="fld" inputmode="numeric" autocomplete="username" placeholder="NIS atau NISN anak" style="padding-left:48px;font-weight:500">
          </div>
          <div style="position:relative;margin-top:12px">
            <label for="pw" class="sr">Kata sandi</label>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#7B8AA6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="position:absolute;left:16px;top:15px"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            <input id="pw" v-model="sandi" class="fld" :type="tampilSandi ? 'text' : 'password'" autocomplete="current-password" placeholder="Kata sandi" style="padding-left:48px;padding-right:56px">
            <button type="button" :aria-label="tampilSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" style="position:absolute;right:4px;top:3px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#64748B" @click="tampilSandi = !tampilSandi">
              <svg v-if="!tampilSandi" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.4 7.6A17 17 0 0 0 2 12s3.6 6 10 6a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
            </button>
          </div>

          <div v-if="galat" role="alert" style="margin-top:12px;padding:10px 14px;border-radius:14px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.4">{{ galat }}</div>

          <button class="press" type="submit" :disabled="sibuk" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:58px;margin-top:20px;border-radius:18px;background:linear-gradient(135deg,var(--p1),var(--p0));color:#fff;font-size:18px;font-weight:600;text-align:center;box-shadow:0 12px 26px rgba(10,42,92,.25)">
            <span v-if="sibuk" class="spin" />
            <span>{{ sibuk ? 'Memeriksa…' : 'Masuk' }}</span>
          </button>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#64748B;text-align:center">Lupa kata sandi? Hubungi Tata Usaha sekolah.</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/ortu.css'
import { jenjangHost } from '~/composables/domainCore'
import { TEMA_ORTU } from '~/composables/ortuCore'
import type { JenjangOrtu, SesiOrtuKlien } from '~/types/ortu'

definePageMeta({ layout: false })
useHead({ title: 'Masuk · Portal Orang Tua', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const { sesi, gayaTema, pesanGalat, keluar, tampilToast } = useOrtu()

// Jenjang: domain parent.<sekolah>; di localhost/staging lewat ?jenjang=SMP (bawaan SMK).
const jenjangDomain = jenjangHost(useRequestURL().hostname)
const jenjang = computed<JenjangOrtu>(() => sesi.value?.jenjang
  ?? (jenjangDomain ? jenjangDomain.toUpperCase() as JenjangOrtu : route.query.jenjang === 'SMP' ? 'SMP' : 'SMK'))
const temaHalaman = computed(() => TEMA_ORTU[jenjang.value])

const nis = ref('')
const sandi = ref('')
const sandiTadi = ref('') // kata sandi awal yang baru diketik, agar tidak perlu diketik ulang di layar ganti
const tampilSandi = ref(false)
const galat = ref('')
const sibuk = ref(false)
const modeGanti = computed(() => !!sesi.value?.wajibGanti)

onMounted(async () => {
  // Sudah masuk (atau datang dari ?ganti=1): periksa sesi ke server.
  if (!sesi.value) sesi.value = await $fetch<SesiOrtuKlien>('/api/ortu/sesi').catch(() => null)
  if (sesi.value && !sesi.value.wajibGanti) navigateTo('/ortu', { replace: true })
})

const masuk = async () => {
  galat.value = ''
  if (!nis.value || !sandi.value) { galat.value = 'Isi NIS/NISN dan kata sandi.'; return }
  sibuk.value = true
  try {
    sesi.value = await $fetch<SesiOrtuKlien>('/api/ortu/login', { method: 'POST', body: { nis: nis.value, password: sandi.value, grade: jenjang.value } })
    if (sesi.value.wajibGanti) { sandiTadi.value = sandi.value; return }
    await navigateTo('/ortu', { replace: true })
  } catch (e) {
    galat.value = pesanGalat(e)
  } finally {
    sandi.value = ''
    sibuk.value = false
  }
}

const selesaiGanti = async () => {
  sandiTadi.value = ''
  tampilToast('Kata sandi tersimpan')
  await navigateTo('/ortu', { replace: true })
}
</script>
