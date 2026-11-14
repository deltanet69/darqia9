<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminGrade } from '~/composables/useAdminGrade'
import type { PeranModul } from '~/composables/useModulPembelajaran'

const props = defineProps<{ crumb?: string; judul?: string }>()
useHead({ title: `${props.judul || 'Modul Pembelajaran'} | Admin Portal` })

const grade = useAdminGrade()
const jenjang = computed<'smp' | 'smk'>({ get: () => grade.value.toLowerCase() as 'smp' | 'smk', set: value => { grade.value = value.toUpperCase() as 'SMP' | 'SMK' } })
// Peran modul dari RBAC: Superadmin = CRUD penuh; peran non-guru yang boleh mengubah modul = penyetuju; guru = sunting modul sendiri.
const rbac = useRbac()
const role = computed<PeranModul>(() => rbac.adalahSuperadmin.value
  ? 'superadmin'
  : !rbac.modeGuru.value && rbac.bisaSaya('Modul Pembelajaran', 'ubah') && rbac.penegakanAktif.value ? 'admin_tu' : 'guru')
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)
const tutupPopovers = () => { isSearchOpen.value = false; isNotifOpen.value = false; isProfileOpen.value = false }
const toggleSearch = () => { const buka = isSearchOpen.value; tutupPopovers(); isMegaOpen.value = false; isSearchOpen.value = !buka }
const toggleNotif = () => { const buka = isNotifOpen.value; tutupPopovers(); isMegaOpen.value = false; isNotifOpen.value = !buka }
const toggleProfile = () => { const buka = isProfileOpen.value; tutupPopovers(); isMegaOpen.value = false; isProfileOpen.value = !buka }
const selectModule = async (title: string) => { isMegaOpen.value = false; isMobileMenuOpen.value = false; await navigateTo(getAdminDestination(title)) }

const crumbs = computed(() => {
  const dasar = [
    { label: 'Portal Admin', to: '/adminV2' },
    { label: 'Kepegawaian' },
    { label: 'Modul Pembelajaran', to: '/adminV2/modul-ajar' }
  ]
  return props.crumb ? [...dasar, { label: props.crumb }] : dasar
})
</script>

<template>
  <div class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans antialiased pb-24 lg:pb-8">
    <div class="sticky top-0 z-50">
      <AdminV2Header :jenjang="jenjang" role="superadmin":groups="GROUPS" current-route="kepegawaian" :active-group-id="activeMegaGroup?.id" :is-mega-open="isMegaOpen" @update:jenjang="jenjang = $event" @toggle-mega="group => { activeMegaGroup = group; isMegaOpen = !isMegaOpen }" @open-mobile-menu="isMobileMenuOpen = true" @toggle-search="toggleSearch" @toggle-notif="toggleNotif" @toggle-profile="toggleProfile" />
      <AdminV2Breadcrumb :items="crumbs" :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'" :jenjang="jenjang" />
      <AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen = false" @select-item="selectModule" />
    </div>
    <main class="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 lg:px-8">
      <slot :jenjang="grade" :role="role" />
    </main>
    <AdminV2MobileMenu :open="isMobileMenuOpen" role="superadmin":groups="GROUPS" :jenjang="jenjang" @close="isMobileMenuOpen = false" @select-item="selectModule" />
    <AdminV2Popovers :is-notif-open="isNotifOpen" :is-profile-open="isProfileOpen" :is-search-open="isSearchOpen" role="superadmin":jenjang="jenjang" @close-all="tutupPopovers" @item-click="tutupPopovers" />
  </div>
</template>
