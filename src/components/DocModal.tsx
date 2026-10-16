import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { Bold, Check, Copy, Download, Heading1, Heading2, Italic, List, ListOrdered, Pencil, Pilcrow, Quote, RotateCcw, Strikethrough, Underline, X } from 'lucide-react'
import type { ReactNode } from 'react'
import './image-modal.css'
import './doc-modal.css'

/* Detalhe de um documento gerado (pilar de Documentos). Mesmo modal das
   imagens e vídeos: informações à esquerda (prompt, detalhes, Baixar e
   Regerar) e, no palco, a folha do documento com "Editar" → "Salvar". */

export type DocResult = {
  title: string
  /* blocos do texto; linhas com "## " viram subtítulo */
  blocks: string[]
  prompt: string
  model: string
  /* nome e id do template (o "Regerar" abre o flow dele) */
  template: string
  tool: string
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const toHtml = (d: DocResult) =>
  `<h1>${esc(d.title)}</h1>` +
  d.blocks.map((b) => (b.startsWith('## ') ? `<h2>${esc(b.slice(3))}</h2>` : `<p>${esc(b)}</p>`)).join('')

type Props = {
  doc: DocResult
  closing: boolean
  onClose: () => void
  onRegenerate?: () => void
}

export default function DocModal({ doc, closing, onClose, onRegenerate }: Props) {
  const [html, setHtml] = useState(() => toHtml(doc))
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState<'prompt' | 'text' | null>(null)
  /* muda a cada "Salvar"/descartar para remontar a folha com o conteúdo certo */
  const [ver, setVer] = useState(0)
  const paperRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const [words, setWords] = useState(0)
  useEffect(() => {
    const txt = paperRef.current?.innerText ?? ''
    setWords(txt.trim() ? txt.trim().split(/\s+/).length : 0)
  }, [html])

  /* o modal abre à direita da sidebar, deixando-a aparente */
  const [leftOffset, setLeftOffset] = useState(0)
  useLayoutEffect(() => {
    const measure = () => {
      const sb = document.querySelector('.sidebar') as HTMLElement | null
      setLeftOffset(sb ? sb.getBoundingClientRect().width : 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const startEdit = (at?: { x: number; y: number }) => {
    setSaved(false)
    setEditing(true)
    /* cursor onde o usuário clicou (ou no fim do primeiro parágrafo) */
    later(() => {
      const el = paperRef.current
      if (!el) return
      el.focus()
      let r: Range | null = null
      if (at && document.caretRangeFromPoint) r = document.caretRangeFromPoint(at.x, at.y)
      if (!r || !el.contains(r.startContainer)) {
        const p = el.querySelector('p') ?? el
        r = document.createRange()
        r.selectNodeContents(p)
        r.collapse(false)
      }
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(r)
      refreshFormats()
    }, 30)
  }

  /* ---------- formatação (barra que aparece no modo de edição) ---------- */
  const [formats, setFormats] = useState<Record<string, boolean>>({})
  const refreshFormats = () => {
    const el = paperRef.current
    const sel = window.getSelection()
    if (!el || !sel?.anchorNode || !el.contains(sel.anchorNode)) return
    const block = String(document.queryCommandValue('formatBlock') || '').toLowerCase()
    setFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      h1: block === 'h1',
      h2: block === 'h2',
      blockquote: block === 'blockquote',
      p: block === 'p' || block === 'div' || block === '',
    })
  }
  useEffect(() => {
    if (!editing) return
    document.addEventListener('selectionchange', refreshFormats)
    return () => document.removeEventListener('selectionchange', refreshFormats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])
  const exec = (cmd: string, value?: string) => {
    paperRef.current?.focus()
    /* bloco: clicar de novo no mesmo estilo volta para parágrafo */
    if (cmd === 'formatBlock' && value && formats[value]) value = 'p'
    /* dentro de uma lista, sai dela antes de virar título/parágrafo/citação */
    if (cmd === 'formatBlock') {
      if (document.queryCommandState('insertUnorderedList')) document.execCommand('insertUnorderedList')
      if (document.queryCommandState('insertOrderedList')) document.execCommand('insertOrderedList')
    }
    document.execCommand(cmd, false, value ? `<${value}>` : undefined)
    /* o navegador às vezes embrulha o texto em <span style>; desembrulha */
    paperRef.current?.querySelectorAll('span[style]').forEach((sp) => sp.replaceWith(...Array.from(sp.childNodes)))
    refreshFormats()
  }

  const save = () => {
    setHtml(paperRef.current?.innerHTML ?? html)
    setEditing(false)
    setVer((v) => v + 1)
    setSaved(true)
    later(() => setSaved(false), 1800)
  }
  const discard = () => {
    setEditing(false)
    setVer((v) => v + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing && (e.metaKey || e.ctrlKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
        /* atalhos nativos já formatam; só atualiza a barra */
        window.setTimeout(refreshFormats, 0)
      }
      if (editing && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
        return
      }
      if (e.key !== 'Escape') return
      /* editando, o Esc só sai da edição (sem salvar) */
      if (editing) discard()
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, onClose, html])

  const copy = (what: 'prompt' | 'text') => {
    try {
      navigator.clipboard?.writeText(what === 'prompt' ? doc.prompt : (paperRef.current?.innerText ?? ''))
    } catch {
      /* clipboard indisponível (ex.: contexto inseguro) */
    }
    setCopied(what)
    later(() => setCopied(null), 1500)
  }

  return createPortal(
    <div
      className={`img-modal${closing ? ' is-closing' : ''}`}
      style={{ left: leftOffset } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhe do documento"
      onClick={() => (editing ? undefined : onClose())}
    >
      <div className="img-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* ---------- Coluna de informações (esquerda) ---------- */}
        <aside className="imm-info">
          <div className="imm-scroll">
            <section className="imm-sec">
              <div className="imm-sec-head">
                <span className="imm-sec-title">Prompt</span>
                <button type="button" className="imm-copy" onClick={() => copy('prompt')}>
                  {copied === 'prompt' ? <Check size={13} strokeWidth={2.4} /> : <Copy size={13} strokeWidth={2} />}
                  {copied === 'prompt' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="imm-prompt">{doc.prompt}</p>
            </section>

            <section className="imm-sec">
              <span className="imm-sec-title">Detalhes</span>
              <dl className="imm-details">
                <div className="imm-row">
                  <dt>Template</dt>
                  <dd>{doc.template}</dd>
                </div>
                <div className="imm-row">
                  <dt>Modelo</dt>
                  <dd>{doc.model}</dd>
                </div>
                <div className="imm-row">
                  <dt>Palavras</dt>
                  <dd>{words}</dd>
                </div>
                <div className="imm-row">
                  <dt>Criado em</dt>
                  <dd>16 de outubro de 2026, 14:32</dd>
                </div>
              </dl>
            </section>
          </div>

          <footer className="imm-actions">
            <button type="button" className="imm-cta">
              <Download size={15} strokeWidth={2} />
              Baixar
            </button>
            <button type="button" className="imm-btn" onClick={onRegenerate}>
              <RotateCcw size={15} strokeWidth={2} />
              Regerar
            </button>
          </footer>
        </aside>

        {/* ---------- Palco: a folha do documento ---------- */}
        <div className={`imm-stage dm-stage${editing ? ' is-editing' : ''}`}>
          <button type="button" className="imm-close" aria-label="Fechar" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>

          <div className="dm-bar">
            <span className="dm-bar-title" title={doc.title}>
              {doc.title}
            </span>
            {saved && (
              <span className="dm-saved" role="status">
                <Check size={13} strokeWidth={2.6} />
                Salvo
              </span>
            )}
            <div className="dm-bar-actions">
              {!editing && (
                <button type="button" className="dm-btn is-icon" aria-label="Copiar texto" title="Copiar texto" onClick={() => copy('text')}>
                  {copied === 'text' ? <Check size={15} strokeWidth={2.4} /> : <Copy size={15} strokeWidth={2} />}
                </button>
              )}
              {/* "Editar" vira "Salvar" (primário) no mesmo lugar */}
              <button
                type="button"
                className={`dm-btn dm-edit${editing ? ' is-primary' : ''}`}
                onClick={editing ? save : () => startEdit()}
              >
                <span className="dm-edit-ic" key={editing ? 's' : 'e'}>
                  {editing ? <Check size={15} strokeWidth={2.4} /> : <Pencil size={14} strokeWidth={2} />}
                </span>
                {editing ? 'Salvar' : 'Editar'}
              </button>
            </div>
          </div>

          {/* barra de formatação: desliza para baixo ao entrar no modo de edição */}
          <div className={`dm-tools-wrap${editing ? ' is-open' : ''}`} aria-hidden={!editing}>
            <div className="dm-tools" role="toolbar" aria-label="Formatação">
              <ToolBtn label="Título" on={formats.h1} onClick={() => exec('formatBlock', 'h1')} tab={editing}>
                <Heading1 size={16} strokeWidth={2} />
              </ToolBtn>
              <ToolBtn label="Subtítulo" on={formats.h2} onClick={() => exec('formatBlock', 'h2')} tab={editing}>
                <Heading2 size={16} strokeWidth={2} />
              </ToolBtn>
              <ToolBtn label="Texto" on={formats.p && !formats.insertUnorderedList && !formats.insertOrderedList} onClick={() => exec('formatBlock', 'p')} tab={editing}>
                <Pilcrow size={15} strokeWidth={2} />
              </ToolBtn>
              <span className="dm-tools-sep" />
              <ToolBtn label="Negrito (⌘B)" on={formats.bold} onClick={() => exec('bold')} tab={editing}>
                <Bold size={15} strokeWidth={2.4} />
              </ToolBtn>
              <ToolBtn label="Itálico (⌘I)" on={formats.italic} onClick={() => exec('italic')} tab={editing}>
                <Italic size={15} strokeWidth={2.2} />
              </ToolBtn>
              <ToolBtn label="Sublinhado (⌘U)" on={formats.underline} onClick={() => exec('underline')} tab={editing}>
                <Underline size={15} strokeWidth={2.2} />
              </ToolBtn>
              <ToolBtn label="Tachado" on={formats.strikeThrough} onClick={() => exec('strikeThrough')} tab={editing}>
                <Strikethrough size={15} strokeWidth={2.2} />
              </ToolBtn>
              <span className="dm-tools-sep" />
              <ToolBtn label="Lista" on={formats.insertUnorderedList} onClick={() => exec('insertUnorderedList')} tab={editing}>
                <List size={16} strokeWidth={2} />
              </ToolBtn>
              <ToolBtn label="Lista numerada" on={formats.insertOrderedList} onClick={() => exec('insertOrderedList')} tab={editing}>
                <ListOrdered size={16} strokeWidth={2} />
              </ToolBtn>
              <ToolBtn label="Citação" on={formats.blockquote} onClick={() => exec('formatBlock', 'blockquote')} tab={editing}>
                <Quote size={15} strokeWidth={2} />
              </ToolBtn>
            </div>
          </div>

          <div className="dm-scroll">
            <div
              key={ver}
              ref={paperRef}
              className={`dm-paper${editing ? '' : ' is-readonly'}`}
              contentEditable={editing}
              suppressContentEditableWarning
              spellCheck={editing}
              aria-label={editing ? 'Editar documento' : 'Clique para editar'}
              role={editing ? 'textbox' : undefined}
              aria-multiline={editing || undefined}
              title={editing ? undefined : 'Clique para editar'}
              onClick={editing ? undefined : (e) => startEdit({ x: e.clientX, y: e.clientY })}
              onKeyUp={editing ? refreshFormats : undefined}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* botão da barra de formatação (mousedown não tira a seleção do texto) */
function ToolBtn({ label, on, onClick, tab, children }: { label: string; on?: boolean; onClick: () => void; tab: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`dm-tool${on ? ' is-on' : ''}`}
      aria-label={label}
      aria-pressed={!!on}
      title={label}
      tabIndex={tab ? 0 : -1}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
