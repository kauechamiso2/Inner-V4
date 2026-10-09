import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { Check, Copy, Download, Images, Pencil, X } from 'lucide-react'
import './image-modal.css'

export type ModalImg = { src: string; ar: number; prompt: string; model: string }

/* formato legível a partir da proporção (largura/altura) */
function formatFromAr(ar: number): string {
  const known: [number, string][] = [
    [1, '1:1'],
    [0.747, '3:4'],
    [1.34, '4:3'],
    [1.792, '16:9'],
    [0.558, '9:16'],
  ]
  let best = known[0]
  for (const k of known) {
    if (Math.abs(ar - k[0]) < Math.abs(ar - best[0])) best = k
  }
  return best[1]
}

type Props = {
  img: ModalImg
  closing: boolean
  onClose: () => void
  /* "Usar de base": anexa a imagem ao input de geração e fecha o modal */
  onUseAsBase: () => void
}

export default function ImageModal({ img, closing, onClose, onUseAsBase }: Props) {
  const [copied, setCopied] = useState(false)
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
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copyPrompt = () => {
    try {
      navigator.clipboard?.writeText(img.prompt)
    } catch {
      /* clipboard indisponível (ex.: contexto inseguro) */
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
      aria-label="Detalhe da imagem"
      onClick={onClose}
    >
      <div className="img-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* ---------- Coluna de informações (esquerda) ---------- */}
        <aside className="imm-info">
          <div className="imm-scroll">
            <section className="imm-sec">
              <div className="imm-sec-head">
                <span className="imm-sec-title">Prompt</span>
                <button type="button" className="imm-copy" onClick={copyPrompt}>
                  {copied ? <Check size={13} strokeWidth={2.4} /> : <Copy size={13} strokeWidth={2} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="imm-prompt">{img.prompt}</p>
            </section>

            <section className="imm-sec">
              <span className="imm-sec-title">Detalhes</span>
              <dl className="imm-details">
                <div className="imm-row">
                  <dt>Modelo</dt>
                  <dd>{img.model}</dd>
                </div>
                <div className="imm-row">
                  <dt>Formato</dt>
                  <dd>{formatFromAr(img.ar)}</dd>
                </div>
                <div className="imm-row">
                  <dt>Qualidade</dt>
                  <dd>4K</dd>
                </div>
                <div className="imm-row">
                  <dt>Criada em</dt>
                  <dd>8 de outubro de 2026, 19:46</dd>
                </div>
              </dl>
            </section>
          </div>

          <footer className="imm-actions">
            <button type="button" className="imm-cta" onClick={onUseAsBase}>
              <Images size={16} strokeWidth={2} />
              Usar de base
            </button>
            <button type="button" className="imm-btn">
              <Download size={15} strokeWidth={2} />
              Baixar
            </button>
          </footer>
        </aside>

        {/* ---------- Palco da imagem (direita) ---------- */}
        <div className="imm-stage">
          <button type="button" className="imm-close" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
          <div className="imm-stage-inner">
            <img className="imm-img" src={img.src} alt={img.prompt} />
            <button type="button" className="imm-edit">
              <Pencil size={15} strokeWidth={2} />
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
