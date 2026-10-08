import type { CSSProperties } from 'react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import ChatComposer from './ChatComposer'
import type { ActiveProject } from '../App'
import type { ChosenAgent } from './agents'

type InputMode = 'agente' | 'chat'

export default function ChatHome({
  mode,
  onModeChange,
  project = null,
  onOpenProject,
  onClearProject,
  agent = null,
  intro = false,
}: {
  mode: InputMode
  onModeChange: (m: InputMode) => void
  project?: ActiveProject | null
  /* citar um projeto pelo @ ativa o contexto do projeto (gradiente etc.) */
  onOpenProject?: (p: ActiveProject) => void
  /* remover a citação do projeto no input volta ao empty state da Home */
  onClearProject?: () => void
  /* personagem escolhido no onboarding — personaliza a saudação/input */
  agent?: ChosenAgent | null
  /* destaque único de "personalização" ao cair na tela */
  intro?: boolean
}) {
  return (
    <main
      className="chat-home"
      style={
        project?.color
          ? {
              background: `linear-gradient(180deg, color-mix(in srgb, ${project.color} 20%, var(--main-bg)) 0%, var(--main-bg) 46%)`,
            }
          : undefined
      }
    >
      <div className="chat-column">
        <div className="chat-greeting" key={project ? `proj-${project.id}` : mode}>
          {project ? (
            <>
              <span
                className="greeting-proj-icon"
                aria-hidden="true"
                style={
                  project.color
                    ? { background: `color-mix(in srgb, ${project.color} 16%, var(--card-surface))` }
                    : undefined
                }
              >
                {project.emoji}
              </span>
              <h1 className="greeting-text">{project.name}</h1>
            </>
          ) : mode === 'agente' ? (
            <>
              {agent ? (
                <span
                  className={`greeting-face${intro ? ' is-intro' : ''}`}
                  style={{ '--accent': agent.accent } as CSSProperties}
                  aria-hidden="true"
                >
                  <img src={agent.img} alt="" draggable={false} />
                </span>
              ) : (
                <span className="greeting-orb">
                  <span className="greeting-orb-glow">
                    <AgentOrb size={26} />
                  </span>
                  <span className="greeting-orb-core">
                    <AgentOrb size={26} />
                  </span>
                </span>
              )}
              <h1 className="greeting-text">Me dê uma tarefa...</h1>
            </>
          ) : (
            <h1 className="greeting-text">Converse com modelos de IA</h1>
          )}
        </div>

        <ChatComposer
          mode={mode}
          onModeChange={onModeChange}
          placeholder={project ? `Conversar em ${project.name}` : undefined}
          excludeProjects={!!project}
          onPickProject={onOpenProject}
          project={project}
          onClearProject={onClearProject}
          agent={agent}
          intro={intro}
        />
      </div>
    </main>
  )
}
