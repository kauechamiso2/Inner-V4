import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Folder,
  FolderInput,
  FolderPlus,
  Files,
  Library,
  Minus,
  MoreHorizontal,
  Pencil,
  SquarePen,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import './library-page.css'
import './tasks-page.css'
import './collection-detail.css'
import './library-bulk.css'
import { ConfirmDeleteModal, NewFolderModal } from './ChatModals'
import FileDropOverlay from './FileDropOverlay'
import type { Attachment } from './MentionMenu'
import KnowledgeBaseDetail from './KnowledgeBaseDetail'
import TutorialEmpty, { LibraryArt } from './TutorialEmpty'
import SearchToggle, { SearchEmpty, normSearch } from './SearchToggle'
import {
  KNOWLEDGE_BASES,
  addKnowledgeBase,
  removeKnowledgeBase,
  restoreKnowledgeBase,
  updateKnowledgeBase,
} from './knowledgeBases'
import type { KnowledgeBase } from './knowledgeBases'
import KnowledgeBaseMenu from './KnowledgeBaseMenu'
import { NewKnowledgeBaseModal } from './NewProjectModal'
import icDotsActions from '../assets/library/dots-actions.svg'
import fPdf from '../assets/library/file-pdf.svg'
import fImage from '../assets/library/file-image.svg'
import fText from '../assets/library/file-text.svg'
import fPpt from '../assets/library/ppt.svg'
import fExcel from '../assets/library/excel.svg'
import fVideo from '../assets/library/video.svg'
import fWave from '../assets/library/waveform.svg'
import fGlobe from '../assets/library/globe-file.svg'
import fZip from '../assets/library/filezip.svg'

const FILE_FILTERS = ['Todos', 'Texto e PDF', 'Slides', 'Planilhas', 'Imagens', 'Vídeos', 'Áudio', 'Outros']

type FileRow = {
  name: string
  type: string
  modified: string
  icon: string
  color: string
  thumb?: string
  /* pasta (criada pelo "+ Novo" ou de exemplo) */
  folder?: boolean
  uid: string
  /* enviado pelo usuário ou gerado no Inner AI (filtro "Origem") */
  origin?: 'upload' | 'gerado'
}

/* tipo legível a partir da extensão do arquivo enviado */
function rowFromFile(f: File, i: number): FileRow {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  const kind: [string, string, string] = /pdf/.test(ext)
    ? ['PDF', fPdf, '#C0392B']
    : /png|jpe?g|gif|webp|svg|heic/.test(ext)
      ? ['Imagem', fImage, '#7C4DC0']
      : /ppt|key/.test(ext)
        ? ['Slides', fPpt, '#C15A2B']
        : /xls|csv|numbers/.test(ext)
          ? ['Planilha', fExcel, '#1F7A4D']
          : /mp4|mov|webm/.test(ext)
            ? ['Vídeo', fVideo, '#4C52C4']
            : /mp3|wav|m4a/.test(ext)
              ? ['Áudio', fWave, '#C98A2D']
              : /zip|rar/.test(ext)
                ? ['Arquivo', fZip, '#8A8A82']
                : ['Documento', fText, '#3E63C4']
  const isImg = kind[0] === 'Imagem'
  return {
    uid: `up-${Date.now()}-${i}`,
    name: f.name,
    type: kind[0],
    modified: 'agora',
    icon: kind[1],
    color: kind[2],
    thumb: isImg ? URL.createObjectURL(f) : undefined,
    origin: 'upload',
  }
}

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/80/80`

const FILES: FileRow[] = [
  { uid: 'f1', origin: 'upload', name: 'Guia de marca Inner 2026', type: 'PDF', modified: 'há 2 horas', icon: fPdf, color: '#C0392B' },
  { uid: 'f2', origin: 'gerado', name: 'Hero 3D do site novo', type: 'Imagem', modified: 'há 3 horas', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-hero') },
  { uid: 'f3', origin: 'upload', name: 'Roteiro: vídeo institucional', type: 'Documento', modified: 'há 5 horas', icon: fText, color: '#3E63C4' },
  { uid: 'f4', origin: 'upload', name: 'Deck de vendas Q4', type: 'Slides', modified: 'ontem', icon: fPpt, color: '#C15A2B' },
  { uid: 'f5', origin: 'upload', name: 'Planilha de criativos: outubro', type: 'Planilha', modified: 'ontem', icon: fExcel, color: '#1F7A4D' },
  { uid: 'f6', origin: 'gerado', name: 'Banner da Black Friday', type: 'Imagem', modified: 'ontem', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-banner') },
  { uid: 'f7', origin: 'gerado', name: 'Teaser do lançamento V4.mp4', type: 'Vídeo', modified: '2 dias atrás', icon: fVideo, color: '#4C52C4' },
  { uid: 'f8', origin: 'gerado', name: 'Jingle da campanha de verão', type: 'Áudio', modified: '2 dias atrás', icon: fWave, color: '#C98A2D' },
  { uid: 'f9', origin: 'upload', name: 'Pesquisa de concorrentes', type: 'Website', modified: '3 dias atrás', icon: fGlobe, color: '#2563B8' },
  { uid: 'f10', origin: 'upload', name: 'Contrato de parceria.pdf', type: 'PDF', modified: '3 dias atrás', icon: fPdf, color: '#C0392B' },
  { uid: 'f11', origin: 'upload', name: 'Fotos do ensaio de produto', type: 'Imagem', modified: '4 dias atrás', icon: fImage, color: '#7C4DC0', thumb: thumb('lib-ensaio') },
  { uid: 'f12', origin: 'upload', name: 'Export de assets: marca.zip', type: 'Arquivo', modified: '4 dias atrás', icon: fZip, color: '#8A8A82' },
  { uid: 'f13', origin: 'gerado', name: 'Narração do onboarding', type: 'Áudio', modified: '5 dias atrás', icon: fWave, color: '#C98A2D' },
  { uid: 'f14', origin: 'upload', name: 'Relatório de métricas: setembro', type: 'Planilha', modified: '5 dias atrás', icon: fExcel, color: '#1F7A4D' },
  { uid: 'f15', origin: 'upload', name: 'Apresentação para investidores', type: 'Slides', modified: '1 semana atrás', icon: fPpt, color: '#C15A2B' },
]

/* pastas de exemplo (destino do "Mover para pasta") */
const FOLDERS: FileRow[] = [
  { uid: 'fd-campanhas', name: 'Campanhas 2026', type: 'Pasta', modified: 'há 2 dias', icon: '', color: '#8A8A82', folder: true },
  { uid: 'fd-contratos', name: 'Contratos', type: 'Pasta', modified: '1 semana atrás', icon: '', color: '#8A8A82', folder: true },
]

/* pills: tipo do arquivo */
const PILL_TYPES: Record<string, string[]> = {
  'Texto e PDF': ['PDF', 'Documento'],
  Slides: ['Slides'],
  Planilhas: ['Planilha'],
  Imagens: ['Imagem'],
  Vídeos: ['Vídeo'],
  Áudio: ['Áudio'],
  Outros: ['Website', 'Arquivo', 'Pasta'],
}

/* idade aproximada a partir do texto "Modificado" */
const ageOf = (m: string) =>
  /agora|hora|minuto/.test(m) ? 'day' : /ontem|dias? atrás|há \d+ dias?/.test(m) ? 'week' : 'older'

/* filtro (menu): quando foi modificado e de onde veio; grupos se somam (E), opções do grupo (OU) */
const FILE_FILTER_GROUPS: { label: string; items: { id: string; label: string; test: (f: FileRow) => boolean }[] }[] = [
  {
    label: 'Tipo',
    items: [
      { id: 't-doc', label: 'Texto e PDF', test: (f) => ['PDF', 'Documento'].includes(f.type) },
      { id: 't-slides', label: 'Slides', test: (f) => f.type === 'Slides' },
      { id: 't-sheet', label: 'Planilhas', test: (f) => f.type === 'Planilha' },
      { id: 't-img', label: 'Imagens', test: (f) => f.type === 'Imagem' },
      { id: 't-video', label: 'Vídeos', test: (f) => f.type === 'Vídeo' },
      { id: 't-audio', label: 'Áudio', test: (f) => f.type === 'Áudio' },
      { id: 't-folder', label: 'Pastas', test: (f) => !!f.folder },
      { id: 't-other', label: 'Outros', test: (f) => ['Website', 'Arquivo'].includes(f.type) },
    ],
  },
  {
    label: 'Modificado',
    items: [
      { id: 'day', label: 'Últimas 24 horas', test: (f) => ageOf(f.modified) === 'day' },
      { id: 'week', label: 'Últimos 7 dias', test: (f) => ageOf(f.modified) !== 'older' },
      { id: 'older', label: 'Mais antigos', test: (f) => ageOf(f.modified) === 'older' },
    ],
  },
  {
    label: 'Origem',
    items: [
      { id: 'upload', label: 'Enviados por você', test: (f) => !f.folder && f.origin !== 'gerado' },
      { id: 'gerado', label: 'Gerados no Inner AI', test: (f) => f.origin === 'gerado' },
    ],
  },
]

/* arquivo como anexo do input do chat ("Iniciar chat") */
function toAttachment(f: FileRow): Attachment {
  if (f.folder) return { kind: 'collection', name: f.name, fileType: 'Pasta', emoji: '📁' }
  if (f.thumb) return { kind: 'image', name: f.name, fileType: f.type, thumb: f.thumb }
  return { kind: 'file', name: f.name, fileType: f.type, img: f.icon, color: f.color }
}

/* "Baixar": arquivo de exemplo com o nome do item (protótipo) */
const EXT: Record<string, string> = {
  PDF: 'pdf', Documento: 'docx', Slides: 'pptx', Planilha: 'xlsx', Imagem: 'png',
  Vídeo: 'mp4', Áudio: 'mp3', Website: 'html', Arquivo: 'zip',
}
function downloadFile(f: FileRow) {
  const ext = EXT[f.type] ?? 'txt'
  const name = /\.[a-z0-9]{2,4}$/i.test(f.name) ? f.name : `${f.name}.${ext}`
  const blob = new Blob([`${f.name}\n\nArquivo de exemplo da Biblioteca (protótipo Inner AI).`], {
    type: 'application/octet-stream',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ícone do arquivo na lista: miniatura, pasta ou ícone do tipo */
function FileIcon({ file }: { file: FileRow }) {
  if (file.thumb) {
    return (
      <span className="file-icon is-thumb">
        <img src={file.thumb} alt="" loading="lazy" />
      </span>
    )
  }
  return (
    <span className="file-icon" style={{ background: `color-mix(in srgb, ${file.color} 14%, var(--card-surface))` }}>
      {file.folder ? <Folder size={17} strokeWidth={1.7} color="var(--text-soft)" /> : <img src={file.icon} alt="" />}
    </span>
  )
}

export default function LibraryPage({
  empty = false,
  onStartChat,
}: {
  empty?: boolean
  /* "Iniciar chat": abre a Home com os arquivos selecionados no input */
  onStartChat?: (items: Attachment[]) => void
}) {
  const [filter, setFilter] = useState('Todos')
  /* visualização dos arquivos: lista (padrão) ou grade */
  const [view, setView] = useState<'list' | 'grid'>('list')
  /* "+ Novo": upload de arquivos ou nova pasta */
  const [newOpen, setNewOpen] = useState(false)
  const [added, setAdded] = useState<FileRow[]>([])
  const newRef = useRef<HTMLSpanElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const nq = normSearch(query)

  /* filtro (menu) */
  const [filters, setFilters] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  useEffect(() => {
    if (!filterOpen) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.lib-filter-wrap')) setFilterOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [filterOpen])
  const passFilters = (f: FileRow) =>
    FILE_FILTER_GROUPS.every((g) => {
      const on = g.items.filter((it) => filters.has(it.id))
      return on.length === 0 || on.some((it) => it.test(f))
    })

  /* excluídos e pasta de cada item (sem entrada = na raiz de Arquivos) */
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [movedTo, setMovedTo] = useState<Record<string, string>>({})
  /* nomes editados pelo "Renomear" do "..." */
  const [renamed, setRenamed] = useState<Record<string, string>>({})
  const all = [...added, ...FOLDERS, ...FILES]
    .filter((f) => !deleted.has(f.uid))
    .map((f) => (renamed[f.uid] ? { ...f, name: renamed[f.uid] } : f))
  const byId = (id: string) => all.find((f) => f.uid === id)
  const parentOf = (id: string) => movedTo[id] ?? null
  const folders = all.filter((f) => f.folder)
  const countIn = (folderId: string) => all.filter((f) => movedTo[f.uid] === folderId).length
  /* pasta aberta (null = raiz) e o caminho até ela, para a trilha */
  const [openFolder, setOpenFolder] = useState<string | null>(null)
  const pathTo = (id: string | null): FileRow[] => {
    const out: FileRow[] = []
    for (let cur = id; cur; cur = parentOf(cur)) {
      const f = byId(cur)
      if (!f) break
      out.unshift(f)
    }
    return out
  }
  const crumbs = pathTo(openFolder)
  const current = crumbs[crumbs.length - 1] ?? null
  /* pasta aberta foi excluída: volta para a raiz */
  useEffect(() => {
    if (openFolder && !byId(openFolder)) setOpenFolder(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleted, openFolder])
  /* "a" está dentro de "b" (em qualquer nível)? impede mover uma pasta para dentro dela mesma */
  const isInside = (a: string | null, b: string) => {
    for (let cur = a; cur; cur = parentOf(cur)) if (cur === b) return true
    return false
  }
  const files = all.filter(
    (f) =>
      parentOf(f.uid) === openFolder &&
      (!!openFolder || filter === 'Todos' || PILL_TYPES[filter]?.includes(f.type)) &&
      passFilters(f) &&
      (!nq || normSearch(`${f.name} ${f.type}`).includes(nq)),
  )
  const narrowed = !!nq || filters.size > 0 || (!openFolder && filter !== 'Todos')
  const goTo = (id: string | null) => {
    setOpenFolder(id)
    setSelected(new Set())
    setQuery('')
  }

  /* seleção em massa */
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const selFiles = all.filter((f) => selected.has(f.uid))
  const visibleIds = files.map((f) => f.uid)
  const allVisibleOn = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleOn = visibleIds.some((id) => selected.has(id))
  const toggleSel = (id: string) =>
    setSelected((cur) => {
      const n = new Set(cur)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const toggleAll = () =>
    setSelected((cur) => {
      const n = new Set(cur)
      if (allVisibleOn) visibleIds.forEach((id) => n.delete(id))
      else visibleIds.forEach((id) => n.add(id))
      return n
    })
  const clearSel = () => setSelected(new Set())
  useEffect(() => {
    if (!selected.size) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('.ctx-overlay')) clearSel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected.size])

  /* aviso das ações (mesmo visual do aviso de Loops) */
  const [toast, setToast] = useState<{ id: number; text: string; undo?: () => void } | null>(null)
  const toastTimer = useRef<number>()
  const showToast = (text: string, undo?: () => void) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text, undo })
    toastTimer.current = window.setTimeout(() => setToast(null), 4200)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const [confirmDelete, setConfirmDelete] = useState(false)
  /* "..." de um arquivo/pasta: menu, renomear e excluir só aquele item */
  const [rowMenu, setRowMenu] = useState<{ file: FileRow; el: HTMLElement } | null>(null)
  /* renomear na própria linha (como no histórico) */
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const finishRename = (f: FileRow, name: string | null) => {
    setRenamingId(null)
    if (!name || name === f.name) return
    setRenamed((r) => ({ ...r, [f.uid]: name }))
    showToast(f.folder ? 'Pasta renomeada' : 'Arquivo renomeado')
  }
  const [deleteItem, setDeleteItem] = useState<FileRow | null>(null)
  const openRowMenu = (e: React.MouseEvent<HTMLElement>, file: FileRow) => {
    e.stopPropagation()
    const el = e.currentTarget
    setRowMenu((m) => (m?.file.uid === file.uid ? null : { file, el }))
  }
  const n = selFiles.length
  const plural = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`

  const startChat = () => {
    onStartChat?.(selFiles.map(toAttachment))
    clearSel()
  }
  const download = () => {
    const list = selFiles.filter((f) => !f.folder)
    list.forEach((f, i) => window.setTimeout(() => downloadFile(f), i * 180))
    showToast(list.length ? `Baixando ${plural(list.length, 'arquivo', 'arquivos')}` : 'Pastas não podem ser baixadas')
  }
  const remove = (ids: string[] = selFiles.map((f) => f.uid)) => {
    setDeleted((d) => new Set([...d, ...ids]))
    setSelected((cur) => new Set([...cur].filter((id) => !ids.includes(id))))
    showToast(`${plural(ids.length, 'item excluído', 'itens excluídos')}`, () =>
      setDeleted((d) => new Set([...d].filter((x) => !ids.includes(x)))),
    )
  }
  /* mover itens para uma pasta (ou para a raiz, target null); pastas não entram nelas mesmas */
  const moveItems = (ids: string[], target: string | null) => {
    const ok = ids.filter((id) => id !== target && !isInside(target, id) && parentOf(id) !== target)
    if (!ok.length) return
    const before = { ...movedTo }
    setMovedTo((m) => {
      const nx = { ...m }
      ok.forEach((id) => {
        if (target) nx[id] = target
        else delete nx[id]
      })
      return nx
    })
    setSelected((cur) => new Set([...cur].filter((id) => !ok.includes(id))))
    const where = target ? (byId(target)?.name ?? 'pasta') : 'Biblioteca'
    showToast(`${plural(ok.length, 'item movido', 'itens movidos')} para ${where}`, () => setMovedTo(before))
  }
  /* destinos do "Mover para pasta": todas as pastas (com o caminho), menos as selecionadas e o que está dentro delas */
  const selIds = selFiles.map((f) => f.uid)
  const targetsFor = (ids: string[]) =>
    [
      ...(openFolder ? [{ id: null as string | null, label: 'Biblioteca', count: all.filter((f) => !movedTo[f.uid]).length }] : []),
      ...folders
        .filter((f) => !ids.some((id) => id === f.uid || isInside(f.uid, id)))
        .map((f) => ({
          id: f.uid as string | null,
          label: pathTo(f.uid).map((x) => x.name).join(' / '),
          count: countIn(f.uid),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
    ].filter((t) => !(ids.length && ids.every((id) => parentOf(id) === t.id)))
  const moveTargets = targetsFor(selIds)
  /* upload (botão ou arrastando do computador): entra na pasta aberta */
  const uploadFiles = (list: File[], into: string | null = openFolder) => {
    if (!list.length) return
    const rows = list.map(rowFromFile)
    setAdded((a) => [...rows, ...a])
    if (into) setMovedTo((m) => ({ ...m, ...Object.fromEntries(rows.map((r) => [r.uid, into])) }))
    const where = into && into !== openFolder ? ` para ${byId(into)?.name ?? 'a pasta'}` : ''
    showToast(`${plural(rows.length, 'arquivo enviado', 'arquivos enviados')}${where}`)
  }

  /* arrastar e soltar: itens da lista para pastas/trilha; arquivos do computador para a lista */
  const [dragIds, setDragIds] = useState<string[]>([])
  const [dropOn, setDropOn] = useState<string | null>(null)
  const dragGhost = useRef<HTMLDivElement>(null)
  const startDrag = (e: React.DragEvent, f: FileRow) => {
    const ids = selected.has(f.uid) ? [...selected] : [f.uid]
    setDragIds(ids)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/x-inner-lib', ids.join(','))
    const g = dragGhost.current
    if (g) {
      g.textContent = ids.length === 1 ? f.name : `${ids.length} itens`
      e.dataTransfer.setDragImage(g, 14, 18)
    }
  }
  const endDrag = () => {
    setDragIds([])
    setDropOn(null)
  }
  const canDropOn = (target: string | null) =>
    dragIds.length > 0 && dragIds.some((id) => id !== target && !isInside(target, id) && parentOf(id) !== target)
  const dropProps = (target: string | null, key: string) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!canDropOn(target)) return
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'move'
      if (dropOn !== key) setDropOn(key)
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setDropOn((d) => (d === key ? null : d))
    },
    onDrop: (e: React.DragEvent) => {
      if (!canDropOn(target)) return
      e.preventDefault()
      e.stopPropagation()
      moveItems(dragIds, target)
      endDrag()
    },
  })

  const addToBase = (baseName: string, items: FileRow[] = selFiles) => {
    const k = items.filter((f) => !f.folder).length
    if (items === selFiles) clearSel()
    showToast(`${plural(k, 'arquivo adicionado', 'arquivos adicionados')} a ${baseName}`)
  }

  useEffect(() => {
    if (!newOpen) return
    const onDown = (e: PointerEvent) => {
      if (!newRef.current?.contains(e.target as Node)) setNewOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNewOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [newOpen])

  /* "Nova pasta": modal com o nome; com itens selecionados, pode já movê-los */
  const [folderModal, setFolderModal] = useState<{ withSelection: boolean } | null>(null)
  const createFolder = (name: string, moveSelected: boolean) => {
    const uid = `folder-${Date.now()}`
    setAdded((list) => [
      { uid, name, type: 'Pasta', modified: 'agora', icon: '', color: '#8A8A82', folder: true },
      ...list,
    ])
    if (openFolder) setMovedTo((m) => ({ ...m, [uid]: openFolder }))
    if (moveSelected && selFiles.length) {
      const ids = selFiles.map((f) => f.uid)
      setMovedTo((m) => ({ ...m, ...Object.fromEntries(ids.map((id) => [id, uid])) }))
      clearSel()
      showToast(`Pasta criada com ${plural(ids.length, 'item', 'itens')}`)
    } else {
      showToast(`Pasta "${name}" criada`)
    }
  }
  const newFolder = () => {
    setNewOpen(false)
    setFolderModal({ withSelection: false })
  }
  /* base de conhecimento aberta (nível de navegação dentro da Biblioteca) */
  const [openBase, setOpenBase] = useState<string | null>(null)
  /* "Nova base": modal (ícone, nome, descrição); a base nasce vazia e já abre */
  const [kbModal, setKbModal] = useState(false)
  const createBase = (kb: { name: string; description: string; icon: string; color: string }) => {
    const id = `kb-${Date.now()}`
    addKnowledgeBase({
      id,
      name: kb.name,
      description: kb.description,
      createdAt: 'Criada agora',
      emoji: kb.icon,
      color: kb.color,
      sections: [],
      loose: [],
    })
    setOpenBase(id)
  }

  /* "..." da base: iniciar chat, editar (nome, ícone, cor, descrição) e excluir */
  const [kbEdit, setKbEdit] = useState<KnowledgeBase | null>(null)
  const [kbDelete, setKbDelete] = useState<KnowledgeBase | null>(null)
  const [, setKbVersion] = useState(0)
  const kbActions = (kb: KnowledgeBase) => ({
    onChat: () => onStartChat?.([{ kind: 'collection', name: kb.name, fileType: 'Base de conhecimento', emoji: kb.emoji }]),
    onEdit: () => setKbEdit(kb),
    onDelete: () => setKbDelete(kb),
  })
  const toastNode = toast &&
        createPortal(
          <div className="lp-toast is-info" key={toast.id} role="status">
            <span className="lp-toast-text">{toast.text}</span>
            {toast.undo && (
              <button
                type="button"
                className="lp-toast-btn"
                onClick={() => {
                  toast.undo?.()
                  setToast(null)
                }}
              >
                Desfazer
              </button>
            )}
          </div>,
          document.body,
        )
  const kbLayer = (
    <>
      {kbEdit && (
        <NewKnowledgeBaseModal
          initial={{ name: kbEdit.name, description: kbEdit.description, icon: kbEdit.emoji, color: kbEdit.color }}
          onClose={() => setKbEdit(null)}
          onCreate={(v) => {
            updateKnowledgeBase(kbEdit.id, { name: v.name, description: v.description, emoji: v.icon, color: v.color })
            setKbVersion((x) => x + 1)
            showToast('Base atualizada')
          }}
        />
      )}
      {kbDelete && (
        <ConfirmDeleteModal
          title="Excluir base de conhecimento?"
          confirmLabel="Excluir base"
          onClose={() => setKbDelete(null)}
          onConfirm={() => {
            const removed = removeKnowledgeBase(kbDelete.id)
            if (openBase === kbDelete.id) setOpenBase(null)
            setKbVersion((x) => x + 1)
            showToast(`Base "${kbDelete.name}" excluída`, () => {
              if (removed) restoreKnowledgeBase(removed.kb, removed.index)
              setKbVersion((x) => x + 1)
            })
          }}
        >
          A base <strong>{kbDelete.name}</strong> e a organização dos arquivos dela serão excluídas. Os arquivos
          continuam na sua Biblioteca, e o agente deixa de usar esta base nas conversas.
        </ConfirmDeleteModal>
      )}
    </>
  )

  const base = openBase ? KNOWLEDGE_BASES.find((b) => b.id === openBase) : null
  if (base) {
    return (
      <>
        <KnowledgeBaseDetail base={base} onBack={() => setOpenBase(null)} {...kbActions(base)} />
        {kbLayer}
        {toastNode}
      </>
    )
  }

  return (
    <main className={`library-page${empty ? ' empty-page' : ''}`}>
      <div className="lib-container">
        {current ? (
          /* pasta aberta: trilha (cada nível também recebe itens arrastados) e o nome da pasta */
          <div className="lib-folder-head" key={current.uid}>
            <nav className="lib-crumbs" aria-label="Caminho da pasta">
              <button
                type="button"
                className={`lib-crumb${dropOn === 'crumb-root' ? ' is-drop' : ''}`}
                onClick={() => goTo(null)}
                {...dropProps(null, 'crumb-root')}
              >
                <ChevronLeft size={16} strokeWidth={2} />
                Biblioteca
              </button>
              {crumbs.slice(0, -1).map((c) => (
                <span className="lib-crumb-step" key={c.uid}>
                  <ChevronRight className="lib-crumb-sep" size={14} strokeWidth={2} aria-hidden="true" />
                  <button
                    type="button"
                    className={`lib-crumb${dropOn === `crumb-${c.uid}` ? ' is-drop' : ''}`}
                    onClick={() => goTo(c.uid)}
                    {...dropProps(c.uid, `crumb-${c.uid}`)}
                  >
                    {c.name}
                  </button>
                </span>
              ))}
              <span className="lib-crumb-step">
                <ChevronRight className="lib-crumb-sep" size={14} strokeWidth={2} aria-hidden="true" />
                <span className="lib-crumb is-current" aria-current="page">
                  {current.name}
                </span>
              </span>
            </nav>
            <h1 className="lib-folder-title">
              <span className="lib-folder-ic" aria-hidden="true">
                <Folder size={22} strokeWidth={1.7} />
              </span>
              {current.name}
            </h1>
          </div>
        ) : (
          <h1 className="lib-title">Biblioteca</h1>
        )}

        {/* Bases de conhecimento: sem nenhuma base (protótipo), o card-tutorial
            entra no lugar dos cards, sob o mesmo título; os arquivos continuam
            logo abaixo, porque o usuário pode ter arquivos sem ter criado uma base */}
        {!current && (
        <section className="lib-section lib-kb-section">
          <div className="lib-section-head">
            <div className="lib-section-title">
              <h2>Bases de conhecimento</h2>
              <p>Arquivos agrupados para serem usados como conhecimento</p>
            </div>
            <button className="lib-new-cta" type="button" onClick={() => setKbModal(true)}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Nova base
            </button>
          </div>

          {empty || KNOWLEDGE_BASES.length === 0 ? (
            <TutorialEmpty
              title="Ensine seu agente com uma base de conhecimento."
              steps={[
                { strong: 'Reúna seus arquivos:', rest: 'PDFs, planilhas, sites e anotações.' },
                { strong: 'Agrupe numa base', rest: 'por tema, cliente ou time.' },
                { strong: 'Use em qualquer conversa', rest: 'citando a base com @, e o agente responde com ela.' },
              ]}
              cta={
                <button type="button" className="lib-new-cta te-tutorial-cta" onClick={() => setKbModal(true)}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Nova base de conhecimento
                </button>
              }
              caption="Como funcionam as bases de conhecimento"
              duration="1:48"
              art={<LibraryArt />}
            />
          ) : (
            <div className="lib-collections">
              {KNOWLEDGE_BASES.map((kb, i) => (
                <div className="coll-wrap" key={kb.id} style={{ '--i': i } as CSSProperties}>
                <div
                  className="coll-card"
                  role="button"
                  tabIndex={0}
                  style={{ '--i': i } as CSSProperties}
                  onClick={() => setOpenBase(kb.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setOpenBase(kb.id)
                    }
                  }}
                >
                  <span className="coll-card-top" style={{ background: kb.color }}>
                    <span className="coll-card-avatar">
                      <span className="coll-emoji">{kb.emoji}</span>
                    </span>
                  </span>
                  <span className="coll-card-body">
                    <span className="coll-name">{kb.name}</span>
                    <span className="coll-desc">{kb.description}</span>
                    <span className="coll-date">{kb.createdAt}</span>
                  </span>
                </div>
                <KnowledgeBaseMenu className="coll-menu" {...kbActions(kb)} />
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {/* Arquivos (raiz ou conteúdo da pasta aberta); soltar arquivos do computador envia para cá */}
        <section className="lib-section">
          <div className="lib-section-head">
            {current ? (
              <h2 className="lib-files-title lib-folder-count">
                {files.length || narrowed ? plural(files.length, 'item', 'itens') : 'Pasta vazia'}
              </h2>
            ) : (
              <h2 className="lib-files-title">Arquivos</h2>
            )}
            <div className="lib-files-actions">
              {/* filtro: quando foi modificado e de onde veio */}
              <span className="cd-filter-wrap lib-filter-wrap">
                <button
                  className={`lib-new is-ghost${filterOpen || filters.size ? ' is-on' : ''}`}
                  type="button"
                  aria-label="Filtrar"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M2.6 3.9h12.8l-5 6v4.3l-2.8-1.4V9.9l-5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.125"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  {filters.size > 0 && <span className="cd-filter-badge">{filters.size}</span>}
                  {!filterOpen && (
                    <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                      Filtrar
                    </span>
                  )}
                </button>
                {filterOpen && (
                  <div className="task-menu cd-filter-menu" role="menu">
                    <button
                      type="button"
                      className="task-menu-item"
                      role="menuitemcheckbox"
                      aria-checked={filters.size === 0}
                      onClick={() => setFilters(new Set())}
                    >
                      Todos os arquivos
                      {filters.size === 0 && <Check className="cd-filter-check" size={15} strokeWidth={2.4} />}
                    </button>
                    {FILE_FILTER_GROUPS.map((g) => (
                      <div key={g.label}>
                        <div className="task-menu-sep" />
                        <div className="lp-filter-label">{g.label}</div>
                        {g.items.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            className="task-menu-item"
                            role="menuitemcheckbox"
                            aria-checked={filters.has(it.id)}
                            onClick={() =>
                              setFilters((cur) => {
                                const nx = new Set(cur)
                                nx.has(it.id) ? nx.delete(it.id) : nx.add(it.id)
                                return nx
                              })
                            }
                          >
                            <span className={`cd-filter-box${filters.has(it.id) ? ' is-on' : ''}`} aria-hidden="true">
                              {filters.has(it.id) && <Check size={11} strokeWidth={3} />}
                            </span>
                            {it.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </span>
              <SearchToggle value={query} onChange={setQuery} placeholder="Buscar arquivos" />
              <div className="lib-view-switch" role="group" aria-label="Visualização">
                <button
                  className={`lib-view-opt${view === 'grid' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em grade"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2.6" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="2.6" width="5.4" height="5.4" rx="1.5" />
                    <rect x="2.6" y="10" width="5.4" height="5.4" rx="1.5" />
                    <rect x="10" y="10" width="5.4" height="5.4" rx="1.5" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em grade
                  </span>
                </button>
                <button
                  className={`lib-view-opt${view === 'list' ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Ver em lista"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                    <rect x="2" y="3.5" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="3.95" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="7.8" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="8.25" width="9.7" height="1.5" rx="0.75" />
                    <rect x="2" y="12.1" width="2.4" height="2.4" rx="0.8" />
                    <rect x="6.3" y="12.55" width="9.7" height="1.5" rx="0.75" />
                  </svg>
                  <span className="pill-tooltip lib-new-tip" role="tooltip" aria-hidden="true">
                    Ver em lista
                  </span>
                </button>
              </div>
              {/* "+ Novo" (secundário): upload de arquivos ou nova pasta */}
              <span className="lib-new-wrap" ref={newRef}>
                <button
                  type="button"
                  className="lib-new-sec"
                  aria-haspopup="menu"
                  aria-expanded={newOpen}
                  onClick={() => setNewOpen((o) => !o)}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3.1v9.8M3.1 8h9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Novo
                  <ChevronDown className="lib-new-caret" size={15} strokeWidth={2.2} aria-hidden="true" />
                </button>
                {newOpen && (
                  <div className="task-menu lib-new-menu" role="menu">
                    <button
                      type="button"
                      className="task-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setNewOpen(false)
                        fileInputRef.current?.click()
                      }}
                    >
                      <Upload size={15} strokeWidth={1.9} />
                      Upload de arquivos
                    </button>
                    <button type="button" className="task-menu-item" role="menuitem" onClick={newFolder}>
                      <FolderPlus size={15} strokeWidth={1.9} />
                      Pasta
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    uploadFiles(Array.from(e.target.files ?? []))
                    e.target.value = ''
                  }}
                />
              </span>
            </div>
          </div>

          {/* pills só na raiz; dentro da pasta, só o filtro (ícone) */}
          {!openFolder && (
          <div className="lib-filters">
              {FILE_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`lib-pill${filter === f ? ' is-active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {narrowed && files.length === 0 ? (
            <SearchEmpty query={query || 'esses filtros'} />
          ) : current && files.length === 0 ? (
            <div className="lib-folder-empty">
              <span className="lib-folder-empty-ic" aria-hidden="true">
                <Folder size={26} strokeWidth={1.6} />
              </span>
              <p className="lib-folder-empty-title">Esta pasta está vazia</p>
              <p className="lib-folder-empty-sub">Arraste arquivos para cá ou use o botão Novo.</p>
            </div>
          ) : view === 'list' ? (
            <div className={`lib-files${selected.size ? ' is-selecting' : ''}`} key="list">
              <div className="lib-files-head">
                <SelBox
                  on={allVisibleOn}
                  mixed={!allVisibleOn && someVisibleOn}
                  label={allVisibleOn ? 'Desmarcar todos' : 'Selecionar todos'}
                  onClick={toggleAll}
                />
                <span className="col-name">Nome</span>
                <span className="col-type">Tipo</span>
                <span className="col-mod">Modificado</span>
                <span className="col-act" />
              </div>
              {files.map((file) => (
                <div
                  className={`file-row${selected.has(file.uid) ? ' is-selected' : ''}${file.folder ? ' is-folder' : ''}${
                    dragIds.includes(file.uid) ? ' is-dragging' : ''
                  }${dropOn === file.uid ? ' is-drop' : ''}`}
                  key={file.uid}
                  draggable={renamingId !== file.uid}
                  onDragStart={(e) => startDrag(e, file)}
                  onDragEnd={endDrag}
                  {...(file.folder ? dropProps(file.uid, file.uid) : {})}
                  {...(file.folder ? { 'data-drop-target': file.uid, 'data-drop-label': `Na pasta ${file.name}` } : {})}
                  onClick={() => (selected.size > 0 ? toggleSel(file.uid) : file.folder && goTo(file.uid))}
                >
                  <SelBox on={selected.has(file.uid)} label={`Selecionar ${file.name}`} onClick={() => toggleSel(file.uid)} />
                  <FileIcon file={file} />
                  {renamingId === file.uid ? (
                    <span className="col-name">
                      <LibRenameInput value={file.name} onDone={(n) => finishRename(file, n)} />
                    </span>
                  ) : (
                    <span className="col-name file-name">{file.name}</span>
                  )}
                  <span className="col-type file-type">
                    {file.folder ? `Pasta · ${countIn(file.uid) ? plural(countIn(file.uid), 'item', 'itens') : 'vazia'}` : file.type}
                  </span>
                  <span className="col-mod file-mod">{file.modified}</span>
                  <button
                    className={`col-act file-act${rowMenu?.file.uid === file.uid ? ' is-open' : ''}`}
                    type="button"
                    aria-label={`Ações de ${file.name}`}
                    aria-haspopup="menu"
                    aria-expanded={rowMenu?.file.uid === file.uid}
                    onClick={(e) => openRowMenu(e, file)}
                  >
                    <img src={icDotsActions} alt="" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="lib-files-grid" key="grid">
              {files.map((file, i) => (
                <div
                  className={`file-card${selected.has(file.uid) ? ' is-selected' : ''}${selected.size ? ' is-selecting' : ''}${
                    dragIds.includes(file.uid) ? ' is-dragging' : ''
                  }${dropOn === file.uid ? ' is-drop' : ''}`}
                  key={file.uid}
                  style={{ '--i': i } as CSSProperties}
                  draggable={renamingId !== file.uid}
                  onDragStart={(e) => startDrag(e, file)}
                  onDragEnd={endDrag}
                  {...(file.folder ? dropProps(file.uid, file.uid) : {})}
                  {...(file.folder ? { 'data-drop-target': file.uid, 'data-drop-label': `Na pasta ${file.name}` } : {})}
                  onClick={() => (selected.size > 0 ? toggleSel(file.uid) : file.folder && goTo(file.uid))}
                >
                  <SelBox
                    className="file-card-check"
                    on={selected.has(file.uid)}
                    label={`Selecionar ${file.name}`}
                    onClick={() => toggleSel(file.uid)}
                  />
                  <div
                    className="file-card-prev"
                    style={
                      file.thumb
                        ? undefined
                        : { background: `color-mix(in srgb, ${file.color} 10%, var(--card-surface))` }
                    }
                  >
                    {file.thumb ? (
                      <img className="file-card-img" src={file.thumb} alt="" loading="lazy" />
                    ) : file.folder ? (
                      <Folder className="file-card-folder" size={40} strokeWidth={1.4} />
                    ) : (
                      <img className="file-card-ic" src={file.icon} alt="" />
                    )}
                  </div>
                  <div className="file-card-body">
                    <span className="file-card-text">
                      {renamingId === file.uid ? (
                        <LibRenameInput value={file.name} onDone={(n) => finishRename(file, n)} />
                      ) : (
                        <span className="file-card-name">{file.name}</span>
                      )}
                      <span className="file-card-meta">
                        {file.folder ? (countIn(file.uid) ? plural(countIn(file.uid), 'item', 'itens') : 'Vazia') : file.type} · {file.modified}
                      </span>
                    </span>
                    <button
                      className={`file-act${rowMenu?.file.uid === file.uid ? ' is-open' : ''}`}
                      type="button"
                      aria-label={`Ações de ${file.name}`}
                      aria-haspopup="menu"
                      aria-expanded={rowMenu?.file.uid === file.uid}
                      onClick={(e) => openRowMenu(e, file)}
                    >
                      <img src={icDotsActions} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* arquivos do computador: aviso em tela cheia; soltar sobre uma pasta envia para ela */}
      <FileDropOverlay
        enabled={!base}
        sub={current ? `Na pasta ${current.name}` : 'Na Biblioteca'}
        onFiles={(list, folderId) => uploadFiles(list, folderId ?? openFolder)}
      />

      {/* imagem do arraste: nome do item ou "N itens" */}
      <div className="lib-drag-ghost" ref={dragGhost} aria-hidden="true" />

      {n > 0 && (
        <BulkBar
          count={n}
          onStartChat={startChat}
          onDownload={download}
          onDelete={() => setConfirmDelete(true)}
          targets={moveTargets}
          onMoveTo={(target) => moveItems(selIds, target)}
          onAddToBase={addToBase}
          onNewFolder={() => setFolderModal({ withSelection: true })}
          onClear={clearSel}
        />
      )}

      {kbModal && <NewKnowledgeBaseModal onClose={() => setKbModal(false)} onCreate={createBase} />}
      {kbLayer}

      {rowMenu && (
        <FileRowMenu
          anchor={rowMenu.el}
          file={rowMenu.file}
          targets={targetsFor([rowMenu.file.uid])}
          onClose={() => setRowMenu(null)}
          onRename={() => setRenamingId(rowMenu.file.uid)}
          onMoveTo={(t) => moveItems([rowMenu.file.uid], t)}
          onAddToBase={(name) => addToBase(name, [rowMenu.file])}
          onDelete={() => setDeleteItem(rowMenu.file)}
        />
      )}

      {deleteItem && (
        <ConfirmDeleteModal
          title={deleteItem.folder ? 'Excluir pasta?' : 'Excluir arquivo?'}
          confirmLabel="Excluir"
          onClose={() => setDeleteItem(null)}
          onConfirm={() => remove([deleteItem.uid])}
        >
          <strong>{deleteItem.name}</strong>
          {deleteItem.folder
            ? countIn(deleteItem.uid)
              ? ` e os ${countIn(deleteItem.uid)} itens dela serão removidos da sua Biblioteca.`
              : ' será removida da sua Biblioteca.'
            : ' será removido da sua Biblioteca e das bases de conhecimento onde estiver.'}
        </ConfirmDeleteModal>
      )}

      {folderModal && (
        <NewFolderModal
          existing={folders.map((f) => f.name)}
          selectedCount={folderModal.withSelection ? selFiles.length : 0}
          onClose={() => setFolderModal(null)}
          onCreate={createFolder}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          title={n === 1 ? 'Excluir item?' : `Excluir ${n} itens?`}
          confirmLabel="Excluir"
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => remove()}
        >
          {n === 1 ? (
            <>
              <strong>{selFiles[0]?.name}</strong> será removido da sua Biblioteca e das bases de conhecimento onde
              estiver.
            </>
          ) : (
            <>
              Os <strong>{n} itens selecionados</strong> serão removidos da sua Biblioteca e das bases de conhecimento
              onde estiverem.
            </>
          )}
        </ConfirmDeleteModal>
      )}

      {toastNode}
    </main>
  )
}

/* caixinha de seleção (linha, cabeçalho e card) */
function SelBox({
  on,
  mixed = false,
  label,
  onClick,
  className = '',
}: {
  on: boolean
  mixed?: boolean
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? 'mixed' : on}
      aria-label={label}
      className={`lib-check ${className}${on || mixed ? ' is-on' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {mixed ? <Minus size={11} strokeWidth={3} /> : on ? <Check size={11} strokeWidth={3} /> : null}
    </button>
  )
}

/* barra de ações em massa (aparece com 1+ item selecionado) */
function BulkBar({
  count,
  targets,
  onStartChat,
  onDownload,
  onDelete,
  onMoveTo,
  onAddToBase,
  onNewFolder,
  onClear,
}: {
  count: number
  /* destinos do "Mover para pasta" (id null = raiz de Arquivos) */
  targets: { id: string | null; label: string; count: number }[]
  onStartChat: () => void
  onDownload: () => void
  onDelete: () => void
  onMoveTo: (target: string | null) => void
  onAddToBase: (name: string) => void
  onNewFolder: () => void
  onClear: () => void
}) {
  const [menu, setMenu] = useState(false)
  const [sub, setSub] = useState<'folder' | 'base' | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menu) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setMenu(false)
        setSub(null)
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [menu])

  return createPortal(
    <div className="lib-bulk" role="toolbar" aria-label="Ações dos itens selecionados" ref={ref}>
      <span className="lib-bulk-count">{count === 1 ? '1 selecionado' : `${count} selecionados`}</span>
      <button type="button" className="lib-bulk-btn is-primary" onClick={onStartChat}>
        <SquarePen size={15} strokeWidth={2} />
        Iniciar chat
      </button>
      <button type="button" className="lib-bulk-btn" onClick={onDownload}>
        <Download size={15} strokeWidth={2} />
        Baixar
      </button>
      <button type="button" className="lib-bulk-btn is-danger" onClick={onDelete}>
        <Trash2 size={15} strokeWidth={2} />
        Excluir
      </button>
      <span className="lib-bulk-more-wrap">
        <button
          type="button"
          className={`lib-bulk-icon${menu ? ' is-open' : ''}`}
          aria-label="Mais ações"
          aria-haspopup="menu"
          aria-expanded={menu}
          onClick={() => {
            setMenu((o) => !o)
            setSub(null)
          }}
        >
          <MoreHorizontal size={18} strokeWidth={2} />
        </button>
        {menu && (
          <div className="task-menu lib-bulk-menu" role="menu">
            <button
              type="button"
              className={`task-menu-item lib-bulk-sub${sub === 'folder' ? ' is-active' : ''}`}
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={sub === 'folder'}
              onPointerEnter={() => setSub('folder')}
              onClick={() => setSub('folder')}
            >
              <FolderInput size={15} strokeWidth={1.9} />
              Mover para pasta
              <ChevronRight className="lib-bulk-chev" size={15} strokeWidth={2} />
            </button>
            <button
              type="button"
              className={`task-menu-item lib-bulk-sub${sub === 'base' ? ' is-active' : ''}`}
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={sub === 'base'}
              onPointerEnter={() => setSub('base')}
              onClick={() => setSub('base')}
            >
              <Library size={15} strokeWidth={1.9} />
              Adicionar à base de conhecimento
              <ChevronRight className="lib-bulk-chev" size={15} strokeWidth={2} />
            </button>

            {sub && (
              <div className={`task-menu lib-bulk-submenu is-${sub}`} role="menu">
                {sub === 'folder' && (
                  <>
                    <button
                      type="button"
                      className="task-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setMenu(false)
                        onNewFolder()
                      }}
                    >
                      <FolderPlus size={15} strokeWidth={1.9} />
                      Nova pasta
                    </button>
                    {targets.length > 0 && <div className="task-menu-sep" />}
                  </>
                )}
                {sub === 'folder' ? (
                  targets.map((t) => (
                    <button
                      key={t.id ?? 'root'}
                      type="button"
                      className="task-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setMenu(false)
                        onMoveTo(t.id)
                      }}
                    >
                      {t.id ? <Folder size={15} strokeWidth={1.9} /> : <Files size={15} strokeWidth={1.9} />}
                      <span className="lib-bulk-sub-label">{t.label}</span>
                      <span className="lib-bulk-sub-meta">{t.count}</span>
                    </button>
                  ))
                ) : (
                  KNOWLEDGE_BASES.map((kb) => (
                    <button
                      key={kb.id}
                      type="button"
                      className="task-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setMenu(false)
                        onAddToBase(kb.name)
                      }}
                    >
                      <span className="lib-bulk-emoji" aria-hidden="true">
                        {kb.emoji}
                      </span>
                      <span className="lib-bulk-sub-label">{kb.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </span>
      <button type="button" className="lib-bulk-icon" aria-label="Limpar seleção" onClick={onClear}>
        <X size={17} strokeWidth={2} />
      </button>
    </div>,
    document.body,
  )
}

/* "..." de um arquivo ou pasta: renomear, mover para pasta, adicionar a uma
   base e excluir. Abre ancorado ao botão, com cascata ao lado. */
function FileRowMenu({
  anchor,
  file,
  targets,
  onClose,
  onRename,
  onMoveTo,
  onAddToBase,
  onDelete,
}: {
  anchor: HTMLElement
  file: FileRow
  targets: { id: string | null; label: string; count: number }[]
  onClose: () => void
  onRename: () => void
  onMoveTo: (target: string | null) => void
  onAddToBase: (name: string) => void
  onDelete: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [sub, setSub] = useState<'folder' | 'base' | null>(null)
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number; flipSub: boolean } | null>(null)
  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect()
    const h = ref.current?.offsetHeight ?? 200
    const up = window.innerHeight - r.bottom < h + 16
    const right = Math.max(12, window.innerWidth - r.right)
    /* cascata abre à esquerda quando não cabe à direita */
    const flipSub = window.innerWidth - right + 240 > window.innerWidth
    setPos(up ? { bottom: window.innerHeight - r.top + 6, right, flipSub } : { top: r.bottom + 6, right, flipSub })
  }, [anchor])
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !anchor.contains(t)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onScroll = () => onClose()
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [anchor, onClose])
  const pick = (fn: () => void) => () => {
    onClose()
    fn()
  }
  return createPortal(
    <div
      ref={ref}
      className={`task-menu lib-row-menu${pos?.bottom !== undefined ? ' is-up' : ''}${pos?.flipSub ? ' is-flip' : ''}`}
      role="menu"
      aria-label={`Ações de ${file.name}`}
      style={{ top: pos?.top ?? 'auto', bottom: pos?.bottom ?? 'auto', right: pos?.right ?? -9999, visibility: pos ? 'visible' : 'hidden' }}
    >
      <button type="button" className="task-menu-item" role="menuitem" onPointerEnter={() => setSub(null)} onClick={pick(onRename)}>
        <Pencil size={15} strokeWidth={1.9} />
        Renomear
      </button>
      <button
        type="button"
        className={`task-menu-item lib-bulk-sub${sub === 'folder' ? ' is-active' : ''}`}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub === 'folder'}
        onPointerEnter={() => setSub('folder')}
        onClick={() => setSub('folder')}
      >
        <FolderInput size={15} strokeWidth={1.9} />
        Mover para pasta
        <ChevronRight className="lib-bulk-chev" size={15} strokeWidth={2} />
      </button>
      {!file.folder && (
        <button
          type="button"
          className={`task-menu-item lib-bulk-sub${sub === 'base' ? ' is-active' : ''}`}
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={sub === 'base'}
          onPointerEnter={() => setSub('base')}
          onClick={() => setSub('base')}
        >
          <Library size={15} strokeWidth={1.9} />
          Adicionar à base de conhecimento
          <ChevronRight className="lib-bulk-chev" size={15} strokeWidth={2} />
        </button>
      )}
      <div className="task-menu-sep" />
      <button
        type="button"
        className="task-menu-item is-danger"
        role="menuitem"
        onPointerEnter={() => setSub(null)}
        onClick={pick(onDelete)}
      >
        <Trash2 size={15} strokeWidth={1.9} />
        Excluir
      </button>

      {sub && (
        <div className={`task-menu lib-row-sub is-${sub}`} role="menu">
          {sub === 'folder' ? (
            targets.length ? (
              targets.map((t) => (
                <button key={t.id ?? 'root'} type="button" className="task-menu-item" role="menuitem" onClick={pick(() => onMoveTo(t.id))}>
                  {t.id ? <Folder size={15} strokeWidth={1.9} /> : <Files size={15} strokeWidth={1.9} />}
                  <span className="lib-bulk-sub-label">{t.label}</span>
                  <span className="lib-bulk-sub-meta">{t.count}</span>
                </button>
              ))
            ) : (
              <span className="lib-row-empty">Nenhuma outra pasta</span>
            )
          ) : (
            KNOWLEDGE_BASES.map((kb) => (
              <button key={kb.id} type="button" className="task-menu-item" role="menuitem" onClick={pick(() => onAddToBase(kb.name))}>
                <span className="lib-bulk-emoji" aria-hidden="true">
                  {kb.emoji}
                </span>
                <span className="lib-bulk-sub-label">{kb.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>,
    document.body,
  )
}

/* campo de renomear na própria linha/card: Enter salva, Esc cancela, sair do campo salva */
function LibRenameInput({ value, onDone }: { value: string; onDone: (name: string | null) => void }) {
  const [v, setV] = useState(value)
  const done = useRef(false)
  const ref = useRef<HTMLInputElement>(null)
  /* seleciona o nome sem a extensão, depois que o menu fechou */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.focus()
      const dot = el.value.lastIndexOf('.')
      el.setSelectionRange(0, dot > 0 ? dot : el.value.length)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  const finish = (name: string | null) => {
    if (done.current) return
    done.current = true
    onDone(name)
  }
  return (
    <input
      className="lib-rename"
      value={v}
      ref={ref}
      spellCheck={false}
      aria-label="Novo nome"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter') finish(v.trim() || null)
        if (e.key === 'Escape') finish(null)
      }}
      onBlur={() => finish(v.trim() || null)}
    />
  )
}
