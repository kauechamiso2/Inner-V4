import './library-page.css'
import './collection-detail.css'
import { ChevronLeft, ChevronRight, MessageCircle, Pin } from 'lucide-react'
import ContextFileList from './ContextFileList'

export default function CollectionDetail({
  name,
  emoji,
  color,
  creator,
  pinned = false,
  onTogglePin,
  onBack,
}: {
  name: string
  emoji?: string
  color?: string
  creator: string
  pinned?: boolean
  onTogglePin?: () => void
  onBack: () => void
}) {
  return (
    <main className="library-page">
      <div className="lib-container cd-container">
        <nav className="cd-breadcrumb" aria-label="Navegação">
          <button className="cd-back" type="button" onClick={onBack} aria-label="Voltar">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button className="cd-crumb" type="button" onClick={onBack}>
            Biblioteca
          </button>
          <ChevronRight size={14} strokeWidth={2} className="cd-crumb-sep" />
          <span className="cd-crumb is-current">{name}</span>
        </nav>

        <div className="cd-head">
          <div className="cd-head-text">
            <div className="cd-title-row">
              {emoji && (
                <span
                  className="cd-coll-icon"
                  aria-hidden="true"
                  style={
                    color
                      ? { background: `color-mix(in srgb, ${color} 16%, var(--card-surface))` }
                      : undefined
                  }
                >
                  {emoji}
                </span>
              )}
              <h1 className="cd-title">{name}</h1>
              <button
                type="button"
                className={`cd-pin${pinned ? ' is-pinned' : ''}`}
                aria-label={pinned ? 'Desafixar do histórico da Home' : 'Fixar no histórico da Home'}
                aria-pressed={pinned}
                title={pinned ? 'Fixado no histórico da Home' : 'Fixar no histórico da Home'}
                onClick={onTogglePin}
              >
                <Pin size={16} strokeWidth={1.8} fill={pinned ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="cd-creator">Criado por {creator}</p>
          </div>
          <button type="button" className="cd-chat-btn">
            <MessageCircle size={17} strokeWidth={1.9} />
            Chat com Projeto
          </button>
        </div>

        <ContextFileList />
      </div>
    </main>
  )
}
