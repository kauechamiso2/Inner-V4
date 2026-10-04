import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './sidebar.css'
import logo from '../assets/logo.svg'
import ultra from '../assets/ultra.svg'
import avatar from '../assets/avatar.png'
import {
  CaretRightIcon,
  DotsThreeIcon,
  GraduationCapIcon,
  HomeNavIcon,
  PacksIcon,
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

/* parte de baixo: Indique, Packs e Educação (Ajuda e Baixe o app saíram) */
const BOTTOM_ITEMS: Item[] = [
  { label: 'Indique e ganhe', href: '#indique', icon: <TicketIcon /> },
  { label: 'Packs', href: '#packs', icon: <PacksIcon /> },
  { label: 'Educação', href: '#educacao', icon: <GraduationCapIcon /> },
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
  onSelect?: (rect: DOMRect) => void
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
              onSelect(e.currentTarget.getBoundingClientRect())
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
  collapsed: boolean
  onToggleCollapsed: () => void
  coachOpen: boolean
  onCoachDismiss: () => void
}

export default function Sidebar({
  activeView,
  onNavigate,
  layout,
  collapsed,
  onToggleCollapsed,
  coachOpen,
  onCoachDismiss,
}: SidebarProps) {
  const [scrollAnimating, setScrollAnimating] = useState(false)
  const cooldownRef = useRef(false)

  /* A (principal) e C ("tudo fixável") reordenam tudo a partir de Biblioteca;
     B/D mantêm Library/Tarefas fixos e só os pilares no pool */
  const fullPool = layout === 'a' || layout === 'c'
  const [pinnedA, setPinnedA] = useState<PillarId[]>(DEFAULT_PINNED)
  const [pinnedB, setPinnedB] = useState<ModuleId[]>(DEFAULT_PINNED_B)
  const pinned: ModuleId[] = fullPool ? pinnedB : pinnedA

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

  // fecha o menu ao trocar de diagramação
  useEffect(() => {
    setMenuAnchor(null)
  }, [layout])

  const toggleSidebar = () => {
    setMenuAnchor(null)
    onToggleCollapsed()
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
    if (fullPool) {
      setPinnedB((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
    } else {
      const pid = id as PillarId
      setPinnedA((prev) => (prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]))
    }
  }

  const handleReorder = (order: ModuleId[]) => {
    capturePilares()
    if (fullPool) setPinnedB(order)
    else setPinnedA(order as PillarId[])
  }

  /* módulos disponíveis no menu "Mais" conforme a diagramação */
  /* A/C: Home e Biblioteca são fixos → ficam fora do menu; o resto reordena.
     B/D: menu só com pilares (Library/Tarefas fixos) */
  const menuModules = fullPool
    ? MODULE_DEFS.filter((m) => m.id !== 'library')
    : MODULE_DEFS.filter((m) => m.id in PILLAR_BY)
  const activeModule = (menuModules.some((m) => m.id === activeView)
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
        label: 'Home',
        href: '#chat',
        icon: <HomeNavIcon />,
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

  const isRailLabels = layout === 'e'

  const rlItem = (opts: {
    id: string
    label: string
    icon: ReactNode
    active?: boolean
    narrow?: boolean
    onSelect?: (rect: DOMRect) => void
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
              opts.onSelect?.(e.currentTarget.getBoundingClientRect())
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
              label: 'Home',
              icon: <HomeNavIcon />,
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

          <div className="rl-flex" />

          <button className="rl-util" type="button">
            <TicketIcon />
            <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
              Indique e ganhe
            </span>
          </button>
          <button className="rl-util" type="button">
            <PacksIcon />
            <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
              Packs
            </span>
          </button>
          <button className="rl-util" type="button">
            <GraduationCapIcon />
            <span className="pill-tooltip toggle-tooltip" role="tooltip" aria-hidden="true">
              Educação
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

        {(layout === 'a' || layout === 'c') && (
          <nav className="sidebar-group" aria-label="Pilares" ref={pilaresRef}>
            {chatItem}
            {fixedNav('library', itemIndex++)}
            {pinned.map((id) => moduleNav(id, itemIndex++))}
            {maisButton(itemIndex++)}
          </nav>
        )}

        {layout === 'b' && (
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

        {layout === 'd' && (
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

        <div className="sidebar-flex" />

        <nav className="sidebar-group is-utilities" aria-label="Utilitários">
          {BOTTOM_ITEMS.map((item) => (
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
          showChat={layout !== 'b'}
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
