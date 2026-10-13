import type { Suggestion } from './NovaTarefaModal'

/* ideias de tarefa (abaixo do input com @Tarefa): clicar preenche o input */
export const TASK_SUGGESTIONS: Suggestion[] = [
  {
    emoji: '📨',
    title: 'Fica de olho nos e-mails',
    desc: 'Resuma meus e-mails importantes todas as manhãs às 8h',
  },
  {
    emoji: '📊',
    title: 'Me mantém no controle dos números',
    desc: 'Toda sexta, me traga um resumo dos resultados da semana',
  },
  {
    emoji: '📰',
    title: 'Me deixa por dentro do mercado',
    desc: 'Toda segunda, me mande as notícias mais relevantes do meu setor',
  },
  {
    emoji: '✈️',
    title: 'Monitora preços de passagens',
    desc: 'Monitore voos para Miami e me avise quando o preço cair',
  },
]
