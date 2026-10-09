import type { CSSProperties } from 'react'
import './library-page.css'
import './sites-page.css'
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
    title: 'Kauê Chamiso | UX Design',
    url: 'kauechamiso.design',
    visibility: 'private',
    date: 'Ontem',
    thumb: portfolioThumb,
  },
  {
    id: 's2',
    title: 'Smart Analytics | Landing',
    url: 'smartanalytics.inner.site',
    visibility: 'public',
    date: 'há 3 dias',
    thumb: saasThumb,
  },
]

export default function SitesPage() {
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
              <button className="lib-new is-ghost" type="button" aria-label="Buscar">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="8.2" cy="8.2" r="5" stroke="#3D3D3D" strokeWidth="1.2" />
                  <path d="M12 12l3.4 3.4" stroke="#3D3D3D" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                  Buscar
                </span>
              </button>
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
