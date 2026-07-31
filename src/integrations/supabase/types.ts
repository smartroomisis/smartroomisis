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
      blocked_slots: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          end_time: string
          id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          end_time: string
          id?: string
          reason?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          end_time?: string
          id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          reservation_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          reservation_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          reservation_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_companies: {
        Row: {
          billing_email: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          email_domain: string
          id: string
          is_active: boolean
          is_unlimited: boolean
          monthly_hours_limit: number | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          email_domain: string
          id?: string
          is_active?: boolean
          is_unlimited?: boolean
          monthly_hours_limit?: number | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          email_domain?: string
          id?: string
          is_active?: boolean
          is_unlimited?: boolean
          monthly_hours_limit?: number | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enterprise_usage_logs: {
        Row: {
          billed_at: string | null
          booking_date: string
          company_id: string
          created_at: string
          description: string | null
          hours_used: number
          id: string
          is_billed: boolean
          reservation_id: string | null
          user_id: string | null
        }
        Insert: {
          billed_at?: string | null
          booking_date: string
          company_id: string
          created_at?: string
          description?: string | null
          hours_used: number
          id?: string
          is_billed?: boolean
          reservation_id?: string | null
          user_id?: string | null
        }
        Update: {
          billed_at?: string | null
          booking_date?: string
          company_id?: string
          created_at?: string
          description?: string | null
          hours_used?: number
          id?: string
          is_billed?: boolean
          reservation_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_usage_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "enterprise_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          id: string
          invoice_number: string | null
          notes: string | null
          payment_date: string | null
          payment_proof_url: string | null
          receipt_url: string | null
          reference_month: string | null
          status: string
          updated_at: string
          vendor_document: string | null
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_proof_url?: string | null
          receipt_url?: string | null
          reference_month?: string | null
          status?: string
          updated_at?: string
          vendor_document?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_proof_url?: string | null
          receipt_url?: string | null
          reference_month?: string | null
          status?: string
          updated_at?: string
          vendor_document?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_config: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean
          section_key: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          section_key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          credit_hours: number
          current_plan: Database["public"]["Enums"]["subscription_plan"]
          email: string
          enterprise_company_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_hours?: number
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          email: string
          enterprise_company_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_hours?: number
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          email?: string
          enterprise_company_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          access_code: string | null
          checked_in_at: string | null
          client_email: string | null
          client_name: string
          company_id: string | null
          created_at: string
          date: string
          end_time: string
          hours: number
          id: string
          notes: string | null
          payment_mode: string
          phone: string | null
          refund_reason: string | null
          room_id: string
          start_time: string
          status: string
          stripe_payment_id: string | null
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_code?: string | null
          checked_in_at?: string | null
          client_email?: string | null
          client_name: string
          company_id?: string | null
          created_at?: string
          date: string
          end_time: string
          hours?: number
          id?: string
          notes?: string | null
          payment_mode?: string
          phone?: string | null
          refund_reason?: string | null
          room_id?: string
          start_time: string
          status?: string
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_code?: string | null
          checked_in_at?: string | null
          client_email?: string | null
          client_name?: string
          company_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          hours?: number
          id?: string
          notes?: string | null
          payment_mode?: string
          phone?: string | null
          refund_reason?: string | null
          room_id?: string
          start_time?: string
          status?: string
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "enterprise_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      room_status: {
        Row: {
          id: string
          is_occupied: boolean
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_occupied?: boolean
          room_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_occupied?: boolean
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_audits: {
        Row: {
          cleaning_checklist: Json
          coffee_capsules_remaining: number | null
          coffee_capsules_used: number | null
          completed_at: string | null
          created_at: string
          damage_description: string | null
          has_damage: boolean | null
          id: string
          notes: string | null
          organization_checklist: Json
          photo_urls: string[] | null
          reservation_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          room_id: string
          staff_id: string | null
          status: string
        }
        Insert: {
          cleaning_checklist?: Json
          coffee_capsules_remaining?: number | null
          coffee_capsules_used?: number | null
          completed_at?: string | null
          created_at?: string
          damage_description?: string | null
          has_damage?: boolean | null
          id?: string
          notes?: string | null
          organization_checklist?: Json
          photo_urls?: string[] | null
          reservation_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_id?: string
          staff_id?: string | null
          status?: string
        }
        Update: {
          cleaning_checklist?: Json
          coffee_capsules_remaining?: number | null
          coffee_capsules_used?: number | null
          completed_at?: string | null
          created_at?: string
          damage_description?: string | null
          has_damage?: boolean | null
          id?: string
          notes?: string | null
          organization_checklist?: Json
          photo_urls?: string[] | null
          reservation_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_id?: string
          staff_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_audits_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_audits_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_audits_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_payments: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          audit_id: string | null
          created_at: string
          description: string | null
          fee_type: string
          id: string
          paid_at: string | null
          paid_by: string | null
          payment_date: string | null
          payment_method: string | null
          payment_proof_url: string | null
          reservation_id: string | null
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          audit_id?: string | null
          created_at?: string
          description?: string | null
          fee_type: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          reservation_id?: string | null
          staff_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          audit_id?: string | null
          created_at?: string
          description?: string | null
          fee_type?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          reservation_id?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_payments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_payments_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "staff_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_payments_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_payments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_problems: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          photo_urls: string[] | null
          room_id: string
          staff_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          photo_urls?: string[] | null
          room_id?: string
          staff_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          photo_urls?: string[] | null
          room_id?: string
          staff_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          included_hours: number
          is_active: boolean
          min_booking_hours: number
          monthly_price: number
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          included_hours?: number
          is_active?: boolean
          min_booking_hours?: number
          monthly_price?: number
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          included_hours?: number
          is_active?: boolean
          min_booking_hours?: number
          monthly_price?: number
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      payment_mode: "credit" | "stripe" | "invoice"
      subscription_plan: "basic" | "pro" | "executive" | "enterprise"
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
      app_role: ["admin", "staff", "user"],
      payment_mode: ["credit", "stripe", "invoice"],
      subscription_plan: ["basic", "pro", "executive", "enterprise"],
    },
  },
} as const
