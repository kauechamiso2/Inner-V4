import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Globe, Link2, Search, ShoppingBag, X } from 'lucide-react'
import './context-modal.css'
import './edit-task.css'
import './create-task.css'
import './site-modals.css'

/* resultados mockados da busca de domínio */
const DOMAIN_RESULTS = [
  { tld: '.com', price: 'R$ 69/ano' },
  { tld: '.com.br', price: 'R$ 40/ano' },
  { tld: '.design', price: 'R$ 129/ano' },
  { tld: '.site', price: 'R$ 19/ano' },
]

function Section({
  icon,
  title,
  sub,
  children,
}: {
  icon: ReactNode
  title: string
  sub: string
  children: ReactNode
}) {
  return (
    <section className="ss-sec">
      <div className="ss-sec-head">
        <span className="ss-sec-ic" aria-hidden="true">
          {icon}
        </span>
        <span className="ss-sec-text">
          <span className="ss-sec-title">{title}</span>
          <span className="ss-sec-sub">{sub}</span>
        </span>
      </div>
      {children}
    </section>
  )
}

export default function SiteSettingsModal({
  name,
  url,
  onClose,
}: {
  name: string
  url: string
  onClose: () => void
}) {
  const [closing, setClosing] = useState(false)
  /* endereço gratuito: subdomínio editável + sufixo fixo */
  const suffix = url.includes('.') ? url.slice(url.indexOf('.')) : '.innerai.site'
  const [sub, setSub] = useState(url.split('.')[0])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(sub)
  const [connectOpen, setConnectOpen] = useState(false)
  const [domain, setDomain] = useState('')
  const [buyOpen, setBuyOpen] = useState(false)
  const [query, setQuery] = useState('')
  const base = (query.trim() || sub).toLowerCase().replace(/[^a-z0-9-]/g, '') || 'meusite'

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

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal sm-modal ss-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Configurações do site"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Configurações do site</h2>
            <p className="ctx-modal-sub">{name}</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body ss-body">
          <Section icon={<Globe size={19} strokeWidth={1.8} />} title="Endereço do site" sub="Seu endereço gratuito na Inner AI.">
            <div className={`ss-addr${editing ? ' is-editing' : ''}`}>
              {editing ? (
                <span className="ss-addr-edit">
                  <input
                    className="ss-addr-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && draft) {
                        setSub(draft)
                        setEditing(false)
                      }
                    }}
                    autoFocus
                    spellCheck={false}
                    aria-label="Endereço"
                  />
                  <span className="ss-addr-suffix">{suffix}</span>
                </span>
              ) : (
                <span className="ss-addr-url">
                  {sub}
                  {suffix}
                </span>
              )}
              <button
                type="button"
                className="sm-ghost is-sm"
                disabled={editing && !draft}
                onClick={() => {
                  if (editing) {
                    setSub(draft)
                    setEditing(false)
                  } else {
                    setDraft(sub)
                    setEditing(true)
                  }
                }}
              >
                {editing ? 'Salvar' : 'Alterar'}
              </button>
            </div>
          </Section>

          <Section icon={<Link2 size={19} strokeWidth={1.8} />} title="Domínio personalizado" sub="Conecte um domínio que você já possui.">
            {connectOpen ? (
              <div className="ss-inline">
                <input
                  className="et-input"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="seudominio.com"
                  autoFocus
                  spellCheck={false}
                  aria-label="Seu domínio"
                />
                <button type="button" className="instr-save" disabled={!domain.trim()}>
                  Conectar
                </button>
              </div>
            ) : (
              <button type="button" className="sm-ghost" onClick={() => setConnectOpen(true)}>
                Conectar domínio
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            )}
          </Section>

          <Section
            icon={<ShoppingBag size={19} strokeWidth={1.8} />}
            title="Comprar um novo domínio"
            sub="Encontre o nome ideal para o seu próximo site."
          >
            {buyOpen ? (
              <div className="ss-buy">
                <div className="ss-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Digite o nome que você quer"
                    autoFocus
                    spellCheck={false}
                    aria-label="Buscar domínio"
                  />
                </div>
                <ul className="ss-results">
                  {DOMAIN_RESULTS.map((r, i) => (
                    <li key={r.tld} className="ss-result" style={{ animationDelay: `${i * 40}ms` }}>
                      <span className="ss-result-name">
                        {base}
                        <strong>{r.tld}</strong>
                      </span>
                      <span className="ss-result-price">{r.price}</span>
                      <button type="button" className="sm-ghost is-sm">
                        Comprar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <button type="button" className="sm-ghost" onClick={() => setBuyOpen(true)}>
                Buscar domínio
                <Search size={16} strokeWidth={2} />
              </button>
            )}
          </Section>
        </div>

        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="instr-save" onClick={close}>
            Concluído
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
