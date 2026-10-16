import TutorialEmpty, { ProjectsArt } from './TutorialEmpty'
import SearchToggle, { SearchEmpty, normSearch } from './SearchToggle'
import NewProjectModal from './NewProjectModal'
import { ProjectGlyph } from './projectIcons'
import type { ChatEdit } from './HistoryPanel'
import { addProject, patchProject, projectStore } from './projectStore'
import type { ProjectPatch } from './projectStore'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './library-page.css'
import './projects-page.css'
import { Pin } from 'lucide-react'
import ProjectHome from './ProjectHome'
import type { ChosenAgent } from './agents'

type Collection = {
  id: string
  name: string
  description: string
  createdAt: string
  emoji?: string
  /* ícone escolhido no "Novo projeto" (no lugar do emoji) */
  icon?: string
  color: string
  /* só nos projetos criados pelo usuário: começam vazios */
  custom?: { instructions: string; files: string[] }
}

/* projetos criados e edições ficam no projectStore (compartilhado com o histórico da Home) */

/* Os dois projetos reais do protótipo (antes ficavam na Biblioteca) */
const COLLECTIONS: Collection[] = [
  {
    id: 'col-hr',
    name: 'HR Stuff',
    description: 'Documentos, políticas e processos de RH da empresa',
    createdAt: 'Criado em 27 mai',
    emoji: '🧑‍💼',
    color: '#3E63C4',
  },
  {
    id: 'col-mkt',
    name: 'Marketing & Conteúdo',
    description: 'Calendário, campanhas e produção de conteúdo da marca',
    createdAt: 'Criado em 15 set',
    emoji: '📣',
    color: '#F0603A',
  },
]

export default function ProjectsPage({
  isPinned,
  togglePin,
  agent = null,
  empty = false,
  initialOpenId = null,
  chatEdits,
  movedChats = [],
  onOpenChat,
  onStartProjectChat,
  onChatMenu,
  menuKey = null,
  renamingKey = null,
  onRenameDone,
}: {
  isPinned: (kind: 'chat' | 'project', id: string) => boolean
  togglePin: (kind: 'chat' | 'project', id: string) => void
  /* agente escolhido — herdado no input do detalhe do projeto */
  agent?: ChosenAgent | null
  /* protótipo: alterna para o estado vazio (sem projetos) */
  empty?: boolean
  /* abre direto num projeto (ex.: trilha de um chat do projeto) */
  initialOpenId?: string | null
  /* chats do histórico: edições e os movidos para cada projeto */
  chatEdits?: Record<string, ChatEdit>
  movedChats?: { key: string; title: string; projectId: string }[]
  onOpenChat?: (key: string, title: string, projectId: string) => void
  /* primeira mensagem enviada dentro do projeto */
  onStartProjectChat?: (projectId: string, text: string) => void
  /* "..." dos chats do projeto */
  onChatMenu?: (key: string, title: string, rect: DOMRect, projectId: string) => void
  menuKey?: string | null
  renamingKey?: string | null
  onRenameDone?: (key: string, title: string | null) => void
}) {
  /* projeto aberto (por id: o nome pode mudar nas Configurações) */
  const [openCollection, setOpenCollection] = useState<string | null>(initialOpenId ?? null)
  const [patches, setPatches] = useState<Record<string, ProjectPatch>>(projectStore.patches)
  const applyPatch = (c: Collection): Collection => {
    const p = patches[c.id]
    if (!p) return c
    return {
      ...c,
      name: p.name ?? c.name,
      description: p.description ?? c.description,
      icon: p.icon ?? c.icon,
      color: p.color ?? c.color,
      custom: c.custom && p.instructions !== undefined ? { ...c.custom, instructions: p.instructions } : c.custom,
    }
  }
  const updateProject = (id: string, patch: ProjectPatch) => {
    patchProject(id, patch)
    setPatches(projectStore.patches)
  }
  const [view] = useState<'grid' | 'list'>('grid')
  const [created, setCreated] = useState<Collection[]>(projectStore.created)
  const [newOpen, setNewOpen] = useState(false)
  const [query, setQuery] = useState('')

  if (openCollection) {
    const coll0 = [...created, ...COLLECTIONS].find((c) => c.id === openCollection)
    const coll = coll0 ? applyPatch(coll0) : undefined
    const projectId = coll?.id ?? openCollection
    return (
      <ProjectHome
        key={projectId}
        name={coll?.name ?? openCollection}
        custom={coll?.custom ?? null}
        description={coll?.description ?? ''}
        onUpdateProject={(patch) => updateProject(projectId, patch)}
        emoji={coll?.emoji}
        icon={coll?.icon}
        color={coll?.color}
        projectId={projectId}
        pinned={isPinned('project', projectId)}
        onTogglePin={() => togglePin('project', projectId)}
        onBack={() => setOpenCollection(null)}
        agent={agent}
        chatEdits={chatEdits}
        movedChats={movedChats.filter((c) => c.projectId === projectId)}
        onOpenChat={(key, title) => onOpenChat?.(key, title, projectId)}
        onStartChat={(text) => onStartProjectChat?.(projectId, text)}
        onChatMenu={(key, title, rect) => onChatMenu?.(key, title, rect, projectId)}
        isChatPinned={(key) => isPinned('chat', key)}
        renamingKey={renamingKey}
        onRenameDone={onRenameDone}
        menuKey={menuKey}
      />
    )
  }

  const nq = normSearch(query)
  const list = [...created, ...COLLECTIONS].map(applyPatch).filter(
    (c) => !nq || normSearch(`${c.name} ${c.description}`).includes(nq),
  )
  const newProjectModal = newOpen && (
    <NewProjectModal
      onClose={() => setNewOpen(false)}
      onCreate={(p) => {
        const c: Collection = {
          id: `proj-${Date.now()}`,
          name: p.name,
          description: p.description,
          createdAt: 'Criado agora',
          icon: p.icon,
          color: p.color,
          custom: { instructions: p.instructions, files: p.files },
        }
        addProject(c)
        setCreated(projectStore.created)
        setOpenCollection(c.id)
      }}
    />
  )

  const open = (name: string) => setOpenCollection(name)

  const renderCard = (c: Collection, i: number) => {
    const projPinned = isPinned('project', c.id)
    return (
      <div
        className="coll-card proj-card"
        key={c.name}
        role="button"
        tabIndex={0}
        style={
          {
            '--i': i,
            background: `linear-gradient(165deg, color-mix(in srgb, ${c.color} 16%, var(--pop-surface)) 0%, var(--pop-surface) 46%)`,
          } as CSSProperties
        }
        onClick={() => open(c.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open(c.id)
          }
        }}
      >
        <button
          type="button"
          className={`coll-card-pin${projPinned ? ' is-pinned' : ''}`}
          aria-label={projPinned ? 'Desafixar da Home' : 'Fixar na Home'}
          aria-pressed={projPinned}
          onClick={(e) => {
            e.stopPropagation()
            togglePin('project', c.id)
          }}
        >
          <Pin size={15} strokeWidth={2} fill={projPinned ? 'currentColor' : 'none'} />
          <span className="pill-tooltip coll-card-pin-tip" role="tooltip" aria-hidden="true">
            {projPinned ? 'Desafixar da Home' : 'Fixar na Home'}
          </span>
        </button>
        <span className="proj-head">
          <span className="proj-ico" style={{ background: c.color }}>
            {c.icon ? (
              <ProjectGlyph icon={c.icon} size={22} />
            ) : (
              <span className="coll-emoji">{c.emoji}</span>
            )}
          </span>
          <span className="coll-name">{c.name}</span>
        </span>
        <span className="coll-desc">{c.description}</span>
        <span className="coll-date">{c.createdAt}</span>
      </div>
    )
  }

  if (empty) {
    return (
      <main className="images-page projects-page empty-page">
        <div className="lib-container">
          <h1 className="lib-title">Projetos</h1>

          <TutorialEmpty
            title="Organize seu trabalho em projetos."
            steps={[
              { strong: 'Crie um projeto', rest: 'para cada cliente, área ou iniciativa.' },
              { strong: 'Adicione contexto:', rest: 'arquivos, instruções e links que o agente precisa conhecer.' },
              { strong: 'Converse dentro do projeto', rest: 'e o agente já responde com tudo isso em mente.' },
            ]}
            cta={
              <button type="button" className="lib-new-cta te-tutorial-cta" onClick={() => setNewOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Novo projeto
              </button>
            }
            caption="Como funcionam os projetos"
            duration="1:12"
            art={<ProjectsArt />}
          />
        </div>
        {newProjectModal}
      </main>
    )
  }

  return (
    <main className="images-page projects-page">
      <div className="lib-container">
        <h1 className="lib-title">Projetos</h1>

        {/* Meus Projetos */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Meus Projetos</h2>
            </div>
            <div className="lib-files-actions">
              <SearchToggle value={query} onChange={setQuery} placeholder="Buscar projetos" />
              <button className="lib-new-cta" type="button" onClick={() => setNewOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Novo projeto
              </button>
            </div>
          </div>

          {nq && list.length === 0 ? (
            <SearchEmpty query={query} />
          ) : view === 'grid' ? (
            <div className="lib-collections pjp-grid">
              {list.map((c, i) => renderCard(c, i))}
            </div>
          ) : (
            <div className="pjp-list">
              {list.map((c) => {
                const projPinned = isPinned('project', c.id)
                return (
                  <div
                    className="pjp-row"
                    role="button"
                    tabIndex={0}
                    key={c.name}
                    onClick={() => open(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        open(c.id)
                      }
                    }}
                  >
                    <span
                      className="pjp-row-icon"
                      style={{ background: `color-mix(in srgb, ${c.color} 16%, var(--card-surface))` }}
                    >
                      {c.icon ? (
                        <ProjectGlyph icon={c.icon} size={18} />
                      ) : (
                        <span className="pjp-row-emoji">{c.emoji}</span>
                      )}
                    </span>
                    <span className="pjp-row-main">
                      <span className="pjp-row-name">{c.name}</span>
                      <span className="pjp-row-desc">{c.description}</span>
                    </span>
                    <span className="pjp-row-date">{c.createdAt}</span>
                    <button
                      type="button"
                      className={`pjp-row-pin${projPinned ? ' is-pinned' : ''}`}
                      aria-label={projPinned ? 'Desafixar da Home' : 'Fixar na Home'}
                      aria-pressed={projPinned}
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePin('project', c.id)
                      }}
                    >
                      <Pin size={15} strokeWidth={2} fill={projPinned ? 'currentColor' : 'none'} />
                      <span className="pill-tooltip coll-card-pin-tip" role="tooltip" aria-hidden="true">
                        {projPinned ? 'Desafixar da Home' : 'Fixar na Home'}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
      {newProjectModal}
    </main>
  )
}
