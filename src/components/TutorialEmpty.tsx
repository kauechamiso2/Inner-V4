import type { CSSProperties, ReactNode } from 'react'
import { Play } from 'lucide-react'
import tutorialThumb from '../assets/task-tutorial.webp'
import './tasks-page.css'

/* Empty state no formato do de Tarefas: card com título, passos 1-2-3, CTA e
   um vídeo-tutorial. A thumb é dividida: apresentadora à esquerda e a arte do
   pilar à direita (art). */
export default function TutorialEmpty({
  title,
  steps,
  cta,
  caption,
  duration,
  art,
}: {
  title: string
  steps: { strong: string; rest: string }[]
  cta: ReactNode
  caption: string
  duration: string
  art: ReactNode
}) {
  return (
    <div className="tasks-empty">
      <article className="te-tutorial" style={{ '--d': '40ms' } as CSSProperties}>
        <div className="te-tutorial-text">
          <h3 className="te-tutorial-title">{title}</h3>
          <ol className="te-steps">
            {steps.map((s, i) => (
              <li className="te-step" key={s.strong}>
                <span className="te-step-num">{i + 1}</span>
                <span className="te-step-text">
                  <strong>{s.strong}</strong> {s.rest}
                </span>
              </li>
            ))}
          </ol>
          {cta}
        </div>
        <button type="button" className="te-tutorial-video is-split" aria-label={`Assistir: ${caption}`}>
          <span className="te-split-left" style={{ backgroundImage: `url(${tutorialThumb})` }} aria-hidden="true" />
          <span className="te-split-right" aria-hidden="true">
            {art}
          </span>
          <span className="te-tutorial-grad" aria-hidden="true" />
          <span className="te-tutorial-caption">{caption}</span>
          <span className="te-tutorial-dur">
            <Play size={11} strokeWidth={0} fill="currentColor" aria-hidden="true" />
            {duration}
          </span>
          <span className="te-tutorial-play" aria-hidden="true">
            <Play size={20} strokeWidth={0} fill="currentColor" />
          </span>
        </button>
      </article>
    </div>
  )
}

/* arte de Projetos: pastas empilhadas com conversa, arquivo e contexto */
export function ProjectsArt() {
  return (
    <span className="te-art te-art-projects">
      <span className="te-art-card is-back">
        <span className="te-art-emoji">💬</span>
        <span className="te-art-line" />
        <span className="te-art-line is-short" />
      </span>
      <span className="te-art-card is-mid">
        <span className="te-art-emoji">📎</span>
        <span className="te-art-line" />
        <span className="te-art-line is-short" />
      </span>
      <span className="te-art-card is-front">
        <span className="te-art-emoji is-big">📁</span>
        <span className="te-art-title" />
        <span className="te-art-line" />
      </span>
    </span>
  )
}

/* arte da Biblioteca: arquivos de tipos diferentes entrando numa base */
export function LibraryArt() {
  return (
    <span className="te-art te-art-library">
      <span className="te-art-chip is-a">📄</span>
      <span className="te-art-chip is-b">📊</span>
      <span className="te-art-chip is-c">🖼️</span>
      <span className="te-art-base">
        <span className="te-art-base-top" />
        <span className="te-art-emoji is-big">🧠</span>
      </span>
    </span>
  )
}
