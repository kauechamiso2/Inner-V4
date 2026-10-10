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
import hMiniCity from '../assets/gen/mini-city.webp'
import hMiniIsland from '../assets/gen/mini-island.webp'
import hMiniStreet from '../assets/gen/mini-street.webp'
import hMiniCabin from '../assets/gen/mini-cabin.webp'
import hProdPerfume from '../assets/gen/prod-perfume.webp'
import hProdSerum from '../assets/gen/prod-serum.webp'
import hProdCoffee from '../assets/gen/prod-coffee.webp'
import hProdHeadphones from '../assets/gen/prod-headphones.webp'
import hArchBrutalist from '../assets/gen/arch-brutalist.webp'
import hArchMuseum from '../assets/gen/arch-museum.webp'
import hArchStairs from '../assets/gen/arch-stairs.webp'
import hArchVilla from '../assets/gen/arch-villa.webp'
import hWcFox from '../assets/gen/wc-fox.webp'
import hWcWhale from '../assets/gen/wc-whale.webp'
import hWcOwl from '../assets/gen/wc-owl.webp'
import hWcBear from '../assets/gen/wc-bear.webp'
import hIconRocket from '../assets/gen/icon-rocket.webp'
import hIconChat from '../assets/gen/icon-chat.webp'
import hIconCalendar from '../assets/gen/icon-calendar.webp'
import hIconBolt from '../assets/gen/icon-bolt.webp'
import genDog1 from '../assets/gen/dog-1.webp'
import genDog2 from '../assets/gen/dog-2.webp'
import genDog3 from '../assets/gen/dog-3.webp'

/* resultado mockado da geração (3 cachorros + 1 duplicado = 4) */
const GEN_RESULTS = [genDog1, genDog2, genDog3, genDog1]
/* tempo de "loading" antes de mostrar o resultado */
const GEN_MS = 2800

/* gerações anteriores do usuário (4 por pedido, uma fileira cada).
   Imagens próprias: não se repetem no Explorar */
const HISTORY_SEED: { prompt: string; model: string; srcs: string[] }[] = [
  {
    prompt: 'Cidades em miniatura isométricas, render 3D em argila, cores pastel',
    model: 'GPT Image 2',
    srcs: [hMiniCity, hMiniIsland, hMiniStreet, hMiniCabin],
  },
  {
    prompt: 'Fotos de produto para campanha: perfume, sérum, café e fone, luz suave',
    model: 'Nano Banana Pro',
    srcs: [hProdPerfume, hProdSerum, hProdCoffee, hProdHeadphones],
  },
  {
    prompt: 'Fotografia de arquitetura moderna, céu dramático, linhas limpas',
    model: 'Nano Banana 2',
    srcs: [hArchBrutalist, hArchMuseum, hArchStairs, hArchVilla],
  },
  {
    prompt: 'Ilustrações em aquarela de animais para livro infantil, textura de papel',
    model: 'Flux Schnell 1.0',
    srcs: [hWcFox, hWcWhale, hWcOwl, hWcBear],
  },
  {
    prompt: 'Ícones 3D brilhantes estilo inflável para app, fundo em degradê suave',
    model: 'GPT Image 2',
    srcs: [hIconRocket, hIconChat, hIconCalendar, hIconBolt],
  },
]

export type Tool = { id: string; title: string; desc: string; art: string }

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
type MasonryImg = { src: string; ar: number; prompt: string; model: string; uid?: string; cat?: string }

/* categorias do Explorar: filtram o grid orgânico */
const CATEGORIES = [
  { id: 'todos', label: 'Para você' },
  { id: 'personagens', label: 'Personagens' },
  { id: 'retratos', label: 'Retratos' },
  { id: 'moda', label: 'Moda' },
  { id: 'paisagens', label: 'Paisagens' },
  { id: 'gastronomia', label: 'Gastronomia' },
  { id: 'abstrato', label: 'Abstrato' },
  { id: 'produtos', label: 'Produtos e espaços' },
]
const MASONRY: MasonryImg[] = [
  {
    src: mCharMonster,
    cat: 'personagens',
    ar: 0.747,
    prompt: 'Monstrinho fofo de pelúcia verde, olhos grandes e curiosos, fundo claro, render 3D estilo Pixar',
    model: 'Nano Banana 2',
  },
  {
    src: mLandscapeLake,
    cat: 'paisagens',
    ar: 1.34,
    prompt: 'Lago de montanha ao amanhecer com reflexo espelhado, névoa suave, clima cinematográfico',
    model: 'Nano Banana 2',
  },
  {
    src: mPeopleFreckles,
    cat: 'retratos',
    ar: 0.747,
    prompt: 'Retrato editorial de mulher jovem com sardas, luz natural de janela, tons quentes',
    model: 'GPT Image 2',
  },
  {
    src: mClothesStreetwear,
    cat: 'moda',
    ar: 1,
    prompt: 'Flat lay de look streetwear minimalista, tons neutros, tênis e peças dobradas, vista de cima',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mCharCyber,
    cat: 'personagens',
    ar: 0.558,
    prompt: 'Garota cyberpunk com cabelo neon rosa e ciano, cidade futurista ao fundo, luz dramática',
    model: 'Nano Banana Pro',
  },
  {
    src: mFoodPoke,
    cat: 'gastronomia',
    ar: 1,
    prompt: 'Poke bowl colorido visto de cima, salmão fresco, abacate e legumes, luz natural, foto gastronômica',
    model: 'Nano Banana 2',
  },
  {
    src: mPeopleSunglasses,
    cat: 'retratos',
    ar: 0.747,
    prompt: 'Homem estiloso de óculos escuros na rua, golden hour, fundo desfocado, cinematográfico',
    model: 'Nano Banana 2',
  },
  {
    src: mLandscapeDesert,
    cat: 'paisagens',
    ar: 1.792,
    prompt: 'Dunas de areia do deserto ao pôr do sol, sombras longas, paleta quente, minimalista',
    model: 'GPT Image 2',
  },
  {
    src: mTechRobot,
    cat: 'personagens',
    ar: 0.747,
    prompt: 'Robô humanoide futurista, branco brilhante e cromado, luz de estúdio, sci-fi detalhado',
    model: 'Nano Banana Pro',
  },
  {
    src: mClothesHandbag,
    cat: 'moda',
    ar: 1,
    prompt: 'Bolsa de couro de luxo sobre superfície de mármore, sombras suaves, foto de produto elegante',
    model: 'Nano Banana Pro',
  },
  {
    src: mCharFox,
    cat: 'personagens',
    ar: 0.747,
    prompt: 'Raposa ilustrada com uma mochilinha, arte vetorial plana, cores vibrantes, divertida',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mPeopleCraftsman,
    cat: 'retratos',
    ar: 0.747,
    prompt: 'Retrato documental de artesão idoso trabalhando a madeira, mãos marcadas, luz quente',
    model: 'Playground 2.5',
  },
  {
    src: mFashionEditorial,
    cat: 'moda',
    ar: 0.747,
    prompt: 'Editorial de moda, look estruturado avant-garde, luz dramática de estúdio, fundo minimalista',
    model: 'Nano Banana Pro',
  },
  {
    src: mColorsPaint,
    cat: 'abstrato',
    ar: 1.34,
    prompt: 'Respingo de tinta em macro, cores saturadas se misturando, líquido brilhante, abstrato',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mCharRobotpet,
    cat: 'personagens',
    ar: 0.747,
    prompt: 'Pet robô 3D fofo, branco e verde-menta brilhante, olhos expressivos, render estilo Pixar',
    model: 'Nano Banana 2',
  },
  {
    src: mFoodPancakes,
    cat: 'gastronomia',
    ar: 1,
    prompt: 'Pilha de panquecas fofas com frutas vermelhas e mel, vista de cima, luz natural',
    model: 'Nano Banana 2',
  },
  {
    src: mPeopleCurly,
    cat: 'retratos',
    ar: 0.747,
    prompt: 'Retrato editorial de rapaz de cabelo cacheado, fundo verde-azulado de estúdio, luz suave',
    model: 'GPT Image 2',
  },
  {
    src: mLandscapeForest,
    cat: 'paisagens',
    ar: 1.792,
    prompt: 'Trilha de floresta na névoa ao amanhecer, pinheiros altos, clima cinematográfico, verdes suaves',
    model: 'Nano Banana 2',
  },
  {
    src: mFashionAccessories,
    cat: 'moda',
    ar: 1,
    prompt: 'Flat lay de acessórios de luxo: relógio, óculos e perfume sobre mármore creme, sombras suaves',
    model: 'Nano Banana Pro',
  },
  {
    src: mPeopleElderly,
    cat: 'retratos',
    ar: 0.747,
    prompt: 'Retrato documental de senhora sorrindo, luz natural quente de janela, tons suaves',
    model: 'Playground 2.5',
  },
  {
    src: mColorsGradient,
    cat: 'abstrato',
    ar: 1,
    prompt: 'Ondas de gradiente vibrante, campo de cor fluido, magenta, roxo e ciano, render 3D suave',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mCharFoxwarrior,
    cat: 'personagens',
    ar: 0.747,
    prompt: 'Raposa guerreira de fantasia ilustrada, arte vetorial plana, cores vibrantes, pose confiante',
    model: 'Flux Schnell 1.0',
  },
  {
    src: mInteriorMinimal,
    cat: 'produtos',
    ar: 1.34,
    prompt: 'Interior minimalista iluminado pelo sol, tons de madeira e bege, janela ampla, sombras suaves',
    model: 'GPT Image 2',
  },
  {
    src: mTechSneaker,
    cat: 'produtos',
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
  const [category, setCategory] = useState('todos')
  /* vista "Gerações" (histórico): abre ao gerar ou ao clicar numa ferramenta.
     A home é só exploratória (Explorar + categorias) */
  const [generating, setGenerating] = useState(false)
  /* geração em andamento: linha de skeletons no topo das Gerações */
  const [running, setRunning] = useState(false)
  const [genPrompt, setGenPrompt] = useState('')
  const genTimerRef = useRef<number | null>(null)
  const genCountRef = useRef(0)
  /* histórico de gerações (mais recentes primeiro). Começa com gerações
     anteriores do usuário; os filhotes só entram quando ele pedir pra gerar */
  const [generated, setGenerated] = useState<MasonryImg[]>(() =>
    HISTORY_SEED.flatMap((batch, b) =>
      batch.srcs.map((src, i) => ({
        uid: `seed-${b}-${i}`,
        src,
        ar: 16 / 9,
        prompt: batch.prompt,
        model: batch.model,
      })),
    ),
  )
  /* ferramenta aberta (Remove Background, etc.): abre um drawer à esquerda */
  const [tool, setTool] = useState<Tool | null>(null)
  /* mantém o conteúdo do drawer durante a animação de fechar */
  const lastToolRef = useRef<Tool | null>(null)
  if (tool) lastToolRef.current = tool
  /* Explorar ⇄ Gerações são telas distintas: uma sai (fade) e a outra entra
     já no lugar, sem a grade de uma "escorrer" para a outra */
  const [swap, setSwap] = useState<'idle' | 'out' | 'in'>('idle')
  const swapTimers = useRef<number[]>([])
  /* depois da primeira troca, a entrada da página (page-in) não pode voltar a
     rodar quando a classe da troca sai: era isso que "piscava" no fim */
  const [swapped, setSwapped] = useState(false)
  const swapTo = (open: boolean) => {
    if (open === generating && swap === 'idle') return
    setSwapped(true)
    swapTimers.current.forEach((t) => window.clearTimeout(t))
    setSwap('out')
    swapTimers.current = [
      window.setTimeout(() => {
        setGenerating(open)
        scrollRef.current?.scrollTo({ top: 0 })
        setSwap('in')
      }, 170),
      window.setTimeout(() => setSwap('idle'), 170 + 420),
    ]
  }
  const openGenerations = () => swapTo(true)
  /* card de ferramenta: abre o drawer e, por trás, o histórico de Gerações.
     "Image Generation" não tem template: abre o histórico com a barra de prompt */
  const [barFocusKey, setBarFocusKey] = useState(0)
  /* pedido de foco: atendido assim que a barra estiver visível */
  const wantFocusRef = useRef(false)
  const focusBar = () => {
    wantFocusRef.current = true
    setBarFocusKey((k) => k + 1)
  }
  /* cabeçalho das Minhas gerações saiu de vista: voltar + filtro viram overlay fixo */
  const gensHeadRef = useRef<HTMLDivElement>(null)
  const [headOut, setHeadOut] = useState(false)
  const openTool = (t: Tool) => {
    if (t.id !== 'image-generation') setTool(t)
    openGenerations()
    /* Image Generation: a barra já chega ativa e com o cursor no campo */
    if (t.id === 'image-generation') focusBar()
  }
  const startGenerate = (prompt?: string) => {
    if (genTimerRef.current) window.clearTimeout(genTimerRef.current)
    const text = (prompt ?? promptValue).trim() || 'Geração de imagem'
    setGenPrompt(text)
    setRunning(true)
    setPromptValue('')
    setAttachments([])
    openGenerations()
    /* ao terminar, o resultado entra no topo do histórico */
    genTimerRef.current = window.setTimeout(() => {
      const n = genCountRef.current++
      setGenerated((prev) => [
        ...GEN_RESULTS.map((src, i) => ({
          uid: `gen-${n}-${i}`,
          src,
          ar: 16 / 9,
          prompt: text,
          model: 'Nano Banana 2',
        })),
        ...prev,
      ])
      setRunning(false)
    }, GEN_MS)
  }
  /* voltar: sai das Gerações (uma geração em andamento continua e entra no histórico) */
  const exitGenerate = () => swapTo(false)
  /* fechar o drawer de um template volta pra home de Imagens (Explorar) */
  const closeTool = () => {
    setTool(null)
    exitGenerate()
  }
  /* o listener de clique fora é criado uma vez por abertura: usa sempre a versão atual */
  const closeToolRef = useRef(closeTool)
  closeToolRef.current = closeTool
  /* geometria da área principal para alinhar a barra fixa (portal no body) */
  const [dockBox, setDockBox] = useState<{ left: number; width: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
      if (!(e.target as HTMLElement).closest('.ip-tool-drawer')) closeToolRef.current()
    }
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [tool])

  /* mede left/width da área principal para a barra fixa (atualiza em resize) */
  useLayoutEffect(() => {
    if (!generating) return
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
  }, [generating, tool])

  useEffect(() => {
    const root = scrollRef.current
    const head = gensHeadRef.current
    if (!generating || !root || !head) {
      setHeadOut(false)
      return
    }
    const check = () =>
      setHeadOut(head.getBoundingClientRect().bottom <= root.getBoundingClientRect().top + 4)
    check()
    root.addEventListener('scroll', check, { passive: true })
    return () => root.removeEventListener('scroll', check)
  }, [generating])

  /* a barra de prompt só existe nas Gerações (a home é só exploratória);
     com o drawer de uma ferramenta aberto, quem gera é o drawer */
  const showBar = generating && swap !== 'out' && !tool
  useEffect(() => {
    if (!showBar || !wantFocusRef.current) return
    wantFocusRef.current = false
    /* um frame depois de ficar visível: o campo já aceita foco */
    const id = window.setTimeout(() => setBarFocusKey((k) => k + 1), 60)
    return () => window.clearTimeout(id)
  }, [showBar, barFocusKey])

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
              onClick={closeTool}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </header>
          {lastToolRef.current && (
            <ToolDrawer
              key={lastToolRef.current.id}
              tool={lastToolRef.current}
              /* gera com o drawer do template aberto: o resultado entra nas
                 Minhas gerações por trás, sem trocar para o Image Generation */
              onGenerate={() => startGenerate(lastToolRef.current?.title)}
            />
          )}
        </div>
      </aside>

      <div className="ip-scroll" ref={scrollRef}>
      <div
        className={`ip-container${generating ? ' is-generating' : ''}${swap !== 'idle' ? ` is-swap-${swap}` : ''}${swapped ? ' has-swapped' : ''}`}
      >
        {/* cabeçalho recolhível (título + input + ferramentas): recolhe ao gerar
            e volta com fluidez ao clicar em voltar, empurrando a grade pra baixo */}
        <div className="ip-head">
          <div className="ip-head-inner">
        <h1 className="ip-title">Geração e edição de Imagens</h1>

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
                      onClick={() => openTool(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openTool(t)
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

        {/* ---------- Explorar: categorias + grid orgânico ---------- */}
        <section className="ip-section">
          {generating ? (
            /* ---------- Gerações (histórico) ---------- */
            <div className="ip-gens" key="gens">
              {/* voltar + título à esquerda, filtro à direita, na mesma linha */}
              <div className="ip-gens-head" ref={gensHeadRef}>
                <button type="button" className="ip-gens-back" aria-label="Voltar" onClick={exitGenerate}>
                  <ChevronLeft size={20} strokeWidth={2.2} />
                  <h2 className="ip-section-title">Minhas gerações</h2>
                </button>
                <button className="lib-new is-ghost" type="button" aria-label="Filtrar">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                      stroke="currentColor"
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
              {/* ao rolar: voltar + filtro fixos, como overlay escuro sobre as fotos */}
              <div className={`ip-gen-floatbar${headOut ? ' is-on' : ''}`} aria-hidden={!headOut}>
                <button
                  type="button"
                  className="ip-gen-float is-back"
                  aria-label="Voltar"
                  tabIndex={headOut ? 0 : -1}
                  onClick={exitGenerate}
                >
                  <ChevronLeft size={18} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  className="ip-gen-float is-filter"
                  aria-label="Filtrar"
                  tabIndex={headOut ? 0 : -1}
                >
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
              {running && (
                <div className="ip-gen-row" aria-label={`Gerando: ${genPrompt}`}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      className="ip-gen-skel"
                      key={i}
                      style={{ '--i': i } as CSSProperties}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
              <div className="ip-gen-row">{generated.map((m: MasonryImg, i: number) => (
                <figure
                  className="ip-gen-tile"
                  key={m.uid}
                  style={{ '--i': i % 4 } as CSSProperties}
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
                            focusBar()
                          }}
                        >
                          Usar de base
                        </button>
                      </span>
                    </div>
                  </figcaption>
                </figure>
              ))}</div>
            </div>
          ) : (
            /* ---------- Explorar (só exploratório) ---------- */
            <div className="ip-explore" key="explore">
              {/* header só no estado normal; no modo "gerando" os controles
                  viram overlay sobre as próprias gerações */}
              <div className="ip-section-head">
                <h2 className="ip-section-title">Explorar</h2>
              </div>
              <div className="ip-models ip-cats" role="tablist" aria-label="Categorias">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={category === c.id}
                    className={`ip-pill is-model${category === c.id ? ' is-active' : ''}`}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* grid orgânico (Pinterest) — imagens geradas; overlay com prompt no hover */}
              <div className="ip-masonry" key={category}>
                {(category === 'todos' ? MASONRY : MASONRY.filter((m) => m.cat === category)).map((m, i) => (
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
                              /* a barra vive nas Gerações: leva a imagem pra lá, já digitando */
                              openGenerations()
                              focusBar()
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
            </div>
          )}
        </section>
      </div>
      </div>

      {/* input fixado no rodapé — portal no body para ficar fixo ao viewport,
          alinhado à área principal (aparece quando o input do topo sai de vista) */}
      {createPortal(
        <div
          className={`ip-dock${showBar ? ' is-visible' : ''}`}
          style={dockBox ? ({ left: dockBox.left, width: dockBox.width } as CSSProperties) : undefined}
          aria-hidden={!showBar}
        >
          <div className="ip-prompt-frame">
            <ImagePromptBar
              docked
              alwaysOpen
              autoFocusKey={barFocusKey}
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
            if (!generating) openGenerations()
            focusBar()
            closeImg()
          }}
        />
      )}
    </main>
  )
}
