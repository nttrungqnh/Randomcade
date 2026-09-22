import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShowSession } from '../types/models'

export const MAX_WHEEL_OPTIONS = 32

export const parseWheelOptions = (text: string): string[] =>
  text.split(/\r?\n/).map((option) => option.trim()).filter(Boolean)

function getLegacyWheelOptions(): string {
  try {
    const saved = localStorage.getItem('randomshow-session')
    if (!saved) return ''
    const session = (JSON.parse(saved) as { state?: { session?: ShowSession } }).state?.session
    if (session?.selectedTheme !== 'wheel' || !Array.isArray(session.teams)) return ''
    return session.teams.map((team) => team.name?.trim()
      || team.participants.map((person) => person.name.trim()).filter(Boolean).join(' × '))
      .filter(Boolean).join('\n')
  } catch {
    return ''
  }
}

interface WheelConfigState {
  optionsText: string
  soundOn: boolean
  selectedSound: 'retro' | 'lottery'
  setOptionsText: (optionsText: string) => void
  setSoundOn: (soundOn: boolean) => void
  setSelectedSound: (selectedSound: 'retro' | 'lottery') => void
}

export const useWheelConfigStore = create<WheelConfigState>()(
  persist(
    (set) => ({
      optionsText: getLegacyWheelOptions(),
      soundOn: true,
      selectedSound: 'retro',
      setOptionsText: (optionsText) => set({ optionsText }),
      setSoundOn: (soundOn) => set({ soundOn }),
      setSelectedSound: (selectedSound) => set({ selectedSound }),
    }),
    {
      name: 'randomshow-wheel-config',
      version: 1,
      partialize: ({ optionsText, soundOn, selectedSound }) => ({ optionsText, soundOn, selectedSound }),
    },
  ),
)
