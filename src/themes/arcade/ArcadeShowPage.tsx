import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Maximize, RotateCcw, LogOut, Volume2, VolumeX } from 'lucide-react'
import { useShowSessionStore } from '../../stores/showSessionStore'
import { useTeamDrawContentStore } from '../../stores/teamDrawContentStore'
import type { DrawResult, Team } from '../../types/models'
import { createArcadeDrawTimeline, type ArcadeVisualState } from './animations/createArcadeDrawTimeline'
import { ArcadeBackground } from './components/ArcadeBackground'
import { ArcadeGroupBoard } from './components/ArcadeGroupBoard'
import { ArcadeMachine } from './components/ArcadeMachine'
import { ArcadeResultPanel } from './components/ArcadeResultPanel'
import { DrawnTeamsStrip } from './components/DrawnTeamsStrip'
import alarmSoundUrl from '../../assets/sounds/retro-game-alarm.mp3'
import lotterySoundUrl from '../../assets/sounds/nhac-xo-so.mp3'
import { PixelBall } from './components/ArcadePixelArt'
import './styles/arcade-cabinet.css'
import './styles/team-draw-modes.css'

export function ArcadeShowPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { id: drawId } = useParams()
  const teamDrawStore = useTeamDrawContentStore()
  const content = drawId ? teamDrawStore.contents.find((item) => item.id === drawId) : undefined
  const legacySession = useShowSessionStore((state) => state.session)
  const session = content ? { id: content.id, startedAt: content.createdAt, screenConfig: content.settings.screenConfig || content.name, hostName: content.settings.hostName, teams: content.teams, groups: content.groups, drawHistory: content.drawHistory, status: content.status === 'completed' ? 'completed' as const : 'running' as const, groupMode: 'balanced' as const, selectedTheme: content.templateId } : legacySession
  const drawNext = async () => drawId ? teamDrawStore.drawNext(drawId) : useShowSessionStore.getState().drawNext()
  const undo = () => drawId ? teamDrawStore.undoLastDraw(drawId) : useShowSessionStore.getState().undoLastDraw()
  const reset = () => { if (drawId) teamDrawStore.resetDraw(drawId); else useShowSessionStore.getState().resetDraw() }
  const startSession = useShowSessionStore((state) => state.startSession)
  const rootRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<ReturnType<typeof createArcadeDrawTimeline> | null>(null)
  const alarmRef = useRef<HTMLAudioElement | null>(null)
  const alarmFadeRef = useRef<number | null>(null)
  const drawLockRef = useRef(false)
  const bulkRevealTimerRef = useRef<number | null>(null)
  const [visualState, setVisualState] = useState<ArcadeVisualState>('idle')
  const [result, setResult] = useState<DrawResult | null>(null)
  const [conveyorPool, setConveyorPool] = useState<Team[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedSound, setSelectedSound] = useState<'retro' | 'lottery'>('retro')
  const [confirmReset, setConfirmReset] = useState(false)
  const [bulkRevealed, setBulkRevealed] = useState(true)
  useEffect(() => { if (drawId) void teamDrawStore.hydrate() }, [drawId])
  useEffect(() => {
    if (drawId && content?.status === 'completed' && visualState === 'idle' && !drawLockRef.current && location.pathname.endsWith('/play')) {
      navigate(`/team-draw/${drawId}/result`, { replace: true })
    }
  }, [content?.status, drawId, location.pathname, navigate, visualState])
  const isAnimating = visualState !== 'idle' && visualState !== 'complete'
  const displayedResult = result ?? session?.drawHistory.at(-1) ?? null
  const selectedTeam = displayedResult ? session?.teams.find((team) => team.id === displayedResult.teamId) : undefined
  const selectedGroup = displayedResult ? session?.groups.find((group) => group.id === displayedResult.groupId) : undefined
  const selectedTeamNumber = selectedTeam && session ? session.teams.findIndex((team) => team.id === selectedTeam.id) + 1 : undefined
  const drawn = session?.drawHistory.length ?? 0
  const remainingTeams = useMemo(() => session?.teams.filter((team) => !session.drawHistory.some((draw) => draw.teamId === team.id)) ?? [], [session])
  const visibleHistory = !session ? [] : content?.drawMode === 'instant' && !bulkRevealed ? [] : isAnimating ? session.drawHistory.slice(0, -1) : session.drawHistory
  const visibleGroups = useMemo(() => {
    if (!session || !isAnimating || !result) return session?.groups ?? []
    return session.groups.map((group) => ({
      ...group,
      teamIds: group.teamIds.filter((teamId) => teamId !== result.teamId),
    }))
  }, [isAnimating, result, session])
  const enterFullscreen = () => { void document.documentElement.requestFullscreen?.().catch(() => undefined) }
  const handleUndo = useCallback(() => { undo(); setResult(null); setVisualState('idle') }, [undo])

  const selectedSoundUrl = selectedSound === 'lottery' ? lotterySoundUrl : alarmSoundUrl

  const startAlarm = useCallback(() => {
    if (!soundEnabled) return
    if (alarmFadeRef.current !== null) window.cancelAnimationFrame(alarmFadeRef.current)
    const audio = alarmRef.current ?? new Audio(selectedSoundUrl)
    alarmRef.current = audio
    audio.loop = true
    audio.volume = 0.62
    if (audio.paused) void audio.play().catch(() => undefined)
  }, [selectedSoundUrl, soundEnabled])

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

  const handlePush = useCallback(async () => {
    const current = session
    if (!current || drawLockRef.current || timelineRef.current?.isActive() || current.status === 'completed') return
    if (content?.drawMode === 'instant' && drawId) {
      drawLockRef.current = true
      let allResults: DrawResult[]
      try { allResults = await teamDrawStore.drawAll(drawId) } catch { drawLockRef.current = false; return }
      if (!allResults.length) { drawLockRef.current = false; return }
      setBulkRevealed(false)
      setConveyorPool(current.teams)
      setVisualState('shuffling')
      startAlarm()
      bulkRevealTimerRef.current = window.setTimeout(() => {
        setVisualState('dealing')
      bulkRevealTimerRef.current = window.setTimeout(() => {
        setBulkRevealed(true)
        setConveyorPool([])
        setVisualState('complete')
        drawLockRef.current = false
        navigate(`/team-draw/${drawId}/result`, { replace: true })
        }, 1450)
      }, 1450)
      return
    }
    startAlarm()
    const poolBeforeDraw = current.teams.filter((team) => !current.drawHistory.some((draw) => draw.teamId === team.id))
    setConveyorPool(poolBeforeDraw)
    setVisualState('starting')
    const next = await drawNext()
    if (!next || !rootRef.current) {
      setVisualState('idle')
      return
    }
    setResult(next)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => {
      if (!rootRef.current) return
      timelineRef.current?.kill()
      timelineRef.current = createArcadeDrawTimeline({ root: rootRef.current, groupId: next.groupId, reducedMotion, onState: setVisualState, onFinish: () => { setConveyorPool([]); const latest = drawId ? useTeamDrawContentStore.getState().getContent(drawId) : useShowSessionStore.getState().session; setVisualState(latest?.status === 'completed' ? 'complete' : 'idle'); if (drawId && latest?.status === 'completed') navigate(`/team-draw/${drawId}/result`, { replace: true }) } })
    })
  }, [content?.drawMode, drawId, drawNext, navigate, session, startAlarm, teamDrawStore])

  useEffect(() => {
    const audio = alarmRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    alarmRef.current = null
  }, [selectedSoundUrl])

  useEffect(() => () => {
    timelineRef.current?.kill()
    if (bulkRevealTimerRef.current !== null) window.clearTimeout(bulkRevealTimerRef.current)
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

  if (drawId && !teamDrawStore.hydrated) return <main className="arcade-empty">Đang tải nội dung bốc thăm…</main>
  if (!session) return <main className="arcade-empty"><ArcadeBackground /><div><p>RandomShow</p><h1>No show<br />ready</h1><span>Create a show before entering the arcade.</span><Link to="/create">Create show</Link></div></main>
  const debug = import.meta.env.DEV && searchParams.get('debug') === '1'
  return <main ref={rootRef} className={`arcade-show arcade-show--${visualState}`}>
    <ArcadeBackground />
    <div className="arcade-shell">
      <header className="arcade-show-brand">
        <div className="arcade-logo"><strong>Drawshow</strong><span>RANDOM MADE EPIC</span><PixelBall /></div>
        <div className="arcade-marquee pixel-frame"><span aria-hidden="true">»</span><div><strong>{session.screenConfig?.trim() || 'BỐC THĂM MAY MẮN'}</strong><small>{session.hostName?.trim() ? `TỔ CHỨC BỞI ${session.hostName.trim()}` : 'PICKLEBALL TOURNAMENT DRAW'}</small></div><span aria-hidden="true">«</span></div>
        <div className="arcade-header-right"><div className="arcade-live pixel-frame"><b><i /> LIVE</b><span>{String(visibleHistory.length).padStart(2, '0')}/{String(session.teams.length).padStart(2, '0')}</span></div></div>
      </header>
      <section className="arcade-main-stage">
        <ArcadeMachine visualState={session.status === 'completed' && !isAnimating ? 'complete' : visualState} teams={isAnimating && conveyorPool.length > 0 ? conveyorPool : remainingTeams} selectedTeam={selectedTeam} onPush={() => { void handlePush() }} onUndo={handleUndo} soundEnabled={soundEnabled} disabled={isAnimating || session.status === 'completed'} historyDisabled={isAnimating || drawn === 0 || content?.drawMode === 'instant'} drawButtonLabel={content?.drawMode === 'instant' ? '⚡ BỐC TẤT CẢ' : 'BỐC THĂM'} progress={`${String(drawn).padStart(2, '0')} / ${String(session.teams.length).padStart(2, '0')}`} />
        <ArcadeResultPanel visualState={visualState} team={selectedTeam} teamNumber={selectedTeamNumber} group={selectedGroup} complete={session.status === 'completed'} />
      </section>
      <ArcadeGroupBoard groups={visibleGroups} teams={session.teams} activeGroupId={isAnimating ? selectedGroup?.id : undefined} concealed={content?.drawMode === 'instant' && !bulkRevealed} />
      <footer className="arcade-bottom pixel-frame">
        <DrawnTeamsStrip history={visibleHistory} teams={session.teams} />
        <nav className="arcade-operator" aria-label="Điều khiển màn chơi">
          <button className="pixel-frame" onClick={() => setConfirmReset(true)} disabled={isAnimating || drawn === 0} aria-label="Bốc thăm lại" title="Bốc thăm lại"><RotateCcw /></button>
          <button className="pixel-frame arcade-operator__sound" onClick={() => setSoundEnabled((value) => !value)} aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={soundEnabled} title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}>{soundEnabled ? <Volume2 /> : <VolumeX />}</button>
          <select className="arcade-sound-picker" value={selectedSound} onChange={(event) => setSelectedSound(event.target.value as 'retro' | 'lottery')} disabled={isAnimating} aria-label="Chọn nhạc quay"><option value="retro">RETRO GAME</option><option value="lottery">NHẠC XỔ SỐ</option></select>
          <button className="pixel-frame" onClick={enterFullscreen} aria-label="Toàn màn hình" title="Toàn màn hình (F)"><Maximize /><span>TOÀN MÀN HÌNH</span></button>
          <Link className="pixel-frame" to={drawId ? "/team-draw" : "/create"} aria-label="Thoát màn chơi" title="Thoát màn chơi"><LogOut /><span>{drawId ? "DANH SÁCH" : "THOÁT"}</span></Link>
        </nav>
      </footer>
    </div>
    {confirmReset && <div className="arcade-modal"><div><p>Bốc thăm lại?</p><span>Bốc lại sẽ xóa toàn bộ kết quả hiện tại. Danh sách đội và thiết lập vẫn được giữ.</span><footer><button onClick={() => setConfirmReset(false)}>Hủy</button><button onClick={() => { timelineRef.current?.kill(); if (bulkRevealTimerRef.current !== null) window.clearTimeout(bulkRevealTimerRef.current); drawLockRef.current = false; reset(); setResult(null); setBulkRevealed(true); setVisualState('idle'); setConfirmReset(false) }}>Bốc lại</button></footer></div></div>}
    {debug && <aside className="arcade-debug">{visualState} · {result?.teamId ?? '—'} · {result?.groupId ?? '—'}</aside>}
  </main>
}
