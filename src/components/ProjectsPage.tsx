import { useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './library-page.css'
import './projects-page.css'
import searchIcon from '../assets/search-light.svg'
import { Pin } from 'lucide-react'
import ProjectHome from './ProjectHome'

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

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export default function ProjectsPage({
  isPinned,
  togglePin,
}: {
  isPinned: (kind: 'chat' | 'project', id: string) => boolean
  togglePin: (kind: 'chat' | 'project', id: string) => void
}) {
  const [openCollection, setOpenCollection] = useState<string | null>(null)
  const [query, setQuery] = useState('')

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
      />
    )
  }

  const q = normalize(query)
  const list = q ? COLLECTIONS.filter((c) => normalize(c.name).includes(q)) : COLLECTIONS

  return (
    <main className="images-page projects-page">
      <div className="ip-container pjp-container">
        <h1 className="ip-title">Projetos</h1>

        <div className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar projetos"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <p className="pjp-sub">Espaços de trabalho com conversas, arquivos e contexto próprios</p>

        <div className="lib-collections pjp-grid">
          {list.map((c, i) => {
            const projPinned = isPinned('project', c.id)
            return (
              <div
                className="coll-card"
                role="button"
                tabIndex={0}
                key={c.name}
                style={{ '--i': i } as CSSProperties}
                onClick={() => setOpenCollection(c.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpenCollection(c.name)
                  }
                }}
              >
                <span className="coll-card-top" style={{ background: c.color }}>
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
                  <span className="coll-card-avatar">
                    <span className="coll-emoji">{c.emoji}</span>
                  </span>
                </span>
                <span className="coll-card-body">
                  <span className="coll-name">{c.name}</span>
                  <span className="coll-desc">{c.description}</span>
                  <span className="coll-date">{c.createdAt}</span>
                </span>
              </div>
            )
          })}

          <button className="pjp-new" type="button">
            <span className="pjp-new-plus" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="pjp-new-text">Novo projeto</span>
          </button>
        </div>
      </div>
    </main>
  )
}
