import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { CourseRow, LessonProgressInsert, LessonProgressRow } from '../../lib/database.types';

interface Lesson {
  id: string;
  title: string;
  duration: string | null;
  video_url: string;
}

interface Section {
  id: string;
  title: string;
  course_lessons: Lesson[];
}

export function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseRow | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId!)
        .maybeSingle();

      const { data: sectionsData } = await supabase
        .from('course_sections')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', courseId!)
        .order('display_order');

      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user!.id);

      setCourse(courseData);
      setSections((sectionsData || []) as Section[]);

      const progressMap: Record<string, boolean> = {};
      (progressData as LessonProgressRow[])?.forEach((p) => {
        progressMap[p.lesson_id] = p.completed;
      });
      setProgress(progressMap);

      const firstLesson = (sectionsData as Section[])?.[0]?.course_lessons?.[0];
      if (firstLesson) {
        setCurrentLesson(firstLesson);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const upsertData: LessonProgressInsert = {
        user_id: user!.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('lesson_progress').upsert([upsertData]);

      if (!error) {
        setProgress({ ...progress, [lessonId]: true });
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
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

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 bg-black flex items-center justify-center">
          {currentLesson ? (
            <div className="w-full h-full">
              <iframe
                src={getYouTubeEmbedUrl(currentLesson.video_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-white">Select a lesson to start learning</p>
          )}
        </div>

        <aside className="w-96 bg-white overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{course?.title}</h2>
          </div>

          <div className="p-6">
            {sections.map((section) => (
              <div key={section.id} className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">{section.title}</h3>
                <div className="space-y-2">
                  {section.course_lessons?.map((lesson: Lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition flex items-start ${
                        currentLesson?.id === lesson.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="mr-3 mt-0.5">
                        {progress[lesson.id] ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {currentLesson && (
            <div className="p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => markLessonComplete(currentLesson.id)}
                disabled={progress[currentLesson.id]}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center ${
                  progress[currentLesson.id]
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {progress[currentLesson.id] ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    Mark as Complete
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}