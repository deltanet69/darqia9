<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminSystemStore } from '~/composables/useAdminSystemStore'

definePageMeta({ layout: 'admin', name: 'admin-rbac' })
useHead({ title: 'Hak Akses (RBAC) | Admin Portal' })

const store = useAdminSystemStore()
const roles = Object.keys(store.perms.value)

const currentRole = ref(roles[0])
const isDirty = ref(false)

// Local working copy of perms
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
  const p = store.perms.value[r]
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
  store.perms.value[currentRole.value] = JSON.parse(JSON.stringify(workingPerms.value[currentRole.value]))
  isDirty.value = false
  store.addLog('Administrator', 'Super Admin', `mengubah hak akses peran ${currentRole.value}`, 'RBAC')
}

const cancelChanges = () => {
  workingPerms.value[currentRole.value] = JSON.parse(JSON.stringify(store.perms.value[currentRole.value]))
  isDirty.value = false
}

const addRole = () => {
  alert('Form pembuatan peran baru (demo mode)')
}
</script>

<template>
  <section class="space-y-6">
    <!-- Page Head -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Hak Akses (RBAC)</h2>
        <p class="text-sm text-slate-500 mt-1">Atur matriks izin per modul: Lihat &bull; Tambah &bull; Ubah &bull; Hapus</p>
      </div>
      <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-150" type="button" @click="addRole">
        <AdminIcon name="plus" size="16" /> Peran Baru
      </button>
    </div>

    <!-- Alert Ada Perubahan -->
    <div v-if="isDirty" class="bg-amber-50/90 border border-amber-300/90 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-md shadow-amber-500/5 animate-fade-in">
      <span class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
        <AdminIcon name="alert" size="20" />
      </span>
      <b class="text-xs sm:text-sm text-amber-900 flex-1 min-w-[200px]">
        Ada perubahan izin belum disimpan untuk peran <span class="font-bold underline">{{ currentRole }}</span>
      </b>
      <div class="flex items-center gap-2">
        <button class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="cancelChanges">Batal</button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(37,99,235,0.5)] transition" type="button" @click="saveChanges">
          <AdminIcon name="check" size="14" /> Simpan Perubahan
        </button>
      </div>
    </div>

    <!-- Role Tabs Chips -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="r in roles"
        :key="r"
        class="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer"
        :class="r === currentRole ? 'bg-[#0a1f44] text-white shadow-md scale-102' : 'bg-white border border-slate-200/80 text-slate-600 hover:border-blue-500 hover:text-blue-700'"
        type="button"
        @click="selectRole(r)"
      >
        {{ r }}
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Matrix Table (2 cols) -->
      <article class="lg:col-span-2 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div>
            <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Matriks Izin &mdash; {{ currentRole }}
            </h3>
            <div class="text-xs text-slate-400 mt-0.5">
              <template v-if="isLocked">Akses penuh, hak akses Super Admin bersifat permanen</template>
              <template v-else>{{ totalOn }} dari total {{ totalPerms }} izin aktif pada peran ini</template>
            </div>
          </div>
          <span v-if="isLocked" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <AdminIcon name="lock" size="13" /> Locked
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700 min-w-[500px]">
            <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th class="px-5 py-3.5">Modul Sistem</th>
                <th v-for="a in store.actions" :key="a" class="px-4 py-3.5 text-center">{{ a }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="m in store.modules" :key="m" class="hover:bg-blue-50/30 transition-colors duration-150">
                <td class="px-5 py-3.5 font-bold text-slate-900 text-xs sm:text-sm">{{ m }}</td>
                <td v-for="a in store.actions" :key="a" class="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    :disabled="isLocked"
                    :aria-label="`Izin ${a} modul ${m}`"
                    class="w-10 h-5.5 rounded-full transition-colors duration-200 relative inline-block align-middle focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-inner"
                    :class="currentPerms[m]?.[a] ? 'bg-emerald-500' : 'bg-slate-300'"
                    @click="handlePermChange(m, a, !currentPerms[m]?.[a])"
                  >
                    <span
                      class="block w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 absolute top-0.5 shadow-sm"
                      :class="currentPerms[m]?.[a] ? 'left-[20px]' : 'left-0.5'"
                    />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Sidebar summary (1 col) -->
      <div class="space-y-6">
        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 bg-white/50">
            <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Ringkasan Peran
            </h3>
          </div>
          <div class="p-5 space-y-3.5">
            <div
              v-for="r in roles"
              :key="r"
              class="flex items-center gap-3 pt-3 first:pt-0 border-t border-slate-100 first:border-0"
            >
              <b class="text-xs font-bold text-slate-800 flex-1 truncate">{{ r }}</b>
              <span class="text-xs font-semibold text-slate-400 font-mono">{{ getRoleTotalOn(r) }}/{{ totalPerms }}</span>
              <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0 shadow-inner">
                <i class="block h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" :style="{ width: `${(getRoleTotalOn(r) / totalPerms) * 100}%` }" />
              </div>
            </div>
          </div>
        </article>

        <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div class="text-xs text-slate-500 leading-relaxed space-y-2">
            <b class="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <AdminIcon name="shield" size="16" />
              </span>
              Cara Kerja RBAC
            </b>
            <p>Setiap peran memiliki 4 tingkatan aksi per modul sistem. Setiap perubahan izin yang disimpan akan otomatis dicatat ke dalam audit trail pada menu <strong>Log Aktivitas</strong>.</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

