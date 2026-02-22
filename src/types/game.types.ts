import type { Database } from './database.types'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type Story = Tables['stories']['Row']
export type Scene = Tables['scenes']['Row']
export type Choice = Tables['choices']['Row']
export type GameSession = Tables['game_sessions']['Row']
export type SceneVisit = Tables['scene_visits']['Row']

export interface SceneWithChoices extends Scene {
  choices: Choice[]
}

export interface SessionWithStory extends GameSession {
  story: Story
  current_scene: SceneWithChoices
}

export interface StoryWithMeta extends Story {
  scenes_count: number
  author: Pick<Profile, 'username'>
}

export interface NavigatePayload {
  choiceId: string
}

export interface NavigateResult {
  session: GameSession
  scene: SceneWithChoices
  isEnding: boolean
}

/** Mots-clés requis par scène de destination : sceneId → required_keywords */
export type SceneRequirements = Record<string, string[]>

export interface StartSessionResult {
  sessionId: string
  isNew: boolean
}
