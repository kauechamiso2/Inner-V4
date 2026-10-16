import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import HistoryPanel from './components/HistoryPanel'
import ChatHome from './components/ChatHome'
import ImagesPage from './components/ImagesPage'
import VideosPage from './components/VideosPage'
import ProjectsPage from './components/ProjectsPage'
import LibraryPage from './components/LibraryPage'
import TarefasPage from './components/TarefasPage'
import SitesPage from './components/SitesPage'
import BlankPage from './components/BlankPage'
import TaskDrawer from './components/TaskDrawer'
import SiteDrawer from './components/SiteDrawer'
import type { SiteDraft } from './components/sites'
import type { ChatMsg, HomeIntent } from './components/ChatHome'
import type { ChatEdit } from './components/HistoryPanel'
import ChatMenu from './components/ChatMenu'
import { DeleteChatModal, RenameChatModal, ShareChatModal } from './components/ChatModals'
import { placeholderThread } from './components/chatThreads'
import { allProjectEntries } from './components/projectStore'
import { PROJECT_CONTENT } from './components/projectContent'
import ThemeSwitcher from './components/ThemeSwitcher'
import Onboarding from './components/Onboarding'
import { AGENT_BY_ID, ORB_ACCENT, ORB_NAME } from './components/agents'
import type { AgentId, ChosenAgent } from './components/agents'
import type { AppView, PanelView, SidebarLayout } from './components/pillars'
import type { Task } from './components/tasks'
import type { Run } from './components/runSummaries'
import type { Attachment } from './components/MentionMenu'
import { resultBlocks } from './components/runSummaries'
import { openLoop, useLoopStore } from './components/loopStore'
import LoopToast from './components/LoopToast'
import { modelPrefs } from './components/chatModels'

type Drawer =
  | { kind: 'task'; task: Task; run?: Run; fromLoop?: string; closing?: boolean }
  | { kind: 'site'; site: SiteDraft; closing?: boolean; fromPillar?: boolean }
  | null

/* Pins do histórico da Home — elevados ao App para que a página de um Projeto
   (ex.: HR Stuff) consiga fixar/desafixar e refletir no painel Home. */
export type PinKind = 'chat' | 'project'
export type PinRef = { kind: PinKind; id: string }

/* projeto ativo no chat da Home: quando setado, o chat entra no "contexto" do
   projeto (ícone + nome, gradiente, sem referência a projetos no @) */
export type ActiveProject = { id: string; name: string; emoji?: string; color?: string }

/* chat iniciado na Home: vira uma linha no histórico (título = 1ª mensagem) */
export type StartedChat = {
  id: string
  title: string
  source: 'agent' | 'blue'
  /* Chat com modelos: modelo (ou assistente) escolhido no seletor quando a conversa começou */
  model?: string
  asst?: { name: string; avatar?: string }
}

/* versões do protótipo (selecionáveis no menu "···"):
   v1 = Padrão (input enxuto + Mais Apps reduzido)
   v2 = Mais Apps (input enxuto + todos os apps)
   v3 = Input chat/agent (input com abas + todos os apps) */
export type ProtoVersion = 'v1' | 'v2' | 'v3'

const LAYOUT_KEY = 'inner-v4-layout-v3'
const COACH_KEY = 'inner-v4-coach-library'
const VERSION_KEY = 'inner-v4-version'

/* Rail com nomes (antiga "E") é a diagramação padrão; as demais seguem
   disponíveis no menu de preferências. */
function readSavedLayout(): SidebarLayout {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY)
    if (['a', 'b', 'c', 'd', 'e'].includes(saved ?? '')) return saved as SidebarLayout
  } catch {
    /* storage indisponível */
  }
  return 'e'
}

/* Views que abrem o painel de histórico (apenas Chat/Home).
   Imagens deixou de ter painel lateral; os demais pilares estão desativados. */
function showsHistory(view: AppView): view is 'chat' {
  return view === 'chat'
}

export default function App() {
  /* primeiro acesso: escolher o Agente (etapa obrigatória).
     Por hora sempre aparece ao carregar; vamos travar por localStorage
     quando o fluxo (escolher + batizar) estiver completo. */
  const [showOnboarding, setShowOnboarding] = useState(true)
  /* entrada da plataforma: dispara quando o usuário conclui o onboarding */
  const [entering, setEntering] = useState(false)
  /* personagem escolhido (id + nome batizado) — personaliza a plataforma */
  const [agent, setAgent] = useState<{ id: AgentId; name: string } | null>(null)
  /* destaque de "personalização" ao cair na plataforma (uma vez) */
  const [intro, setIntro] = useState(false)
  /* versão do protótipo — default v1 (Padrão). Deriva input (abas) e Mais Apps. */
  const [version, setVersion] = useState<ProtoVersion>(() => {
    try {
      const v = localStorage.getItem(VERSION_KEY)
      if (v === 'v1' || v === 'v2' || v === 'v3') return v
    } catch {
      /* storage indisponível */
    }
    return 'v1'
  })
  const changeVersion = (v: ProtoVersion) => {
    setVersion(v)
    try {
      localStorage.setItem(VERSION_KEY, v)
    } catch {
      /* storage indisponível */
    }
  }
  /* só a v3 mantém as abas Agente/Chat; só a v1 usa o Mais Apps reduzido */
  const showTabs = version === 'v3'
  const appsReduced = version === 'v1'
  const [view, setView] = useState<AppView>('chat')
  /* protótipo: alterna Tarefas e Projetos entre conteúdo e empty state */
  /* protótipo: um único toggle (Configurações) liga o empty state de
     Tarefas, Projetos e Biblioteca ao mesmo tempo */
  const [emptyStates, setEmptyStates] = useState(false)
  /* última view com painel de histórico: mantém o conteúdo durante o colapso */
  const [panelView, setPanelView] = useState<PanelView>('chat')
  const [layout, setLayout] = useState<SidebarLayout>(readSavedLayout)
  /* colapso da sidebar — gerenciado aqui para a regra "drawer ⇄ sidebar" */
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.matchMedia('(max-width: 640px)').matches
    } catch {
      return false
    }
  })
  /* drawer aberto (um por vez, nunca junto da sidebar expandida) */
  const [drawer, setDrawer] = useState<Drawer>(null)
  /* modo do input do Chat (agente/chat) — compartilhado com o painel Home */
  const [chatMode, setChatMode] = useState<'agente' | 'chat'>('agente')
  /* painel de histórico recolhido pelo usuário (toggle no topo do rail) */
  const [historyCollapsed, setHistoryCollapsed] = useState(false)
  /* pins do histórico da Home (chats + projetos) */
  const [pins, setPins] = useState<PinRef[]>([
    { kind: 'chat', id: 'Análise do churn de setembro' },
    { kind: 'project', id: 'col-hr' },
    /* chats fixados dentro dos projetos (seção "Fixados" da página do projeto) */
    { kind: 'chat', id: 'col-hr:hp1' },
    { kind: 'chat', id: 'col-mkt:mp1' },
  ])
  const isPinned = (kind: PinKind, id: string) =>
    pins.some((p) => p.kind === kind && p.id === id)
  const togglePin = (kind: PinKind, id: string) =>
    setPins((prev) =>
      prev.some((p) => p.kind === kind && p.id === id)
        ? prev.filter((p) => !(p.kind === kind && p.id === id))
        : [...prev, { kind, id }],
    )
  /* projeto ativo no chat da Home (contexto do projeto) */
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null)
  /* chats iniciados na Home nesta sessão: entram no histórico com o título da
     primeira mensagem; o ativo aparece selecionado enquanto a conversa está aberta */
  const [startedChats, setStartedChats] = useState<StartedChat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const activeChatIdRef = useRef<string | null>(null)
  activeChatIdRef.current = activeChatId
  /* remonta a Home (volta ao estado inicial) ao clicar em "Nova tarefa" */
  const [homeKey, setHomeKey] = useState(0)
  /* chat iniciado dentro de um projeto: ao nascer, já entra no projeto */
  const pendingProjectRef = useRef<string | null>(null)
  const startThread = (title: string) => {
    const id = `started-${Date.now()}`
    const withModel =
      chatMode === 'agente'
        ? {}
        : modelPrefs.assistant
          ? { asst: { name: modelPrefs.assistant.name, avatar: modelPrefs.assistant.avatar } }
          : { model: modelPrefs.selected }
    setStartedChats((c) => [{ id, title, source: chatMode === 'agente' ? 'agent' : 'blue', ...withModel }, ...c])
    setActiveChatId(id)
    const pid = pendingProjectRef.current
    if (pid) {
      pendingProjectRef.current = null
      setChatEdits((m) => ({ ...m, [id]: { ...m[id], projectId: pid } }))
      setChatCrumb((c) => (c ? { ...c, label: title } : c))
    }
  }
  /* mensagem vinda de fora da Home (ex.: modal de Nova tarefa em Agendado):
     a Home remonta e a envia sozinha ao montar */
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  /* variação da Home vinda de "Nova tarefa"/"Novo site" (@Tarefa / @Site) */
  const [homeIntent, setHomeIntent] = useState<HomeIntent | null>(null)
  /* trilha no topo da conversa reaberta por "Editar" no pilar de Sites */
  const [chatCrumb, setChatCrumb] = useState<{
    parent: string
    label: string
    back: AppView
    /* chat de projeto: a trilha leva ao projeto */
    projectId?: string
  } | null>(null)
  /* abrir Projetos já dentro de um projeto (pela trilha de um chat do projeto) */
  const [projectsOpenId, setProjectsOpenId] = useState<string | null>(null)
  const [projectsKey, setProjectsKey] = useState(0)
  /* o "abrir já no projeto" vale só para essa ida a Projetos */
  useEffect(() => {
    if (view !== 'projetos') setProjectsOpenId(null)
  }, [view])
  /* "Iniciar chat" na Biblioteca: Home nova com os arquivos já no input.
     Os anexos valem só para a Home montada com essa key (não voltam depois). */
  const [homeAttachments, setHomeAttachments] = useState<{ items: Attachment[]; forKey: number } | null>(null)
  const startChatWithFiles = (items: Attachment[]) => {
    const next = homeKey + 1
    setChatMode('agente')
    setActiveProject(null)
    setActiveChatId(null)
    if (view !== 'chat') reopenHistory()
    setPendingMessage(null)
    setRestoreThread(null)
    setChatCrumb(null)
    setHomeIntent(null)
    setHomeAttachments({ items, forKey: next })
    setHomeKey(next)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  const startIntent = (intent: HomeIntent) => {
    setChatMode('agente')
    setActiveProject(null)
    setActiveChatId(null)
    if (view !== 'chat') reopenHistory()
    setPendingMessage(null)
    setRestoreThread(null)
    setChatCrumb(null)
    setHomeIntent(intent)
    setHomeKey((k) => k + 1)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }
  /* ---------- Chats do histórico: abrir, renomear, fixar, compartilhar, mover, excluir ---------- */
  const [chatEdits, setChatEdits] = useState<Record<string, ChatEdit>>({})
  /* conversas já vistas/escritas nesta sessão (reabrem iguais pelo histórico) */
  const threadsRef = useRef<Record<string, ChatMsg[]>>({})
  const [chatMenu, setChatMenu] = useState<{
    key: string
    title: string
    rect: DOMRect
    projectId: string | null
    from: 'history' | 'header' | 'project'
  } | null>(null)
  /* renomear na linha: guarda onde foi pedido (o mesmo chat pode aparecer no
     histórico e na página do projeto; só aquele lugar vira campo) */
  const [renaming, setRenaming] = useState<{ key: string; from: 'history' | 'project' } | null>(null)
  const [renameModal, setRenameModal] = useState<{ key: string; title: string } | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; title: string } | null>(null)
  const projectById = (id: string | null | undefined) => allProjectEntries().find((p) => p.id === id) ?? null
  const projectCrumb = (projectId: string, label: string) => {
    const pr = projectById(projectId)
    return { parent: `${pr?.emoji ?? '📁'} ${pr?.name ?? 'Projeto'}`, label, back: 'projetos' as AppView, projectId }
  }

  /* título atual de um chat pela chave (renomeado, da sessão, de projeto ou o original) */
  const titleOfKey = (key: string) => {
    if (chatEdits[key]?.title) return chatEdits[key].title as string
    const started = startedChats.find((c) => c.id === key)
    if (started) return started.title
    const [pid, cid] = key.split(':')
    if (cid) return PROJECT_CONTENT[pid]?.recents.find((c) => c.id === cid)?.title ?? key
    return key
  }
  /* chats movidos para algum projeto (Recentes do projeto) */
  const movedChats = Object.entries(chatEdits)
    .filter(([key, ed]) => ed.projectId && !ed.deleted && !key.startsWith(`${ed.projectId}:`))
    .map(([key, ed]) => ({ key, title: titleOfKey(key), projectId: ed.projectId as string }))

  /* enviar no input de um projeto: a conversa abre na Home, com a trilha do projeto */
  const startProjectChat = (projectId: string, text: string) => {
    pendingProjectRef.current = projectId
    reopenHistory()
    setChatMode('agente')
    setActiveProject(null)
    setActiveChatId(null)
    setHomeIntent(null)
    setRestoreThread(null)
    setChatCrumb(projectCrumb(projectId, text))
    setPendingMessage(text)
    setHomeKey((k) => k + 1)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  /* mode: o histórico de "Chat com modelos" reabre a conversa no próprio pilar
     (input de modelos); Home e projetos abrem com o agente */
  const openHistoryChat = (
    key: string,
    title: string,
    projectId?: string | null,
    mode: 'agente' | 'chat' = 'agente',
  ) => {
    const proj = chatEdits[key]?.projectId ?? projectId ?? null
    const nextMode = proj ? 'agente' : mode
    if (view === 'chat' && key === activeChatId && chatMode === nextMode) return
    setChatMode(nextMode)
    setActiveProject(null)
    setActiveChatId(key)
    setPendingMessage(null)
    setHomeIntent(null)
    setChatCrumb(proj ? projectCrumb(proj, title) : null)
    setRestoreThread(threadsRef.current[key] ?? placeholderThread(title, projectById(proj)?.name))
    setHomeKey((k) => k + 1)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  const renameChat = (key: string, title: string) => {
    setChatEdits((m) => ({ ...m, [key]: { ...m[key], title } }))
    if (key === activeChatIdRef.current) setChatCrumb((c) => (c ? { ...c, label: title } : c))
  }
  const deleteChat = (key: string) => {
    setChatEdits((m) => ({ ...m, [key]: { ...m[key], deleted: true } }))
    setPins((ps) => ps.filter((p) => !(p.kind === 'chat' && p.id === key)))
    if (key === activeChatIdRef.current) resetHome()
  }
  const moveChat = (key: string, projectId: string | null) => {
    setChatEdits((m) => ({ ...m, [key]: { ...m[key], projectId } }))
    if (key === activeChatIdRef.current) {
      setChatCrumb((c) => {
        const label = c?.label ?? chatMenu?.title ?? ''
        return projectId ? projectCrumb(projectId, label) : null
      })
    }
  }

  const resetHome = () => {
    setRestoreThread(null)
    setHomeIntent(null)
    setChatCrumb(null)
    setActiveProject(null)
    setActiveChatId(null)
    setHomeKey((k) => k + 1)
  }
  const openProjectChat = (p: ActiveProject) => {
    setActiveProject(p)
    setActiveChatId(null)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }
  const [coachOpen, setCoachOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(COACH_KEY) !== 'dismissed'
    } catch {
      return true
    }
  })

  const changeCoach = (open: boolean) => {
    setCoachOpen(open)
    try {
      sessionStorage.setItem(COACH_KEY, open ? 'open' : 'dismissed')
    } catch {
      /* storage indisponível */
    }
  }

  const changeLayout = (next: SidebarLayout) => {
    setLayout(next)
    try {
      localStorage.setItem(LAYOUT_KEY, next)
    } catch {
      /* storage indisponível */
    }
  }

  /* fechar o histórico vale só para o pilar atual: ao trocar de pilar
     (Home, Chat com modelos, Vídeos...) o painel volta aberto */
  const reopenHistory = () => {
    historyAutoClosedRef.current = false
    setHistoryCollapsed(false)
  }

  const navigate = (next: AppView) => {
    if (next !== view) reopenHistory()
    /* voltar a Loops pela sidebar mostra a lista (fecha o loop aberto) */
    openLoop(null)
    setView(next)
    /* mantém o histórico no último contexto válido (Chat/Imagens) */
    if (showsHistory(next)) setPanelView(next)
    /* sair da Home desmonta a conversa: nada fica selecionado no histórico */
    if (next !== 'chat') setActiveChatId(null)
    setDrawer(null) // trocar de página fecha qualquer drawer aberto
  }

  /* Home (agente) e Chat são itens separados da sidebar: ambos abrem a view de
     chat, mudando o modo do input e o filtro do histórico. */
  const openChatMode = (mode: 'agente' | 'chat') => {
    /* sair da variação (Nova tarefa/Novo site) ou da conversa com trilha volta à Home normal */
    if (homeIntent || chatCrumb) {
      setHomeIntent(null)
      setChatCrumb(null)
      setRestoreThread(null)
      setActiveChatId(null)
      setHomeKey((k) => k + 1)
    }
    if (view !== 'chat' || mode !== chatMode) reopenHistory()
    setChatMode(mode)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  /* Regra global: drawer e sidebar expandida não coexistem. */
  const openTaskDrawer = (task: Task, run?: Run) => {
    /* aberto por uma execução: o drawer pertence àquele loop (fecha ao sair dele) */
    setDrawer({ kind: 'task', task, run, fromLoop: run ? task.id : undefined })
    setCollapsed(true)
  }

  /* tarefas criadas pelo agente no chat: entram no topo de "Ativas" */
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])
  const addTask = (task: Task) =>
    setCreatedTasks((list) => (list.some((t) => t.id === task.id) ? list : [task, ...list]))

  /* edições feitas no modal "Editar tarefa" (vale para qualquer tarefa) */
  const [taskEdits, setTaskEdits] = useState<Record<string, Task>>({})
  const saveTask = (task: Task) => {
    setTaskEdits((m) => ({ ...m, [task.id]: task }))
    setDrawer((d) => (d?.kind === 'task' && d.task.id === task.id ? { ...d, task } : d))
  }

  /* drawer aberto a partir do chat: o histórico também não coexiste com ele.
     Recolhemos o painel e o devolvemos ao fechar o drawer. */
  const historyAutoClosedRef = useRef(false)
  const openTaskFromChat = (task: Task) => {
    if (!historyCollapsed) {
      historyAutoClosedRef.current = true
      setHistoryCollapsed(true)
    }
    openTaskDrawer(taskEdits[task.id] ?? task)
  }

  /* sites criados pelo agente no chat: entram no topo do pilar de Sites */
  const [createdSites, setCreatedSites] = useState<SiteDraft[]>([])
  /* conversa onde cada site nasceu (e a linha dela no histórico): "Editar" volta pra ela */
  const siteChatsRef = useRef<Record<string, { chatId: string | null; messages: ChatMsg[] }>>({})
  const addSite = (site: SiteDraft, messages: ChatMsg[]) => {
    siteChatsRef.current[site.id] = { chatId: activeChatIdRef.current, messages }
    setCreatedSites((list) => (list.some((s) => s.id === site.id) ? list : [site, ...list]))
  }

  /* card do site no pilar: abre a prévia (drawer e sidebar não coexistem) */
  const openSiteDrawer = (site: SiteDraft) => {
    setDrawer({ kind: 'site', site, fromPillar: true })
    setCollapsed(true)
  }

  /* "Editar" no drawer: reabre o chat onde o site foi criado */
  const [restoreThread, setRestoreThread] = useState<ChatMsg[] | null>(null)
  const editSite = (site: SiteDraft, fromPillar = false) => {
    /* sites de exemplo não têm conversa salva: monta a conversa em que teriam nascido */
    const saved = siteChatsRef.current[site.id] ?? {
      chatId: null,
      messages: [
        { id: 1, role: 'user', text: `Quero criar um site: ${site.name}` },
        {
          id: 2,
          role: 'agent',
          blocks: [
            { kind: 'p', text: `Pronto! Seu site **${site.name}** está criado.` },
            { kind: 'p', text: 'Me diga o que você quer mudar: textos, cores, seções ou imagens.' },
          ],
          site,
        },
      ] as ChatMsg[],
    }
    reopenHistory()
    setChatMode('agente')
    setActiveProject(null)
    setActiveChatId(saved.chatId)
    setPendingMessage(null)
    setHomeIntent(null)
    setChatCrumb(fromPillar ? { parent: 'Sites', label: site.name, back: 'sites' } : null)
    setRestoreThread(saved.messages)
    setHomeKey((k) => k + 1)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  /* site criado no chat: mesmo comportamento do drawer de tarefa */
  const openSiteFromChat = (site: SiteDraft) => {
    if (!historyCollapsed) {
      historyAutoClosedRef.current = true
      setHistoryCollapsed(true)
    }
    setDrawer({ kind: 'site', site })
    setCollapsed(true)
  }

  /* sair do loop (voltar à lista ou abrir outro) fecha o drawer da execução */
  const loopState = useLoopStore()
  useEffect(() => {
    if (drawer?.kind === 'task' && drawer.fromLoop && !drawer.closing && loopState.pageId !== drawer.fromLoop)
      closeDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopState.pageId])

  /* "Abrir chat" no drawer: conversa com o resultado da execução */
  const openLoopChat = (task: Task, when: string) => {
    reopenHistory()
    setChatMode('agente')
    setActiveProject(null)
    setActiveChatId(null)
    setPendingMessage(null)
    setHomeIntent(null)
    setChatCrumb({ parent: 'Loops', label: task.name, back: 'tarefas' })
    setRestoreThread([
      { id: 1, role: 'user', text: task.description, tool: { label: 'Loop' } },
      { id: 2, role: 'agent', restored: true, blocks: resultBlocks(task, when) },
    ] as ChatMsg[])
    setHomeKey((k) => k + 1)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  const closeDrawer = () => {
    setDrawer((d) => (d ? { ...d, closing: true } : d))
    window.setTimeout(() => setDrawer(null), 230)
    if (historyAutoClosedRef.current) {
      historyAutoClosedRef.current = false
      setHistoryCollapsed(false)
    }
  }

  /* drawer sumiu sem passar pelo closeDrawer (trocou de página, Editar, etc.):
     devolve o histórico que o drawer recolheu e zera a marca, para ela não
     reabrir o painel depois que o usuário o fechar por conta própria */
  useEffect(() => {
    if (drawer || !historyAutoClosedRef.current) return
    historyAutoClosedRef.current = false
    setHistoryCollapsed(false)
  }, [drawer])

  /* reabrir o histórico com um drawer aberto fecha o drawer.
     Abrir/fechar à mão é escolha do usuário: nada reabre o painel sozinho depois */
  const toggleHistory = () => {
    const opening = historyCollapsed
    historyAutoClosedRef.current = false
    if (opening && drawer) closeDrawer()
    setHistoryCollapsed((c) => !c)
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    if (!next) closeDrawer() // abrir a sidebar fecha o drawer
  }

  /* resolve o agente escolhido (foto/nome/cor) que a plataforma herda.
     'orb' = agente padrão (esfera), sem foto/banner. */
  const chosenAgent: ChosenAgent | null = !agent
    ? null
    : agent.id === 'orb'
      ? { id: 'orb', name: agent.name || ORB_NAME, accent: ORB_ACCENT, orb: true }
      : {
          id: agent.id,
          img: AGENT_BY_ID[agent.id].img,
          name: agent.name || AGENT_BY_ID[agent.id].name,
          accent: AGENT_BY_ID[agent.id].accent,
          banner: AGENT_BY_ID[agent.id].banner,
        }

  return (
    <>
    <div className={`app${showOnboarding && !entering ? ' app-pre' : ''}${entering ? ' app-enter' : ''}`}>
      <Sidebar
        activeView={view}
        onNavigate={navigate}
        layout={layout}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        coachOpen={coachOpen}
        onCoachDismiss={() => changeCoach(false)}
        chatMode={chatMode}
        onOpenChatMode={openChatMode}
        historyHidden={historyCollapsed}
        onToggleHistory={toggleHistory}
        appsReduced={appsReduced}
      />
      <HistoryPanel
        view={panelView}
        hidden={!showsHistory(view) || historyCollapsed}
        chatMode={chatMode}
        pins={pins}
        isPinned={isPinned}
        togglePin={togglePin}
        onNewTask={resetHome}
        chatEdits={chatEdits}
        pinnedProjectIds={pins.filter((p) => p.kind === 'project').map((p) => p.id)}
        onOpenChat={(key, title, projectId) => openHistoryChat(key, title, projectId, chatMode)}
        onChatMenu={(key, title, rect, projectId) =>
          setChatMenu({ key, title, rect, projectId: chatEdits[key]?.projectId ?? projectId ?? null, from: 'history' })
        }
        menuKey={chatMenu?.from === 'history' ? chatMenu.key : null}
        renamingKey={renaming?.from === 'history' ? renaming.key : null}
        onRenameDone={(key, title) => {
          setRenaming(null)
          if (title) renameChat(key, title)
        }}
        startedChats={startedChats}
        activeChatId={activeChatId}
        agent={chosenAgent}
        intro={intro}
      />
      {view === 'chat' ? (
        <ChatHome
          key={homeKey}
          initialAttachments={homeAttachments?.forKey === homeKey ? homeAttachments.items : undefined}
          onThreadStart={startThread}
          onTaskCreated={addTask}
          onOpenTask={openTaskFromChat}
          onOpenSite={openSiteFromChat}
          onSiteCreated={addSite}
          taskEdits={taskEdits}
          initialMessage={pendingMessage}
          onInitialMessageSent={() => setPendingMessage(null)}
          initialThread={restoreThread}
          intent={homeIntent}
          onShareChat={() => setShareOpen(true)}
          onChatMenu={(rect) => {
            const key = activeChatIdRef.current
            if (!key) return
            setChatMenu({
              key,
              title: chatCrumb?.label ?? chatEdits[key]?.title ?? startedChats.find((c) => c.id === key)?.title ?? key,
              rect,
              projectId: chatCrumb?.projectId ?? chatEdits[key]?.projectId ?? null,
              from: 'header',
            })
          }}
          onMessagesChange={(msgs) => {
            const key = activeChatIdRef.current
            if (key) threadsRef.current[key] = msgs
          }}
          breadcrumb={
            chatCrumb
              ? {
                  parent: chatCrumb.parent,
                  label: chatCrumb.label,
                  onBack: () => {
                    if (chatCrumb.projectId) {
                      setProjectsOpenId(chatCrumb.projectId)
                      setProjectsKey((k) => k + 1)
                    }
                    navigate(chatCrumb.back)
                  },
                }
              : null
          }
          mode={chatMode}
          onModeChange={setChatMode}
          project={activeProject}
          onOpenProject={openProjectChat}
          onClearProject={() => setActiveProject(null)}
          agent={chosenAgent}
          intro={intro}
          showTabs={showTabs}
        />
      ) : view === 'imagens' ? (
        <ImagesPage key="imagens" />
      ) : view === 'videos' ? (
        <VideosPage key="videos" panelOpen={!historyCollapsed} />
      ) : view === 'library' ? (
        <LibraryPage key="library" empty={emptyStates} onStartChat={startChatWithFiles} />
      ) : view === 'projetos' ? (
        <ProjectsPage
          key={`projetos-${projectsKey}`}
          initialOpenId={projectsOpenId}
          chatEdits={chatEdits}
          movedChats={movedChats}
          onOpenChat={openHistoryChat}
          onStartProjectChat={startProjectChat}
          onChatMenu={(key, title, rect, projectId) =>
            setChatMenu({ key, title, rect, projectId: chatEdits[key]?.projectId ?? projectId, from: 'project' })
          }
          menuKey={chatMenu?.from === 'project' ? chatMenu.key : null}
          renamingKey={renaming?.from === 'project' ? renaming.key : null}
          onRenameDone={(key, title) => {
            setRenaming(null)
            if (title) renameChat(key, title)
          }}
          isPinned={isPinned} togglePin={togglePin} agent={chosenAgent} empty={emptyStates} />
      ) : view === 'tarefas' ? (
        <TarefasPage
          key="tarefas"
          empty={emptyStates}
          createdTasks={createdTasks}
          taskEdits={taskEdits}
          agent={chosenAgent}
          onCreateWithAgent={() => startIntent('task')}
          onCreateTask={addTask}
          onSaveTask={saveTask}
          onOpenRun={(t, r) => openTaskDrawer(t, r)}
        />
      ) : view === 'sites' ? (
        <SitesPage
          key="sites"
          createdSites={createdSites}
          onNewSite={() => startIntent('site')}
          onOpenSite={openSiteDrawer}
          onEditSite={(site) => editSite(site, true)}
        />
      ) : (
        /* pilares desativados por enquanto: página em branco */
        <BlankPage key={view} />
      )}
      {drawer?.kind === 'task' && (
        <TaskDrawer
          task={drawer.task}
          run={drawer.run}
          onOpenChat={openLoopChat}
          closing={!!drawer.closing}
          onClose={closeDrawer}
          onSave={saveTask}
        />
      )}
      {drawer?.kind === 'site' && (
        <SiteDrawer
          site={drawer.site}
          closing={!!drawer.closing}
          onClose={closeDrawer}
          onEdit={drawer.fromPillar ? () => editSite(drawer.site, true) : undefined}
        />
      )}
      <LoopToast
        onViewLoop={(id) => {
          navigate('tarefas')
          openLoop(id)
        }}
      />
      {chatMenu && (
        <ChatMenu
          anchor={chatMenu.rect}
          pinned={isPinned('chat', chatMenu.key)}
          projects={allProjectEntries().map((p) => ({ id: p.id, name: p.name, emoji: p.emoji }))}
          currentProjectId={chatMenu.projectId}
          onClose={() => setChatMenu(null)}
          onRename={() =>
            chatMenu.from !== 'header'
              ? setRenaming({ key: chatMenu.key, from: chatMenu.from })
              : setRenameModal({ key: chatMenu.key, title: chatMenu.title })
          }
          onTogglePin={() => togglePin('chat', chatMenu.key)}
          onShare={() => setShareOpen(true)}
          onMove={(pid) => moveChat(chatMenu.key, pid)}
          onDelete={() => setDeleteTarget({ key: chatMenu.key, title: chatMenu.title })}
        />
      )}
      {shareOpen && <ShareChatModal onClose={() => setShareOpen(false)} />}
      {deleteTarget && (
        <DeleteChatModal
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteChat(deleteTarget.key)}
        />
      )}
      {renameModal && (
        <RenameChatModal
          title={renameModal.title}
          onClose={() => setRenameModal(null)}
          onSave={(t) => renameChat(renameModal.key, t)}
        />
      )}
      <ThemeSwitcher
        layout={layout}
        onLayoutChange={changeLayout}
        coachOpen={coachOpen}
        onCoachToggle={changeCoach}
        version={version}
        onVersionChange={changeVersion}
        emptyStates={emptyStates}
        onEmptyStatesToggle={setEmptyStates}
      />
    </div>
    {showOnboarding && (
      <Onboarding
        onContinue={(id, name) => {
          setAgent({ id: id as AgentId, name })
          setEntering(true)
          setIntro(true)
          window.setTimeout(() => setIntro(false), 2600)
        }}
        onDone={() => setShowOnboarding(false)}
      />
    )}
    </>
  )
}
