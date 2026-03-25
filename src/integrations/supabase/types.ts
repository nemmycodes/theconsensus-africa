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
      agent_locations: {
        Row: {
          accuracy: number | null
          agent_id: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          agent_id: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          agent_id?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          form_type: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          form_type?: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          form_type?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attendee_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          image_url: string | null
          location: string | null
          max_attendees: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type?: string
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kef_cares_registrations: {
        Row: {
          artisan_skills: string[] | null
          business_type: string | null
          community: string | null
          consent_given: boolean
          created_at: string
          creative_skills: string[] | null
          date_of_birth: string | null
          economic_status: string | null
          education_status: string | null
          email: string | null
          field_of_study: string | null
          full_name: string
          gender: string
          highest_qualification: string | null
          id: string
          interest_agricultural: boolean | null
          interest_economic_empowerment: boolean | null
          interest_entrepreneurship: boolean | null
          interest_leadership: boolean | null
          interest_professional_networking: boolean | null
          interest_skills_training: boolean | null
          interest_trading: boolean | null
          interested_in_volunteering: boolean | null
          lga: string
          marital_status: string | null
          member_id: string | null
          monthly_income_range: string | null
          occupation: string | null
          owns_business: string | null
          phone_number: string
          polling_unit: string | null
          primary_economic_sector: string | null
          professional_skills: string[] | null
          residential_address: string | null
          social_status: string | null
          sport_type: string | null
          sports_participation: boolean | null
          volunteer_availability: string | null
          volunteer_role: string | null
          ward: string | null
          whatsapp_active: boolean | null
        }
        Insert: {
          artisan_skills?: string[] | null
          business_type?: string | null
          community?: string | null
          consent_given?: boolean
          created_at?: string
          creative_skills?: string[] | null
          date_of_birth?: string | null
          economic_status?: string | null
          education_status?: string | null
          email?: string | null
          field_of_study?: string | null
          full_name: string
          gender: string
          highest_qualification?: string | null
          id?: string
          interest_agricultural?: boolean | null
          interest_economic_empowerment?: boolean | null
          interest_entrepreneurship?: boolean | null
          interest_leadership?: boolean | null
          interest_professional_networking?: boolean | null
          interest_skills_training?: boolean | null
          interest_trading?: boolean | null
          interested_in_volunteering?: boolean | null
          lga: string
          marital_status?: string | null
          member_id?: string | null
          monthly_income_range?: string | null
          occupation?: string | null
          owns_business?: string | null
          phone_number: string
          polling_unit?: string | null
          primary_economic_sector?: string | null
          professional_skills?: string[] | null
          residential_address?: string | null
          social_status?: string | null
          sport_type?: string | null
          sports_participation?: boolean | null
          volunteer_availability?: string | null
          volunteer_role?: string | null
          ward?: string | null
          whatsapp_active?: boolean | null
        }
        Update: {
          artisan_skills?: string[] | null
          business_type?: string | null
          community?: string | null
          consent_given?: boolean
          created_at?: string
          creative_skills?: string[] | null
          date_of_birth?: string | null
          economic_status?: string | null
          education_status?: string | null
          email?: string | null
          field_of_study?: string | null
          full_name?: string
          gender?: string
          highest_qualification?: string | null
          id?: string
          interest_agricultural?: boolean | null
          interest_economic_empowerment?: boolean | null
          interest_entrepreneurship?: boolean | null
          interest_leadership?: boolean | null
          interest_professional_networking?: boolean | null
          interest_skills_training?: boolean | null
          interest_trading?: boolean | null
          interested_in_volunteering?: boolean | null
          lga?: string
          marital_status?: string | null
          member_id?: string | null
          monthly_income_range?: string | null
          occupation?: string | null
          owns_business?: string | null
          phone_number?: string
          polling_unit?: string | null
          primary_economic_sector?: string | null
          professional_skills?: string[] | null
          residential_address?: string | null
          social_status?: string | null
          sport_type?: string | null
          sports_participation?: boolean | null
          volunteer_availability?: string | null
          volunteer_role?: string | null
          ward?: string | null
          whatsapp_active?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dob: string | null
          email: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          lga: string | null
          phone: string | null
          user_id: string
          ward: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          lga?: string | null
          phone?: string | null
          user_id: string
          ward?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          lga?: string | null
          phone?: string | null
          user_id?: string
          ward?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          id: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      situation_updates: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "agent" | "user" | "super_admin" | "kef_user"
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
      app_role: ["admin", "agent", "user", "super_admin", "kef_user"],
    },
  },
} as const
