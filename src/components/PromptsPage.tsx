import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './prompts-page.css'
import searchIcon from '../assets/search-light.svg'
import { PromptsPillarIcon } from './SidebarIcons'

const CATEGORIES = [
  'Todos',
  'Marketing',
  'Vendas',
  'Atendimento',
  'RH',
  'Jurídico',
  'Financeiro',
  'Conteúdo',
  'Produto',
]

type Prompt = { id: string; name: string; desc: string; category: string }

const PROMPTS: Prompt[] = [
  { id: 'p1', name: 'Reduza o ruído na comunicação de vendas', desc: 'Desenvolva uma estratégia completa de gestão da informação para times de vendas, com foco em reduzir a sobrecarga, melhorar a priorização e acelerar a tomada de decisão.', category: 'Vendas' },
  { id: 'p2', name: 'Plano de conteúdo para 30 dias', desc: 'Crie um calendário editorial completo para um mês, com temas, formatos e chamadas para ação alinhados aos objetivos da campanha e à persona da marca.', category: 'Marketing' },
  { id: 'p3', name: 'Headlines que convertem', desc: 'Gere variações de títulos persuasivos para anúncios e landing pages, testando diferentes gatilhos mentais e tons de voz para maximizar a taxa de clique.', category: 'Marketing' },
  { id: 'p4', name: 'Script de prospecção fria', desc: 'Monte um roteiro de abordagem para o primeiro contato com leads, com perguntas de qualificação, quebra de objeções e um próximo passo bem definido.', category: 'Vendas' },
  { id: 'p5', name: 'Respostas empáticas para clientes irritados', desc: 'Reescreva mensagens de suporte mantendo a calma e a empatia, reconhecendo o problema, assumindo responsabilidade e oferecendo uma solução concreta.', category: 'Atendimento' },
  { id: 'p6', name: 'Base de conhecimento a partir de tickets', desc: 'Transforme um conjunto de atendimentos recorrentes em artigos de ajuda claros e organizados, prontos para publicar na central de suporte.', category: 'Atendimento' },
  { id: 'p7', name: 'Descrição de vaga atraente', desc: 'Escreva um anúncio de vaga que destaque a cultura da empresa, as responsabilidades e os requisitos, com linguagem inclusiva e foco no candidato ideal.', category: 'RH' },
  { id: 'p8', name: 'Roteiro de entrevista estruturada', desc: 'Crie um guia de perguntas comportamentais e técnicas para avaliar candidatos de forma consistente, com critérios de pontuação para cada competência.', category: 'RH' },
  { id: 'p9', name: 'Resumo de contrato em linguagem simples', desc: 'Explique as cláusulas principais de um contrato em termos claros, destacando prazos, obrigações, penalidades e pontos de atenção para quem não é da área.', category: 'Jurídico' },
  { id: 'p10', name: 'Checklist de conformidade LGPD', desc: 'Gere uma lista de verificação prática para avaliar a adequação de um processo à LGPD, apontando riscos e recomendações de melhoria para cada etapa.', category: 'Jurídico' },
  { id: 'p11', name: 'Análise de fluxo de caixa', desc: 'Interprete os números de entradas e saídas de um período, identifique tendências, aponte riscos de liquidez e sugira ações para equilibrar o caixa.', category: 'Financeiro' },
  { id: 'p12', name: 'E-mail de cobrança cordial', desc: 'Redija uma mensagem de cobrança firme porém respeitosa, lembrando o vencimento, oferecendo opções de pagamento e preservando o relacionamento.', category: 'Financeiro' },
  { id: 'p13', name: 'Artigo de blog otimizado para SEO', desc: 'Produza um texto completo sobre um tema, com estrutura de headings, palavras-chave bem distribuídas, meta descrição e uma chamada para ação final.', category: 'Conteúdo' },
  { id: 'p14', name: 'Roteiro para Reels de 30 segundos', desc: 'Crie um roteiro dinâmico para vídeo curto, com gancho nos primeiros segundos, desenvolvimento objetivo e um encerramento que incentive o engajamento.', category: 'Conteúdo' },
  { id: 'p15', name: 'User stories a partir de uma ideia', desc: 'Transforme uma ideia de funcionalidade em histórias de usuário no formato padrão, com critérios de aceitação claros e prontos para entrar no backlog.', category: 'Produto' },
  { id: 'p16', name: 'Síntese de pesquisa com usuários', desc: 'Resuma entrevistas e feedbacks em insights acionáveis, agrupando dores, oportunidades e padrões de comportamento que orientem as decisões do roadmap.', category: 'Produto' },
  { id: 'p17', name: 'Persona detalhada do cliente', desc: 'Construa um perfil completo do cliente ideal, com dados demográficos, objetivos, dores, objeções e os canais onde ele costuma buscar informação.', category: 'Marketing' },
  { id: 'p18', name: 'Quebra de objeções comuns', desc: 'Liste as principais objeções de compra do seu produto e escreva respostas convincentes para cada uma, com provas, analogias e reforço de valor.', category: 'Vendas' },
  { id: 'p19', name: 'Fluxo de chatbot de primeiro nível', desc: 'Desenhe um fluxo de conversa automatizado para resolver as dúvidas mais frequentes, com caminhos de escalonamento para o atendimento humano.', category: 'Atendimento' },
  { id: 'p20', name: 'Plano de onboarding de 30 dias', desc: 'Monte um cronograma de integração para novos colaboradores, com metas semanais, pessoas-chave, materiais de apoio e checkpoints de acompanhamento.', category: 'RH' },
  { id: 'p21', name: 'Newsletter semanal envolvente', desc: 'Escreva uma edição de newsletter com assunto chamativo, curadoria de conteúdos, comentário editorial e uma seção que estimule a resposta do leitor.', category: 'Conteúdo' },
  { id: 'p22', name: 'Priorização com matriz RICE', desc: 'Avalie uma lista de iniciativas usando alcance, impacto, confiança e esforço, gerando uma ordenação justificada para a próxima sprint do time.', category: 'Produto' },
  { id: 'p23', name: 'Projeção de receita para 12 meses', desc: 'Crie um modelo de projeção de faturamento com cenários otimista, realista e conservador, explicando as premissas por trás de cada estimativa.', category: 'Financeiro' },
  { id: 'p24', name: 'Modelo de NDA bilateral', desc: 'Gere um rascunho de acordo de confidencialidade recíproco, com definições, obrigações, prazo de vigência e exceções, pronto para revisão jurídica.', category: 'Jurídico' },
]

/* alguns prompts foram criados por alguém de uma organização (intercalado) */
const pravatar = (n: number) => `https://i.pravatar.cc/80?img=${n}`
type CreatorInfo = { name: string; avatar: string; org: string }
const CREATED: Record<string, CreatorInfo> = {
  p1: { name: 'Marina Costa', avatar: pravatar(5), org: 'Inner AI' },
  p3: { name: 'Rafael Lima', avatar: pravatar(11), org: 'Squad' },
  p5: { name: 'Camila Rocha', avatar: pravatar(16), org: 'Inner AI' },
  p7: { name: 'Beatriz Souza', avatar: pravatar(20), org: 'Acme' },
  p9: { name: 'Thiago Mendes', avatar: pravatar(25), org: 'Inner AI' },
  p12: { name: 'Ana Martins', avatar: pravatar(32), org: 'Squad' },
  p14: { name: 'Bruno Carvalho', avatar: pravatar(51), org: 'Inner AI' },
  p17: { name: 'Juliana Alves', avatar: pravatar(44), org: 'Acme' },
  p20: { name: 'Lucas Ferreira', avatar: pravatar(59), org: 'Inner AI' },
  p23: { name: 'Letícia Dias', avatar: pravatar(23), org: 'Squad' },
}

const SKELETON_MS = 850

export default function PromptsPage() {
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  const list = category === 'Todos' ? PROMPTS : PROMPTS.filter((p) => p.category === category)

  return (
    <main className="images-page prompts-page">
      <button className="pp-cta" type="button">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Novo prompt
      </button>
      <div className="ip-container pp-container">
        <h1 className="ip-title">Prompts</h1>

        <div className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar prompts" spellCheck={false} />
        </div>

        <div className="ip-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ip-pill${category === c ? ' is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="pp-grid">
          {loading
            ? PROMPTS.slice(0, 8).map((p, i) => (
                <div className="prompt-card is-skeleton" key={p.id} style={{ '--i': i } as CSSProperties}>
                  <div className="prompt-icon sk-base" />
                  <div className="sk-base sk-title" />
                  <div className="sk-base sk-meta" />
                  <div className="prompt-desc-sk">
                    <div className="sk-base sk-line" />
                    <div className="sk-base sk-line" />
                    <div className="sk-base sk-line short" />
                  </div>
                </div>
              ))
            : list.map((p, i) => {
                const created = CREATED[p.id]
                return (
                  <article className="prompt-card" key={p.id} style={{ '--i': i } as CSSProperties}>
                    <span className="prompt-icon-wrap">
                      <span className="prompt-icon" aria-hidden="true">
                        <PromptsPillarIcon size={20} color="var(--prompt-accent)" />
                      </span>
                      {created && (
                        <span className="prompt-creator" tabIndex={0} aria-label={`Criado por ${created.name}`}>
                          <img src={created.avatar} alt="" loading="lazy" />
                          <span className="pill-tooltip prompt-creator-tip" role="tooltip" aria-hidden="true">
                            Criado por {created.name}
                          </span>
                        </span>
                      )}
                    </span>
                    <h3 className="prompt-name">{p.name}</h3>
                    <div className="prompt-meta">
                      <span className="prompt-cat">{p.category}</span>
                      {created && <span className="prompt-org">{created.org}</span>}
                    </div>
                    <p className="prompt-desc">{p.desc}</p>
                    <div className="prompt-actions">
                      <button type="button" className="prompt-btn is-primary">
                        Usar
                      </button>
                      <button type="button" className="prompt-btn is-secondary">
                        Visualizar
                      </button>
                    </div>
                  </article>
                )
              })}
        </div>
      </div>
    </main>
  )
}
