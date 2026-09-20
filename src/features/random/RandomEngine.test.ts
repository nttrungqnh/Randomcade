import { describe, expect, it } from 'vitest'
import { RandomEngine } from './RandomEngine'
import { calculateGroupCapacities, getGroupName } from '../../utils/groupSetup'
import type { DrawResult, Group, Team } from '../../types/models'
import type { RandomEngineState } from './RandomEngine'
import { useShowSessionStore } from '../../stores/showSessionStore'

const teams = (count: number): Team[] => Array.from({ length: count }, (_, index) => ({
  id: `team-${index}`,
  participants: [],
}))

const groups = (capacities: number[]): Group[] => capacities.map((capacity, index) => ({
  id: `group-${index}`,
  name: getGroupName(index),
  capacity,
  teamIds: [],
}))

describe('dynamic group setup', () => {
  it.each([
    [9, 3, [3, 3, 3]], [10, 3, [4, 3, 3]], [11, 3, [4, 4, 3]],
    [17, 4, [5, 4, 4, 4]], [5, 2, [3, 2]], [32, 8, [4, 4, 4, 4, 4, 4, 4, 4]],
  ])('calculates %i teams into %i groups', (teamCount, groupCount, expected) => {
    expect(calculateGroupCapacities(teamCount, groupCount)).toEqual(expected)
  })

  it('generates names beyond Z', () => expect([getGroupName(0), getGroupName(25), getGroupName(26), getGroupName(27)]).toEqual(['A', 'Z', 'AA', 'AB']))
})

describe('RandomEngine', () => {
  it.each([
    [6, [3, 3]], [9, [3, 3, 3]], [10, [4, 3, 3]], [11, [4, 4, 3]],
    [17, [5, 4, 4, 4]], [32, [4, 4, 4, 4, 4, 4, 4, 4]], [3, [1, 1, 1]], [2, [1, 1]],
  ])('keeps all invariants after Draw All for %i teams', (teamCount, capacities) => {
    const state: RandomEngineState = { teams: teams(teamCount), groups: groups(capacities), drawHistory: [] as DrawResult[] }
    const engine = new RandomEngine({ nextInt: () => 0 })
    while (engine.drawNext(state)) { /* draw all */ }
    expect(state.drawHistory).toHaveLength(teamCount)
    expect(new Set(state.drawHistory.map((result) => result.teamId)).size).toBe(teamCount)
    expect(state.groups.every((group) => group.teamIds.length <= group.capacity)).toBe(true)
  })

  it('draws every team once without exceeding capacity', () => {
    const state: RandomEngineState = { teams: teams(10), groups: groups([4, 3, 3]), drawHistory: [] as DrawResult[] }
    const engine = new RandomEngine({ nextInt: () => 0 })
    while (engine.drawNext(state)) { /* draw all */ }
    expect(state.drawHistory).toHaveLength(10)
    expect(new Set(state.drawHistory.map((result) => result.teamId)).size).toBe(10)
    expect(state.groups.map((group) => group.teamIds.length)).toEqual([4, 3, 3])
  })

  it('can choose between equally eligible groups through the injected source', () => {
    const state: RandomEngineState = { teams: teams(2), groups: groups([1, 1]), drawHistory: [] as DrawResult[] }
    const engine = new RandomEngine({ nextInt: (max) => max - 1 })
    const result = engine.drawNext(state)
    expect(result?.groupId).toBe('group-1')
  })
})

describe('show session actions', () => {
  it('undoes and resets without changing locked capacities', () => {
    const sessionTeams = teams(9).map((team) => ({ ...team, participants: [{ id: `${team.id}-p1`, name: 'One' }, { id: `${team.id}-p2`, name: 'Two' }] }))
    useShowSessionStore.getState().clearSession()
    useShowSessionStore.getState().startSession(sessionTeams, 3, 'arcade')
    for (let index = 0; index < 5; index += 1) useShowSessionStore.getState().drawNext()
    expect(useShowSessionStore.getState().session?.drawHistory).toHaveLength(5)
    const capacities = useShowSessionStore.getState().session?.groups.map((group) => group.capacity)
    useShowSessionStore.getState().undoLastDraw()
    expect(useShowSessionStore.getState().session?.drawHistory).toHaveLength(4)
    useShowSessionStore.getState().resetDraw()
    const session = useShowSessionStore.getState().session
    expect(session?.drawHistory).toHaveLength(0)
    expect(session?.groups.map((group) => group.teamIds.length)).toEqual([0, 0, 0])
    expect(session?.groups.map((group) => group.capacity)).toEqual(capacities)
    useShowSessionStore.getState().clearSession()
  })
})
