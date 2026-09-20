import type { Group, Team } from '../../../types/models'
import { ArcadeTeamCard } from './ArcadeTeamCard'

export function ArcadeGroupBoard({ groups, teams, activeGroupId, hiddenTeamId }: { groups: Group[]; teams: Team[]; activeGroupId?: string; hiddenTeamId?: string }) {
  const findTeam = (id: string) => teams.find((team) => team.id === id)
  return <section className={`arcade-groups ${groups.length <= 4 ? 'arcade-groups--compact' : ''}`} style={{ '--arcade-group-count': groups.length } as React.CSSProperties}>{groups.map((group) => <article key={group.id} data-group-id={group.id} className={`arcade-group ${activeGroupId === group.id ? 'arcade-group--active' : ''}`}><header><strong aria-label={`Bảng ${group.name}`}>BẢNG {group.name}</strong><span>{group.teamIds.length} / {group.capacity}</span></header><div className="arcade-group__slots" style={{ '--group-capacity': group.capacity } as React.CSSProperties}>{Array.from({ length: group.capacity }, (_, index) => { const team = findTeam(group.teamIds[index]); const hidden = team?.id === hiddenTeamId; return <div data-slot={String(index + 1)} className={`arcade-group__slot ${team ? 'arcade-group__slot--filled' : ''} ${hidden ? 'arcade-group__slot--hidden' : ''}`} key={team?.id ?? index}>{team && <ArcadeTeamCard team={team} compact />}</div> })}</div></article>)}</section>
}
