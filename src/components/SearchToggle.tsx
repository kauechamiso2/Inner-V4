import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import './search-toggle.css'

/* normaliza para busca (sem acento, minúsculo) */
export const normSearch = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/* Busca dos pilares (mesmo padrão em todos): ícone com tooltip "Buscar";
   ao clicar vira um campo ativo que filtra enquanto digita. X ou Esc fecha e limpa */
export default function SearchToggle({
  value,
  onChange,
  placeholder = 'Buscar',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const close = () => {
    onChange('')
    setOpen(false)
  }
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) {
    return (
      <button className="lib-new is-ghost" type="button" aria-label="Buscar" onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="8.2" cy="8.2" r="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 12l3.4 3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
          Buscar
        </span>
      </button>
    )
  }
  return (
    <div className="st-box" role="search">
      <Search size={15} strokeWidth={2} aria-hidden="true" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && close()}
        onBlur={() => !value && setOpen(false)}
        placeholder={placeholder}
        spellCheck={false}
        aria-label={placeholder}
      />
      <button type="button" className="st-clear" aria-label="Fechar busca" onMouseDown={(e) => e.preventDefault()} onClick={close}>
        <X size={14} strokeWidth={2.2} />
      </button>
    </div>
  )
}

/* estado vazio da busca */
export function SearchEmpty({ query }: { query: string }) {
  return (
    <div className="st-empty">
      <p className="st-empty-title">Nada encontrado para "{query.trim()}"</p>
      <p className="st-empty-sub">Tente outra palavra ou confira a grafia.</p>
    </div>
  )
}
