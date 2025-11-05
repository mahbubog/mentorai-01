import { CheckCircle, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { CourseTabs } from './CourseTabs';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  video_url: string;
}

interface Course {
  id: string;
  title: string;
  full_description: string | null;
}

interface LessonContentProps {
  lesson: Lesson;
  course: Course;
  isCompleted: boolean;
  onMarkComplete: (lessonId: string) => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
}

export function LessonContent({
  lesson,
  course,
  isCompleted,
  onMarkComplete,
  onNextLesson,
  hasNextLesson,
}: LessonContentProps) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600 text-sm">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Lesson
            </span>
            {lesson.duration && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {lesson.duration}
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-4 flex-shrink-0">
          <button
            onClick={() => onMarkComplete(lesson.id)}
            disabled={isCompleted}
            className={`py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center ${
              isCompleted
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed
              </>
            ) : (
              'Mark as Complete'
            )}
          </button>

          {hasNextLesson && (
            <button
              onClick={onNextLesson}
              className="py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Next Lesson
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </div>

      <CourseTabs lesson={lesson} course={course} />
    </div>
  );
}