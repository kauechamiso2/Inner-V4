import { useSyncExternalStore } from 'react'
import { seedRuns } from './runSummaries'
import type { Run } from './runSummaries'
import type { Task } from './tasks'

/* Estado da sessão dos Loops (protótipo), compartilhado entre a página de
   Loops, a página do loop e o drawer da tarefa: pausas, exclusões, execuções
   manuais, o loop aberto e o aviso (toast) das ações. */

export type LoopToast = {
  id: number
  kind: 'running' | 'done' | 'info'
  text: string
  undo?: () => void
  taskId?: string
}

type LoopState = {
  paused: Record<string, boolean>
  deleted: string[]
  last: Record<string, string>
  runs: Record<string, Run[]>
  running: string[]
  /* loop aberto na página de detalhe */
  pageId: string | null
  toast: LoopToast | null
}

let state: LoopState = {
  paused: {},
  deleted: [],
  last: {},
  runs: {},
  running: [],
  pageId: null,
  toast: null,
}

const listeners = new Set<() => void>()
const set = (patch: Partial<LoopState> | ((s: LoopState) => Partial<LoopState>)) => {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useLoopStore = () => useSyncExternalStore(subscribe, () => state)

/* tarefa como aparece agora: pausa + última execução manual */
export function applyLoopState(t: Task, s: LoopState = state): Task {
  const p = s.paused[t.id]
  if (p === true) t = { ...t, status: 'Pausado' }
  if (p === false) {
    const time = t.schedule.match(/\d{1,2}:\d{2}/)?.[0] ?? '09:00'
    t = { ...t, status: undefined, next: t.next ?? `Amanhã, ${time}` }
  }
  if (s.last[t.id]) t = { ...t, last: s.last[t.id] }
  return t
}

export const runsOf = (t: Task, s: LoopState = state) => s.runs[t.id] ?? seedRuns(t)

let toastTimer: number | undefined
export function showToast(t: Omit<LoopToast, 'id'>, ms = 4200) {
  window.clearTimeout(toastTimer)
  set({ toast: { ...t, id: Date.now() } })
  if (t.kind !== 'running') toastTimer = window.setTimeout(() => set({ toast: null }), ms)
}
export const dismissToast = () => {
  window.clearTimeout(toastTimer)
  set({ toast: null })
}

export const openLoop = (id: string | null) => set({ pageId: id })

export function togglePause(t: Task, toast = true) {
  const pausing = !applyLoopState(t).status
  set((s) => ({ paused: { ...s.paused, [t.id]: pausing } }))
  if (toast)
    showToast({
      kind: 'info',
      text: pausing ? 'Loop pausado' : 'Loop retomado',
      undo: () => set((s) => ({ paused: { ...s.paused, [t.id]: !pausing } })),
    })
}

/* "Executar agora": entra no topo do histórico como "Executando" e conclui em seguida */
export function runNow(t: Task) {
  if (state.running.includes(t.id)) return
  const id = `run-${Date.now()}`
  const now = new Date()
  const when = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  set((s) => ({
    runs: { ...s.runs, [t.id]: [{ id, when, status: 'running', origin: 'manual' }, ...runsOf(t, s)] },
    running: [...s.running, t.id],
  }))
  showToast({ kind: 'running', text: `Executando "${t.name}"` })
  window.setTimeout(() => {
    set((s) => ({
      runs: { ...s.runs, [t.id]: (s.runs[t.id] ?? []).map((x) => (x.id === id ? { ...x, status: 'done' } : x)) },
      running: s.running.filter((x) => x !== t.id),
      last: { ...s.last, [t.id]: 'agora mesmo' },
    }))
    showToast({ kind: 'done', text: 'Execução concluída', taskId: t.id }, 5200)
  }, 2600)
}

export function removeLoop(t: Task) {
  set((s) => ({ deleted: [...s.deleted, t.id], pageId: s.pageId === t.id ? null : s.pageId }))
  showToast({
    kind: 'info',
    text: 'Loop excluído',
    undo: () => set((s) => ({ deleted: s.deleted.filter((x) => x !== t.id) })),
  })
}
