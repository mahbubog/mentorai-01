import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { CourseForm } from '../../components/admin/courses/CourseForm';
import { supabase } from '../../lib/supabase';
import { 
  CourseRow, 
  CourseCategoriesMappingInsert, 
  CourseRequirementInsert, 
  CourseLearningOutcomeInsert, 
  CourseSectionInsert, 
  CourseLessonInsert, 
  LessonResourceInsert, 
  CoursesUpdate, 
  CourseSectionUpdate, 
  CourseLessonUpdate, 
  LessonResourceUpdate, 
  InstructorsInsert,
  CourseSectionRow, // Imported
  CourseLessonRow, // Imported
  LessonResourceRow // Imported
} from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';

// Define extended types for the form data
export interface LessonFormData {
  id?: string;
  title: string;
  description: string | null; // Allow null
  video_url: string;
  duration: string | null; // Allow null
  is_preview: boolean;
  display_order: number;
  resources: { id?: string; title: string; file_url: string; file_type: string | null; file?: File }[]; // Allow file_type to be null
}

export interface SectionFormData {
  id?: string;
  title: string;
  description: string | null; // Allow null
  display_order: number;
  lessons: LessonFormData[];
}

export interface CourseFormData extends Omit<CourseRow, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'enrolled_count'> {
  id?: string;
  category_ids: string[];
  requirements: { id?: string; requirement: string; display_order: number }[];
  learning_outcomes: { id?: string; outcome: string; display_order: number }[];
  sections: SectionFormData[];
  meta_title: string | null; // Allow null
  meta_description: string | null; // Allow null
  thumbnail_file?: File;
  preview_video_file?: File;
  instructor_name?: string | null; // For new instructor creation
  instructor_bio?: string | null;
  instructor_photo?: File;
  instructor_credentials?: string | null;
}

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

// Define a type for the data returned by the complex select query
type CourseLoadData = CourseRow & {
  course_categories_mapping: { category_id: string }[];
  course_requirements: { id: string; requirement: string; display_order: number }[];
  course_learning_outcomes: { id: string; outcome: string; display_order: number }[];
  course_sections: (CourseSectionRow & { // Use CourseSectionRow
    course_lessons: (CourseLessonRow & { // Use CourseLessonRow
      lesson_resources: LessonResourceRow[]; // Use LessonResourceRow
    })[];
  })[];
};

const LOCAL_STORAGE_KEY = 'adminCourseFormDraft';

export function AdminCourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CourseFormData>(initialCourseState);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load data from local storage or fetch if editing
  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        // Editing existing course, load from DB
        await loadCourse(id);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear draft if editing existing
      } else {
        // Adding new course, try to load from local storage
        const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedDraft) {
          try {
            const draftData: CourseFormData = JSON.parse(savedDraft);
            setCourseData(draftData);
            setMessage('Loaded unsaved draft from previous session.');
          } catch (e) {
            console.error('Failed to parse saved draft:', e);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id]);

  // Save form data to local storage on changes (only for new course creation)
  useEffect(() => {
    if (!id) { // Only save draft for new courses
      const timer = setTimeout(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(courseData));
      }, 1000); // Save every 1 second after last change
      return () => clearTimeout(timer);
    }
  }, [courseData, id]);

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

      const loadedCourse: CourseFormData = {
        ...(course as CourseLoadData), // Cast to the specific loaded type
        price: Number((course as CourseLoadData).price),
        discount_price: (course as CourseLoadData).discount_price ? Number((course as CourseLoadData).discount_price) : null,
        category_ids: ((course as CourseLoadData).course_categories_mapping || []).map(c => c.category_id),
        requirements: ((course as CourseLoadData).course_requirements || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        learning_outcomes: ((course as CourseLoadData).course_learning_outcomes || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        sections: ((course as CourseLoadData).course_sections || [])
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(section => ({
            ...section,
            lessons: (section.course_lessons || [])
              .sort((a: CourseLessonRow, b: CourseLessonRow) => (a.display_order || 0) - (b.display_order || 0))
              .map((lesson: CourseLessonRow) => ({
                ...lesson,
                resources: lesson.lesson_resources || [],
              })),
          })),
        meta_title: (course as CourseLoadData).meta_title || null,
        meta_description: (course as CourseLoadData).meta_description || null,
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
      if (formData.instructor_id === 'new' && formData.instructor_name) {
        const instructorPayload: InstructorsInsert = {
          name: formData.instructor_name,
          bio: formData.instructor_bio,
          credentials: formData.instructor_credentials,
          photo: formData.instructor_photo ? await uploadFile(formData.instructor_photo, 'course_assets', 'instructor_photos') : null,
        };
        const { data: newInstructor, error: instructorError } = await supabase
          .from('instructors')
          .insert([instructorPayload] as InstructorsInsert[])
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
          .update(coursePayload as CoursesUpdate) // Explicitly cast to CoursesUpdate
          .eq('id', currentCourseId);
        if (updateError) throw updateError;
      } else {
        const { data: newCourse, error: insertError } = await supabase
          .from('courses')
          .insert([coursePayload as CourseRow]) // Cast to CourseRow for insert
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
        const { error: categoryError } = await supabase.from('course_categories_mapping').insert(categoryMappings as CourseCategoriesMappingInsert[]);
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
        const { error: reqError } = await supabase.from('course_requirements').insert(requirementsPayload as CourseRequirementInsert[]);
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
        const { error: outError } = await supabase.from('course_learning_outcomes').insert(outcomesPayload as CourseLearningOutcomeInsert[]);
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
              .update(sectionPayload as CourseSectionUpdate) // Explicitly cast
              .eq('id', currentSectionId);
            if (updateError) throw updateError;
          } else {
            const { data: newSection, error: insertError } = await supabase
              .from('course_sections')
              .insert([sectionPayload as CourseSectionInsert]) // Explicitly cast
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
                .update(lessonPayload as CourseLessonUpdate) // Explicitly cast
                .eq('id', currentLessonId);
              if (updateError) throw updateError;
            } else {
              const { data: newLesson, error: insertError } = await supabase
                .from('course_lessons')
                .insert([lessonPayload as CourseLessonInsert]) // Explicitly cast
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
                  .update(resourcePayload as LessonResourceUpdate) // Explicitly cast
                  .eq('id', resource.id);
                if (updateError) throw updateError;
              } else {
                const { error: insertError } = await supabase
                  .from('lesson_resources')
                  .insert([resourcePayload as LessonResourceInsert]); // Explicitly cast
                if (insertError) throw insertError;
              }
            }
          }
        }
      }

      setMessage(`Course ${id ? 'updated' : 'created'} successfully!`);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear draft on successful save
      navigate('/admin/courses');
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError('Failed to save course: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear draft on cancel
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
    </AdminLayout>
  );
}