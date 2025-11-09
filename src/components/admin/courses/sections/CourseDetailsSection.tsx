import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { MultiSelect } from '../../../ui/multi-select';
import { supabase } from '../../../../integrations/supabase/client'; // Updated import path
import { CourseRow } from '../../../../lib/database.types';
import { CourseFormData } from '../../../../pages/admin/AdminCourseFormPage'; // Import CourseFormData

interface CourseDetailsSectionProps {
  course_type: CourseRow['course_type'];
  category_ids: string[];
  difficulty_level: CourseRow['difficulty_level'];
  language: string;
  price: number;
  discount_price: number | null;
  duration: string | null;
  onFieldChange: (field: keyof CourseFormData | 'category_ids', value: any) => void; // Changed field type to keyof CourseFormData
}

interface Category {
  id: string;
  name: string;
}

export function CourseDetailsSection({
  course_type,
  category_ids,
  difficulty_level,
  language,
  price,
  discount_price,
  duration,
  onFieldChange,
}: CourseDetailsSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleTypeChange = useCallback((value: CourseRow['course_type']) => {
    onFieldChange('course_type', value);
  }, [onFieldChange]);

  const handleCategoryChange = useCallback((selected: string[]) => {
    onFieldChange('category_ids', selected);
  }, [onFieldChange]);

  const handleDifficultyChange = useCallback((value: CourseRow['difficulty_level']) => {
    onFieldChange('difficulty_level', value);
  }, [onFieldChange]);

  const handleLanguageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('language', e.target.value);
  }, [onFieldChange]);

  const handlePriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('price', Number(e.target.value));
  }, [onFieldChange]);

  const handleDiscountPriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('discount_price', e.target.value ? Number(e.target.value) : null);
  }, [onFieldChange]);

  const handleDurationChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('duration', e.target.value);
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Details</h2>

      <div>
        <Label htmlFor="course_type">Course Type <span className="text-red-500">*</span></Label>
        <Select value={course_type} onValueChange={handleTypeChange}>
          <SelectTrigger id="course_type">
            <SelectValue placeholder="Select course type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recorded">Recorded</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="category_ids">Categories <span className="text-red-500">*</span></Label>
        {loadingCategories ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          <MultiSelect
            options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
            selected={category_ids}
            onSelect={handleCategoryChange}
            placeholder="Select categories"
          />
        )}
      </div>

      <div>
        <Label htmlFor="difficulty_level">Difficulty Level</Label>
        <Select value={difficulty_level} onValueChange={handleDifficultyChange}>
          <SelectTrigger id="difficulty_level">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          value={language}
          onChange={handleLanguageChange}
          placeholder="e.g., English"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={handlePriceChange}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="discount_price">Discount Price</Label>
          <Input
            id="discount_price"
            type="number"
            value={discount_price || ''}
            onChange={handleDiscountPriceChange}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          value={duration || ''}
          onChange={handleDurationChange}
          placeholder={course_type === 'recorded' ? 'e.g., 10 hours' : 'e.g., 8 sessions'}
        />
      </div>
    </div>
  );
}