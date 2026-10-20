<script setup lang="ts">
import AdminV2Icon from './AdminV2Icon.vue'

interface Props {
  announcements: Array<[string, string, string, string]>
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'view-all'): void
  (e: 'click-item', title: string): void
}>()
</script>

<template>
  <section class="h-full flex flex-col justify-between bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)]">
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[15px] font-extrabold text-[#101828]">Pengumuman</h3>
        <button
          type="button"
          class="text-xs font-bold transition flex items-center gap-1 p-0"
          :class="jenjang === 'smp' ? 'text-[#16A34A] hover:text-[#14532D]' : 'text-[#1B5FD9] hover:text-[#0A2A5C]'"
          @click="emit('view-all')"
        >
          <span>Semua</span>
          <AdminV2Icon name="chev" :size="13" class="-rotate-90" />
        </button>
      </div>

      <div class="flex flex-col divide-y divide-[#EFF2F7]">
        <div
          v-for="([icon, title, desc, time], idx) in announcements"
          :key="idx"
          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-[#F8FAFD] rounded-lg px-1 transition cursor-pointer"
          @click="emit('click-item', title)"
        >
          <span
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon :name="icon" :size="17" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-[13px] font-bold text-[#101828] block truncate">{{ title }}</b>
            <span class="text-[11.5px] text-[#667085] block truncate mt-0.5">{{ desc }}</span>
          </div>
          <span class="ml-auto text-[10px] font-semibold text-[#98A2B3] whitespace-nowrap shrink-0">
            {{ time }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
