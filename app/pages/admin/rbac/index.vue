<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Hak Akses (RBAC)</h2>
        <p>Atur izin Lihat &middot; Tambah &middot; Ubah &middot; Hapus per peran</p>
      </div>
      <button class="btn btn-ghost btn-sm">
        <AdminIcon name="plus" size="16"/> Peran Baru
      </button>
    </div>

    <!-- Dirty Warning -->
    <div v-if="isDirty" class="card" style="margin-bottom:16px;border-color:#fbbf24;background:#fffbeb">
      <div class="card-b" style="display:flex;align-items:center;gap:12px;padding:14px 18px">
        <span style="color:var(--amber)"><AdminIcon name="alert" size="20"/></span>
        <b style="font-size:13.5px;flex:1">Ada perubahan belum disimpan untuk peran <b>{{ currentRole }}</b></b>
        <button class="btn btn-ghost btn-sm" @click="cancelChanges">Batal</button>
        <button class="btn btn-primary btn-sm" @click="saveChanges">
          <AdminIcon name="check" size="15"/> Simpan Perubahan
        </button>
      </div>
    </div>

    <div class="toolbar">
      <button 
        v-for="r in roles" 
        :key="r" 
        class="chip" 
        :class="{ on: r === currentRole }"
        @click="selectRole(r)"
      >
        {{ r }}
      </button>
    </div>

    <div class="grid g21">
      <div class="card">
        <div class="card-h">
          <div>
            <h3>Matriks Izin &mdash; {{ currentRole }}</h3>
            <div class="sub">
              <span v-if="isLocked">Akses penuh, tidak dapat diubah</span>
              <span v-else>{{ activePermsCount }} dari {{ totalPermsCount }} izin aktif</span>
            </div>
          </div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl" style="min-width:520px">
            <thead>
              <tr>
                <th>Modul</th>
                <th v-for="a in actions" :key="a" style="text-align:center">{{ a }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in modules" :key="m">
                <td class="t-name">{{ m }}</td>
                <td v-for="a in actions" :key="a" style="text-align:center">
                  <label class="sw" style="margin:0 auto">
                    <input type="checkbox" v-model="draftPerms[m][a]" :disabled="isLocked" @change="markDirty">
                    <span class="tr"></span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:18px">
          <div class="card-h"><h3>Ringkasan Peran</h3></div>
          <div class="card-b" style="padding-top:8px">
            <div v-for="r in roles" :key="r" style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line-2)">
              <b style="font-size:13px;flex:1">{{ r }}</b>
              <span style="font-size:12px;color:var(--muted)">{{ getPermCount(r) }}/{{ totalPermsCount }}</span>
              <div class="prog" style="width:90px">
                <i :style="{ width: (getPermCount(r) / totalPermsCount * 100) + '%' }"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-b" style="font-size:13px;color:var(--muted);line-height:1.7">
            <b style="color:var(--ink)">
              <AdminIcon name="shield" size="15" style="display:inline-block;vertical-align:-3px;margin-right:2px"/> Cara kerja
            </b><br>
            Setiap peran punya 4 jenis izin per modul. Perubahan hanya berlaku setelah tombol <b>Simpan</b> ditekan dan tercatat di Log Aktivitas.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-rbac'
})

const modules = ["Dashboard", "Absensi", "Kelas", "Nilai", "Keuangan", "Tabungan", "CBT", "Konten Web", "Pengguna", "RBAC", "Log"]
const actions = ["Lihat", "Tambah", "Ubah", "Hapus"]
const roles = ["Super Admin", "Admin Akademik", "Admin Keuangan", "Guru", "Wali Kelas", "Staff TU"]

const dbPerms = ref<Record<string, Record<string, Record<string, boolean>>>>({
  "Super Admin": {},
  "Admin Akademik": {},
  "Admin Keuangan": {},
  "Guru": {},
  "Wali Kelas": {},
  "Staff TU": {}
})

// Initialize dummy permissions
roles.forEach(r => {
  modules.forEach(m => {
    if (!dbPerms.value[r][m]) dbPerms.value[r][m] = {}
    actions.forEach(a => {
      dbPerms.value[r][m][a] = r === "Super Admin" ? true : Math.random() > 0.5
    })
  })
})

const currentRole = ref("Guru")
const isDirty = ref(false)
const draftPerms = ref<Record<string, Record<string, boolean>>>({})

const clonePerms = (role: string) => {
  const cloned: Record<string, Record<string, boolean>> = {}
  modules.forEach(m => {
    cloned[m] = { ...dbPerms.value[role][m] }
  })
  return cloned
}

draftPerms.value = clonePerms(currentRole.value)

const selectRole = (r: string) => {
  if (isDirty.value && !confirm('Ada perubahan yang belum disimpan. Pindah peran?')) return
  currentRole.value = r
  isDirty.value = false
  draftPerms.value = clonePerms(r)
}

const isLocked = computed(() => currentRole.value === "Super Admin")

const markDirty = () => {
  if (!isLocked.value) {
    isDirty.value = true
  }
}

const cancelChanges = () => {
  draftPerms.value = clonePerms(currentRole.value)
  isDirty.value = false
}

const saveChanges = () => {
  dbPerms.value[currentRole.value] = clonePerms(currentRole.value)
  isDirty.value = false
}

const totalPermsCount = modules.length * 4

const activePermsCount = computed(() => {
  let count = 0
  modules.forEach(m => {
    actions.forEach(a => {
      if (draftPerms.value[m][a]) count++
    })
  })
  return count
})

const getPermCount = (role: string) => {
  if (role === currentRole.value && isDirty.value) {
    return activePermsCount.value
  }
  let count = 0
  modules.forEach(m => {
    actions.forEach(a => {
      if (dbPerms.value[role][m][a]) count++
    })
  })
  return count
}
</script>
