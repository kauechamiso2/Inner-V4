import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import './dropdown.css'

export type DropdownOption = { value: string; label: string; icon?: ReactNode }

/* Dropdown da plataforma (substitui o <select> nativo): gatilho no estilo do
   campo e lista em popover. A lista vai para o body (posição fixa) para não ser
   cortada pelo scroll dos modais. Teclado: setas, Enter, Esc e letras. */
export default function Dropdown({
  id,
  value,
  onChange,
  options,
  size = 'md',
  ariaLabel,
  menuWidth,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: DropdownOption[]
  /* md: campo de formulário (44px); sm: filtro compacto (36px) */
  size?: 'md' | 'sm'
  ariaLabel?: string
  /* largura mínima da lista (padrão: a do gatilho) */
  menuWidth?: number
}) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value) ?? options[0]
  const withIcons = options.some((o) => o.icon)

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    const want = Math.min(options.length * 38 + 12, 300)
    const up = window.innerHeight - r.bottom < want + 16 && r.top > want + 16
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left: r.left, width: Math.max(r.width, menuWidth ?? 0), up })
  }

  const show = () => {
    place()
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setClosing(false)
    setOpen(true)
  }
  const hide = (focus = true) => {
    if (!open) return
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 120)
    if (focus) btnRef.current?.focus()
  }
  const pick = (v: string) => {
    onChange(v)
    hide()
  }

  /* item escolhido visível ao abrir (listas longas, como horário) */
  useLayoutEffect(() => {
    if (!open || closing) return
    const el = listRef.current?.querySelector<HTMLElement>('.dd-item.is-active')
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, active, closing])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!listRef.current?.contains(t) && !btnRef.current?.contains(t)) hide(false)
    }
    /* scroll de fora (modal/página) fecha; scroll da própria lista não */
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return
      hide(false)
    }
    const onResize = () => hide(false)
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        show()
      }
      return
    }
    if (e.key === 'Escape') {
      /* o Esc fecha só a lista, não o modal */
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      hide()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(options.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(options[active].value)
    } else if (e.key === 'Tab') {
      hide(false)
    } else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (i >= 0) setActive(i)
    }
  }

  /* o Esc do modal escuta no document: com a lista aberta, ele não fecha o modal */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        hide()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const listId = id ? `${id}-list` : undefined

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        className={`dd-trigger is-${size}${open && !closing ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? hide() : show())}
        onKeyDown={onKeyDown}
      >
        {selected?.icon && <span className="dd-trigger-ic">{selected.icon}</span>}
        <span className="dd-trigger-label">{selected?.label}</span>
        <ChevronDown className="dd-caret" size={size === 'sm' ? 15 : 16} strokeWidth={2} aria-hidden="true" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            className={`dd-list${pos.up ? ' is-up' : ''}${closing ? ' is-closing' : ''}`}
            style={
              {
                left: pos.left,
                minWidth: pos.width,
                ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
              } as CSSProperties
            }
          >
            {options.map((o, i) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`dd-item${i === active ? ' is-active' : ''}${o.value === value ? ' is-selected' : ''}`}
                onPointerEnter={() => setActive(i)}
                onClick={() => pick(o.value)}
                tabIndex={-1}
              >
                {/* com ícones na lista, quem não tem ganha o espaço vazio para alinhar */}
                {(o.icon || withIcons) && <span className="dd-item-ic">{o.icon}</span>}
                <span className="dd-item-label">{o.label}</span>
                {o.value === value && <Check className="dd-check" size={15} strokeWidth={2.4} aria-hidden="true" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
