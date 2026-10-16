import './collection-detail.css'
import { ChevronLeft, Plus, Upload } from 'lucide-react'
import type { CSSProperties } from 'react'
import ContextFileList from './ContextFileList'
import KnowledgeBaseMenu from './KnowledgeBaseMenu'
import type { KnowledgeBase } from './knowledgeBases'

/* Detalhe de uma base de conhecimento — mesma estrutura do Contexto de um
   projeto (seções, Novo, arquivos dentro/fora de seções). */
export default function KnowledgeBaseDetail({
  base,
  onBack,
  onChat,
  onEdit,
  onDelete,
}: {
  base: KnowledgeBase
  onBack: () => void
  /* "..." da base */
  onChat: () => void
  onEdit: () => void
  onDelete: () => void
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
            <KnowledgeBaseMenu className="cd-kb-menu" onChat={onChat} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </header>
        {base.description && <p className="cd-creator">{base.description}</p>}

        <ContextFileList
          allSections={base.sections}
          allLoose={base.loose}
          searchPlaceholder="Buscar nesta base"
          dropWhere={`Na base ${base.name}`}
          renderEmpty={(add) => (
            /* base recém-criada: convite para enviar, arrastar ou adicionar */
            <div className="kb-empty">
              <span
                className="kb-empty-ic"
                style={{ background: `color-mix(in srgb, ${base.color} 16%, var(--card-surface))` }}
                aria-hidden="true"
              >
                {base.emoji}
              </span>
              <p className="kb-empty-title">Sua base está vazia</p>
              <p className="kb-empty-sub">
                Arraste arquivos para cá ou adicione arquivos, links, notas e itens da sua Biblioteca.
              </p>
              <div className="kb-empty-actions">
                <button type="button" className="lib-new-cta" onClick={() => add('upload')}>
                  <Upload size={15} strokeWidth={2} />
                  Enviar arquivos
                </button>
                <button type="button" className="kb-empty-sec" onClick={() => add('menu')}>
                  <Plus size={15} strokeWidth={2.2} />
                  Outras opções
                </button>
              </div>
            </div>
          )}
        />
      </div>
    </main>
  )
}
