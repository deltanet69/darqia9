<script setup lang="ts">
import { computed } from 'vue'
import AdminLayout from '~/layouts/admin.vue'
import AdminBlankLayout from '~/layouts/admin-blank.vue'

const route = useRoute()

const isAdminLogin = computed(() => route.path === '/admin/login')
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
</script>

<template>
  <AdminBlankLayout v-if="isAdminLogin">
    <NuxtPage />
  </AdminBlankLayout>

  <AdminLayout v-else-if="isAdminRoute">
    <NuxtPage />
  </AdminLayout>

  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>
