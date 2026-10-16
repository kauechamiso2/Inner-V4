import { useEffect, useRef, useState } from 'react'
import { ChevronDown, PenLine } from 'lucide-react'
import AgentOrb from './AgentOrb'
import type { ChosenAgent } from './agents'
import './tasks-page.css'

/* "Nova tarefa" com duas formas de criar: conversando com o agente (Home com
   @Tarefa) ou preenchendo o formulário à mão */
export default function NewTaskMenu({
  agent,
  onWithAgent,
  onManual,
  className = '',
  align = 'right',
}: {
  agent: ChosenAgent | null
  onWithAgent: () => void
  onManual: () => void
  className?: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const name = agent?.name || 'Inner AI'

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <span className={`ntm-wrap${align === 'left' ? ' is-left' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={`lib-new-cta ntm-btn ${className}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Novo Loop
        <ChevronDown className="ntm-caret" size={15} strokeWidth={2.2} aria-hidden="true" />
      </button>
      {open && (
        <div className="task-menu ntm-menu" role="menu">
          <button type="button" className="task-menu-item" role="menuitem" onClick={() => pick(onWithAgent)}>
            <span className="ntm-face" aria-hidden="true">
              {agent && !agent.orb && agent.img ? <img src={agent.img} alt="" /> : <AgentOrb size={18} />}
            </span>
            Criar com {name}
          </button>
          <button type="button" className="task-menu-item" role="menuitem" onClick={() => pick(onManual)}>
            <PenLine size={15} strokeWidth={1.9} />
            Criar manualmente
          </button>
        </div>
      )}
    </span>
  )
}
