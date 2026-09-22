import gsap from 'gsap'

export type ArcadeVisualState = 'idle' | 'starting' | 'shuffling' | 'slowing' | 'locked' | 'revealing' | 'groupScanning' | 'dealing' | 'complete'

export function createArcadeDrawTimeline({ root, groupId, reducedMotion, onState, onFinish }: { root: HTMLElement; groupId: string; reducedMotion: boolean; onState: (state: ArcadeVisualState) => void; onFinish: () => void }) {
  const machine = root.querySelector<HTMLElement>('[data-arcade-machine]')
  const conveyor = root.querySelector<HTMLElement>('[data-arcade-conveyor]')
  const track = root.querySelector<HTMLElement>('[data-arcade-track]')
  const selectedCard = root.querySelector<HTMLElement>('[data-selected-card="true"]')
  const reveal = root.querySelector<HTMLElement>('[data-arcade-reveal]')
  const scanner = root.querySelector<HTMLElement>('[data-arcade-scanner]')
  const target = root.querySelector<HTMLElement>(`[data-group-id="${groupId}"]`)
  const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-group-id]'))
  // Keep the high-speed shuffle on screen for ten seconds, then brake briefly to the winner.
  const duration = reducedMotion ? 0.18 : 1.75
  const fastSpinDuration = reducedMotion ? 0.18 : 10
  const slowSpinDuration = reducedMotion ? 0.12 : 2
  const timeline = gsap.timeline({ onComplete: onFinish })
  if (!machine || !conveyor || !track || !selectedCard || !reveal || !target) return timeline.call(onFinish)

  gsap.set(reveal, { autoAlpha: 0, x: 0, y: 0, scale: 0.84 })
  gsap.set(track, { x: 0 })
  const conveyorRect = conveyor.getBoundingClientRect()
  const selectedRect = selectedCard.getBoundingClientRect()
  const stopX = conveyorRect.left + conveyorRect.width / 2 - (selectedRect.left + selectedRect.width / 2)
  // Cover more of the track during the ten-second shuffle for a brisk, steady roll.
  const fastStopX = stopX * 0.92
  timeline.call(() => onState('starting')).to(machine, { y: 5, duration: 0.12 }).to(machine, { y: 0, duration: 0.12 })
  timeline.call(() => onState('shuffling')).to(track, { x: fastStopX, duration: fastSpinDuration, ease: 'none' })
  timeline.call(() => onState('slowing')).to(track, { x: stopX, duration: slowSpinDuration, ease: 'power4.out' })
  timeline.call(() => onState('locked')).to(scanner, { y: 16, duration: 0.18, ease: 'power2.in' }).to(selectedCard, { scale: 1.04, filter: 'brightness(1.8)', duration: 0.14 }).to(scanner, { y: 0, duration: 0.22, ease: 'power2.out' }).to(selectedCard, { filter: 'brightness(1)', duration: 0.16 }, '<')
  timeline.call(() => onState('revealing')).to(reveal, { autoAlpha: 1, scale: 1, duration: 0.48 * duration, ease: 'back.out(1.5)' })
  timeline.call(() => onState('groupScanning')).to(groups, { boxShadow: '0 0 22px rgba(96,239,255,.48)', duration: 0.1 * duration, stagger: 0.07 * duration, yoyo: true, repeat: reducedMotion ? 0 : 1 }).to(target, { boxShadow: '0 0 30px rgba(255,173,67,.72)', duration: 0.22 * duration, repeat: reducedMotion ? 0 : 2, yoyo: true })
  timeline.call(() => onState('dealing')).to(reveal, { scale: 1.04, duration: 0.18 * duration, ease: 'power2.out' }).to(reveal, { scale: 1, duration: 0.22 * duration, ease: 'power2.inOut' })
  return timeline
}
