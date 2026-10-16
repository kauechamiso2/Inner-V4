import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './images-page.css'
import './prompts-page.css'
import searchIcon from '../assets/search-light.svg'
import { Check, Copy, CopyPlus, Lock, MoreHorizontal, Trash2, Users } from 'lucide-react'
import { SmallModal } from './ChatModals'
import Dropdown from './Dropdown'
import type { DropdownOption } from './Dropdown'
import { allProjectEntries } from './projectStore'
import { normSearch } from './SearchToggle'
import './context-modal.css'
import './site-modals.css'
import './tasks-page.css'
import { PromptsPillarIcon } from './SidebarIcons'

/* prompts criados pelo usuário ficam em "Meus prompts" */
const MINE = 'Meus prompts'
const CATEGORIES = [
  'Todos',
  'Gestão',
  'Marketing',
  'Vendas',
  'Atendimento',
  'RH',
  'Jurídico',
  'Financeiro',
  'Conteúdo',
  'Produto',
]

export type Prompt = { id: string; name: string; desc: string; category: string; body?: string }

export const PROMPTS: Prompt[] = [
  { id: 'g1', name: 'Estruturação de Programa de Mentoria', desc: 'Crie um programa de mentoria corporativa completo com critérios de seleção, estrutura de encontros, objetivos mensuráveis, métricas de acompanhamento e formas de reconhecimento.', category: 'Gestão' },
  { id: 'g2', name: 'Engajamento de equipe', desc: 'Receba estratégias práticas de motivação com dinâmicas em grupo e competições saudáveis para aumentar o engajamento da sua equipe.', category: 'Gestão' },
  { id: 'g3', name: 'Avaliação de Desempenho de Equipe', desc: 'Crie uma avaliação de desempenho personalizada com base em competências técnicas, comportamentais e entrega de metas, com escala e plano de desenvolvimento.', category: 'Gestão' },
  { id: 'g4', name: 'Avaliação de eficiência', desc: 'Receba indicadores de eficiência para atendimento e logística com médias de mercado e estratégias práticas para melhorar cada KPI na sua empresa.', category: 'Gestão' },
  { id: 'g5', name: 'Desenvolvimento de Matriz de Riscos Estratégicos', desc: 'Monte uma matriz de riscos estratégicos com 10 riscos classificados por impacto e probabilidade, incluindo planos de mitigação para apoiar decisões críticas.', category: 'Gestão' },
  { id: 'g6', name: 'Definição de Diferenciação de Mercado', desc: 'Crie textos de posicionamento que destacam seus diferenciais competitivos e receba 2 sugestões estratégicas para superar concorrentes em áreas ainda não exploradas.', category: 'Gestão' },
  { id: 'g7', name: 'Definição de KPIs Estratégicos', desc: 'Defina 5 KPIs para objetivos de curto e longo prazo da equipe, com orientações claras sobre como medir e acompanhar cada indicador.', category: 'Gestão' },
  { id: 'g8', name: 'Diagnóstico de Processos', desc: 'Avalie processos internos da sua equipe com KPIs específicos e receba sugestões de melhorias para curto, médio e longo prazo.', category: 'Gestão' },
  { id: 'g9', name: 'Recompensas e Reconhecimentos', desc: 'Crie um programa de recompensas com prêmios mensais e anuais em diferentes formatos (financeiros, experiências, formação), incluindo sugestões de comunicação.', category: 'Gestão' },
  { id: 'g10', name: 'Avaliação de desempenho', desc: 'Crie um modelo de avaliação de desempenho com escala de 1 a 5 baseado em critérios definidos, incluindo periodicidade ideal e forma de devolutiva.', category: 'Gestão' },
  { id: 'g11', name: 'Campanha de recuperação via e-mail', desc: 'Escreva um e-mail persuasivo com saudação, corpo e oferta personalizada para reconquistar clientes inativos com base na última compra.', category: 'Gestão' },
  { id: 'g12', name: 'Feedback Automático Pós Compra', desc: 'Crie um inquérito pós-compra com 5 perguntas em escala de 1 a 5 para avaliar a experiência do cliente, junto com instruções de implementação e análise.', category: 'Gestão' },
  { id: 'g13', name: 'Programa de Fidelização Inovador', desc: 'Crie um programa de fidelização com pontos ou níveis e benefícios claros para aumentar a recorrência de compra, incluindo estratégia de comunicação.', category: 'Gestão' },
  { id: 'g14', name: 'Pauta para webinar', desc: 'Crie a estrutura completa de um webinar com introdução, tópicos-chave, perguntas esperadas do público e canais ideais de comunicação.', category: 'Gestão' },
  { id: 'g15', name: 'Metas trimestrais', desc: 'Defina uma meta de vendas realista para o próximo trimestre com base no desempenho anterior e receba um plano de incentivo alinhado à cultura da equipe.', category: 'Gestão' },
  { id: 'g16', name: 'Mapa de objeções', desc: 'Identifique objeções comuns ao seu produto com base no perfil do cliente e receba respostas estratégicas em formato de tabela para contorná-las.', category: 'Gestão' },
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

/* texto completo do prompt (o mesmo do menu @ do chat). As {{variáveis}}
   viram chips no input para a pessoa preencher antes de enviar; nos
   prompts criados aqui, [colchetes] também viram variáveis. */
export const promptBody = (p: Prompt) =>
  p.body
    ? p.body.replace(/\[([^\]]+)\]/g, '{{$1}}')
    : `Você é um especialista em ${(p.category === 'RH' ? 'Recursos Humanos' : p.category).toLowerCase()} com ampla experiência, atuando na empresa {{empresa}}.\n\n` +
      `${p.desc}\n\n` +
      `Seu objetivo é {{objetivo}}. Considere que o público é {{público}} e use um tom {{tom de voz}}.`

const SKELETON_MS = 850

/* mostra as {{variáveis}} do prompt como chips (igual ao input do chat) */
function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
        part.startsWith('{{') ? (
          <mark key={i} className="pp-var">
            {part.slice(2, -2)}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export default function PromptsPage({ onUse }: { onUse?: (text: string) => void }) {
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Todos')
  const [query, setQuery] = useState('')
  const [prompts, setPrompts] = useState<Prompt[]>(PROMPTS)
  const [view, setView] = useState<Prompt | null>(null)
  const [creating, setCreating] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const toastTimer = useRef<number>()
  const showToast = (text: string) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text })
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(t)
  }, [])

  /* fecha o menu "..." ao clicar fora */
  useEffect(() => {
    if (!menu) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.pp-menu-wrap')) setMenu(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [menu])

  const nq = normSearch(query)
  const list = prompts.filter(
    (p) => (category === 'Todos' || p.category === category) && (!nq || normSearch(`${p.name} ${p.desc}`).includes(nq)),
  )

  const copy = (p: Prompt) => {
    try {
      navigator.clipboard?.writeText(promptBody(p))
    } catch {
      /* clipboard indisponível */
    }
    showToast('Prompt copiado')
  }
  const duplicate = (p: Prompt) => {
    const copyOf = { ...p, id: `${p.id}-c${Date.now()}`, name: `${p.name} (cópia)`, body: promptBody(p) }
    setPrompts((list) => {
      const i = list.findIndex((x) => x.id === p.id)
      return [...list.slice(0, i + 1), copyOf, ...list.slice(i + 1)]
    })
    showToast('Prompt duplicado')
  }
  const remove = (p: Prompt) => {
    setPrompts((list) => list.filter((x) => x.id !== p.id))
    showToast('Prompt excluído')
  }

  return (
    <main className="images-page prompts-page">
      <button className="pp-cta" type="button" onClick={() => setCreating(true)}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Novo prompt
      </button>
      <div className="ip-container pp-container">
        <h1 className="ip-title">Prompts</h1>

        <label className="ip-search">
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input type="text" placeholder="Buscar prompts" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>

        <div className="ip-categories">
          {(prompts.some((p) => p.category === MINE) ? [CATEGORIES[0], MINE, ...CATEGORIES.slice(1)] : CATEGORIES).map((c) => (
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

        <div className="pp-grid" key={`${category}-${nq}`}>
          {loading
            ? PROMPTS.slice(0, 8).map((p, i) => (
                <div className="prompt-card is-skeleton" key={p.id} style={{ '--i': i } as CSSProperties}>
                  <div className="prompt-icon sk-base" />
                  <div className="sk-base sk-title" />
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
                  <article className={`prompt-card${menu === p.id ? ' has-menu' : ''}`} key={p.id} style={{ '--i': Math.min(i, 16) } as CSSProperties}>
                    <span className="pp-menu-wrap">
                      <button
                        type="button"
                        className={`prompt-more${menu === p.id ? ' is-open' : ''}`}
                        aria-label="Ações do prompt"
                        aria-haspopup="menu"
                        aria-expanded={menu === p.id}
                        onClick={() => setMenu((m) => (m === p.id ? null : p.id))}
                      >
                        <MoreHorizontal size={18} strokeWidth={2} />
                      </button>
                      {menu === p.id && (
                        <div className="task-menu pp-menu" role="menu">
                          <button type="button" role="menuitem" className="task-menu-item" onClick={() => (setMenu(null), copy(p))}>
                            <Copy size={15} strokeWidth={1.9} />
                            Copiar prompt
                          </button>
                          <button type="button" role="menuitem" className="task-menu-item" onClick={() => (setMenu(null), duplicate(p))}>
                            <CopyPlus size={15} strokeWidth={1.9} />
                            Duplicar
                          </button>
                          <button type="button" role="menuitem" className="task-menu-item is-danger" onClick={() => (setMenu(null), remove(p))}>
                            <Trash2 size={15} strokeWidth={1.9} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </span>
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
                    <p className="prompt-desc">{p.desc}</p>
                    <div className="prompt-actions">
                      <button type="button" className="prompt-btn is-primary" onClick={() => onUse?.(promptBody(p))}>
                        Usar
                      </button>
                      <button type="button" className="prompt-btn is-secondary" onClick={() => setView(p)}>
                        Visualizar
                      </button>
                    </div>
                  </article>
                )
              })}
        </div>
        {!loading && list.length === 0 && <p className="vg-empty">Nenhum prompt encontrado.</p>}
      </div>

      {view && (
        <SmallModal
          title={view.name}
          onClose={() => setView(null)}
          footer={
            <div className="pp-view-foot">
              <button type="button" className="pp-copy" onClick={() => copy(view)}>
                <Copy size={15} strokeWidth={2} />
                Copiar
              </button>
              <button
                type="button"
                className="instr-save"
                onClick={() => {
                  const text = promptBody(view)
                  setView(null)
                  onUse?.(text)
                }}
              >
                Usar prompt
              </button>
            </div>
          }
        >
          <div className="pp-view">
            <p className="pp-view-desc">{view.desc}</p>
            <div className="pp-view-body">
              <PromptText text={promptBody(view)} />
            </div>
            <p className="pp-view-hint">Os campos destacados você completa no chat antes de enviar.</p>
          </div>
        </SmallModal>
      )}

      {creating && (
        <NewPromptModal
          onClose={() => setCreating(false)}
          onCreate={(p) => {
            setPrompts((list) => [p, ...list])
            setCategory('Todos')
            setQuery('')
            setCreating(false)
            showToast('Prompt criado')
          }}
        />
      )}

      {toast && (
        <div className="lp-toast is-info" key={toast.id} role="status">
          <Check size={15} strokeWidth={2.4} />
          {toast.text}
        </div>
      )}
    </main>
  )
}

/* ---------- Novo prompt ---------- */
const DESC_MAX = 240

/* quem vê o prompt: só você, a organização ou um projeto */
function visibilityOptions(): DropdownOption[] {
  return [
    { value: 'me', label: 'Apenas eu', icon: <Lock size={15} strokeWidth={1.9} /> },
    { value: 'org', label: 'Minha organização', hint: '70 membros', icon: <Users size={15} strokeWidth={1.9} /> },
    ...allProjectEntries().map((p, i) => ({
      value: p.id,
      label: p.name,
      hint: `${[1, 5, 2, 1, 3, 8][i % 6]} ${[1, 5, 2, 1, 3, 8][i % 6] === 1 ? 'membro' : 'membros'}`,
      icon: p.emoji ? (
        <span className="pp-vis-emoji">{p.emoji}</span>
      ) : (
        <span className="pp-vis-dot" style={{ background: p.color ?? '#c4b5fd' }} />
      ),
    })),
  ]
}

function NewPromptModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Prompt) => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('me')
  const options = visibilityOptions()
  const can = name.trim().length > 0 && desc.trim().length > 0 && body.trim().length > 0
  const create = () => {
    if (!can) return
    onCreate({ id: `u${Date.now()}`, name: name.trim(), desc: desc.trim(), category: MINE, body: body.trim() })
  }
  /* variáveis já escritas nas instruções (prévia dos campos editáveis) */
  const vars = [...new Set([...body.matchAll(/\{\{([^{}\n]+)\}\}/g)].map((m) => m[1].trim()).filter(Boolean))]
  return (
    <SmallModal
      title="Criar prompt"
      onClose={onClose}
      footer={
        <button type="button" className="instr-save" disabled={!can} onClick={create}>
          Criar prompt
        </button>
      }
    >
      <div className="pp-form">
        <label className="pp-field">
          <span className="pp-label">
            Nome do prompt <span className="pp-req">Obrigatório</span>
          </span>
          <span className="ss-field">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: E-mails perfeitos" />
          </span>
        </label>

        <label className="pp-field">
          <span className="pp-label">
            Descrição <span className="pp-req">Obrigatório</span>
          </span>
          <span className="ss-field">
            <input
              value={desc}
              maxLength={DESC_MAX}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex.: Crie e-mails personalizados para qualquer assunto e destinatário"
            />
          </span>
          <span className={`pp-count${desc.length >= DESC_MAX ? ' is-max' : ''}`}>
            {desc.length}/{DESC_MAX}
          </span>
        </label>

        <label className="pp-field">
          <span className="pp-label">
            Instruções <span className="pp-req">Obrigatório</span>
          </span>
          <span className="pp-help">
            Use <code>{'{{ }}'}</code> para criar campos editáveis no seu prompt
          </span>
          <textarea
            className="pp-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ex.: Escreva um e-mail sobre {{assunto}} para {{destinatário}}"
            rows={5}
          />
          {vars.length > 0 && (
            <span className="pp-vars" aria-label="Campos editáveis">
              {vars.map((v) => (
                <mark key={v} className="pp-var">
                  {v}
                </mark>
              ))}
            </span>
          )}
        </label>

        <div className="pp-field">
          <span className="pp-label">Visibilidade</span>
          <Dropdown value={visibility} onChange={setVisibility} ariaLabel="Visibilidade" options={options} />
        </div>
      </div>
    </SmallModal>
  )
}
