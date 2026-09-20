import { useEffect, useState } from 'react'
import { getParticipantImage } from '../services/localDatabase'

export function useParticipantImage(participantId?: string, refreshKey = 0) {
  const [imageUrl, setImageUrl] = useState<string>()
  const [loading, setLoading] = useState(Boolean(participantId))

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined

    if (!participantId) {
      setImageUrl(undefined)
      setLoading(false)
      return
    }

    setLoading(true)
    void getParticipantImage(participantId)
      .then((record) => {
        if (!active || !record) return
        objectUrl = URL.createObjectURL(record.blob)
        setImageUrl(objectUrl)
      })
      .catch(() => {
        if (active) setImageUrl(undefined)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [participantId, refreshKey])

  return { imageUrl, loading }
}
