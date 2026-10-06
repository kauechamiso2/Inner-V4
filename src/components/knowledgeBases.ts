import type { DetailFile, Section } from './ContextFileList'

/* Bases de conhecimento de exemplo (estrutura igual ao Contexto de um projeto:
   seções com arquivos + arquivos soltos). Exemplo fora de HR/Marketing. */
export type KnowledgeBase = {
  id: string
  name: string
  description: string
  createdAt: string
  emoji: string
  color: string
  sections: Section[]
  loose: DetailFile[]
}

export const KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: 'kb-suporte',
    name: 'Suporte ao Cliente',
    description: 'Artigos, políticas e FAQs que o time de atendimento usa como conhecimento',
    createdAt: 'Criada em 2 out',
    emoji: '🎧',
    color: '#0E7490',
    sections: [
      {
        id: 's-politicas',
        title: 'Políticas de atendimento',
        color: '#0E7490',
        files: [
          { id: 'kb-f1', name: 'Política de reembolso', type: 'pdf' },
          { id: 'kb-f2', name: 'SLA de atendimento', type: 'docx' },
          { id: 'kb-f3', name: 'Tom de voz do suporte', type: 'docx' },
          { id: 'kb-f4', name: 'Fluxo de escalonamento', type: 'docx' },
        ],
      },
      {
        id: 's-produtos',
        title: 'Produtos & Planos',
        color: '#6E62E5',
        files: [
          { id: 'kb-f5', name: 'Comparativo de planos', type: 'xlsx' },
          { id: 'kb-f6', name: 'Guia de funcionalidades', type: 'pdf' },
          { id: 'kb-f7', name: 'Limites por plano', type: 'docx' },
        ],
      },
      {
        id: 's-faq',
        title: 'Perguntas frequentes',
        color: '#1F9D6B',
        files: [
          { id: 'kb-f8', name: 'FAQ — pagamentos e cobrança', type: 'docx' },
          { id: 'kb-f9', name: 'FAQ — conta e acesso', type: 'docx' },
          { id: 'kb-f10', name: 'FAQ — integrações', type: 'docx' },
        ],
      },
    ],
    loose: [
      { id: 'kb-l1', name: 'Macros de resposta', type: 'docx' },
      { id: 'kb-l2', name: 'Base de erros conhecidos', type: 'xlsx' },
      { id: 'kb-l3', name: 'Central de ajuda (ajuda.inner.ai)', type: 'url' },
    ],
  },
]
