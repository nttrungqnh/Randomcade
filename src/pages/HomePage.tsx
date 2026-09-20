import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ExperienceGallery } from '../components/home/ExperienceGallery'
import { FinalCTA } from '../components/home/FinalCTA'
import { HomeHeader } from '../components/home/HomeHeader'
import { HowItWorks } from '../components/home/HowItWorks'
import { RandomConceptSection } from '../components/home/RandomConceptSection'

gsap.registerPlugin(ScrollTrigger)

export function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const page = pageRef.current

    if (!page) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: reduceMotion ? 12 : 48,
          duration: reduceMotion ? 0.35 : 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        })
      })
    }, page)

    return () => context.revert()
  }, [])

  return (
    <div id="top" ref={pageRef} className="home-page">
      <HomeHeader />
      <ExperienceGallery />
      <RandomConceptSection />
      <HowItWorks />
      <FinalCTA />
    </div>
  )
}
