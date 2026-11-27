import { defineEventHandler, getQuery } from 'h3'

interface InstagramMediaItem {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export interface FormattedFeedItem {
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
  timestamp: string
}

// Peta jenjang -> Facebook Page sekolah (Page terhubung ke IG masing-masing).
// Token Meta (Facebook Login) membawa grant per Page ini; /me/accounts tidak dipakai.
const PETA_JENJANG: Record<string, { pageId: string; label: string }> = {
  smk: { pageId: '1467066629826818', label: 'SMK' },
  smp: { pageId: '1519935241199221', label: 'SMP' }
}

// Fallback curated feed SMK jika Meta API gagal total / token kedaluwarsa
const FALLBACK_POSTS: FormattedFeedItem[] = [
  {
    id: 'fb-1',
    caption: 'Uji kompetensi injeksi EFI & kelistrikan motor di BLK Komunitas Kemnaker RI',
    hashtags: '#TBSM #VokasiKuat #Attaqwa9',
    imageUrl: '/asset/SMK/ig-1.webp',
    badge: 'Reel',
    badgeType: 'reel',
    permalink: 'https://www.instagram.com/smkit.attaqwa9/?hl=id',
    likes: 0,
    comments: 0,
    timeAgo: 'Beberapa waktu lalu',
    author: '@smkit.attaqwa9',
    timestamp: ''
  },
  {
    id: 'fb-2',
    caption: 'Showcase karya digital: UI/UX aplikasi mobile & animasi santri',
    hashtags: '#KaryaSantri #DesainGrafis #Attaqwa9',
    imageUrl: '/asset/SMK/ig-2.webp',
    badge: 'Galeri',
    badgeType: 'gallery',
    permalink: 'https://www.instagram.com/smkit.attaqwa9/?hl=id',
    likes: 0,
    comments: 0,
    timeAgo: 'Beberapa waktu lalu',
    author: '@smkit.attaqwa9',
    timestamp: ''
  },
  {
    id: 'fb-3',
    caption: "Sima'an Al-Qur'an dan doa bersama. Fondasi IMTAQ yang kokoh melahirkan generasi berakhlak mulia",
    hashtags: '#IMTAQ #Tahfidz #SantriVokasi',
    imageUrl: '/asset/SMK/ig-3.webp',
    badge: 'IMTAQ',
    badgeType: 'custom',
    permalink: 'https://www.instagram.com/smkit.attaqwa9/?hl=id',
    likes: 0,
    comments: 0,
    timeAgo: 'Beberapa waktu lalu',
    author: '@smkit.attaqwa9',
    timestamp: ''
  },
  {
    id: 'fb-4',
    caption: 'Alhamdulillah, santri SMK IT Attaqwa 9 meraih Juara LKS Tingkat Wilayah',
    hashtags: '#PrestasiSantri #JuaraLKS #SMKBisa',
    imageUrl: '/asset/SMK/ig-4.webp',
    badge: 'Juara',
    badgeType: 'custom',
    permalink: 'https://www.instagram.com/smkit.attaqwa9/?hl=id',
    likes: 0,
    comments: 0,
    timeAgo: 'Beberapa waktu lalu',
    author: '@smkit.attaqwa9',
    timestamp: ''
  }
]

// Cache per jenjang di memori server (cegah rate limit Meta)
const cacheFeed = new Map<string, { data: FormattedFeedItem[]; username: string; timestamp: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 jam

function formatTimeAgo(isoString: string): string {
  try {
    const postDate = new Date(isoString).getTime()
    const now = Date.now()
    const diffHours = Math.floor((now - postDate) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Baru saja'
    if (diffHours < 24) return `${diffHours} jam lalu`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} hari lalu`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks < 4) return `${diffWeeks} minggu lalu`
    return `${Math.floor(diffDays / 30)} bulan lalu`
  } catch {
    return 'Beberapa waktu lalu'
  }
}

function parseHashtagsAndCaption(rawCaption: string = '') {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g
  const matches = rawCaption.match(hashtagRegex) || []
  const hashtags = matches.slice(0, 3).join(' ')

  const cleanCaption = rawCaption.replace(hashtagRegex, '').trim()
  return {
    caption: cleanCaption || rawCaption,
    hashtags: hashtags || '#DarqiaAttaqwa'
  }
}

async function ambilFeedAkun(pageId: string, accessToken: string): Promise<{ username: string; items: FormattedFeedItem[] }> {
  const base = 'https://graph.facebook.com/v21.0'
  const page = await $fetch<{ instagram_business_account?: { id: string; username: string } }>(
    `${base}/${pageId}?fields=instagram_business_account{id,username}&access_token=${accessToken}`,
    { timeout: 6000 }
  )
  const ig = page?.instagram_business_account
  if (!ig?.id) throw new Error(`Page ${pageId} tidak memiliki IG terhubung`)

  const media = await $fetch<{ data: InstagramMediaItem[] }>(
    `${base}/${ig.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=8&access_token=${accessToken}`,
    { timeout: 6000 }
  )

  const items: FormattedFeedItem[] = (media?.data || []).map((item, index) => {
    const { caption, hashtags } = parseHashtagsAndCaption(item.caption || '')
    let badge = 'Foto'
    let badgeType: FormattedFeedItem['badgeType'] = 'image'
    if (item.media_type === 'VIDEO') {
      badge = 'Video'
      badgeType = 'reel'
    } else if (item.media_type === 'CAROUSEL_ALBUM') {
      badge = 'Album'
      badgeType = 'gallery'
    }
    return {
      id: item.id || `live-${index}`,
      caption: caption || 'Liputan kegiatan sekolah.',
      hashtags,
      imageUrl: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url || '') : (item.media_url || ''),
      badge,
      badgeType,
      permalink: item.permalink || `https://www.instagram.com/${ig.username}/`,
      likes: item.like_count ?? 0,
      comments: item.comments_count ?? 0,
      timeAgo: formatTimeAgo(item.timestamp),
      author: `@${ig.username}`,
      timestamp: item.timestamp || ''
    }
  })

  return { username: ig.username, items }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const accessToken = config.instagramAccessToken || process.env.INSTAGRAM_ACCESS_TOKEN
  const appId = config.public.instagramAppId || process.env.NUXT_PUBLIC_INSTAGRAM_APP_ID

  const q = getQuery(event)
  const jenjangRaw = String(q.jenjang || 'smk').toLowerCase()
  const jenjang = ['smk', 'smp', 'yayasan'].includes(jenjangRaw) ? jenjangRaw : 'smk'

  // Tanpa token: SMK pakai fallback terkurasi, lainnya kosong (section disembunyikan)
  if (!accessToken) {
    return {
      status: 'success',
      isLive: false,
      source: 'curated_fallback',
      message: 'Meta Instagram Token belum diset di .env.',
      appIdConfigured: Boolean(appId),
      jenjang,
      username: jenjang === 'smk' ? 'smkit.attaqwa9' : jenjang === 'smp' ? 'smpitbca_official' : null,
      data: jenjang === 'smk' ? FALLBACK_POSTS : []
    }
  }

  const tersimpan = cacheFeed.get(jenjang)
  if (tersimpan && (Date.now() - tersimpan.timestamp < CACHE_TTL_MS)) {
    return {
      status: 'success',
      isLive: true,
      source: 'meta_api_cache',
      appIdConfigured: Boolean(appId),
      jenjang,
      username: tersimpan.username,
      data: tersimpan.data
    }
  }

  try {
    if (jenjang === 'yayasan') {
      const hasil = await Promise.all(
        Object.values(PETA_JENJANG).map((p) => ambilFeedAkun(p.pageId, accessToken).catch(() => null))
      )
      const gabung = hasil
        .filter((h): h is NonNullable<typeof h> => Boolean(h))
        .flatMap((h) => h.items)
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
        .slice(0, 8)
      if (!gabung.length) throw new Error('Kedua akun IG gagal dibaca')
      cacheFeed.set(jenjang, { data: gabung, username: '', timestamp: Date.now() })
      return {
        status: 'success',
        isLive: true,
        source: 'meta_api',
        appIdConfigured: Boolean(appId),
        jenjang,
        username: null,
        data: gabung
      }
    }

    const peta = PETA_JENJANG[jenjang]
    const { username, items } = await ambilFeedAkun(peta.pageId, accessToken)
    cacheFeed.set(jenjang, { data: items, username, timestamp: Date.now() })
    return {
      status: 'success',
      isLive: true,
      source: 'meta_api',
      appIdConfigured: Boolean(appId),
      jenjang,
      username,
      data: items
    }
  } catch (err: any) {
    console.warn('[Instagram API] Gagal fetch Meta API:', err?.message || err)
  }

  return {
    status: 'success',
    isLive: false,
    source: 'curated_fallback',
    message: 'Gagal menghubungi Meta API atau Token Expired.',
    appIdConfigured: Boolean(appId),
    jenjang,
    username: jenjang === 'smk' ? 'smkit.attaqwa9' : jenjang === 'smp' ? 'smpitbca_official' : null,
    data: jenjang === 'smk' ? FALLBACK_POSTS : []
  }
})
