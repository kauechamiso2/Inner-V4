import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import './mention-menu.css'
import { Brain, LayoutGrid, Plug } from 'lucide-react'
import BibliotecaSubmenu from './BibliotecaSubmenu'
import ProjetosSubmenu from './ProjetosSubmenu'
import FeatureSubmenu from './FeatureSubmenu'
import {
  FileTextIcon,
  FolderSimpleIcon,
  GlobeIcon,
  ImageIcon,
  LightningIcon,
  PresentationChartIcon,
  PromptsPillarIcon,
  SlidesIcon,
  SpeakerHighIcon,
  UploadSimpleIcon,
  VideoCameraIcon,
} from './SidebarIcons'
import { PROMPTS } from './PromptsPage'
import { FILES, entryAttachment } from './libraryEntries'
import type { Project } from './projects'
import { fileAttachment } from './ContextFileList'
import type { DetailFile } from './ContextFileList'
import ProjectFilesSubmenu from './ProjectFilesSubmenu'
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
  /* abre um submenu em cascata (busca + lista) */
  submenu?: 'arquivos' | 'colecoes' | 'projetos' | 'integracoes' | 'prompts' | 'ferramentas'
  /* quando selecionado, entra como anexo (acima do input), não como pill */
  attachment?: Attachment
  /* projeto: entra como citação inline (@Nome) no texto do input */
  citation?: string
  /* projeto: ao selecionar, também ativa o contexto do projeto (gradiente,
     saudação e placeholder), como ao escolher um projeto fixado na sidebar */
  project?: { id: string; name: string; emoji?: string; color?: string }
  /* sub-rótulo (ex.: projeto ao qual um arquivo do contexto pertence) */
  sub?: string
  /* projeto cujos arquivos abrem em cascata ao passar o mouse na linha */
  projectFiles?: Project
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

/* Integrações (cascata) — apps externos */
const INTEGRATIONS: MentionItem[] = [
  { id: 'gmail', label: 'Gmail', img: gmail, feature: true, placeholder: 'O que você quer fazer no Gmail?' },
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
  { id: 'outlook', label: 'Outlook', img: outlook, feature: true, placeholder: 'O que você quer fazer no Outlook?' },
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
]

/* Ferramentas (cascata) — busca, tarefa agendada e os pilares de geração */
const TOOLS: MentionItem[] = [
  {
    id: 'web-search',
    label: 'Busca na Web',
    icon: <GlobeIcon />,
    feature: true,
    placeholder: 'O que você quer pesquisar na web?',
  },
  {
    id: 'tarefa',
    label: 'Tarefa agendada',
    icon: <LightningIcon />,
    feature: true,
    placeholder: 'Descreva a tarefa que você quer adicionar',
  },
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
    id: 'audio',
    label: 'Áudio',
    icon: <SpeakerHighIcon />,
    feature: true,
    placeholder: 'Descreva o áudio que você quer gerar...',
  },
  {
    id: 'reuniao',
    label: 'Reunião',
    icon: <PresentationChartIcon />,
    feature: true,
    placeholder: 'Sobre o que será a reunião?',
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
]

/* Prompts (cascata) — sem ação por enquanto */
const PROMPT_ITEMS: MentionItem[] = PROMPTS.map((p) => ({
  id: `prompt-${p.id}`,
  label: p.name,
  icon: <PromptsPillarIcon size={18} />,
}))

/* lookup para renderizar o submenu certo por tipo */
const FEATURE_LISTS: Record<
  'integracoes' | 'prompts' | 'ferramentas',
  { items: MentionItem[]; placeholder: string; label: string; noAction?: boolean }
> = {
  integracoes: { items: INTEGRATIONS, placeholder: 'Buscar integração', label: 'Integrações' },
  ferramentas: { items: TOOLS, placeholder: 'Buscar ferramenta', label: 'Ferramentas' },
  prompts: { items: PROMPT_ITEMS, placeholder: 'Buscar prompt', label: 'Prompts', noAction: true },
}

/* Menu principal: upload + biblioteca/base (grupo 1); integrações, prompts e
   ferramentas (grupo 2, separado por divisória). */
const SECTIONS: Section[] = [
  {
    label: '',
    items: [
      { id: 'upload', label: 'Upload do dispositivo', icon: <UploadSimpleIcon /> },
      { id: 'minha-biblioteca', label: 'Minha biblioteca', icon: <FileTextIcon />, submenu: 'arquivos' },
      {
        id: 'base-conhecimento',
        label: 'Base de conhecimento',
        icon: <Brain size={18} strokeWidth={1.7} style={{ color: 'var(--text-mid)' }} />,
        submenu: 'colecoes',
      },
    ],
  },
  {
    label: '',
    items: [
      {
        id: 'integracoes',
        label: 'Integrações',
        icon: <Plug size={18} strokeWidth={1.7} style={{ color: 'var(--text-mid)' }} />,
        submenu: 'integracoes',
      },
      { id: 'prompts', label: 'Prompts', icon: <PromptsPillarIcon size={18} />, submenu: 'prompts' },
      {
        id: 'ferramentas',
        label: 'Ferramentas',
        icon: <LayoutGrid size={17} strokeWidth={1.7} style={{ color: 'var(--text-mid)' }} />,
        submenu: 'ferramentas',
      },
    ],
  },
]

/* todos os rótulos — usados pelo highlight do @ no input */
export const MENTION_LABELS = [
  ...SECTIONS.flatMap((s) => s.items.map((i) => i.label)),
  ...INTEGRATIONS.map((i) => i.label),
  ...TOOLS.map((i) => i.label),
]

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
    const q = normalize(query)
    if (!q) return SECTIONS
    const base: Section[] = []

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

    /* arquivos e seções dentro das bases de conhecimento (anexo + referência) */
    const kbFileMention = (b: (typeof KNOWLEDGE_BASES)[number], f: DetailFile): MentionItem => {
      const att = fileAttachment(f)
      return {
        id: `kb-${b.id}-${f.id}`,
        label: f.name,
        sub: b.name,
        ...(att.emoji
          ? { icon: <span className="mm-emoji">{att.emoji}</span> }
          : { img: att.thumb ?? att.img }),
        attachment: att,
      }
    }
    const kbCtxItems: MentionItem[] = []
    for (const b of KNOWLEDGE_BASES) {
      for (const sec of b.sections) {
        if (normalize(sec.title).includes(q)) {
          kbCtxItems.push({
            id: `kb-${b.id}-sec-${sec.id}`,
            label: sec.title,
            sub: b.name,
            icon: <FolderSimpleIcon />,
            attachment: { kind: 'collection', name: sec.title, color: sec.color },
          })
        }
        for (const f of sec.files) {
          if (normalize(f.name).includes(q)) kbCtxItems.push(kbFileMention(b, f))
        }
      }
      for (const f of b.loose) {
        if (normalize(f.name).includes(q)) kbCtxItems.push(kbFileMention(b, f))
      }
    }
    if (kbCtxItems.length > 0) base.push({ label: 'Em bases de conhecimento', items: kbCtxItems })

    /* busca também pelos arquivos da Biblioteca */
    const libItems: MentionItem[] = FILES.filter((f) => normalize(f.label).includes(q)).map((f) => ({
      id: f.id,
      label: f.label,
      img: f.thumb ?? f.img,
      attachment: entryAttachment(f, false),
    }))
    if (libItems.length > 0) base.push({ label: 'Arquivos', items: libItems })

    /* ações: integrações e ferramentas (busca, tarefa, pilares) */
    const intHits = INTEGRATIONS.filter((i) => normalize(i.label).includes(q))
    if (intHits.length > 0) base.push({ label: 'Integrações', items: intHits })
    const toolHits = TOOLS.filter((i) => normalize(i.label).includes(q))
    if (toolHits.length > 0) base.push({ label: 'Ferramentas', items: toolHits })

    return base
  }, [query, excludeProjects])

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])
  const [active, setActive] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const [submenuPos, setSubmenuPos] = useState<{ left: number; top: number } | null>(null)
  const [submenuKind, setSubmenuKind] = useState<
    'arquivos' | 'colecoes' | 'projetos' | 'projeto-files' | 'integracoes' | 'prompts' | 'ferramentas'
  >('arquivos')
  /* projeto cujo contexto (arquivos) abre em cascata, a partir de um resultado */
  const [submenuProject, setSubmenuProject] = useState<Project | null>(null)
  const submenuOpen = submenuPos !== null
  const submenuTimer = useRef<number | undefined>(undefined)

  const openSubmenu = (
    rowEl: HTMLElement,
    kind: 'arquivos' | 'colecoes' | 'projetos' | 'integracoes' | 'prompts' | 'ferramentas',
  ) => {
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
  /* cascata com os arquivos do contexto de um projeto específico */
  const openProjectFiles = (rowEl: HTMLElement, p: Project) => {
    window.clearTimeout(submenuTimer.current)
    setSubmenuKind('projeto-files')
    setSubmenuProject(p)
    const r = (menuRef.current ?? rowEl).getBoundingClientRect()
    const rowTop = rowEl.getBoundingClientRect().top
    const W = 282
    const left = r.right + 8 + W < window.innerWidth ? r.right + 8 : r.left - 8 - W
    const top = Math.max(12, Math.min(rowTop - 6, window.innerHeight - 380))
    setSubmenuPos({ left, top })
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
        sections.map((section, si) => (
          <div className="mm-section" key={section.label || `g${si}`}>
            {section.label && <div className="mm-header">{section.label}</div>}
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
              if (item.projectFiles) {
                const pf = item.projectFiles
                const open =
                  submenuOpen && submenuKind === 'projeto-files' && submenuProject?.id === pf.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={idx === active}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    className={`mm-row${idx === active ? ' is-active' : ''}${open ? ' is-sub-open' : ''}`}
                    onMouseEnter={(e) => {
                      setActive(idx)
                      openProjectFiles(e.currentTarget, pf)
                    }}
                    onMouseLeave={scheduleCloseSubmenu}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onSelect(item)
                    }}
                  >
                    <span className="mm-icon">{item.icon}</span>
                    <span className="mm-text">
                      <span className="mm-label">{item.label}</span>
                      {item.sub && <span className="mm-sub">{item.sub}</span>}
                    </span>
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
                  <span className="mm-text">
                    <span className="mm-label">{item.label}</span>
                    {item.sub && <span className="mm-sub">{item.sub}</span>}
                  </span>
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
            {submenuKind === 'projeto-files' ? (
              submenuProject ? (
                <ProjectFilesSubmenu project={submenuProject} onSelect={onSelect} />
              ) : null
            ) : submenuKind === 'projetos' ? (
              <ProjetosSubmenu onSelect={onSelect} />
            ) : submenuKind === 'integracoes' ||
              submenuKind === 'prompts' ||
              submenuKind === 'ferramentas' ? (
              <FeatureSubmenu
                items={FEATURE_LISTS[submenuKind].items}
                placeholder={FEATURE_LISTS[submenuKind].placeholder}
                ariaLabel={FEATURE_LISTS[submenuKind].label}
                mode={mode}
                onSelect={onSelect}
                noAction={FEATURE_LISTS[submenuKind].noAction}
              />
            ) : (
              <BibliotecaSubmenu kind={submenuKind} onSelect={onSelect} />
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
