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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: number
          usage_count: number | null
          user_id: number | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: never
          usage_count?: number | null
          user_id?: number | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: never
          usage_count?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_providers: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      command_executions: {
        Row: {
          api_cost: number | null
          command_category: string
          command_id: string
          command_name: string
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: string
          output_data: Json | null
          provider: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_cost?: number | null
          command_category: string
          command_id: string
          command_name: string
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data: string
          output_data?: Json | null
          provider: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_cost?: number | null
          command_category?: string
          command_id?: string
          command_name?: string
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: string
          output_data?: Json | null
          provider?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_intelligence: {
        Row: {
          breach_data: string | null
          created_at: string | null
          email: string
          id: number
          reputation: string | null
        }
        Insert: {
          breach_data?: string | null
          created_at?: string | null
          email: string
          id?: never
          reputation?: string | null
        }
        Update: {
          breach_data?: string | null
          created_at?: string | null
          email?: string
          id?: never
          reputation?: string | null
        }
        Relationships: []
      }
      github_intelligence: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          repositories: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: never
          repositories?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: never
          repositories?: string | null
          username?: string
        }
        Relationships: []
      }
      ip_intelligence: {
        Row: {
          created_at: string | null
          id: number
          ip_address: string
          isp: string | null
          location: string | null
          threat_level: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          ip_address: string
          isp?: string | null
          location?: string | null
          threat_level?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          ip_address?: string
          isp?: string | null
          location?: string | null
          threat_level?: string | null
        }
        Relationships: []
      }
      phone_intelligence: {
        Row: {
          carrier: string | null
          created_at: string | null
          id: number
          location: string | null
          phone_number: string
          validation_status: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          id?: never
          location?: string | null
          phone_number: string
          validation_status?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          id?: never
          location?: string | null
          phone_number?: string
          validation_status?: string | null
        }
        Relationships: []
      }
      premium_keys: {
        Row: {
          created_at: string | null
          id: number
          queries_remaining: number | null
          tier: string
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          queries_remaining?: number | null
          tier: string
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          queries_remaining?: number | null
          tier?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_authentications: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          id: number
          provider_id: number | null
          provider_user_id: string
          refresh_token: string | null
          user_id: number | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: never
          provider_id?: number | null
          provider_user_id: string
          refresh_token?: string | null
          user_id?: number | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: never
          provider_id?: number | null
          provider_user_id?: string
          refresh_token?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_authentications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "auth_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_authentications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          phone: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: never
          phone?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: never
          phone?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_limits: {
        Args: { api_cost_to_add?: number; user_uuid: string }
        Returns: {
          commands_used: number
          total_cost_used: number
          within_command_limit: boolean
          within_cost_limit: boolean
        }[]
      }
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
