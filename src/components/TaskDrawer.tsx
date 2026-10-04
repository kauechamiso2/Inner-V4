import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { CalendarClock, MoreHorizontal, Pause, Pencil, Play, Repeat, Trash2, X, Zap } from 'lucide-react'
import type { Task } from './tasks'
import './task-drawer.css'

type Props = {
  task: Task
  closing: boolean
  onClose: () => void
}

export default function TaskDrawer({ task, closing, onClose }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const inactive = !!task.status

  const iconStyle: CSSProperties = inactive
    ? { background: 'var(--lib-tile-neutral)' }
    : { background: `color-mix(in srgb, ${task.color} 16%, var(--pop-surface))` }

  // Esc fecha o drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // clique fora fecha o menu "..."
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.td-menu') && !t.closest('.td-more')) setMenuOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [menuOpen])

  return (
    <aside className={`app-drawer${closing ? ' is-closing' : ''}`} aria-label={`Tarefa: ${task.name}`}>
      <div className="app-drawer-inner">
        <header className="td-header">
          <span className="td-title">
            <span className="td-emoji" style={iconStyle}>
              <span className={inactive ? 'is-muted' : undefined}>{task.emoji}</span>
            </span>
            <span className="td-name">{task.name}</span>
          </span>

          <div className="td-actions">
            <button type="button" className="td-icon-btn" aria-label="Editar tarefa">
              <Pencil size={16} strokeWidth={1.9} />
            </button>
            <button type="button" className="td-icon-btn" aria-label={inactive ? 'Retomar' : 'Pausar'}>
              {inactive ? <Play size={16} strokeWidth={1.9} /> : <Pause size={16} strokeWidth={1.9} />}
            </button>
            <button
              type="button"
              className={`td-icon-btn td-more${menuOpen ? ' is-open' : ''}`}
              aria-label="Mais opções"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>
            <button type="button" className="td-icon-btn" aria-label="Fechar" onClick={onClose}>
              <X size={18} strokeWidth={2} />
            </button>

            {menuOpen && (
              <div className="td-menu" role="menu">
                <button type="button" className="task-menu-item" role="menuitem">
                  <Zap size={15} strokeWidth={1.9} />
                  Executar agora
                </button>
                <div className="task-menu-sep" />
                <button type="button" className="task-menu-item is-danger" role="menuitem">
                  <Trash2 size={15} strokeWidth={1.9} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="td-schedule">
          {task.recurring ? <Repeat size={15} strokeWidth={2} /> : <CalendarClock size={15} strokeWidth={2} />}
          <span className="td-schedule-text">{task.schedule}</span>
          {inactive ? (
            <span className="td-badge">{task.status}</span>
          ) : (
            task.next && <span className="td-schedule-next">· Próxima: {task.next}</span>
          )}
        </div>

        <div className="td-body">
          <p className="td-desc">{task.description}</p>
          <p className="td-last">
            {task.last ? `Última execução ${task.last}` : 'Ainda não executada'}
          </p>
          <div className="td-result">
            <span className="td-result-label">Resultado</span>
            <div className="td-result-empty">O resultado da próxima execução aparecerá aqui.</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
