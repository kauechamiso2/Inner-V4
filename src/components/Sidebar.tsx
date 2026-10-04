import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './sidebar.css'
import logo from '../assets/logo.svg'
import ultra from '../assets/ultra.svg'
import avatar from '../assets/avatar.png'
import {
  CaretRightIcon,
  ChatTeardropIcon,
  DevicesIcon,
  DotsThreeIcon,
  FolderSimpleIcon,
  GraduationCapIcon,
  PacksIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  TicketIcon,
} from './SidebarIcons'
import {
  DEFAULT_PINNED,
  DEFAULT_PINNED_B,
  MODULE_BY_ID,
  MODULE_DEFS,
  PILLAR_DEFS,
  isNavModule,
} from './pillars'
import type { AppView, ModuleId, PillarId, SidebarLayout } from './pillars'
import PillarsMenu from './PillarsMenu'
import LibraryCoachmark from './LibraryCoachmark'
import { useFlip } from './useFlip'

const ANIMATION_MS = 900

type Item = {
  label: string
  href: string
  icon: ReactNode
  active?: boolean
  muted?: boolean
  narrowIcon?: boolean
}

const ESPACOS: Item[] = [
  { label: 'Projetos', href: '#projetos', icon: <FolderSimpleIcon /> },
  { label: 'Educação', href: '#educacao', icon: <GraduationCapIcon /> },
  { label: 'Packs', href: '#packs', icon: <PacksIcon /> },
]

const UTILITARIOS: Item[] = [
  { label: 'Indique e ganhe', href: '#indique', icon: <TicketIcon /> },
  { label: 'Ajuda', href: '#ajuda', icon: <QuestionIcon /> },
  { label: 'Baixe o app', href: '#app', icon: <DevicesIcon /> },
]

function NavItem({
  item,
  index,
  flipId,
  onSelect,
}: {
  item: Item
  index: number
  flipId?: string
  onSelect?: () => void
}) {
  return (
    <a
      className={`sidebar-item${item.active ? ' is-active' : ''}`}
      href={item.href}
      style={{ '--i': index } as CSSProperties}
      data-flip-id={flipId}
      onClick={
        onSelect
          ? (e) => {
              e.preventDefault()
              onSelect()
            }
          : undefined
      }
    >
      <span className={`sidebar-item-icon${item.narrowIcon ? ' is-16' : ''}`}>{item.icon}</span>
      <span className={`sidebar-item-label${item.muted ? ' is-muted' : ''}`}>{item.label}</span>
      <span className="pill-tooltip item-tooltip" role="tooltip" aria-hidden="true">
        {item.label}
      </span>
    </a>
  )
}

type SidebarProps = {
  activeView: AppView
  onNavigate: (view: AppView) => void
  layout: SidebarLayout
  coachOpen: boolean
  onCoachDismiss: () => void
}

export default function Sidebar({ activeView, onNavigate, layout, coachOpen, onCoachDismiss }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [scrollAnimating, setScrollAnimating] = useState(false)
  const cooldownRef = useRef(false)

  /* A e C compartilham o pool de pilares; B inclui Library/Tarefas no jogo */
  const [pinnedA, setPinnedA] = useState<PillarId[]>(DEFAULT_PINNED)
  const [pinnedB, setPinnedB] = useState<ModuleId[]>(DEFAULT_PINNED_B)
  const pinned: ModuleId[] = layout === 'b' ? pinnedB : pinnedA

  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)
  const maisRef = useRef<HTMLButtonElement>(null)
  const pilaresRef = useRef<HTMLElement>(null)
  const capturePilares = useFlip(pilaresRef)

  useEffect(() => {
    const onScroll = () => {
      if (cooldownRef.current) return
      cooldownRef.current = true
      setScrollAnimating(true)
      window.setTimeout(() => {
        setScrollAnimating(false)
        cooldownRef.current = false
      }, ANIMATION_MS)
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  // Em telas pequenas, começa recolhida
  useEffect(() => {
    if (window.matchMedia('(max-width: 640px)').matches) setCollapsed(true)
  }, [])

  // fecha o menu ao trocar de diagramação
  useEffect(() => {
    setMenuAnchor(null)
  }, [layout])

  const toggleSidebar = () => {
    setMenuAnchor(null)
    setCollapsed((c) => !c)
  }

  const toggleMenu = () => {
    if (menuAnchor) {
      setMenuAnchor(null)
    } else if (maisRef.current) {
      setMenuAnchor(maisRef.current.getBoundingClientRect())
    }
  }

  const handleTogglePin = (id: ModuleId) => {
    capturePilares()
    if (layout === 'b') {
      setPinnedB((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
    } else {
      const pid = id as PillarId
      setPinnedA((prev) => (prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]))
    }
  }

  const handleReorder = (order: ModuleId[]) => {
    capturePilares()
    if (layout === 'b') setPinnedB(order)
    else setPinnedA(order as PillarId[])
  }

  /* módulos disponíveis no menu "Mais" conforme a diagramação */
  const menuModules = layout === 'b' ? MODULE_DEFS : MODULE_DEFS.filter((m) => m.id in PILLAR_BY)
  const activeModule = (activeView !== 'chat' && activeView !== 'library' && activeView !== 'tarefas'
    ? activeView
    : layout === 'b' && (activeView === 'library' || activeView === 'tarefas')
      ? activeView
      : null) as ModuleId | null
  const maisActive = activeModule !== null && !pinned.includes(activeModule)
  const menuActiveId = activeModule && menuModules.some((m) => m.id === activeModule) ? activeModule : null

  let itemIndex = 0
  const chatItem = (
    <NavItem
      index={itemIndex++}
      onSelect={() => onNavigate('chat')}
      item={{
        label: 'Chat',
        href: '#chat',
        icon: <ChatTeardropIcon />,
        active: activeView === 'chat',
      }}
    />
  )

  const moduleNav = (id: ModuleId, index: number) => {
    const def = MODULE_BY_ID[id]
    return (
      <NavItem
        key={id}
        flipId={id}
        index={index}
        onSelect={isNavModule(id) ? () => onNavigate(id) : undefined}
        item={{
          label: def.label,
          href: `#${id}`,
          icon: def.icon,
          active: activeView === id,
          narrowIcon: def.narrowIcon,
        }}
      />
    )
  }

  const fixedNav = (id: 'library' | 'tarefas', index: number) => {
    const def = MODULE_BY_ID[id]
    return (
      <NavItem
        key={id}
        index={index}
        onSelect={() => onNavigate(id)}
        item={{
          label: def.label,
          href: `#${id}`,
          icon: def.icon,
          active: activeView === id,
          narrowIcon: def.narrowIcon,
        }}
      />
    )
  }

  const maisButton = (index: number) => (
    <button
      ref={maisRef}
      type="button"
      className={`sidebar-item sidebar-more${menuAnchor ? ' is-open' : ''}${maisActive ? ' is-active' : ''}`}
      style={{ '--i': index } as CSSProperties}
      data-flip-id="mais"
      aria-haspopup="menu"
      aria-expanded={!!menuAnchor}
      onClick={toggleMenu}
    >
      <span className="sidebar-item-icon">
        <DotsThreeIcon />
      </span>
      <span className="sidebar-item-label is-muted">Mais</span>
      <span className="pill-tooltip item-tooltip" role="tooltip" aria-hidden="true">
        Mais
      </span>
    </button>
  )

  const divider = (
    <div className="sidebar-divider" role="separator">
      <span />
    </div>
  )

  const isRailLabels = layout === 'd'

  const rlItem = (opts: {
    id: string
    label: string
    icon: ReactNode
    active?: boolean
    narrow?: boolean
    onSelect?: () => void
    flipId?: string
  }) => (
    <a
      key={opts.id}
      className={`rl-item${opts.active ? ' is-active' : ''}${opts.narrow ? ' is-16' : ''}`}
      href={`#${opts.id}`}
      data-flip-id={opts.flipId}
      onClick={
        opts.onSelect
          ? (e) => {
              e.preventDefault()
              opts.onSelect?.()
            }
          : undefined
      }
    >
      <span className="rl-target">{opts.icon}</span>
      <span className="rl-label">{opts.label}</span>
    </a>
  )

  return (
    <aside
      className={`sidebar${isRailLabels ? ' rail-labels' : ''}${collapsed && !isRailLabels ? ' is-collapsed' : ''}${scrollAnimating ? ' icons-animate' : ''}`}
    >
      {isRailLabels ? (
        <div className="rl-col">
          <nav className="rl-group" aria-label="Pilares" ref={pilaresRef}>
            {rlItem({
              id: 'chat',
              label: 'Chat',
              icon: <ChatTeardropIcon />,
              active: activeView === 'chat',
              onSelect: () => onNavigate('chat'),
            })}
            {rlItem({
              id: 'library',
              label: 'Biblioteca',
              icon: MODULE_BY_ID.library.icon,
              active: activeView === 'library',
              onSelect: () => onNavigate('library'),
            })}
            {rlItem({
              id: 'tarefas',
              label: 'Tarefas',
              icon: MODULE_BY_ID.tarefas.icon,
              active: activeView === 'tarefas',
              narrow: true,
              onSelect: () => onNavigate('tarefas'),
            })}
            {pinned.map((id) =>
              rlItem({
                id,
                label: MODULE_BY_ID[id].label,
                icon: MODULE_BY_ID[id].icon,
                active: activeView === id,
                narrow: MODULE_BY_ID[id].narrowIcon,
                onSelect: isNavModule(id) ? () => onNavigate(id) : undefined,
                flipId: id,
              }),
            )}
            <button
              ref={maisRef}
              type="button"
              className={`rl-item rl-more${menuAnchor ? ' is-active' : ''}${maisActive ? ' is-active' : ''}`}
              data-flip-id="mais"
              aria-haspopup="menu"
              aria-expanded={!!menuAnchor}
              onClick={toggleMenu}
            >
              <span className="rl-target">
                <DotsThreeIcon />
              </span>
              <span className="rl-label">Mais</span>
            </button>
          </nav>

          <div className="rl-divider">
            <span />
          </div>

          <nav className="rl-group" aria-label="Espaços">
            {ESPACOS.map((item) =>
              rlItem({
                id: item.href.slice(1),
                label: item.label,
                icon: item.icon,
              }),
            )}
          </nav>

          <div className="rl-flex" />

          <button className="rl-util" type="button">
            <TicketIcon />
            <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
              Indique e ganhe
            </span>
          </button>
          <button className="rl-util" type="button">
            <QuestionIcon />
            <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
              Ajuda
            </span>
          </button>
          <button className="rl-util" type="button">
            <DevicesIcon />
            <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
              Baixe o app
            </span>
          </button>

          <div className="rl-avatar">
            <span className="sidebar-avatar-photo">
              <img src={avatar} alt="Avatar de Kauê" />
            </span>
            <img className="sidebar-ultra" src={ultra} alt="Plano Ultra" />
          </div>
        </div>
      ) : (
        <>
      <header className="sidebar-header">
        <span className="sidebar-brand">
          <img className="sidebar-logo" src={logo} alt="Inner AI" />
          <span className="sidebar-logo-tag">v4</span>
        </span>
      </header>

      <button
        className="sidebar-toggle"
        type="button"
        aria-label={collapsed ? 'Abrir barra lateral' : 'Fechar barra lateral'}
        aria-expanded={!collapsed}
        onClick={toggleSidebar}
      >
        <SidebarSimpleIcon />
        <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
          {collapsed ? 'Abrir barra lateral' : 'Fechar barra lateral'}
        </span>
      </button>

      <div className="sidebar-content">
        <div className="sidebar-spacer-top" />

        {layout === 'a' && (
          <>
            <nav className="sidebar-group" aria-label="Pilares fixos">
              {chatItem}
              {fixedNav('library', itemIndex++)}
              {fixedNav('tarefas', itemIndex++)}
            </nav>
            {divider}
            <nav className="sidebar-group" aria-label="Pilares personalizados" ref={pilaresRef}>
              {pinned.map((id) => moduleNav(id, itemIndex++))}
              {maisButton(itemIndex++)}
            </nav>
          </>
        )}

        {layout === 'b' && (
          <nav className="sidebar-group" aria-label="Pilares" ref={pilaresRef}>
            {chatItem}
            {pinned.map((id) => moduleNav(id, itemIndex++))}
            {maisButton(itemIndex++)}
          </nav>
        )}

        {layout === 'c' && (
          <>
            <nav className="sidebar-group" aria-label="Pilares" ref={pilaresRef}>
              {chatItem}
              {pinned.map((id) => moduleNav(id, itemIndex++))}
              {maisButton(itemIndex++)}
            </nav>
            {divider}
            <nav className="sidebar-group" aria-label="Biblioteca e tarefas">
              {fixedNav('library', itemIndex++)}
              {fixedNav('tarefas', itemIndex++)}
            </nav>
          </>
        )}

        {divider}

        <nav className="sidebar-group" aria-label="Espaços">
          {ESPACOS.map((item) => (
            <NavItem key={item.label} item={item} index={itemIndex++} />
          ))}
        </nav>

        <div className="sidebar-flex" />

        <nav className="sidebar-group is-utilities" aria-label="Utilitários">
          {UTILITARIOS.map((item) => (
            <NavItem key={item.label} item={item} index={itemIndex++} />
          ))}
        </nav>
      </div>

      <footer className="sidebar-user">
        <div className="sidebar-user-info">
          <span className="sidebar-avatar">
            <span className="sidebar-avatar-photo">
              <img src={avatar} alt="Avatar de Kauê" />
            </span>
            <img className="sidebar-ultra" src={ultra} alt="Plano Ultra" />
          </span>
          <span className="sidebar-user-account">
            <span className="sidebar-user-name">Kauê</span>
          </span>
        </div>
        <span className="sidebar-user-caret">
          <CaretRightIcon />
        </span>
      </footer>
        </>
      )}

      {menuAnchor && (
        <PillarsMenu
          anchor={menuAnchor}
          modules={menuModules}
          pinned={pinned}
          activeId={menuActiveId}
          onTogglePin={handleTogglePin}
          onReorder={handleReorder}
          onOpenPillar={(id) => onNavigate(id)}
          onClose={() => setMenuAnchor(null)}
          showChat={layout !== 'a'}
          chatActive={activeView === 'chat'}
          onOpenChat={() => onNavigate('chat')}
        />
      )}

      <LibraryCoachmark
        open={coachOpen}
        onDismiss={onCoachDismiss}
        anchorKey={`${layout}|${collapsed}|${pinned.join(',')}`}
      />
    </aside>
  )
}

/* ids dos pilares de geração (para filtrar o menu nas diagramações A e C) */
const PILLAR_BY = Object.fromEntries(PILLAR_DEFS.map((p) => [p.id, true]))
