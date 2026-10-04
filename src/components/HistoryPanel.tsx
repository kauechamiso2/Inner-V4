import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Pin, Search as SearchIcon } from 'lucide-react'
import './history.css'
import magnifyingGlass from '../assets/magnifying-glass.svg'
import folder from '../assets/library/folder.svg'
import { PROJECTS } from './projects'
import AgentOrb from './AgentOrb'
import modelBlue from '../assets/model-blue.svg'
import modelAvatarRing from '../assets/model-avatar-ring.svg'
import modelDark from '../assets/model-dark.png'
import modelSpiral from '../assets/model-spiral.svg'
import avatarBoy from '../assets/avatar-boy.png'
import {
  FileTextIcon,
  PlusIcon,
  PresentationChartIcon,
  SlidesIcon,
  SpeakerHighIcon,
} from './SidebarIcons'
import { PILLAR_COLORS } from './pillars'
import type { GenPillarId, PanelView } from './pillars'

/* ---------- Mock: histórico do Chat ---------- */

type ChatSource = 'agent' | 'blue' | 'avatar' | 'dark' | 'spiral' | 'task'
/* chats vindos de Tarefas usam o nome e o emoji (iOS) da tarefa */
type Chat = { title: string; source: ChatSource; taskEmoji?: string }
type ChatGroup = { label: string; chats: Chat[] }

const CHAT_GROUPS: ChatGroup[] = [
  {
    label: 'Hoje',
    chats: [
      { title: 'Direção de arte da campanha', source: 'agent' },
      { title: 'Monitoramento de voo LH441', source: 'task', taskEmoji: '✈️' },
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
      { title: 'Monitoramento de e-mails importantes', source: 'task', taskEmoji: '✉️' },
      { title: 'Resumo da call com investidores', source: 'agent' },
      { title: 'Plano de conteúdo de novembro', source: 'agent' },
      { title: 'Relatório de vendas Q4', source: 'task', taskEmoji: '📊' },
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
      { title: 'Monitoramento de preços', source: 'task', taskEmoji: '🏷️' },
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
  imagens: { title: 'Imagens', newLabel: 'Nova imagem' },
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

function ModelIcon({ source }: { source: Exclude<ChatSource, 'agent' | 'task'> }) {
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

type PinRef = { kind: 'chat' | 'project'; id: string }

const ALL_CHATS: Chat[] = CHAT_GROUPS.flatMap((g) => g.chats)

function PinButton({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`chat-pin${pinned ? ' is-pinned' : ''}`}
      aria-label={pinned ? 'Desafixar' : 'Fixar'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
    >
      <Pin size={14} strokeWidth={1.8} fill={pinned ? 'currentColor' : 'none'} />
    </button>
  )
}

function ChatRow({
  chat,
  pinned,
  onTogglePin,
}: {
  chat: Chat
  pinned: boolean
  onTogglePin: () => void
}) {
  const isAgent = chat.source === 'agent'
  return (
    <a className="chat-row" href="#conversa">
      <span className="chat-row-main">
        {isAgent ? (
          <AgentOrb />
        ) : chat.source === 'task' ? (
          <span className="chat-task-emoji" aria-hidden="true">
            {chat.taskEmoji}
          </span>
        ) : (
          <ModelIcon source={chat.source as Exclude<ChatSource, 'agent' | 'task'>} />
        )}
        <span className={`chat-row-title${isAgent ? '' : ' is-model'}`}>{chat.title}</span>
      </span>
      {isAgent && !pinned && <span className="chat-chip">Agent</span>}
      <PinButton pinned={pinned} onToggle={onTogglePin} />
    </a>
  )
}

function ProjectRow({
  name,
  pinned,
  onTogglePin,
}: {
  name: string
  pinned: boolean
  onTogglePin: () => void
}) {
  return (
    <a className="chat-row" href="#projeto">
      <span className="chat-row-main">
        <span className="proj-row-icon" aria-hidden="true">
          <img src={folder} alt="" />
        </span>
        <span className="chat-row-title is-model">{name}</span>
      </span>
      <PinButton pinned={pinned} onToggle={onTogglePin} />
    </a>
  )
}

function PinPicker({
  isPinned,
  togglePin,
}: {
  isPinned: (kind: PinRef['kind'], id: string) => boolean
  togglePin: (kind: PinRef['kind'], id: string) => void
}) {
  const [q, setQ] = useState('')
  const nq = q.trim().toLowerCase()
  const chats = ALL_CHATS.filter((c) => c.title.toLowerCase().includes(nq))
  const projects = PROJECTS.filter((p) => p.name.toLowerCase().includes(nq))

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
                <span className="proj-row-icon" aria-hidden="true">
                  <img src={folder} alt="" />
                </span>
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
              const isAgent = c.source === 'agent'
              return (
                <button
                  key={c.title}
                  type="button"
                  className="pin-pick-row"
                  onClick={() => togglePin('chat', c.title)}
                >
                  {isAgent ? (
                    <AgentOrb />
                  ) : c.source === 'task' ? (
                    <span className="chat-task-emoji" aria-hidden="true">
                      {c.taskEmoji}
                    </span>
                  ) : (
                    <ModelIcon source={c.source as Exclude<ChatSource, 'agent' | 'task'>} />
                  )}
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

type Props = { view: PanelView; hidden?: boolean; chatMode?: 'agente' | 'chat' }

export default function HistoryPanel({ view, hidden = false, chatMode = 'agente' }: Props) {
  const config = PANEL_CONFIG[view]
  const color = PILLAR_COLORS[view]
  const isChat = view === 'chat'
  const newLabel = isChat ? (chatMode === 'agente' ? 'Nova tarefa' : 'Novo Chat') : config.newLabel

  const [pins, setPins] = useState<PinRef[]>([
    { kind: 'chat', id: 'Análise do churn de setembro' },
    { kind: 'project', id: 'p-rebrand' },
  ])
  const [pickerOpen, setPickerOpen] = useState(false)

  const isPinned = (kind: PinRef['kind'], id: string) =>
    pins.some((p) => p.kind === kind && p.id === id)
  const togglePin = (kind: PinRef['kind'], id: string) =>
    setPins((prev) =>
      prev.some((p) => p.kind === kind && p.id === id)
        ? prev.filter((p) => !(p.kind === kind && p.id === id))
        : [...prev, { kind, id }],
    )
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
    <section
      className={`history-panel${hidden ? ' is-hidden' : ''}`}
      aria-label={`Histórico de ${config.title}`}
      aria-hidden={hidden}
      style={{ '--pillar': color } as CSSProperties}
    >
      <div className="history-inner" key={view}>
        <header className="history-header">
          <h2 className="history-title">{config.title}</h2>
        </header>

        <div className="history-content">
          <div className="history-actions">
            <button className="history-new" type="button">
              <PlusIcon />
              <span>{newLabel}</span>
            </button>
          </div>

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
                      const c = ALL_CHATS.find((x) => x.title === p.id)
                      return c ? (
                        <ChatRow
                          key={`pin-${p.id}`}
                          chat={c}
                          pinned
                          onTogglePin={() => togglePin('chat', p.id)}
                        />
                      ) : null
                    }
                    const pr = PROJECTS.find((x) => x.id === p.id)
                    return pr ? (
                      <ProjectRow
                        key={`pin-${p.id}`}
                        name={pr.name}
                        pinned
                        onTogglePin={() => togglePin('project', p.id)}
                      />
                    ) : null
                  })}
                </div>
              )}
              {pickerOpen && <PinPicker isPinned={isPinned} togglePin={togglePin} />}
            </div>
          )}

          <div className="history-label-row">
            <span className="history-label">Histórico</span>
            <button className="history-search" type="button" aria-label="Buscar no histórico">
              <img src={magnifyingGlass} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="history-scroll">
            <div className="history-groups">
              {isChat
                ? CHAT_GROUPS.map((group) => {
                    const chats = group.chats.filter((c) => !pinnedChatIds.has(c.title))
                    if (chats.length === 0) return null
                    return (
                      <div className="history-group" key={group.label}>
                        <div className="history-group-label">{group.label}</div>
                        <div className="history-group-list">
                          {chats.map((chat) => (
                            <ChatRow
                              chat={chat}
                              key={chat.title}
                              pinned={false}
                              onTogglePin={() => togglePin('chat', chat.title)}
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
  )
}
