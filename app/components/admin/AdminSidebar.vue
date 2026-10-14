<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { adminNavigation, type AdminNavigationItem, type AdminSubItem } from '~/composables/useAdminNavigation'
import { useAdminGrade } from '~/composables/useAdminGrade'

const props = defineProps<{
  open: boolean
  minimized?: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const router = useRouter()
const grade = useAdminGrade()

const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9')

const expandedMenus = ref<Record<string, boolean>>({})

const isItemActive = (item: AdminNavigationItem) => {
  const targetPath = item.to || (item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`)
  if (targetPath === '/admin') return route.path === '/admin'
  return route.path === targetPath || route.path.startsWith(targetPath + '/')
}

const autoExpandActiveMenu = () => {
  adminNavigation.forEach(group => {
    group.items.forEach(item => {
      if (item.children && isItemActive(item)) {
        expandedMenus.value[item.id] = true
      }
    })
  })
}

watch(() => route.path, autoExpandActiveMenu, { immediate: true })

const toggleSubmenu = (item: AdminNavigationItem) => {
  if (props.minimized) {
    if (item.children && item.children.length > 0) {
      const matchChild = item.children.find(c => c.grade === grade.value) || item.children[0]
      if (matchChild.grade) grade.value = matchChild.grade
      router.push(matchChild.to)
    } else if (item.to) {
      router.push(item.to)
    }
    emit('close')
    return
  }
  expandedMenus.value[item.id] = !expandedMenus.value[item.id]
}

const isSubActive = (sub: AdminSubItem) => {
  const basePath = sub.to.split('?')[0]
  if (route.path !== basePath) return false
  if (sub.grade) {
    return grade.value === sub.grade
  }
  return true
}

const handleSubClick = (sub: AdminSubItem) => {
  if (sub.grade) {
    grade.value = sub.grade
  }
  emit('close')
}

const logout = async () => {
  if (confirm('Keluar dari Admin Portal?')) {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
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
        
        <div v-for="item in group.items" :key="item.id" class="space-y-1">
          <!-- Item with Submenus -->
          <div v-if="item.children && item.children.length > 0">
            <button
              type="button"
              class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-medium text-[13.5px] transition-all duration-150 group cursor-pointer text-left"
              :class="isItemActive(item)
                ? 'bg-white/10 text-white font-bold' 
                : 'text-[#AEBFDA] hover:bg-white/5 hover:text-white'"
              :title="item.t"
              @click="toggleSubmenu(item)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="shrink-0 opacity-90">
                  <AdminIcon :name="item.icon" size="18" />
                </span>
                <span v-show="!minimized" class="truncate">{{ item.t }}</span>
              </div>
              <div v-show="!minimized" class="flex items-center gap-1.5 shrink-0">
                <span
                  v-if="item.badge"
                  class="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500 text-white shadow-sm"
                >
                  {{ item.badge }}
                </span>
                <span
                  class="text-slate-400 transition-transform duration-200 inline-flex items-center"
                  :class="expandedMenus[item.id] ? 'rotate-180 text-white' : ''"
                >
                  <AdminIcon name="cdot" size="16" />
                </span>
              </div>
            </button>

            <!-- Collapsible Submenu List -->
            <div
              v-show="expandedMenus[item.id] && !minimized"
              class="pl-6 pr-1 py-1 space-y-1 transition-all"
            >
              <NuxtLink
                v-for="sub in item.children"
                :key="sub.id"
                :to="sub.to"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] transition-all duration-150 relative group"
                :class="isSubActive(sub)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-md shadow-blue-600/25'
                  : 'text-[#94A9C9] hover:bg-white/5 hover:text-white font-medium'"
                :title="sub.t"
                @click="handleSubClick(sub)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full transition-colors shrink-0"
                  :class="isSubActive(sub) ? 'bg-white' : 'bg-slate-500 group-hover:bg-slate-300'"
                />
                <span class="truncate flex-1">{{ sub.t }}</span>
                <span
                  v-if="sub.grade"
                  class="text-[9.5px] font-bold px-1.5 py-0.5 rounded font-mono uppercase"
                  :class="sub.grade === 'SMP' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-blue-500/30 text-blue-200'"
                >
                  {{ sub.grade }}
                </span>
              </NuxtLink>
            </div>
          </div>

          <!-- Single Item without Submenus -->
          <NuxtLink
            v-else
            :to="item.to || (item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`)"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[13.5px] transition-all duration-150 group relative"
            :class="isItemActive(item) 
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
      </div>
    </nav>
    
    <!-- Sidebar Footer with User Card (Clickable to /admin/profile) -->
    <div class="p-3 border-t border-white/10 bg-black/20">
      <div class="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <NuxtLink
          to="/admin/profile"
          class="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-85 transition-opacity"
          title="Lihat Profil Saya"
          @click="$emit('close')"
        >
          <span class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            AD
          </span>
          <div v-show="!minimized" class="flex-1 min-w-0">
            <b class="block text-xs font-bold text-white truncate">Administrator</b>
            <span class="block text-[11px] text-[#7EA6E8] truncate">Super Admin</span>
          </div>
        </NuxtLink>
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
