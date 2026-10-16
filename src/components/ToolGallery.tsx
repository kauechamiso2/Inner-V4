import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import './images-page.css'
import './video-gen.css'
import searchIcon from '../assets/search-light.svg'
import Flow from './flow/Flow'
import type { FlowConfig } from './flow/Flow'
import type { ImageModel } from './imageModels'
import { normSearch } from './SearchToggle'
import type { DocResult } from './DocModal'
import type { AudioResultItem } from './AudioModal'
import type { SlidesResult } from './SlidesModal'

/* Galeria de ferramentas de um pilar (Vídeos, Áudio...): cards com busca e
   filtros; o histórico de gerações fica no painel lateral. Abrir um card leva
   para o flow da ferramenta (design system); fechar volta para a galeria. */

export type GalleryTool = {
  id: string
  title: string
  desc: string
  cats: string[]
  /* ilustração do card (Vídeos) ou um ícone num círculo (Áudio) */
  art?: string
  icon?: ReactNode
  /* template de uma área (aparece embaixo do título) */
  tag?: string
  /* arte é uma foto (moldura com play), não uma ilustração */
  photo?: boolean
}

const SKELETON_MS = 700

export default function ToolGallery({
  title,
  categories,
  items,
  flows,
  models,
  defaultModel,
  autoName,
  newTool,
  iconColor = '#8b5cf6',
  newKey = 0,
  onFlowChange,
  regen = null,
  onOpenDoc,
  onOpenAudio,
  onOpenSlides,
}: {
  /* Apresentações: o resultado abre no modal de slides */
  onOpenSlides?: (r: SlidesResult) => void
  /* Áudio: o resultado abre no modal de áudio */
  onOpenAudio?: (a: AudioResultItem) => void
  /* Documentos: o resultado abre no modal de documento */
  onOpenDoc?: (doc: DocResult) => void
  title: string
  categories: string[]
  items: GalleryTool[]
  flows: Record<string, FlowConfig>
  /* lista de modelos do pilar e o modelo inicial dos flows */
  models: ImageModel[]
  defaultModel: string
  autoName?: string
  /* ferramenta aberta pelo "Novo ..." do painel lateral */
  newTool: string
  /* cor do ícone dos cards (Áudio roxo, Documentos azul) */
  iconColor?: string
  newKey?: number
  /* "Regerar" no detalhe de um vídeo do histórico: abre o flow já preenchido */
  regen?: { tool: string; prompt: string; key: number } | null
  /* flow aberto: o App esconde o painel de histórico (o flow tem a própria coluna) */
  onFlowChange?: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(true)
  /* setas da fileira de categorias (só quando não cabe) */
  const catsRef = useRef<HTMLDivElement>(null)
  const [catEdge, setCatEdge] = useState({ start: true, end: true })
  const updateCatEdge = () => {
    const el = catsRef.current
    if (!el) return
    const start = el.scrollLeft <= 2
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
    setCatEdge((p) => (p.start === start && p.end === end ? p : { start, end }))
  }
  const scrollCats = (dir: number) => catsRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  useEffect(() => {
    updateCatEdge()
    /* a largura muda com a janela e com o painel lateral abrindo/fechando */
    const el = catsRef.current
    const ro = el ? new ResizeObserver(updateCatEdge) : null
    if (el) ro?.observe(el)
    return () => ro?.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])
  const [category, setCategory] = useState('Todos')
  const [query, setQuery] = useState('')
  /* ferramenta aberta (tela de geração) */
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])
  const [prefill, setPrefill] = useState<Record<string, string> | undefined>(undefined)
  /* remonta o flow só depois que o preenchido (Regerar) já está no estado */
  const [flowKey, setFlowKey] = useState(0)
  useEffect(() => {
    if (!regen) return
    setPrefill({ prompt: regen.prompt, text: regen.prompt })
    setOpen(regen.tool)
    setFlowKey((k) => k + 1)
  }, [regen?.key])
  /* "Novo ..." no painel lateral: abre a ferramenta principal do pilar */
  useEffect(() => {
    if (!newKey) return
    setPrefill(undefined)
    setOpen(newTool)
  }, [newKey])

  useEffect(() => {
    onFlowChange?.(!!open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  useEffect(() => () => onFlowChange?.(false), [])

  if (open && flows[open]) {
    return (
      <Flow
        key={`${open}-${newKey}-${flowKey}`}
        config={flows[open]}
        initialValues={prefill}
        models={models}
        initialModel={defaultModel}
        autoName={autoName}
        onOpenDoc={onOpenDoc ? (d) => onOpenDoc({ ...d, tool: open }) : undefined}
        onOpenSlides={onOpenSlides ? (r) => onOpenSlides({ ...r, tool: open }) : undefined}
        onOpenAudio={
          onOpenAudio
            ? ({ i, ...a }) => onOpenAudio({ ...a, seed: i, tool: open, kind: (open === 'transcribe' ? 'transcribe' : open === 'music' ? 'music' : open === 'sfx' ? 'sfx' : 'voice') })
            : undefined
        }
        onClose={() => {
          setOpen(null)
          setPrefill(undefined)
        }}
      />
    )
  }

  const nq = normSearch(query)
  const list = items.filter(
    (t) =>
      (category === 'Todos' || t.cats.includes(category)) &&
      (!nq || normSearch(`${t.title} ${t.desc}`).includes(nq)),
  )

  return (
    <main className="images-page vg-page" style={{ '--vg-icon': iconColor } as CSSProperties}>
      <div className="ip-container">
        <h1 className="ip-title">{title}</h1>

        <label className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar ferramentas"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        {/* filtros: fileira horizontal; com muitas categorias ganha setas nas pontas */}
        <div className={`vg-cats-wrap${catEdge.start ? '' : ' has-prev'}${catEdge.end ? '' : ' has-next'}`}>
          <button type="button" className="vg-cats-nav is-prev" aria-label="Categorias anteriores" onClick={() => scrollCats(-1)}>
            <ChevronLeft size={16} strokeWidth={2.2} />
          </button>
          <div className="ip-categories" role="tablist" aria-label="Categorias" ref={catsRef} onScroll={updateCatEdge}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                className={`ip-pill${category === c ? ' is-active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="vg-cats-nav is-next" aria-label="Próximas categorias" onClick={() => scrollCats(1)}>
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="ip-grid vg-grid" key={`${category}-${nq}`}>
          {loading
            ? items.map((t, i) => (
                <div className="tool-card is-skeleton" key={t.id} style={{ '--i': i } as CSSProperties}>
                  <div className="sk-line sk-title" />
                  <div className="sk-line sk-desc" />
                  <div className="sk-line sk-desc is-short" />
                  <div className="sk-art" />
                </div>
              ))
            : list.map((t, i) => (
                <article
                  className={`tool-card${t.icon ? ' vg-icon-card' : ''}`}
                  key={t.id}
                  style={{ '--i': i, '--tilt': i % 2 === 0 ? '-1.5deg' : '1.5deg' } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpen(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setOpen(t.id)
                    }
                  }}
                >
                  {/* card com ícone (ex.: Áudio) no lugar da ilustração */}
                  {t.icon && (
                    <span className="vg-card-icon" aria-hidden="true">
                      {t.icon}
                    </span>
                  )}
                  <div className="tool-card-header">
                    <h3>{t.title}</h3>
                    {t.tag && <span className="vg-tag">{t.tag}</span>}
                    <p>{t.desc}</p>
                  </div>
                  {t.art && (
                    <div className={`tool-card-art${t.photo ? ' vg-photo' : ''}`}>
                      <img src={t.art} alt="" loading="lazy" />
                      {t.photo && (
                        <span className="vg-photo-play" aria-hidden="true">
                          <Play size={14} strokeWidth={0} fill="currentColor" />
                        </span>
                      )}
                    </div>
                  )}
                </article>
              ))}
        </div>
        {!loading && list.length === 0 && (
          <p className="vg-empty">
            Nenhuma ferramenta encontrada.
          </p>
        )}
      </div>
    </main>
  )
}
