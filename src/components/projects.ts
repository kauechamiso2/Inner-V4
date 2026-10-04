/* Projetos fake — compartilhados entre o submenu do @ e o menu da sidebar.
   Apenas para demonstração. */
export type Project = { id: string; name: string; sub: string }

export const PROJECTS: Project[] = [
  { id: 'p-rebrand', name: 'Rebranding 2026', sub: '24 arquivos · editado há 2h' },
  { id: 'p-verao', name: 'Campanha de Verão', sub: '12 arquivos · ontem' },
  { id: 'p-site', name: 'Site Institucional', sub: '38 arquivos · há 3 dias' },
  { id: 'p-v4', name: 'Lançamento V4', sub: '56 arquivos · há 3 dias' },
  { id: 'p-linkedin', name: 'Conteúdo LinkedIn', sub: '19 arquivos · há 5 dias' },
  { id: 'p-mercado', name: 'Pesquisa de Mercado', sub: '7 arquivos · há 1 semana' },
  { id: 'p-app', name: 'App Mobile', sub: '42 arquivos · há 1 semana' },
  { id: 'p-latam', name: 'Expansão LATAM', sub: '15 arquivos · há 2 semanas' },
]
