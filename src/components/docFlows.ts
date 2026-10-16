import type { FlowConfig, FlowField } from './flow/Flow'
import type { ImageModel } from './imageModels'
import { CHAT_MODELS } from './chatModels'

/* Pilar de Documentos ("Templates de Texto"): templates da galeria e o flow de
   cada um. Os modelos são os mesmos do Chat com modelos. */

export const DOC_MODELS: ImageModel[] = CHAT_MODELS.map((m) => ({
  id: m.id,
  name: m.name,
  logo: m.logo,
  credits: m.tier === 'raciocinio' ? 30 : m.tier === 'avancado' ? 15 : 5,
  desc: m.desc,
}))

export type DocTemplate = {
  id: string
  title: string
  desc: string
  cats: string[]
  tag?: string
  flow: FlowConfig
}

/* campos que se repetem entre os templates */
const tone: FlowField = {
  id: 'tone',
  type: 'choice',
  label: 'Tom de voz',
  options: [
    { value: 'profissional', label: 'Profissional' },
    { value: 'descontraido', label: 'Descontraído' },
    { value: 'inspirador', label: 'Inspirador' },
    { value: 'tecnico', label: 'Técnico' },
  ],
}
const lang: FlowField = {
  id: 'lang',
  type: 'choice',
  label: 'Idioma',
  default: 'pt',
  options: [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
  ],
}
const source: FlowField = {
  id: 'source',
  type: 'upload',
  accept: 'media',
  label: 'Arquivo de referência',
  desc: 'Opcional: um vídeo, áudio ou documento para usar como base.',
}

/* monta um template de uma etapa ("Preencha os campos") com o botão "Criar" */
const tpl = (
  t: Omit<DocTemplate, 'flow'> & { fields: FlowField[]; doc: { title: string; blocks: string[] } },
): DocTemplate => ({
  id: t.id,
  title: t.title,
  desc: t.desc,
  cats: t.cats,
  tag: t.tag,
  flow: {
    title: t.title,
    desc: t.desc,
    output: 'doc',
    submitLabel: 'Criar',
    initialModel: 'claude-sonnet',
    doc: t.doc,
    steps: [{ id: 'fields', label: 'Preencha os campos', fields: t.fields }],
  },
})

export const DOC_TEMPLATES: DocTemplate[] = [
  tpl({
    id: 'video-script',
    title: 'Roteiro de Vídeo',
    desc: 'Potencialize seus roteiros de vídeo sem esforço! Nosso editor de texto com IA transforma ideias em roteiros cativantes em tempo recorde.',
    cats: ['Popular', 'Criação de Conteúdo', 'Marketing'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Sobre o que é o vídeo?', required: true, desc: 'Conte o tema, o público e o objetivo do vídeo.', placeholder: 'Digite seu texto aqui' },
      {
        id: 'length',
        type: 'choice',
        label: 'Duração',
        options: [
          { value: '30s', label: 'Até 30 segundos' },
          { value: '1min', label: '1 minuto' },
          { value: '3min', label: '3 minutos' },
          { value: '10min', label: '10 minutos' },
        ],
      },
      tone,
    ],
    doc: {
      title: 'Roteiro: 3 hábitos para uma semana mais produtiva',
      blocks: [
        '## Gancho (0:00 a 0:05)',
        'Você termina a semana com a sensação de que não fez nada? Fica comigo por um minuto.',
        '## Desenvolvimento (0:05 a 0:45)',
        'Primeiro: comece a segunda listando só três prioridades. Segundo: bloqueie duas horas sem notificação por dia. Terceiro: na sexta, revise o que funcionou.',
        '## Chamada para ação (0:45 a 1:00)',
        'Salva esse vídeo e me conta nos comentários qual hábito você vai testar primeiro.',
      ],
    },
  }),
  tpl({
    id: 'instagram',
    title: 'Legenda de Instagram',
    desc: 'Transforme imagens, arquivos e ideias em legendas cativantes para Instagram, destacando suas publicações e aumentando sua presença nas redes.',
    cats: ['Popular', 'Marketing', 'Criação de Conteúdo'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Sobre o que é o post?', required: true, desc: 'Descreva a imagem ou a mensagem principal.', placeholder: 'Digite seu texto aqui' },
      { id: 'image', type: 'upload', accept: 'image', label: 'Imagem do post', desc: 'Opcional: a legenda considera o que aparece na imagem.' },
      tone,
      { id: 'hashtags', type: 'toggle', label: 'Incluir hashtags', default: true },
    ],
    doc: {
      title: 'Legenda para o lançamento da coleção de verão',
      blocks: [
        'O sol chegou e trouxe a coleção que você esperava. ☀️',
        'Peças leves, cores que lembram o fim de tarde e aquele conforto para viver o verão do seu jeito.',
        'Qual look você levaria para a praia? Conta aqui embaixo 👇',
        '#verao #novacolecao #modapraia #lookdodia',
      ],
    },
  }),
  tpl({
    id: 'blog',
    title: 'Postagem de Blog',
    desc: 'Gere artigos de blog eficientes a partir de qualquer prompt ou arquivo, otimizando seu processo de criação de conteúdo.',
    cats: ['Popular', 'Marketing', 'Criação de Conteúdo'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Tema do artigo', required: true, desc: 'O assunto, o público e a palavra-chave principal.', placeholder: 'Digite seu texto aqui' },
      source,
      {
        id: 'size',
        type: 'choice',
        label: 'Tamanho',
        options: [
          { value: 'curto', label: 'Curto', hint: '600 palavras' },
          { value: 'medio', label: 'Médio', hint: '1.200 palavras' },
          { value: 'longo', label: 'Longo', hint: '2.000 palavras' },
        ],
      },
      lang,
    ],
    doc: {
      title: 'Como a IA está mudando o atendimento ao cliente',
      blocks: [
        'O atendimento deixou de ser só responder perguntas. Hoje, o cliente espera rapidez, contexto e uma conversa que não precise recomeçar a cada contato.',
        '## O que mudou',
        'Assistentes com IA resolvem dúvidas simples na hora e deixam o time humano livre para os casos que pedem empatia e decisão.',
        '## Por onde começar',
        'Mapeie as dez perguntas mais frequentes, organize as respostas numa base de conhecimento e meça o tempo de resolução antes e depois.',
      ],
    },
  }),
  tpl({
    id: 'summary',
    title: 'Resumo',
    desc: 'Resuma de forma eficiente conteúdo de vídeo, áudio ou texto, escolhendo entre formatos longos ou curtos.',
    cats: ['Popular', 'Acadêmico', 'Gestão'],
    fields: [
      { id: 'source', type: 'upload', accept: 'media', label: 'Conteúdo para resumir', required: true, desc: 'Envie um vídeo, áudio ou documento.' },
      {
        id: 'format',
        type: 'choice',
        label: 'Formato',
        options: [
          { value: 'curto', label: 'Curto', hint: 'tópicos' },
          { value: 'longo', label: 'Longo', hint: 'com detalhes' },
        ],
      },
    ],
    doc: {
      title: 'Resumo da reunião de planejamento',
      blocks: [
        '## Principais pontos',
        'O lançamento foi confirmado para a segunda quinzena de novembro, com campanha começando duas semanas antes.',
        'O orçamento de mídia foi aprovado com foco em vídeos curtos e parcerias com criadores.',
        '## Próximos passos',
        'Marketing entrega o calendário até sexta; produto revisa as telas finais na próxima segunda.',
      ],
    },
  }),
  tpl({
    id: 'slides-outline',
    title: 'Esboço de Apresentação de Slides',
    desc: 'Crie um esboço estruturado para sua apresentação, transmitindo ideias de forma eficaz e garantindo clareza para sua audiência.',
    cats: ['Popular', 'Gestão', 'Vendas'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Tema da apresentação', required: true, desc: 'O assunto, para quem é e o que a audiência precisa sair sabendo.', placeholder: 'Digite seu texto aqui' },
      {
        id: 'slides',
        type: 'choice',
        label: 'Número de slides',
        options: [
          { value: '5', label: '5' },
          { value: '10', label: '10' },
          { value: '15', label: '15' },
        ],
      },
    ],
    doc: {
      title: 'Esboço: Resultados do trimestre',
      blocks: [
        '## 1. Abertura',
        'O trimestre em uma frase: crescemos 18% mantendo o custo de aquisição estável.',
        '## 2. Números principais',
        'Receita, novos clientes e retenção, comparados ao trimestre anterior.',
        '## 3. O que funcionou',
        'Parcerias com criadores e a nova página de preços.',
        '## 4. Próximo trimestre',
        'Três prioridades e o que precisamos de cada time.',
      ],
    },
  }),
  tpl({
    id: 'quiz',
    title: 'Questionário',
    desc: 'Gere quizzes envolventes a partir de vídeos, PDFs ou prompts, perfeito para enriquecer o conteúdo educacional em plataformas LMS.',
    cats: ['Popular', 'Acadêmico', 'Recursos Humanos'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Tema do questionário', required: true, desc: 'O conteúdo que as perguntas devem cobrir.', placeholder: 'Digite seu texto aqui' },
      source,
      { id: 'questions', type: 'count', label: 'Número de perguntas', min: 3, max: 20, default: 5 },
    ],
    doc: {
      title: 'Questionário: Segurança da informação',
      blocks: [
        '1. Qual é a forma mais segura de compartilhar uma senha com um colega? (a) E-mail (b) Gerenciador de senhas (c) Mensagem no chat',
        '2. Um e-mail pede seus dados com urgência. O que fazer primeiro? (a) Responder (b) Verificar o remetente (c) Clicar no link',
        '3. Com que frequência você deve atualizar o sistema? (a) Nunca (b) Sempre que houver atualização (c) Uma vez por ano',
      ],
    },
  }),
  tpl({
    id: 'marketing-email',
    title: 'E-mail de Marketing',
    desc: 'Escreva e-mails de campanha com assunto chamativo, texto persuasivo e uma chamada para ação clara.',
    cats: ['Marketing'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Sobre a campanha', required: true, desc: 'O que você está divulgando, para quem e qual a oferta.', placeholder: 'Digite seu texto aqui' },
      tone,
    ],
    doc: {
      title: 'Assunto: Sua vaga na turma de novembro está garantida?',
      blocks: [
        'Oi, tudo bem?',
        'As inscrições para a turma de novembro fecham nesta sexta. São só 30 vagas, e mais da metade já foi preenchida.',
        'Garanta a sua com 20% de desconto até quarta-feira.',
        'Até já!',
      ],
    },
  }),
  tpl({
    id: 'lesson-plan',
    title: 'Plano de Aula',
    desc: 'Monte planos de aula com objetivos, atividades e avaliação a partir do tema e da série.',
    cats: ['Acadêmico'],
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Tema da aula', required: true, desc: 'O conteúdo e a série dos alunos.', placeholder: 'Digite seu texto aqui' },
      { id: 'lessons', type: 'count', label: 'Duração (aulas de 50 min)', min: 1, max: 4, default: 1 },
    ],
    doc: {
      title: 'Plano de aula: Ciclo da água (6º ano)',
      blocks: [
        '## Objetivos',
        'Entender as etapas do ciclo da água e relacioná-las ao clima da região.',
        '## Atividades',
        'Experimento rápido com água quente e um prato frio para observar a condensação.',
        '## Avaliação',
        'Desenho do ciclo em grupo, explicando cada etapa com as próprias palavras.',
      ],
    },
  }),
  tpl({
    id: 'sales-email',
    title: 'E-mail de Prospecção',
    desc: 'Crie e-mails de primeiro contato personalizados para abrir conversas com potenciais clientes.',
    cats: ['Vendas'],
    tag: 'Vendas',
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Para quem é o e-mail?', required: true, desc: 'Empresa, cargo do contato e o que você oferece.', placeholder: 'Digite seu texto aqui' },
      tone,
    ],
    doc: {
      title: 'Assunto: Uma ideia para reduzir o tempo de onboarding da Acme',
      blocks: [
        'Olá, Marina.',
        'Vi que a Acme dobrou o time de suporte este ano. Ajudamos empresas nesse momento a reduzir o tempo de onboarding de novos atendentes em até 40%.',
        'Faz sentido uma conversa de 15 minutos na próxima semana?',
      ],
    },
  }),
  tpl({
    id: 'descriptive-memo',
    title: 'Memorial Descritivo',
    desc: 'Gere memoriais descritivos de projetos de arquitetura a partir das informações do projeto.',
    cats: ['Arquitetos'],
    tag: 'Arquitetos',
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Dados do projeto', required: true, desc: 'Tipo de obra, área, ambientes e materiais principais.', placeholder: 'Digite seu texto aqui' },
      { id: 'render', type: 'upload', accept: 'image', label: 'Planta ou render', desc: 'Opcional.' },
    ],
    doc: {
      title: 'Memorial descritivo: Residência unifamiliar',
      blocks: [
        '## Implantação',
        'Edificação térrea de 180 m², implantada no centro do lote para preservar as árvores existentes.',
        '## Materiais',
        'Estrutura em concreto aparente, vedações em alvenaria e esquadrias em alumínio na cor grafite.',
      ],
    },
  }),
  tpl({
    id: 'job-description',
    title: 'Descrição de Vaga',
    desc: 'Escreva anúncios de vaga claros e atraentes, com responsabilidades, requisitos e cultura da empresa.',
    cats: ['Recursos Humanos'],
    tag: 'Recursos Humanos',
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Sobre a vaga', required: true, desc: 'Cargo, área, senioridade e principais responsabilidades.', placeholder: 'Digite seu texto aqui' },
      {
        id: 'mode',
        type: 'choice',
        label: 'Modelo de trabalho',
        options: [
          { value: 'remoto', label: 'Remoto' },
          { value: 'hibrido', label: 'Híbrido' },
          { value: 'presencial', label: 'Presencial' },
        ],
      },
    ],
    doc: {
      title: 'Designer de Produto Sênior (remoto)',
      blocks: [
        '## Sobre o time',
        'Somos o time que desenha a experiência de IA usada por milhares de empresas.',
        '## O que você vai fazer',
        'Liderar a descoberta e o design de novas funcionalidades, do problema ao detalhe da interface.',
        '## O que procuramos',
        'Experiência com produtos digitais complexos e paixão por resolver problemas reais.',
      ],
    },
  }),
  tpl({
    id: 'meeting-minutes',
    title: 'Ata de Reunião',
    desc: 'Transforme anotações ou gravações em atas organizadas, com decisões e responsáveis.',
    cats: ['Gestão'],
    tag: 'Gestão',
    fields: [
      { id: 'source', type: 'upload', accept: 'media', label: 'Gravação ou anotações', required: true, desc: 'Envie o áudio, vídeo ou documento da reunião.' },
    ],
    doc: {
      title: 'Ata: Comitê de produto, 14 de outubro',
      blocks: [
        '## Decisões',
        'Priorizar a nova Biblioteca no próximo ciclo; adiar a integração com o CRM.',
        '## Responsáveis',
        'Kaue: protótipo da Biblioteca até 21/10. Marina: pesquisa com 8 clientes.',
      ],
    },
  }),
  tpl({
    id: 'contract',
    title: 'Contrato de Prestação de Serviços',
    desc: 'Gere minutas de contrato a partir das partes, do escopo e das condições combinadas.',
    cats: ['Advogados'],
    tag: 'Advogados',
    fields: [
      { id: 'prompt', type: 'textarea', label: 'Partes e escopo', required: true, desc: 'Quem contrata, quem presta o serviço, o que será entregue, valores e prazos.', placeholder: 'Digite seu texto aqui' },
    ],
    doc: {
      title: 'Minuta: Contrato de prestação de serviços',
      blocks: [
        '## Cláusula 1: Objeto',
        'A CONTRATADA prestará serviços de design de interfaces conforme o escopo do Anexo I.',
        '## Cláusula 2: Prazo e valor',
        'Vigência de 6 meses, com pagamento mensal até o 5º dia útil.',
        'Esta minuta deve ser revisada por um advogado antes da assinatura.',
      ],
    },
  }),
]

export const DOC_FLOWS: Record<string, FlowConfig> = Object.fromEntries(DOC_TEMPLATES.map((t) => [t.id, t.flow]))

/* documento de um item do histórico (protótipo): usa o conteúdo de um
   template, escolhido pelo título, com o título do item */
export function docForTitle(title: string): { tool: string; template: string; title: string; blocks: string[] } {
  let h = 0
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const t = DOC_TEMPLATES[h % DOC_TEMPLATES.length]
  return { tool: t.id, template: t.title, title, blocks: t.flow.doc?.blocks ?? [] }
}
