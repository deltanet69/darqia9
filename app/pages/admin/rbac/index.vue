<template>
  <div>
    <div class="page-head">
      <div>
        <h2>Hak Akses (RBAC)</h2>
        <p>Atur izin Lihat &bull; Tambah &bull; Ubah &bull; Hapus per peran</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="addRole">
        <AdminIcon name="plus" size="16"/> Peran Baru
      </button>
    </div>

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

    <div class="toolbar" style="margin-bottom: 20px;">
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
            <h3>Matriks Izin - {{ currentRole }}</h3>
            <div class="sub">
              <template v-if="isLocked">Akses penuh, tidak dapat diubah</template>
              <template v-else>{{ totalOn }} dari {{ totalPerms }} izin aktif</template>
            </div>
          </div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl" style="min-width:520px">
            <thead>
              <tr>
                <th>Modul</th>
                <th v-for="a in store.actions" :key="a" style="text-align:center">{{ a }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in store.modules" :key="m">
                <td class="t-name">{{ m }}</td>
                <td v-for="a in store.actions" :key="a" style="text-align:center">
                  <label class="sw" style="margin:0 auto">
                    <input 
                      type="checkbox" 
                      :checked="!!currentPerms[m]?.[a]" 
                      :disabled="isLocked"
                      @change="e => handlePermChange(m, a, (e.target as HTMLInputElement).checked)"
                    >
                    <span class="tr"></span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom: 20px">
          <div class="card-h"><div><h3>Ringkasan Akses</h3></div></div>
          <div class="card-b" style="padding:0 20px">
            <div 
              v-for="r in roles" 
              :key="r"
              style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line-2)"
            >
              <b style="font-size:13px;flex:1">{{ r }}</b>
              <span style="font-size:12px;color:var(--muted)">{{ getRoleTotalOn(r) }}/{{ totalPerms }}</span>
              <div class="prog" style="width:90px">
                <i :style="{ width: (getRoleTotalOn(r) / totalPerms * 100) + '%' }"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-b" style="font-size:13px;color:var(--muted);line-height:1.7">
            <b style="color:var(--ink)"><AdminIcon name="shield" size="15" style="margin-right:4px;vertical-align:-2px"/> Cara kerja</b><br>
            Setiap peran punya 4 jenis izin per modul. Perubahan hanya berlaku setelah tombol <b>Simpan</b> ditekan dan tercatat di Log Aktivitas.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminSystemStore, type ActionPerms } from '~/composables/useAdminSystemStore'

definePageMeta({ layout: 'admin', name: 'admin-rbac' })
useHead({ title: 'Hak Akses (RBAC) | Admin Portal' })

const store = useAdminSystemStore()
const roles = Object.keys(store.perms.value)

const currentRole = ref(roles[0])
const isDirty = ref(false)

// We need a local working copy of perms for the dirty state logic
const workingPerms = ref(JSON.parse(JSON.stringify(store.perms.value)))

const currentPerms = computed(() => workingPerms.value[currentRole.value] || {})
const isLocked = computed(() => currentRole.value === 'Super Admin')
const totalPerms = computed(() => store.modules.length * 4)

const totalOn = computed(() => {
  let count = 0
  const p = currentPerms.value
  for (const mod in p) {
    for (const act in p[mod]) {
      if (p[mod][act]) count++
    }
  }
  return count
})

const getRoleTotalOn = (r: string) => {
  let count = 0
  const p = store.perms.value[r] // get from truth
  if (!p) return 0
  for (const mod in p) {
    for (const act in p[mod]) {
      if (p[mod][act]) count++
    }
  }
  return count
}

const selectRole = (r: string) => {
  if (isDirty.value && !confirm('Ada perubahan belum disimpan. Pindah peran?')) return
  currentRole.value = r
  isDirty.value = false
  // Reset working copy when changing role
  workingPerms.value[currentRole.value] = JSON.parse(JSON.stringify(store.perms.value[currentRole.value]))
}

const handlePermChange = (m: string, a: string, checked: boolean) => {
  if (isLocked.value) return
  if (!workingPerms.value[currentRole.value][m]) {
    workingPerms.value[currentRole.value][m] = { Lihat: 0, Tambah: 0, Ubah: 0, Hapus: 0 }
  }
  workingPerms.value[currentRole.value][m][a] = checked ? 1 : 0
  isDirty.value = true
}

const saveChanges = () => {
  // Sync working to real store
  store.perms.value[currentRole.value] = JSON.parse(JSON.stringify(workingPerms.value[currentRole.value]))
  isDirty.value = false
  
  // Log it
  store.addLog("Administrator", "Super Admin", `mengubah hak akses peran ${currentRole.value}`, "RBAC")
  alert(`Hak akses ${currentRole.value} disimpan & tercatat di log`)
}

const cancelChanges = () => {
  // Revert working copy
  workingPerms.value[currentRole.value] = JSON.parse(JSON.stringify(store.perms.value[currentRole.value]))
  isDirty.value = false
}

const addRole = () => {
  alert("Form peran baru (demo)")
}
</script>
