<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import WebsiteContentManager from '~/components/adminV2/WebsiteContentManager.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: false })
useHead({ title: 'Konten Website | Admin Portal' })

const grade = useAdminGrade()
const jenjang = computed<'smp' | 'smk'>({ get: () => grade.value.toLowerCase() as 'smp' | 'smk', set: value => { grade.value = value.toUpperCase() as 'SMP' | 'SMK' } })
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const selectModule = async (title: string) => { isMegaOpen.value = false; isMobileMenuOpen.value = false; await navigateTo(getAdminDestination(title)) }
</script>

<template>
  <div class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans antialiased pb-24 lg:pb-8">
    <div class="sticky top-0 z-50">
      <AdminV2Header :jenjang="jenjang" :role="role" :groups="GROUPS" current-route="aplikasi" :active-group-id="activeMegaGroup?.id" :is-mega-open="isMegaOpen" @update:jenjang="jenjang = $event" @toggle-mega="group => { activeMegaGroup = group; isMegaOpen = !isMegaOpen }" @open-mobile-menu="isMobileMenuOpen = true" />
      <AdminV2Breadcrumb :items="[{ label: 'Portal Admin', to: '/adminV2' }, { label: 'Aplikasi' }, { label: 'Konten Website' }]" :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'" :jenjang="jenjang" />
      <AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen = false" @select-item="selectModule" />
    </div>
    <main class="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8"><WebsiteContentManager /></main>
    <AdminV2MobileMenu :open="isMobileMenuOpen" :role="role" :groups="GROUPS" :jenjang="jenjang" @close="isMobileMenuOpen = false" @select-item="selectModule" />
  </div>
</template>
