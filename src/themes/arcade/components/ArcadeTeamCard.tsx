import { useParticipantImage } from '../../../hooks/useParticipantImage'
import type { Team } from '../../../types/models'
import { PixelPeople } from './ArcadePixelArt'

function Portrait({ name, imageId, participantId }: { name: string; imageId?: string; participantId: string }) {
  const { imageUrl } = useParticipantImage(imageId ? participantId : undefined)
  const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'RS'

  return (
    <div className={`arcade-portrait${imageUrl ? '' : ' arcade-portrait--placeholder'}`}>
      {imageUrl ? <img src={imageUrl} alt={name} /> : <><PixelPeople /><span className="arcade-portrait__initials" aria-label={name}>{initials}</span></>}
    </div>
  )
}

export function ArcadeTeamCard({ team, compact = false, faceDown = false }: { team: Team; compact?: boolean; faceDown?: boolean }) {
  if (faceDown) {
    return (
      <div className="arcade-card arcade-card--back" aria-label="Đội chưa được bật mí">
        <b>?</b>
        <span>RANDOM<br />MADE EPIC</span>
      </div>
    )
  }

  const people = team.participants
  const names = people.map((person) => person.name.trim()).filter(Boolean).join(' × ') || team.name?.trim() || 'Đội chưa có tên'

  return (
    <article className={`arcade-card${compact ? ' arcade-card--compact' : ''}`} title={names}>
      <div className="arcade-card__portraits">
        {people.slice(0, 2).map((person) => (
          <Portrait key={person.id} participantId={person.id} imageId={person.imageId} name={person.name} />
        ))}
      </div>
      <strong>{names}</strong>
    </article>
  )
}
