import archRender from '../assets/masonry/interior-minimal.webp'
import ToolGallery from './ToolGallery'
import type { GalleryTool } from './ToolGallery'
import { VIDEO_AUTO_MODEL, VIDEO_MODELS, VIDEO_TOOLS } from './videoGen'
import { VIDEO_FLOWS } from './videoFlows'

/* Pilar de Vídeos (v2): galeria de ferramentas (cards) com busca e filtros;
   o histórico de gerações fica no painel lateral. Abrir um card leva para o
   flow da ferramenta (design system); fechar volta para a galeria. */

const CATEGORIES = ['Todos', 'Popular', 'Arquitetos', 'Criação de Conteúdo', 'Vendas', 'RH']

const byId = Object.fromEntries(VIDEO_TOOLS.map((t) => [t.id, t]))
const GALLERY: GalleryTool[] = [
  { ...byId['video-generation'], title: 'Geração de Vídeos', desc: 'Transforme prompts de texto em vídeos de alta qualidade com rapidez e criatividade.', cats: ['Popular', 'Criação de Conteúdo'] },
  {
    id: 'arch-render',
    title: 'Vídeo de Render Arquitetônico',
    desc: 'Transforme seu render arquitetônico em um vídeo curto com movimento e som. Ideal para destacar o ambiente.',
    art: archRender,
    photo: true,
    tag: 'Arquitetos',
    cats: ['Arquitetos'],
  },
  { ...byId['video-from-image'], title: 'Gerar Vídeo com Base em Imagem', desc: 'Gere vídeos com base em uma imagem existente, adaptando estilos e detalhes.', cats: ['Popular', 'Criação de Conteúdo', 'Vendas'] },
  { ...byId.avatar, desc: 'Crie um avatar digital que fala e se move de forma realista em vídeos.', cats: ['Popular', 'Vendas', 'RH'] },
  { ...byId.transcribe, desc: 'Transcreva vídeos, gere legendas, peça detalhes específicos ou exporte um resumo.', cats: ['Criação de Conteúdo', 'RH'] },
  { ...byId['viral-cuts'], cats: ['Popular', 'Criação de Conteúdo'] },
] as GalleryTool[]

export default function VideosGallery(props: {
  newKey?: number
  regen?: { tool: string; prompt: string; key: number } | null
  onFlowChange?: (open: boolean) => void
}) {
  return (
    <ToolGallery
      title="Ferramentas de Vídeo"
      categories={CATEGORIES}
      items={GALLERY}
      flows={VIDEO_FLOWS}
      models={VIDEO_MODELS}
      defaultModel="kling-30"
      autoName={VIDEO_AUTO_MODEL}
      newTool="video-generation"
      {...props}
    />
  )
}
