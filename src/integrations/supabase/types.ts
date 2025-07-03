export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blockchain_transactions: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          game_room_id: string | null
          id: string
          status: string | null
          tournament_id: string | null
          transaction_hash: string | null
          transaction_type: string
          wallet_address: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          game_room_id?: string | null
          id?: string
          status?: string | null
          tournament_id?: string | null
          transaction_hash?: string | null
          transaction_type: string
          wallet_address: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          game_room_id?: string | null
          id?: string
          status?: string | null
          tournament_id?: string | null
          transaction_hash?: string | null
          transaction_type?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_transactions_game_room_id_fkey"
            columns: ["game_room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blockchain_transactions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          completed_at: string | null
          created_at: string
          entry_fee: number | null
          game_state: Json | null
          game_type: Database["public"]["Enums"]["game_type"]
          host_wallet_address: string
          id: string
          max_players: number | null
          prize_pool: number | null
          room_code: string
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"] | null
          winner_wallet_address: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          entry_fee?: number | null
          game_state?: Json | null
          game_type: Database["public"]["Enums"]["game_type"]
          host_wallet_address: string
          id?: string
          max_players?: number | null
          prize_pool?: number | null
          room_code: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"] | null
          winner_wallet_address?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          entry_fee?: number | null
          game_state?: Json | null
          game_type?: Database["public"]["Enums"]["game_type"]
          host_wallet_address?: string
          id?: string
          max_players?: number | null
          prize_pool?: number | null
          room_code?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"] | null
          winner_wallet_address?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          id: string
          total_games_played: number | null
          total_tokens_won: number | null
          updated_at: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_games_played?: number | null
          total_tokens_won?: number | null
          updated_at?: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          total_games_played?: number | null
          total_tokens_won?: number | null
          updated_at?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      room_players: {
        Row: {
          id: string
          joined_at: string
          position: number | null
          room_id: string | null
          score: number | null
          wallet_address: string
        }
        Insert: {
          id?: string
          joined_at?: string
          position?: number | null
          room_id?: string | null
          score?: number | null
          wallet_address: string
        }
        Update: {
          id?: string
          joined_at?: string
          position?: number | null
          room_id?: string | null
          score?: number | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          final_position: number | null
          final_score: number | null
          id: string
          joined_at: string
          tournament_id: string | null
          wallet_address: string
        }
        Insert: {
          final_position?: number | null
          final_score?: number | null
          id?: string
          joined_at?: string
          tournament_id?: string | null
          wallet_address: string
        }
        Update: {
          final_position?: number | null
          final_score?: number | null
          id?: string
          joined_at?: string
          tournament_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          end_time: string | null
          entry_fee: number | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          max_participants: number | null
          name: string
          prize_pool: number | null
          start_time: string
          status: Database["public"]["Enums"]["tournament_status"] | null
          winner_wallet_address: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          entry_fee?: number | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          max_participants?: number | null
          name: string
          prize_pool?: number | null
          start_time: string
          status?: Database["public"]["Enums"]["tournament_status"] | null
          winner_wallet_address?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          entry_fee?: number | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          max_participants?: number | null
          name?: string
          prize_pool?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["tournament_status"] | null
          winner_wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      game_type: "snake" | "fruit_luck" | "crossword"
      room_status: "waiting" | "active" | "completed"
      tournament_status: "upcoming" | "active" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_type: ["snake", "fruit_luck", "crossword"],
      room_status: ["waiting", "active", "completed"],
      tournament_status: ["upcoming", "active", "completed"],
    },
  },
} as const
