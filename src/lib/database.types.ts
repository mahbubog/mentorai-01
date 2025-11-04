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
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          profile_photo: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          profile_photo?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          profile_photo?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: 'super_admin' | 'admin' | 'content_manager'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'super_admin' | 'admin' | 'content_manager'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'super_admin' | 'admin' | 'content_manager'
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          short_description: string | null
          full_description: string | null
          thumbnail: string | null
          preview_video: string | null
          course_type: 'live' | 'recorded'
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          language: string
          price: number
          discount_price: number | null
          duration: string | null
          instructor_id: string | null
          status: 'draft' | 'published'
          is_featured: boolean
          max_students: number | null
          start_date: string | null
          end_date: string | null
          meeting_link: string | null
          includes_certificate: boolean
          includes_lifetime_access: boolean
          includes_resources: boolean
          includes_mobile_access: boolean
          includes_qa_support: boolean
          rating: number
          review_count: number
          enrolled_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          short_description?: string | null
          full_description?: string | null
          thumbnail?: string | null
          preview_video?: string | null
          course_type: 'live' | 'recorded'
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          language?: string
          price: number
          discount_price?: number | null
          duration?: string | null
          instructor_id?: string | null
          status?: 'draft' | 'published'
          is_featured?: boolean
          max_students?: number | null
          start_date?: string | null
          end_date?: string | null
          meeting_link?: string | null
          includes_certificate?: boolean
          includes_lifetime_access?: boolean
          includes_resources?: boolean
          includes_mobile_access?: boolean
          includes_qa_support?: boolean
          rating?: number
          review_count?: number
          enrolled_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          short_description?: string | null
          full_description?: string | null
          thumbnail?: string | null
          preview_video?: string | null
          course_type?: 'live' | 'recorded'
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          language?: string
          price?: number
          discount_price?: number | null
          duration?: string | null
          instructor_id?: string | null
          status?: 'draft' | 'published'
          is_featured?: boolean
          max_students?: number | null
          start_date?: string | null
          end_date?: string | null
          meeting_link?: string | null
          includes_certificate?: boolean
          includes_lifetime_access?: boolean
          includes_resources?: boolean
          includes_mobile_access?: boolean
          includes_qa_support?: boolean
          rating?: number
          review_count?: number
          enrolled_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          amount: number
          payment_method: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'other'
          payment_number: string
          transaction_id: string
          payment_screenshot: string | null
          billing_name: string
          billing_email: string
          billing_phone: string
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          admin_notes: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          amount: number
          payment_method: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'other'
          payment_number: string
          transaction_id: string
          payment_screenshot?: string | null
          billing_name: string
          billing_email: string
          billing_phone: string
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          admin_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          amount?: number
          payment_method?: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'other'
          payment_number?: string
          transaction_id?: string
          payment_screenshot?: string | null
          billing_name?: string
          billing_email?: string
          billing_phone?: string
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          admin_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          payment_id: string
          enrolled_at: string
          completed_at: string | null
          progress_percentage: number
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          payment_id: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          payment_id?: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'payment' | 'course' | 'admin_message' | 'system'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'payment' | 'course' | 'admin_message' | 'system'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'payment' | 'course' | 'admin_message' | 'system'
          is_read?: boolean
          created_at?: string
        }
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
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
  }
}

export type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];
export type PaymentsInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentsUpdate = Database['public']['Tables']['payments']['Update'];
export type EnrollmentsInsert = Database['public']['Tables']['enrollments']['Insert'];
export type NotificationsInsert = Database['public']['Tables']['notifications']['Insert'];
export type CoursesUpdate = Database['public']['Tables']['courses']['Update'];
export type LessonProgressInsert = Database['public']['Tables']['lesson_progress']['Insert'];
export type ProfilesUpdate = Database['public']['Tables']['profiles']['Update'];

export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type LessonProgressRow = Database['public']['Tables']['lesson_progress']['Row'];