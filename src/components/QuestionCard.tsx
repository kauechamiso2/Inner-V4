import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Check, ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react'
import './question-card.css'
import AgentOrb from './AgentOrb'
import { PlusIcon } from './SidebarIcons'
import type { ChosenAgent } from './agents'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

export type Question = { question: string; options: string[] }

/* texto escolhido ou digitado; null = pulada; undefined = ainda sem resposta */
export type QuestionAnswer = string | null | undefined

type Phase = 'enter' | 'open' | 'leave'

/* expansão/recolhimento do card (casa com o CSS) */
const MORPH_MS = 560
/* check animado na opção antes de avançar */
const PICK_MS = 380
/* resposta digitada ou "Pular": avança quase direto */
const SKIP_MS = 140

/* Card de perguntas do agente. Nasce idêntico à pílula do input (mesmas classes
   e métricas do composer), cresce pra cima revelando pergunta e opções, e
   recolhe de volta à pílula ao terminar: a troca composer ⇄ card é invisível. */
export default function QuestionCard({
  agent,
  questions,
  placeholder,
  onFinish,
  onClosed,
}: {
  /* agente escolhido no onboarding: foto no cabeçalho do card */
  agent: ChosenAgent | null
  questions: Question[]
  /* placeholder do composer: a camada "input" imita a pílula no início/fim do morph */
  placeholder: string
  /* respostas (null se o usuário fechou); chamado quando o card começa a recolher */
  onFinish: (answers: QuestionAnswer[] | null) => void
  /* fim do recolhimento: o composer volta no lugar */
  onClosed: () => void
}) {
  const [phase, setPhase] = useState<Phase>('enter')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<QuestionAnswer[]>(() => questions.map(() => undefined))
  /* opção recém-escolhida (check animado) e a destacada pelo teclado/mouse */
  const [picked, setPicked] = useState<number | null>(null)
  const [active, setActive] = useState(-1)
  /* direção da troca de pergunta (1 avança, -1 volta) */
  const [dir, setDir] = useState(1)
  const [swapped, setSwapped] = useState(false)
  const [text, setText] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const busy = useRef(false)
  const closing = useRef(false)

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  /* monta como a pílula e expande no frame seguinte (a transição precisa
     de um estado inicial pintado) */
  useEffect(() => {
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setPhase('open')
        cardRef.current?.focus({ preventScroll: true })
      })
    })
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [])

  const last = questions.length - 1
  const q = questions[index]
  const current = answers[index]

  const goTo = (i: number, d: number) => {
    if (i < 0 || i > last || i === index) return
    setDir(d)
    setSwapped(true)
    setIndex(i)
    setActive(-1)
    setPicked(null)
    setText('')
  }

  /* navegação manual (paginador/setas): bloqueada durante o check de uma escolha */
  const navigate = (i: number, d: number) => {
    if (busy.current || closing.current) return
    goTo(i, d)
  }

  const finish = (final: QuestionAnswer[] | null) => {
    if (closing.current) return
    closing.current = true
    setPhase('leave')
    onFinish(final)
    later(onClosed, MORPH_MS)
  }

  const answer = (value: string | null, option: number | null) => {
    if (busy.current || closing.current || phase !== 'open') return
    busy.current = true
    const next = answers.slice()
    next[index] = value
    setAnswers(next)
    if (option !== null) setPicked(option)
    later(
      () => {
        if (index < last) {
          busy.current = false
          goTo(index + 1, 1)
        } else {
          finish(next)
        }
      },
      option !== null ? PICK_MS : SKIP_MS,
    )
  }

  const submitText = () => {
    const v = text.trim()
    if (v) answer(v, null)
  }

  /* atalhos: 1-4 escolhem, ↑↓ + Enter, ←→ navegam, Esc fecha (fora do campo) */
  useEffect(() => {
    if (phase !== 'open') return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        if (e.key === 'Escape' && t.classList.contains('qcard-field')) {
          t.blur()
          cardRef.current?.focus({ preventScroll: true })
        }
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= q.options.length) {
        e.preventDefault()
        answer(q.options[n - 1], n - 1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => (a + 1) % q.options.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => (a <= 0 ? q.options.length - 1 : a - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigate(index + 1, 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigate(index - 1, -1)
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault()
        answer(q.options[active], active)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        finish(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const open = phase === 'open'

  return (
    <div
      ref={cardRef}
      className={`qcard${open ? ' is-open' : ''}${phase === 'leave' ? ' is-leave' : ''}${swapped ? ' has-swapped' : ''}`}
      style={
        {
          '--q-dx': swapped ? `${dir * 14}px` : '0px',
          '--q-dy': swapped ? '0px' : '8px',
        } as CSSProperties
      }
      role="dialog"
      aria-label="Perguntas do agente"
      tabIndex={-1}
    >
      {/* pergunta + opções: crescem por altura real, empurrando o card pra cima */}
      <div className="qcard-top">
        <div className="qcard-top-inner">
          <div className="qcard-head">
            <span className="qcard-av" aria-hidden="true">
              {agent && !agent.orb && agent.img ? (
                <img src={agent.img} alt="" draggable={false} />
              ) : (
                <AgentOrb size={20} />
              )}
            </span>
            <p className="qcard-q" key={`q-${index}`}>
              {q.question}
            </p>
            <div className="qcard-pager">
              <button
                type="button"
                className="qcard-pg"
                aria-label="Pergunta anterior"
                disabled={index === 0}
                tabIndex={open ? 0 : -1}
                onClick={() => navigate(index - 1, -1)}
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="qcard-count">
                {index + 1} de {questions.length}
              </span>
              <button
                type="button"
                className="qcard-pg"
                aria-label="Próxima pergunta"
                disabled={index === last}
                tabIndex={open ? 0 : -1}
                onClick={() => navigate(index + 1, 1)}
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="qcard-pg qcard-close"
                aria-label="Fechar perguntas"
                tabIndex={open ? 0 : -1}
                onClick={() => finish(null)}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="qcard-opts" key={`o-${index}`}>
            {q.options.map((opt, i) => {
              const isPicked = picked === i || (picked === null && current === opt)
              return (
                <button
                  key={opt}
                  type="button"
                  className={`qcard-opt${active === i ? ' is-active' : ''}${isPicked ? ' is-picked' : ''}`}
                  style={{ '--i': i } as CSSProperties}
                  aria-pressed={isPicked}
                  tabIndex={open ? 0 : -1}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive((a) => (a === i ? -1 : a))}
                  onClick={() => answer(opt, i)}
                >
                  <span className="qcard-key" aria-hidden="true">
                    <span className="qcard-key-n">{i + 1}</span>
                    <Check className="qcard-key-c" size={12} strokeWidth={3} />
                  </span>
                  <span className="qcard-opt-label">{opt}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* linha de baixo: começa como o input (pílula) e vira a linha de resposta */}
      <div className="qcard-row">
        <div className="qcard-layer is-input" aria-hidden="true">
          <span className="ch-attach">
            <PlusIcon />
          </span>
          <span className="qcard-ph">{placeholder}</span>
          <span className="chat-mic">
            <img src={microphone} alt="" />
          </span>
          <span className="chat-send">
            <img src={arrowUp} alt="" />
          </span>
        </div>

        <div className="qcard-layer is-answer">
          <span className="qcard-pencil" aria-hidden="true">
            <Pencil size={17} strokeWidth={1.8} />
          </span>
          <input
            className="qcard-field"
            type="text"
            placeholder="Digitar resposta..."
            aria-label="Digitar outra resposta"
            spellCheck={false}
            value={text}
            tabIndex={open ? 0 : -1}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submitText()
              }
            }}
          />
          <button type="button" className="chat-mic" aria-label="Falar" tabIndex={open ? 0 : -1}>
            <img src={microphone} alt="" aria-hidden="true" />
          </button>
          {text.trim() ? (
            <button
              type="button"
              className="chat-send is-ready qcard-send"
              aria-label="Responder"
              tabIndex={open ? 0 : -1}
              onClick={submitText}
            >
              <img src={arrowUp} alt="" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="qcard-skip"
              tabIndex={open ? 0 : -1}
              onClick={() => answer(null, null)}
            >
              Pular
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
