import { useEffect, useRef, useState } from 'react'
import './theme-switcher.css'
import type { SidebarLayout } from './pillars'

type ThemeId = 'original' | 'frio' | 'neutro'

const LAYOUTS: { id: SidebarLayout; name: string; hint: string }[] = [
  { id: 'a', name: 'Diagramação A', hint: 'Fixos no topo' },
  { id: 'b', name: 'Diagramação B', hint: 'Tudo fixável' },
  { id: 'c', name: 'Diagramação C', hint: 'Pilares após o Chat' },
]

const THEMES: { id: ThemeId; name: string; swatches: [string, string, string] }[] = [
  { id: 'original', name: 'Cor 1 · Atual', swatches: ['#f2f2f2', '#f8f8f8', '#fcfcfc'] },
  { id: 'frio', name: 'Cor 2 · Frio sutil', swatches: ['#f7f8fa', '#e9ebef', '#ffffff'] },
  { id: 'neutro', name: 'Cor 3 · Neutro', swatches: ['#f7f7f7', '#e8e8e8', '#efefef'] },
]

const STORAGE_KEY = 'inner-v4-theme'

function Check() {
  return (
    <svg className="theme-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.7 3.9 5.6 10 2.3 6.7"
        stroke="#1c1c1c"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function applyTheme(id: ThemeId) {
  if (id === 'original') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = id
}

type Props = {
  layout: SidebarLayout
  onLayoutChange: (layout: SidebarLayout) => void
}

export default function ThemeSwitcher({ layout, onLayoutChange }: Props) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>('original')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let saved: ThemeId | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    } catch {
      /* storage indisponível */
    }
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved)
      applyTheme(saved)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id: ThemeId) => {
    setTheme(id)
    applyTheme(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* storage indisponível */
    }
  }

  return (
    <div className="theme-switcher" ref={rootRef}>
      {open && (
        <div className="theme-pop" role="menu" aria-label="Variações de cor">
          <div className="theme-pop-header">Variações de cor</div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === t.id}
              className={`theme-option${theme === t.id ? ' is-active' : ''}`}
              onClick={() => pick(t.id)}
            >
              <span
                className="theme-swatch"
                style={{
                  background: `linear-gradient(135deg, ${t.swatches[0]} 0 34%, ${t.swatches[1]} 34% 67%, ${t.swatches[2]} 67% 100%)`,
                }}
              />
              <span className="theme-name">{t.name}</span>
              {theme === t.id && <Check />}
            </button>
          ))}

          <div className="theme-pop-header is-section">Diagramação</div>
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="menuitemradio"
              aria-checked={layout === l.id}
              className={`theme-option${layout === l.id ? ' is-active' : ''}`}
              onClick={() => onLayoutChange(l.id)}
            >
              <span className="layout-badge">{l.id.toUpperCase()}</span>
              <span className="theme-name">
                {l.name}
                <span className="theme-hint">{l.hint}</span>
              </span>
              {layout === l.id && <Check />}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`theme-fab${open ? ' is-open' : ''}`}
        aria-label="Variações de cor"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="theme-fab-dots">
          <span style={{ background: '#6e62e5' }} />
          <span style={{ background: '#f36430' }} />
          <span style={{ background: '#4285f4' }} />
        </span>
      </button>
    </div>
  )
}
