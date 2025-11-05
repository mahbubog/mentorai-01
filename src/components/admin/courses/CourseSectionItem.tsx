import { ChangeEvent, useCallback } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { SectionFormData, LessonFormData } from '../../../pages/admin/AdminCourseFormPage';
import { LessonItem } from './LessonItem';

interface CourseSectionItemProps {
  section: SectionFormData;
  onSectionChange: (newSection: SectionFormData) => void;
}

export function CourseSectionItem({ section, onSectionChange }: CourseSectionItemProps) {
  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onSectionChange({ ...section, title: e.target.value });
  }, [section, onSectionChange]);

  const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onSectionChange({ ...section, description: e.target.value });
  }, [section, onSectionChange]);

  const addLesson = useCallback(() => {
    onSectionChange({
      ...section,
      lessons: [
        ...section.lessons,
        {
          title: '',
          description: '',
          video_url: '',
          duration: '',
          is_preview: false,
          display_order: section.lessons.length,
          resources: [],
        },
      ],
    });
  }, [section, onSectionChange]);

  const updateLesson = useCallback((index: number, newLesson: LessonFormData) => {
    const updatedLessons = [...section.lessons];
    updatedLessons[index] = newLesson;
    onSectionChange({ ...section, lessons: updatedLessons });
  }, [section, onSectionChange]);

  const removeLesson = useCallback((index: number) => {
    const updatedLessons = section.lessons.filter((_, i) => i !== index);
    onSectionChange({ ...section, lessons: updatedLessons.map((l, i) => ({ ...l, display_order: i })) });
  }, [section, onSectionChange]);

  const moveLesson = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < section.lessons.length) {
      const updatedLessons = [...section.lessons];
      const [movedLesson] = updatedLessons.splice(index, 1);
      updatedLessons.splice(newIndex, 0, movedLesson);
      onSectionChange({ ...section, lessons: updatedLessons.map((l, i) => ({ ...l, display_order: i })) });
    }
  }, [section, onSectionChange]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`section-title-${section.id}`}>Section Title <span className="text-red-500">*</span></Label>
        <Input
          id={`section-title-${section.id}`}
          value={section.title}
          onChange={handleTitleChange}
          placeholder="e.g., Introduction to React"
          required
        />
      </div>
      <div>
        <Label htmlFor={`section-description-${section.id}`}>Section Description</Label>
        <Textarea
          id={`section-description-${section.id}`}
          value={section.description || ''} // Handle null value
          onChange={handleDescriptionChange}
          placeholder="Briefly describe this section"
          rows={3}
        />
      </div>

      <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Lessons</h4>
      <div className="space-y-4 border-t pt-4">
        {section.lessons.length === 0 && (
          <p className="text-gray-600 text-sm">No lessons added to this section yet.</p>
        )}
        {section.lessons.map((lesson, index) => (
          <div key={lesson.id || `new-lesson-${index}`} className="border p-3 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-900">Lesson {index + 1}</h5>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveLesson(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveLesson(index, 'down')}
                  disabled={index === section.lessons.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeLesson(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <LessonItem
              lesson={lesson}
              onLessonChange={(newLesson) => updateLesson(index, newLesson)}
            />
          </div>
        ))}
      </div>

      <Button type="button" onClick={addLesson} variant="outline" className="mt-4 w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Lesson
      </Button>
    </div>
  );
}