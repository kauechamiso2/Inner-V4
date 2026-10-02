import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './sidebar.css'
import logo from '../assets/logo.svg'
import ultra from '../assets/ultra.svg'
import avatar from '../assets/avatar.png'
import {
  CaretRightIcon,
  DotsThreeIcon,
  FolderSimpleIcon,
  GraduationCapIcon,
  PacksIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  TicketIcon,
} from './SidebarIcons'
import { DEFAULT_PINNED, FIXED_PILLARS, PILLAR_BY_ID, isGenPillar } from './pillars'
import type { AppView, PillarId } from './pillars'
import PillarsMenu from './PillarsMenu'
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
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [scrollAnimating, setScrollAnimating] = useState(false)
  const cooldownRef = useRef(false)

  const [pinned, setPinned] = useState<PillarId[]>(DEFAULT_PINNED)
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
    // capture: pega scroll da janela e de qualquer container rolável (ex: área de conteúdo)
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  // Em telas pequenas, começa recolhida
  useEffect(() => {
    if (window.matchMedia('(max-width: 640px)').matches) setCollapsed(true)
  }, [])

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

  const handleTogglePin = (id: PillarId) => {
    capturePilares()
    setPinned((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleReorder = (order: PillarId[]) => {
    capturePilares()
    setPinned(order)
  }

  let itemIndex = 0
  const fixedIndexes = Object.fromEntries(FIXED_PILLARS.map((p) => [p.id, itemIndex++]))
  const pinnedItems = pinned.map((id) => ({ id, index: itemIndex++ }))
  const maisIndex = itemIndex++

  /* view atual é um pilar acessado pelo menu (não fixado) → "Mais" fica ativo */
  const activePillar = (activeView in PILLAR_BY_ID ? activeView : null) as PillarId | null
  const maisActive = activePillar !== null && !pinned.includes(activePillar)

  return (
    <aside
      className={`sidebar${collapsed ? ' is-collapsed' : ''}${scrollAnimating ? ' icons-animate' : ''}`}
    >
      <header className="sidebar-header">
        <img className="sidebar-logo" src={logo} alt="Inner AI" />
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

        <nav className="sidebar-group" aria-label="Pilares fixos">
          {FIXED_PILLARS.map((p) => (
            <NavItem
              key={p.id}
              index={fixedIndexes[p.id]}
              onSelect={() => onNavigate(p.id)}
              item={{
                label: p.label,
                href: `#${p.id}`,
                icon: p.icon,
                active: activeView === p.id,
                narrowIcon: p.narrowIcon,
              }}
            />
          ))}
        </nav>

        <div className="sidebar-divider" role="separator">
          <span />
        </div>

        <nav className="sidebar-group" aria-label="Pilares personalizados" ref={pilaresRef}>
          {pinnedItems.map(({ id, index }) => {
            const def = PILLAR_BY_ID[id]
            return (
              <NavItem
                key={id}
                flipId={id}
                index={index}
                onSelect={isGenPillar(id) ? () => onNavigate(id) : undefined}
                item={{
                  label: def.label,
                  href: `#${id}`,
                  icon: def.icon,
                  active: activeView === id,
                  narrowIcon: def.narrowIcon,
                }}
              />
            )
          })}
          <button
            ref={maisRef}
            type="button"
            className={`sidebar-item sidebar-more${menuAnchor ? ' is-open' : ''}${maisActive ? ' is-active' : ''}`}
            style={{ '--i': maisIndex } as CSSProperties}
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
        </nav>

        <div className="sidebar-divider" role="separator">
          <span />
        </div>

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

      {menuAnchor && (
        <PillarsMenu
          anchor={menuAnchor}
          pinned={pinned}
          activeId={activePillar}
          onTogglePin={handleTogglePin}
          onReorder={handleReorder}
          onOpenPillar={(id) => onNavigate(id)}
          onClose={() => setMenuAnchor(null)}
        />
      )}
    </aside>
  )
}
