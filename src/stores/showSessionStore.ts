import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RandomEngine } from '../features/random/RandomEngine'
import { secureRandomInt } from '../features/random/secureRandom'
import { calculateGroupCapacities, getGroupName } from '../utils/groupSetup'
import type { DrawResult, Group, ShowSession, Team } from '../types/models'
import type { ExperienceTheme } from '../types/models'

interface ShowSessionState {
  session: ShowSession | null
  isDrawing: boolean
  startSession: (teams: Team[], groupCount: number, selectedTheme: ExperienceTheme | null, showConfig?: string) => void
  drawNext: () => DrawResult | null
  drawAll: () => DrawResult[]
  undoLastDraw: () => DrawResult | null
  resetDraw: () => void
  clearSession: () => void
}

export const getRemainingTeams = (session: ShowSession | null): Team[] => {
  if (!session) return []
  const drawn = new Set(session.drawHistory.map((result) => result.teamId))
  return session.teams.filter((team) => !drawn.has(team.id))
}

export const getAvailableGroups = (session: ShowSession | null): Group[] =>
  session?.groups.filter((group) => group.teamIds.length < group.capacity) ?? []

export const getSessionProgress = (session: ShowSession | null): number => {
  if (!session || session.teams.length === 0) return 0
  return session.drawHistory.length / session.teams.length
}

const createId = () => crypto.randomUUID()

function buildGroups(teamCount: number, groupCount: number): Group[] {
  const capacities = calculateGroupCapacities(teamCount, groupCount)
  const offset = capacities.length > 1 ? secureRandomInt(capacities.length) : 0
  return capacities.map((_, index) => {
    const sourceIndex = (index + offset) % capacities.length
    return { id: `group-${index}`, name: getGroupName(index), capacity: capacities[sourceIndex], teamIds: [] }
  })
}

const engine = new RandomEngine()

export const useShowSessionStore = create<ShowSessionState>()(
  persist(
    (set, get) => ({
      session: null,
      isDrawing: false,
      startSession: (teams, groupCount, selectedTheme, showConfig) => {
        const invalid = teams.length < 2 || groupCount < 2 || groupCount > teams.length || teams.some((team) => team.participants.some((person) => !person.name.trim()))
        if (invalid) {
          set({ session: null, isDrawing: false })
          return
        }
        set({
          session: {
            id: createId(),
            startedAt: Date.now(),
            showConfig: showConfig?.trim() || '',
            teams: structuredClone(teams),
            groups: buildGroups(teams.length, groupCount),
            drawHistory: [],
            status: 'running',
            groupMode: 'balanced',
            selectedTheme,
          },
          isDrawing: false,
        })
      },
      drawNext: () => {
        const state = get()
        if (state.isDrawing || !state.session || state.session.status !== 'running') return null
        set({ isDrawing: true })
        const session = structuredClone(state.session)
        const result = engine.drawNext(session)
        if (result && session.drawHistory.length === session.teams.length) session.status = 'completed'
        set({ session, isDrawing: false })
        return result
      },
      drawAll: () => {
        const results: DrawResult[] = []
        let result = get().drawNext()
        while (result) {
          results.push(result)
          result = get().drawNext()
        }
        return results
      },
      undoLastDraw: () => {
        const current = get().session
        if (!current || current.drawHistory.length === 0) return null
        const session = structuredClone(current)
        const result = session.drawHistory.pop() ?? null
        if (!result) return null
        const group = session.groups.find((candidate) => candidate.id === result.groupId)
        if (group) group.teamIds = group.teamIds.filter((teamId) => teamId !== result.teamId)
        session.status = 'running'
        set({ session })
        return result
      },
      resetDraw: () => {
        const current = get().session
        if (!current) return
        const session = structuredClone(current)
        session.drawHistory = []
        session.groups = session.groups.map((group) => ({ ...group, teamIds: [] }))
        session.status = 'running'
        set({ session })
      },
      clearSession: () => set({ session: null, isDrawing: false }),
    }),
    { name: 'randomshow-session', version: 1 },
  ),
)
