import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import './mention-menu.css'
import {
  BooksIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LightningIcon,
  PresentationChartIcon,
  SlidesIcon,
  SpeakerHighIcon,
  UploadSimpleIcon,
  VideoCameraIcon,
} from './SidebarIcons'
import gmail from '../assets/integrations/gmail.svg'
import googleCalendar from '../assets/integrations/google-calendar.svg'
import googleDrive from '../assets/integrations/google-drive.svg'
import googleSheets from '../assets/integrations/google-sheets.svg'
import googleSlides from '../assets/integrations/google-slides.svg'
import outlook from '../assets/integrations/outlook.svg'
import hubspot from '../assets/integrations/hubspot.svg'
import salesforce from '../assets/integrations/salesforce.svg'
import github from '../assets/integrations/github.svg'
import notion from '../assets/integrations/notion.svg'

export type MentionItem = {
  id: string
  label: string
  icon?: ReactNode
  img?: string
  /* logos monocromáticos (preto) que precisam inverter no dark */
  mono?: boolean
}

type Section = { label: string; items: MentionItem[] }

const SECTIONS: Section[] = [
  {
    label: 'Adicionar',
    items: [
      { id: 'upload', label: 'Fotos e arquivos', icon: <UploadSimpleIcon /> },
      { id: 'biblioteca', label: 'Arquivos da Biblioteca', icon: <BooksIcon /> },
      { id: 'tarefa', label: 'Tarefa', icon: <LightningIcon /> },
    ],
  },
  {
    label: 'Gerar',
    items: [
      { id: 'imagem', label: 'Imagem', icon: <ImageIcon /> },
      { id: 'video', label: 'Vídeo', icon: <VideoCameraIcon /> },
      { id: 'reuniao', label: 'Reunião', icon: <PresentationChartIcon /> },
      { id: 'audio', label: 'Áudio', icon: <SpeakerHighIcon /> },
      { id: 'documento', label: 'Documento', icon: <FileTextIcon /> },
      { id: 'apresentacao', label: 'Apresentação', icon: <SlidesIcon /> },
      { id: 'site', label: 'Site', icon: <GlobeIcon /> },
    ],
  },
  {
    label: 'Integrações',
    items: [
      { id: 'gmail', label: 'Gmail', img: gmail },
      { id: 'google-calendar', label: 'Google Calendar', img: googleCalendar },
      { id: 'google-drive', label: 'Google Drive', img: googleDrive },
      { id: 'google-sheets', label: 'Google Sheets', img: googleSheets },
      { id: 'google-slides', label: 'Google Slides', img: googleSlides },
      { id: 'outlook', label: 'Outlook', img: outlook },
      { id: 'hubspot', label: 'Hubspot', img: hubspot },
      { id: 'salesforce', label: 'Salesforce', img: salesforce },
      { id: 'github', label: 'Github', img: github, mono: true },
      { id: 'notion', label: 'Notion', img: notion, mono: true },
    ],
  },
]

/* todos os rótulos — usados pelo highlight do @ no input */
export const MENTION_LABELS = SECTIONS.flatMap((s) => s.items.map((i) => i.label))

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

type Props = {
  query: string
  onSelect: (item: MentionItem) => void
  onClose: () => void
}

export default function MentionMenu({ query, onSelect, onClose }: Props) {
  const sections = useMemo(() => {
    const q = normalize(query)
    if (!q) return SECTIONS
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) => normalize(i.label).includes(q)),
    })).filter((s) => s.items.length > 0)
  }, [query])

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])
  const [active, setActive] = useState(0)

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => Math.min(a + 1, flat.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => Math.max(a - 1, 0))
      } else if (e.key === 'Enter') {
        if (flat[active]) {
          e.preventDefault()
          onSelect(flat[active])
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [flat, active, onSelect, onClose])

  // scroll do item ativo à vista
  useEffect(() => {
    document
      .querySelector('.mention-menu .mm-row.is-active')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <div className="mention-menu" role="listbox" aria-label="Invocar com @">
      {flat.length === 0 ? (
        <div className="mm-empty">Sem resultados</div>
      ) : (
        sections.map((section) => (
          <div className="mm-section" key={section.label}>
            <div className="mm-header">{section.label}</div>
            {section.items.map((item) => {
              const idx = flat.indexOf(item)
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={idx === active}
                  className={`mm-row${idx === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(idx)}
                  /* mousedown para selecionar antes do blur do textarea */
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onSelect(item)
                  }}
                >
                  <span className={`mm-icon${item.mono ? ' is-mono' : ''}`}>
                    {item.img ? <img src={item.img} alt="" loading="lazy" /> : item.icon}
                  </span>
                  <span className="mm-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
