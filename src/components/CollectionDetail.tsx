import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './collection-detail.css'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link as LinkIcon,
  MoreHorizontal,
  Plus,
  Rows3,
  Search,
  StickyNote,
} from 'lucide-react'

type FileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'png' | 'url' | 'nota'
type DetailFile = { id: string; name: string; type: FileType; thumb?: string }
type Section = { id: string; title: string; color: string; files: DetailFile[] }

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/120/120`

const SECTIONS: Section[] = [
  {
    id: 's-docs',
    title: 'Employee Documentation',
    color: '#8A8F98',
    files: [
      { id: 'f1', name: 'Employee Handbook.pdf', type: 'pdf' },
      { id: 'f2', name: 'Onboarding Guide.pdf', type: 'pdf' },
      { id: 'f3', name: 'Leave and Attendance Policy.pdf', type: 'pdf' },
      { id: 'f4', name: 'Code of Conduct.pdf', type: 'pdf' },
      { id: 'f5', name: 'Remote Work Guidelines.pdf', type: 'pdf' },
      { id: 'f6', name: 'Travel & Expenses Policy.docx', type: 'docx' },
      { id: 'f7', name: 'IT Security Checklist.pdf', type: 'pdf' },
    ],
  },
  {
    id: 's-hiring',
    title: 'Recruitment & Hiring',
    color: '#3E63C4',
    files: [
      { id: 'f8', name: 'Job Description — Product Designer.docx', type: 'docx' },
      { id: 'f9', name: 'Interview Scorecard.xlsx', type: 'xlsx' },
      { id: 'f10', name: 'Offer Letter Template.docx', type: 'docx' },
      { id: 'f11', name: 'Careers Page', type: 'url' },
      { id: 'f12', name: 'Hiring Pipeline Q1.xlsx', type: 'xlsx' },
    ],
  },
  {
    id: 's-payroll',
    title: 'Payroll & Benefits',
    color: '#1F7A4D',
    files: [
      { id: 'f13', name: 'Payroll Calendar 2026.xlsx', type: 'xlsx' },
      { id: 'f14', name: '401k Enrollment Guide.pdf', type: 'pdf' },
      { id: 'f15', name: 'Health Plan Comparison.xlsx', type: 'xlsx' },
      { id: 'f16', name: 'Compensation Bands.pptx', type: 'pptx' },
      { id: 'f17', name: 'Benefits Overview 2026.pdf', type: 'pdf' },
    ],
  },
]

const LOOSE_FILES: DetailFile[] = [
  { id: 'l1', name: 'Marketing_Plan.pdf', type: 'pdf' },
  { id: 'l2', name: 'Org Chart 2026.png', type: 'png', thumb: thumb('orgchart') },
  { id: 'l3', name: 'Notas da última 1:1', type: 'nota' },
  { id: 'l4', name: 'HR Wiki (Notion)', type: 'url' },
]

const SHOW_LIMIT = 5

const NOVO_OPTIONS = [
  { id: 'arquivo', label: 'Arquivo', icon: <FileText size={16} strokeWidth={1.8} /> },
  { id: 'url', label: 'URL', icon: <LinkIcon size={16} strokeWidth={1.8} /> },
  { id: 'nota', label: 'Nota', icon: <StickyNote size={16} strokeWidth={1.8} /> },
  { id: 'secao', label: 'Seção', icon: <Rows3 size={16} strokeWidth={1.8} /> },
]

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function DocThumb() {
  return (
    <svg viewBox="0 0 28 34" fill="none" aria-hidden="true">
      <rect x="1.5" y="1" width="25" height="32" rx="2.5" fill="#fff" stroke="var(--cd-doc-stroke)" />
      <path d="M6 8h16M6 12h16M6 16h16M6 20h11" stroke="var(--cd-doc-line)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

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
        <LinkIcon size={16} strokeWidth={1.8} />
      </span>
    )
  }
  if (file.type === 'nota') {
    return (
      <span className="cd-thumb cd-thumb-icon">
        <StickyNote size={16} strokeWidth={1.8} />
      </span>
    )
  }
  return (
    <span className="cd-thumb cd-thumb-doc">
      <DocThumb />
    </span>
  )
}

function FileRow({ file, i }: { file: DetailFile; i: number }) {
  return (
    <div className="cd-file" style={{ '--i': i } as CSSProperties}>
      <FileThumbIcon file={file} />
      <span className="cd-file-name">{file.name}</span>
      <button className="cd-file-more" type="button" aria-label="Ações do arquivo">
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>
    </div>
  )
}

export default function CollectionDetail({
  name,
  creator,
  onBack,
}: {
  name: string
  creator: string
  onBack: () => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [novoOpen, setNovoOpen] = useState(false)

  const q = normalize(query.trim())

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const sections = useMemo(() => {
    if (!q) return SECTIONS
    return SECTIONS.map((s) => ({
      ...s,
      files: s.files.filter((f) => normalize(f.name).includes(q)),
    })).filter((s) => s.files.length > 0)
  }, [q])

  const looseFiles = useMemo(
    () => (q ? LOOSE_FILES.filter((f) => normalize(f.name).includes(q)) : LOOSE_FILES),
    [q],
  )

  useEffect(() => {
    if (!novoOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.cd-novo')) setNovoOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [novoOpen])

  return (
    <main className="library-page">
      <div className="lib-container cd-container">
        <nav className="cd-breadcrumb" aria-label="Navegação">
          <button className="cd-back" type="button" onClick={onBack} aria-label="Voltar">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button className="cd-crumb" type="button" onClick={onBack}>
            Biblioteca
          </button>
          <ChevronRight size={14} strokeWidth={2} className="cd-crumb-sep" />
          <span className="cd-crumb is-current">{name}</span>
        </nav>

        <div className="cd-head">
          <div className="cd-head-text">
            <h1 className="cd-title">{name}</h1>
            <p className="cd-creator">Criado por {creator}</p>
          </div>
          <div className="cd-novo">
            <button
              type="button"
              className={`cd-novo-btn${novoOpen ? ' is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={novoOpen}
              onClick={() => setNovoOpen((o) => !o)}
            >
              <Plus size={16} strokeWidth={2.2} />
              Novo
            </button>
            {novoOpen && (
              <div className="cd-novo-menu" role="menu">
                {NOVO_OPTIONS.map((o) => (
                  <button key={o.id} type="button" className="cd-novo-item" role="menuitem">
                    {o.icon}
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cd-search">
          <Search size={15} strokeWidth={1.9} />
          <input
            type="text"
            placeholder="Buscar nesta coleção"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="cd-list">
          {sections.map((section) => {
            const isCollapsed = collapsed.has(section.id) && !q
            const seeAll = showAll.has(section.id) || !!q
            const files = seeAll ? section.files : section.files.slice(0, SHOW_LIMIT)
            const hasMore = !q && section.files.length > SHOW_LIMIT
            return (
              <section className="cd-section" key={section.id}>
                <div className="cd-section-head">
                  <span className="cd-section-title">
                    <span className="cd-section-dot" style={{ background: section.color }} />
                    {section.title}
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
                    <button type="button" className="cd-icon-btn" aria-label="Adicionar">
                      <Plus size={17} strokeWidth={2} />
                    </button>
                    <button type="button" className="cd-icon-btn" aria-label="Mais">
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="cd-section-body">
                    {files.map((f, i) => (
                      <FileRow key={f.id} file={f} i={i} />
                    ))}
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
              <FileRow file={f} i={i} />
            </div>
          ))}

          {sections.length === 0 && looseFiles.length === 0 && (
            <div className="cd-empty">Nenhum arquivo encontrado</div>
          )}
        </div>
      </div>
    </main>
  )
}
