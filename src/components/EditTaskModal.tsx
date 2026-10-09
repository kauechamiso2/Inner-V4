import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X } from 'lucide-react'
import './context-modal.css'
import './edit-task.css'
import type { Task } from './tasks'

/* ícones disponíveis para a tarefa */
const ICONS = [
  '✈️', '🏝️', '🧳', '🗺️', '🏨', '🚆',
  '📈', '📊', '💰', '🏷️', '🛒', '🧾',
  '✉️', '📰', '🔔', '📅', '⏰', '🔎',
  '🎯', '💡', '🧠', '📣', '🛠️', '🌎',
]

const FREQUENCIES = [
  'A cada 15 minutos',
  'A cada hora',
  'Duas vezes ao dia',
  'Uma vez ao dia',
  'Uma vez na semana',
  'A cada 15 dias',
  'Uma vez por mês',
]

const TIMEZONES = [
  { id: 'America/Sao_Paulo', label: 'America/São Paulo (GMT-3)' },
  { id: 'America/Manaus', label: 'America/Manaus (GMT-4)' },
  { id: 'America/New_York', label: 'America/New York (GMT-4)' },
  { id: 'Europe/Lisbon', label: 'Europe/Lisboa (GMT+1)' },
  { id: 'UTC', label: 'UTC (GMT+0)' },
]

export default function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task
  onClose: () => void
  onSave: (task: Task) => void
}) {
  const [name, setName] = useState(task.name)
  const [emoji, setEmoji] = useState(task.emoji)
  const [description, setDescription] = useState(task.description)
  const [schedule, setSchedule] = useState(task.schedule)
  const [timezone, setTimezone] = useState(task.timezone ?? 'America/Sao_Paulo')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  /* frequência atual que não está na lista (ex.: escolhida no chat) entra no topo */
  const frequencies = FREQUENCIES.includes(task.schedule) ? FREQUENCIES : [task.schedule, ...FREQUENCIES]
  const canSave = name.trim().length > 0

  /* Esc fecha primeiro o seletor de ícone, depois o modal */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (pickerOpen) setPickerOpen(false)
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [pickerOpen, onClose])

  /* clique fora fecha o seletor de ícone */
  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [pickerOpen])

  const save = () => {
    if (!canSave) return
    onSave({ ...task, name: name.trim(), emoji, description: description.trim(), schedule, timezone })
    onClose()
  }

  return createPortal(
    <div className="ctx-overlay" onClick={onClose}>
      <div
        className="ctx-modal et-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Editar tarefa"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Editar tarefa</h2>
            <p className="ctx-modal-sub">O que seu agente executa e com que frequência</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body et-body">
          {/* ícone + nome */}
          <div className="et-field">
            <label className="et-label" htmlFor="et-name">
              Nome da tarefa
            </label>
            <div className="et-name-row">
              <div className="et-icon-wrap" ref={pickerRef}>
                <button
                  type="button"
                  className={`et-icon${pickerOpen ? ' is-open' : ''}`}
                  aria-label="Alterar ícone"
                  aria-haspopup="dialog"
                  aria-expanded={pickerOpen}
                  style={{ background: `color-mix(in srgb, ${task.color} 16%, var(--pop-surface))` }}
                  onClick={() => setPickerOpen((o) => !o)}
                >
                  <span className="et-icon-emoji">{emoji}</span>
                  <span className="et-icon-edit" aria-hidden="true">
                    <ChevronDown size={12} strokeWidth={2.4} />
                  </span>
                </button>
                {pickerOpen && (
                  <div className="et-picker" role="dialog" aria-label="Escolher ícone">
                    {ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        className={`et-pick${ic === emoji ? ' is-active' : ''}`}
                        aria-label={`Usar ${ic}`}
                        onClick={() => {
                          setEmoji(ic)
                          setPickerOpen(false)
                        }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                id="et-name"
                className="et-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Monitoramento de voos"
                spellCheck={false}
              />
            </div>
          </div>

          {/* instruções */}
          <div className="et-field">
            <label className="et-label" htmlFor="et-desc">
              Descrição
            </label>
            <textarea
              id="et-desc"
              className="instr-textarea et-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que o agente deve fazer em cada execução..."
              spellCheck={false}
            />
          </div>

          {/* quando */}
          <div className="et-row">
            <div className="et-field">
              <label className="et-label" htmlFor="et-freq">
                Frequência
              </label>
              <div className="et-select">
                <select id="et-freq" value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                  {frequencies.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
            <div className="et-field">
              <label className="et-label" htmlFor="et-tz">
                Fuso horário
              </label>
              <div className="et-select">
                <select id="et-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.id} value={tz.id}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <footer className="ctx-modal-foot instr-foot et-foot">
          <button type="button" className="et-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!canSave} onClick={save}>
            Salvar
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
