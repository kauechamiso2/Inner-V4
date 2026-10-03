import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './pillars-menu.css'
import { DotsSixIcon, PushPinFillIcon, PushPinIcon } from './SidebarIcons'
import { ChatTeardropIcon } from './SidebarIcons'
import { MODULE_BY_ID, isNavModule } from './pillars'
import type { ModuleDef, ModuleId, NavModuleId } from './pillars'
import { useFlip } from './useFlip'

const ROW_H = 38

type Props = {
  anchor: DOMRect
  /* módulos exibidos neste menu (varia com a diagramação) */
  modules: ModuleDef[]
  pinned: ModuleId[]
  activeId: ModuleId | null
  onTogglePin: (id: ModuleId) => void
  onReorder: (order: ModuleId[]) => void
  onOpenPillar: (id: NavModuleId) => void
  onClose: () => void
  /* diagramações B/C: Chat aparece no topo do menu, travado (sem pin/drag) */
  showChat?: boolean
  chatActive?: boolean
  onOpenChat?: () => void
}

export default function PillarsMenu({
  anchor,
  modules,
  pinned,
  activeId,
  onTogglePin,
  onReorder,
  onOpenPillar,
  onClose,
  showChat = false,
  chatActive = false,
  onOpenChat,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const captureMenu = useFlip(menuRef)
  const [pos, setPos] = useState({ top: anchor.top, left: anchor.right + 10 })
  const [closing, setClosing] = useState(false)

  const [dragId, setDragId] = useState<ModuleId | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const dragRef = useRef({ startY: 0, baseIndex: 0, currIndex: 0 })
  /* evita que o fim de um arrasto conte como clique de navegação */
  const suppressClickRef = useRef(false)

  const unpinned = modules.filter((m) => !pinned.includes(m.id)).map((m) => m.id)

  // Clampa dentro da viewport depois de medir a altura real
  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const h = el.offsetHeight
    const top = Math.max(12, Math.min(anchor.top, window.innerHeight - h - 12))
    setPos({ top, left: anchor.right + 10 })
  }, [anchor, pinned.length])

  // Fecha com clique fora ou Esc
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current
      if (el && !el.contains(e.target as Node)) requestClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    // adia um tick para não fechar com o próprio clique que abriu
    const t = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestClose = () => {
    setClosing(true)
    window.setTimeout(onClose, 170)
  }

  const handlePin = (id: ModuleId) => {
    captureMenu()
    onTogglePin(id)
  }

  // ----- Drag para reordenar os fixados -----

  const onHandleDown = (e: React.PointerEvent, id: ModuleId) => {
    e.preventDefault()
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* pointer sintético (testes) não suporta capture */
    }
    const index = pinned.indexOf(id)
    dragRef.current = { startY: e.clientY, baseIndex: index, currIndex: index }
    setDragId(id)
    setDragOffset(0)
  }

  const onHandleMove = (e: React.PointerEvent, id: ModuleId) => {
    if (dragId !== id) return
    const { startY, baseIndex, currIndex } = dragRef.current
    const offset = e.clientY - startY
    const target = Math.max(0, Math.min(pinned.length - 1, baseIndex + Math.round(offset / ROW_H)))
    if (target !== currIndex) {
      dragRef.current.currIndex = target
      const next = [...pinned]
      next.splice(next.indexOf(id), 1)
      next.splice(target, 0, id)
      captureMenu()
      onReorder(next)
    }
    setDragOffset(offset)
  }

  const onHandleUp = (id: ModuleId) => {
    if (dragId !== id) return
    if (Math.abs(dragOffset) > 3) {
      suppressClickRef.current = true
      window.setTimeout(() => (suppressClickRef.current = false), 0)
    }
    setDragId(null)
    setDragOffset(0)
  }

  const handleOpen = (id: ModuleId) => {
    if (suppressClickRef.current) return
    /* Sites ainda não tem fluxo prototipado: fica no menu, mas não navega */
    if (!isNavModule(id)) return
    onOpenPillar(id)
    requestClose()
  }

  const dragVisual = dragId
    ? dragOffset - (dragRef.current.currIndex - dragRef.current.baseIndex) * ROW_H
    : 0

  return (
    <div
      ref={menuRef}
      className={`pillars-menu${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Personalizar pilares"
    >
      <div className="pm-header">Personalizar pilares</div>

      {showChat && (
        <div className="pm-line">
          <div
            className={`pm-row is-static is-clickable${chatActive ? ' is-current' : ''}`}
            onClick={() => {
              if (suppressClickRef.current) return
              onOpenChat?.()
              requestClose()
            }}
          >
            <span className="pm-handle is-empty" />
            <span className="pm-icon">
              <ChatTeardropIcon />
            </span>
            <span className="pm-label">Chat</span>
          </div>
        </div>
      )}

      {pinned.map((id) => {
        const def = MODULE_BY_ID[id]
        const isDragging = dragId === id
        return (
          <div className="pm-line" key={id} data-flip-id={id} data-flip-skip={isDragging}>
            <div
              className={`pm-row${isNavModule(id) ? ' is-clickable' : ''}${isDragging ? ' is-dragging' : ''}${activeId === id ? ' is-current' : ''}`}
              style={isDragging ? { transform: `translateY(${dragVisual}px)` } : undefined}
              onClick={() => handleOpen(id)}
            >
              <span
                className="pm-handle"
                onPointerDown={(e) => onHandleDown(e, id)}
                onPointerMove={(e) => onHandleMove(e, id)}
                onPointerUp={() => onHandleUp(id)}
                onPointerCancel={() => onHandleUp(id)}
              >
                <DotsSixIcon />
              </span>
              <span className={`pm-icon${def.narrowIcon ? ' is-16' : ''}`}>{def.menuIcon}</span>
              <span className="pm-label">{def.label}</span>
              <button
                className="pm-pin is-pinned"
                type="button"
                aria-label={`Desafixar ${def.label}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePin(id)
                }}
              >
                <PushPinFillIcon />
              </button>
            </div>
          </div>
        )
      })}

      <div className="pm-hint">Arraste para reordenar os fixados</div>
      <div className="pm-divider">
        <span />
      </div>

      {unpinned.map((id) => {
        const def = MODULE_BY_ID[id]
        return (
          <div className="pm-line" key={id} data-flip-id={id}>
            <div
              className={`pm-row${isNavModule(id) ? ' is-clickable' : ''}${activeId === id ? ' is-current' : ''}`}
              onClick={() => handleOpen(id)}
            >
              <span className="pm-handle is-empty" />
              <span className={`pm-icon${def.narrowIcon ? ' is-16' : ''}`}>{def.menuIcon}</span>
              <span className="pm-label">{def.label}</span>
              <button
                className="pm-pin"
                type="button"
                aria-label={`Fixar ${def.label}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePin(id)
                }}
              >
                <PushPinIcon />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
