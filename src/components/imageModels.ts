import { useSyncExternalStore } from 'react'
import flux from '../assets/models/flux.svg'
import playground from '../assets/models/playground.png'
import nanobanana from '../assets/models/nanobanana-color.svg'
import openai from '../assets/models/openai.svg'
import luma from '../assets/models/luma-color.svg'
import recraft from '../assets/models/recraft.svg'
import ideogram from '../assets/models/ideogram.svg'
import stability from '../assets/models/stability-color.svg'
import leonardo from '../assets/models/leonardo.png'
import seedream from '../assets/models/bytedance-color.svg'
import minimax from '../assets/models/minimax-color.svg'
import qwen from '../assets/models/qwen-color.svg'
import runway from '../assets/models/runway.svg'
import wan from '../assets/models/wan.png'
import grok from '../assets/models/grok.svg'

/* Modelos do Image Generation. Logos: LobeHub Icons (MIT) e os ícones dos
   sites (Playground, Leonardo, Wan). "Automático" escolhe o modelo sozinho. */

export type ImageModel = {
  id: string
  name: string
  logo?: string
  /* créditos por imagem (0 = incluso no plano) */
  credits: number
  desc: string
}

export const IMAGE_MODELS: ImageModel[] = [
  { id: 'auto', name: 'Automático', credits: 120, desc: 'Escolhe o melhor modelo para cada pedido. Hoje está usando o Nano Banana 2.' },
  { id: 'flux-schnell', name: 'Flux Schnell 1.0', logo: flux, credits: 0, desc: 'Rápido e incluso no plano: bom para testar ideias.' },
  { id: 'playground', name: 'Playground 2.5', logo: playground, credits: 0, desc: 'Imagens estéticas e coloridas, inclusas no plano.' },
  { id: 'nano-banana', name: 'Nano Banana', logo: nanobanana, credits: 50, desc: 'Do Google, ótimo para editar fotos mantendo o que importa.' },
  { id: 'nano-banana-2', name: 'Nano Banana 2', logo: nanobanana, credits: 120, desc: 'Nova versão, com mais detalhe e texto legível nas imagens.' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', logo: nanobanana, credits: 200, desc: 'A versão mais caprichada, para peças finais.' },
  { id: 'gpt-image-2', name: 'GPT Image 2', logo: openai, credits: 140, desc: 'Da OpenAI, segue instruções longas e escreve bem nas imagens.' },
  { id: 'flux-2-flex', name: 'Flux 2 Flex', logo: flux, credits: 170, desc: 'Flux com controle fino de estilo e composição.' },
  { id: 'flux-kontext', name: 'Flux Kontext', logo: flux, credits: 68, desc: 'Edita uma imagem base a partir de instruções em texto.' },
  { id: 'flux-11-ultra', name: 'Flux 1.1 Ultra', logo: flux, credits: 110, desc: 'Alta resolução e realismo fotográfico.' },
  { id: 'luma-photon', name: 'Luma Photon', logo: luma, credits: 35, desc: 'Fotos naturais com ótimo custo-benefício.' },
  { id: 'flux-pro-11', name: 'Flux Pro 1.1', logo: flux, credits: 74, desc: 'Equilíbrio entre qualidade e velocidade.' },
  { id: 'recraft', name: 'Recraft Red Panda', logo: recraft, credits: 74, desc: 'Ilustrações, ícones e imagens vetoriais.' },
  { id: 'ideogram-3', name: 'Ideogram 3', logo: ideogram, credits: 150, desc: 'O melhor em tipografia e texto dentro da imagem.' },
  { id: 'sd-35', name: 'Stable Diffusion 3.5 Large', logo: stability, credits: 120, desc: 'Modelo aberto da Stability AI, versátil em estilos.' },
  { id: 'leonardo', name: 'Leonardo AI', logo: leonardo, credits: 28, desc: 'Arte conceitual e personagens para jogos.' },
  { id: 'seedream-4', name: 'Seedream 4', logo: seedream, credits: 50, desc: 'Da ByteDance, rápido e com cores vibrantes.' },
  { id: 'minimax', name: 'MiniMax Image-01', logo: minimax, credits: 15, desc: 'Econômico, bom para volume.' },
  { id: 'qwen', name: 'Qwen', logo: qwen, credits: 35, desc: 'Da Alibaba, entende bem pedidos em vários idiomas.' },
  { id: 'runway-gen4', name: "Runway's Gen-4", logo: runway, credits: 75, desc: 'Consistência de personagens entre imagens.' },
  { id: 'wan-25', name: 'Wan 2.5', logo: wan, credits: 75, desc: 'Da Alibaba, realista e com boa iluminação.' },
  { id: 'grok-imagine', name: 'Grok Imagine', logo: grok, credits: 45, desc: 'Da xAI, criativo e rápido.' },
]

/* modelo que o Automático está usando agora */
export const AUTO_MODEL = 'Nano Banana 2'

export const IMAGE_MODEL_BY_ID = Object.fromEntries(IMAGE_MODELS.map((m) => [m.id, m])) as Record<string, ImageModel>

export const ASPECT_RATIOS = ['Auto', '1:1', '3:2', '2:3', '16:9', '9:16', '4:3', '3:4', '21:9'] as const
export type AspectRatio = (typeof ASPECT_RATIOS)[number]

export const RESOLUTIONS = [
  { id: '1K', px: '1024px' },
  { id: '2K', px: '2048px' },
  { id: '4K', px: '4096px' },
] as const
export type Resolution = (typeof RESOLUTIONS)[number]['id']

/* imagens da Biblioteca disponíveis como base (o "+" só mostra imagens) */
const pic = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`
export const LIBRARY_IMAGES: { id: string; name: string; src: string }[] = [
  { id: 'li-hero', name: 'Hero 3D do site novo', src: pic('hero3d') },
  { id: 'li-banner', name: 'Banner da Black Friday', src: pic('blackfriday') },
  { id: 'li-ensaio', name: 'Fotos do ensaio de produto', src: pic('lib-ensaio') },
  { id: 'li-campanha', name: 'Key visual da campanha', src: pic('kv-campanha') },
  { id: 'li-moodboard', name: 'Moodboard de verão', src: pic('moodboard-verao') },
  { id: 'li-produto', name: 'Packshot do produto', src: pic('packshot') },
  { id: 'li-equipe', name: 'Foto da equipe', src: pic('equipe-foto') },
  { id: 'li-evento', name: 'Evento de lançamento', src: pic('evento-lanc') },
  { id: 'li-textura', name: 'Textura de fundo', src: pic('textura-fundo') },
]

/* configuração do input (protótipo): a barra do topo e a do rodapé compartilham */
type Settings = { model: string; ratio: AspectRatio; res: Resolution }
let settings: Settings = { model: 'nano-banana-2', ratio: '16:9', res: '4K' }
const listeners = new Set<() => void>()
export const setImageSettings = (patch: Partial<Settings>) => {
  settings = { ...settings, ...patch }
  listeners.forEach((l) => l())
}
export const getImageSettings = () => settings
export const useImageSettings = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => settings,
  )
