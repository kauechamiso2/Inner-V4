import { COLLECTIONS as LIB_COLLECTIONS } from './libraryEntries'

/* Projetos da sessão (protótipo): os criados no "Novo projeto" e as edições
   das Configurações. Fica num módulo para Projetos, histórico da Home e o
   menu "Mover para projeto" enxergarem a mesma lista. */

export type StoredProject = {
  id: string
  name: string
  description: string
  createdAt: string
  icon?: string
  emoji?: string
  color: string
  custom?: { instructions: string; files: string[] }
}

export type ProjectPatch = {
  name?: string
  description?: string
  icon?: string
  color?: string
  instructions?: string
}

export const projectStore: {
  created: StoredProject[]
  patches: Record<string, ProjectPatch>
} = { created: [], patches: {} }

export function addProject(p: StoredProject) {
  projectStore.created = [p, ...projectStore.created]
}

export function patchProject(id: string, patch: ProjectPatch) {
  projectStore.patches = { ...projectStore.patches, [id]: { ...projectStore.patches[id], ...patch } }
}

/* lista enxuta (id, nome, emoji, cor) de todos os projetos, com as edições */
export function allProjectEntries(): { id: string; name: string; emoji?: string; color?: string }[] {
  const base = [
    ...projectStore.created.map((p) => ({ id: p.id, name: p.name, emoji: p.icon ?? p.emoji, color: p.color })),
    ...LIB_COLLECTIONS.map((c) => ({ id: c.id, name: c.label, emoji: c.emoji, color: c.color })),
  ]
  return base.map((p) => {
    const patch = projectStore.patches[p.id]
    return patch
      ? { ...p, name: patch.name ?? p.name, emoji: patch.icon ?? p.emoji, color: patch.color ?? p.color }
      : p
  })
}
