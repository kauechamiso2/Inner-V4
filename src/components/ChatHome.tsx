import { Fragment, useMemo, useRef, useState } from 'react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import { CaretDownIcon, PlusIcon, VoiceWaveIcon } from './SidebarIcons'
import MentionMenu, { MENTION_LABELS } from './MentionMenu'
import type { MentionItem } from './MentionMenu'
import sliders from '../assets/sliders.svg'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

type InputMode = 'agente' | 'chat'

const PLACEHOLDERS: Record<InputMode, string> = {
  agente: 'Diga o que devo fazer',
  chat: 'Pergunte qualquer coisa...',
}

/* regex do highlight: @ + rótulo conhecido (mais longo primeiro) ou @palavra */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const MENTION_RE = new RegExp(
  `@(?:${[...MENTION_LABELS].sort((a, b) => b.length - a.length).map(escapeRe).join('|')})|@[\\p{L}0-9_-]*`,
  'gu',
)

type MentionState = { start: number; query: string }

function findMention(value: string, caret: number): MentionState | null {
  const before = value.slice(0, caret)
  const m = before.match(/@([\p{L}0-9_-]*)$/u)
  if (!m) return null
  return { start: caret - m[0].length, query: m[1] }
}

export default function ChatHome() {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<InputMode>('agente')
  const [mention, setMention] = useState<MentionState | null>(null)
  const [plusOpen, setPlusOpen] = useState(false)
  /* apenas uma tool ativa por vez: ativar outra substitui a atual */
  const [feature, setFeature] = useState<MentionItem | null>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const canSend = value.trim().length > 0

  const syncMention = (val: string, caret: number) => {
    const next = findMention(val, caret)
    setMention(next)
    if (next) setPlusOpen(false)
  }

  /* seleção vinda de qualquer gatilho (@ ou +): ativa a feature como pill */
  const applyItem = (item: MentionItem) => {
    // remove o "@query" que disparou o menu, se veio do @
    if (mention) {
      const end = mention.start + 1 + mention.query.length
      const next = `${value.slice(0, mention.start)}${value.slice(end)}`
      setValue(next)
      requestAnimationFrame(() => {
        const el = fieldRef.current
        if (el) {
          el.focus()
          el.setSelectionRange(mention.start, mention.start)
        }
      })
    }
    // itens agentOnly puxam o input para o modo Agente
    if (item.agentOnly && mode === 'chat') setMode('agente')
    if (item.feature) setFeature(item)
    setMention(null)
    setPlusOpen(false)
  }

  /* segmentos do backdrop: menções em índigo */
  const segments = useMemo(() => {
    const parts: { text: string; mention: boolean }[] = []
    let last = 0
    for (const m of value.matchAll(MENTION_RE)) {
      const i = m.index ?? 0
      if (i > last) parts.push({ text: value.slice(last, i), mention: false })
      parts.push({ text: m[0], mention: true })
      last = i + m[0].length
    }
    if (last < value.length) parts.push({ text: value.slice(last), mention: false })
    return parts
  }, [value])

  return (
    <main className="chat-home">
      <div className="chat-column">
        <div className="chat-greeting" key={mode}>
          {mode === 'agente' ? (
            <>
              <span className="greeting-orb">
                <span className="greeting-orb-glow">
                  <AgentOrb size={26} />
                </span>
                <span className="greeting-orb-core">
                  <AgentOrb size={26} />
                </span>
              </span>
              <h1 className="greeting-text">Me dê uma tarefa...</h1>
            </>
          ) : (
            <h1 className="greeting-text">Converse com modelos de IA</h1>
          )}
        </div>

        <div className="chat-input-wrap">
          <div className="chat-tabs" role="tablist" aria-label="Modo do input">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'agente'}
              className={`chat-tab${mode === 'agente' ? ' is-active' : ''}`}
              onClick={() => setMode('agente')}
            >
              <AgentOrb size={14} />
              Agente
              {mode === 'agente' && (
                <>
                  <span className="tab-foot tab-foot-l" aria-hidden="true" />
                  <span className="tab-foot tab-foot-r" aria-hidden="true" />
                </>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'chat'}
              className={`chat-tab${mode === 'chat' ? ' is-active' : ''}`}
              onClick={() => setMode('chat')}
            >
              Chat
              {mode === 'chat' && (
                <>
                  <span className="tab-foot tab-foot-l" aria-hidden="true" />
                  <span className="tab-foot tab-foot-r" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          <div className="chat-input-card">
          <div className="chat-input-editor">
            <div className="chat-input-backdrop" ref={backdropRef} aria-hidden="true">
              {segments.map((seg, i) => (
                <Fragment key={i}>
                  {seg.mention ? <span className="mention-token">{seg.text}</span> : seg.text}
                </Fragment>
              ))}
              {'\n'}
            </div>
            <textarea
              ref={fieldRef}
              className="chat-input-field"
              placeholder={feature?.placeholder ?? PLACEHOLDERS[mode]}
              rows={1}
              spellCheck={false}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                syncMention(e.target.value, e.target.selectionStart ?? 0)
              }}
              onKeyUp={(e) => syncMention(value, e.currentTarget.selectionStart ?? 0)}
              onClick={(e) => syncMention(value, e.currentTarget.selectionStart ?? 0)}
              onBlur={() => setMention(null)}
              onScroll={(e) => {
                if (backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop
              }}
            />
            {mention && (
              <MentionMenu
                query={mention.query}
                mode={mode}
                onSelect={applyItem}
                onClose={() => setMention(null)}
              />
            )}
          </div>
          <div className="chat-controls" key={mode}>
            <div className="chat-controls-left">
              {mode === 'chat' && (
                <button className="ch-model" type="button" aria-haspopup="listbox">
                  <span className="ch-model-dot" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M4.5 0.6 5.3 3.7 8.4 4.5 5.3 5.3 4.5 8.4 3.7 5.3 0.6 4.5 3.7 3.7 Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </span>
                  <span className="ch-model-name">Claude 6 Sonnet Thinking</span>
                  <CaretDownIcon />
                </button>
              )}
              <span className="ch-attach-wrap">
                <button
                  className="ch-attach"
                  type="button"
                  aria-label="Adicionar"
                  aria-haspopup="menu"
                  aria-expanded={plusOpen}
                  onClick={() => {
                    setMention(null)
                    setPlusOpen((o) => !o)
                  }}
                >
                  <PlusIcon />
                  <span className="pill-tooltip ch-attach-tip" role="tooltip" aria-hidden="true">
                    Adicionar
                  </span>
                </button>
                {plusOpen && (
                  <MentionMenu
                    query=""
                    variant="plus"
                    mode={mode}
                    onSelect={applyItem}
                    onClose={() => setPlusOpen(false)}
                  />
                )}
              </span>
              <button className="ch-chip" type="button">
                <img className="is-rotated" src={sliders} alt="" aria-hidden="true" />
                <span>Ferramentas</span>
              </button>
              {feature && (
                <span className="feature-pill" key={feature.id}>
                  <button
                    type="button"
                    className={`fp-remove${feature.mono ? ' is-mono' : ''}`}
                    aria-label={`Remover ${feature.label}`}
                    onClick={() => setFeature(null)}
                  >
                    <span className="fp-glyph">
                      {feature.img ? <img src={feature.img} alt="" /> : feature.icon}
                    </span>
                    <span className="fp-x" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="pill-tooltip fp-tip" role="tooltip" aria-hidden="true">
                      Remover {feature.label}
                    </span>
                  </button>
                  <span className="fp-label">{feature.label}</span>
                </span>
              )}
            </div>
            <div className="chat-controls-right">
              <button className="chat-mic" type="button" aria-label="Falar">
                <img src={microphone} alt="" aria-hidden="true" />
              </button>
              {mode === 'chat' && !canSend ? (
                <button className="ch-voice" type="button" aria-label="Modo de voz avançado">
                  <VoiceWaveIcon />
                </button>
              ) : (
                <button
                  className={`chat-send${canSend ? ' is-ready' : ''}`}
                  type="button"
                  aria-label="Enviar"
                  disabled={!canSend}
                >
                  <img src={arrowUp} alt="" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}
