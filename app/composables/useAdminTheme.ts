import { computed } from 'vue'

export type AdminTheme = 'light' | 'dark'

const STORAGE_KEY = 'darqia-admin-theme'

const applyTheme = (theme: AdminTheme) => {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.style.colorScheme = 'dark'
  } else {
    delete document.documentElement.dataset.theme
    document.documentElement.style.colorScheme = ''
  }
}

// Tema AdminV2: terang bawaan, gelap "Dark Navy". Pilihan tersimpan di perangkat
// (localStorage); pertama kali mengikuti setelan sistem. Atribut data-theme di
// <html> hanya dipasang selama berada di halaman admin (lihat plugin tema).
export const useAdminTheme = () => {
  const theme = useState<AdminTheme>('admin-theme', () => 'light')
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (next: AdminTheme) => {
    theme.value = next
    applyTheme(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* abaikan */ }
  }

  const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')

  const initTheme = () => {
    let initial: AdminTheme = 'light'
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') initial = saved
      else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) initial = 'dark'
    } catch { /* abaikan */ }
    theme.value = initial
    applyTheme(initial)
  }

  const clearTheme = () => {
    theme.value = 'light'
    applyTheme('light')
  }

  return { theme, isDark, setTheme, toggleTheme, initTheme, clearTheme }
}
