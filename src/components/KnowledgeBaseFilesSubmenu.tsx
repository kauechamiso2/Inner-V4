import { useMemo, useState } from 'react'
import searchIcon from '../assets/library/search.svg'
import { fileAttachment } from './ContextFileList'
import type { DetailFile } from './ContextFileList'
import type { KnowledgeBase } from './knowledgeBases'
import { FileIcon } from './ProjectFilesSubmenu'
import type { MentionItem } from './MentionMenu'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

type Props = {
  base: KnowledgeBase
  onSelect: (item: MentionItem) => void
}

/* Nível de arquivos de uma base de conhecimento: "base inteira" + arquivos
   (por seção e soltos), com busca. Aberto em cascata a partir de uma base. */
export default function KnowledgeBaseFilesSubmenu({ base, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const q = normalize(query)

  const sections = useMemo(
    () =>
      base.sections.map((s) => ({
        title: s.title,
        files: q ? s.files.filter((f) => normalize(f.name).includes(q)) : s.files,
      })),
    [base, q],
  )
  const loose = useMemo(
    () => base.loose.filter((f) => !q || normalize(f.name).includes(q)),
    [base, q],
  )
  const hasAny = sections.some((s) => s.files.length > 0) || loose.length > 0

  const pickFile = (f: DetailFile) =>
    onSelect({ id: `${base.id}-${f.id}`, label: f.name, attachment: fileAttachment(f) })

  const pickBase = () =>
    onSelect({
      id: base.id,
      label: base.name,
      attachment: { kind: 'collection', name: base.name, emoji: base.emoji, color: base.color },
    })

  return (
    <div className="biblioteca-submenu" role="listbox" aria-label={base.name}>
      <div className="bib-search">
        <img src={searchIcon} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar na base"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bib-scroll">
        {!q && (
          <button
            type="button"
            className="bib-row"
            onMouseDown={(e) => {
              e.preventDefault()
              pickBase()
            }}
          >
            <span className="bib-icon is-emoji">{base.emoji}</span>
            <span className="bib-text">
              <span className="bib-label">Usar a base inteira</span>
              <span className="bib-sub">{base.name}</span>
            </span>
          </button>
        )}

        {hasAny ? (
          <>
            {sections.map((s) =>
              s.files.length > 0 ? (
                <div className="bib-section" key={s.title}>
                  <div className="bib-header">{s.title}</div>
                  {s.files.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="bib-row"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        pickFile(f)
                      }}
                    >
                      <FileIcon file={f} />
                      <span className="bib-text">
                        <span className="bib-label">{f.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null,
            )}

            {loose.length > 0 && (
              <div className="bib-section">
                <div className="bib-header">Outros</div>
                {loose.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="bib-row"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      pickFile(f)
                    }}
                  >
                    <FileIcon file={f} />
                    <span className="bib-text">
                      <span className="bib-label">{f.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bib-empty">Sem resultados</div>
        )}
      </div>
    </div>
  )
}
