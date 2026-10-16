import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronRight, FolderInput, FolderMinus, Pencil, Pin, PinOff, Share, Trash2 } from 'lucide-react'
import './tasks-page.css'
import './chat-modals.css'

export type ChatMenuProject = { id: string; name: string; emoji?: string }

/* menu "..." de um chat (histórico e cabeçalho da conversa): renderizado em
   portal, posicionado pelo botão que o abriu */
export default function ChatMenu({
  anchor,
  pinned,
  projects,
  currentProjectId = null,
  onRename,
  onTogglePin,
  onShare,
  onMove,
  onDelete,
  onClose,
}: {
  anchor: DOMRect
  pinned: boolean
  projects: ChatMenuProject[]
  currentProjectId?: string | null
  onRename: () => void
  onTogglePin: () => void
  onShare: () => void
  onMove: (projectId: string | null) => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; flip: boolean }>({
    top: anchor.bottom + 6,
    left: anchor.left,
    flip: false,
  })
  const [subOpen, setSubOpen] = useState(false)

  /* mantém o menu dentro da tela (abre para cima/esquerda quando precisa) */
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    let top = anchor.bottom + 6
    let left = anchor.left
    if (top + r.height > window.innerHeight - 8) top = Math.max(8, anchor.top - r.height - 6)
    if (left + r.width > window.innerWidth - 8) left = Math.max(8, anchor.right - r.width)
    /* submenu abre à esquerda se não couber à direita */
    const flip = left + r.width + 220 > window.innerWidth
    setPos({ top, left, flip })
  }, [anchor])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onScroll = () => onClose()
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onScroll)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onScroll)
    }
  }, [onClose])

  const act = (fn: () => void) => {
    onClose()
    fn()
  }

  return createPortal(
    <div className="chat-ctx" role="menu" ref={ref} style={{ top: pos.top, left: pos.left }}>
      <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(onRename)}>
        <Pencil size={15} strokeWidth={1.9} />
        Renomear
      </button>
      <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(onTogglePin)}>
        {pinned ? <PinOff size={15} strokeWidth={1.9} /> : <Pin size={15} strokeWidth={1.9} />}
        {pinned ? 'Desfixar' : 'Fixar'}
      </button>
      <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(onShare)}>
        <Share size={15} strokeWidth={1.9} />
        Compartilhar
      </button>
      <div
        className="chat-ctx-subwrap"
        style={{ position: 'relative' }}
        onMouseEnter={() => setSubOpen(true)}
        onMouseLeave={() => setSubOpen(false)}
      >
        <button
          type="button"
          className={`task-menu-item${subOpen ? ' is-open' : ''}`}
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={subOpen}
          onClick={() => setSubOpen((o) => !o)}
        >
          <FolderInput size={15} strokeWidth={1.9} />
          Mover para projeto
          <ChevronRight className="chat-ctx-chev" size={15} strokeWidth={2} />
        </button>
        {subOpen && (
          <div className={`chat-ctx-sub${pos.flip ? ' is-left' : ''}`} role="menu">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="task-menu-item"
                role="menuitem"
                onClick={() => act(() => onMove(p.id))}
              >
                <span className="chat-ctx-emoji" aria-hidden="true">
                  {p.emoji ?? '📁'}
                </span>
                {p.name}
                {p.id === currentProjectId && <Check className="chat-ctx-check" size={15} strokeWidth={2.2} />}
              </button>
            ))}
            {currentProjectId && (
              <>
                <div className="task-menu-sep" />
                <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(() => onMove(null))}>
                  <FolderMinus size={15} strokeWidth={1.9} />
                  Remover do projeto
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="task-menu-sep" />
      <button type="button" className="task-menu-item is-danger" role="menuitem" onClick={() => act(onDelete)}>
        <Trash2 size={15} strokeWidth={1.9} />
        Excluir chat
      </button>
    </div>,
    document.body,
  )
}
