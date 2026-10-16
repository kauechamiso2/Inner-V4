import { FileTextIcon } from './SidebarIcons'
import { PILLAR_COLORS } from './pillars'
import ToolGallery from './ToolGallery'
import type { GalleryTool } from './ToolGallery'
import type { DocResult } from './DocModal'
import { DOC_FLOWS, DOC_MODELS, DOC_TEMPLATES } from './docFlows'

/* Pilar de Documentos: "Templates de Texto" (cards com ícone azul) + flows */

const CATEGORIES = [
  'Todos',
  'Popular',
  'Marketing',
  'Acadêmico',
  'Criação de Conteúdo',
  'Vendas',
  'Arquitetos',
  'Recursos Humanos',
  'Gestão',
  'Advogados',
]

const GALLERY: GalleryTool[] = DOC_TEMPLATES.map((t) => ({
  id: t.id,
  title: t.title,
  desc: t.desc,
  cats: t.cats,
  tag: t.tag,
  icon: <FileTextIcon size={20} color="currentColor" />,
}))

export default function DocsGallery(props: {
  newKey?: number
  onFlowChange?: (open: boolean) => void
  onOpenDoc?: (doc: DocResult) => void
  regen?: { tool: string; prompt: string; key: number } | null
}) {
  return (
    <ToolGallery
      title="Templates de Texto"
      categories={CATEGORIES}
      items={GALLERY}
      flows={DOC_FLOWS}
      models={DOC_MODELS}
      defaultModel="claude-sonnet"
      newTool="blog"
      iconColor={PILLAR_COLORS.documentos}
      {...props}
    />
  )
}
