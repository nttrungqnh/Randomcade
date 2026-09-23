import type { CSSProperties } from 'react'
import type { Group, Team } from '../../../types/models'
import { PixelPeople } from './ArcadePixelArt'
import { ArcadeTeamCard } from './ArcadeTeamCard'

export function ArcadeGroupBoard({ groups, teams, activeGroupId, hiddenTeamId, concealed = false }: { groups: Group[]; teams: Team[]; activeGroupId?: string; hiddenTeamId?: string; concealed?: boolean }) {
  const findTeam = (id: string) => teams.find((team) => team.id === id)

  return (
    <section
      className={`arcade-groups ${groups.length <= 4 ? 'arcade-groups--compact' : ''} ${concealed ? 'arcade-groups--concealed' : ''}`}
      style={{ '--arcade-group-count': groups.length } as CSSProperties}
      aria-label="Kết quả chia bảng"
    >
      {groups.map((group) => (
        <article
          key={group.id}
          data-group-id={group.id}
          className={`arcade-group ${activeGroupId === group.id ? 'arcade-group--active' : ''}`}
        >
          <header>
            <span className="arcade-group__flag" aria-hidden="true" />
            <strong>BẢNG {group.name}</strong>
            <span className="arcade-group__flag" aria-hidden="true" />
          </header>
          <div className="arcade-group__slots" style={{ '--group-capacity': group.capacity } as CSSProperties}>
            {Array.from({ length: group.capacity }, (_, index) => {
              const team = findTeam(group.teamIds[index])
              const hidden = team?.id === hiddenTeamId

              return (
                <div
                  data-slot={String(index + 1)}
                  className={`arcade-group__slot ${team ? 'arcade-group__slot--filled' : ''} ${hidden ? 'arcade-group__slot--hidden' : ''}`}
                  key={team?.id ?? index}
                >
                  <span className="arcade-group__slot-number" aria-label={`Vị trí ${index + 1}`}>{index + 1}</span>
                  {team ? <ArcadeTeamCard team={team} compact /> : (
                    <span className="arcade-slot-empty">
                      <PixelPeople />
                      <span>Chờ đội tiếp theo...</span>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </article>
      ))}
    </section>
  )
}
