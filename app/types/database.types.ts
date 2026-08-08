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
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: number
          org_id: string | null
          path: string
          referrer_domain: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          event_name?: string
          id?: never
          org_id?: string | null
          path: string
          referrer_domain?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: never
          org_id?: string | null
          path?: string
          referrer_domain?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_events_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      content_items: {
        Row: {
          author_id: string
          body: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          is_premium: boolean
          media_url: string | null
          org_id: string
          published_at: string | null
          slug: string
          status: Database['public']['Enums']['content_status']
          summary: string | null
          title: string
          type: Database['public']['Enums']['content_type']
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          media_url?: string | null
          org_id: string
          published_at?: string | null
          slug: string
          status?: Database['public']['Enums']['content_status']
          summary?: string | null
          title: string
          type: Database['public']['Enums']['content_type']
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          media_url?: string | null
          org_id?: string
          published_at?: string | null
          slug?: string
          status?: Database['public']['Enums']['content_status']
          summary?: string | null
          title?: string
          type?: Database['public']['Enums']['content_type']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'content_items_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'content_items_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database['public']['Enums']['org_role']
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: Database['public']['Enums']['org_role']
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database['public']['Enums']['org_role']
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invites_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'invites_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          invited_email: string | null
          org_id: string
          role: Database['public']['Enums']['org_role']
          status: Database['public']['Enums']['membership_status']
          user_id: string
        }
        Insert: {
          created_at?: string
          invited_email?: string | null
          org_id: string
          role?: Database['public']['Enums']['org_role']
          status?: Database['public']['Enums']['membership_status']
          user_id: string
        }
        Update: {
          created_at?: string
          invited_email?: string | null
          org_id?: string
          role?: Database['public']['Enums']['org_role']
          status?: Database['public']['Enums']['membership_status']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memberships_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'memberships_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      premium_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          org_id: string
          status: Database['public']['Enums']['subscription_status']
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id: string
          status?: Database['public']['Enums']['subscription_status']
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id?: string
          status?: Database['public']['Enums']['subscription_status']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'premium_subscriptions_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'premium_subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_platform_admin: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_platform_admin?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_platform_admin?: boolean
        }
        Relationships: []
      }
      reports: {
        Row: {
          content_id: string | null
          created_at: string
          details: string | null
          flagged_url: string | null
          id: string
          org_id: string | null
          reason: Database['public']['Enums']['report_reason']
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database['public']['Enums']['report_status']
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          details?: string | null
          flagged_url?: string | null
          id?: string
          org_id?: string | null
          reason: Database['public']['Enums']['report_reason']
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database['public']['Enums']['report_status']
        }
        Update: {
          content_id?: string | null
          created_at?: string
          details?: string | null
          flagged_url?: string | null
          id?: string
          org_id?: string | null
          reason?: Database['public']['Enums']['report_reason']
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database['public']['Enums']['report_status']
        }
        Relationships: [
          {
            foreignKeyName: 'reports_content_id_fkey'
            columns: ['content_id']
            isOneToOne: false
            referencedRelation: 'content_items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          invited_email: string | null
          org_id: string
          role: Database['public']['Enums']['org_role']
          status: Database['public']['Enums']['membership_status']
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'memberships'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_organization: {
        Args: { p_name: string, p_slug: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        SetofOptions: {
          from: '*'
          to: 'organizations'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_invite_preview: {
        Args: { p_token: string }
        Returns: {
          invited_email: string
          is_accepted: boolean
          is_expired: boolean
          org_name: string
          role: Database['public']['Enums']['org_role']
        }[]
      }
      get_published_content: {
        Args: { p_org_slug: string, p_slug: string }
        Returns: {
          cover_image_url: string
          id: string
          is_premium: boolean
          locked: boolean
          org_id: string
          org_name: string
          org_slug: string
          published_at: string
          slug: string
          summary: string
          title: string
          type: Database['public']['Enums']['content_type']
        }[]
      }
      has_premium_access: { Args: { target_org: string }, Returns: boolean }
      is_org_manager: { Args: { target_org: string }, Returns: boolean }
      is_org_member: { Args: { target_org: string }, Returns: boolean }
      is_platform_admin: { Args: never, Returns: boolean }
      list_published_content: {
        Args: {
          p_org_slug?: string
          p_type?: Database['public']['Enums']['content_type']
        }
        Returns: {
          cover_image_url: string
          id: string
          is_premium: boolean
          locked: boolean
          org_id: string
          org_name: string
          org_slug: string
          published_at: string
          slug: string
          summary: string
          title: string
          type: Database['public']['Enums']['content_type']
        }[]
      }
      org_role: {
        Args: { target_org: string }
        Returns: Database['public']['Enums']['org_role']
      }
      set_platform_admin: {
        Args: { make_admin: boolean, target_user: string }
        Returns: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_platform_admin: boolean
        }
        SetofOptions: {
          from: '*'
          to: 'profiles'
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      content_status: 'draft' | 'published' | 'archived'
      content_type: 'article' | 'video' | 'audio'
      membership_status: 'invited' | 'active' | 'removed'
      org_role: 'owner' | 'manager' | 'member'
      report_reason:
        | 'spam'
        | 'abuse'
        | 'copyright'
        | 'broken_link'
        | 'misinformation'
        | 'other'
      report_status: 'open' | 'reviewing' | 'resolved' | 'dismissed'
      subscription_status: 'active' | 'canceled' | 'past_due'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
    DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_status: ['draft', 'published', 'archived'],
      content_type: ['article', 'video', 'audio'],
      membership_status: ['invited', 'active', 'removed'],
      org_role: ['owner', 'manager', 'member'],
      report_reason: [
        'spam',
        'abuse',
        'copyright',
        'broken_link',
        'misinformation',
        'other',
      ],
      report_status: ['open', 'reviewing', 'resolved', 'dismissed'],
      subscription_status: ['active', 'canceled', 'past_due'],
    },
  },
} as const
