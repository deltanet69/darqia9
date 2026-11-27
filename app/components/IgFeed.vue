<script setup lang="ts">
// Feed Instagram live dari Meta Graph API (endpoint /api/instagram/feed).
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
  badgeType: string
  permalink: string
  timeAgo: string
  author: string
}

const { data: feed, pending } = await useFetch<{ data: IgItem[]; username: string | null }>(
  '/api/instagram/feed',
  { query: { jenjang: props.jenjang } }
)

const posts = computed<IgItem[]>(() => feed.value?.data || [])
const username = computed(() => feed.value?.username || (props.jenjang === 'smp' ? 'smpitbca_official' : 'smkit.attaqwa9'))
const judul = computed(() => props.jenjang === 'smp'
  ? 'Instagram SMP IT Bina Cendekia Assalam'
  : 'Instagram Sekolah Kami')
const subjudul = computed(() => props.jenjang === 'smp'
  ? 'Ikuti kegiatan terbaru santri SMP IT BCA di Instagram'
  : 'Kegiatan terbaru SMP IT BCA & SMK IT Attaqwa 9, langsung dari Instagram resmi sekolah')
const warnaAksen = computed(() => props.tema === 'emerald' ? 'text-[#0B7A55] border-[#0B7A55]' : 'text-[#0B3D91] border-[#0B3D91]')
</script>

<template>
  <section v-if="pending || posts.length" class="py-[70px] bg-white">
    <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
      <div class="bg-white border border-[#E4E9F2] rounded-[16px] p-6 lg:p-[26px] shadow-[0_4px_24px_rgba(11,61,145,0.08)]">
        <!-- Kepala section -->
        <div class="flex items-center gap-3.5 flex-wrap mb-5">
          <div class="w-[46px] h-[46px] rounded-[13px] shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
            <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
          <div class="flex-1 min-w-[180px]">
            <h2 class="text-[20px] font-semibold text-[#1C2733] leading-snug">{{ judul }}</h2>
            <p class="text-[13.5px] text-[#5B6B7C] mt-0.5">{{ subjudul }}</p>
          </div>
          <a
            :href="`https://www.instagram.com/${username}/`"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-[14.5px] border-[1.5px] rounded-full py-2 px-4 whitespace-nowrap bg-white"
            :class="warnaAksen"
          >@{{ username }}</a>
        </div>

        <!-- Skeleton -->
        <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div v-for="i in 4" :key="i" class="border border-[#E4E9F2] rounded-xl overflow-hidden animate-pulse">
            <div class="aspect-[4/5] bg-slate-200"></div>
            <div class="p-3 space-y-2">
              <div class="h-3.5 bg-slate-200 rounded w-3/4"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Grid postingan -->
        <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <a
            v-for="post in posts"
            :key="post.id"
            :href="post.permalink"
            target="_blank"
            rel="noopener noreferrer"
            class="group block border border-[#E4E9F2] rounded-xl overflow-hidden bg-white hover:shadow-[0_10px_28px_rgba(10,42,92,0.12)] transition-shadow"
          >
            <span class="relative block aspect-[4/5] bg-[#EEF1F6] overflow-hidden">
              <img :src="post.imageUrl" :alt="post.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
              <span class="absolute top-2 right-2 bg-black/65 text-white text-[11px] font-semibold py-0.5 px-2 rounded-full">{{ post.badge }}</span>
            </span>
            <span class="block p-3">
              <span class="block text-[13px] leading-[1.45] text-[#1C2733] line-clamp-2 min-h-[38px]">{{ post.caption }}</span>
              <span class="flex items-center justify-between mt-2 text-[11.5px] text-[#8595A8]">
                <span>{{ post.timeAgo }}</span>
                <span class="font-semibold text-[#64748B]">{{ post.author }}</span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
