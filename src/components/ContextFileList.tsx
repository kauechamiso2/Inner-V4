import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './collection-detail.css'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Rows3,
  Search,
  StickyNote,
  Upload,
} from 'lucide-react'
import { LibraryPicker, NoteModal, UrlModal } from './ContextAdd'
import { ConfirmDeleteModal } from './ChatModals'
import FileDropOverlay from './FileDropOverlay'
import { FileTextIcon } from './SidebarIcons'
import './tasks-page.css'
import type { LibEntry } from './libraryEntries'
import fPdf from '../assets/library/file-pdf.svg'
import fText from '../assets/library/file-text.svg'
import fExcel from '../assets/library/excel.svg'
import fPpt from '../assets/library/ppt.svg'

import type { Attachment } from './MentionMenu'

export type FileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'png' | 'url' | 'nota'
export type DetailFile = {
  id: string
  name: string
  type: FileType
  thumb?: string
  /* URL: favicon do site e o endereço */
  favicon?: string
  url?: string
  /* vindo da Biblioteca: ícone/cor do tipo original */
  img?: string
  color?: string
  /* Nota: conteúdo formatado */
  html?: string
}
export type Section = { id: string; title: string; color: string; files: DetailFile[] }

/* ícone + cor por extensão (mesma iconografia da Biblioteca) */
const TYPE_META: Record<string, { icon: string; color: string }> = {
  pdf: { icon: fPdf, color: '#C0392B' },
  docx: { icon: fText, color: '#3E63C4' },
  txt: { icon: fText, color: '#3E63C4' },
  xlsx: { icon: fExcel, color: '#1F7A4D' },
  pptx: { icon: fPpt, color: '#C15A2B' },
}

const TYPE_LABEL: Record<FileType, string> = {
  pdf: 'PDF',
  docx: 'Documento',
  txt: 'Texto',
  xlsx: 'Planilha',
  pptx: 'Apresentação',
  png: 'Imagem',
  url: 'Link',
  nota: 'Nota',
}

/* mapeia um arquivo do contexto para um anexo do input (chip), reaproveitando
   a mesma iconografia — usado ao citar um arquivo específico de um projeto. */
export function fileAttachment(file: DetailFile): Attachment {
  if (file.type === 'png' && file.thumb) {
    return { kind: 'image', name: file.name, thumb: file.thumb }
  }
  if (file.type === 'url') return { kind: 'file', name: file.name, fileType: 'Link', emoji: '🔗' }
  if (file.type === 'nota') return { kind: 'file', name: file.name, fileType: 'Nota', emoji: '📝' }
  const meta = TYPE_META[file.type] ?? TYPE_META.docx
  return { kind: 'file', name: file.name, fileType: TYPE_LABEL[file.type], img: meta.icon, color: meta.color }
}

const SHOW_LIMIT = 5

export type AddKind = 'upload' | 'biblioteca' | 'url' | 'nota' | 'secao'
const ADD_OPTIONS: { id: AddKind; label: string; icon: ReactNode }[] = [
  { id: 'upload', label: 'Upload de arquivos', icon: <Upload size={16} strokeWidth={1.8} /> },
  /* mesmo ícone de "Minha biblioteca" do menu @ da Home */
  { id: 'biblioteca', label: 'Da biblioteca', icon: <FileTextIcon size={16} color="currentColor" /> },
  { id: 'url', label: 'URL', icon: <LinkIcon size={16} strokeWidth={1.8} /> },
  { id: 'nota', label: 'Nota', icon: <StickyNote size={16} strokeWidth={1.8} /> },
  { id: 'secao', label: 'Seção', icon: <Rows3 size={16} strokeWidth={1.8} /> },
]

/* filtros por tipo (todos os tipos que o contexto aceita) */
const FILTER_TYPES: FileType[] = ['pdf', 'docx', 'txt', 'xlsx', 'pptx', 'png', 'url', 'nota']

/* cores das seções novas (bolinha ao lado do título) */
const SECTION_COLORS = ['#3E63C4', '#1F7A4D', '#C15A2B', '#8E4EC6', '#C99400', '#E93D82']

/* tipo do arquivo enviado pela extensão */
function typeOfName(name: string): FileType {
  const e = name.split('.').pop()?.toLowerCase() ?? ''
  if (e === 'pdf') return 'pdf'
  if (/xls|csv|numbers/.test(e)) return 'xlsx'
  if (/ppt|key/.test(e)) return 'pptx'
  if (/png|jpe?g|gif|webp|svg|heic/.test(e)) return 'png'
  if (e === 'txt' || e === 'md') return 'txt'
  return 'docx'
}
const LIB_TYPE: Record<string, FileType> = {
  PDF: 'pdf',
  Imagem: 'png',
  Documento: 'docx',
  Slides: 'pptx',
  Planilha: 'xlsx',
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function FileThumbIcon({ file }: { file: DetailFile }) {
  if (file.type === 'png' && file.thumb) {
    return (
      <span className="cd-thumb cd-thumb-img">
        <img src={file.thumb} alt="" loading="lazy" />
      </span>
    )
  }
  if (file.type === 'url') {
    return (
      <span className="cd-thumb cd-thumb-icon">
        {file.favicon ? <img className="cd-favicon" src={file.favicon} alt="" /> : <LinkIcon size={17} strokeWidth={1.8} />}
      </span>
    )
  }
  if (file.img) {
    return (
      <span
        className="cd-thumb cd-thumb-file"
        style={{ background: `color-mix(in srgb, ${file.color ?? '#8A8A82'} 14%, var(--card-surface))` }}
      >
        <img src={file.img} alt="" />
      </span>
    )
  }
  if (file.type === 'nota') {
    return (
      <span className="cd-thumb cd-thumb-icon">
        <StickyNote size={17} strokeWidth={1.8} />
      </span>
    )
  }
  const meta = TYPE_META[file.type] ?? TYPE_META.docx
  return (
    <span
      className="cd-thumb cd-thumb-file"
      style={{ background: `color-mix(in srgb, ${meta.color} 14%, var(--card-surface))` }}
    >
      <img src={meta.icon} alt="" />
    </span>
  )
}

function FileRow({ file, i, onOpen }: { file: DetailFile; i: number; onOpen?: () => void }) {
  return (
    <div
      className={`cd-file${onOpen ? ' is-clickable' : ''}`}
      style={{ '--i': i } as CSSProperties}
      onClick={onOpen}
    >
      <FileThumbIcon file={file} />
      <span className="cd-file-name">{file.name}</span>
      {file.type === 'url' && file.url && <span className="cd-file-sub">{new URL(file.url).hostname.replace(/^www\./, '')}</span>}
      <button className="cd-file-more" type="button" aria-label="Ações do arquivo">
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>
    </div>
  )
}

/* Busca + seções de arquivos + arquivos soltos — reusado na página de coleção
   (HR Stuff) e no modal de Contexto de um projeto. */
export default function ContextFileList({
  allSections,
  allLoose,
  searchPlaceholder = 'Buscar neste projeto',
  onAddedChange,
  renderEmpty,
  dropWhere,
  dropEnabled = true,
}: {
  allSections: Section[]
  allLoose: DetailFile[]
  searchPlaceholder?: string
  /* quantos itens foram adicionados (o modal recalcula o % de contexto) */
  onAddedChange?: (count: number) => void
  /* estado vazio próprio (ex.: base de conhecimento recém-criada); recebe o "adicionar" */
  renderEmpty?: (add: (kind: AddKind | 'menu') => void) => ReactNode
  /* arrastar arquivos do computador: destino no aviso (ex.: "Na base Jurídico") */
  dropWhere?: string
  dropEnabled?: boolean
}) {
  /* itens adicionados nesta sessão (seções novas, arquivos, URLs, notas) */
  const [newSections, setNewSections] = useState<Section[]>([])
  const [addedLoose, setAddedLoose] = useState<DetailFile[]>([])
  /* onde o próximo item entra: solto (null) ou numa seção */
  const [target, setTarget] = useState<string | null>(null)
  const [libOpen, setLibOpen] = useState(false)
  const [urlOpen, setUrlOpen] = useState(false)
  const [note, setNote] = useState<{ file?: DetailFile } | null>(null)
  const [renamingSection, setRenamingSection] = useState<string | null>(null)
  /* "..." da seção: renomear / excluir (vale para seções novas e as que já existiam) */
  const [secMore, setSecMore] = useState<string | null>(null)
  const [titleEdits, setTitleEdits] = useState<Record<string, string>>({})
  const [deletedSecs, setDeletedSecs] = useState<Set<string>>(new Set())
  const [confirmSec, setConfirmSec] = useState<{ id: string; title: string; count: number } | null>(null)
  /* filtro por tipo (vazio = todos) */
  const [types, setTypes] = useState<Set<FileType>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const uid = () => `add-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  const pushItems = (items: DetailFile[], to: string | null = target) => {
    const target = to
    if (target) {
      if (newSections.some((x) => x.id === target)) {
        setNewSections((ss) => ss.map((x) => (x.id === target ? { ...x, files: [...items, ...x.files] } : x)))
      } else {
        /* seção que já existia: os itens entram na lista de adicionados dela */
        setSectionAdds((m) => ({ ...m, [target]: [...items, ...(m[target] ?? [])] }))
      }
      setCollapsed((c) => {
        const n = new Set(c)
        n.delete(target)
        return n
      })
    } else setAddedLoose((l) => [...items, ...l])
  }
  /* arquivos do computador (botão ou arrastando): soltos ou numa seção */
  const addFiles = (files: File[], to: string | null = target) => {
    const list = files.map<DetailFile>((f) => {
      const type = typeOfName(f.name)
      return { id: uid() + f.name, name: f.name, type, thumb: type === 'png' ? URL.createObjectURL(f) : undefined }
    })
    if (list.length) pushItems(list, to)
  }
  /* itens adicionados em seções que já existiam */
  const [sectionAdds, setSectionAdds] = useState<Record<string, DetailFile[]>>({})

  const startAdd = (kind: AddKind, sectionId: string | null = null) => {
    setTarget(sectionId)
    if (kind === 'biblioteca') {
      setLibOpen(true)
      return
    }
    setNovoOpen(false)
    if (kind === 'upload') fileRef.current?.click()
    if (kind === 'url') setUrlOpen(true)
    if (kind === 'nota') setNote({})
    if (kind === 'secao') {
      const id = uid()
      setNewSections((ss) => [
        { id, title: 'Nova seção', color: SECTION_COLORS[ss.length % SECTION_COLORS.length], files: [] },
        ...ss,
      ])
      setRenamingSection(id)
    }
  }
  /* seções começam fechadas */
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(allSections.map((s) => s.id)),
  )
  const [showAll, setShowAll] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [novoOpen, setNovoOpen] = useState(false)

  const q = normalize(query.trim())

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const mergedSections = useMemo(
    () =>
      [
        ...newSections,
        ...allSections.map((sec) => ({ ...sec, files: [...(sectionAdds[sec.id] ?? []), ...sec.files] })),
      ]
        .filter((sec) => !deletedSecs.has(sec.id))
        .map((sec) => (titleEdits[sec.id] ? { ...sec, title: titleEdits[sec.id] } : sec)),
    [newSections, allSections, sectionAdds, deletedSecs, titleEdits],
  )
  const mergedLoose = useMemo(() => [...addedLoose, ...allLoose], [addedLoose, allLoose])
  const addedCount =
    addedLoose.length +
    newSections.reduce((n, sec) => n + sec.files.length, 0) +
    Object.values(sectionAdds).reduce((n, l) => n + l.length, 0)
  const cbRef = useRef(onAddedChange)
  cbRef.current = onAddedChange
  useEffect(() => cbRef.current?.(addedCount), [addedCount])

  const matches = (f: DetailFile) => (!q || normalize(f.name).includes(q)) && (types.size === 0 || types.has(f.type))
  const filtering = !!q || types.size > 0
  const sections = useMemo(() => {
    if (!filtering) return mergedSections
    return mergedSections
      .map((s) => ({ ...s, files: s.files.filter(matches) }))
      .filter((s) => s.files.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, types, mergedSections])

  const looseFiles = useMemo(
    () => (filtering ? mergedLoose.filter(matches) : mergedLoose),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, types, mergedLoose],
  )

  useEffect(() => {
    if (!novoOpen && !secMore && !filterOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.cd-novo') && !t.closest('.ca-lib') && !t.closest('.cd-sec-pop')) {
        setNovoOpen(false)
        setLibOpen(false)
        setSecMore(null)
      }
      if (!t.closest('.cd-filter-wrap')) setFilterOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [novoOpen, secMore, filterOpen])

  /* menu de adicionar: no "+ Adicionar" (itens soltos) ou no "+" de uma seção */
  const renderAddMenu = (inSection: boolean) => (
              <div className={`cd-novo-menu${inSection ? ' is-section' : ''}`} role="menu">
                {ADD_OPTIONS.filter((o) => !(target && o.id === 'secao')).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`cd-novo-item${o.id === 'biblioteca' && libOpen ? ' is-open' : ''}`}
                    role="menuitem"
                    onMouseEnter={() => setLibOpen(o.id === 'biblioteca')}
                    onClick={() => startAdd(o.id, target)}
                  >
                    {o.icon}
                    {o.label}
                    {o.id === 'biblioteca' && <ChevronRight className="cd-novo-chev" size={15} strokeWidth={2} />}
                  </button>
                ))}
                {libOpen && (
                  <LibraryPicker
                    added={[...addedLoose, ...newSections.flatMap((x) => x.files), ...Object.values(sectionAdds).flat()]
                      .map((f) => f.id.replace(/^lib-/, ''))}
                    onPick={(f: LibEntry) => {
                      pushItems([
                        {
                          id: `lib-${f.id}`,
                          name: f.label,
                          type: LIB_TYPE[f.sub] ?? 'docx',
                          thumb: f.thumb,
                          img: f.thumb ? undefined : f.img,
                          color: f.color,
                        },
                      ])
                    }}
                  />
                )}
              </div>
  )

  return (
    <>
      <div className="cd-search-row">
        <div className="cd-search">
          <Search size={15} strokeWidth={1.9} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cd-search-tools">
          <div className="cd-filter-wrap">
            <button
              className={`cd-search-filter${filterOpen || types.size ? ' is-on' : ''}`}
              type="button"
              aria-label="Filtrar por tipo"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                  stroke="currentColor"
                  strokeWidth="1.125"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              {types.size > 0 && <span className="cd-filter-badge">{types.size}</span>}
            </button>
            {filterOpen && (
              <div className="task-menu cd-filter-menu" role="menu">
                <button
                  type="button"
                  className="task-menu-item"
                  role="menuitemcheckbox"
                  aria-checked={types.size === 0}
                  onClick={() => setTypes(new Set())}
                >
                  Todos os arquivos
                  {types.size === 0 && <Check className="cd-filter-check" size={15} strokeWidth={2.4} />}
                </button>
                <div className="task-menu-sep" />
                <div className="lp-filter-label">Tipo de arquivo</div>
                {FILTER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="task-menu-item"
                    role="menuitemcheckbox"
                    aria-checked={types.has(t)}
                    onClick={() =>
                      setTypes((cur) => {
                        const n = new Set(cur)
                        n.has(t) ? n.delete(t) : n.add(t)
                        return n
                      })
                    }
                  >
                    <span className={`cd-filter-box${types.has(t) ? ' is-on' : ''}`} aria-hidden="true">
                      {types.has(t) && <Check size={11} strokeWidth={3} />}
                    </span>
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="cd-novo">
            <button
              type="button"
              className={`cd-novo-btn${novoOpen ? ' is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={novoOpen}
              onClick={() => {
                setTarget(null)
                setLibOpen(false)
                setNovoOpen((o) => !o)
              }}
            >
              <Plus size={16} strokeWidth={2.2} />
              Adicionar
            </button>
            {novoOpen && target === null && renderAddMenu(false)}
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []))
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </div>

      <FileDropOverlay
        enabled={dropEnabled}
        sub={dropWhere}
        onFiles={(files, section) => addFiles(files, section)}
      />
      <div className="cd-list">
        {sections.map((section) => {
          const isCollapsed = collapsed.has(section.id) && !q
          const seeAll = showAll.has(section.id) || !!q
          const files = seeAll ? section.files : section.files.slice(0, SHOW_LIMIT)
          const hasMore = !q && section.files.length > SHOW_LIMIT
          return (
            <section
              className="cd-section"
              key={section.id}
              data-drop-target={section.id}
              data-drop-label={`Na seção ${section.title}`}
            >
              <div className="cd-section-head">
                <span className="cd-section-title">
                  <span className="cd-section-dot" style={{ background: section.color }} />
                  {renamingSection === section.id ? (
                    <input
                      className="cd-section-input"
                      defaultValue={section.title}
                      autoFocus
                      onFocus={(e) => e.currentTarget.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
                      }}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim() || section.title || 'Nova seção'
                        setTitleEdits((m) => ({ ...m, [section.id]: v }))
                        setRenamingSection(null)
                      }}
                      aria-label="Nome da seção"
                    />
                  ) : (
                    section.title
                  )}
                  <span className="cd-section-count">
                    {section.files.length} {section.files.length === 1 ? 'arquivo' : 'arquivos'}
                  </span>
                </span>
                <div className="cd-section-actions">
                  <button
                    type="button"
                    className="cd-icon-btn"
                    aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
                    onClick={() => toggle(collapsed, setCollapsed, section.id)}
                  >
                    <ChevronDown size={17} strokeWidth={2} className={isCollapsed ? 'cd-chev-collapsed' : ''} />
                  </button>
                  {/* "+" da seção: abre o menu no próprio ícone e adiciona dentro dela */}
                  <span className="cd-sec-pop">
                    <button
                      type="button"
                      className={`cd-icon-btn${novoOpen && target === section.id ? ' is-open' : ''}`}
                      aria-label="Adicionar nesta seção"
                      onClick={() => {
                        setSecMore(null)
                        setLibOpen(false)
                        const opening = !(novoOpen && target === section.id)
                        setTarget(section.id)
                        setNovoOpen(opening)
                      }}
                    >
                      <Plus size={17} strokeWidth={2} />
                    </button>
                    {novoOpen && target === section.id && renderAddMenu(true)}
                  </span>
                  <span className="cd-sec-pop">
                    <button
                      type="button"
                      className={`cd-icon-btn${secMore === section.id ? ' is-open' : ''}`}
                      aria-label="Mais opções da seção"
                      onClick={() => {
                        setNovoOpen(false)
                        setSecMore((m) => (m === section.id ? null : section.id))
                      }}
                    >
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>
                    {secMore === section.id && (
                      <div className="task-menu cd-sec-menu" role="menu">
                        <button
                          type="button"
                          className="task-menu-item"
                          role="menuitem"
                          onClick={() => {
                            setSecMore(null)
                            setRenamingSection(section.id)
                          }}
                        >
                          <Pencil size={15} strokeWidth={1.9} />
                          Renomear
                        </button>
                        <div className="task-menu-sep" />
                        <button
                          type="button"
                          className="task-menu-item is-danger"
                          role="menuitem"
                          onClick={() => {
                            setSecMore(null)
                            setConfirmSec({ id: section.id, title: section.title, count: section.files.length })
                          }}
                        >
                          <Trash2 size={15} strokeWidth={1.9} />
                          Excluir seção
                        </button>
                      </div>
                    )}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="cd-section-body">
                  {files.map((f, i) => (
                    <FileRow key={f.id} file={f} i={i} onOpen={f.html !== undefined ? () => setNote({ file: f }) : undefined} />
                  ))}
                  {section.files.length === 0 && <div className="cd-section-empty">Seção vazia. Use + para adicionar.</div>}
                  {hasMore && !seeAll && (
                    <button
                      type="button"
                      className="cd-see-all"
                      onClick={() => toggle(showAll, setShowAll, section.id)}
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              )}
            </section>
          )
        })}

        {looseFiles.map((f, i) => (
          <div className="cd-loose" key={f.id}>
            <FileRow file={f} i={i} onOpen={f.html !== undefined ? () => setNote({ file: f }) : undefined} />
          </div>
        ))}

        {sections.length === 0 &&
          looseFiles.length === 0 &&
          (!filtering && renderEmpty ? (
            renderEmpty((kind) => {
              /* "menu": abre o "+ Adicionar" (de onde sai também o seletor da Biblioteca) */
              if (kind === 'menu' || kind === 'biblioteca') {
                setTarget(null)
                setNovoOpen(true)
                if (kind === 'biblioteca') setLibOpen(true)
              } else startAdd(kind)
            })
          ) : (
            <div className="cd-empty">
              {filtering ? 'Nenhum arquivo encontrado com esses filtros' : 'Nenhum contexto ainda. Use + Adicionar.'}
            </div>
          ))}
      </div>

      {confirmSec && (
        <ConfirmDeleteModal
          title="Excluir seção?"
          confirmLabel="Excluir seção"
          onClose={() => setConfirmSec(null)}
          onConfirm={() => setDeletedSecs((d) => new Set(d).add(confirmSec.id))}
        >
          A seção <strong>{confirmSec.title}</strong>
          {confirmSec.count > 0
            ? ` e ${confirmSec.count === 1 ? 'o arquivo dela' : `os ${confirmSec.count} arquivos dela`} serão excluídos`
            : ' será excluída'}{' '}
          do contexto do projeto. Essa ação não pode ser desfeita.
        </ConfirmDeleteModal>
      )}
      {urlOpen && (
        <UrlModal
          onClose={() => setUrlOpen(false)}
          onAdd={(u) => pushItems([{ id: uid(), name: u.name, type: 'url', url: u.url, favicon: u.favicon }])}
        />
      )}
      {note && (
        <NoteModal
          initialTitle={note.file?.name}
          initialHtml={note.file?.html}
          onClose={() => setNote(null)}
          onSave={(n) => {
            const edit = note.file
            if (edit) {
              const upd = (f: DetailFile) => (f.id === edit.id ? { ...f, name: n.title, html: n.html } : f)
              setAddedLoose((l) => l.map(upd))
              setNewSections((ss) => ss.map((x) => ({ ...x, files: x.files.map(upd) })))
              setSectionAdds((m) => Object.fromEntries(Object.entries(m).map(([k, l]) => [k, l.map(upd)])))
            } else pushItems([{ id: uid(), name: n.title, type: 'nota', html: n.html }])
          }}
        />
      )}
    </>
  )
}
