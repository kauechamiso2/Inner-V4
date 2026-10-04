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
  /* ativa uma feature (vira pill ao lado de Ferramentas) — "a partir de Tarefa" */
  feature?: boolean
  /* placeholder que o input assume enquanto a feature está ativa */
  placeholder?: string
  /* só funciona no modo Agente: em Chat, mostra badge e troca de modo ao clicar */
  agentOnly?: boolean
}

type Section = { label: string; items: MentionItem[] }

const SECTIONS: Section[] = [
  {
    label: 'Adicionar',
    items: [
      { id: 'upload', label: 'Fotos e arquivos', icon: <UploadSimpleIcon /> },
      { id: 'biblioteca', label: 'Arquivos da Biblioteca', icon: <BooksIcon /> },
      {
        id: 'tarefa',
        label: 'Tarefa',
        icon: <LightningIcon />,
        feature: true,
        placeholder: 'Descreva a tarefa que você quer adicionar',
      },
      {
        id: 'web-search',
        label: 'Pesquisa na web',
        icon: <GlobeIcon />,
        feature: true,
        placeholder: 'O que você quer pesquisar na web?',
      },
    ],
  },
  {
    label: 'Gerar',
    items: [
      {
        id: 'imagem',
        label: 'Imagem',
        icon: <ImageIcon />,
        feature: true,
        placeholder: 'Descreva a imagem que você quer criar...',
      },
      {
        id: 'video',
        label: 'Vídeo',
        icon: <VideoCameraIcon />,
        feature: true,
        placeholder: 'Descreva o vídeo que você quer criar...',
      },
      {
        id: 'reuniao',
        label: 'Reunião',
        icon: <PresentationChartIcon />,
        feature: true,
        placeholder: 'Sobre o que será a reunião?',
      },
      {
        id: 'audio',
        label: 'Áudio',
        icon: <SpeakerHighIcon />,
        feature: true,
        placeholder: 'Descreva o áudio que você quer gerar...',
      },
      {
        id: 'documento',
        label: 'Documento',
        icon: <FileTextIcon />,
        feature: true,
        placeholder: 'Sobre o que será o documento?',
      },
      {
        id: 'apresentacao',
        label: 'Apresentação',
        icon: <SlidesIcon />,
        feature: true,
        placeholder: 'Sobre o que será a apresentação?',
      },
      {
        id: 'site',
        label: 'Site',
        icon: <GlobeIcon />,
        feature: true,
        placeholder: 'Descreva o site que você quer criar...',
      },
    ],
  },
  {
    label: 'Integrações',
    items: [
      {
        id: 'gmail',
        label: 'Gmail',
        img: gmail,
        feature: true,
        placeholder: 'O que você quer fazer no Gmail?',
      },
      {
        id: 'google-calendar',
        label: 'Google Calendar',
        img: googleCalendar,
        feature: true,
        placeholder: 'O que você quer fazer no Google Calendar?',
      },
      {
        id: 'google-drive',
        label: 'Google Drive',
        img: googleDrive,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer buscar no Google Drive?',
      },
      {
        id: 'google-sheets',
        label: 'Google Sheets',
        img: googleSheets,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer fazer no Google Sheets?',
      },
      {
        id: 'google-slides',
        label: 'Google Slides',
        img: googleSlides,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer fazer no Google Slides?',
      },
      {
        id: 'outlook',
        label: 'Outlook',
        img: outlook,
        feature: true,
        placeholder: 'O que você quer fazer no Outlook?',
      },
      {
        id: 'hubspot',
        label: 'Hubspot',
        img: hubspot,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer fazer no Hubspot?',
      },
      {
        id: 'salesforce',
        label: 'Salesforce',
        img: salesforce,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer fazer no Salesforce?',
      },
      {
        id: 'github',
        label: 'Github',
        img: github,
        mono: true,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer fazer no Github?',
      },
      {
        id: 'notion',
        label: 'Notion',
        img: notion,
        mono: true,
        feature: true,
        agentOnly: true,
        placeholder: 'O que você quer fazer no Notion?',
      },
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
  /* 'mention' abre abaixo do editor (gatilho @); 'plus' abre acima do botão + */
  variant?: 'mention' | 'plus'
  /* modo atual do input — em 'chat', itens agentOnly ganham badge "Agent" */
  mode?: 'agente' | 'chat'
}

export default function MentionMenu({
  query,
  onSelect,
  onClose,
  variant = 'mention',
  mode = 'agente',
}: Props) {
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

  // variante "plus": fecha ao clicar fora (o @ já fecha no blur do textarea)
  useEffect(() => {
    if (variant !== 'plus') return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.mention-menu') && !t.closest('.ch-attach')) onClose()
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [variant, onClose])

  // scroll do item ativo à vista
  useEffect(() => {
    document
      .querySelector('.mention-menu .mm-row.is-active')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <div
      className={`mention-menu${variant === 'plus' ? ' is-plus' : ''}`}
      role="listbox"
      aria-label="Invocar ação"
    >
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
                  {mode === 'chat' && item.agentOnly && <span className="mm-agent">Agent</span>}
                </button>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
