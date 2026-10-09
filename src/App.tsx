import { useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import HistoryPanel from './components/HistoryPanel'
import ChatHome from './components/ChatHome'
import ImagesPage from './components/ImagesPage'
import ProjectsPage from './components/ProjectsPage'
import LibraryPage from './components/LibraryPage'
import TarefasPage from './components/TarefasPage'
import BlankPage from './components/BlankPage'
import TaskDrawer from './components/TaskDrawer'
import ThemeSwitcher from './components/ThemeSwitcher'
import Onboarding from './components/Onboarding'
import { AGENT_BY_ID, ORB_ACCENT, ORB_NAME } from './components/agents'
import type { AgentId, ChosenAgent } from './components/agents'
import type { AppView, PanelView, SidebarLayout } from './components/pillars'
import type { Task } from './components/tasks'

type Drawer = { kind: 'task'; task: Task; closing?: boolean } | null

/* Pins do histórico da Home — elevados ao App para que a página de um Projeto
   (ex.: HR Stuff) consiga fixar/desafixar e refletir no painel Home. */
export type PinKind = 'chat' | 'project'
export type PinRef = { kind: PinKind; id: string }

/* projeto ativo no chat da Home: quando setado, o chat entra no "contexto" do
   projeto (ícone + nome, gradiente, sem referência a projetos no @) */
export type ActiveProject = { id: string; name: string; emoji?: string; color?: string }

/* chat iniciado na Home: vira uma linha no histórico (título = 1ª mensagem) */
export type StartedChat = { id: string; title: string; source: 'agent' | 'blue' }

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
  const [tasksEmpty, setTasksEmpty] = useState(false)
  const [projectsEmpty, setProjectsEmpty] = useState(false)
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
  /* remonta a Home (volta ao estado inicial) ao clicar em "Nova tarefa" */
  const [homeKey, setHomeKey] = useState(0)
  const startThread = (title: string) => {
    const id = `started-${Date.now()}`
    setStartedChats((c) => [{ id, title, source: chatMode === 'agente' ? 'agent' : 'blue' }, ...c])
    setActiveChatId(id)
  }
  /* mensagem vinda de fora da Home (ex.: modal de Nova tarefa em Agendado):
     a Home remonta e a envia sozinha ao montar */
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const startChatFrom = (text: string) => {
    setChatMode('agente')
    setActiveProject(null)
    setActiveChatId(null)
    setPendingMessage(text)
    setHomeKey((k) => k + 1)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }
  const resetHome = () => {
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

  const navigate = (next: AppView) => {
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
    setChatMode(mode)
    setView('chat')
    setPanelView('chat')
    setDrawer(null)
  }

  /* Regra global: drawer e sidebar expandida não coexistem. */
  const openTaskDrawer = (task: Task) => {
    setDrawer({ kind: 'task', task })
    setCollapsed(true)
  }

  /* tarefas criadas pelo agente no chat: entram no topo de "Ativas" */
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])
  const addTask = (task: Task) =>
    setCreatedTasks((list) => (list.some((t) => t.id === task.id) ? list : [task, ...list]))

  /* drawer aberto a partir do chat: o histórico também não coexiste com ele.
     Recolhemos o painel e o devolvemos ao fechar o drawer. */
  const historyAutoClosedRef = useRef(false)
  const openTaskFromChat = (task: Task) => {
    if (!historyCollapsed) {
      historyAutoClosedRef.current = true
      setHistoryCollapsed(true)
    }
    openTaskDrawer(task)
  }

  const closeDrawer = () => {
    setDrawer((d) => (d ? { ...d, closing: true } : d))
    window.setTimeout(() => setDrawer(null), 230)
    if (historyAutoClosedRef.current) {
      historyAutoClosedRef.current = false
      setHistoryCollapsed(false)
    }
  }

  /* reabrir o histórico com um drawer aberto fecha o drawer */
  const toggleHistory = () => {
    const opening = historyCollapsed
    if (opening && drawer) {
      historyAutoClosedRef.current = false
      closeDrawer()
    }
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
        activeProject={activeProject}
        onOpenProject={openProjectChat}
        onNewTask={resetHome}
        startedChats={startedChats}
        activeChatId={activeChatId}
        agent={chosenAgent}
        intro={intro}
      />
      {view === 'chat' ? (
        <ChatHome
          key={homeKey}
          onThreadStart={startThread}
          onTaskCreated={addTask}
          onOpenTask={openTaskFromChat}
          initialMessage={pendingMessage}
          onInitialMessageSent={() => setPendingMessage(null)}
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
      ) : view === 'library' ? (
        <LibraryPage key="library" />
      ) : view === 'projetos' ? (
        <ProjectsPage key="projetos" isPinned={isPinned} togglePin={togglePin} agent={chosenAgent} empty={projectsEmpty} />
      ) : view === 'tarefas' ? (
        <TarefasPage
          key="tarefas"
          onOpenTask={openTaskDrawer}
          empty={tasksEmpty}
          createdTasks={createdTasks}
          onStartChat={startChatFrom}
        />
      ) : (
        /* pilares desativados por enquanto: página em branco */
        <BlankPage key={view} />
      )}
      {drawer?.kind === 'task' && (
        <TaskDrawer task={drawer.task} closing={!!drawer.closing} onClose={closeDrawer} />
      )}
      <ThemeSwitcher
        layout={layout}
        onLayoutChange={changeLayout}
        coachOpen={coachOpen}
        onCoachToggle={changeCoach}
        version={version}
        onVersionChange={changeVersion}
        view={view}
        tasksEmpty={tasksEmpty}
        onTasksEmptyToggle={setTasksEmpty}
        projectsEmpty={projectsEmpty}
        onProjectsEmptyToggle={setProjectsEmpty}
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
