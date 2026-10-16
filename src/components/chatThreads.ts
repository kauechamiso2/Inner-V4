import type { ChatMsg } from './ChatHome'

/* conteúdo placeholder de cada conversa do histórico: só para demonstrar a
   interação com o agente (pedido do usuário + resposta estruturada) */
export function placeholderThread(title: string, project?: string | null): ChatMsg[] {
  const topic = title.charAt(0).toLowerCase() + title.slice(1)
  const where = project ? ` do projeto ${project}` : ''
  return [
    { id: 1, role: 'user', text: `Me ajuda com ${topic}?` },
    {
      id: 2,
      role: 'agent',
      restored: true,
      blocks: [
        { kind: 'p', text: `Claro! Montei um primeiro rascunho para **${title}**${where}:` },
        {
          kind: 'ul',
          items: [
            '**Objetivo:** o que precisa ficar claro no resultado final',
            '**Pontos de atenção:** riscos, dependências e prazos',
            '**Próximos passos:** o que eu já consigo adiantar agora',
          ],
        },
        { kind: 'p', text: 'Quer que eu aprofunde algum desses pontos ou siga direto pra versão final?' },
      ],
    },
    { id: 3, role: 'user', text: 'Pode seguir para a versão final.' },
    {
      id: 4,
      role: 'agent',
      restored: true,
      blocks: [
        { kind: 'p', text: 'Pronto! Aqui está a versão final, já organizada e revisada.' },
        { kind: 'p', text: 'Se quiser, posso transformar isso em documento, apresentação ou loop.' },
      ],
    },
  ] as ChatMsg[]
}
