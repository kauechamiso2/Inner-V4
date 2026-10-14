import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ChevronDown, Folder, FolderPlus, Upload } from 'lucide-react'
import './library-page.css'
import './tasks-page.css'
import KnowledgeBaseDetail from './KnowledgeBaseDetail'
import TutorialEmpty, { LibraryArt } from './TutorialEmpty'
import { KNOWLEDGE_BASES } from './knowledgeBases'
import plus from '../assets/library/plus.svg'
import icDotsActions from '../assets/library/dots-actions.svg'
import fPdf from '../assets/library/file-pdf.svg'
import fImage from '../assets/library/file-image.svg'
import fText from '../assets/library/file-text.svg'
import fPpt from '../assets/library/ppt.svg'
import fExcel from '../assets/library/excel.svg'
import fVideo from '../assets/library/video.svg'
import fWave from '../assets/library/waveform.svg'
import fGlobe from '../assets/library/globe-file.svg'
import fZip from '../assets/library/filezip.svg'

const FILE_FILTERS = ['Todos', 'Texto e PDF', 'Slides', 'Planilhas', 'Imagens', 'Vídeos', 'Áudio', 'Outros']

type FileRow = {
  name: string
  type: string
  modified: string
  icon: string
  color: string
  thumb?: string
  /* pasta criada pelo "+ Novo" */
  folder?: boolean
  uid?: string
}

/* tipo legível a partir da extensão do arquivo enviado */
function rowFromFile(f: File, i: number): FileRow {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  const kind: [string, string, string] = /pdf/.test(ext)
    ? ['PDF', fPdf, '#C0392B']
    : /png|jpe?g|gif|webp|svg|heic/.test(ext)
      ? ['Imagem', fImage, '#7C4DC0']
      : /ppt|key/.test(ext)
        ? ['Slides', fPpt, '#C15A2B']
        : /xls|csv|numbers/.test(ext)
          ? ['Planilha', fExcel, '#1F7A4D']
          : /mp4|mov|webm/.test(ext)
            ? ['Vídeo', fVideo, '#4C52C4']
            : /mp3|wav|m4a/.test(ext)
              ? ['Áudio', fWave, '#C98A2D']
              : /zip|rar/.test(ext)
                ? ['Arquivo', fZip, '#8A8A82']
                : ['Documento', fText, '#3E63C4']
  const isImg = kind[0] === 'Imagem'
  return {
    uid: `up-${Date.now()}-${i}`,
    name: f.name,
    type: kind[0],
    modified: 'agora',
    icon: kind[1],
    color: kind[2],
    thumb: isImg ? URL.createObjectURL(f) : undefined,
  }
}

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/80/80`

const FILES: FileRow[] = [
  { name: 'Guia de marca Inner 2026', type: 'PDF', modified: 'há 2 horas', icon: fPdf, color: '#C0392B' },
  { name: 'Hero 3D do site novo', type: 'Imagem', modified: 'há 3 horas', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-hero') },
  { name: 'Roteiro: vídeo institucional', type: 'Documento', modified: 'há 5 horas', icon: fText, color: '#3E63C4' },
  { name: 'Deck de vendas Q4', type: 'Slides', modified: 'ontem', icon: fPpt, color: '#C15A2B' },
  { name: 'Planilha de criativos: outubro', type: 'Planilha', modified: 'ontem', icon: fExcel, color: '#1F7A4D' },
  { name: 'Banner da Black Friday', type: 'Imagem', modified: 'ontem', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-banner') },
  { name: 'Teaser do lançamento V4.mp4', type: 'Vídeo', modified: '2 dias atrás', icon: fVideo, color: '#4C52C4' },
  { name: 'Jingle da campanha de verão', type: 'Áudio', modified: '2 dias atrás', icon: fWave, color: '#C98A2D' },
  { name: 'Pesquisa de concorrentes', type: 'Website', modified: '3 dias atrás', icon: fGlobe, color: '#2563B8' },
  { name: 'Contrato de parceria.pdf', type: 'PDF', modified: '3 dias atrás', icon: fPdf, color: '#C0392B' },
  { name: 'Fotos do ensaio de produto', type: 'Imagem', modified: '4 dias atrás', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-ensaio') },
  { name: 'Export de assets: marca.zip', type: 'Arquivo', modified: '4 dias atrás', icon: fZip, color: '#8A8A82' },
  { name: 'Narração do onboarding', type: 'Áudio', modified: '5 dias atrás', icon: fWave, color: '#C98A2D' },
  { name: 'Relatório de métricas: setembro', type: 'Planilha', modified: '5 dias atrás', icon: fExcel, color: '#1F7A4D' },
  { name: 'Apresentação para investidores', type: 'Slides', modified: '1 semana atrás', icon: fPpt, color: '#C15A2B' },
]

/* ícone do arquivo na lista: miniatura, pasta ou ícone do tipo */
function FileIcon({ file }: { file: FileRow }) {
  if (file.thumb) {
    return (
      <span className="file-icon is-thumb">
        <img src={file.thumb} alt="" loading="lazy" />
      </span>
    )
  }
  return (
    <span className="file-icon" style={{ background: `color-mix(in srgb, ${file.color} 14%, var(--card-surface))` }}>
      {file.folder ? <Folder size={17} strokeWidth={1.7} color="var(--text-soft)" /> : <img src={file.icon} alt="" />}
    </span>
  )
}

export default function LibraryPage({ empty = false }: { empty?: boolean }) {
  const [filter, setFilter] = useState('Todos')
  /* visualização dos arquivos: lista (padrão) ou grade */
  const [view, setView] = useState<'list' | 'grid'>('list')
  /* "+ Novo": upload de arquivos ou nova pasta */
  const [newOpen, setNewOpen] = useState(false)
  const [added, setAdded] = useState<FileRow[]>([])
  const newRef = useRef<HTMLSpanElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const files = [...added, ...FILES]

  useEffect(() => {
    if (!newOpen) return
    const onDown = (e: PointerEvent) => {
      if (!newRef.current?.contains(e.target as Node)) setNewOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNewOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [newOpen])

  const newFolder = () => {
    setNewOpen(false)
    const n = added.filter((f) => f.folder).length
    setAdded((list) => [
      {
        uid: `folder-${Date.now()}`,
        name: n ? `Nova pasta ${n + 1}` : 'Nova pasta',
        type: 'Pasta',
        modified: 'agora',
        icon: '',
        color: '#8A8A82',
        folder: true,
      },
      ...list,
    ])
  }
  /* base de conhecimento aberta (nível de navegação dentro da Biblioteca) */
  const [openBase, setOpenBase] = useState<string | null>(null)

  const base = openBase ? KNOWLEDGE_BASES.find((b) => b.id === openBase) : null
  if (base) {
    return <KnowledgeBaseDetail base={base} onBack={() => setOpenBase(null)} />
  }

  return (
    <main className={`library-page${empty ? ' empty-page' : ''}`}>
      <div className="lib-container">
        <h1 className="lib-title">Biblioteca</h1>

        {/* Bases de conhecimento: sem nenhuma base (protótipo), o card-tutorial
            entra no lugar dos cards, sob o mesmo título; os arquivos continuam
            logo abaixo, porque o usuário pode ter arquivos sem ter criado uma base */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Bases de conhecimento</h2>
              <p>Arquivos agrupados para serem usados como conhecimento</p>
            </div>
            <button className="lib-new" type="button" aria-label="Nova base de conhecimento">
              <img src={plus} alt="" aria-hidden="true" />
              <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                Nova base de conhecimento
              </span>
            </button>
          </div>

          {empty ? (
            <TutorialEmpty
              title="Ensine seu agente com uma base de conhecimento."
              steps={[
                { strong: 'Reúna seus arquivos:', rest: 'PDFs, planilhas, sites e anotações.' },
                { strong: 'Agrupe numa base', rest: 'por tema, cliente ou time.' },
                { strong: 'Use em qualquer conversa', rest: 'citando a base com @, e o agente responde com ela.' },
              ]}
              cta={
                <button type="button" className="lib-new-cta te-tutorial-cta">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Nova base de conhecimento
                </button>
              }
              caption="Como funcionam as bases de conhecimento"
              duration="1:48"
              art={<LibraryArt />}
            />
          ) : (
            <div className="lib-collections">
              {KNOWLEDGE_BASES.map((kb, i) => (
                <div
                  className="coll-card"
                  role="button"
                  tabIndex={0}
                  key={kb.id}
                  style={{ '--i': i } as CSSProperties}
                  onClick={() => setOpenBase(kb.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setOpenBase(kb.id)
                    }
                  }}
                >
                  <span className="coll-card-top" style={{ background: kb.color }}>
                    <span className="coll-card-avatar">
                      <span className="coll-emoji">{kb.emoji}</span>
                    </span>
                  </span>
                  <span className="coll-card-body">
                    <span className="coll-name">{kb.name}</span>
                    <span className="coll-desc">{kb.description}</span>
                    <span className="coll-date">{kb.createdAt}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
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
              <button className="lib-new is-ghost" type="button" aria-label="Buscar">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="8.2" cy="8.2" r="5" stroke="#3D3D3D" strokeWidth="1.2" />
                  <path d="M12 12l3.4 3.4" stroke="#3D3D3D" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                  Buscar
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
              {/* "+ Novo" (secundário): upload de arquivos ou nova pasta */}
              <span className="lib-new-wrap" ref={newRef}>
                <button
                  type="button"
                  className="lib-new-sec"
                  aria-haspopup="menu"
                  aria-expanded={newOpen}
                  onClick={() => setNewOpen((o) => !o)}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Novo
                  <ChevronDown className="lib-new-caret" size={15} strokeWidth={2.2} aria-hidden="true" />
                </button>
                {newOpen && (
                  <div className="task-menu lib-new-menu" role="menu">
                    <button
                      type="button"
                      className="task-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setNewOpen(false)
                        fileInputRef.current?.click()
                      }}
                    >
                      <Upload size={15} strokeWidth={1.9} />
                      Upload de arquivos
                    </button>
                    <button type="button" className="task-menu-item" role="menuitem" onClick={newFolder}>
                      <FolderPlus size={15} strokeWidth={1.9} />
                      Pasta
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? [])
                    if (list.length) setAdded((a) => [...list.map(rowFromFile), ...a])
                    e.target.value = ''
                  }}
                />
              </span>
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

          {view === 'list' ? (
            <div className="lib-files" key="list">
              <div className="lib-files-head">
                <span className="col-name">Nome</span>
                <span className="col-type">Tipo</span>
                <span className="col-mod">Modificado</span>
                <span className="col-act" />
              </div>
              {files.map((file) => (
                <div className="file-row" key={file.uid ?? file.name}>
                  <FileIcon file={file} />
                  <span className="col-name file-name">{file.name}</span>
                  <span className="col-type file-type">{file.type}</span>
                  <span className="col-mod file-mod">{file.modified}</span>
                  <button className="col-act file-act" type="button" aria-label="Ações">
                    <img src={icDotsActions} alt="" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="lib-files-grid" key="grid">
              {files.map((file, i) => (
                <div className="file-card" key={file.uid ?? file.name} style={{ '--i': i } as CSSProperties}>
                  <div
                    className="file-card-prev"
                    style={
                      file.thumb
                        ? undefined
                        : { background: `color-mix(in srgb, ${file.color} 10%, var(--card-surface))` }
                    }
                  >
                    {file.thumb ? (
                      <img className="file-card-img" src={file.thumb} alt="" loading="lazy" />
                    ) : file.folder ? (
                      <Folder className="file-card-folder" size={40} strokeWidth={1.4} />
                    ) : (
                      <img className="file-card-ic" src={file.icon} alt="" />
                    )}
                  </div>
                  <div className="file-card-body">
                    <span className="file-card-text">
                      <span className="file-card-name">{file.name}</span>
                      <span className="file-card-meta">
                        {file.type} · {file.modified}
                      </span>
                    </span>
                    <button className="file-act" type="button" aria-label="Ações">
                      <img src={icDotsActions} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
