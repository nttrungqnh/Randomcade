const steps = [
  ['01', 'Add your people'],
  ['02', 'Choose a show'],
  ['03', 'Hit random'],
  ['04', 'Watch it happen'],
] as const

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how section-pad" aria-labelledby="how-title">
      <header className="how__header" data-reveal>
        <p className="section-kicker">Insert names · Press start</p>
        <h2 id="how-title">How to play</h2>
      </header>

      <ol className="how__steps" data-reveal>
        {steps.map(([number, label]) => (
          <li key={number}>
            <span>{number}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}
