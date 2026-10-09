import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './tasks-page.css'
import { Play } from 'lucide-react'
import tutorialThumb from '../assets/task-tutorial.webp'
import TaskCard from './TaskCard'
import NovaTarefaModal from './NovaTarefaModal'
import { ACTIVE_TASKS, INACTIVE_TASKS } from './tasks'
import type { Task } from './tasks'

export default function TarefasPage({
  onOpenTask,
  empty = false,
  onStartChat,
  createdTasks = [],
  taskEdits = {},
}: {
  onOpenTask: (task: Task) => void
  /* "Nova tarefa": o texto do modal vira mensagem no chat da Home */
  onStartChat?: (text: string) => void
  /* tarefas criadas pelo agente no chat: entram no topo de "Ativas" */
  createdTasks?: Task[]
  /* edições salvas no modal "Editar tarefa" */
  taskEdits?: Record<string, Task>
  /* protótipo: alterna para o estado vazio (sem tarefas) */
  empty?: boolean
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  /* modal "Nova tarefa" (input estilo geração de imagem) */
  const [novaOpen, setNovaOpen] = useState(false)

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
    <main className={`tasks-page${empty ? ' is-empty' : ''}`}>
      <div className="lib-container">
        <h1 className="lib-title">Tarefas Agendadas</h1>

        {empty ? (
          <div className="tasks-empty">
            {/* Card-tutorial: o que é uma tarefa agendada (texto + vídeo mockado) */}
            <article className="te-tutorial" style={{ '--d': '40ms' } as CSSProperties}>
              <div className="te-tutorial-text">
                <h3 className="te-tutorial-title">Automatize tarefas para seu agente executar.</h3>
                <ol className="te-steps">
                  <li className="te-step">
                    <span className="te-step-num">1</span>
                    <span className="te-step-text">
                      <strong>Diga o que você quer</strong> uma vez, do seu jeito.
                    </span>
                  </li>
                  <li className="te-step">
                    <span className="te-step-num">2</span>
                    <span className="te-step-text">
                      <strong>Escolha a frequência e o horário</strong>: todo dia, toda semana ou
                      quando quiser.
                    </span>
                  </li>
                  <li className="te-step">
                    <span className="te-step-num">3</span>
                    <span className="te-step-text">
                      <strong>Receba o resultado pronto</strong>, sem precisar pedir de novo.
                    </span>
                  </li>
                </ol>
                <button
                  type="button"
                  className="lib-new-cta te-tutorial-cta"
                  onClick={() => setNovaOpen(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 3.1v9.8M3.1 8h9.8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  Nova Tarefa
                </button>
              </div>
              <button type="button" className="te-tutorial-video" aria-label="Assistir: Como funcionam as tarefas agendadas">
                <img src={tutorialThumb} alt="" aria-hidden="true" />
                <span className="te-tutorial-grad" aria-hidden="true" />
                <span className="te-tutorial-caption">Como funcionam as tarefas agendadas</span>
                <span className="te-tutorial-dur">
                  <Play size={11} strokeWidth={0} fill="currentColor" aria-hidden="true" />
                  1:34
                </span>
                <span className="te-tutorial-play" aria-hidden="true">
                  <Play size={20} strokeWidth={0} fill="currentColor" />
                </span>
              </button>
            </article>
          </div>
        ) : (
          <>
        {/* Ativas */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Ativas</h2>
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
              <button className="lib-new is-ghost" type="button" aria-label="Buscar">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="8.2" cy="8.2" r="5" stroke="#3D3D3D" strokeWidth="1.2" />
                  <path d="M12 12l3.4 3.4" stroke="#3D3D3D" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                  Buscar
                </span>
              </button>
              <button className="lib-new-cta" type="button" onClick={() => setNovaOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Nova Tarefa
              </button>
            </div>
          </div>

          <div className="tasks-grid">
            {[...createdTasks, ...ACTIVE_TASKS].map((t0, i) => {
              const t = taskEdits[t0.id] ?? t0
              return (
              <TaskCard
                key={t.id}
                task={t}
                i={i}
                open={openMenu === t.id}
                onToggle={() => toggle(t.id)}
                onOpen={() => onOpenTask(t)}
              />
              )
            })}
          </div>
        </section>

        {/* Inativas */}
        <section className="lib-section">
          <div className="lib-section-title">
            <h2>Inativas</h2>
          </div>

          <div className="tasks-grid">
            {INACTIVE_TASKS.map((t, i) => (
              <TaskCard
                key={t.id}
                task={taskEdits[t.id] ?? t}
                i={i}
                inactive
                open={openMenu === t.id}
                onToggle={() => toggle(t.id)}
                onOpen={() => onOpenTask(t)}
              />
            ))}
          </div>
        </section>
          </>
        )}
      </div>

      {novaOpen && <NovaTarefaModal onClose={() => setNovaOpen(false)} onSend={onStartChat} />}
    </main>
  )
}
