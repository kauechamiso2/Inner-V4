/* Conteúdo de demonstração por projeto: conversas (fixadas/recentes) e os
   arquivos do Contexto. Mantém cada projeto com um tema coerente. */
import type { DetailFile, Section } from './ContextFileList'

export type ProjChat = { id: string; title: string; date: string }

export type ProjectContent = {
  pinned: ProjChat[]
  recents: ProjChat[]
  contextSections: Section[]
  contextLoose: DetailFile[]
  contextPct: number
}

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/120/120`

const HR_STUFF: ProjectContent = {
  pinned: [{ id: 'hp1', title: 'Política de trabalho remoto 2026', date: '12 set' }],
  recents: [
    { id: 'hr1', title: 'Revisão do manual do funcionário', date: '3 out' },
    { id: 'hr2', title: 'Dúvidas sobre férias e banco de horas', date: '1 out' },
    { id: 'hr3', title: 'Rascunho da vaga de Product Designer', date: '29 set' },
    { id: 'hr4', title: 'Resumo da política de benefícios', date: '27 set' },
    { id: 'hr5', title: 'Checklist de onboarding de novos', date: '24 set' },
    { id: 'hr6', title: 'Comparativo de planos de saúde', date: '20 set' },
  ],
  contextSections: [
    {
      id: 's-docs',
      title: 'Documentação de Funcionários',
      color: '#8A8F98',
      files: [
        { id: 'f1', name: 'Manual do Funcionário.pdf', type: 'pdf' },
        { id: 'f2', name: 'Guia de Integração.pdf', type: 'pdf' },
        { id: 'f3', name: 'Política de Férias e Ponto.pdf', type: 'pdf' },
        { id: 'f4', name: 'Código de Conduta.pdf', type: 'pdf' },
        { id: 'f5', name: 'Diretrizes de Trabalho Remoto.pdf', type: 'pdf' },
        { id: 'f6', name: 'Política de Viagens e Despesas.docx', type: 'docx' },
        { id: 'f7', name: 'Checklist de Segurança de TI.pdf', type: 'pdf' },
      ],
    },
    {
      id: 's-hiring',
      title: 'Recrutamento e Contratação',
      color: '#3E63C4',
      files: [
        { id: 'f8', name: 'Descrição de Vaga — Product Designer.docx', type: 'docx' },
        { id: 'f9', name: 'Ficha de Entrevista.xlsx', type: 'xlsx' },
        { id: 'f10', name: 'Modelo de Carta de Oferta.docx', type: 'docx' },
        { id: 'f11', name: 'Página de Carreiras', type: 'url' },
        { id: 'f12', name: 'Pipeline de Contratação Q1.xlsx', type: 'xlsx' },
      ],
    },
    {
      id: 's-payroll',
      title: 'Folha e Benefícios',
      color: '#1F7A4D',
      files: [
        { id: 'f13', name: 'Calendário de Folha 2026.xlsx', type: 'xlsx' },
        { id: 'f14', name: 'Guia de Previdência Privada.pdf', type: 'pdf' },
        { id: 'f15', name: 'Comparativo de Planos de Saúde.xlsx', type: 'xlsx' },
        { id: 'f16', name: 'Faixas Salariais.pptx', type: 'pptx' },
        { id: 'f17', name: 'Visão Geral de Benefícios 2026.pdf', type: 'pdf' },
      ],
    },
  ],
  contextLoose: [
    { id: 'l1', name: 'Organograma 2026.png', type: 'png', thumb: thumb('orgchart') },
    { id: 'l2', name: 'Notas da última 1:1', type: 'nota' },
    { id: 'l3', name: 'Wiki de RH (Notion)', type: 'url' },
  ],
  contextPct: 42,
}

const MARKETING: ProjectContent = {
  pinned: [{ id: 'mp1', title: 'Pilares de conteúdo 2026', date: '15 set' }],
  recents: [
    { id: 'm1', title: 'Calendário editorial de outubro', date: '2 out' },
    { id: 'm2', title: 'Legendas do lançamento da coleção', date: '1 out' },
    { id: 'm3', title: 'Roteiro de Reels — bastidores do ensaio', date: '30 set' },
    { id: 'm4', title: 'Ideias de carrossel educativo', date: '29 set' },
    { id: 'm5', title: 'Briefing do ensaio de produto', date: '26 set' },
    { id: 'm6', title: 'Plano de mídia paga Q4', date: '24 set' },
    { id: 'm7', title: 'Copy do e-mail de Black Friday', date: '20 set' },
  ],
  contextSections: [
    {
      id: 'm-estrategia',
      title: 'Estratégia e Planejamento',
      color: '#3E63C4',
      files: [
        { id: 'me1', name: 'Calendário Editorial 2026.xlsx', type: 'xlsx' },
        { id: 'me2', name: 'Plano de Conteúdo Q4.pdf', type: 'pdf' },
        { id: 'me3', name: 'Pilares de Conteúdo.pdf', type: 'pdf' },
        { id: 'me4', name: 'Personas e Público-Alvo.docx', type: 'docx' },
        { id: 'me5', name: 'Metas de Engajamento.xlsx', type: 'xlsx' },
      ],
    },
    {
      id: 'm-criativos',
      title: 'Criativos e Design',
      color: '#C15A2B',
      files: [
        { id: 'mc1', name: 'Guia de Identidade Visual.pdf', type: 'pdf' },
        { id: 'mc2', name: 'Templates de Post.pptx', type: 'pptx' },
        { id: 'mc3', name: 'Tom de Voz da Marca.docx', type: 'docx' },
        { id: 'mc4', name: 'Banco de Imagens.png', type: 'png', thumb: thumb('mktimgs') },
      ],
    },
    {
      id: 'm-campanhas',
      title: 'Campanhas',
      color: '#1F7A4D',
      files: [
        { id: 'mk1', name: 'Briefing Black Friday.docx', type: 'docx' },
        { id: 'mk2', name: 'Plano de Mídia Paga.xlsx', type: 'xlsx' },
        { id: 'mk3', name: 'Resultados Campanha de Verão.pdf', type: 'pdf' },
      ],
    },
  ],
  contextLoose: [
    { id: 'ml1', name: 'Roteiro de Reels.docx', type: 'docx' },
    { id: 'ml2', name: 'Moodboard do Lançamento.png', type: 'png', thumb: thumb('mktmood') },
    { id: 'ml3', name: 'Notas do kickoff', type: 'nota' },
    { id: 'ml4', name: 'Wiki de Marketing (Notion)', type: 'url' },
  ],
  contextPct: 57,
}

export const PROJECT_CONTENT: Record<string, ProjectContent> = {
  'col-hr': HR_STUFF,
  'col-mkt': MARKETING,
}

export const DEFAULT_PROJECT_CONTENT = MARKETING
