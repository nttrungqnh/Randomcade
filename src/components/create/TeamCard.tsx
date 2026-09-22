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
    <article className="team-card" data-invalid={!complete} aria-label={`Đội ${index + 1}`}>
      <header className="team-card__header">
        <div>
          <span>Đội {String(index + 1).padStart(2, '0')}</span>
          <i>{complete ? 'Đã đủ tên' : 'Chưa đủ tên'}</i>
        </div>
        <label>
          <span>Tên đội <em>không bắt buộc</em></span>
          <input
            value={team.name ?? ''}
            placeholder="Ví dụ: Đội Bình Minh"
            onChange={(event) => onUpdateTeam({ name: event.target.value })}
          />
        </label>
        <button className="team-card__delete" type="button" onClick={onRemove} aria-label={`Xóa đội ${index + 1}`}>
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
              <span>Người chơi {participantIndex + 1}</span>
              <input
                required
                value={participant.name}
                placeholder="Nhập họ tên"
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
