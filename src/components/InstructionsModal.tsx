import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './context-modal.css'

export default function InstructionsModal({
  open,
  onClose,
  defaultValue = '',
}: {
  open: boolean
  onClose: () => void
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (open) setValue(defaultValue)
  }, [open, defaultValue])

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
        aria-label="Instruções do projeto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Instruções</h2>
            <p className="ctx-modal-sub">Como a IA deve se comportar dentro deste projeto</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body instr-body">
          <textarea
            className="instr-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escreva as instruções do projeto…"
            spellCheck={false}
          />
        </div>

        <footer className="ctx-modal-foot instr-foot">
          <button type="button" className="instr-save" onClick={onClose}>
            Salvar
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
