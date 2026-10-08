import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import './onboarding.css'
import bg from '../assets/onboarding-bg.webp'
import logo from '../assets/logo.svg'
import { AGENTS } from './agents'

type Props = {
  /* chamado ao clicar em "Continuar" (plataforma começa a entrar) */
  onContinue?: (agentId: string, name: string) => void
  /* chamado quando a animação de saída termina (desmonta o onboarding) */
  onDone?: (agentId: string, name: string) => void
}

/* A View Transition retorna um objeto com promises (ready/finished) que
   podem rejeitar quando a animação é abortada — aba em segundo plano, resize,
   reload/HMR. Tipamos como opcionais para engolir a rejeição com segurança. */
type ViewTransitionLike = {
  ready?: Promise<void>
  finished?: Promise<void>
}
type DocVT = Document & {
  startViewTransition?: (cb: () => void) => ViewTransitionLike
}

export default function Onboarding({ onContinue, onDone }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [scale, setScale] = useState(1)
  const [exiting, setExiting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const choosing = selected !== null
  const agent = AGENTS.find((a) => a.id === selected)

  useLayoutEffect(() => {
    const compute = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080, 1)
      setScale(Math.max(0.5, s))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  const choose = (id: string) => {
    const a = AGENTS.find((x) => x.id === id)
    if (!a) return
    const apply = () => {
      setSelected(id)
      setName(a.name)
    }
    const doc = document as DocVT
    if (!choosing && typeof doc.startViewTransition === 'function') {
      const vt = doc.startViewTransition(() => flushSync(apply))
      /* se a transição for abortada, a promise rejeita — tratamos para não
         vazar "InvalidStateError" no console (a animação segue via CSS). */
      vt?.ready?.catch(() => {})
      vt?.finished?.catch(() => {})
    } else {
      apply()
    }
  }

  const finish = () => {
    if (!agent || exiting) return
    onContinue?.(agent.id, name.trim())
    setExiting(true)
    window.setTimeout(() => onDone?.(agent.id, name.trim()), 600)
  }

  const rightStyle = agent
    ? ({
        '--ob-tile-to': agent.tileTo,
        '--g1': agent.glow[0],
        '--g2': agent.glow[1],
        '--g3': agent.glow[2],
      } as CSSProperties)
    : undefined

  const label = name.trim() || 'Name'

  return (
    <div className={`ob${choosing ? ' is-choosing' : ''}${exiting ? ' is-exiting' : ''}`}>
      <img className="ob-bg" src={bg} alt="" aria-hidden="true" draggable={false} />
      {AGENTS.map((a) => (
        <img
          key={a.id}
          className={`ob-world${selected === a.id ? ' is-on' : ''}`}
          src={a.world}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      ))}

      <div className="ob-stage" style={{ transform: `scale(${scale})` }}>
        <div className={`ob-card${choosing ? ' is-choosing' : ''}`}>
          <div className="ob-left">
            <div className="ob-head">
              <h1 className="ob-title">Alguém novo chegou pra te ajudar 👋</h1>
              <p className="ob-sub">
                Diga oi pro seu novo companheiro! Daqui pra frente é vocês dois.
                <br />
                Escolhe o seu e batiza do jeito que quiser.
              </p>
            </div>

            <div className="ob-grid">
              {AGENTS.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  className={`ob-opt${selected === a.id ? ' is-selected' : ''}`}
                  style={{ '--i': i } as CSSProperties}
                  aria-pressed={selected === a.id}
                  aria-label={`Escolher companheiro ${i + 1}`}
                  onClick={() => choose(a.id)}
                >
                  <img className="ob-slot" src={a.img} alt="" draggable={false} />
                </button>
              ))}
            </div>
          </div>

          {choosing && agent && (
            <div className="ob-right" style={rightStyle}>
              <div className="ob-name-tile">
                <img className="ob-name-av" src={agent.img} alt="" draggable={false} />
                <div className="ob-name-field">
                  <input
                    ref={nameRef}
                    className="ob-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={18}
                    spellCheck={false}
                    placeholder="Name"
                    aria-label="Nome do agente"
                  />
                  <button
                    type="button"
                    className="ob-name-edit"
                    aria-label="Editar nome"
                    onClick={() => nameRef.current?.focus()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M21.3112 6.87844L17.1216 2.68969C16.9823 2.55036 16.8169 2.43984 16.6349 2.36444C16.4529 2.28904 16.2578 2.25023 16.0608 2.25023C15.8638 2.25023 15.6687 2.28904 15.4867 2.36444C15.3047 2.43984 15.1393 2.55036 15 2.68969L3.43969 14.25C3.29979 14.3888 3.18888 14.554 3.1134 14.736C3.03792 14.918 2.99937 15.1133 3 15.3103V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10217 21 4.5 21H20.25C20.4489 21 20.6397 20.921 20.7803 20.7803C20.921 20.6397 21 20.4489 21 20.25C21 20.0511 20.921 19.8603 20.7803 19.7197C20.6397 19.579 20.4489 19.5 20.25 19.5H10.8112L21.3112 9C21.4506 8.86071 21.5611 8.69533 21.6365 8.51332C21.7119 8.33131 21.7507 8.13623 21.7507 7.93922C21.7507 7.74221 21.7119 7.54712 21.6365 7.36511C21.5611 7.1831 21.4506 7.01773 21.3112 6.87844ZM8.68969 19.5H4.5V15.3103L12.75 7.06031L16.9397 11.25L8.68969 19.5ZM18 10.1897L13.8112 6L16.0612 3.75L20.25 7.93969L18 10.1897Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <span className="ob-name-line" aria-hidden="true" />
                </div>
              </div>

              <div className="ob-go-wrap">
                <button type="button" className="ob-name-go" onClick={finish}>
                  Continuar com {label}
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="ob-footer">
          <img className="ob-logo" src={logo} alt="Inner AI" draggable={false} />
        </footer>
      </div>
    </div>
  )
}
