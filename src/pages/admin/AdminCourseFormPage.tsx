import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { CourseForm } from '../../components/admin/courses/CourseForm';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  CourseRow, CourseCategoriesMappingInsert, CourseRequirementInsert, CourseLearningOutcomeInsert,
  CourseSectionInsert, CourseLessonInsert, LessonResourceInsert,
  CoursesUpdate, CourseSectionUpdate, CourseLessonUpdate, LessonResourceUpdate,
  InstructorsInsert, InstructorsUpdate
} from '../../lib/database.types';

// Define extended types for the form data
export interface LessonFormData {
  id?: string;
  title: string;
  description: string | null;
  video_url: string;
  duration: string | null;
  is_preview: boolean;
  display_order: number;
  resources: { id?: string; title: string; file_url: string; file_type: string | null; file?: File }[];
}

export interface SectionFormData {
  id?: string;
  title: string;
  description: string | null;
  display_order: number;
  lessons: LessonFormData[];
}

export interface CourseFormData extends Omit<CourseRow, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'enrolled_count' | 'meta_title' | 'meta_description'> {
  id?: string;
  category_ids: string[];
  requirements: { id?: string; requirement: string; display_order: number }[];
  learning_outcomes: { id?: string; outcome: string; display_order: number }[];
  sections: SectionFormData[];
  meta_title: string | null;
  meta_description: string | null;
  thumbnail_file?: File;
  preview_video_file?: File;
  instructor_name?: string | null; // For new instructor creation
  instructor_bio?: string | null;
  instructor_photo?: File;
  instructor_credentials?: string | null;
}

// Type for the data fetched from Supabase for editing
type CourseFetchData = CourseRow & {
  course_categories_mapping: { category_id: string }[];
  course_requirements: { id: string; requirement: string; display_order: number }[];
  course_learning_outcomes: { id: string; outcome: string; display_order: number }[];
  course_sections: (CourseSectionUpdate & {
    course_lessons: (CourseLessonUpdate & {
      lesson_resources: LessonResourceUpdate[];
    })[];
  })[];
};

const initialCourseState: CourseFormData = {
  title: '',
  slug: '',
  short_description: null,
  full_description: null,
  thumbnail: null,
  preview_video: null,
  course_type: 'recorded',
  difficulty_level: 'beginner',
  language: 'English',
  price: 0,
  discount_price: null,
  duration: null,
  instructor_id: null,
  status: 'draft',
  is_featured: false,
  max_students: null,
  start_date: null,
  end_date: null,
  meeting_link: null,
  includes_certificate: true,
  includes_lifetime_access: true,
  includes_resources: true,
  includes_mobile_access: true,
  includes_qa_support: true,
  category_ids: [],
  requirements: [],
  learning_outcomes: [],
  sections: [],
  meta_title: null,
  meta_description: null,
};

export function AdminCourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CourseFormData>(initialCourseState);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id]);

  const loadCourse = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories_mapping (category_id),
          course_requirements (id, requirement, display_order),
          course_learning_outcomes (id, outcome, display_order),
          course_sections (
            id, title, description, display_order,
            course_lessons (
              id, title, description, video_url, duration, is_preview, display_order,
              lesson_resources (id, title, file_url, file_type)
            )
          )
        `)
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!course) {
        setError('Course not found.');
        setLoading(false);
        return;
      }

      const typedCourse = course as CourseFetchData;

      const loadedCourse: CourseFormData = {
        ...typedCourse,
        price: Number(typedCourse.price),
        discount_price: typedCourse.discount_price ? Number(typedCourse.discount_price) : null,
        category_ids: typedCourse.course_categories_mapping.map(c => c.category_id),
        requirements: typedCourse.course_requirements.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        learning_outcomes: typedCourse.course_learning_outcomes.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        sections: typedCourse.course_sections
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(section => ({
            ...section,
            lessons: section.course_lessons
              .sort((a: CourseLessonUpdate, b: CourseLessonUpdate) => (a.display_order || 0) - (b.display_order || 0))
              .map((lesson: CourseLessonUpdate) => ({
                ...lesson,
                resources: lesson.lesson_resources || [],
              })),
          })),
        meta_title: typedCourse.meta_title || null,
        meta_description: typedCourse.meta_description || null,
      };
      setCourseData(loadedCourse);
    } catch (err: any) {
      console.error('Error loading course:', err);
      setError('Failed to load course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw new Error(`Failed to upload ${folder} file: ` + uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (formData: CourseFormData, publish: boolean) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      let currentCourseId = formData.id;
      let instructorId = formData.instructor_id;

      // 1. Handle new instructor creation
      if (!instructorId && formData.instructor_name) {
        const instructorPayload: InstructorsInsert = {
          name: formData.instructor_name,
          bio: formData.instructor_bio,
          credentials: formData.instructor_credentials,
          photo: formData.instructor_photo ? await uploadFile(formData.instructor_photo, 'course_assets', 'instructor_photos') : null,
        };
        const { data: newInstructor, error: instructorError } = await supabase
          .from('instructors')
          .insert(instructorPayload)
          .select('id')
          .single();

        if (instructorError) throw instructorError;
        instructorId = newInstructor.id;
      }

      // 2. Upload thumbnail and preview video if new files are provided
      let thumbnailUrl = formData.thumbnail;
      if (formData.thumbnail_file) {
        thumbnailUrl = await uploadFile(formData.thumbnail_file, 'course_assets', 'thumbnails');
      }

      let previewVideoUrl = formData.preview_video;
      if (formData.preview_video_file) {
        previewVideoUrl = await uploadFile(formData.preview_video_file, 'course_assets', 'preview_videos');
      }

      const coursePayload: Omit<CoursesUpdate, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'enrolled_count'> = {
        title: formData.title,
        slug: formData.slug,
        short_description: formData.short_description,
        full_description: formData.full_description,
        thumbnail: thumbnailUrl,
        preview_video: previewVideoUrl,
        course_type: formData.course_type,
        difficulty_level: formData.difficulty_level,
        language: formData.language,
        price: formData.price,
        discount_price: formData.discount_price,
        duration: formData.duration,
        instructor_id: instructorId,
        status: publish ? 'published' : 'draft',
        is_featured: formData.is_featured,
        max_students: formData.max_students,
        start_date: formData.start_date,
        end_date: formData.end_date,
        meeting_link: formData.meeting_link,
        includes_certificate: formData.includes_certificate,
        includes_lifetime_access: formData.includes_lifetime_access,
        includes_resources: formData.includes_resources,
        includes_mobile_access: formData.includes_mobile_access,
        includes_qa_support: formData.includes_qa_support,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      };

      // 3. Insert or Update Course
      if (currentCourseId) {
        const { error: updateError } = await supabase
          .from('courses')
          .update(coursePayload)
          .eq('id', currentCourseId);
        if (updateError) throw updateError;
      } else {
        const { data: newCourse, error: insertError } = await supabase
          .from('courses')
          .insert(coursePayload as CourseRow) // Cast to CourseRow for insert
          .select('id')
          .single();
        if (insertError) throw insertError;
        currentCourseId = newCourse.id;
      }

      if (!currentCourseId) throw new Error('Course ID not available after save.');

      // 4. Handle Categories (delete existing, insert new)
      await supabase.from('course_categories_mapping').delete().eq('course_id', currentCourseId);
      if (formData.category_ids.length > 0) {
        const categoryMappings: CourseCategoriesMappingInsert[] = formData.category_ids.map(catId => ({
          course_id: currentCourseId!,
          category_id: catId,
        }));
        const { error: categoryError } = await supabase.from('course_categories_mapping').insert(categoryMappings);
        if (categoryError) throw categoryError;
      }

      // 5. Handle Requirements (delete existing, insert new)
      await supabase.from('course_requirements').delete().eq('course_id', currentCourseId);
      if (formData.requirements.length > 0) {
        const requirementsPayload: CourseRequirementInsert[] = formData.requirements.map((req, index) => ({
          course_id: currentCourseId!,
          requirement: req.requirement,
          display_order: index,
        }));
        const { error: reqError } = await supabase.from('course_requirements').insert(requirementsPayload);
        if (reqError) throw reqError;
      }

      // 6. Handle Learning Outcomes (delete existing, insert new)
      await supabase.from('course_learning_outcomes').delete().eq('course_id', currentCourseId);
      if (formData.learning_outcomes.length > 0) {
        const outcomesPayload: CourseLearningOutcomeInsert[] = formData.learning_outcomes.map((out, index) => ({
          course_id: currentCourseId!,
          outcome: out.outcome,
          display_order: index,
        }));
        const { error: outError } = await supabase.from('course_learning_outcomes').insert(outcomesPayload);
        if (outError) throw outError;
      }

      // 7. Handle Curriculum (Sections, Lessons, Resources)
      if (formData.course_type === 'recorded') {
        // Delete old sections/lessons/resources not present in new data
        const existingSections = (await supabase.from('course_sections').select('id').eq('course_id', currentCourseId)).data?.map(s => s.id) || [];
        const sectionsToDelete = existingSections.filter(id => !formData.sections.some(s => s.id === id));
        if (sectionsToDelete.length > 0) {
          await supabase.from('course_sections').delete().in('id', sectionsToDelete);
        }

        for (const section of formData.sections) {
          let currentSectionId = section.id;
          const sectionPayload: Omit<CourseSectionUpdate, 'id' | 'created_at'> = {
            course_id: currentCourseId!,
            title: section.title,
            description: section.description,
            display_order: section.display_order,
          };

          if (currentSectionId) {
            const { error: updateError } = await supabase
              .from('course_sections')
              .update(sectionPayload)
              .eq('id', currentSectionId);
            if (updateError) throw updateError;
          } else {
            const { data: newSection, error: insertError } = await supabase
              .from('course_sections')
              .insert(sectionPayload as CourseSectionInsert) // Cast for insert
              .select('id')
              .single();
            if (insertError) throw insertError;
            currentSectionId = newSection.id;
          }

          if (!currentSectionId) throw new Error('Section ID not available after save.');

          // Delete old lessons/resources not present in new data
          const existingLessons = (await supabase.from('course_lessons').select('id').eq('section_id', currentSectionId)).data?.map(l => l.id) || [];
          const lessonsToDelete = existingLessons.filter(id => !section.lessons.some(l => l.id === id));
          if (lessonsToDelete.length > 0) {
            await supabase.from('course_lessons').delete().in('id', lessonsToDelete);
          }

          for (const lesson of section.lessons) {
            let currentLessonId = lesson.id;
            const lessonPayload: Omit<CourseLessonUpdate, 'id' | 'created_at'> = {
              section_id: currentSectionId!,
              title: lesson.title,
              description: lesson.description,
              video_url: lesson.video_url,
              duration: lesson.duration,
              is_preview: lesson.is_preview,
              display_order: lesson.display_order,
            };

            if (currentLessonId) {
              const { error: updateError } = await supabase
                .from('course_lessons')
                .update(lessonPayload)
                .eq('id', currentLessonId);
              if (updateError) throw updateError;
            } else {
              const { data: newLesson, error: insertError } = await supabase
                .from('course_lessons')
                .insert(lessonPayload as CourseLessonInsert) // Cast for insert
                .select('id')
                .single();
              if (insertError) throw insertError;
              currentLessonId = newLesson.id;
            }

            if (!currentLessonId) throw new Error('Lesson ID not available after save.');

            // Delete old resources not present in new data
            const existingResources = (await supabase.from('lesson_resources').select('id').eq('lesson_id', currentLessonId)).data?.map(r => r.id) || [];
            const resourcesToDelete = existingResources.filter(id => !lesson.resources.some(r => r.id === id));
            if (resourcesToDelete.length > 0) {
              await supabase.from('lesson_resources').delete().in('id', resourcesToDelete);
            }

            for (const resource of lesson.resources) {
              let resourceUrl = resource.file_url;
              if (resource.file) {
                resourceUrl = await uploadFile(resource.file, 'course_assets', 'lesson_resources');
              }

              const resourcePayload: Omit<LessonResourceUpdate, 'id' | 'created_at'> = {
                lesson_id: currentLessonId!,
                title: resource.title,
                file_url: resourceUrl,
                file_type: resource.file_type,
              };

              if (resource.id) {
                const { error: updateError } = await supabase
                  .from('lesson_resources')
                  .update(resourcePayload)
                  .eq('id', resource.id);
                if (updateError) throw updateError;
              } else {
                const { error: insertError } = await supabase
                  .from('lesson_resources')
                  .insert(resourcePayload as LessonResourceInsert); // Cast for insert
                if (insertError) throw insertError;
              }
            }
          }
        }
      }

      setMessage(`Course ${id ? 'updated' : 'created'} successfully!`);
      navigate('/admin/courses');
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError('Failed to save course: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/courses');
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {id ? 'Edit Course' : 'Add New Course'}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <CourseForm
            initialData={courseData}
            onSave={handleSubmit}
            onCancel={handleCancel}
            isSaving={saving}
          />
        )}
      </div>
    </AdminLayout><dyad-problem-report summary="49 problems">
<problem file="src/components/NotificationDropdown.tsx" line="5" column="31" code="2305">Module '&quot;../lib/database.types&quot;' has no exported member 'NotificationsUpdate'.</problem>
<problem file="src/components/NotificationDropdown.tsx" line="5" column="31" code="6133">'NotificationsUpdate' is declared but its value is never read.</problem>
<problem file="src/components/NotificationDropdown.tsx" line="62" column="17" code="2345">Argument of type '{ is_read: boolean; }' is not assignable to parameter of type 'never'.</problem>
<problem file="src/components/user/PersonalInformationTab.tsx" line="110" column="17" code="2345">Argument of type '{ id?: string | undefined; full_name?: string | undefined; phone?: string | null | undefined; profile_photo?: string | null | undefined; bio?: string | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.</problem>
<problem file="src/components/course/LessonNotes.tsx" line="62" column="17" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;user_notes&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; lesson_id: string; note_content: string; timestamp_seconds?: number | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;user_notes&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; lesson_id: string; note_content: string; timestamp_seconds?: number | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }' is not assignable to parameter of type 'never[]'.
      Type '{ id?: string | undefined; user_id: string; lesson_id: string; note_content: string; timestamp_seconds?: number | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 28 more.</problem>
<problem file="src/components/course/LessonNotes.tsx" line="102" column="17" code="2345">Argument of type '{ id?: string | undefined; user_id?: string | undefined; lesson_id?: string | undefined; note_content?: string | undefined; timestamp_seconds?: number | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminDashboard.tsx" line="335" column="82" code="2362">The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.</problem>
<problem file="src/pages/admin/AdminCoursesPage.tsx" line="165" column="17" code="2345">Argument of type '{ id?: string | undefined; title?: string | undefined; slug?: string | undefined; short_description?: string | null | undefined; full_description?: string | null | undefined; thumbnail?: string | ... 1 more ... | undefined; ... 25 more ...; meta_description?: string | ... 1 more ... | undefined; }' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminPaymentsPage.tsx" line="55" column="17" code="2345">Argument of type '{ id?: string | undefined; user_id?: string | undefined; course_id?: string | undefined; amount?: number | undefined; payment_method?: &quot;bkash&quot; | &quot;nagad&quot; | &quot;rocket&quot; | &quot;bank_transfer&quot; | &quot;other&quot; | undefined; ... 15 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminPaymentsPage.tsx" line="66" column="84" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;enrollments&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; course_id: string; payment_id: string; enrolled_at?: string | undefined; completed_at?: string | null | undefined; progress_percentage?: number | undefined; }' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;enrollments&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; course_id: string; payment_id: string; enrolled_at?: string | undefined; completed_at?: string | null | undefined; progress_percentage?: number | undefined; }' is not assignable to parameter of type 'never[]'.
      Type '{ id?: string | undefined; user_id: string; course_id: string; payment_id: string; enrolled_at?: string | undefined; completed_at?: string | null | undefined; progress_percentage?: number | undefined; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 28 more.</problem>
<problem file="src/pages/admin/AdminPaymentsPage.tsx" line="77" column="51" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;notifications&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; title: string; message: string; type: &quot;payment&quot; | &quot;course&quot; | &quot;admin_message&quot; | &quot;system&quot;; is_read?: boolean | undefined; created_at?: string | undefined; }' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;notifications&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; title: string; message: string; type: &quot;payment&quot; | &quot;course&quot; | &quot;admin_message&quot; | &quot;system&quot;; is_read?: boolean | undefined; created_at?: string | undefined; }' is not assignable to parameter of type 'never[]'.
      Type '{ id?: string | undefined; user_id: string; title: string; message: string; type: &quot;payment&quot; | &quot;course&quot; | &quot;admin_message&quot; | &quot;system&quot;; is_read?: boolean | undefined; created_at?: string | undefined; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 28 more.</problem>
<problem file="src/pages/admin/AdminPaymentsPage.tsx" line="99" column="17" code="2345">Argument of type '{ id?: string | undefined; user_id?: string | undefined; course_id?: string | undefined; amount?: number | undefined; payment_method?: &quot;bkash&quot; | &quot;nagad&quot; | &quot;rocket&quot; | &quot;bank_transfer&quot; | &quot;other&quot; | undefined; ... 15 more ...; updated_at?: string | undefined; }' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminPaymentsPage.tsx" line="111" column="51" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;notifications&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; title: string; message: string; type: &quot;payment&quot; | &quot;course&quot; | &quot;admin_message&quot; | &quot;system&quot;; is_read?: boolean | undefined; created_at?: string | undefined; }' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;notifications&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; user_id: string; title: string; message: string; type: &quot;payment&quot; | &quot;course&quot; | &quot;admin_message&quot; | &quot;system&quot;; is_read?: boolean | undefined; created_at?: string | undefined; }' is not assignable to parameter of type 'never[]'.
      Type '{ id?: string | undefined; user_id: string; title: string; message: string; type: &quot;payment&quot; | &quot;course&quot; | &quot;admin_message&quot; | &quot;system&quot;; is_read?: boolean | undefined; created_at?: string | undefined; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 28 more.</problem>
<problem file="src/components/ui/multi-select.tsx" line="1" column="8" code="6133">'React' is declared but its value is never read.</problem>
<problem file="src/components/admin/courses/sections/CurriculumSection.tsx" line="4" column="33" code="2307">Cannot find module '../../../pages/admin/AdminCourseFormPage' or its corresponding type declarations.</problem>
<problem file="src/components/admin/courses/sections/InstructorSection.tsx" line="6" column="1" code="6133">'Button' is declared but its value is never read.</problem>
<problem file="src/components/admin/courses/sections/InstructorSection.tsx" line="9" column="1" code="6133">'InstructorsInsert' is declared but its value is never read.</problem>
<problem file="src/components/admin/courses/sections/InstructorSection.tsx" line="34" column="10" code="6133">'newInstructorPhoto' is declared but its value is never read.</problem>
<problem file="src/components/admin/courses/CourseForm.tsx" line="13" column="1" code="6133">'Button' is declared but its value is never read.</problem>
<problem file="src/components/admin/courses/CourseForm.tsx" line="14" column="1" code="6133">'Loader2' is declared but its value is never read.</problem>
<problem file="src/components/admin/courses/CourseForm.tsx" line="59" column="9" code="2322">Type '(field: string, value: any) =&gt; void' is not assignable to type '(field: string | number | symbol, value: any) =&gt; void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string | number | symbol' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.</problem>
<problem file="src/components/admin/courses/CourseForm.tsx" line="79" column="11" code="2322">Type '(field: string, value: any) =&gt; void' is not assignable to type '(field: string | number | symbol, value: any) =&gt; void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string | number | symbol' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="8" column="45" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'CourseRequirementsInsert'. Did you mean 'CourseRequirementInsert'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="8" column="71" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'CourseLearningOutcomesInsert'. Did you mean 'CourseLearningOutcomeInsert'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="9" column="3" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'CourseSectionsInsert'. Did you mean 'CourseSectionInsert'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="9" column="25" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'CourseLessonsInsert'. Did you mean 'CourseLessonInsert'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="9" column="46" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'LessonResourcesInsert'. Did you mean 'LessonResourceInsert'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="10" column="18" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'CourseSectionsUpdate'. Did you mean 'CourseSectionUpdate'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="10" column="40" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'CourseLessonsUpdate'. Did you mean 'CourseLessonUpdate'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="10" column="61" code="2724">'&quot;../../lib/database.types&quot;' has no exported member named 'LessonResourcesUpdate'. Did you mean 'LessonResourceUpdate'?</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="11" column="22" code="6133">'InstructorsUpdate' is declared but its value is never read.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="154" column="22" code="7006">Parameter 'a' implicitly has an 'any' type.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="154" column="25" code="7006">Parameter 'b' implicitly has an 'any' type.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="155" column="20" code="7006">Parameter 'lesson' implicitly has an 'any' type.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="212" column="19" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;instructors&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; name: string; bio?: string | null | undefined; photo?: string | null | undefined; credentials?: string | null | undefined; created_at?: string | undefined; }' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;instructors&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ id?: string | undefined; name: string; bio?: string | null | undefined; photo?: string | null | undefined; credentials?: string | null | undefined; created_at?: string | undefined; }' is not assignable to parameter of type 'never[]'.
      Type '{ id?: string | undefined; name: string; bio?: string | null | undefined; photo?: string | null | undefined; credentials?: string | null | undefined; created_at?: string | undefined; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 28 more.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="217" column="38" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="264" column="19" code="2345">Argument of type 'Omit&lt;{ id?: string | undefined; title?: string | undefined; slug?: string | undefined; short_description?: string | null | undefined; full_description?: string | null | undefined; thumbnail?: string | ... 1 more ... | undefined; ... 25 more ...; meta_description?: string | ... 1 more ... | undefined; }, &quot;created_at&quot;...' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="274" column="37" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="286" column="98" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;course_categories_mapping&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ course_id: string; category_id: string; }[]' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;course_categories_mapping&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type '{ course_id: string; category_id: string; }[]' is not assignable to parameter of type 'never[]'.
      Type '{ course_id: string; category_id: string; }' is not assignable to type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="298" column="87" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;course_requirements&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type 'CourseRequirementsInsert[]' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;course_requirements&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type 'CourseRequirementsInsert[]' is not assignable to parameter of type 'never[]'.
      Type 'CourseRequirementsInsert' is not assignable to type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="310" column="92" code="2769">No overload matches this call.
  Overload 1 of 2, '(values: never, options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;course_learning_outcomes&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type 'CourseLearningOutcomesInsert[]' is not assignable to parameter of type 'never'.
  Overload 2 of 2, '(values: never[], options?: { count?: &quot;exact&quot; | &quot;planned&quot; | &quot;estimated&quot; | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder&lt;{ PostgrestVersion: &quot;12&quot;; }, never, never, null, &quot;course_learning_outcomes&quot;, never, &quot;POST&quot;&gt;', gave the following error.
    Argument of type 'CourseLearningOutcomesInsert[]' is not assignable to parameter of type 'never[]'.
      Type 'CourseLearningOutcomesInsert' is not assignable to type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="317" column="138" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="335" column="23" code="2345">Argument of type 'Omit&lt;CourseSectionsUpdate, &quot;created_at&quot; | &quot;id&quot;&gt;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="345" column="43" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="351" column="140" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="372" column="25" code="2345">Argument of type 'Omit&lt;CourseLessonsUpdate, &quot;created_at&quot; | &quot;id&quot;&gt;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="382" column="43" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="388" column="144" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/AdminCourseFormPage.tsx" line="410" column="27" code="2345">Argument of type 'Omit&lt;LessonResourcesUpdate, &quot;created_at&quot; | &quot;id&quot;&gt;' is not assignable to parameter of type 'never'.</problem>
</dyad-problem-report><think>**Tackling TypeScript Errors**

I'm currently wading through 49 TypeScript compile-time errors. My immediate plan is to methodically address each one. The most glaring issue is a misnamed import: `NotificationsUpdate` in `NotificationDropdown.tsx` seems to be the culprit.


**Debugging Type Inconsistencies**

I'm making progress, though the mountain of 49 errors is still imposing.  I've found many Supabase `insert` and `update` methods are balking at their payloads - casting to the appropriate `Insert` or `Update` type usually solves it. Type aliases are tripping me up too, with misnamed imports in `AdminCourseFormPage`. I'm also hunting down implicit 'any' types, especially in that same file.


**Analyzing Type Errors**

I've got a fresh batch of TypeScript errors to dissect, all 49 of them! It seems like the Supabase `insert` and `update` methods are still causing headaches, frequently throwing `never` type errors, which I'll address by ensuring the correct `Insert` or `Update` types are used.  The `AdminCourseFormPage` continues to have import issues and the dreaded implicit `any`s; also I've got to ensure the `onFieldChange` prop is consistent in my components. Lastly, it seems that `PieLabelRenderProps` in `AdminDashboard.tsx` needs some extra attention.


**Fixing TypeScript Issues**

I'm systematically tackling the 49 TypeScript errors. The most prevalent issue seems to stem from Supabase `insert` and `update` calls generating `never` types. Casting the payload to the correct `Insert` or `Update` type usually fixes this, as seen in `NotificationDropdown.tsx` and `PersonalInformationTab.tsx`. I'm also addressing misnamed imports in `AdminCourseFormPage` and ensuring consistent type annotations for implicit `any` types. Additionally, I'm cleaning up unused imports across various files and addressing a type mismatch in `PieLabelRenderProps` within `AdminDashboard.tsx`. Lastly, I'm standardizing the `onFieldChange` prop for components.


**Analyzing TypeScript Issues**

I've made significant progress, addressing a number of the 49 errors.  The Supabase `insert` and `update` calls now utilize type casts to rectify `never` type errors, with examples in `NotificationDropdown.tsx` and `PersonalInformationTab.tsx`. Misnamed imports in `AdminCourseFormPage` and implicit `any` type annotations are nearly all resolved. The `PieLabelRenderProps` in `AdminDashboard.tsx` is safe now.  I'm also standardizing the `onFieldChange` prop for component consistency. Still remaining: `CurriculumSection.tsx` `SectionFormData` import is under investigation. I am systematically resolving all the remaining issues.


**Systematically Resolving Errors**

I'm making steady progress, methodically addressing the remaining TypeScript errors. Supabase type casting for `insert` and `update` calls is now consistent. I've standardized the `onFieldChange` prop across components and corrected the type mismatch. Further, I've cleared the imports and fixed the type error in `AdminDashboard.tsx`. Lastly, I will now be focusing on fixing the remaining issues in `CurriculumSection.tsx`, ensuring proper `SectionFormData` import.


**Systematically Fixing Remaining Errors**

I'm now diving into the remaining errors with renewed focus. I'm double-checking all type aliases within `database.types.ts` to ensure consistency with table names, as this seems to be the root of many issues. I'm also systematically fixing the `never` type errors, making certain that Supabase `insert` and `update` payloads are being correctly cast to their appropriate types. Additionally, I'm cleaning up any leftover unused imports and making certain the `onFieldChange` prop is consistent across all components.  The issues in `CurriculumSection.tsx` `SectionFormData` import are still under review.


</think>Okay, I understand the remaining TypeScript errors. It seems like the core issue is still around the `never` type inference from Supabase, which often stems from slightly mismatched type definitions or incorrect usage of `insert`/`update` payloads. There are also several incorrect type alias imports and unused imports.

I will go through each file and apply the necessary fixes:

1.  **`src/lib/database.types.ts`**: I will ensure all `Insert` and `Update` type aliases correctly reference the `Database['public']['Tables']['TableName']['Insert']` or `Update` pattern, and that the singular/plural naming is consistent with the table names. This is crucial for Supabase's type inference.
2.  **`src/components/NotificationDropdown.tsx`**: I'll correct the `NotificationsUpdate` import and explicitly cast the update payload.
3.  **`src/components/user/PersonalInformationTab.tsx`**: I'll explicitly cast the update payload.
4.  **`src/components/course/LessonNotes.tsx`**: I'll explicitly cast the insert and update payloads.
5.  **`src/pages/admin/AdminDashboard.tsx`**: I'll adjust the `PieChart` label prop to correctly handle optional `percent` values.
6.  **`src/pages/admin/AdminCoursesPage.tsx`**: I'll explicitly cast the update payload.
7.  **`src/pages/admin/AdminPaymentsPage.tsx`**: I'll explicitly cast all insert and update payloads.
8.  **`src/components/ui/multi-select.tsx`**: I'll remove the unused `React` import.
9.  **`src/components/admin/courses/sections/CurriculumSection.tsx`**: I'll remove the unused `Label` import.
10. **`src/components/admin/courses/sections/InstructorSection.tsx`**: I'll remove unused imports (`Button`, `Plus`) and explicitly cast the insert payload.
11. **`src/components/admin/courses/sections/RequirementsSection.tsx`**: I'll remove the unused `Label` import.
12. **`src/components/admin/courses/sections/LearningOutcomesSection.tsx`**: I'll remove the unused `Label` import.
13. **`src/components/admin/courses/sections/PublishingOptionsSection.tsx`**: I'll remove the unused `Eye` import.
14. **`src/components/admin/courses/CourseForm.tsx`**: I'll remove unused imports (`Button`, `Loader2`) and adjust the `onFieldChange` prop types in child components to match the `handleFieldChange` signature.
15. **`src/pages/admin/AdminCourseFormPage.tsx`**: This is the most complex. I'll correct all type imports (e.g., `CourseRequirementsInsert` to `CourseRequirementInsert`), explicitly type parameters in array methods (`sort`, `map`), and cast all Supabase `insert` and `update` payloads to their correct specific types. I'll also ensure property access on returned data from `select().single()` is correctly typed.

Let's start by updating `src/lib/database.types.ts` to ensure all type aliases are correct and consistent.

<dyad-write path="src/lib/database.types.ts" description="Updating database types with correct aliases and definitions.">
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
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          outcome?: string
          display_order?: number | null
          created_at?: string
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
          meta_title: string | null
          meta_description: string | null
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
          meta_title?: string | null
          meta_description?: string | null
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
          meta_title?: string | null
          meta_description?: string | null
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
export type NotificationsUpdate = Database['public']['Tables']['notifications']['Update']; // Corrected
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