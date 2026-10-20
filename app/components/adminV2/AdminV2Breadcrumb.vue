<script setup lang="ts">
import AdminV2Icon from './AdminV2Icon.vue'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
  badge?: string
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  badge: '',
  jenjang: 'smk'
})
</script>

<template>
  <!-- SUB NAVBAR KHUSUS BREADCRUMB (Desktop & Mobile: Sticky Sub-Navbar) -->
  <div class="w-full bg-white/95 backdrop-blur-md border-b border-[#E7EBF2] shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-colors">
    <div class="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-9 sm:h-10 lg:h-11 flex items-center justify-between gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar">
      <!-- Breadcrumb Links -->
      <nav class="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-[#667085] whitespace-nowrap shrink-0" aria-label="Breadcrumb">
        <template v-for="(item, idx) in items" :key="idx">
          <!-- Item pertama (Portal Admin) dengan Icon Arrow Right -->
          <div v-if="idx === 0" class="flex items-center gap-1.5 shrink-0">
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="hover:text-[#1B5FD9] transition-colors flex items-center gap-1 sm:gap-1.5 group shrink-0"
            >
              <AdminV2Icon name="arrow" :size="12" class="text-[#1B5FD9] group-hover:translate-x-0.5 transition-transform shrink-0" />
              <span>{{ item.label }}</span>
            </NuxtLink>
            <div v-else class="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <AdminV2Icon name="arrow" :size="12" class="text-[#1B5FD9] shrink-0" />
              <span class="text-[#344054]">{{ item.label }}</span>
            </div>
          </div>

          <!-- Item berikutnya -->
          <div v-else class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span class="text-[#98A2B3] text-[10px] sm:text-[11px] font-normal select-none">/</span>
            
            <!-- Segmen terakhir (Halaman aktif) -->
            <span
              v-if="idx === items.length - 1"
              class="text-[#1B5FD9] font-bold"
              aria-current="page"
            >
              {{ item.label }}
            </span>

            <!-- Segmen perantara (Dengan Link) -->
            <NuxtLink
              v-else-if="item.to"
              :to="item.to"
              class="hover:text-[#1B5FD9] transition-colors"
            >
              {{ item.label }}
            </NuxtLink>

            <!-- Segmen perantara (Tanpa Link / Kategori) -->
            <span v-else class="text-[#344054]">
              {{ item.label }}
            </span>
          </div>
        </template>
      </nav>

      <!-- Badge Jenjang & Meta Info Kanan (Informatif di Sub Navbar) -->
      <div v-if="badge" class="flex items-center gap-2 shrink-0 ml-auto pl-2">
        <span class="text-[11px] text-[#98A2B3] font-medium hidden xl:inline">Tahun Ajaran 2026/2027</span>
        <span class="w-1 h-1 rounded-full bg-[#CBD5E1] hidden xl:inline" />
        <span
          class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-bold tracking-tight border shrink-0"
          :class="jenjang === 'smp'
            ? 'bg-[#E7F6ED] text-[#166534] border-[#A6E9C5]'
            : 'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]'"
        >
          {{ badge }}
        </span>
      </div>
    </div>
  </div>
</template>
