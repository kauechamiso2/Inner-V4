import { useState } from 'react'
import type { ReactNode } from 'react'
import { Brain, ChevronLeft, Clock, Paperclip, Pin, ScrollText } from 'lucide-react'
import './project-home.css'
import { PlusIcon, VoiceWaveIcon } from './SidebarIcons'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

type Chat = { id: string; title: string; date: string }

/* conversas de demonstração do projeto */
const PINNED: Chat[] = [{ id: 'p1', title: 'Pilares de conteúdo 2026', date: '15 set' }]

const RECENTS: Chat[] = [
  { id: 'r1', title: 'Calendário editorial de outubro', date: '2 out' },
  { id: 'r2', title: 'Legendas do lançamento da coleção', date: '1 out' },
  { id: 'r3', title: 'Roteiro de Reels — bastidores do ensaio', date: '30 set' },
  { id: 'r4', title: 'Ideias de carrossel educativo', date: '29 set' },
  { id: 'r5', title: 'Briefing do ensaio de produto', date: '26 set' },
  { id: 'r6', title: 'Plano de mídia paga Q4', date: '24 set' },
  { id: 'r7', title: 'Copy do e-mail de Black Friday', date: '20 set' },
]

type SideItem = { id: string; icon: ReactNode; label: string; sub?: string; action: string }

const SIDE_ITEMS: SideItem[] = [
  { id: 'instr', icon: <ScrollText size={18} strokeWidth={1.7} />, label: 'Instruções', action: 'Editar' },
  { id: 'ctx', icon: <Paperclip size={18} strokeWidth={1.7} />, label: 'Contexto', sub: '1 arquivo', action: 'Adicionar' },
  { id: 'mem', icon: <Brain size={18} strokeWidth={1.7} />, label: 'Memória', action: 'Ver' },
  { id: 'sched', icon: <Clock size={18} strokeWidth={1.7} />, label: 'Agendado', action: 'Adicionar' },
]

function ChatRow({ chat, pinned = false }: { chat: Chat; pinned?: boolean }) {
  return (
    <a className="ph-row" href="#conversa">
      <span className="ph-row-title">{chat.title}</span>
      {pinned && <Pin className="ph-row-pin" size={13} strokeWidth={1.8} fill="currentColor" />}
      <span className="ph-row-date">{chat.date}</span>
    </a>
  )
}

export default function ProjectHome({
  name,
  emoji,
  color,
  creator,
  onBack,
}: {
  name: string
  emoji?: string
  color?: string
  creator: string
  onBack: () => void
}) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0

  return (
    <main className="project-home">
      <div className="ph-container">
        <div className="ph-main">
          <nav className="ph-breadcrumb" aria-label="Navegação">
            <button className="ph-back" type="button" onClick={onBack} aria-label="Voltar">
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button className="ph-crumb" type="button" onClick={onBack}>
              Biblioteca
            </button>
          </nav>

          <header className="ph-head">
            {emoji && (
              <span
                className="ph-icon"
                aria-hidden="true"
                style={
                  color
                    ? { background: `color-mix(in srgb, ${color} 16%, var(--card-surface))` }
                    : undefined
                }
              >
                {emoji}
              </span>
            )}
            <div className="ph-head-text">
              <h1 className="ph-title">{name}</h1>
              <p className="ph-creator">Criado por {creator}</p>
            </div>
          </header>

          <div className="ph-input">
            <textarea
              className="ph-input-field"
              rows={1}
              placeholder={`Conversar em ${name}`}
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="ph-input-controls">
              <button className="ph-ctrl" type="button" aria-label="Adicionar">
                <PlusIcon />
              </button>
              <div className="ph-ctrl-right">
                <button className="ph-mic" type="button" aria-label="Falar">
                  <img src={microphone} alt="" aria-hidden="true" />
                </button>
                {canSend ? (
                  <button className="ph-send is-ready" type="button" aria-label="Enviar">
                    <img src={arrowUp} alt="" aria-hidden="true" />
                  </button>
                ) : (
                  <button className="ph-voice" type="button" aria-label="Modo de voz avançado">
                    <VoiceWaveIcon />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="ph-lists">
            <section className="ph-group">
              <div className="ph-group-label">Fixados</div>
              <div className="ph-rows">
                {PINNED.map((c) => (
                  <ChatRow key={c.id} chat={c} pinned />
                ))}
              </div>
            </section>

            <section className="ph-group">
              <div className="ph-group-label">Recentes</div>
              <div className="ph-rows">
                {RECENTS.map((c) => (
                  <ChatRow key={c.id} chat={c} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="ph-side" aria-label="Configurações do projeto">
          {SIDE_ITEMS.map((it) => (
            <div className="ph-side-item" key={it.id}>
              <span className="ph-side-icon" aria-hidden="true">
                {it.icon}
              </span>
              <span className="ph-side-label">
                {it.label}
                {it.sub && <span className="ph-side-sub">{it.sub}</span>}
              </span>
              <button className="ph-side-action" type="button">
                {it.action}
              </button>
            </div>
          ))}
          <div className="ph-side-foot">Privado</div>
        </aside>
      </div>
    </main>
  )
}
