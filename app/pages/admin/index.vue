<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Selamat datang, <span class="grad-name">Administrator</span></h2>
        <p>{{ currentDate }} &middot; Berikut ringkasan operasional sekolah hari ini.</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-sm" id="d-dl">
          <AdminIcon name="dl" size="16"/> Unduh Laporan
        </button>
        <button class="btn btn-primary btn-sm" id="d-add">
          <AdminIcon name="plus" size="16"/> Aksi Cepat
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid g4" style="margin-bottom:18px">
      <div class="kpi k-blue" title="Buka Total Siswa" @click="$router.push('/admin/kelas')">
        <span class="shine"></span>
        <div class="k-top">
          <span class="k-ic"><AdminIcon name="users" size="22"/></span>
          <span class="k-delta">
            <AdminIcon name="tup" size="14"/>+12 semester ini
          </span>
        </div>
        <div class="k-val">580</div>
        <div class="k-lbl">Total Siswa</div>
      </div>
      
      <div class="kpi k-violet" title="Buka Guru & Tendik" @click="$router.push('/admin/absensi-guru')">
        <span class="shine"></span>
        <div class="k-top">
          <span class="k-ic"><AdminIcon name="ucheck" size="22"/></span>
          <span class="k-delta">6 tendik &middot; 28 guru</span>
        </div>
        <div class="k-val">34</div>
        <div class="k-lbl">Guru &amp; Tendik</div>
      </div>
      
      <div class="kpi k-green" title="Buka Kehadiran Hari Ini" @click="$router.push('/admin/absensi-siswa')">
        <span class="shine"></span>
        <div class="k-top">
          <span class="k-ic"><AdminIcon name="cal" size="22"/></span>
          <span class="k-delta">
            <AdminIcon name="tdn" size="14"/>12 alpa &middot; 5 izin
          </span>
        </div>
        <div class="k-val">96%</div>
        <div class="k-lbl">Kehadiran Hari Ini</div>
      </div>
      
      <div class="kpi k-amber" title="Buka Pemasukan Bulan Ini" @click="$router.push('/admin/keuangan')">
        <span class="shine"></span>
        <div class="k-top">
          <span class="k-ic"><AdminIcon name="wallet" size="22"/></span>
          <span class="k-delta">
            <AdminIcon name="tup" size="14"/>+8.2% vs bln lalu
          </span>
        </div>
        <div class="k-val">Rp 24.5M</div>
        <div class="k-lbl">Pemasukan Bulan Ini</div>
      </div>
    </div>

    <!-- Charts Section 1 -->
    <div class="grid g21" style="margin-bottom:18px">
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Tren Kehadiran Siswa</h3>
            <div class="sub">Persentase kehadiran 7 hari terakhir</div>
          </div>
          <div class="legend">
            <span><i style="background:#2563eb"></i>SMP</span>
            <span><i style="background:#8b5cf6"></i>SMK</span>
          </div>
        </div>
        <div class="card-b">
          <div style="height:250px; background:var(--bg-2); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; border:1px dashed var(--line-2)">
            [Chart Area Placeholder]
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Arus Kas</h3>
            <div class="sub">Pemasukan vs pengeluaran &middot; 6 bulan</div>
          </div>
        </div>
        <div class="card-b">
          <div style="height:200px; background:var(--bg-2); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; border:1px dashed var(--line-2); margin-bottom:16px;">
            [Bar Chart Kas]
          </div>
          <div class="legend">
            <span><i style="background:#16a34a"></i>Masuk</span>
            <span><i style="background:#f59e0b"></i>Keluar</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2 -->
    <div class="grid g3" style="margin-bottom:18px">
      <div class="card">
        <div class="card-h">
          <h3>Komposisi Siswa</h3>
        </div>
        <div class="card-b">
          <div style="height:180px; width:180px; background:var(--bg-2); border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; border:1px solid var(--line)">
            [Pie Chart]
          </div>
          <div class="legend" style="justify-content:center">
            <span><i style="background:#2563eb"></i>SMP &middot; 210</span>
            <span><i style="background:#8b5cf6"></i>SMK &middot; 370</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Ujian CBT</h3>
            <div class="sub">Jadwal terdekat</div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="$router.push('/admin/cbt')">Kelola</button>
        </div>
        <div class="card-b" style="padding:8px 20px 16px">
          
          <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line-2)">
            <span class="kic" style="width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:var(--amber-bg);color:var(--amber)">
              <AdminIcon name="monitor" size="18"/>
            </span>
            <div style="flex:1;min-width:0">
              <b style="font-size:13.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Informatika</b>
              <span style="font-size:12px;color:var(--muted)">X RPL 1 &middot; 08:00 - 09:30</span>
            </div>
            <span class="pill p-amber"><span class="pdot"></span>Menunggu</span>
          </div>

          <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line-2)">
            <span class="kic" style="width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:var(--violet-bg);color:var(--violet)">
              <AdminIcon name="monitor" size="18"/>
            </span>
            <div style="flex:1;min-width:0">
              <b style="font-size:13.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Pemrograman Web</b>
              <span style="font-size:12px;color:var(--muted)">XI RPL 2 &middot; Sedang Berjalan</span>
            </div>
            <span class="pill p-violet"><span class="pdot"></span>Berlangsung</span>
          </div>
          
          <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line-2); border-bottom:0">
            <span class="kic" style="width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:var(--green-bg);color:var(--green)">
              <AdminIcon name="monitor" size="18"/>
            </span>
            <div style="flex:1;min-width:0">
              <b style="font-size:13.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Matematika</b>
              <span style="font-size:12px;color:var(--muted)">IX-A &middot; Selesai dinilai</span>
            </div>
            <span class="pill p-green"><span class="pdot"></span>Selesai</span>
          </div>

        </div>
      </div>
      
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Aktivitas Terbaru</h3>
            <div class="sub">Jejak audit sistem</div>
          </div>
          <button class="btn btn-ghost btn-sm">Semua</button>
        </div>
        <div class="card-b" style="padding:8px 20px 16px">
          
          <div style="display:flex;gap:11px;padding:10px 0;border-bottom:1px solid var(--line-2)">
            <span class="ava">BS</span>
            <div style="font-size:13px">
              <b>Budi Santoso</b> <span style="color:var(--muted)">login ke sistem</span>
              <div style="font-size:11.5px;color:var(--faint);margin-top:2px">Sistem &middot; 10 menit lalu</div>
            </div>
          </div>

          <div style="display:flex;gap:11px;padding:10px 0;border-bottom:1px solid var(--line-2)">
            <span class="ava">AS</span>
            <div style="font-size:13px">
              <b>Ahmad Subarjo</b> <span style="color:var(--muted)">merubah jadwal ujian</span>
              <div style="font-size:11.5px;color:var(--faint);margin-top:2px">CBT &middot; 35 menit lalu</div>
            </div>
          </div>

          <div style="display:flex;gap:11px;padding:10px 0;border-bottom:1px solid var(--line-2); border-bottom:0">
            <span class="ava">SK</span>
            <div style="font-size:13px">
              <b>Siti Khadijah</b> <span style="color:var(--muted)">input nilai Matematika</span>
              <div style="font-size:11.5px;color:var(--faint);margin-top:2px">Akademik &middot; 1 jam lalu</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-dashboard'
})

const currentDate = computed(() => {
  const d = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
})
</script>
