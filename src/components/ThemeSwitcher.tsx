import { useEffect, useRef, useState } from 'react'
import './theme-switcher.css'

type Props = {
  coachOpen: boolean
  onCoachToggle: (open: boolean) => void
}

const DARK_KEY = 'inner-v4-dark'

function applyDark(on: boolean) {
  if (on) document.documentElement.dataset.dark = '1'
  else delete document.documentElement.dataset.dark
}

export default function ThemeSwitcher({ coachOpen, onCoachToggle }: Props) {
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
          <div className="theme-pop-header">Overlays</div>
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
