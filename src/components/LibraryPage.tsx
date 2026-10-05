import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './library-page.css'
import search from '../assets/library/search.svg'
import plus from '../assets/library/plus.svg'
import icDotsActions from '../assets/library/dots-actions.svg'
import folder from '../assets/library/folder.svg'
import { StickyNote } from 'lucide-react'
import {
  FileTextIcon,
  FolderSimpleIcon,
  ImageIcon,
  PresentationChartIcon,
  SlidesIcon,
  SpeakerHighIcon,
  UploadSimpleIcon,
  VideoCameraIcon,
} from './SidebarIcons'
import ProjectHome from './ProjectHome'
import fPdf from '../assets/library/file-pdf.svg'
import fImage from '../assets/library/file-image.svg'
import fText from '../assets/library/file-text.svg'
import fPpt from '../assets/library/ppt.svg'
import fExcel from '../assets/library/excel.svg'
import fVideo from '../assets/library/video.svg'
import fWave from '../assets/library/waveform.svg'
import fGlobe from '../assets/library/globe-file.svg'
import fZip from '../assets/library/filezip.svg'

type Collection = {
  id: string
  name: string
  description: string
  createdAt: string
  emoji?: string
  color: string
}

/* cor + emoji são apenas defaults de demonstração — no produto o usuário
   escolhe ambos na criação do projeto */
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

/* pastas de arquivos soltas na Biblioteca (nomes de demonstração) */
type FolderRow = { name: string; modified: string }
const FOLDERS: FolderRow[] = [
  { name: 'Campanha de Verão 2026', modified: 'há 2 horas' },
  { name: 'Assets de Marca', modified: 'ontem' },
  { name: 'Contratos e Jurídico', modified: '3 dias atrás' },
  { name: 'Referências Visuais', modified: '1 semana atrás' },
]

/* menu do botão "Novo": Adicionar (upload/pasta/nota) + Gerar (pilares) */
type NovoItem = { id: string; label: string; icon: ReactNode }
type NovoSection = { label: string; items: NovoItem[] }

const NOVO_SECTIONS: NovoSection[] = [
  {
    label: 'Adicionar',
    items: [
      { id: 'upload', label: 'Fazer upload de arquivos', icon: <UploadSimpleIcon /> },
      { id: 'pasta', label: 'Criar pasta', icon: <FolderSimpleIcon /> },
      { id: 'nota', label: 'Nota', icon: <StickyNote size={17} strokeWidth={1.7} /> },
    ],
  },
  {
    label: 'Gerar',
    items: [
      { id: 'imagem', label: 'Imagem', icon: <ImageIcon /> },
      { id: 'video', label: 'Vídeo', icon: <VideoCameraIcon size={17} /> },
      { id: 'reuniao', label: 'Reunião', icon: <PresentationChartIcon size={17} /> },
      { id: 'audio', label: 'Áudio', icon: <SpeakerHighIcon size={17} /> },
      { id: 'documento', label: 'Documento', icon: <FileTextIcon size={17} /> },
      { id: 'apresentacao', label: 'Apresentação', icon: <SlidesIcon size={17} /> },
    ],
  },
]

const FILE_FILTERS = ['Todos', 'Texto e PDF', 'Slides', 'Planilhas', 'Imagens', 'Vídeos', 'Áudio', 'Outros']

type FileRow = { name: string; type: string; modified: string; icon: string; color: string; thumb?: string }

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/80/80`

const FILES: FileRow[] = [
  { name: 'Guia de marca Inner 2026', type: 'PDF', modified: 'há 2 horas', icon: fPdf, color: '#C0392B' },
  { name: 'Hero 3D do site novo', type: 'Imagem', modified: 'há 3 horas', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-hero') },
  { name: 'Roteiro — vídeo institucional', type: 'Documento', modified: 'há 5 horas', icon: fText, color: '#3E63C4' },
  { name: 'Deck de vendas Q4', type: 'Slides', modified: 'ontem', icon: fPpt, color: '#C15A2B' },
  { name: 'Planilha de criativos — outubro', type: 'Planilha', modified: 'ontem', icon: fExcel, color: '#1F7A4D' },
  { name: 'Banner da Black Friday', type: 'Imagem', modified: 'ontem', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-banner') },
  { name: 'Teaser do lançamento V4.mp4', type: 'Vídeo', modified: '2 dias atrás', icon: fVideo, color: '#4C52C4' },
  { name: 'Jingle da campanha de verão', type: 'Áudio', modified: '2 dias atrás', icon: fWave, color: '#C98A2D' },
  { name: 'Pesquisa de concorrentes', type: 'Website', modified: '3 dias atrás', icon: fGlobe, color: '#2563B8' },
  { name: 'Contrato de parceria.pdf', type: 'PDF', modified: '3 dias atrás', icon: fPdf, color: '#C0392B' },
  { name: 'Fotos do ensaio de produto', type: 'Imagem', modified: '4 dias atrás', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-ensaio') },
  { name: 'Export de assets — marca.zip', type: 'Arquivo', modified: '4 dias atrás', icon: fZip, color: '#8A8A82' },
  { name: 'Narração do onboarding', type: 'Áudio', modified: '5 dias atrás', icon: fWave, color: '#C98A2D' },
  { name: 'Relatório de métricas — setembro', type: 'Planilha', modified: '5 dias atrás', icon: fExcel, color: '#1F7A4D' },
  { name: 'Apresentação para investidores', type: 'Slides', modified: '1 semana atrás', icon: fPpt, color: '#C15A2B' },
]

export default function LibraryPage({
  isPinned,
  togglePin,
}: {
  isPinned: (kind: 'chat' | 'project', id: string) => boolean
  togglePin: (kind: 'chat' | 'project', id: string) => void
}) {
  const [filter, setFilter] = useState('Todos')
  /* switcher de visualização — apenas visual (não altera o layout por ora) */
  const [view, setView] = useState<'grid' | 'list'>('list')
  /* projeto aberto (nível de navegação dentro da Biblioteca) */
  const [openCollection, setOpenCollection] = useState<string | null>(null)
  /* dropdown do botão "Novo" */
  const [novoOpen, setNovoOpen] = useState(false)

  useEffect(() => {
    if (!novoOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.lib-novo')) setNovoOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [novoOpen])

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

  return (
    <main className="library-page">
      <div className="lib-container">
        <h1 className="lib-title">Biblioteca</h1>

        <div className="lib-search">
          <img src={search} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar em toda a Biblioteca" spellCheck={false} />
        </div>

        {/* Projetos */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Projetos</h2>
              <p>Arquivos agrupados por projeto para usar como contexto</p>
            </div>
            <button className="lib-new" type="button" aria-label="Novo projeto">
              <img src={plus} alt="" aria-hidden="true" />
              <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                Novo projeto
              </span>
            </button>
          </div>

          <div className="lib-collections">
            {COLLECTIONS.map((c, i) => (
              <button
                className="coll-card"
                type="button"
                key={c.name}
                style={{ '--i': i } as CSSProperties}
                onClick={() => setOpenCollection(c.name)}
              >
                <span className="coll-card-top" style={{ background: c.color }}>
                  <span className="coll-card-avatar">
                    <span className="coll-emoji">{c.emoji}</span>
                  </span>
                </span>
                <span className="coll-card-body">
                  <span className="coll-name">{c.name}</span>
                  <span className="coll-desc">{c.description}</span>
                  <span className="coll-date">{c.createdAt}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Arquivos */}
        <section className="lib-section">
          <div className="lib-section-head">
            <h2 className="lib-files-title">Arquivos</h2>
            <div className="lib-files-actions">
              <button className="lib-new is-ghost" type="button" aria-label="Filtrar">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                    stroke="#3D3D3D"
                    strokeWidth="1.125"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                  Filtrar
                </span>
              </button>
              <div className="lib-view-switch" role="group" aria-label="Visualização">
                <button
                  className={`lib-view-opt${view === 'grid' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em grade"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2.6" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="2.6" y="10" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="10" width="5.4" height="5.4" rx="1.5" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em grade
                  </span>
                </button>
                <button
                  className={`lib-view-opt${view === 'list' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em lista"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2" y="3.5" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="3.95" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="7.8" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="8.25" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="12.1" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="12.55" width="9.7" height="1.5" rx="0.75" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em lista
                  </span>
                </button>
              </div>
              <div className="lib-novo">
                <button
                  className={`lib-new-cta${novoOpen ? ' is-open' : ''}`}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={novoOpen}
                  onClick={() => setNovoOpen((o) => !o)}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Novo
                </button>
                {novoOpen && (
                  <div className="lib-novo-menu" role="menu">
                    {NOVO_SECTIONS.map((section) => (
                      <div className="lib-novo-section" key={section.label}>
                        <div className="lib-novo-label">{section.label}</div>
                        {section.items.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            className="lib-novo-item"
                            role="menuitem"
                            onClick={() => setNovoOpen(false)}
                          >
                            <span className="lib-novo-icon">{it.icon}</span>
                            <span className="lib-novo-text">{it.label}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lib-filters">
            {FILE_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`lib-pill${filter === f ? ' is-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="lib-files">
            <div className="lib-files-head">
              <span className="col-name">Nome</span>
              <span className="col-type">Tipo</span>
              <span className="col-mod">Modificado</span>
              <span className="col-act" />
            </div>
            {FOLDERS.map((f) => (
              <div className="file-row is-folder" key={f.name}>
                <span
                  className="file-icon is-folder"
                  style={{ background: 'color-mix(in srgb, #8A8A82 18%, var(--card-surface))' }}
                >
                  <img src={folder} alt="" />
                </span>
                <span className="col-name file-name">{f.name}</span>
                <span className="col-type file-type">Pasta</span>
                <span className="col-mod file-mod">{f.modified}</span>
                <button className="col-act file-act" type="button" aria-label="Ações">
                  <img src={icDotsActions} alt="" aria-hidden="true" />
                </button>
              </div>
            ))}
            {FILES.map((file) => (
              <div className="file-row" key={file.name}>
                {file.thumb ? (
                  <span className="file-icon is-thumb">
                    <img src={file.thumb} alt="" loading="lazy" />
                  </span>
                ) : (
                  <span
                    className="file-icon"
                    style={{ background: `color-mix(in srgb, ${file.color} 14%, var(--card-surface))` }}
                  >
                    <img src={file.icon} alt="" />
                  </span>
                )}
                <span className="col-name file-name">{file.name}</span>
                <span className="col-type file-type">{file.type}</span>
                <span className="col-mod file-mod">{file.modified}</span>
                <button className="col-act file-act" type="button" aria-label="Ações">
                  <img src={icDotsActions} alt="" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
