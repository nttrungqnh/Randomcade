import type { DrawResult, Team } from '../../../types/models'
import { useParticipantImage } from '../../../hooks/useParticipantImage'

function MiniParticipant({ participant }: { participant: Team['participants'][number] }) {
  const { imageUrl } = useParticipantImage(participant.imageId ? participant.id : undefined)
  const initials = participant.name.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'RS'
  return <figure>{imageUrl ? <img src={imageUrl} alt={participant.name} /> : <span>{initials}</span>}</figure>
}

function MiniTeam({ team }: { team: Team }) {
  return <div className="arcade-history__team" data-history-card><div className="arcade-history__people">{team.participants.slice(0, 2).map((participant) => <MiniParticipant key={participant.id} participant={participant} />)}</div></div>
}
export function DrawnTeamsStrip({ history, teams }: { history: DrawResult[]; teams: Team[] }) { return <div className="arcade-bottom"><section className="arcade-history"><header><span>ĐÃ BỐC <b>({history.length}/{teams.length})</b></span><i /></header><div className="arcade-history__rail">{history.length ? history.map((draw) => { const team = teams.find((item) => item.id === draw.teamId); return team ? <MiniTeam key={draw.id} team={team} /> : null }) : <div className="arcade-history__empty">CHƯA CÓ KẾT QUẢ — PUSH TO START THE SHOW</div>}</div></section></div> }
