import { useEffect, useState } from 'react'
import './coachmark.css'
import coachArrow from '../assets/coach-arrow.svg'
import coachX from '../assets/coach-x.svg'

type Props = {
  /* dependências de layout que movem o item Library (re-ancora o card) */
  anchorKey: string
}

const STORAGE_KEY = 'inner-v4-coach-library'

/* Coachmark "Conheça a Library" — Figma node 543:892, ancorado ao item da sidebar */
export default function LibraryCoachmark({ anchorKey }: Props) {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== 'dismissed'
    } catch {
      return true
    }
  })
  const [closing, setClosing] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!open) return
    const update = () => {
      const el = document.querySelector('aside.sidebar a[href="#library"]')
      if (!el) {
        setPos(null)
        return
      }
      const r = el.getBoundingClientRect()
      /* centro da seta (top 22 + 8) alinhado ao centro vertical do item */
      setPos({ top: r.top + r.height / 2 - 30, left: r.right + 6 })
    }
    update()
    /* reposiciona após a animação de colapso/troca de diagramação assentar */
    const t = window.setTimeout(update, 540)
    window.addEventListener('resize', update)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', update)
    }
  }, [open, anchorKey])

  if (!open || !pos) return null

  const dismiss = () => {
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      try {
        sessionStorage.setItem(STORAGE_KEY, 'dismissed')
      } catch {
        /* storage indisponível */
      }
    }, 170)
  }

  return (
    <div
      className={`coachmark${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Conheça a Library"
    >
      <img className="coachmark-arrow" src={coachArrow} alt="" aria-hidden="true" />
      <div className="coachmark-card">
        <div className="coachmark-top">
          <span className="coachmark-badge">NOVO</span>
          <button className="coachmark-close" type="button" aria-label="Fechar" onClick={dismiss}>
            <img src={coachX} alt="" aria-hidden="true" />
          </button>
        </div>
        <p className="coachmark-title">Conheça a Library</p>
        <p className="coachmark-body">
          Todas as suas gerações e uploads, organizados em um só lugar. Adicione arquivos como
          conhecimento e use em qualquer conversa.
        </p>
      </div>
    </div>
  )
}
