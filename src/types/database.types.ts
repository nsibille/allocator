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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allocation_lines: {
        Row: {
          allocation_id: string
          amount: number
          created_at: string
          fund_id: string
          id: string
        }
        Insert: {
          allocation_id: string
          amount?: number
          created_at?: string
          fund_id: string
          id?: string
        }
        Update: {
          allocation_id?: string
          amount?: number
          created_at?: string
          fund_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocation_lines_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocation_lines_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      allocations: {
        Row: {
          cabinet_id: string
          client_id: string | null
          conseiller_id: string | null
          created_at: string
          dist_pace: number
          diversification: string
          envelope_amount: number
          esg: boolean
          horizon_years: number
          id: string
          name: string
          objectives: Json
          qualification: Json | null
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          scenario: string
          status: Database["public"]["Enums"]["allocation_status"]
          strategies: Json
          updated_at: string
        }
        Insert: {
          cabinet_id: string
          client_id?: string | null
          conseiller_id?: string | null
          created_at?: string
          dist_pace?: number
          diversification?: string
          envelope_amount: number
          esg?: boolean
          horizon_years?: number
          id?: string
          name?: string
          objectives?: Json
          qualification?: Json | null
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          scenario?: string
          status?: Database["public"]["Enums"]["allocation_status"]
          strategies?: Json
          updated_at?: string
        }
        Update: {
          cabinet_id?: string
          client_id?: string | null
          conseiller_id?: string | null
          created_at?: string
          dist_pace?: number
          diversification?: string
          envelope_amount?: number
          esg?: boolean
          horizon_years?: number
          id?: string
          name?: string
          objectives?: Json
          qualification?: Json | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          scenario?: string
          status?: Database["public"]["Enums"]["allocation_status"]
          strategies?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocations_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_conseiller_id_fkey"
            columns: ["conseiller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinets: {
        Row: {
          created_at: string
          id: string
          name: string
          orias: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          orias?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          orias?: string | null
        }
        Relationships: []
      }
      client_assets: {
        Row: {
          cabinet_id: string
          category: string
          client_id: string
          created_at: string
          envelope: string | null
          geography: string | null
          id: string
          label: string
          note: string | null
          support: string
          updated_at: string
          value: number
        }
        Insert: {
          cabinet_id: string
          category: string
          client_id: string
          created_at?: string
          envelope?: string | null
          geography?: string | null
          id?: string
          label: string
          note?: string | null
          support?: string
          updated_at?: string
          value?: number
        }
        Update: {
          cabinet_id?: string
          category?: string
          client_id?: string
          created_at?: string
          envelope?: string | null
          geography?: string | null
          id?: string
          label?: string
          note?: string | null
          support?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_assets_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          cabinet_id: string
          client_id: string
          created_at: string
          doc_type: string
          id: string
          name: string
          note: string | null
          status: Database["public"]["Enums"]["document_status"]
        }
        Insert: {
          cabinet_id: string
          client_id: string
          created_at?: string
          doc_type?: string
          id?: string
          name: string
          note?: string | null
          status?: Database["public"]["Enums"]["document_status"]
        }
        Update: {
          cabinet_id?: string
          client_id?: string
          created_at?: string
          doc_type?: string
          id?: string
          name?: string
          note?: string | null
          status?: Database["public"]["Enums"]["document_status"]
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_events: {
        Row: {
          actor: Database["public"]["Enums"]["event_actor"]
          body: string | null
          cabinet_id: string
          client_id: string
          created_at: string
          data: Json
          id: string
          occurred_at: string
          title: string | null
          type: Database["public"]["Enums"]["client_event_type"]
        }
        Insert: {
          actor?: Database["public"]["Enums"]["event_actor"]
          body?: string | null
          cabinet_id: string
          client_id: string
          created_at?: string
          data?: Json
          id?: string
          occurred_at?: string
          title?: string | null
          type: Database["public"]["Enums"]["client_event_type"]
        }
        Update: {
          actor?: Database["public"]["Enums"]["event_actor"]
          body?: string | null
          cabinet_id?: string
          client_id?: string
          created_at?: string
          data?: Json
          id?: string
          occurred_at?: string
          title?: string | null
          type?: Database["public"]["Enums"]["client_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "client_events_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          adequacy: Json
          birth_date: string | null
          cabinet_id: string
          conseiller_id: string | null
          created_at: string
          email: string | null
          esg_profile: Json
          experience: string | null
          first_name: string | null
          horizon_years: number | null
          id: string
          kyc: Json
          last_name: string | null
          liquidity: string | null
          nationality: string | null
          notes: string | null
          patrimoine_financier: number | null
          phone: string | null
          reference: string
          risk_profile: Database["public"]["Enums"]["risk_profile"] | null
          status: Database["public"]["Enums"]["client_status"]
          tax: Json
          updated_at: string
        }
        Insert: {
          address?: string | null
          adequacy?: Json
          birth_date?: string | null
          cabinet_id: string
          conseiller_id?: string | null
          created_at?: string
          email?: string | null
          esg_profile?: Json
          experience?: string | null
          first_name?: string | null
          horizon_years?: number | null
          id?: string
          kyc?: Json
          last_name?: string | null
          liquidity?: string | null
          nationality?: string | null
          notes?: string | null
          patrimoine_financier?: number | null
          phone?: string | null
          reference: string
          risk_profile?: Database["public"]["Enums"]["risk_profile"] | null
          status?: Database["public"]["Enums"]["client_status"]
          tax?: Json
          updated_at?: string
        }
        Update: {
          address?: string | null
          adequacy?: Json
          birth_date?: string | null
          cabinet_id?: string
          conseiller_id?: string | null
          created_at?: string
          email?: string | null
          esg_profile?: Json
          experience?: string | null
          first_name?: string | null
          horizon_years?: number | null
          id?: string
          kyc?: Json
          last_name?: string | null
          liquidity?: string | null
          nationality?: string | null
          notes?: string | null
          patrimoine_financier?: number | null
          phone?: string | null
          reference?: string
          risk_profile?: Database["public"]["Enums"]["risk_profile"] | null
          status?: Database["public"]["Enums"]["client_status"]
          tax?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_conseiller_id_fkey"
            columns: ["conseiller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          bucket: Database["public"]["Enums"]["strategy_bucket"]
          closing_date: string | null
          closing_label: string
          esg_score: number | null
          id: string
          is_active: boolean
          manager: string
          min_ticket: number
          name: string
          pacing: Database["public"]["Enums"]["pacing_profile"]
          professional_only: boolean
          risk_score: number | null
          slug: string
          sort_order: number
          strategy: string
          target_gross_irr: number
          target_multiple: number
          vehicle: string
        }
        Insert: {
          bucket: Database["public"]["Enums"]["strategy_bucket"]
          closing_date?: string | null
          closing_label: string
          esg_score?: number | null
          id?: string
          is_active?: boolean
          manager: string
          min_ticket?: number
          name: string
          pacing: Database["public"]["Enums"]["pacing_profile"]
          professional_only?: boolean
          risk_score?: number | null
          slug: string
          sort_order?: number
          strategy: string
          target_gross_irr: number
          target_multiple: number
          vehicle?: string
        }
        Update: {
          bucket?: Database["public"]["Enums"]["strategy_bucket"]
          closing_date?: string | null
          closing_label?: string
          esg_score?: number | null
          id?: string
          is_active?: boolean
          manager?: string
          min_ticket?: number
          name?: string
          pacing?: Database["public"]["Enums"]["pacing_profile"]
          professional_only?: boolean
          risk_score?: number | null
          slug?: string
          sort_order?: number
          strategy?: string
          target_gross_irr?: number
          target_multiple?: number
          vehicle?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cabinet_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          allocation_id: string
          amount: number
          cabinet_id: string
          fund_id: string
          generated_at: string
          id: string
          reference: string
          status: Database["public"]["Enums"]["bulletin_status"]
        }
        Insert: {
          allocation_id: string
          amount: number
          cabinet_id: string
          fund_id: string
          generated_at?: string
          id?: string
          reference: string
          status?: Database["public"]["Enums"]["bulletin_status"]
        }
        Update: {
          allocation_id?: string
          amount?: number
          cabinet_id?: string
          fund_id?: string
          generated_at?: string
          id?: string
          reference?: string
          status?: Database["public"]["Enums"]["bulletin_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_cabinet_id: { Args: never; Returns: string }
    }
    Enums: {
      allocation_status:
        | "draft"
        | "proposed"
        | "validated"
        | "subscribed"
        | "archived"
      app_role: "conseiller" | "admin"
      bulletin_status: "generated" | "sent" | "signed" | "received"
      client_event_type:
        | "client_created"
        | "login"
        | "fund_viewed"
        | "document_viewed"
        | "document_downloaded"
        | "document_added"
        | "document_updated"
        | "proposal_created"
        | "proposal_sent"
        | "proposal_viewed"
        | "questionnaire_updated"
        | "profile_updated"
        | "status_changed"
        | "contact_added"
        | "phone_call"
        | "meeting"
        | "email"
        | "note"
        | "subscription_created"
        | "subscription_signed"
        | "capital_call"
        | "distribution"
        | "other"
      client_status: "prospect" | "actif" | "archive"
      document_status: "manquant" | "recu" | "valide" | "expire"
      event_actor: "conseiller" | "client" | "systeme"
      pacing_profile:
        | "buyout"
        | "growth"
        | "innovation"
        | "credit"
        | "infra"
        | "secondary"
        | "gpstakes"
      risk_profile: "prudent" | "equilibre" | "dynamique" | "offensif"
      strategy_bucket: "defensif" | "coeur" | "croissance" | "satellite"
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
    Enums: {
      allocation_status: [
        "draft",
        "proposed",
        "validated",
        "subscribed",
        "archived",
      ],
      app_role: ["conseiller", "admin"],
      bulletin_status: ["generated", "sent", "signed", "received"],
      client_event_type: [
        "client_created",
        "login",
        "fund_viewed",
        "document_viewed",
        "document_downloaded",
        "document_added",
        "document_updated",
        "proposal_created",
        "proposal_sent",
        "proposal_viewed",
        "questionnaire_updated",
        "profile_updated",
        "status_changed",
        "contact_added",
        "phone_call",
        "meeting",
        "email",
        "note",
        "subscription_created",
        "subscription_signed",
        "capital_call",
        "distribution",
        "other",
      ],
      client_status: ["prospect", "actif", "archive"],
      document_status: ["manquant", "recu", "valide", "expire"],
      event_actor: ["conseiller", "client", "systeme"],
      pacing_profile: [
        "buyout",
        "growth",
        "innovation",
        "credit",
        "infra",
        "secondary",
        "gpstakes",
      ],
      risk_profile: ["prudent", "equilibre", "dynamique", "offensif"],
      strategy_bucket: ["defensif", "coeur", "croissance", "satellite"],
    },
  },
} as const
