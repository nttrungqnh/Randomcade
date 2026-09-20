import type { Group, Team } from '../../../types/models'
import type { ArcadeVisualState } from '../animations/createArcadeDrawTimeline'
import { ArcadeTeamCard } from './ArcadeTeamCard'
export function ArcadeResultPanel({ visualState, team, teamNumber, group, complete }: { visualState: ArcadeVisualState; team?: Team; teamNumber?: number; group?: Group; complete: boolean }) {
  const revealTeam = team && ['idle', 'revealing', 'groupScanning', 'dealing'].includes(visualState)
  const revealGroup = group && ['idle', 'dealing'].includes(visualState)
  return <aside className="arcade-result"><header><i /><span>{complete ? 'SESSION COMPLETE' : team ? `TEAM #${String(teamNumber ?? '').padStart(2, '0')}` : 'SELECTED TEAM'}</span><b>LIVE</b></header><div data-arcade-reveal className={`arcade-result__card ${revealTeam ? 'is-revealed' : ''}`}>{complete ? <div className="arcade-result__waiting"><b>ALL</b><strong>TEAMS DRAWN</strong><span>MISSION COMPLETE</span></div> : revealTeam ? <ArcadeTeamCard team={team} /> : <div className="arcade-result__waiting"><b>?</b><strong>WAITING FOR TEAM</strong><span>HIT PUSH TO BEGIN</span></div>}</div><div className={`arcade-result__group ${visualState === 'groupScanning' ? 'is-scanning' : ''} ${revealGroup ? 'is-locked' : ''}`}><strong>{revealGroup ? `BẢNG ${group.name}` : '—'}</strong>{!revealGroup && <span>AWAITING RESULT</span>}</div></aside>
}
