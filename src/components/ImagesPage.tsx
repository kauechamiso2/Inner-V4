import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import './images-page.css'
import ImagePromptBar from './ImagePromptBar'
import artImageGeneration from '../assets/tools/image-generation.png'
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

/* Filtros = modelos disponíveis (espelham o seletor de modelos, sem ícones) */
const MODELS = [
  'Todos os modelos',
  'Automático',
  'Flux Schnell 1.0',
  'Playground 2.5',
  'Nano Banana',
  'Nano Banana 2',
  'Nano Banana Pro',
  'GPT Image 2',
]

type Tool = { id: string; title: string; desc: string; art: string }

const TOOLS: Tool[] = [
  {
    id: 'image-generation',
    title: 'Image Generation',
    desc: 'Produce images in various sizes and styles from text prompts.',
    art: artImageGeneration,
  },
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
type MasonryImg = { src: string; ar: number; prompt: string; model: string }
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
]

const SKELETON_MS = 950

export default function ImagesPage() {
  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState('Todos os modelos')
  const [favs, setFavs] = useState<Record<string, boolean>>({})
  const railRef = useRef<HTMLDivElement>(null)
  const [railEdge, setRailEdge] = useState<{ start: boolean; end: boolean }>({
    start: true,
    end: false,
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

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

  const toggleFav = (id: string) => setFavs((f) => ({ ...f, [id]: !f[id] }))

  return (
    <main className="images-page">
      <div className="ip-container">
        <h1 className="ip-title">Geração e edição de Imagens</h1>

        <ImagePromptBar />

        {/* ---------- Ferramentas de Imagem (carrossel) ---------- */}
        <section className="ip-section">
          <div className="ip-section-head">
            <h2 className="ip-section-title">Ferramentas de Imagem</h2>
          </div>

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
                : TOOLS.map((tool, i) => (
                    <article
                      className="tool-card"
                      key={tool.id}
                      style={
                        { '--i': i, '--tilt': i % 2 === 0 ? '-1.5deg' : '1.5deg' } as CSSProperties
                      }
                    >
                      <div className="tool-card-header">
                        <h3>{tool.title}</h3>
                        <p>{tool.desc}</p>
                      </div>
                      <div className="tool-card-art">
                        <img src={tool.art} alt="" loading="lazy" />
                      </div>
                      <button
                        type="button"
                        className={`tool-fav${favs[tool.id] ? ' is-on' : ''}`}
                        aria-label={
                          favs[tool.id] ? `Desfavoritar ${tool.title}` : `Favoritar ${tool.title}`
                        }
                        aria-pressed={!!favs[tool.id]}
                        onClick={() => toggleFav(tool.id)}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                          <path
                            d="M5.5 0.9 6.94 3.82l3.22.47-2.33 2.27.55 3.21L5.5 8.26 2.62 9.77l.55-3.21L0.84 4.29l3.22-.47L5.5 0.9Z"
                            fill={favs[tool.id] ? '#f2b544' : 'none'}
                            stroke={favs[tool.id] ? '#f2b544' : 'currentColor'}
                            strokeWidth="0.9"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
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

        {/* ---------- Explorar (apenas filtros por enquanto) ---------- */}
        <section className="ip-section">
          <div className="ip-section-head">
            <h2 className="ip-section-title">Explorar</h2>
          </div>

          <div className="ip-models">
            {MODELS.map((m) => (
              <button
                key={m}
                type="button"
                className={`ip-pill is-model${model === m ? ' is-active' : ''}`}
                onClick={() => setModel(m)}
              >
                {m}
              </button>
            ))}
          </div>

          {/* grid orgânico (Pinterest) — imagens geradas; overlay com prompt no hover */}
          <div className="ip-masonry">
            {MASONRY.map((m, i) => (
              <figure
                className="ip-mtile"
                key={m.src}
                style={{ aspectRatio: String(m.ar), '--i': i } as CSSProperties}
              >
                <img src={m.src} alt="" loading="lazy" />
                <figcaption className="ip-mtile-ov">
                  <p className="ip-mtile-prompt">{m.prompt}</p>
                  <div className="ip-mtile-foot">
                    <span className="ip-mtile-model">{m.model}</span>
                    <span className="ip-mtile-acts">
                      <button type="button" className="ip-mtile-icon" aria-label="Baixar imagem">
                        <Download size={15} strokeWidth={2} />
                      </button>
                      <button type="button" className="ip-mtile-use">
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
    </main>
  )
}
