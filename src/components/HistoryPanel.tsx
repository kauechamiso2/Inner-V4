import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ChevronRight, MoreHorizontal, Pin, Search as SearchIcon, SquarePen, X } from 'lucide-react'
import './history.css'
import magnifyingGlass from '../assets/magnifying-glass.svg'
import { allProjectEntries } from './projectStore'
import { PROJECT_CONTENT } from './projectContent'
import AgentOrb from './AgentOrb'
import { MODEL_BY_ID } from './chatModels'
import modelBlue from '../assets/model-blue.svg'
import modelAvatarRing from '../assets/model-avatar-ring.svg'
import modelDark from '../assets/model-dark.png'
import modelSpiral from '../assets/model-spiral.svg'
import avatarBoy from '../assets/avatar-boy.png'
import {
  AgendadoIcon,
  ChatDotsIcon,
  FileTextIcon,
  FolderSimpleIcon,
  PlusIcon,
  PresentationChartIcon,
  SlidesIcon,
  SpeakerHighIcon,
} from './SidebarIcons'
import { PILLAR_COLORS } from './pillars'
import type { GenPillarId, PanelView } from './pillars'
import type { StartedChat } from '../App'
import type { ChosenAgent } from './agents'
import { USER_NAME, greetingFor } from './greeting'


/* ---------- Mock: histórico do Chat ---------- */

type ChatSource = 'agent' | 'blue' | 'avatar' | 'dark' | 'spiral' | 'task' | 'project'
/* 'task' usa o ícone de Tarefas; 'project' usa o emoji do projeto.
   id: só nos chats iniciados nesta sessão (para marcar o selecionado) */
type Chat = {
  title: string
  source: ChatSource
  emoji?: string
  id?: string
  /* chat começado no Chat com modelos: logo do modelo (ou avatar do assistente) */
  model?: string
  asst?: { name: string; avatar?: string }
}

/* edições feitas pelo menu "..." (valem para a sessão): renomear, excluir e
   mover para projeto. Chave do chat: id (chats da sessão) ou o título original */
export type ChatEdit = { title?: string; deleted?: boolean; projectId?: string | null }
export const chatKeyOf = (c: { id?: string; title: string }) => c.id ?? c.title
/* chats dentro de um projeto: "<projeto>:<id do chat>" */
export const projectChatKey = (projectId: string, chatId: string) => `${projectId}:${chatId}`
type ChatGroup = { label: string; chats: Chat[] }

const CHAT_GROUPS: ChatGroup[] = [
  {
    label: 'Hoje',
    chats: [
      { title: 'Direção de arte da campanha', source: 'agent' },
      { title: 'Monitoramento de voo LH441', source: 'task' },
      { title: 'Roteiro do vídeo de onboarding', source: 'agent' },
      { title: 'Copy do e-mail de outubro', source: 'blue' },
      { title: 'Análise do churn de setembro', source: 'agent' },
      { title: 'Ideias de post pro lançamento', source: 'avatar' },
    ],
  },
  {
    label: 'Esta semana',
    chats: [
      { title: 'Ajustes no pitch do Squad', source: 'dark' },
      { title: 'Monitoramento de e-mails importantes', source: 'task' },
      { title: 'Resumo da call com investidores', source: 'agent' },
      { title: 'Plano de conteúdo de novembro', source: 'agent' },
      { title: 'Relatório de vendas Q4', source: 'task' },
      { title: 'Tradução do contrato pra inglês', source: 'spiral' },
      { title: 'Benchmark de concorrentes', source: 'agent' },
      { title: 'Nomes pro novo produto', source: 'blue' },
      { title: 'Estrutura do deck comercial', source: 'agent' },
    ],
  },
  {
    label: 'Este mês',
    chats: [
      { title: 'Checklist de QA do app', source: 'agent' },
      { title: 'Post de aniversário da empresa', source: 'spiral' },
      { title: 'Monitoramento de preços', source: 'task' },
      { title: 'Brainstorm de features do V4', source: 'agent' },
      { title: 'Relatório mensal pro board', source: 'dark' },
      { title: 'FAQ da central de ajuda', source: 'agent' },
      { title: 'Descrição da vaga de designer', source: 'avatar' },
    ],
  },
]

/* ---------- Mock: gerações por pilar ---------- */

type Gen = { title: string; thumb?: string }

const photo = (seed: string) => `https://picsum.photos/seed/${seed}/80/80`
type GenGroup = { label: string; items: Gen[] }

const PILLAR_GROUPS: Record<GenPillarId, GenGroup[]> = {
  imagens: [
    {
      label: 'Hoje',
      items: [
        { title: 'Hero 3D do site novo', thumb: photo('hero3d') },
        { title: 'Mockup do app na mão', thumb: photo('mockup-app') },
        { title: 'Fundo gradiente pro deck', thumb: photo('deck-bg') },
      ],
    },
    {
      label: 'Esta semana',
      items: [
        { title: 'Avatar da campanha de outubro', thumb: photo('avatar-camp') },
        { title: 'Banner da Black Friday', thumb: photo('black-friday') },
        { title: 'Textura de mármore clean', thumb: photo('marble') },
        { title: 'Ilustração do empty state', thumb: photo('empty-state') },
      ],
    },
  ],
  videos: [
    {
      label: 'Hoje',
      items: [
        { title: 'Teaser do lançamento V4', thumb: photo('teaser-v4') },
        { title: 'Demo do produto em 15s', thumb: photo('demo-15s') },
      ],
    },
    {
      label: 'Esta semana',
      items: [
        { title: 'Reels de depoimento — Acme', thumb: photo('reels-acme') },
        { title: 'Intro animada do canal', thumb: photo('intro-canal') },
        { title: 'Vinheta do podcast', thumb: photo('vinheta') },
        { title: 'Corte pra TikTok — bastidores', thumb: photo('tiktok-cut') },
      ],
    },
  ],
  audio: [
    {
      label: 'Hoje',
      items: [{ title: 'Narração do onboarding' }, { title: 'Jingle da campanha (v2)' }],
    },
    {
      label: 'Esta semana',
      items: [
        { title: 'Voz do IVR de suporte' },
        { title: 'Podcast ep. 12 — cortes' },
        { title: 'Trilha do vídeo institucional' },
        { title: 'Spot de rádio 30s' },
      ],
    },
  ],
  reunioes: [
    {
      label: 'Hoje',
      items: [{ title: 'Weekly de produto' }, { title: '1:1 com a Marina' }],
    },
    {
      label: 'Esta semana',
      items: [
        { title: 'Call com investidores' },
        { title: 'Kickoff do projeto Atlas' },
        { title: 'Review do Q3 com o board' },
        { title: 'Entrevista — designer sênior' },
      ],
    },
  ],
  documentos: [
    {
      label: 'Hoje',
      items: [{ title: 'Proposta comercial — Acme' }, { title: 'One-pager do V4' }],
    },
    {
      label: 'Esta semana',
      items: [
        { title: 'Contrato de prestação de serviço' },
        { title: 'Política de férias 2027' },
        { title: 'Roteiro de onboarding de CS' },
        { title: 'Ata da reunião de diretoria' },
      ],
    },
  ],
  apresentacoes: [
    {
      label: 'Hoje',
      items: [{ title: 'Pitch pra investidores' }, { title: 'Deck do kickoff' }],
    },
    {
      label: 'Esta semana',
      items: [
        { title: 'Apresentação do Q3' },
        { title: 'Roadmap do produto 2027' },
        { title: 'Treinamento de onboarding' },
        { title: 'Review de design semanal' },
      ],
    },
  ],
}

const PANEL_CONFIG: Record<PanelView, { title: string; newLabel: string }> = {
  chat: { title: 'Home', newLabel: 'Nova tarefa' },
  imagens: { title: 'Gerações', newLabel: 'Nova imagem' },
  videos: { title: 'Vídeos', newLabel: 'Novo vídeo' },
  audio: { title: 'Áudio', newLabel: 'Novo áudio' },
  reunioes: { title: 'Reuniões', newLabel: 'Nova reunião' },
  documentos: { title: 'Documentos', newLabel: 'Novo documento' },
  apresentacoes: { title: 'Apresentações', newLabel: 'Nova apresentação' },
}

const PILLAR_ROW_ICONS: Partial<Record<GenPillarId, (color: string) => ReactNode>> = {
  audio: (c) => <SpeakerHighIcon size={16} color={c} />,
  reunioes: (c) => <PresentationChartIcon size={16} color={c} />,
  documentos: (c) => <FileTextIcon size={16} color={c} />,
  apresentacoes: (c) => <SlidesIcon size={16} color={c} />,
}

/* ---------- Ícones de modelo (chat) ---------- */

function ModelIcon({ source }: { source: Exclude<ChatSource, 'agent' | 'task' | 'project'> }) {
  return (
    <span className="model-icon" aria-hidden="true">
      {source === 'blue' && (
        <span className="model-halo">
          <img src={modelBlue} alt="" />
        </span>
      )}
      {source === 'dark' && (
        <span className="model-halo">
          <img src={modelDark} alt="" />
        </span>
      )}
      {source === 'spiral' && (
        <span className="model-halo">
          <img src={modelSpiral} alt="" />
        </span>
      )}
      {source === 'avatar' && (
        <>
          <span className="model-halo">
            <img src={modelAvatarRing} alt="" />
          </span>
          <span className="model-avatar-cover">
            <img src={avatarBoy} alt="" />
          </span>
        </>
      )}
    </span>
  )
}

/* ícone/emoji à esquerda de cada chat: agente → orb, tarefa → ícone de Tarefas,
   projeto → emoji do projeto, demais → ícone do modelo */
/* agente escolhido no onboarding: os chats com o agente usam a foto dele */
const AgentAvatarCtx = createContext<ChosenAgent | null>(null)

function ChatAvatar({
  source,
  emoji,
  model,
  asst,
}: {
  source: ChatSource
  emoji?: string
  model?: string
  asst?: { name: string; avatar?: string }
}) {
  const agent = useContext(AgentAvatarCtx)
  if (asst?.avatar) return <img className="chat-agent-avatar" src={asst.avatar} alt="" aria-hidden="true" />
  const m = model ? MODEL_BY_ID[model] : null
  if (m)
    return m.logo ? (
      <img className={`chat-model-logo${m.mono ? ' is-mono' : ''}`} src={m.logo} alt="" aria-hidden="true" />
    ) : (
      <span className="chat-model-fusion" aria-hidden="true" />
    )
  if (source === 'agent')
    return agent?.img && !agent.orb ? (
      <img className="chat-agent-avatar" src={agent.img} alt="" aria-hidden="true" />
    ) : (
      <AgentOrb />
    )
  if (source === 'task')
    return (
      <span className="chat-task-icon" aria-hidden="true">
        <AgendadoIcon size={16} />
      </span>
    )
  if (source === 'project')
    return (
      <span className="chat-task-emoji" aria-hidden="true">
        {emoji}
      </span>
    )
  return <ModelIcon source={source} />
}

type PinRef = { kind: 'chat' | 'project'; id: string }

const ALL_CHATS: Chat[] = CHAT_GROUPS.flatMap((g) => g.chats)

/* Projetos fixáveis = os de exemplo + os criados no "Novo projeto" (com as
   edições das Configurações), lidos do projectStore a cada render */
type ProjectEntry = { id: string; name: string; emoji?: string; color?: string }
const findProject = (id: string): ProjectEntry | null => allProjectEntries().find((p) => p.id === id) ?? null

/* "..." de ações da conversa — abre o menu de contexto ancorado no botão */
function MoreButton({ open = false, onOpen }: { open?: boolean; onOpen?: (rect: DOMRect) => void }) {
  return (
    <button
      type="button"
      className={`chat-more${open ? ' is-open' : ''}`}
      aria-label="Mais opções"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onOpen?.(e.currentTarget.getBoundingClientRect())
      }}
    >
      <MoreHorizontal size={15} strokeWidth={2} />
      {!open && (
        <span className="pill-tooltip chat-pin-tip" role="tooltip" aria-hidden="true">
          Mais
        </span>
      )}
    </button>
  )
}

/* título editável na própria linha (Renomear) */
export function RenameInput({ value, onDone }: { value: string; onDone: (title: string | null) => void }) {
  const [v, setV] = useState(value)
  const doneRef = useRef(false)
  const finish = (t: string | null) => {
    if (doneRef.current) return
    doneRef.current = true
    onDone(t)
  }
  return (
    <input
      className="chat-rename"
      value={v}
      autoFocus
      spellCheck={false}
      aria-label="Novo nome do chat"
      onFocus={(e) => e.currentTarget.select()}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(v.trim() || null)
        if (e.key === 'Escape') finish(null)
      }}
      onBlur={() => finish(v.trim() || null)}
    />
  )
}

function PinButton({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`chat-pin${pinned ? ' is-pinned' : ''}`}
      aria-label={pinned ? 'Despinar' : 'Pinar'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
    >
      <Pin size={14} strokeWidth={1.8} fill={pinned ? 'currentColor' : 'none'} />
      <span className="pill-tooltip chat-pin-tip" role="tooltip" aria-hidden="true">
        {pinned ? 'Despinar' : 'Pinar'}
      </span>
    </button>
  )
}

function ChatRow({
  chat,
  pinned,
  onTogglePin,
  hideIcon = false,
  selected = false,
  onOpen,
  onMenu,
  menuOpen = false,
  renaming = false,
  onRenameDone,
}: {
  chat: Chat
  pinned: boolean
  onTogglePin: () => void
  /* Home (agente): o histórico fica mais limpo, só títulos */
  hideIcon?: boolean
  /* conversa aberta agora na Home */
  selected?: boolean
  onOpen?: () => void
  onMenu?: (rect: DOMRect) => void
  menuOpen?: boolean
  renaming?: boolean
  onRenameDone?: (title: string | null) => void
}) {
  const isAgent = chat.source === 'agent'
  return (
    <a
      className={`chat-row${hideIcon && !pinned ? ' no-icon' : ''}${selected ? ' is-selected' : ''}${
        menuOpen ? ' is-menu' : ''
      }${renaming ? ' is-renaming' : ''}`}
      href="#conversa"
      aria-current={selected ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault()
        if (!renaming) onOpen?.()
      }}
    >
      <span className="chat-row-main">
        {pinned ? (
          <span className="chat-lead-icon" aria-hidden="true">
            <ChatDotsIcon size={16} />
          </span>
        ) : (
          !hideIcon && <ChatAvatar source={chat.source} emoji={chat.emoji} model={chat.model} asst={chat.asst} />
        )}
        {renaming ? (
          <RenameInput value={chat.title} onDone={(t) => onRenameDone?.(t)} />
        ) : (
          <span className={`chat-row-title${isAgent ? '' : ' is-model'}`}>{chat.title}</span>
        )}
      </span>
      {isAgent && !pinned && !hideIcon && <span className="chat-chip">Agent</span>}
      {!renaming && (
        <span className="chat-actions">
          <MoreButton open={menuOpen} onOpen={onMenu} />
          <PinButton pinned={pinned} onToggle={onTogglePin} />
        </span>
      )}
    </a>
  )
}

type ProjChild = { key: string; title: string }

function ProjectRow({
  name,
  emoji,
  pinned,
  childChats,
  expanded = false,
  onToggleExpand,
  onTogglePin,
  activeKey = null,
  onOpenChild,
  onChildMenu,
  menuKey = null,
  renamingKey = null,
  onRenameDone,
}: {
  name: string
  emoji?: string
  pinned: boolean
  childChats?: ProjChild[]
  expanded?: boolean
  onToggleExpand?: () => void
  onTogglePin: () => void
  /* chat aberto agora (pode ser um dos chats do projeto) */
  activeKey?: string | null
  onOpenChild?: (c: ProjChild) => void
  onChildMenu?: (c: ProjChild, rect: DOMRect) => void
  menuKey?: string | null
  renamingKey?: string | null
  onRenameDone?: (key: string, title: string | null) => void
}) {
  const hasChildren = !!childChats && childChats.length > 0
  /* listas longas: mostra os 5 primeiros e "Ver todos" */
  const LIMIT = 5
  const [showAll, setShowAll] = useState(false)
  const visible = childChats && !showAll ? childChats.slice(0, LIMIT) : (childChats ?? [])
  const hidden = (childChats?.length ?? 0) - LIMIT
  return (
    <div className="chat-proj">
      {/* clicar no projeto só expande/recolhe a lista dos chats dele */}
      <a
        className="chat-row"
        href="#projeto"
        aria-expanded={expanded}
        onClick={(e) => {
          e.preventDefault()
          onToggleExpand?.()
        }}
      >
        <span className="chat-row-main">
          <span className={`chat-proj-lead${hasChildren ? ' has-caret' : ''}`}>
            {emoji ? (
              <span className="chat-task-emoji proj-lead-icon" aria-hidden="true">
                {emoji}
              </span>
            ) : (
              <span className="proj-row-icon proj-lead-icon" aria-hidden="true">
                <FolderSimpleIcon />
              </span>
            )}
            {hasChildren && (
              <span className={`chat-proj-caret${expanded ? ' is-open' : ''}`} aria-hidden="true">
                <ChevronRight size={14} strokeWidth={2.4} />
              </span>
            )}
          </span>
          <span className="chat-row-title is-model">{name}</span>
        </span>
        <PinButton pinned={pinned} onToggle={onTogglePin} />
      </a>
      {hasChildren && (
        <div className={`chat-proj-childwrap${expanded ? ' is-open' : ''}`}>
          <div className="chat-proj-children">
            {visible.map((c) => (
              <a
                className={`chat-proj-child${c.key === activeKey ? ' is-selected' : ''}${
                  menuKey === c.key ? ' is-menu' : ''
                }`}
                href="#conversa"
                key={c.key}
                tabIndex={expanded ? 0 : -1}
                aria-current={c.key === activeKey ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  if (renamingKey !== c.key) onOpenChild?.(c)
                }}
              >
                {renamingKey === c.key ? (
                  <RenameInput value={c.title} onDone={(t) => onRenameDone?.(c.key, t)} />
                ) : (
                  <span className="chat-proj-child-title">{c.title}</span>
                )}
                {renamingKey !== c.key && (
                  <MoreButton open={menuKey === c.key} onOpen={(r) => onChildMenu?.(c, r)} />
                )}
              </a>
            ))}
            {hidden > 0 && (
              <button
                type="button"
                className="chat-proj-more"
                tabIndex={expanded ? 0 : -1}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? 'Ver menos' : `Ver todos (${childChats.length})`}
                <ChevronRight className={showAll ? 'is-up' : ''} size={13} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PinPicker({
  isPinned,
  togglePin,
  sources,
}: {
  isPinned: (kind: PinRef['kind'], id: string) => boolean
  togglePin: (kind: PinRef['kind'], id: string) => void
  /* chats do modo atual: Home (agente e loops) ou Chat com modelos */
  sources: ChatSource[]
}) {
  const [q, setQ] = useState('')
  const nq = q.trim().toLowerCase()
  const chats = ALL_CHATS.filter((c) => sources.includes(c.source) && c.title.toLowerCase().includes(nq))
  const projects = allProjectEntries().filter((p) => p.name.toLowerCase().includes(nq))

  return (
    <div className="pin-picker">
      <div className="pin-picker-search">
        <SearchIcon size={15} />
        <input
          type="text"
          placeholder="Buscar chats e projetos"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div className="pin-picker-scroll">
        {projects.length > 0 && (
          <div className="pin-picker-section">
            <div className="pin-picker-label">Projetos</div>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="pin-pick-row"
                onClick={() => togglePin('project', p.id)}
              >
                {p.emoji ? (
                  <span className="chat-task-emoji" aria-hidden="true">
                    {p.emoji}
                  </span>
                ) : (
                  <span className="proj-row-icon" aria-hidden="true">
                    <FolderSimpleIcon />
                  </span>
                )}
                <span className="pin-pick-title">{p.name}</span>
                <span className={`chat-pin is-static${isPinned('project', p.id) ? ' is-pinned' : ''}`}>
                  <Pin size={14} strokeWidth={1.8} fill={isPinned('project', p.id) ? 'currentColor' : 'none'} />
                </span>
              </button>
            ))}
          </div>
        )}
        {chats.length > 0 && (
          <div className="pin-picker-section">
            <div className="pin-picker-label">Chats</div>
            {chats.map((c) => {
              return (
                <button
                  key={c.title}
                  type="button"
                  className="pin-pick-row"
                  onClick={() => togglePin('chat', c.title)}
                >
                  <ChatAvatar source={c.source} emoji={c.emoji} model={c.model} asst={c.asst} />
                  <span className="pin-pick-title">{c.title}</span>
                  <span className={`chat-pin is-static${isPinned('chat', c.title) ? ' is-pinned' : ''}`}>
                    <Pin size={14} strokeWidth={1.8} fill={isPinned('chat', c.title) ? 'currentColor' : 'none'} />
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {chats.length === 0 && projects.length === 0 && (
          <div className="pin-picker-empty">Sem resultados</div>
        )}
      </div>
    </div>
  )
}

function GenRow({ view, gen }: { view: GenPillarId; gen: Gen }) {
  const color = PILLAR_COLORS[view]
  return (
    <a className="chat-row" href="#geracao">
      <span className="chat-row-main">
        {gen.thumb ? (
          <span className="gen-thumb" aria-hidden="true">
            <img src={gen.thumb} alt="" loading="lazy" />
            {view === 'videos' && <span className="gen-play" />}
          </span>
        ) : (
          <span className="gen-icon" aria-hidden="true">
            {PILLAR_ROW_ICONS[view]?.(color)}
          </span>
        )}
        <span className="chat-row-title is-model">{gen.title}</span>
      </span>
    </a>
  )
}

/* ---------- Painel ---------- */

type Props = {
  view: PanelView
  hidden?: boolean
  chatMode?: 'agente' | 'chat'
  pins: PinRef[]
  isPinned: (kind: PinRef['kind'], id: string) => boolean
  togglePin: (kind: PinRef['kind'], id: string) => void
  onNewTask?: () => void
  /* chats iniciados nesta sessão (entram no topo de "Hoje") e o que está aberto */
  startedChats?: StartedChat[]
  activeChatId?: string | null
  /* personagem escolhido — tinge o botão e exibe a faixa de boas-vindas na Home */
  agent?: ChosenAgent | null
  /* destaque único de "personalização" ao cair na tela */
  intro?: boolean
  /* edições do menu "..." (título, excluído, projeto) */
  chatEdits?: Record<string, ChatEdit>
  /* projetos fixados: chats deles ficam dentro do projeto em Pinados; os de
     projetos não fixados continuam no Histórico */
  pinnedProjectIds?: string[]
  /* abre a conversa do chat (projectId quando é um chat de projeto) */
  onOpenChat?: (key: string, title: string, projectId?: string | null) => void
  /* abre o menu "..." do chat, ancorado no botão */
  onChatMenu?: (key: string, title: string, rect: DOMRect, projectId?: string | null) => void
  menuKey?: string | null
  /* renomear na própria linha */
  renamingKey?: string | null
  onRenameDone?: (key: string, title: string | null) => void
}

export default function HistoryPanel({
  view,
  hidden = false,
  chatMode = 'agente',
  pins,
  isPinned,
  togglePin,
  onNewTask,
  startedChats = [],
  activeChatId = null,
  agent = null,
  intro = false,
  chatEdits = {},
  pinnedProjectIds = [],
  onOpenChat,
  onChatMenu,
  menuKey = null,
  renamingKey = null,
  onRenameDone,
}: Props) {
  const config = PANEL_CONFIG[view]
  /* chats iniciados nesta sessão entram no topo do grupo "Hoje" */
  const chatGroups = useMemo<ChatGroup[]>(() => {
    const started: Chat[] = startedChats.map((s) => ({ id: s.id, title: s.title, source: s.source, model: s.model, asst: s.asst }))
    const [today, ...rest] = CHAT_GROUPS
    const base = [{ ...today, chats: [...started, ...today.chats] }, ...rest]
    /* aplica renomear/excluir/mover: excluídos e movidos para projeto saem do histórico */
    return base.map((g) => ({
      ...g,
      chats: g.chats
        .filter((c) => {
          const ed = chatEdits[chatKeyOf(c)]
          return !ed?.deleted && !(ed?.projectId && pinnedProjectIds.includes(ed.projectId))
        })
        .map((c) => {
          const ed = chatEdits[chatKeyOf(c)]
          /* renomeado: a chave continua a do título original */
          return ed?.title ? { ...c, id: chatKeyOf(c), title: ed.title } : c
        }),
    }))
  }, [startedChats, chatEdits, pinnedProjectIds])
  /* todos os chats (com edições aplicadas), para achar os fixados e os movidos */
  const allChats = useMemo<Chat[]>(() => {
    const started: Chat[] = startedChats.map((s) => ({ id: s.id, title: s.title, source: s.source, model: s.model, asst: s.asst }))
    return [...started, ...ALL_CHATS]
      .filter((c) => !chatEdits[chatKeyOf(c)]?.deleted)
      .map((c) => {
        const ed = chatEdits[chatKeyOf(c)]
        /* renomeado: a chave continua a do título original */
          return ed?.title ? { ...c, id: chatKeyOf(c), title: ed.title } : c
      })
  }, [startedChats, chatEdits])
  /* chat de projeto fixado pelo "..." (ex.: "col-hr:hr1") vira uma linha de Pinados */
  const projectChatAsChat = (key: string): Chat | undefined => {
    const [pid, cid] = key.split(':')
    if (!cid) return undefined
    const all = [...(PROJECT_CONTENT[pid]?.pinned ?? []), ...(PROJECT_CONTENT[pid]?.recents ?? [])]
    const found = all.find((c) => c.id === cid)
    const ed = chatEdits[key]
    if (!found || ed?.deleted) return undefined
    return { id: key, title: ed?.title ?? found.title, source: 'agent' }
  }
  /* chats de um projeto: os do próprio projeto + os movidos para ele */
  const projectChildren = (projectId: string): ProjChild[] => {
    const own = (PROJECT_CONTENT[projectId]?.recents ?? [])
      .map((c) => {
        const key = projectChatKey(projectId, c.id)
        const ed = chatEdits[key]
        return { key, title: ed?.title ?? c.title, ed }
      })
      .filter((c) => !c.ed?.deleted && (c.ed?.projectId === undefined || c.ed.projectId === projectId))
      .map(({ key, title }) => ({ key, title }))
    const moved = allChats
      .filter((c) => chatEdits[chatKeyOf(c)]?.projectId === projectId)
      .map((c) => ({ key: chatKeyOf(c), title: c.title }))
    return [...moved, ...own]
  }
  /* busca no histórico */
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const norm = (t: string) =>
    t
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const nq = norm(query.trim())
  const isChat = view === 'chat'
  /* pilar de Imagens: histórico de "Gerações" — título + lupa, sem botão "Nova" */
  const isGen = view === 'imagens'
  /* faixa de boas-vindas: só na Home (modo agente) com um agente escolhido
     (inclui o orb/agente padrão, que mostra a esfera no lugar do busto) */
  const showGreeting = isChat && chatMode === 'agente' && !!agent
  const newLabel = isChat ? (chatMode === 'agente' ? 'Nova tarefa' : 'Novo Chat') : config.newLabel
  /* Home (agente) mostra itens do agente; Chat mostra conversas com modelos */
  const title = isChat ? (chatMode === 'agente' ? 'Home' : 'Chat') : config.title
  const modeSources: ChatSource[] =
    chatMode === 'agente' ? ['agent', 'task'] : ['blue', 'avatar', 'dark', 'spiral']

  const [pickerOpen, setPickerOpen] = useState(false)
  /* projetos pinados expandidos (mostram os chats de dentro) */
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const toggleExpanded = (id: string) =>
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const pinnedChatIds = useMemo(
    () => new Set(pins.filter((p) => p.kind === 'chat').map((p) => p.id)),
    [pins],
  )

  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.pin-picker') && !t.closest('.pinados-add')) setPickerOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [pickerOpen])

  return (
    <AgentAvatarCtx.Provider value={agent ?? null}>
    <section
      className={`history-panel${hidden ? ' is-hidden' : ''}`}
      aria-label={`Histórico de ${config.title}`}
      aria-hidden={hidden}
    >
      <div className="history-inner" key={isChat ? `chat-${chatMode}` : view}>
        <header className={`history-header${showGreeting ? ' has-greet' : ''}`}>
          {showGreeting && agent ? (
            <div
              className={`hp-greet${intro ? ' is-intro' : ''}`}
              style={{ '--accent': agent.accent } as CSSProperties}
            >
              <span className={`hp-greet-av${agent.orb ? ' is-orb' : ''}`}>
                {agent.orb ? (
                  <AgentOrb size={26} />
                ) : (
                  <img src={agent.banner ?? agent.img} alt="" draggable={false} />
                )}
              </span>
              <span className="hp-greet-text">
                <span className="hp-greet-name">{agent.name}</span>
                <span className="hp-greet-msg">
                  {greetingFor()}, {USER_NAME}
                </span>
              </span>
            </div>
          ) : isGen ? (
            <div className="history-title-row">
              <h2 className="history-title">{title}</h2>
              <button className="history-search" type="button" aria-label="Buscar nas gerações">
                <img src={magnifyingGlass} alt="" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <h2 className="history-title">{title}</h2>
          )}
        </header>

        <div className="history-content">
          {!isGen && (
            <div className="history-actions">
              <button
                className={`history-new${isChat ? ' is-compose' : ' is-plus'}`}
                type="button"
                onClick={onNewTask}
              >
                {isChat ? <SquarePen /> : <PlusIcon />}
                <span>{newLabel}</span>
              </button>
            </div>
          )}

          {isChat && (
            <div className="pinados">
              <div className="pinados-head">
                <span className="history-label">Pinados</span>
                <button
                  type="button"
                  className={`pinados-add${pickerOpen ? ' is-open' : ''}`}
                  aria-label="Fixar chat ou projeto"
                  aria-expanded={pickerOpen}
                  onClick={() => setPickerOpen((o) => !o)}
                >
                  <PlusIcon />
                </button>
              </div>
              {pins.length > 0 && (
                <div className="history-group-list">
                  {pins.map((p) => {
                    if (p.kind === 'chat') {
                      const c =
                        allChats.find((x) => chatKeyOf(x) === p.id) ?? projectChatAsChat(p.id)
                      return c && modeSources.includes(c.source) ? (
                        <ChatRow
                          key={`pin-${p.id}`}
                          chat={c}
                          pinned
                          hideIcon={chatMode === 'agente'}
                          selected={p.id === activeChatId}
                          onOpen={() => onOpenChat?.(p.id, c.title)}
                          onMenu={(r) => onChatMenu?.(p.id, c.title, r)}
                          menuOpen={menuKey === p.id}
                          renaming={renamingKey === p.id}
                          onRenameDone={(t) => onRenameDone?.(p.id, t)}
                          onTogglePin={() => togglePin('chat', p.id)}
                        />
                      ) : null
                    }
                    const pr = findProject(p.id)
                    if (!pr) return null
                    return (
                      <ProjectRow
                        key={`pin-${p.id}`}
                        name={pr.name}
                        /* pinados: ícone de projeto (pasta) no lugar do emoji escolhido */
                        emoji={undefined}
                        pinned
                        childChats={projectChildren(pr.id)}
                        expanded={expandedProjects.has(pr.id)}
                        onToggleExpand={() => toggleExpanded(pr.id)}
                        activeKey={activeChatId}
                        onOpenChild={(c) => onOpenChat?.(c.key, c.title, pr.id)}
                        onChildMenu={(c, r) => onChatMenu?.(c.key, c.title, r, pr.id)}
                        menuKey={menuKey}
                        renamingKey={renamingKey}
                        onRenameDone={onRenameDone}
                        onTogglePin={() => togglePin('project', p.id)}
                      />
                    )
                  })}
                </div>
              )}
              {pickerOpen && <PinPicker isPinned={isPinned} togglePin={togglePin} sources={modeSources} />}
            </div>
          )}

          {!isGen && (
            <div className={`history-label-row${searchOpen ? ' is-searching' : ''}`}>
              {searchOpen ? (
                <div className="history-searchbox">
                  <SearchIcon size={15} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setQuery('')
                        setSearchOpen(false)
                      }
                    }}
                    placeholder="Buscar no histórico"
                    autoFocus
                    spellCheck={false}
                    aria-label="Buscar no histórico"
                  />
                  <button
                    type="button"
                    className="history-search-clear"
                    aria-label="Fechar busca"
                    onClick={() => {
                      setQuery('')
                      setSearchOpen(false)
                    }}
                  >
                    <X size={14} strokeWidth={2.2} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="history-label">Histórico</span>
                  <button
                    className="history-search"
                    type="button"
                    aria-label="Buscar no histórico"
                    onClick={() => setSearchOpen(true)}
                  >
                    <img src={magnifyingGlass} alt="" aria-hidden="true" />
                    <span className="pill-tooltip history-search-tip" role="tooltip" aria-hidden="true">
                      Buscar
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

          <div className="history-scroll">
            <div className="history-groups">
              {isChat &&
                nq &&
                !chatGroups.some((g) =>
                  g.chats.some(
                    (c) =>
                      !pinnedChatIds.has(chatKeyOf(c)) && modeSources.includes(c.source) && norm(c.title).includes(nq),
                  ),
                ) && <p className="history-search-empty">Nenhum chat encontrado para "{query.trim()}".</p>}
              {isChat
                ? chatGroups.map((group) => {
                    const chats = group.chats.filter(
                      (c) =>
                        !pinnedChatIds.has(chatKeyOf(c)) &&
                        modeSources.includes(c.source) &&
                        (!nq || norm(c.title).includes(nq)),
                    )
                    if (chats.length === 0) return null
                    return (
                      <div className="history-group" key={group.label}>
                        <div className="history-group-label">{group.label}</div>
                        <div className="history-group-list">
                          {chats.map((chat) => (
                            <ChatRow
                              chat={chat}
                              key={chatKeyOf(chat)}
                              pinned={false}
                              hideIcon={chatMode === 'agente'}
                              selected={chatKeyOf(chat) === activeChatId}
                              onOpen={() => onOpenChat?.(chatKeyOf(chat), chat.title)}
                              onMenu={(r) => onChatMenu?.(chatKeyOf(chat), chat.title, r)}
                              menuOpen={menuKey === chatKeyOf(chat)}
                              renaming={renamingKey === chatKeyOf(chat)}
                              onRenameDone={(t) => onRenameDone?.(chatKeyOf(chat), t)}
                              onTogglePin={() => togglePin('chat', chatKeyOf(chat))}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })
                : PILLAR_GROUPS[view].map((group) => (
                    <div className="history-group" key={group.label}>
                      <div className="history-group-label">{group.label}</div>
                      <div className="history-group-list">
                        {group.items.map((gen) => (
                          <GenRow view={view} gen={gen} key={gen.title} />
                        ))}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </AgentAvatarCtx.Provider>
  )
}
