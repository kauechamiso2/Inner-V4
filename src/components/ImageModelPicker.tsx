import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Search, Sparkles } from 'lucide-react'
import creditsCoin from '../assets/credits.svg'
import { AUTO_MODEL, IMAGE_MODELS } from './imageModels'
import type { ImageModel } from './imageModels'
import { normSearch } from './SearchToggle'
import './model-picker.css'
import './image-gen-controls.css'

/* logo do modelo de imagem; "Automático" usa a estrela de IA */
export function ImageModelLogo({ model, size = 36 }: { model: ImageModel; size?: number }) {
  return (
    <span className={`mp-logo igm-logo${model.logo ? '' : ' is-auto'}`} style={{ '--s': `${size}px` } as CSSProperties} aria-hidden="true">
      {model.logo ? <img src={model.logo} alt="" draggable={false} /> : <Sparkles size={size * 0.48} strokeWidth={2} />}
    </span>
  )
}

/* popover ancorado a um botão da barra (proporção, resolução, "+"):
   abre para cima ou para baixo conforme o espaço, fecha ao clicar fora */
export function BarPopover({
  anchor,
  onClose,
  children,
  label,
  width = 220,
  className = '',
  showLabel = true,
}: {
  anchor: HTMLElement
  onClose: () => void
  children: ReactNode
  label: string
  width?: number
  className?: string
  showLabel?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null)
  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect()
    const h = ref.current?.offsetHeight ?? 300
    const up = window.innerHeight - r.bottom < h + 16 && r.top > window.innerHeight - r.bottom
    const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12)
    setPos(up ? { left, bottom: window.innerHeight - r.top + 8 } : { left, top: r.bottom + 8 })
  }, [anchor, width])
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !anchor.contains(t)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onScroll = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [anchor, onClose])
  return createPortal(
    <div
      ref={ref}
      className={`igp-pop ${className}${pos?.bottom !== undefined ? ' is-up' : ''}`}
      role="menu"
      aria-label={label}
      style={{ width, left: pos?.left ?? -9999, top: pos?.top, bottom: pos?.bottom, visibility: pos ? 'visible' : 'hidden' }}
    >
      {showLabel && <div className="igp-label">{label}</div>}
      {children}
    </div>,
    document.body,
  )
}

/* menu contextual de modelos de imagem (input do Image Generation e drawer das
   ferramentas): busca, logo, nome e créditos */
export function ImageModelMenu({
  anchor,
  selected,
  onSelect,
  onClose,
}: {
  anchor: HTMLElement
  selected: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const nq = normSearch(query)
  const list = IMAGE_MODELS.filter((m) => !nq || normSearch(m.name).includes(nq))
  return (
    <BarPopover anchor={anchor} label="Modelo" width={340} className="igp-models" showLabel={false} onClose={onClose}>
      <label className="igp-search is-top">
        <Search size={15} strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar modelo"
          spellCheck={false}
          autoFocus
        />
      </label>
      <div className="igp-models-list">
        {list.length === 0 && <p className="igp-empty">Nenhum modelo encontrado</p>}
        {list.map((m) => {
          const on = selected === m.id
          return (
            <button
              key={m.id}
              type="button"
              className={`igp-item igp-model${on ? ' is-on' : ''}`}
              role="menuitemradio"
              aria-checked={on}
              onClick={() => {
                onSelect(m.id)
                onClose()
              }}
            >
              <ImageModelLogo model={m} size={26} />
              <span className="igp-model-name">
                {m.name}
                {/* Automático: o modelo que ele está usando, com menos peso */}
                {m.id === 'auto' && <span className="igp-model-auto">{AUTO_MODEL}</span>}
              </span>
              {m.id !== 'auto' && m.credits > 0 && (
                <span className="igp-credits">
                  <img src={creditsCoin} alt="" aria-hidden="true" />
                  {m.credits}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </BarPopover>
  )
}
