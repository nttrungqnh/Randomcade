import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { downloadDemoParticipantImages } from '../services/demoImageLoader'
import type { ExperienceTheme, Participant, RandomType, Team } from '../types/models'

const createId = () => crypto.randomUUID()

const createParticipant = (name = ''): Participant => ({
  id: createId(),
  name,
})

const createTeam = (names: [string, string] = ['', '']): Team => ({
  id: createId(),
  participants: [createParticipant(names[0]), createParticipant(names[1])],
})

interface ShowBuilderState {
  showName: string
  showConfig: string
  randomType: RandomType | null
  teams: Team[]
  groupCount: number
  selectedTheme: ExperienceTheme | null
  currentStep: number
  setRandomType: (randomType: RandomType) => void
  addTeam: () => void
  addTeams: (teams: Array<[string, string]>) => void
  removeTeam: (teamId: string) => void
  updateTeam: (teamId: string, updates: Pick<Team, 'name'>) => void
  updateParticipant: (
    teamId: string,
    participantId: string,
    updates: Partial<Pick<Participant, 'name' | 'imageId'>>,
  ) => void
  loadDemo: () => Promise<void>
  setGroupCount: (count: number) => void
  setShowConfig: (showConfig: string) => void
  setTheme: (theme: ExperienceTheme) => void
  setStep: (step: number) => void
  resetBuilder: () => void
}

const initialState = {
  showName: '',
  showConfig: '',
  randomType: null,
  teams: [] as Team[],
  groupCount: 2,
  selectedTheme: null as ExperienceTheme | null,
  currentStep: 1,
}

export const useShowBuilderStore = create<ShowBuilderState>()(
  persist(
    (set) => ({
      ...initialState,
      setRandomType: (randomType) => set({ randomType }),
      addTeam: () => set((state) => ({ teams: [...state.teams, createTeam()] })),
      addTeams: (teams) => set((state) => ({
        teams: [...state.teams, ...teams.map((names) => createTeam(names))],
      })),
      removeTeam: (teamId) => set((state) => ({
        teams: state.teams.filter((team) => team.id !== teamId),
      })),
      updateTeam: (teamId, updates) => set((state) => ({
        teams: state.teams.map((team) => team.id === teamId ? { ...team, ...updates } : team),
      })),
      updateParticipant: (teamId, participantId, updates) => set((state) => ({
        teams: state.teams.map((team) => team.id === teamId
          ? {
              ...team,
              participants: team.participants.map((participant) =>
                participant.id === participantId
                  ? { ...participant, ...updates }
                  : participant,
              ),
            }
          : team),
      })),
      loadDemo: async () => {
        const teams = Array.from({ length: 32 }, (_, teamIndex) => {
          const first = teamIndex * 2 + 1
          return createTeam([
            `Player ${String(first).padStart(2, '0')}`,
            `Player ${String(first + 1).padStart(2, '0')}`,
          ])
        })
        set({ randomType: 'teams', teams, groupCount: 8 })

        try {
          const imageIds = await downloadDemoParticipantImages(teams)
          set((state) => ({
            teams: state.teams.map((team) => ({
              ...team,
              participants: team.participants.map((participant) => ({
                ...participant,
                imageId: imageIds.get(participant.id) ?? participant.imageId,
              })),
            })),
          }))
        } catch {
          // The generated names remain usable when the network is unavailable.
        }
      },
      setGroupCount: (groupCount) => set({ groupCount }),
      setShowConfig: (showConfig) => set({ showConfig }),
      setTheme: (selectedTheme) => set({ selectedTheme }),
      setStep: (currentStep) => set({ currentStep }),
      resetBuilder: () => set(initialState),
    }),
    {
      name: 'randomshow-builder',
      version: 1,
      partialize: (state) => ({
        showName: state.showName,
        showConfig: state.showConfig,
        randomType: state.randomType,
        teams: state.teams,
        groupCount: state.groupCount,
        selectedTheme: state.selectedTheme,
        currentStep: state.currentStep,
      }),
    },
  ),
)
