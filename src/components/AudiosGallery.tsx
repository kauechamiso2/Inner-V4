import { SpeakerHighIcon } from './SidebarIcons'
import { PILLAR_COLORS } from './pillars'
import ToolGallery from './ToolGallery'
import type { GalleryTool } from './ToolGallery'
import { AUDIO_FLOWS, AUDIO_MODELS } from './audioFlows'
import type { AudioResultItem } from './AudioModal'

/* Pilar de Áudio: galeria de ferramentas (cards com o ícone e a cor do
   histórico do pilar) + flows */

const CATEGORIES = ['Todos', 'Popular', 'Criação de Conteúdo']

const GALLERY: GalleryTool[] = [
  {
    id: 'voice',
    title: 'Voz Digital',
    desc: 'Crie narrações de áudio sintéticas a partir de texto, trazendo seu conteúdo escrito à vida com som natural.',
    icon: <SpeakerHighIcon size={20} color="currentColor" />,
    cats: ['Popular', 'Criação de Conteúdo'],
  },
  {
    id: 'transcribe',
    title: 'Transcrever Áudio',
    desc: 'Transcreva arquivos de áudio. A partir daí, inicie uma conversa, gere legendas, peça detalhes específicos ou exporte um resumo.',
    icon: <SpeakerHighIcon size={20} color="currentColor" />,
    cats: ['Popular'],
  },
  {
    id: 'music',
    title: 'Geração de Música',
    desc: 'Gere músicas originais com base na sua descrição, perfeitas para vídeos, jogos ou projetos criativos.',
    icon: <SpeakerHighIcon size={20} color="currentColor" />,
    cats: ['Popular', 'Criação de Conteúdo'],
  },
  {
    id: 'sfx',
    title: 'Efeito Sonoro',
    desc: 'Crie e personalize efeitos sonoros a partir de prompts de texto, ideal para jogos, vídeos e projetos criativos.',
    icon: <SpeakerHighIcon size={20} color="currentColor" />,
    cats: ['Criação de Conteúdo'],
  },
]

export default function AudiosGallery(props: {
  newKey?: number
  onFlowChange?: (open: boolean) => void
  onOpenAudio?: (a: AudioResultItem) => void
  regen?: { tool: string; prompt: string; key: number } | null
}) {
  return (
    <ToolGallery
      title="Ferramentas de Áudio"
      categories={CATEGORIES}
      items={GALLERY}
      flows={AUDIO_FLOWS}
      models={AUDIO_MODELS}
      defaultModel="elevenlabs"
      newTool="voice"
      iconColor={PILLAR_COLORS.audio}
      {...props}
    />
  )
}
