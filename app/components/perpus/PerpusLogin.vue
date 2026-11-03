<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { usePerpus } from '~/composables/usePerpus'
import { KATA_PUTAR, inisialNama } from '~/composables/perpusCore'
import { SISWA_CONTOH } from '~/composables/perpusContoh'

const emit = defineEmits<{ masuk: [] }>()
const P = usePerpus()
const nis = ref('')
const galat = ref('')
const sibuk = ref(false)
const kataIdx = ref(0)
const kataKeluar = ref(false)
const ilustrasi = ref<HTMLElement | null>(null)
const terpilih = ref('')
let timer: ReturnType<typeof setInterval> | undefined
let timerKata: ReturnType<typeof setTimeout> | undefined

const putarKata = () => {
  kataKeluar.value = true
  timerKata = setTimeout(() => {
    kataIdx.value = (kataIdx.value + 1) % KATA_PUTAR.length
    kataKeluar.value = false
  }, 180)
}
onMounted(() => { timer = setInterval(putarKata, 2400) })
onBeforeUnmount(() => { clearInterval(timer); clearTimeout(timerKata) })

const kemiringan = (e: PointerEvent) => {
  const el = ilustrasi.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  el.style.transform = `perspective(700px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg)`
}
const luruskan = () => { if (ilustrasi.value) ilustrasi.value.style.transform = '' }

const pilihAkun = (n: string) => { nis.value = n; terpilih.value = n; galat.value = '' }

const masuk = async () => {
  galat.value = ''
  sibuk.value = true
  try {
    await P.login(nis.value)
    const s = P.state.value.sesi
    if (s) P.tampilToast('Selamat datang, ' + s.nama.split(' ')[0] + '!')
    emit('masuk')
  } catch (e: any) {
    galat.value = e?.message || 'NIS tidak terdaftar atau status siswa tidak aktif. Periksa kembali NIS kamu, atau hubungi petugas perpustakaan.'
  } finally { sibuk.value = false }
}
const warnaAkun = (n: string) => n === '20241005' ? '#1D4ED8' : n === '20251021' ? '#2563EB' : '#0B2C5F'
</script>

<template>
  <section class="view on v-login" @pointermove="kemiringan" @pointerleave="luruskan">
    <div class="lg-head fade-up" @click="putarKata">
      <div class="lg-badge"><i />SMK IT ATTAQWA 9</div>
      <h1>Perpustakaan<br><span class="grad-text">Digital</span></h1>
      <p>Baca <span class="lg-rot" :class="{ out: kataKeluar }">{{ KATA_PUTAR[kataIdx] }}</span> dan bacaan literasi, langsung di aplikasi Darqia.</p>
    </div>
    <div ref="ilustrasi" class="lg-illustration fade-in" role="img" aria-label="Ilustrasi perpustakaan digital: tablet berisi buku digital di antara sampul buku dan kartu rating">
      <svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="lgPanel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#E2EDFD"/>
            <stop offset="1" stop-color="#F4F9FF"/>
          </linearGradient>
          <linearGradient id="lgScreen7" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#FFFFFF"/>
            <stop offset="1" stop-color="#EAF3FF"/>
          </linearGradient>
          <linearGradient id="lgCover7" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2563EB"/>
            <stop offset="1" stop-color="#0B2C5F"/>
          </linearGradient>
          <linearGradient id="lgCovA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6D28D9"/>
            <stop offset="1" stop-color="#A78BFA"/>
          </linearGradient>
          <linearGradient id="lgCovB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#065F46"/>
            <stop offset="1" stop-color="#34D399"/>
          </linearGradient>
          <pattern id="lgDots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="#C7DDFB"/>
          </pattern>
        </defs>

        <rect x="6" y="6" width="328" height="288" rx="30" fill="url(#lgPanel)"/>
        <rect x="6" y="6" width="328" height="288" rx="30" fill="url(#lgDots)" opacity=".55"/>
        <circle cx="170" cy="152" r="80" fill="#FFFFFF" opacity=".6"/>
        <circle cx="170" cy="152" r="80" fill="none" stroke="#BFDBFE" stroke-width="2" stroke-dasharray="3 7"/>
        <ellipse cx="170" cy="282" rx="112" ry="8" fill="#0B2C5F" opacity=".08"/>
        <path d="M40 44v16M32 52h16" stroke="#2563EB" stroke-width="4" stroke-linecap="round" opacity=".6"/>
        <path d="M302 226v14M295 233h14" stroke="#2563EB" stroke-width="4" stroke-linecap="round" opacity=".45"/>
        <circle cx="312" cy="120" r="5" fill="#93C5FD"/>
        <circle cx="26" cy="150" r="4" fill="#60A5FA"/>

        <g transform="rotate(-10 66 152)">
          <rect x="30" y="98" width="72" height="108" rx="9" fill="url(#lgCovA)"/>
          <text x="66" y="114" text-anchor="middle" font-family="Inter,sans-serif" font-size="7.5" font-weight="700" letter-spacing="1.2" fill="#EDE9FE">INFORMATIKA</text>
          <text x="66" y="152" text-anchor="middle" font-family="Inter,sans-serif" font-size="27" font-weight="700" fill="#FFFFFF">IN</text>
          <path d="M44 168h44M44 179h30" stroke="#DDD6FE" stroke-width="4" stroke-linecap="round"/>
          <rect x="46" y="190" width="40" height="11" rx="5.5" fill="#FFFFFF" opacity=".28"/>
          <text x="66" y="199" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" font-weight="700" letter-spacing="1" fill="#FFFFFF">SIBI</text>
        </g>

        <g transform="rotate(9 274 144)">
          <rect x="238" y="90" width="72" height="108" rx="9" fill="url(#lgCovB)"/>
          <text x="274" y="106" text-anchor="middle" font-family="Inter,sans-serif" font-size="7.5" font-weight="700" letter-spacing="1.2" fill="#D1FAE5">LITERASI</text>
          <text x="274" y="144" text-anchor="middle" font-family="Inter,sans-serif" font-size="27" font-weight="700" fill="#FFFFFF">JH</text>
          <path d="M252 160h44M252 171h30" stroke="#A7F3D0" stroke-width="4" stroke-linecap="round"/>
          <rect x="254" y="182" width="40" height="11" rx="5.5" fill="#FFFFFF" opacity=".28"/>
          <text x="274" y="191" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" font-weight="700" letter-spacing="1" fill="#FFFFFF">SIBI</text>
        </g>

        <g transform="rotate(5 283 58)">
          <rect x="240" y="36" width="86" height="44" rx="12" fill="#FFFFFF" stroke="#DCE9FA" stroke-width="2"/>
          <path d="M258 47l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#2563EB"/>
          <path d="M274 51h38M274 63h26" stroke="#CBD5E1" stroke-width="5" stroke-linecap="round"/>
        </g>

        <rect x="108" y="32" width="124" height="198" rx="20" fill="#0B2C5F"/>
        <rect x="117" y="42" width="106" height="178" rx="12" fill="url(#lgScreen7)"/>
        <circle cx="128" cy="54" r="2.5" fill="#BFDBFE"/>
        <circle cx="137" cy="54" r="2.5" fill="#BFDBFE"/>
        <rect x="137" y="64" width="66" height="90" rx="8" fill="url(#lgCover7)"/>
        <path d="M188 64h10v28l-5-4-5 4z" fill="#BFDBFE"/>
        <path d="M148 84h26M148 96h36M148 108h22" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".85"/>
        <path d="M170 128c-6-5-13-6-20-3v14c7-3 14-2 20 3 6-5 13-6 20-3v-14c-7-3-14-2-20 3z" fill="#FFFFFF" opacity=".95"/>
        <rect x="139" y="166" width="62" height="7" rx="3.5" fill="#94A3B8"/>
        <rect x="150" y="180" width="40" height="7" rx="3.5" fill="#CBD5E1"/>
        <path d="M132 200h76" stroke="#DBEAFE" stroke-width="6" stroke-linecap="round"/>
        <path d="M132 200h50" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
        <rect x="159" y="224" width="22" height="4" rx="2" fill="#93C5FD"/>

        <g>
          <path d="M100 248c22-13 44-13 62-1v22c-18-12-40-12-62 1z" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="2"/>
          <path d="M240 248c-22-13-44-13-62-1v22c18-12 40-12 62 1z" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="2"/>
          <path d="M170 247v22" stroke="#93C5FD" stroke-width="2"/>
          <path d="M114 251c12-5 23-6 34-2M114 262c12-5 23-6 34-2M192 249c11-4 22-3 34 2M192 260c11-4 22-3 34 2" stroke="#BFDBFE" stroke-width="4" stroke-linecap="round" fill="none"/>
        </g>
      </svg>
    </div>

    <div class="lg-card fade-up d2">
      <label for="nis">NOMOR INDUK SISWA (NIS)</label>
      <div class="lg-in">
        <input id="nis" v-model="nis" inputmode="numeric" autocomplete="off" placeholder="cth: 20241005" maxlength="12" @keydown.enter="masuk" @input="galat = ''">
      </div>
      <div v-if="galat" class="lg-err" style="display:block">{{ galat }}</div>
      <button class="btn-navy" :disabled="sibuk" @click="masuk">{{ sibuk ? 'Memeriksa…' : 'Masuk' }}</button>
    </div>
    <div v-if="P.lokal.value" class="demo-acc fade-up d3">
      <p>DUMMY NIS — PILIH UNTUK LOGIN</p>
      <button v-for="s in SISWA_CONTOH" :key="s.nis" class="acc-row" :class="{ sel: terpilih === s.nis }" @click="pilihAkun(s.nis)">
        <span class="acc-av" :style="{ background: warnaAkun(s.nis) }">{{ inisialNama(s.nama) }}</span>
        <span style="min-width:0"><b>{{ s.nama }}</b><span>{{ s.kelas }}</span></span>
        <span class="nis">{{ s.nis }}</span>
      </button>
    </div>
  </section>
</template>
