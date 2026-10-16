import { CONTENT_BRIEFING } from './taskBriefing'
import type { Task } from './tasks'

/* Execuções de um loop (página do loop > Histórico) e o resultado mockado de
   cada loop. Cada tarefa tem um formato próprio no drawer (briefing, status do
   voo, caixa de entrada, preços); o mesmo resultado vira texto no chat. */

export type Run = {
  id: string
  when: string
  status: 'done' | 'running'
  origin: 'scheduled' | 'manual'
}

/* histórico de exemplo: tarefas que já rodaram têm 3 execuções concluídas */
export function seedRuns(task: Task): Run[] {
  if (!task.last) return []
  const time = task.schedule.match(/\d{1,2}:\d{2}/)?.[0] ?? '09:00'
  return ['12 de out.', '05 de out.', '28 de set.'].map((d, i) => ({
    id: `${task.id}-run-${i}`,
    when: `${d}, ${time}`,
    status: 'done',
    origin: 'scheduled',
  }))
}

export type LoopResult =
  | { kind: 'briefing' }
  | {
      kind: 'flight'
      title: string
      intro: string
      flight: {
        code: string
        airline: string
        from: string
        fromCity: string
        to: string
        toCity: string
        dep: string
        arr: string
        status: string
      }
      facts: { label: string; value: string }[]
    }
  | {
      kind: 'inbox'
      title: string
      intro: string
      emails: { from: string; subject: string; snippet: string; tag: string }[]
    }
  | {
      kind: 'prices'
      title: string
      intro: string
      products: { name: string; store: string; before: string; now: string; delta: number }[]
    }
  | { kind: 'generic'; title: string; intro: string; points: { title: string; body: string }[] }

export function resultOf(task: Task): LoopResult {
  if (task.id === 'conteudo-semanal') return { kind: 'briefing' }
  if (task.id === 'voo')
    return {
      kind: 'flight',
      title: 'Voo LH441 no horário',
      intro: 'Nenhuma mudança desde a última verificação. Aviso na hora se houver atraso, troca de portão ou cancelamento.',
      flight: {
        code: 'LH441',
        airline: 'Lufthansa',
        from: 'FRA',
        fromCity: 'Frankfurt',
        to: 'GRU',
        toCity: 'São Paulo',
        dep: '22:05',
        arr: '05:40',
        status: 'No horário',
      },
      facts: [
        { label: 'Terminal', value: '1' },
        { label: 'Portão', value: 'B44' },
        { label: 'Embarque', value: '21:15' },
        { label: 'Assento', value: '32A' },
      ],
    }
  if (task.id === 'email')
    return {
      kind: 'inbox',
      title: '3 e-mails pedem sua atenção',
      intro: 'Dos 27 e-mails recebidos na última hora, separei os que precisam de ação ou resposta rápida.',
      emails: [
        {
          from: 'Jurídico Acme',
          subject: 'Contrato: assinatura até amanhã',
          snippet: 'Precisamos da revisão final da cláusula 7 antes de enviar para assinatura.',
          tag: 'Responder hoje',
        },
        {
          from: 'Marina Costa',
          subject: 'Planejamento remarcado para quinta',
          snippet: 'Passamos a reunião para quinta, 14:00. Consegue confirmar presença?',
          tag: 'Confirmar',
        },
        {
          from: 'Financeiro',
          subject: 'Fatura de outubro disponível',
          snippet: 'O vencimento é em 5 dias. Valor dentro do previsto para o mês.',
          tag: 'Para saber',
        },
      ],
    }
  if (task.id === 'precos')
    return {
      kind: 'prices',
      title: '2 produtos mudaram de preço',
      intro: 'Comparei os preços de hoje com a última execução nas lojas monitoradas.',
      products: [
        { name: 'Fone Sony WH-1000XM5', store: 'Loja oficial', before: 'R$ 2.299', now: 'R$ 2.019', delta: -12 },
        { name: 'Kindle Paperwhite', store: 'Amazon', before: 'R$ 799', now: 'R$ 839', delta: 5 },
        { name: 'Cafeteira Nespresso Vertuo', store: 'Magalu', before: 'R$ 649', now: 'R$ 649', delta: 0 },
      ],
    }
  return {
    kind: 'generic',
    title: task.name,
    intro: task.description,
    points: [
      { title: 'Resultado entregue', body: 'Fiz a análise pedida nas instruções e organizei o que encontrei.' },
      { title: 'Próximos passos', body: 'Se quiser, aprofundo algum ponto ou ajusto as instruções do loop.' },
    ],
  }
}

/* o mesmo resultado como resposta do agente no chat ("Abrir chat") */
type Block = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }
export function resultBlocks(task: Task, when: string): Block[] {
  const r = resultOf(task)
  const head: Block = { kind: 'p', text: `Execução de **${when}** do loop **${task.name}**.` }
  if (r.kind === 'briefing') {
    const b = CONTENT_BRIEFING
    return [
      head,
      { kind: 'p', text: `**${b.title}.** ${b.intro}` },
      { kind: 'ul', items: b.items.map((it) => `**${it.headline}** (${it.topic})`) },
      { kind: 'p', text: 'Quer que eu aprofunde alguma dessas notícias ou transforme em post?' },
    ]
  }
  if (r.kind === 'flight') {
    const f = r.flight
    return [
      head,
      { kind: 'p', text: `**${r.title}.** ${r.intro}` },
      {
        kind: 'ul',
        items: [
          `**Rota:** ${f.fromCity} (${f.from}) → ${f.toCity} (${f.to})`,
          `**Partida:** ${f.dep} · **Chegada:** ${f.arr}`,
          ...r.facts.map((x) => `**${x.label}:** ${x.value}`),
        ],
      },
      { kind: 'p', text: 'Sigo monitorando a cada 15 minutos até o embarque.' },
    ]
  }
  if (r.kind === 'inbox')
    return [
      head,
      { kind: 'p', text: `**${r.title}.** ${r.intro}` },
      { kind: 'ul', items: r.emails.map((e) => `**${e.subject}** (${e.from}): ${e.snippet}`) },
      { kind: 'p', text: 'Quer que eu rascunhe as respostas?' },
    ]
  if (r.kind === 'prices')
    return [
      head,
      { kind: 'p', text: `**${r.title}.** ${r.intro}` },
      {
        kind: 'ul',
        items: r.products.map(
          (p) =>
            `**${p.name}** (${p.store}): ${p.now}${p.delta ? ` (${p.delta > 0 ? '+' : ''}${p.delta}%)` : ', sem mudança'}`,
        ),
      },
      { kind: 'p', text: 'Aviso de novo se algum preço cair mais.' },
    ]
  return [
    head,
    { kind: 'p', text: r.intro },
    { kind: 'ul', items: r.points.map((p) => `**${p.title}:** ${p.body}`) },
  ]
}
