<template>
  <div>
    <div class="up">
      <h1 style="margin:0;font-size:30px;font-weight:600;letter-spacing:-.025em;color:var(--p0)">Administrasi</h1>
      <div style="margin-top:2px;font-size:16px;color:#51607F">Keuangan{{ d ? ` · Tahun Ajaran ${d.tahunAjaran}` : '' }}</div>
      <div v-if="d" style="margin-top:12px;display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:7px 14px;border-radius:999px;background:var(--soft);font-size:14px;color:var(--p0)">
        <span style="color:#51607F">Kode Keuangan</span><span style="font-weight:600">{{ d.kode ? `${d.kode}${d.paket ? ` · ${d.paket}` : ''}` : 'Belum ditetapkan' }}</span>
      </div>
    </div>

    <div v-if="galat" role="alert" style="margin-top:18px;padding:14px 16px;border-radius:18px;background:#FDECEC;color:#9A1F1F;font-size:15px;line-height:1.45">
      {{ galat }}
      <button type="button" style="display:block;margin-top:6px;min-height:44px;font-weight:600;text-decoration:underline" @click="muat">Coba lagi</button>
    </div>

    <template v-if="d">
      <div class="chips up" role="tablist" aria-label="Tingkat" style="animation-delay:.06s;margin:18px -20px 0;padding:0 20px 4px;display:flex;gap:8px;overflow-x:auto">
        <button v-for="(t, i) in d.tingkat" :key="t.label" type="button" role="tab" :aria-selected="pilih === i" class="press" :style="`flex:none;height:44px;padding:0 18px;border-radius:22px;font-size:15px;font-weight:500;background:${pilih === i ? 'var(--p1)' : '#fff'};color:${pilih === i ? '#fff' : '#33415C'};box-shadow:${pilih === i ? '0 6px 16px rgba(10,42,92,.2)' : '0 2px 8px rgba(10,42,92,.07)'};transition:background .35s,color .35s,box-shadow .35s`" @click="pilih = i">{{ t.label }}</button>
      </div>

      <div v-if="tg.keadaan === 'ok'" :key="`ok-${pilih}`" class="fade" style="margin-top:14px;border-radius:26px;padding:20px;background:linear-gradient(150deg,var(--soft),#fff);box-shadow:0 6px 24px rgba(10,42,92,.07)">
        <div style="display:flex;align-items:center;gap:18px">
          <div style="position:relative;width:112px;height:112px;flex:none">
            <svg width="112" height="112" viewBox="0 0 160 160" aria-hidden="true" style="transform:rotate(-90deg)">
              <defs><linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--p1)" /><stop offset="1" stop-color="#F0B429" /></linearGradient></defs>
              <circle cx="80" cy="80" r="64" fill="none" stroke="#fff" stroke-width="14" />
              <circle class="ringv" cx="80" cy="80" r="64" fill="none" stroke="url(#rg2)" stroke-width="14" stroke-linecap="round" stroke-dasharray="402.12" :style="`--c:402.12;stroke-dashoffset:${(402.12 * (1 - tg.persen / 100)).toFixed(2)};transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)`" />
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div style="font-size:28px;line-height:1;font-weight:600;letter-spacing:-.03em;color:var(--p0)">{{ Math.floor(tg.persen) }}%</div>
              <div style="margin-top:3px;font-size:12px;color:#51607F">lunas</div>
            </div>
          </div>
          <div style="min-width:0">
            <div style="font-size:14px;color:#51607F">Sisa pembayaran · {{ tg.label }}</div>
            <div style="margin-top:2px;font-size:28px;line-height:1.1;font-weight:600;letter-spacing:-.03em;color:var(--p0);overflow-wrap:anywhere">{{ rp(tg.sisa) }}</div>
            <div :style="`margin-top:8px;display:inline-block;padding:4px 12px;border-radius:999px;font-size:14px;font-weight:500;background:${tg.sisa > 0 ? '#FEF3C7' : '#DCFCE7'};color:${tg.sisa > 0 ? '#78350F' : '#14532D'}`">{{ tg.sisa > 0 ? 'Belum lunas' : 'Lunas' }}</div>
          </div>
        </div>
        <div style="margin-top:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
          <div style="background:#fff;border-radius:16px;padding:12px 14px"><div style="font-size:13px;color:#51607F">Total tagihan</div><div style="margin-top:3px;font-size:17px;font-weight:600;color:#14213D">{{ rp(tg.total) }}</div></div>
          <div style="background:#fff;border-radius:16px;padding:12px 14px"><div style="font-size:13px;color:#51607F">Sudah dibayar</div><div style="margin-top:3px;font-size:17px;font-weight:600;color:#14532D">{{ rp(tg.bayar) }}</div></div>
        </div>
      </div>

      <div v-else-if="tg.keadaan === 'belum'" :key="`belum-${pilih}`" class="fade" style="margin-top:14px;border-radius:26px;padding:26px 22px;background:#fff;box-shadow:0 6px 24px rgba(10,42,92,.06);text-align:center">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--soft);color:var(--p1);margin:0 auto;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></div>
        <div style="margin-top:14px;font-size:19px;font-weight:600;color:var(--p0)">Tagihan {{ tg.label }} belum dirilis</div>
        <div style="margin-top:6px;font-size:16px;line-height:1.5;color:#51607F">Bapak/Ibu akan diberi tahu setelah sekolah merilis tagihannya.</div>
      </div>

      <div v-else :key="`noset-${pilih}`" class="fade" style="margin-top:14px;border-radius:26px;padding:26px 22px;background:#fff;box-shadow:0 6px 24px rgba(10,42,92,.06);text-align:center">
        <div style="font-size:14px;color:#51607F">Total tagihan · {{ tg.label }}</div>
        <div style="margin-top:6px;font-size:30px;font-weight:600;letter-spacing:-.02em;color:#64748B">Belum Diset</div>
        <div style="margin-top:8px;font-size:16px;line-height:1.5;color:#51607F">Nominal tingkat ini belum ditetapkan sekolah.</div>
      </div>

      <div class="up" style="animation-delay:.14s;margin-top:24px;display:flex;align-items:baseline;justify-content:space-between;gap:10px">
        <h2 style="margin:0;font-size:19px;font-weight:600;color:var(--p0)">Riwayat pembayaran</h2>
        <div style="font-size:14px;color:#64748B">{{ d.riwayat.length }} pembayaran</div>
      </div>
      <div v-if="!d.riwayat.length" class="up" style="animation-delay:.18s;margin-top:10px;background:#fff;border-radius:22px;padding:20px 18px;text-align:center;font-size:16px;color:#51607F;box-shadow:0 5px 20px rgba(10,42,92,.05)">Belum ada pembayaran tercatat.</div>
      <div v-for="(r, i) in d.riwayat" :key="r.no" class="up" :style="`animation-delay:${Math.min(0.18 + i * 0.05, 0.6)}s;margin-top:10px;background:#fff;border-radius:22px;padding:16px 18px;box-shadow:0 5px 20px rgba(10,42,92,.05)`">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:38px;height:38px;border-radius:50%;background:#DCFCE7;color:#14532D;display:flex;align-items:center;justify-content:center;flex:none"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></div>
          <div style="flex:1;min-width:0;font-size:17px;font-weight:500;color:#14213D">{{ ringkas(r.items) }}</div>
          <div style="font-size:17px;font-weight:600;color:#14532D;white-space:nowrap">{{ rp(r.nominal) }}</div>
        </div>
        <div style="margin-top:8px;font-size:14px;color:#64748B">{{ formatTanggal(r.tanggal) }} · {{ r.metode }}</div>
        <div v-if="terbuka === r.no" class="fade" style="margin-top:10px;padding:10px 12px;border-radius:14px;background:#F7F9FD">
          <div v-for="(it, j) in r.items" :key="j" style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:15px;color:#33415C"><span>{{ it.nama }}</span><span style="white-space:nowrap">{{ rp(it.nominal) }}</span></div>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div style="font-size:14px;color:#51607F">{{ r.no }}</div>
          <button type="button" class="press" :aria-expanded="terbuka === r.no" style="height:44px;padding:0 14px;border-radius:12px;background:var(--soft);color:var(--p1);font-size:14px;font-weight:600" @click="terbuka = terbuka === r.no ? '' : r.no">{{ terbuka === r.no ? 'Tutup rincian' : 'Lihat rincian' }}</button>
        </div>
      </div>
      <a v-if="d.tingkat.some(t => t.total > 0)" :href="d.verifikasi" target="_blank" rel="noopener" class="press up" style="animation-delay:.3s;display:flex;align-items:center;justify-content:center;width:100%;height:50px;margin-top:14px;border-radius:16px;background:#fff;color:var(--p1);font-size:15px;font-weight:600;box-shadow:0 4px 16px rgba(10,42,92,.06)">Lihat bukti verifikasi tagihan</a>
      <div class="up" style="animation-delay:.4s;margin-top:16px;font-size:15px;line-height:1.5;color:#64748B;text-align:center">Pembayaran dilakukan di loket Tata Usaha sekolah.<br>Status berubah setelah pembayaran dicatat.</div>
    </template>
    <template v-else-if="!galat">
      <div class="muat" style="margin-top:18px;height:44px;border-radius:22px" />
      <div class="muat" style="margin-top:14px;height:220px;border-radius:26px" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatTanggal, rp } from '~/composables/keuanganCore'
import type { AdministrasiOrtu, BayarOrtu } from '~/types/ortu'

const { api, pesanGalat } = useOrtu()
const d = ref<AdministrasiOrtu | null>(null)
const galat = ref('')
const pilih = ref(0)
const terbuka = ref('')

const muat = async () => {
  galat.value = ''
  try {
    d.value = await api<AdministrasiOrtu>('/api/ortu/administrasi')
    // Tingkat yang dibuka pertama: yang dirilis dan masih bersisa, lalu yang dirilis, lalu Tingkat 1.
    const t = d.value.tingkat
    const bersisa = t.findIndex(x => x.keadaan === 'ok' && x.sisa > 0)
    pilih.value = bersisa >= 0 ? bersisa : Math.max(0, t.findLastIndex(x => x.keadaan === 'ok'))
  } catch (e) { galat.value = pesanGalat(e) }
}
onMounted(muat)

const tg = computed(() => d.value!.tingkat[pilih.value]!)
const ringkas = (items: BayarOrtu['items']) => items.length > 1 ? `${items[0]!.nama} +${items.length - 1} lainnya` : items[0]?.nama || 'Pembayaran'
</script>
