import Dexie, { type EntityTable } from 'dexie'
import type { TeamDrawContent } from '../types/models'

export interface ParticipantImageRecord {
  id: string
  participantId: string
  blob: Blob
  createdAt: number
  updatedAt: number
}

class RandomShowDatabase extends Dexie {
  participantImages!: EntityTable<ParticipantImageRecord, 'id'>
  teamDrawContents!: EntityTable<TeamDrawContent, 'id'>

  constructor() {
    super('RandomShowDB')
    this.version(1).stores({
      participantImages: 'id, participantId, updatedAt',
    })
    this.version(2).stores({
      participantImages: 'id, participantId, updatedAt',
      teamDrawContents: 'id, status, updatedAt, createdAt',
    })
  }
}

export const localDatabase = new RandomShowDatabase()

export async function saveParticipantImage(
  participantId: string,
  blob: Blob,
): Promise<string> {
  const existing = await localDatabase.participantImages.get(participantId)
  const now = Date.now()

  await localDatabase.participantImages.put({
    id: participantId,
    participantId,
    blob,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  })

  return participantId
}

export function getParticipantImage(participantId: string) {
  return localDatabase.participantImages.get(participantId)
}

export function deleteParticipantImage(participantId: string) {
  return localDatabase.participantImages.delete(participantId)
}

export async function clearUnusedImages(activeParticipantIds: string[]) {
  const activeIds = new Set(activeParticipantIds)
  const records = await localDatabase.participantImages.toArray()
  const unusedIds = records
    .filter((record) => !activeIds.has(record.participantId))
    .map((record) => record.id)

  if (unusedIds.length > 0) {
    await localDatabase.participantImages.bulkDelete(unusedIds)
  }
}
