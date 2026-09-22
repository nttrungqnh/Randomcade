import type { Group, Team } from '../../../types/models'
import type { ArcadeVisualState } from '../animations/createArcadeDrawTimeline'
import { PixelCrown } from './ArcadePixelArt'
import { ArcadeTeamCard } from './ArcadeTeamCard'

function PixelLaurel({ side }: { side: 'left' | 'right' }) {
  return (
    <svg className={`arcade-result__laurel arcade-result__laurel--${side}`} viewBox="0 0 18 30" fill="currentColor" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M12 0h3v6h-3zM6 5h3v6H6zM9 8h3v6H9zM3 11h3v6H3zM6 15h3v6H6zM9 19h3v6H9zM12 23h3v4h-3zM15 26h3v4h-3zM0 15h3v6H0zM3 21h3v4H3zM6 25h6v3H6z" />
    </svg>
  )
}

export function ArcadeResultPanel({ visualState, team, teamNumber, group, complete }: { visualState: ArcadeVisualState; team?: Team; teamNumber?: number; group?: Group; complete: boolean }) {
  const revealTeam = team && ['idle', 'revealing', 'groupScanning', 'dealing', 'complete'].includes(visualState)
  const revealGroup = group && ['idle', 'dealing', 'complete'].includes(visualState)
  const finished = complete && visualState === 'complete'
  const isSelecting = ['starting', 'shuffling', 'slowing', 'locked'].includes(visualState)

  return (
    <aside className="arcade-result" aria-label="Đội vừa được chọn">
      <header className="arcade-result__title">
        <PixelCrown />
        <span>{isSelecting ? 'ĐANG LỰA CHỌN...' : 'ĐỘI VỪA ĐƯỢC CHỌN'}</span>
        <PixelCrown />
      </header>
      <div
        data-arcade-reveal
        className={`arcade-result__card ${revealTeam ? 'is-revealed' : ''}`}
        aria-label={revealTeam && teamNumber ? `Đội số ${teamNumber}` : undefined}
      >
        {revealTeam ? <ArcadeTeamCard team={team} /> : (
          <div className={`arcade-result__waiting ${isSelecting ? 'is-selecting' : ''}`}>
            <b>?</b>
            <strong>{isSelecting ? 'ĐANG LỰA CHỌN...' : 'AI SẼ ĐƯỢC CHỌN?'}</strong>
            <span>{visualState === 'idle' ? 'Bấm BỐC THĂM để bắt đầu' : isSelecting ? 'BĂNG CHUYỀN ĐANG QUAY...' : 'Hồi hộp chờ đón đội tiếp theo...'}</span>
          </div>
        )}
      </div>
      <div
        className={`arcade-result__group ${visualState === 'groupScanning' ? 'is-scanning' : ''} ${revealGroup ? 'is-locked' : ''}`}
        aria-live="polite"
      >
        <PixelLaurel side="left" />
        <div className="arcade-result__group-label">
          <strong>{revealGroup ? `BẢNG ${group.name}` : '—'}</strong>
          {!revealGroup && <span>ĐANG CHỜ KẾT QUẢ</span>}
        </div>
        <PixelLaurel side="right" />
      </div>
      {finished && <p className="arcade-result__complete" role="status">ĐÃ BỐC TẤT CẢ ĐỘI · CHÚC CÁC ĐỘI THI ĐẤU THẬT TỐT!</p>}
    </aside>
  )
}
