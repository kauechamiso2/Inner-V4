import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Loader2,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plane,
  Repeat,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import type { Task } from './tasks'
import { CONTENT_BRIEFING } from './taskBriefing'
import CreateTaskModal from './CreateTaskModal'
import { ConfirmDeleteModal } from './ChatModals'
import { resultOf } from './runSummaries'
import type { Run } from './runSummaries'
import { applyLoopState, removeLoop, runNow, runsOf, togglePause, useLoopStore } from './loopStore'
import './task-drawer.css'

type Props = {
  task: Task
  closing: boolean
  onClose: () => void
  /* "Editar": o mesmo modal de criar/configurar loop */
  onSave?: (task: Task) => void
  /* aberto por uma execução do histórico (página do loop): mostra o resultado dela */
  run?: Run
  /* "Abrir chat": conversa com o resultado desta execução */
  onOpenChat?: (task: Task, when: string) => void
}

export default function TaskDrawer({ task: task0, closing, onClose, onSave, run, onOpenChat }: Props) {
  const loop = useLoopStore()
  const task = applyLoopState(task0, loop)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const inactive = !!task.status

  /* execução acompanhada ao vivo ("Executando" → "Concluída") */
  const liveRun = run ? (runsOf(task, loop).find((r) => r.id === run.id) ?? run) : null
  const running = liveRun ? liveRun.status === 'running' : loop.running.includes(task.id)
  const hasResult = !running && (!!liveRun || !!task.last)
  const when = liveRun ? liveRun.when : task.last ? `Última execução ${task.last}` : ''
  const origin = liveRun ? (liveRun.origin === 'manual' ? 'Execução manual' : 'Execução agendada') : null

  const iconStyle: CSSProperties = inactive
    ? { background: 'var(--lib-tile-neutral)' }
    : { background: `color-mix(in srgb, ${task.color} 16%, var(--pop-surface))` }

  // Esc fecha o drawer (com um modal aberto, o Esc é dele)
  useEffect(() => {
    if (editOpen || deleteOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, editOpen, deleteOpen])

  // clique fora fecha o menu "..."
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.td-menu') && !t.closest('.td-more')) setMenuOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [menuOpen])

  return (
    <aside className={`app-drawer${closing ? ' is-closing' : ''}`} aria-label={`Loop: ${task.name}`}>
      <div className="app-drawer-inner">
        <header className="td-header">
          <span className="td-title">
            <span className="td-emoji" style={iconStyle}>
              <span className={inactive ? 'is-muted' : undefined}>{task.emoji}</span>
            </span>
            <span className="td-name">{task.name}</span>
          </span>

          <div className="td-actions">
            <IconBtn label="Editar loop" onClick={() => setEditOpen(true)}>
              <Pencil size={16} strokeWidth={1.9} />
            </IconBtn>
            <IconBtn label={inactive ? 'Retomar' : 'Pausar'} onClick={() => togglePause(task)}>
              {inactive ? <Play size={16} strokeWidth={1.9} /> : <Pause size={16} strokeWidth={1.9} />}
            </IconBtn>
            <IconBtn
              label="Mais opções"
              className={`td-more${menuOpen ? ' is-open' : ''}`}
              expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </IconBtn>
            <IconBtn label="Fechar" onClick={onClose}>
              <X size={18} strokeWidth={2} />
            </IconBtn>

            {menuOpen && (
              <div className="td-menu" role="menu">
                <button
                  type="button"
                  className="task-menu-item"
                  role="menuitem"
                  disabled={loop.running.includes(task.id)}
                  onClick={() => {
                    setMenuOpen(false)
                    runNow(task)
                  }}
                >
                  <Zap size={15} strokeWidth={1.9} />
                  Executar agora
                </button>
                <div className="task-menu-sep" />
                <button
                  type="button"
                  className="task-menu-item is-danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setDeleteOpen(true)
                  }}
                >
                  <Trash2 size={15} strokeWidth={1.9} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="td-schedule">
          {task.recurring ? <Repeat size={15} strokeWidth={2} /> : <CalendarClock size={15} strokeWidth={2} />}
          <span className="td-schedule-text">{task.schedule}</span>
          {inactive ? (
            <span className="td-badge">{task.status}</span>
          ) : (
            task.next && <span className="td-schedule-next">· Próxima: {task.next}</span>
          )}
        </div>

        <div className={`td-body${hasResult ? ' has-dock' : ''}`} key={`${liveRun?.id ?? 'last'}-${running}`}>
          {running ? (
            <>
              <p className="td-last td-running">
                <Loader2 className="task-spin" size={14} strokeWidth={2.2} aria-hidden="true" />
                Executando agora
              </p>
              <div className="td-result">
                <span className="td-result-label">Resultado</span>
                <div className="td-result-empty">O resultado aparece aqui assim que a execução terminar.</div>
              </div>
            </>
          ) : hasResult ? (
            <Result task={task} when={when} origin={origin} />
          ) : (
            <>
              <p className="td-last">Ainda não executado</p>
              <div className="td-result">
                <span className="td-result-label">Resultado</span>
                <div className="td-result-empty">O resultado da próxima execução aparecerá aqui.</div>
              </div>
            </>
          )}
        </div>
      </div>

      {hasResult && (
        <div className="td-chat-dock">
          <button type="button" className="td-chat-btn" onClick={() => onOpenChat?.(task, liveRun?.when ?? `Hoje`)}>
            <MessageSquare size={16} strokeWidth={2} />
            Abrir chat
          </button>
        </div>
      )}
      {editOpen && <CreateTaskModal task={task} onClose={() => setEditOpen(false)} onCreate={(t) => onSave?.(t)} />}
      {deleteOpen && (
        <ConfirmDeleteModal
          title="Excluir loop?"
          confirmLabel="Excluir"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => {
            removeLoop(task)
            onClose()
          }}
        >
          <strong>{task.name}</strong> deixa de ser executado e o histórico de execuções é apagado.
        </ConfirmDeleteModal>
      )}
    </aside>
  )
}

/* botão de ícone do cabeçalho, com tooltip */
function IconBtn({
  label,
  onClick,
  children,
  className = '',
  expanded,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  className?: string
  expanded?: boolean
}) {
  return (
    <button
      type="button"
      className={`td-icon-btn ${className}`}
      aria-label={label}
      aria-haspopup={expanded === undefined ? undefined : 'menu'}
      aria-expanded={expanded}
      onClick={onClick}
    >
      {children}
      {!expanded && (
        <span className="pill-tooltip td-tip" role="tooltip" aria-hidden="true">
          {label}
        </span>
      )}
    </button>
  )
}

/* resultado da execução: cada loop tem seu formato */
function Result({ task, when, origin }: { task: Task; when: string; origin: string | null }) {
  const r = resultOf(task)
  const meta = (
    <div className="td-brief-meta">
      <span className="td-brief-time">{origin ?? 'Último resultado'}</span>
      <span className="td-brief-date">{when}</span>
    </div>
  )

  if (r.kind === 'briefing') {
    const b = CONTENT_BRIEFING
    return (
      <article className="td-brief">
        {meta}
        <h2 className="td-brief-title">{b.title}</h2>
        <p className="td-brief-intro">{b.intro}</p>
        <p className="td-brief-window">{b.window}</p>
        <div className="td-news-list">
          {b.items.map((it) => (
            <article className="td-news" key={it.index}>
              <div className="td-news-head">
                <span className="td-news-kicker">
                  {it.index} / {it.topic} · {it.date}
                </span>
                {it.badge && <span className="td-news-badge">{it.badge}</span>}
              </div>
              <h3 className="td-news-headline">{it.headline}</h3>
              {it.image && <div className="td-news-thumb" aria-hidden="true" />}
              <p className="td-news-body">{it.body}</p>
            </article>
          ))}
        </div>
      </article>
    )
  }

  if (r.kind === 'flight') {
    const f = r.flight
    return (
      <article className="td-brief">
        {meta}
        <h2 className="td-brief-title">{r.title}</h2>
        <p className="td-brief-intro">{r.intro}</p>
        <div className="td-flight">
          <div className="td-flight-top">
            <span className="td-flight-code">
              {f.airline} · {f.code}
            </span>
            <span className="td-ok">{f.status}</span>
          </div>
          <div className="td-flight-route">
            <span className="td-flight-end">
              <span className="td-flight-iata">{f.from}</span>
              <span className="td-flight-city">{f.fromCity}</span>
              <span className="td-flight-time">{f.dep}</span>
            </span>
            <span className="td-flight-line" aria-hidden="true">
              <Plane size={16} strokeWidth={1.9} />
            </span>
            <span className="td-flight-end is-end">
              <span className="td-flight-iata">{f.to}</span>
              <span className="td-flight-city">{f.toCity}</span>
              <span className="td-flight-time">{f.arr}</span>
            </span>
          </div>
          <dl className="td-flight-facts">
            {r.facts.map((x) => (
              <div key={x.label}>
                <dt>{x.label}</dt>
                <dd>{x.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    )
  }

  if (r.kind === 'inbox') {
    return (
      <article className="td-brief">
        {meta}
        <h2 className="td-brief-title">{r.title}</h2>
        <p className="td-brief-intro">{r.intro}</p>
        <ul className="td-mails">
          {r.emails.map((e) => (
            <li className="td-mail" key={e.subject}>
              <span className="td-mail-avatar" aria-hidden="true">
                {e.from.charAt(0)}
              </span>
              <span className="td-mail-text">
                <span className="td-mail-top">
                  <span className="td-mail-from">{e.from}</span>
                  <span className="td-mail-tag">{e.tag}</span>
                </span>
                <span className="td-mail-subject">{e.subject}</span>
                <span className="td-mail-snippet">{e.snippet}</span>
              </span>
            </li>
          ))}
        </ul>
      </article>
    )
  }

  if (r.kind === 'prices') {
    return (
      <article className="td-brief">
        {meta}
        <h2 className="td-brief-title">{r.title}</h2>
        <p className="td-brief-intro">{r.intro}</p>
        <ul className="td-prices">
          {r.products.map((p) => (
            <li className="td-price" key={p.name}>
              <span className="td-price-text">
                <span className="td-price-name">{p.name}</span>
                <span className="td-price-store">
                  {p.store} · antes {p.before}
                </span>
              </span>
              <span className="td-price-now">
                {p.now}
                <span className={`td-delta${p.delta < 0 ? ' is-down' : p.delta > 0 ? ' is-up' : ''}`}>
                  {p.delta < 0 ? (
                    <ArrowDownRight size={13} strokeWidth={2.4} />
                  ) : p.delta > 0 ? (
                    <ArrowUpRight size={13} strokeWidth={2.4} />
                  ) : (
                    <Minus size={13} strokeWidth={2.4} />
                  )}
                  {p.delta === 0 ? 'Igual' : `${Math.abs(p.delta)}%`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </article>
    )
  }

  return (
    <article className="td-brief">
      {meta}
      <h2 className="td-brief-title">{r.title}</h2>
      <p className="td-brief-intro">{r.intro}</p>
      <div className="td-news-list">
        {r.points.map((p, i) => (
          <article className="td-news" key={p.title}>
            <span className="td-news-kicker">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="td-news-headline">{p.title}</h3>
            <p className="td-news-body">{p.body}</p>
          </article>
        ))}
      </div>
    </article>
  )
}
