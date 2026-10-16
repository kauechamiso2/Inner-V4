import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Folder, Link2, X } from 'lucide-react'
import './context-modal.css'
import './create-task.css'
import './site-modals.css'
import './chat-modals.css'

/* shell enxuto (título + fechar) com saída suave, usado pelos modais do chat */
function SmallModal({
  title,
  onClose,
  children,
  footer,
  label,
  closing = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  label?: string
  /* saída suave (quem controla o fechamento passa true antes de desmontar) */
  closing?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={onClose}>
      <div
        className="ctx-modal sm-modal cm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={label ?? title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">{title}</h2>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>
        <div className="ctx-modal-body cm-body">{children}</div>
        {footer && <footer className="ctx-modal-foot sm-foot is-end cm-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

/* Compartilhar chat: primeiro "Criar link", depois o link pronto para copiar */
export function ShareChatModal({ onClose }: { onClose: () => void }) {
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = useMemo(() => {
    const hex = (n: number) =>
      Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    return `https://app.innerai.com/?sharedSessionId=${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`
  }, [])
  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <SmallModal title="Compartilhar chat" onClose={onClose}>
      <div className="cm-share" key={created ? 'done' : 'start'}>
        <p className="cm-text">
          {created
            ? 'Link criado. Agora você pode compartilhar este chat para outros usuários verem.'
            : 'Crie um link compartilhável para outros usuários verem este chat.'}
        </p>
        {created ? (
          <div className="cm-link">
            <span className="cm-link-url">{link}</span>
            <button type="button" className="instr-save cm-link-btn" onClick={copy}>
              {copied ? <Check size={15} strokeWidth={2.2} /> : <Copy size={15} strokeWidth={2} />}
              {copied ? 'Copiado' : 'Copiar link'}
            </button>
          </div>
        ) : (
          <button type="button" className="instr-save cm-create" onClick={() => setCreated(true)}>
            <Link2 size={16} strokeWidth={2} />
            Criar link
          </button>
        )}
      </div>
    </SmallModal>
  )
}

/* Excluir chat: confirmação com a ação destrutiva em vermelho */
export function DeleteChatModal({
  title,
  onClose,
  onConfirm,
}: {
  title: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <SmallModal
      title="Excluir chat?"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ss-text-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="instr-save cm-danger"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Excluir chat
          </button>
        </>
      }
    >
      <p className="cm-text is-left">
        O chat <strong>{title}</strong> será excluído permanentemente. Essa ação não pode ser desfeita.
      </p>
    </SmallModal>
  )
}

/* Renomear chat (pelo "..." do cabeçalho da conversa) */
export function RenameChatModal({
  title,
  onClose,
  onSave,
  heading = 'Renomear chat',
  inputLabel = 'Nome do chat',
}: {
  title: string
  onClose: () => void
  onSave: (title: string) => void
  /* reaproveitado para arquivos e pastas da Biblioteca */
  heading?: string
  inputLabel?: string
}) {
  const [value, setValue] = useState(title)
  const can = value.trim().length > 0 && value.trim() !== title
  const save = () => {
    if (!can) return
    onSave(value.trim())
    onClose()
  }
  return (
    <SmallModal
      title={heading}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ss-text-btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!can} onClick={save}>
            Salvar
          </button>
        </>
      }
    >
      <div className="ss-field">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
          spellCheck={false}
          aria-label={inputLabel}
        />
      </div>
    </SmallModal>
  )
}

const FEEDBACK_REASONS = [
  'Resposta incorreta',
  'Não seguiu as instruções',
  'Não usou a memória corretamente',
  'Não gostei do estilo',
  'Enviesada',
  'Outro motivo',
]

/* Feedback negativo de uma resposta: motivos (vários), detalhes opcionais e
   confirmação de envio */
export function FeedbackModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [reasons, setReasons] = useState<string[]>([])
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const can = reasons.length > 0 || text.trim().length > 0
  const toggle = (r: string) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))

  useEffect(() => {
    if (!sent) return
    const t = window.setTimeout(onClose, 2400)
    return () => window.clearTimeout(t)
  }, [sent, onClose])

  if (sent) {
    return (
      <SmallModal title="Feedback" onClose={onClose}>
        <div className="fb-done">
          <span className="fb-done-ic" aria-hidden="true">
            <Check size={22} strokeWidth={2.4} />
          </span>
          <p className="fb-done-title">Obrigado pelo feedback!</p>
          <p className="cm-text">Ele nos ajuda a deixar as respostas cada vez melhores.</p>
        </div>
      </SmallModal>
    )
  }

  return (
    <SmallModal
      title="Feedback"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ss-text-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="instr-save"
            disabled={!can}
            onClick={() => {
              setSent(true)
              onSent()
            }}
          >
            Enviar
          </button>
        </>
      }
    >
      <div className="fb-body">
        <p className="cm-text is-left">O que não funcionou nessa resposta?</p>
        <div className="fb-chips" role="group" aria-label="Motivos">
          {FEEDBACK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`fb-chip${reasons.includes(r) ? ' is-on' : ''}`}
              aria-pressed={reasons.includes(r)}
              onClick={() => toggle(r)}
            >
              {reasons.includes(r) && <Check size={13} strokeWidth={2.6} aria-hidden="true" />}
              {r}
            </button>
          ))}
        </div>
        <textarea
          className="instr-textarea fb-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Conte mais sobre o problema (opcional)"
          spellCheck={false}
        />
        <p className="fb-note">
          Ao enviar, a conversa atual será compartilhada com a Inner AI para melhorar nossos modelos.
        </p>
      </div>
    </SmallModal>
  )
}

/* confirmação genérica de exclusão (ex.: seção do Contexto) */
export function ConfirmDeleteModal({
  title,
  children,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <SmallModal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ss-text-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="instr-save cm-danger"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="cm-text is-left">{children}</p>
    </SmallModal>
  )
}

/* Integração não conectada: ícone grande, aviso e "Conectar" (simula o OAuth) */
export function ConnectIntegrationModal({
  name,
  img,
  mono = false,
  onClose,
  onConnected,
}: {
  name: string
  img?: string
  mono?: boolean
  onClose: () => void
  onConnected: () => void
}) {
  const [state, setState] = useState<'idle' | 'connecting' | 'done'>('idle')
  useEffect(() => {
    if (state === 'connecting') {
      const t = window.setTimeout(() => setState('done'), 1400)
      return () => window.clearTimeout(t)
    }
    if (state === 'done') {
      const t = window.setTimeout(() => {
        onConnected()
        onClose()
      }, 900)
      return () => window.clearTimeout(t)
    }
  }, [state, onConnected, onClose])
  return createPortal(
    <div className="ctx-overlay" onClick={onClose}>
      <div
        className="ctx-modal sm-modal cm-modal ci-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Conectar ${name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ctx-modal-close ci-close" type="button" aria-label="Fechar" onClick={onClose}>
          <X size={18} strokeWidth={2} />
        </button>
        <div className="ci-body">
          <span className={`ci-logo${state === 'done' ? ' is-done' : ''}`}>
            {img && <img className={mono ? 'is-mono' : ''} src={img} alt="" />}
            {state === 'done' && (
              <span className="ci-ok" aria-hidden="true">
                <Check size={14} strokeWidth={3} />
              </span>
            )}
          </span>
          <h2 className="ci-title">{state === 'done' ? `${name} conectado` : `${name} não está conectado`}</h2>
          <p className="cm-text">
            {state === 'done'
              ? 'Pronto! Seu agente já pode usar essa integração.'
              : `Conecte sua conta do ${name} para o agente ler e agir nos seus dados. Você pode desconectar quando quiser.`}
          </p>
        </div>
        <footer className="ctx-modal-foot sm-foot ci-foot">
          <button
            type="button"
            className="instr-save ci-btn"
            disabled={state !== 'idle'}
            onClick={() => setState('connecting')}
          >
            {state === 'connecting' ? (
              <>
                <span className="ci-spin" aria-hidden="true" />
                Conectando...
              </>
            ) : state === 'done' ? (
              <>
                <Check size={15} strokeWidth={2.4} />
                Conectado
              </>
            ) : (
              `Conectar ${name}`
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

/* Nova pasta (Biblioteca): nome único e, com itens selecionados, a opção de
   já movê-los para a pasta criada */
export function NewFolderModal({
  existing,
  selectedCount = 0,
  onClose,
  onCreate,
}: {
  existing: string[]
  selectedCount?: number
  onClose: () => void
  onCreate: (name: string, moveSelected: boolean) => void
}) {
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState('')
  const [move, setMove] = useState(selectedCount > 0)
  const clean = name.trim()
  const taken = existing.some((n) => n.toLowerCase() === clean.toLowerCase())
  const can = clean.length > 0 && !taken
  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }
  const create = () => {
    if (!can) return
    onCreate(clean, move)
    close()
  }
  return (
    <SmallModal
      title="Nova pasta"
      onClose={close}
      closing={closing}
      footer={
        <button type="button" className="instr-save" disabled={!can} onClick={create}>
          Criar pasta
        </button>
      }
    >
      <div className="nf-body">
        <div className={`ss-field${taken ? ' is-error' : ''}`}>
          <Folder size={17} strokeWidth={1.8} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder="Nome da pasta"
            maxLength={60}
            autoFocus
            spellCheck={false}
            aria-label="Nome da pasta"
            aria-invalid={taken}
          />
        </div>
        {taken && <p className="ss-hint nf-error">Já existe uma pasta com esse nome.</p>}
        {selectedCount > 0 && (
          <button
            type="button"
            role="checkbox"
            aria-checked={move}
            className="nf-move"
            onClick={() => setMove((m) => !m)}
          >
            <span className={`lib-check${move ? ' is-on' : ''}`} aria-hidden="true">
              {move && <Check size={11} strokeWidth={3} />}
            </span>
            Mover {selectedCount === 1 ? 'o item selecionado' : `os ${selectedCount} itens selecionados`} para a pasta
          </button>
        )}
      </div>
    </SmallModal>
  )
}
