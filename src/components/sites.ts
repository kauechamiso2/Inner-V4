import type { Suggestion } from './NovaTarefaModal'

/* site criado pelo agente no chat (rascunho, ainda não publicado) */
export type SiteDraft = {
  id: string
  name: string
  url: string
  /* prévia estática (sites de exemplo); sem ela, o drawer mostra o portfólio gerado */
  thumb?: string
  /* já está no ar (público ou com link) */
  published?: boolean
}

export const PORTFOLIO_SITE: SiteDraft = {
  id: 'portfolio-do-kaue',
  name: 'Portfólio do Kauê',
  url: 'portfolio.kaue.innerai.site',
}

/* ideias de site (abaixo do input com @Site): clicar preenche o input */
export const SITE_SUGGESTIONS: Suggestion[] = [
  {
    emoji: '🍽️',
    title: 'Cardápio virtual',
    desc: 'Um cardápio digital do meu restaurante, com fotos dos pratos, preços e pedido pelo WhatsApp',
  },
  {
    emoji: '🎨',
    title: 'Portfólio',
    desc: 'Um site de portfólio pra mostrar meus projetos, com uma página sobre mim e contato',
  },
  {
    emoji: '🚀',
    title: 'Landing page de produto',
    desc: 'Uma landing page pro meu produto, com benefícios, depoimentos e lista de espera',
  },
  {
    emoji: '💍',
    title: 'Convite de casamento',
    desc: 'Um site pro nosso casamento, com a nossa história, local, data e confirmação de presença',
  },
]

/* o usuário digita curto ("portfolio pessoal") e a mensagem chega polida
   no chat ("Quero criar um site de portfolio pessoal") */
export function polishSiteRequest(raw: string) {
  const text = raw.trim().replace(/[.!]+$/, '')
  const lower = text.charAt(0).toLowerCase() + text.slice(1)
  if (/^(quero|queria|gostaria|preciso|crie|cria|criar|faça|faz|me ajuda|monte|monta)\b/i.test(text)) return text
  if (/^(um|uma)\s/i.test(text)) return `Quero criar ${lower}`
  if (/^site\b/i.test(text)) return `Quero criar um ${lower}`
  return `Quero criar um site de ${lower}`
}

