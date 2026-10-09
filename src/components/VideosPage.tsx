import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Film,
  ScanFace,
  WandSparkles,
  Plus,
  Clock,
  Download,
  ImageIcon,
  Images,
  LayoutGrid,
  ListIcon,
  Music,
  Pause,
  Play,
  RectangleHorizontal,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import './videos-page.css'
import creditsCoin from '../assets/credits.svg'
import pLake from '../assets/masonry/landscape-lake.webp'
import pFreckles from '../assets/masonry/people-freckles.webp'
import pForest from '../assets/masonry/landscape-forest.webp'
import pRobot from '../assets/masonry/char-robotpet.webp'
import pPancakes from '../assets/masonry/food-pancakes.webp'
import pDesert from '../assets/masonry/landscape-desert.webp'
import pSneaker from '../assets/masonry/tech-sneaker.webp'
import pCyber from '../assets/masonry/char-cyber.webp'
import duckVideo from '../assets/videos/duck.mp4'
import duckPoster from '../assets/videos/duck-poster.webp'

type Clip = {
  id: string
  poster: string
  prompt: string
  model: string
  duration: number
  ratio: string
  quality: string
  date: string
  /* gerando: aurora + progresso no lugar do vídeo */
  status?: 'generating'
  /* vídeo real (quando existe): toca num <video>; senão o poster anima */
  video?: string
}

/* <video> controlado pelo estado "tocando" do feed */
function ClipVideo({
  src,
  poster,
  playing,
  onEnded,
}: {
  src: string
  poster: string
  playing: boolean
  onEnded: () => void
}) {
  const ref = useRef<HTMLVideoElement>(null)
  /* só dá play quando já há dados pra tocar (logo após montar ainda não há) */
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!playing) {
      v.pause()
      return
    }
    const start = () => {
      if (v.ended) v.currentTime = 0
      v.play().catch(() => {})
    }
    if (v.readyState >= 3) start()
    else v.addEventListener('canplay', start, { once: true })
    return () => v.removeEventListener('canplay', start)
  }, [playing])
  return (
    <video
      ref={ref}
      className="vp-poster vp-real"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      onEnded={onEnded}
    />
  )
}

/* histórico mockado do usuário (posters animados simulam o vídeo) */
const HISTORY: Clip[] = [
  {
    id: 'v1',
    poster: pFreckles,
    prompt: 'Mulher deitada na grama à beira de um lago, sorrindo para a câmera, luz de fim de tarde',
    model: 'Seedance 2.5',
    duration: 5,
    ratio: '16:9',
    quality: '1080p',
    date: '8 de outubro de 2026',
  },
  {
    id: 'v2',
    poster: pLake,
    prompt: 'Travelling lento sobre um lago de montanha ao amanhecer, névoa se dissipando',
    model: 'Veo 3.1',
    duration: 8,
    ratio: '16:9',
    quality: '1080p',
    date: '7 de outubro de 2026',
  },
  {
    id: 'v3',
    poster: pRobot,
    prompt: 'Pet robô fofo olhando ao redor e piscando, render estilo Pixar',
    model: 'Kling 3.0',
    duration: 5,
    ratio: '16:9',
    quality: '720p',
    date: '5 de outubro de 2026',
  },
  {
    id: 'v4',
    poster: pPancakes,
    prompt: 'Calda de mel escorrendo sobre uma pilha de panquecas, câmera em close',
    model: 'Seedance 2.5',
    duration: 5,
    ratio: '16:9',
    quality: '1080p',
    date: '2 de outubro de 2026',
  },
  {
    id: 'v5',
    poster: pForest,
    prompt: 'Pessoa caminhando por uma trilha de floresta na névoa, plano aberto',
    model: 'Hailuo 2',
    duration: 10,
    ratio: '16:9',
    quality: '1080p',
    date: '29 de setembro de 2026',
  },
]

/* posters usados nos resultados de novas gerações (protótipo) */
const RESULT_POSTERS = [pDesert, pSneaker, pCyber, pLake]
/* protótipo: prompts sobre pato viram o vídeo real gerado do patinho */
const isDuck = (text: string) => /pat(o|inho)/i.test(text)
/* protótipo: o Gerar fica sempre ativo; sem prompt, usa este */
const FALLBACK_PROMPT = 'Plano cinematográfico em câmera lenta, luz natural de fim de tarde'

const MODELS = ['Seedance 2.5', 'Veo 3.1', 'Kling 3.0', 'Hailuo 2']
const DURATIONS = [5, 8, 10]
const RATIOS = ['16:9', '9:16', '1:1']
const QUALITIES = ['720p', '1080p']
const GEN_MS = 4200

/* templates da aba "Editar vídeo" */
const EDIT_TOOLS = [
  {
    id: 'edit',
    title: 'Editar vídeo',
    desc: 'Faça mudanças pontuais em cenas, objetos ou estilo',
    icon: WandSparkles,
    placeholder: 'O que você quer mudar no vídeo?',
  },
  {
    id: 'extend',
    title: 'Estender vídeo',
    desc: 'Gere uma continuação natural para o seu vídeo',
    icon: Film,
    placeholder: 'Como a cena deve continuar?',
  },
  {
    id: 'transcribe',
    title: 'Transcrever vídeo',
    desc: 'Gere legendas e transcrições precisas em segundos',
    icon: Captions,
    placeholder: '',
  },
  {
    id: 'avatar',
    title: 'Gerar avatar',
    desc: 'Crie um apresentador realista a partir de uma foto',
    icon: ScanFace,
    placeholder: 'O que o avatar deve falar?',
  },
]

const cycle = <T,>(list: T[], cur: T) => list[(list.indexOf(cur) + 1) % list.length]

type Ref = { id: string; kind: 'image' | 'video' | 'audio'; name: string; thumb?: string; blob?: boolean }

export default function VideosPage({ panelOpen = true }: { panelOpen?: boolean }) {
  const [tab, setTab] = useState<'create' | 'edit'>('create')
  /* template de edição aberto (aba Editar vídeo) */
  const [editToolId, setEditToolId] = useState<string | null>(null)
  const editTool = EDIT_TOOLS.find((t) => t.id === editToolId) ?? null
  const promptPlaceholder = editTool?.placeholder ?? 'Descreva a cena, o movimento da câmera e o clima...'
  const [prompt, setPrompt] = useState('')
  const [sound, setSound] = useState(true)
  const [model, setModel] = useState(MODELS[0])
  const [duration, setDuration] = useState(5)
  const [ratio, setRatio] = useState('16:9')
  const [quality, setQuality] = useState('1080p')
  const [refs, setRefs] = useState<Ref[]>([])
  const [clips, setClips] = useState<Clip[]>(HISTORY)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [playing, setPlaying] = useState<string | null>(null)
  /* item em foco ao vir da grade (rola até ele e destaca) */
  const [focusId, setFocusId] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const genCount = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  /* libera as prévias de arquivos enviados ao sair */
  useEffect(
    () => () => refs.forEach((r) => r.blob && r.thumb && URL.revokeObjectURL(r.thumb)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const credits = Math.round(duration * (quality === '1080p' ? 12 : 8) * (sound ? 1.2 : 1))

  const addRefs = (files: FileList | null) => {
    if (!files) return
    const next: Ref[] = [...files].map((f, i) => {
      const isImg = f.type.startsWith('image')
      return {
        id: `${Date.now()}-${i}`,
        kind: f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image',
        name: f.name,
        thumb: isImg ? URL.createObjectURL(f) : undefined,
        blob: isImg,
      }
    })
    setRefs((r) => [...r, ...next].slice(0, 6))
  }

  const removeRef = (id: string) =>
    setRefs((list) => {
      const hit = list.find((r) => r.id === id)
      if (hit?.blob && hit.thumb) URL.revokeObjectURL(hit.thumb)
      return list.filter((r) => r.id !== id)
    })

  /* "Usar de referência": o vídeo entra nas referências do painel */
  const useAsRef = (c: Clip) =>
    setRefs((list) =>
      list.some((r) => r.id === `clip-${c.id}`)
        ? list
        : [...list, { id: `clip-${c.id}`, kind: 'video' as const, name: c.prompt, thumb: c.poster }].slice(0, 6),
    )

  /* gerar: entra no topo do feed "gerando" e vira o vídeo pronto, já tocando */
  const generate = () => {
    const n = genCount.current++
    const id = `gen-${Date.now()}`
    const text = prompt.trim() || FALLBACK_PROMPT
    const duck = isDuck(text)
    const clip: Clip = {
      id,
      poster: duck ? duckPoster : RESULT_POSTERS[n % RESULT_POSTERS.length],
      video: duck ? duckVideo : undefined,
      prompt: text,
      model,
      duration: duck ? 5 : duration,
      ratio,
      quality,
      date: 'Agora',
      status: 'generating',
    }
    setClips((c) => [clip, ...c])
    setPlaying(null)
    setPrompt('')
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    timers.current.push(
      window.setTimeout(() => {
        setClips((c) => c.map((x) => (x.id === id ? { ...x, status: undefined } : x)))
        setPlaying(id)
      }, GEN_MS),
    )
  }

  /* o "vídeo" para sozinho ao fim da duração */
  useEffect(() => {
    if (!playing) return
    const clip = clips.find((c) => c.id === playing)
    /* vídeo real termina pelo próprio onEnded */
    if (!clip || clip.video) return
    const t = window.setTimeout(() => setPlaying(null), clip.duration * 1000)
    return () => window.clearTimeout(t)
  }, [playing, clips])

  const togglePlay = (id: string) => setPlaying((p) => (p === id ? null : id))

  /* grade → clique abre na lista, rolando até o vídeo */
  const openFromGrid = (id: string) => {
    setFocusId(id)
    setView('list')
  }

  useLayoutEffect(() => {
    if (view !== 'list' || !focusId) return
    const el = feedRef.current?.querySelector<HTMLElement>(`[data-clip="${focusId}"]`)
    el?.scrollIntoView({ block: 'center' })
    const t = window.setTimeout(() => setFocusId(null), 1600)
    return () => window.clearTimeout(t)
  }, [view, focusId])

  return (
    <main className="vp-page">
      {/* ---------- Painel de geração (abre/fecha pelo ícone da sidebar) ---------- */}
      <aside className={`vp-panel${panelOpen ? ' is-open' : ''}`} aria-label="Gerar vídeo" aria-hidden={!panelOpen}>
        <div className="vp-panel-inner">
          <nav className="vp-tabs" role="tablist">
            {(
              [
                ['create', 'Criar vídeo'],
                ['edit', 'Ferramentas de vídeo'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`vp-tab${tab === id ? ' is-active' : ''}`}
                onClick={() => {
                  setTab(id)
                  setEditToolId(null)
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="vp-panel-scroll">
            {tab === 'create' ? (
              <>
            {/* referências */}
            <div className="vp-upload-wrap" style={{ '--d': '110ms' } as CSSProperties}>
              <input
                ref={fileRef}
                type="file"
                hidden
                multiple
                accept="image/*,video/*,audio/*"
                onChange={(e) => {
                  addRefs(e.target.files)
                  e.target.value = ''
                }}
              />
              {refs.length === 0 ? (
                <button type="button" className="vp-upload" onClick={() => fileRef.current?.click()}>
                  <span className="vp-upload-ics" aria-hidden="true">
                    <span className="vp-upload-ic">
                      <ImageIcon size={15} strokeWidth={1.9} />
                    </span>
                    <span className="vp-upload-ic">
                      <Video size={15} strokeWidth={1.9} />
                    </span>
                    <span className="vp-upload-ic">
                      <Music size={15} strokeWidth={1.9} />
                    </span>
                  </span>
                  <span className="vp-upload-title">Adicionar referências</span>
                  <span className="vp-upload-hint">Imagem, vídeo ou áudio</span>
                </button>
              ) : (
                /* com referências: elas ocupam a própria caixa + um quadrado (+) para mais */
                <div className="vp-upload has-refs">
                  {refs.map((r) => (
                    <span className="vp-ref" key={r.id} title={r.name}>
                      {r.thumb ? (
                        <img src={r.thumb} alt="" />
                      ) : r.kind === 'video' ? (
                        <Video size={18} strokeWidth={1.9} />
                      ) : (
                        <Music size={18} strokeWidth={1.9} />
                      )}
                      {r.kind === 'video' && r.thumb && (
                        <span className="vp-ref-kind" aria-hidden="true">
                          <Play size={9} strokeWidth={0} fill="currentColor" />
                        </span>
                      )}
                      <button
                        type="button"
                        className="vp-ref-x"
                        aria-label={`Remover ${r.name}`}
                        onClick={() => removeRef(r.id)}
                      >
                        <X size={11} strokeWidth={2.6} />
                      </button>
                    </span>
                  ))}
                  {refs.length < 6 && (
                    <button
                      type="button"
                      className="vp-ref-add"
                      aria-label="Adicionar mais referências"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Plus size={18} strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}
            </div>


            {/* prompt */}
            <div className="vp-prompt" style={{ '--d': '160ms' } as CSSProperties}>
              <label className="vp-prompt-label" htmlFor="vp-prompt">
                Prompt
              </label>
              <textarea
                id="vp-prompt"
                className="vp-prompt-field"
                placeholder={promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    generate()
                  }
                }}
                spellCheck={false}
              />
            </div>


            {/* modelo + ajustes */}
            <button
              type="button"
              className="vp-row"
              style={{ '--d': '200ms' } as CSSProperties}
              onClick={() => setModel((m) => cycle(MODELS, m))}
            >
              <span className="vp-row-text">
                <span className="vp-row-label">Modelo</span>
                <span className="vp-row-value">{model}</span>
              </span>
              <ChevronRight size={16} strokeWidth={2} />
            </button>

            <div className="vp-settings" style={{ '--d': '240ms' } as CSSProperties}>
              <button type="button" className="vp-set" onClick={() => setDuration((d) => cycle(DURATIONS, d))}>
                <Clock size={14} strokeWidth={2} />
                {duration}s
              </button>
              <button type="button" className="vp-set" onClick={() => setRatio((r) => cycle(RATIOS, r))}>
                <RectangleHorizontal size={14} strokeWidth={2} />
                {ratio}
              </button>
              <button type="button" className="vp-set" onClick={() => setQuality((q) => cycle(QUALITIES, q))}>
                {quality}
              </button>
            </div>

            {/* com ou sem som */}
            <button
              type="button"
              role="switch"
              aria-checked={sound}
              className="vp-row vp-sound"
              style={{ '--d': '280ms' } as CSSProperties}
              onClick={() => setSound((s) => !s)}
            >
              <span className="vp-sound-lead" aria-hidden="true">
                {sound ? <Volume2 size={16} strokeWidth={2} /> : <VolumeX size={16} strokeWidth={2} />}
              </span>
              <span className="vp-row-text">
                <span className="vp-row-value">Som</span>
                <span className="vp-row-label">{sound ? 'Vídeo com áudio gerado' : 'Vídeo sem áudio'}</span>
              </span>
              <span className={`vp-switch${sound ? ' is-on' : ''}`} aria-hidden="true">
                <span />
              </span>
            </button>
              </>
            ) : editTool ? (
              /* template de edição aberto: voltar + vídeo de base + instrução */
              <div className="vp-tool" key={editTool.id}>
                <button type="button" className="vp-tool-back" onClick={() => setEditToolId(null)}>
                  <ChevronLeft size={16} strokeWidth={2} />
                  Templates
                </button>
                <div className="vp-tool-head">
                  <span className="vp-tpl-ic" aria-hidden="true">
                    <editTool.icon size={20} strokeWidth={1.7} />
                  </span>
                  <span className="vp-tpl-text">
                    <span className="vp-tpl-title">{editTool.title}</span>
                    <span className="vp-tpl-desc">{editTool.desc}</span>
                  </span>
                </div>
            {/* referências */}
            <div className="vp-upload-wrap" style={{ '--d': '110ms' } as CSSProperties}>
              <input
                ref={fileRef}
                type="file"
                hidden
                multiple
                accept="image/*,video/*,audio/*"
                onChange={(e) => {
                  addRefs(e.target.files)
                  e.target.value = ''
                }}
              />
              {refs.length === 0 ? (
                <button type="button" className="vp-upload" onClick={() => fileRef.current?.click()}>
                  <span className="vp-upload-ics" aria-hidden="true">
                    <span className="vp-upload-ic">
                      <ImageIcon size={15} strokeWidth={1.9} />
                    </span>
                    <span className="vp-upload-ic">
                      <Video size={15} strokeWidth={1.9} />
                    </span>
                    <span className="vp-upload-ic">
                      <Music size={15} strokeWidth={1.9} />
                    </span>
                  </span>
                  <span className="vp-upload-title">Adicionar referências</span>
                  <span className="vp-upload-hint">Imagem, vídeo ou áudio</span>
                </button>
              ) : (
                /* com referências: elas ocupam a própria caixa + um quadrado (+) para mais */
                <div className="vp-upload has-refs">
                  {refs.map((r) => (
                    <span className="vp-ref" key={r.id} title={r.name}>
                      {r.thumb ? (
                        <img src={r.thumb} alt="" />
                      ) : r.kind === 'video' ? (
                        <Video size={18} strokeWidth={1.9} />
                      ) : (
                        <Music size={18} strokeWidth={1.9} />
                      )}
                      {r.kind === 'video' && r.thumb && (
                        <span className="vp-ref-kind" aria-hidden="true">
                          <Play size={9} strokeWidth={0} fill="currentColor" />
                        </span>
                      )}
                      <button
                        type="button"
                        className="vp-ref-x"
                        aria-label={`Remover ${r.name}`}
                        onClick={() => removeRef(r.id)}
                      >
                        <X size={11} strokeWidth={2.6} />
                      </button>
                    </span>
                  ))}
                  {refs.length < 6 && (
                    <button
                      type="button"
                      className="vp-ref-add"
                      aria-label="Adicionar mais referências"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Plus size={18} strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}
            </div>

                {editTool.id !== 'transcribe' && (
                  <>
            {/* prompt */}
            <div className="vp-prompt" style={{ '--d': '160ms' } as CSSProperties}>
              <label className="vp-prompt-label" htmlFor="vp-prompt">
                Prompt
              </label>
              <textarea
                id="vp-prompt"
                className="vp-prompt-field"
                placeholder={promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    generate()
                  }
                }}
                spellCheck={false}
              />
            </div>

                  </>
                )}
              </div>
            ) : (
              /* lista de templates de edição */
              <div className="vp-tpls" role="list">
                {EDIT_TOOLS.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    role="listitem"
                    className="vp-tpl"
                    style={{ '--i': i } as CSSProperties}
                    onClick={() => setEditToolId(t.id)}
                  >
                    <span className="vp-tpl-ic" aria-hidden="true">
                      <t.icon size={20} strokeWidth={1.7} />
                    </span>
                    <span className="vp-tpl-text">
                      <span className="vp-tpl-title">{t.title}</span>
                      <span className="vp-tpl-desc">{t.desc}</span>
                    </span>
                    <ChevronRight className="vp-tpl-chev" size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {(tab === 'create' || editTool) && (
          <footer className="vp-panel-foot">
            {/* protótipo: sempre ativo (sem prompt, gera com um prompt padrão) */}
            <button type="button" className="vp-gen is-ready" onClick={generate}>
              Gerar
              <span className="vp-gen-cost">
                <img src={creditsCoin} alt="" aria-hidden="true" />
                {credits}
              </span>
            </button>
          </footer>
          )}
        </div>
      </aside>

      {/* ---------- Minhas Gerações (principal) ---------- */}
      <section className="vp-main">
        <header className="vp-toolbar">
          <h2 className="vp-title">Minhas Gerações</h2>
          <div className="vp-view" role="tablist" aria-label="Visualização">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'list'}
              className={`vp-tb${view === 'list' ? ' is-active' : ''}`}
              onClick={() => setView('list')}
            >
              <ListIcon size={15} strokeWidth={2} />
              Lista
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'grid'}
              className={`vp-tb${view === 'grid' ? ' is-active' : ''}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={15} strokeWidth={2} />
              Grade
            </button>
          </div>
        </header>

        <div className={`vp-feed is-${view}`} ref={feedRef} key={view}>
          {clips.map((c, i) => {
            const isPlaying = playing === c.id
            const generating = c.status === 'generating'
            return (
              <article
                className={`vp-item${focusId === c.id ? ' is-focus' : ''}`}
                key={c.id}
                data-clip={c.id}
                style={{ '--i': i } as CSSProperties}
              >
                <div
                  className={`vp-video${isPlaying ? ' is-playing' : ''}${generating ? ' is-generating' : ''}${view === 'grid' ? ' is-tile' : ''}`}
                  style={{ '--dur': `${c.duration}s` } as CSSProperties}
                  onClick={view === 'grid' && !generating ? () => openFromGrid(c.id) : undefined}
                >
                  {generating ? (
                    <div className="vp-gen-state">
                      <span className="vp-gen-label">Gerando vídeo</span>
                      <span className="vp-gen-bar">
                        <span style={{ animationDuration: `${GEN_MS}ms` }} />
                      </span>
                    </div>
                  ) : (
                    <>
                      {c.video ? (
                        <ClipVideo
                          src={c.video}
                          poster={c.poster}
                          playing={isPlaying}
                          onEnded={() => setPlaying((p) => (p === c.id ? null : p))}
                        />
                      ) : (
                        <img className="vp-poster" src={c.poster} alt="" />
                      )}
                      <span className="vp-video-shade" aria-hidden="true" />
                      {view === 'list' ? (
                        <>
                          <button
                            type="button"
                            className="vp-play"
                            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                            onClick={() => togglePlay(c.id)}
                          >
                            {isPlaying ? (
                              <Pause size={20} strokeWidth={0} fill="currentColor" />
                            ) : (
                              <Play size={20} strokeWidth={0} fill="currentColor" />
                            )}
                          </button>
                          <span className="vp-progress" aria-hidden="true">
                            <span key={isPlaying ? 'on' : 'off'} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="vp-play is-static" aria-hidden="true">
                            <Play size={20} strokeWidth={0} fill="currentColor" />
                          </span>
                          <span className="vp-dur">{c.duration}s</span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {view === 'list' && (
                  <div className="vp-info">
                    <span className="vp-badge">{c.model}</span>
                    <p className="vp-info-prompt">{c.prompt}</p>
                    <div className="vp-info-tags">
                      <span className="vp-tag">{c.quality}</span>
                      <span className="vp-tag">
                        <Clock size={12} strokeWidth={2} />
                        {c.duration}s
                      </span>
                      <span className="vp-tag">
                        <RectangleHorizontal size={12} strokeWidth={2} />
                        {c.ratio}
                      </span>
                    </div>
                    <span className="vp-info-date">{generating ? 'Gerando...' : c.date}</span>
                    {!generating && (
                      <div className="vp-info-actions">
                        <button type="button" className="vp-act is-primary" onClick={() => useAsRef(c)}>
                          <Images size={15} strokeWidth={2} />
                          Usar de referência
                        </button>
                        <button type="button" className="vp-act">
                          <Download size={15} strokeWidth={2} />
                          Baixar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
