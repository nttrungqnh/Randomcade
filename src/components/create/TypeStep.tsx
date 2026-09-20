import { Hash, List, Sparkles, UsersRound } from 'lucide-react'
import type { RandomType } from '../../types/models'

interface TypeStepProps {
  selected: RandomType | null
  onSelect: (type: RandomType) => void
}

const options = [
  { id: 'individuals', label: 'Individuals', text: 'Random individual people.', icon: UsersRound },
  { id: 'teams', label: 'Teams', text: 'Random teams or divide teams into groups.', icon: Sparkles },
  { id: 'numbers', label: 'Numbers', text: 'Random numbers.', icon: Hash },
  { id: 'custom', label: 'Custom list', text: 'Anything you want.', icon: List },
] as const

export function TypeStep({ selected, onSelect }: TypeStepProps) {
  return (
    <section className="wizard-step type-step" aria-labelledby="type-title">
      <header className="wizard-step__heading">
        <p>01 / Type</p>
        <h1 id="type-title">What are we<br />randomizing?</h1>
        <span>Choose what goes into your show.</span>
      </header>

      <div className="type-grid">
        {options.map(({ id, label, text, icon: Icon }) => {
          const available = id === 'teams'
          return (
            <button
              key={id}
              className="type-card"
              type="button"
              disabled={!available}
              data-selected={available && selected === 'teams'}
              onClick={() => available && onSelect('teams')}
            >
              <span className="type-card__visual" aria-hidden="true">
                <Icon size={34} strokeWidth={1.5} />
                {id === 'teams' && <i><b /><b /><b /><b /></i>}
              </span>
              <span className="type-card__copy">
                <strong>{label}</strong>
                <small>{text}</small>
              </span>
              <em>{available ? 'Active' : 'Coming soon'}</em>
            </button>
          )
        })}
      </div>
    </section>
  )
}
