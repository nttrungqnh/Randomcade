import { useParticipantImage } from '../../../hooks/useParticipantImage'
import type { Team } from '../../../types/models'

function Portrait({ name, imageId, participantId }: { name: string; imageId?: string; participantId: string }) {
  const { imageUrl } = useParticipantImage(imageId ? participantId : undefined)
  const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'RS'
  return <div className="arcade-portrait">{imageUrl ? <img src={imageUrl} alt={name} /> : <span>{initials}</span>}</div>
}

export function ArcadeTeamCard({ team, compact = false, faceDown = false }: { team: Team; compact?: boolean; faceDown?: boolean }) {
  if (faceDown) return <div className="arcade-card arcade-card--back"><b>RS</b><span>Random<br />Show</span></div>
  const people = team.participants
  const names = people.map((person) => person.name.trim()).filter(Boolean).join(' × ') || 'Unknown team'
  if (compact) return <article className="arcade-card arcade-card--compact"><strong>{names}</strong></article>
  return (
    <article className="arcade-card">
      <header><span>{team.name?.trim() || 'TEAM'}</span><i>RS</i></header>
      <div className="arcade-card__portraits">{people.slice(0, 2).map((person) => <Portrait key={person.id} participantId={person.id} imageId={person.imageId} name={person.name} />)}</div>
      <strong>{names}</strong>
    </article>
  )
}
