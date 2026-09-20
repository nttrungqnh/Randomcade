import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { ExperiencePoster } from './ExperiencePoster'

const experiences = [
  {
    id: 'arcade',
    eyebrow: 'Stage 01 / Featured',
    title: 'Tokyo Arcade',
    subtitle: 'Insert. Shuffle. Reveal.',
    href: '/create?theme=arcade',
  },
  {
    id: 'casino',
    eyebrow: 'Stage 02 / After dark',
    title: 'Casino Night',
    subtitle: 'Shuffle the deck. Let fate deal.',
    href: '/create?theme=casino',
  },
  {
    id: 'wheel',
    eyebrow: 'Stage 03 / Studio classic',
    title: 'Lucky Wheel',
    subtitle: 'Spin for the moment.',
    href: '/create?theme=wheel',
  },
  {
    id: 'lottery',
    eyebrow: 'Stage 04 / Live draw',
    title: 'Lottery Studio',
    subtitle: 'Let the ball decide.',
    href: '/create?theme=lottery',
  },
  {
    id: 'mystery',
    eyebrow: 'Stage 05 / Mystery',
    title: 'Mystery Box',
    subtitle: "Nobody knows what's inside.",
    href: '/create?theme=mystery',
  },
] as const

export function ExperienceGallery() {
  const trackRef = useRef<HTMLDivElement>(null)

  const showNextExperience = () => {
    const track = trackRef.current
    const firstCard = track?.firstElementChild as HTMLElement | null
    if (!track || !firstCard) return

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
    const step = firstCard.getBoundingClientRect().width + gap
    const maxScroll = track.scrollWidth - track.clientWidth
    const atEnd = track.scrollLeft >= maxScroll - 4

    track.scrollTo({
      left: atEnd ? 0 : Math.min(track.scrollLeft + step, maxScroll),
      behavior: 'smooth',
    })
  }

  return (
    <section id="experiences" className="experiences section-pad" aria-labelledby="experiences-title">
      <header className="section-heading" data-reveal>
        <p className="section-kicker">Player 1 · Select mode</p>
        <h2 id="experiences-title">
          Choose your
          <span>game</span>
        </h2>
        <p className="section-heading__aside">One random engine.<br />Many pixel worlds.</p>
      </header>

      <div className="experience-carousel">
        <div ref={trackRef} className="experience-track" aria-label="RANDOMCADE game modes">
          {experiences.map((experience) => (
            <ExperiencePoster key={experience.id} {...experience} />
          ))}
        </div>
        <button className="experience-next" type="button" onClick={showNextExperience} aria-label="Show next experience">
          <span>Next Stage</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
