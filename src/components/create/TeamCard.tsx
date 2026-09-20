import { Copy, Trash2 } from 'lucide-react'
import type { Participant, Team } from '../../types/models'
import { PhotoPicker } from './PhotoPicker'

interface TeamCardProps {
  team: Team
  index: number
  onUpdateTeam: (updates: Pick<Team, 'name'>) => void
  onUpdateParticipant: (
    participantId: string,
    updates: Partial<Pick<Participant, 'name' | 'imageId'>>,
  ) => void
  onRemove: () => void
}

export function TeamCard({
  team,
  index,
  onUpdateTeam,
  onUpdateParticipant,
  onRemove,
}: TeamCardProps) {
  const complete = team.participants.every((participant) => participant.name.trim())

  return (
    <article className="team-card" data-invalid={!complete}>
      <header className="team-card__header">
        <div>
          <span>Team {String(index + 1).padStart(2, '0')}</span>
          <i>{complete ? 'Ready' : 'Needs names'}</i>
        </div>
        <label>
          <span>Team name <em>optional</em></span>
          <input
            value={team.name ?? ''}
            placeholder="e.g. The Rockets"
            onChange={(event) => onUpdateTeam({ name: event.target.value })}
          />
        </label>
        <button className="team-card__delete" type="button" onClick={onRemove} aria-label={`Delete team ${index + 1}`}>
          <Trash2 size={16} />
        </button>
      </header>

      <div className="team-card__players">
        {team.participants.map((participant, participantIndex) => (
          <div className="player-editor" key={participant.id}>
            <PhotoPicker
              participant={participant}
              onImageChange={(imageId) => onUpdateParticipant(participant.id, { imageId })}
            />
            <label>
              <span>Player {participantIndex + 1}</span>
              <input
                required
                value={participant.name}
                placeholder="Enter name"
                aria-invalid={!participant.name.trim()}
                onChange={(event) => onUpdateParticipant(participant.id, { name: event.target.value })}
              />
            </label>
            {participantIndex === 0 && <Copy className="player-editor__join" size={15} aria-hidden="true" />}
          </div>
        ))}
      </div>
    </article>
  )
}
