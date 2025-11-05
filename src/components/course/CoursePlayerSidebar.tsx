import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, BookOpen } from 'lucide-react';
import { CourseLessonRow } from '../../lib/database.types'; // Import CourseLessonRow

interface Lesson extends CourseLessonRow {} // Extend CourseLessonRow for consistency

interface Section {
  id: string;
  title: string;
  course_lessons: Lesson[];
}

interface CoursePlayerSidebarProps {
  courseTitle: string;
  sections: Section[];
  currentLesson: Lesson | null;
  progress: Record<string, boolean>;
  onLessonSelect: (lesson: Lesson) => void;
}

export function CoursePlayerSidebar({
  courseTitle,
  sections,
  currentLesson,
  progress,
  onLessonSelect,
}: CoursePlayerSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <aside className="w-full md:w-96 bg-white overflow-y-auto flex-shrink-0 border-l">
      <div className="p-6 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{courseTitle}</h2>
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <BookOpen className="h-4 w-4 mr-1" />
          Course Curriculum
        </p>
      </div>

      <div className="p-4 divide-y divide-gray-100">
        {sections.map((section) => {
          const isOpen = openSections[section.id] ?? true; // Default open

          return (
            <div key={section.id} className="py-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left font-bold text-gray-900 hover:text-blue-600 transition"
              >
                <span>{section.title}</span>
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {isOpen && (
                <div className="mt-3 space-y-2">
                  {section.course_lessons?.map((lesson: Lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition flex items-start ${
                        currentLesson?.id === lesson.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'
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
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}