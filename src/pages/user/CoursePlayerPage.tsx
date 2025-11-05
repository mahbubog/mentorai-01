import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CourseRow, LessonProgressInsert, LessonProgressRow } from '../../lib/database.types';
import { CoursePlayerSidebar } from '../../components/course/CoursePlayerSidebar';
import { LessonContent } from '../../components/course/LessonContent';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  video_url: string;
}

interface Section {
  id: string;
  title: string;
  course_lessons: Lesson[];
}

// Extended CourseRow type for the player page
interface CoursePlayerCourse extends CourseRow {
  sections: Section[];
}

export function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CoursePlayerCourse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const loadCourse = useCallback(async () => {
    if (!user || !courseId) return;

    try {
      // 1. Check Enrollment Status
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (!enrollmentData) {
        // User is not enrolled (or payment is pending/rejected)
        navigate('/my-courses', { replace: true });
        return;
      }

      // 2. Fetch Course Details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      
      // Fix 7: Explicitly cast courseData to CourseRow to access properties
      const typedCourseData = courseData as CourseRow | null;

      if (!typedCourseData || typedCourseData.course_type !== 'recorded') {
        // Only recorded courses use this player structure
        navigate('/my-courses', { replace: true });
        return;
      }

      // 3. Fetch Curriculum
      const { data: sectionsData } = await supabase
        .from('course_sections')
        .select(`
          id,
          title,
          course_lessons (id, title, description, duration, video_url)
        `)
        .eq('course_id', courseId)
        .order('display_order');

      const sectionsArray = (sectionsData || []) as Section[];

      // 4. Fetch Progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      const progressMap: Record<string, boolean> = {};
      (progressData as LessonProgressRow[])?.forEach((p) => {
        progressMap[p.lesson_id] = p.completed;
      });
      setProgress(progressMap);

      // Fix 8: Spread typedCourseData
      const fullCourse: CoursePlayerCourse = {
        ...typedCourseData,
        sections: sectionsArray,
      };
      setCourse(fullCourse);

      // 5. Set initial lesson (first incomplete, or first overall)
      let initialLesson: Lesson | null = null;
      for (const section of sectionsArray) {
        for (const lesson of section.course_lessons) {
          if (!progressMap[lesson.id]) {
            initialLesson = lesson;
            break;
          }
        }
        if (initialLesson) break;
      }

      if (!initialLesson && sectionsArray.length > 0) {
        initialLesson = sectionsArray[0].course_lessons[0];
      }

      setCurrentLesson(initialLesson);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  }, [user, courseId, navigate]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const markLessonComplete = async (lessonId: string) => {
    try {
      const upsertData: LessonProgressInsert = {
        user_id: user!.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      };

      // Fix 9: Remove array wrapper
      await supabase.from('lesson_progress' as const).upsert(upsertData);

      setProgress({ ...progress, [lessonId]: true });
      
      // Automatically move to the next lesson after marking complete
      handleNextLesson();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const findNextLesson = (currentId: string): Lesson | null => {
    let foundCurrent = false;
    for (const section of course!.sections) {
      for (const lesson of section.course_lessons) {
        if (foundCurrent) {
          return lesson;
        }
        if (lesson.id === currentId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const nextLesson = findNextLesson(currentLesson.id);
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const hasNextLesson = currentLesson ? !!findNextLesson(currentLesson.id) : false;

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* Main Content Area (Video + Lesson Details) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Player */}
          <div className="flex-shrink-0 aspect-video bg-black">
            {currentLesson ? (
              <iframe
                src={getYouTubeEmbedUrl(currentLesson.video_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>No lessons available for this course.</p>
              </div>
            )}
          </div>

          {/* Lesson Content & Tabs */}
          <div className="flex-1 bg-white">
            {currentLesson && (
              <LessonContent
                lesson={currentLesson}
                course={course}
                isCompleted={progress[currentLesson.id] || false}
                onMarkComplete={markLessonComplete}
                onNextLesson={handleNextLesson}
                hasNextLesson={hasNextLesson}
              />
            )}
          </div>
        </div>

        {/* Sidebar (Curriculum) */}
        <CoursePlayerSidebar
          courseTitle={course.title}
          sections={course.sections}
          currentLesson={currentLesson}
          progress={progress}
          onLessonSelect={setCurrentLesson}
        />
      </div>
    </div>
  );
}