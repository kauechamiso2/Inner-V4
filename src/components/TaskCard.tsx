import type { CSSProperties } from 'react'
import { ChevronRight, Loader2, MoreHorizontal, Pencil, Pause, Play, Repeat, Trash2, Zap } from 'lucide-react'
import type { Task } from './tasks'

/* Card de tarefa (página de Tarefas agendadas) */
export default function TaskCard({
  task,
  i,
  inactive,
  open,
  onToggle,
  onOpen,
  running = false,
  onRun,
  onEdit,
  onTogglePause,
  onDelete,
}: {
  task: Task
  i: number
  inactive?: boolean
  open: boolean
  onToggle: () => void
  onOpen: () => void
  /* "Executar agora" em andamento */
  running?: boolean
  onRun?: () => void
  onEdit?: () => void
  onTogglePause?: () => void
  onDelete?: () => void
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
        aria-label="Ações do loop"
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
          <button type="button" className="task-menu-item" role="menuitem" disabled={running} onClick={onRun}>
            <Zap size={15} strokeWidth={1.9} />
            Executar agora
          </button>
          <button type="button" className="task-menu-item" role="menuitem" onClick={onEdit}>
            <Pencil size={15} strokeWidth={1.9} />
            Editar loop
          </button>
          <button type="button" className="task-menu-item" role="menuitem" onClick={onTogglePause}>
            {inactive ? <Play size={15} strokeWidth={1.9} /> : <Pause size={15} strokeWidth={1.9} />}
            {inactive ? 'Retomar' : 'Pausar'}
          </button>
          <div className="task-menu-sep" />
          <button type="button" className="task-menu-item is-danger" role="menuitem" onClick={onDelete}>
            <Trash2 size={15} strokeWidth={1.9} />
            Excluir
          </button>
        </div>
      )}

      <span className="task-icon" style={iconStyle}>
        <span className="task-emoji">{task.emoji}</span>
      </span>

      <div className="task-text">

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
        {running ? (
          <span className="task-meta task-last is-running">
            <Loader2 className="task-spin" size={12} strokeWidth={2.4} aria-hidden="true" />
            Executando agora
          </span>
        ) : (
          <span className="task-meta task-last">
            {task.last ? `Executada ${task.last}` : 'Ainda não executada'}
          </span>
        )}
      </div>
    </div>
  )
}

/* Linha de loop (Ativos/Inativos em lista, para não competir com os cards do Explorar) */
export function TaskRow({
  task,
  i,
  inactive,
  open,
  onToggle,
  onOpen,
  running = false,
  onRun,
  onEdit,
  onTogglePause,
  onDelete,
}: {
  task: Task
  i: number
  inactive?: boolean
  open: boolean
  onToggle: () => void
  onOpen: () => void
  running?: boolean
  onRun?: () => void
  onEdit?: () => void
  onTogglePause?: () => void
  onDelete?: () => void
}) {
  const iconStyle: CSSProperties = inactive
    ? { background: 'var(--lib-tile-neutral)' }
    : { background: `color-mix(in srgb, ${task.color} 16%, var(--pop-surface))` }

  return (
    <div
      className={`task-row${inactive ? ' is-inactive' : ''}${open ? ' is-open' : ''}`}
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
      <span className="task-icon task-row-icon" style={iconStyle}>
        <span className="task-emoji">{task.emoji}</span>
      </span>

      <span className="task-row-main">
        <span className="task-row-name">{task.name}</span>
        <span className="task-row-sched">
          {task.recurring && <Repeat size={12} strokeWidth={2.2} aria-hidden="true" />}
          {task.schedule}
        </span>
      </span>

      <span className="task-row-col">
        {inactive ? (
          <span className="task-badge">
            <Pause size={12} strokeWidth={2.2} />
            {task.status}
          </span>
        ) : (
          <>
            <span className="task-row-label">Próxima</span>
            <span className="task-row-value">{task.next ?? 'Sem data'}</span>
          </>
        )}
      </span>

      <span className="task-row-col">
        <span className="task-row-label">Última</span>
        {running ? (
          <span className="task-row-value is-running">
            <Loader2 className="task-spin" size={12} strokeWidth={2.4} aria-hidden="true" />
            Executando
          </span>
        ) : (
          <span className="task-row-value">{task.last ?? 'Nunca'}</span>
        )}
      </span>

      <span className="task-row-more-wrap">
        <button
          type="button"
          className={`task-more task-row-more${open ? ' is-open' : ''}`}
          aria-label="Ações do loop"
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
            <button type="button" className="task-menu-item" role="menuitem" disabled={running} onClick={onRun}>
              <Zap size={15} strokeWidth={1.9} />
              Executar agora
            </button>
            <button type="button" className="task-menu-item" role="menuitem" onClick={onEdit}>
              <Pencil size={15} strokeWidth={1.9} />
              Editar loop
            </button>
            <button type="button" className="task-menu-item" role="menuitem" onClick={onTogglePause}>
              {inactive ? <Play size={15} strokeWidth={1.9} /> : <Pause size={15} strokeWidth={1.9} />}
              {inactive ? 'Retomar' : 'Pausar'}
            </button>
            <div className="task-menu-sep" />
            <button type="button" className="task-menu-item is-danger" role="menuitem" onClick={onDelete}>
              <Trash2 size={15} strokeWidth={1.9} />
              Excluir
            </button>
          </div>
        )}
      </span>

      <ChevronRight className="task-row-chev" size={17} strokeWidth={2} aria-hidden="true" />
    </div>
  )
}
