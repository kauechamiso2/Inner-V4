import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Check, Copy, Globe, Link2, Lock, X } from 'lucide-react'
import './context-modal.css'
import './edit-task.css'
import './create-task.css'
import './site-modals.css'

/* telas do modal: principal, alterar endereço, conectar domínio e configurar DNS */
type View = 'main' | 'address' | 'connect' | 'dns'

const DOMAIN_RE = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i

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
  domain: initialDomain = null,
  onChangeUrl,
  onDomainChange,
  onClose,
}: {
  name: string
  /* endereço gratuito: <nome>.<usuário>.innerai.site */
  url: string
  /* domínio próprio já conectado (aguardando DNS) */
  domain?: string | null
  onChangeUrl?: (url: string) => void
  onDomainChange?: (domain: string | null) => void
  onClose: () => void
}) {
  const [closing, setClosing] = useState(false)
  const [view, setView] = useState<View>('main')
  /* o nome do usuário fica fixo no endereço; só a primeira parte muda */
  const dot = url.indexOf('.')
  const [sub, setSub] = useState(url.slice(0, dot))
  const suffix = url.slice(dot)
  const [draftSub, setDraftSub] = useState(sub)
  const [domain, setDomain] = useState<string | null>(initialDomain)
  const [draftDomain, setDraftDomain] = useState('')
  const [copied, setCopied] = useState(false)

  const siteUrl = `${sub}${suffix}`
  const subValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(draftSub)
  const canRename = subValid && draftSub !== sub
  const domainValid = DOMAIN_RE.test(draftDomain.trim())

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }

  /* Esc volta uma tela; na principal, fecha */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (view === 'main') close()
      else setView(view === 'dns' && !domain ? 'connect' : 'main')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, domain])

  const rename = () => {
    if (!canRename) return
    setSub(draftSub)
    onChangeUrl?.(`${draftSub}${suffix}`)
    setView('main')
  }

  const connect = () => {
    if (!domainValid) return
    const d = draftDomain.trim().toLowerCase()
    setDomain(d)
    onDomainChange?.(d)
    setView('dns')
  }

  const removeDomain = () => {
    setDomain(null)
    setDraftDomain('')
    onDomainChange?.(null)
  }

  const copyTarget = () => {
    navigator.clipboard?.writeText(siteUrl).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const head = (title: string, subtitle: string, back?: () => void) => (
    <header className="ctx-modal-head sm-head ss-head">
      {back && (
        <button type="button" className="ss-back" aria-label="Voltar" onClick={back}>
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
      )}
      <div className="ctx-modal-head-text">
        <h2 className="ctx-modal-title">{title}</h2>
        <p className="ctx-modal-sub">{subtitle}</p>
      </div>
      <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
        <X size={18} strokeWidth={2} />
      </button>
    </header>
  )

  let content: ReactNode
  if (view === 'address') {
    content = (
      <>
        {head('Alterar endereço', 'Escolha um novo endereço para o seu site.', () => setView('main'))}
        <div className="ctx-modal-body ss-step">
          <label className="sm-label" htmlFor="ss-sub">
            Endereço do site
          </label>
          <div className={`ss-field${draftSub && !subValid ? ' is-error' : ''}`}>
            <input
              id="ss-sub"
              value={draftSub}
              onChange={(e) => setDraftSub(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && rename()}
              autoFocus
              spellCheck={false}
            />
            <span className="ss-field-suffix">{suffix}</span>
          </div>
          <p className="ss-hint">Use letras, números e hifens. O nome de usuário permanece no endereço.</p>
        </div>
        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="ss-text-btn" onClick={() => setView('main')}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!canRename} onClick={rename}>
            Alterar endereço
          </button>
        </footer>
      </>
    )
  } else if (view === 'connect') {
    content = (
      <>
        {head('Conectar domínio', 'Use um domínio ou subdomínio que você já possui.', () => setView('main'))}
        <div className="ctx-modal-body ss-step">
          <label className="sm-label" htmlFor="ss-domain">
            Seu domínio
          </label>
          <div className="ss-field has-icon">
            <Globe size={17} strokeWidth={1.8} aria-hidden="true" />
            <input
              id="ss-domain"
              value={draftDomain}
              onChange={(e) => setDraftDomain(e.target.value.replace(/^https?:\/\//, '').replace(/\s/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && connect()}
              placeholder="meusite.com ou www.meusite.com"
              autoFocus
              spellCheck={false}
            />
          </div>
          <p className="ss-hint">Na próxima etapa, você verá as instruções para configurar o DNS.</p>
        </div>
        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="ss-text-btn" onClick={() => setView('main')}>
            Cancelar
          </button>
          <button type="button" className="instr-save ss-next" disabled={!domainValid} onClick={connect}>
            Continuar
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </>
    )
  } else if (view === 'dns') {
    content = (
      <>
        {head('Configure seu domínio', 'Adicione o registro abaixo no seu provedor de domínio.', () =>
          setView('main'),
        )}
        <div className="ctx-modal-body ss-step ss-dns">
          <div className="ss-dns-top">
            <span className="ss-dns-domain">{domain}</span>
            <span className="ss-status">
              <span className="ss-status-dot" aria-hidden="true" />
              Aguardando DNS
            </span>
          </div>
          <div className="ss-table" role="table" aria-label="Registro DNS">
            <div className="ss-tr ss-th" role="row">
              <span role="columnheader">Tipo</span>
              <span role="columnheader">Nome</span>
              <span role="columnheader">Destino</span>
            </div>
            <div className="ss-tr" role="row">
              <span role="cell">CNAME</span>
              <span role="cell">{domain}</span>
              <span role="cell">{siteUrl}</span>
            </div>
          </div>
          <button type="button" className="sm-ghost is-sm ss-copy" onClick={copyTarget}>
            {copied ? <Check size={15} strokeWidth={2.2} /> : <Copy size={15} strokeWidth={1.9} />}
            {copied ? 'Destino copiado' : 'Copiar destino'}
          </button>
          <p className="ss-hint">
            Para o domínio raiz, seu provedor precisa oferecer CNAME flattening. Você também pode conectar um
            subdomínio, como www.
          </p>
          <div className="ss-note">
            <Lock size={16} strokeWidth={1.9} aria-hidden="true" />
            <span>
              O domínio só ficará ativo após a validação do DNS. Essa configuração não altera quem pode acessar o
              site.
            </span>
          </div>
        </div>
        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="instr-save" onClick={() => setView('main')}>
            Concluído
          </button>
        </footer>
      </>
    )
  } else {
    content = (
      <>
        {head('Configurações do site', name)}
        <div className="ctx-modal-body ss-body">
          <Section icon={<Globe size={19} strokeWidth={1.8} />} title="Endereço do site" sub="Seu endereço gratuito na Inner AI.">
            <div className="ss-addr">
              <span className="ss-addr-url">{siteUrl}</span>
              <button
                type="button"
                className="sm-ghost is-sm"
                onClick={() => {
                  setDraftSub(sub)
                  setView('address')
                }}
              >
                Alterar
              </button>
            </div>
          </Section>

          <Section icon={<Link2 size={19} strokeWidth={1.8} />} title="Domínio personalizado" sub="Conecte um domínio que você já possui.">
            {domain ? (
              <>
                <div className="ss-addr ss-domain">
                  <span className="ss-addr-text">
                    <span className="ss-addr-url">{domain}</span>
                    <span className="ss-status">
                      <span className="ss-status-dot" aria-hidden="true" />
                      Aguardando configuração de DNS
                    </span>
                  </span>
                  <button type="button" className="sm-ghost is-sm" onClick={() => setView('dns')}>
                    Configurar
                  </button>
                </div>
                <button type="button" className="ss-remove" onClick={removeDomain}>
                  Remover domínio
                </button>
              </>
            ) : (
              <button
                type="button"
                className="sm-ghost"
                onClick={() => {
                  setDraftDomain('')
                  setView('connect')
                }}
              >
                Conectar domínio
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            )}
          </Section>
        </div>
        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="instr-save" onClick={close}>
            Concluído
          </button>
        </footer>
      </>
    )
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className={`ctx-modal sm-modal ss-modal is-${view}`}
        role="dialog"
        aria-modal="true"
        aria-label="Configurações do site"
        onClick={(e) => e.stopPropagation()}
      >
        {/* cada tela entra com um fade curto (key troca o conteúdo) */}
        <div className="ss-view" key={view}>
          {content}
        </div>
      </div>
    </div>,
    document.body,
  )
}
