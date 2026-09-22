import { useMemo, useState } from 'react'
import { LockKeyhole, Plus, Search, Sparkles, Users } from 'lucide-react'
import type { Participant, Team } from '../../types/models'
import { deleteParticipantImage } from '../../services/localDatabase'
import { ConfirmModal } from './ConfirmModal'
import { QuickAddModal } from './QuickAddModal'
import { TeamCard } from './TeamCard'

interface PeopleStepProps {
  teams: Team[]
  onAddTeam: () => void
  onAddTeams: (teams: Array<[string, string]>) => void
  onLoadDemo: () => void | Promise<void>
  onBusyChange: (busy: boolean) => void
  onRemoveTeam: (teamId: string) => void
  onUpdateTeam: (teamId: string, updates: Pick<Team, 'name'>) => void
  onUpdateParticipant: (
    teamId: string,
    participantId: string,
    updates: Partial<Pick<Participant, 'name' | 'imageId'>>,
  ) => void
}

export function PeopleStep({
  teams,
  onAddTeam,
  onAddTeams,
  onLoadDemo,
  onBusyChange,
  onRemoveTeam,
  onUpdateTeam,
  onUpdateParticipant,
}: PeopleStepProps) {
  const [search, setSearch] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team>()
  const [confirmDemo, setConfirmDemo] = useState(false)
  const readyCount = teams.filter((team) => team.participants.every((participant) => participant.name.trim())).length
  const peopleCount = teams.reduce((count, team) => count + team.participants.length, 0)
  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return teams
    return teams.filter((team) => [team.name, ...team.participants.map((participant) => participant.name)]
      .some((value) => value?.toLowerCase().includes(query)))
  }, [search, teams])

  const removeTeam = async (team: Team) => {
    await Promise.all(team.participants.map((participant) => deleteParticipantImage(participant.id)))
    onRemoveTeam(team.id)
    setTeamToDelete(undefined)
  }

  const requestRemove = (team: Team) => {
    const hasData = Boolean(team.name?.trim()) || team.participants.some((participant) => participant.name.trim() || participant.imageId)
    if (hasData) setTeamToDelete(team)
    else void removeTeam(team)
  }

  const loadDemo = async () => {
    if (loadingDemo) return
    setLoadingDemo(true)
    onBusyChange(true)
    try {
      await onLoadDemo()
    } finally {
      setLoadingDemo(false)
      onBusyChange(false)
    }
  }

  return (
    <section className="config-panel people-step" aria-labelledby="people-title">
      <header className="config-panel-heading">
        <span className="config-section-icon"><Users size={19} /></span>
        <div><h2 id="people-title">Danh sách đội <span className="config-count">{teams.length}</span></h2>
          <p>Mỗi đội gồm 2 thành viên. Ảnh đại diện không bắt buộc.</p></div>
        <span className="people-total">{peopleCount} thành viên</span>
      </header>

      <div className="people-toolbar">
        <label>
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Tìm đội hoặc thành viên</span>
          <input value={search} placeholder="Tìm đội hoặc thành viên…" onChange={(event) => setSearch(event.target.value)} />
        </label>
        <button type="button" className="config-button" onClick={() => setShowQuickAdd(true)} disabled={loadingDemo}><Plus size={15} /> Nhập nhanh</button>
        <button type="button" className="config-button" onClick={() => teams.length ? setConfirmDemo(true) : void loadDemo()} disabled={loadingDemo}><Sparkles size={15} /> {loadingDemo ? 'Đang tải…' : 'Dữ liệu mẫu'}</button>
      </div>

      {teams.length === 0 ? (
        <div className="people-empty">
          <span><Plus size={28} /></span>
          <h3>Thêm đội đầu tiên của bạn</h3>
          <p>Nhập từng đội hoặc dán danh sách để thêm nhiều đội cùng lúc.</p>
          <div>
            <button type="button" className="config-button config-button--primary" onClick={onAddTeam}><Plus size={16} /> Thêm đội</button>
          </div>
        </div>
      ) : (
        <>
          {readyCount < teams.length && (
            <p className="people-validation" role="status">
              Còn {teams.length - readyCount} đội chưa điền đủ tên thành viên.
            </p>
          )}
          <div className="team-list">
            {filteredTeams.map((team) => {
              const index = teams.findIndex((candidate) => candidate.id === team.id)
              return (
                <TeamCard
                  key={team.id}
                  team={team}
                  index={index}
                  onUpdateTeam={(updates) => onUpdateTeam(team.id, updates)}
                  onUpdateParticipant={(participantId, updates) => onUpdateParticipant(team.id, participantId, updates)}
                  onRemove={() => requestRemove(team)}
                />
              )
            })}
          </div>
          {filteredTeams.length === 0 && <p className="search-empty">Không tìm thấy đội nào với “{search}”.</p>}
          <button className="add-team-button" type="button" onClick={onAddTeam}><Plus size={17} /> Thêm đội</button>
        </>
      )}

      <p className="local-photo-note">
        <LockKeyhole size={13} /> Ảnh của bạn được lưu riêng trên thiết bị này.
      </p>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} onAdd={onAddTeams} />}
      {confirmDemo && <ConfirmModal title="Dùng danh sách mẫu?"
        description="32 đội mẫu sẽ thay thế danh sách đội hiện tại trong cấu hình."
        confirmLabel="Dùng dữ liệu mẫu" onCancel={() => setConfirmDemo(false)}
        onConfirm={() => { setConfirmDemo(false); void loadDemo() }} />}
      {teamToDelete && (
        <ConfirmModal
          title="Xóa đội này?"
          description="Đội và ảnh thành viên đã lưu sẽ được xóa khỏi danh sách."
          confirmLabel="Xóa đội"
          danger
          onCancel={() => setTeamToDelete(undefined)}
          onConfirm={() => void removeTeam(teamToDelete)}
        />
      )}
    </section>
  )
}
