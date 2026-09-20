import { useShowSessionStore } from '../stores/showSessionStore'

export function DebugShowPage() {
  const session = useShowSessionStore((state) => state.session)
  const drawNext = useShowSessionStore((state) => state.drawNext)
  const drawAll = useShowSessionStore((state) => state.drawAll)
  const undoLastDraw = useShowSessionStore((state) => state.undoLastDraw)
  const resetDraw = useShowSessionStore((state) => state.resetDraw)

  if (!session) {
    return <section className="debug-show"><p className="placeholder__eyebrow">RandomShow</p><h1>NO ACTIVE SHOW</h1><p>Return to the builder and start a show first.</p></section>
  }

  const teamName = (teamId: string) => session.teams.find((team) => team.id === teamId)?.participants.map((person) => person.name).filter(Boolean).join(' × ') || teamId
  const currentResult = session.drawHistory[session.drawHistory.length - 1]
  const drawnCount = session.drawHistory.length

  return (
    <main className="debug-show">
      <header className="debug-show__header"><p>RandomShow</p><h1>Debug Show</h1><span>{session.teams.length} Teams · {session.groups.length} Groups · {drawnCount} / {session.teams.length} Drawn</span></header>
      <section className="debug-show__groups">
        {session.groups.map((group) => (
          <article key={group.id}><h2>Group {group.name} <small>{group.teamIds.length} / {group.capacity}</small></h2>{group.teamIds.length === 0 ? <p className="debug-empty">Empty</p> : group.teamIds.map((teamId) => <p key={teamId}>{teamName(teamId)}</p>)}</article>
        ))}
      </section>
      <section className="debug-show__result"><p>Current result</p><strong>{currentResult ? teamName(currentResult.teamId) : '—'}</strong><span>{currentResult ? `→ GROUP ${session.groups.find((group) => group.id === currentResult.groupId)?.name}` : 'Draw to reveal a result'}</span></section>
      <div className="debug-show__actions"><button type="button" onClick={drawNext} disabled={session.status === 'completed'}>Draw Next</button><button type="button" onClick={undoLastDraw} disabled={!drawnCount}>Undo</button><button type="button" onClick={drawAll} disabled={session.status === 'completed'}>Draw All</button><button type="button" onClick={resetDraw} disabled={!drawnCount}>Reset</button></div>
      <section className="debug-show__history"><h2>History</h2>{session.drawHistory.length === 0 ? <p>No draws yet.</p> : session.drawHistory.map((result) => <p key={result.id}>#{String(result.drawIndex + 1).padStart(2, '0')} {teamName(result.teamId)} → {session.groups.find((group) => group.id === result.groupId)?.name}</p>)}</section>
    </main>
  )
}
