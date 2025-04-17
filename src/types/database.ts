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
      api_logs: {
        Row: {
          id: string
          token_id: string
          endpoint: string
          tool_name: string | null
          ip_address: string | null
          user_agent: string | null
          request_time: string
          response_time: string | null
          status: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          token_id: string
          endpoint: string
          tool_name?: string | null
          ip_address?: string | null
          user_agent?: string | null
          request_time?: string
          response_time?: string | null
          status?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          token_id?: string
          endpoint?: string
          tool_name?: string | null
          ip_address?: string | null
          user_agent?: string | null
          request_time?: string
          response_time?: string | null
          status?: string | null
          error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_token_id_fkey"
            columns: ["token_id"]
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          }
        ]
      }
      api_tokens: {
        Row: {
          id: string
          token: string
          user_email: string
          invite_code_id: string | null
          created_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          token: string
          user_email: string
          invite_code_id?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          token?: string
          user_email?: string
          invite_code_id?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          id: string
          code: string
          created_by: string
          is_used: boolean
          created_at: string
          expires_at: string | null
          used_at: string | null
          used_by: string | null
          description: string | null
        }
        Insert: {
          id?: string
          code: string
          created_by: string
          is_used?: boolean
          created_at?: string
          expires_at?: string | null
          used_at?: string | null
          used_by?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          code?: string
          created_by?: string
          is_used?: boolean
          created_at?: string
          expires_at?: string | null
          used_at?: string | null
          used_by?: string | null
          description?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          id: string
          email: string
          token: string
          invite_code_id: string
          is_verified: boolean
          created_at: string
          expires_at: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          email: string
          token: string
          invite_code_id: string
          is_verified?: boolean
          created_at?: string
          expires_at: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          token?: string
          invite_code_id?: string
          is_verified?: boolean
          created_at?: string
          expires_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_invite_code_id_fkey"
            columns: ["invite_code_id"]
            referencedRelation: "invite_codes"
            referencedColumns: ["id"]
          }
        ]
      }
      admins: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
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
