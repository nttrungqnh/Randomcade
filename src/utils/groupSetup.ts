export interface GroupCapacity {
  id: string
  name: string
  capacity: number
}

/**
 * Returns a balanced, deterministic capacity for each group.
 * Extra teams are assigned to the first groups so capacities differ by at most one.
 */
export function calculateGroupCapacities(teamCount: number, groupCount: number): number[] {
  const normalizedTeamCount = Math.max(0, Math.floor(teamCount))
  const normalizedGroupCount = Math.min(
    normalizedTeamCount,
    Math.max(0, Math.floor(groupCount)),
  )

  if (normalizedGroupCount === 0) return []

  const baseCapacity = Math.floor(normalizedTeamCount / normalizedGroupCount)
  const remainder = normalizedTeamCount % normalizedGroupCount

  return Array.from({ length: normalizedGroupCount }, (_, index) =>
    baseCapacity + (index < remainder ? 1 : 0),
  )
}

/** Converts a zero-based index to spreadsheet-style group names: A…Z, AA, AB… */
export function getGroupName(index: number): string {
  if (!Number.isInteger(index) || index < 0) return ''

  let value = index + 1
  let name = ''

  while (value > 0) {
    value -= 1
    name = String.fromCharCode(65 + (value % 26)) + name
    value = Math.floor(value / 26)
  }

  return name
}

export function createGroupCapacityConfig(teamCount: number, groupCount: number): GroupCapacity[] {
  return calculateGroupCapacities(teamCount, groupCount).map((capacity, index) => ({
    id: `group-${index}`,
    name: getGroupName(index),
    capacity,
  }))
}
