import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pin } from 'lucide-react'
import './apps-gallery.css'
import { APP_BY_ID } from './apps'
import type { AppTool } from './apps'

type Props = {
  anchor: DOMRect
  /* lista a exibir (completa = APPS; reduzida = REDUCED_APPS no redesign) */
  tools: AppTool[]
  pinned: string[]
  activeId: string | null
  onTogglePin: (id: string) => void
  onOpen: (tool: AppTool) => void
  onClose: () => void
}

/* Galeria "Mais Apps": grid com ferramentas fixadas + todas. Fixar pelo hover
   (ícone de pin) ou com o botão direito. */
export default function AppsGallery({ anchor, tools, pinned, activeId, onTogglePin, onOpen, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: anchor.top, left: anchor.right + 10 })
  const [closing, setClosing] = useState(false)

  const pinnedTools = pinned.map((id) => APP_BY_ID[id]).filter(Boolean)

  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const h = el.offsetHeight
    const top = Math.max(12, Math.min(anchor.top, window.innerHeight - h - 12))
    setPos({ top, left: anchor.right + 10 })
  }, [anchor, pinned.length])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = menuRef.current
      if (el && !el.contains(e.target as Node)) requestClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
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

  const Cell = ({ tool }: { tool: AppTool }) => {
    const isPinned = pinned.includes(tool.id)
    return (
      <button
        type="button"
        className={`ag-cell${activeId === tool.id ? ' is-active' : ''}`}
        onClick={() => {
          if (tool.view || tool.action) {
            onOpen(tool)
            requestClose()
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          onTogglePin(tool.id)
        }}
      >
        <span className={`ag-ic anim-${tool.anim}`}>{tool.icon}</span>
        <span className="ag-label">{tool.label}</span>
        <span
          className={`ag-pin${isPinned ? ' is-pinned' : ''}`}
          role="button"
          aria-label={isPinned ? `Desafixar ${tool.label}` : `Fixar ${tool.label}`}
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin(tool.id)
          }}
        >
          <Pin size={13} strokeWidth={2} fill={isPinned ? 'currentColor' : 'none'} />
          <span className="ag-pin-tip" aria-hidden="true">
            {isPinned ? 'Desafixar' : 'Fixar'}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div
      ref={menuRef}
      className={`apps-gallery${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Mais Apps"
    >
      <div className="ag-scroll">
        {pinnedTools.length > 0 && (
          <section className="ag-section">
            <h3 className="ag-title">Ferramentas fixadas</h3>
            <p className="ag-sub">Ferramentas fixadas são priorizadas na barra de navegação</p>
            <div className="ag-grid">
              {pinnedTools.map((tool) => (
                <Cell key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        <section className="ag-section">
          <h3 className="ag-title">Todas as ferramentas</h3>
          <p className="ag-sub">Passe o mouse e clique no pin (ou botão direito) para fixar</p>
          <div className="ag-grid">
            {tools.filter((tool) => !pinned.includes(tool.id)).map((tool) => (
              <Cell key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
