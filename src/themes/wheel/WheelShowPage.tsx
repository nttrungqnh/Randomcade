import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Crown, GripVertical, Play, Plus, RotateCcw, Shuffle, Trash2, Users, Volume2, VolumeX } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { secureRandomInt } from '../../features/random/secureRandom'
import { useShowSessionStore } from '../../stores/showSessionStore'
import type { Team } from '../../types/models'
import lotterySound from '../../assets/sounds/nhac-xo-so.mp3'
import spinSound from '../../assets/sounds/retro-game-alarm.mp3'
import wheelCenterImage from '../../assets/wheelo-transparent.png'
import './wheel.css'

const wheelColors = ['#d91f2b', '#ff742b', '#ffd13b', '#18a94e', '#1e9fac', '#2856ae', '#4030c2', '#a729b4', '#ed3b86', '#ed85bd', '#a77ee4', '#8d54d0']

function teamLabel(team: Team) {
  if (team.name?.trim()) return team.name.trim()
  return team.participants.map((participant) => participant.name.trim()).filter(Boolean).join(' × ')
}

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = secureRandomInt(index + 1)
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export function WheelShowPage() {
  const [searchParams] = useSearchParams()
  const session = useShowSessionStore((state) => state.session)
  const demo = import.meta.env.DEV && searchParams.get('demo') === '1'
  const initialOptions = useMemo(() => session?.teams.map(teamLabel).filter(Boolean) ?? (demo ? ['Minh', 'Hùng', 'Trang', 'Long', 'Hà', 'Duy', 'Tuấn', 'Vy', 'Khoa', 'An', 'Phương', 'Nam'] : []), [demo, session])
  const [options, setOptions] = useState(initialOptions)
  const [wheelOptions, setWheelOptions] = useState(initialOptions)
  const [optionsText, setOptionsText] = useState(() => initialOptions.join('\n'))
  const [rotation, setRotation] = useState(0)
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [selectedSound, setSelectedSound] = useState<'retro' | 'lottery'>('retro')
  const timerRef = useRef<number | null>(null)
  const spinAudioRef = useRef<HTMLAudioElement | null>(null)
  const soundSrc = selectedSound === 'lottery' ? lotterySound : spinSound

  useEffect(() => {
    const audio = new Audio(soundSrc)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.72
    spinAudioRef.current = audio

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      audio.pause()
      audio.currentTime = 0
      spinAudioRef.current = null
    }
  }, [soundSrc])

  useEffect(() => {
    const audio = spinAudioRef.current
    if (!audio) return

    if (spinning && soundOn) {
      audio.currentTime = 0
      void audio.play().catch(() => undefined)
      return
    }

    audio.pause()
    audio.currentTime = 0
  }, [soundOn, soundSrc, spinning])

  const segmentAngle = wheelOptions.length ? 360 / wheelOptions.length : 360
  const wheelBackground = wheelOptions.length
    ? `conic-gradient(${wheelOptions.map((_, index) => `${wheelColors[index % wheelColors.length]} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(',')})`
    : 'conic-gradient(#263141 0 360deg)'

  const updateOptions = (value: string) => {
    setOptionsText(value)
    const next = value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 32)
    setOptions(next)
    setWheelOptions(next)
    setWinnerLabel(null)
    setWinnerIndex(null)
    setRotation(0)
  }

  const spin = () => {
    if (spinning || wheelOptions.length < 2) return
    const candidates = wheelOptions.map((_, index) => index)
    const winner = candidates[secureRandomInt(candidates.length)]
    const winnerName = wheelOptions[winner]
    const targetAngle = ((-(winner + 0.5) * segmentAngle) % 360 + 360) % 360
    const currentAngle = ((rotation % 360) + 360) % 360
    const nextRotation = rotation + 360 * 6 + ((targetAngle - currentAngle + 360) % 360)

    setWinnerLabel(null)
    setWinnerIndex(null)
    setSpinning(true)
    setRotation(nextRotation)
    timerRef.current = window.setTimeout(() => {
      setWinnerLabel(winnerName)
      setWinnerIndex(winner)
      setSpinning(false)
      timerRef.current = null
    }, 10000)
  }

  const closeResult = () => {
    setWinnerLabel(null)
    setWinnerIndex(null)
  }

  const removeWinnerFromWheel = () => {
    if (winnerIndex !== null) {
      setWheelOptions((current) => current.filter((_, index) => index !== winnerIndex))
    }
    closeResult()
  }

  if (!session && !demo) {
    return <main className="wheel-empty"><Crown size={44} /><h1>Lucky Wheel chưa có danh sách</h1><p>Hãy tạo show và nhập các team trước khi bắt đầu quay.</p><Link to="/create?theme=wheel">Tạo Lucky Wheel</Link></main>
  }

  return (
    <main className="wheel-show">
      <div className="wheel-show__ambient" aria-hidden="true" />

      <aside className="wheel-panel wheel-panel--setup">
        <Link className="wheel-back" to="/create?theme=wheel"><ArrowLeft size={16} /> Chỉnh sửa show</Link>
        <header className="wheel-logo"><Crown /><strong><span>Lucky</span> Wheel</strong><small>Spin · Pick · Be Lucky</small></header>

        <section className="wheel-control-section">
          <h2><Users size={17} /> Danh sách lựa chọn <span>{options.length}</span></h2>
          <textarea value={optionsText} onChange={(event) => updateOptions(event.target.value)} disabled={spinning} placeholder="Nhập danh sách (mỗi dòng 1 tên)..." aria-label="Danh sách lựa chọn" />
          <div className="wheel-inline-actions">
            <button type="button" disabled={spinning} onClick={() => updateOptions(`${optionsText}${optionsText && !optionsText.endsWith('\n') ? '\n' : ''}Lựa chọn ${options.length + 1}`)}><Plus size={16} /> Thêm nhanh</button>
            <button type="button" disabled={spinning} onClick={() => updateOptions('')}><Trash2 size={15} /> Xóa tất cả</button>
          </div>
        </section>

        <section className="wheel-control-section wheel-effects">
          <h2>Hiệu ứng</h2>
          <button type="button" aria-pressed={soundOn} onClick={() => setSoundOn((value) => !value)}>{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />} {soundOn ? 'Bật âm thanh' : 'Tắt âm thanh'}</button>
          <select value={selectedSound} onChange={(event) => setSelectedSound(event.target.value as 'retro' | 'lottery')} disabled={spinning} aria-label="Chọn nhạc quay">
            <option value="retro">Retro Game</option>
            <option value="lottery">Nhạc xổ số</option>
          </select>
        </section>

        <button className="wheel-start" type="button" onClick={spin} disabled={spinning || wheelOptions.length < 2}><Play fill="currentColor" /><span>{spinning ? 'ĐANG QUAY...' : 'BẮT ĐẦU QUAY'}<small>Let fate decide!</small></span></button>
      </aside>

      <section className="wheel-stage" aria-label="Lucky Wheel">
        <div className="wheel-game-screen">
          <header className="wheel-game-screen__hud">
            <strong>{spinning ? 'SPINNING!' : 'READY!'}</strong>
            <div><b>{wheelOptions.length} PLAYERS</b><span>RANDOM PICK</span></div>
          </header>
          <div className={`lucky-wheel ${spinning ? 'is-spinning' : ''}`}>
            <div className="lucky-wheel__frame" />
            <div className="lucky-wheel__rotor" style={{ background: wheelBackground, transform: `rotate(${rotation}deg)`, '--wheel-count': Math.max(wheelOptions.length, 1) } as React.CSSProperties}>
              {wheelOptions.map((option, index) => (
                <div className="lucky-wheel__label" key={`${option}-${index}`} style={{ '--label-angle': `${-90 + (index + 0.5) * segmentAngle}deg` } as React.CSSProperties}>
                  <span>{option}</span>
                </div>
              ))}
            </div>
            <div className="lucky-wheel__pointer"><i /></div>
            <button className="lucky-wheel__hub" type="button" onClick={spin} disabled={spinning || wheelOptions.length < 2} aria-label="Quay vòng quay"><img src={wheelCenterImage} alt="" /></button>
          </div>
          <div className="wheel-game-screen__city" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <button className="wheel-game-screen__spin" type="button" onClick={spin} disabled={spinning || wheelOptions.length < 2}><span>&gt;&gt;&gt;</span>{spinning ? 'SPINNING...' : 'PRESS THE BUTTON TO SPIN!'}<span>&lt;&lt;&lt;</span></button>
        </div>
      </section>

      <aside className="wheel-panel wheel-panel--list">
        <header><h2><Users size={18} /> Danh sách ({options.length})</h2><button type="button" disabled={spinning} onClick={() => { const next = shuffle(options); setOptions(next); setWheelOptions(next); setOptionsText(next.join('\n')); closeResult(); setRotation(0) }}><Shuffle size={15} /> Xáo trộn</button></header>
        <ol>
          {options.map((option, index) => <li key={`${option}-list-${index}`}><span>{index + 1}</span><b>{option}</b><GripVertical size={15} /></li>)}
        </ol>
        <blockquote>“Mỗi vòng quay là một câu chuyện mới!”</blockquote>
        <button className="wheel-reset" type="button" disabled={spinning} onClick={() => { closeResult(); setRotation(0) }}><RotateCcw size={15} /> Làm mới kết quả</button>
      </aside>

      {winnerLabel && (
        <div className="wheel-result-modal" role="dialog" aria-modal="true" aria-labelledby="wheel-result-title">
          <div className="wheel-result-modal__panel">
            <Crown size={34} />
            <span>Kết quả vòng quay</span>
            <strong id="wheel-result-title">{winnerLabel}</strong>
            <div>
              <button className="wheel-result-modal__remove" type="button" onClick={removeWinnerFromWheel}><Trash2 size={17} /> Xóa ô này</button>
              <button className="wheel-result-modal__close" type="button" onClick={closeResult}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
