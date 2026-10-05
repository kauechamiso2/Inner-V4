import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './collection-detail.css'
import {
  ChevronDown,
  FileText,
  Link as LinkIcon,
  MoreHorizontal,
  Plus,
  Rows3,
  Search,
  StickyNote,
} from 'lucide-react'
import fPdf from '../assets/library/file-pdf.svg'
import fText from '../assets/library/file-text.svg'
import fExcel from '../assets/library/excel.svg'
import fPpt from '../assets/library/ppt.svg'

export type FileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'png' | 'url' | 'nota'
export type DetailFile = { id: string; name: string; type: FileType; thumb?: string }
export type Section = { id: string; title: string; color: string; files: DetailFile[] }

/* ícone + cor por extensão (mesma iconografia da Biblioteca) */
const TYPE_META: Record<string, { icon: string; color: string }> = {
  pdf: { icon: fPdf, color: '#C0392B' },
  docx: { icon: fText, color: '#3E63C4' },
  txt: { icon: fText, color: '#3E63C4' },
  xlsx: { icon: fExcel, color: '#1F7A4D' },
  pptx: { icon: fPpt, color: '#C15A2B' },
}

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/120/120`

export const CONTEXT_SECTIONS: Section[] = [
  {
    id: 's-docs',
    title: 'Documentação de Funcionários',
    color: '#8A8F98',
    files: [
      { id: 'f1', name: 'Manual do Funcionário.pdf', type: 'pdf' },
      { id: 'f2', name: 'Guia de Integração.pdf', type: 'pdf' },
      { id: 'f3', name: 'Política de Férias e Ponto.pdf', type: 'pdf' },
      { id: 'f4', name: 'Código de Conduta.pdf', type: 'pdf' },
      { id: 'f5', name: 'Diretrizes de Trabalho Remoto.pdf', type: 'pdf' },
      { id: 'f6', name: 'Política de Viagens e Despesas.docx', type: 'docx' },
      { id: 'f7', name: 'Checklist de Segurança de TI.pdf', type: 'pdf' },
    ],
  },
  {
    id: 's-hiring',
    title: 'Recrutamento e Contratação',
    color: '#3E63C4',
    files: [
      { id: 'f8', name: 'Descrição de Vaga — Product Designer.docx', type: 'docx' },
      { id: 'f9', name: 'Ficha de Entrevista.xlsx', type: 'xlsx' },
      { id: 'f10', name: 'Modelo de Carta de Oferta.docx', type: 'docx' },
      { id: 'f11', name: 'Página de Carreiras', type: 'url' },
      { id: 'f12', name: 'Pipeline de Contratação Q1.xlsx', type: 'xlsx' },
    ],
  },
  {
    id: 's-payroll',
    title: 'Folha e Benefícios',
    color: '#1F7A4D',
    files: [
      { id: 'f13', name: 'Calendário de Folha 2026.xlsx', type: 'xlsx' },
      { id: 'f14', name: 'Guia de Previdência Privada.pdf', type: 'pdf' },
      { id: 'f15', name: 'Comparativo de Planos de Saúde.xlsx', type: 'xlsx' },
      { id: 'f16', name: 'Faixas Salariais.pptx', type: 'pptx' },
      { id: 'f17', name: 'Visão Geral de Benefícios 2026.pdf', type: 'pdf' },
    ],
  },
]

export const CONTEXT_LOOSE_FILES: DetailFile[] = [
  { id: 'l1', name: 'Plano_de_Marketing.pdf', type: 'pdf' },
  { id: 'l2', name: 'Organograma 2026.png', type: 'png', thumb: thumb('orgchart') },
  { id: 'l3', name: 'Notas da última 1:1', type: 'nota' },
  { id: 'l4', name: 'Wiki de RH (Notion)', type: 'url' },
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
        <LinkIcon size={17} strokeWidth={1.8} />
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
  const meta = TYPE_META[file.type]
  return (
    <span
      className="cd-thumb cd-thumb-file"
      style={{ background: `color-mix(in srgb, ${meta.color} 14%, var(--card-surface))` }}
    >
      <img src={meta.icon} alt="" />
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

/* Busca + seções de arquivos + arquivos soltos — reusado na página de coleção
   (HR Stuff) e no modal de Contexto de um projeto. */
export default function ContextFileList({
  searchPlaceholder = 'Buscar neste projeto',
}: {
  searchPlaceholder?: string
}) {
  /* seções começam fechadas */
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(CONTEXT_SECTIONS.map((s) => s.id)),
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

  const sections = useMemo(() => {
    if (!q) return CONTEXT_SECTIONS
    return CONTEXT_SECTIONS.map((s) => ({
      ...s,
      files: s.files.filter((f) => normalize(f.name).includes(q)),
    })).filter((s) => s.files.length > 0)
  }, [q])

  const looseFiles = useMemo(
    () => (q ? CONTEXT_LOOSE_FILES.filter((f) => normalize(f.name).includes(q)) : CONTEXT_LOOSE_FILES),
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
          <button className="cd-search-filter" type="button" aria-label="Filtrar">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                stroke="#3D3D3D"
                strokeWidth="1.125"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </button>
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
    </>
  )
}
