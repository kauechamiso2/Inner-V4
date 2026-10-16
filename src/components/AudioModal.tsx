import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { AudioLines, Check, Copy, Download, FileAudio, Mic, Music, Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react'
import { TRANSCRIPT } from './flow/Flow'
import './image-modal.css'
import './audio-modal.css'

/* Detalhe de um áudio gerado (pilar de Áudio). Mesmo modal das imagens,
   vídeos e documentos: informações à esquerda (texto/prompt, detalhes,
   Baixar e Regerar) e, no palco, o player com a forma de onda. Na
   transcrição, o texto acompanha o áudio e cada trecho leva até ele. */

export type AudioKind = 'voice' | 'music' | 'sfx' | 'transcribe'

export type AudioResultItem = {
  kind: AudioKind
  title: string
  /* texto narrado (voz) ou descrição (música, efeito); arquivo na transcrição */
  prompt: string
  model: string
  /* nome e id da ferramenta (o "Regerar" abre o flow dela) */
  template: string
  tool: string
  voice?: string
  /* duração em segundos */
  dur: number
  /* varia a forma de onda entre resultados */
  seed?: number
}

const KIND_ICON = {
  voice: <Mic size={30} strokeWidth={1.7} />,
  music: <Music size={30} strokeWidth={1.7} />,
  sfx: <AudioLines size={30} strokeWidth={1.7} />,
  transcribe: <FileAudio size={30} strokeWidth={1.7} />,
}
const PROMPT_LABEL = { voice: 'Texto', music: 'Descrição', sfx: 'Descrição', transcribe: 'Arquivo' }
const SPEEDS = [1, 1.25, 1.5, 2, 0.75]
const BARS = 96

const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}
const toSec = (t: string) => {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

type Props = {
  audio: AudioResultItem
  closing: boolean
  onClose: () => void
  onRegenerate?: () => void
}

export default function AudioModal({ audio, closing, onClose, onRegenerate }: Props) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const speed = SPEEDS[speedIdx]
  const dur = audio.dur

  /* forma de onda determinística (suavizada) a partir do título */
  const bars = useMemo(() => {
    let h = audio.seed ?? 0
    for (const ch of audio.title) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const rnd = () => {
      h = (h * 1664525 + 1013904223) >>> 0
      return h / 2 ** 32
    }
    const raw = Array.from({ length: BARS }, (_, k) => {
      const env = audio.kind === 'sfx' ? Math.exp(-k / 30) * 0.9 + 0.1 : 0.55 + 0.45 * Math.sin((k / BARS) * Math.PI)
      return env * (0.35 + rnd() * 0.65)
    })
    return raw.map((v, k) => {
      const a = raw[k - 1] ?? v
      const b = raw[k + 1] ?? v
      return Math.max(0.08, (a + v * 2 + b) / 4)
    })
  }, [audio.title, audio.kind, audio.seed])

  /* relógio do player (protótipo: sem arquivo; a voz usa a fala do navegador) */
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = ((now - last) / 1000) * speed
      last = now
      setT((x) => {
        const n = x + dt
        if (n >= dur) {
          setPlaying(false)
          return dur
        }
        return n
      })
    }, 50)
    return () => window.clearInterval(id)
  }, [playing, speed, dur])

  const speak = (from: number) => {
    const synth = window.speechSynthesis
    if (!synth || audio.kind !== 'voice') return
    synth.cancel()
    /* fala a partir do ponto aproximado do texto */
    const words = audio.prompt.split(/\s+/)
    const start = Math.floor((from / dur) * words.length)
    const u = new SpeechSynthesisUtterance(words.slice(start).join(' '))
    u.lang = 'pt-BR'
    u.rate = speed
    synth.speak(u)
  }
  const stopSpeech = () => window.speechSynthesis?.cancel()
  useEffect(() => stopSpeech, [])

  const toggle = () => {
    if (playing) {
      setPlaying(false)
      stopSpeech()
      return
    }
    const from = t >= dur - 0.05 ? 0 : t
    setT(from)
    setPlaying(true)
    speak(from)
  }
  const seek = (to: number) => {
    const n = Math.min(dur, Math.max(0, to))
    setT(n)
    if (playing) speak(n)
  }
  const cycleSpeed = () => {
    setSpeedIdx((i) => (i + 1) % SPEEDS.length)
    if (playing) window.setTimeout(() => speak(t), 0)
  }

  /* arrastar na forma de onda */
  const waveRef = useRef<HTMLDivElement>(null)
  const posAt = (x: number) => {
    const r = waveRef.current?.getBoundingClientRect()
    if (!r) return 0
    return Math.min(1, Math.max(0, (x - r.left) / r.width))
  }
  const onWaveDown = (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    seek(posAt(e.clientX) * dur)
  }
  const onWaveMove = (e: ReactPointerEvent) => {
    const p = posAt(e.clientX)
    setHover(p)
    if (e.buttons === 1) seek(p * dur)
  }

  /* o modal abre à direita da sidebar, deixando-a aparente */
  const [leftOffset, setLeftOffset] = useState(0)
  useLayoutEffect(() => {
    const measure = () => {
      const sb = document.querySelector('.sidebar') as HTMLElement | null
      setLeftOffset(sb ? sb.getBoundingClientRect().width : 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === 'Escape') onClose()
      else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'ArrowRight') seek(t + 5)
      else if (e.key === 'ArrowLeft') seek(t - 5)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const copy = () => {
    try {
      navigator.clipboard?.writeText(audio.prompt)
    } catch {
      /* clipboard indisponível (ex.: contexto inseguro) */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const progress = dur ? t / dur : 0
  const isTranscript = audio.kind === 'transcribe'
  const lines = isTranscript ? TRANSCRIPT.map((l) => ({ ...l, s: toSec(l.t) })) : []
  const lineIdx = lines.reduce((acc, l, i) => (t >= l.s ? i : acc), -1)

  return createPortal(
    <div
      className={`img-modal${closing ? ' is-closing' : ''}`}
      style={{ left: leftOffset } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhe do áudio"
      onClick={onClose}
    >
      <div className="img-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* ---------- Coluna de informações (esquerda) ---------- */}
        <aside className="imm-info">
          <div className="imm-scroll">
            <section className="imm-sec">
              <div className="imm-sec-head">
                <span className="imm-sec-title">{PROMPT_LABEL[audio.kind]}</span>
                {!isTranscript && (
                  <button type="button" className="imm-copy" onClick={copy}>
                    {copied ? <Check size={13} strokeWidth={2.4} /> : <Copy size={13} strokeWidth={2} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                )}
              </div>
              {isTranscript ? (
                <span className="am-file">
                  <FileAudio size={16} strokeWidth={1.9} />
                  {audio.prompt}
                </span>
              ) : (
                <p className="imm-prompt">{audio.prompt}</p>
              )}
            </section>

            <section className="imm-sec">
              <span className="imm-sec-title">Detalhes</span>
              <dl className="imm-details">
                <div className="imm-row">
                  <dt>Ferramenta</dt>
                  <dd>{audio.template}</dd>
                </div>
                <div className="imm-row">
                  <dt>Modelo</dt>
                  <dd>{audio.model}</dd>
                </div>
                {audio.voice && (
                  <div className="imm-row">
                    <dt>Voz</dt>
                    <dd>{audio.voice}</dd>
                  </div>
                )}
                <div className="imm-row">
                  <dt>Duração</dt>
                  <dd>{fmt(dur)}</dd>
                </div>
                <div className="imm-row">
                  <dt>Formato</dt>
                  <dd>{isTranscript ? 'TXT, SRT' : 'MP3, 44.1 kHz'}</dd>
                </div>
                <div className="imm-row">
                  <dt>Criado em</dt>
                  <dd>16 de outubro de 2026, 14:32</dd>
                </div>
              </dl>
            </section>
          </div>

          <footer className="imm-actions">
            <button type="button" className="imm-cta">
              <Download size={15} strokeWidth={2} />
              {isTranscript ? 'Baixar transcrição' : 'Baixar'}
            </button>
            <button type="button" className="imm-btn" onClick={onRegenerate}>
              <RotateCcw size={15} strokeWidth={2} />
              Regerar
            </button>
          </footer>
        </aside>

        {/* ---------- Palco: player ---------- */}
        <div className={`imm-stage am-stage${isTranscript ? ' has-transcript' : ''}`}>
          <button type="button" className="imm-close" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>

          <div className={`am-player${playing ? ' is-playing' : ''}`}>
            <div className="am-head">
              <span className={`am-cover is-${audio.kind}`} aria-hidden="true">
                {KIND_ICON[audio.kind]}
                <span className="am-cover-ring" />
              </span>
              <div className="am-head-text">
                <h2 className="am-title">{audio.title}</h2>
                <p className="am-sub">
                  {audio.template} · {audio.voice ?? audio.model}
                </p>
              </div>
            </div>

            {/* forma de onda: clicar/arrastar leva até o ponto */}
            <div
              ref={waveRef}
              className="am-wave"
              role="slider"
              tabIndex={0}
              aria-label="Posição do áudio"
              aria-valuemin={0}
              aria-valuemax={Math.round(dur)}
              aria-valuenow={Math.round(t)}
              aria-valuetext={`${fmt(t)} de ${fmt(dur)}`}
              onPointerDown={onWaveDown}
              onPointerMove={onWaveMove}
              onPointerLeave={() => setHover(null)}
            >
              {bars.map((h, k) => {
                const at = (k + 0.5) / BARS
                return (
                  <span
                    key={k}
                    className={`${at <= progress ? 'is-played' : ''}${hover !== null && at <= hover && at > progress ? ' is-hover' : ''}`}
                    style={{ '--h': h, '--k': k } as CSSProperties}
                  />
                )
              })}
              {hover !== null && (
                <span className="am-wave-tip" style={{ left: `${hover * 100}%` }}>
                  {fmt(hover * dur)}
                </span>
              )}
            </div>

            <div className="am-times">
              <span>{fmt(t)}</span>
              <span>{fmt(dur)}</span>
            </div>

            <div className="am-controls">
              <button type="button" className="am-speed" onClick={cycleSpeed} aria-label={`Velocidade ${speed}x`}>
                {String(speed).replace('.', ',')}x
              </button>
              <button type="button" className="am-skip" aria-label="Voltar 10 segundos" onClick={() => seek(t - 10)}>
                <RotateCcw size={19} strokeWidth={1.9} />
                <span>10</span>
              </button>
              <button type="button" className="am-play" aria-label={playing ? 'Pausar' : 'Tocar'} onClick={toggle}>
                <span className="am-play-ic" key={playing ? 'pause' : 'play'}>
                  {playing ? (
                    <Pause size={22} strokeWidth={0} fill="currentColor" />
                  ) : (
                    <Play size={22} strokeWidth={0} fill="currentColor" style={{ marginLeft: 3 }} />
                  )}
                </span>
              </button>
              <button type="button" className="am-skip" aria-label="Avançar 10 segundos" onClick={() => seek(t + 10)}>
                <RotateCw size={19} strokeWidth={1.9} />
                <span>10</span>
              </button>
              <span className="am-speed is-ghost" aria-hidden="true" />
            </div>
          </div>

          {isTranscript && (
            <div className="am-transcript" aria-label="Transcrição">
              {lines.map((l, i) => (
                <button
                  type="button"
                  key={l.t}
                  className={`am-line${i === lineIdx ? ' is-on' : ''}${i < lineIdx ? ' is-past' : ''}`}
                  onClick={() => seek(l.s)}
                >
                  <span className="am-line-time">{l.t}</span>
                  <span className="am-line-text">{l.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
