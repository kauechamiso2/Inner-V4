import type { CSSProperties } from 'react'
import type { Slide, SlideTheme } from './slideFlows'
import './slide-view.css'

/* Um slide 16:9 desenhado em HTML. Tudo é medido em cqw (largura do
   próprio slide), então o mesmo componente serve para a miniatura do card,
   a tira de miniaturas e o palco em tela cheia. */
export default function SlideView({ slide: s, theme: t }: { slide: Slide; theme: SlideTheme }) {
  const style = {
    '--sl-bg': t.bg,
    '--sl-surface': t.surface,
    '--sl-text': t.text,
    '--sl-muted': t.muted,
    '--sl-accent': t.accent,
  } as CSSProperties
  return (
    <div className={`sl${t.serif ? ' is-serif' : ''}`} style={style}>
      <div className={`sl-in sl-${s.kind}`}>
        {s.kind === 'cover' && (
          <>
            <div className="sl-cover-text">
              {s.eyebrow && <span className="sl-eyebrow">{s.eyebrow}</span>}
              <h2 className="sl-h1">{s.title}</h2>
              <p className="sl-sub">{s.subtitle}</p>
            </div>
            {s.img && (
              <div className="sl-cover-img">
                <img src={s.img} alt="" draggable={false} />
              </div>
            )}
          </>
        )}

        {s.kind === 'split' && (
          <>
            <div className="sl-split-img">
              <img src={s.img} alt="" draggable={false} />
            </div>
            <div className="sl-split-text">
              <h2 className="sl-h2">{s.title}</h2>
              <p className="sl-p">{s.text}</p>
              {s.items && (
                <ul className="sl-rows">
                  {s.items.map(([e, a, b]) => (
                    <li key={a}>
                      <span className="sl-emoji">{e}</span>
                      <span>
                        <strong>{a}</strong>
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {s.kind === 'cards' && (
          <>
            <h2 className="sl-h2">{s.title}</h2>
            <div className="sl-cards">
              {s.items.map(([e, a, b]) => (
                <div className="sl-card" key={a}>
                  <span className="sl-emoji is-big">{e}</span>
                  <strong>{a}</strong>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {s.kind === 'stats' && (
          <>
            <h2 className="sl-h2">{s.title}</h2>
            <div className="sl-stats">
              {s.stats.map(([v, l]) => (
                <div className="sl-stat" key={l}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {s.kind === 'steps' && (
          <>
            <h2 className="sl-h2">{s.title}</h2>
            <ol className="sl-steps">
              {s.items.map(([a, b], i) => (
                <li key={a}>
                  <span className="sl-step-dot">{i + 1}</span>
                  <strong>{a}</strong>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {s.kind === 'quote' && (
          <figure className="sl-quote">
            <span className="sl-quote-mark" aria-hidden="true">
              “
            </span>
            <blockquote>{s.text}</blockquote>
            <figcaption>{s.by}</figcaption>
          </figure>
        )}

        {s.kind === 'closing' && (
          <div className="sl-closing">
            <span className="sl-closing-bar" />
            <h2 className="sl-h1">{s.title}</h2>
            <p className="sl-sub">{s.subtitle}</p>
          </div>
        )}
      </div>
    </div>
  )
}
