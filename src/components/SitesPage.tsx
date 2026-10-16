import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './tasks-page.css'
import './sites-page.css'
import './collection-detail.css'
import { Check, Eye, Globe, Link2, Lock, MoreHorizontal, Pencil, Settings2, Share2 } from 'lucide-react'
import portfolioThumb from '../assets/sites/portfolio.png'
import saasThumb from '../assets/sites/saas.png'
import ShareSiteModal from './ShareSiteModal'
import SearchToggle, { SearchEmpty, normSearch } from './SearchToggle'
import type { SiteAccess } from './ShareSiteModal'
import SiteSettingsModal from './SiteSettingsModal'
import { SiteMiniPreview } from './SiteDrawer'
import type { SiteDraft } from './sites'

type Site = {
  id: string
  title: string
  url: string
  visibility: SiteAccess
  date: string
  /* sem thumb: miniatura ao vivo da prévia (sites criados pelo agente) */
  thumb?: string
  draft?: SiteDraft
}

const SITES: Site[] = [
  {
    id: 's1',
    title: 'Kauê Chamiso | UX Design',
    url: 'ux-design.kaue.innerai.site',
    visibility: 'private',
    date: 'Ontem',
    thumb: portfolioThumb,
  },
  {
    id: 's2',
    title: 'Smart Analytics | Landing',
    url: 'smart-analytics.kaue.innerai.site',
    visibility: 'public',
    date: 'há 3 dias',
    thumb: saasThumb,
  },
  { id: 's3', title: 'Inner Summit 2026 | Evento', url: 'summit.kaue.innerai.site', visibility: 'public', date: 'há 2 horas' },
  { id: 's4', title: 'Cardápio Bella Vita', url: 'bella-vita.kaue.innerai.site', visibility: 'link', date: 'há 5 dias' },
  { id: 's5', title: 'Portal de Pessoas | RH', url: 'portal-rh.kaue.innerai.site', visibility: 'private', date: 'há 3 semanas' },
  { id: 's6', title: 'Lista de espera do app', url: 'waitlist.kaue.innerai.site', visibility: 'link', date: 'há 2 meses' },
]

/* idade aproximada a partir da data do card */
const ageOf = (d: string) => (/agora|hora|minuto|hoje/i.test(d) ? 'day' : /ontem|dias?/i.test(d) ? 'week' : 'older')

/* filtro (menu): grupos se somam (E), opções do mesmo grupo (OU) */
type SiteRow = Site & { domain: string | null }
const SITE_FILTER_GROUPS: { label: string; items: { id: string; label: string; test: (s: SiteRow) => boolean }[] }[] = [
  {
    label: 'Acesso',
    items: [
      { id: 'private', label: 'Só você', test: (s) => s.visibility === 'private' },
      { id: 'link', label: 'Com o link', test: (s) => s.visibility === 'link' },
      { id: 'public', label: 'Publicados', test: (s) => s.visibility === 'public' },
    ],
  },
  {
    label: 'Modificado',
    items: [
      { id: 'day', label: 'Últimas 24 horas', test: (s) => ageOf(s.date) === 'day' },
      { id: 'week', label: 'Últimos 7 dias', test: (s) => ageOf(s.date) !== 'older' },
      { id: 'older', label: 'Mais antigos', test: (s) => ageOf(s.date) === 'older' },
    ],
  },
  {
    label: 'Endereço',
    items: [
      { id: 'own', label: 'Domínio próprio', test: (s) => !!s.domain },
      { id: 'inner', label: 'Endereço innerai.site', test: (s) => !s.domain },
    ],
  },
]

/* acesso alterado em Compartilhar, endereço e domínio das Configurações:
   valem para a sessão toda (sobrevivem à troca de página) */
let accessMemo: Record<string, SiteAccess> = {}
const urlMemo: Record<string, string> = {}
const domainMemo: Record<string, string | null> = {}

export default function SitesPage({
  createdSites = [],
  onNewSite,
  onOpenSite,
  onEditSite,
}: {
  /* sites criados no chat: entram no topo da lista */
  createdSites?: SiteDraft[]
  /* "Novo site": abre a Home com @Site */
  onNewSite?: () => void
  /* "Ver site": drawer com a prévia */
  onOpenSite?: (site: SiteDraft) => void
  /* "Editar": volta à conversa com o agente onde o site foi criado */
  onEditSite?: (site: SiteDraft) => void
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null)
  /* filtro (menu) */
  const [filters, setFilters] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [domains, setDomains] = useState<Record<string, string | null>>(domainMemo)
  useEffect(() => {
    if (!filterOpen) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.lib-filter-wrap')) setFilterOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFilterOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [filterOpen])
  const toggleFilter = (id: string) =>
    setFilters((cur) => {
      const nx = new Set(cur)
      nx.has(id) ? nx.delete(id) : nx.add(id)
      return nx
    })
  const [query, setQuery] = useState('')
  const nq = normSearch(query)
  const [share, setShare] = useState<Site | null>(null)
  const [settings, setSettings] = useState<Site | null>(null)
  /* acesso alterado no modal Compartilhar (por site) */
  const [urls, setUrls] = useState<Record<string, string>>(urlMemo)
  const [access, setAccessState] = useState<Record<string, SiteAccess>>(accessMemo)
  const setAccess = (fn: (m: Record<string, SiteAccess>) => Record<string, SiteAccess>) =>
    setAccessState((m) => (accessMemo = fn(m)))

  const sites: Site[] = [
    ...createdSites.map((d) => ({
      id: d.id,
      title: d.name,
      url: d.url,
      visibility: 'private' as const,
      date: 'Agora',
      draft: d,
    })),
    ...SITES,
  ].map((s) => ({ ...s, visibility: access[s.id] ?? s.visibility, url: urls[s.id] ?? s.url }))

  const passFilters = (s: Site) =>
    SITE_FILTER_GROUPS.every((g) => {
      const on = g.items.filter((it) => filters.has(it.id))
      return on.length === 0 || on.some((it) => it.test({ ...s, domain: domains[s.id] ?? null }))
    })
  const visible = sites.filter((x) => (!nq || normSearch(`${x.title} ${x.url}`).includes(nq)) && passFilters(x))
  const narrowed = !!nq || filters.size > 0

  /* todo site vira um rascunho abrível (os de exemplo usam a imagem como prévia) */
  const draftOf = (s: Site): SiteDraft => ({
    ...(s.draft ?? { id: s.id, name: s.title, url: s.url, thumb: s.thumb }),
    published: s.visibility !== 'private',
  })

  useEffect(() => {
    if (!menuFor) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.site-menu') && !t.closest('.site-more')) setMenuFor(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuFor(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuFor])

  const act = (fn: () => void) => {
    setMenuFor(null)
    fn()
  }

  return (
    <main className="sites-page">
      <div className="lib-container">
        <h1 className="lib-title">Sites</h1>

        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Meus sites</h2>
            </div>
            <div className="lib-files-actions">
              {/* filtro: acesso, quando foi modificado e endereço */}
              <span className="cd-filter-wrap lib-filter-wrap">
                <button
                  className={`lib-new is-ghost${filterOpen || filters.size ? ' is-on' : ''}`}
                  type="button"
                  aria-label="Filtrar"
                  aria-haspopup="menu"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.125"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  {filters.size > 0 && <span className="cd-filter-badge">{filters.size}</span>}
                  {!filterOpen && (
                    <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                      Filtrar
                    </span>
                  )}
                </button>
                {filterOpen && (
                  <div className="task-menu cd-filter-menu" role="menu">
                    <button
                      type="button"
                      className="task-menu-item"
                      role="menuitemcheckbox"
                      aria-checked={filters.size === 0}
                      onClick={() => setFilters(new Set())}
                    >
                      Todos os sites
                      {filters.size === 0 && <Check className="cd-filter-check" size={15} strokeWidth={2.4} />}
                    </button>
                    {SITE_FILTER_GROUPS.map((g) => (
                      <div key={g.label}>
                        <div className="task-menu-sep" />
                        <div className="lp-filter-label">{g.label}</div>
                        {g.items.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            className="task-menu-item"
                            role="menuitemcheckbox"
                            aria-checked={filters.has(it.id)}
                            onClick={() => toggleFilter(it.id)}
                          >
                            <span className={`cd-filter-box${filters.has(it.id) ? ' is-on' : ''}`} aria-hidden="true">
                              {filters.has(it.id) && <Check size={11} strokeWidth={3} />}
                            </span>
                            {it.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </span>
              <SearchToggle value={query} onChange={setQuery} placeholder="Buscar sites" />
              <button className="lib-new-cta" type="button" onClick={() => onNewSite?.()}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Novo Site
              </button>
            </div>
          </div>

          {narrowed && visible.length === 0 && <SearchEmpty query={nq ? query : 'esses filtros'} />}
          <div className="sites-grid" key={[...filters].join('|')}>
            {visible.map((s, i) => (
              <article
                className={`site-card is-clickable${menuFor === s.id ? ' is-menu' : ''}`}
                key={s.id}
                style={{ '--i': i } as CSSProperties}
                onClick={() => onOpenSite?.(draftOf(s))}
              >
                <div className="site-thumb">
                  {s.thumb ? (
                    <img src={s.thumb} alt={`Prévia do site ${s.title}`} loading="lazy" />
                  ) : (
                    <SiteMiniPreview />
                  )}
                </div>
                <div className="site-body">
                  <div className="site-title-row">
                    <h3 className="site-title">{s.title}</h3>
                    {/* "..." junto do nome (rodapé do card), com o menu de ações */}
                    <span className="site-more-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`site-more${menuFor === s.id ? ' is-open' : ''}`}
                        aria-label="Ações do site"
                        aria-haspopup="menu"
                        aria-expanded={menuFor === s.id}
                        onClick={() => setMenuFor((m) => (m === s.id ? null : s.id))}
                      >
                        <MoreHorizontal size={18} strokeWidth={2} />
                      </button>
                      {menuFor === s.id && (
                        <div className="task-menu site-menu" role="menu">
                          <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(() => onOpenSite?.(draftOf(s)))}>
                            <Eye size={15} strokeWidth={1.9} />
                            Ver site
                          </button>
                          <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(() => setShare(s))}>
                            <Share2 size={15} strokeWidth={1.9} />
                            Compartilhar
                          </button>
                          <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(() => onEditSite?.(draftOf(s)))}>
                            <Pencil size={15} strokeWidth={1.9} />
                            Editar
                          </button>
                          <div className="task-menu-sep" />
                          <button type="button" className="task-menu-item" role="menuitem" onClick={() => act(() => setSettings(s))}>
                            <Settings2 size={15} strokeWidth={1.9} />
                            Configurações
                          </button>
                        </div>
                      )}
                    </span>
                  </div>
                  <span className="site-url">{s.url}</span>
                  <div className="site-foot">
                    <span className={`site-vis${s.visibility === 'private' ? '' : ' is-public'}`}>
                      {s.visibility === 'private' ? (
                        <Lock size={13} strokeWidth={2} />
                      ) : s.visibility === 'link' ? (
                        <Link2 size={13} strokeWidth={2} />
                      ) : (
                        <Globe size={13} strokeWidth={2} />
                      )}
                      {s.visibility === 'private' ? 'Só você' : s.visibility === 'link' ? 'Com o link' : 'Publicado'}
                    </span>
                    <span className="site-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="site-date">{s.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {share && (
        <ShareSiteModal
          name={share.title}
          url={share.url}
          access={share.visibility}
          onClose={() => setShare(null)}
          onSave={(a) => setAccess((m) => ({ ...m, [share.id]: a }))}
        />
      )}
      {settings && (
        <SiteSettingsModal
          name={settings.title}
          url={settings.url}
          domain={domainMemo[settings.id] ?? null}
          onChangeUrl={(u) => {
            urlMemo[settings.id] = u
            setUrls({ ...urlMemo })
          }}
          onDomainChange={(d) => {
            domainMemo[settings.id] = d
            setDomains({ ...domainMemo })
          }}
          onClose={() => setSettings(null)}
        />
      )}
    </main>
  )
}
