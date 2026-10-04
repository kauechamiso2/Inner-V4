import { useEffect, useState } from 'react'
import './coachmark.css'
import coachArrow from '../assets/coach-arrow.svg'
import coachX from '../assets/coach-x.svg'

type Props = {
  open: boolean
  onDismiss: () => void
  /* dependências de layout que movem o item Library (re-ancora o card) */
  anchorKey: string
}

/* Coachmark "Conheça a Biblioteca" — Figma node 543:892, ancorado ao item da sidebar */
export default function LibraryCoachmark({ open, onDismiss, anchorKey }: Props) {
  const [closing, setClosing] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!open) return
    setClosing(false)

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

    /* segue a âncora frame a frame enquanto a sidebar anima (abre/fecha,
       troca de diagramação, reordenações) — o card desliza colado nela */
    let raf = 0
    const start = performance.now()
    const follow = () => {
      update()
      if (performance.now() - start < 640) raf = requestAnimationFrame(follow)
    }
    follow()
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
    }
  }, [open, anchorKey])

  if (!open || !pos) return null

  const dismiss = () => {
    setClosing(true)
    window.setTimeout(onDismiss, 170)
  }

  return (
    <div
      className={`coachmark${closing ? ' is-closing' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Conheça a Biblioteca"
    >
      <img className="coachmark-arrow" src={coachArrow} alt="" aria-hidden="true" />
      <div className="coachmark-card">
        <div className="coachmark-top">
          <span className="coachmark-badge">NOVO</span>
          <button className="coachmark-close" type="button" aria-label="Fechar" onClick={dismiss}>
            <img src={coachX} alt="" aria-hidden="true" />
          </button>
        </div>
        <p className="coachmark-title">Conheça a Biblioteca</p>
        <p className="coachmark-body">
          Todas as suas gerações e uploads, organizados em um só lugar. Adicione arquivos como
          conhecimento e use em qualquer conversa.
        </p>
      </div>
    </div>
  )
}
