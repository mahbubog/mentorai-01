import { useState } from 'react';
import { Download, MessageSquare, NotebookPen, Info } from 'lucide-react';
import { LessonResources } from './LessonResources';
import { LessonNotes } from './LessonNotes';

interface CourseTabsProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
  };
  course: {
    full_description: string | null;
  };
}

export function CourseTabs({ lesson, course }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'qna' | 'notes'>('overview');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Info },
    { key: 'resources', label: 'Resources', icon: Download },
    { key: 'qna', label: 'Q&A / Discussion', icon: MessageSquare },
    { key: 'notes', label: 'Notes', icon: NotebookPen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Lesson Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {lesson.description || 'No detailed description provided for this lesson.'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Course Overview</h3>
              <p className="text-gray-700 leading-relaxed">
                {course.full_description || 'No detailed course description available.'}
              </p>
            </div>
          </div>
        );
      case 'resources':
        return <LessonResources lessonId={lesson.id} />;
      case 'qna':
        return (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p>Q&A and Discussion feature coming soon!</p>
          </div>
        );
      case 'notes':
        return <LessonNotes lessonId={lesson.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <div className="border-b border-gray-200 mb-6 flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-3 font-semibold text-sm transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="py-4">{renderContent()}</div>
    </div>
  );
}