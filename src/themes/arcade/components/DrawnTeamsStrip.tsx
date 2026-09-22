import type { DrawResult, Team } from '../../../types/models'
import { useParticipantImage } from '../../../hooks/useParticipantImage'

function MiniParticipant({ participant }: { participant: Team['participants'][number] }) {
  const { imageUrl } = useParticipantImage(participant.imageId ? participant.id : undefined)
  const initials = participant.name.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'RS'
  return <figure>{imageUrl ? <img src={imageUrl} alt={participant.name} /> : <span>{initials}</span>}</figure>
}

export function DrawnTeamsStrip({ history, teams }: { history: DrawResult[]; teams: Team[] }) {
  return <section className="arcade-history" aria-label="Lịch sử bốc thăm">
    <header>ĐÃ BỐC <b>{String(history.length).padStart(2, '0')}/{String(teams.length).padStart(2, '0')}</b></header>
    <div className="arcade-history__rail">
      {history.map((draw) => {
        const team = teams.find((item) => item.id === draw.teamId)
        if (!team) return null
        return <div key={draw.id} className="arcade-history__team" title={team.participants.map((p) => p.name).join(' × ')} data-history-card><div className="arcade-history__people">{team.participants.slice(0, 2).map((participant) => <MiniParticipant key={participant.id} participant={participant} />)}</div></div>
      })}
    </div>
  </section>
}
