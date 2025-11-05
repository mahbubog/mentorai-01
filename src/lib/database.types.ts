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
      instructors: {
        Row: {
          id: string
          name: string
          bio: string | null
          photo: string | null
          credentials: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          bio?: string | null
          photo?: string | null
          credentials?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          bio?: string | null
          photo?: string | null
          credentials?: string | null
          created_at?: string
        }
      }
      course_categories: {
        Row: {
          id: string
          name: string
          slug: string
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          display_order?: number | null
          created_at?: string
        }
      }
      course_categories_mapping: {
        Row: {
          course_id: string
          category_id: string
        }
        Insert: {
          course_id: string
          category_id: string
        }
        Update: {
          course_id?: string
          category_id?: string
        }
      }
      course_requirements: {
        Row: {
          id: string
          course_id: string
          requirement: string
          display_order: number | null
        }
        Insert: {
          id?: string
          course_id: string
          requirement: string
          display_order?: number | null
        }
        Update: {
          id?: string
          course_id?: string
          requirement?: string
          display_order?: number | null
        }
      }
      course_learning_outcomes: {
        Row: {
          id: string
          course_id: string
          outcome: string
          display_order: number | null
        }
        Insert: {
          id?: string
          course_id: string
          outcome: string
          display_order?: number | null
        }
        Update: {
          id?: string
          course_id?: string
          outcome?: string
          display_order?: number | null
        }
      }
      course_sections: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          display_order?: number | null
          created_at?: string
        }
      }
      course_lessons: {
        Row: {
          id: string
          section_id: string
          title: string
          description: string | null
          video_url: string
          duration: string | null
          is_preview: boolean | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          title: string
          description?: string | null
          video_url: string
          duration?: string | null
          is_preview?: boolean | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          title?: string
          description?: string | null
          video_url?: string
          duration?: string | null
          is_preview?: boolean | null
          display_order?: number | null
          created_at?: string
        }
      }
      lesson_resources: {
        Row: {
          id: string
          lesson_id: string
          title: string
          file_url: string
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          file_url: string
          file_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          file_url?: string
          file_type?: string | null
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
          meta_title: string | null // Added
          meta_description: string | null // Added
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
          meta_title?: string | null // Added
          meta_description?: string | null // Added
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
          meta_title?: string | null // Added
          meta_description?: string | null // Added
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
      user_notes: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          note_content: string
          timestamp_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          note_content: string
          timestamp_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          note_content?: string
          timestamp_seconds?: number | null
          created_at?: string
          updated_at?: string
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
export type NotificationsUpdate = Database['public']['Tables']['notifications']['Update']; // Corrected export
export type CoursesUpdate = Database['public']['Tables']['courses']['Update'];
export type LessonProgressInsert = Database['public']['Tables']['lesson_progress']['Insert'];
export type ProfilesUpdate = Database['public']['Tables']['profiles']['Update'];
export type UserNotesInsert = Database['public']['Tables']['user_notes']['Insert'];
export type UserNotesUpdate = Database['public']['Tables']['user_notes']['Update'];

export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type LessonProgressRow = Database['public']['Tables']['lesson_progress']['Row'];
export type UserNoteRow = Database['public']['Tables']['user_notes']['Row'];

// New types for admin course form
export type InstructorRow = Database['public']['Tables']['instructors']['Row'];
export type InstructorsInsert = Database['public']['Tables']['instructors']['Insert'];
export type InstructorsUpdate = Database['public']['Tables']['instructors']['Update'];

export type CourseCategoryRow = Database['public']['Tables']['course_categories']['Row'];
export type CourseCategoryInsert = Database['public']['Tables']['course_categories']['Insert'];
export type CourseCategoryUpdate = Database['public']['Tables']['course_categories']['Update'];

export type CourseCategoriesMappingRow = Database['public']['Tables']['course_categories_mapping']['Row'];
export type CourseCategoriesMappingInsert = Database['public']['Tables']['course_categories_mapping']['Insert'];
export type CourseCategoriesMappingUpdate = Database['public']['Tables']['course_categories_mapping']['Update'];

export type CourseRequirementRow = Database['public']['Tables']['course_requirements']['Row'];
export type CourseRequirementInsert = Database['public']['Tables']['course_requirements']['Insert'];
export type CourseRequirementUpdate = Database['public']['Tables']['course_requirements']['Update'];

export type CourseLearningOutcomeRow = Database['public']['Tables']['course_learning_outcomes']['Row'];
export type CourseLearningOutcomeInsert = Database['public']['Tables']['course_learning_outcomes']['Insert'];
export type CourseLearningOutcomeUpdate = Database['public']['Tables']['course_learning_outcomes']['Update'];

export type CourseSectionRow = Database['public']['Tables']['course_sections']['Row'];
export type CourseSectionInsert = Database['public']['Tables']['course_sections']['Insert'];
export type CourseSectionUpdate = Database['public']['Tables']['course_sections']['Update'];

export type CourseLessonRow = Database['public']['Tables']['course_lessons']['Row'];
export type CourseLessonInsert = Database['public']['Tables']['course_lessons']['Insert'];
export type CourseLessonUpdate = Database['public']['Tables']['course_lessons']['Update'];

export type LessonResourceRow = Database['public']['Tables']['lesson_resources']['Row'];
export type LessonResourceInsert = Database['public']['Tables']['lesson_resources']['Insert'];
export type LessonResourceUpdate = Database['public']['Tables']['lesson_resources']['Update'];