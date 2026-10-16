import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Bold,
  Check,
  Globe,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  Search,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react'
import { FILES as LIB_FILES } from './libraryEntries'
import type { LibEntry } from './libraryEntries'
import './context-modal.css'
import './create-task.css'
import './site-modals.css'
import './context-add.css'

/* ---------- shell de modal secundário (abre por cima do modal de Contexto) ---------- */
function AddModal({
  title,
  sub,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])
  return createPortal(
    <div className="ctx-overlay ca-overlay" onClick={onClose}>
      <div
        className={`ctx-modal sm-modal ca-modal${wide ? ' is-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">{title}</h2>
            {sub && <p className="ctx-modal-sub">{sub}</p>}
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>
        <div className="ctx-modal-body ca-body">{children}</div>
        <footer className="ctx-modal-foot sm-foot is-end">{footer}</footer>
      </div>
    </div>,
    document.body,
  )
}

/* ---------- URL: endereço + prévia com o favicon do site ---------- */
export const faviconFor = (host: string) => `https://www.google.com/s2/favicons?domain=${host}&sz=64`

function parseUrl(raw: string): URL | null {
  const v = raw.trim()
  if (!v) return null
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`)
    return /\.[a-z]{2,}$/i.test(u.hostname) ? u : null
  } catch {
    return null
  }
}

export function UrlModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (item: { name: string; url: string; favicon: string }) => void
}) {
  const [value, setValue] = useState('')
  const [iconOk, setIconOk] = useState(true)
  const u = parseUrl(value)
  const host = u?.hostname.replace(/^www\./, '') ?? ''
  useEffect(() => setIconOk(true), [host])
  const add = () => {
    if (!u) return
    onAdd({ name: host + (u.pathname !== '/' ? u.pathname : ''), url: u.href, favicon: faviconFor(u.hostname) })
    onClose()
  }
  return (
    <AddModal
      title="Adicionar URL"
      sub="O agente lê o conteúdo da página e usa como contexto do projeto."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ss-text-btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!u} onClick={add}>
            Adicionar
          </button>
        </>
      }
    >
      <div className="ss-field has-icon">
        <Globe size={17} strokeWidth={1.8} aria-hidden="true" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="https://www.exemplo.com/pagina"
          autoFocus
          spellCheck={false}
          aria-label="URL"
        />
      </div>
      {/* prévia: favicon + domínio, aparece assim que a URL é válida */}
      {u && (
        <div className="ca-url-preview" key={host}>
          <span className="ca-favicon">
            {iconOk ? (
              <img src={faviconFor(u.hostname)} alt="" onError={() => setIconOk(false)} />
            ) : (
              <Globe size={16} strokeWidth={1.8} />
            )}
          </span>
          <span className="ca-url-text">
            <span className="ca-url-host">{host}</span>
            <span className="ca-url-full">{u.href}</span>
          </span>
        </div>
      )}
    </AddModal>
  )
}

/* ---------- Nota: título + editor com formatação ---------- */
const NOTE_COLORS = ['#1c1c1c', '#E5484D', '#F76B15', '#C99400', '#30A46C', '#0D74E7', '#8E4EC6']
const NOTE_HIGHLIGHTS = ['#FFF3A3', '#FFD8C2', '#D7F5DD', '#D6E8FF', '#EBDDFF']

export function NoteModal({
  initialTitle = '',
  initialHtml = '',
  onClose,
  onSave,
}: {
  initialTitle?: string
  initialHtml?: string
  onClose: () => void
  onSave: (note: { title: string; html: string }) => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [empty, setEmpty] = useState(!initialHtml)
  const [palette, setPalette] = useState<'color' | 'highlight' | null>(null)
  const [, force] = useState(0)
  const ed = useRef<HTMLDivElement>(null)
  const editing = !!initialTitle

  useEffect(() => {
    if (ed.current) ed.current.innerHTML = initialHtml
    document.execCommand('styleWithCSS', false, 'true')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* estado da barra (negrito ativo etc.) acompanha a seleção */
  useEffect(() => {
    const onSel = () => force((n) => n + 1)
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [])

  const exec = (cmd: string, value?: string) => {
    ed.current?.focus()
    document.execCommand(cmd, false, value)
    setEmpty(!ed.current?.textContent?.trim())
    force((n) => n + 1)
  }
  const isOn = (cmd: string) => {
    try {
      return document.queryCommandState(cmd)
    } catch {
      return false
    }
  }
  const block = (() => {
    try {
      return String(document.queryCommandValue('formatBlock')).toLowerCase()
    } catch {
      return ''
    }
  })()

  const can = title.trim().length > 0 && !empty
  const save = () => {
    if (!can) return
    onSave({ title: title.trim(), html: ed.current?.innerHTML ?? '' })
    onClose()
  }

  const Tool = ({
    label,
    on = false,
    onClick,
    children,
  }: {
    label: string
    on?: boolean
    onClick: () => void
    children: ReactNode
  }) => (
    <button
      type="button"
      className={`ca-tool${on ? ' is-on' : ''}`}
      aria-label={label}
      aria-pressed={on}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )

  return (
    <AddModal
      title={editing ? 'Editar nota' : 'Nova nota'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="ss-text-btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!can} onClick={save}>
            {editing ? 'Salvar' : 'Adicionar nota'}
          </button>
        </>
      }
    >
      <input
        className="ca-note-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da nota"
        autoFocus={!editing}
        spellCheck={false}
        aria-label="Título da nota"
      />
      <div className="ca-toolbar" role="toolbar" aria-label="Formatação">
        <Tool label="Título" on={block === 'h1'} onClick={() => exec('formatBlock', block === 'h1' ? 'p' : 'h1')}>
          <Heading1 size={16} strokeWidth={2} />
        </Tool>
        <Tool label="Subtítulo" on={block === 'h2'} onClick={() => exec('formatBlock', block === 'h2' ? 'p' : 'h2')}>
          <Heading2 size={16} strokeWidth={2} />
        </Tool>
        <span className="ca-sep" />
        <Tool label="Negrito" on={isOn('bold')} onClick={() => exec('bold')}>
          <Bold size={16} strokeWidth={2.2} />
        </Tool>
        <Tool label="Itálico" on={isOn('italic')} onClick={() => exec('italic')}>
          <Italic size={16} strokeWidth={2} />
        </Tool>
        <Tool label="Sublinhado" on={isOn('underline')} onClick={() => exec('underline')}>
          <Underline size={16} strokeWidth={2} />
        </Tool>
        <Tool label="Tachado" on={isOn('strikeThrough')} onClick={() => exec('strikeThrough')}>
          <Strikethrough size={16} strokeWidth={2} />
        </Tool>
        <span className="ca-sep" />
        <span className="ca-pal-wrap">
          <Tool label="Cor do texto" on={palette === 'color'} onClick={() => setPalette((p) => (p === 'color' ? null : 'color'))}>
            <span className="ca-color-a">A</span>
          </Tool>
          {palette === 'color' && (
            <span className="ca-palette" onMouseDown={(e) => e.preventDefault()}>
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="ca-swatch"
                  style={{ background: c }}
                  aria-label={`Cor ${c}`}
                  onClick={() => {
                    exec('foreColor', c)
                    setPalette(null)
                  }}
                />
              ))}
            </span>
          )}
        </span>
        <span className="ca-pal-wrap">
          <Tool label="Marca-texto" on={palette === 'highlight'} onClick={() => setPalette((p) => (p === 'highlight' ? null : 'highlight'))}>
            <Highlighter size={16} strokeWidth={2} />
          </Tool>
          {palette === 'highlight' && (
            <span className="ca-palette" onMouseDown={(e) => e.preventDefault()}>
              {NOTE_HIGHLIGHTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="ca-swatch"
                  style={{ background: c }}
                  aria-label={`Destaque ${c}`}
                  onClick={() => {
                    exec('hiliteColor', c)
                    setPalette(null)
                  }}
                />
              ))}
              <button
                type="button"
                className="ca-swatch is-none"
                aria-label="Sem destaque"
                onClick={() => {
                  exec('hiliteColor', 'transparent')
                  setPalette(null)
                }}
              />
            </span>
          )}
        </span>
        <span className="ca-sep" />
        <Tool label="Lista" on={isOn('insertUnorderedList')} onClick={() => exec('insertUnorderedList')}>
          <List size={16} strokeWidth={2} />
        </Tool>
        <Tool label="Lista numerada" on={isOn('insertOrderedList')} onClick={() => exec('insertOrderedList')}>
          <ListOrdered size={16} strokeWidth={2} />
        </Tool>
        <Tool
          label="Checklist"
          onClick={() => exec('insertHTML', '<div>☐&nbsp;</div>')}
        >
          <ListChecks size={16} strokeWidth={2} />
        </Tool>
        <Tool
          label="Citação"
          on={block === 'blockquote'}
          onClick={() => exec('formatBlock', block === 'blockquote' ? 'p' : 'blockquote')}
        >
          <Quote size={16} strokeWidth={2} />
        </Tool>
      </div>
      <div className="ca-editor-wrap">
        {empty && <span className="ca-editor-ph">Escreva sua nota...</span>}
        <div
          ref={ed}
          className="ca-editor"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Conteúdo da nota"
          onInput={() => setEmpty(!ed.current?.textContent?.trim())}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
              e.preventDefault()
              exec('bold')
            }
          }}
        />
      </div>
    </AddModal>
  )
}

/* ---------- Da biblioteca: busca + lista (como o submenu de @ da Home) ---------- */
export function LibraryPicker({
  added,
  onPick,
}: {
  added: string[]
  onPick: (f: LibEntry) => void
}) {
  const [q, setQ] = useState('')
  const n = (t: string) =>
    t
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
  const items = LIB_FILES.filter((f) => !q || n(f.label).includes(n(q)))
  return (
    <div className="ca-lib" role="menu" onClick={(e) => e.stopPropagation()}>
      <div className="ca-lib-search">
        <Search size={14} strokeWidth={2} aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na biblioteca" autoFocus spellCheck={false} />
      </div>
      <div className="ca-lib-label">Arquivos</div>
      <div className="ca-lib-list">
        {items.map((f) => {
          const on = added.includes(f.id)
          return (
            <button
              key={f.id}
              type="button"
              role="menuitem"
              className={`ca-lib-item${on ? ' is-on' : ''}`}
              onClick={() => !on && onPick(f)}
            >
              {f.thumb ? (
                <span className="ca-lib-thumb">
                  <img src={f.thumb} alt="" />
                </span>
              ) : (
                <span
                  className="ca-lib-ic"
                  style={{ background: `color-mix(in srgb, ${f.color ?? '#8A8A82'} 14%, var(--card-surface))` }}
                >
                  <img src={f.img} alt="" />
                </span>
              )}
              <span className="ca-lib-text">
                <span className="ca-lib-name">{f.label}</span>
                <span className="ca-lib-sub">
                  {f.sub}
                  {f.size ? ` · ${f.size}` : ''}
                </span>
              </span>
              {on && <Check className="ca-lib-check" size={15} strokeWidth={2.4} />}
            </button>
          )
        })}
        {items.length === 0 && <p className="ca-lib-empty">Nada encontrado</p>}
      </div>
    </div>
  )
}
