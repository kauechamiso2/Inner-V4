import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import searchIcon from '../assets/search-light.svg'
import artTranscribe from '../assets/videos/transcribe.png'
import artVideoFromImage from '../assets/videos/video-from-image.png'
import artAvatar from '../assets/videos/avatar.png'
import artVideoGeneration from '../assets/videos/video-generation.png'
import artViralCuts from '../assets/videos/viral-cuts.png'

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
    id: 'transcrever-video',
    title: 'Transcrever Vídeo',
    desc: 'Gere legendas e transcrições precisas do seu vídeo em segundos.',
    art: artTranscribe,
  },
  {
    id: 'video-com-base-imagem',
    title: 'Gerar Vídeo com Base em Imagem',
    desc: 'Transforme uma imagem de referência em um vídeo com movimento.',
    art: artVideoFromImage,
  },
  {
    id: 'avatar',
    title: 'Avatar',
    desc: 'Crie um apresentador em vídeo com avatares realistas de IA.',
    art: artAvatar,
  },
  {
    id: 'geracao-de-video',
    title: 'Geração de Vídeo',
    desc: 'Crie vídeos completos a partir de um prompt de texto.',
    art: artVideoGeneration,
  },
  {
    id: 'cortes-virais',
    title: 'Cortes Virais',
    desc: 'Recorte os melhores momentos e gere clipes prontos para viralizar.',
    art: artViralCuts,
  },
]

const SKELETON_MS = 950

export default function VideosPage() {
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
        <h1 className="ip-title">Ferramentas de Vídeo</h1>

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
