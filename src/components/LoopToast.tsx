import { createPortal } from 'react-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { dismissToast, useLoopStore } from './loopStore'
import './tasks-page.css'

/* Aviso das ações de Loops (executar, pausar, excluir). Fica no App para
   aparecer tanto na página de Loops quanto pelo drawer da tarefa. */
export default function LoopToast({ onViewLoop }: { onViewLoop: (taskId: string) => void }) {
  const { toast, pageId } = useLoopStore()
  if (!toast) return null
  return createPortal(
    <div className={`lp-toast is-${toast.kind}`} key={toast.id} role="status">
      {toast.kind === 'running' ? (
        <Loader2 className="task-spin" size={16} strokeWidth={2.2} aria-hidden="true" />
      ) : toast.kind === 'done' ? (
        <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
      ) : null}
      <span className="lp-toast-text">{toast.text}</span>
      {toast.undo && (
        <button
          type="button"
          className="lp-toast-btn"
          onClick={() => {
            toast.undo?.()
            dismissToast()
          }}
        >
          Desfazer
        </button>
      )}
      {toast.taskId && pageId !== toast.taskId && (
        <button
          type="button"
          className="lp-toast-btn"
          onClick={() => {
            onViewLoop(toast.taskId!)
            dismissToast()
          }}
        >
          Ver loop
        </button>
      )}
    </div>,
    document.body,
  )
}
