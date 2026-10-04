import { useState } from 'nuxt/app'
import { computed } from 'vue'
import { useAdminGrade } from './useAdminGrade'

export type User = { id: string; username: string; nama: string; role: string; status: string; login: string }
export type ActionPerms = { Lihat: number; Tambah: number; Ubah: number; Hapus: number }
export type ModulePerms = Record<string, ActionPerms>
export type RolePerms = Record<string, ModulePerms>
export type LogEntry = { waktu: string; nama: string; role: string; aksi: string; modul: string }

export const useAdminSystemStore = () => {
  const grade = useAdminGrade()
  
  // Base constants
  const modules = ["Dashboard","Absensi","Kelas","Nilai","Keuangan","Tabungan","CBT","Konten Web","Pengguna","Pengaturan"]
  const actions = ["Lihat","Tambah","Ubah","Hapus"]

  // In a real app, this would be fetched from API based on grade
  // Here we use nested objects keyed by grade: 'SMP' | 'SMK'
  const state = useState('admin-system-state', () => {
    // Helper to generate some varied dummy data
    const generateUsers = (prefix: string) => {
      const users: User[] = [
        { id: prefix + "1", username: "admin", nama: "Administrator", role: "Super Admin", status: "Aktif", login: "Online sekarang" }
      ]
      
      const roles = ["Admin Akademik", "Admin Keuangan", "Guru", "Wali Kelas", "Staff TU"]
      const names = prefix === 'SMP' 
        ? ["Budi Santoso", "Siti Aminah", "Joko Widodo", "Rini Wati", "Andi Susanto"]
        : ["Agus Pratama", "Dewi Lestari", "Rizky Firmansyah", "Nita Sari", "Fajar Nugraha"]
        
      names.forEach((nama, i) => {
        users.push({
          id: prefix + (i + 2),
          username: nama.toLowerCase().replace(/ /g, '.'),
          nama,
          role: roles[i],
          status: i % 3 === 0 ? "Nonaktif" : "Aktif",
          login: "Kemarin"
        })
      })
      
      // Add 20 more dummy users
      for(let i=0; i<20; i++) {
        users.push({
          id: prefix + (i + 10),
          username: `guru${i}.${prefix.toLowerCase()}`,
          nama: `Guru ${prefix} ${i+1}`,
          role: "Guru",
          status: "Aktif",
          login: "5 mnt lalu"
        })
      }
      return users
    }
    
    const basePerms = {
      "Super Admin": Object.fromEntries(modules.map(m => [m, { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 1 }])),
      "Admin Akademik": { "Dashboard": { Lihat: 1, Tambah: 0, Ubah: 0, Hapus: 0 }, "Absensi": { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 1 }, "Pengguna": { Lihat: 1, Tambah: 0, Ubah: 0, Hapus: 0 } },
      "Admin Keuangan": { "Dashboard": { Lihat: 1, Tambah: 0, Ubah: 0, Hapus: 0 }, "Keuangan": { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 1 }, "Tabungan": { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 1 } },
      "Guru": { "Dashboard": { Lihat: 1, Tambah: 0, Ubah: 0, Hapus: 0 }, "Nilai": { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 0 }, "Absensi": { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 0 } },
      "Wali Kelas": { "Dashboard": { Lihat: 1, Tambah: 0, Ubah: 0, Hapus: 0 }, "Kelas": { Lihat: 1, Tambah: 1, Ubah: 1, Hapus: 0 } },
      "Staff TU": { "Dashboard": { Lihat: 1, Tambah: 0, Ubah: 0, Hapus: 0 }, "Pengguna": { Lihat: 0, Tambah: 0, Ubah: 0, Hapus: 0 } }
    }

    const generateLogs = (prefix: string) => [
      { waktu: new Date().toISOString(), nama: "Administrator", role: "Super Admin", aksi: "login ke sistem", modul: "Pengguna" },
      { waktu: new Date(Date.now() - 3600000).toISOString(), nama: prefix === 'SMP' ? 'Budi Santoso' : 'Agus Pratama', role: "Admin Akademik", aksi: "mengubah data absensi", modul: "Absensi" },
      { waktu: new Date(Date.now() - 7200000).toISOString(), nama: prefix === 'SMP' ? 'Siti Aminah' : 'Dewi Lestari', role: "Admin Keuangan", aksi: "membuat tagihan SPP", modul: "Keuangan" }
    ]

    return {
      SMP: {
        users: generateUsers('SMP'),
        perms: JSON.parse(JSON.stringify(basePerms)),
        logs: generateLogs('SMP')
      },
      SMK: {
        users: generateUsers('SMK'),
        perms: JSON.parse(JSON.stringify(basePerms)),
        logs: generateLogs('SMK')
      }
    }
  })

  // Proxy getters so UI components always read from the currently active grade
  const users = computed({
    get: () => state.value[grade.value as 'SMP'|'SMK'].users as User[],
    set: (v) => state.value[grade.value as 'SMP'|'SMK'].users = v
  })
  
  const perms = computed({
    get: () => state.value[grade.value as 'SMP'|'SMK'].perms as RolePerms,
    set: (v) => state.value[grade.value as 'SMP'|'SMK'].perms = v
  })
  
  const logs = computed({
    get: () => state.value[grade.value as 'SMP'|'SMK'].logs as LogEntry[],
    set: (v) => state.value[grade.value as 'SMP'|'SMK'].logs = v
  })

  const addUser = (nama: string, username: string, role: string) => {
    state.value[grade.value as 'SMP'|'SMK'].users.unshift({
      id: grade.value + "-U" + Date.now(),
      username,
      nama,
      role,
      status: "Aktif",
      login: "Belum pernah login"
    })
  }

  const toggleUserStatus = (id: string, active: boolean) => {
    const user = state.value[grade.value as 'SMP'|'SMK'].users.find((u: User) => u.id === id)
    if (user && !user.role.includes('Super Admin')) {
      user.status = active ? 'Aktif' : 'Nonaktif'
    }
  }
  
  const addLog = (nama: string, role: string, aksi: string, modul: string) => {
    state.value[grade.value as 'SMP'|'SMK'].logs.unshift({
      waktu: new Date().toISOString(),
      nama,
      role,
      aksi,
      modul
    })
  }
  
  const updatePerm = (role: string, modul: string, action: keyof ActionPerms, checked: boolean) => {
    if (role === 'Super Admin') return
    const activePerms = state.value[grade.value as 'SMP'|'SMK'].perms
    if (activePerms[role] && activePerms[role][modul]) {
      activePerms[role][modul][action] = checked ? 1 : 0
    }
  }

  return {
    grade,
    users,
    modules,
    actions,
    perms,
    logs,
    addUser,
    toggleUserStatus,
    addLog,
    updatePerm
  }
}
