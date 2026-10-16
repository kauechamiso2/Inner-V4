import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Copy, Globe, Link2, Lock, X } from 'lucide-react'
import './context-modal.css'
import './create-task.css'
import './site-modals.css'

export type SiteAccess = 'private' | 'link' | 'public'

/* textos por tipo de item compartilhado (site ou reunião) */
const COPY = {
  site: {
    title: 'Compartilhar site',
    private: 'Somente você pode acessar este site.',
    link: 'Quem tiver o link consegue ver o site, mas ele não aparece em buscas.',
    public: 'O site fica no ar para qualquer pessoa na internet.',
  },
  meeting: {
    title: 'Compartilhar reunião',
    private: 'Somente você pode ver o resumo, a transcrição e a gravação.',
    link: 'Quem tiver o link vê o resumo, a transcrição e a gravação.',
    public: 'Qualquer pessoa na internet pode ver esta reunião.',
  },
}
const accessFor = (kind: keyof typeof COPY): { id: SiteAccess; label: string; help: string; icon: typeof Lock }[] => [
  { id: 'private', label: 'Apenas eu', help: COPY[kind].private, icon: Lock },
  { id: 'link', label: 'Qualquer pessoa com o link', help: COPY[kind].link, icon: Link2 },
  { id: 'public', label: 'Público', help: COPY[kind].public, icon: Globe },
]

export default function ShareSiteModal({
  name,
  url,
  access: initial,
  onClose,
  onSave,
  kind = 'site',
  icon,
}: {
  /* o que está sendo compartilhado (muda os textos) e o ícone do item */
  kind?: 'site' | 'meeting'
  icon?: ReactNode
  name: string
  url: string
  access: SiteAccess
  onClose: () => void
  onSave: (access: SiteAccess) => void
}) {
  const [closing, setClosing] = useState(false)
  const ACCESS = accessFor(kind)
  const [access, setAccess] = useState<SiteAccess>(initial)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const pickRef = useRef<HTMLDivElement>(null)
  const cur = ACCESS.find((a) => a.id === access) ?? ACCESS[0]
  const CurIcon = cur.icon
  const link = `https://${url}`

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (open) setOpen(false)
      else close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!pickRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal sm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={COPY[kind].title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">{COPY[kind].title}</h2>
            <p className="ctx-modal-sub">{name}</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body sm-body">
          <div className="sm-site">
            {icon ?? <Globe size={20} strokeWidth={1.7} aria-hidden="true" />}
            <span className="sm-site-text">
              <span className="sm-site-name">{name}</span>
              <span className="sm-site-url">{url}</span>
            </span>
          </div>

          <div className="sm-field">
            <span className="sm-label">Quem pode acessar</span>
            <div className="sm-pick" ref={pickRef}>
              <button
                type="button"
                className={`sm-pick-btn${open ? ' is-open' : ''}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                <CurIcon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{cur.label}</span>
                <ChevronDown className="sm-pick-caret" size={17} strokeWidth={2} aria-hidden="true" />
              </button>
              {open && (
                <div className="task-menu sm-pick-menu" role="listbox">
                  {ACCESS.map((a) => {
                    const Icon = a.icon
                    return (
                      <button
                        key={a.id}
                        type="button"
                        role="option"
                        aria-selected={a.id === access}
                        className="task-menu-item sm-opt"
                        onClick={() => {
                          setAccess(a.id)
                          setOpen(false)
                        }}
                      >
                        <Icon size={15} strokeWidth={1.9} />
                        <span className="sm-opt-label">{a.label}</span>
                        {a.id === access && <Check className="sm-opt-check" size={15} strokeWidth={2.2} />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <p className="sm-help" key={access}>
              {cur.help}
            </p>
          </div>

          <div className="sm-link">
            <Link2 size={17} strokeWidth={1.8} aria-hidden="true" />
            <span className="sm-link-url">{link}</span>
            <button type="button" className="sm-icon-btn" aria-label={copied ? 'Copiado' : 'Copiar link'} onClick={copy}>
              {copied ? <Check size={16} strokeWidth={2.2} /> : <Copy size={16} strokeWidth={1.9} />}
            </button>
          </div>
        </div>

        <footer className="ctx-modal-foot sm-foot">
          <button type="button" className="sm-ghost" onClick={copy}>
            {copied ? <Check size={16} strokeWidth={2.2} /> : <Link2 size={16} strokeWidth={1.9} />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>
          <button
            type="button"
            className="instr-save"
            onClick={() => {
              onSave(access)
              close()
            }}
          >
            Salvar
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
