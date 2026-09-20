import pushSoundUrl from '../../../assets/sounds/push.mp3'
import laserImageUrl from '../../../assets/images/laser.png'
import type { Group, Team } from '../../../types/models'
import { CardConveyor } from './CardConveyor'

const statusByState: Record<string, string> = { idle: 'READY TO DRAW', starting: 'SYSTEM WAKE', shuffling: 'SELECTING TEAM...', slowing: 'SCANNING DECK...', locked: 'TEAM LOCKED', revealing: 'TEAM REVEALED', groupScanning: 'SELECTING GROUP...', dealing: 'RESULT CONFIRMED', complete: 'DRAW COMPLETE' }

function playPushSound() {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(pushSoundUrl)
    audio.volume = 0.85
    void audio.play().catch(() => undefined)
  } catch {
    // Audio is an enhancement; drawing still works when audio is unavailable.
  }
}

export function ArcadeMachine({ visualState, teams, selectedTeam, teamCount, showConfig, groups, onPush, onUndo, onReset, disabled, historyDisabled }: { visualState: string; teams: Team[]; selectedTeam?: Team; teamCount: number; showConfig?: string; groups: Group[]; onPush: () => void; onUndo: () => void; onReset: () => void; disabled: boolean; historyDisabled: boolean }) {
  const capacities = groups.map((group) => group.capacity)
  const capacity = capacities.length ? Math.min(...capacities) === Math.max(...capacities) ? `${capacities[0]} TEAMS/GROUP` : `${Math.min(...capacities)}–${Math.max(...capacities)} TEAMS/GROUP` : '—'
  const showSelectedCard = ['starting', 'shuffling', 'slowing', 'locked', 'revealing', 'groupScanning', 'dealing'].includes(visualState)
  return <section className={`arcade-machine arcade-machine--${visualState}`} data-arcade-machine>
    <div className="arcade-marquee"><div><span>LIVE DRAW SYSTEM</span><strong>{visualState === 'complete' ? 'DRAW COMPLETE' : showConfig?.trim() || 'PICK A TEAM'}</strong><small>{showConfig?.trim() ? 'PICK A TEAM' : 'DIFFERENT PEOPLE • SAME EXCITEMENT'}</small></div><b>&gt;&gt;&gt;</b></div>
    <div className="arcade-machine__body">
      <div className="arcade-machine__screen">
        <div className="arcade-machine__telemetry arcade-machine__telemetry--left"><small>ACTIVE PROCESS</small><b>{visualState === 'idle' ? 'SHUFFLING' : statusByState[visualState]}</b><span>TEAMS...</span></div>
        <div className="arcade-machine__telemetry arcade-machine__telemetry--right"><b>{teamCount} TEAMS</b><span>{groups.length} GROUPS</span><small>{capacity}</small></div>
        <CardConveyor key={showSelectedCard ? selectedTeam?.id ?? 'idle' : 'idle'} teams={teams} selectedTeam={showSelectedCard ? selectedTeam : undefined} />
        <div className="arcade-scanner" data-arcade-scanner><img src={laserImageUrl} alt="" aria-hidden="true" /><i /><b /><span /></div>
      </div>
      <div className="arcade-control-deck">
        <div className="arcade-deck-actions"><button className="arcade-mini-button arcade-mini-button--undo" type="button" onClick={onUndo} disabled={historyDisabled} aria-label="Undo last draw"><b>↶</b><span>UNDO</span></button><button className="arcade-mini-button arcade-mini-button--reset" type="button" onClick={onReset} disabled={historyDisabled} aria-label="Reset draw"><b>↻</b><span>RESET</span></button><small><i /> SYSTEM ONLINE</small></div>
        <div className="arcade-console-mark"><b>{statusByState[visualState] ?? 'READY TO DRAW'}</b><small>ARCADE UNIT 04</small></div>
        <div className="arcade-push-housing"><small>HIT TO START</small><button className="arcade-push" type="button" onClick={() => { if (!disabled) { playPushSound(); onPush() } }} disabled={disabled} aria-label="Push to draw"><b>PUSH</b></button></div>
      </div>
    </div>
  </section>
}
