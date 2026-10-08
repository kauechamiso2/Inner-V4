import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'
import searchIcon from '../assets/library/search.svg'
import { FILES, entryAttachment, normalizeLib } from './libraryEntries'
import type { LibEntry } from './libraryEntries'
import { KNOWLEDGE_BASES } from './knowledgeBases'
import type { KnowledgeBase } from './knowledgeBases'
import KnowledgeBaseFilesSubmenu from './KnowledgeBaseFilesSubmenu'
import type { MentionItem } from './MentionMenu'

const FILE_LIMIT = 7

const baseCount = (b: KnowledgeBase) =>
  b.sections.reduce((n, s) => n + s.files.length, 0) + b.loose.length

type Props = {
  onSelect: (item: MentionItem) => void
  /* 'arquivos' lista os arquivos da Biblioteca; 'colecoes' lista as bases de conhecimento */
  kind?: 'arquivos' | 'colecoes'
}

export default function BibliotecaSubmenu({ onSelect, kind = 'arquivos' }: Props) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  /* base de conhecimento cujo conteúdo (arquivos) abre em cascata */
  const [openBase, setOpenBase] = useState<KnowledgeBase | null>(null)
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const openFiles = (rowEl: HTMLElement, b: KnowledgeBase) => {
    window.clearTimeout(closeTimer.current)
    const r = rowEl.getBoundingClientRect()
    const W = 282
    const left = r.right + 8 + W < window.innerWidth ? r.right + 8 : r.left - 8 - W
    const top = Math.max(12, Math.min(r.top - 6, window.innerHeight - 380))
    setOpenBase(b)
    setPanelPos({ left, top })
  }
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setOpenBase(null)
      setPanelPos(null)
    }, 180)
  }

  const q = normalizeLib(query)

  const files = useMemo(
    () => (q ? FILES.filter((f) => normalizeLib(f.label).includes(q)) : FILES),
    [q],
  )
  const bases = useMemo(
    () => (q ? KNOWLEDGE_BASES.filter((b) => normalizeLib(b.name).includes(q)) : KNOWLEDGE_BASES),
    [q],
  )

  if (kind === 'colecoes') {
    return (
      <div className="biblioteca-submenu" role="listbox" aria-label="Bases de conhecimento">
        <div className="bib-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar base de conhecimento"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="bib-scroll">
          {bases.length > 0 ? (
            <div className="bib-section">
              <div className="bib-header">Bases de conhecimento</div>
              {bases.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`bib-row has-drill${openBase?.id === b.id ? ' is-sub-open' : ''}`}
                  aria-haspopup="menu"
                  aria-expanded={openBase?.id === b.id}
                  onMouseEnter={(e) => openFiles(e.currentTarget, b)}
                  onMouseLeave={scheduleClose}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onSelect({
                      id: b.id,
                      label: b.name,
                      attachment: { kind: 'collection', name: b.name, emoji: b.emoji, color: b.color },
                    })
                  }}
                >
                  <span className="bib-icon is-emoji">{b.emoji}</span>
                  <span className="bib-text">
                    <span className="bib-label">{b.name}</span>
                    <span className="bib-sub">{baseCount(b)} arquivos</span>
                  </span>
                  <span className="proj-drill" aria-hidden="true">
                    <ChevronRight size={16} strokeWidth={2} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bib-empty">Nenhuma base de conhecimento ainda</div>
          )}
        </div>

        {openBase &&
          panelPos &&
          createPortal(
            <div
              className="mm-sub-panel"
              style={{ left: panelPos.left, top: panelPos.top }}
              onMouseEnter={() => window.clearTimeout(closeTimer.current)}
              onMouseLeave={scheduleClose}
            >
              <KnowledgeBaseFilesSubmenu base={openBase} onSelect={onSelect} />
            </div>,
            document.body,
          )}
      </div>
    )
  }

  const shown = showAll || q ? files : files.slice(0, FILE_LIMIT)

  const pick = (e: LibEntry) =>
    onSelect({ id: e.id, label: e.label, attachment: entryAttachment(e, false) })

  return (
    <div className="biblioteca-submenu" role="listbox" aria-label="Arquivos">
      <div className="bib-search">
        <img src={searchIcon} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar arquivo"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bib-scroll">
        {shown.length > 0 ? (
          <div className="bib-section">
            <div className="bib-header">Arquivos</div>
            {shown.map((f) => (
              <button
                key={f.id}
                type="button"
                className="bib-row"
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(f)
                }}
              >
                {f.thumb ? (
                  <span className="bib-icon is-thumb">
                    <img src={f.thumb} alt="" loading="lazy" />
                  </span>
                ) : (
                  <span
                    className="bib-icon"
                    style={{ background: `color-mix(in srgb, ${f.color} 14%, var(--pop-surface))` }}
                  >
                    <img src={f.img} alt="" />
                  </span>
                )}
                <span className="bib-text">
                  <span className="bib-label">{f.label}</span>
                  <span className="bib-sub">{f.sub}</span>
                </span>
              </button>
            ))}
            {!q && !showAll && files.length > FILE_LIMIT && (
              <button
                type="button"
                className="bib-more"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setShowAll(true)
                }}
              >
                Ver mais {files.length - FILE_LIMIT}
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
