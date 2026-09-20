import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FinalCTA() {
  return (
    <section id="my-shows" className="final-cta section-pad" aria-labelledby="final-title">
      <div className="final-cta__shape final-cta__shape--card" aria-hidden="true" />
      <div className="final-cta__shape final-cta__shape--ball" aria-hidden="true">8</div>
      <div className="final-cta__shape final-cta__shape--ring" aria-hidden="true" />
      <div className="final-cta__content" data-reveal>
        <p className="section-kicker">Continue?</p>
        <h2 id="final-title">
          Turn random into
          <span>an arcade moment.</span>
        </h2>
        <Link className="button button--primary button--large" to="/create">
          Start game <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
      <footer className="site-footer">
        <a className="home-logo" href="#top" aria-label="RANDOMCADE home">
          <span>RANDOM</span><strong>CADE</strong>
        </a>
        <p>Press start. Make it epic.</p>
        <span>© {new Date().getFullYear()} RANDOMCADE</span>
      </footer>
    </section>
  )
}
