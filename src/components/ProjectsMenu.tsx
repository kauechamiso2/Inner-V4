import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './pillars-menu.css'
import { FolderSimpleIcon } from './SidebarIcons'
import { PROJECTS } from './projects'

type Props = {
  anchor: DOMRect
  onClose: () => void
}

/* Menu de projetos na sidebar — mesmo visual do "Personalizar pilares",
   porém só com ícone + nome (sem fixar/reordenar). Sem ação por enquanto. */
export default function ProjectsMenu({ anchor, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: anchor.top, left: anchor.right + 10 })
  const [closing, setClosing] = useState(false)

  // Clampa dentro da viewport depois de medir a altura real
  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const h = el.offsetHeight
    const top = Math.max(12, Math.min(anchor.top, window.innerHeight - h - 12))
    setPos({ top, left: anchor.right + 10 })
  }, [anchor])

  // Fecha com clique fora ou Esc
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current
      if (el && !el.contains(e.target as Node)) requestClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
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

  return (
    <div
      ref={menuRef}
      className={`pillars-menu projects-menu${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Projetos"
    >
      <div className="pm-header">Projetos</div>

      {PROJECTS.map((p) => (
        <div className="pm-line" key={p.id}>
          <div className="pm-row is-clickable">
            <span className="pm-icon">
              <FolderSimpleIcon />
            </span>
            <span className="pm-label">{p.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
