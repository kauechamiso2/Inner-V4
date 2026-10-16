import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { ArrowUp, Check, Copy, Download, Images, Mic, Pencil, Square, X } from 'lucide-react'
import './image-modal.css'

export type ModalImg = {
  src: string
  ar: number
  prompt: string
  model: string
  /* imagens usadas como base na geração (aparecem junto do prompt) */
  bases?: string[]
}

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

/* ditado simulado (protótipo): o que o "microfone" transcreve */
const DICTATION = 'Deixe o céu ao entardecer, com tons de laranja e rosa'

export default function ImageModal({ img, closing, onClose, onUseAsBase }: Props) {
  const [copied, setCopied] = useState(false)
  /* "Editar": o botão vira um input (texto ou voz) no mesmo lugar */
  const [edit, setEdit] = useState<'idle' | 'open' | 'running' | 'done'>('idle')
  const [editText, setEditText] = useState('')
  const [listening, setListening] = useState(false)
  const [editW, setEditW] = useState(560)
  const editRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const openEdit = () => {
    /* largura do input: a da imagem, entre 360 e 600px */
    const imgW = editRef.current?.parentElement?.querySelector('.imm-img')?.getBoundingClientRect().width ?? 560
    setEditW(Math.max(360, Math.min(600, imgW)))
    setEdit('open')
    later(() => editInputRef.current?.focus(), 220)
  }
  const closeEdit = () => {
    setListening(false)
    setEdit('idle')
  }
  const toggleMic = () => {
    if (listening) {
      setListening(false)
      return
    }
    setListening(true)
    setEditText('')
    /* "transcreve" palavra por palavra e para sozinho */
    const words = DICTATION.split(' ')
    words.forEach((_, i) => later(() => setEditText(words.slice(0, i + 1).join(' ')), 700 + i * 170))
    later(() => {
      setListening(false)
      editInputRef.current?.focus()
    }, 700 + words.length * 170 + 250)
  }
  const sendEdit = () => {
    if (!editText.trim()) return
    setListening(false)
    setEdit('running')
    later(() => setEdit('done'), 3400)
    later(() => {
      setEdit('idle')
      setEditText('')
    }, 3400 + 2200)
  }
  /* clique fora com o input vazio: volta a ser o botão */
  useEffect(() => {
    if (edit !== 'open') return
    const onDown = (e: PointerEvent) => {
      if (!editRef.current?.contains(e.target as Node) && !editText.trim() && !listening) closeEdit()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [edit, editText, listening])
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
      if (e.key !== 'Escape') return
      /* com o input de edição aberto, o Esc fecha só ele */
      if (document.querySelector('.imm-edit.is-open')) {
        setListening(false)
        setEdit('idle')
        return
      }
      onClose()
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
              {img.bases && img.bases.length > 0 && (
                <div className="imm-bases" aria-label="Imagens usadas como base">
                  {img.bases.map((b, i) => (
                    <span className="imm-base" key={`${b}-${i}`}>
                      <img src={b} alt={`Imagem base ${i + 1}`} />
                    </span>
                  ))}
                </div>
              )}
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
            {/* imagem + gradiente de geração por cima enquanto a edição roda */}
            <div className={`imm-img-wrap${edit === 'running' ? ' is-running' : ''}${edit === 'done' ? ' is-done' : ''}`}>
              <img className="imm-img" src={img.src} alt={img.prompt} />
              <span className="imm-gen" aria-hidden="true">
                <span className="imm-gen-label">Editando imagem</span>
              </span>
              {edit === 'done' && (
                <span className="imm-done" role="status">
                  <Check size={14} strokeWidth={2.6} />
                  Edição pronta
                </span>
              )}
            </div>

            {/* "Editar" → input: o mesmo elemento muda de tamanho e troca o conteúdo */}
            <div
              ref={editRef}
              className={`imm-edit${edit === 'open' ? ' is-open' : ''}${edit === 'running' ? ' is-busy' : ''}`}
              style={{ '--edit-w': `${editW}px` } as CSSProperties}
            >
              <button
                type="button"
                className="imm-edit-btn"
                onClick={openEdit}
                disabled={edit !== 'idle' && edit !== 'done'}
                tabIndex={edit === 'open' ? -1 : 0}
                aria-hidden={edit === 'open'}
              >
                {edit === 'running' ? (
                  <>
                    <span className="imm-edit-spin" aria-hidden="true" />
                    Editando...
                  </>
                ) : (
                  <>
                    <Pencil size={15} strokeWidth={2} />
                    Editar
                  </>
                )}
              </button>
              <form
                className="imm-edit-field"
                aria-hidden={edit !== 'open'}
                onSubmit={(e) => {
                  e.preventDefault()
                  sendEdit()
                }}
              >
                <input
                  ref={editInputRef}
                  className="imm-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder={listening ? 'Ouvindo...' : 'Descreva a edição que você quer'}
                  tabIndex={edit === 'open' ? 0 : -1}
                  spellCheck={false}
                  aria-label="Comando de edição"
                />
                {listening && (
                  <span className="imm-wave" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} style={{ '--i': i } as CSSProperties} />
                    ))}
                  </span>
                )}
                <button
                  type="button"
                  className={`imm-edit-mic${listening ? ' is-on' : ''}`}
                  aria-label={listening ? 'Parar de ouvir' : 'Falar o comando'}
                  aria-pressed={listening}
                  tabIndex={edit === 'open' ? 0 : -1}
                  onClick={toggleMic}
                >
                  {listening ? <Square size={12} strokeWidth={0} fill="currentColor" /> : <Mic size={17} strokeWidth={1.9} />}
                </button>
                <button
                  type="submit"
                  className={`imm-edit-send${editText.trim() && !listening ? ' is-on' : ''}`}
                  aria-label="Editar imagem"
                  tabIndex={editText.trim() && edit === 'open' ? 0 : -1}
                >
                  <ArrowUp size={17} strokeWidth={2.4} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
