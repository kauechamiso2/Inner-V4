import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp, Plus, X } from 'lucide-react'
import './nova-tarefa.css'

/* sugestões de tarefas prontas (antes ficavam no empty state) */
const SUGGESTIONS = [
  {
    emoji: '📨',
    title: 'Fica de olho nos e-mails',
    desc: 'Acompanhe minha caixa e me avise quando chegar algo que precisa de mim',
  },
  {
    emoji: '📊',
    title: 'Me mantém no controle dos números',
    desc: 'Acompanhe os resultados e me traga um resumo toda sexta',
  },
  {
    emoji: '📰',
    title: 'Me deixa por dentro do mercado',
    desc: 'Acompanhe o meu setor e me traga o que for relevante toda semana',
  },
]

export default function NovaTarefaModal({
  onClose,
  onSend,
}: {
  onClose: () => void
  /* envia o pedido como mensagem do chat na Home */
  onSend?: (text: string) => void
}) {
  const [value, setValue] = useState('')
  const [closing, setClosing] = useState(false)
  const canSend = value.trim().length > 0

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 190)
  }

  /* fecha o modal e, ao fim da saída, leva o texto pro chat da Home */
  const submit = () => {
    const text = value.trim()
    if (!text) return
    setClosing(true)
    window.setTimeout(() => {
      onClose()
      onSend?.(text)
    }, 190)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      className={`nt-overlay${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Nova tarefa"
      onClick={close}
    >
      <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
        <header className="nt-head">
          <h2 className="nt-title">Nova tarefa</h2>
          <button type="button" className="nt-close" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        {/* input estilo geração de imagem, em uma única linha */}
        <div className={`nt-input${canSend ? ' is-ready' : ''}`}>
          <button type="button" className="nt-add" aria-label="Adicionar contexto">
            <Plus size={18} strokeWidth={2.2} />
          </button>
          <input
            type="text"
            className="nt-field"
            placeholder="Descreva a tarefa que seu agente vai executar..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSend) {
                e.preventDefault()
                submit()
              }
            }}
            autoFocus
            spellCheck={false}
          />
          <button
            type="button"
            className={`nt-send${canSend ? ' is-ready' : ''}`}
            aria-label="Criar tarefa"
            disabled={!canSend}
            onClick={canSend ? submit : undefined}
          >
            <ArrowUp size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* sugestões abaixo do input */}
        <div className="nt-sugg">
          <span className="nt-sugg-head">Sugestões</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              type="button"
              className="nt-sugg-item"
              onClick={() => setValue(s.desc)}
            >
              <span className="nt-sugg-emoji" aria-hidden="true">
                {s.emoji}
              </span>
              <span className="nt-sugg-text">
                <span className="nt-sugg-title">{s.title}</span>
                <span className="nt-sugg-desc">{s.desc}</span>
              </span>
              <span className="nt-sugg-add" aria-hidden="true">
                <Plus size={16} strokeWidth={2} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
