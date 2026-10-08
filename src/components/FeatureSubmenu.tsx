import { useMemo, useState } from 'react'
import searchIcon from '../assets/library/search.svg'
import type { MentionItem } from './MentionMenu'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

type Props = {
  items: MentionItem[]
  placeholder: string
  ariaLabel: string
  mode: 'agente' | 'chat'
  onSelect: (item: MentionItem) => void
  /* "sem ação por enquanto" (ex.: Prompts): linhas não disparam seleção */
  noAction?: boolean
}

/* Submenu genérico em cascata para listas de ações (Integrações, Prompts,
   Ferramentas). Mesma moldura dos submenus da Biblioteca. */
export default function FeatureSubmenu({
  items,
  placeholder,
  ariaLabel,
  mode,
  onSelect,
  noAction = false,
}: Props) {
  const [query, setQuery] = useState('')
  const q = normalize(query)
  const filtered = useMemo(
    () => (q ? items.filter((i) => normalize(i.label).includes(q)) : items),
    [q, items],
  )

  return (
    <div className="biblioteca-submenu" role="listbox" aria-label={ariaLabel}>
      <div className="bib-search">
        <img src={searchIcon} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder={placeholder}
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bib-scroll">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`bib-row is-feature${noAction ? ' is-static' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                if (!noAction) onSelect(item)
              }}
            >
              <span className={`mm-icon${item.mono ? ' is-mono' : ''}`}>
                {item.img ? <img src={item.img} alt="" loading="lazy" /> : item.icon}
              </span>
              <span className="bib-label">{item.label}</span>
              {mode === 'chat' && item.agentOnly && <span className="mm-agent">Agent</span>}
            </button>
          ))
        ) : (
          <div className="bib-empty">Sem resultados</div>
        )}
      </div>
    </div>
  )
}
