import { useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './library-page.css'
import './projects-page.css'
import { FolderPlus, Pin } from 'lucide-react'
import ProjectHome from './ProjectHome'
import type { ChosenAgent } from './agents'

type Collection = {
  id: string
  name: string
  description: string
  createdAt: string
  emoji?: string
  color: string
}

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
}: {
  isPinned: (kind: 'chat' | 'project', id: string) => boolean
  togglePin: (kind: 'chat' | 'project', id: string) => void
  /* agente escolhido — herdado no input do detalhe do projeto */
  agent?: ChosenAgent | null
  /* protótipo: alterna para o estado vazio (sem projetos) */
  empty?: boolean
}) {
  const [openCollection, setOpenCollection] = useState<string | null>(null)
  const [view] = useState<'grid' | 'list'>('grid')

  if (openCollection) {
    const coll = COLLECTIONS.find((c) => c.name === openCollection)
    const projectId = coll?.id ?? openCollection
    return (
      <ProjectHome
        name={openCollection}
        emoji={coll?.emoji}
        color={coll?.color}
        projectId={projectId}
        pinned={isPinned('project', projectId)}
        onTogglePin={() => togglePin('project', projectId)}
        onBack={() => setOpenCollection(null)}
        agent={agent}
      />
    )
  }

  const list = COLLECTIONS

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
        onClick={() => open(c.name)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open(c.name)
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
            <span className="coll-emoji">{c.emoji}</span>
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
      <main className="images-page projects-page">
        <div className="lib-container">
          <h1 className="lib-title">Projetos</h1>

          <div className="pjp-empty">
            <span className="pjp-empty-art" aria-hidden="true">
              <FolderPlus size={30} strokeWidth={1.6} />
            </span>
            <h2 className="pjp-empty-title">Crie seu primeiro projeto</h2>
            <p className="pjp-empty-sub">
              Reúna conversas, arquivos e contexto em um só lugar. Cada projeto vira um
              espaço dedicado pro seu agente trabalhar com você.
            </p>
            <button type="button" className="lib-new-cta pjp-empty-cta">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 3.1v9.8M3.1 8h9.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Novo projeto
            </button>
          </div>
        </div>
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
              <button className="lib-new-cta" type="button">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Novo projeto
              </button>
            </div>
          </div>

          {view === 'grid' ? (
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
                    onClick={() => open(c.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        open(c.name)
                      }
                    }}
                  >
                    <span
                      className="pjp-row-icon"
                      style={{ background: `color-mix(in srgb, ${c.color} 16%, var(--card-surface))` }}
                    >
                      <span className="pjp-row-emoji">{c.emoji}</span>
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

        {/* Compartilhados com você */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Compartilhados com você</h2>
            </div>
          </div>

          <div className="lib-coll-empty">
            <span className="lib-coll-empty-emoji" aria-hidden="true">🤝</span>
            <p className="lib-coll-empty-title">Nada compartilhado ainda</p>
            <p className="lib-coll-empty-sub">
              Projetos que colegas compartilharem com você aparecem aqui.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
