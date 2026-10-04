<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Profil Saya</h2>
        <p>Detail akun &amp; preferensi</p>
      </div>
    </div>

    <div class="grid g21">
      <div>
        <div class="card" style="margin-bottom:18px;overflow:hidden">
          <div style="height:110px;background:linear-gradient(120deg,#0a1f44,#1d4ed8 60%,#3b82f6)"></div>
          <div class="card-b" style="padding-top:0">
            <div style="display:flex;align-items:flex-end;gap:14px;margin:-34px 0 14px">
              <!-- Avatar -->
              <div class="ava" style="width:72px;height:72px;font-size:24px;border:4px solid #fff;box-shadow:var(--sh-sm);background:#fff;color:var(--ink)">
                {{ getInitials(ME.nama) }}
              </div>
              <div style="padding-bottom:6px">
                <b style="font-size:19px">{{ ME.nama }}</b>
                <div style="font-size:13px;color:var(--muted)">
                  @{{ ME.username }} &middot; 
                  <span class="pill p-rose" style="margin-left:4px">{{ ME.role }}</span>
                </div>
              </div>
            </div>
            
            <div class="grid g2" style="gap:10px;font-size:13.5px">
              <div class="stat-mini"><span>NIP</span><b style="font-size:14px">{{ ME.nip }}</b></div>
              <div class="stat-mini"><span>Email</span><b style="font-size:14px">{{ ME.email }}</b></div>
              <div class="stat-mini"><span>No. HP</span><b style="font-size:14px">{{ ME.hp }}</b></div>
              <div class="stat-mini"><span>Alamat</span><b style="font-size:14px">{{ ME.alamat }}</b></div>
            </div>
            
            <div style="margin-top:16px;display:flex;gap:10px">
              <button class="btn btn-primary btn-sm" @click="showEditModal = true">
                <AdminIcon name="pencil" size="15"/> Ubah Profil
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h">
            <h3>Statistik Akun</h3>
          </div>
          <div class="card-b">
            <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
              <div class="stat-mini"><b>1.284</b><span>Total login</span></div>
              <div class="stat-mini"><b>96</b><span>Aksi bulan ini</span></div>
              <div class="stat-mini"><b>12</b><span>Laporan dibuat</span></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:18px">
          <div class="card-h">
            <h3>Keamanan</h3>
            <div class="sub">Terakhir diubah 45 hari lalu</div>
          </div>
          <div class="card-b">
            <div class="field">
              <label>Kata sandi baru</label>
              <div class="inp">
                <span class="ic"><AdminIcon name="lock" size="17"/></span>
                <input type="password" v-model="pass.new" placeholder="Minimal 8 karakter">
              </div>
            </div>
            <div class="field">
              <label>Konfirmasi kata sandi</label>
              <div class="inp">
                <span class="ic"><AdminIcon name="lock" size="17"/></span>
                <input type="password" v-model="pass.confirm" placeholder="Ulangi kata sandi">
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%" @click="updatePassword">
              <AdminIcon name="check" size="15"/> Perbarui Kata Sandi
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-h">
            <h3>Preferensi Notifikasi</h3>
          </div>
          <div class="card-b" style="padding-top:8px">
            <div v-for="(n, i) in preferences" :key="i" style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line-2)" :style="i === preferences.length - 1 ? 'border-bottom:0' : ''">
              <div style="flex:1">
                <b style="font-size:13.5px">{{ n.title }}</b>
                <div style="font-size:12.5px;color:var(--muted)">{{ n.desc }}</div>
              </div>
              <label class="sw">
                <input type="checkbox" v-model="n.active">
                <span class="tr"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-profile'
})

const ME = reactive({
  nama: "Administrator",
  username: "admin",
  role: "Super Admin",
  nip: "19850101 201001 1 001",
  email: "admin@darqiaattaqwa.sch.id",
  hp: "0812-3456-7890",
  alamat: "Jl. Perintis Kemerdekaan No. 1, Bekasi"
})

const pass = reactive({
  new: "",
  confirm: ""
})

const showEditModal = ref(false)

const preferences = reactive([
  { title: "Absensi harian", desc: "Ringkasan kehadiran setiap pagi", active: true },
  { title: "Transaksi keuangan", desc: "Notifikasi setiap transaksi dicatat", active: true },
  { title: "Ujian CBT", desc: "Jadwal & hasil ujian", active: true },
  { title: "Pengumuman", desc: "Info dari modul konten web", active: false }
])

const getInitials = (name: string) => {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
}

const updatePassword = () => {
  if (pass.new.length < 8) {
    alert("Kata sandi minimal 8 karakter")
    return
  }
  if (pass.new !== pass.confirm) {
    alert("Konfirmasi kata sandi tidak cocok")
    return
  }
  pass.new = ""
  pass.confirm = ""
  alert("Kata sandi berhasil diperbarui!")
}
</script>
