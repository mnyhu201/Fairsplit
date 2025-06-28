export interface User {
  id: string; // UUID from Supabase Auth
  username: string;
  fullname: string | null;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Public user information - safe to expose to anyone
export interface PublicUserInfo {
  id: string;
  username: string;
  fullname: string | null;
  is_active: boolean;
}

export interface CreateUserRequest {
  username: string;
  fullname?: string;
  amount?: number;
}

export interface UpdateUserRequest {
  username?: string;
  fullname?: string;
  amount?: number;
}

export interface UserBalanceUpdate {
  amount: number;
}

export interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Database table structure for users
export interface UserTable {
  id: string; // References auth.users.id (UUID)
  username: string;
  fullname: string | null;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 