import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HistoryPanel from './components/HistoryPanel'
import ChatHome from './components/ChatHome'
import PageView from './components/PageView'
import ImagesPage from './components/ImagesPage'
import VideosPage from './components/VideosPage'
import AudioPage from './components/AudioPage'
import DocumentsPage from './components/DocumentsPage'
import ProjectsPage from './components/ProjectsPage'
import LibraryPage from './components/LibraryPage'
import TarefasPage from './components/TarefasPage'
import SitesPage from './components/SitesPage'
import AssistentesPage from './components/AssistentesPage'
import PromptsPage from './components/PromptsPage'
import TaskDrawer from './components/TaskDrawer'
import ThemeSwitcher from './components/ThemeSwitcher'
import Onboarding from './components/Onboarding'
import { PILLAR_BY_ID } from './components/pillars'
import { AGENT_BY_ID, ORB_ACCENT, ORB_NAME } from './components/agents'
import type { AgentId, ChosenAgent } from './components/agents'
import type { AppView, PanelView, PillarId, SidebarLayout } from './components/pillars'
import type { Task } from './components/tasks'

type Drawer = { kind: 'task'; task: Task; closing?: boolean } | null

/* Pins do histórico da Home — elevados ao App para que a página de um Projeto
   (ex.: HR Stuff) consiga fixar/desafixar e refletir no painel Home. */
export type PinKind = 'chat' | 'project'
export type PinRef = { kind: PinKind; id: string }

/* projeto ativo no chat da Home: quando setado, o chat entra no "contexto" do
   projeto (ícone + nome, gradiente, sem referência a projetos no @) */
export type ActiveProject = { id: string; name: string; emoji?: string; color?: string }

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

const GRID_VIEWS = ['library', 'tarefas', 'sites', 'prompts', 'assistentes', 'projetos'] as const

function isGridView(
  view: AppView,
): view is 'library' | 'tarefas' | 'sites' | 'prompts' | 'assistentes' | 'projetos' {
  return (GRID_VIEWS as readonly string[]).includes(view)
}

function titleFor(view: Exclude<AppView, 'chat'>): string {
  if (view === 'library') return 'Biblioteca'
  if (view === 'tarefas') return 'Tarefas'
  if (view === 'sites') return 'Sites'
  return PILLAR_BY_ID[view as PillarId].label
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
  const openProjectChat = (p: ActiveProject) => {
    setActiveProject(p)
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
    if (!isGridView(next)) setPanelView(next)
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

  const closeDrawer = () => {
    setDrawer((d) => (d ? { ...d, closing: true } : d))
    window.setTimeout(() => setDrawer(null), 230)
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
        onToggleHistory={() => setHistoryCollapsed((c) => !c)}
        appsReduced={appsReduced}
      />
      <HistoryPanel
        view={panelView}
        hidden={isGridView(view) || historyCollapsed}
        chatMode={chatMode}
        pins={pins}
        isPinned={isPinned}
        togglePin={togglePin}
        activeProject={activeProject}
        onOpenProject={openProjectChat}
        onNewTask={() => setActiveProject(null)}
        agent={chosenAgent}
        intro={intro}
      />
      {view === 'chat' ? (
        <ChatHome
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
        <VideosPage key="videos" />
      ) : view === 'audio' ? (
        <AudioPage key="audio" />
      ) : view === 'documentos' ? (
        <DocumentsPage key="documentos" />
      ) : view === 'library' ? (
        <LibraryPage key="library" />
      ) : view === 'projetos' ? (
        <ProjectsPage key="projetos" isPinned={isPinned} togglePin={togglePin} agent={chosenAgent} />
      ) : view === 'tarefas' ? (
        <TarefasPage key="tarefas" onOpenTask={openTaskDrawer} />
      ) : view === 'sites' ? (
        <SitesPage key="sites" />
      ) : view === 'assistentes' ? (
        <AssistentesPage key="assistentes" />
      ) : view === 'prompts' ? (
        <PromptsPage key="prompts" />
      ) : (
        <PageView key={view} title={titleFor(view)} />
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
