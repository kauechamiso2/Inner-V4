/* Projetos reais do protótipo — compartilhados entre o submenu do @ e a página
   de Projetos. São os mesmos dois espaços de trabalho da Biblioteca antiga. */
export type Project = {
  id: string
  name: string
  sub: string
  emoji: string
  color: string
}

export const PROJECTS: Project[] = [
  {
    id: 'col-hr',
    name: 'HR Stuff',
    sub: 'Documentos, políticas e processos de RH da empresa',
    emoji: '🧑‍💼',
    color: '#3E63C4',
  },
  {
    id: 'col-mkt',
    name: 'Marketing & Conteúdo',
    sub: 'Calendário, campanhas e produção de conteúdo da marca',
    emoji: '📣',
    color: '#F0603A',
  },
]
