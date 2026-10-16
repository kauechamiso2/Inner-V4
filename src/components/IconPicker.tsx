import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { PROJECT_COLORS, PROJECT_ICONS } from './projectIcons'
import './icon-picker.css'

const norm = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/* seletor de ícone + cor do projeto (popover abaixo do botão) */
export default function IconPicker({
  icon,
  color,
  onIcon,
  onColor,
  onClose,
}: {
  icon: string
  color: string
  onIcon: (id: string) => void
  onColor: (c: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const nq = norm(q.trim())
  const icons = PROJECT_ICONS.filter((i) => !nq || norm(i.keywords + ' ' + i.id).includes(nq))

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!ref.current?.contains(t) && !t.closest('.np-icon-btn')) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [onClose])

  return (
    <div className="ip-pick" ref={ref} role="dialog" aria-label="Ícone e cor">
      <input
        className="ip-pick-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar emojis"
        autoFocus
        spellCheck={false}
      />
      <div className="ip-pick-colors" role="radiogroup" aria-label="Cor">
        {PROJECT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === color}
            aria-label={`Cor ${c}`}
            className={`ip-pick-color${c === color ? ' is-on' : ''}`}
            style={{ background: c }}
            onClick={() => onColor(c)}
          >
            {c === color && <Check size={13} strokeWidth={3} color="#fff" />}
          </button>
        ))}
      </div>
      <div className="ip-pick-grid" role="listbox" aria-label="Ícones">
        {icons.map(({ id }) => (
          <button
            key={id}
            type="button"
            role="option"
            aria-selected={id === icon}
            aria-label={id}
            className={`ip-pick-icon${id === icon ? ' is-on' : ''}`}
            onClick={() => onIcon(id)}
          >
            <span className="ip-pick-emoji">{id}</span>
          </button>
        ))}
        {icons.length === 0 && <p className="ip-pick-empty">Nenhum emoji para "{q.trim()}"</p>}
      </div>
    </div>
  )
}
