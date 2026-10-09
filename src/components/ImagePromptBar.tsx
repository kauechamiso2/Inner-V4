import { useEffect, useId, useState } from 'react'
import { ArrowUp, ChevronDown, CornerDownLeft, Minus, Plus, RectangleHorizontal } from 'lucide-react'
import creditsCoin from '../assets/credits.svg'

/* custo em créditos (protótipo): proporcional à quantidade de imagens */
const CREDITS_PER_IMAGE = 20

/* estrela de IA com preenchimento em gradiente que gira devagar; o glow
   pulsante vem via CSS (.ip-spark-svg). A grande + uma pequena no canto. */
function SparkIcon() {
  const gid = `ip-spark-${useId().replace(/:/g, '')}`
  return (
    <svg className="ip-spark-svg" width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 0.5 0.5"
            to="360 0.5 0.5"
            dur="7s"
            repeatCount="indefinite"
          />
          <stop offset="0%" stopColor="#5b8cff" />
          <stop offset="48%" stopColor="#9a6bff" />
          <stop offset="100%" stopColor="#ff79c0" />
        </linearGradient>
      </defs>
      <path
        d="M11.47 3.2a.56.56 0 0 1 1.06 0l1.1 3.43a4 4 0 0 0 2.6 2.6l3.43 1.1a.56.56 0 0 1 0 1.06l-3.43 1.1a4 4 0 0 0-2.6 2.6l-1.1 3.43a.56.56 0 0 1-1.06 0l-1.1-3.43a4 4 0 0 0-2.6-2.6l-3.43-1.1a.56.56 0 0 1 0-1.06l3.43-1.1a4 4 0 0 0 2.6-2.6Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M18.7 3.05a.38.38 0 0 1 .72 0l.4 1.26a1.5 1.5 0 0 0 .98.98l1.26.4a.38.38 0 0 1 0 .72l-1.26.4a1.5 1.5 0 0 0-.98.98l-.4 1.26a.38.38 0 0 1-.72 0l-.4-1.26a1.5 1.5 0 0 0-.98-.98l-1.26-.4a.38.38 0 0 1 0-.72l1.26-.4a1.5 1.5 0 0 0 .98-.98Z"
        fill={`url(#${gid})`}
      />
    </svg>
  )
}

export type BaseAttachment = { uid: string; src: string }

type Props = {
  value: string
  onValueChange: (v: string) => void
  count: number
  onCountChange: (n: number) => void
  /* imagens anexadas como base ("Usar de base") — compartilhadas pelo pai */
  attachments: BaseAttachment[]
  onRemoveAttachment: (uid: string) => void
  /* dispara a geração (botão "Gerar" ativo) */
  onGenerate: () => void
  /* variante fixada no rodapé (quando o input do topo sai de vista) */
  docked?: boolean
}

/* Input de prompt do pilar de Imagens: começa como uma barra compacta e,
   ao focar/digitar, expande fluidamente para um input de duas linhas com a
   toolbar (modelo, estilo, proporção, qualidade, quantidade). Controles são
   visuais por enquanto; só o stepper de quantidade é funcional.
   O estado (texto/quantidade) é controlado pelo pai para ser compartilhado
   entre a barra do topo e a barra fixada no rodapé. */
export default function ImagePromptBar({
  value,
  onValueChange,
  count,
  onCountChange,
  attachments,
  onRemoveAttachment,
  onGenerate,
  docked = false,
}: Props) {
  const [focused, setFocused] = useState(false)
  const hasAtt = attachments.length > 0
  const open = focused || value.trim().length > 0 || hasAtt
  const canGenerate = value.trim().length > 0 || hasAtt
  /* depois que a expansão termina, liberamos o overflow para o glow do botão
     "escapar" (durante a animação o overflow fica escondido) */
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!open) {
      setSettled(false)
      return
    }
    const t = window.setTimeout(() => setSettled(true), 340)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    <div
      className={`ip-prompt${open ? ' is-open' : ''}${settled ? ' is-settled' : ''}${
        docked ? ' is-docked' : ''
      }`}
    >
      {hasAtt && (
        <div className="ip-attachments">
          {attachments.map((a) => (
            <span className="att att-image" key={a.uid}>
              <img src={a.src} alt="" />
              <button
                type="button"
                className="att-remove"
                aria-label="Remover imagem base"
                onClick={() => onRemoveAttachment(a.uid)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="ip-prompt-top">
        <span className="ip-prompt-spark" aria-hidden="true">
          <SparkIcon />
        </span>
        <textarea
          className="ip-prompt-input"
          placeholder="Digite o que você quer gerar..."
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && canGenerate) {
              e.preventDefault()
              onGenerate()
            }
          }}
          rows={1}
          spellCheck={false}
        />
      </div>

      <div className="ip-prompt-bar">
        <div className="ip-prompt-ctrls">
          <button
            type="button"
            className="ip-pc ip-pc-add"
            aria-label="Adicionar referência"
            tabIndex={open ? 0 : -1}
          >
            <Plus size={16} strokeWidth={2.2} />
          </button>
          <button type="button" className="ip-pc ip-pc-drop" tabIndex={open ? 0 : -1}>
            Nano Banana 2
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          <button type="button" className="ip-pc ip-pc-drop" tabIndex={open ? 0 : -1}>
            Realista
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          <button type="button" className="ip-pc" tabIndex={open ? 0 : -1}>
            <RectangleHorizontal size={14} strokeWidth={2} />
            16:9
          </button>
          <button type="button" className="ip-pc ip-pc-drop" tabIndex={open ? 0 : -1}>
            4K
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          <div className="ip-stepper">
            <button
              type="button"
              aria-label="Menos imagens"
              disabled={count <= 1}
              tabIndex={open ? 0 : -1}
              onClick={() => onCountChange(Math.max(1, count - 1))}
            >
              <Minus size={14} strokeWidth={2.4} />
            </button>
            <span className="ip-stepper-val">{count}/4</span>
            <button
              type="button"
              aria-label="Mais imagens"
              disabled={count >= 4}
              tabIndex={open ? 0 : -1}
              onClick={() => onCountChange(Math.min(4, count + 1))}
            >
              <Plus size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="ip-prompt-send">
          {canGenerate && (
            <span className="ip-credits" title={`${count * CREDITS_PER_IMAGE} créditos`}>
              <img src={creditsCoin} alt="" aria-hidden="true" />
              {count * CREDITS_PER_IMAGE}
            </span>
          )}
          <button
            type="button"
            className={`ip-prompt-go${canGenerate ? ' is-ready' : ''}`}
            aria-label="Gerar imagem"
            tabIndex={open ? 0 : -1}
            onClick={canGenerate ? onGenerate : undefined}
          >
            <span className="ip-go-arrow" aria-hidden="true">
              <ArrowUp size={18} strokeWidth={2.4} />
            </span>
            <span className="ip-go-text">
              Gerar
              <CornerDownLeft className="ip-go-enter" size={14} strokeWidth={2.2} aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
