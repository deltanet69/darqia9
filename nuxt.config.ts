// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/admin-dark.css', 'katex/dist/katex.min.css'],
  app: {
    head: {
      title: 'DARQIA ATTAQWA — Unggul dalam IMTAQ, Terdepan dalam IPTEK',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#0A2A5C' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { key: 'ikon', rel: 'icon', type: 'image/png', href: '/asset/logo.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { key: 'ikon-apple', rel: 'apple-touch-icon', href: '/icons/smk-192.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap' }
      ],
      // Polyfill kecil untuk iOS 12–15: API yang dipakai Nuxt/Vue tanpa pengecekan. Harus jalan sebelum skrip aplikasi.
      script: [
        {
          tagPosition: 'head',
          innerHTML: 'self.globalThis||(self.globalThis=self);Object.hasOwn||(Object.hasOwn=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)});Object.fromEntries||(Object.fromEntries=function(i){var o={};Array.from(i).forEach(function(e){o[e[0]]=e[1]});return o});self.queueMicrotask||(self.queueMicrotask=function(f){Promise.resolve().then(f)});self.AbortController||(self.AbortController=function(){var s={aborted:!1,reason:void 0,addEventListener:function(){},removeEventListener:function(){}};this.signal=s;this.abort=function(r){s.aborted=!0;s.reason=r}});'
            + 'var P=function(n,f){Array.prototype[n]||Object.defineProperty(Array.prototype,n,{value:f,writable:!0,configurable:!0})};'
            + 'P("at",function(i){i=Math.trunc(i)||0;if(i<0)i+=this.length;return this[i]});'
            + 'P("flat",function(d){d=d===void 0?1:Math.trunc(d)||0;return d<1?Array.prototype.slice.call(this):Array.prototype.reduce.call(this,function(a,v){return a.concat(Array.isArray(v)?v.flat(d-1):[v])},[])});'
            + 'P("flatMap",function(f,t){return Array.prototype.map.call(this,f,t).flat()});'
            + 'self.IntersectionObserver||(self.IntersectionObserver=function(){this.observe=this.unobserve=this.disconnect=function(){}});'
        }
      ]
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY
  },
  // Halaman ujian siswa sepenuhnya digerakkan klien: dilayani sebagai cangkang statis (tanpa render server)
  // agar 1000 siswa membuka /cbt bersamaan tidak membebani CPU VPS. Aset publik juga dikompres saat build.
  routeRules: {
    '/cbt': { ssr: false },
    // Portal orang tua: dirender klien dan tidak boleh diindeks mesin pencari
    '/ortu': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/ortu/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } }
  },
  nitro: {
    compressPublicAssets: true
  },
  runtimeConfig: {
    // Kredensial server-only (tidak bocor ke browser)
    instagramAppSecret: process.env.INSTAGRAM_APP_SECRET || '',
    instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    // OCR bank soal: dua pembaca independen (utama + pemeriksa), keduanya API kompatibel OpenAI (/chat/completions).
    // Pemeriksa memakai URL/kunci yang sama dengan utama bila tidak diisi sendiri (mis. dua model GLM dari satu akun).
    ocrUtamaUrl: process.env.OCR_UTAMA_URL || 'https://api.pecutmarket.my.id/v1',
    ocrUtamaKey: process.env.OCR_UTAMA_KEY || process.env.PECUTMARKET_API_KEY || '',
    ocrUtamaModel: process.env.OCR_UTAMA_MODEL || 'glm-5.3-flash',
    ocrUtamaJson: process.env.OCR_UTAMA_JSON !== 'false',
    ocrKeduaUrl: process.env.OCR_KEDUA_URL || '',
    ocrKeduaKey: process.env.OCR_KEDUA_KEY || '',
    ocrKeduaModel: process.env.OCR_KEDUA_MODEL || 'deepseek-v4-flash-vision-exp',
    ocrKeduaJson: process.env.OCR_KEDUA_JSON !== 'false',
    public: {
      // Kredensial public (bisa diakses di client jika dibutuhkan)
      instagramAppId: process.env.NUXT_PUBLIC_INSTAGRAM_APP_ID || '',
      instagramUsername: 'smkit.attaqwa9'
    }
  },
  vite: {
    // Siswa masih memakai iPhone lama (iOS 12–17) dan Android lawas: sintaks JS/CSS diturunkan agar tetap jalan.
    build: { target: ['es2018', 'safari12', 'chrome64'], cssTarget: ['safari12', 'chrome64'] },
    // Literal BigInt (32n) di fnv1a-64 (dependency Nuxt) = galat sintaks di Safari <14 / Chrome <67; ganti ke BigInt(32).
    plugins: [{ name: 'bigint-lawas', transform: (code: string, id: string) => id.includes('fnv1a-64') ? code.replace(/\b32n\b/g, 'BigInt(32)') : undefined }],
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  }
})
