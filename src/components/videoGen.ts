import { useSyncExternalStore } from 'react'
import artTranscribe from '../assets/videos/transcribe.png'
import artVideoFromImage from '../assets/videos/video-from-image.png'
import artAvatar from '../assets/videos/avatar.png'
import artVideoGeneration from '../assets/videos/video-generation.png'
import artViralCuts from '../assets/videos/viral-cuts.png'
import mLake from '../assets/masonry/landscape-lake.webp'
import mDesert from '../assets/masonry/landscape-desert.webp'
import mForest from '../assets/masonry/landscape-forest.webp'
import mCyber from '../assets/masonry/char-cyber.webp'
import mFox from '../assets/masonry/char-fox.webp'
import mFoxWarrior from '../assets/masonry/char-foxwarrior.webp'
import mRobotPet from '../assets/masonry/char-robotpet.webp'
import mMonster from '../assets/masonry/char-monster.webp'
import mFreckles from '../assets/masonry/people-freckles.webp'
import mSunglasses from '../assets/masonry/people-sunglasses.webp'
import mCraftsman from '../assets/masonry/people-craftsman.webp'
import mCurly from '../assets/masonry/people-curly.webp'
import mPancakes from '../assets/masonry/food-pancakes.webp'
import mPoke from '../assets/masonry/food-poke.webp'
import mSneaker from '../assets/masonry/tech-sneaker.webp'
import mRobot from '../assets/masonry/tech-robot.webp'
import mEditorial from '../assets/masonry/fashion-editorial.webp'
import mInterior from '../assets/masonry/interior-minimal.webp'
import mGradient from '../assets/masonry/colors-gradient.webp'
import gemini from '../assets/models/gemini-color.svg'
import kling from '../assets/models/kling-color.svg'
import seedance from '../assets/models/bytedance-color.svg'
import hailuo from '../assets/models/hailuo-color.svg'
import sora from '../assets/models/sora-color.svg'
import runway from '../assets/models/runway.svg'
import luma from '../assets/models/luma-color.svg'
import pixverse from '../assets/models/pixverse-color.svg'
import vidu from '../assets/models/vidu-color.svg'
import wan from '../assets/models/wan.png'
import grok from '../assets/models/grok.svg'
import type { ImageModel } from './imageModels'

/* Pilar de Vídeos (v2): mesma estrutura do pilar de Imagens, com ferramentas,
   modelos e exemplos de vídeo. Capas: imagens da galeria (protótipo). */

/* ferramenta que abre a barra de prompt (as demais abrem o drawer) */
export const VIDEO_GEN_TOOL = 'video-generation'

export const VIDEO_TOOLS = [
  { id: VIDEO_GEN_TOOL, title: 'Geração de Vídeo', desc: 'Crie vídeos completos a partir de um prompt de texto.', art: artVideoGeneration },
  { id: 'video-from-image', title: 'Vídeo a partir de Imagem', desc: 'Transforme uma imagem de referência em um vídeo com movimento.', art: artVideoFromImage },
  { id: 'avatar', title: 'Avatar', desc: 'Crie um apresentador em vídeo com avatares realistas de IA.', art: artAvatar },
  { id: 'transcribe', title: 'Transcrever Vídeo', desc: 'Gere legendas e transcrições precisas do seu vídeo em segundos.', art: artTranscribe },
  { id: 'viral-cuts', title: 'Cortes Virais', desc: 'Recorte os melhores momentos e gere clipes prontos para viralizar.', art: artViralCuts },
]

/* modelos de vídeo (mesmo formato dos de imagem: logo, nome e créditos por vídeo) */
export const VIDEO_MODELS: ImageModel[] = [
  { id: 'v-auto', name: 'Automático', credits: 180, desc: 'Escolhe o melhor modelo para cada pedido.' },
  { id: 'veo-31', name: 'Veo 3.1', logo: gemini, credits: 320, desc: 'Do Google, com áudio e cenas realistas.' },
  { id: 'veo-31-fast', name: 'Veo 3.1 Fast', logo: gemini, credits: 160, desc: 'Versão rápida do Veo 3.1.' },
  { id: 'sora-2', name: 'Sora 2', logo: sora, credits: 280, desc: 'Da OpenAI, cinematográfico e com física convincente.' },
  { id: 'kling-30', name: 'Kling 3.0', logo: kling, credits: 180, desc: 'Movimento fluido e boa consistência de personagem.' },
  { id: 'seedance-25', name: 'Seedance 2.5', logo: seedance, credits: 140, desc: 'Da ByteDance, rápido e com cortes de câmera.' },
  { id: 'hailuo-2', name: 'Hailuo 2', logo: hailuo, credits: 120, desc: 'Da MiniMax, ótimo em expressões e ação.' },
  { id: 'runway-gen4', name: "Runway's Gen-4", logo: runway, credits: 150, desc: 'Controle de câmera e estilo.' },
  { id: 'luma-ray3', name: 'Luma Ray 3', logo: luma, credits: 130, desc: 'Realismo e iluminação naturais.' },
  { id: 'wan-25', name: 'Wan 2.5', logo: wan, credits: 90, desc: 'Da Alibaba, aberto e com bom custo-benefício.' },
  { id: 'pixverse-5', name: 'PixVerse 5', logo: pixverse, credits: 70, desc: 'Efeitos e estilos virais.' },
  { id: 'vidu-q2', name: 'Vidu Q2', logo: vidu, credits: 60, desc: 'Animações e anime com movimento suave.' },
  { id: 'grok-video', name: 'Grok Imagine', logo: grok, credits: 120, desc: 'Da xAI, criativo e rápido.' },
]
export const VIDEO_MODEL_BY_ID = Object.fromEntries(VIDEO_MODELS.map((m) => [m.id, m])) as Record<string, ImageModel>
export const VIDEO_AUTO_MODEL = 'Kling 3.0'

export const VIDEO_RATIOS = ['16:9', '9:16', '1:1'] as const
export const VIDEO_DURATIONS = ['5s', '8s', '10s'] as const
export const VIDEO_QUALITIES = [
  { id: '720p', hint: 'HD' },
  { id: '1080p', hint: 'Full HD' },
] as const

/* configuração do input de vídeo (a barra do topo e a do rodapé compartilham) */
type VideoSettings = { model: string; ratio: string; duration: string; quality: string }
let settings: VideoSettings = { model: 'kling-30', ratio: '16:9', duration: '5s', quality: '1080p' }
const listeners = new Set<() => void>()
export const setVideoSettings = (patch: Partial<VideoSettings>) => {
  settings = { ...settings, ...patch }
  listeners.forEach((l) => l())
}
export const getVideoSettings = () => settings
export const useVideoSettings = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => settings,
  )

/* Explorar (vídeos da comunidade): capa, categoria, duração e prompt */
export const VIDEO_CATEGORIES = [
  { id: 'todos', label: 'Para você' },
  { id: 'cinematico', label: 'Cinemático' },
  { id: 'personagens', label: 'Personagens' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'pessoas', label: 'Pessoas' },
  { id: 'natureza', label: 'Natureza' },
  { id: 'gastronomia', label: 'Gastronomia' },
]

export const VIDEO_MASONRY = [
  { src: mLake, cat: 'natureza', ar: 1.34, dur: '0:08', prompt: 'Drone sobrevoando lago de montanha ao amanhecer, névoa se dissipando, câmera lenta', model: 'Veo 3.1' },
  { src: mCyber, cat: 'personagens', ar: 0.558, dur: '0:05', prompt: 'Garota cyberpunk virando o rosto para a câmera, neon piscando na chuva', model: 'Kling 3.0' },
  { src: mSneaker, cat: 'produtos', ar: 1, dur: '0:06', prompt: 'Tênis girando em pedestal, luz de estúdio varrendo, fundo infinito', model: 'Seedance 2.5' },
  { src: mFreckles, cat: 'pessoas', ar: 0.747, dur: '0:05', prompt: 'Close de mulher sorrindo com vento no cabelo, luz de janela', model: 'Sora 2' },
  { src: mDesert, cat: 'cinematico', ar: 1.34, dur: '0:10', prompt: 'Travelling lateral em dunas ao pôr do sol, sombras longas, estilo filme', model: 'Veo 3.1' },
  { src: mPancakes, cat: 'gastronomia', ar: 1, dur: '0:05', prompt: 'Calda escorrendo em pilha de panquecas, câmera lenta, vapor subindo', model: 'Hailuo 2' },
  { src: mFoxWarrior, cat: 'personagens', ar: 0.747, dur: '0:08', prompt: 'Raposa guerreira desembainhando espada, folhas voando, épico', model: 'Kling 3.0' },
  { src: mForest, cat: 'natureza', ar: 1.34, dur: '0:08', prompt: 'Raios de sol atravessando floresta com névoa, câmera avançando', model: 'Luma Ray 3' },
  { src: mSunglasses, cat: 'pessoas', ar: 0.747, dur: '0:05', prompt: 'Homem caminhando na rua em golden hour, câmera acompanhando', model: "Runway's Gen-4" },
  { src: mRobot, cat: 'produtos', ar: 1, dur: '0:06', prompt: 'Robô doméstico acenando, estúdio clean, iluminação suave', model: 'Wan 2.5' },
  { src: mPoke, cat: 'gastronomia', ar: 1, dur: '0:05', prompt: 'Mãos montando poke bowl, vista de cima, ritmo dinâmico', model: 'Seedance 2.5' },
  { src: mEditorial, cat: 'cinematico', ar: 0.747, dur: '0:08', prompt: 'Editorial de moda em câmera lenta, tecido esvoaçando, luz dura', model: 'Sora 2' },
  { src: mMonster, cat: 'personagens', ar: 0.747, dur: '0:05', prompt: 'Monstrinho de pelúcia pulando de alegria, estilo animação 3D', model: 'Vidu Q2' },
  { src: mInterior, cat: 'cinematico', ar: 1.34, dur: '0:10', prompt: 'Câmera atravessando sala minimalista, luz da tarde entrando', model: 'Luma Ray 3' },
  { src: mCurly, cat: 'pessoas', ar: 0.747, dur: '0:05', prompt: 'Mulher de cabelo cacheado rindo, fundo desfocado, câmera na mão', model: 'Hailuo 2' },
  { src: mGradient, cat: 'cinematico', ar: 1, dur: '0:06', prompt: 'Formas líquidas em degradê se misturando, loop hipnótico', model: 'PixVerse 5' },
]

/* gerações anteriores do usuário (capas) e o resultado de uma geração nova */
export const VIDEO_HISTORY_SEED = [
  { prompt: 'Comercial do tênis novo: produto girando com luz de estúdio', model: 'Seedance 2.5', srcs: [mSneaker, mRobot, mSneaker, mRobot] },
  { prompt: 'Teaser da campanha de verão: praia, sol e câmera lenta', model: 'Veo 3.1', srcs: [mDesert, mLake, mForest, mDesert] },
  { prompt: 'Personagem da marca acenando para a câmera, estilo 3D', model: 'Kling 3.0', srcs: [mFox, mRobotPet, mMonster, mFoxWarrior] },
  { prompt: 'Receita rápida em 10 segundos: panquecas com calda', model: 'Hailuo 2', srcs: [mPancakes, mPoke, mPancakes, mPoke] },
  { prompt: 'Depoimento de cliente em close, luz natural', model: 'Sora 2', srcs: [mCraftsman, mFreckles, mCurly, mSunglasses] },
]
export const VIDEO_RESULTS = [mCyber, mEditorial, mInterior, mGradient]
