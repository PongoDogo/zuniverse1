export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      user_achievements: {
        Row: {
          achievement_id: string
          clerk_user_id: string
          description: string | null
          icon: string | null
          id: string
          title: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          clerk_user_id: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          clerk_user_id?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          unlocked_at?: string
        }
        Relationships: []
      }
      user_continue_watching: {
        Row: {
          clerk_user_id: string
          duration: number
          episode: number | null
          episode_title: string | null
          id: string
          last_watched: string
          media_id: number
          media_type: string
          playback_time: number
          poster_path: string | null
          progress: number
          season: number | null
          title: string
        }
        Insert: {
          clerk_user_id: string
          duration?: number
          episode?: number | null
          episode_title?: string | null
          id?: string
          last_watched?: string
          media_id: number
          media_type: string
          playback_time?: number
          poster_path?: string | null
          progress?: number
          season?: number | null
          title: string
        }
        Update: {
          clerk_user_id?: string
          duration?: number
          episode?: number | null
          episode_title?: string | null
          id?: string
          last_watched?: string
          media_id?: number
          media_type?: string
          playback_time?: number
          poster_path?: string | null
          progress?: number
          season?: number | null
          title?: string
        }
        Relationships: []
      }
      user_pinned: {
        Row: {
          clerk_user_id: string
          id: string
          media_id: number
          media_type: string
          pinned_at: string
          poster_path: string | null
          title: string
        }
        Insert: {
          clerk_user_id: string
          id?: string
          media_id: number
          media_type: string
          pinned_at?: string
          poster_path?: string | null
          title: string
        }
        Update: {
          clerk_user_id?: string
          id?: string
          media_id?: number
          media_type?: string
          pinned_at?: string
          poster_path?: string | null
          title?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          avatar_url: string | null
          clerk_user_id: string
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          language: string | null
          theme: string | null
          ui_layout: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clerk_user_id: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          ui_layout?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clerk_user_id?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          ui_layout?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_watch_stats: {
        Row: {
          clerk_user_id: string
          episodes_watched: number
          id: string
          movies_watched: number
          seasons_completed: number
          total_watch_time: number
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          episodes_watched?: number
          id?: string
          movies_watched?: number
          seasons_completed?: number
          total_watch_time?: number
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string
          episodes_watched?: number
          id?: string
          movies_watched?: number
          seasons_completed?: number
          total_watch_time?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          added_at: string
          clerk_user_id: string
          id: string
          media_id: number
          media_type: string
          poster_path: string | null
          release_date: string | null
          title: string
          vote_average: number | null
        }
        Insert: {
          added_at?: string
          clerk_user_id: string
          id?: string
          media_id: number
          media_type: string
          poster_path?: string | null
          release_date?: string | null
          title: string
          vote_average?: number | null
        }
        Update: {
          added_at?: string
          clerk_user_id?: string
          id?: string
          media_id?: number
          media_type?: string
          poster_path?: string | null
          release_date?: string | null
          title?: string
          vote_average?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_clerk_user_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
