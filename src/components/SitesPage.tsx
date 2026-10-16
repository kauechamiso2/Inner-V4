import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './tasks-page.css'
import './sites-page.css'
import { Eye, Globe, Link2, Lock, MoreHorizontal, Pencil, Settings2, Share2 } from 'lucide-react'
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
              <button className="lib-new is-ghost" type="button" aria-label="Filtrar">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                    stroke="#3D3D3D"
                    strokeWidth="1.125"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                  Filtrar
                </span>
              </button>
              <SearchToggle value={query} onChange={setQuery} placeholder="Buscar sites" />
              <button className="lib-new-cta" type="button" onClick={() => onNewSite?.()}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Novo Site
              </button>
            </div>
          </div>

          {nq && !sites.some((x) => normSearch(`${x.title} ${x.url}`).includes(nq)) && <SearchEmpty query={query} />}
          <div className="sites-grid">
            {sites.filter((x) => !nq || normSearch(`${x.title} ${x.url}`).includes(nq)).map((s, i) => (
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
          }}
          onClose={() => setSettings(null)}
        />
      )}
    </main>
  )
}
