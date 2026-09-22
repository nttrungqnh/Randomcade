import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Dice5, LayoutGrid, RotateCcw, ShieldCheck, Users } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ConfirmModal } from '../components/create/ConfirmModal'
import { PeopleStep } from '../components/create/PeopleStep'
import { WheelSetup } from '../components/create/WheelSetup'
import { useShowBuilderStore } from '../stores/showBuilderStore'
import { useShowSessionStore } from '../stores/showSessionStore'
import { calculateGroupCapacities, getGroupName } from '../utils/groupSetup'
import '../create.css'

function TeamDrawSetup() {
  const navigate = useNavigate()
  const store = useShowBuilderStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmStart, setConfirmStart] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const readyCount = store.teams.filter((team) =>
    team.participants.length === 2 && team.participants.every((person) => person.name.trim()),
  ).length
  const peopleCount = store.teams.reduce((count, team) => count + team.participants.length, 0)
  const validGroups = Number.isInteger(store.groupCount) && store.groupCount >= 2 && store.groupCount <= store.teams.length
  const capacities = validGroups ? calculateGroupCapacities(store.teams.length, store.groupCount) : []
  const missing: string[] = []
  if (!store.hostName.trim()) missing.push('Nhập tên của bạn.')
  if (!store.tournamentName.trim()) missing.push('Nhập tên giải.')
  if (store.teams.length < 2) missing.push('Thêm ít nhất 2 đội để bốc thăm.')
  if (readyCount < store.teams.length) missing.push('Điền đủ tên hai thành viên của mỗi đội.')
  if (store.teams.length >= 2 && !validGroups) missing.push(`Chọn số bảng nguyên từ 2 đến ${store.teams.length}.`)
  const canStart = missing.length === 0 && !loadingDemo

  const start = () => {
    if (!canStart) return
    useShowSessionStore.getState().startSession(
      store.teams, store.groupCount, 'arcade', store.tournamentName, store.hostName,
    )
    if (useShowSessionStore.getState().session) navigate('/show/arcade')
  }

  const requestStart = () => {
    if (!canStart) return
    const current = useShowSessionStore.getState().session
    if (current?.drawHistory.length) setConfirmStart(true)
    else start()
  }

  return (
    <>
      <div className="config-layout">
        <div className="config-content">
          <section className="config-panel" aria-labelledby="event-details-title">
            <div className="config-panel-heading">
              <span className="config-section-icon"><Users size={19} /></span>
              <div><h2 id="event-details-title">Thông tin giải đấu</h2><p>Thông tin sẽ xuất hiện trên màn hình bốc thăm.</p></div>
            </div>
            <div className="config-fields">
              <label className="config-field">
                <span>Tên của bạn <span aria-hidden="true">*</span></span>
                <input required autoComplete="name" value={store.hostName} maxLength={40}
                  placeholder="Nhập tên người tổ chức" onChange={(event) => store.setHostName(event.target.value)} />
              </label>
              <label className="config-field">
                <span>Tên giải <span aria-hidden="true">*</span></span>
                <input required value={store.tournamentName} maxLength={48}
                  placeholder="Ví dụ: Giải Pickleball giao hữu" onChange={(event) => store.setTournamentName(event.target.value)} />
              </label>
            </div>
          </section>
          <PeopleStep
            teams={store.teams} onAddTeam={store.addTeam} onAddTeams={store.addTeams}
            onLoadDemo={store.loadDemo} onBusyChange={setLoadingDemo}
            onRemoveTeam={store.removeTeam} onUpdateTeam={store.updateTeam}
            onUpdateParticipant={store.updateParticipant}
          />
        </div>
        <aside className="config-sidebar" aria-label="Thiết lập chia bảng">
          <section className="config-panel">
            <div className="config-panel-heading">
              <span className="config-section-icon"><LayoutGrid size={19} /></span>
              <div><h2>Chia bảng</h2><p>Các đội được chia đều vào mỗi bảng.</p></div>
            </div>
            <label className="config-field">
              <span>Số bảng</span>
              <input type="number" min={2} max={Math.max(2, store.teams.length)} step={1}
                value={Number.isFinite(store.groupCount) ? store.groupCount : ''}
                aria-describedby="group-count-hint"
                onChange={(event) => store.setGroupCount(event.target.value === '' ? 0 : Number(event.target.value))} />
              <small id="group-count-hint">Từ 2 bảng, không vượt quá số đội tham gia.</small>
            </label>
            {capacities.length > 0 ? (
              <div className="config-groups" aria-label="Dự kiến số đội mỗi bảng">
                {capacities.map((capacity, index) => (
                  <div key={index}><span>Bảng {getGroupName(index)}</span><b>{capacity} đội</b></div>
                ))}
              </div>
            ) : <p className="config-placeholder">Thêm đội và chọn số bảng để xem phân bổ.</p>}
            {capacities.length > 0 && <p className="config-note">Số đội giữa các bảng chênh lệch tối đa 1 đội.</p>}
          </section>
          <section className="config-panel config-launch">
            <h2>Sẵn sàng bốc thăm?</h2>
            <dl className="config-summary">
              <div><dt>Đội tham gia</dt><dd>{store.teams.length}</dd></div>
              <div><dt>Thành viên</dt><dd>{peopleCount}</dd></div>
              <div><dt>Đội đủ thông tin</dt><dd>{readyCount}/{store.teams.length}</dd></div>
            </dl>
            {missing.length > 0 && <ul className="config-checklist" id="team-draw-requirements">
              {missing.map((message) => <li key={message}>{message}</li>)}
            </ul>}
            <button type="button" className="config-button config-button--primary config-start"
              disabled={!canStart} aria-describedby={missing.length ? 'team-draw-requirements' : undefined}
              onClick={requestStart}>
              {loadingDemo ? 'Đang tải ảnh mẫu…' : 'Bắt đầu bốc thăm'} <ArrowRight size={17} />
            </button>
            <p className="config-note config-note--center">Vào thẳng màn Team Draw sau khi thiết lập.</p>
          </section>
          <p className="config-private"><ShieldCheck size={16} /> Danh sách và ảnh chỉ lưu trên thiết bị này.</p>
          <button type="button" className="config-reset" disabled={loadingDemo}
            onClick={() => setConfirmReset(true)}><RotateCcw size={14} /> Làm lại cấu hình</button>
        </aside>
      </div>
      {confirmReset && <ConfirmModal title="Làm lại cấu hình Team Draw?"
        description="Xóa thông tin giải và danh sách đội trong bản cấu hình này. Kết quả bốc thăm đang có vẫn được giữ."
        confirmLabel="Làm lại" danger onCancel={() => setConfirmReset(false)}
        onConfirm={() => { store.resetBuilder(); setConfirmReset(false) }} />}
      {confirmStart && <ConfirmModal title="Bắt đầu lượt bốc thăm mới?"
        description="Lượt mới sẽ thay thế kết quả bốc thăm hiện tại."
        confirmLabel="Bắt đầu lượt mới" onCancel={() => setConfirmStart(false)}
        onConfirm={() => { setConfirmStart(false); start() }} />}
    </>
  )
}

export function CreateShowPage() {
  const [searchParams] = useSearchParams()
  const isWheel = searchParams.get('screen') === 'lucky-wheel' || searchParams.get('theme') === 'wheel'
  const title = isWheel ? 'Lucky Wheel' : 'Team Draw'
  return (
    <div className="config-page">
      <header className="config-header">
        <div className="config-container config-header-inner">
          <Link className="config-brand" to="/" aria-label="Randomcade — Trang chủ">
            <span><Dice5 size={22} /></span> Randomcade
          </Link>
          <div className="config-save"><Check size={15} /> Tự động lưu</div>
        </div>
      </header>
      <div className="config-container config-page-content">
        <Link className="config-back" to="/"><ArrowLeft size={16} /> Trang chủ</Link>
        <div className="config-page-heading">
          <div><h1>Cấu hình {title}</h1><p>{isWheel
            ? 'Thêm các lựa chọn của bạn, rồi để vòng quay quyết định.'
            : 'Thêm đội, chọn số bảng và bắt đầu. Chỉ cần một trang.'}</p></div>
          <span className="config-mode-label">{isWheel ? 'Vòng quay may mắn' : 'Bốc thăm chia bảng'}</span>
        </div>
        {isWheel ? <WheelSetup /> : <TeamDrawSetup />}
        <footer className="config-footer">Randomcade · Đơn giản, ngẫu nhiên, thật vui.</footer>
      </div>
    </div>
  )
}
