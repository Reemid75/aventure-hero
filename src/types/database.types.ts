export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          role: 'player' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: 'player' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          role?: 'player' | 'admin'
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          id: string
          title: string
          description: string | null
          author_id: string
          is_published: boolean
          cover_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          author_id: string
          is_published?: boolean
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          author_id?: string
          is_published?: boolean
          cover_image?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scenes: {
        Row: {
          id: string
          story_id: string
          title: string
          content: string
          is_start: boolean
          is_ending: boolean
          ending_type: 'victory' | 'defeat' | 'neutral' | null
          keywords: string[]
          required_keywords: string[]
          position_x: number
          position_y: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          title: string
          content: string
          is_start?: boolean
          is_ending?: boolean
          ending_type?: 'victory' | 'defeat' | 'neutral' | null
          keywords?: string[]
          required_keywords?: string[]
          position_x?: number
          position_y?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          title?: string
          content?: string
          is_start?: boolean
          is_ending?: boolean
          ending_type?: 'victory' | 'defeat' | 'neutral' | null
          keywords?: string[]
          required_keywords?: string[]
          position_x?: number
          position_y?: number
          updated_at?: string
        }
        Relationships: []
      }
      choices: {
        Row: {
          id: string
          story_id: string
          from_scene_id: string
          to_scene_id: string
          label: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          from_scene_id: string
          to_scene_id: string
          label: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          from_scene_id?: string
          to_scene_id?: string
          label?: string
          order_index?: number
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string
          story_id: string
          current_scene_id: string
          status: 'active' | 'completed' | 'abandoned'
          journal: string[]
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          story_id: string
          current_scene_id: string
          status?: 'active' | 'completed' | 'abandoned'
          journal?: string[]
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          story_id?: string
          current_scene_id?: string
          status?: 'active' | 'completed' | 'abandoned'
          journal?: string[]
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scene_visits: {
        Row: {
          id: string
          session_id: string
          scene_id: string
          choice_id: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          session_id: string
          scene_id: string
          choice_id?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          scene_id?: string
          choice_id?: string | null
          visited_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
