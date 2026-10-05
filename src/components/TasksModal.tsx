import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './context-modal.css'
import './tasks-page.css'
import TaskCard from './TaskCard'
import type { Task } from './tasks'

export default function TasksModal({
  open,
  onClose,
  tasks,
}: {
  open: boolean
  onClose: () => void
  tasks: Task[]
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!openMenu) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.task-menu') && !t.closest('.task-more')) setOpenMenu(null)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [openMenu])

  if (!open) return null

  return createPortal(
    <div className="ctx-overlay" onClick={onClose}>
      <div
        className="ctx-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Tarefas do projeto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Tarefas</h2>
            <p className="ctx-modal-sub">Tarefas automatizadas deste projeto</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body tasks-modal-body">
          {tasks.length > 0 ? (
            <div className="tasks-grid">
              {tasks.map((t, i) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  i={i}
                  inactive={!!t.status}
                  showProject={false}
                  open={openMenu === t.id}
                  onToggle={() => setOpenMenu((c) => (c === t.id ? null : t.id))}
                  onOpen={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="tasks-modal-empty">Nenhuma tarefa neste projeto ainda</div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
