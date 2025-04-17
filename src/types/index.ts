import { Database } from './database';

// 从数据库类型中提取表行类型
export type ApiToken = Database['public']['Tables']['api_tokens']['Row'];
export type ApiTokenInsert = Database['public']['Tables']['api_tokens']['Insert'];
export type ApiTokenUpdate = Database['public']['Tables']['api_tokens']['Update'];

export type ApiLog = Database['public']['Tables']['api_logs']['Row'];
export type ApiLogInsert = Database['public']['Tables']['api_logs']['Insert'];
export type ApiLogUpdate = Database['public']['Tables']['api_logs']['Update'];

export type InviteCode = Database['public']['Tables']['invite_codes']['Row'];
export type InviteCodeInsert = Database['public']['Tables']['invite_codes']['Insert'];
export type InviteCodeUpdate = Database['public']['Tables']['invite_codes']['Update'];

export type VerificationRequest = Database['public']['Tables']['verification_requests']['Row'];
export type VerificationRequestInsert = Database['public']['Tables']['verification_requests']['Insert'];
export type VerificationRequestUpdate = Database['public']['Tables']['verification_requests']['Update'];

export type Admin = Database['public']['Tables']['admins']['Row'];
export type AdminInsert = Database['public']['Tables']['admins']['Insert'];
export type AdminUpdate = Database['public']['Tables']['admins']['Update'];

// 扩展类型
export type ApiLogWithToken = ApiLog & {
  api_tokens: {
    user_email: string;
  };
};

// 统计类型
export interface ApiUsageStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byEndpoint: Record<string, number>;
}

export interface TokenStats {
  total: number;
  active: number;
  expired: number;
  byUser: Record<string, number>;
}

// 应用状态类型
export interface UserSession {
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
  } | null;
  loading: boolean;
}

// 表单类型
export interface TokenFormData {
  name: string;
  description?: string;
  expiresAt?: string;
}

export interface InviteCodeFormData {
  code?: string;
  description?: string;
  expiresAt?: string;
}

export interface VerificationFormData {
  email: string;
  inviteCode: string;
}
