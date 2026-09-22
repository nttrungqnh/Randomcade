import type { ExperienceTheme } from '../../types/models'

interface ExperienceStepProps {
  selectedTheme: ExperienceTheme | null
  onSelect: (theme: ExperienceTheme) => void
  themeConfig: string
  onConfigChange: (value: string) => void
  screenName?: string
  lockedTheme?: boolean
}

const experiences = [
  { id: 'arcade', title: 'Tokyo Arcade', tagline: 'Insert. Shuffle. Reveal.', status: 'Available' },
  { id: 'casino', title: 'Casino Night', tagline: 'Let fate deal.', status: 'Coming soon' },
  { id: 'wheel', title: 'Lucky Wheel', tagline: 'Spin for the moment.', status: 'Available' },
  { id: 'lottery', title: 'Lottery Studio', tagline: 'Let the ball decide.', status: 'Coming soon' },
] as const

function ExperienceVisual({ theme }: { theme: ExperienceTheme }) {
  if (theme === 'arcade') {
    return (
      <div className="builder-arcade" aria-hidden="true">
        <span>Random Show</span>
        <div><b>Ready?</b><small>Press to reveal</small></div>
        <i /><em />
      </div>
    )
  }
  if (theme === 'casino') return <div className="builder-casino" aria-hidden="true"><i /><i /><span>RS</span></div>
  if (theme === 'wheel') return <div className="builder-wheel" aria-hidden="true"><i /></div>
  return <div className="builder-lottery" aria-hidden="true"><span>7</span><span>12</span><span>24</span></div>
}

export function ExperienceStep({ selectedTheme, onSelect, themeConfig, onConfigChange, screenName, lockedTheme }: ExperienceStepProps) {
  return (
    <section className="wizard-step experience-step" aria-labelledby="experience-title">
      <header className="wizard-step__heading">
        <p>04 / Experience</p>
        <h1 id="experience-title">{screenName ? `Tùy chỉnh ${screenName}` : <>Choose your<br />experience</>}</h1>
        <span>{screenName ? 'Màn chơi này có cấu hình riêng, không ảnh hưởng các trò khác.' : 'Mỗi màn chơi có cấu hình riêng.'}</span>
      </header>

      <div className="builder-experiences">
        {experiences.filter((experience) => !lockedTheme || experience.id === selectedTheme).map((experience) => {
          const available = experience.id === 'arcade' || experience.id === 'wheel'
          const selected = selectedTheme === experience.id
          return (
            <button
              key={experience.id}
              className={`builder-experience builder-experience--${experience.id}`}
              type="button"
              disabled={!available || lockedTheme}
              data-selected={selected}
              onClick={() => available && onSelect(experience.id)}
              aria-pressed={selected}
            >
              <span className="builder-experience__status">{experience.status}</span>
              <ExperienceVisual theme={experience.id} />
              <span className="builder-experience__copy">
                <strong>{experience.title}</strong>
                <small>{experience.tagline}</small>
              </span>
              {!available && selected && <em>Requested from Home · choose Arcade to continue</em>}
            </button>
          )
        })}
      </div>
      {selectedTheme && (
        <label className="setup-config-field experience-config-field">
          <span>Cấu hình màn chơi</span>
          <input
            type="text"
            value={themeConfig}
            maxLength={48}
            placeholder={selectedTheme === 'wheel' ? 'Ví dụ: Vòng quay may mắn' : 'Ví dụ: Bốc thăm giải đấu'}
            onChange={(event) => onConfigChange(event.target.value)}
          />
          <small>Thiết lập này chỉ dùng cho màn {selectedTheme === 'arcade' ? 'Arcade' : selectedTheme === 'wheel' ? 'Vòng quay' : selectedTheme}.</small>
        </label>
      )}
    </section>
  )
}
