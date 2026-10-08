import { useState } from 'react'
import { ArrowUp, ChevronDown, Gem, Minus, Plus, RectangleHorizontal } from 'lucide-react'

/* estrela de IA (filled) — grande + uma pequena no canto */
function SparkIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.47 3.2a.56.56 0 0 1 1.06 0l1.1 3.43a4 4 0 0 0 2.6 2.6l3.43 1.1a.56.56 0 0 1 0 1.06l-3.43 1.1a4 4 0 0 0-2.6 2.6l-1.1 3.43a.56.56 0 0 1-1.06 0l-1.1-3.43a4 4 0 0 0-2.6-2.6l-3.43-1.1a.56.56 0 0 1 0-1.06l3.43-1.1a4 4 0 0 0 2.6-2.6Z" />
      <path d="M18.7 3.05a.38.38 0 0 1 .72 0l.4 1.26a1.5 1.5 0 0 0 .98.98l1.26.4a.38.38 0 0 1 0 .72l-1.26.4a1.5 1.5 0 0 0-.98.98l-.4 1.26a.38.38 0 0 1-.72 0l-.4-1.26a1.5 1.5 0 0 0-.98-.98l-1.26-.4a.38.38 0 0 1 0-.72l1.26-.4a1.5 1.5 0 0 0 .98-.98Z" />
    </svg>
  )
}

/* Input de prompt do pilar de Imagens: começa como uma barra compacta e,
   ao focar/digitar, expande fluidamente para um input de duas linhas com a
   toolbar (modelo, estilo, proporção, qualidade, quantidade). Controles são
   visuais por enquanto; só o stepper de quantidade é funcional. */
export default function ImagePromptBar() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [count, setCount] = useState(1)
  const open = focused || value.trim().length > 0
  const canGenerate = value.trim().length > 0

  return (
    <div className={`ip-prompt${open ? ' is-open' : ''}`}>
      <div className="ip-prompt-top">
        <span className="ip-prompt-spark" aria-hidden="true">
          <SparkIcon />
        </span>
        <textarea
          className="ip-prompt-input"
          placeholder="Digite o que você quer gerar..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          spellCheck={false}
        />
      </div>

      <div className="ip-prompt-bar">
        <div className="ip-prompt-ctrls">
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
          <button type="button" className="ip-pc" tabIndex={open ? 0 : -1}>
            <Gem size={14} strokeWidth={2} />
            4K
          </button>
          <div className="ip-stepper">
            <button
              type="button"
              aria-label="Menos imagens"
              disabled={count <= 1}
              tabIndex={open ? 0 : -1}
              onClick={() => setCount((c) => Math.max(1, c - 1))}
            >
              <Minus size={14} strokeWidth={2.4} />
            </button>
            <span className="ip-stepper-val">{count}/4</span>
            <button
              type="button"
              aria-label="Mais imagens"
              disabled={count >= 4}
              tabIndex={open ? 0 : -1}
              onClick={() => setCount((c) => Math.min(4, c + 1))}
            >
              <Plus size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`ip-prompt-go${canGenerate ? ' is-ready' : ''}`}
          aria-label="Gerar imagem"
          tabIndex={open ? 0 : -1}
        >
          <ArrowUp size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
