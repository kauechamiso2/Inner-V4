import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './context-modal.css'
import ContextFileList from './ContextFileList'
import type { DetailFile, Section } from './ContextFileList'

export default function ContextModal({
  open,
  onClose,
  sections,
  looseFiles,
  usedPct = 57,
}: {
  open: boolean
  onClose: () => void
  sections: Section[]
  looseFiles: DetailFile[]
  usedPct?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="ctx-overlay" onClick={onClose}>
      <div
        className="ctx-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Contexto do projeto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Contexto</h2>
            <p className="ctx-modal-sub">Arquivos e fontes que o projeto usa como conhecimento</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body">
          <ContextFileList
            allSections={sections}
            allLoose={looseFiles}
            searchPlaceholder="Buscar no contexto"
          />
        </div>

        <footer className="ctx-modal-foot">
          <div className="ctx-progress-row">
            <span className="ctx-progress-label">Contexto utilizado</span>
            <span className="ctx-progress-pct">{usedPct}%</span>
          </div>
          <div
            className="ctx-progress-track"
            role="progressbar"
            aria-valuenow={usedPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="ctx-progress-fill" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="ctx-progress-hint">
            {usedPct}% do limite de contexto do projeto já foi utilizado
          </p>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
