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
export type ThemeConfigs = Partial<Record<ExperienceTheme, string>>

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
  screenConfig?: string
  hostName?: string
  teams: Team[]
  groups: Group[]
  drawHistory: DrawResult[]
  status: ShowSessionStatus
  groupMode: GroupAllocationMode
  selectedTheme: ExperienceTheme | null
}

export type TeamDrawContentStatus = 'draft' | 'ready' | 'drawing' | 'completed'

export interface TeamDrawSettings {
  screenConfig: string
  hostName: string
}

export interface TeamDrawContent {
  id: string
  name: string
  teams: Team[]
  groupCount: number
  teamsPerGroup?: number
  templateId: ExperienceTheme
  settings: TeamDrawSettings
  status: TeamDrawContentStatus
  groups: Group[]
  drawHistory: DrawResult[]
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export interface TeamDrawContentInput {
  name: string
  teams: Team[]
  groupCount: number
  templateId: ExperienceTheme
  settings: TeamDrawSettings
}