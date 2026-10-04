import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HistoryPanel from './components/HistoryPanel'
import ChatHome from './components/ChatHome'
import PageView from './components/PageView'
import ImagesPage from './components/ImagesPage'
import LibraryPage from './components/LibraryPage'
import TarefasPage from './components/TarefasPage'
import SitesPage from './components/SitesPage'
import ThemeSwitcher from './components/ThemeSwitcher'
import { PILLAR_BY_ID } from './components/pillars'
import type { AppView, PanelView, PillarId, SidebarLayout } from './components/pillars'

const LAYOUT_KEY = 'inner-v4-layout'
const COACH_KEY = 'inner-v4-coach-library'

function readSavedLayout(): SidebarLayout {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY)
    if (saved === 'a' || saved === 'b' || saved === 'c' || saved === 'd') return saved
  } catch {
    /* storage indisponível */
  }
  return 'a'
}

const GRID_VIEWS = ['library', 'tarefas', 'sites'] as const

function isGridView(view: AppView): view is 'library' | 'tarefas' | 'sites' {
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
  }

  return (
    <div className="app">
      <Sidebar
        activeView={view}
        onNavigate={navigate}
        layout={layout}
        coachOpen={coachOpen}
        onCoachDismiss={() => changeCoach(false)}
      />
      <HistoryPanel view={panelView} hidden={isGridView(view)} />
      {view === 'chat' ? (
        <ChatHome />
      ) : view === 'imagens' ? (
        <ImagesPage key="imagens" />
      ) : view === 'library' ? (
        <LibraryPage key="library" />
      ) : view === 'tarefas' ? (
        <TarefasPage key="tarefas" />
      ) : view === 'sites' ? (
        <SitesPage key="sites" />
      ) : (
        <PageView key={view} title={titleFor(view)} />
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
