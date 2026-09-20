import { useState } from 'react'

const themes = ['arcade', 'casino', 'wheel', 'lottery'] as const
type ThemeName = (typeof themes)[number]

export function RandomConceptSection() {
  const [activeTheme, setActiveTheme] = useState<ThemeName>('arcade')

  return (
    <section className="concept section-pad" aria-labelledby="concept-title">
      <header className="section-heading section-heading--center" data-reveal>
        <p className="section-kicker">Same engine · New skin</p>
        <h2 id="concept-title">
          One random.
          <span>Many games.</span>
        </h2>
      </header>

      <div className={`concept-stage concept-stage--${activeTheme}`} data-reveal>
        <div className="concept-stage__orbit" aria-hidden="true" />
        {themes.map((theme) => (
          <button
            key={theme}
            className={`concept-theme concept-theme--${theme}`}
            type="button"
            onMouseEnter={() => setActiveTheme(theme)}
            onFocus={() => setActiveTheme(theme)}
            onClick={() => setActiveTheme(theme)}
            aria-pressed={activeTheme === theme}
          >
            <span>{theme}</span>
          </button>
        ))}

        <div className="concept-result">
          <span className="concept-result__label">Result locked</span>
          <strong>Team 12</strong>
          <i aria-hidden="true">→</i>
          <strong>Group F</strong>
          <small>{activeTheme} presentation</small>
        </div>
      </div>
    </section>
  )
}
