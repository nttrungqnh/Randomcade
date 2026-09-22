import { Undo2 } from 'lucide-react'
import pushSoundUrl from '../../../assets/sounds/push.mp3'
import type { Team } from '../../../types/models'
import { CardConveyor } from './CardConveyor'
import { PixelBall, PixelCrown } from './ArcadePixelArt'

const statusByState: Record<string, string> = {
  idle: 'SẴN SÀNG BỐC THĂM', starting: 'BẮT ĐẦU!', shuffling: 'ĐANG CHỌN ĐỘI...',
  slowing: 'SẮP CÓ KẾT QUẢ...', locked: 'ĐÃ CHỌN ĐỘI!', revealing: 'ĐỘI ĐƯỢC CHỌN',
  groupScanning: 'ĐANG CHỌN BẢNG...', dealing: 'ĐÃ VÀO BẢNG!', complete: 'HOÀN TẤT BỐC THĂM',
}

interface ArcadeMachineProps {
  visualState: string
  teams: Team[]
  selectedTeam?: Team
  onPush: () => void
  onUndo: () => void
  soundEnabled: boolean
  disabled: boolean
  historyDisabled: boolean
}

export function ArcadeMachine({ visualState, teams, selectedTeam, onPush, onUndo, soundEnabled, disabled, historyDisabled }: ArcadeMachineProps) {
  const isDrawing = !['idle', 'complete'].includes(visualState)
  const push = () => {
    if (disabled) return
    if (soundEnabled) {
      const audio = new Audio(pushSoundUrl)
      audio.volume = .7
      void audio.play().catch(() => undefined)
    }
    onPush()
  }
  return <section className={`arcade-machine arcade-machine--${visualState} pixel-frame`} data-arcade-machine aria-label="Khu vực bốc thăm">
    <header className="arcade-machine-heading">
      <div className="arcade-machine-heading__title"><h1><span aria-hidden="true">»</span> CHỌN ĐỘI</h1><p>CHỌN CẶP VẬN ĐỘNG VIÊN ĐỂ BỐC THĂM</p></div>
      <div className="arcade-pool-count"><strong>{teams.length} ĐỘI</strong><span>{teams.reduce((total, team) => total + team.participants.length, 0)} VĐV</span></div>
      <div className="arcade-community" aria-hidden="true"><PixelBall /><small>PICKLEBALL<br />COMMUNITY</small></div>
    </header>
    <div className="arcade-machine__screen">
      {visualState === 'complete' ? <div className="arcade-finish"><PixelCrown /><strong>HOÀN TẤT BỐC THĂM!</strong><span>CÁC ĐỘI ĐÃ SẴN SÀNG · HẸN GẶP TRÊN SÂN</span></div> : <CardConveyor teams={teams} selectedTeam={isDrawing ? selectedTeam : undefined} />}
      <div className="arcade-scanner" data-arcade-scanner aria-hidden="true" />
    </div>
    <div className="arcade-control-deck pixel-frame">
      <div className="arcade-deck-actions">
        
        <div className="arcade-control"><button className="arcade-mini-button arcade-mini-button--undo pixel-frame" onClick={onUndo} disabled={historyDisabled} aria-label="Hoàn tác lượt bốc" title="Hoàn tác (U)"><Undo2 /></button><span>HOÀN TÁC<br />LỰA CHỌN</span></div>
      </div>
      <div className="arcade-console-mark pixel-frame" role="status"><span aria-hidden="true">»</span><div><b>{statusByState[visualState]}</b><small>{disabled ? (visualState === 'complete' ? 'CHÚC CÁC ĐỘI THI ĐẤU THẬT TỐT!' : 'MAY MẮN SẼ GỌI TÊN AI?') : 'NHẤN SPACE ĐỂ BẮT ĐẦU'}</small></div><span aria-hidden="true">«</span></div>
      <div className="arcade-push-housing"><button className="arcade-push pixel-frame" onClick={push} disabled={disabled} aria-label="Bốc thăm"><span aria-hidden="true">»</span><b>BỐC THĂM</b><PixelBall /></button></div>
    </div>
  </section>
}
