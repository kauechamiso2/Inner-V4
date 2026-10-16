import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, Link2, Plus, RefreshCw, Unplug, Video } from 'lucide-react'
import googleCalendar from '../assets/integrations/google-calendar.svg'
import { ConfirmDeleteModal, SmallModal } from './ChatModals'
import Dropdown from './Dropdown'
import './tasks-page.css'
import './meetings.css'
import MeetingDetail from './MeetingDetail'

/* Pilar de Reuniões: próximas reuniões do calendário (agrupadas por dia) com
   "Gravar automaticamente", gerenciar calendário e nova reunião (agora ou
   agendada). O histórico de reuniões fica no painel lateral. */

type Meeting = { id: string; title: string; start: string; end: string; day: number; record: boolean; link?: string }

/* "hoje" do protótipo: sexta, 16 de outubro de 2026 */
const TODAY = new Date(2026, 9, 16)
const dayDate = (offset: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + offset)
const WEEK = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const SEED: Meeting[] = [
  { id: 'm1', title: '[IMPT] Inner 4.0', start: '17:00', end: '18:00', day: 0, record: true },
  { id: 'm2', title: 'Sync de lançamento', start: '18:30', end: '19:00', day: 0, record: false },
  { id: 'm3', title: 'Kauê / Marcello', start: '10:00', end: '11:00', day: 3, record: false },
  { id: 'm4', title: 'Design Weekly', start: '10:30', end: '11:00', day: 3, record: true },
  { id: 'm5', title: 'Review de métricas', start: '15:00', end: '16:00', day: 3, record: false },
  { id: 'm6', title: 'Entrevista: designer sênior', start: '09:00', end: '10:00', day: 4, record: true },
  { id: 'm7', title: 'Kickoff do projeto Atlas', start: '14:00', end: '15:30', day: 5, record: false },
]

const isMeetLink = (v: string) => /^https?:\/\/(meet\.google\.com|[\w.-]*zoom\.us|teams\.microsoft\.com)\//i.test(v.trim())

/* menu ancorado a um botão do topo */
function TopMenu({ onClose, children, align = 'right' }: { onClose: () => void; children: ReactNode; align?: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const wrap = ref.current?.parentElement
      if (wrap && !wrap.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return (
    <div ref={ref} className={`task-menu mt-menu is-${align}`} role="menu">
      {children}
    </div>
  )
}

export default function MeetingsPage({
  newKey = 0,
  openMeeting = null,
}: {
  newKey?: number
  /* reunião do histórico aberta (resumo, transcrição, gravação...) */
  openMeeting?: { title: string; key: number } | null
}) {
  const [detail, setDetail] = useState<string | null>(null)
  useEffect(() => {
    if (openMeeting) setDetail(openMeeting.title)
  }, [openMeeting?.key])
  const [meetings, setMeetings] = useState<Meeting[]>(SEED)
  const [connected, setConnected] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [menu, setMenu] = useState<'calendar' | 'new' | null>(null)
  const [modal, setModal] = useState<'now' | 'schedule' | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const toastTimer = useRef<number>()
  const showToast = (text: string) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text })
    toastTimer.current = window.setTimeout(() => setToast(null), 3600)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])
  /* "Nova reunião" no painel lateral */
  useEffect(() => {
    if (!newKey) return
    setDetail(null)
    setModal('now')
  }, [newKey])

  const resync = () => {
    setMenu(null)
    setSyncing(true)
    window.setTimeout(() => {
      setSyncing(false)
      showToast('Calendário sincronizado')
    }, 1400)
  }
  const toggleRecord = (id: string) =>
    setMeetings((list) => list.map((m) => (m.id === id ? { ...m, record: !m.record } : m)))

  const days = [...new Set(meetings.map((m) => m.day))].sort((a, b) => a - b)

  if (detail) return <MeetingDetail key={detail} title={detail} onBack={() => setDetail(null)} />

  return (
    <main className="mt-page">
      <header className="mt-top">
        <span className="mt-menu-wrap">
          <button
            type="button"
            className={`mt-btn${menu === 'calendar' ? ' is-open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={menu === 'calendar'}
            onClick={() => (connected ? setMenu((m) => (m === 'calendar' ? null : 'calendar')) : setConnected(true))}
          >
            <img src={googleCalendar} alt="" aria-hidden="true" />
            {connected ? 'Gerenciar calendário' : 'Conectar calendário'}
            {connected && <ChevronDown className="mt-caret" size={15} strokeWidth={2.2} aria-hidden="true" />}
          </button>
          {menu === 'calendar' && (
            <TopMenu onClose={() => setMenu(null)}>
              <button type="button" className="task-menu-item" role="menuitem" onClick={resync}>
                <RefreshCw size={15} strokeWidth={1.9} />
                Ressincronizar calendário
              </button>
              <div className="task-menu-sep" />
              <button
                type="button"
                className="task-menu-item is-danger"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  setConfirmDisconnect(true)
                }}
              >
                <Unplug size={15} strokeWidth={1.9} />
                Desconectar calendário
              </button>
            </TopMenu>
          )}
        </span>
        <span className="mt-menu-wrap">
          <button
            type="button"
            className={`mt-btn is-primary${menu === 'new' ? ' is-open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={menu === 'new'}
            onClick={() => setMenu((m) => (m === 'new' ? null : 'new'))}
          >
            <Plus size={16} strokeWidth={2.2} />
            Nova reunião
            <ChevronDown className="mt-caret" size={15} strokeWidth={2.2} aria-hidden="true" />
          </button>
          {menu === 'new' && (
            <TopMenu onClose={() => setMenu(null)}>
              <button
                type="button"
                className="task-menu-item"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  setModal('now')
                }}
              >
                <Video size={15} strokeWidth={1.9} />
                Nova reunião
              </button>
              <button
                type="button"
                className="task-menu-item"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  setModal('schedule')
                }}
              >
                <CalendarPlus size={15} strokeWidth={1.9} />
                Agendar reunião
              </button>
            </TopMenu>
          )}
        </span>
      </header>

      <div className="mt-container">
        <h1 className="mt-title">
          Próximas reuniões
          {syncing && (
            <span className="mt-syncing" role="status">
              <RefreshCw size={14} strokeWidth={2} />
              Sincronizando...
            </span>
          )}
        </h1>

        {!connected ? (
          /* calendário desconectado: convite para conectar */
          <div className="mt-empty">
            <span className="mt-empty-ic" aria-hidden="true">
              <img src={googleCalendar} alt="" />
            </span>
            <p className="mt-empty-title">Conecte seu calendário</p>
            <p className="mt-empty-sub">
              Suas próximas reuniões aparecem aqui, e o agente pode entrar para gravar e resumir cada uma.
            </p>
            <button type="button" className="mt-btn is-primary" onClick={() => setConnected(true)}>
              <img src={googleCalendar} alt="" aria-hidden="true" />
              Conectar Google Calendar
            </button>
          </div>
        ) : (
          <div className={`mt-days${syncing ? ' is-syncing' : ''}`}>
            {days.map((d, gi) => {
              const date = dayDate(d)
              const list = meetings
                .filter((m) => m.day === d)
                .sort((a, b) => a.start.localeCompare(b.start))
              return (
                <section className={`mt-day${d === 0 ? ' is-today' : ''}`} key={d} style={{ '--i': gi } as CSSProperties}>
                  <div className="mt-day-date" aria-label={`${date.getDate()} de ${MONTHS[date.getMonth()]}`}>
                    <span className="mt-day-week">{d === 0 ? 'HOJE' : WEEK[date.getDay()]}</span>
                    <span className="mt-day-num">{date.getDate()}</span>
                  </div>
                  <ul className="mt-list">
                    {list.map((m) => (
                      <li className="mt-item" key={m.id}>
                        <span className="mt-item-text">
                          <span className="mt-item-title">{m.title}</span>
                          <span className="mt-item-time">
                            {m.start} - {m.end}
                          </span>
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={m.record}
                          className={`mt-record${m.record ? ' is-on' : ''}`}
                          onClick={() => toggleRecord(m.id)}
                        >
                          <span className="mt-record-track" aria-hidden="true">
                            <span className="mt-record-knob" />
                          </span>
                          Gravar automaticamente
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <MeetingModal
          mode={modal}
          onClose={() => setModal(null)}
          onConfirm={(m) => {
            if (modal === 'now') {
              showToast(`O agente está entrando em "${m.title}"`)
            } else {
              setMeetings((list) => [...list, { id: `m-${Date.now()}`, ...m, record: true }])
              showToast('Reunião agendada')
            }
          }}
        />
      )}

      {confirmDisconnect && (
        <ConfirmDeleteModal
          title="Desconectar calendário?"
          confirmLabel="Desconectar"
          onClose={() => setConfirmDisconnect(false)}
          onConfirm={() => {
            setConnected(false)
            showToast('Calendário desconectado')
          }}
        >
          Suas próximas reuniões deixam de aparecer aqui e o agente não entra mais automaticamente para gravar.
        </ConfirmDeleteModal>
      )}

      {toast &&
        createPortal(
          <div className="lp-toast is-info" key={toast.id} role="status">
            <span className="lp-toast-text">{toast.text}</span>
          </div>,
          document.body,
        )}
    </main>
  )
}

/* ---------- Iniciar reunião instantânea / Agendar reunião ---------- */
function MeetingModal({
  mode,
  onClose,
  onConfirm,
}: {
  mode: 'now' | 'schedule'
  onClose: () => void
  onConfirm: (m: { title: string; start: string; end: string; day: number; link: string }) => void
}) {
  const [link, setLink] = useState('')
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState<{ day: number; time: string } | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const linkErr = link.trim().length > 0 && !isMeetLink(link)
  const can = isMeetLink(link) && (mode === 'now' || !!when)
  const confirm = () => {
    if (!can) return
    const t = title.trim() || 'Reunião sem título'
    const time = when?.time ?? '09:00'
    const [h, mm] = time.split(':').map(Number)
    const end = `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    onConfirm({ title: t, link: link.trim(), start: time, end, day: when?.day ?? 0 })
    onClose()
  }
  const whenLabel = when
    ? (() => {
        const d = dayDate(when.day)
        return `${WEEK[d.getDay()].charAt(0)}${WEEK[d.getDay()].slice(1).toLowerCase()}, ${d.getDate()} de ${MONTHS[d.getMonth()]} às ${when.time}`
      })()
    : null

  return (
    <SmallModal
      title={mode === 'now' ? 'Iniciar reunião instantânea' : 'Agendar reunião'}
      onClose={onClose}
      footer={
        <button type="button" className="instr-save" disabled={!can} onClick={confirm}>
          {mode === 'now' ? 'Iniciar' : 'Agendar'}
        </button>
      }
    >
      <div className="mt-form">
        <label className="mt-field">
          <span className="mt-label">Link da reunião</span>
          <span className={`ss-field${linkErr ? ' is-error' : ''}`}>
            <Link2 size={16} strokeWidth={1.9} />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              autoFocus
              spellCheck={false}
            />
          </span>
          {linkErr && <span className="ss-hint mt-err">Use um link do Google Meet, Zoom ou Teams.</span>}
        </label>
        <label className="mt-field">
          <span className="mt-label">Título</span>
          <span className="ss-field">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirm()}
              placeholder="Título da reunião"
              spellCheck={false}
            />
          </span>
        </label>
        {mode === 'schedule' && (
          <div className="mt-field">
            <span className="mt-label">Data e horário</span>
            <button
              type="button"
              className={`ss-field mt-when${pickerOpen ? ' is-open' : ''}${when ? ' is-set' : ''}`}
              onClick={() => setPickerOpen((o) => !o)}
            >
              <CalendarDays size={16} strokeWidth={1.9} />
              {whenLabel ?? 'Clique para selecionar a data e o horário'}
            </button>
            {pickerOpen && (
              <WhenPicker
                value={when}
                onChange={(v) => setWhen(v)}
                onDone={() => setPickerOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </SmallModal>
  )
}

/* calendário do mês + horário (de 30 em 30 min) para agendar */
function WhenPicker({
  value,
  onChange,
  onDone,
}: {
  value: { day: number; time: string } | null
  onChange: (v: { day: number; time: string }) => void
  onDone: () => void
}) {
  const [month, setMonth] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))
  const [time, setTime] = useState(value?.time ?? '10:00')
  const selDate = value ? dayDate(value.day) : null
  const first = month.getDay()
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const offsetOf = (d: Date) => Math.round((d.getTime() - TODAY.getTime()) / 86400000)
  const times: { value: string; label: string }[] = []
  for (let h = 7; h < 22; h++) for (const m of ['00', '30']) times.push({ value: `${String(h).padStart(2, '0')}:${m}`, label: `${String(h).padStart(2, '0')}:${m}` })
  return (
    <div className="mt-picker">
      <div className="mt-cal-head">
        <button
          type="button"
          className="mt-cal-nav"
          aria-label="Mês anterior"
          disabled={month.getMonth() === TODAY.getMonth() && month.getFullYear() === TODAY.getFullYear()}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="mt-cal-month">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          type="button"
          className="mt-cal-nav"
          aria-label="Próximo mês"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-cal-grid">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span className="mt-cal-dow" key={i}>
            {d}
          </span>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const d = new Date(month.getFullYear(), month.getMonth(), i + 1)
          const past = d < TODAY
          const on = !!selDate && d.toDateString() === selDate.toDateString()
          return (
            <button
              key={i}
              type="button"
              className={`mt-cal-day${on ? ' is-on' : ''}${d.toDateString() === TODAY.toDateString() ? ' is-today' : ''}`}
              disabled={past}
              onClick={() => onChange({ day: offsetOf(d), time })}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="mt-picker-foot">
        <span className="mt-label">Horário</span>
        <div className="mt-time">
          <Dropdown
            size="sm"
            value={time}
            options={times}
            ariaLabel="Horário"
            onChange={(t) => {
              setTime(t)
              if (value) onChange({ day: value.day, time: t })
            }}
          />
        </div>
        <button type="button" className="mt-picker-done" disabled={!value} onClick={onDone}>
          Pronto
        </button>
      </div>
    </div>
  )
}
