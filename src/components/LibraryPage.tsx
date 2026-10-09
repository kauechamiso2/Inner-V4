import { useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import KnowledgeBaseDetail from './KnowledgeBaseDetail'
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

type FileRow = { name: string; type: string; modified: string; icon: string; color: string; thumb?: string }

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

export default function LibraryPage() {
  const [filter, setFilter] = useState('Todos')
  /* base de conhecimento aberta (nível de navegação dentro da Biblioteca) */
  const [openBase, setOpenBase] = useState<string | null>(null)

  const base = openBase ? KNOWLEDGE_BASES.find((b) => b.id === openBase) : null
  if (base) {
    return <KnowledgeBaseDetail base={base} onBack={() => setOpenBase(null)} />
  }

  return (
    <main className="library-page">
      <div className="lib-container">
        <h1 className="lib-title">Biblioteca</h1>

        {/* Bases de conhecimento */}
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
