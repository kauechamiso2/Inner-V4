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
import { PILLAR_BY_ID } from './components/pillars'
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

const LAYOUT_KEY = 'inner-v4-layout-v2'
const COACH_KEY = 'inner-v4-coach-library'

function readSavedLayout(): SidebarLayout {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY)
    if (['a', 'b', 'c', 'd', 'e'].includes(saved ?? '')) return saved as SidebarLayout
  } catch {
    /* storage indisponível */
  }
  return 'a'
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

  return (
    <div className="app">
      <Sidebar
        activeView={view}
        onNavigate={navigate}
        layout={layout}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        coachOpen={coachOpen}
        onCoachDismiss={() => changeCoach(false)}
      />
      <HistoryPanel
        view={panelView}
        hidden={isGridView(view)}
        chatMode={chatMode}
        pins={pins}
        isPinned={isPinned}
        togglePin={togglePin}
        activeProject={activeProject}
        onOpenProject={openProjectChat}
        onNewTask={() => setActiveProject(null)}
      />
      {view === 'chat' ? (
        <ChatHome
          mode={chatMode}
          onModeChange={setChatMode}
          project={activeProject}
          onOpenProject={openProjectChat}
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
        <ProjectsPage key="projetos" isPinned={isPinned} togglePin={togglePin} />
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
      />
    </div>
  )
}
