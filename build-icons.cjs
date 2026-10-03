const fs = require('fs');

let data = fs.readFileSync('icons.json', 'utf8');
data = data.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
data = data.replace(/'/g, '"');

const icons = JSON.parse(data);

const template = `<template>
  <svg v-if="icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="icon"></svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 }
})

const ICONS = ${JSON.stringify(icons, null, 2)}

const icon = computed(() => ICONS[props.name])
</script>
`;

fs.mkdirSync('app/components/admin', { recursive: true });
fs.writeFileSync('app/components/admin/AdminIcon.vue', template);
console.log('Done!');
