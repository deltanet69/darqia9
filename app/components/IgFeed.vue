<script setup lang="ts">
// Feed Instagram live dari Meta Graph API (endpoint /api/instagram/feed).
// Desain meniru section Instagram homepage SMK agar seragam antar situs.
// jenjang menentukan akun: smp -> @smpitbca_official, yayasan -> gabungan dua sekolah.
const props = defineProps<{
  jenjang: 'smp' | 'yayasan'
  tema?: 'navy' | 'emerald'
}>()

interface IgItem {
  id: string
  caption: string
  hashtags: string
  imageUrl: string
  badge: string
  badgeType: 'reel' | 'gallery' | 'image' | 'custom'
  permalink: string
  likes: number
  comments: number
  timeAgo: string
  author: string
}

const { data: feed, pending } = await useFetch<{ data: IgItem[]; username: string | null; profilePic: string | null }>(
  '/api/instagram/feed',
  { query: { jenjang: props.jenjang } }
)

const posts = computed<IgItem[]>(() => feed.value?.data || [])
const username = computed(() => feed.value?.username || (props.jenjang === 'smp' ? 'smpitbca_official' : ''))
const profilePic = computed(() => feed.value?.profilePic || '')
const pillTeks = computed(() => props.jenjang === 'smp' ? `Instagram Resmi @${username.value}` : 'Instagram Resmi Sekolah')
const subjudul = computed(() => props.jenjang === 'smp'
  ? 'Ikuti liputan kegiatan belajar, pembiasaan ibadah, dan karya kreatif siswa langsung di akun Instagram kami.'
  : 'Ikuti liputan kegiatan santri SMP IT BCA & SMK IT Attaqwa 9 langsung dari akun Instagram resmi sekolah.')
const chipSub = computed(() => props.jenjang === 'smp' ? 'SMP IT BCA (Official)' : 'Yayasan Darqia Attaqwa')
const tautanProfil = computed(() => props.jenjang === 'smp'
  ? `https://www.instagram.com/${username.value}/?hl=id`
  : 'https://www.instagram.com/smkit.attaqwa9/?hl=id')
</script>

<template>
  <section v-if="pending || posts.length" class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden">
    <div class="max-w-[1180px] mx-auto px-5 lg:px-6">

      <!-- Header & Profile Info Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#EEF3FA]">

        <!-- Section Title -->
        <div class="max-w-[620px]">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#DD2A7B] uppercase py-1 px-3.5 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] mb-3">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            {{ pillTeks }}
          </span>
          <h2 class="text-[clamp(24px,3.4vw,34px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Kilas Cerita &amp; <span class="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent">Aktivitas Santri</span>
          </h2>
          <p class="text-[#5A6B8C] text-[15.5px] mt-2 leading-relaxed">
            {{ subjudul }}
          </p>
        </div>

        <!-- Profile Badge & CTA Button -->
        <div class="flex flex-wrap items-center gap-4">
          <div v-if="jenjang === 'smp'" class="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 pr-4 rounded-[16px]">
            <div class="p-[2px] rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] shrink-0">
              <div class="w-11 h-11 rounded-full bg-white p-[2px] overflow-hidden flex items-center justify-center">
                <img v-if="profilePic" :src="profilePic" :alt="`Foto profil @${username}`" class="w-full h-full object-cover rounded-full" />
                <svg v-else class="w-6 h-6 fill-[#DD2A7B]" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[13.5px] font-black text-[#0A2A5C]">{{ username }}</span>
                <svg class="w-4 h-4 text-[#1B5FD9] fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <span class="text-[12px] text-[#64748B] font-medium">{{ chipSub }}</span>
            </div>
          </div>

          <a
            :href="tautanProfil"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 font-bold text-[14.5px] py-3 px-6 rounded-[14px] text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] shadow-[0_8px_20px_rgba(221,42,123,0.3)] hover:shadow-[0_12px_28px_rgba(221,42,123,0.45)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Ikuti di Instagram
          </a>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="i in 4" :key="i" class="bg-[#F8FAFC] border border-[#E2ECF8] rounded-[20px] overflow-hidden animate-pulse">
          <div class="aspect-[4/5] bg-slate-200"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            <div class="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Grid kartu postingan -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <a
          v-for="(post, idx) in posts"
          :key="post.id || idx"
          :href="post.permalink"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative bg-[#F8FAFC] border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-[#0A2A5C]">
            <img
              :src="post.imageUrl"
              :alt="post.caption"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1.5">
              <svg v-if="post.badgeType === 'reel'" class="w-3 h-3 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <svg v-else-if="post.badgeType === 'gallery'" class="w-3 h-3 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <svg v-else class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              {{ post.badge }}
            </div>
            <div class="absolute inset-0 bg-[#061A3E]/75 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-200 flex flex-col items-center justify-center text-white p-5 text-center">
              <div class="flex items-center gap-4 font-extrabold text-[14px] mb-3">
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 fill-[#F43F5E]" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  {{ post.likes }}
                </span>
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  {{ post.comments }}
                </span>
              </div>
              <span class="text-[12px] font-bold py-1.5 px-3.5 rounded-full bg-white/20 border border-white/30">
                Lihat di Instagram
              </span>
            </div>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between bg-white">
            <div>
              <p class="text-[13px] text-[#334155] leading-relaxed line-clamp-2 mb-2 font-medium">
                {{ post.caption }}
              </p>
              <div class="text-[12px] font-bold text-[#1B5FD9] line-clamp-1">
                {{ post.hashtags }}
              </div>
            </div>
            <div class="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11.5px] text-[#94A3B8]">
              <span>{{ post.timeAgo }}</span>
              <span class="font-semibold text-[#64748B]">{{ post.author }}</span>
            </div>
          </div>
        </a>
      </div>

    </div>
  </section>
</template>
