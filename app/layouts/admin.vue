<script setup lang="ts">
import { ref } from 'vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminTopbar from '~/components/admin/AdminTopbar.vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { adminMobileNavigation } from '~/composables/useAdminNavigation'
import { useAdminGrade } from '~/composables/useAdminGrade'

const grade = useAdminGrade()
const sidebarMin = ref(false)
const sidebarOpen = ref(false)

const adminPath = (id: string) => id === 'dashboard' ? '/admin' : `/admin/${id}`

const toggleSidebar = () => {
  if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    sidebarMin.value = !sidebarMin.value
  }
}
</script>

<template>
  <div class="admin-shell no-scrollbar min-h-screen bg-[#EEF2F7] text-[#0F172A] font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white">
    <!-- Backdrop Overlay for Mobile Sidebar -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
      @click="sidebarOpen = false"
    />

    <div class="flex flex-1 w-full min-h-screen">
      <!-- Admin Sidebar -->
      <AdminSidebar
        :open="sidebarOpen"
        :minimized="sidebarMin"
        @close="sidebarOpen = false"
      />

      <!-- Main Application Container -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-300 pb-20 lg:pb-8"
        :class="sidebarMin ? 'lg:pl-20' : 'lg:pl-64'"
      >
        <AdminTopbar @toggle-menu="toggleSidebar" />
        
        <main class="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1500px] w-full mx-auto">
          <slot />
        </main>
      </div>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden flex items-center justify-around py-2 px-3 shadow-lg">
      <NuxtLink
        v-for="item in adminMobileNavigation"
        :key="item.id"
        :to="adminPath(item.id)"
        class="flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-all"
        :class="$route.path === adminPath(item.id) ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'"
      >
        <AdminIcon :name="item.icon" size="20" />
        <span>{{ item.t }}</span>
      </NuxtLink>
      
      <button
        type="button"
        class="flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
        @click="sidebarOpen = true"
      >
        <AdminIcon name="menu" size="20" />
        <span>Menu</span>
      </button>
    </nav>
  </div>
</template>
