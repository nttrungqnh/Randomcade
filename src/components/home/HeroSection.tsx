import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroRandomDemo } from './HeroRandomDemo'

export function HeroSection() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="stage-object stage-card" data-parallax="0.09" aria-hidden="true">
        <span className="stage-card__mark">A</span>
        <span className="stage-card__pip" />
      </div>
      <div className="stage-object stage-ball" data-parallax="0.16" aria-hidden="true">
        <span>12</span>
      </div>
      <div className="stage-object stage-wheel" data-parallax="0.06" aria-hidden="true">
        <span />
      </div>
      <div className="stage-object stage-cube" data-parallax="0.13" aria-hidden="true">
        <i />
      </div>
      <div className="stage-object stage-token" data-parallax="0.2" aria-hidden="true">
        <span>R</span>
      </div>

      <div className="hero__content">
        <p className="hero__eyebrow">A new way to reveal the result</p>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__title-line hero__title-line--small">Make random</span>
          <span className="hero__title-line hero__title-line--large">A show.</span>
        </h1>
        <p className="hero__subtitle">
          Turn simple random picks into moments worth watching.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" to="/create">
            Start a show <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <a className="button button--ghost" href="#experiences">
            Explore experiences <ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
      </div>

      <HeroRandomDemo />
      <div className="hero__stage-floor" aria-hidden="true" />
    </section>
  )
}
