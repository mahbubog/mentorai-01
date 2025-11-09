import { useCallback } from 'react';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Checkbox } from '../../../ui/checkbox';
import { Button } from '../../../ui/button';
import { Loader2 } from 'lucide-react'; // Removed unused Eye
import { CourseRow } from '../../../../lib/database.types';
import { CourseFormData } from '../../../../pages/admin/AdminCourseFormPage'; // Import CourseFormData

interface PublishingOptionsSectionProps {
  status: CourseRow['status'];
  is_featured: boolean;
  onFieldChange: (field: keyof CourseFormData, value: any) => void; // Changed field type to keyof CourseFormData
  onSave: () => void;
  onPublish: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function PublishingOptionsSection({
  status,
  is_featured,
  onFieldChange,
  onSave,
  onPublish,
  onCancel,
  isSaving,
}: PublishingOptionsSectionProps) {
  const handleStatusChange = useCallback((value: CourseRow['status']) => {
    onFieldChange('status', value);
  }, [onFieldChange]);

  const handleIsFeaturedChange = useCallback((checked: boolean) => {
    onFieldChange('is_featured', checked);
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Publishing Options</h2>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_featured"
          checked={is_featured}
          onCheckedChange={(checked: boolean) => handleIsFeaturedChange(checked)}
        />
        <Label htmlFor="is_featured">Featured Course</Label>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving Draft...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button
          type="button"
          onClick={onPublish}
          disabled={isSaving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Course'
          )}
        </Button>
        {/* <Button
          type="button"
          variant="secondary"
          disabled={isSaving}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button> */}
      </div>
    </div>
  );
}