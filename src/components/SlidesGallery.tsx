import ToolGallery from './ToolGallery'
import type { GalleryTool } from './ToolGallery'
import { SlidesIcon } from './SidebarIcons'
import { PILLAR_COLORS } from './pillars'
import { SLIDE_FLOWS, SLIDE_MODELS, SLIDE_TEMPLATES } from './slideFlows'
import type { SlidesResult } from './SlidesModal'

/* Pilar de Apresentações: "Ferramentas de Slides" (cards com o ícone de
   Apresentações) + flows */

const CATEGORIES = ['Todos', 'Popular', 'Gestão', 'Vendas', 'Arquitetos', 'Advogados', 'Recursos Humanos']

const GALLERY: GalleryTool[] = SLIDE_TEMPLATES.map((t) => ({
  id: t.id,
  title: t.title,
  desc: t.desc,
  cats: t.cats,
  tag: t.tag,
  icon: <SlidesIcon size={20} color="currentColor" />,
}))

export default function SlidesGallery(props: {
  newKey?: number
  onFlowChange?: (open: boolean) => void
  onOpenSlides?: (r: SlidesResult) => void
  regen?: { tool: string; prompt: string; key: number } | null
}) {
  return (
    <ToolGallery
      title="Ferramentas de Slides"
      categories={CATEGORIES}
      items={GALLERY}
      flows={SLIDE_FLOWS}
      models={SLIDE_MODELS}
      defaultModel="claude-sonnet"
      newTool="slides"
      iconColor={PILLAR_COLORS.apresentacoes}
      {...props}
    />
  )
}
