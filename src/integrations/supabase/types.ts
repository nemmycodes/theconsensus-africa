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
    PostgrestVersion: "14.17"
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
      agent_recruitment_applications: {
        Row: {
          address: string | null
          agent_sub_role: string | null
          agent_type: string
          aspirant_level: string | null
          attended_inec_training: boolean
          available_counting: boolean
          available_voting_period: boolean
          created_at: string
          date_of_birth: string | null
          declaration_date: string
          declaration_signature: string
          email: string
          experience_details: string | null
          full_name: string
          has_previous_experience: boolean
          highest_qualification: string | null
          id: string
          id_proof_type: string | null
          id_proof_url: string
          institution: string | null
          lga: string
          manifesto_summary: string | null
          party_affiliation: string | null
          party_membership_number: string | null
          phone: string
          place_of_birth: string | null
          polling_unit: string
          portrait_photo_url: string | null
          position_aspired: string | null
          prior_office_held: string | null
          qualification_year: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state_of_origin: string | null
          status: Database["public"]["Enums"]["recruitment_status"]
          training_date: string | null
          updated_at: string
          user_id: string | null
          ward: string
        }
        Insert: {
          address?: string | null
          agent_sub_role?: string | null
          agent_type: string
          aspirant_level?: string | null
          attended_inec_training?: boolean
          available_counting?: boolean
          available_voting_period?: boolean
          created_at?: string
          date_of_birth?: string | null
          declaration_date?: string
          declaration_signature: string
          email: string
          experience_details?: string | null
          full_name: string
          has_previous_experience?: boolean
          highest_qualification?: string | null
          id?: string
          id_proof_type?: string | null
          id_proof_url: string
          institution?: string | null
          lga: string
          manifesto_summary?: string | null
          party_affiliation?: string | null
          party_membership_number?: string | null
          phone: string
          place_of_birth?: string | null
          polling_unit: string
          portrait_photo_url?: string | null
          position_aspired?: string | null
          prior_office_held?: string | null
          qualification_year?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["recruitment_status"]
          training_date?: string | null
          updated_at?: string
          user_id?: string | null
          ward: string
        }
        Update: {
          address?: string | null
          agent_sub_role?: string | null
          agent_type?: string
          aspirant_level?: string | null
          attended_inec_training?: boolean
          available_counting?: boolean
          available_voting_period?: boolean
          created_at?: string
          date_of_birth?: string | null
          declaration_date?: string
          declaration_signature?: string
          email?: string
          experience_details?: string | null
          full_name?: string
          has_previous_experience?: boolean
          highest_qualification?: string | null
          id?: string
          id_proof_type?: string | null
          id_proof_url?: string
          institution?: string | null
          lga?: string
          manifesto_summary?: string | null
          party_affiliation?: string | null
          party_membership_number?: string | null
          phone?: string
          place_of_birth?: string | null
          polling_unit?: string
          portrait_photo_url?: string | null
          position_aspired?: string | null
          prior_office_held?: string | null
          qualification_year?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["recruitment_status"]
          training_date?: string | null
          updated_at?: string
          user_id?: string | null
          ward?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          isp: string | null
          language: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          os: string | null
          path: string | null
          referrer: string | null
          region: string | null
          screen_size: string | null
          timezone: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          isp?: string | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          os?: string | null
          path?: string | null
          referrer?: string | null
          region?: string | null
          screen_size?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          isp?: string | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          os?: string | null
          path?: string | null
          referrer?: string | null
          region?: string | null
          screen_size?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          label: string
          last_used_at: string | null
          prefix: string
          revoked: boolean
          scopes: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          label: string
          last_used_at?: string | null
          prefix: string
          revoked?: boolean
          scopes?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          label?: string
          last_used_at?: string | null
          prefix?: string
          revoked?: boolean
          scopes?: string[] | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
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
      broadcasts: {
        Row: {
          active: boolean
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          severity: string
          title: string
        }
        Insert: {
          active?: boolean
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          severity?: string
          title: string
        }
        Update: {
          active?: boolean
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          severity?: string
          title?: string
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
      election_reports: {
        Row: {
          agent_id: string
          candidate_name: string | null
          created_at: string
          ec8a_url: string | null
          election_date: string
          election_type: Database["public"]["Enums"]["election_type"]
          flagged_reason: string | null
          id: string
          latitude: number | null
          lga: string
          longitude: number | null
          notes: string | null
          party: string | null
          polling_unit: string
          registered_voters: number | null
          rejection_reason: string | null
          senatorial_zone: string | null
          state: string
          status: Database["public"]["Enums"]["election_report_status"]
          total_votes_cast: number | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          votes_recorded: number
          ward: string
        }
        Insert: {
          agent_id: string
          candidate_name?: string | null
          created_at?: string
          ec8a_url?: string | null
          election_date: string
          election_type: Database["public"]["Enums"]["election_type"]
          flagged_reason?: string | null
          id?: string
          latitude?: number | null
          lga: string
          longitude?: number | null
          notes?: string | null
          party?: string | null
          polling_unit: string
          registered_voters?: number | null
          rejection_reason?: string | null
          senatorial_zone?: string | null
          state?: string
          status?: Database["public"]["Enums"]["election_report_status"]
          total_votes_cast?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          votes_recorded?: number
          ward: string
        }
        Update: {
          agent_id?: string
          candidate_name?: string | null
          created_at?: string
          ec8a_url?: string | null
          election_date?: string
          election_type?: Database["public"]["Enums"]["election_type"]
          flagged_reason?: string | null
          id?: string
          latitude?: number | null
          lga?: string
          longitude?: number | null
          notes?: string | null
          party?: string | null
          polling_unit?: string
          registered_voters?: number | null
          rejection_reason?: string | null
          senatorial_zone?: string | null
          state?: string
          status?: Database["public"]["Enums"]["election_report_status"]
          total_votes_cast?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          votes_recorded?: number
          ward?: string
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
      failed_signups: {
        Row: {
          attempted_full_name: string | null
          browser: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          device_type: string | null
          email: string | null
          error_code: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          os: string | null
          region: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          attempted_full_name?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          email?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          os?: string | null
          region?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          attempted_full_name?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          email?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          os?: string | null
          region?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          audience: string
          description: string | null
          enabled: boolean
          flag_key: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audience?: string
          description?: string | null
          enabled?: boolean
          flag_key: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audience?: string
          description?: string | null
          enabled?: boolean
          flag_key?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          pinned: boolean
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          pinned?: boolean
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          pinned?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      inec_lgas: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          senatorial_zone: string | null
          state: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          senatorial_zone?: string | null
          state?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          senatorial_zone?: string | null
          state?: string
        }
        Relationships: []
      }
      inec_polling_units: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          ward_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          ward_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inec_polling_units_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "inec_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      inec_states: {
        Row: {
          code: string
          created_at: string
          geo_zone: string
          id: string
          name: string
          senatorial_zones: string[]
        }
        Insert: {
          code: string
          created_at?: string
          geo_zone: string
          id?: string
          name: string
          senatorial_zones?: string[]
        }
        Update: {
          code?: string
          created_at?: string
          geo_zone?: string
          id?: string
          name?: string
          senatorial_zones?: string[]
        }
        Relationships: []
      }
      inec_wards: {
        Row: {
          code: string
          created_at: string
          id: string
          lga_id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          lga_id: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          lga_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inec_wards_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "inec_lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      kef_cares_program_updates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          date_label: string | null
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          date_label?: string | null
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          date_label?: string | null
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kef_cares_registrations: {
        Row: {
          artisan_skills: string[] | null
          avatar_url: string | null
          bio: string | null
          business_type: string | null
          community: string | null
          consent_given: boolean
          cover_url: string | null
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
          user_id: string | null
          volunteer_availability: string | null
          volunteer_role: string | null
          ward: string | null
          whatsapp_active: boolean | null
        }
        Insert: {
          artisan_skills?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          business_type?: string | null
          community?: string | null
          consent_given?: boolean
          cover_url?: string | null
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
          user_id?: string | null
          volunteer_availability?: string | null
          volunteer_role?: string | null
          ward?: string | null
          whatsapp_active?: boolean | null
        }
        Update: {
          artisan_skills?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          business_type?: string | null
          community?: string | null
          consent_given?: boolean
          cover_url?: string | null
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
          user_id?: string | null
          volunteer_availability?: string | null
          volunteer_role?: string | null
          ward?: string | null
          whatsapp_active?: boolean | null
        }
        Relationships: []
      }
      manifesto_contributors: {
        Row: {
          about: string | null
          age_range: string | null
          areas_of_interest: string[]
          contribution: string | null
          created_at: string
          current_location: string | null
          declaration: boolean
          document_urls: string[]
          email: string
          engagement_areas: string[]
          full_name: string
          gender: string | null
          id: string
          lga: string | null
          occupation: string | null
          organisation: string | null
          phone: string
          qualification: string | null
          ward: string | null
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          age_range?: string | null
          areas_of_interest?: string[]
          contribution?: string | null
          created_at?: string
          current_location?: string | null
          declaration?: boolean
          document_urls?: string[]
          email: string
          engagement_areas?: string[]
          full_name: string
          gender?: string | null
          id?: string
          lga?: string | null
          occupation?: string | null
          organisation?: string | null
          phone: string
          qualification?: string | null
          ward?: string | null
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          age_range?: string | null
          areas_of_interest?: string[]
          contribution?: string | null
          created_at?: string
          current_location?: string | null
          declaration?: boolean
          document_urls?: string[]
          email?: string
          engagement_areas?: string[]
          full_name?: string
          gender?: string | null
          id?: string
          lga?: string | null
          occupation?: string | null
          organisation?: string | null
          phone?: string
          qualification?: string | null
          ward?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      primaries_collation: {
        Row: {
          collation_form_url: string | null
          created_at: string
          election_date: string
          exco_date: string | null
          exco_name: string
          exco_phone: string | null
          exco_position: string
          id: string
          latitude: number | null
          lga: string | null
          longitude: number | null
          political_party: string
          position_contested: string
          remarks: string | null
          runner_up_name: string | null
          state: string
          status: Database["public"]["Enums"]["primaries_status"]
          submitted_by: string
          total_votes: number
          updated_at: string
          venue: string
          verified_at: string | null
          verified_by: string | null
          ward: string | null
          winner_name: string | null
        }
        Insert: {
          collation_form_url?: string | null
          created_at?: string
          election_date: string
          exco_date?: string | null
          exco_name: string
          exco_phone?: string | null
          exco_position: string
          id?: string
          latitude?: number | null
          lga?: string | null
          longitude?: number | null
          political_party: string
          position_contested: string
          remarks?: string | null
          runner_up_name?: string | null
          state?: string
          status?: Database["public"]["Enums"]["primaries_status"]
          submitted_by: string
          total_votes?: number
          updated_at?: string
          venue: string
          verified_at?: string | null
          verified_by?: string | null
          ward?: string | null
          winner_name?: string | null
        }
        Update: {
          collation_form_url?: string | null
          created_at?: string
          election_date?: string
          exco_date?: string | null
          exco_name?: string
          exco_phone?: string | null
          exco_position?: string
          id?: string
          latitude?: number | null
          lga?: string | null
          longitude?: number | null
          political_party?: string
          position_contested?: string
          remarks?: string | null
          runner_up_name?: string | null
          state?: string
          status?: Database["public"]["Enums"]["primaries_status"]
          submitted_by?: string
          total_votes?: number
          updated_at?: string
          venue?: string
          verified_at?: string | null
          verified_by?: string | null
          ward?: string | null
          winner_name?: string | null
        }
        Relationships: []
      }
      primaries_contestants: {
        Row: {
          created_at: string
          full_name: string
          id: string
          primaries_id: string
          sex: string
          status: Database["public"]["Enums"]["contestant_status"]
          votes: number
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          primaries_id: string
          sex: string
          status?: Database["public"]["Enums"]["contestant_status"]
          votes?: number
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          primaries_id?: string
          sex?: string
          status?: Database["public"]["Enums"]["contestant_status"]
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "primaries_contestants_primaries_id_fkey"
            columns: ["primaries_id"]
            isOneToOne: false
            referencedRelation: "primaries_collation"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agent_code: string | null
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
          agent_code?: string | null
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
          agent_code?: string | null
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
      pvc_surveys: {
        Row: {
          advice_inec: string | null
          advice_leaders: string | null
          age_range: string | null
          attempted_pvc_update: string | null
          candidate_qualities: string[] | null
          candidate_qualities_other: string | null
          created_at: string
          education: string | null
          election_concerns: string[] | null
          election_concerns_other: string | null
          electoral_confidence: string | null
          encourage_participation: string[] | null
          encourage_participation_other: string | null
          gender: string | null
          government_priority: string | null
          has_pvc: string | null
          id: string
          inec_rating: string | null
          lga: string | null
          likely_next_election: string | null
          nigeria_challenges: string[] | null
          nigeria_challenges_other: string | null
          nigeria_condition: string | null
          no_pvc_reason_other: string | null
          no_pvc_reasons: string[] | null
          not_vote_reason: string | null
          not_vote_reason_other: string | null
          occupation: string | null
          occupation_other: string | null
          optimism: string | null
          other_comments: string | null
          plateau_advice_inec: string | null
          plateau_advice_leaders: string | null
          plateau_challenges: string[] | null
          plateau_challenges_other: string | null
          plateau_condition: string | null
          plateau_government_priority: string | null
          plateau_optimism: string | null
          plateau_other_comments: string | null
          preferred_governor: string | null
          preferred_national_assembly: string | null
          preferred_party: string | null
          preferred_party_other: string | null
          preferred_president: string | null
          pvc_challenges: string[] | null
          pvc_challenges_other: string | null
          pvc_status: string | null
          reforms: string[] | null
          reforms_other: string | null
          state_of_residence: string | null
          updated_at: string
          user_id: string
          vote_influence: string | null
          voted_last_election: string | null
          willing_to_register: string | null
        }
        Insert: {
          advice_inec?: string | null
          advice_leaders?: string | null
          age_range?: string | null
          attempted_pvc_update?: string | null
          candidate_qualities?: string[] | null
          candidate_qualities_other?: string | null
          created_at?: string
          education?: string | null
          election_concerns?: string[] | null
          election_concerns_other?: string | null
          electoral_confidence?: string | null
          encourage_participation?: string[] | null
          encourage_participation_other?: string | null
          gender?: string | null
          government_priority?: string | null
          has_pvc?: string | null
          id?: string
          inec_rating?: string | null
          lga?: string | null
          likely_next_election?: string | null
          nigeria_challenges?: string[] | null
          nigeria_challenges_other?: string | null
          nigeria_condition?: string | null
          no_pvc_reason_other?: string | null
          no_pvc_reasons?: string[] | null
          not_vote_reason?: string | null
          not_vote_reason_other?: string | null
          occupation?: string | null
          occupation_other?: string | null
          optimism?: string | null
          other_comments?: string | null
          plateau_advice_inec?: string | null
          plateau_advice_leaders?: string | null
          plateau_challenges?: string[] | null
          plateau_challenges_other?: string | null
          plateau_condition?: string | null
          plateau_government_priority?: string | null
          plateau_optimism?: string | null
          plateau_other_comments?: string | null
          preferred_governor?: string | null
          preferred_national_assembly?: string | null
          preferred_party?: string | null
          preferred_party_other?: string | null
          preferred_president?: string | null
          pvc_challenges?: string[] | null
          pvc_challenges_other?: string | null
          pvc_status?: string | null
          reforms?: string[] | null
          reforms_other?: string | null
          state_of_residence?: string | null
          updated_at?: string
          user_id: string
          vote_influence?: string | null
          voted_last_election?: string | null
          willing_to_register?: string | null
        }
        Update: {
          advice_inec?: string | null
          advice_leaders?: string | null
          age_range?: string | null
          attempted_pvc_update?: string | null
          candidate_qualities?: string[] | null
          candidate_qualities_other?: string | null
          created_at?: string
          education?: string | null
          election_concerns?: string[] | null
          election_concerns_other?: string | null
          electoral_confidence?: string | null
          encourage_participation?: string[] | null
          encourage_participation_other?: string | null
          gender?: string | null
          government_priority?: string | null
          has_pvc?: string | null
          id?: string
          inec_rating?: string | null
          lga?: string | null
          likely_next_election?: string | null
          nigeria_challenges?: string[] | null
          nigeria_challenges_other?: string | null
          nigeria_condition?: string | null
          no_pvc_reason_other?: string | null
          no_pvc_reasons?: string[] | null
          not_vote_reason?: string | null
          not_vote_reason_other?: string | null
          occupation?: string | null
          occupation_other?: string | null
          optimism?: string | null
          other_comments?: string | null
          plateau_advice_inec?: string | null
          plateau_advice_leaders?: string | null
          plateau_challenges?: string[] | null
          plateau_challenges_other?: string | null
          plateau_condition?: string | null
          plateau_government_priority?: string | null
          plateau_optimism?: string | null
          plateau_other_comments?: string | null
          preferred_governor?: string | null
          preferred_national_assembly?: string | null
          preferred_party?: string | null
          preferred_party_other?: string | null
          preferred_president?: string | null
          pvc_challenges?: string[] | null
          pvc_challenges_other?: string | null
          pvc_status?: string | null
          reforms?: string[] | null
          reforms_other?: string | null
          state_of_residence?: string | null
          updated_at?: string
          user_id?: string
          vote_influence?: string | null
          voted_last_election?: string | null
          willing_to_register?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          allowed: boolean
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allowed?: boolean
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allowed?: boolean
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
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
      situation_chat_messages: {
        Row: {
          attachment_url: string | null
          author_id: string
          channel: string
          content: string
          created_at: string
          id: string
          is_broadcast: boolean
        }
        Insert: {
          attachment_url?: string | null
          author_id: string
          channel?: string
          content: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
        }
        Update: {
          attachment_url?: string | null
          author_id?: string
          channel?: string
          content?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
        }
        Relationships: []
      }
      situation_post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: []
      }
      situation_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      situation_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          location: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      situation_updates: {
        Row: {
          attachment_url: string | null
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
          attachment_url?: string | null
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
          attachment_url?: string | null
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
      system_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
      visitor_sessions: {
        Row: {
          created_at: string
          first_referrer: string | null
          first_seen_at: string
          first_utm_campaign: string | null
          first_utm_source: string | null
          id: string
          last_browser: string | null
          last_city: string | null
          last_country: string | null
          last_device_type: string | null
          last_ip: string | null
          last_latitude: number | null
          last_longitude: number | null
          last_os: string | null
          last_seen_at: string
          updated_at: string
          user_id: string | null
          visit_count: number
          visitor_id: string
        }
        Insert: {
          created_at?: string
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_campaign?: string | null
          first_utm_source?: string | null
          id?: string
          last_browser?: string | null
          last_city?: string | null
          last_country?: string | null
          last_device_type?: string | null
          last_ip?: string | null
          last_latitude?: number | null
          last_longitude?: number | null
          last_os?: string | null
          last_seen_at?: string
          updated_at?: string
          user_id?: string | null
          visit_count?: number
          visitor_id: string
        }
        Update: {
          created_at?: string
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_campaign?: string | null
          first_utm_source?: string | null
          id?: string
          last_browser?: string | null
          last_city?: string | null
          last_country?: string | null
          last_device_type?: string | null
          last_ip?: string | null
          last_latitude?: number | null
          last_longitude?: number | null
          last_os?: string | null
          last_seen_at?: string
          updated_at?: string
          user_id?: string | null
          visit_count?: number
          visitor_id?: string
        }
        Relationships: []
      }
      volunteer_registrations: {
        Row: {
          availability_areas: string[]
          availability_hours_per_week: number | null
          availability_other: string | null
          candidates_supporting: string | null
          created_at: string
          declaration_date: string
          declaration_signature: string
          email: string
          full_name: string
          id: string
          lga: string
          motivation: string | null
          phone: string
          previous_experience: string | null
          relevant_skills: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          skills: string[]
          skills_other: string | null
          status: string
          support_group_active_members: number | null
          support_group_name: string | null
          support_group_objectives: string | null
          updated_at: string
          user_id: string | null
          ward: string | null
        }
        Insert: {
          availability_areas?: string[]
          availability_hours_per_week?: number | null
          availability_other?: string | null
          candidates_supporting?: string | null
          created_at?: string
          declaration_date?: string
          declaration_signature: string
          email: string
          full_name: string
          id?: string
          lga: string
          motivation?: string | null
          phone: string
          previous_experience?: string | null
          relevant_skills?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skills?: string[]
          skills_other?: string | null
          status?: string
          support_group_active_members?: number | null
          support_group_name?: string | null
          support_group_objectives?: string | null
          updated_at?: string
          user_id?: string | null
          ward?: string | null
        }
        Update: {
          availability_areas?: string[]
          availability_hours_per_week?: number | null
          availability_other?: string | null
          candidates_supporting?: string | null
          created_at?: string
          declaration_date?: string
          declaration_signature?: string
          email?: string
          full_name?: string
          id?: string
          lga?: string
          motivation?: string | null
          phone?: string
          previous_experience?: string | null
          relevant_skills?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skills?: string[]
          skills_other?: string | null
          status?: string
          support_group_active_members?: number | null
          support_group_name?: string | null
          support_group_objectives?: string | null
          updated_at?: string
          user_id?: string | null
          ward?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_agent_code: { Args: never; Returns: string }
      get_public_stats: {
        Args: never
        Returns: {
          total_agents: number
          total_events: number
          total_members: number
        }[]
      }
      get_situation_like_counts: {
        Args: { _post_ids: string[] }
        Returns: {
          like_count: number
          post_id: string
        }[]
      }
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
      contestant_status: "verified" | "not_verified"
      election_report_status: "pending" | "flagged" | "verified" | "rejected"
      election_type:
        | "presidential"
        | "gubernatorial"
        | "senate"
        | "house_of_reps"
        | "house_of_assembly"
        | "councillor"
        | "chairman"
        | "party_primary"
      primaries_status: "pending" | "verified" | "not_verified"
      recruitment_status: "pending" | "approved" | "rejected" | "shortlisted"
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
      contestant_status: ["verified", "not_verified"],
      election_report_status: ["pending", "flagged", "verified", "rejected"],
      election_type: [
        "presidential",
        "gubernatorial",
        "senate",
        "house_of_reps",
        "house_of_assembly",
        "councillor",
        "chairman",
        "party_primary",
      ],
      primaries_status: ["pending", "verified", "not_verified"],
      recruitment_status: ["pending", "approved", "rejected", "shortlisted"],
    },
  },
} as const
