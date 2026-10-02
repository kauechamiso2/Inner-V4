import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HistoryPanel from './components/HistoryPanel'
import ChatHome from './components/ChatHome'
import PageView from './components/PageView'
import ThemeSwitcher from './components/ThemeSwitcher'
import { PILLAR_BY_ID } from './components/pillars'
import type { AppView, PanelView, PillarId } from './components/pillars'

const GRID_VIEWS = ['library', 'tarefas'] as const

function isGridView(view: AppView): view is 'library' | 'tarefas' {
  return (GRID_VIEWS as readonly string[]).includes(view)
}

function titleFor(view: Exclude<AppView, 'chat'>): string {
  if (view === 'library') return 'Library'
  if (view === 'tarefas') return 'Tarefas'
  return PILLAR_BY_ID[view as PillarId].label
}

export default function App() {
  const [view, setView] = useState<AppView>('chat')
  /* última view com painel de histórico: mantém o conteúdo durante o colapso */
  const [panelView, setPanelView] = useState<PanelView>('chat')

  const navigate = (next: AppView) => {
    setView(next)
    if (!isGridView(next)) setPanelView(next)
  }

  return (
    <div className="app">
      <Sidebar activeView={view} onNavigate={navigate} />
      <HistoryPanel view={panelView} hidden={isGridView(view)} />
      {view === 'chat' ? <ChatHome /> : <PageView key={view} title={titleFor(view)} />}
      <ThemeSwitcher />
    </div>
  )
}
