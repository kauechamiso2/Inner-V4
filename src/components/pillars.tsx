import type { ReactNode } from 'react'
import {
  AgendadoIcon,
  AssistentesIcon,
  BooksIcon,
  FileTextIcon,
  FolderSimpleIcon,
  GlobeIcon,
  HomeNavIcon,
  ImageIcon,
  PresentationChartIcon,
  PromptsPillarIcon,
  SlidesIcon,
  SpeakerHighIcon,
  VideoCameraIcon,
} from './SidebarIcons'

/* Pilares com fluxo de geração prototipado (Sites/Prompts/Assistentes/Projetos
   ficam de fora — abrem página placeholder, sem painel de histórico) */
export type GenPillarId = Exclude<
  PillarId,
  'sites' | 'prompts' | 'assistentes' | 'projetos'
>

export const isGenPillar = (id: PillarId): id is GenPillarId =>
  id !== 'sites' && id !== 'prompts' && id !== 'assistentes' && id !== 'projetos'

/* Views navegáveis da aplicação */
export type AppView =
  | 'chat'
  | 'library'
  | 'tarefas'
  | 'sites'
  | 'prompts'
  | 'assistentes'
  | 'projetos'
  | GenPillarId

/* Views que abrem o painel de histórico (chat + pilares de geração) */
export type PanelView = 'chat' | GenPillarId

/* Cor de cada pilar (reunioes/apresentacoes: tons escolhidos como placeholder) */
export const PILLAR_COLORS: Record<PanelView, string> = {
  chat: '#6E62E5',
  imagens: '#F36430',
  videos: '#E91E63',
  audio: '#8B5CF6',
  reunioes: '#1E40AF',
  documentos: '#4285F4',
  apresentacoes: '#E0A82E',
}

/* Pilares fixos: sempre presentes na sidebar, não entram na personalização */
export type FixedPillar = {
  id: AppView
  label: string
  icon: ReactNode
  narrowIcon?: boolean
}

export const FIXED_PILLARS: FixedPillar[] = [
  { id: 'chat', label: 'Home', icon: <HomeNavIcon /> },
  { id: 'library', label: 'Biblioteca', icon: <BooksIcon /> },
  { id: 'tarefas', label: 'Tarefas', icon: <AgendadoIcon /> },
]

/* Pilares personalizáveis: podem ser fixados e reordenados pelo menu */
export type PillarId =
  | 'imagens'
  | 'videos'
  | 'audio'
  | 'reunioes'
  | 'documentos'
  | 'apresentacoes'
  | 'sites'
  | 'prompts'
  | 'assistentes'
  | 'projetos'

export type PillarDef = {
  id: PillarId
  label: string
  /* ícone para a sidebar (18px) */
  icon: ReactNode
  /* ícone para o menu (17px) */
  menuIcon: ReactNode
  narrowIcon?: boolean
}

export const PILLAR_DEFS: PillarDef[] = [
  {
    id: 'imagens',
    label: 'Imagens',
    icon: <ImageIcon />,
    menuIcon: <ImageIcon />,
  },
  {
    id: 'videos',
    label: 'Vídeos',
    icon: <VideoCameraIcon size={18} />,
    menuIcon: <VideoCameraIcon />,
  },
  {
    id: 'audio',
    label: 'Áudio',
    icon: <SpeakerHighIcon size={18} />,
    menuIcon: <SpeakerHighIcon />,
  },
  {
    id: 'reunioes',
    label: 'Reuniões',
    icon: <PresentationChartIcon size={18} />,
    menuIcon: <PresentationChartIcon />,
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: <FileTextIcon size={18} />,
    menuIcon: <FileTextIcon />,
  },
  {
    id: 'apresentacoes',
    label: 'Apresentações',
    icon: <SlidesIcon size={18} />,
    menuIcon: <SlidesIcon />,
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: <GlobeIcon size={18} />,
    menuIcon: <GlobeIcon />,
  },
  {
    id: 'assistentes',
    label: 'Assistentes',
    icon: <AssistentesIcon />,
    menuIcon: <AssistentesIcon size={17} />,
  },
  {
    id: 'prompts',
    label: 'Prompts',
    icon: <PromptsPillarIcon />,
    menuIcon: <PromptsPillarIcon size={17} />,
  },
  {
    id: 'projetos',
    label: 'Projetos',
    icon: <FolderSimpleIcon />,
    menuIcon: <FolderSimpleIcon />,
  },
]

export const PILLAR_BY_ID = Object.fromEntries(PILLAR_DEFS.map((p) => [p.id, p])) as Record<
  PillarId,
  PillarDef
>

export const DEFAULT_PINNED: PillarId[] = ['assistentes', 'prompts', 'sites', 'projetos']

/* ============ Diagramações da sidebar ============ */

export type SidebarLayout = 'a' | 'b' | 'c' | 'd' | 'e'

/* Módulos: tudo que pode aparecer na área personalizável (na Diagramação B,
   Library e Tarefas também entram no jogo de fixar/arrastar) */
export type ModuleId = 'library' | 'tarefas' | PillarId

/* Todos os módulos têm navegação prototipada (Sites incluído) */
export type NavModuleId = ModuleId

export const isNavModule = (_id: ModuleId): _id is NavModuleId => true

export type ModuleDef = {
  id: ModuleId
  label: string
  icon: ReactNode
  menuIcon: ReactNode
  narrowIcon?: boolean
}

export const MODULE_DEFS: ModuleDef[] = [
  { id: 'library', label: 'Biblioteca', icon: <BooksIcon />, menuIcon: <BooksIcon /> },
  {
    id: 'tarefas',
    label: 'Tarefas',
    icon: <AgendadoIcon />,
    menuIcon: <AgendadoIcon size={17} />,
  },
  ...PILLAR_DEFS,
]

export const MODULE_BY_ID = Object.fromEntries(MODULE_DEFS.map((m) => [m.id, m])) as Record<
  ModuleId,
  ModuleDef
>

/* Pool da diagramação A/C: Home e Biblioteca ficam fixos; o resto reordena */
export const DEFAULT_PINNED_B: ModuleId[] = ['tarefas', ...DEFAULT_PINNED]
