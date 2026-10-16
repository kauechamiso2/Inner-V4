import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Pause,
  Play,
  Settings2,
  Zap,
} from 'lucide-react'
import { AgendadoIcon } from './SidebarIcons'
import CreateTaskModal from './CreateTaskModal'
import Dropdown from './Dropdown'
import type { Run } from './runSummaries'
import type { Task } from './tasks'
import './task-page.css'

const TZ_LABEL: Record<string, string> = {
  'America/Sao_Paulo': 'São Paulo',
  'America/Manaus': 'Manaus',
  'America/New_York': 'Nova York',
  'Europe/Lisbon': 'Lisboa',
  UTC: 'UTC',
}

/* Página da tarefa (Agendado > clicar numa tarefa). Pelo chat, a tarefa
   continua abrindo no drawer. */
export default function TaskPage({
  task,
  onBack,
  onSave,
  onTogglePause,
  onOpenRun,
  runs,
  onRunNow,
}: {
  /* histórico de execuções (fica na página de Loops: o "Executar agora" do card também entra aqui) */
  runs: Run[]
  /* "Executar agora": entra no topo como "Executando" e conclui em seguida */
  onRunNow: () => void
  task: Task
  onBack: () => void
  onSave: (task: Task) => void
  /* Pausar/Retomar: a tarefa muda de seção na lista de Loops */
  onTogglePause?: () => void
  /* clicar numa execução: abre o drawer da tarefa com o resumo dela */
  onOpenRun?: (run: Run) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const inactive = !!task.status
  const tz = TZ_LABEL[task.timezone ?? 'America/Sao_Paulo'] ?? 'São Paulo'
  const whatsapp = task.notify === 'whatsapp'

  const shown = runs.filter((r) =>
    filter === 'all' ? true : filter === 'manual' ? r.origin === 'manual' : r.origin === 'scheduled',
  )

  return (
    <div className="tp">
      <button type="button" className="tp-back" onClick={onBack}>
        <ArrowLeft size={17} strokeWidth={2} />
        Loops
      </button>

      <header className="tp-head">
        <span
          className="tp-icon"
          style={{
            background: inactive
              ? 'var(--lib-tile-neutral)'
              : `color-mix(in srgb, ${task.color} 16%, var(--pop-surface))`,
          }}
          aria-hidden="true"
        >
          {task.emoji}
        </span>
        <div className="tp-head-text">
          <div className="tp-meta">
            <span className={`tp-status${inactive ? ' is-off' : ''}`}>
              <span className="tp-status-dot" aria-hidden="true" />
              {inactive ? task.status : 'Ativo'}
            </span>

          </div>
          <h1 className="tp-title">{task.name}</h1>
        </div>
        <div className="tp-actions">
          <button type="button" className="tp-btn" onClick={() => setEditOpen(true)}>
            <Settings2 size={16} strokeWidth={1.9} />
            Configurações
          </button>
          <button type="button" className="tp-btn" onClick={onTogglePause}>
            {inactive ? (
              <Play size={14} strokeWidth={1.9} />
            ) : (
              <Pause size={15} strokeWidth={1.9} />
            )}
            {inactive ? 'Retomar' : 'Pausar'}
          </button>
          <button type="button" className="tp-btn is-primary" onClick={onRunNow}>
            <Play size={14} strokeWidth={0} fill="currentColor" />
            Executar agora
          </button>
        </div>
      </header>

      <div className="tp-cards">
        <article className="tp-card" style={{ '--i': 0 } as CSSProperties}>
          <span className="tp-card-label">
            <Clock size={15} strokeWidth={1.9} />
            Próxima execução
          </span>
          <span className="tp-card-value">{task.next ?? 'Quando o gatilho disparar'}</span>
          <span className="tp-card-sub">{tz}</span>
        </article>
        <article className="tp-card" style={{ '--i': 1 } as CSSProperties}>
          <span className="tp-card-label">
            {task.recurring ? <AgendadoIcon size={15} /> : <Zap size={15} strokeWidth={1.9} />}
            Agendamento
          </span>
          <span className="tp-card-value">{task.schedule}</span>
          <span className="tp-card-sub">Termina: {(task.ends ?? 'Nunca').toLowerCase()}</span>
        </article>
        <article className="tp-card" style={{ '--i': 2 } as CSSProperties}>
          <span className="tp-card-label">
            <Bell size={15} strokeWidth={1.9} />
            Notificações
          </span>
          <span className="tp-card-value">{whatsapp ? 'WhatsApp' : 'Na plataforma'}</span>
          <span className="tp-card-sub">
            {whatsapp ? 'O resumo chega no seu WhatsApp' : 'O resultado fica disponível no chat'}
          </span>
        </article>
      </div>

      <section className="tp-panel tp-instr">
        <div className="tp-panel-head">
          <h2>Instruções</h2>
          <button type="button" className="tp-link" onClick={() => setEditOpen(true)}>
            Editar
            <ArrowUpRight size={15} strokeWidth={1.9} />
          </button>
        </div>
        <p className="tp-instr-text">{task.description}</p>
      </section>

      <section className="tp-panel tp-runs">
        <div className="tp-panel-head tp-runs-head">
          <div>
            <h2>
              Histórico de execuções
              <span className="tp-count">{runs.length}</span>
            </h2>
            <p className="tp-panel-sub">
              {task.thread === 'new'
                ? 'Cada execução tem sua própria conversa.'
                : 'Todas as execuções acontecem na mesma conversa.'}
            </p>
          </div>
          <div className="tp-filter">
            <Dropdown
              size="sm"
              value={filter}
              onChange={setFilter}
              ariaLabel="Filtrar execuções"
              menuWidth={200}
              options={[
                { value: 'all', label: 'Todas as execuções' },
                { value: 'scheduled', label: 'Agendadas', icon: <AgendadoIcon size={15} /> },
                { value: 'manual', label: 'Manuais', icon: <Play size={13} strokeWidth={1.9} /> },
              ]}
            />
          </div>
        </div>

        {shown.length > 0 ? (
          <div className="tp-table" role="table" aria-label="Execuções">
            <div className="tp-tr tp-th" role="row">
              <span role="columnheader">Execução</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Origem</span>
              <span aria-hidden="true" />
            </div>
            {shown.map((r, i) => (
              <button
                type="button"
                className={`tp-tr tp-row${r.status === 'running' ? ' is-running' : ''}`}
                role="row"
                key={r.id}
                onClick={() => onOpenRun?.(r)}
                style={{ '--i': i } as CSSProperties}
              >
                <span className="tp-run" role="cell">
                  <span className="tp-run-ic" aria-hidden="true">
                    {r.status === 'running' ? (
                      <Loader2 className="tp-spin" size={17} strokeWidth={2} />
                    ) : (
                      <CheckCircle2 size={17} strokeWidth={1.9} />
                    )}
                  </span>
                  <span className="tp-run-text">
                    <span className="tp-run-when">{r.when}</span>
                    <span className="tp-run-sub">
                      {r.status === 'running' ? 'Executando...' : 'Resultado disponível'}
                    </span>
                  </span>
                </span>
                <span role="cell">
                  <span className={`tp-chip${r.status === 'running' ? ' is-running' : ''}`}>
                    {r.status === 'running' ? 'Executando' : 'Concluída'}
                  </span>
                </span>
                <span className="tp-origin" role="cell">
                  {r.origin === 'manual' ? (
                    <>
                      <Play size={13} strokeWidth={1.9} />
                      Manual
                    </>
                  ) : (
                    <>
                      <AgendadoIcon size={15} />
                      Agendada
                    </>
                  )}
                </span>
                <ChevronRight className="tp-chev" size={17} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="tp-empty">
            <p>Nenhuma execução ainda.</p>
            <span>Use "Executar agora" para testar a tarefa.</span>
          </div>
        )}
      </section>

      {/* Configurações/Editar: o mesmo modal de "Criar manualmente", preenchido */}
      {editOpen && <CreateTaskModal task={task} onClose={() => setEditOpen(false)} onCreate={onSave} />}
    </div>
  )
}
