import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pencil, SquarePen, Trash2 } from 'lucide-react'

/* "..." de uma base de conhecimento (card na Biblioteca e cabeçalho da base) */
export default function KnowledgeBaseMenu({
  onChat,
  onEdit,
  onDelete,
  className = '',
}: {
  onChat: () => void
  onEdit: () => void
  onDelete: () => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
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
  const pick = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }
  return (
    <span className={`kb-menu ${className}${open ? ' is-open' : ''}`} ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="kb-more"
        aria-label="Ações da base"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>
      {open && (
        <div className="task-menu kb-menu-list" role="menu">
          <button type="button" className="task-menu-item" role="menuitem" onClick={pick(onChat)}>
            <SquarePen size={15} strokeWidth={1.9} />
            Iniciar chat com a base
          </button>
          <button type="button" className="task-menu-item" role="menuitem" onClick={pick(onEdit)}>
            <Pencil size={15} strokeWidth={1.9} />
            Editar nome e ícone
          </button>
          <div className="task-menu-sep" />
          <button type="button" className="task-menu-item is-danger" role="menuitem" onClick={pick(onDelete)}>
            <Trash2 size={15} strokeWidth={1.9} />
            Excluir
          </button>
        </div>
      )}
    </span>
  )
}
