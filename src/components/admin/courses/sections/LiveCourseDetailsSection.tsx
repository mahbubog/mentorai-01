import { ChangeEvent, useCallback } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CourseRow } from '../../../../lib/database.types'; // Added CourseRow import
import { CourseFormData } from '../../../../pages/admin/AdminCourseFormPage'; // Import CourseFormData

interface LiveCourseDetailsSectionProps {
  start_date: string | null;
  end_date: string | null;
  meeting_link: string | null;
  max_students: number | null;
  onFieldChange: (field: keyof CourseFormData, value: any) => void; // Changed field type to keyof CourseFormData
}

export function LiveCourseDetailsSection({
  start_date,
  end_date,
  meeting_link,
  max_students,
  onFieldChange,
}: LiveCourseDetailsSectionProps) {
  const handleStartDateChange = useCallback((date: Date | null) => {
    onFieldChange('start_date', date ? date.toISOString() : null);
  }, [onFieldChange]);

  const handleEndDateChange = useCallback((date: Date | null) => {
    onFieldChange('end_date', date ? date.toISOString() : null);
  }, [onFieldChange]);

  const handleMeetingLinkChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('meeting_link', e.target.value);
  }, [onFieldChange]);

  const handleMaxStudentsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('max_students', e.target.value ? Number(e.target.value) : null);
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Course Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <DatePicker
            selected={start_date ? new Date(start_date) : null}
            onChange={handleStartDateChange}
            showTimeSelect
            dateFormat="Pp"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <DatePicker
            selected={end_date ? new Date(end_date) : null}
            onChange={handleEndDateChange}
            showTimeSelect
            dateFormat="Pp"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="meeting_link">Meeting Link/Platform</Label>
        <Input
          id="meeting_link"
          value={meeting_link || ''}
          onChange={handleMeetingLinkChange}
          placeholder="e.g., https://zoom.us/j/1234567890"
        />
      </div>

      <div>
        <Label htmlFor="max_students">Maximum Students (Optional)</Label>
        <Input
          id="max_students"
          type="number"
          value={max_students || ''}
          onChange={handleMaxStudentsChange}
          placeholder="e.g., 50"
        />
      </div>
      
      {/* Placeholder for Session Schedule - can be expanded later */}
      <div>
        <Label htmlFor="session_schedule">Session Schedule (e.g., Mon, Wed, Fri 7-9 PM)</Label>
        <Input
          id="session_schedule"
          placeholder="e.g., Every Monday, Wednesday, Friday from 7:00 PM to 9:00 PM"
          disabled // This is a placeholder, not directly mapped to DB yet
        />
        <p className="text-sm text-gray-500 mt-1">
          (Note: Detailed session scheduling will be integrated in a future update.)
        </p>
      </div>
    </div>
  );
}