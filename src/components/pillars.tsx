import type { ReactNode } from 'react'
import {
  BooksIcon,
  ChatTeardropIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LightningIcon,
  PresentationChartIcon,
  SpeakerHighIcon,
  VideoCameraIcon,
} from './SidebarIcons'

/* Pilares com fluxo de geração prototipado (Sites fica de fora por enquanto) */
export type GenPillarId = Exclude<PillarId, 'sites'>

export const isGenPillar = (id: PillarId): id is GenPillarId => id !== 'sites'

/* Views navegáveis da aplicação */
export type AppView = 'chat' | 'library' | 'tarefas' | GenPillarId

/* Views que abrem o painel de histórico (chat + pilares de geração) */
export type PanelView = 'chat' | GenPillarId

/* Cor de cada pilar (reunioes: tom escolhido como placeholder) */
export const PILLAR_COLORS: Record<PanelView, string> = {
  chat: '#6E62E5',
  imagens: '#F36430',
  videos: '#E91E63',
  audio: '#8B5CF6',
  reunioes: '#1E40AF',
  documentos: '#4285F4',
}

/* Pilares fixos: sempre presentes na sidebar, não entram na personalização */
export type FixedPillar = {
  id: AppView
  label: string
  icon: ReactNode
  narrowIcon?: boolean
}

export const FIXED_PILLARS: FixedPillar[] = [
  { id: 'chat', label: 'Chat', icon: <ChatTeardropIcon /> },
  { id: 'library', label: 'Library', icon: <BooksIcon /> },
  { id: 'tarefas', label: 'Tarefas', icon: <LightningIcon />, narrowIcon: true },
]

/* Pilares personalizáveis: podem ser fixados e reordenados pelo menu */
export type PillarId = 'imagens' | 'videos' | 'audio' | 'reunioes' | 'documentos' | 'sites'

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
    id: 'sites',
    label: 'Sites',
    icon: <GlobeIcon size={18} />,
    menuIcon: <GlobeIcon />,
  },
]

export const PILLAR_BY_ID = Object.fromEntries(PILLAR_DEFS.map((p) => [p.id, p])) as Record<
  PillarId,
  PillarDef
>

export const DEFAULT_PINNED: PillarId[] = ['imagens', 'videos']

/* ============ Diagramações da sidebar ============ */

export type SidebarLayout = 'a' | 'b' | 'c'

/* Módulos: tudo que pode aparecer na área personalizável (na Diagramação B,
   Library e Tarefas também entram no jogo de fixar/arrastar) */
export type ModuleId = 'library' | 'tarefas' | PillarId

/* Módulos com navegação prototipada (Sites fica de fora) */
export type NavModuleId = Exclude<ModuleId, 'sites'>

export const isNavModule = (id: ModuleId): id is NavModuleId => id !== 'sites'

export type ModuleDef = {
  id: ModuleId
  label: string
  icon: ReactNode
  menuIcon: ReactNode
  narrowIcon?: boolean
}

export const MODULE_DEFS: ModuleDef[] = [
  { id: 'library', label: 'Library', icon: <BooksIcon />, menuIcon: <BooksIcon /> },
  {
    id: 'tarefas',
    label: 'Tarefas',
    icon: <LightningIcon />,
    menuIcon: <LightningIcon />,
    narrowIcon: true,
  },
  ...PILLAR_DEFS,
]

export const MODULE_BY_ID = Object.fromEntries(MODULE_DEFS.map((m) => [m.id, m])) as Record<
  ModuleId,
  ModuleDef
>

export const DEFAULT_PINNED_B: ModuleId[] = ['library', 'tarefas', ...DEFAULT_PINNED]
