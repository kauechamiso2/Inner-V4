/* Conteúdo de exemplo de uma reunião gravada (protótipo): resumo,
   transcrição, analytics e informações, a partir do título. */

export type Person = { name: string; color: string }
export type MeetingLine = { who: number; t: number; text: string }
export type MeetingAction = { text: string; who: number; due: string }

export type MeetingData = {
  title: string
  date: string
  time: string
  dur: number
  platform: string
  link: string
  people: Person[]
  summary: string[]
  decisions: string[]
  actions: MeetingAction[]
  lines: MeetingLine[]
  topics: [string, number][]
  sentiment: [number, number, number]
}

const PEOPLE: Person[] = [
  { name: 'Kauê Chamiso', color: '#8b5cf6' },
  { name: 'Marina Costa', color: '#ec4899' },
  { name: 'Rafael Lima', color: '#0ea5e9' },
  { name: 'Júlia Prado', color: '#f59e0b' },
]

export function meetingFor(title: string): MeetingData {
  const oneOnOne = /1:1/.test(title)
  const people = oneOnOne ? PEOPLE.slice(0, 2) : PEOPLE
  const lines: MeetingLine[] = oneOnOne
    ? [
        { who: 0, t: 0, text: 'Oi, Marina! Bora começar? Queria ouvir como foram as últimas duas semanas.' },
        { who: 1, t: 9, text: 'Foram corridas, mas boas. Fechei a pesquisa com os clientes da Biblioteca.' },
        { who: 0, t: 21, text: 'Que ótimo. O que mais te surpreendeu nas entrevistas?' },
        { who: 1, t: 28, text: 'O quanto as pessoas querem organizar por projeto, não por tipo de arquivo.' },
        { who: 0, t: 41, text: 'Faz sentido. Isso conversa direto com a nova navegação de pastas.' },
        { who: 1, t: 52, text: 'Sim! Também queria falar sobre crescer para a liderança do squad no próximo ciclo.' },
        { who: 0, t: 66, text: 'Vamos montar um plano juntos. Te mando uma proposta até sexta.' },
        { who: 1, t: 78, text: 'Perfeito, obrigada!' },
      ]
    : [
        { who: 0, t: 0, text: 'Bom dia, pessoal! Vamos começar pelo status do lançamento.' },
        { who: 2, t: 8, text: 'O build da versão 4.0 está estável. Faltam só os ajustes de modo escuro.' },
        { who: 1, t: 19, text: 'Do lado de design, os fluxos de Vídeos e Áudio estão fechados.' },
        { who: 3, t: 31, text: 'Marketing precisa das telas finais até quarta para a campanha.' },
        { who: 0, t: 42, text: 'Consigo garantir quarta. Rafael, o modo escuro fecha até lá?' },
        { who: 2, t: 51, text: 'Fecha sim, se a gente congelar o escopo hoje.' },
        { who: 1, t: 60, text: 'Concordo. Qualquer pedido novo vai para o próximo ciclo.' },
        { who: 3, t: 71, text: 'Combinado. Vou alinhar a data da campanha com o time comercial.' },
        { who: 0, t: 83, text: 'Fechado: escopo congelado, telas na quarta, lançamento na segunda quinzena.' },
        { who: 2, t: 95, text: 'Vou abrir as tarefas no board ainda hoje.' },
      ]
  return {
    title,
    date: '16 de outubro de 2026',
    time: '10:00 às 10:02',
    dur: oneOnOne ? 86 : 104,
    platform: 'Google Meet',
    link: 'meet.google.com/abc-defg-hij',
    people,
    summary: oneOnOne
      ? [
          'Conversa de acompanhamento entre Kauê e Marina. Marina apresentou os aprendizados da pesquisa com clientes da Biblioteca: as pessoas preferem organizar arquivos por projeto, o que reforça a nova navegação de pastas.',
          'Marina também trouxe o interesse em assumir a liderança do squad no próximo ciclo, e os dois combinaram montar um plano de desenvolvimento juntos.',
        ]
      : [
          'Alinhamento do lançamento da versão 4.0. O build está estável e os fluxos de Vídeos e Áudio foram concluídos pelo design; restam os ajustes de modo escuro.',
          'Para cumprir o prazo da campanha de marketing, o time decidiu congelar o escopo hoje e mover pedidos novos para o próximo ciclo.',
        ],
    decisions: oneOnOne
      ? ['Priorizar a organização por projeto na Biblioteca.', 'Montar um plano de crescimento para a liderança do squad.']
      : ['Escopo do 4.0 congelado a partir de hoje.', 'Lançamento confirmado para a segunda quinzena de novembro.', 'Pedidos novos entram no próximo ciclo.'],
    actions: oneOnOne
      ? [
          { text: 'Enviar proposta de plano de desenvolvimento', who: 0, due: 'Sex, 23 out' },
          { text: 'Compartilhar o relatório da pesquisa com o time', who: 1, due: 'Seg, 19 out' },
        ]
      : [
          { text: 'Entregar as telas finais para marketing', who: 1, due: 'Qua, 21 out' },
          { text: 'Finalizar os ajustes de modo escuro', who: 2, due: 'Qua, 21 out' },
          { text: 'Alinhar a data da campanha com o comercial', who: 3, due: 'Seg, 19 out' },
          { text: 'Abrir as tarefas do lançamento no board', who: 2, due: 'Hoje' },
        ],
    lines,
    topics: oneOnOne
      ? [['Pesquisa com clientes', 45], ['Carreira', 35], ['Biblioteca', 20]]
      : [['Lançamento 4.0', 40], ['Modo escuro', 25], ['Campanha', 20], ['Escopo', 15]],
    sentiment: [68, 27, 5],
  }
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const fmtTime = (s: number) => {
  const t = Math.max(0, Math.floor(s))
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
