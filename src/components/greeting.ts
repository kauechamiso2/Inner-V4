/* saudação por período do dia (pt-BR) + nome do usuário (protótipo).
   Compartilhada pelo painel da Home e pelas respostas do agente. */
export const USER_NAME = 'Kauê'

export function greetingFor(d = new Date()): string {
  const h = d.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
