import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  Check,
  ChevronRight,
  Copy,
  Globe,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Share,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import ChatComposer from './ChatComposer'
import QuestionCard from './QuestionCard'
import type { Question, QuestionAnswer } from './QuestionCard'
import { USER_NAME, greetingFor } from './greeting'
import { AgendadoIcon } from './SidebarIcons'
import type { Task } from './tasks'
import { PORTFOLIO_SITE } from './sites'
import type { SiteDraft } from './sites'
import type { ActiveProject } from '../App'
import type { ChosenAgent } from './agents'

type InputMode = 'agente' | 'chat'

/* resposta do agente em blocos (parágrafos e listas); **texto** vira negrito */
type Block = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }

type Msg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'agent'; blocks: Block[]; task?: Task; site?: SiteDraft; restored?: boolean }
/* conversa salva (ex.: chat onde o site foi criado) para reabrir em "Editar" */
export type ChatMsg = Msg
type AgentMsg = Extract<Msg, { role: 'agent' }>

/* tempo de "pensando" antes da resposta mockada aparecer */
const THINK_MS = 1000
/* fade da saudação antes do layout virar conversa */
const LEAVE_MS = 180
/* stream da resposta: intervalo entre palavras, pausa entre blocos e o fade de
   cada palavra (repassados ao CSS por variáveis, fonte única de verdade) */
const WORD_MS = 30
const BLOCK_MS = 260
const WORD_FADE_MS = 380

const plain = (text: string) => text.replace(/\*\*/g, '')
const wordsOf = (text: string) =>
  text.split('**').flatMap((part) => part.split(/\s+/).filter(Boolean))

/* duração total do stream de uma resposta (até a última palavra assentar) */
function streamMs(blocks: Block[]) {
  const words = blocks.reduce(
    (n, b) =>
      n +
      (b.kind === 'p'
        ? wordsOf(b.text).length
        : b.items.reduce((m, item) => m + wordsOf(item).length, 0)),
    0,
  )
  return Math.max(0, words - 1) * WORD_MS + Math.max(0, blocks.length - 1) * BLOCK_MS + WORD_FADE_MS
}

/* blocos com cada palavra num span indexado (--w) e cada bloco com --b:
   o CSS escalona a entrada palavra a palavra, com pausa entre blocos */
function renderBlocks(blocks: Block[]): ReactNode[] {
  let n = 0
  const words = (text: string) =>
    text.split('**').map((part, pi) => {
      const toks = part.split(/(\s+)/).map((tok, ti) => {
        if (!tok) return null
        if (/^\s+$/.test(tok)) return tok
        return (
          <span className="sw" key={ti} style={{ '--w': n++ } as CSSProperties}>
            {tok}
          </span>
        )
      })
      return pi % 2 ? <strong key={pi}>{toks}</strong> : <Fragment key={pi}>{toks}</Fragment>
    })
  return blocks.map((b, bi) =>
    b.kind === 'p' ? (
      <p key={bi} style={{ '--b': bi } as CSSProperties}>
        {words(b.text)}
      </p>
    ) : (
      <ul key={bi} style={{ '--b': bi } as CSSProperties}>
        {b.items.map((item, ii) => (
          /* --w0: o marcador do item aparece junto com a 1ª palavra dele */
          <li key={ii} style={{ '--w0': n } as CSSProperties}>
            {words(item)}
          </li>
        ))}
      </ul>
    ),
  )
}

/* resposta mockada: o agente alinha o foco antes de executar (protótipo) */
function mockReply(text: string): Block[] {
  const short = text.length > 72 ? `${text.slice(0, 72).trim()}...` : text
  return [
    { kind: 'p', text: `Entendi: **${short}**. Para eu acertar de primeira, me confirma alguns pontos:` },
    {
      kind: 'ul',
      items: [
        '**Objetivo final:** um resumo rápido, uma análise completa ou algo pronto para enviar?',
        '**Fontes:** tem algum arquivo, projeto ou base de conhecimento que eu deva usar como referência?',
        '**Formato:** prefere que eu já execute e traga o resultado, ou que eu mostre um plano antes?',
      ],
    },
    { kind: 'p', text: 'Me diz o foco e eu já começo.' },
  ]
}

/* ---------- Cenário mockado: "Monitorar voos Miami" ---------- */

const isFlightTask = (text: string) => /voo/i.test(text) && /miami/i.test(text)

const FLIGHT_QUESTIONS: Question[] = [
  {
    question: 'Qual a data da sua viagem?',
    options: ['Nos próximos 7 dias', 'Nos próximos 15 dias', 'No próximo mês', 'Ainda não sei'],
  },
  {
    question: 'Qual o aeroporto de embarque?',
    options: [
      'Aeroporto Internacional de Guarulhos (GRU)',
      'Aeroporto Internacional de Viracopos (VCP)',
      'Aeroporto Internacional de São Carlos (QSC)',
      'Qualquer um',
    ],
  },
  {
    question: 'Qual a frequência você quer receber o monitoramento dos voos pra Miami?',
    options: ['Duas vezes ao dia', 'Uma vez ao dia', 'Uma vez na semana', 'A cada 15 dias'],
  },
]

const flightIntro = (): Block[] => [
  { kind: 'p', text: `${greetingFor()}, ${USER_NAME}!` },
  { kind: 'p', text: 'Claro, vou monitorar voos pra Miami, FL pra você!' },
]

/* frequência efetiva: se o usuário pular, o agente assume uma vez ao dia */
const flightFrequency = (answers: QuestionAnswer[]) => answers[2] || 'Uma vez ao dia'

/* tarefa agendada criada a partir das respostas (vira widget e card em Ativas) */
/* origem e período em linguagem de instrução, a partir das respostas */
const ORIGINS: Record<string, string> = {
  'Aeroporto Internacional de Guarulhos (GRU)': 'saindo de Guarulhos, São Paulo (GRU)',
  'Aeroporto Internacional de Viracopos (VCP)': 'saindo de Viracopos, Campinas (VCP)',
  'Aeroporto Internacional de São Carlos (QSC)': 'saindo de São Carlos (QSC)',
}
const PERIODS: Record<string, string> = {
  'Nos próximos 7 dias': 'Considere viagens com ida nos próximos 7 dias.',
  'Nos próximos 15 dias': 'Considere viagens com ida nos próximos 15 dias.',
  'No próximo mês': 'Considere viagens com ida no próximo mês.',
}

function flightDescription(answers: QuestionAnswer[]) {
  const from = answers[1]
    ? ORIGINS[answers[1]] ?? (answers[1] === 'Qualquer um' ? 'saindo de São Paulo (considere GRU, CGH e VCP)' : `saindo de ${answers[1]}`)
    : 'saindo de São Paulo (considere GRU, CGH e VCP)'
  const when = answers[0]
    ? PERIODS[answers[0]] ??
      (answers[0] === 'Ainda não sei'
        ? 'Como ainda não há datas definidas, procure oportunidades futuras com datas variadas e destaque a necessidade de confirmar o período.'
        : `Considere o período informado: ${answers[0]}.`)
    : 'Como ainda não há datas definidas, procure oportunidades futuras com datas variadas e destaque a necessidade de confirmar o período.'
  return `Pesquise passagens aéreas de ida e volta ${from} para Miami, Flórida (MIA). Identifique promoções e quedas de preço realmente relevantes em relação às tarifas usuais, informando datas, companhia aérea, aeroportos, preço total e link da oferta verificável. Notifique somente se houver oportunidade especialmente boa; caso contrário, não envie alerta. ${when}`
}

function flightTask(answers: QuestionAnswer[]): Task {
  return {
    id: `voos-miami-${Date.now()}`,
    name: 'Monitoramento de voos pra Miami, FL',
    emoji: '✈️',
    color: '#2563B8',
    recurring: true,
    schedule: flightFrequency(answers),
    next: 'Hoje, 18:00',
    last: null,
    description: flightDescription(answers),
    timezone: 'America/Sao_Paulo',
  }
}

function flightConfirm(answers: QuestionAnswer[]): Block[] {
  const val = (i: number) => (i === 2 ? flightFrequency(answers) : answers[i] || 'Sem preferência')
  return [
    { kind: 'p', text: 'Perfeito! Já deixei o monitoramento configurado:' },
    {
      kind: 'ul',
      items: [
        '**Destino:** Miami, FL',
        `**Data da viagem:** ${val(0)}`,
        `**Embarque:** ${val(1)}`,
        `**Frequência:** ${val(2)}`,
      ],
    },
    {
      kind: 'p',
      text: 'Vou acompanhar os preços e te aviso por aqui sempre que aparecer uma boa oportunidade.',
    },
  ]
}

/* ---------- Cenário mockado: "Novo site" de portfólio ---------- */

const isPortfolioSite = (text: string) => /portf[oó]lio/i.test(text)

const siteIntro = (): Block[] => [
  { kind: 'p', text: `Certo, ${USER_NAME}!` },
  { kind: 'p', text: 'Vamos criar seu site de portfólio.' },
  { kind: 'p', text: 'Você já tem os projetos que você quer expor?' },
  { kind: 'p', text: 'Pode me enviar em documento, foto, pdf... como tiver aí!' },
]

const siteConfirm = (): Block[] => [
  {
    kind: 'p',
    text: 'Sem problemas! Vou criar projetos fictícios para a primeira versão do seu site e depois a gente troca pelos seus, pode ser?',
  },
]

/* ---------- Mensagem do agente (stream + ações) ---------- */

function AgentMessage({
  msg,
  copied,
  onCopy,
  onOpenTask,
  onOpenSite,
  taskEdits,
}: {
  msg: AgentMsg
  copied: boolean
  onCopy: () => void
  onOpenTask?: (task: Task) => void
  onOpenSite?: (site: SiteDraft) => void
  /* edições salvas no modal: o widget mostra sempre a versão atual da tarefa */
  taskEdits?: Record<string, Task>
}) {
  const task = msg.task ? (taskEdits?.[msg.task.id] ?? msg.task) : null
  return (
    <article
      className={`msg-agent${msg.restored ? '' : ' is-stream'}`}
      style={
        {
          '--word-ms': `${WORD_MS}ms`,
          '--block-ms': `${BLOCK_MS}ms`,
          '--word-fade': `${WORD_FADE_MS}ms`,
          '--done': `${streamMs(msg.blocks)}ms`,
        } as CSSProperties
      }
    >
      {renderBlocks(msg.blocks)}
      {/* tarefa criada: widget que abre o drawer da tarefa */}
      {task && (
        <button type="button" className="msg-task" onClick={() => onOpenTask?.(task)}>
          <span className="msg-task-ic" aria-hidden="true">
            <AgendadoIcon size={20} />
          </span>
          <span className="msg-task-text">
            <span className="msg-task-name">{task.name}</span>
            <span className="msg-task-sub">{task.schedule}</span>
          </span>
          <ChevronRight className="msg-task-chev" size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      {/* site criado: widget que abre o drawer com a prévia */}
      {msg.site && (
        <button type="button" className="msg-task" onClick={() => onOpenSite?.(msg.site!)}>
          <span className="msg-task-ic" aria-hidden="true">
            <Globe size={20} strokeWidth={1.8} />
          </span>
          <span className="msg-task-text">
            <span className="msg-task-name">{msg.site.name}</span>
            <span className="msg-task-sub msg-site-sub">
              <Lock size={13} strokeWidth={2.2} aria-hidden="true" />
              Não publicado · Visível apenas pra você
            </span>
          </span>
          <ChevronRight className="msg-task-chev" size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      {/* ações: copiar, avaliar, gerar de novo; compartilhar só no hover */}
      <div className="msg-actions">
        <button
          type="button"
          className="msg-act"
          aria-label={copied ? 'Copiado' : 'Copiar'}
          onClick={onCopy}
        >
          {copied ? <Check size={16} strokeWidth={2.2} /> : <Copy size={16} strokeWidth={2} />}
        </button>
        <button type="button" className="msg-act" aria-label="Boa resposta">
          <ThumbsUp size={16} strokeWidth={2} />
        </button>
        <button type="button" className="msg-act" aria-label="Resposta ruim">
          <ThumbsDown size={16} strokeWidth={2} />
        </button>
        <button type="button" className="msg-act" aria-label="Gerar de novo">
          <RefreshCw size={16} strokeWidth={2} />
        </button>
        <button type="button" className="msg-act is-hover" aria-label="Compartilhar">
          <Share size={16} strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}

export default function ChatHome({
  mode,
  onModeChange,
  project = null,
  onOpenProject,
  onClearProject,
  agent = null,
  intro = false,
  showTabs = true,
  onThreadStart,
  initialMessage = null,
  onInitialMessageSent,
  onTaskCreated,
  onOpenTask,
  onOpenSite,
  onSiteCreated,
  initialThread = null,
  taskEdits,
}: {
  mode: InputMode
  onModeChange: (m: InputMode) => void
  project?: ActiveProject | null
  /* citar um projeto pelo @ ativa o contexto do projeto (gradiente etc.) */
  onOpenProject?: (p: ActiveProject) => void
  /* remover a citação do projeto no input volta ao empty state da Home */
  onClearProject?: () => void
  /* personagem escolhido no onboarding — personaliza a saudação/input */
  agent?: ChosenAgent | null
  /* destaque único de "personalização" ao cair na tela */
  intro?: boolean
  /* abas Agente/Chat do input — ocultadas no redesign */
  showTabs?: boolean
  /* primeira mensagem enviada: o App registra o chat no histórico */
  onThreadStart?: (title: string) => void
  /* mensagem vinda de outra tela (ex.: Nova tarefa em Agendado): enviada ao montar */
  initialMessage?: string | null
  onInitialMessageSent?: () => void
  /* tarefa agendada criada pelo agente (entra em Agendado > Ativas) */
  onTaskCreated?: (task: Task) => void
  /* clique no widget da tarefa: abre o drawer da tarefa */
  onOpenTask?: (task: Task) => void
  /* edições salvas no modal "Editar tarefa" (widget reflete a versão atual) */
  taskEdits?: Record<string, Task>
  /* clique no widget do site criado: abre o drawer com a prévia */
  onOpenSite?: (site: SiteDraft) => void
  /* site criado pelo agente (entra no topo do pilar de Sites) + a conversa até ali */
  onSiteCreated?: (site: SiteDraft, messages: ChatMsg[]) => void
  /* reabre uma conversa salva já em modo conversa, sem animar as respostas */
  initialThread?: ChatMsg[] | null
}) {
  /* conversa: abre ao enviar a primeira mensagem */
  const [messages, setMessages] = useState<Msg[]>(() =>
    (initialThread ?? []).map((m) => (m.role === 'agent' ? { ...m, restored: true } : m)),
  )
  const [thread, setThread] = useState(!!initialThread?.length)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const [leaving, setLeaving] = useState(false)
  const [thinking, setThinking] = useState(false)
  /* rótulo do "pensando" quando o agente está trabalhando (ex.: Construindo site) */
  const [thinkLabel, setThinkLabel] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  /* perguntas do agente: o input vira o card de perguntas enquanto houver */
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const idRef = useRef(Math.max(0, ...(initialThread ?? []).map((m) => m.id)))
  const dockRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  /* FLIP: onde o input estava (centro da Home) antes de descer ao rodapé */
  const dockTopRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), [])

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }

  /* "pensando" e depois a resposta em stream; `after` recebe os blocos para
     encadear o próximo passo depois que o texto assentar */
  const agentSays = (
    blocks: Block[],
    thinkMs: number,
    after?: (b: Block[]) => void,
    task?: Task,
    site?: SiteDraft,
    label?: string,
  ) => {
    setThinking(true)
    setThinkLabel(label ?? null)
    later(() => {
      setThinking(false)
      setMessages((m) => [...m, { id: ++idRef.current, role: 'agent', blocks, task, site }])
      after?.(blocks)
    }, thinkMs)
  }

  /* cenário do site: depois da pergunta sobre os projetos, a próxima
     resposta do usuário (qualquer que seja) gera o rascunho do site */
  const siteStepRef = useRef<'idle' | 'asked' | 'done'>(initialThread ? 'done' : 'idle')

  const reply = (text: string) => {
    if (siteStepRef.current === 'asked') {
      siteStepRef.current = 'done'
      /* "Construindo site" por alguns segundos: dá a sensação de que o site está sendo feito */
      agentSays(
        siteConfirm(),
        5200,
        /* depois do render: a conversa salva já inclui a resposta com o widget */
        () => later(() => onSiteCreated?.(PORTFOLIO_SITE, messagesRef.current), 0),
        undefined,
        PORTFOLIO_SITE,
        'Construindo site',
      )
      return
    }
    if (mode === 'agente' && siteStepRef.current === 'idle' && isPortfolioSite(text)) {
      siteStepRef.current = 'asked'
      agentSays(siteIntro(), 1300)
      return
    }
    if (mode === 'agente' && isFlightTask(text)) {
      /* o agente confirma em dois passos e, quando o texto assenta, o input
         cresce e vira o card de perguntas */
      agentSays(flightIntro(), 1400, (blocks) =>
        later(() => setQuestions(FLIGHT_QUESTIONS), streamMs(blocks) + 450),
      )
      return
    }
    agentSays(mockReply(text), THINK_MS)
  }

  /* respostas enviadas: viram um balão do usuário e o agente confirma */
  const finishQuestions = (answers: QuestionAnswer[] | null) => {
    if (!answers) return
    later(() => {
      const given = answers.filter((a): a is string => !!a)
      setMessages((m) => [
        ...m,
        {
          id: ++idRef.current,
          role: 'user',
          text: given.length ? given.join('\n') : 'Pode seguir sem essas preferências.',
        },
      ])
      /* a tarefa nasce junto com a confirmação: widget no chat + card em Ativas */
      const task = flightTask(answers)
      later(() => agentSays(flightConfirm(answers), 1200, () => onTaskCreated?.(task), task), 320)
    }, 240)
  }

  const send = (text: string) => {
    const userMsg: Msg = { id: ++idRef.current, role: 'user', text }
    if (thread) {
      setMessages((m) => [...m, userMsg])
      reply(text)
      return
    }
    /* primeira mensagem: a saudação some, o input desce e a conversa abre */
    onThreadStart?.(text)
    setLeaving(true)
    later(() => {
      dockTopRef.current = dockRef.current?.getBoundingClientRect().top ?? null
      setMessages([userMsg])
      setThread(true)
      setLeaving(false)
      reply(text)
    }, LEAVE_MS)
  }

  /* mensagem pendente: a Home aparece por um instante e a conversa abre
     (guard por ref: o StrictMode monta duas vezes em dev) */
  const initialSentRef = useRef(false)
  useEffect(() => {
    if (!initialMessage || initialSentRef.current) return
    initialSentRef.current = true
    const t = window.setTimeout(() => {
      send(initialMessage)
      onInitialMessageSent?.()
    }, 260)
    return () => {
      window.clearTimeout(t)
      initialSentRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage])

  /* FLIP do input: parte da posição antiga e desliza até o rodapé, sem pulo */
  useLayoutEffect(() => {
    const el = dockRef.current
    const from = dockTopRef.current
    dockTopRef.current = null
    if (!thread || !el || from == null) return
    const delta = from - el.getBoundingClientRect().top
    if (!delta) return
    el.style.transition = 'none'
    el.style.transform = `translateY(${delta}px)`
    void el.offsetHeight
    requestAnimationFrame(() => {
      el.style.transition = 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.transform = 'translateY(0)'
    })
  }, [thread])

  /* mantém a conversa rolada até o fim conforme as mensagens chegam */
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  /* gruda no fim enquanto a área da conversa encolhe (o card de perguntas
     crescendo pra cima), a menos que o usuário tenha rolado pra cima */
  useEffect(() => {
    const el = threadRef.current
    if (!thread || !el) return
    let stick = true
    const onScroll = () => {
      stick = el.scrollHeight - el.scrollTop - el.clientHeight < 48
    }
    const ro = new ResizeObserver(() => {
      if (stick) el.scrollTop = el.scrollHeight
    })
    el.addEventListener('scroll', onScroll, { passive: true })
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [thread])

  const copyMsg = (m: AgentMsg) => {
    const text = m.blocks
      .map((b) =>
        b.kind === 'p' ? plain(b.text) : b.items.map((item) => `- ${plain(item)}`).join('\n'),
      )
      .join('\n\n')
    try {
      navigator.clipboard?.writeText(text)
    } catch {
      /* clipboard indisponível */
    }
    setCopiedId(m.id)
    later(() => setCopiedId((c) => (c === m.id ? null : c)), 1500)
  }

  const composerPlaceholder = project ? `Conversar em ${project.name}` : undefined

  const greeting = (
    <div
      className={`chat-greeting${leaving ? ' is-leaving' : ''}`}
      key={project ? `proj-${project.id}` : mode}
    >
      {project ? (
        <>
          <span
            className="greeting-proj-icon"
            aria-hidden="true"
            style={
              project.color
                ? { background: `color-mix(in srgb, ${project.color} 16%, var(--card-surface))` }
                : undefined
            }
          >
            {project.emoji}
          </span>
          <h1 className="greeting-text">{project.name}</h1>
        </>
      ) : mode === 'agente' ? (
        <>
          {agent && !agent.orb ? (
            <span
              className={`greeting-face${intro ? ' is-intro' : ''}`}
              style={{ '--accent': agent.accent } as CSSProperties}
              aria-hidden="true"
            >
              <img src={agent.img} alt="" draggable={false} />
            </span>
          ) : (
            <span className="greeting-orb">
              <span className="greeting-orb-glow">
                <AgentOrb size={26} />
              </span>
              <span className="greeting-orb-core">
                <AgentOrb size={26} />
              </span>
            </span>
          )}
          <span className="greeting-text-col">
            {agent && <span className="greeting-agent-name">{agent.name}</span>}
            <h1 className="greeting-text">Me dê uma tarefa...</h1>
          </span>
        </>
      ) : (
        <h1 className="greeting-text">Converse com modelos de IA</h1>
      )}
    </div>
  )

  return (
    <main
      className={`chat-home${thread ? ' is-thread' : ''}${mode === 'agente' ? ' is-agent' : ''}`}
      style={
        project?.color
          ? {
              background: `linear-gradient(180deg, color-mix(in srgb, ${project.color} 20%, var(--main-bg)) 0%, var(--main-bg) 46%)`,
            }
          : undefined
      }
    >
      {/* cabeçalho da conversa: Compartilhar e mais opções, canto superior direito */}
      <header className="chat-thread-head" aria-hidden={!thread}>
        <button type="button" className="cth-btn" tabIndex={thread ? 0 : -1}>
          <Share size={16} strokeWidth={2} />
          Compartilhar
        </button>
        <button
          type="button"
          className="cth-btn is-icon"
          aria-label="Mais opções"
          tabIndex={thread ? 0 : -1}
        >
          <MoreHorizontal size={18} strokeWidth={2} />
        </button>
      </header>

      {/* palco: saudação na Home, conversa depois do primeiro envio */}
      <div className="chat-stage">
        {thread ? (
          <div className="chat-thread" ref={threadRef}>
            <div className="chat-thread-col">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div className="msg-user" key={m.id}>
                    <p>{m.text}</p>
                  </div>
                ) : (
                  <AgentMessage
                    key={m.id}
                    msg={m}
                    copied={copiedId === m.id}
                    onCopy={() => copyMsg(m)}
                    onOpenTask={onOpenTask}
                    onOpenSite={onOpenSite}
                    taskEdits={taskEdits}
                  />
                ),
              )}
              {thinking && thinkLabel && (
                <div className="msg-building" role="status">
                  {thinkLabel}
                </div>
              )}
              {thinking && !thinkLabel && (
                <div
                  className="msg-thinking"
                  role="status"
                  aria-label={`${agent?.name ?? 'Agente'} está pensando`}
                >
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          </div>
        ) : (
          greeting
        )}
      </div>

      {/* o input é o mesmo nó nos dois estados: desce ao rodapé via FLIP.
          Com perguntas, ele dá lugar ao card, que nasce idêntico à pílula */}
      <div className="chat-composer-dock" ref={dockRef}>
        <div className="composer-slot" hidden={!!questions}>
          <ChatComposer
            mode={mode}
            onModeChange={onModeChange}
            placeholder={composerPlaceholder}
            excludeProjects={!!project}
            onPickProject={onOpenProject}
            project={project}
            onClearProject={onClearProject}
            agent={agent}
            intro={intro}
            showTabs={showTabs}
            collapsible={mode === 'chat'}
            onSend={send}
          />
        </div>
        {questions && (
          <QuestionCard
            agent={agent}
            questions={questions}
            placeholder={composerPlaceholder ?? 'Diga o que devo fazer'}
            onFinish={finishQuestions}
            onClosed={() => setQuestions(null)}
          />
        )}
      </div>
    </main>
  )
}
