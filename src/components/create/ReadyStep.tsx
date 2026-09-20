import { Play } from 'lucide-react'
import type { ExperienceTheme, Team } from '../../types/models'
import { useParticipantImage } from '../../hooks/useParticipantImage'

interface ReadyStepProps {
  teams: Team[]
  groupCount: number
  selectedTheme: ExperienceTheme | null
  onStart: () => void
}

function ReadyAvatar({ participantId, imageId, name }: { participantId: string; imageId?: string; name: string }) {
  const { imageUrl } = useParticipantImage(imageId ? participantId : undefined)
  const nameParts = name.trim().split(/\s+/)
  const lastPart = nameParts.at(-1) ?? ''
  const initials = nameParts.length > 1 && /^\d+$/.test(lastPart)
    ? `${nameParts[0][0]}${Number(lastPart) % 10}`
    : nameParts.map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return imageUrl ? <img src={imageUrl} alt={name} /> : <span aria-label={name}>{initials}</span>
}

export function ReadyStep({ teams, groupCount, selectedTheme, onStart }: ReadyStepProps) {
  const peopleCount = teams.reduce((count, team) => count + team.participants.length, 0)
  const perGroup = teams.length / groupCount
  const avatars = teams.flatMap((team) => team.participants).slice(0, 8)
  const experienceName = selectedTheme === 'arcade' ? 'Tokyo Arcade' : selectedTheme === 'wheel' ? 'Lucky Wheel' : selectedTheme
  const experienceTagline = selectedTheme === 'wheel' ? 'Spin. Pick. Be lucky.' : 'Insert. Shuffle. Reveal.'

  return (
    <section className="wizard-step ready-step" aria-labelledby="ready-title">
      <header className="wizard-step__heading wizard-step__heading--center">
        <p>05 / Ready</p>
        <h1 id="ready-title">Ready<br />to show?</h1>
        <span>Your stage is set. The reveal comes next.</span>
      </header>

      <div className="ready-board">
        <div className="ready-board__lights" aria-hidden="true" />
        <div className="ready-stats">
          <strong>{teams.length}<small>Teams</small></strong>
          <strong>{peopleCount}<small>People</small></strong>
          <strong>{groupCount}<small>Groups</small></strong>
          <strong>{Number.isInteger(perGroup) ? perGroup : `${Math.floor(perGroup)}–${Math.ceil(perGroup)}`}<small>Teams / group</small></strong>
        </div>
        <div className="ready-experience">
          <span>Experience</span>
          <strong>{experienceName}</strong>
          <small>{experienceTagline}</small>
        </div>
        <div className="ready-avatars" aria-label="Participant preview">
          {avatars.map((participant) => (
            <ReadyAvatar key={participant.id} participantId={participant.id} imageId={participant.imageId} name={participant.name} />
          ))}
          {peopleCount > avatars.length && <i>+{peopleCount - avatars.length}</i>}
        </div>
      </div>

      <button className="start-show-button" type="button" onClick={onStart}>
        <Play size={21} fill="currentColor" /> Start the show
      </button>
    </section>
  )
}
