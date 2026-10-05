import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, Paperclip, Pin, ScrollText, Settings2 } from 'lucide-react'
import { AgendadoIcon } from './SidebarIcons'
import './project-home.css'
import ChatComposer from './ChatComposer'
import ContextModal from './ContextModal'
import InstructionsModal from './InstructionsModal'
import TasksModal from './TasksModal'
import { DEFAULT_PROJECT_CONTENT, PROJECT_CONTENT } from './projectContent'
import type { ProjChat } from './projectContent'
import { ACTIVE_TASKS, INACTIVE_TASKS } from './tasks'

type SideItem = { id: string; icon: ReactNode; label: string; sub?: string; action: string }

const SIDE_ITEMS: SideItem[] = [
  { id: 'instr', icon: <ScrollText size={18} strokeWidth={1.7} />, label: 'Instruções', action: 'Editar' },
  { id: 'ctx', icon: <Paperclip size={18} strokeWidth={1.7} />, label: 'Contexto', action: 'Adicionar' },
  { id: 'tarefas', icon: <AgendadoIcon size={18} />, label: 'Tarefas', action: 'Adicionar' },
]

function ChatRow({ chat, pinned = false }: { chat: ProjChat; pinned?: boolean }) {
  return (
    <a className="ph-row" href="#conversa">
      <span className="ph-row-title">{chat.title}</span>
      {pinned && <Pin className="ph-row-pin" size={13} strokeWidth={1.8} fill="currentColor" />}
      <span className="ph-row-date">{chat.date}</span>
    </a>
  )
}

export default function ProjectHome({
  name,
  emoji,
  color,
  projectId,
  pinned = false,
  onTogglePin,
  onBack,
}: {
  name: string
  emoji?: string
  color?: string
  projectId: string
  pinned?: boolean
  onTogglePin?: () => void
  onBack: () => void
}) {
  const content = PROJECT_CONTENT[projectId] ?? DEFAULT_PROJECT_CONTENT
  const projectTasks = [...ACTIVE_TASKS, ...INACTIVE_TASKS].filter(
    (t) => t.project?.id === projectId,
  )
  const [mode, setMode] = useState<'agente' | 'chat'>('agente')
  const [contextOpen, setContextOpen] = useState(false)
  const [instrOpen, setInstrOpen] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)

  return (
    <main className="project-home">
      {color && (
        <div
          className="ph-banner"
          aria-hidden="true"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${color} 26%, var(--main-bg)), var(--main-bg))`,
          }}
        />
      )}
      <div className="ph-container">
        <div className="ph-main">
          <nav className="ph-breadcrumb" aria-label="Navegação">
            <button className="ph-back" type="button" onClick={onBack} aria-label="Voltar">
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button className="ph-crumb" type="button" onClick={onBack}>
              Biblioteca
            </button>
          </nav>

          <header className="ph-head">
            {emoji && (
              <span
                className="ph-icon"
                aria-hidden="true"
                style={
                  color
                    ? { background: `color-mix(in srgb, ${color} 16%, var(--card-surface))` }
                    : undefined
                }
              >
                {emoji}
              </span>
            )}
            <div className="ph-head-text">
              <div className="ph-title-row">
                <h1 className="ph-title">{name}</h1>
                <button
                  type="button"
                  className={`ph-pin${pinned ? ' is-pinned' : ''}`}
                  aria-label={pinned ? 'Desafixar da homepage' : 'Fixar na homepage'}
                  aria-pressed={pinned}
                  onClick={onTogglePin}
                >
                  <Pin size={16} strokeWidth={1.8} fill={pinned ? 'currentColor' : 'none'} />
                  <span className="pill-tooltip ph-pin-tip" role="tooltip" aria-hidden="true">
                    {pinned ? 'Fixado na homepage' : 'Fixar na homepage'}
                  </span>
                </button>
              </div>
              <button type="button" className="ph-settings">
                <Settings2 size={14} strokeWidth={1.8} />
                Configurações do projeto
              </button>
            </div>
          </header>

          <ChatComposer
            mode={mode}
            onModeChange={setMode}
            placeholder={`Conversar em ${name}`}
            excludeProjects
          />

          <div className="ph-lists">
            {content.pinned.length > 0 && (
              <section className="ph-group">
                <div className="ph-group-label">Fixados</div>
                <div className="ph-rows">
                  {content.pinned.map((c) => (
                    <ChatRow key={c.id} chat={c} pinned />
                  ))}
                </div>
              </section>
            )}

            <section className="ph-group">
              <div className="ph-group-label">Recentes</div>
              <div className="ph-rows">
                {content.recents.map((c) => (
                  <ChatRow key={c.id} chat={c} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="ph-side" aria-label="Configurações do projeto">
          {SIDE_ITEMS.map((it) => {
            let sub = it.sub
            let action = it.action
            let onClick: (() => void) | undefined
            if (it.id === 'instr') {
              onClick = () => setInstrOpen(true)
            } else if (it.id === 'ctx') {
              sub = `${content.contextPct}%`
              onClick = () => setContextOpen(true)
            } else if (it.id === 'tarefas') {
              sub = projectTasks.length > 0 ? String(projectTasks.length) : undefined
              action = projectTasks.length > 0 ? 'Visualizar' : 'Adicionar'
              onClick = () => setTasksOpen(true)
            }
            return (
              <button className="ph-side-item" type="button" key={it.id} onClick={onClick}>
                <span className="ph-side-icon" aria-hidden="true">
                  {it.icon}
                </span>
                <span className="ph-side-label">
                  {it.label}
                  {sub && <span className="ph-side-sub">{sub}</span>}
                </span>
                <span className="ph-side-action">{action}</span>
              </button>
            )
          })}
        </aside>
      </div>

      <ContextModal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        sections={content.contextSections}
        looseFiles={content.contextLoose}
        usedPct={content.contextPct}
      />
      <InstructionsModal
        open={instrOpen}
        onClose={() => setInstrOpen(false)}
        defaultValue={content.instructions}
      />
      <TasksModal open={tasksOpen} onClose={() => setTasksOpen(false)} tasks={projectTasks} />
    </main>
  )
}
