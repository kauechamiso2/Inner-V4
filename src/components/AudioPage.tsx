import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './audio-page.css'
import searchIcon from '../assets/search-light.svg'
import { AudioLines, ListMusic, Mic, Music4 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CATEGORIES = ['Todos', 'Meus Templates de Áudio', 'Popular', 'Criação de Conteúdo']

type AudioTemplate = {
  id: string
  name: string
  desc: string
  category: string
  Icon: LucideIcon
}

const TEMPLATES: AudioTemplate[] = [
  {
    id: 'voz-digital',
    name: 'Voz Digital',
    desc: 'Crie narrações de áudio sintéticas a partir de texto, trazendo seu conteúdo escrito à vida com som natural.',
    category: 'Criação de Conteúdo',
    Icon: Mic,
  },
  {
    id: 'transcrever-audio',
    name: 'Transcrever Áudio',
    desc: 'Transcreva arquivos de áudio. A partir daí, inicie uma conversa, gere legendas, peça detalhes específicos ou exporte um resumo.',
    category: 'Popular',
    Icon: ListMusic,
  },
  {
    id: 'geracao-de-musica',
    name: 'Geração de Música',
    desc: 'Gere músicas originais com base na sua descrição, perfeitas para vídeos, jogos ou projetos criativos.',
    category: 'Criação de Conteúdo',
    Icon: Music4,
  },
  {
    id: 'efeito-sonoro',
    name: 'Efeito Sonoro',
    desc: 'Crie e personalize efeitos sonoros a partir de prompts de texto, ideal para jogos, vídeos e projetos criativos.',
    category: 'Popular',
    Icon: AudioLines,
  },
]

const SKELETON_MS = 850

export default function AudioPage() {
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  const list =
    category === 'Todos' || category === 'Meus Templates de Áudio'
      ? category === 'Meus Templates de Áudio'
        ? []
        : TEMPLATES
      : TEMPLATES.filter((t) => t.category === category)

  return (
    <main className="images-page audio-page">
      <div className="ip-container ap-container">
        <h1 className="ip-title">Ferramentas de Áudio</h1>

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

        {list.length === 0 ? (
          <div className="audio-empty">
            <span className="audio-empty-emoji" aria-hidden="true">🎧</span>
            <p className="audio-empty-title">Nenhum template salvo ainda</p>
            <p className="audio-empty-sub">Salve um template de áudio para vê-lo aqui.</p>
          </div>
        ) : (
          <div className="audio-grid">
            {loading
              ? TEMPLATES.map((t, i) => (
                  <div className="audio-card is-skeleton" key={t.id} style={{ '--i': i } as CSSProperties}>
                    <div className="audio-icon sk-base" />
                    <div className="sk-base sk-name" />
                    <div className="audio-desc-sk">
                      <div className="sk-base sk-line" />
                      <div className="sk-base sk-line" />
                      <div className="sk-base sk-line short" />
                    </div>
                  </div>
                ))
              : list.map((t, i) => {
                  const { Icon } = t
                  return (
                    <article className="audio-card" key={t.id} style={{ '--i': i } as CSSProperties}>
                      <span className="audio-icon" aria-hidden="true">
                        <Icon size={20} strokeWidth={1.9} />
                      </span>
                      <h3 className="audio-name">{t.name}</h3>
                      <p className="audio-desc">{t.desc}</p>
                    </article>
                  )
                })}
          </div>
        )}
      </div>
    </main>
  )
}
