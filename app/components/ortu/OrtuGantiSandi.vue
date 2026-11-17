<template>
  <form novalidate @submit.prevent="kirim">
    <template v-if="!lamaAwal">
      <label for="sandi-lama" style="display:block;margin-top:14px;font-size:14px;color:#51607F">Kata sandi saat ini</label>
      <input id="sandi-lama" v-model="lama" class="fld" type="password" autocomplete="current-password" style="margin-top:6px">
    </template>
    <label for="sandi-baru" style="display:block;margin-top:14px;font-size:14px;color:#51607F">Kata sandi baru (minimal 8 karakter)</label>
    <input id="sandi-baru" v-model="baru" class="fld" type="password" autocomplete="new-password" style="margin-top:6px">
    <label for="sandi-ulang" style="display:block;margin-top:14px;font-size:14px;color:#51607F">Ulangi kata sandi baru</label>
    <input id="sandi-ulang" v-model="ulang" class="fld" type="password" autocomplete="new-password" style="margin-top:6px">
    <div v-if="galat" role="alert" style="margin-top:12px;padding:10px 14px;border-radius:14px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.4">{{ galat }}</div>
    <button class="press" type="submit" :disabled="sibuk" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:56px;margin-top:18px;border-radius:18px;background:linear-gradient(135deg,var(--p1),var(--p0));color:#fff;font-size:17px;font-weight:600;box-shadow:0 12px 26px rgba(10,42,92,.25)">
      <span v-if="sibuk" class="spin" />
      <span>{{ sibuk ? 'Menyimpan…' : 'Simpan kata sandi' }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
// Form ganti kata sandi orang tua (dipakai di layar masuk saat kata sandi awal, dan di Profil).
const props = defineProps<{ lamaAwal?: string }>()
const emit = defineEmits<{ selesai: [] }>()
const { api, pesanGalat, sesi } = useOrtu()

const lama = ref('')
const baru = ref('')
const ulang = ref('')
const galat = ref('')
const sibuk = ref(false)

const kirim = async () => {
  galat.value = ''
  const sandiLama = props.lamaAwal || lama.value
  if (!sandiLama) { galat.value = 'Isi kata sandi saat ini.'; return }
  if (baru.value.length < 8) { galat.value = 'Kata sandi baru minimal 8 karakter.'; return }
  if (baru.value !== ulang.value) { galat.value = 'Ulangan kata sandi baru tidak sama.'; return }
  sibuk.value = true
  try {
    await api('/api/ortu/ganti-password', { method: 'POST', body: { lama: sandiLama, baru: baru.value } })
    if (sesi.value) sesi.value.wajibGanti = false
    lama.value = baru.value = ulang.value = ''
    emit('selesai')
  } catch (e) {
    galat.value = pesanGalat(e)
  } finally {
    sibuk.value = false
  }
}
</script>
