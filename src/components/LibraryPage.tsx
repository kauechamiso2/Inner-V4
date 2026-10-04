import { useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import search from '../assets/library/search.svg'
import plus from '../assets/library/plus.svg'
import icClock from '../assets/library/clock.svg'
import icFolder from '../assets/library/folder.svg'
import icSun from '../assets/library/sun.svg'
import icCalendar from '../assets/library/calendar-dots.svg'
import icAirplane from '../assets/library/airplane.svg'
import icEnvelope from '../assets/library/envelope.svg'
import icLightning from '../assets/library/lightning-c.svg'
import icScales from '../assets/library/scales.svg'
import icGlobe from '../assets/library/globe.svg'
import icImage from '../assets/library/image-c.svg'
import icDots from '../assets/library/dots-three.svg'
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

type TileStyle = 'solid' | 'tint' | 'neutral'
type Collection = { name: string; count: string; icon: string; color: string; style: TileStyle }

const COLLECTIONS: Collection[] = [
  { name: 'Recentes', count: '0 arquivos', icon: icClock, color: '#3E63C4', style: 'tint' },
  { name: 'Não categorizado', count: '16 itens', icon: icFolder, color: '', style: 'neutral' },
  { name: 'Setup do site', count: '3 itens', icon: icFolder, color: '', style: 'neutral' },
  { name: 'Morning Briefing', count: '28 arquivos', icon: icSun, color: '#F6C544', style: 'solid' },
  { name: 'Weekly Briefing', count: '14 arquivos', icon: icCalendar, color: '#F0B429', style: 'solid' },
  { name: 'Viagem Europa', count: '12 arquivos', icon: icAirplane, color: '#1F5C44', style: 'solid' },
  { name: 'Morning Email', count: '5 arquivos', icon: icEnvelope, color: '#5B3FA0', style: 'solid' },
  { name: 'Conteúdo LinkedIn', count: '22 arquivos', icon: icLightning, color: '#C15A2B', style: 'solid' },
  { name: 'Jurisprudência', count: '9 arquivos', icon: icScales, color: '#2D6A6E', style: 'solid' },
  { name: 'Pesquisa de site', count: '7 arquivos', icon: icGlobe, color: '#2563B8', style: 'solid' },
  { name: 'Materiais da marca', count: '18 arquivos', icon: icImage, color: '#B0472F', style: 'solid' },
  { name: 'Ver 3 mais', count: '34 no total', icon: icDots, color: '', style: 'neutral' },
]

const FILE_FILTERS = ['Todos', 'Texto e PDF', 'Slides', 'Planilhas', 'Imagens', 'Vídeos', 'Áudio', 'Outros']

type FileRow = { name: string; type: string; modified: string; icon: string; color: string }

const FILES: FileRow[] = [
  { name: 'Guia de marca Inner 2026', type: 'PDF', modified: 'há 2 horas', icon: fPdf, color: '#C0392B' },
  { name: 'Hero 3D do site novo', type: 'Imagem', modified: 'há 3 horas', icon: fImage, color: '#7C4DC0' },
  { name: 'Roteiro — vídeo institucional', type: 'Documento', modified: 'há 5 horas', icon: fText, color: '#3E63C4' },
  { name: 'Deck de vendas Q4', type: 'Slides', modified: 'ontem', icon: fPpt, color: '#C15A2B' },
  { name: 'Planilha de criativos — outubro', type: 'Planilha', modified: 'ontem', icon: fExcel, color: '#1F7A4D' },
  { name: 'Banner da Black Friday', type: 'Imagem', modified: 'ontem', icon: fImage, color: '#7C4DC0' },
  { name: 'Teaser do lançamento V4.mp4', type: 'Vídeo', modified: '2 dias atrás', icon: fVideo, color: '#4C52C4' },
  { name: 'Jingle da campanha de verão', type: 'Áudio', modified: '2 dias atrás', icon: fWave, color: '#C98A2D' },
  { name: 'Pesquisa de concorrentes', type: 'Website', modified: '3 dias atrás', icon: fGlobe, color: '#2563B8' },
  { name: 'Contrato de parceria.pdf', type: 'PDF', modified: '3 dias atrás', icon: fPdf, color: '#C0392B' },
  { name: 'Fotos do ensaio de produto', type: 'Imagem', modified: '4 dias atrás', icon: fImage, color: '#7C4DC0' },
  { name: 'Export de assets — marca.zip', type: 'Arquivo', modified: '4 dias atrás', icon: fZip, color: '#8A8A82' },
  { name: 'Narração do onboarding', type: 'Áudio', modified: '5 dias atrás', icon: fWave, color: '#C98A2D' },
  { name: 'Relatório de métricas — setembro', type: 'Planilha', modified: '5 dias atrás', icon: fExcel, color: '#1F7A4D' },
  { name: 'Apresentação para investidores', type: 'Slides', modified: '1 semana atrás', icon: fPpt, color: '#C15A2B' },
]

function tileStyle(color: string, style: TileStyle): CSSProperties {
  if (style === 'solid') return { background: color }
  if (style === 'tint') return { background: `color-mix(in srgb, ${color} 14%, var(--card-surface))` }
  return { background: 'var(--lib-tile-neutral)' }
}

export default function LibraryPage() {
  const [filter, setFilter] = useState('Todos')

  return (
    <main className="library-page">
      <div className="lib-container">
        <h1 className="lib-title">Biblioteca</h1>

        <div className="lib-search">
          <img src={search} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar em toda a Biblioteca" spellCheck={false} />
        </div>

        {/* Coleções */}
        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Coleções</h2>
              <p>Conteúdo agrupado por tema para usar como conhecimento</p>
            </div>
            <button className="lib-new" type="button" aria-label="Nova coleção">
              <img src={plus} alt="" aria-hidden="true" />
              <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                Nova coleção
              </span>
            </button>
          </div>

          <div className="lib-collections">
            {COLLECTIONS.map((c, i) => (
              <button className="coll-card" type="button" key={c.name} style={{ '--i': i } as CSSProperties}>
                <span className={`coll-icon${c.style === 'solid' ? ' is-solid' : ''}`} style={tileStyle(c.color, c.style)}>
                  <img src={c.icon} alt="" />
                </span>
                <span className="coll-text">
                  <span className="coll-name">{c.name}</span>
                  <span className="coll-count">{c.count}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Arquivos */}
        <section className="lib-section">
          <h2 className="lib-files-title">Arquivos</h2>

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
                <span
                  className="file-icon"
                  style={{ background: `color-mix(in srgb, ${file.color} 14%, var(--card-surface))` }}
                >
                  <img src={file.icon} alt="" />
                </span>
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
