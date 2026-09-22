import type { Team } from '../../types/models'
import { useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { calculateGroupCapacities, getGroupName } from '../../utils/groupSetup'

interface SetupStepProps {
  teams: Team[]
  groupCount: number
  onGroupCountChange: (count: number) => void
  screenName?: string
}

export function SetupStep({ teams, groupCount, onGroupCountChange, screenName }: SetupStepProps) {
  const teamCount = teams.length
  const maxGroupCount = Math.max(2, teamCount)
  const safeGroupCount = Math.min(Math.max(2, groupCount), maxGroupCount)
  const capacities = calculateGroupCapacities(teamCount, safeGroupCount)
  const minPerGroup = capacities.length > 0 ? Math.min(...capacities) : 0
  const maxPerGroup = capacities.length > 0 ? Math.max(...capacities) : 0
  const exact = minPerGroup === maxPerGroup

  useEffect(() => {
    if (groupCount !== safeGroupCount) onGroupCountChange(safeGroupCount)
  }, [groupCount, onGroupCountChange, safeGroupCount])

  const updateGroupCount = (nextCount: number) => {
    const next = Math.min(maxGroupCount, Math.max(2, Math.floor(nextCount)))
    if (Number.isFinite(next)) onGroupCountChange(next)
  }

  return (
    <section className="wizard-step setup-step" aria-labelledby="setup-title">
      <header className="wizard-step__heading">
        <p>03 / Setup</p>
        <h1 id="setup-title">{screenName ? `Cấu hình ${screenName}` : 'Set the rules'}</h1>
        <span>{screenName ? `Thiết lập cách ${screenName} chia đội và bốc thăm.` : 'Choose how your teams will be arranged.'}</span>
      </header>

      <div className="setup-layout">
        <div className="setup-controls">
          <p>Divide into groups</p>
          <fieldset>
            <legend>Number of groups</legend>
            <div className="group-count-control">
              <button
                type="button"
                aria-label="Decrease number of groups"
                disabled={safeGroupCount <= 2}
                onClick={() => updateGroupCount(safeGroupCount - 1)}
              >
                <Minus size={17} />
              </button>
              <label>
                <input
                  type="number"
                  min={2}
                  max={maxGroupCount}
                  value={safeGroupCount}
                  aria-label="Number of groups"
                  onChange={(event) => updateGroupCount(Number(event.target.value))}
                />
                <span>Groups</span>
              </label>
              <button
                type="button"
                aria-label="Increase number of groups"
                disabled={safeGroupCount >= maxGroupCount}
                onClick={() => updateGroupCount(safeGroupCount + 1)}
              >
                <Plus size={17} />
              </button>
            </div>
          </fieldset>

          <div className="setup-equation" aria-label={`${teamCount} teams into ${safeGroupCount} groups`}>
            <strong>{teamCount}<small>Teams</small></strong>
            <i aria-hidden="true">→</i>
            <strong>{safeGroupCount}<small>Groups</small></strong>
            <i aria-hidden="true">→</i>
            <strong>{exact ? minPerGroup : `${minPerGroup}–${maxPerGroup}`}<small>Per group</small></strong>
          </div>
          {!exact && <p className="balance-note">Groups will contain {minPerGroup}–{maxPerGroup} teams.</p>}
        </div>

        <div className="group-preview">
          <header><span>Group preview</span><small>Configuration only</small></header>
          <div>
            {capacities.map((capacity, index) => {
              const name = getGroupName(index)
              return (
                <article key={name}>
                  <strong>{name}</strong>
                  <span>0 / {capacity}</span>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
