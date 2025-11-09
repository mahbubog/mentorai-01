import { ChangeEvent, useCallback } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { CourseRow } from '../../../../lib/database.types'; // Added CourseRow import

interface SeoSectionProps {
  meta_title: string;
  meta_description: string;
  onFieldChange: (field: keyof CourseRow, value: any) => void;
}

export function SeoSection({
  meta_title,
  meta_description,
  onFieldChange,
}: SeoSectionProps) {
  const handleMetaTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('meta_title', e.target.value);
  }, [onFieldChange]);

  const handleMetaDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onFieldChange('meta_description', e.target.value);
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">SEO Settings</h2>

      <div>
        <Label htmlFor="meta_title">Meta Title</Label>
        <Input
          id="meta_title"
          value={meta_title}
          onChange={handleMetaTitleChange}
          placeholder="SEO friendly title (max 60 characters)"
          maxLength={60}
        />
        <p className="text-sm text-gray-500 mt-1">
          {meta_title.length} / 60 characters
        </p>
      </div>

      <div>
        <Label htmlFor="meta_description">Meta Description</Label>
        <Textarea
          id="meta_description"
          value={meta_description}
          onChange={handleMetaDescriptionChange}
          placeholder="SEO friendly description (max 160 characters)"
          maxLength={160}
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-1">
          {meta_description.length} / 160 characters
        </p>
      </div>
    </div>
  );
}