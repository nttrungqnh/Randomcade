import type { ArcadeVisualState } from '../animations/createArcadeDrawTimeline'
const steps = ['XÁO BÀI', 'BỐC TEAM', 'CHỌN BẢNG', 'CÔNG BỐ KẾT QUẢ']
const activeIndex: Record<ArcadeVisualState, number> = { idle: 2, starting: 2, shuffling: 2, slowing: 2, locked: 2, revealing: 2, groupScanning: 3, dealing: 4, complete: 4 }
export function ArcadeProgressPanel({ visualState, complete }: { visualState: ArcadeVisualState; complete: boolean }) {
  const active = complete ? 4 : activeIndex[visualState]
  return <aside className="arcade-progress"><div className="arcade-brand"><span>RANDOM</span><b>SHOW</b><small>RANDOM MADE EPIC</small></div><div className="arcade-progress__panel"><header><i />TIẾN TRÌNH BỐC THĂM</header><div className="arcade-progress__steps">{steps.map((label, index) => { const step = index + 1; const done = step < active || complete; return <div key={label} className={`arcade-progress__step ${step === active && !complete ? 'is-active' : ''} ${done ? 'is-done' : ''}`}><span>{done ? '✓' : String(step).padStart(2, '0')}</span><div><small>STEP {String(step).padStart(2, '0')}</small><b>{label}</b></div><i /></div> })}</div></div><div className="arcade-lucky"><div className="arcade-lucky__bot"><i /><i /><b /><span /></div><strong>GOOD LUCK!</strong><small>THE NEXT TEAM COULD BE YOURS</small></div></aside>
}
