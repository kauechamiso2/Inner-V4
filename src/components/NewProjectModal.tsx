import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, FileText, Plus, X } from 'lucide-react'
import IconPicker from './IconPicker'
import { PROJECT_COLORS, ProjectGlyph } from './projectIcons'
import './context-modal.css'
import './edit-task.css'
import './create-task.css'
import './site-modals.css'
import './new-project.css'

export type NewProject = {
  name: string
  description: string
  instructions: string
  icon: string
  color: string
  files: string[]
}

/* cor "preta" acompanha o tema (fica clara no modo escuro) */
export const glyphColor = (c: string) => (c === PROJECT_COLORS[0] ? 'var(--text-strong)' : c)

/* Novo projeto: ícone + cor, nome, instruções e contexto (upload opcional) */
export default function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (p: NewProject) => void
}) {
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [icon, setIcon] = useState('📁')
  const [color, setColor] = useState(PROJECT_COLORS[5])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [files, setFiles] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  /* nome e instruções são obrigatórios */
  const can = name.trim().length > 0 && instructions.trim().length > 0

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pickerOpen) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen])

  const create = () => {
    if (!can) return
    onCreate({ name: name.trim(), description: description.trim(), instructions: instructions.trim(), icon, color, files })
    close()
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal np-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Novo projeto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head np-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Novo projeto</h2>
            <p className="ctx-modal-sub">Reúna conversas, instruções e arquivos num só lugar.</p>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="ctx-modal-body et-body np-body">
          <div className="et-field">
            <label className="et-label" htmlFor="np-name">
              Nome do projeto
            </label>
            <div className="np-name-row">
              <span className="np-icon-wrap">
                <button
                  type="button"
                  className={`np-icon-btn${pickerOpen ? ' is-open' : ''}`}
                  aria-label="Escolher ícone e cor"
                  aria-expanded={pickerOpen}
                  style={{ background: `color-mix(in srgb, ${color} 14%, var(--pop-surface))` }}
                  onClick={() => setPickerOpen((o) => !o)}
                >
                  <ProjectGlyph icon={icon} size={20} />
                  <ChevronDown className="np-icon-caret" size={12} strokeWidth={2.4} />
                </button>
                {pickerOpen && (
                  <IconPicker
                    icon={icon}
                    color={color}
                    onIcon={(id) => {
                      setIcon(id)
                      setPickerOpen(false)
                    }}
                    onColor={setColor}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </span>
              <input
                id="np-name"
                className="et-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Viagem de férias, Clientes, Estudos"
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>

          <div className="et-field">
            <label className="et-label" htmlFor="np-desc">
              Descrição do projeto
            </label>
            <input
              id="np-desc"
              className="et-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Com o que você vai trabalhar nesse projeto?"
              spellCheck={false}
            />
          </div>

          <div className="et-field">
            <label className="et-label" htmlFor="np-instr">
              Instruções
            </label>
            <textarea
              id="np-instr"
              className="instr-textarea np-textarea"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Defina o contexto e personalize como seu agente responde neste projeto"
              spellCheck={false}
            />
          </div>

          <div className="et-field">
            <span className="et-label">
              Contexto <span className="np-opt">(opcional)</span>
            </span>
            {/* simples: "+ Adicionar contexto" e, com arquivos, um chip com a contagem */}
            <div className="np-ctx-row">
              <button type="button" className="np-ctx-add" onClick={() => fileRef.current?.click()}>
                <Plus size={15} strokeWidth={2.2} />
                Adicionar contexto
              </button>
              {files.length > 0 && (
                <span className="np-ctx-chip" title={files.join('\n')}>
                  <FileText size={14} strokeWidth={2} aria-hidden="true" />
                  {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'}
                  <button
                    type="button"
                    className="np-file-x"
                    aria-label="Remover arquivos"
                    onClick={() => setFiles([])}
                  >
                    <X size={12} strokeWidth={2.4} />
                  </button>
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const names = Array.from(e.target.files ?? []).map((f) => f.name)
                if (names.length) setFiles((fs) => [...fs, ...names.filter((n) => !fs.includes(n))])
                e.target.value = ''
              }}
            />
          </div>
        </div>

        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="ss-text-btn" onClick={close}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!can} onClick={create}>
            Criar projeto
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

/* Configurações do projeto: nome e ícone/cor (mesmo seletor do "Novo projeto") */
export function ProjectSettingsModal({
  name: initialName,
  description: initialDescription = '',
  icon: initialIcon,
  color: initialColor,
  onClose,
  onSave,
}: {
  name: string
  description?: string
  icon: string
  color: string
  onClose: () => void
  onSave: (p: { name: string; description: string; icon: string; color: string }) => void
}) {
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState(initialName)
  const [icon, setIcon] = useState(initialIcon)
  const [color, setColor] = useState(initialColor)
  const [description, setDescription] = useState(initialDescription)
  const [pickerOpen, setPickerOpen] = useState(false)
  const changed =
    name.trim() !== initialName ||
    description.trim() !== initialDescription ||
    icon !== initialIcon ||
    color !== initialColor
  const can = name.trim().length > 0 && changed

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pickerOpen) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen])
  const save = () => {
    if (!can) return
    onSave({ name: name.trim(), description: description.trim(), icon, color })
    close()
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal np-modal np-settings"
        role="dialog"
        aria-modal="true"
        aria-label="Configurações do projeto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head np-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">Configurações do projeto</h2>
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>
        <div className="ctx-modal-body et-body np-body">
          <div className="et-field">
            <label className="et-label" htmlFor="ps-name">
              Nome do projeto
            </label>
            <div className="np-name-row">
              <span className="np-icon-wrap">
                <button
                  type="button"
                  className={`np-icon-btn${pickerOpen ? ' is-open' : ''}`}
                  aria-label="Escolher ícone e cor"
                  aria-expanded={pickerOpen}
                  style={{ background: `color-mix(in srgb, ${color} 14%, var(--pop-surface))` }}
                  onClick={() => setPickerOpen((o) => !o)}
                >
                  <ProjectGlyph icon={icon} size={20} />
                  <ChevronDown className="np-icon-caret" size={12} strokeWidth={2.4} />
                </button>
                {pickerOpen && (
                  <IconPicker
                    icon={icon}
                    color={color}
                    onIcon={(id) => {
                      setIcon(id)
                      setPickerOpen(false)
                    }}
                    onColor={setColor}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </span>
              <input
                id="ps-name"
                className="et-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>
          <div className="et-field">
            <label className="et-label" htmlFor="ps-desc">
              Descrição do projeto
            </label>
            <input
              id="ps-desc"
              className="et-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Com o que você vai trabalhar nesse projeto?"
              spellCheck={false}
            />
          </div>
        </div>
        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="ss-text-btn" onClick={close}>
            Cancelar
          </button>
          <button type="button" className="instr-save" disabled={!can} onClick={save}>
            Salvar
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

/* Nova base de conhecimento: ícone + cor, nome e descrição. A base nasce vazia. */
export function NewKnowledgeBaseModal({
  onClose,
  onCreate,
  initial,
}: {
  onClose: () => void
  onCreate: (kb: { name: string; description: string; icon: string; color: string }) => void
  /* presente: modo edição ("Editar base", campos preenchidos e "Salvar") */
  initial?: { name: string; description: string; icon: string; color: string }
}) {
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '📚')
  const [color, setColor] = useState(initial?.color ?? PROJECT_COLORS[5])
  const [pickerOpen, setPickerOpen] = useState(false)
  const changed =
    !initial ||
    name.trim() !== initial.name ||
    description.trim() !== initial.description ||
    icon !== initial.icon ||
    color !== initial.color
  const can = name.trim().length > 0 && changed

  const close = () => {
    setClosing(true)
    window.setTimeout(onClose, 180)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pickerOpen) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen])
  const create = () => {
    if (!can) return
    onCreate({ name: name.trim(), description: description.trim(), icon, color })
    close()
  }

  return createPortal(
    <div className={`ctx-overlay${closing ? ' is-closing' : ''}`} onClick={close}>
      <div
        className="ctx-modal np-modal np-settings"
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Editar base de conhecimento' : 'Nova base de conhecimento'}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ctx-modal-head sm-head np-head">
          <div className="ctx-modal-head-text">
            <h2 className="ctx-modal-title">{initial ? 'Editar base de conhecimento' : 'Nova base de conhecimento'}</h2>
            {!initial && <p className="ctx-modal-sub">Agrupe arquivos para o agente usar como conhecimento.</p>}
          </div>
          <button className="ctx-modal-close" type="button" aria-label="Fechar" onClick={close}>
            <X size={18} strokeWidth={2} />
          </button>
        </header>
        <div className="ctx-modal-body et-body np-body">
          <div className="et-field">
            <label className="et-label" htmlFor="kb-name">
              Nome
            </label>
            <div className="np-name-row">
              <span className="np-icon-wrap">
                <button
                  type="button"
                  className={`np-icon-btn${pickerOpen ? ' is-open' : ''}`}
                  aria-label="Escolher ícone e cor"
                  aria-expanded={pickerOpen}
                  style={{ background: `color-mix(in srgb, ${color} 14%, var(--pop-surface))` }}
                  onClick={() => setPickerOpen((o) => !o)}
                >
                  <ProjectGlyph icon={icon} size={20} />
                  <ChevronDown className="np-icon-caret" size={12} strokeWidth={2.4} />
                </button>
                {pickerOpen && (
                  <IconPicker
                    icon={icon}
                    color={color}
                    onIcon={(id) => {
                      setIcon(id)
                      setPickerOpen(false)
                    }}
                    onColor={setColor}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </span>
              <input
                id="kb-name"
                className="et-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
                placeholder="Ex.: Suporte ao cliente, Jurídico, Onboarding"
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>
          <div className="et-field">
            <label className="et-label" htmlFor="kb-desc">
              Descrição <span className="np-opt">(opcional)</span>
            </label>
            <textarea
              id="kb-desc"
              className="instr-textarea kb-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Que tipo de conhecimento fica aqui e quando o agente deve usar?"
              spellCheck={false}
            />
          </div>
        </div>
        <footer className="ctx-modal-foot sm-foot is-end">
          <button type="button" className="instr-save" disabled={!can} onClick={create}>
            {initial ? 'Salvar' : 'Criar base'}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
