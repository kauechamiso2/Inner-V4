import { useEffect, useRef, useState } from 'react'
import './theme-switcher.css'
import type { SidebarLayout } from './pillars'

/* O rail (antiga "E") agora é a diagramação A/padrão; as demais seguem após. */
const LAYOUTS: { id: SidebarLayout; badge: string; name: string; hint: string }[] = [
  { id: 'e', badge: 'A', name: 'Rail com nomes', hint: 'Padrão' },
  { id: 'a', badge: 'B', name: 'Principal', hint: 'Tudo a partir da Biblioteca' },
  { id: 'b', badge: 'C', name: 'Fixos no topo', hint: 'Library/Tarefas travados' },
  { id: 'c', badge: 'D', name: 'Tudo fixável', hint: 'Home e Biblioteca fixos' },
  { id: 'd', badge: 'E', name: 'Pilares após o Chat', hint: 'Fixos embaixo' },
]

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

type Props = {
  layout: SidebarLayout
  onLayoutChange: (layout: SidebarLayout) => void
  coachOpen: boolean
  onCoachToggle: (open: boolean) => void
}

const DARK_KEY = 'inner-v4-dark'

function applyDark(on: boolean) {
  if (on) document.documentElement.dataset.dark = '1'
  else delete document.documentElement.dataset.dark
}

export default function ThemeSwitcher({ layout, onLayoutChange, coachOpen, onCoachToggle }: Props) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* Cor 1 é a única paleta: limpa qualquer variação antiga salva */
    delete document.documentElement.dataset.theme
    try {
      localStorage.removeItem('inner-v4-theme')
    } catch {
      /* storage indisponível */
    }
    try {
      if (localStorage.getItem(DARK_KEY) === '1') {
        setDark(true)
        applyDark(true)
      }
    } catch {
      /* storage indisponível */
    }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    applyDark(next)
    try {
      localStorage.setItem(DARK_KEY, next ? '1' : '0')
    } catch {
      /* storage indisponível */
    }
  }

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

  return (
    <div className="theme-switcher" ref={rootRef}>
      {open && (
        <div className="theme-pop" role="menu" aria-label="Preferências">
          <div className="theme-pop-header">Diagramação</div>
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="menuitemradio"
              aria-checked={layout === l.id}
              className={`theme-option${layout === l.id ? ' is-active' : ''}`}
              onClick={() => onLayoutChange(l.id)}
            >
              <span className="layout-badge">{l.badge}</span>
              <span className="theme-name">
                {l.name}
                <span className="theme-hint">{l.hint}</span>
              </span>
              {layout === l.id && <Check />}
            </button>
          ))}

          <div className="theme-pop-header is-section">Overlays</div>
          <button
            type="button"
            role="switch"
            aria-checked={coachOpen}
            className="theme-option"
            onClick={() => onCoachToggle(!coachOpen)}
          >
            <span className="theme-name">
              Coachmark da Biblioteca
              <span className="theme-hint">Força exibir mesmo após fechar</span>
            </span>
            <span className={`mini-switch${coachOpen ? ' is-on' : ''}`} aria-hidden="true">
              <span className="mini-switch-knob" />
            </span>
          </button>
        </div>
      )}

      <div className="theme-fabs">
        <button
          type="button"
          className={`theme-fab theme-fab-dark${dark ? ' is-dark-on' : ''}`}
          aria-label={dark ? 'Desativar modo escuro' : 'Ativar modo escuro'}
          aria-pressed={dark}
          onClick={toggleDark}
        >
          {dark ? (
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 1.4v1.5M8 13.1v1.5M1.4 8h1.5M13.1 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13.6 9.6a5.9 5.9 0 0 1-7.2-7.2 6.2 6.2 0 1 0 7.2 7.2Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
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
    </div>
  )
}
