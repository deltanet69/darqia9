<template>
  <aside id="sidebar" :class="{ open }">
    <div class="sb-brand" :style="{ borderBottom: '2px solid ' + (grade === 'SMP' ? '#16a34a' : '#2563eb') }">
      <img src="/asset/logo.png" class="sb-logo" :alt="'Logo ' + schoolName">
      <div class="sb-txt">
        <b>{{ schoolName }}</b>
        <span :style="{ color: grade === 'SMP' ? '#16a34a' : '#3b82f6', fontWeight: 600, fontSize: '11px' }">
          {{ grade }} &bull; Admin Portal
        </span>
      </div>
    </div>
    
    <nav id="sb-nav">
      <div v-for="group in adminNavigation" :key="group.group" class="nav-group">
        <span>{{ group.group }}</span>
        <NuxtLink v-for="item in group.items" :key="item.id" :to="adminPath(item.id)" class="nav-item" active-class="active" exact-active-class="active" :title="item.t" @click="$emit('close')">
          <span class="ic"><AdminIcon :name="item.icon" size="19" /></span>
          <span class="lbl">{{ item.t }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </NuxtLink>
      </div>
      
      <div class="nav-group">
        <span>Akun</span>
        <NuxtLink to="/admin/profile" class="nav-item" active-class="active" exact-active-class="active" title="Profil Saya" @click="$emit('close')">
          <span class="ic"><AdminIcon name="idcard" size="19" /></span>
          <span class="lbl">Profil Saya</span>
        </NuxtLink>
      </div>
    </nav>
    
    <div class="sb-foot">
      <div class="sb-user">
        <span class="avatar">AD</span>
        <div class="u-txt">
          <b>Administrator</b>
          <span>Super Admin</span>
        </div>
        <button class="logout-btn" type="button" title="Keluar" aria-label="Keluar" @click="logout">
          <span class="ic"><AdminIcon name="logout" size="16" /></span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { adminNavigation } from '~/composables/useAdminNavigation'
import { useAdminGrade } from '~/composables/useAdminGrade'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const router = useRouter()
const grade = useAdminGrade()

const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9')

const adminPath = (id: string) => id === 'dashboard' ? '/admin' : `/admin/${id}`
const logout = () => router.push('/admin/login')
</script>


