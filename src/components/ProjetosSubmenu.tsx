import { useMemo, useState } from 'react'
import searchIcon from '../assets/library/search.svg'
import folder from '../assets/library/folder.svg'
import { PROJECTS } from './projects'
import type { Project } from './projects'
import type { MentionItem } from './MentionMenu'

const LIMIT = 6

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

type Props = { onSelect: (item: MentionItem) => void }

export default function ProjetosSubmenu({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const q = normalize(query)
  const projects = useMemo(
    () => (q ? PROJECTS.filter((p) => normalize(p.name).includes(q)) : PROJECTS),
    [q],
  )
  const shown = showAll || q ? projects : projects.slice(0, LIMIT)

  const pick = (p: Project) =>
    onSelect({ id: p.id, label: p.name, citation: p.name })

  return (
    <div className="biblioteca-submenu projetos-submenu" role="listbox" aria-label="Projetos">
      <div className="bib-search">
        <img src={searchIcon} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar projeto"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bib-scroll">
        {shown.length > 0 ? (
          <div className="bib-section">
            <div className="bib-header">Projetos</div>
            {shown.map((p) => (
              <button
                key={p.id}
                type="button"
                className="bib-row"
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(p)
                }}
              >
                <span className="bib-icon is-folder">
                  <img src={folder} alt="" />
                </span>
                <span className="bib-text">
                  <span className="bib-label">{p.name}</span>
                  <span className="bib-sub">{p.sub}</span>
                </span>
              </button>
            ))}
            {!q && !showAll && projects.length > LIMIT && (
              <button
                type="button"
                className="bib-more"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setShowAll(true)
                }}
              >
                Ver mais {projects.length - LIMIT}
              </button>
            )}
          </div>
        ) : (
          <div className="bib-empty">Sem resultados</div>
        )}
      </div>
    </div>
  )
}
