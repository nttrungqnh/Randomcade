import { create } from 'zustand'
import { RandomEngine } from '../features/random/RandomEngine'
import { secureRandomInt } from '../features/random/secureRandom'
import { localDatabase } from '../services/localDatabase'
import { calculateGroupCapacities, getGroupName } from '../utils/groupSetup'
import type { DrawResult, Group, TeamDrawContent, TeamDrawContentInput } from '../types/models'

const engine = new RandomEngine()
const id = () => crypto.randomUUID()

function buildGroups(teamCount: number, groupCount: number): Group[] {
  const capacities = calculateGroupCapacities(teamCount, groupCount)
  const offset = capacities.length > 1 ? secureRandomInt(capacities.length) : 0
  return capacities.map((_, index) => ({ id: `group-${index}`, name: getGroupName(index), capacity: capacities[(index + offset) % capacities.length], teamIds: [] }))
}

function statusFor(input: TeamDrawContentInput) {
  return input.name.trim() && input.teams.length >= 2 && input.groupCount >= 2 && input.groupCount <= input.teams.length
    && input.teams.every((team) => team.participants.length === 2 && team.participants.every((person) => person.name.trim()))
    ? 'ready' as const : 'draft' as const
}

interface TeamDrawContentState {
  contents: TeamDrawContent[]
  hydrated: boolean
  hydrate: () => Promise<void>
  getContent: (contentId: string) => TeamDrawContent | undefined
  createContent: (input: TeamDrawContentInput) => Promise<string>
  updateContent: (contentId: string, input: TeamDrawContentInput) => Promise<void>
  deleteContent: (contentId: string) => Promise<void>
  duplicateContent: (contentId: string) => Promise<string | null>
  startDraw: (contentId: string) => DrawResult | null
  drawNext: (contentId: string) => DrawResult | null
  undoLastDraw: (contentId: string) => DrawResult | null
  resetDraw: (contentId: string) => void
}

const persistContent = (content: TeamDrawContent) => { void localDatabase.teamDrawContents.put(content) }

export const useTeamDrawContentStore = create<TeamDrawContentState>((set, get) => ({
  contents: [],
  hydrated: false,
  hydrate: async () => {
    const contents = await localDatabase.teamDrawContents.orderBy('updatedAt').reverse().toArray()
    set({ contents, hydrated: true })
  },
  getContent: (contentId) => get().contents.find((content) => content.id === contentId),
  createContent: async (input) => {
    const now = Date.now()
    const content: TeamDrawContent = {
      id: id(), name: input.name.trim(), teams: structuredClone(input.teams), groupCount: input.groupCount,
      teamsPerGroup: Math.ceil(input.teams.length / Math.max(1, input.groupCount)), templateId: input.templateId,
      settings: { ...input.settings }, status: statusFor(input), groups: buildGroups(input.teams.length, input.groupCount),
      drawHistory: [], createdAt: now, updatedAt: now,
    }
    await localDatabase.teamDrawContents.put(content)
    set((state) => ({ contents: [content, ...state.contents] }))
    return content.id
  },
  updateContent: async (contentId, input) => {
    const current = get().getContent(contentId)
    if (!current) return
    const now = Date.now()
    const status = current.drawHistory.length ? current.status : statusFor(input)
    const next: TeamDrawContent = {
      ...current, name: input.name.trim(), teams: structuredClone(input.teams), groupCount: input.groupCount,
      teamsPerGroup: Math.ceil(input.teams.length / Math.max(1, input.groupCount)), templateId: input.templateId,
      settings: { ...input.settings }, status, updatedAt: now,
      groups: current.drawHistory.length ? current.groups : buildGroups(input.teams.length, input.groupCount),
    }
    await localDatabase.teamDrawContents.put(next)
    set((state) => ({ contents: state.contents.map((content) => content.id === contentId ? next : content) }))
  },
  deleteContent: async (contentId) => {
    await localDatabase.teamDrawContents.delete(contentId)
    set((state) => ({ contents: state.contents.filter((content) => content.id !== contentId) }))
  },
  duplicateContent: async (contentId) => {
    const source = get().getContent(contentId)
    if (!source) return null
    const now = Date.now()
    const copy: TeamDrawContent = {
      ...structuredClone(source), id: id(), name: `${source.name} - Bản sao`,
      groups: buildGroups(source.teams.length, source.groupCount), drawHistory: [], status: statusFor(source),
      createdAt: now, updatedAt: now, completedAt: undefined,
    }
    await localDatabase.teamDrawContents.put(copy)
    set((state) => ({ contents: [copy, ...state.contents] }))
    return copy.id
  },
  startDraw: (contentId) => {
    const current = get().getContent(contentId)
    if (!current || current.status === 'draft' || current.status === 'completed') return null
    const next = { ...structuredClone(current), status: 'drawing' as const, updatedAt: Date.now() }
    persistContent(next)
    set((state) => ({ contents: state.contents.map((content) => content.id === contentId ? next : content) }))
    return next.drawHistory.at(-1) ?? null
  },
  drawNext: (contentId) => {
    const current = get().getContent(contentId)
    if (!current || !['ready', 'drawing'].includes(current.status)) return null
    const next = structuredClone(current)
    next.status = 'drawing'
    const result = engine.drawNext(next)
    if (!result) return null
    if (next.drawHistory.length === next.teams.length) { next.status = 'completed'; next.completedAt = Date.now() }
    next.updatedAt = Date.now()
    persistContent(next)
    set((state) => ({ contents: state.contents.map((content) => content.id === contentId ? next : content) }))
    return result
  },
  undoLastDraw: (contentId) => {
    const current = get().getContent(contentId)
    if (!current?.drawHistory.length) return null
    const next = structuredClone(current)
    const result = next.drawHistory.pop() ?? null
    if (!result) return null
    next.groups.find((group) => group.id === result.groupId)?.teamIds.splice(next.groups.find((group) => group.id === result.groupId)!.teamIds.indexOf(result.teamId), 1)
    next.status = 'drawing'; next.completedAt = undefined; next.updatedAt = Date.now()
    persistContent(next)
    set((state) => ({ contents: state.contents.map((content) => content.id === contentId ? next : content) }))
    return result
  },
  resetDraw: (contentId) => {
    const current = get().getContent(contentId)
    if (!current) return
    const next: TeamDrawContent = { ...structuredClone(current), groups: buildGroups(current.teams.length, current.groupCount), drawHistory: [], status: statusFor(current), completedAt: undefined, updatedAt: Date.now() }
    persistContent(next)
    set((state) => ({ contents: state.contents.map((content) => content.id === contentId ? next : content) }))
  },
}))