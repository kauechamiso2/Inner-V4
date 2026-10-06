import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import './mention-menu.css'
import { Brain } from 'lucide-react'
import BibliotecaSubmenu from './BibliotecaSubmenu'
import ProjetosSubmenu from './ProjetosSubmenu'
import {
  FileTextIcon,
  FolderSimpleIcon,
  GlobeIcon,
  ImageIcon,
  LightningIcon,
  PresentationChartIcon,
  SlidesIcon,
  SpeakerHighIcon,
  UploadSimpleIcon,
  VideoCameraIcon,
} from './SidebarIcons'
import { FILES, entryAttachment } from './libraryEntries'
import { PROJECTS } from './projects'
import { KNOWLEDGE_BASES } from './knowledgeBases'
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
  /* abre um submenu em cascata (busca + lista) — Arquivos, Coleções ou Projetos */
  submenu?: 'arquivos' | 'colecoes' | 'projetos'
  /* quando selecionado, entra como anexo (acima do input), não como pill */
  attachment?: Attachment
  /* projeto: entra como citação inline (@Nome) no texto do input */
  citation?: string
  /* projeto: ao selecionar, também ativa o contexto do projeto (gradiente,
     saudação e placeholder), como ao escolher um projeto fixado na sidebar */
  project?: { id: string; name: string; emoji?: string; color?: string }
}

export type Attachment = {
  kind: 'image' | 'file' | 'collection'
  name: string
  fileType?: string
  size?: string
  thumb?: string
  color?: string
  img?: string
  /* base de conhecimento: emoji no lugar do ícone de arquivo */
  emoji?: string
}

type Section = { label: string; items: MentionItem[] }

const SECTIONS: Section[] = [
  {
    label: 'Adicionar',
    items: [
      { id: 'upload', label: 'Fotos e arquivos', icon: <UploadSimpleIcon /> },
      { id: 'arquivos', label: 'Arquivos da Biblioteca', icon: <FileTextIcon />, submenu: 'arquivos' },
      {
        id: 'colecoes',
        label: 'Bases de conhecimento',
        icon: <Brain size={18} strokeWidth={1.7} style={{ color: 'var(--text-mid)' }} />,
        submenu: 'colecoes',
      },
      { id: 'projetos', label: 'Projetos', icon: <FolderSimpleIcon />, submenu: 'projetos' },
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
  /* dentro de um projeto, não faz sentido referenciar projetos: esconde o item
     "Projetos" e as coleções da busca */
  excludeProjects?: boolean
}

export default function MentionMenu({
  query,
  onSelect,
  onClose,
  variant = 'mention',
  mode = 'agente',
  excludeProjects = false,
}: Props) {
  const sections = useMemo(() => {
    const source = excludeProjects
      ? SECTIONS.map((s) => ({ ...s, items: s.items.filter((i) => i.submenu !== 'projetos') }))
      : SECTIONS
    const q = normalize(query)
    if (!q) return source
    const base = source
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => normalize(i.label).includes(q)),
      }))
      .filter((s) => s.items.length > 0)

    /* busca por projetos (citação @Nome + contexto do projeto) */
    if (!excludeProjects) {
      const projItems: MentionItem[] = PROJECTS.filter((p) => normalize(p.name).includes(q)).map(
        (p) => ({
          id: p.id,
          label: p.name,
          icon: <FolderSimpleIcon />,
          citation: p.name,
          project: { id: p.id, name: p.name, emoji: p.emoji, color: p.color },
        }),
      )
      if (projItems.length > 0) base.push({ label: 'Projetos', items: projItems })
    }

    /* busca pelas bases de conhecimento */
    const kbItems: MentionItem[] = KNOWLEDGE_BASES.filter((b) =>
      normalize(b.name).includes(q),
    ).map((b) => ({
      id: b.id,
      label: b.name,
      icon: <span className="mm-emoji">{b.emoji}</span>,
      attachment: { kind: 'collection', name: b.name, emoji: b.emoji, color: b.color },
    }))
    if (kbItems.length > 0) base.push({ label: 'Bases de conhecimento', items: kbItems })

    /* busca também pelos arquivos da Biblioteca */
    const libItems: MentionItem[] = FILES.filter((f) => normalize(f.label).includes(q)).map((f) => ({
      id: f.id,
      label: f.label,
      img: f.thumb ?? f.img,
      attachment: entryAttachment(f, false),
    }))
    if (libItems.length > 0) base.push({ label: 'Arquivos', items: libItems })
    return base
  }, [query, excludeProjects])

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])
  const [active, setActive] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const [submenuPos, setSubmenuPos] = useState<{ left: number; top: number } | null>(null)
  const [submenuKind, setSubmenuKind] = useState<'arquivos' | 'colecoes' | 'projetos'>('arquivos')
  const submenuOpen = submenuPos !== null
  const submenuTimer = useRef<number | undefined>(undefined)

  const openSubmenu = (rowEl: HTMLElement, kind: 'arquivos' | 'colecoes' | 'projetos') => {
    window.clearTimeout(submenuTimer.current)
    setSubmenuKind(kind)
    /* ancora no rect do menu; cascata à direita, ou à esquerda se não couber */
    const r = (menuRef.current ?? rowEl).getBoundingClientRect()
    const rowTop = rowEl.getBoundingClientRect().top
    const W = 282
    const left = r.right + 8 + W < window.innerWidth ? r.right + 8 : r.left - 8 - W
    const top = Math.max(12, Math.min(rowTop - 6, window.innerHeight - 380))
    setSubmenuPos({ left, top })
  }
  const scheduleCloseSubmenu = () => {
    window.clearTimeout(submenuTimer.current)
    submenuTimer.current = window.setTimeout(() => setSubmenuPos(null), 160)
  }

  useEffect(() => setActive(0), [query])
  useEffect(() => setSubmenuPos(null), [query])

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

  // fecha ao clicar fora — para ambas as variantes.
  // (antes o @ fechava no blur do textarea, o que o derrubava ao passar o
  //  mouse sobre o menu; agora só fecha em clique externo, nunca no hover)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      const inside =
        t.closest('.mention-menu') ||
        t.closest('.mm-sub-panel') ||
        (variant === 'plus' ? t.closest('.ch-attach') : t.closest('.chat-input-editor'))
      if (!inside) onClose()
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
      ref={menuRef}
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
              if (item.submenu) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={idx === active}
                    aria-haspopup="menu"
                    aria-expanded={submenuOpen && submenuKind === item.submenu}
                    className={`mm-row${idx === active ? ' is-active' : ''}${submenuOpen && submenuKind === item.submenu ? ' is-sub-open' : ''}`}
                    onMouseEnter={(e) => {
                      setActive(idx)
                      openSubmenu(e.currentTarget, item.submenu!)
                    }}
                    onMouseLeave={scheduleCloseSubmenu}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      openSubmenu(e.currentTarget, item.submenu!)
                    }}
                  >
                    <span className="mm-icon">{item.icon}</span>
                    <span className="mm-label">{item.label}</span>
                    <span className="mm-chevron" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M4.5 2.5L8 6l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                )
              }
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

      {submenuPos &&
        createPortal(
          <div
            className="mm-sub-panel"
            style={{ left: submenuPos.left, top: submenuPos.top }}
            onMouseEnter={() => window.clearTimeout(submenuTimer.current)}
            onMouseLeave={scheduleCloseSubmenu}
          >
            {submenuKind === 'projetos' ? (
              <ProjetosSubmenu onSelect={onSelect} />
            ) : (
              <BibliotecaSubmenu kind={submenuKind} onSelect={onSelect} />
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
