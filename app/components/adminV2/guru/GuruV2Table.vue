<script setup lang="ts">
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { StaffItem } from '~/composables/useAdminTeachers'

defineProps<{
  staffList: StaffItem[]
}>()

const emit = defineEmits<{
  (e: 'view', staff: StaffItem): void
  (e: 'edit', staff: StaffItem): void
  (e: 'delete', staff: StaffItem): void
  (e: 'sync-user', staff: StaffItem): void
  (e: 'add'): void
  (e: 'upload'): void
}>()

const getText = (value: unknown, fallback = '-') => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || fallback
}

const getInitial = (name: unknown) => getText(name, '?').charAt(0).toUpperCase()

const getPosition = (role: unknown) =>
  getText(role).replace(/\s*\([^()]+\)\s*$/, '').trim() || '-'

const getUserRole = (role: unknown) =>
  getText(role, '').match(/\(([^()]+)\)\s*$/)?.[1] || 'Guru'

const getUnitLabel = (unit: StaffItem['unit'] | null | undefined) => {
  if (unit === 'SMP') return 'SMP IT BCA'
  if (unit === 'SMK') return 'SMK IT 9'
  return 'Yayasan / TU'
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-[#E7EBF2] bg-white shadow-xs">
    <header class="flex flex-col gap-3 border-b border-[#F2F4F7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div class="min-w-0">
        <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-[#101828] before:h-5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-[#1B5FD9] before:content-['']">
          Daftar Guru &amp; Tenaga Kependidikan
        </h3>
        <p class="mt-1 pl-4 text-xs text-[#667085]">
          Identitas, akses, dan status akun dalam satu daftar.
        </p>
      </div>
      <span class="w-fit rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#1D4ED8]">
        {{ staffList.length }} pendidik
      </span>
    </header>

    <div v-if="staffList.length === 0" class="px-5 py-14 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1B5FD9]">
        <AdminV2Icon name="users" :size="24" />
      </div>
      <h4 class="mt-3 text-sm font-bold text-[#101828]">Belum ada data guru dan staf</h4>
      <p class="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#64748B]">
        Tambahkan data secara manual atau unggah berkas Excel/CSV untuk memulai.
      </p>
      <div class="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white transition hover:bg-[#154DB0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9] focus-visible:ring-offset-2"
          @click="emit('add')"
        >
          <AdminV2Icon name="plus" :size="14" />
          Tambah Guru
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 text-xs font-bold text-[#344054] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9] focus-visible:ring-offset-2"
          @click="emit('upload')"
        >
          <AdminV2Icon name="dl" :size="14" class="rotate-180" />
          Unggah Excel/CSV
        </button>
      </div>
    </div>

    <template v-else>
      <div class="hidden lg:block">
        <table class="w-full table-fixed text-left text-xs text-[#344054]">
          <colgroup>
            <col class="w-[17%]">
            <col class="w-[12%]">
            <col class="w-[14%]">
            <col class="w-[10%]">
            <col class="w-[9%]">
            <col class="w-[11%]">
            <col class="w-[9%]">
            <col class="w-[8%]">
            <col class="w-[10%]">
          </colgroup>
          <thead class="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.04em] text-[#64748B]">
            <tr>
              <th class="px-4 py-3.5">Nama &amp; NIK</th>
              <th class="px-3 py-3.5">NIP/NUPTK</th>
              <th class="px-3 py-3.5">Jabatan</th>
              <th class="px-3 py-3.5">Unit Sekolah</th>
              <th class="px-3 py-3.5">Role User</th>
              <th class="px-3 py-3.5">Smart Card Access</th>
              <th class="px-3 py-3.5">Akun Portal</th>
              <th class="px-3 py-3.5">Status</th>
              <th class="px-3 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#EEF2F6]">
            <tr
              v-for="staff in staffList"
              :key="staff.id"
              class="transition-colors hover:bg-[#F8FAFC]"
            >
              <td class="px-4 py-4">
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    :class="staff.unit === 'SMP' ? 'bg-[#059669]' : staff.unit === 'SMK' ? 'bg-[#1B5FD9]' : 'bg-[#7C3AED]'"
                  >
                    {{ getInitial(staff.name) }}
                  </span>
                  <div class="min-w-0">
                    <button
                      type="button"
                      class="block max-w-full truncate text-left text-[13px] font-bold text-[#101828] transition hover:text-[#1B5FD9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9]"
                      :title="staff.name"
                      @click="emit('view', staff)"
                    >
                      {{ staff.name }}
                    </button>
                    <p class="mt-1 truncate font-mono text-[10px] text-[#667085]" :title="`NIK: ${staff.nik || '-'}`">
                      NIK: {{ staff.nik || '-' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-4 font-mono">
                <p class="truncate font-semibold text-[#101828]" :title="staff.nip || '-'">{{ staff.nip || '-' }}</p>
                <p class="mt-1 truncate text-[10px] text-[#667085]" :title="`NUPTK: ${staff.nuptk || '-'}`">
                  NUPTK: {{ staff.nuptk || '-' }}
                </p>
              </td>
              <td class="px-3 py-4">
                <p class="line-clamp-2 font-semibold leading-5 text-[#101828]" :title="getPosition(staff.role)">
                  {{ getPosition(staff.role) }}
                </p>
              </td>
              <td class="px-3 py-4">
                <span
                  class="inline-flex rounded-full border px-2 py-1 text-[10px] font-bold"
                  :class="{
                    'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]': staff.unit === 'SMP',
                    'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]': staff.unit === 'SMK',
                    'border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]': staff.unit === 'Yayasan'
                  }"
                >
                  {{ getUnitLabel(staff.unit) }}
                </span>
              </td>
              <td class="px-3 py-4">
                <span class="font-semibold text-[#344054]">{{ getUserRole(staff.role) }}</span>
              </td>
              <td class="px-3 py-4">
                <span
                  v-if="staff.rfidUid"
                  class="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-1 font-mono text-[10px] font-semibold text-[#1D4ED8]"
                >
                  <AdminV2Icon name="card" :size="12" class="shrink-0" />
                  <span class="truncate">{{ staff.rfidUid }}</span>
                </span>
                <span v-else class="text-[11px] text-[#98A2B3]">Belum terdaftar</span>
              </td>
              <td class="px-3 py-4">
                <span
                  v-if="staff.isUserSynced"
                  class="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-1 text-[10px] font-bold text-[#047857]"
                >
                  <AdminV2Icon name="check" :size="12" />
                  Terhubung
                </span>
                <button
                  v-else
                  type="button"
                  class="min-h-8 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-2 text-[10px] font-bold text-[#B45309] transition hover:bg-[#FEF3C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
                  @click="emit('sync-user', staff)"
                >
                  Buat akun
                </button>
              </td>
              <td class="px-3 py-4">
                <span class="inline-flex max-w-full rounded-md bg-[#F2F4F7] px-2 py-1 text-[10px] font-bold text-[#344054]">
                  <span class="truncate" :title="staff.status || '-'">{{ staff.status || '-' }}</span>
                </span>
              </td>
              <td class="px-3 py-4">
                <div class="flex items-center justify-end gap-0.5">
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#1B5FD9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9]"
                    aria-label="Lihat profil"
                    @click="emit('view', staff)"
                  >
                    <AdminV2Icon name="eye" :size="15" />
                  </button>
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#1B5FD9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9]"
                    aria-label="Ubah data"
                    @click="emit('edit', staff)"
                  >
                    <AdminV2Icon name="pencil" :size="15" />
                  </button>
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#FFF1F2] hover:text-[#E11D48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
                    aria-label="Hapus data"
                    @click="emit('delete', staff)"
                  >
                    <AdminV2Icon name="trash" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="divide-y divide-[#E7EBF2] lg:hidden">
        <article
          v-for="staff in staffList"
          :key="staff.id"
          class="p-4 sm:p-5"
        >
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              :class="staff.unit === 'SMP' ? 'bg-[#059669]' : staff.unit === 'SMK' ? 'bg-[#1B5FD9]' : 'bg-[#7C3AED]'"
            >
              {{ getInitial(staff.name) }}
            </span>
            <div class="min-w-0 flex-1">
              <button
                type="button"
                class="block max-w-full truncate text-left text-sm font-bold text-[#101828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9]"
                @click="emit('view', staff)"
              >
                {{ staff.name }}
              </button>
              <p class="mt-1 break-all font-mono text-[11px] text-[#667085]">NIK: {{ staff.nik || '-' }}</p>
            </div>
            <span class="max-w-[7rem] truncate rounded-md bg-[#F2F4F7] px-2 py-1 text-[10px] font-bold text-[#344054]">
              {{ staff.status || '-' }}
            </span>
          </div>

          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-3.5">
            <div class="min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">NIP</dt>
              <dd class="mt-1 break-all font-mono text-xs font-semibold text-[#344054]">{{ staff.nip || '-' }}</dd>
            </div>
            <div class="min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">NUPTK</dt>
              <dd class="mt-1 break-all font-mono text-xs font-semibold text-[#344054]">{{ staff.nuptk || '-' }}</dd>
            </div>
            <div class="col-span-2 min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">Jabatan</dt>
              <dd class="mt-1 text-xs font-semibold leading-5 text-[#101828]">{{ getPosition(staff.role) }}</dd>
            </div>
            <div class="min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">Unit Sekolah</dt>
              <dd class="mt-1 text-xs font-semibold text-[#344054]">{{ getUnitLabel(staff.unit) }}</dd>
            </div>
            <div class="min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">Role User</dt>
              <dd class="mt-1 text-xs font-semibold text-[#344054]">{{ getUserRole(staff.role) }}</dd>
            </div>
            <div class="min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">Smart Card Access</dt>
              <dd class="mt-1 flex items-center gap-1.5 break-all font-mono text-xs font-semibold text-[#1D4ED8]">
                <AdminV2Icon v-if="staff.rfidUid" name="card" :size="13" class="shrink-0" />
                {{ staff.rfidUid || 'Belum terdaftar' }}
              </dd>
            </div>
            <div class="min-w-0">
              <dt class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#98A2B3]">Akun Portal</dt>
              <dd v-if="staff.isUserSynced" class="mt-1 flex items-center gap-1 text-xs font-bold text-[#047857]">
                <AdminV2Icon name="check" :size="13" />
                Terhubung
              </dd>
              <dd v-else class="mt-1">
                <button
                  type="button"
                  class="min-h-11 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 text-xs font-bold text-[#B45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
                  @click="emit('sync-user', staff)"
                >
                  Buat akun
                </button>
              </dd>
            </div>
          </dl>

          <div class="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#DCE3ED] bg-white text-xs font-bold text-[#344054] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9]"
              @click="emit('view', staff)"
            >
              <AdminV2Icon name="eye" :size="15" />
              Detail
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-xs font-bold text-[#1D4ED8] transition hover:bg-[#DBEAFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9]"
              @click="emit('edit', staff)"
            >
              <AdminV2Icon name="pencil" :size="15" />
              Ubah
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] text-xs font-bold text-[#BE123C] transition hover:bg-[#FFE4E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
              @click="emit('delete', staff)"
            >
              <AdminV2Icon name="trash" :size="15" />
              Hapus
            </button>
          </div>
        </article>
      </div>
    </template>

    <footer class="flex flex-col gap-1 border-t border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <span><b>{{ staffList.length }}</b> pendidik terdaftar</span>
      <span class="font-mono text-[11px] text-[#98A2B3]">Tahun Ajaran 2026/2027</span>
    </footer>
  </section>
</template>
