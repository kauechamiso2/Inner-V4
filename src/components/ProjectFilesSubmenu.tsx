import { useMemo, useState } from 'react'
import searchIcon from '../assets/library/search.svg'
import folder from '../assets/library/folder.svg'
import type { Project } from './projects'
import { PROJECT_CONTENT } from './projectContent'
import { fileAttachment } from './ContextFileList'
import type { DetailFile } from './ContextFileList'
import type { MentionItem } from './MentionMenu'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/* ícone de um arquivo do contexto (reaproveita o mapeamento do anexo) */
function FileIcon({ file }: { file: DetailFile }) {
  const att = fileAttachment(file)
  if (att.thumb) {
    return (
      <span className="bib-icon is-thumb">
        <img src={att.thumb} alt="" loading="lazy" />
      </span>
    )
  }
  if (att.emoji) return <span className="bib-icon is-emoji">{att.emoji}</span>
  return (
    <span
      className="bib-icon"
      style={{ background: `color-mix(in srgb, ${att.color} 14%, var(--pop-surface))` }}
    >
      <img src={att.img} alt="" />
    </span>
  )
}

type Props = {
  project: Project
  onSelect: (item: MentionItem) => void
}

/* Nível de arquivos de um projeto: "projeto inteiro" + arquivos do contexto
   (por seção e soltos), com busca. Aberto em cascata a partir de um projeto. */
export default function ProjectFilesSubmenu({ project, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const q = normalize(query)

  const content = PROJECT_CONTENT[project.id]

  const sections = useMemo(
    () =>
      (content?.contextSections ?? []).map((s) => ({
        title: s.title,
        files: q ? s.files.filter((f) => normalize(f.name).includes(q)) : s.files,
      })),
    [content, q],
  )
  const loose = useMemo(
    () => (content?.contextLoose ?? []).filter((f) => !q || normalize(f.name).includes(q)),
    [content, q],
  )
  const hasAny = sections.some((s) => s.files.length > 0) || loose.length > 0

  const pickFile = (f: DetailFile) =>
    onSelect({ id: `${project.id}-${f.id}`, label: f.name, attachment: fileAttachment(f) })

  const pickProject = () =>
    onSelect({
      id: project.id,
      label: project.name,
      citation: project.name,
      project: { id: project.id, name: project.name, emoji: project.emoji, color: project.color },
    })

  return (
    <div className="biblioteca-submenu projetos-submenu" role="listbox" aria-label={project.name}>
      <div className="bib-search">
        <img src={searchIcon} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar no contexto"
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
              pickProject()
            }}
          >
            <span className="bib-icon is-folder">
              <img src={folder} alt="" />
            </span>
            <span className="bib-text">
              <span className="bib-label">Usar o projeto inteiro</span>
              <span className="bib-sub">{project.name}</span>
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
