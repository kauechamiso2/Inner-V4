import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { setThemeMode, useThemeMode } from './themeStore'
import type { ThemeMode } from './themeStore'
import {
  Check,
  ChevronRight,
  Coins,
  Globe,
  Infinity as InfinityIcon,
  Info,
  LogOut,
  Palette,
  Settings,
  Zap,
} from 'lucide-react'
import './profile-menu.css'
import { PacksIcon } from './SidebarIcons'

type Props = {
  anchor: DOMRect
  onClose: () => void
}

/* anel de uso do Inner AI Agent (protótipo: fração já utilizada) */
const RING_R = 9
const RING_C = 2 * Math.PI * RING_R
const AGENT_USED = 0.3

/* submenus (abrem no hover, à direita da linha) */
type SubKind = 'lang' | 'theme'
const LANGS = ['English', 'Português', 'Español']
const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'system', label: 'Sistema' },
]
/* idioma escolhido (protótipo: só muda o rótulo; vale para a sessão) */
let langMemo = 'Português'

/* Menu de conta (clique no avatar). Adapta o menu atual do Inner (modelos +
   créditos) ao nosso design e recebe Packs, Indique e ganhe e Educação, que
   saíram da sidebar. Itens sem ação por hora — protótipo. */
export default function ProfileMenu({ anchor, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: anchor.top, left: anchor.right + 12 })
  const [closing, setClosing] = useState(false)
  const themeMode = useThemeMode()
  const [lang, setLang] = useState(langMemo)

  /* submenu aberto: qual e onde (linha que o abriu) */
  const [sub, setSub] = useState<{ kind: SubKind; top: number; left: number } | null>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const subTimer = useRef<number>()
  useEffect(() => () => window.clearTimeout(subTimer.current), [])
  const openSub = (kind: SubKind, row: HTMLElement) => {
    window.clearTimeout(subTimer.current)
    const r = row.getBoundingClientRect()
    const m = menuRef.current?.getBoundingClientRect()
    setSub({ kind, top: r.top - 6, left: (m?.right ?? r.right) + 6 })
  }
  const closeSubSoon = () => {
    window.clearTimeout(subTimer.current)
    subTimer.current = window.setTimeout(() => setSub(null), 160)
  }
  const keepSub = () => window.clearTimeout(subTimer.current)
  /* linhas sem submenu fecham o aberto ao passar o mouse */
  const rowHover = () => {
    window.clearTimeout(subTimer.current)
    setSub(null)
  }

  // Ancora à direita do avatar, alinhado pela base (abre pra cima)
  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const h = el.offsetHeight
    const top = Math.max(12, Math.min(anchor.bottom - h, window.innerHeight - h - 12))
    setPos({ top, left: anchor.right + 12 })
  }, [anchor])

  // Fecha com clique fora ou Esc
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = menuRef.current
      if (el && !el.contains(e.target as Node) && !subRef.current?.contains(e.target as Node)) requestClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      /* Esc fecha primeiro o submenu */
      if (subRef.current) setSub(null)
      else requestClose()
    }
    const t = window.setTimeout(() => {
      document.addEventListener('pointerdown', onDown)
      document.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestClose = () => {
    setClosing(true)
    window.setTimeout(onClose, 160)
  }

  return (
    <div
      ref={menuRef}
      className={`profile-menu${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="menu"
      aria-label="Conta"
    >
      <div className="pf-section">
        <p className="pf-section-title">Mensagens de IA</p>
        <div className="pf-card">
          <Zap className="pf-card-ic" size={17} strokeWidth={2} />
          <span className="pf-card-label">Modelos Rápidos</span>
          <Info className="pf-info" size={14} strokeWidth={2} />
          <span className="pf-card-val">
            <InfinityIcon size={18} strokeWidth={2} />
          </span>
        </div>
        <div className="pf-card">
          <Zap className="pf-card-ic" size={17} strokeWidth={2} />
          <span className="pf-card-label">Modelos Avançados</span>
          <Info className="pf-info" size={14} strokeWidth={2} />
          <span className="pf-card-val">
            <InfinityIcon size={18} strokeWidth={2} />
          </span>
        </div>
      </div>

      <div className="pf-section">
        <p className="pf-section-title">Recursos Extras</p>
        <div className="pf-card">
          <span className="pf-orb" aria-hidden="true" />
          <span className="pf-card-label">Inner AI Agent</span>
          <Info className="pf-info" size={14} strokeWidth={2} />
          <svg
            className="pf-usage"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            role="img"
            aria-label={`${Math.round(AGENT_USED * 100)}% utilizado`}
          >
            <circle className="pf-usage-track" cx="12" cy="12" r={RING_R} />
            <circle
              className="pf-usage-arc"
              cx="12"
              cy="12"
              r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - AGENT_USED)}
            />
          </svg>
        </div>
        <div className="pf-card">
          <Coins className="pf-card-ic is-credit" size={17} strokeWidth={2} />
          <span className="pf-card-label">Créditos</span>
          <Info className="pf-info" size={14} strokeWidth={2} />
          <span className="pf-card-val">50000</span>
        </div>
        <button type="button" className="pf-add-credits">
          Adicionar Créditos
        </button>
      </div>

      <div className="pf-divider" role="separator">
        <span />
      </div>

      <button type="button" className="pf-row" role="menuitem" onPointerEnter={rowHover}>
        <Settings className="pf-row-ic" size={18} strokeWidth={1.8} />
        <span className="pf-row-label">Configurações da Conta</span>
      </button>
      <button
        type="button"
        className={`pf-row${sub?.kind === 'lang' ? ' is-sub-open' : ''}`}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub?.kind === 'lang'}
        onPointerEnter={(e) => openSub('lang', e.currentTarget)}
        onPointerLeave={closeSubSoon}
        onClick={(e) => (sub?.kind === 'lang' ? setSub(null) : openSub('lang', e.currentTarget))}
      >
        <Globe className="pf-row-ic" size={18} strokeWidth={1.8} />
        <span className="pf-row-label">{lang}</span>
        <ChevronRight className="pf-row-chev" size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className={`pf-row${sub?.kind === 'theme' ? ' is-sub-open' : ''}`}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub?.kind === 'theme'}
        onPointerEnter={(e) => openSub('theme', e.currentTarget)}
        onPointerLeave={closeSubSoon}
        onClick={(e) => (sub?.kind === 'theme' ? setSub(null) : openSub('theme', e.currentTarget))}
      >
        <Palette className="pf-row-ic" size={18} strokeWidth={1.8} />
        <span className="pf-row-label">Tema</span>
        <ChevronRight className="pf-row-chev" size={16} strokeWidth={2} />
      </button>

      <div className="pf-divider" role="separator">
        <span />
      </div>

      <button type="button" className="pf-row" role="menuitem" onPointerEnter={rowHover}>
        <span className="pf-row-ic pf-row-ic-ph">
          <PacksIcon />
        </span>
        <span className="pf-row-label">Packs</span>
      </button>

      <div className="pf-divider" role="separator">
        <span />
      </div>

      <button type="button" className="pf-row pf-row-exit" role="menuitem" onPointerEnter={rowHover}>
        <LogOut className="pf-row-ic" size={18} strokeWidth={1.8} />
        <span className="pf-row-label">Sair</span>
      </button>
      {sub &&
        createPortal(
          <div
            ref={subRef}
            key={sub.kind}
            className={`pf-sub${closing ? ' is-closing' : ''}`}
            role="menu"
            aria-label={sub.kind === 'lang' ? 'Idioma' : 'Tema'}
            style={{ top: sub.top, left: sub.left }}
            onPointerEnter={keepSub}
            onPointerLeave={closeSubSoon}
          >
            {sub.kind === 'lang'
              ? LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="menuitemradio"
                    aria-checked={lang === l}
                    className={`pf-sub-item${lang === l ? ' is-on' : ''}`}
                    onClick={() => {
                      langMemo = l
                      setLang(l)
                    }}
                  >
                    {l}
                    {lang === l && <Check size={15} strokeWidth={2.4} />}
                  </button>
                ))
              : THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={themeMode === t.id}
                    className={`pf-sub-item${themeMode === t.id ? ' is-on' : ''}`}
                    onClick={() => setThemeMode(t.id)}
                  >
                    {t.label}
                    {themeMode === t.id && <Check size={15} strokeWidth={2.4} />}
                  </button>
                ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
