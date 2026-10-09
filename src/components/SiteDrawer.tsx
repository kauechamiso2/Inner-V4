import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Pencil,
  X,
} from 'lucide-react'
import type { SiteDraft } from './sites'
import { USER_NAME } from './greeting'
import './task-drawer.css'
import './site-drawer.css'

/* projetos fictícios da primeira versão (o usuário ainda não enviou os dele) */
const PROJECTS = [
  {
    title: 'Vita',
    tag: 'App de saúde',
    desc: 'Agendamento de consultas em três toques',
    cover: 'linear-gradient(135deg, #d9f2e6 0%, #9fd8bf 100%)',
    ink: '#1d5c45',
  },
  {
    title: 'Nova Pay',
    tag: 'Fintech',
    desc: 'Um checkout que converte 23% mais',
    cover: 'linear-gradient(135deg, #e4e1ff 0%, #a9a1f5 100%)',
    ink: '#3b2f9a',
  },
  {
    title: 'Órbita',
    tag: 'Design system',
    desc: '120 componentes para 6 produtos',
    cover: 'linear-gradient(135deg, #ffe6d6 0%, #f6b28f 100%)',
    ink: '#8a3d17',
  },
  {
    title: 'Mercato',
    tag: 'Dashboard B2B',
    desc: 'Vendas em tempo real para varejistas',
    cover: 'linear-gradient(135deg, #e0eefc 0%, #97c1ef 100%)',
    ink: '#1c4f86',
  },
]

/* prévia do site gerado: página de portfólio completa dentro de uma moldura de navegador */
function PortfolioPreview() {
  return (
    <div className="sp-site">
      <nav className="sp-nav">
        <span className="sp-logo">{USER_NAME}.</span>
        <span className="sp-links">
          <span>Projetos</span>
          <span>Sobre</span>
          <span className="sp-cta">Contato</span>
        </span>
      </nav>

      <header className="sp-hero">
        <span className="sp-badge">
          <span className="sp-badge-dot" aria-hidden="true" />
          Disponível para novos projetos
        </span>
        <h1 className="sp-h1">
          Olá, eu sou o {USER_NAME}.<br />
          Desenho produtos <em>simples</em> para problemas complexos.
        </h1>
        <p className="sp-lead">
          Designer de produto em São Paulo. Há 8 anos ajudo startups e empresas a transformar ideias em
          experiências que as pessoas gostam de usar.
        </p>
      </header>

      <section className="sp-section">
        <div className="sp-section-head">
          <h2>Projetos selecionados</h2>
          <span>2022 · 2025</span>
        </div>
        <div className="sp-grid">
          {PROJECTS.map((p, i) => (
            <article className="sp-card" key={p.title} style={{ '--i': i } as CSSProperties}>
              <div className="sp-cover" style={{ background: p.cover }}>
                <span className="sp-cover-mark" style={{ color: p.ink }}>
                  {p.title}
                </span>
                <span className="sp-cover-ui" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
              <div className="sp-card-meta">
                <span className="sp-card-title">{p.title}</span>
                <span className="sp-card-tag">{p.tag}</span>
              </div>
              <p className="sp-card-desc">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sp-about">
        <h2>Sobre</h2>
        <p>
          Acredito que bom design é aquele que some: a pessoa resolve o que precisa e segue o dia. Trabalho
          perto de engenharia e negócio, do primeiro rascunho ao lançamento.
        </p>
        <div className="sp-stats">
          <span>
            <strong>8+</strong> anos de experiência
          </span>
          <span>
            <strong>40</strong> produtos lançados
          </span>
          <span>
            <strong>12</strong> prêmios de design
          </span>
        </div>
      </section>

      <footer className="sp-foot">
        <h2>Vamos conversar?</h2>
        <span className="sp-mail">ola@kaue.design</span>
      </footer>
    </div>
  )
}

/* miniatura da prévia (card no pilar de Sites): o site renderiza na largura
   do drawer e é reduzido para caber no thumb */
const MINI_W = 720
export function SiteMiniPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / MINI_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="sd-mini" ref={ref} aria-hidden="true">
      <div className="sd-mini-page" style={{ width: MINI_W, transform: `scale(${scale})` }}>
        <PortfolioPreview />
      </div>
    </div>
  )
}

/* tela cheia: o painel interno vira fixed (mesma posição do drawer) e a
   largura anima até a viewport; ao sair, anima de volta e só então volta ao fluxo */
type FullState = 'off' | 'growing' | 'on' | 'shrinking'

export default function SiteDrawer({
  site,
  closing,
  onClose,
  onEdit,
}: {
  site: SiteDraft
  closing: boolean
  onClose: () => void
  /* só quando aberto pelo pilar de Sites: volta ao chat onde o site foi criado */
  onEdit?: () => void
}) {
  const [full, setFull] = useState<FullState>('off')
  const isFull = full === 'growing' || full === 'on'

  const toggleFull = () => {
    if (full === 'off' || full === 'shrinking') {
      setFull('growing')
      requestAnimationFrame(() => requestAnimationFrame(() => setFull('on')))
    } else {
      setFull('shrinking')
    }
  }

  /* Esc sai da tela cheia antes de fechar o drawer */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (isFull) setFull('shrinking')
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, isFull])

  const fixedCls = full === 'off' ? '' : ' is-fixed'
  const fullCls = full === 'on' ? ' is-full' : ''

  return (
    <aside className={`app-drawer is-site${closing ? ' is-closing' : ''}`} aria-label={`Site: ${site.name}`}>
      <div
        className={`app-drawer-inner sd-inner${fixedCls}${fullCls}`}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'width' && full === 'shrinking') setFull('off')
        }}
      >
        <header className="sd-header">
          <div className="sd-side" />

          <div className="sd-text">
            <span className="sd-name">{site.name}</span>
            <a className="sd-url" href={`https://${site.url}`} onClick={(e) => e.preventDefault()}>
              <span>{site.url}</span>
              <ArrowUpRight size={15} strokeWidth={1.9} aria-hidden="true" />
            </a>
          </div>

          <div className="sd-side is-end">
            {onEdit && (
              <button type="button" className="sd-edit" onClick={onEdit}>
                <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                Editar
              </button>
            )}
            <span className="sd-pill">
              <button
                type="button"
                className="sd-btn"
                aria-label={isFull ? 'Sair da tela cheia' : 'Ver em tela cheia'}
                onClick={toggleFull}
              >
                {isFull ? <Minimize2 size={17} strokeWidth={1.9} /> : <Maximize2 size={17} strokeWidth={1.9} />}
              </button>
              <button type="button" className="sd-btn" aria-label="Fechar" onClick={onClose}>
                <X size={18} strokeWidth={2} />
              </button>
            </span>
          </div>
        </header>

        <div className="sd-viewport">
          <PortfolioPreview />
        </div>
      </div>
    </aside>
  )
}
