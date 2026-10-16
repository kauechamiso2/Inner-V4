import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, Info, Search, Star, X, Zap } from 'lucide-react'
import { CHAT_MODELS, MODEL_TIERS, modelPrefs } from './chatModels'
import type { ChatModel, ModelTier } from './chatModels'
import { ASSISTANTS, ASSISTANT_AVATAR, SEGMENT_COLOR } from './AssistentesPage'
import type { Assistant } from './AssistentesPage'
import { normSearch } from './SearchToggle'
import './context-modal.css'
import './model-picker.css'

/* logo do modelo num círculo branco; Inner AI Fusion usa o orb próprio */
export function ModelLogo({ model, size = 40 }: { model: ChatModel; size?: number }) {
  return (
    <span className="mp-logo" style={{ '--s': `${size}px` } as CSSProperties} aria-hidden="true">
      {model.logo ? <img src={model.logo} alt="" draggable={false} /> : <span className="mp-fusion" />}
    </span>
  )
}

const TIER_ICON: Record<ModelTier, ReactNode> = {
  rapido: <Zap className="mp-tier-ic is-fast" size={13} strokeWidth={2.2} />,
  avancado: (
    <span className="mp-tier-ic is-adv" aria-hidden="true">
      <Zap size={12} strokeWidth={2.2} />
      <Zap size={12} strokeWidth={2.2} />
    </span>
  ),
  raciocinio: null,
}

/* Seletor de modelos do Chat com modelos: abas (Modelos de IA / Assistentes),
   busca, favoritos com estrela e os modelos por categoria */
export default function ModelPicker({
  selected,
  assistant,
  onSelect,
  onSelectAssistant,
  onClose,
}: {
  selected: string
  assistant: string | null
  onSelect: (id: string) => void
  onSelectAssistant: (a: Assistant) => void
  onClose: () => void
}) {
  const [closing, setClosing] = useState(false)
  const [tab, setTab] = useState<'modelos' | 'assistentes'>(assistant ? 'assistentes' : 'modelos')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(modelPrefs.favorites)
  const inputRef = useRef<HTMLInputElement>(null)
  const nq = normSearch(query)

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    inputRef.current?.focus()
  }, [tab])

  const toggleFav = (id: string) =>
    setFavorites((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
      modelPrefs.favorites = next
      return next
    })
  const pick = (id: string) => {
    onSelect(id)
    close()
  }

  const results = useMemo(
    () => (nq ? CHAT_MODELS.filter((m) => normSearch(m.name).includes(nq)) : []),
    [nq],
  )
  const favModels = favorites.map((id) => CHAT_MODELS.find((m) => m.id === id)).filter(Boolean) as ChatModel[]
  const assistants = ASSISTANTS.filter((a) => !nq || normSearch(`${a.name} ${a.desc} ${a.segment}`).includes(nq))
  const segments = [...new Set(assistants.map((a) => a.segment))]

  const row = (m: ChatModel, key: string) => {
    const fav = favorites.includes(m.id)
    const on = m.id === selected && !assistant
    return (
      <div className={`mp-row${on ? ' is-on' : ''}`} key={key}>
        <button type="button" className="mp-row-main" onClick={() => pick(m.id)} aria-pressed={on}>
          <ModelLogo model={m} />
          <span className="mp-name">{m.name}</span>
        </button>
        <span className="mp-info" tabIndex={0} aria-label={`Sobre ${m.name}`}>
          <Info size={14} strokeWidth={1.9} />
          <span className="mp-tip" role="tooltip">
            {m.desc}
          </span>
        </span>
        <span className="mp-row-end">
          {on && <Check className="mp-check" size={17} strokeWidth={2.4} aria-label="Selecionado" />}
          <button
            type="button"
            className={`mp-star${fav ? ' is-on' : ''}`}
            aria-label={fav ? `Tirar ${m.name} dos favoritos` : `Favoritar ${m.name}`}
            aria-pressed={fav}
            onClick={() => toggleFav(m.id)}
          >
            <Star size={18} strokeWidth={1.8} />
          </button>
        </span>
      </div>
    )
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal mp-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Escolher modelo"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ctx-modal-close mp-close" type="button" aria-label="Fechar" onClick={close}>
          <X size={18} strokeWidth={2} />
        </button>

        <div className="mp-top">
          <div className="mp-tabs" role="tablist">
            <span className={`mp-tab-thumb${tab === 'assistentes' ? ' is-right' : ''}`} aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'modelos'}
              className={`mp-tab${tab === 'modelos' ? ' is-on' : ''}`}
              onClick={() => setTab('modelos')}
            >
              Modelos de IA
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'assistentes'}
              className={`mp-tab${tab === 'assistentes' ? ' is-on' : ''}`}
              onClick={() => setTab('assistentes')}
            >
              Assistentes
            </button>
          </div>
          <label className="mp-search">
            <Search size={17} strokeWidth={1.9} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'modelos' ? 'Buscar modelo' : 'Buscar assistente'}
              spellCheck={false}
            />
            {query && (
              <button type="button" className="mp-search-clear" aria-label="Limpar busca" onClick={() => setQuery('')}>
                <X size={14} strokeWidth={2.2} />
              </button>
            )}
          </label>
        </div>

        <div className="mp-body" key={tab}>
          {tab === 'modelos' ? (
            nq ? (
              results.length ? (
                <section className="mp-section">
                  <h3 className="mp-section-title">Resultados</h3>
                  {results.map((m) => row(m, `r-${m.id}`))}
                </section>
              ) : (
                <p className="mp-empty">Nenhum modelo encontrado para “{query.trim()}”</p>
              )
            ) : (
              <>
                {favModels.length > 0 && (
                  <section className="mp-section">
                    <h3 className="mp-section-title">Favoritos</h3>
                    {favModels.map((m) => row(m, `f-${m.id}`))}
                  </section>
                )}
                {MODEL_TIERS.map((t) => (
                  <section className="mp-section" key={t.id}>
                    <h3 className="mp-section-title">
                      {t.label}
                      {TIER_ICON[t.id]}
                    </h3>
                    <p className="mp-section-desc">{t.desc}</p>
                    {CHAT_MODELS.filter((m) => m.tier === t.id && (m.id !== 'fusion' || !favorites.includes('fusion'))).map((m) => row(m, `${t.id}-${m.id}`))}
                  </section>
                ))}
              </>
            )
          ) : assistants.length ? (
            segments.map((seg) => (
              <section className="mp-section" key={seg}>
                <h3 className="mp-section-title">{seg}</h3>
                {assistants
                  .filter((a) => a.segment === seg)
                  .map((a) => {
                    const on = assistant === a.id
                    return (
                      <div className={`mp-row${on ? ' is-on' : ''}`} key={a.id}>
                        <button
                          type="button"
                          className="mp-row-main"
                          aria-pressed={on}
                          onClick={() => {
                            onSelectAssistant(a)
                            close()
                          }}
                        >
                          <span
                            className="mp-logo mp-asst"
                            style={{ '--s': '40px', '--c': SEGMENT_COLOR[a.segment] ?? '#6b7280' } as CSSProperties}
                            aria-hidden="true"
                          >
                            {ASSISTANT_AVATAR[a.id] ? (
                              <img src={ASSISTANT_AVATAR[a.id]} alt="" draggable={false} loading="lazy" />
                            ) : (
                              a.name.charAt(0)
                            )}
                          </span>
                          <span className="mp-asst-text">
                            <span className="mp-name">{a.name}</span>
                            <span className="mp-asst-desc">{a.desc}</span>
                          </span>
                        </button>
                        <span className="mp-row-end">
                          {on && <Check className="mp-check" size={17} strokeWidth={2.4} aria-label="Selecionado" />}
                        </span>
                      </div>
                    )
                  })}
              </section>
            ))
          ) : (
            <p className="mp-empty">Nenhum assistente encontrado para “{query.trim()}”</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
