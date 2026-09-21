import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Maximize, RotateCcw, LogOut } from 'lucide-react'
import { useShowSessionStore } from '../../stores/showSessionStore'
import type { DrawResult } from '../../types/models'
import { createArcadeDrawTimeline, type ArcadeVisualState } from './animations/createArcadeDrawTimeline'
import { ArcadeBackground } from './components/ArcadeBackground'
import { ArcadeGroupBoard } from './components/ArcadeGroupBoard'
import { ArcadeMachine } from './components/ArcadeMachine'
import { ArcadeResultPanel } from './components/ArcadeResultPanel'
import { DrawnTeamsStrip } from './components/DrawnTeamsStrip'
import alarmSoundUrl from '../../assets/sounds/retro-game-alarm.mp3'
import { PixelBall, PixelCrown, PixelCity } from './components/ArcadePixelArt'
import './styles/arcade-cabinet.css'

export function ArcadeShowPage() {
  const [searchParams] = useSearchParams()
  const session = useShowSessionStore((state) => state.session)
  const drawNext = useShowSessionStore((state) => state.drawNext)
  const undo = useShowSessionStore((state) => state.undoLastDraw)
  const reset = useShowSessionStore((state) => state.resetDraw)
  const startSession = useShowSessionStore((state) => state.startSession)
  const rootRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<ReturnType<typeof createArcadeDrawTimeline> | null>(null)
  const alarmRef = useRef<HTMLAudioElement | null>(null)
  const alarmFadeRef = useRef<number | null>(null)
  const [visualState, setVisualState] = useState<ArcadeVisualState>('idle')
  const [result, setResult] = useState<DrawResult | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [confirmReset, setConfirmReset] = useState(false)
  const isAnimating = visualState !== 'idle' && visualState !== 'complete'
  const displayedResult = result ?? session?.drawHistory.at(-1) ?? null
  const selectedTeam = displayedResult ? session?.teams.find((team) => team.id === displayedResult.teamId) : undefined
  const selectedGroup = displayedResult ? session?.groups.find((group) => group.id === displayedResult.groupId) : undefined
  const selectedTeamNumber = selectedTeam && session ? session.teams.findIndex((team) => team.id === selectedTeam.id) + 1 : undefined
  const drawn = session?.drawHistory.length ?? 0
  const remainingTeams = useMemo(() => session?.teams.filter((team) => !session.drawHistory.some((draw) => draw.teamId === team.id)) ?? [], [session])
  const visibleHistory = session ? (isAnimating ? session.drawHistory.slice(0, -1) : session.drawHistory) : []
  const visibleGroups = useMemo(() => {
    if (!session || !isAnimating || !result) return session?.groups ?? []
    return session.groups.map((group) => ({
      ...group,
      teamIds: group.teamIds.filter((teamId) => teamId !== result.teamId),
    }))
  }, [isAnimating, result, session])
  const enterFullscreen = () => { void document.documentElement.requestFullscreen?.().catch(() => undefined) }
  const handleUndo = useCallback(() => { undo(); setResult(null); setVisualState('idle') }, [undo])

  const startAlarm = useCallback(() => {
    if (!soundEnabled) return
    if (alarmFadeRef.current !== null) window.cancelAnimationFrame(alarmFadeRef.current)
    const audio = alarmRef.current ?? new Audio(alarmSoundUrl)
    alarmRef.current = audio
    audio.loop = true
    audio.volume = 0.62
    if (audio.paused) void audio.play().catch(() => undefined)
  }, [soundEnabled])

  const fadeAlarm = useCallback(() => {
    const audio = alarmRef.current
    if (!audio || audio.paused) return
    if (alarmFadeRef.current !== null) window.cancelAnimationFrame(alarmFadeRef.current)
    const startedAt = performance.now()
    const startingVolume = audio.volume
    const fade = () => {
      const progress = Math.min(1, (performance.now() - startedAt) / 500)
      audio.volume = Math.max(0, startingVolume * (1 - progress))
      if (progress < 1) alarmFadeRef.current = window.requestAnimationFrame(fade)
      else {
        audio.pause()
        audio.currentTime = 0
        audio.volume = 0.62
        alarmFadeRef.current = null
      }
    }
    alarmFadeRef.current = window.requestAnimationFrame(fade)
  }, [])

  const handlePush = useCallback(() => {
    const current = useShowSessionStore.getState().session
    if (!current || timelineRef.current?.isActive() || current.status === 'completed') return
    startAlarm()
    setVisualState('starting')
    const next = drawNext()
    if (!next || !rootRef.current) {
      setVisualState('idle')
      return
    }
    setResult(next)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => {
      if (!rootRef.current) return
      timelineRef.current?.kill()
      timelineRef.current = createArcadeDrawTimeline({ root: rootRef.current, groupId: next.groupId, reducedMotion, onState: setVisualState, onFinish: () => setVisualState(useShowSessionStore.getState().session?.status === 'completed' ? 'complete' : 'idle') })
    })
  }, [drawNext, startAlarm])

  useEffect(() => () => {
    timelineRef.current?.kill()
    if (alarmFadeRef.current !== null) window.cancelAnimationFrame(alarmFadeRef.current)
    alarmRef.current?.pause()
  }, [])
  useEffect(() => {
    if (!soundEnabled) { alarmRef.current?.pause(); return }
    if (['starting', 'shuffling', 'slowing', 'locked'].includes(visualState)) startAlarm()
    else fadeAlarm()
  }, [fadeAlarm, startAlarm, visualState, soundEnabled])
  useEffect(() => {
    if (session || !import.meta.env.DEV || searchParams.get('demo') !== '1') return
    startSession(Array.from({ length: 9 }, (_, index) => ({ id: `arcade-demo-${index}`, name: `Team ${String(index + 1).padStart(2, '0')}`, participants: [{ id: `arcade-demo-${index}-a`, name: `Player ${index * 2 + 1}` }, { id: `arcade-demo-${index}-b`, name: `Player ${index * 2 + 2}` }] })), 3, 'arcade')
  }, [searchParams, session, startSession])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (confirmReset || target?.matches('input, textarea, button, select')) return
      if (event.code === 'Space') { event.preventDefault(); handlePush() }
      if (!isAnimating && event.key.toLowerCase() === 'u') handleUndo()
      if (event.key.toLowerCase() === 'f') enterFullscreen()
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [confirmReset, handlePush, handleUndo, isAnimating])

  if (!session) return <main className="arcade-empty"><ArcadeBackground /><div><p>RandomShow</p><h1>No show<br />ready</h1><span>Create a show before entering the arcade.</span><Link to="/create">Create show</Link></div></main>
  const debug = import.meta.env.DEV && searchParams.get('debug') === '1'
  return <main ref={rootRef} className={`arcade-show arcade-show--${visualState}`}>
    <ArcadeBackground />
    <div className="arcade-shell">
      <header className="arcade-show-brand">
        <div className="arcade-logo"><strong>Drawshow</strong><span>RANDOM MADE EPIC</span><PixelBall /></div>
        <div className="arcade-marquee pixel-frame"><span aria-hidden="true">»</span><div><strong>{session.showConfig?.trim() || 'BỐC THĂM MAY MẮN'}</strong><small>PICKLEBALL TOURNAMENT DRAW</small></div><span aria-hidden="true">«</span></div>
        <div className="arcade-header-right"><p>SAME COURT<br />BIGGER FRIENDS <PixelCrown /></p><div className="arcade-live pixel-frame"><b><i /> LIVE</b><span>{String(visibleHistory.length).padStart(2, '0')}/{String(session.teams.length).padStart(2, '0')}</span></div></div>
      </header>
      <section className="arcade-main-stage">
        <ArcadeMachine visualState={session.status === 'completed' && !isAnimating ? 'complete' : visualState} teams={remainingTeams} selectedTeam={selectedTeam} onPush={handlePush} onUndo={handleUndo} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((value) => !value)} disabled={isAnimating || session.status === 'completed'} historyDisabled={isAnimating || drawn === 0} />
        <ArcadeResultPanel visualState={visualState} team={selectedTeam} teamNumber={selectedTeamNumber} group={selectedGroup} complete={session.status === 'completed'} />
      </section>
      <ArcadeGroupBoard groups={visibleGroups} teams={session.teams} activeGroupId={isAnimating ? selectedGroup?.id : undefined} />
      <footer className="arcade-bottom pixel-frame">
        <DrawnTeamsStrip history={visibleHistory} teams={session.teams} />
        <PixelCity className="arcade-city" />
        <p className="arcade-footer-motto">PICKLEBALL<br />MORE FRIENDS<br />A BRIGHTER TOMORROW</p>
        <nav className="arcade-operator" aria-label="Điều khiển màn chơi">
          <button className="pixel-frame" onClick={() => setConfirmReset(true)} disabled={isAnimating || drawn === 0} aria-label="Bốc thăm lại" title="Bốc thăm lại"><RotateCcw /></button>
          <button className="pixel-frame" onClick={enterFullscreen} aria-label="Toàn màn hình" title="Toàn màn hình (F)"><Maximize /><span>TOÀN MÀN HÌNH</span></button>
          <Link className="pixel-frame" to="/create" aria-label="Thoát màn chơi" title="Thoát màn chơi"><LogOut /><span>THOÁT</span></Link>
        </nav>
      </footer>
    </div>
    {confirmReset && <div className="arcade-modal"><div><p>Bốc thăm lại?</p><span>Kết quả bốc thăm sẽ bị xóa. Danh sách đội và thiết lập bảng vẫn được giữ.</span><footer><button onClick={() => setConfirmReset(false)}>Hủy</button><button onClick={() => { timelineRef.current?.kill(); reset(); setResult(null); setVisualState('idle'); setConfirmReset(false) }}>Làm lại</button></footer></div></div>}
    {debug && <aside className="arcade-debug">{visualState} · {result?.teamId ?? '—'} · {result?.groupId ?? '—'}</aside>}
  </main>
}
