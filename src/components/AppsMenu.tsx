import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './pillars-menu.css'
import { PILLAR_DEFS } from './pillars'
import type { PillarId } from './pillars'

/* pilares escondidos do menu "Mais apps" por hora */
const HIDDEN: PillarId[] = ['assistentes']

type Props = {
  anchor: DOMRect
  activeId: PillarId | null
  onOpenPillar: (id: PillarId) => void
  onClose: () => void
}

/* Menu "Mais apps" — lista o restante dos pilares (sem fixar/reordenar). */
export default function AppsMenu({ anchor, activeId, onOpenPillar, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: anchor.top, left: anchor.right + 10 })
  const [closing, setClosing] = useState(false)

  const items = PILLAR_DEFS.filter((p) => !HIDDEN.includes(p.id))

  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const h = el.offsetHeight
    const top = Math.max(12, Math.min(anchor.top, window.innerHeight - h - 12))
    setPos({ top, left: anchor.right + 10 })
  }, [anchor])

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
    window.setTimeout(onClose, 170)
  }

  return (
    <div
      ref={menuRef}
      className={`pillars-menu apps-menu${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Mais apps"
    >
      <div className="pm-header">Mais apps</div>
      {items.map((def) => (
        <div className="pm-line" key={def.id}>
          <div
            className={`pm-row is-clickable${activeId === def.id ? ' is-current' : ''}`}
            onClick={() => {
              onOpenPillar(def.id)
              requestClose()
            }}
          >
            <span className="pm-handle is-empty" />
            <span className={`pm-icon${def.narrowIcon ? ' is-16' : ''}`}>{def.menuIcon}</span>
            <span className="pm-label">{def.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
