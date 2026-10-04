import { useMemo, useState } from 'react'
import searchIcon from '../assets/library/search.svg'
import folder from '../assets/library/folder.svg'
import fPdf from '../assets/library/file-pdf.svg'
import fImage from '../assets/library/file-image.svg'
import fText from '../assets/library/file-text.svg'
import fPpt from '../assets/library/ppt.svg'
import fExcel from '../assets/library/excel.svg'
import fVideo from '../assets/library/video.svg'
import fWave from '../assets/library/waveform.svg'
import type { MentionItem } from './MentionMenu'

type Entry = { id: string; label: string; img: string; sub: string; color?: string }

const COLLECTIONS: Entry[] = [
  { id: 'col-morning', label: 'Morning Briefing', img: folder, sub: '28 arquivos' },
  { id: 'col-weekly', label: 'Weekly Briefing', img: folder, sub: '14 arquivos' },
  { id: 'col-europa', label: 'Viagem Europa', img: folder, sub: '12 arquivos' },
  { id: 'col-linkedin', label: 'Conteúdo LinkedIn', img: folder, sub: '22 arquivos' },
  { id: 'col-marca', label: 'Materiais da marca', img: folder, sub: '18 arquivos' },
  { id: 'col-juris', label: 'Jurisprudência', img: folder, sub: '9 arquivos' },
  { id: 'col-site', label: 'Pesquisa de site', img: folder, sub: '7 arquivos' },
]

const FILES: Entry[] = [
  { id: 'f-marca', label: 'Guia de marca Inner 2026', img: fPdf, sub: 'PDF', color: '#C0392B' },
  { id: 'f-hero', label: 'Hero 3D do site novo', img: fImage, sub: 'Imagem', color: '#7C4DC0' },
  { id: 'f-roteiro', label: 'Roteiro — vídeo institucional', img: fText, sub: 'Documento', color: '#3E63C4' },
  { id: 'f-deck', label: 'Deck de vendas Q4', img: fPpt, sub: 'Slides', color: '#C15A2B' },
  { id: 'f-planilha', label: 'Planilha de criativos', img: fExcel, sub: 'Planilha', color: '#1F7A4D' },
  { id: 'f-teaser', label: 'Teaser do lançamento V4', img: fVideo, sub: 'Vídeo', color: '#4C52C4' },
  { id: 'f-jingle', label: 'Jingle da campanha', img: fWave, sub: 'Áudio', color: '#C98A2D' },
]

const COLL_LIMIT = 4
const FILE_LIMIT = 5

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

type Props = { onSelect: (item: MentionItem) => void }

export default function BibliotecaSubmenu({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [showAllColl, setShowAllColl] = useState(false)
  const [showAllFiles, setShowAllFiles] = useState(false)

  const q = normalize(query)
  const colls = useMemo(
    () => (q ? COLLECTIONS.filter((c) => normalize(c.label).includes(q)) : COLLECTIONS),
    [q],
  )
  const files = useMemo(
    () => (q ? FILES.filter((f) => normalize(f.label).includes(q)) : FILES),
    [q],
  )

  const shownColls = showAllColl || q ? colls : colls.slice(0, COLL_LIMIT)
  const shownFiles = showAllFiles || q ? files : files.slice(0, FILE_LIMIT)

  const pick = (e: Entry, collection: boolean) =>
    onSelect({
      id: e.id,
      label: e.label,
      img: collection ? undefined : e.img,
      icon: collection ? <img src={folder} alt="" /> : undefined,
      feature: true,
    })

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
                <span className="bib-icon is-folder">
                  <img src={c.img} alt="" />
                </span>
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
                <span
                  className="bib-icon"
                  style={{ background: `color-mix(in srgb, ${f.color} 14%, var(--pop-surface))` }}
                >
                  <img src={f.img} alt="" />
                </span>
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
