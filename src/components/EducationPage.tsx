import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Award, BadgeCheck, Check, ChevronLeft, ChevronRight, Clock3, Pause, Play, PlayCircle, X } from 'lucide-react'
import tStart from '../assets/academy/tutorials/fast-start.svg'
import tChat from '../assets/academy/tutorials/chat.svg'
import tImage from '../assets/academy/tutorials/image.svg'
import tVideo from '../assets/academy/tutorials/video.svg'
import tAudio from '../assets/academy/tutorials/audio.svg'
import tSlides from '../assets/academy/tutorials/slides.svg'
import tAccount from '../assets/academy/tutorials/my-account.svg'
import tMobile from '../assets/academy/tutorials/mobile-app.svg'
import tModels from '../assets/academy/tutorials/models-guide.svg'
import { COURSES, modulesOf, progressMemo } from './educationData'
import type { Course } from './educationData'
import './images-page.css'
import './video-gen.css'
import './education.css'
import searchIcon from '../assets/search-light.svg'
import { normSearch } from './SearchToggle'

/* Educação (Inner Academy): capa com o certificado, tutoriais da plataforma
   (pareados com a cor e o ícone de cada pilar) e o catálogo de cursos.
   Abrir um curso leva para a página dele (player + aulas + progresso). */

type Tutorial = { id: string; title: string; desc: string; img: string; dur: number }
/* os 9 tutoriais da Academy, com as artes oficiais */
const TUTORIALS: Tutorial[] = [
  { id: 'start', title: 'Início rápido', desc: 'Inicie aqui sua jornada!', img: tStart, dur: 95 },
  { id: 'chat', title: 'Chat', desc: 'Como trabalhar com o Chat da melhor forma possível', img: tChat, dur: 140 },
  { id: 'imagens', title: 'Imagens', desc: 'Como gerar e trabalhar com imagens na plataforma', img: tImage, dur: 182 },
  { id: 'videos', title: 'Vídeos', desc: 'Como criar vídeos da melhor forma possível', img: tVideo, dur: 167 },
  { id: 'audio', title: 'Áudio', desc: 'Aprenda como trabalhar com áudios dentro da Inner AI', img: tAudio, dur: 121 },
  { id: 'slides', title: 'Slides', desc: 'Aprenda como criar apresentações dentro da Inner AI', img: tSlides, dur: 116 },
  { id: 'conta', title: 'Minha conta', desc: 'Aprenda como organizar e administrar sua conta na Inner', img: tAccount, dur: 88 },
  { id: 'app', title: 'Aplicativo de celular', desc: 'Entenda como navegar pelo aplicativo da Inner AI', img: tMobile, dur: 104 },
  { id: 'modelos', title: 'Guia de Modelos', desc: 'Entenda a fundo sobre todos os modelos da plataforma', img: tModels, dur: 212 },
]

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const FILTERS = ['Todos', 'Iniciante', 'Especializado', 'Com certificado', 'Em andamento', 'Tutoriais']

export default function EducationPage() {
  const [course, setCourse] = useState<Course | null>(null)
  const [tutorial, setTutorial] = useState<Tutorial | null>(null)
  const [filter, setFilter] = useState('Todos')
  const [query, setQuery] = useState('')

  if (course) return <CourseDetail key={course.id} course={course} onBack={() => setCourse(null)} />

  const nq = normSearch(query)
  const doneOf = (c: Course) => progressMemo[c.id]?.size ?? 0
  const started = COURSES.filter((c) => doneOf(c) > 0 && doneOf(c) < c.lessons)
  const courses = COURSES.filter(
    (c) =>
      (!nq || normSearch(`${c.title} ${c.desc} ${c.instructors.map((i) => i.name).join(' ')}`).includes(nq)) &&
      (filter === 'Todos' ||
        (filter === 'Iniciante' && c.level === 'Iniciante') ||
        (filter === 'Especializado' && c.level === 'Especializado') ||
        (filter === 'Com certificado' && c.certificate) ||
        (filter === 'Em andamento' && doneOf(c) > 0)),
  )
  const tutorials = TUTORIALS.filter((t) => !nq || normSearch(`${t.title} ${t.desc}`).includes(nq))
  const showTutorials = (filter === 'Todos' || filter === 'Tutoriais') && tutorials.length > 0
  const showCourses = filter !== 'Tutoriais'
  const empty = (!showTutorials || tutorials.length === 0) && (!showCourses || courses.length === 0)

  const card = (c: Course, i: number) => {
    const done = doneOf(c)
    return (
      <article
        key={c.id}
        className="edu-card"
        style={{ '--i': i } as CSSProperties}
        role="button"
        tabIndex={0}
        onClick={() => setCourse(c)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setCourse(c))}
      >
        <div className="edu-cover">
          <img src={c.cover} alt="" loading="lazy" />
          {c.badge && <span className="edu-badge">{c.badge}</span>}
          <span className="edu-cover-play" aria-hidden="true">
            <Play size={16} strokeWidth={0} fill="currentColor" style={{ marginLeft: 2 }} />
          </span>
          {done > 0 && (
            <span className="edu-cover-progress" aria-label={`${Math.round((done / c.lessons) * 100)}% concluído`}>
              <span style={{ width: `${(done / c.lessons) * 100}%` }} />
            </span>
          )}
        </div>
        <div className="edu-card-body">
          <h3>{c.title}</h3>
          <Chips c={c} />
          <p>{c.desc}</p>
          <Instructors c={c} />
        </div>
      </article>
    )
  }

  return (
    <main className="images-page edu-page">
      <div className="ip-container edu-container">
        <h1 className="ip-title">Educação</h1>

        <label className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar cursos e tutoriais" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>

        <div className="ip-categories edu-filters">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`ip-pill${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="edu-content" key={`${filter}-${nq}`}>
          {/* continuar: cursos começados e não terminados */}
          {filter === 'Todos' && !nq && started.length > 0 && (
            <section className="edu-section">
              <h2 className="edu-h2">Continue de onde parou</h2>
              <div className="edu-continue">
                {started.map((c, i) => {
                  const pct = Math.round((doneOf(c) / c.lessons) * 100)
                  return (
                    <button type="button" key={c.id} className="edu-cont" style={{ '--i': i } as CSSProperties} onClick={() => setCourse(c)}>
                      <span className="edu-cont-cover">
                        <img src={c.cover} alt="" />
                      </span>
                      <span className="edu-cont-text">
                        <strong>{c.title}</strong>
                        <span className="edu-cont-track">
                          <span style={{ width: `${pct}%` }} />
                        </span>
                        <span className="edu-cont-meta">
                          {doneOf(c)} de {c.lessons} aulas · {pct}%
                        </span>
                      </span>
                      <span className="edu-cont-play" aria-hidden="true">
                        <Play size={14} strokeWidth={0} fill="currentColor" style={{ marginLeft: 2 }} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {showTutorials && (
            <Carousel title="Tutoriais da plataforma" wrap={filter === 'Tutoriais'}>
              {tutorials.map((t, i) => (
                <button type="button" key={t.id} className="edu-tut" style={{ '--i': i } as CSSProperties} onClick={() => setTutorial(t)}>
                  <span className="edu-tut-ic">
                    <img src={t.img} alt="" />
                  </span>
                  <span className="edu-tut-text">
                    <strong>{t.title}</strong>
                    <span>{t.desc}</span>
                  </span>
                </button>
              ))}
            </Carousel>
          )}

          {showCourses && courses.length > 0 && (
            <section className="edu-section">
              <h2 className="edu-h2">{filter === 'Todos' ? 'Explore os cursos' : filter}</h2>
              <div className="edu-grid">{courses.map(card)}</div>
            </section>
          )}

          {empty && <p className="vg-empty">Nada encontrado.</p>}
        </div>
      </div>

      {tutorial && <TutorialModal t={tutorial} onClose={() => setTutorial(null)} />}
    </main>
  )
}

function Chips({ c }: { c: Course }) {
  return (
    <div className="edu-chips">
      <span>
        <PlayCircle size={13} strokeWidth={2} />
        {c.lessons} aulas
      </span>
      <span>{c.level}</span>
      {c.certificate && (
        <span>
          <Award size={13} strokeWidth={2} />
          Certificado
        </span>
      )}
    </div>
  )
}

function Instructors({ c }: { c: Course }) {
  return (
    <ul className="edu-instructors">
      {c.instructors.map((p) => (
        <li key={p.name}>
          <strong>{p.name}</strong>
          {p.logo ? <img className="edu-org-logo" src={p.logo} alt={p.org} title={p.org} /> : <span className="edu-org">{p.org}</span>}
        </li>
      ))}
    </ul>
  )
}

/* certificado desenhado (capa e conclusão do curso) */
function Certificate({ className = '', name = 'Nome', course }: { className?: string; name?: string; course?: string }) {
  return (
    <div className={`edu-cert ${className}`}>
      <span className="edu-cert-brand">
        Inner <em>Academy</em>
      </span>
      <span className="edu-cert-title">Certificado de Conclusão</span>
      <span className="edu-cert-name">{name}</span>
      <span className="edu-cert-line" />
      <span className="edu-cert-text">
        {course
          ? `Concluiu com êxito o curso "${course}", oferecido pela Inner Academy.`
          : 'Certificamos que o portador deste certificado concluiu com êxito o curso oferecido pela Inner Academy.'}
      </span>
    </div>
  )
}

/* fileira horizontal com setas (só quando não cabe) */
function Carousel({ title, children, wrap = false }: { title: string; children: ReactNode; wrap?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const update = () => {
    const el = ref.current
    if (!el) return
    const start = el.scrollLeft <= 2
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
    setEdge((p) => (p.start === start && p.end === end ? p : { start, end }))
  }
  useEffect(() => {
    update()
    const el = ref.current
    const ro = el ? new ResizeObserver(update) : null
    if (el) ro?.observe(el)
    return () => ro?.disconnect()
  }, [])
  const scroll = (dir: number) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <section className="edu-section">
      <div className="edu-section-head">
        <h2 className="edu-h2">{title}</h2>
        <div className="edu-arrows" hidden={wrap}>
          <button type="button" aria-label="Anteriores" disabled={edge.start} onClick={() => scroll(-1)}>
            <ChevronLeft size={17} strokeWidth={2.2} />
          </button>
          <button type="button" aria-label="Próximos" disabled={edge.end} onClick={() => scroll(1)}>
            <ChevronRight size={17} strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <div className={`edu-rail${wrap ? ' is-wrap' : ''}${edge.start ? '' : ' has-prev'}${edge.end ? '' : ' has-next'}`}>
        <div className="edu-rail-track" ref={ref} onScroll={update}>
          {children}
        </div>
      </div>
    </section>
  )
}

/* player simulado (protótipo, sem arquivo de vídeo) */
function usePlayer(dur: number) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      setT((x) => {
        if (x + dt >= dur) {
          setPlaying(false)
          return dur
        }
        return x + dt
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [playing, dur])
  const toggle = () => {
    if (playing) return setPlaying(false)
    if (t >= dur) setT(0)
    setPlaying(true)
  }
  return { t, setT, playing, toggle, reset: () => (setT(0), setPlaying(false)) }
}

function Player({ cover, art, title, dur, onEnd }: { cover?: string; art?: string; title: string; dur: number; onEnd?: () => void }) {
  const p = usePlayer(dur)
  const barRef = useRef<HTMLDivElement>(null)
  const ended = useRef(false)
  useEffect(() => {
    if (p.t >= dur && !ended.current) {
      ended.current = true
      onEnd?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.t])
  const seekAt = (x: number) => {
    const r = barRef.current?.getBoundingClientRect()
    if (r) p.setT(Math.min(1, Math.max(0, (x - r.left) / r.width)) * dur)
  }
  return (
    <div className={`edu-player${p.playing ? ' is-playing' : ''}`}>
      <div className="edu-player-stage" onClick={p.toggle}>
        {cover ? (
          <img src={cover} alt="" />
        ) : (
          <span className="edu-player-art">
            <img src={art} alt="" />
          </span>
        )}
        <span className="edu-player-shade" />
        <span className="edu-player-title">{title}</span>
        <span className="edu-player-btn" aria-hidden="true">
          {p.playing ? <Pause size={22} strokeWidth={0} fill="currentColor" /> : <Play size={22} strokeWidth={0} fill="currentColor" style={{ marginLeft: 3 }} />}
        </span>
      </div>
      <div className="edu-player-bar">
        <button type="button" className="edu-player-mini" aria-label={p.playing ? 'Pausar' : 'Tocar'} onClick={p.toggle}>
          {p.playing ? <Pause size={14} strokeWidth={0} fill="currentColor" /> : <Play size={14} strokeWidth={0} fill="currentColor" />}
        </button>
        <span className="edu-player-time">{fmt(p.t)}</span>
        <div
          ref={barRef}
          className="edu-player-track"
          role="slider"
          tabIndex={0}
          aria-label="Posição"
          aria-valuemin={0}
          aria-valuemax={dur}
          aria-valuenow={Math.round(p.t)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            seekAt(e.clientX)
          }}
          onPointerMove={(e) => e.buttons === 1 && seekAt(e.clientX)}
        >
          <span style={{ width: `${(p.t / dur) * 100}%` }} />
        </div>
        <span className="edu-player-time">{fmt(dur)}</span>
      </div>
    </div>
  )
}

/* ---------- tutorial em modal ---------- */
function TutorialModal({ t, onClose }: { t: Tutorial; onClose: () => void }) {
  const [closing, setClosing] = useState(false)
  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return createPortal(
    <div className={`edu-modal${closing ? ' is-closing' : ''}`} onClick={close} role="dialog" aria-modal="true" aria-label={`Tutorial: ${t.title}`}>
      <div className="edu-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="edu-modal-head">
          <div>
            <span className="edu-modal-kicker">Tutorial · {fmt(t.dur)}</span>
            <h2>{t.title}</h2>
          </div>
          <button type="button" className="edu-icon-btn" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>
        <Player art={t.img} title={t.desc} dur={t.dur} />
      </div>
    </div>,
    document.body,
  )
}

/* ---------- página do curso ---------- */
function CourseDetail({ course: c, onBack }: { course: Course; onBack: () => void }) {
  const modules = modulesOf(c)
  const all = modules.flatMap((m) => m.lessons)
  const [done, setDone] = useState<Set<string>>(() => new Set(progressMemo[c.id] ?? []))
  const [current, setCurrent] = useState(() => all.find((l) => !done.has(l.id)) ?? all[0])
  const [celebrate, setCelebrate] = useState(false)
  const pct = Math.round((done.size / all.length) * 100)
  const complete = done.size === all.length

  const save = (next: Set<string>) => {
    progressMemo[c.id] = next
    setDone(next)
  }
  const toggleDone = (id: string) => {
    const next = new Set(done)
    next.has(id) ? next.delete(id) : next.add(id)
    save(next)
    if (next.size === all.length && done.size !== all.length) setCelebrate(true)
  }
  const finishCurrent = () => {
    if (!done.has(current.id)) toggleDone(current.id)
    const idx = all.findIndex((l) => l.id === current.id)
    if (idx < all.length - 1) setCurrent(all[idx + 1])
  }
  const curIdx = all.findIndex((l) => l.id === current.id)
  const toSec = (d: string) => {
    const [m, s] = d.split(':').map(Number)
    return m * 60 + s
  }

  return (
    <main className="images-page edu-page">
      <div className="edu-course">
        <button type="button" className="edu-back" onClick={onBack}>
          <ChevronLeft size={16} strokeWidth={2.2} />
          Cursos
        </button>

        <div className="edu-course-grid">
          <div className="edu-course-main">
            <Player key={current.id} cover={c.cover} title={current.title} dur={toSec(current.dur)} onEnd={finishCurrent} />

            <div className="edu-lesson-head">
              <div>
                <span className="edu-lesson-kicker">
                  Aula {curIdx + 1} de {all.length}
                </span>
                <h1>{current.title}</h1>
              </div>
              <button type="button" className={`edu-done-btn${done.has(current.id) ? ' is-done' : ''}`} onClick={() => toggleDone(current.id)}>
                <span className="edu-done-ic" key={String(done.has(current.id))}>
                  {done.has(current.id) ? <Check size={15} strokeWidth={2.6} /> : <BadgeCheck size={15} strokeWidth={2} />}
                </span>
                {done.has(current.id) ? 'Concluída' : 'Marcar como concluída'}
              </button>
            </div>

            <section className="edu-about">
              <h2>{c.title}</h2>
              <Chips c={c} />
              <p>{c.desc}</p>
              <Instructors c={c} />
            </section>
          </div>

          <aside className="edu-side">
            <div className="edu-progress">
              <div className="edu-progress-head">
                <strong>Seu progresso</strong>
                <span>{pct}%</span>
              </div>
              <div className="edu-progress-track">
                <span style={{ width: `${pct}%` }} />
              </div>
              <span className="edu-progress-sub">
                {done.size} de {all.length} aulas concluídas
              </span>
              {c.certificate && (
                <button type="button" className="edu-cert-btn" disabled={!complete} onClick={() => setCelebrate(true)}>
                  <Award size={15} strokeWidth={2} />
                  {complete ? 'Ver certificado' : 'Certificado ao concluir'}
                </button>
              )}
            </div>

            <div className="edu-modules">
              {modules.map((m, mi) => (
                <section key={mi} className="edu-module">
                  <h3>
                    <span>Módulo {mi + 1}</span>
                    {m.title}
                  </h3>
                  <ol>
                    {m.lessons.map((l) => {
                      const isDone = done.has(l.id)
                      return (
                        <li key={l.id} className={`${l.id === current.id ? 'is-current' : ''}${isDone ? ' is-done' : ''}`}>
                          <button
                            type="button"
                            className="edu-lesson-check"
                            role="checkbox"
                            aria-checked={isDone}
                            aria-label={`Concluir ${l.title}`}
                            onClick={() => toggleDone(l.id)}
                          >
                            {isDone && <Check size={11} strokeWidth={3} />}
                          </button>
                          <button type="button" className="edu-lesson" onClick={() => setCurrent(l)}>
                            <span className="edu-lesson-title">{l.title}</span>
                            <span className="edu-lesson-dur">
                              <Clock3 size={11} strokeWidth={2.2} />
                              {l.dur}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {celebrate &&
        createPortal(
          <div className="edu-modal" onClick={() => setCelebrate(false)} role="dialog" aria-modal="true" aria-label="Curso concluído">
            <div className="edu-modal-card edu-done-card" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="edu-icon-btn edu-done-close" aria-label="Fechar" onClick={() => setCelebrate(false)}>
                <X size={18} strokeWidth={2.2} />
              </button>
              <span className="edu-done-emoji" aria-hidden="true">
                🎉
              </span>
              <h2>Curso concluído!</h2>
              <p>{c.certificate ? 'Seu certificado está pronto.' : 'Parabéns por chegar até o fim.'}</p>
              {c.certificate && <Certificate name="Kauê Chamiso" course={c.title} className="is-big" />}
              {c.certificate && (
                <button type="button" className="edu-cert-btn is-primary">
                  Baixar certificado
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </main>
  )
}
