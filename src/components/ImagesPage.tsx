import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import './images-page.css'
import ImagePromptBar from './ImagePromptBar'
import type { BaseAttachment } from './ImagePromptBar'
import ToolDrawer from './ToolDrawer'
import ImageModal from './ImageModal'
import type { ModalImg } from './ImageModal'
import artRemoveBackground from '../assets/tools/remove-background.png'
import artGenerateCartoon from '../assets/tools/generate-cartoon.png'
import artClothingShoot from '../assets/tools/clothing-shoot.png'
import artImageEditing from '../assets/tools/image-editing.png'
import artPhotoRestoration from '../assets/tools/photo-restoration.png'
import artLinkedinPhoto from '../assets/tools/linkedin-photo.png'
import artImageFromImage from '../assets/tools/image-from-image.png'
import artChangeBackground from '../assets/tools/change-background.png'
import mCharMonster from '../assets/masonry/char-monster.webp'
import mCharFox from '../assets/masonry/char-fox.webp'
import mCharCyber from '../assets/masonry/char-cyber.webp'
import mPeopleFreckles from '../assets/masonry/people-freckles.webp'
import mPeopleSunglasses from '../assets/masonry/people-sunglasses.webp'
import mPeopleCraftsman from '../assets/masonry/people-craftsman.webp'
import mClothesStreetwear from '../assets/masonry/clothes-streetwear.webp'
import mClothesHandbag from '../assets/masonry/clothes-handbag.webp'
import mLandscapeLake from '../assets/masonry/landscape-lake.webp'
import mLandscapeDesert from '../assets/masonry/landscape-desert.webp'
import mFoodPoke from '../assets/masonry/food-poke.webp'
import mTechRobot from '../assets/masonry/tech-robot.webp'
import mFashionEditorial from '../assets/masonry/fashion-editorial.webp'
import mColorsPaint from '../assets/masonry/colors-paint.webp'
import mCharRobotpet from '../assets/masonry/char-robotpet.webp'
import mFoodPancakes from '../assets/masonry/food-pancakes.webp'
import mPeopleCurly from '../assets/masonry/people-curly.webp'
import mLandscapeForest from '../assets/masonry/landscape-forest.webp'
import mFashionAccessories from '../assets/masonry/fashion-accessories.webp'
import mPeopleElderly from '../assets/masonry/people-elderly.webp'
import mColorsGradient from '../assets/masonry/colors-gradient.webp'
import mCharFoxwarrior from '../assets/masonry/char-foxwarrior.webp'
import mInteriorMinimal from '../assets/masonry/interior-minimal.webp'
import mTechSneaker from '../assets/masonry/tech-sneaker.webp'
import genDog1 from '../assets/gen/dog-1.webp'
import genDog2 from '../assets/gen/dog-2.webp'
import genDog3 from '../assets/gen/dog-3.webp'

/* resultado mockado da geração (3 cachorros + 1 duplicado = 4) */
const GEN_RESULTS = [genDog1, genDog2, genDog3, genDog1]
/* tempo de "loading" antes de mostrar o resultado */
const GEN_MS = 2800

export type Tool = { id: string; title: string; desc: string; art: string }

const TOOLS: Tool[] = [
  {
    id: 'remove-background',
    title: 'Remove Background',
    desc: 'Easily remove backgrounds for a clean, transparent look.',
    art: artRemoveBackground,
  },
  {
    id: 'generate-cartoon',
    title: 'Generate Cartoon',
    desc: 'Adapt any photo into cartoon styles while keeping its details.',
    art: artGenerateCartoon,
  },
  {
    id: 'clothing-shoot',
    title: 'Clothing Photo Shoot',
    desc: 'Apply clothing to a model image in a realistic virtual shoot.',
    art: artClothingShoot,
  },
  {
    id: 'image-editing',
    title: 'Image Editing',
    desc: 'Edit and enhance images with AI using prompts and references.',
    art: artImageEditing,
  },
  {
    id: 'photo-restoration',
    title: 'Old Photo Restoration',
    desc: 'Instantly restore damaged and faded old photos.',
    art: artPhotoRestoration,
  },
  {
    id: 'linkedin-photo',
    title: 'LinkedIn Photo',
    desc: 'Turn any photo into a professional profile picture.',
    art: artLinkedinPhoto,
  },
  {
    id: 'image-from-image',
    title: 'Generate Image Based on Another',
    desc: 'Generate new images from a reference, adapting its style.',
    art: artImageFromImage,
  },
  {
    id: 'change-background',
    title: 'Change Background',
    desc: 'Replace the background with any scene or color effortlessly.',
    art: artChangeBackground,
  },
]

/* grid orgânico (Pinterest) — imagens geradas, intercaladas por tema/proporção.
   prompt/model aparecem no overlay ao passar o mouse. */
type MasonryImg = { src: string; ar: number; prompt: string; model: string; uid?: string }
const MASONRY: MasonryImg[] = [
  {
    src: mCharMonster,
    ar: 0.747,
    prompt: 'Monstrinho fofo de pelúcia verde, olhos grandes e curiosos, fundo claro, render 3D estilo Pixar',
    model: 'Nano Banana 2',
  },
  {
    src: mLandscapeLake,
    ar: 1.34,
    prompt: 'Lago de montanha ao amanhecer com reflexo espelhado, névoa suave, clima cinematográfico',
    model: 'Nano Banana 2',
  },
  {
    src: mPeopleFreckles,
    ar: 0.747,
    prompt: 'Retrato editorial de mulher jovem com sardas, luz natural de janela, tons quentes',
    model: 'GPT Image 2',
  },
  {
    src: mClothesStreetwear,
    ar: 1,
    prompt: 'Flat lay de look streetwear minimalista, tons neutros, tênis e peças dobradas, vista de cima',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mCharCyber,
    ar: 0.558,
    prompt: 'Garota cyberpunk com cabelo neon rosa e ciano, cidade futurista ao fundo, luz dramática',
    model: 'Nano Banana Pro',
  },
  {
    src: mFoodPoke,
    ar: 1,
    prompt: 'Poke bowl colorido visto de cima, salmão fresco, abacate e legumes, luz natural, foto gastronômica',
    model: 'Nano Banana 2',
  },
  {
    src: mPeopleSunglasses,
    ar: 0.747,
    prompt: 'Homem estiloso de óculos escuros na rua, golden hour, fundo desfocado, cinematográfico',
    model: 'Nano Banana 2',
  },
  {
    src: mLandscapeDesert,
    ar: 1.792,
    prompt: 'Dunas de areia do deserto ao pôr do sol, sombras longas, paleta quente, minimalista',
    model: 'GPT Image 2',
  },
  {
    src: mTechRobot,
    ar: 0.747,
    prompt: 'Robô humanoide futurista, branco brilhante e cromado, luz de estúdio, sci-fi detalhado',
    model: 'Nano Banana Pro',
  },
  {
    src: mClothesHandbag,
    ar: 1,
    prompt: 'Bolsa de couro de luxo sobre superfície de mármore, sombras suaves, foto de produto elegante',
    model: 'Nano Banana Pro',
  },
  {
    src: mCharFox,
    ar: 0.747,
    prompt: 'Raposa ilustrada com uma mochilinha, arte vetorial plana, cores vibrantes, divertida',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mPeopleCraftsman,
    ar: 0.747,
    prompt: 'Retrato documental de artesão idoso trabalhando a madeira, mãos marcadas, luz quente',
    model: 'Playground 2.5',
  },
  {
    src: mFashionEditorial,
    ar: 0.747,
    prompt: 'Editorial de moda, look estruturado avant-garde, luz dramática de estúdio, fundo minimalista',
    model: 'Nano Banana Pro',
  },
  {
    src: mColorsPaint,
    ar: 1.34,
    prompt: 'Respingo de tinta em macro, cores saturadas se misturando, líquido brilhante, abstrato',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mCharRobotpet,
    ar: 0.747,
    prompt: 'Pet robô 3D fofo, branco e verde-menta brilhante, olhos expressivos, render estilo Pixar',
    model: 'Nano Banana 2',
  },
  {
    src: mFoodPancakes,
    ar: 1,
    prompt: 'Pilha de panquecas fofas com frutas vermelhas e mel, vista de cima, luz natural',
    model: 'Nano Banana 2',
  },
  {
    src: mPeopleCurly,
    ar: 0.747,
    prompt: 'Retrato editorial de rapaz de cabelo cacheado, fundo verde-azulado de estúdio, luz suave',
    model: 'GPT Image 2',
  },
  {
    src: mLandscapeForest,
    ar: 1.792,
    prompt: 'Trilha de floresta na névoa ao amanhecer, pinheiros altos, clima cinematográfico, verdes suaves',
    model: 'Nano Banana 2',
  },
  {
    src: mFashionAccessories,
    ar: 1,
    prompt: 'Flat lay de acessórios de luxo: relógio, óculos e perfume sobre mármore creme, sombras suaves',
    model: 'Nano Banana Pro',
  },
  {
    src: mPeopleElderly,
    ar: 0.747,
    prompt: 'Retrato documental de senhora sorrindo, luz natural quente de janela, tons suaves',
    model: 'Playground 2.5',
  },
  {
    src: mColorsGradient,
    ar: 1,
    prompt: 'Ondas de gradiente vibrante, campo de cor fluido, magenta, roxo e ciano, render 3D suave',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mCharFoxwarrior,
    ar: 0.747,
    prompt: 'Raposa guerreira de fantasia ilustrada, arte vetorial plana, cores vibrantes, pose confiante',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mInteriorMinimal,
    ar: 1.34,
    prompt: 'Interior minimalista iluminado pelo sol, tons de madeira e bege, janela ampla, sombras suaves',
    model: 'GPT Image 2',
  },
  {
    src: mTechSneaker,
    ar: 1,
    prompt: 'Tênis futurista em foto de produto, flutuando sobre gradiente pastel, luz de estúdio, detalhe nítido',
    model: 'Nano Banana Pro',
  },
]

const SKELETON_MS = 950

export default function ImagesPage() {
  const [loading, setLoading] = useState(true)
  const railRef = useRef<HTMLDivElement>(null)
  const [railEdge, setRailEdge] = useState<{ start: boolean; end: boolean }>({
    start: true,
    end: false,
  })

  /* estado do input de prompt — compartilhado entre a barra do topo e a fixa */
  const [promptValue, setPromptValue] = useState('')
  const [promptCount, setPromptCount] = useState(1)
  /* imagens anexadas como base ("Usar de base"), compartilhadas pelos inputs */
  const [attachments, setAttachments] = useState<BaseAttachment[]>([])
  const addBase = (src: string) =>
    setAttachments((list) =>
      list.some((a) => a.src === src)
        ? list
        : [...list, { uid: `base-${list.length}-${src.slice(-12)}`, src }],
    )
  const removeBase = (uid: string) =>
    setAttachments((list) => list.filter((a) => a.uid !== uid))

  /* modo "gerando": ao clicar em Gerar, foca nas gerações com skeletons;
     após alguns segundos, os skeletons viram o resultado */
  const [generating, setGenerating] = useState(false)
  const [genDone, setGenDone] = useState(false)
  const [genPrompt, setGenPrompt] = useState('')
  const genTimerRef = useRef<number | null>(null)
  const genCountRef = useRef(0)
  /* gerações concluídas, adicionadas ao topo do grid ao voltar pra home */
  const [generated, setGenerated] = useState<MasonryImg[]>([])
  /* ferramenta aberta (Remove Background, etc.): abre um drawer à esquerda */
  const [tool, setTool] = useState<Tool | null>(null)
  /* mantém o conteúdo do drawer durante a animação de fechar */
  const lastToolRef = useRef<Tool | null>(null)
  if (tool) lastToolRef.current = tool
  const startGenerate = (prompt?: string) => {
    if (genTimerRef.current) window.clearTimeout(genTimerRef.current)
    setGenPrompt((prompt ?? promptValue).trim() || 'Geração de imagem')
    setGenerating(true)
    setGenDone(false)
    setPromptValue('')
    setAttachments([])
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    genTimerRef.current = window.setTimeout(() => setGenDone(true), GEN_MS)
  }
  const exitGenerate = () => {
    if (genTimerRef.current) window.clearTimeout(genTimerRef.current)
    /* se a geração terminou, as imagens entram no topo do grid */
    if (genDone) {
      const n = genCountRef.current++
      const items: MasonryImg[] = GEN_RESULTS.map((src, i) => ({
        uid: `gen-${n}-${i}`,
        src,
        ar: 16 / 9,
        prompt: genPrompt,
        model: 'Nano Banana 2',
      }))
      setGenerated((prev) => [...items, ...prev])
    }
    setGenerating(false)
    setGenDone(false)
  }
  /* a barra fixa o input no rodapé quando o input do topo sai de vista */
  const [docked, setDocked] = useState(false)
  /* geometria da área principal para alinhar a barra fixa (portal no body) */
  const [dockBox, setDockBox] = useState<{ left: number; width: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  /* imagem aberta no modal de detalhe (com estado de saída para animar) */
  const [imgModal, setImgModal] = useState<{ img: ModalImg; closing: boolean } | null>(null)
  const openImg = (img: ModalImg) => setImgModal({ img, closing: false })
  const closeImg = () => {
    setImgModal((m) => (m ? { ...m, closing: true } : m))
    window.setTimeout(() => setImgModal(null), 200)
  }

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  /* clicar fora do drawer (input, grid, etc.) fecha a ferramenta */
  useEffect(() => {
    if (!tool) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.ip-tool-drawer')) setTool(null)
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [tool])

  /* observa a sentinela logo abaixo do input: quando ela sai pela parte de
     cima da área de scroll, fixamos o input no rodapé */
  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return
    const io = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting), {
      root,
      threshold: 0,
    })
    io.observe(sentinel)
    return () => io.disconnect()
  }, [])

  /* mede left/width da área principal para a barra fixa (atualiza em resize) */
  useLayoutEffect(() => {
    if (!docked && !generating) return
    const measure = () => {
      const el = scrollRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setDockBox({ left: r.left, width: r.width })
    }
    measure()
    /* re-mede após a animação do drawer (a largura do scroll muda) */
    const t = window.setTimeout(measure, 500)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [docked, generating, tool])

  const updateRailEdge = () => {
    const el = railRef.current
    if (!el) return
    const start = el.scrollLeft <= 2
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
    setRailEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }

  useEffect(() => {
    updateRailEdge()
  }, [loading])

  const scrollRail = (dir: number) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 320), behavior: 'smooth' })
  }

  return (
    <main className="images-page ip-shell">
      {/* drawer da ferramenta (Remove Background, etc.) — abre à esquerda */}
      <aside className={`ip-tool-drawer${tool ? ' is-open' : ''}`} aria-hidden={!tool}>
        <div className="ip-tool-inner">
          <header className="ip-tool-head">
            <button
              type="button"
              className="ip-tool-close"
              aria-label="Fechar"
              onClick={() => setTool(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </header>
          {lastToolRef.current && (
            <ToolDrawer
              key={lastToolRef.current.id}
              tool={lastToolRef.current}
              onGenerate={() => {
                startGenerate(lastToolRef.current?.title)
                setTool(null)
              }}
            />
          )}
        </div>
      </aside>

      <div className="ip-scroll" ref={scrollRef}>
      <div className={`ip-container${generating ? ' is-generating' : ''}`}>
        {/* cabeçalho recolhível (título + input + ferramentas): recolhe ao gerar
            e volta com fluidez ao clicar em voltar, empurrando a grade pra baixo */}
        <div className="ip-head">
          <div className="ip-head-inner">
        <h1 className="ip-title">Geração e edição de Imagens</h1>

        <div className="ip-prompt-frame">
          <ImagePromptBar
            value={promptValue}
            onValueChange={setPromptValue}
            count={promptCount}
            onCountChange={setPromptCount}
            attachments={attachments}
            onRemoveAttachment={removeBase}
            onGenerate={startGenerate}
          />
        </div>
        <div ref={sentinelRef} className="ip-prompt-sentinel" aria-hidden="true" />

        {/* ---------- Ferramentas de Imagem (carrossel, sem título) ---------- */}
        <section className="ip-section ip-tools">
          <div className="ip-rail-wrap">
            <button
              type="button"
              className={`ip-rail-nav is-prev${railEdge.start ? ' is-hidden' : ''}`}
              aria-label="Ferramentas anteriores"
              onClick={() => scrollRail(-1)}
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>

            <div className="ip-rail" ref={railRef} onScroll={updateRailEdge}>
              {loading
                ? TOOLS.map((tool, i) => (
                    <div
                      className="tool-card is-skeleton"
                      key={tool.id}
                      style={{ '--i': i } as CSSProperties}
                    >
                      <div className="sk-line sk-title" />
                      <div className="sk-line sk-desc" />
                      <div className="sk-line sk-desc is-short" />
                      <div className="sk-art" />
                    </div>
                  ))
                : TOOLS.map((t, i) => (
                    <article
                      className="tool-card"
                      key={t.id}
                      style={
                        { '--i': i, '--tilt': i % 2 === 0 ? '-1.5deg' : '1.5deg' } as CSSProperties
                      }
                      role="button"
                      tabIndex={0}
                      onClick={() => setTool(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setTool(t)
                        }
                      }}
                    >
                      <div className="tool-card-header">
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                      <div className="tool-card-art">
                        <img src={t.art} alt="" loading="lazy" />
                      </div>
                    </article>
                  ))}
            </div>

            <button
              type="button"
              className={`ip-rail-nav is-next${railEdge.end ? ' is-hidden' : ''}`}
              aria-label="Próximas ferramentas"
              onClick={() => scrollRail(1)}
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </section>
          </div>
        </div>

        {/* ---------- Minhas Gerações ---------- */}
        <section className="ip-section">
          {/* header só no estado normal; no modo "gerando" os controles
              viram overlay sobre as próprias gerações */}
          <div className="ip-section-head">
            <h2 className="ip-section-title">Minhas Gerações</h2>
            <button className="lib-new is-ghost" type="button" aria-label="Filtrar">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                  stroke="#3D3D3D"
                  strokeWidth="1.125"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                Filtrar
              </span>
            </button>
          </div>

          {/* linha 16:9 — skeleton enquanto gera, depois o resultado.
              back + filtro flutuam como overlay sobre a primeira linha */}
          {generating && (
            <>
              {/* controles flutuantes fixos no scroll (sticky) sobre as gerações */}
              <div className="ip-gen-floatbar">
                <button
                  type="button"
                  className="ip-gen-float is-back"
                  aria-label="Voltar"
                  onClick={exitGenerate}
                >
                  <ChevronLeft size={18} strokeWidth={2.4} />
                </button>
                <button type="button" className="ip-gen-float is-filter" aria-label="Filtrar">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="ip-gen-row">
                {genDone
                  ? GEN_RESULTS.map((src, i) => (
                      <figure
                        className="ip-gen-tile"
                        key={i}
                        style={{ '--i': i } as CSSProperties}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          openImg({ src, ar: 16 / 9, prompt: genPrompt, model: 'Nano Banana 2' })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openImg({ src, ar: 16 / 9, prompt: genPrompt, model: 'Nano Banana 2' })
                          }
                        }}
                      >
                        <img src={src} alt="" />
                        <figcaption className="ip-mtile-ov">
                          <p className="ip-mtile-prompt">{genPrompt}</p>
                          <div className="ip-mtile-foot">
                            <span className="ip-mtile-model">Nano Banana 2</span>
                            <span className="ip-mtile-acts">
                              <button
                                type="button"
                                className="ip-mtile-icon"
                                aria-label="Baixar imagem"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download size={15} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                className="ip-mtile-use"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addBase(src)
                                }}
                              >
                                Usar de base
                              </button>
                            </span>
                          </div>
                        </figcaption>
                      </figure>
                    ))
                  : [0, 1, 2, 3].map((i) => (
                      <div
                        className="ip-gen-skel"
                        key={i}
                        style={{ '--i': i } as CSSProperties}
                        aria-hidden="true"
                      />
                    ))}
              </div>
            </>
          )}

          {/* geradas persistidas (home): em linha (grid), acima do masonry */}
          {!generating && generated.length > 0 && (
            <div className="ip-gen-row">
              {generated.map((m, i) => (
                <figure
                  className="ip-gen-tile"
                  key={m.uid}
                  style={{ '--i': i } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  onClick={() => openImg(m)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openImg(m)
                    }
                  }}
                >
                  <img src={m.src} alt="" />
                  <figcaption className="ip-mtile-ov">
                    <p className="ip-mtile-prompt">{m.prompt}</p>
                    <div className="ip-mtile-foot">
                      <span className="ip-mtile-model">{m.model}</span>
                      <span className="ip-mtile-acts">
                        <button
                          type="button"
                          className="ip-mtile-icon"
                          aria-label="Baixar imagem"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={15} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          className="ip-mtile-use"
                          onClick={(e) => {
                            e.stopPropagation()
                            addBase(m.src)
                          }}
                        >
                          Usar de base
                        </button>
                      </span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {/* grid orgânico (Pinterest) — imagens geradas; overlay com prompt no hover */}
          <div className="ip-masonry">
            {MASONRY.map((m, i) => (
              <figure
                className="ip-mtile"
                key={m.src}
                style={{ aspectRatio: String(m.ar), '--i': i } as CSSProperties}
                role="button"
                tabIndex={0}
                onClick={() => openImg(m)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openImg(m)
                  }
                }}
              >
                <img src={m.src} alt="" loading="lazy" />
                <figcaption className="ip-mtile-ov">
                  <p className="ip-mtile-prompt">{m.prompt}</p>
                  <div className="ip-mtile-foot">
                    <span className="ip-mtile-model">{m.model}</span>
                    <span className="ip-mtile-acts">
                      <button
                        type="button"
                        className="ip-mtile-icon"
                        aria-label="Baixar imagem"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={15} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className="ip-mtile-use"
                        onClick={(e) => {
                          e.stopPropagation()
                          addBase(m.src)
                        }}
                      >
                        Usar de base
                      </button>
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
      </div>

      {/* input fixado no rodapé — portal no body para ficar fixo ao viewport,
          alinhado à área principal (aparece quando o input do topo sai de vista) */}
      {createPortal(
        <div
          className={`ip-dock${docked || generating ? ' is-visible' : ''}`}
          style={dockBox ? ({ left: dockBox.left, width: dockBox.width } as CSSProperties) : undefined}
          aria-hidden={!(docked || generating)}
        >
          <div className="ip-prompt-frame">
            <ImagePromptBar
              docked
              value={promptValue}
              onValueChange={setPromptValue}
              count={promptCount}
              onCountChange={setPromptCount}
              attachments={attachments}
              onRemoveAttachment={removeBase}
              onGenerate={startGenerate}
            />
          </div>
        </div>,
        document.body,
      )}

      {imgModal && (
        <ImageModal
          img={imgModal.img}
          closing={imgModal.closing}
          onClose={closeImg}
          onUseAsBase={() => {
            addBase(imgModal.img.src)
            closeImg()
          }}
        />
      )}
    </main>
  )
}
