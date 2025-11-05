import { ChangeEvent, useCallback } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Button } from '../../ui/button';
import { Plus, Trash2, Upload } from 'lucide-react'; // Removed unused XCircle
import { LessonFormData } from '../../../pages/admin/AdminCourseFormPage';

interface LessonItemProps {
  lesson: LessonFormData;
  onLessonChange: (newLesson: LessonFormData) => void;
}

export function LessonItem({ lesson, onLessonChange }: LessonItemProps) {
  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onLessonChange({ ...lesson, title: e.target.value });
  }, [lesson, onLessonChange]);

  const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onLessonChange({ ...lesson, description: e.target.value });
  }, [lesson, onLessonChange]);

  const handleVideoUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onLessonChange({ ...lesson, video_url: e.target.value });
  }, [lesson, onLessonChange]);

  const handleDurationChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onLessonChange({ ...lesson, duration: e.target.value });
  }, [lesson, onLessonChange]);

  const handleIsPreviewChange = useCallback((checked: boolean) => {
    onLessonChange({ ...lesson, is_preview: checked });
  }, [lesson, onLessonChange]);

  const addResource = useCallback(() => {
    onLessonChange({
      ...lesson,
      resources: [
        ...lesson.resources,
        { title: '', file_url: '', file_type: '', file: undefined },
      ],
    });
  }, [lesson, onLessonChange]);

  const updateResource = useCallback((index: number, field: keyof any, value: any) => {
    const updatedResources = [...lesson.resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    onLessonChange({ ...lesson, resources: updatedResources });
  }, [lesson, onLessonChange]);

  const removeResource = useCallback((index: number) => {
    const updatedResources = lesson.resources.filter((_, i) => i !== index);
    onLessonChange({ ...lesson, resources: updatedResources });
  }, [lesson, onLessonChange]);

  const handleResourceFileUpload = useCallback((index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateResource(index, 'file', file);
      updateResource(index, 'file_url', URL.createObjectURL(file)); // For immediate preview
      updateResource(index, 'file_type', file.type);
    }
  }, [updateResource]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`lesson-title-${lesson.id}`}>Lesson Title <span className="text-red-500">*</span></Label>
        <Input
          id={`lesson-title-${lesson.id}`}
          value={lesson.title}
          onChange={handleTitleChange}
          placeholder="e.g., Introduction to React Hooks"
          required
        />
      </div>
      <div>
        <Label htmlFor={`lesson-description-${lesson.id}`}>Lesson Description</Label>
        <Textarea
          id={`lesson-description-${lesson.id}`}
          value={lesson.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Briefly describe this lesson"
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor={`lesson-video-${lesson.id}`}>Video URL <span className="text-red-500">*</span></Label>
        <Input
          id={`lesson-video-${lesson.id}`}
          value={lesson.video_url}
          onChange={handleVideoUrlChange}
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          required
        />
      </div>
      <div>
        <Label htmlFor={`lesson-duration-${lesson.id}`}>Duration (e.g., 15 min)</Label>
        <Input
          id={`lesson-duration-${lesson.id}`}
          value={lesson.duration || ''}
          onChange={handleDurationChange}
          placeholder="e.g., 15 min"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`lesson-preview-${lesson.id}`}
          checked={lesson.is_preview ?? false}
          onCheckedChange={handleIsPreviewChange}
        />
        <Label htmlFor={`lesson-preview-${lesson.id}`}>Preview Available</Label>
      </div>

      <h5 className="font-medium text-gray-900 mt-6 mb-3">Downloadable Resources</h5>
      <div className="space-y-3 border-t pt-4">
        {lesson.resources.length === 0 && (
          <p className="text-gray-600 text-sm">No resources added to this lesson yet.</p>
        )}
        {lesson.resources.map((resource, index) => (
          <div key={resource.id || `new-resource-${index}`} className="flex items-center space-x-2">
            <Input
              value={resource.title}
              onChange={(e) => updateResource(index, 'title', e.target.value)}
              placeholder="Resource Title"
              className="flex-1"
            />
            <Input
              id={`resource-file-${lesson.id}-${index}`}
              type="file"
              accept="*"
              onChange={(e) => handleResourceFileUpload(index, e)}
              className="hidden"
            />
            <Label
              htmlFor={`resource-file-${lesson.id}-${index}`}
              className="flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-sm"
            >
              <Upload className="h-4 w-4 mr-1" />
              {resource.file_url ? 'Change File' : 'Upload File'}
            </Label>
            {resource.file_url && (
              <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeResource(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" onClick={addResource} variant="outline" className="mt-4 w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Resource
      </Button>
    </div>
  );
}