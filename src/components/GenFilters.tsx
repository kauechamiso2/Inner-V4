import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { BarPopover, ImageModelLogo } from './ImageModelPicker'
import { IMAGE_MODELS } from './imageModels'
import './collection-detail.css'
import './gen-filters.css'

/* Filtros das Minhas gerações: período (atalhos ou intervalo no calendário)
   e modelos. "Hoje" do protótipo: 15 de outubro de 2026. */

export const TODAY = new Date(2026, 9, 15)
export const daysAgo = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n)
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export type GenRange =
  | { kind: 'all' }
  | { kind: 'today' }
  | { kind: '7d' }
  | { kind: '30d' }
  | { kind: 'custom'; from: Date; to: Date }

export type GenFilterState = { range: GenRange; models: string[] }
export const EMPTY_GEN_FILTERS: GenFilterState = { range: { kind: 'all' }, models: [] }

const RANGES: { kind: Exclude<GenRange['kind'], 'custom'>; label: string }[] = [
  { kind: 'all', label: 'Qualquer data' },
  { kind: 'today', label: 'Hoje' },
  { kind: '7d', label: 'Últimos 7 dias' },
  { kind: '30d', label: 'Últimos 30 dias' },
]

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const SHORT = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`

export function rangeLabel(r: GenRange) {
  if (r.kind === 'custom') return sameDay(r.from, r.to) ? SHORT(r.from) : `${SHORT(r.from)} a ${SHORT(r.to)}`
  return RANGES.find((x) => x.kind === r.kind)!.label
}

export function inRange(date: Date, r: GenRange) {
  const d = startOf(date)
  if (r.kind === 'all') return true
  if (r.kind === 'today') return sameDay(d, TODAY)
  if (r.kind === '7d') return d >= daysAgo(6)
  if (r.kind === '30d') return d >= daysAgo(29)
  return d >= startOf(r.from) && d <= startOf(r.to)
}

/* calendário de um mês: primeiro clique escolhe o início, o segundo o fim */
function RangeCalendar({ value, onChange }: { value: { from: Date; to: Date } | null; onChange: (v: { from: Date; to: Date }) => void }) {
  const [month, setMonth] = useState(() => new Date((value?.to ?? TODAY).getFullYear(), (value?.to ?? TODAY).getMonth(), 1))
  const [picking, setPicking] = useState<Date | null>(null)
  const [hover, setHover] = useState<Date | null>(null)
  const first = month.getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ]
  const lo = picking ? (hover && hover < picking ? hover : picking) : value?.from
  const hi = picking ? (hover && hover > picking ? hover : picking) : value?.to
  const nextDisabled = month.getFullYear() === TODAY.getFullYear() && month.getMonth() === TODAY.getMonth()
  return (
    <div className="gf-cal">
      <div className="gf-cal-head">
        <button
          type="button"
          className="gf-cal-nav"
          aria-label="Mês anterior"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="gf-cal-month">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          type="button"
          className="gf-cal-nav"
          aria-label="Próximo mês"
          disabled={nextDisabled}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="gf-cal-grid" role="grid" onMouseLeave={() => setHover(null)}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span className="gf-cal-dow" key={i}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const future = d > TODAY
          const isLo = !!lo && sameDay(d, lo)
          const isHi = !!hi && sameDay(d, hi)
          const mid = !!lo && !!hi && d > lo && d < hi
          return (
            <button
              key={d.toISOString()}
              type="button"
              className={`gf-day${isLo || isHi ? ' is-end' : ''}${mid ? ' is-mid' : ''}${isLo && hi && !isHi ? ' is-lo' : ''}${
                isHi && lo && !isLo ? ' is-hi' : ''
              }${sameDay(d, TODAY) ? ' is-today' : ''}`}
              disabled={future}
              onMouseEnter={() => picking && setHover(d)}
              onClick={() => {
                if (!picking) {
                  setPicking(d)
                  setHover(d)
                } else {
                  const [from, to] = d < picking ? [d, picking] : [picking, d]
                  setPicking(null)
                  setHover(null)
                  onChange({ from, to })
                }
              }}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
      <p className="gf-cal-hint">{picking ? 'Escolha o último dia' : 'Escolha o primeiro dia'}</p>
    </div>
  )
}

/* painel do botão de filtro (cabeçalho ou barra flutuante) */
export default function GenFilters({
  anchor,
  value,
  onChange,
  onClose,
  usedModels,
}: {
  anchor: HTMLElement
  value: GenFilterState
  onChange: (v: GenFilterState) => void
  onClose: () => void
  /* modelos que aparecem no histórico (nomes) */
  usedModels: string[]
}) {
  const [custom, setCustom] = useState(value.range.kind === 'custom')
  const models = IMAGE_MODELS.filter((m) => usedModels.includes(m.name))
  const active = value.range.kind !== 'all' || value.models.length > 0
  return (
    <BarPopover anchor={anchor} label="Período" width={304} onClose={onClose}>
      {RANGES.map((r) => {
        const on = !custom && value.range.kind === r.kind
        return (
          <button
            key={r.kind}
            type="button"
            className={`igp-item${on ? ' is-on' : ''}`}
            role="menuitemradio"
            aria-checked={on}
            onClick={() => {
              setCustom(false)
              onChange({ ...value, range: { kind: r.kind } })
            }}
          >
            {r.label}
            {on && <Check className="igp-check" size={15} strokeWidth={2.4} />}
          </button>
        )
      })}
      <button
        type="button"
        className={`igp-item${custom ? ' is-on' : ''}`}
        role="menuitemradio"
        aria-checked={custom}
        aria-expanded={custom}
        onClick={() => setCustom((c) => !c)}
      >
        Personalizado
        {value.range.kind === 'custom' && <span className="gf-range-val">{rangeLabel(value.range)}</span>}
        <ChevronRight className={`gf-chev${custom ? ' is-open' : ''}`} size={15} strokeWidth={2} />
      </button>
      {custom && (
        <RangeCalendar
          value={value.range.kind === 'custom' ? value.range : null}
          onChange={(v) => onChange({ ...value, range: { kind: 'custom', ...v } })}
        />
      )}

      <div className="gf-sep" />
      <div className="igp-label">Modelos</div>
      {models.map((m) => {
        const on = value.models.includes(m.name)
        return (
          <button
            key={m.id}
            type="button"
            className="igp-item"
            role="menuitemcheckbox"
            aria-checked={on}
            onClick={() =>
              onChange({
                ...value,
                models: on ? value.models.filter((x) => x !== m.name) : [...value.models, m.name],
              })
            }
          >
            <span className={`cd-filter-box${on ? ' is-on' : ''}`} aria-hidden="true">
              {on && <Check size={11} strokeWidth={3} />}
            </span>
            <ImageModelLogo model={m} size={20} />
            {m.name}
          </button>
        )
      })}

      {active && (
        <>
          <div className="gf-sep" />
          <button
            type="button"
            className="igp-item gf-clear"
            onClick={() => {
              setCustom(false)
              onChange(EMPTY_GEN_FILTERS)
            }}
          >
            Limpar filtros
          </button>
        </>
      )}
    </BarPopover>
  )
}
