import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Button } from '../../../ui/button';
import { Plus, Upload, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { InstructorRow } from '../../../../lib/database.types';

interface InstructorSectionProps {
  instructor_id: string | null;
  instructor_name?: string;
  instructor_bio?: string;
  onFieldChange: (field: keyof any, value: any) => void;
}

interface InstructorOption {
  id: string;
  name: string;
}

export function InstructorSection({
  instructor_id,
  instructor_name,
  instructor_bio,
  onFieldChange,
}: InstructorSectionProps) {
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [showNewInstructorForm, setShowNewInstructorForm] = useState(false);
  const [newInstructorPhoto, setNewInstructorPhoto] = useState<File | null>(null);
  const [newInstructorPhotoUrl, setNewInstructorPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInstructors();
  }, []);

  useEffect(() => {
    if (instructor_id === 'new') {
      setShowNewInstructorForm(true);
    } else if (instructor_id) {
      setShowNewInstructorForm(false);
    }
  }, [instructor_id]);

  const loadInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleInstructorSelectChange = useCallback((value: string) => {
    if (value === 'new') {
      onFieldChange('instructor_id', 'new');
      setShowNewInstructorForm(true);
    } else {
      onFieldChange('instructor_id', value);
      setShowNewInstructorForm(false);
      // Clear new instructor form fields if an existing one is selected
      onFieldChange('instructor_name', '');
      onFieldChange('instructor_bio', '');
      onFieldChange('instructor_credentials', '');
      onFieldChange('instructor_photo', undefined);
      setNewInstructorPhoto(null);
      setNewInstructorPhotoUrl(null);
    }
  }, [onFieldChange]);

  const handleNewInstructorNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('instructor_name', e.target.value);
  }, [onFieldChange]);

  const handleNewInstructorBioChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onFieldChange('instructor_bio', e.target.value);
  }, [onFieldChange]);

  const handleNewInstructorCredentialsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('instructor_credentials', e.target.value);
  }, [onFieldChange]);

  const handleNewInstructorPhotoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewInstructorPhoto(file);
      setNewInstructorPhotoUrl(URL.createObjectURL(file));
      onFieldChange('instructor_photo', file);
    }
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>

      <div>
        <Label htmlFor="instructor_id">Select Existing Instructor</Label>
        {loadingInstructors ? (
          <p className="text-gray-500">Loading instructors...</p>
        ) : (
          <Select value={instructor_id || ''} onValueChange={handleInstructorSelectChange}>
            <SelectTrigger id="instructor_id">
              <SelectValue placeholder="Select an instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Add New Instructor</SelectItem>
              {instructors.map(inst => (
                <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {showNewInstructorForm && (
        <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Instructor</h3>
          <div>
            <Label htmlFor="new_instructor_name">Instructor Name <span className="text-red-500">*</span></Label>
            <Input
              id="new_instructor_name"
              value={instructor_name || ''}
              onChange={handleNewInstructorNameChange}
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="new_instructor_bio">Bio</Label>
            <Textarea
              id="new_instructor_bio"
              value={instructor_bio || ''}
              onChange={handleNewInstructorBioChange}
              placeholder="A short biography of the instructor"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="new_instructor_credentials">Credentials</Label>
            <Input
              id="new_instructor_credentials"
              onChange={handleNewInstructorCredentialsChange}
              placeholder="e.g., PhD in Computer Science"
            />
          </div>
          <div>
            <Label htmlFor="new_instructor_photo">Photo</Label>
            <Input
              id="new_instructor_photo"
              type="file"
              accept="image/*"
              onChange={handleNewInstructorPhotoUpload}
              className="hidden"
            />
            <Label
              htmlFor="new_instructor_photo"
              className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="h-5 w-5 mr-2" />
              {newInstructorPhotoUrl ? 'Change Photo' : 'Upload Photo'}
            </Label>
            {newInstructorPhotoUrl && (
              <div className="mt-2 relative w-32 h-32 rounded-full overflow-hidden">
                <img src={newInstructorPhotoUrl} alt="Instructor Photo Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setNewInstructorPhoto(null);
                    setNewInstructorPhotoUrl(null);
                    onFieldChange('instructor_photo', undefined);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}