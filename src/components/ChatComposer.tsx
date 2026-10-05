import { Fragment, useMemo, useRef, useState } from 'react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import { CaretDownIcon, PlusIcon, VoiceWaveIcon } from './SidebarIcons'
import MentionMenu, { MENTION_LABELS } from './MentionMenu'
import type { Attachment, MentionItem } from './MentionMenu'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

type InputMode = 'agente' | 'chat'

const PLACEHOLDERS: Record<InputMode, string> = {
  agente: 'Diga o que devo fazer',
  chat: 'Pergunte qualquer coisa...',
}

/* regex do highlight: @ + token conhecido (rótulo ou projeto citado, mais
   longo primeiro, para casar nomes com espaço) ou @palavra solta */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const buildMentionRe = (citations: string[]) => {
  const tokens = [...citations, ...MENTION_LABELS]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
  return new RegExp(`@(?:${tokens.join('|')})|@[\\p{L}0-9_-]*`, 'gu')
}

type MentionState = { start: number; query: string }

function findMention(value: string, caret: number): MentionState | null {
  const before = value.slice(0, caret)
  const m = before.match(/@([\p{L}0-9_-]*)$/u)
  if (!m) return null
  return { start: caret - m[0].length, query: m[1] }
}

/* Composer do Chat: abas Agente/Chat, editor com menções (@), anexos e o menu
   contextual. Usado na Home e dentro de um Projeto. */
export default function ChatComposer({
  mode,
  onModeChange,
  placeholder,
  excludeProjects = false,
  accentColor,
}: {
  mode: InputMode
  onModeChange: (m: InputMode) => void
  /* sobrescreve o placeholder padrão por modo (ex.: "Conversar em <projeto>") */
  placeholder?: string
  /* repassa ao menu de @ — esconde "Projetos" dentro de um projeto */
  excludeProjects?: boolean
  /* cor do projeto: aplica um gradiente sutil no card do input */
  accentColor?: string
}) {
  const [value, setValue] = useState('')
  const setMode = onModeChange
  const [mention, setMention] = useState<MentionState | null>(null)
  const [plusOpen, setPlusOpen] = useState(false)
  /* apenas uma tool ativa por vez: ativar outra substitui a atual */
  const [feature, setFeature] = useState<MentionItem | null>(null)
  /* anexos (arquivos/imagens) — vários permitidos, acima do input */
  const [attachments, setAttachments] = useState<(Attachment & { uid: string })[]>([])
  /* projetos citados no texto como @Nome (tratados como tokens atômicos) */
  const [citations, setCitations] = useState<string[]>([])
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const canSend = value.trim().length > 0

  const mentionRe = useMemo(() => buildMentionRe(citations), [citations])

  const syncMention = (val: string, caret: number) => {
    const next = findMention(val, caret)
    setMention(next)
    if (next) setPlusOpen(false)
  }

  const removeCitation = (name: string) =>
    setCitations((cs) => {
      const i = cs.indexOf(name)
      if (i < 0) return cs
      const next = [...cs]
      next.splice(i, 1)
      return next
    })

  /* seleção vinda de qualquer gatilho (@ ou +): ativa a feature como pill */
  const applyItem = (item: MentionItem) => {
    // Projeto: entra como citação inline @Nome (não como pill/anexo), podendo
    // conviver com anexos; o usuário continua escrevendo logo após.
    if (item.citation) {
      const name = item.citation
      const token = `@${name} `
      let start: number
      let removeLen: number
      let lead = ''
      if (mention) {
        start = mention.start
        removeLen = 1 + mention.query.length
      } else {
        start = fieldRef.current?.selectionStart ?? value.length
        removeLen = 0
        if (start > 0 && !/\s$/.test(value.slice(0, start))) lead = ' '
      }
      const head = value.slice(0, start) + lead
      const next = head + token + value.slice(start + removeLen)
      const caret = head.length + token.length
      setValue(next)
      setCitations((cs) => [...cs, name])
      requestAnimationFrame(() => {
        const el = fieldRef.current
        if (el) {
          el.focus()
          el.setSelectionRange(caret, caret)
        }
      })
      setMention(null)
      setPlusOpen(false)
      return
    }

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
    const addAttachment = (a: Attachment) =>
      setAttachments((list) => [...list, { ...a, uid: `att-${Date.now()}-${Math.random()}` }])

    if (item.attachment) {
      // seleção da Biblioteca (arquivo/imagem/coleção) entra como anexo
      addAttachment(item.attachment)
    } else if (item.id === 'upload') {
      // "Fotos e arquivos": mock de uma imagem anexada (thumb aleatória)
      const seed = Math.floor(Math.random() * 10000)
      addAttachment({
        kind: 'image',
        name: `Foto ${seed}.png`,
        fileType: 'Imagem',
        thumb: `https://picsum.photos/seed/up${seed}/120/120`,
      })
    } else {
      // itens agentOnly puxam o input para o modo Agente
      if (item.agentOnly && mode === 'chat') setMode('agente')
      if (item.feature) setFeature(item)
    }
    setMention(null)
    setPlusOpen(false)
  }

  const removeAttachment = (uid: string) =>
    setAttachments((list) => list.filter((a) => a.uid !== uid))

  /* segmentos do backdrop: menções em índigo */
  const segments = useMemo(() => {
    const parts: { text: string; mention: boolean }[] = []
    let last = 0
    for (const m of value.matchAll(mentionRe)) {
      const i = m.index ?? 0
      if (i > last) parts.push({ text: value.slice(last, i), mention: false })
      parts.push({ text: m[0], mention: true })
      last = i + m[0].length
    }
    if (last < value.length) parts.push({ text: value.slice(last), mention: false })
    return parts
  }, [value, mentionRe])

  return (
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

      <div
        className="chat-input-card"
        style={
          accentColor
            ? {
                background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 13%, var(--pop-surface)), var(--pop-surface) 74%)`,
              }
            : undefined
        }
      >
        {attachments.length > 0 && (
          <div className="chat-attachments">
            {attachments.map((a) =>
              a.kind === 'image' ? (
                <span className="att att-image" key={a.uid}>
                  <img src={a.thumb} alt={a.name} loading="lazy" />
                  <button
                    type="button"
                    className="att-remove"
                    aria-label={`Remover ${a.name}`}
                    onClick={() => removeAttachment(a.uid)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ) : (
                <span className="att att-file" key={a.uid}>
                  <span
                    className="att-file-icon"
                    style={
                      a.color
                        ? { background: `color-mix(in srgb, ${a.color} 14%, var(--pop-surface))` }
                        : { background: 'var(--lib-tile-neutral)' }
                    }
                  >
                    <img src={a.img} alt="" />
                  </span>
                  <span className="att-file-text">
                    <span className="att-file-name">{a.name}</span>
                    <span className="att-file-sub">
                      {a.fileType}
                      {a.size ? ` · ${a.size}` : ''}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="att-remove att-remove-file"
                    aria-label={`Remover ${a.name}`}
                    onClick={() => removeAttachment(a.uid)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ),
            )}
          </div>
        )}
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
            placeholder={feature?.placeholder ?? placeholder ?? PLACEHOLDERS[mode]}
            rows={1}
            spellCheck={false}
            value={value}
            onChange={(e) => {
              const v = e.target.value
              setValue(v)
              // mantém só as citações que ainda existem no texto
              setCitations((cs) => cs.filter((n) => v.includes(`@${n}`)))
              syncMention(v, e.target.selectionStart ?? 0)
            }}
            onKeyDown={(e) => {
              // citação de projeto = token atômico: apaga o @Nome inteiro
              const el = e.currentTarget
              const s = el.selectionStart ?? 0
              const en = el.selectionEnd ?? 0
              if (s !== en || citations.length === 0) return
              const tokens = citations.map((n) => `@${n}`)
              if (e.key === 'Backspace' && s > 0) {
                const before = value.slice(0, s)
                const hit = tokens
                  .filter((t) => before.endsWith(t))
                  .sort((a, b) => b.length - a.length)[0]
                if (hit) {
                  e.preventDefault()
                  const from = s - hit.length
                  const next = value.slice(0, from) + value.slice(s)
                  setValue(next)
                  removeCitation(hit.slice(1))
                  syncMention(next, from)
                  requestAnimationFrame(() => {
                    el.focus()
                    el.setSelectionRange(from, from)
                  })
                }
              } else if (e.key === 'Delete') {
                const after = value.slice(s)
                const hit = tokens
                  .filter((t) => after.startsWith(t))
                  .sort((a, b) => b.length - a.length)[0]
                if (hit) {
                  e.preventDefault()
                  const to = s + hit.length
                  const next = value.slice(0, s) + value.slice(to)
                  setValue(next)
                  removeCitation(hit.slice(1))
                  syncMention(next, s)
                  requestAnimationFrame(() => {
                    el.focus()
                    el.setSelectionRange(s, s)
                  })
                }
              }
            }}
            onKeyUp={(e) => syncMention(value, e.currentTarget.selectionStart ?? 0)}
            onClick={(e) => syncMention(value, e.currentTarget.selectionStart ?? 0)}
            onScroll={(e) => {
              if (backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop
            }}
          />
          {mention && (
            <MentionMenu
              query={mention.query}
              mode={mode}
              excludeProjects={excludeProjects}
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
                  excludeProjects={excludeProjects}
                  onSelect={applyItem}
                  onClose={() => setPlusOpen(false)}
                />
              )}
            </span>
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
  )
}
