import { useMemo, useState } from 'react'
import searchIcon from '../assets/library/search.svg'
import { COLLECTIONS, FILES, entryAttachment, normalizeLib } from './libraryEntries'
import type { LibEntry } from './libraryEntries'
import type { MentionItem } from './MentionMenu'

const COLL_LIMIT = 4
const FILE_LIMIT = 5

type Props = { onSelect: (item: MentionItem) => void }

export default function BibliotecaSubmenu({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [showAllColl, setShowAllColl] = useState(false)
  const [showAllFiles, setShowAllFiles] = useState(false)

  const q = normalizeLib(query)
  const colls = useMemo(
    () => (q ? COLLECTIONS.filter((c) => normalizeLib(c.label).includes(q)) : COLLECTIONS),
    [q],
  )
  const files = useMemo(
    () => (q ? FILES.filter((f) => normalizeLib(f.label).includes(q)) : FILES),
    [q],
  )

  const shownColls = showAllColl || q ? colls : colls.slice(0, COLL_LIMIT)
  const shownFiles = showAllFiles || q ? files : files.slice(0, FILE_LIMIT)

  const pick = (e: LibEntry, collection: boolean) =>
    onSelect({ id: e.id, label: e.label, attachment: entryAttachment(e, collection) })

  return (
    <div className="biblioteca-submenu" role="listbox" aria-label="Arquivos da Biblioteca">
      <div className="bib-search">
        <img src={searchIcon} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar na Biblioteca"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bib-scroll">
        {shownColls.length > 0 && (
          <div className="bib-section">
            <div className="bib-header">Coleções</div>
            {shownColls.map((c) => (
              <button
                key={c.id}
                type="button"
                className="bib-row"
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(c, true)
                }}
              >
                {c.emoji ? (
                  <span className="bib-icon is-emoji">{c.emoji}</span>
                ) : (
                  <span className="bib-icon is-folder">
                    <img src={c.img} alt="" />
                  </span>
                )}
                <span className="bib-text">
                  <span className="bib-label">{c.label}</span>
                  <span className="bib-sub">{c.sub}</span>
                </span>
              </button>
            ))}
            {!q && !showAllColl && colls.length > COLL_LIMIT && (
              <button
                type="button"
                className="bib-more"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setShowAllColl(true)
                }}
              >
                Ver mais {colls.length - COLL_LIMIT}
              </button>
            )}
          </div>
        )}

        {shownFiles.length > 0 && (
          <div className="bib-section">
            <div className="bib-header">Arquivos</div>
            {shownFiles.map((f) => (
              <button
                key={f.id}
                type="button"
                className="bib-row"
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(f, false)
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
            {!q && !showAllFiles && files.length > FILE_LIMIT && (
              <button
                type="button"
                className="bib-more"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setShowAllFiles(true)
                }}
              >
                Ver mais {files.length - FILE_LIMIT}
              </button>
            )}
          </div>
        )}

        {shownColls.length === 0 && shownFiles.length === 0 && (
          <div className="bib-empty">Sem resultados</div>
        )}
      </div>
    </div>
  )
}
