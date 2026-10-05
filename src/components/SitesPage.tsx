import { useState } from 'react'
import type { CSSProperties } from 'react'
import './library-page.css'
import './sites-page.css'
import searchIcon from '../assets/library/search.svg'
import { Globe, Lock, MoreHorizontal } from 'lucide-react'
import portfolioThumb from '../assets/sites/portfolio.png'
import saasThumb from '../assets/sites/saas.png'

type Site = {
  id: string
  title: string
  url: string
  visibility: 'private' | 'public'
  date: string
  thumb: string
}

const SITES: Site[] = [
  {
    id: 's1',
    title: 'Kauê Chamiso — UX Design',
    url: 'kauechamiso.design',
    visibility: 'private',
    date: 'Ontem',
    thumb: portfolioThumb,
  },
  {
    id: 's2',
    title: 'Smart Analytics — Landing',
    url: 'smartanalytics.inner.site',
    visibility: 'public',
    date: 'há 3 dias',
    thumb: saasThumb,
  },
]

export default function SitesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <main className="sites-page">
      <div className="lib-container">
        <h1 className="lib-title">Sites</h1>

        <div className="lib-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar sites" spellCheck={false} />
        </div>

        <section className="lib-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Meus sites</h2>
              <p>Sites publicados e rascunhos criados por você</p>
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
              <div className="lib-view-switch" role="group" aria-label="Visualização">
                <button
                  className={`lib-view-opt${view === 'grid' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em grade"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2.6" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="2.6" y="10" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="10" width="5.4" height="5.4" rx="1.5" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em grade
                  </span>
                </button>
                <button
                  className={`lib-view-opt${view === 'list' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em lista"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2" y="3.5" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="3.95" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="7.8" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="8.25" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="12.1" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="12.55" width="9.7" height="1.5" rx="0.75" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em lista
                  </span>
                </button>
              </div>
              <button className="lib-new-cta" type="button">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Novo Site
              </button>
            </div>
          </div>

          <div className="sites-grid">
            {SITES.map((s, i) => (
              <article className="site-card" key={s.id} style={{ '--i': i } as CSSProperties}>
                <button type="button" className="site-more" aria-label="Ações do site">
                  <MoreHorizontal size={18} strokeWidth={2} />
                </button>
                <div className="site-thumb">
                  <img src={s.thumb} alt={`Prévia do site ${s.title}`} loading="lazy" />
                </div>
                <div className="site-body">
                  <h3 className="site-title">{s.title}</h3>
                  <span className="site-url">{s.url}</span>
                  <div className="site-foot">
                    <span className={`site-vis${s.visibility === 'public' ? ' is-public' : ''}`}>
                      {s.visibility === 'private' ? (
                        <Lock size={13} strokeWidth={2} />
                      ) : (
                        <Globe size={13} strokeWidth={2} />
                      )}
                      {s.visibility === 'private' ? 'Só você' : 'Publicado'}
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
    </main>
  )
}
