<script setup lang="ts">
import { computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { adminNavigation } from '~/composables/useAdminNavigation'
import { useAdminGrade } from '~/composables/useAdminGrade'

defineProps<{
  open: boolean
  minimized?: boolean
}>()

defineEmits<{ close: [] }>()

const router = useRouter()
const grade = useAdminGrade()

const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9')
const adminPath = (id: string) => id === 'dashboard' ? '/admin' : `/admin/${id}`

const logout = () => {
  if (confirm('Keluar dari Admin Portal?')) {
    router.push('/admin/login')
  }
}
</script>

<template>
  <aside
    class="fixed top-0 bottom-0 left-0 z-50 bg-gradient-to-b from-[#0A1F44] to-[#071633] text-slate-300 flex flex-col justify-between transition-all duration-300 shadow-2xl lg:shadow-none border-r border-white/5"
    :class="[
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      minimized ? 'lg:w-20' : 'lg:w-64 w-72'
    ]"
  >
    <!-- Brand Header -->
    <div class="p-4 sm:p-5 flex items-center gap-3 border-b border-white/10">
      <div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
        <img src="/asset/logo.png" class="w-full h-full object-contain" :alt="'Logo ' + schoolName">
      </div>
      <div v-show="!minimized" class="min-w-0">
        <b class="block text-sm font-bold text-white truncate leading-tight tracking-wide">{{ schoolName }}</b>
        <span
          class="text-[11px] font-semibold tracking-wider uppercase block mt-0.5 text-blue-300"
        >
          {{ grade }} &bull; ADMIN PORTAL
        </span>
      </div>
    </div>
    
    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div v-for="group in adminNavigation" :key="group.group" class="space-y-1">
        <span v-show="!minimized" class="block px-3 text-[10.5px] font-bold uppercase tracking-widest text-[#5B7BB0] mb-1.5">
          {{ group.group }}
        </span>
        
        <NuxtLink
          v-for="item in group.items"
          :key="item.id"
          :to="adminPath(item.id)"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[13.5px] transition-all duration-150 group relative"
          :class="$route.path === adminPath(item.id) 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-600/30' 
            : 'text-[#AEBFDA] hover:bg-white/5 hover:text-white'"
          :title="item.t"
          @click="$emit('close')"
        >
          <span class="shrink-0 opacity-90">
            <AdminIcon :name="item.icon" size="18" />
          </span>
          <span v-show="!minimized" class="truncate flex-1">{{ item.t }}</span>
          <span
            v-if="item.badge && !minimized"
            class="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500 text-white shadow-sm"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>
      
      <!-- Akun Group -->
      <div class="space-y-1">
        <span v-show="!minimized" class="block px-3 text-[10.5px] font-bold uppercase tracking-widest text-[#5B7BB0] mb-1.5">
          Akun
        </span>
        <NuxtLink
          to="/admin/profile"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[13.5px] transition-all duration-150"
          :class="$route.path === '/admin/profile' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-600/30' 
            : 'text-[#AEBFDA] hover:bg-white/5 hover:text-white'"
          title="Profil Saya"
          @click="$emit('close')"
        >
          <span class="shrink-0 opacity-90"><AdminIcon name="idcard" size="18" /></span>
          <span v-show="!minimized" class="truncate">Profil Saya</span>
        </NuxtLink>
      </div>
    </nav>
    
    <!-- Sidebar Footer with User Card -->
    <div class="p-3 border-t border-white/10 bg-black/20">
      <div class="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <span class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
          AD
        </span>
        <div v-show="!minimized" class="flex-1 min-w-0">
          <b class="block text-xs font-bold text-white truncate">Administrator</b>
          <span class="block text-[11px] text-[#7EA6E8] truncate">Super Admin</span>
        </div>
        <button
          class="p-1.5 rounded-lg text-[#7EA6E8] hover:text-white hover:bg-white/10 transition-colors"
          type="button"
          title="Keluar"
          aria-label="Keluar"
          @click="logout"
        >
          <AdminIcon name="logout" size="16" />
        </button>
      </div>
    </div>
  </aside>
</template>
