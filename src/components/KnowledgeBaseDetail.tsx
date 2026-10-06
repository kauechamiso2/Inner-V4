import './collection-detail.css'
import { ChevronLeft } from 'lucide-react'
import type { CSSProperties } from 'react'
import ContextFileList from './ContextFileList'
import type { KnowledgeBase } from './knowledgeBases'

/* Detalhe de uma base de conhecimento — mesma estrutura do Contexto de um
   projeto (seções, Novo, arquivos dentro/fora de seções). */
export default function KnowledgeBaseDetail({
  base,
  onBack,
}: {
  base: KnowledgeBase
  onBack: () => void
}) {
  return (
    <main className="library-page">
      <div className="cd-container">
        <nav className="cd-breadcrumb" aria-label="Navegação">
          <button className="cd-back" type="button" onClick={onBack} aria-label="Voltar">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button className="cd-crumb" type="button" onClick={onBack}>
            Biblioteca
          </button>
        </nav>

        <header className="cd-head">
          <div className="cd-title-row">
            <span
              className="cd-coll-icon"
              style={{ background: `color-mix(in srgb, ${base.color} 16%, var(--card-surface))` } as CSSProperties}
            >
              {base.emoji}
            </span>
            <h1 className="cd-title">{base.name}</h1>
          </div>
        </header>
        <p className="cd-creator">{base.description}</p>

        <ContextFileList
          allSections={base.sections}
          allLoose={base.loose}
          searchPlaceholder="Buscar nesta base"
        />
      </div>
    </main>
  )
}
