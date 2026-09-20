import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function HomeHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="home-header" data-scrolled={isScrolled}>
      <a className="home-logo" href="#top" aria-label="RANDOMCADE home">
        <span>RANDOM</span>
        <strong>CADE</strong>
      </a>

      <nav className="home-nav" aria-label="Main navigation">
        <a href="#experiences">Game Modes</a>
        <a href="#how-it-works">How To Play</a>
        <a href="#my-shows">My Arcade</a>
      </nav>

      <Link className="header-cta" to="/create">
        Start Game
      </Link>
    </header>
  )
}
