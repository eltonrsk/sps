export type UserRole = 'admin' | 'parent' | 'teacher' | 'security';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone_number: string | null;
          email: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role: UserRole;
          full_name: string;
          phone_number?: string | null;
          email: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone_number?: string | null;
          email?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          grade: string;
          class_name: string | null;
          photo_url: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          grade: string;
          class_name?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          grade?: string;
          class_name?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guardians: {
        Row: {
          id: string;
          user_id: string;
          student_id: string;
          relationship: string;
          is_authorized: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          student_id: string;
          relationship: string;
          is_authorized?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          student_id?: string;
          relationship?: string;
          is_authorized?: boolean;
          created_at?: string;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          user_id: string;
          student_id: string | null;
          code: string;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          last_used_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          student_id?: string | null;
          code: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          student_id?: string | null;
          code?: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          last_used_at?: string | null;
        };
      };
      pickups: {
        Row: {
          id: string;
          student_id: string;
          picked_by_user_id: string;
          verified_by_user_id: string;
          qr_code_id: string | null;
          pickup_time: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          picked_by_user_id: string;
          verified_by_user_id: string;
          qr_code_id?: string | null;
          pickup_time?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          picked_by_user_id?: string;
          verified_by_user_id?: string;
          qr_code_id?: string | null;
          pickup_time?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
