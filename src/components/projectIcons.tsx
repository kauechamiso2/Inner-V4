/* Ícones de projeto = emojis nativos do sistema (no Mac/iPhone aparecem como
   os emojis da Apple). keywords: busca em português */
export const PROJECT_ICONS: { id: string; keywords: string }[] = [
  { id: '📁', keywords: 'pasta geral arquivos' },
  { id: '💼', keywords: 'trabalho negócios empresa' },
  { id: '💰', keywords: 'dinheiro finanças vendas custo' },
  { id: '📊', keywords: 'gráfico métricas dados relatório' },
  { id: '📈', keywords: 'crescimento resultados vendas' },
  { id: '🎯', keywords: 'meta objetivo okr' },
  { id: '🚀', keywords: 'lançamento startup produto' },
  { id: '💡', keywords: 'ideia brainstorm inovação' },
  { id: '📣', keywords: 'marketing campanha anúncio' },
  { id: '🎨', keywords: 'arte design cores marca branding' },
  { id: '✏️', keywords: 'escrita lápis edição' },
  { id: '📝', keywords: 'notas anotações documento' },
  { id: '📚', keywords: 'livros estudo leitura documentação' },
  { id: '🎓', keywords: 'educação curso escola faculdade' },
  { id: '💻', keywords: 'código dev programação tecnologia' },
  { id: '🧪', keywords: 'ciência pesquisa laboratório teste' },
  { id: '🧠', keywords: 'cérebro pensamento estratégia' },
  { id: '⚖️', keywords: 'jurídico contrato lei' },
  { id: '🧑‍💼', keywords: 'pessoas rh recursos humanos' },
  { id: '👥', keywords: 'time equipe pessoas clientes' },
  { id: '🤝', keywords: 'parceria acordo cliente' },
  { id: '🏢', keywords: 'empresa escritório imóvel' },
  { id: '🏠', keywords: 'casa pessoal família' },
  { id: '✈️', keywords: 'viagem avião férias' },
  { id: '🌎', keywords: 'mundo internacional global web' },
  { id: '🏖️', keywords: 'praia férias descanso' },
  { id: '🍽️', keywords: 'comida restaurante receita' },
  { id: '☕️', keywords: 'café rotina' },
  { id: '🛍️', keywords: 'compras loja ecommerce' },
  { id: '🎁', keywords: 'presente evento festa' },
  { id: '🎉', keywords: 'festa evento comemoração' },
  { id: '📷', keywords: 'foto câmera conteúdo' },
  { id: '🎬', keywords: 'vídeo filme cinema' },
  { id: '🎵', keywords: 'música áudio som' },
  { id: '🎮', keywords: 'jogo game diversão' },
  { id: '🏋️', keywords: 'academia treino exercício esporte' },
  { id: '🩺', keywords: 'saúde médico clínica' },
  { id: '🌱', keywords: 'natureza sustentabilidade crescimento' },
  { id: '🐾', keywords: 'pet animal cachorro gato' },
  { id: '🔧', keywords: 'ferramenta manutenção suporte' },
  { id: '⭐️', keywords: 'favorito estrela destaque' },
  { id: '❤️', keywords: 'coração pessoal favorito' },
]

/* cores do projeto (refletem no gradiente do projeto e do chat) */
export const PROJECT_COLORS = [
  '#1c1c1c',
  '#E5484D',
  '#F76B15',
  '#F5B300',
  '#30A46C',
  '#0D74E7',
  '#8E4EC6',
  '#E93D82',
]

/* emoji do projeto */
export function ProjectGlyph({ icon, emoji, size = 20 }: { icon?: string; emoji?: string; size?: number }) {
  return (
    <span className="proj-glyph" style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">
      {icon ?? emoji ?? '📁'}
    </span>
  )
}
