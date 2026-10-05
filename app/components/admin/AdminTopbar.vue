<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
    <!-- Mobile Hamburger & Title -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        type="button"
        aria-label="Menu"
        @click="$emit('toggle-menu')"
      >
        <AdminIcon name="menu" size="20" />
      </button>
      
      <div>
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">{{ title }}</h1>
        <p class="hidden sm:block text-xs text-slate-500 font-medium">{{ subtitle }}</p>
      </div>
    </div>
    
    <!-- Actions Row -->
    <div class="flex items-center gap-2.5 sm:gap-3.5">
      <!-- Grade Switcher (SMP / SMK) -->
      <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          type="button"
          class="px-3 py-1 text-xs font-extrabold rounded-lg transition-all"
          :class="grade === 'SMP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="grade = 'SMP'"
        >
          SMP
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-extrabold rounded-lg transition-all"
          :class="grade === 'SMK' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="grade = 'SMK'"
        >
          SMK
        </button>
      </div>

      <!-- Quick Search (Desktop) -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <AdminIcon name="search" size="16" class="text-slate-400" />
        <input
          placeholder="Cari data..."
          autocomplete="off"
          class="bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 outline-none w-36 lg:w-48"
        >
      </div>
      
      <!-- Notification Bell -->
      <button class="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" type="button" aria-label="Notifikasi">
        <AdminIcon name="bell" size="18" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
      </button>
      
      <!-- Avatar Badge -->
      <button class="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm" type="button" aria-label="Profil Administrator">
        AD
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { adminTitles } from '~/composables/useAdminNavigation'
import { useAdminGrade } from '~/composables/useAdminGrade'

defineEmits<{ 'toggle-menu': [] }>()

const route = useRoute()
const grade = useAdminGrade()

const key = computed(() => route.name?.toString().replace('admin-', '') || 'dashboard')
const title = computed(() => adminTitles[key.value]?.[0] || 'Dashboard')
const subtitle = computed(() => adminTitles[key.value]?.[1] || 'Ringkasan operasional sekolah')
</script>
