import type { DrawResult, Group, Team } from '../../types/models'
import { secureRandomSource, type RandomSource } from './secureRandom'

export interface RandomEngineState {
  teams: Team[]
  groups: Group[]
  drawHistory: DrawResult[]
}

/**
 * Pure random business logic. Team choice is random; group choice is random
 * among the least-filled eligible groups so the board stays visually balanced.
 */
export class RandomEngine {
  private readonly random: RandomSource

  constructor(random: RandomSource = secureRandomSource) {
    this.random = random
  }

  drawNext(state: RandomEngineState): DrawResult | null {
    const drawnIds = new Set(state.drawHistory.map((result) => result.teamId))
    const availableTeams = state.teams.filter((team) => !drawnIds.has(team.id))
    if (availableTeams.length === 0) return null

    const eligibleGroups = state.groups.filter((group) => group.teamIds.length < group.capacity)
    if (eligibleGroups.length === 0) return null

    const team = availableTeams[this.random.nextInt(availableTeams.length)]
    const lowestRatio = Math.min(...eligibleGroups.map((group) => group.teamIds.length / group.capacity))
    const candidates = eligibleGroups.filter(
      (group) => group.teamIds.length / group.capacity === lowestRatio,
    )
    const group = candidates[this.random.nextInt(candidates.length)]
    const result: DrawResult = {
      id: `draw-${state.drawHistory.length + 1}-${team.id}`,
      teamId: team.id,
      groupId: group.id,
      drawIndex: state.drawHistory.length,
      createdAt: Date.now(),
    }

    group.teamIds.push(team.id)
    state.drawHistory.push(result)
    return result
  }

  generateFullDraw(state: RandomEngineState): DrawResult[] {
    const results: DrawResult[] = []
    while (state.drawHistory.length < state.teams.length) {
      const result = this.drawNext(state)
      if (!result) break
      results.push(result)
    }
    return results
  }
}
