import { useMemo, useState } from 'react'
import { LockKeyhole, Plus, RotateCcw, Search, Sparkles } from 'lucide-react'
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
  onReset: () => void
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
  onReset,
  onRemoveTeam,
  onUpdateTeam,
  onUpdateParticipant,
}: PeopleStepProps) {
  const [search, setSearch] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team>()
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
    try {
      await onLoadDemo()
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <section className="wizard-step people-step" aria-labelledby="people-title">
      <header className="wizard-step__heading wizard-step__heading--row">
        <div>
          <p>02 / People</p>
          <h1 id="people-title">Who's in?</h1>
          <span>Add the teams that will enter the show.</span>
        </div>
        <div className="people-summary" aria-label={`${teams.length} teams, ${peopleCount} people`}>
          <strong>{teams.length}<small>Teams</small></strong>
          <strong>{peopleCount}<small>People</small></strong>
          <strong data-incomplete={readyCount < teams.length}>{readyCount}<small>Ready</small></strong>
        </div>
      </header>

      <div className="people-toolbar">
        <label>
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search teams</span>
          <input value={search} placeholder="Search teams…" onChange={(event) => setSearch(event.target.value)} />
        </label>
        <button type="button" onClick={() => setShowQuickAdd(true)}>Quick add</button>
        <button type="button" onClick={() => void loadDemo()} disabled={loadingDemo}><Sparkles size={15} /> {loadingDemo ? 'Loading photos…' : 'Load demo'}</button>
        <button className="people-reset-button" type="button" onClick={onReset} disabled={teams.length === 0}><RotateCcw size={15} /> Reset from start</button>
      </div>

      {teams.length === 0 ? (
        <div className="people-empty">
          <span><Plus size={28} /></span>
          <h2>No teams yet.</h2>
          <p>Start one at a time, or paste your whole lineup.</p>
          <div>
            <button type="button" onClick={onAddTeam}>Add first team</button>
            <button type="button" onClick={() => setShowQuickAdd(true)}>Quick add</button>
          </div>
        </div>
      ) : (
        <>
          {readyCount < teams.length && (
            <p className="people-validation" role="status">
              {readyCount} ready · {teams.length - readyCount} incomplete
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
          {filteredTeams.length === 0 && <p className="search-empty">No teams match “{search}”.</p>}
          <button className="add-team-button" type="button" onClick={onAddTeam}><Plus size={18} /> Add team</button>
        </>
      )}

      <p className="local-photo-note" title="Participant photos are processed and stored locally in your browser.">
        <LockKeyhole size={13} /> Photos stay on this device.
      </p>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} onAdd={onAddTeams} />}
      {teamToDelete && (
        <ConfirmModal
          title="Delete this team?"
          description="The team and its locally stored participant photos will be removed."
          confirmLabel="Delete team"
          danger
          onCancel={() => setTeamToDelete(undefined)}
          onConfirm={() => void removeTeam(teamToDelete)}
        />
      )}
    </section>
  )
}
