import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import searchIcon from '../assets/search-light.svg'
import artImageGeneration from '../assets/tools/image-generation.png'
import artRemoveBackground from '../assets/tools/remove-background.png'
import artGenerateCartoon from '../assets/tools/generate-cartoon.png'
import artClothingShoot from '../assets/tools/clothing-shoot.png'
import artImageEditing from '../assets/tools/image-editing.png'
import artPhotoRestoration from '../assets/tools/photo-restoration.png'
import artLinkedinPhoto from '../assets/tools/linkedin-photo.png'
import artImageFromImage from '../assets/tools/image-from-image.png'
import artChangeBackground from '../assets/tools/change-background.png'

const CATEGORIES = [
  'Todos',
  'Popular',
  'Meus templates',
  'Vendas',
  'Arquitetos',
  'Recursos Humanos',
  'Criação de Conteúdo',
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

const SKELETON_MS = 950

export default function ImagesPage() {
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')
  const [favs, setFavs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  const toggleFav = (id: string) => setFavs((f) => ({ ...f, [id]: !f[id] }))

  return (
    <main className="images-page">
      <div className="ip-container">
        <h1 className="ip-title">Ferramentas de Imagem</h1>

        <div className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar ferramentas" spellCheck={false} />
        </div>

        <div className="ip-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ip-pill${category === c ? ' is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ip-grid">
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
                  style={{ '--i': i, '--tilt': i % 2 === 0 ? '-1.5deg' : '1.5deg' } as CSSProperties}
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
                    aria-label={favs[tool.id] ? `Desfavoritar ${tool.title}` : `Favoritar ${tool.title}`}
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
      </div>
    </main>
  )
}
