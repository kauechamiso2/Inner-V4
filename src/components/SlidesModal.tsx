import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, Download, Maximize2, RotateCcw, X } from 'lucide-react'
import SlideView from './SlideView'
import type { Deck } from './slideFlows'
import './image-modal.css'
import './slides-modal.css'

/* Detalhe de uma apresentação gerada. Mesmo modal das imagens, vídeos,
   documentos e áudios: informações à esquerda e, no palco, o slide atual
   com setas, a tira de miniaturas e "Apresentar" em tela cheia. */

export type SlidesResult = {
  title: string
  prompt: string
  model: string
  template: string
  tool: string
  deck: Deck
  /* slide que abre primeiro */
  index?: number
}

type Props = {
  result: SlidesResult
  closing: boolean
  onClose: () => void
  onRegenerate?: () => void
}

export default function SlidesModal({ result, closing, onClose, onRegenerate }: Props) {
  const slides = result.deck.slides
  const [idx, setIdx] = useState(Math.min(result.index ?? 0, slides.length - 1))
  /* direção da troca (para a animação) */
  const [dir, setDir] = useState<1 | -1>(1)
  const [copied, setCopied] = useState(false)
  const [dlOpen, setDlOpen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const go = (n: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, n))
    if (next === idx) return
    setDir(next > idx ? 1 : -1)
    setIdx(next)
  }

  /* miniatura atual sempre visível na tira */
  useEffect(() => {
    const el = stripRef.current?.children[idx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [idx])

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
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return
        if (dlOpen) setDlOpen(false)
        else onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && document.fullscreenElement)) {
        e.preventDefault()
        go(idx + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        go(idx - 1)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const present = () => {
    const el = stageRef.current
    if (el?.requestFullscreen) void el.requestFullscreen().catch(() => {})
  }

  const copy = () => {
    try {
      navigator.clipboard?.writeText(result.prompt)
    } catch {
      /* clipboard indisponível */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return createPortal(
    <div
      className={`img-modal${closing ? ' is-closing' : ''}`}
      style={{ left: leftOffset } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhe da apresentação"
      onClick={onClose}
    >
      <div className="img-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* ---------- Coluna de informações (esquerda) ---------- */}
        <aside className="imm-info">
          <div className="imm-scroll">
            <section className="imm-sec">
              <div className="imm-sec-head">
                <span className="imm-sec-title">Prompt</span>
                <button type="button" className="imm-copy" onClick={copy}>
                  {copied ? <Check size={13} strokeWidth={2.4} /> : <Copy size={13} strokeWidth={2} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="imm-prompt">{result.prompt}</p>
            </section>

            <section className="imm-sec">
              <span className="imm-sec-title">Detalhes</span>
              <dl className="imm-details">
                <div className="imm-row">
                  <dt>Template</dt>
                  <dd>{result.template}</dd>
                </div>
                <div className="imm-row">
                  <dt>Modelo</dt>
                  <dd>{result.model}</dd>
                </div>
                <div className="imm-row">
                  <dt>Slides</dt>
                  <dd>{slides.length}</dd>
                </div>
                <div className="imm-row">
                  <dt>Formato</dt>
                  <dd>16:9</dd>
                </div>
                <div className="imm-row">
                  <dt>Criada em</dt>
                  <dd>16 de outubro de 2026, 14:32</dd>
                </div>
              </dl>
            </section>
          </div>

          <footer className="imm-actions">
            <span className="slm-dl">
              <button type="button" className="imm-cta" aria-haspopup="menu" aria-expanded={dlOpen} onClick={() => setDlOpen((o) => !o)}>
                <Download size={15} strokeWidth={2} />
                Baixar
              </button>
              {dlOpen && (
                <div className="task-menu slm-dl-menu" role="menu">
                  {[
                    ['PowerPoint', 'PPTX'],
                    ['PDF', 'PDF'],
                    ['Imagens', 'PNG'],
                  ].map(([l, ext]) => (
                    <button key={ext} type="button" role="menuitem" className="task-menu-item" onClick={() => setDlOpen(false)}>
                      <span>{l}</span>
                      <span className="slm-ext">{ext}</span>
                    </button>
                  ))}
                </div>
              )}
            </span>
            <button type="button" className="imm-btn" onClick={onRegenerate}>
              <RotateCcw size={15} strokeWidth={2} />
              Regerar
            </button>
          </footer>
        </aside>

        {/* ---------- Palco ---------- */}
        <div className="imm-stage slm-stage">
          <button type="button" className="imm-close" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>

          <div className="slm-main">
            <div className="slm-frame-wrap" ref={stageRef}>
              <div className="slm-frame" key={idx} style={{ '--dir': dir } as CSSProperties}>
                <SlideView slide={slides[idx]} theme={result.deck.theme} />
              </div>
              <button type="button" className="slm-nav is-prev" aria-label="Slide anterior" disabled={idx === 0} onClick={() => go(idx - 1)}>
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
              <button type="button" className="slm-nav is-next" aria-label="Próximo slide" disabled={idx === slides.length - 1} onClick={() => go(idx + 1)}>
                <ChevronRight size={20} strokeWidth={2.2} />
              </button>
            </div>

            <div className="slm-bar">
              <span className="slm-count">
                {idx + 1} / {slides.length}
              </span>
              <button type="button" className="slm-present" onClick={present}>
                <Maximize2 size={14} strokeWidth={2.2} />
                Apresentar
              </button>
            </div>
          </div>

          <div className="slm-strip" ref={stripRef} role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}`}
                className={`slm-thumb${i === idx ? ' is-on' : ''}`}
                style={{ '--i': i } as CSSProperties}
                onClick={() => go(i)}
              >
                <SlideView slide={s} theme={result.deck.theme} />
                <span className="slm-thumb-n">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
