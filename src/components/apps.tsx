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

export type AppTool = {
  id: string
  label: string
  icon: ReactNode
  /* quando definido, o app navega para essa view; os novos ficam sem ação */
  view?: AppView
}

const lu = (Icon: typeof PenLine) => <Icon size={22} strokeWidth={1.7} />

/* Apps da galeria "Mais Apps": os pilares existentes (com ação) + uma lista
   extensa de apps novos (sem ação por hora). Iconografia escolhida à mão. */
export const APPS: AppTool[] = [
  /* pilares existentes — navegam */
  { id: 'imagens', label: 'Imagens', icon: <ImageIcon />, view: 'imagens' },
  { id: 'videos', label: 'Vídeos', icon: <VideoCameraIcon size={18} />, view: 'videos' },
  { id: 'audio', label: 'Áudio', icon: <SpeakerHighIcon size={18} />, view: 'audio' },
  { id: 'reunioes', label: 'Reuniões', icon: <PresentationChartIcon size={18} />, view: 'reunioes' },
  { id: 'documentos', label: 'Documentos', icon: <FileTextIcon size={18} />, view: 'documentos' },
  { id: 'apresentacoes', label: 'Apresentações', icon: <SlidesIcon size={18} />, view: 'apresentacoes' },
  { id: 'sites', label: 'Sites', icon: <GlobeIcon size={18} />, view: 'sites' },
  { id: 'prompts', label: 'Prompts', icon: <PromptsPillarIcon />, view: 'prompts' },

  /* apps novos — sem ação por hora */
  { id: 'escrever', label: 'Escrever', icon: lu(PenLine) },
  { id: 'gramatica', label: 'Verificador de Gramática', icon: lu(SpellCheck) },
  { id: 'traduzir', label: 'Traduzir', icon: lu(Languages) },
  { id: 'detector-ia', label: 'Detector de IA', icon: lu(ScanSearch) },
  { id: 'chatpdf', label: 'ChatPDF', icon: lu(FileSearch) },
  { id: 'mapa-mental', label: 'Mapa Mental', icon: lu(Network) },
  { id: 'pesquisa', label: 'Pesquisa', icon: lu(Search) },
  { id: 'bots', label: 'Bots', icon: lu(Bot) },
  { id: 'ler', label: 'Ler', icon: lu(BookOpen) },
  { id: 'memorando', label: 'Memorando', icon: lu(Bookmark) },
  { id: 'humanizador', label: 'Humanizador', icon: lu(Sparkles) },
  { id: 'podcast', label: 'Podcast', icon: lu(Podcast) },
  { id: 'formulario', label: 'Formulário', icon: lu(ClipboardList) },
  { id: 'redator-email', label: 'Redator de E-mail', icon: lu(Mail) },
  { id: 'carreira', label: 'Carreira Pro', icon: lu(Briefcase) },
  { id: 'resumo', label: 'Resumo Fácil', icon: lu(AlignLeft) },
  { id: 'editor-texto', label: 'Editor de Texto', icon: lu(FilePen) },
  { id: 'consultor', label: 'Consultor Financeiro', icon: lu(CircleDollarSign) },
  { id: 'criador-post', label: 'Criador de Post', icon: lu(Megaphone) },
  { id: 'respondedor', label: 'Respondedor', icon: lu(MessagesSquare) },
  { id: 'conteudo', label: 'Criador de Conteúdo', icon: lu(Clapperboard) },
  { id: 'guru-amor', label: 'Guru do Amor', icon: lu(HeartHandshake) },
  { id: 'astrologo', label: 'Astrólogo', icon: lu(MoonStar) },
  { id: 'simulador', label: 'Simulador de Entrevista', icon: lu(UserRoundCheck) },
  { id: 'bem-estar', label: 'Bem-Estar', icon: lu(HeartPulse) },
  { id: 'dieta', label: 'Plano de Dieta', icon: lu(Salad) },
  { id: 'viagem', label: 'Amigo de Viagem', icon: lu(Plane) },
  { id: 'motivador', label: 'Motivador', icon: lu(Flame) },
]

export const APP_BY_ID = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<string, AppTool>
