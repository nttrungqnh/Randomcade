import type { Team } from '../types/models'
import { saveParticipantImage } from './localDatabase'

const MAX_PARALLEL_DOWNLOADS = 8

function getDemoImageUrl(participantId: string) {
  const seed = encodeURIComponent(`randomshow-${participantId}`)
  return `https://api.dicebear.com/9.x/personas/png?seed=${seed}&size=480&backgroundType=gradientLinear&radius=8`
}

export async function downloadDemoParticipantImages(teams: Team[]): Promise<Map<string, string>> {
  const participants = teams.flatMap((team) => team.participants)
  const imageIds = new Map<string, string>()
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < participants.length) {
      const index = nextIndex
      nextIndex += 1
      const participant = participants[index]
      if (!participant) continue

      try {
        const imageResponse = await fetch(getDemoImageUrl(participant.id), { cache: 'no-store' })
        if (!imageResponse.ok) continue
        const blob = await imageResponse.blob()
        if (!blob.type.startsWith('image/')) continue
        const imageId = await saveParticipantImage(participant.id, blob)
        imageIds.set(participant.id, imageId)
      } catch {
        // A failed portrait should not prevent the rest of the demo from loading.
      }
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(MAX_PARALLEL_DOWNLOADS, participants.length) },
    () => worker(),
  ))
  return imageIds
}
