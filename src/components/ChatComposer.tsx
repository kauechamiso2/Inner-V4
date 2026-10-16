import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './chat-home.css'
import AgentOrb from './AgentOrb'
import { CaretDownIcon, PlusIcon, VoiceWaveIcon } from './SidebarIcons'
import MentionMenu, { MENTION_LABELS } from './MentionMenu'
import { ConnectIntegrationModal } from './ChatModals'
import { connectedIntegrations, isIntegrationReady } from './integrations'
import type { Attachment, MentionItem } from './MentionMenu'
import FileDropOverlay from './FileDropOverlay'
import ModelPicker, { ModelLogo } from './ModelPicker'
import { MODEL_BY_ID, modelPrefs } from './chatModels'
import { ASSISTANT_AVATAR, SEGMENT_COLOR } from './AssistentesPage'
import dropPdf from '../assets/library/file-pdf.svg'
import dropText from '../assets/library/file-text.svg'
import dropExcel from '../assets/library/excel.svg'
import dropPpt from '../assets/library/ppt.svg'
import type { ActiveProject } from '../App'
import type { ChosenAgent } from './agents'
import microphone from '../assets/microphone.svg'
import arrowUp from '../assets/arrow-up.svg'

type InputMode = 'agente' | 'chat'

const PLACEHOLDERS: Record<InputMode, string> = {
  agente: 'Diga o que devo fazer',
  chat: 'Pergunte qualquer coisa...',
}

/* regex do highlight: @ + token conhecido (rótulo ou projeto citado, mais
   longo primeiro, para casar nomes com espaço) ou @palavra solta */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const buildMentionRe = (citations: string[]) => {
  const tokens = [...citations, ...MENTION_LABELS]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
  return new RegExp(`@(?:${tokens.join('|')})|@[\\p{L}0-9_-]*`, 'gu')
}

type MentionState = { start: number; query: string }

function findMention(value: string, caret: number): MentionState | null {
  const before = value.slice(0, caret)
  const m = before.match(/@([\p{L}0-9_-]*)$/u)
  if (!m) return null
  return { start: caret - m[0].length, query: m[1] }
}

/* variável de prompt: {{nome}} */
const VAR_RE = /\{\{([^{}\n]+)\}\}/g

/* Composer do Chat: abas Agente/Chat, editor com menções (@), anexos e o menu
   contextual. Usado na Home e dentro de um Projeto. */
export default function ChatComposer({
  mode,
  onModeChange,
  placeholder,
  excludeProjects = false,
  onPickProject,
  project = null,
  onClearProject,
  agent = null,
  intro = false,
  showTabs = true,
  collapsible = false,
  oneLine = false,
  initialFeature = null,
  prefill = null,
  onFeatureChange,
  decorateFeature,
  initialAttachments,
  onSend,
}: {
  mode: InputMode
  onModeChange: (m: InputMode) => void
  /* envia a mensagem (Enter ou botão): entrega o texto ao pai (e a integração usada) */
  onSend?: (text: string, meta?: { tool?: { label: string; img?: string; mono?: boolean } }) => void
  /* sobrescreve o placeholder padrão por modo (ex.: "Conversar em <projeto>") */
  placeholder?: string
  /* repassa ao menu de @ — esconde "Projetos" dentro de um projeto */
  excludeProjects?: boolean
  /* ao citar um projeto pelo @, ativa o contexto do projeto (gradiente etc.) */
  onPickProject?: (p: { id: string; name: string; emoji?: string; color?: string }) => void
  /* projeto ativo (Home): refletido como citação @Nome no input */
  project?: ActiveProject | null
  /* chamado quando a citação do projeto ativo é removida do input */
  onClearProject?: () => void
  /* personagem escolhido: a aba "Agente" vira a foto + nome dele */
  agent?: ChosenAgent | null
  /* destaque único de "personalização" ao cair na tela */
  intro?: boolean
  /* abas Agente/Chat — ocultadas no redesign (só o input) */
  showTabs?: boolean
  /* começa em uma linha (sem seletor de modelo) e expande ao clicar */
  collapsible?: boolean
  /* sempre em uma linha, como o input da Home (ex.: dentro de um Projeto) */
  oneLine?: boolean
  /* feature já ativa ao montar (ex.: @Tarefa vindo de "Nova tarefa") */
  initialFeature?: MentionItem | null
  /* texto colocado no input por fora (ex.: clicar numa sugestão); key muda a cada vez */
  prefill?: { text: string; key: number } | null
  /* avisa o pai quando a feature (pill) entra ou sai do input */
  onFeatureChange?: (item: MentionItem | null) => void
  /* ajusta a feature escolhida no menu (ex.: label/placeholder da variação) */
  decorateFeature?: (item: MentionItem) => MentionItem
  /* anexos que já chegam no input (ex.: "Iniciar chat" na Biblioteca) */
  initialAttachments?: Attachment[]
}) {
  const [value, setValue] = useState('')
  const setMode = onModeChange
  const [mention, setMention] = useState<MentionState | null>(null)
  const [plusOpen, setPlusOpen] = useState(false)
  /* seletor de modelos (Chat com modelos): escolha vale para todos os inputs da sessão */
  const [modelOpen, setModelOpen] = useState(false)
  const [modelId, setModelId] = useState(modelPrefs.selected)
  const [assistantPick, setAssistantPick] = useState(modelPrefs.assistant)
  /* apenas uma tool ativa por vez: ativar outra substitui a atual */
  const [feature, setFeature] = useState<MentionItem | null>(initialFeature)
  /* integração não conectada escolhida: abre o modal de conexão */
  const [connectItem, setConnectItem] = useState<MentionItem | null>(null)
  /* nomes originais das variáveis dos prompts inseridos ({{empresa}} vazio x preenchido) */
  const [promptVars, setPromptVars] = useState<string[]>([])
  /* anexos (arquivos/imagens) — vários permitidos, acima do input */
  const [attachments, setAttachments] = useState<(Attachment & { uid: string })[]>(() =>
    (initialAttachments ?? []).map((a, i) => ({ ...a, uid: `att-init-${i}` })),
  )
  /* projetos citados no texto como @Nome (tratados como tokens atômicos) */
  const [citations, setCitations] = useState<string[]>([])
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const canSend = value.trim().length > 0

  /* altura que acompanha o texto (até o max-height do CSS, depois rola).
     Mais de uma linha → .is-multiline: o input de uma linha vira o layout alto */
  const [multiline, setMultiline] = useState(false)
  const singleWidthRef = useRef(9999)
  const measureCanvas = useRef<HTMLCanvasElement | null>(null)
  useLayoutEffect(() => {
    const el = fieldRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.minHeight = '0px'
    const full = el.scrollHeight
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 24
    el.style.minHeight = ''
    /* mais de uma linha de texto (quebra manual ou por largura). Já no layout
       alto, só volta a uma linha se o texto couber na largura do campo de uma
       linha (medida guardada), evitando ficar alternando a cada tecla */
    let many: boolean
    if (value.includes('\n')) many = true
    else if (!multiline) {
      many = full > lh * 1.6
      if (!many) singleWidthRef.current = el.clientWidth
    } else {
      const cs = getComputedStyle(el)
      const ctx = (measureCanvas.current ??= document.createElement('canvas')).getContext('2d')
      if (ctx) ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const textW = ctx ? ctx.measureText(value).width : Infinity
      many = textW > singleWidthRef.current - 6
    }
    setMultiline(many)
    el.style.height = many ? `${full}px` : ''
    if (many && document.activeElement === el && el.selectionEnd === value.length) el.scrollTop = el.scrollHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  /* trocou de layout (uma linha ⇄ alto): recalcula a altura na largura nova */
  useLayoutEffect(() => {
    const el = fieldRef.current
    if (!el || !multiline) return
    el.style.height = 'auto'
    el.style.minHeight = '0px'
    const full = el.scrollHeight
    el.style.minHeight = ''
    el.style.height = `${full}px`
  }, [multiline])

  /* sugestão escolhida por fora: preenche o input e coloca o cursor no fim */
  useEffect(() => {
    if (!prefill) return
    setValue(prefill.text)
    requestAnimationFrame(() => {
      const el = fieldRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(prefill.text.length, prefill.text.length)
    })
  }, [prefill])

  const featureCb = useRef(onFeatureChange)
  featureCb.current = onFeatureChange
  useEffect(() => {
    featureCb.current?.(feature)
  }, [feature])

  /* com uma feature vinda de fora, o input já chega com o cursor */
  useEffect(() => {
    if (initialFeature) requestAnimationFrame(() => fieldRef.current?.focus())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* uma linha ⇄ expandido: as posições antes da troca viram um FLIP
     (altura do card + deslocamento de cada bloco), tudo na mesma curva */
  const wrapRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const compact = oneLine || (collapsible && !expanded)
  const flipRef = useRef<{ card: DOMRect; items: Map<Element, DOMRect> } | null>(null)
  const flipAnims = useRef<Animation[]>([])
  const isEmpty = !canSend && attachments.length === 0 && !feature

  const toggleExpanded = (open: boolean) => {
    if (!collapsible || open === expanded) return
    const card = wrapRef.current?.querySelector('.chat-input-card')
    if (card) {
      const items = new Map<Element, DOMRect>()
      card
        .querySelectorAll('.chat-input-editor, .ch-attach-wrap, .feature-pill, .chat-controls-right')
        .forEach((el) => items.set(el, el.getBoundingClientRect()))
      flipRef.current = { card: card.getBoundingClientRect(), items }
    }
    setExpanded(open)
  }

  useLayoutEffect(() => {
    const first = flipRef.current
    const card = wrapRef.current?.querySelector('.chat-input-card')
    flipRef.current = null
    if (!first || !card) return
    /* trocou no meio da animação: parte da posição visível (já medida) e
       descarta a animação anterior para ela não sobrescrever a nova */
    flipAnims.current.forEach((a) => a.cancel())
    const anims: Animation[] = []
    flipAnims.current = anims
    const opts = { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    const now = card.getBoundingClientRect()
    if (Math.abs(first.card.height - now.height) > 0.5) {
      anims.push(card.animate([{ height: `${first.card.height}px` }, { height: `${now.height}px` }], opts))
    }
    /* deltas relativos ao card: o topo dele também se move enquanto a altura anima */
    first.items.forEach((r, el) => {
      if (!el.isConnected) return
      const n = el.getBoundingClientRect()
      const dx = r.left - first.card.left - (n.left - now.left)
      const dy = r.top - first.card.top - (n.top - now.top)
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
      anims.push(el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], opts))
    })
    /* o seletor de modelo surge à direita do "+" (que só desce, sem atravessar) */
    const model = card.querySelector('.ch-model')
    if (expanded && model) {
      const a = model.animate(
        [
          { opacity: 0, transform: 'translateX(-10px) scale(0.94)' },
          { opacity: 1, transform: 'none' },
        ],
        { ...opts, delay: 90, fill: 'backwards' },
      )
      anims.push(a)
    }
  }, [expanded])

  /* recolhe ao sair (clique fora ou foco fora) se não houver nada digitado/anexado */
  useEffect(() => {
    if (!collapsible || !expanded) return
    const outside = (t: EventTarget | null) => !!t && !wrapRef.current?.contains(t as Node)
    const onDown = (e: PointerEvent) => {
      if (outside(e.target) && isEmpty && !plusOpen && !mention) toggleExpanded(false)
    }
    const onFocus = (e: FocusEvent) => {
      if (outside(e.target) && isEmpty) toggleExpanded(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('focusin', onFocus)
    }
  })

  /* envia: entrega o texto ao pai e limpa o composer */
  const submit = () => {
    /* variáveis de prompt saem sem as chaves no texto enviado */
    const text = value.replace(VAR_RE, '$1').trim()
    if (!text) return
    onSend?.(text, feature?.img ? { tool: { label: feature.label, img: feature.img, mono: feature.mono } } : undefined)
    setPromptVars([])
    setValue('')
    setCitations([])
    setAttachments([])
    setFeature(null)
    setMention(null)
    setPlusOpen(false)
  }

  const mentionRe = useMemo(() => buildMentionRe(citations), [citations])

  const syncMention = (val: string, caret: number) => {
    const next = findMention(val, caret)
    setMention(next)
    if (next) setPlusOpen(false)
  }

  const removeCitation = (name: string) =>
    setCitations((cs) => {
      const i = cs.indexOf(name)
      if (i < 0) return cs
      const next = [...cs]
      next.splice(i, 1)
      return next
    })

  /* Sincroniza a citação @Nome com o projeto ativo (Home):
     - ativar um projeto por fora do input (clicar num pin) insere @Nome no texto;
     - trocar de projeto remove a citação do projeto anterior.
     Quando o projeto é citado pelo próprio @menu a citação já existe, então aqui
     vira no-op (os guards impedem duplicar). */
  const syncedProjectRef = useRef<string | null>(null)
  useEffect(() => {
    const name = project?.name ?? null
    const prev = syncedProjectRef.current
    if (prev === name) return
    syncedProjectRef.current = name

    if (prev) {
      setValue((v) => v.replace(new RegExp(`@${escapeRe(prev)} ?`), '').replace(/^\s+/, ''))
      setCitations((cs) => cs.filter((n) => n !== prev))
    }
    if (name) {
      setCitations((cs) => (cs.includes(name) ? cs : [...cs, name]))
      if (!value.includes(`@${name}`)) {
        setValue((v) => `@${name} ${v}`)
        requestAnimationFrame(() => {
          const el = fieldRef.current
          if (!el) return
          el.focus()
          const end = el.value.length
          try {
            el.setSelectionRange(end, end)
          } catch {
            /* noop */
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  /* seleção vinda de qualquer gatilho (@ ou +): ativa a feature como pill */
  const applyItem = (item: MentionItem) => {
    // Projeto: entra como citação inline @Nome (não como pill/anexo), podendo
    // conviver com anexos; o usuário continua escrevendo logo após.
    if (item.citation) {
      // também ativa o contexto do projeto (gradiente, saudação, placeholder)
      if (item.project) onPickProject?.(item.project)
      const name = item.citation
      const token = `@${name} `
      let start: number
      let removeLen: number
      let lead = ''
      if (mention) {
        start = mention.start
        removeLen = 1 + mention.query.length
      } else {
        start = fieldRef.current?.selectionStart ?? value.length
        removeLen = 0
        if (start > 0 && !/\s$/.test(value.slice(0, start))) lead = ' '
      }
      const head = value.slice(0, start) + lead
      const next = head + token + value.slice(start + removeLen)
      const caret = head.length + token.length
      setValue(next)
      setCitations((cs) => [...cs, name])
      requestAnimationFrame(() => {
        const el = fieldRef.current
        if (el) {
          el.focus()
          el.setSelectionRange(caret, caret)
        }
      })
      setMention(null)
      setPlusOpen(false)
      return
    }

    // remove o "@query" que disparou o menu, se veio do @
    if (mention) {
      const end = mention.start + 1 + mention.query.length
      const next = `${value.slice(0, mention.start)}${value.slice(end)}`
      setValue(next)
      requestAnimationFrame(() => {
        const el = fieldRef.current
        if (el) {
          el.focus()
          el.setSelectionRange(mention.start, mention.start)
        }
      })
    }
    /* integração que ainda não foi conectada: pede a conexão antes */
    if (item.feature && !isIntegrationReady(item)) {
      setConnectItem(item)
      setMention(null)
      setPlusOpen(false)
      return
    }

    /* prompt: o texto entra no input (no lugar do @) e a 1ª variável fica selecionada */
    if (item.prompt) {
      const base = mention ? `${value.slice(0, mention.start)}${value.slice(mention.start + 1 + mention.query.length)}` : value
      const at = mention ? mention.start : base.length
      const lead = at > 0 && !/\s$/.test(base.slice(0, at)) ? '\n\n' : ''
      const next = base.slice(0, at) + lead + item.prompt + base.slice(at)
      setValue(next)
      const names = [...item.prompt.matchAll(VAR_RE)].map((m) => m[1])
      setPromptVars((v) => [...new Set([...v, ...names])])
      requestAnimationFrame(() => selectVar(next, at + lead.length))
      setMention(null)
      setPlusOpen(false)
      return
    }

    const addAttachment = (a: Attachment) =>
      setAttachments((list) => [...list, { ...a, uid: `att-${Date.now()}-${Math.random()}` }])

    if (item.attachment) {
      // seleção da Biblioteca (arquivo/imagem/coleção) entra como anexo
      addAttachment(item.attachment)
    } else if (item.id === 'upload') {
      // "Fotos e arquivos": mock de uma imagem anexada (thumb aleatória)
      const seed = Math.floor(Math.random() * 10000)
      addAttachment({
        kind: 'image',
        name: `Foto ${seed}.png`,
        fileType: 'Imagem',
        thumb: `https://picsum.photos/seed/up${seed}/120/120`,
      })
    } else {
      // itens agentOnly puxam o input para o modo Agente
      if (item.agentOnly && mode === 'chat') setMode('agente')
      if (item.feature) setFeature(decorateFeature ? decorateFeature(item) : item)
    }
    setMention(null)
    setPlusOpen(false)
  }

  /* arquivos arrastados do computador entram como anexo */
  const dropFiles = (files: File[]) =>
    setAttachments((list) => [
      ...list,
      ...files.map((f, i) => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
        const isImg = /png|jpe?g|gif|webp|svg|heic/.test(ext)
        const [fileType, img, color] = /pdf/.test(ext)
          ? ['PDF', dropPdf, '#C0392B']
          : /xls|csv|numbers/.test(ext)
            ? ['Planilha', dropExcel, '#1F7A4D']
            : /ppt|key/.test(ext)
              ? ['Slides', dropPpt, '#C15A2B']
              : ['Documento', dropText, '#3E63C4']
        const base = { uid: `att-drop-${Date.now()}-${i}`, name: f.name }
        return isImg
          ? { ...base, kind: 'image' as const, fileType: 'Imagem', thumb: URL.createObjectURL(f) }
          : { ...base, kind: 'file' as const, fileType, img, color }
      }),
    ])

  const removeAttachment = (uid: string) =>
    setAttachments((list) => list.filter((a) => a.uid !== uid))

  /* segmentos do backdrop: menções em índigo e variáveis de prompt como chips */
  const segments = useMemo(() => {
    const parts: { text: string; mention: boolean; varName?: string }[] = []
    const pushText = (t: string) => {
      let last = 0
      for (const m of t.matchAll(mentionRe)) {
        const i = m.index ?? 0
        if (i > last) parts.push({ text: t.slice(last, i), mention: false })
        parts.push({ text: m[0], mention: true })
        last = i + m[0].length
      }
      if (last < t.length) parts.push({ text: t.slice(last), mention: false })
    }
    let last = 0
    for (const m of value.matchAll(VAR_RE)) {
      const i = m.index ?? 0
      if (i > last) pushText(value.slice(last, i))
      parts.push({ text: m[0], mention: false, varName: m[1] })
      last = i + m[0].length
    }
    if (last < value.length) pushText(value.slice(last))
    return parts
  }, [value, mentionRe])

  /* seleciona o nome da variável (entre as chaves) a partir de uma posição:
     digitar substitui o nome e o chip continua */
  const selectVar = (text: string, from: number, wrap = true): boolean => {
    const el = fieldRef.current
    if (!el) return false
    const all = [...text.matchAll(VAR_RE)]
    const m = all.find((x) => (x.index ?? 0) + x[0].length > from) ?? (wrap ? all[0] : undefined)
    if (!m) return false
    const start = (m.index ?? 0) + 2
    el.focus()
    el.setSelectionRange(start, start + m[1].length)
    return true
  }
  /* clique dentro de uma variável seleciona o nome inteiro */
  const varAt = (pos: number) =>
    [...value.matchAll(VAR_RE)].find((x) => (x.index ?? 0) < pos && (x.index ?? 0) + x[0].length > pos)

  return (
    <div
      className={`chat-input-wrap${collapsible ? ' is-collapsible' : ''}${compact ? ' is-compact' : ''}${
        multiline ? ' is-multiline' : ''
      }`}
      ref={wrapRef}
      onPointerDown={() => toggleExpanded(true)}
      onFocus={() => toggleExpanded(true)}
    >
      {showTabs && (
      <div className="chat-tabs" role="tablist" aria-label="Modo do input">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'agente'}
          className={`chat-tab${mode === 'agente' ? ' is-active' : ''}${agent && intro ? ' is-intro' : ''}`}
          onClick={() => setMode('agente')}
        >
          {agent && !agent.orb ? (
            <span className="chat-tab-face" aria-hidden="true">
              <img src={agent.img} alt="" draggable={false} />
            </span>
          ) : (
            <AgentOrb size={14} />
          )}
          {agent ? agent.name : 'Agente'}
          {mode === 'agente' && (
            <>
              <span className="tab-foot tab-foot-l" aria-hidden="true" />
              <span className="tab-foot tab-foot-r" aria-hidden="true" />
            </>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'chat'}
          className={`chat-tab${mode === 'chat' ? ' is-active' : ''}`}
          onClick={() => setMode('chat')}
        >
          Chat
          {mode === 'chat' && (
            <>
              <span className="tab-foot tab-foot-l" aria-hidden="true" />
              <span className="tab-foot tab-foot-r" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      )}

      <div className="chat-input-card">
        {modelOpen && (
          <ModelPicker
            selected={modelId}
            assistant={assistantPick?.id ?? null}
            onSelect={(id) => {
              setModelId(id)
              setAssistantPick(null)
              modelPrefs.selected = id
              modelPrefs.assistant = null
            }}
            onSelectAssistant={(a) => {
              const pick = {
                id: a.id,
                name: a.name,
                color: SEGMENT_COLOR[a.segment] ?? '#6b7280',
                avatar: ASSISTANT_AVATAR[a.id],
              }
              setAssistantPick(pick)
              modelPrefs.assistant = pick
            }}
            onClose={() => setModelOpen(false)}
          />
        )}
        <FileDropOverlay
          title="Solte aqui para anexar"
          sub="Os arquivos entram como anexo da mensagem"
          onFiles={(files) => dropFiles(files)}
        />
        {attachments.length > 0 && (
          <div className="chat-attachments">
            {attachments.map((a) =>
              a.kind === 'image' ? (
                <span className="att att-image" key={a.uid}>
                  <img src={a.thumb} alt={a.name} loading="lazy" />
                  <button
                    type="button"
                    className="att-remove"
                    aria-label={`Remover ${a.name}`}
                    onClick={() => removeAttachment(a.uid)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ) : (
                <span className="att att-file" key={a.uid}>
                  <span
                    className="att-file-icon"
                    style={
                      a.color
                        ? { background: `color-mix(in srgb, ${a.color} 14%, var(--pop-surface))` }
                        : { background: 'var(--lib-tile-neutral)' }
                    }
                  >
                    {a.emoji ? <span className="att-file-emoji">{a.emoji}</span> : <img src={a.img} alt="" />}
                  </span>
                  <span className="att-file-text">
                    <span className="att-file-name">{a.name}</span>
                    <span className="att-file-sub">
                      {a.fileType}
                      {a.size ? ` · ${a.size}` : ''}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="att-remove att-remove-file"
                    aria-label={`Remover ${a.name}`}
                    onClick={() => removeAttachment(a.uid)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ),
            )}
          </div>
        )}
        <div className="chat-input-editor">
          <div className="chat-input-backdrop" ref={backdropRef} aria-hidden="true">
            {segments.map((seg, i) => (
              <Fragment key={i}>
                {seg.varName !== undefined ? (
                  <span className={`var-token${promptVars.includes(seg.varName) ? '' : ' is-filled'}`}>
                    <span className="var-brace">{'{{'}</span>
                    {seg.varName}
                    <span className="var-brace">{'}}'}</span>
                  </span>
                ) : seg.mention ? (
                  <span className="mention-token">{seg.text}</span>
                ) : (
                  seg.text
                )}
              </Fragment>
            ))}
            {'\n'}
          </div>
          <textarea
            ref={fieldRef}
            className="chat-input-field"
            placeholder={feature?.placeholder ?? placeholder ?? PLACEHOLDERS[mode]}
            rows={1}
            spellCheck={false}
            value={value}
            onChange={(e) => {
              const v = e.target.value
              setValue(v)
              // mantém só as citações que ainda existem no texto
              setCitations((cs) => cs.filter((n) => v.includes(`@${n}`)))
              // citação do projeto ativo removida → volta ao empty state da Home
              if (project && !v.includes(`@${project.name}`)) onClearProject?.()
              syncMention(v, e.target.selectionStart ?? 0)
            }}
            onKeyDown={(e) => {
              // Tab: pula para a próxima variável do prompt
              if (e.key === 'Tab' && /\{\{[^{}\n]+\}\}/.test(value)) {
                e.preventDefault()
                selectVar(value, (e.currentTarget.selectionEnd ?? 0) + 2)
                return
              }
              // Enter envia (Shift+Enter quebra linha); com o menu de @ aberto o Enter é dele
              if (e.key === 'Enter' && !e.shiftKey && !mention && !plusOpen) {
                e.preventDefault()
                submit()
                return
              }
              // citação de projeto = token atômico: apaga o @Nome inteiro
              const el = e.currentTarget
              const s = el.selectionStart ?? 0
              const en = el.selectionEnd ?? 0
              if (s !== en || citations.length === 0) return
              const tokens = citations.map((n) => `@${n}`)
              if (e.key === 'Backspace' && s > 0) {
                const before = value.slice(0, s)
                const hit = tokens
                  .filter((t) => before.endsWith(t))
                  .sort((a, b) => b.length - a.length)[0]
                if (hit) {
                  e.preventDefault()
                  const from = s - hit.length
                  const next = value.slice(0, from) + value.slice(s)
                  setValue(next)
                  removeCitation(hit.slice(1))
                  if (project && hit.slice(1) === project.name) onClearProject?.()
                  syncMention(next, from)
                  requestAnimationFrame(() => {
                    el.focus()
                    el.setSelectionRange(from, from)
                  })
                }
              } else if (e.key === 'Delete') {
                const after = value.slice(s)
                const hit = tokens
                  .filter((t) => after.startsWith(t))
                  .sort((a, b) => b.length - a.length)[0]
                if (hit) {
                  e.preventDefault()
                  const to = s + hit.length
                  const next = value.slice(0, s) + value.slice(to)
                  setValue(next)
                  removeCitation(hit.slice(1))
                  if (project && hit.slice(1) === project.name) onClearProject?.()
                  syncMention(next, s)
                  requestAnimationFrame(() => {
                    el.focus()
                    el.setSelectionRange(s, s)
                  })
                }
              }
            }}
            onKeyUp={(e) => syncMention(value, e.currentTarget.selectionStart ?? 0)}
            onClick={(e) => {
              const el = e.currentTarget
              const pos = el.selectionStart ?? 0
              if (el.selectionStart === el.selectionEnd) {
                const v = varAt(pos)
                if (v) {
                  const st = (v.index ?? 0) + 2
                  el.setSelectionRange(st, st + v[1].length)
                  return
                }
              }
              syncMention(value, pos)
            }}
            onScroll={(e) => {
              if (backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop
            }}
          />
          {mention && (
            <MentionMenu
              query={mention.query}
              mode={mode}
              excludeProjects={excludeProjects}
              onSelect={applyItem}
              onClose={() => setMention(null)}
            />
          )}
        </div>
        <div className="chat-controls" key={mode}>
          <div className="chat-controls-left">
            {mode === 'chat' && (
              <button
                className="ch-model"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={modelOpen}
                onClick={() => setModelOpen(true)}
              >
                {assistantPick ? (
                  <span
                    className="ch-model-asst"
                    style={{ '--c': assistantPick.color } as CSSProperties}
                    aria-hidden="true"
                  >
                    {assistantPick.avatar ? <img src={assistantPick.avatar} alt="" /> : assistantPick.name.charAt(0)}
                  </span>
                ) : (
                  <ModelLogo model={MODEL_BY_ID[modelId] ?? MODEL_BY_ID.fusion} size={20} />
                )}
                <span className="ch-model-name">
                  {assistantPick ? assistantPick.name : (MODEL_BY_ID[modelId] ?? MODEL_BY_ID.fusion).name}
                </span>
                <CaretDownIcon />
              </button>
            )}
            <span className="ch-attach-wrap">
              <button
                className="ch-attach"
                type="button"
                aria-label="Adicionar"
                aria-haspopup="menu"
                aria-expanded={plusOpen}
                onClick={() => {
                  setMention(null)
                  setPlusOpen((o) => !o)
                }}
              >
                <PlusIcon />
                <span className="pill-tooltip ch-attach-tip" role="tooltip" aria-hidden="true">
                  Adicionar
                </span>
              </button>
              {plusOpen && (
                <MentionMenu
                  query=""
                  variant="plus"
                  mode={mode}
                  excludeProjects={excludeProjects}
                  onSelect={applyItem}
                  onClose={() => setPlusOpen(false)}
                />
              )}
            </span>
            {feature && (
              <span className="feature-pill" key={feature.id}>
                <button
                  type="button"
                  className={`fp-remove${feature.mono ? ' is-mono' : ''}`}
                  aria-label={`Remover ${feature.label}`}
                  onClick={() => setFeature(null)}
                >
                  <span className="fp-glyph">
                    {feature.img ? <img src={feature.img} alt="" /> : feature.icon}
                  </span>
                  <span className="fp-x" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="pill-tooltip fp-tip" role="tooltip" aria-hidden="true">
                    Remover {feature.label}
                  </span>
                </button>
                <span className="fp-label">{feature.label}</span>
              </span>
            )}
          </div>
          <div className="chat-controls-right">
            <button className="chat-mic" type="button" aria-label="Falar">
              <img src={microphone} alt="" aria-hidden="true" />
            </button>
            {mode === 'chat' && !canSend ? (
              <button className="ch-voice" type="button" aria-label="Modo de voz avançado">
                <VoiceWaveIcon />
              </button>
            ) : (
              <button
                className={`chat-send${canSend ? ' is-ready' : ''}`}
                type="button"
                aria-label="Enviar"
                disabled={!canSend}
                onClick={submit}
              >
                <img src={arrowUp} alt="" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
      {connectItem && (
        <ConnectIntegrationModal
          name={connectItem.label}
          img={connectItem.img}
          mono={connectItem.mono}
          onClose={() => setConnectItem(null)}
          onConnected={() => {
            connectedIntegrations.add(connectItem.id)
            if (connectItem.agentOnly && mode === 'chat') setMode('agente')
            setFeature(decorateFeature ? decorateFeature(connectItem) : connectItem)
            requestAnimationFrame(() => fieldRef.current?.focus())
          }}
        />
      )}
    </div>
  )
}
