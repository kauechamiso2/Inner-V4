/* Resultado mockado da tarefa "Resumo semanal de métricas de conteúdo"
   (id: conteudo-semanal) — um briefing de notícias exibido no drawer. */

export type BriefingItem = {
  index: string
  topic: string
  date: string
  badge?: string
  headline: string
  /* item em destaque ganha uma thumb (gradiente) */
  image?: boolean
  body: string
}

export type Briefing = {
  ranAt: string
  date: string
  title: string
  intro: string
  window: string
  items: BriefingItem[]
}

export const CONTENT_BRIEFING: Briefing = {
  ranAt: 'há 4 horas',
  date: 'Quinta-feira, 8 de outubro de 2026',
  title: 'Seu briefing de IA & Design',
  intro:
    'As 5 notícias selecionadas desta edição, com foco em lançamentos, agentes, novas experiências digitais e acontecimentos de impacto.',
  window: 'Janela: 6 a 8 de outubro · Sem repetir as manchetes do briefing anterior',
  items: [
    {
      index: '01',
      topic: 'IA + UX/UI',
      date: '7 OUT',
      badge: 'Destaque do dia',
      headline: 'GPT-6 chega com Intelligent UI: interfaces geradas durante a conversa',
      image: true,
      body: 'A atualização expande o modelo globalmente e muda a experiência: as respostas passam a combinar texto, gráficos, formulários, botões e experiências interativas geradas conforme a necessidade do usuário. A novidade começou nos planos pagos e deve chegar ao gratuito nas próximas semanas.',
    },
    {
      index: '02',
      topic: 'Agentes',
      date: '7 OUT',
      headline: 'Agentes passam a executar tarefas em segundo plano e devolvem o resultado pronto',
      body: 'Novos fluxos deixam o agente rodar sozinho no horário definido e entregar o resultado quando fica pronto, exatamente o padrão que estamos adotando nas tarefas agendadas.',
    },
    {
      index: '03',
      topic: 'Design',
      date: '6 OUT',
      headline: 'Ferramentas de protótipo começam a exportar código production-ready',
      body: 'A ponte entre design e código encurta: componentes viram front-end utilizável direto do canvas, com tokens e estados preservados.',
    },
    {
      index: '04',
      topic: 'Produto',
      date: '8 OUT',
      headline: 'Geração de UI nativa entra nas IDEs e acelera protótipos de app',
      body: 'Montar telas a partir de uma descrição em linguagem natural vira parte do fluxo de desenvolvimento, encurtando o caminho da ideia ao app rodando.',
    },
    {
      index: '05',
      topic: 'Mercado',
      date: '8 OUT',
      headline: 'Nova rodada bilionária acelera a corrida por agentes verticais',
      body: 'O capital se move para assistentes especializados por setor, sinal de que a próxima disputa é por profundidade de contexto, não só por modelo.',
    },
  ],
}
