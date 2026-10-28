<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

interface Props {
  name: string
  size?: number | string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  size: 18,
  class: ''
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="props.class"
    aria-hidden="true"
  >
    <!-- i-shield -->
    <template v-if="name === 'i-shield' || name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </template>

    <!-- i-menu -->
    <template v-else-if="name === 'i-menu' || name === 'menu'">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="16" y2="17" />
    </template>

    <!-- i-search -->
    <template v-else-if="name === 'i-search' || name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </template>

    <!-- i-bell -->
    <template v-else-if="name === 'i-bell' || name === 'bell'">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </template>

    <!-- i-chev -->
    <template v-else-if="name === 'i-chev' || name === 'chev'">
      <polyline points="6 9 12 15 18 9" />
    </template>

    <!-- i-grid -->
    <template v-else-if="name === 'i-grid' || name === 'grid'">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </template>

    <!-- i-cal -->
    <template v-else-if="name === 'i-cal' || name === 'cal'">
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </template>

    <!-- i-mail -->
    <template v-else-if="name === 'i-mail' || name === 'mail'">
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="M22 7l-10 6L2 7" />
    </template>

    <!-- i-doc -->
    <template v-else-if="name === 'i-doc' || name === 'doc'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </template>

    <!-- i-user / user -->
    <template v-else-if="name === 'i-user' || name === 'user'">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </template>

    <!-- i-users -->
    <template v-else-if="name === 'i-users' || name === 'users'">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </template>

    <!-- i-layers -->
    <template v-else-if="name === 'i-layers' || name === 'layers'">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </template>

    <!-- i-gear -->
    <template v-else-if="name === 'i-gear' || name === 'gear'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </template>

    <!-- i-swap -->
    <template v-else-if="name === 'i-swap' || name === 'swap'">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </template>

    <!-- i-plus -->
    <template v-else-if="name === 'i-plus' || name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </template>

    <!-- i-wallet -->
    <template v-else-if="name === 'i-wallet' || name === 'wallet'">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </template>

    <!-- i-chart -->
    <template v-else-if="name === 'i-chart' || name === 'chart'">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </template>

    <!-- i-check -->
    <template v-else-if="name === 'i-check' || name === 'check'">
      <polyline points="20 6 9 17 4 12" stroke-width="2.5" />
    </template>

    <!-- i-dots -->
    <template v-else-if="name === 'i-dots' || name === 'dots'">
      <circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none" />
    </template>

    <!-- i-filter -->
    <template v-else-if="name === 'i-filter' || name === 'filter'">
      <polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3" />
    </template>

    <!-- i-x -->
    <template v-else-if="name === 'i-x' || name === 'x'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </template>

    <!-- i-book -->
    <template v-else-if="name === 'i-book' || name === 'book'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </template>

    <!-- i-bank -->
    <template v-else-if="name === 'i-bank' || name === 'bank'">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </template>

    <!-- i-clock -->
    <template v-else-if="name === 'i-clock' || name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </template>

    <!-- i-home -->
    <template v-else-if="name === 'i-home' || name === 'home'">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </template>

    <!-- i-out -->
    <template v-else-if="name === 'i-out' || name === 'out'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </template>

    <!-- i-dl / download -->
    <template v-else-if="name === 'i-dl' || name === 'dl' || name === 'download'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </template>

    <!-- screen / monitor -->
    <template v-else-if="name === 'screen' || name === 'i-screen' || name === 'monitor' || name === 'i-monitor'">
      <rect x="2" y="3" width="20" height="15" rx="2" />
      <path d="M8 22h8m-4-4v4" />
    </template>

    <!-- arrow (right) -->
    <template v-else-if="name === 'arrow' || name === 'arrow-right' || name === 'i-arrow'">
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </template>

    <!-- back (arrow left) -->
    <template v-else-if="name === 'back' || name === 'i-back'">
      <path d="M20 12H4m6 6-6-6 6-6" />
    </template>

    <!-- alert -->
    <template v-else-if="name === 'alert' || name === 'i-alert'">
      <path d="M12 3l10 18H2L12 3zm0 6v5m0 3h.01" />
    </template>

    <!-- moon -->
    <template v-else-if="name === 'moon' || name === 'i-moon'">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </template>

    <!-- copy -->
    <template v-else-if="name === 'copy' || name === 'i-copy'">
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </template>

    <!-- eye -->
    <template v-else-if="name === 'eye' || name === 'i-eye'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </template>

    <!-- pencil -->
    <template v-else-if="name === 'pencil' || name === 'i-pencil'">
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </template>

    <!-- trash -->
    <template v-else-if="name === 'trash' || name === 'i-trash'">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </template>

    <!-- upload -->
    <template v-else-if="name === 'upload' || name === 'i-upload'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </template>

    <!-- phone -->
    <template v-else-if="name === 'phone' || name === 'i-phone'">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />
    </template>

    <!-- wifi -->
    <template v-else-if="name === 'wifi' || name === 'i-wifi'">
      <path d="M5 12.9a11 11 0 0 1 14 0" />
      <path d="M8.5 16.4a6 6 0 0 1 7 0" />
      <path d="M2 9.4a15.5 15.5 0 0 1 20 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </template>

    <!-- info -->
    <template v-else-if="name === 'info' || name === 'i-info'">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </template>

    <!-- bldg / building -->
    <template v-else-if="name === 'bldg' || name === 'i-bldg' || name === 'building'">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
      <path d="M12 14h.01" />
    </template>

    <!-- printer -->
    <template v-else-if="name === 'printer' || name === 'i-printer'">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </template>

    <!-- database -->
    <template v-else-if="name === 'database' || name === 'i-database'">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </template>
  </svg>
</template>
