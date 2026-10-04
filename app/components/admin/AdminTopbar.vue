<template>
  <header id="topbar">
    <button id="btn-menu" type="button" aria-label="Menu" @click="$emit('toggle-menu')">
      <span class="ic"><AdminIcon name="menu" size="20" /></span>
    </button>
    
    <div class="tb-title">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    
    <div class="tb-actions">
      <!-- Grade Switcher -->
      <div class="grade-switcher">
        <button
          type="button"
          class="gs-btn"
          :class="{ 'gs-active-smp': grade === 'SMP' }"
          @click="grade = 'SMP'"
        >SMP</button>
        <button
          type="button"
          class="gs-btn"
          :class="{ 'gs-active-smk': grade === 'SMK' }"
          @click="grade = 'SMK'"
        >SMK</button>
      </div>

      <div class="tb-search">
        <span class="ic"><AdminIcon name="search" size="16" /></span>
        <input placeholder="Cari siswa, guru, pengguna..." autocomplete="off">
      </div>
      
      <button class="icon-btn" type="button" aria-label="Notifikasi">
        <span class="ic"><AdminIcon name="bell" size="18" /></span>
        <span class="dot" />
      </button>
      
      <button class="tb-avatar" type="button" aria-label="Profil Administrator">AD</button>
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

<style scoped>
.grade-switcher {
  display: flex;
  background: var(--line-2);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.gs-btn {
  padding: 5px 14px;
  font-size: 12.5px;
  font-weight: 700;
  border-radius: 6px;
  color: var(--muted);
  background: transparent;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}
.gs-active-smp {
  background: #16a34a;
  color: #fff;
  box-shadow: 0 1px 4px rgba(22,163,74,.35);
}
.gs-active-smk {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 1px 4px rgba(37,99,235,.35);
}
</style>
