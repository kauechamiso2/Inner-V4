import { useEffect, useState } from 'react'
import './library-page.css'
import './tasks-page.css'
import searchIcon from '../assets/library/search.svg'
import TaskCard from './TaskCard'
import { ACTIVE_TASKS, INACTIVE_TASKS } from './tasks'
import type { Task } from './tasks'

export default function TarefasPage({ onOpenTask }: { onOpenTask: (task: Task) => void }) {
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
        <h1 className="lib-title">Automações</h1>

        <div className="lib-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar automações" spellCheck={false} />
        </div>

        {/* Ativas */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Ativas</h2>
              <p>Automações em execução ou agendadas</p>
            </div>
            <div className="lib-files-actions">
              <button className="lib-new is-ghost" type="button" aria-label="Filtrar">
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

          <div className="tasks-grid">
            {ACTIVE_TASKS.map((t, i) => (
              <TaskCard
                key={t.id}
                task={t}
                i={i}
                open={openMenu === t.id}
                onToggle={() => toggle(t.id)}
                onOpen={() => onOpenTask(t)}
              />
            ))}
          </div>
        </section>

        {/* Inativas */}
        <section className="lib-section">
          <div className="lib-section-title">
            <h2>Inativas</h2>
            <p>Pausadas ou já concluídas</p>
          </div>

          <div className="tasks-grid">
            {INACTIVE_TASKS.map((t, i) => (
              <TaskCard
                key={t.id}
                task={t}
                i={i}
                inactive
                open={openMenu === t.id}
                onToggle={() => toggle(t.id)}
                onOpen={() => onOpenTask(t)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
