import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  Download,
  FileText,
  Info,
  Link2,
  Pause,
  Play,
  Sparkles,
  Video,
  X,
} from 'lucide-react'
import ShareSiteModal from './ShareSiteModal'
import type { SiteAccess } from './ShareSiteModal'
import { fmtTime, initials, meetingFor } from './meetingData'
import type { Person } from './meetingData'
import './meeting-detail.css'

/* Reunião gravada: Resumo e Transcrição no centro e, à direita, um rail
   com Gravação, Chat com IA, Analytics e Informações (abrem num painel). */

type Tool = 'recording' | 'chat' | 'analytics' | 'info'
const TOOLS: { id: Tool; label: string; icon: ReactNode }[] = [
  { id: 'recording', label: 'Gravação', icon: <Video size={18} strokeWidth={1.9} /> },
  { id: 'chat', label: 'Chat com IA', icon: <Sparkles size={18} strokeWidth={1.9} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} strokeWidth={1.9} /> },
  { id: 'info', label: 'Informações', icon: <Info size={18} strokeWidth={1.9} /> },
]

function Avatar({ p, size = 28 }: { p: Person; size?: number }) {
  return (
    <span className="md-avatar" style={{ '--c': p.color, width: size, height: size, fontSize: size * 0.38 } as CSSProperties} title={p.name}>
      {initials(p.name)}
    </span>
  )
}

export default function MeetingDetail({ title, onBack }: { title: string; onBack: () => void }) {
  const m = useMemo(() => meetingFor(title), [title])
  const [tab, setTab] = useState<'summary' | 'transcript'>('summary')
  const [tool, setTool] = useState<Tool | null>(null)
  const [done, setDone] = useState<Record<number, boolean>>({})
  const [linkCopied, setLinkCopied] = useState(false)
  const [dlOpen, setDlOpen] = useState(false)
  const [share, setShare] = useState(false)
  const [access, setAccess] = useState<SiteAccess>('private')

  /* gravação (protótipo: relógio simulado) */
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      setT((x) => {
        if (x + dt >= m.dur) {
          setPlaying(false)
          return m.dur
        }
        return x + dt
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [playing, m.dur])
  const lineIdx = m.lines.reduce((acc, l, i) => (t >= l.t ? i : acc), -1)
  const toggleRec = () => {
    if (playing) return setPlaying(false)
    if (t >= m.dur) setT(0)
    setPlaying(true)
  }
  const seekTo = (s: number) => {
    setT(s)
    setTool('recording')
    setPlaying(true)
  }

  /* fecha o menu de download ao clicar fora */
  const dlRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!dlOpen) return
    const onDown = (e: PointerEvent) => {
      if (!dlRef.current?.contains(e.target as Node)) setDlOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [dlOpen])

  const copyLink = () => {
    try {
      navigator.clipboard?.writeText(`https://inner.ai/r/${encodeURIComponent(m.title)}`)
    } catch {
      /* clipboard indisponível */
    }
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1600)
  }

  return (
    <main className="md-page">
      <header className="md-top">
        <button type="button" className="md-icon-btn" aria-label="Voltar para reuniões" title="Voltar" onClick={onBack}>
          <ArrowLeft size={17} strokeWidth={2} />
        </button>
        <h1 className="md-title">{m.title}</h1>
        <span className="md-tag">Reunião</span>

        <div className="md-top-actions">
          <button type="button" className="md-icon-btn is-outline" aria-label="Copiar link" title={linkCopied ? 'Link copiado' : 'Copiar link'} onClick={copyLink}>
            <span className="md-swap" key={linkCopied ? 'c' : 'l'}>
              {linkCopied ? <Check size={16} strokeWidth={2.4} /> : <Link2 size={16} strokeWidth={2} />}
            </span>
          </button>
          <span className="md-menu-wrap" ref={dlRef}>
            <button
              type="button"
              className={`md-icon-btn is-outline${dlOpen ? ' is-open' : ''}`}
              aria-label="Baixar"
              title="Baixar"
              aria-haspopup="menu"
              aria-expanded={dlOpen}
              onClick={() => setDlOpen((o) => !o)}
            >
              <Download size={16} strokeWidth={2} />
            </button>
            {dlOpen && (
              <div className="task-menu md-menu" role="menu">
                {[
                  ['Resumo', 'PDF', <FileText key="r" size={15} strokeWidth={1.9} />],
                  ['Transcrição', 'TXT', <FileText key="t" size={15} strokeWidth={1.9} />],
                  ['Gravação', 'MP4', <Video key="g" size={15} strokeWidth={1.9} />],
                ].map(([label, ext, ic]) => (
                  <button key={label as string} type="button" role="menuitem" className="task-menu-item" onClick={() => setDlOpen(false)}>
                    {ic}
                    <span>{label}</span>
                    <span className="md-menu-ext">{ext}</span>
                  </button>
                ))}
              </div>
            )}
          </span>
          <button type="button" className="md-share" onClick={() => setShare(true)}>
            Compartilhar
          </button>
        </div>
      </header>

      <div className="md-body">
        {/* ---------- conteúdo ---------- */}
        <div className="md-main">
          <div className="md-tabs" role="tablist" style={{ '--x': tab === 'summary' ? 0 : 1 } as CSSProperties}>
            <span className="md-tabs-pill" aria-hidden="true" />
            <button type="button" role="tab" aria-selected={tab === 'summary'} className={tab === 'summary' ? 'is-on' : ''} onClick={() => setTab('summary')}>
              Resumo
            </button>
            <button type="button" role="tab" aria-selected={tab === 'transcript'} className={tab === 'transcript' ? 'is-on' : ''} onClick={() => setTab('transcript')}>
              Transcrição
            </button>
          </div>

          {tab === 'summary' ? (
            <article className="md-doc" key="summary">
              <h2 className="md-doc-title">Resumo da reunião</h2>
              <p className="md-doc-meta">
                {m.date} · {m.time}
              </p>

              <h3>Participantes</h3>
              <ul className="md-people">
                {m.people.map((p) => (
                  <li key={p.name}>
                    <Avatar p={p} size={24} />
                    {p.name}
                  </li>
                ))}
              </ul>

              <h3>Resumo</h3>
              {m.summary.map((s, i) => (
                <p key={i}>{s}</p>
              ))}

              <h3>Decisões</h3>
              <ul className="md-bullets">
                {m.decisions.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>

              <h3>Ações pendentes</h3>
              <ul className="md-actions">
                {m.actions.map((a, i) => (
                  <li key={a.text} className={done[i] ? 'is-done' : ''}>
                    <button
                      type="button"
                      className="md-check"
                      role="checkbox"
                      aria-checked={!!done[i]}
                      aria-label={a.text}
                      onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>
                    <span className="md-action-text">{a.text}</span>
                    <span className="md-action-meta">
                      <Avatar p={m.people[a.who]} size={20} />
                      {a.due}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ) : (
            <div className="md-transcript" key="transcript">
              {m.lines.map((l, i) => {
                const p = m.people[l.who]
                return (
                  <button
                    type="button"
                    key={i}
                    className={`md-line${playing || t > 0 ? (i === lineIdx ? ' is-on' : '') : ''}`}
                    onClick={() => seekTo(l.t)}
                    title="Ouvir a partir daqui"
                  >
                    <Avatar p={p} size={30} />
                    <span className="md-line-body">
                      <span className="md-line-head">
                        <strong>{p.name}</strong>
                        <span>{fmtTime(l.t)}</span>
                      </span>
                      <span className="md-line-text">{l.text}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ---------- painel da ferramenta ---------- */}
        <aside className={`md-panel${tool ? ' is-open' : ''}`} aria-hidden={!tool}>
          <div className="md-panel-inner">
            {tool && (
              <>
                <header className="md-panel-head">
                  <span>{TOOLS.find((x) => x.id === tool)?.label}</span>
                  <button type="button" className="md-icon-btn" aria-label="Fechar painel" onClick={() => setTool(null)}>
                    <X size={16} strokeWidth={2.2} />
                  </button>
                </header>
                <div className="md-panel-body" key={tool}>
                  {tool === 'recording' && (
                    <Recording m={m} t={t} playing={playing} onToggle={toggleRec} onSeek={setT} speaker={m.lines[Math.max(0, lineIdx)]?.who ?? 0} />
                  )}
                  {tool === 'chat' && <MeetingChat m={m} />}
                  {tool === 'analytics' && <Analytics m={m} />}
                  {tool === 'info' && <MeetingInfo m={m} />}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* ---------- rail ---------- */}
        <nav className="md-rail" aria-label="Ferramentas da reunião">
          {TOOLS.map((x) => (
            <button
              key={x.id}
              type="button"
              className={`md-rail-btn${tool === x.id ? ' is-on' : ''}`}
              aria-pressed={tool === x.id}
              onClick={() => setTool((cur) => (cur === x.id ? null : x.id))}
            >
              <span className="md-rail-ic">{x.icon}</span>
              {x.label}
            </button>
          ))}
        </nav>
      </div>

      {share && (
        <ShareSiteModal
          kind="meeting"
          icon={<Video size={20} strokeWidth={1.7} aria-hidden="true" />}
          name={m.title}
          url={`inner.ai/r/${m.title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}`}
          access={access}
          onClose={() => setShare(false)}
          onSave={(a) => {
            setAccess(a)
            setShare(false)
          }}
        />
      )}
    </main>
  )
}

/* ---------- Gravação ---------- */
function Recording({
  m,
  t,
  playing,
  onToggle,
  onSeek,
  speaker,
}: {
  m: ReturnType<typeof meetingFor>
  t: number
  playing: boolean
  onToggle: () => void
  onSeek: (s: number) => void
  speaker: number
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const seekAt = (x: number) => {
    const r = barRef.current?.getBoundingClientRect()
    if (r) onSeek(Math.min(1, Math.max(0, (x - r.left) / r.width)) * m.dur)
  }
  return (
    <div className="md-rec">
      <div className={`md-rec-stage${playing ? ' is-playing' : ''}`} style={{ '--n': m.people.length } as CSSProperties}>
        {m.people.map((p, i) => (
          <span key={p.name} className={`md-rec-tile${i === speaker && playing ? ' is-talking' : ''}`}>
            <Avatar p={p} size={34} />
            <span className="md-rec-name">{p.name.split(' ')[0]}</span>
          </span>
        ))}
        <button type="button" className="md-rec-play" aria-label={playing ? 'Pausar' : 'Tocar'} onClick={onToggle}>
          {playing ? <Pause size={18} strokeWidth={0} fill="currentColor" /> : <Play size={18} strokeWidth={0} fill="currentColor" style={{ marginLeft: 2 }} />}
        </button>
      </div>
      <div
        ref={barRef}
        className="md-rec-bar"
        role="slider"
        tabIndex={0}
        aria-label="Posição da gravação"
        aria-valuemin={0}
        aria-valuemax={m.dur}
        aria-valuenow={Math.round(t)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          seekAt(e.clientX)
        }}
        onPointerMove={(e) => e.buttons === 1 && seekAt(e.clientX)}
      >
        <span className="md-rec-fill" style={{ width: `${(t / m.dur) * 100}%` }} />
        {/* marcas de quem fala ao longo da reunião */}
        {m.lines.map((l, i) => (
          <span key={i} className="md-rec-mark" style={{ left: `${(l.t / m.dur) * 100}%`, '--c': m.people[l.who].color } as CSSProperties} />
        ))}
      </div>
      <div className="md-rec-times">
        <span>{fmtTime(t)}</span>
        <span>{fmtTime(m.dur)}</span>
      </div>
      <p className="md-panel-hint">Clique numa fala da transcrição para ouvir a partir dela.</p>
    </div>
  )
}

/* ---------- Chat com IA ---------- */
const SUGGESTIONS = ['Quais foram as decisões?', 'Liste as ações e responsáveis', 'Escreva um e-mail de follow-up']
/* respostas montadas a partir do resumo da própria reunião */
const answerFor = (q: string, m: ReturnType<typeof meetingFor>) => {
  const first = (n: number) => m.people[n].name.split(' ')[0]
  if (q === SUGGESTIONS[0]) return `As decisões foram: ${m.decisions.map((d) => d.replace(/\.$/, '').toLowerCase()).join('; ')}.`
  if (q === SUGGESTIONS[1]) return m.actions.map((a) => `${first(a.who)}: ${a.text.toLowerCase()} (${a.due})`).join('\n')
  if (q === SUGGESTIONS[2])
    return `Oi, pessoal! Obrigado pela conversa de hoje. Recapitulando: ${m.decisions.map((d) => d.replace(/\.$/, '').toLowerCase()).join(', ')}. Qualquer dúvida, é só chamar.`
  return `Sobre "${q}": ${m.summary[0]}`
}
function MeetingChat({ m }: { m: ReturnType<typeof meetingFor> }) {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, typing])
  const ask = (q: string) => {
    if (!q.trim() || typing) return
    setMsgs((x) => [...x, { me: true, text: q }])
    setDraft('')
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMsgs((x) => [...x, { me: false, text: answerFor(q, m) }])
    }, 1100)
  }
  return (
    <div className="md-chat">
      <div className="md-chat-list">
        {msgs.length === 0 && (
          <div className="md-chat-empty">
            <span className="md-chat-orb" aria-hidden="true">
              <Sparkles size={18} strokeWidth={1.9} />
            </span>
            <p>Pergunte qualquer coisa sobre esta reunião.</p>
            <div className="md-chat-sugs">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((x, i) => (
          <div key={i} className={`md-msg${x.me ? ' is-me' : ''}`}>
            {x.text}
          </div>
        ))}
        {typing && (
          <div className="md-msg is-typing" aria-label="Escrevendo">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="md-chat-input"
        onSubmit={(e) => {
          e.preventDefault()
          ask(draft)
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Pergunte sobre a reunião" aria-label="Pergunta" />
        <button type="submit" className={draft.trim() ? 'is-on' : ''} aria-label="Enviar" disabled={!draft.trim() || typing}>
          <ArrowUp size={16} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  )
}

/* ---------- Analytics ---------- */
function Analytics({ m }: { m: ReturnType<typeof meetingFor> }) {
  /* tempo de fala: do início de cada fala até a próxima */
  const talk = m.people.map(() => 0)
  m.lines.forEach((l, i) => {
    talk[l.who] += (m.lines[i + 1]?.t ?? m.dur) - l.t
  })
  const total = talk.reduce((a, b) => a + b, 0) || 1
  const words = m.lines.reduce((a, l) => a + l.text.split(/\s+/).length, 0)
  return (
    <div className="md-an">
      <div className="md-an-stats">
        <span>
          <strong>{fmtTime(m.dur)}</strong>
          Duração
        </span>
        <span>
          <strong>{m.people.length}</strong>
          Participantes
        </span>
        <span>
          <strong>{words}</strong>
          Palavras
        </span>
      </div>

      <h4>Tempo de fala</h4>
      <ul className="md-an-talk">
        {m.people.map((p, i) => {
          const pct = Math.round((talk[i] / total) * 100)
          return (
            <li key={p.name}>
              <Avatar p={p} size={24} />
              <span className="md-an-name">{p.name}</span>
              <span className="md-an-pct">{pct}%</span>
              <span className="md-an-track">
                <span style={{ width: `${pct}%`, '--c': p.color, '--i': i } as CSSProperties} />
              </span>
            </li>
          )
        })}
      </ul>

      <h4>Tópicos</h4>
      <ul className="md-an-topics">
        {m.topics.map(([name, pct]) => (
          <li key={name}>
            {name}
            <span>{pct}%</span>
          </li>
        ))}
      </ul>

      <h4>Sentimento</h4>
      <div className="md-an-sent" aria-label={`Positivo ${m.sentiment[0]}%, neutro ${m.sentiment[1]}%, negativo ${m.sentiment[2]}%`}>
        <span className="is-pos" style={{ flex: m.sentiment[0] }} />
        <span className="is-neu" style={{ flex: m.sentiment[1] }} />
        <span className="is-neg" style={{ flex: m.sentiment[2] }} />
      </div>
      <div className="md-an-legend">
        <span className="is-pos">Positivo {m.sentiment[0]}%</span>
        <span className="is-neu">Neutro {m.sentiment[1]}%</span>
        <span className="is-neg">Negativo {m.sentiment[2]}%</span>
      </div>
    </div>
  )
}

/* ---------- Informações ---------- */
function MeetingInfo({ m }: { m: ReturnType<typeof meetingFor> }) {
  return (
    <div className="md-info">
      <dl>
        {[
          ['Data', m.date],
          ['Horário', m.time],
          ['Duração', fmtTime(m.dur)],
          ['Plataforma', m.platform],
          ['Link', m.link],
          ['Gravado por', 'Agente Inner'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <h4>Participantes</h4>
      <ul className="md-people">
        {m.people.map((p) => (
          <li key={p.name}>
            <Avatar p={p} size={26} />
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
