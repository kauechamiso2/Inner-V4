import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './tasks-page.css'
import { Check, Play, Repeat } from 'lucide-react'
import { ConfirmDeleteModal } from './ChatModals'
import { LOOP_PRESETS, LOOP_PRESET_CATEGORIES } from './loopPresets'
import type { LoopPreset } from './loopPresets'
import './collection-detail.css'
import './prompts-page.css'
import tutorialThumb from '../assets/task-tutorial.webp'
import { TaskRow } from './TaskCard'
import SearchToggle, { SearchEmpty, normSearch } from './SearchToggle'
import NewTaskMenu from './NewTaskMenu'
import CreateTaskModal from './CreateTaskModal'
import TaskPage from './TaskPage'
import type { ChosenAgent } from './agents'
import { ACTIVE_TASKS, INACTIVE_TASKS } from './tasks'
import type { Task } from './tasks'
import { applyLoopState, openLoop, removeLoop, runNow, runsOf, togglePause, useLoopStore } from './loopStore'
import type { Run } from './runSummaries'

/* filtros de Loops: frequência e onde notifica */
const freqOf = (t: Task) => {
  const sc = t.schedule.toLowerCase()
  if (/uma vez/.test(sc)) return 'once'
  if (/m[eê]s/.test(sc)) return 'monthly'
  if (/semana|segunda|terça|quarta|quinta|sexta|sábado|domingo/.test(sc)) return 'weekly'
  return 'daily'
}
const LOOP_FILTER_GROUPS: { label: string; items: { id: string; label: string; test: (t: Task) => boolean }[] }[] = [
  {
    label: 'Frequência',
    items: [
      { id: 'daily', label: 'Diária ou mais', test: (t) => freqOf(t) === 'daily' },
      { id: 'weekly', label: 'Semanal', test: (t) => freqOf(t) === 'weekly' },
      { id: 'monthly', label: 'Mensal', test: (t) => freqOf(t) === 'monthly' },
      { id: 'once', label: 'Uma vez', test: (t) => freqOf(t) === 'once' },
    ],
  },
  {
    label: 'Notificação',
    items: [
      { id: 'platform', label: 'Na plataforma', test: (t) => t.notify !== 'whatsapp' },
      { id: 'whatsapp', label: 'WhatsApp', test: (t) => t.notify === 'whatsapp' },
    ],
  },
]

export default function TarefasPage({
  empty = false,
  createdTasks = [],
  taskEdits = {},
  agent = null,
  onCreateWithAgent,
  onCreateTask,
  onSaveTask,
  onOpenRun,
}: {
  /* execução clicada no histórico: abre o drawer da tarefa */
  onOpenRun?: (task: Task, run: Run) => void
  /* agente escolhido: "Criar com <nome>" */
  agent?: ChosenAgent | null
  /* "Criar com <agente>": abre a Home com @Tarefa */
  onCreateWithAgent?: () => void
  /* "Criar manualmente": a tarefa criada no formulário */
  onCreateTask?: (task: Task) => void
  /* "Configurações"/"Editar" na página da tarefa */
  onSaveTask?: (task: Task) => void
  /* tarefas criadas pelo agente no chat: entram no topo de "Ativas" */
  createdTasks?: Task[]
  /* edições salvas no modal "Editar tarefa" */
  taskEdits?: Record<string, Task>
  /* protótipo: alterna para o estado vazio (sem tarefas) */
  empty?: boolean
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const nq = normSearch(query)
  const [filters, setFilters] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  useEffect(() => {
    if (!filterOpen) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.cd-filter-wrap')) setFilterOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [filterOpen])
  /* filtros de grupos diferentes se somam (E); dentro do grupo, qualquer um (OU) */
  const passFilters = (t: Task) =>
    LOOP_FILTER_GROUPS.every((g) => {
      const on = g.items.filter((it) => filters.has(it.id))
      return on.length === 0 || on.some((it) => it.test(t))
    })
  const match = (t: Task) => (!nq || normSearch(`${t.name} ${t.description}`).includes(nq)) && passFilters(t)
  /* "Criar manualmente": formulário completo */
  const [manualOpen, setManualOpen] = useState(false)
  /* Explorar: categoria ativa e o preset aberto no formulário */
  const [presetCat, setPresetCat] = useState('Todos')
  const [preset, setPreset] = useState<LoopPreset | null>(null)
  const presets = LOOP_PRESETS.filter(
    (p) =>
      (presetCat === 'Todos' || p.category === presetCat) &&
      (!nq || normSearch(`${p.name} ${p.desc}`).includes(nq)),
  )
  /* estado compartilhado com o drawer da tarefa (loopStore): pausas,
     exclusões, execuções, loop aberto e o aviso das ações */
  const loop = useLoopStore()
  const pageId = loop.pageId
  const setPageId = openLoop
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)

  /* tarefa como aparece agora: edições salvas + pausa + última execução */
  const eff = (t0: Task): Task => applyLoopState(taskEdits[t0.id] ?? t0, loop)
  const allTasks = [...createdTasks, ...ACTIVE_TASKS, ...INACTIVE_TASKS]
    .filter((t) => !loop.deleted.includes(t.id))
    .map(eff)
  const activeTasks = allTasks.filter((t) => !t.status)
  const inactiveTasks = allTasks.filter((t) => t.status)
  const pageTask = pageId ? (allTasks.find((t) => t.id === pageId) ?? null) : null
  const onOpenTask = (t: Task) => setPageId(t.id)
  const cardActions = (t: Task) => ({
    running: loop.running.includes(t.id),
    onRun: () => {
      setOpenMenu(null)
      runNow(t)
    },
    onEdit: () => {
      setOpenMenu(null)
      setEditTask(t)
    },
    onTogglePause: () => {
      setOpenMenu(null)
      togglePause(t)
    },
    onDelete: () => {
      setOpenMenu(null)
      setDeleteTask(t)
    },
  })
  const newTask = (cls?: string, align?: 'left' | 'right') => (
    <NewTaskMenu
      agent={agent}
      className={cls}
      align={align}
      onWithAgent={() => onCreateWithAgent?.()}
      onManual={() => setManualOpen(true)}
    />
  )

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
        {pageTask ? (
          <TaskPage
            key={pageTask.id}
            task={pageTask}
            onBack={() => setPageId(null)}
            onSave={(t) => onSaveTask?.(t)}
            onTogglePause={() => togglePause(pageTask, false)}
            onOpenRun={(r) => onOpenRun?.(pageTask, r)}
            runs={runsOf(pageTask, loop)}
            onRunNow={() => runNow(pageTask)}
          />
        ) : (
          <>
        <h1 className="lib-title">Loops</h1>

        {empty ? (
          <div className="tasks-empty">
            {/* Card-tutorial: o que é um loop (texto + vídeo mockado) */}
            <article className="te-tutorial" style={{ '--d': '40ms' } as CSSProperties}>
              <div className="te-tutorial-text">
                <h3 className="te-tutorial-title">Crie loops que seu agente executa sozinho.</h3>
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
                      <strong>Receba o resultado pronto</strong> a cada execução, sem precisar pedir de novo.
                    </span>
                  </li>
                </ol>
                {newTask('te-tutorial-cta', 'left')}
              </div>
              <button type="button" className="te-tutorial-video" aria-label="Assistir: Como funcionam os loops">
                <img src={tutorialThumb} alt="" aria-hidden="true" />
                <span className="te-tutorial-grad" aria-hidden="true" />
                <span className="te-tutorial-caption">Como funcionam os loops</span>
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
        {/* Ativos */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Ativos</h2>
            </div>
            <div className="lib-files-actions">
              {/* filtros: frequência e onde notifica */}
              <span className="cd-filter-wrap">
                <button
                  className={`lib-new is-ghost${filterOpen || filters.size ? ' is-on' : ''}`}
                  type="button"
                  aria-label="Filtrar"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.125"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  {filters.size > 0 && <span className="cd-filter-badge">{filters.size}</span>}
                  {!filterOpen && (
                    <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                      Filtrar
                    </span>
                  )}
                </button>
                {filterOpen && (
                  <div className="task-menu cd-filter-menu" role="menu">
                    <button
                      type="button"
                      className="task-menu-item"
                      role="menuitemcheckbox"
                      aria-checked={filters.size === 0}
                      onClick={() => setFilters(new Set())}
                    >
                      Todos os loops
                      {filters.size === 0 && <Check className="cd-filter-check" size={15} strokeWidth={2.4} />}
                    </button>
                    {LOOP_FILTER_GROUPS.map((g) => (
                      <div key={g.label}>
                        <div className="task-menu-sep" />
                        <div className="lp-filter-label">{g.label}</div>
                        {g.items.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            className="task-menu-item"
                            role="menuitemcheckbox"
                            aria-checked={filters.has(it.id)}
                            onClick={() =>
                              setFilters((cur) => {
                                const n = new Set(cur)
                                n.has(it.id) ? n.delete(it.id) : n.add(it.id)
                                return n
                              })
                            }
                          >
                            <span className={`cd-filter-box${filters.has(it.id) ? ' is-on' : ''}`} aria-hidden="true">
                              {filters.has(it.id) && <Check size={11} strokeWidth={3} />}
                            </span>
                            {it.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </span>
              <SearchToggle value={query} onChange={setQuery} placeholder="Buscar loops" />
              {newTask()}
            </div>
          </div>

          {(nq || filters.size > 0) && !allTasks.some(match) && (
            <SearchEmpty query={query || 'esses filtros'} />
          )}
          {activeTasks.length === 0 && !nq && filters.size === 0 && (
            <p className="lp-explore-empty">Nenhum loop ativo. Retome um loop pausado ou comece por um preset abaixo.</p>
          )}
          <div className="task-rows">
            {activeTasks.filter(match).map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                i={i}
                open={openMenu === t.id}
                onToggle={() => toggle(t.id)}
                onOpen={() => onOpenTask(t)}
                {...cardActions(t)}
              />
            ))}
          </div>
        </section>

        {/* Inativos */}
        {inactiveTasks.length > 0 && (
        <section className="lib-section lp-inactive">
          <div className="lib-section-title">
            <h2>Inativos</h2>
          </div>

          <div className="task-rows is-inactive">
            {inactiveTasks.filter(match).map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                i={i}
                inactive
                open={openMenu === t.id}
                onToggle={() => toggle(t.id)}
                onOpen={() => onOpenTask(t)}
                {...cardActions(t)}
              />
            ))}
          </div>
        </section>
        )}

        {/* Explorar: presets de loops com o ícone do pilar (como os templates de Prompts) */}
        <section className="lib-section lp-explore">
          <div className="lib-section-title">
            <h2>Explorar</h2>
          </div>
          <div className="lp-cats" role="tablist" aria-label="Categorias de presets">
            {LOOP_PRESET_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={presetCat === c}
                className={`ip-pill${presetCat === c ? ' is-active' : ''}`}
                onClick={() => setPresetCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {presets.length === 0 ? (
            <p className="lp-explore-empty">Nenhum preset encontrado.</p>
          ) : (
            <div className="tasks-grid" key={presetCat}>
              {presets.map((p, i) => (
                <article
                  key={p.id}
                  className="lp-preset"
                  style={{ '--i': i } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreset(p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPreset(p)
                    }
                  }}
                >
                  <span
                    className="lp-preset-icon"
                    style={{ background: `color-mix(in srgb, ${p.color} 16%, var(--pop-surface))` }}
                    aria-hidden="true"
                  >
                    {p.emoji}
                  </span>
                  <h3 className="lp-preset-name">{p.name}</h3>
                  <span className="lp-preset-when">
                    <Repeat size={12} strokeWidth={2.2} aria-hidden="true" />
                    {p.schedule}
                  </span>
                  <p className="lp-preset-desc">{p.desc}</p>
                  <span className="lp-preset-actions">
                    <span className="prompt-btn is-primary">Usar</span>
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
          </>
        )}
          </>
        )}
      </div>

      {editTask && (
        <CreateTaskModal task={editTask} onClose={() => setEditTask(null)} onCreate={(t) => onSaveTask?.(t)} />
      )}

      {deleteTask && (
        <ConfirmDeleteModal
          title="Excluir loop?"
          confirmLabel="Excluir"
          onClose={() => setDeleteTask(null)}
          onConfirm={() => removeLoop(deleteTask)}
        >
          <strong>{deleteTask.name}</strong> deixa de ser executado e o histórico de execuções é apagado.
        </ConfirmDeleteModal>
      )}

      {preset && (
        <CreateTaskModal
          preset={preset}
          onClose={() => setPreset(null)}
          onCreate={(t) => {
            onCreateTask?.(t)
            setPageId(t.id)
          }}
        />
      )}

      {manualOpen && (
        <CreateTaskModal
          onClose={() => setManualOpen(false)}
          onCreate={(t) => {
            onCreateTask?.(t)
            setPageId(t.id)
          }}
        />
      )}
    </main>
  )
}
