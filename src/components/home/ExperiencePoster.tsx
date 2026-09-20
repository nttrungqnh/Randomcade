import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type ExperienceId = 'arcade' | 'casino' | 'wheel' | 'lottery' | 'mystery'

interface ExperiencePosterProps {
  id: ExperienceId
  eyebrow: string
  title: string
  subtitle: string
  href: string
}

function ArcadeVisual() {
  return (
    <div className="arcade-machine" aria-hidden="true">
      <div className="arcade-machine__marquee">Randomcade</div>
      <div className="arcade-machine__screen">
        <span className="arcade-machine__scanline" />
        <b>Ready?</b>
        <small>Press to reveal</small>
      </div>
      <div className="arcade-machine__controls">
        <span className="arcade-machine__stick" />
        <span className="arcade-machine__button" />
      </div>
    </div>
  )
}

function CasinoVisual() {
  return (
    <div className="casino-table" aria-hidden="true">
      <span className="casino-light" />
      <div className="playing-card playing-card--back"><i /></div>
      <div className="playing-card playing-card--ace"><b>A</b><i /></div>
      <span className="casino-chip">RS</span>
    </div>
  )
}

function WheelVisual() {
  return (
    <div className="show-wheel" aria-hidden="true">
      <span className="show-wheel__pointer" />
      <div className="show-wheel__disc">
        <span>WIN</span>
      </div>
      <div className="show-wheel__lights">
        {Array.from({ length: 8 }).map((_, index) => <i key={index} />)}
      </div>
    </div>
  )
}

function LotteryVisual() {
  return (
    <div className="lottery-machine" aria-hidden="true">
      <div className="lottery-machine__glass">
        <span className="lottery-ball lottery-ball--one">7</span>
        <span className="lottery-ball lottery-ball--two">12</span>
        <span className="lottery-ball lottery-ball--three">24</span>
        <span className="lottery-ball lottery-ball--four">5</span>
      </div>
      <div className="lottery-machine__base">Live draw</div>
    </div>
  )
}

function MysteryVisual() {
  return (
    <div className="mystery-stage" aria-hidden="true">
      <span className="mystery-stage__beam" />
      <div className="mystery-box">
        <span className="mystery-box__lid" />
        <b>?</b>
      </div>
      <span className="mystery-stage__floor" />
    </div>
  )
}

const visuals: Record<ExperienceId, () => React.JSX.Element> = {
  arcade: ArcadeVisual,
  casino: CasinoVisual,
  wheel: WheelVisual,
  lottery: LotteryVisual,
  mystery: MysteryVisual,
}

export function ExperiencePoster({ id, eyebrow, title, subtitle, href }: ExperiencePosterProps) {
  const Visual = visuals[id]

  return (
    <article className={`experience-poster experience-poster--${id}`} data-reveal>
      <Link to={href} aria-label={`Explore ${title}`}>
        <div className="experience-poster__texture" aria-hidden="true" />
        <div className="experience-poster__meta">
          <span>{eyebrow}</span>
          <ArrowUpRight size={22} aria-hidden="true" />
        </div>
        <div className="experience-poster__visual">
          <Visual />
        </div>
        <div className="experience-poster__copy">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </Link>
    </article>
  )
}
