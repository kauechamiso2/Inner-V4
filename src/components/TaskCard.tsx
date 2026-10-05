import type { CSSProperties } from 'react'
import { MoreHorizontal, Pencil, Pause, Play, Repeat, Trash2, Zap } from 'lucide-react'
import type { Task } from './tasks'

/* Card de tarefa — reusado na página de Tarefas e no modal de Tarefas do projeto */
export default function TaskCard({
  task,
  i,
  inactive,
  open,
  showProject = true,
  onToggle,
  onOpen,
}: {
  task: Task
  i: number
  inactive?: boolean
  open: boolean
  /* mostra o chip do projeto ao qual a tarefa pertence */
  showProject?: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  const iconStyle: CSSProperties = inactive
    ? { background: 'var(--lib-tile-neutral)' }
    : { background: `color-mix(in srgb, ${task.color} 16%, var(--card-surface))` }

  return (
    <div
      className={`task-card${inactive ? ' is-inactive' : ''}`}
      style={{ '--i': i } as CSSProperties}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <button
        type="button"
        className={`task-more${open ? ' is-open' : ''}`}
        aria-label="Ações da tarefa"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>

      {open && (
        <div className="task-menu" role="menu" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="task-menu-item" role="menuitem">
            <Zap size={15} strokeWidth={1.9} />
            Executar agora
          </button>
          <button type="button" className="task-menu-item" role="menuitem">
            <Pencil size={15} strokeWidth={1.9} />
            Editar tarefa
          </button>
          <button type="button" className="task-menu-item" role="menuitem">
            {inactive ? <Play size={15} strokeWidth={1.9} /> : <Pause size={15} strokeWidth={1.9} />}
            {inactive ? 'Retomar' : 'Pausar'}
          </button>
          <div className="task-menu-sep" />
          <button type="button" className="task-menu-item is-danger" role="menuitem">
            <Trash2 size={15} strokeWidth={1.9} />
            Excluir
          </button>
        </div>
      )}

      <span className="task-icon" style={iconStyle}>
        <span className="task-emoji">{task.emoji}</span>
      </span>

      <div className="task-text">
        {showProject && task.project && (
          <span className="task-project">
            <span className="task-project-emoji" aria-hidden="true">
              {task.project.emoji}
            </span>
            {task.project.name}
          </span>
        )}
        <span className="task-name">{task.name}</span>
        {inactive ? (
          <span className="task-badge">
            <Pause size={12} strokeWidth={2.2} />
            {task.status}
          </span>
        ) : task.recurring ? (
          <span className="task-meta task-next">
            <span className="task-rec">
              <Repeat size={13} strokeWidth={2} />
            </span>
            Próxima: {task.next}
          </span>
        ) : (
          <span className="task-meta task-next">Uma vez · {task.next}</span>
        )}
        <span className="task-meta task-last">
          {task.last ? `Executada ${task.last}` : 'Ainda não executada'}
        </span>
      </div>
    </div>
  )
}
