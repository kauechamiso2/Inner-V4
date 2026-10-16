import { useSyncExternalStore } from 'react'

/* Tema da plataforma (Claro, Escuro ou Sistema). Controlado pelo menu da
   conta; "Sistema" acompanha o modo do sistema operacional ao vivo. */

export type ThemeMode = 'light' | 'dark' | 'system'

const KEY = 'inner-v4-theme-mode'
const OLD_KEY = 'inner-v4-dark'
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
    /* chave antiga (botão de lua): '1' era escuro */
    if (localStorage.getItem(OLD_KEY) === '1') return 'dark'
  } catch {
    /* storage indisponível */
  }
  return 'light'
}

let mode: ThemeMode = read()
const listeners = new Set<() => void>()

function apply() {
  const dark = mode === 'dark' || (mode === 'system' && !!media?.matches)
  if (dark) document.documentElement.dataset.dark = '1'
  else delete document.documentElement.dataset.dark
}

export function setThemeMode(next: ThemeMode) {
  mode = next
  try {
    localStorage.setItem(KEY, next)
    localStorage.removeItem(OLD_KEY)
  } catch {
    /* storage indisponível */
  }
  apply()
  listeners.forEach((l) => l())
}

/* aplica já ao carregar e acompanha o sistema quando o modo é "Sistema" */
if (typeof document !== 'undefined') {
  apply()
  media?.addEventListener('change', () => mode === 'system' && apply())
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => mode,
  )
}
