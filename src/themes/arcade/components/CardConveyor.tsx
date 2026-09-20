import type { Team } from '../../../types/models'
import { ArcadeTeamCard } from './ArcadeTeamCard'

export function CardConveyor({ teams, selectedTeam }: { teams: Team[]; selectedTeam?: Team }) {
  const pool = teams.length > 0 ? teams : selectedTeam ? [selectedTeam] : []
  // Keep several repeated cycles on both sides of the selector so the viewport
  // can never outrun the rendered strip during the fast phase.
  const selectedIndex = 40
  const cards = Array.from({ length: 49 }, (_, index) => {
    if (selectedTeam && index === selectedIndex) return selectedTeam
    return pool[index % Math.max(1, pool.length)]
  }).filter((team): team is Team => Boolean(team))

  return <div className="arcade-conveyor" data-arcade-conveyor>
    <div className="arcade-conveyor__rail" />
    <div className="arcade-conveyor__cards" data-arcade-track>
      {cards.map((team, index) => <div className="arcade-conveyor__card" data-card-number={String(index + 1).padStart(2, '0')} data-selected-card={selectedTeam && index === selectedIndex ? 'true' : undefined} key={`${team.id}-${index}`}><ArcadeTeamCard team={team} /></div>)}
    </div>
    <div className="arcade-conveyor__selector" />
  </div>
}
