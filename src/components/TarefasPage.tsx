import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './tasks-page.css'
import searchIcon from '../assets/library/search.svg'
import {
  IconAirplane,
  IconEnvelope,
  IconChartBar,
  IconTag,
} from './CollectionIcons'

type Task = {
  id: string
  name: string
  Icon: () => JSX.Element
  color: string
  recurring: boolean
  next: string | null
  last: string | null
  status?: string
}

const ACTIVE: Task[] = [
  {
    id: 'voo',
    name: 'Monitoramento de voo LH441',
    Icon: IconAirplane,
    color: '#2563B8',
    recurring: true,
    next: 'Hoje, 18:45',
    last: 'há 6 minutos',
  },
  {
    id: 'email',
    name: 'Monitoramento de e-mails importantes',
    Icon: IconEnvelope,
    color: '#6B46C1',
    recurring: true,
    next: 'Hoje, 15:00',
    last: 'há 38 minutos',
  },
  {
    id: 'vendas',
    name: 'Relatório de vendas Q4',
    Icon: IconChartBar,
    color: '#1F7A4D',
    recurring: false,
    next: '20 out, 09:00',
    last: null,
  },
]

const INACTIVE: Task[] = [
  {
    id: 'precos',
    name: 'Monitoramento de preços',
    Icon: IconTag,
    color: '#C15A2B',
    recurring: true,
    next: null,
    last: 'há 2 dias',
    status: 'Pausada',
  },
]

/* ícones pequenos (meta e menu) */
const RepeatIco = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.3 5.6A5 5 0 0 1 12 4.3l1.5 1.5" />
    <path d="M13.5 2.6V6H10" />
    <path d="M12.7 10.4A5 5 0 0 1 4 11.7l-1.5-1.5" />
    <path d="M2.5 13.4V10H6" />
  </svg>
)

const DotsIco = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    <circle cx="4.5" cy="9" r="1.35" />
    <circle cx="9" cy="9" r="1.35" />
    <circle cx="13.5" cy="9" r="1.35" />
  </svg>
)

const PencilIco = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11.4 2.6 13.4 4.6 6 12l-2.7.7L4 10z" />
    <path d="m10.4 3.6 2 2" />
  </svg>
)

const PauseIco = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="4.6" y="3.6" width="2.3" height="8.8" rx="1" />
    <rect x="9.1" y="3.6" width="2.3" height="8.8" rx="1" />
  </svg>
)

const PlayIco = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5 3.9c0-.6.6-1 1.1-.7l6 3.8c.5.3.5 1 0 1.3l-6 3.8c-.5.3-1.1 0-1.1-.7z" />
  </svg>
)

const TrashIco = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.8 4.5h10.4" />
    <path d="M6.2 4.5V3.3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v1.2" />
    <path d="m12 4.5-.5 8a1.2 1.2 0 0 1-1.2 1.1H5.7a1.2 1.2 0 0 1-1.2-1.1L4 4.5" />
    <path d="M6.7 7v4M9.3 7v4" />
  </svg>
)

function TaskCard({
  task,
  i,
  inactive,
  open,
  onToggle,
}: {
  task: Task
  i: number
  inactive?: boolean
  open: boolean
  onToggle: () => void
}) {
  const Icon = task.Icon
  return (
    <div className={`task-card${inactive ? ' is-inactive' : ''}`} style={{ '--i': i } as CSSProperties}>
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
        <DotsIco />
      </button>

      {open && (
        <div className="task-menu" role="menu">
          <button type="button" className="task-menu-item" role="menuitem">
            <PencilIco />
            Editar tarefa
          </button>
          <button type="button" className="task-menu-item" role="menuitem">
            {inactive ? <PlayIco /> : <PauseIco />}
            {inactive ? 'Retomar' : 'Pausar'}
          </button>
          <div className="task-menu-sep" />
          <button type="button" className="task-menu-item is-danger" role="menuitem">
            <TrashIco />
            Excluir
          </button>
        </div>
      )}

      <span
        className="task-icon"
        style={{
          background: `color-mix(in srgb, ${task.color} 16%, var(--pop-surface))`,
          color: task.color,
        }}
      >
        <Icon />
      </span>

      <div className="task-text">
        <span className="task-name">{task.name}</span>
        {inactive ? (
          <span className="task-meta task-status">
            <PauseIco />
            {task.status}
          </span>
        ) : task.recurring ? (
          <span className="task-meta task-next">
            <span className="task-rec">
              <RepeatIco />
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

export default function TarefasPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

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

  const toggle = (id: string) => setOpenMenu((cur) => (cur === id ? null : id))

  return (
    <main className="tasks-page">
      <div className="lib-container">
        <h1 className="lib-title">Tarefas</h1>

        <div className="lib-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar tarefas" spellCheck={false} />
        </div>

        {/* Ativas */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Ativas</h2>
              <p>Tarefas em execução ou agendadas</p>
            </div>
            <div className="lib-files-actions">
              <button className="lib-new" type="button" aria-label="Filtrar">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                    stroke="#3D3D3D"
                    strokeWidth="1.125"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                  Filtrar
                </span>
              </button>
              <div className="lib-view-switch" role="group" aria-label="Visualização">
                <button
                  className={`lib-view-opt${view === 'grid' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em grade"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2.6" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="2.6" y="10" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="10" width="5.4" height="5.4" rx="1.5" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em grade
                  </span>
                </button>
                <button
                  className={`lib-view-opt${view === 'list' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em lista"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2" y="3.5" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="3.95" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="7.8" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="8.25" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="12.1" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="12.55" width="9.7" height="1.5" rx="0.75" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em lista
                  </span>
                </button>
              </div>
              <button className="lib-new-cta" type="button">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Nova Tarefa
              </button>
            </div>
          </div>

          <div className="tasks-panel">
            <div className="tasks-grid">
              {ACTIVE.map((t, i) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  i={i}
                  open={openMenu === t.id}
                  onToggle={() => toggle(t.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Inativas */}
        <section className="lib-section">
          <div className="lib-section-title">
            <h2>Inativas</h2>
            <p>Pausadas ou já concluídas</p>
          </div>

          <div className="tasks-panel">
            <div className="tasks-grid">
              {INACTIVE.map((t, i) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  i={i}
                  inactive
                  open={openMenu === t.id}
                  onToggle={() => toggle(t.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
