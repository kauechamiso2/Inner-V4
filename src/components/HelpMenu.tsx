import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Headset, PlayCircle } from 'lucide-react'
import './tasks-page.css'
import './help-menu.css'

/* Submenu de "Ajuda" no rail: abre no hover (ou clique), à direita do botão,
   alinhado pela base.
   Itens sem ação por enquanto (protótipo). */
export default function HelpMenu({
  anchor,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: {
  anchor: DOMRect
  onClose: () => void
  /* hover: manter aberto enquanto o ponteiro está no menu */
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: anchor.right + 12, top: anchor.top })

  /* alinha a base do menu com a base do botão (abre para cima) */
  useLayoutEffect(() => {
    const h = ref.current?.offsetHeight ?? 0
    setPos({ left: anchor.right + 12, top: Math.max(8, anchor.bottom - h) })
  }, [anchor])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!ref.current?.contains(t) && !t.closest('[data-help-trigger]')) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const items = [
    { label: 'Suporte', icon: <Headset size={18} strokeWidth={1.7} /> },
    { label: 'Tutoriais', icon: <BookOpen size={18} strokeWidth={1.7} /> },
    { label: 'Reassistir onboarding', icon: <PlayCircle size={18} strokeWidth={1.7} /> },
  ]

  return createPortal(
    <div
      ref={ref}
      className="task-menu help-menu"
      role="menu"
      aria-label="Ajuda"
      style={{ left: pos.left, top: pos.top }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {items.map((it) => (
        <button key={it.label} type="button" role="menuitem" className="task-menu-item" onClick={onClose}>
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>,
    document.body,
  )
}
