import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, MessageCircle, Monitor, X, Zap } from 'lucide-react'
import { AgendadoIcon } from './SidebarIcons'
import type { Task } from './tasks'
import './context-modal.css'
import './edit-task.css'
import './create-task.css'

const FREQUENCIES = [
  { id: 'dia', label: 'Todos os dias', unit: ['dia', 'dias'] },
  { id: 'uteis', label: 'Dias úteis', unit: ['semana', 'semanas'] },
  { id: 'semana', label: 'Toda semana', unit: ['semana', 'semanas'] },
  { id: 'mes', label: 'Todo mês', unit: ['mês', 'meses'] },
]

const TRIGGERS = [
  'Gmail: quando chegar um e-mail novo',
  'Google Calendar: antes de cada reunião',
  'Hubspot: quando entrar um novo lead',
  'Google Drive: quando um arquivo for adicionado',
]

const ENDS = ['Nunca', 'Em uma data', 'Depois de 10 execuções']

const TIMEZONES = [
  { id: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { id: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { id: 'America/New_York', label: 'Nova York (GMT-4)' },
  { id: 'Europe/Lisbon', label: 'Lisboa (GMT+1)' },
  { id: 'UTC', label: 'UTC (GMT+0)' },
]

/* cartão de escolha (rádio) no padrão neutro da plataforma */
function Choice({
  selected,
  onSelect,
  icon,
  title,
  sub,
}: {
  selected: boolean
  onSelect: () => void
  icon: ReactNode
  title: string
  sub?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`ct-choice${selected ? ' is-selected' : ''}${sub ? '' : ' is-compact'}`}
      onClick={onSelect}
    >
      <span className="ct-choice-ic" aria-hidden="true">
        {icon}
      </span>
      <span className="ct-choice-text">
        <span className="ct-choice-title">{title}</span>
        {sub && <span className="ct-choice-sub">{sub}</span>}
      </span>
      <span className="ct-radio" aria-hidden="true" />
    </button>
  )
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="et-select">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
    </div>
  )
}

/* lê o texto de agendamento de uma tarefa existente de volta para os campos */
function parseSchedule(schedule: string) {
  const trigger = TRIGGERS.find((t) => t === schedule)
  const time = schedule.match(/\d{1,2}:\d{2}/)?.[0]?.padStart(5, '0') ?? '09:00'
  const every = Number(schedule.match(/A cada (\d+)/)?.[1] ?? 1)
  const freq = /úteis/i.test(schedule)
    ? 'uteis'
    : /m[eê]s/i.test(schedule)
      ? 'mes'
      : /semana|segunda|terça|quarta|quinta|sexta|sábado|domingo/i.test(schedule)
        ? 'semana'
        : 'dia'
  return { trigger, time, every, freq }
}

/* mesmo modal para criar ("Criar manualmente") e editar ("Configurações" da tarefa) */
export default function CreateTaskModal({
  onClose,
  onCreate,
  task = null,
}: {
  onClose: () => void
  onCreate: (task: Task) => void
  /* presente: modo edição, campos preenchidos e "Salvar" */
  task?: Task | null
}) {
  const parsed = task ? parseSchedule(task.schedule) : null
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState(task?.name ?? '')
  const [instructions, setInstructions] = useState(task?.description ?? '')
  const [when, setWhen] = useState<'schedule' | 'trigger'>(parsed?.trigger ? 'trigger' : 'schedule')
  const [freq, setFreq] = useState(parsed?.freq ?? 'dia')
  const [time, setTime] = useState(parsed?.time ?? '09:00')
  const [every, setEvery] = useState(parsed?.every ?? 1)
  const [trigger, setTrigger] = useState(parsed?.trigger ?? TRIGGERS[0])
  const [ends, setEnds] = useState(task?.ends ?? ENDS[0])
  const [timezone, setTimezone] = useState(task?.timezone ?? 'America/Sao_Paulo')
  const [notify, setNotify] = useState<'platform' | 'whatsapp'>(task?.notify ?? 'platform')
  /* em edição, o agendamento só muda se o usuário mexer nos campos */
  const [touchedWhen, setTouchedWhen] = useState(false)
  const touch = <T,>(fn: (v: T) => void) => (v: T) => {
    setTouchedWhen(true)
    fn(v)
  }

  const canCreate = name.trim().length > 0
  const f = FREQUENCIES.find((x) => x.id === freq) ?? FREQUENCIES[0]

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = () => {
    if (!canCreate) return
    const schedule =
      task && !touchedWhen
        ? task.schedule
        : when === 'trigger'
          ? trigger
          : `${every > 1 ? `A cada ${every} ${f.unit[1]}` : f.label}, ${time}`
    if (task) {
      onCreate({
        ...task,
        name: name.trim(),
        description: instructions.trim() || task.description,
        schedule,
        timezone,
        notify,
        ends,
      })
      close()
      return
    }
    onCreate({
      id: `manual-${Date.now()}`,
      name: name.trim(),
      emoji: when === 'trigger' ? '⚡' : '🗓️',
      color: '#6B7280',
      recurring: true,
      schedule,
      next: when === 'trigger' ? null : `Amanhã, ${time}`,
      last: null,
      description: instructions.trim() || 'Sem instruções por enquanto.',
      timezone,
      notify,
      ends,
    })
    close()
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal et-modal ct-modal"
        role="dialog"
        aria-modal="true"
        aria-label={task ? 'Configurações da tarefa' : 'Nova tarefa'}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head ct-head">
          <span className="ct-head-ic" aria-hidden="true">
            <AgendadoIcon size={22} />
          </span>
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">{task ? 'Configurações da tarefa' : 'Nova tarefa'}</h2>
            <p className="ctx-modal-sub">Defina o que fazer e quando executar.</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body et-body ct-body">
          <div className="et-field">
            <label className="et-label" htmlFor="ct-name">
              Nome
            </label>
            <input
              id="ct-name"
              className="et-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Resumo diário de e-mails"
              autoFocus={!task}
              spellCheck={false}
            />
          </div>

          <div className="et-field">
            <label className="et-label" htmlFor="ct-instr">
              Instruções
            </label>
            <textarea
              id="ct-instr"
              className="instr-textarea ct-textarea"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Descreva o que o Inner AI deve fazer em cada execução..."
              spellCheck={false}
            />
          </div>

          <div className="et-field">
            <span className="et-label">Quando executar</span>
            <div className="ct-choices" role="radiogroup" aria-label="Quando executar">
              <Choice
                selected={when === 'schedule'}
                onSelect={() => touch(setWhen)('schedule')}
                icon={<AgendadoIcon size={20} />}
                title="Agendamento"
                sub="Escolha o dia e o horário"
              />
              <Choice
                selected={when === 'trigger'}
                onSelect={() => touch(setWhen)('trigger')}
                icon={<Zap size={19} strokeWidth={1.8} />}
                title="Gatilho"
                sub="A partir de uma integração"
              />
            </div>
          </div>

          {/* detalhes de "quando": troca com fade ao alternar */}
          <div className="ct-box" key={when}>
            {when === 'schedule' ? (
              <>
                <div className="et-row">
                  <div className="et-field">
                    <label className="et-label" htmlFor="ct-freq">
                      Frequência
                    </label>
                    <Select
                      id="ct-freq"
                      value={freq}
                      onChange={touch(setFreq)}
                      options={FREQUENCIES.map((x) => ({ value: x.id, label: x.label }))}
                    />
                  </div>
                  <div className="et-field">
                    <label className="et-label" htmlFor="ct-time">
                      Horário
                    </label>
                    <input
                      id="ct-time"
                      className="et-input"
                      type="time"
                      value={time}
                      onChange={(e) => touch(setTime)(e.target.value)}
                    />
                  </div>
                </div>
                <div className="et-field">
                  <label className="et-label" htmlFor="ct-every">
                    Repetir
                  </label>
                  <div className="ct-every">
                    <span>A cada</span>
                    <input
                      id="ct-every"
                      className="et-input ct-every-input"
                      type="number"
                      min={1}
                      max={30}
                      value={every}
                      onChange={(e) => touch(setEvery)(Math.max(1, Number(e.target.value) || 1))}
                    />
                    <span>{every > 1 ? f.unit[1] : f.unit[0]}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="et-field">
                <label className="et-label" htmlFor="ct-trigger">
                  Integração
                </label>
                <Select
                  id="ct-trigger"
                  value={trigger}
                  onChange={touch(setTrigger)}
                  options={TRIGGERS.map((t) => ({ value: t, label: t }))}
                />
              </div>
            )}
          </div>

          <div className="et-row">
            <div className="et-field">
              <label className="et-label" htmlFor="ct-ends">
                Termina
              </label>
              <Select id="ct-ends" value={ends} onChange={setEnds} options={ENDS.map((e) => ({ value: e, label: e }))} />
            </div>
            <div className="et-field">
              <label className="et-label" htmlFor="ct-tz">
                Fuso horário
              </label>
              <Select
                id="ct-tz"
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES.map((t) => ({ value: t.id, label: t.label }))}
              />
            </div>
          </div>

          <div className="et-field">
            <span className="et-label">Onde notificar</span>
            <div className="ct-choices" role="radiogroup" aria-label="Onde notificar">
              <Choice
                selected={notify === 'platform'}
                onSelect={() => setNotify('platform')}
                icon={<Monitor size={19} strokeWidth={1.8} />}
                title="Na plataforma"
              />
              <Choice
                selected={notify === 'whatsapp'}
                onSelect={() => setNotify('whatsapp')}
                icon={<MessageCircle size={19} strokeWidth={1.8} />}
                title="WhatsApp"
              />
            </div>
          </div>
        </div>

        <footer className="ctx-modal-foot instr-foot et-foot">
          <button type="button" className="et-cancel" onClick={close}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!canCreate} onClick={create}>
            {task ? 'Salvar' : 'Criar tarefa'}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
