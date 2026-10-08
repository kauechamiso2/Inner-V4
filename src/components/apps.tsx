import type { ReactNode } from 'react'
import {
  AlignLeft,
  Bookmark,
  BookOpen,
  Bot,
  Briefcase,
  CircleDollarSign,
  Clapperboard,
  ClipboardList,
  FilePen,
  FileSearch,
  Flame,
  HeartHandshake,
  HeartPulse,
  Languages,
  Mail,
  Megaphone,
  MessagesSquare,
  MoonStar,
  Network,
  PenLine,
  Plane,
  Podcast,
  Salad,
  ScanSearch,
  Search,
  Sparkles,
  SpellCheck,
  UserRoundCheck,
} from 'lucide-react'
import {
  ChatDotsIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  PresentationChartIcon,
  PromptsPillarIcon,
  SlidesIcon,
  SpeakerHighIcon,
  VideoCameraIcon,
} from './SidebarIcons'
import type { AppView } from './pillars'

/* motions aplicados no hover de cada ícone (um por caso) */
export type AppAnim =
  | 'pop'
  | 'bob'
  | 'spin'
  | 'wiggle'
  | 'swing'
  | 'beat'
  | 'fly'
  | 'nudge'
  | 'flicker'
  | 'ring'
  | 'rise'

export type AppTool = {
  id: string
  label: string
  /* rótulo curto quando fixado no rail (ex.: "Chat" em vez de "Chat com Modelos") */
  shortLabel?: string
  icon: ReactNode
  anim: AppAnim
  /* quando definido, o app navega para essa view; os novos ficam sem ação */
  view?: AppView
  /* ação especial (ex.: 'chat' abre o modo chat em vez de navegar por view) */
  action?: 'chat'
}

const lu = (Icon: typeof PenLine) => <Icon size={22} strokeWidth={1.7} />

/* Apps da galeria "Mais Apps": os pilares existentes (com ação) + uma lista
   extensa de apps novos (sem ação por hora). Iconografia e motion por caso. */
export const APPS: AppTool[] = [
  /* pilares existentes — navegam */
  { id: 'imagens', label: 'Imagens', icon: <ImageIcon />, anim: 'pop', view: 'imagens' },
  { id: 'videos', label: 'Vídeos', icon: <VideoCameraIcon />, anim: 'nudge', view: 'videos' },
  { id: 'audio', label: 'Áudio', icon: <SpeakerHighIcon />, anim: 'beat', view: 'audio' },
  { id: 'reunioes', label: 'Reuniões', icon: <PresentationChartIcon />, anim: 'rise', view: 'reunioes' },
  { id: 'documentos', label: 'Documentos', icon: <FileTextIcon />, anim: 'bob', view: 'documentos' },
  { id: 'apresentacoes', label: 'Apresentações', icon: <SlidesIcon />, anim: 'rise', view: 'apresentacoes' },
  { id: 'sites', label: 'Sites', icon: <GlobeIcon />, anim: 'spin', view: 'sites' },
  { id: 'prompts', label: 'Prompts', icon: <PromptsPillarIcon />, anim: 'pop', view: 'prompts' },

  /* apps novos — sem ação por hora */
  { id: 'escrever', label: 'Escrever', icon: lu(PenLine), anim: 'nudge' },
  { id: 'gramatica', label: 'Verificador de Gramática', icon: lu(SpellCheck), anim: 'pop' },
  { id: 'traduzir', label: 'Traduzir', icon: lu(Languages), anim: 'nudge' },
  { id: 'detector-ia', label: 'Detector de IA', icon: lu(ScanSearch), anim: 'spin' },
  { id: 'chatpdf', label: 'ChatPDF', icon: lu(FileSearch), anim: 'bob' },
  { id: 'mapa-mental', label: 'Mapa Mental', icon: lu(Network), anim: 'rise' },
  { id: 'pesquisa', label: 'Pesquisa', icon: lu(Search), anim: 'wiggle' },
  { id: 'bots', label: 'Bots', icon: lu(Bot), anim: 'wiggle' },
  { id: 'ler', label: 'Ler', icon: lu(BookOpen), anim: 'swing' },
  { id: 'memorando', label: 'Memorando', icon: lu(Bookmark), anim: 'swing' },
  { id: 'humanizador', label: 'Humanizador', icon: lu(Sparkles), anim: 'flicker' },
  { id: 'podcast', label: 'Podcast', icon: lu(Podcast), anim: 'ring' },
  { id: 'formulario', label: 'Formulário', icon: lu(ClipboardList), anim: 'bob' },
  { id: 'redator-email', label: 'Redator de E-mail', icon: lu(Mail), anim: 'ring' },
  { id: 'carreira', label: 'Carreira Pro', icon: lu(Briefcase), anim: 'swing' },
  { id: 'resumo', label: 'Resumo Fácil', icon: lu(AlignLeft), anim: 'nudge' },
  { id: 'editor-texto', label: 'Editor de Texto', icon: lu(FilePen), anim: 'nudge' },
  { id: 'consultor', label: 'Consultor Financeiro', icon: lu(CircleDollarSign), anim: 'spin' },
  { id: 'criador-post', label: 'Criador de Post', icon: lu(Megaphone), anim: 'ring' },
  { id: 'respondedor', label: 'Respondedor', icon: lu(MessagesSquare), anim: 'wiggle' },
  { id: 'conteudo', label: 'Criador de Conteúdo', icon: lu(Clapperboard), anim: 'pop' },
  { id: 'guru-amor', label: 'Guru do Amor', icon: lu(HeartHandshake), anim: 'beat' },
  { id: 'astrologo', label: 'Astrólogo', icon: lu(MoonStar), anim: 'flicker' },
  { id: 'simulador', label: 'Simulador de Entrevista', icon: lu(UserRoundCheck), anim: 'bob' },
  { id: 'bem-estar', label: 'Bem-Estar', icon: lu(HeartPulse), anim: 'beat' },
  { id: 'dieta', label: 'Plano de Dieta', icon: lu(Salad), anim: 'bob' },
  { id: 'viagem', label: 'Amigo de Viagem', icon: lu(Plane), anim: 'fly' },
  { id: 'motivador', label: 'Motivador', icon: lu(Flame), anim: 'flicker' },
]

/* Entrada "Chat" — vive dentro do Mais Apps (por último) e é fixável no rail.
   Na galeria aparece como "Chat com Modelos"; fixado no rail, vira só "Chat". */
export const CHAT_APP: AppTool = {
  id: 'chat',
  label: 'Chat com Modelos',
  shortLabel: 'Chat',
  icon: <ChatDotsIcon size={22} />,
  anim: 'wiggle',
  action: 'chat',
}

/* inclui o Chat para que fixar/resolver pelo id funcione no rail e na galeria */
export const APP_BY_ID = Object.fromEntries(
  [...APPS, CHAT_APP].map((a) => [a.id, a]),
) as Record<string, AppTool>

/* Lista completa do Mais Apps (todos os apps + Chat por último). */
export const FULL_APPS: AppTool[] = [...APPS, CHAT_APP]

/* Variação reduzida (versão "Padrão"): os 8 pilares + Chat por último,
   sem os "apps novos". */
const REDUCED_PILLAR_IDS = [
  'imagens',
  'videos',
  'audio',
  'reunioes',
  'documentos',
  'apresentacoes',
  'sites',
  'prompts',
]
export const REDUCED_APPS: AppTool[] = [
  ...REDUCED_PILLAR_IDS.map((id) => APP_BY_ID[id]).filter(Boolean),
  CHAT_APP,
]
