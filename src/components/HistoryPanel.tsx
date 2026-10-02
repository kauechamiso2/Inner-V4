import type { CSSProperties, ReactNode } from 'react'
import './history.css'
import cursorText from '../assets/cursor-text.svg'
import robot from '../assets/robot.svg'
import magnifyingGlass from '../assets/magnifying-glass.svg'
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
  SpeakerHighIcon,
} from './SidebarIcons'
import { PILLAR_COLORS } from './pillars'
import type { GenPillarId, PanelView } from './pillars'

/* ---------- Mock: histórico do Chat ---------- */

type ChatSource = 'agent' | 'blue' | 'avatar' | 'dark' | 'spiral'
type Chat = { title: string; source: ChatSource }
type ChatGroup = { label: string; chats: Chat[] }

const CHAT_GROUPS: ChatGroup[] = [
  {
    label: 'Hoje',
    chats: [
      { title: 'Direção de arte da campanha', source: 'agent' },
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
      { title: 'Resumo da call com investidores', source: 'agent' },
      { title: 'Plano de conteúdo de novembro', source: 'agent' },
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
}

const PANEL_CONFIG: Record<PanelView, { title: string; newLabel: string }> = {
  chat: { title: 'Chat', newLabel: 'Nova conversa' },
  imagens: { title: 'Imagens', newLabel: 'Nova imagem' },
  videos: { title: 'Vídeos', newLabel: 'Novo vídeo' },
  audio: { title: 'Áudio', newLabel: 'Novo áudio' },
  reunioes: { title: 'Reuniões', newLabel: 'Nova reunião' },
  documentos: { title: 'Documentos', newLabel: 'Novo documento' },
}

const PILLAR_ROW_ICONS: Partial<Record<GenPillarId, (color: string) => ReactNode>> = {
  audio: (c) => <SpeakerHighIcon size={16} color={c} />,
  reunioes: (c) => <PresentationChartIcon size={16} color={c} />,
  documentos: (c) => <FileTextIcon size={16} color={c} />,
}

/* ---------- Ícones de modelo (chat) ---------- */

function ModelIcon({ source }: { source: Exclude<ChatSource, 'agent'> }) {
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

function ChatRow({ chat }: { chat: Chat }) {
  if (chat.source === 'agent') {
    return (
      <a className="chat-row is-agent" href="#conversa">
        <span className="chat-row-main">
          <AgentOrb />
          <span className="chat-row-title">{chat.title}</span>
        </span>
        <span className="chat-chip">Agent</span>
      </a>
    )
  }
  return (
    <a className="chat-row" href="#conversa">
      <span className="chat-row-main">
        <ModelIcon source={chat.source} />
        <span className="chat-row-title is-model">{chat.title}</span>
      </span>
    </a>
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

type Props = { view: PanelView; hidden?: boolean }

export default function HistoryPanel({ view, hidden = false }: Props) {
  const config = PANEL_CONFIG[view]
  const color = PILLAR_COLORS[view]

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
              <span>{config.newLabel}</span>
            </button>
            {view === 'chat' && (
              <>
                <a className="history-action" href="#prompts">
                  <img src={cursorText} alt="" aria-hidden="true" />
                  <span>Prompts</span>
                </a>
                <a className="history-action" href="#assistentes">
                  <img src={robot} alt="" aria-hidden="true" />
                  <span>Assistentes</span>
                </a>
              </>
            )}
          </div>

          <div className="history-label-row">
            <span className="history-label">Histórico</span>
            <button className="history-search" type="button" aria-label="Buscar no histórico">
              <img src={magnifyingGlass} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="history-scroll">
            <div className="history-groups">
              {view === 'chat'
                ? CHAT_GROUPS.map((group) => (
                    <div className="history-group" key={group.label}>
                      <div className="history-group-label">{group.label}</div>
                      <div className="history-group-list">
                        {group.chats.map((chat) => (
                          <ChatRow chat={chat} key={chat.title} />
                        ))}
                      </div>
                    </div>
                  ))
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
