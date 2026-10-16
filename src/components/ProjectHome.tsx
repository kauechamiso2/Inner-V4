import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, Paperclip, Pin, ScrollText, Settings2 } from 'lucide-react'
import './project-home.css'
import ChatComposer from './ChatComposer'
import ContextModal from './ContextModal'
import InstructionsModal from './InstructionsModal'
import { DEFAULT_PROJECT_CONTENT, PROJECT_CONTENT } from './projectContent'
import type { ProjChat } from './projectContent'
import type { ChosenAgent } from './agents'
import { RenameInput, projectChatKey } from './HistoryPanel'
import { ProjectGlyph } from './projectIcons'
import { ProjectSettingsModal } from './NewProjectModal'
import type { DetailFile, FileType } from './ContextFileList'
import { MessageSquarePlus, MoreHorizontal } from 'lucide-react'
import type { ChatEdit } from './HistoryPanel'

type SideItem = { id: string; icon: ReactNode; label: string; sub?: string; action: string }

const SIDE_ITEMS: SideItem[] = [
  { id: 'instr', icon: <ScrollText size={18} strokeWidth={1.7} />, label: 'Instruções', action: 'Editar' },
  { id: 'ctx', icon: <Paperclip size={18} strokeWidth={1.7} />, label: 'Contexto', action: 'Adicionar' },
]

function ChatRow({
  chat,
  pinned = false,
  onOpen,
  onMenu,
  menuOpen = false,
  renaming = false,
  onRenameDone,
}: {
  chat: ProjChat
  pinned?: boolean
  onOpen?: () => void
  /* "..." no hover: mesmo menu do histórico (renomear, fixar, compartilhar, mover, excluir) */
  onMenu?: (rect: DOMRect) => void
  menuOpen?: boolean
  /* renomear na própria linha */
  renaming?: boolean
  onRenameDone?: (title: string | null) => void
}) {
  return (
    <a
      className={`ph-row${menuOpen ? ' is-menu' : ''}${renaming ? ' is-renaming' : ''}`}
      href="#conversa"
      onClick={(e) => {
        e.preventDefault()
        if (!renaming) onOpen?.()
      }}
    >
      {renaming ? (
        <RenameInput value={chat.title} onDone={(t) => onRenameDone?.(t)} />
      ) : (
        <span className="ph-row-title">{chat.title}</span>
      )}
      {pinned && <Pin className="ph-row-pin" size={13} strokeWidth={1.8} fill="currentColor" />}
      <span className="ph-row-date">{chat.date}</span>
      {!renaming && (
      <button
        type="button"
        className={`ph-row-more${menuOpen ? ' is-open' : ''}`}
        aria-label="Mais opções"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onMenu?.(e.currentTarget.getBoundingClientRect())
        }}
      >
        <MoreHorizontal size={16} strokeWidth={2} />
      </button>
      )}
    </a>
  )
}

export default function ProjectHome({
  name,
  emoji,
  icon,
  color,
  projectId,
  pinned = false,
  onTogglePin,
  onBack,
  agent = null,
  chatEdits = {},
  movedChats = [],
  onOpenChat,
  custom = null,
  description = '',
  onUpdateProject,
  onStartChat,
  onChatMenu,
  menuKey = null,
  isChatPinned = () => false,
  renamingKey = null,
  onRenameDone,
}: {
  name: string
  emoji?: string
  /* ícone escolhido no "Novo projeto" (projetos novos) */
  icon?: string
  color?: string
  projectId: string
  pinned?: boolean
  onTogglePin?: () => void
  onBack: () => void
  /* agente escolhido no onboarding — herdado no input do projeto */
  agent?: ChosenAgent | null
  /* edições do menu "..." do histórico (renomear/excluir/mover) */
  chatEdits?: Record<string, ChatEdit>
  /* chats movidos para este projeto pelo histórico (entram no topo de Recentes) */
  movedChats?: { key: string; title: string }[]
  onOpenChat?: (key: string, title: string) => void
  /* projeto criado pelo usuário: começa vazio (sem chats), com as instruções e
     os arquivos informados no "Novo projeto" */
  custom?: { instructions: string; files: string[] } | null
  /* descrição do projeto (editável nas Configurações) */
  description?: string
  /* enviar no input do projeto: abre a conversa na Home, dentro do projeto */
  onStartChat?: (text: string) => void
  /* menu "..." de um chat do projeto (o App abre o mesmo menu do histórico) */
  onChatMenu?: (key: string, title: string, rect: DOMRect) => void
  menuKey?: string | null
  /* chat fixado (mesmo "Fixar" do menu e dos Pinados da Home) */
  isChatPinned?: (key: string) => boolean
  /* renomear um chat na própria linha */
  renamingKey?: string | null
  onRenameDone?: (key: string, title: string | null) => void
  /* Configurações (nome, ícone, cor) e Instruções salvas */
  onUpdateProject?: (patch: {
    name?: string
    description?: string
    icon?: string
    color?: string
    instructions?: string
  }) => void
}) {
  /* projeto novo: sem chats; contexto = só os arquivos enviados (0% se nenhum) */
  const extOf = (n: string): FileType => {
    const e = n.split('.').pop()?.toLowerCase() ?? ''
    if (e === 'pdf') return 'pdf'
    if (/xls|csv/.test(e)) return 'xlsx'
    if (/ppt|key/.test(e)) return 'pptx'
    if (/png|jpe?g|gif|webp|svg/.test(e)) return 'png'
    if (e === 'txt' || e === 'md') return 'txt'
    return 'docx'
  }
  const content0 = custom
    ? {
        ...DEFAULT_PROJECT_CONTENT,
        pinned: [],
        recents: [],
        contextSections: [],
        contextLoose: custom.files.map<DetailFile>((n, i) => ({ id: `cf-${i}`, name: n, type: extOf(n) })),
        contextPct: custom.files.length ? Math.min(6 + custom.files.length * 4, 40) : 0,
        instructions: custom.instructions,
      }
    : (PROJECT_CONTENT[projectId] ?? DEFAULT_PROJECT_CONTENT)
  /* Fixados do projeto também refletem renomear/excluir/mover */
  const content = {
    ...content0,
    pinned: content0.pinned
      .map((c) => {
        const key = projectChatKey(projectId, c.id)
        const ed = chatEdits[key]
        return { chat: { id: key, title: ed?.title ?? c.title, date: c.date }, ed }
      })
      .filter(({ ed }) => !ed?.deleted && (ed?.projectId === undefined || ed.projectId === projectId))
      .map(({ chat }) => chat),
  }
  /* Recentes = movidos para cá (topo) + os do projeto, com renomear/excluir/mover aplicados */
  /* todos os chats do projeto; os fixados (pelo "...") vão para "Fixados" */
  const allChats: ProjChat[] = [
    ...movedChats.map((c) => ({ id: c.key, title: c.title, date: 'Agora' })),
    ...content.pinned,
    ...content.recents
      .map((c) => {
        const key = projectChatKey(projectId, c.id)
        const ed = chatEdits[key]
        return { chat: { id: key, title: ed?.title ?? c.title, date: c.date }, ed }
      })
      .filter(({ ed }) => !ed?.deleted && (ed?.projectId === undefined || ed.projectId === projectId))
      .map(({ chat }) => chat),
  ]
  const pinnedChats = allChats.filter((c) => isChatPinned(c.id))
  const recents = allChats.filter((c) => !isChatPinned(c.id))
  const [contextOpen, setContextOpen] = useState(false)
  const [instrOpen, setInstrOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <main className="project-home">
      {color && (
        <div
          className="ph-banner"
          aria-hidden="true"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${color} 26%, var(--main-bg)), var(--main-bg))`,
          }}
        />
      )}
      <div className="ph-container">
        <div className="ph-main">
          <nav className="ph-breadcrumb" aria-label="Navegação">
            <button className="ph-back" type="button" onClick={onBack} aria-label="Voltar">
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button className="ph-crumb" type="button" onClick={onBack}>
              Projetos
            </button>
          </nav>

          <header className="ph-head">
            {(emoji || icon) && (
              <span
                className="ph-icon"
                aria-hidden="true"
                style={
                  color
                    ? { background: `color-mix(in srgb, ${color} 16%, var(--card-surface))` }
                    : undefined
                }
              >
                {icon ? <ProjectGlyph icon={icon} size={24} /> : emoji}
              </span>
            )}
            <div className="ph-head-text">
              <div className="ph-title-row">
                <h1 className="ph-title">{name}</h1>
                <button
                  type="button"
                  className={`ph-pin${pinned ? ' is-pinned' : ''}`}
                  aria-label={pinned ? 'Desafixar da homepage' : 'Fixar na homepage'}
                  aria-pressed={pinned}
                  onClick={onTogglePin}
                >
                  <Pin size={16} strokeWidth={1.8} fill={pinned ? 'currentColor' : 'none'} />
                  <span className="pill-tooltip ph-pin-tip" role="tooltip" aria-hidden="true">
                    {pinned ? 'Fixado na homepage' : 'Fixar na homepage'}
                  </span>
                </button>
              </div>
              <button type="button" className="ph-settings" onClick={() => setSettingsOpen(true)}>
                <Settings2 size={14} strokeWidth={1.8} />
                Configurações do projeto
              </button>
            </div>
          </header>

          {/* igual ao input da Home: uma linha, sem as abas Agente/Chat */}
          <ChatComposer
            mode="agente"
            onModeChange={() => {}}
            placeholder={`Conversar em ${name}`}
            excludeProjects
            agent={agent}
            showTabs={false}
            oneLine
            onSend={(text) => onStartChat?.(text)}
          />

          <div className="ph-lists">
            {pinnedChats.length > 0 && (
              <section className="ph-group">
                <div className="ph-group-label">Fixados</div>
                <div className="ph-rows">
                  {pinnedChats.map((c) => (
                    <ChatRow
                      key={c.id}
                      chat={c}
                      pinned
                      onOpen={() => onOpenChat?.(c.id, c.title)}
                      onMenu={(r) => onChatMenu?.(c.id, c.title, r)}
                      menuOpen={menuKey === c.id}
                      renaming={renamingKey === c.id}
                      onRenameDone={(t) => onRenameDone?.(c.id, t)}
                    />
                  ))}
                </div>
              </section>
            )}

            {allChats.length === 0 && (
              <div className="ph-empty">
                <span className="ph-empty-ic" aria-hidden="true">
                  <MessageSquarePlus size={20} strokeWidth={1.8} />
                </span>
                <p className="ph-empty-title">Nenhum chat ainda</p>
                <p className="ph-empty-sub">
                  Comece seu primeiro chat pelo campo acima. As conversas deste projeto aparecem aqui.
                </p>
              </div>
            )}
            {recents.length > 0 && (
            <section className="ph-group">
              <div className="ph-group-label">Recentes</div>
              <div className="ph-rows">
                {recents.map((c) => (
                  <ChatRow
                    key={c.id}
                    chat={c}
                    onOpen={() => onOpenChat?.(c.id, c.title)}
                    onMenu={(r) => onChatMenu?.(c.id, c.title, r)}
                    menuOpen={menuKey === c.id}
                    renaming={renamingKey === c.id}
                    onRenameDone={(t) => onRenameDone?.(c.id, t)}
                  />
                ))}
              </div>
            </section>
            )}
          </div>
        </div>

        <aside className="ph-side" aria-label="Configurações do projeto">
          {SIDE_ITEMS.map((it) => {
            let sub = it.sub
            let action = it.action
            let onClick: (() => void) | undefined
            if (it.id === 'instr') {
              onClick = () => setInstrOpen(true)
            } else if (it.id === 'ctx') {
              sub = `${content.contextPct}%`
              onClick = () => setContextOpen(true)
            }
            return (
              <button className="ph-side-item" type="button" key={it.id} onClick={onClick}>
                <span className="ph-side-icon" aria-hidden="true">
                  {it.icon}
                </span>
                <span className="ph-side-label">
                  {it.label}
                  {sub && <span className="ph-side-sub">{sub}</span>}
                </span>
                <span className="ph-side-action">{action}</span>
              </button>
            )
          })}
        </aside>
      </div>

      <ContextModal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        sections={content.contextSections}
        looseFiles={content.contextLoose}
        usedPct={content.contextPct}
      />
      <InstructionsModal
        open={instrOpen}
        onClose={() => setInstrOpen(false)}
        defaultValue={content.instructions}
        onSave={custom ? (v) => onUpdateProject?.({ instructions: v }) : undefined}
      />
      {settingsOpen && (
        <ProjectSettingsModal
          name={name}
          description={description}
          icon={icon ?? emoji ?? '📁'}
          color={color ?? '#1c1c1c'}
          onClose={() => setSettingsOpen(false)}
          onSave={(p) => onUpdateProject?.(p)}
        />
      )}
    </main>
  )
}
