export interface Participant {
  id: string
  name: string
  imageId?: string
}

export interface Team {
  id: string
  name?: string
  participants: Participant[]
}

export type RandomType = 'teams'

export type ExperienceTheme = 'arcade' | 'casino' | 'wheel' | 'lottery'

export interface Group {
  id: string
  name: string
  capacity: number
  teamIds: string[]
}

export type RandomShowType = 'arcade' | 'casino' | 'wheel' | 'lottery'

export interface RandomShowProject {
  id: string
  name: string
  type: RandomShowType
  createdAt: string
}

export interface DrawResult {
  id: string
  teamId: string
  groupId: string
  drawIndex: number
  createdAt: number
}

export type GroupAllocationMode = 'balanced'

export type ShowSessionStatus = 'idle' | 'running' | 'completed'

export interface ShowSession {
  id: string
  startedAt: number
  showConfig?: string
  teams: Team[]
  groups: Group[]
  drawHistory: DrawResult[]
  status: ShowSessionStatus
  groupMode: GroupAllocationMode
  selectedTheme: ExperienceTheme | null
}
