<template>
<!-- ======= FLOATING & ASSISTANCE ATTAQWA 9 ======= -->
<button :class="['fixed right-[24px] bottom-[max(96px,calc(84px+env(safe-area-inset-bottom,16px)))] w-[44px] h-[44px] rounded-[14px] bg-navy text-white grid place-items-center shadow-sh-lg transition-all duration-250 z-[55]', showToTop ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-[12px]']" @click="scrollToTop" aria-label="Kembali ke atas">
  <IconsAnimatedChevUp size="20px"/>
</button>

<div class="fixed right-[20px] bottom-[max(20px,calc(14px+env(safe-area-inset-bottom,14px)))] z-[65] flex flex-col items-end gap-[8px] pointer-events-none [&>*]:pointer-events-auto">
  <div class="bg-white text-[#0F2042] text-[12px] font-bold py-[7px] px-[14px] rounded-[12px] shadow-[0_8px_24px_rgba(8,26,58,.18)] border border-[rgba(15,32,66,.08)] flex items-center gap-[6px] animate-[aiBubbleBounce_4s_ease-in-out_infinite] whitespace-nowrap cursor-pointer" role="button" tabindex="0" aria-label="Tanya Assistance Attaqwa 9" @click="toggleChat">
    <span>🤖 Butuh info pendaftaran?</span>
    <span class="bg-[#FEF3C7] text-[#92400E] text-[10.5px] py-[2px] px-[7px] rounded-[6px] font-extrabold">Tanya AI</span>
  </div>
  <button class="flex items-center gap-[12px] bg-gradient-to-br from-[#0B2B64] to-[#081A3A] text-white border-[1.5px] border-[rgba(240,180,41,.45)] py-[7px] pr-[16px] pl-[8px] rounded-full shadow-[0_12px_32px_rgba(8,26,58,.45),0_0_20px_rgba(240,180,41,.25)] cursor-pointer transition-all duration-[280ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_16px_38px_rgba(8,26,58,.55),0_0_28px_rgba(240,180,41,.4)] hover:border-[#F0B429]" aria-label="Buka Assistance Attaqwa 9" @click="toggleChat">
    <div class="relative w-[44px] h-[44px] rounded-full bg-[radial-gradient(circle,#2563EB_0%,#0F3277_100%)] flex items-center justify-center shadow-[inset_0_2px_6px_rgba(255,255,255,.3)] shrink-0">
      <img src="/asset/ai.png" alt="Assistance Attaqwa 9 Mascot" class="w-[42px] h-[42px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,.35)] animate-[aiFloatBob_3s_ease-in-out_infinite]">
      <span class="absolute bottom-0 right-0 w-[12px] h-[12px] bg-[#10B981] border-[2.5px] border-[#081A3A] rounded-full after:content-[''] after:absolute after:-inset-[2px] after:rounded-full after:border-[2px] after:border-[#10B981] after:animate-[aiPulseRing_2s_cubic-bezier(0.24,0,0.38,1)_infinite]"></span>
    </div>
    <div class="flex flex-col text-left">
      <span class="text-[10px] font-extrabold uppercase tracking-[.6px] text-[#F0B429] flex items-center gap-[4px]"><IconsAnimatedSparkle size="14px" /> AI Assistant</span>
      <span class="text-[13.5px] font-bold text-white leading-[1.2]">Darqia Attaqwa</span>
    </div>
  </button>
</div>

<!-- ======= AI ASSISTANT CHAT DRAWER ======= -->
<div :class="['fixed right-[20px] bottom-[max(88px,calc(74px+env(safe-area-inset-bottom,16px)))] w-[min(390px,calc(100vw-32px))] h-[min(570px,calc(100vh-110px))] bg-white rounded-[22px] shadow-[0_24px_60px_rgba(8,26,58,.35),0_0_0_1px_rgba(15,32,66,.08)] flex flex-col overflow-hidden z-[70] origin-bottom-right transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]', chatOpen ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-[18px] scale-95']" role="dialog" aria-modal="true" aria-label="Assistance Attaqwa 9 Chat">
  <div class="bg-gradient-to-br from-[#0B2B64] to-[#0F3277] text-white py-[14px] px-[16px] flex items-center justify-between border-b border-white/10">
    <div class="flex items-center gap-[10px]">
      <div class="w-[40px] h-[40px] rounded-[12px] bg-[radial-gradient(circle,#3B82F6_0%,#1D4ED8_100%)] flex items-center justify-center overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,.25)] shrink-0">
        <img src="/asset/ai.png" alt="Assistance Attaqwa 9" class="w-[38px] h-[38px] object-contain">
      </div>
      <div class="flex flex-col">
        <h4 class="text-[14.5px] font-bold text-white m-0 flex items-center gap-[6px]">{{ settings.botName }}</h4>
        <p class="text-[11px] text-[#93C5FD] m-0 mt-[2px] flex items-center gap-[5px]"><span class="w-[7px] h-[7px] bg-[#10B981] rounded-full inline-block"></span> {{ settings.botRole }}</p>
      </div>
    </div>
    <button class="bg-white/12 border-none text-white w-[30px] h-[30px] rounded-[9px] grid place-items-center cursor-pointer transition-colors duration-200 hover:bg-white/25" aria-label="Tutup Chat" @click="closeChat"><IconsAnimatedX size="16px"/></button>
  </div>
  
  <div class="flex-1 p-[14px] overflow-y-auto flex flex-col gap-[12px] bg-[#F8FAFC]" ref="chatBody">
    <div v-for="(msg, i) in messages" :key="i" :class="['flex gap-[8px] max-w-[92%] items-end', msg.type === 'bot' ? 'self-start' : 'self-end flex-row-reverse']">
      <div v-if="msg.type === 'bot'" class="w-[28px] h-[28px] rounded-full bg-[#0B2B64] flex items-center justify-center shrink-0 overflow-hidden">
        <img src="/asset/ai.png" alt="AI" class="w-[26px] h-[26px] object-contain">
      </div>
      <div :class="['py-[10px] px-[13px] rounded-[15px] text-[12.5px] leading-[1.45] shadow-[0_2px_6px_rgba(0,0,0,.03)]', msg.type === 'bot' ? 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-[3px]' : 'bg-[#0F3277] text-white rounded-br-[3px]']">
        <div v-if="msg.html" v-html="msg.html"></div>
        <div v-else>{{ msg.text }}</div>

        <div v-if="msg.btnText && msg.btnLink" class="mt-[8px]">
          <a :href="msg.btnLink" class="inline-flex items-center gap-[6px] bg-gradient-to-br from-[#F0B429] to-[#F59E0B] text-[#1F2937] font-bold text-[11.5px] py-[6px] px-[12px] rounded-[8px] no-underline shadow-[0_4px_10px_rgba(245,158,11,.25)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(245,158,11,.35)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span>{{ msg.btnText }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Typing Indicator -->
    <div v-if="isTyping" class="flex gap-[8px] max-w-[92%] items-end self-start">
      <div class="w-[28px] h-[28px] rounded-full bg-[#0B2B64] flex items-center justify-center shrink-0 overflow-hidden">
        <img src="/asset/ai.png" alt="AI" class="w-[26px] h-[26px] object-contain">
      </div>
      <div class="py-[10px] px-[13px] rounded-[15px] rounded-bl-[3px] text-[12.5px] leading-[1.45] bg-white text-[#64748B] border border-[#E2E8F0] italic shadow-[0_2px_6px_rgba(0,0,0,.03)]">
        🤖 Mengetik jawaban...
      </div>
    </div>
  </div>

  <div class="py-[8px] px-[12px] bg-white border-t border-[#EEF2F6] flex gap-[6px] overflow-x-auto scrollbar-hide">
    <button 
      v-for="sug in activeSuggestions" 
      :key="sug.id"
      class="shrink-0 bg-[#EFF6FF] border border-[#DBEAFE] text-[#1D4ED8] text-[11px] font-semibold py-[5px] px-[10px] rounded-full cursor-pointer transition-colors duration-200 select-none hover:bg-[#DBEAFE] hover:border-[#93C5FD]" 
      @click="ask(sug.topic)"
    >
      {{ sug.label }}
    </button>
  </div>

  <form class="py-[10px] px-[12px] bg-white border-t border-[#E2E8F0] flex gap-[8px] items-center" @submit.prevent="sendMessage">
    <input type="text" v-model="chatInput" class="flex-1 border border-[#CBD5E1] rounded-[10px] py-[8px] px-[11px] text-[12.5px] outline-none font-inherit transition-all duration-200 focus:border-[#2563EB] focus:ring-[2.5px] focus:ring-[#2563EB]/15" placeholder="Tanya info SPMB, jurusan, biaya..." autocomplete="off">
    <button type="submit" class="w-[36px] h-[36px] bg-[#0F3277] text-white border-none rounded-[10px] grid place-items-center cursor-pointer transition-colors duration-200 shrink-0 hover:bg-[#0B2B64]" aria-label="Kirim Pesan"><IconsAnimatedSend size="18px" /></button>
  </form>
</div>

<!-- ======= MODAL ======= -->
<div :class="['fixed inset-0 z-[80] grid place-items-center p-[18px] transition-all duration-250', modalOpen ? 'opacity-100 visible' : 'opacity-0 invisible']" role="dialog" aria-modal="true">
  <div class="absolute inset-0 bg-[#08142D]/60 backdrop-blur-[4px]" @click="closeModal"></div>
  <div :class="['relative bg-white rounded-[22px] max-w-[560px] w-full max-h-[86vh] overflow-y-auto p-[30px] transition-all duration-250 shadow-sh-lg', modalOpen ? 'translate-y-0 scale-100' : 'translate-y-[18px] scale-98']">
    <button class="absolute top-[16px] right-[16px] w-[38px] h-[38px] rounded-[11px] bg-bg grid place-items-center transition-colors hover:bg-gray-200" @click="closeModal" aria-label="Tutup"><IconsAnimatedX size="16px"/></button>
    <div id="mContent"></div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { ChatMessage } from '~/types/chatbot'

const { settings, suggestions, matchAnswer } = useChatbot()

const showToTop = ref(false)
const chatOpen = ref(false)
const modalOpen = ref(false)
const chatBody = ref<HTMLElement | null>(null)
const chatInput = ref('')
const isTyping = ref(false)

const activeSuggestions = computed(() => {
  return [...suggestions.value]
    .filter(s => s.isActive)
    .sort((a, b) => a.order - b.order)
})

const messages = ref<ChatMessage[]>([
  {
    type: 'bot',
    html: settings.value.welcomeMessage,
    btnText: settings.value.welcomeActionText,
    btnLink: settings.value.welcomeActionLink
  }
])

const handleScroll = () => {
  showToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleChat = () => {
  chatOpen.value = !chatOpen.value
}

const openChat = () => {
  chatOpen.value = true
}

const closeChat = () => {
  chatOpen.value = false
}

const closeModal = () => {
  modalOpen.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  })
}

const handleQuery = (queryKeyOrText: string) => {
  const result = matchAnswer(queryKeyOrText)
  if (!result) return

  messages.value.push({ type: 'user', text: result.userDisplay })
  scrollToBottom()

  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      type: 'bot',
      html: result.text,
      btnText: result.btnText,
      btnLink: result.btnLink
    })
    scrollToBottom()
  }, 400)
}

const sendMessage = () => {
  const val = chatInput.value.trim()
  if (!val) return
  chatInput.value = ''
  handleQuery(val)
}

const ask = (topic: string) => {
  handleQuery(topic)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
