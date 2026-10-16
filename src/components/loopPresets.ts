/* Presets de Loops (seção "Explorar"): modelos prontos de tarefas agendadas.
   "Usar" abre o formulário de nova tarefa já preenchido. */

export type LoopPreset = {
  id: string
  name: string
  desc: string
  category: string
  /* ícone nativo (emoji) e cor do fundo, herdados pela tarefa criada */
  emoji: string
  color: string
  /* periodicidade no mesmo formato das tarefas (lido de volta pelo formulário) */
  schedule: string
  notify?: 'platform' | 'whatsapp'
}

export const LOOP_PRESET_CATEGORIES = [
  'Todos',
  'Produtividade',
  'Vendas',
  'Marketing',
  'Finanças',
  'Pesquisa',
  'Pessoal',
]

export const LOOP_PRESETS: LoopPreset[] = [
  {
    id: 'lp-emails',
    emoji: '📨',
    color: '#3B82F6',
    name: 'Resumo matinal de e-mails',
    desc: 'Leia a caixa de entrada das últimas 24 horas, destaque o que precisa de resposta hoje e agrupe o resto por assunto.',
    category: 'Produtividade',
    schedule: 'Dias úteis, 08:00',
  },
  {
    id: 'lp-agenda',
    emoji: '☀️',
    color: '#F59E0B',
    name: 'Prepare meu dia',
    desc: 'Monte um resumo da agenda de hoje com o contexto de cada reunião, pendências ligadas a elas e o que preparar antes.',
    category: 'Produtividade',
    schedule: 'Dias úteis, 07:30',
    notify: 'whatsapp',
  },
  {
    id: 'lp-semana',
    emoji: '🗓️',
    color: '#6366F1',
    name: 'Planejamento da semana',
    desc: 'Toda segunda, organize as prioridades da semana a partir das tarefas abertas, prazos e reuniões marcadas.',
    category: 'Produtividade',
    schedule: 'Toda segunda, 08:30',
  },
  {
    id: 'lp-pipeline',
    emoji: '💼',
    color: '#0EA5E9',
    name: 'Saúde do pipeline',
    desc: 'Revise as oportunidades abertas, aponte negócios parados há mais de 7 dias e sugira o próximo passo para cada um.',
    category: 'Vendas',
    schedule: 'Toda segunda, 09:00',
  },
  {
    id: 'lp-leads',
    emoji: '🤝',
    color: '#10B981',
    name: 'Leads para retomar contato',
    desc: 'Liste os leads que não recebem contato há duas semanas e escreva uma mensagem de follow-up personalizada para cada.',
    category: 'Vendas',
    schedule: 'Toda quarta, 10:00',
  },
  {
    id: 'lp-concorrentes',
    emoji: '🔭',
    color: '#8B5CF6',
    name: 'Radar de concorrentes',
    desc: 'Acompanhe lançamentos, mudanças de preço e campanhas dos principais concorrentes e resuma o que mudou na semana.',
    category: 'Marketing',
    schedule: 'Toda sexta, 09:00',
  },
  {
    id: 'lp-pautas',
    emoji: '💡',
    color: '#EAB308',
    name: 'Ideias de pauta da semana',
    desc: 'Sugira 5 pautas para as redes a partir dos assuntos em alta no seu setor, com gancho, formato e chamada para ação.',
    category: 'Marketing',
    schedule: 'Toda segunda, 10:00',
  },
  {
    id: 'lp-metricas',
    emoji: '📈',
    color: '#F0603A',
    name: 'Relatório de métricas de conteúdo',
    desc: 'Compile alcance, engajamento e cliques dos posts do mês, compare com o mês anterior e destaque o que funcionou.',
    category: 'Marketing',
    schedule: 'Todo mês, 09:00',
  },
  {
    id: 'lp-caixa',
    emoji: '💰',
    color: '#16A34A',
    name: 'Fechamento do fluxo de caixa',
    desc: 'Resuma entradas e saídas do mês, compare com o orçamento previsto e aponte gastos fora do padrão.',
    category: 'Finanças',
    schedule: 'Todo mês, 18:00',
  },
  {
    id: 'lp-contas',
    emoji: '🧾',
    color: '#64748B',
    name: 'Contas a vencer',
    desc: 'Liste os pagamentos que vencem nos próximos 7 dias, com valor e data, para nada passar do prazo.',
    category: 'Finanças',
    schedule: 'Toda segunda, 08:00',
    notify: 'whatsapp',
  },
  {
    id: 'lp-noticias',
    emoji: '📰',
    color: '#475569',
    name: 'Notícias do meu setor',
    desc: 'Busque as notícias mais relevantes do dia sobre o seu mercado e resuma cada uma em duas linhas, com o link da fonte.',
    category: 'Pesquisa',
    schedule: 'Todos os dias, 07:00',
  },
  {
    id: 'lp-papers',
    emoji: '🔬',
    color: '#06B6D4',
    name: 'Novidades em pesquisa',
    desc: 'Encontre artigos e estudos publicados na semana sobre os temas que você acompanha e explique as conclusões principais.',
    category: 'Pesquisa',
    schedule: 'Toda sexta, 16:00',
  },
  {
    id: 'lp-passagens',
    emoji: '✈️',
    color: '#3B82F6',
    name: 'Monitor de passagens',
    desc: 'Acompanhe o preço dos voos para o seu destino e avise quando cair abaixo do valor que você definir.',
    category: 'Pessoal',
    schedule: 'Todos os dias, 12:00',
    notify: 'whatsapp',
  },
  {
    id: 'lp-leitura',
    emoji: '📚',
    color: '#D97706',
    name: 'Resumo de leitura do fim de semana',
    desc: 'Selecione os melhores textos salvos durante a semana e monte uma lista de leitura com um resumo de cada um.',
    category: 'Pessoal',
    schedule: 'Todo sábado, 09:00',
  },
]
