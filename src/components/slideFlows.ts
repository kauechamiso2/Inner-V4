import type { FlowConfig, FlowField } from './flow/Flow'
import { DOC_MODELS } from './docFlows'
import pInterior from '../assets/masonry/interior-minimal.webp'
import pLake from '../assets/masonry/landscape-lake.webp'
import pForest from '../assets/masonry/landscape-forest.webp'
import pDesert from '../assets/masonry/landscape-desert.webp'
import pCraft from '../assets/masonry/people-craftsman.webp'
import pCurly from '../assets/masonry/people-curly.webp'
import pGradient from '../assets/masonry/colors-gradient.webp'
import pRobot from '../assets/masonry/tech-robot.webp'

/* Pilar de Apresentações: temas, decks de exemplo e flows de cada template. */

export type SlideTheme = {
  id: string
  bg: string
  surface: string
  text: string
  muted: string
  accent: string
  /* fonte dos títulos */
  serif?: boolean
}

export type Slide =
  | { kind: 'cover'; title: string; subtitle: string; img?: string; eyebrow?: string }
  | { kind: 'split'; title: string; text: string; img: string; items?: [string, string, string][] }
  | { kind: 'cards'; title: string; items: [string, string, string][] }
  | { kind: 'stats'; title: string; stats: [string, string][]; note?: string }
  | { kind: 'steps'; title: string; items: [string, string][] }
  | { kind: 'quote'; text: string; by: string }
  | { kind: 'closing'; title: string; subtitle: string }

export type Deck = { theme: SlideTheme; slides: Slide[] }

export const THEMES: Record<string, SlideTheme> = {
  navy: { id: 'navy', bg: '#0f1b3d', surface: 'rgba(255,255,255,0.07)', text: '#ffffff', muted: 'rgba(255,255,255,0.68)', accent: '#60a5fa' },
  lime: { id: 'lime', bg: '#fbfdf4', surface: '#eef7d6', text: '#1c2410', muted: '#5b6650', accent: '#65a30d' },
  chart: { id: 'chart', bg: '#0a1020', surface: 'rgba(34,211,238,0.08)', text: '#f1f5f9', muted: 'rgba(241,245,249,0.62)', accent: '#22d3ee' },
  arch: { id: 'arch', bg: '#f6f2eb', surface: '#ebe3d6', text: '#2b2118', muted: '#6f6152', accent: '#8a6d4b', serif: true },
  violet: { id: 'violet', bg: '#15111f', surface: 'rgba(167,139,250,0.1)', text: '#f5f3ff', muted: 'rgba(245,243,255,0.62)', accent: '#a78bfa' },
  blush: { id: 'blush', bg: '#fff8fd', surface: '#f6d9f3', text: '#2a1630', muted: '#6b5570', accent: '#c026d3', serif: true },
}

export const SLIDE_MODELS = DOC_MODELS

export type SlideTemplate = {
  id: string
  title: string
  desc: string
  cats: string[]
  tag?: string
  deck: Deck
  flow: FlowConfig
}

/* campos comuns */
const tone: FlowField = {
  id: 'tone',
  type: 'choice',
  label: 'Tom',
  default: 'profissional',
  options: [
    { value: 'profissional', label: 'Profissional' },
    { value: 'inspirador', label: 'Inspirador' },
    { value: 'descontraido', label: 'Descontraído' },
  ],
}
const ref: FlowField = {
  id: 'source',
  type: 'upload',
  accept: 'media',
  label: 'Material de referência',
  desc: 'Opcional: um documento, áudio ou vídeo para usar como base.',
}
const about = (label: string, example?: string): FlowField => ({
  id: 'prompt',
  type: 'textarea',
  label,
  required: true,
  desc: 'Quanto mais contexto, melhor: público, objetivo e pontos que não podem faltar.',
  placeholder: 'Digite seu texto aqui',
  maxLength: 2000,
  ...(example ? { example } : {}),
})

const tpl = (t: Omit<SlideTemplate, 'flow'> & { fields: FlowField[] }): SlideTemplate => ({
  id: t.id,
  title: t.title,
  desc: t.desc,
  cats: t.cats,
  tag: t.tag,
  deck: t.deck,
  flow: {
    title: t.title,
    desc: t.desc,
    output: 'slides',
    submitLabel: 'Criar',
    initialModel: 'claude-sonnet',
    deck: t.deck,
    steps: [
      { id: 'content', label: 'Conteúdo', fields: t.fields },
      {
        id: 'format',
        label: 'Formato',
        summary: 'pages',
        fields: [{ id: 'pages', type: 'count', label: 'Número de slides', min: 3, max: 15, default: t.deck.slides.length }, tone, ref],
      },
    ],
  },
})

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  tpl({
    id: 'partnership',
    title: 'Apresentação de Parceria ou Sociedade',
    desc: 'Crie apresentação técnica e impactante para proposta de parceria, com estrutura clara, argumentos sólidos e visual atrativo para gerar credibilidade.',
    cats: ['Advogados', 'Vendas'],
    tag: 'Advogados',
    fields: [
      about('Quem são as partes e qual é a proposta?'),
      {
        id: 'kind',
        type: 'choice',
        label: 'Tipo de acordo',
        options: [
          { value: 'parceria', label: 'Parceria comercial' },
          { value: 'sociedade', label: 'Sociedade' },
          { value: 'jv', label: 'Joint venture' },
        ],
      },
    ],
    deck: {
      theme: THEMES.navy,
      slides: [
        { kind: 'cover', eyebrow: 'Proposta de parceria', title: 'Silva & Prado + Nexo Legal', subtitle: 'Uma aliança para atender empresas de tecnologia de ponta a ponta', img: pLake },
        { kind: 'cards', title: 'Por que juntos', items: [['⚖️', 'Societário', 'Estruturação e M&A com 15 anos de prática'], ['🛡️', 'Dados e LGPD', 'Programa de privacidade completo'], ['🤝', 'Atendimento único', 'Um time, um contrato, um ponto de contato']] },
        { kind: 'stats', title: 'O que cada lado traz', stats: [['120+', 'clientes ativos'], ['38', 'advogados'], ['R$ 2,1 mi', 'receita recorrente']] },
        { kind: 'steps', title: 'Estrutura do acordo', items: [['Fase 1', 'Indicação mútua e comissionamento'], ['Fase 2', 'Atendimento integrado em contratos'], ['Fase 3', 'Avaliação de sociedade em 12 meses']] },
        { kind: 'closing', title: 'Próximos passos', subtitle: 'Assinatura do memorando de entendimentos até 30 de novembro' },
      ],
    },
  }),
  tpl({
    id: 'slides',
    title: 'Apresentação de Slides',
    desc: 'Crie um esboço estruturado para sua apresentação, transmitindo ideias de forma eficaz e garantindo clareza para sua audiência.',
    cats: ['Popular'],
    fields: [about('Sobre o que é a apresentação?', 'Uma apresentação de 10 minutos para o time sobre como usamos IA no atendimento, com exemplos e próximos passos.')],
    deck: {
      theme: THEMES.lime,
      slides: [
        { kind: 'cover', eyebrow: 'Apresentação', title: 'IA no atendimento', subtitle: 'Como respondemos mais rápido sem perder o toque humano' },
        { kind: 'split', title: 'Onde estamos', text: 'Hoje 62% dos chamados são dúvidas repetidas. A IA responde essas na hora e passa o resto para o time com contexto.', img: pRobot },
        { kind: 'cards', title: 'O que mudou', items: [['⚡', 'Resposta imediata', 'Dúvidas comuns resolvidas em segundos'], ['🧭', 'Contexto', 'O atendente recebe o histórico pronto'], ['📈', 'Aprendizado', 'Cada conversa melhora as respostas']] },
        { kind: 'stats', title: 'Resultados em 90 dias', stats: [['-48%', 'tempo de resposta'], ['+21', 'pontos de NPS'], ['3x', 'chamados por pessoa']] },
        { kind: 'closing', title: 'Obrigado!', subtitle: 'Perguntas? Fale com o time de CX' },
      ],
    },
  }),
  tpl({
    id: 'results',
    title: 'Apresentação de Resultados',
    desc: 'Crie apresentação de resultados da equipe para mostrar conquistas de forma clara, visual e profissional a toda a empresa.',
    cats: ['Popular', 'Gestão'],
    tag: 'Gestão',
    fields: [
      about('Quais resultados você quer mostrar?'),
      {
        id: 'period',
        type: 'choice',
        label: 'Período',
        options: [
          { value: 'mes', label: 'Mês' },
          { value: 'tri', label: 'Trimestre' },
          { value: 'ano', label: 'Ano' },
        ],
      },
    ],
    deck: {
      theme: THEMES.chart,
      slides: [
        { kind: 'cover', eyebrow: 'Resultados Q3', title: 'Um trimestre de recordes', subtitle: 'Time de Growth · julho a setembro de 2026', img: pGradient },
        { kind: 'stats', title: 'Números do trimestre', stats: [['R$ 4,8 mi', 'receita nova'], ['+34%', 'vs. Q2'], ['92%', 'da meta anual']] },
        { kind: 'cards', title: 'Principais conquistas', items: [['🚀', 'Lançamento do 4.0', 'Entregue duas semanas antes'], ['🌎', 'Novo mercado', 'Primeiros 40 clientes no México'], ['💬', 'Suporte', 'NPS chegou a 71']] },
        { kind: 'steps', title: 'Foco do Q4', items: [['Outubro', 'Campanha de fim de ano'], ['Novembro', 'Expansão do time comercial'], ['Dezembro', 'Planejamento 2027']] },
        { kind: 'closing', title: 'Obrigado, time!', subtitle: 'Conquistas de todo mundo' },
      ],
    },
  }),
  tpl({
    id: 'pitch',
    title: 'Apresentação de Pitch de Vendas Direcionado',
    desc: 'Crie apresentação de vendas personalizada com SPIN, PAS ou AIDA, focando em gatilhos, solução de problemas e proposta de valor clara.',
    cats: ['Popular', 'Vendas'],
    fields: [
      about('Qual é o produto e quem é o cliente?'),
      {
        id: 'method',
        type: 'choice',
        label: 'Método',
        default: 'spin',
        options: [
          { value: 'spin', label: 'SPIN' },
          { value: 'pas', label: 'PAS' },
          { value: 'aida', label: 'AIDA' },
        ],
      },
    ],
    deck: {
      theme: THEMES.navy,
      slides: [
        { kind: 'cover', eyebrow: 'Proposta para Acme', title: 'Feche o mês sem planilhas', subtitle: 'Como o Squad automatiza o financeiro do seu time comercial', img: pDesert },
        { kind: 'split', title: 'A situação hoje', text: 'Seu time gasta 9 horas por semana conciliando comissões em planilhas, e os erros chegam a 4% do valor pago.', img: pCurly },
        { kind: 'cards', title: 'O que muda com o Squad', items: [['🔄', 'Conciliação automática', 'Integra CRM e banco'], ['🧾', 'Comissões sem erro', 'Regras configuráveis'], ['📊', 'Visão em tempo real', 'Painel para cada gestor']] },
        { kind: 'stats', title: 'Impacto esperado', stats: [['-9h', 'por semana'], ['0%', 'erros de comissão'], ['4 meses', 'para o retorno']] },
        { kind: 'closing', title: 'Vamos começar?', subtitle: 'Piloto de 30 dias com o time de São Paulo' },
      ],
    },
  }),
  tpl({
    id: 'project-done',
    title: 'Apresentação de Projeto Realizado',
    desc: 'Crie uma apresentação envolvente sobre um projeto que você realizou, destacando os objetivos, conquistas, desafios e ações tomadas. Ideal para portfólio.',
    cats: ['Arquitetos'],
    tag: 'Arquitetos',
    fields: [about('Qual foi o projeto?'), { id: 'photos', type: 'upload', accept: 'image', label: 'Fotos do projeto', desc: 'Opcional: as imagens entram nos slides.' }],
    deck: {
      theme: THEMES.arch,
      slides: [
        { kind: 'cover', eyebrow: 'Projeto realizado', title: 'Casa Lago', subtitle: 'Residência de 320 m² em Nova Lima, MG · 2025', img: pLake },
        { kind: 'split', title: 'O desafio', text: 'Um terreno em declive acentuado, com vista para o lago e a exigência de preservar as árvores nativas.', img: pForest },
        { kind: 'steps', title: 'Como resolvemos', items: [['Implantação', 'Volumes em balanço que seguem o terreno'], ['Materiais', 'Madeira certificada e pedra local'], ['Luz', 'Fachada envidraçada para o nascente']] },
        { kind: 'quote', text: 'A casa parece que sempre esteve ali.', by: 'Família Andrade, clientes' },
        { kind: 'closing', title: 'Casa Lago', subtitle: 'Projeto e execução: Estúdio Landmarks' },
      ],
    },
  }),
  tpl({
    id: 'arch-office',
    title: 'Apresentação de Escritório de Arquitetura',
    desc: 'Crie uma apresentação visualmente cativante para apresentar seu escritório de arquitetura. Destaque o porte, a área de atuação, os diferenciais e projetos.',
    cats: ['Arquitetos'],
    tag: 'Arquitetos',
    fields: [about('Conte sobre o escritório'), { id: 'photos', type: 'upload', accept: 'image', label: 'Fotos dos projetos', desc: 'Opcional: as imagens entram nos slides.' }],
    deck: {
      theme: THEMES.blush,
      slides: [
        { kind: 'cover', eyebrow: 'Estúdio Landmarks', title: 'Espaços que contam histórias', subtitle: 'Arquitetura comercial e de interiores desde 2012', img: pInterior },
        {
          kind: 'split',
          title: 'O que fazemos',
          text: 'Projetos completos, do conceito à obra, para marcas que querem ser lembradas pelo espaço.',
          img: pInterior,
          items: [['🏬', 'Varejo', 'Lojas e salões'], ['🍽️', 'Gastronomia', 'Restaurantes e cafés'], ['🏢', 'Corporativo', 'Escritórios e coworkings']],
        },
        { kind: 'stats', title: 'Em números', stats: [['140+', 'projetos entregues'], ['12', 'arquitetos'], ['6', 'prêmios de design']] },
        { kind: 'quote', text: 'Nosso faturamento cresceu 30% depois da reforma.', by: 'Salão Bella Vita' },
        { kind: 'closing', title: 'Vamos conversar?', subtitle: 'contato@landmarks.arq.br' },
      ],
    },
  }),
  tpl({
    id: 'project',
    title: 'Apresentação de Projeto',
    desc: 'Crie apresentação sobre projeto realizado com objetivos, conquistas, desafios e ações. Ideal para compartilhar aprendizados e gerar reconhecimento.',
    cats: ['Gestão'],
    tag: 'Gestão',
    fields: [about('Qual é o projeto e o que você quer destacar?')],
    deck: {
      theme: THEMES.violet,
      slides: [
        { kind: 'cover', eyebrow: 'Projeto Atlas', title: 'Nova Biblioteca do Inner', subtitle: 'Do kickoff ao lançamento em 10 semanas', img: pCraft },
        { kind: 'cards', title: 'Objetivos', items: [['🗂️', 'Organizar', 'Pastas e bases de conhecimento'], ['🔎', 'Encontrar', 'Busca e filtros por origem'], ['⚡', 'Usar', 'Arquivos direto no chat']] },
        { kind: 'steps', title: 'Linha do tempo', items: [['Semanas 1 a 3', 'Pesquisa com 24 clientes'], ['Semanas 4 a 7', 'Design e protótipo'], ['Semanas 8 a 10', 'Build, testes e lançamento']] },
        { kind: 'stats', title: 'Resultados', stats: [['+58%', 'uso de arquivos no chat'], ['4,7', 'nota no feedback'], ['-30%', 'chamados sobre arquivos']] },
        { kind: 'closing', title: 'Aprendizados', subtitle: 'Pesquisa cedo e entregas semanais fizeram a diferença' },
      ],
    },
  }),
  tpl({
    id: 'policies',
    title: 'Slides para Políticas da Empresa',
    desc: 'Crie apresentação clara e atrativa sobre políticas da empresa para comunicar diretrizes internas de forma acessível e profissional.',
    cats: ['Recursos Humanos'],
    tag: 'Recursos Humanos',
    fields: [about('Qual política você quer comunicar?', 'Política de trabalho remoto 2027: dias presenciais, auxílio home office e regras de reuniões.')],
    deck: {
      theme: THEMES.navy,
      slides: [
        { kind: 'cover', eyebrow: 'Recursos Humanos', title: 'Trabalho remoto 2027', subtitle: 'O que muda a partir de janeiro', img: pForest },
        { kind: 'cards', title: 'As regras', items: [['🏠', '3 dias remotos', 'Terça e quinta no escritório'], ['💻', 'Auxílio de R$ 250', 'Para internet e equipamento'], ['🕘', 'Horário núcleo', 'Das 10h às 16h para reuniões']] },
        { kind: 'steps', title: 'Como pedir exceções', items: [['1', 'Converse com sua liderança'], ['2', 'Abra um pedido no portal de RH'], ['3', 'Resposta em até 5 dias úteis']] },
        { kind: 'closing', title: 'Dúvidas?', subtitle: 'Fale com o RH no canal #pessoas' },
      ],
    },
  }),
]

export const SLIDE_FLOWS: Record<string, FlowConfig> = Object.fromEntries(SLIDE_TEMPLATES.map((t) => [t.id, t.flow]))

/* deck de um item do histórico (protótipo): template escolhido pelo título,
   com o título do item na capa */
export function deckForTitle(title: string): { tool: string; template: string; deck: Deck } {
  let h = 0
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const t = SLIDE_TEMPLATES[h % SLIDE_TEMPLATES.length]
  const slides = t.deck.slides.map((s, i) => (i === 0 && s.kind === 'cover' ? { ...s, title } : s))
  return { tool: t.id, template: t.title, deck: { ...t.deck, slides } }
}

/* ajusta o deck ao número de slides pedido: mantém capa e encerramento e
   corta ou repete os slides do meio (protótipo) */
export function fitDeck(deck: Deck, n: number): Deck {
  const all = deck.slides
  if (!n || n === all.length || all.length < 3) return deck
  const first = all[0]
  const last = all[all.length - 1]
  const middle = all.slice(1, -1)
  const want = Math.max(1, n - 2)
  const mid = Array.from({ length: want }, (_, i) => middle[i % middle.length])
  return { ...deck, slides: [first, ...mid, last] }
}
