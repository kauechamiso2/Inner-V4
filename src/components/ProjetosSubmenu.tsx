import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'
import searchIcon from '../assets/library/search.svg'
import folder from '../assets/library/folder.svg'
import { PROJECTS } from './projects'
import type { Project } from './projects'
import ProjectFilesSubmenu from './ProjectFilesSubmenu'
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
  /* projeto cujo contexto está aberto em cascata (arquivos) */
  const [openProj, setOpenProj] = useState<Project | null>(null)
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const q = normalize(query)
  const projects = useMemo(
    () => (q ? PROJECTS.filter((p) => normalize(p.name).includes(q)) : PROJECTS),
    [q],
  )
  const shown = showAll || q ? projects : projects.slice(0, LIMIT)

  const pickProject = (p: Project) =>
    onSelect({
      id: p.id,
      label: p.name,
      citation: p.name,
      project: { id: p.id, name: p.name, emoji: p.emoji, color: p.color },
    })

  const openFiles = (rowEl: HTMLElement, p: Project) => {
    window.clearTimeout(closeTimer.current)
    const r = rowEl.getBoundingClientRect()
    const W = 282
    const left = r.right + 8 + W < window.innerWidth ? r.right + 8 : r.left - 8 - W
    const top = Math.max(12, Math.min(r.top - 6, window.innerHeight - 380))
    setOpenProj(p)
    setPanelPos({ left, top })
  }
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setOpenProj(null)
      setPanelPos(null)
    }, 180)
  }

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
                className={`bib-row has-drill${openProj?.id === p.id ? ' is-sub-open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={openProj?.id === p.id}
                onMouseEnter={(e) => openFiles(e.currentTarget, p)}
                onMouseLeave={scheduleClose}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pickProject(p)
                }}
              >
                <span className="bib-icon is-folder">
                  <img src={folder} alt="" />
                </span>
                <span className="bib-text">
                  <span className="bib-label">{p.name}</span>
                </span>
                <span className="proj-drill" aria-hidden="true">
                  <ChevronRight size={16} strokeWidth={2} />
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

      {openProj &&
        panelPos &&
        createPortal(
          <div
            className="mm-sub-panel"
            style={{ left: panelPos.left, top: panelPos.top }}
            onMouseEnter={() => window.clearTimeout(closeTimer.current)}
            onMouseLeave={scheduleClose}
          >
            <ProjectFilesSubmenu project={openProj} onSelect={onSelect} />
          </div>,
          document.body,
        )}
    </div>
  )
}
