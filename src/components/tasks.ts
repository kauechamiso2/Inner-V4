/* Tarefas fake — compartilhadas entre a página de Tarefas e o drawer.
   Apenas para demonstração. */
export type Task = {
  id: string
  name: string
  emoji: string
  color: string
  recurring: boolean
  /* periodicidade legível, mostrada no drawer */
  schedule: string
  next: string | null
  last: string | null
  description: string
  /* presente apenas em tarefas inativas (ex.: "Pausada") */
  status?: string
}

export const ACTIVE_TASKS: Task[] = [
  {
    id: 'voo',
    name: 'Monitoramento de voo LH441',
    emoji: '✈️',
    color: '#2563B8',
    recurring: true,
    schedule: 'A cada 15 minutos',
    next: 'Hoje, 18:45',
    last: 'há 6 minutos',
    description:
      'Acompanha o status do voo LH441 e avisa sobre mudanças de portão, atrasos e cancelamentos.',
  },
  {
    id: 'email',
    name: 'Monitoramento de e-mails importantes',
    emoji: '✉️',
    color: '#6B46C1',
    recurring: true,
    schedule: 'A cada hora',
    next: 'Hoje, 15:00',
    last: 'há 38 minutos',
    description:
      'Resume os e-mails importantes recebidos e destaca o que precisa de ação ou resposta rápida.',
  },
  {
    id: 'vendas',
    name: 'Relatório de vendas Q4',
    emoji: '📊',
    color: '#1F7A4D',
    recurring: false,
    schedule: 'Execução única',
    next: '20 out, 09:00',
    last: null,
    description:
      'Gera o relatório consolidado de vendas do Q4 com os principais indicadores e comparativos.',
  },
]

export const INACTIVE_TASKS: Task[] = [
  {
    id: 'precos',
    name: 'Monitoramento de preços',
    emoji: '🏷️',
    color: '#C15A2B',
    recurring: true,
    schedule: 'Diariamente',
    next: null,
    last: 'há 2 dias',
    description:
      'Monitora os preços dos concorrentes e alerta sobre mudanças relevantes no mercado.',
    status: 'Pausada',
  },
]
